/** Kaká, signature: "the long run through midfield". An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from
 * written accounts (we cannot watch the footage) of ONE real moment, printed as a riso sheet:
 *   AC Milan 1–0 Celtic (after extra time), UEFA Champions League round of 16, second leg, San Siro, Milan, Wednesday 7 March 2007 —
 *   Kaká's winner in the 93rd minute, three minutes into extra time.
 * WHY THIS MOMENT: it is the signature in its purest form. Celtic lost the ball in midfield, and Kaká simply drove forward into the open
 * space, brushed past Neil Lennon and finished — a run from the middle of the pitch that no one could catch (the entry's lesson: "When
 * there's space, push the ball ahead and sprint; defenders can't catch a fast run"). The other candidate (his second goal at Old Trafford,
 * 24 April 2007, a double header past Fletcher and Heinze) is a short burst down the flank, not a run through midfield.
 *
 * SOURCES (what the choreography and kit follow):
 *  - The Guardian, Ewan Murray at the San Siro, "Kaka cracker gives Milan a bit extra to kill off Celtic dream", 7/8 March 2007
 *    https://www.theguardian.com/football/2007/mar/08/match.sport2
 *  - UEFA.com, Richard Aikman, "Celtic foiled by Kaká magic", 7 March 2007 (report text truncated after the preview)
 *    https://www.uefa.com/uefachampionsleague/news/01bf-0e6e341eba25-230916a3413f-1000--celtic-foiled-by-kaka-magic/
 *  - Wikipedia, "2006–07 UEFA Champions League knockout stage" (match box: 7 March 2007, 20:45, San Siro, Milan 1–0 Celtic aet, Kaká 93',
 *    referee Konrad Plautz (Austria), attendance 52,914) and "Kaká" (number 22 at Milan; naturally right-footed, strong with both feet);
 *    "2006–07 Celtic F.C. season" (both legs 0–0 until Kaká's extra-time goal).
 * CONFIRMED by those accounts: the date, venue, round and score; the goal came three minutes into extra time (93'); Evander Sno "cheaply
 * conceded possession in midfield"; Kaká "wasted little time in driving forward, brushing past Neil Lennon and sliding the winning goal
 * underneath Boruc" (Guardian); "finished clinically after a brilliant run" (UEFA); Artur Boruc in the Celtic goal; an afternoon deluge
 * left the three-week-old pitch far from perfect (a wet surface); a night kick-off (20:45) under floodlights; 4,500 seats reserved for
 * Celtic fans; Milan went through to the quarter-finals; Kaká wore 22 and is naturally right-footed.
 * INFERRED (illustrative): every position, speed and timing between those beats; exactly how Sno lost the ball (here a heavy touch that
 * runs loose behind him); where on the pitch it happened (here just on Milan's side of halfway); the line of the run (centre-right), the
 * number and length of Kaká's pushes; which side he brushed Lennon (Lennon's shoulder on Kaká's right); the shooting foot (his natural
 * right — not named in the narration); Boruc going down to his left as the ball slides under him; the celebration; the other players'
 * positions and identities (unnamed); the kits (Milan's 2006–07 home red-and-black stripes, white shorts, black socks; Celtic's green-and-
 * white hoops, white shorts, white socks; Boruc's yellow keeper kit; the referee in black — season kits, not verified for this match, so
 * never named in the narration); Lennon's ginger hair; San Siro's shape (four steep three-tier stands, the corner towers with their spiral
 * ramps, the red roof girders, floodlights on the roof edge) simplified; the Celtic end placement; whether it was still raining (we show
 * only a wet, glinting pitch); the ball (a Champions League star ball, stylised); the camera placements and direction of play on screen.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in real time,
 * panning with the ball (from "Kaká grabs" to "goal" the run plays at ~1× real time); 2 = slow-motion replay from a low touchline camera
 * running alongside him: each big push (a yellow arrow into the space), the yellow space ahead, the sprint (red run arrow, speed lines),
 * Lennon left behind (a red gap bar that keeps growing); 3 = the second replay angle, low behind the goal: the finish slides under Boruc,
 * then a swing round to the celebration with the crowd flashing; 4 = the lesson from a low front three-quarter camera on the push past
 * Lennon (space zone, push arrow, sprint arrow, the gap). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed
 * through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times
 * the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The run, live',text:'Milan, 2007, extra time against Celtic on a wet night. Celtic lose the ball in midfield... Kaká grabs it and off he goes! He pushes it ahead, brushes past Neil Lennon, into the box... goal!',seconds:14.4,
  cues:[[.2,'Milan'],[1.1,'2007'],[2,'extra time'],[3.4,'wet night'],[4.6,'Celtic lose'],[6.2,'Kaká grabs'],[7.3,'off he goes'],[8.4,'He pushes'],[9.5,'brushes past'],[10.9,'into the box'],[12.4,'goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. Big pushes send the ball into the space ahead, then he sprints after it. The defenders chase, but can’t catch him.',seconds:10,
  cues:[[.15,'Watch it again'],[1.8,'Big pushes'],[3.3,'space ahead'],[4.6,'he sprints'],[6.3,'The defenders chase'],[7.8,'can’t catch him']]},
 {label:'Under the keeper',text:'He slides it underneath keeper Artur Boruc, and Milan are through!',seconds:6,
  cues:[[.15,'He slides'],[1.3,'underneath'],[2.3,'keeper Artur Boruc'],[3.6,'Milan are through']]},
 {label:'Your turn',text:'Your turn: when there’s space, push the ball ahead and sprint. Defenders can’t catch a fast run!',seconds:7.8,
  cues:[[.15,'Your turn'],[1,'when there’s space'],[2.2,'push the ball'],[3.4,'and sprint'],[4.4,'Defenders can’t'],[5.6,'a fast run']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py kaka-signature-2007, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/kaka-signature-2007/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/kaka-signature-2007/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kaka: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',G='green',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Milan attack +X, Celtic's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. */
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
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;

// ---------------------------------------------------------------- San Siro at night: four steep three-tier stands, corner towers, red roof girders
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind Celtic's goal (x>105), 2 the main stand (z>0, the ch1
 * camera sits behind it), 3 the other end (x<0). Steep and close to the pitch (simplified). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-6,111,a),.9+36*b,-39-28*b],
 (a,b)=>[111.5+28*b,.9+36*b,lerp(-38,38,a)],
 (a,b)=>[lerp(111,-6,a),.9+36*b,39+28*b],
 (a,b)=>[-6.5-28*b,.9+36*b,lerp(38,-38,a)],
];
/** a stand is drawn only when the camera is on the pitch side of its front face (the cameras sit in or behind the near stand) */
const FACING=[(C:V3)=>C[2]>-38,(C:V3)=>C[0]<111,(C:V3)=>C[2]<38,(C:V3)=>C[0]>-6];
const STAND_COLS=[84,44,84,44],STAND_ROWS=18;
/** the dark fascias between the three rings */
const FASCIA:[number,number][]=[[.33,.37],[.66,.7]];
/** crowd mix per stand: [paper, red, navy/black, green (Celtic), yellow flags]. The Celtic section (4,500 seats) sits in the x<0 end's top ring (placement inferred) */
const CROWD_MIX:[number,number,number,number,number][]=[[.2,.44,.3,0,.06],[.2,.44,.3,0,.06],[.2,.44,.3,0,.06],[.2,.44,.3,0,.06]];
const CELTIC_END=(si:number,a:number,b:number)=>si===3&&b>.7&&a>.2&&a<.8;
/** the corner towers (cylinders with spiral ramps) that lift the roof */
const TOWERS:[number,number][]=[[-12,-46],[117,-46],[117,46],[-12,46]];
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 // a Milan night: deep navy sky, a faint floodlit haze above the bowl
 s.field(K,.9,.5);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-700],[1e4,hz[1]-700],[1e4,hz[1]+80],[-1e4,hz[1]+80]],true),.1);
 const which=[0,1,2,3].filter(i=>FACING[i](c.C));
 // towers behind the stands: pale concrete bands with dark spiral ramps
 const tw=new Path2D(),ramp=new Path2D();
 for(const[x,z] of TOWERS){const b=toCam(c,[x,0,z]),tp=toCam(c,[x,50,z]);if(b[2]<20||tp[2]<20)continue;const rw=c.F*9/b[2],g0=scr(c,b),g1=scr(c,tp);if(!inView(v,g0,rw*2)&&!inView(v,g1,rw*2))continue;
  tw.addPath(polyPath([[g0[0]-rw,g0[1]],[g1[0]-rw,g1[1]],[g1[0]+rw,g1[1]],[g0[0]+rw,g0[1]]],true));
  for(let k=0;k<9;k++){const u0=k/9,u1=(k+.7)/9,p0:Pt=[lerp(g0[0],g1[0],u0)-rw,lerp(g0[1],g1[1],u0)],p1:Pt=[lerp(g0[0],g1[0],u1)+rw,lerp(g0[1],g1[1],u1)];ramp.addPath(ribbon([p0,p1],Math.max(1.5,rw*.16),{seed:k+7,taper:0,wobble:.4}));}}
 s.knockout(tw);s.tone(K,tw,.45);s.tone(Y,tw,.12);s.fill(K,ramp,.8);
 const planes=new Path2D(),fas=new Path2D(),lit=new Path2D(),roof=new Path2D(),truss=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  for(const[b0,b1] of FASCIA){addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));addPoly(lit,polyP(c,[S(0,b1-.012),S(1,b1-.012),S(1,b1),S(0,b1)]));}
  // the roof: a dark slab overhanging the top ring, carried by the famous red girders (a lattice along its inner edge)
  const top=(a:number,dy:number):V3=>add3(S(a,1),[0,dy,0]),edge=(a:number,dy:number):V3=>add3(S(a,.72),[0,11+dy,0]);
  addPoly(roof,polyP(c,[top(0,1),top(1,1),edge(1,0),edge(0,0)]));
  seg3(c,edge(0,2.2),edge(1,2.2),.9,truss);seg3(c,edge(0,-.2),edge(1,-.2),.7,truss);
  const n=i%2?8:16;for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n;seg3(c,edge(a0,-.2),edge(a1,2.2),.45,truss);seg3(c,edge(a1,-.2),edge(a1,2.2),.35,truss);}}
 s.knockout(planes);s.tone(K,planes,.55);s.tone(R,planes,.1);
 // the crowd: one mark per seat group, sized by distance
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.16)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<14)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.2,16),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.16)/.84;let ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:u<mx[0]+mx[1]+mx[2]+mx[3]?3:4;if(CELTIC_END(si,a,b))ink=u<.45?0:u<.9?3:4;
   inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.knockout(inks[1],.7);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.knockout(inks[3],.7);s.fill(G,inks[3],.95);s.knockout(inks[4],.8);s.fill(Y,inks[4],.95);
 s.knockout(fas);s.fill(K,fas,.9);s.knockout(lit,.6);s.tone(Y,lit,.35);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(truss);s.fill(R,truss,.95);
 // floodlights under the roof edge, with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();
 for(const i of which){const S=STANDS[i],n=i%2?4:8;for(let k=0;k<n;k++){const u=(k+.5)/n,m=add3(S(u,.72),[0,10.2,0]);if(toCam(c,m)[2]<16)continue;seg3(c,add3(S(u-.02,.72),[0,10.2,0]),add3(S(u+.02,.72),[0,10.2,0]),1,lamp);
  const g=pr(c,m);if(g&&inView(v,g,200)){const r=clamp(kAt(c,m)*4.5,8,130);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n&&which.length;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q||!inView(v,q))continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.65);}
}
/** floodlight glints on the wet grass (the afternoon deluge): long pale streaks, stronger from the "wet night" cue */
const GLINTS:[number,number,number,number][]=[[18,-14,7,1.1],[36,10,9,1.3],[58,-6,8,1],[74,16,10,1.4],[90,-12,7,1],[47,24,6,.9],[98,8,6,.9],[64,-22,8,1.1],[82,2,6,.8],[26,20,7,1]];
/** grass (yellow under green, a touch of night navy) with mowing stripes, wet glints, boards, paper lines, both goals (the right goal drawn
 * later when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean;wet?:number}={}){
 const g=polyP(c,[[-7,0,-39],[112,0,-39],[112,0,39],[-7,0,39]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(G,gp,.82);s.tone(K,gp,.14);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-39],[(k+1)*5.25,0,-39],[(k+1)*5.25,0,39],[k*5.25,0,39]]));s.tone(K,st,.12);
 const wet=o.wet??.5;if(wet>0){const gl=new Path2D();GLINTS.forEach(([x,z,rx,rz],i)=>{const pts:Pt[]=[];for(let k=0;k<14;k++){const a=k/14*TAU;const q=pr(c,[x+Math.cos(a)*rx,0,z+Math.sin(a)*rz]);if(!q)return;pts.push(q);}gl.addPath(polyPath(pts,true));});s.knockout(gl,.16*wet);s.tone(Y,gl,.22*wet);}
 // boards: navy with paper and red panels along the far touchline and behind both goals
 const bd=new Path2D(),pn=new Path2D(),rp=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([-4,0,-37],[109,0,-37]);board([108.5,0,-36],[108.5,0,36]);board([-3.5,0,36],[-3.5,0,-36]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(k%3?pn:rp,polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%3?pn:rp,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.knockout(rp);s.fill(R,rp,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??1.5);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.32],[R,.16]];
const SKIN_K:InkFill[]=[[Y,.42],[R,.24],[K,.05]];
const SKIN_D:InkFill[]=[[Y,.5],[R,.4],[K,.3]];
/** Milan 2006–07 home (season kit, inferred for the night): red and black stripes, white shorts, black socks, white numbers */
const MIL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],pattern:'stripes',patternInk:K,shorts:'paper',socks:K,boots:K,trim:'paper',numberInk:'paper',skin:SKIN_K,hair:K,hairStyle:'short',line:K,seed:3,...o});
/** Kaká: Milan's number 22 (confirmed), 1.86 m, slim and upright, short dark hair */
const KAKA_STYLE=MIL({number:22,build:{height:1.86,bulk:.96,thighs:1.05},seed:22});
/** Celtic (season kit, inferred for the night): green and white hoops, white shorts, white socks */
const CEL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'hoops',patternInk:[G,.95],shorts:'paper',socks:'paper',boots:K,trim:G,skin:SKIN_L,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** Artur Boruc: 1.93 m; keeper kit colour inferred (yellow), gloves paper */
const BORUC_STYLE:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.93,bulk:1.04},seed:51};
const REF:AthleteStyle={shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'balding',line:K,trim:Y,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Kaká's first touch)
type Role='kaka'|'cel'|'gk'|'mil'|'ref';
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Named players get the beats the accounts give them (Sno loses it, Kaká
 * brushes past Lennon, slides it under Boruc); where exactly each stood is inferred. Kaká runs ~50 m at up to ~8 m/s. */
const ACTORS:Actor[]=[
 {name:'Kaká',role:'kaka',style:KAKA_STYLE,key:true,keys:[[-5,40,1],[-3,42.5,2],[-1.2,45.2,3],[-.4,46.6,3.5],[0,47.4,3.8],[.4,49.3,4.1],[1,53.2,4.6],[1.6,57.8,5.1],[2.2,62.6,5.6],[2.6,65.8,6],[3,69,6.4],[3.6,73.8,6.8],[4.2,78.6,7],[4.8,83.4,6.9],[5.4,88.2,6.6],[5.9,92,6.1],[6.3,94.5,5.8],[6.7,95.9,5.7],[7.3,97,6.3],[8,97.8,8.4],[9.5,98.3,12.5],[11,98,16],[13,97,19.5]]},
 {name:'Sno',role:'cel',style:CEL({skin:SKIN_D,seed:31,build:{height:1.83,bulk:1.05}}),key:true,engage:[-.3,.9],moves:[{kind:'lunge',at:.2,dur:.8,side:'r'}],keys:[[-5,54,4],[-2,52,4.2],[-1,51.2,4.2],[-.6,51,4.2],[0,50.6,4.1],[.6,50.8,4.4],[1.5,52.5,5],[3,57,5.5],[6,66,5.8],[13,78,5]]},
 {name:'Lennon',role:'cel',style:CEL({hair:[R,.9],seed:32,build:{height:1.8,bulk:1.06}}),key:true,engage:[1.2,2.8],moves:[{kind:'lunge',at:2.55,dur:.8,side:'r'}],keys:[[-5,62,11],[-1,62.5,10],[0,62.8,9.4],[1.2,64,8],[2,65.2,7.1],[2.6,66.1,6.7],[2.9,66.8,7.1],[3.4,68,7.7],[4.2,71.5,8.2],[5.2,77.5,8],[6.6,85.5,7.3],[13,92,6]]},
 {name:'Boruc',role:'gk',style:BORUC_STYLE,key:true,moves:[{kind:'dive',at:6.6,dur:.8,side:'l'}],keys:[[-5,103.8,0],[3,103.3,1.2],[5.4,101.6,2.6],[6.2,100.4,3.3],[6.5,100.1,3.4],[13,100.1,3.4]]},
 {name:'passer',role:'cel',style:CEL({seed:33}),keys:[[-5,61,-7],[-2,58.3,-4.2],[-1.5,57.6,-3.6],[0,56.5,-2.4],[3,60,-1],[13,72,-2]]},
 {name:'centre-back',role:'cel',style:CEL({seed:34,build:{height:1.9}}),keys:[[-5,80,-4],[0,80,-3],[2,81,-2],[4,85,.5],[5.4,91.5,2.6],[6.3,95.2,3.6],[13,99,3]]},
 {name:'centre-back 2',role:'cel',style:CEL({seed:35,hair:[K,.7]}),keys:[[-5,79,-13],[2,82,-11],[5,90,-8],[6.5,96,-5],[13,99,-3]]},
 {name:'left-back',role:'cel',style:CEL({seed:36}),keys:[[-5,76,19],[2,79,17],[4.5,86,13],[6.5,93,10],[13,97,8]]},
 {name:'right-back',role:'cel',style:CEL({seed:37}),keys:[[-5,72,-22],[3,80,-18],[6.5,90,-12],[13,95,-8]]},
 {name:'midfielder',role:'cel',style:CEL({seed:38,hair:[Y,.7]}),keys:[[-5,56,16],[2,58,14],[6,70,12],[13,82,10]]},
 {name:'striker',role:'cel',style:CEL({seed:39}),keys:[[-5,40,-6],[3,46,-4],[13,62,-2]]},
 {name:'striker 2',role:'cel',style:CEL({seed:40}),keys:[[-5,44,10],[3,50,9],[13,66,6]]},
 {name:'Milan forward',role:'mil',style:MIL({seed:41}),keys:[[-5,70,-8],[1,74,-8],[3,80,-6],[6,92,-3],[7.5,97,-1],[13,99,1]]},
 {name:'Milan wide',role:'mil',style:MIL({seed:42}),keys:[[-5,55,20],[2,62,19],[6,80,15],[13,92,13]]},
 {name:'Milan mid',role:'mil',style:MIL({seed:43,hairStyle:'long'}),keys:[[-5,42,-8],[3,50,-6],[13,64,-2]]},
 {name:'Milan mid 2',role:'mil',style:MIL({seed:44,hairStyle:'bald'}),keys:[[-5,48,-17],[3,56,-15],[13,72,-10]]},
 {name:'Milan back',role:'mil',style:MIL({seed:45}),keys:[[-5,32,6],[13,48,6]]},
 {name:'Milan back 2',role:'mil',style:MIL({seed:46,skin:SKIN_D}),keys:[[-5,30,-9],[13,46,-6]]},
 {name:'referee',role:'ref',style:REF,keys:[[-5,56,-7],[3,64,-4],[7,80,-4],[13,90,-2]]},
];
const KK=0,SNO=1,LENNON=2,BORUC=3,PASSER=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-5,T1=13,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Sno's pass, the loose touch, Kaká's big pushes, the finish
/** Kaká's touches: the steal, three long pushes into space, a settling touch in the box; then the right-foot finish (all inferred) */
const TOUCHES=[0,1.35,2.95,4.4,5.6],SHOT=6.3,IN_NET=SHOT+.62,PASS=-1.5,LOOSE=-.6;
const TT=[...TOUCHES,SHOT];
/** his sprint: one full gait cycle every CYC metres; the right foot reaches the ball at phase PH (runCycle reach ≈ .92) */
const CYC=4.3,PH=.93;
const yawKK=(tau:number)=>{const v=velOf(KK,tau);return Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):0;};
const fwdR=(tau:number):[Pt,Pt]=>{const y=yawKK(tau);return[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];};
/** ball spot for his right foot: ahead and a touch to his right */
const footAt=(tau:number):[number,number]=>{const p=posOf(KK,tau),[f,r]=fwdR(tau);return[p[0]+f[0]*.55+r[0]*.1,p[1]+f[1]*.55+r[1]*.1];};
const TP=TT.map(footAt);
/** the gait phase, re-timed between touches so the right foot swings through the ball at every touch */
function phaseKK(tau:number):number{const d=distOf(KK,tau);
 if(tau<TT[0])return PH+(d-distOf(KK,TT[0]))/CYC;if(tau>=TT[TT.length-1])return PH+(d-distOf(KK,TT[TT.length-1]))/CYC;
 let k=0;while(tau>=TT[k+1])k++;const d0=distOf(KK,TT[k]),d1=distOf(KK,TT[k+1]),n=Math.max(1,Math.round((d1-d0)/CYC));return PH+n*(d-d0)/Math.max(1e-6,d1-d0);}
const NET:V3=[105.3,.2,2.3],REST:V3=[106.2,.11,2.5];
const passFoot=():[number,number]=>{const p=posOf(PASSER,PASS);return[p[0]-.5,p[1]+.2];};
const snoFoot=():[number,number]=>{const p=posOf(SNO,LOOSE);return[p[0]+.5,p[1]];};
function ballAt(tau:number):V3{
 if(tau<PASS){const p=posOf(PASSER,tau),v=velOf(PASSER,tau),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*.5,.11,p[1]+v[1]/l*.5];}
 if(tau<LOOSE){const a=passFoot(),b=snoFoot(),u=(tau-PASS)/(LOOSE-PASS),e=1-Math.pow(1-u,1.4);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<0){const a=snoFoot(),b=TP[0],u=tau/-LOOSE+1,e=1-Math.pow(1-u,1.6);return[lerp(a[0],b[0],e),.11+.18*Math.abs(Math.sin(u*Math.PI*1.6))*(1-u),lerp(a[1],b[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TT.length&&tau>=TT[k+1])k++;const u=(tau-TT[k])/(TT[k+1]-TT[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.1*u,lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the push: the right instep swings through the ball, toe down, eyes on the ball for a moment */
const PUSH:Partial<Pose>={rHipF:44,rKnee:26,rAnk:38,rHipR:-10,neckP:24,lean:16};
/** the brush: shoulder dropped into Lennon on his right, torso braced */
const BRUSH:Partial<Pose>={roll:9,bend:10,twist:-8,rShA:24,rShF:-10,lShA:62,neckY:-8,squash:-.04};
/** Lennon knocked off balance after the contact: weight back, arms out */
const STAGGER:Partial<Pose>={lean:-12,pitch:-8,roll:-10,lShA:74,rShA:56,lElb:30,rElb:40,neckP:-18,lKnee:40,rKnee:24};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(KK,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===SNO&&tau<LOOSE+.2)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===KK)yaw=tau<-.2?yawOf(b[0]-x,b[2]-z):lerpA(yawOf(b[0]-x,b[2]-z),yawKK(tau),sm(-.2,.3,tau));
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='cel'?READY:stand();
 if(k===KK){const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(phaseKK(tau),{speed:s}),clamp((sp-.3)/.8));
  for(const T of TOUCHES)p=over(p,PUSH,bump(T-.13,T+.12,tau));
  p=over(p,BRUSH,bump(2.3,2.95,tau));
  const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));
  if(tau>IN_NET+1.6)p=over(p,{lShA:160,rShA:160,lShF:24,rShF:24,lElb:8,rElb:8,neckP:-30,lHand:.3,rHand:.3},sm(IN_NET+1.6,IN_NET+2.2,tau));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:0});p.dz*=.35;}}
 if(k===LENNON)p=over(p,STAGGER,bump(2.6,3.7,tau));
 if(k===SNO&&tau>LOOSE-.3&&tau<LOOSE+.4)p=over(p,{rHipF:30,rKnee:30,rAnk:20,neckP:30,lean:14},bump(LOOSE-.3,LOOSE+.4,tau));
 if(a.role==='mil'&&tau>IN_NET+.4)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+1,tau));
 if(a.role==='cel'&&k!==LENNON&&tau>IN_NET+.5)p=over(p,{lean:34,neckP:30,lShF:-10,rShF:-10,lShA:12,rShA:12},sm(IN_NET+.5,IN_NET+1.2,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a Champions League star ball (paper, navy stars; stylised)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const star=(cx:number,cy:number,sr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<10;i++){const a=a0+i/10*TAU,rr=i%2?sr*.42:sr;q.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}return polyPath(q,true);};
 const st=new Path2D();st.addPath(star(x+Math.cos(rot)*r*.2,y+Math.sin(rot)*r*.2,r*.36,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;st.addPath(star(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(K,st,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;before?:()=>void;near?:number}={}):PlayOut{
 const{minBall=6,hero=false,near=1.2}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(k===KK?1.2:near))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlit: short, soft); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.15,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.before?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===KK?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===KK||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===KK}:{});
  if(e.k===KK)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a touch: a yellow spark and a little splash of water off the wet grass */
function touchMarks(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 const drops=new Path2D();let any=false;
 TT.forEach((T,i)=>{const age=tau-T;if(age<0||age>.45)return;const[x,z]=TP[i],q=toCam(c,[x,.1,z]);if(q[2]<1)return;const g=scr(c,q),k=c.F/q[2];
  if(age<.28)sparkBurst(s,Y,g[0],g[1],k*.45,{n:7,seed:i+9,g:easeOutBack(clamp(age/.1))*(1-clamp((age-.18)/.1)),width:Math.max(4,k*.035),cov:.95*w});
  const r=rng(i*13+5);for(let j=0;j<8;j++){const a=-Math.PI*(.15+.7*r()),d=k*(.15+.35*r())*easeOut(clamp(age/.35)),dy=-k*.25*Math.sin(Math.PI*clamp(age/.45))*r(),rr=Math.max(1.5,k*.02*(1-age/.45));
   drops.moveTo(g[0]+Math.cos(a)*d+rr,g[1]+Math.sin(a)*d*.4+dy);drops.arc(g[0]+Math.cos(a)*d,g[1]+Math.sin(a)*d*.4+dy,rr,0,TAU);any=true;}});
 if(any)s.knockout(drops,.9*w);
}
/** a push: the yellow arrow along the ball's path from touch k into the space (drawn as it happens, progress w) */
function pushArrow(s:Sheet,c:Cam,k:number,w:number,cov=1){if(w<=0||k<0||k>=TP.length-1)return;
 const a=pr(c,[TP[k][0],0,TP[k][1]]),b=pr(c,[lerp(TP[k][0],TP[k+1][0],.92),0,lerp(TP[k][1],TP[k+1][1],.92)]);if(!a||!b)return;
 const d=toCam(c,[TP[k][0],0,TP[k][1]])[2],wd=Math.max(5,c.F*.16/d);
 s.knockout(ribbon([a,[lerp(a[0],b[0],w),lerp(a[1],b[1],w)]],wd*1.6,{seed:61,taper:.1,wobble:.8}),.7*cov);laneArrow(s,Y,a,b,wd,{progress:w,seed:62,head:wd*3,cov:.95*cov});}
/** the space ahead: a yellow halftone pool on the grass where the ball is heading */
function spaceZone(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,w:number){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<32;i++){const a=i/32*TAU,ww=1+.06*Math.sin(a*3);const q=pr(c,[x+Math.cos(a)*rx*w*ww,0,z+Math.sin(a)*rz*w*ww]);if(q)pts.push(q);}if(pts.length<20)return;
 const p=polyPath(pts,true);s.knockout(p,.35);s.tone(Y,p,.55);
 const d=toCam(c,[x,0,z])[2];s.fill(Y,ribbon(pts,Math.max(3,c.F*.08/d),{close:true,seed:73,taper:0,wobble:1,gaps:[[.05,.12],[.3,.37],[.55,.62],[.8,.87]]}),.95);}
/** the sprint: a red arrow on the grass along his real path over the next `span` seconds */
function runArrow(s:Sheet,c:Cam,t0:number,span:number,w:number){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=16;i++){const tau=t0+span*i/16,[x,z]=posOf(KK,tau),q=toCam(c,[x,0,z-.7]);if(q[2]<6)break;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=Math.max(4,c.F*.12/d);
 s.knockout(ribbon(seg,wd*1.7,{seed:64,taper:.1,wobble:.8}),.8);s.fill(R,ribbon(seg,wd,{seed:64,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:65,head:wd*3});}
/** the gap: a red bar on the grass from Lennon to Kaká, ticked every metre (it grows as he pulls away) */
function gapBar(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 const[lx,lz]=posOf(LENNON,tau),[kx,kz]=posOf(KK,tau),a=pr(c,[lx,0,lz]),b=pr(c,[lerp(lx,kx,w),0,lerp(lz,kz,w)]);if(!a||!b)return;
 const d=toCam(c,[kx,0,kz])[2],wd=Math.max(3,c.F*.07/d);s.knockout(ribbon([a,b],wd*2,{seed:66,taper:0}),.8);s.fill(R,ribbon([a,b],wd,{seed:66,taper:0}),.95);
 const ticks=new Path2D(),L=Math.hypot(kx-lx,kz-lz)*w;for(let m=1;m<L;m++){const u=m/Math.max(1e-6,Math.hypot(kx-lx,kz-lz)),p=pr(c,[lerp(lx,kx,u),0,lerp(lz,kz,u)]);if(p){ticks.moveTo(p[0]+wd*1.3,p[1]);ticks.arc(p[0],p[1],wd*1.3,0,TAU);}}s.fill(R,ticks,.95);}
/** speed lines streaming off his back */
function speedLines(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(KK,tau),q=pr(c,[x,1.1,z]),q2=pr(c,[x+1,1.1,z]);if(!q||!q2)return;
 const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),k=c.F/toCam(c,[x,1,z])[2],p=new Path2D();
 for(let i=0;i<3;i++){const oy=k*(-.5+i*.45),ox=-Math.cos(dir)*k*(.5+i*.15),L=k*(.9+.3*i);p.addPath(ribbon([[q[0]+ox,q[1]+oy],[q[0]+ox-Math.cos(dir)*L,q[1]+oy-Math.sin(dir)*L]],k*.05,{seed:9+i,taper:.9,wobble:.5}));}
 s.fill(K,p,.6*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter-1 time, keyed to the cue words (from "Kaká grabs" to "goal" the run plays at ~1× real time; the pre-roll is Celtic on the ball) */
const tau1=(t:number)=>{const g=CUEW(0,'Kaká grabs'),G=CUEW(0,'goal');return key(t,mono([[0,T0],[CUEW(0,'Celtic lose'),LOOSE-.5],[g,0],[CUEW(0,'He pushes'),1.35],[CUEW(0,'brushes past'),2.45],[CUEW(0,'into the box'),5.1],[G,IN_NET-.05],[Math.max(G+1,SECS(0)+1),IN_NET-.05+Math.max(1,SECS(0)+1-G)]]),linear);};
const CAM1:V3=[52.5,27,76];
function cam1(t:number):Cam{
 const cl=CUEW(0,'Celtic lose'),G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the opening: San Siro by night (the far stand, the red roof girders, the towers), then down onto the ball
 const open:V3=[58,9,-30],m=posOf(KK,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(CUEW(0,'extra time'),cl-.1,t,easeInOutSine),toD=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.2,toBall),lerp(open[2],lerp(bt[2],0,.2),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,mono([[0,1250],[CUEW(0,'2007'),1350],[CUEW(0,'wet night'),2600],[cl,4300],[CUEW(0,'Kaká grabs'),4700],[CUEW(0,'brushes past'),5000],[CUEW(0,'into the box'),5500],[G,5900],[G+1.4,6600],[Math.max(G+1.5,S),6900]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t)+.25*bump(CUEW(0,'extra time')-.2,CUEW(0,'wet night'),t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2],wet:.35+.65*sm(CUEW(0,'wet night')-.2,CUEW(0,'wet night')+.5,t)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,after:()=>touchMarks(s,c,tau,.8)});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(KK,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9.5,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera running alongside him
const tau2=(t:number)=>key(t,mono([[0,.75],[CUEW(1,'Big pushes'),1.2],[CUEW(1,'space ahead'),1.65],[CUEW(1,'he sprints'),2.1],[CUEW(1,'The defenders'),2.55],[CUEW(1,'can'),3.2],[SECS(1),4.05]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(KK,tau),open=1-sm(0,1.4,t,easeInOutSine),ahead=sm(CUEW(1,'space ahead')-.4,CUEW(1,'space ahead')+.3,t,easeInOutSine)*(1-sm(CUEW(1,'he sprints'),CUEW(1,'he sprints')+.8,t,easeInOutSine)),back=sm(CUEW(1,'The defenders')-.5,CUEW(1,'The defenders')+.6,t,easeInOutSine);
 const C:V3=[m[0]-2.6-2*back+1.5*open,1.5+.4*open+.5*back,m[1]+10+3*open+3.5*back],T:V3=[m[0]+1.6+3.2*ahead-1.2*back,.9,m[1]-.3];
 return look(C,T,2700-300*open-200*ahead-300*back);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),bp=CUEW(1,'Big pushes'),sa=CUEW(1,'space ahead'),hs=CUEW(1,'he sprints'),dc=CUEW(1,'The defenders'),cc=CUEW(1,'can'),E=SECS(1);
  const out=1-sm(E-1,E-.6,t);
  stadium(s,c,v,t);
  ground(s,c);
  // "Big pushes": each push draws its yellow arrow into the space as the ball travels
  const k=tau<TT[1]?0:tau<TT[2]?1:tau<TT[3]?2:3,pu=clamp((tau-TT[k])/Math.max(.1,TT[k+1]-TT[k]));
  const aw=sm(bp-.2,bp+.2,t)*out;pushArrow(s,c,k,aw*Math.max(.15,easeOut(clamp(pu*1.6))),aw);
  // "space ahead": the empty grass where the ball is going glows yellow
  spaceZone(s,c,TP[Math.min(k+1,TP.length-1)][0],TP[Math.min(k+1,TP.length-1)][1],3.2,2.4,sm(sa-.2,sa+.4,t,easeOutBack)*(1-sm(hs+.4,hs+.9,t))*out);
  // "he sprints": the red run arrow ahead of him
  runArrow(s,c,tau,1.1,sm(hs-.2,hs+.4,t,easeOut)*(1-sm(dc+.2,dc+.6,t))*out);
  // "The defenders chase ... can't catch him": the gap from Lennon to Kaká, growing
  gapBar(s,c,tau,sm(dc-.1,dc+.5,t,easeOut)*out);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,near:5,after:()=>{
   touchMarks(s,c,tau,1);
   speedLines(s,c,tau,sm(hs-.1,hs+.3,t)*(1-sm(dc-.3,dc,t))+sm(cc-.1,cc+.3,t)*out);
   // "can't catch him": a spark where Lennon's reach closes on nothing
   const age=t-cc;if(age>-.2&&age<.6){const[lx,lz]=posOf(LENNON,tau),q=pr(c,[lx+.6,1.3,lz-.4]);if(q)sparkBurst(s,R,q[0],q[1],kAt(c,[lx,1,lz])*.45,{n:8,seed:83,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:9});}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 3 · second replay angle, low behind the goal: under Boruc, then the celebration
const tau3=(t:number)=>{const mt=CUEW(2,'Milan are');return key(t,mono([[0,5.25],[CUEW(2,'He slides'),5.75],[CUEW(2,'underneath'),SHOT+.1],[CUEW(2,'keeper'),SHOT+.36],[mt,IN_NET+.5],[Math.max(mt+.5,SECS(2)),IN_NET+.5+Math.max(.5,SECS(2)-mt)*.8]]),linear);};
const swing3=(t:number)=>{const a=CUEW(2,'keeper');return sm(a+.4,CUEW(2,'Milan are')+.7,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(KK,tau),e=sm(SHOT-.3,IN_NET,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'Milan are')+.6,SECS(2),t,easeInOutSine);
 const C0:V3=[110,3.4,7.5-1.5*e],T0:V3=[lerp(m[0],100.5,e),lerp(.9,.7,e),lerp(m[1],3.4,e)];
 const C1:V3=[m[0]-6-hold,1.9+.4*hold,m[1]-8.5-1.2*hold],T1:V3=[m[0]+.6,1.2+.6*hold,m[1]+1.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3600+300*sm(0,CUEW(2,'underneath'),t),3400-250*hold,u)*(1+.25*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),mt=CUEW(2,'Milan are'),un=CUEW(2,'underneath'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(mt-.1,mt+.3,t)*(1-sm(SECS(2)-1.1,SECS(2)-.6,t))});
  ground(s,c,{goalLater:u<.5,wet:.6});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({bg,br})=>{
   touchMarks(s,c,tau,1);
   // "underneath": a yellow ring on the ball as it slides under the keeper
   const rw=sm(un-.2,un+.15,t,easeOutBack)*(1-sm(CUEW(2,'keeper')+.5,mt,t));
   if(bg&&rw>0){const pts:Pt[]=[];const r=br*1.9;for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([bg[0]+Math.cos(a)*r,bg[1]+Math.sin(a)*r*.8]);}s.knockout(ribbon(pts,Math.max(5,br*.5),{close:true,seed:88,taper:0}),.8*rw);s.fill(Y,ribbon(pts,Math.max(3,br*.3),{close:true,seed:88,taper:0,wobble:.6}),.95*rw);}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(KK,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front three-quarter camera on the push past Lennon
const tau4=(t:number)=>key(t,mono([[0,.9],[CUEW(3,'when'),1.1],[CUEW(3,'push'),1.33],[CUEW(3,'and sprint'),1.75],[CUEW(3,'Defenders'),2.35],[CUEW(3,'a fast'),2.9],[SECS(3),3.7]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(KK,tau),push=sm(CUEW(3,'when')-.3,CUEW(3,'when')+.5,t,easeInOutSine),orbit=sm(CUEW(3,'Defenders')-.4,CUEW(3,'Defenders')+.6,t,easeInOutSine),back=sm(CUEW(3,'a fast')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[m[0]+8.5+2*back-2*orbit,1.3+.7*orbit,m[1]+5.5+3*orbit+1.5*back],T:V3=[m[0]+1.2-1.2*orbit,.9,m[1]-.2];
 return look(C,T,2350+300*push-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wh=CUEW(3,'when'),pb=CUEW(3,'push'),as=CUEW(3,'and sprint'),dc=CUEW(3,'Defenders'),af=CUEW(3,'a fast'),E=SECS(3);
  const out=1-sm(E-1.1,E-.7,t);
  stadium(s,c,v,t);
  ground(s,c);
  // "when there's space": the open grass ahead of him lights up
  {const[zx,zz]=posOf(KK,Math.min(TT[2],tau+.3));spaceZone(s,c,zx+.6,zz-.2,2.3,1.8,sm(wh-.1,wh+.4,t,easeOutBack)*(1-sm(as+.3,as+.8,t))*out);}
  // "push the ball ahead": the push arrow into it
  pushArrow(s,c,1,sm(pb-.1,pb+.5,t,easeOut)*out);
  // "and sprint": the red run arrow and speed lines
  runArrow(s,c,tau,1.2,sm(as-.2,as+.4,t,easeOut)*(1-sm(dc+.1,dc+.5,t))*out);
  gapBar(s,c,tau,sm(dc-.1,dc+.5,t,easeOut)*out);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,near:5,after:()=>{
   touchMarks(s,c,tau,1);
   speedLines(s,c,tau,sm(as-.1,as+.3,t)*out+sm(af-.1,af+.3,t)*out*.5);
   const age=t-af;if(age>-.2&&age<.6){const[lx,lz]=posOf(LENNON,tau),q=pr(c,[lx+.5,1.3,lz-.4]);if(q)sparkBurst(s,R,q[0],q[1],kAt(c,[lx,1,lz])*.45,{n:8,seed:91,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:9});}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'kaka-signature-2007',format:'11v11',title:"Kaká's Long Run",theme:'When there is space, push the ball ahead and sprint: defenders cannot catch a fast run',
 ageNote:'Champions League round of 16, AC Milan 1–0 Celtic after extra time, San Siro, Milan, 7 March 2007. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a splash off the wet San Siro grass — water drops and grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and paper water drops thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(G,a,.7*fade);
}
export default film;
