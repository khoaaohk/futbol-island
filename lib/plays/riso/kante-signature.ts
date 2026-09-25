/** Iconic-play film · N'Golo Kanté, "Signature: the ball-winning sprint" — his sliding tackle from behind on Kevin De Bruyne, Manchester
 * City v Chelsea, UEFA Champions League final, 29 May 2021, Estádio do Dragão, Porto (52nd minute, Chelsea 1–0 up; Chelsea won 1–0).
 *
 * WHY THIS MOMENT: Kanté's entry in lib/town/iconicPlays.json is a signature trait (the ball-winning sprint; lesson "Press quickly after
 * losing the ball: the best time to win it back is straight away"), not one match. Wikipedia describes him as "known for his energy and
 * ball-winning abilities"; the 2021 final is the biggest stage on which he did it, and UEFA named him Player of the Match. Written sources
 * describe ONE of his ball-wins that night with a minute and a place, so this film recreates that real play (not an invented one): in the
 * 52nd minute De Bruyne ran with the ball down City's inside-left channel and, just as he shaped to shoot, Kanté came sliding in from
 * behind and hooked it away. A chase from behind that ends in the ball won is the "ball-winning sprint". The lesson chapter turns it into
 * the card's lesson (press straight away) without claiming anything else about the match.
 *
 * A faithful recreation of the broadcast rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, Chelsea's goal
 * line at X=0, Z across, Y up) seen through TV cameras — 1 live, the high main camera on the side (De Bruyne runs down the channel with
 * the ball and shapes to shoot, Kanté sprints back and slides in); 2 a TV slow-motion replay from a low camera on the near side of the
 * play (he never stops running; the slide from behind; the hook); 3 a second replay from the high camera behind Chelsea's goal (no shot
 * for De Bruyne; Kanté gets up); 4 the lesson (the only chapter with teaching marks: a ring round him, the ball to win, his chase printed
 * as a path, speed dashes, the gap closing, the slide stamped as a ghost, the ball won). No overlays inside the footage chapters.
 * Code structure, stadium, kits and camera language follow rudiger-signature.ts (the same final, first half).
 *
 * SOURCES (read 24 Sep 2026; the first two from the shared cache scratchpad/films/src-cache/, the third fetched with curl, generic UA):
 *  - The Guardian, "Manchester City 0-1 Chelsea: Champions League final – as it happened" (Scott Murray's minute-by-minute, 29 May 2021),
 *    https://www.theguardian.com/football/live/2021/may/29/manchester-city-v-chelsea-champions-league-final-live
 *    (guardian-mci-che-2021-live{,-p2,-p3}.txt). 52 min: "De Bruyne lengthens his stride and begins to look very dangerous as he sashays
 *    down the inside-left channel. But just as he shapes to shoot, Kante comes sliding in from behind and hooks away sensationally. As good
 *    a tackle as you'll see." Photo caption: "Kevin De Bruyne of Manchester City is tackled by N'Golo Kante of Chelsea. Photograph: Jose
 *    Coelho - Pool/Getty Images". 51 min: "City haven't created anything of note since the restart". Full time: "N'Golo Kante has been
 *    named Uefa Player of the Match ... he was everywhere"; "N'Golo Kante ran the show."
 *  - Wikipedia, "2021 UEFA Champions League final" (raw: match summary, line-ups with numbers and substitutions, kit boxes, man of the
 *    match): https://en.wikipedia.org/wiki/2021_UEFA_Champions_League_final (wiki-2021-ucl-final.txt)
 *  - Wikipedia, "N'Golo Kanté" (style of play: "known for his energy and ball-winning abilities"; under Tuchel in 2021 a "double six"
 *    holding role "predominantly on the right-hand side"): https://en.wikipedia.org/wiki/N%27Golo_Kant%C3%A9 (wiki-ngolo-kante.txt)
 * CONFIRMED by those sources: the match, date, venue and competition; Chelsea 1–0 up at the time (Havertz 42'), Chelsea won 1–0; the 52nd
 * minute; De Bruyne running with the ball down City's inside-left channel; he was shaping to shoot; Kanté slid in from behind and hooked
 * the ball away (so no shot); Kanté was UEFA Player of the Match. Line-ups at that minute: Chelsea Mendy 16; Azpilicueta 28, Christensen 4
 * (on for Thiago Silva, 39'), Rüdiger 2; James 24, Chilwell 21; Jorginho 5, Kanté 7; Mount 19, Havertz 29, Werner 11. City: De Bruyne 17
 * (captain), Foden 47, Sterling 7, Mahrez 26, Gündoğan 8, Bernardo Silva 20 (the rest of both teams not drawn). Kits (kit boxes, as in the
 * approved rudiger-signature film): Chelsea royal blue shirts, blue shorts, white socks; City sky blue shirts, white shorts, sky blue socks.
 * INFERRED (not in the sources): which end Chelsea defended in the second half (the approved rudiger-signature film has City attacking
 * right to left on the main camera in the first half, so here, after half-time, they attack left to right: the main camera is on the
 * other side of our pitch model); where De Bruyne picked the ball up and how far he ran; every position, path and timing; that Kanté came
 * from De Bruyne's right (the centre) and slid on his LEFT leg (the leg nearer the ball on this geometry) — the narration says only
 * "slides in from behind"; De Bruyne shaping to shoot with his right foot (his stronger foot; not stated); where the hooked ball rolled
 * (here loose toward the middle, nobody shown collecting it); how both players got up; all other players' positions (drawn low-detail,
 * illustrative); Mendy's goalkeeper kit colours; the Dragão's seat colours and the (Covid-limited, 14,110) crowd, which is not drawn;
 * camera placements and lenses; hair tones. The narration names only confirmed beats ("sprinting back" and "never stops running" are
 * implied by "sliding in from behind").
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice
 * (withTiming) re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,slideTackle,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Every cue starts with a plain ASCII word (Kokoro timing match; never "Kanté's").
 * Keep the counts [6,5,4,7]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'Ready to shoot',text:"Porto, 2021, the Champions League final. Kevin De Bruyne races down the left, ready to shoot. But N'Golo Kanté is sprinting back!",seconds:10.6,
  cues:[[0,'Porto'],[3.1,'Kevin De Bruyne'],[4.3,'races down the left'],[5.7,'ready to shoot'],[7.0,"But N'Golo Kanté"],[8.5,'sprinting back']]},
 {label:'The replay',text:'Watch again, slowly. Kanté never stops running. He slides in from behind and hooks the ball away. What a tackle!',seconds:9.2,
  cues:[[0,'Watch again'],[2.1,'never stops running'],[3.6,'slides in from behind'],[5.2,'hooks the ball away'],[7.0,'What a tackle']]},
 {label:'No shot',text:'From behind the goal: no shot for De Bruyne. Kanté was named player of the match, and Chelsea won the cup.',seconds:9.4,
  cues:[[0,'From behind the goal'],[1.9,'no shot'],[4.2,'named player of the match'],[6.6,'Chelsea won']]},
 {label:'The lesson',text:'That is the ball-winning sprint! When you lose the ball, press straight away: sprint, get close, win it back. The best time is right away.',seconds:11.6,
  cues:[[0,'That is the'],[2.1,'When you lose the ball'],[3.7,'press straight away'],[5.0,'sprint'],[5.8,'get close'],[6.7,'win it back'],[8.4,'best time is right away']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py kante-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/kante-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/kante-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** Cue onsets of chapter i (seconds). */
const Q=(i:number)=>CHAPTERS[i].cues.map(c=>c.at);
const SECS=(i:number)=>CHAPTERS[i].seconds;

const K='navy',Y='yellow',O='orange',B='blue';
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

// ---------------------------------------------------------------- the Estádio do Dragão (seat colours inferred): roofed stands, grass, stripes, markings, goals
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-12,75],b:[117,75],out:[0,1]},    // the side the main camera sits in (this half's broadcast side of our model)
 {a:[112,-10],b:[112,78],out:[1,0]},   // the far end (behind City's goal)
 {a:[-12,-7],b:[117,-7],out:[0,-1]},   // the opposite side
 {a:[-7,-10],b:[-7,78],out:[-1,0]},    // behind Chelsea's goal
];
const TIER_INK:[string,number][]=[[B,.45],[B,.3],[K,.2],[B,.55],[Y,.2],[B,.3],[K,.3],[O,.15]];
function stadium(s:Sheet,c:Cam){
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,40,1.2+40*.6),P(0,40,1.2+40*.6)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  // the roof's front edge: a dark band high over the upper tier
  addPoly(roof,[P(0,4,27.5),P(1,4,27.5),P(1,40,31),P(0,40,31)],c);
  const segs=14;for(let k=0;k<22;k++){const d0=1+k*1.7,d1=d0+1.3,y0=1.2+d0*.6,y1=1.2+d1*.6;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 s.fill(Y,concrete,.15);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.7);
 s.fill(B,wall,.5);s.stroke(K,wall,Math.max(2,.05*P3([10,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
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
/** A goal at line gx whose net runs out by dir (Chelsea's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
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
/** athlete.ts is right-handed (y up); this film's pitch (X, Z across, Y up) is left-handed, so the projector negates z both ways — that
 * keeps Kanté's LEFT leg on his left and De Bruyne's right boot on his right. */
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
const LIGHT:InkFill[]=[[O,.2]],MID:InkFill[]=[[O,.75],[Y,.2]],DARK:InkFill[]=[[O,.88],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Chelsea 2020–21 home: royal blue shirts and shorts, white socks */
const chelsea=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:B,socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Manchester City 2020–21 home: sky blue shirts, white shorts, sky blue socks */
const city=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.4],trim:'paper',shorts:'paper',socks:[B,.4],boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.24],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Kanté: Chelsea 7, small and quick, a close buzz cut (lib/town/playerAppearance.json: skin 6, buzz) */
const KANTE:AthleteStyle=chelsea(DARK,{number:7,seed:7,hair:[K,.8],build:{height:1.68,bulk:.95,thighs:1.02}});
const KDB:AthleteStyle=city(LIGHT,{number:17,seed:17,hair:[O,.8],build:{height:1.81,bulk:1}});
/** Mendy: Chelsea's goalkeeper, 16 (goalkeeper kit colours inferred, as in rudiger-signature) */
const MENDY:AthleteStyle={shirt:[Y,.85],trim:K,shorts:[Y,.85],socks:[Y,.85],boots:K,skin:DARK,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:16,numberInk:K,scale:FIG,seed:16,build:{height:1.94,bulk:1.04}};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:7,build:KANTE.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Kanté's boot hooks the ball)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const mid3=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
const T0=-7.4;
/** where De Bruyne sets the ball to shoot: the inside-left channel (City's left = low Z), just outside Chelsea's area */
const BALL_K:[number,number]=[21.6,19.4];
/** De Bruyne sets himself to shoot: heading down the channel, opened a little toward goal; the right-foot strike would meet the ball at
 * T_KICK, a split second after the hook, so the swing finds nothing */
const KH=nrm2(-1,.2),KSTRIKE=(t:number,p=1)=>strike(t,{foot:'r',power:p}),KSTRIKE_DUR=.85,T_KICK=.12,S0=T_KICK-STRIKE_CONTACT*KSTRIKE_DUR;
const KDB_AT:[number,number]=(()=>{const sk=solve(KSTRIKE(STRIKE_CONTACT),KDB.build,placeOf(0,0,KH),FIG),f=toMy(mid3(sk.rToe,sk.rHeel));return[BALL_K[0]-f[0]-KH[0]*.12,BALL_K[1]-f[2]-KH[1]*.12];})();
const KDB_PLACE=placeOf(KDB_AT[0],KDB_AT[1],KH);
/** Kanté's slide: from behind and to De Bruyne's right (the middle), on his LEFT leg, the boot hooking round the ball */
const SLIDE_DUR=.9,SLIDE_CONTACT=.42,T_SLIDE=-SLIDE_CONTACT*SLIDE_DUR,T_SLID=T_SLIDE+SLIDE_DUR;
const SLIDE_H=nrm2(-.66,-.75);
/** the library slide on the left leg; a hook: the lead leg long, the boot turned in and wrapped round the ball, and less glide after it */
function SLIDE(u:number):Pose{const p=slideTackle(clamp(u),{foot:'l'}),w=sm(.24,.4,u)*(1-sm(.6,.85,u));
 const q=w>0?clampPose({...p,lHipF:p.lHipF-.1*w,lAnk:p.lAnk-.12*w,lHipR:p.lHipR+.35*w,lKnee:Math.max(0,p.lKnee-.05*w)}):p;
 return u>SLIDE_CONTACT?{...q,dx:Math.min(q.dx,1.1+.55*sm(SLIDE_CONTACT,1,u))}:q;}
const bootAt=(place:Place):V3=>{const sk=solve(SLIDE(SLIDE_CONTACT),KANTE.build,place,FIG);return toMy(mid3(sk.lToe,sk.lHeel));};
const BOOT0=bootAt(placeOf(0,0,SLIDE_H));
/** the boot meets the ball on De Bruyne's side of it (so the hook pulls it back toward the middle) */
const HOOK_OFF:[number,number]=[-.08,-.12];
const SLIDE_AT:[number,number]=[BALL_K[0]+HOOK_OFF[0]-BOOT0[0],BALL_K[1]+HOOK_OFF[1]-BOOT0[2]];
const SLIDE_PLACE=placeOf(SLIDE_AT[0],SLIDE_AT[1],SLIDE_H);
/** the hooked ball rolls loose toward the middle (where it went is inferred) */
const LOOSE:[number,number]=add2(BALL_K,nrm2(.35,1),6.4),T_LOOSE=1.9;
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** a run that ENDS at `end` at time t1: walked backward along heading(T) at speed(T) m/s, sampled every .1 s (smooth speeds, no teleports) */
function runBack(end:[number,number],t1:number,t0:number,speed:(T:number)=>number,heading:(T:number)=>[number,number]):number[][]{
 const k:number[][]=[[t1,end[0],end[1]]];let p:[number,number]=[end[0],end[1]];
 for(let T=t1;T>t0+1e-6;){const dt=Math.min(.1,T-t0),h=heading(T-dt/2);p=add2(p,h,-speed(T-dt/2)*dt);T-=dt;k.unshift([T,p[0],p[1]]);}return k;}
/** De Bruyne: he lengthens his stride down the channel with the ball, slows, plants and shapes to shoot */
const KDB_KEYS=[...runBack(KDB_AT,S0,T0,T=>5.2+1.3*sm(-6.5,-3.5,T)-5.3*sm(-1.5,S0,T),T=>yawTo(nrm2(-1,.02),KH,sm(-2.4,S0,T))),[4,KDB_AT[0],KDB_AT[1]]];
/** Kanté: flat out from behind, bending in toward the ball from the middle (≈ 40 m in 7 s, top speed ≈ 8 m/s) */
const KANTE_KEYS=runBack(SLIDE_AT,T_SLIDE,T0,T=>4.4+3.7*sm(-6.6,-3,T),T=>yawTo(nrm2(-.97,-.2),SLIDE_H,sm(-3.2,T_SLIDE,T)));
const GETUP:[number,number]=add2(SLIDE_AT,SLIDE_H,1.65);
/** the last touch before the set-up, and where the ball is then */
const T_TOUCH=S0-.5;
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
const lead=(T:number):V3=>{const p=trackAt(KDB_KEYS,T),v=velAt(KDB_KEYS,T),s=Math.hypot(v[0],v[1])||1,l=.6+.25*Math.max(0,Math.sin((T-T0)*TAU/.62));return[p[0]+v[0]/s*l,.11,p[1]+v[1]/s*l];};
const TOUCH_PT:V3=lead(T_TOUCH);
/** Mendy: set on his line, edging to the near post */
const MENDY_KEYS=[[T0,4.2,33.4],[-2,3,31.6],[0,2.4,31],[4,2.4,31]];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'kante',style:KANTE,keys:KANTE_KEYS},
 {id:'kdb',style:KDB,keys:KDB_KEYS},
 // the rest of both teams, as the sources place them only loosely (Chelsea's back three backing off; positions illustrative)
 {id:'azpi',style:chelsea(LIGHT,{number:28,seed:28}),keys:[[T0,31,21],[-4,24,21],[-1,17.5,21.6],[0,16.4,22],[4,15.6,22.5]]},
 {id:'christensen',style:chelsea(LIGHT,{number:4,seed:4,hair:[O,.5]}),keys:[[T0,30,32],[-4,23,31.5],[-1,17,30.5],[0,16,30.4],[4,15,30]]},
 {id:'rudi',style:chelsea(DARK,{number:2,seed:2,build:{height:1.9,bulk:1.06}}),keys:[[T0,29,43],[-4,23,42],[-1,17.5,40],[0,16.6,39.5],[4,15.5,38]]},
 {id:'james',style:chelsea(DARK,{number:24,seed:24}),keys:[[T0,40,6],[-4,30,7],[-1,21,8],[0,19,8.3],[4,17,9]]},
 {id:'sterling',style:city(DARK,{number:7,seed:7}),keys:[[T0,42,4.5],[-4,31,5.2],[-1,20.5,6.4],[0,18.2,6.8],[4,17,7.4]]},
 {id:'foden',style:city(LIGHT,{number:47,seed:47,hair:[O,.45],build:{height:1.71,bulk:.93}}),keys:[[T0,50,37],[-4,36,36],[-1,24,35],[0,21,34.5],[4,18.5,34]]},
 {id:'jorginho',style:chelsea(LIGHT,{number:5,seed:5}),keys:[[T0,57,33],[-4,44,31.5],[-1,33,30],[0,30.5,29.5],[2,28.5,28.6],[4,28,28.4]]},
 {id:'gundogan',style:city(LIGHT,{number:8,seed:8}),keys:[[T0,66,28],[-4,54,27],[-1,42,26],[0,39,26],[4,35,26]]},
 {id:'bernardo',style:city(MID,{number:20,seed:20}),keys:[[T0,62,47],[-4,50,46],[-1,37,45],[0,34,44.5],[4,31,43]]},
 {id:'mahrez',style:city(MID,{number:26,seed:26}),keys:[[T0,42,58],[-4,31,56],[-1,22,53],[0,20,52.5],[4,18.5,51]]},
 {id:'chilwell',style:chelsea(LIGHT,{number:21,seed:21}),keys:[[T0,40,55],[-4,30,54],[-1,21.5,51],[0,19.5,50.5],[4,18,50]]},
 {id:'mount',style:chelsea(LIGHT,{number:19,seed:19}),keys:[[T0,68,38],[-4,57,37],[-1,46,36],[0,43,35.5],[4,39,34]]},
];
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,T0-.2);for(let t=T0;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: at De Bruyne's feet down the channel, his last touch out in front, set for the shot, hooked away, loose. */
function ballAt(T:number):V3{
 if(T<T_TOUCH)return lead(T);
 if(T<0)return lerp3(TOUCH_PT,[BALL_K[0],.11,BALL_K[1]],sm(T_TOUCH,0,T,u=>u*(2-u)));
 if(T<T_LOOSE)return lerp3([BALL_K[0],.11,BALL_K[1]],[LOOSE[0],.11,LOOSE[1]],sm(0,T_LOOSE,T,u=>u*(2-u)),.45*(1-sm(0,.5,T)));
 return[LOOSE[0],.11,LOOSE[1]];
}

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.2*w;return clampPose(p);}
/** Kanté: the flat-out sprint from behind (eyes on the ball), the slide and the hooking left leg, down, up again and after the ball */
function kanteState(T:number):St{
 if(T<T_SLIDE+.1){const turn=sm(T_SLIDE-.8,T_SLIDE,T,easeInOutSine),v=velAt(KANTE_KEYS,T),sp=Math.hypot(v[0],v[1]),h=yawTo(sp>.5?[v[0]/sp,v[1]/sp]:SLIDE_H,SLIDE_H,turn),st=runState(KANTE_KEYS,T,h);
  let pose=lookAtBall(st,T,.8-.5*sm(T_SLIDE-.3,T_SLIDE+.1,T));
  // flat out: a little more lean and arm drive than the library sprint
  pose=clampPose({...pose,lean:pose.lean+.08,pitch:pose.pitch+.04});
  if(T<T_SLIDE)return{pose,place:st.place};
  return{pose:blendPose(pose,SLIDE((T-T_SLIDE)/SLIDE_DUR),sm(T_SLIDE,T_SLIDE+.1,T)),place:SLIDE_PLACE};}
 if(T<T_SLID)return{pose:SLIDE((T-T_SLIDE)/SLIDE_DUR),place:SLIDE_PLACE};
 const down={...SLIDE(1),dx:0},face=yawTo(SLIDE_H,nrm2(LOOSE[0]-GETUP[0],LOOSE[1]-GETUP[1]),sm(T_SLID+.5,T_SLID+1.3,T));
 const kneel=posed({lHipF:70,lKnee:120,lAnk:30,rHipF:20,rKnee:100,rAnk:40,lean:30,pitch:4,lShA:30,rShA:40,lShF:30,rShF:-10,lElb:40,rElb:30,neckP:10});
 const u=clamp((T-(T_SLID+.3))/.9);
 return{pose:u<=0?down:keyPoses(u,[[0,down],[.45,kneel],[1,stand()]]),place:placeOf(GETUP[0],GETUP[1],face)};
}
/** De Bruyne: the run with the ball (right-foot touches), the plant, the backswing of a right-foot shot that never comes, the empty swing */
function kdbState(T:number):St{
 if(T<S0){const st=runState(KDB_KEYS,T);let pose=st.pose;
  pose=blendPose(pose,dribble(strideAt(KDB_KEYS,T)*.9/3.4,{foot:'r',speed:.8}),.55*(1-sm(T_TOUCH,S0,T)));
  return{pose:lookAtBall({pose,place:st.place},T,.5),place:st.place};}
 const u=(T-S0)/KSTRIKE_DUR,pre=runState(KDB_KEYS,S0-.02).pose;
 // the swing slows once the ball has gone (he checks it), then he stands and turns to watch it roll away
 const P=u<STRIKE_CONTACT?blendPose(pre,KSTRIKE(u),sm(0,.14,u)):u<.85?KSTRIKE(STRIKE_CONTACT+(u-STRIKE_CONTACT)*.55,.55):blendPose(KSTRIKE(STRIKE_CONTACT+.33*.55,.55),stand(),sm(.85,1.8,u));
 const face=yawTo(KH,nrm2(LOOSE[0]-KDB_AT[0],LOOSE[1]-KDB_AT[1]),sm(1.1,2.3,T,easeInOutSine));
 const st={pose:P,place:placeOf(KDB_AT[0],KDB_AT[1],face)};
 return{pose:T>.9?lookAtBall(st,T,.7*sm(.9,1.5,T)):P,place:st.place};
}
function mendyState(T:number):St{const[x,z]=trackAt(MENDY_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='kante')return kanteState(T);if(id==='kdb')return kdbState(T);if(id==='mendy')return mendyState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['kante','kdb'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean;hero?:string[]}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'mendy'].filter(id=>!o.only||o.only.includes(id)),heroes=o.hero??HEROES;
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='mendy'?MENDY:TR(id).style,hero=heroes.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='kante'&&T>T_SLIDE&&T<T_SLID-.25)||(id==='kdb'&&T>S0+.2&&T<T_KICK+.2);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T)<.4?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-Math.min(T,T_LOOSE)*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the side, panning with the ball — De Bruyne down the channel, the set-up, Kanté arriving, the slide. */
const MAIN_CAM:V3=[36,25,111];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,T0+.2],[q[4]+.3,T_SLIDE],[q[5]+.3,.25],[S,1.7]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(T0,T-.3)),k=trackAt(KANTE_KEYS,Math.min(T,T_SLIDE)),tx=lerp((b[0]*2+k[0])/3,BALL_K[0]+1.5,sm(-1.2,.6,T,easeInOutSine)),tz=lerp(24,22,sm(-3,0,T)),F=lerp(7600,10800,sm(-3.5,.2,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[5]+.5;},
};
/** 2 · TV slow-motion replay from a low camera on the middle side of the play: Kanté closing from behind, the slide, the hook. */
const LOW_CAM:V3=[29.5,1.7,37];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-2.7],[q[1],-1.8],[q[2]+.2,T_SLIDE-.05],[q[3]+.4,0],[S,.8]]);};
const cam2=(t:number)=>{const T=t2(t),k=trackAt(KANTE_KEYS,Math.min(T,T_SLIDE)),b=ballAt(T),u=sm(-1.2,.1,T,easeInOutSine),tx=lerp((k[0]+b[0])/2,BALL_K[0]+.6,u),tz=lerp((k[1]+b[2])/2,BALL_K[1]+.6,u),F=lerp(2500,4200,sm(-2,0,T,easeInOutSine));
 return camAt(LOW_CAM,[tx,.75,tz],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[3]+.5;},
};
/** 3 · the second replay, from the high camera behind Chelsea's goal: the set-up, the hook, no shot; Kanté gets up and goes after it. */
const BEHIND:V3=[-12,7,24];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,-1.3],[q[1]+.3,.05],[q[2]+.4,1.5],[S,3.2]]);};
const cam3=(t:number)=>{const T=t3(t),u=sm(0,2.2,T,easeInOutSine),tx=lerp(BALL_K[0]+1,(BALL_K[0]+LOOSE[0])/2+1,u),tz=lerp(BALL_K[1]+.8,(BALL_K[1]+LOOSE[1])/2,u),F=lerp(8200,6600,u);
 return camAt(BEHIND,[tx,lerp(.8,.9,u),tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.6;},
};
/** 4 · the lesson plate: the action again from a raised camera on the middle side, with bold yellow teaching marks — a ring round Kanté
 * (the ball-winning sprint), a ring on the ball the other team has (when you lose the ball), his chase printed as a path (press straight
 * away), speed dashes behind him (sprint), an arrow closing the gap to the ball (get close), the slide stamped as a ghost and a burst at
 * the ball (win it back), and a ring round the loose ball, won back in a moment (the best time is right away). */
const LESSON_CAM:V3=[16,10,50];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-2.8],[q[2],-2.8],[q[3]+.3,-2],[q[4]+.6,-.9],[q[5]+.5,0],[q[6]+.4,1],[S-.6,1.9]]);};
const cam4=(t:number)=>{const T=t4(t),k=kanteState(Math.min(T,T_SLIDE)).place,u=sm(-1.4,.1,T,easeInOutSine),w=sm(.1,1.8,T,easeInOutSine);
 const tx=lerp(lerp(lerp(k.x!,BALL_K[0],.3),BALL_K[0]+.5,u),(BALL_K[0]+LOOSE[0])/2,w),tz=lerp(lerp(lerp(-k.z!,BALL_K[1],.3),BALL_K[1]+.8,u),(BALL_K[1]+LOOSE[1])/2,w);
 return camAt(LESSON_CAM,[tx,.4,tz],lerp(lerp(1800,3600,u),3300,w));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ground ring (pitch metres) as one path */
function ring(c:Cam,x:number,z:number,r:number):Path2D{const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const p=new Path2D();p.addPath(polyPath(out,true));p.addPath(polyPath(inn.reverse(),true));return p;}
const LESSON_ONLY=['kante','kdb','azpi','christensen','ball'];
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  // "That is the ball-winning sprint": a yellow ring on the grass round Kanté (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]-.2,q[1]+.2,t));
  if(hal>.01){const k=kanteState(T).place;mark(s,ring(c,k.x!,-k.z!,1.3*hal));}
  // "When you lose the ball": a ring on the ball at De Bruyne's feet — the ball to win back
  const lose=sm(q[1],q[1]+.4,t,easeOutBack)*(1-sm(q[2]+.2,q[2]+.6,t));
  if(lose>.01){const b=ballAt(T);mark(s,ring(c,b[0],b[2],1.05*lose));}
  // "press straight away": his chase printed as a path, drawn out ahead of him to where he will slide
  const path=sm(q[2],q[2]+.4,t)*(1-sm(q[6]-.3,q[6]+.2,t));
  if(path>0){const pts:Pt[]=[];const reach=Math.max(Math.min(T,T_SLIDE),lerp(-3.4,T_SLIDE,sm(q[2],q[3]+.4,t,easeInOutSine)));for(let u=-3.4;u<=reach+.001;u+=.2){const m=trackAt(KANTE_KEYS,u);pts.push(G(m[0],m[1],c));}
   if(pts.length>1){const w=Math.max(12,.22*P3([SLIDE_AT[0],0,SLIDE_AT[1]],c)[2]),p=ribbon(pts,w,{seed:31,taper:.3,wobble:1});s.stroke(K,p,5,.9*path);s.knockout(p,path);s.fill(Y,p,.95*path);}}
  drawPlay(s,T,c,{ballScale:1.5,only:LESSON_ONLY,noStadium:true});
  // "sprint": three speed dashes trailing behind him while he runs
  const dash=win(t,q[3]-.1,q[5]+.2,.25);
  if(dash>0&&T<T_SLIDE+.1){const r=trackAt(KANTE_KEYS,Math.min(T,T_SLIDE)),v=nrm2(...velAt(KANTE_KEYS,Math.min(T,T_SLIDE-.05))),n:[number,number]=[-v[1],v[0]],p=new Path2D();
   for(let i=-1;i<=1;i++){const o=add2(r,n,i*.55),a=G(...add2(o,v,-1.1-Math.abs(i)*.3),c,1),b=G(...add2(o,v,-2.9+Math.abs(i)*.3),c,1);p.addPath(ribbon([a,b],Math.max(8,.12*P3([r[0],1,r[1]],c)[2])*dash,{seed:50+i,taper:.5}));}
   mark(s,p);}
  // "get close": an arrow from Kanté to the ball, shrinking as he closes the gap
  const gap=sm(q[4],q[4]+.35,t,easeOutBack)*(1-sm(q[5]-.1,q[5]+.25,t));
  if(gap>.01&&T<0){const k=trackAt(KANTE_KEYS,Math.min(T,T_SLIDE)),b=ballAt(T),d=nrm2(b[0]-k[0],b[2]-k[1]),a=G(...add2(k,d,.7),c,.12),e=G(b[0]-d[0]*.45,b[2]-d[1]*.45,c,.12),bp=P3([b[0],.12,b[2]],c);
   if(Math.hypot(b[0]-k[0],b[2]-k[1])>1.4)arrow(s,a,e,Math.max(9,.14*bp[2]),71,clamp(gap));}
  // "win it back": the slide stamped as a yellow ghost at the hook, and a burst at the ball
  const stamp=sm(q[5]+.4,q[5]+.7,t,easeOutBack)*(1-sm(q[6]+.6,q[6]+1,t));
  if(stamp>.002)drawPlayer(s,SLIDE(SLIDE_CONTACT),c,GHOST,SLIDE_PLACE);
  const blk=sm(q[5]+.4,q[5]+.75,t,easeOutBack)*(1-sm(q[6]-.2,q[6]+.2,t));
  if(blk>.01){const bp=P3([BALL_K[0],.13,BALL_K[1]],c);sparkBurst(s,Y,bp[0],bp[1],1.1*bp[2],{n:10,seed:61,g:clamp(blk),width:.08*bp[2]});}
  // "The best time is right away": a ring round the loose ball, won back in a moment
  const won=sm(q[6]+.2,q[6]+.6,t,easeOutBack);
  if(won>.01){const bp=P3(ballAt(T),c),r=Math.max(16,.34*bp[2])*won,p=new Path2D();p.arc(bp[0],bp[1],r,0,TAU);p.arc(bp[0],bp[1],r*.74,0,TAU,true);mark(s,p);}
  frame(s);
 },
 get still(){return Q(3)[5]+1.1;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'kante-signature',format:'11v11',title:'The ball-winning sprint',theme:'Press straight away: the best time to win it back is right away',
 ageNote:'Man City v Chelsea · Champions League final, 29 May 2021 · Porto',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
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
/** Solved contact points (pitch metres; Chelsea's goal line at X=0, Z across) — checked by tests/play-film-kante-signature.cjs. */
export const FACTS={BALL_K,LOOSE,SLIDE_AT,KDB_AT,T_SLIDE,T_KICK,S0,ballAt,
 /** mid-sole of each of Kanté's boots at the hook frame (my metres) */
 kanteFoot:(side:'l'|'r')=>{const sk=solve(SLIDE(SLIDE_CONTACT),KANTE.build,SLIDE_PLACE,FIG);return toMy(side==='l'?mid3(sk.lToe,sk.lHeel):mid3(sk.rToe,sk.rHeel));},
 /** mid-sole of each of De Bruyne's boots at time T (my metres) */
 kdbFoot:(side:'l'|'r',T:number)=>{const st=kdbState(T),sk=solve(st.pose,KDB.build,st.place,FIG);return toMy(side==='l'?mid3(sk.lToe,sk.lHeel):mid3(sk.rToe,sk.rHeel));},
 /** pelvis of a hero at time T (my metres) */
 pelvis:(id:'kante'|'kdb',T:number)=>{const st=id==='kante'?kanteState(T):kdbState(T),sk=solve(st.pose,(id==='kante'?KANTE:KDB).build,st.place,FIG);return toMy(sk.pelvis);},
 kanteAt:(T:number)=>{const st=kanteState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 kdbAt:(T:number)=>{const st=kdbState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 speed:(id:string,T:number)=>Math.hypot(...velAt(TR(id).keys,T))};
