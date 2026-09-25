/** Valverde's signature — the long-range thunderbolt. Real Madrid 3–3 Manchester City, UEFA Champions League quarter-final first leg,
 * Estadio Santiago Bernabéu, Madrid, 9 April 2024 (21:00 local, a night match). An iconic-play riso film (RisoStory, chapters mode) played
 * by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the 79th-minute equaliser from
 * WRITTEN accounts and one match photograph (the broadcast footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: kind "signature", "the long-range thunderbolt", lesson "Lock your ankle and strike through the
 * middle of the ball"): it is the best-documented strike from outside the box of his career — UEFA's Technical Observer panel made it the
 * 2023/24 Champions League GOAL OF THE SEASON ("Federico Valverde's superbly executed first-time volley"), the Guardian called it "the best
 * strike of all, a glorious volley". A first-time volley from the edge of the area, hit low and hard, is exactly the locked-ankle, through-
 * the-middle contact the lesson teaches.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad films/src-cache/):
 *  - The Guardian, Sid Lowe, match report, 9 April 2024 (guardian-rma-mci-2024-report)
 *    https://www.theguardian.com/football/2024/apr/09/real-madrid-manchester-city-champions-league-quarter-final-first-leg-match-report
 *    ("On as a substitute, still not tired at 38, Luka Modric lifted them. He also found Vinícius whose neat, clipped cross was met by
 *    Valverde's low volley, this place exploding once more. There were 10 minutes left"; City led 3-2 through Foden and Gvardiol; Ortega in
 *    City's goal, Lunin in Madrid's)
 *  - The Guardian, Tim de Lisle, minute-by-minute, 9 April 2024 (guardian-rma-mci-2024-live)
 *    https://www.theguardian.com/football/live/2024/apr/09/real-madrid-v-manchester-city-champions-league-quarter-final-first-leg-live
 *    ("GOAL! Real 3-3 Man City (Valverde 79)"; "There didn't seem to be much danger as a cross was floated over the box, but there was
 *    Valverde, hitting a volley with fabulous technique – low and rasping"; Modrić on for Kroos, Brahim for Rodrygo at 78'; City's first
 *    substitution only at 90', so Kovačić was still on; post times put kick-off at 21:00 Madrid time)
 *  - UEFA.com, "UEFA Champions League Goal of the Season: Federico Valverde tops Technical Observer selection", 3 June 2024
 *    (uefa-valverde-gots-2024) https://www.uefa.com/uefachampionsleague/news/028e-1b0b051fb621-063e500208eb-1000--goal-of-the-season-top-ten/
 *  - Wikipedia, "Federico Valverde" (raw; wiki-federico-valverde): the first-time volley in the 3–3 draw, 9 April 2024, Goal of the Season.
 *  - Photograph, Chris Brunskill/Fantasista/Getty Images, "Federico Valverde of Real Madrid scores." (in the Guardian live blog;
 *    guardian-valverde-scores-2024.jpg): Valverde's follow-through — RIGHT foot, toes pointed, left foot planted, arms wide; Madrid in WHITE
 *    shirts, shorts and socks with GOLD trim; City in their DARK NAVY shirts (a light-blue pattern), navy shorts and navy socks; Kovačić (8)
 *    chasing him; the ball low, just off the grass; a painted line of the penalty area close by.
 * CONFIRMED by those accounts: the match, date, ground, night kick-off, the 79th minute and 2–3 → 3–3; Modrić (a substitute) found Vinícius;
 * Vinícius's clipped cross was FLOATED over the box; Valverde met it FIRST TIME with a LOW VOLLEY struck with his RIGHT foot, toes pointed;
 * Kovačić closest to him; Ortega in goal; the kits (from the photograph: Madrid white with gold trim, City dark navy).
 * INFERRED (illustrative): every exact position, path and timing; the direction of play on screen (Madrid attacking left to right from the
 * main-stand camera, as in modric-signature.ts, so Madrid's LEFT is the FAR touchline); Vinícius crossing from Madrid's left wing with his
 * right foot (his usual side; no fetched source says which wing); where Valverde struck it (at the right-hand edge of the penalty area,
 * ~21 m from goal); the ball going low into the FAR bottom corner and Ortega diving; everyone else's position; Ortega's kit (drawn yellow);
 * Valverde's boots (green in the photo, printed yellow); hair and builds; who celebrated where. The narration names neither the wing, the
 * corner nor the kits. The stadium (not from a fetched source): the Bernabéu's steep, tall, near-rectangular stands close to the pitch,
 * three tiers under a roof edge with floodlight rails, a mostly white home crowd with phone lights (shared look with modric-signature.ts).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (Modrić → Vinícius → the floated cross →
 * Valverde's volley → the net); ch2 = the slow-motion replay from a LOW camera at Valverde's right side (eyes on the ball, the swing, the
 * locked ankle with the toes pointed, contact through the middle of the ball); ch3 = a second replay angle from BEHIND THE GOAL (low and hard
 * into the corner, the keeper beaten, the celebration); ch4 = the lesson: a raised side view of the strike (lock your ankle, strike through the
 * middle of the ball, the ball flies low and straight). Composed on the FULL sheet (world units = sheet units centred on the
 * canvas; never sheet.safe), kept in the central ~1000 units so it frames from the 1.45:1 card window down to square.
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every figure inside a passage print at `low`.
 * Handedness: the world is right-handed (x toward City's goal, y up, +z = the main-stand side = Madrid's RIGHT as they attack), athlete.ts's
 * own convention, so Valverde's RIGHT foot strikes without a mirrored projector. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,celebrate,posed,blendPose,clampPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/valverde-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/valverde-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The volley, live',text:'Madrid, 2024. Real Madrid are losing to Manchester City. Luka Modrić finds Vinícius, and he floats a cross over the box... Fede Valverde hits it first time. What a volley! Goal!',tail:2.6,
  cues:['Madrid','Manchester City','Luka Modrić','Vinícius','floats a cross','Fede Valverde','first time','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. Eyes on the ball. He swings his right leg, ankle locked, toes pointing down... and hits the middle of the ball.',tail:1.6,
  cues:['Watch again','Eyes on the ball','swings his right leg','ankle locked','toes pointing down','hits the middle']},
 {label:'Into the corner',text:'Behind the goal: low and hard, it flies into the corner. The keeper can\'t reach it. Three all!',tail:2.2,
  cues:['Behind the goal','low and hard','into the corner','keeper','Three all']},
 {label:'Your turn',text:'Your turn: lock your ankle and strike through the middle of the ball.',tail:2.6,
  cues:['Your turn','lock your ankle','strike through','middle of the ball']},
];
import timingJson from '../../../public/plays/narration/valverde-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('valverde: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('valverde: no cue '+w);return c.at;};
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
const bump=(a:number,b:number,t:number)=>Math.sin(Math.PI*clamp((t-a)/(b-a)));
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: City's goal line is x = 0 (Madrid attack +x), goal centre z = 0, +z = the main-stand side, the halfway line x = −52.5. */
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
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the Bernabéu at night: steep, tall, near-rectangular stands tight to the pitch
const CXS=-52.5,NS=60,PE=.28;
/** a point on the stand ring: angle th round the pitch centre (0 = behind City's goal, +90° = the main stand), d metres out from the ring's
 * inner edge (a squarish superellipse ~6 m outside the lines), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(58.5+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(40.5+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=34;
/** steep rake (~50°): three tiers climbing to ~42 m */
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.4+40*b];
type Bowl={seg:V3[][];roof:V3[][];seats:{P:V3;h:number;away:boolean}[];lamps:[V3,V3][];tiers:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],seats:[],lamps:[],tiers:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,SD1-9,y1+2.6),rim(b,SD1-9,y1+2.6),rim(b,SD1+2,y1+4),rim(a,SD1+2,y1+4)]);
  if(i%2===0)o.lamps.push([rim(a,SD1-8.6,y1+2.3),rim(b,SD1-8.6,y1+2.3)]);
  for(const f of[.34,.67]){const[d,y]=RAKE(f);o.tiers.push([rim(a,d,y),rim(b,d,y)]);}
  for(let r=0;r<9;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.18)continue;const[d,y]=RAKE((r+.5)/9);
   // an away section high in one corner behind City's goal, in sky blue (inferred)
   const away=r>=6&&i>=NS-6;
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // an April night in Madrid: a deep printed navy sky
 s.field(K,.74,.5);s.field(B,.24,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(bowl);s.tone(B,bowl,.4);s.tone(K,bowl,.36);
 // the crowd: one mark per seat group, sized by distance; mostly white Madrid shirts, navy and blue, phone lights (yellow); the away corner
 // in City sky blue; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0&&!q.away?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.away?(q.h<.85?1:0):q.h<.55?0:q.h<.75?1:q.h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(B,inks[1],.6);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.95);
 const tf=new Path2D();for(const[a,b] of BOWL.tiers){if(toCam(c,a)[2]<14||toCam(c,b)[2]<14)continue;seg3(c,a,b,.9,tf,1);}s.knockout(tf,.6);s.tone(B,tf,.2);
 s.knockout(roof);s.fill(K,roof,.92);
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+4)continue;seg3(c,a,b,.9,lamp);seg3(c,a,b,3.4,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
const ringPts=(d:number,n=72):V3[]=>{const o:V3[]=[];for(let i=0;i<n;i++)o.push(rim(i/n*TAU,d,0));return o;};
const GRASS=ringPts(0);
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,GRASS);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.14);
 // advertising boards behind the goal and along both touchlines: navy with paper panels (generic)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([4.2,0,-30],[4.2,0,30]);board([-110,0,-37.5],[3,0,-37.5]);board([-110,0,37.5],[3,0,37.5]);
 for(let k=0;k<9;k++){const z=-28+k*6.4;addPoly(pn,polyP(c,[[4.1,.25,z],[4.1,.25,z+3.3],[4.1,.68,z+3.3],[4.1,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.45);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 // the penalty area in short pieces (a long near-camera line clips badly)
 for(let k=0;k<4;k++){L([-k*4.125,0,-20.16],[-(k+1)*4.125,0,-20.16]);L([-k*4.125,0,20.16],[-(k+1)*4.125,0,20.16]);}
 for(let k=0;k<6;k++)L([-16.5,0,-20.16+k*6.72],[-16.5,0,-20.16+(k+1)*6.72]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out low in the far bottom corner (z −3) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=-3,back=(z:number,y=0)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2))*(y<1?1:.35);
 const zs=[z0,-3,-1.8,0,1.8,z1];
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

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Real Madrid 2023/24 home: all white with gold trim (confirmed by the photograph) */
const real=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,numberInk:K,hairStyle:'short',...o});
/** Manchester City that night: dark navy shirts with a light-blue pattern, navy shorts and socks (confirmed by the photograph) */
const city=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:K,skin:SKIN_L,hair:K,line:K,trim:B,numberInk:B,hairStyle:'short',...o});
/** Valverde: 1.82 m, lean and athletic; short dark hair; 15; boots green in the photo (printed yellow) */
const VALVERDE_B={height:1.82,bulk:.98};
const VALVERDE_ST=real({number:15,build:VALVERDE_B,boots:Y,seed:15});
const VINI_B={height:1.76,bulk:.92};
const VINI_ST=real({number:7,build:VINI_B,skin:SKIN_D,hairStyle:'curly',seed:7});
const ORTEGA_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:18,numberInk:K,build:{height:1.85},seed:18};

// ---------------------------------------------------------------- the geometry (τ = seconds after Valverde's contact)
/** where Valverde meets it: the right-hand edge of the penalty area, ~21 m from goal (inferred); where it goes: low, far corner (inferred) */
const V_XZ:[number,number]=[-18.4,9.4];
const GOAL_PT:V3=[0,.3,-2.95];
const YAW_V=yawTo(V_XZ[0],V_XZ[1],GOAL_PT[0],GOAL_PT[2]);
const FWD:[number,number]=[Math.cos(YAW_V),-Math.sin(YAW_V)],RGT:[number,number]=[Math.sin(YAW_V),Math.cos(YAW_V)];
/** the volley: the ordinary instep strike, the ball met off the ground (~.45 m) — hip higher at contact, knee near straight, ankle LOCKED
 * with the toes pointed, body a touch back over the ball to keep it low, arms wide for balance (as in the photograph) */
const LOCK:Partial<Pose>={rHipF:52,rKnee:8,rAnk:62,lean:2,pitch:-5,lShA:96,lShF:24,rShA:70,rShF:-30,neckP:34,bend:-10};
const VOL=(u:number):Pose=>{const p=strike(u,{foot:'r',power:1}),w=Math.exp(-Math.pow((u-STRIKE_CONTACT)/.13,2));return clampPose(over(p,LOCK,w));};
const SD=.95,S_ST=-STRIKE_CONTACT*SD;
const vStrike=(tau:number):Pose=>VOL(clamp((tau-S_ST)/SD));
/** the laces at contact, relative to his pelvis (solved once, FK) */
const LACES=(()=>{const sk=solve(vStrike(0),VALVERDE_B,{x:0,z:0,yaw:YAW_V});return mix3(sk.rAn,sk.rToe,.5);})();
const V_PT:V3=[V_XZ[0],clamp(LACES[1]+.06,.3,.7),V_XZ[1]];
const P0:[number,number]=[V_XZ[0]-LACES[0]-FWD[0]*.08,V_XZ[1]-LACES[2]-FWD[1]*.08];
const FLY_S=.72,IN_NET=FLY_S+.08;

// ---------------------------------------------------------------- the build-up: Modrić → Vinícius → the floated cross
const T_MP=-4.3,T_VR=-3.15,T_CR=-1.75;
const MP_PT:V3=[-37,.11,-9],VR_PT:V3=[-25.6,.11,-25.4],CR_PT:V3=[-23.4,.11,-26.2];
const dirTo=(a:V3,b:[number,number]|V3):[number,number]=>{const bz=b.length===3?b[2]:b[1],dx=b[0]-a[0],dz=bz-a[2],l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};
const PASS_D=dirTo(MP_PT,VR_PT);
/** Modrić's pelvis at his pass: the ball at his RIGHT boot (right of facing = (−dz, dx)) */
const M_MP:[number,number]=[MP_PT[0]-PASS_D[0]*.45+PASS_D[1]*.18,MP_PT[2]-PASS_D[1]*.45-PASS_D[0]*.18];
/** Vinícius's cross (right foot, inferred), aimed at the edge of the box */
const CROSS_D=dirTo(CR_PT,V_XZ),YAW_C=Math.atan2(-CROSS_D[1],CROSS_D[0]);
const CD=.8,C_ST=T_CR-STRIKE_CONTACT*CD;
const vCross=(tau:number):Pose=>strike(clamp((tau-C_ST)/CD),{foot:'r',power:.7});
const CFOOT=(()=>{const sk=solve(vCross(T_CR),VINI_B,{x:0,z:0,yaw:YAW_C});return mix3(sk.rAn,sk.rToe,.5);})();
const VC:[number,number]=[CR_PT[0]-CFOOT[0],CR_PT[2]-CFOOT[2]];
/** the celebration: toward the main-stand corner (inferred) */
const CEL:[number,number]=[-6,25];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'real'|'city'|'gk';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Valverde',role:'hero',st:VALVERDE_ST,key:true,keys:[[-8,-40,22],[-4.3,-32.5,18.5],[-1.8,-24.5,13.6],[0,...P0],[.5,P0[0]+.8,P0[1]+.2],[2.6,-12,19],[5.2,CEL[0],CEL[1]],[12,CEL[0],CEL[1]]]},
 {name:'Vinícius',role:'real',st:VINI_ST,key:true,keys:[[-8,-31,-29],[-4.3,-28,-27.5],[T_VR,VR_PT[0]-.5,VR_PT[2]-.1],[T_CR,...VC],[-1,VC[0]+.8,VC[1]+.3],[1,-19,-22],[4,-12,6],[6.4,CEL[0]-1.8,CEL[1]-1.2],[12,CEL[0]-1.8,CEL[1]-1.2]]},
 {name:'Modrić',role:'real',st:real({number:10,build:{height:1.72,bulk:.9},hairStyle:'long',hair:[Y,.72],seed:10}),key:true,keys:[[-8,-42,-6],[-5.5,-39.4,-8],[T_MP,...M_MP],[-2.5,-34,-11],[2,-27,-6],[12,-20,4]]},
 {name:'Bellingham',role:'real',st:real({number:5,skin:SKIN_D,build:{height:1.86},seed:5}),keys:[[-8,-22,-8],[-2,-13.6,-6],[0,-12.8,-4.2],[4,-9,10],[7,CEL[0]+1.4,CEL[1]-1],[12,CEL[0]+1.4,CEL[1]-1]]},
 {name:'Brahim',role:'real',st:real({number:21,skin:SKIN_M,build:{height:1.7},seed:21}),keys:[[-8,-20,-18],[-2,-11.8,-13],[0,-10.8,-11.6],[5,-9,8],[12,CEL[0]-.6,CEL[1]+1.5]]},
 {name:'Camavinga',role:'real',st:real({number:12,skin:SKIN_D,build:{height:1.82},seed:12}),keys:[[-8,-44,4],[0,-34,3],[12,-26,8]]},
 {name:'Carvajal',role:'real',st:real({number:2,build:{height:1.73},seed:2}),keys:[[-8,-44,28],[0,-35,27],[12,-26,24]]},
 {name:'Mendy',role:'real',st:real({number:23,skin:SKIN_D,build:{height:1.8},seed:23}),keys:[[-8,-46,-24],[0,-38,-23],[12,-32,-18]]},
 {name:'Kovačić',role:'city',st:city({number:8,build:{height:1.77},seed:8}),key:true,keys:[[-8,-30,6],[-2,-23,6.4],[0,-20.4,7.4],[.6,-19.4,8],[12,-18.5,8.5]]},
 {name:'Rodri',role:'city',st:city({number:16,build:{height:1.91},seed:16}),keys:[[-8,-28,-4],[0,-20.8,-2.4],[12,-18,-1]]},
 {name:'Stones',role:'city',st:city({number:5,build:{height:1.88},seed:5}),keys:[[-8,-24,-12],[0,-17.8,-12.6],[12,-15,-10]]},
 {name:'Dias',role:'city',st:city({number:3,skin:SKIN_M,build:{height:1.87},seed:3}),key:true,keys:[[-8,-14,-3],[-2,-9.8,-4.2],[0,-9.2,-3.4],[12,-8.6,-2.8]]},
 {name:'Akanji',role:'city',st:city({number:25,skin:SKIN_M,build:{height:1.88},seed:25}),keys:[[-8,-14,4],[-2,-10.2,3.6],[0,-9.6,4.4],[12,-9,5]]},
 {name:'Gvardiol',role:'city',st:city({number:24,build:{height:1.85},seed:24}),keys:[[-8,-17,15],[-2,-12.4,12],[0,-11.6,11],[12,-11,10.5]]},
 {name:'City right-back',role:'city',st:city({number:2,skin:SKIN_D,build:{height:1.78},seed:2}),keys:[[-8,-18,-20],[T_VR,-21.6,-22.8],[T_CR,-21.8,-24.2],[0,-19.5,-21.5],[12,-17,-18]]},
 {name:'Foden',role:'city',st:city({number:47,build:{height:1.71},seed:47}),keys:[[-8,-30,-18],[0,-26,-16],[12,-22,-12]]},
 {name:'Silva',role:'city',st:city({number:20,build:{height:1.73},seed:20}),keys:[[-8,-31,12],[0,-26.4,11],[12,-22,10]]},
 {name:'Ortega',role:'gk',st:ORTEGA_ST,key:true,keys:[[-8,-3,-1],[-2,-2.2,-2.6],[0,-1.4,1.2],[.2,-1.3,.9],[12,-1.3,.9]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,VINI=IX('Vinícius'),MODRIC=IX('Modrić'),KOVACIC=IX('Kovačić'),ORTEGA=IX('Ortega');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-8,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- the ball: Modrić's pass, Vinícius's touch and cross, the volley, the net
const modBall=(tau:number):V3=>{const[x,z]=posOf(MODRIC,tau),v=velOf(MODRIC,tau),l=Math.hypot(v[0],v[1])||1;return[x+v[0]/l*.55,.11,z+v[1]/l*.55];};
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
/** the floated cross: apex ~4.6 m, dropping onto Valverde */
const LOFT=4.6;
function crossAt(u:number):V3{const b=mix3(CR_PT,V_PT,u);return[b[0],b[1]+LOFT*4*u*(1-u),b[2]];}
const NET_HIT:V3=[1.6,.3,-3.1],REST:V3=[1.2,.11,-2.7];
/** the volley: low and hard (≈30 m/s), a slight dip on its way */
function shotAt(u:number):V3{const b=mix3(V_PT,GOAL_PT,u);return[b[0],b[1]+.18*Math.sin(Math.PI*u),b[2]];}
function ballAt(tau:number):V3{
 if(tau<T_MP)return tau<T_MP-.3?modBall(tau):mix3(modBall(T_MP-.3),MP_PT,(tau-T_MP+.3)/.3);
 if(tau<T_VR)return roll(MP_PT,VR_PT,(tau-T_MP)/(T_VR-T_MP),.3);
 if(tau<T_CR)return roll(VR_PT,CR_PT,(tau-T_VR)/(T_CR-T_VR),.7);
 if(tau<0)return crossAt((tau-T_CR)/-T_CR);
 if(tau<FLY_S)return shotAt(tau/FLY_S);
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY_S)/.08));
 const u=clamp((tau-IN_NET)/.5);return mix3(NET_HIT,REST,easeOut(u));
}
const spinAt=(tau:number)=>TAU*(tau<0?2*tau:-9*Math.min(tau,IN_NET));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** eyes on the dropping ball in the last strides */
const WATCH:Partial<Pose>={neckP:-10};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 if(tau>IN_NET+1.4&&sp<.6&&k!==HERO)yaw=yawTo(x,z,CEL[0],CEL[1]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4+k*.1):a.role==='city'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===MODRIC){const D=.8,u=(tau-(T_MP-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),w);yaw=lerpAng(yaw,Math.atan2(-PASS_D[1],PASS_D[0]),w);}}
 if(k===VINI){
  if(tau>T_VR-.2&&tau<T_CR-.6)p=blendPose(p,dribble(distOf(k,tau)/1.5,{foot:'r',speed:.4}),bump(T_VR-.2,T_CR-.6,tau)*.7);
  const u=(tau-C_ST)/CD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,vCross(tau),w);yaw=lerpAng(yaw,YAW_C,sm(-.3,.05,u));}
  if(tau>T_CR+.5&&tau<.2)yaw=lerpAng(yaw,yawTo(x,z,b[0],b[2]),.6);
  if(tau>IN_NET+.3)p=over(p,JOY,sm(IN_NET+.3,IN_NET+.9,tau)*(sp<2?1:.4));}
 if(k===KOVACIC){// he chases, then can only watch it fly past
  if(tau>-.4){yaw=lerpAng(yaw,yawTo(x,z,b[0],b[2]),sm(-.4,.1,tau));}}
 if(k===ORTEGA){const at=FLY_S-.12,dur=.95,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'r',height:.12}),sm(0,.1,u));yaw=Math.PI;}}
 if(k===HERO){
  if(tau>-1.6&&tau<S_ST+.1)p=over(p,WATCH,bump(-1.6,S_ST+.3,tau)*.8);
  const u=(tau-S_ST)/SD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,vStrike(tau),w);yaw=lerpAng(yaw,YAW_V,sm(-.3,.05,u));}
  if(tau>IN_NET+.3&&tau<4.9)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));
  if(tau>4.7){p=blendPose(p,celebrate((tau-4.7)*.8,{kind:'arms'}),sm(4.7,5.1,tau));}
 }
 if(tau>IN_NET+.25&&k!==HERO&&k!==VINI){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='real')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='city')p=over(p,DESPAIR,w*.85);}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the volley). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.08,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>T_CR&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the ball's path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={minBall?:number;lines?:boolean;prevT?:number;smear?:boolean;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): positions at τ, poses on twos at τp (τpp = the drawing before), the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env={}):{hero?:DrawResult}{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;const out:{hero?:DrawResult}={};
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,tp),px=h*ppu,star=k===HERO;
   const detail:AthleteStyle['detail']=passing?(star?'mid':'low'):px<50||(!a.key&&px<110)?'low':star&&e.hero==='mid'&&px>170?'mid':'auto';
   const big=px>=90&&!passing,prev=big?(()=>{const q2=poseOf(k,tpp),[px2,pz2]=posOf(k,tpp);return{pose:q2.p,place:{x:px2,z:pz2,yaw:q2.yaw}};})():undefined;
   const smearOn=!!e.smear&&big&&((k===HERO&&tp>-.35&&tp<.35)||(k===ORTEGA&&tp>FLY_S-.4&&tp<FLY_S+.3));
   const r=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,smearOn);if(k===HERO)out.hero=r;}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return out;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** the ball's flight so far: a ribbon along the real path from τa to τ */
function flightPath(s:Sheet,c:Cam,tau:number,w:number,o:{ink?:string;from?:number;to?:number;min?:number}={}){if(w<=0)return;
 const{ink=Y,from=0,to=FLY_S,min=8}=o,e=Math.min(tau,to);if(e<=from+.02)return;const pts=pathPts(c,from,e,28);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(e))*.14);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
/** a ring round the target in the goal mouth (screen space) */
function goalRing(s:Sheet,c:Cam,P:V3,w:number,ink=R,seed=77){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(24,kAt(c,P)*.45)*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(5,r*.14),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** "ankle locked": a red ring round the right ankle and foot, and a straight red bar along shin → toe (one rigid line: no floppy ankle) */
function ankleLock(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=.02)return;const toe=r.joints.rToe,an=r.joints.rAn,kn=r.joints.rKn,rr=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.15*w+3,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*rr*1.2,cy+Math.sin(a)*rr*.9]);}
 const ring2=ribbon(pts,Math.max(3,rr*.18),{seed:82,close:true,taper:0,wobble:.8});s.knockout(ring2,.7*w);s.fill(R,ring2,.95*w);
 const bar=ribbon([mix2(kn,an,.35),an,toe],Math.max(3,rr*.14),{seed:83,taper:.2,wobble:.2});s.fill(R,bar,.9*w);}
const mix2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** "the middle of the ball": a crosshair ring on the ball (screen space) */
function middleMark(s:Sheet,c:Cam,P:V3,w:number,ink=R){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(16,kAt(c,P)*.11)*(1.6+.4*w),u=Math.max(3,r*.12),pts:Pt[]=[];
 for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const p=ribbon(pts,u,{seed:87,close:true,taper:0,wobble:.6});for(const[dx,dy] of[[1,0],[-1,0],[0,1],[0,-1]] as Pt[])p.addPath(ribbon([[q[0]+dx*r*.55,q[1]+dy*r*.55],[q[0]+dx*r*1.35,q[1]+dy*r*1.35]],u,{seed:88,taper:0,wobble:.3}));
 s.knockout(p,.8*w);s.fill(ink,p,.95*w);
 const dot=new Path2D();dot.arc(q[0],q[1],Math.max(2.5,r*.14),0,TAU);s.fill(ink,dot,.95*w);}
/** "eyes on the ball": a dotted yellow line from his face to the dropping ball */
function gaze(s:Sheet,c:Cam,r:DrawResult|undefined,tau:number,w:number){if(!r||w<=.02)return;const q=pr(c,ballAt(tau));if(!q)return;const f=r.joints.face;
 const n=8,d=Math.hypot(q[0]-f[0],q[1]-f[1]);if(d<30)return;const p=new Path2D(),rad=Math.max(2.5,d*.012);
 for(let i=1;i<n;i++){const g=mix2(f,q,i/n);p.moveTo(g[0]+rad,g[1]);p.arc(g[0],g[1],rad,0,TAU);}s.knockout(p,.8*w);s.fill(Y,p,.95*w);}
/** "strike through": a straight yellow arrow from the ball toward the goal (screen space, along the real shot line) */
function throughArrow(s:Sheet,c:Cam,w:number){if(w<=.02)return;const a=pr(c,V_PT),b=pr(c,mix3(V_PT,GOAL_PT,.35*w));if(!a||!b)return;
 const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),hd=Math.max(12,kAt(c,V_PT)*.2),ca=Math.cos(ang),sa=Math.sin(ang),wd=Math.max(4,kAt(c,V_PT)*.05);
 const p=ribbon([a,b],wd,{seed:92,taper:0,wobble:.3});p.addPath(polyPath([[b[0]+ca*hd*.6,b[1]+sa*hd*.6],[b[0]-ca*hd-sa*hd*.6,b[1]-sa*hd+ca*hd*.6],[b[0]-ca*hd+sa*hd*.6,b[1]-sa*hd-ca*hd*.6]],true));
 s.knockout(p,.85*w);s.fill(Y,p,.95*w);s.stroke(K,p,2,.6*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** Modrić's pass on "Luka Modrić", Vinícius's control on "Vinícius", the cross as "floats a cross" lands, the volley on "first time",
 * the net on "Goal"; real time elsewhere */
const tau1=(t:number)=>{const lm=CUE(0,'Luka Modrić'),g=CUE(0,'Goal');const s0=Math.max(T0+.4,T_MP-(lm+.2)*.75);
 return key(t,mono([[0,s0],[lm+.2,T_MP],[CUE(0,'Vinícius')+.3,T_VR+.2],[CUE(0,'floats a cross')+.35,T_CR],[CUE(0,'first time')+.1,0],[g+.05,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-g]]),linear);};
const P1:V3=[-24,27,76];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(Math.min(tau,IN_NET)),g=CUE(0,'Goal'),fc=CUE(0,'floats a cross'),vp=at3(HERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,3,-4],fov:34})],
  [CUE(0,'Manchester City')-.2,1.2,()=>({P:P1,T:mix3(b,[-32,1,-16],.4),fov:15})],
  [CUE(0,'Vinícius')-.3,1,()=>({P:P1,T:mix3(b,[-22,1,-18],.3),fov:14})],
  [fc+.2,1.2,()=>({P:P1,T:mix3(b,[-17,2,-2],.5),fov:17})],
  [CUE(0,'Fede Valverde')-.3,.8,()=>({P:P1,T:mix3(vp,[-10,1,2],.45),fov:13})],
  [g+.3,1.6,()=>({P:P1,T:add3(at3(HERO,tau),[1,1,0]),fov:13})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the floated cross, drawn on behind the ball, fading once the volley is struck; then the shot's line
  if(tau>T_CR&&tau<.8)flightPath(s,c,tau,.7*(1-sm(.1,.8,tau)),{from:T_CR,to:0,min:5});
  if(tau>0)flightPath(s,c,tau,.85*(1-sm(IN_NET+.6,IN_NET+1.4,tau)),{from:0,to:FLY_S,min:5,ink:R});
  // "Fede Valverde": a yellow ring under him as he arrives (the wide shot is small on a phone)
  const tV=CUE(0,'Fede Valverde');ring(s,c,at3(HERO,Math.min(tau,0)),1.3,sm(tV-.2,tV+.3,t,easeOutBack)*(1-sm(g-.2,g+.3,t)),Y,48);
  const hr=play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'}).hero;
  // the strike: a spark at his boot
  const age=tau;if(age>-.05&&age<.35){const q=pr(c,V_PT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,V_PT)*.55),{n:8,seed:13,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.2)/.15)),width:Math.max(4,kAt(c,V_PT)*.05)});}
  void hr;
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Goal')+.3;

// ---------------------------------------------------------------- 2 · slow-motion replay, low at Valverde's right side
const tau2=(t:number)=>key(t,mono([[0,-1.4],[CUE(1,'Watch again'),-1.3],[CUE(1,'Eyes on the ball'),-.75],[CUE(1,'swings his right leg'),-.28],[CUE(1,'ankle locked'),-.1],[CUE(1,'toes pointing down'),-.03],[CUE(1,'hits the middle'),0],[SECS(1),.3]]),linear);
/** low, off his right side and a little behind, so the kicking leg and the ball read side-on */
const E2:V3=[V_XZ[0]+RGT[0]*5.6-FWD[0]*2.2,1.05,V_XZ[1]+RGT[1]*5.6-FWD[1]*2.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,.3)),hp=at3(HERO,Math.min(tau,.1),.8),tS=CUE(1,'swings his right leg'),tH=CUE(1,'hits the middle');
 return plan(t,[
  [0,0,()=>({P:add3(E2,[0,.5,0]),T:mix3(hp,b,.45),fov:40})],
  [CUE(1,'Eyes on the ball')-.2,1,()=>({P:E2,T:mix3(hp,b,.5),fov:34})],
  [tS-.2,.8,()=>({P:add3(E2,[FWD[0]*1.4,-.35,FWD[1]*1.4]),T:add3(V_PT,[-FWD[0]*.3,.25,-FWD[1]*.3]),fov:24})],
  [tH+.3,1.2,()=>({P:add3(E2,[FWD[0]*.6,.4,FWD[1]*.6]),T:mix3(mix3(b,[V_XZ[0]+FWD[0]*3,.6,V_XZ[1]+FWD[1]*3],.5),hp,.45),fov:38})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tE=CUE(1,'Eyes on the ball'),tA=CUE(1,'ankle locked'),tT=CUE(1,'toes pointing down'),tH=CUE(1,'hits the middle');
  stadium(s,c,t);
  ground(s,c);
  // the last of the cross dropping in
  if(tau<.05)flightPath(s,c,tau,.8*(1-sm(-.05,.05,tau)),{from:Math.max(T_CR,tau-.8),to:0,min:6});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12}).hero;
  // "eyes on the ball": a dotted line from his face to the ball
  gaze(s,c,hr,tau,sm(tE-.1,tE+.3,t)*(1-sm(tA-.2,tA+.2,t)));
  // "ankle locked, toes pointing down": the red ring + rigid bar on the kicking foot
  ankleLock(s,hr,sm(tA-.15,tA+.25,t,easeOutBack)*(1-sm(tH+.5,tH+.9,t)));
  // "the middle of the ball": a crosshair on the ball as the laces meet it, then the spark
  middleMark(s,c,ballAt(Math.min(tau,0)),sm(tT-.05,tT+.25,t,easeOutBack)*(1-sm(tH+.3,tH+.6,t)));
  const sf=sm(tH-.1,tH+.25,t,easeOutBack)*(1-sm(tH+.6,tH+1,t));
  if(sf>.02){const p=pr(c,V_PT);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,V_PT)*.4)*sf,{n:9,seed:61,width:Math.max(5,kAt(c,V_PT)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),.3)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'hits the middle')+.25;

// ---------------------------------------------------------------- 3 · the second replay angle, behind the goal: low and hard into the corner
const tau3=(t:number)=>{const tk=CUE(2,'keeper'),t3=CUE(2,'Three all');return key(t,mono([[0,-.9],[CUE(2,'Behind the goal'),-.7],[CUE(2,'low and hard'),.05],[CUE(2,'into the corner'),FLY_S-.05],[tk+.3,IN_NET+.25],[t3,IN_NET+.9],[SECS(2)+1,IN_NET+.9+(SECS(2)+1-t3)*.9]]),linear);};
/** behind the goal, off the far post, a little raised: the shot comes straight at the lens and past the keeper */
const E3:V3=[7.5,2.6,-7];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),vp=at3(HERO,tau,1),t3=CUE(2,'Three all');
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([V_XZ[0],1.2,V_XZ[1]],[-6,.8,1],.35),fov:30})],
  [CUE(2,'low and hard')-.1,.9,()=>({P:add3(E3,[-.6,-.4,.6]),T:mix3(b,[-4,.6,-1],.5),fov:34})],
  [t3-.6,1.4,()=>({P:add3(vp,[7.5,1.6,-7.5]),T:add3(vp,[0,-.1,0]),fov:19})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tL=CUE(2,'low and hard'),tC=CUE(2,'into the corner'),t3=CUE(2,'Three all');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(t3-.1,t3+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // "low and hard": the shot's line drawn on behind the ball, in red, hugging the grass
  flightPath(s,c,tau,sm(tL-.2,tL+.1,t)*(1-sm(t3,t3+.6,t)),{from:0,to:FLY_S,min:7,ink:R});
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "into the corner": a ring round the far bottom corner as it goes in
  goalRing(s,c,GOAL_PT,sm(tC-.2,tC+.3,t,easeOutBack)*(1-sm(tC+.9,tC+1.4,t)),Y);
  // "three all!": a burst of yellow over the celebration (the passage material into the lesson)
  const fb=sm(t3+.3,t3+.9,t);if(fb>0){const q=pr(c,add3(at3(HERO,tau),[0,3.2,0]));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'into the corner')+.2;

// ---------------------------------------------------------------- 4 · the lesson: a raised side view of the strike
const tau4=(t:number)=>key(t,mono([[0,-1.1],[CUE(3,'Your turn'),-1],[CUE(3,'lock your ankle'),-.12],[CUE(3,'strike through'),-.02],[CUE(3,'middle of the ball'),.02],[SECS(3),.45]]),linear);
/** raised, square-on to his right side: the leg, the locked ankle, the ball and the line to goal all read at once */
const E4:V3=[V_XZ[0]+RGT[0]*7.2+FWD[0]*1.2,3,V_XZ[1]+RGT[1]*7.2+FWD[1]*1.2];
function cam4v(t:number):Cam{
 const hp=at3(HERO,0,.8);
 return plan(t,[
  [0,0,()=>({P:add3(E4,[0,-1.2,0]),T:mix3(hp,V_PT,.5),fov:30})],
  [CUE(3,'lock your ankle')-.2,.8,()=>({P:add3(E4,[-RGT[0]*1.2,-1.4,-RGT[1]*1.2]),T:add3(V_PT,[0,.2,0]),fov:24})],
  [CUE(3,'middle of the ball')+.2,1.2,()=>({P:E4,T:[V_XZ[0]+FWD[0]*3.5,.7,V_XZ[1]+FWD[1]*3.5],fov:36})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tY=CUE(3,'Your turn'),tL=CUE(3,'lock your ankle'),tS=CUE(3,'strike through'),tM=CUE(3,'middle of the ball'),E=SECS(3);
  stadium(s,c,t);
  ground(s,c);
  // 1 · your turn: a ring under the striker
  ring(s,c,at3(HERO,Math.min(tau,0)),.8,sm(tY-.15,tY+.35,t,easeOutBack)*(1-sm(tL,tL+.4,t)),Y,44);
  // 3 · strike through: the straight arrow along the shot line, then the real path
  throughArrow(s,c,sm(tS-.1,tS+.5,t)*(1-sm(E-.8,E-.4,t)));
  if(tau>0)flightPath(s,c,tau,1-sm(E-.8,E-.4,t),{from:0,to:FLY_S,min:7,ink:R});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:13}).hero;
  // 2 · lock your ankle: the red ring + rigid bar on the foot
  ankleLock(s,hr,sm(tL-.2,tL+.2,t,easeOutBack)*(1-sm(tM+.6,tM+1,t)));
  // 4 · the middle of the ball: the crosshair, then the spark at contact
  middleMark(s,c,ballAt(Math.min(tau,0)),sm(tM-.3,tM,t,easeOutBack)*(1-sm(tM+.4,tM+.8,t)));
  const sf=sm(tM-.05,tM+.2,t,easeOutBack)*(1-sm(tM+.5,tM+.9,t));if(sf>.02){const p=pr(c,V_PT);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(40,kAt(c,V_PT)*.4)*sf,{n:8,seed:65,width:Math.max(4,kAt(c,V_PT)*.04)});}
 },
 still:0,
};
ch4.still=CUE(3,'middle of the ball')+.4;

const film:RisoStory={
 id:'valverde-signature',format:'11v11',title:"Valverde's long-range thunderbolt",
 theme:'The thunderbolt: lock your ankle and strike through the middle of the ball',
 ageNote:'Real Madrid v Manchester City, UEFA Champions League quarter-final first leg, Santiago Bernabéu, Madrid, 9 April 2024 (Valverde\'s first-time volley, 79th minute, UEFA Goal of the Season). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a thunderbolt — a straight, low yellow streak with a ball riding it and a spark where it was struck. Reduced motion: the still streak. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.35)),fade=age<=0?1:1-clamp((age-.5)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*u;pts.push([x+320*k,y-30*Math.sin(Math.PI*k)+10*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,16,{seed,taper:.8,pressure:.3,wobble:.6}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
