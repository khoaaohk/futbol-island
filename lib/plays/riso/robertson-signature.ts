/** Andrew Robertson's SIGNATURE film, "the overlap and cross": Liverpool 3–1 Manchester City, Premier League (round 12), Anfield,
 * Liverpool, Sunday 10 November 2019 (kick-off 16:30 GMT), attendance 53,324 — the 13th-minute goal that made it 2–0: Trent
 * Alexander-Arnold's long switch from right-back to Robertson on the left, Robertson's one touch, sprint and cross, Mohamed Salah's header.
 *
 * A riso-print recreation of a broadcast: one 3D choreography in pitch metres (X along the pitch, the goal Liverpool attack at X = 0 on the
 * LEFT of the main camera, Z across, the near touchline at Z = 0, Y up) seen through TV cameras — 1 live, the high main camera, real time:
 * Trent's long ball across, Robertson's touch, sprint and cross, Salah's header; 2 a TV slow-motion replay from a low touchline camera in
 * front of Robertson (the touch, the sprint into space, the early cross); 3 a second replay from high behind the goal (the cross past the
 * defenders, Salah rushing in on Angeliño's blind side, the header back across Bravo); 4 the lesson (the only chapter with teaching marks:
 * Robertson ringed, his winger ringed inside, the run on the outside, the early cross). No overlays in the footage.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the overlap and cross"; lesson "Sprint past your winger on the outside, then
 * whip the ball in early"). Wikipedia's playing-style section credits Robertson with "blistering pace", "dynamic overlapping runs" and
 * "precise crosses". This goal is the best-described example of the run-and-cross in one moment: The Guardian's report ("created by their
 * marauding full-backs"), its player ratings ("His delivery for Salah's header was absolute perfection"; Fernandinho "unable to cut out
 * Robertson's brilliant cross") and Barney Ronay's column, which describes it touch by touch ("six seconds, four touches"; "Robertson took
 * one touch and hared into the space ahead of him"). The sources do NOT say Robertson overlapped Sadio Mané on this goal, so the overlap
 * itself is taught in the lesson chapter only; the narration of the footage says only what the reports say (one touch, a sprint, a cross).
 *
 * SOURCES (read 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - The Guardian, David Hytner, "Fabinho leaves Manchester City fuming and helps Liverpool go eight points clear" (10 Nov 2019)
 *    https://www.theguardian.com/football/2019/nov/10/liverpool-manchester-city-premier-league-match-report — "Alexander-Arnold switched
 *    the play from right to left with a 60-yard pass to Andy Robertson, whose cross invited Mohamed Salah to rush in on Angeliño's
 *    blindside. Salah's header gave Bravo no chance." VAR checked offside.
 *  - The Guardian, Andy Hunter, player ratings (10 Nov 2019) https://www.theguardian.com/football/2019/nov/10/ratings-liverpool-manchester-city
 *    — line-ups (Liverpool 4-3-3: Alisson; Alexander-Arnold, Lovren, Van Dijk, Robertson; Henderson, Fabinho, Wijnaldum; Salah, Firmino, Mané.
 *    City 4-2-3-1: Bravo; Walker, Stones, Fernandinho, Angeliño; Rodri, Gündogan; B. Silva, De Bruyne, Sterling; Agüero); Trent "Brilliant
 *    ball to Robertson"; Robertson "delivery … absolute perfection"; Fernandinho "Unable to cut out Robertson's brilliant cross"; Angeliño
 *    "Lost track of Salah for Liverpool's second goal".
 *  - The Guardian, Barney Ronay, "Liverpool's symmetrical full-backs have turned them into world leaders" (10 Nov 2019)
 *    https://www.theguardian.com/football/blog/2019/nov/10/liverpool-symmetrical-full-backs-world-leaders — "With 13 minutes gone";
 *    "six seconds, four touches and three diagonal movements … from right-back to left wing, back to inside-right, then back again into the
 *    left-hand corner of the net"; Trent's "lofted cross-kick, full-back to full-back"; "Robertson took one touch and hared into the space
 *    ahead of him. His pass back across into Mo Salah's path … perfectly weighted, making Fernandinho hop and lunge"; "Salah had time to
 *    measure his stride before nodding the ball back across Bravo".
 *  - Wikipedia, "2019–20 Liverpool F.C. season" (10 Nov 2019, 16:30 GMT, Anfield, 53,324, referee Michael Oliver, Fabinho 6', Salah 13',
 *    Mané 51', B. Silva 78') and "Andy Robertson" (left-back, 1.78 m, playing style).
 * CONFIRMED: the match, date, venue, kick-off and score; the goal in the 13th minute for 2–0; Trent's long (≈60-yard) lofted pass from
 * right-back to Robertson on the left; Robertson's single touch, then the run into the space ahead, then the cross (four touches in all:
 * Trent, Robertson, Robertson, Salah; about six seconds); the cross going past Fernandinho (playing centre-back), who hopped and lunged;
 * Salah rushing in on Angeliño's blind side from inside-right and heading back across Bravo into the left-hand corner; the players' positions
 * in the line-ups.
 * INFERRED (illustrative reconstruction, not narrated as fact): every position, path and timing in metres and seconds; Robertson crossing with
 * his LEFT foot (he is a left-footed left-back) and Trent passing with his right; Mané drifting INSIDE with Walker drawn to him while
 * Robertson ran on the outside (the lesson's overlap — not described for this goal); which end Liverpool attacked in the first half (here the
 * goal on the left of the main camera, so Robertson's wing is the near touchline); THE KITS — Liverpool in their all-red home kit, City in a
 * dark change strip printed navy, Bravo in yellow (the sources name no colours, so the narration never does); shirt numbers (Liverpool: Trent
 * 66, Robertson 26, Salah 11, Mané 10, Firmino 9, Fabinho 3, Henderson 14, Wijnaldum 5; City's printed without numbers); hair and builds;
 * Salah's celebration run; Anfield's look (the Kop's single great tier behind the goal, the tall Main Stand on the camera side, the red
 * seats, a City block in the Anfield Road end) and the November dusk under floodlights; the camera placements.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,stand,strike,header,keeperSet,keeperDive,celebrate,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';
import {beats,shotAt,reframe,steady,near,type View as DView,type Keep} from './director';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [5,5,4,4]. Every cue starts with a
 * plain word (Kokoro splits contractions and hyphens). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The switch',text:'Anfield, 2019. Liverpool against Manchester City. Trent Alexander-Arnold sends the ball across to Andy Robertson. One touch, a sprint, a cross, and Mo Salah heads it in!',seconds:12.6,
  cues:[[0,'Anfield'],[3.1,'Trent'],[5.4,'Andy Robertson'],[6.5,'One touch'],[8.7,'Mo Salah heads it in']]},
 {label:'The sprint',text:'Watch Robertson. One touch, then he races into the space in front of him. No waiting. He whips the ball in early!',seconds:9.8,
  cues:[[0,'Watch Robertson'],[1.3,'One touch'],[2.6,'races into the space'],[5,'No waiting'],[6.2,'whips the ball in early']]},
 {label:'The header',text:'The cross flies past the defenders. Salah rushes in and heads it back across the keeper. Goal!',seconds:9,
  cues:[[0,'The cross flies'],[2.8,'Salah rushes in'],[4.1,'heads it back across'],[6.4,'Goal']]},
 {label:'The lesson',text:'That is the overlap and cross. Sprint past your winger on the outside, then whip the ball in early!',seconds:10.4,
  cues:[[0,'That is the overlap'],[2.6,'Sprint past your winger'],[4.1,'on the outside'],[5.5,'whip the ball in early']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py robertson-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/robertson-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/robertson-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** Cue onsets of chapter i (seconds). */
const Q=(i:number)=>CHAPTERS[i].cues.map(c=>c.at);
const SECS=(i:number)=>CHAPTERS[i].seconds;

const K='navy',Y='yellow',R='red',B='blue';
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one shape union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). Full sheet, never the safe box. */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030);DV={w:s.W/base,h:s.H/base};const a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1500,h:1030};

// ---------------------------------------------------------------- 3D: pitch metres → screen through a TV camera
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
/** camera space: [right, up, depth] */
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};

// ---------------------------------------------------------------- Anfield at dusk: the Kop behind the goal Liverpool attack, the tall Main Stand
/** a stand: along a→b (pitch x,z at the front), raking outward `out`; depth d metres, rise per metre, roof height */
type Stand={a:[number,number];b:[number,number];out:[number,number];depth:number;rise:number;roof:number;tiers:number[]};
const STANDS:Stand[]=[
 {a:[-8,74],b:[113,74],out:[0,1],depth:30,rise:.62,roof:24,tiers:[.5]},        // far side (Kenny Dalglish Stand), two tiers
 {a:[-6,-8],b:[-6,76],out:[-1,0],depth:40,rise:.7,roof:30,tiers:[]},            // the Kop, one great tier behind the goal (left)
 {a:[-8,-6],b:[113,-6],out:[0,-1],depth:42,rise:.72,roof:34,tiers:[.36,.7]},    // the Main Stand (the main camera sits in it)
 {a:[111,-8],b:[111,76],out:[1,0],depth:24,rise:.55,roof:16,tiers:[]},          // the Anfield Road end (right)
];
/** the crowd: Liverpool red and white with navy shadow; City's sky blue in one block of the Anfield Road end */
const TIER_INK:[string,number][]=[[R,.55],[R,.3],[K,.22],[R,.42],[Y,.15],[K,.35],[R,.62],[K,.14]];
function stadium(s:Sheet,c:Cam){
 // November, just after sunset: a navy sky, a floodlit haze
 s.field(K,.5,.5);
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),lamps=new Path2D(),fascia=new Path2D(),away=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 STANDS.forEach((st,si)=>{const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];const top=1.2+st.depth*st.rise;
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,st.depth,top),P(0,st.depth,top)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  const rows=16,segs=12;for(let k=0;k<rows;k++){const d0=.6+k*st.depth/rows,d1=d0+st.depth/rows*.78,y0=1.2+d0*st.rise,y1=1.2+d1*st.rise;if(st.tiers.some(w=>Math.abs(k/rows-w)<.04)){addPoly(fascia,[P(0,d0,y0),P(1,d0,y0),P(1,d1,y1),P(0,d1,y1)],c);continue;}
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs,q=[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)];if(si===3&&g>=8)addPoly(away,q,c);else addPoly(tiers[(k*3+g*5+si)%TIER_INK.length],q,c);}}
  // a dark roof over the back rows, floodlights along its front lip
  addPoly(roof,[P(-.02,st.depth+2,top+2),P(1.02,st.depth+2,top+2),P(1.02,st.depth*.55,st.roof),P(-.02,st.depth*.55,st.roof)],c);
  for(let k=0;k<9;k++){const u=(k+.5)/9;addPoly(lamps,[P(u-.02,st.depth*.55,st.roof-.1),P(u+.02,st.depth*.55,st.roof-.1),P(u+.02,st.depth*.55,st.roof-1.4),P(u-.02,st.depth*.55,st.roof-1.4)],c);}});
 s.knockout(concrete);s.fill(R,concrete,.5);s.fill(K,concrete,.35);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(B,away,.55);s.knockout(fascia,.8);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(lamps);s.fill(Y,lamps,.85);
 // advertising boards: red with paper panels (no lettering)
 s.knockout(wall);s.fill(R,wall,.8);s.stroke(K,wall,Math.max(2,.05*P3([50,0,34],c)[2]),.5);
 const grass=new Path2D();addPoly(grass,[[-6,0,-6],[111,0,-6],[111,0,74],[-6,0,74]],c);s.knockout(grass);s.fill(Y,grass,.6);s.fill(B,grass,.52);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,stripes,.15);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x+(x?-.5:.5),1.38,z],c),g=P3([x,1.15,z],c);if(f[2]<=0||g[2]<=0||toCam([x,0,z],c)[2]<2)continue;
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(R,fl);}
}
/** A goal at line gx whose net runs out by dir: white posts and bar, a net (paper haze + navy mesh); bulge pushes the back out at z bz. */
function goal(s:Sheet,c:Cam,gx:number,dir:number,bulge=0,bz=31.4){
 const z0=30.34,z1=37.66,h=2.44,bh=2.0,net=new Path2D(),bx=(z:number,y=1)=>gx+dir*(2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2))*(.4+.6*y/bh));
 addPoly(net,[[gx,0,z0],[bx(z0,0),0,z0],[bx(z0),bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx(z1,0),0,z1],[bx(z1),bh,z1],[gx,h,z1]],c);
 const zs=[z0,31.5,32.8,34.2,35.8,z1];for(let i=0;i<zs.length-1;i++){addPoly(net,[[bx(zs[i],0),0,zs[i]],[bx(zs[i+1],0),0,zs[i+1]],[bx(zs[i+1]),bh,zs[i+1]],[bx(zs[i]),bh,zs[i]]],c);addPoly(net,[[gx,h,zs[i]],[gx,h,zs[i+1]],[bx(zs[i+1]),bh,zs[i+1]],[bx(zs[i]),bh,zs[i]]],c);}
 s.knockout(net,.34);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx(z,0),0,z],[bx(z),bh,z]);seg([gx,h,z],[bx(z),bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){for(let z=z0;z<z1-.01;z+=sp)seg([bx(z,y),y,z],[bx(Math.min(z1,z+sp),y),y,Math.min(z1,z+sp)]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx(z,y),y,z]);}
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Robertson's LEFT foot on his left (toward the near touchline as he runs at the goal on the left). */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (pitch x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE adapter: every body in the film is printed here. */
function drawPlayer(s:Sheet,pose:Pose,c:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
const lfc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',scale:FIG,...o});
const city=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.85],trim:[B,.8],shorts:[K,.85],socks:[K,.85],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',number:null,scale:FIG,...o});
/** Andy Robertson: Liverpool's left-back, number 26 (1.78 m; short dark-brown hair) */
const ROBERTSON:AthleteStyle=lfc({number:26,seed:26,hair:[K,.75],build:{height:1.78,bulk:.97}});
/** Mohamed Salah: number 11 (1.75 m; curly hair, beard) */
const SALAH:AthleteStyle=lfc({number:11,seed:11,skin:SKIN_M,hair:[K,.95],hairStyle:'curly',build:{height:1.75,bulk:.98}});
/** Trent Alexander-Arnold: number 66, right-back (1.80 m) */
const TRENT:AthleteStyle=lfc({number:66,seed:66,skin:SKIN_M,hair:[K,.9],build:{height:1.8,bulk:1}});
/** Sadio Mané: number 10, left forward (1.75 m) */
const MANE:AthleteStyle=lfc({number:10,seed:10,skin:SKIN_D,hair:[K,.95],build:{height:1.75,bulk:1}});
const BRAVO:AthleteStyle={shirt:[Y,.85],shorts:[Y,.85],socks:[Y,.85],boots:K,skin:SKIN_M,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:null,scale:FIG,seed:1,build:{height:1.84}};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:26,build:ROBERTSON.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T = 0 = Trent's pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const T_PASS=0,T_TOUCH=2.3,T_CROSS=3.85,T_HEAD=5.1,T_NET=5.52,T_FERN=4.55;
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-4);for(let t=-3.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
/** Trent (66) at right-back on the far side: carries it a few steps, then the long ball across with his right foot */
const TRENT_KEYS=[[-4,63.5,59.5],[-2,62.2,58.4],[T_PASS,61,57.6],[1.5,60,57.2],[4,57,55],[9,54,52]];
/** Robertson: already on the move up the near touchline, the touch at T_TOUCH, the sprint, the cross at T_CROSS */
const ROB_KEYS=[[-4,47,10.5],[-2,43.5,9.2],[T_PASS,40,8],[1.2,36.8,6.7],[T_TOUCH,33.4,5.9],[3,29.6,5.4],[3.5,25.6,5.1],[T_CROSS,23.6,5.1],[4.4,21.4,5.6],[5.2,19.6,6.6],[6.5,18.2,8.5],[9,15.5,12]];
/** the cross heading: open to the box (a left-footer whipping it back across) */
const H_CROSS=nrm2(-.62,1);
function robPlace(T:number):Place{const p=trackAt(ROB_KEYS,T),v=velAt(ROB_KEYS,T),sp=Math.hypot(v[0],v[1]),run:[number,number]=sp>.5?[v[0]/sp,v[1]/sp]:[-1,0];
 return placeOf(p[0],p[1],yawTo(run,H_CROSS,sm(T_CROSS-.7,T_CROSS-.3,T)*(1-sm(T_CROSS+.5,T_CROSS+1.1,T))));}
const CROSS_POSE=(T:number)=>strike(clamp((T-T_CROSS)/.9+STRIKE_CONTACT),{foot:'l',power:.75});
/** the ball meets Robertson's LEFT boot here at the cross: solved from the body at the contact frame */
const BALL_X:V3=(()=>{const sk=solve(CROSS_POSE(T_CROSS),ROBERTSON.build,robPlace(T_CROSS),FIG),t=toMy(sk.lToe),h=toMy(sk.lHeel);return[t[0]*.7+h[0]*.3,.11,t[2]*.7+h[2]*.3];})();
/** the touch: the lofted ball lands just ahead of his left foot and he pushes it on into the space */
const TOUCH_AT:V3=(()=>{const a=ahead(ROB_KEYS,T_TOUCH,.55);return[a[0],.2,a[2]-.1];})();
/** Salah (11) from inside-right, rushing in on Angeliño's blind side; the header at T_HEAD */
const H_HEAD=nrm2(-.75,-1);
const HEAD_AT:[number,number]=[9.6,39.4],HEAD_PLACE=placeOf(HEAD_AT[0],HEAD_AT[1],H_HEAD),HEAD_DUR=1;
const HEAD_POSE=(T:number)=>header(clamp((T-T_HEAD)/HEAD_DUR+.52));
/** where his forehead meets the ball */
const BALL_H:V3=(()=>{const sk=solve(HEAD_POSE(T_HEAD),SALAH.build,HEAD_PLACE,FIG),h=toMy(sk.head);return[h[0]+H_HEAD[0]*.14,h[1]+.05,h[2]+H_HEAD[1]*.14];})();
/** the header back across Bravo into the left-hand (near-side) corner */
const BALL_NET:V3=[-.55,.95,31.25],BALL_REST:V3=[-1.6,.11,31.5];
const SALAH_KEYS=[[-4,36,47],[-2,33,46],[T_PASS,30,45],[2,24.5,44],[3.85,16.5,41.8],[T_HEAD-.52,HEAD_AT[0],HEAD_AT[1]],[T_HEAD+.48,HEAD_AT[0],HEAD_AT[1]],[6.4,7.5,32],[8,6.5,22],[10,6.5,14]];
/** Mané (10): comes INSIDE off the wing, taking Walker with him (inferred — the lesson's "your winger") */
const MANE_KEYS=[[-4,39,14],[T_PASS,35.5,14.2],[T_TOUCH,30.5,15.6],[T_CROSS,25.5,18],[5.2,18.5,22],[8,14,24]];
/** Fernandinho, at centre-back: hops and lunges at the cross and cannot cut it out */
const FERN_AT:[number,number]=[15,25.2];
const FERN_KEYS=[[-4,21,27],[T_PASS,19.5,26.5],[3.8,15.6,25.6],[T_FERN-.52,...FERN_AT],[T_FERN+.48,...FERN_AT],[8,12,29]];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'rob',style:ROBERTSON,keys:ROB_KEYS},
 {id:'salah',style:SALAH,keys:SALAH_KEYS},
 {id:'trent',style:TRENT,keys:TRENT_KEYS},
 {id:'mane',style:MANE,keys:MANE_KEYS},
 {id:'fern',style:city({seed:25,skin:SKIN_D,hair:[K,.95]}),keys:FERN_KEYS},
 {id:'angel',style:city({seed:3,build:{height:1.71}}),keys:[[-4,24,43],[T_PASS,22,42],[3.8,13.4,38],[T_HEAD,11.3,36.6],[8,9.5,35]]},
 {id:'walker',style:city({seed:2,skin:SKIN_D}),keys:[[-4,31,11],[T_PASS,29,12.5],[T_TOUCH,26.5,13.8],[T_CROSS,22,16.5],[5.5,17,19],[8,14,21]]},
 {id:'stones',style:city({seed:5,hair:[K,.8]}),keys:[[-4,20,33],[T_PASS,18.5,32.5],[3.8,13,31.5],[T_HEAD,10.4,31.5],[8,9,31.6]]},
 // everyone else (positions illustrative)
 {id:'firmino',style:lfc({number:9,seed:9,skin:SKIN_M}),keys:[[-4,28,30],[T_PASS,25,30.5],[3.8,15.5,31],[T_HEAD,12.5,33],[8,11,32]]},
 {id:'hendo',style:lfc({number:14,seed:14,hair:[Y,.45]}),keys:[[-4,52,44],[T_PASS,49,43],[4,40,40],[8,33,36]]},
 {id:'gini',style:lfc({number:5,seed:5,skin:SKIN_D}),keys:[[-4,45,24],[T_PASS,42,23],[4,34,23],[8,28,24]]},
 {id:'fabinho',style:lfc({number:3,seed:3,skin:SKIN_M}),keys:[[-4,56,33],[T_PASS,54.5,32],[4,49,30],[8,45,30]]},
 {id:'rodri',style:city({seed:16,hair:[K,.9]}),keys:[[-4,35,28],[T_PASS,33,27],[4,25,27],[8,20,27]]},
 {id:'gundo',style:city({seed:8,hair:[K,.9]}),keys:[[-4,41,35],[T_PASS,39,35],[4,31,35.5],[8,26,34]]},
];
const BRAVO_KEYS=[[-4,2,34.2],[T_CROSS,1.9,33.4],[T_HEAD-.25,1.6,35.2],[T_HEAD+.1,1.5,35.4]];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: Trent's carry, the long lofted pass, Robertson's one touch into the space, the cross with his left foot,
 * Salah's header, the net. */
function ballAt(T:number):V3{
 if(T<T_PASS)return ahead(TRENT_KEYS,T,.55);
 const b0=ahead(TRENT_KEYS,T_PASS,.55);
 if(T<T_TOUCH){const u=(T-T_PASS)/(T_TOUCH-T_PASS);return lerp3(b0,TOUCH_AT,u*(1.12-.12*u),7.2);}
 if(T<T_CROSS)return lerp3(TOUCH_AT,BALL_X,sm(T_TOUCH,T_CROSS,T,easeOut));
 if(T<T_HEAD){const u=(T-T_CROSS)/(T_HEAD-T_CROSS);return lerp3(BALL_X,BALL_H,u*(1.18-.18*u),2.3);}
 if(T<T_NET)return lerp3(BALL_H,BALL_NET,(T-T_HEAD)/(T_NET-T_HEAD),.12);
 return lerp3(BALL_NET,BALL_REST,sm(T_NET,T_NET+.5,T,easeOut),0);
}

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
function yawTo(a:[number,number],b:[number,number],u:number):[number,number]{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];}
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball: "eyes on the ball". Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.3*w;return clampPose(p);}
/** Robertson: the run, eyes up at the long ball, the one touch (left foot), the sprint, the cross (left foot), on into the box */
function robState(T:number):St{
 const place=robPlace(T),run=runState(ROB_KEYS,T);let pose=run.pose;
 if(T<T_TOUCH+.3)pose=lookAtBall({pose,place},T,.9*(1-sm(T_TOUCH-.2,T_TOUCH+.2,T)));
 // the touch: a short cushioning push with the left instep, still running
 pose=blendPose(pose,strike(clamp((T-T_TOUCH)/.8+STRIKE_CONTACT),{foot:'l',power:.18}),win(T,T_TOUCH-.3,T_TOUCH+.3,.14)*.8);
 // the cross: plant, swing, the whip with the left foot, the follow-through
 pose=blendPose(pose,CROSS_POSE(T),win(T,T_CROSS-.47,T_CROSS+.43,.12));
 return{pose,place};
}
function salahState(T:number):St{
 if(T<T_HEAD-.52){const st=runState(SALAH_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};}
 if(T<T_HEAD+.48){const run=runState(SALAH_KEYS,Math.min(T,T_HEAD-.53));return{pose:blendPose(run.pose,HEAD_POSE(T),sm(T_HEAD-.62,T_HEAD-.45,T)),place:HEAD_PLACE};}
 // away to celebrate, arms out
 const st=runState(SALAH_KEYS,T);return{pose:blendPose(st.pose,celebrate(((T-T_HEAD)*.8)%1,{kind:'run'}),sm(T_HEAD+.7,T_HEAD+1.2,T)),place:st.place};
}
function fernState(T:number):St{
 const face=nrm2(BALL_X[0]-FERN_AT[0],BALL_X[2]-FERN_AT[1]);
 if(T<T_FERN-.52){const st=runState(FERN_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};}
 if(T<T_FERN+.48){const run=runState(FERN_KEYS,T_FERN-.53,face);return{pose:blendPose(run.pose,header(clamp((T-T_FERN)+.52)),sm(T_FERN-.62,T_FERN-.45,T)),place:placeOf(FERN_AT[0],FERN_AT[1],face)};}
 return runState(FERN_KEYS,T);
}
function trentState(T:number):St{
 const st=runState(TRENT_KEYS,T,T<T_PASS+.6?nrm2(-.5,-1):undefined);
 const pose=blendPose(st.pose,strike(clamp((T-T_PASS)/.9+STRIKE_CONTACT),{foot:'r',power:.85}),win(T,T_PASS-.47,T_PASS+.43,.14));
 return{pose:lookAtBall({pose,place:st.place},T,.4),place:st.place};
}
function bravoState(T:number):St{const[x,z]=trackAt(BRAVO_KEYS,T),b=ballAt(Math.min(T,T_HEAD)),face=nrm2(b[0]-x,b[2]-z);
 const at=placeOf(x,z,face);if(T<T_HEAD+.02)return{pose:keeperSet(T*1.1),place:at};
 // too late: the dive to his right, toward the near post
 const pl=placeOf(1.5,35.4,[1,0]);return{pose:blendPose(keeperSet(T*1.1),keeperDive(clamp((T-T_HEAD-.02)/1),{side:'r',height:.4}),sm(T_HEAD,T_HEAD+.12,T)),place:pl};}
function stateOf(id:string,T:number):St{
 if(id==='rob')return robState(T);if(id==='salah')return salahState(T);if(id==='fern')return fernState(T);if(id==='trent')return trentState(T);if(id==='bravo')return bravoState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['rob','salah'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes (plus `heroes`). */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean;heroes?:string[]}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'bravo'].filter(id=>!o.only||o.only.includes(id)),heroes=[...HEROES,...(o.heroes??[])];
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='bravo'?BRAVO:TR(id).style,hero=heroes.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='rob'&&Math.abs(T-T_CROSS)<.22)||(id==='salah'&&Math.abs(T-T_HEAD)<.2)||(id==='trent'&&Math.abs(T-T_PASS)<.2);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-.002,draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 const bulge=T>T_NET?Math.exp(-(T-T_NET)*3)*sm(T_NET-.05,T_NET+.08,T):0;
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir,gx===0?bulge:0)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live, real time: the high main camera in the Main Stand, panning with the long ball across, the sprint, the cross and the header. */
const MAIN_CAM:V3=[36,19,-40];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-3.1],[q[1]+.1,T_PASS],[q[2]+.2,T_TOUCH],[q[4]+.3,T_HEAD],[S,T_HEAD+2.9]]);};
const cam1Authored=(t:number):{pos:V3;target:V3;F:number}=>{const T=t1(t),b=ballAt(Math.max(-3,T-.25)),tx=clamp(lerp(b[0],(b[0]+ballAt(clamp(T+.8,-3,T_HEAD))[0])/2,.5),10,52),tz=lerp(30,22,sm(T_TOUCH,T_CROSS,T));
 const F=lerp(3300,4300,sm(T_TOUCH-.4,T_CROSS+.6,T,easeInOutSine));return{pos:MAIN_CAM,target:[tx,0,tz],F};};
/** figures print 10 % over life size (FIG): the director's hero height in metres */
const HERO_H=1.8*FIG;
/** the chapter-1 time of play time T (inverse of t1's warp, for the beats) */
const tOf1=(T:number)=>{let lo=0,hi=SECS(0);for(let i=0;i<30;i++){const m=(lo+hi)/2;if(t1(m)<T)lo=m;else hi=m;}return(lo+hi)/2;};
/** Director beats (lib/plays/riso/director.ts, Oct 4 2026): a short establishing wide of Anfield, then follow Trent on the ball and push in on his strike; as he hits
 * the long switch the camera rides the ball across to Robertson (the receiver and the space he runs into); push in low for his one touch,
 * ease back to follow the sprint, pull out for the early cross so Salah's run into the box is in frame, push in on Salah's header with the
 * keeper and the goal kept in, and hold on Salah's reaction. */
const B1=beats([[0,'wide'],[1,'follow'],[Q(0)[1]-.35,{from:'tight',size:.45}],[Q(0)[1]+.4,{from:'space',size:.26}],[tOf1(T_TOUCH)-.4,'tight'],[Q(0)[3]-.1,'follow'],
 [tOf1(T_CROSS)-.35,{from:'space',size:.24}],[tOf1(T_HEAD)-.6,'tight'],[tOf1(T_HEAD)+.35,'reaction']]);
const P2=(xz:[number,number]):V3=>[xz[0],0,xz[1]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
/** the key player at play time T, blended (never a hard switch): Trent on the ball, Robertson from the long ball on, Salah from the cross on */
function subj1(T:number){
 const tr=P2(trackAt(TRENT_KEYS,T)),rb=robState(T).place,ro:V3=[rb.x!,0,-rb.z!],sa=salahState(T).place,so:V3=[sa.x!,0,-sa.z!],bv=bravoState(T).place,bo:V3=[bv.x!,0,-bv.z!];
 const uR=sm(T_PASS+.1,T_TOUCH-.3,T,easeInOutSine),uS=sm(T_CROSS+.05,T_HEAD-.3,T,easeInOutSine),hero=mix3(mix3(tr,ro,uR),so,uS);
 const foes=['fern','angel','walker','stones'].map(id=>P2(trackAt(TR(id).keys,T)));
 const keep:Keep[]=[...near(hero,foes,3.5,7,HERO_H)];
 // the passer fades out as the ball leaves him; the cross's target (Salah) comes in before the cross; the keeper and the goal at the header
 const wT=1-uR,wS=sm(T_CROSS-1.7,T_CROSS-.2,T,easeInOutSine)*(1-uS),wG=sm(T_HEAD-1.3,T_HEAD-.5,T,easeInOutSine);
 if(wT>.01&&uR>.01)keep.push({P:tr,w:wT},{P:[tr[0],HERO_H,tr[2]],w:wT});
 if(wS>.01)keep.push({P:so,w:wS},{P:[so[0],HERO_H,so[2]],w:wS});
 if(wG>.01)keep.push({P:bo,w:wG},{P:[bo[0],HERO_H,bo[2]],w:wG},{P:[0,2.44,30.34],w:wG*.35},{P:[0,0,37.66],w:wG*.35});
 return{hero,ball:ballAt(T),keep,height:HERO_H};
}
/** the directed chapter-1 camera at time t (before smoothing) */
const dir1=(t:number)=>{const c=cam1Authored(t),T=t1(t),
 // the long switch: the ball high in the air and Robertson far below it — a slightly slimmer safe margin keeps both and him readable
 margin=lerp(.88,.95,sm(T_PASS+.2,T_PASS+.7,T)*(1-sm(T_TOUCH-.5,T_TOUCH-.1,T)));return reframe({eye:c.pos,target:c.target,F:c.F},subj1(T),shotAt(t,B1),DV,{margin});};
/** steadied over ±0.45 s (3 samples) so no hand-over or fit clamp can snap the zoom */
const cam1=(t:number)=>{const r=steady(t,dir1,.45,3);return camAt(r.eye,r.target,r.F);};
const ch1:Scene={
 draw(s,t){frame(s);const sh=shotAt(t,B1);drawPlay(s,t1(twos(t)),cam1(t),{wide:sh.k*sh.size<.3});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[4]+.5;},
};
/** 2 · TV slow-motion replay from a low camera on the near touchline, ahead of Robertson: the touch, the sprint into space, the cross. */
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,1.3],[q[1]+.3,T_TOUCH],[q[2],2.75],[q[3],3.35],[q[4]+.3,T_CROSS],[S,T_CROSS+1.05]]);};
const cam2=(t:number)=>{const T=t2(t),r=trackAt(ROB_KEYS,Math.min(T,T_CROSS+.3)),u=sm(T_CROSS-.2,T_CROSS+.9,T,easeInOutSine),b=ballAt(T);
 const pos:V3=[r[0]-7+2*u,1.5+.9*u,-2.2];return camAt(pos,[lerp(r[0]+.4,lerp(r[0],b[0],.45),u),.9,lerp(r[1]+2.6,lerp(r[1],b[2],.3),u)],lerp(1900,1500,u));};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6,heroes:['mane','walker']});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.6;},
};
/** 3 · the second replay, from high behind the goal: the cross past Fernandinho, Salah on Angeliño's blind side, the header back across. */
const BEHIND_CAM:V3=[-8.5,4.6,32];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_CROSS-.35],[q[1],T_FERN+.1],[q[2]+.2,T_HEAD],[q[3],T_NET+.15],[S,T_NET+1.5]]);};
const cam3Authored=(t:number):{pos:V3;target:V3;F:number}=>{const T=t3(t),b=ballAt(Math.min(T,T_HEAD)),u=sm(T_FERN-.2,T_HEAD,T,easeInOutSine);
 return{pos:BEHIND_CAM,target:[lerp(b[0]*.6+6,HEAD_AT[0]+1,u),1.2,lerp(b[2]*.6+14,HEAD_AT[1]-3,u)],F:lerp(2000,2500,u)};};
/** Director beats for the second replay: in from the start on the cross's flight with Fernandinho (the defender it beats) as the key player and
 * Salah's run kept in, follow Salah as he rushes in, push in for the header with Bravo kept in, and hold on Salah after the goal. The header
 * and reaction stay at ~35 %: any closer and this behind-the-goal camera would have to pass the goal frame and Bravo. */
const B3=beats([[0,{from:'space',size:.34}],[Q(2)[1]-.3,'follow'],[Q(2)[2]-.4,{from:'tight',size:.36,low:.2}],[Q(2)[3]+.3,{from:'reaction',size:.4,low:0}]]);
function subj3(T:number){const sa=salahState(T).place,so:V3=[sa.x!,0,-sa.z!],fe=fernState(T).place,fo:V3=[fe.x!,0,-fe.z!],bv=bravoState(T).place,bo:V3=[bv.x!,0,-bv.z!];
 // the key player: Fernandinho (the defender the cross beats) while the ball flies at him, then Salah — blended, never a hard switch
 const uS=sm(T_FERN-.15,T_FERN+.45,T,easeInOutSine),hero=mix3(fo,so,uS),wB=sm(T_HEAD-.7,T_HEAD-.3,T)*(1-.7*sm(T_NET+.3,T_NET+.9,T)),keep:Keep[]=[];
 // Salah's run (wide of the authored view as the replay opens) joins the framing as the ball flies toward him; Fernandinho fades out once
 // the ball is past him
 const wS=Math.max(uS,.9*sm(T_CROSS,T_FERN-.2,T));if(wS>.01&&uS<.99)keep.push({P:so,w:wS},{P:[so[0],HERO_H,so[2]],w:wS});
 if(uS>.01&&uS<.99)keep.push({P:fo,w:1-uS},{P:[fo[0],HERO_H,fo[2]],w:1-uS});
 // Bravo in full while he dives (he lies across the frame, so his dive extent is held too, not just his standing height)
 if(wB>.01){const wk=wB*(.8+.18*(1-sm(T_NET+.3,T_NET+.9,T)));keep.push({P:bo,w:wk},{P:[bo[0],HERO_H,bo[2]],w:wk},{P:[bo[0],.4,bo[2]-1.3],w:wk},{P:[bo[0],.4,bo[2]+1.3],w:wk},{P:[bo[0]-1.3,.4,bo[2]],w:wk},{P:[bo[0]+1.3,.4,bo[2]],w:wk});}
 // the replay opens with the ball still at Robertson's boot, wide of this camera's view: it joins the framing as it flies in
 // (from the header on, the ball flies at this camera into the net: it eases to a soft point so the camera never snaps back after it;
 // after the goal Bravo eases to a soft point too — the shot is Salah's reaction)
 const wX=sm(T_CROSS+.1,T_CROSS+.5,T)*(1-.65*sm(T_HEAD-.2,T_HEAD+.3,T,easeInOutSine));if(wX>.01)keep.push({P:ballAt(T),w:wX});
 return{hero,ball:null,keep,height:HERO_H};}
const dir3=(t:number)=>{const c=cam3Authored(t);return reframe({eye:c.pos,target:c.target,F:c.F},subj3(t3(t)),shotAt(t,B3),DV);};
const cam3=(t:number)=>{const r=steady(t,dir3,.45,3);return camAt(r.eye,r.target,r.F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6,heroes:['fern','angel','bravo','stones']});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[3]+.5;},
};
/** 4 · the lesson plate: the run again from a raised camera on the near side, behind Robertson, with bold yellow teaching marks — a ring
 * round Robertson (the overlap), a ring round his winger Mané inside him, a big arrow down the outside, then the early cross drawn as a
 * curving arrow into the box, a burst at his boot and a ghost of the whip. */
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,1.2],[q[1],1.6],[q[2],2.3],[q[3],T_CROSS-.35],[q[3]+1.4,T_CROSS+.05],[S,T_CROSS+.6]]);};
const cam4Authored=(t:number):{pos:V3;target:V3;F:number}=>{const T=t4(t),r=trackAt(ROB_KEYS,Math.min(T,T_CROSS)),u=sm(Q(3)[3],SECS(3)-1,t,easeInOutSine);
 return{pos:[r[0]+10,8.5+1.5*u,-8.5],target:[r[0]-8-3*u,0,lerp(12,16,u)],F:lerp(1700,1450,u)};};
/** Director beats for the lesson: closer on Robertson with his winger Mané (and Walker) kept in for the overlap and the run on the outside,
 * then eased back out for the early cross so the arrow into Salah's path stays readable. */
const B4=beats([[0,'lesson'],[Q(3)[3]+.6,{from:'lesson',size:.31}]]);
function subj4(t:number,T:number){const rb=robState(T).place,hero:V3=[rb.x!,0,-rb.z!],mn=P2(trackAt(MANE_KEYS,T)),wk=P2(trackAt(TR('walker').keys,T));
 const wW=1-sm(Q(3)[3]-.6,Q(3)[3]+.4,t,easeInOutSine),wC=sm(Q(3)[3]-.2,Q(3)[3]+.8,t,easeInOutSine),keep:Keep[]=[];
 if(wW>.01)keep.push({P:mn,w:wW},{P:[mn[0],HERO_H,mn[2]],w:wW},{P:wk,w:wW*.7});
 if(wC>.01)keep.push({P:[BALL_H[0],0,BALL_H[2]],w:wC*.75},{P:BALL_X,w:wC});
 // the lesson opens with Trent's long ball still high overhead (out of this camera's frame): the ball joins the framing only as it drops to him
 const wB=sm(T_TOUCH-.7,T_TOUCH-.15,T);if(wB>.01)keep.push({P:ballAt(T),w:wB});
 return{hero,ball:null,keep,height:HERO_H};}
const dir4=(t:number)=>{const c=cam4Authored(t);return reframe({eye:c.pos,target:c.target,F:c.F},subj4(t,t4(t)),shotAt(t,B4),DV);};
const cam4=(t:number)=>{const r=steady(t,dir4,.45,3);return camAt(r.eye,r.target,r.F);};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D,a=1){s.stroke(K,p,5,.9*a);s.knockout(p,a);s.fill(Y,p,.95*a);}
/** a bold teaching arrow along points (drawn to `u`), one path: shaft + head */
function arrowAlong(s:Sheet,pts:Pt[],w:number,seed:number,u=1,alpha=1){if(u<=.01||pts.length<2)return;const n=Math.max(2,Math.round(pts.length*u)),q=pts.slice(0,n),e=q[n-1],pr=q[n-2],an=Math.atan2(e[1]-pr[1],e[0]-pr[0]),hl=w*2.4;
 const back:Pt=[e[0]-Math.cos(an)*hl*.8,e[1]-Math.sin(an)*hl*.8],p=new Path2D();p.addPath(ribbon([...q.slice(0,-1),back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p,alpha);}
/** a ground ring (pitch x,z, radius r) as one path */
function groundRing(x:number,z:number,r:number,c:Cam,k=.72):Path2D{const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k,c));}
 const p=new Path2D();p.addPath(polyPath(out,true));p.addPath(polyPath(inn.reverse(),true));return p;}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),S=SECS(3),T=t4(twos(t)),c=cam4(t);frame(s);
  const cast=['rob','mane','walker','salah','fern','firmino','angel','stones','ball'];
  // rings printed under the figures: Robertson ("the overlap"), then his winger inside him ("your winger")
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]-.2,q[1]+.2,t)),wing=sm(q[1],q[1]+.4,t,easeOutBack)*(1-sm(q[3]-.3,q[3]+.1,t));
  stadium(s,c);
  if(hal>.01){const m=robState(T).place;mark(s,groundRing(m.x!,-m.z!,1.2*hal,c));}
  if(wing>.01){const m=trackAt(MANE_KEYS,T);mark(s,groundRing(m[0],m[1],1.2*wing,c));}
  drawPlay(s,T,c,{ballScale:1.5,only:cast,noStadium:true,heroes:['mane','walker']});
  // "on the outside": a big arrow up the touchline side of Mané (between him and the line)
  const out=sm(q[2],q[2]+.7,t,easeInOutSine),fade=1-sm(q[3]+.2,q[3]+.6,t);
  if(out>0&&fade>0){const r=trackAt(ROB_KEYS,Math.min(T,2.4)),w=Math.max(12,.2*P3([r[0],0,r[1]],c)[2]),pts:Pt[]=[];for(let i=0;i<=10;i++){const u=i/10;pts.push(G(lerp(r[0]-1.2,BALL_X[0]+.5,u),lerp(r[1]-.3,BALL_X[2]-.4,u)-.4*Math.sin(u*Math.PI),c));}
   arrowAlong(s,pts,w,43,out,fade);}
  // "whip the ball in early": the cross drawn as a curving arrow into Salah's path, a burst at the boot, the ghost of the whip
  const cr=sm(q[3]+.5,q[3]+1.7,t,easeInOutSine),crFade=1-sm(S-.9,S-.4,t);
  if(cr>0&&crFade>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const u=i/16,b=lerp3(BALL_X,[BALL_H[0],.1,BALL_H[2]],u,0);pts.push(G(b[0],b[2],c,.05+3*u*(1-u)));}
   arrowAlong(s,pts,Math.max(10,.16*P3(BALL_X,c)[2]),51,cr,crFade);}
  const stamp=sm(q[3]+1.1,q[3]+1.4,t,easeOutBack);
  if(stamp>.002&&crFade>0){const bp=P3(BALL_X,c);sparkBurst(s,Y,bp[0],bp[1],.8*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   if(T>T_CROSS)drawPlayer(s,CROSS_POSE(T_CROSS+.12),c,GHOST,robPlace(T_CROSS));}
  frame(s);
 },
 get still(){return Q(3)[3]+1.4;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'robertson-signature',format:'11v11',title:'The overlap and cross',theme:'Sprint past your winger on the outside, then whip the ball in early',
 ageNote:'Liverpool v Manchester City · Premier League, 10 November 2019 · Anfield, Liverpool',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little sun spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; the goal Liverpool attack at X = 0, the near touchline Z = 0) — checked by
 * tests/play-film-robertson-signature.cjs. */
export const FACTS={T_PASS,T_TOUCH,T_CROSS,T_HEAD,T_NET,BALL_X,BALL_H,BALL_NET,TOUCH_AT,ballAt,
 /** each boot's toe at the cross contact frame (pitch metres) */
 leftToe:()=>{const t=toMy(solve(CROSS_POSE(T_CROSS),ROBERTSON.build,robPlace(T_CROSS),FIG).lToe);return t;},
 rightToe:()=>{const t=toMy(solve(CROSS_POSE(T_CROSS),ROBERTSON.build,robPlace(T_CROSS),FIG).rToe);return t;},
 salahHead:()=>toMy(solve(HEAD_POSE(T_HEAD),SALAH.build,HEAD_PLACE,FIG).head),
 robAt:(T:number)=>{const st=robState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 maneAt:(T:number)=>trackAt(MANE_KEYS,T),
 trentAt:(T:number)=>trackAt(TRENT_KEYS,T),
 salahAt:(T:number)=>{const st=salahState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 angelAt:(T:number)=>trackAt(TR('angel').keys,T)};
