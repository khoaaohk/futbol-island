/** David Beckham's free kick — England 2–2 Greece, 2002 World Cup qualifier (UEFA Group 9), Old Trafford, Manchester, 6 October 2001 — an
 * iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 via web search summaries and article text):
 *  - These Football Times, "David Beckham and the one-man show that took England to the 2002 World Cup" (26 Nov 2018)
 *    https://thesefootballtimes.co/2018/11/26/david-beckham-and-the-one-man-show-that-took-england-to-the-2002-world-cup/
 *  - Planet Football, "An ode to David Beckham vs Greece & a free-kick that defined a legacy"
 *    https://www.planetfootball.com/nostalgia/an-ode-to-david-beckhams-artistry-v-greece-a-free-kick-that-defined-a-legacy
 *  - The Football Faithful, "David Beckham, that Greece goal and England redemption"
 *    https://thefootballfaithful.com/iconic-performances-david-beckham-england-greece-free-kick/
 *  - Sports Illustrated, "Flashback: David Beckham's clutch free kick sent England to 2002 World Cup" (6 Oct 2016)
 *    https://www.si.com/soccer/2016/10/06/david-beckham-england-greece-free-kick-2001-video-watch
 *  - Sports Mole, "On this day in 2001: David Beckham scores last-gasp free kick against Greece"
 *    https://www.sportsmole.co.uk/football/england/on-this-day/feature/on-this-day-in-2001-david-beckham-scores-last-gasp-free-kick-against-greece_417441.html
 *  - englandstats.com, "England 2-2 Greece, Saturday, 6th October 2001 (784)" https://www.englandstats.com/matches.php?mid=784
 *  - Bleacher Report, "10 Years Ago Today: David Beckham's Free Kick Saves England's Bacon"
 *    https://bleacherreport.com/articles/882117-10-years-ago-today-beckhams-free-kick-saves-englands-bacon
 *  - footballbh.net, "David Beckham vs Greece: The Free Kick That Changed Everything" (2 May 2026)
 *    https://footballbh.net/2026/05/02/david-beckham-greece-free-kick-2001/
 * CONFIRMED by those accounts: Saturday 6 October 2001, Old Trafford, World Cup qualifier; Charisteas 36' (0–1), Sheringham 68' (a header
 * seconds after coming on, from a Beckham free kick), Nikolaidis 69' (1–2), Beckham 90+3' (2–2); Germany were held 0–0 by Finland, so the
 * draw sent England straight to the 2002 World Cup; England in WHITE, Greece in BLUE ("anyone else in either white or blue", Planet
 * Football); Beckham captain, number 7; Dutch referee Dick Jol gave the free kick for a nudge by Konstantinidis on Sheringham as they went
 * for a high ball; about 30 yards out (≈ 27.4 m), "dead central" (one account) / "slightly right of centre" (another); Sheringham wanted to
 * take it and Beckham refused; Beckham had missed with five earlier free kicks that game; a RIGHT-footed curler UP and OVER the wall, bending
 * away from keeper Antonios Nikopolidis into the TOP corner, the far / top-left corner (from Beckham's view); the keeper "was unmoved";
 * Beckham ran off to celebrate by the corner flag and stood in "that iconic pose" (arms spread).
 * INFERRED (illustrative): every exact position (ball 27.4 m out and 1.4 m right of centre, a four-man wall 9.15 m away on the left half,
 * Nikopolidis a step to the right of centre), the run-up (≈ 6 m, from the left of the ball at ≈ 23°), the flight (peak ≈ 3.4 m, ≈ 1.2 s, the
 * exact curl), where the ball met the net, the other players shown and where they stood, Sheringham standing beside the ball, the referee's
 * black kit, England's navy shorts and white socks, Greece's blue shorts and socks, Nikopolidis's yellow keeper kit, Beckham's short blond
 * cut, which corner he ran to (the near-side corner at the goal end) and when he turned, the TV camera positions, the autumn-afternoon light,
 * the crowd's colours and the St George flags.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Old Trafford wide → the Greek wall → the
 * referee checks his watch → the wall sets → the distance → close on Beckham → his run → pan with the ball to the top corner); ch2 = the
 * slow-motion replay from LOW BEHIND Beckham, so the ball is seen rising over the wall and curling left and down (a riso replay trail marks
 * it); ch3 = live again, pitch-level: Beckham runs to the fans with his arms wide and turns in front of the roaring, flag-waving Old Trafford
 * crowd; ch4 = the lesson: a close, very slow replay of the strike (lean over the ball, across it with the inside of the foot), the spin,
 * then the elevated behind view with the whole path, where it was heading, over the wall and down into the corner.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central ~1000 units, so
 * it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev` secondary motion, motion smear on the
 * strike); small figures in the wide shots and every figure inside a passage print at `low` detail. Handedness: the world is right-handed
 * (x toward the goal, y up, +z = Beckham's right), exactly athlete.ts's convention, so his RIGHT foot strikes without a mirrored projector.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Budget: ~150–300 plate ops per frame, passages up to ~600 (as the approved free-kick film). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/beckham-greece-2001/timing.json, add
 *   import timingJson from '../../../public/plays/narration/beckham-greece-2001/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The free kick, live',text:'Old Trafford, 2001. England are losing to Greece, and time is almost up. One last free kick, thirty yards out. David Beckham steps up... Goal!',tail:2.3,
  cues:['Old Trafford','England are losing','time is almost up','One last free kick','thirty yards','David Beckham','steps up','Goal']},
 {label:'Watch it again',text:"Watch it again, from behind. It rises over the wall, curls left and dips into the top corner. The keeper has no chance!",tail:1.6,
  cues:['Watch it again','from behind','rises over the wall','curls left','dips','top corner','The keeper']},
 {label:'Two-all!',text:'Two-all! Beckham runs to the fans, arms wide. England are going to the World Cup!',tail:1.8,
  cues:['Two-all','Beckham runs','the fans','arms wide','England are going','World Cup']},
 {label:'The secret',text:'The secret? Lean over the ball and strike across it with the inside of your foot. It spins, rises over the wall, and curls down.',tail:1.7,
  cues:['The secret','Lean over','strike across','inside of your foot','It spins','rises over','curls down']},
];
import timingJson from '../../../public/plays/narration/beckham-greece-2001/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('beckham: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('beckham: no cue '+w);return c.at;};
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
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Greece defends is x = 0 (England attack +x), the goal centre z = 0, +z = Beckham's right (the main-stand side). */
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

// ---------------------------------------------------------------- Old Trafford: autumn-afternoon sky, red-seated stands, crowd, roof, flags
/** stand planes (a along, b up the rake 0..1): 0 the tall three-tier far side (z<0), 1 behind the goal, 2 the lower main stand (z>0, the
 * camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.4+29*b,-41-36*b],
 (a,b)=>[8+30*b,1.4+21*b,lerp(-56,56,a)],
 (a,b)=>[lerp(14,-118,a),1.4+15*b,41+22*b],
 (a,b)=>[-113-30*b,1.4+21*b,lerp(56,-56,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=14,WALKS=[[.34,.68],[.5],[.55],[.5]];
/** St George flags hung on the stand fronts: [stand, a] */
const FLAGS:[number,number][]=[[0,.52],[0,.64],[0,.76],[0,.88],[1,.2],[1,.44],[1,.7],[2,.08],[2,.22],[3,.4],[3,.66]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a pale October afternoon: light blue screen, a warm band low down
 s.field(B,.17,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-460],[1e4,hz[1]-460],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.16);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.5,walk);
  // the cantilever roof: a dark overhang tilted out over the top rows, a paper fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.78),[0,9.5,0]),add3(S(0,.78),[0,9.5,0])]));
  seg3(c,add3(S(0,.78),[0,9.3,0]),add3(S(1,.78),[0,9.3,0]),.35,edge);}
 // red seats under the crowd
 s.knockout(planes);s.tone(R,planes,.5);s.tone(K,planes,.3);s.knockout(walk,.85);
 // the crowd: seeded dots (England white, red, navy, a little yellow), sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.62?0:h<.84?1:h<.96?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.8);
 // St George flags on the stand fronts (paper, a red cross)
 const fl=new Path2D(),cr=new Path2D();
 for(const[si,a] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.075),P(.43,.075)]));addPoly(cr,polyP(c,[P(0,.034),P(1,.034),P(1,.046),P(0,.046)]));}
 s.knockout(fl);s.fill(R,cr,.95);
 // floodlights: lamp strips along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.78),[0,8.6,0]),b=add3(S(u+.03,.78),[0,8.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.9,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 // mowing stripes across the width, every 5.5 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.12);
 // advertising boards behind the goal and along both touchlines: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
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
 // corner flags
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out at the top-left corner (z −3) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=-3,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2));
 const zs=[z0,-3,-1.8,0,1.8,z1];
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

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the strike)
/** the ball on the spot: 30 yards (27.4 m) out, 1.4 m right of centre */
const B0:V3=[-27.4,.11,1.4];
const DXG=-B0[0],WALL_D=9.15;
/** the target: the top-left corner (Beckham's view), just under the bar and inside the far post */
const ZG=-2.95,YG=2.12,SLOPE=.03;
/** height: a parabola in distance through the wall (2.75 m at 9.15 m) and the corner (YG at the line): it rises, peaks ≈ 3.4 m, dips */
const [HA,HB]=(()=>{const d1=WALL_D,y1=2.75-.11,d2=DXG,y2=YG-.11,b=(y1*d2-y2*d1)/(d1*d2*d2-d2*d1*d1);return[(y1+b*d1*d1)/d1,b];})();
/** curl: the ball leaves heading a touch right (.03 m per m: straight on it would reach the keeper's side) and bends left, tightening late */
const HOOK=(B0[2]+SLOPE*DXG-ZG)/(DXG*DXG);
const curlZ=(d:number)=>HOOK*d*d*(.4+.6*d/DXG);
const flight=(d:number):V3=>[B0[0]+d,.11+HA*d-HB*d*d,B0[2]+SLOPE*d-curlZ(d)];
/** straight on: the same height, no curl (the lesson's "where it was heading") */
const straight=(d:number):V3=>[B0[0]+d,.11+HA*d-HB*d*d,B0[2]+SLOPE*d];
const FLY=1.2;// ≈ 27 m in 1.2 s (≈ 100 km/h off the boot, slowing)
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.25-.25*u);};
const tauAtD=(d:number)=>{const k=clamp(d/DXG);return FLY*(1.25-Math.sqrt(1.5625-k))/.5;};
const GOAL_PT=flight(DXG),NET_HIT:V3=[1.7,1.75,-3.05],REST:V3=[1.25,.11,-2.6],IN_NET=FLY+.13;
const T_WALL=tauAtD(WALL_D+.2);
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
/** ball spin (panel rotation): ~9 rev/s off the inside of the boot */
const spinAt=(tau:number)=>tau<=0?0:TAU*9*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:R,numberInk:K,hairStyle:'short',...o});
const greece=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const BECKS_B={height:1.8,bulk:.98};
const BECKS_ST=england({number:7,hair:[Y,.95],build:BECKS_B,seed:7});
const KEEPER_ST:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[Y,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.88,bulk:1.02},seed:16};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'balding',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- Beckham: the mark, the angled run-up, the strike, the celebration run
/** approach from the LEFT of the ball (≈ 23°), so the right leg swings across the back of it */
const DIRN=Math.hypot(1,.42),DIR:[number,number]=[1/DIRN,.42/DIRN],RIGHT:[number,number]=[-DIR[1],DIR[0]];
const YAW_B=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.45,RUN_L=4.2,STRIKE_L=1.6;
/** where Beckham's pelvis stands at contact so the inside of his RIGHT boot meets the ball's right-back side (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT),BECKS_B,{x:0,z:0,yaw:YAW_B}),toe:[number,number]=[B0[0]-DIR[0]*.12+RIGHT[0]*.06,B0[2]-DIR[1]*.12+RIGHT[1]*.06];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
/** hands on hips at his mark, eyes on the goal; then the lean into the run */
const B_SET=posed({lHipF:-6,rHipF:8,lKnee:10,rKnee:16,lean:6,pitch:2,neckP:-4,lShA:44,rShA:44,lShF:-18,rShF:-18,lElb:112,rElb:112,lShR:30,rShR:30,twist:-4});
const B_READY=posed({lHipF:-20,rHipF:22,lKnee:26,rKnee:32,lAnk:18,rAnk:-6,lean:16,pitch:5,neckP:14,lShA:30,rShA:26,lShF:-10,rShF:14,lElb:40,rElb:46,twist:-10});
const ARMS_WIDE=posed({lShA:104,rShA:104,lShF:16,rShF:16,lElb:10,rElb:10,lHand:1,rHand:1,neckP:-26,lean:-10,pitch:-3,lHipF:10,rHipF:-4,lKnee:12,rKnee:16,lHipA:10,rHipA:10});
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
/** the celebration run: from where the follow-through leaves him to the near-side corner (the fans), accelerating to 7 m/s, easing in */
const P_AFTER:[number,number]=[PC[0]+DIR[0]*.9,PC[1]+DIR[1]*.9],CORNER:[number,number]=[-4.2,29.2];
const RUN_T0=1.35,CL=Math.hypot(CORNER[0]-P_AFTER[0],CORNER[1]-P_AFTER[1]);
function celebS(tau:number){const u=tau-RUN_T0;if(u<=0)return 0;const s=u<.6?7*u*u/1.2:7*(u-.3),a=CL-3.2;return s<a?s:a+3.2*(1-Math.exp(-(s-a)/3.2));}
/** τ when he has (almost) arrived and turns to face the pitch with his arms wide */
const T_ARRIVE=(()=>{let t=RUN_T0;while(celebS(t)<CL-.9&&t<20)t+=.01;return t;})();
function celebPos(tau:number):[number,number]{const s=celebS(tau)/CL;return[lerp(P_AFTER[0],CORNER[0],s),lerp(P_AFTER[1],CORNER[1],s)];}
const CELEB_YAW=yawTo(P_AFTER[0],P_AFTER[1],CORNER[0],CORNER[1]);
/** a teammate's celebration run: from his spot in the box to his place beside Beckham at the corner (6.5 m/s, easing in) */
const CD:[number,number]=[(CORNER[0]-P_AFTER[0])/CL,(CORNER[1]-P_AFTER[1])/CL];
function chaseEnd(a:{chase?:[number,number,number]}):[number,number]{const[,al,sd]=a.chase??[0,0,0];return[CORNER[0]+CD[0]*al-CD[1]*sd,CORNER[1]+CD[1]*al+CD[0]*sd];}
function chaseS(a:{x:number;z:number;chase?:[number,number,number]},tau:number){const E=chaseEnd(a),L=Math.hypot(E[0]-a.x,E[1]-a.z),u=tau-1.5-(a.chase?.[0]??0);if(u<=0)return 0;const s=u<.6?6.5*u*u/1.2:6.5*(u-.3),b=Math.max(0,L-3);return s<b?s:b+(L-b)*(1-Math.exp(-(s-b)/Math.max(.1,L-b)));}
/** Beckham's pose. ready 0..1 = leaning into his mark before the run (ch1), it = an idle clock for breathing */
function becksPose(tau:number,ready=1,it=0):Pose{
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*2.2);const p=blendPose(B_SET,B_READY,ready);p.lean+=.03*br*(1-ready);p.neckP+=.04*br;p.air=.01*ready*Math.max(0,Math.sin(it*6.5));return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(B_READY,runCycle(2.4*Math.pow(u,.9),{speed:.55+.3*u}),sm(0,.18,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.4+(tau-RUN_END)*1.6,{speed:.75});
 let p=blendPose(run,strike(Math.min(1,us),{power:.9}),sm(RUN_END,RUN_END+.14,tau));
 // leaning over the ball through contact (head over it, chest down), easing off in the follow-through
 const lo=sm(RUN_END,-.05,tau)*(1-sm(.12,.5,tau));p.lean+=.12*lo;p.neckP+=.1*lo;
 if(tau>RUN_T0-.35){const s=celebS(tau),sp=clamp((celebS(tau+.05)-celebS(tau-.05))/.1/7);
  const run2=celebrate(s/4.3,{kind:'run'});p=blendPose(p,run2,sm(RUN_T0-.35,RUN_T0+.25,tau));
  if(tau>T_ARRIVE-.6)p=blendPose(p,ARMS_WIDE,clamp(1-sp*1.6)*sm(T_ARRIVE-.6,T_ARRIVE+.1,tau));}
 return p;
}
function becksPlace(tau:number):Place{
 let g:number;
 if(tau<=T_RUN0)g=-(RUN_L+STRIKE_L);
 else if(tau<RUN_END)g=-(RUN_L+STRIKE_L)+RUN_L*Math.pow(runU(tau),1.2);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.55*v+.45*(1-(1-v)*(1-v)));}
 else g=.9*(1-Math.pow(1-clamp(tau/.7),2));
 const x=PC[0]+DIR[0]*g,z=PC[1]+DIR[1]*g;
 if(tau<RUN_T0-.35)return{x,z,yaw:YAW_B};
 const[cx,cz]=celebPos(tau),turn=sm(T_ARRIVE-.45,T_ARRIVE+.5,tau,easeInOutSine);
 return{x:cx,z:cz,yaw:lerpAng(lerpAng(YAW_B,CELEB_YAW,sm(RUN_T0-.35,RUN_T0+.3,tau)),CELEB_YAW+Math.PI*.92,turn)};
}

// ---------------------------------------------------------------- everyone else
type Role='wall'|'keeper'|'def'|'att'|'ref'|'sher';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number;
 /** where the wall man walked in from (ch1 "One last free kick") */from?:[number,number];/** celebration: [start delay s, where he ends up beside Beckham: along, side m] */chase?:[number,number,number]};
const WALL_X=B0[0]+WALL_D-.05;
const ACTORS:Actor[]=[
 {name:'Greece 4',role:'wall',st:greece({number:4,build:{height:1.86},seed:10}),x:WALL_X,z:-.42,phase:.1,from:[-15.5,-4.6]},
 {name:'Greece 5',role:'wall',st:greece({number:5,build:{height:1.84,bulk:1.05},seed:11}),x:WALL_X+.05,z:.12,phase:.6,from:[-14.2,1.2]},
 {name:'Greece 6',role:'wall',st:greece({number:6,build:{height:1.8},seed:12}),x:WALL_X,z:.66,phase:.3,from:[-16.4,4.8]},
 {name:'Greece 8',role:'wall',st:greece({number:8,hairStyle:'curly',build:{height:1.78},seed:13}),x:WALL_X+.05,z:1.2,phase:.8,from:[-21.5,9.5]},
 {name:'Nikopolidis',role:'keeper',st:KEEPER_ST,x:-.55,z:.7,phase:0},
 {name:'Greece 3',role:'def',st:greece({number:3,build:{height:1.84},seed:14}),x:-12.2,z:-5.6,phase:.4},
 {name:'Greece 2',role:'def',st:greece({number:2,build:{height:1.8},seed:15}),x:-11.6,z:2.4,phase:.9},
 {name:'Greece 7',role:'def',st:greece({number:7,build:{height:1.82},seed:17}),x:-12.8,z:7.8,phase:.5},
 {name:'Ferdinand',role:'att',st:england({number:5,skin:SKIN_M,build:{height:1.89},seed:21}),x:-14.1,z:-3.4,phase:.2,chase:[.2,-.6,2.4]},
 {name:'Heskey',role:'att',st:england({number:9,skin:[[R,.42],[Y,.5],[K,.2]],build:{height:1.88,bulk:1.08},seed:22}),x:-13.4,z:4.6,phase:.7,chase:[.5,-1.8,-1.3]},
 {name:'Sheringham',role:'sher',st:england({number:10,build:{height:1.83},seed:23}),x:-27.2,z:-1.6,phase:.15},
 {name:'referee',role:'ref',st:REF_ST,x:-21.5,z:-6.2,phase:.35},
];
const WALL_P=posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lHipA:3,rHipA:3,lShF:30,rShF:30,lShA:-10,rShA:-10,lElb:46,rElb:46,lean:6,neckP:4});
const WALL_J=posed({lHipF:36,rHipF:30,lKnee:74,rKnee:66,lAnk:46,rAnk:46,lShF:22,rShF:22,lShA:-6,rShA:-6,lElb:54,rElb:54,lean:12,air:.42,neckP:-24});
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const WATCH=posed({lShF:78,lShA:24,lElb:128,lShR:30,rShA:12,rElb:28,neckP:34,neckY:18,lean:6});
/** one actor's pose + place at τ. it = idle clock; wall 0..1 = the wall has walked in (ch1); watch 0..1 = the referee checks his watch */
function actorAt(a:Actor,tau:number,it:number,wall=1,watch=0):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),toGoal=yawTo(a.x,a.z,0,-2),look=sm(.05,.75,tau,easeInOutSine),br=Math.sin(it*2.1+a.phase*TAU);
 // the celebration chase: teammates run after Beckham and pile in beside him
 if(a.chase&&tau>1.2){const w=sm(1.2,1.8,tau),q=(tt:number):[number,number]=>{const E=chaseEnd(a),L=Math.hypot(E[0]-a.x,E[1]-a.z)||1,u=chaseS(a,tt)/L;return[lerp(a.x,E[0],u),lerp(a.z,E[1],u)];};
  const p0=q(tau),p1=q(tau+.06),sp=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])/.06,x=p0[0],z=p0[1],dist=chaseS(a,tau);
  let pose=blendPose(runCycle(dist/4.4+a.phase,{speed:clamp(sp/7)}),celebrate(it*.9+a.phase,{kind:'arms'}),clamp(1-sp/2.2));
  pose=blendPose(blendPose(DEF_P,stand(),.4),pose,w);
  return{pose,place:{x,z,yaw:sp>1.2?yawTo(x,z,p1[0],p1[1]):lerpAng(yawTo(x,z,p1[0],p1[1]),yawTo(x,z,...celebPos(tau)),clamp(1-sp/1.2))}};}
 switch(a.role){
  case 'wall':{const f=a.from??[a.x,a.z],w=1-wall,x=a.x+(f[0]-a.x)*easeInOutSine(w),z=a.z+(f[1]-a.z)*easeInOutSine(w),walk=Math.sin(Math.PI*clamp(wall));
   let p=blendPose(WALL_P,stand(),.25+.12*br);if(walk>.01)p=blendPose(p,runCycle(it*1.5+a.phase,{speed:.25}),walk);
   const j=tau<-.12?0:Math.sin(Math.PI*clamp((tau+.12)/.62));p=blendPose(p,WALL_J,j);
   // heads snap up and round as the ball goes over, then the shoulders slump
   p.neckY=(-55*sm(.12,.45,tau)*(1-sm(.9,1.5,tau)))*Math.PI/180;if(tau>1.3)p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.8);
   return{pose:p,place:{x,z,yaw:lerpAng(walk>.5?yawTo(f[0],f[1],a.x,a.z):Math.PI,Math.PI-2.1,sm(.35,1.3,tau,easeInOutSine))}};}
  case 'keeper':{let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.4,-.12,tau));
   // "the goalkeeper was unmoved": a late, hopeless half-stretch to his right as it drops in, then he turns to look at the net
   if(tau>.55)p=blendPose(p,keeperDive(clamp((tau-.55)/1.4)*.62,{height:.9}),.42*sm(.55,.9,tau)*(1-sm(1.9,2.6,tau)));
   p.neckY=(-40*sm(.8,1.1,tau))*Math.PI/180;if(tau>1.9)p=blendPose(p,SLUMP,sm(1.9,2.6,tau)*.7);
   return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,B0[0],B0[2])}};}
  case 'ref':{let p=blendPose(stand(),WATCH,watch);return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,look)}};}
  case 'def':{let p=blendPose(DEF_P,stand(),.3+.2*br);p.air+=.012*Math.max(0,br);if(tau>1.3)p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.6);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,look)}};}
  case 'sher':{let p=blendPose(stand(),DEF_P,.35+.15*br);return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,look)}};}
  default:{let p=blendPose(stand(),DEF_P,.4+.2*br);if(tau>.1){const u=(tau-.1)*1.3;p=blendPose(p,runCycle(u,{speed:.5}),sm(.1,.4,tau));}
   const run=tau>.1?Math.min(2.4,(tau-.1)*3.2):0;
   return{pose:p,place:{x:a.x+run*Math.cos(toGoal),z:a.z-run*Math.sin(toGoal),yaw:lerpAng(toBall,toGoal,look)}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the strike, the celebration run). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;ready:number;wall?:number;watch?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=becksPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=becksPose(tp,e.ready,e.it),prev={pose:becksPose(tpPrev,e.ready,e.it-1/12),place:becksPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(BECKS_ST,d,true),pl,prev,!!e.smear&&((tp>RUN_END+.2&&tp<.45)||(tp>RUN_T0+.3&&tp<T_ARRIVE-.3)));}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it,e.wall??1,e.watch??0),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12,e.wall??1,e.watch??0);drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='keeper'||a.role==='wall'),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const bxz=(tau:number):V3=>{const p=becksPlace(tau);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** the strike lands so the ball reaches the net just after "Goal"; before the run Beckham waits at his mark; real time throughout */
const tS1=()=>Math.max(CUE(0,'Goal')-IN_NET+.12,CUE(0,'David Beckham')-.3-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0,t-tS1());
const P1:V3=[-40,17,57];
function cam1(t:number):Cam{
 const tau=tau1(t),tRun=tS1()+T_RUN0;
 return plan(t,[
  [0,0,()=>({P:P1,T:[-26,0,-2],fov:34})],
  [CUE(0,'England are losing')-.2,1.2,()=>({P:P1,T:[WALL_X-2,.9,-1],fov:15})],
  [CUE(0,'time is almost')-.25,.8,()=>({P:P1,T:[-21.5,1.3,-6.2],fov:5.5})],
  [CUE(0,'One last')-.1,1,()=>({P:P1,T:add3(mix3(B0,[WALL_X,0,.4],.55),[0,.7,0]),fov:12})],
  [CUE(0,'thirty yards')-.05,1,()=>({P:P1,T:[-13.5,.6,0],fov:24})],
  [CUE(0,'David Beckham')-.25,.8,()=>({P:P1,T:add3(bxz(tau),[0,1,0]),fov:4.8})],
  [Math.max(tRun-.1,CUE(0,'David Beckham')+.6),.7,()=>({P:P1,T:add3(bxz(tau),[DIR[0]*1.4,.9,DIR[1]*1.4]),fov:10})],
  [tS1()-.05,.95,()=>({P:P1,T:[-4,1.4,-1.5],fov:15})],
  [CUE(0,'Goal')+.2,2.2,()=>({P:P1,T:[-.4,1.4,-2.4],fov:8.5})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal'),tN=tS1()+IN_NET;
  const ready=sm(CUE(0,'David Beckham'),CUE(0,'David Beckham')+.7,t),wall=sm(CUE(0,'One last')-.2,CUE(0,'One last')+1.5,t);
  const tw=CUE(0,'time is almost'),watch=sm(tw-.1,tw+.35,t)*(1-sm(tw+1.6,tw+2.1,t));
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(Math.max(g,tN),Math.max(g,tN)+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,ready,wall,watch,minBall:16,lines:true,prevT:tau1(t-.06),hero:'mid'});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind Beckham: over the wall, curl, dip
const tau2=(t:number)=>key(t,mono([[0,T_RUN0+.15],[CUE(1,'from behind'),-.62],[CUE(1,'rises')-.35,.02],[CUE(1,'rises')+.45,T_WALL],[CUE(1,'curls left'),tauAtD(15)],[CUE(1,'dips'),tauAtD(22)],[CUE(1,'top corner'),FLY-.04],[CUE(1,'The keeper'),IN_NET+.12],[SECS(1),IN_NET+1.1]]),linear);
const E2:V3=[B0[0]-13,3.4,B0[2]+.9];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>{const u=sm(T_RUN0,1,tau,easeInOutSine),T=mix3(add3(B0,[6,.4,-.6]),[-6,1.4,-.8],sm(-.05,.9,tau,easeInOutSine));return{P:mix3(E2,add3(E2,[-1.5,.8,0]),u),T:mix3(T,b,.15*sm(0,.2,tau)*(1-sm(.8,1,tau))),fov:lerp(30,22,u)};}],
  [CUE(1,'curls left')-.2,.8,()=>({P:add3(E2,[-1.5,.8,0]),T:[-5,2.2,-1.6],fov:12})],
  [CUE(1,'top corner')-.3,.8,()=>({P:add3(E2,[-1.5,.8,0]),T:[-.2,1.9,-2.5],fov:7})],
  [CUE(1,'The keeper')-.1,1.3,()=>({P:add3(E2,[-1,.6,0]),T:[.2,1.2,-.9],fov:9})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the curl so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.7),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:6.6,
};

// ---------------------------------------------------------------- 3 · live, pitch level: Beckham runs to the fans, arms wide, the crowd erupts
/** the arrival (the turn with his arms wide) lands on "arms wide"; otherwise real time */
const tau3=(t:number)=>{const a=CUE(2,'arms wide'),t0=Math.max(1.9,T_ARRIVE-a);return key(t,mono([[0,t0],[a,T_ARRIVE],[SECS(2),T_ARRIVE+SECS(2)-a]]),linear);};
const E3:V3=[-28,2.4,12.5];
/** fans in the near-side lower tier by the corner: a grid of cut-paper bodies that jump up with their arms raised; big flags wave */
const FANS=(()=>{const out:{a:number;b:number;h:number}[]=[];for(let j=0;j<9;j++)for(let i=0;i<46;i++){const h=hash(i*97+j*13,21);if(h<.12)continue;out.push({a:.005+(i+.5+(hash(i,j)-.5)*.35)/46*.3,b:.04+j*.052,h});}return out;})();
function fans(s:Sheet,c:Cam,t:number,rise:number,wave:number){
 const v=view(s),sil=new Path2D(),red=new Path2D(),navy=new Path2D(),skin=new Path2D(),hair=new Path2D(),arms=new Path2D();let n=0;const tt=twos(t);
 for(const f of FANS){const up=clamp(rise*1.5-f.h*.5),hop=up*Math.max(0,Math.sin(tt*9+f.h*TAU))*.18,P=STANDS[2](f.a,f.b),q=toCam(c,add3(P,[0,.5+.35*up+hop,0]));if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;
  const k=c.F/q[2],w=.46*k,h=.62*k,hr=.13*k,x=p[0],y=p[1];if(w<2.5)continue;n++;
  const body=polyPath([[x-w/2,y+h*.6],[x-w*.42,y-h*.35],[x-w*.18,y-h*.5],[x+w*.18,y-h*.5],[x+w*.42,y-h*.35],[x+w/2,y+h*.6]],true);sil.addPath(body);
  if(f.h<.3)red.addPath(body);else if(f.h<.42)navy.addPath(body);
  const head=polyPath(blob(x,y-h*.5-hr*.9,hr,hr*1.1,Math.floor(f.h*99),{amp:.06,n:10}),true);sil.addPath(head);skin.addPath(head);
  hair.addPath(polyPath(blob(x,y-h*.5-hr*1.4,hr*.95,hr*.5,Math.floor(f.h*77),{amp:.08,n:10}),true));
  if(up>.25){const sw=Math.sin(tt*7+f.h*9)*.25*wave;for(const sx of[-1,1]){const a0:Pt=[x+sx*w*.36,y-h*.38],a1:Pt=[x+sx*w*(.55+.2*up)+sw*w,y-h*.5-h*1.05*up];const r=ribbon([a0,a1],Math.max(1.6,w*.16),{seed:f.h*50+sx,taper:.2,wobble:0});arms.addPath(r);sil.addPath(r);}}}
 if(!n)return;s.knockout(sil);s.fill(R,red,.9);s.fill(K,navy,.85);s.tone(Y,skin,.4);s.tone(R,skin,.3);s.tone(Y,arms,.35);s.tone(R,arms,.25);s.fill(K,hair,.85);s.stroke(K,sil,2,.85);
 // big St George flags held up in the crowd, waving
 const fl=new Path2D(),cr=new Path2D();
 for(const[i,a0,b0] of [[0,.05,.14],[1,.13,.3],[2,.22,.2],[3,.27,.38]] as [number,number,number][]){const base=STANDS[2](a0,b0),sw=Math.sin(tt*5+i*1.7)*.5*wave,W=3.2,H=2,top=1.1+1.6*rise;
  const P=(u:number,vv:number):V3=>[base[0]-u*W+sw*vv*.6,base[1]+top+H*(1-vv)+.25*Math.sin(u*3+tt*6+i)*wave,base[2]+sw*u*.4];
  const q=polyP(c,[P(0,0),P(.5,0),P(1,0),P(1,1),P(.5,1),P(0,1)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  addPoly(cr,polyP(c,[P(.43,0),P(.57,0),P(.57,1),P(.43,1)]));addPoly(cr,polyP(c,[P(0,.42),P(1,.42),P(1,.58),P(0,.58)]));}
 if(rise>.05){s.knockout(fl);s.fill(R,cr,.95);s.stroke(K,fl,2,.8);}
}
function cam3v(t:number):Cam{
 const tau=tau3(t),bp=becksPlace(tau),B:V3=[bp.x??0,1.25,bp.z??0],tE=CUE(2,'England are going');
 return plan(t,[
  [0,0,()=>({P:E3,T:add3(mix3(B,[-10,1,22],.25),[0,.2,0]),fov:26})],
  [CUE(2,'Beckham runs')-.2,1,()=>({P:E3,T:B,fov:15})],
  [CUE(2,'arms wide')-.3,.9,()=>({P:add3(E3,[1.5,-.5,1.5]),T:add3(B,[0,.3,0]),fov:10})],
  [tE-.1,1.4,()=>({P:add3(E3,[1.5,-.5,1.5]),T:add3(B,[.6,2.1,2.6]),fov:14})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tF=CUE(2,'the fans'),tE=CUE(2,'England are going'),tW=CUE(2,'World Cup');
  const rise=.35+.65*sm(tF-.2,tF+.8,t),wave=.5+.5*sm(tE-.2,tE+.6,t);
  stadium(s,c,t,[1,2],{roar:rise,flash:.4+.6*sm(tW-.1,tW+.3,t)});
  fans(s,c,t,rise,wave);
  ground(s,c);
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:10});
  // "World Cup!": a burst of paper and yellow over the corner (the passage material into the lesson)
  const wc=sm(tW-.05,tW+.35,t);if(wc>0){const q=pr(c,[-3,6,33]);if(q){sparkBurst(s,Y,q[0],q[1],120+160*wc,{n:11,seed:9,g:easeOutBack(wc),width:15});}}
 },
 aperture(t){const c=cam3v(t),bp=becksPlace(tau3(t)),q=pr(c,[bp.x??0,1.3,bp.z??0])??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:5,
};

// ---------------------------------------------------------------- 4 · the lesson: lean over it, across the ball with the inside of the foot → spin → over and down
const tau4=(t:number)=>key(t,mono([[0,-.9],[CUE(3,'Lean over'),-.3],[CUE(3,'strike across'),-.07],[CUE(3,'inside'),.003],[CUE(3,'It spins'),.03],[CUE(3,'rises over'),T_WALL-.05],[CUE(3,'curls down'),.62],[SECS(3),FLY+.45]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:add3(B0,[2.9,.6,-2.5]),T:add3(B0,[-.8,.55,.35]),fov:38})],
  [CUE(3,'It spins')-.15,.8,()=>({P:add3(b,[-2.3,.9,-2.2]),T:add3(b,[.8,0,.2]),fov:36})],
  [CUE(3,'rises over')-.3,1.1,()=>({P:[-50,15,1.8],T:[-14,1.2,-.4],fov:30})],
  [CUE(3,'curls down')+.1,1.9,()=>({P:[-51,17,2],T:[-11,1,-.9],fov:28})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tL=CUE(3,'Lean over'),tS=CUE(3,'strike across'),tI=CUE(3,'inside'),tSp=CUE(3,'It spins'),tR=CUE(3,'rises over'),tD=CUE(3,'curls down');
  stadium(s,c,t,[0,1,2]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // the path (under the players): where it was heading (straight, dashed) and the real curl so far
  const cv=sm(tR-.2,tR+.5,t);
  if(cv>.02){const str=new Path2D(),n=18;for(let i=0;i<n;i+=2){const a=pr(c,straight(i/n*DXG*cv)),b=pr(c,straight((i+1)/n*DXG*cv));if(a&&b)str.addPath(ribbon([a,b],Math.max(13,kAt(c,straight(i/n*DXG))*.2),{taper:.25,wobble:0}));}
   s.knockout(str);s.stroke(K,str,2.4,.9);
   const pts=partial(pathPts(c,0,FLY,40),clamp(tau/FLY)),w=Math.max(17,kAt(c,[-14,2,0])*.26);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95);}}
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:14});
  // 1 · lean over the ball: a yellow plumb line from his head down to the ball, a ring round the ball
  const ln=sm(tL-.2,tL+.3,t,easeOutBack)*(1-sm(tSp,tSp+.4,t));
  if(ln>.02){const sk=solve(becksPose(tp,1,tt),BECKS_B,becksPlace(tp)),h=pr(c,sk.head),bb=pr(c,add3(B0,[0,.12,0]));
   if(h&&bb){const e:Pt=[lerp(h[0],bb[0],ln),lerp(h[1],bb[1],ln)],gaps:[number,number][]=[];for(let i=0;i<5;i++)gaps.push([(i+.62)/5.2,(i+.95)/5.2]);s.fill(Y,ribbon([h,e],Math.max(6,kAt(c,B0)*.03),{seed:13,taper:.3,wobble:.6,gaps}),.95*ln);s.stroke(K,ribbon([h,e],Math.max(6,kAt(c,B0)*.03),{seed:13,taper:.3,wobble:.6,gaps}),1.6,.6*ln);}
   const ring:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[B0[0]+Math.cos(a)*.45*(.7+.3*ln),0,B0[2]+Math.sin(a)*.45*(.7+.3*ln)]);if(p)ring.push(p);}
   if(ring.length>30){const rr=ribbon(ring,Math.max(6,kAt(c,B0)*.05),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ln);s.fill(Y,rr,.95*ln);}}
  // 2 · across the ball: the boot's sweep (red), from the right-back of the ball across to the front-left
  const acr=sm(tS-.1,tS+.35,t,easeOut)*(1-sm(tSp,tSp+.4,t));
  if(acr>.02){const a:V3=[B0[0]-DIR[0]*.7+RIGHT[0]*.45,.14,B0[2]-DIR[1]*.7+RIGHT[1]*.45],b:V3=[B0[0]+DIR[0]*.55-RIGHT[0]*.55,.14,B0[2]+DIR[1]*.55-RIGHT[1]*.55];
   arrow3(s,c,[a,mix3(a,b,.35*acr+.1),mix3(a,b,acr)],Math.max(8,kAt(c,B0)*.05),R,.95);}
  // 3 · the inside of the right boot lights up at contact
  const ins=sm(tI-.15,tI+.25,t,easeOutBack)*(1-sm(tSp+.2,tSp+.6,t));
  if(ins>.02){const p=pr(c,[B0[0]-DIR[0]*.1+RIGHT[0]*.07,.12,B0[2]-DIR[1]*.1+RIGHT[1]*.07]);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(60,kAt(c,B0)*.35)*ins,{n:9,seed:61,width:Math.max(6,kAt(c,B0)*.04)});}
  // 4 · the spin: two arrows circling the ball's equator (counter-clockwise seen from above: its right side goes forward → it curls left)
  const sp=sm(tSp-.15,tSp+.35,t,easeOutBack)*(1-sm(tR+.3,tR+.8,t));
  if(sp>.02){const P=ballAt(Math.min(tau,FLY)),rad=.11*2.3,rot=spinAt(tau)*.15;for(const k of[0,1]){const pts:V3[]=[];for(let i=0;i<=10;i++){const th=rot+k*Math.PI+i/10*Math.PI*.72*sp;pts.push([P[0]+Math.cos(th)*rad,P[1],P[2]-Math.sin(th)*rad]);}
   arrow3(s,c,pts,Math.max(5,kAt(c,P)*.035),Y,.95);}}
  // 5 · "rises over the wall": an up arrow over the wall; "curls down": a left-and-down arrow into the corner
  const up=sm(tR-.05,tR+.45,t,easeOutBack);
  if(up>.02){const P=flight(WALL_D);arrow3(s,c,[[P[0]-2.4,1.2,P[2]+.1],[P[0]-1.2,1.2+1.6*up,P[2]+.05],[P[0]+.2,1.2+2.1*up,P[2]]],Math.max(10,kAt(c,P)*.2),R,.95*(1-sm(tD+.6,tD+1.2,t)));}
  const dn=sm(tD-.05,tD+.5,t,easeOutBack);
  if(dn>.02){const P=flight(DXG-7),G=flight(DXG-.5);arrow3(s,c,[add3(P,[0,1.3,.6]),mix3(add3(P,[0,1.3,.6]),add3(G,[0,.5,0]),.5*dn),mix3(add3(P,[0,1.3,.6]),add3(G,[0,.5,0]),dn)],Math.max(10,kAt(c,P)*.2),R,.95);}
 },
 still:9,
};

const film:RisoStory={
 id:'beckham-greece-2001',format:'11v11',title:"Beckham's free kick v Greece",
 theme:'Free kicks: lean over the ball and strike across it with the inside of your foot, so it rises over the wall and curls down',
 ageNote:'England 2–2 Greece, World Cup qualifier, Old Trafford, Manchester, 6 October 2001. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little curler — a yellow path that rises, bends left and dips, with a spinning ball on its tip. Reduced motion: the still curl. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x-150*k*k,y-260*k+120*k*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],34,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
