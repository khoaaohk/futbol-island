/** Marc Guéhi — SIGNATURE: "the perfectly timed block" (lib/town/iconicPlays.json: "Stay on your feet and block the shot with your body
 * facing the ball."), shown through ONE real, written-about moment: his block from Dušan Vlahović, Serbia 0–1 England, UEFA Euro 2024
 * Group C (England's opening match), Arena AufSchalke, Gelsenkirchen, Sunday 16 June 2024 (21:00 CEST kick-off, a June evening), in the
 * opening quarter of the game. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print.
 *
 * WHY THIS MOMENT: Guéhi's signature is the block that arrives at exactly the right time. The Guardian's profile of his first major
 * tournament match picks out this passage: "When he won a tackle against Vlahovic and, moments later, blocked a shot from the same player,
 * it sent a message. He would not be cowed by him." It is a block written about by name, in a real tournament match, against a named
 * shooter (the Euro 2024 FINAL is the Cucurella film, so it is not used here). The 2025 FA Cup final was considered, but no fetched source
 * describes a single Guéhi block in it.
 *
 * SOURCES (curl with a generic UA, 24 Sep 2026, cached in scratchpad/films/src-cache/):
 *  - The Guardian, David Hytner in Gelsenkirchen, "Marc Guéhi, England's 'big sponge', comes of age on the biggest stage", 17 June 2024:
 *    "Guéhi's best bits came inside the opening quarter of the game ... When he won a tackle against Vlahovic and, moments later, blocked a
 *    shot from the same player, it sent a message"; "As always, Guéhi read the game well"; he "is listed as standing at 6ft tall", Mitrovic
 *    and Vlahovic "much taller"; partnering John Stones; Southgate: "Positionally sound. Calm."
 *    https://www.theguardian.com/football/article/2024/jun/17/marc-guehi-england-serbia-euro-2024   [guardian-guehi-sponge-2024.txt]
 *  - The Guardian match report, David Hytner, 16 June 2024 (Bellingham's 13th-minute header; Serbia physical; "the central defenders, John
 *    Stones and Marc Guéhi" praised; Pickford's only big save from Vlahovic on 82')
 *    https://www.theguardian.com/football/article/2024/jun/16/serbia-england-euro-2024-match-report   [guardian-serbia-england-2024-report.txt]
 *  - Wikipedia, "UEFA Euro 2024 Group C" (raw): 16 June 2024, 21:00, Arena AufSchalke, Gelsenkirchen, 48,953, Serbia 0–1 England
 *    (Bellingham 13'); line-ups with numbers; KIT BOXES citing UEFA's tactical line-up sheet: Serbia ALL RED (DF001C shirt, shorts, socks),
 *    England ALL WHITE (shirt, shorts, socks). https://en.wikipedia.org/wiki/UEFA_Euro_2024_Group_C   [wiki-euro2024-group-c.txt]
 *  - Wikipedia, "Marc Guéhi" (raw): centre-back, Crystal Palace 2021–26 then Manchester City; played every minute of Euro 2024's group
 *    stage alongside Stones; described as "very strong, and well positioned, although not particularly tall"   [wiki-guehi.txt]
 *  - lib/town/playerAppearance.json (skin 5, short hair, England) and lib/town/playerCareers.json (England 2022–; Palace at the time).
 * CONFIRMED: the match, date, ground, England's all-white and Serbia's all-red kits; numbers Guéhi 6, Stones 5, Walker 2, Trippier 12,
 *  Rice 4, Alexander-Arnold 8, Pickford 1 (England); Vlahović 7, Mitrović 9, Milinković-Savić 20, Lukić 22, Živković 14, Kostić 11
 *  (Serbia); Guéhi and Stones the centre-backs; in the opening quarter Guéhi WON A TACKLE against Vlahović and, MOMENTS LATER, BLOCKED A
 *  SHOT FROM VLAHOVIĆ; Vlahović is taller than Guéhi (drawn 1.90 m v 1.83 m).
 * INFERRED (drawn, never narrated): the exact minute and where on the pitch it happened (drawn just outside England's box, left of centre
 *  from Serbia's view); how the tackle was won (a right-footed poke round Vlahović as he shielded the ball with his back to goal); how the
 *  ball got back to Vlahović (a loose ball to Milinković-Savić and a pass back to him — the accounts only say "moments later"); that
 *  Vlahović shot with his LEFT foot (his stronger foot) from about 20 m, low; that the ball hit Guéhi's shins, square on, with his arms held
 *  behind him; where the rebound went; where every other player stood; Pickford's keeper kit (printed yellow, never named); Serbia's paper
 *  numbers and England's navy numbers; Vlahović's hair (drawn short, tied back); which end England defended (their goal on the RIGHT of the main
 *  camera). The stadium, not from a fetched source: a closed rectangular two-tier bowl under a roof with an opening over the pitch and the
 *  video cube hung above the centre circle; evening daylight with the floodlights on; the crowd's colours; camera placements and lenses.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock T (seconds,
 * T = 0 Vlahović's left foot meets the shot): 1 = the high main-stand camera, live (the pass into Vlahović, Guéhi's tackle, the loose ball,
 * the pass back, the shot, the block); 2 = the slow-motion replay, low reverse angle from behind the shooter (Guéhi reads it, steps across
 * into the lane, stays on his feet, square to the ball — rings under his boots, a sightline, the burst as it hits him, the rebound);
 * 3 = the lesson from the side (the shooting lane from the ball to the posts, a crossed-out red ghost that dives in, the boot rings, the
 * block and a tick). Every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary
 * motion, motion smears on the fast moves); small figures and every figure inside a passage print at `low` detail. Handedness: the world
 * is right-handed like athlete.ts (x toward England's goal line at x = 0, y up, +z = the near / main-stand side), so a player facing +x has
 * his right at +z; Vlahović strikes with foot 'l' with no mirrored projector. Poses on twos, cameras on ones, all randomness seeded, every
 * action keyed to cue times (withTiming swaps in the recorded word onsets). Budget ≈ 150–260 plate ops per frame.
 *
 * LEAD: when public/plays/narration/guehi-signature/timing.json exists, replace the null in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/guehi-signature/timing.json';  (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,runCycle,backpedal,dribble,strike,lunge,keeperSet,slideTackle,posed,blendPose,keyPoses,
 STRIKE_CONTACT,type Pose,type Camera,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in order — so no cue starts with a
 * word that also appears between it and the previous cue, and no cue starts with a contraction, a hyphenated or an accented word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The Euros, live',text:'Gelsenkirchen, 2024. England play Serbia at the Euros. Early on, Marc Guéhi wins a tackle against the big striker Dušan Vlahović. Moments later, Vlahović shoots... blocked by Guéhi!',tail:2.2,
  cues:['Gelsenkirchen','England play','Early on','Marc','wins a tackle','big striker','Moments later','shoots','blocked by']},
 {label:'Watch again',text:'Watch again, slowly. Guéhi reads it early. He steps across into the shot, stays on his feet and keeps his body facing the ball. Bang, it hits him and bounces away!',tail:1.8,
  cues:['Watch again','reads it','steps across','stays on','keeps his body','facing the ball','Bang','bounces away']},
 {label:'Your turn',text:"Your turn. When a striker shoots, don't dive in. Stay on your feet, get in the way, and block the shot with your body facing the ball!",tail:2.2,
  cues:['Your turn','striker shoots','dive in','Stay on your feet','get in the way','block the shot','facing the ball']},
];
import timingJson from '../../../public/plays/narration/guehi-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈2.3 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.34;if(/\.\.\.$/.test(w))t+=.28;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('guehi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('guehi: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const arc3=(a:V3,b:V3,u:number,lift:number):V3=>{const p=mix3(a,b,u);p[1]+=lift*4*u*(1-u);return p;};
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*clamp(u);
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces along the ground direction (dx,dz) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
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

// ---------------------------------------------------------------- the Arena AufSchalke on a June evening: a closed two-tier bowl, the roof, the video cube
/** stand planes (a along, b up the rake 0..1), close to the pitch (no running track): 0 the far side (z<0), 1 behind England's goal
 * (x>0), 2 the main stand (z>0, the camera side), 3 the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-113,8,a),1.2+27*b,-41-31*b],
 (a,b)=>[8+29*b,1.2+27*b,lerp(-41,41,a)],
 (a,b)=>[lerp(8,-113,a),1.2+25*b,41+29*b],
 (a,b)=>[-113-29*b,1.2+27*b,lerp(41,-41,a)],
];
const STAND_COLS=[112,72,112,72],STAND_ROWS=15,WALK=.46;
/** crowd colour mix per stand: [paper, red, blue, yellow] cumulative thresholds (England in white and red, Serbia in red) */
const CROWD:[number,number,number][]=[[.44,.9,.96],[.52,.9,.96],[.44,.9,.96],[.3,.9,.96]];
/** flags on the stand fronts: [stand, a, kind] kind 0 = England (St George's cross), 1 = Serbia (red, blue, white bands) */
const FLAGS:[number,number,number][]=[[0,.42,0],[0,.55,1],[0,.7,0],[1,.22,0],[1,.4,0],[1,.6,0],[1,.8,0],[2,.18,0],[2,.34,1],[3,.3,1],[3,.46,1],[3,.62,1],[3,.78,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 // the evening: a warm pale sky through the roof opening
 s.field(B,.18,.5);
 const all=polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true);s.tone(Y,all,.22);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  seg3(c,S(0,WALK),S(1,WALK),.5,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.2),[0,26.5,0]),add3(S(0,.2),[0,26.5,0])]));
  seg3(c,add3(S(0,.2),[0,26.3,0]),add3(S(1,.2),[0,26.3,0]),.5,edge);}
 s.knockout(planes);s.tone(K,planes,.5);s.tone(R,planes,.12);s.knockout(walk,.45);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mix=CROWD[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.045)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.3)/.7,ink=u<mix[0]?0:u<mix[1]?1:u<mix[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.66);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.9);
 s.knockout(roof);s.tone(K,roof,.6);s.tone(B,roof,.28);s.knockout(edge,.85);
 // the flags on the stand fronts
 const fl=new Path2D(),rd=new Path2D(),bl=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(rd,polyP(c,[P(.42,.005),P(.58,.005),P(.58,.08),P(.42,.08)]));addPoly(rd,polyP(c,[P(0,.035),P(1,.035),P(1,.05),P(0,.05)]));}
  else{addPoly(rd,polyP(c,[P(0,.057),P(1,.057),P(1,.08),P(0,.08)]));addPoly(bl,polyP(c,[P(0,.031),P(1,.031),P(1,.057),P(0,.057)]));}}
 s.knockout(fl);s.fill(R,rd,.95);s.fill(B,bl,.95);
 // the floodlights along the roof's inner edge
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.03,.2),[0,25.8,0]),b=add3(S(u+.03,.2),[0,25.8,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);seg3(c,a,b,4.5,halo);}}
 s.tone(Y,halo,.22);s.knockout(lamp);s.fill(Y,lamp,.8);
 // the video cube hung over the centre circle (four screens), on its cables
 {const x0=-56.5,x1=-48.5,y0=21,y1=27,z0=-4,z1=4,e=c.eye,box=new Path2D(),scn=new Path2D(),cab=new Path2D();
  const faces:{n:V3;q:V3[]}[]=[{n:[1,0,0],q:[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]]},{n:[-1,0,0],q:[[x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1]]},
   {n:[0,0,1],q:[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]},{n:[0,0,-1],q:[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]]},{n:[0,-1,0],q:[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]}];
  for(const f of faces){const ctr=f.q.reduce((a,p)=>add3(a,[p[0]/4,p[1]/4,p[2]/4]),[0,0,0] as V3);if(dot3(f.n,[e[0]-ctr[0],e[1]-ctr[1],e[2]-ctr[2]])<=0)continue;
   const q=polyP(c,f.q);if(q.length<3)continue;addPoly(box,q);if(f.n[1]===0)addPoly(scn,polyP(c,f.q.map(p=>mix3(ctr,p,.84))));}
  for(const[x,z] of[[x0,z0],[x1,z1],[x0,z1],[x1,z0]] as [number,number][])seg3(c,[x,y1,z],[x*.5+(-52.5)*.5,40,z*.3],.08,cab,.8);
  s.fill(K,cab,.6);s.knockout(box);s.fill(K,box,.88);s.knockout(scn,.5);s.tone(B,scn,.45);s.tone(Y,scn,.25);}
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- the grass (mowing stripes, the roof's evening shadow), lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{goal?:boolean}={}){
 const g=polyP(c,[[-112,0,-40],[7,0,-40],[7,0,40],[-112,0,40]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.85);s.tone(B,gp,.8);s.tone(K,gp,.14);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // the roof's evening shadow across the far side of the pitch
 const sh=polyP(c,[[-112,0,-40],[7,0,-40],[7,0,-21],[-40,0,-17],[-112,0,-23]]);if(sh.length>2)s.tone(K,polyPath(sh,true),.16);
 // LED boards behind the goal and along both touchlines
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5,0,-37],[5,0,37]);board([-108,0,-38],[5,0,-38]);board([-108,0,38],[5,0,38]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[4.9,.25,z],[4.9,.25,z+3.4],[4.9,.7,z+3.4],[4.9,.7,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.7,zz],[x,.7,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.8);s.fill(B,pn,.6);s.fill(Y,pn,.45);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,34,1,Math.PI/2,Math.PI,5);circ(0,-34,1,Math.PI,1.5*Math.PI,5);
 s.knockout(ln,.9);
 // corner flags at England's end
 const pole=new Path2D(),flag=new Path2D();
 for(const z of [34,-34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);const a=pr(c,[0,1.55,z]),b=pr(c,[-.45,1.4,z]),e=pr(c,[0,1.2,z]);if(a&&b&&e)flag.addPath(polyPath([a,b,e],true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 if(o.goal!==false)goal3(s,c);
}
/** England's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof */
const GOAL={x:0,z0:-3.66,z1:3.66,h:2.44};
function goal3(s:Sheet,c:Cam,veil=.28){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bx=2;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,veil);s.tone(K,net,.12*veil/.28);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[bx,1.9,z],.022,mesh,.7);seg3(c,[bx,1.9,z],[bx,0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;seg3(c,[bx,y,z0],[bx,y,z1],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}
/** grass kicked up off a point (the poke, the block): little blades on ballistic arcs, age in seconds */
function turf(s:Sheet,c:Cam,P:V3,age:number,o:{n?:number;v?:number;up?:number;seed?:number;size?:number}={}){
 if(age<0||age>.6)return;const{n=8,v=1.4,up=1.4,seed=1,size=.04}=o,p=new Path2D(),fade=1-clamp((age-.3)/.3);
 for(let i=0;i<n;i++){const a=hash(i,seed)*TAU,sp=v*(.5+.7*hash(i,seed+1)),vy=up*(.4+hash(i,seed+2)),Q:V3=[P[0]+Math.cos(a)*sp*age,Math.max(.01,P[1]+vy*age-4.9*age*age),P[2]+Math.sin(a)*sp*age],q=pr(c,Q);if(!q)continue;
  const r=Math.max(1.6,kAt(c,Q)*size);p.addPath(polyPath([[q[0]-r,q[1]],[q[0],q[1]-r*.4],[q[0]+r,q[1]],[q[0],q[1]+r*.4]],true));}
 s.fill(B,p,.8*fade);s.fill(Y,p,.6*fade);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** England: all white (confirmed kit box: white shirts, white shorts, white socks); navy numbers and trim */
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:K,shade:[K,.26],numberInk:K,hairStyle:'short',sleeves:'short',...o});
/** Serbia: all red (confirmed kit box: red shirts, red shorts, red socks); paper numbers (inferred) */
const serbia=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:'paper',numberInk:'paper',hairStyle:'short',sleeves:'short',...o});
/** Marc Guéhi: No. 6 (confirmed), "listed as standing at 6ft", strong for his size; skin 5, short dark hair (playerAppearance.json) */
const GUEHI_B={height:1.83,bulk:1.06,thighs:1.06};
const GUEHI_ST=england({number:6,skin:SKIN_D,hair:[K,.95],build:GUEHI_B,seed:6});
/** Dušan Vlahović: No. 7 (confirmed), taller than Guéhi (drawn 1.90 m); his dark hair drawn short/tied back (inferred) */
const VLAH_B={height:1.9,bulk:1.02};
const VLAH_ST=serbia({number:7,hair:[K,.9],hairStyle:'short',build:VLAH_B,seed:7});
/** Jordan Pickford: No. 1 (confirmed); the yellow keeper kit is inferred (never named) */
const PICK_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.7],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.85},seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: the hem trails); smear = a halftone echo + speed lines for fast moves. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the play (T = play seconds; T = 0 = Vlahović's left foot meets the shot)
const T_LPASS=-6.6,T_RECV1=-5.75,T_TACK=-4.7,T_SMS=-3.55,T_PASS=-1.35,T_RECV=-.55,T_BLK=.1;
type Role='guehi'|'vlah'|'sms'|'lukic'|'pick'|'eng'|'srb';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions are Hermite-interpolated between keys [T, x, z]. Only Guéhi and Vlahović have beats in the accounts (the tackle, then the
 * blocked shot); the pass-backs and everyone else are illustrative (numbers from the line-ups, positions inferred). */
const ACTORS:Actor[]=[
 {name:'Guéhi',role:'guehi',style:GUEHI_ST,key:true,keys:[[-8,-19.6,-1.6],[T_LPASS,-20.6,-2],[T_RECV1,-22.3,-2.4],[-5.2,-22.7,-2.4],[T_TACK,-22.88,-2.42],[-4.1,-22.4,-2.2],[-3.2,-20.8,-1.4],[-2.2,-19.4,-.4],[-1.35,-18.5,.3],[-.7,-17.9,.8],[-.3,-17.55,1.02],[0,-17.45,1.1],[T_BLK,-17.45,1.1],[.7,-17.55,1.05],[1.6,-18.3,.5],[3.5,-19.8,-.4],[6,-20.5,-.8]]},
 {name:'Vlahović',role:'vlah',style:VLAH_ST,key:true,keys:[[-8,-21,-1.6],[T_LPASS,-22.4,-2.1],[T_RECV1,-23.6,-2.45],[T_TACK,-23.8,-2.55],[-4.1,-23.5,-2.2],[-3.2,-22.7,-1],[-2.2,-21.9,.3],[-1.35,-21.4,1.1],[T_RECV,-20.9,1.55],[0,-20.2,1.6],[.5,-19.8,1.6],[2,-19.4,1.4],[6,-19.6,1]]},
 {name:'Milinković-Savić',role:'sms',style:serbia({number:20,build:{height:1.92,bulk:1.04},seed:20}),keys:[[-8,-33,-4.6],[T_TACK,-31.4,-6.8],[T_SMS,-30.4,-8],[-2.6,-28.8,-7.1],[-1.8,-27.4,-5.8],[T_PASS,-26.7,-5.1],[-.6,-26.2,-4.5],[2,-25.2,-3.4],[6,-25,-3]]},
 {name:'Lukić',role:'lukic',style:serbia({number:22,build:{height:1.85},seed:22}),keys:[[-8,-37.5,-2.8],[-7.2,-36.6,-2.6],[T_LPASS,-35.9,-2.5],[-5.4,-35.2,-2.2],[-3,-33.4,-1.4],[6,-30.5,-.4]]},
 {name:'Pickford',role:'pick',style:PICK_ST,key:true,keys:[[-8,-2.4,-.9],[-4.5,-2.5,-.6],[-1.4,-2.7,.1],[0,-2.9,.4],[6,-2.8,.4]]},
 {name:'Stones',role:'eng',style:england({number:5,build:{height:1.88},seed:5}),keys:[[-8,-15.2,-6.6],[-4.5,-15.6,-5.8],[-1.4,-15.2,-4.2],[0,-15,-3.8],[6,-15.6,-4]]},
 {name:'Walker',role:'eng',style:england({number:2,skin:SKIN_D,hair:[K,.95],build:{height:1.83},seed:2}),keys:[[-8,-18.5,12.5],[-4.5,-17.6,10.6],[-1.4,-16.8,8.4],[0,-16.5,7.8],[6,-17,8]]},
 {name:'Trippier',role:'eng',style:england({number:12,build:{height:1.73},seed:12}),keys:[[-8,-20,-15.5],[-4.5,-18.6,-13.4],[-1.4,-17.4,-11.6],[0,-17,-11],[6,-18,-11]]},
 {name:'Rice',role:'eng',style:england({number:4,build:{height:1.85,bulk:1.04},seed:4}),keys:[[-8,-28.5,1.5],[T_TACK,-28.6,-3.4],[T_SMS,-28.9,-6.2],[-2.4,-28,-6],[T_PASS,-26.4,-4],[0,-24.8,-2.6],[6,-24,-2]]},
 {name:'Alexander-Arnold',role:'eng',style:england({number:8,build:{height:1.8},seed:8}),keys:[[-8,-31,8],[-4,-29.5,5.2],[0,-27,3.4],[6,-26,3]]},
 {name:'Mitrović',role:'srb',style:serbia({number:9,build:{height:1.89,bulk:1.08},seed:9}),keys:[[-8,-16.6,-7.4],[-4.5,-17,-6.6],[-1.4,-16.4,-5.2],[0,-16.2,-4.8],[6,-16.8,-5]]},
 {name:'Živković',role:'srb',style:serbia({number:14,build:{height:1.7},seed:14}),keys:[[-8,-25,17.5],[-4,-22.4,14],[0,-20.4,11.4],[6,-20,10.6]]},
 {name:'Kostić',role:'srb',style:serbia({number:11,build:{height:1.84},seed:11}),keys:[[-8,-27,-21],[-4,-23.6,-18.6],[0,-21.4,-16.4],[6,-21,-16]]},
];
const GUEHI_I=0,VLAH_I=1,SMS_I=2,LUKIC_I=3,PICK_I=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-8,T1=6,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posOf(k,T-.08),b=posOf(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lAnk:-8,rAnk:-8,lean:18,pitch:5,lShA:28,rShA:28,lShF:16,rShF:16,lElb:52,rElb:52,neckP:-10});
/** Guéhi's block: he gets set early (square, feet shoulder-width, knees soft, arms held behind him so the ball cannot hit a hand), the
 * body stays facing the ball; at the hit a flinch (chin down, knees give, squash) — he stays on his feet — then up and after the rebound */
const BL_SET=posed({lHipF:24,rHipF:24,lKnee:36,rKnee:36,lHipA:16,rHipA:16,lHipR:6,rHipR:6,lAnk:-6,rAnk:-6,lean:12,pitch:3,lShF:-44,rShF:-44,lShA:14,rShA:14,lElb:64,rElb:64,neckP:-2});
const BL_WIDE=posed({lHipF:26,rHipF:26,lKnee:40,rKnee:40,lHipA:20,rHipA:20,lHipR:8,rHipR:8,lAnk:-8,rAnk:-8,lean:14,pitch:3,lShF:-50,rShF:-50,lShA:12,rShA:12,lElb:70,rElb:70,neckP:4,squash:-.03});
const BL_HIT=posed({lHipF:30,rHipF:30,lKnee:50,rKnee:50,lHipA:18,rHipA:18,lHipR:8,rHipR:8,lAnk:-4,rAnk:-4,lean:26,pitch:0,twist:-6,lShF:-40,rShF:-46,lShA:20,rShA:16,lElb:60,rElb:66,neckP:24,squash:-.08});
const BL_AFTER=posed({lHipF:28,rHipF:20,lKnee:40,rKnee:32,lHipA:14,rHipA:12,lAnk:-8,rAnk:-4,lean:16,pitch:4,lShA:30,rShA:26,lShF:10,rShF:16,lElb:50,rElb:54,neckP:-6});
const guehiBlock=(T:number)=>{const u=T-T_BLK;return keyPoses(u,[[-.62,READY],[-.36,BL_SET],[-.06,BL_WIDE],[.05,BL_HIT],[.34,BL_AFTER],[.8,READY]]);};
/** Vlahović shielding with his back to goal (arms out, weight back into Guéhi), and the lurch when the ball is poked away */
const SHIELD=posed({lHipF:30,rHipF:26,lKnee:46,rKnee:42,lHipA:22,rHipA:22,lAnk:-8,rAnk:-6,lean:14,pitch:-4,lShA:62,rShA:58,lShF:4,rShF:-8,lElb:40,rElb:46,neckP:18,neckY:-24});
const LURCH=posed({lHipF:44,rHipF:-8,lKnee:62,rKnee:26,lHipA:10,rHipA:6,lAnk:-10,rAnk:16,lean:26,pitch:10,roll:-6,lShA:48,rShA:36,lShF:30,rShF:-20,lElb:40,rElb:60,neckP:8,neckY:30});
const P_FRUST=posed({lShA:30,rShA:30,lShF:60,rShF:60,lElb:120,rElb:120,lHand:1,rHand:1,lHipF:8,rHipF:10,lKnee:12,rKnee:14,neckP:10,lean:6});
/** Guéhi's poke: the right leg reaching round Vlahović (the athlete lunge, full reach at .6 = T_TACK) */
const guehiPoke=(T:number)=>lunge(clamp(.6+(T-T_TACK)/1.1),{side:'r'});
/** Vlahović's shot: a LEFT-footed strike (inferred foot), contact at T = 0 */
const vlahStrike=(T:number)=>strike(clamp(STRIKE_CONTACT+T/.9),{foot:'l',power:.95});
/** the two passes (Lukić's into Vlahović, Milinković-Savić's back to him): right-footed, low power (inferred) */
const lukicStrike=(T:number)=>strike(clamp(STRIKE_CONTACT+(T-T_LPASS)/.9),{foot:'r',power:.5});
const smsStrike=(T:number)=>strike(clamp(STRIKE_CONTACT+(T-T_PASS)/.9),{foot:'r',power:.55});
const SHOT_YAW=yawOf(20.2,-1.6),LUKIC_YAW=yawOf(-23.6+35.9,-2.45+2.5),SMS_YAW=yawOf(-20.9+26.7,1.55+5.1);
/** the whole pose of actor k at T, with its yaw */
function poseOf(k:number,T:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,T),b=ballAt(T);
 let yaw=sp>.9?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='pick'?keeperSet(T*1.3):READY;
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,T)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 const toBall=yawOf(b[0]-x,b[2]-z);
 if(a.role==='eng'||a.role==='srb'){if(sp<3)yaw=lerpAng(yaw,toBall,.6);}
 if(a.role==='pick'){yaw=lerpAng(Math.PI,toBall,.6);}
 if(a.role==='lukic'){const u=(T-T_LPASS)/.9+STRIKE_CONTACT;if(u>0&&u<1.3){p=blendPose(p,lukicStrike(T),Math.min(sm(0,.18,u),1-sm(1,1.3,u)));yaw=lerpAng(yaw,LUKIC_YAW,sm(T_LPASS-.5,T_LPASS-.15,T)*(1-sm(T_LPASS+.6,T_LPASS+1.1,T)));}}
 if(a.role==='sms'){
  if(T>T_SMS&&T<T_PASS-.45)p=blendPose(p,dribble(distOf(k,T)/2,{foot:'r',speed:clamp(sp/7)}),clamp((sp-.5)/.9));
  const u=(T-T_PASS)/.9+STRIKE_CONTACT;if(u>0&&u<1.3){p=blendPose(p,smsStrike(T),Math.min(sm(0,.18,u),1-sm(1,1.3,u)));yaw=lerpAng(yaw,SMS_YAW,sm(T_PASS-.5,T_PASS-.15,T)*(1-sm(T_PASS+.6,T_PASS+1.1,T)));}}
 if(a.role==='vlah'){
  // back to goal as the pass comes in, shielding; the poke takes it off him and he lurches after it; then he spins, takes the pass back
  // on the half-turn and shoots with his left
  const sh=sm(T_RECV1-.5,T_RECV1-.1,T)*(1-sm(T_TACK-.05,T_TACK+.1,T));
  if(T<T_TACK+.1)yaw=lerpAng(yaw,Math.PI+.15,sm(T_LPASS,T_RECV1-.2,T));
  if(sh>0)p=blendPose(p,SHIELD,sh);
  const lu=sm(T_TACK-.05,T_TACK+.12,T)*(1-sm(T_TACK+.5,T_TACK+.9,T));if(lu>0){p=blendPose(p,LURCH,lu);yaw=lerpAng(yaw,Math.PI+.6,lu);}
  if(T>T_TACK+.5&&T<T_RECV-.2)yaw=lerpAng(yaw,toBall,.5);
  const u=T/.9+STRIKE_CONTACT;if(u>0&&u<1.35){p=blendPose(p,vlahStrike(T),Math.min(sm(0,.16,u),1-sm(1.05,1.35,u)));yaw=lerpAng(yaw,SHOT_YAW,sm(T_RECV-.2,-.3,T));}
  if(T>T_BLK+.5){const w=sm(T_BLK+.5,T_BLK+1,T)*(1-sm(3,3.8,T));if(w>0)p=blendPose(p,P_FRUST,w*.6);}}
 if(a.role==='guehi'){
  // tight behind Vlahović, goal-side; the poke with his right; then he drops off, facing the ball, and gets set BEFORE the shot
  if(T<T_TACK+.6)yaw=lerpAng(yaw,Math.PI,.9);
  const pk=sm(T_TACK-.62,T_TACK-.4,T)*(1-sm(T_TACK+.35,T_TACK+.6,T));if(pk>0)p=blendPose(p,guehiPoke(T),pk);
  if(T>T_TACK+.6&&T<T_BLK+.6){const[sx,sz]=posOf(VLAH_I,T);yaw=lerpAng(yaw,yawOf(b[0]-x,b[2]-z),sp>2.5?.4:.85);if(T>-.7)yaw=lerpAng(yaw,yawOf(sx-x,sz-z),sm(-.7,-.4,T));}
  const w=sm(-.62,-.42,T)*(1-sm(T_BLK+.7,T_BLK+1.1,T));if(w>0)p=blendPose(p,guehiBlock(T),w);}
 return{p,yaw};
}

// ---------------------------------------------------------------- the contacts, solved from the bodies; the ball
const FIG=1.04;// figures 4 % over life size so they read in a small card window
function skel(k:number,T:number){const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T);return{sk:solve(p,ACTORS[k].style.build,{x,z,yaw},FIG),yaw};}
function toe(k:number,T:number,foot:'l'|'r'):V3{const{sk}=skel(k,T),q=foot==='l'?sk.lToe:sk.rToe;return[q[0],.11,q[2]];}
/** where the shot meets Guéhi: his shins (a third of the way from the knees to the ankles), a ball radius in front of him */
function shins(T:number):V3{const{sk,yaw}=skel(GUEHI_I,T),kn=mix3(sk.lKn,sk.rKn,.5),an=mix3(sk.lAn,sk.rAn,.5),m=mix3(kn,an,.52);return[m[0]-Math.cos(yaw)*-.2,m[1],m[2]+Math.sin(yaw)*-.2];}
// ballAt is read by poseOf (yaws) while the contacts are solved: it runs on these close defaults, then on the solved points (two passes)
let LPASS_PT:V3=[-35.4,.11,-2.5],RECV1_PT:V3=[-24.2,.11,-2.7],POKE_PT:V3=[-23.4,.11,-3.4],SMS1_PT:V3=[-29.9,.11,-8],SMS_PT:V3=[-26.2,.11,-5],RECV_PT:V3=[-20.6,.11,1.4],SHOT_PT:V3=[-19.8,.11,1.5],BLK_PT:V3=[-17.2,.35,1.1];
const REB1=():V3=>[BLK_PT[0]-3.9,.11,BLK_PT[2]-2.6],REB2=():V3=>[BLK_PT[0]-8.4,.11,BLK_PT[2]-6.2],REB3=():V3=>[BLK_PT[0]-10.2,.11,BLK_PT[2]-7.6];
/** the ball at play time T: Lukić's pass into Vlahović, shielded, poked loose by Guéhi, gathered and passed back by Milinković-Savić,
 * Vlahović's touch and left-footed shot, Guéhi's block, the rebound bouncing away out of the box */
function ballAt(T:number):V3{
 const ahead=(k:number,t:number,lead:number):V3=>{const[x,z]=posOf(k,t),v=velOf(k,t),s=Math.hypot(v[0],v[1])||1;return[x+v[0]/s*lead,.11,z+v[1]/s*lead];};
 if(T<T_LPASS)return mix3(ahead(LUKIC_I,T,.6),LPASS_PT,sm(T_LPASS-.4,T_LPASS,T));
 if(T<T_RECV1)return mix3(LPASS_PT,RECV1_PT,easeOut((T-T_LPASS)/(T_RECV1-T_LPASS)));
 if(T<T_TACK)return mix3(RECV1_PT,POKE_PT,sm(T_RECV1+.2,T_TACK,T));
 if(T<T_SMS)return mix3(POKE_PT,SMS1_PT,easeOut((T-T_TACK)/(T_SMS-T_TACK)));
 if(T<T_PASS){const lead=.5+.2*Math.abs(Math.sin(distOf(SMS_I,T)/2*Math.PI));return mix3(mix3(SMS1_PT,ahead(SMS_I,T,lead),sm(T_SMS,T_SMS+.3,T)),SMS_PT,sm(T_PASS-.35,T_PASS,T));}
 if(T<T_RECV)return mix3(SMS_PT,RECV_PT,(T-T_PASS)/(T_RECV-T_PASS)*.8+.2*easeOut((T-T_PASS)/(T_RECV-T_PASS)));
 if(T<0)return mix3(RECV_PT,SHOT_PT,easeOut((T+-T_RECV)/-T_RECV));
 if(T<T_BLK)return mix3(SHOT_PT,BLK_PT,T/T_BLK);
 if(T<T_BLK+.55)return arc3(BLK_PT,REB1(),easeOut((T-T_BLK)/.55),.9);
 if(T<T_BLK+1.6)return arc3(REB1(),REB2(),(T-T_BLK-.55)/1.05,.45);
 const u=clamp((T-T_BLK-1.6)/1.8);return mix3(REB2(),REB3(),easeOut(u));
}
const spinAt=(T:number)=>T<0?-TAU*1.5*T:T<T_BLK?TAU*6*T:TAU*6*T_BLK-TAU*3*(T-T_BLK);
for(let pass=0;pass<2;pass++){LPASS_PT=toe(LUKIC_I,T_LPASS,'r');RECV1_PT=add3(toe(VLAH_I,T_RECV1,'r'),[-.25,0,-.2]);POKE_PT=toe(GUEHI_I,T_TACK,'r');SMS1_PT=toe(SMS_I,T_SMS,'r');
 SMS_PT=toe(SMS_I,T_PASS,'r');RECV_PT=toe(VLAH_I,T_RECV,'l');SHOT_PT=toe(VLAH_I,0,'l');BLK_PT=shins(T_BLK);}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,T:number,o:{min?:number;lines?:boolean;prevT?:number}={}){
 const P=ballAt(T),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??10,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prevT!==undefined&&T>-.05&&T<T_BLK+.7){const a=pr(c,ballAt(o.prevT));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(T),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the match through a camera
type PlayOut={bg:Pt|null;guehi?:DrawResult};
type Env={minBall?:number;lines?:boolean;hero?:boolean;near?:number;after?:(r:PlayOut)=>void;ghost?:()=>void};
/** everything on the pitch at T (the ball on ones, poses on twos at Tp; Tprev = the drawing before, for secondary motion), in depth order
 * with the goal */
function play(s:Sheet,c:Cam,T:number,Tp:number,Tprev:number,e:Env={}):PlayOut{
 const v=view(s),m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const items:{d:number;draw:()=>void}[]=[],out:PlayOut={bg:null};
 const behind=c.eye[0]>.5;
 items.push({d:behind?-1:toCam(c,[1,1.2,0])[2],draw:()=>goal3(s,c,behind?.16:.28)});
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();let nsh=0;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,T),q=toCam(c,[x,.9,z]);if(q[2]<(e.near??2.5))return;const g=scr(c,q),h=c.F*1.85/q[2];
  if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  const gg=pr(c,[x,0,z]);if(gg&&h<380){sh.addPath(polyPath(blob(gg[0],gg[1],h*.14,h*.04,a.style.seed??1,{amp:.05,n:14}),true));nsh++;}
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,Tp),px=h*ppu;
   const detail=passing?(k===GUEHI_I?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
   const fast=e.hero&&((k===GUEHI_I&&Tp>T_BLK-.1&&Tp<T_BLK+.3)||(k===VLAH_I&&Tp>-.25&&Tp<.25));
   const prv=h>=240&&!passing?poseOf(k,Tprev):null,[px0,pz0]=posOf(k,Tprev);
   const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:h<380?false:undefined,detail},{x,z,yaw},prv?{prev:prv.p,prevPlace:{x:px0,z:pz0,yaw:prv.yaw},smear:!!fast}:{});
   if(k===GUEHI_I)out.guehi=r;}});});
 if(nsh)s.tone(K,sh,.4);
 const bq=toCam(c,ballAt(T));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,T,{min:e.minBall,lines:e.lines,prevT:T-.06});out.bg=r?r.g:null;}});
 e.ghost?.();
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 e.after?.(out);
 turf(s,c,POKE_PT,T-T_TACK,{n:7,seed:3});
 return out;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** a ring on the grass round a point (a stamped spot), knocked out under */
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink=Y){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r,.01,z+Math.sin(i/36*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.06),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow on the grass from a to b (world, y≈0), drawn to progress u */
function grassArrow(s:Sheet,c:Cam,a:V3,b:V3,u:number,ink:string,wm=.14,seed=70){if(u<=.02)return;const A=pr(c,a),Bp=pr(c,b);if(!A||!Bp)return;const wd=Math.max(6,kAt(c,mix3(a,b,.5))*wm);
 const e:Pt=[lerp(A[0],Bp[0],u),lerp(A[1],Bp[1],u)];s.knockout(ribbon([A,e],wd*2.1,{seed,taper:0,wobble:.6}),.85);laneArrow(s,ink,A,Bp,wd,{progress:u,seed:seed+1,head:wd*2.6});}
/** the ball's flight between play times a..b as a bold ribbon with an arrowhead (progress u) */
function flightArrow(s:Sheet,c:Cam,a:number,b:number,u:number,ink:string,wm=.12){if(u<=.02)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=18;i++){const P=ballAt(lerp(a,b,i/18)),q=toCam(c,P);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=partial(smoothPts(pts,false,6,2),u),wd=Math.max(7,c.F*wm/d);if(line.length<2)return;
 s.knockout(ribbon(line,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(line,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const e=line[line.length-1],p0=line[Math.max(0,line.length-3)];if(Math.hypot(e[0]-p0[0],e[1]-p0[1])>1)laneArrow(s,ink,p0,[e[0]+(e[0]-p0[0])*.02,e[1]+(e[1]-p0[1])*.02],wd,{seed:62,head:wd*3});}
/** "eyes on the ball": a dotted yellow sightline from his eyes to the ball */
function sightline(s:Sheet,r:DrawResult|undefined,bg:Pt|null,w:number){if(!r||!bg||w<=.02)return;const h=r.joints.face,n=r.joints.head,hs=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+6;
 const L=Math.hypot(bg[0]-h[0],bg[1]-h[1]);if(L<hs)return;const dots=new Path2D(),N=Math.max(3,Math.min(14,Math.floor(L/(hs*1.1))));
 for(let i=1;i<N;i++){const u=i/N;if(u>w)break;const x=lerp(h[0],bg[0],u),y=lerp(h[1],bg[1],u),rr=hs*.28;dots.addPath(polyPath(blob(x,y,rr,rr,i+5,{amp:.1,n:10}),true));}
 s.knockout(dots,.8);s.fill(Y,dots,.95);}
/** "stays on his feet": a small yellow ring under each boot (solved from the body) */
function bootRings(s:Sheet,c:Cam,T:number,w:number){if(w<=.02)return;const{sk}=skel(GUEHI_I,T);
 for(const f of [sk.lAn,sk.rAn])groundRing(s,c,f[0],f[2],.26,w*easeOutBack(clamp(w*1.2)));}
/** "body facing the ball": a yellow arrow on the grass from his feet toward the shooter (the way his chest points) */
function facingArrow(s:Sheet,c:Cam,w:number,seed=78){if(w<=.02)return;const[x,z]=posOf(GUEHI_I,T_BLK),d=[SHOT_PT[0]-x,SHOT_PT[2]-z],l=Math.hypot(d[0],d[1])||1;
 grassArrow(s,c,[x-d[0]/l*.35,.01,z-d[1]/l*.35],[x+d[0]/l*1.5,.01,z+d[1]/l*1.5],w,Y,.12,seed);}
/** the block: a yellow burst off his shins */
function contactBurst(s:Sheet,c:Cam,T:number,seed:number,scale=.55){const age=T-T_BLK;if(age<=-.03||age>=.4)return;const q=pr(c,BLK_PT);if(!q)return;
 sparkBurst(s,Y,q[0],q[1],kAt(c,BLK_PT)*scale,{n:10,seed,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.22)/.18)),width:Math.max(6,kAt(c,BLK_PT)*.04)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** T keyed to the words: Lukić's pass on "Early on", the poke on "wins a tackle", the pass back around "Moments later", the shot on
 * "shoots", the block on "blocked" — the commentary a beat behind the play, as on the night */
const tau1=(t:number)=>key(t,mono([[0,-7.9],[CUE(0,'Early on')-.1,T_LPASS-.2],[CUE(0,'wins a tackle')+.15,T_TACK],[CUE(0,'Moments later')-.1,T_PASS-.3],[CUE(0,'shoots')+.05,0],[CUE(0,'blocked by')-.05,T_BLK+.05],[SECS(0),T_BLK+(SECS(0)-CUE(0,'blocked by'))*.95]]),linear);
const P1:V3=[-23,14,60];
function cam1(t:number):Cam{
 const b=()=>ballAt(tau1(t));
 return plan(t,[
  [0,0,()=>({P:P1,T:[-34,5,-6],fov:40})],
  [CUE(0,'England play')-.2,1.3,()=>({P:P1,T:[-30,2,-4],fov:28})],
  [CUE(0,'Early on')-.3,1.2,()=>({P:P1,T:mix3(b(),[-25,1,-3],.5),fov:15})],
  [CUE(0,'wins a tackle')-.3,.9,()=>({P:P1,T:mix3(b(),[-24,1,-3.5],.5),fov:10.5})],
  [CUE(0,'Moments later')-.4,1.1,()=>({P:P1,T:mix3(b(),[-22,1,-1],.5),fov:12})],
  [CUE(0,'shoots')-.5,.8,()=>({P:P1,T:[-18.8,1,.8],fov:8.2})],
  [CUE(0,'blocked by')+.5,1.3,()=>({P:P1,T:[-20.5,1,-1],fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),T=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),bk=CUE(0,'blocked by');
  stadium(s,c,t,[0,1,3],{roar:sm(bk-.2,bk+.4,t)*(1-.5*sm(SECS(0)-.8,SECS(0),t)),flash:.6*sm(bk-.1,bk+.3,t)*(1-sm(bk+1.8,bk+2.6,t))});
  ground(s,c);
  play(s,c,T,tp,tpp,{minBall:8,lines:true});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(GUEHI_I,tau1(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(10,c.F*.35/q[2]),12);},
 still:9.4,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low reverse angle from behind the shooter
const tau2=(t:number)=>key(t,mono([[0,-1.75],[CUE(1,'reads it'),-1.05],[CUE(1,'steps across'),-.62],[CUE(1,'stays on'),-.32],[CUE(1,'keeps his body'),-.14],[CUE(1,'facing the ball'),-.03],[CUE(1,'Bang'),T_BLK+.01],[CUE(1,'bounces away'),T_BLK+.45],[SECS(1),T_BLK+1.5]]),linear);
const E2:V3=[-25.5,1.4,8.4];
function cam2(t:number):Cam{
 const T=tau2(t),[gx,gz]=posOf(GUEHI_I,T);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-21,1.1,-.4],fov:34})],
  [CUE(1,'reads it')-.3,1,()=>({P:add3(E2,[.6,0,-.4]),T:[lerp(gx,-20.5,.4),1,lerp(gz,1.2,.4)],fov:26})],
  [CUE(1,'stays on')-.4,1,()=>({P:add3(E2,[2.2,-.2,-1]),T:[-18.3,.8,1.2],fov:22})],
  [CUE(1,'Bang')-.3,.8,()=>({P:add3(E2,[2.4,-.25,-1.6]),T:[BLK_PT[0],.6,BLK_PT[2]],fov:22})],
  [CUE(1,'bounces away')-.1,1.2,()=>({P:add3(E2,[1.6,0,-.6]),T:[-20.5,.9,-.8],fov:30})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),T=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),E=SECS(1);
  const ri=CUE(1,'reads it'),sa=CUE(1,'steps across'),so=CUE(1,'stays on'),kb=CUE(1,'keeps his body'),fb=CUE(1,'facing the ball'),bg_=CUE(1,'Bang'),ba=CUE(1,'bounces away');
  stadium(s,c,t,[0,1,2],{roar:sm(bg_,bg_+.5,t),flash:.5*sm(bg_+.1,bg_+.5,t)});
  ground(s,c);
  // "steps across into the shot": a yellow arrow from where he was to his block spot
  const[ax,az]=posOf(GUEHI_I,-1.2);grassArrow(s,c,[ax,.01,az],[BLK_PT[0]+.1,.01,BLK_PT[2]],sm(sa-.1,sa+.7,t,easeOut)*(1-sm(bg_,bg_+.4,t)),Y,.12,74);
  facingArrow(s,c,sm(kb-.05,kb+.5,t,easeOut)*(1-sm(bg_-.1,bg_+.2,t)));
  play(s,c,T,tp,tpp,{minBall:7,hero:true,lines:true,after:({guehi,bg})=>{
   bootRings(s,c,tp,sm(so-.1,so+.4,t)*(1-sm(bg_+.4,bg_+.9,t)));
   sightline(s,guehi,bg,sm(ri-.1,ri+.5,t)*(1-sm(sa+.2,sa+.5,t))+sm(fb-.1,fb+.3,t)*(1-sm(bg_-.05,bg_+.15,t)));
   contactBurst(s,c,T,91);
   // "bounces away": the rebound's path, printed as it flies
   flightArrow(s,c,T_BLK,Math.max(T_BLK+.01,Math.min(T,T_BLK+1.6)),sm(ba-.2,ba+.2,t)*(1-sm(E-.9,E-.6,t)),Y,.1);}});
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(GUEHI_I,tau2(t)),q=toCam(c,[x,.9,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(30,c.F*.55/q[2]),12);},
 still:7.2,
};

// ---------------------------------------------------------------- 3 · the lesson: side-on from the near touchline, a little behind the defender
const tau3=(t:number)=>key(t,mono([[0,-1.3],[CUE(2,'striker shoots'),-.75],[CUE(2,'dive in'),-.5],[CUE(2,'Stay on'),-.3],[CUE(2,'get in'),-.12],[CUE(2,'block the'),T_BLK+.01],[CUE(2,'facing the'),T_BLK+.4],[SECS(2),T_BLK+1.3]]),linear);
const E3:V3=[-13.6,3.2,8.6];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[-19,.9,.6],fov:30})],
  [CUE(2,'dive in')-.3,.9,()=>({P:add3(E3,[-.6,-.3,-.8]),T:[-18.6,.8,.9],fov:26})],
  [CUE(2,'get in')-.3,1,()=>({P:add3(E3,[.5,-.6,-1.6]),T:[-17.2,.8,.4],fov:28})],
  [CUE(2,'facing the')-.3,.9,()=>({P:add3(E3,[-1,-.8,-2.4]),T:[-18.2,1.1,1],fov:24})],
 ]);
}
/** the shooting lane: a yellow wedge on the grass from the ball toward the two posts (where a shot can go in), drawn 42 % of the way */
function shootingLane(s:Sheet,c:Cam,from:V3,w:number){if(w<=.02)return;const k=.42,at=(z:number):V3=>[lerp(from[0],0,k),.01,lerp(from[2],z,k)],a=pr(c,[from[0],.01,from[2]]),p0=pr(c,at(-3.66)),p1=pr(c,at(3.66));if(!a||!p0||!p1)return;
 const e0:Pt=[lerp(a[0],p0[0],w),lerp(a[1],p0[1],w)],e1:Pt=[lerp(a[0],p1[0],w),lerp(a[1],p1[1],w)],wedge=polyPath([a,e0,e1],true);
 s.knockout(wedge,.35*w);s.tone(Y,wedge,.55*w);
 const edge=new Path2D();edge.addPath(ribbon([a,e0],Math.max(4,kAt(c,from)*.05),{seed:81,taper:.3,wobble:.6}));edge.addPath(ribbon([a,e1],Math.max(4,kAt(c,from)*.05),{seed:82,taper:.3,wobble:.6}));s.fill(Y,edge,.9*w);}
/** "don't dive in": a red ghost of a defender who slides in early (the ball goes past him), then a red cross through it — through the
 * same drawPlayer adapter, printed as a pale red screen */
const GHOST_ST:AthleteStyle={shirt:[R,.3],shorts:[R,.3],socks:[R,.3],boots:[R,.5],skin:[[R,.22]],hair:[R,.4],line:R,trim:null,shade:null,hairStyle:'short',sleeves:'short',build:GUEHI_B,shadow:false,detail:'low',seed:61};
function ghostDive(s:Sheet,c:Cam,w:number,cross:number,on:boolean){if(w<=.02||!on)return;const[x,z]=posOf(GUEHI_I,-.35),yaw=yawOf(SHOT_PT[0]-x,SHOT_PT[2]-z),u=clamp(.35+.4*w);
 const gx=x+Math.cos(yaw)*1.1*w,gz=z-Math.sin(yaw)*1.1*w;
 const gp=slideTackle(u,{foot:'r'}),pl={x:gx,z:gz,yaw:yaw+.5},P=solve(gp,GUEHI_B,pl,FIG).pelvis;
 drawPlayer(s,gp,c,{...GHOST_ST,scale:FIG},pl);
 if(cross>.02){const m=pr(c,P);if(!m)return;const r=kAt(c,P)*.9,wd=Math.max(7,r*.14);
  const a1=partial([[m[0]-r,m[1]-r*.7],[m[0]+r,m[1]+r*.7]],clamp(cross*2)),a2=partial([[m[0]+r,m[1]-r*.7],[m[0]-r,m[1]+r*.7]],clamp(cross*2-1));
  const p=new Path2D();p.addPath(ribbon(a1,wd,{seed:63,taper:.2,wobble:.8}));if(a2.length>1)p.addPath(ribbon(a2,wd,{seed:64,taper:.2,wobble:.8}));s.knockout(p,.9);s.fill(R,p,.95);}}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),T=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),E=SECS(2);
  const ss=CUE(2,'striker shoots'),di=CUE(2,'dive in'),sf=CUE(2,'Stay on'),gw=CUE(2,'get in'),bs=CUE(2,'block the'),fb=CUE(2,'facing the');
  stadium(s,c,t,[0,3],{roar:sm(bs,bs+.4,t),flash:.4*sm(bs,bs+.3,t)});
  ground(s,c);
  // "get in the way": the shooting lane from the ball to the posts, the defender standing in it
  shootingLane(s,c,SHOT_PT,sm(gw-.1,gw+.6,t,easeOut)*(1-sm(E-1,E-.6,t)));
  facingArrow(s,c,sm(fb-.1,fb+.4,t,easeOut)*(1-sm(E-.8,E-.5,t)),79);
  play(s,c,T,tp,tpp,{minBall:8,hero:true,lines:true,near:4,
   ghost:()=>ghostDive(s,c,sm(di-.05,di+.5,t),sm(di+.45,di+.9,t),t<sf+.5),
   after:({guehi,bg})=>{
   // "when a striker shoots": a red ring under the shooter
   const vp=posOf(VLAH_I,Math.min(tp,0));groundRing(s,c,vp[0],vp[1],.9,sm(ss-.1,ss+.4,t)*(1-sm(di+.4,di+.8,t)),R);
   bootRings(s,c,tp,sm(sf-.1,sf+.4,t)*(1-sm(E-.9,E-.5,t)));
   sightline(s,guehi,bg,sm(sf+.1,sf+.5,t)*(1-sm(bs-.05,bs+.2,t)));
   contactBurst(s,c,T,93,.7);
   // a big yellow tick above the defender: blocked
   const sw=sm(fb+.3,fb+.9,t,easeOutBack);if(sw>0){const[x,z]=posOf(GUEHI_I,T_BLK),a=pr(c,[x,2.4,z+.9]),m=pr(c,[x,2,z+.35]),q=pr(c,[x,2.95,z-.8]);if(a&&m&&q){const tk=partial([a,m,q],clamp(sw)),wd=Math.max(10,kAt(c,[x,2.6,z])*.14);s.knockout(ribbon(tk,wd*1.6,{seed:95,taper:.2,wobble:1}),.9);s.fill(Y,ribbon(tk,wd,{seed:95,taper:.2,wobble:1}),.95);}}}});
 },
 still:7,
};

const film:RisoStory={
 id:'guehi-signature',format:'11v11',title:"Guéhi's perfectly timed block",
 theme:'Stay on your feet and block the shot with your body facing the ball',
 ageNote:'Serbia 0–1 England, UEFA Euro 2024 group stage, Arena AufSchalke, Gelsenkirchen, 16 June 2024, the opening quarter. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a blocked shot — a ball thuds into a wall of boots and bounces back, a yellow burst. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.3),r=rng(seed),dir=r()<.5?-1:1;
  sparkBurst(s,Y,x,y,40+50*u,{n:8,seed,g:(1-u*.6)*fade,width:8});
  const bx=x+dir*110*u,by=y-90*u+110*u*u,p=new Path2D();p.moveTo(bx+13,by);p.arc(bx,by,13,0,TAU);s.knockout(p,.95*fade);
  footballPanels(s,bx,by,13,{rot:u*6*dir,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; x to England's goal line at 0, z across; +z = the main-stand side) — checked by the test. */
export const FACTS={POKE_PT,SHOT_PT,BLK_PT,GOAL,ballAt,T_TACK,T_BLK,
 guehiAt:(T:number)=>posOf(GUEHI_I,T),vlahAt:(T:number)=>posOf(VLAH_I,T),guehiSkel:(T:number)=>skel(GUEHI_I,T),vlahSkel:(T:number)=>skel(VLAH_I,T),pickAt:(T:number)=>posOf(PICK_I,T)};
