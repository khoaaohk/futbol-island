/** Benzema's signature — "drop, link and finish". Chelsea 1–3 Real Madrid, UEFA Champions League quarter-final first leg, Stamford Bridge,
 * London, Wednesday 6 April 2022 (20:00 local, a wet night). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture
 * window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the 21st-minute opening goal from WRITTEN accounts and
 * one match photograph (the broadcast footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: kind "signature", "Signature: drop, link and finish", lesson "A striker can drop deep to help
 * build attacks, then sprint into the box to finish"): the Guardian's match report describes this exact goal as the signature itself —
 * "Vinícius playing a double one-two with Benzema and crossing for the France striker to direct a glorious header beyond Mendy. It was a
 * superb goal, made possible by Benzema dropping deep to link play". His third goal that night (pressing Mendy's mistake) and his goals v
 * PSG and in the 2018 final were pressing goals, so they would not show the drop-link-finish.
 *
 * SOURCES (fetched Sept 2026 with curl, cached under the session scratchpad films/src-cache/):
 *  - The Guardian, Jacob Steinberg, "Karim Benzema hat-trick for Real Madrid puts Chelsea on brink of exit", match report, 6 April 2022
 *    https://www.theguardian.com/football/2022/apr/06/chelsea-real-madrid-champions-league-quarter-final-first-leg-match-report
 *    (the double one-two / "dropping deep to link play" lines above; "the visitors wanted to exploit the gaps behind James. Chelsea's right
 *    wing-back was not protecting Christensen and that weakness proved pivotal after 21 minutes"; Benzema 34, Modrić 36)
 *  - The Guardian, Barry Glendenning, minute-by-minute, 6 April 2022 (pages 1 and 2)
 *    https://www.theguardian.com/football/live/2022/apr/06/chelsea-v-real-madrid-champions-league-quarter-final-first-leg-live
 *    ("GOAL! Chelsea 0-1 Real Madrid (Benzema 21) What a header! Karim Benzema sends Real Madrid in front with a splendid effort into the top
 *    corner from 12 yards after getting on the end of a Vinicius Junior pull-back"; "It's has been bucketing down at Stamford Bridge";
 *    "Mason Mount, looking like a drowned rat in the pouring rain"; both line-ups; referee Clément Turpin (France))
 *  - The Guardian photograph (Tony O'Brien/Reuters) captioned "Real Madrid's Karim Benzema wheels away in celebration after scoring their
 *    first goal": Real Madrid in WHITE shirts and shorts with NAVY socks; Chelsea's Christensen (No 4) in ROYAL BLUE shirt and shorts with
 *    WHITE socks; goalkeeper Édouard Mendy (No 16) in ORANGE, on the ground in the goalmouth; rain falling; Vinícius running to Benzema.
 *  - Wikipedia, "2021–22 UEFA Champions League knockout phase" (raw): 6 April 2022, Stamford Bridge, Benzema 21', 24', 46', attendance 38,689.
 * CONFIRMED: the match, date, ground, the 21st minute and 0–0 before it; a wet night; Benzema dropped deep to link play; Vinícius played a
 * DOUBLE one-two with him; Vinícius crossed / pulled it back from Madrid's LEFT (the space behind James, Chelsea's right wing-back, next to
 * Christensen); Benzema HEADED it from about 12 yards into the TOP CORNER past Mendy; the kits (photo); the line-ups — Chelsea: Mendy;
 * Christensen, Thiago Silva, Rüdiger; James, Kanté, Jorginho, Azpilicueta; Mount, Pulisic, Havertz — Real Madrid: Courtois; Carvajal, Militão,
 * Alaba, F. Mendy; Modrić, Casemiro, Kroos; Valverde, Benzema, Vinícius Júnior.
 * INFERRED (illustrative): every exact position, path and timing; where on the left the one-twos happened (drawn about 35 m out, in the
 * inside-left channel) and which feet played the passes (right feet); Vinícius crossing with his RIGHT foot from the left edge of the box;
 * the header going into the FAR top corner (Madrid's right, +z) with a small leap and Mendy diving late to his left; which way Madrid attacked
 * on screen (left to right from the main-stand camera, so Madrid's left is the FAR touchline); the other players' positions; the referee's
 * dark kit; the celebration toward Vinícius. The narration names none of the kit colours, the corner's side or the feet.
 * The stadium (not from a fetched source): Stamford Bridge's rectangular, roofed stands close to the pitch, two tiers, blue seats, a mostly
 * Chelsea-blue crowd with a small white away section in one corner, stewards in yellow hi-vis in front of the boards (seen in the photo).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (the drop, the two one-twos, the sprint, the
 * cross, the header, the net); ch2 = the slow-motion replay from a LOW camera behind the play in Madrid's half (Benzema comes back, the passes
 * go in and back twice, then he races away); ch3 = a second replay angle from BEHIND THE GOAL (the cross, the header, the top corner, the
 * celebration); ch4 = the lesson: a raised camera behind the move (the drop arrow, the link passes, the sprint arrow into the box, the finish).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), kept in the central ~1000 units so it frames
 * from the 1.45:1 card window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every
 * figure inside a passage print at `low`. Handedness: the world is right-handed (x toward Chelsea's goal, y up, +z = the main-stand side =
 * Madrid's RIGHT as they attack), athlete.ts's own convention, so right feet strike without a mirrored projector. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,header,runCycle,dribble,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/benzema-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/benzema-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'London, 2022. Real Madrid are at Chelsea. Karim Benzema drops deep to help. A one-two with Vinícius... and another! Now he sprints into the box. The cross... header! Goal!',tail:2.6,
  cues:['London','Chelsea','Karim Benzema','drops deep','A one-two','another','sprints','The cross','header','Goal']},
 {label:'Watch again',text:'Watch again, slowly. Benzema comes back to link play. He passes to Vinícius and gets it back. Then again! Then he races forward!',tail:1.6,
  cues:['Watch again','comes back','passes to Vinícius','gets it back','Then again','races forward']},
 {label:'Top corner',text:'Vinícius crosses, and Benzema heads it into the top corner. What a finish!',tail:2.2,
  cues:['Vinícius crosses','heads it','top corner','What a finish']},
 {label:'Your turn',text:'Your turn: a striker can drop deep to help build attacks, then sprint into the box to finish.',tail:2.4,
  cues:['Your turn','drop deep','build attacks','sprint into the box','to finish']},
];
import timingJson from '../../../public/plays/narration/benzema-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('benzema: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('benzema: no cue '+w);return c.at;};
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
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Chelsea's goal line is x = 0 (Madrid attack +x), goal centre z = 0, +z = the main-stand side, the halfway line x = −52.5. */
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
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- Stamford Bridge at night: rectangular roofed stands tight to the pitch
const CXS=-52.5,NS=56,PE=.16;
/** a point on the stand ring: angle th round the pitch centre (0 = behind Chelsea's goal, +90° = the main stand), d metres out from the
 * ring's inner edge (a near-rectangle ~5 m outside the lines), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(57.5+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(39+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=26;
/** ~40° rake: two tiers climbing to ~26 m */
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.3+24*b];
type Bowl={seg:V3[][];roof:V3[][];seats:{P:V3;h:number;away:boolean}[];lamps:[V3,V3][];tiers:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],seats:[],lamps:[],tiers:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,SD1-7,y1+2.4),rim(b,SD1-7,y1+2.4),rim(b,SD1+2,y1+3.6),rim(a,SD1+2,y1+3.6)]);
  if(i%2===0)o.lamps.push([rim(a,SD1-6.6,y1+2.1),rim(b,SD1-6.6,y1+2.1)]);
  {const[d,y]=RAKE(.5);o.tiers.push([rim(a,d,y),rim(b,d,y)]);}
  for(let r=0;r<7;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.16)continue;const[d,y]=RAKE((r+.5)/7);
   // a small away section in one corner (inferred position)
   const away=r<3&&i>=NS-5;
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a wet April night in London: a deep printed navy sky
 s.field(K,.76,.5);s.field(B,.26,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(bowl);s.tone(B,bowl,.5);s.tone(K,bowl,.34);
 // the crowd: one mark per seat group; mostly Chelsea blue and navy, a few white shirts, phone lights (yellow); a small white away corner
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0&&q.away?roar*z*1.4*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.away?(q.h<.85?0:2):q.h<.5?1:q.h<.82?2:q.h<.95?0:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(B,inks[1],.75);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.95);
 const tf=new Path2D();for(const[a,b] of BOWL.tiers){if(toCam(c,a)[2]<14||toCam(c,b)[2]<14)continue;seg3(c,a,b,.8,tf,1);}s.knockout(tf,.55);s.tone(B,tf,.25);
 s.knockout(roof);s.fill(K,roof,.92);
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+4)continue;seg3(c,a,b,.9,lamp);seg3(c,a,b,3.6,glow);}
 s.tone(Y,glow,.32);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, stewards, corner flags, the goal
const ringPts=(d:number,n=72):V3[]=>{const o:V3[]=[];for(let i=0;i<n;i++)o.push(rim(i/n*TAU,d,0));return o;};
const GRASS=ringPts(0);
/** stewards in yellow hi-vis sitting in front of the boards (photo), every ~7 m */
const STEWARDS:V3[]=(()=>{const o:V3[]=[];for(let k=0;k<9;k++)o.push([5,0,-26+k*6.5]);for(let k=0;k<14;k++){o.push([-100+k*7.4,0,-38.6]);o.push([-100+k*7.4,0,38.6]);}return o;})();
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,GRASS);if(g.length<3)return;const gp=polyPath(g,true);
 // floodlit wet grass
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.14);
 // advertising boards (generic: navy with pale panels) behind the goal and along both touchlines
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([4,0,-28],[4,0,28]);board([-108,0,-37.2],[2.5,0,-37.2]);board([-108,0,37.2],[2.5,0,37.2]);
 for(let k=0;k<9;k++){const z=-26+k*6;addPoly(pn,polyP(c,[[3.9,.25,z],[3.9,.25,z+3.1],[3.9,.68,z+3.1],[3.9,.68,z]]));}
 for(const zz of[-37.1,37.1])for(let k=0;k<18;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.45);
 // stewards: small hi-vis blocks (one yellow fill)
 const sw=new Path2D();for(const P of STEWARDS){const q=toCam(c,P);if(q[2]<6)continue;const p=scr(c,q),k=c.F/q[2];addPoly(sw,[[p[0]-.28*k,p[1]-1.05*k],[p[0]+.28*k,p[1]-1.05*k],[p[0]+.3*k,p[1]-.35*k],[p[0]-.3*k,p[1]-.35*k]]);}
 s.fill(Y,sw,.95);
 // painted lines
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out HIGH in the top corner at z +2.8 (the header) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=2.8,back=(z:number,y=0)=>X+2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.5,2))*(y>1?1:.3);
 const zs=[z0,-1.8,0,1.8,2.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,2),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,2),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,2),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,2),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,2),1.9,z],.022,mesh,.7);seg3(c,[back(z,2),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}
/** the rain ("bucketing down"): slanted paper streaks falling in screen space, one knockout + one light screen; seeded, on twos */
function rain(s:Sheet,t:number,o:{n?:number;len?:number;w?:number}={}){
 if(s._passage.pending)return;
 const{n=46,len=58,w=2.4}=o,v=view(s),tt=twos(t),p=new Path2D(),dx=-.22;
 for(let i=0;i<n;i++){const x0=(hash(i,21)*2-1)*v.hx,sp=1+hash(i,22)*.6,y=((hash(i,23)+tt*1.7*sp)%1)*2*v.hy-v.hy,x=x0+dx*(y+v.hy),L=len*(.7+.6*hash(i,24));
  p.moveTo(x-w/2,y);p.lineTo(x+w/2,y);p.lineTo(x+w/2+dx*L,y+L);p.lineTo(x-w/2+dx*L,y+L);p.closePath();}
 s.knockout(p,.55);s.tone(B,p,.08);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Real Madrid: white shirts and shorts, NAVY socks, navy trim and numbers (the Guardian/Reuters photograph of the goal) */
const real=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Chelsea: royal blue shirts and shorts, white socks, white numbers (the photograph: Christensen, No 4) */
const chelsea=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,numberInk:'paper',hairStyle:'short',...o});
/** Benzema: 1.85 m, strong; short dark hair and a beard (the beard reads through the navy key line of the jaw at card sizes) */
const BENZ_B={height:1.85,bulk:1.06};
const BENZ_ST=real({number:9,build:BENZ_B,skin:SKIN_M,seed:9});
const VINI_B={height:1.76,bulk:.94};
const VINI_ST=real({number:20,build:VINI_B,skin:SKIN_D,hairStyle:'curly',seed:20});
/** Édouard Mendy: orange goalkeeper kit (photo), 1.94 m */
const MENDY_ST:AthleteStyle={shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_D,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:16,numberInk:K,build:{height:1.94},seed:16};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'bald',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- the move (τ = seconds after the header)
/** pelvis place so that the ball sits at a boot: `ahead` metres in front along the facing, `side` metres to the right (+) */
function footPlace(ball:[number,number],yaw:number,ahead=.42,side=.16):[number,number]{const fx=Math.cos(yaw),fz=-Math.sin(yaw),rx=Math.sin(yaw),rz=Math.cos(yaw);return[ball[0]-fx*ahead-rx*side,ball[1]-fz*ahead-rz*side];}
/** ball points on the grass (x,z): Vinícius's first pass, Benzema's return, Vinícius's second pass, Benzema's lay-off into the channel,
 * the dribble and the cross point at the left edge of the box (all inferred positions) */
const VP1:[number,number]=[-41.2,-24.2],BK1:[number,number]=[-37.6,-15.2],VR1:[number,number]=[-34.6,-24.6],VP2:[number,number]=[-33.1,-24.2],
 BK2:[number,number]=[-29.6,-15.8],VR2:[number,number]=[-20.6,-23.8],D1:[number,number]=[-15.2,-22.3],CRB:[number,number]=[-10.1,-20.2],CR:[number,number]=[-9.4,-19.7];
const T_P1=-7.4,T_B1=-6.75,T_V1=-6.05,T_P2=-5.35,T_B2=-4.75,T_V2=-3.65,T_D1=-2.5,T_CRB=-1.4,T_CR=-1.05;
/** the header: from ~12 yards (confirmed), just left of centre; into the top corner (the far one, inferred) */
const GOAL_PT:V3=[0,2.08,2.8];
const HX=-11.3,HZ=-.8;
/** he faces between the incoming cross (from his left) and the corner he aims at */
const YAW_H=yawTo(HX,HZ,GOAL_PT[0],GOAL_PT[2])+22*RAD;
const HD=.95,H_ST=-.52*HD;
const hPose=(tau:number)=>header(clamp((tau-H_ST)/HD));
/** his forehead at contact relative to the pelvis (FK, solved once) */
const BROW=(()=>{const sk=solve(hPose(0),BENZ_B,{x:0,z:0,yaw:YAW_H});return add3(mix3(sk.head,sk.face,.7),[0,.06,0]);})();
const HP:V3=[HX,BROW[1],HZ];
const HPL:[number,number]=[HX-BROW[0],HZ-BROW[2]];
/** passes: facings */
const Y_P1=yawTo(VP1[0],VP1[1],BK1[0],BK1[1]),Y_B1=yawTo(BK1[0],BK1[1],VR1[0],VR1[1])+30*RAD,Y_P2=yawTo(VP2[0],VP2[1],BK2[0],BK2[1]),Y_B2=yawTo(BK2[0],BK2[1],VR2[0],VR2[1])+25*RAD;
const Y_CR=yawTo(CR[0],CR[1],HX,HZ)+10*RAD;
const FLY_C=-T_CR,FLY_H=.72,IN_NET=FLY_H+.1;
/** the celebration: he wheels away toward Vinícius, near the left corner of the box (inferred; the photo shows Vinícius running to him) */
const CEL:[number,number]=[-7.4,-13.8];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'real'|'chelsea'|'gk'|'ref';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const B1P=footPlace(BK1,Y_B1),B2P=footPlace(BK2,Y_B2),V1P=footPlace(VP1,Y_P1),V2P=footPlace(VP2,Y_P2),VCP=footPlace(CR,Y_CR);
const ACTORS:Actor[]=[
 // Benzema: comes back from the line (the drop), plays the first one-two, moves on, plays the second, then sprints into the box
 {name:'Benzema',role:'hero',st:BENZ_ST,key:true,keys:[[-10,-27.4,-8.2],[-9.2,-29.4,-9.6],[-7.8,-35,-13.3],[T_B1,...B1P],[-6.2,-36.4,-15.4],[-5.4,-32.6,-15.6],[T_B2,...B2P],[-4.2,-28.2,-14.4],[-3.4,-25,-11.8],[-2.2,-19.6,-7.6],[-1.1,-15.2,-4],[-.45,HPL[0]-1.6,HPL[1]-.6],[0,...HPL],[.55,HPL[0]+1.3,HPL[1]+.1],[1.5,HPL[0]+2.2,HPL[1]-1.6],[3,-8.2,-9.8],[4.4,...CEL],[12,...CEL]]},
 {name:'Vinícius',role:'real',st:VINI_ST,key:true,keys:[[-10,-46.6,-25.6],[-9.2,-45.2,-25.2],[-8.2,-43.3,-24.8],[T_P1,...V1P],[-6.7,-37.8,-25.7],[T_V1,VR1[0]-.5,VR1[1]-.1],[T_P2,...V2P],[-4.7,-28.6,-25.2],[T_V2,VR2[0]-.55,VR2[1]+.05],[T_D1,D1[0]-.6,D1[1]],[T_CRB,CRB[0]-.55,CRB[1]-.05],[T_CR,...VCP],[-.4,-8.8,-19.6],[.9,-8.2,-18.9],[2.2,-7.8,-17.2],[4.4,CEL[0]+.9,CEL[1]-1.2],[12,CEL[0]+.9,CEL[1]-1.2]]},
 {name:'Modrić',role:'real',st:real({number:10,build:{height:1.72,bulk:.9},hairStyle:'long',hair:[Y,.72],seed:10}),keys:[[-10,-47,-10],[-4.7,-38,-10.5],[0,-30,-6.5],[3,-27,-6],[12,-25,-6]]},
 {name:'Kroos',role:'real',st:real({number:8,build:{height:1.83},hair:[Y,.8],seed:8}),keys:[[-10,-53,-2],[0,-43,-2],[12,-38,-2]]},
 {name:'Valverde',role:'real',st:real({number:15,build:{height:1.82},seed:15}),keys:[[-10,-36,19.5],[-4.7,-27,15],[-1,-17,9.8],[0,-15,8.6],[2.2,-12.4,6.4],[5,-9,-6],[12,-9,-8]]},
 {name:'Carvajal',role:'real',st:real({number:2,build:{height:1.73},seed:2}),keys:[[-10,-45,27],[0,-35,24],[12,-30,22]]},
 {name:'F. Mendy',role:'real',st:real({number:23,skin:SKIN_D,build:{height:1.8},seed:23}),keys:[[-10,-53,-28],[0,-45,-27],[12,-40,-26]]},
 {name:'Casemiro',role:'real',st:real({number:14,skin:SKIN_M,build:{height:1.85},seed:14}),keys:[[-10,-57,4],[0,-49,3],[12,-45,2]]},
 {name:'James',role:'chelsea',st:chelsea({number:24,skin:SKIN_D,build:{height:1.8,bulk:1.06},seed:24}),key:true,keys:[[-10,-41,-28.6],[-7.4,-38.6,-27.6],[-6,-36.2,-27.4],[-5.3,-34.8,-27.1],[-3.6,-25,-26.2],[-2.5,-19,-24.8],[-1.05,-12.8,-22.4],[0,-11.4,-21.2],[2,-10.6,-20.2],[12,-10.4,-20]]},
 {name:'Christensen',role:'chelsea',st:chelsea({number:4,build:{height:1.87},hair:[Y,.7],seed:4}),key:true,keys:[[-10,-24.5,-14.6],[-4.7,-22,-17.4],[-2.5,-15.4,-18.4],[-1.05,-11.8,-16.8],[0,-10.2,-12.8],[2,-9.4,-11.2],[5,-9,-11],[12,-9,-11]]},
 {name:'Thiago Silva',role:'chelsea',st:chelsea({number:6,skin:SKIN_M,build:{height:1.83},seed:6}),key:true,keys:[[-10,-22.5,-5],[-4.7,-17.2,-6.2],[-2.2,-12.2,-6.6],[-1,-9.8,-5.6],[0,-9,-4.4],[2,-8.2,-3.6],[12,-8,-3.4]]},
 {name:'Rüdiger',role:'chelsea',st:chelsea({number:2,skin:SKIN_D,build:{height:1.9,bulk:1.06},seed:2}),keys:[[-10,-22.5,6],[-4.7,-17.4,4.8],[-1,-10.8,3.4],[0,-9.8,2.6],[2,-9.2,2.2],[12,-9,2]]},
 {name:'Azpilicueta',role:'chelsea',st:chelsea({number:28,build:{height:1.78},seed:28}),keys:[[-10,-27,20],[-4,-18.5,14],[0,-12.8,9.2],[2,-11.4,8.2],[12,-11,8]]},
 {name:'Jorginho',role:'chelsea',st:chelsea({number:5,build:{height:1.8},seed:5}),keys:[[-10,-35,-5.6],[-4.7,-28.8,-6.8],[-1,-22,-4.6],[0,-20.2,-3.6],[2,-18.4,-3],[12,-17,-3]]},
 {name:'Kanté',role:'chelsea',st:chelsea({number:7,skin:SKIN_D,build:{height:1.68},seed:7}),keys:[[-10,-38.6,-8.6],[-7,-37.4,-11.6],[-4.7,-33.2,-13.8],[-2,-24.4,-10.6],[0,-19.8,-7],[2,-17.4,-6],[12,-16,-6]]},
 {name:'Mount',role:'chelsea',st:chelsea({number:19,build:{height:1.81},seed:19}),keys:[[-10,-45,4],[0,-35,2],[12,-31,2]]},
 {name:'Pulisic',role:'chelsea',st:chelsea({number:10,build:{height:1.77},seed:10}),keys:[[-10,-49,-14],[0,-41,-12],[12,-37,-11]]},
 {name:'Mendy',role:'gk',st:MENDY_ST,key:true,keys:[[-10,-3.8,-4.6],[-2,-2.3,-4.4],[-1,-1.7,-3.2],[-.3,-1.4,-1.6],[0,-1.35,-1.3],[FLY_H,-1.3,-1.1],[12,-1.3,-1.1]]},
 {name:'Turpin',role:'ref',st:REF_ST,keys:[[-10,-43,-3],[0,-30,-4.5],[3,-27,-5.5],[12,-25,-6]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,VINI=IX('Vinícius'),MENDY=IX('Mendy'),CHRISTENSEN=IX('Christensen'),SILVA=IX('Thiago Silva'),JAMES=IX('James');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- the ball: the carry, two one-twos, the dribble, the cross, the header, the net
const G=(p:[number,number]):V3=>[p[0],.11,p[1]];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
/** Vinícius's carry before the first pass: the ball half a metre ahead of him */
const carry=(tau:number):V3=>{const[x,z]=posOf(VINI,tau),v=velOf(VINI,tau),l=Math.hypot(v[0],v[1])||1;return[x+v[0]/l*.55,.11,z+v[1]/l*.55];};
const START=carry(-8.2);
const CR_LOFT=2.4;
function crossAt(u:number):V3{const b=mix3(G(CR),HP,u);return[b[0],b[1]+CR_LOFT*4*u*(1-u),b[2]];}
const NET_HIT:V3=[1.6,1.9,2.9],REST:V3=[1.1,.11,2.5];
function ballAt(tau:number):V3{
 if(tau<-8.2)return carry(tau);
 if(tau<T_P1)return roll(START,G(VP1),(tau+8.2)/(T_P1+8.2),.2);
 if(tau<T_B1)return roll(G(VP1),G(BK1),(tau-T_P1)/(T_B1-T_P1),.25);
 if(tau<T_V1)return roll(G(BK1),G(VR1),(tau-T_B1)/(T_V1-T_B1),.25);
 if(tau<T_P2)return roll(G(VR1),G(VP2),(tau-T_V1)/(T_P2-T_V1),.6);
 if(tau<T_B2)return roll(G(VP2),G(BK2),(tau-T_P2)/(T_B2-T_P2),.25);
 if(tau<T_V2)return roll(G(BK2),G(VR2),(tau-T_B2)/(T_V2-T_B2),.3);
 if(tau<T_D1)return roll(G(VR2),G(D1),(tau-T_V2)/(T_D1-T_V2),.5);
 if(tau<T_CRB)return roll(G(D1),G(CRB),(tau-T_D1)/(T_CRB-T_D1),.5);
 if(tau<T_CR)return roll(G(CRB),G(CR),(tau-T_CRB)/(T_CR-T_CRB),.7);
 if(tau<0)return crossAt((tau-T_CR)/FLY_C);
 if(tau<FLY_H){const u=tau/FLY_H,b=mix3(HP,GOAL_PT,u);return[b[0],b[1]+.4*Math.sin(Math.PI*u),b[2]];}
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY_H)/.1));
 const u=clamp((tau-IN_NET)/.6);const e=easeOut(u);return[lerp(NET_HIT[0],REST[0],e),lerp(NET_HIT[1],REST[1],u*u),lerp(NET_HIT[2],REST[2],e)];
}
const spinAt=(tau:number)=>TAU*(tau<T_CR?1.6*tau:tau<0?1.6*T_CR-4*(tau-T_CR):1.6*T_CR+4*FLY_C+6*Math.min(tau,IN_NET));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** head up and scanning while he comes back: he looks over his shoulder at the space he will run into */
const SCAN:Partial<Pose>={neckY:40,twist:14,neckP:-6};
/** a pass: a short, soft strike with the right foot; contact at τc */
const PD=.7;
function passPose(tau:number,tc:number,power=.35):{p:Pose;w:number}|null{const u=(tau-(tc-STRIKE_CONTACT*PD))/PD;if(u<=0||u>=1.3)return null;return{p:strike(Math.min(1,u),{foot:'r',power}),w:inWin(u)};}
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 if(tau>IN_NET+1.6&&sp<.6&&k!==HERO&&k!==VINI)yaw=yawTo(x,z,CEL[0],CEL[1]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4+k*.1):a.role==='chelsea'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===VINI){
  // the carry, the touch after the first return and the dribble to the cross: short quick strides, head over the ball
  const dr=(tau<T_P1-.35)||(tau>T_V1+.1&&tau<T_P2-.4)||(tau>T_V2+.1&&tau<T_CR-.45);if(dr&&sp>.5)p=blendPose(p,dribble(distOf(k,tau)/1.5,{foot:'r',speed:.5}),.75);
  for(const[tc,yw] of[[T_P1,Y_P1],[T_P2,Y_P2]] as [number,number][]){const q=passPose(tau,tc);if(q){p=blendPose(p,q.p,q.w);yaw=lerpAng(yaw,yw,q.w);}}
  // the cross: a bigger right-foot strike, body opened toward the middle
  const D=.95,u=(tau-(T_CR-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.7}),w);yaw=lerpAng(yaw,Y_CR,w);}
  if(tau>IN_NET+.2)p=over(p,JOY,sm(IN_NET+.2,IN_NET+.8,tau)*(sp<2?1:.6));
 }
 if(k===HERO){
  // the drop: jogging back toward the ball, looking over his shoulder
  if(tau<-7.9)p=over(p,SCAN,sm(-9.6,-9,tau)*(1-sm(-8.3,-7.9,tau)));
  for(const[tc,yw] of[[T_B1,Y_B1],[T_B2,Y_B2]] as [number,number][]){const q=passPose(tau,tc,.3);if(q){p=blendPose(p,q.p,q.w);yaw=lerpAng(yaw,yw,q.w);}}
  // the header: from the run into the leap, neck snap at τ = 0, facing between the cross and the corner
  const u=(tau-H_ST)/HD,w=Math.min(sm(-.12,.14,u),1-sm(1,1.3,u));
  if(w>0){p=blendPose(p,hPose(tau),w);yaw=lerpAng(yaw,YAW_H,sm(-.4,.1,u));}
  if(tau>IN_NET+.3&&tau<3.6)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau)*(1-sm(3.2,3.6,tau)));
  if(tau>3.4)p=blendPose(p,celebrate((tau-3.4)*.8,{kind:'arms'}),sm(3.4,3.8,tau));
 }
 if(k===MENDY){const at=FLY_H-.1,dur=.95,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.95}),sm(0,.1,u));yaw=Math.PI;}}
 if(k===CHRISTENSEN||k===SILVA){// caught watching the cross: heads turn after the ball
  if(tau>T_CR){const w=sm(T_CR,T_CR+.5,tau);p=over(p,{neckP:-22,neckY:k===SILVA?-30:30},w*.8);}}
 if(tau>IN_NET+.25&&k!==HERO&&k!==VINI){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='real')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='chelsea')p=over(p,DESPAIR,w*.85);}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the passes, the header). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>T_CR-.1&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={minBall?:number;lines?:boolean;prevT?:number;smear?:boolean;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): positions at τ, poses on twos at τp (τpp = the drawing before), the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env={}):{hero?:DrawResult;vini?:DrawResult}{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;const out:{hero?:DrawResult;vini?:DrawResult}={};
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,tp),px=h*ppu,star=k===HERO||k===VINI;
   const detail:AthleteStyle['detail']=passing?(star?'mid':'low'):px<50||(!a.key&&px<110)?'low':star&&e.hero==='mid'&&px>170?'mid':'auto';
   const big=px>=90&&!passing,prev=big?(()=>{const q2=poseOf(k,tpp),[px2,pz2]=posOf(k,tpp);return{pose:q2.p,place:{x:px2,z:pz2,yaw:q2.yaw}};})():undefined;
   const smearOn=!!e.smear&&big&&((k===HERO&&(Math.abs(tp-T_B1)<.3||Math.abs(tp-T_B2)<.3||Math.abs(tp)<.35))||(k===VINI&&Math.abs(tp-T_CR)<.35));
   const r=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,smearOn);if(k===HERO)out.hero=r;if(k===VINI)out.vini=r;}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return out;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** a ground-level ribbon through world points, optional arrowhead at the end, optional dashes */
function groundArrow(s:Sheet,c:Cam,pts3:V3[],w:number,o:{ink?:string;seed?:number;head?:boolean;dashed?:boolean;min?:number;width?:number}={}){
 if(w<=.02||pts3.length<2)return;const{ink=Y,seed=51,head=true,dashed=false,min=5,width=.32}=o;
 const n=pts3.length-1,cut=n*w,pts:Pt[]=[];let endP:V3=pts3[0];
 for(let i=0;i<=Math.ceil(cut);i++){const j=Math.min(i,cut),a=pts3[Math.floor(Math.min(j,n-1e-9))],b=pts3[Math.min(n,Math.floor(Math.min(j,n-1e-9))+1)],f=j-Math.floor(Math.min(j,n-1e-9));const P=mix3(a,b,f);endP=P;const q=pr(c,P);if(q)pts.push(q);}
 if(pts.length<2)return;const wd=Math.max(min,kAt(c,endP)*width);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<7;i++)gaps.push([(i+.55)/7,(i+.85)/7]);
 const rb=ribbon(pts,wd,{seed,taper:dashed?0:.2,pressure:.2,wobble:.3,gaps:dashed?gaps:undefined});
 if(head&&pts.length>=2){const e=pts[pts.length-1],f=pts[Math.max(0,pts.length-3)],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),hd=wd*2.6,ca=Math.cos(ang),sa=Math.sin(ang);
  rb.addPath(polyPath([[e[0]+ca*hd*.7,e[1]+sa*hd*.7],[e[0]-ca*hd*.5-sa*hd*.8,e[1]-sa*hd*.5+ca*hd*.8],[e[0]-ca*hd*.5+sa*hd*.8,e[1]-sa*hd*.5-ca*hd*.8]],true));}
 s.knockout(ribbon(pts,wd*1.7,{seed,taper:.2,wobble:.3}),.5*w);s.fill(ink,rb,.95);}
/** the ball's path between two moments as a yellow ribbon (a pass line), drawn on up to τ */
function passLine(s:Sheet,c:Cam,ta:number,tb:number,tau:number,w:number,o:{ink?:string;min?:number}={}){if(w<=.02||tau<=ta)return;const{ink=Y,min=5}=o,te=Math.min(tau,tb),pts=pathPts(c,ta,te,14);if(pts.length<3)return;
 const wd=Math.max(min,kAt(c,ballAt(te))*.12);s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
/** a ring round the target in the goal mouth (screen space) */
function goalRing(s:Sheet,c:Cam,P:V3,w:number,ink=R,seed=77){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(24,kAt(c,P)*.45)*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(5,r*.14),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** the box outline, lit yellow: "into the box" */
function boxGlow(s:Sheet,c:Cam,w:number){if(w<=.02)return;const pts:Pt[]=[];for(const P of [[0,0,-20.16],[-16.5,0,-20.16],[-16.5,0,20.16],[0,0,20.16]] as V3[]){const q=pr(c,P);if(q)pts.push(q);}if(pts.length<4)return;
 const rb=ribbon(pts,Math.max(4,kAt(c,[-16.5,0,0])*.22),{seed:83,taper:0,wobble:.8});s.knockout(rb,.6*w);s.fill(Y,rb,.9*w);}
/** Benzema's routes: the drop (back toward the ball) and the sprint (into the box) */
const DROP_PTS:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=10;i++)o.push(at3(HERO,lerp(-9.6,T_B1,i/10),.05));return o;})();
const RUN_PTS:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=14;i++)o.push(at3(HERO,lerp(T_B2,-.2,i/14),.05));return o;})();

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** the drop on "drops deep", the first return on "A one-two", the second on "another", the sprint on "sprints", the cross on "The cross",
 * the header on "header", the net on "Goal"; real time elsewhere */
const tau1=(t:number)=>{const g=CUE(0,'Goal');
 return key(t,mono([[0,-10],[CUE(0,'drops deep'),-8.3],[CUE(0,'A one-two')+.4,T_B1+.1],[CUE(0,'another')+.2,T_B2],[CUE(0,'sprints')+.1,-3.3],[CUE(0,'The cross')+.1,T_CR],[CUE(0,'header')+.05,0],[g+.05,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-g]]),linear);};
const P1:V3=[-26,26,76];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(Math.min(tau,IN_NET)),bz=at3(HERO,tau,1),g=CUE(0,'Goal');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-34,2,-15],fov:20})],
  [CUE(0,'Karim Benzema')-.3,1.2,()=>({P:P1,T:mix3(b,bz,.45),fov:11})],
  [CUE(0,'sprints')-.3,1.2,()=>({P:P1,T:mix3(mix3(b,bz,.5),[-12,1,-9],.35),fov:14})],
  [CUE(0,'The cross')-.2,.8,()=>({P:P1,T:[-10,1.4,-6.5],fov:9})],
  [g+.4,1.6,()=>({P:P1,T:add3(at3(HERO,tau),[1,1,0]),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{minBall:13,lines:true,prevT:tau1(t-.06),hero:'mid'});
  rain(s,t,{n:40,len:46,w:2});
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Goal')+.3;

// ---------------------------------------------------------------- 2 · slow-motion replay, low behind the play in Madrid's half
const tau2=(t:number)=>key(t,mono([[0,-9.8],[CUE(1,'Watch again'),-9.7],[CUE(1,'comes back'),-8.6],[CUE(1,'passes to Vinícius'),T_P1-.2],[CUE(1,'gets it back'),T_B1],[CUE(1,'Then again'),T_P2],[CUE(1,'races forward'),T_B2+.2],[SECS(1),-2.6]]),linear);
const E2:V3=[-37,4,9];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(tau),bz=at3(HERO,tau,.9),tr=CUE(1,'races forward');
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(bz,[-38,.8,-18],.4),fov:26})],
  [CUE(1,'passes to Vinícius')-.4,1,()=>({P:add3(E2,[1,0,0]),T:mix3(b,bz,.5),fov:30})],
  [CUE(1,'Then again')-.2,1.2,()=>({P:add3(E2,[5,.2,0]),T:mix3(b,bz,.5),fov:30})],
  [tr-.2,1.6,()=>({P:add3(E2,[13,1.4,1]),T:add3(bz,[4,-.2,-2]),fov:32})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tC=CUE(1,'comes back'),tP=CUE(1,'passes to Vinícius'),tG=CUE(1,'gets it back'),tA=CUE(1,'Then again'),tR=CUE(1,'races forward'),E=SECS(1);
  stadium(s,c,t);
  ground(s,c);
  // "comes back": the red arrow of his drop, drawn on as he jogs back toward the ball
  groundArrow(s,c,DROP_PTS,sm(tC-.2,tC+1.2,t)*(1-sm(tR+.3,tR+.8,t)),{ink:R,seed:52});
  // the two one-twos: each pass line drawn on behind the ball, and held
  const pw=1-sm(E-.9,E-.5,t);
  if(t>tP-.3){passLine(s,c,T_P1,T_B1,tau,pw);passLine(s,c,T_B1,T_V1,tau,pw);}
  if(t>tA-.3){passLine(s,c,T_P2,T_B2,tau,pw);passLine(s,c,T_B2,T_V2,tau,pw);}
  // "races forward": his sprint arrow toward the box
  groundArrow(s,c,RUN_PTS,sm(tR,tR+1.2,t),{ink:Y,seed:53});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12}).hero;
  // "gets it back": a spark at his boot as he returns it first time
  for(const[tc,cue] of[[T_B1,tG],[T_B2,tA+.6]] as [number,number][]){const sf=sm(cue-.1,cue+.2,t,easeOutBack)*(1-sm(cue+.5,cue+.9,t));if(sf>.02&&hr){const p=pr(c,ballAt(tc));if(p)sparkBurst(s,Y,p[0],p[1],Math.max(40,kAt(c,ballAt(tc))*.4)*sf,{n:8,seed:61,width:Math.max(4,kAt(c,ballAt(tc))*.04)});}}
  // a ring under Benzema while he links the play
  ring(s,c,at3(HERO,tau),.9,sm(tC-.1,tC+.4,t,easeOutBack)*(1-sm(tR+.2,tR+.6,t)),Y,44);
  rain(s,t,{n:34,len:70,w:2.6});
 },
 aperture(t){const c=cam2(t),P=at3(HERO,tau2(t),1.1),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],60,12);},
 still:0,
};
ch2.still=CUE(1,'gets it back')+.3;

// ---------------------------------------------------------------- 3 · the second replay angle, behind the goal: the cross, the header, the corner, the celebration
const tau3=(t:number)=>{const tw=CUE(2,'What a finish');return key(t,mono([[0,T_CR-.7],[CUE(2,'Vinícius crosses'),T_CR-.1],[CUE(2,'heads it'),0],[CUE(2,'top corner'),IN_NET-.02],[tw,IN_NET+1.4],[SECS(2)+1,IN_NET+1.4+(SECS(2)+1-tw)*.9]]),linear);};
const E3:V3=[6.5,5.4,5];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),hp=at3(HERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([HX,1.2,HZ-4],b,.45),fov:38})],
  [CUE(2,'heads it')-.5,.7,()=>({P:add3(E3,[-.6,-.4,-.4]),T:[HX+.5,1.6,HZ],fov:22})],
  [CUE(2,'top corner')-.15,.5,()=>({P:E3,T:[-4.5,1.6,.6],fov:34})],
  [CUE(2,'What a finish')-.6,1.4,()=>({P:[1,2.6,-26],T:add3(hp,[.5,.2,.4]),fov:30})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tC=CUE(2,'Vinícius crosses'),tH=CUE(2,'heads it'),tb=CUE(2,'top corner'),tw=CUE(2,'What a finish');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tw-.1,tw+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the cross's flight drawn on behind the ball, then the header's line into the corner
  passLine(s,c,T_CR,0,tau,sm(tC-.2,tC+.2,t)*(1-sm(tb+.6,tb+1.1,t)),{min:6});
  passLine(s,c,0,FLY_H,tau,sm(tH-.1,tH+.1,t)*(1-sm(tb+.6,tb+1.1,t)),{ink:R,min:6});
  const r=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "heads it": a spark at his forehead as he meets it
  const sf=sm(tH-.1,tH+.2,t,easeOutBack)*(1-sm(tH+.5,tH+.9,t));
  if(sf>.02&&r.hero){const p=pr(c,HP);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(44,kAt(c,HP)*.45)*sf,{n:9,seed:63,width:Math.max(5,kAt(c,HP)*.04)});}
  // "top corner": a red ring round the corner as it goes in
  goalRing(s,c,GOAL_PT,sm(tb-.2,tb+.3,t,easeOutBack)*(1-sm(tb+.9,tb+1.4,t)));
  rain(s,t,{n:38,len:80,w:2.8});
  // "What a finish!": a burst of yellow over the celebration (the passage material into the lesson)
  const fb=sm(tw+.5,tw+1,t);if(fb>0){const q=pr(c,add3(at3(HERO,tau),[0,3.2,0]));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'top corner')+.2;

// ---------------------------------------------------------------- 4 · the lesson: drop deep → link → sprint into the box → finish
const tau4=(t:number)=>key(t,mono([[0,-9.6],[CUE(3,'Your turn'),-9.5],[CUE(3,'drop deep'),-8.6],[CUE(3,'build attacks'),T_P1],[CUE(3,'sprint into the box'),T_B2+.1],[CUE(3,'to finish'),-.3],[SECS(3)-.6,IN_NET+.3],[SECS(3),IN_NET+.5]]),linear);
/** raised, behind the move from Madrid's half: the drop, the passes, the sprint and the goal all read at once */
const E4:V3=[-60,17,14];
function cam4v(t:number):Cam{
 const tau=tau4(t),mid=mix3(at3(HERO,Math.min(tau,T_B1),1),at3(VINI,Math.min(tau,T_B1),1),.5);
 return plan(t,[
  [0,0,()=>({P:add3(E4,[4,-6,-12]),T:at3(HERO,tau,1),fov:18})],
  [CUE(3,'drop deep')-.3,1.2,()=>({P:add3(E4,[4,-6,-12]),T:mid,fov:24})],
  [CUE(3,'build attacks')-.2,1.4,()=>({P:add3(E4,[4,-3,-8]),T:[-32,0,-19],fov:19})],
  [CUE(3,'sprint into the box')-.2,1.4,()=>({P:add3(E4,[14,-2,-8]),T:[-18,0,-10],fov:25})],
  [CUE(3,'to finish')-.6,1.2,()=>({P:add3(E4,[26,-3,-6]),T:[-7,1,-4],fov:19})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tY=CUE(3,'Your turn'),tD=CUE(3,'drop deep'),tB=CUE(3,'build attacks'),tS=CUE(3,'sprint into the box'),tF=CUE(3,'to finish'),E=SECS(3);
  stadium(s,c,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  const hold=1-sm(E-.8,E-.4,t);
  // 1 · your turn: a ring under the striker
  ring(s,c,at3(HERO,tau),.9,sm(tY-.15,tY+.35,t,easeOutBack)*(1-sm(tS,tS+.4,t)),Y,44);
  // 2 · drop deep: the red arrow back toward the ball
  groundArrow(s,c,DROP_PTS,sm(tD-.1,tD+.9,t)*hold,{ink:R,seed:52,min:6});
  // 3 · build attacks: the four link passes, drawn on behind the ball
  if(t>tB-.3){const w=hold;passLine(s,c,T_P1,T_B1,tau,w,{min:6});passLine(s,c,T_B1,T_V1,tau,w,{min:6});passLine(s,c,T_P2,T_B2,tau,w,{min:6});passLine(s,c,T_B2,T_V2,tau,w,{min:6});}
  // 4 · sprint into the box: the yellow run arrow and the box outline lighting up
  groundArrow(s,c,RUN_PTS,sm(tS-.1,tS+1.1,t)*hold,{ink:Y,seed:53,min:6});
  boxGlow(s,c,sm(tS+.2,tS+.8,t)*(1-sm(tF+.6,tF+1,t)));
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // 5 · to finish: the goal ring and the spark at the header
  goalRing(s,c,GOAL_PT,sm(tF+.1,tF+.5,t,easeOutBack)*hold);
  const sf=sm(tF-.05,tF+.25,t,easeOutBack)*(1-sm(tF+.6,tF+1,t));if(sf>.02){const p=pr(c,HP);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(40,kAt(c,HP)*.4)*sf,{n:8,seed:65,width:Math.max(4,kAt(c,HP)*.04)});}
  rain(s,t,{n:30,len:44,w:2});
 },
 still:0,
};
ch4.still=CUE(3,'sprint into the box')+1.2;

const film:RisoStory={
 id:'benzema-signature',format:'11v11',title:"Benzema: drop, link and finish",
 theme:'A striker can drop deep to help build attacks, then sprint into the box to finish',
 ageNote:'Chelsea v Real Madrid, UEFA Champions League quarter-final first leg, Stamford Bridge, London, 6 April 2022 (Benzema\'s header, 21st minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: drop, link and finish — a short red arrow back, then a yellow arrow forward with the ball riding it. Reduced motion: the still marks. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed);
  const back=clamp(u*2),fwd=clamp(u*2-1);
  const bp:Pt[]=[];for(let i=0;i<=8;i++){const k=i/8*back;bp.push([x-110*k,y+30*k]);}
  if(bp.length>2&&back>.05)s.fill(R,ribbon(bp,12,{seed,taper:.6,pressure:.3,wobble:1}),.95*fade);
  const fp:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*fwd;fp.push([x-110+320*k,y+30-90*k-40*Math.sin(Math.PI*k)]);}
  if(fp.length>2&&fwd>.05)s.fill(Y,ribbon(fp,14,{seed:seed+1,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=fwd>.05?fp[fp.length-1]:bp[bp.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:7,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
