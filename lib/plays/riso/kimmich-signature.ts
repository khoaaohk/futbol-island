/** Joshua Kimmich, signature "the pinpoint pass from deep": his cross to the back post for Kingsley Coman's header, the only goal of the
 * Champions League final, Paris Saint-Germain 0–1 Bayern Munich, Estádio da Luz, Lisbon, 23 August 2020 (59'). An iconic-play riso film
 * (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: Kimmich's entry in lib/town/iconicPlays.json is a signature trait (kind "signature", template through_ball_assist, side
 * right), not one match. This is his most famous delivery, the one written sources single out: from right-back, well outside the box, he
 * picked out the one free player at the far post and won the European Cup with it; UEFA named him man of the match. The sources describe
 * the play itself (who passed to whom, the cross from the right, the unmarked far-post runner, the low header across the keeper), so the
 * match chapters stage it; the lesson ("aim at your teammate's front foot") is a ground pass, which this cross was not, so the last chapter
 * is a plainly separate "your turn" demonstration on a training pitch with two young players in training kit (no named players, no match).
 *
 * SOURCES (fetched Sept 2026, cached in the film agents' scratchpad src-cache):
 *  - Wikipedia, "2020 UEFA Champions League final" (raw wikitext: summary of the goal, line-ups, kit infobox, venue, attendance, kick-off)
 *    https://en.wikipedia.org/wiki/2020_UEFA_Champions_League_final
 *  - UEFA.com, "Paris 0-1 Bayern: Coman strikes gold" (23 August 2020, match report)
 *    https://www.uefa.com/uefachampionsleague/news/0260-1033c96091a1-3d127374ef80-1000--paris-0-1-bayern-coman-scores-champions-league-final-winner/
 *  - card facts: lib/town/playerAppearance.json (Germany) and lib/town/playerCareers.json (Bayern Munich since 2015).
 * CONFIRMED by those accounts: Sunday 23 August 2020, Estádio da Luz, Lisbon, behind closed doors (attendance 0; UEFA mentions "the two
 * contingents in the stand"), 21:00 CEST kick-off; Paris 0–1 Bayern, the only goal by Coman in the 59th minute, assisted by Kimmich;
 * Wikipedia: "Thomas Müller laid a pass from Serge Gnabry back to right-back Joshua Kimmich, who crossed the ball from the right into the
 * box towards the unmarked Coman at the far post, which was headed across the goal past Navas and into the right corner of the net"; UEFA:
 * "Joshua Kimmich's ball to the back post invited Coman to head low across Keylor Navas"; Bayern became European champions for a sixth
 * time. Line-ups at 59': Bayern Neuer; Kimmich (32, RB), Süle (4, on for Boateng 25'), Alaba (27), Davies (19); Thiago (6), Goretzka (18);
 * Gnabry (22), Müller (25), Coman (29); Lewandowski (9). Paris Navas (1); Kehrer (4), Thiago Silva (2), Kimpembe (3), Bernat (14); Herrera
 * (21), Marquinhos (5), Paredes (8); Di María (11), Mbappé (7), Neymar (10). Referee Daniele Orsato. KIT (Wikipedia kit infobox): Paris
 * in their 2019–20 HOME kit, navy shirt with the red centre stripe edged in white, navy shorts, navy socks; Bayern in their 2020–21 HOME
 * kit, all red (red shirt, red shorts with white stripes, red socks with white stripes).
 * INFERRED (illustrative): every position and timing between those beats; the direction of play on screen (Bayern attacking left to
 * right, so their right wing is the near touchline under the main-stand camera); where Gnabry and Müller stood; Kimmich's set touch before
 * the cross, his RIGHT foot (he is right-footed) and the ball's height and slight outswing; Coman's run from the left wing, the take-off and
 * the exact contact point; which PSG players were closest (Kehrer drawn a few metres goal-side and inside him, Bernat closing Kimmich);
 * Navas's late dive to his left; the celebration; the kit details the infobox does not settle (numbers, trims, boots, shirt textures; the
 * keeper's yellow kit and the referee's light kit are guesses); the Estádio da Luz shape (a rounded two-tier bowl of empty red seats under
 * a dark roof ring) and the night sky (the 59th minute came about an hour after sunset); the ball design; the camera placements; the whole
 * training-pitch demonstration in chapter 4.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time: opening on the empty red seats, then Gnabry → Müller → the lay-off to Kimmich on the right, the cross, Coman's header; 2 = slow-
 * motion replay from low behind Kimmich on the right touchline: he looks up (a sight line to Coman), Coman lights up with space all round
 * him at the far post, the ball's flight is traced onto his head; 3 = replay from behind the goal: the header low across Navas, the net
 * bulge, a swing round to the celebration; 4 = the lesson, a separate demonstration on a daytime training pitch: look up early (sight
 * line), aim the pass (arrow) at the runner's front foot (a ring ahead of his leading boot), he keeps running (speed lines). All figures are
 * the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). World: right-handed metres exactly like
 * athlete.ts (X toward the Paris goal at 105, Y up, Z across; the main-stand camera sits at +Z, which is Bayern's RIGHT wing), so a right
 * foot is a right foot without a mirrored projector. Scenes read only (t, c); every action keys off cue times, so the recorded voice
 * (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,strike,header,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈ .2 s a word + .021 s a letter + punctuation pauses, calibrated on the voiced Maradona film) until the Kokoro
 * voice exists. Every cue starts with a plain word (Kokoro splits contractions). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The cross, live',text:'Lisbon, 2020, the Champions League final. Gnabry finds Müller, who lays it back to Joshua Kimmich on the right. He looks up, crosses to the back post... Coman heads it in!',tail:2.2,
  cues:['Lisbon','Champions League','Gnabry finds','lays it back','Joshua Kimmich','on the right','He looks up','crosses','back post','Coman heads','it in']},
 {label:'Watch it again',text:'Watch it again, slowly. Kimmich spots Kingsley Coman, all alone at the far post, and drops the ball onto his head.',tail:1.3,
  cues:['Watch it again','Kimmich spots','Kingsley Coman','all alone','far post','drops the ball','onto his head']},
 {label:'The header',text:'Coman heads it low, across the keeper. It was the only goal: Bayern were champions of Europe!',tail:2.1,
  cues:['Coman heads','low,','across the keeper','only goal','Bayern were','champions','Europe']},
 {label:'Your turn',text:"Your turn: look up early, and aim your pass at your teammate's front foot, so they can keep running.",tail:1.9,
  cues:['Your turn','look up early','aim your pass','front foot','keep running']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py kimmich-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/kimmich-signature/timing.json';
 * and pass `timingJson as NarrationTiming` here: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times itself. */
import timingJson from '../../../public/plays/narration/kimmich-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .2 s + .021 s a letter per word, pauses after , : . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.34;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('kimmich: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kimmich: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (the near stand under a gantry camera is culled) */
function quadP(c:Cam,q:V3[],minDepth=10):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a ring on the grass (radius rx along X, rz along Z), as a ribbon */
function groundRing(c:Cam,x:number,z:number,rx:number,rz:number,wm:number,seed:number,minW=3):Path2D|null{const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[x+Math.cos(a)*rx,0,z+Math.sin(a)*rz]);if(q)pts.push(q);}
 if(pts.length<28)return null;const q=toCam(c,[x,0,z]);return ribbon(pts,Math.max(minW,c.F*wm/Math.max(1,q[2])),{close:true,seed,taper:0,wobble:.9});}

// ---------------------------------------------------------------- the Estádio da Luz behind closed doors: a rounded two-tier bowl of EMPTY red seats
const CX=52.5,NS=48;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a squarish superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(61+d)*Math.sign(c)*Math.pow(Math.abs(c),.32),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.32)];}
const LOW=(b:number):[number,number]=>[2+19*b,1.4+11*b],UP=(b:number):[number,number]=>[23+19*b,16+15*b];
type Bowl={low:V3[][];up:V3[][];box:V3[][];roof:V3[][];rows:[V3,V3][];aisles:[V3,V3][];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],box:[],roof:[],rows:[],aisles:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.box.push([rim(a,21,12.4),rim(b,21,12.4),rim(b,23,16),rim(a,23,16)]);
  o.roof.push([rim(a,26,35.5),rim(b,26,35.5),rim(b,48,38),rim(a,48,38)]);
  for(const[f,n] of [[LOW,5],[UP,5]] as [(u:number)=>[number,number],number][])for(let r=1;r<=n;r++){const[d,y]=f(r/(n+1));o.rows.push([rim(a,d,y+.1),rim(b,d,y+.1)]);}
  if(i%2===0){const[d0,y0]=LOW(0),[d1,y1]=LOW(1),[e0,z0]=UP(0),[e1,z1]=UP(1);o.aisles.push([rim(a,d0,y0),rim(a,d1,y1)],[rim(a,e0,z0),rim(a,e1,z1)]);}
  o.lamps.push(rim((i+.5)/NS*TAU,27,35.2));}
 return o;})();
/** everything behind the pitch: the night sky, the bowl of empty seats, the roof ring with its lamps (no crowd: behind closed doors) */
function stadium(s:Sheet,c:Cam,v:View,o:{glow?:number}={}){
 const{glow=0}=o;
 // an hour after sunset over Lisbon in late August: a deep navy night, floodlit
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.55);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.5);
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),rows=new Path2D(),aisles=new Path2D(),lamp=new Path2D(),halo=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)addPoly(p,r);};add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.box[i],box);add(BOWL.roof[i],roof);}
 for(const[a,b] of BOWL.rows)if(Math.min(toCam(c,a)[2],toCam(c,b)[2])>12)seg3(c,a,b,.16,rows,.8);
 for(const[a,b] of BOWL.aisles)if(Math.min(toCam(c,a)[2],toCam(c,b)[2])>12)seg3(c,a,b,.9,aisles,.8);
 BOWL.lamps.forEach((P,i)=>{const q=toCam(c,P);if(q[2]<14)return;const g=scr(c,q);if(!inView(v,g,40))return;const r=clamp(c.F*1.1/q[2],2,40);lamp.addPath(polyPath(blob(g[0],g[1],r*1.5,r*.5,i+3,{amp:.05,n:10}),true));const r2=clamp(c.F*5/q[2],6,140);halo.addPath(polyPath(blob(g[0],g[1]+r2*.4,r2*1.5,r2,i*31,{amp:.06,n:14}),true));});
 s.tone(Y,halo,.16);
 // empty red seats (Benfica's red), the upper tier a step darker under the roof; paper rows and aisles
 s.knockout(low);s.fill(R,low,.82);s.tone(K,low,.2);
 s.knockout(up);s.fill(R,up,.78);s.tone(K,up,.38);
 s.knockout(rows,.42);s.knockout(aisles,.55);
 s.knockout(box);s.fill(K,box,.85);
 s.knockout(roof);s.fill(K,roof,.92);
 s.knockout(lamp);s.fill(Y,lamp,.95);
 if(glow>0){const p=new Path2D();BOWL.lamps.forEach((P,i)=>{const q=toCam(c,P);if(q[2]<14||hash(i,5)<.5)return;const g=scr(c,q);if(!inView(v,g))return;const z=clamp(c.F*2.2/q[2],6,60)*glow;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.3],[g[0]+z,g[1]],[g[0],g[1]+z*.3]],true));});s.fill(Y,p,.9);}
}
/** the surround, grass (yellow × blue) with mowing stripes, boards, paper lines, corner flags, both goals (the Paris goal drawn later when it
 * is in front of the players, i.e. from the camera behind it). `lane` paints the right-wing channel, `box` lights the penalty area. */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean;lane?:number;box?:number}={}){
 const sur=polyP(c,[[-8,0,-40],[113,0,-40],[113,0,40],[-8,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.45);s.tone(K,p,.34);}
 const g=polyP(c,[[-5,0,-37],[110,0,-37],[110,0,37],[-5,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]));s.tone(K,st,.1);
 if((o.lane??0)>0){const w=o.lane!,q=polyP(c,[[64,0,20.16],[64+30*w,0,20.16],[64+30*w,0,34],[64,0,34]]);if(q.length>2){const p=polyPath(q,true);s.knockout(p,.18*w);s.tone(Y,p,.5*w);}const e=new Path2D();seg3(c,[64,.01,20.16],[64+30*w,.01,20.16],.35,e,2);s.fill(Y,e,.9*w);}
 // boards: the far touchline (Z = −37) and behind both goals, navy with paper panels (the near boards sit under the camera)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));addPoly(pn,polyP(c,[[-3.45,.25,z],[-3.45,.25,z+3.4],[-3.45,.65,z+3.4],[-3.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.5);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 if((o.box??0)>0){const h=new Path2D(),P:V3[]=[[105,.01,-20.16],[88.5,.01,-20.16],[88.5,.01,20.16],[105,.01,20.16]];for(let k=0;k<3;k++)seg3(c,P[k],P[k+1],.4,h,2);s.knockout(h,.8*o.box!);s.fill(Y,h,.95*o.box!);}
 // corner flags at the Paris end
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);addPoly(flag,polyP(c,[[105,1.55,z],[105,1.2,z],[104.55,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,NET[2]);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back and the roof out around z = bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))),top=(z:number)=>1.9+bulge*.2*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),top(z0),z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),top(z1),z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),top(z),z],.025,mesh,.7);seg3(c,[back(z),top(z),z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=j/6;for(let i=0;i<zs.length-1;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),top(za)*y,za],[back(zb),top(zb)*y,zb],.025,mesh,.7);}seg3(c,[X,y*H,z0],[back(z0),top(z0)*y,z0],.025,mesh,.7);seg3(c,[X,y*H,z1],[back(z1),top(z1)*y,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Bayern: the 2020–21 home kit, all red: shirt, shorts and socks (confirmed); paper numbers and trim inferred */
const BAY=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,trim:'paper',numberInk:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,seed:3,...o});
const KIMMICH_ST=BAY({number:32,skin:SKIN_L,hair:[K,.7],build:{height:1.77,bulk:.96},seed:32});
const COMAN_ST=BAY({number:29,skin:SKIN_D,hair:[K,.95],hairStyle:'curly',build:{height:1.79,bulk:.95},seed:29});
/** Paris: the 2019–20 home kit, navy shirt with the red centre stripe edged in white, navy shorts and socks (confirmed); the stripe is added
 * by the adapter (athlete.ts has no single centre stripe); paper numbers and red trim inferred */
const PSG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,shorts:K,socks:K,boots:K,trim:R,numberInk:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** Keylor Navas: keeper kit inferred (yellow), gloves inferred */
const NAVAS_ST:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'short',line:K,gloves:[K,.7],sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.85},seed:51};
const REF:AthleteStyle={shirt:[B,.5],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'bald',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs;
 * hechter = the Paris centre stripe (red, edged in white) printed down the shirt when the chest faces toward or away from the lens. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;hechter?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.hechter&&r.detail!=='low'&&r.heightPx>34){
  const sk=r.sk,fx=sk.face[0]-sk.head[0],fz=sk.face[2]-sk.head[2],e=camera.eye,tx=e[0]-sk.chest[0],tz=e[2]-sk.chest[2],
   k=Math.abs(fx*tx+fz*tz)/((Math.hypot(fx,fz)||1)*(Math.hypot(tx,tz)||1)),J=r.joints,top=lerpP(J.neck,J.pelvis,.1),bot=lerpP(J.neck,J.pelvis,.86);
  if(k>.45&&Math.hypot(top[0]-bot[0],top[1]-bot[1])>r.heightPx*.12){const w=Math.max(1.2,Math.hypot(J.lSh[0]-J.rSh[0],J.lSh[1]-J.rSh[1])*.16*k);
   s.knockout(ribbon([top,bot],w*2.4,{seed:7,taper:0,wobble:.3}),.9);s.fill(R,ribbon([top,bot],w*1.2,{seed:7,taper:0,wobble:.3}),.95);}}
 return r;
}
const lerpP=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Kimmich's cross)
type Role='bay'|'psg'|'gk'|'ref';
/** a keyed move: a pass (contact at `at`), a header (contact at `at`), a keeper dive (full stretch at `at`) */
type Move={kind:'pass'|'head'|'dive';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** the key moments (τ): Gnabry's pass, Müller's lay-off, Kimmich's first touch, the cross, Coman's header */
const PASS1=-3.2,LAY=-2.35,RX=-1.35,CROSS=0,HEAD=1.22;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The players the accounts name get the beats the accounts give them (Gnabry,
 * Müller, Kimmich, Coman, Navas); where exactly everyone stood is inferred. */
const ACTORS:Actor[]=[
 {name:'Kimmich',role:'bay',style:KIMMICH_ST,key:true,moves:[{kind:'pass',at:CROSS,dur:.8,side:'r',power:.6}],keys:[[-6,68,27],[-4.5,70.5,26.2],[-3,73.6,24.6],[-2,76.4,22.8],[-1.35,78.2,21.8],[-.8,79.2,21.2],[-.3,80,20.8],[0,80.4,20.7],[.5,80.9,20.5],[1.4,81.6,20.1],[2.6,83.4,18],[4.5,87.5,14],[8,92,9]]},
 {name:'Coman',role:'bay',style:COMAN_ST,key:true,moves:[{kind:'head',at:HEAD,dur:.8,side:'r'}],keys:[[-6,82,-20],[-4,85,-18.4],[-2.5,88.6,-15.6],[-1.2,92.4,-11.6],[0,95.8,-8],[.6,97.9,-6.1],[1.05,99.4,-5],[1.22,99.8,-4.8],[1.6,100.4,-4.4],[2.4,101.2,-2.6],[3.4,100.6,3],[4.6,98.6,9.5],[6,96.4,14],[8,94.5,17]]},
 {name:'Müller',role:'bay',style:BAY({number:25,seed:42,build:{height:1.85,bulk:.93}}),key:true,moves:[{kind:'pass',at:LAY,dur:.7,side:'r',power:.22}],keys:[[-6,84.5,15.5],[-4,86.4,13.4],[-3,87.4,12.6],[-2.35,87.7,12.3],[-1.6,89.4,11],[0,93.4,8],[1.2,96.4,6.2],[2.5,97.4,6],[4.5,97,10],[8,95.5,15]]},
 {name:'Gnabry',role:'bay',style:BAY({number:22,skin:SKIN_M,seed:43}),key:true,moves:[{kind:'pass',at:PASS1,dur:.75,side:'r',power:.3}],keys:[[-6,79.5,26.5],[-4.5,82,25],[-3.2,83.6,23.8],[-2,85,22.6],[0,88.6,19.4],[2,91.6,15.6],[5,93.5,14.5],[8,93,16]]},
 {name:'Navas',role:'gk',style:NAVAS_ST,key:true,moves:[{kind:'dive',at:HEAD+.3,dur:.8,side:'l'}],keys:[[-6,103.4,2.2],[-2,103.5,2],[0,103.7,.8],[.8,103.8,-.8],[1.22,103.8,-1.3],[8,103.8,-1.3]]},
 {name:'Kehrer',role:'psg',style:PSG({number:4,seed:61,build:{height:1.86}}),keys:[[-6,93,-13],[-3,95.4,-9.6],[-1,97.6,-6.2],[0,98.6,-4.6],[1.22,99.6,-3],[3,100.4,-2.6],[8,100.4,-2]]},
 {name:'Thiago Silva',role:'psg',style:PSG({number:2,seed:62,build:{height:1.83}}),keys:[[-6,94.6,3.6],[-2,96.6,2.4],[0,98.4,1.6],[1.22,99.4,.8],[8,99.6,1]]},
 {name:'Kimpembe',role:'psg',style:PSG({number:3,skin:SKIN_D,seed:63,build:{height:1.83,bulk:1.06}}),keys:[[-6,94,-3.6],[-2,96.4,-2.4],[0,97.6,-1.4],[1.22,98.8,-1.4],[8,99,-1]]},
 {name:'Bernat',role:'psg',style:PSG({number:14,skin:SKIN_L,seed:64,build:{height:1.7}}),keys:[[-6,87.6,20.8],[-3.2,86.8,20.4],[-2,85.4,20.4],[-1,84.2,20.2],[0,83.6,20],[1.2,84.6,19.2],[8,90,15]]},
 {name:'Herrera',role:'psg',style:PSG({number:21,skin:SKIN_L,seed:65,build:{height:1.82}}),keys:[[-6,85,9.6],[-3,86.6,10.8],[-2,87.6,10.4],[0,90.6,7.8],[1.2,92.6,6.6],[8,95,6]]},
 {name:'Marquinhos',role:'psg',style:PSG({number:5,seed:66}),keys:[[-6,86,1],[-2,88.4,2.6],[0,91.2,2.6],[1.2,93.4,2.2],[8,95,2]]},
 {name:'Paredes',role:'psg',style:PSG({number:8,skin:SKIN_L,seed:67}),keys:[[-6,80.4,-4],[-2,83.4,-4],[0,86,-3.4],[8,90,-2]]},
 {name:'Neymar',role:'psg',style:PSG({number:10,seed:68,build:{height:1.75}}),keys:[[-6,64,-8],[8,70,-6]]},
 {name:'Mbappé',role:'psg',style:PSG({number:7,skin:SKIN_D,seed:69}),keys:[[-6,62,4],[8,68,4]]},
 {name:'Di María',role:'psg',style:PSG({number:11,skin:SKIN_L,seed:70,build:{height:1.8,bulk:.9}}),keys:[[-6,66,18],[8,74,16]]},
 {name:'Lewandowski',role:'bay',style:BAY({number:9,seed:41,build:{height:1.85}}),keys:[[-6,91,4],[-2,94.4,3],[0,96.6,2.2],[1.22,98.6,2.4],[3,99.4,3.4],[8,98,8]]},
 {name:'Goretzka',role:'bay',style:BAY({number:18,seed:45,build:{height:1.89,bulk:1.08}}),keys:[[-6,77,6],[-2,81,5],[0,84,4],[8,90,6]]},
 {name:'Thiago',role:'bay',style:BAY({number:6,seed:46,skin:SKIN_M}),keys:[[-6,68,8],[8,74,8]]},
 {name:'Davies',role:'bay',style:BAY({number:19,skin:SKIN_D,hair:[K,.95],seed:19}),keys:[[-6,72,-25],[8,80,-24]]},
 {name:'Süle',role:'bay',style:BAY({number:4,seed:47,build:{height:1.95,bulk:1.15}}),keys:[[-6,56,6],[8,60,5]]},
 {name:'Alaba',role:'bay',style:BAY({number:27,seed:48,skin:SKIN_D}),keys:[[-6,56,-9],[8,60,-9]]},
 {name:'referee',role:'ref',style:REF,keys:[[-6,74,2],[0,82,-2],[8,88,0]]},
];
const KIM=0,COM=1,MUL=2,GNA=3,NAV=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6.5,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Gnabry → Müller → the lay-off → Kimmich's set touch → the cross → the header
/** a spot just ahead of player k at τ, toward (tx, tz), nudged `side` metres to his right */
function footSpot(k:number,tau:number,tx:number,tz:number,ahead=.45,side=.14):[number,number]{const[x,z]=posOf(k,tau),dx=tx-x,dz=tz-z,l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;return[x+fx*ahead-fz*side,z+fz*ahead+fx*side];}
const MSPOT=footSpot(MUL,LAY,posOf(GNA,PASS1)[0],posOf(GNA,PASS1)[1],.4,.1);
const KRX=footSpot(KIM,RX,MSPOT[0],MSPOT[1],.4,.1);
/** Coman's head at contact (the header meets it a touch in front of his face) */
const HEADP:V3=(()=>{const[x,z]=posOf(COM,HEAD);return[x-.12,1.98,z+.2];})();
/** the cross: struck toward the far post, right foot */
const K_YAW=(()=>{const[x,z]=posOf(KIM,CROSS);return yawOf(HEADP[0]-x,HEADP[2]-z);})();
const CSPOT:[number,number]=(()=>{const[x,z]=posOf(KIM,CROSS);return[x+Math.cos(K_YAW)*.42+Math.sin(K_YAW)*.16,z-Math.sin(K_YAW)*.42+Math.cos(K_YAW)*.16];})();
const GSPOT=(tau:number)=>footSpot(GNA,tau,MSPOT[0],MSPOT[1]);
/** the header: low across Navas into the right-hand side of the net (inferred line) */
const FLY=.42,IN_NET=HEAD+FLY;
const NET:V3=[105.9,.32,2.5],REST:V3=[106.3,.11,2.9];
const COM_YAW=(()=>{const a=yawOf(CSPOT[0]-HEADP[0],CSPOT[1]-HEADP[2]),b=yawOf(NET[0]-HEADP[0],NET[2]-HEADP[2]);return lerpA(a,b,.55);})();
/** the cross's apex (m) and its slight outswing (m, away from goal) */
const APEX=3.3,SWING=1.1;
function crossAt(u:number):V3{const dx=HEADP[0]-CSPOT[0],dz=HEADP[2]-CSPOT[1],l=Math.hypot(dx,dz),nx=dz/l,nz=-dx/l,sw=Math.sin(Math.PI*u)*SWING*(nx<0?1:-1);
 return[lerp(CSPOT[0],HEADP[0],u)+nx*sw,lerp(.11,HEADP[1],u)+4*APEX*u*(1-u),lerp(CSPOT[1],HEADP[2],u)+nz*sw];}
function ballAt(tau:number):V3{
 if(tau<PASS1){const b=GSPOT(tau);return[b[0],.11,b[1]];}
 if(tau<LAY){const a=GSPOT(PASS1),u=(tau-PASS1)/(LAY-PASS1),e=1-Math.pow(1-u,1.4);return[lerp(a[0],MSPOT[0],e),.11,lerp(a[1],MSPOT[1],e)];}
 if(tau<RX){const u=(tau-LAY)/(RX-LAY),e=1-Math.pow(1-u,1.3);return[lerp(MSPOT[0],KRX[0],e),.11,lerp(MSPOT[1],KRX[1],e)];}
 if(tau<CROSS){const u=clamp((tau-RX)/.8),e=1-Math.pow(1-u,2);return[lerp(KRX[0],CSPOT[0],e),.11,lerp(KRX[1],CSPOT[1],e)];}
 if(tau<HEAD)return crossAt((tau-CROSS)/(HEAD-CROSS));
 if(tau<IN_NET){const u=(tau-HEAD)/FLY;return[lerp(HEADP[0],NET[0],u),Math.max(.11,lerp(HEADP[1],NET[1],u)-.7*Math.sin(Math.PI*u)),lerp(HEADP[2],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e)+.18*Math.sin(Math.PI*Math.min(1,u*1.4))*(1-u),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET-.02?0:Math.exp(-(tau-IN_NET+.02)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** looking up before the cross: chin up, head turned toward the box (his left as he faces up the pitch) */
const LOOKUP:Partial<Pose>={neckP:-16,neckY:26,twist:8};
const ARMS_UP:Partial<Pose>={lShA:140,rShA:140,lShF:22,rShF:22,lElb:24,rElb:24,neckP:-18,lHand:1,rHand:1};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk'||(a.role==='psg'&&sp<2.5))yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),a.role==='gk'?1:.6);
 if(k===KIM)yaw=lerpA(yaw,K_YAW,bump(CROSS-1,CROSS+.6,tau)*1.3);
 if(k===MUL)yaw=lerpA(yaw,yawOf(KRX[0]-x,KRX[1]-z),bump(LAY-.7,LAY+.4,tau)*1.3);
 if(k===GNA)yaw=lerpA(yaw,yawOf(MSPOT[0]-x,MSPOT[1]-z),bump(PASS1-.7,PASS1+.4,tau)*1.3);
 if(k===COM)yaw=lerpA(yaw,COM_YAW,bump(HEAD-.8,HEAD+.5,tau)*1.4);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='psg'?READY:stand();
 if(k===KIM&&tau>RX-.5&&tau<CROSS+.6){// the set touch: short dribbling strides into the cross
  const dr=dribble((tau-RX)*2.2+.97,{foot:'r',speed:.4});p=blendPose(idle,dr,clamp((sp-.2)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='pass'){const t0=mv.at-STRIKE_CONTACT*mv.dur,u=(tau-t0)/mv.dur;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.35}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));continue;}
  if(mv.kind==='head'){const t0=mv.at-.52*mv.dur,u=(tau-t0)/mv.dur;if(u>0&&u<1.4)p=blendPose(p,header(Math.min(1,u)),Math.min(sm(0,.12,u),1-sm(1,1.4,u)));continue;}
  const t0=mv.at-.55*mv.dur,u=(tau-t0)/mv.dur;if(u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.12});}
 if(k===KIM){p=over(p,LOOKUP,bump(RX-.3,CROSS-.15,tau)*1.2);
  if(tau>IN_NET+.3)p=blendPose(p,celebrate((tau-IN_NET)*.8,{kind:'arms'}),sm(IN_NET+.3,IN_NET+.8,tau));}
 if(k===COM&&tau>IN_NET+.25)p=blendPose(p,celebrate((tau-IN_NET)*.8,{kind:'run'}),sm(IN_NET+.25,IN_NET+.7,tau));
 if((k===MUL||k===GNA||a.name==='Lewandowski')&&tau>IN_NET+.3)p=over(p,ARMS_UP,sm(IN_NET+.3,IN_NET+.8,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;kim?:DrawResult;com?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=-1}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // floodlight shadows: small figures get a faint cross of four short shadows in one op (the lamps ring the roof)
 const sh=new Path2D();for(const e of list)if(e.h<420){const sd=ACTORS[e.k].style.seed??1;for(const[ox,oy] of [[.11,.02],[-.11,.02],[.05,-.03],[-.05,.04]] as Pt[])sh.addPath(polyPath(blob(e.g[0]+ox*e.h,e.g[1]+oy*e.h,e.h*.12,e.h*.03,sd,{amp:.05,n:10}),true));}
 if(bground&&bg){const ss=clamp(1-b[1]/6,.35,1);sh.addPath(polyPath(blob(bground[0],bground[1],br*.8*ss,br*.25*ss,2,{amp:.05,n:12}),true));}s.tone(K,sh,.3);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:Math.hypot(b[0],b[2])/.11,key:K,shadow:B,seed:4});};
 let ballDone=!list.length||bq[2]>=list[0].d,kimR:DrawResult|undefined,comR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},{...(big&&(e.k===hero||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:e.k===hero}:{}),hechter:a.role==='psg'});
  if(e.k===KIM)kimR=r;if(e.k===COM)comR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,kim:kimR,com:comR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays
/** "looks up": a dashed yellow sight line from a head to a point */
function sightTo(s:Sheet,c:Cam,from:DrawResult|undefined,P:V3,w:number){if(!from||w<=0)return;const q=pr(c,P);if(!q)return;
 const h=from.joints.head,n=from.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*.5+3;s.knockout(ribbon([h,q],u*1.9,{seed:73,taper:.1}),.6*w);laneArrow(s,Y,h,q,u,{dashed:true,progress:w,seed:73,head:u*3.2});}
/** the cross, traced through the air from Kimmich's boot up to `upTo` (τ) */
function crossTrace(s:Sheet,c:Cam,upTo:number,w:number,wd:number){if(w<=0||upTo<=CROSS)return;const pts:Pt[]=[];const e=Math.min(upTo,HEAD);for(let i=0;i<=16;i++){const q=pr(c,ballAt(lerp(CROSS+.001,e,i/16)));if(q)pts.push(q);}
 if(pts.length<3)return;s.knockout(ribbon(pts,wd*1.8,{seed:91,taper:.3,wobble:.4}),.7*w);s.fill(Y,ribbon(pts,wd,{seed:91,taper:.25,wobble:.4}),.95*w);
 if(upTo>=HEAD-.02){const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,Y,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],wd,{seed:92,head:wd*2.8,cov:.95*w});}}
/** the far-post target zone on the grass */
function farPostZone(s:Sheet,c:Cam,w:number){if(w<=0)return;const r=groundRing(c,HEADP[0],HEADP[2],1.6*w,1.9*w,.16,95);if(r){s.knockout(r,.85*w);s.fill(Y,r,.95*w);}}
/** "all alone": a dashed red circle of empty grass around Coman (nobody within ~3 m) */
function spaceRing(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(COM,tau),pts:Pt[]=[];for(let i=0;i<44;i++){const a=i/44*TAU,q=pr(c,[x+Math.cos(a)*3*w,0,z+Math.sin(a)*3*w]);if(q)pts.push(q);}
 if(pts.length<34)return;const q=toCam(c,[x,0,z]),wd=Math.max(3,c.F*.1/q[2]),gaps:[number,number][]=[];for(let i=0;i<11;i++)gaps.push([i/11+.05,i/11+.085]);
 s.fill(R,ribbon(pts,wd,{close:true,seed:96,taper:0,wobble:.8,gaps}),.9*w);}
/** a yellow ring at a player's feet (the one to find) */
function heroRing(s:Sheet,r:DrawResult|undefined,w:number,seed:number){if(!r||w<=0)return;const l=r.joints.lToe,q=r.joints.rToe,cx=(l[0]+q[0])/2,cy=(l[1]+q[1])/2,rr=r.heightPx*.2,pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([cx+Math.cos(a)*rr*1.3*w,cy+Math.sin(a)*rr*.42*w]);}
 s.knockout(ribbon(pts,Math.max(4,rr*.14),{seed,close:true,taper:0,wobble:.8}),.8*w);s.fill(Y,ribbon(pts,Math.max(3,rr*.09),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** a pass along the grass between two ground spots (Gnabry's ball in, Müller's lay-off) */
function passArrow(s:Sheet,c:Cam,a:[number,number],b:[number,number],w:number,seed:number,ink=Y){if(w<=0)return;const A=pr(c,[a[0],.02,a[1]]),Bq=pr(c,[b[0],.02,b[1]]);if(!A||!Bq)return;const wd=Math.max(4,c.F*.22/Math.max(2,toCam(c,[b[0],0,b[1]])[2]));
 s.knockout(ribbon([A,Bq],wd*1.6,{seed,taper:.1}),.6*w);laneArrow(s,ink,A,Bq,wd,{progress:w,seed,head:wd*2.6});}
/** the header's short line into the net */
function headLine(s:Sheet,c:Cam,tau:number,wd:number){if(tau<=HEAD||tau>IN_NET+.6)return;const pts:Pt[]=[];for(let i=0;i<=8;i++){const q=pr(c,ballAt(lerp(HEAD,Math.min(tau,IN_NET),i/8)));if(q)pts.push(q);}
 if(pts.length>2)s.fill(Y,ribbon(pts,wd,{seed:88,taper:.9,wobble:.4}),.9*(1-sm(IN_NET+.2,IN_NET+.6,tau)));}
function contactSpark(s:Sheet,c:Cam,P:V3,t:number,t0:number,seed:number){const age=t-t0;if(age<=-.15||age>=.45)return;const q=pr(c,P);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.55/Math.max(1,toCam(c,P)[2]),{n:8,seed,g:easeOutBack(clamp((age+.15)/.15))*(1-clamp((age-.25)/.2)),width:8});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUEW(0,'Coman heads');return key(t,mono([[0,-5.4],[CUEW(0,'Gnabry'),PASS1-.35],[CUEW(0,'lays it back'),LAY],[CUEW(0,'Joshua Kimmich'),RX],[CUEW(0,'He looks up'),-.55],[CUEW(0,'crosses'),CROSS+.05],[CUEW(0,'back post'),.8],[G,HEAD],[G+.6,IN_NET+.2],[SECS(0)+1,IN_NET+.2+(SECS(0)+.4-G)*.9]]),linear);};
const CAM1:V3=[52.5,21,64];
function cam1(t:number):Cam{
 const G=CUEW(0,'Coman heads'),S=SECS(0),tau=tau1(t),gn=CUEW(0,'Gnabry');
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.4),b2=bs(tau-.8),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // opens on the empty red seats of the far stand, then drops to the ball and pans with it; after the goal it settles on the celebration
 const open:V3=[70,13,-46],m=smooth(COM,tau),cel:V3=[m[0]-1,1.1,m[1]];
 const toBall=sm(.2,gn+.1,t,easeInOutSine),toG=sm(G+.6,G+1.8,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0]+1.5,toBall),lerp(open[1],1.6,toBall),lerp(open[2],lerp(bt[2],0,.3),toBall)],T=lerp3(tb,cel,toG);
 const F=key(t,mono([[0,1500],[gn+.1,5000],[CUEW(0,'Joshua'),5400],[CUEW(0,'He looks'),5200],[CUEW(0,'crosses')+.3,4300],[G,4600],[G+1.4,5800],[S,6000]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Coman heads'),rt=CUEW(0,'on the right'),bp=CUEW(0,'back post');
  stadium(s,c,v,{glow:sm(G+.25,G+.5,t)*(1-sm(G+1.1,G+1.6,t))});
  ground(s,c,{bulge:bulgeAt(tau),lane:sm(rt-.1,rt+.5,t,easeOut)*(1-sm(CUEW(0,'He looks'),CUEW(0,'He looks')+.5,t))});
  farPostZone(s,c,sm(bp-.15,bp+.3,t,easeOutBack)*(1-sm(G+.2,G+.6,t)));
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,after:()=>{
   contactSpark(s,c,HEADP,t,G,86);}});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(COM,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low behind Kimmich on the right touchline: the look, the space, the flight
const tau2=(t:number)=>key(t,mono([[0,-2.6],[CUEW(1,'Kimmich spots'),-1.05],[CUEW(1,'Kingsley'),-.8],[CUEW(1,'all alone'),-.55],[CUEW(1,'far post'),-.3],[CUEW(1,'drops the ball'),CROSS+.02],[CUEW(1,'onto his head'),HEAD-.12],[SECS(1),HEAD+.12]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),k=smooth(KIM,Math.min(tau,.3)),fly=sm(CUEW(1,'drops')-.2,CUEW(1,'onto')+.2,t,easeInOutSine),open=1-sm(0,1.3,t,easeInOutSine);
 // low on the right touchline, behind Kimmich's shoulder, looking down his passing line to the far post; during the flight the aim follows
 // the ball across the box to Coman
 const tgt:V3=[HEADP[0],1,HEADP[2]],C:V3=[k[0]-6.2+2*open,1.6+.5*fly,Math.min(33,k[1]+6.6)-1*open],T:V3=lerp3([lerp(k[0],tgt[0],.3),1,lerp(k[1],tgt[2],.3)],[lerp(k[0],tgt[0],.84),1.3,lerp(k[1],tgt[2],.84)],fly);
 return look(C,T,lerp(2500,3900,fly)-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ks=CUEW(1,'Kimmich spots'),kc=CUEW(1,'Kingsley'),aa=CUEW(1,'all alone'),fp=CUEW(1,'far post'),db=CUEW(1,'drops'),oh=CUEW(1,'onto'),E=SECS(1);
  const fade=1-sm(E-.8,E-.45,t);
  stadium(s,c,v);
  ground(s,c,{box:sm(fp-.15,fp+.25,t,easeOutBack)*(1-sm(db,db+.4,t))});
  spaceRing(s,c,tau,sm(aa-.1,aa+.35,t,easeOutBack)*(1-sm(db+.3,db+.7,t)));
  farPostZone(s,c,sm(fp-.1,fp+.3,t,easeOutBack)*fade);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:KIM,after:({kim,com,br})=>{
   // the lay-off arriving (Müller → Kimmich) as the replay opens
   passArrow(s,c,MSPOT,KRX,sm(.1,.6,t)*(1-sm(ks-.3,ks,t)),71);
   sightTo(s,c,kim,[HEADP[0],1.7,HEADP[2]],sm(ks-.1,ks+.4,t,easeOut)*(1-sm(db-.1,db+.2,t)));
   heroRing(s,com,sm(kc-.1,kc+.3,t,easeOutBack)*(1-sm(oh+.1,oh+.5,t)),84);
   crossTrace(s,c,tau,sm(db-.1,db+.15,t)*fade,Math.max(3.5,br*.5));
   contactSpark(s,c,[CSPOT[0],.12,CSPOT[1]],t,db,87);
   contactSpark(s,c,HEADP,t,oh+.1,86);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the header low across Navas, the net, the celebration
const tau3=(t:number)=>{const og=CUEW(2,'only goal');return key(t,mono([[0,HEAD-.7],[CUEW(2,'Coman heads'),HEAD-.5],[CUEW(2,'low,'),HEAD+.02],[CUEW(2,'across the keeper'),HEAD+.3],[og,IN_NET+.5],[SECS(2),IN_NET+.5+(SECS(2)-og)*.85]]),linear);};
const swing3=(t:number)=>{const og=CUEW(2,'only goal');return sm(og-.2,og+1.1,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t);
 // raised a little behind the goal, on the far-post side: Coman big on the right of frame meeting the ball from the left, Navas between,
 // the goal mouth in the foreground
 const C0:V3=[113.6,3.8,-8.4],T0:V3=[lerp(HEADP[0],104,.3),1.3,lerp(HEADP[2],1,.35)];
 // then round to the pitch side of the celebration (the empty far stand behind)
 const cc=smooth(COM,tau),C1:V3=[cc[0]-7,2.4,cc[1]-6.5],T1:V3=[cc[0]+.5,1.2,cc[1]+.8],Cu=lerp3(C0,C1,u);Cu[1]+=4.5*Math.sin(Math.PI*u);
 return look(Cu,lerp3(T0,T1,u),lerp(3300,2900,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ch=CUEW(2,'Coman heads'),lo=CUEW(2,'low,'),ak=CUEW(2,'across'),og=CUEW(2,'only goal'),bw=CUEW(2,'Bayern were'),eu=CUEW(2,'Europe'),u=swing3(t);
  stadium(s,c,v,{glow:sm(bw-.1,bw+.3,t)*(1-sm(SECS(2)-.9,SECS(2)-.5,t))+.6*sm(eu-.2,eu+.3,t)*(1-sm(SECS(2)-.9,SECS(2)-.5,t))});
  ground(s,c,{goalLater:u<.5,bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:COM,after:({com,br})=>{
   crossTrace(s,c,tau,(1-sm(ch+.1,ch+.5,t))*(1-u),Math.max(3,br*.45));
   heroRing(s,com,sm(ch-.3,ch+.1,t,easeOutBack)*(1-sm(lo,lo+.4,t)),84);
   contactSpark(s,c,HEADP,t,lo-.05,86);
   headLine(s,c,tau,Math.max(3,br*.5));
   // "across the keeper": a red miss spark where Navas's glove arrives too late
   const age=t-ak;if(age>-.2&&age<.5){const P:V3=[lerp(HEADP[0],NET[0],.72),.35,lerp(HEADP[2],NET[2],.72)+.5],q=pr(c,P);if(q)sparkBurst(s,R,q[0],q[1],c.F*.5/Math.max(1,toCam(c,P)[2]),{n:8,seed:89,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.3)/.2)),width:9});}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(COM,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a separate demonstration on a daytime training pitch (not the final)
/** two young players in training kit (inferred, generic): YOU receive a ball rolled in from the side, look up early, and pass along the
 * grass to the front foot of a teammate running forward; he takes it in his stride. μ = demo seconds. */
const D_IN=0,D_RX=1.5,D_PASS=2.3,D_ARR=3.4;
const KID=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:K,socks:[Y,.95],boots:K,trim:K,numberInk:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,build:{height:1.46,bulk:.92,head:1.08},seed:81,...o});
const YOU_ST=KID({number:6,seed:82}),MATE_ST=KID({number:9,skin:SKIN_M,hair:[K,.95],hairStyle:'curly',seed:83});
const DKEYS=[[0,3.6,-4.6],[.8,3.8,-4.7],[1.5,5.2,-4.8],[2.3,7.4,-4.9],[3.4,10.6,-5],[4.4,13.6,-5],[6.5,19.5,-5]];
const DTAB=(()=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=350;i++){const[x,z]=herm(DKEYS,i*.02);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};})();
const dS=(arr:number[],mu:number)=>{const u=clamp(mu/.02,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const matePos=(mu:number):[number,number]=>[dS(DTAB.X,mu),dS(DTAB.Z,mu)];
const YOU_P:[number,number]=[0,0],YOU_YAW=yawOf(1,-.3);
const D_START:[number,number]=[-.6,8.5],D_RXS:[number,number]=[.42,.3];
/** the target: a stride ahead of his leading boot where he will be when it arrives */
const D_TGT:[number,number]=(()=>{const[x,z]=matePos(D_ARR);return[x+.55,z+.12];})();
const D_PASS_YAW=yawOf(D_TGT[0]-YOU_P[0],D_TGT[1]-YOU_P[1]);
function dBall(mu:number):V3{
 if(mu<D_RX){const u=clamp((mu-D_IN)/(D_RX-D_IN)),e=1-Math.pow(1-u,1.3);return[lerp(D_START[0],D_RXS[0],e),.11,lerp(D_START[1],D_RXS[1],e)];}
 const PS:[number,number]=[YOU_P[0]+Math.cos(D_PASS_YAW)*.42,YOU_P[1]-Math.sin(D_PASS_YAW)*.42+.12];
 if(mu<D_PASS){const u=clamp((mu-D_RX)/.5),e=1-(1-u)*(1-u);return[lerp(D_RXS[0],PS[0],e),.11,lerp(D_RXS[1],PS[1],e)];}
 if(mu<D_ARR){const u=(mu-D_PASS)/(D_ARR-D_PASS),e=1-Math.pow(1-u,1.5);return[lerp(PS[0],D_TGT[0],e),.11,lerp(PS[1],D_TGT[1],e)];}
 const[x,z]=matePos(mu);return[x+.5+.15*Math.sin((mu-D_ARR)*5),.11,z+.1];
}
function dPose(who:'you'|'mate',mu:number):{p:Pose;yaw:number}{
 if(who==='you'){let p=stand(),yaw=YOU_YAW;const b=dBall(mu);
  if(mu<D_RX)yaw=lerpA(yawOf(b[0],b[2]),YOU_YAW,.55);
  // look up early: head turned up the pitch to the runner while the ball is still rolling in
  p=over(p,{neckP:-12,neckY:-30,twist:-6},bump(.2,D_RX+.25,mu)*1.25);
  const rt=(mu-(D_RX-.3))/.6;if(rt>0&&rt<1.2)p=blendPose(p,dribble(.6+rt*.4,{foot:'r',speed:.3}),Math.min(sm(0,.2,rt),1-sm(.9,1.2,rt)));
  yaw=lerpA(yaw,D_PASS_YAW,sm(D_RX,D_PASS-.2,mu));
  const u=(mu-(D_PASS-STRIKE_CONTACT*.8))/.8;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.3}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  return{p,yaw};}
 const a=matePos(mu-.08),b=matePos(mu+.08),sp=Math.hypot(b[0]-a[0],b[1]-a[1])/.16,yaw=sp>.4?yawOf(b[0]-a[0],b[1]-a[1]):yawOf(-1,1);
 let p=blendPose(stand(),runCycle(dS(DTAB.D,mu)/2.6,{speed:clamp((sp-1.5)/4)}),clamp((sp-.3)/.8));
 if(mu>D_ARR-.4)p=blendPose(p,dribble(dS(DTAB.D,mu)/1.1,{foot:'r',speed:.7}),sm(D_ARR-.4,D_ARR,mu)*.8);
 p=over(p,{neckP:6,neckY:18},bump(D_PASS-.3,D_ARR,mu));
 return{p,yaw};
}
/** the training pitch: a pale daytime sky, a tree line, a hedge, grass with mowing stripes, a white line and cones */
function training(s:Sheet,c:Cam,v:View){
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.16);s.tone(Y,rectPath(-1e4,-1e4,2e4,2e4),.1);
 const g=polyP(c,[[-60,0,-80],[90,0,-80],[90,0,30],[-60,0,30]]);if(g.length>2){const gp=polyPath(g,true);s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.72);}
 const st=new Path2D();for(let k=-12;k<18;k+=2)addPoly(st,polyP(c,[[k*4,0,-80],[(k+1)*4,0,-80],[(k+1)*4,0,30],[k*4,0,30]]));s.tone(K,st,.08);
 // the tree line and hedge along the far edge (dark greens: yellow × blue × navy)
 const tr=new Path2D(),hd=new Path2D();for(let i=0;i<26;i++){const x=-50+i*5.4+hash(i,3)*3,q=pr(c,[x,0,-78]);if(!q||!inView(v,q,400))continue;const sc=c.F/Math.max(1,toCam(c,[x,0,-78])[2]),hgt=(8+hash(i,4)*6)*sc;tr.addPath(polyPath(blob(q[0],q[1]-hgt*.62,hgt*.42,hgt*.55,i+9,{amp:.1,n:18}),true));}
 addPoly(hd,polyP(c,[[-60,0,-60],[90,0,-60],[90,1.6,-60],[-60,1.6,-60]]));
 s.knockout(tr);s.fill(Y,tr,.75);s.tone(B,tr,.9);s.tone(K,tr,.45);s.fill(Y,hd,.6);s.tone(K,hd,.55);
 const ln=new Path2D();seg3(c,[-40,0,6],[60,0,6],.12,ln);s.knockout(ln);
 // cones: small red markers either side of the lane
 const cn=new Path2D();for(const[x,z] of [[-3,-3],[4,-10],[12,-10],[20,-10],[28,-2],[9,1]] as [number,number][]){const a=pr(c,[x-.18,0,z]),b=pr(c,[x+.18,0,z]),tp=pr(c,[x,.32,z]);if(a&&b&&tp)cn.addPath(polyPath([a,tp,b],true));}
 s.knockout(cn);s.fill(R,cn,.95);
}
const mu4=(t:number)=>key(t,mono([[0,-.2],[CUEW(3,'look up early'),.5],[CUEW(3,'aim your pass'),D_PASS-.35],[CUEW(3,'front foot'),D_PASS+.4],[CUEW(3,'keep running'),D_ARR+.1],[SECS(3),D_ARR+1.6]]),linear);
function cam4(t:number):Cam{
 const mu=mu4(t),pan=sm(D_PASS-.2,D_ARR+.6,mu,easeInOutSine);
 // low on the side of the lane, a three-quarter view: YOU on the left, the runner on the right, the pass crossing the frame
 return look([lerp(1.2,5.5,pan),1.8,lerp(7.4,6.8,pan)],[lerp(1.9,8.5,pan),.8,lerp(-2.2,-3.4,pan)],lerp(1750,1800,pan));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),mu=mu4(t),mp=mu4(twos(t)),mprev=mu4(twos(t)-1/12),yt=CUEW(3,'Your turn'),lu=CUEW(3,'look up'),ap=CUEW(3,'aim'),ff=CUEW(3,'front foot'),kr=CUEW(3,'keep running'),E=SECS(3);
  training(s,c,v);
  const b=dBall(mu),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(5,c.F*.11/bq[2]):0,bgd=pr(c,[b[0],0,b[2]]);
  // the target ring ahead of his leading boot, and the aim arrow from the ball to it
  const tw=sm(ap-.2,ap+.3,t,easeOutBack)*(1-sm(E-.5,E-.15,t));
  const tr=groundRing(c,D_TGT[0],D_TGT[1],.55*Math.max(.01,tw)+.25*bump(ff-.1,ff+.6,t),.55*Math.max(.01,tw)+.25*bump(ff-.1,ff+.6,t),.1,97);if(tr&&tw>0){s.knockout(tr,.85*tw);s.fill(Y,tr,.95*tw);}
  const aw=sm(ap-.1,ap+.5,t,easeOut)*(1-sm(kr-.2,kr+.3,t));if(aw>0){const A=pr(c,[.6,.02,.2]),Bq=pr(c,[D_TGT[0],.02,D_TGT[1]]);if(A&&Bq){const wd=Math.max(4,c.F*.14/toCam(c,[D_TGT[0],0,D_TGT[1]])[2]);s.knockout(ribbon([A,Bq],wd*1.6,{seed:98,taper:.1}),.6*aw);laneArrow(s,Y,A,Bq,wd,{dashed:true,progress:aw,seed:98,head:wd*2.6});}}
  const sh=new Path2D();if(bgd&&bg)sh.addPath(polyPath(blob(bgd[0],bgd[1],br*.8,br*.25,2,{amp:.05,n:12}),true));
  const who:{w:'you'|'mate';x:number;z:number;st:AthleteStyle}[]=[{w:'you',x:YOU_P[0],z:YOU_P[1],st:YOU_ST},{w:'mate',x:matePos(mu)[0],z:matePos(mu)[1],st:MATE_ST}];
  for(const e of who){const g=pr(c,[e.x,0,e.z]);if(g){const h=c.F*1.5/Math.max(1,toCam(c,[e.x,0,e.z])[2]);sh.addPath(polyPath(blob(g[0]+h*.1,g[1]+h*.02,h*.26,h*.05,5,{amp:.05,n:12}),true));}}
  s.tone(K,sh,.3);
  who.sort((a,b)=>toCam(c,[b.x,0,b.z])[2]-toCam(c,[a.x,0,a.z])[2]);
  const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:Math.hypot(b[0],b[2])/.11,key:K,shadow:B,seed:4});};let ballDone=false;let youR:DrawResult|undefined;
  for(const e of who){const d=toCam(c,[e.x,.9,e.z])[2];if(!ballDone&&bq[2]>=d){drawBall();ballDone=true;}
   const P=dPose(e.w,mp),r=drawPlayer(s,P.p,c,{...e.st,shadow:false},{x:e.x,z:e.z,yaw:P.yaw},{prev:dPose(e.w,mprev).p,smear:e.w==='mate'});if(e.w==='you')youR=r;}
  if(!ballDone)drawBall();
  // "Your turn": a yellow ring round YOU; "look up early": the sight line to the runner while the ball still rolls in
  heroRing(s,youR,sm(yt-.1,yt+.35,t,easeOutBack)*(1-sm(lu-.2,lu+.2,t)),85);
  const[mx,mz]=matePos(mu);sightTo(s,c,youR,[mx,1.35,mz],sm(lu-.1,lu+.4,t,easeOut)*(1-sm(ap,ap+.35,t)));
  // "keep running": speed lines off the runner and a short arrow on up the pitch
  const kw=sm(kr-.1,kr+.35,t)*(1-sm(E-.4,E-.1,t));if(kw>0){const q=pr(c,[mx,1,mz]);if(q){const z=c.F/Math.max(1,toCam(c,[mx,1,mz])[2]);for(const k2 of[0,1,2]){const y0=q[1]-z*(.55-k2*.35);s.fill(K,ribbon([[q[0]-z*.35,y0],[q[0]-z*(1.2+k2*.25),y0]],z*.04,{seed:9+k2,taper:.9,wobble:.5}),.6*kw);}}
   const A=pr(c,[mx+1,.02,mz]),Bq=pr(c,[mx+3.6,.02,mz]);if(A&&Bq){const wd=Math.max(4,c.F*.14/toCam(c,[mx+3,0,mz])[2]);laneArrow(s,Y,A,Bq,wd,{progress:kw,seed:99,head:wd*2.6});}}
 },
 still:3.2,
};

const film:RisoStory={
 id:'kimmich-signature',format:'11v11',title:'The Pinpoint Pass from Deep',theme:'Look up early and aim your pass at your teammate’s front foot',
 ageNote:'Champions League final, Paris Saint-Germain v Bayern Munich, Estádio da Luz, Lisbon, 23 August 2020; the lesson is a training-pitch demonstration. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of summer turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits (yellow × blue) and a few red flecks thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%4?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.7*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
