/** Theo Hernández — "Signature: the run from his own box". AC Milan v Atalanta, Serie A matchday 37, San Siro (Stadio Giuseppe Meazza),
 * Milan, 15 May 2022 (Milan won 2–0): the 75th-minute solo goal. Theo picks the ball up on the corner of his own penalty area and runs it
 * almost the whole length of the pitch, pushing it ahead into the open grass, to score past Juan Musso. An iconic-play riso film
 * (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot watch the footage), printed as a riso sheet.
 *
 * WHY THIS MOMENT: his iconicPlays entry is a signature ("the run from his own box", lesson "when there is space in front of you, push the
 * ball ahead and run into it"). This is the best-documented run of that kind: every account measures it from his own box (SempreMilan:
 * "from the edge of his own 18-yard box into the Atalanta area"; Football Italia: "starting the run from his own penalty area"), DAZN
 * measured it (95 m with the ball), he described it himself ("I started and thought I'm going all the way"), and it came in the title run-in.
 * Italian Wikipedia describes the same trait: "abile nel dribbling, soprattutto in progressione, è solito partire palla al piede in
 * contropiede". His goal v Morocco (2022 World Cup semi-final) is an acrobatic volley, not this signature.
 *
 * SOURCES (pages cached under scratchpad/films/src-cache/):
 *  - Wikipedia (en) "2021–22 AC Milan season": match box — 15 May 2022, 18:00 CEST, round 37, Milan 2–0 Atalanta, Leão 56', Hernandez 75',
 *    San Siro, attendance 73,304, referee Daniele Orsato.  (wiki-milan-2021-22.txt)
 *  - Wikipedia (en) "Théo Hernandez": "On 15 May 2022 against Atalanta, Hernandez ran for 95 metres before scoring the second goal of a 2–0
 *    win"; Milan crowned champions a week later; height 1.84 m.  (wiki-theo-hernandez.txt)
 *  - SempreMilan, Oliver Fisher, "AC Milan 2-0 Atalanta: Rossoneri on the brink of the Scudetto as Leao and Theo score" (15 May 2022)
 *    https://sempremilan.com/milan-2-0-atalanta-match-report — "a lung-busting solo run from the edge of his own 18-yard box into the
 *    Atalanta area, slotting past Musso"; "picked the ball up on the corner of his own box and ran it almost the full length of the pitch,
 *    beating several Atalanta players before beating Musso with a low angled shot"; 15 minutes left.  (sempremilan-milan-atalanta-2022.txt)
 *  - Football Italia, Susy Campanale, "Theo Hernandez: 'I thought, I'm going all the way'" (15 May 2022)
 *    https://football-italia.net/theo-hernandez-i-thought-im-going-all-the-way/ — "starting the run from his own penalty area to surge
 *    forward and shake off challenges"; "DAZN calculated he travelled 95 metres with the ball at his feet in a zig-zag motion"; Atalanta
 *    protested fouls in the build-up.  (fi-theo-all-the-way-2022.txt)
 *  - Wikipedia (it) "Theo Hernández" (playing style).  (itwiki-theo-hernandez.txt)
 * CONFIRMED by those accounts: date, stadium, matchday 37, 75th minute (15 minutes left), Milan 1–0 up (Leão 56') and the goal made it 2–0;
 * he picked the ball up on the corner / edge of his own penalty area; ran ~95 m with the ball in a zig-zag, almost the full length of the
 * pitch; beat several Atalanta players / shook off challenges; into the Atalanta area; a low angled shot past keeper Juan Musso; Milan
 * became champions a week later (22 May 2022). Milan played at home in their home red-and-black stripes (Milan's home strip at San Siro).
 * INFERRED (illustrative): every position and timing between those beats; what happened just before the pick-up (drawn as an Atalanta
 * pass he steps in front of); which way Milan attacked on screen (left → right from the main stand) and so the far side for his own
 * box's left corner (he is the LEFT-back: the left corner from Milan's view); the line of the run, the zig-zags, where the three Atalanta
 * players he goes past (the entry's "beaten: 3"; none are named in the sources) stood and lunged; the number and spacing of touches (big
 * pushes into open grass, short ones near a defender); that he dribbled and shot with his LEFT foot (he is well known as left-footed, not
 * stated in these sources — not narrated); which post (drawn low across Musso to the far post — not narrated); his number 19 (his Milan
 * number, not in these sources); the 2021–22 kit details (Milan white shorts and black socks; Atalanta in a white change kit with blue
 * trim; Musso and Maignan's keeper colours; Orsato's black kit); the ball (drawn plain white with navy panels); the other players'
 * positions and who they are (none are named); San Siro's look (three tiers, the 1990 roof with its red girders and the corner towers
 * with their spiral ramps), crowd colours, the May evening light, the camera placements, the celebration.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera panning with the
 * ball from the pick-up to the goal (the run plays at ~1–1.5× real time); 2 = slow-motion replay from a low touchline camera: behind him
 * over the empty grass (yellow wash), then side-on as one big push rolls the ball far ahead (yellow dashed arrow, a gap bracket on the
 * grass) and he sprints on to it (red run lane), then a fast tracking pan with the touch spots left far apart; 3 = replay from behind the
 * goal: the low angled finish past Musso, the swing round to the celebration and the crowd (a week later: champions); 4 = the lesson from
 * a raised three-quarter camera behind him on an open stretch (space ahead → push the ball ahead → run into it). All figures are the shared
 * riso athlete (lib/plays/riso/athlete.ts) routed through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue
 * times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,lunge,strike,keeperSet,keeperDive,slideTackle,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); every cue starts
 * with a plain word (Kokoro splits contractions and hyphenated words). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The run, live',text:'San Siro, May 2022. Theo Hernández picks up the ball on the edge of his own box, and off he goes! Past one, past another, still running, into their box... goal!',seconds:13.8,
  cues:[[.2,'San Siro'],[2.2,'Theo Hernández'],[3.2,'picks up the ball'],[4.9,'his own box'],[5.9,'and off he goes'],[7.4,'Past one'],[8.4,'past another'],[9.4,'still running'],[10.5,'into their box'],[12.1,'goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. See all that empty grass? He pushes the ball far ahead and sprints on to it, again and again.',seconds:9.6,
  cues:[[.15,'Watch it again'],[1.8,'See all'],[2.6,'empty grass'],[3.6,'He pushes'],[4.4,'far ahead'],[5.3,'and sprints'],[6.1,'on to it'],[6.9,'again and again']]},
 {label:'The finish',text:'Ninety-five metres later, he slots it low past keeper Juan Musso. A week later, Milan were champions!',seconds:8.6,
  cues:[[.7,'metres later'],[1.7,'slots it low'],[2.6,'past keeper'],[3.3,'Juan Musso'],[4.7,'A week later'],[5.8,'Milan were champions']]},
 {label:'Your turn',text:'Your turn: when there is space in front of you, push the ball ahead and run into it!',seconds:7.6,
  cues:[[.15,'Your turn'],[1,'when there is space'],[2.2,'in front of you'],[3.2,'push the ball ahead'],[4.6,'run into it']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py theo-hernandez-signature, which writes timing.json next to script.json. Then
 * replace this null with `import timingJson from '../../../public/plays/narration/theo-hernandez-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-theo-hernandez-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/theo-hernandez-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('theo: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Milan defend X = 0 and attack +X, Atalanta's goal line at 105), Y up,
 * Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so Milan's
 * left flank — Theo's side — is the far side (−Z). */
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
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a closed ground ring (ellipse rx × rz round x,z) as a ribbon path, or null when off camera */
function groundRing(c:Cam,x:number,z:number,rx:number,rz:number,wm:number,seed:number):Path2D|null{const pts:Pt[]=[];
 for(let i=0;i<30;i++){const q=pr(c,[x+Math.cos(i/30*TAU)*rx,0,z+Math.sin(i/30*TAU)*rz]);if(q)pts.push(q);}
 if(pts.length<24)return null;const d=toCam(c,[x,0,z])[2];if(d<1)return null;return ribbon(pts,Math.max(3,c.F*wm/d),{close:true,seed,taper:0,wobble:1});}

// ---------------------------------------------------------------- San Siro: a tall squared bowl (three rings), the red roof girders, the corner towers
const CX=52.5,NS=64;
/** a point on the stands: angle th round the pitch centre, d metres out from the inner rim (a squared superellipse: San Siro is a box), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.28),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.28)];}
const LOW=(b:number):[number,number]=>[2+15*b,1.6+10*b],MID=(b:number):[number,number]=>[16+12*b,12.5+10*b],UP=(b:number):[number,number]=>[26+16*b,25+17*b];
type Bowl={low:V3[][];mid:V3[][];up:V3[][];band:V3[][];roof:V3[][];girder:V3[][];seats:{P:V3;h:number;tier:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],mid:[],up:[],band:[],roof:[],girder:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.mid.push(Q(MID,0,1));o.up.push(Q(UP,0,1));
  o.band.push([rim(a,16,11.6),rim(b,16,11.6),rim(b,16,12.9),rim(a,16,12.9)]);o.band.push([rim(a,26,23.8),rim(b,26,23.8),rim(b,26,25.3),rim(a,26,25.3)]);
  o.roof.push([rim(a,30,44),rim(b,30,44),rim(b,50,46),rim(a,50,46)]);
  o.girder.push([rim(a,33,46),rim(b,33,46),rim(b,33,50.5),rim(a,33,50.5)]);
  for(const [f,rows,tier] of [[LOW,8,0],[MID,6,1],[UP,8,2]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<5;k++){const h=hash(i*977+r*31+k*7+tier*5000,11);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/5)/NS*TAU,d,y+.4),h,tier});}}
 return o;})();
/** the four corner towers that carry the roof (cylinders with spiral ramps), standing just outside the bowl's corners */
const TOWERS:V3[]=[[CX+104,0,-86],[CX+104,0,86],[CX-104,0,-86],[CX-104,0,86]].map(([x,,z])=>[CX+(x-CX)*.62,0,z*.62] as V3);
function towers(s:Sheet,c:Cam,v:View){
 const body=new Path2D(),ramp=new Path2D();let any=false;
 for(const T of TOWERS){const q=toCam(c,[T[0],25,T[2]]);if(q[2]<25)continue;const g=scr(c,q);const w=c.F*6.5/q[2],top=pr(c,[T[0],52,T[2]]),bot=pr(c,[T[0],0,T[2]]);if(!top||!bot)continue;
  if(!inView(v,[g[0],g[1]],w+(bot[1]-top[1])))continue;any=true;
  body.addPath(polyPath([[top[0]-w,top[1]],[top[0]+w,top[1]],[bot[0]+w,bot[1]],[bot[0]-w,bot[1]]],true));
  // the spiral ramps read as diagonal bands wrapping the drum
  for(let k=0;k<9;k++){const y0=k*5.6,a=pr(c,[T[0],y0,T[2]]),b=pr(c,[T[0],y0+4.2,T[2]]);if(!a||!b)continue;ramp.addPath(ribbon([[a[0]-w*.95,a[1]],[b[0]+w*.95,b[1]]],Math.max(1.5,w*.18),{seed:k+400,taper:0,wobble:.4}));}}
 if(!any)return;s.knockout(body);s.tone(K,body,.42);s.tone(B,body,.25);s.knockout(ramp,.7);}
/** everything behind the pitch: the May evening sky, the towers, the stands, the crowd (roar lifts the seat marks, flash = photographers) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.28);s.tone(Y,rectPath(-1e4,-1e4,2e4,2e4),.1);
 towers(s,c,v);
 const low=new Path2D(),mid=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D(),gird=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.low[i],low);add(BOWL.mid[i],mid);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.girder[i],gird);}
 for(const q of BOWL.band)add(q,band);
 s.knockout(low);s.tone(K,low,.3);s.knockout(mid);s.tone(K,mid,.36);s.knockout(up);s.tone(B,up,.3);s.tone(K,up,.3);
 // the crowd: 73,000 — Milan red and black, white shirts, a blue-and-black Atalanta corner
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.62/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const away=q.P[0]>108&&q.P[2]<-12,ink=away?(q.h<.5?3:2):q.h<.36?0:q.h<.66?1:q.h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.92);s.fill(K,inks[2],.85);s.fill(B,inks[3],.9);
 s.knockout(band,.8);s.tone(K,band,.12);
 s.knockout(roof);s.tone(K,roof,.62);s.tone(B,roof,.35);
 s.knockout(gird);s.fill(R,gird,.95);s.tone(K,gird,.15);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the surround, grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (Atalanta's goal drawn later when it is in
 * front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(R,p,.16);s.tone(K,p,.24);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // LED boards: far touchline and behind both goals, navy with red and paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.2,-36.95],[x+3.6,.2,-36.95],[x+3.6,.7,-36.95],[x,.7,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.2,z],[108.45,.2,z+3.6],[108.45,.7,z+3.6],[108.45,.7,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd,.9);s.fill(K,bd,.7);s.knockout(pn,.8);s.fill(R,pn,.6);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 for(const [x,z,a0] of [[0,-34,0],[0,34,-Math.PI/2],[105,-34,Math.PI/2],[105,34,Math.PI]] as [number,number,number][])circ(x,z,1,a0,a0+Math.PI/2,5);
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??2.9);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.3],[R,.2]];
const SKIN_M:InkFill[]=[[Y,.4],[R,.3],[K,.1]];
const SKIN_D:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** AC Milan 2021–22 home: red-and-black stripes (red + navy); white shorts and black socks inferred */
const ACM=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:K,shorts:'paper',socks:K,trim:K,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',seed:3,...o});
/** Theo Hernández: number 19 (inferred), dark short hair, 1.84 m, powerful sprinter's build */
const THEO_STYLE=ACM({skin:SKIN_M,hair:K,hairStyle:'short',number:19,numberInk:'paper',build:{height:1.84,bulk:1.06,thighs:1.18},seed:19});
/** Atalanta: the white change kit with blue trim (inferred) */
const ATA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:B,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',seed:5,...o});
/** Juan Musso (keeper colours inferred: yellow), Mike Maignan (inferred: blue-grey) */
const MUSSO:AthleteStyle={shirt:[Y,.95],shorts:[Y,.9],socks:[Y,.9],trim:K,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,gloves:[B,.7],sleeves:'long',build:{height:1.91},seed:51};
const MAIGNAN:AthleteStyle={shirt:[B,.55],shorts:[B,.7],socks:[B,.55],trim:K,boots:K,skin:SKIN_D,hair:K,hairStyle:'short',line:K,gloves:[Y,.6],sleeves:'long',build:{height:1.91},seed:52};
/** referee Daniele Orsato: black kit inferred */
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:Y,boots:K,skin:SKIN_L,hair:[K,.4],hairStyle:'bald',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Theo's first touch)
type Role='theo'|'acm'|'ata'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a slide (down from `at`), a pass (contact at `at`) */
type Move={kind:'lunge'|'dive'|'slide'|'kick';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The pick-up on the corner of his own box, the run into the area and the
 * finish past Musso are confirmed; everything else (who stood where, the three men he goes past) is inferred. */
const PASS=-.85;
const ACTORS:Actor[]=[
 {name:'Theo',role:'theo',style:THEO_STYLE,key:true,keys:[[-3,12.4,-15.2],[-2,13,-16.4],[-1,14.3,-18.2],[-.4,15.1,-19.1],[0,15.7,-19.6],[.5,17.2,-19.9],[1.2,20.6,-19.5],[2,25.2,-18.3],[2.6,29,-17.1],[3.2,33,-16.3],[4,38.6,-15],[5,45.6,-13],[6,52.6,-11.2],[6.8,58,-10.2],[7.4,62,-9.1],
  [8,66.2,-7],[9,73.2,-5.9],[10,80,-6.6],[10.6,84,-7.8],[11.2,87.8,-9.5],[11.8,91.1,-10.3],[12.3,93.4,-10.1],[12.75,95.1,-9.6],[13.3,97,-8.4],[14.4,98.8,-5],[15.8,99.6,.5],[17.5,99,7]]},
 // Atalanta: the pass he cuts out, the two who chase from the box, the three he goes past, the back line, Musso
 {name:'passer',role:'ata',style:ATA({seed:31}),moves:[{kind:'kick',at:PASS,dur:.9,side:'r'}],keys:[[-3,26.6,-25.4],[-2,24.6,-24.4],[-1,22.6,-23.4],[PASS,22.3,-23.2],[0,21.6,-22.6],[1.5,24,-21.5],[4,33,-19],[17.5,68,-12]]},
 {name:'forward',role:'ata',style:ATA({seed:32,hairStyle:'curly'}),keys:[[-3,13,-8],[-1,11.6,-11.2],[0,11.8,-12.4],[1.5,15.5,-13],[4,26,-12],[17.5,60,-8]]},
 {name:'chaser',role:'ata',style:ATA({seed:33,hair:[K,.6]}),keys:[[-3,20,-10],[-1,19.2,-13.4],[0,19,-15.6],[1,21.6,-16.8],[3,31,-15.4],[7,52,-11.5],[12,76,-8],[17.5,90,-6]]},
 {name:'past one',role:'ata',style:ATA({seed:34,hairStyle:'long'}),key:true,engage:[1.4,3.4],moves:[{kind:'lunge',at:2.6,dur:.8,side:'r'}],keys:[[-3,38,-6],[0,35,-10],[1.5,31.8,-13.4],[2.3,30.6,-14.6],[2.7,30.2,-15.2],[3.2,30.8,-15.3],[4.2,33.4,-15],[17.5,62,-10]]},
 {name:'past another',role:'ata',style:ATA({seed:35}),key:true,engage:[6,8],moves:[{kind:'lunge',at:7.35,dur:.85,side:'l'}],keys:[[-3,56,-4],[0,56,-6],[4,59,-9],[6.4,62,-10.4],[7.1,62.8,-10.6],[7.6,63,-10.3],[8.4,64.6,-9.6],[17.5,84,-8]]},
 {name:'third',role:'ata',style:ATA({seed:36,build:{height:1.9,bulk:1.06}}),key:true,engage:[9.6,11.4],moves:[{kind:'lunge',at:10.7,dur:.85,side:'r'},{kind:'slide',at:12.55,dur:1.1,side:'l'}],keys:[[-3,70,-2],[0,72,-3],[5,78,-4.6],[9,84.4,-6],[10.2,85.2,-6.6],[10.8,85.3,-7],[11.4,86.8,-7.6],[12.3,92.4,-8.4],[12.6,94,-8.6],[17.5,94.3,-8.6]]},
 {name:'cb',role:'ata',style:ATA({seed:37,hairStyle:'balding'}),keys:[[-3,64,6],[0,66,4],[6,78,1],[10,88,-1.5],[12,94,-3.4],[12.8,96.2,-4.4],[17.5,98,-3]]},
 {name:'wb',role:'ata',style:ATA({seed:38,hair:[K,.95]}),keys:[[-3,58,18],[0,60,16],[6,76,10],[11,90,5],[17.5,97,4]]},
 {name:'mid',role:'ata',style:ATA({seed:39}),keys:[[-3,44,8],[0,44,7],[5,52,6],[10,70,3],[17.5,86,-1]]},
 {name:'Musso',role:'gk',style:MUSSO,key:true,moves:[{kind:'dive',at:12.95,dur:.8,side:'l'}],keys:[[-3,103.8,-.5],[6,103.5,-1.5],[10,102.6,-3],[11.8,101.3,-4.3],[12.5,100.8,-4.7],[12.8,100.7,-4.8],[17.5,100.7,-4.8]]},
 // Milan: team-mates in support (one runs up the right in hope), Maignan in goal
 {name:'support',role:'acm',style:ACM({seed:21,skin:SKIN_D,hair:K}),keys:[[-3,40,10],[0,42,8],[4,56,6],[8,72,4],[12,88,2],[14,94,1],[17.5,97,6]]},
 {name:'acm2',role:'acm',style:ACM({seed:22,hair:[K,.6]}),keys:[[-3,10,-4],[0,11,-5],[3,18,-6],[17.5,50,-6]]},
 {name:'acm3',role:'acm',style:ACM({seed:23}),keys:[[-3,24,-2],[0,24,-3],[4,38,-4],[17.5,70,-2]]},
 {name:'acm4',role:'acm',style:ACM({seed:24,skin:SKIN_D,hair:K}),keys:[[-3,30,12],[0,31,11],[5,46,9],[17.5,78,8]]},
 {name:'Maignan',role:'gk',style:MAIGNAN,keys:[[-3,3,-3],[0,4,-4],[4,9,-2],[17.5,14,0]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3,28,8],[0,29,7],[5,44,6],[10,66,4],[14,82,6],[17.5,88,6]]},
];
const TH=0,PASSER=1,MUSSO_K=10;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3,T1=17.5,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the cut-out pass, BIG left-foot pushes into the open grass, the finish
/** his stride: one gait cycle per CYC metres; a left-foot push lands as the left foot swings through (gait phase LPH, before the left plant) */
const CYC=4.2,LPH=.42,SHOT=12.75,IN_NET=SHOT+.5;
/** near a defender (and at the pick-up and the finish) he touches it every stride; in the open he pushes it far ahead and sprints after it */
const CLOSE=(tau:number)=>tau<1.1||(tau>1.9&&tau<3)||(tau>6.7&&tau<7.8)||(tau>10&&tau<11.1)||tau>11.9;
const TOUCHES:number[]=(()=>{const out:number[]=[0];let prev=distOf(TH,.2)/CYC-LPH;
 for(let tau=.2;tau<SHOT-.4;tau+=DT){const ph=distOf(TH,tau)/CYC-LPH;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>(CLOSE(tau)?.4:1.2))out.push(tau);prev=ph;}
 return out.concat([SHOT]);})();
/** the first big push into open grass after τ (the replay and the lesson key off it) */
const bigPush=(after:number)=>{for(let i=0;i+1<TOUCHES.length;i++)if(TOUCHES[i]>after&&TOUCHES[i+1]-TOUCHES[i]>1)return i;return 1;};
const NET:V3=[105.4,.22,2.9],REST:V3=[106.4,.11,3.1];
/** Theo's heading: watching the pass come before he cuts it out, then along his run */
function yawT(tau:number):number{const v=velOf(TH,tau),head=Math.hypot(v[0],v[1])>.6?yawOf(v[0],v[1]):0,[x,z]=posOf(TH,tau),b=ballAt(Math.min(tau,-.05));
 if(tau<.25){const face=yawOf(b[0]-x,b[2]-z);return lerpA(face,head,sm(-.15,.25,tau));}
 return head;}
/** his forward and left directions on the ground (x, z) */
const fwdL=(tau:number):[Pt,Pt]=>{const y=yawT(tau);return[[Math.cos(y),-Math.sin(y)],[-Math.sin(y),-Math.cos(y)]];};
/** ball spot for the left foot: ahead and a touch to his left */
const footAt=(tau:number):[number,number]=>{const p=posOf(TH,tau),[f,l]=fwdL(Math.max(.3,tau)),k=clamp(tau/.3);return[p[0]+f[0]*.55*k+l[0]*.14+(1-k)*.35,p[1]+f[1]*.55*k+l[1]*.14-(1-k)*.2];};
const TP:[number,number][]=[];
function ballAt(tau:number):V3{
 const pf=():[number,number]=>{const[x,z]=posOf(PASSER,tau);return[x-.5,z+.3];};
 if(tau<PASS){const[x,z]=pf();return[x,.11,z];}
 if(tau<0){const[x0,z0]=posOf(PASSER,PASS),to=TP.length?TP[0]:[15.9,-19.2],u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.3);return[lerp(x0-.5,to[0],e),.11,lerp(z0+.3,to[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.16*Math.sin(Math.PI*u*.7),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
TP.push(...TOUCHES.map(footAt));
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the interception: the left leg stretched across to cut out the pass, body low, arms out */
const STEP_IN:Partial<Pose>={lHipF:44,lHipA:18,lKnee:30,lAnk:-12,rHipF:-10,rKnee:52,lean:22,bend:-8,lShA:62,rShA:48,lElb:34,rElb:40,neckP:30,squash:-.05};
/** the push: head up, chest proud — the long touch is struck mid-stride with the laces, then he looks at the space, not the ball */
const PUSH:Partial<Pose>={neckP:-6,lean:14};
/** the jink: body dropped and tilted into the change of direction, the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:9*dir,bend:10*dir,lean:22,lKnee:54,rKnee:52,lShA:dir>0?30:70,rShA:dir>0?70:30,neckY:8*dir,squash:-.04});
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(TH,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===TH)yaw=yawT(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ata'?READY:stand();
 if(k===TH){// long, powerful sprinting strides; the left foot pushes the ball on (LPH phase)
  const s=clamp((sp-2)/4.5);p=blendPose(READY,runCycle(distOf(TH,tau)/CYC,{speed:.4+.6*s}),clamp((sp-.4)/1.2));}
 else if(sp>.5&&along<-.35*sp){const bp=runCycle(distOf(k,tau)/2.4,{speed:.2});p=blendPose(idle,bp,clamp((sp-.5)/.8));}
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/3.6,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='kick'){const u=(tau-(mv.at-STRIKE_CONTACT*mv.dur))/mv.dur;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.5}),Math.min(sm(0,.1,u),1-sm(1,1.4,u)));if(tau<mv.at+.2){const t0=TP[0];yaw=yawOf(t0[0]-x,t0[1]-z);}continue;}
  const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='slide'?.42:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='slide'&&u>0){p=slideTackle(Math.min(1,u),{foot:mv.side});yaw=yawOf(NET[0]-x,-2-z);}
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.06});}
 if(k===TH){
  p=over(p,STEP_IN,bump(-.45,.4,tau));
  for(let i=1;i+1<TOUCHES.length;i++)if(TOUCHES[i+1]-TOUCHES[i]>1)p=over(p,PUSH,.6*bump(TOUCHES[i]-.1,TOUCHES[i]+.6,tau));
  p=over(p,CUT(1),bump(2.2,3,tau)*.7);p=over(p,CUT(1),bump(7,7.9,tau));p=over(p,CUT(-1),bump(10.3,11.2,tau));
  const D=.85,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.6}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+.9,tau));
 }
 if(a.name==='support'&&tau>IN_NET+.3)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.3,IN_NET+.8,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print (paper, navy panel marks)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 pan.addPath(pent(x+Math.cos(rot)*r*.12,y+Math.sin(rot)*r*.12,r*.3,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9,r*.26,a));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 // replay cameras sit low among the players: an extra right in the lens (closer than 6 m) is left out so it never hides the move
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(hero&&!a.key?6:1.2))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (low May evening sun from the west: long, cast toward +X); big figures cast their own
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.1,e.g[1],e.h*.2,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg&&inView(v,bg,br))ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===TH?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===TH||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===TH}:{});
  if(e.k===TH)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replay and the lesson
/** the space in front of him: a yellow wash on the empty grass ahead (from x0, growing w, `len` metres deep, `half` metres wide) */
function spaceAhead(s:Sheet,c:Cam,tau:number,w:number,len=26,half=9){if(w<=0)return;const[x,z]=posOf(TH,tau),x0=x+1.2,x1=x0+len*easeOut(clamp(w*1.3));
 const q=polyP(c,[[x0,.01,z-half*.5],[x1,.01,z-half],[x1,.01,z+half],[x0,.01,z+half*.5]]);if(q.length<3)return;const p=polyPath(q,true);s.knockout(p,.35*w);s.tone(Y,p,.62*w);}
/** the push: a yellow dashed arrow on the grass from touch i to where the ball will be met (touch i+1) */
function pushArrow(s:Sheet,c:Cam,i:number,w:number){if(w<=0||i+1>=TP.length)return;const a=TP[i],b=TP[i+1],pa=pr(c,[a[0],.05,a[1]]),pb=pr(c,[b[0],.05,b[1]]);if(!pa||!pb)return;
 const d=toCam(c,[(a[0]+b[0])/2,0,(a[1]+b[1])/2])[2],wd=Math.max(5,c.F*.22/Math.max(1,d));
 s.knockout(ribbon([pa,pb],wd*1.8,{seed:66,taper:.1,wobble:.8,gaps:[]}),.7*w);laneArrow(s,Y,pa,pb,wd,{progress:w,seed:67,head:wd*3,dashed:true});}
/** his run on to it: a red lane from where he is at τa to the next touch spot (progress w) */
function runLane(s:Sheet,c:Cam,ta:number,tb:number,w:number,width=.45){if(w<=0)return;
 const pts:Pt[]=[];let d=1;const n=30;for(let i=0;i<=n;i++){const tau=lerp(ta,lerp(ta,tb,clamp(w)),i/n),[x,z]=posOf(TH,tau),q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(5,c.F*width/d);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.1,wobble:.8}),.8);s.fill(R,ribbon(pts,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** "far ahead": a gap bracket on the grass between his boots and the rolling ball (two end ticks and a line) */
function gapBracket(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(TH,tau),b=ballAt(tau),p0=pr(c,[x+.4,.02,z+1.3]),p1=pr(c,[b[0],.02,b[2]+1.3]);if(!p0||!p1)return;
 const d=toCam(c,[x,0,z])[2],u=Math.max(4,c.F*.12/Math.max(1,d)),p=new Path2D(),t0=pr(c,[x+.4,.02,z+.7]),t1=pr(c,[b[0],.02,b[2]+.7]);
 p.addPath(ribbon([p0,[lerp(p0[0],p1[0],w),lerp(p0[1],p1[1],w)]],u,{seed:72,taper:0,wobble:.6}));if(t0)p.addPath(ribbon([t0,p0],u,{seed:73,taper:0}));if(t1&&w>.95)p.addPath(ribbon([t1,p1],u,{seed:74,taper:0}));
 s.knockout(p,.8);s.fill(Y,p,.95);}
/** touch spots: a yellow blot on the grass at every touch already played (far apart in the open), a spark as each lands */
function touchMarks(s:Sheet,c:Cam,tau:number,w:number,from=0){if(w<=0)return;
 const dots=new Path2D();let any=false;
 TOUCHES.forEach((T,i)=>{if(T<from||T>tau||T>=SHOT)return;const[x,z]=TP[i],q=toCam(c,[x,0,z]);if(q[2]<1)return;const g=scr(c,q),r=c.F*.2/q[2];
  dots.addPath(polyPath(blob(g[0],g[1],r,r*.42,i+3,{amp:.08,n:12}),true));any=true;
  const age=tau-T;if(age<.3){const b=pr(c,[x,.12,z]);if(b)sparkBurst(s,Y,b[0],b[1],c.F*.5/q[2],{n:7,seed:i+9,g:easeOutBack(clamp(age/.1))*(1-clamp((age-.18)/.12)),width:Math.max(4,c.F*.035/q[2]),cov:.95*w});}});
 if(any){s.knockout(dots,.8*w);s.fill(Y,dots,.9*w);}
}
/** speed lines streaming off him */
function speedLines(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(TH,tau),q=pr(c,[x,1,z]),q2=pr(c,[x+1,1,z]);if(!q||!q2)return;
 const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),Z=c.F/toCam(c,[x,1,z])[2],p=new Path2D();
 for(let k=0;k<3;k++){const oy=(k-1)*Z*.45,ox=Z*(.7+k*.2);p.addPath(ribbon([[q[0]-Math.cos(dir)*ox,q[1]+oy],[q[0]-Math.cos(dir)*(ox+Z*(1.1+.3*k)),q[1]+oy]],Z*.05,{seed:9+k,taper:.9,wobble:.5}));}
 s.fill(K,p,.6*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, ~1–1.5× real time
const tau1=(t:number)=>key(t,[[0,-2],[CUEW(0,'Theo'),-.8],[CUEW(0,'picks up'),0],[CUEW(0,'his own box'),.55],[CUEW(0,'and off'),1.2],[CUEW(0,'Past one'),2.75],[CUEW(0,'past another'),7.45],[CUEW(0,'still running'),8.8],[CUEW(0,'into their box'),11.15],[CUEW(0,'goal'),IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-CUEW(0,'goal')]],linear);
const CAM1:V3=[52.5,27,78];
function cam1(t:number):Cam{
 const G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // lead the ball a little (the cameraman gives him room to run into), settle on him for the celebration
 const m=posOf(TH,tau),cel:V3=[m[0]-1.5,1.1,m[1]],lead=sm(.8,2,tau)*(1-sm(11,12.5,tau))*5;
 const T=lerp3([bt[0]+lead,1.4,bt[2]],cel,sm(G+.4,G+1.4,t,easeInOutSine));
 const F=key(t,[[0,5800],[CUEW(0,'picks up'),7600],[CUEW(0,'and off'),7200],[CUEW(0,'Past one'),7400],[CUEW(0,'into their box'),7600],[G,7600],[G+1.4,8400],[S,8600]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(TH,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: the empty grass, one big push and the sprint on to it, again and again
const P2=bigPush(3);
const whip2=(t:number)=>{const w=CUEW(1,'again and again');return sm(w-.5,w+.2,t,easeInOutSine);};
const tau2=(t:number)=>{const w=CUEW(1,'again and again'),T=TOUCHES[P2],N=TOUCHES[P2+1];return key(t,[[0,T-2.2],[CUEW(1,'See all'),T-1.3],[CUEW(1,'empty grass'),T-.8],[CUEW(1,'He pushes'),T-.1],[CUEW(1,'far ahead'),T+.3],[CUEW(1,'and sprints'),lerp(T,N,.55)],[CUEW(1,'on to it'),N-.05],[w-.5,N+.35],[w+.2,N+3.2],[SECS(1),N+4.6]],linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(TH,tau),w=whip2(t),sa=CUEW(1,'See all'),hp=CUEW(1,'He pushes'),b=ballAt(tau);
 const behind=sm(sa-.5,sa+.3,t,easeInOutSine)*(1-sm(hp-.6,hp,t,easeInOutSine)),side=sm(hp-.6,hp,t,easeInOutSine);
 // close and low on the near side as the replay opens → behind him, over the empty grass → side-on, wide enough for him AND the ball ahead → tracking pan
 let C:V3=[m[0]-3,1.5,m[1]+8.5],T:V3=[m[0]+1.5,.9,m[1]];let F=2600;
 C=lerp3(C,[m[0]-7.5,2.6,m[1]+2.5],behind);T=lerp3(T,[m[0]+14,.5,m[1]-.5],behind);F=lerp(F,2100,behind);
 const mid=(m[0]+Math.max(m[0],b[0]))/2;
 C=lerp3(C,[mid-1,1.7,m[1]+15.5],side);T=lerp3(T,[mid+.6,.8,m[1]],side);F=lerp(F,1700,side);
 C=lerp3(C,[m[0]-2,2,m[1]+13],w);T=lerp3(T,[m[0]+3,.9,m[1]],w);F=lerp(F,2100,w);
 return look(C,T,F);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),sa=CUEW(1,'See all'),eg=CUEW(1,'empty grass'),hp=CUEW(1,'He pushes'),fa=CUEW(1,'far ahead'),as=CUEW(1,'and sprints'),ot=CUEW(1,'on to it'),ag=CUEW(1,'again and again'),w=whip2(t),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const off=1-sm(ag-.5,ag-.2,t);
  spaceAhead(s,c,Math.min(tau,TOUCHES[P2]),sm(eg-.3,eg+.5,t)*(1-sm(ot,ot+.4,t)),30,10);
  pushArrow(s,c,P2,sm(hp-.1,hp+.5,t,easeOut)*off);
  runLane(s,c,TOUCHES[P2],TOUCHES[P2+1],sm(as-.25,ot,t,easeInOutSine)*off,.35);
  touchMarks(s,c,tau,sm(ag-.3,ag+.2,t)*(1-sm(E-.9,E-.5,t)),TOUCHES[P2]);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   gapBracket(s,c,tau,sm(fa-.15,fa+.4,t,easeOut)*(1-sm(as+.2,as+.6,t)));
   // the push and the meeting: a spark on his left boot at each
   for(const [T0,cueT] of [[TOUCHES[P2],hp],[TOUCHES[P2+1],ot]] as [number,number][]){const age=tau-T0;if(hero&&age>-.05&&age<.35){const f=hero.joints.lToe;sparkBurst(s,Y,f[0],f[1],c.F*.55/Math.max(1,toCam(c,[posOf(TH,T0)[0],.3,posOf(TH,T0)[1]])[2]),{n:8,seed:81+Math.round(cueT),g:easeOutBack(clamp((age+.05)/.15))*(1-clamp((age-.2)/.15)),width:9});}}
   speedLines(s,c,tau,sm(as-.2,as+.3,t)*(1-sm(ot-.1,ot+.2,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,Math.sin(Math.PI*w),27,.04);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the low angled finish past Musso, then the celebration
const tau3=(t:number)=>{const s=CUEW(2,'slots'),w=CUEW(2,'A week');return key(t,[[0,11],[CUEW(2,'metres'),11.6],[s,SHOT-.15],[CUEW(2,'past keeper'),SHOT+.2],[CUEW(2,'Juan'),IN_NET+.05],[w,IN_NET+1.2],[SECS(2),IN_NET+1.2+(SECS(2)-w)*.8]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'Juan');return sm(a+.4,CUEW(2,'A week')+.6,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(TH,tau),e=sm(SHOT-.3,IN_NET+.2,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'Milan were')-.3,SECS(2),t,easeInOutSine);
 const C0:V3=[117.5,6.2,-3.5+1.5*e],T0:V3=[lerp(m[0],100.5,e),lerp(.9,1,e),lerp(m[1]*.85,-2,e)];
 const C1:V3=[m[0]-7-1.5*hold,2+1.2*hold,m[1]+8+1.5*hold],T1:V3=[m[0]+.6,1.2+1.2*hold,m[1]-1];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3900+300*sm(0,CUEW(2,'slots'),t),3300-500*hold,u)*(1-.28*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),sl=CUEW(2,'slots'),pk=CUEW(2,'past keeper'),jm=CUEW(2,'Juan'),mw=CUEW(2,'Milan were'),u=swing3(t);
  stadium(s,c,v,t,{roar:Math.max(sm(IN_NET,IN_NET+.3,tau),sm(mw-.2,mw+.4,t)),flash:Math.max(sm(jm-.1,jm+.3,t)*(1-sm(jm+1,jm+1.4,t)),sm(mw-.1,mw+.3,t))});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({bg})=>{
   // "slots it low": the ball's low, angled line across Musso to the far post
   const lw=sm(sl-.2,sl+.35,t,easeOut)*(1-sm(jm+.5,jm+1,t));
   if(lw>0){const a=TP[TP.length-1],pa=pr(c,[a[0],.12,a[1]]),pb=pr(c,[NET[0],.2,NET[2]]);if(pa&&pb){const wd=c.F*.08/Math.max(1,toCam(c,[100,0,0])[2]);laneArrow(s,Y,pa,pb,Math.max(4,wd),{progress:lw,seed:89,head:Math.max(10,wd*3),dashed:true});}}
   // "past keeper Juan Musso": a red ring round the gap between his glove and the ball
   const rw=sm(pk-.2,pk+.25,t,easeOutBack)*(1-sm(jm+.6,jm+1.1,t));
   if(rw>0){const[mx,mz]=posOf(MUSSO_K,SHOT+.2),r=groundRing(c,mx+.3,mz+2.4,1.1*rw,.9*rw,.08,90);if(r){s.knockout(r,.85);s.fill(R,r,.95);}}
   if(bg&&tau>SHOT&&tau<SHOT+.12)sparkBurst(s,Y,bg[0],bg[1],60,{n:7,seed:90,width:8});}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(TH,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised three-quarter camera behind him on an open stretch
const P4=bigPush(4.5);
const tau4=(t:number)=>{const T=TOUCHES[P4],N=TOUCHES[P4+1];return key(t,[[0,T-1.6],[CUEW(3,'when'),T-1.2],[CUEW(3,'in front'),T-.6],[CUEW(3,'push'),T-.08],[CUEW(3,'run into'),lerp(T,N,.45)],[SECS(3)-.6,N+.35],[SECS(3),N+.6]],linear);};
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(TH,tau),push=sm(CUEW(3,'push')-.4,CUEW(3,'push')+.3,t,easeInOutSine);
 const C:V3=[m[0]-9+2*push,5-1*push,m[1]+8.5-1.5*push],T:V3=[m[0]+6+2*push,.3,m[1]-1];
 return look(C,T,2100+250*push);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),ws=CUEW(3,'when'),fy=CUEW(3,'in front'),pb=CUEW(3,'push'),ri=CUEW(3,'run into'),E=SECS(3),T=TOUCHES[P4];
  stadium(s,c,v,t);
  ground(s,c);
  spaceAhead(s,c,Math.min(tau,T),sm(ws-.1,ws+.6,t)*(1-sm(E-.9,E-.5,t)),24,9);
  pushArrow(s,c,P4,sm(pb-.1,pb+.55,t,easeOut)*(1-sm(E-.9,E-.5,t)));
  runLane(s,c,T,TOUCHES[P4+1],sm(ri-.3,ri+.7,t,easeInOutSine)*(1-sm(E-.9,E-.5,t)),.4);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "in front of you": a yellow sight line from his eyes over the space
   const lw=sm(fy-.1,fy+.4,t,easeOut)*(1-sm(pb+.3,pb+.7,t));
   if(hero&&lw>0){const[x,z]=posOf(TH,tau),q=pr(c,[x+18,.4,z]);if(q){const h=hero.joints.head,n=hero.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])+4;s.knockout(ribbon([h,q],u*.7,{seed:71,taper:.1}),.7*lw);laneArrow(s,Y,h,q,u*.4,{progress:lw,seed:71,head:u*1.4,dashed:true});}}
   const age=tau-T;if(hero&&age>-.05&&age<.35){const f=hero.joints.lToe;sparkBurst(s,Y,f[0],f[1],c.F*.5/Math.max(1,toCam(c,[posOf(TH,T)[0],.3,posOf(TH,T)[1]])[2]),{n:8,seed:95,g:easeOutBack(clamp((age+.05)/.15))*(1-clamp((age-.2)/.15)),width:9});}
   speedLines(s,c,tau,sm(ri-.1,ri+.4,t)*(1-sm(E-.8,E-.4,t)));}});
 },
 still:4.2,
};

const film:RisoStory={
 id:'theo-hernandez-signature',format:'11v11',title:"Theo Hernández's Run From His Own Box",theme:'When there is space in front of you, push the ball ahead and run into it',
 ageNote:'Serie A, AC Milan v Atalanta, San Siro, Milan, 15 May 2022. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of turf — grass bits and dust thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and red dust thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
