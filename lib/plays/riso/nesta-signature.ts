/** Iconic-play film · Alessandro Nesta, "Signature: the elegant slide tackle" — shown through one real, sourced moment: Juventus v AC Milan,
 * UEFA Champions League final, 28 May 2003, Old Trafford, Manchester (0–0 after extra time, Milan won 3–2 on penalties), the 44th minute.
 *
 * WHY THIS MOMENT: Nesta's signature (lib/town/iconicPlays.json, kind "signature") is a trait — the clean, well-timed sliding challenge that
 * takes the ball and not the man. Wikipedia's account of his style: "known for his artistic sliding tackles, acrobatic clearances, and ability
 * to time his challenges well". The Guardian's minute-by-minute of the 2003 final records one specific Nesta challenge: "44 mins: Carnage in
 * the Milan penalty area, as the players from both side ping the ball back and forth. Brilliant defending from Alessandro Nesta denies Ciro
 * Ferrara, hooking the ball off the Juve defender's toe as he was about to bury it from two yards." That is the signature in a final: last-ditch,
 * two yards from goal, and clean — the ball taken, the man untouched, no foul. The account says "hooking", not "sliding": the film DRAWS it as
 * a low sliding hook (his signature, and the most plausible way to reach a ball off another player's toe from the side), but the narration only
 * says what the source says ("gets there first, and hooks it off his toe"; "his leg reaches in low") and never claims "slide" for this clip.
 * The lesson chapter then teaches the signature itself from the iconicPlays lesson: slide with your leg low and take the ball, not the player.
 *
 * A faithful recreation rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, Milan's goal line at X = 0 — the
 * Stretford End — Z across, away from the main camera on the south side, Y up) seen through TV cameras — 1 live, the high main camera (the ball
 * pinging around Milan's box, it drops to Ferrara two yards out, Nesta hooks it off his toe); 2 a TV slow-motion replay from a low camera in
 * front of the goal (eyes on the ball, the leg reaching in low, the ball taken, not Ferrara); 3 a second replay from behind Milan's goal, the
 * Stretford End (the ball spins away; nobody fouled; no goal); 4 the lesson (the only chapter with teaching marks: the slide path, the low leg
 * along the grass, a tick on the ball, a crossed-out ghost of a tackle into Ferrara's standing leg). No overlays inside the footage chapters.
 *
 * SOURCES (curl, Sept 2026, cached in scratchpad/films/src-cache/):
 *  - The Guardian, minute-by-minute, "AC Milan 0 - 0 Juventus", 28 May 2003 (the 44th-minute Nesta–Ferrara moment quoted above; "Juventus are
 *    playing into the Stretford End in the first half"; the line-ups with numbers: Nesta 13, Dida 12, Ferrara 2; Tudor off injured at 40')
 *    https://www.theguardian.com/football/2003/may/28/minutebyminute.sport  (src-cache/guardian-juv-mil-2003-mbm.txt)
 *  - Wikipedia, "Alessandro Nesta" (style of play: "artistic sliding tackles … ability to time his challenges well"; the 2003 final, Old
 *    Trafford, a Milan clean sheet) https://en.wikipedia.org/wiki/Alessandro_Nesta  (src-cache/wiki-alessandro-nesta.txt)
 *  - Wikipedia, "2003 UEFA Champions League final" (date, venue, 0–0, penalties 3–2, kick-off 20:45 CEST = 19:45 BST, clear weather)
 *    https://en.wikipedia.org/wiki/2003_UEFA_Champions_League_final  (src-cache/wiki-2003-ucl-final.txt)
 *  - Kits that night, as established for the same match's film (lib/plays/riso/shevchenko-penalty-2003.ts, from the Wikimedia Commons photo
 *    "Edgar Davids … clashing with Gennaro Gattuso - 20030528.jpg"): Milan ALL WHITE (red-and-black trim), Juventus black-and-white STRIPED
 *    shirts, black shorts, black socks. The Guardian (Michael Walker, 29 May 2003): Milan's fans "had draped the old Stretford End in AC's red
 *    and black".
 * CONFIRMED: the match, date, venue, the 44th minute (just before half-time) and 0–0 at the time; a scramble in the Milan penalty area with the
 *  ball going back and forth; the ball reached Ciro Ferrara (Juventus 2) about two yards out and he was about to shoot; Nesta (Milan 13) hooked
 *  the ball off his toe and denied him; no goal. Milan's goal in the first half was the Stretford End goal (Juventus attacked it), with
 *  Milan's fans behind it; kits as above; Dida (12) in Milan's goal.
 * INFERRED (not in the accounts; drawn, never narrated): that the hook was a low slide (his signature style), and Nesta's leading leg (right)
 *  and the side he came from (the far side, from Ferrara's right); Ferrara's shooting foot (right); how the scramble ran before it (every touch,
 *  path, height and time — drawn as a cross, a header, a blocked shot, a scuffed clearance, a deflection and a looping bounce, by unnamed,
 *  unnumbered players); where the ball went after the hook (along the six-yard box toward the near side); Dida's position and kit colour
 *  (yellow); all positions, timings and camera placements (main camera on the south side, so the Stretford End is screen-left — real
 *  geography); the evening light (about 20:30 BST in late May: sun low behind the Stretford End, floodlights on); stand shapes, crowd colours,
 *  hair and skin tones.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded (hash). Inks: yellow, red, blue, navy. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,hash,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,stand,strike,header,keeperSet,slideTackle,lunge,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and each chapter's `seconds` are
 * ESTIMATES until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in order, so no cue starts with a word that also appears
 * between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final',text:'Manchester, 2003: the Champions League final, Juventus against Milan. Just before half-time, the ball bounces around Milan\'s box. It drops to Ciro Ferrara, two yards out... Alessandro Nesta gets there first, and hooks it off his toe!',tail:1.7,
  cues:['Manchester','Juventus against','Just before','ball bounces','It drops','two yards','Alessandro Nesta','hooks it']},
 {label:'The replay',text:'Watch again, slowly. Nesta keeps his eyes on the ball. His leg reaches in low, and takes the ball, not Ferrara.',tail:1.4,
  cues:['Watch again','Nesta keeps','His leg','takes the ball','not Ferrara']},
 {label:'From behind the goal',text:'From behind the goal: the ball spins away. No foul, and no goal!',tail:1.6,
  cues:['From behind','spins away','No foul','no goal']},
 {label:'The lesson',text:'That\'s Nesta. Slide with your leg low, and take the ball, not the player!',tail:2,
  cues:['That\'s Nesta','Slide with','leg low','take the ball','not the player']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py nesta-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/nesta-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/nesta-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ the recorded Kokoro pace of the other films): .26 s + .025 s a letter per word, pauses after punctuation, × .87 */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.87*(.26+.025*w.replace(/[^a-z0-9]/gi,'').length);if(/[,;:]$/.test(w))t+=.19;if(/[.!?]$/.test(w))t+=.37;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('nesta: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 cs[0].at=0;
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** Cue onsets of chapter i (seconds), by index. Keep the counts [8,5,4,5]. */
const Q=(i:number)=>CHAPTERS[i].cues.map(c=>c.at);
const SECS=(i:number)=>CHAPTERS[i].seconds;

const Y='yellow',R='red',B='blue',K='navy';
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
/** a 3D bar (width w metres, flat to the camera) as a quad */
function bar3(p:Path2D,a:V3,b:V3,w:number,c:Cam){const A=P3(a,c),Bq=P3(b,c);if(A[2]<=0||Bq[2]<=0)return;const dx=Bq[0]-A[0],dy=Bq[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,wa=Math.max(1,w*A[2]/2),wb=Math.max(1,w*Bq[2]/2);
 p.moveTo(A[0]+nx*wa,A[1]+ny*wa);p.lineTo(Bq[0]+nx*wb,Bq[1]+ny*wb);p.lineTo(Bq[0]-nx*wb,Bq[1]-ny*wb);p.lineTo(A[0]-nx*wa,A[1]-ny*wa);p.closePath();}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};

// ---------------------------------------------------------------- Old Trafford, a clear May evening: four roofed stands, the Stretford End in red and black
/** stand planes (a along, b up the rake 0..1): 0 the Stretford End behind Milan's goal (x < 0; Milan's fans), 1 the tall North Stand facing the
 * main camera, 2 the east end, 3 the south side (the main camera's own stand) */
const STANDS:{P:(a:number,b:number)=>V3;top:number;cols:number;crowd:[number,number,number]}[]=[
 {P:(a,b)=>[-5-26*b,1.2+24*b,lerp(76,-8,a)],top:28,cols:70,crowd:[.2,.64,.93]},
 {P:(a,b)=>[lerp(-8,113,a),1.2+33*b,72+34*b],top:37,cols:110,crowd:[.36,.62,.9]},
 {P:(a,b)=>[110+26*b,1.2+24*b,lerp(-8,76,a)],top:28,cols:70,crowd:[.46,.5,.97]},
 {P:(a,b)=>[lerp(113,-8,a),1.2+25*b,-4-29*b],top:29,cols:110,crowd:[.36,.62,.9]},
];
const ROWS=11;
/** Milan banners on the Stretford End front (red | navy stripes) */
const BANNERS=[.12,.26,.4,.54,.68,.82];
function stadium(s:Sheet,c:Cam,o:{crowd?:boolean}={}){
 // a clear evening sky: a pale blue field, a warm glow low over the roofs
 s.field(B,.3,.5);
 const Bnd=4000,hz=P3([c.pos[0]+Math.sin(c.yaw)*1e4,0,c.pos[2]+Math.cos(c.yaw)*1e4],c)[1];
 s.tone(Y,polyPath([[-Bnd,hz-520],[Bnd,hz-560],[Bnd,Bnd],[-Bnd,Bnd]],true),.34);
 s.tone(R,polyPath([[-Bnd,hz-300],[Bnd,hz-320],[Bnd,Bnd],[-Bnd,Bnd]],true),.18);
 const planes=new Path2D(),shadow=new Path2D(),roof=new Path2D(),lip=new Path2D(),tiers=new Path2D();
 STANDS.forEach((st,i)=>{const S=st.P;addPoly(planes,[S(0,0),S(1,0),S(1,1),S(0,1)],c);if(i===0)addPoly(shadow,[S(0,0),S(1,0),S(1,1),S(0,1)],c);
  bar3(tiers,S(0,.5),S(1,.5),.5,c);
  addPoly(roof,[[...S(0,1)].map((v,k)=>k===1?v+1.5:v) as V3,[...S(1,1)].map((v,k)=>k===1?v+1.5:v) as V3,[S(1,.3)[0],st.top,S(1,.3)[2]],[S(0,.3)[0],st.top,S(0,.3)[2]]],c);
  bar3(lip,[S(0,.3)[0],st.top-.3,S(0,.3)[2]],[S(1,.3)[0],st.top-.3,S(1,.3)[2]],.8,c);});
 s.knockout(planes);s.tone(R,planes,.55);s.tone(K,planes,.3);s.tone(K,shadow,.2);s.knockout(tiers,.6);
 if(o.crowd!==false){// the crowd: seeded dots in each end's colours, sized by distance (paper · red · navy · blue)
  const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
  STANDS.forEach((st,si)=>{for(let j=0;j<ROWS;j++){const b=(j+.5)/ROWS;if(Math.abs(b-.5)<.05)continue;
   for(let i=0;i<st.cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/st.cols,q=P3(st.P(a,b),c);if(q[2]<=0||Math.abs(q[0])>1300||Math.abs(q[1])>900)continue;
    const z=clamp(q[2]*.55,2.4,16),u=hash(i*17+j*3+si,11),w=st.crowd,ink=u<w[0]?0:u<w[1]?1:u<w[2]?2:3;inks[ink].rect(q[0]-z/2,q[1]-z*.7,z,z*1.3);}}});
  s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(K,inks[2],.92);s.fill(B,inks[3],.9);}
 // Milan's red-and-black banners draped on the Stretford End front
 const rd=new Path2D(),bk=new Path2D(),S0=STANDS[0].P;
 for(const a of BANNERS)for(let k=0;k<6;k++){const P=(u:number,b:number)=>S0(a+u*.07,b);addPoly(k%2?bk:rd,[P(k/6,.01),P((k+1)/6,.01),P((k+1)/6,.09),P(k/6,.09)],c);}
 s.fill(R,rd,.95);s.fill(K,bk,.92);
 s.knockout(roof);s.tone(K,roof,.6);s.tone(B,roof,.3);s.knockout(lip);s.fill(Y,lip,.8);
}
/** grass, stripes, markings, boards */
function pitch(s:Sheet,c:Cam){
 const g=new Path2D();addPoly(g,[[-4.5,0,-3.5],[109.5,0,-3.5],[109.5,0,71.5],[-4.5,0,71.5]],c);s.knockout(g);s.fill(Y,g,.72);s.tone(B,g,.62);
 const st=new Path2D();for(let i=0;i<20;i+=2)addPoly(st,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,st,.14);
 // advertising boards: blue with paper panels
 const bd=new Path2D();for(const[a,b]of[[[-3,-2],[-3,70]],[[-2,70.8],[107,70.8]],[[-2,-2.8],[107,-2.8]]]as[[number,number],[number,number]][])addPoly(bd,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],.9,b[1]],[a[0],.9,a[1]]],c);
 s.knockout(bd);s.fill(B,bd,.9);s.tone(K,bd,.3);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
}
/** A goal at line gx whose net runs out by dir (Milan's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
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
 * negates z both ways — that keeps Nesta's RIGHT leg on his right and Ferrara's RIGHT boot on his right. */
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
const LIGHT:InkFill[]=[[R,.2]],OLIVE:InkFill[]=[[R,.2],[Y,.15]],DARK:InkFill[]=[[R,.85],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Milan all in white (red-and-black trim) */
const milan=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,trim:R,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Juventus in black-and-white stripes, black shorts and socks */
const juve=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin,hair:K,hairStyle:'short',line:K,trim:'paper',shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Nesta: centre-back, number 13, dark hair */
const NESTA:AthleteStyle=milan(OLIVE,{number:13,seed:13,build:{height:1.87,bulk:1}});
const FERRARA:AthleteStyle=juve(OLIVE,{number:2,seed:2,build:{height:1.80,bulk:1.05}});
const DIDA:AthleteStyle={shirt:Y,shorts:[K,.8],socks:Y,boots:K,skin:DARK,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:12,numberInk:K,scale:FIG,seed:12,build:{height:1.95}};
/** the lesson's marks: a yellow silhouette of a body */
const GHOST:AthleteStyle={shirt:[Y,.7],shorts:[Y,.7],socks:[Y,.7],boots:[Y,.7],skin:[[Y,.7]],hair:[Y,.7],line:Y,shade:null,shadow:false,sleeves:'short',scale:FIG,seed:13,build:NESTA.build,detail:'mid'};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T = 0 is Nesta's hook)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** where the ball drops for Ferrara: two yards out, just left of the goal's centre as Juventus attack */
const BALL0:[number,number]=[1.95,33.1];
const T_HOOK=0;
/** Nesta's slide heading: in from the far side (Ferrara's right), across the front of the goal toward the near side */
const H=nrm2(-.12,-1);
/** slide: duration, and the phase at which his right toe reaches the ball (just after he lands on his hip) */
const SLIDE_DUR=1.05,U_C=.46,LS=T_HOOK-U_C*SLIDE_DUR;
/** the library slide, the leading leg brought 10° lower as it reaches (the toe skims the grass, not knee-high) */
const slideAt=(u:number)=>{const p=slideTackle(u,{foot:'r'});p.rHipF-=.175*sm(.2,.42,u);return clampPose(p);};
/** the slide's body travel is frozen once the toe meets the ball (he stops short: the ball, not the man) */
const DX_C=slideAt(U_C).dx;
const TOE_OFF:V3=(()=>{const sk=solve(slideAt(U_C),NESTA.build,placeOf(0,0,H),FIG);return toMy(sk.rToe);})();
/** Nesta's spot, solved so his right toe touches the ball's far side at the hook */
const N_AT:[number,number]=[BALL0[0]-TOE_OFF[0]-H[0]*.1,BALL0[1]-TOE_OFF[2]-H[1]*.1];
/** Ferrara faces the goal and swings his right foot at where the ball was going (a touch further on): he never reaches it */
const F_H=nrm2(-1,.22),F_AIM:[number,number]=add2(BALL0,F_H,.2),F_CAP=.49,T_F=.12,SDUR=.95,F_START=T_F-STRIKE_CONTACT*SDUR;
const F_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),FERRARA.build,placeOf(0,0,F_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[F_AIM[0]-f[0]-F_H[0]*.1,F_AIM[1]-f[2]-F_H[1]*.1];})();
/** the hooked ball: off his toe, spinning away along the six-yard box toward the near side */
const D_OUT=nrm2(-.2,-1),T_REST=1.5,BALL_REST:[number,number]=add2(BALL0,D_OUT,5.2);

/** the scramble before it (inferred: every touch drawn, none named): [T, x, z, y at the touch, apex of the flight to the next, who touches, how] */
type Touch=[number,number,number,number,number,string,'kick'|'head'|'block'|'bounce'];
const TOUCHES:Touch[]=[
 [-9,19.5,52,.11,2.8,'j-a','kick'],       // a Juventus cross from the right of the box
 [-7.7,8.6,39.2,1.85,2.1,'m-a','head'],   // headed up and out by a Milan defender
 [-6.5,12.6,34,.11,.35,'j-b','kick'],     // knocked back in, low
 [-6.05,9.8,32.6,.3,2.6,'m-b','block'],   // blocked, it loops up
 [-4.7,5.9,29.4,.11,.6,'','bounce'],      // lands, bounces
 [-4.05,4.8,28.9,.11,.4,'m-c','kick'],    // a scuffed clearance
 [-3.55,6.3,30.6,.3,2.1,'j-c','block'],   // off a Juventus leg, up again
 [-1.75,3.5,32.7,.11,.42,'','bounce'],    // it bounces in the six-yard box…
 [T_HOOK,BALL0[0],BALL0[1],.2,0,'','bounce'],// …and drops for Ferrara, two yards out
];
function ballAt(T:number):V3{
 if(T<=TOUCHES[0][0])return[TOUCHES[0][1]+.6,.11,TOUCHES[0][2]+.3];
 for(let i=0;i<TOUCHES.length-1;i++){const a=TOUCHES[i],b=TOUCHES[i+1];if(T<b[0]){const u=(T-a[0])/(b[0]-a[0]);return[lerp(a[1],b[1],u),lerp(a[3],b[3],u)+4*a[4]*u*(1-u),lerp(a[2],b[2],u)];}}
 if(T<T_REST){const u=easeOut(clamp((T-T_HOOK)/(T_REST-T_HOOK))),p=add2(BALL0,D_OUT,5.2*u);return[p[0],.11+.09*(1-sm(0,.15,u))+.14*Math.max(0,Math.sin(u*Math.PI*1.2))*(1-u),p[1]];}
 return[BALL_REST[0],.11,BALL_REST[1]];
}
/** a touching player stands a step behind the ball, facing where it goes next */
const touchSpot=(i:number):[number,number]=>{const a=TOUCHES[i],b=TOUCHES[Math.min(i+1,TOUCHES.length-1)],d=nrm2(b[1]-a[1],b[2]-a[2]);return[a[1]-d[0]*.55,a[2]-d[1]*.55];};
const TS=(id:string)=>TOUCHES.findIndex(t=>t[5]===id);
const at=(id:string,T:number):number[]=>{const i=TS(id),p=touchSpot(i);return[T,p[0],p[1]];};
type Track={id:string;style:AthleteStyle;keys:number[][]};
const NES_KEYS=[[-10,9.5,41],[-7.7,7.6,40.4],[-6,6.2,38.8],[-4,4.8,37.8],[-2,3.8,36.6],[LS,...N_AT]];
const FER_KEYS=[[-10,17,30],[-7.6,12.5,31.5],[-5.5,8.8,31],[-3.6,6.8,32.4],[-1.8,4.4,33],[F_START,...F_AT]];
const TRACKS:Track[]=[
 {id:'nesta',style:NESTA,keys:NES_KEYS},
 {id:'ferrara',style:FERRARA,keys:FER_KEYS},
 // everyone else (not named in the accounts; positions illustrative, no numbers printed)
 {id:'m-a',style:milan(OLIVE,{seed:21}),keys:[[-10,10.5,42],at('m-a',-7.7),[-6,7.8,38],[-3,5.4,36],[T_HOOK,4.2,35],[T_REST+1,3.4,30],[T_REST+4,3,29]]},
 {id:'m-b',style:milan(LIGHT,{seed:22}),keys:[[-10,12,33],[-7.4,11.2,33],at('m-b',-6.05),[-4,8.4,31.5],[T_HOOK,6.8,31.4],[T_REST+3,5.6,30]]},
 {id:'m-c',style:milan(LIGHT,{seed:23,hairStyle:'balding'}),keys:[[-10,8.2,26],[-6,6.4,27.4],at('m-c',-4.05),[-2,4.2,28.4],[T_HOOK,3.6,28.6],[T_REST+3,2.8,27.4]]},
 {id:'m-d',style:milan(OLIVE,{seed:24}),keys:[[-10,17,40],[-6,14.6,37],[-3,12.4,35],[T_HOOK,10.8,33.6],[T_REST+3,9.6,32]]},
 {id:'m-e',style:milan(LIGHT,{seed:25}),keys:[[-10,15,22],[-6,12.2,24],[-3,9.6,25.4],[T_HOOK,8.4,26.4],[T_REST+3,7.4,26.8]]},
 {id:'j-a',style:juve(LIGHT,{seed:31}),keys:[[-10,22,54.5],at('j-a',-9),[-7,18.6,49],[-3,16.4,44],[T_REST+3,14.6,41]]},
 {id:'j-b',style:juve(OLIVE,{seed:32}),keys:[[-10,17.5,36],[-7.4,14.4,34.8],at('j-b',-6.5),[-4.5,11,33],[T_HOOK,9.6,32.4],[T_REST+3,9,31.4]]},
 {id:'j-c',style:juve(LIGHT,{seed:33}),keys:[[-10,11,28],[-6,8.2,29.4],at('j-c',-3.55),[-2,5.4,31],[T_HOOK,4.6,31.2],[T_REST+3,3.8,30.4]]},
 {id:'j-d',style:juve(OLIVE,{seed:34,hairStyle:'long'}),keys:[[-10,14,45],[-6,9.8,43],[-3,6.8,41],[T_HOOK,5.4,39.4],[T_REST+3,4.6,38]]},
];
const DIDA_Z=(T:number)=>{const b=ballAt(Math.min(T,T_HOOK));return clamp(lerp(34,b[2],.55),31.4,36.6);};
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-10.2);for(let t=-10;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>1.2)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
/** Nesta: tracking the scramble goal-side, then the slide on his right side (on the grass from .4), the right toe reaching the ball at the
 * hook; his body stops short there and the leg draws back — nothing of him reaches Ferrara. */
function nestaState(T:number):St{
 if(T<LS){const st=runState(NES_KEYS,T),h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],H,sm(LS-.7,LS-.1,T));
  const p=trackAt(NES_KEYS,T);return{pose:lookAtBall({pose:st.pose,place:placeOf(p[0],p[1],h)},T,.6*(1-sm(LS-.6,LS,T))),place:placeOf(p[0],p[1],h)};}
 const place=placeOf(N_AT[0],N_AT[1],H),u=clamp((T-LS)/SLIDE_DUR),from=runState(NES_KEYS,LS,H).pose;
 const p=blendPose(from,slideAt(u),sm(0,.12,u));
 if(u>U_C){p.dx=DX_C+.12*easeOut(clamp((u-U_C)/(1-U_C)));
  const r=sm(T_HOOK,T_HOOK+.18,T,easeInOutSine);p.rKnee+=.9*r;p.rHipF-=.2*r;p.rHipA+=.18*r;p.neckY+=-.5*sm(T_HOOK+.2,T_HOOK+1,T);}
 if(T>LS+SLIDE_DUR){const r=sm(LS+SLIDE_DUR+.3,LS+SLIDE_DUR+1.6,T,easeInOutSine);p.lean+=.35*r;p.pitch+=.35*r;p.rShF-=.4*r;}// propping up on an arm, watching it go
 return{pose:clampPose(p),place};
}
/** Ferrara: in with the scramble, then the right-foot shot at a ball that is no longer there, and up, looking after it */
function ferraraState(T:number):St{
 if(T<F_START){const st=runState(FER_KEYS,T),p=trackAt(FER_KEYS,T),h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],F_H,sm(F_START-.8,F_START,T));
  return{pose:lookAtBall({pose:st.pose,place:placeOf(p[0],p[1],h)},T,.6),place:placeOf(p[0],p[1],h)};}
 const u=clamp((T-F_START)/SDUR),place=placeOf(F_AT[0],F_AT[1],F_H),T_CHK=F_START+F_CAP*SDUR;
 // the swing checks just short of where the ball was: nothing left to hit, and Nesta's boot is there
 if(T<T_CHK)return{pose:strike(u,{foot:'r',power:.8}),place};
 const h=yawTo(F_H,nrm2(BALL_REST[0]-F_AT[0],BALL_REST[1]-F_AT[1]),sm(T_CHK+.1,T_CHK+.9,T));
 const pose=keyPoses(clamp((T-T_CHK)/.7),[[0,strike(F_CAP,{foot:'r',power:.8})],[1,stand()]]);
 return{pose:lookAtBall({pose,place:placeOf(F_AT[0],F_AT[1],h)},T,.7),place:placeOf(F_AT[0],F_AT[1],h)};
}
function didaState(T:number):St{const x=.7,z=DIDA_Z(T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
/** the others: along their tracks, and their touch in the scramble (a kick, a header or a block) */
function extraState(id:string,T:number):St{
 const st=runState(TR(id).keys,T);let pose=lookAtBall(st,T,.5);const i=TS(id);
 if(i>=0){const tt=TOUCHES[i][0],kind=TOUCHES[i][6],w=win(T,tt-.5,tt+.5,.2);
  if(w>0){const pm=kind==='kick'?strike(clamp(STRIKE_CONTACT+(T-tt)/.9),{foot:'r',power:.6}):kind==='head'?header(clamp(.52+(T-tt)/1)):lunge(clamp(.6+(T-tt)/.9));pose=blendPose(pose,pm,w);}}
 return{pose,place:st.place};
}
function stateOf(id:string,T:number):St{
 if(id==='nesta')return nestaState(T);if(id==='ferrara')return ferraraState(T);if(id==='dida')return didaState(T);return extraState(id,T);
}
const HEROES=['nesta','ferrara'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, the pitch, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the two heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium){stadium(s,c);pitch(s,c);}
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'dida'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<2.5)continue;// nobody printed right against the lens
  const style=id==='dida'?DIDA:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero||(!o.wide&&g[2]>190)?'auto' as const:'low' as const};// close extras print their kit (Juventus stripes) too
  const fast=(id==='nesta'&&T>LS+.05&&T<T_HOOK+.25)||(id==='ferrara'&&Math.abs(T-T_F)<.25);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_HOOK)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*(T>T_HOOK?14:6),key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the south side, the Stretford End screen-left, panning with the scramble; closing in as it drops. */
const MAIN_CAM:V3=[28,21,-31];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-10],[q[2],-8.6],[q[3],-6.8],[q[4],-2.2],[q[5],-.9],[q[6],-.35],[q[7]+.15,T_HOOK+.08],[S,T_REST+.4]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.min(T,T_REST)),tx=clamp(lerp(b[0],4,.3),5,16),tz=lerp(38,33.5,sm(-8,-1,T)),F=lerp(3300,6400,sm(-6,T_HOOK,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.3*p[2]),12);},
 get still(){return Q(0)[7]+.5;},
};
/** 2 · TV slow-motion replay from a raised camera out by the penalty spot, over Ferrara's left shoulder: the goal and the Stretford End
 * behind; Nesta in from the right, eyes on the ball, the long low leg, the ball taken, Ferrara's swing at nothing. The replay keeps only the
 * players near the goalmouth (the others stand behind this camera or across its lens). */
const LOW_CAM:V3=[9.5,3.3,31];
const REPLAY_CAST=['nesta','ferrara','dida','ball','j-d'];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-1.6],[q[1],-.95],[q[2],LS+.25],[q[3]+.3,T_HOOK],[q[4]+.3,T_HOOK+.3],[S,T_HOOK+.75]]);};
const cam2=(t:number)=>{const T=t2(t),u=sm(-1.5,T_HOOK,T,easeInOutSine),tx=lerp(2.8,2.1,u),tz=lerp(35,33.9,u),F=lerp(1650,2050,u);
 return camAt(LOW_CAM,[tx,.8,tz],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6,only:REPLAY_CAST});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(1)[3]+.5;},
};
/** 3 · the second replay, from the Stretford End behind Milan's goal line, just outside the near post (clear of the net): Nesta slides toward
 * us, the ball spins away down the six-yard box toward the lens; Ferrara stands, nobody fouled, no goal. */
const BEHIND:V3=[-5.5,4.2,20.5];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_HOOK-.45],[q[1]+.2,T_HOOK+.35],[q[2],T_HOOK+.9],[q[3],T_REST],[S,T_REST+1.6]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(T),f=sm(T_HOOK,T_REST,T,easeInOutSine),tx=lerp(2.2,lerp(b[0],2.4,.5),f),tz=lerp(33.4,lerp(b[2],32.5,.5),f),F=lerp(2700,2300,f);
 return camAt(BEHIND,[tx,.8,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.25*p[2]),12);},
 get still(){return Q(2)[1]+.4;},
};
/** 4 · the lesson plate: the moment again from a raised pitch-side camera, with bold yellow teaching marks — a ring round Nesta, the slide path
 * on the grass (slide), a bar along his low leading leg (leg low), a burst and a tick at the ball (take the ball), and a yellow ghost of a
 * tackle into Ferrara's standing leg, crossed out (not the player). */
const LESSON_CAM:V3=[9.5,5.6,24.5];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,LS-.4],[q[1],LS],[q[2]+.2,LS+.35],[q[3]+.3,T_HOOK],[S,T_HOOK+.1]]);};
const LESSON_MID:[number,number]=[(N_AT[0]+BALL0[0]+F_AT[0])/3,(N_AT[1]+BALL0[1]+F_AT[1])/3];
const cam4=(t:number)=>camAt(LESSON_CAM,[LESSON_MID[0]+.3,.5,LESSON_MID[1]+.2],2300);
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
/** the tackle he did NOT make: a slide aimed through Ferrara's standing leg */
const GHOST_H=nrm2(F_AT[0]-N_AT[0]-.4,F_AT[1]-N_AT[1]),GHOST_PLACE=placeOf(N_AT[0]+.5,N_AT[1]-.2,GHOST_H);
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c,{crowd:false});pitch(s,c);
  // "That's Nesta": a yellow ring on the grass round him (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.1,q[1]+.5,t));
  if(hal>.01){const m=nestaState(T).place;groundRing(s,m.x!,-m.z!,1.1*hal,c);}
  // "Slide with …": the slide's path on the grass, from where he goes down to the ball
  const path=sm(q[1],q[1]+.6,t,easeOut)*(1-sm(q[4]-.2,q[4]+.2,t));
  if(path>.01){const a=G(N_AT[0]+H[0]*.4,N_AT[1]+H[1]*.4,c),b=G(BALL0[0],BALL0[1]-H[1]*.25,c),w=Math.max(12,.22*P3([N_AT[0],0,N_AT[1]],c)[2]);arrow(s,a,b,w,31,path);}
  // "leg low": a bar on the grass under his leading leg, hip to boot
  const leg=sm(q[2],q[2]+.35,t,easeOutBack)*(1-sm(q[3]+.4,q[3]+.8,t));
  if(leg>.01){const st=nestaState(T),sk=solve(st.pose,NESTA.build,st.place,FIG),hp=toMy(sk.rHip),tp=toMy(sk.rToe),p=new Path2D(),a=G(hp[0],hp[2],c),b=G(tp[0],tp[2],c),w=Math.max(10,.16*P3([tp[0],0,tp[2]],c)[2])*leg;
   p.addPath(ribbon([a,[lerp(a[0],b[0],clamp(leg)),lerp(a[1],b[1],clamp(leg))]],w,{seed:41,taper:0,wobble:.6}));mark(s,p);}
  drawPlay(s,T,c,{ballScale:1.5,only:['nesta','ferrara','dida','ball'],noStadium:true});
  // "take the ball": a burst at the ball and a tick
  const stamp=sm(q[3]+.3,q[3]+.65,t,easeOutBack);
  if(stamp>.002&&t<q[4]+.2){const bp=P3(ballAt(T_HOOK),c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   const k=.9*bp[2]*clamp(stamp),x=bp[0]-1.1*bp[2],y=bp[1]-1.5*bp[2];mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(stamp),{seed:71,taper:.15}));}
  // "not the player": the tackle he didn't make, a yellow ghost sliding through Ferrara's standing leg, and a big cross over it
  const dive=sm(q[4]-.1,q[4]+.3,t,easeOutBack);
  if(dive>.01){drawPlayer(s,slideTackle(.3+.3*clamp(dive)),c,GHOST,GHOST_PLACE);
   const ctr=P3([F_AT[0]+.1,.45,F_AT[1]-.3],c),r=.95*ctr[2]*clamp((t-q[4]-.25)/.3),w=Math.max(10,.18*ctr[2]);
   if(r>1){const x=new Path2D();x.addPath(ribbon([[ctr[0]-r,ctr[1]-r*.8],[ctr[0]+r,ctr[1]+r*.8]],w,{seed:81,taper:.1}));x.addPath(ribbon([[ctr[0]-r,ctr[1]+r*.8],[ctr[0]+r,ctr[1]-r*.8]],w,{seed:82,taper:.1}));mark(s,x);}}
  frame(s);
 },
 get still(){return Q(3)[4]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'nesta-signature',format:'11v11',title:'Nesta: the clean slide tackle',theme:'Leg low: take the ball, not the player',
 ageNote:'Juventus v AC Milan · Champions League final, 28 May 2003 · Old Trafford, Manchester',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Milan's goal line at X = 0, Z across) — checked by tests/play-film-nesta-signature.cjs. */
const skOf=(id:'nesta'|'ferrara',T:number)=>{const st=stateOf(id,T);return solve(st.pose,(id==='nesta'?NESTA:FERRARA).build,st.place,FIG);};
export const FACTS={BALL0,BALL_REST,N_AT,F_AT,T_HOOK,T_F,ballAt,
 /** Nesta's right toe at the hook (my metres) */
 nestaToe:(T=T_HOOK)=>toMy(skOf('nesta',T).rToe),
 /** every boot point of a player at T (my metres) */
 boots:(id:'nesta'|'ferrara',T:number)=>{const sk=skOf(id,T);return[sk.lToe,sk.lHeel,sk.rToe,sk.rHeel,sk.lAn,sk.rAn].map(toMy);},
 /** Nesta's lower-body points (boots, ankles, knees, hips, pelvis) at T — for the "not the player" check */
 nestaBody:(T:number)=>{const sk=skOf('nesta',T);return[sk.lToe,sk.lHeel,sk.rToe,sk.rHeel,sk.lAn,sk.rAn,sk.lKn,sk.rKn,sk.lHip,sk.rHip,sk.pelvis].map(toMy);},
 ferraraLegs:(T:number)=>{const sk=skOf('ferrara',T);return[sk.lToe,sk.lHeel,sk.rToe,sk.rHeel,sk.lAn,sk.rAn,sk.lKn,sk.rKn].map(toMy);},
 ferraraRightToe:(T=T_F)=>toMy(skOf('ferrara',T).rToe),
 nestaPelvisY:(T=T_HOOK)=>skOf('nesta',T).pelvis[1],
 nestaAt:(T:number)=>{const st=stateOf('nesta',T);return[st.place.x!,-st.place.z!] as [number,number];}};
