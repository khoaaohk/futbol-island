/** Fabián Ruiz — signature: keep it, then break the lines. Spain 3–0 Croatia, UEFA Euro 2024 Group B, Olympiastadion, Berlin, Saturday
 * 15 June 2024 (18:00 local, a summer evening in daylight): Spain's FIRST goal, Álvaro Morata, 29th minute, set up by Fabián Ruiz's
 * first-time pass. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx)
 * or StoryFilmPlayer: a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "keep it, then break the lines", template through_ball_assist,
 * lesson "Keep the ball moving with short passes until a gap opens for a forward pass"): the move is exactly that lesson, and written
 * sources describe every pass of it. "A single loose ball was enough. Marc Cucurella dashed to it, Rodri dropped it off and, first time,
 * Ruiz set Morata away" (Guardian report); "Spotting a gap between Croatia's centre-halves, Fabian Ruiz drilled a low ball towards it"
 * (Guardian live blog). Two short passes (Cucurella → Rodri → Fabián), then the forward pass through the gap. The pedri-signature film
 * already shows Fabián's OWN goal three minutes later (32'/33'); this film shows the other, earlier goal, so the two never repeat a moment.
 *
 * SOURCES (fetched Sept 2026 with a generic UA, cached under the session scratchpad films/src-cache/):
 *  - The Guardian, Sid Lowe, match report, 15 June 2024: "the goal coming immediately after Ante Budimir had headed wide. A single loose
 *    ball was enough. Marc Cucurella dashed to it, Rodri dropped it off and, first time, Ruiz set Morata away. One on one with Dominik
 *    Livakovic, he finished neatly."; "Rodri and Fabián Ruiz impressing in the middle"
 *    https://www.theguardian.com/football/article/2024/jun/15/spain-croatia-euro-2024-match-report   (cache: guardian-esp-cro-2024-report.txt)
 *  - The Guardian, Barry Glendenning, live blog, 15 June 2024, 29': "Alvaro Morata is played through on goal between Croatia's two
 *    centre-backs and finds himself in a one-on-one with Livakovic ... he takes his time and calmly rolls the ball past the onrushing Croatia
 *    goalkeeper"; 31': "Spotting a gap between Croatia's centre-halves, Fabian Ruiz drilled a low ball towards it, Morata knew what was
 *    afoot and made no mistake"; 40': "Fabian Ruiz has scored one and made another"; photo captions: Morata "wheels away in celebration"
 *    and "shows a bit of love to the Spain fans"   (cache: guardian-esp-cro-2024-live.txt)
 *  - Wikipedia, "UEFA Euro 2024 Group B" (raw): 15 June 2024, 18:00, Olympiastadion Berlin, attendance 68,844; Morata 29'; line-ups and
 *    numbers (Morata 7 captain, Fabián 8, Rodri 16, Cucurella 24; Croatia Šutalo 6, Pongračić 3 at centre-back, Livaković 1); kit templates
 *    (cache: wiki-euro2024-group-b.txt)
 *  - Wikipedia, "Fabián Ruiz" (raw): "A left-footed central midfielder ... known for his vision, passing, ball control"; height 1.89 m
 *    (cache: wiki-fabian-ruiz.txt)
 * CONFIRMED by those accounts: the match, date, ground, kick-off, 29th minute, 1–0; it came just after Budimir headed wide; a loose ball;
 * Cucurella dashing to it; Rodri laying it off; Fabián passing FIRST TIME, a LOW ball into the gap between Croatia's two centre-backs;
 * Morata through one-on-one with Livaković, taking his time and rolling it past the onrushing keeper; Morata wheeling away to the Spain fans.
 * Fabián is left-footed (so the pass is drawn with his left foot, unnarrated).
 * KIT (same match as pedri-signature, from the Wikipedia kit templates): Spain red shirts, blue (drawn navy) shorts, red socks; Croatia
 * red-and-white checked shirts, white shorts, white socks.
 * INFERRED (illustrative, and kept OUT of the narration): every exact position, speed and timing; where on the pitch the loose ball fell
 * (drawn near halfway, left of centre, bouncing) and who it came off; Cucurella's and Rodri's feet and touches; the pass lengths; which
 * centre-back stood on which side (Šutalo on Spain's left, Pongračić on the right); Morata's touches and his RIGHT-footed finish, the side
 * of the net (drawn: the keeper's right, low); Livaković's blue keeper kit and his late spread; Spain's yellow numbers; the direction of
 * play on screen (Spain attacking left to right, as in pedri-signature); the Olympiastadion's drawn shape; the crowd colours.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time, panning with the ball from the loose ball to
 * the net; ch2 = the slow-motion replay from a raised camera BEHIND Fabián: short passes (blue lanes), then the gap between the two
 * centre-backs lights up (red rings on them, a yellow gate between); ch3 = a second replay angle from BEHIND CROATIA'S GOAL: the low pass
 * through the gap, Morata runs on, rolls it past the keeper; ch4 = the lesson from just behind Fabián: short passes, wait for the gap, pass
 * forward through it. All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer().
 * Full-sheet card-window framing (1.45:1 to square), never sheet.safe. Scenes read only (t, c); every action keys off cue times, so the
 * recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); every cue starts
 * with a plain word (Kokoro splits contractions and hyphens). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Spain against Croatia, Euro 2024. A loose ball! Cucurella wins it and passes to Rodri. Rodri lays it off to Fabián Ruiz, and first time, Fabián sends Morata through, one against one... goal!',seconds:14.2,
  cues:[[.2,'Spain against Croatia'],[1.4,'Euro 2024'],[2.6,'loose ball'],[3.4,'Cucurella wins'],[4.6,'passes to Rodri'],[5.9,'Rodri lays'],[7,'Fabián Ruiz'],[7.9,'first time'],[9,'sends Morata'],[10.3,'one against one'],[12,'goal']]},
 {label:'Watch it again',text:'Watch again, slowly. Short, simple passes keep the ball moving. Then Fabián spots a gap between two defenders.',seconds:8.6,
  cues:[[.15,'Watch again'],[.9,'slowly'],[2,'simple passes'],[3,'keep the ball moving'],[4.6,'Then Fabián spots'],[5.6,'gap between'],[6.4,'two defenders']]},
 {label:'Through the gap',text:'His low pass zips through the gap. Morata runs onto it, and calmly rolls it past the keeper.',seconds:8.2,
  cues:[[.15,'His low pass'],[1,'zips through'],[2.6,'Morata runs'],[4,'calmly rolls'],[5.3,'past the keeper']]},
 {label:'Your turn',text:'Your turn: keep the ball moving with short passes until a gap opens, then pass forward through it.',seconds:8.4,
  cues:[[.15,'Your turn'],[1,'keep the ball moving'],[2.3,'short passes'],[3.3,'until a gap opens'],[4.9,'then pass forward'],[5.9,'through it']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py fabian-ruiz-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/fabian-ruiz-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-fabian-ruiz-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/fabian-ruiz-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('fabian: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys forced monotone in time (a recorded voice can squeeze cue gaps) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}


// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre at z0 units per world unit (the engine's
 * arrival scale is kept, so passages and seams behave as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Spain's goal at 0, Spain attack +X, Croatia's goal line at 105),
 * Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z,
 * so Spain's right flank (Yamal) is the near side. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (cameras inside the bowl cull the near stand) */
function quadP(c:Cam,q:V3[],minDepth=16):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};

// ---------------------------------------------------------------- the Olympiastadion, Berlin: a sunken oval bowl, the blue track, the roof ring
/** The running track is a stadium oval round the pitch: straights at Z = ±R, bends centred on X = 14 and 91. oval(u, r): a point at
 * perimeter parameter u ∈ [0,1) with its outward normal. u runs: far straight (0 → 105), the east bend (behind Croatia's goal), the near
 * straight, the west bend (the Marathon Gate end, where the roof ring is open). */
const OV={c0:14,c1:91,R:40,W:8.5};
function oval(u:number,r:number):{p:Pt;n:Pt}{
 const L=OV.c1-OV.c0,P=2*L+TAU*r,d=((u%1)+1)%1*P;
 if(d<L)return{p:[OV.c0+d,-r],n:[0,-1]};
 if(d<L+Math.PI*r){const a=-Math.PI/2+(d-L)/r;return{p:[OV.c1+Math.cos(a)*r,Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
 if(d<2*L+Math.PI*r){const e=d-L-Math.PI*r;return{p:[OV.c1-e,r],n:[0,1]};}
 const a=Math.PI/2+(d-2*L-Math.PI*r)/r;return{p:[OV.c0+Math.cos(a)*r,Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
const R0=OV.R+OV.W,NS=64;
const onBowl=(u:number,d:number,y:number):V3=>{const o=oval(u,R0);return[o.p[0]+o.n[0]*d,y,o.p[1]+o.n[1]*d];};
/** the Marathon Gate: the gap in the upper ring and the roof at the west end (u ≈ .9) */
const GATE=(u:number)=>{const L=OV.c1-OV.c0,P=2*L+TAU*R0,m=(2*L+1.5*Math.PI*R0)/P;return Math.abs(u-m)<.022;};
type Bowl={low:V3[][];up:V3[][];rim:V3[][];roof:V3[][];track:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],rim:[],roof:[],track:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS,b=(i+1)/NS,mid=(a+b)/2,gate=GATE(mid);
  const Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[onBowl(a,d0,y0),onBowl(b,d0,y0),onBowl(b,d1,y1),onBowl(a,d1,y1)];
  o.low.push(Q(0,1,22,11.5));
  if(!gate){o.up.push(Q(24,13.5,42,27));o.rim.push(Q(22,11.5,24,13.5));o.roof.push(Q(16,33.5,52,31));}
  const ti=oval(a,OV.R),tj=oval(b,OV.R),to=oval(a,R0),tp=oval(b,R0);o.track.push([[ti.p[0],0,ti.p[1]],[tj.p[0],0,tj.p[1]],[tp.p[0],0,tp.p[1]],[to.p[0],0,to.p[1]]]);
  for(const [d0,y0,d1,y1,rows,off] of [[0,1,22,11.5,8,0],[24,13.5,42,27,7,5000]] as number[][]){if(gate&&off)continue;for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+off,11);if(h<.14)continue;
   const u=(r+.5)/rows;o.seats.push({P:onBowl((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS,lerp(d0,d1,u),lerp(y0,y1,u)+.4),h});}}}
 return o;})();
/** everything behind the pitch: the evening sky, the bowl, the crowd (Spain red and yellow, Croatia's red-and-white checks; roar lifts the
 * marks, flash = phones and cameras), the pale roof ring on its dark steel edge */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 s.field(B,.16,.5);s.field(Y,.1,.5);
 const low=new Path2D(),up=new Path2D(),rim=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const q of BOWL.low){const p=quadP(c,q);if(p)addPoly(low,p);}
 for(const q of BOWL.up){const p=quadP(c,q);if(p)addPoly(up,p);}
 for(const q of BOWL.rim){const p=quadP(c,q);if(p)addPoly(rim,p);}
 for(const q of BOWL.roof){const p=quadP(c,q,10);if(p){addPoly(roof,p);seg3(c,q[0],q[1],.9,edge);}}
 s.knockout(low);s.tone(K,low,.34);s.tone(B,low,.3);
 s.knockout(up);s.tone(K,up,.4);s.tone(B,up,.24);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.h<.5?0:q.h<.66?1:q.h<.92?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.fill(R,inks[0],.85);s.fill(Y,inks[1],.9);s.knockout(inks[2],.75);s.fill(B,inks[3],.7);
 s.knockout(rim);s.fill(K,rim,.8);
 // the roof ring: a pale membrane (paper with a light blue screen) on a dark steel edge
 s.knockout(roof);s.tone(B,roof,.22);s.fill(K,edge,.85);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the blue running track, the grass (yellow × blue) with mowing stripes, the boards, paper lines, corner flags and both goals (Croatia's
 * goal drawn later when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const tr=new Path2D();for(const q of BOWL.track)addPoly(tr,polyP(c,q));s.knockout(tr);s.fill(B,tr,.8);s.tone(K,tr,.12);
 const inner:V3[]=[];for(let i=0;i<48;i++){const q=oval(i/48,OV.R);inner.push([q.p[0],0,q.p[1]]);}
 const gi=polyP(c,inner);if(gi.length>2){const p=polyPath(gi,true);s.knockout(p);s.fill(Y,p,.9);s.tone(B,p,.84);s.tone(K,p,.08);}
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.12);
 // boards: along the far touchline and behind both goals (navy LED boards with paper panels, generic)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[109.5,0,-30],[109.5,0,30],[109.5,.9,30],[109.5,.9,-30]]),polyP(c,[[-4.5,0,30],[-4.5,0,-30],[-4.5,.9,-30],[-4.5,.9,30]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]));}
 for(let k=0;k<9;k++){const z=-28+k*6.4;addPoly(pn,polyP(c,[[109.45,.25,z],[109.45,.25,z+3.4],[109.45,.65,z+3.4],[109.45,.65,z]]));addPoly(pn,polyP(c,[[-4.45,.25,z],[-4.45,.25,z+3.4],[-4.45,.65,z+3.4],[-4.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(R,pn,.45);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const[x,z] of [[0,-34],[0,34],[105,-34],[105,34]] as Pt[]){seg3(c,[x,0,z],[x,1.55,z],.05,pole);addPoly(flag,polyP(c,[[x,1.55,z],[x,1.2,z],[x+(x?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Spain: red shirts, blue shorts (printed navy), red socks (confirmed); yellow numbers and trim inferred */
const ESP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:[K,.9],socks:R,boots:K,trim:Y,skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:Y,seed:3,...o});
/** Croatia: red-and-white checked shirts (the checks are printed over the torso by checks(); far figures get a red screen), white shorts
 * and white socks (confirmed); red trim inferred */
const CRO=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:R,skin:SKIN_L,hair:K,hairStyle:'short',line:K,seed:5,...o,number:null});
/** Livaković: a blue keeper's kit (inferred) */
const LIVAKOVIC:AthleteStyle={shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:'paper',build:{height:1.88},seed:41};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs.
 * Croatia's checks are printed over the torso after the body. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;checks?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.checks)checks(s,r);
 return r;
}
/** the Croatian checkerboard: red squares over the shirt, laid on a grid aligned with the spine (shoulders → hips) and the shoulder line */
function checks(s:Sheet,r:DrawResult){
 const j=r.joints,top:Pt=[(j.lSh[0]+j.rSh[0])/2,(j.lSh[1]+j.rSh[1])/2],bot:Pt=[(j.lHip[0]+j.rHip[0])/2,(j.lHip[1]+j.rHip[1])/2];
 const ax=bot[0]-top[0],ay=bot[1]-top[1],L=Math.hypot(ax,ay);if(L<3)return;const ux=ax/L,uy=ay/L,nx=-uy,ny=ux;
 const sw=Math.abs((j.rSh[0]-j.lSh[0])*nx+(j.rSh[1]-j.lSh[1])*ny),hw=Math.max(sw*.62,L*.3),t0=-L*.04,t1=L*1.08,cols=4,rows=5;
 const P=(i:number,k:number):Pt=>{const a=t0+(t1-t0)*k/rows,w=-hw+2*hw*i/cols,taper=1-.08*k/rows;return[top[0]+ux*a+nx*w*taper,top[1]+uy*a+ny*w*taper];};
 const p=new Path2D();for(let k=0;k<rows;k++)for(let i=0;i<cols;i++)if((i+k)%2===0)p.addPath(polyPath([P(i,k),P(i+1,k),P(i+1,k+1),P(i,k+1)],true));
 s.fill(R,p,.92);
}

/** Fabián Ruiz, number 8: tall (1.89 m), dark hair (and beard, which the athlete does not draw) */
const FABIAN_STYLE=ESP({number:8,skin:SKIN_L,hair:[K,.95],build:{height:1.89,bulk:.98},seed:8});
/** Morata, number 7 (captain that day): 1.90 m, dark short hair */
const MORATA_STYLE=ESP({number:7,skin:SKIN_L,hair:[K,.9],build:{height:1.9},seed:7});

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Fabián's first-time pass)
type Role='hero'|'esp'|'cro'|'gk';
type Move={kind:'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The beats the accounts give (a loose ball, Cucurella dashing to it, Rodri
 * laying it off, Fabián first time into the gap between the centre-backs, Morata one on one, rolled past the onrushing keeper) are kept;
 * every exact spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Fabián',role:'hero',style:FABIAN_STYLE,key:true,keys:[[-6,48.6,-14],[-3,50,-12.3],[-1.5,50.8,-10.9],[-.85,51.1,-10.4],[-.2,51.45,-10],[0,51.6,-9.9],[.6,52.4,-9.5],[2,55.5,-8],[4.4,61,-6],[6,64,-5]]},
 {name:'Morata',role:'esp',style:MORATA_STYLE,key:true,keys:[[-6,66.6,-6.4],[-3,67.6,-5.2],[-1.5,68.1,-3.9],[-.5,68.6,-3.2],[0,69.2,-2.8],[.6,71.8,-1.8],[1.2,75.6,-.5],[1.65,78.6,.3],[2.35,83.2,.9],[2.95,87.4,1.2],[3.3,89.6,1.3],[3.8,92.2,1.3],[4.6,95.5,2.8],[5.4,98,6.5],[6,99.5,9.5]]},
 {name:'Cucurella',role:'esp',style:ESP({number:24,hairStyle:'curly',hair:[K,.9],seed:24}),key:true,keys:[[-6,37.4,-21.2],[-4.6,39,-19.8],[-3.7,42,-16.4],[-3.05,43.7,-14.7],[-2.4,44.6,-14.1],[-1.5,46.4,-14.6],[0,50,-16.4],[2,55,-18],[6,63,-20]]},
 {name:'Rodri',role:'esp',style:ESP({number:16,skin:SKIN_L,build:{height:1.91},seed:16}),key:true,keys:[[-6,47.2,-2.8],[-3,46.9,-4.4],[-2,46.7,-5.5],[-1.5,46.75,-5.9],[-.85,47,-6.1],[0,48.3,-5.8],[2,52,-4],[6,59,-2]]},
 {name:'Pedri',role:'esp',style:ESP({number:20,skin:SKIN_L,hair:[K,.95],build:{height:1.74,bulk:.88},seed:20}),keys:[[-6,57,10],[0,62,8],[3,70,7],[6,76,8]]},
 {name:'Yamal',role:'esp',style:ESP({number:19,skin:SKIN_D,hair:[K,.92],build:{height:1.8,bulk:.86},seed:19}),keys:[[-6,66,27],[0,70,24],[3,79,18],[6,86,14]]},
 {name:'Williams',role:'esp',style:ESP({number:17,skin:SKIN_D,seed:17}),keys:[[-6,69,-27],[0,72,-24],[3,81,-17],[6,88,-12]]},
 {name:'Carvajal',role:'esp',style:ESP({number:2,skin:SKIN_L,seed:2}),keys:[[-6,47,27],[6,60,26]]},
 {name:'Le Normand',role:'esp',style:ESP({number:3,seed:33}),keys:[[-6,35,6],[6,46,5]]},
 {name:'Nacho',role:'esp',style:ESP({number:4,seed:34}),keys:[[-6,35,-7],[6,46,-8]]},
 {name:'Šutalo',role:'cro',style:CRO({build:{height:1.9},seed:56}),key:true,keys:[[-6,72.6,-7.2],[-2,71.5,-6.5],[0,70.6,-6],[.45,70.4,-5.6],[1.4,73.2,-3.9],[2.4,78.6,-2.3],[3.4,84.6,-1.2],[4.6,90.5,-.4],[6,94,0]]},
 {name:'Pongračić',role:'cro',style:CRO({build:{height:1.93},seed:53}),key:true,keys:[[-6,72.6,5.2],[-2,71.5,4.5],[0,70.9,3.8],[.55,70.8,3.3],[1.5,73,2.9],[2.5,78.2,2.9],[3.5,84,3.1],[4.6,90,3.4],[6,93.5,4]]},
 {name:'Stanišić',role:'cro',style:CRO({seed:52}),keys:[[-6,67,-20.5],[0,69,-18],[3,78,-12],[6,86,-8]]},
 {name:'Gvardiol',role:'cro',style:CRO({build:{height:1.85},seed:54}),keys:[[-6,66,19.5],[0,68,17],[3,77,11],[6,85,8]]},
 {name:'Kovačić',role:'cro',style:CRO({seed:58}),keys:[[-6,50.6,-3.5],[-2,49.6,-6.4],[-.5,50.2,-7.4],[0,50.6,-7.6],[2,52.5,-7],[6,58,-5]]},
 {name:'Modrić',role:'cro',style:CRO({hair:[Y,.75],hairStyle:'long',build:{height:1.72,bulk:.88},seed:60}),keys:[[-6,53,4.5],[0,55.5,1.5],[3,60,1],[6,66,1]]},
 {name:'Brozović',role:'cro',style:CRO({seed:61}),keys:[[-6,60,-.5],[0,60.5,3.2],[3,65,3],[6,72,2]]},
 {name:'Kramarić',role:'cro',style:CRO({seed:59}),key:true,keys:[[-6,46.4,-21],[-3.6,45.2,-18],[-3,45,-16.6],[-2,45.8,-15.9],[0,47.5,-15.5],[6,52,-14]]},
 {name:'Majer',role:'cro',style:CRO({seed:57}),keys:[[-6,55,14],[6,62,10]]},
 {name:'Budimir',role:'cro',style:CRO({seed:66,build:{height:1.9}}),keys:[[-6,31,3],[6,44,2]]},
 {name:'Livaković',role:'gk',style:LIVAKOVIC,key:true,moves:[{kind:'dive',at:3.62,dur:.9,side:'r'}],keys:[[-6,101.5,-.4],[0,100.6,-.2],[1.65,99.6,.6],[2.4,98,1.2],[3,96.4,1.7],[3.35,95.7,1.8],[3.6,95.5,1.8],[6,95.5,1.8]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const FAB=IX('Fabián'),MOR=IX('Morata'),CUC=IX('Cucurella'),ROD=IX('Rodri'),SUT=IX('Šutalo'),PON=IX('Pongračić'),LIV=IX('Livaković');

/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6,T1=7,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(k,tau),y=headingOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}

// ---------------------------------------------------------------- the ball: loose, Cucurella, Rodri, FABIÁN FIRST TIME, Morata, the roll past the keeper
/** beats (τ): the loose ball drops and bounces · Cucurella's touch · his pass · Rodri's control · Rodri's lay-off · FABIÁN'S PASS ·
 * Morata's first touch, two more, the finish · in the net */
const DROP=-5.6,BOUNCE=-3.8,CTOUCH=-3.05,CPASS=-2.4,RREC=-1.55,RPASS=-.85,PASS=0,MREC=1.65,M2=2.35,M3=2.95,SHOT=3.3,IN_NET=4.45;
const G3=(p:Pt):V3=>[p[0],.11,p[1]];
const CT=footSpot(CUC,CTOUCH,'l',.45),CP=footSpot(CUC,CPASS,'l',.45);
const RR=footSpot(ROD,RREC,'r',.45),RP=footSpot(ROD,RPASS,'r',.45);
const FP=footSpot(FAB,PASS,'l',.45);
/** Morata's touches, all with his right foot */
const MT=[MREC,M2,M3,SHOT],MP=MT.map(t=>footSpot(MOR,t,'r',.5));
const LOOSE:V3=[37,9.5,-7],BNC:Pt=[42.5,-12.4];
/** the finish: low, rolled, the keeper's right (inferred) */
const NET:V3=[105.35,.16,-3.1],REST:V3=[106.3,.11,-3.3];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
function ballAt(tau:number):V3{
 if(tau<BOUNCE){const u=clamp((tau-DROP)/(BOUNCE-DROP)),b=lerp3(LOOSE,G3(BNC),u);return[b[0],.11+(LOOSE[1]-.11)*(1-u*u),b[2]];}
 if(tau<CTOUCH){const u=(tau-BOUNCE)/(CTOUCH-BOUNCE),b=lerp3(G3(BNC),G3(CT),u);return[b[0],.11+1.3*Math.sin(Math.PI*u),b[2]];}
 if(tau<CPASS){const u=(tau-CTOUCH)/(CPASS-CTOUCH),e=1-(1-u)*(1-u);return lerp3(G3(CT),G3(CP),e);}
 if(tau<RREC)return roll(G3(CP),G3(RR),(tau-CPASS)/(RREC-CPASS),.3);
 if(tau<RPASS){const u=(tau-RREC)/(RPASS-RREC),e=1-(1-u)*(1-u);return lerp3(G3(RR),G3(RP),e);}
 if(tau<PASS)return roll(G3(RP),G3(FP),(tau-RPASS)/(PASS-RPASS),.3);
 if(tau<MREC)return roll(G3(FP),G3(MP[0]),(tau-PASS)/(MREC-PASS),.45);
 if(tau<SHOT){let k=0;while(k+1<MT.length&&tau>=MT[k+1])k++;const u=(tau-MT[k])/(MT[k+1]-MT[k]),e=1-(1-u)*(1-u);return lerp3(G3(MP[k]),G3(MP[k+1]),e);}
 if(tau<IN_NET)return roll(G3(MP[3]),NET,(tau-SHOT)/(IN_NET-SHOT),.2);
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return lerp3(NET,REST,e);
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:.6*Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** Fabián's look up the pitch before the ball arrives (head up, chin level: he sees the gap) */
const LOOKUP:Partial<Pose>={neckP:-14,lean:6};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** a quick touch of the given foot (a small swing through the ball) */
const touch=(foot:'l'|'r'):Partial<Pose>=>foot==='l'?{lHipF:34,lKnee:26,lAnk:34,lHipR:10}:{rHipF:34,rKnee:26,rAnk:34,rHipR:10};
/** a strike blended in around τc, turning the body toward (tx, tz) */
function kick(p:Pose,yaw:number,tau:number,tc:number,foot:'l'|'r',power:number,x:number,z:number,tx:number,tz:number,D=.8):{p:Pose;yaw:number}{
 const u=(tau-(tc-STRIKE_CONTACT*D))/D;if(u<=0||u>=1.4)return{p,yaw};const w=inWin(u);
 return{p:blendPose(p,strike(Math.min(1,u),{foot,power}),w),yaw:lerpA(yaw,yawOf(tx-x,tz-z),.8*w)};}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='cro'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 // defenders square up to the ball while they are slow
 if(a.role==='cro'&&sp<4)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.7);
 for(const mv of a.moves??[]){const u=(tau-(mv.at-.55*mv.dur))/mv.dur;if(u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.05});}
 if(k===LIV&&tau>SHOT-.1)yaw=Math.PI;
 let r={p,yaw};
 if(k===CUC){r.p=over(r.p,touch('l'),bump(CTOUCH-.16,CTOUCH+.1,tau));r=kick(r.p,r.yaw,tau,CPASS,'l',.45,x,z,RR[0],RR[1],.75);}
 if(k===ROD){if(tau>CPASS-.3&&tau<RPASS)r.yaw=lerpA(r.yaw,yawOf(b[0]-x,b[2]-z),.7);r.p=over(r.p,touch('r'),bump(RREC-.16,RREC+.1,tau));r=kick(r.p,r.yaw,tau,RPASS,'r',.35,x,z,FP[0],FP[1],.7);}
 if(k===FAB){
  // facing Rodri as the lay-off comes; the head comes up to see the gap; then the first-time left-footed pass
  if(tau>RPASS-.4&&tau<PASS+.3)r.yaw=lerpA(r.yaw,yawOf(b[0]-x,b[2]-z),sm(RPASS-.4,RPASS,tau)*(1-sm(PASS-.25,PASS,tau)));
  r.p=over(r.p,LOOKUP,bump(-1.3,-.35,tau));
  r=kick(r.p,r.yaw,tau,PASS,'l',.75,x,z,MP[0][0],MP[0][1],.8);
  if(tau>IN_NET+.3)r.p=blendPose(r.p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.3,IN_NET+.8,tau));}
 if(k===MOR){
  for(let i=1;i<3;i++)r.p=over(r.p,touch('r'),bump(MT[i]-.16,MT[i]+.1,tau));
  r.p=over(r.p,touch('r'),bump(MREC-.18,MREC+.1,tau));
  r=kick(r.p,r.yaw,tau,SHOT,'r',.35,x,z,NET[0],NET[2],.75);
  if(tau>IN_NET+.2)r.p=blendPose(r.p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.2,IN_NET+.7,tau));}
 if(a.role==='esp'&&k!==MOR&&k!==FAB&&tau>IN_NET+.5)r.p=over(r.p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.5,IN_NET+1,tau));
 if(a.role==='cro'&&tau>IN_NET+.7)r.p=over(r.p,{lean:40,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.7,IN_NET+1.5,tau)*.8);
 return r;
}

// ---------------------------------------------------------------- the ball print: the 2024 Adidas Fussballliebe (paper, navy panel curves, colour flecks)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D(),fl=new Path2D();for(let i=0;i<4;i++){const a=rot+i/4*TAU,cx=x+Math.cos(a)*r*.5,cy=y+Math.sin(a)*r*.5;pan.addPath(ribbon([[cx-Math.sin(a)*r*.45,cy+Math.cos(a)*r*.45],[cx+Math.cos(a)*r*.12,cy+Math.sin(a)*r*.12],[cx+Math.sin(a)*r*.45,cy-Math.cos(a)*r*.45]],Math.max(1.5,r*.1),{seed:5+i,taper:.3,wobble:0}));
  const q=a+.6,w=r*.16;fl.addPath(polyPath([[x+Math.cos(q)*r*.55-w,y+Math.sin(q)*r*.55],[x+Math.cos(q)*r*.55,y+Math.sin(q)*r*.55-w*.6],[x+Math.cos(q)*r*.55+w,y+Math.sin(q)*r*.55]],true));}
 s.fill(K,pan,.9);s.fill(R,fl,.85);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=-1}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (evening sun: short and soft); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.05,e.g[1],e.h*.16,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],px=e.h*ppu,big=e.h>=300;
  // phone heat: during a passage (two scenes on one sheet) the tiny extras are left out
  if(passing&&!a.key&&px<60)continue;
  const{p,yaw}=poseOf(e.k,tauP);
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  // Croatia: the printed checks on card-size figures; a red screen on the white shirt when the figure is too small for squares
  const cro=a.role==='cro',chk=cro&&px>=46&&!passing;
  const st:AthleteStyle={...a.style,shadow:e.h<420?false:undefined,detail,...(cro&&!chk?{shirt:[R,.32] as InkFill}:{})};
  const r=drawPlayer(s,p,c,st,{x:e.x,z:e.z,yaw},big&&(e.k===hero||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:e.k===hero,checks:chk}:{checks:chk});
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / a fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a cross (✗) on the grass: "beaten" */
function crossOut(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number){if(w<=.02)return;const k=kAt(c,[x,0,z]),p=new Path2D(),L=rad*w;
 for(const[dx,dz] of [[1,1],[1,-1]] as Pt[]){const a=pr(c,[x-dx*L,0,z-dz*L]),b=pr(c,[x+dx*L,0,z+dz*L]);if(a&&b)p.addPath(ribbon([a,b],Math.max(5,k*.2),{seed:71+dx*3+dz,taper:.1,wobble:.8}));}
 s.knockout(p,.9);s.fill(R,p,.95);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(6,c.F*.16/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** a player's run from τa to τb as ground points */
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(ta,tb,i/n)));return o;};
/** the ball's ground path from τa to τb */
const ballPts=(ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const b=ballAt(lerp(ta,tb,i/n));o.push([b[0],b[2]]);}return o;};
/** "check over your shoulder": a dashed yellow sight line from his eyes to a point */
function sightLine(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number){if(!r||!to||w<=.02)return;const h=r.joints.head,u=Math.max(4,Math.hypot(h[0]-r.joints.neck[0],h[1]-r.joints.neck[1])*.35);
 const end:Pt=[lerp(h[0],to[0],w),lerp(h[1],to[1],w)];s.knockout(ribbon([h,end],u*1.8,{seed:91,taper:.2,wobble:.6}),.7);laneArrow(s,Y,h,end,u,{dashed:true,seed:92,head:u*3});}

/** "a gap": the open lane between the two centre-backs at τ, painted as a yellow gate on the grass (grows in with w) */
function gate(s:Sheet,c:Cam,tau:number,w:number,seed=81){if(w<=.02)return;const[ax,az]=posOf(SUT,tau),[bx,bz]=posOf(PON,tau),m=(az+bz)/2,h=Math.max(.5,(bz-az)/2-1.1)*(.35+.65*w);
 const q=polyP(c,[[ax-1.3,.02,m-h],[ax+1.3,.02,m-h],[bx+1.3,.02,m+h],[bx-1.3,.02,m+h]]);if(q.length<3)return;const p=polyPath(q,true);
 s.knockout(p,.75*w);s.fill(Y,p,.8*w);
 const ed=new Path2D();for(const z of [m-h,m+h]){const a=pr(c,[(ax+bx)/2-1.3,.02,z]),b=pr(c,[(ax+bx)/2+1.3,.02,z]);if(a&&b)ed.addPath(ribbon([a,b],Math.max(4,kAt(c,[ax,0,z])*.12),{seed:seed+(z>m?1:0),taper:.1,wobble:.6}));}
 s.fill(K,ed,.85*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the move plays at about real time) */
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'goal');return key(t,mono([[0,-5.5],[CUEW(0,'Euro 2024'),-4.95],[CUEW(0,'loose ball'),-3.95],[CUEW(0,'Cucurella wins'),-3.1],[CUEW(0,'passes to Rodri'),-2.45],[CUEW(0,'Rodri lays'),-.95],[CUEW(0,'Fabián Ruiz'),-.3],[CUEW(0,'first time'),PASS-.02],[CUEW(0,'sends Morata'),.9],[CUEW(0,'one against one'),2.5],[G,IN_NET-.05],[S+1,IN_NET-.05+(S+1-G)*.9]]),linear);};
const CAM1:V3=[62,27,80];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'goal'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const cel=posOf(MOR,tau),toC=sm(G+.4,G+1.5,t,easeInOutSine);
 // lead the play a little in the direction Spain attack (more once the pass is on)
 const lead=lerp(2,6,sm(PASS-.3,MREC,tau))*(1-sm(SHOT,IN_NET,tau));
 const T=lerp3([bt[0]+lead,0,bt[2]*.75],[cel[0]-1,1.2,cel[1]],toC);
 const F=key(t,[[0,6000],[CUEW(0,'loose ball'),7200],[CUEW(0,'passes to'),7400],[CUEW(0,'first time'),6300],[CUEW(0,'sends Morata'),6300],[CUEW(0,'one against'),7200],[G,7600],[G+1.4,8400],[S,8600]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,hero:tau<PASS+.4?FAB:MOR});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(MOR,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, raised behind Fabián: short passes, then the gap
const tau2=(t:number)=>key(t,mono([[0,-3.6],[CUEW(1,'slowly'),-3.3],[CUEW(1,'simple passes'),-2.5],[CUEW(1,'keep the ball'),-1.5],[CUEW(1,'Then Fabián'),-.9],[CUEW(1,'gap between'),-.42],[CUEW(1,'two defenders'),-.25],[SECS(1),.4]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(FAB,Math.min(tau,.3)),open=1-sm(0,1.2,t,easeInOutSine),toGap=sm(CUEW(1,'Then Fabián')-.5,CUEW(1,'gap between')+.3,t,easeInOutSine);
 const b=ballAt(Math.min(tau,PASS)),gp=posOf(SUT,tau),gq=posOf(PON,tau);
 const Ta:V3=[lerp(b[0],m[0],.45)+2,.6,lerp(b[2],m[1],.45)],Tg:V3=[lerp(m[0],(gp[0]+gq[0])/2,.62),.6,lerp(m[1],(gp[1]+gq[1])/2,.6)];
 const C:V3=[m[0]-13+4*toGap+2*open,7.5-2*toGap,m[1]+1-1.5*toGap];
 return look(C,lerp3(Ta,Tg,toGap),1550+450*toGap-150*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),sp=CUEW(1,'simple passes'),kb=CUEW(1,'keep the ball'),fs=CUEW(1,'Then Fabián'),gb=CUEW(1,'gap between'),td=CUEW(1,'two defenders'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const out=1-sm(E-.8,E-.4,t);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:FAB,under:()=>{
   // "short, simple passes keep the ball moving": the two short passes as blue lanes
   groundArrow(s,c,ballPts(CPASS,RREC),sm(sp-.1,sp+.6,t,easeOut)*(1-sm(gb-.3,gb+.2,t)),B,62);
   groundArrow(s,c,ballPts(RPASS,PASS),sm(kb-.1,kb+.6,t,easeOut)*(1-sm(gb-.3,gb+.2,t)),B,64);
   // "a gap between two defenders": the yellow gate between the centre-backs, a red ring on each of them
   gate(s,c,tau,sm(gb-.15,gb+.5,t,easeOutBack)*out);
   const tw=sm(td-.15,td+.3,t,easeOutBack)*out;for(const k of [SUT,PON]){const[x,z]=posOf(k,tau);ring(s,c,x,z,1.3,tw,R,46+k);}},
   after:({joints})=>{
    // "Fabián spots": a dashed sight line from his eyes up the pitch to the gap
    const r=joints.get(FAB),a=posOf(SUT,tau),b=posOf(PON,tau);sightLine(s,r,pr(c,[(a[0]+b[0])/2,.3,(a[1]+b[1])/2]),sm(fs-.1,fs+.6,t,easeOut)*(1-sm(E-1,E-.5,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · second replay angle from behind Croatia's goal: through the gap, Morata, the roll past the keeper
const tau3=(t:number)=>{const pk=CUEW(2,'past the keeper');return key(t,mono([[0,-.35],[CUEW(2,'His low pass'),PASS],[CUEW(2,'zips through'),.7],[CUEW(2,'Morata runs'),MREC],[CUEW(2,'calmly rolls'),SHOT-.02],[pk,3.95],[SECS(2),Math.max(IN_NET+.9,3.95+(SECS(2)-pk)*.8)]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),b=ballAt(tau),mo=smooth(MOR,tau),near=sm(MREC,SHOT,tau,easeInOutSine),cel=sm(IN_NET,IN_NET+.8,tau,easeInOutSine);
 const C:V3=[118,8.2-1.4*near,lerp(-2.5,-4,near)],T:V3=[lerp(lerp(b[0],mo[0],.5)-3,mo[0],cel),.9,lerp(lerp(b[2],mo[1],.5),mo[1],cel)];
 return look(C,T,3300+1100*near+600*cel);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),lp=CUEW(2,'His low pass'),zt=CUEW(2,'zips through'),mr=CUEW(2,'Morata runs'),cr=CUEW(2,'calmly rolls'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(IN_NET+.1,IN_NET+.4,tau)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{goalLater:true});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:MOR,under:()=>{
   const fade=1-sm(cr+1.2,cr+1.8,t);
   // "his low pass zips through the gap": the gate and the yellow lane through it
   gate(s,c,Math.min(tau,.6),sm(lp-.1,lp+.4,t,easeOutBack)*(1-sm(mr-.2,mr+.3,t)));
   groundArrow(s,c,ballPts(PASS,MREC),sm(zt-.4,zt+.5,t,easeOut)*(1-sm(cr-.4,cr,t)),Y,66);
   // "Morata runs onto it": his run as a blue arrow; "calmly rolls it": the roll past the keeper in yellow
   groundArrow(s,c,runPts(MOR,.2,MREC+.3),sm(mr-.4,mr+.3,t,easeOut)*(1-sm(cr-.4,cr,t)),B,67);
   groundArrow(s,c,ballPts(SHOT,IN_NET),sm(cr,cr+.9,t,easeOut)*fade,Y,68);}});
  goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(MOR,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: just behind Fabián — short passes, wait for the gap, pass forward through it
const tau4=(t:number)=>key(t,mono([[0,-3.4],[CUEW(3,'keep the ball'),-3.1],[CUEW(3,'short passes'),-2.45],[CUEW(3,'until a gap'),-1.0],[CUEW(3,'then pass forward'),PASS-.05],[CUEW(3,'through it'),.8],[SECS(3),1.75]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(FAB,Math.min(tau,PASS+.2)),push=sm(0,1.2,t,easeInOutSine),ug=CUEW(3,'until a gap');
 const toGap=sm(ug-.5,ug+.6,t,easeInOutSine),b=ballAt(Math.min(tau,PASS)),a=posOf(SUT,tau),c2=posOf(PON,tau);
 const Tb:V3=[lerp(b[0],m[0],.3)+1.5,.7,lerp(b[2],m[1],.3)],Tg:V3=[lerp(m[0],(a[0]+c2[0])/2,.55),.6,lerp(m[1],(a[1]+c2[1])/2,.55)];
 const C:V3=[m[0]-9.5-2*(1-push)+2.5*toGap,4.6+.4*toGap,m[1]-3.5+1.5*toGap];
 return look(C,lerp3(Tb,Tg,toGap),1250+200*push+450*toGap);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),sp=CUEW(3,'short passes'),ug=CUEW(3,'until a gap'),pf=CUEW(3,'then pass forward'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const out=1-sm(E-.9,E-.5,t);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:FAB,under:()=>{
   // "short passes": both short passes as blue lanes; "until a gap opens": the gate; "then pass forward through it": the yellow lane
   const sw=sm(sp-.1,sp+.6,t,easeOut)*(1-sm(pf-.2,pf+.3,t));
   groundArrow(s,c,ballPts(CPASS,RREC),sw,B,72);groundArrow(s,c,ballPts(RPASS,PASS),sw,B,73);
   gate(s,c,Math.min(tau,.3),sm(ug-.1,ug+.5,t,easeOutBack)*out,85);
   groundArrow(s,c,ballPts(PASS,MREC),sm(pf-.1,pf+.8,t,easeOut)*out,Y,74);},
   after:()=>{
    // the pass arrives: a yellow spark at Morata's boot
    const age=tau-MREC;if(age>-.15&&age<.5){const q=pr(c,[MP[0][0],.15,MP[0][1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[MP[0][0],0,MP[0][1]])*.7,{n:8,seed:93,g:easeOutBack(clamp((age+.15)/.15))*(1-clamp((age-.3)/.2)),width:9});}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'fabian-ruiz-signature',format:'11v11',title:"Fabián Ruiz Breaks the Lines",theme:'Keep the ball moving with short passes until a gap opens, then pass forward through it',
 ageNote:'Euro 2024 group stage, Spain 3–0 Croatia, Olympiastadion Berlin, 15 June 2024 (Spain\'s first goal, Morata 29\'). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of summer turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};

/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];a.addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
