/** Gary Neville — "Signature: the overlap in the FA Cup final" (lib/town/iconicPlays.json, kind:"signature"; lesson: "When your winger
 * cuts inside, sprint round the outside: give them a pass option on the outside so they have a choice"). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print.
 *
 * THE MOMENT (why it shows the signature): Manchester United 3–0 Millwall, FA Cup final, Millennium Stadium, Cardiff, 22 May 2004, the 44th
 * minute. The right-back's overlapping run: while United's right winger (Cristiano Ronaldo, the number 7 who replaced Beckham on that wing)
 * went INSIDE to attack the far post, Neville ran on past him on the OUTSIDE and into the penalty area, was played in by Roy Keane and chipped
 * the cross back across the box that Ronaldo headed in. It is the best-documented Neville assist I could confirm in writing, and it is
 * exactly the signature: a full-back arriving outside and beyond his winger with a crossing option.
 *   WHY NOT A BECKHAM MOMENT: the obvious candidate — the 1999 Champions League final, where (Wikipedia) "United won a corner when Effenberg
 *   deflected Gary Neville's cross over the Bayern goal line" and Beckham's corner brought Sheringham's equaliser — could not be confirmed
 *   for the side of the pitch or the build-up (several sources, none says where the cross came from, and I could not rule out that it came
 *   from the LEFT). A film showing it would have been an invention, so this film uses the 2004 goal, whose side and build-up ARE written
 *   down, and the narration never claims Beckham.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2004 FA Cup final" (raw wikitext, wiki-2004-fa-cup-final.txt): 22 May 2004, 15:00 BST, Millennium Stadium, Cardiff,
 *    71,350, "scattered clouds, 13 °C"; "a minute before the interval, Roy Keane played in Gary Neville as the right-back moved into the
 *    penalty area and Neville chipped a cross back across the box; Millwall player-manager Dennis Wise waited for the ball to arrive, but in
 *    doing so, he allowed Ronaldo to steal in and head the ball past Marshall"; goal 44'; line-ups and shirt numbers (Neville 2, Ronaldo 7,
 *    Keane 16 captain, Fletcher 24, Scholes 18, Giggs 11, Van Nistelrooy 10; Millwall Marshall 33, Wise 19, Ryan 3, Lawrence 2, Ward 12,
 *    Elliott 25, Livermore 8, Sweeney 26); kit table (United red shirts, white shorts, white socks with red tops — the sock image
 *    Kit_socks_mufc0204h2.png was checked; Millwall blue shirts with WHITE sleeves, blue shorts, blue socks).
 *  - BBC Sport, "Man Utd win FA Cup" (22 May 2004) http://news.bbc.co.uk/sport1/hi/football/fa_cup/3725063.stm — "United manoeuvred the ball
 *    crisply from left to right and Ronaldo attacked the far post to head Gary Neville's tempting cross past Marshall"; "Ronaldo, wearing gold
 *    boots"; the line-ups.
 *  - The Guardian, Kevin McCarra, "United triumph by taking the job seriously" (24 May 2004)
 *    https://www.theguardian.com/football/2004/may/24/match.manchesterunited — "Millwall resistance had been broken just before the interval
 *    when Wise failed to respond to Gary Neville's searching cross and Ronaldo danced in front of him to finish with a downward header."
 *  - (rejected, see above) Wikipedia "1999 UEFA Champions League final"; BBC "Key moments" 353890.stm; Guardian Sheringham blog (2009).
 * CONFIRMED by those accounts: match, date, stadium, kick-off (afternoon), the minute (44', "a minute before the interval"), 0–0 before it;
 *   the move going left to right; KEANE plays Neville in; Neville, the right-back, moving INTO the penalty area on United's right; a CHIPPED
 *   cross back across the box; Ronaldo attacking the FAR post, stepping in front of Wise, who waited for the ball; a DOWNWARD header past
 *   Marshall; Ronaldo's gold boots; numbers and kits as listed (Keane captain).
 * INFERRED (illustrative reconstruction, never named in the narration): the exact route of the move before Keane (a pass from Fletcher is a
 *   stand-in for "left to right"); every position, run and timing in metres and seconds; Ronaldo starting wide and cutting inside with his
 *   marker (Ryan) following him, which is what opens the outside lane for Neville's overlap (the accounts only place Ronaldo at the far
 *   post); Neville's RIGHT foot for the cross and a slight out-swing; the header's direction (down and back toward the middle of the goal on
 *   one bounce); Marshall starting near his near post and going the wrong way, untouched; where the other players stood; Marshall's kit
 *   (drawn grey); hair; the camera side (the main camera on United's right, United attacking left → right on screen); the roof drawn open in
 *   afternoon light; crowd colours and which end is whose; the pitch size (105 × 68). The lesson chapter's arrows are TEACHING MARKS (the
 *   two options the overlap creates), not passes that were played.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Keane passes, Neville races into the box, the
 * chipped cross, Ronaldo's header, the goal); ch2 = the slow-motion REPLAY from a low camera behind the right flank: Ronaldo goes inside, his
 * defender follows, Neville sprints round the outside into the space (a yellow lane marks his run); ch3 = a second REPLAY angle high behind
 * the goal: the cross drops toward Wise, Ronaldo steals in front and heads it down past Marshall; ch4 = the lesson: the moment frozen
 * mid-overlap with teaching marks (Neville's outside lane, a ring on the defender who cannot cover both, two option arrows). Composed on the
 * FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hair and hems, motionSmear on the cross, the header and Marshall's dive; Millwall's white sleeves are printed by the
 * adapter over the upper arm). Handedness: the world is right-handed (x toward Millwall's goal, y up, +z = United's right), exactly
 * athlete.ts's convention, so strike({foot:'r'}) is the RIGHT foot and the right wing is +z. Ronaldo meets the cross facing it (toward +z),
 * so the goal is on his LEFT: the header is a nod down with the head turning to his left. Inks: yellow, red, blue, navy. Everything is keyed
 * to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small figures
 * print at 'low', every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc,PASSAGE} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Every cue starts with a plain word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Just before half-time',text:'Cardiff, May 2004, the FA Cup final: Manchester United against Millwall, a minute before half-time. Roy Keane passes, and right-back Gary Neville races into the box. He chips a cross... Ronaldo heads it in. Goal!',tail:2.4,
  cues:['Cardiff','FA Cup final','Millwall','Roy Keane passes','Gary Neville races','into the box','chips a cross','Ronaldo heads','Goal']},
 {label:'The overlap',text:'Watch his run. Ronaldo goes inside, and his defender follows. So Neville sprints round the outside, into space.',tail:1.6,
  cues:['Watch his run','Ronaldo goes inside','defender follows','sprints round','into space']},
 {label:'Far post',text:'From behind the goal: the cross drops toward a defender, but Ronaldo steals in front to head it down. United lead!',tail:2.2,
  cues:['From behind','cross drops','Ronaldo steals','head it down','United lead']},
 {label:'Give a choice',text:'Like Neville: give your winger a pass option on the outside, so they have a choice.',tail:2.2,
  cues:['Like Neville','give your winger','pass option','outside','choice']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/gary-neville-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/gary-neville-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/gary-neville-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('neville: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('neville: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
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
/** Pitch: Millwall's goal line is x = 0 (United attack +x), goal centre z = 0, +z = United's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Millennium Stadium on a May afternoon: a steep closed bowl, open roof, four masts
/** stand planes (a along, b up the rake 0..1): 0 the +z side (the camera side), 1 behind Millwall's goal (+x), 2 the −z side, 3 the other
 * end. Close to the pitch and steep (no running track), three tiers on every side. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,13,a),1.3+36*b,41+30*b],
 (a,b)=>[10+26*b,1.3+33*b,lerp(-52,52,a)],
 (a,b)=>[lerp(13,-118,a),1.3+36*b,-41-30*b],
 (a,b)=>[-115-26*b,1.3+33*b,lerp(52,-52,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] (the closed bowl corners, one chamfer each) */
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=15,TIER=[.34,.67];
/** crowd colours (inferred): United red behind Millwall's goal (stand 1), Millwall blue at the far end (stand 3), mixed along the sides */
function crowdInk(si:number,a:number,h:number,hb:number):number{
 const red=si===1?.66:si===3?.08:a<.5===(si===0)?.2:.42,blue=si===3?.6:si===1?.05:.28;
 return hb<red?1:hb<red+blue?4:h<.64?0:h<.93?2:3;}
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a bright May afternoon through the open roof: a light blue screen, a warm band low down
 s.field(B,.16,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-480],[1e4,hz[1]-480],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.14);
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),under=new Path2D(),edge=new Path2D(),mast=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  // the fixed roof over the stands: a pale deck sloping in from the rim, its dark underside, a paper lip along the open centre
  addPoly(roof,polyP(c,[add3(S(0,1),[0,3,0]),add3(S(1,1),[0,3,0]),add3(S(1,.62),[0,17,0]),add3(S(0,.62),[0,17,0])]));
  addPoly(under,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.62),[0,15.6,0]),add3(S(0,.62),[0,15.6,0])]));
  seg3(c,add3(S(0,.62),[0,16.8,0]),add3(S(1,.62),[0,16.8,0]),.8,edge);}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,3,0]),add3(Bs(aj,1),[0,3,0]),add3(Bs(aj,.62),[0,17,0]),add3(A(ai,.62),[0,17,0])]));
  // the four corner masts: tall white needles above the roof, cables down to the roof lip
  const foot=mix3(A(ai,1),Bs(aj,1),.5),top=add3(foot,[0,58,0]);if(toCam(c,foot)[2]>NEAR+4){seg3(c,add3(foot,[0,3,0]),top,2.2,mast);
   seg3(c,top,add3(A(ai,.62),[0,17,0]),.35,edge,.8);seg3(c,top,add3(Bs(aj,.62),[0,17,0]),.35,edge,.8);}}
 // red seats under the crowd, paper tier fascias
 s.knockout(planes);s.tone(R,planes,.42);s.tone(K,planes,.28);s.knockout(tier,.85);
 // the crowd: seeded dots (red, blue, paper, navy, a few yellow), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   inks[crowdInk(si,a,h,hash(i*7+j*53+si*3,21))].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.95);s.fill(Y,inks[3],.95);s.fill(B,inks[4],.95);
 s.knockout(under);s.tone(K,under,.55);s.knockout(roof,.92);s.tone(B,roof,.1);s.knockout(edge,.85);s.stroke(K,edge,1.2,.5);
 s.knockout(mast);s.stroke(K,mast,1.6,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-115,0,-41],[10,0,-41],[10,0,41],[-115,0,41]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.93);s.tone(B,gp,.78);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: red with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.4,0,-37.5],[5.4,0,37.5]);board([-110,0,-37.5],[5.4,0,-37.5]);board([-110,0,37.5],[5.4,0,37.5]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.3,.25,z],[5.3,.25,z+3.3],[5.3,.68,z+3.3],[5.3,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(R,bd,.85);s.fill(K,bd,.3);s.knockout(pn,.85);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** Millwall's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back/roof out around (bz, by) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.3,0,1.3,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Manchester United 2004 (Wikipedia kit table): red shirts, white shorts, white socks with red tops (trim = the red sock tops); paper numbers */
const mun=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:R,numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Millwall 2004 (kit table): blue shirts with white sleeves (sleeves printed by drawPlayer), blue shorts and socks; paper numbers */
const mil=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:[B,.9],socks:B,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
const B_NEV:Build={height:1.8,bulk:.98},B_RON:Build={height:1.86,bulk:.9,thighs:1.04},B_KEA:Build={height:1.78,bulk:1.02,thighs:1.05},B_WIS:Build={height:1.68,bulk:.98},B_MAR:Build={height:1.88,bulk:1.1};
const NEV_ST=mun({number:2,hair:[K,.85],build:B_NEV,seed:2});
/** Ronaldo's gold boots (BBC: "wearing gold boots") print yellow */
const RON_ST=mun({number:7,hair:K,skin:SKIN_M,boots:Y,build:B_RON,seed:7});
const KEA_ST=mun({number:16,hair:[K,.8],build:B_KEA,seed:16});
/** Marshall's kit colour is not in the sources: drawn grey (inferred) */
const MAR_ST:AthleteStyle={shirt:[K,.45],shorts:[K,.8],socks:[K,.6],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',gloves:'paper',sleeves:'long',hairStyle:'short',number:33,numberInk:'paper',build:B_MAR,seed:33};
const WIS_ST=mil({number:19,build:B_WIS,seed:19});
const RYA_ST=mil({number:3,build:{height:1.78},seed:3});

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Neville's cross)
const BALL_R=.11,GRAV=9.81;
/** the chipped cross flies TF s to Ronaldo's forehead; the header bounces at TB and crosses the goal line at TG */
const TF=1.3,TB=TF+.3,TG=TB+.2;
/** Ronaldo's header spot (his pelvis): the far post, ≈ 5.4 m out; he faces the cross (toward +z), the goal on his LEFT */
const HP:[number,number]=[-5.4,-2.5],YAW_H=yawTo(.12,1);
/** Ronaldo's header: header() nodding DOWN, head and shoulders turning to his LEFT (toward goal) */
function ronHeader(u:number):Pose{const p=header(clamp(u));const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.18);
 p.neckY+=lerp(-.08,.5,sn)*w;p.twist+=lerp(-.04,.3,sn)*w;p.neckP+=lerp(0,.32,sn)*w;return p;}
const CU=.48,HD=.95,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(ronHeader(CU),B_RON,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the build-up: Fletcher → Keane ("left to right"), Keane → Neville inside the box, Neville's touch to the cross spot P0 */
const FP=-5.6,KR=-4.4,KP=-2.75,NR=-1.05;
const FA:V3=[-34.6,BALL_R,1.6],KA:V3=[-29.6,BALL_R,11],KB:V3=[-28.4,BALL_R,12],NB:V3=[-12.4,BALL_R,19.8],P0:V3=[-8.6,BALL_R,17.9];
/** the chipped cross: gravity plus a slight pull AWAY from goal (a right-footer's out-swing from the right) */
const SWING:V3=[-.9,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
const G3:V3=[0,-GRAV,0];
/** the header: down to one bounce, then in low past Marshall */
const BN:V3=[-2.1,BALL_R,-1.2],GOAL_PT:V3=[0,.45,-.55],NET_HIT:V3=[1.5,.5,-.2],REST:V3=[1.2,BALL_R,-.1];
const V_HEAD=launch(HEAD_PT,BN,TB-TF,G3),V_BOUNCE=launch(BN,GOAL_PT,TG-TB,G3);
/** where a kicker's pelvis stands so his RIGHT boot meets the back of the ball, striking along (dx,dz) (solved once, FK) */
function kickerAt(ball:V3,dir:[number,number],build:Build):[number,number]{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),build,{x:0,z:0,yaw:yawTo(dir[0],dir[1])});return[ball[0]-dir[0]*.12-sk.rToe[0],ball[2]-dir[1]*.12-sk.rToe[2]];}
const DF=nrm2(KA[0]-FA[0],KA[2]-FA[2]),DK=nrm2(NB[0]-KB[0],NB[2]-KB[2]),DR=nrm2(P0[0]-NB[0],P0[2]-NB[2]);
/** Neville's body at the cross: between his run (DR) and the ball's flight, so the right foot swings across it */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),DN=nrm2(DR[0]*.55+DC[0]*.45,DR[1]*.55+DC[1]*.45),YAW_N=yawTo(DN[0],DN[1]);
const PCF=kickerAt(FA,DF,{height:1.8}),PCK=kickerAt(KB,DK,B_KEA),PCN=kickerAt(P0,DN,B_NEV);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='nev'|'ron'|'kea'|'fle'|'gk'|'wise'|'mun'|'mil';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean;sleeves?:boolean};
const T0=-10,T1=10,DT=.02;
const ACTORS:Actor[]=[
 {name:'Gary Neville',role:'nev',hero:true,style:NEV_ST,keys:[[T0,-51,27.4],[-7.5,-46,27.3],[-5.6,-39.5,27],[-4.4,-33,26.3],[KP,-23.5,24.3],[NR,NB[0]-DR[0]*.55,NB[2]-DR[1]*.55+.2],[-.4,PCN[0]-DR[0]*2.5,PCN[1]-DR[1]*2.5],[0,...PCN],[.5,PCN[0]+DR[0]*1.7,PCN[1]+DR[1]*1.7],[2.2,-4.9,14.6],[TG+2,-6.2,8],[T1,-8,4]]},
 {name:'Cristiano Ronaldo',role:'ron',hero:true,style:RON_ST,keys:[[T0,-30,25],[-7.5,-26,24.5],[-5.6,-23.5,21.5],[-4.4,-20.5,17.5],[KP,-16.5,11],[NR,-12,4.5],[0,-9,.4],[TJ-.35,-6.2,-1.6],[TJ-.05,...HP],[TF+.05,...HP],[TF+.55,HP[0]+.4,HP[1]-.3],[TG+1.4,-8,-8],[TG+3.2,-12,-14],[T1,-15,-18]]},
 {name:'Roy Keane',role:'kea',hero:true,style:KEA_ST,keys:[[T0,-32,7.4],[-7,-31.4,8.4],[FP,-30.8,9.6],[KR,KA[0]-DF[0]*.55,KA[2]-DF[1]*.55],[KP,...PCK],[KP+.8,PCK[0]+DK[0]*1.4,PCK[1]+DK[1]*1.4],[T1,-20,13]]},
 {name:'Andy Marshall',role:'gk',hero:true,style:MAR_ST,keys:[[T0,-2.4,.6],[-3,-1.8,1.6],[-1,-1.5,2.6],[0,-1.4,2.7],[TF-.1,-1.1,2.3],[TF+.1,-1.0,2.1],[T1,-1,2]]},
 {name:'Dennis Wise (waits for the ball)',role:'wise',hero:true,sleeves:true,style:WIS_ST,keys:[[T0,-13,-3.8],[-4,-9.5,-4.2],[-1,-7,-4.1],[0,-6.5,-4],[TF,-6.2,-3.9],[T1,-6,-3.8]]},
 {name:'Robbie Ryan (follows Ronaldo inside)',role:'mil',hero:true,sleeves:true,style:RYA_ST,keys:[[T0,-28,23.5],[-7.5,-24.6,23],[-5.6,-22.3,20.3],[-4.4,-19.2,16.2],[KP,-15.6,10.2],[NR,-11.8,6.3],[0,-9.8,4.4],[TF,-8.6,3.4],[T1,-8.2,3]]},
 {name:'Darren Fletcher',role:'fle',style:mun({number:24,build:{height:1.83,bulk:.92},seed:24}),keys:[[T0,-39,-1.2],[-7.5,-37.6,-.2],[FP,...PCF],[FP+.8,PCF[0]+DF[0]*1.2,PCF[1]+DF[1]*1.2],[T1,-30,5]]},
 {name:'Peter Sweeney (chasing Neville)',role:'mil',sleeves:true,style:mil({number:26,seed:26}),keys:[[T0,-40,22],[-5.6,-33,23.4],[KP,-25,22.6],[NR,-16,20.8],[0,-12.6,19.4],[TF,-10.6,18],[T1,-9.4,16.5]]},
 {name:'David Livermore',role:'mil',sleeves:true,style:mil({number:8,seed:8}),keys:[[T0,-26,5],[FP,-27,7.5],[KR,-27,9.6],[KP,-26.3,10.8],[T1,-22,10]]},
 {name:'Ruud van Nistelrooy',role:'mun',style:mun({number:10,build:{height:1.88},seed:10}),keys:[[T0,-17,1],[-4,-13.5,1.2],[0,-10.8,1.6],[TF,-10,1.2],[TG+.8,-9.4,.4],[TG+2.5,-9.6,-5.6],[T1,-11.6,-10]]},
 {name:'Matt Lawrence',role:'mil',sleeves:true,style:mil({number:2,build:{height:1.85},seed:12}),keys:[[T0,-15.5,2.8],[-4,-12,2.6],[0,-9.6,2.8],[TF,-8.8,2.2],[T1,-8.4,2]]},
 {name:'Darren Ward',role:'mil',sleeves:true,style:mil({number:12,build:{height:1.9},seed:13}),keys:[[T0,-10,7],[-2,-8,6.4],[0,-6.8,5.6],[TF,-6,4.4],[T1,-5.8,4]]},
 {name:'Paul Scholes',role:'mun',style:mun({number:18,hair:[Y,.5],build:{height:1.7},seed:18}),keys:[[T0,-24,-3],[-3,-19.5,-2.5],[0,-17.5,-2],[TF,-16.4,-1.6],[TG+2,-12,-8],[T1,-13,-12]]},
 {name:'Ryan Giggs',role:'mun',style:mun({number:11,build:{height:1.8},seed:11}),keys:[[T0,-30,-24],[-3,-23,-21],[0,-19,-18],[TF,-17,-16],[T1,-15,-15]]},
 {name:'Marvin Elliott',role:'mil',sleeves:true,style:mil({number:25,skin:SKIN_D,seed:25}),keys:[[T0,-14,-16],[0,-9.5,-11],[TF,-8.5,-9.5],[T1,-8,-9]]},
];
const NEV=0,RON=1,KEA=2,GK=3,WIS=4,RYA=5,FLE=6;
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
/** a ground pass that slows as it rolls */
const roll=(A:V3,Bp:V3,t0:number,t1:number,tau:number):V3=>{const u=clamp((tau-t0)/(t1-t0)),s=u*(1.35-.35*u);return mix3(A,Bp,s);};
function ballAt(tau:number):V3{
 if(tau<=FP)return FA;
 if(tau<KR)return roll(FA,KA,FP,KR,tau);
 if(tau<KP)return roll(KA,KB,KR,KP,tau);
 if(tau<NR)return roll(KB,NB,KP,NR,tau);
 if(tau<0)return roll(NB,P0,NR,0,tau);
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TB)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG)return flyA(BN,V_BOUNCE,G3,tau-TB);
 if(tau<TG+.12)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.12));
 const u=clamp((tau-TG-.12)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.67)*9))*Math.exp(-(tau-TG-.67)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=FP?0:tau<0?(tau-FP)*TAU*1.6:tau<TF?-FP*TAU*1.6+tau*TAU*3:-FP*TAU*1.6+TF*TAU*3+(tau-TF)*TAU*2;
const bulgeAt=(tau:number)=>tau<TG+.06?0:Math.exp(-(tau-TG-.06)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // open-play readiness: knees bent, weight forward, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:20,rHipF:16,lKnee:26,rKnee:22,lean:12,pitch:4,neckP:-8,lShA:20,rShA:18,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** a pass (right foot) on the clock around contact time tc, blended over the run */
function kick(pose:Pose,tau:number,tc:number,dur=.9,w=1):Pose{const ww=win(tau,tc-.5,tc+.7,.2)*w;return ww>0?blendPose(pose,strike(clamp((tau-tc)/dur+STRIKE_CONTACT),{foot:'r'}),ww):pose;}
/** Marshall: set, shuffling across as the cross flies, then a late low dive to his right as the header bounces past */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.18}),T_DV=TF+.12,DV_L=1.1;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'nev':{
   pose=kick(pose,tau,0,.85);
   const w=sm(-.45,-.12,tau)*(1-sm(.5,1,tau));yaw=lerpAng(yaw,YAW_N,w);
   if(tau>.6&&tau<TG+.5)yaw=lerpAng(yaw,faceYaw(k,tau,ballAt(Math.min(tau,TG))),sm(.6,1,tau));
   if(tau>TG+.4){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.5,TG+1.1,tau)*.7);}
   break;}
  case 'ron':{
   // the burst in front of Wise, the spring, the nod down to his left, the landing, arms up and away
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=ronHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   const w=sm(TJ-.5,TJ-.15,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);
   if(tau>TG+.5){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau));}
   break;}
  case 'kea':pose=kick(pose,tau,KP);if(tau>KR-.4&&tau<KP+.6){const d=tau<KR+.3?[-DF[0],-DF[1]]:DK;yaw=lerpAng(yaw,yawTo(d[0],d[1]),win(tau,KR-.4,KP+.6,.3));}
   if(tau>TG+.4){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.5,TG+1.1,tau)*.6);}break;
  case 'fle':pose=kick(pose,tau,FP);if(tau<FP+.6)yaw=lerpAng(yaw,yawTo(DF[0],DF[1]),win(tau,FP-1.2,FP+.6,.4));break;
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.4,.8,tau)*.5*(1-sm(TF-.6,TF-.3,tau)));
   if(tau>T_DV-.1){pose=blendPose(pose,DIVE((tau-T_DV)/DV_L),.75*sm(T_DV-.1,T_DV+.1,tau)*(1-sm(TG+.9,TG+1.5,tau)));}
   if(tau>TG+1.2)pose=blendPose(pose,DEJECT,sm(TG+1.4,TG+2.2,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF+.05));if(tau>TG+.6)yaw=lerpAng(yaw,Math.PI,sm(TG+.6,TG+1.2,tau));break;}
  case 'wise':{// waits for the ball to drop: a flat-footed half-step, then a late small hop as Ronaldo nips in front; hands on hips
   if(tau>TF-.35&&tau<TF+.8){const hp=header(clamp((tau-(TF-.2))/.95));hp.air*=.2;pose=blendPose(pose,hp,sm(TF-.35,TF-.2,tau)*(1-sm(TF+.4,TF+.8,tau))*.7);}
   if(tau>TF+.7)pose=blendPose(pose,DEJECT,sm(TF+.7,TF+1.5,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'mil':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'mun':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?, captain?, sleeves?): athlete.ts figure; prev = the pose one drawn frame earlier
 * (secondary motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the cross, the header, the dive);
 * captain = the armband on the left upper arm; sleeves = Millwall's white short sleeves printed over the upper arm (athlete.ts has no
 * sleeve ink) — both only when that arm faces the camera and the figure is big enough. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false,captain=false,sleeves=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const r=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(r.detail==='low'||!(captain||sleeves))return r;
 const sk=r.sk,cc=toCam(camera,sk.chest);
 if(sleeves){const sl=new Path2D();for(const[sh,el] of [[sk.lSh,sk.lEl],[sk.rSh,sk.rEl]] as [V3,V3][]){if(toCam(camera,mix3(sh,el,.3))[2]<cc[2]+.04)seg3(camera,mix3(sh,el,.06),mix3(sh,el,.44),.13,sl);}
  s.knockout(sl);s.stroke(K,sl,1.6,.8);}
 if(captain){const a=mix3(sk.lSh,sk.lEl,.3),b=mix3(sk.lSh,sk.lEl,.46),ca=toCam(camera,a);
  if(ca[2]<cc[2]+.06){const band=new Path2D();seg3(camera,a,b,.14,band);s.knockout(band);s.fill(Y,band,.95);s.stroke(K,band,2,.85);}}
 return r;
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
const FULL_CAP=3;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean;captain?:boolean;sleeves?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null,cap=FULL_CAP):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,preview=s.arrival<PASSAGE.seam-1e-3,scr0=s._passage.screen,passing=!!s._passage.pending||preview;
 // heat cap: at most `cap` big non-hero figures print at full detail (the nearest); the rest print 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>cap?near[cap-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  // true off-canvas cull (reads the live transform, so it also holds inside the passage's zoom; the preview culls to the aperture's bounds)
  {const d=m.transformPoint(new DOMPoint(g[0],g[1])),rr=k*ppu*s.dpr;let x0=0,y0=0,x1=s.width*s.dpr,y1=s.height*s.dpr;
   if(preview&&scr0){x0=Math.max(x0,Math.min(...scr0.map(p=>p[0])));x1=Math.min(x1,Math.max(...scr0.map(p=>p[0])));y0=Math.max(y0,Math.min(...scr0.map(p=>p[1])));y1=Math.min(y1,Math.max(...scr0.map(p=>p[1])));}
   if(d.x<x0-rr||d.x>x1+rr||d.y<y0-rr||d.y>y1+rr)continue;}
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing,!!f.captain,!!f.sleeves);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:number}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,captain:k===KEA,sleeves:!!a.sleeves,
  smear:o.smear&&((k===RON&&tau>TJ-.4&&tau<TF+.3)||(k===NEV&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DV&&tau<T_DV+.6))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]},o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time before and after, keyed so Keane passes on "Roy Keane passes", the cross leaves on "chips a cross" and
 * the header lands on "Ronaldo heads" (a gentle slow-down of ≲ 1.5× between those beats) */
function tau1(t:number){const tK=CUE(0,'Roy Keane passes')+.3,tC=CUE(0,'chips a cross')+.15,tH=CUE(0,'Ronaldo heads')+.05,S=SECS(0);
 return key(t,mono([[0,Math.max(T0+.2,KP-tK)],[tK,KP],[tC,0],[tH,TF],[S+1,TF+S+1-tH]]),linear);}
const P1:V3=[-19,27,76];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-26,0,10],fov:18})],
  [CUE(0,'Millwall')-.2,1.4,()=>({P:P1,T:mix3(gnd(b,1),[-24,1,16],.3),fov:13})],
  [CUE(0,'Roy Keane')-.4,1,()=>({P:P1,T:mix3(gnd(b,1),at(NEV,tau,1),.4),fov:11})],
  [CUE(0,'Gary Neville')-.2,1,()=>({P:P1,T:mix3(gnd(b,1),at(NEV,tau,1),.5),fov:9.5})],
  [CUE(0,'chips a cross')-.1,.9,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[HP[0],1.5,HP[1]],.35+.5*sm(0,TF,tau)),fov:lerp(12,15,sm(-.1,.7,tau))})],
  [CUE(0,'Ronaldo heads')-.3,.6,()=>({P:P1,T:[HP[0]+1.8,1.2,HP[1]+.6],fov:6.5})],
  [CUE(0,'Goal')+.3,1.5,()=>{const w=at(RON,tau,1.2);return{P:P1,T:mix3(w,[-6,1.2,-6],.3),fov:10};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'Goal'),tN=CUE(0,'Ronaldo heads')+.4;
  stadium(s,c,t,[2,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tA-.1,tA+.4,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Ronaldo heads')+.3;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind the right flank: the overlap
const tau2=(t:number)=>key(t,mono([[0,-7],[CUE(1,'Ronaldo goes'),-5.9],[CUE(1,'defender follows'),-4.5],[CUE(1,'sprints round'),-3.2],[CUE(1,'into space'),-1.6],[SECS(1)-.2,-.5]]),linear);
const E2:V3=[-50,2.2,33];
function cam2(t:number):Cam{
 const tau=tau2(t),n=at(NEV,tau,1.2),r=at(RON,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(n,r,.6),fov:30})],
  [CUE(1,'Ronaldo goes')-.3,1,()=>({P:add3(E2,[2,0,-.5]),T:mix3(n,r,.62),fov:28})],
  [CUE(1,'sprints round')-.3,1.2,()=>({P:add3(n,[-13,1.4,5.5]),T:mix3(n,r,.35),fov:32})],
  [CUE(1,'into space')-.2,1.1,()=>({P:add3(n,[-12,1.8,4.5]),T:mix3(n,[-11,1,19],.45),fov:34})],
 ]);
}
/** a ribbon along an actor's run on the grass, from τ a to τ b (the replay graphic) */
function runRibbon(s:Sheet,c:Cam,k:number,a:number,b:number,ink:string,fade:number,w=.9){
 if(fade<=0||b<=a)return;const pts:Pt[]=[];for(let i=0;i<=22;i++){const[x,z]=posOf(k,lerp(a,b,i/22)),p=pr(c,[x,.02,z]);if(p)pts.push(p);}
 if(pts.length<3)return;const ww=Math.max(6,kAt(c,at(k,b,0))*w*.5);s.knockout(ribbon(pts,ww*1.4,{taper:.8,pressure:.2,wobble:0}),.5*fade);s.fill(ink,ribbon(pts,ww,{taper:.8,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tI=CUE(1,'Ronaldo goes'),tS=CUE(1,'sprints round');
  stadium(s,c,t,[1,2]);
  ground(s,c);
  // replay graphics: Ronaldo's inside run (red) from "goes inside", Neville's outside lane (yellow) from "sprints round"
  runRibbon(s,c,RON,-7,Math.max(-6.99,tau),R,sm(tI-.2,tI+.3,t)*.9);
  runRibbon(s,c,NEV,-7,Math.max(-6.99,tau),Y,sm(tS-.2,tS+.3,t));
  play(s,c,tau,tp,{smear:true,min:10,cap:2});
 },
 aperture(t){const c=cam2(t),st=stateOf(NEV,tau2(twos(t))),sk=solve(st.pose,B_NEV,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'sprints round')+.4;},
};

// ---------------------------------------------------------------- 3 · a second replay high behind the goal: the cross, Wise waits, Ronaldo steals in
const tau3=(t:number)=>key(t,mono([[0,-.7],[CUE(2,'cross drops'),.1],[CUE(2,'Ronaldo steals'),TJ-.2],[CUE(2,'head it down'),TF+.02],[CUE(2,'United lead'),TG+.5],[SECS(2),TG+2.8]]),linear);
const E3:V3=[12,9.5,-8];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(RON,tau,1.2),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-7,1.6,5],fov:36})],
  [CUE(2,'cross drops')-.2,1,()=>({P:E3,T:mix3(add3(gnd(b),[0,Math.min(3,b[1]),0]),[HP[0],1.6,HP[1]],.5),fov:32})],
  [CUE(2,'Ronaldo steals')-.3,.9,()=>({P:add3(E3,[-1,-.5,.5]),T:mix3(r,at(WIS,tau,1.3),.35),fov:20})],
  [CUE(2,'head it down')-.2,.8,()=>({P:add3(E3,[-1,-.5,.5]),T:mix3([HEAD_PT[0],1.2,HEAD_PT[2]],[-1,.6,-.6],.4),fov:24})],
  [CUE(2,'United lead')+.1,1.4,()=>({P:[2,5,-16],T:mix3(r,[-6,1,-6],.3),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tE=CUE(2,'United lead');
  stadium(s,c,t,[3,0,2],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tE,tE+.3,t))});
  ground(s,c);
  // the replay graphic: the cross's path so far, a fading yellow ribbon
  const cf=1-sm(TF+.1,TF+.6,tau);if(cf>0&&tau>0){const pts:Pt[]=[];const a=Math.max(0,tau-1.1),b=Math.min(tau,TF);for(let i=0;i<=20;i++){const p=pr(c,ballAt(lerp(a,b,i/20)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,ballAt(b))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*cf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*cf);}}
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),cap:2});
  const hit=(tau-TF)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),st=stateOf(RON,tau3(twos(t))),sk=solve(st.pose,B_RON,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'head it down')+.15;},
};

// ---------------------------------------------------------------- 4 · the lesson: the overlap frozen mid-run, with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-5],[CUE(3,'Like Neville'),-4.5],[CUE(3,'pass option'),-3.6],[CUE(3,'outside'),-3.15],[CUE(3,'choice'),-2.95],[SECS(3),-2.82]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),n=at(NEV,tau,1),k=at(KEA,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-46,7.5,33],T:mix3(n,k,.45),fov:27})],
  [CUE(3,'pass option')-.3,1,()=>({P:[-45,6.5,32],T:mix3(n,at(RYA,tau,1),.35),fov:24})],
  [CUE(3,'choice')-.3,1,()=>({P:[-46,9,31],T:mix3(k,mix3(n,at(NEV,NR,1),.5),.5),fov:32})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a flat dashed ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<12;i++)gaps.push([(i+.66)/12,(i+.96)/12]);
 const d=ribbon(pts.concat([pts[0]]),Math.max(7,kAt(c,P)*.11),{seed:31,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tL=CUE(3,'Like Neville'),tW=CUE(3,'give your winger'),tP=CUE(3,'pass option'),tO=CUE(3,'outside'),tC=CUE(3,'choice');
  stadium(s,c,t,[2,1]);
  ground(s,c);
  // "give your winger …": a red arrow of Ronaldo's inside run, the defender who follows him ringed red
  const wi=sm(tW-.2,tW+.4,t);
  if(wi>0){const pts:V3[]=[];for(let i=0;i<=8;i++){const[x,z]=posOf(RON,lerp(tau,tau+2.2,i/8*sm(tW,tW+.9,t,easeInOutSine)));pts.push([x,.02,z]);}arrow3(s,c,pts,Math.max(7,kAt(c,at(RON,tau,0))*.07),R,.85*wi);
   groundRing(s,c,at(RYA,tau,0),1.1,R,wi*(1-sm(tC+.8,tC+1.4,t)));}
  // "pass option … on the outside": Neville's lane lights up yellow down the touchline side, into the box
  const op=sm(tP-.2,tP+.4,t);groundRing(s,c,at(NEV,tau,0),1,Y,op);
  const lo=sm(tO-.2,tO+.4,t);if(lo>0){const pts:V3[]=[];const u=sm(tO,tO+1,t,easeInOutSine);for(let i=0;i<=8;i++){const[x,z]=posOf(NEV,lerp(tau,NR,u*i/8));pts.push([x,.02,z]);}arrow3(s,c,pts,Math.max(9,kAt(c,at(NEV,tau,0))*.09),Y,.95*lo);}
  // "a choice": two option arrows from the ball — inside to Ronaldo (red), outside into Neville's run (yellow)
  const ch=sm(tC-.1,tC+.5,t);
  if(ch>0){const b=gnd(ballAt(tau),.03),u=sm(tC,tC+.7,t,easeInOutSine),ro=at(RON,tau+.8,.03),ne=at(NEV,NR-.2,.03);
   const line=(e:V3)=>{const pts:V3[]=[];for(let i=0;i<=5;i++)pts.push(mix3(b,mix3(b,e,.9),u*i/5));return pts;};
   if(u>.05){arrow3(s,c,line(ro),Math.max(7,kAt(c,b)*.06),R,.9*ch);arrow3(s,c,line(ne),Math.max(7,kAt(c,b)*.06),Y,.95*ch);}}
  play(s,c,tau,tp,{min:12,cap:2});
 },
 get still(){return CUE(3,'choice')+.5;},
};

const film:RisoStory={
 id:'gary-neville-signature',format:'11v11',title:'Neville: the overlap',
 theme:'The overlapping full-back: give your winger a pass option on the outside so they have a choice',
 ageNote:'Manchester United 3–0 Millwall, FA Cup final, Cardiff, 22 May 2004. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: an overlap — a yellow lane sweeps round the outside of the touch point and a ball is chipped back across. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.35),fade=1-clamp((age-.6)/.2);
  if(fade>0){const pts:Pt[]=[];for(let i=0;i<=10;i++){const a=Math.PI*(1-i/10*u);pts.push([x+Math.cos(a)*110,y-Math.sin(a)*70]);}if(pts.length>2)s.fill(Y,ribbon(pts,12,{taper:.7,wobble:.4}),.9*fade);}
  if(age>.3&&fade>0){const bx=x+110-220*easeOut(out),by=y-70*Math.sin(Math.PI*out);footballPanels(s,bx,by,28,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});}
 },
};
export default film;
/** Solved contact points (pitch metres; Millwall's goal line x = 0, +z = United's right) — checked by tests/play-film-gary-neville-signature.cjs. */
export const FACTS={P0,NB,KB,HEAD_PT,HP,GOAL_PT,BN,TF,TB,TG,KP,NR,ballAt,crossFoot:'r' as const,
 nevilleContact:()=>{const st=stateOf(NEV,0),sk=solve(st.pose,B_NEV,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 keaneContact:()=>{const st=stateOf(KEA,KP),sk=solve(st.pose,B_KEA,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 nevilleAt:(tau:number)=>{const[x,z]=posOf(NEV,tau);return[x,z] as [number,number];},
 ronaldoAt:(tau:number)=>{const st=stateOf(RON,tau),sk=solve(st.pose,B_RON,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis,yaw:st.place.yaw??0};},
 ryanAt:(tau:number)=>{const[x,z]=posOf(RYA,tau);return[x,z] as [number,number];},
 wiseAt:(tau:number)=>{const st=stateOf(WIS,tau),sk=solve(st.pose,B_WIS,st.place);return{head:sk.head,pelvis:sk.pelvis};},
 marshallAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_MAR,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
