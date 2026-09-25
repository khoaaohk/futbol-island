/** Alphonso Davies v Barcelona, Champions League quarter-final, Estádio da Luz, Lisbon, 14 August 2020 (Barcelona 2–8 Bayern Munich): the
 * run down the left past Nélson Semedo and the cut-back for Joshua Kimmich's goal (63', 5–2). An iconic-play riso film (RisoStory, chapters
 * mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched Sept 2026, cached in the film agents' scratchpad src-cache):
 *  - Wikipedia, "FC Barcelona 2–8 FC Bayern Munich" (raw wikitext: summary, goals, line-ups, kit infobox, venue, attendance)
 *    https://en.wikipedia.org/wiki/FC_Barcelona_2%E2%80%938_FC_Bayern_Munich
 *  - ESPN, "'Unbelievable' Davies killed Barca belief – Kimmich" (14 August 2020)
 *    https://www.espn.in/football/uefa-champions-league/story/4159878/unbelievable-davies-assist-leaves-bayerns-kimmich-in-awe
 *  - BBC Sport, "Bayern Munich 8–2 Barcelona: Brilliant Bayern smash Barca to reach Champions League semis" (14 August 2020)
 *    https://www.bbc.co.uk/sport/football/53745581
 *  - Wikipedia, "Alphonso Davies" (raw wikitext: the assist, left-back that night)  https://en.wikipedia.org/wiki/Alphonso_Davies
 *  - Wikimedia Commons kit patterns Kit_body_bayern2021A.png and Kit_body_fcbarcelona1920H.png (the infobox kit drawings)
 * CONFIRMED by those accounts: Friday 14 August 2020, Estádio da Luz, Lisbon, a one-match quarter-final at a neutral venue, played behind
 * closed doors (attendance 0) because of the pandemic; Bayern won 8–2; Kimmich's goal came in the 63rd minute and made it 5–2, a
 * side-footed finish from close range from Davies's delivery; Davies, playing LEFT-BACK (number 19), picked up the ball close to the
 * halfway line and "stormed down the left wing, first beating Lionel Messi and Arturo Vidal", then took on Nélson Semedo (Barcelona's
 * right-back, number 2) "at the sideline", "danced and then blew past him to the touchline" and crossed / laid it off for Kimmich (number
 * 32, playing right-back) to "easily slot home from close range"; Wikipedia: he had "beaten his marker, Nélson Semedo, at the edge of the
 * box"; Kimmich: "He gets 99 percent credit for this goal. I only had to get the ball over the line." Ter Stegen kept goal, Piqué and
 * Lenglet were the centre-backs, Alba the left-back; Griezmann had replaced Sergi Roberto at half-time; Perišić, Gnabry, Müller, Goretzka,
 * Thiago, Lewandowski, Alaba and Boateng were all still on for Bayern. KIT (Wikipedia infobox + the Commons kit drawings): Barcelona in
 * their 2019–20 HOME shirts (blue and garnet squares in stripes), navy shorts, navy socks; Bayern in their 2020–21 AWAY kit, light grey /
 * white shirts with white shorts and white socks.
 * INFERRED (illustrative): every position and timing between those beats; the direction of play on screen (Bayern attacking right to left,
 * so their left wing is the near touchline under the main-stand camera); who played the ball to him (drawn as Alaba) and from where; how
 * exactly he beat Messi (outpaced) and Vidal (a knock past a lunge); the dance at Semedo (drawn as a step inside, a step outside, then the
 * burst down the line — the sources say only "danced"), and the last quick turn inside in front of the chasing Semedo at the edge of the
 * box; that the delivery was a LOW, LEFT-footed cut-back from near the byline (the sources say "cross", "layoff", "delivery"); Kimmich's
 * right-footed side-foot finish, its spot (about 9 m out) and line; ter Stegen at his near post and his late dive; the other players'
 * positions; the kit details the drawings do not settle (athlete.ts prints stripes, not squares, so the Barcelona shirt reads as blue and
 * red stripes; numbers, trims, boots, ter Stegen's yellow kit, the referee's dark kit); the Estádio da Luz shape (a rounded two-tier bowl
 * of empty red seats under a dark roof ring), the dusk sky (a 21:00 CEST kick-off, so the 63rd minute came just after sunset), the ball
 * design, the camera placements, the celebration.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, opening on the empty red seats and then panning with the ball from the halfway line to the goal; 2 = slow-motion replay from a low
 * touchline camera: the dance at Semedo (orange route arrows on the grass: in · out), the burst down the line (speed lines), the quick turn
 * into the box (the box lights up); 3 = replay from behind the goal: he looks up (a sight line to Kimmich), the cut-back rolls across
 * (a traced line), the side-foot finish, then a swing round to the celebration; 4 = the lesson from low behind Davies (the wing lane on
 * the grass, speed lines, the three change-of-direction arrows, the look-up sight line and the cut-back zone). All figures are the shared
 * riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). World: right-handed metres exactly like athlete.ts
 * (X toward Barcelona's goal at 105, Y up, Z across; the main-stand camera sits at −Z, which is Bayern's LEFT wing), so his left foot is his
 * left foot without a mirrored projector. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming)
 * re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈ .2 s a word + .021 s a letter + punctuation pauses, calibrated on the voiced Maradona film) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The run, live',text:'Lisbon, 2020, an empty stadium. Alphonso Davies takes off down the left wing. Past Messi, past Vidal! Now Semedo... he\'s past him! Cut back... Kimmich scores!',tail:2.1,
  cues:['Lisbon','empty stadium','Alphonso Davies','takes off','left wing','Past Messi','past Vidal','Now Semedo','past him','Cut back','Kimmich scores']},
 {label:'Watch it again',text:"Watch it again, slowly. Semedo waits. Davies dances: inside, outside, then full speed down the line! One quick turn, he's in the box.",tail:1.3,
  cues:['Watch it again','Semedo waits','Davies dances','inside,','outside,','full speed','down the line','One quick turn','in the box']},
 {label:'The cut-back',text:'He looks up and cuts it back. Joshua Kimmich side-foots it in! Bayern went on to win eight to two.',tail:2.2,
  cues:['He looks up','cuts it back','Joshua Kimmich','side-foots','Bayern went on','eight to two']},
 {label:'Your turn',text:'Your turn: on the wing, use your pace and quick changes of direction, then look up and cut it back!',tail:1.6,
  cues:['Your turn','on the wing','use your pace','quick changes','look up','cut it back']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py davies-semedo-2020, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/davies-semedo-2020/timing.json';
 * and pass `timingJson as NarrationTiming` here: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times itself. */
import timingJson from '../../../public/plays/narration/davies-semedo-2020/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .2 s + .021 s a letter per word, pauses after , : . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.34;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('davies: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('davies: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Bayern attack +X, Barcelona's goal line at 105), Y up, Z across
 * (0 = the middle, −34 = the near touchline under the main-stand camera = Bayern's left wing). A figure facing +X has its right side at +Z. */
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
  // seat rows: a few paper lines across each tier (the empty seat backs catch the light)
  for(const[f,n] of [[LOW,5],[UP,5]] as [(u:number)=>[number,number],number][])for(let r=1;r<=n;r++){const[d,y]=f(r/(n+1));o.rows.push([rim(a,d,y+.1),rim(b,d,y+.1)]);}
  if(i%2===0){const[d0,y0]=LOW(0),[d1,y1]=LOW(1),[e0,z0]=UP(0),[e1,z1]=UP(1);o.aisles.push([rim(a,d0,y0),rim(a,d1,y1)],[rim(a,e0,z0),rim(a,e1,z1)]);}
  o.lamps.push(rim((i+.5)/NS*TAU,27,35.2));}
 return o;})();
/** everything behind the pitch: the dusk sky, the bowl of empty seats, the roof ring with its lamps (no crowd: the match was behind closed doors) */
function stadium(s:Sheet,c:Cam,v:View,o:{glow?:number}={}){
 const{glow=0}=o;
 // just after sunset over Lisbon in August: a deep blue dusk, a little warmer low down
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.62);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.34);
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),rows=new Path2D(),aisles=new Path2D(),lamp=new Path2D(),halo=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)addPoly(p,r);};add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.box[i],box);add(BOWL.roof[i],roof);}
 for(const[a,b] of BOWL.rows)if(Math.min(toCam(c,a)[2],toCam(c,b)[2])>12)seg3(c,a,b,.16,rows,.8);
 for(const[a,b] of BOWL.aisles)if(Math.min(toCam(c,a)[2],toCam(c,b)[2])>12)seg3(c,a,b,.9,aisles,.8);
 BOWL.lamps.forEach((P,i)=>{const q=toCam(c,P);if(q[2]<14)return;const g=scr(c,q);if(!inView(v,g,40))return;const r=clamp(c.F*1.1/q[2],2,40);lamp.addPath(polyPath(blob(g[0],g[1],r*1.5,r*.5,i+3,{amp:.05,n:10}),true));const r2=clamp(c.F*5/q[2],6,140);halo.addPath(polyPath(blob(g[0],g[1]+r2*.4,r2*1.5,r2,i*31,{amp:.06,n:14}),true));});
 s.tone(Y,halo,.14);
 // empty red seats (Benfica's red), the upper tier a step darker under the roof; paper rows and aisles
 s.knockout(low);s.fill(R,low,.82);s.tone(K,low,.18);
 s.knockout(up);s.fill(R,up,.78);s.tone(K,up,.34);
 s.knockout(rows,.42);s.knockout(aisles,.55);
 s.knockout(box);s.fill(K,box,.85);
 s.knockout(roof);s.fill(K,roof,.9);
 s.knockout(lamp);s.fill(Y,lamp,.95);
 if(glow>0){const p=new Path2D();BOWL.lamps.forEach((P,i)=>{const q=toCam(c,P);if(q[2]<14||hash(i,5)<.5)return;const g=scr(c,q);if(!inView(v,g))return;const z=clamp(c.F*2.2/q[2],6,60)*glow;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.3],[g[0]+z,g[1]],[g[0],g[1]+z*.3]],true));});s.fill(Y,p,.9);}
}
/** the surround, grass (yellow × blue) with mowing stripes, boards, paper lines, corner flags, both goals (Barcelona's goal drawn later when it
 * is in front of the players, i.e. from the camera behind it). `wing` paints the left-wing lane, `box` lights the penalty area, `half` the halfway line. */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean;wing?:number;box?:number;half?:number}={}){
 const sur=polyP(c,[[-8,0,-40],[113,0,-40],[113,0,40],[-8,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.45);s.tone(K,p,.3);}
 const g=polyP(c,[[-5,0,-37],[110,0,-37],[110,0,37],[-5,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.84);s.tone(K,gp,.08);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]));s.tone(K,st,.1);
 if((o.wing??0)>0){const w=o.wing!,q=polyP(c,[[52.5,0,-34],[52.5+52.5*w,0,-34],[52.5+52.5*w,0,-21],[52.5,0,-21]]);if(q.length>2){const p=polyPath(q,true);s.knockout(p,.18*w);s.tone(Y,p,.5*w);}const e=new Path2D();seg3(c,[52.5,.01,-21],[52.5+52.5*w,.01,-21],.35,e,2);s.fill(Y,e,.9*w);}
 // boards: the far touchline and behind both goals, navy with paper panels (the near boards sit under the camera)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,37],[109,0,37],[109,.9,37],[-4,.9,37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,36.95],[x+3.4,.25,36.95],[x+3.4,.65,36.95],[x,.65,36.95]]));}
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
 // teaching lines: the halfway line (where he picks it up) and Barcelona's penalty area light up yellow
 if((o.half??0)>0){const h=new Path2D();for(let k=0;k<4;k++)seg3(c,[52.5,.01,-34+k*17],[52.5,.01,-17+k*17],.45,h,2);s.fill(Y,h,.95*o.half!);}
 if((o.box??0)>0){const h=new Path2D(),P:V3[]=[[105,.01,-20.16],[88.5,.01,-20.16],[88.5,.01,20.16],[105,.01,20.16]];for(let k=0;k<3;k++)seg3(c,P[k],P[k+1],.4,h,2);s.knockout(h,.8*o.box!);s.fill(Y,h,.95*o.box!);}
 // corner flags at Barcelona's end
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
/** Bayern: the 2020–21 away kit — light grey / white shirt (a faint navy screen on paper), white shorts, white socks (confirmed); trim and
 * number ink inferred */
const BAY=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.13],shorts:'paper',socks:'paper',boots:K,trim:K,numberInk:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,seed:3,...o});
const DAVIES_ST=BAY({number:19,skin:SKIN_D,hair:[K,.95],hairStyle:'short',build:{height:1.83,bulk:.98,thighs:1.14},seed:19});
const KIMMICH_ST=BAY({number:32,skin:SKIN_L,hair:[K,.7],build:{height:1.77,bulk:.96},seed:32});
/** Barcelona: the 2019–20 home shirt (blue and garnet — printed as blue and red stripes), navy shorts and socks (confirmed); numbers inferred */
const BAR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:K,trim:Y,numberInk:Y,skin:SKIN_M,hair:K,hairStyle:'short',line:K,seed:5,...o});
const SEMEDO_ST=BAR({number:2,skin:SKIN_D,hair:[K,.95],build:{height:1.77,bulk:.97},seed:2});
/** Marc-André ter Stegen: keeper kit inferred (yellow), gloves inferred */
const TER_STEGEN:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,skin:SKIN_L,hair:[Y,.5],hairStyle:'short',line:K,gloves:[K,.7],sleeves:'long',trim:K,build:{height:1.87},seed:51};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'bald',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Davies's first touch)
type Role='davies'|'bar'|'gk'|'bay'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a pass or shot (contact at `at`) */
type Move={kind:'lunge'|'dive'|'pass';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** the key moments (τ): Alaba's pass, the cut-back, Kimmich's side-foot */
const PASS=-1.8,CUTB=9.3,KSHOT=10.05;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The players the accounts name get the beats the accounts give them (Messi,
 * Vidal, Semedo, Kimmich); where exactly each stood is inferred. */
const ACTORS:Actor[]=[
 {name:'Davies',role:'davies',style:DAVIES_ST,key:true,keys:[[-2.6,44.4,-26.4],[-1.4,47.2,-27.4],[-.5,49.4,-28.1],[0,50.6,-28.5],[.5,53,-29],[1,56,-29.6],[1.5,59.3,-30],[2,62.8,-30.2],[2.5,66.4,-30.1],[3,70,-29.9],[3.5,73.4,-29.6],[4,76.3,-29.2],[4.5,78.7,-28.8],[5,80.3,-28.4],[5.35,81,-27.3],[5.6,81.4,-26.8],[5.9,82.1,-28.3],[6.2,83.5,-29.6],[6.6,86.5,-30.1],[7,89.8,-30],[7.4,93,-29.4],[7.8,95.8,-28.6],[8.2,97.6,-26.9],[8.5,98.7,-24.5],[8.8,100.1,-21.6],[9.05,101.3,-19.3],[9.3,102.2,-17.5],[9.6,102.7,-16.5],[10.2,102.6,-15.2],[11,101.4,-12.6],[12.2,99.9,-10],[13.5,99.2,-9.1],[16,99,-8.8]]},
 {name:'Semedo',role:'bar',style:SEMEDO_ST,key:true,engage:[3.2,8.6],moves:[{kind:'lunge',at:5.55,dur:.75,side:'l'},{kind:'lunge',at:8.55,dur:.8,side:'l'}],keys:[[-2.6,86,-22],[1,85.5,-24],[3,85,-26],[4,84.6,-27.2],[4.6,84,-27.6],[5,83.4,-27.8],[5.45,83.2,-26.9],[5.8,83.3,-26.3],[6.2,83.4,-26.6],[6.6,84.8,-27.4],[7,88.4,-28.1],[7.4,91.6,-27.7],[7.8,94.3,-27.2],[8.2,96.3,-26.6],[8.55,97.4,-25.6],[8.9,98.2,-24.8],[9.5,99.3,-23.2],[11,100,-20.5],[16,100.4,-19]]},
 {name:'Messi',role:'bar',style:BAR({number:10,skin:SKIN_M,build:{height:1.7,bulk:1},seed:10}),key:true,engage:[-1.2,1],moves:[{kind:'lunge',at:.45,dur:.75,side:'r'}],keys:[[-2.6,56,-22],[-1,53.8,-25.2],[0,52.8,-26.6],[.45,53.2,-27.4],[1.2,54.2,-27.3],[3,56,-26],[16,61,-22]]},
 {name:'Vidal',role:'bar',style:BAR({number:22,skin:SKIN_M,seed:22}),key:true,engage:[.4,2.4],moves:[{kind:'lunge',at:1.95,dur:.8,side:'r'}],keys:[[-2.6,66,-18],[0,64.2,-23],[1,63.2,-26.2],[1.6,62.8,-27.8],[2,62.9,-28.3],[2.8,64.5,-28.1],[4,69,-27],[8,80,-24],[16,88,-18]]},
 {name:'Kimmich',role:'bay',style:KIMMICH_ST,key:true,moves:[{kind:'pass',at:KSHOT,dur:.75,side:'r'}],keys:[[-2.6,62,4],[2,70,1],[5,80,-2],[7,87,-3.5],[8.5,92.4,-4.2],[9.6,95.3,-4.3],[10.05,96.3,-4.2],[10.5,97.1,-4.5],[11.2,98,-6.4],[12.4,98.6,-8.3],[16,98.8,-8.6]]},
 {name:'ter Stegen',role:'gk',style:TER_STEGEN,key:true,moves:[{kind:'dive',at:KSHOT+.3,dur:.75,side:'l'}],keys:[[-2.6,103.6,0],[6,103.5,-1],[8.5,103.9,-2.3],[9.4,104.1,-2.9],[9.9,103.7,-2.3],[10.1,103.6,-2.1],[16,103.6,-2.1]]},
 {name:'Piqué',role:'bar',style:BAR({number:3,build:{height:1.94,bulk:1.05},hair:[K,.8],seed:31}),keys:[[-2.6,94,-2],[8,98,-1.4],[9.5,100.5,-2.2],[16,101,-2]]},
 {name:'Lenglet',role:'bar',style:BAR({number:15,build:{height:1.86},seed:33}),keys:[[-2.6,93,-9],[6,95,-11],[8.6,100.6,-10.6],[9.6,101.8,-9.6],[16,102,-9]]},
 {name:'Busquets',role:'bar',style:BAR({number:5,build:{height:1.89,bulk:.94},seed:34}),keys:[[-2.6,74,-8],[6,84,-9],[9.5,92.4,-7.6],[16,95.5,-6]]},
 {name:'De Jong',role:'bar',style:BAR({number:21,hair:[Y,.45],seed:35}),keys:[[-2.6,68,4],[9.5,90,0],[16,94,0]]},
 {name:'Alba',role:'bar',style:BAR({number:18,build:{height:1.7},seed:36}),keys:[[-2.6,86,14],[9.5,97,6.5],[16,99,4]]},
 {name:'Griezmann',role:'bar',style:BAR({number:17,hair:[Y,.6],seed:37}),keys:[[-2.6,62,12],[16,80,8]]},
 {name:'Suárez',role:'bar',style:BAR({number:9,seed:38}),keys:[[-2.6,54,4],[16,60,0]]},
 {name:'Lewandowski',role:'bay',style:BAY({number:9,seed:41,build:{height:1.85}}),keys:[[-2.6,86,2],[6,92,0],[9,100,-3],[9.6,101.3,-3.4],[16,101.5,-3]]},
 {name:'Müller',role:'bay',style:BAY({number:25,seed:42,build:{height:1.85,bulk:.93}}),keys:[[-2.6,76,6],[8,92,4],[9.8,97,2.8],[12,98.4,-4],[16,98.6,-6]]},
 {name:'Gnabry',role:'bay',style:BAY({number:22,skin:SKIN_D,seed:43}),keys:[[-2.6,74,24],[8,90,14],[10,95,9],[16,98,1]]},
 {name:'Perišić',role:'bay',style:BAY({number:14,seed:44,build:{height:1.86}}),keys:[[-2.6,70,-14],[6,84,-14],[9,92.5,-12.5],[12,96.5,-10.5],[16,97.5,-10]]},
 {name:'Goretzka',role:'bay',style:BAY({number:18,seed:45,build:{height:1.89,bulk:1.08}}),keys:[[-2.6,64,-4],[8,84,-6],[16,92,-6]]},
 {name:'Thiago',role:'bay',style:BAY({number:6,seed:46,skin:SKIN_M}),keys:[[-2.6,52,-6],[16,70,-6]]},
 {name:'Alaba',role:'bay',style:BAY({number:27,seed:47,skin:SKIN_D}),moves:[{kind:'pass',at:PASS,dur:.8,side:'l'}],keys:[[-2.6,40,-19.2],[-1.8,40.3,-19.6],[0,42,-19],[16,52,-14]]},
 {name:'Boateng',role:'bay',style:BAY({number:17,seed:48,skin:SKIN_D,build:{height:1.92,bulk:1.06}}),keys:[[-2.6,36,2],[16,48,0]]},
 {name:'referee',role:'ref',style:REF,keys:[[-2.6,66,-8],[9,86,-12],[16,90,-10]]},
];
const DAVIES=0,SEMEDO=1,MESSI=2,VIDAL=3,KIMMICH=4,TS=5,ALABA=19;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3,T1=16,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Alaba's pass, Davies's left-foot touches, the cut-back, Kimmich's side-foot
/** his touches (τ): the first touch, the push past Messi, the knock past Vidal's lunge (1.95), long pushes down the wing, the settle in
 * front of Semedo, in (5.4), out (5.9), the push down the line (6.2), the quick turn inside (8.45), and the cut-back. Spacing inferred. */
const TOUCHES:number[]=[0,.55,1.2,1.95,2.9,3.8,4.55,5.05,5.4,5.9,6.25,7.15,7.85,8.45,8.95,CUTB];
/** his stride is synced to the touches: whole gait cycles between touches, each touch landing at the gait's touchPhase */
const CYCN=TOUCHES.slice(0,-1).map((T,i)=>Math.max(1,Math.round((TOUCHES[i+1]-T)*1.5)));
function gPhase(tau:number):number{if(tau<=0)return touchPhase+tau*1.4;let acc=0;
 for(let i=0;i+1<TOUCHES.length;i++){if(tau<TOUCHES[i+1])return touchPhase+acc+CYCN[i]*(tau-TOUCHES[i])/(TOUCHES[i+1]-TOUCHES[i]);acc+=CYCN[i];}
 return touchPhase+acc+(tau-CUTB)*1.4;}
/** where Kimmich meets it: just ahead of him and a touch to his right (right-foot side-foot) */
const K_YAW=(()=>{const[x,z]=posOf(KIMMICH,KSHOT);return yawOf(105-x,1.9-z);})();
const KSPOT:[number,number]=(()=>{const[x,z]=posOf(KIMMICH,KSHOT);return[x+Math.cos(K_YAW)*.42+Math.sin(K_YAW)*.16,z-Math.sin(K_YAW)*.42+Math.cos(K_YAW)*.16];})();
/** his heading (yaw), smoothed from the track; through the cut-back it swings toward the pass line */
const CUT_YAW=(()=>{const[x,z]=posOf(DAVIES,CUTB);return yawOf(KSPOT[0]-x,KSPOT[1]-z);})();
function yawD(tau:number):number{const v=velOf(DAVIES,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):CUT_YAW;return lerpA(head,CUT_YAW,bump(CUTB-.5,CUTB+.6,tau)*.62);}
/** his forward and left directions on the ground (x, z) */
const fwdL=(tau:number):[Pt,Pt]=>{const y=yawD(tau);return[[Math.cos(y),-Math.sin(y)],[-Math.sin(y),-Math.cos(y)]];};
/** ball spot for the left foot: ahead and a touch to his left */
const footAt=(tau:number):[number,number]=>{const p=posOf(DAVIES,tau),[f,l]=fwdL(tau);return[p[0]+f[0]*.46+l[0]*.12,p[1]+f[1]*.46+l[1]*.12];};
const TP=TOUCHES.map(footAt);
/** the finish: from Kimmich's boot, low across ter Stegen into the far side of the net (inferred line) */
const FLY=.36,IN_NET=KSHOT+FLY;
const NET:V3=[106.2,.35,1.9],REST:V3=[106.4,.11,2.3];
const alabaBall=(tau:number):[number,number]=>{const p=posOf(ALABA,tau),to=TP[0],d=Math.hypot(to[0]-p[0],to[1]-p[1])||1;return[p[0]+(to[0]-p[0])/d*.45,p[1]+(to[1]-p[1])/d*.45];};
function ballAt(tau:number):V3{
 if(tau<PASS){const b=alabaBall(tau);return[b[0],.11,b[1]];}
 if(tau<0){const x=alabaBall(PASS),u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.5),to=TP[0];return[lerp(x[0],to[0],e),.11,lerp(x[1],to[1],e)];}
 if(tau<CUTB){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const c0=TP[TP.length-1];
 if(tau<KSHOT){const u=(tau-CUTB)/(KSHOT-CUTB),e=1-Math.pow(1-u,1.3);return[lerp(c0[0],KSPOT[0],e),.11,lerp(c0[1],KSPOT[1],e)];}
 if(tau<IN_NET){const u=(tau-KSHOT)/FLY;return[lerp(KSPOT[0],NET[0],u),lerp(.11,NET[1],u)+.12*Math.sin(Math.PI*u),lerp(KSPOT[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e)+.2*Math.sin(Math.PI*Math.min(1,u*1.4))*(1-u),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET-.02?0:Math.exp(-(tau-IN_NET+.02)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the cut: body dropped and tilted into the turn, the far arm out (dir +1 = turning to his right) */
const CUT=(dir:number):Partial<Pose>=>({roll:10*dir,bend:12*dir,lean:24,lKnee:58,rKnee:54,lShA:dir>0?30:74,rShA:dir>0?74:30,neckY:10*dir,squash:-.05});
/** the dance in front of Semedo: low, knees bent, weight on the balls of the feet, arms out for balance, eyes on the defender */
const DANCE:Partial<Pose>={lean:20,pitch:4,lKnee:52,rKnee:50,lHipF:30,rHipF:28,lShA:48,rShA:44,lElb:40,rElb:40,neckP:6,squash:-.04};
/** the burst: a big forward lean from the ankles, driving arms */
const BURST:Partial<Pose>={lean:30,pitch:12,neckP:-6};
/** looking up before the cut-back: chin up, head turned toward the middle (his left as he runs along the byline) */
const LOOKUP:Partial<Pose>={neckP:-14,neckY:34,twist:10};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(DAVIES,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===DAVIES)yaw=yawD(tau);
 if(k===KIMMICH)yaw=lerpA(yaw,K_YAW,bump(KSHOT-.8,KSHOT+.6,tau)*1.2);
 if(k===ALABA&&tau<PASS+.5)yaw=yawOf(TP[0][0]-x,TP[0][1]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bar'?READY:stand();
 if(k===DAVIES){// dribbling strides synced to the touches (left foot), opening into a full sprint when he pushes the ball long
  const s=clamp((sp-2)/4.5),dr=dribble(gPhase(tau),{foot:'l',speed:.5+.4*s}),run=runCycle(gPhase(tau),{speed:1});
  p=blendPose(idle,blendPose(dr,run,clamp((sp-6.2)/1.6)*.7),clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='pass'){const t0=mv.at-STRIKE_CONTACT*mv.dur,u=(tau-t0)/mv.dur;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.35}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));continue;}
  const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.05});}
 if(k===SEMEDO)p=over(p,{lean:22,lKnee:56,rKnee:52},bump(4,5.4,tau));
 if(k===DAVIES){
  p=over(p,DANCE,bump(4.7,6.1,tau));
  p=over(p,CUT(1),bump(5.1,5.7,tau));p=over(p,CUT(-1),bump(5.6,6.2,tau));
  p=over(p,BURST,bump(6.05,7.2,tau));
  p=over(p,CUT(1),bump(8.15,8.8,tau));
  p=over(p,LOOKUP,bump(8.75,9.35,tau)*1.2);
  // the cut-back: a low, left-footed pass back across the box
  const D=.7,st=CUTB-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.45}),Math.min(sm(0,.15,u),1-sm(1,1.5,u)));
  if(tau>IN_NET+.4)p=over(p,{lShA:128,rShA:128,lShF:22,rShF:22,lElb:30,rElb:30,neckP:-18,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+.9,tau));
 }
 if(k===KIMMICH&&tau>IN_NET+.2)p=blendPose(p,celebrate((tau-IN_NET)*.8,{kind:'run'}),sm(IN_NET+.2,IN_NET+.7,tau));
 if(k===ACTORS.findIndex(q=>q.name==='Müller')&&tau>IN_NET+.3)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.3,IN_NET+.8,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;kim?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;ring?:number}={}):PlayOut{
 const{minBall=6,hero=false,ring=0}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // floodlight shadows: small figures get a faint cross of four short shadows in one op (the lamps ring the roof)
 const sh=new Path2D();for(const e of list)if(e.h<420){const sd=ACTORS[e.k].style.seed??1;for(const[ox,oy] of [[.11,.02],[-.11,.02],[.05,-.03],[-.05,.04]] as Pt[])sh.addPath(polyPath(blob(e.g[0]+ox*e.h,e.g[1]+oy*e.h,e.h*.12,e.h*.03,sd,{amp:.05,n:10}),true));}
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.3);
 if(ring>0){const m=posOf(DAVIES,tau),cx=(m[0]+b[0])/2,cz=(m[1]+b[2])/2,r=.45+Math.hypot(m[0]-b[0],m[1]-b[2])/2+.3*(1-ring),pts:Pt[]=[];
  for(let i=0;i<40;i++){const q=pr(c,[cx+Math.cos(i/40*TAU)*r*1.1,0,cz+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
  if(pts.length>30){const q=toCam(c,[cx,0,cz]),rr=ribbon(pts,Math.max(6,c.F*.1/q[2]),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:Math.hypot(b[0],b[2])/.11,key:K,shadow:B,seed:4});};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,kimR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only Davies keeps 'mid'
  const detail=passing?(e.k===DAVIES?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===DAVIES||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===DAVIES}:{});
  if(e.k===DAVIES)heroR=r;if(e.k===KIMMICH)kimR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,kim:kimR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a change of direction: a red arrow on the grass along his real path through the cut at tc (w grows it along the path) */
function cutArrow(s:Sheet,c:Cam,tc:number,w:number,lead=.45,len=.9){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=14;i++){const tau=tc-lead+len*i/14,[x,z]=posOf(DAVIES,tau),q=toCam(c,[x,0,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=c.F*.12/d;
 s.knockout(ribbon(seg,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(R,ribbon(seg,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** a lunge meeting only air: a red spark where the defender's boot arrives too late */
function missSpark(s:Sheet,c:Cam,k:number,at:number,t:number,t0:number){const age=t-t0;if(age<=-.3||age>=.5)return;const[x,z]=posOf(k,at),m=posOf(DAVIES,at-.25),P:V3=[lerp(x,m[0],.45),.25,lerp(z,m[1],.45)],q=pr(c,P);
 if(q)sparkBurst(s,R,q[0],q[1],c.F*.5/toCam(c,P)[2],{n:8,seed:83+k,g:easeOutBack(clamp((age+.3)/.2))*(1-clamp((age-.25)/.25)),width:9});}
/** speed lines streaming off him, opposite his run */
function speedLines(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const m=posOf(DAVIES,tau),v=velOf(DAVIES,tau),l=Math.hypot(v[0],v[1])||1,q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]+v[0]/l,1,m[1]+v[1]/l]);if(!q||!q2)return;
 const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=c.F/toCam(c,[m[0],1,m[1]])[2];
 for(const k of[0,1,2]){const y0=q[1]-z*(.75-k*.45),x0=q[0]-Math.cos(dir)*z*.45,y1=y0-Math.sin(dir)*z*.45;s.fill(K,ribbon([[x0,y1],[q[0]-Math.cos(dir)*z*(1.4+k*.3),y0-Math.sin(dir)*z*(1.4+k*.3)]],z*.05,{seed:9+k,taper:.9,wobble:.5}),.6*w);}}
/** "look up": a dashed yellow sight line from his eyes to Kimmich */
function sightLine(s:Sheet,c:Cam,hero:DrawResult|undefined,tau:number,w:number){if(!hero||w<=0)return;const[kx,kz]=posOf(KIMMICH,Math.max(tau,CUTB-.4)),q=pr(c,[kx,1.7,kz]);if(!q)return;
 const h=hero.joints.head,n=hero.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*.5+3;s.knockout(ribbon([h,q],u*1.9,{seed:73,taper:.1}),.6*w);laneArrow(s,Y,h,q,u,{dashed:true,progress:w,seed:73,head:u*3.2});}
/** the cut-back line: the ball's path from his boot back across the box, traced as it rolls (or whole in the lesson) */
function cutbackLine(s:Sheet,c:Cam,upTo:number,w:number,wd:number){if(w<=0||upTo<=CUTB)return;const pts:Pt[]=[];for(let i=0;i<=12;i++){const q=pr(c,ballAt(lerp(CUTB,Math.min(upTo,KSHOT),i/12)));if(q)pts.push(q);}
 if(pts.length<3)return;s.knockout(ribbon(pts,wd*1.7,{seed:91,taper:.3,wobble:.5}),.75*w);laneArrow(s,Y,pts[0],pts[pts.length-1],wd,{seed:91,head:wd*2.8,cov:.95*w});}
/** the cut-back zone: a yellow ring on the grass where the late runner arrives (between the penalty spot and the six-yard box) */
function zoneRing(s:Sheet,c:Cam,w:number){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[KSPOT[0]+.3+Math.cos(a)*2.4*w,0,KSPOT[1]+Math.sin(a)*3.2*w]);if(q)pts.push(q);}
 if(pts.length<30)return;const q=toCam(c,[KSPOT[0],0,KSPOT[1]]),rr=ribbon(pts,Math.max(5,c.F*.14/q[2]),{close:true,seed:95,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(Y,rr,.95*w);}
/** a marker ring round a defender's feet (who he has to beat) */
function footRing(s:Sheet,c:Cam,k:number,tau:number,w:number,ink:string){if(w<=0)return;const[x,z]=posOf(k,tau),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,q=pr(c,[x+Math.cos(a)*.9*w,0,z+Math.sin(a)*.9*w]);if(q)pts.push(q);}
 if(pts.length<24)return;const q=toCam(c,[x,0,z]);s.fill(ink,ribbon(pts,Math.max(4,c.F*.09/q[2]),{close:true,seed:97+k,taper:0,wobble:.8}),.9*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the run between them plays at ~1–1.6× real time; the pre-roll is Alaba on the ball) */
const tau1=(t:number)=>{const G=CUEW(0,'Kimmich scores');return key(t,mono([[0,-2.9],[CUEW(0,'Alphonso'),-1.9],[CUEW(0,'takes off'),0],[CUEW(0,'Past Messi'),.55],[CUEW(0,'past Vidal'),1.95],[CUEW(0,'Now Semedo'),5],[CUEW(0,'past him'),6.3],[CUEW(0,'Cut back'),CUTB],[G+.1,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+.9-G)]]),linear);};
const CAM1:V3=[52.5,21,-64];
function cam1(t:number):Cam{
 const G=CUEW(0,'Kimmich scores'),S=SECS(0),tau=tau1(t),al=CUEW(0,'Alphonso');
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // opens on the empty red seats of the far stand, then drops to the ball and pans with it; after the goal it settles on the celebration
 const open:V3=[60,12,44],m=posOf(KIMMICH,tau),cel:V3=[m[0]-2,1.1,m[1]-2];
 const toBall=sm(.2,al+.2,t,easeInOutSine),toG=sm(G+.5,G+1.6,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0]+2,toBall),lerp(open[1],2.2,toBall),lerp(open[2],lerp(bt[2],0,.12),toBall)],T=lerp3(tb,cel,toG);
 const F=key(t,mono([[0,1450],[al+.2,4100],[CUEW(0,'past Vidal'),4400],[CUEW(0,'Now Semedo'),5000],[CUEW(0,'Cut back'),5300],[G,5500],[G+1.4,6200],[S,6400]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Kimmich scores'),to=CUEW(0,'takes off'),lw=CUEW(0,'left wing');
  stadium(s,c,v,{glow:sm(G+.05,G+.3,t)*(1-sm(G+.9,G+1.4,t))});
  ground(s,c,{bulge:bulgeAt(tau),half:sm(to-.1,to+.2,t)*(1-sm(lw,lw+.5,t)),wing:sm(lw-.1,lw+.6,t,easeOut)*(1-sm(CUEW(0,'past Vidal'),CUEW(0,'past Vidal')+.5,t))});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,after:()=>{
   missSpark(s,c,MESSI,.5,t,CUEW(0,'Past Messi')+.05);missSpark(s,c,VIDAL,1.95,t,CUEW(0,'past Vidal')+.05);missSpark(s,c,SEMEDO,5.6,t,CUEW(0,'past him'));}});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(DAVIES,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: the dance at Semedo, the burst, the turn into the box
const tau2=(t:number)=>key(t,mono([[0,3.7],[CUEW(1,'Semedo waits'),4.2],[CUEW(1,'Davies dances'),4.9],[CUEW(1,'inside,'),5.35],[CUEW(1,'outside,'),5.85],[CUEW(1,'full speed'),6.25],[CUEW(1,'down the line'),7.0],[CUEW(1,'One quick'),8.2],[CUEW(1,'in the box'),9.0],[SECS(1),9.25]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(DAVIES,tau),sd=posOf(SEMEDO,tau),open=1-sm(0,1.4,t,easeInOutSine),
  push=sm(CUEW(1,'Davies')-.3,CUEW(1,'inside,'),t,easeInOutSine)*(1-sm(CUEW(1,'full speed')-.2,CUEW(1,'full speed')+.5,t)),
  back=sm(CUEW(1,'full speed')-.2,CUEW(1,'down the line')+.3,t,easeInOutSine),box=sm(CUEW(1,'One quick')-.3,CUEW(1,'in the box'),t,easeInOutSine);
 // low on the near touchline, a little behind the pair; framing Davies and Semedo together, then following the burst down the line and
 // swinging round to look into the box as he turns in
 const mid:[number,number]=[lerp(m[0],sd[0],.4*(1-back)),lerp(m[1],sd[1],.4*(1-back))];
 const C:V3=[mid[0]-6.5+1.5*open-2*back+3.5*box,1.6+.3*open+.4*back+.8*box,lerp(-39.2-2*open+2.2*push-1.5*back,mid[1]-9.5,box)],T:V3=[mid[0]+1.6+2*back+1.5*box,.9-.1*push,mid[1]+1.2+2.5*box];
 return look(C,T,2600+500*push-350*back+500*box-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),sw=CUEW(1,'Semedo waits'),dd=CUEW(1,'Davies dances'),i1=CUEW(1,'inside,'),o1=CUEW(1,'outside,'),fs=CUEW(1,'full speed'),dl=CUEW(1,'down the line'),oq=CUEW(1,'One quick'),ib=CUEW(1,'in the box'),E=SECS(1);
  const fade=1-sm(E-.8,E-.45,t);
  stadium(s,c,v);
  ground(s,c,{box:sm(ib-.15,ib+.25,t,easeOutBack)*fade});
  footRing(s,c,SEMEDO,tau,sm(sw-.1,sw+.3,t,easeOutBack)*(1-sm(fs-.3,fs,t)),R);
  // in · out: each word paints that cut's route on the grass; the quick turn inside gets its own arrow
  cutArrow(s,c,5.4,sm(i1-.3,i1+.3,t,easeOut)*(1-sm(dl-.4,dl,t)),.4,.7);cutArrow(s,c,5.9,sm(o1-.3,o1+.3,t,easeOut)*(1-sm(dl-.4,dl,t)),.35,.75);
  cutArrow(s,c,8.45,sm(oq-.25,oq+.4,t,easeOut)*fade,.4,.9);
  // down the line: a long yellow arrow along the touchline ahead of him
  const dw=sm(dl-.25,dl+.3,t,easeOut)*(1-sm(oq-.4,oq,t));
  if(dw>0){const a=pr(c,[84,.02,-31.2]),b=pr(c,[97,.02,-30.4]);if(a&&b){const wd=Math.max(5,c.F*.3/toCam(c,[90,0,-31])[2]);s.knockout(ribbon([a,b],wd*1.6,{seed:77,taper:.1}),.7*dw);laneArrow(s,Y,a,b,wd,{progress:dw,seed:77,head:wd*2.6});}}
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "Davies dances": a red ring round his feet while he shuffles in front of the defender
   const dw2=sm(dd-.15,dd+.25,t,easeOutBack)*(1-sm(i1+.1,i1+.4,t));
   if(hero&&dw2>0){const l=hero.joints.lToe,r=hero.joints.rToe,cx=(l[0]+r[0])/2,cy=(l[1]+r[1])/2,rr=Math.hypot(l[0]-r[0],l[1]-r[1])*.8+hero.heightPx*.08,pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([cx+Math.cos(a)*rr*1.3*dw2,cy+Math.sin(a)*rr*.45*dw2]);}
    s.fill(R,ribbon(pts,Math.max(3,rr*.12),{seed:82,close:true,taper:0,wobble:.8}),.95*dw2);}
   // "full speed": speed lines stream off him as he bursts past
   speedLines(s,c,tau,sm(fs-.1,fs+.3,t)*(1-sm(oq-.3,oq,t)));
   // Semedo's lunge at the feint meets only air; so does his last reach at the edge of the box
   missSpark(s,c,SEMEDO,5.6,t,i1+.25);missSpark(s,c,SEMEDO,8.6,t,oq+.35);}});
  // the replay wipe as the chapter opens
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the look up, the cut-back, the side-foot, the celebration
const tau3=(t:number)=>{const bw=CUEW(2,'Bayern went on');return key(t,mono([[0,8.3],[CUEW(2,'He looks up'),8.85],[CUEW(2,'cuts it back'),CUTB+.05],[CUEW(2,'Joshua Kimmich'),9.75],[CUEW(2,'side-foots'),KSHOT+.05],[bw,IN_NET+.7],[SECS(2),IN_NET+.7+(SECS(2)-bw)*.9]]),linear);};
const swing3=(t:number)=>{const bw=CUEW(2,'Bayern went on');return sm(bw-.3,bw+1,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),e=sm(CUTB-.2,KSHOT,tau,easeInOutSine);
 // raised behind the goal, off toward the near-post side: Davies at the byline on the left of frame, the cut-back rolls across toward
 // Kimmich arriving in the middle, the goal mouth in the foreground
 const m=smooth(DAVIES,tau),k=posOf(KIMMICH,tau);
 const C0:V3=[117,6.5,-9],T0:V3=[lerp(m[0]-1,k[0]+1,e),lerp(1,.9,e),lerp(m[1]+1,lerp(m[1],k[1],.7),e)];
 // then round to the pitch side of the celebration (the empty main stand behind)
 const cc=smooth(KIMMICH,tau),C1:V3=[cc[0]-8,2.2,cc[1]+8.5],T1:V3=[cc[0]+.5,1.3,cc[1]-1.2];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3400+500*e,2900,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),lu=CUEW(2,'He looks up'),cb=CUEW(2,'cuts it back'),jk=CUEW(2,'Joshua Kimmich'),sf=CUEW(2,'side-foots'),bw=CUEW(2,'Bayern went on'),et=CUEW(2,'eight to two'),u=swing3(t);
  stadium(s,c,v,{glow:sm(et-.1,et+.3,t)*(1-sm(SECS(2)-.9,SECS(2)-.5,t))});
  ground(s,c,{goalLater:u<.5,bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({hero,kim,br})=>{
   sightLine(s,c,hero,tau,sm(lu-.1,lu+.35,t,easeOut)*(1-sm(cb+.2,cb+.6,t)));
   cutbackLine(s,c,tau,sm(cb-.1,cb+.2,t)*(1-sm(bw-.3,bw+.1,t)),Math.max(4,br*.55));
   // "Joshua Kimmich": a yellow ring on the late runner
   const kw=sm(jk-.1,jk+.3,t,easeOutBack)*(1-sm(sf+.3,sf+.7,t));
   if(kim&&kw>0){const l=kim.joints.lToe,r=kim.joints.rToe,cx=(l[0]+r[0])/2,cy=(l[1]+r[1])/2,rr=kim.heightPx*.2,pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([cx+Math.cos(a)*rr*1.3*kw,cy+Math.sin(a)*rr*.42*kw]);}
    s.knockout(ribbon(pts,Math.max(4,rr*.14),{seed:84,close:true,taper:0,wobble:.8}),.8*kw);s.fill(Y,ribbon(pts,Math.max(3,rr*.09),{seed:84,close:true,taper:0,wobble:.8}),.95*kw);}
   // "side-foots": a spark at the contact, the ball's short line into the net
   const age=t-sf;if(age>-.15&&age<.45){const q=pr(c,[KSPOT[0],.12,KSPOT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.55/toCam(c,[KSPOT[0],.12,KSPOT[1]])[2],{n:8,seed:86,g:easeOutBack(clamp((age+.15)/.15))*(1-clamp((age-.25)/.2)),width:8});}
   if(tau>KSHOT&&tau<IN_NET+.6){const pts:Pt[]=[];for(let i=0;i<=8;i++){const q=pr(c,ballAt(lerp(KSHOT,Math.min(tau,IN_NET),i/8)));if(q)pts.push(q);}if(pts.length>2)s.fill(Y,ribbon(pts,Math.max(3,br*.5),{seed:88,taper:.9,wobble:.4}),.9*(1-sm(IN_NET+.2,IN_NET+.6,tau)));}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(KIMMICH,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: low behind Davies, from the dance to the cut-back (the run plays ~1× here)
const tau4=(t:number)=>key(t,mono([[0,4.6],[CUEW(3,'on the wing'),5.05],[CUEW(3,'use your pace'),6.2],[CUEW(3,'quick changes'),8.2],[CUEW(3,'look up'),8.95],[CUEW(3,'cut it back'),CUTB+.05],[SECS(3),KSHOT+.3]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),wide=sm(CUEW(3,'look up')-.4,CUEW(3,'cut it back')+.2,t,easeInOutSine),push=sm(CUEW(3,'on the wing')-.3,CUEW(3,'on the wing')+.4,t,easeInOutSine)*(1-sm(CUEW(3,'use')-.2,CUEW(3,'use')+.4,t));
 // behind him along his run (so the chaser stays beside the lens), a little high; late on the aim opens to the middle of the box so the
 // late runner and the cut-back zone come into frame while he stays at the left of the picture
 const tt=Math.min(tau,CUTB),m=posOf(DAVIES,tt),a=posOf(DAVIES,tt-.5),dx=m[0]-a[0],dz=m[1]-a[1],l=Math.hypot(dx,dz)||1,hx=dx/l,hz=dz/l;
 const back=7.4-1.4*push+2.5*wide;
 const C:V3=[m[0]-hx*back-hz*1.6-1.5*wide,2.3-.3*push+2.6*wide,m[1]-hz*back+hx*1.6-1.5*wide],T:V3=[lerp(m[0]+hx*5,lerp(m[0],KSPOT[0],.4),wide),lerp(.9,.7,wide),lerp(m[1]+hz*5,lerp(m[1],KSPOT[1],.4),wide)];
 return look(C,T,2500+350*push-700*wide);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUEW(3,'Your turn'),ow=CUEW(3,'on the wing'),up=CUEW(3,'use your pace'),qc=CUEW(3,'quick changes'),lu=CUEW(3,'look up'),cb=CUEW(3,'cut it back'),E=SECS(3);
  stadium(s,c,v);
  ground(s,c,{wing:sm(ow-.15,ow+.5,t,easeOut)*(1-sm(qc-.3,qc+.2,t))});
  zoneRing(s,c,sm(cb-.2,cb+.3,t,easeOutBack)*(1-sm(E-.5,E-.15,t)));
  // quick changes of direction: all three cuts painted on the grass (in, out, and the turn into the box)
  const qw=sm(qc-.3,qc+.4,t,easeOut)*(1-sm(E-.8,E-.4,t));cutArrow(s,c,5.4,qw,.4,.7);cutArrow(s,c,5.9,qw,.35,.75);cutArrow(s,c,8.45,qw,.4,.9);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,ring:sm(yt-.1,yt+.35,t,easeOutBack)*(1-sm(ow-.2,ow+.2,t)),after:({hero,br})=>{
   speedLines(s,c,tau,sm(up-.1,up+.3,t)*(1-sm(qc-.3,qc,t)));
   sightLine(s,c,hero,tau,sm(lu-.1,lu+.35,t,easeOut)*(1-sm(E-.7,E-.3,t)));
   cutbackLine(s,c,tau,sm(cb-.1,cb+.2,t)*(1-sm(E-.5,E-.15,t)),Math.max(4,br*.6));}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'davies-semedo-2020',format:'11v11',title:'The Run Past Semedo',theme:'Pace and quick changes of direction on the wing, then look up and cut it back',
 ageNote:'Champions League quarter-final, Barcelona v Bayern Munich, Estádio da Luz, Lisbon, 14 August 2020. For players of every age.',
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
