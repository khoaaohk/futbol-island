/** Iconic-play film · Martín Zubimendi, "Signature: the calm holding midfielder". A RisoStory (chapters mode) played by the card's
 * picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, printed as a riso sheet from WRITTEN accounts (the footage itself was
 * not reviewed).
 * LEAD: once public/plays/narration/zubimendi-signature/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/zubimendi-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cue words).
 *
 * THE REAL MATCH: Spain 2–1 England, UEFA Euro 2024 final, Olympiastadion, Berlin, Sunday 14 July 2024, 21:00 CEST (a night match).
 * WHY THIS MATCH: it is Zubimendi's best-documented big night as Spain's holding midfielder — Rodri (16), Spain's "midfield linchpin",
 * was hurt in the first half and Zubimendi (18) replaced him at half time; Spain then won the final (Guardian: "Rodri going off injured at
 * half-time made no difference, with Martin Zubimendi a fine replacement for the midfield linchpin").
 * HONEST NOTE (fallback mode, BRIEF "Signature-move players"): the card's lesson is about POSITIONING — standing in the lane so a forward
 * pass has to go through you. No written source we could read describes one Zubimendi interception move by move (the written moments of
 * his final are a break he led in the 53rd minute and his part in the build-up to Nico Williams's goal — another player's goal, which we do
 * not restage). So the film NEVER stages a play inside the match. Chapter 1 shows only confirmed things: the Olympiastadion at night, the
 * half-time change (16 off, 18 on) and the 2–1 result. The move is a separate, clearly labelled demonstration ("This is how he does it",
 * chapters 2–3) on a neutral training pitch in training kit (a white top with his Arsenal 36, a white-topped team-mate, two opponents in
 * red bibs); the lesson (chapter 4) replays the demonstration with teaching marks. The demonstration draws the trait the sources describe
 * (a defensive midfielder compared with Sergio Busquets, "composure and control", "precise decision-making", starting play from deep) and
 * the card's lesson — not any particular match moment.
 *
 * SOURCES (fetched Sept 2026 with curl + a generic UA, cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "UEFA Euro 2024 final" (raw; cache wiki-euro2024-final.txt): 14 July 2024, Olympiastadion Berlin, 21:00 CEST; Spain 2–1
 *    England (Williams 47', Palmer 73', Oyarzabal 86'), 0–0 at half time; "Rodri suffered a hamstring injury in the first half and was
 *    substituted off, replaced by Martín Zubimendi, at half time"; line-ups (Rodri CM 16 off 46', Zubimendi MF 18 on 46'); "Zubimendi then
 *    led a break in the 53rd minute, with Stones tactically fouling him"; kits from UEFA's line-up sheet: Spain red shirts, dark-blue
 *    shorts (004080), red socks; England white shirts, blue shorts (003399), white socks. https://en.wikipedia.org/wiki/UEFA_Euro_2024_final
 *  - The Guardian match report, David Hytner, 14 July 2024 (cache guardian-esp-eng-2024-final-report.txt): "Rodri going off injured at
 *    half-time made no difference, with Martin Zubimendi a fine replacement for the midfield linchpin"; "The pressing from Kane and Foden
 *    disintegrated, enabling Zubimendi to slip through midfield" (the 47th-minute goal's build-up — not restaged).
 *    https://www.theguardian.com/football/article/2024/jul/14/spain-england-euro-2024-final-european-championship-football
 *  - Wikipedia, "Martín Zubimendi" (raw; cache wiki-martin-zubimendi.txt): defensive midfielder, 1.81 m, Real Sociedad 2019–2025, Arsenal
 *    2025– (club number 36); came off the bench in the Euro 2024 final; Style of play: compared with Sergio Busquets, "composure and
 *    control, guiding plays and adjusting the game's tempo", "initiating plays from deep positions, displaying precise decision-making".
 *  - The approved film lib/plays/riso/cucurella-signature.ts (same final): the Olympiastadion drawn as a sunken oval bowl with the blue
 *    running track and the roof ring open over the Marathon Gate; the same kits.
 *  - lib/town/playerAppearance.json (light skin, short dark hair, no facial hair; country Spain) and lib/town/playerCareers.json
 *    (Real Sociedad 2019–2025, Arsenal 2025–, Spain 2021–).
 * CONFIRMED: the match, date, ground, night kick-off; 0–0 at half time; Rodri (16) off and Zubimendi (18) on at half time; the 2–1 final
 *  score; the kits (Spain red / dark-blue shorts / red socks, England white / blue shorts / white socks); Zubimendi is a defensive
 *  midfielder, 1.81 m.
 * INFERRED (illustrative, never narrated as fact): that he ran on from the main-stand touchline near halfway and where he took up his
 *  place; where every other player stood before the second-half kick-off and their numbers beyond the line-up; the keepers' kit colours
 *  (Simón blue-grey, Pickford yellow — not named); which end each team defended in the second half (Spain drawn defending the screen-left
 *  goal, as the cucurella film has Spain attacking x = 0 late in the game); the TV substitution graphic and score bug (broadcast style);
 *  the confetti and camera flashes on "Spain beat England"; the stadium drawing; crowd colours. The whole demonstration (chapters 2–4) is
 *  illustrative by design: pitch, kits, positions, the pass, his right-foot block and right-foot pass (he is generally described as
 *  right-footed; the narration names no foot).
 *
 * FRAMING (never top-down): ch1 = the high main-stand broadcast camera in Berlin, real time (the bowl wide → the half-time change → a
 * long-lens push onto 18 jogging on → the 2–1 bug); ch2 = the demonstration live, a high touchline camera, real time (the passer, the
 * striker, Zubimendi in the lane, the pass hits him, he wins it); ch3 = the slow-motion replay from a LOW camera behind the passer (he
 * slides across to stay in the line, then a simple pass); ch4 = the lesson from a raised camera behind Zubimendi (the lane through him,
 * the pass that must go through him, the ways around him closed). Composed on the FULL sheet (world units = sheet units centred on the
 * canvas; never sheet.safe) with a lens that widens a little for a square window, so it frames from the 1.45:1 card window down to square.
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion,
 * motion smear on the block and the pass). Small figures in wide shots and every figure inside a passage print at `low`/`mid`.
 * Handedness: athlete.ts's own right-handed world (y up; a figure facing +x has its right side at +z), so when Zubimendi faces −x (toward
 * the passer) his RIGHT foot is on the −z side. Inks: yellow, red, blue, navy. Poses on twos, cameras on ones, all randomness seeded.
 * Budget ≈ 150–300 plate ops per frame (the bowl and crowd are the costly part of ch1; the drill chapters are cheap). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,lunge,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. Every cue starts with a plain ASCII word (Kokoro splits contractions and
 * hyphenated words; "Martín" is never a cue's first word). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Berlin, 2024',text:'Berlin, 2024, the Euro final. At half time, Rodri was hurt, so calm Martín Zubimendi came on. Spain beat England, two-one!',tail:1.8,
  cues:['Berlin','At half time','Rodri was hurt','calm Martín','came on','Spain beat England']},
 {label:'How he does it',text:'This is how he does it. The other team wants to pass forward to their striker. Martín stands right in the path. The ball has to go through him, and he wins it!',tail:1.8,
  cues:['This is how','pass forward','their striker','stands right','go through him','wins it']},
 {label:'Watch again',text:'Watch again, slowly. As the passer moves, Martín slides across to stay in the line. Then, a calm, simple pass.',tail:1.8,
  cues:['Watch again','passer moves','slides across','stay in the line','simple pass']},
 {label:'Your turn',text:'Your turn: stand where the forward pass has to go through you, not around you.',tail:2.4,
  cues:['Your turn','stand where','forward pass','through you','not around']},
];
import timingJson from '../../../public/plays/narration/zubimendi-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('zubimendi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('zubimendi: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K0:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K0)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors, projection
const Y='yellow',R='red',B='blue',K='navy';
const D2R=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre (card window 1.45:1 … square), ignoring safe. */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};
/** a camera from position, look point and focal length F (sheet units; widened by LENS for a square window) */
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/(F*LENS))/D2R,size:1080});
const NEAR=.35;
function toCam(c:Camera,p:V3):V3{const d:V3=[p[0]-c.eye[0],p[1]-c.eye[1],p[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Camera,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
const depthOf=(c:Camera,p:V3)=>toCam(c,p)[2];
function pr(c:Camera,p:V3):Pt|null{const q=toCam(c,p);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function polyP(c:Camera,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadIn(path:Path2D,c:Camera,q:V3[],minD=4){for(const p of q)if(depthOf(c,p)<minD)return;addPoly(path,q.map(p=>scr(c,toCam(c,p))));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Camera,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
function groundRing(c:Camera,x:number,z:number,r:number,n=28):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p=pr(c,[x+Math.cos(a)*r,.02,z+Math.sin(a)*r]);if(!p)return[];o.push(p);}return o;}
/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a ground ring round (x,z), inked; w = reveal */
function ring(s:Sheet,c:Camera,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const g=groundRing(c,x,z,rad*(.7+.3*w),36);if(g.length<3)return;
 const rr=ribbon(g,Math.max(4,kAt(c,[x,0,z])*.06),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a ground arrow along world points (x,z), with a head */
function groundArrow(s:Sheet,c:Camera,P:[number,number][],w:number,ink=Y,seed=71,wm=.18,gaps?:[number,number][]){if(w<=.02)return;
 const pts:Pt[]=[];for(const[x,z] of P){const q=pr(c,[x,.03,z]);if(q)pts.push(q);}if(pts.length<2)return;
 const e=pts[pts.length-1],f=pts[pts.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),m=P[P.length-1],wd=Math.max(4,kAt(c,[m[0],0,m[1]])*wm),hd=wd*2.3,ca=Math.cos(ang),sa=Math.sin(ang);
 const body=ribbon(pts,wd,{seed,taper:.15,wobble:.6,gaps}),head=polyPath([[e[0]+ca*hd,e[1]+sa*hd],[e[0]-sa*hd*.8,e[1]+ca*hd*.8],[e[0]+sa*hd*.8,e[1]-ca*hd*.8]],true);
 s.knockout(ribbon(pts,wd*1.7,{seed,taper:.15,wobble:.6}),.55*w);s.knockout(head,.6*w);s.fill(ink,body,.95*w);s.fill(ink,head,.95*w);}
/** a dashed line on the grass from a to b (world x,z), revealed by u */
function dashLine(s:Sheet,c:Camera,a0:[number,number],b0:[number,number],u:number,w:number,ink=Y,wm=.1){if(w<=.02||u<=.02)return;const A:V3=[a0[0],.03,a0[1]],E:V3=[lerp(a0[0],b0[0],u),.03,lerp(a0[1],b0[1],u)];
 const pa=pr(c,A),pe=pr(c,E);if(!pa||!pe)return;const gaps:[number,number][]=[];for(let q=.06;q<1;q+=.12)gaps.push([q,q+.05]);
 const wd=Math.max(4,kAt(c,mix3(A,E,.5))*wm);s.knockout(ribbon([pa,pe],wd*1.6,{taper:0,wobble:.3}),.5*w);s.fill(ink,ribbon([pa,pe],wd,{taper:0,wobble:.3,gaps}),.95*w);}

// ================================================================ CHAPTER 1 WORLD: the Olympiastadion at night (confirmed things only)
/** Pitch x −105 … 0 (halfway −52.5), z across (+z = the main-stand side, the broadcast camera's side), y up. The running track is a
 * stadium oval round the pitch: straights at z = ±R, bends centred on x = −91 and x = −14. oval(u, r): a point at perimeter parameter
 * u ∈ [0,1) with its outward normal. */
const OV={c0:-91,c1:-14,R:40,W:8.5};
function oval(u:number,r:number):{p:[number,number];n:[number,number]}{
 const L=OV.c1-OV.c0,Pm=2*L+TAU*r,d=((u%1)+1)%1*Pm;
 if(d<L)return{p:[OV.c0+d,-r],n:[0,-1]};
 if(d<L+Math.PI*r){const a=-Math.PI/2+(d-L)/r;return{p:[OV.c1+Math.cos(a)*r,Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
 if(d<2*L+Math.PI*r){const e=d-L-Math.PI*r;return{p:[OV.c1-e,r],n:[0,1]};}
 const a=Math.PI/2+(d-2*L-Math.PI*r)/r;return{p:[OV.c0+Math.cos(a)*r,Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
const R0=OV.R+OV.W,NSEG=56;
const onBowl=(u:number,d:number,y:number):V3=>{const o=oval(u,R0);return[o.p[0]+o.n[0]*d,y,o.p[1]+o.n[1]*d];};
/** the Marathon Gate: the gap in the upper ring and the roof at the west end (x < −105) */
const GATE=(u:number)=>{const L=OV.c1-OV.c0,Pm=2*L+TAU*R0,m=(2*L+1.5*Math.PI*R0)/Pm;return Math.abs(u-m)<.024;};
type Bowl={low:V3[][];up:V3[][];rim:V3[][];roof:V3[][];track:V3[][];seats:{P:V3;h:number;ph:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],rim:[],roof:[],track:[],seats:[],lamps:[]};
 for(let i=0;i<NSEG;i++){const a=i/NSEG,b=(i+1)/NSEG,gate=GATE((a+b)/2);
  const Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[onBowl(a,d0,y0),onBowl(b,d0,y0),onBowl(b,d1,y1),onBowl(a,d1,y1)];
  o.low.push(Q(0,1,22,11.5));
  if(!gate){o.up.push(Q(24,13.5,42,27));o.rim.push(Q(22,11.5,24,13.5));o.roof.push(Q(16,33.5,52,31));o.lamps.push(onBowl((a+b)/2,17,33.2));}
  const ti=oval(a,OV.R),tj=oval(b,OV.R),to=oval(a,R0),tq=oval(b,R0);o.track.push([[ti.p[0],0,ti.p[1]],[tj.p[0],0,tj.p[1]],[tq.p[0],0,tq.p[1]],[to.p[0],0,to.p[1]]]);
  for(const [d0,y0,d1,y1,rows,off] of [[0,1,22,11.5,7,0],[24,13.5,42,27,6,5000]] as number[][]){if(gate&&off)continue;for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+off,11);if(h<.14)continue;
   const u=(r+.5)/rows;o.seats.push({P:onBowl((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NSEG,lerp(d0,d1,u),lerp(y0,y1,u)+.4),h,ph:hash(i*7+r*3+k,9)*TAU});}}}
 return o;})();
function stadium(s:Sheet,c:Camera,t:number,o:{cheer?:number;flash?:number}={}){
 const{cheer=0,flash=0}=o,tt=twos(t),v=view(s),Bnd=Math.max(s.W,s.H)*1.5,big=polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,Bnd],[-Bnd,Bnd]],true);
 // a July night over Berlin (kick-off 21:00; the second half after 22:00): deep navy-blue sky
 s.field(B,.5,.6);s.tone(K,big,.5);
 const low=new Path2D(),up=new Path2D(),rim=new Path2D(),roof=new Path2D(),edge=new Path2D(),lamps=new Path2D();
 for(const q of BOWL.low)quadIn(low,c,q);for(const q of BOWL.up)quadIn(up,c,q);for(const q of BOWL.rim)quadIn(rim,c,q);
 for(const q of BOWL.roof){quadIn(roof,c,q,6);if(depthOf(c,q[0])>6&&depthOf(c,q[1])>6)seg3(c,q[0],q[1],.5,edge,1);}
 for(const p of BOWL.lamps){if(depthOf(c,p)<6)continue;const g=scr(c,toCam(c,p)),sz=clamp(.9*kAt(c,p),3,14);lamps.rect(g[0]-sz,g[1]-sz*.35,sz*2,sz*.7);}
 s.knockout(low);s.tone(K,low,.4);s.tone(B,low,.28);s.knockout(up);s.tone(K,up,.46);s.tone(B,up,.22);
 // the crowd: Spain red and yellow, England white with navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let seen=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<4)continue;const z=clamp(.5*kAt(c,q.P),2.5,14),g=scr(c,toCam(c,q.P));if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;const lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.ph)):0;
  inks[q.h<.46?0:q.h<.6?1:q.h<.88?2:3].rect(g[0]-z/2,g[1]-z*.7-lift,z,z*1.25);seen++;}
 if(seen){s.fill(R,inks[0],.88);s.fill(Y,inks[1],.9);s.knockout(inks[2],.8);s.fill(K,inks[3],.75);}
 s.knockout(rim);s.fill(K,rim,.8);
 s.knockout(roof);s.tone(B,roof,.22);s.tone(K,roof,.12);s.fill(K,edge,.85);s.knockout(lamps,.95);s.fill(Y,lamps,.25);
 if(flash>0){const fp=new Path2D(),T12=Math.floor(tt*12);let n=0;for(let i=0;i<Math.round(22*flash);i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)];if(depthOf(c,q.P)<6)continue;const g=scr(c,toCam(c,q.P)),sz=clamp(.9*kAt(c,q.P),7,22);
  fp.addPath(polyPath([[g[0],g[1]-sz],[g[0]+sz*.3,g[1]],[g[0],g[1]+sz],[g[0]-sz*.3,g[1]]],true));fp.addPath(polyPath([[g[0]-sz,g[1]],[g[0],g[1]-sz*.3],[g[0]+sz,g[1]],[g[0],g[1]+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // the blue running track, then the grass inside it (yellow × blue = green), mowing stripes
 const tr=new Path2D();for(const q of BOWL.track)addPoly(tr,polyP(c,q));s.knockout(tr);s.fill(B,tr,.8);s.tone(K,tr,.14);
 const inner:V3[]=[];for(let i=0;i<48;i++){const q=oval(i/48,OV.R);inner.push([q.p[0],0,q.p[1]]);}
 const gp=new Path2D();addPoly(gp,polyP(c,inner));s.knockout(gp);yInk(s,gp,.88);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,polyP(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 // LED boards along the far touchline
 const bB=new Path2D(),bP=new Path2D();for(let x=-104;x<4;x+=8)addPoly((Math.round(x/8)&1)?bB:bP,polyP(c,[[x,0,-36.5],[x+7.6,0,-36.5],[x+7.6,.9,-36.5],[x,.9,-36.5]]));
 s.knockout(bB);s.knockout(bP);s.fill(K,bB,.9);s.fill(R,bP,.7);
 // paper lines: touchlines, goal lines, halfway, centre circle and spot, both boxes
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>seg3(c,[a[0],.02,a[1]],[b[0],.02,b[1]],.13,lines,.8);
 for(let k=0;k<6;k++){const x0=-105+k*17.5,x1=x0+17.5;Ln([x0,-34],[x1,-34]);Ln([x0,34],[x1,34]);}
 for(const gx of[0,-105]){const sg=gx===0?-1:1;Ln([gx,-34],[gx,34]);Ln([gx,-20.16],[gx+sg*16.5,-20.16]);Ln([gx+sg*16.5,-20.16],[gx+sg*16.5,20.16]);Ln([gx+sg*16.5,20.16],[gx,20.16]);
  Ln([gx,-9.16],[gx+sg*5.5,-9.16]);Ln([gx+sg*5.5,-9.16],[gx+sg*5.5,9.16]);Ln([gx+sg*5.5,9.16],[gx,9.16]);}
 Ln([-52.5,-34],[-52.5,0]);Ln([-52.5,0],[-52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 goal(s,c,0,1);goal(s,c,-105,-1);
}
/** a goal on the line x = gx, its net toward sgn·x */
function goal(s:Sheet,c:Camera,gx:number,sgn:number){
 const W=3.66,H=2.44,Dp=2*sgn,net=new Path2D(),fr=new Path2D();
 addPoly(net,polyP(c,[[gx,H,-W],[gx,H,W],[gx+Dp,H*.8,W],[gx+Dp,H*.8,-W]]));addPoly(net,polyP(c,[[gx+Dp,0,-W],[gx+Dp,0,W],[gx+Dp,H*.8,W],[gx+Dp,H*.8,-W]]));
 s.knockout(net,.3);s.tone(K,net,.14);
 seg3(c,[gx,0,-W],[gx,H,-W],.12,fr);seg3(c,[gx,0,W],[gx,H,W],.12,fr);seg3(c,[gx,H,-W-.06],[gx,H,W+.06],.12,fr);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
type Kit=AthleteStyle;
/** Spain, 14 July 2024: red shirts, dark-blue shorts, red socks (confirmed); yellow numbers and trim (inferred) */
const ESP=(n:number,o:Partial<Kit>={}):Kit=>({shirt:R,shorts:[K,.9],socks:R,trim:Y,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:Y,seed:40+n,...o});
/** England: white shirts, navy-blue shorts, white socks (confirmed); navy trim and numbers (inferred) */
const ENG=(n:number,o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:[K,.9],socks:'paper',trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:70+n,...o});
/** Zubimendi: 1.81 m, slim; light skin, short dark hair, clean-shaven (playerAppearance.json) */
const ZB:Build={height:1.81,bulk:.92};
const ZHAIR:InkFill=[K,.82];
const ZUBI_MATCH:Kit=ESP(18,{skin:SKIN_L,hair:ZHAIR,build:ZB,seed:18});

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette).
 * prev = the pose one drawn frame earlier (secondary motion), smear = halftone echo on fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:AthleteStyle['detail']}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.32],threshold:9});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}
const READY=posed({lHipF:30,rHipF:26,lKnee:44,rKnee:40,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:46,rElb:46,neckP:-4});
const idle=(t:number,seed:number):Pose=>{const p=stand();p.neckY=.35*Math.sin(t*.55+seed);p.twist=.08*Math.sin(t*.4+seed*1.7);p.lKnee+=.06*Math.sin(t*1.3+seed);return p;};

// ---------------------------------------------------------------- chapter 1 cast: second-half line-ups taking their places (positions inferred)
/** Spain (defending the x = −105 goal in the second half) and England (defending x = 0); each walks the last few metres into place.
 * [style, x, z, x0, z0] — (x0,z0) where he is at t = 0. */
type Cel={st:Kit;x:number;z:number;x0:number;z0:number;gk?:boolean};
const LINE:Cel[]=[
 {st:{...ESP(23),shirt:[B,.5],shorts:[B,.5],socks:[B,.5],trim:K,numberInk:K,sleeves:'long',gloves:'paper'},x:-100,z:0,x0:-98,z0:2,gk:true},
 {st:ESP(2,{hair:[K,.8]}),x:-80,z:22,x0:-77,z0:24},{st:ESP(3,{skin:SKIN_L}),x:-82,z:8,x0:-79,z0:10},{st:ESP(14,{skin:SKIN_L}),x:-82,z:-8,x0:-78,z0:-6},
 {st:ESP(24,{skin:SKIN_L,hairStyle:'curly',hair:[K,.85]}),x:-80,z:-22,x0:-76,z0:-19},{st:ESP(8,{skin:SKIN_L}),x:-63,z:-11,x0:-60,z0:-8},
 {st:ESP(10,{skin:SKIN_L}),x:-58,z:9,x0:-61,z0:12},{st:ESP(19,{skin:SKIN_D}),x:-55,z:24,x0:-58,z0:28},{st:ESP(17,{skin:SKIN_D,hairStyle:'curly'}),x:-55,z:-24,x0:-58,z0:-27},
 {st:ESP(7,{skin:SKIN_L}),x:-53.4,z:3,x0:-56,z0:6},
 {st:{...ENG(1),shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],trim:K,sleeves:'long',gloves:[B,.8]},x:-5,z:0,x0:-7,z0:1,gk:true},
 {st:ENG(2,{skin:SKIN_D,hairStyle:'bald'}),x:-24,z:-21,x0:-27,z0:-23},{st:ENG(5,{}),x:-26,z:-7,x0:-29,z0:-5},{st:ENG(6,{skin:SKIN_D}),x:-26,z:7,x0:-29,z0:5},
 {st:ENG(3,{}),x:-25,z:21,x0:-28,z0:24},{st:ENG(4,{}),x:-38,z:-5,x0:-35,z0:-3},{st:ENG(26,{skin:SKIN_D}),x:-38,z:6,x0:-35,z0:9},
 {st:ENG(7,{skin:SKIN_D}),x:-46,z:-24,x0:-43,z0:-27},{st:ENG(11,{}),x:-46,z:22,x0:-43,z0:25},{st:ENG(10,{skin:SKIN_D}),x:-46,z:4,x0:-42,z0:3},
 {st:ENG(9,{}),x:-51.6,z:-3,x0:-48,z0:-5},
];
/** Zubimendi's run on: from the main-stand touchline near halfway to his place in front of Spain's back four */
const Z_FROM:[number,number]=[-50.5,35.6],Z_TO:[number,number]=[-66,2.5];
const zRun=()=>{const a=CUE(0,'calm Martín')-.6;return{a,b:a+Math.hypot(Z_TO[0]-Z_FROM[0],Z_TO[1]-Z_FROM[1])/4.6};};
function zubiCh1(t:number):{p:Pose;x:number;z:number;yaw:number;sp:number}{
 const{a,b}=zRun(),u=clamp((t-a)/(b-a)),e=u<.1?u*u*5:u>.9?1-(1-u)*(1-u)*5:u,x=lerp(Z_FROM[0],Z_TO[0],e),z=lerp(Z_FROM[1],Z_TO[1],e);
 const run=u>0&&u<1,dist=Math.hypot(x-Z_FROM[0],z-Z_FROM[1]),yaw=run?YAW(Z_TO[0]-Z_FROM[0],Z_TO[1]-Z_FROM[1]):u>=1?YAW(1,-.1):YAW(0,-1);
 let p=run?blendPose(READY,runCycle(dist/2.9,{speed:.3}),sm(0,.06,u)*(1-sm(.94,1,u))):u>=1?READY:over(idle(t,3),{air:.05*Math.max(0,Math.sin(t*9))},1);
 if(!run&&u<=0)p=over(p,{lShA:40,rShA:40,lElb:30,rElb:30},.6*bump(0,2,t%2));
 return{p,x,z,yaw,sp:run?4.6:0};}
function celPose(a:Cel,t:number):{p:Pose;x:number;z:number;yaw:number}{
 const u=clamp(t/5),e=easeOut(u),x=lerp(a.x0,a.x,e),z=lerp(a.z0,a.z,e),d=Math.hypot(a.x-a.x0,a.z-a.z0)*e;
 const toBall=YAW(-52.5-x,-z),moving=u<1;const p=moving?blendPose(idle(t,a.x),runCycle(d/1.4,{speed:0}),1-sm(.8,1,u)):idle(t,a.x+a.z);
 return{p,x,z,yaw:moving?lerpAng(YAW(a.x-a.x0,a.z-a.z0),toBall,sm(.7,1,u)):toBall};}

// ---------------------------------------------------------------- TV graphics (screen space): substitution board and score bug
/** seven-segment digit strokes, cell 1 × 1.8 */
const SEG:Record<string,[number,number,number,number]>={a:[0,0,1,0],b:[1,0,1,.9],c:[1,.9,1,1.8],d:[0,1.8,1,1.8],e:[0,.9,0,1.8],f:[0,0,0,.9],g:[0,.9,1,.9]};
const DIG:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','6':'afgedc','8':'abcdefg'};
function digits(p:Path2D,str:string,x:number,y:number,h:number,w:number){let cx=x;for(const ch of str){for(const sg of DIG[ch]){const[a,b,c,d]=SEG[sg];p.addPath(ribbon([[cx+a*h*.5,y+b*h*.55],[cx+c*h*.5,y+d*h*.55]],w,{seed:7+(cx|0),taper:0,wobble:.2}));}cx+=h*.78;}}
/** the half-time change: 16 off (red, arrow down), 18 on (yellow, arrow up), top-left of the frame */
function subBoard(s:Sheet,w:number){if(w<=.02)return;
 const k=Math.min(1.25,Math.max(.8,s.W/s.H))*1.25,vw=s.W*s.fit,vh=s.H*s.fit,h=78*k,W=250*k,x0=-vw/2+30-(1-easeOut(clamp(w)))*(W+60),y0=-vh/2+30;
 const box=polyPath([[x0,y0],[x0+W,y0],[x0+W,y0+h*2],[x0,y0+h*2]],true);s.knockout(box,.95*w);s.stroke(K,box,5,.9*w);
 const off=new Path2D(),on=new Path2D(),dh=h*.6,dw=6*k;
 digits(off,'16',x0+W*.42,y0+h*.2,dh,dw);digits(on,'18',x0+W*.42,y0+h+h*.2,dh,dw);
 const dn=polyPath([[x0+W*.14,y0+h*.3],[x0+W*.3,y0+h*.3],[x0+W*.22,y0+h*.72]],true),upA=polyPath([[x0+W*.14,y0+h*1.72],[x0+W*.3,y0+h*1.72],[x0+W*.22,y0+h*1.28]],true);
 const onRow=polyPath([[x0+5,y0+h+4],[x0+W-5,y0+h+4],[x0+W-5,y0+h*2-5],[x0+5,y0+h*2-5]],true);s.fill(K,onRow,.92*w);s.knockout(on,.95*w);s.knockout(upA,.95*w);
 s.fill(R,dn,.95*w);s.fill(R,off,.95*w);s.fill(Y,upA,.95*w);s.fill(Y,on,.95*w);
 s.stroke(K,ribbon([[x0+10,y0+h],[x0+W-10,y0+h]],3,{taper:0,wobble:.2}),1.5,.7*w);}
/** the score bug: Spain (red swatch) 2 – 1 England (paper swatch with a navy ring), top-centre; pulse on the win */
function scoreBug(s:Sheet,w:number,pulse:number){if(w<=.02)return;
 const k=Math.min(1.25,Math.max(.8,s.W/s.H))*1.3,y0=-s.H*s.fit/2+34,h=86*k,W=300*k,x0=-W/2,sl=(1-easeOut(clamp(w)))*-60;
 const box=polyPath([[x0,y0+sl],[x0+W,y0+sl],[x0+W,y0+h+sl],[x0,y0+h+sl]],true);s.knockout(box,.95*w);s.stroke(K,box,5,.9*w);
 const es=new Path2D();es.arc(x0+h*.55,y0+h/2+sl,h*.26,0,TAU);s.fill(R,es,.95*w);
 const en=new Path2D();en.arc(x0+W-h*.55,y0+h/2+sl,h*.26,0,TAU);s.stroke(K,en,5,.9*w);
 const d2=new Path2D(),d1=new Path2D(),dh=h*.62*(1+.2*pulse);
 digits(d2,'2',x0+W*.34,y0+h/2-dh*.28+sl,dh,7*k*(1+.2*pulse));digits(d1,'1',x0+W*.5,y0+h/2-h*.17+sl,h*.62,7*k);
 const dash=ribbon([[-W*.05,y0+h/2+sl],[W*.05,y0+h/2+sl]],6*k,{seed:3,taper:0,wobble:.2});
 if(pulse>.02)s.fill(Y,d2,.95*w);s.fill(R,d2,.95*w);s.fill(K,d1,.95*w);s.fill(K,dash,.9*w);}

// ================================================================ THE DEMONSTRATION WORLD: a neutral training pitch in daylight
/** The drill (τ = 0: the passer's pass leaves his right boot). The opponents attack +x: their passer (red bib) carries the ball across the
 * top of the drill at x ≈ 0, looking to pass forward to their striker (red bib) at x ≈ 16. Zubimendi (white top, 36) stands at x ≈ 8,
 * always ON the line from the ball to the striker, sliding across as the passer moves; the pass has to go through him, he blocks it with
 * his right boot, then plays a simple pass to his team-mate (white top) out to his left. */
function trainingGround(s:Sheet,c:Camera){
 const v=view(s);
 // a pale summer sky, a far tree line, a low fence
 s.field(B,.16,.5);
 const tree=new Path2D(),far=58;for(let i=0;i<=48;i++){const x=-90+i*5,h=6+5*hash(i,51),q=toCam(c,[x,h*.55,far]);if(q[2]<5)continue;const g=scr(c,q),rx=c.F*(3.2+1.5*hash(i,52))/q[2],ry=c.F*h*.62/q[2];
  if(Math.abs(g[0])>v.hx+rx||Math.abs(g[1])>v.hy+ry)continue;const el:Pt[]=[];for(let j=0;j<12;j++){const a=j/12*TAU;el.push([g[0]+Math.cos(a)*rx,g[1]+Math.sin(a)*ry]);}tree.addPath(polyPath(el,true));tree.rect(g[0]-rx*.9,g[1],rx*1.8,ry*1.1);}
 const tree2=new Path2D();for(let i=0;i<=48;i++){const x=-90+i*5,h=6+5*hash(i,53),q=toCam(c,[x,h*.55,-far]);if(q[2]<5)continue;const g=scr(c,q),rx=c.F*(3.2+1.5*hash(i,54))/q[2],ry=c.F*h*.62/q[2];
  if(Math.abs(g[0])>v.hx+rx||Math.abs(g[1])>v.hy+ry)continue;const el:Pt[]=[];for(let j=0;j<12;j++){const a=j/12*TAU;el.push([g[0]+Math.cos(a)*rx,g[1]+Math.sin(a)*ry]);}tree2.addPath(polyPath(el,true));tree2.rect(g[0]-rx*.9,g[1],rx*1.8,ry*1.1);}
 s.fill(B,tree,.6);s.tone(K,tree,.45);s.fill(B,tree2,.6);s.tone(K,tree2,.45);
 const g=polyP(c,[[-120,0,-far],[140,0,-far],[140,0,far],[-120,0,far]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.72);
 const st=new Path2D();for(let k=-12;k<14;k+=2)addPoly(st,polyP(c,[[k*6,0,-far],[k*6+6,0,-far],[k*6+6,0,far],[k*6,0,far]]));s.tone(K,st,.12);
 // the drill area: a painted rectangle, a mini goal behind the striker, red cones
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.1,ln);const X0=-8,X1=24,Z0=-14,Z1=18;
 for(let k=0;k<8;k++){L([lerp(X0,X1,k/8),0,Z0],[lerp(X0,X1,(k+1)/8),0,Z0]);L([lerp(X0,X1,k/8),0,Z1],[lerp(X0,X1,(k+1)/8),0,Z1]);}
 for(let k=0;k<8;k++){L([X0,0,lerp(Z0,Z1,k/8)],[X0,0,lerp(Z0,Z1,(k+1)/8)]);L([X1,0,lerp(Z0,Z1,k/8)],[X1,0,lerp(Z0,Z1,(k+1)/8)]);}
 s.knockout(ln,.9);
 const gl=new Path2D(),gn=new Path2D(),GZ=2;
 seg3(c,[X1,0,GZ-1.5],[X1,1.2,GZ-1.5],.08,gl);seg3(c,[X1,0,GZ+1.5],[X1,1.2,GZ+1.5],.08,gl);seg3(c,[X1,1.2,GZ-1.55],[X1,1.2,GZ+1.55],.08,gl);
 addPoly(gn,polyP(c,[[X1,1.2,GZ-1.5],[X1,1.2,GZ+1.5],[X1+.9,0,GZ+1.5],[X1+.9,0,GZ-1.5]]));s.knockout(gn,.4);s.tone(K,gn,.15);s.knockout(gl);s.stroke(K,gl,1.2,.6);
 const cones=new Path2D();
 for(const[x,z] of CONES){const b=toCam(c,[x,0,z]);if(b[2]<1)continue;const p=scr(c,b),q=pr(c,[x,.3,z]);if(!q||Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const w=Math.max(2.5,c.F*.14/b[2]);cones.addPath(polyPath([[p[0]-w,p[1]],[q[0],q[1]],[p[0]+w,p[1]]],true));}
 s.knockout(cones);s.fill(R,cones,.95);
}
const CONES:[number,number][]=(()=>{const o:[number,number][]=[];for(let k=0;k<=8;k++){o.push([lerp(-8,24,k/8),-14],[lerp(-8,24,k/8),18]);}for(let k=1;k<8;k++)o.push([-8,lerp(-14,18,k/8)]);return o;})();

/** training kits (illustrative, neutral): Zubimendi in a white training top with his 36 and navy shorts; the team-mate the same; the two
 * opponents in red bibs over blue tops */
const ZUBI:Kit={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_L,hair:ZHAIR,line:K,trim:K,number:36,numberInk:K,hairStyle:'short',build:ZB,seed:36};
const MATE:Kit={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:K,number:8,numberInk:K,hairStyle:'short',build:{height:1.78},seed:8};
const PASSER:Kit={shirt:R,shorts:K,socks:K,boots:K,skin:SKIN_D,hair:K,line:K,trim:[B,.7],numberInk:'paper',hairStyle:'curly',build:{height:1.8,bulk:1},seed:5};
const STRIKER:Kit={shirt:R,shorts:K,socks:K,boots:K,skin:SKIN_L,hair:[R,.5],line:K,trim:[B,.7],numberInk:'paper',hairStyle:'short',build:{height:1.86,bulk:1.05},seed:9};

// ---------------------------------------------------------------- the drill geometry (τ seconds; tables at 50 Hz built once)
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-6,T1=4.5,DT=.02;
type Tab={X:number[];Z:number[];D:number[]};
function table(keys:number[][]):Tab{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};}
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posT=(tb:Tab,tau:number):[number,number]=>[samp(tb.X,tau),samp(tb.Z,tau)];
const velT=(tb:Tab,tau:number):[number,number]=>{const a=posT(tb,tau-.08),b=posT(tb,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const fwdT=(tb:Tab,tau:number,d:number):[number,number]=>{const p=posT(tb,tau),v=velT(tb,tau),sp=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/sp*d,p[1]+v[1]/sp*d];};

/** the passer's right-foot pass: B0 where it leaves his boot; his body a little right of the pass line */
const B0:[number,number]=[1.1,2.5];
const ST_KEYS=[[-6,17.2,-3.6],[-4,16.9,-2],[-2,16.5,.6],[0,16.2,2.4],[.8,15.9,2.8],[2,15.4,2.5],[4.5,14.6,2]];
const ST_T=table(ST_KEYS);
const ST0=posT(ST_T,.55),PDIR=((a:[number,number],b:[number,number])=>{const l=Math.hypot(b[0]-a[0],b[1]-a[1]);return[(b[0]-a[0])/l,(b[1]-a[1])/l] as [number,number];})(B0,ST0);
const PB:Build={height:1.8};
const PASS_YAW=YAW(PDIR[0],PDIR[1])-14*D2R;
const PASS_SK=solve(strike(STRIKE_CONTACT,{foot:'r',power:.45}),PB,{yaw:PASS_YAW});
const PSP:[number,number]=[B0[0]-PASS_SK.rToe[0],B0[1]-PASS_SK.rToe[2]];
const PS_KEYS=[[-6,PSP[0]-1.6,-6.8],[-4.5,PSP[0]-1.3,-4.6],[-3,PSP[0]-1,-2],[-1.6,PSP[0]-.6,.2],[-.6,PSP[0]-.25,1.6],[0,PSP[0],PSP[1]],[.5,PSP[0]+.4,PSP[1]+.2],[1.6,PSP[0]+1.2,PSP[1]+.5],[4.5,PSP[0]+2.4,PSP[1]+.8]];
const PS_T=table(PS_KEYS);
/** the ball before the pass: a dribble just ahead of the passer, eased onto B0 */
function carried(tau:number):[number,number]{const f=fwdT(PS_T,tau,.5+.12*Math.abs(Math.sin(tau*4.6))),w=sm(-.45,0,tau);return[lerp(f[0],B0[0],w),lerp(f[1],B0[1],w)];}
/** Zubimendi holds the line x = ZX between the ball and the striker, reacting ≈ .35 s late */
const ZX=8.4;
const zLine=(tau:number)=>{const b=carried(Math.min(tau,0)),s=posT(ST_T,tau),u=(ZX-b[0])/(s[0]-b[0]);return lerp(b[1],s[1],u);};
/** the block: the pass meets his RIGHT boot at I (on the pass line, a stride in front of ZX) at τ_I */
const PASS_V=13;
const IX=ZX-.8,I:[number,number]=[IX,B0[1]+PDIR[1]*(IX-B0[0])/PDIR[0]];
const T_I=Math.hypot(I[0]-B0[0],I[1]-B0[1])/PASS_V;
const YAW_I=YAW(-PDIR[0],-PDIR[1]);
const LD=.55,LUNGE_AT=.6,L_START=T_I-LUNGE_AT*LD;
const LSK=solve(lunge(LUNGE_AT,{side:'r'}),ZB,{yaw:YAW_I});
const ZIP:[number,number]=[I[0]-LSK.rToe[0],I[1]-LSK.rToe[2]];
/** the simple pass: the ball dies at C1 by his feet; his right-foot pass at TP2 out to the team-mate on his left */
const C1:[number,number]=[I[0]-.35,I[1]+.75];
const MT_KEYS=[[-6,4.6,12.4],[-3,4.2,12.8],[0,3.9,13],[1.2,3.8,13.1],[2.2,3.7,13.1],[4.5,3.4,13.3]];
const MT_T=table(MT_KEYS);
const TP2=T_I+1.05,MT_R=((p:[number,number])=>[p[0]+.45,p[1]-.5] as [number,number])(posT(MT_T,TP2+1));
const P2YAW=YAW(MT_R[0]-C1[0],MT_R[1]-C1[1])-12*D2R;
const P2SK=solve(strike(STRIKE_CONTACT,{foot:'r',power:.35}),ZB,{yaw:P2YAW});
const ZP2:[number,number]=[C1[0]-P2SK.rToe[0],C1[1]-P2SK.rToe[2]];
const T_R2=TP2+Math.hypot(MT_R[0]-C1[0],MT_R[1]-C1[1])/10;
const Z_KEYS:number[][]=(()=>{const k:number[][]=[];for(let t=T0;t<=-.4;t+=.5)k.push([t,ZX,zLine(t-.35)]);
 k.push([0,ZX-.1,lerp(zLine(-.35),ZIP[1],.4)],[T_I,ZIP[0],ZIP[1]],[T_I+.5,lerp(ZIP[0],ZP2[0],.6),lerp(ZIP[1],ZP2[1],.6)],[TP2,ZP2[0],ZP2[1]],[TP2+.6,ZP2[0]-.5,ZP2[1]+.4],[T1,ZP2[0]-2.2,ZP2[1]+1.4]);return k;})();
const Z_T=table(Z_KEYS);
const ACT=[{st:ZUBI,tb:Z_T},{st:PASSER,tb:PS_T},{st:STRIKER,tb:ST_T},{st:MATE,tb:MT_T}];
const ZU=0,PS=1,ST=2,MT=3;
function ballAt(tau:number):V3{
 if(tau<0){const b=carried(tau);return[b[0],.11,b[1]];}
 if(tau<T_I){const u=tau/T_I;return[lerp(B0[0],I[0],u),.11+.05*Math.sin(Math.PI*u),lerp(B0[1],I[1],u)];}
 if(tau<TP2){const u=easeOut(clamp((tau-T_I)/.5));return[lerp(I[0],C1[0],u),.11,lerp(I[1],C1[1],u)];}
 const u=clamp((tau-TP2)/(T_R2-TP2)),e=u*(1.3-.3*u);return[lerp(C1[0],MT_R[0],e),.11,lerp(C1[1],MT_R[1],e)];}
const spinAt=(tau:number)=>TAU*(tau<0?2.4*tau:tau<T_I?5*tau:tau<TP2?5*T_I+.6*(tau-T_I):5*T_I+.6*(TP2-T_I)-4*(tau-TP2));

// ---------------------------------------------------------------- poses
/** the side shuffle of a holding midfielder: low, feet apart, pushing off sideways (phase advances with distance) */
function shuffle(ph:number):Pose{const s=Math.sin(TAU*ph),c=Math.cos(TAU*ph);
 return posed({lHipF:28,rHipF:28,lKnee:48+8*c,rKnee:48-8*c,lHipA:14+11*s,rHipA:14-11*s,lAnk:-4,rAnk:-4,lean:17,pitch:4,bend:3*s,lShA:30,rShA:30,lShF:14,rShF:14,lElb:50,rElb:50,neckP:-3,air:.03*Math.abs(s)});}
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 const tb=ACT[k].tb,v=velT(tb,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posT(tb,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(k===ZU){
  yaw=toBall;
  // before the pass: square to the ball, sliding across in a low shuffle; two glances over the shoulder at the striker behind him
  p=blendPose(READY,shuffle(samp(tb.D,tau)/1.1),clamp((sp-.25)/.6));
  if(tau<0)p=over(p,{neckY:-70,twist:-18},.9*(bump(-4.1,-3.3,tau)+bump(-1.9,-1.2,tau)));
  // the block: a lunge onto the right boot in the lane
  const u=(tau-L_START)/LD;if(u>-.2&&u<1.5){const w=Math.min(sm(-.2,.05,u),1-sm(1.05,1.5,u));yaw=lerpAng(yaw,YAW_I,w);p=blendPose(p,lunge(clamp(u),{side:'r'}),w);}
  // the simple pass with the right foot, head up
  const D=.6,q=(tau-(TP2-STRIKE_CONTACT*D))/D;if(q>-.2&&q<1.4){const w=Math.min(sm(-.2,.1,q),1-sm(.95,1.4,q));yaw=lerpAng(yaw,P2YAW,w);p=blendPose(p,strike(clamp(q),{foot:'r',power:.35}),w);}
  if(tau>TP2+.5){p=blendPose(p,runCycle(samp(tb.D,tau)/2.6,{speed:.1}),clamp((sp-.4)/.8));yaw=sp>.6?YAW(v[0],v[1]):yaw;}
 }else if(k===PS){
  if(tau<-.7){p=blendPose(READY,dribble(samp(tb.D,tau)/1.7,{foot:'r',speed:.45}),clamp(sp/.8));yaw=lerpAng(yaw,YAW(1,0),.35);}
  else p=READY;
  const D=.7,u=(tau-(0-STRIKE_CONTACT*D))/D;if(u>-.2&&u<1.4){const w=inWin(u+.1);yaw=lerpAng(yaw,PASS_YAW,Math.min(1,sm(-.2,.15,u)));p=blendPose(p,strike(clamp(u),{foot:'r',power:.45}),w);}
  if(tau>T_I)p=over(p,{neckP:10,lShA:40,rShA:40,lElb:30,rElb:30},.6*sm(T_I,T_I+.4,tau)*(1-sm(3,4,tau)));
 }else if(k===ST){
  p=blendPose(READY,runCycle(samp(tb.D,tau)/1.6,{speed:0}),clamp((sp-.3)/.8));yaw=toBall;
  if(tau>T_I+.2)p=over(p,{neckP:14,lean:6,lShA:10,rShA:10},sm(T_I+.2,T_I+.8,tau)*.8);
 }else{
  p=blendPose(READY,idle(tau,4),.3);yaw=toBall;
  if(tau>T_R2-.4)p=blendPose(p,dribble(.9+(tau-T_R2)*.8,{foot:'r',speed:.2}),.6*sm(T_R2-.4,T_R2,tau));
 }
 return{pose:p,place:{x,z,yaw}};
}

/** everything on the drill, depth sorted: positions at τ, poses on twos at τp (τpp = the drawing before) */
function play(s:Sheet,c:Camera,tau:number,tp:number,o:{minBall?:number;smear?:boolean;lines?:boolean}={}):{zubi?:DrawResult}{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],ppu=pxPer(s),passing=!!s._passage.pending,out:{zubi?:DrawResult}={};
 ACT.forEach((a,k)=>{const[x,z]=posT(a.tb,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const st=poseOf(k,tp),px=h*ppu,star=k===ZU;
   const detail:AthleteStyle['detail']=passing?(star?'mid':'low'):px<50||(!star&&px<110)?'low':undefined;
   const big=px>=90&&!passing,prev=big?poseOf(k,tp-1/12):undefined;
   const smear=!!o.smear&&big&&((k===ZU&&((tp>L_START&&tp<T_I+.2)||(tp>TP2-.3&&tp<TP2+.15)))||(k===PS&&tp>-.3&&tp<.1));
   const r=drawPlayer(s,st.pose,c,a.st,st.place,{prev,smear,detail});if(k===ZU)out.zubi=r;}});});
 const bp=ballAt(tau),bq=toCam(c,bp);
 if(bq[2]>=NEAR)items.push({d:bq[2]-.05,draw:()=>{const g=scr(c,bq),r=Math.max(o.minBall??12,c.F*.11/bq[2]);
  const sh:Pt[]=[];for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[bp[0]+Math.cos(a)*.2,0,bp[2]+Math.sin(a)*.16]);if(p)sh.push(p);}if(sh.length>8)s.tone(K,polyPath(sh,true),.4);
  if(o.lines){const a=pr(c,ballAt(tau-.06));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.9)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.4),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
  footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return out;
}
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posT(ACT[k].tb,tau);return[x,y,z];};

// ---------------------------------------------------------------- teaching marks
/** the lane: a dashed yellow line on the grass from the ball to the striker's feet — it runs straight through Zubimendi */
function lane(s:Sheet,c:Camera,tau:number,u:number,w:number){const b=ballAt(Math.min(tau,0)),st=posT(ST_T,tau);dashLine(s,c,[b[0],b[2]],st,u,w,Y,.12);}
/** the pass line from B0 toward the striker, stopped where it hits him */
function passLine(s:Sheet,c:Camera,w:number){if(w<=.02)return;groundArrow(s,c,[B0,[lerp(B0[0],I[0],.5),lerp(B0[1],I[1],.5)],I],w,Y,72,.16);}
/** the two ways AROUND him, printed red and crossed out */
function aroundArcs(s:Sheet,c:Camera,tau:number,w:number,x:number){if(w<=.02)return;const z=posT(Z_T,tau),st=posT(ST_T,tau);
 for(const side of[-1,1]){const P:[number,number][]=[];for(let i=0;i<=14;i++){const u=i/14,bx=lerp(B0[0],st[0]-1.2,u),bz=lerp(B0[1],st[1],u)+side*4.2*Math.sin(Math.PI*u)*(1-.35*u);P.push([bx,bz]);}
  const gaps:[number,number][]=[];for(let q=.08;q<.96;q+=.14)gaps.push([q,q+.06]);groundArrow(s,c,P,w*.85,R,80+side,.12,gaps);
  if(x>.02){const m=P[7],g=pr(c,[m[0],.05,m[1]]);if(g){const r=Math.max(16,kAt(c,[m[0],0,m[1]])*.8)*easeOutBack(clamp(x));const a=ribbon([[g[0]-r,g[1]-r*.6],[g[0]+r,g[1]+r*.6]],Math.max(5,r*.22),{taper:0,wobble:.4}),b2=ribbon([[g[0]-r,g[1]+r*.6],[g[0]+r,g[1]-r*.6]],Math.max(5,r*.22),{taper:0,wobble:.4});
   s.knockout(a,.7*x);s.knockout(b2,.7*x);s.fill(K,a,.95*x);s.fill(K,b2,.95*x);}}}
 void z;}
function blockSpark(s:Sheet,c:Camera,tp:number,size:number){if(tp<T_I||tp>=T_I+.28)return;const g=pr(c,[I[0],.2,I[1]]);if(!g)return;sparkBurst(s,Y,g[0],g[1],size*(.6+.4*sm(T_I,T_I+.1,tp,easeOut)),{n:10,seed:23,g:1-sm(T_I+.1,T_I+.28,tp),width:10});}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;F:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),F:Math.exp(lerp(Math.log(a.F),Math.log(b.F),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Camera{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam(cur.P,cur.T,cur.F);}

// ================================================================ 1 · Berlin, 2024: the half-time change and the result (high main-stand camera)
const BCAM:V3=[-50,19,47];
function cam1(t:number):Camera{
 const ht=CUE(0,'At half time'),cm=CUE(0,'calm Martín'),sb=CUE(0,'Spain beat'),zp=(tt:number):V3=>{const z=zubiCh1(tt);return[z.x,1.1,z.z];};
 return plan(t,[
  [0,0,()=>({P:BCAM,T:[-52.5,6,-40],F:1150})],
  [ht-.2,1.5,()=>({P:BCAM,T:[Z_FROM[0]-1,1,Z_FROM[1]-4],F:2900})],
  [cm-.4,1.3,tt=>({P:BCAM,T:zp(tt),F:5200})],
  [sb-.3,1.6,tt=>({P:BCAM,T:mix3(zp(tt),[-60,1,-4],.45),F:2600})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),ht=CUE(0,'At half time'),rh=CUE(0,'Rodri was hurt'),cm=CUE(0,'calm Martín'),co=CUE(0,'came on'),sb=CUE(0,'Spain beat'),E=SECS(0);
  const win=sm(sb-.1,sb+.4,t);
  stadium(s,c,t,{cheer:.1+.9*win,flash:.15+1.2*win*(1-sm(E-.8,E,t)*.5)});
  // "calm Martín": a yellow ring under 18 as he runs on
  const z=zubiCh1(t);ring(s,c,z.x,z.z,.9,sm(cm-.1,cm+.35,t,easeOutBack)*(1-sm(E-.5,E-.1,t)),Y,44);
  // "came on": his run drawn ahead of him on the grass
  const rw=sm(co-.2,co+.4,t,easeOut)*(1-sm(sb,sb+.5,t));if(rw>.02){const P:[number,number][]=[];const{a,b}=zRun();for(let i=0;i<=10;i++){const q=zubiCh1(lerp(Math.max(t,a),b,i/10));P.push([q.x,q.z]);}if(b-t>.3)groundArrow(s,c,P,rw,Y,61,.25);}
  const v=view(s),items:{d:number;draw:()=>void}[]=[],ppu=pxPer(s),passing=!!s._passage.pending;
  LINE.forEach((a,k)=>{const cur=celPose(a,t),q=toCam(c,[cur.x,.9,cur.z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
   items.push({d:q[2],draw:()=>{const P=celPose(a,tt),px=h*ppu;drawPlayer(s,P.p,c,a.st,{x:P.x,z:P.z,yaw:P.yaw},{detail:passing||px<110?'low':'mid'});void k;}});});
  {const q=toCam(c,[z.x,.9,z.z]);if(q[2]>1){const h=c.F*1.8/q[2],px=h*ppu;items.push({d:q[2],draw:()=>{const P=zubiCh1(tt),big=px>=90&&!passing,pv=big?zubiCh1(tt-1/12):undefined;
   drawPlayer(s,P.p,c,ZUBI_MATCH,{x:P.x,z:P.z,yaw:P.yaw},{prev:pv?{pose:pv.p,place:{x:pv.x,z:pv.z,yaw:pv.yaw}}:undefined,detail:passing?'mid':px<55?'low':undefined});}});}}
  // the ball waiting on the centre spot
  {const bp:V3=[-52.5,.11,0],q=toCam(c,bp);if(q[2]>NEAR)items.push({d:q[2],draw:()=>{const g=scr(c,q);footballPanels(s,g[0],g[1],Math.max(4,c.F*.11/q[2]),{rot:0,key:K,shadow:B,seed:5});}});}
  items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
  // speed lines behind him while he runs on
  if(z.sp>0&&t>co-.3&&t<sb){const g=pr(c,[z.x,1,z.z]),g2=pr(c,[z.x+1.2,1,z.z+2.4]);if(g&&g2)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-g2[1],g[0]-g2[0]),{n:5,seed:31,len:110,width:6,cov:.7});}
  // "At half time … Rodri was hurt": the substitution graphic (16 off, 18 on); "Spain beat England": the 2–1 bug, confetti
  subBoard(s,sm(rh-.2,rh+.4,t)*(1-sm(sb-.2,sb+.3,t)));
  scoreBug(s,win,bump(sb+.2,sb+1.4,t));
  if(win>.02){const vw=s.W*s.fit,vh=s.H*s.fit;confetti(s,[R,Y,'paper'],[-vw/2,-vh/2+(t-sb)*60,vw,vh*.8],Math.round(34*win),71+Math.floor(tt*6),{size:13});}
  void ht;
 },
 aperture(t){const c=cam1(t),z=zubiCh1(t),g=pr(c,[z.x,1.05,z.z])??[0,0];return apertureDisc(g[0],g[1],Math.max(40,kAt(c,[z.x,1,z.z])*.55),12);},
 still:0,
};
ch1.still=CUE(0,'came on')+.6;

// ================================================================ 2 · how he does it: the demonstration live, a high touchline camera, real time
const tau2=(t:number)=>key(t,mono([[0,-5.2],[CUE(1,'pass forward'),-3.6],[CUE(1,'their striker'),-2.4],[CUE(1,'stands right'),-1.3],[CUE(1,'go through him')+.15,-.1],[CUE(1,'wins it'),T_I+.05],[SECS(1),T_I+.05+(SECS(1)-CUE(1,'wins it'))*.85]]),linear);
const P2:V3=[8,7,-16];
function cam2(t:number):Camera{
 const tau=tau2(t),z=at3(ZU,tau,1),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P2,T:[8.5,.6,1.8],F:1400})],
  [CUE(1,'pass forward')-.3,1.2,()=>({P:P2,T:mix3(b,z,.3),F:1900})],
  [CUE(1,'their striker')-.2,1.2,()=>({P:P2,T:[12,.8,2],F:1700})],
  [CUE(1,'stands right')-.2,1.2,()=>({P:P2,T:[8.6,.8,2.2],F:1250})],
  [CUE(1,'wins it')+.3,1.6,()=>({P:add3(P2,[-2,0,1]),T:mix3(z,at3(MT,tau,1),.4),F:2000})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt);
  const tH=CUE(1,'This is how'),tF=CUE(1,'pass forward'),tS=CUE(1,'their striker'),tR=CUE(1,'stands right'),tG=CUE(1,'go through him'),tW=CUE(1,'wins it'),E=SECS(1);
  trainingGround(s,c);
  // "This is how he does it": a ring under 36
  const zz=posT(Z_T,tp);ring(s,c,zz[0],zz[1],.9,sm(tH,tH+.4,t,easeOutBack)*(1-sm(tF,tF+.5,t)),Y,44);
  // "pass forward": a navy ring on the passer and an arrow the way he wants to pass
  const pw=sm(tF-.1,tF+.3,t,easeOutBack)*(1-sm(tR,tR+.4,t));{const p=posT(PS_T,tp);ring(s,c,p[0],p[1],.9,pw,K,46);const b=ballAt(tp);groundArrow(s,c,[[b[0]+.6,b[2]],[b[0]+4.2,b[2]+.4]],pw,K,63,.2);}
  // "their striker": a red ring on the striker
  const st=posT(ST_T,tp);ring(s,c,st[0],st[1],.9,sm(tS-.1,tS+.3,t,easeOutBack)*(1-sm(tG+.3,tG+.8,t)),R,47);
  // "stands right in the path": the lane from the ball to the striker — straight through him
  lane(s,c,tp,sm(tR-.15,tR+.5,t),sm(tR-.2,tR,t)*(1-sm(tG+.2,tG+.6,t)));
  // "go through him": the pass line, stopped at his boot
  passLine(s,c,sm(tG-.05,tG+.3,t)*(1-sm(E-.8,E-.4,t)));
  play(s,c,tau,tp,{minBall:10,smear:true,lines:true});
  // "wins it": the spark where his boot meets the ball, then his ring again
  blockSpark(s,c,tp,90);
  const zw=sm(tW,tW+.4,t,easeOutBack)*(1-sm(E-.6,E-.2,t));if(zw>.02){const g=pr(c,at3(ZU,tp,2.35));if(g)sparkBurst(s,Y,g[0],g[1],(30+kAt(c,at3(ZU,tp))*.25)*zw,{n:8,seed:29,g:clamp(1-(t-tW)/1.6),width:7});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/Math.max(1,q[2])*1.3),12);},
 still:0,
};
ch2.still=CUE(1,'stands right')+.6;

// ================================================================ 3 · watch again: slow motion from a LOW camera behind the passer
const tau3=(t:number)=>key(t,mono([[0,-4.3],[CUE(2,'Watch again'),-4.2],[CUE(2,'passer moves'),-3.5],[CUE(2,'slides across'),-2.3],[CUE(2,'stay in the line'),-.9],[CUE(2,'simple pass'),TP2-.25],[SECS(2),T_R2+.2]]),linear);
function cam3(t:number):Camera{
 const tau=tau3(t),p=at3(PS,tau,0),z=at3(ZU,tau,1);
 return plan(t,[
  [0,0,()=>({P:[p[0]-6.5,2.3,p[2]-5.5],T:mix3(z,at3(ST,tau,1),.25),F:2000})],
  [CUE(2,'slides across')-.3,1.2,()=>({P:[p[0]-6,2.1,p[2]-4.5],T:z,F:2500})],
  [CUE(2,'stay in the line')+.2,1.2,()=>({P:[B0[0]-6,2,B0[1]-4.5],T:mix3(z,[I[0],.3,I[1]],.4),F:2600})],
  [CUE(2,'simple pass')-.4,1.4,()=>({P:[ZP2[0]+6.5,2.4,ZP2[1]-5],T:mix3(z,at3(MT,tau,.8),.4),F:1800})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3(t),tau=tau3(t),tt=twos(t),tp=tau3(tt);
  const tM=CUE(2,'passer moves'),tS=CUE(2,'slides across'),tL=CUE(2,'stay in the line'),tP=CUE(2,'simple pass'),E=SECS(2);
  trainingGround(s,c);
  // "passer moves": his carry across, drawn ahead of him (navy)
  const mw=sm(tM-.1,tM+.4,t)*(1-sm(tL,tL+.5,t));if(mw>.02){const P:[number,number][]=[];for(let i=0;i<=10;i++)P.push(posT(PS_T,lerp(tp,-.2,i/10)));if(tp<-.4)groundArrow(s,c,P,mw,K,64,.14);}
  // "slides across": his shuffle path drawn ahead of him (yellow)
  const sw=sm(tS-.1,tS+.4,t)*(1-sm(tP-.3,tP+.2,t));if(sw>.02){const P:[number,number][]=[];for(let i=0;i<=10;i++)P.push(posT(Z_T,lerp(tp,-.3,i/10)));if(tp<-.5)groundArrow(s,c,P,sw,Y,65,.14);}
  // "stay in the line": the lane from the ball to the striker, through him
  lane(s,c,tp,sm(tL-.15,tL+.5,t),sm(tL-.2,tL,t)*(1-sm(tP-.4,tP,t)));
  // "simple pass": the pass to the team-mate, dashed, and a ring on him
  const qw=sm(tP-.1,tP+.4,t)*(1-sm(E-.5,E-.2,t));dashLine(s,c,C1,MT_R,qw,qw,Y,.1);{const m=posT(MT_T,tp);ring(s,c,m[0],m[1],.85,qw,Y,48);}
  const r=play(s,c,tau,tp,{minBall:12,smear:true});
  blockSpark(s,c,tp,110);
  void r;
 },
 aperture(t){const c=cam3(t),q=pr(c,at3(ZU,tau3(t),1.1))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'stay in the line')+.5;

// ================================================================ 4 · your turn: the lesson from a raised camera behind Zubimendi
const tau4=(t:number)=>key(t,mono([[0,-3.8],[CUE(3,'stand where'),-2.2],[CUE(3,'forward pass'),-.35],[CUE(3,'through you'),T_I+.05],[CUE(3,'not around'),T_I+.35],[SECS(3),T_I+.9]]),linear);
function cam4(t:number):Camera{
 return plan(t,[
  [0,0,()=>({P:[20,5.5,-2.5],T:[8,.7,1.8],F:2200})],
  [CUE(3,'stand where')-.3,1.3,()=>({P:[19.5,7.5,-4.5],T:[7,.3,2],F:1850})],
  [CUE(3,'not around')-.2,1.4,()=>({P:[19,9.5,-4],T:[7.5,0,2.2],F:1600})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4(t),tau=tau4(t),tt=twos(t),tp=tau4(tt);
  const tY=CUE(3,'Your turn'),tW=CUE(3,'stand where'),tF=CUE(3,'forward pass'),tT=CUE(3,'through you'),tN=CUE(3,'not around'),E=SECS(3);
  trainingGround(s,c);
  // "Your turn" / "stand where": a ring under him that stays
  const zz=posT(Z_T,tp);ring(s,c,zz[0],zz[1],1,sm(tY-.1,tY+.35,t,easeOutBack)*(1-sm(E-.6,E-.2,t)),Y,44);
  // "stand where …": the lane from the ball to the striker, through him
  lane(s,c,tp,sm(tW-.15,tW+.5,t),sm(tW-.2,tW,t)*(1-sm(tN,tN+.4,t)*.6));
  // "forward pass": the pass arrow, stopped at his boot; "through you": the spark
  passLine(s,c,sm(tF-.1,tF+.3,t)*(1-sm(E-.6,E-.2,t)));
  // "not around": the two ways round him in red, crossed out
  aroundArcs(s,c,tp,sm(tN-.25,tN+.2,t)*(1-sm(E-.5,E-.15,t)),sm(tN+.1,tN+.45,t)*(1-sm(E-.5,E-.15,t)));
  play(s,c,tau,tp,{minBall:11,smear:true});
  blockSpark(s,c,tp,100);
  void tT;
 },
 still:0,
};
ch4.still=CUE(3,'not around')+.5;

const film:RisoStory={
 id:'zubimendi-signature',format:'11v11',title:'Zubimendi: the calm holding midfielder',
 theme:'Stand where the forward pass has to go through you, not around you.',
 ageNote:'UEFA Euro 2024 final, Spain 2–1 England, Olympiastadion, Berlin, 14 July 2024 (the half-time change: Zubimendi on for Rodri), then a clearly labelled "how he does it" demonstration on a training pitch. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a pass rolls in from the point and stops dead against a yellow bar — the midfielder in the lane. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:clamp(age/.45),e=easeOut(u),bx=x-160+e*120,fade=age<=0?1:1-clamp((age-.7)/.3);
  const bar=ribbon([[x+10,y-70],[x+10,y+70]],18,{seed,taper:.2,wobble:.8});s.knockout(bar,.9*fade);s.fill(Y,bar,.95*fade);s.stroke(K,bar,2,.6*fade);
  if(u<1)speedLines(s,K,bx,y,0,{n:4,seed,len:90*(1-u),width:7,cov:.8});
  if(age>=.4&&age<.7)sparkBurst(s,Y,x-10,y,90,{n:8,seed,g:1-clamp((age-.4)/.3),width:10});
  footballPanels(s,bx,y,34,{rot:(age<.45?age:.45)*14+hash(seed,3)*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
