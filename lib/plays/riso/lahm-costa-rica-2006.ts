/** Philipp Lahm's curler — Germany 4–2 Costa Rica, the OPENING match of the 2006 World Cup, Group A, Allianz Arena ("FIFA World Cup
 * Stadium, Munich"), Friday 9 June 2006, 18:00 local — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 with curl; cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "2006 FIFA World Cup Group A" (raw wikitext: match summary, football box, kit templates, line-ups; citing BBC, the Guardian
 *    and the FIFA match report) https://en.wikipedia.org/wiki/2006_FIFA_World_Cup_Group_A
 *  - BBC Sport, "Germany 4-2 Costa Rica" (9 June 2006) https://news.bbc.co.uk/sport1/hi/football/world_cup_2006/4852498.stm
 *  - The Guardian, Richard Williams, "Klose double carries Germany to a joyous victory" (10 June 2006)
 *    https://www.theguardian.com/football/2006/jun/10/worldcup2006.sport11
 *  - Wikipedia, "Philipp Lahm" (height, the 2006 World Cup section, the elbow cast) and de.wikipedia "Fußball-Weltmeisterschaft 2006/Gruppe A"
 * CONFIRMED by those accounts: the tournament's opening match, 9 June 2006, Munich (Allianz Arena), 18:00, ≈ 66,000 (BBC: 64,950); referee
 * Horacio Elizondo; Lahm 6' (1–0), Wanchope 12', Klose 17' and 61', Wanchope 73', Frings 87'; the first goal of the 2006 World Cup; Lahm was
 * Germany's LEFT-BACK, number 16, 1.70 m; he "took possession wide on the left before cutting inside" (Guardian); "Danny Fonseca's slip giving
 * Lahm space to cut inside on the edge of the box" (BBC); "unleashing a RIGHT-FOOT drive that curled over Porras's vain leap and inside the
 * FAR angle" (Guardian); "unstoppable curling shot which flew into the top corner" (BBC); "a right foot shot into the TOP-RIGHT corner"
 * (Wikipedia); he wore "a special cast on his LEFT arm" after an elbow injury in a pre-tournament friendly (Wikipedia, citing The Independent);
 * keeper José Porras, number 18; Fonseca number 6; Germany in WHITE shirts with black trim, BLACK shorts, WHITE socks (home); Costa Rica in
 * RED shirts, BLUE shorts, RED socks (Wikipedia kit templates from historicalkits.co.uk and the FIFA video); Costa Rica's back five
 * Martínez 5, Umaña 4, Sequeira 20, Marín 3 (captain), González 12, midfield Fonseca 6, Centeno 10, Solís 8, forwards Gómez 11, Wanchope 9;
 * Germany's Schneider 19, Frings 8, Borowski 18, Schweinsteiger 7, Klose 11, Podolski 20 ahead of Lahm.
 * INFERRED (illustrative): every exact position — where he took the ball (≈ 32 m out, 22 m left of centre), the diagonal carry, the cut
 * point and the strike spot (≈ 20 m out, 12 m left, just outside the box: the accounts range from "on the edge of the box" to "still 30
 * yards out"); the pass that reached him (from an unnumbered team-mate, infield); the exact moment and way Fonseca slipped (drawn feet going
 * from under him as he closed Lahm down, just before the cut); every other player's position and run; the flight (peak ≈ 2.8 m, ≈ 1.05 s,
 * the exact bend); Porras's kit colours (drawn yellow), his starting spot and the leap to his left; the colour of Lahm's cast (drawn white);
 * his celebration run toward the near corner and who chased him; hair colours; which touchline the TV camera sat on (drawn on Lahm's side);
 * the Allianz Arena bowl, roof and crowd colours; the weather (drawn a bright evening). The narration names only what the sources confirm.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the bowl wide → the crowd → Lahm takes the
 * ball wide on the left → Fonseca slips → the cut → the curler → pan with the ball to the far top corner → Lahm runs off); ch2 = the
 * slow-motion replay from LOW BEHIND Lahm (the cut onto the right foot, the ball leaving outside the far post and bending back in; a riso
 * replay trail); ch3 = a second replay, reverse angle from behind the goal: Porras leaps, too low, into the top corner; ch4 = the lesson:
 * from high behind the attack, a full-back's run up the wing (full-backs can attack too), the cut arrow, a ring on the stronger (right)
 * foot, then the curl (where it was heading dashed, the bend in yellow) and a ring on the far corner.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), kept inside the central ~1000 units so it
 * frames from the 1.45:1 card window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous
 * silhouettes, FK skeleton, full range of motion, `prev` secondary motion, motion smear on the cut and the strike); small figures in the
 * wide shots and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward the goal, y up, +z =
 * the attacker's right), exactly athlete.ts's convention, so Lahm's RIGHT foot strikes without a mirror; his cast sits on the LEFT forearm.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Budget: ~150–300 plate ops per frame, passages up to ~600 (as the approved Kroos free-kick film). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,celebrate,posed,blendPose,touchPhase,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (withTiming matches each cue's FIRST
 * word in order, so every cue starts with a word that cannot be matched early); their `at` and each chapter's `seconds` are ESTIMATES
 * (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/lahm-costa-rica-2006/timing.json, add
 *   import timingJson from '../../../public/plays/narration/lahm-costa-rica-2006/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:"Munich, 2006, the first game of the World Cup! Germany's left-back, Philipp Lahm, has the ball wide on the left. The defender slips! Lahm cuts inside... curls it... Goal!",tail:2.4,
  cues:['Munich','the first game',"Germany's left-back",'Philipp Lahm','has the ball','wide on the left','defender slips','Lahm cuts','curls it','Goal']},
 {label:'Watch it again',text:'Watch it again, from behind. One sharp cut puts it on his right foot. It starts outside the far post, then bends back in.',tail:1.6,
  cues:['Watch it again','from behind','One sharp cut','his right foot','It starts outside','bends back']},
 {label:'From behind the goal',text:"From behind the goal: the keeper leaps, but it's too high! Top corner!",tail:1.9,
  cues:['From behind the goal','keeper leaps','too high','Top corner']},
 {label:'The secret',text:'The secret? Full-backs can attack too! Cut inside onto your stronger foot, then curl it into the far corner.',tail:1.9,
  cues:['The secret','Full-backs','Cut inside','stronger foot','then curl','far corner']},
];
import timingJson from '../../../public/plays/narration/lahm-costa-rica-2006/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lahm: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lahm: no cue '+w);return c.at;};
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
/** Pitch: the goal line Costa Rica defends is x = 0 (Germany attack +x), the goal centre z = 0, +z = the attacker's right; Lahm comes
 * from the LEFT (z < 0), the TV camera on that side (z ≈ −66). */
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

// ---------------------------------------------------------------- the Allianz Arena on a bright evening: steep closed bowl, roof ring, crowd
/** stand planes (a along, b up the rake 0..1): 0 the far side (z > 0), 1 behind the goal, 2 the near side (the camera's, z < 0), 3 the
 * other end. Steep, close to the pitch, three tiers (two walkways), under one roof ring. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.2+30*b,40+26*b],
 (a,b)=>[8+24*b,1.2+28*b,lerp(-56,56,a)],
 (a,b)=>[lerp(12,-116,a),1.2+30*b,-40-26*b],
 (a,b)=>[-113-24*b,1.2+28*b,lerp(56,-56,a)],
];
/** the closed bowl's corners: stand k's end joined to the next stand's end (4 + k in the stand index), so no sky shows between stands */
const CORNER_OF:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
for(const[i,ai,j,aj] of CORNER_OF)STANDS.push((a,b)=>mix3(STANDS[i](ai,b),STANDS[j](aj,b),a));
const STAND_COLS=[100,64,100,64,14,14,14,14],STAND_ROWS=15,WALKS=[.34,.68];
/** which stands to print for a set of main stands: the main ones plus every corner touching one of them */
const withCorners=(which:number[])=>[...which,...CORNER_OF.map((c,k)=>which.includes(c[0])||which.includes(c[2])?4+k:-1).filter(k=>k>=0)];
/** the roof ring's inner edge over each stand (a along): the white cushion roof overhangs the top tier */
const roofIn=(i:number,a:number):V3=>{const t=STANDS[i](a,1),f=STANDS[i](a,.55);return[lerp(t[0],f[0],.9),t[1]+6,lerp(t[2],f[2],.9)];};
const roofOut=(i:number,a:number):V3=>{const t=STANDS[i](a,1);return[t[0],t[1]+4,t[2]];};
function stadium(s:Sheet,c:Cam,t:number,main:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),which=withCorners(main);
 // a bright June evening: the open sky over the roof ring, pale blue
 s.tone(B,polyPath([[-1e4,-1e4],[1e4,-1e4],[1e4,1e4],[-1e4,1e4]],true),.22);
 const planes=new Path2D(),walk=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const w of WALKS)seg3(c,S(0,w),S(1,w),.7,walk);}
 s.tone(K,planes,.38);s.tone(R,planes,.12);s.knockout(walk,.5);
 // the crowd: seeded dots — German white, black, red and gold, a patch of Costa Rican red — sized by distance; roar lifts them
 const dots=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],any=[0,0,0,0];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/q[2],2.4,14),lift=roar>0?roar*z*1.2*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const crc=si===3&&a>.55&&a<.8;const ink=crc?(h<.8?1:0):h<.6?0:h<.78?1:h<.9?2:3;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}}
 if(any[0])s.knockout(dots[0],.75);if(any[1])s.fill(R,dots[1],.9);if(any[2])s.fill(Y,dots[2],.95);if(any[3])s.fill(K,dots[3],.85);
 // the roof ring: white cushions (diamond lattice) overhanging every stand, a blue shadow band under the lip
 const rf=new Path2D(),lat=new Path2D(),lip=new Path2D();
 for(const i of which){const n=i<4?12:2;for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n;addPoly(rf,polyP(c,[roofOut(i,a0),roofOut(i,a1),roofIn(i,a1),roofIn(i,a0)]));
   seg3(c,roofOut(i,a0),roofIn(i,a1),.35,lat);seg3(c,roofIn(i,a0),roofOut(i,a1),.35,lat);}
  seg3(c,roofIn(i,0),roofIn(i,1),.9,lip);}
 s.knockout(rf,.92);s.tone(B,rf,.12);s.fill(K,lat,.35);s.fill(K,lip,.6);
 if(flash>0){const p=new Path2D();let n=0;for(let i=0;i<Math.round(22*flash);i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q||Math.abs(q[0])>v.hx||Math.abs(q[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));n++;}if(n){s.knockout(p);s.fill(Y,p,.95);}}
}
// ---------------------------------------------------------------- grass, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.82);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.12);
 // advertising boards behind the goal and along both touchlines: white with red and blue panels
 const bd=new Path2D(),pn=new Path2D(),pb=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6.5,0,-36],[6.5,0,36]);board([-110,0,-38],[6.5,0,-38]);board([-110,0,38],[6.5,0,38]);
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%2?pn:pb,polyP(c,[[6.45,.25,z],[6.45,.25,z+3.4],[6.45,.68,z+3.4],[6.45,.68,z]]));}
 for(const zz of[-37.95,37.95])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(k%2?pn:pb,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.tone(K,bd,.12);s.fill(R,pn,.85);s.fill(B,pb,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
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
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out at the top-RIGHT corner (z +3) */
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

// ---------------------------------------------------------------- the shot on one clock τ (seconds; τ = 0 is the strike)
/** the strike spot: just outside the box, ≈ 12 m left of centre (inferred between "the edge of the box" and "30 yards out") */
const B1:V3=[-19.8,.11,-12.2];
/** the target: the far top corner (Lahm's right), just under the bar and inside the far post */
const TGT:V3=[0,2.1,2.95];
const CHX=TGT[0]-B1[0],CHZ=TGT[2]-B1[2],DG=Math.hypot(CHX,CHZ);
/** the chord (ball → corner) and its right-hand side on the ground */
const CR:[number,number]=[-CHZ/DG,CHX/DG];
/** the bend: the ball leaves heading right of the far post and curls back left into the corner (metres right of the chord) */
const BOW=6.5;
const off=(u:number)=>BOW*u*(1-u)*(.6+.8*u);
/** height: a parabola in u through the corner, peaking ≈ 2.8 m ("curled over Porras's vain leap") */
const [HA,HB]=(()=>{const y1=TGT[1]-.11,pk=2.7;const a=2*pk+Math.sqrt(4*pk*pk-4*pk*y1);return[a,a-y1];})();
const hAt=(u:number)=>.11+HA*u-HB*u*u;
const flightU=(u:number):V3=>{const o=off(u);return[B1[0]+CHX*u+CR[0]*o,hAt(u),B1[2]+CHZ*u+CR[1]*o];};
/** straight on: the first heading kept, no bend (the lesson's "where it was heading": wide of the far post) */
const straightU=(u:number):V3=>{const o=BOW*.6*u;return[B1[0]+CHX*u+CR[0]*o,hAt(u),B1[2]+CHZ*u+CR[1]*o];};
/** the initial heading and its right (ground plane) */
const H0:[number,number]=(()=>{const x=CHX+CR[0]*BOW*.6,z=CHZ+CR[1]*BOW*.6,l=Math.hypot(x,z);return[x/l,z/l];})();
const R0:[number,number]=[-H0[1],H0[0]];
/** a point in the shot's frame from o: f forward along the first heading, r to its right, y up (absolute) */
const LOC=(o:V3,f:number,r:number,y:number):V3=>[o[0]+H0[0]*f+R0[0]*r,y,o[2]+H0[1]*f+R0[1]*r];
const FLY=1.05;// ≈ 26 m, a hard curler
const uAt=(tau:number)=>{const u=clamp(tau/FLY);return u*(1.25-.25*u);};
const tauAtU=(u:number)=>{const k=clamp(u);return FLY*(1.25-Math.sqrt(1.5625-k))/.5;};
const GOAL_PT=flightU(1),NET_HIT:V3=[1.65,1.8,3.05],REST:V3=[1.2,.11,2.55],IN_NET=FLY+.13;

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Germany 2006 home: white shirts with black trim, black shorts, white socks */
const germany=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:[K,.8],line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Costa Rica 2006 home: red shirts, blue shorts, red socks */
const costaRica=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[B,.95],socks:[R,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const LAHM_B={height:1.7,bulk:.92};
const LAHM_ST=germany({number:16,hair:[K,.7],build:LAHM_B,seed:16});
const KEEPER_ST:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[Y,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:18,numberInk:K,build:{height:1.83,bulk:1},seed:18};
const FONSECA_ST=costaRica({number:6,build:{height:1.78},seed:6});

// ---------------------------------------------------------------- Lahm: takes the pass wide on the left, carries it in, cuts, strikes
/** approach to the strike from the LEFT of the ball (≈ 20° off the first heading): the cut sends him across the top of the box */
const APP=20*Math.PI/180;
const DIR:[number,number]=[H0[0]*Math.cos(APP)+R0[0]*Math.sin(APP),H0[1]*Math.cos(APP)+R0[1]*Math.sin(APP)];
const RIGHT:[number,number]=[-DIR[1],DIR[0]];
const YAW_K=yawTo(0,0,DIR[0],DIR[1]);
/** the carry before the cut: diagonally in from the wing (≈ 28° infield of straight at goal) */
const D1:[number,number]=[Math.cos(28*Math.PI/180),Math.sin(28*Math.PI/180)];
const SD=1.0,STRIKE_L=1.6;
/** where Lahm's pelvis stands at contact so the inside of his RIGHT boot meets the ball's right-back side (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT),LAHM_B,{x:0,z:0,yaw:YAW_K}),toe:[number,number]=[B1[0]-DIR[0]*.12+RIGHT[0]*.06,B1[2]-DIR[1]*.12+RIGHT[1]*.06];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const T_PASS=-6.5,T_RCV=-5.2,T_CUT=-1.15,T_SLIP=-1.75,T_RUN0=1.3;
/** his touches: the first touch, three touches on the carry, the cut (onto the right foot); then the strike at 0 */
const TOUCHES=[T_RCV,-4.2,-3.2,-2.2,T_CUT];
const CP:[number,number]=[PC[0]-DIR[0]*3.3,PC[1]-DIR[1]*3.3];
const along=(p:[number,number],d:[number,number],k:number):[number,number]=>[p[0]+d[0]*k,p[1]+d[1]*k];
/** the pelvis track (τ, x, z): a cubic Hermite through the keys (the cut corner is rounded by the tangents, never a kink) */
const TRACK:[number,number,number][]=[
 [-8.6,...along(CP,D1,-23.6)],[T_PASS,...along(CP,D1,-20.8)],[T_RCV,...along(CP,D1,-17)],[-4.2,...along(CP,D1,-13.3)],[-3.2,...along(CP,D1,-9.1)],[-2.0,...along(CP,D1,-4)],
 [T_CUT,...CP],[-.52,...along(PC,DIR,-STRIKE_L)],[0,...PC],[.7,...along(PC,DIR,.9)],
] as [number,number,number][];
function hermite(T:[number,number,number][],t:number):[number,number]{
 if(t<=T[0][0])return[T[0][1],T[0][2]];const n=T.length;if(t>=T[n-1][0])return[T[n-1][1],T[n-1][2]];
 let i=0;while(t>T[i+1][0])i++;const a=T[i],b=T[i+1],h=b[0]-a[0],u=(t-a[0])/h;
 const tan=(k:number,j:1|2)=>{const p=T[Math.max(0,k-1)],q=T[Math.min(n-1,k+1)];return(q[j]-p[j])/(q[0]-p[0]);};
 const h00=2*u*u*u-3*u*u+1,h10=u*u*u-2*u*u+u,h01=-2*u*u*u+3*u*u,h11=u*u*u-u*u;
 return[h00*a[1]+h10*h*tan(i,1)+h01*b[1]+h11*h*tan(i+1,1),h00*a[2]+h10*h*tan(i,2)+h01*b[2]+h11*h*tan(i+1,2)];
}
/** the celebration afterwards: toward the near-side corner, arms out (inferred) */
const P_AFTER=along(PC,DIR,.9),CORNER:[number,number]=[-6,-31];
const CL=Math.hypot(CORNER[0]-P_AFTER[0],CORNER[1]-P_AFTER[1]);
function celebS(tau:number){const u=tau-T_RUN0;if(u<=0)return 0;const s=u<.6?7*u*u/1.2:7*(u-.3),a=CL-3.2;return s<a?s:a+3.2*(1-Math.exp(-(s-a)/3.2));}
function celebPos(tau:number):[number,number]{const s=celebS(tau)/CL;return[lerp(P_AFTER[0],CORNER[0],s),lerp(P_AFTER[1],CORNER[1],s)];}
const CELEB_YAW=yawTo(P_AFTER[0],P_AFTER[1],CORNER[0],CORNER[1]);
const lahmXZ=(tau:number):[number,number]=>tau<T_RUN0-.35?hermite(TRACK,tau):celebPos(tau);
const lahmVel=(tau:number):[number,number]=>{const a=hermite(TRACK,tau-.05),b=hermite(TRACK,tau+.05);return[(b[0]-a[0])*10,(b[1]-a[1])*10];};
/** the ball at each touch: just ahead of his right boot along his run */
const footAt=(tau:number):[number,number]=>{const p=hermite(TRACK,tau),v=lahmVel(tau),l=Math.hypot(v[0],v[1])||1,f:[number,number]=[v[0]/l,v[1]/l];return[p[0]+f[0]*.5-f[1]*.1,p[1]+f[1]*.5+f[0]*.1];};
const TP=TOUCHES.map(footAt);
/** the passer: an (unnumbered) team-mate infield and behind */
const PASSER:[number,number]=[TP[0][0]-7,TP[0][1]+12];
function ballAt(tau:number):V3{
 if(tau<T_PASS)return[PASSER[0]+.5,.11,PASSER[1]-.2];
 if(tau<T_RCV){const u=(tau-T_PASS)/(T_RCV-T_PASS),e=1-Math.pow(1-u,1.7),a:[number,number]=[PASSER[0]+.5,PASSER[1]-.2];return[lerp(a[0],TP[0][0],e),.11,lerp(a[1],TP[0][1],e)];}
 if(tau<T_CUT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<=0){const u=(tau-T_CUT)/-T_CUT,e=1-Math.pow(1-u,1.6);return[lerp(TP[4][0],B1[0],e),.11,lerp(TP[4][1],B1[2],e)];}
 if(tau<FLY)return flightU(uAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?TAU*1.6*(tau-T_PASS):TAU*9*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));
/** Lahm's dribble phase: the touch foot meets the ball (touchPhase) exactly at each touch, one stride between touches */
function lahmPhase(tau:number){
 if(tau<T_RCV)return touchPhase+(tau-T_RCV)*1.35;
 let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;
 if(k>=TOUCHES.length-1)return touchPhase+k+(tau-T_CUT)*1.5;
 return touchPhase+k+(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]);
}
const RUN_END=-STRIKE_CONTACT*SD;
function lahmPose(tau:number,it=0):Pose{
 const v=lahmVel(tau),sp=Math.hypot(v[0],v[1]);
 let p=tau<T_RCV-.25?runCycle(lahmPhase(tau),{speed:clamp((sp-2)/5)}):dribble(lahmPhase(tau),{foot:'r',speed:clamp(sp/7,.35,.8)});
 if(tau<T_RCV-.25)p=blendPose(p,dribble(lahmPhase(tau),{foot:'r',speed:.5}),sm(T_RCV-.6,T_RCV-.25,tau));
 // head up before the first touch (watching the pass come), then eyes on the ball and the defender
 if(tau<T_RCV)p.neckY+=(-40*(1-sm(T_RCV-.9,T_RCV-.2,tau)))*Math.PI/180;
 // the cut: sink, lean into the turn (to his right) and plant
 const cut=Math.sin(Math.PI*clamp((tau-(T_CUT-.35))/.65));if(cut>0){p.roll+=.28*cut;p.bend+=.16*cut;p.lean+=.12*cut;p.squash-=.05*cut;p.lKnee+=.3*cut;}
 if(tau>RUN_END-.12){const us=STRIKE_CONTACT+tau/SD;p=blendPose(p,strike(Math.min(1,us),{power:.95}),sm(RUN_END-.12,RUN_END+.04,tau));
  const lo=sm(RUN_END,-.05,tau)*(1-sm(.12,.5,tau));p.lean+=.1*lo;p.neckP+=.1*lo;}
 if(tau>T_RUN0-.35){const s=celebS(tau);p=blendPose(p,celebrate(s/4.3,{kind:'run'}),sm(T_RUN0-.35,T_RUN0+.25,tau));}
 p.neckP+=.03*Math.sin(it*2.2)*(tau<T_PASS?1:0);
 return p;
}
function lahmPlace(tau:number):Place{
 const[x,z]=lahmXZ(tau);
 if(tau>=T_RUN0-.35)return{x,z,yaw:lerpAng(YAW_K,CELEB_YAW,sm(T_RUN0-.35,T_RUN0+.3,tau))};
 const v=lahmVel(tau),sp=Math.hypot(v[0],v[1]);
 let yaw=sp>.5?Math.atan2(-v[1],v[0]):YAW_K;
 if(tau<T_RCV)yaw=lerpAng(yaw,yawTo(x,z,PASSER[0],PASSER[1]),.35*(1-sm(T_RCV-.8,T_RCV-.1,tau)));
 if(tau>RUN_END-.25)yaw=lerpAng(yaw,YAW_K,sm(RUN_END-.25,RUN_END,tau));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- Fonseca: closes Lahm down, his feet go from under him
/** he closes from infield onto the line of the carry, just goal-side and a little outside it; he goes down there and Lahm cuts inside him */
const FON_TRACK:[number,number,number][]=(()=>{const F0=along(along(CP,D1,.8),[D1[1],-D1[0]],1.3);
 return[[-8.6,F0[0]+3,F0[1]+8],[-5,F0[0]+2.6,F0[1]+6.5],[-3.2,F0[0]+1.2,F0[1]+2.6],[T_SLIP-.4,F0[0]+.2,F0[1]+.3],[T_SLIP,...F0],[T_SLIP+.5,F0[0]+.55,F0[1]-.05],[3,F0[0]+.6,F0[1]-.05]];})();
/** the slip: the planted foot shoots out, arms fly back; then down on his backside */
const SLIP=posed({pitch:-46,lHipF:40,rHipF:22,lKnee:14,rKnee:34,lAnk:-10,rAnk:-6,lShF:30,rShF:24,lShA:72,rShA:66,lElb:30,rElb:36,lean:16,neckP:30,air:.06});
const SAT=posed({lHipF:80,rHipF:72,lKnee:52,rKnee:84,lAnk:10,lean:18,pitch:-4,lShF:-60,rShF:-52,lShA:20,rShA:24,lElb:14,rElb:18,neckP:-6,neckY:30});
function fonsecaAt(tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=hermite(FON_TRACK,tau),a=hermite(FON_TRACK,tau-.05),b=hermite(FON_TRACK,tau+.05),sp=Math.hypot(b[0]-a[0],b[1]-a[1])*10,l=lahmXZ(tau);
 let p=blendPose(stand(),runCycle(tau*1.6,{speed:clamp((sp-1)/5)}),clamp(sp/2.5));
 // jockeying low as he closes, then the slip at T_SLIP, then sitting on the turf watching the ball go
 p=blendPose(p,posed({lHipF:30,rHipF:22,lKnee:44,rKnee:40,lean:22,pitch:4,lShA:26,rShA:26,lElb:40,rElb:40,neckP:10}),sm(T_SLIP-.9,T_SLIP-.4,tau)*.7);
 p=blendPose(p,SLIP,sm(T_SLIP-.12,T_SLIP+.12,tau));p=blendPose(p,SAT,sm(T_SLIP+.2,T_SLIP+.6,tau));
 if(tau>T_SLIP+.6){p.neckY=(20+25*sm(0,.8,tau))*Math.PI/180;p.lShF+=.03*Math.sin(it*2);}
 const yaw=tau<T_SLIP+.2?yawTo(x,z,l[0],l[1]):lerpAng(yawTo(x,z,l[0],l[1]),yawTo(x,z,-19,-13)+.3,.4);
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- everyone else
type Role='keeper'|'def'|'att'|'mid'|'passer';
type Actor={role:Role;st:AthleteStyle;x:number;z:number;phase:number;run?:[number,number];chase?:[number,number,number]};
const ACTORS:Actor[]=[
 {role:'keeper',st:KEEPER_ST,x:-.9,z:-1.3,phase:0},
 {role:'def',st:costaRica({number:5,build:{height:1.78},seed:31}),x:-15.5,z:-22,phase:.4,run:[2.5,1.6]},
 {role:'def',st:costaRica({number:4,build:{height:1.85},seed:32}),x:-13.2,z:-8.6,phase:.9,run:[1.4,1.2]},
 {role:'def',st:costaRica({number:3,skin:SKIN_D,build:{height:1.82},seed:33}),x:-12.4,z:-2.4,phase:.5,run:[1.2,.4]},
 {role:'def',st:costaRica({number:20,build:{height:1.84},seed:34}),x:-12.8,z:3.6,phase:.2,run:[1,-.4]},
 {role:'def',st:costaRica({number:12,build:{height:1.75},seed:35}),x:-15.5,z:11.5,phase:.7,run:[1.4,-1]},
 {role:'mid',st:costaRica({number:8,build:{height:1.76},seed:36}),x:-22.5,z:-4.5,phase:.3,run:[1.5,-1.8]},
 {role:'mid',st:costaRica({number:10,build:{height:1.72},seed:37}),x:-26,z:5,phase:.8,run:[2,-1.5]},
 {role:'att',st:germany({number:11,build:{height:1.82},seed:41}),x:-14.4,z:-4.6,phase:.2,run:[3,1.2],chase:[.25,-.6,1.2]},
 {role:'att',st:germany({number:20,build:{height:1.82},seed:42}),x:-14.8,z:2.2,phase:.7,run:[3.2,-.5],chase:[.45,-1.6,-1]},
 {role:'att',st:germany({number:7,build:{height:1.83},hair:[Y,.8],seed:43}),x:-19,z:-27,phase:.35,run:[4.5,1.5],chase:[.15,-1,.6]},
 {role:'att',st:germany({number:19,build:{height:1.76},seed:44}),x:-21,z:17,phase:.85,run:[2.5,-1.5]},
 {role:'mid',st:germany({number:18,build:{height:1.9},seed:45}),x:-30,z:4,phase:.6,run:[2.5,-.6]},
 {role:'passer',st:germany({number:null,build:{height:1.82},seed:46}),x:PASSER[0]-.3,z:PASSER[1]+.25,phase:.1},
];
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const JUMP=posed({lHipF:30,rHipF:26,lKnee:60,rKnee:54,lAnk:40,rAnk:40,lShA:70,rShA:70,lShF:40,rShF:40,lElb:40,rElb:40,lean:-4,air:.3,neckP:-40});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const CD:[number,number]=[(CORNER[0]-P_AFTER[0])/CL,(CORNER[1]-P_AFTER[1])/CL];
function chaseEnd(a:Actor):[number,number]{const[,al,sd]=a.chase??[0,0,0];return[CORNER[0]+CD[0]*al-CD[1]*sd,CORNER[1]+CD[1]*al+CD[0]*sd];}
/** the drift every outfield player makes during the move: a steady jog of `run` metres (x, z) between the pass and the strike */
function driftAt(a:Actor,tau:number):[number,number]{const u=sm(T_PASS,0,tau,linear),[rx,rz]=a.run??[0,0];return[a.x+rx*u,a.z+rz*u];}
function chaseS(a:Actor,tau:number,start:[number,number]){const E=chaseEnd(a),L=Math.hypot(E[0]-start[0],E[1]-start[1]),u=tau-1.4-(a.chase?.[0]??0);if(u<=0)return 0;const s=u<.6?6.8*u*u/1.2:6.8*(u-.3),b=Math.max(0,L-3);return s<b?s:b+(L-b)*(1-Math.exp(-(s-b)/Math.max(.1,L-b)));}
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const bp=ballAt(Math.max(-7,Math.min(tau,FLY))),br=Math.sin(it*2.1+a.phase*TAU),[x,z]=driftAt(a,Math.min(tau,.4)),toBall=yawTo(x,z,bp[0],bp[2]);
 const moving=!!a.run&&tau>T_PASS&&tau<.4,runP=moving?runCycle(tau*1.45+a.phase,{speed:.35}):null;
 if(a.chase&&tau>1.3){const w=sm(1.3,1.8,tau),st:[number,number]=[x,z],q=(tt:number):[number,number]=>{const E=chaseEnd(a),L=Math.hypot(E[0]-st[0],E[1]-st[1])||1,u=chaseS(a,tt,st)/L;return[lerp(st[0],E[0],u),lerp(st[1],E[1],u)];};
  const p0=q(tau),p1=q(tau+.06),sp=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])/.06,dist=chaseS(a,tau,st);
  let pose=blendPose(runCycle(dist/4.4+a.phase,{speed:clamp(sp/7)}),celebrate(it*.9+a.phase,{kind:'arms'}),clamp(1-sp/2.2));
  pose=blendPose(blendPose(DEF_P,stand(),.4),pose,w);
  return{pose,place:{x:p0[0],z:p0[1],yaw:sp>1.2?yawTo(p0[0],p0[1],p1[0],p1[1]):yawTo(p0[0],p0[1],...lahmXZ(tau))}};}
 switch(a.role){
  case 'keeper':{
   // set, a shuffle across as Lahm cuts in, then the leap to his LEFT (+z) toward the top corner: too high, too far
   let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.5,-.12,tau));
   const dv=clamp((tau-.32)/1.2);if(tau>.32)p=blendPose(p,keeperDive(dv,{side:'l',height:1}),sm(.32,.4,tau));
   if(tau>1.9)p=blendPose(p,SLUMP,sm(1.9,2.6,tau)*.7);
   const sh=.9*sm(T_CUT,-.1,tau),yaw=lerpAng(yawTo(a.x,a.z+sh,bp[0],bp[2]),Math.PI,sm(.15,.4,tau));
   return{pose:p,place:{x:a.x,z:a.z+sh,yaw}};}
  case 'passer':{
   // the lay-off: a side-foot pass out to Lahm, then a jog forward in support
   const k=clamp((tau-(T_PASS-.52))/1.2);let p=blendPose(blendPose(stand(),DEF_P,.3+.2*br),strike(k,{power:.35}),sm(T_PASS-.62,T_PASS-.45,tau)*(1-sm(T_PASS+.3,T_PASS+.7,tau)));
   if(tau>T_PASS+.5)p=blendPose(p,runCycle((tau-T_PASS)*1.4,{speed:.3}),sm(T_PASS+.5,T_PASS+.9,tau));
   const fwd=tau>T_PASS+.5?Math.min(5,(tau-T_PASS-.5)*2.6):0,yaw0=yawTo(a.x,a.z,TP[0][0],TP[0][1]);
   return{pose:p,place:{x:a.x+fwd*.9,z:a.z-fwd*.3,yaw:lerpAng(yaw0,yawTo(a.x,a.z,0,-4),sm(T_PASS+.4,T_PASS+.9,tau))}};}
  case 'def':case 'mid':{
   let p=blendPose(DEF_P,stand(),.3+.2*br);p.air+=.012*Math.max(0,br);if(runP)p=blendPose(p,runP,.55);
   // the ones under the flight jump for it; heads follow the ball
   const d=Math.hypot(x-flightU(.35)[0],z-flightU(.35)[2]);if(d<3.2){const j=Math.sin(Math.PI*clamp((tau-.1)/.55));if(j>0)p=blendPose(p,JUMP,j*.8);}
   if(tau>1.3)p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.6);
   return{pose:p,place:{x,z,yaw:toBall}};}
  default:{let p=blendPose(stand(),DEF_P,.4+.2*br);if(runP)p=blendPose(p,runP,.8);
   if(tau>.05){p=blendPose(p,runCycle((tau-.05)*1.3+a.phase,{speed:.5}),sm(.05,.35,tau)*(1-sm(1.1,1.4,tau)));}
   const run=tau>.05?Math.min(2,(tau-.05)*3):0,toGoal=yawTo(x,z,0,0);
   return{pose:p,place:{x:x+run*Math.cos(toGoal),z:z-run*Math.sin(toGoal),yaw:lerpAng(toBall,toGoal,sm(0,.6,tau))}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?, cast?): athlete.ts figure; prev = the pose one drawn frame earlier
 * (secondary motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the cut, the strike, the run); cast = Lahm's
 * protective cast on his LEFT forearm (a paper sleeve between elbow and wrist, only when the figure is big enough to read it). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false,cast=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const r=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(cast&&r.detail!=='low'&&r.heightPx>60){const e=r.joints.lEl,h=r.joints.lHa,a:Pt=[lerp(e[0],h[0],.3),lerp(e[1],h[1],.3)],b:Pt=[lerp(e[0],h[0],.86),lerp(e[1],h[1],.86)],w=Math.max(3,r.heightPx*.034);
  if(Math.hypot(b[0]-a[0],b[1]-a[1])>w*.6){const p=ribbon([a,b],w*2,{taper:0,wobble:0});s.knockout(p);s.stroke(K,p,Math.max(1.4,w*.22),.9);}}
 return r;
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
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=lahmPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=lahmPose(tp,e.it),prev={pose:lahmPose(tpp,e.it-1/12),place:lahmPlace(tpp)};
  drawPlayer(s,pose,c,detailFor(LAHM_ST,d,true),pl,prev,!!e.smear&&((tp>T_CUT-.3&&tp<T_CUT+.25)||(tp>RUN_END+.2&&tp<.45)||tp>T_RUN0+.2),true);}});}
 {const cur=fonsecaAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=fonsecaAt(tpp,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(FONSECA_ST,d,true),cur.place,prev,!!e.smear&&tp>T_SLIP-.15&&tp<T_SLIP+.35);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpp,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='keeper'),cur.place,prev,!!e.smear&&a.role==='keeper'&&tp>.3&&tp<1.3);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const lxz=(tau:number,y=0):V3=>{const p=lahmXZ(tau);return[p[0],y,p[1]];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** the strike lands between "cuts inside" and "curls it"; the ball reaches the net just after "Goal"; real time throughout */
const tS1=()=>Math.max(CUE(0,'Goal')-IN_NET+.15,CUE(0,'Lahm cuts')-T_CUT-.1);
const T_WAIT=-8.4;
const tau1=(t:number)=>Math.max(T_WAIT,t-tS1());
const P1:V3=[-24,16,-62];
function cam1(t:number):Cam{
 const tau=tau1(t),hero=():V3=>{const b=ballAt(Math.min(tau,0));return add3(mix3(lxz(tau),[b[0],0,b[2]],.4),[0,.9,0]);};
 return plan(t,[
  [0,0,()=>({P:P1,T:[-26,0,-4],fov:40})],
  [CUE(0,'the first')-.2,1.6,()=>({P:P1,T:[-20,4,30],fov:30})],
  [CUE(0,"Germany's")-.3,1.3,()=>({P:P1,T:hero(),fov:13})],
  [CUE(0,'has the ball')-.2,1,()=>({P:P1,T:hero(),fov:9})],
  [CUE(0,'defender')-.35,.8,()=>({P:P1,T:hero(),fov:8})],
  [tS1()-.25,.9,()=>({P:P1,T:[-10,1.2,-5],fov:21})],
  [tS1()+FLY-.3,.8,()=>({P:P1,T:[-1.5,1.4,1],fov:12})],
  [tS1()+T_RUN0+.4,1.4,()=>({P:P1,T:add3(lxz(tau),[0,1,1]),fov:13})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal'),tN=tS1()+IN_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(Math.max(g,tN),Math.max(g,tN)+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:15,lines:true,prevT:tau1(t-.06),hero:'mid'});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind Lahm: the cut, the curl
const tau2=(t:number)=>key(t,mono([[0,-2.45],[CUE(1,'One sharp'),T_CUT-.2],[CUE(1,'his right'),-.3],[CUE(1,'It starts')-.3,.04],[CUE(1,'It starts')+.4,tauAtU(.4)],[CUE(1,'bends back'),tauAtU(.85)],[SECS(1)-.9,IN_NET+.1],[SECS(1),IN_NET+.8]]),linear);
/** behind and left of the carry, head-height: the cut comes toward the lens and turns across it, then the flight runs away from it */
const E2:V3=(()=>{const p=along(along(CP,D1,-9.5),[D1[1],-D1[0]],2.2);return[p[0],2.1,p[1]];})();
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>{const l=lxz(Math.min(tau,0),.8);return{P:E2,T:mix3(l,LOC(B1,5,.5,.9),sm(T_CUT,.1,tau,easeInOutSine)*.5),fov:lerp(24,32,sm(T_CUT,0,tau))};}],
  [CUE(1,'It starts')-.25,.9,()=>({P:add3(E2,[0,.8,0]),T:add3(flightU(.6),[0,-.2,0]),fov:18})],
  [CUE(1,'bends back')-.25,.9,()=>({P:add3(E2,[0,.8,0]),T:mix3([-.3,1.8,2.4],b,.2),fov:10})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the bend so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.7),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/Math.max(NEAR,q[2])*1.2),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · the reverse-angle replay from behind the goal: Porras leaps, too low
const tau3=(t:number)=>key(t,mono([[0,-.5],[CUE(2,'From behind')+.5,.02],[CUE(2,'keeper leaps'),.45],[CUE(2,'too high'),FLY-.15],[CUE(2,'Top corner'),IN_NET],[SECS(2),IN_NET+.9]]),linear);
/** low behind the far post (below the bar): the ball in the top corner reads clearly ABOVE the leaping keeper */
const E3:V3=[5.6,1.45,8.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([-14,1.3,-11],b,.35*sm(0,.5,tau)),fov:34})],
  [CUE(2,'keeper leaps')-.3,.9,()=>({P:add3(E3,[-.8,0,-.6]),T:[-2.5,1.4,.8],fov:22})],
  [CUE(2,'Top corner')-.35,.9,()=>({P:add3(E3,[-1.2,0,-.9]),T:[-.4,1.6,2],fov:17})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tC=CUE(2,'Top corner');
  stadium(s,c,t,[2,3],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.6),Math.min(tau,FLY+.001),18),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // "Top corner!": a yellow burst where it went in
  const hit=sm(tC-.05,tC+.35,t);if(hit>0&&hit<1){const q=pr(c,[0,2.1,2.95]);if(q)sparkBurst(s,Y,q[0],q[1],90+150*hit,{n:10,seed:23,g:easeOutBack(hit),width:12});}
 },
 aperture(t){const c=cam3v(t),P=ballAt(Math.min(tau3(t),IN_NET)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/Math.max(NEAR,q[2])*1.3),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a full-back up the wing → cut inside onto the stronger foot → curl it into the far corner
const tau4=(t:number)=>key(t,mono([[0,T_RCV-.3],[CUE(3,'Full-backs')+.2,T_RCV],[CUE(3,'Cut inside')-.1,T_CUT-.35],[CUE(3,'Cut inside')+.7,T_CUT+.25],[CUE(3,'stronger'),-.45],[CUE(3,'then curl')+.2,.003],[CUE(3,'far corner'),FLY-.08],[SECS(3),IN_NET+.4]]),linear);
/** high behind the attack, over Lahm's left shoulder, the whole corner of the pitch and the goal in one frame */
const E4:V3=[-60,19,-45];
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E4,T:[-35,0,-21],fov:27})],
  [CUE(3,'Cut inside')-.4,1,()=>({P:[-37,8,-29],T:[CP[0],.4,CP[1]],fov:30})],
  [CUE(3,'then curl')-.35,1.1,()=>({P:LOC(B1,-6,-1.2,6.5),T:LOC(B1,15,1.5,1),fov:40})],
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
/** a flat ring on the grass (or upright in the goal mouth) */
function ring3(s:Sheet,c:Cam,ctr:V3,r:number,upright:boolean,grow:number,ink:string,seed:number){
 const pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,upright?[ctr[0],ctr[1]+Math.sin(a)*r*grow,ctr[2]+Math.cos(a)*r*grow]:[ctr[0]+Math.cos(a)*r*grow,ctr[1],ctr[2]+Math.sin(a)*r*grow]);if(p)pts.push(p);}
 if(pts.length>20){const rr=ribbon(pts,Math.max(5,kAt(c,ctr)*.08),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9);s.fill(ink,rr,.95);}
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tB=CUE(3,'Full-backs'),tI=CUE(3,'Cut inside'),tS=CUE(3,'stronger'),tC=CUE(3,'then curl'),tF=CUE(3,'far corner');
  stadium(s,c,t,[0,1]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · "Full-backs can attack too!": the left-back's lane up the wing, from his own half to where he took the ball (red, dashed)
  const fb=sm(tB-.1,tB+.8,t)*(1-sm(tC-.6,tC-.2,t));
  if(fb>.02){const a=along(TP[0] as [number,number],D1,-17),b=TP[0],pts:V3[]=[];for(let i=0;i<=10;i++){const u=i/10*fb;pts.push([lerp(a[0],b[0],u),.3,lerp(a[1]-2.5,b[1],u)]);}
   arrow3(s,c,pts,Math.max(8,kAt(c,[b[0],0,b[1]])*.5),R,.95);}
  // 2 · "Cut inside": the cut arrow, from the carry into the turn and across the top of the box
  const ci=sm(tI-.15,tI+.6,t,easeOut)*(1-sm(tC-.4,tC,t));
  if(ci>.02){const P0=along(CP,D1,-3.5),pts:V3[]=[];for(let i=0;i<=12;i++){const u=i/12*ci,tt2=lerp(-2.0,-.3,u),p=hermite(TRACK,tt2);pts.push([p[0],.3,p[1]]);}void P0;
   arrow3(s,c,pts,Math.max(9,kAt(c,B1)*.3),R,.95);}
  // 3 · "stronger foot": a yellow ring round his right boot as he sets to strike
  const sf=sm(tS-.1,tS+.4,t,easeOutBack)*(1-sm(tC+.3,tC+.8,t));
  if(sf>.02){const pl=lahmPlace(tp),sk=solve(lahmPose(tp,tt),LAHM_B,pl);ring3(s,c,[sk.rToe[0],.05,sk.rToe[2]],.55,false,sf,Y,41);}
  // 4 · the curl (the real bend so far, yellow)
  if(tau>0){const pts=partial(pathPts(c,0,FLY,40),clamp(tau/FLY)),w=Math.max(10,kAt(c,flightU(.5))*.24);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95);}}
  // where it was heading with no curl (straight on, red dashes over the bend): wide of the far post
  const cv=sm(tC-.1,tC+.6,t);
  if(cv>.02){const str=new Path2D(),n=18;for(let i=0;i<n;i+=2){const a=pr(c,straightU(i/n*cv*1.05)),b=pr(c,straightU((i+1)/n*cv*1.05));if(a&&b)str.addPath(ribbon([a,b],Math.max(18,kAt(c,straightU(i/n))*.26),{taper:.25,wobble:0}));}
   s.knockout(str);s.fill(R,str,.95);s.stroke(K,str,1.6,.8);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // 5 · "far corner": a ring on the far top corner
  const dn=sm(tF-.05,tF+.5,t,easeOutBack);
  if(dn>.02)ring3(s,c,TGT,.5,true,dn,Y,43);
 },
 still:9,
};

const film:RisoStory={
 id:'lahm-costa-rica-2006',format:'11v11',title:"Lahm's curler v Costa Rica",
 theme:'Full-backs can attack too: cut inside onto your stronger foot and curl it into the far corner',
 ageNote:'Germany 4–2 Costa Rica, the opening match of the 2006 World Cup, Allianz Arena, Munich, 9 June 2006. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a cut and a curler — a short red cut arrow, then a path that swings out and bends back, a spinning ball on its tip. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+30+90*k-150*k*k,y-260*k+120*k*k]);}
  s.fill(R,ribbon([[x-60,y+40],[x-20,y+26],[x+30,y]],10,{seed,taper:.6,wobble:.6}),.9*fade);
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x+30,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],34,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
