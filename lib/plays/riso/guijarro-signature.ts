/** Patri Guijarro's signature — "winning it back and starting the attack" (lib/town/iconicPlays.json: kind "signature", lesson "Read the
 * pass early, step in, then pass forward straight away"), shown through ONE real moment: her headed equaliser, Barcelona 3–2 VfL Wolfsburg,
 * 2023 UEFA Women's Champions League final, Philips Stadion, Eindhoven, Saturday 3 June 2023 (16:00 CEST kick-off; the goal at 50', her
 * second in two minutes, 0–2 → 2–2). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso
 * print.
 * WHY THIS MOMENT: her signature is READING the play early — Wikipedia's style section: "spatial awareness to anticipate defensive and
 * attacking situations", "ball-winning duels", and (Bonmatí, 2018) she helps "by making runs into the box". The final is her most famous
 * match (UEFA Player of the Match) and its second goal is the best-documented example of that anticipation: "Wolfsburg are unable to mark
 * Guijarro" (Guardian live). No single documented ball-winning interception by her was found in the sources, so the film shows the header
 * and the narration presents reading early as "her signature", then gives the iconicPlays lesson for midfield ("It wins the ball back in
 * midfield too"). No interception is depicted or claimed.
 *
 * SOURCES (read Sept 2026; fetched with curl, cached in the film scratchpad src-cache/):
 *  - Wikipedia, "2023 UEFA Women's Champions League final" (raw wikitext; cached wiki-2023-uwcl-final.txt): 3 June 2023, 16:00 CEST,
 *    Philips Stadion, Eindhoven, 33,147, referee Cheryl Foster; goals Pajor 3', Popp 37', Guijarro 48' 50', Rolfö 70'; line-ups and numbers
 *    (Barcelona: Paños 1, Bronze 15, Paredes 2, León 4, Rolfö 16, Bonmatí 14, Walsh 21, Guijarro 12, Graham Hansen 10, Paralluelo 17,
 *    Caldentey 9; Wolfsburg: Frohms 1, Wilms 2, Hendrich 4, Janssen 6, Rauch 13 (LB), Oberdorf 5, Roord 14, Huth 10, Jónsdóttir 23, Pajor 9,
 *    Popp 11); player of the match Guijarro; the kit templates: Barcelona the 2022–23 home shirt (blaugrana stripes) with dark navy shorts and
 *    socks (000040); Wolfsburg lime green (81F733) shirts and shorts with white socks.
 *  - UEFA.com match report, "Barcelona 3-2 Wolfsburg: Blaugrana comeback seals second Women's Champions League final win", 3 June 2023
 *    (cached uefa-bar-wol-2023-final.txt): "Two minutes later it was 2-2, and Guijarro again the scorer, heading in after another superb
 *    piece of skill and perfect lobbed cross from Bonmatí"; "Guijarro heads equaliser"; POTM citation: "Her attacking attitude in the second
 *    half got her into the box to capitalise on crossing opportunities".
 *  - The Guardian, match report, 3 June 2023 (cached guardian-bar-wol-2023-report.txt): "This time it was the masterful Aitana Bonmatí
 *    finding space on the right before delivering a cross. Guijarro once more was there, sending a thumping header beyond Merle Frohms";
 *    "the travelling fans, who numbered more than 8,000, behind the goal".
 *  - The Guardian live blog (Sarah Rendell), 3 June 2023 (cached guardian-bar-wol-2023-live*.txt): "GOAL! Barcelona 2-2 Wolfsburg
 *    (Guijarro, 50') WHAT!! Slick passes and Wolfsburg are unable to mark Guijarro, she takes a one touch header and Frohms can't stop it".
 *  - Wikipedia, "Patricia Guijarro" (cached wiki-patricia-guijarro.txt): holding / central midfielder; style of play quoted above.
 * CONFIRMED by those accounts: the match, date, stadium; Barcelona 1–2 down after her 48' goal; at 50' Bonmatí found space ON THE RIGHT,
 *  beat her player with a piece of skill and LOBBED a cross; Guijarro was unmarked; a one-touch, "thumping" header beyond Frohms (Wolfsburg
 *  No. 1); 2–2; her second in two minutes; the Barcelona fans behind the goal Barcelona attacked in the second half; the kits and numbers.
 * INFERRED (illustrative, never named in the narration): every position, run and timing in metres and seconds (the cross ≈ 16 m in 1.5 s
 *  from the right edge of the box; the header ≈ 10 m out, just right of centre); that the pass into Bonmatí came from Graham Hansen; that
 *  the defender she beat was Rauch (Wolfsburg's left-back, so on Barcelona's right — the line-up is confirmed, the duel is not); the skill
 *  drawn as a sole drag inside; Bonmatí crossing with her RIGHT foot; where the header went in (drawn low to Frohms's right) and Frohms's
 *  late dive; the header's small jump and the turn of the head toward goal; where the others stood (Hendrich with Paralluelo, Janssen with
 *  Caldentey, Oberdorf ball-watching); Frohms's kit colour (drawn navy); the number colours; hair (Guijarro's dark hair in a ponytail, from
 *  photographs, not a text source); heights (Guijarro 1.68 m — Wikipedia's height field is blank — Bonmatí 1.62 m); the celebration run;
 *  the main-stand camera on Barcelona's LEFT (so Bonmatí is on the far side); the Philips Stadion drawn as four roofed rectangular stands;
 *  the clear afternoon light; the crowd colours; every camera placement and lens. The lime green is printed with a fluorescent-green ink.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, panning with the ball: Graham Hansen's pass →
 * Bonmatí drags it past Rauch → Guijarro arriving from midfield → the lobbed cross → the header → the net → she wheels away; ch2 = the
 * slow-motion replay from a LOW camera riding just behind her left shoulder as she runs in: every defender ringed red watching the
 * ball, a dashed yellow sight line from her eyes to where the cross will land (a yellow ring), her run drawn ahead of her into the gap;
 * ch3 = the second replay, LOW BEHIND THE GOAL through the net: the one-touch header comes straight at us past Frohms's dive, a spark on her
 * forehead, a yellow trail; then the celebration; ch4 = the lesson from a raised three-quarter angle behind her: read it early (the sight
 * line and the landing ring) → step in (her run into the gap) → play it forward first time (a red arrow from her head to the goal).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down to
 * square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary
 * motion so the ponytails swing, motionSmear on the sprints, the cross, the header and the dive); women's builds with ponytails; small
 * wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward the goal
 * Wolfsburg defend, y up, +z = Barcelona's right), athlete.ts's own convention, so a RIGHT foot is the right foot; Frohms faces −x, so her
 * dive to her RIGHT (keeperDive side 'r') goes to −z. Inks: yellow, red (garnet), fluorescent green (Wolfsburg), navy. Everything is keyed
 * to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: ≈ 150–330 plate
 * ops a frame (the bible's budget), at most a handful of full-detail figures. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,lunge,header,celebrate,posed,blendPose,clampPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word —
 * Kokoro splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once
 * scripts/plays/kokoro-narrate.py has written public/plays/narration/guijarro-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/guijarro-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The equaliser, live',text:'Eindhoven, 2023, Champions League final. Barcelona trail Wolfsburg two-one, when Aitana Bonmatí skips free on the right. Patri Guijarro is arriving, unmarked. In comes the cross... Header! Goal! Two-two!',tail:2.4,
  cues:['Eindhoven','Barcelona trail','Aitana Bonmatí','skips free','Patri Guijarro','In comes','Header','Goal']},
 {label:'Reading the cross',text:'Watch Patri. Every defender watches the ball, but she reads where the cross will land, and runs into the gap.',tail:1.2,
  cues:['Watch Patri','Every defender','reads where','will land','runs into']},
 {label:'One touch',text:'One touch: a thumping header past Merle Frohms. Her second goal in two minutes!',tail:2,
  cues:['One touch','thumping header','Merle Frohms','second goal']},
 {label:'The secret',text:'Reading early is her signature. It wins the ball back in midfield too: read the pass early, step in, then pass forward straight away.',tail:1.8,
  cues:['Reading early','wins the ball','read the pass','step in','then pass']},
];
import timingJson from '../../../public/plays/narration/guijarro-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('guijarro: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('guijarro: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',G='green',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** a 0 → 1 → 0 bump over [a, b] (smooth edges) */
const hump=(a:number,b:number,t:number,e=.3)=>sm(a,a+(b-a)*e,t)*(1-sm(b-(b-a)*e,b,t));
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Wolfsburg defend is x = 0 (Barcelona attack +x), goal centre z = 0, +z = Barcelona's right; halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Philips Stadion on a clear June afternoon: four roofed rectangular stands close to the pitch
/** stands: a = along the stand 0..1, b = up the rake 0..1. 0 the far side (+z), 1 behind the goal Barcelona attack (+x, the Barcelona
 * fans), 2 the main stand (−z, the camera side), 3 the other end (−x). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-112,7,a),1.3+19*b,40+22*b],
 (a,b)=>[8+22*b,1.3+19*b,lerp(42,-42,a)],
 (a,b)=>[lerp(7,-112,a),1.3+19*b,-40-22*b],
 (a,b)=>[-113-22*b,1.3+19*b,lerp(-42,42,a)],
];
const STAND_COLS=[120,80,120,80],STAND_ROWS=14,WALKS=[.46],NSEG=8;
/** flags on the stand fronts: [stand, a, kind 0 = Barcelona (garnet with navy bands) | 1 = the senyera (yellow, red bars) | 2 = Wolfsburg (green)] */
const FLAGS:[number,number,number][]=[[1,.22,0],[1,.4,1],[1,.58,0],[1,.76,1],[0,.5,0],[3,.3,2],[3,.62,2],[2,.4,0],[2,.62,2]];
/** where the green sits (inferred): a Wolfsburg block at the far end, a few along the sides; the end behind the goal is Barcelona's */
const greenAt=(si:number,a:number)=>si===3?.55:si===1?.02:a<.4?.22:.08;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a clear afternoon: the paper sky with a pale navy screen high up and a warm haze low down
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){const Bd=4000;s.tone(K,polyPath([[-Bd,-Bd],[Bd,-Bd],[Bd,hz[1]-520],[-Bd,hz[1]-460]],true),.16);
  s.tone(Y,polyPath([[-Bd,hz[1]-420],[Bd,hz[1]-460],[Bd,hz[1]+60],[-Bd,hz[1]+60]],true),.14);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D(),under=new Path2D();
 for(const i of which){const S=STANDS[i];for(let k=0;k<NSEG;k++){const a0=k/NSEG,a1=(k+1)/NSEG;addPoly(planes,polyP(c,[S(a0,0),S(a1,0),S(a1,1),S(a0,1)]));
  for(const b of WALKS)seg3(c,S(a0,b),S(a1,b),.6,walk);
  // the roof: a flat canopy cantilevered over the upper rows, with a pale fascia; the shade under it
  addPoly(roof,polyP(c,[add3(S(a0,1),[0,4,0]),add3(S(a1,1),[0,4,0]),add3(S(a1,.62),[0,11.6,0]),add3(S(a0,.62),[0,11.6,0])]));
  addPoly(under,polyP(c,[S(a0,.7),S(a1,.7),S(a1,1),S(a0,1)]));
  seg3(c,add3(S(a0,.62),[0,11.2,0]),add3(S(a1,.62),[0,11.2,0]),.9,edge);}}
 s.knockout(planes);s.tone(K,planes,.42);s.tone(R,planes,.12);s.knockout(walk,.5);
 // the crowd: Barcelona garnet, navy and yellow; a Wolfsburg green block; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS.some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.26)continue;const a=(i+.5+(hash(i+j*31,5)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0&&si===1?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hb=hash(i*7+j*53+si*3,21),ink=hb<greenAt(si,a)?4:h<.58?0:h<.72?1:h<.88?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.fill(R,inks[0],.9);s.fill(Y,inks[1],.95);s.knockout(inks[2],.85);s.fill(K,inks[3],.85);s.knockout(inks[4],.8);s.fill(G,inks[4],.9);
 s.tone(K,under,.22);s.fill(K,roof,.62);s.knockout(edge,.9);
 // flags on the stand fronts
 const red=new Path2D(),nav=new Path2D(),yel=new Path2D(),grn=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.035,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.07),P(0,.07)]);if(q.length<3)continue;
  if(kind===2){grn.addPath(polyPath(q,true));continue;}
  if(kind===0){red.addPath(polyPath(q,true));for(const u of[.2,.6])addPoly(nav,polyP(c,[P(u,.005),P(u+.2,.005),P(u+.2,.07),P(u,.07)]));}
  else{yel.addPath(polyPath(q,true));for(const bb of[.018,.034,.05])addPoly(red,polyP(c,[P(0,bb),P(1,bb),P(1,bb+.008),P(0,bb+.008)]));}}
 s.knockout(red);s.knockout(yel);s.knockout(grn);s.fill(Y,yel,.95);s.fill(R,red,.95);s.fill(K,nav,.95);s.fill(G,grn,.95);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=8+11*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- sunlit grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[6.5,0,-38.5],[6.5,0,38.5],[-111.5,0,38.5],[-111.5,0,-38.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.62);s.tone(G,gp,.34);s.tone(K,gp,.2);
 // mowing stripes
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.1);
 // advertising boards: navy with lit yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5,0,-37],[5,0,37]);board([-110,0,-37],[5,0,-37]);board([-110,0,37],[5,0,37]);
 for(let k=0;k<12;k++){const z=-35+k*6;addPoly(pn,polyP(c,[[4.9,.25,z],[4.9,.25,z+3.2],[4.9,.68,z+3.2],[4.9,.68,z]]));}
 for(const zz of[-36.9,36.9])for(let k=0;k<18;k++){const x=-107+k*6.3;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);seg3(c,[-52.6,0,0],[-52.4,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out LOW at the side where the ball went in (z ≈ −2.4) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=-2.4,back=(z:number,y:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.4,2))*(1-y/2.6);
 const zs=[z0,-2.8,-1.6,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.14);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=0;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);if(j>0){seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[K,.08]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Barcelona in the 2022–23 home kit: blaugrana stripes (garnet printed red, striped navy), dark navy shorts and socks; yellow numbers (inferred) */
const barca=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:K,shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,numberInk:Y,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
/** Wolfsburg in lime green shirts and shorts (fluorescent green ink), white socks; white numbers (inferred) */
const wob=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:G,shorts:G,socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:'paper',numberInk:'paper',hairStyle:'ponytail',build:W_BUILD(1.72,.95),shade:[K,.3],...o});
const GUI_B=W_BUILD(1.68,.94);
/** Patri Guijarro, No. 12: dark hair in a ponytail (from photographs — inferred) */
const GUI_ST=barca({number:12,hair:K,build:GUI_B,seed:12});
const AIT_B=W_BUILD(1.62,.9);
/** Aitana Bonmatí, No. 14: light-brown ponytail (inferred) */
const AIT_ST=barca({number:14,hair:[R,.42],build:AIT_B,seed:14});
/** Merle Frohms, No. 1 (keeper kit colour inferred: navy) */
const FRO_ST:AthleteStyle={shirt:[K,.62],shorts:K,socks:[K,.62],boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:Y,build:W_BUILD(1.75,.95),seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the header)
const BALL_R=.11,GRAV=9.81;
/** Graham Hansen's pass in; Bonmatí's touch; the drag inside past Rauch; the push; the lobbed cross (TF s in the air) */
const TF=1.5,T_CROSS=-TF,T_PUSH=T_CROSS-1.2,T_SKILL=T_PUSH-.75,T_RCV=T_SKILL-.8,T_GHP=T_RCV-.85;
const GH0:V3=[-27.2,BALL_R,25.4],R0:V3=[-21.2,BALL_R,19.4],R1:V3=[-20.5,BALL_R,18.0],R2:V3=[-18.9,BALL_R,17.1],C0:V3=[-16.2,BALL_R,15.7];
/** Guijarro's header spot (her pelvis ≈ 10 m out, just right of centre) and the way she faces: between the goal and the incoming cross */
const HP:[number,number]=[-10.2,1.3];
const FACE:[number,number]=(()=>{const g=nrm2(0-HP[0],-.8-HP[1]),b=nrm2(C0[0]-HP[0],C0[2]-HP[1]);return nrm2(1.3*g[0]+b[0],1.3*g[1]+b[1]);})();
const YAW_H=yawTo(0,0,FACE[0],FACE[1]);
/** her header: header() with a running spring (a smaller jump), the head and shoulders turning LEFT toward the goal through contact */
function guiHeader(u:number):Pose{const p=header(clamp(u));p.air*=.62;const w=Math.sin(Math.PI*clamp((u-.3)/.45)),sn=clamp((u-.4)/.2);
 p.neckY+=lerp(-.1,.38,sn)*w;p.twist+=lerp(-.05,.22,sn)*w;p.lean+=.08*w;return clampPose(p);}
/** contact on the header clock (athlete.ts header contact .52); the header lasts HD s; take-off TJ */
const CU=.52,HD=1.0,TJ=-CU*HD;
/** her forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(guiHeader(CU),GUI_B,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.03,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** a right-footer's cross from the right: lobbed (gravity), drifting a touch away from goal */
const SWING:V3=[-1,-GRAV,0],G3:V3=[0,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(C0,HEAD_PT,TF,SWING);
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_C=yawTo(0,0,DC[0],DC[1]);
/** Bonmatí's pelvis at the cross so her RIGHT boot meets the back of the ball (solved once, FK) */
const PCX:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.75}),AIT_B,{x:0,z:0,yaw:YAW_C});return[C0[0]-DC[0]*.1-sk.rToe[0],C0[2]-DC[1]*.1-sk.rToe[2]];})();
/** the header goes in low to Frohms's right (−z), thumped down and in (inferred) */
const TG=.46,GOAL_PT:V3=[0,.62,-2.4],NET_HIT:V3=[1.7,.45,-2.7],REST:V3=[1.3,BALL_R,-2.4];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG,G3);
const T_NET=TG+.13;

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a cumulative-distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-12,T_MAX=10,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
/** metres per full run cycle (two strides) */
const CYCLE_M=3.6;
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});

// ---------------------------------------------------------------- Guijarro: from midfield, a jog, then the late run into the gap, the header, the celebration toward the near corner
const GUI_PATH:Path=[[-12,-31.6,-5.4],[-9,-30.2,-4.6],[-6.5,-28.4,-3.6],[T_RCV,-26.6,-2.8],[T_SKILL,-25.2,-2.2],[T_PUSH,-21.8,-1.2],[T_CROSS,-17.6,-.2],
 [-.8,-13.6,.7],[TJ,HP[0]-1.2,HP[1]-.2],[0,HP[0],HP[1]],[.5,HP[0]+.6,HP[1]-.3],
 [1.6,-8.6,-3.8],[3,-7.6,-9.6],[4.6,-6.4,-15.4],[6.2,-5.4,-20.4],[8,-4.8,-23.2]];
const GUI_TAB=distTable(GUI_PATH);
const guiXZ=(tau:number):V3=>{const p=pathAt(GUI_PATH,tau);return[p[0],0,p[1]];};
const KNEE_SLIDE_T=6.3;
function guijarroPose(tau:number,it:number):Pose{
 const sp=speedAt(GUI_PATH,tau),ph=distAt(GUI_TAB,tau)/CYCLE_M;
 let p=blendPose(blendPose(READY,stand(),.4),runCycle(ph,{speed:clamp((sp-1)/6)}),sm(.5,2,sp));
 // eyes up at the cross as she comes (a look toward Bonmatí on her right while she runs)
 const look=hump(T_PUSH-.3,TJ,tau,.25);if(look>0){p={...p};p.neckY-=34*DEG*look;p.twist-=10*DEG*look;p.neckP-=12*DEG*look;p=clampPose(p);}
 // the header: run into the crouch, spring, snap through the ball
 const u=(tau-TJ)/HD;
 if(u>-.25&&u<1.1){const w=sm(-.2,.04,u)*(1-sm(.88,1.08,u));p=blendPose(p,guiHeader(clamp(u)),w);}
 // after the goal: she wheels away toward the near corner, then arms up
 if(tau>1){const s=distAt(GUI_TAB,tau);let c=celebrate(s/4,{kind:'run'});if(tau>KNEE_SLIDE_T)c=blendPose(c,celebrate(it*.9,{kind:'arms'}),clamp(1-sp/2.5)*sm(KNEE_SLIDE_T,KNEE_SLIDE_T+.8,tau));p=blendPose(p,c,sm(1,1.6,tau));}
 return p;
}
function guijarroPlace(tau:number):Place{
 const[x,z]=pathAt(GUI_PATH,tau),a=pathAt(GUI_PATH,tau+.1),b=ballAt(tau);
 let yaw=yawTo(x,z,a[0],a[1]);
 if(tau<T_RCV)yaw=lerpAng(yaw,yawTo(x,z,b[0],b[2]),.35);
 yaw=lerpAng(yaw,YAW_H,sm(TJ-.35,TJ,tau)*(1-sm(.55,1.1,tau)));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- Bonmatí: the touch, the drag inside past Rauch, the push, the RIGHT-footed lobbed cross, then the run to Guijarro
const AIT_PATH:Path=[[-12,-24.8,22.6],[-8,-23.9,21.4],[T_GHP,-22.7,20.5],[T_RCV,R0[0]-.55,R0[2]+.35],[T_SKILL,R1[0]-.5,R1[2]+.45],[T_PUSH,R2[0]-.55,R2[2]+.25],
 [T_CROSS,PCX[0],PCX[1]],[-.6,PCX[0]+DC[0]*1.3,PCX[1]+DC[1]*1.3],[1,-15,12.5],[3,-11.6,4],[5,-8.4,-7.4],[7,-6.6,-16.4],[9,-5.8,-21.2]];
const AIT_TAB=distTable(AIT_PATH);
const aitXZ=(tau:number):V3=>{const p=pathAt(AIT_PATH,tau);return[p[0],0,p[1]];};
/** the receive: a soft right-foot cushion */
const TRAP=posed({rHipF:22,rKnee:30,rAnk:10,rHipR:20,lHipF:-4,lKnee:30,lean:18,pitch:3,neckP:34,lShA:36,rShA:30,lElb:44,rElb:40});
/** the drag inside: low on a bent left leg, RIGHT sole rolling the ball across, arms out for balance, eyes on the ball */
const DRAG=posed({lHipF:26,lKnee:54,lAnk:-6,lHipA:10,rHipF:30,rKnee:34,rAnk:-24,rHipA:-6,rHipR:-10,lean:24,pitch:4,bend:-6,twist:-14,neckP:32,lShA:74,rShA:58,lShF:-6,rShF:22,lElb:34,rElb:46});
const PUSH=posed({rHipF:32,rKnee:26,rAnk:26,rHipR:16,lHipF:-6,lKnee:32,lean:16,pitch:5,neckP:18,lShA:40,rShA:26,lShF:22,rShF:-20,lElb:64,rElb:60});
function aitanaPose(tau:number,it:number):Pose{
 const sp=speedAt(AIT_PATH,tau),ph=distAt(AIT_TAB,tau)/CYCLE_M+.4;
 let p=blendPose(blendPose(READY,stand(),.4),runCycle(ph,{speed:clamp((sp-1)/6)}),sm(.5,2,sp));
 const tr=hump(T_RCV-.3,T_RCV+.25,tau,.4);if(tr>0)p=blendPose(p,TRAP,tr*.8);
 const dg=hump(T_SKILL-.35,T_SKILL+.3,tau,.4);if(dg>0)p=blendPose(p,DRAG,dg*.9);
 const pw=hump(T_PUSH-.15,T_PUSH+.2,tau,.4);if(pw>0)p=blendPose(p,PUSH,pw*.75);
 // a glance up at the box before she crosses
 p.neckP-=16*DEG*hump(T_CROSS-.9,T_CROSS-.35,tau,.35);
 const us=STRIKE_CONTACT+(tau-T_CROSS)/.8;
 if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.86,1,us));p=blendPose(p,strike(us,{foot:'r',power:.75}),w);}
 if(tau>T_NET+.4){const s=distAt(AIT_TAB,tau);let c=celebrate(s/4,{kind:'run'});if(tau>8)c=blendPose(c,celebrate(it*.9+.3,{kind:'arms'}),clamp(1-sp/2.5)*sm(8,8.8,tau));p=blendPose(p,c,sm(T_NET+.4,T_NET+1.2,tau));}
 return p;
}
function aitanaPlace(tau:number):Place{
 const[x,z]=pathAt(AIT_PATH,tau),a=pathAt(AIT_PATH,tau+.1),b=ballAt(tau);
 let yaw:number;
 if(tau<T_RCV+.1)yaw=yawTo(x,z,b[0],b[2]);
 else if(tau<T_PUSH+.2)yaw=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,-8,6),.3);
 else if(tau<T_CROSS+.55)yaw=lerpAng(yawTo(x,z,-8,6),YAW_C,sm(T_PUSH+.2,T_CROSS-.3,tau));
 else yaw=lerpAng(YAW_C,yawTo(x,z,a[0],a[1]),sm(T_CROSS+.55,T_CROSS+1.3,tau));
 if(tau>8)yaw=lerpAng(yaw,yawTo(x,z,guiXZ(tau)[0],guiXZ(tau)[2]),sm(8,8.8,tau));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- the ball
function ballAt(tau:number):V3{
 if(tau<T_GHP)return GH0;
 // Graham Hansen's pass inside to Bonmatí
 if(tau<T_RCV){const u=(tau-T_GHP)/(T_RCV-T_GHP);return mix3(GH0,R0,u*(1.35-.35*u));}
 // the drag inside under her right sole
 if(tau<T_SKILL){const u=easeInOutSine((tau-T_RCV)/(T_SKILL-T_RCV)),p=mix3(R0,R1,u);p[0]+=.15*Math.sin(Math.PI*u);return p;}
 if(tau<T_PUSH){const u=(tau-T_SKILL)/(T_PUSH-T_SKILL);return mix3(R1,R2,u*(1.3-.3*u));}
 if(tau<T_CROSS){const u=(tau-T_PUSH)/(T_CROSS-T_PUSH);return mix3(R2,C0,u*(1.5-.5*u));}
 // the lobbed cross, then the header, the net
 if(tau<0)return flyA(C0,V_CROSS,SWING,tau-T_CROSS);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau);
 if(tau<T_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/(T_NET-TG)));
 const u=clamp((tau-T_NET)/.5),b=u>=1?.08*Math.abs(Math.sin((tau-T_NET-.5)*9))*Math.exp(-(tau-T_NET-.5)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=T_CROSS?TAU*1.1*(tau+12):TAU*1.1*(T_CROSS+12)+TAU*2.4*Math.min(tau-T_CROSS,TF+T_NET)+TAU*.6*Math.max(0,tau-T_NET);
const bulgeAt=(tau:number)=>tau<T_NET-.03?0:.8*Math.exp(-(tau-T_NET+.03)*2.6)*(1+.3*Math.sin((tau-T_NET)*14));

// ---------------------------------------------------------------- everyone else
type Role='run'|'def'|'cb'|'keeper'|'passer'|'lunger';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;/** a pass: [contact τ, foot, power, target] */kick?:[number,'l'|'r',number,V3];bar:boolean;
 /** a defender turns from facing the play to chasing at this τ */turn?:number;/** ringed in the replay as a ball-watcher */watch?:boolean};
const ACTORS:Actor[]=[
 {name:'Graham Hansen',role:'passer',bar:true,st:barca({number:10,hair:[Y,.8],build:W_BUILD(1.66,.92),seed:110}),path:[[-12,-31,26.2],[-8,-29.6,26],[T_GHP,GH0[0]-.55,GH0[2]+.3],[T_SKILL,-24.4,24.6],[T_CROSS,-19.6,22.2],[0,-16.4,19.6],[3,-12.6,14],[6,-9,2],[9,-6.6,-14]],phase:.2,kick:[T_GHP,'r',.6,R0]},
 {name:'Rauch',role:'lunger',bar:false,st:wob({number:13,build:W_BUILD(1.72,.95),hair:[Y,.75],seed:113}),path:[[-12,-16.4,13.6],[-8,-17.2,15],[T_GHP,-18.2,16.2],[T_RCV,-19.1,17.4],[T_SKILL,-19.6,17.9],[T_PUSH,-19.9,17.4],[T_CROSS,-18.2,15.6],[0,-15.2,12.6],[3,-12.8,10]],phase:.3,turn:T_PUSH},
 {name:'Oberdorf',role:'def',bar:false,watch:true,st:wob({number:5,build:W_BUILD(1.73,.98),hair:[Y,.6],seed:105}),path:[[-12,-21,3.4],[-6,-19.6,5.6],[T_SKILL,-18.2,7.2],[T_CROSS,-16.2,8.4],[0,-14.6,7.2],[3,-12.6,5]],phase:.6,turn:-.4},
 {name:'Hendrich',role:'cb',bar:false,watch:true,st:wob({number:4,build:W_BUILD(1.77,1),hair:[Y,.7],seed:104}),path:[[-12,-13.6,5.4],[-6,-12,5.2],[T_SKILL,-10.6,4.8],[T_CROSS,-9.2,4.2],[0,-7.9,3.7],[3,-6.8,2.6]],phase:.1,turn:-.3},
 {name:'Janssen',role:'cb',bar:false,watch:true,st:wob({number:6,build:W_BUILD(1.75,1),hair:[Y,.85],seed:106}),path:[[-12,-13,-2.6],[-6,-11.6,-2.9],[T_SKILL,-10,-3.3],[T_CROSS,-8.6,-3.6],[0,-7.6,-3.4],[3,-6.8,-2.8]],phase:.55,turn:-.3},
 {name:'Wilms',role:'def',bar:false,watch:true,st:wob({number:2,build:W_BUILD(1.7,.95),hair:[K,.8],seed:102}),path:[[-12,-15.2,-11.6],[-6,-13.4,-10.6],[T_CROSS,-10.4,-8.4],[0,-9.4,-7.2],[3,-8.4,-6]],phase:.8,turn:-.2},
 {name:'Roord',role:'def',bar:false,st:wob({number:14,build:W_BUILD(1.76,1),hair:[Y,.7],seed:114}),path:[[-12,-27.4,-8.4],[-6,-25.8,-6.8],[T_CROSS,-22.6,-4.6],[0,-19.6,-3.2],[3,-16.6,-2]],phase:.4,turn:-.6},
 {name:'Frohms',role:'keeper',bar:false,st:FRO_ST,path:[[-12,-3.4,1.6],[-6,-2.4,2.6],[T_CROSS,-1.4,2.4],[-.5,-1.5,1.2],[0,-1.6,.8],[4,-1.6,.6]],phase:0},
 {name:'Paralluelo',role:'run',bar:true,st:barca({number:17,skin:[[Y,.46],[R,.36],[K,.2]],build:W_BUILD(1.74,.95),seed:117}),path:[[-12,-15,6.6],[-6,-12.6,6],[T_SKILL,-11,5.4],[T_CROSS,-9.4,4.8],[0,-7.4,4.2],[2,-6.6,2],[5,-6.2,-10],[8,-5.2,-19]],phase:.15},
 {name:'Caldentey',role:'run',bar:true,st:barca({number:9,build:W_BUILD(1.62,.9),seed:109}),path:[[-12,-14.6,-4.2],[-6,-12.8,-4.4],[T_CROSS,-9.6,-4.6],[0,-7.2,-4.8],[2,-6.8,-8],[5,-6,-15],[8,-5.4,-21.6]],phase:.9},
 {name:'Walsh',role:'run',bar:true,st:barca({number:21,build:W_BUILD(1.69,.92),hair:[Y,.7],seed:121}),path:[[-12,-36,2.4],[-6,-34,2.2],[T_CROSS,-30.4,1.8],[0,-29.4,1.4],[4,-26,-2]],phase:.65},
];
const SHAPE=posed({lHipF:26,rHipF:22,lKnee:36,rKnee:34,lHipA:12,rHipA:12,lean:18,pitch:3,lShA:24,rShA:24,lShF:12,rShF:10,lElb:48,rElb:48,neckP:-2});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
const actorXZ=(n:string,tau:number):V3=>{const a=ACTORS.find(q=>q.name===n)!,[x,z]=pathAt(a.path,tau);return[x,0,z];};
/** one actor's pose + place at τ (it = idle clock). Barcelona celebrate after the goal; Wolfsburg heads drop. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(SHAPE,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='keeper'){
  // Frohms shuffles across with the cross; the header goes low to her right — a late dive
  let kp=blendPose(keeperSet(it*1.3),runCycle(ph,{speed:.3}),sm(1,2.2,sp)*.8);
  if(tau>.05){const u=clamp((tau-.05)/1.1);kp=blendPose(kp,keeperDive(u*.85,{side:'r',height:.2}),sm(.05,.16,tau)*(1-sm(2.6,3.2,tau)));}
  if(tau>2.6)kp=blendPose(kp,SLUMP,sm(2.6,3.2,tau)*.6);
  return{pose:kp,place:{x,z,yaw:tau<.05?toBall:lerpAng(toBall,yawTo(x,z,HEAD_PT[0],HEAD_PT[2]),sm(.05,.2,tau))}};
 }
 if(a.role==='lunger'){
  // Rauch closes Bonmatí down, jabs at the ball as it is dragged inside past her, then turns to chase
  const u=(tau-(T_SKILL-.45))/.9;if(u>0&&u<1.3)p=blendPose(SHAPE,lunge(clamp(u),{side:'r'}),sm(0,.15,u)*(1-sm(1,1.3,u)));
  const chase=sm(a.turn!,a.turn!+.5,tau);yaw=lerpAng(toBall,heading,chase*sm(1.2,3,sp));
 }
 if(a.role==='def'||a.role==='cb'){
  // holding the line, facing the ball (ball-watching); a late turn toward the goal
  const turn=a.turn??-.3,chase=sm(turn,turn+.45,tau);yaw=lerpAng(toBall,yaw,chase*.6);
 }
 if(a.kick){const[t0,foot,power,tgt]=a.kick,us=STRIKE_CONTACT+(tau-t0)/.8;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,yawTo(x,z,tgt[0],tgt[2]),w);}}
 if(tau>T_NET+.2&&sp<1.4){if(a.bar)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the sprints, the cross, the header, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball on screen
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&((tau>T_CROSS&&tau<T_NET)||(tau>T_GHP&&tau<T_RCV-.1))){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(280,d*1.5),spread:r*.9,width:Math.max(2.5,r*.18),cov:.85});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:G,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=guijarroPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=guijarroPose(tp,e.it),prev={pose:guijarroPose(tpPrev,e.it-1/12),place:guijarroPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(GUI_ST,d,true),pl,prev,!!e.smear&&tp>T_PUSH&&tp<5);}});}
 {const pl=aitanaPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=aitanaPose(tp,e.it),prev={pose:aitanaPose(tpPrev,e.it-1/12),place:aitanaPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(AIT_ST,d,true),pl,prev,!!e.smear&&tp>T_RCV&&tp<T_CROSS+.6);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='keeper'||a.role==='lunger'),cur.place,prev,!!e.smear&&(a.role==='keeper'&&tp>0&&tp<1.1||a.role==='lunger'&&tp>T_SKILL-.5&&tp<T_PUSH));}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5+2,Math.min(1.4,y/5)*.5+.6,z/5];}
/** smoothed ground points under the two heroes (cameras ride these) */
const gxz=(tau:number):V3=>{let x=0,z=0;for(let i=-2;i<=2;i++){const p=pathAt(GUI_PATH,tau+i*.1);x+=p[0];z+=p[1];}return[x/5,0,z/5];};
const axz=(tau:number):V3=>{let x=0,z=0;for(let i=-2;i<=2;i++){const p=pathAt(AIT_PATH,tau+i*.1);x+=p[0];z+=p[1];}return[x/5,0,z/5];};

/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring on the grass around a ground point (radius in metres), drawn as a projected ellipse */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[P[0]+Math.cos(a)*rm*(.7+.3*u),.02,P[2]+Math.sin(a)*rm*(.7+.3*u)]);if(q)pts.push(q);}if(pts.length<10)return;
 const w=Math.max(5,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** where the cross will land: a yellow ring on the grass under the header point */
const LAND:V3=[HEAD_PT[0],0,HEAD_PT[2]];
/** "the read": a dashed yellow sight line from Guijarro's eyes to a point — it draws out with u */
function sightLine(s:Sheet,c:Cam,tau:number,to:V3,u:number){if(u<=.02)return;
 const g=gxz(tau),E:V3=[g[0],1.52,g[2]],end=mix3(E,to,u);
 arrow3(s,c,[E,mix3(E,end,.5),end],Math.max(6,kAt(c,E)*.06),Y,.95,true);}
/** her run to come, drawn ahead of her on the grass into the gap */
function runAhead(s:Sheet,c:Cam,t0:number,u:number){if(u<=.02)return;const pts:V3[]=[];const t1=lerp(t0,0,u);for(let i=0;i<=10;i++){const p=pathAt(GUI_PATH,lerp(t0,t1,i/10));pts.push([p[0],.03,p[1]]);}
 arrow3(s,c,pts,Math.max(6,kAt(c,pts[0])*.16),Y,.9);}
/** the ball-watchers, ringed red */
function watchRings(s:Sheet,c:Cam,tau:number,u:number){if(u<=.02)return;for(const a of ACTORS)if(a.watch){const[x,z]=pathAt(a.path,tau);groundRing(s,c,[x,0,z],.8,u,R,a.name.length*7);}}
/** the header, played forward first time: a red arrow from her head to the goal */
function headArrow(s:Sheet,c:Cam,u:number){if(u<=.02)return;const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(HEAD_PT,V_HEAD,G3,TG*u*i/8));arrow3(s,c,q,Math.max(8,kAt(c,HEAD_PT)*.07),R,.95);}
/** the header's trail: yellow, from her forehead into the net */
function headTrail(s:Sheet,c:Cam,tau:number,fade:number){if(tau<=0||fade<=.02)return;const pts:Pt[]=[];const n=14,te=Math.min(tau,T_NET);
 for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(0,te,i/n)));if(p)pts.push(p);}if(pts.length<3)return;
 const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.1);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}
/** the cross's trail: a dashed yellow arc from Bonmatí's boot */
function crossTrail(s:Sheet,c:Cam,tau:number,fade:number){if(tau<=T_CROSS||fade<=.02)return;const pts:Pt[]=[];const te=Math.min(tau,0),n=16;
 for(let i=0;i<=n;i++){const p=pr(c,flyA(C0,V_CROSS,SWING,(te-T_CROSS)*i/n));if(p)pts.push(p);}if(pts.length<3)return;
 const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);const d=ribbon(pts,Math.max(5,kAt(c,C0)*.05),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*fade);s.fill(Y,d,.9*fade);}
const spark=(s:Sheet,c:Cam,tau:number,at:number,P:V3,seed:number,big=.55)=>{const hit=sm(at-.02,at+.04,tau)*(1-sm(at+.1,at+.3,tau));if(hit<=0)return;const q=pr(c,P);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(34,kAt(c,P)*big)*hit,{n:9,seed,width:Math.max(4,kAt(c,P)*.05)});};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** real time (keyed to the cues so each beat lands on its words): the drag on "skips free", the cross on "In comes", the header on "Header" */
const tau1=(t:number)=>{const a=CUE(0,'Aitana Bonmatí'),sk=CUE(0,'skips free'),pg=CUE(0,'Patri Guijarro'),ic=CUE(0,'In comes'),hd=CUE(0,'Header')+.1;
 return key(t,mono([[0,T_RCV-(a+.1)],[a+.1,T_RCV],[sk+.2,T_SKILL],[pg+.1,T_PUSH],[ic+.1,T_CROSS],[hd,0],[SECS(0),SECS(0)-hd]]),linear);};
const P1:V3=[-26,21,-62];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-22,.6,14],fov:13})],
  [CUE(0,'Aitana Bonmatí')-.6,1.2,()=>({P:P1,T:mix3(panTarget(tau),add3(axz(tau),[0,.6,0]),.5),fov:9})],
  [CUE(0,'Patri Guijarro')-.3,1.4,()=>({P:P1,T:mix3(add3(axz(tau),[0,.6,0]),add3(gxz(tau),[0,.6,0]),.5),fov:12.5})],
  [CUE(0,'In comes')-.2,1.2,()=>({P:P1,T:mix3(panTarget(tau),[-8,1,1],.5),fov:11.5})],
  [CUE(0,'Goal')+.4,1.6,()=>({P:P1,T:add3(gxz(tau),[0,1,0]),fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=CUE(0,'Header')+.1+T_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),q=pr(c,add3(gxz(tau1(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a LOW camera on the six-yard box looking back up her run: the ball-watchers, the read, the run into the gap
const tau2=(t:number)=>key(t,mono([[0,T_PUSH-.5],[CUE(1,'Watch Patri')+.3,T_PUSH-.25],[CUE(1,'Every defender'),T_PUSH+.15],[CUE(1,'reads where'),T_CROSS-.15],[CUE(1,'will land'),T_CROSS+.3],[CUE(1,'runs into'),-.75],[SECS(1),-.42]]),linear);
/** the replay camera rides low behind her left shoulder as she runs in, looking past her at the box and the landing spot */
function cam2(t:number):Cam{
 const tau=tau2(t),g=gxz(tau);
 return plan(t,[
  [0,0,()=>({P:add3(g,[-6.4,1.9,-3.4]),T:mix3(add3(g,[0,1.1,0]),[-12,1,6],.35),fov:30})],
  [CUE(1,'Every defender')-.3,1.2,()=>({P:add3(g,[-6.8,2.2,-3.8]),T:mix3(add3(g,[0,1,0]),[-9,1,2],.55),fov:34})],
  [CUE(1,'reads where')-.3,1.2,()=>({P:add3(g,[-6,2,-3.2]),T:mix3(add3(g,[0,1.1,0]),[LAND[0],1,LAND[2]],.5),fov:32})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tE=CUE(1,'Every defender'),tR=CUE(1,'reads where'),tL=CUE(1,'will land'),tU=CUE(1,'runs into');
  stadium(s,c,t,[0,1,3]);
  ground(s,c);
  watchRings(s,c,tau,sm(tE-.1,tE+.4,t,easeOutBack)*(1-sm(SECS(1)-.9,SECS(1)-.5,t)));
  groundRing(s,c,LAND,1.1,sm(tL-.1,tL+.4,t,easeOutBack),Y,23);
  runAhead(s,c,tau,sm(tU-.1,tU+.7,t,easeOut)*(1-sm(SECS(1)-.9,SECS(1)-.5,t)));
  crossTrail(s,c,tau,1);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:70});
  // the read, drawn on top so it reads from her eyes to where the cross will land
  sightLine(s,c,tau,[LAND[0],.3,LAND[2]],sm(tR-.05,tR+.5,t,easeOut)*(1-sm(SECS(1)-.9,SECS(1)-.5,t)));
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(gxz(tau2(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · second replay, LOW BEHIND THE GOAL through the net: the one-touch header comes at us past Frohms; then the celebration
const tau3=(t:number)=>{const o=CUE(2,'One touch'),th=CUE(2,'thumping header'),mf=CUE(2,'Merle Frohms'),sg=CUE(2,'second goal');
 return key(t,mono([[0,-.95],[o+.2,-.12],[th+.25,.08],[mf+.3,.45],[sg,1.3],[SECS(2),1.3+(SECS(2)-sg)*.9]]),linear);};
const E3:V3=[5.2,1.35,2.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),g=gxz(tau);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HEAD_PT[0],1.5,HEAD_PT[2]-.4],fov:15})],
  [CUE(2,'thumping header')-.1,.8,()=>({P:add3(E3,[.2,-.1,-.3]),T:[HEAD_PT[0]*.6,1.1,-1],fov:28})],
  [CUE(2,'second goal')-.4,1.4,()=>({P:add3(E3,[1,.8,-2]),T:add3(g,[0,1.1,0]),fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tS=CUE(2,'second goal');
  stadium(s,c,t,[0,2,3],{roar:sm(tS-.4,tS,t),flash:sm(tS-.4,tS-.1,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  headTrail(s,c,tau,1-sm(T_NET+.4,T_NET+1.2,tau));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06),only:60});
  spark(s,c,tau,0,HEAD_PT,12,.8);
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(gxz(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:1.4,
};

// ---------------------------------------------------------------- 4 · the lesson from a raised three-quarter angle behind her: read it early → step in → play it forward first time
const tau4=(t:number)=>{const r=CUE(3,'Reading early'),w=CUE(3,'wins the ball'),rp=CUE(3,'read the pass'),st=CUE(3,'step in'),tp=CUE(3,'then pass');
 return key(t,mono([[0,T_PUSH-.3],[r,T_PUSH],[w,T_CROSS-.35],[rp,T_CROSS],[st,T_CROSS+.55],[tp,-.12],[tp+.9,TG+.1],[SECS(3),TG+.5]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),g=gxz(tau);
 return plan(t,[
  [0,0,()=>({P:add3(g,[-6,4.2,-6]),T:mix3(add3(g,[0,.8,0]),[LAND[0],.8,LAND[2]+3],.45),fov:36})],
  [CUE(3,'step in')-.4,1.2,()=>({P:[HP[0]-8,4.8,HP[1]-7],T:[HP[0]+1,.8,HP[1]+1],fov:34})],
  [CUE(3,'then pass')-.2,1.4,()=>({P:[HP[0]-8,4.6,HP[1]-6],T:[-3.5,1,-.4],fov:36})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tR=CUE(3,'Reading early'),tRP=CUE(3,'read the pass'),tS=CUE(3,'step in'),tP=CUE(3,'then pass');
  stadium(s,c,t,[0,1,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // read it early: the landing spot ringed as the cross is still on Bonmatí's foot; step in: her run into the gap; forward first time: the red arrow
  groundRing(s,c,LAND,1.1,Math.max(sm(tR-.1,tR+.4,t,easeOutBack)*.8,sm(tRP-.1,tRP+.4,t,easeOutBack)),Y,31);
  runAhead(s,c,Math.min(tau,T_CROSS),sm(tS-.1,tS+.6,t,easeOut)*(1-sm(tP+.4,tP+.9,t)));
  headArrow(s,c,sm(tP-.1,tP+.6,t,easeOut));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:60});
  sightLine(s,c,Math.min(tau,T_CROSS),add3(aitXZ(Math.min(tau,T_CROSS)),[0,1.1,0]),sm(tR-.05,tR+.45,t,easeOut)*(1-sm(tRP-.2,tRP+.2,t)));
  sightLine(s,c,Math.min(tau,T_CROSS),[LAND[0],.3,LAND[2]],sm(tRP-.05,tRP+.45,t,easeOut)*(1-sm(tS+.6,tS+1,t)));
 },
 still:6,
};

const film:RisoStory={
 id:'guijarro-signature',format:'11v11',title:"Guijarro's early read",
 theme:'Read the play early, step in, then play it forward straight away: Patri Guijarro reads where the ball is going before anyone else',
 ageNote:'Barcelona 3–2 Wolfsburg, 2023 UEFA Women’s Champions League final, Philips Stadion, Eindhoven, 3 June 2023 (Guijarro’s headed equaliser, 50’). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#44d62c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: the early read — a dashed yellow sight line runs out to a landing ring, then a red arrow fires the ball forward. Reduced motion: the still marks. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.3),r=rng(seed);
  const ring:Pt[]=[];for(let i=0;i<=20;i++){const a=i/20*TAU;ring.push([x+Math.cos(a)*34*Math.min(1,u*1.4),y+Math.sin(a)*18*Math.min(1,u*1.4)]);}
  if(ring.length>2)s.fill(Y,ribbon(ring,8,{seed,close:true,taper:0,wobble:1}),.95*fade);
  const k=clamp(u*1.6-.6);if(k>0){const pts:Pt[]=[];for(let i=0;i<=10;i++){const q=i/10*k;pts.push([x+20+200*q,y-10-40*q+30*q*q]);}s.fill(R,ribbon(pts,10,{seed:seed+1,taper:.9,pressure:.3,wobble:1}),.95*fade);
   const e=pts[pts.length-1];footballPanels(s,e[0],e[1],22,{rot:age*8+r()*TAU,key:K,shadow:G,seed:5});}
  else footballPanels(s,x,y-26,22,{rot:r()*TAU,key:K,shadow:G,seed:5});
 },
};
export default film;
