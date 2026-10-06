/** Frank Lampard, signature: the late run from midfield to the edge of the box — Bolton Wanderers 0–2 Chelsea, Premier League, Reebok
 * Stadium, Bolton, 30 April 2005 (17:15 kick-off; the win that made Chelsea champions of England for the first time in 50 years). An
 * iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A 1:1 reconstruction of Lampard's FIRST goal that day (60th minute) from WRITTEN accounts (the footage itself was not reviewed).
 *
 * WHY THIS MOMENT (signature entry in lib/town/iconicPlays.json: "the late run and long shot", edge of the box, centre, right foot;
 * lesson "Arrive late at the edge of the box when defenders are watching the strikers"): Wikipedia calls the late run into the box his
 * "trade-mark late run". Of the candidates, the 2008 Champions League goals were a penalty (semi-final) and a LEFT-foot tap-in (final); his
 * record goals at Villa Park on 11 May 2013 were a LEFT-footed shot and a close-range slot (Guardian). The Bolton opener is the one that is
 * described precisely AND matches the entry: two strikers (Drogba, Gudjohnsen) occupy the centre-backs, Lampard arrives from midfield,
 * wins a high bouncing ball JUST OUTSIDE the penalty area, cuts inside and finishes with a RIGHT-foot drive.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad films/src-cache/):
 *  - The Observer (theguardian.com), match report, 1 May 2005  https://www.theguardian.com/football/2005/may/01/match.boltonwanderers
 *    ("it began to look likely that the deadlock would be broken by one of Chelsea's reliable goalscorers from midfield, although Drogba was
 *    responsible for winning a header at the start of the move. Gudjohnsen fed Lampard, who cut inside Vincent Candela and resisted the
 *    fullback's blatant tug in the area to stay on his feet and drill the ball past Jussi Jaaskelainen"; Bolton appealing for an earlier
 *    foul; Drogba and Gudjohnsen "both deployed in forward roles"; Lampard and Tiago in midfield)
 *  - Wikipedia, "2004–05 Chelsea F.C. season" (raw)  https://en.wikipedia.org/wiki/2004%E2%80%9305_Chelsea_F.C._season  ("Lampard win a
 *    battle against a defender for a high, bouncing ball just outside the penalty area before making space for a fierce right-foot drive to
 *    give Chelsea the lead after an hour"; the season's kits: home royal-blue shirts and shorts, white socks; squad numbers)
 *  - BBC Sport, "Bolton 0-2 Chelsea", 30 April 2005  http://news.bbc.co.uk/sport2/hi/football/eng_prem/4476063.stm ("Lampard took advantage
 *    to battle his way into the area and beat Jussi Jaaskelainen with a powerful finish"; Jarosik bundled Fernando Hierro to the ground
 *    before it and no foul was given; line-ups; goals 60 and 76; attendance 27,653)
 *  - Wikipedia, "2004–05 Bolton Wanderers F.C. season" (raw): date, 17:15 kick-off, 0–2, Reebok Stadium; home kit white (thin black
 *    stripes) with white shorts and socks; squad numbers  https://en.wikipedia.org/wiki/2004%E2%80%9305_Bolton_Wanderers_F.C._season
 *  - Wikipedia, "Frank Lampard" (raw): "his trade-mark late run"  https://en.wikipedia.org/wiki/Frank_Lampard
 *  - The Guardian, "Aston Villa 1–2 Chelsea", 11 May 2013 (checked and rejected: the first record goal was left-footed)
 * CONFIRMED by those accounts: date, ground, score, the hour mark; Drogba won a header at the start of the move; Jarosik bundled Hierro over
 * and Bolton protested; Gudjohnsen fed Lampard; Lampard won a high, bouncing ball against a defender just outside the box, cut inside Vincent
 * Candela (Bolton's right-back in the BBC line-up order), was tugged in the area, stayed on his feet and drove the ball past Jääskeläinen with
 * his RIGHT foot; squad numbers: Lampard 8, Drogba 15, Gudjohnsen 22, Jarosik 27, Terry 26, Tiago 30, Makelele 4; Bolton Jääskeläinen 22,
 * Candela 23, N'Gotty 5, Ben Haim 26, Gardner 11, Hierro 20, Speed 6, Okocha 10.
 * INFERRED (illustrative): Chelsea in the blue home kit (Bolton's white is no clash; the day's strip was not stated in the sources, so the
 * narration never names a colour); Bolton's thin pinstripes are left off (too fine to print at card size); every exact position and path —
 * the long ball Drogba heads on (drawn from Terry), where the header and Hierro's fall happen, the shape of Gudjohnsen's lofted pass and the
 * bounce, Lampard winning it on the thigh, the single cutting touch, the strike spot (≈ 15 m out, left of centre, just inside the box —
 * Chelsea's left, since Candela is Bolton's right-back) and a low drive into the far corner with Jääskeläinen diving; the keeper's and
 * referee's kit colours; the other players' spots; the celebration (a run toward the main-stand corner, teammates piling in); the TV camera
 * positions; the stadium (bowl stands, navy-blue seats, tubular floodlight masts), the crowd colours and the early-evening sunlight.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (the long ball → Drogba's header →
 * Gudjohnsen → the lofted pass → Lampard arriving from deep → the battle, the cut, the drive → the net); ch2 = the slow-motion replay from a
 * LOW reverse angle behind Lampard's run (the centre-backs watching the two strikers, nobody tracking Lampard, the bouncing ball, the cut, the
 * drive); ch3 = a second replay angle from BEHIND THE GOAL that runs on live into the celebration; ch4 = the lesson on a raised three-quarter
 * camera behind the run (defenders watch the strikers → wait → arrive late → the edge of the box). Composed on the FULL sheet (world units =
 * sheet units centred on the canvas; never sheet.safe) inside the central ~1000 units, so it frames from the 1.45:1 card window down to square.
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every figure inside a passage print at `low`.
 * Handedness: the world is right-handed (x toward Bolton's goal, y up, +z = the main-stand side = Chelsea's right), athlete.ts's own
 * convention, so Lampard's RIGHT foot strikes without a mirrored projector; Jääskeläinen faces −x, so his left is +z (the far corner).
 * Budget: ~150–320 plate ops per frame, passages up to ~600 (as the approved Scholes film this one is modelled on). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,header,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';
import {beats,shotAt,reframe,steady,focalOf,fovOf,near,type Beats,type Subject,type ReframeOpts,type View as DView} from './director';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. LEAD: once
 * public/plays/narration/lampard-signature/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/lampard-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Bolton, 2005. One more win and Chelsea are champions. Drogba heads it on... and here comes Frank Lampard, arriving late from midfield. Goal!',tail:2.4,
  cues:['Bolton','Chelsea','Drogba','Frank Lampard','arriving late','Goal']},
 {label:'Watch it again',text:"Watch again. Bolton's defenders are watching the strikers, so nobody picks up Lampard. He wins the bouncing ball at the edge of the box, cuts inside and drills it home.",tail:1.6,
  cues:['Watch again','watching the strikers','nobody','wins the bouncing','edge of the box','cuts inside','drills']},
 {label:'Behind the goal',text:'From behind the goal: the late run, the strike... and Chelsea are on their way to the title!',tail:1.9,
  cues:['behind the goal','late run','strike','Chelsea','title']},
 {label:'Your turn',text:'Your turn: when defenders watch the strikers, wait... then arrive late at the edge of the box.',tail:2.2,
  cues:['Your turn','defenders watch','wait','arrive late','edge of the box']},
];
/** VOICE: null until the lead voices the film (see above). */
import timingJson from '../../../public/plays/narration/lampard-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lampard: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lampard: no cue '+w);return c.at;};
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
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);DV={w:s.W,h:s.H};}
/** the window in camera units, for the director (set by frame(); read by every camera, aperture() included) */
let DV:DView={w:1566,h:1080};
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Bolton defend is x = 0, Chelsea attack +x, goal centre z = 0, +z = the main-stand (camera) side. */
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

// ---------------------------------------------------------------- the Reebok Stadium, early evening: a bowl of navy-blue seats, white tubular floodlight masts
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal Chelsea attack (x>0), 2 the main stand (z>0, the
 * camera side), 3 behind the other goal (Chelsea's travelling fans drawn there — inferred) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.4+20*b,-41-30*b],
 (a,b)=>[8+26*b,1.4+17*b,lerp(-56,56,a)],
 (a,b)=>[lerp(14,-118,a),1.4+20*b,41+30*b],
 (a,b)=>[-113-26*b,1.4+17*b,lerp(56,-56,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=13,WALKS=[[.5],[.5],[.5],[.5]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a clear late-April evening (kick-off 17:15): pale sky, a warm band low down
 s.field(B,.2,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.26);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.5,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.8),[0,7.5,0]),add3(S(0,.8),[0,7.5,0])]));
  seg3(c,add3(S(0,.8),[0,7.3,0]),add3(S(1,.8),[0,7.3,0]),.35,edge);}
 s.knockout(planes);s.tone(B,planes,.55);s.tone(K,planes,.4);s.knockout(walk,.85);
 // the crowd: seeded dots — Bolton white and navy (a little red), Chelsea blue in the far end; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=si===3?(h<.7?2:h<.9?0:3):(h<.62?0:h<.84?3:h<.95?2:1);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.9);s.fill(B,inks[2],.95);s.fill(K,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.85);s.knockout(edge,.8);
 // the tubular floodlight masts rising through the roof (paper tubes, a lamp bank on top; unlit in daylight)
 const mast=new Path2D(),lamp=new Path2D();
 for(const i of which){const S=STANDS[i];for(const u of [.12,.88]){const base=add3(S(u,.8),[0,7.4,0]),top=add3(base,[0,15,0]);if(toCam(c,base)[2]<NEAR+2)continue;
  seg3(c,base,top,.9,mast);const r=add3(top,[0,1.6,0]);addPoly(lamp,polyP(c,[add3(top,[-2.2,0,0]),add3(top,[2.2,0,0]),add3(r,[2.2,0,0]),add3(r,[-2.2,0,0])]));}}
 s.fill(K,mast,.9);s.knockout(mast,.55);s.knockout(lamp);s.fill(K,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.74);
 // mowing stripes across the width, every 5.5 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.12);
 // advertising boards behind the goal and along both touchlines: navy with paper panels (generic)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.3);
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
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out low in the far corner (z +2.8) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=2.8,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2));
 const zs=[z0,-1.8,0,1.8,2.8,z1];
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
/** Chelsea: royal-blue shirts and shorts, white socks, white numbers (the season's home kit; worn that day — inferred) */
const che=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
/** Bolton: white shirts, shorts and socks (confirmed home kit; the thin pinstripes are left off), navy numbers and trim (inferred) */
const bol=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
const LAMP_B={height:1.84,bulk:1.04};
const LAMPARD_ST=che({number:8,hair:[R,.55],build:LAMP_B,seed:8});
const JAAS_ST:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.5],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:22,numberInk:K,build:{height:1.91},seed:22};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'balding',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- the strike geometry (τ = seconds after Lampard's contact)
/** where the ball is met: just inside the box, left of centre (inferred spot, ≈ 15 m out); the far corner, low (inferred) */
const CX0=-14.6,CZ0=-5.6;
const GOAL_PT:V3=[0,.62,2.75];
const YAW_S=yawTo(CX0,CZ0,GOAL_PT[0],GOAL_PT[2]);
const FWD:[number,number]=[Math.cos(YAW_S),-Math.sin(YAW_S)];
/** a drilled drive: knee and chest over the ball, head down — laid over the library strike through contact */
const OVER_IT:Partial<Pose>={lean:26,pitch:8,neckP:28,lKnee:38,lHipF:22};
const SD=.9,S_ST=-STRIKE_CONTACT*SD;
function lStrike(tau:number):Pose{const u=(tau-S_ST)/SD;return over(strike(clamp(u),{foot:'r',power:1}),OVER_IT,bump(-.34,.24,tau));}
/** where his laces meet the ball at contact, relative to his pelvis (solved once, FK) */
const LACE=(()=>{const sk=solve(lStrike(0),LAMP_B,{x:0,z:0,yaw:YAW_S});return mix3(sk.rAn,sk.rToe,.62);})();
const C_BALL:V3=[CX0,clamp(LACE[1]+.02,.14,.3),CZ0];
const P0:[number,number]=[CX0-LACE[0],CZ0-LACE[2]];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'che'|'bol'|'gk'|'ref';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
/** the long ball, Drogba's header, Gudjohnsen's lofted pass and its first bounce, Lampard's thigh, his cut, the net */
const T_LB=-8.3,T_HD=-6.0,T_RCV=-5.1,T_PASS=-4.3,T_B1=-2.9,T_TH=-2.0,T_DROP=-1.55,T_CUT=-1.15,FLY=.62,IN_NET=FLY+.12;
const SF=(k:number,side=0)=>[P0[0]+FWD[0]*k-FWD[1]*side,P0[1]+FWD[1]*k+FWD[0]*side];
/** where the celebration ends up (the main-stand side, toward the corner) */
const HUG:[number,number]=[-9,24];
const ACTORS:Actor[]=[
 {name:'Lampard',role:'hero',st:LAMPARD_ST,key:true,keys:[[-10,-53,-3],[-8,-48,-4.5],[-6,-41,-7.5],[-4.3,-33,-10.2],[-3,-26.2,-11],[T_TH,-21,-10.7],[T_DROP,-19.6,-10.1],[T_CUT,-18.5,-9.3],[-.55,...SF(-2)],[0,...P0],[.45,...SF(.9)],[1.2,...SF(1.8,.5)],[2.4,-11.5,2],[4,-10,12],[6,HUG[0],HUG[1]-1.2],[8,HUG[0]+.2,HUG[1]],[12,HUG[0]+.3,HUG[1]+.3]]},
 {name:'Candela',role:'bol',st:bol({number:23,build:{height:1.78},seed:23}),key:true,keys:[[-10,-12,-16],[-6,-13.5,-15],[-4,-15.5,-14],[-3,-18,-12.6],[T_TH,-20.1,-11.6],[T_DROP,-19.4,-11],[T_CUT,-18.9,-10.2],[-.5,-17.1,-8.3],[0,-16,-7.4],[1.5,-14.6,-6.4],[4,-13.8,-6],[12,-13.4,-6]]},
 {name:'Drogba',role:'che',st:che({number:15,skin:SKIN_D,build:{height:1.89,bulk:1.1},seed:15}),key:true,keys:[[-10,-29,4],[-8,-32,2],[T_HD,-33,1],[-5,-31,.5],[-3,-24,1],[-1,-17.5,1.5],[0,-15.8,2],[2,-13,4],[6,-9.2,20.5],[12,-9,21.3]]},
 {name:'Gudjohnsen',role:'che',st:che({number:22,build:{height:1.86},seed:22}),key:true,keys:[[-10,-23,-2],[-7,-25.5,-2.5],[T_RCV,-27.6,-3],[T_PASS,-27.9,-3.4],[-3,-24.5,-2.2],[-1.5,-19.5,-1],[0,-17,0],[3,-12.5,8],[7,-9.8,20],[12,-9.6,20.6]]},
 {name:"N'Gotty",role:'bol',st:bol({number:5,skin:SKIN_D,build:{height:1.86,bulk:1.06},seed:5}),keys:[[-10,-23,5],[-8,-26.5,3],[T_HD,-30.8,1.8],[-5,-28.5,1.2],[-3,-21.5,1.6],[-1,-16.2,2.4],[0,-14.6,2.8],[12,-11,3]]},
 {name:'Ben Haim',role:'bol',st:bol({number:26,build:{height:1.83},seed:26}),keys:[[-10,-18,-3],[-6,-22,-3.5],[T_RCV,-25.6,-3.6],[-4,-25.4,-3],[-3,-22,-2.4],[-1,-17,-1.4],[0,-14.8,-.6],[12,-11.5,0]]},
 {name:'Gardner',role:'bol',st:bol({number:11,skin:SKIN_D,build:{height:1.75},seed:11}),keys:[[-10,-20,14],[-5,-23,11],[-2,-18.5,8],[0,-15.5,6.5],[12,-13,6]]},
 {name:'Hierro',role:'bol',st:bol({number:20,build:{height:1.87},seed:20}),keys:[[-10,-37,-4],[-7,-33.5,-3.5],[T_RCV,-29.8,-4.6],[-4.6,-29.4,-4.8],[-4.1,-29.2,-4.9],[2,-29.2,-4.9],[5,-27,-4],[12,-24,-3]]},
 {name:'Jarosik',role:'che',st:che({number:27,build:{height:1.9},seed:27}),keys:[[-10,-44,-7],[-7,-38,-6],[-5.1,-31.4,-5.4],[-4.6,-30.1,-5.2],[-3,-27,-4.5],[0,-22,-3],[5,-14,14],[12,-11,19.6]]},
 {name:'Speed',role:'bol',st:bol({number:6,build:{height:1.83},seed:6}),keys:[[-10,-35,8],[-5,-31,5],[0,-24.5,2.5],[12,-21,2]]},
 {name:'Okocha',role:'bol',st:bol({number:10,skin:SKIN_D,build:{height:1.73},seed:10}),keys:[[-10,-37,-1],[-5,-32.5,-.5],[0,-27,-1.5],[12,-23,-2]]},
 {name:'Tiago',role:'che',st:che({number:30,build:{height:1.83},seed:30}),keys:[[-10,-50,8],[-5,-43,6],[0,-35,5],[12,-27,11]]},
 {name:'Terry',role:'che',st:che({number:26,build:{height:1.87,bulk:1.06},seed:26}),keys:[[-10,-61.2,4.4],[T_LB,-60.9,4.6],[-6,-58,3.5],[12,-50,2]]},
 {name:'Makelele',role:'che',st:che({number:4,skin:SKIN_D,build:{height:1.7},seed:4}),keys:[[-10,-54,-6],[-5,-48,-5],[0,-42,-3.5],[12,-38,0]]},
 {name:'Diouf',role:'bol',st:bol({number:21,skin:SKIN_D,build:{height:1.8},seed:21}),keys:[[-10,-47,-22],[0,-41,-18],[12,-36,-14]]},
 {name:'Jääskeläinen',role:'gk',st:JAAS_ST,key:true,keys:[[-10,-6,0],[-4,-4,-1],[-1.5,-2.2,-1.6],[0,-1.8,-1.5],[12,-1.8,-1.5]]},
 {name:'Referee',role:'ref',st:REF_ST,keys:[[-10,-45,7],[0,-37,9],[12,-31,9]]},
];
const HERO=0,CANDELA=1,DROGBA=2,GUD=3,NGOTTY=4,BENHAIM=5,HIERRO=7,JAROSIK=8,TERRY=12,GK=ACTORS.findIndex(a=>a.role==='gk');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
/** a point ahead of actor k along its running direction (+ to its right) */
function ahead(k:number,tau:number,f:number,r=0,y=.11):V3{const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1,dx=v[0]/l,dz=v[1]/l;return[x+dx*f-dz*r,y,z+dz*f+dx*r];}

// ---------------------------------------------------------------- the ball
const LB0:V3=[-60.3,.11,4.75];
const HD:V3=(()=>{const[x,z]=posOf(DROGBA,T_HD);return[x+.25,2.36,z];})();
const RCV:V3=(()=>{const[x,z]=posOf(GUD,T_RCV);return[x-.5,.11,z];})();
const PASS:V3=(()=>{const[x,z]=posOf(GUD,T_PASS);return[x+.45,.11,z-.3];})();
const B1:V3=[-22.4,.11,-11.2];
const TH:V3=ahead(HERO,T_TH,.36,.14,.8);
const DROP:V3=ahead(HERO,T_DROP,.75);
const CUTP:V3=ahead(HERO,T_CUT,.42,.1);
/** a ballistic loop from a to b over T seconds (x/z linear, y with gravity) */
function loopBall(a:V3,b:V3,u:number,T:number):V3{const g=9.8,vy=(b[1]-a[1]+.5*g*T*T)/T,tt=u*T;return[lerp(a[0],b[0],u),a[1]+vy*tt-.5*g*tt*tt,lerp(a[2],b[2],u)];}
/** the drive: drilled, low, a slight rise and dip into the far corner */
const flightE=(u:number)=>u*(1.15-.15*u);
const flight=(e:number):V3=>[lerp(C_BALL[0],GOAL_PT[0],e),lerp(C_BALL[1],GOAL_PT[1],e)+.32*Math.sin(Math.PI*e),lerp(C_BALL[2],GOAL_PT[2],e)];
const NET_HIT:V3=[1.6,.55,2.85],REST:V3=[1.15,.11,2.3];
function ballAt(tau:number):V3{
 if(tau<T_LB)return LB0;
 if(tau<T_HD)return loopBall(LB0,HD,(tau-T_LB)/(T_HD-T_LB),T_HD-T_LB);
 if(tau<T_RCV)return loopBall(HD,RCV,(tau-T_HD)/(T_RCV-T_HD),T_RCV-T_HD);
 if(tau<T_PASS){const u=sm(T_RCV,T_PASS,tau);return mix3(RCV,PASS,u);}
 if(tau<T_B1)return loopBall(PASS,B1,(tau-T_PASS)/(T_B1-T_PASS),T_B1-T_PASS);
 if(tau<T_TH)return loopBall(B1,TH,(tau-T_B1)/(T_TH-T_B1),T_TH-T_B1);
 if(tau<T_DROP)return loopBall(TH,DROP,(tau-T_TH)/(T_DROP-T_TH),T_DROP-T_TH);
 if(tau<T_CUT)return mix3(DROP,CUTP,(tau-T_DROP)/(T_CUT-T_DROP));
 if(tau<0){const u=(tau-T_CUT)/-T_CUT,e=u*(1.5-.5*u);const p=mix3(CUTP,C_BALL,e);return[p[0],lerp(.11,C_BALL[1],sm(.85,1,u)),p[2]];}
 if(tau<FLY)return flight(flightE(tau/FLY));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.45),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.08*Math.abs(Math.sin((tau-IN_NET-.45)*9))*Math.exp(-(tau-IN_NET-.45)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?TAU*2.5*tau:TAU*8*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** Lampard wheeling away: arms out wide, fists clenched (inferred) */
const WIDE:Partial<Pose>={lShA:92,rShA:92,lShF:8,rShF:8,lElb:30,rElb:30,neckP:-18,lean:2};
/** Hierro down after Jarosik's challenge, sitting up with an arm raised (Bolton appealed for the foul) */
const DOWN=posed({pitch:-38,lean:22,lHipF:84,rHipF:70,lKnee:74,rKnee:48,lAnk:10,rAnk:20,lShF:-44,lShA:26,lElb:12,rShF:150,rShA:30,rElb:24,neckP:-12,rHand:1});
/** the battle for the bouncing ball: right thigh up to cushion it, left arm out holding Candela off, eyes on the ball */
const THIGH:Partial<Pose>={rHipF:72,rKnee:84,rAnk:20,lKnee:30,lHipF:6,lean:-4,pitch:0,lShA:78,lShF:14,lElb:22,rShA:40,rShF:10,rElb:60,neckP:34,bend:-8};
/** the cut inside: the right foot hooks it across his body toward the middle */
const CUT:Partial<Pose>={rHipF:30,rHipA:-14,rKnee:30,rAnk:22,rHipR:18,lKnee:40,lean:18,bend:10,lShA:60,rShA:34,neckP:30};
/** Candela: shoulder in for the ball, then the tug — right arm reaching for Lampard's shirt */
const SHOULDER:Partial<Pose>={lean:18,bend:12,lShA:30,rShA:56,rShF:30,rElb:50,neckP:22};
const TUG:Partial<Pose>={lean:26,pitch:6,rShF:74,rShA:24,rElb:8,rHand:1,lShA:40,lShF:-20,neckP:10,twist:-14};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 // the centre-backs watch the strikers they mark
 if((k===NGOTTY||k===BENHAIM)&&tau<-.4){const m=posOf(k===NGOTTY?DROGBA:GUD,tau);yaw=lerpAng(yaw,yawTo(x,z,m[0],m[1]),sp<3.5?.8:.35);}
 if(tau>IN_NET+1.2&&sp<.6&&k!==HERO)yaw=yawTo(x,z,HUG[0],HUG[1]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4+k*.1):a.role==='bol'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===TERRY){const u=(tau-(T_LB-STRIKE_CONTACT*.9))/.9;if(u>-.1&&u<1.2){const w=Math.min(sm(-.1,.05,u),1-sm(1,1.2,u));p=blendPose(p,strike(clamp(u),{foot:'r',power:.8}),w);yaw=lerpAng(yaw,yawTo(x,z,HD[0],HD[2]),w);}}
 if(k===DROGBA){const u=(tau-(T_HD-.52))/1;if(u>-.1&&u<1.15){const w=Math.min(sm(-.1,.05,u),1-sm(1,1.15,u));p=blendPose(p,header(clamp(u)),w);yaw=lerpAng(yaw,yawTo(x,z,RCV[0],RCV[2])+.5,w);}}
 if(k===GUD){if(tau>T_RCV-.3&&tau<T_PASS-.3){yaw=lerpAng(yawTo(x,z,HD[0],HD[2]),yawTo(x,z,B1[0],B1[2]),sm(T_RCV,T_PASS-.4,tau));p=blendPose(p,dribble(tau*2.4,{foot:'r',speed:.3}),.6);}
  const u=(tau-(T_PASS-STRIKE_CONTACT*.8))/.8;if(u>-.1&&u<1.2){const w=Math.min(sm(-.1,.05,u),1-sm(1,1.2,u));p=blendPose(p,strike(clamp(u),{foot:'r',power:.55}),w);yaw=lerpAng(yaw,yawTo(x,z,B1[0],B1[2])+.2,w);}}
 if(k===JAROSIK)p=over(p,{lean:32,lShF:60,rShF:50,lElb:30,rElb:30,neckP:10},bump(-5.2,-4.3,tau));
 if(k===HIERRO){const w=sm(-4.65,-4.15,tau)*(1-sm(2,3.2,tau));if(w>0){p=blendPose(p,DOWN,w);yaw=lerpAng(yaw,yawTo(x,z,-40,-12),w);}}
 if(k===CANDELA){p=over(p,SHOULDER,bump(-2.5,-1.5,tau));p=over(p,TUG,bump(-1.15,-.1,tau));if(tau>-2.6&&tau<.2){const h=posOf(HERO,tau);yaw=lerpAng(yaw,yawTo(x,z,h[0],h[1]),.7*bump(-2.6,.2,tau));}}
 if(k===GK){const at=.55,dur=.8,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.2}),sm(0,.1,u));yaw=Math.PI+.1;}}
 if(k===HERO){
  // eyes up on the looping pass, then down on the bounce
  if(tau<T_TH)p=over(p,{neckP:-16},bump(T_PASS,T_TH-.3,tau)*.7);
  p=over(p,THIGH,bump(T_TH-.4,T_TH+.35,tau));
  p=over(p,CUT,bump(T_CUT-.25,T_CUT+.22,tau));
  // the tug: he leans away from it and stays on his feet
  p=over(p,{bend:14,lShA:70,lShF:-30,neckP:24},bump(-1,-.25,tau)*.7);
  const u=(tau-S_ST)/SD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,lStrike(tau),w);yaw=lerpAng(yaw,YAW_S,sm(-.3,.05,u));}
  if(tau>IN_NET+.3){const run=celebrate(distOf(k,tau)/4,{kind:'run'});p=blendPose(p,over(run,WIDE,.8),sm(IN_NET+.3,IN_NET+.8,tau)*clamp(sp/1.5+.2));
   if(sp<1.2&&tau>5)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(5,6,tau)*.9);}
 }
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='che')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='bol'&&k!==HIERRO)p=over(p,DESPAIR,w*.85);}
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
/** plan() through the shared director (lib/plays/riso/director.ts): the authored Shot, then moved toward the beat's framing; steady()
 * averages the directed camera over ±.35 s so a keep point arriving or the subject handing over never pops the framing */
function planD(t:number,steps:[number,number,(t:number)=>Shot][],B:Beats,subj:(t:number)=>Subject,opts:(t:number,sh:Shot)=>ReframeOpts=()=>({})):Cam{
 const at=(u:number)=>{let cur=steps[0][2](u);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const w=sm(a,a+Math.max(.01,d),u,easeInOutSine);if(w>0)cur=blendShot(cur,f(u),w);}
  return reframe({eye:cur.P,target:cur.T,F:focalOf(cur.fov,1080*LENS)},subj(u),shotAt(u,B),DV,opts(u,cur));};
 const r=steady(t,at);return cam3(r.eye,r.target,fovOf(r.F,1080*LENS));}
/** soft keep (feet and head) for actor k at weight w */
const keepK=(k:number,tau:number,w:number):{P:V3;w:number}[]=>w<=.01?[]:[{P:at3(k,tau),w},{P:at3(k,tau,1.8),w}];
const others=(tau:number,ks:number[]):V3[]=>ks.map(k=>at3(k,tau));

// ---------------------------------------------------------------- teaching marks
/** the shot's path so far: a ribbon along the real flight from contact to τ */
function shotPath(s:Sheet,c:Cam,tau:number,w:number,o:{ink?:string;from?:number;min?:number}={}){if(w<=0||tau<=0)return;
 const{ink=Y,from=0,min=8}=o,pts=pathPts(c,from,Math.min(tau,FLY+.001),24);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(Math.min(tau,FLY)))*.14);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
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
/** "the defenders are watching the strikers": yellow dashed eye-lines from each centre-back's head to the striker he marks */
function gaze(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;
 for(const[d,m] of [[NGOTTY,DROGBA],[BENHAIM,GUD]] as [number,number][]){const a=at3(d,tau,1.72),b=at3(m,tau,1.62),pa=pr(c,a),pb=pr(c,b);if(!pa||!pb)continue;
  arrow3(s,c,[a,mix3(a,b,.5*w),mix3(a,b,.92*w)],Math.max(5,kAt(c,a)*.1),Y,.95);
  ring(s,c,at3(m,tau),.9,w,Y,40+d);}}
/** a ground-level run line for actor k from τa to τb (drawn up to fraction u) */
function runLine(s:Sheet,c:Cam,k:number,ta:number,tb:number,u:number,ink:string){if(u<=.02)return;const pts:V3[]=[];for(let i=0;i<=16;i++)pts.push(at3(k,lerp(ta,tb,i/16*u),.05));
 arrow3(s,c,pts,Math.max(8,kAt(c,pts[pts.length-1])*.16),ink,.92);}
/** the edge of the box: the 18-yard line lit up in front of him, plus a landing ring */
function edgeMark(s:Sheet,c:Cam,w:number){if(w<=.02)return;const ln=new Path2D();seg3(c,[-16.5,.02,-15],[-16.5,.02,lerp(-15,4,w)],.5,ln);s.knockout(ln,.8*w);s.fill(Y,ln,.95*w);ring(s,c,[-19.5,0,-10.3],1.6,w,Y,48);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const dr=CUE(0,'Drogba'),fl=CUE(0,'Frank Lampard'),ar=CUE(0,'arriving late'),g=CUE(0,'Goal');const s0=Math.max(-9.8,T_HD-(dr+.1));
 return key(t,mono([[0,s0],[dr+.1,T_HD],[fl,-3.1],[ar+.15,T_TH],[g+.05,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-g]]),linear);};
const P1:V3=[-26,20,60];
/** Director beats (Oct 4 2026): a short establishing wide of the Reebok; pull in to the long ball dropping onto Drogba (Terry's ball and
 * Drogba both in frame); push in on the header; pull back out for Gudjohnsen's lofted pass so Lampard — the man arriving — is in the
 * picture with the ball; follow Lampard's late run; push in low as he wins the bouncing ball, cuts inside Candela and drills it (the
 * ball and Jääskeläinen held in frame, so the shot and the keeper are seen); hold on Lampard after the goal. The followed player hands
 * over smoothly Terry → Drogba → Gudjohnsen → Lampard. */
const BT1=beats([[0,'wide'],[1,{from:'space',size:.26}],[CUE(0,'Drogba')-.45,{from:'tight',size:.45}],[CUE(0,'Drogba')+.65,{from:'space',size:.24}],
 [CUE(0,'Frank Lampard')-.3,{from:'follow',low:0}],[CUE(0,'arriving late')-.38,{from:'tight',low:.4}],[CUE(0,'Goal')+.3,'reaction']]);
function hero1(tau:number):V3{const u0=sm(T_LB,T_HD-.4,tau,easeInOutSine),u1=sm(T_HD+.1,T_HD+.7,tau,easeInOutSine),u2=sm(T_PASS,T_PASS+.7,tau,easeInOutSine),
  u3=sm(-.3,IN_NET+.4,tau,easeInOutSine)*(1-sm(IN_NET+.7,IN_NET+1.9,tau,easeInOutSine));
 return mix3(mix3(mix3(mix3(at3(TERRY,tau),at3(DROGBA,tau),u0),at3(GUD,tau),u1),at3(HERO,tau),u2),at3(GK,tau),u3);}
/** the ball is held in frame except high in the long ball's flight (it drops in onto Drogba) and once it has settled in the net; the
 * receiver (Lampard) is held in frame while Gudjohnsen lofts the pass */
function subj1(tau:number):Subject{const h=hero1(tau),pass=sm(T_RCV-.8,T_RCV,tau)*(1-sm(T_PASS+.4,T_PASS+1.2,tau)),
  bw=(1-.7*bump(T_LB+.2,T_HD-.3,tau))*(1-sm(IN_NET+.3,IN_NET+1.1,tau));
 return{hero:h,keep:[...(bw>.01?[{P:ballAt(tau),w:bw}]:[]),...keepK(HERO,tau,pass),...near(h,others(tau,[CANDELA,DROGBA,GUD,NGOTTY,BENHAIM,HIERRO,JAROSIK]),4.5,9)]};}
function cam1(t:number):Cam{
 const tau=tau1(t),hp=at3(HERO,tau,1),g=CUE(0,'Goal');
 return planD(t,[
  [0,0,()=>({P:P1,T:mix3([-46,1,0],ballAt(tau),.45),fov:21})],
  [CUE(0,'Drogba')-.9,1,()=>({P:P1,T:mix3(ballAt(Math.max(tau,T_LB)),at3(DROGBA,tau,1.2),.45),fov:11.5})],
  [CUE(0,'Frank Lampard')-.5,1,()=>({P:P1,T:mix3(hp,ballAt(Math.min(tau,0)),.45),fov:8.5})],
  [CUE(0,'arriving late')+.2,.9,()=>({P:P1,T:mix3(add3(hp,[1.5,0,0]),[-12,1,-4],.35),fov:8.5})],
  [g-.35,.7,()=>({P:P1,T:[-5,1,-1],fov:13})],
  [g+.3,1.6,()=>({P:P1,T:[-1,1,1.2],fov:8})],
  [g+2.1,1.2,()=>({P:P1,T:add3(hp,[1,0,0]),fov:11})],
 ],BT1,u=>subj1(tau1(u)));
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=CUE(0,'Goal');
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Goal')+.3;

// ---------------------------------------------------------------- 2 · slow-motion replay, low reverse angle behind the run
const tau2=(t:number)=>key(t,mono([[0,-5.5],[CUE(1,'Watch again'),-5.3],[CUE(1,'watching the strikers'),-4.8],[CUE(1,'nobody'),-3.8],[CUE(1,'wins the bouncing'),-2.2],[CUE(1,'edge of the box'),-1.7],[CUE(1,'cuts inside'),-1.2],[CUE(1,'drills'),-.05],[SECS(1),.8]]),linear);
/** Director beats: open on the two centre-backs and the two strikers they are watching (all four held in frame, the eye-lines are the
 * lesson) with Lampard coming from behind; follow him into the free space ("nobody"); push in low as he wins the bouncing ball at the
 * edge of the box; ease out a little for the cut inside (the red arrow and Candela in frame); push in again on the drive, the ball held
 * in frame all the way to the net. */
const BT2=beats([[0,{from:'space',size:.26}],[CUE(1,'nobody')-.35,'follow'],[CUE(1,'wins the bouncing')-.4,'tight'],
 [CUE(1,'cuts inside')-.45,{from:'follow',size:.4,low:.5}],[CUE(1,'drills')-.4,'tight']]);
function subj2(tau:number):Subject{const h=at3(HERO,Math.min(tau,.2)),w=1-sm(-4.4,-3.6,tau);
 return{hero:h,ball:ballAt(Math.min(tau,FLY)),keep:[...[NGOTTY,BENHAIM,DROGBA,GUD].flatMap(k=>keepK(k,tau,w)),...near(h,others(tau,[CANDELA]),3.5,7)]};}
function cam2(t:number):Cam{
 const tau=tau2(t),hp=at3(HERO,Math.min(tau,.2),1),b=ballAt(Math.min(tau,FLY));
 const track=(back:number,side:number,up:number):V3=>{const[x,z]=posOf(HERO,Math.min(tau,.1)-.6);return[x-back,up,z-side];};
 return planD(t,[
  [0,0,()=>({P:[-57,3,-15],T:mix3(hp,[-29,1.2,-2],.55),fov:30})],
  [CUE(1,'nobody')-.3,1,()=>({P:track(8,6.5,2),T:mix3(hp,[-22,1,-4],.3),fov:28})],
  [CUE(1,'wins the bouncing')-.4,.9,()=>({P:track(5,4.6,1.6),T:add3(hp,[1.6,-.15,.6]),fov:28})],
  [CUE(1,'cuts inside')-.2,.9,()=>({P:track(6.5,5.5,1.7),T:mix3(add3(hp,[2,-.1,1]),[-4,1,0],.25),fov:32})],
  [CUE(1,'drills')+.1,1.4,()=>({P:[-24,1.8,-14],T:mix3([-8,.9,-1],b,.4),fov:34})],
 ],BT2,u=>subj2(tau2(u)));
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tW=CUE(1,'watching the strikers'),tN=CUE(1,'nobody'),tB=CUE(1,'wins the bouncing'),tE=CUE(1,'edge of the box'),tC=CUE(1,'cuts inside'),tD=CUE(1,'drills');
  stadium(s,c,t,[1,2],{roar:sm(.4,.9,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  edgeMark(s,c,sm(tE-.2,tE+.35,t)*(1-sm(tC+.2,tC+.7,t)));
  // the cut: a red arrow from the thigh-control spot across toward the middle
  const cu=sm(tC-.4,tC+.2,t,easeOutBack)*(1-sm(tC+.45,tC+.8,t));if(cu>.02){const pts:V3[]=[];for(let i=0;i<=8;i++){const P=mix3(CUTP,C_BALL,lerp(.05,1,cu)*i/8);pts.push([P[0],.05,P[2]]);}arrow3(s,c,pts,Math.max(8,kAt(c,C_BALL)*.14),R,.92);}
  shotPath(s,c,tau,1-sm(.7,.8,tau),{min:7});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  gaze(s,c,tau,sm(tW-.1,tW+.45,t)*(1-sm(tB,tB+.5,t)));
  // "nobody picks him up": a yellow ring of free space round Lampard
  const nb=sm(tN-.1,tN+.4,t,easeOutBack)*(1-sm(tB+.2,tB+.6,t));if(nb>.02)ring(s,c,at3(HERO,tau),2.4,nb,Y,46);
  // wins the bouncing ball: a spark on the thigh
  const wb=sm(tB-.1,tB+.3,t,easeOutBack)*(1-sm(tB+.8,tB+1.2,t));if(wb>.02&&hr){const q=pr(c,TH);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,TH)*.35)*wb,{n:8,seed:63,width:Math.max(5,kAt(c,TH)*.035)});}
  const dl=sm(tD-.1,tD+.3,t,easeOutBack)*(1-sm(tD+.6,tD+1,t));if(dl>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,C_BALL)*.4)*dl,{n:9,seed:61,width:Math.max(5,kAt(c,C_BALL)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),FLY)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'nobody')+.4;

// ---------------------------------------------------------------- 3 · the second replay angle, behind the goal, running on live into the celebration
const tau3=(t:number)=>{const ch=CUE(2,'Chelsea');return key(t,mono([[0,-3.4],[CUE(2,'behind the goal'),-3.1],[CUE(2,'late run'),-2.2],[CUE(2,'strike'),0],[ch,IN_NET+.9],[SECS(2)+1,IN_NET+.9+SECS(2)+1-ch]]),linear);};
const E3:V3=[12,5.2,-6];
/** Director beats: from behind the net, follow Lampard's late run (long lens kept, so it still reads as the camera behind the goal); push
 * in on the strike (Candela at his shoulder, the keeper between us and him), the drive held in frame until it is almost on us; hold on him as he
 * wheels away. The eye never comes past the back of the net. */
const BT3=beats([[0,{from:'follow',size:.3,lens:0}],[CUE(2,'strike')-.45,{from:'tight',lens:0,low:.4}],[CUE(2,'strike')+.9,{from:'reaction',lens:0}]]);
function subj3(tau:number):Subject{const h=at3(HERO,tau),bw=1-sm(FLY*.6,FLY+.05,tau);
 return{hero:h,keep:[...(bw>.01?[{P:ballAt(Math.min(tau,IN_NET)),w:bw}]:[]),...near(h,others(tau,[CANDELA,DROGBA,GUD]),3,7)]};}
/** the eye stays behind the back of the net (x ≥ 3.2) along the authored line of sight */
function opts3(tau:number,sh:Shot):ReframeOpts{const h=at3(HERO,tau),dx=sh.P[0]-h[0],dz=sh.P[2]-h[2],l=Math.hypot(dx,dz)||1;
 return dx/l>.2?{minDist:Math.min(Math.hypot(dx,sh.P[1]-1,dz),(3.2-h[0])/(dx/l))}:{};}
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),hp=at3(HERO,tau,1.1);
 return planD(t,[
  [0,0,()=>({P:E3,T:mix3(hp,[-18,1,-7],.3),fov:24})],
  [CUE(2,'late run')-.2,1,()=>({P:E3,T:mix3(hp,b,.3),fov:20})],
  [CUE(2,'strike')-.2,.7,()=>({P:add3(E3,[-.6,-.2,.4]),T:mix3([-8,1,-2],b,.45),fov:26})],
  [CUE(2,'strike')+.9,1.4,()=>({P:add3(E3,[-.8,.5,1]),T:add3(hp,[1,0,-1]),fov:26})],
  [CUE(2,'title')-.5,1.4,()=>({P:add3(E3,[-.8,.8,1.2]),T:add3(hp,[0,.2,0]),fov:18})],
 ],BT3,u=>subj3(tau3(u)),(u,sh)=>opts3(tau3(u),sh));
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tl=CUE(2,'title');
  stadium(s,c,t,[3,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tl-.1,tl+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the late run: a red line of where he came from
  const lr=sm(CUE(2,'late run')-.2,CUE(2,'late run')+.6,t)*(1-sm(CUE(2,'strike')+.3,CUE(2,'strike')+.8,t));runLine(s,c,HERO,-4.4,Math.min(tau,-.3),lr,R);
  if(tau>.02&&tau<IN_NET+.7){const fade=1-sm(FLY+.1,IN_NET+.7,tau);shotPath(s,c,tau,fade,{from:Math.max(0,tau-.5),min:8});}
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  const fb=sm(tl-.05,tl+.35,t);if(fb>0){const q=pr(c,[HUG[0],4.5,HUG[1]]);if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'strike')+.4;

// ---------------------------------------------------------------- 4 · the lesson: defenders watch the strikers → wait → arrive late → the edge of the box
const tau4=(t:number)=>key(t,mono([[0,-5.4],[CUE(3,'defenders watch'),-5.1],[CUE(3,'wait'),-4.7],[CUE(3,'arrive late')-.1,-4.4],[CUE(3,'edge of the box'),-2.1],[SECS(3),-.9]]),linear);
/** Director beats (the lesson): the two centre-backs and the strikers they watch held in frame with Lampard behind them; push in on him
 * as he waits; ease back out as he arrives late, with the edge of the box (the yellow ring) held in frame ahead of him. */
const BT4=beats([[0,'lesson'],[CUE(3,'wait')-.35,{from:'tight',size:.45,low:.4}],[CUE(3,'arrive late')-.15,'lesson']]);
const EDGE:V3=[-19.5,0,-10.3];
function subj4(tau:number,t:number):Subject{const h=at3(HERO,tau),w=1-sm(CUE(3,'wait')-.4,CUE(3,'wait')+.3,t),e=sm(CUE(3,'arrive late')-.4,CUE(3,'arrive late')+.3,t);
 return{hero:h,keep:[...[NGOTTY,BENHAIM,DROGBA,GUD].flatMap(k=>keepK(k,tau,w)),...(e>.01?[{P:add3(EDGE,[1.6,0,0]),w:e},{P:add3(EDGE,[-1.6,0,0]),w:e}]:[])]};}
function cam4v(t:number):Cam{
 return planD(t,[
  [0,0,()=>({P:[-47,8,-21],T:[-33,.8,-3.5],fov:30})],
  [CUE(3,'arrive late')-.2,1.4,()=>({P:[-38,7,-23],T:[-24,.6,-6],fov:32})],
  [CUE(3,'edge of the box')-.2,1.2,()=>({P:[-31,6,-21],T:[-19,.5,-7.5],fov:30})],
 ],BT4,u=>subj4(tau4(u),u),()=>({recenter:.4}));
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tD=CUE(3,'defenders watch'),tW=CUE(3,'wait'),tA=CUE(3,'arrive late'),tE=CUE(3,'edge of the box');
  stadium(s,c,t,[0,1]);
  ground(s,c);
  edgeMark(s,c,sm(tE-.2,tE+.4,t));
  // arrive late: the red run arrow from where he waits to the edge of the box
  const ar=sm(tA-.15,tE+.2,t);runLine(s,c,HERO,-4.7,T_TH,ar,R);
  const hr=play(s,c,tau,tp,tpp,{minBall:14});
  // defenders watch the strikers: eye-lines
  gaze(s,c,tau,sm(tD-.15,tD+.4,t)*(1-sm(tE+.4,tE+1,t)));
  // wait: a ring round him and two pause bars over his head
  const wt=sm(tW-.15,tW+.3,t,easeOutBack)*(1-sm(tA+.2,tA+.7,t));
  if(wt>.02&&hr){ring(s,c,at3(HERO,tau),1.4,wt,Y,47);const H=hr.sk.head,q=pr(c,[H[0],H[1]+.75,H[2]]);if(q){const u=Math.max(9,kAt(c,H)*.16)*wt,bars=new Path2D();
   bars.addPath(polyPath([[q[0]-u*.9,q[1]-u],[q[0]-u*.3,q[1]-u],[q[0]-u*.3,q[1]+u],[q[0]-u*.9,q[1]+u]],true));bars.addPath(polyPath([[q[0]+u*.3,q[1]-u],[q[0]+u*.9,q[1]-u],[q[0]+u*.9,q[1]+u],[q[0]+u*.3,q[1]+u]],true));
   s.knockout(bars);s.fill(Y,bars,.95*wt);s.stroke(K,bars,Math.max(2,u*.14),.85*wt);}}
 },
 still:0,
};
ch4.still=CUE(3,'edge of the box')+.3;

const film:RisoStory={
 id:'lampard-signature',format:'11v11',title:"Lampard's late run v Bolton",
 theme:'Arrive late at the edge of the box when defenders are watching the strikers',
 ageNote:'Bolton Wanderers 0–2 Chelsea, Premier League, Reebok Stadium, Bolton, 30 April 2005 — Lampard\'s first goal, on the hour. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a late run — a red dashed arrow sweeping in from behind to a yellow ring at the edge of the box, the ball arriving on it. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.5)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x-160+160*k,y+120-120*k*(2-k)]);}
  if(pts.length>2)s.fill(R,ribbon(pts,14,{seed,taper:.6,pressure:.3,wobble:1,gaps:[[.3,.38],[.6,.68]]}),.95*fade);
  const ringP:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ringP.push([x+Math.cos(a)*46*u,y+Math.sin(a)*20*u]);}s.fill(Y,ribbon(ringP,8,{close:true,seed,taper:0,wobble:1}),.9*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0]+18,e[1]-26,30,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
