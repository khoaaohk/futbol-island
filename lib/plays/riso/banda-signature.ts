/** Barbra Banda's SIGNATURE film, "the powerful finish": the only goal of the 2024 NWSL Championship final, Orlando Pride 1–0 Washington
 * Spirit, Saturday 23 November 2024 (kick-off 8:00 pm EST, a frigid night), CPKC Stadium, Kansas City, Missouri — Banda 37'. An iconic-play
 * riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction from
 * WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the powerful finish"; lesson: "Hit the ball hard and low; keepers find those
 * the hardest to stop"). This is the most decisive goal of her club career — it won Orlando their first title and made her the final's MVP —
 * and the Guardian's report describes exactly the signature: she "surged down the right wing …, cut inside and unleashed a powerful low
 * finish from the edge of the six-yard box". Her Olympic hat-tricks (2021, 2024) were considered, but no written source in reach described
 * a single one of those goals shot by shot. NOTE: the iconicPlays params say foot "right"; ESPN confirms THIS goal was LEFT-footed, so the
 * film follows the source.
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2024 NWSL Championship" (raw wikitext: date, 8:00 pm EST, CPKC Stadium, 11,500, referee Alyssa Nichols, Banda 37', MVP,
 *    line-ups with shirt numbers and positions, the kit templates — Orlando dark purple (#3b265d) with lighter purple sleeves, purple shorts
 *    and socks; Washington all yellow (#EDE939))  https://en.wikipedia.org/wiki/2024_NWSL_Championship
 *  - ESPN, Jeff Kassouf, "Barbra Banda's goal lifts Orlando Pride over Washington Spirit" (24 Nov 2024)
 *    https://www.espn.com/soccer/report/_/gameId/723586
 *  - The Guardian, Tom Dart, "Orlando Pride lift first NWSL title behind Barbra Banda's early strike" (23 Nov 2024)
 *    https://www.theguardian.com/football/2024/nov/23/orlando-pride-nwsl-final-washington-spirit-report
 *  - All for XI, Westlake & Nguyen, "NWSL Championship: Orlando Pride beats Washington Spirit in final on controversial goal" (24 Nov 2024)
 * CONFIRMED: Orlando 1–0 Washington, Banda 37'. "Banda broke the deadlock in the 37th minute when she latched onto a ball played in behind by
 * midfielder Angelina. Banda cut back inside onto her left foot and distanced herself from Spirit defender Esme Morgan to hit a left-footed
 * shot that beat Spirit goalkeeper Aubrey Kingsbury" (ESPN); "surged down the right wing in the 37th minute, cut inside and unleashed a
 * powerful low finish from the edge of the six-yard box" (Guardian); Kingsbury: "Banda got free down the flank, cut back, and I think I was
 * kind of worried about a crossing scenario" (All for XI); Angelina's push on Leicy Santos in the build-up was not given as a foul (Guardian,
 * ESPN — shown only as a tussle, never narrated). "A frigid night" (Guardian). Numbers: Orlando Banda 22, Angelina 15, Marta 10, Watt 11;
 * Washington Kingsbury 1 (keeper, captain), Morgan 24 (CB), McKeown 9 (CB), Krueger 3 (LB), Santos 10, Hershfelt 17, Rodman 2. Kits:
 * Orlando purple, Washington all yellow.
 * INFERRED (illustrative reconstruction): every position, run and timing in metres and seconds; the direction of play on screen (Orlando
 * attack the goal at x = 0, their right wing on the main-stand side); where Angelina won the ball and her passing foot (right); that Morgan
 * jockeyed goal-side and was wrong-footed by the cut (only "distanced herself" is reported); Krueger chasing from behind; Marta's and Watt's
 * support runs; the shot's line (drawn low inside Kingsbury's near post, since she had stepped across fearing a cross — the narration only
 * says "hard and low, past the keeper"); Kingsbury's dive; the keepers' kit colours (Kingsbury drawn in red); the sleeve colour (one purple
 * ink: the lighter sleeves are not separated); hair, builds and skin tones (Banda drawn with short hair and a compact, powerful build); the
 * celebration; CPKC Stadium's look (a compact, roofed, floodlit bowl) and crowd colours; the night sky; TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME: Angelina wins it and plays it ahead, Banda surges
 * down the right wing, cuts inside and smashes it low; ch2 = the slow-motion replay from a LOW camera beyond the byline at the right corner:
 * she runs straight at the lens, leaves Morgan behind (a red lag trail) and cuts in onto her left foot (a riso route + a ring on the boot);
 * ch3 = the second replay angle, super-slow, low behind her left shoulder: the plant, the swing, the ball skimming just above the grass past
 * the diving keeper into the net; ch4 = the lesson, from behind the shooter looking at the goal face: a shot at the keeper's hands (navy ghost)
 * vs the hard low shot to the bottom corner (yellow), and how far down the keeper must dive (arrow + ring).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down
 * to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, one continuous silhouette, `prev`
 * secondary motion so ponytails and hems swing, motionSmear on the sprints and strikes); women's builds (1.6–1.78 m, slimmer bulk, Banda
 * compact and strong) with ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world
 * is right-handed (x toward the goal Washington defend, y up, +z = Orlando's right = the main-stand side), athlete.ts's own convention, so
 * foot:'l' is the left foot. Inks: yellow, red, purple, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets),
 * poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,lunge,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/banda-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/banda-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final, live',text:'Kansas City, 2024, the NWSL final. Orlando Pride against Washington Spirit. Angelina plays it forward. Barbra Banda surges down the right wing, cuts inside... and smashes it in!',tail:2.4,
  cues:['Kansas City','Orlando Pride','Angelina','Barbra Banda','surges','cuts inside','smashes it']},
 {label:'The surge',text:'Watch again. Banda is strong and fast. She races away from her defender and cuts in onto her left foot.',tail:1.2,
  cues:['Watch again','strong and fast','races away','cuts in','left foot']},
 {label:'The strike',text:'Then, bang! A powerful strike, hard and low, past the keeper and into the net.',tail:1.6,
  cues:['Then','bang','powerful','hard and low','past the keeper','into the net']},
 {label:'The secret',text:'The secret? Hit the ball hard and low. Keepers find low shots the hardest to stop, because they must dive all the way down.',tail:1.9,
  cues:['The secret','Hit the ball','Keepers find','hardest','dive all the way']},
];
import timingJson from '../../../public/plays/narration/banda-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('banda: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('banda: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',PU='purple',K='navy';
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

// ---------------------------------------------------------------- CPKC Stadium on a frigid November night: a compact, roofed, floodlit bowl
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+15*b,-40-19*b],
 (a,b)=>[7+16*b,1.3+12*b,lerp(-54,54,a)],
 (a,b)=>[lerp(12,-116,a),1.3+15*b,40+19*b],
 (a,b)=>[-111-16*b,1.3+12*b,lerp(54,-54,a)],
];
const STAND_COLS=[92,60,92,60],STAND_ROWS=10;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a winter night: a heavy navy field with a purple screen over it, paper showing through the halftone
 s.field(K,.8,.6);
 const sky=new Path2D();sky.rect(-v.hx*2,-v.hy*2,v.hx*4,v.hy*4);s.tone(PU,sky,.28);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D(),lights=new Path2D(),glow=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);seg3(c,S(0,.5),S(1,.5),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.8),[0,6,0]),add3(S(0,.8),[0,6,0])]));
  seg3(c,add3(S(0,.8),[0,5.8,0]),add3(S(1,.8),[0,5.8,0]),.4,edge);
  // floodlight clusters along the roof edge
  for(let k=1;k<7;k++){const L=add3(S(k/7,.8),[0,5.4,0]),q2=toCam(c,L);if(q2[2]<NEAR)continue;const p=scr(c,q2),w=clamp(c.F*1.3/q2[2],2.5,16);
   lights.rect(p[0]-w,p[1]-w*.4,w*2,w*.8);const g=w*(2.6+1.2*flash);glow.addPath(polyPath([[p[0]-g,p[1]],[p[0],p[1]-g*.6],[p[0]+g,p[1]],[p[0],p[1]+g*.6]],true));}}
 // dark seats under the lights
 s.knockout(planes);s.tone(K,planes,.5);s.tone(PU,planes,.35);s.knockout(walk,.7);
 // the crowd: winter coats and scarves — paper faces, navy coats, red hats, Orlando purple pockets, a few Spirit yellow scarves
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.5)<.06)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.18)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.5?0:h<.64?1:h<.84?2:h<.94?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(K,inks[1],.9);s.fill(PU,inks[2],.9);s.fill(R,inks[3],.85);s.fill(Y,inks[4],.9);
 // the roof, its dark underside edge, the floodlights and their glow
 s.knockout(roof);s.fill(K,roof,.9);s.fill(K,edge,.95);
 s.tone(Y,glow,.25+.4*flash);s.knockout(lights);s.fill(Y,lights,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass under floodlights, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;bz?:number}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.85);s.tone(K,gp,.42);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: navy with purple and yellow LED panels
 const bd=new Path2D(),pn=new Path2D(),pu=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(k%3?pn:pu,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(k%3?pn:pu,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.8);s.knockout(pu,.85);s.fill(PU,pu,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(PU,flag,.95);
 goalNet(s,c,o.bulge??0,o.bz??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out where the shot went in (z ≈ bz) */
function goalNet(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bw=(z:number)=>bulge*Math.exp(-Math.pow((z-bz)/1.6,2)),back=(z:number)=>X+2+bw(z)*.7,top=(z:number)=>1.9+bw(z)*.2;
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),top(z0),z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),top(z1),z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),top(z),z],.022,mesh,.7);seg3(c,[back(z),top(z),z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const f=j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),top(zs[i])*f,zs[i]],[back(zs[i+1]),top(zs[i+1])*f,zs[i+1]],.022,mesh,.7);seg3(c,[X,H*f,z0],[back(z0),top(z0)*f,z0],.022,mesh,.7);seg3(c,[X,H*f,z1],[back(z1),top(z1)*f,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.5],[R,.22]],SKIN_M:InkFill[]=[[Y,.58],[R,.3]],SKIN_D:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Orlando Pride: purple shirt, shorts and socks (kit template, this match), paper numbers; Washington Spirit: all yellow, navy numbers */
const orl=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:PU,shorts:PU,socks:PU,boots:K,skin:SKIN_M,hair:K,line:K,trim:[PU,.5],numberInk:'paper',shade:[K,.3],hairStyle:'ponytail',build:W_BUILD(1.66),...o});
const spi=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:Y,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
/** Banda: No. 22, compact and powerful (a former boxer), short hair (inferred) */
const BANDA_B:Build={height:1.63,bulk:1.02,thighs:1.1,head:.97};
const BANDA_ST=orl({number:22,skin:SKIN_D,hair:K,hairStyle:'short',build:BANDA_B,seed:22});
const ANGELINA_ST=orl({number:15,hair:[K,.9],build:W_BUILD(1.68,.92),seed:15});
const MORGAN_ST=spi({number:24,hair:[R,.45],build:W_BUILD(1.74,.94),seed:24});
const KINGSBURY_ST:AthleteStyle={shirt:[R,.9],shorts:[K,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:'paper',build:W_BUILD(1.73,.95),seed:1};

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-13,T_MAX=9,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
const CYCLE_M=3.5;
const TABS=new Map<Path,number[]>();
function tabOf(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
const dirOf=(a:V3,b:V3):[number,number]=>{const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};

// ---------------------------------------------------------------- the goal = a Play on its own clock τ (seconds; τ = 0 is Banda's contact)
type Kick={t:number;foot:'l'|'r';power:number};
type Role='hero'|'kicker'|'keeper'|'marker'|'orl'|'spi';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;kick?:Kick;dive?:{t:number;side:'l'|'r';height:number};lunge?:{t:number;side:'l'|'r'}};
/** ball segments: carried at an actor's feet, or kicked from A to B (arc = extra height at the middle, m) */
type Seg={t0:number;t1:number;carry?:string;A?:V3;B?:V3;arc?:number;ease?:number};
type Play={actors:Actor[];segs:Seg[];M:V3;G:V3;T_SHOT:number;NET:V3;REST:V3;hero:Actor;marker:Actor;keeper:Actor};
const SD=.9;
/** the pelvis spot where a kicker's boot meets the ball at P, body turned to face dir (solved once through the skeleton) */
function kickSpot(P:V3,dir:[number,number],k:Kick,build:Build):[number,number]{
 const yaw=yawTo(0,0,dir[0],dir[1]),pose=strike(STRIKE_CONTACT,{foot:k.foot,power:k.power});
 const sk=solve(pose,build,{x:0,z:0,yaw}),toe=k.foot==='r'?sk.rToe:sk.lToe;
 return[P[0]-dir[0]*.12-toe[0],P[2]-dir[1]*.12-toe[2]];
}
const kickYaw=(dir:[number,number])=>yawTo(0,0,dir[0],dir[1]);

/** 37': Angelina wins it from Santos and plays it ahead down the right; Banda surges onto it, cuts inside away from Morgan and smashes a
 * left-footed shot low past Kingsbury from the edge of the six-yard box. */
const T_PASS=-5.6,T_REC=-4.5,T_TOUCH=-.42;
function theGoal():Play{
 const PASS_A:V3=[-45.2,.11,6.8],PASS_B:V3=[-29,.11,21],M:V3=[-6.2,.11,7.4],G:V3=[0,.24,2.6];
 const pdir=dirOf(PASS_A,PASS_B),sdir=dirOf(M,G);
 const angK:Kick={t:T_PASS,foot:'r',power:.7},banK:Kick={t:0,foot:'l',power:1};
 const PA=kickSpot(PASS_A,pdir,angK,ANGELINA_ST.build!),PH=kickSpot(M,sdir,banK,BANDA_B);
 const heroPath:Path=[[-13,-43,12.5],[-9,-41,14],[-7,-38.6,16],[T_PASS,-35.8,18.2],[T_REC,-29.6,20.8],[-3,-21,20.6],[-2,-15.2,18.8],[-1.25,-11.4,15.2],[-.6,-8.7,11.2],
  [0,PH[0],PH[1]],[.6,PH[0]+sdir[0]*1.3,PH[1]+sdir[1]*.9],[1.6,-3.4,12],[3,-4.2,17.5],[5,-6.5,22],[7,-7,23]];
 const hero:Actor={name:'Banda',role:'hero',st:BANDA_ST,kick:banK,phase:.2,path:heroPath};
 const marker:Actor={name:'Morgan',role:'marker',st:MORGAN_ST,phase:.6,lunge:{t:-1.05,side:'r'},
  path:[[-13,-31,5],[-7,-28.5,8],[T_PASS,-27,10.4],[T_REC,-24.6,13.2],[-3,-18.2,16],[-2,-12.6,17],[-1.4,-11,16.6],[-1,-10.3,16.2],[-.5,-9.6,14.4],[0,-8.6,12.6],[.6,-7.6,11.6],[2,-6.8,11.2],[4,-6.5,11]]};
 const keeper:Actor={name:'Kingsbury',role:'keeper',st:KINGSBURY_ST,phase:0,dive:{t:.2,side:'l',height:0},
  path:[[-13,-4,.5],[-5,-3.4,1.6],[-2,-2.2,2.8],[-1,-1.8,2.4],[-.3,-1.5,1.7],[0,-1.4,1.5],[3,-1.4,1.5]]};
 // a heading at τ for the last touch (the ball is pushed ahead of her into the strike)
 const hp=pathAt(heroPath,T_TOUCH),ha=pathAt(heroPath,T_TOUCH+.12),hd=Math.hypot(ha[0]-hp[0],ha[1]-hp[1])||1,TA:V3=[hp[0]+(ha[0]-hp[0])/hd*.62,.11,hp[1]+(ha[1]-hp[1])/hd*.62];
 const actors:Actor[]=[hero,marker,keeper,
  {name:'Angelina',role:'kicker',st:ANGELINA_ST,kick:angK,phase:.1,path:[[-13,-51,1],[-9,-48.6,3],[T_PASS-.9,PA[0]-pdir[0]*3.2-.6,PA[1]-pdir[1]*3.2],[T_PASS,PA[0],PA[1]],[-3.4,-41,11],[-1,-36,12.5],[3,-31,13]]},
  {name:'Santos',role:'spi',st:spi({number:10,skin:SKIN_M,hair:K,build:W_BUILD(1.6),seed:10}),phase:.5,path:[[-13,-49,5],[-9,-47.6,5.4],[-6.4,-45.8,6.1],[-5,-45.4,6.6],[-3,-44,8],[0,-40,10],[3,-37,11]]},
  {name:'Krueger',role:'spi',st:spi({number:3,hair:[Y,.7],build:W_BUILD(1.66),seed:3}),phase:.8,path:[[-13,-44,22],[-7,-39,23.6],[T_REC,-31,23.4],[-2,-19.8,21.6],[0,-12.4,18.4],[2,-9.5,15.5],[4,-9,15]]},
  {name:'McKeown',role:'spi',st:spi({number:9,hair:[K,.8],build:W_BUILD(1.73),seed:9}),phase:.3,path:[[-13,-30,-4],[-6,-25,-2],[-3,-16,-.5],[-1,-10.4,.6],[0,-8.6,1.2],[2,-7.4,1.8],[4,-7.2,2]]},
  {name:'Hershfelt',role:'spi',st:spi({number:17,hair:[Y,.8],build:W_BUILD(1.7),seed:17}),phase:.15,path:[[-13,-42,-6],[-6,-38,-1],[-3,-30,3],[0,-22,6],[3,-18,8]]},
  {name:'Rodman',role:'spi',st:spi({number:2,skin:SKIN_D,hair:K,build:W_BUILD(1.68),seed:2}),phase:.45,path:[[-13,-47,-16],[-6,-44,-13],[0,-37,-10],[3,-34,-8]]},
  {name:'Marta',role:'orl',st:orl({number:10,hair:K,build:W_BUILD(1.6),seed:10}),phase:.7,path:[[-13,-47,-9],[-7,-42,-6],[-4,-33,-3],[-1,-19,.5],[0,-15.4,1.6],[2,-10.5,5],[4,-7,12],[7,-6.8,19]]},
  {name:'Watt',role:'orl',st:orl({number:11,skin:SKIN_D,hair:K,build:W_BUILD(1.68),seed:11}),phase:.35,path:[[-13,-40,-17],[-6,-33,-14],[-2,-22,-10],[0,-17,-8],[3,-12,-2],[6,-8,10]]},
 ];
 const segs:Seg[]=[{t0:-13,t1:T_PASS,carry:'Angelina'},{t0:T_PASS,t1:T_REC,A:PASS_A,B:PASS_B,arc:.05,ease:.3},{t0:T_REC,t1:T_TOUCH,carry:'Banda'},{t0:T_TOUCH,t1:0,A:TA,B:M,arc:0,ease:.2}];
 return{actors,segs,M,G,T_SHOT:.3,NET:[1.5,.3,2.4],REST:[1.2,.11,2.2],hero,marker,keeper};
}
const G1=theGoal();

// ---------------------------------------------------------------- the ball on the play's clock
const T_NETD=.1;
function shotAt(pl:Play,u:number):V3{const e=u*(1.06-.06*u);return[lerp(pl.M[0],pl.G[0],e),lerp(pl.M[1],pl.G[1],e)+.1*Math.sin(Math.PI*e),lerp(pl.M[2],pl.G[2],e)];}
function carryAt(pl:Play,who:string,tau:number):V3{const a=pl.actors.find(x=>x.name===who)!;const p=placeOf(a,tau),ahead=pathAt(a.path,tau+.15),pp=pathAt(a.path,tau);
 const d=Math.hypot(ahead[0]-pp[0],ahead[1]-pp[1])||1,dx=(ahead[0]-pp[0])/d,dz=(ahead[1]-pp[1])/d,touch=.45+.4*Math.abs(Math.sin(tau*4.4));return[(p.x??0)+dx*touch,.11,(p.z??0)+dz*touch];}
function ballAt(pl:Play,tau:number):V3{
 if(tau<0){for(let i=0;i<pl.segs.length;i++){const s=pl.segs[i];if(tau>=s.t1&&i<pl.segs.length-1)continue;
  if(s.carry){const c=carryAt(pl,s.carry,tau),nx=pl.segs[i+1];if(nx?.A){const w=sm(s.t1-.45,s.t1,tau);return mix3(c,nx.A,w);}return c;}
  const u=clamp((tau-s.t0)/(s.t1-s.t0)),e=s.ease??.25,v=u*(1+e-e*u);const p=mix3(s.A!,s.B!,v);p[1]+= (s.arc??0)*Math.sin(Math.PI*v);return p;}
  return pl.M;}
 const T=pl.T_SHOT;if(tau<T)return shotAt(pl,tau/T);
 if(tau<T+T_NETD)return mix3(shotAt(pl,1),pl.NET,easeOut((tau-T)/T_NETD));
 const u=clamp((tau-T-T_NETD)/.55),h=pl.NET[1]*(1-u*u)+.11*u*u;return[lerp(pl.NET[0],pl.REST[0],u),Math.max(.11,h),lerp(pl.NET[2],pl.REST[2],u)];
}
const spinAt=(tau:number)=>TAU*(1.6*tau+5*Math.max(0,Math.min(tau,.4)));
const bulgeAt=(pl:Play,tau:number)=>{const tn=pl.T_SHOT+T_NETD;return tau<tn-.03?0:Math.exp(-(tau-tn+.03)*2.4)*(1+.3*Math.sin((tau-tn)*14));};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** the defender's jockey: side-on, low, knees bent, arms out for balance */
const JOCKEY=posed({lHipF:30,rHipF:8,lKnee:48,rKnee:40,lHipA:16,rHipA:16,lean:22,pitch:6,neckP:-8,lShA:36,rShA:36,lShF:8,rShF:8,lElb:40,rElb:40});
const ARMS_UP=posed({lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,lHand:1,rHand:1,neckP:-32,lean:-10,pitch:-3,lHipF:12,rHipF:-4,lKnee:16,rKnee:20,lHipA:8,rHipA:8});
const kickPose=(k:Kick,u:number)=>strike(u,{foot:k.foot,power:k.power});
function placeOf(a:Actor,tau:number):Place{const[x,z]=pathAt(a.path,tau);return{x,z,yaw:0};}
/** one actor's pose + place at τ (it = idle clock). Orlando celebrate after the goal; Washington slump. */
function actorAt(pl:Play,a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(pl,tau),tn=pl.T_SHOT+T_NETD;
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(tabOf(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 const run=runCycle(ph,{speed:clamp((sp-1)/5.5)});
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),run,sm(.5,2,sp));
 const orlSide=a.st.shirt===PU;
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);yaw=yawTo(x,z,ball[0],ball[2]);
  if(a.dive){const D=.8,t0=a.dive.t-.55*D;if(tau>t0){const u=clamp((tau-t0)/D);kp=blendPose(kp,keeperDive(u,{side:a.dive.side,height:a.dive.height}),sm(t0,t0+.1,tau));yaw=lerpAng(yaw,yawTo(x,z,pl.M[0],pl.M[2]),sm(t0,t0+.1,tau));}}
  if(tau>2.4)kp=blendPose(kp,SLUMP,sm(2.4,3,tau)*.5);
  return{pose:kp,place:{x,z,yaw}};
 }
 if(a.role==='hero'||a.role==='kicker'){
  const k=a.kick!,c=STRIKE_CONTACT;
  const u=c+(tau-k.t)/SD;
  if(u>0&&u<1.15){const w=sm(0,.14,u)*(a.role==='hero'?1:1-sm(.85,1.1,u));const dir=dirOf(a===pl.hero?pl.M:ballAt(pl,k.t-.01),a===pl.hero?pl.G:ballAt(pl,k.t+.2));
   p=blendPose(p,kickPose(k,clamp(u)),w);yaw=lerpAng(yaw,kickYaw(dir),Math.max(w,sm(k.t-.5,k.t-.2,tau)*(1-sm(k.t+.4,k.t+.8,tau))));}
  if(a.role==='hero'&&tau>k.t+(1-c)*SD){
   const d=distAt(tabOf(a.path),tau);p=blendPose(kickPose(k,1),celebrate(d/4.2,{kind:'run'}),sm(k.t+(1-c)*SD,k.t+(1-c)*SD+.4,tau));
   if(tau>2.6)p=blendPose(p,ARMS_UP,clamp(1-sp/3)*sm(2.6,3.6,tau));
   yaw=lerpAng(yaw,heading,sm(.5,1,tau));
  }
  if(a.role==='kicker'&&tau>tn+.3&&sp<1.2)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(tn+.3,tn+.8,tau)*.9);
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.role==='marker'){
  // jockeying goal-side (facing Banda) until the cut, then the lunge the wrong way, then the chase
  const bp=pathAt(pl.hero.path,tau),jw=sm(-4,-3,tau)*(1-sm(-1.3,-1,tau));
  if(jw>0){p=blendPose(p,blendPose(JOCKEY,run,sm(3,6,sp)*.6),jw);yaw=lerpAng(yaw,yawTo(x,z,bp[0],bp[1]),jw);}
  if(a.lunge){const u=clamp((tau-a.lunge.t+.45)/.8);if(u>0&&tau<.2){const w=sm(0,.15,u)*(1-sm(-.3,.2,tau));p=blendPose(p,lunge(u,{side:a.lunge.side}),w);yaw=lerpAng(yaw,yawTo(x,z,bp[0],bp[1]),w);}}
 }
 if(sp<1.4)yaw=lerpAng(yaw,toBall,.8);
 if(tau>tn+.2&&sp<1.2){if(orlSide)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(tn+.2,tn+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(tn+.2,tn+.9,tau)*.6);}
 if(tau>tn&&orlSide&&sp<1.2){const r=pathAt(pl.hero.path,tau);yaw=lerpAng(yaw,yawTo(x,z,r[0],r[1]),.8);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the surge, the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,pl:Play,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(pl,tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 {const sh:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[P[0]+Math.cos(a)*.16,0,P[2]+Math.sin(a)*.13]);if(p)sh.push(p);}if(sh.length>8)s.tone(K,polyPath(sh,true),.32);}
 if(o.lines&&o.prev!==undefined){const a=pr(c,ballAt(pl,o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*1.2)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:PU,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,pl:Play,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(p:Place,h=1.8)=>{const q=toCam(c,[p.x??0,.9,p.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const tn=pl.T_SHOT+T_NETD;
 for(const a of pl.actors){const cur=actorAt(pl,a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(pl,a,tpPrev,e.it-1/12);
  const big=a.role==='hero'||a.role==='kicker'||a.role==='keeper'||a.role==='marker';
  const fast=a.role==='hero'?tp>-4.8&&tp<2.5:a.role==='kicker'?Math.abs(tp-a.kick!.t)<.5:a.role==='keeper'?tp>-.3&&tp<tn+.6:a.role==='marker'&&tp>-1.6&&tp<.6;
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,big),cur.place,prev,!!e.smear&&fast);}});}
 const bq=toCam(c,ballAt(pl,tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,pl,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times) + riso diagram marks
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch) */
function panTarget(pl:Play,tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(pl,tau-i*.12);x+=p[0];y+=p[1];z+=p[2];}return[x/5,Math.min(1.6,y/5)*.5+.7,z/5];}
const posOf=(a:Actor,tau:number):V3=>{const[x,z]=pathAt(a.path,tau);return[x,0,z];};
/** a ring on the grass (radius rm metres) around a ground point */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number,cov=.95,dashed=false){if(u<=.02)return;const pts:Pt[]=[];const r=rm*(.75+.25*u);
 for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[P[0]+Math.cos(a)*r,.02,P[2]+Math.sin(a)*r]);if(q)pts.push(q);}if(pts.length<20)return;
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<10;i++)gaps.push([(i+.55)/10,(i+.95)/10]);
 const w=Math.max(4,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2,gaps});s.knockout(rr,.9*u);s.fill(ink,rr,cov*u);}
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number,dashed=false){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<9;i++)gaps.push([(i+.55)/9,(i+.95)/9]);
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2,gaps});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** a runner's route on the grass between two τs (a riso replay trail), ink + width in metres */
function trail(s:Sheet,c:Cam,a:Actor,t0:number,t1:number,fade:number,ink:string,wm=.3,dashed=false){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=20;i++){const[x,z]=pathAt(a.path,lerp(t0,t1,i/20)),q=pr(c,[x,.02,z]);if(q)pts.push(q);}
 if(pts.length<3)return;const[x1,z1]=pathAt(a.path,t1),w=Math.max(8,kAt(c,[x1,0,z1])*wm),gaps:[number,number][]=[];if(dashed)for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);
 s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0,gaps}),.45*fade);s.fill(ink,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0,gaps}),.9*fade);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** the shot's line along the grass (from contact to the net), drawn up to τ: a low yellow band */
function shotBand(s:Sheet,c:Cam,pl:Play,tau:number,fade:number,ink=Y){
 if(tau<=.01||fade<=.02)return;const pts:Pt[]=[],n=14,u1=clamp(tau/pl.T_SHOT);for(let i=0;i<=n;i++){const P=shotAt(pl,u1*i/n),q=pr(c,[P[0],.03,P[2]]);if(q)pts.push(q);}if(pts.length<3)return;
 const w=Math.max(6,kAt(c,mix3(pl.M,pl.G,.5))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.3,pressure:.2,wobble:0}),.45*fade);s.fill(ink,ribbon(pts,w,{taper:.3,pressure:.2,wobble:0}),.92*fade);}
const kickFx=(s:Sheet,c:Cam,tau:number,big:number)=>{const k=sm(-.04,0,tau)*(1-sm(.1,.3,tau));if(k>0){const q=pr(c,G1.M);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,G1.M)*big)*k,{n:9,seed:22,width:7});}};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
const P1:V3=[-28,18,74];
const tS1=()=>CUE(0,'smashes it')+.15;
const tau1=(t:number)=>Math.max(-12.9,t-tS1());
function cam1(t:number):Cam{
 const tau=tau1(t),h=G1.hero;
 return plan(t,[
  [0,0,()=>({P:P1,T:add3(panTarget(G1,tau),[3,0,-3]),fov:13})],
  [CUE(0,'Barbra Banda')-.6,1.4,()=>({P:P1,T:add3(panTarget(G1,tau),[4,0,-3]),fov:11})],
  [tS1()-1.6,1.1,()=>({P:P1,T:[-8.5,1.2,8.5],fov:10})],
  [tS1()+.9,1.6,()=>({P:P1,T:add3(posOf(h,tau),[0,1,0]),fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+G1.T_SHOT+T_NETD;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(G1,tau),bz:G1.G[2]});
  play(s,c,G1,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=add3(posOf(G1.hero,tau1(t)),[0,1.1,0]),q=pr(c,P)??[0,0];return apertureDisc(q[0],q[1],Math.max(30,kAt(c,P)*.9),12);},
 still:10,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a LOW camera beyond the byline at the right corner: the surge + the cut
const tau2=(t:number)=>key(t,mono([[0,-3.7],[CUE(1,'strong and fast'),-3.15],[CUE(1,'races away'),-2.3],[CUE(1,'cuts in'),-1.35],[CUE(1,'left foot'),-.75],[SECS(1),-.45]]),linear);
const E2:V3=[4.2,1.35,19];
function cam2v(t:number):Cam{
 const tau=tau2(t),h=add3(posOf(G1.hero,tau),[0,1,0]);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(h,[-18,1,18],.3),fov:13})],
  [CUE(1,'races away')-.3,1.2,()=>({P:add3(E2,[0,0,-.8]),T:mix3(h,posOf(G1.marker,tau),.3),fov:15})],
  [CUE(1,'cuts in')-.3,1.1,()=>({P:add3(E2,[-.3,-.1,-1.6]),T:mix3(h,[-7,.8,8.5],.25),fov:19})],
  [CUE(1,'left foot')-.2,.9,()=>({P:add3(E2,[-.6,-.15,-2.2]),T:mix3(h,G1.M,.35),fov:17})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2v(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tR=CUE(1,'races away'),tC=CUE(1,'cuts in'),tL=CUE(1,'left foot');
  stadium(s,c,t,[0,3,2]);
  ground(s,c);
  const h=G1.hero,mk=G1.marker;
  // "races away": her surge traced on the grass in yellow; the defender's lagging route in red (dashed)
  trail(s,c,h,-3.6,Math.min(tau,0),sm(tR-.3,tR+.3,t),Y,.3);
  trail(s,c,mk,-2.2,Math.min(tau,0),sm(tC-.1,tC+.4,t),R,.2,true);
  // "cuts in": a curved arrow on the grass across the defender's front, from the wing to the shooting spot
  const ca=sm(tC-.15,tC+.45,t,easeOut)*(1-sm(tL+.3,tL+.8,t));
  if(ca>.02){const A=posOf(h,-1.6),Bm:V3=[-10.1,.03,12.4],E=mix3(Bm,[G1.M[0]-.6,.03,G1.M[2]+.8],ca);arrow3(s,c,[[A[0],.03,A[2]],Bm,E],Math.max(8,kAt(c,Bm)*.13),Y,.95);}
  play(s,c,G1,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:60});
  // "left foot": a ring on her left boot
  const lf=sm(tL-.1,tL+.35,t,easeOutBack);if(lf>.02){const at=actorAt(G1,h,tp,tt),sk=solve(at.pose,BANDA_B,at.place);ring3(s,c,sk.lAn,.28,lf,Y,41);}
 },
 aperture(t){const c=cam2v(t),P=add3(posOf(G1.hero,tau2(t)),[0,1,0]),q=pr(c,P)??[0,0];return apertureDisc(q[0],q[1],Math.max(40,kAt(c,P)*.8),12);},
 still:5,
};

// ---------------------------------------------------------------- 3 · second replay angle, super-slow, low behind her left shoulder: the strike
const tau3=(t:number)=>key(t,mono([[0,-.55],[CUE(2,'bang'),-.06],[CUE(2,'powerful'),.04],[CUE(2,'hard and low'),.14],[CUE(2,'past the keeper'),.26],[CUE(2,'into the net'),.42],[SECS(2),1.5]]),linear);
const E3:V3=[-13,1.1,12.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),h=add3(posOf(G1.hero,tau),[0,.9,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(h,G1.M,.35),fov:28})],
  [CUE(2,'bang')-.3,.6,()=>({P:add3(E3,[.5,-.1,-.3]),T:mix3(h,G1.M,.55),fov:22})],
  [CUE(2,'hard and low')-.2,1.1,()=>({P:add3(E3,[1.2,-.15,-.7]),T:[-2.2,.5,3.6],fov:24})],
  [CUE(2,'into the net')+.1,1.4,()=>({P:add3(E3,[1.6,.1,-.9]),T:mix3(h,[-1.5,.8,3],.5),fov:28})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tH=CUE(2,'hard and low');
  stadium(s,c,t,[0,1],{roar:sm(.45,.9,tau),flash:sm(.45,.7,tau)*(1-sm(1.3,1.5,tau))});
  ground(s,c,{bulge:bulgeAt(G1,tau),bz:G1.G[2]});
  // "hard and low": the ball's line skims the grass in yellow
  shotBand(s,c,G1,Math.min(tau,G1.T_SHOT),sm(tH-.2,tH+.3,t));
  play(s,c,G1,tau,tp,tpp,{it:tt,smear:true,minBall:10,lines:true,prevT:tau3(t-.05),hero:'high',only:50});
  kickFx(s,c,tau,.7);
 },
 aperture(t){const c=cam3v(t),q=pr(c,ballAt(G1,tau3(t)))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: hard + low → a shot at the hands is easy → the low corner is hardest → the keeper must dive all the way down
const tau4=(t:number)=>{const h=CUE(3,'Hit the ball'),k=CUE(3,'Keepers find'),a=CUE(3,'hardest'),d=CUE(3,'dive all the way');
 return key(t,mono([[0,-1.1],[h,-.5],[h+.9,-.12],[k+.4,-.04],[a,-.01],[d,.1],[d+.9,.3],[SECS(3),.48]]),linear);};
const E4:V3=[-12.5,1.8,11];
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E4,T:[-4,.9,5],fov:32})],
  [CUE(3,'Keepers find')-.3,1,()=>({P:add3(E4,[.6,-.1,-.6]),T:[-1.5,1,2.4],fov:26})],
  [CUE(3,'dive all the way')-.3,1,()=>({P:add3(E4,[1.2,-.3,-1]),T:[-.8,.7,2.6],fov:24})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tHt=CUE(3,'Hit the ball'),tK=CUE(3,'Keepers find'),tA=CUE(3,'hardest'),tD=CUE(3,'dive all the way');
  stadium(s,c,t,[0,1]);
  ground(s,c,{bulge:bulgeAt(G1,tau),bz:G1.G[2]});
  const kp=G1.keeper,KP=posOf(kp,Math.min(tp,-.2));
  // 2 · a shot at the keeper's hands is easy: a navy ghost ball path rising to her chest, a dashed red ring round her hands
  const kf=sm(tK-.1,tK+.45,t)*(1-sm(tD+.2,tD+.8,t));
  if(kf>.02){const hands:V3=[KP[0]-.2,1.15,KP[2]],pts:Pt[]=[];for(let i=0;i<=14;i++){const u=i/14*kf,P=mix3(G1.M,hands,u);P[1]+=.35*Math.sin(Math.PI*u);const q=pr(c,P);if(q)pts.push(q);}
   if(pts.length>2){const w=Math.max(6,kAt(c,hands)*.09),gaps:[number,number][]=[];for(let i=0;i<7;i++)gaps.push([(i+.6)/7,(i+.95)/7]);const rr=ribbon(pts,w,{taper:.2,wobble:0,gaps});s.knockout(rr,.6*kf);s.fill(K,rr,.85*kf);}
   ring3(s,c,hands,.42,sm(tK+.2,tK+.6,t)*(1-sm(tD+.2,tD+.8,t)),R,51,true);}
  // 3 · hardest: the bottom corner, a yellow target ring on the grass inside the post, and the low line to it
  const ha=sm(tA-.1,tA+.45,t,easeOutBack);
  if(ha>.02){groundRing(s,c,[0,0,G1.G[2]],.55,ha,Y,31);shotBand(s,c,G1,G1.T_SHOT*sm(tA-.1,tA+.5,t),ha);}
  // 1 · hit the ball: a ring on the striking boot + the ball at contact
  const hb=sm(tHt-.1,tHt+.35,t,easeOutBack)*(1-sm(tK,tK+.5,t));
  if(hb>.02){const at=actorAt(G1,G1.hero,tp,tt),sk=solve(at.pose,BANDA_B,at.place);ring3(s,c,sk.lAn,.3,hb,Y,41);}
  play(s,c,G1,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau4(t-.05),only:46});
  kickFx(s,c,tau,.5);
  // 4 · dive all the way down: a red arrow from the keeper's head height down to the low corner
  const dv=sm(tD-.1,tD+.5,t,easeOut);
  if(dv>.02){const top:V3=[KP[0]+.1,1.75,KP[2]+.2],end:V3=[KP[0]+.3,.25,G1.G[2]+.3];arrow3(s,c,[top,mix3(top,end,.5*dv),mix3(top,end,dv)],Math.max(7,kAt(c,top)*.11),R,.95);}
 },
 still:9,
};

const film:RisoStory={
 id:'banda-signature',format:'11v11',title:"Banda's strike",
 theme:'The powerful finish: hit the ball hard and low — keepers find low shots the hardest to stop',
 ageNote:'Orlando Pride 1–0 Washington Spirit, NWSL Championship final, CPKC Stadium, Kansas City, 23 November 2024 — Barbra Banda’s winner in the 37th minute. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',purple:'#765ba7',navy:'#22366b'},order:['yellow','red','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little low drive — a yellow band skims the grass into a ring, a spark on the strike. Reduced motion: the still line. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.4)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const path:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*u;path.push([x-150+150*k,y+36-36*k+6*Math.sin(Math.PI*k)]);}
  s.fill(Y,ribbon(path,12,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  if(u>.9){const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push([x+Math.cos(a)*32,y+Math.sin(a)*14]);}s.fill(PU,ribbon(pts,7,{close:true,seed,taper:0,wobble:1.2}),.9*fade);}
  if(age>0&&age<.3)sparkBurst(s,Y,x-150,y+36,60,{n:8,seed,g:1-clamp(age/.3),width:8});
  const e=path[path.length-1];footballPanels(s,e[0],e[1],22,{rot:age*24+r()*TAU,key:K,shadow:PU,seed:5});
 },
};
export default film;
