/** Iconic-play film · Gregor Kobel, "Signature: the keeper who starts attacks" — one real, sourced save, then the signature explained:
 * Borussia Dortmund 0–2 Real Madrid, UEFA Champions League final, Saturday 1 June 2024, Wembley Stadium, London — the 49th minute: Toni
 * Kroos's curling free kick from the edge of the box, tipped wide by Kobel.
 *
 * WHY THIS MATCH: Kobel's signature (lib/town/iconicPlays.json, kind "signature", lesson "After a save, look up fast and pass to a free
 * teammate to start an attack") is a habit, not one goal. No page I could read describes one specific Kobel save-and-throw that started a
 * Dortmund counter (the one search attempt hit a bot wall; see below), so the film follows the brief's honest fallback: chapters 1–2
 * recreate a REAL, well-documented Kobel save in his biggest game — the first real save of the 2024 final, the one every report lists —
 * and chapter 3 is openly a lesson ("This is how Kobel starts attacks"), a teaching plate with bold marks, NOT a claimed match moment: it
 * shows the habit (catch, look up fast, find the free teammate, throw) on the same Wembley pitch, and never names a minute or a player.
 *
 * A riso print of one 3D choreography in pitch metres (the same pitch, bowl and kits as carvajal-header-2024.ts and vinicius-signature.ts —
 * the same night): Dortmund's goal line x = 0, Madrid attack +x, goal centre z = 0, +z = Madrid's right, touchlines z = ±34, y up; the
 * main-stand camera on Madrid's LEFT (−z). Chapters: 1 live, the high main-stand camera in real time (Wembley at dusk → the free kick, the
 * wall → Kroos curls it → Kobel's dive, fingertips, wide); 2 the TV slow-motion replay from low behind Kroos, looking down the ball's flight
 * at Kobel's dive (a replay trail); 3 the lesson from high behind Dortmund's goal (catch → look-up arcs → red rings on marked teammates, a
 * yellow ring on the free one → the throw's arc → an arrow: Dortmund are away). No overlays inside the footage chapters. NEVER top-down.
 *
 * SOURCES (fetched Sept 2026 with curl, slowly, cached under the build scratchpad films/src-cache/):
 *  - UEFA.com, Mark Pettit, "Real Madrid win Champions League: Carvajal and Vinícius Júnior see off Dortmund", 1 June 2024
 *    (uefa-bvb-rma-2024.txt): key moments "49': Kobel tips Kroos free-kick wide"; "the German midfielder ... calling Gregor Kobel into action
 *    for the first time with a whipped free-kick"; "81': Kobel claws away Nacho header"; line-ups (Kobel; Ryerson, Hummels, Schlotterbeck,
 *    Maatsen; ...).
 *  - The Guardian, David Hytner, match report, 1 June 2024 (guardian-bvb-rma-2024-report.txt): "Madrid stirred after the second half
 *    restart ... Kroos forced Kobel to tip a curling free-kick behind; from the corner, Carvajal headed off target."
 *  - Sporting News, Brad Cox, final report + live blog (sportingnews-bvb-rma-2024.txt): "Madrid ... forced Kobel into his first real save
 *    of the game. Vinicius was brought down on the edge of the box and Kroos took aim for the top-left corner, but the Dortmund keeper
 *    matched the strike"; "49th minute: Vini is brought down on the edge of the box and Kroos' free-kick forces Kobel into his first real
 *    save of the game. The former Bayern player then takes the corner but it's headed over the bar."
 *  - Wikipedia, "2024 UEFA Champions League final" (raw; wiki-2024-ucl-final.txt): 1 June 2024, Wembley, 20:00 BST kick-off; kits
 *    Dortmund yellow shirts (F7E503), black shorts, yellow socks; Real Madrid all white; Kobel No. 1, Kroos No. 8. (Its prose summary
 *    compresses the 49th minute to "Kroos whipped in a free kick towards the Dortmund penalty area, with Carvajal sending his header over
 *    the bar" — the three match reports above put Kobel's tip and the corner in between; the film follows them.)
 *  - Wikipedia, "Gregor Kobel" (raw; wiki-gregor-kobel.txt): Swiss goalkeeper, Borussia Dortmund since 2021, height 1.95 m; helped
 *    Dortmund reach the 2024 final and was named in the competition's Team of the Season.
 *  - The Guardian live blog (guardian-bvb-rma-2024-live.txt): Dortmund breaking upfield from Madrid corners in the second half (65'), Kobel's
 *    later saves (81', 82'). Not used as a claimed moment — background for the lesson only.
 *  - A DuckDuckGo search for a documented Kobel assist / quick-throw counter returned a bot challenge; per the research rules I stopped
 *    searching and worked from the cache.
 * CONFIRMED: the match, date and venue; the 49th minute, early in the second half, 0–0; Vinícius fouled on the edge of the box; Kroos's
 *  CURLING, whipped free kick aimed at the TOP-LEFT corner; Kobel's first real save of the final; he TIPPED it wide / behind (a corner);
 *  Kroos took the corner and Carvajal headed over; Kobel No. 1, 1.95 m; Kroos No. 8; Dortmund yellow / black / yellow, Madrid all white.
 * INFERRED (illustrative reconstruction, never named in the narration): every position, path and timing in metres and seconds (the free
 *  kick ≈ 20.5 m out, 3.5 m right of centre from Madrid's view, flight ≈ .95 s over a four-man wall with dip); "top-left" read from the
 *  kicker's view, i.e. Kobel's RIGHT (drawn so, never narrated); Kroos's RIGHT foot (his stronger foot, not verified in footage); which hand
 *  touched it (drawn: his top, left hand, the higher one at full stretch); the wall's size and who stood where; Kobel's red keeper kit (as in the two sibling films of
 *  this final; not sourced); which end Dortmund defended in the second half and which side the free kick came from (drawn: the main
 *  camera on Madrid's left, as in the sibling films); the dusk sky (sunset ≈ 21:10, the 49th minute ≈ 21:05); hair, skin tones, crowd
 *  colours, every camera. The whole of chapter 3 is a teaching illustration of the signature habit (the app's signature entry), not a
 *  recorded moment: the cross, the catch, the free full-back and the throw are drawn to explain the lesson.
 *
 * Narration text: public/plays/narration/kobel-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈ .26 s + .025 s a letter per word, see estimate()); EVERY action time is read from cue onsets and chapter
 * seconds, so once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion, motionSmear on the strike, the dive and the throw). Handedness: the world is right-handed (x toward Dortmund's goal,
 * y up, +z = Madrid's right) exactly as athlete.ts, so strike({foot:'r'}) is Kroos's RIGHT foot and Kobel, facing −x, dives to his RIGHT
 * (keeperDive side 'r') toward −z — Kroos's top-LEFT. Composed on the FULL sheet (never sheet.safe) for card windows from 1.45:1 to square.
 * Heat: small figures print at 'low', at most 4 non-hero figures at full detail, every figure inside a passage is capped; poses on twos,
 * cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,posed,keyPoses,blendPose,clampPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. Every cue starts with a plain word (no contraction, no hyphen). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Wembley, 2024',text:'Wembley, 2024, Champions League final. Real Madrid have a free kick, and Dortmund line up their wall. Toni Kroos curls it toward the top corner... but Gregor Kobel flies! Fingertips! Wide!',tail:2.2,
  cues:['Wembley','Champions League final','Real Madrid have','Dortmund line up','Toni Kroos','curls it','top corner','Gregor Kobel flies','Fingertips','Wide']},
 {label:'The replay',text:'Watch again, slowly. Kobel stays on his toes. One quick step, a big push, and his fingertips turn it past the post.',tail:1.8,
  cues:['Watch again','stays on his toes','One quick step','big push','fingertips','past the post']},
 {label:'Start the attack',text:'This is how Kobel starts attacks. He catches it, and looks up fast. Who is free? He throws it out, and Dortmund are away! After a save, look up fast, and pass to a free teammate.',tail:2,
  cues:['This is how','catches it','looks up fast','Who is free','throws it out','Dortmund are away','After a save','free teammate']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/kobel-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/kobel-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/kobel-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('kobel: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kobel: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const DEG=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
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

// ---------------------------------------------------------------- Wembley at dusk (the same bowl as carvajal-header-2024: same night)
const CX=-52.5;
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z, under the arch), 1 behind Dortmund's goal (+x), 2 the main stand (−z,
 * the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122,17,a),1.2+40*b,43+40*b],
 (a,b)=>[9+38*b,1.2+40*b,lerp(62,-62,a)],
 (a,b)=>[lerp(17,-122,a),1.2+36*b,-43-36*b],
 (a,b)=>[-114-38*b,1.2+40*b,lerp(-62,62,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=16;
/** the dark fascias between Wembley's three tiers (b ranges up the rake) */
const FASCIA:[number,number][]=[[.3,.36],[.6,.66]];
/** the arch: a 315 m span rising 133 m, leaning back over the far stand (side inferred) */
const ARCH:V3[]=Array.from({length:33},(_,i)=>{const u=i/32,y=133*(1-Math.pow(2*u-1,2));return[CX+(u-.5)*315,y,80+y*Math.tan(22*DEG)];});
/** crowd colour weights per stand: [paper (Madrid white), yellow (Dortmund, the Yellow Wall), navy (Dortmund black), red (seats, scarves)] */
const CROWD_MIX:[number,number,number,number][]=[[.42,.34,.14,.1],[.3,.46,.16,.08],[.42,.34,.14,.1],[.5,.28,.12,.1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,v=view(s),tt=twos(t);
 // a June dusk over London (≈ 21:05, just before sunset): deep blue sky, a warmer glow low over the roof
 s.field(K,.66,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(B,polyPath([[-1e4,hz[1]-1100],[1e4,hz[1]-1100],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.34);s.tone(R,polyPath([[-1e4,hz[1]-460],[1e4,hz[1]-460],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.14);}
 // the arch (behind the far roof): a paper tube, navy lattice ticks
 {const pts:Pt[]=[];let ok=true;for(const p of ARCH){const q=toCam(c,p);if(q[2]<8){ok=false;break;}pts.push(scr(c,q));}
  if(ok&&pts.length>2){const w=clamp(7.4*c.F/toCam(c,ARCH[16])[2],3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.85);s.tone(B,tube,.12);
   const tick=new Path2D();for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w*.5,ny=dx/l*w*.5;tick.moveTo(pts[i][0]-nx,pts[i][1]-ny);tick.lineTo(pts[i][0]+nx+dx/l*w*.4,pts[i][1]+ny+dy/l*w*.4);}
   s.stroke(K,tick,Math.max(1.5,w*.08),.45);}}
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const[b0,b1] of FASCIA)addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.86),[0,11,0]),add3(S(0,.86),[0,11,0])]));
  seg3(c,add3(S(0,.86),[0,10.8,0]),add3(S(1,.86),[0,10.8,0]),.45,edge);}
 // Wembley's red seats in the dusk (red × navy), the tier fascias dark with a thin lit band
 s.knockout(planes);s.tone(R,planes,.5);s.tone(K,planes,.42);s.knockout(fas);s.fill(K,fas,.85);s.tone(Y,fas,.18);
 // the crowd: Madrid white, Dortmund yellow and black, a scatter of red; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.22)/.78,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(Y,inks[1],.95);s.fill(K,inks[2],.9);s.knockout(inks[3],.7);s.fill(R,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 // floodlights along the roof lip with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.86),[0,10,0]),b=add3(S(u+.025,.86),[0,10,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
}
// ---------------------------------------------------------------- grass under the floodlights, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.7);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.2);
 // advertising boards: navy with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.35);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([CX,0,-34+k*17],[CX,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(CX,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 for(const cx of[-11,CX]){const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([cx+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** Dortmund's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; the side netting ripples as the ball flies past */
function goal3(s:Sheet,c:Cam,ripple=0){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+(z<-1?ripple*.12*Math.sin((z+3.66)*4):0);
 const zs=[z0,-1.8,0,1.4,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_D:InkFill[]=[[Y,.8],[R,.62],[K,.28]];
/** Real Madrid: all white (sourced); navy trim and numbers (inferred) */
const real=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:K,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Borussia Dortmund: yellow shirts, black (navy) shorts, yellow socks (sourced); black trim and numbers */
const bvb=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[K,.92],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.9],numberInk:[K,.9],hairStyle:'short',build:{height:1.84,bulk:1},...o});
const B_KOB:Build={height:1.95,bulk:1},B_KRO:Build={height:1.83,bulk:.96};
/** Kobel: No. 1, 1.95 m (sourced); keeper red (inferred, as in the sibling films of this final), light-brown hair */
const KOB_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_KOB,seed:1};
const KRO_ST=real({number:8,hair:[Y,.7],build:B_KRO,seed:8});

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated
type Role='kob'|'kro'|'wall'|'real'|'bvb'|'wing'|'rb'|'catch';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean;idx?:number};
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const DT=.02;
type Tables={T0:number;X:number[];Z:number[];D:number[]}[];
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
function tables(actors:Actor[],T0:number,T1:number):Tables{return actors.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{T0,X,Z,D};});}
const samp=(T0:number,arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posT=(tb:Tables,k:number,tau:number):[number,number]=>[samp(tb[k].T0,tb[k].X,tau),samp(tb[k].T0,tb[k].Z,tau)];
const distT=(tb:Tables,k:number,tau:number)=>samp(tb[k].T0,tb[k].D,tau);
const velT=(tb:Tables,k:number,tau:number):[number,number]=>{const a=posT(tb,k,tau-.06),b=posT(tb,k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
const midSole=(sk:{rToe:V3;rHeel:V3}):V3=>mix3(sk.rToe,sk.rHeel,.5);

// ================================================================ PLAY 1: the free kick (τ seconds; τ = 0 is Kroos's contact)
const BALL_R=.11,GRAV=9.81;
/** the free kick: 20.5 m out, 3.5 m right of centre (Madrid's view) — "on the edge of the box" (distance and side inferred) */
const P0:V3=[-20.5,BALL_R,3.5];
/** Kobel's dive: to his RIGHT (−z, Kroos's top LEFT), fingertips at T_TIP, the dive started T_DIVE */
const DIVE_L=1.0,DIVE_H=.85,T_TIP=.95,DIVE_U=.55,T_DIVE=T_TIP-DIVE_U*DIVE_L;
/** keeperDive to his right at full height, the body kept more upright through the stretch (a top-corner dive: less roll, hands high) */
const DIVE=(u:number)=>{const p=keeperDive(clamp(u),{side:'r',height:DIVE_H}),w=Math.sin(Math.PI*clamp((u-.2)/.7));p.roll*=1-.3*w;return p;};
/** he faces the ball; the yaw of his set position */
const KOB_YAW=yawTo(P0[0]-(-.6),P0[2]-(-.9));
/** where the tip happens (pitch x,z): just in front of the line, inside the top corner by Kroos's LEFT post */
const TIP_XZ:[number,number]=[-1.1,-3.0];
/** solved once: his top hand (the higher one at full stretch) and where he must stand so it meets TIP_XZ */
const DIVE_SOL=(()=>{const sk=solve(DIVE(DIVE_U),B_KOB,{x:0,z:0,yaw:KOB_YAW}),hand:'l'|'r'=sk.rHa[1]>sk.lHa[1]?'r':'l',h=hand==='r'?sk.rHa:sk.lHa;
 return{hand,at:[TIP_XZ[0]-h[0],TIP_XZ[1]-h[2]] as [number,number],y:h[1]};})();
const KOB_AT=DIVE_SOL.at;
/** the fingertip touch point: the ball's centre one radius beyond the glove */
const TIP:V3=[TIP_XZ[0],Math.min(2.28,DIVE_SOL.y),TIP_XZ[1]-.1];
/** Kroos's curler: a right-footer's ball from right of centre, bending right → left (toward −z) and dipping (topspin) */
const FK_ACC:V3=[0,-GRAV-6,-8];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_FK=launch(P0,TIP,T_TIP,FK_ACC);
/** the deflection: off his fingertips, wide of the post (z < −3.77 as it crosses the line) and behind for a corner */
const OUT_V:V3=[2.6,1.2,-4.2],OUT_A:V3=[0,-GRAV,0],T_OUT=1.2;
const OUT_END:V3=flyA(TIP,OUT_V,OUT_A,T_OUT);
/** Kroos strikes along the launch direction */
const DC=nrm2(V_FK[0],V_FK[2]),YAW_K=yawTo(DC[0],DC[1]);
const PCK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_KRO,{x:0,z:0,yaw:YAW_K}),f=midSole(sk);return[P0[0]-DC[0]*.14-f[0],P0[2]-DC[1]*.14-f[2]];})();
/** the run-up: from behind the ball and to its left (a right-footer's angle) */
const LEFT_K:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCK[0]-DC[0]*3.4+LEFT_K[0]*1.6,PCK[1]-DC[1]*3.4+LEFT_K[1]*1.6];
const kp=(u:number):[number,number]=>[PCK[0]+DC[0]*u,PCK[1]+DC[1]*u];
/** the wall: four Dortmund players 9.15 m from the ball, covering Kroos's near post (+z); the ball goes over its inside end */
const WALL_X=P0[0]+9.15,WALL_Z=[2.25,2.9,3.55,4.2];
const T0=-9,T1=5;
const ACTORS1:Actor[]=[
 {name:'Gregor Kobel',role:'kob',hero:true,style:KOB_ST,keys:[[T0,-.9,.6],[-6,-.8,.2],[-3.4,-.7,-.4],[-1.4,KOB_AT[0]+.05,KOB_AT[1]+.12],[T_DIVE,...KOB_AT],[T1,...KOB_AT]]},
 {name:'Toni Kroos',role:'kro',hero:true,style:KRO_ST,keys:[[T0,-22.6,6.2],[-6.5,-22.2,5.4],[-4.6,...RUN0],[-1.05,...RUN0],[-.5,...kp(-1.4)],[0,...kp(0)],[.7,...kp(.8)],[2.2,...kp(1.8)],[T1,-17.5,-2.5]]},
 ...WALL_Z.map((z,i):Actor=>({name:'Dortmund wall '+(i+1),role:'wall',idx:i,hero:i===0,style:bvb({seed:21+i,skin:i===2?SKIN_M:SKIN_L,build:{height:[1.9,1.84,1.87,1.8][i]}}),
  keys:[[T0,WALL_X+2.5,z+(i-1.5)*1.2],[-6.6,WALL_X+1.2,z+(i-1.5)*.5],[-5,WALL_X,z],[T1,WALL_X,z]]})),
 {name:'Madrid beside the ball',role:'real',style:real({seed:31,skin:SKIN_M}),keys:[[T0,-21.2,4.9],[-1.5,-21.6,5.2],[0,-21.4,5.2],[1.2,-19,4.4],[T1,-16,1]]},
 {name:'Madrid attacker 1',role:'real',style:real({seed:32,build:{height:1.86}}),keys:[[T0,-12.6,-1.8],[-2,-11.6,-1.6],[0,-11.4,-1.5],[.8,-7.5,-2.2],[2,-5,-5],[T1,-4,-12]]},
 {name:'Madrid attacker 2',role:'real',style:real({seed:33,skin:SKIN_D}),keys:[[T0,-12.4,-5.6],[-2,-11.5,-5.9],[0,-11.3,-6],[.8,-7.8,-6.4],[2,-6,-8.5],[T1,-5,-14]]},
 {name:'Madrid attacker 3',role:'real',style:real({seed:34,hair:[Y,.5]}),keys:[[T0,-12.8,-10.2],[-2,-11.8,-10],[0,-11.6,-10],[.8,-8.6,-10],[T1,-6,-17]]},
 {name:'Dortmund marker 1',role:'bvb',style:bvb({seed:41,build:{height:1.91}}),keys:[[T0,-9.8,-1.2],[-2,-9.6,-1.1],[0,-9.5,-1],[.8,-6,-1.8],[2,-4.2,-4.2],[T1,-3.4,-8]]},
 {name:'Dortmund marker 2',role:'bvb',style:bvb({seed:42,skin:SKIN_M}),keys:[[T0,-9.6,-5.2],[-2,-9.4,-5.4],[0,-9.3,-5.5],[.8,-6.4,-5.8],[2,-5,-7.5],[T1,-4.2,-11]]},
 {name:'Dortmund marker 3',role:'bvb',style:bvb({seed:43}),keys:[[T0,-10,-9.6],[-2,-9.8,-9.5],[0,-9.7,-9.5],[.8,-7.4,-9.6],[T1,-5.4,-14]]},
 {name:'Dortmund edge',role:'bvb',style:bvb({seed:44,skin:SKIN_D}),keys:[[T0,-15.5,8.6],[-2,-15.8,8.2],[0,-15.6,8.2],[1.5,-13,5],[T1,-10,0]]},
 {name:'Madrid lurking',role:'real',style:real({seed:35,skin:SKIN_M}),keys:[[T0,-18.5,-12.5],[-2,-18,-12],[0,-17.8,-12],[T1,-13,-15]]},
];
const TB1=tables(ACTORS1,T0,T1);
const KOB=0,KRO=1;
const posOf=(k:number,tau:number)=>posT(TB1,k,tau),distOf=(k:number,tau:number)=>distT(TB1,k,tau),velOf=(k:number,tau:number)=>velT(TB1,k,tau);

/** the ball: placed on the spot → the curler → the fingertips → wide, dropping behind the goal line beside the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<T_TIP)return flyA(P0,V_FK,FK_ACC,tau);
 const u=tau-T_TIP;if(u<T_OUT){const p=flyA(TIP,OUT_V,OUT_A,u);return[p[0],Math.max(BALL_R,p[1]),p[2]];}
 const w=u-T_OUT,d=Math.exp(-w*1.4);return[OUT_END[0]+1.2*(1-d),BALL_R+.35*Math.abs(Math.sin(w*6))*Math.exp(-w*3),OUT_END[2]-1.4*(1-d)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<T_TIP?tau*TAU*6:T_TIP*TAU*6+(tau-T_TIP)*TAU*2;

// ---------------------------------------------------------------- poses
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const IDLE=posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6});
function locoT(tb:Tables,k:number,tau:number):Pose{
 const v=velT(tb,k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distT(tb,k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),IDLE,.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the target (blended, so turns are continuous) */
function faceT(tb:Tables,k:number,tau:number,target:V3):number{
 const v=velT(tb,k,tau),sp=Math.hypot(v[0],v[1]),p=posT(tb,k,tau),tx=target[0]-p[0],tz=target[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
/** a free-kick wall: arms tucked, a crouch, the jump as the ball goes over (peak ≈ .25 s after the kick), the landing */
function wallPose(tau:number,i:number):Pose{
 const u=(tau+.35+i*.02)/1.1;
 return keyPoses(clamp(u),[
  [0,posed({lHipF:14,rHipF:14,lKnee:22,rKnee:22,lean:6,lShF:34,rShF:34,lShA:-6,rShA:-6,lElb:96,rElb:96,neckP:-2})],
  [.28,posed({lHipF:52,rHipF:52,lKnee:76,rKnee:76,lAnk:-14,rAnk:-14,lean:20,pitch:4,lShF:30,rShF:30,lShA:-4,rShA:-4,lElb:100,rElb:100,neckP:-10,squash:-.05})],
  [.52,posed({air:.4,lHipF:6,rHipF:8,lKnee:26,rKnee:22,lAnk:48,rAnk:48,lean:-4,pitch:-2,lShF:24,rShF:24,lShA:-2,rShA:-2,lElb:104,rElb:104,neckP:-34,squash:.04})],
  [.78,posed({lHipF:40,rHipF:40,lKnee:58,rKnee:58,lAnk:-8,rAnk:-8,lean:16,lShF:28,rShF:28,lShA:14,rShA:14,lElb:70,rElb:70,neckP:-20,squash:-.06})],
  [1,posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:8,lShA:20,rShA:20,lElb:40,rElb:40,neckP:-8})]]);
}
/** Kobel: set, bouncing on his toes (the live footage's "stays on his toes"), the dive to his right, down, up again */
const UP=posed({lHipF:40,rHipF:30,lKnee:60,rKnee:46,lean:26,pitch:6,neckP:10,lShA:30,rShA:24,lShF:30,rShF:24,lElb:50,rElb:40});
type State={pose:Pose;place:Place};
function stateOf1(k:number,tau:number):State{
 const a=ACTORS1[k],[x,z]=posOf(k,tau);let pose=locoT(TB1,k,tau),yaw=faceT(TB1,k,tau,ballAt(tau));
 switch(a.role){
  case 'kob':{
   const set=keeperSet(tau*1.6);pose=blendPose(pose,set,sm(-2.4,-1.4,tau));
   if(tau>T_DIVE-.12)pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.12,T_DIVE,tau));
   // down on the grass, then up on one knee and to his feet, eyes on the corner
   if(tau>T_DIVE+DIVE_L+.5)pose=blendPose(pose,UP,sm(T_DIVE+DIVE_L+.5,T_DIVE+DIVE_L+1.5,tau));
   if(tau>T_DIVE+DIVE_L+1.4)pose=blendPose(pose,stand(),sm(T_DIVE+DIVE_L+1.4,T_DIVE+DIVE_L+2.2,tau));
   yaw=tau<-1.4?faceT(TB1,k,tau,P0):KOB_YAW;
   if(tau>T_DIVE+DIVE_L+1)yaw=lerpAng(KOB_YAW,yawTo(-.3,-1),sm(T_DIVE+DIVE_L+1,T_DIVE+DIVE_L+2.2,tau));
   break;}
  case 'kro':{
   const w=win(tau,-.55,.9,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   if(tau<-4.6&&tau>-6.6){// bends to set the ball on the spot
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.6,.5));yaw=faceT(TB1,k,tau,P0);}
   if(tau>-4.6&&tau<-1.05){yaw=lerpAng(faceT(TB1,k,tau,[0,1,0]),YAW_K,sm(-2.6,-1.3,tau));
    // hands on hips at the end of his run-up, looking at the goal
    pose=blendPose(pose,{...pose,lShA:48*DEG,rShA:48*DEG,lElb:110*DEG,rElb:110*DEG,lShF:-12*DEG,rShF:-12*DEG,neckP:-4*DEG},win(tau,-4.2,-1.2,.4)*.9);}
   yaw=lerpAng(yaw,YAW_K,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   break;}
  case 'wall':{const i=a.idx??0;if(tau>-5)pose=blendPose(pose,wallPose(tau,i),sm(-5,-4.2,tau));yaw=faceT(TB1,k,Math.min(tau,.2),P0);if(tau>.6)yaw=lerpAng(yaw,faceT(TB1,k,tau,ballAt(tau)),sm(.6,1.2,tau));break;}
  case 'real':case 'bvb':if(tau<-.1)yaw=faceT(TB1,k,tau,P0);break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the strike, the dive, the throw). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{ripple:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2]-.05,draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.ripple)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the free kick at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play1(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number}={}){
 const figs:Fig[]=ACTORS1.map((a,k)=>{const st=stateOf1(k,tau),hero=!!a.hero;return{st,prev:hero?stateOf1(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===KRO&&tau>-.25&&tau<.35)||(k===KOB&&tau>T_DIVE+.15&&tau<T_TIP+.25))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{ripple:sm(T_TIP+.1,T_TIP+.3,tau)*Math.exp(-Math.max(0,tau-T_TIP-.3)*2)});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at1=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time (the flight a touch slowed)
const tau1=(t:number)=>key(t,mono([[0,T0+.4],[CUE(0,'Toni Kroos'),-1.3],[CUE(0,'curls it'),-.25],[CUE(0,'top corner'),.12],[CUE(0,'Gregor Kobel flies'),T_DIVE+.3],[CUE(0,'Fingertips'),T_TIP+.02],[CUE(0,'Wide'),T_TIP+.55],[SECS(0),T_TIP+2.6]]),linear);
const P1:V3=[-24,24,-72];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-26,14,24],fov:38})],
  [CUE(0,'Champions League')-.2,1.6,()=>({P:P1,T:[-12,1,1],fov:11})],
  [CUE(0,'Dortmund line up')-.3,1.2,()=>({P:P1,T:mix3([WALL_X,1,3.2],at1(KOB,tau),.35),fov:7.4})],
  [CUE(0,'Toni Kroos')-.4,1,()=>({P:P1,T:mix3(at1(KRO,tau),[-2,1,-1],.4),fov:7.8})],
  [CUE(0,'curls it')+.1,1,()=>({P:P1,T:[-3.5,1.3,-1.6],fov:5.6})],
  [CUE(0,'Wide')+.3,1.4,()=>({P:P1,T:[-2.5,1,-3.5],fov:7.2})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12);
  stadium(s,c,t,[0,1,3],{roar:sm(T_TIP,T_TIP+.4,tau)*(1-sm(T_TIP+2,T_TIP+3,tau))});
  ground(s,c);
  play1(s,c,tau,tp,{min:15,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Fingertips')+.2;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind Kroos, down the ball's flight
const tau2=(t:number)=>key(t,mono([[0,-1.3],[CUE(1,'stays on'),-.28],[CUE(1,'One quick step'),T_DIVE+.1],[CUE(1,'big push'),T_DIVE+.3],[CUE(1,'fingertips'),T_TIP-.02],[CUE(1,'past the post'),T_TIP+.3],[SECS(1)-.2,T_TIP+1.05]]),linear);
const E2:V3=[-29.5,2.7,5.4];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,T_TIP+.3)),kob=at1(KOB,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-10,1.4,1.2],fov:24})],
  [CUE(1,'stays on')-.4,1,()=>({P:E2,T:mix3([-1,1.3,-.8],b,.25),fov:13})],
  [CUE(1,'One quick step')-.3,1,()=>({P:add3(E2,[0,.2,0]),T:mix3(kob,[-.6,1.6,-2.4],.5),fov:8.6})],
  [CUE(1,'fingertips')-.5,.6,()=>({P:add3(E2,[0,.25,0]),T:[TIP[0],TIP[1]-.35,TIP[2]+.7],fov:7.2})],
  [CUE(1,'past the post')+.1,1.1,()=>({P:add3(E2,[0,.3,0]),T:[.2,1.1,-3.6],fov:10})],
 ]);
}
/** the replay trail: the curler's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,T_TIP+.3);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_TIP)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(T_TIP,T_TIP+.4,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(T_TIP+.5,T_TIP+.9,tau));
  const r=play1(s,c,tau,tp,{smear:true,min:10});
  // the touch: a spark at his fingertips
  const hit=(tau-T_TIP+.02)/.2;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'fingertips')+.1;},
};

// ================================================================ PLAY 2 (the lesson, an illustration): catch → look up → throw (λ seconds; λ = 0 the catch)
/** the Madrid cross from their right wing (+z) */
const CR:V3=[-15.5,BALL_R,23.5],T_CR=-1.25;
/** the catch: up and out at KC, hands together over his head at λ = 0 (catch clock: take-off .25, catch .5, ball to the chest .75) */
const KC:[number,number]=[-3.4,1.6],CATCH_L=1.1,CATCH_U=.5,T_JUMP=-CATCH_U*CATCH_L;
const CATCH_YAW=yawTo(CR[0]-KC[0],CR[2]-KC[1]);
function catchPose(u:number):Pose{return keyPoses(clamp(u),[
 [0,posed({lHipF:30,rHipF:26,lKnee:46,rKnee:40,lean:16,pitch:4,lShF:40,rShF:40,lShA:26,rShA:26,lElb:60,rElb:60,lHand:1,rHand:1,neckP:-16})],
 [.25,posed({lHipF:78,lKnee:96,lAnk:30,rHipF:2,rKnee:14,rAnk:44,air:.12,lean:0,pitch:-2,lShF:150,rShF:150,lShA:22,rShA:22,lElb:30,rElb:30,lHand:1,rHand:1,neckP:-40})],
 [CATCH_U,posed({lHipF:84,lKnee:104,lAnk:36,rHipF:-4,rKnee:26,rAnk:46,air:.62,lean:-6,pitch:-4,lShF:172,rShF:172,lShA:16,rShA:16,lElb:14,rElb:14,lHand:1,rHand:1,neckP:-50,squash:.04})],
 [.75,posed({lHipF:40,lKnee:58,rHipF:20,rKnee:40,air:.12,lean:16,pitch:2,lShF:70,rShF:70,lShA:14,rShA:14,lElb:118,rElb:118,lShR:30,rShR:30,lHand:.8,rHand:.8,neckP:20})],
 [1,posed({lHipF:22,rHipF:20,lKnee:30,rKnee:28,lean:12,pitch:3,lShF:44,rShF:44,lShA:14,rShA:14,lElb:124,rElb:124,lShR:34,rShR:34,lHand:.7,rHand:.7,neckP:14})]]);}
/** holding the ball at the chest (the end of the catch), ready */
const HOLD=catchPose(1);
/** the overarm throw (right arm): wind-up, release at THROW_U, follow-through */
const THROW_L=1.0,THROW_U=.55;
function throwPose(u:number):Pose{return keyPoses(clamp(u),[
 [0,HOLD],
 [.35,posed({lHipF:34,lKnee:18,rHipF:-14,rKnee:30,lean:-8,pitch:0,twist:-38,yaw:-10,lShF:84,lShA:20,lElb:14,rShF:-34,rShA:72,rElb:92,rShR:40,lHand:1,rHand:.7,neckP:-8,neckY:18})],
 [THROW_U,posed({lHipF:26,lKnee:30,rHipF:-26,rKnee:44,rAnk:30,lean:8,pitch:2,twist:24,yaw:8,lShF:10,lShA:40,lElb:50,rShF:176,rShA:14,rElb:6,rShR:0,lHand:.8,rHand:1,neckP:-4,squash:.05})],
 [.8,posed({lHipF:22,lKnee:34,rHipF:-40,rKnee:70,rAnk:40,lean:32,pitch:8,twist:30,yaw:12,lShF:-10,lShA:30,lElb:50,rShF:60,rShA:10,rElb:36,lHand:.6,rHand:.8,neckP:14})],
 [1,posed({lHipF:14,rHipF:16,lKnee:22,rKnee:26,lean:10,lShA:22,rShA:22,lElb:40,rElb:40,neckP:0})]]);}
/** the free teammate: Dortmund's right-back (−z, their right as they face −x), wide and unmarked */
const REC:[number,number]=[-19.5,-27.2];
const L_LOOK=.65,L_TURN=1.75,T_THROW=2.15,T_REL=T_THROW+THROW_U*THROW_L,T_REC=T_REL+1.3;
const THROW_YAW_AT:[number,number]=[KC[0]+.35,KC[1]-.35];
const THROW_YAW=yawTo(REC[0]-THROW_YAW_AT[0],REC[1]-THROW_YAW_AT[1]);
const L0=-3,L1=7;
const ACTORS2:Actor[]=[
 {name:'Gregor Kobel',role:'catch',hero:true,style:KOB_ST,keys:[[L0,-1.3,.9],[-1.3,-1.4,1.1],[T_JUMP-.1,...KC],[L_TURN,...KC],[T_THROW,...THROW_YAW_AT],[L1,...THROW_YAW_AT]]},
 {name:'Dortmund right-back (free)',role:'rb',hero:true,style:bvb({seed:52,hair:[Y,.55],build:{height:1.83}}),keys:[[L0,-13.5,-19.5],[-.4,-14,-20.5],[1.2,-17.5,-25.5],[T_REL,-19,-27],[T_REC,...REC],[T_REC+.5,-22,-27.4],[L1,-37,-28.5]]},
 {name:'Madrid winger (the cross)',role:'wing',hero:true,style:real({seed:61,skin:SKIN_D}),keys:[[L0,-21,25],[-2.1,-17.4,24.2],[T_CR,CR[0]-.5,CR[2]+.2],[0,-14.5,22.6],[L1,-19.6,20.6]]},
 {name:'Dortmund left-back',role:'bvb',style:bvb({seed:53}),keys:[[L0,-14.5,19],[T_CR,-14.8,20.8],[1,-14.4,21.2],[L1,-18.8,19.4]]},
 {name:'Dortmund centre-back 1',role:'bvb',style:bvb({seed:54,build:{height:1.91}}),keys:[[L0,-8.2,-2.6],[0,-6.6,-.6],[2,-9,-3],[L1,-15,-6]]},
 {name:'Madrid striker 1',role:'real',style:real({seed:62,build:{height:1.86}}),keys:[[L0,-8.9,-1.6],[0,-7.3,-.1],[2,-9.8,-2.4],[L1,-16,-5.2]]},
 {name:'Dortmund centre-back 2',role:'bvb',style:bvb({seed:55,skin:SKIN_M}),keys:[[L0,-8.8,4.6],[0,-7.4,3.6],[2,-9.8,4.2],[L1,-15.5,6]]},
 {name:'Madrid striker 2',role:'real',style:real({seed:63,skin:SKIN_M}),keys:[[L0,-9.6,5.6],[0,-8.2,4.5],[2,-10.6,5.2],[L1,-16.4,7]]},
 {name:'Dortmund midfielder',role:'bvb',style:bvb({seed:56,skin:SKIN_D}),keys:[[L0,-20,2],[0,-19,1.4],[2,-21,.4],[L1,-27,-1]]},
 {name:'Madrid midfielder',role:'real',style:real({seed:64,hair:[Y,.6]}),keys:[[L0,-21.2,3.2],[0,-20.3,2.4],[2,-22.2,1.4],[L1,-28.2,.2]]},
];
const TB2=tables(ACTORS2,L0,L1);
const GK2=0,RB=1,WING=2;
/** Dortmund teammates who are marked (a Madrid player close) vs the free one — the lesson's rings */
const MARKED=[3,4,6,8],FREE=RB;
const pos2=(k:number,l:number)=>posT(TB2,k,l);
/** Kobel's state in the lesson: in goal, the step out and the jump catch, the look (left, then right), the turn, the throw */
function kobState2(l:number):State{
 const[x,z]=pos2(GK2,l);let pose=locoT(TB2,GK2,l),yaw=faceT(TB2,GK2,l,CR);
 if(l<T_JUMP-.2)pose=blendPose(pose,keeperSet(l*1.5),.6*(1-sm(-1.6,-1.2,l)));
 if(l>T_JUMP-.25){pose=blendPose(pose,catchPose((l-T_JUMP)/CATCH_L),sm(T_JUMP-.25,T_JUMP,l));yaw=lerpAng(yaw,CATCH_YAW,sm(T_JUMP-.4,T_JUMP,l));}
 if(l>T_JUMP+CATCH_L){pose={...HOLD};
  // the look: head up and round to his left (+z), then to his right (−z) — and the free right-back
  const a=sm(L_LOOK-.1,L_LOOK+.35,l)*(1-sm(L_LOOK+.55,L_LOOK+.8,l)),b=sm(L_LOOK+.6,L_LOOK+.95,l);
  pose.neckY=(58*a-62*b*(1-sm(L_TURN+.1,T_THROW,l)))*DEG;pose.twist=(14*a-16*b*(1-sm(L_TURN+.1,T_THROW,l)))*DEG;pose.neckP=(14-18*Math.max(a,b))*DEG;
  yaw=lerpAng(lerpAng(CATCH_YAW,Math.PI,sm(0,L_LOOK,l)),THROW_YAW,sm(L_TURN,T_THROW,l));
  if(l>L_TURN-.05&&l<T_THROW+.1){const st=runCycle(distT(TB2,GK2,l)/1.6,{speed:.15});pose=blendPose(pose,{...st,lShF:pose.lShF,rShF:pose.rShF,lElb:pose.lElb,rElb:pose.rElb,lShA:pose.lShA,rShA:pose.rShA,lShR:pose.lShR,rShR:pose.rShR,lHand:pose.lHand,rHand:pose.rHand},.5*win(l,L_TURN-.05,T_THROW+.1,.15));}
  if(l>T_THROW-.1)pose=blendPose(pose,throwPose((l-T_THROW)/THROW_L),sm(T_THROW-.1,T_THROW,l));}
 return{pose:clampPose(pose),place:{x,z,yaw}};
}
function stateOf2(k:number,l:number):State{
 if(k===GK2)return kobState2(l);
 const a=ACTORS2[k],[x,z]=pos2(k,l);let pose=locoT(TB2,k,l),yaw=faceT(TB2,k,l,ballAt2(l));
 if(a.role==='wing'){const w=win(l,T_CR-.55,T_CR+.5,.2);if(w>0){pose=blendPose(pose,strike(clamp((l-T_CR)/1.0+STRIKE_CONTACT),{foot:'r',power:.8}),w);yaw=WING_YAW;}}
 if(a.role==='rb'&&l>T_REC-.1&&l<T_REC+.5){// the first touch, forward, then away up the line
  const run=runCycle(distT(TB2,k,l)/3,{speed:.6});pose=blendPose(pose,{...run,rHipF:40*DEG,rKnee:30*DEG,neckP:30*DEG},win(l,T_REC-.1,T_REC+.5,.2)*.6);}
 return{pose,place:{x,z,yaw}};
}
/** the winger's cross (right foot) along its launch direction */
const CATCH_PT:V3=(()=>{const sk=solve(catchPose(CATCH_U),B_KOB,{x:KC[0],z:KC[1],yaw:CATCH_YAW});return[(sk.lHa[0]+sk.rHa[0])/2+(sk.face[0]-sk.head[0])*.6,(sk.lHa[1]+sk.rHa[1])/2+.06,(sk.lHa[2]+sk.rHa[2])/2+(sk.face[2]-sk.head[2])*.6];})();
const G3:V3=[0,-GRAV,0];
const V_CR=launch(CR,CATCH_PT,-T_CR,G3);
const WING_YAW=yawTo(V_CR[0],V_CR[2]);
/** the throw: from his right hand at release to the right-back's feet */
const REL_PT:V3=(()=>{const sk=solve(throwPose(THROW_U),B_KOB,{x:THROW_YAW_AT[0],z:THROW_YAW_AT[1],yaw:THROW_YAW});return sk.rHa;})();
const REC_PT:V3=[REC[0]-.3,BALL_R+.05,REC[1]-.1];
const V_TH=launch(REL_PT,REC_PT,T_REC-T_REL,G3);
/** the ball in the lesson: at the winger's feet → the cross → in Kobel's gloves (held at his chest) → the throw → the right-back's run */
function ballAt2(l:number):V3{
 if(l<=T_CR){const[x,z]=pos2(WING,l);return l<T_CR-.6?[x+.5,BALL_R,z-.3]:CR;}
 if(l<0)return flyA(CR,V_CR,G3,l-T_CR);
 if(l<T_REL){const st=kobState2(l),sk=solve(st.pose,B_KOB,st.place);if(l>T_THROW+.2)return sk.rHa;const m=mix3(sk.lHa,sk.rHa,.5),f=sub3(sk.face,sk.head);return[m[0]+f[0]*.6,m[1]+.06,m[2]+f[2]*.6];}
 if(l<T_REC)return flyA(REL_PT,V_TH,G3,l-T_REL);
 const[x,z]=pos2(RB,l),v=velT(TB2,RB,l),sp=Math.hypot(v[0],v[1])||1,w=.45+.35*Math.max(0,Math.sin((l-T_REC)*9));return[x+v[0]/sp*w,BALL_R,z+v[1]/sp*w];
}

// ---------------------------------------------------------------- 3 · the lesson: from high behind Dortmund's goal, with teaching marks
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a bold ring on the grass (navy edge, paper knockout, ink) */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rad:number,ink:string,a:number){
 if(a<=.01)return;const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[x+Math.cos(u)*rad,.02,z+Math.sin(u)*rad]),q=pr(c,[x+Math.cos(u)*rad*.72,.02,z+Math.sin(u)*rad*.72]);if(p)out.push(p);if(q)inn.push(q);}
 if(out.length<10||inn.length<10)return;const p=polyPath(out,true);p.addPath(polyPath(inn.reverse(),true));
 s.stroke(K,p,5,.9*a);s.knockout(p,a);s.fill(ink,p,.95*a);
}
const lam3=(t:number)=>key(t,mono([[0,-2.1],[CUE(2,'catches it')-.6,-.35],[CUE(2,'catches it')+.25,.1],[CUE(2,'looks up'),L_LOOK-.05],[CUE(2,'Who is free')+.2,L_LOOK+1],[CUE(2,'throws it out')-.2,T_THROW],[CUE(2,'throws it out')+.9,T_REL+.5],[CUE(2,'Dortmund are away')+.4,T_REC+.3],[SECS(2),L1-.2]]),linear);
const LP:V3=[10,10,2];
function cam3v(t:number):Cam{
 const l=lam3(t),rb=pos2(RB,l),kb=pos2(GK2,l);
 return plan(t,[
  [0,0,()=>({P:add3(LP,[0,3,2]),T:[-9,1,13],fov:34})],
  [CUE(2,'catches it')-.6,.9,()=>({P:LP,T:[kb[0]-.4,1.6,kb[1]],fov:9.5})],
  [CUE(2,'Who is free')-.3,1.2,()=>({P:add3(LP,[2,4,2]),T:[-11,0,-6],fov:40})],
  [CUE(2,'throws it out')+.3,1.4,()=>({P:add3(LP,[2,4,0]),T:[-11,.5,-12],fov:38})],
  [CUE(2,'Dortmund are away')-.1,1.6,()=>({P:add3(LP,[0,2,-8]),T:[rb[0]-4,0,rb[1]+2],fov:15})],
  [CUE(2,'After a save')-.2,1.4,()=>({P:add3(LP,[2,4,0]),T:[-12,0,-12],fov:38})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),l=lam3(tt),lp=lam3(tt-1/12);
  const q0=CUE(2,'This is how'),q1=CUE(2,'catches it'),q2=CUE(2,'looks up'),q3=CUE(2,'Who is free'),q4=CUE(2,'throws it out'),q5=CUE(2,'Dortmund are away'),q6=CUE(2,'After a save'),q7=CUE(2,'free teammate');
  stadium(s,c,t,[0,2,3],{roar:.3*sm(q5,q5+.6,t)});
  ground(s,c);
  const kp2=pos2(GK2,l),rb=pos2(RB,l);
  // "This is how Kobel …": a yellow ring under him; it comes back for "After a save"
  groundRing(s,c,kp2[0],kp2[1],1.3*easeOutBack(clamp((t-q0+.1)/.45)),Y,sm(q0-.1,q0+.2,t)*(1-sm(q3-.2,q3+.2,t))+sm(q6-.1,q6+.3,t));
  // "Who is free?": red rings under the marked teammates (a Madrid player right beside each), then the big yellow ring on the free one
  MARKED.forEach((k,i)=>{const a=sm(q3+.1+i*.14,q3+.4+i*.14,t)*(1-sm(q5-.2,q5+.3,t));if(a>.01){const p=pos2(k,l);groundRing(s,c,p[0],p[1],1.25*easeOutBack(a),R,a);}});
  const fr=sm(q3+.8,q3+1.2,t)*(1-sm(q5+1.5,q5+2,t))+sm(q7-.1,q7+.3,t);
  groundRing(s,c,rb[0],rb[1],2*easeOutBack(clamp(fr)),Y,clamp(fr));
  // "throws it out": the throw's arc as a dashed yellow ribbon (drawn ahead of the ball, then the ball follows it)
  const arc=sm(q4-.4,q4+.1,t)*(1-sm(q6-.3,q6+.2,t));
  if(arc>.01){const pts:Pt[]=[];for(let i=0;i<=20;i++){const p=pr(c,flyA(REL_PT,V_TH,G3,(T_REC-T_REL)*i/20));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.62)/10,(i+.98)/10]);const d=ribbon(pts,Math.max(8,kAt(c,REL_PT)*.08),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.85*arc);s.fill(Y,d,.95*arc);}}
  const figs:Fig[]=ACTORS2.map((a,k)=>{const st=stateOf2(k,l),hero=!!a.hero;return{st,prev:hero?stateOf2(k,lp):undefined,style:a.style,hero,smear:k===GK2&&l>T_THROW+.2&&l<T_REL+.2};});
  const r=drawScene(s,c,figs,{P:ballAt2(l),rot:l*6,min:10},{ripple:0});
  // "catches it": a spark in his gloves
  const ct=(l+.02)/.35;if(ct>0&&ct<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*5),{n:9,seed:23,g:easeOutBack(clamp(ct*2))*(1-clamp((ct-.5)*2)),width:10});
  // "looks up fast": look arcs round his head, both ways
  const lk=sm(q2-.1,q2+.35,t,easeOutBack)*(1-sm(q4-.4,q4,t));
  if(lk>.01){const st=kobState2(l),sk=solve(st.pose,B_KOB,st.place),h=pr(c,add3(sk.head,[0,.35,0]));if(h){const k=kAt(c,sk.head),p=new Path2D(),arcP=(a0:number,a1:number)=>{const pts:Pt[]=[];for(let i=0;i<=10;i++){const a=a0+(a1-a0)*i/10;pts.push([h[0]+Math.cos(a)*1.1*k*lk,h[1]+Math.sin(a)*.6*k*lk]);}return pts;};
    p.addPath(ribbon(arcP(Math.PI+.35,Math.PI*1.5-.2),Math.max(8,.18*k),{seed:31,taper:.3}));p.addPath(ribbon(arcP(Math.PI*1.5+.2,TAU-.35),Math.max(8,.18*k),{seed:32,taper:.3}));s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}}
  // "Dortmund are away": a big yellow arrow up the line ahead of the right-back
  const aw=sm(q5-.1,q5+.8,t,easeInOutSine)*(1-sm(q7+.8,q7+1.4,t));
  if(aw>.01){const pts:V3[]=[];for(let i=0;i<=6;i++)pts.push([rb[0]-1.5-14*aw*i/6,.05,rb[1]+.3]);arrow3(s,c,pts,Math.max(10,kAt(c,[rb[0],0,rb[1]])*.5),Y,.95*aw);}
  // "free teammate": a stamp over the free right-back
  const stp=sm(q7+.1,q7+.5,t,easeOutBack);if(stp>.01){const bp=pr(c,[rb[0],2.6,rb[1]]);if(bp)sparkBurst(s,Y,bp[0],bp[1],Math.max(60,kAt(c,[rb[0],2.6,rb[1]])*1.4),{n:10,seed:61,g:clamp(stp),width:12});}
 },
 get still(){return CUE(2,'Who is free')+1.3;},
};

const film:RisoStory={
 id:'kobel-signature',format:'11v11',title:'Kobel: the keeper who starts attacks',
 theme:'After a save, look up fast and pass to a free teammate to start an attack',
 ageNote:'Borussia Dortmund 0–2 Real Madrid, Champions League final, Wembley, 1 June 2024 (49th minute: the save). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a ball curls in and a glove-yellow spark tips it away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-200*(1-u):x+80*easeOut(out),by=age<.3?y+70*(1-u)*(1-u)-40*(1-u):y-150*easeOut(out);
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Dortmund's goal line x = 0, +z = Madrid's right) — checked by tests/play-film-kobel-signature.cjs. */
const bodyOf=(st:State,b:Build)=>{const sk=solve(st.pose,b,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis,head:sk.head,rToe:sk.rToe,rHeel:sk.rHeel,lToe:sk.lToe,lHeel:sk.lHeel};};
export const FACTS={P0,TIP,T_TIP,T_DIVE,KOB_AT,WALL_X,WALL_Z,diveHand:DIVE_SOL.hand,ballAt,
 kroos:(tau:number)=>bodyOf(stateOf1(KRO,tau),B_KRO),
 kobel:(tau:number)=>bodyOf(stateOf1(KOB,tau),B_KOB),
 wallHead:(i:number,tau:number)=>{const k=2+i,st=stateOf1(k,tau),sk=solve(st.pose,ACTORS1[k].style.build,st.place);return sk.head;},
 lesson:{CR,CATCH_PT,REL_PT,REC_PT,T_CR,T_REL,T_REC,T_THROW,L_LOOK,FREE,MARKED,ballAt2,
  pos:(k:number,l:number)=>pos2(k,l),kobel:(l:number)=>bodyOf(kobState2(l),B_KOB),neckY:(l:number)=>kobState2(l).pose.neckY,
  team:(k:number)=>ACTORS2[k].style.shirt==='paper'?'real':'bvb'}};
