/** Scott McTominay's SIGNATURE film, "the late run and finish": Scotland 2–0 Spain, UEFA Euro 2024 qualifying Group A, Hampden Park,
 * Glasgow, Tuesday 28 March 2023 (kick-off 19:45 BST / 20:45 CET) — the 7th-minute opener: Pedro Porro slips by the byline, Andy Robertson
 * pounces and cuts the ball back, and McTominay, arriving in the middle of the box, hits it first time with his left foot; the low shot
 * whizzes off the sprawling Iñigo Martínez and into the net behind Kepa.
 *
 * A riso-print recreation of a broadcast: one 3D choreography in pitch metres (X along the pitch, the goal Scotland attack at X = 0 on the
 * LEFT of the main camera, Z across, the near touchline at Z = 0, Y up) seen through TV cameras — 1 live, the high main camera, real time:
 * Porro's slip, Robertson's steal and cut-back, McTominay's finish; 2 a TV slow-motion replay from a low camera behind McTominay's run (he
 * holds back outside the box, then bursts in and meets the cut-back first time, left foot); 3 a second replay from high behind the goal (the
 * low shot, the deflection off Martínez on the ground, past Kepa, the celebration); 4 the lesson (the only chapter with teaching marks: the
 * arrival spot ringed, his late run and the cut-back drawn as two arrows that meet on the spot, a burst when they arrive together).
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the late run and finish"; lesson "Time your run so you arrive in the box just
 * as the ball does"). This goal is the best-documented single example of McTominay arriving to finish a cut-back in one movement: BBC Sport
 * ("His cut back was perfect for McTominay, whose low rifled shot whizzed off the sprawling Inigo Martinez"), OneFootball/PA via the search
 * snippet ("allowing Scotland captain Andy Robertson to cut the ball back for McTominay whose first-time finish ended up behind Kepa") and
 * ESPN's Opta commentary ("left footed shot from the centre of the box … Assisted by Andrew Robertson"). The sources describe the play, so
 * it is staged in the real match. They do NOT describe his run's path or timing, so the run's shape (waiting outside the box, then the
 * burst) is an illustrative reconstruction; the narration of the footage only says he timed his run into the middle of the box.
 *
 * SOURCES (read 24 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - BBC Sport, "Scotland 2-0 Spain: Steve Clarke's side earn consecutive Euro 2024 qualification wins" (28 Mar 2023)
 *    https://www.bbc.com/sport/football/65022207 — "Scott McTominay crashed in a deflected opener after just seven minutes"; "Pedro Porro,
 *    Spurs' beleaguered full-back, slipped, leaving the door open for Andy Robertson to pounce. His cut back was perfect for McTominay, whose
 *    low rifled shot whizzed off the sprawling Inigo Martinez and into the net"; "a charged Hampden Park"; "the damp Glaswegian weather";
 *    "an explosion of noise inside a charged Hampden Park"; Robertson's assist.
 *  - ESPN commentary, gameId 655292 https://www.espn.com/soccer/commentary/_/gameId/655292 — "Goal! Scotland 1, Spain 0. Scott McTominay
 *    (Scotland) left footed shot from the centre of the box to the centre of the goal. Assisted by Andrew Robertson."
 *  - DuckDuckGo result snippets (cached ddg-sco-esp-2023.html): OneFootball — "Tottenham defender Pedro Porro looked in control of the ball
 *    close to the byline but slipped allowing Scotland captain Andy Robertson to cut the ball back for McTominay whose first-time finish
 *    ended up behind Kepa"; RFEF — "1-0 (7´) | McTominay with a low shot inside the area".
 *  - UEFA Full Time Report (https://www.uefa.com/newsfiles/EURO/2024/2036314_FR.pdf) — line-ups and numbers: Scotland Gunn 1, Robertson 3
 *    (captain), McTominay 4, Hanley 5, Tierney 6, McGinn 7, McGregor 8, Dykes 9, Christie 11, Porteous 15, Hickey 22; Spain Kepa 1, Porro 2,
 *    David García 3, Iñigo Martínez 6, Ceballos 10, Yeremi Pino 11, Gayà 14, Merino 15, Rodri 16 (captain), Oyarzabal 18, Joselu 21; goal 7'.
 *  - Wikipedia, "Scott McTominay" (brace v Spain, 28 Mar 2023, Scotland's first win over Spain since 1984); lib/town/playerCareers.json
 *    (Manchester United 2017–24, Napoli 2024–; Scotland from 2018) and playerAppearance.json (country Scotland; short hair, stubble).
 * CONFIRMED: the match, date, venue, score and the 7th minute; Porro, in control of the ball close to the byline, slipping; Robertson
 * pouncing and cutting the ball back; McTominay's first-time, low, LEFT-footed shot from the centre of the box; the deflection off Iñigo
 * Martínez, who was on the ground ("sprawling"); the ball ending in the (centre of the) net behind Kepa; the shirt numbers; a damp night.
 * INFERRED (illustrative reconstruction, not narrated as fact): every position, path and timing in metres and seconds; the shape of
 * McTominay's run (holding outside the box, then the burst — the card's "late run"); Robertson cutting it back with his LEFT foot (he is a
 * left-footed left-back); Kepa shading to his near post and diving that way; which end Scotland attacked (the goal on the left of the main
 * camera, Robertson's wing the near touchline — it must be Scotland's left and Spain's right, where Porro played); THE KITS — Scotland navy
 * shirts, white shorts, navy socks; Spain in their pale-blue 2022–23 change strip; Kepa in yellow (no source names the colours that night,
 * so the narration never does); where other players stood; the celebration run; Hampden's look (a low open bowl, a roof over the stands,
 * navy-and-white Tartan Army crowd, a Spain block in one corner) and the drizzle under floodlights; the camera placements.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,hash,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,stand,strike,keeperSet,keeperDive,celebrate,slideTackle,keyPoses,posed,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [5,5,4,4]. Every cue starts with a
 * plain word (Kokoro splits contractions and hyphens). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The steal',text:'Hampden Park, 2023. Scotland against Spain. A Spain defender slips by the goal line. Andy Robertson steals the ball and cuts it back, and Scott McTominay scores!',seconds:12.4,
  cues:[[0,'Hampden Park'],[3.5,'defender slips'],[5.6,'Andy Robertson steals'],[7.3,'cuts it back'],[8.6,'Scott McTominay scores']]},
 {label:'The late run',text:'Watch McTominay. He times his run into the middle of the box, and gets there just as the ball does. First time, left foot!',seconds:10.8,
  cues:[[0,'Watch McTominay'],[1.3,'times his run'],[2.9,'middle of the box'],[5.1,'just as the ball does'],[7.2,'First time']]},
 {label:'The finish',text:'The low shot flicks off a defender on the ground and past the keeper. Goal!',seconds:8.6,
  cues:[[0,'The low shot'],[1.2,'flicks off'],[3.6,'past the keeper'],[5,'Goal']]},
 {label:'The lesson',text:'That is the late run and finish. Time your run so you arrive in the box just as the ball does!',seconds:10.2,
  cues:[[0,'That is the late run'],[2.8,'Time your run'],[4.5,'arrive in the box'],[6,'just as the ball does']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py mctominay-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/mctominay-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/mctominay-signature/timing.json';
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
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}

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

// ---------------------------------------------------------------- Hampden Park on a damp March night: a low bowl, roofs, floodlights
/** a stand: along a→b (pitch x,z at the front), raking outward `out`; depth d metres, rise per metre, roof height */
type Stand={a:[number,number];b:[number,number];out:[number,number];depth:number;rise:number;roof:number;tiers:number[]};
const STANDS:Stand[]=[
 {a:[-6,76],b:[111,76],out:[0,1],depth:36,rise:.5,roof:22,tiers:[]},            // far side (North Stand): one long shallow tier
 {a:[-10,-4],b:[-10,72],out:[-1,0],depth:34,rise:.46,roof:19,tiers:[]},          // the end behind the goal Scotland attack (left)
 {a:[-8,-8],b:[113,-8],out:[0,-1],depth:40,rise:.6,roof:28,tiers:[.5]},          // the main stand (South Stand; the TV gantry)
 {a:[115,-4],b:[115,72],out:[1,0],depth:34,rise:.46,roof:19,tiers:[]},           // the far end (right)
 {a:[-10,72],b:[-6,76],out:[-.7,.7],depth:34,rise:.47,roof:20,tiers:[]},         // the bowl's curved corners
 {a:[111,76],b:[115,72],out:[.7,.7],depth:34,rise:.47,roof:20,tiers:[]},
];
/** the crowd: the Tartan Army in navy and white (saltires), blue; a Spain block (red and yellow) in the left corner of the far side */
const TIER_INK:[string,number][]=[[K,.55],[K,.3],[B,.3],[K,.72],[Y,.12],[B,.5],[K,.42],[R,.12]];
function stadium(s:Sheet,c:Cam){
 // night: a navy sky, a floodlit haze
 s.field(K,.62,.5);
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),lamps=new Path2D(),fascia=new Path2D(),away=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 STANDS.forEach((st,si)=>{const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];const top=1.2+st.depth*st.rise;
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,st.depth,top),P(0,st.depth,top)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  const rows=14,segs=si>3?2:12;for(let k=0;k<rows;k++){const d0=.6+k*st.depth/rows,d1=d0+st.depth/rows*.78,y0=1.2+d0*st.rise,y1=1.2+d1*st.rise;if(st.tiers.some(w=>Math.abs(k/rows-w)<.04)){addPoly(fascia,[P(0,d0,y0),P(1,d0,y0),P(1,d1,y1),P(0,d1,y1)],c);continue;}
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs,q=[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)];if(si===0&&g<2)addPoly(away,q,c);else addPoly(tiers[(k*3+g*5+si)%TIER_INK.length],q,c);}}
  // a dark roof over the back rows, floodlights along its front lip
  addPoly(roof,[P(-.02,st.depth+2,top+2),P(1.02,st.depth+2,top+2),P(1.02,st.depth*.6,st.roof),P(-.02,st.depth*.6,st.roof)],c);
  const nl=si>3?1:9;for(let k=0;k<nl;k++){const u=(k+.5)/nl;addPoly(lamps,[P(u-.02,st.depth*.6,st.roof-.1),P(u+.02,st.depth*.6,st.roof-.1),P(u+.02,st.depth*.6,st.roof-1.4),P(u-.02,st.depth*.6,st.roof-1.4)],c);}});
 s.knockout(concrete);s.fill(K,concrete,.5);s.fill(B,concrete,.25);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(R,away,.6);s.fill(Y,away,.35);s.knockout(fascia,.8);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(lamps);s.fill(Y,lamps,.85);
 // advertising boards: navy with paper panels (no lettering)
 s.knockout(wall);s.fill(B,wall,.75);s.stroke(K,wall,Math.max(2,.05*P3([50,0,34],c)[2]),.5);
 const grass=new Path2D();addPoly(grass,[[-10,0,-8],[115,0,-8],[115,0,76],[-10,0,76]],c);s.knockout(grass);s.fill(Y,grass,.55);s.fill(B,grass,.56);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,stripes,.15);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);
  const ps=P3([gx+dir*11,0,34],c);if(ps[2]>0){const r=Math.max(2,.2*ps[2]);ln.addPath(shape(blob(ps[0],ps[1],r,r*.45,5,{n:10,amp:0})));}}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x+(x?-.5:.5),1.38,z],c),g=P3([x,1.15,z],c);if(f[2]<=0||g[2]<=0||toCam([x,0,z],c)[2]<2)continue;
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** "the damp Glaswegian weather": fine drizzle streaks caught in the floodlights (one path, one knockout), falling with t */
function drizzle(s:Sheet,t:number,a=.3){const p=new Path2D();for(let i=0;i<46;i++){const x=(hash(i,7)*1700-850),y0=hash(i,11)*1300,y=((y0+t*900)%1300)-650,L=26+hash(i,13)*30;
 p.addPath(ribbon([[x,y],[x-L*.22,y+L]],1.6,{seed:i,taper:.6,wobble:0}));}s.knockout(p,a);}
/** A goal at line gx whose net runs out by dir: white posts and bar, a net (paper haze + navy mesh); bulge pushes the back out at z bz, y by. */
function goal(s:Sheet,c:Cam,gx:number,dir:number,bulge=0,bz=33.8){
 const z0=30.34,z1=37.66,h=2.44,bh=2.0,net=new Path2D(),bx=(z:number,y=1)=>gx+dir*(2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2))*(.4+.6*(1-y/bh)));
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
 * negates z both ways — that keeps McTominay's LEFT foot on his left (toward the near touchline as he runs at the goal on the left). */
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Scotland: navy shirts (paper numbers), white shorts, navy socks (inferred — see INFERRED) */
const sco=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,trim:'paper',shorts:'paper',socks:K,boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Spain: the pale-blue change strip (inferred), numbers left off */
const esp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.34],trim:[R,.7],shorts:[B,.34],socks:[B,.34],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',number:null,scale:FIG,...o});
/** Scott McTominay: number 4 (1.93 m; short dark-brown hair, stubble) */
const MCTOMINAY:AthleteStyle=sco({number:4,seed:4,hair:[K,.78],build:{height:1.93,bulk:1.02}});
/** Andy Robertson: number 3, captain, left-back (1.78 m) */
const ROBERTSON:AthleteStyle=sco({number:3,seed:26,hair:[K,.75],build:{height:1.78,bulk:.97}});
/** Pedro Porro: Spain's right-back, number 2 (1.73 m) */
const PORRO:AthleteStyle=esp({seed:2,build:{height:1.73,bulk:.96}});
/** Iñigo Martínez: centre-back, number 6 (1.82 m; dark beard) */
const MARTINEZ:AthleteStyle=esp({seed:6,build:{height:1.82,bulk:1.04}});
const KEPA:AthleteStyle={shirt:[Y,.85],shorts:[Y,.85],socks:[Y,.85],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:null,scale:FIG,seed:1,build:{height:1.86}};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:4,build:MCTOMINAY.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T = 0 = Porro's slip)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const T_SLIP=0,T_STEAL=.62,T_CUT=1.6,T_SHOT=3.1,T_DEF=3.3,T_NET=3.72;
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-5);for(let t=-4.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
function yawTo(a:[number,number],b:[number,number],u:number):[number,number]{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];}
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));

/** Porro (2): in control of the ball close to his byline, shielding it toward the corner; his feet go at T_SLIP and he sits down */
const PORRO_KEYS=[[-5,12,6.5],[-3,8.5,5.6],[-1.2,5.6,5],[T_SLIP,4.3,4.8],[.4,4.0,4.8],[6,4.0,4.8]];
const PORRO_FACE=nrm2(-1,-.25);
function slipPose(t:number):Pose{return clampPose(keyPoses(clamp(t),[
 [0,posed({lHipF:22,rHipF:-4,lKnee:32,rKnee:26,lean:20,pitch:4,lShA:34,rShA:30,lElb:40,rElb:44,neckP:24})],
 [.22,posed({lHipF:72,lKnee:8,lAnk:-12,rHipF:14,rKnee:42,pitch:-28,lean:-6,lShA:74,rShA:66,lShF:34,rShF:-20,lElb:20,rElb:30,neckP:8,air:.22,squash:.05})],
 [.5,posed({lHipF:78,rHipF:62,lKnee:14,rKnee:48,pitch:-36,lean:12,lShF:-46,rShF:-40,lShA:30,rShA:30,lElb:10,rElb:10,neckP:16,squash:-.08})],
 [1,posed({lHipF:82,rHipF:72,lKnee:26,rKnee:64,pitch:-24,lean:22,lShF:-40,rShF:-34,lShA:24,rShA:24,lElb:16,rElb:16,neckP:6,neckY:-40})],
]));}
/** Robertson (3): pressing from behind Porro, pounces on the loose ball at T_STEAL, one push along the byline, the cut-back at T_CUT */
const ROB_KEYS=[[-5,20,6],[-3,13.5,4.2],[-1.2,8.6,3.4],[T_SLIP,6.2,3.8],[T_STEAL,4.2,5.9],[1.1,3.1,7.3],[T_CUT,2.5,8.4],[2.2,2.4,9.4],[3.4,3.6,11],[6,6,13]];
/** Robertson's cut-back heading: back and across, toward the middle of the box */
function robPlace(T:number):Place{const p=trackAt(ROB_KEYS,T),v=velAt(ROB_KEYS,T),sp=Math.hypot(v[0],v[1]),run:[number,number]=sp>.5?[v[0]/sp,v[1]/sp]:[1,1];
 const cut=nrm2(BALL_S0[0]-p[0],BALL_S0[2]-p[1]);return placeOf(p[0],p[1],yawTo(run,cut,sm(T_CUT-.6,T_CUT-.25,T)*(1-sm(T_CUT+.6,T_CUT+1.2,T))));}
const CUT_POSE=(T:number)=>strike(clamp((T-T_CUT)/.85+STRIKE_CONTACT),{foot:'l',power:.5});

/** McTominay (4): the late run — jogging, holding outside the box while the ball is at the byline, then the burst into the middle of it,
 * arriving on the spot as the cut-back does; the first-time LEFT-foot shot at T_SHOT */
const MCT_SPOT:[number,number]=[11.4,29.6];
const MCT_KEYS=[[-5,31,24],[-3,28.4,25.2],[-1,25.6,26.2],[T_SLIP,24.3,26.6],[T_CUT,21.2,27.6],[2.35,16.6,28.6],[T_SHOT,MCT_SPOT[0],MCT_SPOT[1]],[3.6,9.4,29.6],[4.3,8.6,27],[6,10.5,20]];
/** the shot's heading (toward the goal) */
const H_SHOT=nrm2(-1,.08);
function mctPlace(T:number):Place{const p=trackAt(MCT_KEYS,T),v=velAt(MCT_KEYS,T),sp=Math.hypot(v[0],v[1]),run:[number,number]=sp>.5?[v[0]/sp,v[1]/sp]:[-1,0];
 return placeOf(p[0],p[1],yawTo(run,H_SHOT,sm(T_SHOT-.5,T_SHOT-.2,T)*(1-sm(T_SHOT+.5,T_SHOT+1,T))));}
const SHOT_POSE=(T:number)=>strike(clamp((T-T_SHOT)/.8+STRIKE_CONTACT),{foot:'l',power:.95});
/** the ball meets McTominay's LEFT boot here: solved from the body at the contact frame (no dependence on the ball) */
const BALL_S:V3=(()=>{const sk=solve(SHOT_POSE(T_SHOT),MCTOMINAY.build,mctPlace(T_SHOT),FIG),t=toMy(sk.lToe),h=toMy(sk.lHeel);return[t[0]*.7+h[0]*.3,.11,t[2]*.7+h[2]*.3];})();
const BALL_S0=BALL_S;
/** the ball meets Robertson's LEFT boot at the cut-back */
const BALL_C:V3=(()=>{const sk=solve(CUT_POSE(T_CUT),ROBERTSON.build,robPlace(T_CUT),FIG),t=toMy(sk.lToe),h=toMy(sk.lHeel);return[t[0]*.7+h[0]*.3,.11,t[2]*.7+h[2]*.3];})();
/** where the ball squirts loose as Porro's feet go (Robertson takes it here) */
const LOOSE_AT:V3=[3.4,.11,6.3];
/** the low shot, aimed for the near side of Kepa; it clips Martínez's boot at DEF and whizzes into the centre of the goal */
const AIM:[number,number]=[0,31.4];
const DEF_AT:V3=(()=>{const x=7.3,u=(BALL_S[0]-x)/(BALL_S[0]-AIM[0]);return[x,.16,lerp(BALL_S[2],AIM[1],u)];})();
const BALL_NET:V3=[-.6,.5,33.9],BALL_REST:V3=[-1.5,.11,34.2];
/** Iñigo Martínez (6): steps across and sprawls into the shot's path, right boot out; placed so that boot is at DEF_AT at T_DEF */
const SLIDE_T0=T_DEF-.42*1.1,SLIDE_DUR=1.1;
const MART_FACE=nrm2(.55,-1);
const MART_POSE=(T:number)=>slideTackle(clamp((T-SLIDE_T0)/SLIDE_DUR),{foot:'r'});
const MART_AT:[number,number]=(()=>{const sk=solve(MART_POSE(T_DEF),MARTINEZ.build,placeOf(0,0,MART_FACE),FIG),t=toMy(sk.rToe);return[DEF_AT[0]-t[0],DEF_AT[2]-t[2]];})();
const MART_KEYS=[[-5,11,33],[T_SLIP,8.2,32.4],[T_CUT,7.8,32.6],[SLIDE_T0,MART_AT[0]+.3,MART_AT[1]+.7],[SLIDE_T0+.01,MART_AT[0],MART_AT[1]],[8,MART_AT[0],MART_AT[1]]];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'mct',style:MCTOMINAY,keys:MCT_KEYS},
 {id:'rob',style:ROBERTSON,keys:ROB_KEYS},
 {id:'porro',style:PORRO,keys:PORRO_KEYS},
 {id:'mart',style:MARTINEZ,keys:MART_KEYS},
 // everyone else (positions illustrative)
 {id:'dykes',style:sco({number:9,seed:9,hair:[K,.6],build:{height:1.91,bulk:1.06}}),keys:[[-5,14,38],[T_SLIP,9,38],[T_CUT,7,39],[T_SHOT,6,39.5],[6,7,40]]},
 {id:'garcia',style:esp({seed:3,build:{height:1.83}}),keys:[[-5,12,40],[T_SLIP,7.5,38.8],[T_CUT,6,38],[T_SHOT,5,37],[6,4.5,36.5]]},
 {id:'mcginn',style:sco({number:7,seed:7,hair:[K,.7]}),keys:[[-5,26,15],[T_SLIP,20,16],[T_CUT,15,17.5],[T_SHOT,11.5,19.5],[6,10,21]]},
 {id:'rodri',style:esp({seed:16,build:{height:1.91}}),keys:[[-5,30,31],[T_SLIP,26,31],[T_CUT,21.5,32],[T_SHOT,15.5,33],[6,12,32.5]]},
 {id:'merino',style:esp({seed:15,build:{height:1.88}}),keys:[[-5,24,19],[T_SLIP,18,18.5],[T_CUT,14,19],[T_SHOT,12,21.5],[6,11,23]]},
 {id:'christie',style:sco({number:11,seed:11}),keys:[[-5,22,46],[T_SLIP,17,46],[T_CUT,14,45],[T_SHOT,12,44],[6,12,43]]},
 {id:'gaya',style:esp({seed:14,build:{height:1.72}}),keys:[[-5,16,50],[T_SLIP,12,48],[T_CUT,10,46],[T_SHOT,9,44.5],[6,8.5,43]]},
 {id:'mcgregor',style:sco({number:8,seed:8}),keys:[[-5,40,30],[T_SLIP,35,30],[T_CUT,31,31],[T_SHOT,27,31],[6,24,31]]},
 {id:'ceballos',style:esp({seed:10}),keys:[[-5,34,40],[T_SLIP,30,39],[T_CUT,27,38],[T_SHOT,24,37],[6,22,36]]},
];
const KEPA_KEYS=[[-5,1.6,33],[T_SLIP,1.4,31.6],[T_CUT,1.2,31.2],[T_SHOT-.3,1.3,32.2],[T_SHOT,1.3,32.3]];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: at Porro's feet, loose as he slips, Robertson's push, the cut-back, McTominay's shot, the deflection, the net. */
function ballAt(T:number):V3{
 if(T<T_SLIP){const p=trackAt(PORRO_KEYS,T);return[p[0]+PORRO_FACE[0]*.55,.11,p[1]+PORRO_FACE[1]*.55+.1];}
 const b0:V3=[trackAt(PORRO_KEYS,T_SLIP)[0]+PORRO_FACE[0]*.55,.11,trackAt(PORRO_KEYS,T_SLIP)[1]+PORRO_FACE[1]*.55+.1];
 if(T<T_STEAL)return lerp3(b0,LOOSE_AT,sm(T_SLIP,T_STEAL,T,easeOut));
 if(T<T_CUT)return lerp3(LOOSE_AT,BALL_C,sm(T_STEAL,T_CUT,T,easeOut));
 if(T<T_SHOT){const u=(T-T_CUT)/(T_SHOT-T_CUT);return lerp3(BALL_C,BALL_S,u*(1.08-.08*u),.15);}
 if(T<T_DEF)return lerp3(BALL_S,DEF_AT,(T-T_SHOT)/(T_DEF-T_SHOT),.05);
 if(T<T_NET)return lerp3(DEF_AT,BALL_NET,(T-T_DEF)/(T_NET-T_DEF),.35);
 return lerp3(BALL_NET,BALL_REST,sm(T_NET,T_NET+.5,T,easeOut),0);
}

// ---------------------------------------------------------------- the players at play time T
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
/** McTominay: the jog, eyes on the ball at the byline, the burst, the first-time strike with his left foot, away to celebrate */
function mctState(T:number):St{
 const place=mctPlace(T),run=runState(MCT_KEYS,T);let pose=lookAtBall({pose:run.pose,place},T,.8*(1-sm(T_SHOT-.4,T_SHOT-.1,T)));
 pose=blendPose(pose,SHOT_POSE(T),win(T,T_SHOT-.45,T_SHOT+.45,.12));
 if(T>T_NET)pose=blendPose(pose,celebrate(((T-T_NET)*.8)%1,{kind:'run'}),sm(T_NET+.4,T_NET+.9,T));
 return{pose,place};
}
function robState(T:number):St{
 const place=robPlace(T),run=runState(ROB_KEYS,T);let pose=lookAtBall({pose:run.pose,place},T,.7*(1-sm(T_CUT-.3,T_CUT,T)));
 // the steal: a quick poke with the left foot, still running
 pose=blendPose(pose,strike(clamp((T-T_STEAL)/.8+STRIKE_CONTACT),{foot:'l',power:.2}),win(T,T_STEAL-.3,T_STEAL+.3,.12)*.8);
 pose=blendPose(pose,CUT_POSE(T),win(T,T_CUT-.45,T_CUT+.42,.12));
 if(T>T_CUT+.5)pose=lookAtBall({pose,place},T,.9);
 return{pose,place};
}
function porroState(T:number):St{
 const st=runState(PORRO_KEYS,T,PORRO_FACE);
 if(T<T_SLIP-.25)return{pose:blendPose(st.pose,slipPose(0),.5),place:st.place};
 return{pose:blendPose(st.pose,slipPose((T-T_SLIP)/.9),sm(T_SLIP-.25,T_SLIP,T)),place:st.place};
}
function martState(T:number):St{
 if(T<SLIDE_T0){const st=runState(MART_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};}
 return{pose:MART_POSE(T),place:placeOf(MART_AT[0],MART_AT[1],MART_FACE)};
}
function kepaState(T:number):St{const[x,z]=trackAt(KEPA_KEYS,T),b=ballAt(Math.min(T,T_SHOT)),face=nrm2(b[0]-x,b[2]-z);
 const at=placeOf(x,z,face);if(T<T_SHOT+.04)return{pose:keeperSet(T*1.1),place:at};
 // committed to the shot's line (his right, the near post); the deflection goes past him into the middle
 const pl=placeOf(x,z,[1,0]);return{pose:blendPose(keeperSet(T*1.1),keeperDive(clamp((T-T_SHOT-.04)/1),{side:'r',height:.15}),sm(T_SHOT,T_SHOT+.1,T)),place:pl};}
function stateOf(id:string,T:number):St{
 if(id==='mct')return mctState(T);if(id==='rob')return robState(T);if(id==='porro')return porroState(T);if(id==='mart')return martState(T);if(id==='kepa')return kepaState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['mct','rob'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes (plus `heroes`). */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean;heroes?:string[]}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'kepa'].filter(id=>!o.only||o.only.includes(id)),heroes=[...HEROES,...(o.heroes??[])];
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='kepa'?KEPA:TR(id).style,hero=heroes.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='mct'&&Math.abs(T-T_SHOT)<.22)||(id==='rob'&&Math.abs(T-T_CUT)<.2)||(id==='mart'&&Math.abs(T-T_DEF)<.25);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-.002,draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 const bulge=T>T_NET?Math.exp(-(T-T_NET)*3)*sm(T_NET-.05,T_NET+.08,T):0;
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir,gx===0?bulge:0)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}
/** a spark where the shot clips Martínez's boot */
function clip(s:Sheet,T:number,c:Cam,size=.5){const u=(T-T_DEF)/.35;if(u<=0||u>=1)return;const p=P3(DEF_AT,c);if(p[2]<=0)return;sparkBurst(s,Y,p[0],p[1],size*p[2],{n:8,seed:17,g:easeOut(u)*(1-u*.6),width:.06*p[2]});}

// ---------------------------------------------------------------- chapters
/** 1 · live, real time: the high main camera in the main stand, panning with the play near the byline and into the box. */
const MAIN_CAM:V3=[34,19,-40];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-4.2],[q[1]+.2,T_SLIP],[q[2]+.2,T_STEAL],[q[3]+.2,T_CUT],[q[4]+.1,T_SHOT+.3],[S,T_NET+3.2]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-4,T-.2)),tx=clamp(lerp(b[0],9,.25),2.5,22),tz=lerp(13,24,sm(T_STEAL,T_SHOT+.3,T,easeInOutSine));
 const F=lerp(4300,5000,sm(-1.5,T_CUT,T,easeInOutSine));return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);const T=t1(twos(t)),c=cam1(t);drawPlay(s,T,c,{wide:true});clip(s,T,c,.9);drizzle(s,twos(t),.26);frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[4]+.6;},
};
/** 2 · TV slow-motion replay from a low camera behind and beside McTominay's run: the hold outside the box, the burst, the first-time strike. */
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-.6],[q[1]+.2,.5],[q[2]+.2,T_CUT+.1],[q[3]+.3,T_SHOT-.25],[q[4]+.3,T_SHOT+.05],[S,T_SHOT+.75]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(MCT_KEYS,Math.min(T,T_SHOT)),u=sm(T_CUT,T_SHOT,T,easeInOutSine);
 const pos:V3=[m[0]+6.5-1.5*u,1.6+.2*u,m[1]+4.4];return camAt(pos,[m[0]-6-2*u,.8,m[1]-4.2+1.6*u],lerp(1500,1750,u));};
const ch2:Scene={
 draw(s,t){frame(s);const T=t2(twos(t));drawPlay(s,T,cam2(t),{ballScale:1.6,heroes:['porro','rodri']});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.5;},
};
/** 3 · the second replay, from high behind the goal: the low shot, the clip off Martínez on the ground, past Kepa, the net, the celebration. */
const BEHIND_CAM:V3=[-9,5.2,26];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_SHOT-.8],[q[1]+.2,T_DEF],[q[2]+.2,T_NET-.05],[q[3],T_NET+.35],[S,T_NET+3.4]]);};
const cam3=(t:number)=>{const T=t3(t),u=sm(T_NET+.3,T_NET+2.4,T,easeInOutSine),m=trackAt(MCT_KEYS,T);
 return camAt(BEHIND_CAM,[lerp(8.6,m[0]+1,u),1,lerp(31.4,m[1],u)],lerp(2300,2000,u));};
const ch3:Scene={
 draw(s,t){frame(s);const T=t3(twos(t)),c=cam3(t);drawPlay(s,T,c,{ballScale:1.6,heroes:['mart','kepa','dykes','garcia']});clip(s,T,c);frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[3]+.6;},
};
/** 4 · the lesson plate: a raised camera on the near side of the box, the play again with bold yellow teaching marks — the arrival spot
 * ringed, the late run drawn as an arrow from outside the box, the cut-back drawn as an arrow from the byline, both meeting on the spot, a
 * burst and a ghost of the strike when player and ball arrive together. */
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-1],[q[1],-.2],[q[2],T_CUT],[q[3]+.3,T_SHOT],[S,T_SHOT+.4]]);};
const cam4=(t:number)=>{const u=sm(0,SECS(3),t,easeInOutSine);return camAt([17-2*u,10,-9],[9.5,0,21],lerp(2900,3100,u));};
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
  const cast=['mct','rob','porro','mart','kepa','dykes','garcia','rodri','ball'];
  stadium(s,c);
  // the arrival spot, ringed and pulsing from the start ("the late run")
  const ring=sm(.1,.6,t,easeOutBack)*(1-sm(S-.9,S-.4,t)),pulse=1+.08*Math.sin(t*5);
  if(ring>.01)mark(s,groundRing(BALL_S[0],BALL_S[2],1.25*ring*pulse,c),ring>1?1:ring);
  drawPlay(s,T,c,{ballScale:1.5,only:cast,noStadium:true,heroes:['porro']});
  const fade=1-sm(S-.9,S-.4,t);
  // "time your run": his run from outside the box, drawn with the play
  const run=sm(q[1],q[1]+1.2,t,easeInOutSine);
  if(run>0&&fade>0){const pts:Pt[]=[];for(let i=0;i<=12;i++){const p=trackAt(MCT_KEYS,lerp(-.4,T_SHOT-.25,i/12));pts.push(G(p[0],p[1],c));}arrowAlong(s,pts,Math.max(10,.18*P3([16,0,28],c)[2]),43,run,fade);}
  // "arrive in the box": the cut-back from the byline to the same spot
  const cut=sm(q[2]+.2,q[2]+1.3,t,easeInOutSine);
  if(cut>0&&fade>0){const pts:Pt[]=[];for(let i=0;i<=14;i++){const u=i/14;pts.push(G(lerp(BALL_C[0],BALL_S[0]+.6,u),lerp(BALL_C[2],BALL_S[2]-.5,u),c,.05));}arrowAlong(s,pts,Math.max(10,.16*P3([6,0,18],c)[2]),51,cut,fade);}
  // "just as the ball does": a burst on the spot and a ghost of the strike
  const stamp=sm(q[3]+.2,q[3]+.55,t,easeOutBack);
  if(stamp>.002&&fade>0){const bp=P3(BALL_S,c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   if(T>=T_SHOT-.05)drawPlayer(s,SHOT_POSE(T_SHOT+.1),c,GHOST,mctPlace(T_SHOT));}
  frame(s);
 },
 get still(){return Q(3)[3]+1;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'mctominay-signature',format:'11v11',title:'The late run and finish',theme:'Time your run so you arrive in the box just as the ball does',
 ageNote:'Scotland v Spain · Euro 2024 qualifier, 28 March 2023 · Hampden Park, Glasgow',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little floodlight spark and a spray of rain-wet grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; the goal Scotland attack at X = 0, the near touchline Z = 0) — checked by
 * tests/play-film-mctominay-signature.cjs. */
export const FACTS={T_SLIP,T_STEAL,T_CUT,T_SHOT,T_DEF,T_NET,BALL_S,BALL_C,DEF_AT,BALL_NET,LOOSE_AT,ballAt,
 /** each boot's toe at the shot contact frame (pitch metres) */
 leftToe:()=>toMy(solve(SHOT_POSE(T_SHOT),MCTOMINAY.build,mctPlace(T_SHOT),FIG).lToe),
 rightToe:()=>toMy(solve(SHOT_POSE(T_SHOT),MCTOMINAY.build,mctPlace(T_SHOT),FIG).rToe),
 robLeftToe:()=>toMy(solve(CUT_POSE(T_CUT),ROBERTSON.build,robPlace(T_CUT),FIG).lToe),
 robRightToe:()=>toMy(solve(CUT_POSE(T_CUT),ROBERTSON.build,robPlace(T_CUT),FIG).rToe),
 martRightToe:()=>toMy(solve(MART_POSE(T_DEF),MARTINEZ.build,placeOf(MART_AT[0],MART_AT[1],MART_FACE),FIG).rToe),
 mctAt:(T:number)=>{const st=mctState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 robAt:(T:number)=>{const st=robState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 porroAt:(T:number)=>trackAt(PORRO_KEYS,T),
 mctSpeed:(T:number)=>{const v=velAt(MCT_KEYS,T);return Math.hypot(v[0],v[1]);}};
