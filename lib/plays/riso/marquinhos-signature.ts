/** Iconic-play film · Marquinhos, "Signature: read the pass, steal the ball" — shown HOW he did it, in one real, sourced match: Paris
 * Saint-Germain 5–0 Inter Milan, UEFA Champions League final, Saturday 31 May 2025, 21:00 CEST, Allianz Arena ("Munich Football Arena").
 *
 * WHY THIS MATCH: Marquinhos's entry in lib/town/iconicPlays.json is a signature (a trait: reading the pass and stealing the ball; lesson
 * "Watch the passer's eyes and step in front of the striker to steal it"), not one goal. The written accounts available do not describe one
 * single Marquinhos interception in the final beat by beat, so the film follows the brief's honest fallback: it is set in the biggest, best-
 * documented Marquinhos match (he captained PSG to their first-ever Champions League title, 5–0, a clean sheet; Inter's first shot on target
 * only came in the 76th minute) and the narration says so plainly ("Here's how he defends"). The interception itself is an ILLUSTRATION of
 * his sourced style ("noted for his anticipation, pace, and intelligence … which enables him to break down attacks and subsequently play the
 * ball out or start offensive plays from the back"; in his own words "a quick player, with a good positional sense, who wins back a lot of
 * balls"), not a claim about one frame of the match. Same structure and same approach as the approved baresi-signature film (the closest
 * film: the same interception_counter signature); the Munich arena at night follows drogba-header-2012 (same ground).
 *
 * A riso print of one 3D choreography in pitch metres (X along the pitch, PSG's goal line at X=0, Z across, away from the main-stand camera,
 * Y up) seen through TV cameras — 1 live, the high main camera on the side (Inter in possession, the captain reading, the pass for the
 * striker, Marquinhos there first); 2 a TV slow-motion replay from a low camera goal-side (he watches the passer's eyes, moves early, steps
 * in front of the striker); 3 a second replay from upfield, facing him (ball stolen, head up, the pass that starts the attack); 4 the lesson
 * (the only chapter with teaching marks: the passer's eye line, the pass lane, his step in front, the steal). No overlays in the footage.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Marquinhos" (captain of PSG and Brazil; centre-back; height 1.83 m; "captained PSG to their first-ever Champions League title
 *    with a commanding 5–0 win over Inter Milan in the final"; Style of play: anticipation, pace, intelligence, breaking down attacks and
 *    starting offensive plays from the back; "good positional sense, who wins back a lot of balls")  https://en.wikipedia.org/wiki/Marquinhos
 *    [wiki-marquinhos.txt]
 *  - Wikipedia, "2025 UEFA Champions League final" (31 May 2025, 21:00 CEST, Allianz Arena, Munich, 64,327; partly cloudy night, 24 °C;
 *    goals Hakimi 12', Doué 20' 63', Kvaratskhelia 73', Mayulu 86'; "Thuram got Inter's first shot on target of the match" three minutes
 *    after the 73rd; referee István Kovács; kit boxes: PSG all dark navy (0A1254) with the 2024–25 home pattern; Inter the 2024–25 THIRD
 *    pattern on yellow (FFCC00))  https://en.wikipedia.org/wiki/2025_UEFA_Champions_League_final  [wiki-2025-ucl-final.txt]
 *  - Wikimedia Commons, Kit_body_internazionale2425T.png (the pattern file that kit box uses: yellow with black and white detail)
 *    [kit-body-internazionale2425T.png]
 *  - UEFA, "Tactical Line-ups – Final – Saturday 31 May 2025 – Munich Football Arena" (PDF): Marquinhos 5 (captain) at RIGHT centre-back
 *    beside Pacho 51, Hakimi 2 right-back, Nuno Mendes 25 left-back, Donnarumma 1; Inter's front two Thuram 9 and Lautaro Martínez 10;
 *    weather "Partly Cloudy Night / 24°C"  https://www.uefa.com/newsfiles/UCL/2025/2044466_LU.pdf  [uefa-2044466-LU.pdf]
 * CONFIRMED: the match, date, venue, night kick-off; 5–0, PSG's first Champions League title, Inter's first shot on target only in the 76th
 *  minute; Marquinhos captain, number 5, right centre-back beside Pacho (51), Hakimi (2) outside him; his reading/anticipating, ball-winning
 *  style and his starting attacks from the back; kits per Wikipedia's kit boxes: PSG dark navy shirts, shorts and socks; Inter in their
 *  2024–25 third kit (yellow, black detail).
 * INFERRED (illustration, not in the accounts): the specific pass that is stolen and who played it (an unnamed Inter midfielder, drawn
 *  without a number), the striker he steps in front of (unnamed, no number printed), every position, path and timing, the passing feet
 *  (right, drawn, never narrated), Marquinhos's stealing foot (right, drawn, never narrated), the short pass that restarts the attack and the
 *  team-mate who takes it (unnamed), which end PSG defended on screen (their goal is screen-left from the main camera), camera placements,
 *  the PSG home shirt's red-and-white central band (NOT drawn: the shared figure library has no single-band pattern, so the shirt is navy
 *  with red trim), the Inter kit detail (drawn as black trim and numbers), the keepers' kits (drawn neutral grey), hair and skin tones, the
 *  crowd's colours and the arena as drawn (steep three-tier bowl, grey seats, the roof ring and its floodlights, stylised). The narration
 *  frames the play as "how he defends" and names only confirmed facts as facts (no foot, no side, no names but Marquinhos's).
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. Heat: small wide-shot figures and all but the
 * three heroes print at 'low'; the crowd is four batched plates; ≈ 150–320 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,hash,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,backpedal,lunge,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration and cue words. Cue `at` and chapter `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice
 * exists. Scenes read cues by index (Q(i)[k]) — keep the counts [7,5,4,4]. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final',text:'Munich, 2025: the Champions League final. Paris captain Marquinhos faces Inter. Here’s how he defends. Inter look for their striker… but Marquinhos steps in first!',tail:2.4,
  cues:['Munich','Paris captain','faces Inter','how he defends','Inter look for their striker','but Marquinhos','steps in first']},
 {label:'The replay',text:'Watch again, slowly. Marquinhos watches the passer’s eyes. He sees where the pass is going, so he moves early… and steps in front of the striker!',tail:1.8,
  cues:['Watch again','Marquinhos watches','He sees where','so he moves early','steps in front']},
 {label:'Ball stolen',text:'Ball stolen! Marquinhos lifts his head and starts the attack with a pass. Paris won five–nil, their first Champions League!',tail:1.8,
  cues:['Ball stolen','Marquinhos lifts his head','with a pass','Paris won']},
 {label:'The lesson',text:'That’s Marquinhos. Watch the passer’s eyes, and step in front of the striker to steal it!',tail:2.6,
  cues:['That’s Marquinhos','Watch the passer’s eyes','step in front','steal it']},
];
/** provisional word onsets: .2 s + .021 s a letter per word, pauses after , . ! ? … */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/…$/.test(w))t+=.45;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('marquinhos: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py marquinhos-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/marquinhos-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/marquinhos-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
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
/** half the visible extents (sheet units) with margin for the passage preview */
const VIEW={hx:1500/(2*.68)+120,hy:1030/(2*.68)+120};

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
/** a 3D bar a → b as a projected quad of width w metres (at least minW units), clipped to the near plane */
function bar3(p:Path2D,a:V3,b:V3,w:number,c:Cam,minW=1.2){let qa=toCam(a,c),qb=toCam(b,c);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(u:V3,v:V3):V3=>{const k=(NEAR-u[2])/(v[2]-u[2]);return[u[0]+(v[0]-u[0])*k,u[1]+(v[1]-u[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A:Pt=[c.F*qa[0]/qa[2],-c.F*qa[1]/qa[2]],Bp:Pt=[c.F*qb[0]/qb[2],-c.F*qb[1]/qb[2]],wa=Math.max(minW,c.F*w/qa[2]/2),wb=Math.max(minW,c.F*w/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 p.moveTo(A[0]+nx*wa,A[1]+ny*wa);p.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);p.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);p.lineTo(A[0]-nx*wa,A[1]-ny*wa);p.closePath();}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];

// ---------------------------------------------------------------- the Munich arena at night: a steep closed bowl, three tiers, the roof ring
/** stand planes (a along, b up the rake 0..1): 0 the far side (+Z), 1 behind Inter's goal (+X), 2 the main stand (−Z, the camera side),
 * 3 behind PSG's goal (−X). Closed corners join them. Steep and tall (three stacked tiers), close to the pitch. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-10,115,a),1.2+30*b,74+26*b],
 (a,b)=>[113+24*b,1.2+29*b,lerp(76,-8,a)],
 (a,b)=>[lerp(115,-10,a),1.2+30*b,-6-26*b],
 (a,b)=>[-8-24*b,1.2+29*b,lerp(-8,76,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] */
const CORNERS:[number,number,number,number][]=[[0,1,1,0],[1,1,2,0],[2,1,3,0],[3,1,0,0]];
const STAND_COLS=[92,64,92,64],STAND_ROWS=13,TIER=[.34,.67];
/** crowd colours (inferred): PSG red / navy-blue and white round the ground, Inter's end in blue and yellow */
const interAt=(si:number,a:number)=>si===1?.6:si===0&&a>.7?.35:.06;
function stadium(s:Sheet,c:Cam,which:number[]){
 // a partly cloudy May night: a navy sky, a floodlit haze low down
 s.field(K,.55,.5);
 const hz=P3([c.pos[0]+Math.sin(c.yaw)*1e4,c.pos[1],c.pos[2]+Math.cos(c.yaw)*1e4],c);
 if(hz[2]>0)[.12,.2,.28].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,[S(0,0),S(1,0),S(1,1),S(0,1)],c);for(const b of TIER)bar3(tier,S(0,b),S(1,b),1.1,c);
  // the one continuous roof ring: a pale membrane overhang over the top rows, a paper fascia along its lip
  addPoly(roof,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,11,0]),add3(S(0,.74),[0,11,0])],c);
  bar3(edge,add3(S(0,.74),[0,10.8,0]),add3(S(1,.74),[0,10.8,0]),.5,c);}
 for(const[i,ai,j,aj]of CORNERS){if(!which.includes(i)||!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)],c);
  addPoly(roof,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.74),[0,11,0]),add3(A(ai,.74),[0,11,0])],c);}
 // grey seats under the crowd, paper tier fascias
 s.knockout(planes);s.tone(K,planes,.42);s.tone(B,planes,.2);s.knockout(tier,.8);
 // the crowd: seeded dots, sized by distance (paper, red, blue, yellow)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(S(a,b),c);if(q[2]<NEAR)continue;
   const p:Pt=[c.F*q[0]/q[2],-c.F*q[1]/q[2]];if(Math.abs(p[0])>VIEW.hx||Math.abs(p[1])>VIEW.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18);
   const hb=hash(i*7+j*53+si*3,21),ink=hb<interAt(si,a)?(h<.6?2:3):h<.55?1:h<.85?0:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.35);s.knockout(edge,.8);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.022,.74),[0,10,0]),b=add3(S(u+.022,.74),[0,10,0]);if(toCam(a,c)[2]<NEAR+2)continue;bar3(lamp,a,b,1,c);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 ground(s,c);
}
/** the grass (mown stripes), the advertising boards, the painted lines and the corner flags */
function ground(s:Sheet,c:Cam){
 const grass=new Path2D();addPoly(grass,[[-8,0,-6],[113,0,-6],[113,0,74],[-8,0,74]],c);s.knockout(grass);s.fill(Y,grass,.9);s.tone(B,grass,.78);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,stripes,.13);
 // boards: blue with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])],c);
 board([-4.5,0,-3.5],[-4.5,0,71.5]);board([109.5,0,-3.5],[109.5,0,71.5]);board([-4.5,0,71.5],[109.5,0,71.5]);board([-4.5,0,-3.5],[109.5,0,-3.5]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;for(const z of[-3.45,71.45])addPoly(pn,[[x,.25,z],[x+3.3,.25,z],[x+3.3,.68,z],[x,.68,z]],c);}
 for(let k=0;k<11;k++){const z=-1+k*6.6;for(const x of[-4.45,109.45])addPoly(pn,[[x,.25,z],[x,.25,z+3.4],[x,.68,z+3.4],[x,.68,z]],c);}
 s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.35);s.knockout(pn,.85);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir (PSG's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  for(let x=0;x<=2.01;x+=sp)for(const z of[z0,z1])seg([gx+dir*x,0,z],[gx+dir*x,lerp(h,bh,x/2),z]);
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Marquinhos's RIGHT boot on his right. */
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
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const LIGHT:InkFill[]=[[Y,.32],[R,.2]],TAN:InkFill[]=[[Y,.42],[R,.3]],MID:InkFill[]=[[Y,.45],[R,.36],[K,.1]],DARK:InkFill[]=[[R,.45],[Y,.5],[K,.24]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** PSG (Wikipedia kit box): dark navy shirts, shorts and socks; red trim; paper numbers. The central band is not drawn (see INFERRED). */
const psg=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],trim:R,shorts:[K,.95],socks:[K,.95],boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[B,.35],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Inter (Wikipedia kit box: the 2024–25 third kit): yellow shirts, shorts and socks; black detail drawn as navy trim and numbers. */
const inter=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:K,shorts:Y,socks:Y,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Marquinhos: centre-back and captain, number 5, 1.83 m, short dark hair */
const MARQ:AthleteStyle=psg(TAN,{number:5,seed:5,hair:K,build:{height:1.83,bulk:1}});
const PASSER:AthleteStyle=inter(LIGHT,{seed:20,hair:[K,.8],build:{height:1.78,bulk:1}});
const STRIKER:AthleteStyle=inter(MID,{seed:10,build:{height:1.74,bulk:1.02}});
const MATE:AthleteStyle=psg(LIGHT,{seed:17,hair:[K,.85],build:{height:1.72,bulk:.95}});
const KEEPER:AthleteStyle={shirt:[K,.4],shorts:[K,.6],socks:[K,.4],boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:'paper',scale:FIG,seed:1,build:{height:1.96,bulk:1.05}};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = the Inter pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
const T_PASS=0,T_INT=1.05;
/** the Inter midfielder passes from here, along the grass, for the striker checking toward the ball outside PSG's area */
const PASS_BALL:[number,number]=[40.5,34.2],ST_TARGET:[number,number]=[25.2,26.6],LANE_D=nrm2(ST_TARGET[0]-PASS_BALL[0],ST_TARGET[1]-PASS_BALL[1]);
/** where Marquinhos steals it: 2.4 m before the striker's spot, on the lane (he has stepped in front of him) */
const INT_XZ:[number,number]=add2(ST_TARGET,LANE_D,-2.4);
/** he faces the ball coming; the lunge puts his right boot on the lane */
const M_H=nrm2(-LANE_D[0]+.1,-LANE_D[1]-.15);
const LUNGE_DUR=.8,LUNGE_REACH=.6,LS=T_INT-LUNGE_REACH*LUNGE_DUR;
const M_AT:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH),MARQ.build,placeOf(0,0,M_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[INT_XZ[0]-f[0],INT_XZ[1]-f[2]];})();
const INT_Y:number=(()=>{const sk=solve(lunge(LUNGE_REACH),MARQ.build,placeOf(M_AT[0],M_AT[1],M_H),FIG);return Math.max(.12,toMy(midSole(sk.rToe,sk.rHeel))[1]+.11);})();
const INT:V3=[INT_XZ[0],INT_Y,INT_XZ[1]];
/** the Inter pass: right foot, facing down the lane */
const PASS_DUR=.8,D_START=T_PASS-STRIKE_CONTACT*PASS_DUR,D_H=nrm2(LANE_D[0],LANE_D[1]+.12);
const D_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.45}),PASSER.build,placeOf(0,0,D_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[PASS_BALL[0]-f[0]-D_H[0]*.12,PASS_BALL[1]-f[2]-D_H[1]*.12];})();
/** the ball comes off his boot into his path (R1); one touch on (LB); then a firm, low pass (right foot) upfield to a team-mate */
const R1:[number,number]=add2(INT_XZ,M_H,1.5),TARGET:[number,number]=[51,19.5],L_D=nrm2(TARGET[0]-R1[0],TARGET[1]-R1[1]),LB:[number,number]=add2(R1,L_D,3);
const T_TOUCH=T_INT+1.15,LONG_DUR=1,T_LONG=T_INT+2.45,S_START=T_LONG-STRIKE_CONTACT*LONG_DUR,T_LAND=T_LONG+1.6,T_R0=LS+.66;
const S_H=nrm2(L_D[0],L_D[1]-.05);
const S_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.8}),MARQ.build,placeOf(0,0,S_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[LB[0]-f[0]-S_H[0]*.12,LB[1]-f[2]-S_H[1]*.12];})();
type Track={id:string;style:AthleteStyle;keys:number[][]};
/** where he reads from: goal-side of the striker, a step inside him */
const M_READ:[number,number]=[19.6,29.2];
const M_KEYS=[[-7,17,30.4],[-4,17.8,30],[-1.8,19,29.5],[-.55,...M_READ],[LS,...M_AT],[T_R0,...M_AT],[T_TOUCH,...add2(R1,M_H,-.5)],[S_START,...S_AT]];
const ST_KEYS=[[-7,18.5,23.6],[-4,19.6,24.2],[-1.8,20.6,24.8],[-.6,21.6,25.3],[T_INT,25.3,26.4],[T_INT+.9,25.9,26.6],[T_INT+4,25.2,26.2]];
const PA_KEYS=[[-7,50,39.5],[-4,46.5,37.6],[-1.6,42.4,35.3],[D_START,...D_AT]];
const MATE_KEYS=[[-7,40,24],[-2,42,23],[T_INT,44,22.2],[T_LONG,47.5,21],[T_LAND,50.4,19.8],[T_LAND+2,55,19.4]];
const TRACKS:Track[]=[
 {id:'marquinhos',style:MARQ,keys:M_KEYS},
 {id:'striker',style:STRIKER,keys:ST_KEYS},
 {id:'passer',style:PASSER,keys:PA_KEYS},
 {id:'mate',style:MATE,keys:MATE_KEYS},
 // everyone else (positions illustrative, no numbers printed)
 {id:'pacho',style:psg(DARK,{seed:51,build:{height:1.88,bulk:1.04}}),keys:[[-7,15.5,37.5],[-2,17.5,38],[T_INT,19,38.4],[T_LONG,23,38.6],[T_LAND+2,27,38.8]]},
 {id:'striker2',style:inter(DARK,{seed:9,build:{height:1.92,bulk:1.05}}),keys:[[-7,21,41],[-2,22.5,40.5],[T_INT,24,40],[T_LONG,25,39.5],[T_LAND+2,27,38.5]]},
 {id:'p-rb',style:psg(MID,{seed:2}),keys:[[-7,17,10],[0,18.5,10.5],[T_LONG,23,11],[T_LAND+2,29,11.5]]},
 {id:'p-lb',style:psg(MID,{seed:25}),keys:[[-7,17,52],[0,19,51],[T_LONG,23,49],[T_LAND+2,29,47]]},
 {id:'p-m1',style:psg(LIGHT,{seed:87}),keys:[[-7,31,26],[0,30.5,27],[T_LONG,33,26],[T_LAND+2,39,25]]},
 {id:'p-m2',style:psg(TAN,{seed:8}),keys:[[-7,32,43],[0,33,42],[T_LONG,34,41.5],[T_LAND+2,36,43]]},
 {id:'i-5',style:inter(LIGHT,{seed:35}),keys:[[-7,46,28],[0,43,27],[T_LONG,42,26],[T_LAND+2,46,24]]},
 {id:'i-9',style:inter(LIGHT,{seed:29}),keys:[[-7,36,50],[0,33,48],[T_LONG,33,46],[T_LAND+2,37,44]]},
 {id:'i-17',style:inter(MID,{seed:37}),keys:[[-7,36,12],[0,33,13],[T_LONG,34,14],[T_LAND+2,39,15]]},
 {id:'i-13',style:inter(LIGHT,{seed:43}),keys:[[-7,60,26],[0,58,25],[T_LONG,57,23],[T_LAND,55,21.6],[T_LAND+2,57,21]]},
 {id:'i-15',style:inter(TAN,{seed:45}),keys:[[-7,61,36],[0,59,35],[T_LONG,60,31],[T_LAND,59,27],[T_LAND+2,60,25]]},
];
const GK_KEYS=[[-7,4,34],[0,5,33],[T_LONG,7,32],[T_LAND+2,9,32]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-7.2);for(let t=-7;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: the Inter midfielder's dribble, his pass along the grass for the striker, taken off the lane by Marquinhos's right
 * boot into his path, one touch on, then the firm low pass (right foot) upfield to a team-mate, running on. */
function ballAt(T:number):V3{
 const pb:V3=[PASS_BALL[0],.11,PASS_BALL[1]],iv=INT,r1:V3=[R1[0],.11,R1[1]],lb:V3=[LB[0],.11,LB[1]],tg:V3=[TARGET[0],.11,TARGET[1]];
 if(T<D_START){const p=trackAt(PA_KEYS,T),v=velAt(PA_KEYS,T),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*(.6+.4*Math.max(0,Math.sin(T*TAU/.7))),.11,p[1]+v[1]/s*(.6+.4*Math.max(0,Math.sin(T*TAU/.7)))];}
 if(T<T_PASS){const p=trackAt(PA_KEYS,D_START),v=velAt(PA_KEYS,D_START-.1),s=Math.hypot(v[0],v[1])||1,a:V3=[p[0]+v[0]/s*.6,.11,p[1]+v[1]/s*.6];return lerp3(a,pb,sm(D_START,T_PASS,T,easeInOutSine));}
 if(T<T_INT)return lerp3(pb,iv,clamp((T-T_PASS)/(T_INT-T_PASS)*(1.12-.12*(T-T_PASS)/(T_INT-T_PASS))));
 if(T<T_TOUCH)return lerp3(iv,r1,sm(T_INT,T_INT+.6,T,easeOut),.15);
 if(T<T_LONG)return lerp3(r1,lb,sm(T_TOUCH,T_LONG-.3,T,easeOut));
 if(T<T_LAND){const u=clamp((T-T_LONG)/(T_LAND-T_LONG));return lerp3(lb,tg,u*(1.15-.15*u),1.2);}
 const u=sm(T_LAND,T_LAND+1.4,T,easeOut);return lerp3(tg,[tg[0]+4.5,.11,tg[2]-.4],u);
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
/** head (and a little shoulder) turned toward a point. Right-handed yaw: + turns left. */
function lookAt(st:St,b:[number,number],w=1):Pose{const x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[1]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T);return lookAt(st,[b[0],b[2]],w);}
/** Marquinhos before the lunge: reading in a low stance, eyes on the PASSER (his head and eyes, not just the ball), then — before the pass is
 * struck — the early step across, in front of the striker */
function marqApproach(T:number):St{
 const v=velAt(M_KEYS,T),sp=Math.hypot(v[0],v[1]),d=trackAt(PA_KEYS,Math.min(T,D_START)),p=trackAt(M_KEYS,T),toPasser=nrm2(d[0]-p[0],d[1]-p[1]);
 const h=sp>1.2?yawTo([v[0]/sp,v[1]/sp],M_H,sm(LS-.3,LS,T)):toPasser,st=runState(M_KEYS,T,h);
 // reading: knees bent, on his toes, small shuffles
 const ready=blendPose(backpedal(T*.9),stand(),.45);
 const pose=blendPose(st.pose,ready,(1-sm(-.7,-.35,T))*.85);
 // eyes: on the passer until the pass is struck, then on the ball
 const b=ballAt(T),eye:[number,number]=T<T_PASS?[d[0],d[1]]:[b[0],b[2]];
 return{pose:lookAt({pose,place:st.place},eye,.8),place:st.place};
}
/** Marquinhos: reading, the early step, the right-foot steal, up and away with the ball, one touch, the pass, watching it go */
function marqState(T:number):St{
 if(T<LS)return marqApproach(T);
 const place=placeOf(M_AT[0],M_AT[1],M_H);
 if(T<T_R0){const u=clamp((T-LS)/LUNGE_DUR);return{pose:blendPose(marqApproach(LS).pose,lunge(u),sm(0,.18,u)),place};}
 if(T<S_START){// off the lunge and after the ball: a quick carry, head coming up to look upfield
  const st=runState(M_KEYS,T,yawTo(M_H,L_D,sm(T_R0,T_TOUCH,T,easeInOutSine)));
  let pose=blendPose(st.pose,dribble(strideAt(M_KEYS,T)*.9/3.4,{foot:'r',speed:.6}),.55);
  pose=blendPose(lunge(clamp((T-LS)/LUNGE_DUR)),pose,sm(T_R0,T_R0+.3,T));
  const up=sm(T_TOUCH-.1,T_TOUCH+.5,T);pose={...pose,neckP:pose.neckP-.5*up,lean:pose.lean-.12*up};
  const h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],S_H,sm(S_START-.5,S_START,T));
  const at=trackAt(M_KEYS,T);return{pose:clampPose(pose),place:placeOf(at[0],at[1],h)};}
 const u=clamp((T-S_START)/LONG_DUR),sp=placeOf(S_AT[0],S_AT[1],S_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.8}),place:sp};
 const pose=keyPoses(clamp((T-S_START-LONG_DUR)/.7),[[0,strike(1,{foot:'r',power:.8})],[1,stand()]]);
 return{pose:lookAtBall({pose,place:sp},T,.7),place:sp};
}
/** the Inter passer: on the ball, head up toward his striker (his eyes give the pass away), the pass (right foot), then watching it */
function passerState(T:number):St{
 if(T<D_START){const st=runState(PA_KEYS,T);let pose=blendPose(st.pose,dribble(strideAt(PA_KEYS,T)*.9/3.4,{foot:'r',speed:.5}),.5);
  const at=trackAt(PA_KEYS,T),h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],D_H,sm(D_START-.6,D_START,T));
  pose=lookAt({pose,place:st.place},trackAt(ST_KEYS,T),.7);pose={...pose,neckP:pose.neckP-.3};return{pose:clampPose(pose),place:placeOf(at[0],at[1],h)};}
 const u=clamp((T-D_START)/PASS_DUR),place=placeOf(D_AT[0],D_AT[1],D_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.45}),place};
 const pose=keyPoses(clamp((T-D_START-PASS_DUR)/.6),[[0,strike(1,{foot:'r',power:.45})],[1,stand()]]);
 return{pose:lookAtBall({pose,place},T,.8),place};
}
/** the striker: checking toward the ball, beaten to it, pulling up */
function strikerState(T:number):St{const st=runState(ST_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};}
function keeperState(T:number):St{const[x,z]=trackAt(GK_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='marquinhos')return marqState(T);if(id==='passer')return passerState(T);if(id==='striker')return strikerState(T);if(id==='keeper')return keeperState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['marquinhos','striker','passer'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the arena, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;stands?:number[]}={}){
 if(o.stands)stadium(s,c,o.stands);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'keeper'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='keeper'?KEEPER:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=id==='marquinhos'&&((T>-.55&&T<T_INT+.1)||Math.abs(T-T_LONG)<.25);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_INT)<.3||Math.abs(T-T_LONG)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);if(onScreen(g))s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the main-stand side: Inter on the ball, a push in on the captain, then wide for the pass — he is first. */
const MAIN_CAM:V3=[40,27,-40];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-6.6],[q[3],-2.4],[q[4],-.95],[q[5],-.1],[q[6],T_INT],[S,T_LONG+1.3]]);};
const cam1=(t:number)=>{const q=Q(0),T=t1(t),b=ballAt(Math.min(T,T_LONG+.2)),mz=trackAt(M_KEYS,Math.min(T,LS));
 const focus=sm(q[1]-.2,q[1]+1.2,t,easeInOutSine)*(1-sm(q[3]-.4,q[3]+.8,t,easeInOutSine));// "Paris captain": in on Marquinhos
 const wide:[number,number]=[clamp(lerp(b[0],mz[0],.45),22,52),lerp(30,27,sm(T_INT,T_LONG+1,T))];
 const tx=lerp(wide[0],mz[0],focus),tz=lerp(wide[1],mz[1],focus),F=lerp(lerp(6400,7800,sm(-2,T_INT,T,easeInOutSine)),11500,focus)*lerp(1,.85,sm(T_LONG-.3,T_LONG+1,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true,stands:[0,1,3]});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[6]+.3;},
};
/** 2 · TV slow-motion replay from a low camera goal-side and wide of the pair: he watches the passer, moves early, steps in front. */
const LOW_CAM:V3=[11,1.7,34];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-2.6],[q[1],-2.1],[q[2],-1.2],[q[3],-.55],[q[4],LS+.15],[q[4]+1.2,T_INT],[S,T_INT+.4]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(M_KEYS,Math.min(T,LS)),r=trackAt(ST_KEYS,T),mid:[number,number]=[(m[0]+r[0])/2+1.6,(m[1]+r[1])/2+.6],
 tgt=[lerp(mid[0],INT_XZ[0]+.8,sm(-.6,T_INT,T)),lerp(mid[1],INT_XZ[1]+.4,sm(-.6,T_INT,T))],F=lerp(1900,2500,sm(-2,T_INT,T,easeInOutSine));
 return camAt(LOW_CAM,[tgt[0],1,tgt[1]],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6,stands:[0,1,2]});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.9;},
};
/** 3 · the second replay, from a raised camera upfield on the far side, facing him: the ball stolen, his head up, the pass away. */
const UP_CAM:V3=[39,3.4,38];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_INT-.25],[q[1],T_INT+.9],[q[2],S_START+.1],[q[2]+1,T_LONG+.2],[q[3],T_LONG+1.1],[S,T_LAND+.8]]);};
const cam3=(t:number)=>{const T=t3(t),m=trackAt(M_KEYS,Math.min(T,S_START)),follow=sm(T_LONG,T_LAND,T,easeInOutSine),
 tx=lerp(m[0]+1.2,m[0]+6,follow),ty=lerp(1,1.4,follow),tz=lerp(m[1],m[1]-3.5,follow),F=lerp(2300,1800,sm(T_LONG-.2,T_LONG+1.2,T,easeInOutSine));
 return camAt(UP_CAM,[tx,ty,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6,stands:[2,3]});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.8;},
};
/** 4 · the lesson plate: the moment again from a raised camera on the near side, with bold yellow teaching marks — a ring round Marquinhos,
 * the passer's eye line and the pass lane ("watch the passer's eyes"), a ring on the striker's spot and his step in front ("step in front"),
 * a burst + tick on the steal ("steal it"). */
const LESSON_CAM:V3=[22,6,12];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-1.3],[q[2]-.3,-.7],[q[3]+.2,T_INT],[S,T_INT+.35]]);};
const cam4=(_t:number)=>camAt(LESSON_CAM,[27.2,.6,29.3],1450);
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
/** the passer's eye line: a dotted yellow beam from his eyes toward where he looks (the striker), drawn to `u` */
function eyeLine(s:Sheet,a:V3,b:V3,c:Cam,u:number){if(u<=.01)return;const p=new Path2D(),n=11;for(let i=0;i<n;i++){const v=(i+.8)/n;if(v>u)break;const q=P3(lerp3(a,b,v),c);if(q[2]<=0)continue;const r=Math.max(9,.2*q[2]);p.addPath(shape(blob(q[0],q[1],r,r,2,{n:10})));}
 if(u>.05){const e=P3(a,c);p.addPath(shape(blob(e[0],e[1],Math.max(14,.32*e[2]),Math.max(9,.2*e[2]),3,{n:12})));}mark(s,p);}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c,[0,1,3]);
  // "That's Marquinhos": a yellow ring on the grass round him (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.2,q[1]+.6,t));
  if(hal>.01){const m=marqState(T).place;groundRing(s,m.x!,-m.z!,1.2*hal,c);}
  // "step in front": a ring on the striker's spot, where the pass is meant to go
  const spot=sm(q[2],q[2]+.35,t,easeOutBack);
  if(spot>.01)groundRing(s,ST_TARGET[0],ST_TARGET[1],1*spot,c);
  drawPlay(s,T,c,{ballScale:1.5,only:['marquinhos','passer','striker','ball']});
  // "Watch the passer's eyes": the eye line from the passer's head to the striker, then the pass lane on the grass
  const look=sm(q[1],q[1]+.8,t,easeInOutSine)*(1-sm(q[3]-.2,q[3]+.2,t));
  if(look>.01){const pa=passerState(Math.min(T,D_START)).place,st=trackAt(ST_KEYS,T);eyeLine(s,[pa.x!,1.95,-pa.z!],[st[0],1.7,st[1]],c,look);}
  const lane=sm(q[1]+.5,q[1]+1.3,t,easeInOutSine);
  if(lane>.01){const a=G(PASS_BALL[0]+LANE_D[0]*1.2,PASS_BALL[1]+LANE_D[1]*1.2,c),b=G(ST_TARGET[0]-LANE_D[0]*1.3,ST_TARGET[1]-LANE_D[1]*1.3,c),w=Math.max(10,.16*P3([INT_XZ[0],0,INT_XZ[1]],c)[2]);arrow(s,a,b,w,21,lane);}
  // "step in front": his step from the reading spot to the lane, in front of the striker
  const run=sm(q[2],q[2]+.8,t,easeInOutSine);
  if(run>.01){const a=G(M_READ[0]+.6,M_READ[1]-.3,c),b=G(INT_XZ[0]-.9,INT_XZ[1]+.35,c),w=Math.max(10,.16*P3([INT_XZ[0],0,INT_XZ[1]],c)[2]);arrow(s,a,b,w,22,run);}
  // "steal it": a burst and a tick at the steal
  const stamp=sm(q[3]+.2,q[3]+.55,t,easeOutBack);
  if(stamp>.002){const bp=P3(INT,c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   const k=.9*bp[2]*clamp(stamp),x=bp[0]+.4*bp[2],y=bp[1]-2.4*bp[2];mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(stamp),{seed:71,taper:.15}));}
  frame(s);
 },
 get still(){return Q(3)[3]+.9;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'marquinhos-signature',format:'11v11',title:'Marquinhos: read it, steal it',theme:'Watch the passer’s eyes and step in front of the striker to steal it',
 ageNote:'PSG v Inter · Champions League final, 31 May 2025 · Munich, Germany',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
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
/** Solved contact points (pitch metres; PSG's goal line at X=0, Z across) — checked by tests/play-film-marquinhos-signature.cjs. */
const feet=(st:St,build:AthleteStyle['build'])=>{const sk=solve(st.pose,build,st.place,FIG);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel)),pelvisY:sk.pelvis[1]};};
export const FACTS={INT,INT_XZ,PASS_BALL,ST_TARGET,LB,TARGET,T_PASS,T_INT,T_LONG,T_LAND,ballAt,
 marqFeet:(T:number)=>feet(marqState(T),MARQ.build),
 passerFeet:(T:number)=>feet(passerState(T),PASSER.build),
 marqAt:(T:number)=>{const st=marqState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 strikerAt:(T:number)=>{const st=strikerState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 marqLook:(T:number)=>marqState(T).pose.neckY};
