/** Eden Hazard v Arsenal, Premier League, Stamford Bridge, London, Saturday 4 February 2017 (Chelsea 3–1 Arsenal): the 53rd-minute solo
 * goal. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (the footage was not reviewed),
 * printed as a riso sheet. The lesson: protect the ball with your body, stay low and balanced, change pace.
 *
 * SOURCES (read Sept 2026 as raw pages, cached in the session scratchpad films/src-cache/):
 *  - The Guardian, Daniel Taylor, "Eden Hazard mesmerises Arsenal to tighten Chelsea's Premier League grip" (4 Feb 2017)
 *    https://www.theguardian.com/football/2017/feb/04/chelsea-arsenal-premier-league-match-report
 *    ("Hazard had waltzed through the visitors' defence to make it 2-0"; "Hazard eluded four Arsenal players before aiming his shot past
 *    Cech ... his 40-yard slalom began with one of the smallest players on the pitch outmuscling Francis Coquelin"; Conte crowd-surfed)
 *  - The Guardian, Rob Smyth, "Chelsea 3-1 Arsenal: Premier League – as it happened" (4 Feb 2017)
 *    https://www.theguardian.com/football/live/2017/feb/04/chelsea-arsenal-premier-league-live
 *    ("GOAL! Chelsea 2-0 Arsenal (Hazard 53)"; "Hazard picked the ball up just inside his own half and set off towards goal. He swerved
 *    away from Koscielny, held off Coquelin and continued to zoom towards goal. Koscielny got back but Hazard wriggled past him in the area
 *    and crunched the ball over Cech from close range"; "The close control and balance of Hazard were just wonderful"; goal logged 13:43 UK)
 *  - BBC Sport, Phil McNulty, "Chelsea 3-1 Arsenal" (4 Feb 2017) https://www.bbc.com/sport/football/38779302 ("a magnificent solo goal
 *    eight minutes after half-time, leaving a trail of Arsenal players in his wake in a run from the halfway line before beating Petr
 *    Cech"; referee Martin Atkinson; man of the match Hazard)
 *  - Sky Sports, Richard Morgan, "Chelsea 3-1 Arsenal: Eden Hazard wonder strike" https://www.skysports.com/football/chelsea-vs-arsenal/report/356565
 *    ("picked up possession inside his own half ... a solo run that took him past Laurent Koscielny, Francis Coquelin - who was left on the
 *    floor - and then the Arsenal captain again, before driving the ball past Cech from close range"; attendance 41,490; line-ups)
 *  - Wikipedia, "2016–17 Chelsea F.C. season" (4 Feb, 3–1 at home, "a magnificent solo goal in the 8th minute of second half") and
 *    "Eden Hazard" (1.73 m; "flair, balance, agility, and low centre of gravity"; uses both feet; Chelsea Goal of the Year 2016–17)
 *  - Wikimedia Commons, "Ngolo Kante, Mesut Ozil 2017.jpg" (photo by Debs Coady, dated 4.2.17 13:17, taken at this match): KITS.
 * CONFIRMED by those accounts: date, venue, score, 53rd minute (the second goal, 2–0), an early-afternoon kick-off in daylight (overcast
 *  in the photo); Hazard picked the ball up just inside his own half (the halfway line); he held off / outmuscled Coquelin, who was left
 *  on the floor; he swerved away from Koscielny; Koscielny got back and Hazard wriggled past him again in the area; a close-range finish
 *  driven past (over) Petr Čech; a run of about 40 yards past three or four Arsenal players; Arsenal's line-up (Čech, Bellerín → Gabriel,
 *  Mustafi, Koscielny, Monreal, Coquelin, Oxlade-Chamberlain, Iwobi, Walcott, Özil, Alexis Sánchez) and Chelsea's (Courtois; Azpilicueta,
 *  David Luiz, Cahill; Moses, Kanté, Matić, Alonso; Pedro, Diego Costa, Hazard); referee Martin Atkinson. KITS (the photo): Chelsea in
 *  the home kit — royal-blue shirt and shorts, white socks; Arsenal in their home kit — red shirt with WHITE sleeves, white shorts, red
 *  socks with white tops. Hazard 1.73 m with a low centre of gravity.
 * WIDELY KNOWN, NOT RE-READ THIS SESSION: shirt numbers (Hazard 10, Koscielny 6, Coquelin 34, Čech 33); Čech's black protective headguard
 *  (drawn as a dark cap of "hair"); Hazard's short dark hair and stubble; Koscielny was Arsenal's captain that day (Sky: "the Arsenal
 *  captain").
 * INFERRED (illustrative): every position and timing in metres and seconds (the run ≈ 45 m in ≈ 8.5 s, slow through the shoulder-to-
 *  shoulder with Coquelin, then fast); how the ball reached him (drawn: a short pass from an unnamed team-mate behind him); the ORDER of the
 *  first beats (drawn: Coquelin at his shoulder from the first touch, a swerve away from Koscielny stepping out, then Coquelin going down —
 *  the accounts list both orders); which side each defender stood (Coquelin on his left, so the ball is on his right foot away from him; Koscielny stepping out from his right);
 *  that he dribbled and shot with his RIGHT foot (he is two-footed; never narrated); the channel of the run (left of centre as he attacks)
 *  and which way he shifted past Koscielny (drawn: a feint in, then out to his left); the corner of the finish (drawn rising over Čech toward the near half of the goal); Čech's
 *  goalkeeper kit colours (yellow-green, navy shorts); the ball design (plain white with navy panels); the referee's dark kit; the other
 *  players' positions; Stamford Bridge drawn as four close two-tier stands with a band of boxes and a roof, blue seats, the away fans in
 *  one end corner (red); the direction of play on screen; the camera placements; the celebration run.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 *  time, panning with the ball; 2 = slow-motion replay from a low touchline camera on the ball side: the shoulder-to-shoulder with Coquelin
 *  (a yellow shield line between defender and ball), low and strong (a press-down arrow, a base), Coquelin on the floor, the burst of pace
 *  (pace ticks on the grass stretch apart); 3 = replay from behind the goal: the shift past Koscielny and the finish over Čech, then a swing
 *  round to the celebration; 4 = the lesson from a low front camera on the Coquelin beat (ball ring, shield line, low arrow, base, pace
 *  ticks). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer() (which also prints
 *  Arsenal's white sleeves). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film;
 *  every random value is seeded. Budget ≈ 200–320 plate ops per frame (like the approved films). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,slideTackle,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`hazard film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead runs scripts/plays/kokoro-narrate.py hazard-arsenal-2017 (writes timing.json next to script.json). Then
 * replace this null with `import timingJson from '../../../public/plays/narration/hazard-arsenal-2017/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/hazard-arsenal-2017/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The goal, live','Chelsea versus Arsenal, 2017. Eden Hazard gets the ball near halfway. He shrugs off Coquelin, and away he goes, faster and faster! Into the box, past Koscielny... goal!',
  ['Chelsea versus Arsenal','Eden Hazard','gets the ball','near halfway','shrugs off Coquelin','away he goes','faster and faster','Into the box','past Koscielny','goal']),
 prov('Slow motion','Slow motion: he puts his body between the ball and the defender. Low and strong, he stays on his feet, then bursts away.',
  ['Slow motion','he puts his body','between the ball','Low and strong','stays on his feet','bursts away']),
 prov('Past the keeper','A quick shift past Koscielny, and he drives it past Petr Čech!',
  ['A quick shift','past Koscielny','drives it','past Petr Čech']),
 prov('Your turn','Your turn: protect the ball with your body, keep low and balanced, then change pace to leave defenders behind.',
  ['Your turn','protect the ball','your body','keep low','balanced','change pace','leave defenders behind']),
],VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('hazard: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit.
 * Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Chelsea attack +X, Arsenal's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. */
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
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the ground: near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Stamford Bridge: four close two-tier stands, a band of boxes, a roof
const CX=52.5,NS=64;
/** a point on the (nearly rectangular) stand ring: angle th round the pitch centre, d metres out from the inner edge, height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(57+d)*Math.sign(c)*Math.pow(Math.abs(c),.14),y,(39+d)*Math.sign(s)*Math.pow(Math.abs(s),.14)];}
const LOW=(b:number):[number,number]=>[1.5+19*b,1.2+10*b],UP=(b:number):[number,number]=>[22+15*b,14.2+11*b];
type Ring={low:V3[][];box:V3[][];up:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number;away:boolean}[]};
const RING:Ring=(()=>{const o:Ring={low:[],box:[],up:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.box.push([rim(a,20.5,11.2),rim(b,20.5,11.2),rim(b,22,14.2),rim(a,22,14.2)]);
  o.roof.push([rim(a,19,29),rim(b,19,29),rim(b,40,27),rim(a,40,27)]);
  o.fascia.push([rim(a,19,27.6),rim(b,19,27.6),rim(b,19,29.4),rim(a,19,29.4)]);
  // the away fans: one corner of the lower tier behind the goal Chelsea defend (−X end, far side; inferred)
  const away=(i>=34&&i<=39);
  for(const [f,rows,up] of [[LOW,8,false],[UP,6,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),17);if(h<.14)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away:away&&!up});}}
 return o;})();
/** everything behind the pitch: an overcast February sky, the stands, the crowd (roar lifts the seat marks) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number}={}){
 const{roar=0}=o;
 // London, early afternoon in February: a pale grey-blue overcast sky
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.16);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.08);
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),fas=new Path2D(),win=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
  add(RING.low[i],low);add(RING.up[i],up);add(RING.box[i],box);add(RING.roof[i],roof);add(RING.fascia[i],fas);
  const bq=RING.box[i],w=quadP(c,[lerp3(bq[0],bq[1],.15),lerp3(bq[0],bq[1],.85),lerp3(bq[3],bq[2],.85),lerp3(bq[3],bq[2],.15)].map((p,j)=>[p[0],j<2?12:13.6,p[2]] as V3));if(w)win.addPath(polyPath(w,true));}
 // Chelsea blue seats in both tiers
 s.knockout(low);s.tone(B,low,.62);s.tone(K,low,.12);
 s.knockout(up);s.tone(B,up,.66);s.tone(K,up,.22);
 // the crowd: one mark per seat group, sized by distance; faces (paper), Chelsea blue, dark coats, the red away corner
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of RING.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.away?(q.h<.4?0:q.h<.85?1:3):q.h<.4?0:q.h<.78?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.9);s.fill(B,inks[2],.9);s.fill(K,inks[3],.8);
 s.tone(K,up,.14);
 s.knockout(box);s.fill(K,box,.82);s.knockout(win,.55);
 s.knockout(roof);s.tone(K,roof,.55);s.tone(B,roof,.35);
 s.knockout(fas);s.fill(K,fas,.5);
}
/** the green surround, grass (yellow × blue) with mowing stripes, LED boards, paper lines, both goals (the Arsenal goal drawn later
 * when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;ballY?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.7);s.tone(B,p,.8);s.tone(K,p,.18);}
 const g=polyP(c,[[-5,0,-37],[110,0,-37],[110,0,37],[-5,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // LED boards: far touchline and behind both goals, navy with paper and blue panels
 const bd=new Path2D(),pn=new Path2D(),pb=new Path2D();
 for(const q of [polyP(c,[[-4,0,-36.5],[109,0,-36.5],[109,.9,-36.5],[-4,.9,-36.5]]),polyP(c,[[108,0,-36],[108,0,36],[108,.9,36],[108,.9,-36]]),polyP(c,[[-3,0,36],[-3,0,-36],[-3,.9,-36],[-3,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.45],[x+3.4,.25,-36.45],[x+3.4,.65,-36.45],[x,.65,-36.45]]);if(q.length>2)(k%2?pb:pn).addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[107.95,.25,z],[107.95,.25,z+3.4],[107.95,.65,z+3.4],[107.95,.65,z]]);if(q.length>2)(k%2?pb:pn).addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(B,pb,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0,1);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-2,o.ballY??1.2);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, ballY) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2))*Math.exp(-Math.pow((y-by)/1.4,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh);for(let j=0;j<3;j++){const ya=1.9*(1-j/3),yb=1.9*(1-(j+1)/3);seg3(c,[back(z,ya),ya,z],[back(z,yb),yb,z],.025,mesh);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.3],[R,.2]];
const SKIN_T:InkFill[]=[[Y,.4],[R,.3],[K,.08]];
const SKIN_D:InkFill[]=[[R,.42],[K,.5]];
/** Chelsea 2016–17 home (confirmed by the match photo): royal-blue shirt and shorts, white socks; white numbers */
const CHE=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:'paper',boots:K,trim:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:3,...o});
/** Eden Hazard: number 10, 1.73 m, stocky and low (thick thighs), short dark hair */
const HAZARD_STYLE=CHE({number:10,build:{height:1.73,bulk:1.1,thighs:1.2,head:1.03},seed:10});
/** Arsenal 2016–17 home (confirmed by the match photo): red shirt with white sleeves (printed by the adapter), white shorts, red socks */
const ARS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,trim:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
/** Petr Čech: goalkeeper kit colours inferred (yellow-green shirt, navy shorts); the black headguard as a dark cap */
const CECH:AthleteStyle={shirt:[Y,.95],shorts:[K,.85],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:33,numberInk:K,build:{height:1.96},seed:51};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.5],hairStyle:'bald',line:K,seed:12};
const SLEEVED=new WeakSet<AthleteStyle>();
const ars=(o:Partial<AthleteStyle>={})=>{const st=ARS(o);SLEEVED.add(st);return st;};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs.
 * Arsenal's white sleeves: the athlete prints one shirt ink, so after the body the adapter knocks the upper arms back to paper (only the
 * arms on the camera side of the chest, so a sleeve never prints over the torso it is behind). */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;sleeves?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.sleeves&&r.detail!=='low'&&r.heightPx>40){const sk=r.sk,J=r.joints,dc=camera.project(sk.chest)[2],p=new Path2D();let n=0;
  for(const [sh,el] of [['lSh','lEl'],['rSh','rEl']] as const){if(camera.project(sk[sh])[2]>dc+.06)continue;const a=J[sh],b=J[el],e:Pt=[lerp(a[0],b[0],.62),lerp(a[1],b[1],.62)],w=Math.hypot(J.head[0]-J.neck[0],J.head[1]-J.neck[1])*.62+1.5;
   p.addPath(ribbon([[lerp(a[0],b[0],-.08),lerp(a[1],b[1],-.08)],e],w,{taper:0,wobble:.3,seed:7}));n++;}
  if(n)s.knockout(p,.95);}
 return r;
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Hazard's first touch)
type Role='hazard'|'ars'|'gk'|'che'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a fall to the floor (down from `at`) */
type Move={kind:'lunge'|'dive'|'fall';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The Arsenal players named in the accounts get the beats the accounts give
 * them (Coquelin at the pick-up and on the floor, Koscielny stepping out and again in the area, Čech); where exactly each stood is inferred. */
const ACTORS:Actor[]=[
 {name:'Hazard',role:'hazard',style:HAZARD_STYLE,key:true,keys:[[-3,46.5,-9.5],[-1.5,48.8,-8.4],[-.4,50.4,-7.5],[0,51,-7.2],[.5,51.9,-7],[1,53.4,-6.7],[1.4,55.1,-6.9],[1.8,57.3,-6.7],[2.2,59.8,-6.3],[2.6,62.4,-5.9],[3.4,67.5,-5.3],[4.2,72.7,-4.8],[5,77.9,-4.4],[5.8,83,-4.2],[6.5,87.3,-4.1],[7,90,-3.7],[7.35,91.6,-4.3],[7.7,93.1,-5.3],[8.1,94.7,-5],[8.45,95.9,-4.6],[8.9,97,-4.4],[9.6,98.4,-5.4],[11,98.4,-9.5],[12.5,97,-15],[14,95.5,-20],[16,94,-25]]},
 {name:'Matic',role:'che',style:CHE({seed:21,build:{height:1.94}}),keys:[[-3,41.5,-13.5],[-1.2,43,-13],[0,44,-12.5],[4,50,-10],[16,68,-6]]},
 {name:'Coquelin',role:'ars',style:ars({seed:34,number:34}),key:true,engage:[-.6,2.1],moves:[{kind:'fall',at:2.15,dur:.9,side:'l'}],keys:[[-3,51.5,-12.5],[-1.2,50.6,-9.9],[-.3,50.3,-8.6],[0,50.6,-8.2],[.5,51.6,-8],[1,53,-7.9],[1.5,54.5,-8.1],[1.95,56,-8.2],[2.3,56.8,-8.3],[2.8,57.1,-8.3],[16,57.2,-8.3]]},
 {name:'Koscielny',role:'ars',style:ars({seed:6,number:6,hair:K}),key:true,engage:[.2,1.7],moves:[{kind:'lunge',at:1.55,dur:.8,side:'r'},{kind:'lunge',at:7.4,dur:.8,side:'r'}],keys:[[-3,62,-2],[-1,59.8,-3.2],[0,58.3,-3.8],[.7,57.2,-4.4],[1.3,56.6,-4.9],[1.8,57.4,-4.4],[2.5,60.6,-3.7],[3.5,66.8,-3.3],[4.5,73.2,-3.2],[5.5,79.6,-3.2],[6.5,86.8,-2.5],[7,89.6,-2.6],[7.4,91.2,-3.2],[7.9,92.2,-3.7],[8.5,93.4,-3.9],[9.5,94.4,-3.8],[16,95,-3.6]]},
 {name:'Cech',role:'gk',style:CECH,key:true,moves:[{kind:'dive',at:8.72,dur:.8,side:'r'}],keys:[[-3,103.5,.5],[5,102.8,-1],[7.2,101.9,-2],[8.2,101,-2.6],[8.5,100.8,-2.9],[16,100.8,-2.9]]},
 {name:'Mustafi',role:'ars',style:ars({seed:20,build:{height:1.84}}),keys:[[-3,68,3],[2,72,3.5],[5,84,2],[7,91.5,1.2],[8.5,95.8,1],[16,97,0]]},
 {name:'Monreal',role:'ars',style:ars({seed:18}),keys:[[-3,63,17],[3,72,14],[7,86,9],[9,92,7],[16,96,5]]},
 {name:'Gabriel',role:'ars',style:ars({seed:5,skin:SKIN_T}),keys:[[-3,60,-24],[3,68,-20],[7,82,-15],[16,92,-12]]},
 {name:'Ozil',role:'ars',style:ars({seed:11}),keys:[[-3,47,5],[3,54,4],[8,64,2],[16,72,0]]},
 {name:'Iwobi',role:'ars',style:ars({seed:17,skin:SKIN_D}),keys:[[-3,43,15],[8,58,12],[16,66,10]]},
 {name:'Sanchez',role:'ars',style:ars({seed:7,skin:SKIN_T}),keys:[[-3,38,-1],[8,48,-2],[16,56,-2]]},
 {name:'Walcott',role:'ars',style:ars({seed:14,skin:SKIN_T}),keys:[[-3,41,-25],[8,56,-18],[16,64,-15]]},
 {name:'Oxlade',role:'ars',style:ars({seed:15,skin:SKIN_T}),keys:[[-3,47,-19],[8,62,-14],[16,70,-11]]},
 {name:'Costa',role:'che',style:CHE({seed:19,skin:SKIN_T,build:{height:1.86}}),keys:[[-3,61,2],[3,70,3],[6,84,3],[8.4,93.5,2.8],[9.5,97,.5],[11,97.5,-6],[16,95,-18]]},
 {name:'Pedro',role:'che',style:CHE({seed:17,skin:SKIN_T}),keys:[[-3,57,20],[4,70,17],[8,88,11],[11,95,2],[16,94,-14]]},
 {name:'Moses',role:'che',style:CHE({seed:15,skin:SKIN_D}),keys:[[-3,51,-29],[8,76,-24],[16,88,-22]]},
 {name:'Alonso',role:'che',style:CHE({seed:3}),keys:[[-3,46,27],[8,66,24],[16,76,20]]},
 {name:'Kante',role:'che',style:CHE({seed:7,skin:SKIN_D,build:{height:1.68}}),keys:[[-3,45,5],[8,58,2],[16,66,0]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3,52,6],[6,72,4],[12,86,-2],[16,88,-4]]},
];
const HZ=0,MATIC=1,COQ=2,KOS=3,CECH_I=4;
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

// ---------------------------------------------------------------- the ball: a pass in, right-foot touches, the shift, the finish
/** his dribble stride: one right-foot touch per cycle of CYC metres (the touch lands at the gait's touchPhase) */
const CYC=2.1,SHOT=8.5,IN_NET=SHOT+.3,PASS=-1.1;
/** the touches: every stride, plus the forced beats — the pick-up, close touches through the shoulder-to-shoulder, the swerve from Koscielny, the feint in and the shift out in the area */
const TOUCHES:number[]=(()=>{const forced=[0,.45,.9,1.25,7,7.33,7.68],out:number[]=[];let prev=distOf(HZ,0)/CYC-touchPhase;
 for(let tau=DT;tau<SHOT-.3;tau+=DT){const ph=distOf(HZ,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&forced.every(f=>Math.abs(f-tau)>.22)&&(!out.length||tau-out[out.length-1]>.22))out.push(tau);prev=ph;}
 return[...out,...forced].sort((a,b)=>a-b).concat([SHOT]);})();
function yawHZ(tau:number):number{const v=velOf(HZ,tau);return Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):0;}
/** his forward and left directions on the ground (x, z) */
const fwdL=(tau:number):[Pt,Pt]=>{const y=yawHZ(tau);return[[Math.cos(y),-Math.sin(y)],[-Math.sin(y),-Math.cos(y)]];};
/** ball spot for the right foot: ahead and a touch to his right (away from Coquelin on his left) */
const footAt=(tau:number):[number,number]=>{const p=posOf(HZ,tau),[f,l]=fwdL(tau),side=tau<2.2?.26:.12;return[p[0]+f[0]*.5-l[0]*side,p[1]+f[1]*.5-l[1]*side];};
const TP=TOUCHES.map(footAt);
const NET:V3=[105.3,2.05,-1.9],REST:V3=[106.2,.11,-1.8];
function ballAt(tau:number):V3{
 if(tau<PASS){const x=posOf(MATIC,tau);return[x[0]+.45,.11,x[1]];}
 if(tau<0){const x=posOf(MATIC,PASS),u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.5),to=footAt(0);return[lerp(x[0]+.45,to[0],e),.11,lerp(x[1],to[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),lerp(.11,NET[1],Math.pow(u,.8)),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e)+.35*Math.sin(Math.PI*clamp(u*1.6))*(1-u),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the shield: left shoulder and forearm bar into Coquelin, body tilted into him, knees bent low, head up, ball on the far (right) foot */
const SHIELD:Partial<Pose>={bend:-9,roll:-7,twist:14,lean:20,lKnee:62,rKnee:56,lShA:58,lShF:22,lElb:62,lShR:-20,rShA:40,rShF:-10,rElb:40,neckP:12,neckY:10,squash:-.06};
/** the cut: body dropped and tilted into the turn, the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:10*dir,bend:12*dir,lean:24,lKnee:58,rKnee:54,lShA:dir>0?30:74,rShA:dir>0?74:30,neckY:10*dir,squash:-.05});
/** Coquelin's hold: his right arm reaching across Hazard's shoulder, leaning in */
const HOLD:Partial<Pose>={rShF:72,rShA:36,rElb:22,rHand:.7,bend:10,roll:6,twist:-10,lShA:40,lElb:50,neckP:10};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(HZ,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),.55*Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau))*(k===COQ?.6:1));
 if(a.role==='gk'&&tau>3)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===HZ)yaw=yawHZ(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ars'?READY:stand();
 if(k===HZ){// short, quick dribbling strides (right foot); more run in them once he bursts clear
  const s=clamp((sp-2)/4.5),dr=dribble(distOf(HZ,tau)/CYC,{foot:'r',speed:.45+.45*s});p=blendPose(idle,dr,clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='fall'?.42:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.55});
  if(mv.kind==='fall'&&u>0){p=slideTackle(Math.min(1,u),{foot:mv.side});p=over(p,{lShF:40,lShA:70,rShF:60,rShA:50,neckP:10},sm(.6,1,u));yaw=yawOf(1,.25);}}
 if(k===COQ)p=over(p,HOLD,bump(-.5,2.1,tau));
 if(k===HZ){
  p=over(p,SHIELD,bump(-.35,1.25,tau));
  p=over(p,CUT(-1),bump(1,1.7,tau));p=over(p,CUT(1),bump(6.7,7.2,tau));p=over(p,CUT(-1),bump(7.15,7.85,tau));
  const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.75}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.5)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.5,IN_NET+1,tau));
 }
 if(k===MATIC&&tau>PASS-.5&&tau<PASS+.5){const D=.7,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1)p=blendPose(p,strike(u,{foot:'r',power:.3}),bump(0,1,u));}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: plain white with navy panel marks (design inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D();for(let i=0;i<3;i++){const a=rot+i/3*TAU,cx=x+Math.cos(a)*r*.55,cy=y+Math.sin(a)*r*.55;pan.addPath(polyPath(blob(cx,cy,r*.28,r*.16,i+5,{amp:.1,n:10,rot:a}),true));}
 s.fill(K,pan,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (soft, overcast); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.16,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.34);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===HZ?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},{...(big&&(e.k===HZ||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===HZ}:{}),sleeves:SLEEVED.has(a.style)});
  joints.set(e.k,r);if(e.k===HZ)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** the shield: a yellow wall on the grass between Coquelin and the ball, through Hazard's feet */
function shieldMark(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 const m=posOf(HZ,tau),q=posOf(COQ,tau),b=ballAt(tau),dx=b[0]-q[0],dz=b[2]-q[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,L=1.1*w;
 const cx=(m[0]*2+q[0])/3,cz=(m[1]*2+q[1])/3,pts:Pt[]=[];for(let i=0;i<=8;i++){const u=(i/8-.5)*2*L,bow=.25*(1-Math.pow(i/4-1,2));const p=pr(c,[cx+nx*u+dx/l*bow,0,cz+nz*u+dz/l*bow]);if(p)pts.push(p);}
 if(pts.length<5)return;const d=toCam(c,[cx,0,cz])[2],wd=Math.max(4,c.F*.1/d);s.knockout(ribbon(pts,wd*1.7,{seed:41,taper:.2,wobble:.8}),.8*w);s.fill(Y,ribbon(pts,wd,{seed:41,taper:.2,wobble:.8}),.95*w);}
/** "change pace": ticks on the grass where he was every 0.25 s — bunched in the shoulder-to-shoulder, stretched apart in the burst */
function paceTicks(s:Sheet,c:Cam,from:number,to:number,w:number){if(w<=0)return;const p=new Path2D();let n=0;
 for(let tau=from;tau<=to+1e-6;tau+=.25){const[x,z]=posOf(HZ,tau),v=velOf(HZ,tau),l=Math.hypot(v[0],v[1])||1,nx=-v[1]/l,nz=v[0]/l,a=pr(c,[x+nx*.45,0,z+nz*.45]),b=pr(c,[x-nx*.45,0,z-nz*.45]);if(!a||!b)continue;
  const d=toCam(c,[x,0,z])[2];p.addPath(ribbon([a,b],Math.max(3,c.F*.07/d),{seed:50+n,taper:.2,wobble:.5}));n++;}
 if(n){s.knockout(p,.85*w);s.fill(R,p,.95*w);}}
/** a red arrow on the grass along his real path over [t0, t1] */
function pathArrow(s:Sheet,c:Cam,t0:number,t1:number,w:number){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=16;i++){const tau=t0+(t1-t0)*i/16,[x,z]=posOf(HZ,tau),q=toCam(c,[x,0,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=c.F*.12/d;
 s.knockout(ribbon(seg,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(R,ribbon(seg,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** "low": a yellow arrow pressing down over his head */
function lowArrow(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const h=r.joints.head,n=r.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*1.5+8;
 const a:Pt=[h[0],h[1]-u*4.2],b:Pt=[h[0],h[1]-u*1.5];s.knockout(ribbon([a,b],u*.75,{seed:71,taper:.1}),.85*w);laneArrow(s,Y,a,b,u*.42,{progress:w,seed:71,head:u*1.3});}
/** "balanced / on his feet": a red base under his feet (wide, steady) */
function baseRing(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const m=posOf(HZ,tau),pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[m[0]+Math.cos(i/36*TAU)*.7*w,0,m[1]+Math.sin(i/36*TAU)*.55*w]);if(q)pts.push(q);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(3,c.F*.06/toCam(c,[m[0],0,m[1]])[2]),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9);s.fill(R,rr,.95*w);}}
/** a yellow ring round the ball */
function ballRing(s:Sheet,bg:Pt|null,br:number,w:number){if(!bg||w<=0)return;const r=br*(1.9+.4*(1-w)),pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([bg[0]+Math.cos(a)*r,bg[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(3,br*.35),{close:true,seed:43,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(Y,rr,.95*w);}
/** speed lines streaming off him (the burst) */
function burstLines(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const m=posOf(HZ,tau),q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]+1,1,m[1]]);if(!q||!q2)return;
 const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=c.F/toCam(c,[m[0],1,m[1]])[2],p=new Path2D();
 for(let k=0;k<3;k++){const oy=z*(-.6+k*.5);p.addPath(ribbon([[q[0]-Math.cos(dir)*z*(.8+k*.2),q[1]+oy],[q[0]-Math.cos(dir)*z*(1.9+k*.4),q[1]+oy]],z*.05,{seed:9+k,taper:.9,wobble:.5}));}
 s.fill(K,p,.6*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the run between them plays at ~0.8–1.4× real time; the pre-roll is the pass) */
const tau1=(t:number)=>{const g=CUEW(0,'gets the ball'),G=CUEW(0,'goal');return key(t,[[0,Math.max(T0,-g-.2)],[g,0],[CUEW(0,'shrugs'),.6],[CUEW(0,'away he goes'),2.3],[CUEW(0,'faster'),3.6],[CUEW(0,'Into the box'),6.6],[CUEW(0,'past Koscielny'),7.5],[G,IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-G]],linear);};
const CAM1:V3=[52.5,22,68];
function cam1(t:number):Cam{
 const g=CUEW(0,'gets the ball'),G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[54,4,-10],m=posOf(HZ,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(0,g-.1,t,easeInOutSine),toD=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.5,toBall),lerp(open[2],lerp(bt[2],0,.2),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,[[0,1700],[g-.2,4300],[CUEW(0,'shrugs'),4700],[CUEW(0,'Into the box'),5000],[G,5400],[G+1.4,6400],[S,6700]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2],ballY:NET[1]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(HZ,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera on the ball side: the shield, low and strong, the burst
const tau2=(t:number)=>key(t,[[0,-.8],[CUEW(1,'he puts'),-.1],[CUEW(1,'between'),.35],[CUEW(1,'Low and strong'),.85],[CUEW(1,'stays on his feet'),1.7],[CUEW(1,'bursts away'),2.35],[SECS(1),3.5]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m0=smooth(HZ,tau),vv=velOf(HZ,tau),m:[number,number]=[m0[0]+vv[0]*.3,m0[1]+vv[1]*.3],open=1-sm(0,1.4,t,easeInOutSine),push=sm(CUEW(1,'he puts')-.3,CUEW(1,'between'),t,easeInOutSine)*(1-sm(CUEW(1,'stays')-.3,CUEW(1,'bursts')-.2,t)),back=sm(CUEW(1,'stays')-.6,CUEW(1,'bursts')+.4,t,easeInOutSine);
 const C:V3=[m[0]-2.6-4.4*back+1.5*open,1.45+.3*open+1.9*back,m[1]+8+3*open-2.4*push+.6*back],T:V3=[m[0]+1-1.8*back,.85-.15*push,m[1]-.6-1.3*back];
 return look(C,T,2750+650*push-650*back-350*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),hp=CUEW(1,'he puts'),bw=CUEW(1,'between'),lo=CUEW(1,'Low and strong'),sf=CUEW(1,'stays'),ba=CUEW(1,'bursts'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const shieldW=sm(bw-.2,bw+.3,t,easeOutBack)*(1-sm(sf-.1,sf+.3,t));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   shieldMark(s,c,tau,shieldW);
   baseRing(s,c,tau,sm(sf-.1,sf+.3,t,easeOutBack)*(1-sm(ba-.2,ba+.2,t)));
   paceTicks(s,c,-.2,Math.min(tau,3.2),sm(ba-.3,ba+.1,t)*(1-sm(E-.9,E-.5,t)));},
   after:({hero,bg,br,joints})=>{
   // "his body": a yellow ring round the ball, with Hazard's body between it and Coquelin
   ballRing(s,bg,br,sm(hp-.1,hp+.3,t,easeOutBack)*(1-sm(lo-.4,lo-.1,t)));
   lowArrow(s,hero,sm(lo-.05,lo+.4,t,easeOut)*(1-sm(sf+.2,sf+.5,t)));
   // "stays on his feet": a spark where Coquelin hits the floor
   const cq=joints.get(COQ),age=tau-2.25;if(cq&&age>-.15&&age<.6){const p=cq.joints.pelvis;sparkBurst(s,Y,p[0],p[1]+cq.heightPx*.1,cq.heightPx*.35,{n:8,seed:83,g:easeOutBack(clamp((age+.15)/.2))*(1-clamp((age-.35)/.25)),width:9});}
   burstLines(s,c,tau,sm(ba-.1,ba+.3,t)*(1-sm(E-.8,E-.4,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the shift past Koscielny, the finish over Čech, the celebration
const tau3=(t:number)=>{const g=CUEW(2,'past Petr');return key(t,[[0,6.4],[CUEW(2,'A quick shift'),7.05],[CUEW(2,'past Koscielny'),7.6],[CUEW(2,'drives it'),SHOT-.05],[g,IN_NET+.15],[SECS(2),IN_NET+.15+(SECS(2)-g)*.85]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'past Petr');return sm(a+.1,SECS(2)-.3,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(HZ,tau),e=sm(SHOT-.3,IN_NET+.2,tau,easeInOutSine),u=swing3(t);
 const C0:V3=[112.5,7.8,-8.5+1.5*e],T0:V3=[lerp(m[0],101,e),lerp(.9,1.2,e),lerp(m[1]*.9,-2,e)];
 const C1:V3=[m[0]-6,2.2,m[1]+8.5],T1:V3=[m[0]+.6,1.2,m[1]-1];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3300+300*sm(0,CUEW(2,'past Koscielny'),t),3300,u)*(1-.25*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),g=CUEW(2,'past Petr'),u=swing3(t),qs=CUEW(2,'A quick shift'),dr=CUEW(2,'drives it');
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   // "a quick shift": the red arrow of his path — out to his left, then back in past Koscielny
   pathArrow(s,c,6.6,8.2,sm(qs-.1,qs+.6,t,easeOut)*(1-sm(dr-.1,dr+.3,t)));},
   after:({joints})=>{
   // Koscielny's lunge meets only air
   const kj=joints.get(KOS),age=tau-7.5;if(kj&&age>-.2&&age<.5){const f=kj.joints.rToe;sparkBurst(s,R,f[0],f[1],kj.heightPx*.3,{n:8,seed:91,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.3)/.2)),width:8});}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2],NET[1]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HZ,tau3(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the Coquelin beat and the burst
const tau4=(t:number)=>key(t,[[0,-.5],[CUEW(3,'protect'),-.15],[CUEW(3,'your body'),.3],[CUEW(3,'keep low'),.75],[CUEW(3,'balanced'),1.05],[CUEW(3,'change pace'),1.55],[CUEW(3,'leave'),2.3],[SECS(3),3.3]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(HZ,tau),push=sm(CUEW(3,'protect')-.3,CUEW(3,'protect')+.5,t,easeInOutSine),back=sm(CUEW(3,'change')-.3,SECS(3),t,easeInOutSine);
 const C:V3=[m[0]+5+3*back,2.3+.8*back,m[1]+7.5+2*back],T:V3=[m[0]+.4,.7-.1*push,m[1]-.6];
 return look(C,T,2350+400*push-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),pb=CUEW(3,'protect'),yb=CUEW(3,'your body'),kl=CUEW(3,'keep low'),ba=CUEW(3,'balanced'),cp=CUEW(3,'change pace'),lv=CUEW(3,'leave'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   shieldMark(s,c,tau,sm(yb-.15,yb+.3,t,easeOutBack)*(1-sm(cp-.3,cp,t)));
   baseRing(s,c,tau,sm(ba-.1,ba+.35,t,easeOutBack)*(1-sm(cp-.2,cp+.2,t)));
   paceTicks(s,c,-.5,Math.min(tau,3.2),sm(cp-.2,cp+.2,t)*(1-sm(E-1,E-.6,t)));},
   after:({hero,bg,br,joints})=>{
   ballRing(s,bg,br,sm(pb-.1,pb+.35,t,easeOutBack)*(1-sm(yb+.3,yb+.6,t)));
   lowArrow(s,hero,sm(kl-.05,kl+.35,t,easeOut)*(1-sm(cp-.3,cp,t)));
   // "leave defenders behind": speed lines off Hazard, Coquelin down behind him
   burstLines(s,c,tau,sm(lv-.1,lv+.3,t)*(1-sm(E-.9,E-.4,t)));
   const cq=joints.get(COQ),age=tau-2.25;if(cq&&age>-.15&&age<.6){const p=cq.joints.pelvis;sparkBurst(s,Y,p[0],p[1]+cq.heightPx*.1,cq.heightPx*.35,{n:8,seed:84,g:easeOutBack(clamp((age+.15)/.2))*(1-clamp((age-.35)/.25)),width:9});}}});
 },
 still:4.2,
};

const film:RisoStory={
 id:'hazard-arsenal-2017',format:'11v11',title:"Hazard's Solo Run v Arsenal",theme:'Protect the ball with your body, stay low and balanced, change pace to leave defenders behind',
 ageNote:'Premier League, Chelsea v Arsenal, Stamford Bridge, London, 4 February 2017. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of winter turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(K,b,.5*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
