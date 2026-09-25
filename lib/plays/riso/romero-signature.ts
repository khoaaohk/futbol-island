/** Iconic-play film · Cristian Romero, "Signature: the fearless slide tackle" — shown HOW HE DID IT, in a real match the sources describe:
 * Tottenham Hotspur 1–0 Manchester United, UEFA Europa League final, Wednesday 21 May 2025, 21:00 CEST, San Mamés, Bilbao (Brennan Johnson
 * 42'). Romero captained Spurs and was named UEFA's official Player of the Match.
 *
 * WHY THIS MATCH, AND WHY "HOW HE DID IT": Romero's entry in lib/town/iconicPlays.json is a signature (kind "signature", template
 * last_ditch_tackle): "the fearless slide tackle", lesson "Slide only when you are sure you can reach the ball first." No written source we could
 * read logs ONE specific clean Romero slide tackle precisely enough (minute, foot, where) to recreate 1:1. The one slide the Guardian's live text
 * does log in this final — 76': "Shaw bursts down the left and goes over the sliding Romero's leg … it probably should have been a free kick" — is
 * a near-foul, the opposite of the lesson, so it is NOT shown. So, per the brief's honest fallback, the film recreates the signature inside the
 * real final whose sources describe exactly that duel: UEFA's Technical Observer panel — "He dealt well with Manchester United's direct play, he
 * was very aggressive with the defensive line and won the first contacts … He constantly won duels, won the 1v1s." The film shows one of those
 * duels: a United long ball over the top, Romero racing a striker to it, getting there first and sliding it away. The narration says "Here is how
 * Spurs captain Cristian Romero handled them" — it never gives the tackle a minute, a scoreline change or a named United player. (Also
 * considered: the 2022 World Cup final v France and the 2024 Copa América final v Colombia — the cached accounts name Romero in the line-ups and
 * as one of the defenders who "contained" Colombia's late attacks, but log no single Romero slide.)
 *
 * SOURCES (read 23 Sep 2026 with curl; cached under scratchpad/films/src-cache/):
 *  - Wikipedia "2025 UEFA Europa League final" (raw): date, 21:00 CEST kick-off, San Mamés, 49,224, line-ups and numbers, formations, Player of
 *    the Match, the kit templates (wiki-2025-uel-final.txt)
 *  - UEFA.com, "Cristian Romero named official 2025 UEFA Europa League final Player of the Match" (21 May 2025), the Technical Observer quote
 *    https://www.uefa.com/uefaeuropaleague/news/0299-1dd00d190bc3-26c6905820e3-1000/  (uefa-romero-potm-uel-2025.txt)
 *  - The Guardian minute-by-minute, "Tottenham Hotspur 1-0 Manchester United: Spurs win Europa League final – as it happened" (21 May 2025),
 *    both pages (guardian-tot-mun-uel-final-2025-live.txt, -live-p2.txt): United's long balls "looped into the Spurs box", Romero's 45+2' header
 *    clear, the Romero–Maguire duels, the 76' slide on Shaw (not used)
 *  - BBC Sport live page (bbc-live-tot-mun-uel-final-2025.txt): Spurs line-up order (Porro, Romero, van de Ven, Udogie), Romero (c) wearing 17
 *  - Wikipedia "Cristian Romero" (raw): 1.85 m; style of play: a "proactive" defender on the "front foot", who steps up to intercept; "well known
 *    for his decision-making in his risky style of play" (wiki-cristian-romero.txt)
 * CONFIRMED by those accounts: Tottenham 1–0 Manchester United, 21 May 2025, San Mamés, Bilbao, 21:00 CEST (an evening, floodlit final);
 * Romero, Spurs' captain for the night, started at centre-back wearing 17, the right of the pair (line-up order Porro 23, Romero 17, van de Ven
 * 37, Udogie 13), with Vicario 1 in goal; he was UEFA's Player of the Match; United's "direct play"; "aggressive with the defensive line";
 * "won the first contacts", "won the 1v1s". Kits (Wikipedia's kit boxes from the line-up sheet): Tottenham in WHITE shirts with navy sleeves
 * and trim, white shorts, white socks; Manchester United in RED shirts, black shorts, black socks.
 * INFERRED (illustrative, not in the accounts): the whole choreography — who hit the long ball, the striker (unnamed, no number printed),
 * the race, the bounce, the slide on his LEFT leg (the leg nearer the ball; he is right-footed, not narrated), the ball poked to Porro, the
 * striker hurdling the slide — plus which end Spurs defended on screen (here their goal is on the left of the main camera), every other
 * position, all camera placements and lenses, Vicario's keeper-kit colour (a neutral grey), the crowd colours, the roof lights and skin/hair
 * tones. The narration names only confirmed facts plus the lesson.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; no top-down shots): 1 = live, the high main-stand
 * camera panning with the long ball — real time; 2 = TV slow-motion replay from a low touchline camera ahead of the race: Romero reads the drop,
 * a step closer than the striker, then slides; 3 = the second replay from the high camera behind Spurs' goal: the boot reaches the ball first
 * and pokes it away to Porro, the striker hurdles, clean; 4 = the lesson (the only chapter with teaching marks): be brave (a ring), the two
 * races to the ball (his shorter), reach it first (a burst + ghost), too late (a crossed-out late slide) and stay on your feet (a standing ghost).
 * Bodies: the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Scenes read only their local time t;
 * every action keys off cue times, so the recorded voice (withTiming) re-times the film; nothing is random (wobble is seeded). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,stand,keeperSet,slideTackle,backpedal,strike,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.75 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [6,5,5,5]. Every cue starts with a
 * plain word (Kokoro splits contractions and hyphenated words). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The final',text:'Bilbao, twenty twenty-five: the Europa League final. Manchester United kept hitting long balls at Tottenham. Here is how Spurs captain Cristian Romero handled them: race, and slide!',seconds:14,
  cues:[[.1,'Bilbao'],[2.08,'the Europa League final'],[3.89,'Manchester United kept'],[5.34,'long balls'],[7.15,'Here is how'],[10.77,'race, and slide']]},
 {label:'Watch again',text:'Watch again, slowly. Romero reads where the ball will drop. He is a step closer than the striker. Now he slides.',seconds:10.2,
  cues:[[.1,'Watch again'],[1.72,'Romero reads'],[3.54,'will drop'],[5.34,'a step closer'],[7.88,'Now he slides']]},
 {label:'Ball first',text:'His boot reaches the ball first, pokes it away. Clean! That night, Romero was named player of the match.',seconds:9.4,
  cues:[[.1,'His boot'],[1.92,'first'],[2.46,'pokes it away'],[3.9,'Clean'],[4.62,'That night']]},
 {label:'Be smart',text:'Be brave, be smart: slide only when you are sure you can reach the ball first. Too late? Stay on your feet!',seconds:10.6,
  cues:[[.1,'Be brave'],[2.08,'slide only when'],[4.99,'reach the ball first'],[6.8,'Too late'],[7.88,'Stay on your feet']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py romero-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/romero-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/romero-signature/timing.json';
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

// ---------------------------------------------------------------- San Mamés at night: a closed, steep, roofed box, a lit roof rim, LED boards, grass, markings
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-14,76],b:[119,76],out:[0,1]},    // far side
 {a:[113,-9],b:[113,77],out:[1,0]},    // the far end
 {a:[-14,-8],b:[119,-8],out:[0,-1]},   // main stand (the live camera sits in it)
 {a:[-8,-9],b:[-8,77],out:[-1,0]},     // behind Spurs' goal
];
/** Spurs white-and-navy, United red, a little blue (inferred crowd colours; both clubs' fans filled the ground) */
const TIER_INK:[string,number][]=[[R,.5],[K,.28],[B,.22],[R,.3],[K,.5],[Y,.12],[R,.2],[K,.18]];
function stadium(s:Sheet,c:Cam){
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),rim=new Path2D(),boards=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,40,1.2+40*.66),P(0,40,1.2+40*.66)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  // roof canopy and rear wall run on past the stand ends so the corners of the box close (no paper gaps)
  addPoly(roof,[P(-.35,-4,31),P(1.35,-4,31),P(1.35,48,36),P(-.35,48,36)],c);addPoly(roof,[P(-.35,38,22),P(1.35,38,22),P(1.35,38,36),P(-.35,38,36)],c);
  // the floodlit strip along the roof's front edge
  addPoly(rim,[P(-.3,-4,30.2),P(1.3,-4,30.2),P(1.3,-4,31.2),P(-.3,-4,31.2)],c);
  const segs=16;for(let k=0;k<22;k++){const d0=1+k*1.7,d1=d0+1.34,y0=1.2+d0*.66,y1=1.2+d1*.66;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 // LED advertising boards along the near touchline
 for(let i=0;i<9;i++){const x0=-2+i*12.4,x1=x0+11.8;addPoly(boards,[[x0,0,-4.2],[x1,0,-4.2],[x1,.95,-4.2],[x0,.95,-4.2]],c);}
 // the night: the roof's dark underside over the whole ground, printed first
 {const lid=new Path2D();addPoly(lid,[[-70,36.5,-70],[180,36.5,-70],[180,36.5,140],[-70,36.5,140]],c);s.fill(K,lid,.78);s.fill(B,lid,.3);}
 // the four corners of the box: crowd ramps closing the gaps between the stands (a low camera looks straight into them)
 {const corner=new Path2D(),crowd=new Path2D();for(const[cx,cz,ox,oz]of[[113,76,1,1],[113,-8,1,-1],[-8,76,-1,1],[-8,-8,-1,-1]]as[number,number,number,number][]){
  const q=(dx:number,dz:number,y:number):V3=>[cx+ox*dx,y,cz+oz*dz];
  addPoly(corner,[q(0,0,1.2),q(40,0,27.6),q(40,40,27.6),q(0,40,27.6)],c);addPoly(crowd,[q(1,1,1.8),q(38,1,26),q(38,38,26),q(1,38,26)],c);}
  s.fill(K,corner,.3);s.fill(R,crowd,.3);s.fill(K,crowd,.3);}
 s.fill(K,concrete,.22);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.7);
 s.knockout(rim,.9);s.fill(Y,rim,.45);
 s.fill(K,wall,.55);s.stroke(K,wall,Math.max(2,.05*P3([30,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.fill(Y,grass,.55);s.fill(B,grass,.5);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 // the boards: a navy panel with a red LED band (printed after the grass so they stand on it)
 s.fill(K,boards,.8);
 for(const[x,z]of[[0,0],[105,0],[0,68],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir (Spurs': gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
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
 * z both ways — that keeps every left leg a left leg (Romero runs toward his own goal, −X, so his LEFT side faces the near touchline, where the
 * ball and the striker are). */
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
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.45],[R,.3]],SKIN_D:InkFill[]=[[K,.75],[R,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Tottenham: white shirts with navy sleeves/trim, white shorts, white socks (Wikipedia kit box from the line-up sheet); navy numbers */
const spurs=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:K,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Manchester United: red shirts, black (navy) shorts, black (navy) socks */
const united=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:K,socks:K,boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.4],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Romero: number 17, 1.85 m, strong, dark hair */
const ROMERO:AthleteStyle=spurs({number:17,seed:17,skin:SKIN_M,hair:K,build:{height:1.85,bulk:1.06,thighs:1.06}});
/** the United striker: unnamed, no number printed (the duel is illustrative) */
const STRIKER:AthleteStyle=united({number:null,seed:9,hair:[Y,.7],build:{height:1.91,bulk:1.06,thighs:1.06}});
const VICARIO:AthleteStyle={shirt:[K,.4],trim:K,shorts:[K,.4],socks:[K,.4],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.28],sleeves:'long',gloves:'paper',
 number:1,numberInk:'paper',build:{height:1.94,bulk:1.04},scale:FIG,seed:1};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:17,build:ROMERO.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; Spurs' goal line X=0, near touchline Z=0; play seconds T, T=0 = the long ball struck)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
/** the slide: from T_SLIDE for SLIDE_DUR s, heading toward his own goal and across, in front of the striker, toward the near touchline */
const T_SLIDE=3.1,SLIDE_DUR=.7,T_CONTACT=T_SLIDE+.42*SLIDE_DUR,T_SLID=T_SLIDE+SLIDE_DUR;
const SLIDE_H=nrm2(-1,-.95),SLIDE_AT:[number,number]=[27.2,21.6],SLIDE_PLACE=placeOf(SLIDE_AT[0],SLIDE_AT[1],SLIDE_H);
const SLIDE_LEN=slideTackle(1,{foot:'l'}).dx;
/** Romero's slide on the LEFT leg (the leg nearer the ball): the library slide, the lead leg lowered through the contact so the boot is on
 * the grass, the instep to the ball */
function SLIDE(u:number):Pose{const p=slideTackle(clamp(u),{foot:'l'}),w=sm(.25,.38,u)*(1-sm(.62,.82,u));return w>0?clampPose({...p,lHipF:p.lHipF-.18*w,lAnk:p.lAnk-.1*w}):p;}
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** the ball meets Romero's left boot here: solved from the body at the contact frame of the slide */
const BALL_T:[number,number]=(()=>{const sk=solve(SLIDE(.42),ROMERO.build,SLIDE_PLACE,FIG),f=toMy(midSole(sk.lToe,sk.lHeel));return[f[0]-.08,f[2]-.14];})();
const DOWN_AT:[number,number]=add2(SLIDE_AT,SLIDE_H,SLIDE_LEN);
/** the long ball's line (from United's half, over the top, dropping into the channel between Romero and Porro) */
const D=nrm2(-1,-.3);
const T_LAND=2.2,T_HOP=2.95;
/** it lands a few metres beyond the pair, skips up once and checks on the grass, so the race is to the second drop */
const P2:[number,number]=add2(BALL_T,D,-.8),P1:[number,number]=add2(BALL_T,D,-2.9),LAUNCH:[number,number]=add2(P1,D,-31);
/** after the touch: poked toward the near touchline, where Porro collects it */
const OUT_H=nrm2(-.28,-1),PORRO_RECV:[number,number]=add2(BALL_T,OUT_H,9.5),T_PORRO=T_CONTACT+1.6;
/** the striker: chasing the drop on the near side of Romero, a stride behind the ball when Romero gets there */
const D_C:[number,number]=add2(add2(BALL_T,D,-2.5),[D[1],-D[0]],-.35);
const STR_KEYS=[[-1.5,...add2(D_C,D,-17.6)],[0,...add2(D_C,D,-16.4)],[1,...add2(D_C,D,-11.4)],[2,...add2(D_C,D,-6)],[T_CONTACT,...D_C]];
/** Romero: stepping up with the high line as the ball is struck, the turn, the race on the inside of the striker, the slide */
const ROMERO_KEYS=[[-1.5,39.4,26.6],[0,40.4,26.4],[.45,40.1,26.2],[1,37.6,25.2],[2,32.4,23.4],[T_SLIDE,...SLIDE_AT]];
/** the striker hurdles the slide and pulls up */
const STR_OUT=[[T_CONTACT+.8,...add2(D_C,D,2.1)],[T_CONTACT+1.6,...add2(add2(D_C,D,4.1),[0,-.3])],[T_CONTACT+2.8,...add2(add2(D_C,D,5),[0,-.9])],[16,...add2(add2(D_C,D,5.2),[0,-1.1])]];
/** the United player who hits the long ball: right foot, solved so his boot is at LAUNCH at T=0 */
const STRIKE_DUR=1,L_START=-STRIKE_CONTACT*STRIKE_DUR,L_H=D;
const LAUNCHER:AthleteStyle=united({seed:31,number:null});
const L_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),LAUNCHER.build,placeOf(0,0,L_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[LAUNCH[0]-f[0]-L_H[0]*.13,LAUNCH[1]-f[2]-L_H[1]*.13];})();
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'romero',style:ROMERO,keys:ROMERO_KEYS},
 {id:'striker',style:STRIKER,keys:STR_KEYS},
 {id:'launcher',style:LAUNCHER,keys:[[-3,...add2(L_AT,D,-4)],[L_START,...L_AT],[16,...L_AT]]},
 {id:'porro',style:spurs({number:23,seed:23,build:{height:1.73}}),keys:[[-1.5,44.5,8.6],[0,45.5,8.4],[1,41,8],[2.5,33,7.4],[T_CONTACT,27,PORRO_RECV[1]+.4],[T_PORRO,...add2(PORRO_RECV,[-.7,-.1])],[16,...add2(PORRO_RECV,[-.9,-.1])]]},
 // everyone else: positions and runs illustrative (not in the accounts)
 {id:'vdv',style:spurs({number:37,seed:37,skin:SKIN_D,build:{height:1.93}}),keys:[[-1.5,39,38],[0,40,37.6],[1.2,37.4,36],[3,30,33],[5,26,31],[16,24,30]]},
 {id:'s-mid',style:spurs({seed:30}),keys:[[-1.5,50,30],[0,50.6,29.6],[2,46,27],[4,40,25],[16,36,24]]},
 {id:'s-mid2',style:spurs({seed:8,skin:SKIN_D}),keys:[[-1.5,51,44],[0,51.4,43],[2,47,40],[4,42,37],[16,38,35]]},
 {id:'u-fwd',style:united({seed:16,skin:SKIN_D}),keys:[[-1.5,42,44],[0,42.5,43.5],[1.5,38,40],[3.5,31,36],[6,27,33],[16,25,32]]},
 {id:'u-fwd2',style:united({seed:7}),keys:[[-1.5,45,12],[0,45.4,12.6],[2,40,13],[4,34,14.5],[16,31,15]]},
 {id:'u-mid',style:united({seed:18,skin:SKIN_M}),keys:[[-1.5,60,40],[0,59,39.5],[3,53,37],[16,48,35]]},
];
const VICARIO_KEYS=[[-2,13,33],[2,10,31],[4,8.5,29.5],[16,8,29]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-3.2);for(let t=-3;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const v3=(p:[number,number]):V3=>[p[0],.11,p[1]];
/** The ball at play time T: at the launcher's boot, the long ball (high, 2.2 s in the air), the bounce, a low skip, rolling on to Romero's
 * left boot, then poked away to Porro. */
function ballAt(T:number):V3{
 if(T<0)return v3(LAUNCH);
 if(T<T_LAND)return lerp3(v3(LAUNCH),v3(P1),T/T_LAND,6.2);
 if(T<T_HOP)return lerp3(v3(P1),v3(P2),(T-T_LAND)/(T_HOP-T_LAND),1.1);
 if(T<T_CONTACT)return lerp3(v3(P2),v3(BALL_T),clamp((T-T_HOP)/(T_CONTACT-T_HOP)));
 return lerp3(v3(BALL_T),v3(PORRO_RECV),sm(T_CONTACT,T_PORRO,T,easeOut));
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
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. Looks UP at a high ball. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const up=clamp(Math.atan2(b[1]-1.7,Math.hypot(b[0]-x,b[2]-z)+.5),-.2,1.1);
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=(.25-up*.9)*w;return clampPose(p);}
/** Romero: stepping up, the turn (hips swing round toward his own goal), the race on the inside, the slide on the left leg, down, straight up */
function romeroState(T:number):St{
 if(T<T_SLIDE+.08){
  const turn=sm(.2,.8,T,easeInOutSine),v=velAt(ROMERO_KEYS,T),sp=Math.hypot(v[0],v[1]),run:[number,number]=sp>.5?[v[0]/sp,v[1]/sp]:[-1,0];
  const h=T<.8?yawTo([1,.05],[-1,-.2],turn):yawTo(run,SLIDE_H,sm(2.5,T_SLIDE,T,easeInOutSine));
  const st=runState(ROMERO_KEYS,T,h);let pose=lookAtBall(st,T,.8);
  // stepping up: a ready stance on his toes as the ball is struck (the high line)
  pose=blendPose(pose,backpedal(T*1.4),win(T,-1.6,.5,.4)*.4);
  // flat out through the race: deeper lean and arm drive
  pose=blendPose(pose,clampPose({...pose,lean:pose.lean+.12,pitch:pose.pitch+.05}),win(T,1,2.9,.5));
  if(T<T_SLIDE)return{pose,place:st.place};
  return{pose:blendPose(pose,SLIDE((T-T_SLIDE)/SLIDE_DUR),sm(T_SLIDE,T_SLIDE+.08,T)),place:SLIDE_PLACE};}
 if(T<T_SLID)return{pose:SLIDE((T-T_SLIDE)/SLIDE_DUR),place:SLIDE_PLACE};
 const down={...slideTackle(1,{foot:'l'}),dx:0},h=yawTo(SLIDE_H,nrm2(-.2,-1),sm(T_SLID+.5,T_SLID+1.2,T));
 const kneel=posed({rHipF:70,rKnee:120,rAnk:30,lHipF:20,lKnee:100,lAnk:40,lean:30,pitch:4,lShA:40,rShA:30,rShF:30,lShF:-10,lElb:30,rElb:40,neckP:10});
 // straight back up — and a clenched fist to the crowd
 const fist=posed({lShF:40,lShA:70,lElb:120,rShA:30,rElb:40,lean:-4,neckP:-14,lHipF:4,rHipF:-4});
 const u=clamp((T-(T_SLID+.3))/.9),pose=u<=0?down:keyPoses(u,[[0,down],[.45,kneel],[1,stand()]]);
 return{pose:blendPose(pose,fist,sm(T_SLID+1.3,T_SLID+1.7,T)*.85),place:placeOf(DOWN_AT[0],DOWN_AT[1],h)};
}
/** the striker's hop over the slide: take-off, knees tucked, landing, pulling up (authored in degrees; grounding is automatic) */
const HOP:[number,Pose][]=[
 [0,posed({lHipF:40,lKnee:30,rHipF:-20,rKnee:70,rAnk:30,lean:14,pitch:8,lShF:-30,rShF:40,lElb:84,rElb:84,neckP:14})],
 [.25,posed({dx:.8,air:.34,lHipF:74,lKnee:96,rHipF:30,rKnee:110,rAnk:34,lean:12,pitch:6,lShF:40,rShF:60,lShA:50,rShA:56,lElb:40,rElb:44,neckP:24})],
 [.5,posed({dx:1.6,air:.12,lHipF:40,lKnee:40,rHipF:-10,rKnee:80,lean:18,pitch:10,lShF:20,rShF:-20,lShA:40,rShA:48,lElb:60,rElb:60,neckP:20,squash:-.06})],
 [1,posed({dx:2.2,lHipF:22,lKnee:34,rHipF:4,rKnee:40,lean:14,pitch:4,lShA:20,rShA:24,lElb:60,rElb:60,neckP:6,neckY:-30})],
];
function strikerState(T:number):St{
 if(T<T_CONTACT){const st=runState(STR_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};}
 const u=clamp((T-T_CONTACT)/.8),hop=keyPoses(u,HOP),run=runState(STR_KEYS,T_CONTACT).pose,place=placeOf(D_C[0],D_C[1],D);
 if(u<1)return{pose:blendPose(run,hop,sm(0,.12,u)),place};
 // pulling up: jogging on a few steps, turning to watch the ball go to Porro, arms out
 const p=trackAt(STR_OUT,T),h=yawTo(D,nrm2(-.1,-1),sm(T_CONTACT+1,T_CONTACT+2.2,T)),v=velAt(STR_OUT,T),sp=Math.hypot(v[0],v[1]);
 const jog=blendPose(stand(),runCycle(strideAt(STR_OUT,T)*.9/3,{speed:clamp((sp-1.5)/6)}),clamp((sp-.4)/2));
 const shrug=posed({lShA:40,rShA:40,lElb:50,rElb:50,lShR:30,rShR:30,neckP:6});
 return{pose:blendPose(blendPose({...HOP[3][1],dx:0},jog,sm(T_CONTACT+.8,T_CONTACT+1.1,T)),shrug,sm(T_CONTACT+2,T_CONTACT+2.6,T)*.7),place:placeOf(p[0],p[1],h)};
}
/** the long ball: approach, right-foot strike through the ball (contact at T=0), then watching it go */
function launcherState(T:number):St{
 const k=TR('launcher').keys;
 if(T<L_START){const st=runState(k,T,L_H);return{pose:st.pose,place:st.place};}
 const u=clamp((T-L_START)/STRIKE_DUR),place=placeOf(L_AT[0],L_AT[1],L_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:1}),place};
 return{pose:lookAtBall({pose:keyPoses(clamp((T-L_START-STRIKE_DUR)/.6),[[0,strike(1,{foot:'r',power:1})],[1,stand()]]),place},T,.6),place};
}
function vicarioState(T:number):St{const[x,z]=trackAt(VICARIO_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='romero')return romeroState(T);if(id==='striker')return strikerState(T);if(id==='launcher')return launcherState(T);if(id==='vicario')return vicarioState(T);
 const k=TR(id).keys;
 if(id==='porro'&&T>T_PORRO-.5){const st=runState(k,T,nrm2(1,.2));return{pose:lookAtBall({pose:blendPose(st.pose,stand(),sm(T_PORRO-.5,T_PORRO,T)),place:st.place},T,.8),place:st.place};}
 const st=runState(k,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['romero','striker'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'vicario'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='vicario'?VICARIO:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='romero'&&T>T_SLIDE&&T<T_SLID-.15)||(id==='striker'&&T>T_CONTACT&&T<T_CONTACT+.5)||(id==='romero'&&T>1.2&&T<2.9);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(T>T_CONTACT-.3&&T<T_CONTACT+.4?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera, panning with the long ball — struck, in the air, the race, the slide, poked to Porro. */
const MAIN_CAM:V3=[42,22,-40];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-1.6],[q[2],-.4],[q[3],.25],[q[4],1.6],[q[5]-.2,T_SLIDE-.15],[q[5]+.7,T_CONTACT+.12],[S,T_PORRO+.6]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-1.6,T-.3)),tx=clamp(b[0]-3,22,56),tz=lerp(28,17,sm(-.5,2.5,T)),F=lerp(4200,6300,sm(0,T_SLIDE,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,lerp(0,1.5,win(T,.2,2.2,.6)),tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[5]+.9;},
};
/** 2 · TV slow-motion replay from a low touchline camera ahead of the race: Romero reads the drop, a step closer, then slides. */
/** rail camera offset from the pair's midpoint: a little ahead of them, out on the near touchline at eye height, side-on to the slide (long lens) */
const LOW_OFF:V3=[-5,1.7,-14];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,.3],[q[1],1],[q[2],1.9],[q[3],2.5],[q[4],T_SLIDE-.05],[q[4]+.9,T_CONTACT],[S,T_CONTACT+.25]]);};
const cam2=(t:number)=>{const T=t2(t),k=trackAt(ROMERO_KEYS,Math.min(T,T_SLIDE)),d=trackAt(STR_KEYS,Math.min(T,T_CONTACT)),mx=(k[0]+d[0])/2,mz=(k[1]+d[1])/2,
 F=lerp(4600,6400,sm(.3,T_SLIDE,T,easeInOutSine)),pos:V3=[mx+LOW_OFF[0],LOW_OFF[1],Math.min(-3.4,mz+LOW_OFF[2])];return camAt(pos,[mx+.5,lerp(1.6,.95,sm(1.6,2.6,T)),mz],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const T=t2(twos(t)),k=trackAt(ROMERO_KEYS,Math.min(T,T_SLIDE)),p=P3([k[0],1,k[1]],cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.3*p[2]),12);},
 get still(){return Q(1)[4]+.9;},
};
/** 3 · the second replay, from the high camera behind Spurs' goal (far-post side, so the slide is side-on): the boot first, poked away to Porro, the striker hurdles, clean. */
const BEHIND:V3=[-9,6,42];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_SLIDE-.3],[q[1],T_CONTACT-.02],[q[1]+.4,T_CONTACT+.03],[q[2],T_CONTACT+.2],[q[3],T_CONTACT+.9],[S,T_PORRO+1.6]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(T),u=.35*sm(T_CONTACT+.05,T_PORRO,T),tx=lerp(BALL_T[0]+1,b[0],u),tz=lerp(BALL_T[1]+.3,b[2],u),
 F=lerp(6200,4600,sm(T_CONTACT,T_PORRO,T,easeInOutSine));return camAt(BEHIND,[tx,.8,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6,only:[...TRACKS.map(k=>k.id),'ball']});frame(s);},// no keeper: he would sit cut off at the lens edge
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.5;},
};
/** 4 · the lesson plate: the race again from a raised camera on the near side, with bold yellow teaching marks — a ring round Romero (be
 * brave), the two races to the drop (his arrow short and yellow, the striker's longer), the slide stamped at the ball (reach it first), a
 * late slide at the striker's heels crossed out (too late?) and a standing yellow ghost with a tick (stay on your feet). */
const LESSON_OFF:V3=[9,6.5,-12];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,1.4],[q[1],2.3],[q[1]+.9,2.55],[q[2],2.6],[q[2]+.9,T_CONTACT+.02],[S,T_CONTACT+.25]]);};
const LESSON_MID:[number,number]=[(SLIDE_AT[0]+D_C[0])/2+1.2,(SLIDE_AT[1]+D_C[1])/2];
/** the camera follows the pair (as in the live shot) and settles on the duel for the marks */
const cam4=(t:number)=>{const T=Math.min(t4(t),T_SLIDE),r=trackAt(ROMERO_KEYS,T),d=trackAt(STR_KEYS,T),u=sm(2.3,T_SLIDE,T),mx=lerp((r[0]+d[0])/2,LESSON_MID[0],u),mz=lerp((r[1]+d[1])/2,LESSON_MID[1],u);
 return camAt([mx+LESSON_OFF[0],LESSON_OFF[1],mz+LESSON_OFF[2]],[mx-.5,.4,mz],lerp(2300,2600,sm(0,SECS(3),t,easeInOutSine)));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrowPath(a:Pt,b:Pt,w:number,seed:number,u=1){const p=new Path2D();if(u<=.01)return p;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)];p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));return p;}
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
function crossOut(s:Sheet,g:[number,number,number],k:number,seed:number){const r=.95*g[2]*clamp(k),w=Math.max(12,.2*g[2]);if(r<1)return;const x=new Path2D();
 x.addPath(ribbon([[g[0]-r,g[1]-r*.8],[g[0]+r,g[1]+r*.8]],w,{seed,taper:.1}));x.addPath(ribbon([[g[0]+r,g[1]-r*.8],[g[0]-r,g[1]+r*.8]],w,{seed:seed+1,taper:.1}));s.knockout(x);s.fill(R,x,.95);s.stroke(K,x,5,.9);}
/** the late slide (the mistake): the same slide, one stride late, arriving behind the ball at the striker's heels */
const LATE_PLACE=placeOf(D_C[0]+2.6,D_C[1]+1.9,nrm2(-1,-.7));
/** "stay on your feet": the ready stance, goal-side of the striker */
const FEET_PLACE=placeOf(D_C[0]-.2,D_C[1]+3,nrm2(-1,-.4));
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  const who=['romero','striker','porro','vicario','ball'];
  stadium(s,c);
  // "Be brave": a yellow ring on the grass round Romero (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.2,q[1]+.6,t));
  if(hal>.01){const m=romeroState(T).place;groundRing(s,m.x!,-m.z!,1.2*hal,c);}
  // "slide only when you are sure": the two races to where the ball drops — his arrow yellow and shorter, the striker's pale and longer
  const race=sm(q[1],q[1]+.5,t,easeInOutSine)*(1-sm(q[2]+.4,q[2]+.8,t));
  if(race>.01){const drop=G(BALL_T[0],BALL_T[1],c),w=Math.max(12,.2*P3([BALL_T[0],0,BALL_T[1]],c)[2]);
   const r=trackAt(ROMERO_KEYS,2.3),d=trackAt(STR_KEYS,2.3);
   const pr=arrowPath(G(d[0],d[1],c),drop,w*.75,41,race);s.stroke(K,pr,5,.5);s.knockout(pr,.8);s.fill(R,pr,.45);
   mark(s,arrowPath(G(r[0],r[1],c),drop,w,42,race));}
  drawPlay(s,T,c,{ballScale:1.5,only:who,noStadium:true});
  // "reach the ball first": a burst at the ball and the slide stamped as a ghost at the contact frame
  const stamp=sm(q[2]+.8,q[2]+1.1,t,easeOutBack)*(1-sm(q[3]-.1,q[3]+.3,t));
  if(stamp>.002){const bp=P3([BALL_T[0],.11,BALL_T[1]],c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:62,g:clamp(stamp),width:.07*bp[2]});
   const k=.8*bp[2]*clamp(stamp),x=bp[0]+1.3*bp[2],y=bp[1]-1.6*bp[2];mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(stamp),{seed:71,taper:.15}));}
  // "Too late?": the same slide one stride late, at the striker's heels — crossed out in red
  const late=sm(q[3],q[3]+.35,t,easeOutBack);
  if(late>.01){drawPlayer(s,SLIDE(.3+.25*clamp(late)),c,GHOST,LATE_PLACE);crossOut(s,P3([LATE_PLACE.x!-.9,.4,-LATE_PLACE.z!-.6],c),sm(q[3]+.3,q[3]+.6,t),81);}
  // "Stay on your feet": a standing yellow ghost goal-side, knees bent, and a tick
  const feet=sm(q[4],q[4]+.4,t,easeOutBack);
  if(feet>.01){drawPlayer(s,blendPose(stand(),backpedal(.25),.8),c,GHOST,FEET_PLACE);const g=P3([FEET_PLACE.x!,2.5,-FEET_PLACE.z!],c),k=.7*g[2]*clamp(feet);
   mark(s,ribbon([[g[0]-k*.45,g[1]],[g[0]-k*.12,g[1]+k*.35],[g[0]+k*.55,g[1]-k*.5]],Math.max(8,.14*g[2])*clamp(feet),{seed:91,taper:.15}));}
  frame(s);
 },
 get still(){return Q(3)[4]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'romero-signature',format:'11v11',title:'The fearless slide tackle',theme:'Slide only when you can reach the ball first',
 ageNote:'Tottenham v Man United · Europa League final, 21 May 2025',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little floodlight spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Spurs' goal line X=0, near touchline Z=0, Z across) — checked by tests/play-film-romero-signature.cjs. */
export const FACTS={BALL_T,LAUNCH,PORRO_RECV,D_C,SLIDE_AT,T_SLIDE,T_CONTACT,T_LAND,T_PORRO,ballAt,
 /** mid-sole of each boot at the contact frame (my metres) */
 leftFoot:()=>{const sk=solve(SLIDE(.42),ROMERO.build,SLIDE_PLACE,FIG);return toMy(midSole(sk.lToe,sk.lHeel));},
 rightFoot:()=>{const sk=solve(SLIDE(.42),ROMERO.build,SLIDE_PLACE,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 /** the launcher's right boot at the strike */
 launcherFoot:()=>{const st=launcherState(0),sk=solve(st.pose,LAUNCHER.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 /** the closest boot of each man to the ball at play time T (m) */
 reach:(T:number)=>{const b=ballAt(T),d=(st:St,build:AthleteStyle['build'])=>{const sk=solve(st.pose,build,st.place,FIG);return Math.min(...[sk.lToe,sk.rToe].map(p=>{const m=toMy(p);return Math.hypot(m[0]-b[0],m[2]-b[2]);}));};
  return{romero:d(romeroState(T),ROMERO.build),striker:d(strikerState(T),STRIKER.build)};},
 romeroAt:(T:number)=>{const st=romeroState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 strikerAt:(T:number)=>{const st=strikerState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
