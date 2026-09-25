/** Iconic-play film · Claude Makélélé, "Signature: the steal in front of the defence" — the screening holding midfielder (the "Makélélé
 * role"), shown as HOW HE DID IT in a real match the sources describe: Italy v France, FIFA World Cup final, Sunday 9 July 2006,
 * Olympiastadion, Berlin (1–1 after extra time, Italy won 5–3 on penalties). Kid-friendly: the later sending-off is not shown or narrated.
 *
 * WHY THIS MOMENT: Makélélé's entry in lib/town/iconicPlays.json is a signature (a trait; lesson "Stay between the ball and your goal, then
 * pass simply once you win it"), not one goal. His job was quiet: stand in front of his back four, between the ball and his goal, take the
 * ball off the other team's playmaker and give it simply to a teammate. No written account we could reach logs ONE specific Makélélé
 * interception in a big match with a minute and a position, so the film follows the brief's honest fallback: it is set in his biggest,
 * best-documented match, whose written accounts describe exactly this job — in the first half Italy's Francesco Totti "struggled to find
 * space, partly due to tight marking from Makélélé and Vieira" — and the narration says so plainly ("Here's how Claude Makélélé played").
 * The move itself (a pass into Totti cut out by Makélélé, then his simple pass to Vieira) is an ILLUSTRATION of that sourced marking and of
 * his sourced style, not a logged frame of the match. Same structure as the approved interception signatures (thiago-silva-signature,
 * marquinhos-signature); the stadium, kits and ball follow the approved buffon-zidane-2006 film of the same final.
 *
 * A recreation rendered as a riso print: one 3D choreography in pitch metres (X along the pitch, France's goal line at X=0, Z across, away
 * from the main-stand camera, Y up) seen through TV cameras — 1 live, the high main camera on the side (Italy work it square, Makélélé keeps
 * in front of Totti, the pass in, he steps across and takes it); 2 a TV slow-motion replay from a low camera on the far side (he shuffles
 * so he is always between the ball and his goal; when the pass comes he is already there); 3 a second replay from the high camera behind
 * France's goal (no tricks: head up, a simple pass to Vieira, France go forward); 4 the lesson (the only chapter with teaching marks: a ring
 * round him, a shield arc over the defence behind him, the dashed line from the ball to his goal that he stands on, a tick where he wins it
 * and the simple pass arrow). No overlays inside the footage chapters.
 *
 * SOURCES (read 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2006 FIFA World Cup final" (raw; match summary citing La Repubblica, 9 July 2006, and De Stefano 2006; line-ups):
 *    https://en.wikipedia.org/wiki/2006_FIFA_World_Cup_final  (wiki-2006-wc-final.txt)
 *  - Wikipedia (it), "Finale del campionato mondiale di calcio 2006" (same passage: "Totti non riuscì a trovare lo spunto giusto, anche a
 *    causa della marcatura stretta di Makélélé e Vieira") (itwiki-finale-2006.txt)
 *  - Wikipedia (fr), "Finale de la Coupe du monde de football 2006" (tactics: both teams 4-2-3-1, France with two axial defensive
 *    midfielders, Vieira and Makélélé, in front of a flat back four; the gold-trimmed Teamgeist Berlin match ball) (frwiki-finale-2006.txt)
 *  - BBC Sport, "Italy 1-1 France (aet)" (9 July 2006; line-ups with shirt numbers): http://news.bbc.co.uk/sport2/hi/football/world_cup_2006/4991652.stm
 *    (bbc-4991652.txt)
 *  - Wikipedia, "Claude Makélélé" (raw): style of play — "the Makélélé role"; played "in front of his team's back-line … a defensive foil for
 *    his more offensive teammates"; "ability to read the game, break down plays, mark and anticipate opponents"; "positional sense, tactical
 *    discipline"; "short, efficient passing game, which allowed him to link up the defence with the attack effectively after winning back
 *    possession"; height 1.74 m; at Chelsea "his defensive qualities allowed the likes of Frank Lampard … to parade their attacking skills":
 *    https://en.wikipedia.org/wiki/Claude_Mak%C3%A9l%C3%A9l%C3%A9  (wiki-claude-makelele.txt)
 *  - the approved film lib/plays/riso/buffon-zidane-2006.ts (its sources: the kits of that night and the Olympiastadion's blue track and
 *    honeycomb goal nets).
 * CONFIRMED by those sources: the match, date and venue; France in a 4-2-3-1 with Makélélé 6 and Vieira 4 as the two holding midfielders in
 * front of Sagnol 19, Thuram 15, Gallas 5 and Abidal 3, Zidane 10 behind Henry, Ribéry 22 right, Malouda 7 left, Barthez 16 in goal; Italy
 * with Totti 10 as the attacking midfielder behind Toni 9; Totti struggled to find space in the first half partly because of Makélélé's and
 * Vieira's tight marking; Makélélé's style (screens the back four, reads and marks, wins the ball, short simple passes). Kits: Italy blue
 * shirts, white shorts, blue socks; France all white.
 * INFERRED (not in the sources): the whole move — the Italy passer (drawn without a number or name), where and when, Makélélé's route, the
 * interception point and his pass to Vieira — is an illustration of his marking and style, not a logged play; which end France defended on
 * screen (their goal is screen-left from the main camera); every position and timing; the feet (the passer's right, Makélélé's right boot
 * into the lane and right-footed pass — drawn, never narrated); Barthez's kit colour (a neutral grey); hair and skin tones; the camera
 * placements. The narration names only the final, Berlin 2006, Makélélé, Totti, Vieira and France.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice (withTiming)
 * re-times the drawing. Scenes read only their local time t. Every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,keyPath,easeOut,easeOutBack,easeInOutSine,linear,polyPath,ribbon,blob,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,lunge,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [7,5,4,4]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The final',text:'Berlin, 2006: the World Cup final. Here’s how Claude Makélélé played. Italy look for Totti, but Makélélé stays in front of him. The pass goes in… Makélélé steps across, and it’s his!',seconds:15.2,
  cues:[[0,'Berlin'],[2.9,'Here’s how Claude Makélélé played'],[5.3,'Italy look for Totti'],[7.7,'Makélélé stays in front of him'],[10.2,'The pass goes in'],[12,'Makélélé steps across'],[13.5,'it’s his']]},
 {label:'The replay',text:'Watch again, slowly. He keeps shuffling, always between the ball and his goal. When the pass comes, he’s already there.',seconds:9.4,
  cues:[[0,'Watch again'],[1.7,'He keeps shuffling'],[3,'always between the ball and his goal'],[5.7,'When the pass comes'],[7,'he’s already there']]},
 {label:'Simple',text:'No tricks. He looks up and passes it simply to Patrick Vieira. France attack!',seconds:7,
  cues:[[0,'No tricks'],[1.1,'He looks up'],[2.2,'passes it simply'],[4.5,'France attack']]},
 {label:'The lesson',text:'That’s the Makélélé role. It quietly protects the whole team! Stay between the ball and your goal. When you win it, pass it simply.',seconds:11,
  cues:[[0,'That’s the Makélélé role'],[1.9,'It quietly protects the whole team'],[4.4,'Stay between the ball and your goal'],[7.2,'When you win it']]},
];
/** VOICE: null until the lead runs scripts/plays/kokoro-narrate.py makelele-signature, which writes timing.json next to script.json. Then
 * replace this null with `import timingJson from '../../../public/plays/narration/makelele-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/makelele-signature/timing.json';
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

// ---------------------------------------------------------------- the Olympiastadion (as the approved buffon-zidane-2006 film prints it)
/** The blue running track is a stadium oval around the pitch: straights along Z = 34 ± R, bends centred on X = 14 and 91. oval(u, r): a
 * point at perimeter parameter u ∈ [0,1) on the oval of radius r, with its outward normal. */
const OV={c0:14,c1:91,cz:34,R:39,W:9};
function oval(u:number,r:number):{p:[number,number];n:[number,number]}{
 const L=OV.c1-OV.c0,P=2*L+TAU*r,d=((u%1)+1)%1*P;
 if(d<L)return{p:[OV.c0+d,OV.cz-r],n:[0,-1]};
 if(d<L+Math.PI*r){const a=-Math.PI/2+(d-L)/r;return{p:[OV.c1+Math.cos(a)*r,OV.cz+Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
 if(d<2*L+Math.PI*r){const e=d-L-Math.PI*r;return{p:[OV.c1-e,OV.cz+r],n:[0,1]};}
 const a=Math.PI/2+(d-2*L-Math.PI*r)/r;return{p:[OV.c0+Math.cos(a)*r,OV.cz+Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
const SEGS=44,TIERS=18;
const TIER_INK:[string,number][]=[[B,.45],[O,.2],[Y,.32],[B,.2],[K,.2],[B,.32],[O,.45],[Y,.2]];
function stadium(s:Sheet,c:Cam){
 const R0=OV.R+OV.W,concrete=new Path2D(),wall=new Path2D(),roof=new Path2D(),tiers=TIER_INK.map(()=>new Path2D()),track=new Path2D(),lanes=new Path2D();
 const at=(u:number,d:number,y:number):V3=>{const o=oval(u,R0);return[o.p[0]+o.n[0]*d,y,o.p[1]+o.n[1]*d];};
 for(let g=0;g<SEGS;g++){const u0=g/SEGS,u1=(g+1)/SEGS;
  addPoly(concrete,[at(u0,0,1.2),at(u1,0,1.2),at(u1,40,1.2+40*.55),at(u0,40,1.2+40*.55)],c);
  addPoly(wall,[at(u0,0,0),at(u1,0,0),at(u1,0,1.1),at(u0,0,1.1)],c);
  addPoly(roof,[at(u0,24,32),at(u1,24,32),at(u1,46,33.5),at(u0,46,33.5)],c);
  for(let k=0;k<TIERS;k++){const d0=1+k*2.1,d1=d0+1.7,y0=1.2+d0*.55,y1=1.2+d1*.55;
   addPoly(tiers[(k*3+g*5)%TIER_INK.length],[at(u0,d0,y0),at(u1,d0,y0),at(u1,d1,y1),at(u0,d1,y1)],c);}
  const a0=oval(u0,OV.R),a1=oval(u1,OV.R),b0=oval(u0,R0),b1=oval(u1,R0);
  addPoly(track,[[a0.p[0],0,a0.p[1]],[a1.p[0],0,a1.p[1]],[b1.p[0],0,b1.p[1]],[b0.p[0],0,b0.p[1]]],c);}
 for(const side of[-1,1])for(let l=1;l<8;l++){const z=OV.cz+side*(OV.R+l*OV.W/8);groundLine(lanes,[OV.c0,z],[OV.c1,z],c,.1);}
 s.fill(Y,concrete,.2);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(K,roof,.7);s.fill(O,wall,.32);s.fill(B,wall,.6);s.stroke(K,wall,Math.max(2,.05*P3([30,0,34],c)[2]),.6);
 s.fill(B,track,.78);s.knockout(lanes,.6);
 const grass=new Path2D();{const pts:V3[]=[];for(let i=0;i<48;i++){const o=oval(i/48,OV.R);pts.push([o.p[0],0,o.p[1]]);}addPoly(grass,pts,c);}
 s.knockout(grass);s.fill(Y,grass,.6);s.fill(B,grass,.45);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,-3],[(i+1)*5.25,0,-3],[(i+1)*5.25,0,71],[i*5.25,0,71]],c);s.tone(B,stripes,.2);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(O,fl);}
}
/** A goal at line gx whose net runs out by dir (France's: gx 0, dir −1): white posts and bar and the Berlin honeycomb net (paper haze +
 * navy hexagons on the back, a plain mesh on the sides). */
function goal(s:Sheet,c:Cam,gx:number,dir:number){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*2,bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.3,30/Math.max(1,k0));// the mesh never prints tighter than ~30 units (no moiré in a small card)
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  const a=sp*.62,hw=a*.866,rows=Math.ceil(bh/(1.5*a)),cols=Math.ceil((z1-z0)/hw),hz=(k:number)=>Math.min(z1,z0+k*hw),hy=(y:number)=>Math.min(bh,y);
  for(let j=0;j<=rows;j++){const y0=j*1.5*a;if(y0>bh)break;
   for(let k=0;k<cols;k++){seg([bx,hy(y0+((k+j)%2)*.5*a),hz(k)],[bx,hy(y0+((k+1+j)%2)*.5*a),hz(k+1)]);
    if((k+j)%2===1&&y0+.5*a<bh)seg([bx,hy(y0+.5*a),hz(k)],[bx,hy(y0+1.5*a),hz(k)]);}}
  for(const z of[z0,z1])for(let y=0;y<=bh+.01;y+=sp)seg([gx,y*h/bh,z],[bx,y,z]);
  for(let z=z0;z<=z1+.01;z+=sp)seg([gx,h,z],[bx,bh,z]);
  s.stroke(K,mesh,Math.max(1.4,.011*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X to the right on the main camera, Z away from it) is left-handed, so the projector
 * negates z both ways — that keeps Makélélé's RIGHT boot on his right. */
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
const LIGHT:InkFill[]=[[O,.2]],OLIVE:InkFill[]=[[O,.32]],MID:InkFill[]=[[O,.75],[Y,.2]],DARK:InkFill[]=[[O,.88],[K,.2]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Italy 2006: blue shirts, white shorts, blue socks. France (change strip that night): all white, blue numbers. */
const italy=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:'paper',socks:B,boots:K,skin,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',number:null,scale:FIG,...o});
const france=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:[B,.6],shorts:'paper',socks:'paper',boots:K,skin,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.8],number:null,scale:FIG,...o});
/** Claude Makélélé: number 6, shaved head, 1.74 m, compact and strong */
const MAKELELE:AthleteStyle=france(DARK,{number:6,seed:6,hairStyle:'bald',build:{height:1.74,bulk:1.06}});
/** Francesco Totti, Italy's number 10 (the man Makélélé screened) */
const TOTTI:AthleteStyle=italy(LIGHT,{number:10,seed:10,hair:[K,.62],build:{height:1.8}});
/** the Italy players in the move: drawn without numbers or names (the move is an illustration, see the header) */
const PASSER:AthleteStyle=italy(OLIVE,{seed:41,build:{height:1.77}});
const VIEIRA:AthleteStyle=france(DARK,{number:4,seed:4,build:{height:1.93,bulk:.96}});
const BARTHEZ:AthleteStyle={shirt:[K,.45],shorts:[K,.6],socks:[K,.45],boots:K,skin:LIGHT,hair:K,hairStyle:'bald',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:16,numberInk:'paper',scale:FIG,seed:16};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = the pass in to Totti)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** France's goal: the middle of the goal line at X=0 */
const GOAL_C:[number,number]=[0,34];
/** Italy work it square (T_A → T_B), then the pass at T=0 from P0 into Totti's feet at R. */
const T_A=-3.5,T_B=-2.5,T_INT=1,LUNGE_DUR=.8,LUNGE_REACH=.6,LS=T_INT-LUNGE_REACH*LUNGE_DUR,T_READ=-.5,T_P2=T_INT+2,T_ARR=T_P2+1;
const P0:[number,number]=[40,41],R:[number,number]=[26,36.5],PASS_D=nrm2(R[0]-P0[0],R[1]-P0[1]);
/** where Makélélé meets it: 3.3 m in front of Totti's feet, on the lane */
const I_XZ:[number,number]=add2(R,PASS_D,-3.3);
/** he faces the ball coming; the step puts his right boot on the lane */
const M_H=nrm2(-PASS_D[0]+.12,-PASS_D[1]);
const M_AT:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH),MAKELELE.build,placeOf(0,0,M_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[I_XZ[0]-f[0],I_XZ[1]-f[2]];})();
const I_Y:number=(()=>{const sk=solve(lunge(LUNGE_REACH),MAKELELE.build,placeOf(M_AT[0],M_AT[1],M_H),FIG);return Math.max(.12,toMy(midSole(sk.rToe,sk.rHeel))[1]+.11);})();
const INTERCEPT:V3=[I_XZ[0],I_Y,I_XZ[1]];
/** the cushioned ball stops just past his boot */
const I_STOP:[number,number]=add2(I_XZ,PASS_D,.35);
/** his simple pass: short, to Vieira beside him on the near side (right foot) */
const J:[number,number]=[35,29.5],H2=nrm2(J[0]-I_STOP[0],J[1]-I_STOP[1]);
const BALL2:[number,number]=add2(I_STOP,H2,1.1);
const STRIKE_DUR=1,S2_START=T_P2-STRIKE_CONTACT*STRIKE_DUR;
const S_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.4}),MAKELELE.build,placeOf(0,0,H2),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[BALL2[0]-f[0]-H2[0]*.13,BALL2[1]-f[2]-H2[1]*.13];})();
/** the Italy passer: right foot, facing the lane */
const P_H=nrm2(PASS_D[0]+.05,PASS_D[1]),P_START=0-STRIKE_CONTACT*STRIKE_DUR;
const P_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),PASSER.build,placeOf(0,0,P_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[P0[0]-f[0]-P_H[0]*.13,P0[1]-f[2]-P_H[1]*.13];})();
/** where the square pass reaches the passer */
const PR:[number,number]=[43.5,44.6];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const PASS_KEYS=[[-5,47,49],[T_A,45,47],[T_B,...PR],[-1.4,41.4,42.6],[P_START,...P_AT],[3,...add2(P_AT,[-.8,-.2])],[7,...add2(P_AT,[-3,-1])]];
const MID2_KEYS=[[-5,47.5,33],[T_A-.1,46.8,32.6],[-1,45.4,33.6],[2,42,33.2],[7,39,32]];
/** Totti drifts into the pocket between France's midfield and defence and checks toward the ball; beaten to it, he turns */
const TOT_KEYS=[[-5,23.4,31],[-2.5,24.6,33.8],[T_READ,25.6,35.8],[0,25.8,36.2],[T_INT,...add2(R,[-.3,.1])],[T_INT+.7,...add2(R,[.3,.2])],[T_P2,27,35],[T_ARR+2,29,32.4]];
/** Makélélé: shuffles across as the ball goes wide, always on the line from the ball to his goal and in front of Totti; a small step on */
const MAK_KEYS=[[-5,30.4,33.3],[-4,30.3,34],[-2.5,29.6,39.4],[-1.5,29.1,39.6],[T_READ,28.7,39],[.15,28.4,38.6],[LS,...M_AT]];
const VIE_KEYS=[[-5,33.6,27],[-2,33,27.8],[T_INT,33.6,28.4],[T_ARR-.3,...add2(J,[.3,.1])],[T_ARR+3,41,31]];
const TRACKS:Track[]=[
 {id:'makelele',style:MAKELELE,keys:MAK_KEYS},
 {id:'totti',style:TOTTI,keys:TOT_KEYS},
 {id:'i-pass',style:PASSER,keys:PASS_KEYS},
 {id:'i-mid2',style:italy(LIGHT,{seed:43}),keys:MID2_KEYS},
 {id:'vieira',style:VIEIRA,keys:VIE_KEYS},
 {id:'thuram',style:france(DARK,{number:15,seed:15,hairStyle:'bald',build:{height:1.85}}),keys:[[-5,17,29],[0,17.8,30],[T_INT,18.6,31],[T_P2,20,30],[T_ARR+3,25,29]]},
 {id:'gallas',style:france(DARK,{number:5,seed:5,build:{height:1.8}}),keys:[[-5,16.5,40],[0,17.2,39.5],[T_INT,18.2,38.6],[T_ARR+3,24,39]]},
 {id:'sagnol',style:france(LIGHT,{number:19,seed:19,hair:[Y,.88]}),keys:[[-5,21,11],[0,21.6,12],[T_ARR+3,30,10]]},
 {id:'abidal',style:france(DARK,{number:3,seed:3,hairStyle:'bald'}),keys:[[-5,20,57],[0,20.6,56],[T_ARR+3,28,57]]},
 {id:'zidane',style:france(LIGHT,{number:10,seed:10,hairStyle:'balding',hair:[K,.45],build:{height:1.85}}),keys:[[-5,41,26.5],[0,40,28],[T_INT,40.5,28.6],[T_P2,43,28],[T_ARR+3,50,30]]},
 {id:'ribery',style:france(LIGHT,{number:22,seed:22,build:{height:1.7}}),keys:[[-5,38,10],[0,38,12],[T_ARR+3,48,10]]},
 {id:'malouda',style:france(DARK,{number:7,seed:7}),keys:[[-5,45,56],[0,44,55],[T_ARR+3,50,57]]},
 // Italy's other attackers (no numbers)
 {id:'i-9',style:italy(LIGHT,{seed:9,build:{height:1.93}}),keys:[[-5,15.5,35],[0,16.5,34],[T_INT,17.5,33.5],[T_ARR+3,21,33]]},
 {id:'i-w1',style:italy(OLIVE,{seed:44}),keys:[[-5,30,60],[0,27,58],[T_ARR+3,29,56]]},
 {id:'i-w2',style:italy(LIGHT,{seed:45}),keys:[[-5,28,12],[0,25,14],[T_ARR+3,27,16]]},
 {id:'i-cm',style:italy(OLIVE,{seed:46}),keys:[[-5,44,23],[0,43,25],[T_INT,42,25.8],[T_ARR+3,44,27]]},
];
const KEEPER_KEYS=[[-5,4,34],[0,4.6,34.8],[T_INT,5,35],[T_ARR+3,5.6,33.6]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-5.2);for(let t=-5;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const G3=(p:[number,number]):V3=>[p[0],.11,p[1]];
/** The ball at play time T: the square pass to the passer, his touches, the pass in (right foot) along the grass, cut out by Makélélé's
 * right boot, cushioned dead, one touch out, his short pass (right foot) to Vieira, who carries it forward. */
function ballAt(T:number):V3{
 const ahead=(k:number[][],t:number,lead:number):V3=>{const p=trackAt(k,t),v=velAt(k,t),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*lead,.11,p[1]+v[1]/s*lead];};
 if(T<T_A)return ahead(MID2_KEYS,T,.6);
 const a0=ahead(MID2_KEYS,T_A,.6);
 if(T<T_B)return lerp3(a0,G3(add2(PR,[-.5,-.3])),sm(T_A,T_B,T,u=>u*(1.3-.3*u)));
 if(T<0){const d=ahead(PASS_KEYS,T,.62+.3*Math.max(0,Math.sin((T-T_B)*TAU/.7)));return lerp3(d,G3(P0),sm(-.6,0,T));}
 if(T<T_INT)return lerp3(G3(P0),INTERCEPT,clamp(T/T_INT)*(1.12-.12*clamp(T/T_INT)));
 if(T<T_INT+.4)return lerp3(INTERCEPT,G3(I_STOP),sm(T_INT,T_INT+.4,T,easeOut));
 if(T<T_P2)return lerp3(G3(I_STOP),G3(BALL2),sm(T_INT+1.05,T_P2-.35,T,easeOut));
 if(T<T_ARR)return lerp3(G3(BALL2),G3(add2(J,[.5,.4])),clamp((T-T_P2)/(T_ARR-T_P2))*(1.1-.1*clamp((T-T_P2)/(T_ARR-T_P2))));
 const d=ahead(VIE_KEYS,T,.7);return lerp3(G3(add2(J,[.5,.4])),d,sm(T_ARR,T_ARR+.5,T));
}

// ---------------------------------------------------------------- the players at play time T
const win=(T:number,a:number,b:number,e=.15)=>sm(a,a+e,T)*(1-sm(b-e,b,T));
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
const hd=(p:Place):[number,number]=>[Math.cos(p.yaw!),Math.sin(p.yaw!)];
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward a point (default: the ball). Right-handed yaw: + turns left. */
function lookAt(st:St,T:number,w=1,at?:[number,number]):Pose{const b=at?[at[0],0,at[1]]:ballAt(T),x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[2]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.2*w;return clampPose(p);}
/** a low, side-on screening stance: knees bent, weight forward, arms a little out (sourced: he marks and reads; the stance is drawn) */
function screen(p:Pose,w:number):Pose{const q={...p};const r=Math.PI/180;q.lKnee+=16*r*w;q.rKnee+=16*r*w;q.lHipF+=10*r*w;q.rHipF+=10*r*w;q.lean+=8*r*w;q.lShA+=10*r*w;q.rShA+=10*r*w;return clampPose(q);}
/** Makélélé before the step: facing the ball, shuffling sideways so he stays between the ball and his goal (and in front of Totti); he
 * moves as the passer shapes to play it (T_READ) and is already in the lane when the pass comes */
function makApproach(T:number):St{
 const p=trackAt(MAK_KEYS,T),b=ballAt(T),toBall=nrm2(b[0]-p[0],b[2]-p[1]);
 const h=yawTo(toBall,M_H,sm(LS-.45,LS,T,easeInOutSine)),st=runState(MAK_KEYS,T,h);
 // a sideways shuffle reads as small quick steps, not a sprint: damp the run toward the stance
 const pose=screen(blendPose(stand(),st.pose,.55),.8);
 return{pose:lookAt({pose,place:placeOf(p[0],p[1],h)},T,1),place:placeOf(p[0],p[1],h)};
}
function makState(T:number):St{
 if(T<LS)return makApproach(T);
 const u=clamp((T-LS)/LUNGE_DUR),from=makApproach(LS).pose,place=placeOf(M_AT[0],M_AT[1],M_H);
 if(T<LS+LUNGE_DUR){const pose=blendPose(from,lunge(u),sm(0,.2,u));return{pose:lookAt({pose,place},T,.4),place};}
 // up with the ball, head up, turning to Vieira, a touch out, then the simple pass with the right foot
 const T1=LS+LUNGE_DUR;
 if(T<S2_START){const w=sm(T1+.3,S2_START,T,easeInOutSine),x=lerp(M_AT[0],S_AT[0],w),z=lerp(M_AT[1],S_AT[1],w),h=yawTo(M_H,H2,sm(T1,T1+.9,T,easeInOutSine));
  const walk=blendPose(stand(),runCycle((T-T1)*1.6,{speed:.1}),.55*win(T,T1+.3,S2_START+.05,.25));
  const pose=keyPoses(clamp((T-T1)/.5),[[0,lunge(1)],[1,walk]]),st={pose,place:placeOf(x,z,h)};
  return{pose:lookAt(st,T,.8,T<T1+1.1?I_STOP:J),place:st.place};}
 const sp2=placeOf(S_AT[0],S_AT[1],H2),v=clamp((T-S2_START)/STRIKE_DUR);
 if(v<1)return{pose:strike(v,{foot:'r',power:.4}),place:sp2};
 return{pose:lookAt({pose:keyPoses(clamp((T-S2_START-STRIKE_DUR)/.6),[[0,strike(1,{foot:'r',power:.4})],[1,stand()]]),place:sp2},T,.7),place:sp2};
}
/** the Italy passer: takes the square pass, a few touches, looks up at Totti, the pass (right foot), then watches it cut out */
function passerState(T:number):St{
 if(T<P_START){const st=runState(PASS_KEYS,T);let pose=blendPose(st.pose,dribble(strideAt(PASS_KEYS,T)*.9/3.6,{foot:'r',speed:.6}),.5*win(T,T_B,P_START+.1,.3));
  pose=lookAt({pose,place:st.place},T,.6*win(T,-1.4,-.5,.2),R);
  const h=yawTo(hd(st.place),P_H,sm(P_START-.5,P_START,T));return{pose,place:placeOf(trackAt(PASS_KEYS,T)[0],trackAt(PASS_KEYS,T)[1],h)};}
 const u=clamp((T-P_START)/STRIKE_DUR),place=placeOf(P_AT[0],P_AT[1],P_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.6}),place};
 const st=runState(PASS_KEYS,T,P_H);return{pose:lookAt({pose:blendPose(strike(1,{foot:'r',power:.6}),st.pose,sm(P_START+1,P_START+1.6,T)),place:st.place},T,.8),place:st.place};
}
/** Totti: checks in toward the ball, beaten to it; turns to follow */
function tottiState(T:number):St{const st=runState(TOT_KEYS,T,T<T_INT+.3?nrm2(P0[0]-trackAt(TOT_KEYS,T)[0],P0[1]-trackAt(TOT_KEYS,T)[1]):undefined);return{pose:lookAt(st,T,.8),place:st.place};}
/** the square pass: a short side-foot pass (right foot) */
function mid2State(T:number):St{const st=runState(MID2_KEYS,T);const pose=blendPose(st.pose,strike(clamp((T-T_A)/.8+STRIKE_CONTACT),{power:.3}),win(T,T_A-.4,T_A+.6,.2));
 const h=yawTo(hd(st.place),nrm2(PR[0]-47,PR[1]-32.6),win(T,T_A-.5,T_A+.6,.2));return{pose:lookAt({pose,place:st.place},T,.5),place:placeOf(st.place.x!,-st.place.z!,h)};}
function keeperState(T:number):St{const[x,z]=trackAt(KEEPER_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='makelele')return makState(T);if(id==='i-pass')return passerState(T);if(id==='totti')return tottiState(T);if(id==='i-mid2')return mid2State(T);if(id==='barthez')return keeperState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAt(st,T,.5),place:st.place};
}
const HEROES=['makelele','totti','i-pass','vieira'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: stadium and grass, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'barthez'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='barthez'?BARTHEZ:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='makelele'&&T>LS-.1&&T<T_INT+.1)||(id==='i-pass'&&Math.abs(T)<.22);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_INT)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the near side, panning with the ball: Italy work it square, Makélélé shuffles in front of Totti, the
 * pass in, he steps across, his ball. */
const MAIN_CAM:V3=[36,24,-52];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-4.8],[q[1],-3.9],[q[2],-2.2],[q[3],-1.1],[q[4],0],[q[5],.5],[q[6],T_INT+.2],[S,T_INT+1.5]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.min(T,T_INT+.6)),m=trackAt(MAK_KEYS,Math.min(T,LS)),focus=sm(-3,-1.2,T,easeInOutSine),
 tx=lerp(b[0]-5,lerp(b[0],m[0],.5),focus),tz=lerp(b[2]-3,lerp(b[2],m[1],.5),focus),F=lerp(6800,8600,sm(-3.4,-.5,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[6]+.4;},
};
/** 2 · TV slow-motion replay from a low camera on the far side: the ball, Makélélé and Totti in one frame; he shuffles, always between
 * the ball and his goal; the pass comes and he is already there. */
const LOW_CAM:V3=[31,3.4,57];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-3.2],[q[1],-2.5],[q[2],-1.6],[q[3],-.15],[q[4],LS+.15],[S-.6,T_INT+.12],[S,T_INT+.2]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(MAK_KEYS,Math.min(T,LS)),b=ballAt(T),w=sm(-.6,T_INT,T,easeInOutSine),
 tgt=[lerp(lerp(m[0],b[0],.5),lerp(m[0],R[0],.35),w),lerp(lerp(m[1],b[2],.5),lerp(m[1],R[1],.3),w)],F=lerp(1900,2900,sm(-1,T_INT,T,easeInOutSine));
 return camAt(LOW_CAM,[tgt[0],.9,tgt[1]],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.6;},
};
/** 3 · the second replay, from the high camera behind France's goal: ball dead at his feet, head up, the simple pass to Vieira, France go. */
const BEHIND:V3=[-11,8,33];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_INT+.3],[q[1],S2_START+.2],[q[2],T_P2+.55],[q[3],T_ARR+.1],[S,T_ARR+1.6]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(T),tx=lerp(I_STOP[0],b[0],.6),tz=lerp(I_STOP[1],b[2],.6),F=lerp(3900,3300,sm(T_INT+1,T_ARR,T,easeInOutSine));
 return camAt(BEHIND,[tx,.8,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.8;},
};
/** 4 · the lesson plate: the move again from a raised camera behind the Italy passer, looking down the line to France's goal, with bold
 * yellow teaching marks — a ring round Makélélé (the Makélélé role), a shield arc over the defence behind him (it protects the whole team),
 * the dashed line from the ball to his goal with him standing on it (stay between the ball and your goal), then a tick where he wins it and
 * the arrow of his simple pass (when you win it, pass it simply). */
const LESSON_CAM:V3=[48,6.5,46];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-1.9],[q[1],-1.6],[q[2]+1.6,-.6],[q[3]-.3,-.35],[q[3]+.6,T_INT+.05],[q[3]+.9,T_INT+.35],[S,T_ARR+.4]]);};
const cam4=(t:number)=>{const q=Q(3),w=sm(q[3]+.4,q[3]+2,t,easeInOutSine);return camAt(LESSON_CAM,[lerp(24,31,w),.6,lerp(35.4,33,w)],lerp(2150,2250,w));};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
/** dashes along a ground segment */
function dashes(s:Sheet,a:V3,b:V3,c:Cam,n:number,u:number,w:number,seed:number){const p=new Path2D();for(let i=0;i<n;i++){const u0=i/n,u1=(i+.55)/n;if(u0>u)break;const A=P3(lerp3(a,b,u0),c),Bq=P3(lerp3(a,b,Math.min(u1,u)),c);if(A[2]<=0||Bq[2]<=0)continue;p.addPath(ribbon([[A[0],A[1]],[Bq[0],Bq[1]]],w,{seed:seed+i,taper:0,wobble:.5}));}mark(s,p);}
/** a band on the grass: an arc of radius r round (x,z) from angle a0 to a1 (the "shield" over the defence), drawn to u */
function groundBand(s:Sheet,x:number,z:number,r:number,a0:number,a1:number,c:Cam,u:number){const out:Pt[]=[],inn:Pt[]=[],n=18,A1=lerp(a0,a1,u);
 for(let i=0;i<=n;i++){const a=lerp(a0,A1,i/n);out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.86,z+Math.sin(a)*r*.86,c));}
 mark(s,shape([...out,...inn.reverse()]));}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  const m=makState(T).place,mx=m.x!,mz=-m.z!;
  // "That's the Makélélé role": a yellow ring on the grass round him (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[3]+.2,q[3]+.6,t));
  if(hal>.01)groundRing(s,mx,mz,1.1*hal,c);
  // "It quietly protects the whole team": a shield arc on the grass behind him, over the back four
  const shield=sm(q[1],q[1]+.9,t,easeOut)*(1-sm(q[2]+.4,q[2]+.9,t));
  if(shield>.01){const a=Math.atan2(GOAL_C[1]-mz,GOAL_C[0]-mx);groundBand(s,mx,mz,11,a-1.05,a+1.05,c,shield);}
  // "Stay between the ball and your goal": the dashed line from the ball (at the passer's feet) to the middle of France's goal — he is on it
  const line=sm(q[2],q[2]+1,t)*(1-sm(q[3]+.1,q[3]+.5,t));
  if(line>.01){const w=Math.max(8,.12*P3([mx,0,mz],c)[2]);dashes(s,G3(P0),[GOAL_C[0]+1.5,.11,GOAL_C[1]+.26],c,16,line,w,31);
   if(line>.97){const a=G(4.5,34.8,c),b=G(1.5,34.26,c);arrow(s,a,b,w,37);}}
  drawPlay(s,T,c,{ballScale:1.5,only:['makelele','totti','i-pass','vieira','thuram','gallas','barthez','ball'],noStadium:true});
  // "When you win it": a tick and a spark where he takes it, then the arrow of his simple pass to Vieira
  const stamp=sm(q[3]+.5,q[3]+.85,t,easeOutBack);
  if(stamp>.002){const bp=P3(INTERCEPT,c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   const k=.9*bp[2]*clamp(stamp),x=bp[0]+1.3*bp[2],y=bp[1]-1.6*bp[2];mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(stamp),{seed:71,taper:.15}));}
  const pass=sm(q[3]+1.1,q[3]+2,t,easeOut);
  if(pass>.01){const a=G(BALL2[0],BALL2[1],c),b=G(J[0]-.4,J[1]+.6,c);arrow(s,a,b,Math.max(10,.16*P3(G3(BALL2),c)[2]),21,pass);}
  frame(s);
 },
 get still(){return Q(3)[3]+2.4;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'makelele-signature',format:'11v11',title:'Makélélé: the shield',theme:'Stay between the ball and your goal, then pass it simply',
 ageNote:'How he played · Italy v France · World Cup final, 9 July 2006 · Berlin',
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
/** Solved contact points (pitch metres; France's goal line at X=0, Z across) — checked by tests/play-film-makelele-signature.cjs. */
export const FACTS={INTERCEPT,P0,R,BALL2,J,M_AT,GOAL_C,T_READ,T_INT,T_P2,ballAt,
 /** mid-sole of each of Makélélé's boots at the interception frame (my metres) */
 rightFoot:()=>{const st=makState(T_INT),sk=solve(st.pose,MAKELELE.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 leftFoot:()=>{const st=makState(T_INT),sk=solve(st.pose,MAKELELE.build,st.place,FIG);return toMy(midSole(sk.lToe,sk.lHeel));},
 /** his pelvis height at the interception (on his feet, not on the grass) */
 pelvisY:()=>{const st=makState(T_INT),sk=solve(st.pose,MAKELELE.build,st.place,FIG);return sk.pelvis[1];},
 /** his right boot at the simple pass */
 passFoot:()=>{const st=makState(T_P2),sk=solve(st.pose,MAKELELE.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 /** the Italy passer's right boot at the pass in */
 passerFoot:()=>{const st=passerState(0),sk=solve(st.pose,PASSER.build,st.place,FIG);return toMy(midSole(sk.rToe,sk.rHeel));},
 makAt:(T:number)=>{const st=makState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 tottiAt:(T:number)=>{const st=tottiState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
