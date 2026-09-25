/** Nemanja Vidić — SIGNATURE: "attacking the ball in the air" (lib/town/iconicPlays.json: kind "signature", lesson "Go to meet the ball
 * instead of waiting for it; clear it high and wide."). THE MOMENT: Manchester United 1–1 Chelsea (United won 6–5 on penalties), UEFA
 * Champions League final, Luzhniki Stadium, Moscow, Wednesday 21 May 2008 (22:45 local kick-off) — the 22nd minute, 0–0: Frank Lampard
 * sends a diagonal ball from the left wing toward Didier Drogba, and Vidić, instead of waiting for Edwin van der Sar to come for it,
 * attacks it and heads it behind for a corner (Lampard takes it, Terry leaps, it goes wide). An iconic-play riso film (RisoStory,
 * chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from
 * WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print. The Luzhniki, kits and camera language follow
 * van-der-sar-anelka-2008.ts and ferdinand-signature.ts (the same match, read-only) — dry here, as in the Ferdinand film: the rain had
 * stopped before kick-off and came back in extra time.
 *
 * WHY THIS MOMENT: the signature is attacking the ball in the air — going to meet a high ball instead of letting it drop. Two independent
 * live accounts of the same final describe exactly that, in the biggest club game of his career: the BBC says he "opts against waiting for
 * the keeper and heads it behind", the Guardian that he "intercepts" Lampard's ball meant for Drogba "and puts it out for a corner". The
 * BBC also logs two more Vidić clearing headers from Malouda crosses that night (19:49 "Vidic is there to head clear"; 21:00 "a
 * well-judged clearing header") — the pattern of his whole evening — but only the 22nd-minute one is described beat by beat in two sources.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/ — no new fetches were needed):
 *  - BBC Sport, Ben Dirs, "Champions League final as it happened", 21 May 2008  http://news.bbc.co.uk/sport2/hi/football/europe/7410307.stm
 *    [bbc-7410307.txt] UK times, kick-off 19:45 BST: "2008: Panic in the United defence as Frank Lampard's cross comes over. Nemanja Vidic
 *    opts against waiting for the keeper and heads it behind for the corner. Nothing from it."; "1949: Florent Malouda ... whips in a dangerous
 *    cross - but Nemanja Vidic is there to head clear"; "2100: Nemanja Vidic comes to United's rescue with a well-judged clearing header from
 *    Florent Malouda's cross"; line-ups ("Van der Sar, Brown, Ferdinand, Vidic, Evra, ...").
 *  - The Guardian, Barry Glendenning, "Man Utd v Chelsea — as it happened", 21 May 2008
 *    https://www.theguardian.com/football/2008/may/21/championsleague.manchesterunited6  [guardian-mbm-manutd-chelsea-2008.txt]
 *    "22 min: Frank Lampard sends a diagonal ball towards Didier Drogba from the left wing, but Nemanja Vidic intercepts and puts it out for
 *    a corner. Lampard sends the ball into the mixer, where Terry leaps highest. The ball is too high for him and ends up going wide."
 *    Line-ups with numbers (Van der Sar 1, Brown 6, Ferdinand 5, Vidić 15, Evra 3; Chelsea: Lampard 8, Drogba 11, Terry 26, ...).
 *  - Wikipedia (raw wikitext), "2008 UEFA Champions League final" [wiki-2008-ucl-final.txt]: date, venue, 22:45 Moscow kick-off, 0–0 until
 *    Ronaldo's 26th-minute header, the kit boxes (United red shirts, white shorts, white socks; Chelsea all blue), positions (Chelsea: Malouda
 *    LW, J. Cole RW, Drogba CF; United 4-4-2 with Ferdinand and Vidić in the middle).
 *  - (via the Ferdinand film's notes, same BBC page) "It's finally stopped raining" before kick-off — so the first half is dry, the turf soaked.
 * CONFIRMED by those sources: the match, place, date, night kick-off; the 22nd minute (BBC 20:08 BST ≈ 23'), 0–0; Lampard (No. 8) put the ball
 *  in from the LEFT wing (Chelsea's left), a diagonal/crossed ball, aimed toward Drogba (No. 11); Vidić (No. 15) did not wait for the keeper
 *  (Van der Sar, No. 1) — he attacked it and headed it behind for a corner; Lampard took the corner, Terry (No. 26) rose highest and headed
 *  wide. Kits: United red / white / white, Chelsea all blue. Dry at the time (rain stopped before kick-off).
 * INFERRED / ILLUSTRATIVE (never named in the narration): which end on screen (United's goal at x = 0, the camera in the main stand) and so
 *  the side of the pitch (Chelsea's left = the far touchline); Lampard's exact spot (≈ 28 m out, wide), his crossing foot (right, his
 *  stronger), the build-up touches and the ball's height and flight time; where the ball would have dropped; Vidić's start spot, his three
 *  steps, which foot he took off from (the left, driving the right knee), the jump height and the flick of the forehead; the header's line
 *  (up and over the goal line wide of the near post); Drogba's run and his late jump; Van der Sar starting to come and stopping; the other
 *  players' spots (Ferdinand, Brown, Evra, Carrick, Scholes, Hargreaves; Ballack, J. Cole, Malouda, Makelele); Vidić's shaved
 *  hair; Van der Sar's grey kit; the damp sheen; the stadium, crowd, cameras and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME-ish (Lampard on the far wing → the high diagonal
 * ball → Vidić comes off Drogba's shoulder, charges out, jumps and heads it behind); ch2 = the slow-motion replay from a LOW camera on the
 * edge of the box, face-on to Vidić (the read, the three steps, the take-off in front of Drogba, the forehead, the ball looping up and out);
 * ch3 = the lesson on the frozen move: a red ring where the ball would have dropped if he had waited → a yellow ground arrow for "go to meet
 * it" → an up arrow for "jump early" → the clearance traced high and wide of the post. Composed on the FULL sheet (world units = sheet units
 * centred on the canvas; never sheet.safe) so it frames from the 1.45:1 card window down to square (a narrower window widens the lens).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, `prev` secondary motion, motion smear on the charge,
 * the jump and Lampard's strike); small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is
 * right-handed (x toward United's goal, y up, +z toward the main-stand camera) — athlete.ts's own convention, so Lampard's RIGHT boot is his
 * right with no mirrored projector. Inks: yellow, red, blue, navy. Poses on twos, cameras on ones; all randomness seeded. Budget ≈ 150–330
 * plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,backpedal,header,posed,keyPoses,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/vidic-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/vidic-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Moscow, live',text:"Moscow, 2008, the Champions League final. Frank Lampard sends a high ball toward Didier Drogba. Nemanja Vidić doesn't wait for his keeper. He charges out, jumps, and heads it behind. Safe!",tail:2,
  cues:['Moscow','Champions League','Frank Lampard','high ball','Didier Drogba','Nemanja','wait for','charges out','jumps','heads it behind','Safe']},
 {label:'Watch it again',text:'Watch again, slowly. Vidić reads the flight early. Three quick steps, then he takes off first, in front of Drogba, and meets it with his forehead. Up and out!',tail:1.7,
  cues:['Watch again','reads the flight','Three quick steps','takes off','in front of','meets it','Up and out']},
 {label:'The lesson',text:"That's Vidić's signature: attacking the ball in the air. Don't wait for it to come to you. Go to meet it, jump early, and clear it high and wide!",tail:2,
  cues:["That's Vidić's signature",'attacking the ball',"Don't wait",'Go to meet it','jump early','clear it','high and wide']},
];
import timingJson from '../../../public/plays/narration/vidic-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('vidic: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('vidic: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
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

// ---------------------------------------------------------------- the Luzhniki at night (dry, the turf still soaked): a navy sky, the bowl, roof ring, floodlights
/** stand planes (a along, b up the rake 0..1), set back past the running track: 0 the far side (z<0), 1 behind United's goal (x>0),
 * 2 the main stand (z>0, the camera side), 3 the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-120,15,a),1.2+28*b,-46-34*b],
 (a,b)=>[14+31*b,1.2+28*b,lerp(-62,62,a)],
 (a,b)=>[lerp(15,-120,a),1.2+24*b,46+30*b],
 (a,b)=>[-119-31*b,1.2+28*b,lerp(62,-62,a)],
];
const STAND_COLS=[110,74,110,74],STAND_ROWS=14,WALK=.47;
/** crowd colour mix per stand: [paper, red, blue, yellow] cumulative thresholds (a red end, a blue end) */
const CROWD:[number,number,number][]=[[.42,.72,.97],[.4,.95,.97],[.42,.72,.97],[.3,.36,.97]];
const FLAGS:[number,number,number][]=[[0,.5,0],[0,.62,1],[0,.76,0],[1,.2,0],[1,.36,0],[1,.52,0],[1,.68,0],[1,.84,0],[2,.14,0],[2,.3,1],[3,.3,1],[3,.46,1],[3,.62,1],[3,.76,1]];
function lampPts(which:number[]):V3[]{const o:V3[]=[];for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++)o.push(add3(S((k+.5)/7,.3),[0,23.6,0]));}return o;}
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 s.field(B,.5,.6);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.44);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-460]],true),.3);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  seg3(c,S(0,WALK),S(1,WALK),.45,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.3),[0,24.5,0]),add3(S(0,.3),[0,24.5,0])]));
  seg3(c,add3(S(0,.3),[0,24.3,0]),add3(S(1,.3),[0,24.3,0]),.45,edge);}
 s.knockout(planes);s.tone(K,planes,.52);s.tone(R,planes,.16);s.knockout(walk,.4);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mix=CROWD[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.045)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.3)/.7,ink=u<mix[0]?0:u<mix[1]?1:u<mix[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.62);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.9);
 s.knockout(roof);s.tone(K,roof,.62);s.tone(B,roof,.3);s.knockout(edge,.8);
 const fl=new Path2D(),rd=new Path2D(),bl=new Path2D(),band=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;(kind===0?rd:bl).addPath(polyPath(q,true));fl.addPath(polyPath(q,true));
  addPoly(band,polyP(c,[P(0,.034),P(1,.034),P(1,.05),P(0,.05)]));}
 s.knockout(fl);s.fill(R,rd,.95);s.fill(B,bl,.95);s.knockout(band,.9);
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.03,.3),[0,23.6,0]),b=add3(S(u+.03,.3),[0,23.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);seg3(c,a,b,4.2,halo);}}
 s.tone(Y,halo,.22);s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(18*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=8+11*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- the running track, the damp grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{lamps?:V3[]}={}){
 const tr=polyP(c,[[-119,0,-46],[14,0,-46],[14,0,46],[-119,0,46]]);if(tr.length<3)return;const tp=polyPath(tr,true);
 s.knockout(tp);s.tone(R,tp,.5);s.tone(K,tp,.3);
 const g=polyP(c,[[-110,0,-39],[5,0,-39],[5,0,39],[-110,0,39]]),gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.85);s.tone(B,gp,.8);s.tone(K,gp,.16);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // the damp sheen (it had rained all day): each lamp mirrored faintly in the turf, a short glint toward the lens
 if(o.lamps){const gl=new Path2D(),e=c.eye;
  for(const L of o.lamps){const Lm:V3=[L[0],-L[1],L[2]],k=e[1]/(e[1]-Lm[1]),Q:V3=[e[0]+(Lm[0]-e[0])*k,0,e[2]+(Lm[2]-e[2])*k];
   if(Q[0]<-108||Q[0]>4||Math.abs(Q[2])>37)continue;const toward:V3=[e[0]-Q[0],0,e[2]-Q[2]],tl=Math.hypot(toward[0],toward[2])||1,len=Math.min(6,tl*.16);
   const a=pr(c,add3(Q,[-toward[0]/tl*len*.4,0,-toward[2]/tl*len*.4])),b=pr(c,add3(Q,[toward[0]/tl*len,0,toward[2]/tl*len]));if(!a||!b)continue;
   const w=clamp(kAt(c,Q)*.3,2,7);gl.addPath(ribbon([a,b],w,{taper:.9,pressure:.4,wobble:0}));}
  s.knockout(gl,.3);s.tone(Y,gl,.25);}
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-36],[5.5,0,36]);board([-108,0,-38],[5.5,0,-38]);board([-108,0,38],[5.5,0,38]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.4],[5.4,.7,z+3.4],[5.4,.7,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.7,zz],[x,.7,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.8);s.fill(R,pn,.8);s.fill(Y,pn,.5);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,34,1,Math.PI,Math.PI*1.5,6);circ(0,-34,1,Math.PI*.5,Math.PI,6);
 s.knockout(ln,.9);
 // corner flags at United's end (navy poles, red flags)
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.5,z],.05,pole);addPoly(flag,polyP(c,[[0,1.5,z],[0,1.22,z],[-.42,1.36,z+(z>0?-.05:.05)]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof */
function goal3(s:Sheet,c:Cam){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=X+2,zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back,1.9,z0],[back,0,z0]],[[X,0,z1],[X,H,z1],[back,1.9,z1],[back,0,z1]],
  [[X,H,z0],[X,H,z1],[back,1.9,z1],[back,1.9,z0]],[[back,0,z0],[back,0,z1],[back,1.9,z1],[back,1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.28);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back,1.9,z],.022,mesh,.7);seg3(c,[back,1.9,z],[back,0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back,y,zs[i]],[back,y,zs[i+1]],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
const united=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:K,numberInk:'paper',hairStyle:'short',...o});
const chelsea=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
/** Vidić: 1.89 m, powerful, shaved head as in ferdinand-signature.ts (inferred), No. 15 */
const VID_B={height:1.89,bulk:1.07};
const VID_ST=united({number:15,hair:[K,.5],hairStyle:'bald',build:VID_B,seed:15});
const LAMP_B={height:1.84,bulk:1.02};
const LAMP_ST=chelsea({number:8,hair:[K,.6],build:LAMP_B,seed:8});
const DROG_B={height:1.88,bulk:1.08};
const DROG_ST=chelsea({number:11,skin:SKIN_D,hair:K,build:DROG_B,seed:11});
const VDS_B={height:1.97,bulk:1.02};
const VDS_ST:AthleteStyle={shirt:[K,.66],shorts:[K,.9],socks:[K,.66],boots:K,skin:SKIN_L,hair:[Y,.55],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'balding',number:1,numberInk:'paper',build:VDS_B,seed:1};

// ---------------------------------------------------------------- the move on one clock τ (seconds; τ = 0 is Vidić's forehead on the ball)
/** Vidić's jump (u 0..1): gather → take-off off the LEFT foot, right knee driving (.22) → rising, arched (.42) → CONTACT (.5, chin up,
 * the forehead flicks the ball up and over) → falling (.72) → landing on both feet (1) */
const JD=1.0,J_CONTACT=.5,T_J0=-J_CONTACT*JD,T_TO=T_J0+.22*JD,T_LAND=T_J0+JD;
const vjump=(u:number):Pose=>keyPoses(clamp(u),[
 [0,posed({lHipF:44,rHipF:8,lKnee:64,rKnee:34,lAnk:-10,rAnk:30,lean:22,pitch:6,lShF:-40,rShF:34,lShA:20,rShA:20,lElb:50,rElb:60,neckP:-22,squash:-.06})],
 [.22,posed({air:.08,lHipF:-8,lKnee:8,lAnk:44,rHipF:84,rKnee:96,rAnk:20,lShF:118,rShF:78,lShA:36,rShA:40,lElb:46,rElb:62,lean:4,pitch:0,neckP:-30,squash:.08})],
 [.42,posed({air:.6,lean:-18,pitch:-8,neckP:-30,lHipF:-18,lKnee:84,lAnk:36,rHipF:36,rKnee:100,rAnk:30,lShA:84,rShA:80,lShF:62,rShF:52,lElb:70,rElb:72})],
 [.5,posed({air:.66,lean:-10,pitch:-4,neckP:-18,lHipF:-8,lKnee:72,lAnk:36,rHipF:28,rKnee:82,rAnk:30,lShA:92,rShA:74,lShF:40,rShF:30,lElb:58,rElb:70,squash:.05})],
 [.72,posed({air:.3,lean:4,pitch:2,neckP:-8,lHipF:20,rHipF:26,lKnee:40,rKnee:46,lAnk:30,rAnk:30,lShA:62,rShA:52,lShF:22,rShF:20,lElb:50,rElb:50})],
 [1,posed({lHipF:50,rHipF:44,lKnee:66,rKnee:60,lAnk:-10,rAnk:-10,lean:22,pitch:6,lShA:34,rShA:30,lShF:16,rShF:12,lElb:44,rElb:44,neckP:-10,squash:-.08})],
]);
/** Lampard's spot on the far (left) wing, where he strikes the diagonal ball */
const LP_SET:V3=[-28,.11,-21],LB0:V3=[-33.5,.11,-23.6];
/** where Vidić meets it (roughly — refined below so his forehead is exactly there) */
const HP:[number,number]=[-7.4,1.9];
const Y_V=yawTo(HP[0],HP[1],LP_SET[0],LP_SET[2]);
const FWD:[number,number]=[Math.cos(Y_V),-Math.sin(Y_V)];
/** the contact: his place at τ = 0 and the ball's centre on his forehead (solved once, FK) */
const CONTACT:{place:[number,number];H:V3}=(()=>{const sk=solve(vjump(J_CONTACT),VID_B,{x:0,z:0,yaw:Y_V}),hd=sk.head,fc=sk.face;
 const d:V3=[fc[0]-hd[0],fc[1]-hd[1],fc[2]-hd[2]],l=Math.hypot(d[0],d[1],d[2])||1,off:V3=[hd[0]+d[0]/l*.2,hd[1]+d[1]/l*.2+.1,hd[2]+d[2]/l*.2];
 return{place:[HP[0]-off[0],HP[1]-off[2]],H:[HP[0],off[1],HP[1]]};})();
const H=CONTACT.H,VC=CONTACT.place;
/** the charge: from goal-side of the drop (V0), three quick steps forward to the take-off spot, a little drift in the air */
const V0:[number,number]=[VC[0]-FWD[0]*2.7+.2,VC[1]-FWD[1]*2.7+.4];
const T_GO=-1.12;
const vPlaceAt=(tau:number):[number,number]=>{
 if(tau<T_GO)return V0;
 if(tau<T_TO){const u=sm(T_GO,T_TO,tau,easeInOutSine),e:[number,number]=[VC[0]-FWD[0]*.28,VC[1]-FWD[1]*.28];return[lerp(V0[0],e[0],u),lerp(V0[1],e[1],u)];}
 const u=clamp((tau-T_TO)/(T_LAND-T_TO));return[VC[0]+FWD[0]*(-.28+.5*u),VC[1]+FWD[1]*(-.28+.5*u)];
};
/** Lampard's diagonal: a long, lofted ball (2.2 s) — without Vidić it would drop by DROP, between Drogba and the keeper */
const FLY=2.2,T_PASS=-FLY,APEX=5.6;
/** after the header: up, over the goal line wide of the near post (≈ 3.9 m high there), a bounce behind the line toward the boards */
const O1:V3=[3.3,.11,9.2],O2:V3=[4.9,.11,10.4],T_O1=1.45,T_O2=2.3;
const flight=(u:number):V3=>{const p=mix3(LP_SET,H,u);p[1]+=APEX*4*u*(1-u);return p;};
/** where the ball would have dropped had he waited (the flight carried on) */
const DROP:V3=(()=>{let u=1;for(;u<1.6;u+=.01){const p=mix3(LP_SET,H,u);if(p[1]+APEX*4*u*(1-u)<.3)break;}const p=mix3(LP_SET,H,u);return[p[0],.02,p[2]];})();
const T_DRIB=-4.6;
function ballAt(tau:number):V3{
 if(tau<=T_DRIB)return LB0;
 if(tau<T_PASS-.35){const u=(tau-T_DRIB)/(T_PASS-.35-T_DRIB);return mix3(LB0,LP_SET,easeOut(u));}
 if(tau<T_PASS)return LP_SET;
 if(tau<0)return flight((tau-T_PASS)/FLY);
 if(tau<T_O1){const u=tau/T_O1,p=mix3(H,O1,u);p[1]+=3.5*4*u*(1-u);return p;}
 if(tau<T_O2){const u=(tau-T_O1)/(T_O2-T_O1),p=mix3(O1,O2,easeOut(u));p[1]=.11+.8*Math.max(0,Math.sin(u*Math.PI))*(1-u*.4);return p;}
 const u=clamp((tau-T_O2)/1.2);return mix3(O2,add3(O2,[.4,0,.5]),easeOut(u));
}
const spinAt=(tau:number)=>tau<T_PASS?tau*3:tau<0?-TAU*1.4*(tau-T_PASS):TAU*1.4*FLY+TAU*3*tau;

// ---------------------------------------------------------------- Vidić: set goal-side, the read, three quick steps, the leap, the flick, down
const P_READY=posed({lHipF:30,rHipF:22,lKnee:40,rKnee:34,lAnk:-6,rAnk:-4,lHipA:10,rHipA:10,lean:16,pitch:4,neckP:-26,lShA:30,rShA:28,lShF:10,rShF:14,lElb:50,rElb:54});
function vidicAt(tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=vPlaceAt(tau);let p:Pose,yaw=Y_V;
 if(tau<T_GO){
  // goal-side, on his toes, eyes on the ball: a small shuffle while Lampard shapes, then set
  p=blendPose(backpedal(it*1.1),P_READY,.55+.45*sm(T_PASS-.6,T_PASS+.3,tau));
  const b=ballAt(tau);yaw=lerpAng(yawTo(x,z,b[0],b[2]),Y_V,.35);
 }else if(tau<T_J0){
  // the charge: three quick steps (a sprint cycle), leaning in
  const ph=(tau-T_GO)*2.3;p=blendPose(P_READY,runCycle(ph,{speed:.85}),sm(T_GO,T_GO+.18,tau));
  p=blendPose(p,vjump(0),sm(T_J0-.14,T_J0,tau));
 }else if(tau<T_LAND){
  p=vjump((tau-T_J0)/JD);
 }else{
  // down: steady, then he turns to watch the ball go out
  p=blendPose(vjump(1),stand(),sm(T_LAND,T_LAND+.6,tau));
  const b=ballAt(Math.min(tau,T_O2));yaw=lerpAng(Y_V,yawTo(x,z,b[0],b[2]),sm(T_LAND,T_LAND+.8,tau));
  if(tau>T_O2){p=blendPose(p,runCycle(it*1.2,{speed:.15,stride:.5}),sm(T_O2,T_O2+.5,tau)*.6);}
 }
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- Lampard: a few touches down the left, the strike (right foot), then he jogs in
const Y_PASS=yawTo(LP_SET[0],LP_SET[2],H[0],H[2]);
const PASS_DIR:[number,number]=[Math.cos(Y_PASS),-Math.sin(Y_PASS)];
const LP_POW=.8,LP_SD=.85,LP_RUN_END=T_PASS-STRIKE_CONTACT*LP_SD;
/** where his pelvis stands at the strike so the RIGHT boot meets the ball at LP_SET (solved once, FK) */
const LP_C:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:LP_POW}),LAMP_B,{x:0,z:0,yaw:Y_PASS});return[LP_SET[0]-PASS_DIR[0]*.1-sk.rToe[0],LP_SET[2]-PASS_DIR[1]*.1-sk.rToe[2]];})();
const Y_DRIB=yawTo(LB0[0],LB0[2],LP_SET[0],LP_SET[2]);
function lampardAt(tau:number,it:number):{pose:Pose;place:Place}{
 if(tau<LP_RUN_END){const b=ballAt(Math.min(tau,T_PASS-.4)),dir:[number,number]=[Math.cos(Y_DRIB),-Math.sin(Y_DRIB)];
  const u=sm(LP_RUN_END-.7,LP_RUN_END,tau),x=lerp(b[0]-dir[0]*.6,LP_C[0]-PASS_DIR[0]*.9,u),z=lerp(b[2]-dir[1]*.6,LP_C[1]-PASS_DIR[1]*.9,u);
  return{pose:dribble(it*1.9,{foot:'r',speed:.45}),place:{x,z,yaw:lerpAng(Y_DRIB,Y_PASS,u)}};}
 if(tau<T_PASS+.8){const us=STRIKE_CONTACT+(tau-T_PASS)/LP_SD,g=clamp((tau-LP_RUN_END)/(T_PASS+.8-LP_RUN_END));
  return{pose:blendPose(dribble(it*1.9,{foot:'r',speed:.45}),strike(clamp(us),{power:LP_POW}),sm(LP_RUN_END,LP_RUN_END+.12,tau)),place:{x:LP_C[0]-PASS_DIR[0]*.9*(1-g)+PASS_DIR[0]*.4*g,z:LP_C[1]-PASS_DIR[1]*.9*(1-g)+PASS_DIR[1]*.4*g,yaw:Y_PASS}};}
 const d=(tau-T_PASS-.8)*3.2,x=LP_C[0]+PASS_DIR[0]*(.4+d),z=LP_C[1]+PASS_DIR[1]*(.4+d);
 return{pose:blendPose(strike(1,{power:LP_POW}),runCycle(it*1.5,{speed:.4}),sm(T_PASS+.8,T_PASS+1.1,tau)),place:{x,z,yaw:Y_PASS}};
}

// ---------------------------------------------------------------- Drogba: the run the ball was meant for; a late jump behind Vidić, then he turns away
const DG1:[number,number]=[VC[0]+.9,VC[1]+1.5],DG0:[number,number]=[DG1[0]-6.6,DG1[1]-4.2];
const T_DG=-2.5,DG_J0=-.36;
function drogbaAt(tau:number,it:number):{pose:Pose;place:Place}{
 const run=sm(T_DG,DG_J0+.1,tau,linear),x=lerp(DG0[0],DG1[0],run),z=lerp(DG0[1],DG1[1],run),b=ballAt(Math.min(tau,T_O1));
 if(tau<T_DG)return{pose:blendPose(stand(),runCycle(it*1.1,{speed:.1}),.4),place:{x:DG0[0],z:DG0[1],yaw:yawTo(DG0[0],DG0[1],LP_SET[0],LP_SET[2])}};
 let p=runCycle(it*1.5+.3,{speed:.7});
 // looks over his shoulder for the ball, then jumps too late: his header timeline runs behind Vidić's and lower
 const hj=clamp((tau-DG_J0)/.95);if(tau>DG_J0-.1){p=blendPose(p,header(hj),sm(DG_J0-.1,DG_J0+.05,tau));p.air*=.55;}
 if(tau>.62)p=blendPose(p,stand(),sm(.62,1.1,tau));
 const yRun=yawTo(DG0[0],DG0[1],DG1[0],DG1[1]),yBall=yawTo(x,z,b[0],b[2]);
 return{pose:p,place:{x,z,yaw:lerpAng(yRun,yBall,sm(-1.1,-.3,tau))}};
}

// ---------------------------------------------------------------- Van der Sar: starts to come, sees Vidić go, holds
function vdsAt(tau:number,it:number):{pose:Pose;place:Place}{
 const come=sm(-1.5,-.8,tau)*(1-.35*sm(-.7,-.1,tau)),x=lerp(-1.3,-2.6,come),z=lerp(1.1,2.1,come),b=ballAt(Math.min(tau,T_O1));
 let p=keeperSet(it*1.2);if(tau>-1.5&&tau<-.6)p=blendPose(p,runCycle(it*1.4,{speed:.3}),sm(-1.5,-1.3,tau)*(1-sm(-.9,-.6,tau)));
 return{pose:p,place:{x,z,yaw:yawTo(x,z,b[0],b[2])}};
}

// ---------------------------------------------------------------- everyone else (low detail): drift with the ball, then turn to follow the clearance
type Actor={name:string;st:AthleteStyle;x:number;z:number;dx:number;dz:number;i:number};
const LOWS:Actor[]=[];
{const u:[number,number,number,string,InkFill[]][]=[[5,-10.6,-6.2,'short',SKIN_D],[6,-10.2,-10.6,'short',SKIN_M],[3,-9.8,10.2,'short',SKIN_D],[16,-19.5,-4.2,'short',SKIN_L],[18,-18.4,4.6,'short',SKIN_L],[4,-22,-14.5,'short',SKIN_L]];
 u.forEach(([n,x,z,h,sk],i)=>LOWS.push({name:'United '+n,st:united({number:n,skin:sk,hairStyle:h as AthleteStyle['hairStyle'],hair:n===18?[R,.7]:[K,.85],build:{height:1.78+.03*(i%3)},seed:40+i}),x,z,dx:1.4,dz:.5,i}));
 const c:[number,number,number,string,InkFill[]][]=[[13,-15.5,4.2,'short',SKIN_L],[10,-12.8,11.5,'short',SKIN_L],[15,-13.4,-8.8,'short',SKIN_D],[4,-31,-9,'bald',SKIN_D],[26,-44,-6,'short',SKIN_L]];
 c.forEach(([n,x,z,h,sk],i)=>LOWS.push({name:'Chelsea '+n,st:chelsea({number:n,skin:sk,hairStyle:h as AthleteStyle['hairStyle'],build:{height:1.8+.03*(i%2)},seed:60+i}),x,z,dx:2.2,dz:.4,i:i+10}));}
function lowAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const drift=sm(T_PASS-1,0,tau,linear),x=a.x+a.dx*drift,z=a.z+a.dz*drift*(a.z>0?-1:1),b=ballAt(Math.min(tau,T_O2));
 const moving=tau>T_PASS-1&&tau<.2;let p=moving?runCycle(it*1.2+a.i*.13,{speed:.25}):blendPose(stand(),runCycle(a.i*.13,{speed:.1}),.3);
 if(tau>.3)p=blendPose(p,runCycle(it*1.2+a.i*.13,{speed:.2}),sm(.3,.7,tau));
 const ex=tau>.3?(tau-.3)*1.3:0,d=Math.hypot(b[0]-x,b[2]-z)||1;
 return{pose:p,place:{x:x+(b[0]-x)/d*Math.min(ex,d*.25),z:z+(b[2]-z)/d*Math.min(ex,d*.25),yaw:yawTo(x,z,b[0],b[2])}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hem trail), smear = halftone echo + speed lines on fast limbs (the charge, the leap, the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??14,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.08,.08,.5));
 if(o.lines&&o.prev!==undefined&&tau>T_PASS&&tau<T_O1){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=20):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}
/** a trail ribbon along the ball's path between two τ (paper under-knock, yellow on top) */
function trail(s:Sheet,c:Cam,ta:number,tb:number,wm:number,fade:number,n=16){if(tb-ta<.02||fade<=.02)return;const pts=pathPts(c,ta,tb,n);if(pts.length<3)return;
 const w=Math.max(7,kAt(c,ballAt(tb))*wm);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid'};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const add=(at:(tau:number,it:number)=>{pose:Pose;place:Place},st:AthleteStyle,hero:boolean,smear:(tau:number)=>boolean)=>{
  const cur=at(tp,e.it),d=visible(cur.place);if(d<0)return;
  items.push({d,draw:()=>{const prev=at(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(st,d,hero),cur.place,prev,!!e.smear&&smear(tp));}});};
 add(vidicAt,VID_ST,true,t=>t>T_GO&&t<T_LAND-.2);
 add(drogbaAt,DROG_ST,true,t=>t>DG_J0&&t<.5);
 add(lampardAt,LAMP_ST,true,t=>t>LP_RUN_END&&t<T_PASS+.3);
 add(vdsAt,VDS_ST,false,()=>false);
 for(const a of LOWS)add((t,it)=>lowAt(a,t,it),a.st,false,()=>false);
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const LAMPS_ALL=lampPts([0,1,2,3]);
/** the header burst: a yellow flash on his forehead at contact */
function headBurst(s:Sheet,c:Cam,tau:number,big=1){const hb=sm(-.03,.07,tau)*(1-sm(.2,.45,tau));if(hb<=0)return;const q=pr(c,H);if(!q)return;
 sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,H)*.8)*big*easeOutBack(clamp(hb*1.3)),{n:9,seed:21,width:Math.max(5,kAt(c,H)*.05)});}
const HM:V3=[H[0],1,H[2]];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera
/** τ keyed to the words: Lampard's touches under the opening, the strike on "high ball", the charge on "charges out", the leap on
 * "jumps", the forehead on "heads it behind", the ball out on "Safe" */
const tau1=(t:number)=>key(t,mono([[0,T_DRIB-.2],[CUE(0,'Frank Lampard'),T_PASS-1.1],[CUE(0,'high ball'),T_PASS+.05],[CUE(0,'Nemanja'),-1.3],[CUE(0,'charges out'),T_GO+.1],[CUE(0,'jumps'),T_TO-.02],[CUE(0,'heads it behind')+.1,.02],[CUE(0,'Safe'),T_O1+.05],[SECS(0),T_O1+.05+(SECS(0)-CUE(0,'Safe'))*.9]]),linear);
const P1:V3=[-19,13,50];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-19,1,-9],fov:18})],
  [CUE(0,'Champions League')-.2,1.3,()=>({P:P1,T:[-22,1,-12],fov:13})],
  [CUE(0,'Frank Lampard')-.3,1,()=>({P:P1,T:[-27,1,-19],fov:6})],
  [CUE(0,'high ball')+.2,1.1,()=>({P:P1,T:[lerp(b[0],HM[0],.55),lerp(b[1],1,.7),lerp(b[2],HM[2],.55)],fov:12})],
  [CUE(0,'Nemanja')-.3,1,()=>({P:P1,T:[H[0]+.8,2,H[2]+.4],fov:5.5})],
  [CUE(0,'heads it')-.1,.6,()=>({P:P1,T:[H[0]+1,2.3,H[2]+.4],fov:5})],
  [CUE(0,'heads it')+.5,1.3,()=>({P:P1,T:[-3.5,1.8,5],fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tH=CUE(0,'heads it behind'),tS=CUE(0,'Safe');
  stadium(s,c,t,[0,1,3],{roar:.6*sm(tH,tH+.5,t)+.3*sm(tS,tS+.4,t),flash:.35*sm(tH,tH+.3,t)*(1-sm(tH+2,tH+3,t))});
  ground(s,c,{lamps:LAMPS_ALL});
  play(s,c,tau,tp,tpp,{it:tt,minBall:13,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
  headBurst(s,c,tau,.8);
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(22,c.F*.5/q[2]),12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from a low camera on the edge of the box, face-on to Vidić
const tau2=(t:number)=>key(t,mono([[0,-1.75],[CUE(1,'reads the flight'),-1.4],[CUE(1,'Three quick'),T_GO+.05],[CUE(1,'takes off'),T_TO-.04],[CUE(1,'in front of'),-.16],[CUE(1,'meets it'),-.04],[CUE(1,'meets it')+.9,.05],[CUE(1,'Up and out'),.45],[SECS(1),1.25]]),linear);
/** low, in front of him and to the main-stand side: the ball drops in from the right of frame, Drogba over his shoulder, the goal behind */
const PERP:[number,number]=[-FWD[1],FWD[0]];
const E2:V3=[H[0]+FWD[0]*6.4-PERP[0]*6.2,1.9,H[2]+FWD[1]*6.4-PERP[1]*6.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,.6));
 return plan(t,[
  [0,0,()=>({P:E2,T:[VC[0]-FWD[0]*1.2,1.5,VC[1]-FWD[1]*1.2],fov:34})],
  [CUE(1,'reads the flight')-.2,1,()=>({P:add3(E2,[0,-.1,0]),T:mix3([V0[0],1.2,V0[1]],b,.12),fov:36})],
  [CUE(1,'Three quick')-.2,1,()=>({P:add3(E2,[.3,0,.3]),T:[VC[0],1.6,VC[1]],fov:24})],
  [CUE(1,'takes off')-.2,.9,()=>({P:add3(E2,[.6,.1,.6]),T:[H[0],H[1]-.5,H[2]],fov:18})],
  [CUE(1,'meets it')-.2,.8,()=>({P:add3(E2,[.8,.1,.8]),T:[H[0],H[1]-.15,H[2]],fov:13})],
  [CUE(1,'Up and out')-.3,1.1,()=>({P:add3(E2,[.8,.2,.8]),T:mix3(H,[0,2.8,5],.5),fov:28})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1],{roar:.4*sm(0,.4,tau),flash:.3*sm(0,.25,tau)});
  ground(s,c,{lamps:LAMPS_ALL});
  // the replay trail: the diagonal's last metres, then the clearance's rise
  trail(s,c,Math.max(T_PASS,Math.min(tau,0)-.7),Math.min(tau,0),.14,1-sm(.2,.8,tau));
  if(tau>0)trail(s,c,Math.max(0,tau-.6),Math.min(tau,T_O1),.14,1-sm(T_O1-.2,T_O1+.3,tau));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11});
  headBurst(s,c,tau);
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(H,[0,-.9,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · the lesson: a telestrator on the frozen move
const tau3=(t:number)=>key(t,mono([[0,-1.7],[CUE(2,"Don't wait"),-1.25],[CUE(2,'Go to meet'),T_GO+.02],[CUE(2,'jump early'),T_TO-.05],[CUE(2,'clear it'),-.02],[CUE(2,'high and wide')+.3,.9],[SECS(2),1.45]]),linear);
const E3:V3=[-14.5,3.2,12];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[VC[0]-.6,1.3,VC[1]],fov:20})],
  [CUE(2,"Don't wait")-.3,1,()=>({P:add3(E3,[.5,0,-.5]),T:[(VC[0]+DROP[0])/2,1,(VC[1]+DROP[2])/2],fov:20})],
  [CUE(2,'clear it')-.4,1.3,()=>({P:add3(E3,[1,.8,.6]),T:[-3.2,2.2,4.8],fov:30})],
 ]);
}
function arrow2(s:Sheet,q:Pt[],w:number,ink:string,cov=1){
 if(q.length<2)return;const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]),p=new Path2D();
 p.addPath(ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8}));
 p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
function groundRing(s:Sheet,c:Cam,at:V3,r:number,w:number,ink:string,cov:number){
 const pts:Pt[]=[];for(let i=0;i<48;i++){const a=i/48*TAU,p=pr(c,[at[0]+Math.cos(a)*r,.02,at[2]+Math.sin(a)*r]);if(p)pts.push(p);}
 if(pts.length<30)return;const rr=ribbon(pts,w,{close:true,seed:43,taper:0,wobble:.6});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
/** the "if he had waited" line: the rest of the diagonal, dashed red, down to where it would have dropped */
function waitLine(s:Sheet,c:Cam,u:number,w:number){
 const pts:Pt[]=[];for(let i=0;i<=14;i++){const k=1+i/14*.6;let p=flight(k);if(p[1]<.02)p=[p[0],.02,p[2]];const q=pr(c,p);if(q)pts.push(q);}
 if(pts.length<4)return;const n=Math.max(2,Math.floor(pts.length*u)),rb=new Path2D();
 for(let i=0;i+1<n;i+=2)rb.addPath(ribbon([pts[i],pts[i+1]],w,{taper:.1,wobble:0,seed:9+i}));s.knockout(rb,.9);s.fill(R,rb,.95);s.stroke(K,rb,1.6,.8);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tSig=CUE(2,"That's"),tW=CUE(2,"Don't wait"),tG=CUE(2,'Go to meet'),tJ=CUE(2,'jump early'),tC=CUE(2,'clear it'),tHW=CUE(2,'high and wide');
  stadium(s,c,t,[0,1],{});
  ground(s,c,{lamps:LAMPS_ALL});
  const vg:V3=[VC[0],0,VC[1]],wm=Math.max(7,kAt(c,vg)*.055);
  // 1 · the signature: a yellow ring under him
  const sig=sm(tSig-.1,tSig+.5,t)*(1-sm(tW-.3,tW+.2,t));if(sig>.02){const p=vidicAt(tp,tt).place;groundRing(s,c,[p.x??0,0,p.z??0],.9,wm,Y,sig);}
  // 2 · don't wait: the ball's line carried on (dashed red) to a red ring where it would drop — by Drogba, before the keeper
  const wt=sm(tW-.1,tW+.8,t,linear)*(1-sm(tC-.3,tC+.2,t));if(wt>.02){waitLine(s,c,clamp(wt*1.2),wm*.8);groundRing(s,c,DROP,.9,wm,R,clamp(wt*1.5-.5));}
  // 3 · go to meet it: a yellow ground arrow from where he stood to where he took off
  const gm=sm(tG-.1,tG+.6,t,easeOutBack)*(1-sm(tC+.3,tC+.9,t));
  if(gm>.02){const a:V3=[V0[0],.03,V0[1]],b:V3=[VC[0]-FWD[0]*.2,.03,VC[1]-FWD[1]*.2],e=mix3(a,b,clamp(gm));const qa=pr(c,a),qe=pr(c,e);if(qa&&qe)arrow2(s,[qa,[lerp(qa[0],qe[0],.5),lerp(qa[1],qe[1],.5)],qe],wm,Y,.95);}
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,smear:true});
  // 4 · jump early: an up arrow beside him, from the grass toward the ball
  const je=sm(tJ-.05,tJ+.5,t,easeOutBack)*(1-sm(tC+.2,tC+.8,t));
  if(je>.02){const a:V3=[VC[0]+PERP[0]*.9,.3,VC[1]+PERP[1]*.9],b:V3=[a[0],.3+2.1*clamp(je),a[2]];const qa=pr(c,a),qb=pr(c,b);if(qa&&qb)arrow2(s,[qa,[lerp(qa[0],qb[0],.5),lerp(qa[1],qb[1],.5)],qb],wm,Y,.95);}
  // 5 · clear it high and wide: the burst on the forehead, then the clearance traced up and out, wide of the post
  headBurst(s,c,tau,1.1);
  const hw=sm(tC-.1,tHW+.6,t,linear);if(hw>.02&&tau>0){trail(s,c,0,Math.min(tau,T_O1),.12,1);}
  const post=sm(tHW-.1,tHW+.5,t);if(post>.02)groundRing(s,c,[O1[0]-1.5,0,O1[2]-1.6],1.1,wm,Y,post);
 },
 still:9.5,
};

const film:RisoStory={
 id:'vidic-signature',format:'11v11',title:"Nemanja Vidić attacks the ball in the air",
 theme:"Defenders: don't wait for a high ball to come to you — go to meet it, jump early, and clear it high and wide",
 ageNote:'Manchester United 1–1 Chelsea (United won 6–5 on penalties), Champions League final, Luzhniki Stadium, Moscow, 21 May 2008 (22nd minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a header — a forehead-yellow burst with the ball looping up and away. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.55)),fade=age<=0?1:1-clamp((age-.55)/.3),r=rng(seed),a=-Math.PI*(.3+.4*r());
  if(age<.35)sparkBurst(s,Y,x,y,80,{n:8,seed,g:age<=0?1:1-clamp(age/.35),width:10});
  const bx=x+Math.cos(a)*120*u,by=y+Math.sin(a)*170*u+90*u*u;
  if(fade>0){const p=new Path2D();p.moveTo(bx+16,by);p.arc(bx,by,16,0,TAU);s.knockout(p,fade);s.stroke(K,p,3,.9*fade);}
 },
};
export default film;
