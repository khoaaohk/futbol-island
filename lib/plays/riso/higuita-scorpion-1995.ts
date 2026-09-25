/** Higuita — the fly-goalkeeper who joins the attack. A signature-move riso film (iconic plays, FUTSAL; RisoStory, chapters mode).
 *
 * WHO: the card "Higuita" is the FUTSAL goleiro Leo Higuita (Leonardo de Melo Vieira Leite, born Rio de Janeiro 1986, Kazakhstan and AFC
 * Kairat), listed under `goleiro` in lib/town/positionPlayers.json; lib/town/playerProfiles.json: "the Brazilian-born fly-goalkeeper
 * (nicknamed after René Higuita) who dribbles and scores from his own goal"; playerAppearance.json country Kazakhstan. His iconicPlays.json
 * entry is kind "signature", "the keeper who joins the attack", lesson "A brave keeper can dribble out and become an extra attacker."
 * So this film is NOT René Higuita's 1995 scorpion kick (the file id is the lead's placeholder): the card's player is the futsal keeper.
 *
 * THE MOMENT (why it represents the signature): FIFA Futsal World Cup Lithuania 2021, round of 16, Kazakhstan 7–0 Thailand, Kaunas,
 * 23 September 2021 — the World Cup match in which the goalkeeper himself scored (Kazakhstan's seventh goal, 37th minute). No written source
 * we could read describes HOW that goal was made, so the film stages his documented signature (a keeper who carries the ball out of his
 * area and becomes the extra outfield attacker, 5 v 4) in that real match, and the narration says so honestly: "Here's how keeper Higuita
 * plays", then "Higuita scored that day" (true). No other score, minute or play detail is narrated.
 *
 * SOURCES (fetched, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Leo Higuita" (raw) — https://en.wikipedia.org/wiki/Leo_Higuita : Brazilian-born Kazakh futsal goalkeeper, Kairat,
 *    Kazakhstan (27 goals in 30 caps at the time of the infobox); "His goalscoring ability led to his nickname of 'Higuita'"; 1.80 m.
 *  - Wikipedia, "2021 FIFA Futsal World Cup" (raw) — round of 16, 23 Sep 2021, Kazakhstan 7–0 Thailand, Žalgiris Arena, Kaunas, attendance
 *    464; scorers include Higuita 37'.
 *  - FIFA (inside.fifa.com), "Matchday 11 review: Argentina, Brazil and Kazakhstan reach quarters" — "Goalkeeper Leo Higuita scored as
 *    Kazakhstan cruised through"; "their outstanding goalkeeper Higuita, who kept a clean sheet and even scored a goal of his own"; quote
 *    "I'll remember this day for the rest of my life."
 *  - FIFA (inside.fifa.com), "Higuita: We brought the whole of Kazakhstan to a halt" — named Best Goalkeeper in the World five times in six years.
 *  - Getty Images 1342227457 (FIFA/Angel Martinez), caption: "Higuita of Kazakhstan celebrates after scoring their sides seventh goal during
 *    the FIFA Futsal World Cup 2021 Round of 16 match between Kazakhstan and Thailand at Kaunas Arena on September 23, 2021" (photo viewed).
 *  - FIFA Futsal World Cup social post (search snippet only): "No one is safe from a long-range Higuita rocket!"
 * CONFIRMED: date, round, venue city, 7–0, Higuita scored the 7th goal and kept a clean sheet; small crowd (464); in the photo he wears a
 *  CORAL/SALMON-PINK goalkeeper shirt with dark side panels and pink shorts, short sleeves, a black elbow sleeve, wrist tape, bare hands,
 *  the blue captain's armband on his left arm; dark short hair and a beard (NOT bald, as playerAppearance.json guesses); height 1.80 m;
 *  his signature is carrying the ball out and scoring as a keeper.
 * INFERRED (illustrative, not narrated): HOW the goal happened (the dribble out, the 5 v 4, the shot, its foot — right — and corner);
 *  every position, run and timing; Kazakhstan's outfield kit (sky blue, yellow trim) and Thailand's (white shirts, navy shorts, a yellow
 *  keeper); the court colour (wood tone); the boards, the arena shape and crowd colours; which Thailand players pressed; the celebration.
 *
 * FRAMING (the TV broadcast; full-sheet card window 1.45:1 down to square, never the safe box; never top-down):
 *  1–2  LIVE — the high main-stand camera on the halfway line, panning with the ball in near real time, no overlays: he takes the ball in his
 *       area, dribbles out past the first presser, crosses halfway; Kazakhstan now attack five against four; he shoots, goal, he celebrates.
 *  3    REPLAY — slow motion from a low camera behind him: the nearest defender must choose (arrows to Higuita / to his teammate), blue rings
 *       count five Kazakhstan attackers, navy rings four defenders, the free man lights up with his open passing lane.
 *  4    LESSON — a low front camera: brave keeper (ring), the path he dribbled out (dashed), the extra attacker, look first (scan arcs), a tick
 *       for "safe", then he sprints back toward his empty goal (the danger shown in red).
 * All figures are the shared riso athlete (./athlete.ts) through ONE adapter, drawPlayer(). World: metres, RIGHT-HANDED like athlete.ts
 * (X along the 40 m court, Higuita's goal at X = +20, Thailand's at −20; Z across, +Z = the near touchline under the camera; y up).
 * Scenes read only their local t; every action keys off cue times (withTiming re-times the film); randomness is seeded.
 * Phone heat: ≤ 4 plates; small wide-shot figures print 'low'; during a passage only Higuita keeps 'mid'; the crowd is one batched mark set. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,rotPts,easeOut,easeIn,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string,string?][]}[]=[
 {label:'Live: the keeper goes',text:'Futsal World Cup, 2021: Kazakhstan against Thailand. Here’s how keeper Higuita plays. He takes the ball, dribbles out of his area, and keeps going past halfway!',seconds:11.6,
  cues:[[.2,'Futsal World Cup'],[2.3,'Kazakhstan against Thailand'],[4.4,'Here’s how'],[5.3,'keeper Higuita'],[6.8,'He takes the ball'],[7.9,'dribbles out'],[9.3,'keeps going'],[10.1,'past halfway']]},
 {label:'Live: five against four',text:'Now Kazakhstan have an extra attacker: five against four. He shoots... goal! Higuita scored that day.',seconds:8.4,
  cues:[[.15,'Now Kazakhstan'],[1.3,'extra attacker'],[2.4,'five against four','5 v 4'],[3.9,'He shoots',''],[5.0,'goal'],[6.0,'Higuita scored']]},
 {label:'Replay: someone is free',text:'Watch again. Defenders must choose: mark Higuita, or his teammate. Five against four means someone is always free.',seconds:8.8,
  cues:[[.15,'Watch again'],[1.3,'Defenders must choose'],[2.9,'mark Higuita'],[3.9,'or his teammate'],[5.1,'Five against four'],[6.4,'someone is always free','Always free']]},
 {label:'Your turn',text:'A brave keeper can dribble out and become an extra attacker. But look first, go only when it’s safe, and sprint back if you lose it.',seconds:10.8,
  cues:[[.15,'A brave keeper'],[1.4,'dribble out'],[2.5,'extra attacker','Extra attacker'],[4.0,'look first','Look first'],[5.0,'go only'],[5.9,'it’s safe'],[7.0,'sprint back','Sprint back'],[8.3,'lose it']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py higuita-scorpion-1995, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/higuita-scorpion-1995/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/higuita-scorpion-1995/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words,headline])=>headline===undefined?{at,words}:{at,words,headline})})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('higuita: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units) centred on the CANVAS (full sheet, never the safe box). */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const frame=(s:Sheet):View=>{const z=cam(s,0,0,1);return{hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60};};
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt);s.fill(ink,polyPath(q,true),cov);}

// ---------------------------------------------------------------- the TV camera: a right-handed pinhole looking at a target
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const depth=(c:Cam,P:V3)=>toCam(c,P)[2];
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
function quadP(c:Cam,q:V3[],minDepth=2):Pt[]|null{for(const p of q)if(toCam(c,p)[2]<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a ring painted on the floor (projected points; null when behind the camera) */
function floorRing(c:Cam,x:number,z:number,rx:number,rz=rx,n=28):Pt[]|null{const pts:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,q=pr(c,[x+Math.cos(a)*rx,0,z+Math.sin(a)*rz]);if(!q)return null;pts.push(q);}return pts;}
const pxAt=(c:Cam,P:V3,m:number)=>c.F*m/Math.max(NEAR,depth(c,P));

// ---------------------------------------------------------------- the arena (Kaunas, 2021): dark bowl, sparse crowd (464 that day), boards, wood court, futsal goals
const HALF_L=20,HALF_W=10,GW=1.5,GH=2;
type Stand={q:V3[]};type Seat={P:V3;h:number};
const ARENA:{stands:Stand[];seats:Seat[]}=(()=>{const stands:Stand[]=[],seats:Seat[]=[];
 const side=(a0:V3,a1:V3,out:V3,n:number,seed:number)=>{// a raked stand from the inner edge a0→a1, rising outward along `out` (x, z unit) to 14 m
  for(let i=0;i<n;i++){const p0=lerp3(a0,a1,i/n),p1=lerp3(a0,a1,(i+1)/n),O=(p:V3,d:number,y:number):V3=>[p[0]+out[0]*d,y,p[2]+out[2]*d];
   stands.push({q:[O(p0,0,1.3),O(p1,0,1.3),O(p1,15,12.5),O(p0,15,12.5)]});
   for(let r=0;r<12;r++)for(let k=0;k<5;k++){const h=hash(seed*7919+i*131+r*17+k,11);if(h>.13)continue;const u=(i+(k+.5)/5)/n,p=lerp3(a0,a1,u),d=(r+.5)/12;seats.push({P:O(p,d*15,1.6+d*11.2),h:hash(seed+i*37+r*5+k,4)});}}};
 side([-40,0,-13],[40,0,-13],[0,0,-1],24,1);side([40,0,13],[-40,0,13],[0,0,1],24,2);
 side([24,0,-28],[24,0,28],[1,0,0],14,3);side([-24,0,28],[-24,0,-28],[-1,0,0],14,4);
 return{stands,seats};})();
/** everything behind the court: the dark roof, the stands (blue seats in shadow), the sparse crowd, the roof lights */
function stands(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number}={}){
 const{roar=0}=o;s.fill(K,rectPath(-1e4,-1e4,2e4,2e4),.8);
 const st=new Path2D();for(const q of ARENA.stands){const p=quadP(c,q.q,3);if(p)st.addPath(polyPath(p,true));}s.tone(B,st,.5);
 const heads=new Path2D(),blues=new Path2D(),yel=new Path2D(),T=Math.floor(t*12);
 for(const q of ARENA.seats){const d=toCam(c,q.P);if(d[2]<4)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.42/d[2],2,16),lift=roar*z*1.2*Math.max(0,Math.sin(T*.9+q.h*TAU));
  heads.addPath(polyPath(blob(p[0],p[1]-z*.95-lift,z*.36,z*.38,Math.floor(q.h*97),{amp:.05,n:8}),true));(q.h<.5?blues:yel).rect(p[0]-z*.45,p[1]-z*.62-lift,z*.9,z*.95);}
 s.fill(Y,heads,.55);s.fill(B,blues,.95);s.fill(Y,yel,.9);
 // roof lights: a row of stepped yellow halos over the far stand
 const lights=[new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const q=pr(c,[i*6,17,-24]);if(!q||!inView(v,q,200))continue;const r=clamp(c.F*1.1/depth(c,[i*6,17,-24]),6,90);lights[0].addPath(polyPath(blob(q[0],q[1],r*2.2,r*1.4,40+i,{amp:.05,n:14}),true));lights[1].addPath(polyPath(blob(q[0],q[1],r*.9,r*.6,50+i,{amp:.05,n:12}),true));}
 s.fill(Y,lights[0],.28);s.fill(Y,lights[1],.9);
}
/** the floor round the court, the wood court, its painted lines, the boards and both goals (bulge = the net round the ball at X = −20) */
function court(s:Sheet,c:Cam,v:View,o:{bulge?:number;bz?:number;by?:number;glow?:number}={}){
 const{bulge=0,bz=0,by=.6,glow=0}=o;
 const bd=new Path2D(),pn=new Path2D();
 for(const q of[[[-24,0,-12.6],[24,0,-12.6],[24,1,-12.6],[-24,1,-12.6]],[[22.8,0,-12.6],[22.8,0,12.6],[22.8,1,12.6],[22.8,1,-12.6]],[[-22.8,0,12.6],[-22.8,0,-12.6],[-22.8,1,-12.6],[-22.8,1,12.6]]] as V3[][]){const p=polyP(c,q);if(p.length>2)bd.addPath(polyPath(p,true));}
 for(let k=0;k<12;k++){const x=-22+k*4,p=polyP(c,[[x,.25,-12.55],[x+2.6,.25,-12.55],[x+2.6,.72,-12.55],[x,.72,-12.55]]);if(p.length>2)pn.addPath(polyPath(p,true));}
 for(const X of[22.75,-22.75])for(let k=0;k<6;k++){const z=-11+k*4,p=polyP(c,[[X,.25,z],[X,.25,z+2.6],[X,.72,z+2.6],[X,.72,z]]);if(p.length>2)pn.addPath(polyPath(p,true));}
 // the arena floor (blue-grey) and the boards
 const fl=polyP(c,[[-24,0,-12.6],[24,0,-12.6],[24,0,30],[-24,0,30]]);if(fl.length>2){const p=polyPath(fl,true);s.knockout(p);s.tone(K,p,.42);s.tone(B,p,.35);}
 s.knockout(bd);s.fill(B,bd,.95);s.fill(K,bd,.25);s.fill(Y,pn,.85);
 // the wood court: yellow flat + a red tint, alternate planks a touch darker, plank seams along the court
 const cp=polyP(c,[[-HALF_L-.6,0,-HALF_W-.6],[HALF_L+.6,0,-HALF_W-.6],[HALF_L+.6,0,HALF_W+.6],[-HALF_L-.6,0,HALF_W+.6]]);if(cp.length<3)return;
 const cpp=polyPath(cp,true);s.knockout(cpp);s.fill(Y,cpp,.5);s.fill(R,cpp,.2);
 const strips=new Path2D(),seams=new Path2D();
 for(let k=0;k<42;k++){const z0=-HALF_W-.6+k*.5,z1=z0+.5;if(hash(k,5)>.6){const q=polyP(c,[[-HALF_L-.6,0,z0],[HALF_L+.6,0,z0],[HALF_L+.6,0,z1],[-HALF_L-.6,0,z1]]);if(q.length>2)strips.addPath(polyPath(q,true));}
  const a=pr(c,[-HALF_L-.6,0,z0]),b=pr(c,[HALF_L+.6,0,z0]);if(a&&b){seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 s.fill(R,strips,.12);s.stroke(K,seams,2.5,.22);
 // painted lines (paper): touchlines, goal lines, halfway, centre circle, both penalty areas (6 m quarter circles from each post + the line), the 6 m and 10 m marks
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.08,ln);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n=14)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 for(let k=0;k<4;k++){const x0=-HALF_L+k*10,x1=x0+10;L([x0,0,-HALF_W],[x1,0,-HALF_W]);L([x0,0,HALF_W],[x1,0,HALF_W]);}
 for(const X of[-HALF_L,0,HALF_L])for(let k=0;k<2;k++)L([X,0,-HALF_W+k*10],[X,0,-HALF_W+(k+1)*10]);
 arc(0,0,3,0,TAU,24);arc(0,0,.08,0,TAU,6);
 for(const [gx,d] of[[-HALF_L,1],[HALF_L,-1]] as [number,number][]){
  arc(gx,-GW,6,d>0?-Math.PI/2:-Math.PI/2,d>0?0:-Math.PI,8);arc(gx,GW,6,d>0?0:Math.PI,d>0?Math.PI/2:Math.PI/2,8);L([gx+d*6,0,-GW],[gx+d*6,0,GW]);
  arc(gx+d*6,0,.1,0,TAU,6);arc(gx+d*10,0,.1,0,TAU,6);}
 s.knockout(ln,.92);
 if(glow>0){const g=floorRing(c,HALF_L-.4,0,2.6,3.2,26);if(g){const rr=ribbon(g,pxAt(c,[HALF_L,0,0],.22),{close:true,seed:77,taper:0,wobble:1.2});s.knockout(rr,.8*glow);s.fill(R,rr,glow);}}
 const seen=(X:number)=>[[X,0,-GW],[X,GH,GW],[X+Math.sign(X),0,0]].some(P=>{const q=pr(c,P as V3);return!!q&&inView(v,q,40);});
 if(seen(-HALF_L))goal(s,c,-HALF_L,-1,bulge,bz,by);if(seen(HALF_L))goal(s,c,HALF_L,1,0,0,.6);
}
/** a futsal goal at X (3 × 2 m), net 0.9 m deep outward (out = ±1), red-and-paper striped frame; bulge pushes the back net out around (bz, by) */
function goal(s:Sheet,c:Cam,X:number,out:number,bulge:number,bz:number,by:number){
 const back=(z:number,y:number)=>X+out*(lerp(.95,.55,y/GH)+bulge*Math.exp(-((z-bz)**2+(y-by)**2)/.35));
 const hull:V3[]=[[X,0,-GW],[X,GH,-GW],[X,GH,GW],[X,0,GW],[back(GW,0),0,GW],[back(GW,GH),GH,GW],[back(-GW,GH),GH,-GW],[back(-GW,0),0,-GW]];
 const planes:V3[][]=[[hull[0],hull[1],hull[6],hull[7]],[hull[3],hull[2],hull[5],hull[4]],[hull[1],hull[2],hull[5],hull[6]],[hull[7],hull[6],hull[5],hull[4]]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}s.knockout(net,.45);s.fill(K,net,.18);
 const mesh=new Path2D();
 for(let i=0;i<=10;i++){const z=lerp(-GW,GW,i/10);seg3(c,[back(z,GH),GH,z],[back(z,0),0,z],.02,mesh);seg3(c,[X,GH,z],[back(z,GH),GH,z],.02,mesh);}
 for(let j=1;j<7;j++){const y=GH*j/7;for(let i=0;i<5;i++){const z0=lerp(-GW,GW,i/5),z1=lerp(-GW,GW,(i+1)/5);seg3(c,[back(z0,y),y,z0],[back(z1,y),y,z1],.02,mesh);}seg3(c,[X,y,-GW],[back(-GW,y),y,-GW],.02,mesh);seg3(c,[X,y,GW],[back(GW,y),y,GW],.02,mesh);}
 s.fill(K,mesh,.55);
 const fr=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:V3,b:V3,n:number)=>{seg3(c,a,b,.08,fr);seg3(c,a,b,.13,edge);for(let k=0;k<n;k+=2)seg3(c,lerp3(a,b,k/n),lerp3(a,b,(k+1)/n),.08,bands);};
 bar([X,0,-GW],[X,GH,-GW],8);bar([X,0,GW],[X,GH,GW],8);bar([X,GH,-GW-.04],[X,GH,GW+.04],12);
 s.fill(K,edge,.9);s.knockout(fr);s.fill(R,bands);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.4],[R,.24]];
const SKIN_H:InkFill[]=[[Y,.42],[R,.3],[K,.06]];
/** Leo Higuita (confirmed from the photo): coral-pink shirt with dark side panels (trim), pink shorts, short sleeves, bare hands; dark hair.
 * Pink socks, navy boots inferred. No number (not confirmed for the national team). */
const HIGUITA:AthleteStyle={shirt:R,shorts:[R,.85],socks:R,boots:K,trim:K,skin:SKIN_H,hair:K,hairStyle:'short',line:K,sleeves:'short',build:{height:1.8,bulk:1.04,thighs:1.08},number:null,seed:2};
/** Kazakhstan outfield (inferred): sky blue shirts (blue screen), blue shorts, yellow trim */
const KAZ=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.62],shorts:B,socks:[B,.62],boots:K,trim:Y,skin:SKIN,hair:K,hairStyle:'short',line:K,seed:10,...o});
/** Thailand (inferred): white shirts, navy shorts, white socks, red trim; the keeper in yellow */
const THA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.85],socks:'paper',boots:K,trim:R,skin:[[Y,.45],[R,.3],[K,.1]],hair:K,hairStyle:'short',line:K,seed:20,...o});
const THA_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,trim:K,skin:[[Y,.45],[R,.3],[K,.1]],hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',build:{height:1.78},seed:31};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{ink:[Y,.75],threshold:8});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyed tracks [τ, X, Z] (τ = live seconds, 0 = he takes the ball)
type Role='hig'|'kaz'|'tha'|'gk';
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number]};
const SHOT=8.6,IN_NET=SHOT+.72;
const ACTORS:Actor[]=[
 {name:'Higuita',role:'hig',style:HIGUITA,keys:[[-6,16.4,.5],[-.4,16.3,.5],[0,16.05,.55],[.9,12.6,.6],[1.6,10.0,.3],[2.1,8.3,-.45],[2.8,5.5,-.85],[3.7,1.3,-.85],[4.4,-.9,-.8],[5.4,-2.6,-.9],[6.6,-3.8,-1.1],[7.6,-4.6,-1.0],[8.2,-5.4,-1.0],[8.6,-5.8,-1.0],[9.1,-6.1,-.6],[9.9,-5.6,1.2],[10.9,-4.3,3.3],[12.3,-3.2,4.5],[14,-2.6,5]]},
 {name:'Presser',role:'tha',style:THA({seed:21}),engage:[.2,2.4],moves:[{kind:'lunge',at:1.8,dur:.8,side:'l'}],keys:[[-6,5,1.6],[0,6.8,1.4],[1.2,8.9,1.0],[1.7,9.3,.8],[2.3,9.0,.5],[3,7.3,.1],[4.5,3,-.4],[7,-1.2,-.8],[9.5,-3,-.6],[14,-3.4,0]]},
 {name:'Cover',role:'tha',style:THA({seed:22,hairStyle:'curly'}),engage:[5.8,8.9],moves:[{kind:'lunge',at:8.6,dur:.8,side:'r'}],keys:[[-6,-.5,3.2],[0,-1.2,3.2],[3,-4,3.4],[5.5,-6,2.8],[7.4,-6.9,1.5],[8.6,-7.2,.6],[10,-8,.8],[14,-8.5,1]]},
 {name:'Back',role:'tha',style:THA({seed:23}),keys:[[-6,-3,-3.2],[0,-3.4,-3.3],[3,-6.5,-3.8],[6,-9.2,-4.6],[8.8,-10.1,-4.4],[10.5,-10.5,-3.5],[14,-11,-3]]},
 {name:'Pivot guard',role:'tha',style:THA({seed:24,hairStyle:'balding'}),keys:[[-6,-8,1],[0,-8.4,.9],[3,-11,.2],[6,-12.8,-1.9],[8.8,-13.3,-2.2],[10.5,-13.8,-1.8],[14,-14,-1.5]]},
 {name:'Thailand keeper',role:'gk',style:THA_GK,moves:[{kind:'dive',at:9.15,dur:.85,side:'l'}],keys:[[-6,-18.6,.1],[5,-18.5,0],[8.4,-18.6,-.3],[14,-18.6,-.3]]},
 {name:'Fixo',role:'kaz',style:KAZ({seed:11}),keys:[[-6,6.5,4.6],[0,6,4.8],[3,1.5,6.2],[5.5,-3,6.4],[8.2,-4.2,6.2],[9.8,-4.6,5],[11.5,-4.4,4.2],[14,-3.6,5]]},
 {name:'Ala left',role:'kaz',style:KAZ({seed:12}),keys:[[-6,2.5,-6],[0,2,-6.2],[3,-2.5,-6.5],[5.5,-6.5,-6.6],[8.2,-8,-6.6],[9.8,-7.2,-2.6],[11.5,-5.6,1.8],[14,-4.4,3.6]]},
 {name:'Ala right',role:'kaz',style:KAZ({seed:13,hairStyle:'curly'}),keys:[[-6,-2.5,4.2],[0,-3,4.3],[3,-7,4.8],[5.5,-10,4.8],[8.2,-11.8,4.6],[9.8,-9,3],[11.5,-6.4,3.5],[14,-5,4.4]]},
 {name:'Pivot',role:'kaz',style:KAZ({seed:14,build:{height:1.84,bulk:1.08}}),keys:[[-6,-9,-1.4],[0,-9.4,-1.4],[3,-12,-2.4],[5.5,-13.6,-3.1],[8.2,-14.4,-3.2],[9.8,-11,-1.2],[11.5,-7,2.4],[14,-5.6,3.6]]},
];
const HIG=0,PRESSER=1,COVER=2,FIXO=6;
const KAZ_IDS=[0,6,7,8,9],THA_IDS=[1,2,3,4];
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-6,T1=14,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- the ball: at his feet, dribbled (right foot), struck low to the far post
const BALL_R=.11,CYC=2.2;
const GOAL_PT:V3=[-HALF_L-.35,.55,-1.05],REST:V3=[-HALF_L-.62,BALL_R,-1.0];
/** the dribble: ahead of him along his run and a touch to his right, pushed out on each touch and caught up by the stride */
function footBall(tau:number):V3{const[x,z]=posOf(HIG,tau),v=velOf(HIG,tau),sp=Math.hypot(v[0],v[1]),fx=sp>.3?v[0]/sp:-1,fz=sp>.3?v[1]/sp:0;
 const ph=((distOf(HIG,tau)/CYC)%1+1)%1,lead=sp>.3?.34+.42*easeOut(ph):.3,right=.1;return[x+fx*lead-fz*right,BALL_R,z+fz*lead+fx*right];}
function ballAt(tau:number):V3{
 if(tau<SHOT)return footBall(tau);
 const s0=footBall(SHOT);
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],GOAL_PT[0],u),lerp(BALL_R,GOAL_PT[1],u)+.25*Math.sin(Math.PI*u),lerp(s0[2],GOAL_PT[2],u)];}
 const u=clamp((tau-IN_NET)/.5),e=easeIn(u),bo=Math.abs(Math.sin(clamp((tau-IN_NET-.5)/.8)*Math.PI*2))*.12*(1-clamp((tau-IN_NET-.5)/.8));
 return[lerp(GOAL_PT[0],REST[0],e),lerp(GOAL_PT[1],BALL_R,e)+bo,lerp(GOAL_PT[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET-.05?0:.5*Math.exp(-(tau-IN_NET)*2.4)*(1+.3*Math.sin((tau-IN_NET)*16));

// ---------------------------------------------------------------- poses (degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:40,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** on the ball in his area: sole resting on it, chest up, head up (looking for the space) */
const SOLE:Partial<Pose>={rHipF:26,rKnee:30,rAnk:-18,lHipF:10,lKnee:22,lean:6,neckP:-14,lShA:22,rShA:26,lElb:30,rElb:34};
/** the clap (the Getty photo: both palms together in front of the chest) */
const CLAP:Partial<Pose>={lShF:70,rShF:70,lShA:-6,rShA:-6,lElb:70,rElb:70,lHand:1,rHand:1,neckP:-8,lean:4};
type PoseOut={p:Pose;yaw:number};
function poseOf(k:number,tau:number):PoseOut{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),h=posOf(HIG,tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(h[0]-x,h[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.3):a.role==='tha'?READY:stand();
 if(k===HIG){
  if(tau<SHOT+.5){const s=clamp((sp-1.5)/4);p=blendPose(over(stand(),SOLE,1),dribble(distOf(HIG,tau)/CYC,{foot:'r',speed:.4+.45*s}),clamp((sp-.25)/.8));if(tau<.3)yaw=Math.PI;}
  else{p=blendPose(runCycle(distOf(HIG,tau)/3.2,{speed:clamp(sp/7)}),celebrate(tau*.9,{kind:'run'}),sm(SHOT+.5,SHOT+1,tau));p=over(p,CLAP,sm(11.6,12.1,tau));}
  const D=.9,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.75}),Math.min(sm(0,.12,u),1-sm(1.05,1.5,u)));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.2),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/3.2,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.08});}
 // teammates throw their arms up on the goal
 if(a.role==='kaz'&&tau>IN_NET+.2)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-16,lHand:1,rHand:1},sm(IN_NET+.2,IN_NET+.7,tau)*(1-sm(11.8,12.5,tau)));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: paper sphere, navy panels, rim, glint
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{smear?:number;dir?:number}={}){
 const{smear=0,dir=0}=o;let pts=blob(x,y,r,r,7,{amp:.025,n:30});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back,p[1]-dy*smear*back] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<12){s.fill(K,ribbon(pts,Math.max(2.5,r*.22),{seed:8,close:true,wobble:.4}));return;}
 s.save();s.clip(disc);s.fill(K,crescent(x,y,r*1.02,[-.42,-.45]),.2);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr0:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr0,cy+Math.sin(a)*pr0]);}return polyPath(q,true);};
 pan.addPath(pent(x,y,r*.32,rot-Math.PI/2));for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.28,a+Math.PI));}
 s.fill(K,pan,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(3,r*.075),{seed:9,close:true,pressure:.5,wobble:r*.02}));
 if(r>=20)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,10,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the court's players through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
type Override={x:number;z:number;p:Pose;yaw:number;prev?:Pose};
/** everything on the court at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;before?:(r:PlayOut)=>void;after?:(r:PlayOut)=>void;heroOver?:Override;ballOver?:V3|null;smearHero?:boolean;cullNear?:boolean}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=k===HIG&&o.heroOver?[o.heroOver.x,o.heroOver.z]:posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.8/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 if(o.cullNear){const hd=list.find(e=>e.k===HIG)?.d??0;for(let i=list.length-1;i>=0;i--)if(list[i].k!==HIG&&list[i].d<hd*.85)list.splice(i,1);}
 const b=o.ballOver===undefined?ballAt(tau):o.ballOver,bq=b?toCam(c,b):null,bg=bq&&bq[2]>=NEAR?scr(c,bq):null,br=bg&&bq?Math.max(minBall,c.F*BALL_R/bq[2]):0,bground=b?pr(c,[b[0],0,b[2]]):null;
 const pre:PlayOut={list,bg,br};o.before?.(pre);
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<380)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.16,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*1.1,br*.3,2,{amp:.05,n:12}),true));s.fill(K,sh,.3);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg&&b)ball(s,bg[0],bg[1],br,(b[0]+b[2])/BALL_R*.5,{smear:tau>SHOT&&tau<IN_NET&&!o.ballOver?.6:0,dir:Math.atan2(0,1)});};
 let ballDone=!bq||!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],isH=e.k===HIG,ov=isH?o.heroOver:undefined,{p,yaw}=ov?{p:ov.p,yaw:ov.yaw}:poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=260;
  // phone heat: low detail for small figures; during a passage only Higuita keeps 'mid'
  const detail=passing?(isH?'mid':'low'):px<50||(!isH&&px<95)?'low':'auto';
  const prev=ov?ov.prev:big&&!passing?poseOf(e.k,tauPrev).p:undefined;
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<380?false:undefined,detail},{x:e.x,z:e.z,yaw},prev?{prev,smear:hero&&isH&&!!o.smearHero}:{});
  if(isH)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};o.after?.(out);return out;
}
/** the replay wipe: long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<14;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L,y],[x0+L,y]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** a ring painted under a player (ink, fading in with g) */
function underRing(s:Sheet,c:Cam,x:number,z:number,ink:string,g:number,seed:number,r=.62){if(g<=.02)return;const pts=floorRing(c,x,z,r*(.6+.4*g),r*(.6+.4*g)*.9,26);if(!pts)return;const rr=ribbon(pts,pxAt(c,[x,0,z],.13),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*g);s.fill(ink,rr,g);}
/** a dashed floor line from a to b (metres), drawn to `progress`, optional arrow head */
function floorDash(s:Sheet,c:Cam,pts3:V3[],ink:string,wm:number,progress:number,seed:number,head=true){if(progress<=.02)return;const pts:Pt[]=[];for(const P of pts3){const q=pr(c,P);if(q)pts.push(q);}if(pts.length<2)return;
 const line=partial(pts,clamp(progress)),w=pxAt(c,pts3[Math.floor(pts3.length/2)],wm);if(line.length<2)return;s.knockout(ribbon(line,w*1.6,{seed,taper:.1,wobble:.8,gaps:dashGaps(line,w*4.5)}),.8);s.fill(ink,ribbon(line,w,{seed,taper:.1,wobble:.8,gaps:dashGaps(line,w*4.5)}));if(head&&progress>.9)arrowHead(s,ink,line,w*3.2);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera on the halfway line, near real time
const CAM1:V3=[0,9.5,25];
/** τ from chapter-1 time: the players stand while the caption names the match, then real time from "He takes the ball" */
const tau1=(t:number)=>{const tk=CUEW(0,'He takes');return t<tk?-(tk-t)*.25:t-tk;};
/** chapter 2 carries on from chapter 1's last frame; the shot lands on "He shoots", the net on "goal" (≈ real time) */
const tau2=(t:number)=>{const a=tau1(SECS(0)),hs=CUEW(1,'He shoots'),g=CUEW(1,'goal');return key(t,[[0,a],[hs,SHOT-.12],[g,IN_NET+.05],[SECS(1),IN_NET+.05+SECS(1)-g]],linear);};
function liveCam(tau:number,tStory:number):Cam{
 const b=(u:number)=>ballAt(Math.min(u,SHOT+.05)),b0=b(tau),b1=b(tau-.4),b2=b(tau-.8),bx=(b0[0]+b1[0]+b2[0])/3,bz=(b0[2]+b1[2]+b2[2])/3;
 const shot=sm(SHOT-.2,IN_NET,tau,easeInOutSine),cel=sm(IN_NET+.5,IN_NET+1.6,tau,easeInOutSine),h=posOf(HIG,tau);
 let T:V3=[lerp(bx-1.2,-12.8,shot),.8,bz*.35];T=lerp3(T,[h[0]-.5,1,h[1]*.7],cel);
 const open=1-sm(0,3,tStory,easeInOutSine);
 const F=key(tau,[[-3,5000],[0,5000],[3,4500],[5,3900],[7.5,3900],[SHOT,4200],[IN_NET,4300],[IN_NET+1.6,5400],[14,5600]],easeInOutSine)*(1-.12*open);
 return look(CAM1,T,F);
}
function liveDraw(s:Sheet,tau:number,tp:number,tprev:number,tStory:number){
 const v=frame(s),c=liveCam(tau,tStory);
 stands(s,c,v,tau,{roar:sm(IN_NET,IN_NET+.3,tau)*(1-sm(10.5,12,tau))});
 court(s,c,v,{bulge:bulgeAt(tau),bz:GOAL_PT[2],by:GOAL_PT[1]});
 play(s,c,v,tau,tp,tprev,{minBall:7});
}
const heroChest=(c:Cam,tau:number):Pt=>{const[x,z]=posOf(HIG,tau),q=pr(c,[x,1.25,z]);return q??[0,0];};
const ch1:Scene={
 draw(s,t){liveDraw(s,tau1(t),tau1(twos(t)),tau1(twos(t)-1/12),t);},
 aperture(t){const c=liveCam(tau1(t),t),g=heroChest(c,tau1(t));return apertureDisc(g[0],g[1],Math.max(6,pxAt(c,[posOf(HIG,tau1(t))[0],1,0],.14)),12);},
 still:6.2,
};
// ---------------------------------------------------------------- 2 · live, continued: five against four, the shot, the goal, the clap
const ch2:Scene={
 draw(s,t){liveDraw(s,tau2(t),tau2(twos(t)),tau2(twos(t)-1/12),t+99);},
 aperture(t){const c=liveCam(tau2(t),t+99),g=heroChest(c,tau2(t));return apertureDisc(g[0],g[1],Math.max(6,pxAt(c,[posOf(HIG,tau2(t))[0],1,0],.14)),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · slow replay from a low camera behind him: the defender's choice, 5 v 4, the free man
const tau3=(t:number)=>key(t,[[0,3.4],[CUEW(2,'Defenders'),3.9],[CUEW(2,'mark Higuita'),4.5],[CUEW(2,'or his'),4.9],[CUEW(2,'Five'),5.4],[CUEW(2,'someone'),5.9],[SECS(2),6.4]],linear);
function cam3(t:number):Cam{
 const tau=tau3(t),[hx,hz]=posOf(HIG,tau),[px,pz]=posOf(HIG,tau-.5),mx=(hx+px)/2,mz=(hz+pz)/2,wide=sm(CUEW(2,'Defenders')-.3,CUEW(2,'Defenders')+.9,t,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine);
 const C:V3=[mx+6.2+2.6*wide+1.2*open,2.1+1.1*wide,mz+4.2+1.6*wide];
 const T:V3=[mx-5.5-1.5*wide,.8,mz-.6+1.2*wide];
 return look(C,T,1500-240*wide+120*open);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),dc=CUEW(2,'Defenders'),mh=CUEW(2,'mark Higuita'),ot=CUEW(2,'or his'),fa=CUEW(2,'Five'),sf=CUEW(2,'someone'),E=SECS(2);
  stands(s,c,v,tau);
  court(s,c,v);
  const fade=1-sm(E-.95,E-.7,t);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:6,hero:true,smearHero:true,before:()=>{
   // "Five against four": blue rings under the five Kazakhstan attackers (Higuita first), navy rings under the four defenders, one by one
   KAZ_IDS.forEach((k,i)=>{const[x,z]=posOf(k,tau);underRing(s,c,x,z,B,easeOutBack(sm(fa+i*.16,fa+i*.16+.3,t))*fade,40+i);});
   THA_IDS.forEach((k,i)=>{const[x,z]=posOf(k,tau);underRing(s,c,x,z,K,easeOutBack(sm(fa+.9+i*.12,fa+1.1+i*.12,t))*fade,50+i,.55);});
   // "mark Higuita": a coral ring under him
   const[hx,hz]=posOf(HIG,tau);underRing(s,c,hx,hz,R,easeOutBack(sm(mh-.1,mh+.25,t))*(1-sm(fa-.3,fa,t)),60,.75);
   // "Defenders must choose": two dashed arrows on the floor from the covering defender, one to Higuita, one to his teammate (each goes red on its cue)
   {const cv=posOf(COVER,tau),ch=sm(dc,dc+.6,t,easeOut)*(1-sm(fa-.4,fa-.1,t));
    const arrow=(k:number,lit:number,seed:number)=>{const to=posOf(k,tau),L=Math.hypot(to[0]-cv[0],to[1]-cv[1])||1,pts:V3[]=[];for(let i=0;i<=10;i++){const u=i/10*(1-.75/L),bend=Math.sin(Math.PI*u)*.6;pts.push([lerp(cv[0],to[0],u)+(to[1]-cv[1])/L*bend,0,lerp(cv[1],to[1],u)-(to[0]-cv[0])/L*bend]);}floorDash(s,c,pts,lit>.5?R:K,lit>.5?.16:.11,ch,seed);};
    arrow(HIG,sm(mh,mh+.2,t),71);arrow(FIXO,sm(ot,ot+.2,t),72);
    const[fx0,fz0]=posOf(FIXO,tau);underRing(s,c,fx0,fz0,R,easeOutBack(sm(ot-.1,ot+.25,t))*(1-sm(fa-.3,fa,t)),63,.75);}
   // "someone is always free": a yellow halo under the free man and his open lane from the ball
   const[fx,fz]=posOf(FIXO,tau),fr=sm(sf-.1,sf+.3,t,easeOut)*fade;underRing(s,c,fx,fz,Y,easeOutBack(fr),61,.9);
   if(fr>.02){const b=ballAt(tau),pts:V3[]=[];for(let i=0;i<=10;i++){const u=i/10;pts.push([lerp(b[0],fx+.4,u),0,lerp(b[2],fz-.3,u)]);}floorDash(s,c,pts,Y,.12,sm(sf+.1,sf+.8,t,easeOut)*fade,62);}
  },after:({hero})=>{
   // "Defenders must choose": the covering defender's question — a yellow burst over his head while he decides
   const cv=posOf(COVER,tau),f=posOf(FIXO,tau),from=pr(c,[cv[0],2.05,cv[1]]),ch=sm(dc,dc+.5,t,easeOut)*(1-sm(fa-.4,fa-.1,t));
   if(from&&ch>.02)sparkBurst(s,Y,from[0],from[1]-pxAt(c,[cv[0],2,cv[1]],.25),pxAt(c,[cv[0],2,cv[1]],.5),{n:7,seed:73,g:.6+.4*Math.abs(Math.sin(t*5)),width:Math.max(3,pxAt(c,[cv[0],2,cv[1]],.05)),cov:.9*ch});
   if(hero&&t>sf+.1&&t<E-.7){const f2=pr(c,[f[0],1.9,f[1]]);if(f2)sparkBurst(s,Y,f2[0],f2[1]-10,pxAt(c,[f[0],1.9,f[1]],.55),{n:9,seed:74,g:easeOutBack(sm(sf+.1,sf+.4,t)),width:Math.max(3,pxAt(c,[f[0],2,f[1]],.05))});}}});
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),g=heroChest(c,tau3(t));return apertureDisc(g[0],g[1],Math.max(8,pxAt(c,[posOf(HIG,tau3(t))[0],1.2,posOf(HIG,tau3(t))[1]],.16)),12);},
 still:6.9,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera; then he sprints back toward his empty goal
const LT=5.4;// the frozen live moment the lesson stands in (just past halfway)
const HX0=posOf(HIG,LT)[0],HZ0=posOf(HIG,LT)[1];
/** the lesson Higuita: on the ball (scanning on "look first"), then turning and sprinting back toward his own goal (+X) */
function lessonH(t:number):Override{
 const sb=CUEW(3,'sprint back'),lf=CUEW(3,'look first'),run=Math.max(0,t-sb-.35),turn=sm(sb,sb+.45,t,easeInOutSine);
 const dist=run<=0?0:run*run*2.4/(1+run*.35)+run*1.2*sm(0,1,run);
 const x=HX0+.2*turn+dist,z=HZ0+.5*turn;
 let p=blendPose(over(stand(),SOLE,1),READY,.2);
 p=over(p,{neckY:55*Math.sin((t-lf)*3.2)},bump(lf-.1,lf+2.1,t));
 const rp=runCycle(dist/3.1,{speed:clamp(.5+run*.25,0,1)});p=blendPose(p,rp,sm(sb+.25,sb+.6,t));
 return{x,z,p,yaw:lerpA(Math.PI,0,turn)};
}
function cam4(t:number):Cam{
 const sb=CUEW(3,'sprint back'),follow=sm(sb+.1,sb+1.2,t,easeInOutSine),h=lessonH(t),push=sm(0,1.2,t,easeInOutSine),wide=sm(CUEW(3,'extra')-.3,CUEW(3,'extra')+.5,t,easeInOutSine)*(1-sm(CUEW(3,'look')-.3,CUEW(3,'look')+.3,t,easeInOutSine));
 const C0:V3=[HX0-5.2-2*wide+1.5*(1-push),1.45+1.2*wide,HZ0+5.4+2.5*wide],T0:V3=[HX0+.4-2.4*wide,.95,HZ0-.3];
 const C1:V3=[h.x-6,2.6,h.z+9.5],T1:V3=[h.x+5.5,.9,h.z*.5];
 return look(lerp3(C0,C1,follow),lerp3(T0,T1,follow),lerp(2000-520*wide,1750,follow));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),bk=CUEW(3,'A brave'),dr=CUEW(3,'dribble out'),ex=CUEW(3,'extra'),lf=CUEW(3,'look first'),go=CUEW(3,'go only'),sa=CUEW(3,'it’s safe'),sb=CUEW(3,'sprint back'),li=CUEW(3,'lose it'),E=SECS(3);
  const tau=LT+.04*Math.sin(t*.8),h=lessonH(t),hp=lessonH(twos(t)-1/12);
  stands(s,c,v,t);
  court(s,c,v,{glow:sm(li-.1,li+.3,t)*(.65+.35*Math.abs(Math.sin(t*6)))});
  const ball0:V3=[HX0-.36,BALL_R,HZ0+.08];
  play(s,c,v,tau,tau,tau,{minBall:6,hero:true,cullNear:true,heroOver:{...lessonH(twos(t)),prev:hp.p},ballOver:ball0,before:()=>{
   // "A brave keeper": a coral ring under him
   underRing(s,c,h.x,h.z,R,easeOutBack(sm(bk-.05,bk+.3,t))*(1-sm(ex-.3,ex,t)),80,.8);
   // "dribble out": the path he carried the ball, from his own area to here, dashed yellow on the floor
   const pts:V3[]=[];for(let i=0;i<=24;i++){const[x,z]=posOf(HIG,lerp(0,LT,i/24));pts.push([x,0,z]);}
   floorDash(s,c,pts,Y,.14,sm(dr-.1,dr+.9,t,easeOut)*(1-sm(sb-.4,sb,t)),81);
   // "extra attacker": blue rings under the five Kazakhstan attackers (Higuita in coral, the fifth)
   KAZ_IDS.forEach((k,i)=>{if(k===HIG)return;const[x,z]=posOf(k,tau);underRing(s,c,x,z,B,easeOutBack(sm(ex+i*.14,ex+i*.14+.3,t))*(1-sm(lf-.3,lf,t)),82+i);});
   underRing(s,c,h.x,h.z,B,easeOutBack(sm(ex+.75,ex+1.05,t))*(1-sm(lf-.3,lf,t)),87,.95);
   // "sprint back": a red arrow on the floor from him to his own goal; "lose it": the danger — the goal glows red (court glow)
   const ra=sm(sb-.05,sb+.6,t,easeOut);if(ra>.02){const r3:V3[]=[];for(let i=0;i<=12;i++){const u=i/12;r3.push([lerp(HX0+.6,HALF_L-1.2,u),0,lerp(HZ0+.3,0,u)]);}floorDash(s,c,r3,R,.2,ra,88);}
  },after:({hero,bg})=>{
   // "look first": scan arcs in front of his eyes while his head turns
   const lw=sm(lf-.1,lf+.2,t)*(1-sm(go-.1,go+.2,t));
   if(hero&&lw>.02){const hd=hero.joints.head,nk=hero.joints.neck,u=Math.hypot(hd[0]-nk[0],hd[1]-nk[1])*2.2+6;
    for(let k=0;k<3;k++){const r=u*(1.4+k*.7),a0=Math.PI+.25,a1=Math.PI*2-.25,sw=Math.sin((t-lf)*3.2),pts:Pt[]=[];for(let i=0;i<=12;i++){const a=lerp(a0,a1,i/12)+sw*.35;pts.push([hd[0]+Math.cos(a)*r,hd[1]+Math.sin(a)*r*.55-u*.2]);}
     s.fill(Y,ribbon(pts,Math.max(3,u*.16),{seed:90+k,taper:.3,wobble:.8}),.95*lw*(1-k*.2));}}
   // "go only when it's safe": a big yellow tick with a navy echo beside him
   const tick=easeOutBack(sm(sa-.05,sa+.3,t))*(1-sm(sb-.2,sb+.1,t));
   if(hero&&tick>.02){const hd=hero.joints.head,pel=hero.joints.pelvis,S=Math.abs(pel[1]-hd[1])*.9*tick+4,cx=hd[0]+S*1.6,cy=hd[1]+S*.1,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[cx+q[0]*S,cy+q[1]*S] as Pt);
    sparkBurst(s,Y,cx,cy,S*1.2,{n:9,seed:93,g:tick});s.fill(K,ribbon(tk.map(q=>[q[0]+6,q[1]+6] as Pt),S*.22,{seed:94,taper:.2,wobble:1}),.45);s.fill(Y,ribbon(tk,S*.22,{seed:95,taper:.2,wobble:1}));}
   // "lose it": a Thailand boot pokes the ball loose — a navy spark at the ball
   if(bg){const age=t-li;if(age>-.15&&age<.6)sparkBurst(s,K,bg[0],bg[1],pxAt(c,ball0,.7),{n:8,seed:96,g:easeOutBack(clamp((age+.15)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(3,pxAt(c,ball0,.05))});}
   // his sprint: speed lines trail him
   const rw=sm(sb+.5,sb+1,t)*(1-sm(E-.8,E-.3,t));
   if(hero&&rw>.02){const hd=hero.joints.neck;speedLines(s,K,hd[0]-pxAt(c,[h.x,1,h.z],.5),hd[1]+pxAt(c,[h.x,1,h.z],.3),Math.PI,{n:4,seed:97,len:pxAt(c,[h.x,1,h.z],1.4),width:Math.max(3,pxAt(c,[h.x,1,h.z],.05)),spread:pxAt(c,[h.x,1,h.z],.6),cov:.7*rw});}
  }});
 },
 still:3.2,
};

const film:RisoStory={
 id:'higuita-scorpion-1995',format:'futsal',title:'Higuita, the keeper who attacks',theme:'A brave keeper can dribble out and become an extra attacker — look first, and sprint back.',
 ageNote:'FIFA Futsal World Cup 2021, round of 16, Kazakhstan v Thailand, Kaunas, 23 September 2021 (how the goal was made is illustrated). For players aged 7–12.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a mini futsal ball drops onto the wood, squeaks (yellow/red rings) and bounces once; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const fall=sm(0,.28,age,easeIn),by=y-160*(1-fall)-60*Math.max(0,Math.sin(clamp((age-.28)/.34)*Math.PI))*(age>.28?1:0),u=clamp((age-.28)/.5);
  if(age>.28&&u<1){s.fill(Y,ribbon(blob(x,y+r*.9,r*(1+2*u),r*(.3+.6*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);s.fill(R,ribbon(blob(x,y+r*.9,r*(.6+1.3*u),r*(.2+.4*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(x,y+r*.95,r*(.7+.3*fall),r*.2,seed+2,{n:16}),true),.32);
  ball(s,x,by,r,age*6);
 },
};
export default film;
