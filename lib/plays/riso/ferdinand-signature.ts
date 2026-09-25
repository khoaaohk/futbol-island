/** Rio Ferdinand's signature — "the smooth interception" (lib/town/iconicPlays.json: kind "signature", lesson "Stay calm on the ball after
 * you win it, then make a simple pass."). THE MOMENT: Manchester United 1–1 Chelsea (United won 6–5 on penalties), UEFA Champions League
 * final, Luzhniki Stadium, Moscow, 21 May 2008 — midway through the second half (66'–67' in the Guardian's two accounts), with the score
 * 1–1, Frank Lampard threads a pass into the United penalty area and Ferdinand, United's captain that night and already limping, cuts it
 * out and clears it — then drops to the grass in pain (it looked like cramp), and plays on. An iconic-play riso film (RisoStory, chapters
 * mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts
 * (the footage itself was not reviewed), rendered as a riso print. The Luzhniki, kits and camera language follow van-der-sar-anelka-2008.ts
 * (the same match, read-only) — but it is DRY here: the heavy rain came later, in extra time.
 * WHY THIS MOMENT: the signature is an interception — reading an opponent's pass and stepping into its path first. This is the best-
 * corroborated interception of Ferdinand's in the sources read: THREE independent live accounts of the same final describe him cutting out
 * a ball into United's box at 66'–67' (two name Lampard's through-ball), on the biggest night of his club career. A second candidate — an
 * 85' "Cole drives a low cross in towards Didier Drogba, but Rio Ferdinand intercepts" (Guardian minute-by-minute) — was rejected: the
 * Guardian's key-moments piece says that ball was "scrambled away" and Wikipedia says Drogba "fired wide", so it is not confirmed.
 * The accounts do NOT say what happened to the ball after he cleared it, and he did not calmly pass it here (he cleared it on a sore leg):
 * so the second half of the lesson (stay calm, head up, a simple pass) is shown ONLY as the lesson chapter's teaching marks on a frozen
 * frame, never as footage, and the narration never claims he passed.
 * Narration text: public/plays/narration/ferdinand-signature/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (see estimate()); EVERY action time is read from cue onsets and chapter seconds, so once timing.json
 * exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/ferdinand-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/ferdinand-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - The Guardian, Barry Glendenning, "Man Utd v Chelsea — as it happened", 21 May 2008
 *    https://www.theguardian.com/football/2008/may/21/championsleague.manchesterunited6
 *    "66 min: Despite struggling with injury, Rio Ferdinand manages to block and clear a Frank Lampard through-ball into the penalty area.
 *    The Manchester United captain goes down in agony with what looks like ... cramp."; "69 min: ... Rio Ferdinand is fit to continue";
 *    line-ups with numbers (Ferdinand 5, Vidić 15, Brown 6, Evra 3, Carrick 16, Scholes 18, Hargreaves 4, Ronaldo 7, Rooney 10, Tevez 32;
 *    Chelsea: Essien 5, Terry 26, Carvalho 6, A. Cole 3, J. Cole 10, Ballack 13, Makelele 4, Lampard 8, Malouda 15, Drogba 11).
 *  - The Guardian, "Champions League final: key moments", 22 May 2008  https://www.theguardian.com/football/2008/may/22/championsleague.manchesterunited
 *    "67min Lampard threads into the area but Ferdinand, who had been limping, clears the ball and drops to the ground in agony. A stretcher
 *    arrives but he is fit to carry on".
 *  - BBC Sport, Ben Dirs, "Champions League final as it happened", 21 May 2008  http://news.bbc.co.uk/sport2/hi/football/europe/7410307.stm
 *    "2111: ... United skipper Rio Ferdinand is limping badly. He manages to clear the ball with his wonky leg but then immediately
 *    collapses in agony." "2112: The stretcher's on for Ferdinand but it looks like cramp... And he's back up and running now." Rain: "2144:
 *    Salomon Kalou comes on for Florent Malouda as the rain falls in Moscow" (extra time) — and before kick-off "It's finally stopped raining,
 *    which is good news when you consider the state of the pitch."
 *  - Wikipedia (raw wikitext), "2008 UEFA Champions League final": date, venue, 1–1 (Ronaldo 26', Lampard 45'), Ferdinand captain (c) and
 *    booked 43', the line-ups/positions (Chelsea: Essien RB, Carvalho & Terry CB, A. Cole LB, Makelele DM, Ballack & Lampard CM, J. Cole RW,
 *    Malouda LW, Drogba CF; United 4-4-2), the kit boxes (United red shirts, white shorts, white socks; Chelsea all blue).
 *  - Wikipedia (raw wikitext), "Rio Ferdinand", Style of play: "composure in possession, distribution with either foot, and his ability to
 *    carry the ball forward or play it out from the back on the ground"; "his positioning ... intelligence, and ability to read the game".
 * CONFIRMED by those sources: 21 May 2008, the Luzhniki, Moscow, a night final; 1–1 at the time; Ferdinand (No. 5) was captain; he had been
 *  limping; a Lampard (No. 8) through-ball into United's penalty area (Guardian ×2); Ferdinand blocked / cut it out and cleared it; he then
 *  collapsed in agony (cramp, it looked like), a stretcher came on, and he carried on; it was not raining yet (the rain is logged in extra
 *  time); the kits (United red / white / white; Chelsea all blue) and every number drawn; Van der Sar in goal, Vidić beside Ferdinand.
 *  The BBC's text attaches the moment to a Malouda corner that "doesn't clear the first defender" instead of a Lampard pass — the two
 *  Guardian accounts agree on Lampard, so the film follows them.
 * INFERRED / ILLUSTRATIVE (never named in the narration): which end United defended on screen (the goal at x = 0, the red end); every
 *  position, run, speed and timing; the build-up (Makelele to Lampard); Lampard's passing foot (right) and spot (≈ 25 m out, left of
 *  centre); the ball's line; that Drogba was the runner the pass was meant for, and his run; which foot Ferdinand blocked with (his right,
 *  stretching — his "wonky leg" is not said to be either) and the lunge itself; where the clearance went (upfield, to the far side); how
 *  he went down (sitting, both hands on his right leg); the other players' spots (Vidić, Evra, Brown, Carrick, Scholes, Ballack, J. Cole,
 *  Malouda, Makelele); Van der Sar's grey kit (as the other film); the damp sheen on the grass; the stadium, crowd, cameras and lenses.
 *  The lesson's head-up and simple-pass-to-Vidić are TEACHING MARKS on a frozen frame, not events.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Chelsea build → Ferdinand limping on the edge of
 * his box → Lampard's through-ball → Ferdinand steps across and cuts it out → he sinks to the grass); ch2 = the slow-motion replay from a
 * LOW touchline camera (the pass, the one smooth step, the boot there first, the ball flying clear); ch3 = the lesson: a telestrator on the
 * frozen frame — read the pass (a sight line to Lampard) → step in first (a ground arrow) → win it (a burst) → calm (a smooth ring) → head
 * up (his head lifts, a sight line to Vidić) → a simple pass (a dashed arrow to Vidić). Composed on the FULL sheet (world units = sheet units
 * centred on the canvas; never sheet.safe) so it frames from the 1.45:1 card window down to square (a narrower window widens the lens).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, `prev` secondary motion, motion smear on the lunge
 * and the runs); small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x
 * toward United's goal, y up, +z toward the main-stand camera) — athlete.ts's own convention, so Ferdinand's RIGHT boot is his right, no
 * mirrored projector. Inks: yellow, red, blue, navy. Poses on twos, cameras on ones; all randomness seeded. Budget ≈ 150–330 plate ops. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,lunge,backpedal,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists.
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Moscow, live',text:'Moscow, 2008, the Champions League final. Rio Ferdinand has a sore leg. But when Frank Lampard threads a pass into the box, Rio reads it, steps across, and cuts it out!',tail:2.1,
  cues:['Moscow','Champions League','Rio Ferdinand','sore leg','Frank Lampard','threads a pass','Rio reads it','steps across','cuts it out']},
 {label:'Watch it again',text:'Watch again, slowly. As Lampard passes, Rio takes one smooth step into its path, and his boot gets there first.',tail:1.6,
  cues:['Watch again','As Lampard passes','takes one smooth step','his boot','first']},
 {label:'The lesson',text:"That's Rio's signature: the smooth interception. Read the pass and step in first. After you win the ball, stay calm, lift your head, and make a simple pass.",tail:1.9,
  cues:["That's Rio's signature",'Read the pass','step in first','After you win','stay calm','lift your head','make a simple pass']},
];
import timingJson from '../../../public/plays/narration/ferdinand-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('ferdinand: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('ferdinand: no cue '+w);return c.at;};
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

// ---------------------------------------------------------------- the Luzhniki at night (dry for now): a navy sky, the bowl, roof ring, floodlights
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
 // a night sky: blue screen, a navy over it, darker high up (the grey lid of cloud lit from below)
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
// ---------------------------------------------------------------- the running track, the damp grass, lines, boards, the goal
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
 s.knockout(ln,.9);
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

// ---------------------------------------------------------------- the move on one clock τ (seconds; τ = 0 is Ferdinand's boot on the ball)
/** the build-up: Makelele carries it (dribble), passes to Lampard; Lampard's control touch, then the through-ball */
const MK0:V3=[-40,.11,-10.5],MK1:V3=[-34.5,.11,-8.6],LP_RX:V3=[-26,.11,-3.8],LP_SET:V3=[-25.1,.11,-3.3];
const T_MK0=-7.6,T_MKPASS=-3.7,T_LPRX=-2.5,T_LPSET=-2.1,T_PASS=-1.05;
/** the through-ball's line: from Lampard's boot toward the space behind, aimed at Drogba's run; it is cut out at I */
const PASS_AIM:V3=[-8.4,.11,5.8];
const PASS_DIR:[number,number]=(()=>{const dx=PASS_AIM[0]-LP_SET[0],dz=PASS_AIM[2]-LP_SET[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
const PASS_D=11.4;
const I:V3=[LP_SET[0]+PASS_DIR[0]*PASS_D,.11,LP_SET[2]+PASS_DIR[1]*PASS_D];
/** the clearance: off his boot, lofted upfield toward the far side, a bounce, then rolling */
const C1:V3=[-27,.11,-9],C2:V3=[-35,.11,-14],T_C1=1.35,T_C2=2.6;
function ballAt(tau:number):V3{
 if(tau<=T_MK0)return MK0;
 if(tau<T_MKPASS)return mix3(MK0,MK1,(tau-T_MK0)/(T_MKPASS-T_MK0));
 if(tau<T_LPRX){const u=(tau-T_MKPASS)/(T_LPRX-T_MKPASS);return mix3(MK1,LP_RX,1.3*u-.3*u*u);}
 if(tau<T_LPSET)return mix3(LP_RX,LP_SET,easeOut((tau-T_LPRX)/(T_LPSET-T_LPRX)));
 if(tau<T_PASS)return LP_SET;
 if(tau<0){const u=(tau-T_PASS)/-T_PASS,d=PASS_D*(1.22*u-.22*u*u);return[LP_SET[0]+PASS_DIR[0]*d,.11,LP_SET[2]+PASS_DIR[1]*d];}
 if(tau<T_C1){const u=tau/T_C1,p=mix3(I,C1,u);p[1]=.11+3.4*4*u*(1-u);return p;}
 if(tau<T_C2){const u=(tau-T_C1)/(T_C2-T_C1),p=mix3(C1,C2,easeOut(u));p[1]=.11+.9*Math.max(0,Math.sin(u*Math.PI*1.4))*(1-u);return p;}
 const u=clamp((tau-T_C2)/1.6);return mix3(C2,add3(C2,[-3,0,-1.6]),easeOut(u));
}
const spinAt=(tau:number)=>tau<T_PASS?tau*3:tau<0?TAU*2.2*(tau-T_PASS):TAU*2.2*-T_PASS+TAU*3.5*tau;

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
const united=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:K,numberInk:'paper',hairStyle:'short',...o});
const chelsea=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const RIO_B={height:1.89,bulk:1.02};
const RIO_ST=united({number:5,skin:SKIN_D,hair:K,hairStyle:'short',build:RIO_B,seed:5});
const LAMP_B={height:1.84,bulk:1.02};
const LAMP_ST=chelsea({number:8,hair:[K,.6],build:LAMP_B,seed:8});
const DROG_B={height:1.88,bulk:1.08};
const DROG_ST=chelsea({number:11,skin:SKIN_D,hair:K,build:DROG_B,seed:11});
const MAKE_ST=chelsea({number:4,skin:SKIN_D,hair:K,hairStyle:'bald',build:{height:1.74},seed:4});
const VDS_B={height:1.97,bulk:1.02};
const VDS_ST:AthleteStyle={shirt:[K,.66],shorts:[K,.9],socks:[K,.66],boots:K,skin:SKIN_L,hair:[Y,.55],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'balding',number:1,numberInk:'paper',build:VDS_B,seed:1};
const VIDIC_ST=united({number:15,hairStyle:'bald',build:{height:1.9,bulk:1.06},seed:15});

// ---------------------------------------------------------------- Ferdinand: limping on the edge of his box, the read, the step, the block, down
const Y_RIO=yawTo(I[0],I[2],LP_SET[0],LP_SET[2]);
/** contact: the lunge's full reach (.6) puts his RIGHT boot on the ball at I (solved once, FK) */
const T_LUNGE=-.62,LUNGE_REACH=.6;
const RIO_C:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH,{side:'r'}),RIO_B,{x:0,z:0,yaw:Y_RIO});return[I[0]-sk.rToe[0]+.02,I[2]-sk.rToe[2]];})();
/** his right (for the facing Y_RIO): the lane is on his right, so he starts a stride to his LEFT of it */
const RIGHT:[number,number]=[Math.sin(Y_RIO),Math.cos(Y_RIO)];
const RIO_S:[number,number]=[RIO_C[0]-RIGHT[0]*.95+.3,RIO_C[1]-RIGHT[1]*.95];
/** where he backs off from, tracking the play goal-side before the pass */
const RIO_0:[number,number]=[RIO_S[0]-3.2,RIO_S[1]-1.4];
const T_DOWN0=.95,T_DOWN1=1.9;
/** down on the grass: sitting, the right leg out straight, both hands on it, the head bowed */
const P_SIT=posed({lHipF:78,rHipF:92,lKnee:96,rKnee:8,lAnk:20,rAnk:10,lHipA:14,rHipA:6,lean:34,pitch:-6,neckP:34,lShF:64,rShF:70,lShA:18,rShA:10,lElb:40,rElb:30,lHand:.8,rHand:.8});
/** hobbling: weight on the left, the right leg held a little bent, a hand to the thigh */
const P_HOBBLE=posed({lHipF:10,rHipF:26,lKnee:22,rKnee:40,lAnk:-4,rAnk:14,lean:26,pitch:6,neckP:26,rShF:40,rShA:12,rElb:70,lShA:22,lShF:6,lElb:30,rHand:.8});
/** a sore-legged jog: the stride shortened on the right */
const limp=(ph:number,sp:number)=>{const p=runCycle(ph,{speed:sp,stride:.7});p.rKnee*=.75;p.rHipF*=.8;return p;};
function rioAt(tau:number,it:number):{pose:Pose;place:Place}{
 let p:Pose,x:number,z:number,yaw=Y_RIO;
 if(tau<T_LUNGE-.9){
  // backing off goal-side with the play, eyes on the ball: a low, careful backpedal
  const u=sm(T_MK0,T_LUNGE-.9,tau,linear);x=lerp(RIO_0[0],RIO_S[0],u);z=lerp(RIO_0[1],RIO_S[1],u);
  p=blendPose(backpedal(it*1.3),limp(it*1.1,.2),.25);
  if(tau<T_MKPASS){const b=ballAt(tau);yaw=lerpAng(yawTo(x,z,b[0],b[2]),Y_RIO,.5);}
 }else if(tau<T_LUNGE){
  // set, weight forward: reading Lampard
  x=RIO_S[0];z=RIO_S[1];p=blendPose(backpedal(it*1.3),backpedal(0),sm(T_LUNGE-.9,T_LUNGE-.5,tau));
 }else if(tau<.5){
  // the step across and the block: lunge 0 → .6 (contact at τ 0) → 1
  const u=tau<0?LUNGE_REACH*sm(T_LUNGE,0,tau,linear):LUNGE_REACH+(1-LUNGE_REACH)*clamp(tau/.5);
  p=lunge(u,{side:'r'});const g=sm(T_LUNGE,-.08,tau,easeInOutSine);x=lerp(RIO_S[0],RIO_C[0],g);z=lerp(RIO_S[1],RIO_C[1],g);
 }else{
  x=RIO_C[0];z=RIO_C[1];p=lunge(1,{side:'r'});
  p=blendPose(p,P_HOBBLE,sm(.5,T_DOWN0,tau));
  if(tau>T_DOWN0)p=blendPose(p,P_SIT,sm(T_DOWN0,T_DOWN1,tau,easeInOutSine));
  const b=ballAt(Math.min(tau,T_C1));yaw=lerpAng(Y_RIO,yawTo(x,z,b[0],b[2]),sm(.1,.8,tau)*(1-sm(T_DOWN0,T_DOWN1,tau)*.5));
 }
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- Lampard: the control touch, the through-ball, then he runs on
const LP_B0:[number,number]=[-28.5,-4.6];
const Y_PASS=yawTo(LP_SET[0],LP_SET[2],PASS_AIM[0],PASS_AIM[2]);
/** where his pelvis stands at the strike so the RIGHT boot meets the ball at LP_SET (solved once, FK) */
const LP_POW=.45,LP_SD=.85,LP_RUN_END=T_PASS-STRIKE_CONTACT*LP_SD;
const LP_C:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:LP_POW}),LAMP_B,{x:0,z:0,yaw:Y_PASS});return[LP_SET[0]-PASS_DIR[0]*.1-sk.rToe[0],LP_SET[2]-PASS_DIR[1]*.1-sk.rToe[2]];})();
function lampardAt(tau:number,it:number):{pose:Pose;place:Place}{
 if(tau<T_LPRX-.4){const u=sm(T_MK0,T_LPRX-.4,tau,linear),x=lerp(LP_B0[0],LP_RX[0]-.9,u),z=lerp(LP_B0[1],LP_RX[2]-.5,u);return{pose:runCycle(it*1.4,{speed:.35}),place:{x,z,yaw:yawTo(x,z,MK1[0],MK1[2])}};}
 if(tau<LP_RUN_END){const u=sm(T_LPRX-.4,LP_RUN_END,tau,linear),x=lerp(LP_RX[0]-.9,LP_C[0]-Math.cos(Y_PASS)*.9,u),z=lerp(LP_RX[2]-.5,LP_C[1]+Math.sin(Y_PASS)*.9,u);
  return{pose:dribble(it*1.9,{foot:'r',speed:.4}),place:{x,z,yaw:lerpAng(yawTo(x,z,MK1[0],MK1[2]),Y_PASS,sm(T_LPRX-.3,T_LPSET,tau))}};}
 if(tau<T_PASS+.7){const us=STRIKE_CONTACT+(tau-T_PASS)/LP_SD,g=clamp((tau-LP_RUN_END)/(T_PASS+.7-LP_RUN_END));
  return{pose:blendPose(dribble(it*1.9,{foot:'r',speed:.4}),strike(clamp(us),{power:LP_POW}),sm(LP_RUN_END,LP_RUN_END+.12,tau)),place:{x:LP_C[0]-Math.cos(Y_PASS)*.9*(1-g)+Math.cos(Y_PASS)*.4*g,z:LP_C[1]+Math.sin(Y_PASS)*.9*(1-g)-Math.sin(Y_PASS)*.4*g,yaw:Y_PASS}};}
 const d=(tau-T_PASS-.7)*3.6,x=LP_C[0]+Math.cos(Y_PASS)*(.4+d),z=LP_C[1]-Math.sin(Y_PASS)*(.4+d);
 return{pose:blendPose(strike(1,{power:LP_POW}),runCycle(it*1.5,{speed:.45}),sm(T_PASS+.7,T_PASS+1,tau)),place:{x,z,yaw:Y_PASS}};
}

// ---------------------------------------------------------------- Drogba: the run the pass was meant for; checks, turns away
const DG0:[number,number]=[-19.5,7.8],DG1:[number,number]=[-11.3,3.9];
function drogbaAt(tau:number,it:number):{pose:Pose;place:Place}{
 const run=sm(-2.3,.25,tau,linear),x=lerp(DG0[0],DG1[0],run),z=lerp(DG0[1],DG1[1],run);
 if(tau<-2.3)return{pose:blendPose(stand(),runCycle(it*1.2,{speed:.1}),.4),place:{x:DG0[0],z:DG0[1],yaw:yawTo(DG0[0],DG0[1],LP_RX[0],LP_RX[2])}};
 let p=runCycle(it*1.55+.3,{speed:.75});
 if(tau>0)p=blendPose(p,stand(),sm(0,.7,tau));
 const b=ballAt(Math.min(tau,T_C1));
 return{pose:p,place:{x,z,yaw:lerpAng(yawTo(DG0[0],DG0[1],DG1[0],DG1[1]),yawTo(x,z,b[0],b[2]),sm(.05,.8,tau))}};
}

// ---------------------------------------------------------------- everyone else (low detail): drift with the ball, then turn to follow the clearance
type Actor={name:string;st:AthleteStyle;x:number;z:number;dx:number;dz:number;i:number;keeper?:boolean};
const LOWS:Actor[]=[];
{const u:[number,number,number,string,InkFill[]][]=[[15,-13.6,-2.6,'bald',SKIN_L],[3,-16.8,11.8,'short',SKIN_D],[6,-17.4,-12.8,'short',SKIN_L],[16,-23.2,1.8,'short',SKIN_L],[18,-28.5,-2.4,'short',SKIN_L],[4,-22.5,11.2,'short',SKIN_L],[7,-36,-15,'short',SKIN_M]];
 u.forEach(([n,x,z,h,sk],i)=>LOWS.push({name:'United '+n,st:n===15?VIDIC_ST:united({number:n,skin:sk,hairStyle:h as AthleteStyle['hairStyle'],hair:n===18?[R,.7]:[K,.85],build:{height:1.78+.03*(i%3)},seed:40+i}),x,z,dx:1.6,dz:.9,i}));
 const c:[number,number,number,string,InkFill[]][]=[[13,-22,6.5,'short',SKIN_L],[10,-18.6,17.5,'short',SKIN_L],[15,-15.2,-15.6,'short',SKIN_D]];
 c.forEach(([n,x,z,h,sk],i)=>LOWS.push({name:'Chelsea '+n,st:chelsea({number:n,skin:sk,hairStyle:h as AthleteStyle['hairStyle'],build:{height:1.8+.03*(i%2)},seed:60+i}),x,z,dx:2.4,dz:.6,i:i+10}));
 LOWS.push({name:'Van der Sar',st:VDS_ST,x:-1.4,z:1.2,dx:0,dz:0,i:20,keeper:true});}
function lowAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 if(a.keeper){const b=ballAt(Math.min(tau,.4));return{pose:keeperSet(it*1.2),place:{x:a.x-.4*sm(-1,0,tau),z:a.z+.8*sm(-1,0,tau),yaw:yawTo(a.x,a.z,b[0],b[2])}};}
 const drift=sm(T_MK0,0,tau,linear),x=a.x+a.dx*drift,z=a.z+a.dz*drift*(a.z>0?-1:1),b=ballAt(Math.min(tau,T_C1+.5));
 const moving=tau>T_MK0&&tau<0;let p=moving?runCycle(it*1.1+a.i*.13,{speed:.12}):blendPose(stand(),runCycle(a.i*.13,{speed:.1}),.3);
 if(tau>.2)p=blendPose(p,runCycle(it*1.3+a.i*.13,{speed:.3}),sm(.2,.6,tau)*(a.i===0?0:1));
 const ex=tau>.2?(tau-.2)*1.6*(a.i===0?0:1):0,d=Math.hypot(b[0]-x,b[2]-z)||1;
 return{pose:p,place:{x:x+(b[0]-x)/d*Math.min(ex,d*.3),z:z+(b[2]-z)/d*Math.min(ex,d*.3),yaw:yawTo(x,z,b[0],b[2])}};
}
function makeleleAt(tau:number,it:number):{pose:Pose;place:Place}{
 const yP=yawTo(MK1[0],MK1[2],LP_RX[0],LP_RX[2]);
 if(tau<T_MKPASS-.45){const u=sm(T_MK0,T_MKPASS-.45,tau,linear),x=lerp(MK0[0]-.7,MK1[0]-1.1,u),z=lerp(MK0[2]-.3,MK1[2]-.4,u);return{pose:dribble(it*1.7,{foot:'r',speed:.3}),place:{x,z,yaw:lerpAng(yawTo(MK0[0],MK0[2],MK1[0],MK1[2]),yP,sm(T_MKPASS-1,T_MKPASS-.45,tau))}};}
 const us=STRIKE_CONTACT+(tau-T_MKPASS)/.8;
 return{pose:blendPose(strike(clamp(us),{power:.35}),stand(),sm(T_MKPASS+.5,T_MKPASS+1.1,tau)),place:{x:MK1[0]-1.1+.5*sm(T_MKPASS-.45,T_MKPASS+.3,tau),z:MK1[2]-.4,yaw:yP}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hem trail), smear = halftone echo + speed lines on fast limbs (the lunge, the pass, the run). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??14,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>T_PASS&&tau<T_C1){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=20):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';lift?:number};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const add=(at:(tau:number,it:number)=>{pose:Pose;place:Place},st:AthleteStyle,hero:boolean,smear:(tau:number)=>boolean,tweak?:(p:Pose)=>Pose)=>{
  const cur=at(tp,e.it),d=visible(cur.place);if(d<0)return;
  items.push({d,draw:()=>{const prev=at(tpPrev,e.it-1/12);drawPlayer(s,tweak?tweak(cur.pose):cur.pose,c,detailFor(st,d,hero),cur.place,prev,!!e.smear&&smear(tp));}});};
 add(rioAt,RIO_ST,true,t=>t>T_LUNGE&&t<.35,e.lift?p=>({...p,neckP:p.neckP-.9*(e.lift??0),neckY:p.neckY-.5*(e.lift??0)}):undefined);
 add(lampardAt,LAMP_ST,true,t=>t>LP_RUN_END&&t<T_PASS+.3);
 add(drogbaAt,DROG_ST,true,t=>t>-1.6&&t<.2);
 add(makeleleAt,MAKE_ST,false,()=>false);
 for(const a of LOWS)add((t,it)=>lowAt(a,t,it),a.st,false,()=>false);
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const LAMPS_ALL=lampPts([0,1,2,3]);
const rioXZ=(tau:number):V3=>{const p=rioAt(tau,0).place;return[p.x??0,0,p.z??0];};
/** a burst on the boot at the moment of the block */
function blockBurst(s:Sheet,c:Cam,tau:number,big=1){const hb=sm(-.03,.08,tau)*(1-sm(.22,.5,tau));if(hb<=0)return;const q=pr(c,I);if(!q)return;
 sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,I)*.8)*big*easeOutBack(clamp(hb*1.3)),{n:9,seed:21,width:Math.max(5,kAt(c,I)*.05)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ keyed to the words: the build-up under the opening, Ferdinand on "Rio Ferdinand", the pass on "threads", the block on "cuts it out" */
const tau1=(t:number)=>key(t,mono([[0,T_MK0-.4],[CUE(0,'Frank Lampard'),T_LPRX+.1],[CUE(0,'threads a pass'),T_PASS-.1],[CUE(0,'Rio reads it'),T_LUNGE-.2],[CUE(0,'cuts it out'),.02],[SECS(0),.02+(SECS(0)-CUE(0,'cuts it out'))*1.05]]),linear);
const P1:V3=[-24,12.5,50];
function cam1(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:P1,T:[-31,1.5,-6],fov:17})],
  [CUE(0,'Champions League')-.2,1.4,()=>({P:P1,T:[-30,1.2,-5.5],fov:11})],
  [CUE(0,'Rio Ferdinand')-.3,1,()=>({P:P1,T:add3(rioXZ(tau1(t)),[-.5,1,0]),fov:6})],
  [CUE(0,'Frank Lampard')-.4,1,()=>({P:P1,T:[-20,1,-.4],fov:11})],
  [CUE(0,'Rio reads it')-.2,.8,()=>({P:P1,T:[-15.4,1,2.4],fov:5.2})],
  [CUE(0,'cuts it out')+.9,1.2,()=>({P:P1,T:[-17.5,1.3,-.5],fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tC=CUE(0,'cuts it out');
  stadium(s,c,t,[0,1,3],{roar:sm(tC-.1,tC+.4,t)*.7,flash:.4*sm(tC,tC+.25,t)*(1-sm(tC+1.5,tC+2.5,t))});
  ground(s,c,{lamps:LAMPS_ALL});
  play(s,c,tau,tp,tpp,{it:tt,minBall:15,lines:true,prevT:tau1(t-.06),hero:'mid'});
  blockBurst(s,c,tau,.8);
 },
 aperture(t){const c=cam1(t),P=add3(rioXZ(tau1(t)),[0,.7,0]),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(30,c.F*1.1/q[2]),12);},
 still:9.5,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from a low touchline camera: the pass, the step, the boot first
const tau2=(t:number)=>key(t,mono([[0,T_PASS-.55],[CUE(1,'As Lampard'),T_PASS-.12],[CUE(1,'takes one'),T_LUNGE+.02],[CUE(1,'his boot'),-.14],[CUE(1,'first'),.04],[SECS(1),.95]]),linear);
/** low, behind Lampard: over the passer's shoulder, the ball runs away from the lens and Ferdinand steps across the frame, face-on */
const E2:V3=[-30.5,1.8,-12.5];
function cam2(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E2,T:[-20,1.1,-1],fov:30})],
  [CUE(1,'As Lampard')-.2,1,()=>({P:add3(E2,[.4,0,.2]),T:[-18.5,1,.2],fov:22})],
  [CUE(1,'takes one')-.3,1,()=>({P:add3(E2,[1.2,-.1,.6]),T:add3(I,[.2,.8,.4]),fov:12})],
  [CUE(1,'first')+.3,1.1,()=>({P:add3(E2,[1.4,0,.7]),T:add3(I,[-1.5,1.3,-1.2]),fov:17})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,3],{roar:.3*sm(0,.4,tau),flash:.25*sm(0,.3,tau)});
  ground(s,c,{lamps:LAMPS_ALL});
  // the replay trail: the through-ball's line so far, fading after the block
  if(tau>T_PASS&&tau<.9){const pts=pathPts(c,Math.max(T_PASS,tau-.6),Math.min(tau,0),14),fade=1-sm(.1,.9,tau);if(pts.length>2){const w=Math.max(7,kAt(c,ballAt(Math.min(tau,0)))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10});
  blockBurst(s,c,tau);
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(I,[0,.6,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:5.2,
};

// ---------------------------------------------------------------- 3 · the lesson: a telestrator on the frozen frame
const tau3=(t:number)=>key(t,mono([[0,-1.5],[CUE(2,'Read the pass'),T_PASS+.2],[CUE(2,'step in first'),T_LUNGE+.05],[CUE(2,'After you win'),.02],[SECS(2),.06]]),linear);
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-17.5,3.4,13.5],T:[-19.4,1,-.6],fov:40})],
  [CUE(2,'step in first')-.3,1,()=>({P:[-16.5,3,12],T:[-15,.9,2.4],fov:24})],
  [CUE(2,'lift your head')-.3,1.2,()=>({P:[-16,3.4,12.5],T:[-13.4,.8,.6],fov:33})],
 ]);
}
function arrow2(s:Sheet,q:Pt[],w:number,ink:string,cov=1,dash=0){
 if(q.length<2)return;const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]),p=new Path2D();
 if(dash>0){const n=dash;for(let i=0;i<n;i++){const u0=i/n,u1=(i+.6)/n,a=shaft[0],b=shaft[shaft.length-1];p.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)]],w,{taper:.1,wobble:0,seed:9+i}));}}
 else p.addPath(ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8}));
 p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
function groundRing(s:Sheet,c:Cam,at:V3,r:number,w:number,ink:string,cov:number){
 const pts:Pt[]=[];for(let i=0;i<48;i++){const a=i/48*TAU,p=pr(c,[at[0]+Math.cos(a)*r,.02,at[2]+Math.sin(a)*r]);if(p)pts.push(p);}
 if(pts.length<30)return;const rr=ribbon(pts,w,{close:true,seed:43,taper:0,wobble:.6});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
/** a dashed sight line between two screen points, drawn to fraction u */
function sight(s:Sheet,a:Pt,b:Pt,u:number,w:number,ink:string){const rb=new Path2D(),n=9;for(let i=0;i<n;i++){const u0=i/n*u,ue=(i+.62)/n*u;rb.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)]],w,{seed:13+i,taper:.2,wobble:0}));}
 s.knockout(rb,.95);s.fill(ink,rb,.95);s.stroke(K,rb,1.8,.8);}
const VIDIC=LOWS[0];
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tR=CUE(2,'Read the pass'),tS=CUE(2,'step in first'),tW=CUE(2,'After you win'),tC=CUE(2,'stay calm'),tH=CUE(2,'lift your head'),tP=CUE(2,'make a simple pass');
  stadium(s,c,t,[0,1,3],{});
  ground(s,c,{lamps:LAMPS_ALL});
  const rg=rioXZ(tp);
  // 1 · read the pass: a red ring under Lampard and a dashed sight line from Rio's eyes to him
  const rd=sm(tR-.1,tR+.5,t)*(1-sm(tW-.3,tW+.2,t));
  if(rd>.02){const lp=lampardAt(tp,tt).place;groundRing(s,c,[lp.x??0,0,lp.z??0],.8,Math.max(6,kAt(c,rg)*.05),R,rd);}
  // 2 · step in first: a yellow ground arrow from where he stood onto the ball's line
  const st=sm(tS-.1,tS+.5,t,easeOutBack)*(1-sm(tC,tC+.5,t));
  if(st>.02){const a:V3=[RIO_S[0],.03,RIO_S[1]],b:V3=[RIO_C[0],.03,RIO_C[1]],e=mix3(a,b,clamp(st)*1.25);const qa=pr(c,a),qe=pr(c,e);if(qa&&qe)arrow2(s,[qa,[lerp(qa[0],qe[0],.5),lerp(qa[1],qe[1],.5)],qe],Math.max(8,kAt(c,a)*.06),Y,.95);}
  // 4 · stay calm: a smooth yellow ring round him and the ball
  const calm=sm(tC-.1,tC+.6,t);if(calm>.02)groundRing(s,c,[I[0],0,I[2]],1.25,Math.max(7,kAt(c,rg)*.06),Y,calm);
  // 6 · a simple pass: a dashed arrow on the grass to Vidić, and a ring under him
  const ps=sm(tP-.1,tP+.7,t,linear);
  if(ps>.02){const vp=lowAt(VIDIC,tp,tt).place,v3:V3=[vp.x??0,.03,vp.z??0];groundRing(s,c,v3,.7,Math.max(6,kAt(c,v3)*.05),Y,ps);
   const a=pr(c,[I[0],.03,I[2]]),b=pr(c,mix3([I[0],.03,I[2]],v3,.86*clamp(ps*1.3)));if(a&&b)arrow2(s,[a,[lerp(a[0],b[0],.5),lerp(a[1],b[1],.5)],b],Math.max(8,kAt(c,I)*.06),Y,.95,5);}
  // 5 · head up: his head lifts as the line of sight to Vidić appears
  const hu=sm(tH-.1,tH+.5,t);
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lift:hu});
  if(rd>.02){const r=rioAt(tp,tt),sk=solve(r.pose,RIO_B,r.place),lp=lampardAt(tp,tt),lk=solve(lp.pose,LAMP_B,lp.place),a=pr(c,sk.face),b=pr(c,lk.face);if(a&&b)sight(s,a,b,clamp(rd*1.2),Math.max(7,kAt(c,rg)*.05),Y);}
  if(hu>.02){const r=rioAt(tp,tt),sk=solve({...r.pose,neckP:r.pose.neckP-.9*hu},RIO_B,r.place),vp=lowAt(VIDIC,tp,tt),vk=solve(vp.pose,{height:1.9},vp.place),a=pr(c,sk.face),b=pr(c,vk.face);if(a&&b)sight(s,a,b,clamp(hu*1.2),Math.max(7,kAt(c,rg)*.05),Y);}
  // 3 · win it: the burst on the boot
  const wn=sm(tW-.05,tW+.3,t)*(1-sm(tC+.2,tC+.7,t));if(wn>0){const q=pr(c,I);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,I)*.9)*easeOutBack(wn),{n:10,seed:61,width:Math.max(6,kAt(c,I)*.05)});}
 },
 still:9,
};

const film:RisoStory={
 id:'ferdinand-signature',format:'11v11',title:"Rio Ferdinand's smooth interception",
 theme:'Defenders: read the pass and step in first — then stay calm on the ball, lift your head and make a simple pass',
 ageNote:'Manchester United 1–1 Chelsea (United won 6–5 on penalties), Champions League final, Luzhniki Stadium, Moscow, 21 May 2008. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a block — a boot-yellow burst with a ball knocked away on a short arc. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.5)/.3),r=rng(seed),a=-Math.PI*(.2+.6*r());
  if(age<.35)sparkBurst(s,Y,x,y,80,{n:8,seed,g:age<=0?1:1-clamp(age/.35),width:10});
  const bx=x+Math.cos(a)*140*u,by=y+Math.sin(a)*140*u+60*u*u;
  if(fade>0){const p=new Path2D();p.moveTo(bx+16,by);p.arc(bx,by,16,0,TAU);s.knockout(p,fade);s.stroke(K,p,3,.9*fade);}
 },
};
export default film;
