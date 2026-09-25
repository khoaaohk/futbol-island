/** Oliver Kahn's three shoot-out saves — Bayern Munich 1–1 Valencia (a.e.t., Bayern won 5–4 on penalties), 2001 UEFA Champions League
 * final, San Siro, Milan, 23 May 2001 — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the shoot-out from WRITTEN accounts (the footage itself was
 * not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2001 UEFA Champions League final" (raw wikitext): date, San Siro, 20:45 CEST kick-off, 79,000, referee Dick Jol (NED),
 *    line-ups + numbers, the shoot-out order, Kahn Man of the Match and "stretched out his hand to tip Carboni's shot onto the crossbar",
 *    "Kahn guessed the right direction and saved" (Pellegrino), his consoling of Cañizares; the kit boxes (Bayern: red body + white collar,
 *    red sleeves with white stripes, red shorts, white socks; Valencia: white shirts with black trim, black shorts, white socks)
 *    https://en.wikipedia.org/wiki/2001_UEFA_Champions_League_final  (+ the kit pattern image Kit_body_FCBAYERN_0001t.png)
 *  - The Guardian, Matt Biggs, "Bayern Munich 1-1 Valencia; Bayern won 5-4 on penalties" (minute by minute, 23 May 2001): "Zahovic fluffs it
 *    ... as Kahn guesses right"; "Carboni blows it after Kahn gets a hand to it despite going the wrong way"; "Pellegrino straight at Kahn"
 *    https://www.theguardian.com/football/2001/may/23/minutebyminute.sport
 *  - Wikipedia (es), "Final de la Liga de Campeones de la UEFA 2000-01": Carboni's "disparo centrado es despejado con mucha fortuna por
 *    Kahn"; Pellegrino's "tiro centrado es adivinado por Kahn"; Cañizares consoled by Kahn, Kuffour and Zickler
 *  - Wikipedia (de), "UEFA Champions League 2000/01": the shoot-out box ("Kahn hält gegen Zahovič / Carboni / Pellegrino")
 * CONFIRMED by those accounts: San Siro, Milan, 23 May 2001, an evening kick-off (so the shoot-out is under floodlights); 1–1 after extra
 *  time; the order — Bayern first: Paulo Sérgio ✗ (over), Mendieta ✓, Salihamidžić ✓, Carew ✓, Zickler ✓, ZAHOVIČ ✗ (Kahn saves, 2–2),
 *  Andersson ✗ (Cañizares saves), CARBONI ✗ (Kahn gets a hand to it despite going the wrong way; it hits the crossbar), Effenberg ✓,
 *  Baraja ✓, Lizarazu ✓, Kily González ✓, Linke ✓, PELLEGRINO ✗ (a shot near the middle; Kahn reads it and saves) — Bayern win 5–4;
 *  numbers Kahn 1, Pellegrino 2, Zahovič 8, Carboni 15, Cañizares 1; Bayern in red shirts and red shorts, Valencia in white shirts and
 *  black shorts (printed navy); Kahn Man of the Match; afterwards he comforted Cañizares.
 * INFERRED (illustrative): WHICH WAY each ball went and Kahn dived (Zahovič at mid height to Kahn's right; Carboni high near the middle while Kahn
 *  dives to his left and tips it with the trailing right glove; Pellegrino at middle height a little to Kahn's left, both gloves) — the
 *  narration never names a side; the kickers' feet (Zahovič and Pellegrino right, Carboni left) and run-ups; every position and time in
 *  metres/seconds; which end the shoot-out used; Kahn's GOALKEEPER KIT colours (printed grey with black shorts — not verified, never named),
 *  Cañizares's kit (yellow), the referee's kit (navy), Bayern's sock detail, the hair; the celebration run; where the referee, assistant
 *  and Cañizares stood; the players arm in arm in the centre circle; the ball print (a plain 5-panel); San Siro as drawn (three tiers, the
 *  roof with its red girders, the corner towers), crowd colours, boards; the camera placements.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (San Siro at night → the players linked in the
 * centre circle → Kahn on his line → Zahovič: saved → broadcast wipe → Carboni: the fingertips, the bar → wipe → Pellegrino: saved → Kahn
 * away celebrating); ch2 = the slow-motion replay of the winning save from LOW BEHIND Pellegrino's right shoulder (Kahn tall and still on
 * his line, the sight line to the ball while he waits, the dive arrow, the spark at the gloves, then the celebration and the red-and-white
 * paper rain); ch3 = the lesson from a low three-quarter camera in front of the goal: a penalty goes in (red trail, a jagged red ring, the
 * keeper droops) → stay strong and confident (he stands big, the ring turns a steady yellow) → forget the last kick (the red goal is wiped
 * off the sheet) → face one penalty at a time (the lens swings to the side: one ball on the spot, ringed, one sight line).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central ~1000 units,
 * so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through
 * ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion, a motion smear on the runs, the
 * kicks and the dives); small figures in the wide shots and every figure inside a passage print at `low` detail. Handedness: the world is
 * right-handed (x toward the goal, y up, +z = the main-stand side), athlete.ts's own convention, so no mirrored projector; Kahn faces −x,
 * so his RIGHT is −z and his LEFT is +z. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded
 * word onsets), poses on twos, cameras on ones; all randomness seeded. Budget: ~150–330 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type Build,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a
 * word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Penalties, live',text:"Milan, 2001. The Champions League final goes to penalties. Oliver Kahn guesses right and saves from Zahovič. Carboni shoots, and Kahn's fingertips push it onto the bar. Then Pellegrino steps up... saved! Bayern win!",tail:2.3,
  cues:['Milan','The Champions League','goes to penalties','Oliver Kahn','saves from','Carboni shoots','fingertips','onto the bar','Then Pellegrino','steps up','saved','Bayern win']},
 {label:'The winning save',text:'Watch the winning save again, slowly. Kahn stands tall and still. He waits for the kick, guesses correctly, dives and keeps it out. Bayern are champions of Europe!',tail:2.2,
  cues:['Watch','Kahn stands','He waits','guesses correctly','dives and','keeps it out','Bayern are','champions of Europe']},
 {label:'Your turn',text:'Your turn, keepers. Even when a penalty goes in, stay strong and confident. Forget the last kick, and face one penalty at a time.',tail:2.2,
  cues:['Your turn','Even when','penalty goes in','stay strong','confident','Forget the last','face one penalty','at a time']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py kahn-shootout-2001, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/kahn-shootout-2001/timing.json';
 * and set VOICE to `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times. */
import timingJson from '../../../public/plays/narration/kahn-shootout-2001/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ the Kokoro pace): .22 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.22+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.38;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('kahn: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kahn: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors, framing
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the shoot-out goal line is x = 0 (the kicks go +x), the goal centre z = 0, +z = the main-stand side (the camera side). */
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

// ---------------------------------------------------------------- San Siro at night: three steep tiers close to the pitch, the roof and its red girders, the corner towers
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the shoot-out goal (x>0), 2 the main stand (z>0, the camera
 * side), 3 the far end. No running track: the stands rise right behind the boards. */
const SH=46;
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-114,9,a),1.2+SH*b,-40-36*b],
 (a,b)=>[8+36*b,1.2+SH*b,lerp(-41,41,a)],
 (a,b)=>[lerp(9,-114,a),1.2+SH*b,40+36*b],
 (a,b)=>[-113-36*b,1.2+SH*b,lerp(41,-41,a)],
];
const STAND_COLS=[104,70,104,70],STAND_ROWS=18,TIERS=[.34,.67];
/** the four tall corner towers that carry the roof (cylinders), x,z */
const TOWERS:[number,number][]=[[15,-47],[15,47],[-120,-47],[-120,47]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 // a May night in Milan: a deep blue screen, navy over it, darker high up
 s.field(B,.55,.6);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.42);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-620],[-Bnd,hz-520]],true),.3);
 // the corner towers behind the stands: navy cylinders with the paper spiral of their ramps
 const tw=new Path2D(),sp=new Path2D();
 for(const[x,z] of TOWERS){const d:V3=[x-c.eye[0],0,z-c.eye[2]],l=Math.hypot(d[0],d[2])||1,side:V3=[-d[2]/l*6,0,d[0]/l*6];
  const q=polyP(c,[[x-side[0],0,z-side[2]],[x+side[0],0,z+side[2]],[x+side[0],54,z+side[2]],[x-side[0],54,z-side[2]]]);if(q.length<3)continue;addPoly(tw,q);
  for(let k=0;k<9;k++){const y=4+k*5.4;seg3(c,[x-side[0],y,z-side[2]],[x+side[0],y+3.2,z+side[2]],.9,sp);}}
 s.knockout(tw);s.tone(K,tw,.72);s.tone(B,tw,.3);s.knockout(sp,.55);
 const planes=new Path2D(),fronts=new Path2D(),shade=new Path2D(),roof=new Path2D(),girder=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  // the tier fronts: a paper fascia with the next tier's shadow under it
  for(const b of TIERS){seg3(c,S(0,b),S(1,b),.7,fronts);addPoly(shade,polyP(c,[S(0,b-.035),S(1,b-.035),S(1,b),S(0,b)]));}
  // the roof: a flat deck over the top tier, held by the red lattice girders along its inner edge and across it
  const ro=(a:number):V3=>add3(S(a,1),[0,4,0]),ri=(a:number):V3=>{const p=S(a,.42);return[p[0],SH+6,p[2]];};
  addPoly(roof,polyP(c,[ro(0),ro(1),ri(1),ri(0)]));
  seg3(c,ri(0),ri(1),1.6,girder);
  for(let k=0;k<=8;k++){const a=k/8;seg3(c,ri(a),ro(a),1.1,girder);}}
 s.knockout(planes);s.tone(K,planes,.52);s.tone(B,planes,.3);s.tone(K,shade,.5);
 // the crowd: seeded marks (Bayern red and white, Valencia white, black and orange), sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIERS.some(q=>Math.abs(b-q)<.03))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.55?0:h<.8?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(Y,inks[2],.9);s.tone(R,inks[2],.4);s.fill(K,inks[3],.9);
 s.knockout(fronts,.6);
 s.knockout(roof);s.tone(K,roof,.62);s.tone(B,roof,.28);
 s.knockout(girder);s.fill(R,girder,.95);s.tone(K,girder,.18);
 // floodlights: lamp strips hung under the roof's inner edge, a soft yellow wash
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=S(u-.03,.42),b=S(u+.03,.42);const A:V3=[a[0],SH+4.6,a[2]],Bq:V3=[b[0],SH+4.6,b[2]];if(toCam(c,A)[2]<NEAR+2)continue;seg3(c,A,Bq,1.1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean}={}){
 // the dark surround in front of the stands, then the lit grass
 const sur=polyP(c,[[-113,0,-40],[8,0,-40],[8,0,40],[-113,0,40]]);if(sur.length<3)return;const sp=polyPath(sur,true);
 s.knockout(sp);s.fill(Y,sp,.7);s.tone(B,sp,.85);s.tone(K,sp,.42);
 const g=polyP(c,[[-109,0,-37.5],[4,0,-37.5],[4,0,37.5],[-109,0,37.5]]),gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.8);s.tone(K,gp,.12);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.14);
 // advertising boards behind the goal and along both touchlines: navy with paper panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5,0,-36],[5,0,36]);board([-108,0,-37],[5,0,-37]);board([-108,0,37],[5,0,37]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[4.9,.25,z],[4.9,.25,z+3.4],[4.9,.7,z+3.4],[4.9,.7,z]]));}
 for(const zz of[-36.9,36.9])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.7,zz],[x,.7,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.tone(B,bd,.3);s.knockout(pn,.85);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out round z = BZ */
let BZ=0;
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.55*Math.exp(-Math.pow((z-BZ)/1.6,2));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Bayern: red shirts (white collar and sleeve stripes = paper trim), red shorts, white socks */
const bayern=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[R,.95],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
/** Valencia: white shirts with black trim, black shorts (printed navy), white socks */
const valencia=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Oliver Kahn, 1.88 m, No. 1, blond — keeper kit colours INFERRED (grey = a navy screen, black shorts), paper gloves */
const KAHN_B:Build={height:1.88,bulk:1.1};
const KAHN_ST:AthleteStyle={shirt:[K,.42],shorts:[K,.9],socks:[K,.42],boots:K,skin:SKIN_L,hair:[Y,.9],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',shade:[B,.4],build:KAHN_B,seed:1};
const CANI_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.81},seed:61};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,hairStyle:'balding',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- the three kicks on one clock τ each (seconds; τ = 0 is the contact)
/** the ball on the spot, 11 m out; Kahn on his line */
const B0:V3=[-11,.11,0];
const KX=-.14;
const T_RUN0=-1.3,SD=1.0,RUN_END=-STRIKE_CONTACT*SD,RUN_L=3.0,STRIKE_L=1.4,G_MARK=-(RUN_L+STRIKE_L),POWER=.85;
type KickSpec={name:string;st:AthleteStyle;foot:'l'|'r';side:'l'|'r';height:number;tDive:number;diveS:number;tSave:number;kind:'parry'|'tip';reb:[number,number]};
type Kick=KickSpec&{dir:[number,number];yaw:number;pc:[number,number];H:V3;hand:'l'|'r'|'both'};
/** Zahovič (8): low to Kahn's right, Kahn guesses right; Carboni (15): high near the middle while Kahn goes left, the trailing right glove
 * tips it onto the bar; Pellegrino (2): middle height a little to Kahn's left, both gloves — sides and feet INFERRED */
const SPECS:KickSpec[]=[
 {name:'Zahovič',st:valencia({number:8,build:{height:1.8},seed:8}),foot:'r',side:'r',height:.25,tDive:-.06,diveS:.95,tSave:.42,kind:'parry',reb:[-3.6,-2.6]},
 {name:'Carboni',st:valencia({number:15,build:{height:1.76},hairStyle:'short',seed:15}),foot:'l',side:'l',height:.8,tDive:0,diveS:1.4,tSave:.3,kind:'tip',reb:[-4.2,.3]},
 {name:'Pellegrino',st:valencia({number:2,build:{height:1.84},seed:2}),foot:'r',side:'l',height:.35,tDive:-.04,diveS:.95,tSave:.34,kind:'parry',reb:[-2.6,2.2]},
];
const KPLACE:Place={x:KX,z:0,yaw:Math.PI};
/** the dive; for the tip (Carboni) the trailing RIGHT arm reaches back up over the middle while the body goes left */
function diveAt(k:KickSpec,tau:number):Pose{const ph=clamp((tau-k.tDive)/k.diveS),p=keeperDive(ph,{side:k.side,height:k.height});
 if(k.kind!=='tip')return p;const w=sm(.08,.26,ph)*(1-sm(.55,.8,ph)),D=Math.PI/180;
 p.rShA=lerp(p.rShA,178*D,w);p.rShF=lerp(p.rShF,20*D,w);p.rElb=lerp(p.rElb,4*D,w);p.rHand=lerp(p.rHand,1,w);p.bend=lerp(p.bend,12*D,w);p.roll*=1-.45*w;return p;}
const KICKS:Kick[]=SPECS.map(k=>{
 const sg=k.foot==='r'?1:-1,n=Math.hypot(1,.36),dir:[number,number]=[1/n,sg*.36/n],yaw=yawTo(0,0,dir[0],dir[1]);
 // where the kicker's pelvis stands at contact so the toe of the kicking boot meets the back of the ball (solved once, FK)
 const sk=solve(strike(STRIKE_CONTACT,{foot:k.foot,power:POWER}),k.st.build,{x:0,z:0,yaw}),toe=k.foot==='r'?sk.rToe:sk.lToe,tg:[number,number]=[B0[0]-dir[0]*.1,B0[2]-dir[1]*.1];
 // where the ball meets Kahn: his gloves at the save, solved from the dive (a ball radius in front of the palm)
 const ks=solve(diveAt(k,k.tSave),KAHN_B,KPLACE);let H:V3,hand:'l'|'r'|'both';
 if(k.kind==='tip'){const trail=ks.lHa[2]<ks.rHa[2]?'l':'r';hand=trail;const h=trail==='l'?ks.lHa:ks.rHa;H=[h[0]-.1,h[1]+.06,h[2]-.05];}
 else{// both gloves, the ball nearer the leading one (the far hand along the dive)
  hand='both';const lead=Math.abs(ks.lHa[2])>Math.abs(ks.rHa[2])?ks.lHa:ks.rHa,mid=mix3(ks.lHa,ks.rHa,.5),q=mix3(mid,lead,.85);H=[q[0]-.13,q[1],q[2]];}
 return{...k,dir,yaw,pc:[tg[0]-toe[0],tg[1]-toe[2]],H,hand};
});
const REB_T=.5,ROLL_T=1.8;
/** the ball for kick i at τ: on the spot, the flight (a gentle rise, slowing a touch), the save, the rebound and roll */
function ballAt(i:number,tau:number):V3{
 const k=KICKS[i];
 if(tau<=0)return B0;
 if(tau<k.tSave){const v=tau/k.tSave,u=1.1*v-.1*v*v,p=mix3(B0,k.H,u);p[1]+=.25*4*u*(1-u)*Math.min(1,k.H[1]);return p;}
 const a=tau-k.tSave;
 if(k.kind==='tip'){// up off the fingertips onto the crossbar, down and out
  const BAR:V3=[.02,2.44-.02,k.H[2]*.9],D1:V3=[-1.9,.11,k.H[2]*.8],D2:V3=[k.reb[0],.11,k.reb[1]];
  if(a<.09)return mix3(k.H,BAR,a/.09);
  if(a<.55){const u=(a-.09)/.46,p=mix3(BAR,D1,u);p[1]=lerp(BAR[1],.11,u*u)+.5*u*(1-u);return p;}
  const u=easeOut(clamp((a-.55)/ROLL_T)),p=mix3(D1,D2,u);p[1]=.11+.5*Math.abs(Math.sin(u*Math.PI*1.5))*(1-u);return p;}
 const R1:V3=[lerp(k.H[0],k.reb[0],.55),.11,lerp(k.H[2],k.reb[1],.55)],R2:V3=[k.reb[0],.11,k.reb[1]];
 if(a<REB_T){const u=a/REB_T,p=mix3(k.H,R1,u);p[1]=lerp(k.H[1],.11,u)+.9*u*(1-u);return p;}
 const u=easeOut(clamp((a-REB_T)/ROLL_T));return mix3(R1,R2,u);
}
const spinAt=(i:number,tau:number)=>tau<=0?0:-TAU*5*Math.min(tau,KICKS[i].tSave)+TAU*1.4*Math.max(0,tau-KICKS[i].tSave);

// ---------------------------------------------------------------- the kickers: at the mark, the run, the kick, hands to the head
const P_WAIT=posed({lHipF:-4,rHipF:10,lKnee:10,rKnee:16,lAnk:0,rAnk:-4,lean:4,pitch:1,neckP:-2,lShA:12,rShA:12,lShF:2,rShF:0,lElb:16,rElb:18});
const P_GO=posed({lHipF:-18,rHipF:22,lKnee:24,rKnee:30,lAnk:16,rAnk:-6,lean:14,pitch:4,neckP:10,lShA:22,rShA:20,lShF:-12,rShF:14,lElb:40,rElb:46,twist:-8});
const P_HEAD=posed({lHipF:6,rHipF:8,lKnee:10,rKnee:12,lean:-4,neckP:-18,lShF:150,rShF:150,lShA:30,rShA:30,lElb:125,rElb:125});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const gPos=(k:Kick,g:number):[number,number]=>[k.pc[0]+k.dir[0]*g,k.pc[1]+k.dir[1]*g];
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function takerPose(i:number,tau:number,it:number):Pose{
 const k=KICKS[i];
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*2.1+i),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.3,T_RUN0,tau));p.lean+=.02*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(2.2*Math.pow(u,.9),{speed:.6}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.2+(tau-RUN_END)*1.5,{speed:.55});
 let p=blendPose(run,strike(Math.min(1,us),{foot:k.foot,power:POWER}),sm(RUN_END,RUN_END+.14,tau));
 if(tau>k.tSave+.35)p=blendPose(p,P_HEAD,sm(k.tSave+.35,k.tSave+.9,tau));
 return p;
}
function takerPlace(i:number,tau:number):Place{
 const k=KICKS[i];let g:number;
 if(tau<=T_RUN0)g=G_MARK;
 else if(tau<RUN_END){const u=runU(tau);g=G_MARK+RUN_L*(1.25*u-.25*u*u);}
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.6*(1-Math.pow(1-clamp(tau/.6),2));
 const[x,z]=gPos(k,g);return{x,z,yaw:k.yaw};
}

// ---------------------------------------------------------------- Kahn: tall and still, the set, the dive, back up — and after the last one, away
/** "stands tall": upright, arms out and low, gloves open — big in the goal */
const TALL=posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lHipA:14,rHipA:14,lean:4,pitch:2,lShA:50,rShA:50,lShF:14,rShF:14,lElb:22,rElb:22,lHand:1,rHand:1,neckP:-4});
/** the lesson's droop (a goal has gone in) and the big, confident stance */
const DROOP=posed({lHipF:10,rHipF:10,lKnee:14,rKnee:14,lean:30,pitch:4,neckP:42,lShA:10,rShA:10,lShF:8,rShF:8,lElb:18,rElb:18});
const BIG=posed({lHipF:10,rHipF:10,lKnee:18,rKnee:18,lHipA:20,rHipA:20,lean:-2,pitch:0,neckP:-12,lShA:88,rShA:88,lShF:10,rShF:10,lElb:10,rElb:10,lHand:1,rHand:1});
/** after the dive: getting up (dz kept, so he stands where he landed) */
const upOf=(k:KickSpec)=>{const e=diveAt(k,1e3),p=blendPose(stand(),TALL,.3);p.dx=e.dx;p.dz=e.dz;return p;};
/** where his body is in the world after the dive (dx forward, dz right, turned by his yaw π) */
const landed=(k:KickSpec):[number,number]=>{const e=diveAt(k,1e3);return[KX-e.dx,-e.dz];};
const CEL_DIR:[number,number]=(()=>{const d=[-14,9],l=Math.hypot(d[0],d[1]);return[d[0]/l,d[1]/l];})();
function kahnAt(i:number,tau:number,it:number,o:{celebrate?:boolean}={}):{pose:Pose;place:Place}{
 const k=KICKS[i],tUp0=k.tDive+k.diveS+.15,tUp1=tUp0+.6;
 let p=blendPose(TALL,keeperSet(it*1.3),sm(T_RUN0-.2,T_RUN0+.4,tau));
 if(tau>k.tDive)p=blendPose(p,diveAt(k,tau),sm(k.tDive,k.tDive+.06,tau));
 if(tau>tUp0)p=blendPose(p,upOf(k),sm(tUp0,tUp1,tau,easeInOutSine));
 if(!o.celebrate||tau<tUp1)return{pose:p,place:KPLACE};
 // away he goes: a fist-pumping run (inferred), dz baked into the place
 const[lx,lz]=landed(k),up={...upOf(k),dx:0,dz:0},d=Math.max(0,tau-tUp1-.15),run=d*d/(d+.4)*5.2,yaw=lerpAng(Math.PI,yawTo(0,0,CEL_DIR[0],CEL_DIR[1]),sm(tUp1,tUp1+.4,tau));
 const cp=celebrate((tau-tUp1)*1.3,{kind:'run'});
 return{pose:blendPose(up,cp,sm(tUp1,tUp1+.35,tau)),place:{x:lx+CEL_DIR[0]*run,z:lz+CEL_DIR[1]*run,yaw}};
}
const kahnXZ=(i:number,tau:number,cel=false):V3=>{const s=kahnAt(i,tau,0,{celebrate:cel}),sk=solve(s.pose,KAHN_B,s.place);return[sk.pelvis[0],0,sk.pelvis[2]];};

// ---------------------------------------------------------------- everyone else: Cañizares, the officials, the players arm in arm in the centre circle
type Role='cani'|'ref'|'ar'|'bay'|'val';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const LINE:Actor[]=[];
{const bay=[[4,SKIN_D],[5,SKIN_L],[11,SKIN_L],[3,SKIN_L],[25,SKIN_L],[21,SKIN_L]] as [number,InkFill[]][],val=[[6,SKIN_L],[7,SKIN_L],[19,SKIN_L],[18,SKIN_M],[20,SKIN_D],[23,SKIN_L]] as [number,InkFill[]][];
 bay.forEach(([n,sk],i)=>LINE.push({name:'Bayern '+n,role:'bay',st:bayern({number:n,skin:sk,build:{height:1.8+.03*(i%2)},seed:40+i,detail:'low',hairStyle:n===11?'long':'short'}),x:-52.5+.2*(i%2),z:-5.2+i*.64,phase:i*.23}));
 val.forEach(([n,sk],i)=>LINE.push({name:'Valencia '+n,role:'val',st:valencia({number:n,skin:sk,build:{height:1.8+.02*(i%2)},seed:50+i,detail:'low',hairStyle:n===6?'long':'short'}),x:-52.5-.2*(i%2),z:.8+i*.64,phase:i*.31}));}
const ACTORS:Actor[]=[
 {name:'Cañizares',role:'cani',st:CANI_ST,x:.4,z:-20.6,phase:.2},
 {name:'Jol',role:'ref',st:REF_ST,x:-7.5,z:-9.6,phase:.6},
 {name:'assistant',role:'ar',st:{...REF_ST,hairStyle:'short',seed:31},x:.6,z:9.4,phase:.1},
 ...LINE,
];
const LINKED=posed({lShA:26,rShA:26,lShF:-6,rShF:-6,lElb:12,rElb:12,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:6,neckP:4});
/** one actor at τ of kick i (it = idle clock); win = 0..1 once the last save is made (Bayern run toward Kahn, Valencia slump) */
function actorAt(a:Actor,tau:number,it:number,win:number,i:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),br=Math.sin(it*2.1+a.phase*TAU);
 switch(a.role){
  case 'cani':{let p=blendPose(stand(),LINKED,.3+.1*br);if(win>0)p=blendPose(p,SLUMP,win);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'ref':{const p=blendPose(stand(),LINKED,.2+.1*br);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,.5)}};}
  case 'ar':{const p=blendPose(stand(),LINKED,.2);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'bay':{if(win<=0)return{pose:blendPose(LINKED,stand(),.2+.1*br),place:{x:a.x,z:a.z,yaw:toBall}};
   const d=Math.max(0,win*4.2-.3),run=d*d/(d+.6)*7,tg=kahnXZ(i,tau,true),dx=tg[0]-a.x,dz=tg[2]-a.z,l=Math.hypot(dx,dz)||1,r=Math.min(run,l-2);
   return{pose:blendPose(celebrate(it*.9+a.phase,{kind:'arms'}),runCycle(r*.3+a.phase,{speed:.9}),sm(.2,.35,win)),place:{x:a.x+dx/l*r,z:a.z+dz/l*r,yaw:yawTo(a.x,a.z,tg[0],tg[2])}};}
  default:{let p=blendPose(LINKED,stand(),.2+.1*br);if(win>0)p=blendPose(p,SLUMP,win);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the runs, the kicks, the dives). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBallAt(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;from?:V3|null}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.from){const a=pr(c,o.from);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(220,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path of kick i from τa to τb as projected points */
function pathPts(c:Cam,i:number,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let j=0;j<=n;j++){const p=pr(c,ballAt(i,lerp(ta,tb,j/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={i:number;it:number;win?:number;cel?:boolean;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;line?:boolean;taker?:boolean;kahnOverride?:(tau:number)=>{pose:Pose;place:Place}};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&px>170)return{...st,detail:'mid'};return st;};
 const i=e.i,k=KICKS[i],win=e.win??0,kahn=e.kahnOverride??((tt:number)=>kahnAt(i,tt,tt,{celebrate:e.cel}));
 if(e.taker!==false){const pl=takerPlace(i,tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=takerPose(i,tp,e.it),prev={pose:takerPose(i,tpPrev,e.it-1/12),place:takerPlace(i,tpPrev)};
  drawPlayer(s,pose,c,detailFor(k.st,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2&&tp<.4);}});}
 {const cur=kahn(tp),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=kahn(tpPrev);drawPlayer(s,cur.pose,c,detailFor(KAHN_ST,d,true),cur.place,prev,!!e.smear&&tp>k.tDive&&tp<k.tDive+k.diveS*.8);}});}
 for(const a of ACTORS){if(!e.line&&(a.role==='bay'||a.role==='val'))continue;const cur=actorAt(a,tp,e.it,win,i),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12,win,i);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const P=ballAt(i,tau),bq=toCam(c,P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBallAt(s,c,P,spinAt(i,tau),{min:e.minBall,from:e.lines&&e.prevT!==undefined&&tau>0&&tau<k.tSave+.6?ballAt(i,e.prevT):null});}});
 items.sort((a,b)=>b.d-a.d).forEach(q=>q.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result (a duration of .01 is a cut) */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast speed streak (the replay wipe) */
function streaks(s:Sheet,amt:number,seed:number){if(amt<=.02)return;const v=view(s),p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L,y],[x0+L,y]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85*cov);
}
/** a ring on the ground round a point: jagged (doubt) → smooth (confidence) */
function groundRing(s:Sheet,c:Cam,at:V3,r:number,jag:number,w:number,ink:string,cov:number,t:number){
 const pts:Pt[]=[];for(let i=0;i<48;i++){const a=i/48*TAU,k=1+jag*(.22*Math.sin(a*9+t*7)+.12*Math.sin(a*14-t*11)),p=pr(c,[at[0]+Math.cos(a)*r*k,.02,at[2]+Math.sin(a)*r*k]);if(p)pts.push(p);}
 if(pts.length<30)return;const rr=ribbon(pts,w,{close:true,seed:43,taper:0,wobble:jag*2+.6});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
/** a dashed yellow sight line between two sheet points */
function sightLine(s:Sheet,a:Pt,b:Pt,w:number,u1:number){
 const rb=new Path2D(),n=9;for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
 s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, three kicks
/** the live schedule: each kick's contact time on the chapter clock and the two broadcast cuts between them (keyed on the cues) */
function sched(){
 const tA=CUE(0,'saves from')-KICKS[0].tSave-.1,tB=CUE(0,'fingertips')-KICKS[1].tSave-.05,tC=CUE(0,'saved')-KICKS[2].tSave-.08;
 const cutB=Math.max(tA+KICKS[0].tSave+.75,Math.min(CUE(0,'Carboni')-.25,tB+T_RUN0-.45));
 const cutC=Math.max(tB+KICKS[1].tSave+1.1,Math.min(CUE(0,'Then')-.1,tC+T_RUN0-.8));
 return{t0:[tA,tB,tC],cutB,cutC};
}
const seg1=(t:number)=>{const S=sched(),i=t<S.cutB?0:t<S.cutC?1:2;return{i,tau:Math.max(T_RUN0-4,t-S.t0[i])};};
const P1:V3=[-38,21,55];
const FR:Shot={P:P1,T:[-5.1,1.1,.2],fov:8.6};
function cam1(t:number):Cam{
 const S=sched(),[,,tC]=S.t0,kC=KICKS[2];
 const follow=():Shot=>{const g=kahnXZ(2,Math.max(0,t-tC),true);return{P:P1,T:add3(g,[0,1,0]),fov:8.5};};
 return plan(t,[
  [0,0,()=>({P:P1,T:[-42,17,-34],fov:50})],
  [CUE(0,'The Champions')-.2,1.4,()=>({P:P1,T:[-38,8,-16],fov:36})],
  [CUE(0,'goes to penalties')-.2,1.1,()=>({P:P1,T:[-52.5,1,-.6],fov:9})],
  [CUE(0,'Oliver Kahn')-.25,.9,()=>({P:P1,T:[KX,1.1,0],fov:4.4})],
  [Math.max(CUE(0,'Oliver Kahn')+.8,S.t0[0]+T_RUN0-.25),.8,()=>FR],
  [S.t0[1]+KICKS[1].tSave-.05,.6,()=>({P:P1,T:[-1.3,1.4,.2],fov:7.5})],
  [S.cutC,.01,()=>FR],
  [tC+kC.tSave+.35,.8,follow],
  [CUE(0,'Bayern win')-.1,1.4,()=>{const f=follow();return{...f,fov:15};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),S=sched(),{i,tau}=seg1(t),tt=twos(t),tp=seg1(tt).i===i?seg1(tt).tau:tau,tpp=seg1(tt-1/12).i===i?seg1(tt-1/12).tau:tp-1/12;
  const tSv=S.t0[i]+KICKS[i].tSave,win=i===2?sm(tSv+.3,tSv+1.6,t):0;
  stadium(s,c,t,[0,1,3],{roar:sm(tSv,tSv+.4,t)*(i===2?1:.6),flash:sm(tSv+.05,tSv+.3,t)*(i===2?1:.4)*(1-sm(tSv+2.5,tSv+3.5,t))});
  ground(s,c);
  play(s,c,tau,tp,tpp,{i,it:tt,win,cel:i===2,minBall:12,lines:true,prevT:tau-.06,line:true});
  // the broadcast cuts between the kicks: a quick streaked wipe
  streaks(s,bump(S.cutB-.12,S.cutB+.3,t)+bump(S.cutC-.12,S.cutC+.3,t),11+i);
 },
 aperture(t){const c=cam1(t),{i,tau}=seg1(t),g=kahnXZ(i,tau,i===2),q=pr(c,add3(g,[0,1,0]))??[0,0];return apertureDisc(q[0],q[1],Math.max(14,kAt(c,g)*.5),12);},
 still:14,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay of the winning save, low behind Pellegrino's right shoulder
const tau2=(t:number)=>{const kC=KICKS[2];return key(t,mono([[0,T_RUN0-.9],[CUE(1,'Kahn stands'),T_RUN0-.5],[CUE(1,'He waits'),T_RUN0-.05],[CUE(1,'guesses'),-.08],[CUE(1,'dives and'),.16],[CUE(1,'keeps it out'),kC.tSave+.02],[CUE(1,'keeps it out')+.9,kC.tSave+.3],[CUE(1,'Bayern are'),1.75],[SECS(1),3.7]]),linear);};
const E2:V3=[-19.4,1.6,1.9];
function cam2(t:number):Cam{
 const kC=KICKS[2];
 return plan(t,[
  [0,0,()=>({P:E2,T:[-3,1.1,0],fov:21})],
  [CUE(1,'Kahn stands')-.25,1,()=>({P:add3(E2,[1.4,-.15,0]),T:[KX,1.05,0],fov:9.5})],
  [CUE(1,'He waits')-.2,.9,()=>({P:add3(E2,[.6,0,0]),T:[-4.5,1,0],fov:19})],
  [CUE(1,'guesses')-.2,.7,()=>({P:add3(E2,[2.2,-.25,.2]),T:[-.4,.9,.8],fov:12})],
  [CUE(1,'keeps it out')-.3,.6,()=>({P:add3(E2,[2.4,-.3,.2]),T:add3(kC.H,[0,.1,0]),fov:9})],
  [CUE(1,'Bayern are')-.3,1.3,()=>{const g=kahnXZ(2,tau2(t),true);return{P:add3(E2,[2,.4,1.6]),T:add3(g,[0,1.1,0]),fov:17};}],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),kC=KICKS[2];
  const ks=CUE(1,'Kahn stands'),hw=CUE(1,'He waits'),gc=CUE(1,'guesses'),ko=CUE(1,'keeps it out'),ba=CUE(1,'Bayern are'),ce=CUE(1,'champions'),E=SECS(1);
  stadium(s,c,t,[0,1,2],{roar:sm(ba-.2,ba+.3,t),flash:sm(ba,ba+.3,t)});
  ground(s,c);
  // "stands tall and still": a steady yellow ring round his feet
  const kp:V3=[KX,0,0],still=sm(ks-.1,ks+.5,t)*(1-sm(gc-.3,gc,t));
  if(still>.02)groundRing(s,c,kp,.85,0,Math.max(6,kAt(c,kp)*.06),Y,still,tt);
  // "guesses correctly": a yellow arrow on the grass along his dive
  const da=sm(gc-.1,gc+.4,t,easeOut)*(1-sm(ba-.4,ba,t));
  if(da>.02){const a:V3=[KX-.2,.03,.2],b:V3=[KX-.35,.03,.2+1.9*da];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(7,kAt(c,a)*.07),Y,.95);}
  // the replay trail: the shot and the parry so far (under the players)
  if(tau>.02&&tau<kC.tSave+1.2){const pts=pathPts(c,2,Math.max(0,tau-.7),tau,20),fade=1-sm(kC.tSave+.5,kC.tSave+1.2,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(2,tau))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{i:2,it:tt,win:sm(ba-.3,ba+1.2,t),cel:true,smear:true,minBall:12});
  // "He waits": a dashed sight line from his eyes to the ball on the spot, held until the kick
  const sl=sm(hw-.1,hw+.5,t,easeOutBack)*(1-sm(gc-.2,gc+.1,t));
  if(sl>.02){const kn=kahnAt(2,tp,tt),sk=solve(kn.pose,KAHN_B,kn.place),a=pr(c,sk.face),b=pr(c,B0);if(a&&b)sightLine(s,a,b,Math.max(8,kAt(c,kp)*.04),clamp(sl));}
  // "keeps it out": a spark where the ball meets the gloves
  const age=tau-kC.tSave,hq=pr(c,kC.H);if(hq&&age>-.02&&age<.35){const r=kAt(c,kC.H);sparkBurst(s,Y,hq[0],hq[1],r*.55,{n:10,seed:83,g:easeOutBack(clamp((age+.02)/.06))*(1-clamp((age-.2)/.15)),width:Math.max(6,r*.045)});}
  // "champions of Europe": red and white paper rain
  const cw=sm(ce-.2,ce+.4,t);if(cw>0){const v=view(s),fall=(t-ce)*260;confetti(s,[R,'paper',Y],[-v.hx,-v.hy-400+fall,2*v.hx,2*v.hy],Math.round(90*cw),71,{size:44,cov:.95});}
  streaks(s,1-sm(0,.5,t),21);void E;
 },
 aperture(t){const c=cam2(t),g=kahnXZ(2,tau2(t),true),q=pr(c,add3(g,[0,1,0]))??[0,0];return apertureDisc(q[0],q[1],Math.max(14,kAt(c,g)*.35),12);},
 still:7.4,
};

// ---------------------------------------------------------------- 3 · the lesson: a goal goes in → stay strong and confident → forget it → one penalty at a time
/** a goal in the lesson: low into the corner to his right, past him (illustrative, not one of the real kicks) */
const GHOST_T=.55,GHOST_END:V3=[.9,.35,-2.9];
const ghostAt=(u:number):V3=>{const v=clamp(u/GHOST_T);if(v<1){const p=mix3(B0,[0,.3,-2.75],v);p[1]+=.3*v*(1-v);return p;}const w=clamp((u-GHOST_T)/.2);return mix3([0,.3,-2.75],GHOST_END,easeOut(w));};
function lessonKahn(t:number):{pose:Pose;place:Place}{
 const pg=CUE(2,'penalty goes'),ss=CUE(2,'stay strong'),fl=CUE(2,'Forget'),fo=CUE(2,'face one');
 let p=keeperSet(t*1.3);
 // the goal goes past him: a lunge the wrong way, then the droop
 const lg=bump(pg+.1,pg+1,t);if(lg>0)p=blendPose(p,keeperDive(clamp((t-pg-.1)/1.6)*.5,{side:'l',height:.3}),lg);
 p=blendPose(p,DROOP,sm(pg+.8,pg+1.3,t)*(1-sm(ss-.2,ss+.2,t)));
 p=blendPose(p,BIG,sm(ss-.2,ss+.35,t,easeOutBack)*(1-sm(fl+.3,fo,t)));
 return{pose:p,place:KPLACE};}
function cam4(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-6.4,1.7,4.6],T:[-.3,1.05,-.4],fov:36})],
  [CUE(2,'penalty goes')-.3,.8,()=>({P:[-6.6,1.9,4.9],T:[-.6,.95,-1],fov:42})],
  [CUE(2,'stay strong')-.2,1,()=>({P:[-5.6,1.6,3.9],T:[-.2,1.15,-.1],fov:30})],
  [CUE(2,'face one')-.25,1.3,()=>({P:[-17,2.3,4.6],T:[-6.5,.75,-.3],fov:30})],
  [CUE(2,'at a time')-.2,1.4,()=>({P:[-16.6,2.2,4.3],T:[-6,.8,-.3],fov:28})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam4(t),tt=twos(t);
  const pg=CUE(2,'penalty goes'),ss=CUE(2,'stay strong'),cf=CUE(2,'confident'),fl=CUE(2,'Forget'),fo=CUE(2,'face one'),at=CUE(2,'at a time'),E=SECS(2);
  const gu=t-pg,forget=sm(fl-.1,fl+.6,t);
  BZ=-2.4;stadium(s,c,t,[0,1,3],{roar:.4*bump(pg+.3,pg+1.6,t),flash:.5*bump(pg+.4,pg+1.2,t)});
  ground(s,c,{bulge:gu>GHOST_T?.8*Math.exp(-(gu-GHOST_T)*2.6):0});
  const kp:V3=[KX,0,0],w=Math.max(7,kAt(c,kp)*.065);
  // doubt: a jagged red ring once the goal goes in → strength: it smooths into a steady yellow ring
  const doubt=sm(pg+.5,pg+1,t)*(1-sm(ss-.1,ss+.4,t)),conf=sm(ss-.1,ss+.4,t)*(1-sm(fl+.2,fl+.8,t));
  if(doubt>.02)groundRing(s,c,kp,1.1+.1*Math.sin(t*9),1,w,R,doubt,tt);
  if(conf>.02)groundRing(s,c,kp,1.05,0,w,Y,conf,tt);
  // the goal: a red trail into the corner, wiped off the sheet on "Forget the last kick"
  const gone=1-forget;
  if(gu>0&&gone>.02){const pts:Pt[]=[];for(let j=0;j<=20;j++){const p=pr(c,ghostAt(Math.min(gu,GHOST_T)*j/20));if(p)pts.push(p);}
   if(pts.length>2){const ww=Math.max(8,kAt(c,[-2,.4,-2])*.13);s.knockout(ribbon(pts,ww*1.5,{taper:.8,pressure:.2,wobble:0}),.5*gone);s.fill(R,ribbon(pts,ww,{taper:.8,pressure:.2,wobble:0}),.9*gone);}}
  // the new penalty: one ball on the spot, ringed in yellow
  const one=sm(fo-.2,fo+.3,t,easeOutBack);
  if(one>.02)groundRing(s,c,B0,.55+.06*Math.sin(t*4),0,Math.max(6,kAt(c,B0)*.06),Y,clamp(one),tt);
  const kn=lessonKahn(tt),kprev=lessonKahn(tt-1/12),d=toCam(c,[KX,.9,0])[2];
  const items:{d:number;draw:()=>void}[]=[{d,draw:()=>{drawPlayer(s,kn.pose,c,KAHN_ST,kn.place,kprev,true);}}];
  if(gu>0&&gone>.02){const P=ghostAt(gu);items.push({d:toCam(c,P)[2],draw:()=>{const r=drawBallAt(s,c,P,-gu*TAU*4,{min:12});if(r&&forget>0)s.knockout(polyPath([[r.g[0]-r.r*1.3,r.g[1]-r.r*1.3],[r.g[0]+r.r*1.3,r.g[1]-r.r*1.3],[r.g[0]+r.r*1.3,r.g[1]+r.r*1.3],[r.g[0]-r.r*1.3,r.g[1]+r.r*1.3]],true),forget);}});}
  if(one>.02){items.push({d:toCam(c,B0)[2],draw:()=>{const q=pr(c,B0);if(!q)return;const r=Math.max(12,kAt(c,B0)*.11)*clamp(one,0,1.2);drawBallAt(s,c,B0,.3,{min:r});}});}
  items.sort((a,b)=>b.d-a.d).forEach(q=>q.draw());
  // "stay strong": a yellow burst as he stands big; "confident": it flashes again
  const sk=solve(kn.pose,KAHN_B,kn.place),ch=pr(c,sk.chest);
  for(const[t0,sd] of [[ss,75],[cf,76]] as [number,number][]){const age=t-t0;if(ch&&age>-.1&&age<.7){const u=kAt(c,sk.chest);sparkBurst(s,Y,ch[0],ch[1],u*1.5,{n:12,seed:sd,g:easeOutBack(clamp((age+.1)/.25))*(1-clamp((age-.45)/.25)),width:u*.06});}}
  // "face one penalty": one dashed sight line from his eyes to the ball
  const sl=sm(fo+.1,fo+.7,t,easeOutBack)*(1-sm(E-.8,E-.3,t));
  if(sl>.02){const a=pr(c,sk.face),b=pr(c,add3(B0,[0,.12,0]));if(a&&b)sightLine(s,a,b,Math.max(7,kAt(c,[-5,1,0])*.045),clamp(sl));}
  // "at a time": a small yellow pop on the ball
  const ag=t-at;if(ag>-.1&&ag<.6){const q=pr(c,B0);if(q){const r=kAt(c,B0);sparkBurst(s,Y,q[0],q[1],r*.5,{n:9,seed:88,g:easeOutBack(clamp((ag+.1)/.2))*(1-clamp((ag-.35)/.25)),width:Math.max(5,r*.05)});}}
  BZ=0;
 },
 still:9,
};

const film:RisoStory={
 id:'kahn-shootout-2001',format:'11v11',title:"Kahn's three shoot-out saves",
 theme:'Keepers: stay strong and confident, and face one penalty at a time',
 ageNote:'Bayern Munich 1–1 Valencia (Bayern won 5–4 on penalties), Champions League final, San Siro, Milan, 23 May 2001. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a glove-spark and a ball pushed away where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=easeOut(clamp(age/.6)),r=rng(seed),dir=r()<.5?-1:1;
  if(age<.35)sparkBurst(s,Y,x,y,100,{n:9,seed,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.2)/.15)),width:14});
  if(age<1)footballPanels(s,x+dir*180*u,y-120*u+160*u*u,30,{rot:age*8*dir,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contacts (pitch metres; the goal line x = 0, Z across, −Z = Kahn's right) — checked by the film test. */
export const FACTS={B0,KX,KICKS:KICKS.map(k=>({name:k.name,foot:k.foot,side:k.side,kind:k.kind,hand:k.hand,H:k.H,tSave:k.tSave,tDive:k.tDive,number:k.st.number})),
 ballAt,kahnAt:(i:number,tau:number)=>{const s=kahnAt(i,tau,0);return solve(s.pose,KAHN_B,s.place);},
 toeAt:(i:number,tau:number)=>{const k=KICKS[i],sk=solve(takerPose(i,tau,0),k.st.build,takerPlace(i,tau));return k.foot==='r'?sk.rToe:sk.lToe;},
 sched,chapterSeconds:SECS};
