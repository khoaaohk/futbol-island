/** Iconic-play film · Jules Koundé, signature "the recovery sprint and tackle" — shown in France 1–0 Belgium, UEFA Euro 2024 round of 16,
 * Monday 1 July 2024, Merkur Spiel-Arena, Düsseldorf (the match in which Koundé, France's right-back, was named man of the match).
 *
 * WHY THIS MATCH, AND WHY "HOW HE DID IT": Koundé's entry in lib/town/iconicPlays.json is a signature (kind "signature"): "the recovery
 * sprint and tackle", lesson "never stop chasing: sprint back and tackle from the side, not from behind". No written source available to us
 * describes ONE specific Koundé recovery tackle precisely enough (minute, foot, where) to recreate 1:1, so this film follows the brief's
 * honest fallback: it recreates the signature inside a real, documented match whose sources describe exactly that duel — Belgium's plan was
 * to get Jérémy Doku running into "the gap behind the full backs", down Belgium's LEFT, i.e. straight at France's right-back Koundé, and
 * Koundé was the man of the match. The narration says "Here is how Jules Koundé chased a run like that" — it never claims a minute, a
 * scoreline change or a specific tackle. (Also considered: his extra-time winner in the 2025 Copa del Rey final v Real Madrid, 26 April
 * 2025 — a goal, not the signature; and the 58' moment of this match, when the Guardian's live text says two fouls on Doku by Koundé and
 * Kanté went unpunished — a foul, the opposite of the lesson.)
 *
 * SOURCES (read 23 Sep 2026 with curl; cached under scratchpad/films/src-cache/):
 *  - The Guardian match report, Sid Lowe, "France edge past Belgium after late deflection seals Euro 2024 progression" (1 Jul 2024)
 *    https://www.theguardian.com/football/article/2024/jul/01/france-belgium-euro-2024-last-16-match-report  (guardian-fra-bel-2024.txt)
 *  - The Guardian minute-by-minute, Barry Glendenning (1 Jul 2024), both pages, incl. the line-ups and 23', 28', 58', 78' entries
 *    https://www.theguardian.com/football/live/2024/jul/01/france-v-belgium-euro-2024-last-16-live-score-updates
 *    (guardian-fra-bel-2024-live.txt, guardian-fra-bel-2024-live-p2.txt)
 *  - Wikipedia "UEFA Euro 2024 knockout stage" (raw): line-ups, numbers, man of the match, kit templates from UEFA's tactical line-up
 *    sheet (wiki-euro2024-knockout.txt); Wikipedia "Jules Koundé" (raw) (wiki-jules-kounde.txt)
 *  - Photo check: the Guardian report's picture of Maignan saving from Lukaku (guardian-fra-bel-2024-maignan.jpg): France in white shirts
 *    and blue shorts, Belgium in dark red, Maignan in yellow, a closed, sunlit bowl with red-shirted fans.
 *  - The Maignan film (maignan-signature.ts) is the same match: stadium, kits and inks follow it.
 * CONFIRMED by those accounts: France 1–0 Belgium, 1 July 2024, Düsseldorf, round of 16 (Vertonghen own goal, 85'); Koundé started at
 * right-back wearing 5 and was man of the match; Doku (22) started on Belgium's left; "Belgium had been content to allow France the ball,
 * seeking the gap behind the full backs instead, Jérémy Doku and Yannick Carrasco leading the way"; "good work down the left from Doku";
 * France in their WHITE change shirts, blue shorts, white socks; Belgium in dark-red home shirts, black shorts, red socks; Maignan 16.
 * INFERRED (illustrative, not in the accounts): the whole choreography — the through ball, Doku getting past Koundé, the sprint, where
 * Koundé draws level, the sliding tackle from the side with his LEFT leg, the ball knocked out for a throw, Doku hurdling the slide —
 * plus the minute, which end France defended on screen (here their goal is on the left of the main camera and Doku runs down the near
 * side), every other position, all camera placements and lenses, Maignan's keeper-kit colour, the crowd colours. The narration names
 * only confirmed facts plus the lesson (it never names a minute, the foot, or claims this exact tackle happened).
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; no top-down shots): 1 = live, the high main-stand
 * camera panning with the break down the near touchline — real time; 2 = TV slow-motion replay from a low touchline camera ahead of the
 * play: Doku is past him, Koundé sprints, catches up and comes alongside; 3 = the second replay from the high camera behind France's goal:
 * the slide comes in from the side, the boot reaches the ball first, the ball rolls out of play; 4 = the lesson (the only chapter with
 * teaching marks): never stop chasing (a ring), sprint back (his path), get alongside (level marks), tackle from the side (a ghost + burst)
 * and not from behind (a crossed-out arrow at Doku's heels).
 * Bodies: the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Scenes read only their local time t;
 * every action keys off cue times, so the recorded voice (withTiming) re-times the film; nothing is random (wobble is seeded). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,keeperSet,slideTackle,posed,keyPoses,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [6,6,6,5]. Every cue starts with a
 * plain word (Kokoro splits contractions and hyphenated words). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The chase',text:'Euro twenty twenty-four, France against Belgium. Speedy Jérémy Doku kept racing into the space behind France’s defence. Here is how Jules Koundé chased a run like that: sprint back, and tackle!',seconds:14.4,
  cues:[[.1,'Euro'],[1.6,'France against Belgium'],[3,'Speedy Jérémy Doku'],[5.6,'space behind'],[7.6,'Here is how'],[11.6,'sprint back']]},
 {label:'Watch again',text:'Watch again, slowly. Doku is past him, but Koundé never stops. He sprints flat out, catches up, and comes alongside.',seconds:10,
  cues:[[.1,'Watch again'],[1.45,'Doku is past him'],[4.1,'never stops'],[5.1,'He sprints'],[7,'catches up'],[8.4,'comes alongside']]},
 {label:'From the side',text:'Now he slides in from the side, not from behind. His boot reaches the ball first, and it rolls out of play.',seconds:9.6,
  cues:[[.1,'Now he slides in'],[1.55,'from the side'],[3,'not from behind'],[4.45,'His boot'],[5.9,'first'],[7.6,'rolls out']]},
 {label:'Never stop',text:'Never stop chasing! Sprint back, get alongside the attacker, and tackle from the side, not from behind.',seconds:8.6,
  cues:[[.1,'Never stop chasing'],[1.45,'Sprint back'],[2.5,'get alongside'],[4.4,'tackle from the side'],[6.2,'not from behind']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py kounde-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/kounde-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/kounde-signature/timing.json';
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

// ---------------------------------------------------------------- Düsseldorf (as in the Maignan film): a closed bowl, the roof ring, LED boards, grass, markings
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-14,76],b:[119,76],out:[0,1]},    // far side
 {a:[113,-9],b:[113,77],out:[1,0]},    // the far end
 {a:[-14,-8],b:[119,-8],out:[0,-1]},   // main stand (the live camera sits in it)
 {a:[-8,-9],b:[-8,77],out:[-1,0]},     // behind France's goal
];
/** French blue and white, Belgian red, the odd yellow (inferred crowd colours; both sets of fans were in the ground) */
const TIER_INK:[string,number][]=[[B,.55],[R,.45],[K,.22],[B,.3],[Y,.16],[R,.28],[K,.35],[B,.2]];
function stadium(s:Sheet,c:Cam){
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),boards=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,40,1.2+40*.6),P(0,40,1.2+40*.6)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  // roof canopy and rear wall run on past the stand ends so the corners of the bowl close (no paper gaps)
  addPoly(roof,[P(-.35,-3,29),P(1.35,-3,29),P(1.35,48,34),P(-.35,48,34)],c);addPoly(roof,[P(-.35,38,20),P(1.35,38,20),P(1.35,38,34),P(-.35,38,34)],c);
  const segs=16;for(let k=0;k<22;k++){const d0=1+k*1.7,d1=d0+1.34,y0=1.2+d0*.6,y1=1.2+d1*.6;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 // LED advertising boards along the near touchline (the ball rolls out toward them)
 for(let i=0;i<9;i++){const x0=-2+i*12.4,x1=x0+11.8;addPoly(boards,[[x0,0,-4.2],[x1,0,-4.2],[x1,.95,-4.2],[x0,.95,-4.2]],c);}
 // the roof's underside over the whole bowl (the sky gap a low camera would otherwise see between the stand roofs), printed first
 {const lid=new Path2D();addPoly(lid,[[-70,34.5,-70],[180,34.5,-70],[180,34.5,140],[-70,34.5,140]],c);s.fill(K,lid,.42);s.fill(B,lid,.25);}
 // the four corners of the bowl: crowd ramps closing the gaps between the stands (a low camera looks straight into them)
 {const corner=new Path2D(),crowd=new Path2D();for(const[cx,cz,ox,oz]of[[113,76,1,1],[113,-8,1,-1],[-8,76,-1,1],[-8,-8,-1,-1]]as[number,number,number,number][]){
  const q=(dx:number,dz:number,y:number):V3=>[cx+ox*dx,y,cz+oz*dz];
  addPoly(corner,[q(0,0,1.2),q(40,0,25.2),q(40,40,25.2),q(0,40,25.2)],c);addPoly(crowd,[q(1,1,1.8),q(38,1,24),q(38,38,24),q(1,38,24)],c);}
  s.fill(B,corner,.18);s.fill(R,crowd,.3);s.fill(B,crowd,.3);s.fill(K,crowd,.2);}
 s.fill(B,concrete,.18);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.62);
 s.fill(B,wall,.55);s.stroke(K,wall,Math.max(2,.05*P3([30,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 // the boards: a navy panel with a white LED band (printed after the grass so they stand on it)
 s.fill(K,boards,.8);
 for(const[x,z]of[[0,0],[105,0],[0,68],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir (France's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  for(let x=0;x<=2.01;x+=sp)for(const z of[z0,z1])seg([gx+dir*x,0,z],[gx+dir*x,lerp(h,bh,x/2),z]);
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector negates
 * z both ways — that keeps every left leg a left leg (Koundé runs toward his own goal, −X, so his LEFT side faces the near touchline and Doku). */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE adapter: every body in the film is printed here. */
function drawPlayer(s:Sheet,pose:Pose,c:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance); the same screens as the Maignan film
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.45],[R,.3]],SKIN_D:InkFill[]=[[K,.75],[R,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** France in their white change shirts, blue shorts, white socks (UEFA line-up sheet via Wikipedia's kit template); blue numbers */
const france=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:B,shorts:B,socks:'paper',boots:K,skin:SKIN_D,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:B,scale:FIG,...o});
/** Belgium in their dark-red home shirts, black (navy) shorts, red socks */
const belgium=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:K,shorts:K,socks:R,boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.4],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Koundé: number 5, 1.80 m-ish, cropped dark hair */
const KOUNDE:AthleteStyle=france({number:5,seed:5,build:{height:1.8,bulk:1.02,thighs:1.06}});
/** Doku: number 22, compact and quick (1.73 m), cropped dark hair */
const DOKU:AthleteStyle=belgium({number:22,seed:22,skin:SKIN_D,hair:K,build:{height:1.73,bulk:1,thighs:1.1}});
const MAIGNAN:AthleteStyle={shirt:[Y,.95],trim:K,shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_D,hair:K,hairStyle:'short',line:K,shade:[K,.28],sleeves:'long',gloves:'paper',
 number:16,numberInk:K,build:{height:1.91,bulk:1.06},scale:FIG,seed:16};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:5,build:KOUNDE.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; France's goal line X=0, near touchline Z=0; play seconds T, T=0 = the ball played in behind)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
/** the slide: from T_SLIDE for SLIDE_DUR s, heading toward his own goal and across toward the near touchline (in front of Doku) */
const T_SLIDE=4.55,SLIDE_DUR=.7,T_CONTACT=T_SLIDE+.42*SLIDE_DUR,T_SLID=T_SLIDE+SLIDE_DUR;
const SLIDE_H=nrm2(-1,-.62),SLIDE_AT:[number,number]=[27.4,10.1],SLIDE_PLACE=placeOf(SLIDE_AT[0],SLIDE_AT[1],SLIDE_H);
const SLIDE_LEN=slideTackle(1,{foot:'l'}).dx;
/** Koundé's slide on the LEFT leg (the side nearer the ball): the library slide, the lead leg lowered through the contact so the boot
 * is on the grass, the instep to the ball */
function SLIDE(u:number):Pose{const p=slideTackle(clamp(u),{foot:'l'}),w=sm(.25,.38,u)*(1-sm(.62,.82,u));return w>0?clampPose({...p,lHipF:p.lHipF-.18*w,lAnk:p.lAnk-.1*w}):p;}
/** the ball meets Koundé's left boot here: solved from the body at the contact frame of the slide */
const BALL_T:[number,number]=(()=>{const sk=solve(SLIDE(.42),KOUNDE.build,SLIDE_PLACE,FIG),t=toMy(sk.lToe),h=toMy(sk.lHeel);return[(t[0]+h[0])/2-.1,(t[2]+h[2])/2-.12];})();
const DOWN_AT:[number,number]=add2(SLIDE_AT,SLIDE_H,SLIDE_LEN);
/** the ball after the touch: toward the near touchline and out, stopping by the boards */
const OUT_H=nrm2(-.55,-1),BALL_OUT:[number,number]=[BALL_T[0]+OUT_H[0]*(BALL_T[1]+3.4)/-OUT_H[1],-3.4];
/** Doku: from level with Koundé near halfway, onto the ball played in behind, dribbling down the near side, angling a little inside */
const D_H=nrm2(-1,.1),D_C:[number,number]=add2(BALL_T,D_H,-1.05);
const DOKU_KEYS=[[-1.5,62.5,8.6],[0,59,7.6],[1,52.4,6.4],[2,45.1,6],[3,37.8,6.3],[3.9,31.8,7],[T_CONTACT,...D_C]];
/** Koundé: pushed up, level with Doku as the ball goes in behind; turns, then the sprint back on the inside, drawing level */
const KOUNDE_KEYS=[[-1.5,56.6,11.2],[0,58.6,11],[.45,58.1,10.9],[1,55.4,10.8],[2,48,10.6],[3,39.6,10.4],[4,31.4,10.2],[T_SLIDE,...SLIDE_AT]];
/** the through ball: from a Belgian midfielder inside (unnamed; illustrative) into the space behind */
const PASS_FROM:[number,number]=[64.5,21];
/** where Doku hops the slide and where he pulls up */
const DOKU_OUT=[[T_CONTACT+.8,...add2(D_C,D_H,2.2)],[T_CONTACT+1.6,...add2(add2(D_C,D_H,4.4),[0,-.4])],[T_CONTACT+2.8,...add2(add2(D_C,D_H,5.4),[0,-1.2])],[14,...add2(add2(D_C,D_H,5.6),[0,-1.5])]];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'kounde',style:KOUNDE,keys:KOUNDE_KEYS},
 {id:'doku',style:DOKU,keys:DOKU_KEYS},
 // everyone else: positions and runs illustrative (not in the accounts)
 {id:'b-pass',style:belgium({seed:31}),keys:[[-1.5,67,21.6],[0,64.9,21.2],[1,62.6,20.2],[4,50,18],[8,40,16],[14,36,15]]},
 {id:'b-9',style:belgium({seed:32,skin:SKIN_D,build:{height:1.9,bulk:1.14}}),keys:[[-1.5,61,30],[0,58,29.5],[2,48,27],[4,36,24],[6,28,21],[9,24,19],[14,22,18]]},
 {id:'b-r',style:belgium({seed:33}),keys:[[-1.5,63,48],[0,60,47],[3,46,43],[6,32,38],[9,27,34],[14,25,32]]},
 {id:'f-cb',style:france({seed:34}),keys:[[-1.5,50,24],[0,50.5,23.6],[1.5,47,22],[3,40,20],[5,31,17.6],[7,27,16],[14,26,15.5]]},
 {id:'f-cb2',style:france({seed:35,skin:SKIN_M}),keys:[[-1.5,49,38],[0,49.4,37.6],[2,43,34],[4,34,30],[6,27,27],[9,24,25],[14,23,24]]},
 {id:'f-mid',style:france({seed:36}),keys:[[-1.5,66,17],[0,67,17.5],[1,65.5,16.4],[4,55,13],[8,44,11],[14,40,10]]},
];
const MAIGNAN_KEYS=[[-2,12,34],[4,8,31],[7,6.5,29.5],[14,6,29]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-2);for(let t=-1.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const T_RECV=2,T_LAST=3.95;
/** The ball at play time T: the through ball into the space, Doku's touches ahead, the last touch, Koundé's left boot, out of play. */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 const touch=(t:number)=>.8+.6*Math.max(0,Math.sin((t-T_RECV)*TAU/.66));
 const recv=ahead(DOKU_KEYS,T_RECV,touch(T_RECV)),from:V3=[PASS_FROM[0]-.6,.11,PASS_FROM[1]-.4];
 if(T<0)return from;
 if(T<T_RECV)return lerp3(from,recv,sm(0,T_RECV,T,u=>u*(1.7-.7*u)));
 if(T<T_LAST)return ahead(DOKU_KEYS,T,touch(T));
 const b0=ahead(DOKU_KEYS,T_LAST,touch(T_LAST)),bt:V3=[BALL_T[0],.11,BALL_T[1]],out:V3=[BALL_OUT[0],.11,BALL_OUT[1]];
 if(T<T_CONTACT)return lerp3(b0,bt,sm(T_LAST,T_CONTACT,T,u=>u*(1.25-.25*u)));
 return lerp3(bt,out,sm(T_CONTACT,T_CONTACT+2.1,T,easeOut));
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
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
/** Koundé: jogging up, the turn (hips swing round toward his own goal), the flat-out sprint on the inside, the slide on the left leg, down, up */
function koundeState(T:number):St{
 if(T<T_SLIDE+.08){
  // the turn: facing upfield at first, swinging round through the inside as the ball goes past
  const turn=sm(-.05,.6,T,easeInOutSine),v=velAt(KOUNDE_KEYS,T),sp=Math.hypot(v[0],v[1]),run:[number,number]=sp>.5?[v[0]/sp,v[1]/sp]:[-1,0];
  const h=T<.6?yawTo([1,.05],[-1,-.05],turn):yawTo(run,SLIDE_H,sm(4.1,T_SLIDE,T,easeInOutSine));
  const st=runState(KOUNDE_KEYS,T,h);let pose=lookAtBall(st,T,.7);
  // flat out: deeper lean and arm drive through the sprint
  pose=blendPose(pose,clampPose({...pose,lean:pose.lean+.12,pitch:pose.pitch+.05}),win(T,1,4.2,.5));
  if(T<T_SLIDE)return{pose,place:st.place};
  return{pose:blendPose(pose,SLIDE((T-T_SLIDE)/SLIDE_DUR),sm(T_SLIDE,T_SLIDE+.08,T)),place:SLIDE_PLACE};}
 if(T<T_SLID)return{pose:SLIDE((T-T_SLIDE)/SLIDE_DUR),place:SLIDE_PLACE};
 const down={...slideTackle(1,{foot:'l'}),dx:0},h=yawTo(SLIDE_H,nrm2(-.3,-1),sm(T_SLID+.9,T_SLID+1.6,T));
 const kneel=posed({rHipF:70,rKnee:120,rAnk:30,lHipF:20,lKnee:100,lAnk:40,lean:30,pitch:4,lShA:40,rShA:30,rShF:30,lShF:-10,lElb:30,rElb:40,neckP:10});
 const u=clamp((T-(T_SLID+.5))/1),pose=u<=0?down:keyPoses(u,[[0,down],[.45,kneel],[1,stand()]]);
 return{pose,place:placeOf(DOWN_AT[0],DOWN_AT[1],h)};
}
/** Doku's hop over the slide: take-off, knees tucked, landing, pulling up (authored in degrees; grounding is automatic) */
const HOP:[number,Pose][]=[
 [0,posed({lHipF:40,lKnee:30,rHipF:-20,rKnee:70,rAnk:30,lean:14,pitch:8,lShF:-30,rShF:40,lElb:84,rElb:84,neckP:14})],
 [.25,posed({dx:.8,air:.34,lHipF:74,lKnee:96,rHipF:30,rKnee:110,rAnk:34,lean:12,pitch:6,lShF:40,rShF:60,lShA:50,rShA:56,lElb:40,rElb:44,neckP:24})],
 [.5,posed({dx:1.6,air:.12,lHipF:40,lKnee:40,rHipF:-10,rKnee:80,lean:18,pitch:10,lShF:20,rShF:-20,lShA:40,rShA:48,lElb:60,rElb:60,neckP:20,squash:-.06})],
 [1,posed({dx:2.2,lHipF:22,lKnee:34,rHipF:4,rKnee:40,lean:14,pitch:4,lShA:20,rShA:24,lElb:60,rElb:60,neckP:6,neckY:-30})],
];
function dokuState(T:number):St{
 if(T<T_CONTACT){const st=runState(DOKU_KEYS,T);
  // a quick look over the shoulder as the ball goes past, then head over the ball on the dribble (right foot on the ball)
  let pose=blendPose(st.pose,dribble(strideAt(DOKU_KEYS,T)*.9/3.8,{foot:'r',speed:.95}),sm(T_RECV-.3,T_RECV+.1,T)*.55);
  pose=lookAtBall({pose,place:st.place},T,.6*win(T,-.2,1.6,.4));
  return{pose,place:st.place};}
 const u=clamp((T-T_CONTACT)/.8),hop=keyPoses(u,HOP),run=runState(DOKU_KEYS,T_CONTACT).pose,place=placeOf(D_C[0],D_C[1],D_H);
 if(u<1)return{pose:blendPose(run,hop,sm(0,.12,u)),place};
 // pulling up: jog on a few steps, turning to watch the ball roll out
 const p=trackAt(DOKU_OUT,T),h=yawTo(D_H,nrm2(-.2,-1),sm(T_CONTACT+1,T_CONTACT+2.2,T)),v=velAt(DOKU_OUT,T),sp=Math.hypot(v[0],v[1]);
 const jog=blendPose(stand(),runCycle(strideAt(DOKU_OUT,T)*.9/3,{speed:clamp((sp-1.5)/6)}),clamp((sp-.4)/2));
 return{pose:blendPose({...HOP[3][1],dx:0},jog,sm(T_CONTACT+.8,T_CONTACT+1.1,T)),place:placeOf(p[0],p[1],h)};
}
function maignanState(T:number):St{const[x,z]=trackAt(MAIGNAN_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='kounde')return koundeState(T);if(id==='doku')return dokuState(T);if(id==='maignan')return maignanState(T);
 const k=TR(id).keys;
 if(id==='b-pass'&&T>-.9&&T<.5){const st=runState(k,T),kick=posed({lHipF:14,rHipF:-30,rKnee:60,lKnee:24,lean:10,lShA:40,rShA:30,rShF:30,lShF:-20,neckP:20});
  return{pose:blendPose(st.pose,kick,win(T,-.6,.35,.2)*.8),place:placeOf(trackAt(k,T)[0],trackAt(k,T)[1],nrm2(-1,-.6))};}
 return runState(k,T);
}
const HEROES=['kounde','doku'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'maignan'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='maignan'?MAIGNAN:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='kounde'&&T>T_SLIDE&&T<T_SLID-.15)||(id==='doku'&&T>T_CONTACT&&T<T_CONTACT+.5)||(id==='kounde'&&T>1.2&&T<4.3);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(T>T_CONTACT-.3&&T<T_CONTACT+.4?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera, panning with the ball down the near side — the ball in behind, the chase, the tackle, the ball out. */
const MAIN_CAM:V3=[45,21,-40];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-1.4],[q[2],-.2],[q[3],1.1],[q[4],2.5],[q[5]-.2,T_SLIDE-.2],[q[5]+.6,T_CONTACT+.1],[S,T_CONTACT+2.2]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-1.4,T-.3)),tx=clamp(b[0]-2,20,62),tz=lerp(26,16,sm(-1,2.5,T)),F=lerp(4300,6600,sm(-.5,T_SLIDE,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[5]+.9;},
};
/** 2 · TV slow-motion replay from a low touchline camera ahead of the play: Doku is past him, the sprint, catching up, alongside. */
/** rail camera offset from the pair's midpoint: ahead of them (toward France's goal), out on the near touchline, at eye height */
const LOW_OFF:V3=[-13,1.7,-10];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,.1],[q[1],.7],[q[2],2.1],[q[3],2.6],[q[4],3.5],[q[5],4.1],[S,T_SLIDE-.02]]);};
const cam2=(t:number)=>{const T=t2(t),k=trackAt(KOUNDE_KEYS,Math.min(T,T_SLIDE)),d=trackAt(DOKU_KEYS,Math.min(T,T_CONTACT)),mx=(k[0]+d[0])/2,mz=(k[1]+d[1])/2,
 F=lerp(2600,3300,sm(.3,T_SLIDE,T,easeInOutSine)),pos:V3=[mx+LOW_OFF[0],LOW_OFF[1],Math.min(-3.4,mz+LOW_OFF[2])];return camAt(pos,[mx+.5,.95,mz],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const T=t2(twos(t)),k=trackAt(KOUNDE_KEYS,Math.min(T,T_SLIDE)),p=P3([k[0],1,k[1]],cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.3*p[2]),12);},
 get still(){return Q(1)[5]+.5;},
};
/** 3 · the second replay, from the high camera behind France's goal: the slide comes in from the side, the boot first, the ball rolls out. */
const BEHIND:V3=[-9,5.2,7];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_SLIDE-.55],[q[1],T_SLIDE],[q[2],T_SLIDE+.16],[q[3],T_CONTACT-.03],[q[4]+.4,T_CONTACT+.04],[q[5],T_CONTACT+.8],[S,T_CONTACT+2.3]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(T),u=.62*sm(T_CONTACT+.02,T_CONTACT+.9,T),tx=lerp(BALL_T[0]+1.2,b[0],u),tz=lerp(BALL_T[1]+.5,b[2],u),
 F=lerp(6800,3900,sm(T_CONTACT,T_CONTACT+1.1,T,easeInOutSine));return camAt(BEHIND,[tx,.8,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[4]+.5;},
};
/** 4 · the lesson plate: the chase again from a raised camera on the near side, with bold yellow teaching marks — a ring round Koundé (never
 * stop chasing), his path back (sprint back), level marks between him and Doku (get alongside), the slide stamped at the ball from the side
 * (tackle from the side) and a crossed-out arrow at Doku's heels (not from behind). */
/** raised camera offset from the pair: behind-left of them on the near side */
const LESSON_OFF:V3=[-9,8,-13];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,1.2],[q[1],1.4],[q[2],3.9],[q[2]+.9,4.3],[q[3],T_SLIDE],[q[3]+.9,T_CONTACT+.02],[S,T_CONTACT+.1]]);};
const cam4=(t:number)=>{const T=t4(t),k=koundeState(Math.min(T,T_SLIDE)).place,d=trackAt(DOKU_KEYS,Math.min(T,T_CONTACT)),mx=(k.x!+d[0])/2,mz=(-k.z!+d[1])/2;
 return camAt([mx+LESSON_OFF[0],LESSON_OFF[1],mz+LESSON_OFF[2]],[mx-1,.4,mz],lerp(2400,2800,sm(1.2,4.2,T,easeInOutSine)));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  const who=['kounde','doku','f-cb','b-9','maignan','ball'];
  // "Never stop chasing": a yellow ring on the grass round Koundé (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.2,q[1]+.6,t));
  if(hal>.01){const m=koundeState(T).place,mx=m.x!,mz=-m.z!,r=1.2*hal,out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(mx+Math.cos(a)*r,mz+Math.sin(a)*r,c));inn.push(G(mx+Math.cos(a)*r*.72,mz+Math.sin(a)*r*.72,c));}
   stadium(s,c);const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);drawPlay(s,T,c,{ballScale:1.5,only:who,noStadium:true});}
  else drawPlay(s,T,c,{ballScale:1.5,only:who});
  // "Sprint back": Koundé's path from the turn, printed behind him as he goes
  if(t>=q[1]-.1){const T1=Math.min(T,T_SLIDE),pts:Pt[]=[];for(let u=.5;u<=T1+.001;u+=.2){const m=trackAt(KOUNDE_KEYS,u);pts.push(G(m[0],m[1],c));}
   const fade=1-sm(q[3]-.3,q[3]+.3,t);if(pts.length>1&&fade>0){const w=Math.max(12,.22*P3([SLIDE_AT[0],0,SLIDE_AT[1]],c)[2]);const path=ribbon(pts,w,{seed:31,taper:.3,wobble:1});s.stroke(K,path,5,.9*fade);s.knockout(path,fade);s.fill(Y,path,.95*fade);}}
  // "get alongside": two short level bars, one at each man's feet, square to the run — they line up once he is level
  const lev=sm(q[2],q[2]+.35,t,easeOutBack)*(1-sm(q[3]+.3,q[3]+.7,t));
  if(lev>.01&&T<T_CONTACT){const k=trackAt(KOUNDE_KEYS,Math.min(T,T_SLIDE)),d=trackAt(DOKU_KEYS,T),w=Math.max(10,.16*P3([k[0],0,k[1]],c)[2])*clamp(lev);
   const bar=(x:number,z:number,sd:number)=>ribbon([G(x,z-.9,c),G(x,z+.9,c)],w,{seed:sd,taper:0,wobble:.5});const p=new Path2D();p.addPath(bar(k[0],k[1],51));p.addPath(bar(d[0],d[1],52));
   p.addPath(ribbon([G(k[0],k[1]-.9,c),G(d[0],d[1]+.9,c)],w*.5,{seed:53,taper:0,wobble:.5}));mark(s,p);}
  // "tackle from the side": an arrow in from the inside to the ball, the slide stamped as a yellow ghost at the contact frame, a burst
  const side=sm(q[3],q[3]+.5,t,easeInOutSine)*(1-sm(S4()-.4,S4(),t));
  if(side>.01){const bp=P3([BALL_T[0],.11,BALL_T[1]],c),from=G(BALL_T[0]+.8,BALL_T[1]+4.2,c);arrow(s,from,[bp[0],bp[1]-.3*bp[2]],Math.max(12,.2*bp[2]),61,side);
   const stamp=sm(q[3]+.9,q[3]+1.2,t,easeOutBack);if(stamp>.002){sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:62,g:clamp(stamp),width:.07*bp[2]});if(t<q[4]+.2)drawPlayer(s,SLIDE(.42),c,GHOST,SLIDE_PLACE);}}
  // "not from behind": an arrow at Doku's heels from behind him, struck through with a navy cross
  const nb=sm(q[4],q[4]+.4,t,easeOutBack);
  if(nb>.01){const a=G(D_C[0]+4.4,D_C[1]+.2,c),b=G(D_C[0]+1.1,D_C[1],c),g=P3([D_C[0]+2.6,0,D_C[1]],c),w=Math.max(12,.2*g[2]);
   const p=new Path2D();p.addPath(ribbon([a,b],w*.8,{seed:71,taper:0,wobble:.6}));s.stroke(K,p,5,.6);s.knockout(p,.8);s.fill(Y,p,.45);
   const r=.95*g[2]*clamp(nb),x=new Path2D();x.addPath(ribbon([[g[0]-r,g[1]-r*.8],[g[0]+r,g[1]+r*.8]],w,{seed:72,taper:.1}));x.addPath(ribbon([[g[0]+r,g[1]-r*.8],[g[0]-r,g[1]+r*.8]],w,{seed:73,taper:.1}));
   s.knockout(x);s.fill(R,x,.95);s.stroke(K,x,5,.9);}
  frame(s);
 },
 get still(){return Q(3)[4]+1.2;},
};
const S4=()=>SECS(3);

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'kounde-signature',format:'11v11',title:'The recovery sprint and tackle',theme:'Never stop chasing; tackle from the side',
 ageNote:'France v Belgium · Euro 2024 last 16, 1 July 2024',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
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
/** Solved contact points (pitch metres; France's goal line at X=0, near touchline Z=0, Z across) — checked by tests/play-film-kounde-signature.cjs. */
export const FACTS={BALL_T,BALL_OUT,D_C,SLIDE_AT,T_SLIDE,T_CONTACT,ballAt,
 /** mid-sole of each boot at the contact frame (my metres) */
 leftFoot:()=>{const sk=solve(SLIDE(.42),KOUNDE.build,SLIDE_PLACE,FIG),a=toMy(sk.lToe),b=toMy(sk.lHeel);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];},
 rightFoot:()=>{const sk=solve(SLIDE(.42),KOUNDE.build,SLIDE_PLACE,FIG),a=toMy(sk.rToe),b=toMy(sk.rHeel);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];},
 /** Koundé's pelvis at the contact frame (my metres) */
 pelvis:()=>toMy(solve(SLIDE(.42),KOUNDE.build,SLIDE_PLACE,FIG).pelvis),
 dokuAt:(T:number)=>{const st=dokuState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 koundeAt:(T:number)=>{const st=koundeState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
