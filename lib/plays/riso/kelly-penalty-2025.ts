/** Chloe Kelly's winning penalty — England 1–1 Spain (England won 3–1 on penalties), UEFA Women's Euro 2025 final, St. Jakob-Park,
 * Basel, Sunday 27 July 2025. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or
 * StoryFilmPlayer. A 1:1 reconstruction of the kick from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 * The SAME match as russo-final-2025.ts: its St. Jakob-Park, kits, Kelly (18, blonde ponytail) and Cata Coll are reused here as-is.
 *
 * SOURCES (read Sept 2026, fetched with curl, cached in scratchpad/films/src-cache/ and scratchpad/films/russo/):
 *  - Wikipedia, "UEFA Women's Euro 2025 final" (the shoot-out order and results: Mead retaken + saved by Coll, Guijarro scored, Greenwood
 *    scored "with a strong shot to the right", Caldentey saved by Hampton, Charles scored, Bonmatí saved, Williamson saved by Coll, Paralluelo
 *    wide, "Kelly ... successfully converted with a powerful shot"; 3–1; line-ups + numbers; kit boxes: England white shirts, blue shorts,
 *    white socks, Spain all red; referee Stéphanie Frappart (France); 34,203) https://en.wikipedia.org/wiki/UEFA_Women%27s_Euro_2025_final
 *  - The Guardian live blog, Sarah Rendell, "England 1-1 Spain (England win 3-1 on pens) – as it happened" (14.36: "Leah Williamson has won
 *    [the coin toss]. The shootout will happen in front of England fans"; 14.45: "If England score here they win the tournament. It's
 *    Kelly. Huge pressure on her shoulders and she scores"; Kelly to the BBC: "I was cool and composed, I knew I was going to hit the back of
 *    the net. I don't miss penalties twice") https://www.theguardian.com/football/live/2025/jul/27/england-v-spain-womens-euro-2025-final-live-score-updates
 *  - BBC Sport live page + match report, Emma Sanders (19:45 BST: "CHLOE KELLY YOU BEAUTY! Smashed high into the net. Unstoppable."; "she
 *    fired the ball past goalkeeper Cata Coll, then ran into the corner by the England fans to celebrate — her shirt not whirling around her
 *    head this time, but held tightly by her team-mates"; 19:47: "The rest of the team sprint to celebrate with Chloe Kelly"; Kelly on her
 *    routine: "I spin the ball until I feel like it's right ... It is just part of my routine just like my breath work is")
 *    https://www.bbc.co.uk/sport/football/live/c78n2p6yz3lt
 *  - The Guardian match report, Suzanne Wrack, "Chloe Kelly the hero again as England beat Spain in Euro 2025 final shootout"
 *    https://www.theguardian.com/football/2025/jul/27/chloe-kelly-winning-penalty-england-beat-spain-win-euro-2025
 *  - UEFA.com, "England 1-1 Spain (aet, 3-1 pens)" ("leaving Kelly to step up knowing a successful penalty would win the title for
 *    England ... she made no mistake with the decisive kick") https://www.uefa.com/womenseuro/news/029b-1e56a4b43051-3ec6381b01f6-1000/
 *  - The Guardian, player ratings ("a superb penalty to win it for England")
 * CONFIRMED by those accounts: the fifth kick of the shoot-out (England's fifth, at 2–1 after Paralluelo's miss), a successful kick wins
 *  the title; the shoot-out was taken at the end IN FRONT OF THE ENGLAND FANS; Kelly (18, a 41st-minute substitute) spins the ball before
 *  a penalty and uses breath work as part of her routine; the kick was powerful, "smashed HIGH into the net", "unstoppable", past Cata Coll
 *  (13); she then ran into the corner by the England fans and her team-mates sprinted to her and held her; England white shirts, blue shorts,
 *  white socks; Spain all red; referee Stéphanie Frappart; Sunday evening in Basel.
 * INFERRED (illustrative): which SIDE of the goal it went (drawn high to her LEFT, the keeper's right — no source read says; the narration
 *  never names the side); that she struck it with her RIGHT foot and the laces (not stated in these reports; never narrated); the ball's
 *  line and pace (≈ 11 m in .4 s, crossing the line ≈ 2.05 m up, 2.55 m from the middle); the run-up (≈ 4.3 m, from her left, ≈ 22°); the
 *  walk back and where her mark was; Coll's dive (to her right, too low to reach it) and her yellow kit; Frappart's navy kit and position;
 *  which corner she ran to (the main-stand side here) and the celebration poses; which team-mates reached her first; the halfway-line lines of
 *  players (arms linked) and who stood in them; Hannah Hampton is NOT drawn (her position/kit that day not verified); every hair colour and
 *  build; the camera positions; St. Jakob-Park's stands and crowd colours; the evening light (the same set as the Russo film).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME: the lines of players at halfway → Kelly at the
 * spot spinning the ball → the walk back, a breath → Coll on her line → the run, the strike → high into the net → she runs off; ch2 = the
 * slow-motion replay from a LOW pitchside camera in front of her, by the post (a yellow ring marks the spot she picked BEFORE the run, a ring
 * round her still head, a spark at contact, the riso trail into the top corner); ch3 = the reverse angle from BEHIND THE GOAL among the
 * England fans (the ball comes at the lens over Coll's hands) and then live pitchside: she races to the corner by the England fans and her
 * team-mates pile on; ch4 = the lesson: pressure (red crowd noise) → pick your spot early (a ring appears while she is still spinning the
 * ball — the noise fades) → stick to your routine (spin, footsteps back, a breath) → strike with conviction (the line into the ring).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down to
 * square (a narrower window widens the lens a little). Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous
 * silhouettes, FK skeleton, `prev` secondary motion so ponytails swing, motionSmear on the run, the strike and the sprints); women's builds
 * (1.60–1.80 m, slimmer bulk) with ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness:
 * the world is right-handed (x toward the goal, y up, +z = the kicker's right, the main-stand side), athlete.ts's own convention, so foot
 * 'r' is her RIGHT foot; the keeper faces −x, so HER right is −z — the side the ball goes. Inks: yellow, red, blue, navy (as Russo).
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,runCadence,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. LEAD: once
 * public/plays/narration/kelly-penalty-2025/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/kelly-penalty-2025/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The winning kick',text:"Basel, the 2025 Euro final. Penalties! Score this one, and England are champions. Chloe Kelly spins the ball. She breathes. Here's the run... smashed high into the net! England win!",tail:2.1,
  cues:['Basel','Penalties','Score this one','Chloe Kelly','spins the ball','She breathes',"Here's the run",'smashed high','England win']},
 {label:'Watch it again',text:'Watch it again, slowly. She picked her spot before the run. Head still, and she hits it hard. No doubt!',tail:1.4,
  cues:['Watch it again','picked her spot','before the run','Head still','hits it hard','No doubt']},
 {label:'To the fans',text:'From behind the goal: too high for the keeper! Kelly races to the England fans, and her teammates pile on.',tail:2,
  cues:['From behind','too high','Kelly races','England fans','teammates pile on']},
 {label:'The secret',text:'The secret? Under pressure, pick your spot early. Stick to your routine, then strike with conviction.',tail:2,
  cues:['The secret','Under pressure','pick your spot','Stick to your routine','strike with conviction']},
];
import timingJson from '../../../public/plays/narration/kelly-penalty-2025/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings): .2 s + .02 s a letter, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('kelly: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kelly: no cue '+w);return c.at;};
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
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line of the shoot-out end is x = 0 (the kick goes +x), goal centre z = 0, +z = the kicker's right (the main-stand side). */
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

// ---------------------------------------------------------------- St. Jakob-Park (the Russo film's set): a summer evening, a steep box of red seats under a roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind this goal (the England end), 2 the main stand (z>0), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+24*b,-40-28*b],
 (a,b)=>[7+26*b,1.3+22*b,lerp(-54,54,a)],
 (a,b)=>[lerp(12,-116,a),1.3+20*b,40+24*b],
 (a,b)=>[-111-26*b,1.3+22*b,lerp(54,-54,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=14,WALKS=[[.46],[.5],[.5],[.5]];
/** flags on the stand fronts: [stand, a, kind 0 = St George, 1 = Spain] — the shoot-out end (stand 1) is the England end */
const FLAGS:[number,number,number][]=[[0,.5,0],[0,.62,1],[0,.74,0],[0,.86,0],[1,.14,0],[1,.3,0],[1,.46,0],[1,.62,0],[1,.8,0],[2,.1,0],[2,.24,1],[3,.3,1],[3,.62,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(B,.15,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.2);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.82),[0,8.5,0]),add3(S(0,.82),[0,8.5,0])]));
  seg3(c,add3(S(0,.82),[0,8.3,0]),add3(S(1,.82),[0,8.3,0]),.4,edge);}
 s.knockout(planes);s.tone(R,planes,.55);s.tone(K,planes,.22);s.knockout(walk,.85);
 // the crowd: England white and red (the whole end behind this goal), Spain red and yellow, some navy; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],eng=si===1;for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=eng?(h<.72?0:h<.93?1:3):(h<.6?0:h<.84?1:h<.94?2:3);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(Y,inks[2],.95);s.fill(K,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.8);
 const fl=new Path2D(),cr=new Path2D(),es=new Path2D(),band=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.075),P(.43,.075)]));addPoly(cr,polyP(c,[P(0,.034),P(1,.034),P(1,.046),P(0,.046)]));}
  else{es.addPath(polyPath(q,true));addPoly(band,polyP(c,[P(0,.023),P(1,.023),P(1,.057),P(0,.057)]));}}
 s.knockout(fl);s.fill(R,cr,.95);s.knockout(es);s.fill(R,es,.95);s.fill(Y,band,.95);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.82),[0,7.6,0]),b=add3(S(u+.03,.82),[0,7.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.9,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
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
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 // the penalty spot
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}

// ---------------------------------------------------------------- the kick on one clock τ (seconds; τ = 0 is the contact)
/** the ball on the spot, 11 m out */
const B0:V3=[-11,.11,0];
/** where it crosses the line: HIGH, to her left (the keeper's right) — "smashed high into the net" (the side is inferred) */
const GOAL_PT:V3=[0,2.05,-2.55];
/** ≈ 11 m in .4 s: a laces strike, ≈ 27 m/s */
const FLY=.4;
const VY=(GOAL_PT[1]-B0[1]+4.9*FLY*FLY)/FLY;
function flight(u:number):V3{const tt=u*FLY,e=u*(1.06-.06*u);return[lerp(B0[0],GOAL_PT[0],e),B0[1]+VY*tt-4.9*tt*tt,lerp(B0[2],GOAL_PT[2],e)];}
/** the goal at x = 0: the top of the net bulges out where it hits (z BZ) */
const BZ=GOAL_PT[2],NET_HIT:V3=[1.72,1.78,-2.45],REST:V3=[1.35,.11,-2.2],IN_NET=FLY+.1;
/** the ball; `held` = where it sits in her hands while she spins it (pre-kick), null once it is on the spot */
function ballAt(tau:number,held:V3|null=null):V3{
 if(held)return held;
 if(tau<=0)return B0;
 if(tau<FLY)return flight(tau/FLY);
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.5),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.5)*9))*Math.exp(-(tau-IN_NET-.5)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:TAU*6*Math.min(tau,IN_NET)+TAU*1.4*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:1.05*Math.exp(-(tau-IN_NET+.03)*2.6)*(1+.3*Math.sin((tau-IN_NET)*13));
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-BZ)/1.5,2))*(.35+.65*y/1.9);
 const zs=[z0,-2.5,-1.2,0,1.2,2.5,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (the Russo film's styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[B,.95],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const spain=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:[Y,.95],numberInk:[Y,.95],hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const KELLY_B=W_BUILD(1.7);
const KELLY_ST=england({number:18,hair:[Y,.95],build:KELLY_B,seed:18});
const COLL_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:13,numberInk:K,build:W_BUILD(1.7,.94),seed:13};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:Y,hairStyle:'ponytail',build:W_BUILD(1.7,.9),seed:30};

// ---------------------------------------------------------------- Kelly: spin the ball, place it, walk back, breathe, the run, the RIGHT-footed strike, the sprint to the fans
/** a run-up from her LEFT (≈ 22°); the body swings to the target through the plant */
const A_RUN=22*Math.PI/180,DIR:[number,number]=[Math.cos(A_RUN),Math.sin(A_RUN)];
const YAW_RUN=yawTo(0,0,DIR[0],DIR[1]),YAW_K=yawTo(B0[0],B0[2],GOAL_PT[0],GOAL_PT[2]);
const KD:[number,number]=(()=>{const dx=GOAL_PT[0]-B0[0],dz=GOAL_PT[2]-B0[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
const SD=.85,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.3,RUN_L=3.0,STRIKE_L=1.3,G_MARK=-(RUN_L+STRIKE_L);
/** where her pelvis stands at contact so the laces of her RIGHT boot meet the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:1}),KELLY_B,{x:0,z:0,yaw:YAW_K}),mid:[number,number]=[lerp(sk.rToe[0],sk.rAn[0],.35),lerp(sk.rToe[2],sk.rAn[2],.35)],tgt:[number,number]=[B0[0]-KD[0]*.12,B0[2]-KD[1]*.12];return[tgt[0]-mid[0],tgt[1]-mid[1]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];
/** crouched behind the ball on the spot, both hands on it — she spins it until it feels right */
const P_SPIN=posed({lHipF:100,rHipF:30,lKnee:140,rKnee:120,lAnk:-24,rAnk:30,lean:46,pitch:16,neckP:34,lShF:84,rShF:84,lShA:12,rShA:12,lElb:14,rElb:14,lHand:.9,rHand:.9});
/** at her mark: arms loose, weight on the balls of her feet, eyes on the ball */
const P_WAIT=posed({lHipF:6,rHipF:14,lKnee:14,rKnee:18,lAnk:-4,rAnk:-4,lean:10,pitch:3,neckP:14,lShA:16,rShA:16,lShF:-6,rShF:-4,lElb:26,rElb:24});
const P_GO=posed({lHipF:-16,rHipF:26,lKnee:24,rKnee:34,lAnk:16,rAnk:-6,lean:16,pitch:5,neckP:18,lShA:22,rShA:20,lShF:-14,rShF:16,lElb:40,rElb:46,twist:-8});
/** the breath: chest up, shoulders rise, chin lifts */
const P_BREATH=posed({lean:-4,pitch:-2,neckP:-12,lShA:24,rShA:24,lShF:-2,rShF:-2,lElb:22,rElb:22,lHipF:6,rHipF:12,lKnee:10,rKnee:14,squash:.04});
/** at the corner: fists clenched, arms wide, a roar to the England end */
const P_ROAR=posed({lShA:96,rShA:96,lShF:14,rShF:14,lElb:62,rElb:62,lShR:-40,rShR:-40,lHand:0,rHand:0,lean:-14,pitch:-3,neckP:-28,lHipF:16,rHipF:-2,lKnee:22,rKnee:12,lHipA:8,rHipA:8,squash:.03});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.2);p.air=0;return p;};
/** pre-kick (τ ≤ T_RUN0): u = 0..1 — spin (0–.36), place (.36–.44), stand + turn away (.44–.52), walk back (.52–.86), turn to the ball (.86–1) */
/** her pelvis while she spins it: solved so the midpoint of her hands sits over the spot */
const SPIN_AT:[number,number]=(()=>{const sk=solve(P_SPIN,KELLY_B,{x:0,z:0,yaw:YAW_K}),h=mix3(sk.lHa,sk.rHa,.5);return[B0[0]-h[0],B0[2]-h[2]];})(),MARK=gPos(G_MARK);
function prePose(u:number,it:number,breath:number):Pose{
 let p:Pose;
 if(u<.36){p=blendPose(P_SPIN,P_SPIN,0);const w=Math.sin(it*TAU*2.2);p.lShR+=.12*w;p.rShR-=.12*w;p.twist+=.04*w;}
 else if(u<.44)p=P_SPIN;
 else if(u<.52)p=blendPose(P_SPIN,stand(),sm(.44,.52,u));
 else if(u<.86){const d=Math.hypot(MARK[0]-SPIN_AT[0],MARK[1]-SPIN_AT[1])*sm(.52,.86,u,linear);p=walkPose(d*.78);}
 else p=blendPose(walkPose(0),P_WAIT,sm(.86,.96,u));
 if(breath>0)p=blendPose(p,P_BREATH,breath*(u>.5?1:.6));
 return p;
}
function prePlace(u:number):Place{
 if(u<.44)return{x:SPIN_AT[0],z:SPIN_AT[1],yaw:YAW_K};
 const away=yawTo(SPIN_AT[0],SPIN_AT[1],MARK[0],MARK[1]);
 if(u<.52)return{x:SPIN_AT[0],z:SPIN_AT[1],yaw:lerpAng(YAW_K,away,sm(.45,.52,u,easeInOutSine))};
 if(u<.86){const e=sm(.52,.86,u,linear);return{x:lerp(SPIN_AT[0],MARK[0],e),z:lerp(SPIN_AT[1],MARK[1],e),yaw:away};}
 return{x:MARK[0],z:MARK[1],yaw:lerpAng(away,YAW_RUN,sm(.86,.98,u,easeInOutSine))};
}
/** the celebration: off toward the corner by the England fans (main-stand side — the corner is inferred) */
const CEL:[number,number]=[-3.4,29.6],T_TURN=.5,ARR_SPEED=7.2;
const C0=gPos(.6),CEL_L=Math.hypot(CEL[0]-C0[0],CEL[1]-C0[1]),T_ARR=T_TURN+.25+CEL_L/ARR_SPEED;
const CEL_YAW=yawTo(CEL[0],CEL[1],14,40);
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function runG(tau:number){const u=runU(tau);return G_MARK+RUN_L*(1.15*u-.15*u*u);}
function kellyPose(tau:number,pre:number,it:number,breath=0):Pose{
 if(tau<=T_RUN0){
  if(pre<1)return prePose(pre,it,breath);
  const br=.5+.5*Math.sin(it*2.1);let p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.35,T_RUN0,tau));p.lean+=.02*br;if(breath>0)p=blendPose(p,P_BREATH,breath);return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(1.62*Math.pow(u,.92),{speed:.62+.2*u}),sm(0,.22,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(1.62+(tau-RUN_END)*1.5,{speed:.7});
 let p=blendPose(run,strike(Math.min(1,us),{foot:'r',power:1}),sm(RUN_END,RUN_END+.12,tau));
 // the sprint to the fans, then the roar
 if(tau>T_TURN){const ph=(tau-T_TURN)*runCadence(1),u=clamp((tau-T_TURN-.25)*ARR_SPEED/CEL_L);
  p=blendPose(p,runCycle(ph,{speed:1-.45*sm(.8,1,u)}),sm(T_TURN,T_TURN+.3,tau));
  p=blendPose(p,P_ROAR,sm(T_ARR-.35,T_ARR+.2,tau));
  if(tau>T_ARR+.2){const b=Math.sin((tau-T_ARR)*3);p.neckP+=.05*b;p.lShA+=.05*b;p.rShA+=.05*b;}}
 return p;
}
function kellyPlace(tau:number,pre:number):Place{
 if(tau<=T_RUN0){if(pre<1)return prePlace(pre);return{x:MARK[0],z:MARK[1],yaw:YAW_RUN};}
 let g:number;
 if(tau<RUN_END)g=runG(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.6*(1-Math.pow(1-clamp(tau/.55),2));
 let[x,z]=gPos(g);
 const yaw0=lerpAng(YAW_RUN,YAW_K,sm(RUN_END-.1,RUN_END+.12,tau));
 if(tau>T_TURN){const u=clamp((tau-T_TURN-.25)*ARR_SPEED/CEL_L),e=u<1?u*(1.25-.25*u):1;x=lerp(C0[0],CEL[0],clamp(e));z=lerp(C0[1],CEL[1],clamp(e));
  const run=yawTo(C0[0],C0[1],CEL[0],CEL[1]);return{x,z,yaw:lerpAng(lerpAng(yaw0,run,sm(T_TURN,T_TURN+.35,tau,easeInOutSine)),CEL_YAW,sm(T_ARR-.4,T_ARR+.3,tau,easeInOutSine))};}
 return{x,z,yaw:yaw0};
}
/** while she spins it the ball sits between her hands (read off the skeleton); from the place phase on it is on the spot */
function heldBall(pre:number):V3|null{
 if(pre>=.44)return null;
 const hb:V3=[B0[0],.2,B0[2]];
 return pre<.36?hb:mix3(hb,B0,sm(.36,.43,pre));
}

// ---------------------------------------------------------------- Coll: set on her line, a dive to her right, too low for a ball smashed high
const COLL_X=-.2;
function collAt(tau:number,it:number):{pose:Pose;place:Place}{
 let p=keeperSet(it*1.25);
 // on her line she sways side to side, arms wide
 const sway=Math.sin(it*1.7)*(1-sm(-.6,-.1,tau));p.dz+=.12*sway;p.lShA+=.2*(1-sm(-.6,-.1,tau));p.rShA+=.2*(1-sm(-.6,-.1,tau));
 if(tau>-.08){const u=clamp((tau+.08)/1.05);p=blendPose(p,keeperDive(u,{side:'r',height:.42}),sm(-.08,.06,tau));}
 if(tau>1.6)p=blendPose(p,posed({lHipF:70,rHipF:60,lKnee:110,rKnee:96,lean:40,neckP:36,lShA:20,rShA:20,lShF:30,rShF:30,lElb:40,rElb:40}),sm(1.6,2.4,tau)*.8);
 return{pose:p,place:{x:COLL_X,z:0,yaw:Math.PI}};
}

// ---------------------------------------------------------------- everyone else: the referee, the two lines of players at halfway
type Role='ref'|'eng'|'esp';
/** runTo: an England team-mate who sprints to Kelly [start τ, arrival offset from CEL, speed m/s] */
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number;runTo?:[number,number,number,number]};
const LOW=(o:Partial<AthleteStyle>)=>({detail:'low' as const,...o});
const ACTORS:Actor[]=[
 {name:'Frappart',role:'ref',st:REF_ST,x:-6.4,z:-9.8,phase:.6},
 // England, arms linked on the halfway line (the four who had taken theirs and the rest; order inferred)
 {name:'Charles',role:'eng',st:england(LOW({number:3,hair:[Y,.7],build:W_BUILD(1.66),seed:3})),x:-52.2,z:-1.6,phase:.1,runTo:[.25,-1.3,-1.1,8.2]},
 {name:'Williamson',role:'eng',st:england(LOW({number:6,hair:[K,.7],build:W_BUILD(1.73,.92),seed:6})),x:-52.2,z:-.8,phase:.3,runTo:[.3,1.1,-.8,8]},
 {name:'Carter',role:'eng',st:england(LOW({number:16,skin:SKIN_M,hair:K,hairStyle:'curly',build:W_BUILD(1.69,.94),seed:16})),x:-52.2,z:0,phase:.5,runTo:[.3,-.4,1.3,8.4]},
 {name:'Greenwood',role:'eng',st:england(LOW({number:5,hair:[Y,.85],build:W_BUILD(1.66),seed:5})),x:-52.2,z:.8,phase:.7,runTo:[.25,.9,1.1,8.3]},
 {name:'Walsh',role:'eng',st:england(LOW({number:4,hair:[Y,.8],build:W_BUILD(1.67),seed:4})),x:-52.2,z:1.6,phase:.9,runTo:[.35,-1.8,.4,7.9]},
 {name:'Mead',role:'eng',st:england(LOW({number:9,hair:[Y,.9],build:W_BUILD(1.64),seed:9})),x:-52.2,z:2.4,phase:.15,runTo:[.35,1.9,.1,7.8]},
 {name:'Hemp',role:'eng',st:england(LOW({number:11,hair:[K,.6],build:W_BUILD(1.64),seed:11})),x:-52.2,z:3.2,phase:.45,runTo:[.3,.2,-1.9,8.5]},
 // Spain, arms linked beside them
 {name:'Batlle',role:'esp',st:spain(LOW({number:2,skin:SKIN_M,build:W_BUILD(1.64),seed:41})),x:-52.8,z:-5.4,phase:.6},
 {name:'Paredes',role:'esp',st:spain(LOW({number:4,build:W_BUILD(1.73,.95),seed:40})),x:-52.8,z:-4.6,phase:.2},
 {name:'Bonmati',role:'esp',st:spain(LOW({number:6,build:W_BUILD(1.61,.9),seed:42})),x:-52.8,z:-3.8,phase:.8},
 {name:'Guijarro',role:'esp',st:spain(LOW({number:12,build:W_BUILD(1.64),seed:43})),x:-52.8,z:-3,phase:.35},
 {name:'Aleixandri',role:'esp',st:spain(LOW({number:14,build:W_BUILD(1.73,.93),seed:14})),x:-52.8,z:-6.2,phase:.55},
];
const P_LINK=posed({lShA:52,rShA:52,lShF:-22,rShF:-22,lElb:40,rElb:40,lShR:20,rShR:20,lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:8,neckP:6});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** team-mates reaching her: arms round her (a hug) */
const P_HUG=posed({lShF:84,rShF:84,lShA:40,rShA:40,lElb:70,rElb:70,lShR:-30,rShR:-30,lean:18,pitch:4,neckP:10,lHipF:18,rHipF:10,lKnee:22,rKnee:18});
type Env={it:number;pre:number;breath?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number;crowd?:boolean};
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const br=Math.sin(it*2.1+a.phase*TAU),goal=sm(IN_NET-.1,IN_NET+.3,tau),ahead=yawTo(a.x,a.z,-11,0);
 if(a.role==='ref'){let p=blendPose(stand(),posed({lShA:16,rShA:16,lElb:24,rElb:24,neckP:4}),.5);
  if(goal>0)p=blendPose(p,posed({lShA:18,rShA:18,lElb:20,rElb:20,neckP:-6,neckY:30}),goal);
  return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-11,0)}};}
 if(a.role==='esp'){let p=blendPose(P_LINK,stand(),.1+.05*br);if(goal>0)p=blendPose(p,SLUMP,goal*.9);return{pose:p,place:{x:a.x,z:a.z,yaw:ahead}};}
 // England: arms linked, up on their toes; then everyone sprints to her
 let p=blendPose(P_LINK,posed({lHipF:14,rHipF:14,lKnee:22,rKnee:22,lAnk:20,rAnk:20,lShA:52,rShA:52,lShF:-22,rShF:-22,lElb:40,rElb:40,lean:10}),.5+.3*br);
 if(goal>0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),goal);
 if(a.runTo){const[t0,ox,oz,v]=a.runTo,dest:[number,number]=[CEL[0]+ox,CEL[1]+oz],L=Math.hypot(dest[0]-a.x,dest[1]-a.z),T=L/v,u=clamp((tau-t0)/T);
  if(tau>t0){const ph=(tau-t0)*runCadence(1)+a.phase;p=blendPose(p,runCycle(ph,{speed:1-.4*sm(.85,1,u)}),sm(t0,t0+.25,tau));
   if(u>=1)p=blendPose(p,P_HUG,sm(t0+T,t0+T+.35,tau));
   const e2=u<1?u*(1.1-.1*u):1,x=lerp(a.x,dest[0],e2),z=lerp(a.z,dest[1],e2);
   return{pose:p,place:{x,z,yaw:u<1?yawTo(a.x,a.z,dest[0],dest[1]):yawTo(x,z,CEL[0],CEL[1])}};}}
 return{pose:p,place:{x:a.x,z:a.z,yaw:ahead}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the run-up, the strike, the sprints). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number;held?:V3|null;spin?:number}={}){
 const P=ballAt(tau,o.held??null),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau)+(o.spin??0),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(!hero)return{...st,detail:px>200?'mid':'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return{...st,detail:'auto'};};
 const pre=e.pre,prePrev=e.pre;// the pre-kick clock is sampled once per frame (its motion is slow)
 {const pl=kellyPlace(tp,pre),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=kellyPose(tp,pre,e.it,e.breath),prev={pose:kellyPose(tpPrev,prePrev,e.it-1/12,e.breath),place:kellyPlace(tpPrev,prePrev)};
  drawPlayer(s,pose,c,detailFor(KELLY_ST,d,true),pl,prev,!!e.smear&&((tp>T_RUN0+.2&&tp<.35)||(tp>T_TURN+.1&&tp<T_ARR-.2)));}});}
 {const cur=collAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=collAt(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(COLL_ST,d,true),cur.place,prev,!!e.smear&&tp>0&&tp<.8);}});}
 for(const a of ACTORS){if(e.crowd===false&&a.role!=='ref')continue;const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev,!!e.smear&&!!a.runTo&&tp>a.runTo[0]&&d<30);}});}
 const held=tau<=T_RUN0?heldBall(pre):null,bq=toCam(c,ballAt(tau,held));
 if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT,held,spin:held?e.it*TAU*1.6:0});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const kxz=(tau:number,pre=1):V3=>{const p=kellyPlace(tau,pre);return[p.x??0,0,p.z??0];};
/** a ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number,wk=.035){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*Math.min(1,u)),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*wk),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*Math.min(1,u));s.fill(ink,rr,.95*Math.min(1,u));}
/** the spot she picked: just under the bar, inside her left-hand post */
const SPOT:V3=[.02,GOAL_PT[1],GOAL_PT[2]];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** contact lands just before "smashed high"; the run starts no earlier than "Here's the run" */
const tS1=()=>Math.max(CUE(0,'smashed')+.05,CUE(0,"Here's")+(-T_RUN0)+.1);
const tau1=(t:number)=>Math.max(T_RUN0-9,t-tS1());
/** the pre-kick routine: spin from "Chloe Kelly", place it, walk back through "She breathes", set before the run */
const pre1=(t:number)=>{const k=CUE(0,'Chloe'),sp=CUE(0,'spins'),b=CUE(0,'She breathes'),r=tS1()+T_RUN0;
 return key(t,mono([[k-.4,0],[sp+.9,.36],[sp+1.2,.46],[Math.min(b+1,r-.5),.9],[r-.2,1]]),linear);};
const breath1=(t:number)=>{const b=CUE(0,'She breathes');return sm(b-.1,b+.35,t)*(1-sm(b+.9,b+1.4,t));};
const P1:V3=[-30,18,50];
function cam1(t:number):Cam{
 const tau=tau1(t),tN=tS1()+IN_NET;
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,0,-6],fov:34})],
  [CUE(0,'Penalties')-.1,1.3,()=>({P:P1,T:[-52,1,-1.5],fov:9})],
  [CUE(0,'Score')-.2,1.3,()=>({P:P1,T:[-5,1,-.6],fov:19})],
  [CUE(0,'Chloe')-.3,1,()=>({P:P1,T:add3(kxz(T_RUN0-1,pre1(t)),[1.2,.8,0]),fov:5.6})],
  [CUE(0,'She breathes')-.3,1,()=>({P:P1,T:add3(kxz(T_RUN0-1,pre1(t)),[1.6,1,-.3]),fov:6.4})],
  [CUE(0,"Here's")-.35,.9,()=>({P:P1,T:[-5.8,1.1,-.8],fov:14})],
  [tN-.15,.7,()=>({P:P1,T:[-.8,1.3,-1.4],fov:9.5})],
  [tN+.9,1.5,()=>({P:P1,T:add3(kxz(tau),[0,1,0]),fov:14})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+IN_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN-.1,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,pre:pre1(tt),breath:breath1(tt),minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
  // "England win!": a yellow burst over the England end
  const tW=CUE(0,'England win'),wn=sm(tW-.1,tW+.4,t);if(wn>0){const q=pr(c,[1.5,2.8,-1]);if(q)sparkBurst(s,Y,q[0],q[1],90+120*wn,{n:11,seed:9,g:easeOutBack(wn),width:12,cov:.95*(1-sm(tW+1.6,tW+2.4,t))});}
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:12,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, LOW pitchside by the post, in front of her: the spot picked, head still, hits it hard
const tau2=(t:number)=>key(t,mono([[0,T_RUN0-.7],[CUE(1,'picked her spot'),T_RUN0-.35],[CUE(1,'before the run'),T_RUN0+.05],[CUE(1,'Head still'),RUN_END+.02],[CUE(1,'hits it hard')+.1,.02],[CUE(1,'No doubt'),FLY-.02],[SECS(1),IN_NET+.7]]),linear);
const E2:V3=[-3.4,1.05,7.6];
function cam2(t:number):Cam{
 const tau=tau2(t),k=add3(kxz(Math.min(tau,.2)),[0,1,0]),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(k,[-4,1.4,-1.6],.12),fov:13})],
  [CUE(1,'picked her spot')-.2,1,()=>({P:E2,T:mix3(k,B0,.4),fov:19})],
  [CUE(1,'Head still')-.35,1,()=>({P:add3(E2,[-1.2,-.2,-1.2]),T:mix3(k,B0,.35),fov:20})],
  [CUE(1,'hits it hard')+.1,.7,()=>({P:add3(E2,[-1.2,-.1,-1.2]),T:mix3(b,[-2,1.5,-1.6],.4),fov:24})],
  [CUE(1,'No doubt')-.2,1,()=>({P:add3(E2,[-.6,.2,-.6]),T:[-.6,1.6,-2],fov:24})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tP=CUE(1,'picked her spot'),tH=CUE(1,'Head still'),tK=CUE(1,'hits it hard');
  stadium(s,c,t,[0,1,3],{roar:sm(IN_NET,IN_NET+.4,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the spot she had already picked: a yellow ring in the top corner, there before she moves
  const ring=sm(tP-.1,tP+.5,t,easeOutBack)*(1-sm(IN_NET+.1,IN_NET+.6,tau));
  if(ring>.02)ring3(s,c,SPOT,.48,ring,Y,11,.09);
  // the replay trail: the rising line so far, fading at the tail
  if(tau>.02&&tau<IN_NET+.6){const pts=pathPts(c,Math.max(0,tau-.4),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.6,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,pre:1,smear:true,minBall:12,crowd:false,lines:true,prevT:tau2(t-.06)});
  // head still: a red ring round her head through the strike
  const hs=sm(tH-.1,tH+.35,t,easeOutBack)*(1-sm(tK+.5,tK+1,t));if(hs>.02){const sk=solve(kellyPose(tp,1,tt),KELLY_B,kellyPlace(tp,1));ring3(s,c,sk.head,.24,hs,R,31);}
  // hits it hard: a spark on the laces at contact
  const hit=sm(-.03,.03,tau)*(1-sm(.1,.3,tau));if(hit>0){const q=pr(c,B0);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,B0)*.7)*hit,{n:9,seed:23,width:Math.max(6,kAt(c,B0)*.05)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/q[2]*1.3),12);},
 still:6.4,
};

// ---------------------------------------------------------------- 3 · behind the goal among the England fans (the ball over Coll's hands), then live pitchside: she races to the fans
const tau3=(t:number)=>{const h=CUE(2,'too high'),r=CUE(2,'Kelly races'),f=CUE(2,'England fans'),m=CUE(2,'teammates');
 return key(t,mono([[0,-.3],[h+.15,.34],[h+.9,IN_NET+.25],[r-.15,T_TURN+.35],[f,T_ARR-.2],[m,T_ARR+1.4],[SECS(2),T_ARR+1.4+(SECS(2)-m)*1.5]]),linear);};
const E3:V3=[5.4,2.3,-1.6];
const CELV:V3=[CEL[0],1.2,CEL[1]];
function cam3v(t:number):Cam{
 const tau=tau3(t),k=add3(kxz(tau),[0,1.1,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-9,1.2,.2],fov:19})],
  [CUE(2,'too high')-.2,.7,()=>({P:E3,T:[-2.5,1.5,-1.4],fov:30})],
  [CUE(2,'Kelly races')-.25,.8,()=>({P:[-13,1.9,33.5],T:k,fov:30})],
  [CUE(2,'England fans')-.3,1,()=>({P:[-13,1.9,33.5],T:mix3(k,add3(CELV,[4,1.5,0]),.4),fov:26})],
  [CUE(2,'teammates')-.2,1.2,()=>({P:[-12.5,2.2,33.2],T:add3(CELV,[.4,.3,0]),fov:17})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tR=CUE(2,'Kelly races'),tF=CUE(2,'England fans'),tM=CUE(2,'teammates');
  const out=sm(tR-.25,tR+.3,t);
  stadium(s,c,t,out<.5?[3,0,2]:[1,2,0],{roar:.4+.6*sm(IN_NET,IN_NET+.4,tau),flash:sm(tF-.2,tF+.3,t)*.7+.3*sm(tM,tM+.4,t)});
  ground(s,c,{goal:out>=.5,bulge:bulgeAt(tau)});
  // behind the net: the frame and mesh are nearer than the play until the camera goes pitchside
  if(out<.5){// the ball's rising line so far, a yellow replay trail coming at the lens
   if(tau>0&&tau<IN_NET+.6){const pts=pathPts(c,Math.max(0,tau-.35),Math.min(tau,FLY),16),fade=1-sm(FLY,IN_NET+.6,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}}
  play(s,c,tau,tp,tpp,{it:tt,pre:1,smear:true,minBall:12,only:out<.5?30:70});
  if(out<.5)goal3(s,c,bulgeAt(tau));
  // "too high for the keeper": a red tick above her fingertips — the gap between glove and ball
  const th=sm(CUE(2,'too high'),CUE(2,'too high')+.3,t)*(1-sm(CUE(2,'too high')+1.1,CUE(2,'too high')+1.5,t));
  if(th>.02&&out<.5)ring3(s,c,[-.2,2.1,-2.45],.3,th,R,17);
  // her team-mates pile on: a yellow burst over the huddle
  const pz=sm(tM-.05,tM+.4,t);if(pz>0){const q=pr(c,[CEL[0],2.5,CEL[1]]);if(q)sparkBurst(s,Y,q[0],q[1],100+150*pz,{n:12,seed:15,g:easeOutBack(pz),width:12,cov:.9});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(kxz(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:4.5,
};

// ---------------------------------------------------------------- 4 · the lesson: pressure → pick your spot early → stick to your routine → strike with conviction
const clock4=(t:number)=>{const p=CUE(3,'pick your spot'),r=CUE(3,'Stick'),k=CUE(3,'strike'),run=Math.max(r+1.7,k-.9);
 const pre=key(t,mono([[0,.04],[p+.8,.3],[r,.36],[r+.35,.46],[run-.35,.97],[run-.15,1]]),linear);
 const tau=key(t,mono([[0,T_RUN0-.8],[run-.1,T_RUN0],[run+Math.abs(T_RUN0),0],[run+Math.abs(T_RUN0)+.9,IN_NET+.4],[SECS(3),IN_NET+.4+(SECS(3)-run-Math.abs(T_RUN0)-.9)*.6]]),linear);
 return{pre,tau};};
function cam4v(t:number):Cam{
 const sp:V3=[SPIN_AT[0],0,SPIN_AT[1]],mk:V3=[MARK[0],0,MARK[1]];
 return plan(t,[
  [0,0,()=>({P:add3(sp,[-3.6,1.25,2.6]),T:mix3(add3(sp,[0,.8,0]),[0,1.4,-1.6],.42),fov:34})],
  [CUE(3,'pick your spot')-.2,1.1,()=>({P:add3(sp,[-4.6,1.35,1.4]),T:mix3(add3(sp,[0,.8,0]),SPOT,.55),fov:30})],
  [CUE(3,'Stick')-.2,1.1,()=>({P:add3(mk,[1.2,1.7,8.6]),T:mix3(add3(mk,[0,.9,0]),add3(sp,[0,.6,0]),.45),fov:32})],
  [CUE(3,'strike')-.6,1.1,()=>({P:[-19.5,2.8,-5.2],T:[-8,1.1,-1.4],fov:38})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),{tau,pre}=clock4(t),tt=twos(t),cl=clock4(tt),clp=clock4(tt-1/12);
  const tU=CUE(3,'Under pressure'),tP=CUE(3,'pick your spot'),tR=CUE(3,'Stick'),tS=CUE(3,'strike');
  stadium(s,c,t,[0,1,3],{roar:.35*sm(tU-.1,tU+.3,t)*(1-sm(tP,tP+.6,t))+.8*sm(tS+.6,tS+1,t),flash:sm(tS+.7,tS+1,t)*.6});
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · pressure: red crowd "noise" spikes all round the frame…
  const nz=sm(tU-.1,tU+.3,t)*(1-sm(tP+.1,tP+.8,t));
  if(nz>.02){const v=view(s),r=rng(77);for(let i=0;i<7;i++){const a=i/7*TAU+.4+r()*.3,x=Math.cos(a)*v.hx*.62,y=Math.sin(a)*v.hy*.55;sparkBurst(s,R,x,y,(70+40*r())*nz*(.85+.15*Math.sin(tt*14+i)),{n:7,seed:40+i,width:9,cov:.9*nz});}}
  // 2 · …fade as she picks her spot EARLY — the ring appears while she is still spinning the ball
  const pick=sm(tP-.05,tP+.45,t,easeOutBack);
  if(pick>.02)ring3(s,c,SPOT,.5,pick*(1-sm(IN_NET+.2,IN_NET+.7,tau)),Y,11,.09);
  // 3 · stick to your routine: the spin (a curled arrow round the ball), the steps back (yellow footprints), the breath (a soft ring)
  const rt=sm(tR-.1,tR+.3,t)*(1-sm(tS-.2,tS+.2,t));
  if(rt>.02){
   const bq=pr(c,B0);if(bq){const k=kAt(c,B0),rr=Math.max(26,k*.34),arc:Pt[]=[];for(let i=0;i<=16;i++){const a=-.4+i/16*TAU*.78;arc.push([bq[0]+Math.cos(a)*rr,bq[1]-k*.12+Math.sin(a)*rr*.55]);}
    const pa=ribbon(arc,Math.max(5,k*.03),{taper:.1,wobble:.6,seed:5}),e=arc[arc.length-1],f=arc[arc.length-3],an=Math.atan2(e[1]-f[1],e[0]-f[0]),hd=Math.max(12,k*.07);
    pa.addPath(polyPath([[e[0]+Math.cos(an)*hd*.6,e[1]+Math.sin(an)*hd*.6],[e[0]-Math.cos(an)*hd+Math.sin(an)*hd*.6,e[1]-Math.sin(an)*hd-Math.cos(an)*hd*.6],[e[0]-Math.cos(an)*hd-Math.sin(an)*hd*.6,e[1]-Math.sin(an)*hd+Math.cos(an)*hd*.6]],true));
    s.knockout(pa,.9*rt);s.fill(Y,pa,.95*rt);}
   const n=Math.floor(7*clamp((pre-.5)/.36)),fp=new Path2D();for(let i=0;i<n;i++){const u=(i+.5)/7,x=lerp(SPIN_AT[0],MARK[0],u),z=lerp(SPIN_AT[1],MARK[1],u),side=i%2?.13:-.13,ox=-DIR[1]*side,oz=DIR[0]*side;
    addPoly(fp,polyP(c,[[x+ox-.12,0,z+oz-.05],[x+ox+.12,0,z+oz-.05],[x+ox+.12,0,z+oz+.05],[x+ox-.12,0,z+oz+.05]]));}
   s.knockout(fp,.9*rt);s.fill(Y,fp,.95*rt);
   if(pre>.95){const sk=solve(kellyPose(T_RUN0-.5,1,tt),KELLY_B,kellyPlace(T_RUN0-.5,1)),bu=.5+.5*Math.sin(tt*3.2);ring3(s,c,sk.chest,.3+.12*bu,rt*.8,Y,19,.025);}}
  // 4 · strike with conviction: the line into the ring, drawn as she strikes (under the players)
  const dv=sm(tS-.1,tS+.4,t);
  if(dv>.02&&tau>-.05){const pts=partial(pathPts(c,0,FLY,24),Math.max(.04,clamp(tau/FLY))),w=Math.max(9,kAt(c,[-5,1.2,-1.2])*.13);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5*dv);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95*dv);}}
  play(s,c,tau,cl.tau,clp.tau,{it:tt,pre:cl.pre,breath:pre>.95&&rt>0?.5+.5*Math.sin(tt*3.2):0,smear:true,minBall:13,crowd:false});
  const gd=sm(tS+.5,tS+.9,t);if(gd>0&&tau>FLY){const q=pr(c,SPOT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,SPOT)*1.1)*easeOutBack(gd),{n:10,seed:61,width:Math.max(6,kAt(c,SPOT)*.05)});}
 },
 still:9,
};

const film:RisoStory={
 id:'kelly-penalty-2025',format:'11v11',title:"Kelly's winning penalty",
 theme:'Penalties under pressure: pick your spot early, stick to your routine and strike it with conviction',
 ageNote:'England 1–1 Spain (England won 3–1 on penalties), UEFA Women’s Euro 2025 final, St. Jakob-Park, Basel, 27 July 2025. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little winning penalty — a yellow line rising into a ring in a top corner, a ball on its tip, a spark. Reduced motion: the still line. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.65)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*u;pts.push([x+160*k,y-120*k+30*k*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,12,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const ring:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;ring.push([x+160+Math.cos(a)*32,y-90+Math.sin(a)*32]);}
  s.fill(R,ribbon(ring,8,{close:true,seed,taper:0,wobble:1}),.9*fade);
  const e=pts[pts.length-1];if(age>.4&&age<.7)sparkBurst(s,Y,x+160,y-90,70,{n:7,seed,g:1-clamp((age-.4)/.3),width:9});
  footballPanels(s,e[0],e[1],26,{rot:age*10+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
