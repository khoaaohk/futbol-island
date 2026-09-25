/** Iconic-play film · Lisandro Martínez, "Signature: the brave challenge" — a real, written-up moment: his sliding block on Miguel Borja in
 * extra time of the Copa América 2024 final, Argentina 1–0 Colombia (a.e.t.), Hard Rock Stadium, Miami Gardens, Sunday 14 July 2024
 * (kick-off 21:22 EDT after an 80-minute delay: a night final under the lights). Lautaro Martínez won it in the 112th minute.
 *
 * WHY THIS MOMENT: Lisandro's entry in lib/town/iconicPlays.json is a signature (kind "signature", template last_ditch_tackle): "the brave
 * challenge", lesson "You don't need to be the tallest: good timing and bravery win duels." This block is a duel that two written accounts
 * describe as one specific play, it came at the most important moment of a final (0–0, Colombia's substitute striker alone in the box), and
 * it is exactly the lesson: the shorter defender (1.75 m) was beaten, kept chasing, and timed a brave slide into the shot. So this film is
 * a recreation of that play, not the "how he does it" fallback. (The 2023 League Cup final is used by the Casemiro film; not reused.)
 *
 * SOURCES (read 24 Sep 2026 with curl; cached under scratchpad/films/src-cache/):
 *  - Wikipedia "2024 Copa América final" (raw; wiki-2024-copa-final.txt): date, venue, delayed kick-off, attendance 65,300, referee Raphael
 *    Claus, line-ups/numbers/substitutions, the kit templates, and the play: "One minute after this action [107'], Miguel Borja received a
 *    through ball while being onside and alone into the box and shot at the left post of Emiliano Martinez, but Lisandro Martinez appeared
 *    from behind and blocked the shot for a corner."
 *  - The Guardian minute-by-minute, "Argentina v Colombia: Copa América 2024 final – live" (15 Jul 2024; guardian-arg-col-copa-2024-live.txt):
 *    "109 min: Colombia with a good spell of possession, and Carrascal flicks the ball forward to Borja. Lisandro Martinez has to slide to
 *    interpose his body and force the ball out for a corner kick." Also "It's hot, it's humid" (end of the first extra-time period).
 *    https://www.theguardian.com/football/live/2024/jul/15/argentina-v-colombia-copa-america-2024-final-live-updates
 *  - The Guardian report, "Martínez inspires Argentina to historic Copa América title in chaotic final" (guardian-arg-col-copa-2024-report.txt):
 *    the hot, humid, end-to-end extra time.
 *  - Wikipedia "Lisandro Martínez" (raw; wiki-lisandro-martinez.txt): 1.75 m ("5'9""), left-footed centre-back nicknamed "The Butcher",
 *    "Despite his relatively short stature for a defender … he is also effective in duels".
 * CONFIRMED by those accounts: the final, the place, the night; Borja (Colombia 9, on at 106') alone in the box, onside, after a forward
 * flick from Jorge Carrascal (8, on at 106'); Borja shot toward Emiliano Martínez's LEFT post; Lisandro (Argentina 25, starting centre-back
 * beside Cristian Romero 13) came from behind, slid, put his body in the way and blocked the shot out for a corner; 0–0 at the time; Emiliano
 * Martínez (23) in goal; Leandro Paredes (5) on at 97', Nahuel Molina (26) on at 72', Nicolás Tagliafico (3) at left-back. KITS (Wikipedia kit
 * boxes, sourced to the line-up sheet): Argentina in the home pattern (sky-blue and white stripes); Colombia in yellow shirts, blue shorts
 * and orange-red socks.
 * INFERRED (illustrative, kept out of the narration): the minute is logged as 108' (Wikipedia) or 109' (Guardian) — the narration says only
 * "in extra time"; every position and run; that the flick is a right-foot flick; Borja's shooting foot (drawn right) and his touch before
 * the shot; the leg Lisandro blocks with (drawn his LEFT, the leg nearer the ball and his stronger foot) and the angle the ball flies out
 * (drawn wide of the left post, over the goal line); which end Argentina defended on screen (their goal on the left of the main camera);
 * Argentina's shorts (drawn black = navy, as in the other Argentina films of this final) and white socks; the keepers' kits (Emiliano drawn
 * in a neutral grey); Lisandro's get-up and fist; Borja's hands on his head; the Hard Rock bowl (drawn as a squared bowl under a canopy,
 * open to the night sky), crowd colours, boards, cameras and lenses; skin and hair tones. Nobody else is named or numbered in the narration.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; no top-down shots): 1 = live, the high main-stand
 * camera panning with Colombia's spell of possession, the flick, Borja through, the shot and the block — real time; 2 = the TV slow-motion
 * replay from a low reverse-angle camera on the far side: Borja a step ahead, Lisandro chasing, reading the shot, sliding into its path;
 * 3 = the second replay from the high camera behind Argentina's goal: the shot comes at the lens, smacks off his leg and flies out wide of
 * the post — corner — and he is straight back up; 4 = the lesson (the only chapter with teaching marks): a ring (you don't need to be the
 * tallest), the shot's path and the spot on it (good timing), his chase arrow (keep chasing), the slide stamped on the path (pick your
 * moment) and a tick (be brave).
 * Bodies: the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Scenes read only their local time t;
 * every action keys off cue times, so the recorded voice (withTiming) re-times the film; nothing is random (wobble is seeded). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,stand,keeperSet,slideTackle,strike,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.75 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [8,5,4,5]. Every cue starts with a
 * plain word (Kokoro splits contractions and hyphenated words; "don't" sits mid-cue only). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'Extra time',text:'Miami, the twenty twenty-four Copa América final, in extra time. Miguel Borja of Colombia is alone in the box. He shoots... Lisandro Martínez slides in from behind and blocks it!',seconds:14.4,
  cues:[[.1,'Miami'],[1.95,'Copa América final'],[3.7,'extra time'],[4.93,'Miguel Borja'],[6.75,'alone in the box'],[8.7,'He shoots'],[10.75,'slides in'],[12.56,'blocks it']]},
 {label:'Watch again',text:'Watch again. Borja is a step ahead, but Lisandro keeps chasing. He reads the shot, then slides into its path.',seconds:10.6,
  cues:[[.1,'Watch again'],[1.33,'Borja is a step ahead'],[4.17,'keeps chasing'],[5.76,'reads the shot'],[7.88,'slides into its path']]},
 {label:'Corner',text:'The ball smacks off his leg and flies out for a corner. Lisandro is only one metre seventy-five!',seconds:8.6,
  cues:[[.1,'The ball smacks'],[2.65,'flies out'],[4.1,'corner'],[5.69,'only one metre']]},
 {label:'Be brave',text:'You don\'t need to be the tallest. Good timing and bravery win duels: keep chasing, pick your moment, be brave!',seconds:10.2,
  cues:[[.1,'You don\'t need'],[3.15,'Good timing'],[5.63,'keep chasing'],[6.65,'pick your moment'],[8.05,'be brave']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py lisandro-martinez-signature, which writes timing.json next to script.json. Then
 * replace this null with `import timingJson from '../../../public/plays/narration/lisandro-martinez-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/lisandro-martinez-signature/timing.json';
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

// ---------------------------------------------------------------- Hard Rock Stadium at night: a squared bowl under a canopy, open to the sky
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-14,76],b:[119,76],out:[0,1]},    // far side
 {a:[113,-9],b:[113,77],out:[1,0]},    // the far end
 {a:[-14,-8],b:[119,-8],out:[0,-1]},   // main stand (the live camera sits in it)
 {a:[-8,-9],b:[-8,77],out:[-1,0]},     // behind Argentina's goal
];
/** Argentina sky blue and white, Colombia yellow, a little red and shadow (inferred mix: both sets of fans filled the bowl) */
const TIER_INK:[string,number][]=[[B,.5],[Y,.75],[K,.3],[B,.32],[Y,.5],[K,.5],[B,.6],[R,.22]];
function stadium(s:Sheet,c:Cam){
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),rim=new Path2D(),boards=new Path2D(),bands=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,40,1.2+40*.66),P(0,40,1.2+40*.66)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  // the canopy over the seats only (the pitch is open to the night): it starts well back from the front row
  addPoly(roof,[P(-.35,14,33),P(1.35,14,33),P(1.35,48,38),P(-.35,48,38)],c);
  // the canopy's lit front edge
  addPoly(rim,[P(-.3,14,32.3),P(1.3,14,32.3),P(1.3,14,33.2),P(-.3,14,33.2)],c);
  const segs=16;for(let k=0;k<22;k++){const d0=1+k*1.7,d1=d0+1.34,y0=1.2+d0*.66,y1=1.2+d1*.66;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 // LED advertising boards along the near touchline and behind Argentina's goal
 for(let i=0;i<9;i++){const x0=-2+i*12.4,x1=x0+11.8;addPoly(boards,[[x0,0,-4.2],[x1,0,-4.2],[x1,.95,-4.2],[x0,.95,-4.2]],c);addPoly(bands,[[x0,.3,-4.21],[x1,.3,-4.21],[x1,.62,-4.21],[x0,.62,-4.21]],c);}
 for(let i=0;i<6;i++){const z0=1+i*11.2,z1=z0+10.6;addPoly(boards,[[-4.6,0,z0],[-4.6,0,z1],[-4.6,.95,z1],[-4.6,.95,z0]],c);addPoly(bands,[[-4.61,.3,z0],[-4.61,.3,z1],[-4.61,.62,z1],[-4.61,.62,z0]],c);}
 // the night sky over the whole frame, printed first (the bowl and the grass knock it out)
 {const sky=new Path2D();sky.rect(-1e4,-1e4,2e4,2e4);s.fill(K,sky,.8);s.fill(B,sky,.35);}
 // the four corners of the bowl: crowd ramps closing the gaps between the stands
 {const corner=new Path2D(),crowd=new Path2D();for(const[cx,cz,ox,oz]of[[113,76,1,1],[113,-8,1,-1],[-8,76,-1,1],[-8,-8,-1,-1]]as[number,number,number,number][]){
  const q=(dx:number,dz:number,y:number):V3=>[cx+ox*dx,y,cz+oz*dz];
  addPoly(corner,[q(0,0,1.2),q(40,0,27.6),q(40,40,27.6),q(0,40,27.6)],c);addPoly(crowd,[q(1,1,1.8),q(38,1,26),q(38,38,26),q(1,38,26)],c);}
  s.knockout(corner);s.fill(K,corner,.3);s.fill(B,crowd,.35);s.fill(Y,crowd,.3);}
 s.knockout(concrete);s.fill(K,concrete,.22);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.75);
 s.knockout(rim,.9);s.fill(Y,rim,.45);
 s.fill(K,wall,.55);s.stroke(K,wall,Math.max(2,.05*P3([30,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.knockout(grass);s.fill(Y,grass,.55);s.fill(B,grass,.5);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 // the boards: a blue panel with a yellow LED band (printed after the grass so they stand on it)
 s.fill(B,boards,.85);s.fill(K,boards,.35);s.knockout(bands,.7);s.fill(Y,bands,.6);
 for(const[x,z]of[[0,0],[105,0],[0,68],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir (Argentina's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
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
 * z both ways — that keeps every left leg a left leg (Lisandro runs toward his own goal, −X, so his LEFT side faces the near touchline, where
 * Borja and the ball are). */
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
/** Argentina: sky-blue (blue screen) and white stripes (confirmed, home pattern); black shorts (navy) and white socks (inferred) */
const arg=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],pattern:'stripes',patternInk:'paper',shorts:K,socks:'paper',boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Colombia: the yellow home shirt, blue shorts, orange-red socks (the kit template: FFFF00 / 1770B0 / FF6600) */
const col=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[B,.85],socks:[R,.9],boots:K,trim:[B,.8],skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Lisandro Martínez: number 25, 1.75 m, compact and strong; dark short hair (card appearance: skin 1, hair 1, short) */
const LISANDRO:AthleteStyle=arg({number:25,seed:25,skin:SKIN_M,hair:K,build:{height:1.75,bulk:1.08,thighs:1.1}});
/** Miguel Borja: number 9, a powerful striker (build drawn taller and heavier than Lisandro; his height is not narrated) */
const BORJA:AthleteStyle=col({number:9,seed:9,skin:SKIN_D,hair:K,build:{height:1.83,bulk:1.1,thighs:1.08}});
/** Emiliano Martínez, 23 — keeper kit colour INFERRED (a neutral grey), paper gloves */
const EMI:AthleteStyle={shirt:[K,.4],trim:K,shorts:[K,.4],socks:[K,.4],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.28],sleeves:'long',gloves:'paper',
 number:23,numberInk:'paper',build:{height:1.95,bulk:1.04},scale:FIG,seed:23};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:25,build:LISANDRO.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; Argentina's goal line X=0, near touchline Z=0; play seconds T, T=0 = Carrascal's flick)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** the shot is struck at T_SHOT and meets Lisandro's left leg at T_CONTACT (a hard low shot, ~25 m/s) */
const T_SHOT=1.5,T_CONTACT=1.58;
/** the slide: SLIDE_DUR s, contact at .42 of it, heading toward his own goal and in across Borja's shot */
const SLIDE_DUR=.7,T_SLIDE=T_CONTACT-.42*SLIDE_DUR,T_SLID=T_SLIDE+SLIDE_DUR;
const SLIDE_H=nrm2(-1,-.3),SLIDE_AT:[number,number]=[13.7,34.9],SLIDE_PLACE=placeOf(SLIDE_AT[0],SLIDE_AT[1],SLIDE_H);
const SLIDE_LEN=slideTackle(1,{foot:'l'}).dx;
/** Lisandro's slide on the LEFT leg (the leg nearer the ball): the library slide, the lead leg lowered through the contact so the boot and
 * shin are on the grass across the shot */
function SLIDE(u:number):Pose{const p=slideTackle(clamp(u),{foot:'l'}),w=sm(.25,.38,u)*(1-sm(.62,.82,u));return w>0?clampPose({...p,lHipF:p.lHipF-.18*w,lAnk:p.lAnk-.1*w}):p;}
/** the block point: Lisandro's left boot at the contact frame of the slide (solved from the body) */
const BLOCK:[number,number]=(()=>{const sk=solve(SLIDE(.42),LISANDRO.build,SLIDE_PLACE,FIG),f=toMy(midSole(sk.lToe,sk.lHeel));return[f[0]-.05,f[2]-.12];})();
const DOWN_AT:[number,number]=add2(SLIDE_AT,SLIDE_H,SLIDE_LEN);
/** Borja aims low at Emiliano Martínez's LEFT post (the far post from the main camera: the keeper faces +X, so his left is +Z) */
const AIM:[number,number]=[0,37.1];
const SHOT_D=nrm2(AIM[0]-BLOCK[0],AIM[1]-BLOCK[1]);
/** the shot leaves Borja's right boot 1.9 m before the block, on the line to the post */
const SHOT_AT:[number,number]=add2(BLOCK,SHOT_D,-1.9);
/** Borja's strike: right foot, solved so the boot is at SHOT_AT at contact */
const STRIKE_DUR=.9,B_START=T_SHOT-STRIKE_CONTACT*STRIKE_DUR;
const B_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BORJA.build,placeOf(0,0,SHOT_D),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[SHOT_AT[0]-f[0]-SHOT_D[0]*.13,SHOT_AT[1]-f[2]-SHOT_D[1]*.13];})();
/** the flick reaches Borja here (his touch), then rolls on to the shot spot */
const T_RECV=.85,RECV:[number,number]=add2(add2(SHOT_AT,SHOT_D,-1.5),[SHOT_D[1],-SHOT_D[0]],-.15);
/** after the block: the ball smacks off the shin, loops up and flies out over the goal line wide of the left post — a corner */
const OUT1:[number,number]=[-.4,40.9],OUT2:[number,number]=[-4.3,42.7],T_OUT1=T_CONTACT+.72,T_OUT2=T_OUT1+.7;
const T_LINE=T_CONTACT+(T_OUT1-T_CONTACT)*(BLOCK[0]/(BLOCK[0]-OUT1[0]));
/** Carrascal: the flick, right foot, from inside-left of the D; solved so his boot is at FLICK at T=0 */
const FLICK:[number,number]=[25.2,29.2],FLICK_H=nrm2(RECV[0]-FLICK[0],RECV[1]-FLICK[1]);
const FLICK_DUR=.8,C_START=-STRIKE_CONTACT*FLICK_DUR;
const CARRASCAL:AthleteStyle=col({number:8,seed:8,build:{height:1.73}});
const C_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.35}),CARRASCAL.build,placeOf(0,0,FLICK_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[FLICK[0]-f[0]-FLICK_H[0]*.13,FLICK[1]-f[2]-FLICK_H[1]*.13];})();
/** Borja: Colombia's spell of possession, then onside on the last line, through, the touch, set to shoot */
const BORJA_KEYS=[[-8,36,25],[-5,31,26.5],[-2.4,26.6,28.6],[0,22.6,30.4],[T_RECV-.25,...add2(RECV,SHOT_D,-2.4)],[T_RECV,...add2(RECV,SHOT_D,-.9)],[B_START,...B_AT]];
/** Lisandro: stepped up with the line, turned and chasing from behind on Borja's right, then the slide */
const LIS_KEYS=[[-8,32,40],[-5,28.5,39.5],[-2.4,25.6,38.8],[0,...add2(SLIDE_AT,SLIDE_H,-10.6)],[.7,...add2(add2(SLIDE_AT,SLIDE_H,-5.2),[0,.25])],[T_SLIDE,...SLIDE_AT]];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'lisandro',style:LISANDRO,keys:LIS_KEYS},
 {id:'borja',style:BORJA,keys:BORJA_KEYS},
 {id:'carrascal',style:CARRASCAL,keys:[[-8,44,22],[-5,38.5,24.5],[-2.2,31.5,27],[C_START-.4,...add2(C_AT,FLICK_H,-1.6)],[C_START,...C_AT],[16,...C_AT]]},
 // everyone else: positions and runs illustrative (not in the accounts)
 {id:'romero',style:arg({number:13,seed:13,build:{height:1.85}}),keys:[[-8,31,25],[-4,26,25.5],[0,21.4,26.6],[1.5,15.5,28.2],[3,11.6,29.4],[16,10,30]]},
 {id:'tagliafico',style:arg({number:3,seed:3,build:{height:1.72}}),keys:[[-8,30,52],[-3,25,48],[0,21,46],[2,15,43.5],[16,11,42]]},
 {id:'molina',style:arg({number:26,seed:26,skin:SKIN_L}),keys:[[-8,31,12],[-3,26,13],[0,22,14.5],[2,17,17],[16,14,18.5]]},
 {id:'paredes',style:arg({number:5,seed:5}),keys:[[-8,38,31],[-3,33,33],[0,29.5,34],[2,23,35],[16,19,35.5]]},
 {id:'depaul',style:arg({number:7,seed:7,hairStyle:'long'}),keys:[[-8,45,40],[-3,39,39],[0,35,38.5],[3,28,38],[16,25,38]]},
 {id:'uribe',style:col({number:15,seed:15}),keys:[[-8,47,35],[-3,39,36],[0,33,37],[2,27,38],[16,23,38.5]]},
 {id:'quintero',style:col({number:20,seed:20,build:{height:1.68}}),keys:[[-8,41,14],[-3,33,16],[0,28,18],[2,22,21],[16,19,23]]},
 {id:'borre',style:col({number:19,seed:19,skin:SKIN_D}),keys:[[-8,40,46],[-3,31,45],[0,25,44],[2,18.5,41.5],[16,15,40.5]]},
];
const EMI_KEYS=[[-8,7,32.5],[0,4.6,34.2],[1.3,3.1,35.1],[16,2.9,35.4]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-8.2);for(let t=-8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const v3=(p:[number,number],y=.11):V3=>[p[0],y,p[1]];
/** The ball at play time T: at Carrascal's feet through the spell of possession, flicked into Borja's run, his touch, the shot, smacked off
 * Lisandro's shin, looping out over the goal line wide of the left post, then bouncing to rest behind it. */
function ballAt(T:number):V3{
 if(T<C_START){const st=runState(TR('carrascal').keys,T,undefined,true),h=[Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)];return[st.place.x!+h[0]*.62,.11,-st.place.z!+h[1]*.62];}
 if(T<0)return lerp3(ballAt(C_START-1e-3),v3(FLICK),sm(C_START,0,T,linear));
 if(T<T_RECV)return lerp3(v3(FLICK),v3(RECV),easeOut(T/T_RECV)*.25+T/T_RECV*.75,.35);
 if(T<T_SHOT)return lerp3(v3(RECV),v3(SHOT_AT),sm(T_RECV,T_SHOT,T,easeOut));
 if(T<T_CONTACT)return lerp3(v3(SHOT_AT),v3(BLOCK,.16),(T-T_SHOT)/(T_CONTACT-T_SHOT));
 if(T<T_OUT1)return lerp3(v3(BLOCK,.16),v3(OUT1,.9),(T-T_CONTACT)/(T_OUT1-T_CONTACT),1.4);
 if(T<T_OUT2)return lerp3(v3(OUT1,.9),v3(OUT2),easeOut((T-T_OUT1)/(T_OUT2-T_OUT1)),.5);
 return v3(OUT2);
}

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number],noBall=false):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8||noBall)h=sp>.05?[v[0]/sp,v[1]/sp]:[-1,0];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const up=clamp(Math.atan2(b[1]-1.7,Math.hypot(b[0]-x,b[2]-z)+.5),-.2,1.1);
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=(.25-up*.9)*w;return clampPose(p);}
/** Lisandro: jogging with the line, the turn and the chase on Borja's right (flat out, deep lean), the slide on the left leg, down, straight
 * back up — and a clenched fist */
function lisandroState(T:number):St{
 if(T<T_SLIDE+.08){
  const v=velAt(LIS_KEYS,T),sp=Math.hypot(v[0],v[1]),run:[number,number]=sp>.5?[v[0]/sp,v[1]/sp]:[-1,0];
  const h=yawTo(run,SLIDE_H,sm(.7,T_SLIDE,T,easeInOutSine));
  const st=runState(LIS_KEYS,T,h);let pose=lookAtBall(st,T,.7);
  pose=blendPose(pose,clampPose({...pose,lean:pose.lean+.14,pitch:pose.pitch+.06}),win(T,-.3,T_SLIDE+.1,.4));
  if(T<T_SLIDE)return{pose,place:st.place};
  return{pose:blendPose(pose,SLIDE((T-T_SLIDE)/SLIDE_DUR),sm(T_SLIDE,T_SLIDE+.08,T)),place:SLIDE_PLACE};}
 if(T<T_SLID)return{pose:SLIDE((T-T_SLIDE)/SLIDE_DUR),place:SLIDE_PLACE};
 const down={...slideTackle(1,{foot:'l'}),dx:0},h=yawTo(SLIDE_H,nrm2(.3,1),sm(T_SLID+.5,T_SLID+1.2,T));
 const kneel=posed({rHipF:70,rKnee:120,rAnk:30,lHipF:20,lKnee:100,lAnk:40,lean:30,pitch:4,lShA:40,rShA:30,rShF:30,lShF:-10,lElb:30,rElb:40,neckP:10});
 const fist=posed({lShF:40,lShA:70,lElb:120,rShF:30,rShA:60,rElb:115,lean:-6,neckP:-18,lHipF:4,rHipF:-4});
 const u=clamp((T-(T_SLID+.3))/.9),pose=u<=0?down:keyPoses(u,[[0,down],[.45,kneel],[1,stand()]]);
 return{pose:blendPose(pose,fist,sm(T_SLID+1.3,T_SLID+1.7,T)*.85),place:placeOf(DOWN_AT[0],DOWN_AT[1],h)};
}
/** Borja: running through, the touch, the right-foot strike, then hands on his head as the ball flies out */
function borjaState(T:number):St{
 if(T<B_START){const st=runState(BORJA_KEYS,T,T>T_RECV-.3?SHOT_D:undefined);return{pose:lookAtBall(st,T,.6),place:st.place};}
 const u=clamp((T-B_START)/STRIKE_DUR),place=placeOf(B_AT[0],B_AT[1],SHOT_D);
 if(u<1)return{pose:strike(u,{foot:'r',power:1}),place};
 const head=posed({lShF:120,rShF:120,lShA:60,rShA:60,lElb:140,rElb:140,neckP:-16,lean:-4});
 const settle=keyPoses(clamp((T-B_START-STRIKE_DUR)/.6),[[0,strike(1,{foot:'r',power:1})],[1,stand()]]);
 return{pose:blendPose(lookAtBall({pose:settle,place},T,.7),head,sm(T_OUT1,T_OUT1+.6,T)*.9),place};
}
/** Carrascal: on the ball through the spell of possession, then the right-foot flick (contact at T=0), then watching it go */
function carrascalState(T:number):St{
 const k=TR('carrascal').keys;
 if(T<C_START){const st=runState(k,T,undefined,true);return{pose:st.pose,place:st.place};}
 const u=clamp((T-C_START)/FLICK_DUR),place=placeOf(C_AT[0],C_AT[1],FLICK_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.35}),place};
 return{pose:lookAtBall({pose:keyPoses(clamp((T-C_START-FLICK_DUR)/.6),[[0,strike(1,{foot:'r',power:.35})],[1,stand()]]),place},T,.6),place};
}
function emiState(T:number):St{const[x,z]=trackAt(EMI_KEYS,T),b=ballAt(Math.min(T,T_CONTACT+.2));return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='lisandro')return lisandroState(T);if(id==='borja')return borjaState(T);if(id==='carrascal')return carrascalState(T);if(id==='emi')return emiState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['lisandro','borja'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'emi'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='emi'?EMI:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='lisandro'&&T>T_SLIDE&&T<T_SLID-.15)||(id==='borja'&&T>T_SHOT-.2&&T<T_SHOT+.2)||(id==='lisandro'&&T>0&&T<T_SLIDE);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(T>T_CONTACT-.3&&T<T_CONTACT+.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}
/** the smack: a yellow burst where the ball meets the shin (replays and lesson only) */
function smack(s:Sheet,T:number,c:Cam,g=1){const k=win(T,T_CONTACT-.02,T_CONTACT+.35,.06)*g;if(k<.01)return;const bp=P3(v3(BLOCK,.2),c);sparkBurst(s,Y,bp[0],bp[1],.8*bp[2],{n:9,seed:52,g:k,width:.06*bp[2]});}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera, panning with Colombia's spell of possession — the flick, Borja through, the shot and the block, real time. */
const MAIN_CAM:V3=[34,18,-58];
const t1=(t:number)=>{const q=Q(0),S=SECS(0),z=q[5]+.25-T_SHOT;return warp(t,[[0,-z],[S,S-z]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.min(T,T_CONTACT+.3)),tx=clamp(b[0]-1,12,40),tz=lerp(28,33,sm(-3,1,T)),F=lerp(6400,9000,sm(-2.5,T_SHOT,T,easeInOutSine))*lerp(1,.85,sm(T_CONTACT,T_CONTACT+1,T));
 return camAt(MAIN_CAM,[tx,.8,tz],F);};
const ch1:Scene={
 draw(s,t){const T=t1(twos(t)),c=cam1(t);frame(s);drawPlay(s,T,c,{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[7]+.9;},
};
/** 2 · TV slow-motion replay from a low reverse-angle camera on the far side, ahead of the pair: Borja a step ahead, Lisandro chasing on the
 * near side of the lens, reading the shot, sliding into its path. */
const REV_OFF:V3=[-7,2.2,13];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-1.1],[q[1],-.2],[q[2],.55],[q[3],T_SLIDE-.12],[q[4],T_SLIDE+.05],[q[4]+1.1,T_CONTACT+.02],[S,T_CONTACT+.22]]);};
const cam2=(t:number)=>{const T=Math.min(t2(t),T_CONTACT),k=trackAt(LIS_KEYS,Math.min(T,T_SLIDE)),d=trackAt(BORJA_KEYS,Math.min(T,B_START)),mx=(k[0]+d[0])/2,mz=(k[1]+d[1])/2,
 F=lerp(3900,5600,sm(-.6,T_SLIDE,T,easeInOutSine)),pos:V3=[mx+REV_OFF[0],REV_OFF[1],Math.max(mz+REV_OFF[2],46)];return camAt(pos,[mx-.4,lerp(1.3,.8,sm(.6,T_SLIDE,T)),mz],F);};
const ch2:Scene={
 draw(s,t){const T=t2(twos(t)),c=cam2(t);frame(s);drawPlay(s,T,c,{ballScale:1.6});smack(s,T,c);frame(s);},
 aperture(t){const T=t2(twos(t)),k=trackAt(LIS_KEYS,Math.min(T,T_SLIDE)),p=P3([k[0],1,k[1]],cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.3*p[2]),12);},
 get still(){return Q(1)[4]+1.2;},
};
/** 3 · the second replay, from the high camera behind Argentina's goal: the shot comes at the lens, smacks off his leg and flies out wide of
 * the post (corner), and he is straight back up with a fist. */
const BEHIND:V3=[-11,9.5,31];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_SHOT-.45],[q[0]+.35,T_CONTACT],[q[0]+.9,T_CONTACT+.06],[q[1],T_CONTACT+.4],[q[2],T_LINE+.1],[q[2]+.8,T_LINE+.4],[q[3],T_SLID+1.35],[S,T_SLID+2.2]]);};
const cam3=(t:number)=>{const T=t3(t),u=sm(T_CONTACT+.05,T_LINE,T,easeInOutSine),w=sm(T_LINE+.4,T_SLID+1.4,T,easeInOutSine),b=ballAt(Math.min(T,T_LINE));
 const tx=lerp(lerp(BLOCK[0]+.8,b[0]+1.5,u),DOWN_AT[0]+.4,w),tz=lerp(lerp(BLOCK[1],b[2],u),DOWN_AT[1],w),F=lerp(lerp(5600,3600,u),6600,w);return camAt(BEHIND,[tx,lerp(lerp(.7,b[1]*.5,u),1.1,w),tz],F);};
const ch3:Scene={
 draw(s,t){const T=t3(twos(t)),c=cam3(t);frame(s);drawPlay(s,T,c,{ballScale:1.6,only:['lisandro','borja','romero','tagliafico','paredes','borre','uribe','ball']});smack(s,T,c,1.2);frame(s);},// no keeper: he would sit cut off at the lens edge
 aperture(t){const T=t3(twos(t)),st=lisandroState(T),p=P3([st.place.x!,.8,-st.place.z!],cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.3*p[2]),12);},
 get still(){return Q(2)[3]+1;},
};
/** 4 · the lesson plate: the chase and the block again from a raised camera on the near side, with bold yellow teaching marks — a ring
 * round Lisandro (you don't need to be the tallest), the shot's path with the spot on it (good timing), his chase (keep chasing), the slide
 * stamped on the path (pick your moment) and a tick (be brave). */
const LESSON_OFF:V3=[6,6.2,-12.5];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-.5],[q[1],.55],[q[2],.95],[q[3],T_SLIDE-.02],[q[3]+.9,T_CONTACT],[S,T_CONTACT+.06]]);};
const LESSON_MID:[number,number]=[(BLOCK[0]+SHOT_AT[0])/2+.8,(BLOCK[1]+SHOT_AT[1])/2+.4];
/** the camera follows the pair and settles on the duel for the marks */
const cam4=(t:number)=>{const T=Math.min(t4(t),T_SLIDE),r=trackAt(LIS_KEYS,T),d=trackAt(BORJA_KEYS,Math.min(T,B_START)),u=sm(.2,T_SLIDE,T),mx=lerp((r[0]+d[0])/2,LESSON_MID[0],u),mz=lerp((r[1]+d[1])/2,LESSON_MID[1],u);
 return camAt([mx+LESSON_OFF[0],LESSON_OFF[1],mz+LESSON_OFF[2]],[mx-.6,.4,mz],lerp(2700,3000,sm(0,SECS(3),t,easeInOutSine)));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrowPath(a:Pt,b:Pt,w:number,seed:number,u=1){const p=new Path2D();if(u<=.01)return p;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)];p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));return p;}
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
function tick(s:Sheet,x:number,y:number,k:number,w:number,seed:number){mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],w,{seed,taper:.15}));}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  const who=['lisandro','borja','romero','emi','ball'];
  stadium(s,c);
  // "You don't need to be the tallest": a yellow ring on the grass round Lisandro (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.2,q[1]+.6,t));
  if(hal>.01){const m=lisandroState(T).place;groundRing(s,m.x!,-m.z!,1.2*hal,c);}
  // "Good timing": the shot's path from Borja's boot to the post (pale red), with the spot on it where he meets it (yellow)
  const path=sm(q[1],q[1]+.6,t,easeInOutSine);
  if(path>.01){const a=G(SHOT_AT[0],SHOT_AT[1],c),e=G(AIM[0],AIM[1],c),w=Math.max(10,.16*P3([BLOCK[0],0,BLOCK[1]],c)[2]);
   const pr=arrowPath(a,e,w*.7,41,path);s.stroke(K,pr,5,.5);s.knockout(pr,.8);s.fill(R,pr,.45);
   const spot=sm(q[1]+.4,q[1]+.9,t,easeOutBack);if(spot>.01){const b=G(BLOCK[0],BLOCK[1],c),r=Math.max(10,.3*P3([BLOCK[0],0,BLOCK[1]],c)[2])*spot;mark(s,shape(blob(b[0],b[1],r,r*.45,3,{n:14})));}}
  // "keep chasing": his run from behind Borja to the slide, a bold yellow arrow on the grass
  const chase=sm(q[2],q[2]+.6,t,easeInOutSine);
  if(chase>.01){const pts:Pt[]=[];for(let i=0;i<=10;i++){const p=trackAt(LIS_KEYS,lerp(-.4,T_SLIDE-.1,i/10));pts.push(G(p[0],p[1],c));}
   const a=pts[0],e=pts[Math.max(1,Math.round(10*chase))],w=Math.max(10,.16*P3([SLIDE_AT[0],0,SLIDE_AT[1]],c)[2]);mark(s,arrowPath(a,e,w,43,1));}
  drawPlay(s,T,c,{ballScale:1.5,only:who,noStadium:true});
  // "pick your moment": the slide stamped as a ghost on the shot's path at the contact frame, and the smack
  const stamp=sm(q[3]+.9,q[3]+1.2,t,easeOutBack);
  if(stamp>.01&&T<T_CONTACT-.01)drawPlayer(s,SLIDE(.42),c,GHOST,SLIDE_PLACE);
  smack(s,T,c,1.3);
  // "be brave": a big tick over Lisandro
  const brave=sm(q[4],q[4]+.4,t,easeOutBack);
  if(brave>.01){const g=P3([DOWN_AT[0]-.4,2.2,DOWN_AT[1]],c),k=.9*g[2]*clamp(brave);tick(s,g[0],g[1],k,Math.max(8,.16*g[2])*clamp(brave),91);}
  frame(s);
 },
 get still(){return Q(3)[4]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'lisandro-martinez-signature',format:'11v11',title:'The brave challenge',theme:'Good timing and bravery win duels',
 ageNote:'Argentina v Colombia · Copa América final, 14 July 2024',
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
/** Solved contact points (pitch metres; Argentina's goal line X=0, near touchline Z=0, Z across) — checked by
 * tests/play-film-lisandro-martinez-signature.cjs. */
export const FACTS={BLOCK,SHOT_AT,AIM,RECV,FLICK,SLIDE_AT,OUT1,OUT2,T_SHOT,T_CONTACT,T_SLIDE,T_RECV,T_LINE,ballAt,
 /** mid-sole of each of Lisandro's boots at the contact frame (my metres) */
 leftFoot:()=>{const sk=solve(SLIDE(.42),LISANDRO.build,SLIDE_PLACE,FIG);return toMy(midSole(sk.lToe,sk.lHeel));},
 rightFoot:()=>{const sk=solve(SLIDE(.42),LISANDRO.build,SLIDE_PLACE,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 /** Borja's right boot at the strike; Carrascal's right boot at the flick */
 borjaFoot:()=>{const st=borjaState(T_SHOT),sk=solve(st.pose,BORJA.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 carrascalFoot:()=>{const st=carrascalState(0),sk=solve(st.pose,CARRASCAL.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 /** pelvis of each hero at play time T (my metres, Z as the pitch) */
 lisandroAt:(T:number)=>{const st=lisandroState(T),sk=solve(st.pose,LISANDRO.build,st.place,FIG),p=toMy(sk.pelvis);return[p[0],p[2]] as [number,number];},
 borjaAt:(T:number)=>{const st=borjaState(T),sk=solve(st.pose,BORJA.build,st.place,FIG),p=toMy(sk.pelvis);return[p[0],p[2]] as [number,number];},
 defendersAt:(T:number)=>['romero','tagliafico','molina','paredes','depaul'].map(id=>stateOf(id,T).place.x!)};
