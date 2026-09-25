/** Iconic-play film · Bobby Moore, "that tackle by Moore" — England v Brazil, World Cup group match, 7 June 1970, Estadio Jalisco, Guadalajara.
 *
 * A faithful recreation of the broadcast rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, England's goal
 * line at X=0 in the second half, Z across, away from the main-stand camera, Y up) seen through TV cameras — 1 live, the high main camera on
 * the side (Jairzinho breaks from his own half, Moore tracks back with him all the way, into the box, the tackle); 2 a TV slow-motion replay
 * from a low touchline camera (Moore waits, then slides in and his right boot takes the ball); 3 a second replay from behind England's goal
 * (Jairzinho tumbles over, a clean tackle, Moore gets up and carries the ball away); 4 the lesson (the only chapter with teaching marks: the
 * gap he keeps, the run back goalside, eyes on the ball, the timed tackle, the pass out). No overlays inside the footage chapters.
 * The Banks film (banks-save-1970.ts) is the same match: the stadium, kits and camera language follow it.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - englandstats.com, match 446 "Brazil 1-0 England, 7th June 1970": https://www.englandstats.com/matches.php?mid=446
 *  - England Caps, "1970 England: Brazil" (Chris Hogan): https://www.englandcaps.co.uk/1970englandbrazil.html
 *  - Wikipedia, "Bobby Moore" (1970 section) and "1970 FIFA World Cup Group 3" (line-ups, kit boxes): https://en.wikipedia.org/wiki/Bobby_Moore
 *    https://en.wikipedia.org/wiki/1970_FIFA_World_Cup_Group_3
 *  - The Guardian, "My favourite game: Bobby Moore displays his brilliance against Brazil" (2020):
 *    https://www.theguardian.com/football/2020/may/21/my-favourite-game-bobby-moore-displays-his-brilliance-against-brazil
 *  - The Telegraph, "Remembering England vs Brazil, 1970: Why 'that tackle by Moore'…" (2020; search-result summary only, paywalled):
 *    https://www.telegraph.co.uk/football/2020/06/07/remembering-england-vs-brazil-1970-tackle-moore-gordon-banks/
 *  - Sport Question, "What was 'that tackle by Moore'?" (search-result summary only): https://sportquestion.com/football/what-was-that-tackle-by-moore/
 *  - The Times, "Most famous tackle looked like Superman stopping a train" (2014; headline and standfirst only, paywalled)
 *  - Kits: as researched for banks-save-1970.ts (Museum of Jerseys / Historical Football Kits, 1970 group 3) and the Wikipedia kit boxes.
 * CONFIRMED by those accounts: second half, about the 65th minute (englandstats [64:56]), after Brazil's goal on the hour; an England attack
 * broke down and Brazil countered down the right, two against two; Jairzinho collected the ball in his own half and ran at the defence;
 * Moore tracked back with him all the way, watching the ball intently; as Jairzinho dribbled into the England penalty area Moore chose his
 * moment, stuck out his RIGHT leg and, sliding to the ground, took the ball cleanly ("Moore's right foot makes contact with the ball as he
 * slides to the ground"); a mistimed tackle would have been a penalty; Jairzinho tumbled over; Moore came away with the ball and carried it
 * upfield. Moore wore 6 and captained England; Jairzinho wore 7; England all white; Brazil yellow shirts with green trim, blue shorts, white
 * socks; Banks in goal in a blue shirt. Brazil still won 1–0.
 * INFERRED (not in the accounts): which end England defended on screen (the teams changed ends after the first-half Banks save, so here
 * Brazil attack right to left and their right wing is the far side), every position, path and timing, the angle of the run and of the
 * slide, where the ball rolled, Jairzinho's dribbling foot (right), how Moore got up and which way he carried it, the pass out to a team-mate (drawn only as the lesson's
 * teaching mark), how Jairzinho fell and got up, who the other two players in the two-against-two were (not named), all other players, the
 * camera placements and lenses, Moore's hair tone (fair), Banks's shorts and gloves. The narration names only the confirmed beats.
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
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,slideTackle,posed,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [6,5,5,7]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The break',text:'Mexico, 1970. Jairzinho of Brazil races at England’s goal. Bobby Moore runs back with him, eyes on the ball. Into the box… Moore takes it!',seconds:11.2,
  cues:[[0,'Mexico'],[1.5,'Jairzinho'],[4.1,'Bobby Moore runs back'],[6,'eyes on the ball'],[7.5,'Into the box'],[8.9,'Moore takes it']]},
 {label:'The replay',text:'Watch again, slowly. Moore waits, and waits. Then, at just the right moment, he slides in, and his right foot takes the ball.',seconds:10.2,
  cues:[[0,'Watch again'],[1.6,'Moore waits'],[3.4,'Then'],[5.6,'he slides in'],[6.9,'right foot takes the ball']]},
 {label:'Clean',text:'Jairzinho tumbles over, but it’s clean: Moore touched only the ball. He gets up and carries it away.',seconds:8.6,
  cues:[[0,'Jairzinho tumbles over'],[1.8,'but it’s clean'],[3,'Moore touched only the ball'],[5,'He gets up'],[6.3,'carries it away']]},
 {label:'The lesson',text:'That tackle by Moore! Be patient: run back, watch the ball, and time your tackle. Win it cleanly, then pass it out.',seconds:10.6,
  cues:[[0,'That tackle by Moore'],[1.9,'Be patient'],[3,'run back'],[4,'watch the ball'],[5.1,'time your tackle'],[6.9,'Win it cleanly'],[8.2,'pass it out']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py moore-tackle-1970, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/moore-tackle-1970/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/moore-tackle-1970/timing.json';
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

// ---------------------------------------------------------------- the Estadio Jalisco (as in the Banks film): stands, grass, stripes, markings, goals
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-12,75],b:[117,75],out:[0,1]},    // far side
 {a:[112,-10],b:[112,78],out:[1,0]},   // the far end (behind Brazil's goal)
 {a:[-12,-7],b:[117,-7],out:[0,-1]},   // main stand (the side camera sits in it)
 {a:[-7,-10],b:[-7,78],out:[-1,0]},    // behind England's goal
];
const TIER_INK:[string,number][]=[[O,.32],[B,.2],[Y,.32],[O,.2],[K,.2],[B,.32],[O,.45],[Y,.2]];
function stadium(s:Sheet,c:Cam,bounce=0){
 const concrete=new Path2D(),wall=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,44,1.2+44*.55),P(0,44,1.2+44*.55)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  const segs=16;for(let k=0;k<26;k++){const d0=1+k*1.62,d1=d0+1.28,lift=bounce*(k%2?.25:.45),y0=1.2+d0*.55+lift,y1=1.2+d1*.55+lift;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 s.fill(Y,concrete,.2);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(O,wall,.32);s.fill(Y,wall,.6);s.stroke(K,wall,Math.max(2,.05*P3([10,0,34],c)[2]),.6);
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
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(O,fl);}
}
/** A goal at line gx whose net runs out by dir (England's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
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
 * negates z both ways — that keeps Moore's RIGHT leg on his right (toward Jairzinho, the far side, as he runs back toward his own goal). */
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
const brazil=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:[B,.6],shorts:B,socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.6],scale:FIG,...o});
const england=(hair:InkFill,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:'paper',shorts:'paper',socks:'paper',boots:K,skin:LIGHT,hair,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Moore: England's captain, number 6, fair hair (tone inferred) */
const MOORE:AthleteStyle=england([O,.5],{number:6,seed:6,build:{height:1.83,bulk:1.02}});
const JAIR:AthleteStyle=brazil(DARK,{number:7,seed:7,build:{height:1.76,bulk:1.02,thighs:1.08}});
const BANKS:AthleteStyle={shirt:[B,.6],shorts:'paper',socks:'paper',boots:K,skin:LIGHT,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:'paper',scale:FIG,seed:1};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:6,build:MOORE.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Jairzinho on the ball in his own half)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
/** Moore's run back: goalside and inside Jairzinho, facing his own goal, slowing as the Brazilian closes */
const MOORE_KEYS=[[-2,37,38.4],[0,33.4,38.6],[2,26.6,38.5],[4,20.4,38.3],[5.5,16.5,38.3],[6.4,14.5,38.5]];
/** the slide: from T_SLIDE for SLIDE_DUR s, heading toward his goal and across toward the far side (Jairzinho's path) */
const T_SLIDE=6.4,SLIDE_DUR=.9,T_CONTACT=T_SLIDE+.42*SLIDE_DUR,T_SLID=T_SLIDE+SLIDE_DUR;
const SLIDE_H=nrm2(-1,.5),SLIDE_AT:[number,number]=[14.5,38.5],SLIDE_PLACE=placeOf(SLIDE_AT[0],SLIDE_AT[1],SLIDE_H);
const SLIDE_LEN=slideTackle(1).dx;
/** Moore's slide on the right leg: the library slide with the lead leg lowered through the contact so the boot is on the grass, sole to the ball */
function SLIDE(u:number):Pose{const p=slideTackle(clamp(u)),w=sm(.25,.38,u)*(1-sm(.62,.82,u));return w>0?clampPose({...p,rHipF:p.rHipF-.18*w,rAnk:p.rAnk-.1*w}):p;}
/** the ball meets Moore's right boot here: solved from the body at the contact frame of the slide */
const BALL_T:[number,number]=(()=>{const sk=solve(SLIDE(.42),MOORE.build,SLIDE_PLACE,FIG),t=toMy(sk.rToe),h=toMy(sk.rHeel);return[(t[0]+h[0])/2+.13,(t[2]+h[2])/2+.02];})();
const GETUP:[number,number]=add2(SLIDE_AT,SLIDE_H,SLIDE_LEN);
const UP_H=nrm2(1,-.8);// upfield and toward the near touchline: where he carries it
const BALL_REST:[number,number]=add2(GETUP,UP_H,.55);
/** Jairzinho: from his own half, angling in from the right (far side) toward goal, into the box; a touch ahead, then over Moore's leg */
const J_H=nrm2(-1,-.16),J_C:[number,number]=add2(add2(BALL_T,J_H,-1.15),[0,1],.45);
/** the way he tumbles: over the leg and on, a little toward the far side */
const J_FALL=nrm2(-1,.3);
const JAIR_KEYS=[[-2,64.5,50],[0,57,47.6],[2,44,45.4],[4,30.4,43],[5.5,20.8,41.3],[T_SLIDE-.1,...add2(J_C,J_H,-2.4)],[T_CONTACT,...J_C]];
const MOORE_OUT=[[8.3,...BALL_REST],[9.3,...add2(BALL_REST,UP_H,2.4)],[10.6,...add2(BALL_REST,[1,-.55],7.4)]];
const PASS_AT=10.6,PASS_TO=10.6+1.15;
const RECV=[[-2,62,22],[0,57,22],[6,38,20],[9,...add2(BALL_REST,[1,-.55],19)],[PASS_TO,...add2(BALL_REST,[1,-.6],21)],[14,...add2(BALL_REST,[1,-.6],22.5)]];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'moore',style:MOORE,keys:MOORE_KEYS},
 {id:'jair',style:JAIR,keys:JAIR_KEYS},
 // the other two of the two-against-two (not named in the accounts; positions illustrative)
 {id:'b-2',style:brazil(MID,{number:11,seed:11}),keys:[[-2,62,24],[0,56,25],[3,38,27.2],[6,22.5,28.5],[7.2,18.5,29],[10,19,30],[14,22,31]]},
 {id:'e-2',style:england([K,.75],{number:5,seed:5}),keys:[[-2,42,27],[0,39,27.4],[3,30,27.6],[6,19.5,28.2],[7.2,16.6,28.5],[10,18,28],[14,22,28]]},
 {id:'e-recv',style:england([K,.6],{number:4,seed:14}),keys:RECV},
 // players coming back from England's attack (illustrative)
 {id:'e-3',style:england([K,.88]),keys:[[-2,82,30],[0,77,31],[6,56,34],[10,46,34],[14,40,33]]},
 {id:'e-4',style:england([K,.6]),keys:[[-2,78,55],[0,73,53],[6,52,47],[10,44,43],[14,40,41]]},
 {id:'b-3',style:brazil(LIGHT),keys:[[-2,84,40],[0,80,40],[6,64,38],[10,56,36],[14,52,35]]},
 {id:'b-4',style:brazil(MID),keys:[[-2,72,14],[0,68,15],[6,52,18],[10,46,20],[14,44,21]]},
 {id:'e-5',style:england([K,.75]),keys:[[-2,86,18],[0,81,19],[6,60,22],[10,52,23],[14,48,24]]},
];
const BANKS_KEYS=[[-2,3.4,35],[4,2.8,36.4],[6.4,2.4,37.4],[8,2.8,37],[14,3.5,35]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-2);for(let t=-1.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: Jairzinho's dribble (touches ahead), the last touch into the box, Moore's right boot, stopped by his hip,
 * Moore collects it and carries it upfield, the pass out (lesson mark only; the footage chapters end before it). */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 const jr=JAIR_KEYS,LAST=5.95;
 if(T<LAST)return ahead(jr,T,.75+.55*Math.max(0,Math.sin(T*TAU/.62)));
 const b0=ahead(jr,LAST,.75),bt:V3=[BALL_T[0],.11,BALL_T[1]],rest:V3=[BALL_REST[0],.11,BALL_REST[1]];
 if(T<T_CONTACT)return lerp3(b0,bt,sm(LAST,T_CONTACT,T,u=>u*(1.25-.25*u)));
 if(T<8.2)return lerp3(bt,rest,sm(T_CONTACT,T_CONTACT+.7,T,easeOut));
 if(T<PASS_AT){const a=ahead(MOORE_OUT,T,.6+.3*Math.max(0,Math.sin((T-8.2)*TAU/.7)));return lerp3(rest,a,sm(8.2,8.6,T));}
 const from=ahead(MOORE_OUT,PASS_AT,.6),to=trackAt(RECV,PASS_TO+.1);
 if(T<PASS_TO)return lerp3(from,[to[0],.11,to[1]],sm(PASS_AT,PASS_TO,T,u=>u*(1.3-.3*u)),.3);
 return ahead(RECV,T,.55);
}

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
/** head (and a little shoulder) turned toward the ball: "eyes on the ball". Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
/** Moore: tracking back eyes on the ball; the slide on the right leg; down; up again facing upfield; carrying the ball; the pass out */
function mooreState(T:number):St{
 if(T<T_SLIDE+.1){const turn=sm(5.2,T_SLIDE,T,easeInOutSine),v=velAt(MOORE_KEYS,T),sp=Math.hypot(v[0],v[1]),h=yawTo(sp>.5?[v[0]/sp,v[1]/sp]:[-1,0],SLIDE_H,turn),st=runState(MOORE_KEYS,T,h);
  let pose=lookAtBall(st,T,1-.6*sm(6.1,T_SLIDE+.1,T));
  // a little lower and wider as the Brazilian closes (patience: on his toes, ready)
  pose=blendPose(pose,clampPose({...pose,lKnee:pose.lKnee+.25,rKnee:pose.rKnee+.25,lean:pose.lean+.12}),win(T,4.6,6.3,.6)*.6);
  if(T<T_SLIDE)return{pose,place:st.place};
  return{pose:blendPose(pose,SLIDE((T-T_SLIDE)/SLIDE_DUR),sm(T_SLIDE,T_SLIDE+.1,T)),place:SLIDE_PLACE};}
 if(T<T_SLID)return{pose:SLIDE((T-T_SLIDE)/SLIDE_DUR),place:SLIDE_PLACE};
 // down: the slide's end pose moved onto its own spot (continuous), then up and turning upfield
 const down={...slideTackle(1),dx:0},up=sm(7.75,8.45,T,easeInOutSine),h=yawTo(SLIDE_H,UP_H,sm(7.9,8.5,T));
 if(T<8.3){const kneel=posed({lHipF:70,lKnee:120,lAnk:30,rHipF:20,rKnee:100,rAnk:40,lean:30,pitch:4,lShA:30,rShA:40,lShF:30,rShF:-10,lElb:40,rElb:30,neckP:10});
  const pose=keyPoses(clamp((T-7.55)/.9),[[0,down],[.45,kneel],[1,stand()]]);return{pose:T<7.55?down:pose,place:placeOf(GETUP[0],GETUP[1],up>0?h:SLIDE_H)};}
 const p=trackAt(MOORE_OUT,Math.min(T,PASS_AT)),v=velAt(MOORE_OUT,Math.min(T,PASS_AT-.07)),sp=Math.hypot(v[0],v[1]),hh=yawTo(UP_H,nrm2(v[0],v[1]),sm(8.3,8.8,T));
 let pose=blendPose(stand(),dribble(strideAt(MOORE_OUT.map(k=>[k[0],k[1],k[2]]),T)*.9/3.2,{foot:'r',speed:clamp(sp/7)}),sm(8.3,8.6,T));
 pose=blendPose(pose,strike(clamp((T-PASS_AT)/.9+STRIKE_CONTACT),{power:.55}),win(T,PASS_AT-.45,PASS_AT+.7,.25));
 return{pose,place:placeOf(p[0],p[1],T>PASS_AT-.5?yawTo(hh,nrm2(1,-.55),sm(PASS_AT-.5,PASS_AT-.2,T)):hh)};
}
/** Jairzinho's tumble over Moore's leg (authored in degrees; grounding is automatic) */
const TUMBLE:[number,Pose][]=[
 [0,posed({lHipF:34,lKnee:24,rHipF:-24,rKnee:70,rAnk:30,lean:14,pitch:10,lShF:-30,rShF:40,lElb:84,rElb:84,neckP:10})],
 [.22,posed({dx:.6,air:.22,pitch:30,lean:18,lHipF:-26,lKnee:86,lAnk:30,rHipF:40,rKnee:36,lShF:64,rShF:86,lShA:44,rShA:40,lElb:30,rElb:34,neckP:-20,roll:-6})],
 [.48,posed({dx:1.3,air:.4,pitch:62,lean:10,lHipF:-12,lKnee:74,lAnk:40,rHipF:12,rKnee:54,lShF:134,rShF:126,lShA:40,rShA:44,lElb:22,rElb:24,neckP:-40,lHand:1,rHand:1,roll:-10})],
 [.72,posed({dx:1.9,air:0,pitch:84,lean:0,lHipF:-6,lKnee:44,rHipF:10,rKnee:62,lShF:146,rShF:138,lShA:50,rShA:52,lElb:44,rElb:40,neckP:-44,roll:-14,lHand:1,rHand:1})],
 [1,posed({dx:2.2,air:0,pitch:84,roll:-40,lean:-6,lHipF:24,lKnee:74,rHipF:6,rKnee:34,lShF:118,rShF:92,lShA:62,rShA:42,lElb:70,rElb:60,neckP:-28})],
];
const J_DOWN=keyPoses(1,TUMBLE);
function jairState(T:number):St{
 if(T<T_CONTACT){const st=runState(JAIR_KEYS,T);
  // head over the ball on the dribble, a last touch with the right foot as he enters the box
  let pose=blendPose(st.pose,dribble(strideAt(JAIR_KEYS,T)*.9/3.9,{foot:'r',speed:.9}),.55);
  pose=blendPose(pose,strike(clamp((T-5.95)/.8+STRIKE_CONTACT),{power:.25}),win(T,5.7,6.3,.2));
  return{pose,place:st.place};}
 const place=placeOf(J_C[0],J_C[1],yawTo(J_H,J_FALL,sm(T_CONTACT,T_CONTACT+.3,T)));
 if(T<T_CONTACT+.85){const run=runState(JAIR_KEYS,T_CONTACT).pose,u=(T-T_CONTACT)/.85;return{pose:blendPose(run,keyPoses(u,TUMBLE),sm(0,.12,u)),place};}
 // on the grass, then back up (kneel → stand), jogging back a few steps
 const u=clamp((T-9.6)/1.3),kneel=posed({dx:2.2,lHipF:80,lKnee:110,rHipF:10,rKnee:118,rAnk:40,lean:34,lShA:30,rShA:30,lShF:20,rShF:30,lElb:50,rElb:50,neckP:10});
 const pose=u<=0?J_DOWN:keyPoses(u,[[0,J_DOWN],[.5,kneel],[1,{...stand(),dx:2.2}]]);
 return{pose,place:placeOf(J_C[0],J_C[1],yawTo(J_FALL,nrm2(1,.2),sm(10.3,11,T)))};
}
function banksState(T:number):St{const[x,z]=trackAt(BANKS_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='moore')return mooreState(T);if(id==='jair')return jairState(T);if(id==='banks')return banksState(T);
 const k=TR(id).keys;
 if(id==='e-recv'&&T>PASS_AT-.6){const st=runState(k,T),b=ballAt(T),p=trackAt(k,T);return{...st,place:placeOf(p[0],p[1],nrm2(b[0]-p[0],b[2]-p[1]))};}
 return runState(k,T);
}
const HEROES=['moore','jair'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'banks'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='banks'?BANKS:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='moore'&&T>T_SLIDE&&T<T_SLID-.2)||(id==='jair'&&T>T_CONTACT&&T<T_CONTACT+.6)||(id==='moore'&&Math.abs(T-PASS_AT)<.25);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(T>T_CONTACT-.3&&T<T_CONTACT+.4?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the side, panning with Jairzinho's break, Moore tracking back, into the box, the tackle. */
const MAIN_CAM:V3=[52.5,24,-40];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-1.6],[q[1],0],[q[2],1.9],[q[3],3.5],[q[4],5.6],[q[5]+.25,T_CONTACT],[S,T_CONTACT+1.35]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-1.6,T-.3)),tx=clamp(b[0]-4,11,58),tz=lerp(30,34,sm(3,6.5,T)),F=lerp(5600,8200,sm(0,6.4,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[5]+.4;},
};
/** 2 · TV slow-motion replay from a low touchline camera: Moore waits, and waits; then the slide, the right boot on the ball. */
const LOW_CAM:V3=[17.5,1.6,30];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,3.9],[q[1],4.7],[q[2],5.85],[q[3],T_SLIDE+.02],[q[4]+.35,T_CONTACT],[S,T_CONTACT+.42]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(MOORE_KEYS,Math.min(T,T_SLIDE)),j=trackAt(JAIR_KEYS,Math.min(T,T_CONTACT)),tx=lerp((m[0]+j[0])/2,BALL_T[0]+.6,sm(5.8,6.7,T)),F=lerp(1700,2400,sm(4.4,6.75,T,easeInOutSine));
 return camAt(LOW_CAM,[tx,.85,lerp(39,BALL_T[1],sm(5.8,6.7,T))],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.4;},
};
/** 3 · the second replay, from the high camera behind England's goal: Jairzinho tumbles over, clean, Moore up and away with the ball. */
const BEHIND:V3=[-9,4.6,34];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_CONTACT-.25],[q[1],T_CONTACT+.75],[q[2],7.4],[q[3],7.7],[q[4],8.45],[S,10.1]]);};
const cam3=(t:number)=>{const T=t3(t),m=mooreState(T).place,tx=lerp(BALL_T[0]+1,m.x!+2.5,sm(8,10,T)),tz=lerp(BALL_T[1]-.5,-m.z!-1,sm(8,10,T)),F=lerp(4200,3300,sm(7.8,10,T,easeInOutSine));
 return camAt(BEHIND,[tx,.8,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.3;},
};
/** 4 · the lesson plate: the action again from a raised camera on the near side, with bold yellow teaching marks — the gap Moore keeps
 * (be patient), his run back goalside of Jairzinho (run back), his eye-line to the ball (watch the ball), the slide stamped at the ball
 * (time your tackle), a clean tick (win it cleanly) and the pass out to a team-mate (pass it out). */
const LESSON_CAM:V3=[24,5.5,24];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,4.3],[q[2],4.3],[q[3],5.7],[q[4],6.1],[q[4]+1.2,T_CONTACT+.08],[q[5]+.2,T_CONTACT+.08],[q[6]-.1,9.9],[S-.8,PASS_TO+.35]]);};
const PASS_MID:[number,number]=(()=>{const a=trackAt(MOORE_OUT,PASS_AT),b=trackAt(RECV,PASS_TO);return[lerp(a[0],b[0],.56),lerp(a[1],b[1],.56)];})();
const cam4=(t:number)=>{const T=t4(t),m=mooreState(Math.min(T,PASS_AT)).place,j=trackAt(JAIR_KEYS,Math.min(T,T_CONTACT)),both=1-sm(6.2,T_CONTACT,T),mx=lerp(m.x!,(m.x!+j[0])/2,both),mz=lerp(-m.z!,(-m.z!+j[1])/2,both),u=sm(8.2,10.4,T,easeInOutSine);
 const pos:V3=[lerp(LESSON_CAM[0],23,u),lerp(LESSON_CAM[1],10,u),lerp(LESSON_CAM[2],15,u)];return camAt(pos,[lerp(mx+.5,PASS_MID[0],u),.4,lerp(mz+.3,PASS_MID[1],u)],lerp(lerp(2000,2600,1-both),1650,u));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  // "That tackle by Moore": a yellow ring on the grass round the captain (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.2,q[1]+.6,t));
  if(hal>.01){const m=mooreState(T).place,mx=m.x!,mz=-m.z!,r=1.1*hal,out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(mx+Math.cos(a)*r,mz+Math.sin(a)*r,c));inn.push(G(mx+Math.cos(a)*r*.72,mz+Math.sin(a)*r*.72,c));}
   stadium(s,c);const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);drawPlay(s,T,c,{ballScale:1.5,only:['moore','jair','e-recv','banks','ball'],noStadium:true});}
  else drawPlay(s,T,c,{ballScale:1.5,only:['moore','jair','e-recv','banks','ball']});
  // "Be patient": the gap he keeps — a double-headed bar on the grass between Moore and Jairzinho (don't dive in)
  const gap=sm(q[1],q[1]+.35,t,easeOutBack)*(1-sm(q[4]-.2,q[4]+.2,t));
  if(gap>.01&&T<T_SLIDE){const m=trackAt(MOORE_KEYS,T),j=trackAt(JAIR_KEYS,T),a=G(m[0],m[1],c),b=G(j[0],j[1],c),w=Math.max(12,.2*P3([m[0],0,m[1]],c)[2])*gap;
   const mid:Pt=[(a[0]+b[0])/2,(a[1]+b[1])/2],sa:Pt=[lerp(mid[0],a[0],gap),lerp(mid[1],a[1],gap)],sb:Pt=[lerp(mid[0],b[0],gap),lerp(mid[1],b[1],gap)];
   arrow(s,mid,sa,w,21);arrow(s,mid,sb,w,22);}
  // "run back": Moore's path goalside and inside Jairzinho, printed behind him as he goes
  if(t>=q[2]-.1){const T0=0,T1=Math.min(T,T_SLIDE),pts:Pt[]=[];for(let u=T0;u<=T1+.001;u+=.2){const m=trackAt(MOORE_KEYS,u);pts.push(G(m[0],m[1],c));}
   const fade=1-sm(q[5]-.3,q[5]+.3,t);if(pts.length>1&&fade>0){const w=Math.max(12,.22*P3([SLIDE_AT[0],0,SLIDE_AT[1]],c)[2]);const path=ribbon(pts,w,{seed:31,taper:.3,wobble:1});s.stroke(K,path,5,.9*fade);s.knockout(path,fade);s.fill(Y,path,.95*fade);}}
  // "watch the ball": a dashed eye-line from Moore's head to the ball, and a ring round the ball
  const eye=win(t,q[3]-.1,q[5],.3);
  if(eye>0&&T<T_CONTACT+.1){const st=mooreState(T),sk=solve(st.pose,MOORE.build,st.place,FIG),h=toMy(sk.head),b=ballAt(T),hp=P3(h,c),bp=P3(b,c),dash=new Path2D();
   for(let i=0;i<9;i++){const u0=i/9+.02,u1=u0+.06;if(u1>eye)break;dash.addPath(ribbon([[lerp(hp[0],bp[0],u0),lerp(hp[1],bp[1],u0)],[lerp(hp[0],bp[0],u1),lerp(hp[1],bp[1],u1)]],Math.max(9,.09*bp[2]),{seed:40+i,taper:0}));}
   mark(s,dash);const r=Math.max(14,.3*bp[2])*eye,ring=new Path2D();ring.arc(bp[0],bp[1],r,0,TAU);ring.arc(bp[0],bp[1],r*.72,0,TAU,true);mark(s,ring);}
  // "time your tackle": the slide stamped as a yellow ghost at the contact frame, a burst at the ball
  const stamp=sm(q[4]+.9,q[4]+1.25,t,easeOutBack);
  if(stamp>.002&&t<q[6]){const bp=P3([BALL_T[0],.11,BALL_T[1]],c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   if(t>q[4]+1.25&&t<q[5]+.2)drawPlayer(s,SLIDE(.42),c,GHOST,SLIDE_PLACE);}
  // "Win it cleanly": a tick stamped by the ball
  const tick=sm(q[5],q[5]+.4,t,easeOutBack)*(1-sm(q[6]+.6,q[6]+1,t));
  if(tick>.01){const bp=P3([BALL_REST[0],.2,BALL_REST[1]],c),k=.9*bp[2]*tick,x=bp[0]+.8*bp[2],y=bp[1]-1.1*bp[2];
   mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(tick),{seed:71,taper:.15}));}
  // "pass it out": the ball's path to the team-mate, drawn ahead of the ball
  const pass=sm(q[6]-.2,q[6]+.9,t,easeInOutSine);
  if(pass>0){const a=ballAt(PASS_AT),b=trackAt(RECV,PASS_TO+.1),A=G(a[0],a[2],c),Bq=G(b[0],b[1],c);arrow(s,A,Bq,Math.max(12,.2*P3(a,c)[2]),81,pass);}
  frame(s);
 },
 get still(){return Q(3)[6]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'moore-tackle-1970',format:'11v11',title:'That tackle by Moore',theme:'Be patient, then time your tackle',
 ageNote:'England v Brazil · World Cup, 7 June 1970 · Guadalajara, Mexico',
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
/** Solved contact points (pitch metres; England's goal line at X=0, Z across) — checked by tests/play-film-moore-tackle-1970.cjs. */
export const FACTS={BALL_T,BALL_REST,J_C,SLIDE_AT,T_CONTACT,ballAt,
 /** Moore's right toe at the contact frame (my metres) */
 /** mid-sole of each boot at the contact frame (my metres) */
 rightFoot:()=>{const sk=solve(SLIDE(.42),MOORE.build,SLIDE_PLACE,FIG),a=toMy(sk.rToe),b=toMy(sk.rHeel);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];},
 leftFoot:()=>{const sk=solve(SLIDE(.42),MOORE.build,SLIDE_PLACE,FIG),a=toMy(sk.lToe),b=toMy(sk.lHeel);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];},
 jairAt:(T:number)=>{const st=jairState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 mooreAt:(T:number)=>{const st=mooreState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
