/** Iconic-play film · Giorgio Chiellini, "Signature: the fierce block tackle" — shown through one real, sourced moment: Italy v England,
 * UEFA Euro 2020 final, Sunday 11 July 2021, Wembley Stadium, London (1–1 after extra time, Italy won 3–2 on penalties), the 96th minute.
 *
 * WHY THIS MOMENT: Chiellini's signature (lib/town/iconicPlays.json) is a trait — the fierce, last-ditch block — and its lesson is teamwork:
 * "talk to your partner and cover each other". The written accounts of the final record one clean Chiellini block at a decisive moment: in
 * the first half of extra time Raheem Sterling ran in from the left after a pass by Jordan Henderson, drove into the box and tried to find
 * Harry Kane or Bukayo Saka in the middle — Sky Sports' commentary called it a "big, big chance for England" — and Chiellini blocked it and
 * cleared it behind for a corner. The accounts also describe Chiellini as a vocal leader who organised his back line, and his partnership
 * with Leonardo Bonucci as "one of the most solid and complementary in international football": the lesson. (The film deliberately does
 * NOT show the 90th-minute shirt-pull on Saka; it is a clean, positive moment.)
 *
 * A faithful recreation rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, Italy's goal line at X=0, Z across,
 * away from the main-stand camera, Y up) seen through TV cameras, at night under the Wembley floodlights — 1 live, the high main camera on
 * the side (Henderson to Sterling, the drive into the box, the pass for Kane, blocked, corner); 2 a TV slow-motion replay from a low camera
 * on the near side (Chiellini covering the middle, in the lane of the pass; the stretch and the block); 3 a second replay from behind Italy's
 * goal (the ball off his boot and behind for a corner); 4 the lesson (the only chapter with teaching marks: the partners ringed, talk marks
 * between them, one goes to the ball, the other covers the lane, the block). No overlays inside the footage chapters.
 *
 * SOURCES (fetched Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Euro 2020 final" (raw wikitext; match summary citing the Sky Sports and Guardian minute-by-minutes; line-ups; kits;
 *    weather): "In the 96th minute, Sterling ran in from the left, following a pass by Henderson. In what the Sky Sports live commentary
 *    team described as a 'big, big chance for England', Sterling tried to find Kane or Saka in the middle, but Italy's Chiellini cleared for
 *    a corner." https://en.wikipedia.org/wiki/UEFA_Euro_2020_final
 *  - Sky Sports match report, "Italy 1-1 England (3-2 pens)", 11 July 2021: "Chiellini showed the more admirable side of his game five
 *    minutes after the restart, making a crucial block after Sterling drove into the box, before Phillips shot wide from the resulting
 *    corner." Player rating Chiellini 7. (cached sky-ita-eng-2021-report)
 *  - Sky Sports live blog, 11 July 2021: "Some incredible defending from Chiellini and England are in the ascendancy."
 *  - Wikipedia, "Giorgio Chiellini" (raw wikitext): height 1.87 m; "A left-footed defender"; tenacious "stopper" and ball-winner "often
 *    partnered with a ball-playing centre-back, such as Bonucci"; "vocal leadership on the pitch", "an ability to organise his back-line";
 *    "the subsequent Bonucci–Chiellini axis was considered ... one of the most solid and complementary in international football"; he
 *    captained Italy to the Euro 2020 title. https://en.wikipedia.org/wiki/Giorgio_Chiellini
 *  - lib/plays/riso/donnarumma-shootout-2021.ts (read-only) for the same night's Wembley, kits and inks.
 * CONFIRMED by those accounts: the match, the date (11 July 2021), Wembley, a 20:00 kick-off (so extra time is under floodlights), cloudy,
 * 19 °C, after rain; the 96th minute (extra time); Henderson's pass; Sterling running in from the LEFT and driving into the box; his attempt
 * to find Kane or Saka in the middle; Chiellini's block, cleared behind for a corner; Phillips's low shot wide from that corner (not shown).
 * Numbers: Chiellini 3 (captain), Bonucci 19, Di Lorenzo 2, Emerson 13, Jorginho 8, Donnarumma 21; Sterling 10, Kane 9, Saka 25 (on 71'),
 * Henderson 8 (on 74'), Mount 19 (until 99'). Italy in blue shirts, dark blue shorts, blue socks; England all white. Chiellini is 1.87 m and
 * left-footed; Italy played 4–3–3 with Chiellini at left centre-back beside Bonucci.
 * INFERRED (not in the accounts; drawn, never narrated): which end Italy defended in that half of extra time (here screen-left from the main
 * camera), every position, path, speed and timing; that Sterling passed with his right foot (low, across toward Kane); that Chiellini had
 * come across to cover the middle while Bonucci went to Sterling (the positions of the lesson); that he blocked with his left leg in a
 * stretching lunge (a block, never drawn or narrated as a slide); the angle of the deflection and where the ball stopped; all other players
 * and their positions (no numbers printed for the unnamed ones); Donnarumma's keeper kit (charcoal, as in the approved shoot-out film);
 * the crowd colours, the camera placements and lenses, the arch placed behind the far stand. The narration names only confirmed beats
 * plus the sourced trait (Chiellini "always talking" with his partner Bonucci — his vocal, organising leadership).
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,hash,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,backpedal,lunge,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and each chapter's `seconds`
 * are ESTIMATES until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in order — no cue starts with a word that also
 * appears between it and the previous cue. Scenes read cues by index (Q(i)[k]) — keep the counts [7,5,4,5]. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final',text:'Wembley, the Euro 2020 final, extra time. Henderson finds Raheem Sterling on the left. Sterling drives into the box and tries to pass to Kane… But Giorgio Chiellini is there. Blocked! Corner.',tail:2.2,
  cues:['Wembley','Henderson','drives','tries','Giorgio','Blocked','Corner']},
 {label:'The replay',text:'Watch again, slowly. Chiellini covers the middle, right where the pass must go. He stretches, and blocks it.',tail:1.6,
  cues:['Watch','covers','right where','stretches','blocks']},
 {label:'Behind the goal',text:'From behind the goal: off his boot, and out. England’s big chance is gone.',tail:1.8,
  cues:['From','off','out','England’s']},
 {label:'The lesson',text:'That’s teamwork. Chiellini was always talking to his partner, Bonucci. Defenders: talk to your partner, and cover each other!',tail:1.8,
  cues:['That’s teamwork','always talking','Bonucci','talk to your','cover each other']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py chiellini-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/chiellini-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/chiellini-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ .32 s a word, calibrated on the approved films' Kokoro timings): .2 s + .02 s a letter, pauses after , . ! ? … */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/…$/.test(w))t+=.5;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('chiellini: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** Cue onsets of chapter i (seconds). */
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
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};
/** a 3D segment as a projected ribbon (metres wide), for lamps and roof edges */
function seg3(p:Path2D,a:V3,b:V3,wm:number,c:Cam){const d:V3=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],up:V3=Math.abs(d[1])>Math.hypot(d[0],d[2])?[wm/2,0,0]:[0,wm/2,0];
 addPoly(p,[[a[0]-up[0],a[1]-up[1],a[2]-up[2]],[b[0]-up[0],b[1]-up[1],b[2]-up[2]],[b[0]+up[0],b[1]+up[1],b[2]+up[2]],[a[0]+up[0],a[1]+up[1],a[2]+up[2]]],c);}

// ---------------------------------------------------------------- Wembley at night: three tiers of red seats, the crowd, the roof lights, the arch
/** stand planes (a along, b up the rake 0..1): 0 the far side (z > 68, the arch behind it), 1 the east end (x > 105), 2 the near side (the
 * main camera's stand, z < 0), 3 the west end behind Italy's goal (x < 0) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-17,122,a),1.2+40*b,76+40*b],
 (a,b)=>[113+38*b,1.2+40*b,lerp(96,-28,a)],
 (a,b)=>[lerp(122,-17,a),1.2+36*b,-8-36*b],
 (a,b)=>[-8-38*b,1.2+40*b,lerp(-28,96,a)],
];
const STAND_COLS=[84,56,84,56],STAND_ROWS=15;
/** the dark fascias between Wembley's three tiers (b ranges up the rake) */
const FASCIA:[number,number][]=[[.3,.36],[.6,.66]];
/** the arch: a 315 m span rising 133 m, leaning back over the far stand (side inferred) */
const DEG=Math.PI/180;
const ARCH:V3[]=Array.from({length:25},(_,i)=>{const u=i/24,y=133*(1-Math.pow(2*u-1,2));return[52.5+(u-.5)*315,y,130+y*Math.tan(22*DEG)];});
/** crowd colour weights per stand: [paper (England white), red (England red / seats), blue (Italy), yellow (scarves, phones)] — inferred */
const CROWD_MIX:[number,number,number,number][]=[[.38,.28,.28,.06],[.4,.3,.24,.06],[.38,.28,.28,.06],[.34,.26,.34,.06]];
function stadium(s:Sheet,c:Cam,which:number[]=[0,1,3]){
 // a cloudy London night after the rain: deep navy over the paper
 s.field(K,.86,.5);
 // the arch (behind the far roof): a paper tube in the night sky
 {const pts:Pt[]=[];let ok=true;for(const p of ARCH){const q=toCam(p,c);if(q[2]<8){ok=false;break;}pts.push([c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
  if(ok){const w=clamp(7.4*c.F/toCam(ARCH[12],c)[2],3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.85);s.tone(B,tube,.12);}}
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,[S(0,0),S(1,0),S(1,1),S(0,1)],c);for(const[b0,b1]of FASCIA)addPoly(fas,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)],c);
  const r0=S(0,1),r1=S(1,1),r2=S(1,.86),r3=S(0,.86);addPoly(roof,[[r0[0],r0[1]+1.5,r0[2]],[r1[0],r1[1]+1.5,r1[2]],[r2[0],r2[1]+11,r2[2]],[r3[0],r3[1]+11,r3[2]]],c);
  seg3(edge,[r3[0],r3[1]+10.8,r3[2]],[r2[0],r2[1]+10.8,r2[2]],.45,c);}
 // Wembley's red seats in the dark (red × navy), the tier fascias dark with a thin lit band
 s.knockout(planes);s.tone(R,planes,.5);s.tone(K,planes,.45);s.knockout(fas);s.fill(K,fas,.85);s.tone(Y,fas,.18);
 // the crowd: England white and red, Italy blue, a scatter of yellow
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,q=P3(S(a,b),c);if(!onScreen(q))continue;
   const z=clamp(q[2]*.5,2.4,26),u=(h-.22)/.78,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(q[0]-z/2,q[1]-z*.7,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(R,inks[1],.95);s.knockout(inks[2],.7);s.fill(B,inks[2],.95);s.knockout(inks[3],.8);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 // floodlights along the roof lip with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=S(u-.025,.86),b=S(u+.025,.86),m=S(u,.86);a[1]+=10;b[1]+=10;m[1]+=10;if(toCam(m,c)[2]<NEAR+2)continue;seg3(lamp,a,b,1.1,c);
  const g=P3(m,c);if(onScreen(g)){const r=clamp(g[2]*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 ground(s,c);
}
/** grass under the floodlights (yellow under blue), mowing stripes, boards, lines, corner flags */
function ground(s:Sheet,c:Cam){
 const grass=new Path2D();addPoly(grass,[[-7,0,-7],[112,0,-7],[112,0,75],[-7,0,75]],c);s.knockout(grass);s.fill(Y,grass,.88);s.tone(B,grass,.7);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(B,stripes,.2);
 // advertising boards: navy with yellow panels, round the touchlines and behind the goals
 const bd=new Path2D(),pn=new Path2D(),board=(a:[number,number],b:[number,number])=>addPoly(bd,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],.95,b[1]],[a[0],.95,a[1]]],c);
 board([-5,72],[110,72]);board([-5,-4],[-5,72]);board([110,-4],[110,72]);
 for(let k=0;k<18;k++){const x=-2+k*6.4;addPoly(pn,[[x,.25,71.9],[x+3.4,.25,71.9],[x+3.4,.68,71.9],[x,.68,71.9]],c);}
 for(const xx of[-4.9,109.9])for(let k=0;k<11;k++){const z=-2+k*6.8;addPoly(pn,[[xx,.25,z],[xx,.25,z+3.6],[xx,.68,z+3.6],[xx,.68,z]],c);}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x+(x?-.5:.5),1.38,z],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl,.95);}
}
/** A goal at line gx whose net runs out by dir (Italy's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));// the mesh never prints tighter than ~34 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),sg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){sg([bx,0,z],[bx,bh,z]);sg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){sg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])sg([gx,y*h/bh,z],[bx,y,z]);}
  for(let x=0;x<=2.01;x+=sp)for(const z of[z0,z1])sg([gx+dir*x,0,z],[gx+dir*x,lerp(h,bh,x/2),z]);
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Chiellini's LEFT leg on his left and Sterling's RIGHT boot on his right. */
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
// skin: the approved shoot-out film's screens (same night, same inks)
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_D:InkFill[]=[[Y,.8],[R,.62],[K,.28]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Italy: blue shirts, dark-blue (navy) shorts, blue socks (sourced); paper numbers and trim (inferred) */
const italy=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[K,.9],socks:[B,.95],boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],trim:'paper',numberInk:'paper',sleeves:'short',scale:FIG,...o});
/** England: all white (sourced); navy trim and numbers */
const england=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],trim:K,numberInk:K,sleeves:'short',scale:FIG,...o});
/** Chiellini: centre-back, number 3, captain, 1.87 m, dark hair */
const CHIELLINI:AthleteStyle=italy(SKIN_M,{number:3,seed:3,hair:K,build:{height:1.87,bulk:1.06}});
const BONUCCI:AthleteStyle=italy(SKIN_M,{number:19,seed:19,hair:[K,.9],build:{height:1.90,bulk:1.02}});
const STERLING:AthleteStyle=england(SKIN_D,{number:10,seed:10,hair:[K,.95],build:{height:1.70,bulk:1}});
const KANE:AthleteStyle=england(SKIN_L,{number:9,seed:9,hair:[K,.6],build:{height:1.88,bulk:1.02}});
const HENDERSON:AthleteStyle=england(SKIN_L,{number:8,seed:8,hair:[K,.7],build:{height:1.82}});
const SAKA:AthleteStyle=england(SKIN_D,{number:25,seed:25,hair:[K,.95],build:{height:1.78,bulk:.95}});
/** Gianluigi Donnarumma, 1.96 m; a charcoal keeper kit with long sleeves and paper gloves (colour NOT verified) */
const GIGI:AthleteStyle={shirt:[K,.72],shorts:[K,.85],socks:[K,.72],boots:K,skin:SKIN_L,hair:[K,.95],line:K,shade:[K,.26],trim:[B,.8],gloves:'paper',sleeves:'long',hairStyle:'short',number:21,numberInk:'paper',build:{height:1.96,bulk:1.04},scale:FIG,seed:21};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Henderson's pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const T_HPASS=0,T_RECV=1.0,T_PASS=3.8,T_BLOCK=3.94,T_OUT=T_BLOCK+.6,T_REST=T_BLOCK+1.8;
/** Sterling passes from here: inside the area, its left side as England attack (the near side), low and across toward Kane in the middle */
const PASS_BALL:[number,number]=[12.6,21.4],KANE_SPOT:[number,number]=[9.6,35],PASS_D=nrm2(KANE_SPOT[0]-PASS_BALL[0],KANE_SPOT[1]-PASS_BALL[1]);
/** where the pass meets Chiellini: 2.4 m down the lane */
const BLOCK_XZ:[number,number]=add2(PASS_BALL,PASS_D,2.4);
/** Chiellini faces the passer; the lunge puts his LEFT boot (he is left-footed) across the lane */
const C_H=nrm2(-PASS_D[0]+.2,-PASS_D[1]);
const LUNGE_DUR=.7,LUNGE_REACH=.6,LS=T_BLOCK-LUNGE_REACH*LUNGE_DUR;
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
const C_AT:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH,{side:'l'}),CHIELLINI.build,placeOf(0,0,C_H),FIG),f=toMy(midSole(sk.lToe,sk.lHeel));return[BLOCK_XZ[0]-f[0],BLOCK_XZ[1]-f[2]];})();
const BLOCK_Y:number=(()=>{const sk=solve(lunge(LUNGE_REACH,{side:'l'}),CHIELLINI.build,placeOf(C_AT[0],C_AT[1],C_H),FIG);return Math.max(.14,toMy(midSole(sk.lToe,sk.lHeel))[1]+.13);})();
const BLOCK:V3=[BLOCK_XZ[0],BLOCK_Y,BLOCK_XZ[1]];
/** Sterling's pass: right foot, his body still turned a little toward goal from the drive */
const STRIKE_DUR=1,S_START=T_PASS-STRIKE_CONTACT*STRIKE_DUR,S_H=nrm2(PASS_D[0]-.45,PASS_D[1]);
const S_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),STERLING.build,placeOf(0,0,S_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[PASS_BALL[0]-f[0]-S_H[0]*.13,PASS_BALL[1]-f[2]-S_H[1]*.13];})();
/** off Chiellini's boot, bouncing, over the goal line wide of the near post (a corner), then to rest behind the line */
const OUT_D=nrm2(-1,-.3),OUT_AT:[number,number]=[0,BLOCK_XZ[1]+OUT_D[1]/OUT_D[0]*(0-BLOCK_XZ[0])],BALL_REST:[number,number]=[-3.4,OUT_AT[1]-1.2];
const RECV:[number,number]=[26.2,11.4];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const HEN_KEYS=[[-6,46,27],[-3,41.5,24],[T_HPASS,37.4,21.6],[1,36,20.9],[3,33.2,20.4],[T_REST+3,29,21]];
const STE_KEYS=[[-6,40,5.5],[-3,33.4,7.2],[T_HPASS,28.8,9.4],[T_RECV,...add2(RECV,[.6,-.3])],[2.2,20,15],[S_START,...S_AT]];
const CHI_KEYS=[[-6,17.5,34.5],[-3,16,32.6],[T_HPASS,14.6,30.8],[T_RECV,14,29.6],[2.4,13.2,27.6],[LS-.3,...add2(C_AT,[.3,.5])],[LS,...C_AT]];
const BON_KEYS=[[-6,21,28],[-3,19,26.6],[T_HPASS,16.8,25.4],[T_RECV,15.6,24.4],[2.4,12.8,21.6],[T_PASS,11,19.9],[T_REST,10.4,19.8],[T_REST+3,9.8,20.4]];
const KANE_KEYS=[[-6,25,38.5],[-3,20,37.4],[T_HPASS,16,36.4],[2,12.8,35.4],[T_PASS,...KANE_SPOT],[T_REST,8.8,34.2],[T_REST+3,8.4,33]];
const TRACKS:Track[]=[
 {id:'chiellini',style:CHIELLINI,keys:CHI_KEYS},
 {id:'sterling',style:STERLING,keys:STE_KEYS},
 {id:'bonucci',style:BONUCCI,keys:BON_KEYS},
 {id:'kane',style:KANE,keys:KANE_KEYS},
 {id:'henderson',style:HENDERSON,keys:HEN_KEYS},
 {id:'saka',style:SAKA,keys:[[-6,31,57],[-3,25,54],[T_HPASS,19.5,51],[T_PASS,10.4,45.4],[T_REST+3,8.2,42]]},
 {id:'dilorenzo',style:italy(SKIN_M,{number:2,seed:2,hair:[K,.8]}),keys:[[-6,34,7.5],[T_HPASS,30.5,9],[T_RECV,28.6,10.2],[2.2,23.2,14.2],[T_PASS,20,18.8],[T_REST+3,16.5,20]]},
 {id:'emerson',style:italy(SKIN_M,{number:13,seed:13}),keys:[[-6,21,51],[T_HPASS,15.4,48.6],[T_PASS,9.4,44],[T_REST+3,7.6,41]]},
 {id:'jorginho',style:italy(SKIN_M,{number:8,seed:18,hair:[K,.8]}),keys:[[-6,34,33],[T_HPASS,26.5,30.6],[T_PASS,17.6,28.4],[T_REST+3,14.6,28]]},
 // everyone else (not named in the accounts; positions illustrative, no numbers printed)
 {id:'i-a',style:italy(SKIN_L,{seed:31}),keys:[[-6,40,41],[T_HPASS,33,39],[T_PASS,23.5,37],[T_REST+3,19.5,36]]},
 {id:'i-b',style:italy(SKIN_M,{seed:32}),keys:[[-6,42,18],[T_HPASS,36.5,17.6],[T_PASS,27,18.6],[T_REST+3,22,19.6]]},
 {id:'e-a',style:england(SKIN_L,{seed:41}),keys:[[-6,34,45],[T_HPASS,28,43],[T_PASS,19.4,41.6],[T_REST+3,16.4,40]]},
 {id:'e-b',style:england(SKIN_D,{seed:42}),keys:[[-6,52,31],[T_HPASS,47,29],[T_PASS,39,27.4],[T_REST+3,33,27]]},
];
const GIGI_KEYS=[[-6,4,34],[T_HPASS,3,32.4],[T_PASS,2.1,29.8],[T_REST,1.5,28.4],[T_REST+3,1.7,28]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-6.2);for(let t=-6;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** the ball a little ahead of a runner on a track (its run direction) */
function ahead(k:number[][],t:number,lead:number):V3{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1]);const d=s>.3?[v[0]/s,v[1]/s]:[0,0];return[p[0]+d[0]*lead,.11,p[1]+d[1]*lead];}
/** The ball at play time T: Henderson's pass out to Sterling on the left, Sterling's drive into the box (small touches ahead), the low pass
 * across toward Kane (right foot), off Chiellini's left boot, bouncing over the goal line wide of the near post, to rest behind it. */
function ballAt(T:number):V3{
 if(T<T_HPASS)return ahead(HEN_KEYS,T,.7+.35*Math.max(0,Math.sin(T*TAU/.6)));
 const p0=ahead(HEN_KEYS,T_HPASS,.7),rv:V3=[RECV[0],.11,RECV[1]],pb:V3=[PASS_BALL[0],.11,PASS_BALL[1]];
 if(T<T_RECV)return lerp3(p0,rv,clamp((T-T_HPASS)/(T_RECV-T_HPASS)),.25);
 if(T<T_PASS){const d=ahead(STE_KEYS,Math.min(T,S_START-.05),.62+.34*Math.max(0,Math.sin((T-T_RECV)*TAU/.52))),u=sm(T_RECV,T_RECV+.35,T),w=sm(S_START-.55,S_START-.05,T,easeInOutSine);
  return lerp3(lerp3(rv,d,u),pb,w);}
 if(T<T_BLOCK)return lerp3(pb,BLOCK,clamp((T-T_PASS)/(T_BLOCK-T_PASS)));
 const out:V3=[OUT_AT[0],.5,OUT_AT[1]],rest:V3=[BALL_REST[0],.11,BALL_REST[1]];
 if(T<T_OUT)return lerp3(BLOCK,out,clamp((T-T_BLOCK)/(T_OUT-T_BLOCK)),.7);
 if(T<T_REST){const u=sm(T_OUT,T_REST,T,easeOut),p=lerp3(out,rest,u);p[1]=.11+.5*Math.abs(Math.cos(u*Math.PI*1.5))*(1-u)*(1-u);return p;}
 return rest;
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
/** head (and a little shoulder) turned toward the ball. Right-handed yaw: + turns left. */
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
const dirOf=(a:[number,number],b:[number,number])=>nrm2(b[0]-a[0],b[1]-a[1]);
/** a defender sprinting back across, then low on his toes facing the ball (the jockey), from time j0 to j1 */
function jockey(k:number[][],T:number,face:[number,number],j0:number,j1:number):St{
 const v=velAt(k,T),sp=Math.hypot(v[0],v[1]),turn=sm(j0,j1,T,easeInOutSine),p=trackAt(k,T),toBall=(()=>{const b=ballAt(T);return nrm2(b[0]-p[0],b[2]-p[1]);})();
 const h=yawTo(sp>.8?[v[0]/sp,v[1]/sp]:toBall,face,turn),st=runState(k,T,h);
 const pose=blendPose(st.pose,blendPose(backpedal(T*1.2),stand(),.2),turn*.9);
 return{pose:lookAtBall({pose,place:st.place},T,.8),place:st.place};
}
/** Chiellini: across from the middle into the lane, set low facing Sterling, the stretching left-leg block, up again, turning after the ball */
function chielliniState(T:number):St{
 if(T<LS)return jockey(CHI_KEYS,T,C_H,2.5,LS-.1);
 const place=placeOf(C_AT[0],C_AT[1],C_H),u=clamp((T-LS)/LUNGE_DUR),from=jockey(CHI_KEYS,LS,C_H,2.5,LS-.1).pose;
 if(T<LS+LUNGE_DUR){const p=blendPose(from,lunge(u,{side:'l'}),sm(0,.18,u));p.lean+=.12*win(u,.3,.95,.2);return{pose:clampPose(p),place};}
 const r=clamp((T-LS-LUNGE_DUR)/.7),h=yawTo(C_H,nrm2(-1,-.35),sm(LS+LUNGE_DUR,LS+LUNGE_DUR+1,T,easeInOutSine));
 const pose=keyPoses(r,[[0,lunge(1,{side:'l'})],[1,{...stand(),dx:.3,dz:-.3}]]),st={pose,place:placeOf(C_AT[0],C_AT[1],h)};
 return{pose:lookAtBall(st,T,.8),place:st.place};
}
/** Bonucci: back toward his goal, then out to Sterling, goal-side, low and facing him */
function bonucciState(T:number):St{const p=trackAt(BON_KEYS,Math.min(T,T_PASS)),s=trackAt(STE_KEYS,Math.min(T,S_START));return jockey(BON_KEYS,T,dirOf(p,s),1.8,2.8);}
/** Sterling: onto Henderson's pass, the drive into the box with the ball, set, the pass across with his right foot, then watching it */
function sterlingState(T:number):St{
 if(T<S_START){const st=runState(STE_KEYS,T);
  let pose=blendPose(st.pose,dribble(strideAt(STE_KEYS,T)*.9/3.6,{foot:'r',speed:.9}),.5*win(T,T_RECV-.1,S_START+.1,.3));
  pose=lookAtBall({pose,place:st.place},T,.5);
  const h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],S_H,sm(S_START-.5,S_START,T));
  return{pose,place:placeOf(trackAt(STE_KEYS,T)[0],trackAt(STE_KEYS,T)[1],h)};}
 const u=clamp((T-S_START)/STRIKE_DUR),place=placeOf(S_AT[0],S_AT[1],S_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.6}),place};
 const h=yawTo(S_H,nrm2(-1,-.4),sm(S_START+STRIKE_DUR,S_START+STRIKE_DUR+.8,T));
 const pose=keyPoses(clamp((T-S_START-STRIKE_DUR)/.6),[[0,strike(1,{foot:'r',power:.6})],[1,stand()]]);
 return{pose:lookAtBall({pose,place:placeOf(S_AT[0],S_AT[1],h)},T,.7),place:placeOf(S_AT[0],S_AT[1],h)};
}
/** Henderson: on the ball, the pass out to the left (right foot), then following up */
function hendersonState(T:number):St{
 const st=runState(HEN_KEYS,T);
 if(T<T_HPASS+.6){let pose=blendPose(st.pose,dribble(strideAt(HEN_KEYS,T)*.9/3.6,{foot:'r',speed:.8}),.5*(1-sm(T_HPASS-.4,T_HPASS-.2,T)));
  pose=blendPose(pose,strike(clamp((T-T_HPASS)/.8+STRIKE_CONTACT),{power:.4}),win(T,T_HPASS-.4,T_HPASS+.6,.2));
  const toS=dirOf(trackAt(HEN_KEYS,T_HPASS),RECV),h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],toS,win(T,T_HPASS-.45,T_HPASS+.6,.2));
  return{pose,place:placeOf(trackAt(HEN_KEYS,T)[0],trackAt(HEN_KEYS,T)[1],h)};}
 return{pose:lookAtBall(st,T,.6),place:st.place};
}
function gigiState(T:number):St{const[x,z]=trackAt(GIGI_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='chiellini')return chielliniState(T);if(id==='sterling')return sterlingState(T);if(id==='bonucci')return bonucciState(T);if(id==='henderson')return hendersonState(T);if(id==='gigi')return gigiState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['chiellini','sterling','bonucci'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean;stands?:number[]}={}){
 if(!o.noStadium)stadium(s,c,o.stands);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'gigi'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='gigi'?GIGI:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='chiellini'&&T>LS+.05&&T<T_BLOCK+.12)||(id==='sterling'&&Math.abs(T-T_PASS)<.22);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_BLOCK)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the near side, panning with the ball: Henderson to Sterling, the drive, the pass, blocked, corner. */
const MAIN_CAM:V3=[46,27,-44];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-3.4],[q[1],T_HPASS-.2],[q[2],T_RECV+.5],[q[3],2.9],[q[4],T_PASS-.12],[q[5],T_BLOCK+.12],[q[6],T_OUT+.25],[S,T_REST]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.max(-3.4,Math.min(T,T_OUT)-.3)),tx=clamp(b[0]-1,9,42),tz=lerp(30,25,sm(-1,3,T)),F=lerp(3300,5600,sm(-.5,3.8,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[5]+.4;},
};
/** 2 · TV slow-motion replay from a low camera behind Sterling, over his right shoulder, looking down the lane of the pass: Chiellini
 * covering the middle, right in the lane (Kane beyond him), Bonucci out at Sterling on the left, the stretch and the block. */
const LOW_CAM:V3=[18.5,2.1,11.5];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,1.2],[q[1],2.05],[q[2],2.85],[q[3],LS+.02],[q[4]+.25,T_BLOCK],[S,T_BLOCK+.35]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(CHI_KEYS,Math.min(T,LS)),st=trackAt(STE_KEYS,Math.min(T,S_START)),mid:[number,number]=[(m[0]+st[0])/2,(m[1]+st[1])/2],
 k=sm(2.6,T_BLOCK,T),tgt=[lerp(mid[0],BLOCK_XZ[0],k),lerp(mid[1],BLOCK_XZ[1],k)],F=lerp(1900,2700,sm(1.4,T_BLOCK,T,easeInOutSine));
 return camAt(LOW_CAM,[tgt[0],.9,tgt[1]],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.4;},
};
/** 3 · the second replay, from the high camera behind Italy's goal: the pass, off Chiellini's boot, behind the line: a corner. */
const BEHIND:V3=[-8,4.2,27.5];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_PASS-.35],[q[1],T_BLOCK+.05],[q[2],T_OUT+.25],[q[3],T_REST-.3],[S,T_REST+1.4]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(T),follow=sm(T_BLOCK,T_OUT+.4,T,easeInOutSine),tx=lerp(BLOCK_XZ[0]-.5,lerp(b[0],C_AT[0],.5),follow),tz=lerp(BLOCK_XZ[1]-.5,lerp(b[2],C_AT[1],.5),follow),F=lerp(3300,2500,sm(T_BLOCK,T_REST,T,easeInOutSine));
 return camAt(BEHIND,[tx,.8,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6,stands:[0,1,2]});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.3;},
};
/** 4 · the lesson plate: the moment again from a raised camera on the near side, with bold yellow teaching marks — rings round the two
 * partners (teamwork), talk marks between their heads (always talking), Bonucci's arrow out to Sterling (one goes to the ball), then
 * Chiellini's cover arrow into the lane of the pass and a burst at the block (cover each other). */
const LESSON_CAM:V3=[22,7,8];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,2.2],[q[1],2.4],[q[2],2.8],[q[3],3.1],[q[4]-.1,LS],[q[4]+.45,T_BLOCK],[S,T_BLOCK+.05]]);};
const LESSON_MID:[number,number]=[(C_AT[0]+S_AT[0])/2,(C_AT[1]+S_AT[1])/2];
const cam4=(t:number)=>camAt(LESSON_CAM,[LESSON_MID[0]-.6,.7,LESSON_MID[1]+.8],2900);
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
/** talk marks: three short arcs fanning out from a head toward the partner (sound waves), pulsing */
function talk(s:Sheet,from:Pt,to:Pt,k:number,g:number,seed:number){if(g<=.01)return;const an=Math.atan2(to[1]-from[1],to[0]-from[0]),p=new Path2D();
 for(let i=0;i<3;i++){const r=k*(.45+.32*i)*(.7+.3*g),arc:Pt[]=[];for(let j=0;j<7;j++){const a=an+(j/6-.5)*1.1;arc.push([from[0]+Math.cos(a)*r,from[1]+Math.sin(a)*r]);}p.addPath(ribbon(arc,Math.max(7,k*.12)*g,{seed:seed+i,taper:.3,wobble:.5}));}
 mark(s,p);}
const headOf=(id:string,T:number,c:Cam):Pt=>{const st=stateOf(id,T),sty=TR(id).style,sk=solve(st.pose,sty.build,st.place,FIG),h=toMy(sk.head);const q=P3(h,c);return[q[0],q[1]-.25*q[2]];};
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  // "That's teamwork": a yellow ring on the grass round each partner (printed under the figures), kept to the end
  const hal=sm(.1,.5,t,easeOutBack);
  if(hal>.01)for(const id of['chiellini','bonucci']){const m=stateOf(id,T).place;groundRing(s,m.x!,-m.z!,1*hal,c);}
  // "cover each other": the lane of the pass on the grass (a dashed yellow band from Sterling toward Kane)
  const lane=sm(q[4]-.1,q[4]+.3,t);
  if(lane>.01){const p=new Path2D();for(let i=0;i<6;i++){const a=add2(PASS_BALL,PASS_D,1+i*2.2),b=add2(PASS_BALL,PASS_D,1+i*2.2+1.3*lane);p.addPath(ribbon([G(a[0],a[1],c),G(b[0],b[1],c)],Math.max(8,.16*P3([a[0],0,a[1]],c)[2]),{seed:40+i,taper:0,wobble:.4}));}
   s.tone(Y,p,.75);}
  drawPlay(s,T,c,{ballScale:1.5,only:['chiellini','bonucci','sterling','kane','gigi','ball'],noStadium:true});
  // "always talking" and "talk to your partner": talk marks between the partners' heads
  const tk=win(t,q[1],q[2]+.2,.3)+win(t,q[3],q[4]+.1,.3);
  if(tk>.01){const a=headOf('chiellini',T,c),b=headOf('bonucci',T,c),k=1.5*P3([C_AT[0],1.8,C_AT[1]],c)[2],pulse=.75+.25*Math.sin(t*9);talk(s,a,b,k,clamp(tk)*pulse,50);talk(s,b,a,k,clamp(tk)*pulse,55);}
  // "Bonucci": one partner goes to the ball — an arrow from Bonucci toward Sterling
  const go=sm(q[2],q[2]+.4,t,easeOutBack)*(1-sm(q[4]+.6,q[4]+1,t));
  if(go>.01){const b=stateOf('bonucci',T).place,st=stateOf('sterling',T).place,a=G(b.x!,-b.z!,c),e=G(lerp(b.x!,st.x!,.75),lerp(-b.z!,-st.z!,.75),c);arrow(s,a,e,Math.max(12,.2*P3([b.x!,0,-b.z!],c)[2]),21,clamp(go));}
  // "cover each other": the other covers — Chiellini's arrow into the lane, then a burst at the block
  const cov=sm(q[4]-.1,q[4]+.3,t,easeOutBack);
  if(cov>.01&&T<T_BLOCK-.02){const m=trackAt(CHI_KEYS,Math.min(T,LS)),a=G(m[0]+.8,m[1]+1.6,c),e=G(BLOCK_XZ[0]+.2,BLOCK_XZ[1]+.4,c);arrow(s,a,e,Math.max(12,.2*P3([m[0],0,m[1]],c)[2]),22,clamp(cov));}
  if(T>=T_BLOCK-.02){const bp=P3(BLOCK,c),g=sm(q[4]+.4,q[4]+.8,t,easeOutBack);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(g),width:.07*bp[2]});}
  frame(s);
 },
 get still(){return Q(3)[4]+1.2;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'chiellini-signature',format:'11v11',title:'Chiellini: the big block',theme:'Talk to your partner and cover each other',
 ageNote:'Italy 1–1 England (Italy won 3–2 on penalties) · UEFA Euro 2020 final, 11 July 2021 · Wembley, London · 96th minute',
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
/** Solved contact points (pitch metres; Italy's goal line at X=0, Z across) — checked by tests/play-film-chiellini-signature.cjs. */
export const FACTS={BLOCK,PASS_BALL,KANE_SPOT,OUT_AT,BALL_REST,C_AT,T_PASS,T_BLOCK,LS,ballAt,
 /** mid-sole of each of Chiellini's boots at the block frame (my metres) */
 leftFoot:()=>{const st=chielliniState(T_BLOCK),sk=solve(st.pose,CHIELLINI.build,st.place,FIG);return toMy(midSole(sk.lToe,sk.lHeel));},
 rightFoot:()=>{const st=chielliniState(T_BLOCK),sk=solve(st.pose,CHIELLINI.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 pelvisY:()=>{const st=chielliniState(T_BLOCK),sk=solve(st.pose,CHIELLINI.build,st.place,FIG);return sk.pelvis[1];},
 /** Sterling's boots at the pass */
 sterlingFeet:()=>{const st=sterlingState(T_PASS),sk=solve(st.pose,STERLING.build,st.place,FIG);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel))};},
 chielliniAt:(T:number)=>{const st=chielliniState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 bonucciAt:(T:number)=>{const st=bonucciState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 sterlingAt:(T:number)=>{const st=sterlingState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
