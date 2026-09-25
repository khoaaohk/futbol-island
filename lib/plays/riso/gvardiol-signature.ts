/** Joško Gvardiol — signature: carrying the ball out of defence. Fulham 0–4 Manchester City, Premier League (matchday 37), Craven
 * Cottage, London, Saturday 11 May 2024 (12:30 BST kick-off, a sunny afternoon): City's opening goal in the 13th minute. An iconic-play
 * riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a
 * riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "carrying the ball out of defence", lesson "when there's space in
 * front of you, a defender can dribble forward and start the attack"): the Guardian's report calls this goal by the left-back "a monument
 * to running power, strength and elegance"; he "drove inside from the left", played a give-and-go with De Bruyne and finished it himself.
 * Fulham's manager named the exact trait: "pass and go from the left back ... we should have been more aggressive in that moment, disrupt
 * the run of Gvardiol". A defender seeing space, carrying the ball into it and starting the attack is the whole signature in one move.
 *
 * SOURCES (fetched Sept 2026 with a generic UA, cached under the session scratchpad films/src-cache/):
 *  - The Guardian, Nick Ames, "Manchester City march a step closer to title as Gvardiol double downs Fulham", 11 May 2024:
 *    "His opener was a monument to running power, strength and elegance"; "No forward would have sniffed at the 13th minute goal ...
 *    after driving inside, he took a return pass from Kevin De Bruyne and evaded Issa Diop with an immaculate first touch. Now he had space
 *    to beat Bernd Leno and did so with a carefully rolled right-footed finish from 15 yards"; "The left-back, a converted central
 *    defender"   https://www.theguardian.com/football/article/2024/may/11/fulham-manchester-city-premier-league-match-report
 *    (cache: guardian-ful-mci-2024-report.txt)
 *  - The Guardian, Barry Glendenning, "Fulham 0-4 Manchester City: Premier League – as it happened" (two pages): 13 min "Josko Gvardiol
 *    cuts in from the left, plays a lovely give-and-go with Kevin De Bruyne and rolls the ball past Bernd Leno and into the bottom corner
 *    after completely wrong-footing Fulham defender Issa Diop with a lovely first touch"; 15 min "14 or 15 passes in the build-up ... The
 *    left back drove inside from the left playing a give-and-go with De Bruyne. As the Croatian made a curling run into the box to collect
 *    the return pass, he took out Diop with a terrific bit of control and then rolled a precise right-foot effort past Leno"; 19 min "19
 *    passes in the build-up ... Erling Haaland and Ederson the only City players who didn't get involved"; Marco Silva: "pass and go from
 *    the left back"; both line-ups; referee Anthony Taylor; "a beautifully sunny day beside the Thames. The pitch has been watered"; the
 *    City fans' Poznan "behind the goal into which Gvardiol has just scored" (his SECOND goal, 71 min)
 *    https://www.theguardian.com/football/live/2024/may/11/fulham-v-manchester-city-premier-league-live-score-updates
 *    (cache: guardian-ful-mci-2024-live.txt, guardian-ful-mci-2024-live-p2.txt)
 *  - Wikipedia, "Joško Gvardiol" (raw): left-footed, converted centre-back, the Fulham brace, "carry the ball forward when space presents
 *    itself"; club number 24   (cache: wiki-josko-gvardiol.txt)
 *  - Wikipedia, "2023–24 Fulham F.C. season" (raw): 11 May 2024, 0–4, Gvardiol 13' and 71', Craven Cottage, att. 24,418, referee Anthony
 *    Taylor; home kit template white shirt, black shorts, black socks; squad numbers (Leno 17, Castagne 21, Diop 31, Bassey 3, Robinson 33)
 *    (cache: wiki-2023-24-fulham-season.txt)
 *  - Wikipedia, "2023–24 Manchester City F.C. season" (raw): home kit template sky blue shirt, white shorts, sky blue socks; Gvardiol took
 *    the 24 shirt   (cache: wiki-2023-24-mancity-season.txt)
 * CONFIRMED by those accounts: match, date, ground, score, the 13th-minute opener; a long City passing move before it; Gvardiol (left-back,
 * number 24, left-footed) drove INSIDE from the LEFT, passed to De Bruyne and kept running (give-and-go / pass and go), made a curling run
 * into the box, took the return pass, wrong-footed Issa Diop with his first touch and rolled a RIGHT-FOOTED finish from about 15 yards past
 * Bernd Leno into the bottom corner; the sunny, watered pitch; Fulham's white shirts and black shorts and socks (home template); City's
 * sky-blue home template (white shorts).
 * INFERRED (illustrative, and kept OUT of the narration): that City wore the home kit that day (no colour clash with Fulham's white, so
 * very likely); every exact position, speed and timing; who passed to Gvardiol first (Kovačić here) and where the carry began (just inside
 * Fulham's half on the left); that his carry touches, the pass and the first touch were with his LEFT foot; which bottom corner (the FAR
 * post here, rolled across Leno); Leno's late dive; where each other player stood; the celebration; the direction of play on screen — City
 * attack LEFT to RIGHT from the main camera, toward the Hammersmith End (deduced: the away fans' Poznan was behind the goal of his
 * second-half goal, i.e. the Putney End, so in the first half City attacked the other end) — which puts Gvardiol on the FAR side; the
 * main camera in the Johnny Haynes Stand; the stands' shapes (a big modern Riverside Stand opposite, covered single-tier ends, the white
 * Cottage pavilion in the Putney End / Johnny Haynes corner — general knowledge, not re-verified this session); keeper and referee kits;
 * trim and number inks; the ball print; crowd colours.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time, panning with the ball from Kovačić's pass
 * to the net; ch2 = the slow-motion replay from a low camera in front of him: the open grass ahead of him (yellow), the Fulham players
 * standing off (red rings), his drive (red arrow), then pass and go (the pass, his sprint, the ball back); ch3 = a second replay angle from
 * BEHIND FULHAM'S GOAL: the first touch past Diop, the right foot, the roll past Leno, then the celebration; ch4 = the lesson, a low front
 * camera on the carry (space in front, a defender's run from the back, dribble forward, start the attack). All figures are the shared riso
 * athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Full-sheet card-window framing (1.45:1 to square),
 * never sheet.safe. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random
 * value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). Every cue starts
 * with a plain word (Kokoro splits contractions and hyphens). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:"Craven Cottage, 2024, against Fulham. Manchester City's left-back Joško Gvardiol sees space. He carries the ball forward, passes to Kevin De Bruyne, keeps running. It comes back, one touch... goal!",seconds:14.6,
  cues:[[.2,'Craven Cottage'],[2.1,'against Fulham'],[3.3,'Manchester'],[5.2,'Gvardiol sees space'],[6.6,'He carries'],[8.2,'passes to Kevin'],[9.8,'keeps running'],[11,'It comes back'],[12.1,'one touch'],[13.2,'goal']]},
 {label:'Watch it again',text:'Watch again, slowly. Nobody closes him down, so he drives into the open grass. Then pass and go: give it, sprint, get it back.',seconds:10.2,
  cues:[[.15,'Watch again'],[1.8,'Nobody closes'],[3.4,'drives into'],[4.3,'open grass'],[5.4,'Then pass and go'],[6.8,'give it'],[7.5,'sprint'],[8.2,'get it back']]},
 {label:'The finish',text:'His first touch fools Issa Diop. His right foot rolls it past Bernd Leno.',seconds:7.6,
  cues:[[.15,'His first touch'],[1.1,'fools Issa Diop'],[2.4,'His right foot'],[3.3,'rolls it'],[3.9,'past Bernd Leno']]},
 {label:'Your turn',text:'Your turn: when there is space in front of you, even a defender can dribble forward and start the attack!',seconds:8,
  cues:[[.15,'Your turn'],[1,'when there is space'],[2,'in front of you'],[3,'even a defender'],[4.1,'dribble forward'],[5.3,'start the attack']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py gvardiol-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/gvardiol-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-gvardiol-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/gvardiol-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('gvardiol: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys forced monotone in time (a recorded voice can squeeze cue gaps) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre at z0 units per world unit (the engine's
 * arrival scale is kept, so passages and seams behave as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (City attack +X toward the Hammersmith End, Fulham's goal line at 105),
 * Y up, Z across (0 = the middle, +34 = the near touchline under the main camera, −34 = the Riverside side). A figure facing +X has its
 * right side at +Z, so City's LEFT flank (Gvardiol) is the far side. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (cameras inside the ground cull the stand they sit in) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
const addPoly=(path:Path2D,q:Pt[]|null)=>{if(q&&q.length>2)path.addPath(polyPath(q,true));};

// ---------------------------------------------------------------- Craven Cottage: four separate stands and the Cottage in the corner
/** a stand: a baseline along the pitch edge (P0 → P1), an outward direction n, the seating rake (front d0,y0 → back d1,y1), the back wall
 * top, the roof (front → back) and who sits there (City's fans in the Putney End) */
type StandDef={P0:[number,number];P1:[number,number];n:[number,number];slices:number;seat:[number,number,number,number];back:number;roof:[number,number,number,number];away?:boolean};
const STANDS:StandDef[]=[
 {P0:[-6,-40],P1:[111,-40],n:[0,-1],slices:14,seat:[0,1.2,24,17],back:24,roof:[-1,26,27,28]},// the Riverside Stand (big, modern)
 {P0:[111,37],P1:[111,-37],n:[1,0],slices:8,seat:[0,1,15,9.5],back:12.5,roof:[-.5,13.5,17,14.6]},// the Hammersmith End
 {P0:[-6,-37],P1:[-6,30],n:[-1,0],slices:8,seat:[0,1,14,9],back:12,roof:[-.5,12.8,16,13.8],away:true},// the Putney End (away fans)
 {P0:[-3,40],P1:[109,40],n:[0,1],slices:12,seat:[0,1,14,9],back:12,roof:[-.5,12.6,16,14]},// the Johnny Haynes Stand (main camera side)
];
type Built={seat:V3[][];back:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number;away:boolean}[]};
const GROUND:Built=(()=>{const o:Built={seat:[],back:[],roof:[],fascia:[],seats:[]};
 STANDS.forEach((st,si)=>{const P=(u:number,d:number,y:number):V3=>[st.P0[0]+(st.P1[0]-st.P0[0])*u+st.n[0]*d,y,st.P0[1]+(st.P1[1]-st.P0[1])*u+st.n[1]*d];
  const[d0,y0,d1,y1]=st.seat,[r0,ry0,r1,ry1]=st.roof;
  for(let i=0;i<st.slices;i++){const u0=i/st.slices,u1=(i+1)/st.slices;
   o.seat.push([P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)]);
   o.back.push([P(u0,d1,y1),P(u1,d1,y1),P(u1,d1,st.back),P(u0,d1,st.back)]);
   o.roof.push([P(u0,r0,ry0),P(u1,r0,ry0),P(u1,r1,ry1),P(u0,r1,ry1)]);
   o.fascia.push([P(u0,r0,ry0-1.3),P(u1,r0,ry0-1.3),P(u1,r0,ry0),P(u0,r0,ry0)]);
   const rows=si===0?9:6;for(let r=0;r<rows;r++)for(let k=0;k<4;k++){const h=hash(si*7919+i*977+r*31+k*7,11);if(h<.14)continue;
    const w=(r+.5)/rows,u=u0+(u1-u0)*(k+.5+(hash(i+r*13+k+si*101,4)-.5)*.5)/4;o.seats.push({P:P(u,lerp(d0,d1,w),lerp(y0,y1,w)+.4),h,away:!!st.away&&hash(si+i*3+r*5+k,9)<.85});}}});
 return o;})();
/** the Cottage: a white two-storey pavilion with a pitched roof in the Putney End / Johnny Haynes corner (x −15..−5, z 31..41) */
const COT={x0:-15,x1:-5,z0:31,z1:41,h:8.5,ridge:11.5};
function cottage(s:Sheet,c:Cam){
 const{x0,x1,z0,z1,h,ridge}=COT,zm=(z0+z1)/2,walls=new Path2D(),roof=new Path2D(),win=new Path2D();
 for(const q of [[[x0,0,z0],[x1,0,z0],[x1,h,z0],[x0,h,z0]],[[x1,0,z0],[x1,0,z1],[x1,h,z1],[x1,h,z0]],[[x0,0,z0],[x0,0,z1],[x0,h,z1],[x0,h,z0]],
  [[x1,h,z0],[x1,ridge,zm],[x1,h,z1]],[[x0,h,z0],[x0,ridge,zm],[x0,h,z1]]] as V3[][])addPoly(walls,quadP(c,q,10));
 addPoly(roof,quadP(c,[[x0-.4,h,z0-.4],[x1+.4,h,z0-.4],[x1+.4,ridge,zm],[x0-.4,ridge,zm]],10));addPoly(roof,quadP(c,[[x0-.4,h,z1+.4],[x1+.4,h,z1+.4],[x1+.4,ridge,zm],[x0-.4,ridge,zm]],10));
 for(let k=0;k<4;k++)for(const y of [2,5.4]){const x=x0+1.2+k*2.3;addPoly(win,quadP(c,[[x,y,z0-.05],[x+1.1,y,z0-.05],[x+1.1,y+1.8,z0-.05],[x,y+1.8,z0-.05]],10));}
 const bal=new Path2D();seg3(c,[x0,4.1,z0-.6],[x1,4.1,z0-.6],.25,bal);
 s.knockout(walls);s.tone(Y,walls,.12);s.tone(K,walls,.06);s.fill(K,win,.8);s.knockout(roof);s.fill(K,roof,.62);s.fill(R,roof,.25);s.fill(K,bal,.85);}
/** everything behind the pitch: the sunny sky, the stands and their crowds (roar lifts the seat marks, flash = phones and cameras) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 // a bright May lunchtime: pale blue sky, a warm haze near the horizon
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.24);
 const haze=new Path2D();haze.rect(-1e4,-v.hy*.4,2e4,1e4);s.tone(Y,haze,.16);
 const seat=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<GROUND.seat.length;i++){addPoly(seat,quadP(c,GROUND.seat[i]));addPoly(back,quadP(c,GROUND.back[i]));addPoly(roof,quadP(c,GROUND.roof[i],10));addPoly(fas,quadP(c,GROUND.fascia[i],10));}
 s.knockout(back);s.tone(K,back,.55);s.tone(B,back,.3);
 s.knockout(seat);s.tone(K,seat,.45);s.tone(B,seat,.25);
 // the crowd: Fulham white and black at home, City sky blue in the Putney End, a few yellow sun-hats
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of GROUND.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.away?(q.h<.8?2:0):q.h<.5?0:q.h<.82?1:q.h<.92?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(K,inks[1],.85);s.fill(B,inks[2],.5);s.fill(Y,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.72);s.tone(B,roof,.3);
 s.knockout(fas);s.fill(K,fas,.3);
 cottage(s,c);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<14;i++){const q=GROUND.seats[Math.floor(hash(i*17+T12*101,3)*GROUND.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the watered, sunlit grass (yellow × blue) with mowing stripes, LED boards, paper lines, corner flags and both goals (Fulham's goal drawn
 * later when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-6,0,-40],[111,0,-40],[111,0,40],[-6,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.85);s.tone(B,p,.85);s.tone(K,p,.2);}
 const g=polyP(c,[[-4,0,-37],[109,0,-37],[109,0,37],[-4,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]));s.tone(K,st,.1);
 // boards: along the far touchline and behind both goals (navy LED boards with blue and paper panels, generic)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-38],[109,0,-38],[109,.9,-38],[-4,.9,-38]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-37.95],[x+3.4,.25,-37.95],[x+3.4,.65,-37.95],[x,.65,-37.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));addPoly(pn,polyP(c,[[-3.45,.25,z],[-3.45,.25,z+3.4],[-3.45,.65,z+3.4],[-3.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(B,pn,.5);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const[x,z] of [[0,-34],[0,34],[105,-34],[105,34]] as Pt[]){seg3(c,[x,0,z],[x,1.55,z],.05,pole);addPoly(flag,polyP(c,[[x,1.55,z],[x,1.2,z],[x+(x?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]];
const SKY:InkFill=[B,.42];
/** Manchester City 2023–24 home (template confirmed; worn that day inferred): sky-blue shirt, white shorts, sky-blue socks; navy numbers and trim inferred */
const MCI=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:SKY,shorts:'paper',socks:SKY,boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:K,seed:3,...o});
/** Fulham 2023–24 home (confirmed template): white shirt, black shorts, black socks; black numbers and trim inferred */
const FUL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.95],socks:[K,.95],boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:K,seed:5,...o});
/** Gvardiol: number 24, tall and powerful, short dark hair; left-footed */
const G24=MCI({number:24,hair:[K,.85],build:{height:1.85,bulk:1.06,thighs:1.1},seed:24});
const KDB17=MCI({number:17,hair:[Y,.9],build:{height:1.81},seed:17});
/** Bernd Leno: keeper kit inferred (yellow), long sleeves, gloves */
const LENO:AthleteStyle={shirt:[Y,.85],shorts:[Y,.85],socks:[Y,.85],boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:17,numberInk:K,build:{height:1.9},seed:41};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'balding',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Gvardiol's first touch of the carry)
type Role='g'|'mci'|'ful'|'gk'|'ref';
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The beats the accounts give (the drive inside from the left, the give-and-go
 * with De Bruyne, the curling run into the box, the first touch past Diop, the rolled right-foot finish past Leno) are kept; every exact
 * spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Gvardiol',role:'g',style:G24,key:true,keys:[[-3.8,53,-30],[-2,56,-28.2],[-1,58.4,-26.6],[0,60.4,-25.2],[1,65,-22.6],[2,69.6,-19.8],[3,73.8,-17],[3.45,75.6,-16],[4,78.4,-15.3],[4.6,81.6,-14.8],[5.2,84.9,-13.6],[5.8,88.1,-11.6],[6.3,90.5,-9.5],[6.65,91.6,-8.1],[6.95,92.3,-7.3],[7.4,93.6,-6.9],[8.2,95.6,-8.4],[9.2,97.4,-12],[10.5,98.4,-16.5],[12,98.8,-20]]},
 {name:'De Bruyne',role:'mci',style:KDB17,key:true,keys:[[-3.8,71,-3.5],[-1,74,-4.5],[1.5,77.5,-6],[3,79.4,-6.9],[3.9,80.2,-7.2],[4.4,80.6,-7.3],[5.2,81,-7.4],[6,82.6,-7.2],[7.5,86,-6.5],[9,90,-9],[12,94,-14]]},
 {name:'Kovačić',role:'mci',style:MCI({number:8,seed:8}),key:true,keys:[[-3.8,50,-15],[-2,52,-14.5],[-1,53.2,-14.2],[0,54,-14],[4,62,-12],[12,76,-10]]},
 {name:'Foden',role:'mci',style:MCI({number:47,seed:47,hair:[K,.7]}),keys:[[-3.8,84,4],[3,87,3],[7,92,1],[12,95,-6]]},
 {name:'Haaland',role:'mci',style:MCI({number:9,seed:9,hair:[Y,.85],hairStyle:'ponytail',build:{height:1.95,bulk:1.12}}),keys:[[-3.8,92,6],[3,94.5,3.5],[6.5,96.5,1.5],[12,97,-6]]},
 {name:'Bernardo',role:'mci',style:MCI({number:20,seed:20,hair:[K,.8],build:{height:1.73}}),keys:[[-3.8,80,22],[4,86,19],[12,92,10]]},
 {name:'Rodri',role:'mci',style:MCI({number:16,seed:16,build:{height:1.91}}),keys:[[-3.8,62,-4],[4,66,-5],[12,74,-6]]},
 {name:'Akanji',role:'mci',style:MCI({number:25,seed:25,skin:SKIN_M}),keys:[[-3.8,50,14],[12,58,12]]},
 {name:'Dias',role:'mci',style:MCI({number:3,seed:3,skin:SKIN_M,build:{height:1.87}}),keys:[[-3.8,45,3],[12,52,2]]},
 {name:'Aké',role:'mci',style:MCI({number:6,seed:6,skin:SKIN_D}),keys:[[-3.8,44,-9],[12,52,-10]]},
 {name:'Diop',role:'ful',style:FUL({number:31,seed:31,skin:SKIN_D,hairStyle:'bald',build:{height:1.94,bulk:1.08}}),key:true,moves:[{kind:'lunge',at:6.42,dur:.85,side:'r'}],keys:[[-3.8,90,-6],[3,90.5,-7.5],[5,91.4,-8.2],[5.9,92.2,-8.9],[6.4,92.2,-9.2],[6.9,92.6,-8.9],[7.5,93.6,-7.8],[9,95,-8],[12,95.5,-9]]},
 {name:'Leno',role:'gk',style:LENO,key:true,moves:[{kind:'dive',at:7.4,dur:.9,side:'l'}],keys:[[-3.8,101.5,-2],[5,102.2,-2.8],[6.3,102.4,-2.6],[6.9,102.5,-1.9],[7.4,102.5,-1.6],[12,102.5,-1.6]]},
 {name:'Castagne',role:'ful',style:FUL({number:21,seed:21}),key:true,keys:[[-3.8,76,-27],[0,78.5,-26],[3,83.5,-22.5],[5.5,88.5,-17],[7,92,-13],[12,95,-12]]},
 {name:'Palhinha',role:'ful',style:FUL({number:26,seed:26,build:{height:1.9,bulk:1.06}}),key:true,keys:[[-3.8,73,-12],[0,75.5,-12.5],[3,78.5,-10],[5,81.5,-9.5],[7,85,-8.5],[12,88,-8]]},
 {name:'Bassey',role:'ful',style:FUL({number:3,seed:13,skin:SKIN_D}),keys:[[-3.8,91,2],[5,93,.5],[7,95,-1.5],[12,96,-3]]},
 {name:'Robinson',role:'ful',style:FUL({number:33,seed:33,skin:SKIN_M}),keys:[[-3.8,86,16],[7,91,11],[12,93,8]]},
 {name:'Iwobi',role:'ful',style:FUL({number:17,seed:18,skin:SKIN_D}),keys:[[-3.8,70,4],[12,80,1]]},
 {name:'Reid',role:'ful',style:FUL({number:14,seed:14,skin:SKIN_D}),keys:[[-3.8,66,-6],[4,71,-5],[12,80,-5]]},
 {name:'Pereira',role:'ful',style:FUL({number:18,seed:19,skin:SKIN_M}),keys:[[-3.8,68,-4],[12,78,-4]]},
 {name:'Willian',role:'ful',style:FUL({number:20,seed:22,skin:SKIN_M}),keys:[[-3.8,62,14],[12,72,12]]},
 {name:'Muniz',role:'ful',style:FUL({number:9,seed:29,skin:SKIN_M}),keys:[[-3.8,56,4],[12,62,2]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3.8,68,6],[6,80,4],[12,88,0]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const GV=IX('Gvardiol'),KDB=IX('De Bruyne'),KOV=IX('Kovačić'),DIOP=IX('Diop'),LENO_I=IX('Leno'),CAST=IX('Castagne'),PALH=IX('Palhinha');
const CITY=new Set(ACTORS.map((a,i)=>a.role==='mci'||a.role==='g'?i:-1));
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3.8,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(k,tau),y=headingOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}

// ---------------------------------------------------------------- the ball: Kovačić's pass, the carry, the give-and-go, the first touch, the roll into the corner
const KPASS=-1,RECV=0,PASS1=3.45,KREC=4.3,RET=5.25,RECV2=6.3,SHOT=6.95,IN_NET=SHOT+.8;
/** Gvardiol's stride (metres per run cycle); he knocks the ball on with his LEFT foot once per cycle (inferred) */
const RS=3.2;
const TOUCHES:number[]=(()=>{const out:number[]=[RECV];let prev=distOf(GV,RECV)/RS-.38;
 for(let tau=RECV+DT;tau<PASS1-.4;tau+=DT){const ph=distOf(GV,tau)/RS-.38;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.45)out.push(tau);prev=ph;}
 return[...out,PASS1];})();
const TP=TOUCHES.map(t=>footSpot(GV,t,'l',.52,.1));
const KOV_PT=footSpot(KOV,KPASS,'r',.45);
const K1=footSpot(KDB,KREC,'r',.45),K2=footSpot(KDB,RET,'r',.45);
const M2=footSpot(GV,RECV2,'l',.5,.1);
const SHOT_PT=footSpot(GV,SHOT,'r',.42,.12);
const NET:V3=[105.35,.2,2.75],REST:V3=[106.3,.11,2.9];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
const g0=(p:[number,number]):V3=>[p[0],.11,p[1]];
function ballAt(tau:number):V3{
 if(tau<KPASS)return g0(footSpot(KOV,tau,'r',.45));
 if(tau<RECV)return roll(g0(KOV_PT),g0(TP[0]),(tau-KPASS)/(RECV-KPASS),.3);
 if(tau<PASS1){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<KREC)return roll(g0(TP[TP.length-1]),g0(K1),(tau-PASS1)/(KREC-PASS1),.3);
 if(tau<RET){const u=(tau-KREC)/(RET-KREC);return roll(g0(K1),g0(K2),easeOut(clamp(u*1.6)),.2);}
 if(tau<RECV2)return roll(g0(K2),g0(M2),(tau-RET)/(RECV2-RET),.35);
 if(tau<SHOT){const u=(tau-RECV2)/(SHOT-RECV2);return roll(g0(M2),g0(SHOT_PT),u,.45);}
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(SHOT_PT[0],NET[0],u),.11+(NET[1]-.11)*u*u,lerp(SHOT_PT[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return lerp3(NET,REST,e);
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** the carry touch: the left foot reaches forward and knocks the ball on with the laces / inside */
const LTOUCH:Partial<Pose>={lHipF:36,lKnee:26,lAnk:30,lHipR:12};
/** the first touch in the box: the inside of the left foot opens and cushions it across his body, away from Diop */
const CUSHION:Partial<Pose>={lHipF:30,lHipA:-10,lHipR:36,lKnee:24,lAnk:-8,lean:18,bend:-8,lShA:44,rShA:36,neckP:30};
/** head up during the carry: he looks at the space ahead */
const HEAD_UP:Partial<Pose>={neckP:-10,lean:12};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ful'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5),st=k===GV?RS:2.4+1.5*s;p=blendPose(idle,runCycle(distOf(k,tau)/st,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),inWin(u));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.05});}
 if(k===LENO_I)yaw=Math.PI+(tau<7?.25*Math.sin(yawOf(b[0]-x,b[2]-z)-Math.PI):0);
 if(a.role==='ful'&&k!==LENO_I&&sp<1.5)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===DIOP&&tau>5.6&&tau<6.9)yaw=lerpA(yaw,yawOf(posOf(GV,tau)[0]-x,posOf(GV,tau)[1]-z),bump(5.6,6.9,tau)*1.5);
 if(k===KOV){const D=.8,u=(tau-(KPASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),inWin(u));yaw=lerpA(yaw,yawOf(TP[0][0]-x,TP[0][1]-z),.8*inWin(u));}}
 if(k===GV){
  if(tau<RECV-.1)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),sm(-1.6,-.9,tau)*(1-sm(-.3,0,tau))*.6);
  for(let i=0;i<TOUCHES.length-1;i++)p=over(p,LTOUCH,bump(TOUCHES[i]-.16,TOUCHES[i]+.1,tau));
  p=over(p,HEAD_UP,bump(.2,PASS1-.2,tau)*.8);
  const D=.75,u=(tau-(PASS1-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.4}),inWin(u));yaw=lerpA(yaw,yawOf(K1[0]-x,K1[1]-z),.6*inWin(u));}
  p=over(p,CUSHION,bump(RECV2-.3,RECV2+.25,tau));
  const Ds=.8,us=(tau-(SHOT-STRIKE_CONTACT*Ds))/Ds;if(us>0&&us<1.4){p=blendPose(p,strike(Math.min(1,us),{foot:'r',power:.45}),inWin(us));yaw=lerpA(yaw,yawOf(NET[0]-x,NET[2]-z),.75*inWin(us));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+.9,tau));}
 if(k===KDB){
  if(tau>2.5&&tau<RET+.3&&sp<2)yaw=yawOf(b[0]-x,b[2]-z);
  p=over(p,{rHipF:30,rKnee:24,rAnk:20,rHipR:24},bump(KREC-.18,KREC+.14,tau));
  const D=.75,u=(tau-(RET-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.35}),inWin(u));yaw=lerpA(yaw,yawOf(M2[0]-x,M2[1]-z),.8*inWin(u));}
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.3,IN_NET+.8,tau));}
 if(CITY.has(k)&&k!==GV&&k!==KDB&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='ful'&&k!==LENO_I&&tau>IN_NET+.8)p=over(p,{lean:40,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.8,IN_NET+1.6,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a modern league ball (paper, navy swirl panels; generic, inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D();for(let i=0;i<3;i++){const a=rot+i/3*TAU,q:Pt[]=[];for(let j=0;j<=6;j++){const u=j/6,aa=a+u*1.3;q.push([x+Math.cos(aa)*r*(.25+.6*u),y+Math.sin(aa)*r*(.25+.6*u)]);}pan.addPath(ribbon(q,r*.2,{seed:5+i,taper:.5,wobble:r*.01}));}
 s.fill(K,pan,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=-1}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (the May sun is high: short, a little toward the camera); big figures cast their own
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.03,e.g[1],e.h*.15,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.45);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===hero||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:e.k===hero}:{});
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / a fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(6,c.F*.16/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** a run from τa to τb as ground points */
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(ta,tb,i/n)));return o;};
const line=(a:[number,number],b:[number,number],n=12):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const u=i/n;o.push([lerp(a[0],b[0],u),lerp(a[1],b[1],u)]);}return o;};
/** "space": the open grass in front of him — a yellow halftone fan on the ground ahead, 1.5 m to 11 m out, with a painted rim */
function spaceZone(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;
 const[x,z]=posOf(GV,Math.min(tau,PASS1-.2)),y=headingOf(GV,Math.min(Math.max(tau,.3),PASS1-.3)),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],L=1.5+9.5*w;
 const pts:[number,number][]=[];for(let i=0;i<=10;i++){const u=i/10,d=lerp(1.5,L,u),hw=lerp(1,4.8,u)*w;pts.push([x+f[0]*d-r[0]*hw,z+f[1]*d-r[1]*hw]);}
 for(let i=10;i>=0;i--){const u=i/10,d=lerp(1.5,L,u),hw=lerp(1,4.8,u)*w;pts.push([x+f[0]*d+r[0]*hw,z+f[1]*d+r[1]*hw]);}
 const q:Pt[]=[];for(const[px,pz] of pts){const g=pr(c,[px,.02,pz]);if(g)q.push(g);}if(q.length<8)return;
 const zone=polyPath(q,true);s.knockout(zone,.35*w);s.tone(Y,zone,.55*w);s.fill(Y,ribbon([...q,q[0]],Math.max(4,kAt(c,[x,0,z])*.09),{seed:57,taper:0,wobble:1}),.9*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the move plays at ~0.8–1.3× real time) */
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'goal');return key(t,mono([[0,-3.8],[CUEW(0,'Manchester'),-1.1],[CUEW(0,'Gvardiol sees'),.3],[CUEW(0,'He carries'),1.4],[CUEW(0,'passes to Kevin'),PASS1],[CUEW(0,'keeps running'),4.9],[CUEW(0,'It comes back'),5.6],[CUEW(0,'one touch'),RECV2],[G,IN_NET-.05],[S+1,IN_NET-.05+(S+1-G)*.9]]),linear);};
const CAM1:V3=[52.5,24,76];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'goal'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the camera rides the ball, a little ahead of the carry; after the goal it settles on Gvardiol's run
 const lead=sm(.4,2,tau)*(1-sm(5.5,6.8,tau))*4,cel=smooth(GV,tau),toC=sm(G+.5,G+1.6,t,easeInOutSine);
 const Tb:V3=[bt[0]+lead,0,bt[2]*.8],T=lerp3(Tb,[cel[0]-1,1,cel[1]],toC);
 const F=key(t,[[0,5600],[CUEW(0,'Gvardiol sees'),6600],[CUEW(0,'passes to Kevin'),6300],[CUEW(0,'one touch'),7100],[G,7500],[G+1.4,8200],[S,8500]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,hero:GV});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(GV,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera in front of him: the open grass, the drive, pass and go
const tau2=(t:number)=>key(t,mono([[0,-.7],[CUEW(1,'Nobody'),.3],[CUEW(1,'drives'),1.3],[CUEW(1,'open grass'),2.2],[CUEW(1,'Then pass'),3.1],[CUEW(1,'give it'),PASS1+.05],[CUEW(1,'sprint'),4.4],[CUEW(1,'get it back'),RET+.05],[SECS(1),RECV2]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(GV,tau),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUEW(1,'Then pass')-.5,CUEW(1,'give it')+.3,t,easeInOutSine);
 const C:V3=[m[0]+9.5+3*wide-2*open,1.9+3.2*wide,m[1]+10+4*wide],T:V3=[m[0]+2.5+3.5*wide,.8,m[1]+1.8+2.2*wide];
 return look(C,T,2500-650*wide-250*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),nb=CUEW(1,'Nobody'),dr=CUEW(1,'drives'),og=CUEW(1,'open grass'),tp2=CUEW(1,'Then pass'),gi=CUEW(1,'give it'),sp=CUEW(1,'sprint'),gb=CUEW(1,'get it back'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:GV,under:()=>{
   const off=1-sm(tp2-.3,tp2+.1,t);
   // "Nobody closes him down": red rings under the Fulham players standing off him
   const nw=sm(nb-.15,nb+.3,t,easeOutBack)*off;for(const [k,sd] of [[CAST,51],[PALH,52]] as [number,number][]){const[x,z]=posOf(k,tau);ring(s,c,x,z,1,nw,R,sd);}
   // "open grass": the yellow space in front of him; "drives": his carry as a red arrow
   spaceZone(s,c,tau,sm(og-.3,og+.4,t,easeOut)*off+sm(nb+.3,nb+.8,t)*.6*(1-sm(og-.3,og,t))*off);
   groundArrow(s,c,runPts(GV,.2,PASS1-.1),sm(dr-.2,dr+.8,t,easeOut)*off,R,63);
   // pass and go: the pass to De Bruyne (yellow), his sprint (blue), the ball back into his path (yellow)
   const fade=1-sm(E-.8,E-.4,t);
   groundArrow(s,c,line(TP[TP.length-1],K1),sm(gi-.2,gi+.3,t,easeOut)*fade,Y,65);
   groundArrow(s,c,runPts(GV,PASS1+.1,RECV2),sm(sp-.2,sp+.6,t,easeOut)*fade,B,66);
   groundArrow(s,c,line(K2,M2),sm(gb-.1,gb+.5,t,easeOut)*fade,Y,67);},
   after:()=>{const age=t-gi;if(age>-.2&&age<.6){const q=pr(c,[TP[TP.length-1][0],.15,TP[TP.length-1][1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[TP[TP.length-1][0],0,TP[TP.length-1][1]])*.7,{n:8,seed:94,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:9});}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · second replay angle from behind Fulham's goal: the first touch past Diop, the right foot, the corner
const tau3=(t:number)=>{const pl=CUEW(2,'past Bernd');return key(t,mono([[0,5.6],[CUEW(2,'His first'),RECV2-.02],[CUEW(2,'fools'),6.6],[CUEW(2,'His right'),SHOT],[CUEW(2,'rolls it'),7.3],[pl,IN_NET+.05],[SECS(2),IN_NET+.05+(SECS(2)-pl)*.85]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),pl=CUEW(2,'past Bernd'),turn=sm(pl+.4,SECS(2)-.3,t,easeInOutSine),g=smooth(GV,tau);
 const C0:V3=[114.5,6,9.5],T0:V3=[lerp(91,96,sm(SHOT,IN_NET,tau,easeInOutSine)),1,lerp(-8,-2,sm(SHOT,IN_NET,tau,easeInOutSine))];
 const C1:V3=[g[0]+7.5,2.2,g[1]+7.5],T1:V3=[g[0]-.5,1.1,g[1]-1];
 return look(lerp3(C0,C1,turn),lerp3(T0,T1,turn),lerp(3400+700*sm(5.6,RECV2,tau)-500*sm(SHOT,IN_NET,tau),3100,turn));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ft=CUEW(2,'His first'),fo=CUEW(2,'fools'),rf=CUEW(2,'His right'),ri=CUEW(2,'rolls it'),pl=CUEW(2,'past Bernd'),turn=sm(pl+.4,SECS(2)-.3,t,easeInOutSine),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(pl-.1,pl+.3,t)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{goalLater:turn<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:GV,under:()=>{
   // "His first touch": a yellow ring where the return pass meets him, the touch across his body (red arrow) away from Diop
   const fw=sm(ft-.2,ft+.2,t,easeOutBack)*(1-sm(rf,rf+.4,t));ring(s,c,M2[0],M2[1],.9,fw,Y,45);
   groundArrow(s,c,line(M2,SHOT_PT,8),sm(ft,fo+.2,t,easeOut)*(1-sm(rf,rf+.4,t)),R,68);
   // "rolls it": the ball's lane along the grass into the far corner
   groundArrow(s,c,line(SHOT_PT,[NET[0]-.6,NET[2]-.1]),sm(ri-.2,pl+.1,t,easeOut)*(1-sm(pl+.4,pl+.8,t)),Y,69);},
   after:({joints})=>{
    // "fools Issa Diop": his lunge meets only air — a red spark where he reaches
    const age=t-fo;if(age>-.25&&age<.55){const[dx,dz]=posOf(DIOP,6.4),q=pr(c,[dx-.6,.25,dz-.5]);if(q)sparkBurst(s,R,q[0],q[1],kAt(c,[dx,.2,dz])*.55,{n:8,seed:83,g:easeOutBack(clamp((age+.25)/.2))*(1-clamp((age-.3)/.25)),width:9});}
    // "His right foot": an orange-red ring round his right boot
    const r=joints.get(GV),lw=sm(rf-.15,rf+.2,t,easeOutBack)*(1-sm(ri+.2,ri+.5,t));
    if(r&&lw>0){const toe=r.joints.rToe,an=r.joints.rAn,rr=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.25*lw+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*rr*1.2,cy+Math.sin(a)*rr*.8]);}
     s.fill(R,ribbon(pts,Math.max(3,rr*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*lw);}}});
  if(turn<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(GV,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the carry — space, a defender, dribble forward, start the attack
const tau4=(t:number)=>key(t,mono([[0,-.9],[CUEW(3,'when there'),-.1],[CUEW(3,'in front'),.4],[CUEW(3,'even a'),.9],[CUEW(3,'dribble'),1.6],[CUEW(3,'start the'),PASS1-.1],[SECS(3),4.9]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(GV,Math.min(tau,PASS1+.4)),push=sm(0,1.2,t,easeInOutSine),wide=sm(CUEW(3,'start the')-.6,SECS(3)-.4,t,easeInOutSine),kd=posOf(KDB,tau);
 const C:V3=[m[0]+7.5+1.5*(1-push)+2*wide,1.5+2.4*wide,m[1]+6+1.5*(1-push)+3*wide],T0:V3=[m[0]+1.2,.85,m[1]+.6],T1:V3=[lerp(m[0],kd[0],.45),.7,lerp(m[1],kd[1],.45)];
 return look(C,lerp3(T0,T1,wide),2350+250*push-400*wide);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wt=CUEW(3,'when there'),inf=CUEW(3,'in front'),ev=CUEW(3,'even a'),dr=CUEW(3,'dribble'),st=CUEW(3,'start the'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const fade=1-sm(E-.9,E-.5,t);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:GV,under:()=>{
   // "space in front of you": the yellow fan of open grass ahead of him
   spaceZone(s,c,tau,(sm(wt-.1,inf+.3,t,easeOut))*(1-sm(st-.2,st+.3,t)));
   // "even a defender": the path he has come from the back line (blue trail) and a ring under the left-back
   const[gx,gz]=posOf(GV,tau);ring(s,c,gx,gz,1,sm(ev-.1,ev+.3,t,easeOutBack)*(1-sm(dr-.1,dr+.3,t)),B,58);
   groundArrow(s,c,runPts(GV,-3.8,Math.max(-3.7,Math.min(tau,.6))),sm(ev-.1,ev+.5,t,easeOut)*(1-sm(dr+.3,dr+.7,t)),B,59);
   // "dribble forward": the carry, red; "start the attack": the pass to De Bruyne, yellow, and his run on, blue
   groundArrow(s,c,runPts(GV,Math.max(.2,Math.min(tau,1.2)),PASS1-.1),sm(dr-.1,dr+.6,t,easeOut)*(1-sm(st+.4,st+.8,t))*fade,R,60);
   groundArrow(s,c,line(TP[TP.length-1],K1),sm(st-.1,st+.4,t,easeOut)*fade,Y,62);
   groundArrow(s,c,runPts(GV,PASS1+.1,5.3),sm(st+.3,st+1,t,easeOut)*fade,B,64);},
   after:()=>{const age=t-st;if(age>-.2&&age<.6){const q=pr(c,[TP[TP.length-1][0],.15,TP[TP.length-1][1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[TP[TP.length-1][0],0,TP[TP.length-1][1]])*.7,{n:8,seed:95,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:9});}}});
 },
 still:4,
};

const film:RisoStory={
 id:'gvardiol-signature',format:'11v11',title:"Gvardiol Carries It Forward",theme:'When there is space in front of you, a defender can dribble forward and start the attack',
 ageNote:'Premier League, Fulham 0–4 Manchester City, Craven Cottage, 11 May 2024 (the 13th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of watered turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];a.addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
