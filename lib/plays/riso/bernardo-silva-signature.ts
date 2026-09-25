/** Bernardo Silva — signature: "the close-control wriggle" (lib/town/iconicPlays.json: kind "signature", template solo_dribble_goal,
 * centre, beaten 2, LEFT foot; lesson "Keep the ball glued to your foot and use your body to shield it."). An iconic-play riso film
 * (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer.
 *
 * WHY THIS MATCH, AND THE HONEST FALLBACK: the signature is a trait, not one logged moment. The best-documented Bernardo night I could read
 * about is Manchester City 4–0 Real Madrid, Champions League semi-final second leg, Etihad Stadium (City of Manchester Stadium), Manchester,
 * Wednesday 17 May 2023, when he scored twice in the first half. But the written accounts describe his FIRST goal (23') as a run into space
 * and a finish — not a dribble — and the second as a header; no source I read (research budget ~8 polite fetches) describes one logged
 * Bernardo dribble past two players. So, per the brief's fallback (as in the approved Heaps film): chapters 1–2 show ONLY what the sources
 * describe of that night (De Bruyne's low pass through, Bernardo in behind on the right, the near-post finish past Courtois), and chapters
 * 3–4 say plainly "Here's how he keeps the ball" and show the close-control wriggle as a DEMONSTRATION — empty stands, training cones, a
 * navy training top and two red-bib defenders, never passed off as that match or any other.
 *
 * SOURCES (fetched 24 Sep 2026 with curl and a generic UA, cached in the film scratchpad src-cache/):
 *  - Wikipedia, "2022–23 UEFA Champions League knockout phase" (raw): 17 May 2023, 21:00 CEST (20:00 local), Manchester City 4–0 Real
 *    Madrid, Silva 23' 37', Akanji 76', Alvarez 90+1'; City of Manchester Stadium; 55,100; referee Szymon Marciniak; City won 5–1 on
 *    aggregate.  (cache: wiki-2022-23-ucl-ko.txt)
 *  - The Guardian, David Hytner, "Manchester City in Champions League final after Silva leads rout of Real Madrid", 17 May 2023: "City were a
 *    blur of sky blue"; "City's remorseless pressure told when De Bruyne flashed a low pass through for Silva, who had melted into space
 *    behind the Madrid defence. Silva never looked like missing, the finish lifted inside the near corner"; Courtois made "a pair of
 *    high-end saves"; Guardiola "picked the same team as the first leg"; Militão in for Rüdiger; Grealish, Gündogan, Haaland, Kroos,
 *    Modric, Vinícius, Walker named.  https://www.theguardian.com/football/2023/may/17/manchester-city-real-madrid-champions-league-semi-final-second-leg-match-report
 *    (cache: guardian-mci-rma-2023.*)
 *  - CNN, "Bernardo Silva strikes twice to stun Real Madrid and send Manchester City to Champions League final", 17 May 2023: "After clever
 *    interchange on the right of the pitch, Kevin De Bruyne slipped Silva in on goal and the Portugal star smashed a near-post effort past
 *    Courtois"; "The diminutive midfielder, who is primarily known for his trickery with the ball at his feet".  (cache: cnn-mci-rma-2023.*)
 *  - Wikipedia, "Bernardo Silva" (raw): "a diminutive, elegant, and creative left-footed playmaker, with a slender build"; favours the right
 *    side; "mainly known for his technique ... ball control ... and dribbling"; joined Real Madrid on 17 June 2026.  (cache: wiki-bernardo-silva.txt)
 *  - (read, not used for the film) Wikipedia "2019 UEFA Nations League final" and UEFA "at a glance": Guedes scored from Bernardo's
 *    "disguised pass" — a pass, not a dribble, so not the signature.  (cache: wiki-2019-unl-final.txt, uefa-por-ned-unl-2019.txt)
 * CONFIRMED: the match, ground, date, evening kick-off, the 4–0; Bernardo's goal came from interchange on the RIGHT, De Bruyne's LOW pass
 *  through, Bernardo in space behind the defence, a NEAR-POST finish, lifted, past Courtois; City in sky blue; he is left-footed and slight.
 * INFERRED (illustrative, kept OUT of the narration): every position, run, speed and timing; Walker's pass inside to De Bruyne as the
 *  "interchange"; Bernardo striking FIRST TIME with his LEFT foot (sources say "smashed", "lifted"; foot per his left-footedness and the
 *  card params); the ball's height in the corner; Courtois (No. 1) diving late to his left; Camavinga as the defender he ran off; the
 *  other positions; the kits beyond "sky blue" (City sky-blue shirts, white shorts, sky-blue socks; Real Madrid all white — neither
 *  confirmed in the text I read; Courtois in yellow is a placeholder); numbers (Bernardo 20, De Bruyne 17, Courtois 1, from memory);
 *  hair and skin from photographs; the stadium's shape (a two-tier bowl, roof ring and the Etihad's roof masts, simplified); the evening
 *  light (sunset in Manchester ≈21:10 BST, so the 23rd minute is in late daylight under floodlights); the celebration run.
 *  Chapters 3–4 are a DEMONSTRATION of the signature (left foot, two defenders beaten, centre of the pitch, per iconicPlays params).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time, panning with the ball down City's right
 * (the near side) to the goal and the celebration; ch2 = slow-motion replay from a raised camera behind Bernardo's run: the space behind
 * the defenders lit yellow, the back line dashed red, the low pass lane, the flight lifted into the near corner (a yellow ring on it);
 * ch3 = the demonstration from a raised side camera: tiny left-foot touches, the first defender arrives and he turns his body into him,
 * rolls the ball away and spins off; the second defender lunges, a drag-back and an inside touch past him; ch4 = the lesson, low on the
 * ball side: a yellow "glue" ring on the ball and left boot, a blue body-shield wall between the ball and the defender, the defender's
 * reach blocked (red ✗). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer().
 * Full-sheet card-window framing (1.45:1 to square), never sheet.safe. Handedness: the world is right-handed (x toward the goal City
 * attack, y up, +z = the attackers' right = the near, main-stand side), athlete.ts's own convention, so his LEFT foot is the left foot.
 * Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); no cue starts with
 * a contraction or a hyphenated word (Kokoro splits them). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Manchester City against Real Madrid, Champions League semi-final. City pass on the right. De Bruyne slides it through, Bernardo Silva is in... near post, goal!',seconds:12.8,
  cues:[[.2,'Manchester City'],[1.3,'Real Madrid'],[2.3,'Champions League'],[4.3,'City pass'],[5.1,'on the right'],[6.2,'De Bruyne'],[6.9,'slides it through'],[8,'Bernardo Silva'],[8.9,'is in'],[9.9,'near post'],[10.8,'goal']]},
 {label:'Watch it again',text:'Watch again, slowly. Bernardo sneaks into the space behind the defenders, and lifts it inside the near post.',seconds:8.4,
  cues:[[.15,'Watch again'],[1,'slowly'],[1.8,'Bernardo sneaks'],[2.7,'into the space'],[3.6,'behind the defenders'],[5,'and lifts it'],[6.1,'near post']]},
 {label:'How he does it',text:"Here's how he keeps the ball, even from big defenders. Tiny touches with his left foot, his body in the way. One defender, two... and he wriggles free!",seconds:12.4,
  cues:[[.5,'how he keeps'],[1.9,'big defenders'],[3.2,'Tiny touches'],[4.2,'left foot'],[5,'his body'],[5.8,'in the way'],[7,'One defender'],[8.1,'two'],[9,'wriggles free']]},
 {label:'Your turn',text:'Your turn: keep the ball glued to your foot, and use your body to shield it.',seconds:7.6,
  cues:[[.15,'Your turn'],[1,'keep the ball'],[1.9,'glued'],[2.9,'use your body'],[4.2,'shield it']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py bernardo-silva-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/bernardo-silva-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-bernardo-silva-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/bernardo-silva-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('bernardo: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window: full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
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

// ---------------------------------------------------------------- the Etihad on a May evening: a two-tier bowl, the roof ring and its masts (simplified, inferred)
const CX=52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the pitch-side rim (a rounded rectangle), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.42)];}
const LOW=(b:number):[number,number]=>[1+20*b,1.2+11*b],UP=(b:number):[number,number]=>[23+20*b,14.5+17*b];
type Bowl={low:V3[][];up:V3[][];band:V3[][];roof:V3[][];lamps:[V3,V3][];masts:[V3,V3,V3,V3][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],band:[],roof:[],lamps:[],masts:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW));o.up.push(Q(UP));
  o.band.push([rim(a,21,12.2),rim(b,21,12.2),rim(b,23,14.5),rim(a,23,14.5)]);
  o.roof.push([rim(a,16,35.5),rim(b,16,35.5),rim(b,48,33.5),rim(a,48,33.5)]);
  o.lamps.push([rim(a,16.6,34.9),rim(b,16.6,34.9)]);
  for(const [f,rows,off] of [[LOW,8,0],[UP,7,5000]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+off,11);if(h<.14)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 // the roof masts: tall posts outside the bowl with a cable back to the roof edge (twelve, spaced round the ground)
 for(let m=0;m<12;m++){const a=(m+.5)/12*TAU;o.masts.push([rim(a,56,18),rim(a,56,62),rim(a,30,35),rim(a,48,34)]);}
 return o;})();
/** everything behind the pitch: the evening sky, the bowl, the crowd (roar lifts the seat marks, flash = phones and cameras), the roof,
 * its lamps and masts. empty = the demonstration (no crowd). */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number;empty?:boolean}={}){
 const{roar=0,flash=0,empty=false}=o,tt=twos(t);
 s.field(B,.2,.5);s.field(Y,.14,.5);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D();
 for(let i=0;i<NS;i++){const r1=quadP(c,BOWL.low[i]);if(r1)addPoly(low,r1);const r2=quadP(c,BOWL.up[i]);if(r2)addPoly(up,r2);const r3=quadP(c,BOWL.band[i]);if(r3)addPoly(band,r3);const r4=quadP(c,BOWL.roof[i],10);if(r4)addPoly(roof,r4);}
 // masts behind the roof
 const mast=new Path2D();for(const[a,b,r0,r1] of BOWL.masts){if(toCam(c,a)[2]<20)continue;seg3(c,a,b,1.4,mast);seg3(c,b,r0,.35,mast);seg3(c,b,r1,.35,mast);}
 s.fill(K,mast,.8);
 s.knockout(low);s.tone(B,low,empty?.6:.5);s.tone(K,low,empty?.55:.5);
 s.knockout(up);s.tone(B,up,empty?.55:.45);s.tone(K,up,empty?.62:.58);
 if(!empty){// the crowd: City sky blue, white, navy, a few phone lights (yellow)
  const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
  for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
   const ink=q.h<.52?0:q.h<.8?1:q.h<.96?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
  s.knockout(inks[0],.9);s.fill(B,inks[0],.62);s.knockout(inks[1],.85);s.fill(K,inks[2],.8);s.fill(Y,inks[3],.95);}
 s.knockout(band);s.fill(K,band,.85);
 s.knockout(roof);s.tone(K,roof,.8);s.tone(B,roof,.4);
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+6||toCam(c,b)[2]<NEAR+6)continue;seg3(c,a,b,.8,lamp);seg3(c,a,b,3,glow);}
 s.tone(Y,glow,empty?.2:.3);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0&&!empty){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the grass (yellow × blue) with mowing stripes, boards, paper lines, corner flags and both goals; cones = the demonstration's markers */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ball?:V3;cones?:boolean}={}){
 const sur=polyP(c,[[-9,0,-41],[114,0,-41],[114,0,41],[-9,0,41]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.9);s.tone(K,p,.25);}
 const g=polyP(c,[[-5,0,-38],[110,0,-38],[110,0,38],[-5,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);s.tone(K,gp,.08);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(B,pn,.5);
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
 if(o.cones){const cn=new Path2D();for(const[x,z] of CONES){const a=pr(c,[x-.16,0,z]),b=pr(c,[x+.16,0,z]),t=pr(c,[x,.3,z]),a2=pr(c,[x,0,z-.16]),b2=pr(c,[x,0,z+.16]);if(a&&b&&t&&a2&&b2){cn.addPath(polyPath([a,a2,b,b2],true));cn.addPath(polyPath([a,t,b],true));cn.addPath(polyPath([a2,t,b2],true));}}
  s.knockout(cn);s.fill(Y,cn,.95);s.tone(R,cn,.35);}
 goal3(s,c,0,-1,0,0,1);
 goal3(s,c,105,1,o.bulge??0,o.ball?.[2]??0,o.ball?.[1]??1);
}
/** the demonstration's training cones (two lines either side of the drill) */
const CONES:Pt[]=[[50,-6.5],[54,-6.5],[58,-6.5],[62,-6.5],[66,-6.5],[70,-6.5],[50,7.5],[56,7.5],[62,7.5],[68,7.5]];
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (bz, by) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)-Math.pow((y-by)/1.4,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,1),1,z],.025,mesh,.7);seg3(c,[back(z,1),1,z],[back(z,0),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles; beyond "sky blue" the kits are INFERRED, see the header)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]];
const SKY:InkFill=[B,.5];
/** Manchester City: sky-blue shirts (confirmed: "a blur of sky blue"), white shorts, sky-blue socks, navy trim and numbers (inferred) */
const MCI=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:SKY,shorts:'paper',socks:SKY,boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:K,seed:3,...o});
/** Real Madrid: all white (inferred), navy trim */
const RMA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:K,seed:5,...o});
/** Bernardo: slight (≈1.73 m, slim), dark curly hair, left-footed; No. 20 at City */
const BUILD_B={height:1.73,bulk:.92};
const BERNARDO=MCI({number:20,hairStyle:'curly',hair:K,build:BUILD_B,seed:20});
const KDB=MCI({number:17,hair:[Y,.9],build:{height:1.81},seed:17});
const COURTOIS:AthleteStyle={shirt:Y,shorts:[K,.85],socks:Y,boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.99},seed:1};
/** the demonstration: Bernardo in a plain navy training top, two defenders in red bibs (no club, no match) */
const DEMO_B:AthleteStyle={shirt:K,shorts:K,socks:'paper',boots:K,trim:Y,skin:SKIN_L,hair:K,hairStyle:'curly',line:K,number:null,build:BUILD_B,seed:20};
const BIB=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,trim:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,number:null,build:{height:1.88,bulk:1.08},seed:31,...o});

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- tracks: keyframed positions [τ, X, Z], Hermite-interpolated, tabled at 50 Hz
type Actor={name:string;style:AthleteStyle;keys:number[][];key?:boolean;role:'mci'|'rma'|'gk'|'hero'|'bib'};
type Tab={X:number[];Z:number[];D:number[]};
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const DT=.02;
type Track={actors:Actor[];T0:number;tabs:Tab[]};
function track(actors:Actor[],T0:number,T1:number):Track{return{actors,T0,tabs:actors.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;
 for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};})};}
const samp=(T:Track,arr:number[],tau:number)=>{const u=clamp((tau-T.T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(T:Track,k:number,tau:number):[number,number]=>[samp(T,T.tabs[k].X,tau),samp(T,T.tabs[k].Z,tau)];
const distOf=(T:Track,k:number,tau:number)=>samp(T,T.tabs[k].D,tau);
const velOf=(T:Track,k:number,tau:number):[number,number]=>{const a=posOf(T,k,tau-.08),b=posOf(T,k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(T:Track,k:number,tau:number):[number,number]=>{const a=posOf(T,k,tau),b=posOf(T,k,tau-.3),d=posOf(T,k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(T:Track,k:number,tau:number)=>{const v=velOf(T,k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(T:Track,k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(T,k,tau),y=headingOf(T,k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};

// ---------------------------------------------------------------- THE MATCH (τ = seconds after De Bruyne's through pass)
const WPASS=-2.7,RECV=-1.85,KT1=-.95,PASS=0,MEET=.8,IN_NET=1.3;
const M_ACTORS:Actor[]=[
 {name:'Bernardo',role:'hero',style:BERNARDO,key:true,keys:[[-6.8,76,24],[-4,78.5,23.5],[-2.7,80.3,22.6],[-1.5,82.8,21],[-.6,85.8,18.8],[0,88.6,16.6],[.5,91.6,14.4],[.8,93.1,13.5],[1.2,94.3,13],[1.8,95.5,13.6],[2.8,97.4,16.6],[4.2,99.8,22],[6,101.6,27]]},
 {name:'De Bruyne',role:'mci',style:KDB,key:true,keys:[[-6.8,69,16],[-4,71,15],[-2.7,72.6,14.3],[-1.85,73.8,13.8],[-.95,76.2,12.8],[0,78.8,11.8],[.6,80,11.5],[2,82.2,11.8],[4,86,14],[6,90,18]]},
 {name:'Walker',role:'mci',style:MCI({number:2,skin:SKIN_D,hairStyle:'bald',build:{height:1.83,bulk:1.06},seed:2}),key:true,keys:[[-6.8,58,27.5],[-4.5,62,27.6],[-2.7,65.5,27.2],[-1.5,67.5,26.6],[1,71,26],[4,74,25]]},
 {name:'Haaland',role:'mci',style:MCI({number:9,hair:[Y,.75],hairStyle:'ponytail',build:{height:1.95,bulk:1.1},seed:9}),keys:[[-6.8,88,1],[-2,90,2],[0,92,2.6],[1,93.8,2.2],[2.5,95,2],[6,97,6]]},
 {name:'Grealish',role:'mci',style:MCI({number:10,seed:10}),keys:[[-6.8,84,-21],[-2,86,-19],[0,88,-16],[2,90,-13],[6,94,-6]]},
 {name:'Gündoğan',role:'mci',style:MCI({number:8,skin:SKIN_M,seed:8}),keys:[[-6.8,80,-7],[-2,83,-5],[0,86,-3],[2,88.5,-1.5],[6,92,4]]},
 {name:'Rodri',role:'mci',style:MCI({number:16,seed:16,build:{height:1.91}}),keys:[[-6.8,64,3],[-2,68,4],[2,72,5],[6,76,7]]},
 {name:'Stones',role:'mci',style:MCI({number:5,seed:5}),keys:[[-6.8,60,10],[-2,64,10],[2,68,10],[6,70,10]]},
 {name:'Dias',role:'mci',style:MCI({number:3,seed:33}),keys:[[-6.8,50,-4],[2,57,-3],[6,60,-2]]},
 {name:'Akanji',role:'mci',style:MCI({number:25,skin:SKIN_D,seed:25}),keys:[[-6.8,50,-16],[2,57,-14],[6,60,-12]]},
 {name:'Camavinga',role:'rma',style:RMA({skin:SKIN_D,hairStyle:'curly',seed:12}),key:true,keys:[[-6.8,80,20],[-2.7,82.5,19],[-1,84.2,18],[0,86.3,17],[.5,88.5,16],[.8,89.8,15.4],[1.3,91.2,14.6],[2.5,92.5,14.5],[6,94,15]]},
 {name:'Militão',role:'rma',style:RMA({skin:SKIN_M,seed:13,build:{height:1.86}}),keys:[[-6.8,89,8],[-2,90,7.5],[0,91,6.8],[.8,92.4,7.4],[2,93.8,8],[6,95,8]]},
 {name:'Alaba',role:'rma',style:RMA({skin:SKIN_D,seed:14}),keys:[[-6.8,89,-1],[-2,90,-.5],[0,91,0],[2,93,1],[6,95,2]]},
 {name:'Carvajal',role:'rma',style:RMA({seed:15}),keys:[[-6.8,88,-14],[-2,89,-12.5],[0,90,-11],[2,92,-9],[6,94,-6]]},
 {name:'Kroos',role:'rma',style:RMA({hair:[Y,.6],seed:16}),keys:[[-6.8,78,5],[-2,80,5.5],[0,82,6],[2,84,7.5],[6,88,9]]},
 {name:'Modrić',role:'rma',style:RMA({hair:[Y,.45],hairStyle:'long',build:{height:1.72,bulk:.92},seed:17}),keys:[[-6.8,74,-3],[-2,77,-2],[0,79,-1],[2,81,1],[6,84,3]]},
 {name:'Valverde',role:'rma',style:RMA({seed:18}),keys:[[-6.8,76,-12],[-2,79,-11],[0,81,-10],[2,83,-8],[6,86,-5]]},
 {name:'Vinícius',role:'rma',style:RMA({skin:SKIN_D,seed:19}),keys:[[-6.8,66,23],[-2,70,23],[0,73,22.5],[2,76,22],[6,80,21]]},
 {name:'Benzema',role:'rma',style:RMA({skin:SKIN_M,seed:20}),keys:[[-6.8,60,-2],[2,66,0],[6,70,1]]},
 {name:'Rodrygo',role:'rma',style:RMA({skin:SKIN_M,seed:21}),keys:[[-6.8,62,-18],[2,68,-15],[6,72,-12]]},
 {name:'Courtois',role:'gk',style:COURTOIS,key:true,keys:[[-6.8,101.5,1.8],[-2,102,1.6],[0,102.6,1.4],[.6,103,1.3],[3,103,1.3]]},
];
const MT=track(M_ACTORS,-7,8);
const MIX=(n:string)=>M_ACTORS.findIndex(a=>a.name===n);
const BER=MIX('Bernardo'),DEB=MIX('De Bruyne'),WAL=MIX('Walker'),CAM=MIX('Camavinga'),GK=MIX('Courtois'),MIL=MIX('Militão'),ALA=MIX('Alaba');
const WALK_P=footSpot(MT,WAL,WPASS,'r',.5);
const RECV_P=footSpot(MT,DEB,RECV,'r',.45);
const KT1_P=footSpot(MT,DEB,KT1,'r',.55);
const PASS_P=footSpot(MT,DEB,PASS,'r',.45);
const MEET_P=footSpot(MT,BER,MEET,'l',.42,.16);
/** the finish: lifted inside the near corner (near post z = +3.66); the exact spot is inferred */
const NET_P:V3=[105.3,2.02,3.1],REST_P:V3=[106.3,.11,2.6];
function ballM(tau:number):V3{
 if(tau<WPASS){const[x,z]=footSpot(MT,WAL,tau,'r',.5+.12*Math.abs(Math.sin(tau*2.6)));return[x,.11,z];}
 if(tau<RECV)return roll([WALK_P[0],.11,WALK_P[1]],[RECV_P[0],.11,RECV_P[1]],(tau-WPASS)/(RECV-WPASS),.25);
 if(tau<KT1){const u=(tau-RECV)/(KT1-RECV),e=1-(1-u)*(1-u);return[lerp(RECV_P[0],KT1_P[0],e),.11,lerp(RECV_P[1],KT1_P[1],e)];}
 if(tau<PASS){const u=(tau-KT1)/(PASS-KT1),e=1-(1-u)*(1-u);return[lerp(KT1_P[0],PASS_P[0],e),.11,lerp(KT1_P[1],PASS_P[1],e)];}
 if(tau<MEET)return roll([PASS_P[0],.11,PASS_P[1]],[MEET_P[0],.11,MEET_P[1]],(tau-PASS)/(MEET-PASS),.25);
 if(tau<IN_NET){const u=(tau-MEET)/(IN_NET-MEET),b=lerp3([MEET_P[0],.11,MEET_P[1]],NET_P,u);return[b[0],b[1]+.5*Math.sin(Math.PI*u),b[2]];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);const b=lerp3(NET_P,REST_P,e);return[b[0],b[1]+.25*Math.sin(Math.PI*Math.min(1,u*1.3))*(1-u),b[2]];
}
const bulgeM=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the base gait from speed: stand / jog / sprint, or a backpedal when moving backwards */
function gait(T:Track,k:number,tau:number,idle:Pose):{p:Pose;yaw:number;sp:number}{
 const v=velOf(T,k,tau),sp=Math.hypot(v[0],v[1]);let yaw=sp>.5?yawOf(v[0],v[1]):0;const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(T,k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(T,k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 return{p,yaw,sp};}
function poseM(k:number,tau:number):{p:Pose;yaw:number}{
 const a=M_ACTORS[k],[x,z]=posOf(MT,k,tau),b=ballM(tau);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='rma'?READY:stand();
 let{p,yaw,sp}=gait(MT,k,tau,idle);if(sp<=.5||a.role==='rma'&&sp<3)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===WAL){const D=.8,u=(tau-(WPASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),inWin(u));yaw=lerpA(yaw,yawOf(RECV_P[0]-x,RECV_P[1]-z),.6*inWin(u));}}
 if(k===DEB){
  if(tau>WPASS&&tau<RECV)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.5);
  p=over(p,{rHipF:34,rKnee:26,rAnk:34,rHipR:10},bump(RECV-.16,RECV+.12,tau)+bump(KT1-.16,KT1+.1,tau));
  p=over(p,{neckP:-8,neckY:-24,twist:-6},bump(KT1+.1,PASS-.1,tau)*.9);
  const D=.75,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.5}),inWin(u));yaw=lerpA(yaw,yawOf(MEET_P[0]-x,MEET_P[1]-z),.6*inWin(u));}
  if(tau>IN_NET+.5)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.5,IN_NET+1,tau));}
 if(k===BER){
  // looks for the pass over his right shoulder as he runs in behind, then strikes first time with the LEFT foot (inferred)
  p=over(p,{neckY:-40,neckP:-4,twist:-8},bump(-1.6,.5,tau)*.8);
  const D=.8,u=(tau-(MEET-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.85}),inWin(u));yaw=lerpA(yaw,yawOf(NET_P[0]-x,NET_P[2]-z)-.25,.8*inWin(u));}
  if(tau>IN_NET+.35){p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(IN_NET+.35,IN_NET+.9,tau));}}
 if(k===GK){yaw=yawOf(b[0]-x,b[2]-z);const u=(tau-(MEET+.1))/.85;if(u>0){p=keeperDive(Math.min(1,u),{side:'l',height:.85});yaw=Math.PI;}}
 if(a.role==='mci'&&k!==DEB&&k!==WAL&&tau>IN_NET+.7)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.7,IN_NET+1.2,tau));
 if(a.role==='rma'&&tau>IN_NET+.8)p=over(p,{lean:40,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.8,IN_NET+1.6,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- THE DEMONSTRATION (τ = seconds into the drill; centre of the pitch, attacking +X)
const W1=3.3,DRAG=4.62,PUSH=5.02,LUNGE1=3.36,LUNGE2=4.86;
const D_ACTORS:Actor[]=[
 {name:'Bernardo',role:'hero',style:DEMO_B,key:true,keys:[[-1.6,49.2,1],[0,53.6,1.1],[1,56.6,1.25],[1.6,58.1,1.3],[2.2,58.8,.8],[2.8,59.3,.1],[3.2,59.6,-.4],[3.6,60.7,-1.4],[4,62.2,-2],[4.4,63.7,-2.1],[4.7,64.4,-1.9],[5,65,-1.2],[5.3,66.3,-.2],[5.7,68.6,.6],[6.3,72,1],[7.2,77,1.2],[9,86,1.4]]},
 {name:'Defender one',role:'bib',style:BIB({seed:31}),key:true,keys:[[-1.6,68,7],[0,65,5.4],[1,61.6,3.6],[1.6,59.6,2.6],[2.2,59.8,1.9],[2.8,60.1,1.2],[3.2,60.3,.8],[3.7,60.6,-.1],[4.4,61,-.6],[5.4,61.6,-.6],[7,63,0],[9,65,.5]]},
 {name:'Defender two',role:'bib',style:BIB({seed:37,skin:SKIN_M,build:{height:1.9,bulk:1.1}}),key:true,keys:[[-1.6,76,-5],[1,73,-4.4],[2.5,70.4,-3.6],[3.6,68.4,-2.9],[4.4,66.9,-2.4],[4.8,66.4,-2.2],[5.3,66.2,-2],[6,66,-1.4],[7.2,67,-.5],[9,70,0]]},
];
const DTK=track(D_ACTORS,-1.8,9.2);
const DB=0,D1=1,D2=2;
/** Bernardo's body direction (degrees, + = turned left toward −Z): square to the drill, then turned so his back meets defender one */
const YAW_K:[number,number][]=[[-1.8,0],[1.2,4],[1.8,40],[3.1,48],[3.45,24],[4.3,4],[4.7,-8],[5.05,-36],[5.5,-16],[6.2,0],[9.2,0]];
const keyed=(K:[number,number][],t:number)=>{if(t<=K[0][0])return K[0][1];for(let i=0;i+1<K.length;i++){const[a,va]=K[i],[b,vb]=K[i+1];if(t<b){const u=(t-a)/(b-a);return va+(vb-va)*u*u*(3-2*u);}}return K[K.length-1][1];};
const yawB=(tau:number)=>keyed(YAW_K,tau)*RAD;
/** where the ball sits relative to his body [ahead, side] (side − = his LEFT): glued to the left foot, tucked away from the defender while
 * shielding, rolled on, dragged back, pushed past with the inside of the left foot */
const AHEAD_K:[number,number][]=[[-1.8,.55],[1.2,.5],[1.8,.22],[3.1,.2],[3.35,.5],[3.6,.72],[4.3,.55],[4.6,.08],[4.85,.18],[5.05,.66],[5.4,.8],[6.2,.7],[9.2,.7]];
const SIDE_K:[number,number][]=[[-1.8,-.14],[1.2,-.16],[1.8,-.42],[3.1,-.45],[3.35,-.36],[3.6,-.16],[4.3,-.13],[4.6,-.22],[4.85,-.12],[5.05,.26],[5.4,.1],[6.2,0],[9.2,0]];
/** the little dribble rhythm: a touch every short stride while he runs with it (not while shielding) */
const touchPush=(tau:number)=>{const run=1-bump(1.5,3.3,tau)*1-bump(4.4,5.2,tau);if(run<=.02)return 0;const ph=distOf(DTK,DB,tau)/1.15;const e=((ph-.97)%1+1)%1;return run*.16*Math.pow(1-e,1.4);};
function ballD(tau:number):V3{const[x,z]=posOf(DTK,DB,tau),y=yawB(tau),a=keyed(AHEAD_K,tau)+touchPush(tau),sd=keyed(SIDE_K,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)];
 // the shield: little sole rolls under the left boot
 const roll2=bump(1.8,3.15,tau)*.06*Math.sin(tau*TAU*1.6);
 return[x+f[0]*(a+roll2)+r[0]*sd,.11,z+f[1]*(a+roll2)+r[1]*sd];}
/** the shield: low, wide, knees bent, right arm out to feel the defender, eyes on the ball at his left foot */
const SHIELD:Partial<Pose>={lean:22,pitch:6,twist:-14,bend:-6,rHipF:34,rKnee:52,rHipA:22,lHipF:24,lKnee:42,lHipA:14,lAnk:-10,rShA:66,rShF:16,rElb:30,rShR:-10,lShA:38,lShF:10,lElb:52,neckP:34,neckY:22};
/** the wriggle off defender one: the left sole rolls the ball on and he spins out of the contact */
const WRIG:Partial<Pose>={lHipF:48,lKnee:30,lAnk:-16,lHipA:-6,twist:-24,lean:26,rShA:72,rElb:30,lShA:50,neckY:10,neckP:26};
/** the drag-back: left sole pulls the ball back under him */
const DRAGP:Partial<Pose>={lHipF:-8,lKnee:46,lAnk:-24,rKnee:40,rHipF:32,lean:8,pitch:-2,lShA:52,rShA:52,lElb:40,rElb:40,neckP:32};
/** the push past: inside of the left foot, across his body */
const PUSHP:Partial<Pose>={lHipF:34,lHipA:-24,lHipR:46,lKnee:24,lAnk:4,twist:18,lean:18,rShA:46,lShA:60,neckP:22};
/** a defender pressing into his back */
const PRESS:Partial<Pose>={lean:26,pitch:4,rShF:52,lShF:40,rElb:34,lElb:50,rShA:30,lShA:24,lKnee:44,rKnee:40,lHipF:30,rHipF:30,neckP:24};
function poseD(k:number,tau:number):{p:Pose;yaw:number}{
 const[x,z]=posOf(DTK,k,tau),b=ballD(tau);
 if(k===DB){const v=velOf(DTK,k,tau),sp=Math.hypot(v[0],v[1]),s=clamp((sp-2.5)/5),dist=distOf(DTK,k,tau);
  let p=blendPose(stand(),blendPose(dribble(dist/1.15,{foot:'l',speed:.5}),runCycle(dist/(2.4+1.5*s),{speed:s}),sm(3.6,6.5,sp)),clamp((sp-.3)/.8));
  const sw=bump(1.55,3.3,tau)>0?Math.min(1,bump(1.55,3.3,tau)*1.6):0;
  p=over(p,SHIELD,sw);p=over(p,{lHipF:24+10*Math.sin(tau*TAU*1.6),lHipA:14+6*Math.sin(tau*TAU*1.6+1)},sw*.9);
  p=over(p,WRIG,bump(3.08,3.6,tau));
  p=over(p,DRAGP,bump(4.38,4.84,tau));
  p=over(p,PUSHP,bump(4.86,5.26,tau));
  return{p,yaw:yawB(tau)};}
 const g=gait(DTK,k,tau,READY);let p=g.p,yaw=yawOf(b[0]-x,b[2]-z);
 if(k===D1){p=over(p,PRESS,Math.min(1,bump(1.4,3.35,tau)*1.5));
  const u=(tau-(LUNGE1-.6*.9))/.9;if(u>0&&u<1.5){const s=Math.sin(yaw)*(b[0]-x)+Math.cos(yaw)*(b[2]-z)>0?'r':'l';p=blendPose(p,lunge(Math.min(1,u),{side:s}),inWin(u));}
  if(tau>LUNGE1+.5)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.5);}
 if(k===D2){const u=(tau-(LUNGE2-.6*.9))/.9;if(u>0&&u<1.5){p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),inWin(u));yaw=lerpA(yaw,yawOf(1,.35),.5*inWin(u));}}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: white with navy star panels (the Champions League ball, simplified)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D();for(let i=0;i<5;i++){const a=rot+i/5*TAU,d=r*(i%2?.58:.34),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d,w=r*.22,q:Pt[]=[];for(let j=0;j<10;j++){const b=a+j/10*TAU,rr=j%2?w*.45:w;q.push([cx+Math.cos(b)*rr,cy+Math.sin(b)*rr]);}pan.addPath(polyPath(q,true));}
 s.fill(K,pan,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing a play through a camera
type Play={T:Track;ball:(tau:number)=>V3;pose:(k:number,tau:number)=>{p:Pose;yaw:number}};
const MATCH:Play={T:MT,ball:ballM,pose:poseM},DEMO:Play={T:DTK,ball:ballD,pose:poseD};
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,P:Play,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;smear?:boolean;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=-1}=o,A=P.T.actors;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 A.forEach((_,k)=>{const[x,z]=posOf(P.T,k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=P.ball(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,A[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=A[e.k],{p,yaw}=P.pose(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===hero||e.h>520)&&!passing?{prev:P.pose(e.k,tauPrev).p,smear:e.k===hero&&o.smear!==false}:{});
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a ring standing upright in the goal mouth (the plane x = X), around (y, z) */
function ringUp(s:Sheet,c:Cam,X:number,y:number,z:number,rad:number,w:number,seed=49){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[X,y+Math.sin(a)*rad*(.7+.3*w),z+Math.cos(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[X,y,z])*.13),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(Y,rr,.95*w);}
/** a cross (✗) at a screen point: "blocked" */
function crossAt(s:Sheet,p:Pt|null,L:number,w:number){if(!p||w<=.02)return;const q=new Path2D(),l=L*w;
 for(const[dx,dy] of [[1,1],[1,-1]] as Pt[])q.addPath(ribbon([[p[0]-dx*l,p[1]-dy*l],[p[0]+dx*l,p[1]+dy*l]],Math.max(5,L*.28),{seed:71+dx*3+dy,taper:.1,wobble:.8}));
 s.knockout(q,.9);s.fill(R,q,.95);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61,dashed=false){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(6,c.F*.16/d);
 if(!dashed){s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);}
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,dashed?seg[0]:a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3,dashed});}
/** a 3D polyline arrow (the ball's flight) */
function flight(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,seed=81){if(w<=.02)return;const sp:Pt[]=[];let d=1;for(const P of pts){const q=toCam(c,P);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(5,c.F*.12/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.6}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.6}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
const runPts=(T:Track,k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(T,k,lerp(ta,tb,i/n)));return o;};
const passPts=(n=12):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const u=i/n;o.push([lerp(PASS_P[0],MEET_P[0],u),lerp(PASS_P[1],MEET_P[1],u)]);}return o;};
const shotPts=(n=12):V3[]=>{const o:V3[]=[];for(let i=0;i<=n;i++)o.push(ballM(lerp(MEET+.001,IN_NET-.001,i/n)));return o;};
/** the back line at τ: a dashed red line on the grass through the Madrid defenders nearest the ball side */
function backLine(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;const pts:[number,number][]=[CAM,MIL,ALA].map(k=>posOf(MT,k,tau));pts.sort((a,b)=>b[1]-a[1]);
 const sp:Pt[]=[];const a=pts[0],b=pts[pts.length-1];for(let i=0;i<=10;i++){const u=i/10,q=pr(c,[lerp(a[0],b[0],u),.02,lerp(a[1]+1.5,b[1]-1.5,u)]);if(q)sp.push(q);}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),wd=Math.max(4,kAt(c,[a[0],0,a[1]])*.09);laneArrow(s,R,sp[0],sp[n-1],wd,{dashed:true,seed:57,head:.01});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'goal');return key(t,mono([[0,-6.2],[CUEW(0,'City pass'),-2.95],[CUEW(0,'on the right'),-2.2],[CUEW(0,'De Bruyne'),-1],[CUEW(0,'slides it'),-.05],[CUEW(0,'Bernardo Silva'),.4],[CUEW(0,'is in'),.72],[CUEW(0,'near post'),MEET+.25],[G,IN_NET+.05],[S+1,IN_NET+.05+(S+1-G)*.9]]),linear);};
const CAM1:V3=[60,19,80];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'goal'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballM(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const cel=posOf(MT,BER,tau),toC=sm(G+.5,G+1.8,t,easeInOutSine);
 const far=1-sm(-2.4,.6,tau),T=lerp3([bt[0]+3+4*far,1.6+2*far,bt[2]*.8-5-9*far],[cel[0]-2,1.4,cel[1]-3],toC);
 const F=key(t,[[0,5000],[CUEW(0,'City pass'),5500],[CUEW(0,'De Bruyne'),5800],[CUEW(0,'near post'),6400],[G,6800],[G+1.4,7800],[S,8200]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeM(tau),ball:NET_P});
  play(s,c,v,MATCH,tau,tp,tau1(twos(t)-1/12),{minBall:9,hero:BER});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(MT,BER,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:10.6,
};

// ---------------------------------------------------------------- 2 · slow replay, raised behind Bernardo's run: into the space behind, lifted into the near post
const tau2=(t:number)=>key(t,mono([[0,-1.9],[CUEW(1,'Bernardo sneaks'),-1.25],[CUEW(1,'into the space'),-.55],[CUEW(1,'behind the'),-.05],[CUEW(1,'and lifts'),MEET-.12],[CUEW(1,'near post'),IN_NET-.02],[SECS(1),IN_NET+.3]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(MT,BER,Math.min(tau,MEET+.2)),open=1-sm(0,1.2,t,easeInOutSine),toGoal=sm(CUEW(1,'and lifts')-.6,CUEW(1,'near post')+.2,t,easeInOutSine);
 const C:V3=[m[0]-9.5+2.5*open+2*toGoal,3.6+.6*open,m[1]+6.5-1.5*toGoal],T:V3=[lerp(lerp(m[0],MEET_P[0],.5)+3,103.5,.55*toGoal),lerp(.4,1.3,toGoal),lerp(lerp(m[1],MEET_P[1],.5)-2.5,3,.55*toGoal)];
 return look(C,T,2150-250*open-150*toGoal);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),is=CUEW(1,'into the space'),bd=CUEW(1,'behind the'),al=CUEW(1,'and lifts'),np=CUEW(1,'near post'),E=SECS(1);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)*.6});
  ground(s,c,{bulge:bulgeM(tau),ball:NET_P});
  play(s,c,v,MATCH,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:BER,under:()=>{
   // "into the space": the yellow target in behind, his run to it, the low pass lane into it
   const sw=sm(is-.2,is+.25,t,easeOutBack)*(1-sm(E-.8,E-.4,t));
   ring(s,c,MEET_P[0],MEET_P[1],1.6,sw*(1-sm(al+.3,al+.8,t)),Y,45);
   groundArrow(s,c,runPts(MT,BER,-1.6,MEET),sm(CUEW(1,'Bernardo sneaks')-.1,is+.4,t,easeOut)*(1-sm(al,al+.5,t)),B,63);
   groundArrow(s,c,passPts(),sm(bd-.1,bd+.5,t,easeOut)*(1-sm(al+.2,al+.6,t)),Y,65);
   // "behind the defenders": their line, dashed red
   backLine(s,c,Math.min(tau,.1),sm(bd-.2,bd+.4,t,easeOut)*(1-sm(al,al+.4,t)));},
   after:()=>{
    // "and lifts it": the flight, up into the near corner; "near post": the yellow ring on it
    flight(s,c,shotPts(),sm(al-.05,al+.5,t,easeOut)*(1-sm(E-.6,E-.3,t)),Y,83);
    ringUp(s,c,105,NET_P[1],NET_P[2],.7,sm(np-.25,np+.2,t,easeOutBack)*(1-sm(E-.6,E-.3,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(MT,BER,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:5.4,
};

// ---------------------------------------------------------------- 3 · the demonstration, from a raised side camera: tiny touches, the shield, two defenders, free
const tau3=(t:number)=>{const S=SECS(2),wf=CUEW(2,'wriggles');return key(t,mono([[0,-1.2],[CUEW(2,'Tiny touches'),1.1],[CUEW(2,'left foot'),1.5],[CUEW(2,'his body'),1.95],[CUEW(2,'in the way'),2.55],[CUEW(2,'One defender'),W1],[CUEW(2,'two'),DRAG+.05],[wf,PUSH+.2],[S,PUSH+.2+(S-wf)*.8]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(DTK,DB,tau),S=SECS(2),open=1-sm(0,1.4,t,easeInOutSine),tight=bump(CUEW(2,'Tiny')-.4,CUEW(2,'One defender')+.3,t);
 const C:V3=[m[0]-3.2,4.6+1.2*open-.8*tight,m[1]+10.5+3*open-1.8*tight],T:V3=[m[0]+1.6,.75,m[1]-.4];
 return look(C,T,2250-300*open+250*tight-150*sm(S-2,S,t));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),tt=CUEW(2,'Tiny touches'),lf=CUEW(2,'left foot'),hb=CUEW(2,'his body'),od=CUEW(2,'One defender'),tw=CUEW(2,'two'),wf=CUEW(2,'wriggles'),E=SECS(2);
  stadium(s,c,v,t,{empty:true});
  ground(s,c,{cones:true});
  play(s,c,v,DEMO,tau,tp,tau3(twos(t)-1/12),{minBall:6,hero:DB,after:({joints})=>{
   // "Tiny touches ... left foot": a small yellow spark on each touch while he dribbles, a ring on the left boot
   const b=ballD(tau),q=pr(c,b);
   if(q&&t>tt-.2&&t<hb){const e=((distOf(DTK,DB,tau)/1.15-.97)%1+1)%1;if(e<.35)sparkBurst(s,Y,q[0],q[1],kAt(c,b)*.45,{n:6,seed:90+Math.floor(distOf(DTK,DB,tau)/1.15),g:easeOutBack(clamp(e/.12))*(1-clamp((e-.2)/.15)),width:6});}
   const r=joints.get(DB);const lw=sm(lf-.2,lf+.2,t,easeOutBack)*(1-sm(hb+.1,hb+.5,t));
   if(r&&lw>.02){const toe=r.joints.lToe,z=Math.max(8,kAt(c,b)*.35),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([toe[0]+Math.cos(a)*z*(.7+.3*lw),toe[1]+Math.sin(a)*z*.6*(.7+.3*lw)]);}const rr=ribbon(pts,Math.max(4,z*.22),{close:true,seed:44,taper:0,wobble:1});s.knockout(rr,.9*lw);s.fill(Y,rr,.95*lw);}
   // "his body in the way": a blue arc between the defender and the ball
   const sw=sm(hb-.1,hb+.4,t,easeOut)*(1-sm(od-.2,od+.2,t));if(sw>.02)shieldWall(s,c,tau,sw);
   // "One defender, two": each one's lunge crossed out (red ✗ where the ball was)
   const x1=sm(od+.1,od+.35,t,easeOutBack)*(1-sm(tw-.3,tw,t)),x2=sm(tw+.35,tw+.6,t,easeOutBack)*(1-sm(E-1.2,E-.8,t));
   if(x1>.02){const[dx,dz]=posOf(DTK,D1,LUNGE1),P:V3=[dx+.9,.3,dz-1.1];crossAt(s,pr(c,P),kAt(c,P)*.32,x1);}
   if(x2>.02){const[dx,dz]=posOf(DTK,D2,LUNGE2),P:V3=[dx-.8,.3,dz+.6];crossAt(s,pr(c,P),kAt(c,P)*.32,x2);}
   // "wriggles free": speed lines off his back
   const rw=sm(wf-.1,wf+.3,t)*(1-sm(E-.8,E-.3,t));if(rw>.02){const[mx,mz]=posOf(DTK,DB,tau),q1=pr(c,[mx,1.1,mz]),q2=pr(c,[mx+1,1.1,mz]);if(q1&&q2){const dir=Math.atan2(q2[1]-q1[1],q2[0]-q1[0]),z=kAt(c,[mx,1,mz]);for(const k of[0,1,2])s.fill(K,ribbon([[q1[0]-Math.cos(dir)*z*(.6+k*.25),q1[1]-Math.sin(dir)*z*(.6+k*.25)-z*(.5-k*.4)],[q1[0]-Math.cos(dir)*z*(1.6+k*.4),q1[1]-Math.sin(dir)*z*(1.6+k*.4)-z*(.5-k*.4)]],z*.05,{seed:9+k,taper:.9,wobble:.5}),.6*rw);}}}});
  streaks(s,v,1-sm(0,.5,t),27);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(DTK,DB,tau3(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:6,
};
/** the body shield: an arc of blue wall on the defender's side of him (half a ring, standing 1.4 m), ball tucked on the far side */
function shieldWall(s:Sheet,c:Cam,tau:number,w:number){
 const[x,z]=posOf(DTK,DB,tau),[dx,dz]=posOf(DTK,D1,tau),a0=Math.atan2(dz-z,dx-x),rad=.75,H=1.45*w,base:V3[]=[],top:V3[]=[];
 for(let i=0;i<=12;i++){const a=a0-1.25+2.5*i/12;base.push([x+Math.cos(a)*rad,0,z+Math.sin(a)*rad]);top.push([x+Math.cos(a)*rad,H,z+Math.sin(a)*rad]);}
 const q=polyP(c,[...base,...top.slice().reverse()]);if(q.length<3)return;const p=polyPath(q,true);s.tone(B,p,.42*w);
 const edge:Pt[]=[];for(const P of top){const e=pr(c,P);if(e)edge.push(e);}if(edge.length>2)s.fill(B,ribbon(edge,Math.max(4,kAt(c,[x,1,z])*.07),{seed:52,taper:.2,wobble:.8}),.9*w);
 const gnd:Pt[]=[];for(const P of base){const e=pr(c,P);if(e)gnd.push(e);}if(gnd.length>2)s.fill(B,ribbon(gnd,Math.max(4,kAt(c,[x,0,z])*.09),{seed:53,taper:.2,wobble:.8}),.9*w);
}

// ---------------------------------------------------------------- 4 · the lesson, low on the ball side: glued to the foot, body in the way, the reach blocked
const tau4=(t:number)=>key(t,mono([[0,1.35],[CUEW(3,'keep the ball'),1.6],[CUEW(3,'glued'),1.85],[CUEW(3,'use your body'),2.25],[CUEW(3,'shield it'),2.75],[SECS(3)-.8,3.15],[SECS(3),3.5]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(DTK,DB,tau),push=sm(0,1.4,t,easeInOutSine);
 const C:V3=[m[0]+4.6-1*push,2.3,m[1]-6.6+1.4*push],T:V3=[m[0]+.2,.72,m[1]+.3];
 return look(C,T,1950+250*push);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),kb=CUEW(3,'keep the ball'),gl=CUEW(3,'glued'),ub=CUEW(3,'use your body'),si=CUEW(3,'shield it'),E=SECS(3);
  stadium(s,c,v,t,{empty:true});
  ground(s,c,{cones:true});
  play(s,c,v,DEMO,tau,tp,tau4(twos(t)-1/12),{minBall:6,hero:DB,smear:false,after:({joints})=>{
   const b=ballD(tau),q=pr(c,b),r=joints.get(DB);
   // "glued to your foot": a yellow ring round ball and left boot, tied by a dashed yellow line
   const gw=sm(gl-.25,gl+.2,t,easeOutBack)*(1-sm(E-.7,E-.3,t));
   if(q&&gw>.02){const z=Math.max(10,kAt(c,b)*.3);const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*z*(.7+.3*gw),q[1]+Math.sin(a)*z*(.7+.3*gw)]);}
    const rr=ribbon(pts,Math.max(4,z*.2),{close:true,seed:46,taper:0,wobble:1});s.knockout(rr,.9*gw);s.fill(Y,rr,.95*gw);
    if(r)laneArrow(s,Y,r.joints.lToe,[lerp(r.joints.lToe[0],q[0],gw),lerp(r.joints.lToe[1],q[1],gw)],Math.max(3,z*.12),{dashed:true,seed:47,head:.01});}
   // "keep the ball": a spark at the touch
   const age=t-kb;if(q&&age>-.1&&age<.6)sparkBurst(s,Y,q[0],q[1],kAt(c,b)*.5,{n:7,seed:93,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.35)/.25)),width:7});
   // "use your body": the blue wall on the defender's side
   const sw=sm(ub-.15,ub+.35,t,easeOut)*(1-sm(E-.5,E-.2,t));if(sw>.02)shieldWall(s,c,tau,sw);
   // "shield it": the defender's reach (red) stops at the wall — ✗
   const rw=sm(si-.2,si+.2,t,easeOut)*(1-sm(E-.5,E-.2,t)),d=joints.get(D1);
   if(d&&q&&rw>.02){const h=d.joints.rHa,[bx,bz]=posOf(DTK,DB,tau),[dx,dz]=posOf(DTK,D1,tau),l=Math.hypot(dx-bx,dz-bz)||1,wallP:V3=[bx+(dx-bx)/l*.75,.9,bz+(dz-bz)/l*.75],wp=pr(c,wallP);
    if(wp){laneArrow(s,R,h,[lerp(h[0],wp[0],rw),lerp(h[1],wp[1],rw)],Math.max(4,kAt(c,wallP)*.06),{seed:58,head:Math.max(10,kAt(c,wallP)*.2)});crossAt(s,wp,kAt(c,wallP)*.2,sm(si+.15,si+.45,t,easeOutBack)*(1-sm(E-.5,E-.2,t)));}}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'bernardo-silva-signature',format:'11v11',title:"Bernardo's Close-Control Wriggle",theme:'Keep the ball glued to your foot and use your body to shield it',
 ageNote:'Champions League semi-final, Manchester City 4–0 Real Madrid, Etihad Stadium, 17 May 2023 (his first goal, 23rd minute), then a demonstration of his close control. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];a.addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
