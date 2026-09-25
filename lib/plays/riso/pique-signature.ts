/** Iconic-play film · Gerard Piqué, "Signature: the calm pass out of defence" — shown HOW he did it, in one real, sourced match: Real Madrid
 * 2–6 Barcelona, La Liga matchday 34, Estadio Santiago Bernabéu, Madrid, Saturday 2 May 2009 (22:00 CEST kick-off, a night match).
 *
 * WHY THIS MATCH: Piqué's signature (lib/town/iconicPlays.json, kind "signature", lesson "After you win the ball, take a breath and pass it to a
 * teammate, don't just boot it") is a trait, not one goal. The written accounts read describe his style (a ball-playing centre-back who
 * "combined strength and tackling ability with passing", "capacidad para sacar el balón jugado" — bringing the ball out by passing it) but do
 * NOT describe one single Piqué pass out of defence beat by beat, and the pages read do not say how his 82nd-minute goal in this match was
 * made. So the film follows the brief's honest fallback: it is set in a real, famous Piqué match — the 2–6 at the Bernabéu in his first
 * Barcelona season, in which the centre-back scored the sixth goal — and the narration says plainly "Here's how he played from the back". The
 * interception, the touch, the look and the pass to Xavi are an ILLUSTRATION of his sourced style, not a claim about one frame of the match;
 * the goal itself is only mentioned (a sourced fact), never drawn.
 *
 * A riso print of one 3D choreography in pitch metres (X along the pitch, Barcelona's goal line at X=0, Z across, away from the main-stand
 * camera, Y up) seen through TV cameras — 1 live, the high main camera (a Madrid pass forward, Piqué steps in and wins it); 2 a TV slow-motion
 * replay from a low camera in front of him (no panic: a calm touch, head up, a look left and right); 3 a second replay over his shoulder (Xavi
 * free, the pass along the grass, Barcelona away); 4 the lesson (the only chapter with teaching marks: win it, take a breath, pass to a
 * teammate — and the crossed-out big boot). No overlays inside the footage chapters.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, slowly, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Gerard Piqué" (raw; wiki-gerard-pique.txt): "On 2 May, Piqué scored Barcelona's sixth goal in a 6–2 El Clásico win against
 *    Real Madrid at the Santiago Bernabéu"; style of play: "a modern and commanding defender, who combined strength and tackling ability with
 *    passing", "ball-playing ability and capacity to read the game", sweeper-like, nicknamed "Piquénbauer".
 *  - Wikipedia (es), "Gerard Piqué" (raw; eswiki-gerard-pique.txt): "capacidad para sacar el balón jugado y visión de ataque"; "El 2 de mayo de
 *    2009 anotó el sexto gol en la goleada histórica por 2-6 ... en el Estadio Santiago Bernabéu".
 *  - Wikipedia, "2008–09 FC Barcelona season" (raw; wiki-2008-09-barcelona-season.txt): 2 May 2009, 22:00 CEST, Real Madrid 2–6 Barcelona,
 *    Santiago Bernabéu, 80,000; goals Higuaín 13', Henry 17' 57', Puyol 20', Messi 35' 74', Ramos 55', Piqué 82'; referee Undiano Mallenco.
 *  - ESPN, "Oral history: How Barca made history with six trophies in 2009" (espn-oral-history-2009.txt): the 6–2 at the Bernabéu "effectively
 *    wrapped up the title"; photo caption "Xavi celebrates during Barca's remarkable win at Real Madrid" (so Xavi played).
 * CONFIRMED: match, date, venue, a night kick-off (22:00), the 2–6 score and goal minutes, Piqué scored the sixth (82'), Puyol scored and
 *  played, Xavi played; Piqué a ball-playing centre-back known for bringing the ball out by passing.
 * INFERRED (illustration, not in the accounts): the whole move (the Madrid pass, the interception, the touch, the look, the pass to Xavi), every
 *  position, path and timing; the Madrid players involved (unnamed, unnumbered); Piqué on the LEFT of the centre-back pair with Puyol on the
 *  right; Piqué's right foot (drawn, never narrated); the shirt numbers (Piqué 3, Puyol 5, Xavi 6 — their usual numbers that season; only the
 *  names are narrated); the KITS (not stated in the pages read: drawn as Barcelona in blue-and-red stripes, blue shorts and socks, yellow
 *  numbers; Madrid all white with navy trim; Valdés in grey); which end Barcelona defended on screen; the Bernabéu as drawn (steep tiers tight
 *  to the pitch, the roof ring of floodlights, a mostly white-clad home crowd); camera placements, hair and skin tones.
 *
 * Narration text: public/plays/narration/pique-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.8 words/s, see prov()); EVERY action time is read from cue onsets and chapter seconds, so once timing.json
 * exists `withTiming` re-times the action through the cue words and no scene code changes.
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Scenes read only their local time t; figures pose on twos. Every random
 * value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,hash,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,backpedal,lunge,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets: ≈2.8 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.8+(/[.!?…]$/.test(w)?.35:/[,;:]$/.test(w)?.15:0);}
 const nw=(w:string)=>w.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`pique film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+1).toFixed(2),cues};}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py pique-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/pique-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/pique-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The Bernabéu','Madrid, 2009. Barcelona beat Real Madrid six-two, and centre-back Gerard Piqué even scored! Here’s how he played from the back. A Madrid pass forward… Piqué steps in and wins it!',
  ['Madrid','Barcelona beat','Gerard Piqué','Here’s how he played','A Madrid pass','Piqué steps in','wins it']),
 prov('The replay','Watch again, slowly. No panic, no big boot. Piqué takes a calm touch, lifts his head and looks for a teammate.',
  ['Watch again','No panic','Piqué takes a calm touch','lifts his head','looks for a teammate']),
 prov('The pass','There’s Xavi, free in the middle. A calm pass along the grass, and Barcelona are on the attack!',
  ['There’s Xavi','A calm pass','along the grass','on the attack']),
 prov('The lesson','That’s Piqué. When you win the ball, take a breath, then pass it to a teammate. Don’t just boot it!',
  ['That’s Piqué','take a breath','pass it to a teammate','Don’t just boot it']),
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
/** a quad only when all of it is comfortably in front of the lens (the cameras sit inside the stands: near stand parts are culled) */
function addFar(p:Path2D,pts:V3[],c:Cam,minD:number){for(const v of pts)if(toCam(v,c)[2]<minD)return;addPoly(p,pts,c);}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};
/** a 3D bar a→b as a ribbon, width wm metres (at least minW units) */
function bar3(p:Path2D,c:Cam,a:V3,b:V3,wm:number,minW=1.2){const pa=P3(a,c),pb=P3(b,c);if(pa[2]<=0||pb[2]<=0||toCam(a,c)[2]<4||toCam(b,c)[2]<4)return;p.addPath(ribbon([[pa[0],pa[1]],[pb[0],pb[1]]],Math.max(minW,wm*(pa[2]+pb[2])/2),{taper:0,pressure:0,wobble:.3}));}

// ---------------------------------------------------------------- the Bernabéu at night, May 2009: steep tiers tight to the pitch, a roof ring of lamps
const SCX=52.5,SCZ=34,PE=.3,NS=48,SD=32;
/** a point on the stand ring: angle th round the pitch centre, d metres out from the inner edge (a squarish superellipse ~6 m outside the lines) */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[SCX+(59+d)*Math.sign(c)*Math.abs(c)**PE,y,SCZ+(41+d)*Math.sign(s)*Math.abs(s)**PE];}
/** steep rake: three tiers climbing to ~40 m */
const RAKE=(b:number):[number,number]=>[1+(SD-1)*b,1.4+38*b];
type Bowl={seg:V3[][];roof:V3[][];lamps:[V3,V3][];tiers:[V3,V3][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],lamps:[],tiers:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,SD-9,y1+2.6),rim(b,SD-9,y1+2.6),rim(b,SD+2,y1+4),rim(a,SD+2,y1+4)]);
  if(i%2===0)o.lamps.push([rim(a,SD-8.6,y1+2.3),rim(b,SD-8.6,y1+2.3)]);
  for(const f of[.34,.67]){const[d,y]=RAKE(f);o.tiers.push([rim(a,d,y),rim(b,d,y)]);}
  for(let r=0;r<8;r++)for(let k=0;k<2;k++){const h=hash(i*977+r*31+k*7,29);if(h<.14)continue;const[d,y]=RAKE((r+.5)/8);
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,5)-.5)*.5)/2)/NS*TAU,d,y+.4),h});}}
 return o;})();
const GRASS:V3[]=Array.from({length:48},(_,i)=>rim(i/48*TAU,0,0));
function stadium(s:Sheet,c:Cam){
 // a May night in Madrid: a deep printed navy sky
 s.field(K,.8,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg)addFar(bowl,q,c,10);
 for(const q of BOWL.roof)addFar(roof,q,c,10);
 s.knockout(bowl);s.tone(B,bowl,.3);s.tone(K,bowl,.45);
 // the crowd (80,000): mostly home white, navy coats, red faces
 const inks=[new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=toCam(q.P,c)[2];if(d<14)continue;const p=P3(q.P,c);if(!onScreen(p))continue;const z=clamp(c.F*.6/d,2.4,14);
  inks[q.h<.62?0:q.h<.86?1:2].rect(p[0]-z/2,p[1]-z*.7,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.8);s.fill(K,inks[1],.85);s.fill(R,inks[2],.75);}
 // tier fronts: pale bands that give the steep stands their three tiers
 const tf=new Path2D();for(const[a,b]of BOWL.tiers)bar3(tf,c,a,b,.9,1);s.knockout(tf,.6);s.tone(B,tf,.2);
 s.knockout(roof);s.fill(K,roof,.92);
 // floodlight rail along the roof's front edge: lit lamp strips with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b]of BOWL.lamps){bar3(lamp,c,a,b,.9);bar3(glow,c,a,b,3.4);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 // the floodlit grass (yellow × blue), mowing stripes, paper lines, corner flags
 const grass=new Path2D();addPoly(grass,GRASS,c);s.knockout(grass);s.fill(Y,grass,.72);s.fill(B,grass,.5);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,stripes,.16);
 // plain advertising boards along the touchlines and behind the goals (no brands)
 const bd=new Path2D(),board=(a:V3,b:V3)=>addFar(bd,[a,b,[b[0],.9,b[2]],[a[0],.9,a[2]]],c,2);
 for(let k=0;k<10;k++){board([-3+k*11.1,0,-3.5],[-3+(k+1)*11.1,0,-3.5]);board([-3+k*11.1,0,71.5],[-3+(k+1)*11.1,0,71.5]);}
 for(let k=0;k<6;k++){board([-4,0,4+k*10],[-4,0,4+(k+1)*10]);board([109,0,4+k*10],[109,0,4+(k+1)*10]);}
 s.knockout(bd,.4);s.fill(K,bd,.7);s.tone(R,bd,.3);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir (Barcelona's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
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
 * negates z both ways — that keeps Piqué's RIGHT boot on his right. */
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
// skin: red + yellow screens (the Bernabéu floodlights warm everything)
const LIGHT:InkFill[]=[[R,.22],[Y,.42]],MID:InkFill[]=[[R,.34],[Y,.5],[K,.08]],DARK:InkFill[]=[[R,.45],[Y,.45],[K,.3]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Barcelona 2008–09 (inferred, see the header): blue shirts with red stripes, blue shorts, blue socks, yellow numbers */
const barca=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:[R,.9],trim:[R,.8],shorts:[B,.95],socks:B,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:Y,scale:FIG,...o});
/** Real Madrid at home (inferred): all white, navy trim */
const madrid=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:K,shorts:'paper',socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Piqué: tall (1.94 m) left-sided centre-back, number 3, short dark hair */
const PIQUE:AthleteStyle=barca(LIGHT,{number:3,seed:3,hair:K,build:{height:1.94,bulk:1.02,thighs:1.02}});
const PUYOL:AthleteStyle=barca(LIGHT,{number:5,seed:5,hair:[K,.85],hairStyle:'curly',build:{height:1.78,bulk:1.04}});
const XAVI:AthleteStyle=barca(LIGHT,{number:6,seed:6,hair:K,build:{height:1.70,bulk:.98}});
const PASSER:AthleteStyle=madrid(LIGHT,{seed:41,hair:[K,.8],build:{height:1.8}});
const STRIKER:AthleteStyle=madrid(MID,{seed:42,hair:K,build:{height:1.84}});
const VALDES:AthleteStyle={shirt:[K,.45],shorts:[K,.7],socks:[K,.45],boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:'paper',scale:FIG,seed:1};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = the Madrid pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
const T_PASS=0,T_INT=1.05;
/** the Madrid midfielder passes from here, along the grass, for the striker checking toward the ball outside Barcelona's area */
const PASS_BALL:[number,number]=[41.5,46.5],ST_TARGET:[number,number]=[26,42.5],LANE_D=nrm2(ST_TARGET[0]-PASS_BALL[0],ST_TARGET[1]-PASS_BALL[1]);
/** where Piqué meets it: 2.4 m before the striker's spot, on the lane */
const INT_XZ:[number,number]=add2(ST_TARGET,LANE_D,-2.4);
/** Piqué faces the ball coming; the lunge puts his right boot on the lane */
const M_H=nrm2(-LANE_D[0]+.1,-LANE_D[1]-.15);
const LUNGE_DUR=.8,LUNGE_REACH=.6,LS=T_INT-LUNGE_REACH*LUNGE_DUR,T_R0=LS+.66;
const M_AT:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH),PIQUE.build,placeOf(0,0,M_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[INT_XZ[0]-f[0],INT_XZ[1]-f[2]];})();
const INT_Y:number=(()=>{const sk=solve(lunge(LUNGE_REACH),PIQUE.build,placeOf(M_AT[0],M_AT[1],M_H),FIG);return Math.max(.12,toMy(midSole(sk.rToe,sk.rHeel))[1]+.11);})();
const INT:V3=[INT_XZ[0],INT_Y,INT_XZ[1]];
/** the Madrid pass: right foot, facing down the lane */
const PASS_DUR=.8,D_START=T_PASS-STRIKE_CONTACT*PASS_DUR,D_H=nrm2(LANE_D[0],LANE_D[1]+.12);
const D_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.45}),PASSER.build,placeOf(0,0,D_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[PASS_BALL[0]-f[0]-D_H[0]*.12,PASS_BALL[1]-f[2]-D_H[1]*.12];})();
/** the ball comes off his boot into his path (R1); a calm touch on, opening up toward Xavi (LB); then the pass along the grass (XR) */
const R1:[number,number]=add2(INT_XZ,M_H,1.4),XR:[number,number]=[41.5,33],P_D=nrm2(XR[0]-R1[0],XR[1]-R1[1]),LB:[number,number]=add2(R1,P_D,2.2);
const T_TOUCH=T_INT+1,T_P2=T_TOUCH+2.6,PASS2_DUR=.8,S_START=T_P2-STRIKE_CONTACT*PASS2_DUR,T_RCV=T_P2+1.25;
const S_H=nrm2(P_D[0],P_D[1]-.04);
const S_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.5}),PIQUE.build,placeOf(0,0,S_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[LB[0]-f[0]-S_H[0]*.12,LB[1]-f[2]-S_H[1]*.12];})();
/** Xavi: he waits facing the ball, the pass stops at his right boot */
const X_H=nrm2(-P_D[0],-P_D[1]);
const X_AT:[number,number]=add2(XR,X_H,-.55);
/** where the big boot would have gone (lesson only, crossed out): high and long into nobody's space */
const BOOT_TO:[number,number]=[46,52],BOOT_H=5;
type Track={id:string;style:AthleteStyle;keys:number[][]};
const PIQ_READ:[number,number]=[20.4,43.6],PQ_T:[number,number]=add2(R1,M_H,-.55),PQ_M:[number,number]=[lerp(PQ_T[0],S_AT[0],.55),lerp(PQ_T[1],S_AT[1],.55)];
const PIQ_KEYS=[[-7,17.2,45],[-4,18.2,44.6],[-1.8,19.4,44],[-.55,...PIQ_READ],[LS,...M_AT],[T_R0,...M_AT],[T_TOUCH,...PQ_T],[T_TOUCH+1.2,...PQ_M],[S_START,...S_AT]];
const ST_KEYS=[[-7,18.8,40.2],[-4,19.8,40.8],[-1.8,20.8,41.4],[-.6,22,41.9],[T_INT,25.3,42.3],[T_INT+.9,25.9,42.5],[T_TOUCH+.9,26.8,41.4],[T_P2,28.4,39.6],[T_P2+2,30,38.4]];
const PAS_KEYS=[[-7,51,50],[-4,47.5,48.6],[-1.6,43.6,47.3],[D_START,...D_AT],[T_INT+.7,...D_AT],[T_P2,38.6,45.8],[T_RCV+2,40,42]];
const XAVI_KEYS=[[-7,50,23.5],[-3,48.5,25.5],[T_TOUCH,44.5,30],[T_P2-.3,...X_AT],[T_RCV+.25,...X_AT],[T_RCV+.9,X_AT[0]+1.2,X_AT[1]+.1],[T_RCV+3.5,X_AT[0]+9,X_AT[1]+1.5]];
const TRACKS:Track[]=[
 {id:'pique',style:PIQUE,keys:PIQ_KEYS},
 {id:'striker',style:STRIKER,keys:ST_KEYS},
 {id:'passer',style:PASSER,keys:PAS_KEYS},
 {id:'xavi',style:XAVI,keys:XAVI_KEYS},
 {id:'puyol',style:PUYOL,keys:[[-7,15.5,29],[-2,18,30],[T_INT,20.5,31],[T_P2,24,31.5],[T_RCV+3,29,30]]},
 // everyone else (positions illustrative, no numbers printed)
 {id:'b-rb',style:barca(MID,{seed:20}),keys:[[-7,24,11],[0,27,11],[T_P2,33,10],[T_RCV+3,41,9]]},
 {id:'b-lb',style:barca(DARK,{seed:22,hairStyle:'bald'}),keys:[[-7,20,57],[0,23,57],[T_P2,29,58],[T_RCV+3,35,59]]},
 {id:'b-m1',style:barca(DARK,{seed:24}),keys:[[-7,36,40],[0,35,43],[T_P2,39,49],[T_RCV+3,45,50]]},
 {id:'b-m2',style:barca(LIGHT,{seed:8}),keys:[[-7,53,44],[0,51,45],[T_P2,53,47],[T_RCV+3,58,46]]},
 {id:'r-m2',style:madrid(LIGHT,{seed:44}),keys:[[-7,55,38],[0,51,38],[T_P2,48,37],[T_RCV+3,47,33]]},
 {id:'r-m3',style:madrid(MID,{seed:45}),keys:[[-7,40,22],[0,33,23],[T_P2,31,25],[T_RCV+3,36,25]]},
 {id:'r-m4',style:madrid(LIGHT,{seed:46}),keys:[[-7,60,20],[0,57,21],[T_P2,55,24],[T_RCV+3,52,27]]},
 {id:'r-m5',style:madrid(LIGHT,{seed:47,hair:[K,.6]}),keys:[[-7,30,57],[0,27,55],[T_P2,30,54],[T_RCV+3,35,53]]},
];
const VAL_KEYS=[[-7,3.5,36],[0,4.5,37],[T_P2,7,36],[T_RCV+3,9,35]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-7.2);for(let t=-7;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: the Madrid dribble, the pass along the grass for the striker, taken off the lane by Piqué's right boot into his
 * path, a calm touch on, then his pass along the grass to Xavi, who takes it and turns away. */
function ballAt(T:number):V3{
 const pb:V3=[PASS_BALL[0],.11,PASS_BALL[1]],r1:V3=[R1[0],.11,R1[1]],lb:V3=[LB[0],.11,LB[1]],xr:V3=[XR[0],.11,XR[1]];
 if(T<D_START){const p=trackAt(PAS_KEYS,T),v=velAt(PAS_KEYS,T),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*(.6+.4*Math.max(0,Math.sin(T*TAU/.7))),.11,p[1]+v[1]/s*(.6+.4*Math.max(0,Math.sin(T*TAU/.7)))];}
 if(T<T_PASS){const p=trackAt(PAS_KEYS,D_START),v=velAt(PAS_KEYS,D_START-.1),s=Math.hypot(v[0],v[1])||1,a:V3=[p[0]+v[0]/s*.6,.11,p[1]+v[1]/s*.6];return lerp3(a,pb,sm(D_START,T_PASS,T,easeInOutSine));}
 if(T<T_INT)return lerp3(pb,INT,clamp((T-T_PASS)/(T_INT-T_PASS)*(1.12-.12*(T-T_PASS)/(T_INT-T_PASS))));
 if(T<T_TOUCH)return lerp3(INT,r1,sm(T_INT,T_INT+.6,T,easeOut),.12);
 if(T<T_P2)return lerp3(r1,lb,sm(T_TOUCH,T_TOUCH+1,T,easeOut));
 if(T<T_RCV)return lerp3(lb,xr,1-(1-clamp((T-T_P2)/(T_RCV-T_P2)))**1.6);
 // Xavi's first touch takes it across his body, then he runs with it
 if(T<T_RCV+.9){const x=trackAt(XAVI_KEYS,T+.25),a:V3=[x[0]+.7,.11,x[1]+.15];return lerp3(xr,a,sm(T_RCV,T_RCV+.9,T,easeOut));}
 const p=trackAt(XAVI_KEYS,T+.25),v=velAt(XAVI_KEYS,T),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*.45,.11,p[1]+v[1]/s*.45];
}

// ---------------------------------------------------------------- the players at play time T
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
/** the look: after the touch his head comes up and turns — left (the far side, + in the athlete's yaw), then right to Xavi — before the pass */
const SCAN=[[T_TOUCH+.15,0],[T_TOUCH+.75,.85],[T_TOUCH+1.35,.85],[T_TOUCH+2,-.8],[S_START,-.45],[S_START+.3,0]];
const scanAt=(T:number)=>T<T_TOUCH+.15||T>S_START+.3?0:keyPath(T,SCAN,easeInOutSine)[0];
/** Piqué before the lunge: reading in a low stance (facing the passer), then — before the pass is struck — the early step across */
function piqueApproach(T:number):St{
 const v=velAt(PIQ_KEYS,T),sp=Math.hypot(v[0],v[1]),d=trackAt(PAS_KEYS,Math.min(T,D_START)),p=trackAt(PIQ_KEYS,T),toPasser=nrm2(d[0]-p[0],d[1]-p[1]);
 const h=sp>1.2?yawTo([v[0]/sp,v[1]/sp],M_H,sm(LS-.3,LS,T)):toPasser,st=runState(PIQ_KEYS,T,h);
 const ready=blendPose(backpedal(T*.9),stand(),.45);
 const pose=blendPose(st.pose,ready,(1-sm(-.7,-.35,T))*.85);
 return{pose:lookAtBall({pose,place:st.place},T,.8),place:st.place};
}
/** Piqué: reading, the step in, the right-foot interception, the calm touch, head up and the look, the pass to Xavi, watching it go */
function piqueState(T:number):St{
 if(T<LS)return piqueApproach(T);
 const place=placeOf(M_AT[0],M_AT[1],M_H);
 if(T<T_R0){const u=clamp((T-LS)/LUNGE_DUR);return{pose:blendPose(piqueApproach(LS).pose,lunge(u),sm(0,.18,u)),place};}
 if(T<S_START){// no panic: a short, unhurried carry, head up, looking
  const st=runState(PIQ_KEYS,T,yawTo(M_H,S_H,sm(T_TOUCH-.2,T_TOUCH+.9,T,easeInOutSine)));
  let pose=blendPose(st.pose,dribble(strideAt(PIQ_KEYS,T)*.9/3.4,{foot:'r',speed:.3}),.5);
  pose=blendPose(lunge(clamp((T-LS)/LUNGE_DUR)),pose,sm(T_R0,T_R0+.35,T));
  const up=sm(T_TOUCH+.05,T_TOUCH+.5,T),sc=scanAt(T);
  pose={...pose,neckP:pose.neckP-.62*up,lean:pose.lean-.14*up,neckY:pose.neckY+sc,twist:pose.twist+sc*.25};
  return{pose:clampPose(pose),place:st.place};}
 const u=clamp((T-S_START)/PASS2_DUR),sp=placeOf(S_AT[0],S_AT[1],S_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.5}),place:sp};
 const pose=keyPoses(clamp((T-S_START-PASS2_DUR)/.7),[[0,strike(1,{foot:'r',power:.5})],[1,stand()]]);
 return{pose:lookAtBall({pose,place:sp},T,.7),place:sp};
}
/** the Madrid passer: on the ball, head up, the pass (right foot), watching it, then jogging back in to press */
function passerState(T:number):St{
 if(T<D_START){const st=runState(PAS_KEYS,T);let pose=blendPose(st.pose,dribble(strideAt(PAS_KEYS,T)*.9/3.4,{foot:'r',speed:.5}),.5);
  const at=trackAt(PAS_KEYS,T),h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],D_H,sm(D_START-.6,D_START,T));
  pose=lookAtBall({pose,place:st.place},T,.4);return{pose,place:placeOf(at[0],at[1],h)};}
 const u=clamp((T-D_START)/PASS_DUR),place=placeOf(D_AT[0],D_AT[1],D_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.45}),place};
 if(T<T_INT+.7){const pose=keyPoses(clamp((T-D_START-PASS_DUR)/.6),[[0,strike(1,{foot:'r',power:.45})],[1,stand()]]);return{pose:lookAtBall({pose,place},T,.8),place};}
 const st=runState(PAS_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};
}
/** the Madrid striker: checking toward the ball, beaten to it, then pressing from behind */
function strikerState(T:number):St{const st=runState(ST_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};}
/** Xavi: dropping into space, facing the ball, the first touch across his body, away */
function xaviState(T:number):St{
 if(T<T_RCV+.25){const st=runState(XAVI_KEYS,T,T>T_P2-1?X_H:undefined);return{pose:lookAtBall(st,T,.8),place:st.place};}
 const st=runState(XAVI_KEYS,T),turn=yawTo(X_H,[1,.05],sm(T_RCV,T_RCV+.9,T,easeInOutSine));
 const pose=blendPose(st.pose,dribble(strideAt(XAVI_KEYS,T)*.9/3.4,{foot:'r',speed:.5}),sm(T_RCV+.4,T_RCV+1,T));
 return{pose:clampPose(pose),place:{...st.place,yaw:Math.atan2(turn[1],turn[0])}};
}
function valdesState(T:number):St{const[x,z]=trackAt(VAL_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='pique')return piqueState(T);if(id==='passer')return passerState(T);if(id==='striker')return strikerState(T);if(id==='xavi')return xaviState(T);if(id==='valdes')return valdesState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['pique','striker','passer','xavi'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'valdes'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='valdes'?VALDES:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=id==='pique'&&((T>-.55&&T<T_INT+.1)||Math.abs(T-T_P2)<.2);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_INT)<.3||Math.abs(T-T_P2)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);if(onScreen(g))s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera in the near stand: a push in on Piqué for "even scored", then wide — the Madrid pass, Piqué steps in. */
const MAIN_CAM:V3=[40,15,-24];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-6.8],[q[3],-2.6],[q[4],-.9],[q[4]+.9,0],[q[5],.55],[q[6],T_INT+.1],[S,T_INT+1.5]]);};
const cam1=(t:number)=>{const q=Q(0),T=t1(t),b=ballAt(T),pz=trackAt(PIQ_KEYS,Math.min(T,LS));
 const focus=sm(q[2]-.2,q[2]+1,t,easeInOutSine)*(1-sm(q[3]+.6,q[4]-.1,t,easeInOutSine));// "Gerard Piqué even scored": in on him
 const wide:[number,number]=[clamp(lerp(b[0],pz[0],.45),24,48),lerp(42,41,sm(T_INT,T_INT+1,T))];
 const tx=lerp(wide[0],pz[0],focus),tz=lerp(wide[1],pz[1],focus),F=lerp(lerp(lerp(5000,7400,sm(q[3],q[4]+.8,t,easeInOutSine)),8400,sm(-.5,T_INT,T,easeInOutSine)),12500,focus);
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[6]+.3;},
};
/** 2 · TV slow-motion replay from a low camera in front of him (upfield, near side): the ball won, the calm touch, head up, the look. */
const LOW_CAM:V3=[38.5,1.7,33.5];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,T_INT-.5],[q[1],T_INT+.25],[q[2],T_TOUCH-.15],[q[3],T_TOUCH+.45],[q[4],T_TOUCH+1.3],[S,T_TOUCH+2.2]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(PIQ_KEYS,T),F=lerp(2100,2600,sm(T_INT,T_TOUCH+1.5,T,easeInOutSine));
 return camAt(LOW_CAM,[m[0]+.4,1.05,m[1]-.8],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const T=t2(twos(t)),m=trackAt(PIQ_KEYS,T),p=P3([m[0],1.7,m[1]],cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(1)[3]+.9;},
};
/** 3 · the second replay, over his right shoulder from a raised camera behind him: Xavi free, the pass along the grass, Barcelona away. */
const UP_CAM:V3=[23.2,3.6,47.2];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_TOUCH+1.7],[q[1],S_START-.1],[q[2]+.2,T_P2+.35],[q[3],T_RCV+.6],[S,T_RCV+2.6]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(T),x=trackAt(XAVI_KEYS,T),follow=sm(T_P2-.2,T_RCV+.4,T,easeInOutSine),
 tx=lerp(lerp(LB[0],x[0],.45),lerp(b[0],x[0],.5),follow),tz=lerp(lerp(LB[1],x[1],.45),lerp(b[2],x[1],.5),follow),F=lerp(1500,2700,follow);
 return camAt(UP_CAM,[tx,.9,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.8});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(2)[2]+.8;},
};
/** 4 · the lesson plate: the moment again from a raised camera on the near side, with bold yellow teaching marks — a ring round Piqué (won
 * it), look arcs round his head (take a breath), the pass arrow and a ring on Xavi (a teammate), and the big boot upfield crossed out. */
const LESSON_CAM:V3=[29.5,13,18.5];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,T_TOUCH+.3],[q[1],T_TOUCH+.9],[q[1]+1.4,T_TOUCH+2.1],[q[2],S_START-.05],[q[2]+1.6,T_RCV+.1],[S,T_RCV+.4]]);};
const cam4=(t:number)=>camAt(LESSON_CAM,[37,2.8,38.8],1850);
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D,ink=Y){s.stroke(K,p,5,.9);s.knockout(p);s.fill(ink,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  // "That's Piqué": a yellow ring on the grass round him (printed under the figures)
  const pl=piqueState(T).place,px=pl.x!,pz=-pl.z!;
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[2]+1.6,q[2]+2,t));
  if(hal>.01)groundRing(s,px,pz,1.25*hal,c);
  // "pass it to a teammate": a ring on Xavi's spot
  const spot=sm(q[2],q[2]+.35,t,easeOutBack);
  if(spot>.01)groundRing(s,X_AT[0],X_AT[1],1.1*spot,c);
  drawPlay(s,T,c,{ballScale:1.6,only:['pique','xavi','striker','ball'],noStadium:true});
  // "take a breath": two look arcs round his head — left, then right — while the ball sits calm at his feet
  const br=sm(q[1],q[1]+.5,t,easeOutBack)*(1-sm(q[2]-.1,q[2]+.3,t));
  if(br>.01){const h=P3([px,2.55,pz],c),k=h[2],p=new Path2D(),arc=(a0:number,a1:number)=>{const pts:Pt[]=[];for(let i=0;i<=10;i++){const a=a0+(a1-a0)*i/10;pts.push([h[0]+Math.cos(a)*1.3*k*br,h[1]+Math.sin(a)*.75*k*br]);}return pts;};
   p.addPath(ribbon(arc(Math.PI+.35,Math.PI*1.5-.2),Math.max(9,.2*k),{seed:31,taper:.3}));p.addPath(ribbon(arc(Math.PI*1.5+.2,TAU-.35),Math.max(9,.2*k),{seed:32,taper:.3}));mark(s,p);}
  // "pass it to a teammate": the pass lane, from his boot to Xavi, along the grass
  const lane=sm(q[2]+.1,q[2]+1,t,easeInOutSine);
  if(lane>.01){const a=G(LB[0]+P_D[0]*1.1,LB[1]+P_D[1]*1.1,c),b=G(XR[0]-P_D[0]*1.2,XR[1]-P_D[1]*1.2,c),w=Math.max(10,.18*P3([XR[0],0,XR[1]],c)[2]);arrow(s,a,b,w,21,lane);}
  // "Don't just boot it": the big hopeful boot, high into nobody's space — drawn as a dashed arc, then crossed out in red
  const boot=sm(q[3],q[3]+.7,t,easeInOutSine);
  if(boot>.01){const p=new Path2D(),N=16;for(let i=0;i<N;i+=2){const u0=i/N*boot,u1=(i+1)/N*boot;const pt=(u:number):Pt=>{const x=lerp(LB[0],BOOT_TO[0],u),z=lerp(LB[1],BOOT_TO[1],u),y=4*BOOT_H*u*(1-u);return G(x,z,c,y);};
    p.addPath(ribbon([pt(u0),pt((u0+u1)/2),pt(u1)],12,{seed:40+i,taper:0}));}
   s.stroke(K,p,4,.8);s.knockout(p,.85);s.fill(Y,p,.8);}
  const cross=sm(q[3]+.8,q[3]+1.15,t,easeOutBack);
  if(cross>.002){const mid=G(lerp(LB[0],BOOT_TO[0],.5),lerp(LB[1],BOOT_TO[1],.5),c,BOOT_H),k=90*clamp(cross),p=new Path2D();
   p.addPath(ribbon([[mid[0]-k,mid[1]-k],[mid[0]+k,mid[1]+k]],Math.max(10,24*clamp(cross)),{seed:51,taper:.1}));p.addPath(ribbon([[mid[0]+k,mid[1]-k],[mid[0]-k,mid[1]+k]],Math.max(10,24*clamp(cross)),{seed:52,taper:.1}));mark(s,p,R);}
  // a tick burst when the pass reaches Xavi
  const stamp=sm(q[2]+1.5,q[2]+1.85,t,easeOutBack)*(1-sm(q[3]-.2,q[3]+.2,t));
  if(stamp>.002){const bp=P3([XR[0],.2,XR[1]],c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});}
  frame(s);
 },
 get still(){return Q(3)[3]+1.4;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'pique-signature',format:'11v11',title:'Piqué: calm on the ball',theme:'Win the ball, take a breath, pass it to a teammate',
 ageNote:'Real Madrid 2–6 Barcelona · La Liga, 2 May 2009 · Santiago Bernabéu, Madrid',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little floodlight spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Barcelona's goal line at X=0, Z across) — checked by tests/play-film-pique-signature.cjs. */
const feet=(st:St,build:AthleteStyle['build'])=>{const sk=solve(st.pose,build,st.place,FIG);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel)),pelvisY:sk.pelvis[1]};};
export const FACTS={INT,INT_XZ,PASS_BALL,ST_TARGET,R1,LB,XR,X_AT,T_PASS,T_INT,T_TOUCH,T_P2,T_RCV,S_START,ballAt,scanAt,
 piqueFeet:(T:number)=>feet(piqueState(T),PIQUE.build),
 passerFeet:(T:number)=>feet(passerState(T),PASSER.build),
 xaviFeet:(T:number)=>feet(xaviState(T),XAVI.build),
 piqueAt:(T:number)=>{const st=piqueState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 strikerAt:(T:number)=>{const st=strikerState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 xaviAt:(T:number)=>{const st=xaviState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
