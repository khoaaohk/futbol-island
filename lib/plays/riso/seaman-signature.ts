/** Iconic-play film · David Seaman, signature "the safe pair of hands" — Arsenal 1–0 Sheffield United, FA Cup semi-final, Sunday 13 April
 * 2003, Old Trafford, Manchester: the one-handed save from Paul Peschisolido's close-range header, six minutes from time.
 *
 * WHY THIS MOMENT: Seaman's entry in lib/town/iconicPlays.json is a signature (kind "signature"): "the safe pair of hands", lesson "get your
 * body behind the ball so that even if it slips, it doesn't go in". The film needed ONE real, written-up moment of those hands. This is the
 * save the BBC match report calls "astounding", that Peter Schmeichel called "the best save I've ever seen" ("He must have shovels on his
 * hands") and that Gary Lineker put "up there maybe with Gordon Banks". Seaman's own words describe the lesson exactly: "I just flung my
 * hand out and managed to get something on and BEHIND it to stop it travelling any further over the line." (Brief alternatives considered:
 * the Nadal penalty v Spain at Euro 96 — confirmed by Wikipedia but with no written detail of the dive, so not filmable 1:1.)
 *
 * SOURCES (read 23 Sep 2026; cached under scratchpad/films/src-cache/):
 *  - BBC Sport match report "Arsenal sink brave Blades" (13 Apr 2003)  http://news.bbc.co.uk/sport2/hi/football/fa_cup/2917575.stm
 *  - BBC Sport "Schmeichel leads Seaman praise" (13 Apr 2003) + its photo "Arsenal keeper David Seaman pulls off the fabulous save"
 *    http://news.bbc.co.uk/sport2/hi/football/fa_cup/2944701.stm  (photo: newsimg.bbc.co.uk/.../_39091111_seamansave203.jpg)
 *  - BBC photo "Lauren celebrates with Ljungberg" from the match report (Arsenal's kit that day)
 *  - Wikipedia "David Seaman" (raw) and "2002–03 FA Cup" (raw, semi-final box: 13 April 2003, Old Trafford, 59,170, referee Graham Poll)
 * CONFIRMED by those accounts: Arsenal 1–0 (Ljungberg 34'), Old Trafford, 13 April 2003, FA Cup semi-final; Seaman's 1,000th senior game,
 * aged 39; six minutes left; substitute Peschisolido "diverted Carl Asaba's shot towards goal" with a close-range header, "six yards out", to
 * "an apparently open goal", Seaman "seemingly stranded at the near post"; Seaman "leapt sideways and backwards", stretched his RIGHT arm
 * behind him and scooped the ball "back and away" off the line ("off balance, had to come back and get a touch to it" — Schmeichel); it was
 * Sheffield United's last chance and Arsenal went through to the final. Kits (the BBC photos): Arsenal in their gold change shirts with navy
 * collars and navy numbers, navy shorts; Seaman in a bright yellow keeper shirt, white gloves; Sheffield United in red-and-white striped
 * shirts with WHITE shorts and white socks; Sol Campbell (23) jumping beside the save; Blades fans in striped shirts behind that goal.
 * Seaman's trademark ponytail (worn until 2005) and his number 1.
 * INFERRED (illustrative, not in the accounts): which end and which side of the pitch (the shot from Sheffield United's right, so that the
 * near post is on Seaman's left and his right arm reaches back across the goal — consistent with the accounts, not stated), every position,
 * path and timing, the build-up (Asaba dribbling in from the right), which foot Asaba shot with (right) and that his shot was lifted, the
 * header height, the ball's exact path, who cleared the loose ball (an unnamed Arsenal defender), Arsenal's socks and Seaman's shorts and
 * socks, the stadium shape, crowd colours and the camera placements. The narration names only confirmed facts plus the lesson.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; no top-down shots): 1 = live, the high main-stand
 * camera panning with the attack down the right, the shot, the header, the save — real time; 2 = TV slow-motion replay, low from the far side
 * in front of the goal (the angle of the BBC photo): Seaman at his near post springs backwards and flings his right hand; 3 = second replay
 * angle from behind the goal, very slow: the glove gets behind the ball on the line and scoops it away, then the clearance; 4 = the lesson
 * (the only chapter with teaching marks): the body gets in line behind the ball, the ball slips through the hands, hits the body and stays
 * out. Bodies: the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Scenes read only their local time t;
 * every action keys off cue times, so the recorded voice (withTiming) re-times the film; nothing is random (wobble is seeded). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,partial,smoothPts,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,runCycle,stand,strike,header,keeperSet,keeperScoop,posed,keyPoses,dribble,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); every cue starts
 * with a plain word (Kokoro splits contractions and hyphenated words). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'Six minutes left, live',text:'April two thousand and three, FA Cup semi-final. Arsenal lead Sheffield United one-nil, six minutes left. Asaba shoots, and Peschisolido heads it towards an open goal!',seconds:12,
  cues:[[.1,'April'],[2.4,'Arsenal lead'],[4.9,'six minutes'],[6.5,'Asaba shoots'],[7.7,'Peschisolido heads'],[9.6,'open goal']]},
 {label:'Watch again',text:'Watch again, slowly. David Seaman is over at his near post, so he springs backwards and flings his right hand.',seconds:8.6,
  cues:[[.1,'Watch again'],[.9,'slowly'],[1.7,'David Seaman'],[3.5,'near post'],[4.7,'springs backwards'],[6,'flings his right hand']]},
 {label:'Behind the ball',text:'From behind the goal: his glove gets behind the ball on the line and scoops it away. Arsenal are through to the final!',seconds:10,
  cues:[[.1,'From behind the goal'],[1.7,'his glove'],[2.7,'behind the ball'],[3.9,'on the line'],[4.8,'scoops it away'],[6.4,'Arsenal are through']]},
 {label:'Your turn',text:'Safe hands! Your turn: get your body behind the ball, so even if it slips, it will not go in.',seconds:9.4,
  cues:[[.1,'Safe hands'],[1.2,'Your turn'],[2.1,'get your body'],[3.3,'behind the ball'],[4.9,'even if it slips'],[6.6,'will not go in']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py seaman-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/seaman-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-seaman-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/seaman-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('seaman: cue '+w);return c.at;};
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

// ---------------------------------------------------------------- Old Trafford: four stands of red-and-white Blades and red Arsenal fans, grass, markings, the goal
type Stand={a:[number,number];b:[number,number];out:[number,number]};
const STANDS:Stand[]=[
 {a:[-12,75],b:[150,75],out:[0,1]},    // far side
 {a:[112,-51],b:[112,110],out:[1,0]},   // behind Seaman's goal: the Sheffield United end in the BBC photo
 {a:[-12,-7],b:[156,-7],out:[0,-1]},   // main stand (the side camera sits in it)
 {a:[-7,-10],b:[-7,78],out:[-1,0]},    // the far end
 {a:[98,75],b:[112,61],out:[.7071,.7071]},// the filled corner between the far side and the Blades end (no sky gap from low angles)
];
/** red shirts and red-and-white stripes, with the odd yellow and navy (inferred colours, the Blades' stripes confirmed behind that goal) */
const TIER_INK:[string,number][]=[[R,.55],[K,.2],[R,.3],[Y,.22],[B,.18],[R,.45],[K,.3],[R,.2]];
function stadium(s:Sheet,c:Cam,bounce=0){
 const concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),tiers=TIER_INK.map(()=>new Path2D());
 for(const st of STANDS){const P=(u:number,d:number,y:number):V3=>[lerp(st.a[0],st.b[0],u)+st.out[0]*d,y,lerp(st.a[1],st.b[1],u)+st.out[1]*d];
  addPoly(concrete,[P(0,0,1.2),P(1,0,1.2),P(1,44,1.2+44*.55),P(0,44,1.2+44*.55)],c);
  addPoly(wall,[P(0,0,0),P(1,0,0),P(1,0,1.1),P(0,0,1.1)],c);
  // the cantilever roof edge over the top tiers
  addPoly(roof,[P(0,30,27),P(1,30,27),P(1,46,29),P(0,46,29)],c);
  const segs=16;for(let k=0;k<26;k++){const d0=1+k*1.62,d1=d0+1.28,lift=bounce*(k%2?.25:.45),y0=1.2+d0*.55+lift,y1=1.2+d1*.55+lift;
   for(let g=0;g<segs;g++){const u0=g/segs,u1=(g+1)/segs;addPoly(tiers[(k*3+g*5+(st.out[0]?2:0))%TIER_INK.length],[P(u0,d0,y0),P(u1,d0,y0),P(u1,d1,y1),P(u0,d1,y1)],c);}}}
 s.fill(Y,concrete,.2);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.55);
 s.fill(R,wall,.5);s.stroke(K,wall,Math.max(2,.05*P3([100,0,34],c)[2]),.6);
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
/** Arsenal's goal: white posts and bar, a net (paper haze + navy mesh) back to the stanchions. */
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
/** athlete.ts is right-handed (y up); this pitch (X to Arsenal's goal, Z away from the main camera) is left-handed, so the adapter negates z
 * both ways — that keeps every right hand a right hand. */
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28]],SKIN_D:InkFill[]=[[K,.75],[R,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Arsenal's gold change kit, navy collar, navy numbers, navy shorts (BBC photos); gold socks inferred */
const arsenal=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.6],trim:K,shorts:K,socks:[Y,.6],boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Sheffield United: red-and-white stripes, white shorts, white socks (BBC photo) */
const blades=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:'paper',trim:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Seaman: 1.93 m, 39, dark hair in his trademark ponytail, number 1, bright yellow keeper shirt, white gloves (shorts/socks inferred) */
const SEAMAN:AthleteStyle={shirt:[Y,.95],trim:K,shorts:K,socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.75],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',
 number:1,numberInk:K,build:{height:1.93,bulk:1.08},scale:FIG,seed:1};
/** the lesson's teaching marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],gloves:[Y,.7],hairStyle:'ponytail',line:Y,shade:null,shadow:false,sleeves:'long',build:{height:1.93,bulk:1.08},scale:FIG,seed:1};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the save (authored on athlete.ts's keyPoses)
/** seamanSave(t): set at the near post → load, eyes snapping back over his right shoulder (.2) → push off, rolling to his right and falling
 * BACKWARDS toward his line (.38) → CONTACT (.5): airborne, body sideways, RIGHT arm flung up and behind him, palm open behind the ball →
 * the scoop, the hand sweeping the ball back out (.62) → coming down (.82) → on the ground on his side (1). */
const SAVE_C=.5;
function seamanSave(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,keeperSet(0)],
  [.2,posed({lHipF:56,rHipF:40,lKnee:82,rKnee:58,lHipA:16,rHipA:30,dz:.25,dx:-.05,lean:16,pitch:4,roll:10,lShA:60,rShA:70,lShF:50,rShF:40,lElb:50,rElb:40,neckY:-30,neckP:-10,lHand:1,rHand:1})],
  [.38,posed({dz:1.25,dx:-.38,air:.32,roll:26,pitch:-12,lean:-4,bend:6,lHipA:26,lHipF:6,lKnee:14,lAnk:46,rHipF:48,rKnee:78,rHipA:24,lShA:70,lShF:40,lElb:40,rShA:120,rShF:-10,rElb:18,neckY:-40,neckP:-12,lHand:1,rHand:1})],
  [SAVE_C,posed({dz:2.65,dx:-.8,air:.62,roll:40,pitch:-22,lean:-8,bend:8,rShA:140,rShF:-32,rElb:4,rShR:0,lShA:66,lShF:52,lElb:44,lHipA:24,lHipF:-6,lKnee:18,lAnk:44,rHipA:10,rHipF:40,rKnee:62,rAnk:36,neckY:-48,neckP:-10,lHand:1,rHand:1})],
  [.62,posed({dz:2.95,dx:-.86,air:.48,roll:56,pitch:-18,lean:-4,bend:8,rShA:132,rShF:14,rElb:12,lShA:70,lShF:50,lElb:46,lHipA:18,lHipF:2,lKnee:22,lAnk:40,rHipF:42,rKnee:64,rAnk:34,neckY:-30,neckP:-8,lHand:1,rHand:.8})],
  [.82,posed({dz:3.2,dx:-.9,air:.12,roll:82,pitch:-12,lean:4,bend:8,rShA:128,rShF:30,rElb:30,lShA:72,lShF:48,lElb:52,lHipA:8,lHipF:14,lKnee:30,rHipF:46,rKnee:66,lAnk:30,rAnk:30,neckP:-4,lHand:.8,rHand:.7})],
  [1,posed({dz:3.3,dx:-.92,air:0,roll:92,pitch:-8,lean:12,bend:6,rShA:118,rShF:40,rElb:50,lShA:64,lShF:50,lElb:60,lHipA:6,lHipF:24,lKnee:42,rHipF:50,rKnee:74,lAnk:28,rAnk:28,neckP:6,lHand:.7,rHand:.7})],
 ];
 const p=keyPoses(clamp(t),keys),Q:[number,number][]=[[0,0],[.2,-.08],[.38,.07],[SAVE_C,.09],[.62,.04],[.82,.0],[.9,-.08],[1,-.03]];
 let v=0;for(let i=0;i+1<Q.length;i++){const[a,va]=Q[i],[b,vb]=Q[i+1];if(t>=a&&t<=b){const u=(t-a)/(b-a);v=va+(vb-va)*u*u*(3-2*u);break;}}if(t>1)v=Q[Q.length-1][1];
 p.squash=clamp(v,-.3,.3);return p;
}

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Asaba's shot)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** Seaman faces out, turned a touch toward the header */
const FACE:[number,number]=nrm2(-1,.22);
/** where the glove meets the ball: just in front of the line, inside the far half of the goal (inferred spot; the height is the pose's) */
const HAND_XZ:[number,number]=[104.9,35.85];
/** the dive's place: solved backwards from the right glove at the contact pose */
const DIVE_SK=solve(seamanSave(SAVE_C),SEAMAN.build,placeOf(0,0,FACE),FIG),DIVE_H=toMy(DIVE_SK.rHa);
const DIVE_AT:[number,number]=[HAND_XZ[0]-DIVE_H[0],HAND_XZ[1]-DIVE_H[2]],HAND_AT:V3=[HAND_XZ[0],DIVE_H[1],HAND_XZ[1]];
/** the ball: on the pitch side of the glove (the glove is behind it) — its back edge still short of the goal line */
const CONTACT:V3=[HAND_AT[0]-.15,HAND_AT[1]+.02,HAND_AT[2]-.03];
const T_HEAD=.55,T_J0=.46,DUR=.9,T_C=T_J0+SAVE_C*DUR,T_CLEAR=T_C+1.0;

type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'asaba',style:blades({number:null,seed:9,skin:SKIN_D,hair:K,build:{height:1.83}}),keys:[[-12,66,8],[-8,71,9.5],[-5,77.5,12],[-2.5,84,15.2],[-1,88.4,18.8],[0,90.3,20.6],[.8,91.8,22.2],[3,94,24.6],[6,95,25.4]]},
 {id:'pesch',style:blades({number:null,seed:7,hair:[K,.8],build:{height:1.7}}),keys:[[-12,76,40],[-8,80,40],[-4,86.5,38.4],[-1.5,93,36.6],[0,97.1,35.6],[.4,99.3,35.1],[T_HEAD,99.6,35.0],[1.5,100.7,35.5],[3,100.4,37.2],[6,99.2,38.2]]},
 {id:'cb1',style:arsenal({number:23,seed:23,skin:SKIN_D,hair:K,build:{height:1.9,bulk:1.12}}),keys:[[-12,86,37],[-8,88,37.6],[-3,93.2,37.6],[0,97.2,36.5],[.5,99.2,36.3],[1.5,100,36.4],[3,99.4,37.2],[6,98.4,37.8]]},
 {id:'cb2',style:arsenal({number:null,seed:5,hair:[K,.5]}),keys:[[-12,85,30],[-8,87,30.5],[-2,93,31.4],[0,96.4,32.4],[.9,98.3,35.4],[T_C+.2,99.4,37.8],[T_CLEAR,100.0,39.2],[4.5,98.6,40.2],[6,96.6,41]]},
 {id:'cole',style:arsenal({number:null,seed:3,skin:SKIN_D,hair:K}),keys:[[-12,66,11],[-8,72,11.5],[-5,78.4,13.4],[-2.5,85.2,16.6],[0,89.3,19.8],[2,91.8,22.2],[6,92.6,23]]},
 {id:'lauren',style:arsenal({number:null,seed:12,skin:SKIN_D,hair:K}),keys:[[-12,80,52],[-8,85,50],[0,94,44],[2,97,42],[6,96,43]]},
 {id:'am1',style:arsenal({number:null,seed:15,hair:[Y,.5]}),keys:[[-12,66,30],[-8,72,30],[0,86,30],[3,90,31],[6,90,31]]},
 {id:'am2',style:arsenal({number:null,seed:16,skin:SKIN_M}),keys:[[-12,64,42],[-8,70,42],[0,84,42],[3,88,40],[6,88,40]]},
 {id:'sh3',style:blades({number:null,seed:31}),keys:[[-12,70,48],[-8,76,48],[0,95,41.4],[2,98,40.6],[6,97,41]]},
 {id:'sh4',style:blades({number:null,seed:32,hair:[Y,.5]}),keys:[[-12,60,28],[-8,66,28],[0,84,26],[3,89,28],[6,90,29]]},
];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-12);for(let t=-11.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** strikes are RIGHT-footed: the solved toe is where the ball leaves */
const toeAt=(id:string,T:number):V3=>{const st=runState(TR(id).keys,T),sk=solve(strike(STRIKE_CONTACT),TR(id).style.build,st.place,FIG),t=toMy(sk.rToe);return[t[0],.11,t[2]];};
const SHOT_FROM=toeAt('asaba',0);
/** Peschisolido meets it with his forehead, facing the goal */
const PESCH_FACE:[number,number]=(()=>{const p=trackAt(TR('pesch').keys,T_HEAD);return nrm2(CONTACT[0]-p[0],CONTACT[2]-p[1]);})();
const HEAD_PT:V3=(()=>{const p=trackAt(TR('pesch').keys,T_HEAD),sk=solve(header(.52),TR('pesch').style.build,placeOf(p[0],p[1],PESCH_FACE),FIG),h=toMy(sk.head);return[h[0]+PESCH_FACE[0]*.13,h[1]+.04,h[2]+PESCH_FACE[1]*.13];})();
/** scooped back out and up, drops by the six-yard line, cleared by an Arsenal defender (inferred) */
const OUT:V3=[102.2,.7,38.6];
const CLEAR_AT=toeAt('cb2',T_CLEAR),AWAY:V3=[76,.11,58];

/** Seaman before the dive: set in the middle, then across to his near post as Asaba shoots (the accounts: "stranded at the near post") */
const SEAMAN_KEYS=[[-12,103.4,33.7],[-2,103.4,33.5],[-.2,103.5,33.2],[.3,DIVE_AT[0],DIVE_AT[1]+.05],[T_J0,DIVE_AT[0],DIVE_AT[1]]];
function seamanState(T:number):St{
 if(T<T_J0){const k=SEAMAN_KEYS,p=trackAt(k,T),b=ballAt(T),h=T>-.3?FACE:nrm2(b[0]-p[0],b[2]-p[1]);return{pose:keeperSet(T*1.4),place:placeOf(p[0],p[1],h)};}
 return{pose:seamanSave((T-T_J0)/DUR),place:placeOf(DIVE_AT[0],DIVE_AT[1],FACE)};
}

const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
/** The ball in 3D at play time T: at Asaba's feet, the lifted shot, Peschisolido's header, Seaman's glove, the scoop, the clearance. */
function ballAt(T:number):V3{
 const ak=TR('asaba').keys;
 const ahead=(t:number,lead:number):V3=>{const p=trackAt(ak,t),v=velAt(ak,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 if(T<-.3)return ahead(T,.55+.3*Math.sin(T*5.3)**2);
 if(T<0)return lerp3(ahead(-.3,.55+.3*Math.sin(-.3*5.3)**2),SHOT_FROM,sm(-.3,0,T));
 if(T<T_HEAD)return lerp3(SHOT_FROM,HEAD_PT,sm(0,T_HEAD,T,linear),.7);
 if(T<T_C)return lerp3(HEAD_PT,CONTACT,sm(T_HEAD,T_C,T,linear),.1);
 if(T<T_C+.5)return lerp3(CONTACT,OUT,sm(T_C,T_C+.5,T,u=>u*(1.3-.3*u)),.8);
 if(T<T_CLEAR)return lerp3(OUT,CLEAR_AT,sm(T_C+.5,T_CLEAR,T,linear),.35);
 const u=sm(T_CLEAR,T_CLEAR+1.6,T,linear);return lerp3(CLEAR_AT,AWAY,u,11);
}

// ---------------------------------------------------------------- the players at play time T
function stateOf(id:string,T:number):St{
 const tr=TR(id),k=tr.keys;
 if(id==='asaba'){const st=runState(k,T);
  if(T<-.45){const d=dribble(strideAt(k,T)*.9/4.3,{foot:'r',speed:.9});return{...st,pose:blendPose(st.pose,d,win(T,-12,-.45,.2))};}
  const w=win(T,-.5,.75);let pose=w>0?blendPose(st.pose,strike(clamp(T/.9+STRIKE_CONTACT)),w):st.pose;
  return{pose,place:st.place};}
 if(id==='pesch'){const st=runState(k,T,T>T_HEAD-.6&&T<T_HEAD+.6?PESCH_FACE:undefined);
  const w=win(T,T_HEAD-.5,T_HEAD+.5,.18);let pose=w>0?blendPose(st.pose,header(clamp((T-T_HEAD)/.9+.52)),w):st.pose;
  // hands to the head as the ball comes back out (inferred)
  if(T>T_C+.3)pose=blendPose(pose,posed({lShF:150,rShF:150,lShA:40,rShA:40,lElb:120,rElb:120,lean:-6,neckP:-20,lKnee:10,rKnee:10}),sm(T_C+.3,T_C+.8,T)*(1-sm(T_C+2.4,T_C+3,T)));
  return{pose,place:st.place};}
 if(id==='cb1'){// Campbell goes up with him (the BBC photo)
  const st=runState(k,T,T>T_HEAD-.6&&T<T_HEAD+.7?nrm2(-1,-.3):undefined),w=win(T,T_HEAD-.45,T_HEAD+.55,.18);
  return w>0?{...st,pose:blendPose(st.pose,header(clamp((T-T_HEAD)/.9+.52)),w*.85)}:st;}
 if(id==='cb2'){const st=runState(k,T,T>T_CLEAR-.8&&T<T_CLEAR+.7?nrm2(-1,.6):undefined),w=win(T,T_CLEAR-.5,T_CLEAR+.7);
  return w>0?{...st,pose:blendPose(st.pose,strike(clamp((T-T_CLEAR)/.9+STRIKE_CONTACT)),w)}:st;}
 return runState(k,T);
}

type Item={depth:number;draw:()=>void};
const HEROES=['asaba','pesch','cb1','cb2','seaman'];
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goal in depth order (far first). */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;bounce?:number;only?:string[];wide?:boolean;noSeaman?:boolean}={}){
 stadium(s,c,o.bounce??0);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id).filter(id=>!o.only||o.only.includes(id)),...(o.noSeaman?[]:['seaman'])];
 for(const id of ids){const fn=(t:number)=>id==='seaman'?seamanState(t):stateOf(id,t),st=fn(T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g))continue;
  const style=id==='seaman'?SEAMAN:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='seaman'&&T>T_J0+.1&&T<T_J0+.75)||(id==='asaba'&&T>-.2&&T<.25)||(id==='pesch'&&T>T_HEAD-.15&&T<T_HEAD+.15);
  // the keeper's depth is taken at his chest, not his feet: in the air he is nearer the line than his take-off spot
  const dz=id==='seaman'?P3([DIVE_AT[0]+.5,0,DIVE_AT[1]+1.2],c)[2]:g[2];
  items.push({depth:1/(id==='seaman'&&T>T_J0?dz:g[2]),draw:()=>{drawPlayer(s,st,c,sty,fn(T-1/12),fast&&hero);}});}
 const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  // at the save: in front of the goal the ball prints over the keeper; from behind the goal his glove is nearer, so the ball prints first
  const atSave=T>T_C-.25&&T<T_C+.25,front=c.pos[0]<104;
  items.push({depth:atSave?(front?0:1e9):1/bq[2],draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:T*6,key:K,shadow:B,seed:3});}});}
 const gq=P3([106,1.2,34],c);if(gq[2]>0)items.push({depth:1/gq[2],draw:()=>goal(s,c)});
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
 // the touch: a quick flash where the glove meets the ball (footage chapters: no teaching marks)
 const hit=win(T,T_C-.01,T_C+.2,.05);if(hit>0){const q=P3(CONTACT,c);if(onScreen(q))sparkBurst(s,Y,q[0],q[1],.5*q[2],{n:9,seed:41,g:hit,width:.05*q[2]});}
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main-stand camera panning with the attack down the right — the shot, the header, the save, the clearance. */
const MAIN_CAM:V3=[52.5,24,-40];
const t1=(t:number)=>{const qa=CUEW(0,'Asaba')+.25;return warp(t,[[0,-qa],[qa,0],[CUEW(0,'Peschisolido')+.25,T_HEAD],[CUEW(0,'Peschisolido')+.25+(T_C-T_HEAD),T_C],[SECS(0),T_C+(SECS(0)-CUEW(0,'Peschisolido')-.25-(T_C-T_HEAD))]]);};
function cam1(t:number){const T=t1(t);let bx=0;for(let k=0;k<5;k++)bx+=ballAt(Math.min(T,T_C)-.25-k*.12)[0]/5;
 const tx=clamp(lerp(bx+4,101,sm(-.6,.6,T,easeInOutSine)),60,101),tz=lerp(26,34,sm(-3,.6,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],lerp(lerp(4300,5400,sm(-6,-1,T,easeInOutSine)),9000,sm(-.8,.7,T,easeInOutSine)));}
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3([DIVE_AT[0],1,DIVE_AT[1]],cam1(t));return apertureDisc(p[0],p[1],Math.max(8,.9*p[2]),12);},
 get still(){return CUEW(0,'open goal')+.4;},
};
/** 2 · TV slow-motion replay, low from the far side in front of the goal (the BBC photo's angle): at the near post, the spring back, the hand. */
const LOW_FRONT:V3=[94.2,1.8,53];
const t2=(t:number)=>warp(t,[[0,-.5],[CUEW(1,'David'),-.05],[CUEW(1,'near post'),T_HEAD-.08],[CUEW(1,'springs'),T_J0+.08],[CUEW(1,'flings')+.7,T_C],[SECS(1),T_C+.2]]);
const cam2=(t:number)=>{const T=t2(t);return camAt(LOW_FRONT,[lerp(101.2,103.6,sm(-.4,T_HEAD,T,easeInOutSine)),1.05,lerp(34.2,34.8,sm(T_HEAD,T_C,T,easeInOutSine))],lerp(3100,3700,sm(0,SECS(1),t,easeInOutSine)));};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3([DIVE_AT[0],1,DIVE_AT[1]+1],cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.8*p[2]),12);},
 get still(){return CUEW(1,'flings')+.6;},
};
/** 3 · the second replay angle, from behind Arsenal's goal: the glove behind the ball on the line, the scoop, the clearance — very slow. */
const BEHIND:V3=[112.5,5.2,33.2];
const t3=(t:number)=>warp(t,[[0,T_HEAD-.12],[CUEW(2,'his glove'),T_C-.14],[CUEW(2,'behind the ball'),T_C-.03],[CUEW(2,'on the line'),T_C+.01],[CUEW(2,'scoops'),T_C+.06],[CUEW(2,'scoops')+1,T_C+.5],[CUEW(2,'Arsenal'),T_CLEAR-.1],[SECS(2),T_CLEAR+1.2]]);
const cam3=(t:number)=>{const T=t3(t);return camAt(BEHIND,[lerp(102.6,101.2,sm(T_C+.3,T_CLEAR,T,easeInOutSine)),1.0,lerp(lerp(34.2,35.4,sm(T_HEAD-.1,T_C,T,easeInOutSine)),37.4,sm(T_C+.3,T_CLEAR,T,easeInOutSine))],lerp(2500,3000,sm(0,CUEW(2,'on the line'),t,easeInOutSine))*lerp(1,.78,sm(T_C+.4,T_CLEAR,T,easeInOutSine)));};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3([HAND_AT[0],1.2,HAND_AT[2]],cam3(t));return apertureDisc(p[0],p[1],Math.max(10,.9*p[2]),12);},
 get still(){return CUEW(2,'on the line')+.5;},
};

// ---------------------------------------------------------------- 4 · the lesson plate (not footage)
/** A halftone Seaman on his line, three-quarter front: he shuffles into the line of a low shot (get your body), goes down into the long
 * barrier behind his hands (behind the ball), the ball squirts through his gloves and thumps into his body (even if it slips) and drops
 * dead in front of him, the goal line behind him lit and safe (will not go in). Lesson play time L; keeperScoop from athlete.ts. */
const L_FACE:[number,number]=[-1,0],L_FROM:[number,number]=[104,33.2],L_AT:[number,number]=[104,34];
const SCOOP0=.45;// L at which the scoop starts
function lessonState(L:number):St{
 if(L<SCOOP0){const u=sm(.1,.42,L,easeInOutSine);return{pose:keeperSet(L*1.6),place:placeOf(lerp(L_FROM[0],L_AT[0],u),lerp(L_FROM[1],L_AT[1],u),L_FACE)};}
 return{pose:blendPose(keeperSet(SCOOP0*1.6),keeperScoop(clamp((L-SCOOP0)/1.1)),sm(SCOOP0,SCOOP0+.12,L)),place:placeOf(L_AT[0],L_AT[1],L_FACE)};
}
const L_SK=(L:number)=>{const st=lessonState(L);return solve(st.pose,SEAMAN.build,st.place,FIG);};
const L_HANDS:V3=(()=>{const sk=L_SK(.95),a=toMy(sk.lHa),b=toMy(sk.rHa);return[(a[0]+b[0])/2-.16,Math.max(.12,(a[1]+b[1])/2),(a[2]+b[2])/2];})();
const L_BODY:V3=(()=>{const sk=L_SK(1.15),a=toMy(sk.pelvis),b=toMy(sk.chest);return[lerp(a[0],b[0],.4)-.22,lerp(a[1],b[1],.4),lerp(a[2],b[2],.4)];})();
const L_DROP:V3=[103.1,.11,34.05],L_SHOT:V3=[92.5,.11,34.1];
function lessonBall(L:number):V3{
 if(L<.5)return L_SHOT;
 if(L<.95)return lerp3(L_SHOT,L_HANDS,sm(.5,.95,L,linear),.12);
 if(L<1.12)return lerp3(L_HANDS,L_BODY,sm(.95,1.12,L,linear),.05);
 if(L<1.45)return lerp3(L_BODY,L_DROP,sm(1.12,1.45,L,linear),.25);
 const sk=L_SK(L),a=toMy(sk.lHa),b=toMy(sk.rHa),g:V3=[(a[0]+b[0])/2-.1,Math.max(.12,(a[1]+b[1])/2),(a[2]+b[2])/2];
 return lerp3(L_DROP,g,sm(1.45,1.75,L,easeInOutSine));
}
const LESSON_CAM:V3=[95.6,1.5,28.6];
const cam4=(t:number)=>camAt(LESSON_CAM,[lerp(102.6,103.4,sm(0,4,t,easeInOutSine)),.85,34],lerp(2250,2550,sm(0,SECS(3),t,easeInOutSine)));
const t4=(t:number)=>warp(t,[[0,-.3],[CUEW(3,'Your turn'),0],[CUEW(3,'get your body'),.1],[CUEW(3,'get your body')+1,.45],[CUEW(3,'behind the ball'),.5],[CUEW(3,'behind the ball')+1.1,.94],[CUEW(3,'even if'),.95],[CUEW(3,'even if')+1.3,1.45],[CUEW(3,'will not'),1.47],[CUEW(3,'will not')+1,1.85],[SECS(3),2]]);
/** a thick yellow teaching stroke with a navy key line */
function mark(s:Sheet,pts:Pt[],w:number,seed:number){if(pts.length<2)return;const path=ribbon(pts,w,{seed,taper:.1,wobble:.8});s.stroke(K,path,5,.9);s.knockout(path);s.fill(Y,path,.95);}
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),cam=cam4(t),L=t4(tt);frame(s);
  drawPlay(s,T_CLEAR+4,cam,{ballScale:1.3,bounce:.5*Math.abs(Math.sin(t*6))*(1-sm(.3,2.2,t)),only:[],noSeaman:true});
  // "Safe hands!": red-and-gold flecks over the stand as the chapter opens
  dust(s,R,0,-300,640*easeOut(clamp(t/1.6)),18,{seed:77,size:15,cov:.75*(1-sm(1.6,2.4,t))});
  const P=(v:V3):Pt=>{const q=P3(v,cam);return[q[0],q[1]];};
  // "get your body": the line of the ball on the grass, and the footprints of the shuffle into it
  const qG=CUEW(3,'get your body'),line=sm(qG,qG+.7,t,easeInOutSine);
  if(line>0){const pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(P([lerp(L_SHOT[0]+.6,L_AT[0]-.4,k/10),.02,34.02]));mark(s,partial(pts,line),.1*P3([100,0,34],cam)[2],5);
   const lit=new Path2D();for(let k=0;k<2;k++){const x=L_AT[0]+.1,z=lerp(L_FROM[1],L_AT[1],sm(qG,qG+1,t))+(k?.2:-.2),pts2:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;pts2.push(P([x+Math.cos(a)*.3,.01,z+Math.sin(a)*.13]));}lit.addPath(shape(pts2));}
   s.stroke(K,lit,6,.9);s.knockout(lit);s.fill(Y,lit,.95);}
  // "behind the ball": the ball's line runs on behind him to the goal line as paper dashes — his body is the wall across it
  const st=lessonState(L),qB=CUEW(3,'behind the ball'),wall=sm(qB+.3,qB+1.1,t,easeInOutSine);
  if(wall>0){const d=new Path2D();for(let k=0;k<4;k++){const x0=L_AT[0]+.25+k*.2,x1=x0+.11;if((k+1)/4>wall+.01)break;const q:Pt[]=[P([x0,.02,33.93]),P([x1,.02,33.93]),P([x1,.02,34.07]),P([x0,.02,34.07])];d.addPath(shape(q));}s.knockout(d,.95);}
  drawPlayer(s,st,cam,{...SEAMAN,detail:'high'},lessonState(L-1/12),false);
  // "will not go in": the goal line behind him lights up
  const qN=CUEW(3,'will not'),safe=sm(qN,qN+.8,t,easeInOutSine);
  if(safe>0){const gl:Pt[]=[];for(let k=0;k<=8;k++)gl.push(P([105,.02,lerp(GOAL.z0,GOAL.z1,k/8)]));mark(s,partial(gl,safe),.16*P3([105,0,34],cam)[2],13);}
  // the ball: the shot, into the hands, through them into the body, down in front, gathered
  const bp=lessonBall(L),bq=P3(bp,cam),g=P3([bp[0],0,bp[2]],cam),r=Math.max(6,.13*bq[2]);
  s.tone(K,shape(blob(g[0],g[1],r*1.1,r*.33,4,{n:14})),.5);footballPanels(s,bq[0],bq[1],r,{rot:L*7,key:K,shadow:B,seed:3});
  // "even if it slips": the thump into the body, and a curl showing it squirming through the gloves
  const qS=CUEW(3,'even if');
  const thump=win(L,1.1,1.3,.04);if(thump>0){const q=P3(L_BODY,cam);sparkBurst(s,Y,q[0],q[1],.8*q[2],{n:10,seed:61,g:thump,width:.06*q[2]});}
  const curl=sm(qS+.2,qS+1.2,t,easeInOutSine);if(curl>0&&t<qN+.3){const a=P(L_HANDS),b=P(L_BODY),c=P(L_DROP);mark(s,partial(smoothPts([[a[0],a[1]-20],[lerp(a[0],b[0],.5),Math.min(a[1],b[1])-70],[b[0],b[1]],[lerp(b[0],c[0],.5),lerp(b[1],c[1],.5)-40],[c[0],c[1]]],false,6,2),curl),.05*P3(L_BODY,cam)[2],9);}
  if(safe>.5){const q=P3(bp,cam);sparkBurst(s,Y,q[0],q[1],.7*q[2],{n:8,seed:71,g:clamp((safe-.5)*2),width:.05*q[2]});}
  frame(s);
 },
 get still(){return SECS(3)*.85;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'seaman-signature',format:'11v11',title:'The safe pair of hands',theme:'Get your body behind the ball',
 ageNote:'Arsenal v Sheffield United · FA Cup semi-final, 13 April 2003',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little glove spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:5,seed,g,width:16});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; X to Arsenal's goal line at 105, Z across) — checked by tests/play-film-seaman-signature.cjs. */
export const FACTS={CONTACT,HAND_AT,DIVE_AT,FACE,HEAD_PT,SHOT_FROM,OUT,CLEAR_AT,GOAL,T_HEAD,T_C,T_J0,SAVE_C,ballAt,seamanSave,seamanState,L_HANDS,L_BODY,lessonBall};
