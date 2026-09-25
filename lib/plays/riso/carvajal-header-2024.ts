/** Dani Carvajal's near-post header — Borussia Dortmund 0–2 Real Madrid, UEFA Champions League final, Saturday 1 June 2024, Wembley
 * Stadium, London. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx)
 * or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as a
 * riso print.
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2024 UEFA Champions League final" (raw wikitext; its summary cites Sporting News and The Guardian's minute-by-minute; its
 *    line-ups and kit boxes cite UEFA's line-ups): 1 June 2024, 20:00 BST kick-off, Wembley, 86,212, referee Slavko Vinčić; "Carvajal gave
 *    Madrid the lead in the 74th minute, heading in Kroos' corner from the left"; earlier (49') "Toni Kroos whipped in a free kick ... with
 *    Carvajal sending his header over the bar"; kits: Dortmund yellow shirts (F7E503), black shorts, yellow socks; Real Madrid all white;
 *    numbers Carvajal 2, Kroos 8, Füllkrug 14, Kobel 1; Kroos's last club match; Carvajal man of the match; Madrid's 15th title.
 *    https://en.wikipedia.org/wiki/2024_UEFA_Champions_League_final
 *  - The Guardian, Scott Murray, "Borussia Dortmund 0–2 Real Madrid: Champions League final 2024 – as it happened", 1 June 2024: "GOAL!
 *    ... (Carvajal 74) Kroos whips the corner from the left to Carvajal, who rises on the left-hand corner of the six-yard box and flicks a
 *    power header across Kobel and into the top right! Unstoppable"; the corner came after Maatsen "shanks a clearance out for another corner
 *    on the left"; "Carvajal wheels away in celebration" (photo caption); "The Yellow Wall is making one hell of a noise".
 *    https://www.theguardian.com/football/live/2024/jun/01/borussia-dortmund-v-real-madrid-champions-league-final-2024-live
 *  - The Guardian, David Hytner, match report, 1 June 2024: "It was Dani Carvajal who scored the crucial first goal, getting in front of
 *    Niclas Füllkrug to flick home a Toni Kroos corner." https://www.theguardian.com/football/article/2024/jun/01/real-madrid-dortmund-champions-league-final-match-report
 *  - UEFA.com, Mark Pettit, "Real Madrid win Champions League: Carvajal and Vinícius Júnior see off Dortmund", 1 June 2024 (via
 *    web.archive.org): "74': Carvajal heads in Kroos corner"; "Carvajal ... rose highest to head in Kroos's corner"; Carvajal: "I'd been
 *    coming up for corners most of the season ... I'd headed one over and I just knew I had to score the second one!"; UEFA technical
 *    observers: "showing belief and anticipation when he scored".
 *  - Wikipedia, "Dani Carvajal" (height 1.73 m); "Toni Kroos" (height 1.83 m).
 * CONFIRMED: the date, Wembley, 0–0 until the 74th minute; Kroos's corner FROM THE LEFT; Carvajal (1.73 m, No. 2, the right-back) got in
 *  FRONT OF Füllkrug, rose at the (near-post) left-hand corner of the six-yard box and flicked / glanced a header ACROSS Kobel into the far
 *  (right-hand) top of the net; unstoppable; he wheeled away; Vinícius made it 2–0 (83'); Madrid's 15th European Cup; kits as above.
 * INFERRED (illustrative reconstruction, never named in the narration): every position, run and timing in metres and seconds (the corner ≈
 *  27 m in ≈ 1.35 s, a whipped in-swinger off Kroos's RIGHT foot — his stronger foot, not verified in the footage; Carvajal starting just
 *  beside Füllkrug and darting ≈ 5 m across in front of him; the contact point ≈ 5.3 m out, 8 m left of centre; the header ≈ .55 s to the
 *  line); Füllkrug's 1.89 m (not in the fetched sources); where the other players stood (drawn unnamed, without numbers); Kobel's keeper
 *  kit (printed red) and his late dive; which end and which touchline (drawn: the main camera on Madrid's LEFT, so the corner is the near
 *  one, and the arch over the far stand); the kit trims and number colours; hair; the dusk sky (sunset in London is ≈ 21:10 on 1 June);
 *  the crowd's colours; Carvajal's celebration run toward the corner flag; every camera placement and lens.
 *
 * FRAMING (the TV broadcast, never top-down; kept distinct from the Ramos, Drogba and Puyol corner films, which all use a far-side corner,
 * a low near-post replay and a high behind-the-goal replay): ch1 = the high main-stand camera in REAL TIME, the corner on the NEAR touchline
 * (Wembley and the arch → the box → close on Kroos at the flag below us → the whipped corner → the flick → Carvajal wheels away toward us);
 * ch2 = the slow-motion replay from LOW BEHIND KROOS at the corner flag, looking down the ball's flight into the near post (Carvajal beside
 * the tall striker, the dart across in front of him, the leap), a riso replay trail; ch3 = a second replay, LOW ON THE GOAL LINE BESIDE THE
 * FAR POST: the glance comes across Kobel's late dive straight at the camera into the far top corner, then Carvajal wheels away; ch4 = the
 * lesson from behind the penalty spot: a near-post zone, lit footprints of the run in front, the take-off spark, the glance (a small angle:
 * in-arrow, out-arrow) and two height marks, the shorter player's jump beating the taller one's reach. Composed on the FULL sheet (world
 * units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square (a narrower window
 * widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hair and hems, motionSmear on the corner, the header, the dive). Handedness: the world is right-handed (x toward
 * Dortmund's goal, y up, +z = Madrid's right), exactly athlete.ts's convention, so Kroos's strike({foot:'r'}) is his RIGHT foot and the corner
 * from Madrid's LEFT is the −z corner; the near post is z = −3.66. Carvajal meets it facing out toward the corner, and the flick is a turn of
 * the head and shoulders to his RIGHT (toward the goal), so the ball glances off and on across the goal. Kobel faces −x, so his dive to his
 * LEFT (keeperDive side 'l') goes to +z. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded
 * word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small figures print at 'low', at most 4 non-hero figures at
 * full detail, every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Wembley, 2024',text:'Wembley, 2024, the Champions League final. Still nil–nil. Toni Kroos whips in a corner... Dani Carvajal flicks it in! Real Madrid lead!',tail:2.4,
  cues:['Wembley','Champions League final','nil–nil','Toni Kroos','whips in','Dani Carvajal','flicks it in','Real Madrid lead']},
 {label:'Watch it again',text:'Watch again, slowly. Carvajal is shorter than the striker beside him. He darts to the near post, gets in front, and jumps first.',tail:1.6,
  cues:['Watch again','shorter','striker','darts','gets in front','jumps first']},
 {label:'The glance',text:'From beside the goal, see him glance it. It flies across the keeper, into the far corner! Real Madrid win their fifteenth European Cup!',tail:2.2,
  cues:['From beside','glance','across the keeper','far corner','fifteenth']},
 {label:'Attack the near post',text:'Attack the near post! Get there first, time your jump, and glance it on. Small players can win headers too!',tail:2,
  cues:['Attack the near post','Get there first','time your jump','glance it on','Small players']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/carvajal-header-2024/timing.json, add
 *   import timingJson from '../../../public/plays/narration/carvajal-header-2024/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/carvajal-header-2024/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('carvajal: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('carvajal: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const DEG=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
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
/** Pitch: Dortmund's goal line is x = 0 (Madrid attack +x), goal centre z = 0, +z = Madrid's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- Wembley at dusk: three tiers of red seats, the roof ring's lights, the arch
const CX=-52.5;
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z, under the arch), 1 behind Dortmund's goal (+x), 2 the main stand (−z,
 * the camera side, the corner below it), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122,17,a),1.2+40*b,43+40*b],
 (a,b)=>[9+38*b,1.2+40*b,lerp(62,-62,a)],
 (a,b)=>[lerp(17,-122,a),1.2+36*b,-43-36*b],
 (a,b)=>[-114-38*b,1.2+40*b,lerp(-62,62,a)],
];
const STAND_COLS=[110,76,110,76],STAND_ROWS=18;
/** the dark fascias between Wembley's three tiers (b ranges up the rake) */
const FASCIA:[number,number][]=[[.3,.36],[.6,.66]];
/** the arch: a 315 m span rising 133 m, leaning back over the far stand (side inferred) */
const ARCH:V3[]=Array.from({length:33},(_,i)=>{const u=i/32,y=133*(1-Math.pow(2*u-1,2));return[CX+(u-.5)*315,y,80+y*Math.tan(22*DEG)];});
/** crowd colour weights per stand: [paper (Madrid white), yellow (Dortmund, the Yellow Wall), navy (Dortmund black), red (seats, scarves)] */
const CROWD_MIX:[number,number,number,number][]=[[.42,.34,.14,.1],[.3,.46,.16,.08],[.42,.34,.14,.1],[.5,.28,.12,.1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a June dusk over London (≈ 21:15, just after sunset): deep blue sky, a paler glow low down over the roof
 s.field(K,.72,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(B,polyPath([[-1e4,hz[1]-1100],[1e4,hz[1]-1100],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);s.tone(R,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.1);}
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
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
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
/** Dortmund's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (y by, z bz) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
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
const B_CAR:Build={height:1.73,bulk:.95,thighs:1.04},B_KRO:Build={height:1.83,bulk:.96},B_FUL:Build={height:1.89,bulk:1.06},B_KOB:Build={height:1.94,bulk:1};
const CAR_ST=real({number:2,hair:[K,.95],skin:SKIN_M,build:B_CAR,seed:2});
const KRO_ST=real({number:8,hair:[Y,.7],build:B_KRO,seed:8});
const FUL_ST=bvb({number:14,hair:[K,.85],build:B_FUL,seed:14});
const KOB_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_KOB,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Kroos's corner)
const BALL_R=.11,GRAV=9.81;
/** the corner flies TF s to Carvajal's head; his glance reaches the goal line TG */
const TF=1.35,TG=TF+.55;
/** Carvajal's header spot (his pelvis) at the left-hand (near-post) corner of the six-yard box. He meets the ball facing out toward the
 * corner, turned a little toward the goal line, so the goal is over his RIGHT shoulder. */
const HP:[number,number]=[-5.3,-8.05],FACE:[number,number]=nrm2(.55,-.83),YAW_H=yawTo(FACE[0],FACE[1]);
/** Carvajal's header: header() with a running spring, the head and shoulders turning to his RIGHT (a glance, not a nod down) */
function carHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.15;const w=Math.sin(Math.PI*clamp((u-.3)/.42)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(.12,-.5,sn)*w;p.twist+=lerp(.06,-.2,sn)*w;p.neckP-=.35*w;p.bend-=.1*w;return p;}
/** contact on the header clock: mid-turn, eyes on the ball */
const CU=.47,HD=1.0,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(carHeader(CU),B_CAR,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.03,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the quadrant at the −z corner flag, Madrid's left) */
const P0:V3=[-.45,BALL_R,-33.55];
/** a right-footer's in-swinger from the left: a steady sideways pull TOWARD the goal line (+x) on top of gravity */
const SWING:V3=[2.2,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Kroos strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_K=yawTo(DC[0],DC[1]);
/** where Kroos's pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_KRO,{x:0,z:0,yaw:YAW_K});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** the run-up: from behind the ball and to its left (a right-footer's angle) */
const LEFT_K:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCK[0]-DC[0]*3.2+LEFT_K[0]*1.5,PCK[1]-DC[1]*3.2+LEFT_K[1]*1.5];
/** where the glance crosses the goal line: high on the FAR side (+z, the top right as the Guardian saw it), past Kobel's late dive */
const GOAL_PT:V3=[0,1.95,2.6],NET_HIT:V3=[1.6,1.55,2.95],REST:V3=[1.2,BALL_R,2.7];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='car'|'kro'|'gk'|'ful'|'real'|'bvb';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=12,DT=.02;
const kp=(u:number):[number,number]=>[PCK[0]+DC[0]*u,PCK[1]+DC[1]*u];
/** after the goal the Madrid players chase Carvajal toward the near corner flag */
const toFlag=(x:number,z:number,k:number):number[][]=>[[TG+.5+k*.2,x,z],[TG+4+k*.3,lerp(x,-4,.6),lerp(z,-24,.6)],[T1,lerp(x,-3,.8),lerp(z,-28,.85)]];
const ACTORS:Actor[]=[
 {name:'Dani Carvajal',role:'car',hero:true,style:CAR_ST,keys:[[T0,-9.8,-4],[-6,-9.5,-4.4],[-2.4,-9.3,-4.6],[-1.3,-9.3,-4.7],[-.3,-9,-5.1],[TJ-.28,HP[0],HP[1]],[TF+.45,HP[0],HP[1]],[TF+1.3,-6.2,-12.5],[TF+3.4,-4.8,-20],[TF+6.2,-3,-29],[T1,-2.4,-31]]},
 {name:'Toni Kroos',role:'kro',hero:true,style:KRO_ST,keys:[[T0,.4,-36.2],[-6.4,0,-35.2],[-5.2,...kp(-.7)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...kp(-1.6)],[0,...kp(0)],[.7,...kp(.9)],[3,...kp(3.2)],[T1,-3.4,-27]]},
 {name:'Gregor Kobel',role:'gk',hero:true,style:KOB_ST,keys:[[T0,-.6,-1.2],[-2,-.7,-1.8],[0,-.8,-2.2],[TF-.4,-.9,-2.4],[TF,-.95,-2.3],[T1,-.9,-2.1]]},
 {name:'Niclas Füllkrug (beaten)',role:'ful',hero:true,style:FUL_ST,keys:[[T0,-8.4,-3.3],[-6,-8.1,-3.6],[-2.4,-7.9,-3.9],[-.3,-7.8,-4.1],[TF-.7,-6.9,-6.3],[TF,-6.4,-7.2],[TF+.5,-6.2,-7.3],[T1,-5.6,-6.4]]},
 {name:'Dortmund near post',role:'bvb',style:bvb({skin:SKIN_M,seed:41}),keys:[[T0,-.8,-4.3],[0,-.7,-4.2],[TF,-.9,-3.9],[T1,-1.2,-3.2]]},
 {name:'Dortmund six-yard 1',role:'bvb',style:bvb({build:{height:1.91},seed:42}),keys:[[T0,-4.3,-3.2],[-2,-4.5,-3.5],[0,-4.6,-3.6],[TF,-4.9,-3.9],[T1,-4.4,-3]]},
 {name:'Dortmund six-yard 2',role:'bvb',style:bvb({build:{height:1.9},seed:43}),keys:[[T0,-4.6,.6],[-2,-4.8,.2],[0,-5,0],[TF,-5.4,-.6],[T1,-5,-.2]]},
 {name:'Dortmund marker',role:'bvb',style:bvb({skin:SKIN_D,seed:44}),keys:[[T0,-9.6,.8],[-2,-9.3,.4],[0,-9.1,.2],[TF,-8.3,-.6],[T1,-7.6,-.8]]},
 {name:'Dortmund zone',role:'bvb',style:bvb({build:{height:1.8},seed:45}),keys:[[T0,-10.2,-9.2],[-2,-10.4,-9.4],[0,-10.5,-9.6],[TF,-9.8,-9.4],[T1,-9.2,-8.8]]},
 {name:'Dortmund back post',role:'bvb',style:bvb({skin:SKIN_M,seed:46}),keys:[[T0,-6.6,4.6],[0,-6.8,4.4],[TF,-6.4,3.6],[T1,-6,3]]},
 {name:'Dortmund edge',role:'bvb',style:bvb({build:{height:1.78},seed:47}),keys:[[T0,-15.2,-2.4],[-2,-15.6,-2],[0,-15,-1.6],[TF,-13.4,-1.2],[T1,-12.6,-1]]},
 {name:'Madrid attacker 1',role:'real',style:real({skin:SKIN_D,build:{height:1.9,bulk:1.06},seed:61}),keys:[[T0,-7.4,.4],[-2,-7.1,.8],[0,-6.9,1],[TF,-5.8,.8],...toFlag(-5.2,.2,0)]},
 {name:'Madrid attacker 2',role:'real',style:real({seed:62}),keys:[[T0,-10.4,2.8],[-2,-10,2.4],[0,-9.8,2.2],[TF,-8.3,1.6],...toFlag(-7.6,1,1)]},
 {name:'Madrid attacker 3',role:'real',style:real({skin:SKIN_M,build:{height:1.86},seed:63}),keys:[[T0,-6.4,-1.8],[-2,-6.2,-1.9],[0,-6,-2],[TF,-5.3,-2.4],...toFlag(-5,-2.6,2)]},
 {name:'Madrid attacker 4',role:'real',style:real({seed:64,hair:[Y,.5]}),keys:[[T0,-12.6,-5.6],[-2,-12.2,-5.2],[0,-12,-5],[TF,-10.6,-4.4],...toFlag(-10,-4,3)]},
];
const CAR=0,KRO=1,GK=2,FUL=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** placed in the quadrant (Kroos sets it down early) → the corner → the glance → the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*5:TF*TAU*5+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // set-piece jostling: knees bent, arms out, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** Kobel: set, then a late dive to his LEFT (side 'l' = +z for a keeper facing −x), too late for the glance */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.7}),T_DIVE=TF+.12,DIVE_L=.95;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'car':{
   // eyes on Kroos, then the dart; he springs, glances it on with a turn of the head, lands and wheels away
   if(tau<-.3)yaw=faceYaw(k,tau,P0);
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=carHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   const w=sm(TJ-.6,TJ-.15,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'kro':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   if(tau<-4.8&&tau>-6.6){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   if(tau>-3.6&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_K,sm(-2.2,-1.2,tau));}
   // the raised arm: the signal before a set piece
   if(tau>-3.4&&tau<-1.4)pose=blendPose(pose,{...pose,rShF:40*DEG,rShA:150*DEG,rElb:10*DEG},win(tau,-3.4,-1.4,.4)*.9);
   yaw=lerpAng(yaw,YAW_K,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.6,1.1,tau)*(1-sm(TF-.85,TF-.65,tau)));
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));}
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'ful':{// beaten to it: a late, lower jump behind Carvajal, then hands on hips
   if(tau<-.3)yaw=faceYaw(k,tau,P0);
   if(tau>TF-.5&&tau<TF+1){const hp=header(clamp((tau-(TF-.3))/1.0));hp.air*=.7;pose=blendPose(pose,hp,.62*sm(TF-.5,TF-.3,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));if(tau>=-.3)yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'bvb':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'real':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the header, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===CAR&&tau>TJ&&tau<TF+.3)||(k===KRO&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, the corner right below it
/** τ from chapter time: real time, anchored so his head meets the ball just after "Dani Carvajal" (the corner is struck TF earlier) */
function tau1(t:number){const tH=CUE(0,'Dani Carvajal')+.35;return Math.max(T0+.5,t-(tH-TF));}
const P1:V3=[-22,23,-70];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-20,11,22],fov:36})],
  [CUE(0,'nil')-.3,1.3,()=>({P:P1,T:[-7,1,-4.5],fov:13})],
  [CUE(0,'Toni Kroos')-.8,1,()=>({P:P1,T:mix3(at(KRO,tau,.9),P0,.25),fov:6})],
  [CUE(0,'Dani')-TF-.5,.5,()=>({P:P1,T:mix3(at(KRO,tau,.9),P0,.45),fov:7})],
  [CUE(0,'Dani')-TF+.02,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[HP[0],1.6,HP[1]],.2+.6*sm(0,TF,tau)),fov:lerp(9,13,sm(0,.9,tau))})],
  [CUE(0,'Dani')-.2,.7,()=>({P:P1,T:[HP[0]+1.4,1.5,HP[1]+2.4],fov:7.2})],
  [CUE(0,'flicks it in')+.35,1.4,()=>{const w=at(CAR,tau,1.1);return{P:P1,T:mix3(w,[-4,1.2,-6],.3),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tL=CUE(0,'Real Madrid lead'),tN=CUE(0,'Dani')+.5;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tL-.3,tL+.2,t)*(1-sm(tL+2.2,tL+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:17,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Dani')+.4;},
};

/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a flat dashed ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,w=.07){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<14;i++)gaps.push([(i+.66)/14,(i+.96)/14]);
 const d=ribbon(pts,Math.max(5,kAt(c,P)*w),{seed:31,close:true,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind Kroos at the corner flag
const tau2=(t:number)=>key(t,mono([[0,-2.4],[CUE(1,'shorter'),-1.8],[CUE(1,'darts'),-.25],[CUE(1,'gets in front'),TJ-.12],[CUE(1,'jumps first'),TF-.05],[SECS(1)-.2,TG+.35]]),linear);
const E2:V3=[3.2,2.9,-43];
function cam2(t:number):Cam{
 const tau=tau2(t),r=at(CAR,tau,1.3),f=at(FUL,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-1.6,.9,-31],fov:31})],
  [CUE(1,'shorter')-.3,1.1,()=>({P:E2,T:mix3(r,f,.5),fov:8.2})],
  [CUE(1,'striker')-.1,.8,()=>({P:E2,T:add3(mix3(r,f,.6),[0,.2,0]),fov:7.2})],
  [CUE(1,'darts')-.2,1,()=>({P:E2,T:mix3(r,[HP[0],1.5,HP[1]],.4),fov:8.6})],
  [CUE(1,'gets in front')-.2,.8,()=>({P:add3(E2,[0,.2,0]),T:mix3([HP[0],1.6,HP[1]],ballAt(tau),.35*(1-sm(TF-.5,TF-.1,tau))),fov:lerp(10,7.4,sm(TF-.6,TF-.1,tau))})],
  [CUE(1,'jumps first')-.2,.8,()=>({P:add3(E2,[0,.3,0]),T:mix3(HEAD_PT,[-2,1.8,-2],.25+.4*sm(TF,TG,tau)),fov:lerp(6.6,10,sm(TF,TG,tau))})],
 ]);
}
/** the replay trail: the corner's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.5,tau));
  // the replay graphic: a yellow ring under Carvajal's feet ("that's him") until he takes off
  groundRing(s,c,at(CAR,tau,0),.75,Y,sm(CUE(1,'shorter')-.3,CUE(1,'shorter')+.1,t)*(1-sm(TJ-.1,TJ+.1,tau)),.16);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  // the touch: a spark on his head at contact
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'jumps first')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay: low on the goal line beside the far post, the glance comes at us
const tau3=(t:number)=>key(t,mono([[0,TJ-.7],[CUE(2,'glance'),TF+.02],[CUE(2,'across the keeper'),TF+.32],[CUE(2,'far corner'),TG+.12],[CUE(2,'fifteenth')-.4,TG+2.2],[SECS(2),TG+5.2]]),linear);
const E3:V3=[-1.4,2.5,10.8];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(CAR,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0]+.4,1.7,HP[1]+.6],fov:17})],
  [CUE(2,'glance')-.3,.8,()=>({P:E3,T:[HEAD_PT[0]+.2,HEAD_PT[1]-.15,HEAD_PT[2]+.3],fov:12})],
  [CUE(2,'across')-.2,.9,()=>({P:E3,T:[-2.4,1.7,-2.2],fov:30})],
  [CUE(2,'far corner')+.3,1.2,()=>({P:E3,T:[-1.6,1.4,-1.6],fov:34})],
  [CUE(2,'fifteenth')-.9,1.8,()=>({P:[-1.8,4.2,12],T:r,fov:15})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tF=CUE(2,'fifteenth');
  stadium(s,c,t,[1,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tF-.1,tF+.3,t))});
  ground(s,c);
  groundRing(s,c,at(CAR,tau,0),.75,Y,sm(.1,.5,t)*(1-sm(TJ-.1,TJ+.1,tau)),.16);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the replay graphic: the glance's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(CAR,tau3(twos(t))),sk=solve(p.pose,B_CAR,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'across')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: from behind the penalty spot, a slow replay with teaching marks
const NEAR_ZONE:V3=[-4.6,0,-6.4];
const tau4=(t:number)=>key(t,mono([[0,-1.2],[CUE(3,'Get there first'),-.6],[CUE(3,'time your jump'),TJ-.05],[CUE(3,'glance it on'),TF-.04],[CUE(3,'glance it on')+1.1,TF+.08],[CUE(3,'Small players'),TF+.14],[SECS(3),TF+.22]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(CAR,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-16,5.2,-19.5],T:[-4,.4,-5.5],fov:34})],
  [CUE(3,'Get there first')-.2,1,()=>({P:[-14.5,3.6,-17.5],T:mix3(w,[-5.8,1,-7.4],.5),fov:26})],
  [CUE(3,'time your jump')-.2,.9,()=>({P:[-13,2.8,-16],T:[HP[0]-.4,1.5,HP[1]+.3],fov:21})],
  [CUE(3,'glance it on')-.2,.9,()=>({P:[-13,2.8,-16],T:mix3([HEAD_PT[0],HEAD_PT[1]-.3,HEAD_PT[2]],[0,1.6,1],.3),fov:30})],
  [CUE(3,'Small players')-.3,1,()=>({P:[-12,2.2,-15],T:[-5.75,1.5,-7.7],fov:20})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tA=CUE(3,'Attack'),tG=CUE(3,'Get there first'),tJ=CUE(3,'time your jump'),tO=CUE(3,'glance it on'),tS=CUE(3,'Small players');
  stadium(s,c,t,[0,1,3],{roar:.35+.3*sm(tO+.3,tO+.9,t)});
  ground(s,c);
  // "Attack the near post": the near-post zone lights up, a red ring at the corner of the six-yard box
  const za=sm(tA-.1,tA+.4,t)*(1-sm(tS-.2,tS+.4,t));
  if(za>0){const zone=polyP(c,[[-.2,.01,-3.2],[-5.5,.01,-3.2],[-5.5,.01,-9.3],[-.2,.01,-9.3]]);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.3*za);s.tone(Y,zp,.35*za);}
   groundRing(s,c,[HP[0],0,HP[1]],.85,R,za);}
  // "Get there first": his run's footprints light up in order, in front of the striker (who stays a step behind)
  const run=sm(tG-.2,tG+.3,t)*(1-sm(tO+.2,tO+.8,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<8;k++){const Tk=-.3+k*((TJ-.25+.3)/7),[x,z]=posOf(CAR,Tk),v=velOf(CAR,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);
   const f=at(FUL,tau,0),rr=kAt(c,f)*.5,X=pr(c,f);if(X){const ring=polyPath(blob(X[0],X[1],rr,rr*.34,7,{n:20}),true);s.stroke(K,ring,Math.max(4,rr*.1),.8*run);}}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[CAR,GK,FUL,5]});
  // "time your jump": a spark under his take-off, an up arrow beside him
  const jp=sm(tJ-.1,tJ+.3,t)*(1-sm(tO,tO+.4,t));
  if(jp>0){const q=pr(c,[HP[0],.05,HP[1]]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(70,kAt(c,[HP[0],0,HP[1]])*.7)*jp,{n:9,seed:41,g:easeOutBack(jp),width:12});
   const side:V3=[HP[0]-.8,0,HP[1]+.7];arrow3(s,c,[add3(side,[0,.4,0]),add3(side,[0,.4+.8*jp,0]),add3(side,[0,.4+1.6*jp,0])],Math.max(9,kAt(c,side)*.09),R,.95*jp);}
  // "glance it on": a ring on the ball, the corner's last metres dashed in, the glance's arrow on across the goal — only a small turn
  const gl=sm(tO-.2,tO+.2,t)*(1-sm(tS+.8,tS+1.4,t));
  if(gl>0){if(r.ball&&tau<TF+.12){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp_=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*gl);s.fill(Y,rp_,.95*gl);}
   const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,flyA(P0,V_CROSS,SWING,lerp(TF*.62,TF,i/16)));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.62)/8,(i+.98)/8]);const d=ribbon(pts,Math.max(7,kAt(c,HEAD_PT)*.06),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*gl);s.fill(Y,d,.95*gl);}
   const arr=sm(tO+.15,tO+1.1,t,easeInOutSine);if(arr>0){const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*arr*i/8));arrow3(s,c,q,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95*gl);}}
  // "Small players can win headers too": a navy dashed line at the tall striker's standing height (1.89 m), a red tick at Carvajal's own
  // (1.73 m) — and his head, in the air, above both (a yellow burst)
  const sp=sm(tS-.1,tS+.5,t);
  if(sp>0){const cp=at(CAR,tau,0),fp=at(FUL,tau,0),dir=nrm2(cp[0]-fp[0],cp[2]-fp[2]),ext=(P:V3,k:number,h:number):V3=>[P[0]+dir[0]*k,h,P[2]+dir[1]*k];
   const hF=B_FUL.height??1.89,hC=B_CAR.height??1.73,q=[pr(c,ext(fp,-.7,hF)),pr(c,ext(cp,.7,hF))].filter((p):p is Pt=>!!p);
   if(q.length===2){const pts=partial([q[0],q[1]],sp),w=Math.max(7,kAt(c,fp)*.06),gaps:[number,number][]=[];for(let i=0;i<7;i++)gaps.push([(i+.7)/7,(i+.97)/7]);
    const d=ribbon(pts,w,{seed:61,taper:0,wobble:.4,gaps});s.knockout(d,.9*sp);s.fill(K,d,.98*sp);s.stroke(K,d,3,.9*sp);}
   const c0=pr(c,ext(cp,-.3,hC)),c1=pr(c,ext(cp,.3,hC));if(c0&&c1){const d=ribbon([c0,c1],Math.max(7,kAt(c,cp)*.06),{seed:62,taper:0,wobble:.4});s.knockout(d,.8*sp);s.fill(R,d,.95*sp);}
   const st=stateOf(CAR,tau),sk=solve(st.pose,B_CAR,st.place),h=pr(c,add3(sk.head,[0,.25,0]));if(h)sparkBurst(s,Y,h[0],h[1],Math.max(60,kAt(c,sk.head)*.6)*sp,{n:11,seed:55,g:easeOutBack(sp),width:12});}
 },
 get still(){return CUE(3,'Small players')+.3;},
};

const film:RisoStory={
 id:'carvajal-header-2024',format:'11v11',title:"Carvajal's near-post header",
 theme:'Attack the near post: get there first, time your jump and glance the ball on — you do not need to be tall to win a header',
 ageNote:'Borussia Dortmund 0–2 Real Madrid, Champions League final, Wembley, 1 June 2024. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little glance — a ball whips in low from one side, a yellow spark where it is met, and it flicks on and away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-200*(1-u):x+190*easeOut(out),by=age<.3?y-60*(1-u)*(1-u):y-40*out+60*out*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Dortmund's goal line x = 0, +z = Madrid's right) — checked by tests/play-film-carvajal-header-2024.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,cornerFoot:'r' as const,
 kroosContact:()=>{const st=stateOf(KRO,0),sk=solve(st.pose,B_KRO,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 carvajalAt:(tau:number)=>{const st=stateOf(CAR,tau),sk=solve(st.pose,B_CAR,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 fullkrugAt:(tau:number)=>{const st=stateOf(FUL,tau),sk=solve(st.pose,B_FUL,st.place);return{head:sk.head,pelvis:sk.pelvis};},
 kobelAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_KOB,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
