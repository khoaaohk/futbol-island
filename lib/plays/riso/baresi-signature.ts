/** Iconic-play film · Franco Baresi, "Signature: the perfect interception" — shown HOW he did it, in one real, sourced match: Brazil v Italy,
 * World Cup final, 17 July 1994, Rose Bowl, Pasadena (0–0 after extra time; Brazil won the shoot-out 3–2).
 *
 * WHY THIS MATCH: Baresi's signature (lib/town/iconicPlays.json) is a trait — reading the pass and intercepting it — not one goal. The
 * written accounts do not describe one single Baresi interception in a way that can be recreated beat by beat, so the film follows the brief's
 * honest fallback: it is set in a real, well-described Baresi match (his return for the 1994 final, 23 days after knee surgery, a
 * "dominant defensive performance" and a clean sheet against Romário and Bebeto) and the narration says so plainly ("Here's how he
 * defended"). The interception itself is an ILLUSTRATION of his sourced style (anticipating and intercepting plays; the right foot is his
 * stronger foot), not a claim about one frame of the match. The follow-up is sourced for that match: Baresi "also acts as playmaker when
 * the move restarts" and in the first half Italy's reply came from a Baresi long ball (lancio) that set Massaro free.
 *
 * A riso print of one 3D choreography in pitch metres (X along the pitch, Italy's goal line at X=0, Z across, away from the main-stand
 * camera, Y up) seen through TV cameras — 1 live, the high main camera on the side (Brazil in possession, Baresi reading, Dunga's pass for
 * Romário, Baresi there first); 2 a TV slow-motion replay from a low camera goal-side (he watches the passer, moves early, steps in front);
 * 3 a second replay from upfield, facing him (ball won, head up, the long pass); 4 the lesson (the only chapter with teaching marks: the pass
 * lane, where it is going, his run there first). No overlays inside the footage chapters.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Franco Baresi" (1994 World Cup: meniscus injury v Norway, returned 25 days later for the final "with a dominant defensive
 *    performance, helping Italy to keep a clean sheet against Brazil"; style: "very good at winning back possession, and at anticipating and
 *    intercepting plays"; usually a LEFT centre-back; "his stronger foot was right"): https://en.wikipedia.org/wiki/Franco_Baresi
 *  - Wikipedia (it), "Franco Baresi" (the final: «una partita straordinaria»; cramps in the shoot-out): https://it.wikipedia.org/wiki/Franco_Baresi
 *  - G. Padovan & L. Valdiserri, "...e Baggio sbaglia il tiro della sua vita", Corriere della Sera, 18 July 1994, p. 3 (archive.org copy):
 *    Baresi rated 8 — knee operation on 24 June, "besides organising the defence he also plays playmaker when the move restarts"; "Baresi
 *    (great start) with a long ball that sets Massaro going" (Massaro's right-foot shot saved by Taffarel, about the 18th minute).
 *  - Wikipedia, "1994 FIFA World Cup final" (line-ups and numbers, kit boxes, "Brazil was unable to break through the center-back pairing of
 *    Franco Baresi and Paolo Maldini"): https://en.wikipedia.org/wiki/1994_FIFA_World_Cup_final
 * CONFIRMED: match, date, venue, daylight kick-off; 0–0 after 120 minutes; Baresi captain, number 6, centre-back beside Maldini (5); knee
 * (meniscus) surgery weeks before; his reading/intercepting style; right foot stronger; his long ball starting an Italy attack for Massaro
 * (19) in the first half; Dunga (8, Brazil captain) and Romário (11) played; kits — Italy blue shirts, white shorts, blue socks; Brazil
 * yellow shirts, blue shorts, white socks.
 * INFERRED (illustration, not in the accounts): the specific pass that is intercepted (Dunga for Romário), every position, path and timing,
 * Dunga's passing foot (right, drawn but never narrated), Baresi's intercepting foot (right, his stronger foot), where Massaro ran, which end
 * Italy defended on screen (their goal is screen-left from the main camera, as in the Maldini film of the same match), camera placements,
 * Pagliuca's shirt (neutral grey), hair and skin tones, and the San Gabriel mountains beyond the north end. The shoot-out is not shown or
 * narrated. The narration frames the play as "how he defended" and names only confirmed facts as facts.
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
import {drawAthlete,motionSmear,solve,blendPose,clampPose,runCycle,dribble,stand,strike,keeperSet,backpedal,lunge,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s plus pauses) timings: `at` = the onset of those exact words; `seconds` = the clip
 * incl. the silent tail that carries the passage. Scenes read cues by index (Q(i)[k]) — keep the counts [7,5,4,4]. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The final',text:'Pasadena, 1994: the World Cup final. Italy’s captain, Franco Baresi, had knee surgery just weeks before. Here’s how he defended. Dunga looks for Romário… but Baresi gets there first!',seconds:14.2,
  cues:[[0,'Pasadena'],[2.6,'Italy’s captain'],[4.6,'knee surgery'],[6.6,'Here’s how he defended'],[8.3,'Dunga looks for Romário'],[9.6,'but Baresi'],[10.5,'gets there first']]},
 {label:'The replay',text:'Watch again, slowly. Baresi watches Dunga, not just the ball. He guesses the pass is for Romário, so he moves early… and steps in front!',seconds:11.4,
  cues:[[0,'Watch again'],[1.7,'Baresi watches Dunga'],[4,'He guesses the pass'],[6.5,'so he moves early'],[8.3,'steps in front']]},
 {label:'Ball won',text:'Ball won! Baresi lifts his head and starts Italy’s attack with a long pass. In two hours of football, Brazil never scored.',seconds:10.2,
  cues:[[0,'Ball won'],[1.2,'Baresi lifts his head'],[3.6,'with a long pass'],[5.6,'Brazil never scored']]},
 {label:'The lesson',text:'That’s Baresi. Guess where the pass is going, and get there first!',seconds:8,
  cues:[[0,'That’s Baresi'],[1.4,'Guess where'],[2.3,'the pass is going'],[3.8,'get there first']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py baresi-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/baresi-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/baresi-signature/timing.json';
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

// ---------------------------------------------------------------- the Rose Bowl: one open bowl of seats, the grass, markings, goals
/** The bowl's inner rim: a rounded rectangle (superellipse) round the pitch, the seats rising from it on every side, no roof. */
const BOWL={cx:52.5,cz:34,a:63,b:45,n:4.2,rows:22,step:1.8,rise:.52,segs:40};
function bowlPt(u:number,d:number,y:number):V3{const th=u*TAU,c=Math.cos(th),s=Math.sin(th),e=2/BOWL.n;return[BOWL.cx+(BOWL.a+d)*Math.sign(c)*Math.abs(c)**e,y,BOWL.cz+(BOWL.b+d)*Math.sign(s)*Math.abs(s)**e];}
const TIER_INK:[string,number][]=[[O,.3],[B,.2],[Y,.3],[O,.18],[K,.18],[B,.3],[O,.42],[Y,.18]];
/** the San Gabriel mountains beyond the north end (screen-left from the west-side main camera): one far ridge, one tone */
const RIDGE:V3[]=(()=>{const r:V3[]=[[-700,0,-700]];const pk=[40,95,70,130,88,150,105,120,75,110,60];pk.forEach((h,i)=>r.push([-700,h,-700+i*1500/(pk.length-1)]));r.push([-700,0,800]);return r;})();
function stadium(s:Sheet,c:Cam){
 const hills=new Path2D();addPoly(hills,RIDGE,c);s.tone(B,hills,.32);
 const concrete=new Path2D(),wall=new Path2D(),tiers=TIER_INK.map(()=>new Path2D()),S=BOWL.segs;
 for(let g=0;g<S;g++){const u0=g/S,u1=(g+1)/S;
  addPoly(concrete,[bowlPt(u0,0,1.2),bowlPt(u1,0,1.2),bowlPt(u1,BOWL.rows*BOWL.step+1,1.2+(BOWL.rows*BOWL.step+1)*BOWL.rise),bowlPt(u0,BOWL.rows*BOWL.step+1,1.2+(BOWL.rows*BOWL.step+1)*BOWL.rise)],c);
  addPoly(wall,[bowlPt(u0,0,0),bowlPt(u1,0,0),bowlPt(u1,0,1.1),bowlPt(u0,0,1.1)],c);
  for(let k=0;k<BOWL.rows;k++){const d0=1+k*BOWL.step,d1=d0+BOWL.step*.8,y0=1.2+d0*BOWL.rise,y1=1.2+d1*BOWL.rise;
   addPoly(tiers[(k*3+g*5)%TIER_INK.length],[bowlPt(u0,d0,y0),bowlPt(u1,d0,y0),bowlPt(u1,d1,y1),bowlPt(u0,d1,y1)],c);}}
 s.fill(Y,concrete,.22);
 TIER_INK.forEach(([ink,cov],i)=>s.fill(ink,tiers[i],cov));
 s.fill(O,wall,.3);s.fill(B,wall,.5);s.stroke(K,wall,Math.max(2,.05*P3([10,0,34],c)[2]),.6);
 const grassPts:V3[]=[];for(let i=0;i<48;i++)grassPts.push(bowlPt(i/48,0,0));const grass=new Path2D();addPoly(grass,grassPts,c);s.fill(Y,grass,.6);s.fill(B,grass,.45);
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
/** A goal at line gx whose net runs out by dir (Italy's: gx 0, dir −1): white posts and bar, a net (paper haze + navy mesh). */
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
 * negates z both ways — that keeps Baresi's RIGHT boot on his right. */
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
const brazil=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:[B,.6],shorts:B,socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.6],scale:FIG,...o});
const italy=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:'paper',socks:B,boots:K,skin,hair:[K,.88],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Baresi: centre-back and captain, number 6, thinning dark hair */
const BARESI:AthleteStyle=italy(LIGHT,{number:6,seed:16,hair:K,hairStyle:'balding',build:{height:1.76,bulk:1}});
const DUNGA:AthleteStyle=brazil(LIGHT,{number:8,seed:8,hair:[K,.7],build:{height:1.76,bulk:1.02}});
const ROMARIO:AthleteStyle=brazil(MID,{number:11,seed:11,build:{height:1.69,bulk:1}});
const MASSARO:AthleteStyle=italy(LIGHT,{number:19,seed:19,build:{height:1.77}});
const PAGLIUCA:AthleteStyle={shirt:[K,.4],shorts:[K,.6],socks:[K,.4],boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:1,numberInk:'paper',scale:FIG,seed:1};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Dunga's pass)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
const T_PASS=0,T_INT=1.05;
/** Dunga passes from here, along the grass, for Romário checking toward the ball outside Italy's area */
const PASS_BALL:[number,number]=[40.5,40.2],ROM_TARGET:[number,number]=[25.2,32.6],LANE_D=nrm2(ROM_TARGET[0]-PASS_BALL[0],ROM_TARGET[1]-PASS_BALL[1]);
/** where Baresi meets it: 2.4 m before Romário's spot, on the lane */
const INT_XZ:[number,number]=add2(ROM_TARGET,LANE_D,-2.4);
/** Baresi faces the ball coming; the lunge puts his right boot on the lane */
const M_H=nrm2(-LANE_D[0]+.1,-LANE_D[1]-.15);
const LUNGE_DUR=.8,LUNGE_REACH=.6,LS=T_INT-LUNGE_REACH*LUNGE_DUR;
const M_AT:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH),BARESI.build,placeOf(0,0,M_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[INT_XZ[0]-f[0],INT_XZ[1]-f[2]];})();
const INT_Y:number=(()=>{const sk=solve(lunge(LUNGE_REACH),BARESI.build,placeOf(M_AT[0],M_AT[1],M_H),FIG);return Math.max(.12,toMy(midSole(sk.rToe,sk.rHeel))[1]+.11);})();
const INT:V3=[INT_XZ[0],INT_Y,INT_XZ[1]];
/** Dunga's pass: right foot, facing down the lane */
const PASS_DUR=.8,D_START=T_PASS-STRIKE_CONTACT*PASS_DUR,D_H=nrm2(LANE_D[0],LANE_D[1]+.12);
const D_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.45}),DUNGA.build,placeOf(0,0,D_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[PASS_BALL[0]-f[0]-D_H[0]*.12,PASS_BALL[1]-f[2]-D_H[1]*.12];})();
/** the ball comes off his boot into his path (R1); one touch on (LB); the long pass (right foot) upfield for Massaro */
const R1:[number,number]=add2(INT_XZ,M_H,1.5),TARGET:[number,number]=[71,24],L_D=nrm2(TARGET[0]-R1[0],TARGET[1]-R1[1]),LB:[number,number]=add2(R1,L_D,3);
const T_TOUCH=T_INT+1.15,LONG_DUR=1,T_LONG=T_INT+2.45,S_START=T_LONG-STRIKE_CONTACT*LONG_DUR,T_LAND=T_LONG+2.5,T_R0=LS+.66;
const S_H=nrm2(L_D[0],L_D[1]-.05);
const S_AT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.95}),BARESI.build,placeOf(0,0,S_H),FIG),f=toMy(midSole(sk.rToe,sk.rHeel));return[LB[0]-f[0]-S_H[0]*.12,LB[1]-f[2]-S_H[1]*.12];})();
type Track={id:string;style:AthleteStyle;keys:number[][]};
const BAR_READ:[number,number]=[19.6,35.2];
const BAR_KEYS=[[-7,17,36.4],[-4,17.8,36],[-1.8,19,35.5],[-.55,...BAR_READ],[LS,...M_AT],[T_R0,...M_AT],[T_TOUCH,...add2(R1,M_H,-.5)],[S_START,...S_AT]];
const ROM_KEYS=[[-7,18.5,29.6],[-4,19.6,30.2],[-1.8,20.6,30.8],[-.6,21.6,31.3],[T_INT,25.3,32.4],[T_INT+.9,25.9,32.6],[T_INT+4,25.2,32.2]];
const DUN_KEYS=[[-7,50,45.5],[-4,46.5,43.6],[-1.6,42.4,41.3],[D_START,...D_AT]];
const MAS_KEYS=[[-7,49,31],[-2,50.5,30.4],[T_INT,52,29.6],[T_LONG,57.5,27.6],[T_LAND,70.6,23.8],[T_LAND+2,74,23]];
const TRACKS:Track[]=[
 {id:'baresi',style:BARESI,keys:BAR_KEYS},
 {id:'romario',style:ROMARIO,keys:ROM_KEYS},
 {id:'dunga',style:DUNGA,keys:DUN_KEYS},
 {id:'massaro',style:MASSARO,keys:MAS_KEYS},
 {id:'maldini',style:italy(OLIVE,{number:5,seed:5,hair:K,build:{height:1.86,bulk:1.02}}),keys:[[-7,15.5,27],[-2,17.5,27.6],[T_INT,19,28.2],[T_LONG,23,28.6],[T_LAND+2,27,28.8]]},
 {id:'bebeto',style:brazil(DARK,{number:7,seed:7,build:{height:1.77,bulk:.98}}),keys:[[-7,21,22],[-2,22.5,23],[T_INT,24,24],[T_LONG,25,25],[T_LAND+2,27,26]]},
 // everyone else (positions illustrative, no numbers printed)
 {id:'i-rb',style:italy(LIGHT,{seed:18}),keys:[[-7,16,14],[0,17.5,15],[T_LONG,21,16],[T_LAND+2,26,17]]},
 {id:'i-lb',style:italy(OLIVE,{seed:23}),keys:[[-7,17,50],[0,19,49],[T_LONG,23,47],[T_LAND+2,29,45]]},
 {id:'i-m1',style:italy(LIGHT,{seed:24}),keys:[[-7,31,31],[0,30.5,32],[T_LONG,33,31],[T_LAND+2,39,30]]},
 {id:'i-m2',style:italy(OLIVE,{seed:25}),keys:[[-7,32,45],[0,33,44],[T_LONG,34,44.5],[T_LAND+2,35,49]]},
 {id:'b-5',style:brazil(DARK,{seed:35}),keys:[[-7,46,33],[0,43,32],[T_LONG,42,31],[T_LAND+2,46,30]]},
 {id:'b-9',style:brazil(LIGHT,{seed:29}),keys:[[-7,36,52],[0,33,50],[T_LONG,33,48],[T_LAND+2,37,46]]},
 {id:'b-17',style:brazil(MID,{seed:37}),keys:[[-7,36,17],[0,33,18],[T_LONG,33,19],[T_LAND+2,38,20]]},
 {id:'b-13',style:brazil(MID,{seed:43}),keys:[[-7,60,30],[0,58,29],[T_LONG,60,27],[T_LAND,68,25.6],[T_LAND+2,71,25]]},
 {id:'b-15',style:brazil(LIGHT,{seed:45}),keys:[[-7,61,40],[0,59,39],[T_LONG,61,35],[T_LAND,67,29],[T_LAND+2,70,27]]},
];
const PAG_KEYS=[[-7,4,34],[0,5,33.6],[T_LONG,7,33],[T_LAND+2,9,33]];
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-7.2);for(let t=-7;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
/** The ball at play time T: Dunga's dribble, his pass along the grass for Romário, taken off the lane by Baresi's right boot into his path,
 * one touch on, then the long ball (right foot) high upfield for Massaro, bouncing on. */
function ballAt(T:number):V3{
 const pb:V3=[PASS_BALL[0],.11,PASS_BALL[1]],iv=INT,r1:V3=[R1[0],.11,R1[1]],lb:V3=[LB[0],.11,LB[1]],tg:V3=[TARGET[0],.11,TARGET[1]];
 if(T<D_START){const p=trackAt(DUN_KEYS,T),v=velAt(DUN_KEYS,T),s=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/s*(.6+.4*Math.max(0,Math.sin(T*TAU/.7))),.11,p[1]+v[1]/s*(.6+.4*Math.max(0,Math.sin(T*TAU/.7)))];}
 if(T<T_PASS){const p=trackAt(DUN_KEYS,D_START),v=velAt(DUN_KEYS,D_START-.1),s=Math.hypot(v[0],v[1])||1,a:V3=[p[0]+v[0]/s*.6,.11,p[1]+v[1]/s*.6];return lerp3(a,pb,sm(D_START,T_PASS,T,easeInOutSine));}
 if(T<T_INT)return lerp3(pb,iv,clamp((T-T_PASS)/(T_INT-T_PASS)*(1.12-.12*(T-T_PASS)/(T_INT-T_PASS))));
 if(T<T_TOUCH)return lerp3(iv,r1,sm(T_INT,T_INT+.6,T,easeOut),.15);
 if(T<T_LONG)return lerp3(r1,lb,sm(T_TOUCH,T_LONG-.3,T,easeOut));
 if(T<T_LAND)return lerp3(lb,tg,clamp((T-T_LONG)/(T_LAND-T_LONG)),12);
 const u=sm(T_LAND,T_LAND+1.6,T,easeOut),p=lerp3(tg,[tg[0]+5,.11,tg[2]-1.2],u);p[1]=.11+2.4*Math.abs(Math.cos(u*Math.PI*1.5))*(1-u)*(1-u);return p;
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
/** Baresi before the lunge: reading in a low stance (facing the passer), then — before the pass is struck — the early sprint across */
function baresiApproach(T:number):St{
 const v=velAt(BAR_KEYS,T),sp=Math.hypot(v[0],v[1]),d=trackAt(DUN_KEYS,Math.min(T,D_START)),p=trackAt(BAR_KEYS,T),toPasser=nrm2(d[0]-p[0],d[1]-p[1]);
 const h=sp>1.2?yawTo([v[0]/sp,v[1]/sp],M_H,sm(LS-.3,LS,T)):toPasser,st=runState(BAR_KEYS,T,h);
 // reading: knees bent, on his toes, small shuffles, eyes on the passer
 const ready=blendPose(backpedal(T*.9),stand(),.45);
 const pose=blendPose(st.pose,ready,(1-sm(-.7,-.35,T))*.85);
 return{pose:lookAtBall({pose,place:st.place},T,.8),place:st.place};
}
/** Baresi: reading, the early run, the right-foot interception, up and away with the ball, one touch, the long pass, watching it go */
function baresiState(T:number):St{
 if(T<LS)return baresiApproach(T);
 const place=placeOf(M_AT[0],M_AT[1],M_H);
 if(T<T_R0){const u=clamp((T-LS)/LUNGE_DUR);return{pose:blendPose(baresiApproach(LS).pose,lunge(u),sm(0,.18,u)),place};}
 if(T<S_START){// off the lunge and after the ball: a quick carry, head coming up to look upfield
  const st=runState(BAR_KEYS,T,yawTo(M_H,L_D,sm(T_R0,T_TOUCH,T,easeInOutSine)));
  let pose=blendPose(st.pose,dribble(strideAt(BAR_KEYS,T)*.9/3.4,{foot:'r',speed:.6}),.55);
  pose=blendPose(lunge(clamp((T-LS)/LUNGE_DUR)),pose,sm(T_R0,T_R0+.3,T));
  const up=sm(T_TOUCH-.1,T_TOUCH+.5,T);pose={...pose,neckP:pose.neckP-.5*up,lean:pose.lean-.12*up};
  const h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],S_H,sm(S_START-.5,S_START,T));
  const at=trackAt(BAR_KEYS,T);return{pose:clampPose(pose),place:placeOf(at[0],at[1],h)};}
 const u=clamp((T-S_START)/LONG_DUR),sp=placeOf(S_AT[0],S_AT[1],S_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.95}),place:sp};
 const pose=keyPoses(clamp((T-S_START-LONG_DUR)/.7),[[0,strike(1,{foot:'r',power:.95})],[1,stand()]]);
 return{pose:lookAtBall({pose,place:sp},T,.7),place:sp};
}
/** Dunga: on the ball, head up, the pass (right foot), then watching it */
function dungaState(T:number):St{
 if(T<D_START){const st=runState(DUN_KEYS,T);let pose=blendPose(st.pose,dribble(strideAt(DUN_KEYS,T)*.9/3.4,{foot:'r',speed:.5}),.5);
  const at=trackAt(DUN_KEYS,T),h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],D_H,sm(D_START-.6,D_START,T));
  pose=lookAtBall({pose,place:st.place},T,.4);return{pose,place:placeOf(at[0],at[1],h)};}
 const u=clamp((T-D_START)/PASS_DUR),place=placeOf(D_AT[0],D_AT[1],D_H);
 if(u<1)return{pose:strike(u,{foot:'r',power:.45}),place};
 const pose=keyPoses(clamp((T-D_START-PASS_DUR)/.6),[[0,strike(1,{foot:'r',power:.45})],[1,stand()]]);
 return{pose:lookAtBall({pose,place},T,.8),place};
}
/** Romário: checking toward the ball, beaten to it, pulling up */
function romarioState(T:number):St{const st=runState(ROM_KEYS,T);return{pose:lookAtBall(st,T,.7),place:st.place};}
function pagliucaState(T:number):St{const[x,z]=trackAt(PAG_KEYS,T),b=ballAt(T);return{pose:keeperSet(T*1.3),place:placeOf(x,z,nrm2(b[0]-x,b[2]-z))};}
function stateOf(id:string,T:number):St{
 if(id==='baresi')return baresiState(T);if(id==='dunga')return dungaState(T);if(id==='romario')return romarioState(T);if(id==='pagliuca')return pagliucaState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
const HEROES=['baresi','romario','dunga'];
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the stadium, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;noStadium?:boolean}={}){
 if(!o.noStadium)stadium(s,c);
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'pagliuca'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;// nobody printed right against the lens
  const style=id==='pagliuca'?PAGLIUCA:TR(id).style,hero=HEROES.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=id==='baresi'&&((T>-.55&&T<T_INT+.1)||Math.abs(T-T_LONG)<.25);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T-T_INT)<.3||Math.abs(T-T_LONG)<.3?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);if(onScreen(g))s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:B,seed:3});}});}}
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on the west side: Brazil on the ball, a push in on the captain, then wide for the pass — Baresi first. */
const MAIN_CAM:V3=[40,27,-40];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-6.6],[q[3],-2.4],[q[4],-.95],[q[5],-.1],[q[6],T_INT],[S,T_LONG+1.3]]);};
const cam1=(t:number)=>{const q=Q(0),T=t1(t),b=ballAt(Math.min(T,T_LONG+.2)),bz=trackAt(BAR_KEYS,Math.min(T,LS));
 const focus=sm(q[1]-.2,q[1]+1.2,t,easeInOutSine)*(1-sm(q[3]-.4,q[3]+.8,t,easeInOutSine));// "Italy's captain": in on Baresi
 const wide:[number,number]=[clamp(lerp(b[0],bz[0],.45),22,52),lerp(34,31,sm(T_INT,T_LONG+1,T))];
 const tx=lerp(wide[0],bz[0],focus),tz=lerp(wide[1],bz[1],focus),F=lerp(lerp(6200,7600,sm(-2,T_INT,T,easeInOutSine)),11500,focus)*lerp(1,.8,sm(T_LONG-.3,T_LONG+1,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[6]+.3;},
};
/** 2 · TV slow-motion replay from a low camera goal-side and wide of the pair: Baresi reading the passer, the early move, in front. */
const LOW_CAM:V3=[11,1.7,40];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-2.6],[q[1],-2.1],[q[2],-1.2],[q[3],-.55],[q[4],LS+.15],[q[4]+1.2,T_INT],[S,T_INT+.4]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(BAR_KEYS,Math.min(T,LS)),r=trackAt(ROM_KEYS,T),mid:[number,number]=[(m[0]+r[0])/2+1.6,(m[1]+r[1])/2+.6],
 tgt=[lerp(mid[0],INT_XZ[0]+.8,sm(-.6,T_INT,T)),lerp(mid[1],INT_XZ[1]+.4,sm(-.6,T_INT,T))],F=lerp(1900,2500,sm(-2,T_INT,T,easeInOutSine));
 return camAt(LOW_CAM,[tgt[0],1,tgt[1]],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.9;},
};
/** 3 · the second replay, from a raised camera upfield on the far side, facing him: the ball won, his head up, the long pass away. */
const UP_CAM:V3=[39,3.4,44];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,T_INT-.25],[q[1],T_INT+.9],[q[2],S_START+.1],[q[2]+1,T_LONG+.2],[q[3],T_LONG+1.3],[S,T_LAND+.6]]);};
const cam3=(t:number)=>{const T=t3(t),m=trackAt(BAR_KEYS,Math.min(T,S_START)),b=ballAt(T),follow=sm(T_LONG,T_LAND,T,easeInOutSine),
 tx=lerp(m[0]+1.2,m[0]+5,follow),ty=lerp(1,2.2,follow),tz=lerp(m[1],m[1]-2.5,follow),F=lerp(2300,1700,sm(T_LONG-.2,T_LONG+1.2,T,easeInOutSine));
 return camAt(UP_CAM,[tx,ty,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[1]+.8;},
};
/** 4 · the lesson plate: the moment again from a raised camera on the near side, with bold yellow teaching marks — a ring round Baresi,
 * the pass lane from Dunga (guess where), a ring where it is going (Romário's spot), his run there first and a burst + tick on the ball. */
const LESSON_CAM:V3=[23,7.5,19];
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-1.1],[q[3]-.3,-.7],[q[3]+1.1,T_INT],[S,T_INT+.35]]);};
const cam4=(t:number)=>camAt(LESSON_CAM,[24,.6,34.2],1900);
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t);frame(s);
  stadium(s,c);
  // "That's Baresi": a yellow ring on the grass round him (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.2,q[1]+.6,t));
  if(hal>.01){const m=baresiState(T).place;groundRing(s,m.x!,-m.z!,1.2*hal,c);}
  // "the pass is going": a ring on Romário's spot, where the pass is meant to go
  const spot=sm(q[2],q[2]+.35,t,easeOutBack);
  if(spot>.01)groundRing(s,ROM_TARGET[0],ROM_TARGET[1],1*spot,c);
  drawPlay(s,T,c,{ballScale:1.5,only:['baresi','dunga','romario','ball'],noStadium:true});
  // "Guess where": the pass lane, from Dunga's boot toward Romário
  const lane=sm(q[1],q[1]+.9,t,easeInOutSine);
  if(lane>.01){const a=G(PASS_BALL[0]+LANE_D[0]*1.2,PASS_BALL[1]+LANE_D[1]*1.2,c),b=G(ROM_TARGET[0]-LANE_D[0]*1.3,ROM_TARGET[1]-LANE_D[1]*1.3,c),w=Math.max(10,.16*P3([INT_XZ[0],0,INT_XZ[1]],c)[2]);arrow(s,a,b,w,21,lane);}
  // "get there first": his run from the reading spot to the ball, then a burst and a tick at the interception
  const run=sm(q[3],q[3]+.8,t,easeInOutSine);
  if(run>.01){const a=G(BAR_READ[0]+.6,BAR_READ[1]-.3,c),b=G(INT_XZ[0]-.9,INT_XZ[1]+.25,c),w=Math.max(10,.16*P3([INT_XZ[0],0,INT_XZ[1]],c)[2]);arrow(s,a,b,w,22,run);}
  const stamp=sm(q[3]+1.1,q[3]+1.45,t,easeOutBack);
  if(stamp>.002){const bp=P3(INT,c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});
   const k=.9*bp[2]*clamp(stamp),x=bp[0]+.4*bp[2],y=bp[1]-2.4*bp[2];mark(s,ribbon([[x-k*.45,y],[x-k*.12,y+k*.35],[x+k*.55,y-k*.5]],Math.max(8,.14*bp[2])*clamp(stamp),{seed:71,taper:.15}));}
  frame(s);
 },
 get still(){return Q(3)[3]+1.6;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'baresi-signature',format:'11v11',title:'Baresi: there first',theme:'Guess where the pass is going and get there first',
 ageNote:'Brazil v Italy · World Cup final, 17 July 1994 · Pasadena, USA',
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
/** Solved contact points (pitch metres; Italy's goal line at X=0, Z across) — checked by tests/play-film-baresi-signature.cjs. */
const feet=(st:St,build:AthleteStyle['build'])=>{const sk=solve(st.pose,build,st.place,FIG);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel)),pelvisY:sk.pelvis[1]};};
export const FACTS={INT,INT_XZ,PASS_BALL,ROM_TARGET,LB,TARGET,T_PASS,T_INT,T_LONG,T_LAND,ballAt,
 baresiFeet:(T:number)=>feet(baresiState(T),BARESI.build),
 dungaFeet:(T:number)=>feet(dungaState(T),DUNGA.build),
 baresiAt:(T:number)=>{const st=baresiState(T);return[st.place.x!,-st.place.z!] as [number,number];},
 romarioAt:(T:number)=>{const st=romarioState(T);return[st.place.x!,-st.place.z!] as [number,number];}};
