/** Iconic-play film · Peter Schmeichel, signature "the star-jump save" — Greece v Denmark, the last game of 1998 World Cup qualifying
 * (UEFA Group 1), 1997. (The film id keeps the registry's "1996"; the moment it recreates is from 1997 — see WHY THIS MOMENT.)
 *
 * WHY THIS MOMENT: Schmeichel's entry in lib/town/iconicPlays.json is a signature (kind "signature"): the star jump — arms and legs spread
 * wide to cover the goal from close range. The film needed ONE real, written-up moment of that move. His own account (FourFourTwo, below)
 * names it: "my most important save ... for Denmark against Greece in the final qualifying game for the 1998 World Cup. At 0-0 in the last
 * minute, we were going straight through, but if they scored we would have to go into a difficult play-off. At that point a Greek player got
 * clean through and went one-on-one with me. I just spread myself, saved it and we went to the World Cup." In the same interview he explains
 * the star jump (from handball): it helps you "cover as much of the goal as possible" when a chance is too close to react to.
 * The brief's suggestion, the save v Rapid Vienna (4 Dec 1996), was NOT used: every account of it (Daily Mirror 5 Dec 1996 via search
 * snippets, Yahoo "five greatest saves", Schmeichel himself) describes a reaction dive back across goal to a downward René Wagner header,
 * compared to Banks v Pelé — not a star jump. Filming it as one would have been a false recreation.
 *
 * SOURCES (read 23 Sep 2026; cached under scratchpad/films/src-cache/):
 *  - FourFourTwo, "Peter Schmeichel: One-on-One" (Sam Pilger, 1 Aug 2003)  https://www.fourfourtwo.com/features/peter-schmeichel-one-one
 *  - Wikipedia, "Peter Schmeichel" (raw): trademark "star jump" saves, a technique from handball
 *    https://en.wikipedia.org/wiki/Peter_Schmeichel
 *  - goaltell.com, "7 Heroic Moments That Elevated Peter Schmeichel..." (star jump from handball, used one-on-one)
 *  - Rapid Vienna check (not used): thefreelibrary.com Daily Mirror snippets "THE LIONS OF VIENNA" / "THE GREATEST SAVE EVER!" (search
 *    result text only, the pages returned 403); uk.sports.yahoo.com "Banks, Schmeichel, Seaman: The five greatest saves of all time".
 * CONFIRMED by those accounts: Denmark v Greece, the final qualifying game for the 1998 World Cup; 0–0 in the last minute; a draw sent
 * Denmark straight through, a Greek goal would have meant a play-off; a Greek player got clean through, one-on-one with Schmeichel; he
 * "spread" himself and saved it; Denmark went to the World Cup. The star jump = arms and legs spread wide to cover the goal (handball).
 * INFERRED (illustrative, not in the accounts): the exact date (11 October 1997, from memory — not fetched) and the venue (Athens — not
 * fetched; the narration names neither); the Greek striker's identity (unnamed on purpose), the build-up (a through ball from midfield),
 * every position, path and timing, where the shot hit him (his lower leg here) and where the ball went (wide, behind for a corner), which
 * foot shot (right), the kits (Denmark red shirts, white shorts, red socks; Greece blue, as the 2001 Greece film prints them;
 * Schmeichel in a yellow keeper shirt, navy shorts, number 1), the stadium shape, the crowd's colours, the day light, the camera placements.
 * The narration says only what is confirmed plus the lesson.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; no top-down shots): 1 = live, the high main-stand
 * camera panning with the last attack (through ball, clean through, the star, the block), real time; 2 = TV slow-motion replay from a low
 * touchline camera: Schmeichel races off his line to close the striker down; 3 = second replay angle from behind the goal: the star jump
 * and the block, very slow; 4 = the lesson from the striker's eye line (the only chapter with teaching marks: the step out, the star
 * stamped round his hands and feet, the ball blocked). Bodies: the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter,
 * drawPlayer(). Scenes read only their local time t; every action keys off cue times, so the recorded voice (withTiming) re-times the film;
 * nothing is random (wobble is seeded). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,partial,smoothPts,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,runCycle,stand,strike,keeperSet,posed,keyPoses,dribble,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'Last minute, live',text:'Nineteen ninety-seven, Denmark against Greece. Nil-nil, last minute: a draw sends Denmark to the World Cup. Suddenly a Greek striker is clean through on Peter Schmeichel!',seconds:13.4,
  cues:[[.1,'Nineteen ninety-seven'],[1.9,'Denmark against Greece'],[3.7,'Nil-nil'],[4.6,'last minute'],[5.7,'a draw sends'],[8.3,'Suddenly'],[9.3,'clean through'],[10.3,'Peter Schmeichel']]},
 {label:'Watch again',text:'Watch again, slowly. Schmeichel races off his line to get close to him.',seconds:7,
  cues:[[.1,'Watch again'],[.9,'slowly'],[1.8,'Schmeichel races'],[3,'off his line'],[4.2,'get close']]},
 {label:'The star jump',text:'From behind the goal: he jumps into a giant star, arms and legs wide, and blocks the shot!',seconds:8,
  cues:[[.1,'From behind the goal'],[1.7,'he jumps'],[2.5,'giant star'],[3.5,'arms and legs wide'],[5.2,'and blocks the shot']]},
 {label:'Your turn',text:'Denmark are off to the World Cup! Your turn: when a striker gets close, spread your arms and legs wide like a star to block the shot.',seconds:11.4,
  cues:[[.1,'Denmark are off'],[2.6,'Your turn'],[3.6,'striker gets close'],[5.1,'spread your arms and legs wide'],[7.4,'like a star'],[8.5,'block the shot']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py schmeichel-star-1996, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/schmeichel-star-1996/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-schmeichel-star-1996.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/schmeichel-star-1996/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('schmeichel: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

const K='navy',Y='yellow',R='red',B='blue';
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one shape union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). */
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

// ---------------------------------------------------------------- the stadium: stands with a blue-and-white home crowd, grass, markings, the goal
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-12,75],b:[150,75],out:[0,1]},    // far side (runs on past the corner: no gap above the goal from low angles)
 {a:[112,-40],b:[112,110],out:[1,0]},   // behind Denmark's goal (runs on past the corner so a low touchline camera sees no gap)
 {a:[-12,-7],b:[117,-7],out:[0,-1]},   // main stand (the side camera sits in it)
 {a:[-7,-10],b:[-7,78],out:[-1,0]},    // the far end
];
const TIER_INK:[string,number][]=[[B,.32],[K,.2],[B,.55],[Y,.2],[B,.2],[R,.2],[K,.32],[B,.4]];
function stadium(s:Sheet,c:Cam,bounce=0){
 const concrete=new Path2D(),wall=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,44,1.2+44*.55),P(0,44,1.2+44*.55)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  const segs=16;for(let k=0;k<26;k++){const d0=1+k*1.62,d1=d0+1.28,lift=bounce*(k%2?.25:.45),y0=1.2+d0*.55+lift,y1=1.2+d1*.55+lift;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 s.fill(Y,concrete,.2);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(R,wall,.28);s.fill(Y,wall,.5);s.stroke(K,wall,Math.max(2,.05*P3([100,0,34],c)[2]),.6);
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const z of[0,68]){const a=P3([105,0,z],c),b=P3([105,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([105,1.42,z+(z?-.5:.5)],c),g=P3([105,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(R,fl);}
}
const GOAL={x:105,z0:30.34,z1:37.66,h:2.44,back:107,backH:2.0};
/** Denmark's goal: white posts and bar, a net (paper haze + navy mesh) back to the stanchions. */
function goal(s:Sheet,c:Cam){
 const g=GOAL,net=new Path2D();
 addPoly(net,[[g.x,0,g.z0],[g.back,0,g.z0],[g.back,g.backH,g.z0],[g.x,g.h,g.z0]],c);addPoly(net,[[g.x,0,g.z1],[g.back,0,g.z1],[g.back,g.backH,g.z1],[g.x,g.h,g.z1]],c);
 addPoly(net,[[g.back,0,g.z0],[g.back,0,g.z1],[g.back,g.backH,g.z1],[g.back,g.backH,g.z0]],c);addPoly(net,[[g.x,g.h,g.z0],[g.x,g.h,g.z1],[g.back,g.backH,g.z1],[g.back,g.backH,g.z0]],c);
 s.knockout(net,.32);
 const k0=P3([g.x,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
 for(let z=g.z0;z<=g.z1+.01;z+=sp){seg([g.back,0,z],[g.back,g.backH,z]);seg([g.x,g.h,z],[g.back,g.backH,z]);}
 for(let y=0;y<=g.backH+.01;y+=sp){seg([g.back,y,g.z0],[g.back,y,g.z1]);for(const z of[g.z0,g.z1])seg([g.x,y*g.h/g.backH,z],[g.back,y,z]);}
 for(let x=g.x;x<=g.back+.01;x+=sp)for(const z of[g.z0,g.z1])seg([x,0,z],[x,lerp(g.h,g.backH,(x-g.x)/(g.back-g.x)),z]);
 s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(5,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([g.x,0,g.z0],[g.x,g.h,g.z0]));fr.addPath(post([g.x,0,g.z1],[g.x,g.h,g.z1]));fr.addPath(post([g.x,g.h,g.z0-.06],[g.x,g.h,g.z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
 const stan=new Path2D();for(const z of[g.z0,g.z1]){const a=P3([g.back,0,z],c),b=P3([g.back,g.backH,z],c),d=P3([g.x,g.h,z],c);if(a[2]>0&&b[2]>0&&d[2]>0){stan.moveTo(a[0],a[1]);stan.lineTo(b[0],b[1]);stan.lineTo(d[0],d[1]);}}
 s.stroke(K,stan,Math.max(2,.03*k0),.7);
}

// ---------------------------------------------------------------- figures: the shared athlete library, ONE adapter
/** athlete.ts is right-handed (y up); this pitch (X to Denmark's goal, Z away from the main camera) is left-handed, so the adapter negates z
 * both ways — that keeps every right foot a right foot. */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** Every body in the film goes through here: optional speed smear first, then the athlete. */
function drawPlayer(s:Sheet,st:St,cam:Cam,style:AthleteStyle,prev?:St,smear=false){
 const pc=proj(cam);
 if(smear&&prev)motionSmear(s,prev.pose,st.pose,pc,style,st.place,{prevPlace:prev.place,ink:[K,.35]});
 return drawAthlete(s,st.pose,pc,style,st.place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
const denmark=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:'paper',socks:R,boots:K,skin:SKIN_L,hair:[Y,.6],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
const greece=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:B,socks:B,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Schmeichel: 1.91 m, big frame, short fair hair, number 1 (keeper kit colours inferred) */
const PETER:AthleteStyle={shirt:[Y,.95],trim:K,shorts:K,socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.55],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',
 number:1,numberInk:K,build:{height:1.91,bulk:1.1},scale:FIG,seed:1};
/** the lesson's teaching marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],gloves:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'long',build:{height:1.91,bulk:1.1},scale:FIG,seed:1};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the star jump (authored on athlete.ts's keyPoses)
/** starJump(t): set → load (.25) → spring up and out (.42) → FULL STAR (.55: arms up and out, legs wide, facing the shot, palms open)
 * → coming down (.72) → land wide and low (.88) → recover (1). Upright, square to the ball: he makes himself as big as the goal. */
const STAR_PEAK=.55;
function starJump(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,keeperSet(0)],
  [.25,posed({lHipF:64,rHipF:64,lHipA:22,rHipA:22,lKnee:92,rKnee:92,lAnk:-14,rAnk:-14,lean:30,pitch:8,lShF:26,rShF:26,lShA:52,rShA:52,lElb:40,rElb:40,lShR:20,rShR:20,lHand:1,rHand:1,neckP:6})],
  [.42,posed({air:.16,lHipF:16,rHipF:16,lHipA:36,rHipA:34,lKnee:16,rKnee:18,lAnk:34,rAnk:34,lean:10,pitch:4,lShF:22,rShF:22,lShA:104,rShA:100,lElb:14,rElb:14,lShR:10,rShR:10,lHand:1,rHand:1,neckP:6})],
  [STAR_PEAK,posed({air:.3,lHipF:8,rHipF:12,lHipA:50,rHipA:46,lKnee:6,rKnee:10,lAnk:28,rAnk:26,lean:6,pitch:2,lShF:16,rShF:16,lShA:126,rShA:122,lElb:6,rElb:8,lShR:8,rShR:8,lHand:1,rHand:1,neckP:10})],
  [.72,posed({air:.12,lHipF:12,rHipF:14,lHipA:40,rHipA:36,lKnee:16,rKnee:18,lAnk:20,rAnk:20,lean:10,pitch:3,lShF:22,rShF:22,lShA:110,rShA:106,lElb:12,rElb:12,lHand:1,rHand:1,neckP:8})],
  [.88,posed({lHipF:36,rHipF:36,lHipA:28,rHipA:26,lKnee:56,rKnee:54,lAnk:-4,rAnk:-4,lean:18,pitch:4,lShA:80,rShA:78,lShF:30,rShF:30,lElb:24,rElb:26,lHand:1,rHand:1,neckP:2})],
  [1,posed({lHipF:42,rHipF:42,lHipA:20,rHipA:20,lKnee:58,rKnee:58,lean:22,pitch:6,lShA:46,rShA:46,lShF:40,rShF:40,lElb:52,rElb:52,lHand:.8,rHand:.8,neckP:-4})],
 ];
 const p=keyPoses(clamp(t),keys),Q:[number,number][]=[[0,0],[.25,-.08],[.42,.08],[STAR_PEAK,.06],[.72,.02],[.88,-.09],[1,-.03]];
 let v=0;for(let i=0;i+1<Q.length;i++){const[a,va]=Q[i],[b,vb]=Q[i+1];if(t>=a&&t<=b){const u=(t-a)/(b-a);v=va+(vb-va)*u*u*(3-2*u);break;}}if(t>1)v=Q[Q.length-1][1];
 p.squash=clamp(v,-.3,.3);return p;
}

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = the through ball)
type Track={id:string;style:AthleteStyle;keys:number[][]};
const T_SHOT=2.4,T_J0=2.02,J_DUR=1.0,T_CONTACT=T_J0+STAR_PEAK*J_DUR,T_RECEIVE=1.35;
const TRACKS:Track[]=[
 {id:'passer',style:greece({number:8,seed:8}),keys:[[-8,57,46],[-3,63.6,42.4],[-.5,68.3,39.8],[0,68.9,39.5],[1.4,70.6,38.8],[5,72.5,37.6]]},
 {id:'striker',style:greece({number:null,seed:9,build:{height:1.84}}),keys:[[-8,72,29],[-3,76.5,29.6],[0,80.3,31.4],[T_RECEIVE,90.8,33.6],[2.1,93.4,34],[T_SHOT,94.4,34.1],[3.2,96.1,34.4],[5,96.8,33.2]]},
 {id:'cb1',style:denmark({number:4,seed:4,hair:[Y,.45]}),keys:[[-8,86,37],[-3,84.4,36],[0,83.2,35.4],[T_RECEIVE,88.4,35.2],[T_SHOT,92.6,35.3],[3.2,94.4,35.6],[5,95.6,36.4]]},
 {id:'cb2',style:denmark({number:3,seed:3,hair:[K,.7]}),keys:[[-8,86.5,27],[-3,85.2,28.2],[0,84.4,29],[T_RECEIVE,89,31],[T_SHOT,92.2,32.4],[3.2,93.8,32.8],[5,95,32]]},
 // the rest of both teams: positions are illustrative (not in the accounts)
 {id:'dk-rb',style:denmark({number:2,seed:12}),keys:[[-8,82,14],[0,80.5,18],[3,86,22],[5,89,23]]},
 {id:'dk-lb',style:denmark({number:5,seed:15}),keys:[[-8,82,52],[0,80,49],[3,85.5,45],[5,88,44]]},
 {id:'dk-m1',style:denmark({number:6,seed:16}),keys:[[-8,64,40],[0,66,41.5],[3,76,39],[5,80,38]]},
 {id:'dk-m2',style:denmark({number:10,seed:17,hair:[K,.6]}),keys:[[-8,62,28],[0,64,31],[3,73,32],[5,77,33]]},
 {id:'gr-w1',style:greece({number:7,seed:21}),keys:[[-8,70,18],[0,74,20],[3,83,22],[5,86,23]]},
 {id:'gr-w2',style:greece({number:11,seed:22}),keys:[[-8,68,55],[0,73,52],[3,82,47],[5,85,46]]},
];
const PETER_KEYS=[[-8,103.8,34.6],[0,103.6,34.2],[.3,103.3,34.1],[1.95,98.55,34.1],[T_J0,98.45,34.1]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-8);for(let t=-7.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** the passer and the striker strike with the RIGHT boot: the solved toe is where the ball leaves */
const toeAt=(id:string,T:number):V3=>{const st=runState(TR(id).keys,T),sk=solve(strike(STRIKE_CONTACT),TR(id).style.build,st.place,FIG),t=toMy(sk.rToe);return[t[0],.11,t[2]];};
const PASS_FROM=toeAt('passer',0),SHOT_FROM=toeAt('striker',T_SHOT);
/** the first touch: half a metre ahead of the striker's run when the pass arrives */
const RECEIVE:V3=(()=>{const p=trackAt(TR('striker').keys,T_RECEIVE),v=velAt(TR('striker').keys,T_RECEIVE),[dx,dz]=nrm2(v[0],v[1]);return[p[0]+dx*.55,.11,p[1]+dz*.55];})();

/** Schmeichel: set on his line, races out, sets, THE STAR, lands, (the lesson and later: he stands up). Facing the play (−X). */
const PETER_AT:[number,number]=[PETER_KEYS[PETER_KEYS.length-1][1],PETER_KEYS[PETER_KEYS.length-1][2]];
function peterState(T:number):St{
 if(T<T_J0){const k=PETER_KEYS,p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);
  const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-1.5)/5)}),set=keeperSet(T*1.4);
  const pose=T<.3?set:blendPose(set,run,clamp((sp-.4)/1.6));return{pose,place:placeOf(p[0],p[1],[-1,0])};}
 let pose=starJump((T-T_J0)/J_DUR);
 if(T>T_J0+J_DUR+.3)pose=blendPose(pose,stand(),sm(T_J0+J_DUR+.3,T_J0+J_DUR+1.1,T,easeInOutSine));
 return{pose,place:placeOf(PETER_AT[0],PETER_AT[1],[-1,0])};
}
/** where the shot meets him: the middle of his left shin at the top of the star, a ball's radius toward the striker */
const CONTACT:V3=(()=>{const sk=solve(starJump(STAR_PEAK),PETER.build,placeOf(PETER_AT[0],PETER_AT[1],[-1,0]),FIG),kn=toMy(sk.lKn),an=toMy(sk.lAn);
 return[(kn[0]+an[0])/2-.14,Math.max(.25,(kn[1]+an[1])*.5),(kn[2]+an[2])/2] as V3;})();
/** it cannons off wide of the post on that side and runs behind for a corner (inferred) */
const SIDE=Math.sign(CONTACT[2]-PETER_AT[1])||1;
const OUT:V3=[104.6,.35,34+SIDE*8.2],REST:V3=[108.6,.11,34+SIDE*10.8];

const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
/** The ball in 3D at play time T: the passer's feet, the through ball, the striker's touches, the shot, off Schmeichel's leg, wide, behind. */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 const pk=TR('passer').keys,sk=TR('striker').keys;
 if(T<-.35)return ahead(pk,T,.6+.25*Math.abs(Math.sin(T*3.1)));
 if(T<0)return lerp3(ahead(pk,-.35,.6+.25*Math.abs(Math.sin(-.35*3.1))),PASS_FROM,sm(-.35,0,T));
 if(T<T_RECEIVE)return lerp3(PASS_FROM,RECEIVE,sm(0,T_RECEIVE,T,u=>u*(1.25-.25*u)));
 if(T<T_SHOT){const a=ahead(sk,T,.55+.35*Math.sin((T-T_RECEIVE)*5.5)**2);return lerp3(a,SHOT_FROM,sm(T_SHOT-.28,T_SHOT,T));}
 if(T<T_CONTACT)return lerp3(SHOT_FROM,CONTACT,sm(T_SHOT,T_CONTACT,T,linear),.12);
 if(T<T_CONTACT+.42)return lerp3(CONTACT,OUT,sm(T_CONTACT,T_CONTACT+.42,T,u=>u*(1.3-.3*u)),.9);
 const u=sm(T_CONTACT+.42,T_CONTACT+2.2,T,easeOut);return[lerp(OUT[0],REST[0],u),.11+.35*Math.abs(Math.sin(u*Math.PI*1.5))*(1-u),lerp(OUT[2],REST[2],u)];
}

// ---------------------------------------------------------------- the players at play time T
function stateOf(id:string,T:number):St{
 const tr=TR(id),k=tr.keys;
 if(id==='passer'){const st=runState(k,T),w=win(T,-.5,.55);return w>0?{...st,pose:blendPose(st.pose,strike(clamp(T/1.0+STRIKE_CONTACT),{power:.7}),w)}:st;}
 if(id==='striker'){
  const face:[number,number]|undefined=T>T_SHOT+.5?nrm2(REST[0]-trackAt(k,T)[0],REST[2]-trackAt(k,T)[1]):undefined,st=runState(k,T,face);
  if(T>T_RECEIVE-.3&&T<T_SHOT-.35){const ph=strideAt(k,T)*.9/4.3,d=dribble(ph,{foot:'r',speed:.9});return{...st,pose:blendPose(st.pose,d,win(T,T_RECEIVE-.3,T_SHOT-.35,.2))};}
  const w=win(T,T_SHOT-.5,T_SHOT+.75);let pose=w>0?blendPose(st.pose,strike(clamp((T-T_SHOT)/.9+STRIKE_CONTACT)),w):st.pose;
  // hands to the head as it goes wide (inferred)
  if(T>T_SHOT+.8)pose=blendPose(pose,posed({lShF:150,rShF:150,lShA:40,rShA:40,lElb:120,rElb:120,lean:-6,neckP:-20,lKnee:10,rKnee:10}),sm(T_SHOT+.8,T_SHOT+1.3,T)*(1-sm(T_SHOT+2.6,T_SHOT+3.2,T)));
  return{pose,place:st.place};}
 return runState(k,T);
}

type Item={depth:number;draw:()=>void};
const HEROES=['striker','cb1','cb2','peter'];
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goal in depth order (far first). */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;bounce?:number;only?:string[];wide?:boolean;noPeter?:boolean}={}){
 stadium(s,c,o.bounce??0);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id).filter(id=>!o.only||o.only.includes(id)),...(o.noPeter?[]:['peter'])];
 for(const id of ids){const fn=(t:number)=>id==='peter'?peterState(t):stateOf(id,t),st=fn(T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g))continue;
  const style=id==='peter'?PETER:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='peter'&&T>T_J0+.2&&T<T_J0+.8)||(id==='striker'&&T>T_SHOT-.2&&T<T_SHOT+.25);
  items.push({depth:1/g[2],draw:()=>{drawPlayer(s,st,c,sty,fn(T-1/12),fast&&hero);}});}
 const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  const near=T>T_SHOT&&T<T_CONTACT+.3;// at the block the ball prints over the keeper's leg in every view
  items.push({depth:near?0:1/bq[2],draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:T*6,key:K,shadow:B,seed:3});}});}
 const gq=P3([106,1.2,34],c);if(gq[2]>0)items.push({depth:1/gq[2],draw:()=>goal(s,c)});
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
 // the block: a burst where the ball meets his leg (footage chapters: a quick flash of impact, no teaching marks)
 const hit=win(T,T_CONTACT-.01,T_CONTACT+.2,.05);if(hit>0){const q=P3(CONTACT,c);if(onScreen(q))sparkBurst(s,Y,q[0],q[1],.55*q[2],{n:9,seed:41,g:hit,width:.05*q[2]});}
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main-stand camera panning with the last attack — the through ball, clean through, the star, the block. */
const MAIN_CAM:V3=[52.5,24,-40];
const t1=(t:number)=>warp(t,[[0,-7.4],[CUEW(0,'Suddenly'),0],[CUEW(0,'Peter')+.55,T_CONTACT],[SECS(0),T_CONTACT+1.6]]);
function cam1(t:number){const T=t1(t);let bx=0;for(let k=0;k<5;k++)bx+=ballAt(T-.25-k*.12)[0]/5;
 const tx=clamp(lerp(bx+3,100,sm(1.2,2.4,T,easeInOutSine)),60,100),tz=lerp(36,33.5,sm(-1,2,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],lerp(lerp(4300,5600,sm(-.8,1.4,T,easeInOutSine)),9400,sm(1.4,2.5,T,easeInOutSine)));}
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3([PETER_AT[0],1,PETER_AT[1]],cam1(t));return apertureDisc(p[0],p[1],Math.max(8,.9*p[2]),12);},
 get still(){return CUEW(0,'Peter')+.55;},
};
/** 2 · TV slow-motion replay from a low touchline camera level with the box: Schmeichel races off his line toward the striker. */
const LOW_SIDE:V3=[97.2,1.7,13];
const t2=(t:number)=>warp(t,[[0,.15],[CUEW(1,'Schmeichel'),.45],[CUEW(1,'get close')+.9,1.95],[SECS(1),2.06]]);
const cam2=(t:number)=>{const T=t2(t),px=trackAt(PETER_KEYS,Math.min(T,T_J0))[0],sx=trackAt(TR('striker').keys,T)[0];
 return camAt(LOW_SIDE,[lerp(px-1.5,lerp(px,sx,.5),sm(.9,1.7,T,easeInOutSine)),.95,34],lerp(2500,2300,sm(0,SECS(1),t,easeInOutSine)));};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3([PETER_AT[0],1,PETER_AT[1]],cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.8*p[2]),12);},
 get still(){return CUEW(1,'get close')+.6;},
};
/** 3 · the second replay angle, from behind Denmark's goal: the star jump, square to the striker, and the block — very slow. */
const BEHIND:V3=[112.5,6.2,35.2];
const t3=(t:number)=>warp(t,[[0,1.95],[CUEW(2,'he jumps'),T_J0+.05],[CUEW(2,'giant'),T_J0+.4],[CUEW(2,'arms and legs'),T_SHOT],[CUEW(2,'and blocks'),T_CONTACT-.02],[CUEW(2,'and blocks')+1.1,T_CONTACT+.14],[SECS(2),T_CONTACT+.4]]);
const cam3=(t:number)=>camAt(BEHIND,[97.6,.9,lerp(34.4,34.1,sm(0,SECS(2),t))],lerp(2700,3300,sm(0,CUEW(2,'arms'),t,easeInOutSine)));
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3([PETER_AT[0],1.1,PETER_AT[1]],cam3(t));return apertureDisc(p[0],p[1],Math.max(10,.9*p[2]),12);},
 get still(){return CUEW(2,'arms and legs')+.8;},
};
/** 4 · the lesson plate (not footage), from the striker's eye line: a halftone Schmeichel steps out along lit footprints (get close), springs
 * into the star (arms and legs wide), the star is stamped through his hands and feet (like a star), and the shot is blocked (block the shot). */
const LESSON_CAM:V3=[91.2,1.55,33.6];
const cam4=(t:number)=>camAt(LESSON_CAM,[100.5,1.25,lerp(34.3,34.1,sm(0,8,t))],lerp(1750,1850,sm(0,SECS(3),t,easeInOutSine)));
/** lesson play time: set on the line → the step out (get close) → the star (spread) → held → the block */
const t4=(t:number)=>warp(t,[[0,-.3],[CUEW(3,'Your turn'),.2],[CUEW(3,'striker'),.35],[CUEW(3,'striker')+1.3,T_J0],[CUEW(3,'spread'),T_J0+.08],[CUEW(3,'spread')+1.4,T_J0+.5],[CUEW(3,'block'),T_J0+.5],[CUEW(3,'block')+.5,T_CONTACT+.05],[SECS(3),T_CONTACT+.25]]);
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),cam=cam4(t),pc=proj(cam);frame(s);
  const rel=easeOutBack(sm(0,.6,t))*(1-.5*sm(2,3.2,t));
  drawPlay(s,T_CONTACT+3.8,cam,{ballScale:1.3,bounce:.6*Math.abs(Math.sin(t*6))*(1-sm(.3,2.6,t)),only:[],noPeter:true});
  // "Denmark are off to the World Cup!": sunlight bursting over the stand behind the goal, red-and-white confetti
  if(rel>0){const c0=P3([118,24,34],cam),rays=new Path2D();for(let i=0;i<14;i++){const a=i/14*TAU+t*.1,w=.08,Rr=2600*rel;rays.addPath(shape([[c0[0],c0[1]],[c0[0]+Math.cos(a-w)*Rr,c0[1]+Math.sin(a-w)*Rr],[c0[0]+Math.cos(a+w)*Rr,c0[1]+Math.sin(a+w)*Rr]]));}
   const top=P3([112,1.1,34],cam)[1];s.save();s.clip(polyPath([[-9e4,-9e4],[9e4,-9e4],[9e4,top],[-9e4,top]],true));s.tone(Y,rays,.45);s.restore();
   dust(s,R,0,-260,700*easeOut(clamp(t/1.6)),22,{seed:77,size:16,cov:.8*(1-sm(1.8,2.6,t))});}
  const T=t4(tt),g=peterState(T);
  // "gets close": footprints from his line to the spot light up in order as he steps out
  const qS=CUEW(3,'striker'),walk=sm(qS,qS+1.3,t,easeInOutSine),dim=new Path2D(),lit=new Path2D();
  for(let k=0;k<7;k++){const Tk=.4+k*.25,[x,z]=trackAt(PETER_KEYS,Tk),zz=z+(k%2?.22:-.22),pts:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU,p=P3([x+.25+Math.cos(a)*.3,.01,zz+Math.sin(a)*.14],cam);pts.push([p[0],p[1]]);}(k/6<=walk+.01?lit:dim).addPath(shape(pts));}
  if(t>=qS-.3){s.knockout(dim,.75);if(walk>0){s.stroke(K,lit,6,.9);s.knockout(lit);s.fill(Y,lit,.95);}}
  // "spread your arms and legs wide": four arrows push out from his hands and feet while he is in the star
  const qP=CUEW(3,'spread'),sp=sm(qP+.3,qP+1.2,t,easeOutBack);
  const body=drawPlayer(s,g,cam,t<qS-.3?{...PETER,detail:'high'}:GHOST,undefined,false);
  if(sp>.01){const j=body.joints,cx=(j.pelvis[0]+j.chest[0])/2,cy=(j.pelvis[1]+j.chest[1])/2;
   for(const e of[j.lHa,j.rHa,j.lAn,j.rAn]){const dx=e[0]-cx,dy=e[1]-cy,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,a0:Pt=[e[0]+ux*20,e[1]+uy*20],a1:Pt=[e[0]+ux*(20+95*clamp(sp)),e[1]+uy*(20+95*clamp(sp))];
    const path=ribbon([a0,a1],16,{seed:5,taper:.1,wobble:.8});s.stroke(K,path,5,.9);s.knockout(path);s.fill(Y,path,.95);
    if(sp>.6){const hl=38,a=Math.atan2(uy,ux),head=shape([[a1[0]+Math.cos(a)*hl*.7,a1[1]+Math.sin(a)*hl*.7],[a1[0]+Math.cos(a+2.4)*hl,a1[1]+Math.sin(a+2.4)*hl],[a1[0]+Math.cos(a-2.4)*hl,a1[1]+Math.sin(a-2.4)*hl]]);s.stroke(K,head,5,.9);s.knockout(head);s.fill(Y,head,.95);}}
   // "like a star": a five-point star printed through head, hands and feet
   const qL=CUEW(3,'like a star'),st=sm(qL,qL+.8,t,easeInOutSine);
   if(st>0){const outer:Pt[]=[j.head,j.rHa,j.rAn,j.lAn,j.lHa].map(p=>[p[0],p[1]]),ang=(p:Pt)=>Math.atan2(p[1]-cy,p[0]-cx);outer.sort((a,b)=>ang(a)-ang(b));
    // a five-point star outline: the points on head, hands and feet, the inner corners pulled toward his middle
    const star:Pt[]=[];for(let i=0;i<5;i++){const a=outer[i],b=outer[(i+1)%5];star.push(a);star.push([cx+((a[0]+b[0])/2-cx)*.42,cy+((a[1]+b[1])/2-cy)*.42]);}star.push(outer[0]);
    const dense:Pt[]=[];for(let i=0;i+1<star.length;i++)for(let k=0;k<8;k++)dense.push([lerp(star[i][0],star[i+1][0],k/8),lerp(star[i][1],star[i+1][1],k/8)]);dense.push(star[star.length-1]);const line=partial(dense,st);if(line.length>1){const path=ribbon(line,12,{seed:11,taper:0,wobble:1});s.stroke(K,path,5,.85);s.knockout(path);s.fill(Y,path,.95);}}}
  // "block the shot": the ball arrives low and hits the leg; burst + a rebound arrow out wide
  const qB=CUEW(3,'block');if(t>qB-.2){const bp=ballAt(T),bq=P3(bp,cam);if(onScreen(bq))footballPanels(s,bq[0],bq[1],Math.max(6,.12*bq[2]),{rot:T*6,key:K,shadow:B,seed:3});
   const hit=sm(qB+.45,qB+.75,t,easeOutBack);if(hit>0){const hp=P3(CONTACT,cam);sparkBurst(s,Y,hp[0],hp[1],.9*hp[2],{n:10,seed:61,g:clamp(hit),width:.06*hp[2]});
    const o=P3(OUT,cam),rb=partial(smoothPts([[hp[0],hp[1]],[lerp(hp[0],o[0],.5),lerp(hp[1],o[1],.5)-60],[o[0],o[1]]],false,6,2),sm(qB+.6,qB+1.4,t,easeInOutSine));
    if(rb.length>1){const path=ribbon(rb,.08*hp[2],{seed:9,taper:.2,wobble:1.2});s.stroke(K,path,5,.9);s.knockout(path);s.fill(Y,path,.95);}}}
  frame(s);
 },
 get still(){return SECS(3)*.8;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'schmeichel-star-1996',format:'11v11',title:'The star-jump save',theme:'Spread yourself like a star',
 ageNote:'Greece v Denmark · World Cup qualifier, 1997',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little star spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:5,seed,g,width:16});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; X to Denmark's goal line at 105, Z across) — checked by tests/play-film-schmeichel-star-1996.cjs. */
export const FACTS={CONTACT,SHOT_FROM,PASS_FROM,RECEIVE,OUT,GOAL,PETER_AT,T_SHOT,T_CONTACT,ballAt,starJump,peterState};
