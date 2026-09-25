/** Mikel Merino — "the late header". Spain 2–1 Germany (a.e.t.), UEFA Euro 2024 quarter-final, Friday 5 July 2024, MHPArena, Stuttgart.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A 1:1 reconstruction of the goal from WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT (signature card, lib/town/iconicPlays.json kind:"signature", "the late header"; lesson "Arrive late at the back post:
 * defenders often forget the midfielder"): Merino's best-known goal is exactly that trait — a midfielder (he came on as a substitute in the
 * 80th minute) arriving in the box unmarked in the 119th minute and winning a header. Written sources describe the play (the switch, the
 * pass wide to Olmo, Olmo's cross, Merino's leap and header past Neuer, the corner-flag celebration), so the real-match chapters show the
 * play itself; everything the accounts do not pin down is marked INFERRED below and never named in the narration. The card's "back post"
 * wording is taught in the lesson chapter as general advice ("into the gap, or the back post") — the film never claims this header was
 * at the back post.
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "UEFA Euro 2024 knockout stage" (raw wikitext; football box + line-ups cite UEFA's full-time report and tactical line-ups):
 *    5 July 2024, 18:00, MHPArena Stuttgart, 54,000, referee Anthony Taylor; Olmo 51', Wirtz 89', Merino 119'; Spain kit red shirts,
 *    dark-blue (004080) shorts, red socks; Germany all white (white shirts, white shorts, white socks); numbers Merino 6 (on 80'), Olmo 10
 *    (on 8' for Pedri), Cucurella 24, Neuer 1; Carvajal sent off 120+6'; Kroos's last match. https://en.wikipedia.org/wiki/UEFA_Euro_2024_knockout_stage
 *  - The Guardian, Sid Lowe, "Mikel Merino breaks hosts' hearts as Spain send Germany out of Euro 2024", 5 July 2024: "With 65 seconds of
 *    extra time remaining, penalties looking inevitable and players pulling up all over the pitch ... Dani Olmo clipped in a glorious ball
 *    and there, deep in the penalty area, was Mikel Merino. A turn of the head, a twist of the neck and the selección were on their way to
 *    the semi-final". https://www.theguardian.com/football/article/2024/jul/05/spain-germany-euro-2024-quarter-final-match-report
 *  - The Guardian, Barry Glendenning, "Spain 2-1 Germany (aet): Euro 2024 quarter-final – as it happened", 5 July 2024: "Spain switched play
 *    from right to left and Marc Cucurella played the ball wide to Dani Olmo. His cross to the near post was inch-perfect and Mikel Merino
 *    leapt and stretched every sinew to steer the ball past Manuel Neuer into the top corner from about 10 yards out."
 *  - Marca, José Luis Hurtado, "Hazaña eterna de España", 5 July 2024: "Un salto con la pértiga de Merino" (a pole-vault leap); "Un centro
 *    del interior terminó en un cabezazo de Mikel Merino". https://www.marca.com/futbol/eurocopa/cronica/2024/07/05/66880a0746163f41978b45be.html
 *  - Wikipedia, "Mikel Merino" (en + es): height 1.89 m; the 119th-minute header from Olmo's cross; "his celebration after the goal (running
 *    around the corner flag) mirrored that of his father after he had done the same for Osasuna in a UEFA Cup fixture at the same stadium in
 *    1991" (citing AP, Daniella Matar, 5 July 2024). Clubs (lib/town/playerCareers.json): Real Sociedad 2018–24, Arsenal 2024–; country
 *    Spain (lib/town/playerAppearance.json).
 * CONFIRMED: the date, the stadium, 1–1 into the last minute of extra time; Spain switched play right to left, Cucurella passed wide to Olmo
 *  (so the cross came from Spain's LEFT), Olmo clipped the cross in; Merino, a late substitute midfielder, was deep in the box, leapt high and
 *  steered a header past Neuer into the (top) corner from ≈ 10 yards (≈ 9 m); he celebrated by running round a corner flag, as his father
 *  (Ángel Merino, Osasuna) had at the same stadium in 1991; kits and numbers as above.
 * INFERRED (illustrative reconstruction, never named in the narration): every position, run and timing in metres and seconds (the switch
 *  ≈ 38 m in 1.9 s; Cucurella's LEFT-foot pass and Olmo's RIGHT-foot cross — their stronger feet, not verified in the footage; the cross ≈
 *  26 m in 1.3 s); Merino's run starting just outside the box and arriving between the defenders (Lowe only says he was "deep in the penalty
 *  area"); the contact point ≈ 8.6 m out, just left of centre; which corner the header went in (drawn: the far, +z top corner — the Guardian
 *  says "top corner" without a side); the unnamed players' positions (drawn without numbers); Neuer's keeper kit (printed blue) and his late
 *  dive; which end and which touchline (drawn: the main camera on Spain's RIGHT, so Olmo crosses from the far touchline); which corner flag
 *  he circled (drawn: the one on Olmo's side); Spain's yellow numbers, trims and hair; the MHPArena's seat colours and membrane roof as
 *  drawn; the evening daylight (≈ 20:10 local, sunset ≈ 21:30); the crowd's colours; Merino's beard (athlete.ts has no beard; not drawn);
 *  the "1991" halftone ghost in chapter 3 is a replay GRAPHIC echoing the father's celebration, not footage.
 *
 * FRAMING (the TV broadcast, never top-down; the Olmo film may use the same match, so this one follows MERINO'S LATE RUN): ch1 = the high
 * main-stand camera on the NEAR (+z) side in REAL TIME: the stadium → the switch across the pitch → Olmo on the far touchline → the cross →
 * the leap → Merino racing away to the corner flag; ch2 = the slow-motion replay from LOW BEHIND MERINO, a camera that dollies after him:
 * he waits outside the box while every white shirt watches the ball (navy eye-lines), then runs in late into the gap and jumps; ch3 = a
 * second replay LOW BESIDE THE GERMANY GOAL: the twist of the neck, the ball past Neuer at us, then the camera slides along the goal line
 * to the corner flag he circles (a halftone 1991 ghost circling with him); ch4 = the lesson, a reverse angle from above the far post: the
 * defenders' eye-lines, the empty gap behind them, the waiting ring and the late run's footprints, the back-post zone. Composed on the FULL
 * sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion,
 * motionSmear on the passes, the cross, the leap and the dive). Handedness: the world is right-handed (x toward Germany's goal, y up, +z =
 * Spain's right), athlete.ts's own convention, so strike({foot:'r'}) is a RIGHT foot and the left wing is −z. Inks: yellow, red, blue,
 * navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; randomness seeded.
 * Heat: small figures print at 'low', at most 4 non-hero figures at full detail, every figure inside a passage is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word);
 * their `at` and each chapter's `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Stuttgart, 2024',text:'Stuttgart, 2024. Spain against Germany, one all, the last minute of extra time. Dani Olmo clips in a cross... Mikel Merino heads it in! Spain win!',tail:2.4,
  cues:['Stuttgart','Spain against Germany','one all','last minute','Dani Olmo','clips in','Mikel Merino','heads it in','Spain win']},
 {label:'Watch his run',text:'Watch again. Merino waits outside the box. Every defender watches the ball. Then he runs in late, and jumps!',tail:1.8,
  cues:['Watch again','waits outside','Every defender','runs in late','jumps']},
 {label:'Like his dad',text:'From behind the goal: a twist of the neck, past Manuel Neuer! Merino circles the corner flag, like his dad did here in 1991.',tail:2.2,
  cues:['From behind','twist','past Manuel Neuer','circles','like his dad']},
 {label:'Arrive late',text:'Arrive late! Defenders watch the ball and forget the midfielder. Wait, then run into the gap, or the back post!',tail:2,
  cues:['Arrive late','Defenders watch','forget','Wait','back post']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/merino-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/merino-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/merino-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('merino: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('merino: no cue '+w);return c.at;};
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
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Germany's goal line is x = 0 (Spain attack +x), goal centre z = 0, +z = Spain's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the MHPArena on a July evening: two tiers, the pale membrane roof
const CX=-52.5;
/** stand planes (a along, b up the rake 0..1): 0 the near side (+z, the camera side), 1 behind Germany's goal (+x), 2 the far side (−z),
 * 3 the other end. No running track: the stands sit close to the pitch; the four planes meet at the corners (one continuous bowl). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-113-33*b,8+33*b,a),1.2+27*b,40+33*b],
 (a,b)=>[8+33*b,1.2+27*b,lerp(40+33*b,-40-33*b,a)],
 (a,b)=>[lerp(8+33*b,-113-33*b,a),1.2+27*b,-40-33*b],
 (a,b)=>[-113-33*b,1.2+27*b,lerp(-40-33*b,40+33*b,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=15;
/** the dark fascia between the two tiers */
const FASCIA:[number,number][]=[[.44,.5]];
/** crowd colour weights per stand: [paper (Germany white), yellow (Spain's gold, flags), navy (dark shirts, shadow), red (Spain red, seats)] */
const CROWD_MIX:[number,number,number,number][]=[[.5,.1,.14,.26],[.38,.14,.12,.36],[.5,.1,.14,.26],[.56,.08,.16,.2]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a clear July evening over Stuttgart (≈ 20:10, the sun still up): pale blue, a warm glow low down
 s.field(B,.26,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.22);}
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),rib=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const[b0,b1] of FASCIA)addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));
  // the membrane roof: a pale sheet from the top of the stand out over the seats, its inner edge a tension ring
  const r0=(a:number):V3=>add3(S(a,1),[0,2.4,0]),r1=(a:number):V3=>add3(S(a,.32),[0,21,0]);
  addPoly(roof,polyP(c,[r0(0),r0(1),r1(1),r1(0)]));
  for(let k=0;k<=12;k++){const a=k/12;seg3(c,r0(a),r1(a),.35,rib);}
  seg3(c,r1(0),r1(1),.6,edge);}
 // seats and people under the roof's shade: a red × navy screen, the fascia dark
 s.knockout(planes);s.tone(R,planes,.34);s.tone(K,planes,.36);s.knockout(fas);s.fill(K,fas,.8);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.2)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.2)/.8,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(Y,inks[1],.95);s.fill(K,inks[2],.9);s.knockout(inks[3],.7);s.fill(R,inks[3],.95);
 // the roof: sunlit membrane (paper with a warm screen), navy ribs, the inner ring
 s.knockout(roof);s.tone(Y,roof,.14);s.tone(B,roof,.08);s.stroke(K,rib,1.5,.5);s.knockout(edge,.7);s.fill(K,edge,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-45],[13,0,-45],[13,0,45],[-118,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.62);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.18);
 // advertising boards: navy with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.3);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** Germany's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around z = bz */
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
/** Spain: red shirts, dark-blue shorts, red socks (sourced); yellow numbers and trim (inferred) */
const esp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[K,.9],socks:[R,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:[Y,.9],numberInk:[Y,.95],hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Germany: all white (sourced); black trim and numbers (inferred) */
const ger=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:[K,.8],numberInk:K,hairStyle:'short',build:{height:1.86,bulk:1},...o});
const B_MER:Build={height:1.89,bulk:1.02,thighs:1.02},B_OLM:Build={height:1.79,bulk:.95},B_CUC:Build={height:1.72,bulk:.96},B_NEU:Build={height:1.93,bulk:1.04},B_ESP:Build={height:1.8,bulk:1};
const MER_ST=esp({number:6,hair:[K,.95],build:B_MER,seed:6});
const OLM_ST=esp({number:10,hair:[K,.9],build:B_OLM,seed:10});
const CUC_ST=esp({number:24,hair:[K,.95],hairStyle:'curly',build:B_CUC,seed:24});
const NEU_ST:AthleteStyle={shirt:[B,.88],shorts:[B,.88],socks:[B,.88],boots:K,skin:SKIN_L,hair:[Y,.55],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_NEU,seed:1};
/** the halftone "1991" ghost (Osasuna red and navy, a graphic, printed as light screens) */
const GHOST_ST:AthleteStyle={shirt:[R,.4],shorts:[K,.3],socks:[R,.35],boots:[K,.4],skin:[[Y,.25],[R,.1]],hair:[K,.4],line:B,shade:null,trim:null,hairStyle:'short',build:{height:1.8,bulk:1},shadow:false,lineWeight:.7,seed:91};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Olmo's cross)
const BALL_R=.11,GRAV=9.81;
const G3:V3=[0,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
/** the cross flies TF s to Merino's head; his header reaches the goal line TG */
const TF=1.3,TG=TF+.5;
/** Merino's header spot (his pelvis) ≈ 8.6 m out, just left of centre ("deep in the penalty area", "about 10 yards out"). He meets the ball
 * turned half toward the cross, so the goal is over his RIGHT shoulder; the twist of the neck sends it on toward the far corner. */
const HP:[number,number]=[-8.6,-.6],FACE:[number,number]=nrm2(.71,-.7),YAW_H=yawTo(FACE[0],FACE[1]);
/** Merino's header: header() with a big running spring ("a pole-vault leap"), the head and shoulders twisting to his RIGHT */
function merHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.3;const w=Math.sin(Math.PI*clamp((u-.3)/.42)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(.18,-.62,sn)*w;p.twist+=lerp(.08,-.26,sn)*w;p.neckP-=.3*w;p.bend-=.12*w;p.lShA+=.35*w;p.rShA+=.3*w;return p;}
const CU=.47,HD=1.0,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(merHeader(CU),B_MER,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.03,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** where Olmo clips the cross from: wide on Spain's LEFT, just outside the box */
const P0:V3=[-17.6,BALL_R,-25.6];
/** a right-footer's in-swinger from the left: a gentle pull toward the goal line (+x) on top of gravity */
const SWING:V3=[1.6,-GRAV,0];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_O=yawTo(DC[0],DC[1]);
/** where a kicker's pelvis stands at contact so the chosen boot meets the back of the ball (solved once, FK) */
function strikeSpot(P:V3,dir:[number,number],foot:'l'|'r',build:Build,power=1):[number,number]{const sk=solve(strike(STRIKE_CONTACT,{foot,power}),build,{x:0,z:0,yaw:yawTo(dir[0],dir[1])}),toe=foot==='r'?sk.rToe:sk.lToe;return[P[0]-dir[0]*.12-toe[0],P[2]-dir[1]*.12-toe[2]];}
const PCK=strikeSpot(P0,DC,'r',B_OLM);
/** the build-up (τ < 0): the switch from Spain's right to Cucurella (TS0 → TS1), his touch, his LEFT-foot pass wide to Olmo (TC → TO),
 * Olmo's touch forward into the crossing spot */
const TS0=-5.4,TS1=-3.5,TC=-2.2,TO=-1.15;
const SW0:V3=[-33.4,BALL_R,15.6],CU_IN:V3=[-28.7,BALL_R,-22.4],CU_OUT:V3=[-27.7,BALL_R,-23.2];
const OL_IN:V3=[P0[0]-DC[0]*1.9,BALL_R,P0[2]-DC[1]*1.9];
const V_SW=launch(SW0,CU_IN,TS1-TS0,G3),DSW=nrm2(CU_IN[0]-SW0[0],CU_IN[2]-SW0[2]),DCU=nrm2(OL_IN[0]-CU_OUT[0],OL_IN[2]-CU_OUT[2]);
const PSW=strikeSpot(SW0,DSW,'r',B_ESP),PCC=strikeSpot(CU_OUT,DCU,'l',B_CUC,.5);
/** where the header crosses the goal line: high on the FAR side (+z; "the top corner"), past Neuer's late dive */
const GOAL_PT:V3=[0,2.08,2.75],NET_HIT:V3=[1.6,1.5,3.0],REST:V3=[1.2,BALL_R,2.8];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);
/** the corner flag he circles (Olmo's side) and his loop around it */
const FLAG:[number,number]=[0,-34],LOOP_R=1.8,T_LOOP=TG+5.4,LOOP_T=2.4;

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='mer'|'olm'|'cuc'|'sw'|'gk'|'ger'|'esp';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=TG+10,DT=.02;
const along=(P:[number,number],d:[number,number],u:number):[number,number]=>[P[0]+d[0]*u,P[1]+d[1]*u];
/** after the goal the Spain players chase Merino toward the corner flag */
const toFlag=(x:number,z:number,k:number):number[][]=>[[TG+.6+k*.2,x,z],[TG+5+k*.3,lerp(x,-4,.6),lerp(z,-27,.6)],[T1,lerp(x,-3.4,.85),lerp(z,-30.5,.85)]];
/** Merino's loop round the flag: approach from the pitch side, once round, then stop by it */
const LOOP:number[][]=Array.from({length:9},(_,i)=>{const a=Math.PI*.75+i/8*TAU;return[T_LOOP+i/8*LOOP_T,FLAG[0]+Math.cos(a)*LOOP_R,FLAG[1]+Math.sin(a)*LOOP_R];});
const ACTORS:Actor[]=[
 {name:'Mikel Merino',role:'mer',hero:true,style:MER_ST,keys:[[T0,-22.4,-1.4],[-6,-21.6,-2.2],[-3.4,-21,-2.6],[-1.7,-20.7,-2.5],[-.9,-18.4,-2],[-.1,-14.6,-1.5],[TJ-.28,HP[0]-1.3,HP[1]-.1],[TJ,HP[0]-.45,HP[1]-.03],[TF,HP[0],HP[1]],[TF+.45,HP[0]+.2,HP[1]-.1],[TF+1.3,-7.6,-4.6],[TF+3.2,-5,-15],[T_LOOP-.9,-2.2,-28.6],...LOOP,[T_LOOP+LOOP_T+.8,-1.6,-31.6],[T1,-2,-31]]},
 {name:'Dani Olmo',role:'olm',hero:true,style:OLM_ST,keys:[[T0,-26.5,-29.5],[-5,-24,-29.2],[-2.6,-21.6,-28.6],[TO,...along(PCK,DC,-2.2)],[-.5,...along(PCK,DC,-1.3)],[0,...PCK],[.7,...along(PCK,DC,.9)],[2.4,...along(PCK,DC,2.6)],[TG+2,-12,-24],[T1,-5,-30]]},
 {name:'Marc Cucurella',role:'cuc',hero:true,style:CUC_ST,keys:[[T0,-34,-25],[-6,-31.5,-24],[TS1-.6,...along(PCC,DCU,-1.9)],[TS1,...along(PCC,DCU,-1.1)],[TC-.5,...along(PCC,DCU,-.9)],[TC,...PCC],[TC+.7,...along(PCC,DCU,.9)],[1,-22.5,-24.2],[T1,-12,-27]]},
 {name:'Manuel Neuer',role:'gk',hero:true,style:NEU_ST,keys:[[T0,-2.6,.4],[-2.4,-2.2,-.6],[0,-1.5,-1.5],[TF-.4,-1.2,-1.3],[TF,-1.15,-1.1],[T1,-1,-.9]]},
 {name:'Spain, the switch',role:'sw',style:esp({skin:SKIN_M,seed:31}),keys:[[T0,-37,16.8],[TS0-.55,...along(PSW,DSW,-1.4)],[TS0,...PSW],[TS0+.7,...along(PSW,DSW,.8)],[TS0+3,-28,12],[T1,-20,8]]},
 {name:'Spain near post',role:'esp',style:esp({skin:SKIN_M,build:{height:1.78},seed:32}),keys:[[T0,-12.5,-7],[-2,-11.6,-6.6],[0,-9.4,-5.6],[TF,-6.2,-4.4],...toFlag(-5.9,-4.6,0)]},
 {name:'Spain back post',role:'esp',style:esp({build:{height:1.92,bulk:1.06},seed:33}),keys:[[T0,-11.4,5.2],[-2,-10.8,4.6],[0,-9.6,4.2],[TF,-7.6,3.6],...toFlag(-7.4,3,1)]},
 {name:'Spain edge',role:'esp',style:esp({seed:34,hair:[K,.7]}),keys:[[T0,-26,8.4],[-2,-24,7],[0,-22.4,5.6],[TF,-20.6,4.6],...toFlag(-19,3.8,2)]},
 {name:'Germany near post',role:'ger',style:ger({seed:41}),keys:[[T0,-5.6,-3.6],[-2,-5.8,-4],[0,-5.6,-4.6],[TF,-4.6,-5.2],[T1,-4.4,-4.6]]},
 {name:'Germany marker',role:'ger',style:ger({skin:SKIN_M,build:{height:1.9},seed:42}),keys:[[T0,-9.8,-3.8],[-2,-9.6,-4],[0,-9.2,-4.6],[TF,-8.6,-4.2],[T1,-8,-3.6]]},
 {name:'Germany centre',role:'ger',style:ger({build:{height:1.9},seed:43}),keys:[[T0,-10.2,3],[-2,-10,2.8],[0,-9.9,2.5],[TF,-9.1,1.9],[T1,-8.6,1.6]]},
 {name:'Germany back post',role:'ger',style:ger({seed:44,hair:[K,.8]}),keys:[[T0,-5.8,5.4],[0,-6,5],[TF,-5.4,4.4],[T1,-5,3.8]]},
 {name:'Germany edge',role:'ger',style:ger({skin:SKIN_D,hair:[K,.9],seed:45}),keys:[[T0,-15.2,3.6],[-2,-14.4,3.4],[0,-13.6,3],[TF,-12.8,2.4],[T1,-12,2]]},
 {name:'Germany press',role:'ger',style:ger({seed:46}),keys:[[T0,-15.6,-9],[-2,-15,-10.6],[0,-14.4,-12.4],[TF,-13.6,-12.2],[T1,-12.6,-11]]},
 {name:'Germany on Olmo',role:'ger',style:ger({build:{height:1.83},seed:47}),keys:[[T0,-24,-19.6],[-3,-22.4,-21],[-1,-20.8,-22.4],[0,-19.8,-23],[TF,-19.2,-23.4],[T1,-17,-22]]},
];
const MER=0,OLM=1,CUC=2,GK=3,SW=4;
const GER_IDX=ACTORS.map((a,k)=>a.role==='ger'?k:-1).filter(k=>k>=0);
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
/** the switch → Cucurella's touch → his pass wide → Olmo's touch → the cross → the header → the net */
function ballAt(tau:number):V3{
 if(tau<=TS0)return SW0;
 if(tau<TS1)return flyA(SW0,V_SW,G3,tau-TS0);
 if(tau<TC)return mix3(CU_IN,CU_OUT,easeOut((tau-TS1)/(TC-TS1)));
 if(tau<TO)return mix3(CU_OUT,OL_IN,easeOut((tau-TC)/(TO-TC)));
 if(tau<0)return mix3(OL_IN,P0,easeOut(clamp((tau-TO)/(-.1-TO))));
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=TS0?0:tau<TF?(tau-TS0)*TAU*3:(TF-TS0)*TAU*3+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
/** 119 minutes in: tired legs, so the idle is heavier (hands near the hips, a slow shuffle) */
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:20,rHipF:14,lKnee:26,rKnee:22,lean:16,pitch:4,neckP:-8,lShA:20,rShA:18,lElb:46,rElb:40,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.3+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** a pass / cross keyed at τk with the given foot (the actor's track puts the pelvis on the solved strike spot at τk) */
function kick(pose:Pose,tau:number,tk:number,foot:'l'|'r',power=1):Pose{const w=win(tau,tk-.55,tk+.8,.2);return w>0?blendPose(pose,strike(clamp((tau-tk)/1.0+STRIKE_CONTACT),{foot,power}),w):pose;}
/** Neuer: set, shuffles across with the cross, then a late dive to his LEFT (side 'l' = +z for a keeper facing −x), too late */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.55}),T_DIVE=TF+.14,DIVE_L=.95;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'mer':{
   // waits outside the box watching the ball, then the late run; he springs, twists the header on, lands and races to the flag
   if(tau<-1.2)yaw=faceYaw(k,tau,ballAt(tau));
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=merHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   const w=sm(TJ-.5,TJ-.1,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);
   if(tau>T_LOOP+LOOP_T+.4){pose=blendPose(pose,celebrate(tau*1.6,{kind:'arms'}),sm(T_LOOP+LOOP_T+.4,T_LOOP+LOOP_T+1,tau));yaw=lerpAng(yaw,yawTo(-1,.3),sm(T_LOOP+LOOP_T+.4,T_LOOP+LOOP_T+1,tau));}
   break;}
  case 'olm':{pose=kick(pose,tau,0,'r');yaw=lerpAng(yaw,YAW_O,sm(-1.2,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>-1.6&&tau<-1.2)yaw=lerpAng(yaw,faceYaw(k,tau,CU_OUT),.6);
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'cuc':{pose=kick(pose,tau,TC,'l',.5);if(tau<TS1+.2)yaw=faceYaw(k,tau,ballAt(tau));yaw=lerpAng(yaw,yawTo(DCU[0],DCU[1]),sm(TC-.9,TC-.4,tau)*(1-sm(TC+.6,TC+1.2,tau)));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'sw':{pose=kick(pose,tau,TS0,'r',1);yaw=lerpAng(yaw,yawTo(DSW[0],DSW[1]),sm(TS0-1,TS0-.5,tau)*(1-sm(TS0+.6,TS0+1.2,tau)));break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.6,1.1,tau)*(1-sm(TF-.8,TF-.6,tau)));
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));}
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'ger':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'esp':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the passes, the cross, the leap, the dive). */
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
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal; `extra` adds figures (the ghost) */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];extra?:Fig[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===MER&&tau>TJ&&tau<TF+.3)||(k===OLM&&tau>-.25&&tau<.35)||(k===CUC&&tau>TC-.25&&tau<TC+.3)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 if(o.extra)figs.push(...o.extra);
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

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
/** the replay graphic "every defender watches the ball": a dashed navy eye-line from each white shirt's head to the ball */
function eyeLines(s:Sheet,c:Cam,tau:number,a:number,w=.05){
 if(a<=0)return;const b=ballAt(tau),path=new Path2D();
 for(const k of GER_IDX){const st=stateOf(k,tau),sk=solve(st.pose,(ACTORS[k].style.build??{}) as Build,st.place),h=add3(sk.head,[0,.05,0]),d=sub3(b,h),L=Math.hypot(d[0],d[1],d[2]);if(L<1)continue;
  const end=add3(h,[d[0]*Math.min(1,a*1.2),d[1]*Math.min(1,a*1.2),d[2]*Math.min(1,a*1.2)]),n=Math.max(3,Math.round(L*Math.min(1,a*1.2)/1.4));
  for(let i=0;i<n;i++){const p0=mix3(h,end,i/n),p1=mix3(h,end,(i+.55)/n);const q0=pr(c,p0),q1=pr(c,p1);if(!q0||!q1)continue;const wd=Math.max(10,kAt(c,p0)*w);path.addPath(ribbon([q0,q1],wd,{taper:0,wobble:0,pressure:0}));}}
 s.knockout(path,.7*a);s.fill(K,path,.9*a);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, the cross from the far side
/** τ from chapter time: real time, anchored so his head meets the ball just after "Mikel Merino" (the cross is struck TF earlier) */
function tau1(t:number){const tH=CUE(0,'Mikel Merino')+.4;return Math.max(T0+.5,t-(tH-TF));}
const P1:V3=[-26,22,63];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-24,8,-6],fov:38})],
  [CUE(0,'Spain against')-.2,1.4,()=>({P:P1,T:mix3(gnd(b,1),[-26,1,-4],.5),fov:17})],
  [CUE(0,'last minute')-.4,1.3,()=>({P:P1,T:mix3(gnd(b,1),[-20,1,-14],.35),fov:12})],
  [CUE(0,'Dani Olmo')-.5,.9,()=>({P:P1,T:mix3(at(OLM,tau,.9),at(MER,tau,.9),.28),fov:10.5})],
  [CUE(0,'clips in')-.1,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[HP[0],1.6,HP[1]],.25+.55*sm(0,TF,tau)),fov:lerp(12,10,sm(0,1,tau))})],
  [CUE(0,'Mikel Merino')-.2,.7,()=>({P:P1,T:[HP[0]+2.4,1.6,HP[1]+.4],fov:6.8})],
  [CUE(0,'heads it in')+.5,1.6,()=>{const w=at(MER,tau,1.1);return{P:P1,T:mix3(w,[-6,1.2,-8],.3),fov:13};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tW=CUE(0,'Spain win'),tN=CUE(0,'Mikel Merino')+.5;
  stadium(s,c,t,[1,2,3],{roar:sm(tN,tN+.5,t),flash:sm(tW-.3,tW+.2,t)*(1-sm(tW+2.2,tW+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:15,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Mikel Merino')+.45;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay: low behind Merino, the camera dollies after his run
const tau2=(t:number)=>key(t,mono([[0,-3.3],[CUE(1,'waits outside'),-2.6],[CUE(1,'Every defender'),-1.9],[CUE(1,'runs in late'),-1.05],[CUE(1,'jumps'),TJ-.05],[CUE(1,'jumps')+1.1,TF+.05],[SECS(1)-.2,TG+.3]]),linear);
/** the dolly: behind him and off his right shoulder, a few metres up (the defenders and the cross side both in view); it slows as he pulls away into the box */
function dolly(tau:number):V3{const m=at(MER,Math.min(tau,TJ),0);return[Math.min(m[0]-7.5,-17.5),4.6,m[2]+7.5];}
function cam2(t:number):Cam{
 const tau=tau2(t),m=at(MER,tau,1.35),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:dolly(tau),T:mix3(m,[-12,0,-9],.5),fov:46})],
  [CUE(1,'waits outside')-.3,1,()=>({P:dolly(tau),T:mix3(m,[-12,.4,-7],.4),fov:38})],
  [CUE(1,'Every defender')-.2,.9,()=>({P:dolly(tau),T:[-10.5,.8,-2.5],fov:40})],
  [CUE(1,'runs in late')-.25,.9,()=>({P:dolly(tau),T:mix3(m,[HP[0],1.4,HP[1]],.55),fov:36})],
  [CUE(1,'jumps')-.7,1.3,()=>({P:[-11,2.7,-7.2],T:mix3(add3(HEAD_PT,[0,-.5,0]),[-3,1.4,.6],.35*sm(TF,TG,tau)),fov:lerp(26,34,sm(TF,TG,tau))})],
 ]);
}
/** the replay trail: the ball's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number,from=0){
 if(fade<=0||tau<=from)return;const pts:Pt[]=[];const a=Math.max(from,tau-.9),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tWt=CUE(1,'waits outside'),tE=CUE(1,'Every defender'),tR=CUE(1,'runs in late');
  stadium(s,c,t,[0,1,2],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.5,tau));
  // "waits outside the box": a yellow ring under him until he runs
  groundRing(s,c,at(MER,tau,0),.8,Y,sm(tWt-.3,tWt+.1,t)*(1-sm(tR+.2,tR+.6,t)),.16);
  // "every defender watches the ball": navy eye-lines from the white shirts to the ball
  eyeLines(s,c,tau,sm(tE-.1,tE+.5,t)*(1-sm(tR+.4,tR+.9,t)),.09);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),p=stateOf(MER,tau2(twos(t))),sk=solve(p.pose,B_MER,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'runs in late')+.4;},
};

// ---------------------------------------------------------------- 3 · a second replay: low beside the Germany goal, then along the line to the flag
const tau3=(t:number)=>key(t,mono([[0,TJ-.8],[CUE(2,'twist'),TF-.02],[CUE(2,'twist')+.9,TF+.2],[CUE(2,'past Manuel Neuer')+.5,TG+.2],[CUE(2,'circles')-.9,T_LOOP-1.1],[CUE(2,'like his dad')+.6,T_LOOP+LOOP_T*.8],[SECS(2),T_LOOP+LOOP_T+1.4]]),linear);
const E3:V3=[5.6,3.9,1.6],E3F:V3=[3.4,2.4,-24];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0]+.6,2.2,HP[1]+.4],fov:24})],
  [CUE(2,'twist')-.35,.8,()=>({P:E3,T:[HEAD_PT[0]+.3,HEAD_PT[1]-.2,HEAD_PT[2]+.3],fov:12})],
  [CUE(2,'past Manuel')-.3,.9,()=>({P:E3,T:[-4,1,.4],fov:38})],
  [CUE(2,'circles')-1.4,2,()=>({P:E3F,T:[FLAG[0]-1.4,1,FLAG[1]+.6],fov:22})],
  [CUE(2,'like his dad')-.4,1.2,()=>({P:E3F,T:[FLAG[0]-.6,1,FLAG[1]],fov:24})],
 ]);
}
/** the 1991 ghost: a halftone runner a third of a loop behind him, circling the same flag (a graphic for "like his dad") */
function ghostFig(tau:number,a:number):Fig[]{
 if(a<=0)return[];const u=(tau-T_LOOP)/LOOP_T-.3,ang=Math.PI*.75+u*TAU,x=FLAG[0]+Math.cos(ang)*(LOOP_R+.5),z=FLAG[1]+Math.sin(ang)*(LOOP_R+.5),vx=-Math.sin(ang),vz=Math.cos(ang);
 const pose=celebrate(u*3.2+10,{kind:'run'});return[{st:{pose,place:{x,z,yaw:yawTo(vx,vz)}},style:{...GHOST_ST,shirt:[R,.4*a],socks:[R,.35*a]},hero:true}];
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tD=CUE(2,'like his dad');
  stadium(s,c,t,[1,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tD-.2,tD+.3,t)*.8)});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),extra:ghostFig(tau,sm(tD-.4,tD+.2,t))});
  // the replay graphic: the header's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // his loop: a red dashed ring round the flag as he circles it
  groundRing(s,c,[FLAG[0],0,FLAG[1]],LOOP_R,R,sm(T_LOOP-.3,T_LOOP+.3,tau)*.9,.09);
 },
 aperture(t){const c=cam3v(t),p=stateOf(MER,tau3(twos(t))),sk=solve(p.pose,B_MER,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'past Manuel')+.3;},
};

// ---------------------------------------------------------------- 4 · the lesson: a reverse angle from above the far post, teaching marks
const tau4=(t:number)=>key(t,mono([[0,-2.8],[CUE(3,'Defenders watch'),-2.2],[CUE(3,'forget'),-1.7],[CUE(3,'Wait'),-1.3],[CUE(3,'back post')-.2,TJ],[CUE(3,'back post')+.6,TF+.02],[SECS(3),TF+.25]]),linear);
const E4:V3=[-2.5,5.4,10.5];
function cam4v(t:number):Cam{
 const tau=tau4(t),m=at(MER,tau,1);
 return plan(t,[
  [0,0,()=>({P:E4,T:[-13.5,.6,-4.5],fov:38})],
  [CUE(3,'Defenders watch')-.2,1,()=>({P:E4,T:[-11.5,.8,-5.5],fov:44})],
  [CUE(3,'Wait')-.3,1,()=>({P:add3(E4,[-.6,-.8,-.8]),T:mix3(m,[-11,1,-3],.5),fov:36})],
  [CUE(3,'back post')-.4,1,()=>({P:add3(E4,[-.6,-.8,-.8]),T:[-8,1,1.2],fov:42})],
 ]);
}
/** the empty gap behind the defenders' backs (where he arrives) and the back-post zone, as ground polygons */
const GAP_ZONE:V3[]=[[-12.5,.01,-2.4],[-7,.01,-2.4],[-7,.01,1],[-12.5,.01,1]];
const BACK_ZONE:V3[]=[[-7.5,.01,2.2],[-2.6,.01,2.2],[-2.6,.01,5.6],[-7.5,.01,5.6]];
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tA=CUE(3,'Arrive late'),tD=CUE(3,'Defenders watch'),tF=CUE(3,'forget'),tW=CUE(3,'Wait'),tB=CUE(3,'back post');
  stadium(s,c,t,[0,2,3],{roar:.35+.3*sm(tB+.5,tB+1,t)});
  ground(s,c);
  // "forget the midfielder": the gap behind their backs lights up
  const gz=sm(tF-.1,tF+.4,t);
  if(gz>0){const zone=polyP(c,GAP_ZONE);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.3*gz);s.tone(Y,zp,.4*gz);}}
  // "or the back post": the far-post zone lights up in red
  const bz=sm(tB-.2,tB+.3,t);
  if(bz>0){const zone=polyP(c,BACK_ZONE);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.3*bz);s.tone(R,zp,.36*bz);}groundRing(s,c,[-5,0,3.9],1,R,bz);}
  // "Arrive late": the waiting ring outside the box, then the run's footprints light up in order
  const wr=sm(tA-.1,tA+.4,t)*(1-sm(tB+.6,tB+1.2,t));
  groundRing(s,c,at(MER,-2.4,0),.9,Y,wr*(1-sm(tW+.2,tW+.8,t))*(.75+.25*Math.sin(t*6)),.14);
  const run=sm(tW-.1,tW+.3,t);
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<9;k++){const Tk=-1.2+k*((TJ-.2+1.2)/8),[x,z]=posOf(MER,Tk),v=velOf(MER,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.17,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);}
  // "Defenders watch the ball": eye-lines from every white shirt
  eyeLines(s,c,tau,sm(tD-.1,tD+.5,t)*(1-sm(tW+.4,tW+1,t)),.06);
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[MER,OLM,GK,5,6,...GER_IDX]});
  // the arrival: a spark as he meets it
  const hit=(tau-TF)/.2;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(55,r.ball.r*5),{n:9,seed:41,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:10});
  // his run as one arrow from the waiting spot into the gap (drawn over the players)
  const ar=sm(tW+.1,tW+1.2,t,easeInOutSine)*(1-sm(tB+.9,tB+1.4,t));
  if(ar>0){const q:V3[]=[];for(let i=0;i<=10;i++){const T=lerp(-1.3,TJ-.25,i/10*ar),[x,z]=posOf(MER,T);q.push([x,.05,z]);}arrow3(s,c,q,Math.max(16,kAt(c,[-12,0,-1.5])*.28),Y,.95);}
 },
 get still(){return CUE(3,'back post')+.3;},
};

const film:RisoStory={
 id:'merino-signature',format:'11v11',title:'Merino\'s late header',
 theme:'Arrive late: defenders watch the ball and forget the midfielder — wait outside the box, then run into the gap (or the back post) and attack the header',
 ageNote:'Spain 2–1 Germany (after extra time), Euro 2024 quarter-final, Stuttgart, 5 July 2024. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a late arrival — a ball drops in from the side, a runner's streak arrives from below, a yellow spark where they meet. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-200*(1-u):x+170*easeOut(out),by=age<.3?y-90*(1-u)*(1-u):y-30*out+50*out*out;
  if(age<.32){const k=easeOut(u),p=partial([[x-40,y+170],[x-12,y+60],[x,y+14]],k);if(p.length>1){const rb=ribbon(p,14,{taper:.8,wobble:.4});s.knockout(rb,.8);s.fill(R,rb,.9);}}
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts (pitch metres; Germany's goal line x = 0, +z = Spain's right) — checked by tests/play-film-merino-signature.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,TS0,TC,FLAG,LOOP_R,T_LOOP,LOOP_T,ballAt,crossFoot:'r' as const,passFoot:'l' as const,
 olmoContact:()=>{const st=stateOf(OLM,0),sk=solve(st.pose,B_OLM,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 cucurellaContact:()=>{const st=stateOf(CUC,TC),sk=solve(st.pose,B_CUC,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 switchContact:()=>{const st=stateOf(SW,TS0),sk=solve(st.pose,B_ESP,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 merinoAt:(tau:number)=>{const st=stateOf(MER,tau),sk=solve(st.pose,B_MER,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis,x:st.place.x??0,z:st.place.z??0};},
 germansAt:(tau:number)=>GER_IDX.map(k=>{const st=stateOf(k,tau);return[st.place.x??0,st.place.z??0] as [number,number];}),
 neuerAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_NEU,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
