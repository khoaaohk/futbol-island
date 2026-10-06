/** Iconic-play film · Franz Beckenbauer, "the libero bringing it out" — his goal in West Germany 3–2 England (after extra time), World Cup
 * quarter-final, Sunday 14 June 1970, 12:00, Estadio Nou Camp (Estadio de Guanajuato), León, Mexico. (The file id keeps the stub's
 * `beckenbauer-sling-1970`; the film shows the England quarter-final, not the Italy semi-final in which he later played on with his arm strapped.)
 *
 * WHY THIS MOMENT for the signature (iconicPlays.json: kind "signature", "the libero bringing it out"; lesson "After winning the ball, lift
 * your head and carry it into midfield"): it is the best-documented time Beckenbauer did exactly that on the world stage — an England move
 * broke down, he picked up the loose ball and carried it forward himself, past a defender, and scored the goal that started the comeback. The
 * sources describe it precisely (the minute, the rebound off Francis Lee, rounding Mullery, the right foot, from outside the area, low,
 * under Bonetti, into the far corner). Honesty note: in 1970 he played in midfield next to Overath (Wikipedia; EFO lists him "LM"); the
 * libero role came a little later, so the narration never calls him the libero here — it says he carried the ball forward.
 * The Game of the Century semi (the strapped arm) was considered and not chosen: the sources describe the injury, not a single move.
 *
 * A faithful recreation of the broadcast rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, England's goal
 * line at X=105, Z across, away from the main-stand camera, Y up) seen through TV cameras — 1 live, the high main camera on the side, in
 * real time (the ball bounces loose, Beckenbauer takes it, runs with it head up, rounds a defender, the low shot, goal); 2 a TV slow-motion
 * replay from a low touchline camera ahead of him (he takes the loose ball, lifts his head, open grass, carries it on); 3 a second replay
 * from high behind England's goal (the low right-foot cross-shot under Bonetti's dive, into the far corner); 4 the lesson (the only chapter
 * with teaching marks: win the ball, lift your head, the space ahead, the carry into midfield). No overlays inside the footage chapters.
 * The Moore film (moore-tackle-1970.ts, the same tournament, England's other famous 1970 match) sets the stadium and camera language.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - England Football Online, "England Match No. 448 — West Germany — 14 June 1970" (goal log, colours, line-ups; match reports incl. Norman
 *    Giller): https://www.englandfootballonline.com/Seas1960-70/1969-70/M0448WGr1970.html   (efo-448.html)
 *  - englandstats.com, match 448 "West Germany 3-2 England" (goal times, quoting The Guardian 15 June 1970, "England's system in doubt"):
 *    https://www.englandstats.com/matches.php?mid=448   (englandstats-448.html)
 *  - Wikipedia, "1970 FIFA World Cup knockout stage" (football box, kit templates, line-ups): https://en.wikipedia.org/wiki/1970_FIFA_World_Cup_knockout_stage
 *  - Wikipedia, "Franz Beckenbauer" (1970 World Cup; midfielder with Overath in 1966 and 1970; the Italy semi-final shoulder):
 *    https://en.wikipedia.org/wiki/Franz_Beckenbauer ; "England–Germany football rivalry"; de.wikipedia "Fußball-Weltmeisterschaft 1970/Finalrunde"
 * CONFIRMED by those accounts: 14 June 1970, León, 12:00 kick-off, "the hot sun of León"; England led 2–0 (Mullery 31', Peters 49/50');
 * Beckenbauer scored at 67:47–68:00 ("68th/69th minute"): he "picked up a rebound off Francis Lee" (EFO report), "dribbled past Mullery"
 * (Guardian via englandstats) / "rounded Mullery" (EFO goal log; one EFO report names Terry Cooper instead — Mullery is drawn, the narration
 * says only "a defender"), and shot with his RIGHT foot "from outside the area underneath Bonetti", "a low, cross-shot which deceived Bonetti
 * and nestled in the far corner"; Seeler 82' and Müller 108' then won it 3–2 after extra time. Beckenbauer wore 4; Mullery 4, Lee 7, Moore 6
 * (captain), Labone 5, Cooper 3, Newton 2, Ball 8, Charlton 9 (still on: he went off at 69/70'), Hurst 10, Peters 11; Seeler 9 (captain),
 * Müller 13, Overath 12, Löhr 17, Grabowski 20 (on at 55–57'), Vogts 7, Fichtel 11, Schnellinger 3, Schulz 5, Maier 1; Bonetti 12 in goal
 * for England (Banks was ill). Kits: West Germany white V-necked shirts with black collar and cuffs, black shorts, white socks; England the
 * red away strip — red crew-necked shirts, white shorts, red socks.
 * INFERRED (not in the accounts): which end England defended in the second half (drawn: Germany attack left to right on the main camera),
 * the side he came down (drawn: Germany's right, the near side, which suits a right-foot cross-shot to the far corner), exactly how the
 * rebound came off Lee (drawn: Overath's challenge, the ball squirts off Lee's shin into Beckenbauer's path), where he picked it up (just
 * inside England's half), every position, path, speed and timing, which side of Mullery he went (drawn: outside him), the exact shot spot
 * (≈ 18 m out, right of the D), Bonetti's starting spot, his dive and his kit colour (drawn blue), the celebration, the other players
 * (their runs are illustrative), numbers' colours, hair tones, the stadium's stands and crowd colours and every camera placement and lens.
 * The narration names only the confirmed beats.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import {beats,shotAt,reframe,steady,near,type Subject,type Pin} from './director';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,keeperDive,lunge,celebrate,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [8,5,4,6]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The run',text:'Mexico, 1970. England lead West Germany two-nil. The ball bounces loose. Franz Beckenbauer takes it and runs, head up, on and on, past a defender, and scores!',seconds:13.4,
  cues:[[0,'Mexico'],[1.5,'England lead'],[3.7,'The ball bounces loose'],[5.1,'Franz Beckenbauer takes it'],[7.2,'head up'],[8.2,'on and on'],[9.4,'past a defender'],[10.8,'scores']]},
 {label:'The replay',text:'Watch again, slowly. He wins the loose ball and lifts his head: open grass ahead! So he carries it into midfield.',seconds:10.2,
  cues:[[0,'Watch again'],[1.6,'He wins the loose ball'],[3.4,'lifts his head'],[4.9,'open grass ahead'],[6.6,'carries it into midfield']]},
 {label:'The shot',text:'A low shot with his right foot, under the diving keeper, into the far corner!',seconds:7.6,
  cues:[[0,'A low shot'],[1.3,'right foot'],[2.5,'under the diving keeper'],[4.2,'far corner']]},
 {label:'The lesson',text:'Germany won three–two! Win the ball, lift your head, and if there’s space, carry it into midfield, like the Kaiser, Franz Beckenbauer.',seconds:11.4,
  cues:[[0,'Germany won'],[1.9,'Win the ball'],[3.1,'lift your head'],[4.4,'if there’s space'],[5.7,'carry it into midfield'],[7.7,'like the Kaiser']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py beckenbauer-sling-1970, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/beckenbauer-sling-1970/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/beckenbauer-sling-1970/timing.json';
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

// ---------------------------------------------------------------- León, midday sun: open stands, grass, stripes, markings, goals
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-12,75],b:[117,75],out:[0,1]},    // far side
 {a:[112,-10],b:[112,78],out:[1,0]},   // behind England's goal
 {a:[-12,-7],b:[117,-7],out:[0,-1]},   // main stand (the side camera sits in it)
 {a:[-7,-10],b:[-7,78],out:[-1,0]},    // behind West Germany's goal
];
const TIER_INK:[string,number][]=[[R,.3],[B,.2],[Y,.32],[R,.18],[K,.2],[B,.32],[R,.42],[Y,.2]];
function stadium(s:Sheet,c:Cam,bounce=0){
 const concrete=new Path2D(),wall=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,40,1.2+40*.55),P(0,40,1.2+40*.55)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  const segs=16;for(let k=0;k<24;k++){const d0=1+k*1.62,d1=d0+1.28,lift=bounce*(k%2?.25:.45),y0=1.2+d0*.55+lift,y1=1.2+d1*.55+lift;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 s.fill(Y,concrete,.2);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(R,wall,.3);s.fill(Y,wall,.6);s.stroke(K,wall,Math.max(2,.05*P3([70,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.fill(Y,grass,.62);s.fill(B,grass,.42);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(R,fl);}
}
/** A goal at line gx whose net runs out by dir (England's: gx 105, dir +1): white posts and bar, a net (paper haze + navy mesh).
 * bulge pushes the back of the net out low in the far corner (z ≈ 37) when the ball hits it. */
function goal(s:Sheet,c:Cam,gx:number,dir:number,bulge=0){
 const z0=30.34,z1=37.66,h=2.44,bz=36.6,bx=(z:number,y:number)=>gx+dir*(2+bulge*.55*Math.exp(-Math.pow((z-bz)/1.3,2))*Math.max(0,1-y/1.6)),bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx(z0,0),0,z0],[bx(z0,bh),bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx(z1,0),0,z1],[bx(z1,bh),bh,z1],[gx,h,z1]],c);
 const zs=[z0,32.2,34,35.4,36.6,z1];
 addPoly(net,[...zs.map(z=>[bx(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[bx(z,bh),bh,z] as V3)],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx(z1,bh),bh,z1],[bx(z0,bh),bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx(z,0),0,z],[bx(z,bh),bh,z]);seg([gx,h,z],[bx(z,bh),bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){for(let i=0;i<zs.length-1;i++)seg([bx(zs[i],y),y,zs[i]],[bx(zs[i+1],y),y,zs[i+1]]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx(z,y),y,z]);}
  for(let x=0;x<=2.01;x+=sp)for(const z of[z0,z1])seg([gx+dir*x,0,z],[gx+dir*x,lerp(h,bh,x/2),z]);
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Beckenbauer's RIGHT foot on his right (the near side, as he runs left to right). */
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
// skin: one flat-ish screen + one light screen (as the approved Best film on the same four inks)
const SKIN:InkFill[]=[[R,.2],[Y,.45]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** West Germany: white V-necked shirts with black collar and cuffs, black shorts, white socks (black drawn in the navy key ink) */
const germany=(hair:InkFill,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:K,shorts:K,socks:'paper',boots:K,skin:SKIN,hair,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** England: the red 1970 away strip — red crew-necked shirts, white shorts, red socks */
const england=(hair:InkFill,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:R,shorts:'paper',socks:R,boots:K,skin:SKIN,hair,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Beckenbauer: number 4, dark hair (tone inferred), tall and upright */
const FRANZ:AthleteStyle=germany([K,.8],{number:4,seed:4,build:{height:1.81,bulk:1}});
const MULLERY:AthleteStyle=england([K,.85],{number:4,seed:44,build:{height:1.78,bulk:1.04}});
const LEE:AthleteStyle=england([Y,.6],{number:7,seed:7,build:{height:1.7,bulk:1.1}});
const OVERATH:AthleteStyle=germany([K,.6],{number:12,seed:12});
const BONETTI:AthleteStyle={shirt:[B,.6],shorts:'paper',socks:'paper',boots:K,skin:SKIN,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:12,numberInk:'paper',scale:FIG,seed:1};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:4,build:FRANZ.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Beckenbauer takes the loose ball)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
/** Overath's challenge on Lee and the rebound off Lee's shin; Beckenbauer takes the ball in his stride at T=0 */
const T_REB=-.4,T_GET=0;
/** the knock past Mullery (outside him), the strike (right foot, contact T_SHOT), the ball under Bonetti, over the line, into the net */
const T_KNOCK=4.1,SDUR=.8,T_SHOT=5.1,T_SET=T_SHOT-STRIKE_CONTACT*SDUR;
const SHOT_H=nrm2(1,.62),SHOT_AT:[number,number]=[86.4,19.7],SHOT_PLACE=placeOf(SHOT_AT[0],SHOT_AT[1],SHOT_H);
/** the ball meets Beckenbauer's right boot here: solved from the body at the contact frame of the strike */
const BALL_S:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:.9}),FRANZ.build,SHOT_PLACE,FIG),t=toMy(sk.rToe),h=toMy(sk.rHeel);return[(t[0]*.7+h[0]*.3)+.14,(t[2]*.7+h[2]*.3)];})();
/** where the low cross-shot is going: just inside the far post (posts at z 30.34 / 37.66) */
const AIM:[number,number]=[105,36.95];
const SHOT_DIR=nrm2(AIM[0]-BALL_S[0],AIM[1]-BALL_S[1]),SHOT_LEN=Math.hypot(AIM[0]-BALL_S[0],AIM[1]-BALL_S[1]);
const V_SHOT=21;// m/s, a low drive
const T_LINE=T_SHOT+SHOT_LEN/V_SHOT;
const NET_END:[number,number]=[106.55,37.05];
/** Bonetti: off his line at the near side of the goal, the low dive to his right (toward the far post) as the shot comes */
const GK_AT:[number,number]=[102.7,32.9],GK_H=nrm2(-1,-.22);
const T_UNDER=T_SHOT+((GK_AT[0]-.35)-BALL_S[0])/SHOT_DIR[0]/V_SHOT;// the ball passes under him
const DIVE_DUR=1.15,T_DIVE=T_UNDER-.55*DIVE_DUR;
/** Beckenbauer's track: onto the loose ball, the carry with his head up, round Mullery on the outside, set for the shot, run on */
const FRANZ_KEYS=[[-4,43.5,16.6],[-1.6,49.4,18.9],[T_REB,53.6,20.2],[T_GET,56.1,20.6],[1,62.6,21.1],[2,69.2,21.6],[3,75.7,21.9],[3.7,80.1,21.8],
 [T_KNOCK,82.5,21.2],[4.45,84.4,20.4],[T_SET,SHOT_AT[0],SHOT_AT[1]]];
const FRANZ_AFTER=[[T_SHOT+.45,SHOT_AT[0]+.9,SHOT_AT[1]+.55],[6.2,89.2,21.6],[7,92,23],[8,94.6,24.6],[9.5,96.6,25.6]];
/** Lee: attacking toward West Germany's goal (−X) with the ball, Overath's challenge, the rebound off his shin, he turns and chases */
const LEE_KEYS=[[-4,70.5,25.4],[-1.6,60.2,23.4],[T_REB,56.3,22.6],[.6,56.5,23.1],[2,59.4,23.9],[4,64,25],[8,70,26]];
const OVERATH_KEYS=[[-4,47,27.5],[-1.6,51.6,25.2],[T_REB,55.3,23.3],[.8,56.4,23.9],[3,62,26],[6,70,28],[9,76,30]];
/** Mullery: out from the screen in front of his back four to meet him; beaten on the outside; turns to chase */
const MULLERY_KEYS=[[-4,76,30],[-1.6,79.6,28.2],[1,83.4,25.8],[3,85.8,23.6],[3.8,85.2,22.7],[T_KNOCK+.1,84.3,22.3],[4.9,84.9,22.5],[5.6,86.7,23.4],[7,89,24.5],[9,91,25]];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'franz',style:FRANZ,keys:FRANZ_KEYS},
 {id:'lee',style:LEE,keys:LEE_KEYS},
 {id:'overath',style:OVERATH,keys:OVERATH_KEYS},
 {id:'mullery',style:MULLERY,keys:MULLERY_KEYS},
 // everyone else: numbers from the line-ups, runs illustrative (England's back line dropping in, Germany's forwards running with him)
 {id:'moore',style:england([Y,.7],{number:6,seed:6}),keys:[[-4,86,33],[0,88,33.5],[3,92,33.6],[5,95,34],[7,97,34.5],[9.5,98,35]]},
 {id:'labone',style:england([K,.8],{number:5,seed:5}),keys:[[-4,85,40],[0,87.5,40],[3,91.5,39],[5,94.5,38.5],[7,96,38],[9.5,97,37.5]]},
 {id:'cooper',style:england([K,.7],{number:3,seed:3}),keys:[[-4,84,12],[0,87,12.5],[3,90.5,14],[5,92.5,16],[7,94,18],[9.5,95.5,19.5]]},
 {id:'newton',style:england([K,.5],{number:2,seed:2}),keys:[[-4,72,56],[0,78,53],[3,86,49],[5,91,46],[7,94,44],[9.5,96,43]]},
 {id:'ball',style:england([R,.6],{number:8,seed:8}),keys:[[-4,64,38],[0,70,36],[3,78,33],[5,83,31],[7,86,30],[9.5,88,30]]},
 {id:'charlton',style:england([K,.5],{number:9,seed:9,hairStyle:'balding'}),keys:[[-4,60,44],[0,63,42],[3,70,39],[6,76,37],[9.5,80,36]]},
 {id:'seeler',style:germany([K,.5],{number:9,seed:19,hairStyle:'balding',build:{height:1.7,bulk:1.08}}),keys:[[-4,72,34],[0,78,35],[3,86,35],[5,92,35.5],[7,93.5,33],[9.5,95,29]]},
 {id:'mueller',style:germany([K,.85],{number:13,seed:13,build:{height:1.76,bulk:1.12,thighs:1.2}}),keys:[[-4,74,40],[0,80,41],[3,88,41],[5,94,40],[7,95,36],[9.5,96,31]]},
 {id:'grabowski',style:germany([K,.6],{number:20,seed:20}),keys:[[-4,70,8],[0,76,7.5],[3,84,8],[5,89,9],[7,92,13],[9.5,94,19]]},
 {id:'loehr',style:germany([K,.7],{number:17,seed:17}),keys:[[-4,70,60],[0,75,58],[3,83,54],[5,88,50],[7,90,46],[9.5,92,43]]},
];
const BONETTI_KEYS=[[-4,103.8,34.2],[2,103.4,33.6],[4.2,102.9,33.1],[T_SET,GK_AT[0],GK_AT[1]],[10,GK_AT[0],GK_AT[1]]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-4);for(let t=-3.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: Lee's dribble (touches ahead, toward −X), the rebound off his shin into Beckenbauer's path, Beckenbauer's carry
 * (touches ahead, a little longer as he opens his stride), the knock past Mullery, rolling onto the shot spot, the low cross-shot under
 * Bonetti, over the line, into the side of the net. */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 if(T<T_REB-.15)return ahead(LEE_KEYS,T,.7+.5*Math.max(0,Math.sin((T+4)*TAU/.6)));
 const r0=ahead(LEE_KEYS,T_REB-.15,.7),g:V3=ahead(FRANZ_KEYS,T_GET+.05,.55);
 if(T<T_GET+.05)return lerp3(r0,g,sm(T_REB-.15,T_GET+.05,T,u=>u*(1.4-.4*u)),.35);// off the shin, a little pop into his path
 const k0:V3=ahead(FRANZ_KEYS,T_KNOCK,.6);
 if(T<T_KNOCK)return ahead(FRANZ_KEYS,T,.55+.75*Math.max(0,Math.sin((T-T_GET)*TAU/.72))*sm(T_GET,.5,T));
 const bs:V3=[BALL_S[0],.11,BALL_S[1]];
 if(T<T_SHOT)return lerp3(k0,bs,sm(T_KNOCK,T_SHOT,T,u=>u*(1.5-.5*u)));
 if(T<T_LINE){const d=(T-T_SHOT)*V_SHOT;return[BALL_S[0]+SHOT_DIR[0]*d,.11+.22*Math.sin(Math.PI*clamp(d/9)),BALL_S[1]+SHOT_DIR[1]*d];}
 const a:V3=[AIM[0],.11,AIM[1]],e:V3=[NET_END[0],.11,NET_END[1]];
 return lerp3(a,e,sm(T_LINE,T_LINE+.2,T,easeOut));
}
/** how far the net bulges (0..1) */
const bulgeAt=(T:number)=>sm(T_LINE+.08,T_LINE+.2,T)*(1-sm(T_LINE+.35,T_LINE+1.2,T,easeInOutSine)*.7);

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward a ground point. Right-handed yaw: + turns left. */
function lookAt(st:St,x:number,z:number,w=1,down=.25):Pose{const px=st.place.x!,pz=-st.place.z!,want=Math.atan2(z-pz,x-px),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=down*w;return clampPose(p);}
/** "head up": how much Beckenbauer's head is lifted off the ball (0 = over the ball, 1 = chin up, looking at the space ahead) */
const headUp=(T:number)=>sm(.25,.75,T)*(1-.55*win(T,3.75,T_KNOCK+.35,.2))*(1-sm(T_SET-.25,T_SET+.05,T));
function franzState(T:number):St{
 if(T<T_GET-.15){const st=runState(FRANZ_KEYS,T);return{pose:lookAt(st,ballAt(T)[0],ballAt(T)[2],.8),place:st.place};}
 if(T<T_SET){
  const st=runState(FRANZ_KEYS,T),v=velAt(FRANZ_KEYS,T),sp=Math.hypot(v[0],v[1]);
  const h=yawTo(sp>.5?[v[0]/sp,v[1]/sp]:[1,0],SHOT_H,sm(T_SET-.35,T_SET,T));
  // the carry: a running dribble, touches with the right foot; head over the ball on the first touch, then up (the lesson)
  let pose=blendPose(st.pose,dribble(strideAt(FRANZ_KEYS,T)*.9/3.3,{foot:'r',speed:clamp(sp/7.5)}),.6*sm(T_GET-.15,T_GET+.1,T));
  const up=headUp(T);pose=clampPose({...pose,neckP:lerp(pose.neckP,-.1,up),lean:lerp(pose.lean,pose.lean*.7,up),lShA:pose.lShA+.15*up,rShA:pose.rShA+.1*up});
  // the knock past Mullery: a wider push with the outside of the right foot, the body leaning out after it
  pose=blendPose(pose,clampPose({...pose,rHipA:pose.rHipA+.35,rHipF:.45,rKnee:.35,bend:-.18,roll:-.1}),win(T,T_KNOCK-.2,T_KNOCK+.2,.12)*.8);
  return{pose,place:placeOf(st.place.x!,-st.place.z!,h)};}
 if(T<T_SET+SDUR){const u=(T-T_SET)/SDUR;return{pose:strike(u,{power:.9}),place:SHOT_PLACE};}
 // run on after the shot, turning away, then the arms go up
 const k=[[T_SET+SDUR,SHOT_AT[0],SHOT_AT[1]],...FRANZ_AFTER],st=runState(k,T),joy=sm(6.4,6.9,T);
 const pose=blendPose(blendPose(strike(1,{power:.9}),st.pose,sm(T_SET+SDUR,T_SET+SDUR+.3,T)),celebrate((T-6.4)*.9,{kind:'arms'}),joy*.85);
 return{pose,place:st.place};
}
/** Lee: dribbling toward West Germany's goal, the ball bounces off his shin, he stumbles and turns, then chases */
function leeState(T:number):St{
 if(T<T_REB){const st=runState(LEE_KEYS,T);return{pose:blendPose(st.pose,dribble(strideAt(LEE_KEYS,T)*.9/3.4,{foot:'r',speed:.8}),.55),place:st.place};}
 const st=runState(LEE_KEYS,T),u=clamp((T-T_REB)/.9);
 const trip=keyPoses(u,[[0,runCycle(.3,{speed:.7})],[.35,posed({lean:30,pitch:12,lHipF:40,lKnee:70,rHipF:-10,rKnee:40,lShA:50,rShA:60,lShF:30,rShF:-20,lElb:50,rElb:40,neckP:-10})],[1,stand()]]);
 const turn=yawTo(nrm2(-1,-.1),nrm2(1,.2),sm(T_REB+.4,T_REB+1.2,T));
 return{pose:blendPose(trip,st.pose,sm(T_REB+.8,T_REB+1.2,T)),place:placeOf(st.place.x!,-st.place.z!,T<T_REB+1.2?turn:(Math.hypot(...velAt(LEE_KEYS,T))>.8?nrm2(...velAt(LEE_KEYS,T)):turn))};
}
function overathState(T:number):St{
 const st=runState(OVERATH_KEYS,T),w=win(T,T_REB-.35,T_REB+.6,.15);
 if(w<=0)return st;
 const p=trackAt(OVERATH_KEYS,T_REB),l=trackAt(LEE_KEYS,T_REB);
 return{pose:blendPose(st.pose,lunge(clamp((T-T_REB+.3)/.9),{side:'r'}),w),place:placeOf(p[0],p[1],nrm2(l[0]-p[0],l[1]-p[1]))};
}
/** Mullery: out to meet him, a jab at the ball on his left as Beckenbauer knocks it round him, then turning to chase */
function mulleryState(T:number):St{
 const st=runState(MULLERY_KEYS,T),f=trackAt(FRANZ_KEYS,Math.min(T,T_SET)),p=trackAt(MULLERY_KEYS,T);
 const faceF=nrm2(f[0]-p[0],f[1]-p[1]);
 if(T<T_KNOCK-.45){const y=st.place.yaw!;return{pose:st.pose,place:placeOf(p[0],p[1],yawTo([Math.cos(y),Math.sin(y)],faceF,sm(2.4,3.3,T)))};}
 if(T<T_KNOCK+.7){const u=clamp((T-T_KNOCK+.45)/1.1);return{pose:blendPose(st.pose,lunge(u,{side:'l'}),sm(T_KNOCK-.45,T_KNOCK-.3,T)*(1-sm(T_KNOCK+.5,T_KNOCK+.7,T))),place:placeOf(p[0],p[1],faceF)};}
 const turn=yawTo(faceF,nrm2(1,.3),sm(T_KNOCK+.5,T_KNOCK+1.1,T));return{pose:st.pose,place:placeOf(p[0],p[1],turn)};
}
function bonettiState(T:number):St{const[x,z]=trackAt(BONETTI_KEYS,T),b=ballAt(T);
 if(T<T_DIVE){const h=T>T_SET?yawTo(nrm2(b[0]-x,b[2]-z),GK_H,sm(T_SET,T_DIVE,T)):nrm2(b[0]-x,b[2]-z);return{pose:keeperSet(T*1.3),place:placeOf(x,z,h)};}
 // the low dive to his right (toward the far post): the ball goes under him
 return{pose:blendPose(keeperSet(T_DIVE*1.3),keeperDive(clamp((T-T_DIVE)/DIVE_DUR),{side:'r',height:0}),sm(T_DIVE,T_DIVE+.1,T)),place:placeOf(x,z,GK_H)};}
function stateOf(id:string,T:number):St{
 if(id==='franz')return franzState(T);if(id==='lee')return leeState(T);if(id==='overath')return overathState(T);if(id==='mullery')return mulleryState(T);if(id==='bonetti')return bonettiState(T);
 return runState(TR(id).keys,T);
}
const HEROES=['franz','mullery','bonetti'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];skip?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'bonetti'].filter(id=>(!o.only||o.only.includes(id))&&!o.skip?.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='bonetti'?BONETTI:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='franz'&&Math.abs(T-T_SHOT)<.25)||(id==='franz'&&Math.abs(T-T_KNOCK)<.2)||(id==='bonetti'&&T>T_DIVE+.2&&T<T_UNDER+.2);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:bp[0]>105.05?1e6:1/bq[2]-.0015,draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir,gx?bulgeAt(T):0)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the side, in real time, panning with the ball: Lee on the ball, the rebound, Beckenbauer takes it
 * and runs, head up, past Mullery, the shot, goal, the arms go up. */
const MAIN_CAM:V3=[66,24,-42];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-3.6],[q[2],T_REB-.1],[q[3],T_GET+.35],[q[4],2.2],[q[6],T_KNOCK],[q[7]+.1,T_SHOT],[S,T_SHOT+2.5]]);};
const cam1Authored=(t:number):Pin=>{const T=t1(t),b=ballAt(Math.max(-3.6,T-.35)),tx=clamp(b[0]+2,52,96),tz=lerp(24,29,sm(3,6,T)),F=lerp(6400,8000,sm(1,5.4,T,easeInOutSine));
 return{eye:MAIN_CAM,target:[tx,0,tz],F};};
/** the window in this film's camera units (frame(): ~1500 × 1030 at z = 1) */
const DV={w:1500,h:1030};
const g3=(p:number[]):[number,number,number]=>[p[0],0,p[1]];
/** Director (lib/plays/riso/director.ts): the ball and whoever is on it, blending onto Beckenbauer as he wins it; Mullery (the man he
 * runs past) and Bonetti (the keeper he beats) stay in frame as they come near */
function subjAt(T:number):Subject{const f=g3(trackAt(FRANZ_KEYS,T)),b=ballAt(T),u=sm(T_REB-.5,T_GET+.3,T,easeInOutSine),
  h:[number,number,number]=[lerp(b[0],f[0],u),0,lerp(b[2],f[2],u)];
 return{hero:h,ball:b,height:1.8*FIG,keep:near(h,[g3(trackAt(MULLERY_KEYS,T)),g3(trackAt(BONETTI_KEYS,T))],3.5,7,1.8*FIG)};}
/** Live: a short establishing wide of the Azteca, then follow the loose ball and Beckenbauer as he takes it; pull out for the run into
 * the open grass (the space he sees with his head up is the lesson); tight as he goes past Mullery and shoots; the reaction. */
const B1=beats([[0,'wide'],[1,'follow'],[Q(0)[4]-.2,{from:'space',size:.28}],[Q(0)[6]-.4,'tight'],[Q(0)[7]+.4,'reaction']]);
const cam1=(t:number)=>{const r=steady(t,u=>reframe(cam1Authored(u),subjAt(t1(u)),shotAt(u,B1),DV));return camAt(r.eye,r.target,r.F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[7]+1.2;},
};
/** 2 · TV slow-motion replay from a low touchline camera ahead of him: he takes the loose ball, lifts his head, the open grass, the carry. */
const LOW_CAM:V3=[76,3.6,11];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-1.2],[q[1],T_REB+.05],[q[2],.5],[q[3],1.2],[q[4],2],[S,3.2]]);};
const cam2=(t:number)=>{const T=t2(t),f=trackAt(FRANZ_KEYS,T),F=lerp(3700,2500,sm(-1,2.6,T,easeInOutSine));
 return camAt(LOW_CAM,[f[0]+1.2,.95,f[1]+.6],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6,skip:['grabowski','cooper']});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.4;},
};
/** 3 · the second replay, from high behind England's goal: round Mullery, the low right-foot cross-shot, under Bonetti, the far corner. */
const BEHIND:V3=[119,9,37];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_KNOCK+.3],[q[1],T_SHOT],[q[2]+.35,T_UNDER],[q[3],T_LINE+.2],[S,T_LINE+1.1]]);};
const cam3Authored=(t:number):Pin=>{const T=t3(t),b=ballAt(T),u=sm(T_SHOT,T_LINE,T,easeInOutSine),tx=lerp(90,101.5,u),tz=lerp(24,33.5,u),F=lerp(3600,3000,u);
 return{eye:BEHIND,target:[lerp(tx,b[0],.25),.7,lerp(tz,b[2],.25)],F};};
/** Behind the goal: tight on the low right-foot shot with Bonetti in frame (under the diving keeper is the lesson), then the authored
 * wide as the ball rolls into the far corner. */
const B3=beats([[0,'follow'],[Q(2)[1]-.45,'tight'],[Q(2)[2]-.55,'wide']]);
const cam3=(t:number)=>{const r=steady(t,u=>reframe(cam3Authored(u),subjAt(t3(u)),shotAt(u,B3),DV));return camAt(r.eye,r.target,r.F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[3]+.4;},
};
/** 4 · the lesson plate: the carry again from a raised camera behind him on the near side, with bold yellow teaching marks — a ring where
 * he wins the ball, his eye-line lifted to the space ahead (lift your head), the open grass lit ahead of him (if there's space), his carry
 * printed as a long arrow into midfield, and a stamp of the Kaiser. */
/** offset from Beckenbauer: behind him and toward the near touchline, raised */
const LESSON_CAM:V3=[-9,6,-9];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-.9],[q[1],T_GET-.05],[q[1]+.9,T_GET+.1],[q[2],.35],[q[3],.9],[q[4],1.3],[q[5],2.4],[S,3.05]]);};
const cam4=(t:number)=>{const T=t4(t),f=trackAt(FRANZ_KEYS,clamp(T,-.4,3.6)),u=sm(.9,3.4,T,easeInOutSine);
 const pos:V3=[f[0]+LESSON_CAM[0],lerp(LESSON_CAM[1],7.5,u),f[1]+LESSON_CAM[2]];return camAt(pos,[f[0]+lerp(3,5,u),.5,f[1]+1],lerp(2100,1900,u));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow through pts (drawn to `u`), one path: shaft + head */
function arrowPts(s:Sheet,pts:Pt[],w:number,seed:number,u=1){if(u<=.01||pts.length<2)return;const n=Math.max(2,Math.round(pts.length*clamp(u))),P=pts.slice(0,n),e=P[P.length-1],a=P[P.length-2],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4;
 const back:Pt=[e[0]-Math.cos(an)*hl*.8,e[1]-Math.sin(an)*hl*.8],p=new Path2D();p.addPath(ribbon([...P.slice(0,-1),back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
function ringAt(s:Sheet,c:Cam,x:number,z:number,r:number){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.74,z+Math.sin(a)*r*.74,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
const GET_AT=trackAt(FRANZ_KEYS,T_GET);
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  // "if there's space": the open grass ahead of him lit as a yellow halftone lane (printed on the grass, under the figures)
  const lane=sm(q[3]-.1,q[3]+.5,t,easeOut)*(1-sm(q[5]+.8,q[5]+1.4,t));
  if(lane>.01){const f=trackAt(FRANZ_KEYS,Math.min(T,.9)),L=4+20*lane,pts:Pt[]=[G(f[0]+2,f[1]-3.2,c),G(f[0]+2+L,f[1]-3.6,c),G(f[0]+2+L,f[1]+4.4,c),G(f[0]+2,f[1]+3.4,c)];
   const ln=shape(pts);s.knockout(ln,.45*lane);s.fill(Y,ln,.7*lane);}
  // "Win the ball": a ring on the grass where he takes it
  const ring=sm(q[1]-.1,q[1]+.3,t,easeOutBack)*(1-sm(q[2]+.4,q[2]+.8,t));
  if(ring>.01)ringAt(s,c,GET_AT[0]+.4,GET_AT[1],1.5*ring);
  // "carry it into midfield": his run printed as a long arrow on the grass, ahead of him
  const carry=sm(q[4]-.1,q[4]+1.6,t,easeInOutSine);
  if(carry>0){const pts:Pt[]=[],T0=Math.max(T,T_GET)+.25;for(let u=T0;u<=T0+2.6;u+=.2){const m=trackAt(FRANZ_KEYS,u);pts.push(G(m[0],m[1]-.9,c));}
   const f=trackAt(FRANZ_KEYS,T0);arrowPts(s,pts,Math.max(12,.2*P3([f[0],0,f[1]],c)[2]),31,carry*(1-sm(q[5]+1.4,q[5]+2,t)));}
  drawPlay(s,T,c,{ballScale:1.5,only:['franz','lee','overath','ball'],noStadium:true});
  // "lift your head": a dashed eye-line from his head forward to the open grass, level, not down at the ball
  const eye=win(t,q[2]-.1,q[4]+.4,.3);
  if(eye>0&&T>T_GET){const st=franzState(T),sk=solve(st.pose,FRANZ.build,st.place,FIG),h=toMy(sk.head),hp=P3(h,c),fx=st.place.x!,fz=-st.place.z!,tp=P3([fx+14,1.2,fz+1.2],c),dash=new Path2D();
   for(let i=0;i<8;i++){const u0=i/8+.03,u1=u0+.07;if(u1>eye)break;dash.addPath(ribbon([[lerp(hp[0],tp[0],u0),lerp(hp[1],tp[1],u0)],[lerp(hp[0],tp[0],u1),lerp(hp[1],tp[1],u1)]],Math.max(9,.09*hp[2]),{seed:40+i,taper:0}));}
   mark(s,dash);const r=Math.max(14,.45*tp[2])*eye,o=new Path2D();o.arc(tp[0],tp[1],r,0,TAU);o.arc(tp[0],tp[1],r*.7,0,TAU,true);mark(s,o);}
  // "like the Kaiser": a spark stamped over his head and a yellow ghost of the run ahead
  const k=sm(q[5],q[5]+.45,t,easeOutBack);
  if(k>.01){const st=franzState(T),sk=solve(st.pose,FRANZ.build,st.place,FIG),hp=P3(toMy(sk.head),c);sparkBurst(s,Y,hp[0],hp[1]-.45*hp[2],.55*hp[2],{n:9,seed:61,g:clamp(k),width:.05*hp[2]});
   if(t>q[5]+.3&&T<3.1){const gs=franzState(T+.8);drawPlayer(s,gs.pose,c,GHOST,gs.place);}}
  frame(s);
 },
 get still(){return Q(3)[5]+1.4;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'beckenbauer-sling-1970',format:'11v11',title:'Beckenbauer brings it out',theme:'Win the ball, lift your head, carry it forward',
 ageNote:'West Germany v England · World Cup quarter-final, 14 June 1970 · León, Mexico',
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
/** Solved contact points (pitch metres; England's goal line at X=105, Z across) — checked by tests/play-film-beckenbauer-sling-1970.cjs. */
export const FACTS={BALL_S,AIM,NET_END,SHOT_AT,GK_AT,T_SHOT,T_UNDER,T_LINE,T_GET,ballAt,
 /** mid-sole of each boot at the strike's contact frame (my metres) */
 rightFoot:()=>{const sk=solve(strike(STRIKE_CONTACT,{power:.9}),FRANZ.build,SHOT_PLACE,FIG),a=toMy(sk.rToe),b=toMy(sk.rHeel);return[(a[0]*.7+b[0]*.3),(a[1]+b[1])/2,(a[2]*.7+b[2]*.3)];},
 leftFoot:()=>{const sk=solve(strike(STRIKE_CONTACT,{power:.9}),FRANZ.build,SHOT_PLACE,FIG),a=toMy(sk.lToe),b=toMy(sk.lHeel);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];},
 /** Bonetti's body (pelvis, chest) at the moment the ball passes under him */
 keeperAt:(T:number)=>{const st=bonettiState(T),sk=solve(st.pose,BONETTI.build,st.place,FIG);return{pelvis:toMy(sk.pelvis),chest:toMy(sk.chest),lHa:toMy(sk.lHa),rHa:toMy(sk.rHa)};},
 franzAt:(T:number)=>{const st=franzState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 mulleryAt:(T:number)=>{const st=mulleryState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 headUp};
