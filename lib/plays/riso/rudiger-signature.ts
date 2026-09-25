/** Iconic-play film · Antonio Rüdiger, "Signature: the never-give-up tackle" — his last-ditch block on Phil Foden, Manchester City v
 * Chelsea, UEFA Champions League final, 29 May 2021, Estádio do Dragão, Porto (27th–28th minute, 0–0; Chelsea won 1–0).
 *
 * WHY THIS MOMENT: Rüdiger's entry in lib/town/iconicPlays.json is a signature trait (the never-give-up tackle; lesson "Chase every ball like
 * it matters; hard work wins it back"), not one match. This is the best-documented example of it: in the biggest club match of the season a
 * City player was already through and "free in the box", and Rüdiger still got there — a last-ditch block with a stretched ("telescopic")
 * leg. The Guardian's minute-by-minute, a Reuters photo caption and the Wikipedia match report all describe it.
 *
 * A faithful recreation of the broadcast rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, Chelsea's goal
 * line at X=0, Z across, away from the main-stand camera, Y up) seen through TV cameras — 1 live, the high main camera on the side
 * (De Bruyne slips the pass, Foden is free in the box, Rüdiger is still running, the block); 2 a TV slow-motion replay from a low camera on
 * the near side behind Foden (Rüdiger races back, Foden shoots, the long leg, blocked); 3 a second replay from behind Chelsea's goal (the
 * ball loops off his boot into Mendy's arms); 4 the lesson (the only chapter with teaching marks: the chase, keep sprinting, the stretch,
 * the block, the ball won back). No overlays inside the footage chapters. Camera language and code structure follow moore-tackle-1970.ts.
 *
 * SOURCES (read 23 Sep 2026 from the shared cache scratchpad/films/src-cache/, fetched earlier with curl; no new requests were needed):
 *  - The Guardian, "Manchester City v Chelsea: Champions League final 2021 – live!" (minute-by-minute, 29 May 2021), 27 min entry:
 *    "De Bruyne slipping a pass down the left channel for Foden, who is suddenly free in the box! But only for a split second. Foden looks
 *    to pass across Mendy and into the bottom right, but his shot is blocked by an absurdly good last-ditch challenge by Rudiger, whose
 *    telescopic leg balloons the ball into the arms of his keeper." Photo caption: "Manchester City's Phil Foden is denied by Chelsea's
 *    Antonio Rudiger. Photograph: Manu Fernández/Reuters". The 27 min entry also: Sterling had just tried to go past Reece James on the outside.
 *  - Wikipedia, "2021 UEFA Champions League final" (match section, line-ups, kit boxes; cites BBC Sport live text): "In the 28th minute,
 *    Phil Foden was played in on goal and was about to shoot when Antonio Rüdiger tackled him." Line-ups: Chelsea back three Azpilicueta
 *    (28), Thiago Silva (6), Rüdiger (2); Reece James (24) right wing-back, Chilwell (21) left; Mendy (16) in goal. City: Foden (47), De Bruyne
 *    (17), Sterling (7), Mahrez (26), Gündoğan (8), Bernardo Silva (20). Kits: Chelsea royal blue shirts, blue shorts, white socks; City
 *    sky blue shirts, white shorts, sky blue socks. Havertz's goal in the 42nd minute won it 1–0.
 * CONFIRMED by those sources: the date, venue, competition and 0–0 score at the time; De Bruyne's pass down City's left channel; Foden free
 * in the box about to shoot; he aimed across Mendy for the bottom right corner; Rüdiger's last-ditch block with a stretched leg; the ball
 * ballooned off it into goalkeeper Mendy's arms; the shirt numbers and kit colours above; Chelsea won the final.
 * INFERRED (not in the sources): which end Chelsea defended in the first half (here City attack right to left, so their left channel is the
 * near side); every position, path and timing; that Rüdiger (the left-sided centre-back in the listed back three) recovered across from the
 * far side of the box; that he blocked with his LEFT leg in a sliding stretch (the leg nearer Foden on this geometry) — the narration only
 * says "one long leg"; Foden shooting with his left foot (his stronger foot; not stated for this shot); De Bruyne's passing foot; the loop's
 * height; how Rüdiger and Foden got up; all other players' positions (drawn low-detail and illustrative); Mendy's goalkeeper kit colours;
 * the Dragão's seat colours and the (Covid-limited, 14,110) crowd, which is not drawn; camera placements and lenses; hair tones.
 * The narration names only confirmed beats (and "races back", implied by "last-ditch").
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
 * incl. the silent tail that carries the passage. Every cue starts with a plain ASCII word (Kokoro timing match). Keep the counts [6,5,4,6]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'Free in the box',text:'Porto, 2021, the Champions League final. Kevin De Bruyne slips a pass to Phil Foden. Foden is free in the box! But Antonio Rüdiger keeps running.',seconds:12.4,
  cues:[[0,'Porto'],[3,'Kevin De Bruyne'],[5,'Phil Foden'],[6.5,'free in the box'],[8.3,'But Antonio Rüdiger'],[9.7,'keeps running']]},
 {label:'The replay',text:'Watch again, slowly. Rüdiger races back. Foden shoots, and Rüdiger stretches out one long leg. Blocked!',seconds:9.4,
  cues:[[0,'Watch again'],[2.2,'races back'],[3.6,'Foden shoots'],[5.2,'stretches out one long leg'],[7.1,'Blocked']]},
 {label:'Safe',text:'Behind the goal: the ball loops off his boot, into Mendy’s arms. Chelsea went on to win the final.',seconds:8.8,
  cues:[[0,'Behind the goal'],[1.5,'ball loops'],[3.4,'into Mendy'],[5.2,'Chelsea went on']]},
 {label:'The lesson',text:'That is the never-give-up tackle! Chase every ball like it matters: keep sprinting, stretch, and block. Hard work wins it back.',seconds:10.8,
  cues:[[0,'That is the'],[2.2,'Chase every ball'],[4.3,'keep sprinting'],[5.4,'stretch'],[6.3,'block'],[7.5,'Hard work wins it back']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py rudiger-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/rudiger-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/rudiger-signature/timing.json';
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
 {a:[-12,75],b:[117,75],out:[0,1]},    // far side
 {a:[112,-10],b:[112,78],out:[1,0]},   // the far end (behind City's goal)
 {a:[-12,-7],b:[117,-7],out:[0,-1]},   // main stand (the side camera sits in it)
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
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Rüdiger's LEFT leg on his left (toward Foden) and Foden's left boot on his left. */
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
/** Rüdiger: Chelsea 2, tall and powerful */
const RUDI:AthleteStyle=chelsea(DARK,{number:2,seed:2,hair:[K,.9],build:{height:1.9,bulk:1.06,thighs:1.06}});
const FODEN:AthleteStyle=city(LIGHT,{number:47,seed:47,hair:[O,.45],build:{height:1.71,bulk:.93}});
const KDB:AthleteStyle=city(LIGHT,{number:17,seed:17,hair:[O,.8],build:{height:1.81,bulk:1}});
/** Mendy: Chelsea's goalkeeper, 16 (goalkeeper kit colours inferred) */
const MENDY:AthleteStyle={shirt:[Y,.85],trim:K,shorts:[Y,.85],socks:[Y,.85],boots:K,skin:DARK,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:16,numberInk:K,scale:FIG,seed:16,build:{height:1.94,bulk:1.04}};
/** the lesson's replay marks: a yellow silhouette of the same body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:2,build:RUDI.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = De Bruyne's pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const mid3=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** the shot: from the left of the box, across Mendy toward the bottom right corner (his far post) */
const T_RECV=1.05,T_SHOT=2.4,SHOT_SPEED=21;
const BLOCK_TARGET:[number,number]=[10.25,25.75];
const SHOT_H=nrm2(-11.2,11.6),BLOCK_DIST=1.25;
const T_BLOCK=T_SHOT+BLOCK_DIST/SHOT_SPEED;
/** Rüdiger's slide: heading back toward his goal line and across toward the near side (Foden's side), on his LEFT leg */
const SLIDE_DUR=.9,SLIDE_CONTACT=.42,T_SLIDE=T_BLOCK-SLIDE_CONTACT*SLIDE_DUR,T_SLID=T_SLIDE+SLIDE_DUR;
const SLIDE_H=nrm2(-.72,-.69);
/** the library slide on the left leg, the lead leg long and low through the contact ("telescopic leg"), the boot a little off the grass */
function SLIDE(u:number):Pose{const p=slideTackle(clamp(u),{foot:'l'}),w=sm(.25,.38,u)*(1-sm(.62,.82,u));return w>0?clampPose({...p,lHipF:p.lHipF-.12*w,lAnk:p.lAnk-.14*w,lKnee:Math.max(0,p.lKnee-.05*w)}):p;}
/** where his left boot is (my metres) at the contact frame, for a slide started at (0,0) */
const bootAt=(place:Place):V3=>{const sk=solve(SLIDE(SLIDE_CONTACT),RUDI.build,place,FIG);return toMy(mid3(sk.lToe,sk.lHeel));};
const BOOT0=bootAt(placeOf(0,0,SLIDE_H));
const SLIDE_AT:[number,number]=[BLOCK_TARGET[0]-BOOT0[0],BLOCK_TARGET[1]-BOOT0[2]];
const SLIDE_PLACE=placeOf(SLIDE_AT[0],SLIDE_AT[1],SLIDE_H);
/** the ball meets the inside of his left boot here (solved from the body at the contact frame, nudged to Foden's side of the boot) */
const BALL_B:[number,number]=(()=>{const b=bootAt(SLIDE_PLACE);return[b[0]+.1,b[2]-.12];})();
const SHOT_AT:[number,number]=add2(BALL_B,SHOT_H,-BLOCK_DIST);
/** Foden: plant on the right, strike with the left; his place is solved so the left boot is at the ball at contact */
const FSTRIKE=(t:number)=>strike(t,{foot:'l',power:.85});
const FODEN_AT:[number,number]=(()=>{const sk=solve(FSTRIKE(STRIKE_CONTACT),FODEN.build,placeOf(0,0,SHOT_H),FIG),f=toMy(mid3(sk.lToe,sk.lHeel));return[SHOT_AT[0]-f[0]-SHOT_H[0]*.1,SHOT_AT[1]-f[2]-SHOT_H[1]*.1];})();
const FODEN_PLACE=placeOf(FODEN_AT[0],FODEN_AT[1],SHOT_H);
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** a run that ENDS at `end` at time t1: walked backward along heading(T) at speed(T) m/s, sampled every .1 s (smooth speeds, no teleports) */
function runBack(end:[number,number],t1:number,t0:number,speed:(T:number)=>number,heading:(T:number)=>[number,number]):number[][]{
 const k:number[][]=[[t1,end[0],end[1]]];let p:[number,number]=[end[0],end[1]];
 for(let T=t1;T>t0+1e-6;){const dt=Math.min(.1,T-t0),h=heading(T-dt/2);p=add2(p,h,-speed(T-dt/2)*dt);T-=dt;k.unshift([T,p[0],p[1]]);}return k;}
/** Foden's run: from the left channel in behind (a jog, then the burst), onto the pass, one touch, set, shoot */
const FODEN_KEYS=runBack(FODEN_AT,T_SHOT,-1.8,T=>3+4*sm(-1.2,.2,T)-2.6*sm(.9,T_SHOT,T),T=>yawTo(nrm2(-.93,.37),SHOT_H,sm(.4,T_SHOT-.2,T)));
/** where Foden takes the pass: in the box, on the left, just ahead of his stride */
const RECV_PT:[number,number]=(()=>{const a=trackAt(FODEN_KEYS,T_RECV),b=trackAt(FODEN_KEYS,T_RECV+.1);const h=nrm2(b[0]-a[0],b[1]-a[1]);return add2(a,h,.55);})();
/** De Bruyne on the ball in midfield, slips it down the left channel */
const KDB_KEYS=[[-1.8,37.5,30.5],[0,31.8,28.9],[1.2,29.6,28.2],[3,27.6,27.8],[7,25,27]];
const PASS_FROM:[number,number]=add2([31.8,28.9],nrm2(RECV_PT[0]-31.8,RECV_PT[1]-28.9),.62);
/** Rüdiger's recovery: from the far side of the centre, across behind Thiago Silva, flat out into the slide (≈ 18 m in under 4 s) */
const RUDI_KEYS=runBack(SLIDE_AT,T_SLIDE,-1.8,T=>3+4.6*sm(-1.5,.9,T),T=>yawTo(nrm2(-.84,-.54),SLIDE_H,sm(0,T_SLIDE,T)));
const GETUP:[number,number]=add2(SLIDE_AT,SLIDE_H,slideTackle(1).dx);
/** Mendy: set near his near post as Foden shoots across him; the catch */
const MENDY_KEYS=[[-1.8,3.6,33],[T_RECV,2.6,31.6],[T_SHOT,1.9,31.4],[9,1.9,31.4]];
const T_CATCH=T_BLOCK+1.05,CATCH_LEAD=.5,CATCH_DUR=1.1;
const MENDY_H=nrm2(1,-.35);
const MENDY_CATCH:[number,Pose][]=[
 [0,keeperSet(0)],
 [.3,posed({lHipF:40,rHipF:40,lHipA:10,rHipA:10,lKnee:52,rKnee:52,lAnk:-4,rAnk:-4,lean:14,pitch:4,lShF:90,rShF:90,lShA:20,rShA:20,lElb:40,rElb:40,lHand:1,rHand:1,neckP:-26})],
 [CATCH_LEAD,posed({air:.14,lHipF:14,rHipF:22,lKnee:26,rKnee:34,lAnk:30,rAnk:30,lean:0,pitch:-2,lShF:132,rShF:132,lShA:18,rShA:18,lElb:28,rElb:28,lShR:16,rShR:16,lHand:1,rHand:1,neckP:-38})],
 [.75,posed({air:0,lHipF:30,rHipF:36,lKnee:44,rKnee:48,lean:16,lShF:74,rShF:74,lShA:14,rShA:14,lElb:110,rElb:110,lShR:26,rShR:26,lHand:.8,rHand:.8,neckP:10})],
 [1,posed({lHipF:24,rHipF:24,lKnee:32,rKnee:32,lean:20,lShF:40,rShF:40,lShA:12,rShA:12,lElb:132,rElb:132,lShR:34,rShR:34,lHand:.7,rHand:.7,neckP:18})],
];
const MENDY_AT:[number,number]=[1.9,31.4],MENDY_PLACE=placeOf(MENDY_AT[0],MENDY_AT[1],MENDY_H);
const handsAt=(u:number):V3=>{const sk=solve(keyPoses(clamp(u),MENDY_CATCH),MENDY.build,MENDY_PLACE,FIG);return toMy(mid3(sk.lHa,sk.rHa));};
const CATCH_PT:V3=handsAt(CATCH_LEAD);
type Track={id:string;style:AthleteStyle;keys:number[][]};
const TRACKS:Track[]=[
 {id:'rudi',style:RUDI,keys:RUDI_KEYS},
 {id:'foden',style:FODEN,keys:FODEN_KEYS},
 {id:'kdb',style:KDB,keys:KDB_KEYS},
 // the rest of both teams, as the sources place them only loosely (Sterling out on the left with Reece James; positions illustrative)
 {id:'silva',style:chelsea(MID,{number:6,seed:6}),keys:[[-1.8,22.5,31],[0,20,30.6],[2,16.6,30],[5,15,30.5],[9,15,30.5]]},
 {id:'azpi',style:chelsea(LIGHT,{number:28,seed:28}),keys:[[-1.8,22,13.5],[0,20.4,13],[2,17.4,13.6],[5,16,14.5],[9,16,14.5]]},
 {id:'james',style:chelsea(DARK,{number:24,seed:24}),keys:[[-1.8,27,7.5],[0,24,7.2],[2,20,8.4],[5,18,10],[9,18,10]]},
 {id:'sterling',style:city(DARK,{number:7,seed:7}),keys:[[-1.8,29.5,5.6],[0,26,6],[2,21.5,7.6],[5,20,9],[9,20,9]]},
 {id:'kante',style:chelsea(DARK,{number:7,seed:77}),keys:[[-1.8,33,33.5],[0,30,32.4],[2,25.2,30.4],[5,22,30],[9,22,30]]},
 {id:'jorginho',style:chelsea(LIGHT,{number:5,seed:5}),keys:[[-1.8,31,38.5],[0,28,37],[2,24,35.2],[5,21,34],[9,21,34]]},
 {id:'chilwell',style:chelsea(LIGHT,{number:21,seed:21}),keys:[[-1.8,29,55],[0,26,53],[2,22,50],[5,19,48],[9,19,48]]},
 {id:'mahrez',style:city(MID,{number:26,seed:26}),keys:[[-1.8,30,50],[0,26.5,48.4],[2,21.5,45.5],[5,19,44],[9,19,44]]},
 {id:'gundogan',style:city(LIGHT,{number:8,seed:8}),keys:[[-1.8,40.5,24.5],[0,36.5,24],[2,31,24],[5,28,25],[9,28,25]]},
];
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-2);for(let t=-1.8;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: at De Bruyne's feet, the slipped pass, Foden's touch, the shot, the block, the loop, Mendy's arms. */
function ballAt(T:number):V3{
 if(T<0){const p=trackAt(KDB_KEYS,T),v=velAt(KDB_KEYS,T),s=Math.hypot(v[0],v[1])||1,lead=.62+.25*Math.max(0,Math.sin((T+1.8)*TAU/.7)),b:V3=[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];
  return lerp3(b,[PASS_FROM[0],.11,PASS_FROM[1]],sm(-.5,0,T));}
 if(T<T_RECV)return lerp3([PASS_FROM[0],.11,PASS_FROM[1]],[RECV_PT[0],.11,RECV_PT[1]],sm(0,T_RECV,T,u=>u*(1.35-.35*u)));
 if(T<T_SHOT)return lerp3([RECV_PT[0],.11,RECV_PT[1]],[SHOT_AT[0],.11,SHOT_AT[1]],sm(T_RECV,T_SHOT,T,u=>u*(1.7-.7*u)));
 if(T<T_BLOCK)return lerp3([SHOT_AT[0],.11,SHOT_AT[1]],[BALL_B[0],.13,BALL_B[1]],(T-T_SHOT)/(T_BLOCK-T_SHOT));
 if(T<T_CATCH)return lerp3([BALL_B[0],.13,BALL_B[1]],CATCH_PT,sm(T_BLOCK,T_CATCH,T,u=>u*(1.15-.15*u)),2.3);
 return handsAt(CATCH_LEAD+(T-T_CATCH)/CATCH_DUR);
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
/** Rüdiger: the flat-out recovery sprint (eyes on the ball), the slide and the long left leg, down, up again */
function rudiState(T:number):St{
 if(T<T_SLIDE+.1){const turn=sm(T_SLIDE-.8,T_SLIDE,T,easeInOutSine),v=velAt(RUDI_KEYS,T),sp=Math.hypot(v[0],v[1]),h=yawTo(sp>.5?[v[0]/sp,v[1]/sp]:SLIDE_H,SLIDE_H,turn),st=runState(RUDI_KEYS,T,h);
  let pose=lookAtBall(st,T,.8-.5*sm(T_SLIDE-.3,T_SLIDE+.1,T));
  // flat out: a little more lean and arm drive than the library sprint
  pose=clampPose({...pose,lean:pose.lean+.08,pitch:pose.pitch+.04});
  if(T<T_SLIDE)return{pose,place:st.place};
  return{pose:blendPose(pose,SLIDE((T-T_SLIDE)/SLIDE_DUR),sm(T_SLIDE,T_SLIDE+.1,T)),place:SLIDE_PLACE};}
 if(T<T_SLID)return{pose:SLIDE((T-T_SLIDE)/SLIDE_DUR),place:SLIDE_PLACE};
 const down={...SLIDE(1),dx:0},face=yawTo(SLIDE_H,nrm2(MENDY_AT[0]-GETUP[0],MENDY_AT[1]-GETUP[1]),sm(T_SLID+1.2,T_SLID+1.9,T));
 const kneel=posed({lHipF:70,lKnee:120,lAnk:30,rHipF:20,rKnee:100,rAnk:40,lean:30,pitch:4,lShA:30,rShA:40,lShF:30,rShF:-10,lElb:40,rElb:30,neckP:10});
 const u=clamp((T-(T_SLID+.9))/1);
 return{pose:u<=0?down:keyPoses(u,[[0,down],[.45,kneel],[1,stand()]]),place:placeOf(GETUP[0],GETUP[1],face)};
}
/** Foden: the run in behind, a touch with the left, set, the left-foot shot across Mendy, the follow-through */
function fodenState(T:number):St{
 const S0=T_SHOT-STRIKE_CONTACT*.85;
 if(T<S0){const st=runState(FODEN_KEYS,T);let pose=st.pose;
  if(T>T_RECV-.4)pose=blendPose(pose,dribble(strideAt(FODEN_KEYS,T)*.9/3.4,{foot:'l',speed:.7}),.6*sm(T_RECV-.4,T_RECV,T));
  return{pose:lookAtBall({pose,place:st.place},T,.6),place:st.place};}
 const p=trackAt(FODEN_KEYS,Math.min(T,T_SHOT)),u=(T-S0)/.85,pose=FSTRIKE(clamp(u));
 const pre=runState(FODEN_KEYS,S0).pose,h=yawTo(nrm2(...velAt(FODEN_KEYS,S0-.05)),SHOT_H,sm(S0,S0+.3,T));
 const settle=posed({lHipF:10,rHipF:14,lKnee:24,rKnee:20,lean:10,lShA:26,rShA:26,lElb:50,rElb:50,neckP:6,neckY:-20});
 const P=u<1?blendPose(pre,pose,sm(0,.12,u)):blendPose(FSTRIKE(1),settle,sm(1,1.8,u));
 return{pose:P,place:placeOf(p[0],p[1],h)};
}
function kdbState(T:number):St{const st=runState(KDB_KEYS,T,T>-.5&&T<.8?nrm2(RECV_PT[0]-31.8,RECV_PT[1]-28.9):undefined);
 return{pose:blendPose(st.pose,strike(clamp(T/.75+STRIKE_CONTACT),{power:.4}),win(T,-.4,.45,.2)),place:st.place};}
function mendyState(T:number):St{
 const c0=T_CATCH-CATCH_LEAD*CATCH_DUR;
 if(T<c0){const[x,z]=trackAt(MENDY_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,T>T_SHOT?MENDY_H:nrm2(b[0]-x,b[2]-z))};}
 return{pose:keyPoses(clamp((T-c0)/CATCH_DUR),MENDY_CATCH),place:MENDY_PLACE};
}
function stateOf(id:string,T:number):St{
 if(id==='rudi')return rudiState(T);if(id==='foden')return fodenState(T);if(id==='kdb')return kdbState(T);if(id==='mendy')return mendyState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['rudi','foden'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes (and Mendy in close shots). */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean;hero?:string[]}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'mendy'].filter(id=>!o.only||o.only.includes(id)),heroes=o.hero??HEROES;
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='mendy'?MENDY:TR(id).style,hero=heroes.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='rudi'&&T>T_SLIDE&&T<T_SLID-.2)||(id==='foden'&&Math.abs(T-T_SHOT)<.25);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  const held=T>=T_CATCH;
  items.push({depth:1/bq[2]-(held?.004:T>T_SHOT-.2&&T<T_BLOCK+.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);if(!held)s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:held?0:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the side, panning with the ball — the pass, Foden free in the box, Rüdiger still running, the block. */
const MAIN_CAM:V3=[46,24,-38];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-1.7],[q[1]+.3,0],[q[2]+.4,T_RECV],[q[3]+.3,1.6],[q[4]+.3,1.95],[q[5]+.5,T_BLOCK],[S,T_BLOCK+1.6]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-1.7,T-.3)),r=trackAt(RUDI_KEYS,Math.min(T,T_SLIDE)),tx=clamp(lerp(b[0],(b[0]+r[0])/2,sm(0,1.2,T))-2,8,40),tz=lerp(28,29,sm(0,2,T)),F=lerp(5200,7400,sm(-.5,2.4,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[3]+.4;},
};
/** 2 · TV slow-motion replay from a low camera on the near side, behind Foden: Rüdiger races back across, the shot, the long leg. */
const LOW_CAM:V3=[27,1.8,12];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,.4],[q[1],1.15],[q[2]+.2,T_SHOT-.3],[q[3]+.5,T_BLOCK],[S,T_BLOCK+.55]]);};
const cam2=(t:number)=>{const T=t2(t),r=trackAt(RUDI_KEYS,Math.min(T,T_SLIDE)),f=trackAt(FODEN_KEYS,Math.min(T,T_SHOT)),u=sm(1.4,T_BLOCK,T,easeInOutSine),tx=lerp((r[0]+f[0])/2,BALL_B[0]+.3,u),tz=lerp((r[1]+f[1])/2,BALL_B[1]+.4,u),F=lerp(2000,4300,sm(.6,T_BLOCK,T,easeInOutSine));
 return camAt(LOW_CAM,[tx,.8,tz],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.4;},
};
/** 3 · the second replay, from the high camera behind Chelsea's goal: the ball loops off the boot, into Mendy's arms. */
const BEHIND:V3=[-10,4.8,30.5];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_SHOT-.35],[q[1]+.3,T_BLOCK+.05],[q[2]+.5,T_CATCH],[S,T_CATCH+2]]);};
const cam3=(t:number)=>{const T=t3(t),u=sm(T_BLOCK,T_CATCH,T,easeInOutSine),tx=lerp(BALL_B[0]-.5,MENDY_AT[0]+3,u),tz=lerp(BALL_B[1]+.4,MENDY_AT[1]-.4,u),F=lerp(3000,2100,u);
 return camAt(BEHIND,[tx,lerp(.7,1.1,u),tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6,hero:['rudi','foden','mendy']});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[2]+.5;},
};
/** 4 · the lesson plate: the action again from a raised camera on the near side, with bold yellow teaching marks — a ring round Rüdiger
 * (the never-give-up tackle), his whole chase back printed as a path (chase every ball), speed dashes behind him (keep sprinting), the
 * stretched slide stamped as a ghost (stretch), the shot line stopped dead with a burst (block), and a ring round the ball safe in Mendy's
 * arms (hard work wins it back). */
const LESSON_CAM:V3=[24,9,9];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-1.8],[q[1],-1.8],[q[2]+.4,T_SLIDE-.45],[q[3]+.6,T_BLOCK],[q[4]+.9,T_BLOCK+.04],[q[5]+.3,T_BLOCK+.3],[S-.7,T_CATCH+.5]]);};
const cam4=(t:number)=>{const T=t4(t),r=rudiState(Math.min(T,T_SLIDE)).place,u=sm(T_SLIDE-1.1,T_SLIDE+.1,T,easeInOutSine),w=sm(T_BLOCK+.1,T_CATCH,T,easeInOutSine);
 const tx=lerp(lerp(lerp(r.x!,BALL_B[0],.12),BALL_B[0],u),(BALL_B[0]+MENDY_AT[0])/2+1,w),tz=lerp(lerp(lerp(-r.z!,BALL_B[1],.12),BALL_B[1]+1,u),(BALL_B[1]+MENDY_AT[1])/2,w);
 return camAt(LESSON_CAM,[tx,.4,tz],lerp(lerp(2300,3700,u),3100,w));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ground ring (pitch metres) as one path */
function ring(c:Cam,x:number,z:number,r:number):Path2D{const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const p=new Path2D();p.addPath(polyPath(out,true));p.addPath(polyPath(inn.reverse(),true));return p;}
const LESSON_ONLY=['rudi','foden','kdb','silva','mendy','ball'];
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  // "That is the never-give-up tackle": a yellow ring on the grass round Rüdiger (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.2,q[1]+.6,t));
  stadium(s,c);
  if(hal>.01){const r=rudiState(T).place;mark(s,ring(c,r.x!,-r.z!,1.2*hal));}
  // "Chase every ball": his whole chase back, printed as a path from where he started to where he will slide (drawn out ahead of him)
  const path=sm(q[1],q[1]+.4,t)*(1-sm(q[5]-.2,q[5]+.3,t));
  if(path>0){const pts:Pt[]=[];const reach=Math.max(Math.min(T,T_SLIDE),lerp(-1.8,T_SLIDE,sm(q[1],q[2],t,easeInOutSine)));for(let u=-1.8;u<=reach+.001;u+=.2){const m=trackAt(RUDI_KEYS,u);pts.push(G(m[0],m[1],c));}
   if(pts.length>1){const w=Math.max(12,.22*P3([SLIDE_AT[0],0,SLIDE_AT[1]],c)[2]),p=ribbon(pts,w,{seed:31,taper:.3,wobble:1});s.stroke(K,p,5,.9*path);s.knockout(p,path);s.fill(Y,p,.95*path);}}
  drawPlay(s,T,c,{ballScale:1.5,only:LESSON_ONLY,noStadium:true});
  // "keep sprinting": three speed dashes trailing behind him while he runs
  const dash=win(t,q[2]-.1,q[3]+.4,.25);
  if(dash>0&&T<T_SLIDE+.2){const r=trackAt(RUDI_KEYS,Math.min(T,T_SLIDE)),v=nrm2(...velAt(RUDI_KEYS,Math.min(T,T_SLIDE-.05))),n:[number,number]=[-v[1],v[0]],p=new Path2D();
   for(let i=-1;i<=1;i++){const o=add2(r,n,i*.55),a=G(...add2(o,v,-1.1-Math.abs(i)*.3),c,1),b=G(...add2(o,v,-2.9+Math.abs(i)*.3),c,1);p.addPath(ribbon([a,b],Math.max(8,.12*P3([r[0],1,r[1]],c)[2])*dash,{seed:50+i,taper:.5}));}
   mark(s,p);}
  // "stretch": the slide stamped as a yellow ghost at the contact frame
  const stamp=sm(q[3]+.5,q[3]+.8,t,easeOutBack);
  if(stamp>.002&&t<q[5])drawPlayer(s,SLIDE(SLIDE_CONTACT),c,GHOST,SLIDE_PLACE);
  // "block": the shot line from Foden's boot, stopped dead at the long leg, and a burst at the ball
  const blk=sm(q[4],q[4]+.35,t,easeOutBack)*(1-sm(q[5]+.4,q[5]+.8,t));
  if(blk>.01){const a=G(SHOT_AT[0],SHOT_AT[1],c,.12),b=G(BALL_B[0],BALL_B[1],c,.12),bp=P3([BALL_B[0],.13,BALL_B[1]],c);arrow(s,a,b,Math.max(10,.16*bp[2]),71,clamp(blk));
   sparkBurst(s,Y,bp[0],bp[1],1.1*bp[2],{n:10,seed:61,g:clamp(blk),width:.08*bp[2]});}
  // "Hard work wins it back": a ring round the ball, safe in Mendy's arms
  const won=sm(q[5]+.6,q[5]+1,t,easeOutBack);
  if(won>.01&&T>=T_CATCH-.05){const bp=P3(ballAt(T),c),r=Math.max(16,.34*bp[2])*won,p=new Path2D();p.arc(bp[0],bp[1],r,0,TAU);p.arc(bp[0],bp[1],r*.74,0,TAU,true);mark(s,p);}
  frame(s);
 },
 get still(){return Q(3)[5]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'rudiger-signature',format:'11v11',title:'The never-give-up tackle',theme:'Chase every ball; hard work wins it back',
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
/** Solved contact points (pitch metres; Chelsea's goal line at X=0, Z across) — checked by tests/play-film-rudiger-signature.cjs. */
export const FACTS={BALL_B,SHOT_AT,SLIDE_AT,CATCH_PT,T_SHOT,T_BLOCK,T_CATCH,ballAt,
 /** mid-sole of each of Rüdiger's boots at the block frame (my metres) */
 rudiFoot:(side:'l'|'r')=>{const sk=solve(SLIDE(SLIDE_CONTACT),RUDI.build,SLIDE_PLACE,FIG);return toMy(side==='l'?mid3(sk.lToe,sk.lHeel):mid3(sk.rToe,sk.rHeel));},
 /** mid-sole of each of Foden's boots at the shot frame (my metres) */
 fodenFoot:(side:'l'|'r')=>{const sk=solve(FSTRIKE(STRIKE_CONTACT),FODEN.build,FODEN_PLACE,FIG);return toMy(side==='l'?mid3(sk.lToe,sk.lHeel):mid3(sk.rToe,sk.rHeel));},
 rudiAt:(T:number)=>{const st=rudiState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 fodenAt:(T:number)=>{const st=fodenState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 speed:(id:string,T:number)=>{const k=id==='rudi'?RUDI_KEYS:id==='foden'?FODEN_KEYS:TR(id).keys;return Math.hypot(...velAt(k,T));}};
