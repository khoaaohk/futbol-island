/** Iconic-play film · Fermín López, "Signature: the surprise run and shot" — the Olympic men's football final, France 3–5 Spain (after
 * extra time), Parc des Princes, Paris, Friday 9 August 2024 (18:00 local kick-off, a sunny, partly cloudy evening), the 25th minute:
 * Juan Miranda's driven cross from the left and Fermín López, arriving in the right place, taps it in from close range for 2–1 — his
 * second goal of the final.
 *
 * WHY THIS MOMENT: Fermín's signature (lib/town/iconicPlays.json, kind "signature", lesson "Keep running forward after you pass: the return
 * ball can find you free") is a trait — the midfielder's late, unmarked arrival in the box. His two goals in the Olympic final are his
 * best-documented moments for Spain (card country: Spain, lib/town/playerAppearance.json; club Barcelona since 2023, national team since
 * 2024, lib/town/playerCareers.json). The second one is the one the written accounts describe well enough to stage: "a driven cross from the
 * left by Juan Miranda with Fermín in the right place to tap it in" (the Guardian), and FIFA's event data puts the finish ~2.4 m from the
 * goal line, centrally — a midfielder who got there first. The sources do NOT describe a pass-and-go by Fermín before this goal, so the
 * match chapters never stage one: the lesson move itself (pass, keep running, get the return ball) is a clearly labelled "How he does it"
 * demonstration on a training pitch in chapter 3, with young players in training bibs (no named players, no match). The Barcelona v Napoli
 * 2024 chance (a missed chip) belongs to the Cubarsí film, so it is not used here.
 *
 * A riso print of one 3D choreography in pitch metres (X along the pitch, Spain attacking +X toward France's goal at X=105; Z across, away
 * from the main-stand camera, so Spain's LEFT wing is the far touchline, high Z; Y up) seen through TV cameras — 1 live, the high main-stand
 * camera (Miranda on the left, the driven cross, Fermín arriving, the tap-in, the wheel away); 2 a TV slow-motion replay from a camera
 * behind and to the left of his run (from midfield into the box, the gap between the defenders, the tap-in, the celebration); 3 "How he
 * does it", the lesson (the only chapter with teaching marks): pass, keep running, the defender watches the ball, the return pass finds
 * you free, and the shot. No overlays inside the footage chapters.
 *
 * SOURCES (fetched 24 Sep 2026 with curl, one request per ≥ 8 s, generic UA, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Football at the 2024 Summer Olympics – Men's tournament final" (raw; wiki-2024-olympic-men-final.txt): 9 August 2024,
 *    Parc des Princes, Paris; France 3–5 Spain after extra time; goals Millot 11', López 18' and 25', Baena 28', (Akliouche 79'), Mateta
 *    90+3' pen., Camello 100' and 120+1'; attendance 44,260; referee Ramon Abatti; weather partly cloudy, 26 °C; line-ups with shirt
 *    numbers (Spain: Tenas 1; Pubill 2, Eric García 4, Cubarsí 5, Miranda 3; Oroz 14, Barrios 6, Fermín López 11, Sergio Gómez 17; Baena
 *    10; Abel Ruiz 9 (c). France: Restes in goal; Koné, Millot, Olise, Lacazette, Mateta …; manager Thierry Henry); KIT infobox: France
 *    blue shirts (1F14DE), white shorts, red socks (_fra24h); Spain in the pale-yellow change kit (F1FF91 shirt, shorts and socks, _esp24a).
 *  - Wikipedia, "Football at the 2024 Summer Olympics – Men's tournament – Knockout stage" (raw; wiki-2024-olympic-men-ko.txt): the bracket
 *    (9 August, Parc des Princes, France 3–5 Spain a.e.t.).
 *  - The Guardian, Barney Ronay, match report, 9 Aug 2024 (guardian-fra-esp-olympic-final-2024-report.txt): "Six minutes later Spain were
 *    level via a brilliantly worked goal, Fermín López side-footing into the corner for his fifth of the tournament after an extended period
 *    of slick possession. And Spain were 2-1 up soon after with another well-made goal, this time created by a driven cross from the left by
 *    Juan Miranda with Fermín in the right place to tap it in."; Spain won gold, 5-3.
 *  - The Guardian live blog, Rob Smyth (guardian-fra-esp-olympic-final-2024-live.html): "GOAL! France 1-2 Spain (Lopez 25)"; photo captions
 *    "Fermín López tucks the ball home from close range for his, and Spain's, second goal of the game." and "Then wheels away in
 *    celebration."
 *  - FIFA match timeline API, match 400018556 (fifa-api-fra-esp-olympic-final-2024-timeline.json): "25' Fermin LOPEZ (Spain) scores!!" at
 *    position X 97.7, Y 48.5 (percent of the pitch, Spain attacking: ~2.4 m from the goal line, central); a France goalkeeper "Goal
 *    Prevention" event logged in the same minute just before it; his 24' foul at X 62.9 (he was in midfield a minute earlier).
 * CONFIRMED: match, date, ground, the evening kick-off and the weather; the score at every stage, France 3–5 Spain a.e.t. (gold for Spain);
 *  the 25th-minute goal made it 1–2, Fermín's second of the final; created by Miranda's driven cross from the LEFT; Fermín tapped it in from
 *  close range, central, ~2.4 m out; then wheeled away in celebration; shirt numbers Fermín 11, Miranda 3, Ruiz 9; the kits (France blue /
 *  white / red, Spain pale yellow all over).
 * INFERRED (not in the accounts): every position, path and timing; the side of the pitch Spain attacked on screen; Fermín's run from
 *  midfield (he is a central midfielder and was at FIFA X 62.9 a minute earlier) and the gap he ran into; his RIGHT foot for the tap (he is
 *  right-footed; not narrated); Miranda's LEFT foot and where on the left he crossed from; the low height of the "driven" cross; Abel Ruiz's
 *  near-post run and the France defenders drawn to it; the other players' places (no numbers printed except 11, 3 and 9); the keeper
 *  Restes' late dive (the FIFA "goal prevention" in that minute may have been a touch — it is not shown or narrated) and his grey kit; kit
 *  trims and number colours; the celebration run toward Miranda with arms out; the Parc des Princes as drawn (a square two-tier bowl close to
 *  the pitch under a continuous roof) and the crowd colours; camera placements, hair and skin tones; the whole training-pitch
 *  demonstration in chapter 3.
 *
 * Narration text: public/plays/narration/fermin-lopez-signature/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.8 words/s, see prov()); EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes. Cue phrases all start with a plain
 * word. Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the
 * whole sheet (never sheet.safe) for card windows from 1.45:1 to square. Scenes read only their local time t; figures pose on twos. Every
 * random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,hash,easeOut,easeOutBack,easeInOutSine,linear,polyPath,ribbon,blob,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,posed,runCycle,dribble,stand,strike,keeperSet,keeperDive,celebrate,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets: ≈2.8 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.8+(/[.!?…]$/.test(w)?.35:/[,;:]$/.test(w)?.15:0);}
 const nw=(w:string)=>w.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`fermin film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+1).toFixed(2),cues};}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py fermin-lopez-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/fermin-lopez-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/fermin-lopez-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Paris 2024','Olympic final, 2024: Spain against France in Paris. Juan Miranda drives the ball across from the left. Who is arriving? Fermín López! Two-one to Spain.',
  ['Olympic final','Juan Miranda','drives the ball','Who is arriving','Fermín López']),
 prov('The replay','Watch again, slowly. Fermín runs from midfield into the box, right on time, and taps it in: his second goal of the final! Spain won gold, five-three.',
  ['Watch again','Fermín runs','into the box','taps it in','Spain won gold']),
 prov('How he does it','How does he do it? Pass to a teammate, then keep running forward. Defenders watch the ball, not you. So remember: keep running forward after you pass. The return ball can find you free!',
  ['How does he','Pass to a teammate','keep running forward','Defenders watch','remember','return ball']),
],VOICE);
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
/** a quad only when all of it is comfortably in front of the lens (near stand parts are culled) */
function addFar(p:Path2D,pts:V3[],c:Cam,minD:number){for(const v of pts)if(toCam(v,c)[2]<minD)return;addPoly(p,pts,c);}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};
/** a 3D bar a→b as a ribbon, width wm metres (at least minW units) */
function bar3(p:Path2D,c:Cam,a:V3,b:V3,wm:number,minW=1.2){const pa=P3(a,c),pb=P3(b,c);if(pa[2]<=0||pb[2]<=0||toCam(a,c)[2]<4||toCam(b,c)[2]<4)return;p.addPath(ribbon([[pa[0],pa[1]],[pb[0],pb[1]]],Math.max(minW,wm*(pa[2]+pb[2])/2),{taper:0,pressure:0,wobble:.3}));}

// ---------------------------------------------------------------- the Parc des Princes, a summer evening: a square two-tier bowl under one roof
const SCX=52.5,SCZ=34,PE=.2,NS=64;
/** a point on the bowl: angle th round the pitch centre, d metres out from the front of the stands, height y (a squarish superellipse:
 * the stands sit ~7 m from the touchlines and goal lines, no running track) */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[SCX+(60+d)*Math.sign(c)*Math.abs(c)**PE,y,SCZ+(41+d)*Math.sign(s)*Math.abs(s)**PE];}
/** lower tier d 0→15 (to 11 m), a balcony fascia, upper tier d 16→33 (to 28 m), the roof above */
const LOW=(b:number):[number,number]=>[15*b,1.2+9.8*b],UP=(b:number):[number,number]=>[16+17*b,13+15*b];
type Bowl={low:V3[][];up:V3[][];fascia:V3[][];roof:V3[][];wall:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],fascia:[],roof:[],wall:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU;
  const[l0,ly0]=LOW(0),[l1,ly1]=LOW(1),[u0,uy0]=UP(0),[u1,uy1]=UP(1);
  o.low.push([rim(a,l0,ly0),rim(b,l0,ly0),rim(b,l1,ly1),rim(a,l1,ly1)]);
  o.up.push([rim(a,u0,uy0),rim(b,u0,uy0),rim(b,u1,uy1),rim(a,u1,uy1)]);
  o.fascia.push([rim(a,15,11),rim(b,15,11),rim(b,16,13),rim(a,16,13)]);
  o.roof.push([rim(a,5,31.5),rim(b,5,31.5),rim(b,34,30),rim(a,34,30)]);
  o.wall.push([rim(a,0,0),rim(b,0,0),rim(b,0,1.2),rim(a,0,1.2)]);
  for(let r=0;r<16;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,29);if(h<.1)continue;const[d,y]=r<8?LOW((r+.5)/8):UP((r-8+.5)/8);
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,5)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
function stadium(s:Sheet,c:Cam){
 // a bright August evening: pale sky (paper with a blue screen), the roof's shaded underside
 s.field(B,.16,.5);
 const low=new Path2D(),up=new Path2D(),fas=new Path2D(),roof=new Path2D(),wall=new Path2D();
 for(const q of BOWL.roof)addFar(roof,q,c,1);
 for(const q of BOWL.up)addFar(up,q,c,1);
 for(const q of BOWL.low)addFar(low,q,c,1);
 for(const q of BOWL.fascia)addFar(fas,q,c,1);
 for(const q of BOWL.wall)addFar(wall,q,c,4);
 s.knockout(roof);s.fill(K,roof,.72);s.tone(B,roof,.3);
 s.knockout(up);s.fill(K,up,.62);s.tone(B,up,.3);
 s.knockout(low);s.fill(K,low,.5);s.tone(B,low,.3);
 // the crowd (44,260): French blue, white and red, a few Spanish red-and-yellow flags
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=toCam(q.P,c)[2];if(d<14)continue;const p=P3(q.P,c);if(!onScreen(p))continue;const z=clamp(c.F*.5/d,2.2,8);
  inks[q.h<.4?0:q.h<.68?1:q.h<.9?2:3].rect(p[0]-z/2,p[1]-z*.7,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.85);s.fill(B,inks[1],.85);s.fill(R,inks[2],.8);s.fill(Y,inks[3],.8);}
 // the balcony fascia between the tiers: a navy band with a red stripe
 s.knockout(fas);s.fill(K,fas,.8);s.tone(R,fas,.3);
 s.knockout(wall,.5);s.fill(K,wall,.55);
 // the grass right up to the stands, with mowing stripes
 const grass=new Path2D();addPoly(grass,BOWL.wall.map(q=>q[0]),c);s.knockout(grass);s.fill(Y,grass,.78);s.fill(B,grass,.5);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,stripes,.16);
 // plain advertising boards along the touchlines and behind the goals (no brands)
 const bd=new Path2D(),board=(a:V3,b:V3)=>addFar(bd,[a,b,[b[0],.9,b[2]],[a[0],.9,a[2]]],c,2);
 for(let k=0;k<10;k++){board([-3+k*11.1,0,-3.5],[-3+(k+1)*11.1,0,-3.5]);board([-3+k*11.1,0,71.5],[-3+(k+1)*11.1,0,71.5]);}
 for(let k=0;k<6;k++){board([-5,0,4+k*10],[-5,0,4+(k+1)*10]);board([110,0,4+k*10],[110,0,4+(k+1)*10]);}
 s.knockout(bd,.4);s.fill(K,bd,.65);s.tone(R,bd,.3);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(R,fl);}
}
/** A goal at line gx whose net runs out by dir, centred on zc, w wide and h high: white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number,zc=34,w=7.32,h=2.44){
 const z0=zc-w/2,z1=zc+w/2,bx=gx+dir*h*.82,bh=h*.82,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,zc],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Fermín's RIGHT boot and Miranda's LEFT boot on the correct sides. */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE adapter: every body in the film is printed here. */
function drawPlayer(s:Sheet,pose:Pose,c:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: red + yellow screens (warm evening sun)
const LIGHT:InkFill[]=[[R,.2],[Y,.4]],MID:InkFill[]=[[R,.32],[Y,.5],[K,.08]],DARK:InkFill[]=[[R,.45],[Y,.45],[K,.3]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Spain, the pale-yellow change kit (Wikipedia kit infobox F1FF91 shirt, shorts and socks); navy trim and numbers inferred */
const spain=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.62],trim:[K,.55],shorts:[Y,.62],socks:[Y,.62],boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** France (infobox): blue shirts, white shorts, red socks; white numbers, red trim inferred */
const france=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:[R,.7],shorts:'paper',socks:R,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Fermín López: number 11, dark hair, 1.74 m */
const FERMIN:AthleteStyle=spain(LIGHT,{number:11,seed:11,hair:[K,.8],build:{height:1.74,bulk:.97}});
/** Juan Miranda: number 3, dark hair, 1.85 m */
const MIRANDA:AthleteStyle=spain(LIGHT,{number:3,seed:3,hair:[K,.9],build:{height:1.85,bulk:1}});
/** Abel Ruiz: number 9 */
const RUIZ:AthleteStyle=spain(MID,{number:9,seed:9,hair:[K,.9],build:{height:1.82}});
/** Guillaume Restes, France's keeper: grey kit (inferred) */
const RESTES:AthleteStyle={shirt:[K,.45],shorts:[K,.7],socks:[K,.45],boots:K,skin:LIGHT,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',numberInk:'paper',scale:FIG,seed:16,build:{height:1.86}};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Fermín's touch)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** where Miranda strikes the cross (the left channel, level with the six-yard box), where Fermín meets it (FIFA X 97.7 % ≈ 2.4 m out,
 * central) and where it goes in */
const XB:[number,number]=[95.2,56.4],TAP:[number,number]=[102.6,35.4],NET:[number,number]=[106.1,33.4];
const T_X=-.8,T_TAP=0,X_DUR=.75,X_START=T_X-STRIKE_CONTACT*X_DUR,X_POW=.8;
const TAP_DUR=.6,TAP_START=T_TAP-STRIKE_CONTACT*TAP_DUR,T_GOAL=.32;
/** Miranda's cross: LEFT foot (inferred), facing down the flight */
const X_H=nrm2(TAP[0]-XB[0],TAP[1]-XB[1]);
const X_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l',power:X_POW}),MIRANDA.build,placeOf(0,0,X_H),FIG),f=toMy(midSole(sk.lToe,sk.lHeel));return[XB[0]-f[0]-X_H[0]*.12,XB[1]-f[2]-X_H[1]*.12];})();
/** Fermín's tap: RIGHT foot side-foot toward the net (inferred) */
const TAP_H=nrm2(NET[0]-TAP[0],NET[1]-TAP[1]);
const F_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.3}),FERMIN.build,placeOf(0,0,TAP_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[TAP[0]-f[0]-TAP_H[0]*.1,TAP[1]-f[2]-TAP_H[1]*.1];})();
/** celebration: he wheels away toward Miranda */
const CEL:[number,number]=[98.4,47.2];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const MIR_KEYS=[[-7,80.5,60.6],[-5,85.4,60.1],[-3,90,58.7],[X_START-.35,...add2(X_AT,X_H,-1.6)],[X_START,...X_AT],[T_X+.9,...X_AT],[1.6,X_AT[0]+.8,X_AT[1]-1.5],[4.5,CEL[0]-1.2,CEL[1]+2.2]];
/** Fermín's run from midfield: accelerating, straight into the gap between Ruiz's markers and the far-post pair */
const FER_KEYS=[[-7.4,66,39],[-5.5,72.6,39.1],[-4,79.6,38.8],[-2.5,87.6,38.1],[-1.2,95,37.3],[TAP_START-.35,...add2(F_AT,TAP_H,-2.2)],[TAP_START,...F_AT],
 [T_TAP+.5,...F_AT],[1.2,F_AT[0]-.2,F_AT[1]+1.4],[3.4,...CEL],[5,CEL[0]-.6,CEL[1]+.8]];
const RES_KEYS=[[-7,103.5,35.4],[-3,103.7,36.6],[-1.2,103.9,37.3],[T_X,103.8,37]];
const TRACKS:Track[]=[
 {id:'fermin',style:FERMIN,keys:FER_KEYS},
 {id:'miranda',style:MIRANDA,keys:MIR_KEYS},
 // Abel Ruiz darts to the near post and takes two defenders with him (inferred); a Spain runner at the far post (unnamed)
 {id:'ruiz',style:RUIZ,keys:[[-7,93,38.6],[-3,96.4,40],[-1,99.4,40.8],[0,100.6,41],[2,101,40.4],[5,99.5,44]]},
 {id:'s-far',style:spain(LIGHT,{seed:17,hair:[K,.85]}),keys:[[-7,92,25.8],[-3,95.5,26.5],[0,100,28.2],[2,100.4,29.5],[5,99,38]]},
 {id:'s-baena',style:spain(LIGHT,{seed:10,hair:[K,.95]}),keys:[[-7,83,47],[-3,86.5,47.5],[0,89.4,46.8],[2,91,46],[5,94.5,47]]},
 {id:'s-barrios',style:spain(LIGHT,{seed:6,hair:[K,.9]}),keys:[[-7,70,31],[-3,74,32.5],[0,77.5,34],[5,82,36]]},
 {id:'s-oroz',style:spain(LIGHT,{seed:14,hair:[Y,.8]}),keys:[[-7,72,52],[-3,76,51],[0,79,49.5],[5,84,48]]},
 {id:'s-pubill',style:spain(MID,{seed:2,hairStyle:'curly'}),keys:[[-7,62,14],[-3,66,15],[0,69,16.5],[5,74,18]]},
 {id:'s-cubarsi',style:spain(LIGHT,{seed:5,hair:[K,.7]}),keys:[[-7,55,29],[0,59,30],[5,63,31]]},
 // France: the right-back out to Miranda, the centre-backs dragged to Ruiz's near-post run, the left-back with the far-post runner,
 // the midfielders trailing Fermín (positions illustrative, no numbers printed)
 {id:'f-rb',style:france(DARK,{seed:41}),keys:[[-7,87.4,55.4],[-3,90.5,55.8],[-1,92.2,55.6],[T_X,92.8,55.4],[1,93.6,54.2],[5,95,52]]},
 {id:'f-rcb',style:france(MID,{seed:42}),keys:[[-7,95,42],[-3,97.4,42.3],[-1,99.8,42.2],[0,100.8,42.4],[2,101.2,41.6],[5,100.5,42]]},
 {id:'f-lcb',style:france(DARK,{seed:43,hairStyle:'curly'}),keys:[[-7,94.6,37.8],[-3,97,39.4],[-1,99.2,39.4],[0,99.9,39.8],[2,100.5,39],[5,100,39]]},
 {id:'f-lb',style:france(LIGHT,{seed:44}),keys:[[-7,93.5,24],[-3,96.4,25.2],[0,99.6,26.8],[2,100,28],[5,99,33]]},
 {id:'f-kone',style:france(DARK,{seed:45}),keys:[[-7,72.5,41.5],[-5,77,41],[-3,83,40.4],[-1.2,89.6,39.6],[0,93.4,39],[2,95.8,38.8],[5,96,40]]},
 {id:'f-millot',style:france(LIGHT,{seed:46}),keys:[[-7,80,49],[-3,84.5,49.5],[0,89,49.5],[2,90.5,49],[5,92,48]]},
 {id:'f-olise',style:france(MID,{seed:47,hairStyle:'curly'}),keys:[[-7,78,58],[-3,82.5,57.5],[0,86,56.5],[5,88,54]]},
 {id:'f-cm',style:france(LIGHT,{seed:48}),keys:[[-7,76,30],[-3,80,31.5],[0,84,33],[5,88,35]]},
 {id:'f-st',style:france(DARK,{seed:49}),keys:[[-7,62,40],[-3,64,42],[0,66,43],[5,70,43]]},
];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-7.6);for(let t=-7.4;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: Miranda's carry down the left, the driven low cross (LEFT foot), Fermín's right-foot tap from ~2.4 m, the net. */
function ballAt(T:number):V3{
 const xb:V3=[XB[0],.11,XB[1]],tp:V3=[TAP[0],.13,TAP[1]],gl:V3=[105.2,.34,lerp(TAP[1],NET[1],(105.2-TAP[0])/(NET[0]-TAP[0]))],nt:V3=[NET[0],.3,NET[1]];
 const MK=MIR_KEYS;
 if(T<X_START){const p=trackAt(MK,T),v=velAt(MK,T),s=Math.hypot(v[0],v[1])||1,k=.6+.4*Math.max(0,Math.sin(T*TAU/.8));return[p[0]+v[0]/s*k,.11,p[1]+v[1]/s*k];}
 if(T<T_X){const p=trackAt(MK,X_START-.05),v=velAt(MK,X_START-.1),s=Math.hypot(v[0],v[1])||1,a:V3=[p[0]+v[0]/s*.6,.11,p[1]+v[1]/s*.6];return lerp3(a,xb,sm(X_START,T_X,T,easeInOutSine));}
 // the driven cross: fast and low (never above ~.5 m), skidding across the six-yard box
 if(T<T_TAP)return lerp3(xb,tp,(T-T_X)/(T_TAP-T_X),.32);
 if(T<T_GOAL)return lerp3(tp,gl,(T-T_TAP)/(T_GOAL-T_TAP),.08);
 const u=clamp((T-T_GOAL)/.45);if(u<1)return[lerp(gl[0],nt[0],easeOut(u)),lerp(gl[1],nt[1],u),lerp(gl[2],nt[2],easeOut(u))];
 const w=clamp((T-T_GOAL-.45)/.35);return[nt[0]-.2*w,lerp(nt[1],.11,w*w),nt[2]];
}

// ---------------------------------------------------------------- the players at play time T
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number],ball=ballAt):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ball(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1,ball=ballAt):Pose{const b=ball(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const up=clamp(b[1]/Math.max(3,Math.hypot(b[0]-x,b[2]-z)),0,1.2);
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=(.25-up*.9)*w;return clampPose(p);}
/** Miranda: the carry down the left, head up, the LEFT-foot driven cross, watching it, then arms up and off to meet Fermín */
function mirandaState(T:number):St{
 if(T<X_START){const st=runState(MIR_KEYS,T,yawTo([1,-.06],X_H,sm(-2,X_START,T)));
  const pose=blendPose(st.pose,dribble(strideAt(MIR_KEYS,T)*.9/3.4,{foot:'l',speed:.55}),.5);return{pose:clampPose({...pose,neckP:pose.neckP-.35*sm(-2.2,-1.6,T)}),place:st.place};}
 const u=clamp((T-X_START)/X_DUR),sp=placeOf(X_AT[0],X_AT[1],X_H);
 if(u<1)return{pose:strike(u,{foot:'l',power:X_POW}),place:sp};
 if(T<T_X+.9){const pose=keyPoses(clamp((T-X_START-X_DUR)/.6),[[0,strike(1,{foot:'l',power:X_POW})],[1,stand()]]);return{pose:lookAtBall({pose,place:sp},T,.8),place:sp};}
 const st=runState(MIR_KEYS,T);return{pose:blendPose(lookAtBall(st,T,.6),celebrate(T*1.1,{kind:'arms'}),sm(.5,1,T)*.8),place:st.place};
}
/** Fermín: the run from midfield (head up at the cross), the right-foot tap, then he wheels away, arms out */
function ferminState(T:number):St{
 if(T<TAP_START-.35){const st=runState(FER_KEYS,T);return{pose:lookAtBall(st,T,T>T_X-.6?.9:.45),place:st.place};}
 if(T<TAP_START){const st=runState(FER_KEYS,T,yawTo(nrm2(1,-.1),TAP_H,sm(TAP_START-.35,TAP_START,T)));return{pose:lookAtBall(st,T,.8),place:st.place};}
 const u=clamp((T-TAP_START)/TAP_DUR),sp=placeOf(F_AT[0],F_AT[1],TAP_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.3}),place:sp};
 if(T<T_TAP+.5){const pose=keyPoses(clamp((T-TAP_START-TAP_DUR)/.25),[[0,strike(1,{foot:'r',power:.3})],[1,stand()]]);return{pose,place:sp};}
 const st=runState(FER_KEYS,T,T<1.2?yawTo(TAP_H,nrm2(-.4,1),sm(T_TAP+.5,1.2,T)):undefined);
 return{pose:blendPose(st.pose,celebrate(strideAt(FER_KEYS,T)*.9/4.3,{kind:'run'}),sm(.7,1.4,T)),place:st.place};
}
/** Restes: set at the near post as the cross comes, then a late dive across his goal after the touch (inferred) */
const DIVE_START=-.22,DIVE_DUR=.95,RES_SIDE:'l'|'r'='l';
function restesState(T:number):St{
 const [x,z]=trackAt(RES_KEYS,T),b=ballAt(T),h=nrm2(b[0]-x,b[2]-z);
 if(T<DIVE_START)return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(Math.min(-.4,h[0]),h[1]))};
 const u=clamp((T-DIVE_START)/DIVE_DUR);return{pose:keeperDive(u,{side:RES_SIDE,height:.15}),place:placeOf(x,z,nrm2(-1,.15))};
}
function stateOf(id:string,T:number):St{
 if(id==='fermin')return ferminState(T);if(id==='miranda')return mirandaState(T);if(id==='restes')return restesState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.55),place:st.place};
}
const HEROES=['fermin','miranda','restes','ruiz'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;wide?:boolean}={}){
 stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'restes'];
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='restes'?RESTES:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='fermin'&&(T>-4&&T<TAP_START||Math.abs(T-T_TAP)<.2))||(id==='miranda'&&Math.abs(T-T_X)<.2)||(id==='restes'&&T>DIVE_START&&T<DIVE_START+.6);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_X)<.3||Math.abs(T-T_TAP)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);if(onScreen(g))s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*9,key:K,shadow:B,seed:3});}});}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2]+(gx>100&&bp[0]>105?.004:0),draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera at the halfway line, panning with Miranda down the left, wide on the box for the cross and Fermín's
 * arrival, then easing in on the celebration. */
const MAIN_CAM:V3=[58,21,-30];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-6.6],[q[1],-3.6],[q[2]+.5,X_START],[q[3]+.4,-.42],[q[4]+.15,.05],[S,3.4]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(T),m=trackAt(MIR_KEYS,Math.min(T,X_START));
 const box=sm(-3,X_START,T,easeInOutSine),tap=sm(T_X,T_TAP,T,easeInOutSine),cel=sm(.6,3,T,easeInOutSine),f=trackAt(FER_KEYS,T);
 const tx=lerp(lerp(lerp(m[0]+4,100,box),101.5,tap),f[0]+1,cel),tz=lerp(lerp(lerp(m[1]-8,43,box),39,tap),f[1]+1,cel),F=lerp(lerp(lerp(3900,5200,box),6300,tap),8200,cel);
 return camAt(MAIN_CAM,[lerp(tx,b[0],.12*(1-cel)),0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);const c=cam1(t);drawPlay(s,t1(twos(t)),c,{wide:true,ballScale:2.3});frame(s);},
 aperture(t){const T=t1(twos(t)),f=ferminState(T).place,p=P3([f.x!,1.2,-f.z!],cam1(t));return apertureDisc(p[0],p[1],Math.max(8,.5*p[2]),12);},
 get still(){return Q(0)[4]+.4;},
};
/** 2 · TV slow-motion replay from a camera behind and to the left of Fermín's run: from midfield into the gap, the tap-in, and the wheel
 * away toward Miranda (toward the lens). */
/** a rail camera that tracks him from behind his right shoulder (the near side), then holds as he wheels away toward Miranda */
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-7.2],[q[1],-5.8],[q[2],-2.3],[q[3]+.2,-.02],[q[4],1.9],[S,3.8]]);};
const cam2=(t:number)=>{const T=t2(t),f=trackAt(FER_KEYS,Math.min(T,TAP_START)),fc=trackAt(FER_KEYS,T),b=ballAt(T),go=sm(-2.2,-.3,T,easeInOutSine),cel=sm(.8,2.8,T,easeInOutSine);
 const pos:V3=[f[0]-lerp(9,7,go),lerp(3.8,3.4,go),f[1]-lerp(7.5,8.5,go)];
 const ahead=add2(f,nrm2(1,-.1),lerp(6,2.5,go));
 const tx=lerp(lerp(ahead[0],lerp(f[0],b[0],.45),go),fc[0]+1,cel),tz=lerp(lerp(ahead[1],lerp(f[1],b[2],.45),go),fc[1]+1,cel);
 return camAt(pos,[tx,lerp(1,1.1,go),tz],lerp(lerp(1500,1650,go),1450,cel));};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.7});frame(s);},
 aperture(t){const T=t2(twos(t)),f=ferminState(T).place,p=P3([f.x!,1.2,-f.z!],cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.5*p[2]),12);},
 get still(){return Q(1)[3]+.6;},
};

// ---------------------------------------------------------------- 3 · "How he does it": a separate demonstration on a training pitch
/** Three young players in training bibs (generic, no match): YOU pass to a teammate, keep running forward past a defender who turns to
 * watch the ball, the return pass finds you free, and you shoot first time into a small goal. μ = demo seconds; same world axes (X right,
 * Z away from the camera). */
const D_PASS=.8,D_MRX=1.5,D_RET=2.5,D_SHOT=3.2,D_GOAL=3.62;
const KID=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],trim:K,shorts:K,socks:[Y,.95],boots:K,skin:LIGHT,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,build:{height:1.46,bulk:.92,head:1.08},scale:1,seed:81,...o});
const YOU_ST=KID({seed:82}),MATE_ST=KID({skin:MID,hair:[K,.95],hairStyle:'curly',seed:83});
const DEF_ST:AthleteStyle=KID({shirt:[R,.95],socks:[R,.95],skin:DARK,hair:[K,.95],seed:84});
const DGX=17.5,DGZ=.2;// the small training goal (5 m × 2 m)
const MATE_P:[number,number]=[5.6,5.4];
/** the return ball meets YOU here, in the space behind the defender; the shot goes into the goal's far side */
const RXP:[number,number]=[8.9,-.35],SHOT_TO:[number,number]=[DGX+.4,DGZ+1.1];
const DP_H=nrm2(MATE_P[0],MATE_P[1]),RET_H=nrm2(RXP[0]-MATE_P[0],RXP[1]-MATE_P[1]),SH_H=nrm2(SHOT_TO[0]-RXP[0],SHOT_TO[1]-RXP[1]);
const footAt=(pose:Pose,st:AthleteStyle,h:[number,number],foot:'l'|'r'):V3=>{const sk=solve(pose,st.build,placeOf(0,0,h),st.scale??1);return toMy(foot==='r'?midSole(sk.rToe,sk.rHeel):midSole(sk.lToe,sk.lHeel));};
/** YOU stands so the right boot meets the ball at (0.4, 0.15) */
const DP0:[number,number]=[.4,.15];
const Y_AT:[number,number]=(()=>{const f=footAt(strike(STRIKE_CONTACT,{foot:'r',power:.45}),YOU_ST,DP_H,'r');return[DP0[0]-f[0]-DP_H[0]*.1,DP0[1]-f[2]-DP_H[1]*.1];})();
/** the mate's return pass: right foot, from where YOU's pass arrives */
const M_AT:[number,number]=(()=>{const f=footAt(strike(STRIKE_CONTACT,{foot:'r',power:.5}),MATE_ST,RET_H,'r');return[MATE_P[0]-f[0]-RET_H[0]*.1,MATE_P[1]-f[2]-RET_H[1]*.1];})();
const S_AT:[number,number]=(()=>{const f=footAt(strike(STRIKE_CONTACT,{foot:'r',power:.7}),YOU_ST,SH_H,'r');return[RXP[0]-f[0]-SH_H[0]*.1,RXP[1]-f[2]-SH_H[1]*.1];})();
const PS_DUR=.7,PS_START=D_PASS-STRIKE_CONTACT*PS_DUR,RT_DUR=.7,RT_START=D_RET-STRIKE_CONTACT*RT_DUR,SH_DUR=.6,SH_START=D_SHOT-STRIKE_CONTACT*SH_DUR;
/** YOU: pass, then the run past the defender's back into the space */
const YOU_KEYS=[[-1,...Y_AT],[D_PASS+.34,...Y_AT],[1.7,2.1,-.35],[2.1,3.9,-.75],[2.5,5.9,-.85],[SH_START,...S_AT]];
/** the defender: faces YOU, then turns to the pass and drifts toward it (ball-watching), turning late */
const DEF_KEYS=[[-1,5.3,1.2],[D_PASS,5.3,1.2],[1.9,5.7,2.2],[D_RET,6,2.4],[3.1,6.7,1.7],[4.6,8.4,.8]];
function dBall(mu:number):V3{
 const mb:V3=[MATE_P[0],.11,MATE_P[1]],rx:V3=[RXP[0],.11,RXP[1]];
 if(mu<D_PASS)return[DP0[0],.11,DP0[1]];
 if(mu<D_MRX){const u=(mu-D_PASS)/(D_MRX-D_PASS);return lerp3([DP0[0],.11,DP0[1]],mb,1-Math.pow(1-u,1.5));}
 if(mu<D_RET)return mb;
 if(mu<D_SHOT){const u=(mu-D_RET)/(D_SHOT-D_RET);return lerp3(mb,rx,u);}
 const g:V3=[DGX+.1,.55,SHOT_TO[1]];
 if(mu<D_GOAL)return lerp3(rx,g,(mu-D_SHOT)/(D_GOAL-D_SHOT),.35);
 const w=clamp((mu-D_GOAL)/.4);return[lerp(g[0],DGX+1.2,easeOut(w)),lerp(g[1],.11,w*w),g[2]];
}
function youState(mu:number):St{
 if(mu<PS_START)return{pose:lookAtBall({pose:stand(),place:placeOf(Y_AT[0],Y_AT[1],DP_H)},mu,.6,dBall),place:placeOf(Y_AT[0],Y_AT[1],DP_H)};
 if(mu<PS_START+PS_DUR)return{pose:strike(clamp((mu-PS_START)/PS_DUR),{foot:'r',power:.45}),place:placeOf(Y_AT[0],Y_AT[1],DP_H)};
 if(mu<D_PASS+.34){const st=runState(YOU_KEYS,mu,yawTo(DP_H,[1,0],sm(PS_START+PS_DUR,D_PASS+.34,mu)),dBall);return{pose:blendPose(strike(1,{foot:'r',power:.45}),st.pose,sm(PS_START+PS_DUR,D_PASS+.34,mu)),place:st.place};}
 if(mu<SH_START){const st=runState(YOU_KEYS,mu,undefined,dBall);return{pose:lookAtBall(st,mu,.7,dBall),place:st.place};}
 const sp=placeOf(S_AT[0],S_AT[1],SH_H);
 if(mu<SH_START+SH_DUR)return{pose:strike(clamp((mu-SH_START)/SH_DUR),{foot:'r',power:.7}),place:sp};
 return{pose:blendPose(strike(1,{foot:'r',power:.7}),celebrate(mu*1.1,{kind:'arms'}),sm(D_GOAL,D_GOAL+.35,mu)),place:sp};
}
function mateState(mu:number):St{
 const sp=placeOf(M_AT[0],M_AT[1],mu<D_MRX?nrm2(-MATE_P[0],-MATE_P[1]):RET_H);
 if(mu<RT_START){const turn=sm(D_MRX-.2,RT_START,mu);const st={pose:stand(),place:placeOf(M_AT[0],M_AT[1],yawTo(nrm2(-MATE_P[0],-MATE_P[1]),RET_H,turn))};return{pose:lookAtBall(st,mu,.7,dBall),place:st.place};}
 if(mu<RT_START+RT_DUR)return{pose:strike(clamp((mu-RT_START)/RT_DUR),{foot:'r',power:.5}),place:sp};
 return{pose:lookAtBall({pose:blendPose(strike(1,{foot:'r',power:.5}),stand(),sm(RT_START+RT_DUR,RT_START+RT_DUR+.4,mu)),place:sp},mu,.8,dBall),place:sp};
}
function defState(mu:number):St{
 const b=dBall(mu),p=trackAt(DEF_KEYS,mu),face=mu<D_PASS?nrm2(-1,-.2):nrm2(b[0]-p[0],b[2]-p[1]);
 const st=runState(DEF_KEYS,mu,mu<3.1?face:undefined,dBall);
 const crouch=posed({lHipF:30,rHipF:22,lKnee:44,rKnee:40,lean:20,lShA:30,rShA:30,lElb:40,rElb:40,neckP:-4});
 return{pose:lookAtBall({pose:blendPose(crouch,st.pose,sm(D_PASS,1.6,mu)),place:st.place},mu,1,dBall),place:st.place};
}
const DEMO:{id:string;st:AthleteStyle;at:(mu:number)=>St}[]=[{id:'you',st:YOU_ST,at:youState},{id:'mate',st:MATE_ST,at:mateState},{id:'def',st:DEF_ST,at:defState}];
/** the training pitch: a pale daytime sky, a tree line, a hedge, mown grass, a white line and red cones */
function training(s:Sheet,c:Cam){
 s.field(B,.14,.5);
 const g=new Path2D();addPoly(g,[[-40,0,-30],[60,0,-30],[60,0,60],[-40,0,60]],c);s.knockout(g);s.fill(Y,g,.85);s.tone(B,g,.62);
 const st=new Path2D();for(let k=-10;k<16;k+=2)addPoly(st,[[k*3,0,-30],[(k+1)*3,0,-30],[(k+1)*3,0,60],[k*3,0,60]],c);s.tone(K,st,.08);
 const tr=new Path2D(),hd=new Path2D();for(let i=0;i<24;i++){const x=-30+i*4.4+hash(i,3)*2.5,q=P3([x,0,48],c);if(q[2]<=0||Math.abs(q[0])>1600)continue;const hgt=(7+hash(i,4)*5)*q[2];tr.addPath(shape(blob(q[0],q[1]-hgt*.62,hgt*.42,hgt*.55,i+9,{amp:.1,n:18})));}
 addPoly(hd,[[-40,0,44],[60,0,44],[60,1.5,44],[-40,1.5,44]],c);
 s.knockout(tr);s.fill(Y,tr,.75);s.tone(B,tr,.9);s.tone(K,tr,.45);s.knockout(hd);s.fill(Y,hd,.6);s.tone(K,hd,.55);
 const ln=new Path2D();groundLine(ln,[-10,-4.5],[DGX+4,-4.5],c,.1);groundLine(ln,[DGX,-6],[DGX,8],c,.1);s.knockout(ln,.9);
 const cn=new Path2D();for(const[x,z]of[[-1.5,-2],[-1.5,2.4],[11,-4],[11,7],[3,9]]as[number,number][]){const a=P3([x-.18,0,z],c),b=P3([x+.18,0,z],c),tp=P3([x,.32,z],c);if(a[2]>0&&b[2]>0&&tp[2]>0)cn.addPath(shape([[a[0],a[1]],[tp[0],tp[1]],[b[0],b[1]]]));}
 s.knockout(cn);s.fill(R,cn,.95);
}
/** a bold yellow teaching stroke (navy edge, paper knockout, ink) */
function mark(s:Sheet,p:Path2D,ink=Y){s.stroke(K,p,5,.9);s.knockout(p);s.fill(ink,p,.95);}
/** a bold teaching arrow along points (drawn to `u`), one path: shaft + head */
function arrowPts(s:Sheet,pts:Pt[],w:number,seed:number,u=1,ink=Y){if(u<=.01||pts.length<2)return;const n=Math.max(2,Math.ceil(pts.length*u)),q=pts.slice(0,n),e=q[q.length-1],d=q[q.length-2],an=Math.atan2(e[1]-d[1],e[0]-d[0]),hl=w*2.4;
 const back:Pt=[e[0]-Math.cos(an)*hl*.8,e[1]-Math.sin(an)*hl*.8],p=new Path2D();p.addPath(ribbon([...q.slice(0,-1),back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p,ink);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam,ink=Y){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring,ink);}
/** a ground arrow from a to b (pitch metres), bowed sideways by `bow` metres */
function groundArrow(s:Sheet,c:Cam,a:[number,number],b:[number,number],u:number,seed:number,bow=0,ink=Y){if(u<=.01)return;const pts:Pt[]=[],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;
 for(let i=0;i<=14;i++){const v=i/14,o=bow*Math.sin(v*Math.PI);pts.push(G(a[0]+dx*v-dz/L*o,a[1]+dz*v+dx/L*o,c,.03));}
 arrowPts(s,pts,Math.max(8,.28*P3([(a[0]+b[0])/2,0,(a[1]+b[1])/2],c)[2]),seed,u,ink);}
const mu3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,-.4],[q[1]+.1,.05],[q[1]+1,D_PASS+.1],[q[2]+.5,1.45],[q[3]+.3,1.9],[q[4]+.2,2.2],[q[5]-.15,D_RET-.1],[q[5]+.6,D_SHOT],[S-1.1,D_GOAL+.5],[S,D_GOAL+1.1]]);};
/** a raised side-on camera that follows the move down the lane */
const cam3=(t:number)=>{const mu=mu3(t),b=dBall(Math.min(mu,D_GOAL)),y=trackAt(YOU_KEYS,clamp(mu,-1,SH_START)),fx=lerp(lerp(3.2,(y[0]+MATE_P[0])/2+.5,sm(D_PASS,D_MRX+.4,mu,easeInOutSine)),lerp(b[0],DGX-2,.55),sm(D_RET,D_GOAL,mu,easeInOutSine));
 const tgt:V3=[lerp(fx,(RXP[0]+DGX)/2-.6,sm(D_GOAL-.3,D_GOAL+.6,mu,easeInOutSine)),.2,1.8];return camAt([tgt[0]-1.2,4.6,tgt[2]-11],tgt,lerp(1900,1300,sm(D_SHOT-.2,D_GOAL+.6,mu,easeInOutSine)));};
const ch3:Scene={
 draw(s,t){
  const q=Q(2),E=SECS(2),mu=mu3(twos(t)),c=cam3(t);frame(s);
  training(s,c);
  // "Pass to a teammate": the pass arrow from YOU to the mate
  const pa=sm(q[1]-.1,q[1]+.6,t,easeOut)*(1-sm(q[3]+.6,q[3]+1.1,t));
  groundArrow(s,c,[DP0[0]+.6,DP0[1]+.5],[MATE_P[0]-.5,MATE_P[1]-.6],pa,31,.4);
  // "keep running forward": the run arrow along YOU's path, into the space behind the defender
  const ra=sm(q[2]-.1,q[2]+.9,t,easeInOutSine)*(1-sm(E-.9,E-.5,t));
  groundArrow(s,c,[Y_AT[0]+.9,Y_AT[1]-.5],[RXP[0]-.3,RXP[1]-.5],ra,41,-.7);
  // "remember": a yellow ring round YOU as the run goes on
  const yp=youState(mu).place,rg=sm(q[4]-.1,q[4]+.35,t,easeOutBack)*(1-sm(q[5]+.3,q[5]+.7,t));
  if(rg>.01)groundRing(s,yp.x!,-yp.z!,.95*rg,c);
  // "return ball": the return pass arrow into the free space, and a ring where it finds YOU
  const rr=sm(q[5]-.2,q[5]+.4,t,easeOut)*(1-sm(E-.9,E-.5,t));
  groundArrow(s,c,[MATE_P[0]+.3,MATE_P[1]-.8],[RXP[0]+.1,RXP[1]+.6],rr,51,-.2);
  const fr=sm(q[5]+.1,q[5]+.5,t,easeOutBack)*(1-sm(E-.9,E-.5,t));if(fr>.01)groundRing(s,RXP[0],RXP[1],1.25*fr,c);
  // the goal, the figures and the ball in depth order
  const items:Item[]=[],gq=P3([DGX+1,1,DGZ],c);items.push({depth:1/gq[2],draw:()=>goal(s,c,DGX,1,DGZ,5,2)});
  const mp=mu3(twos(t)-1/12);
  for(const d of DEMO){const st=d.at(mu),g=P3([st.place.x!,0,-st.place.z!],c);if(g[2]<=0)continue;
   const fast=d.id==='you'&&mu>D_PASS+.3&&mu<SH_START+.4;
   items.push({depth:1/g[2],draw:()=>{const pr=d.at(mp);drawPlayer(s,st.pose,c,d.st,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast});}});}
  const b=dBall(mu),bq=P3(b,c),r=Math.max(5,.11*1.6*bq[2]),bg=P3([b[0],0,b[2]],c);
  items.push({depth:1/bq[2]-.001,draw:()=>{s.tone(K,shape(blob(bg[0],bg[1],r*1.1,r*.33,4,{n:14})),.5);footballPanels(s,bq[0],bq[1],r,{rot:-mu*9,key:K,shadow:B,seed:5});}});
  items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
  // "Defenders watch the ball": a dashed red sight line from the defender's eyes to the ball
  const dw=sm(q[3]-.1,q[3]+.4,t,easeOut)*(1-sm(q[4]+.2,q[4]+.7,t));
  if(dw>.01){const dp=defState(mu).place;groundRing(s,dp.x!,-dp.z!,.75*sm(0,.4,dw,easeOutBack),c,R);
   const e=P3([dp.x!,1.45,-dp.z!],c),bb=P3([b[0],.35,b[2]],c),pts:Pt[]=[];for(let i=0;i<=10;i++){const u=i/10;pts.push([lerp(e[0],bb[0],u),lerp(e[1],bb[1],u)-Math.sin(u*Math.PI)*.35*e[2]]);}
   arrowPts(s,pts,Math.max(9,.16*e[2]),61,dw,R);}
  // the goal: a spark in the net
  const gs=sm(D_GOAL,D_GOAL+.25,mu,easeOutBack)*(1-sm(D_GOAL+.6,D_GOAL+1,mu));
  if(gs>.002){const np=P3([DGX+.9,.9,SHOT_TO[1]],c);sparkBurst(s,Y,np[0],np[1],1.2*np[2],{n:10,seed:71,g:clamp(gs),width:.08*np[2]});}
  frame(s);
 },
 get still(){return Q(2)[5]+.8;},
};

const SCENES:Scene[]=[ch1,ch2,ch3];
const film:RisoStory={
 id:'fermin-lopez-signature',format:'11v11',title:'Fermín López: the surprise run and shot',theme:'Keep running forward after you pass: the return ball can find you free',
 ageNote:'Olympic final, France 3–5 Spain (a.e.t.) · Parc des Princes, Paris, 9 August 2024 · the lesson is a training-pitch demonstration',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little summer-sun spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Spain attacking +X, Z across) — checked by tests/play-film-fermin-lopez-signature.cjs. */
const feet=(st:St,build:AthleteStyle['build'],scale=FIG)=>{const sk=solve(st.pose,build,st.place,scale);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel)),pelvis:toMy(sk.pelvis)};};
export const FACTS={XB,TAP,NET,T_X,T_TAP,T_GOAL,X_START,TAP_START,DIVE_START,DIVE_DUR,ballAt,
 ferminFeet:(T:number)=>feet(ferminState(T),FERMIN.build),
 mirandaFeet:(T:number)=>feet(mirandaState(T),MIRANDA.build),
 restesFeet:(T:number)=>feet(restesState(T),RESTES.build),
 at:(id:string,T:number)=>{const st=stateOf(id,T);return[st.place.x!,-st.place.z!] as [number,number];},
 ids:TRACKS.map(t=>t.id),
 demo:{D_PASS,D_MRX,D_RET,D_SHOT,D_GOAL,DP0,MATE_P,RXP,DGX,DGZ,dBall,
  youFeet:(mu:number)=>feet(youState(mu),YOU_ST.build,1),mateFeet:(mu:number)=>feet(mateState(mu),MATE_ST.build,1),
  at:(id:'you'|'mate'|'def',mu:number)=>{const st=(id==='you'?youState:id==='mate'?mateState:defState)(mu);return[st.place.x!,-st.place.z!] as [number,number];},
  defFacing:(mu:number)=>{const st=defState(mu);return[Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)] as [number,number];}}};
