/** Ashley Cole's SIGNATURE film, "shutting down the best winger" — England v Portugal, World Cup quarter-final, Saturday 1 July 2006,
 * Arena AufSchalke, Gelsenkirchen (0–0 after extra time, Portugal won 3–1 on penalties).
 *
 * A riso-print recreation of a broadcast: one 3D choreography in pitch metres (X along the pitch, England's goal line at X = 105 on the
 * right of the main camera, Z across, the near touchline at Z = 0, Y up) seen through TV cameras — 1 live, the high main camera: Figo
 * receives on Portugal's right wing, Cole races out to him, the duel, the tackle; 2 a TV slow-motion replay from a low touchline camera
 * (Cole gets close, then slows down and stays on his feet as Figo tries to trick him); 3 a second replay from behind Figo, looking down
 * the line (Cole stands on the inside, Figo can only go down the line, knocks it on, Cole pokes it away); 4 the lesson (the only chapter
 * with teaching marks: the short gap, both boots on the grass, the inside blocked and the line left open). No overlays in the footage.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("shutting down the best winger"; lesson "Stay close, stay on your feet and
 * show the winger down the line"). In the 2006 quarter-final Cole, at left-back, faced Luís Figo, Portugal's captain on their right wing
 * (Ballon d'Or 2000), and the Observer's player ratings single out "an early tackle on Figo" that "announced intent". The lead's
 * suggestion — Cole marking Cristiano Ronaldo in that match — is NOT supported: the same ratings list Ronaldo at LEFT midfield, dealt
 * with by Gary Neville at right-back. So the film uses Cole v Figo. The ratings give no detail of how the tackle was made, so chapters
 * 2–4 use the brief's honest fallback and the narration says so ("Here's how he did it"): they show the signature technique the lesson
 * names (close down, stay on your feet, show him down the line, a standing poke tackle), not a claimed frame-by-frame copy.
 *
 * SOURCES (read 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - The Observer (theguardian.com), Paul Wilson et al., "England pay penalty for Rooney's red", with player ratings (1 Jul 2006):
 *    https://www.theguardian.com/football/2006/jul/02/worldcup2006.match — line-ups; "LB Ashley Cole 6 … An early tackle on Figo announced
 *    intent. Then drew foul from Petit after six minutes"; "RM Figo", "LM Ronaldo"; Gary Neville "having to deal with Ronaldo"; "heat of
 *    29 degrees under the tented roof"; Gelsenkirchen 52,000.
 *  - The Guardian, "How Hargreaves can spoil the supply line through Figo" (preview, 1 Jul 2006): https://www.theguardian.com/football/2006/jul/01/sport.worldcup2006
 *  - Wikipedia, "2006 FIFA World Cup knockout stage" (England vs Portugal: date, 17:00, Arena AufSchalke, referee Elizondo, shirt numbers,
 *    kit boxes) https://en.wikipedia.org/wiki/2006_FIFA_World_Cup_knockout_stage
 *  - Wikipedia, "Ashley Cole" (left-back, 107 caps, ever-present at the 2006 World Cup) https://en.wikipedia.org/wiki/Ashley_Cole
 * CONFIRMED: the match, date and venue; Cole at left-back wearing 3; Figo, Portugal's captain, wearing 7 at right midfield, i.e. on Cole's
 * side; an early Cole tackle on Figo (within about the first six minutes); England in white shirts, navy shorts, white socks; Portugal in
 * dark red (maroon) shirts, shorts and socks (Wikipedia kit box); the closed "tented" roof. Other named players: Joe Cole 11 (LM), Neville
 * 2, Ferdinand 5, Terry 6, Hargreaves 16, Gerrard 4, Lampard 8, Beckham 7; Portugal Miguel 13 (RB), Maniche 18, Tiago 19, Pauleta 9,
 * Ronaldo 17.
 * INFERRED (not in the accounts): HOW the tackle was made — the close-down, the jockey, Figo's step-over and knock-on, the standing poke
 * with Cole's LEFT boot, where the ball went and the pass to Joe Cole are the signature technique, drawn as the lesson describes it;
 * which end England defended in the first half (here the goal on the right, so Cole's left wing is the near touchline); every position,
 * path and timing; who passed to Figo (Maniche here) and Miguel's overlap; the maroon printed as the red ink; England's number ink and
 * Robinson's kit; Cole's and Figo's hair and builds; the stadium's look (steep stands, closed roof) and the camera placements. The
 * narration names only the match, the players and "early on, Cole wins the ball", then the "how he did it" technique.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,backpedal,lunge,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [5,5,4,4]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The duel',text:'Germany, 2006, a World Cup quarter-final. Luís Figo of Portugal, one of the best wingers in the world, runs at England’s Ashley Cole. Early on, Cole wins the ball!',seconds:13.6,
  cues:[[0,'Germany'],[3,'Luís Figo'],[7.8,'runs at England’s Ashley Cole'],[10.1,'Early on'],[11,'Cole wins the ball']]},
 {label:'Close',text:'Here’s how he did it. Cole gets close. Then he slows down and stays on his feet. No diving in!',seconds:9.4,
  cues:[[0,'Here’s how he did it'],[2,'Cole gets close'],[3.5,'slows down'],[4.9,'stays on his feet'],[6.6,'No diving in']]},
 {label:'Down the line',text:'He stays inside, so Figo can only go down the line. Figo knocks it on. Cole pokes it away!',seconds:9,
  cues:[[0,'He stays inside'],[1.8,'down the line'],[3.9,'Figo knocks it on'],[5.4,'Cole pokes it away']]},
 {label:'The lesson',text:'That’s how to shut down the best winger. Stay close, stay on your feet, and show the winger down the line.',seconds:10.4,
  cues:[[0,'That’s how'],[2.9,'Stay close'],[4.1,'stay on your feet'],[5.6,'show the winger down the line']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py ashley-cole-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/ashley-cole-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/ashley-cole-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** Cue onsets of chapter i (seconds). */
const Q=(i:number)=>CHAPTERS[i].cues.map(c=>c.at);
const SECS=(i:number)=>CHAPTERS[i].seconds;

const K='navy',Y='yellow',R='red',B='blue';
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one shape union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). Full sheet, never the safe box. */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

// ---------------------------------------------------------------- 3D: pitch metres → screen through a TV camera
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
/** camera space: [right, up, depth] */
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};

// ---------------------------------------------------------------- the Arena AufSchalke: steep stands close to the pitch, the closed roof
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-10,74],b:[115,74],out:[0,1]},    // far side
 {a:[111,-8],b:[111,76],out:[1,0]},    // behind England's goal (right)
 {a:[-10,-6],b:[115,-6],out:[0,-1]},   // main stand (the main camera sits in it)
 {a:[-6,-8],b:[-6,76],out:[-1,0]},     // behind Portugal's goal (left)
];
/** the crowd: England white-and-red, Portugal red, Schalke's blue seats between (screens of the four inks) */
const TIER_INK:[string,number][]=[[R,.3],[B,.3],[Y,.18],[R,.18],[K,.22],[B,.18],[R,.45],[K,.12]];
const ROOF_Y=40;
function stadium(s:Sheet,c:Cam){
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),truss=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,40,1.2+40*.62),P(0,40,1.2+40*.62)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  const segs=14;for(let k=0;k<22;k++){const d0=1+k*1.78,d1=d0+1.4,y0=1.2+d0*.62,y1=1.2+d1*.62;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}
  // the roof's underside: from the back of the stand, reaching in over the pitch (the "tented" roof was closed that day)
  addPoly(roof,[P(-.04,40,26.5),P(1.04,40,26.5),P(1.04,-16,ROOF_Y),P(-.04,-16,ROOF_Y)],c);
  for(let g=0;g<=8;g++){const u=g/8,a=P3(P(u,38,26.8),c),b=P3(P(u,-15,ROOF_Y-.2),c);if(a[2]>0&&b[2]>0){truss.moveTo(a[0],a[1]);truss.lineTo(b[0],b[1]);}}}
 // the four closed corners (their own paths, so no overlap inside one fill): a dark concourse block and a roof wedge
 const corner=new Path2D(),roofC=new Path2D();
 for(const[cx,cz,sx,sz]of[[-6,-6,-1,-1],[111,-6,1,-1],[111,74,1,1],[-6,74,-1,1]]as[number,number,number,number][]){
  addPoly(corner,[[cx,1.2,cz],[cx+sx*40,26,cz],[cx+sx*40,26,cz+sz*40],[cx,26,cz+sz*40]],c);
  addPoly(roofC,[[cx+sx*40,26.5,cz+sz*40],[cx+sx*40,30,cz-sz*12],[cx-sx*14,ROOF_Y,cz-sz*14],[cx-sx*12,30,cz+sz*40]],c);}
 s.fill(Y,corner,.2);s.fill(K,corner,.45);s.fill(K,roofC,.5);s.fill(B,roofC,.25);
 s.fill(Y,concrete,.2);s.fill(K,concrete,.3);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 // the closed membrane over the middle (paler: light comes through it)
 const membrane=new Path2D();addPoly(membrane,[[-20,ROOF_Y+1.2,-20],[125,ROOF_Y+1.2,-20],[125,ROOF_Y+1.2,88],[-20,ROOF_Y+1.2,88]],c);s.fill(Y,membrane,.25);s.fill(K,membrane,.18);
 s.fill(K,roof,.5);s.fill(B,roof,.25);s.stroke(K,truss,Math.max(2,.03*P3([60,20,34],c)[2]),.5);
 s.fill(R,wall,.35);s.fill(Y,wall,.5);s.stroke(K,wall,Math.max(2,.05*P3([60,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-6,0,-6],[111,0,-6],[111,0,74],[-6,0,74]],c);s.fill(Y,grass,.62);s.fill(B,grass,.48);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);if(f[2]<=0||g[2]<=0||toCam([x,0,z],c)[2]<2)continue;
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir: white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Cole's LEFT leg on his left (toward the near touchline as he faces up the pitch at Figo). */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (pitch x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE adapter: every body in the film is printed here. */
function drawPlayer(s:Sheet,pose:Pose,c:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:R,shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
const portugal=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:[K,.6],shorts:R,socks:R,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Ashley Cole: England's left-back, number 3 (1.76 m; very short hair in 2006) */
const COLE:AthleteStyle=england({number:3,seed:3,skin:SKIN_D,hair:[K,.95],build:{height:1.76,bulk:.98,thighs:1.06}});
/** Luís Figo: Portugal's captain, number 7 (1.80 m; dark hair swept back) */
const FIGO:AthleteStyle=portugal({number:7,seed:7,skin:SKIN_M,hair:[K,.9],build:{height:1.8,bulk:1.02}});
const ROBINSON:AthleteStyle={shirt:[Y,.85],shorts:[Y,.85],socks:[Y,.85],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:K,scale:FIG,seed:1};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:3,build:COLE.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T = 0 = Figo receives on the wing)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
/** the poke: a standing lunge on the LEFT leg toward the touchline (Cole faces up the pitch at Figo; his left is the near side) */
const T_KNOCK=4.95,T_LUNGE=5.05,LUNGE_DUR=.8,LUNGE_REACH=.6,T_CONTACT=T_LUNGE+LUNGE_REACH*LUNGE_DUR,T_LUNGED=T_LUNGE+LUNGE_DUR;
const LUNGE_AT:[number,number]=[70.4,5.15],LUNGE_H=nrm2(-1,-.28),LUNGE_PLACE=placeOf(LUNGE_AT[0],LUNGE_AT[1],LUNGE_H);
const POKE=(u:number)=>lunge(clamp(u),{side:'l'});
/** the ball meets Cole's left boot here: solved from the body at the reach frame of the lunge */
const BALL_T:[number,number]=(()=>{const sk=solve(POKE(LUNGE_REACH),COLE.build,LUNGE_PLACE,FIG),t=toMy(sk.lToe),h=toMy(sk.lHeel);return[(t[0]+h[0])/2-.1,(t[2]+h[2])/2-.02];})();
/** where the lunge leaves him (the pose's root shift, in pitch metres): forward along LUNGE_H, dz to his right (= +z × −1 for this heading) */
const L1=POKE(1);
const END:[number,number]=add2(add2(LUNGE_AT,LUNGE_H,L1.dx),[-LUNGE_H[1],LUNGE_H[0]],-L1.dz);
/** the poked ball squirts up the pitch and a little infield, away from Figo's run */
const BALL_REST:[number,number]=add2(BALL_T,nrm2(-1,.55),2.3);
const FIGO_KEYS=[[-3.6,56.5,9.5],[-2.2,57.6,7.4],[-1,58.9,5.6],[0,60,4.6],[1.2,61.5,4.5],[2.4,63.2,4.65],[3,64.3,4.9],[3.6,65.2,5.15],[4.3,66.9,4.45],
 [T_KNOCK,...add2(BALL_T,[-1.6,.05])],[T_CONTACT,...add2(BALL_T,[-.72,-.22])],[T_CONTACT+.8,BALL_T[0]+1.2,BALL_T[1]-.45],[8,BALL_T[0]+1.9,BALL_T[1]-.2],[11,BALL_T[0]+1.6,BALL_T[1]+1.2]];
/** Cole: races out from his line, brakes about two metres away, then backs off with Figo — goalside and INSIDE him all the way */
const COLE_KEYS=[[-3.6,78.5,13],[-1.5,77.2,11.8],[0,75.4,10.5],[1.2,70.2,7.8],[2,66.6,6.35],[2.4,65.7,6.1],[3,66.35,6.25],[3.6,67,6.55],[4.3,68.3,6.1],[T_LUNGE,...LUNGE_AT]];
const COLLECT=6.75,PASS_AT=7.45,PASS_TO=8.45;
const COLE_OUT=[[T_LUNGED+.3,...END],[COLLECT,...add2(BALL_REST,nrm2(1,-.4),.55)],[PASS_AT,...add2(BALL_REST,nrm2(-1,.35),1.1)],[10,...add2(BALL_REST,nrm2(-1,.35),3.4)]];
/** Joe Cole (11), England's left midfielder, tracking back: he takes the pass up the line */
const J11=[[-3.6,55,19],[0,58.5,16.5],[4,61.5,14.2],[PASS_TO,62.4,12.6],[11,60.5,12.2]];
/** Maniche (18) finds Figo on the wing */
const MANICHE=[[-3.6,50.5,19],[-2.2,52,18.2],[0,53.5,17.5],[6,59,17],[11,61,17]];
const PASS_IN=-2.2;
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'cole',style:COLE,keys:COLE_KEYS},
 {id:'figo',style:FIGO,keys:FIGO_KEYS},
 {id:'e-11',style:england({number:11,seed:11,hair:[K,.7]}),keys:J11},
 {id:'p-18',style:portugal({number:18,seed:18}),keys:MANICHE},
 // everyone else (positions illustrative)
 {id:'p-13',style:portugal({number:13,seed:13,skin:SKIN_L}),keys:[[-3.6,46,6],[0,53,6.5],[3,59,7.2],[6,62,7.6],[11,63,8]]},
 {id:'e-16',style:england({number:16,seed:16,hair:[Y,.5]}),keys:[[-3.6,68,22],[0,69,19],[4,70.5,15],[8,70,15],[11,69,16]]},
 {id:'e-5',style:england({number:5,seed:5,skin:SKIN_D}),keys:[[-3.6,86,28],[0,87,27],[6,88.5,24],[11,87,25]]},
 {id:'e-6',style:england({number:6,seed:6}),keys:[[-3.6,88,40],[0,88.5,38],[6,89.5,35],[11,88,35]]},
 {id:'e-2',style:england({number:2,seed:2}),keys:[[-3.6,84,56],[0,85,54],[6,86.5,50],[11,85,50]]},
 {id:'e-4',style:england({number:4,seed:4}),keys:[[-3.6,64,30],[0,66,28],[6,70,25],[11,68,24]]},
 {id:'p-9',style:portugal({number:9,seed:9}),keys:[[-3.6,80,31],[0,82,30],[6,85,28],[11,84,29]]},
 {id:'p-19',style:portugal({number:19,seed:19,skin:SKIN_L}),keys:[[-3.6,62,32],[0,65,29],[6,71,26],[11,70,26]]},
 {id:'p-17',style:portugal({number:17,seed:17}),keys:[[-3.6,74,58],[0,77,55],[6,80,50],[11,79,50]]},
];
const ROBINSON_KEYS=[[-4,99.5,31],[6,100,30.5],[11,99.6,31]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-4);for(let t=-3.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
/** The ball at play time T: Maniche's pass out to the wing, Figo's dribble (touches ahead), his knock down the line, Cole's left boot,
 * the ball squirting up the pitch, Cole collects and passes up the line to Joe Cole. */
function ballAt(T:number):V3{
 if(T<PASS_IN)return ahead(MANICHE,T,.6);
 const f0=trackAt(FIGO_KEYS,0);
 if(T<0)return lerp3(ahead(MANICHE,PASS_IN,.6),[f0[0]+.35,.11,f0[1]-.05],sm(PASS_IN,0,T,u=>u*(1.3-.3*u)));
 if(T<T_KNOCK)return ahead(FIGO_KEYS,T,.5+.35*Math.max(0,Math.sin(T*TAU/.62)));
 const b0=ahead(FIGO_KEYS,T_KNOCK,.55),bt:V3=[BALL_T[0],.11,BALL_T[1]],rest:V3=[BALL_REST[0],.11,BALL_REST[1]];
 if(T<T_CONTACT)return lerp3(b0,bt,sm(T_KNOCK,T_CONTACT,T,u=>u*(1.2-.2*u)));
 if(T<COLLECT)return lerp3(bt,rest,sm(T_CONTACT,T_CONTACT+.85,T,easeOut));
 if(T<PASS_AT){const a=ahead(COLE_OUT,T,.5);return lerp3(rest,a,sm(COLLECT,COLLECT+.25,T));}
 const from=ahead(COLE_OUT,PASS_AT,.5),to=trackAt(J11,PASS_TO+.1);
 if(T<PASS_TO)return lerp3(from,[to[0],.11,to[1]],sm(PASS_AT,PASS_TO,T,u=>u*(1.3-.3*u)),.2);
 return ahead(J11,T,.5);
}

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball: "eyes on the ball". Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.3*w;return clampPose(p);}
/** Cole's jockey heading: square to Figo but turned a touch toward the line, so the way inside is closed and the line is open */
const JOCKEY_H=nrm2(-1,-.34);
/** the jockey: low, knees bent, weight on the balls of the feet, short backward steps (the library backpedal, a little more upright) */
function jockey(ph:number):Pose{const b=backpedal(ph);return clampPose({...b,lean:b.lean-.12});}
/** Cole: the sprint out, the brake, the jockey (backing off with Figo, never diving in), the poke with his left boot, collect, pass */
function coleState(T:number):St{
 if(T<T_LUNGE){const p=trackAt(COLE_KEYS,T),v=velAt(COLE_KEYS,T),sp=Math.hypot(v[0],v[1]),settle=sm(1.55,2.35,T,easeInOutSine);
  const h=yawTo(sp>.5?[v[0]/sp,v[1]/sp]:JOCKEY_H,JOCKEY_H,settle),run=runState(COLE_KEYS,T,h);
  // the brake: a long last plant, hips dropping (the "slows down" beat)
  const brake=win(T,1.7,2.6,.35),braked=clampPose({...run.pose,lHipF:run.pose.lHipF+.35,rHipF:run.pose.rHipF+.2,lKnee:run.pose.lKnee+.4,rKnee:run.pose.rKnee+.35,pitch:run.pose.pitch-.14,lean:run.pose.lean+.1});
  let pose=blendPose(run.pose,braked,brake*.8);
  pose=blendPose(pose,jockey(strideAt(COLE_KEYS,T)*.9/.75),settle);
  // Figo's step-over: a small shift of weight inside, feet stay planted (he does not bite)
  const feint=win(T,3.05,3.75,.3);if(feint>0)pose=blendPose(pose,clampPose({...pose,bend:pose.bend+.12,roll:pose.roll+.05,dz:.05}),feint);
  pose=lookAtBall({pose,place:run.place},T,.8);
  const st={pose,place:placeOf(p[0],p[1],h)};
  if(T<T_LUNGE-.1)return st;
  return{pose:blendPose(pose,POKE((T-T_LUNGE)/LUNGE_DUR),sm(T_LUNGE-.1,T_LUNGE,T)),place:st.place};}
 if(T<T_LUNGED)return{pose:POKE((T-T_LUNGE)/LUNGE_DUR),place:LUNGE_PLACE};
 if(T<T_LUNGED+.3){const u=(T-T_LUNGED)/.3;return{pose:keyPoses(u,[[0,L1],[1,{...stand(),dx:L1.dx,dz:L1.dz}]]),place:LUNGE_PLACE};}
 // up the pitch to the ball, collect, the pass up the line with the left foot
 const p=trackAt(COLE_OUT,Math.min(T,PASS_AT)),v=velAt(COLE_OUT,Math.min(T,PASS_AT-.07)),sp=Math.hypot(v[0],v[1]);
 const toJ=nrm2(trackAt(J11,PASS_TO)[0]-p[0],trackAt(J11,PASS_TO)[1]-p[1]),h=T>PASS_AT-.5?yawTo(sp>.3?[v[0]/sp,v[1]/sp]:LUNGE_H,toJ,sm(PASS_AT-.5,PASS_AT-.2,T)):(sp>.3?[v[0]/sp,v[1]/sp] as [number,number]:LUNGE_H);
 let pose=blendPose(stand(),dribble(strideAt(COLE_OUT,T)*.9/3.2,{foot:'l',speed:clamp(sp/6)}),sm(T_LUNGED+.3,T_LUNGED+.6,T));
 pose=blendPose(pose,strike(clamp((T-PASS_AT)/.9+STRIKE_CONTACT),{foot:'l',power:.5}),win(T,PASS_AT-.45,PASS_AT+.7,.25));
 return{pose,place:placeOf(p[0],p[1],h)};
}
/** Figo's step-over: the right foot circles over the ball, a dip of the shoulder inside (to his left), then on down the line */
const STEPOVER:[number,Pose][]=[
 [0,dribble(.2,{foot:'r',speed:.6})],
 [.35,posed({rHipF:34,rHipA:-14,rKnee:62,rAnk:20,lHipF:16,lKnee:34,lean:18,bend:-14,roll:-6,twist:-10,lShA:40,rShA:30,lElb:50,rElb:50,neckP:30})],
 [.6,posed({rHipF:28,rHipA:26,rKnee:52,rAnk:22,lHipF:14,lKnee:38,lean:16,bend:-18,roll:-8,twist:12,lShA:52,rShA:26,lElb:40,rElb:56,neckP:28})],
 [1,dribble(.7,{foot:'r',speed:.6})],
];
function figoState(T:number):St{
 if(T<0){const st=runState(FIGO_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};}
 if(T<T_CONTACT+.1){const st=runState(FIGO_KEYS,T);
  // head over the ball on the dribble, the step-over inside, the knock down the line with the right foot
  let pose=blendPose(st.pose,dribble(strideAt(FIGO_KEYS,T)*.9/3.6,{foot:'r',speed:.8}),.6);
  const so=win(T,3,3.8,.2);if(so>0)pose=blendPose(pose,keyPoses(clamp((T-3)/.8),STEPOVER),so);
  pose=blendPose(pose,strike(clamp((T-T_KNOCK)/.8+STRIKE_CONTACT),{power:.28}),win(T,T_KNOCK-.3,T_KNOCK+.35,.18));
  return{pose,place:st.place};}
 // the ball is gone: a stretching stride after it, arms out, then he pulls up and turns to look for it
 const st=runState(FIGO_KEYS,T),u=sm(T_CONTACT+.1,T_CONTACT+.6,T)*(1-sm(T_CONTACT+1,T_CONTACT+1.6,T));
 let pose=blendPose(st.pose,clampPose({...st.pose,lShA:st.pose.lShA+.6,rShA:st.pose.rShA+.6,lean:st.pose.lean+.15}),u);
 const b=ballAt(T),p=trackAt(FIGO_KEYS,T),look=sm(T_CONTACT+.7,T_CONTACT+1.5,T);
 const h=yawTo(nrm2(velAt(FIGO_KEYS,T)[0]||1,velAt(FIGO_KEYS,T)[1]),nrm2(b[0]-p[0],b[2]-p[1]),look);
 pose=lookAtBall({pose,place:st.place},T,.6);
 return{pose,place:placeOf(p[0],p[1],h)};
}
function robinsonState(T:number):St{const[x,z]=trackAt(ROBINSON_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.1),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='cole')return coleState(T);if(id==='figo')return figoState(T);if(id==='robinson')return robinsonState(T);
 const k=TR(id).keys;
 if(id==='e-11'&&T>PASS_AT-.8){const st=runState(k,T),b=ballAt(T),p=trackAt(k,T);return{...st,place:placeOf(p[0],p[1],nrm2(b[0]-p[0],b[2]-p[1]))};}
 if(id==='p-18'&&T<PASS_IN+.6){const pose=blendPose(runState(k,T).pose,strike(clamp((T-PASS_IN)/.9+STRIKE_CONTACT),{power:.45}),win(T,PASS_IN-.45,PASS_IN+.5,.2));
  const p=trackAt(k,T),f=trackAt(FIGO_KEYS,0);return{pose,place:placeOf(p[0],p[1],nrm2(f[0]-p[0],f[1]-p[1]))};}
 return runState(k,T);
}
const HEROES=['cole','figo'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'robinson'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='robinson'?ROBINSON:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='cole'&&T>T_LUNGE&&T<T_CONTACT+.15)||(id==='figo'&&Math.abs(T-T_KNOCK)<.2)||(id==='cole'&&Math.abs(T-PASS_AT)<.2);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_CONTACT)<.35?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the side, panning with the pass out to Figo, Cole racing out, the duel, the tackle. */
const MAIN_CAM:V3=[60,20.5,-34];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-3.6],[q[1],-.4],[q[2],3],[q[3],4.7],[q[4]+.3,T_CONTACT],[S,T_CONTACT+2.3]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-3.6,T-.3)),tx=clamp(b[0]+1.5,54,72),tz=lerp(12,7,sm(-2,2.5,T)),F=lerp(4600,6800,sm(-1,4.8,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[4]+.4;},
};
/** 2 · TV slow-motion replay from a low touchline camera, side-on to the duel: Cole gets close, slows down, stays on his feet. */
const LOW_CAM:V3=[66.5,1.6,-4.2];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,.2],[q[1],.7],[q[2],2.05],[q[3],2.75],[q[4],3.2],[S,4.3]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(COLE_KEYS,T),f=trackAt(FIGO_KEYS,T),tx=lerp(m[0],(m[0]+f[0])/2,sm(.2,2.2,T)),F=lerp(1500,2150,sm(.6,3.4,T,easeInOutSine));
 return camAt([lerp(LOW_CAM[0]-1.5,LOW_CAM[0]+.6,sm(0,4.3,T)),LOW_CAM[1],LOW_CAM[2]],[tx,.9,lerp((m[1]+f[1])/2+1.2,(m[1]+f[1])/2,sm(.2,2.2,T))],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[3]+.4;},
};
/** 3 · the second replay, from a raised camera behind Figo looking down the touchline: Cole inside, the line open, the knock, the poke. */
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,3.5],[q[1],4.15],[q[2],T_KNOCK-.05],[q[3]+.6,T_CONTACT],[S,T_CONTACT+1.45]]);};
const cam3=(t:number)=>{const T=t3(t),f=trackAt(FIGO_KEYS,Math.min(T,T_CONTACT)),m=trackAt(COLE_KEYS,Math.min(T,T_LUNGE)),u=sm(T_CONTACT,T_CONTACT+1.4,T,easeInOutSine);
 const pos:V3=[f[0]-6.4-1.2*u,3.4+.4*u,10.8];return camAt(pos,[lerp((f[0]+m[0])/2+.8,BALL_REST[0]+.5,u),.7,lerp((f[1]+m[1])/2-.2,BALL_REST[1]-.6,u)],lerp(2300,2100,u));};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[3]+.7;},
};
/** 4 · the lesson plate: the duel again from a raised camera on the near side, with bold yellow teaching marks — a ring round Cole
 * (that's how), the short gap (stay close), both boots marked on the grass (stay on your feet), the inside blocked and a big arrow down
 * the line (show the winger down the line), then the knock and the poke play out and a burst marks the ball won. */
const LESSON_CAM:V3=[63,5,-4.8];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,2.55],[q[1],2.6],[q[2],3.05],[q[3],3.5],[q[3]+1.7,4.4],[S-1.2,T_CONTACT+.05],[S,T_CONTACT+.6]]);};
const cam4=(t:number)=>{const T=t4(t),m=trackAt(COLE_KEYS,Math.min(T,T_LUNGE)),f=trackAt(FIGO_KEYS,Math.min(T,T_CONTACT)),cx=(m[0]+f[0])/2,cz=(m[1]+f[1])/2;
 return camAt([LESSON_CAM[0]+(cx-65)*.6,LESSON_CAM[1],LESSON_CAM[2]],[cx+.9,.5,cz-.2],lerp(1900,2150,sm(0,SECS(3),t)));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D,a=1){s.stroke(K,p,5,.9*a);s.knockout(p,a);s.fill(Y,p,.95*a);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1,alpha=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p,alpha);}
/** a ground ring (pitch x,z, radius r) as one path */
function groundRing(x:number,z:number,r:number,c:Cam,k=.72):Path2D{const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k,c));}
 const p=new Path2D();p.addPath(polyPath(out,true));p.addPath(polyPath(inn.reverse(),true));return p;}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  const cast=['cole','figo','e-11','p-13','ball'];
  // "That's how": a yellow ring on the grass round Cole (printed under the figures); "stay on your feet": both boots stamped on the grass
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]-.2,q[1]+.2,t)),feet=sm(q[2],q[2]+.35,t,easeOutBack)*(1-sm(q[3]+.6,q[3]+1,t));
  if(hal>.01||feet>.01){stadium(s,c);
   if(hal>.01){const m=coleState(T).place;mark(s,groundRing(m.x!,-m.z!,1.15*hal,c));}
   if(feet>.01){const st=coleState(T),sk=solve(st.pose,COLE.build,st.place,FIG);for(const[toe,heel]of[[sk.lToe,sk.lHeel],[sk.rToe,sk.rHeel]]){const a=toMy(toe),b=toMy(heel);mark(s,groundRing((a[0]+b[0])/2,(a[2]+b[2])/2,.42*feet,c,.55));}}
   drawPlay(s,T,c,{ballScale:1.5,only:cast,noStadium:true});}
  else drawPlay(s,T,c,{ballScale:1.5,only:cast});
  // "Stay close": a short double-headed bar on the grass between Cole and Figo (close, but not diving in)
  const gap=sm(q[1],q[1]+.35,t,easeOutBack)*(1-sm(q[2]+.4,q[2]+.8,t));
  if(gap>.01&&T<T_LUNGE){const m=trackAt(COLE_KEYS,T),f=trackAt(FIGO_KEYS,T),a=G(m[0],m[1],c),b=G(f[0],f[1],c),w=Math.max(12,.2*P3([m[0],0,m[1]],c)[2])*gap;
   const mid:Pt=[(a[0]+b[0])/2,(a[1]+b[1])/2],sa:Pt=[lerp(mid[0],a[0],.8*gap),lerp(mid[1],a[1],.8*gap)],sb:Pt=[lerp(mid[0],b[0],.8*gap),lerp(mid[1],b[1],.8*gap)];
   arrow(s,mid,sa,w,21);arrow(s,mid,sb,w,22);}
  // "show the winger down the line": the way inside is closed (a stub that stops at a bar in front of Cole) and a big arrow runs down the line
  const show=sm(q[3],q[3]+.6,t,easeInOutSine),fade=1-sm(SECS(3)-1.6,SECS(3)-1.1,t);
  if(show>0&&fade>0){const f=trackAt(FIGO_KEYS,Math.min(T,T_KNOCK)),m=trackAt(COLE_KEYS,Math.min(T,T_LUNGE)),k=P3([f[0],0,f[1]],c)[2],w=Math.max(12,.2*k);
   const s0=G(f[0]+.6,f[1]+.3,c),s1=G(lerp(f[0],m[0],.6),lerp(f[1],m[1],.6)+.35,c),ib=G(m[0]-.5,m[1]+.8,c),ia=G(m[0]-.9,m[1]-.35,c);
   const stub=new Path2D();stub.addPath(ribbon([s0,[lerp(s0[0],s1[0],show),lerp(s0[1],s1[1],show)]],w*.8,{seed:41,taper:0,wobble:.8}));
   if(show>.6){stub.addPath(ribbon([ia,ib],w*.9,{seed:42,taper:0,wobble:.5}));}mark(s,stub,fade);
   arrow(s,G(f[0]+.9,f[1]-1.05,c),G(f[0]+8.5,f[1]-1.45,c),w*1.1,43,show,fade);}
  // the poke: a burst at the ball, then the slide-free ghost of the lunge — both boots, one on the grass, one on the ball
  const stamp=sm(SECS(3)-1.25,SECS(3)-.95,t,easeOutBack);
  if(stamp>.002){const bp=P3([BALL_T[0],.11,BALL_T[1]],c);sparkBurst(s,Y,bp[0],bp[1],.8*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   if(T>T_CONTACT+.15)drawPlayer(s,POKE(LUNGE_REACH),c,GHOST,LUNGE_PLACE);}
  frame(s);
 },
 get still(){return Q(3)[3]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'ashley-cole-signature',format:'11v11',title:'Shutting down the best winger',theme:'Stay close, stay on your feet, show him down the line',
 ageNote:'England v Portugal · World Cup quarter-final, 1 July 2006 · Gelsenkirchen, Germany',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little sun spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; England's goal line at X = 105, the near touchline Z = 0) — checked by tests/play-film-ashley-cole-signature.cjs. */
export const FACTS={BALL_T,BALL_REST,LUNGE_AT,T_CONTACT,T_KNOCK,COLLECT,ballAt,
 /** mid-sole of each boot at the reach frame of the poke (pitch metres) */
 leftFoot:()=>{const sk=solve(POKE(LUNGE_REACH),COLE.build,LUNGE_PLACE,FIG),a=toMy(sk.lToe),b=toMy(sk.lHeel);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];},
 rightFoot:()=>{const sk=solve(POKE(LUNGE_REACH),COLE.build,LUNGE_PLACE,FIG),a=toMy(sk.rToe),b=toMy(sk.rHeel);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];},
 /** hips height at the poke: a standing tackle, not a slide */
 pelvisY:()=>solve(POKE(LUNGE_REACH),COLE.build,LUNGE_PLACE,FIG).pelvis[1],
 figoAt:(T:number)=>{const st=figoState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 coleAt:(T:number)=>{const st=coleState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
