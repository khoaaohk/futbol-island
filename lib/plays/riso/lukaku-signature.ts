/** Romelu Lukaku's signature — "the powerful hold-up and finish" — recreated from ONE real moment: AC Milan 0–3 Inter, Serie A, the
 * Milan derby, San Siro (Stadio Giuseppe Meazza, Milan's home game), Sunday 21 February 2021, Inter's third goal in the 66th minute.
 * A long ball from Ivan Perisic, Lukaku collects it in the centre circle with Franck Kessie on his back, turns him, runs at the heart of
 * Milan's defence, jinks left and rifles a low early shot inside Gianluigi Donnarumma's near post. WHY THIS MOMENT: the reports of this
 * match single out exactly the signature — Sky Sports' man of the match note: "he was the target-man Inter craved. He held the ball up,
 * waited for the constant runs of Hakimi and Perisic on the wings, fed them in", "incredible strength" — and this goal is the hold-up
 * (ball kept with a defender tight behind him) turned into a powerful finish. An iconic-play riso film (RisoStory, chapters mode): a 1:1
 * reconstruction from written accounts and two match photographs (we cannot watch the footage), printed as a riso sheet.
 *
 * SOURCES (pages cached under scratchpad/films/src-cache/):
 *  - The Guardian, Alex Hess, "Inter take control of title race as Romelu Lukaku's stunner caps Milan derby win" (21 Feb 2021)
 *    https://www.theguardian.com/football/2021/feb/21/milan-inter-match-report  — "After collecting a long ball, he swivelled to run at
 *    the heart of Milan's defence, jinking left and rifling a low early shot inside Gianluigi Donnarumma's near post"; 66th minute.
 *  - Sky Sports, Tommaso Fiore, "AC Milan 0-3 Inter Milan: Romelu Lukaku scores in derby as Serie A leaders go four points clear"
 *    https://www.skysports.com/football/news/11854/12224749/  — "collected the ball in the centre circle and surged through the middle
 *    before beating Gianluigi Donnarumma at his near post", "a powerful finish after a sensational solo run on the counter"; the
 *    hold-up quote above. Its lead photo (Lukaku celebrating) shows the kit.
 *  - ESPN / AP, "Inter boosts title hopes by winning biggest derby in decade" https://www.espn.com/soccer/report?gameId=582933
 *    — "raced from near the halfway line before firing into the bottom left corner"; Lautaro 5', 57', Lukaku 66'.
 *  - The Sun (search-result summary, page not fetched): "A long ball forward from Ivan Perisic began a counter-attack and Lukaku turned
 *    Franck Kessie to open up his route to goal. The Milan defence backed off and he launched a stinging strike past Gianluigi
 *    Donnarumma's near-post from 18 yards out."
 *  - SempreInter highlights post (22 Feb 2021): "a trademark run from his own half"; its score graphic photo shows the Inter kit.
 * CONFIRMED by those accounts: date, venue (Milan the home side), 0–3 final, Lautaro 5' + 57', Lukaku 66' = the third goal; a long ball
 * forward from Perisic; Lukaku collected it in/near the centre circle (near halfway), turned ("swivelled") Kessie, ran through the
 * middle at the heart of Milan's defence, which backed off; jinked left; a low, early, powerful shot from about 18 yards inside
 * Donnarumma's near post (the bottom-left corner). KIT (both photos): Inter's home shirt — blue and black zigzag stripes (printed blue
 * with navy stripes), black shorts.
 * INFERRED (illustrative): every position and timing between those beats; where Perisic hit the ball from (left side, left foot); the
 * flight of the ball; that Lukaku came short to it with his back to goal and Kessie tight behind him (implied by "turned Kessie"); the
 * control with his left foot, the body shield and the arm, which way he spun (to his right); the line of the run, where the other Milan
 * defenders stood; the number of touches; the SHOOTING FOOT (his left, his stronger foot — not stated in the reports, not narrated); the
 * keeper's late dive; the celebration run; the other players (only Perisic, Kessie and Donnarumma are named in the accounts; Hakimi,
 * Lautaro and Barella's supporting runs in the lesson are illustrative of the hold-up play the Sky report describes); Lukaku's number 9
 * with a white number; Inter's black socks; Milan's kit — although Milan were the home side, their red-and-black stripes would clash with
 * Inter's blue-and-black, so a change strip is assumed and white is inferred (not verified, not narrated); Donnarumma's dark kit; the referee's lime-yellow (a match official in
 * lime socks appears in the Sky photo); an EMPTY San Siro (Serie A was played behind closed doors in 2020–21 — not narrated): seats,
 * banners over the lower ring, winter-afternoon sun; which way Inter attacked on screen.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, from Perisic's long ball to the goal; 2 = slow-motion replay from a low touchline camera, side-on to the hold-up: his back into
 * Kessie (a red push arrow), Kessie ringed behind him, the ball safe on his far side (yellow ring), then the spin (red lane) and a fast
 * tracking pan; 3 = replay from behind the goal: the defence backing off, the jink left (red lane), the low shot to the near post (a
 * yellow target, the dashed line past Donnarumma), then the celebration; 4 = the lesson from a raised three-quarter camera in front of
 * the hold-up: the body shield, the ball ring, and the team-mates' runs forward as red lanes ("join the attack"). All figures are the
 * shared riso athlete (lib/plays/riso/athlete.ts) routed through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys
 * off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Milan derby, 2021. Ivan Perisic plays a long ball. Romelu Lukaku holds off Franck Kessie, spins, and charges at the defence! They back off... a jink to the left... a low shot, into the near post!',seconds:15.4,
  cues:[[.2,'Milan derby'],[3.4,'long ball'],[4.3,'Romelu Lukaku'],[5.1,'holds off'],[6.6,'spins'],[7.3,'charges'],[8.9,'They back off'],[10.4,'a jink'],[12.3,'low shot'],[13.4,'near post']]},
 {label:'Watch it again',text:'Watch it again, slowly. Lukaku uses his strong body to keep Kessie behind him, and the ball safe. Then he spins away!',seconds:9.4,
  cues:[[.15,'Watch it again'],[3,'strong body'],[4.2,'keep Kessie behind'],[5.9,'the ball safe'],[7.6,'spins away']]},
 {label:'The finish',text:'Early and powerful, past Gianluigi Donnarumma. Inter win the derby, three-nil!',seconds:7,
  cues:[[.15,'Early and powerful'],[1.7,'past Gianluigi'],[3.6,'Inter win'],[5,'three-nil']]},
 {label:'Your turn',text:'Your turn: use your body to hold off defenders. Keep the ball safe, so your teammates can join the attack!',seconds:8.8,
  cues:[[.15,'Your turn'],[1.1,'use your body'],[2.2,'hold off'],[3.9,'Keep the ball safe'],[5.6,'your teammates'],[6.7,'join the attack']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py lukaku-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/lukaku-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-lukaku-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/lukaku-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lukaku: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Inter attack +X, Milan's goal line at 105), Y up, Z across
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
/** a projected quad only when it is comfortably in front of the camera (the cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a closed ground ring (ellipse rx × rz round x,z) as a ribbon path, or null when off camera */
function groundRing(c:Cam,x:number,z:number,rx:number,rz:number,wm:number,seed:number):Path2D|null{const pts:Pt[]=[];
 for(let i=0;i<30;i++){const q=pr(c,[x+Math.cos(i/30*TAU)*rx,0,z+Math.sin(i/30*TAU)*rz]);if(q)pts.push(q);}
 if(pts.length<24)return null;const d=toCam(c,[x,0,z])[2];if(d<1)return null;return ribbon(pts,Math.max(3,c.F*wm/d),{close:true,seed,taper:0,wobble:1});}

// ---------------------------------------------------------------- San Siro, empty: a tall squared bowl (three rings) under the roof and its red girders
const CX=52.5,NS=64;
/** a point on the stands: angle th round the pitch centre, d metres out from the inner rim (a squared superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.28),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.28)];}
const LOW=(b:number):[number,number]=>[2+15*b,1.6+10*b],MID=(b:number):[number,number]=>[16+12*b,12.5+10*b],UP=(b:number):[number,number]=>[26+16*b,25+17*b];
type Bowl={low:V3[][];mid:V3[][];up:V3[][];band:V3[][];roof:V3[][];girder:V3[][];rows:V3[][];banner:V3[][]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],mid:[],up:[],band:[],roof:[],girder:[],rows:[],banner:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.mid.push(Q(MID,0,1));o.up.push(Q(UP,0,1));
  o.band.push([rim(a,16,11.6),rim(b,16,11.6),rim(b,16,12.9),rim(a,16,12.9)]);o.band.push([rim(a,26,23.8),rim(b,26,23.8),rim(b,26,25.3),rim(a,26,25.3)]);
  o.roof.push([rim(a,30,44),rim(b,30,44),rim(b,50,46),rim(a,50,46)]);
  o.girder.push([rim(a,33,46),rim(b,33,46),rim(b,33,50.5),rim(a,33,50.5)]);
  // empty seats: pale aisle stripes across the rows (one path for all rings)
  for(const [f,rows] of [[LOW,5],[MID,4],[UP,5]] as [(u:number)=>[number,number],number][])for(let r=0;r<rows;r++)o.rows.push(Q(f,(r+.55)/rows,(r+.7)/rows));
  // big club banners laid over some of the empty lower-ring seats
  if(hash(i*31+7,5)<.3)o.banner.push(Q(LOW,.15,.8));}
 return o;})();
/** everything behind the pitch: the winter-afternoon sky and the empty stands (no crowd: seat rows, banners, the roof) */
function stadium(s:Sheet,c:Cam,_v:View){
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const low=new Path2D(),mid=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D(),gird=new Path2D(),rows=new Path2D(),ban=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.low[i],low);add(BOWL.mid[i],mid);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.girder[i],gird);}
 for(const q of BOWL.band)add(q,band);for(const q of BOWL.rows)add(q,rows);for(const q of BOWL.banner)add(q,ban);
 // the seats: red lower ring, blue upper rings (printed as screens), the aisles and row gaps knocked pale
 s.knockout(low);s.tone(R,low,.5);s.tone(K,low,.16);s.knockout(mid);s.tone(B,mid,.5);s.tone(K,mid,.2);s.knockout(up);s.tone(B,up,.42);s.tone(K,up,.3);
 s.knockout(rows,.4);
 s.knockout(ban);s.fill(K,ban,.75);s.tone(B,ban,.4);
 s.knockout(band,.8);s.tone(K,band,.12);
 s.knockout(roof);s.tone(K,roof,.62);s.tone(B,roof,.35);
 s.knockout(gird);s.fill(R,gird,.95);s.tone(K,gird,.15);
}
/** the surround, grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (the Milan goal drawn later when it is in
 * front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.35);s.tone(K,p,.2);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // LED boards: far touchline and behind both goals, navy with paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.2,-36.95],[x+3.6,.2,-36.95],[x+3.6,.7,-36.95],[x,.7,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.2,z],[108.45,.2,z+3.6],[108.45,.7,z+3.6],[108.45,.7,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.85);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-3);
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
/** Inter 2020–21 home (both photos): blue and black zigzag stripes (printed blue with navy stripes), black shorts; black socks inferred */
const INT=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:K,shorts:K,socks:K,trim:K,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',seed:3,...o});
/** Romelu Lukaku: number 9 (inferred), close-cropped hair, a big powerful frame (1.91 m) */
const LUK_STYLE=INT({skin:SKIN_D,hair:K,hairStyle:'short',number:9,build:{height:1.91,bulk:1.2,thighs:1.22,head:1.02},seed:9});
/** AC Milan: the white change kit (inferred — Inter's blue-black stripes clash with red-black), red trim */
const ACM=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:R,seed:5,...o});
/** Franck Kessie: number 79 (inferred), strong midfielder build */
const KESSIE_STYLE=ACM({skin:SKIN_D,hair:K,number:79,build:{height:1.83,bulk:1.16,thighs:1.15},seed:79});
/** Gianluigi Donnarumma: 1.96 m; dark keeper kit inferred */
const GIGIO:AthleteStyle={shirt:[K,.75],shorts:[K,.85],socks:[K,.75],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,gloves:[Y,.6],sleeves:'long',trim:Y,build:{height:1.96,bulk:1.04},seed:99};
/** Samir Handanovic (far end, barely seen): grey keeper kit inferred */
const HANDA:AthleteStyle={shirt:[K,.4],shorts:[K,.7],socks:[K,.4],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'balding',line:K,gloves:[Y,.6],sleeves:'long',trim:B,build:{height:1.93},seed:52};
/** the referee: lime-yellow (inferred from a match official's socks in the Sky photo), navy shorts */
const REF:AthleteStyle={shirt:Y,shorts:[K,.9],socks:Y,trim:K,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Lukaku's first touch)
type Role='luk'|'int'|'acm'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a long pass (contact at `at`) */
type Move={kind:'lunge'|'dive'|'kick';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Perisic, Kessie and Donnarumma get the beats the accounts give them; where
 * everybody stood is inferred. */
const PASS=-2.2;
const ACTORS:Actor[]=[
 {name:'Lukaku',role:'luk',style:LUK_STYLE,key:true,keys:[[-5.8,60,-3],[-4,59.4,-2.8],[-2.2,57.4,-2.2],[-1,55,-1.7],[-.35,53.7,-1.5],[0,53.3,-1.5],[.5,53.15,-1.5],[.85,53.15,-1.7],[1.15,53.4,-2.4],[1.45,54.2,-3],[2,57,-3.2],[3,64.8,-3],[4,72.8,-2.7],[4.6,77.6,-2.9],[5,80.8,-3.6],[5.35,83.5,-4.9],[5.8,86.6,-5.6],
  [6.4,90,-5.4],[7.2,92.6,-3.4],[8.4,94.4,.8],[10,95.4,7],[12,95.8,13]]},
 {name:'Kessie',role:'acm',style:KESSIE_STYLE,key:true,engage:[-1.6,1.3],keys:[[-5.8,61.5,-5],[-4,60.6,-4],[-2.2,58.4,-2.6],[-1,55.8,-1.6],[-.3,54.3,-1.35],[0,54.0,-1.35],[.85,53.85,-1.45],[1.2,54.1,-1.9],[1.6,55,-2.6],[2.4,58.6,-2.9],[4,68,-2.6],[6,80,-3],[8,88,-3],[12,92,-2]]},
 {name:'Perisic',role:'int',style:INT({seed:44,hairStyle:'short',hair:[K,.6],number:14}),key:true,moves:[{kind:'kick',at:PASS,dur:1.1,side:'l'}],keys:[[-5.8,17,-27],[-4,22,-25.8],[-2.8,26,-24.6],[PASS,27.4,-24.2],[-1,29,-23.8],[2,36,-23],[6,50,-21],[12,66,-17]]},
 // Inter team-mates joining the attack (illustrative: Sky's "the constant runs of Hakimi and Perisic on the wings")
 {name:'Hakimi',role:'int',style:INT({seed:2,hair:K,skin:SKIN_M}),keys:[[-5.8,40,20],[-2,45,22],[0,50,23.5],[3,65,23],[6,80,19],[12,92,14]]},
 {name:'Lautaro',role:'int',style:INT({seed:10,hair:K,skin:SKIN_M}),keys:[[-5.8,58,9],[-2,59,9.5],[0,60,9],[3,70,7.5],[6,84,4.5],[12,94,5]]},
 {name:'Barella',role:'int',style:INT({seed:23,hairStyle:'curly'}),keys:[[-5.8,42,3],[-2,45,4.5],[0,47.5,5.5],[3,57,6.5],[6,70,7],[12,82,6]]},
 {name:'Eriksen',role:'int',style:INT({seed:24,hair:[K,.4]}),keys:[[-5.8,36,-8],[0,42,-6],[6,54,-5],[12,62,-4]]},
 {name:'Skriniar',role:'int',style:INT({seed:37,hair:[K,.7]}),keys:[[-5.8,22,6],[0,26,5],[12,40,4]]},
 {name:'Bastoni',role:'int',style:INT({seed:95}),keys:[[-5.8,24,-9],[0,28,-8],[12,40,-8]]},
 {name:'Handanovic',role:'gk',style:HANDA,keys:[[-5.8,6,0],[12,9,0]]},
 // Milan: two centre-backs and the full-backs back off; Tonali tracks in; the forwards stranded upfield
 {name:'cb left',role:'acm',style:ACM({seed:31,hairStyle:'long'}),key:true,engage:[3.6,5.6],moves:[{kind:'lunge',at:5.05,dur:.8,side:'r'}],keys:[[-5.8,75,-5],[0,73.5,-3.6],[2,74.5,-3.2],[3.5,78.4,-3],[4.6,81.6,-3],[5,82.6,-3],[5.4,83.2,-3.1],[6,84.8,-3.6],[12,90,-4]]},
 {name:'cb right',role:'acm',style:ACM({seed:32,hair:[K,.5]}),key:true,keys:[[-5.8,74,6],[0,72,4.5],[3,76.5,3.5],[4.6,81,2.4],[5.6,85,1],[7,88,-1],[12,92,-2]]},
 {name:'rb',role:'acm',style:ACM({seed:33}),keys:[[-5.8,66,-21],[0,69,-18],[3,74,-15],[5.5,82,-12],[7,86,-10],[12,90,-8]]},
 {name:'lb',role:'acm',style:ACM({seed:34,skin:SKIN_M}),keys:[[-5.8,60,23],[0,63,21],[3,70,18],[6,82,12],[12,90,8]]},
 {name:'Tonali',role:'acm',style:ACM({seed:35,hairStyle:'long'}),keys:[[-5.8,62,7],[0,58.5,5],[1.5,58.5,3],[3,63,1.5],[6,76,.5],[12,84,1]]},
 {name:'fwd1',role:'acm',style:ACM({seed:36,hairStyle:'long',build:{height:1.95}}),keys:[[-5.8,38,2],[0,42,1],[12,52,0]]},
 {name:'fwd2',role:'acm',style:ACM({seed:38}),keys:[[-5.8,34,-14],[0,38,-13],[12,48,-12]]},
 {name:'fwd3',role:'acm',style:ACM({seed:39,hair:[K,.6]}),keys:[[-5.8,44,11],[0,48,10],[12,60,6]]},
 {name:'fwd4',role:'acm',style:ACM({seed:40,skin:SKIN_M}),keys:[[-5.8,40,21],[0,45,19],[12,56,16]]},
 {name:'Donnarumma',role:'gk',style:GIGIO,key:true,moves:[{kind:'dive',at:6.1,dur:.8,side:'r'}],keys:[[-5.8,103.4,0],[3,103.3,-.6],[5,102.8,-1.6],[5.8,102.5,-2.1],[12,102.5,-2.1]]},
 {name:'referee',role:'ref',style:REF,keys:[[-5.8,50,14],[0,54,13],[6,72,10],[12,82,8]]},
];
const LUK=0,KES=1,PER=2,HAK=3,LAU=4,BAR=5;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-5.8,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- Lukaku's heading, the ball
/** the hold-up: back to goal (facing −X) from the control until the spin; the spin turns him to his RIGHT (yaw falls from π through
 * −Z to his run heading); then along the run */
const HOLD_END=.85,SPIN_END=1.45,CYC=4.6,PUSH=.4,SHOT=5.8,IN_NET=SHOT+.55;
function yawL(tau:number):number{const v=velOf(LUK,tau),sp=Math.hypot(v[0],v[1]),head=sp>.6?yawOf(v[0],v[1]):Math.PI;
 if(tau<HOLD_END)return tau<-.4?head:Math.PI+.06*Math.sin(tau*5);
 if(tau<SPIN_END+.1){const u=sm(HOLD_END,SPIN_END+.1,tau,easeInOutSine),h=yawOf(1,-.02);return lerp(Math.PI,h,u);}
 return head;}
const fwdL=(tau:number):[Pt,Pt]=>{const y=yawL(tau);return[[Math.cos(y),-Math.sin(y)],[-Math.sin(y),-Math.cos(y)]];};
/** ball spot for the left foot: ahead and a touch to his left */
const footAt=(tau:number,reach=.55):[number,number]=>{const p=posOf(LUK,tau),[f,l]=fwdL(tau);return[p[0]+f[0]*reach+l[0]*.12,p[1]+f[1]*reach+l[1]*.12];};
/** the touches after the spin: a left-foot push each stride (every second stride while the grass ahead is open), the jink, the set touch */
const TOUCHES:number[]=(()=>{const forced=[SPIN_END,5.12,5.48],out:number[]=[];let prev=distOf(LUK,SPIN_END)/CYC-PUSH,skip=false;
 for(let tau=SPIN_END+DT;tau<SHOT-.45;tau+=DT){const ph=distOf(LUK,tau)/CYC-PUSH;if(Math.floor(ph)>Math.floor(prev)){const open=tau>2.2&&tau<4.4;if(!(open&&skip)&&forced.every(f=>Math.abs(f-tau)>.3))out.push(tau);skip=open&&!skip;}prev=ph;}
 return[...forced,...out].sort((a,b)=>a-b).concat([SHOT]);})();
const TP=TOUCHES.map(t=>footAt(t,t===SPIN_END?.45:.6));
const LAND=footAt(0,.5);
/** Perisic's long ball: from his left boot, a high arc (≈9 m) onto Lukaku's left foot */
const PFOOT=(()=>{const p=posOf(PER,PASS);return[p[0]+.5,p[1]+.1] as [number,number];})();
const NET:V3=[105.35,.28,-3.15],REST:V3=[106.2,.11,-3];
function ballAt(tau:number):V3{
 if(tau<PASS){const p=posOf(PER,tau),v=velOf(PER,tau),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*.55,.11,p[1]+v[1]/l*.55];}
 if(tau<0){const u=(tau-PASS)/-PASS;return[lerp(PFOOT[0],LAND[0],u),lerp(.11,.5,u)+36*u*(1-u),lerp(PFOOT[1],LAND[1],u)];}
 if(tau<HOLD_END){// cushioned, then kept under his left sole on the far side from Kessie, rolled a little as he holds him off
  const f=footAt(tau,.5),d=.08*Math.sin(tau*6);return[f[0]+d,.11+.25*Math.max(0,1-tau/.2),f[1]];}
 if(tau<SPIN_END){// dragged round with the sole as he spins (lags the hips a little)
  const p=posOf(LUK,tau),[f,l]=fwdL(Math.max(0,tau-.06)),r=lerp(.5,.35,bump(HOLD_END,SPIN_END,tau));return[p[0]+f[0]*r+l[0]*.12,.11,p[1]+f[1]*r+l[1]*.12];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.22*Math.sin(Math.PI*u*.7),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** watching the long ball drop: chin up, arms out for position */
const WATCH:Partial<Pose>={neckP:-30,lean:4,lShA:40,rShA:36,lElb:44,rElb:44,lKnee:28,rKnee:28};
/** the control: left leg raised to cushion the dropping ball, arms wide */
const CONTROL:Partial<Pose>={lHipF:44,lKnee:58,lAnk:8,lHipR:18,rHipF:12,rKnee:30,lean:12,lShA:62,rShA:58,lShF:10,rShF:-8,lElb:30,rElb:36,neckP:30,squash:-.03};
/** THE HOLD-UP: wide and low, pelvis sat back into the defender, chest over the ball, the right arm reaching back to feel and fend him,
 * the left sole on the ball on the far side */
const HOLD:Partial<Pose>={lHipF:26,lKnee:40,lAnk:-22,lHipA:14,rHipF:8,rKnee:52,rHipA:20,lean:24,pitch:-4,bend:-6,twist:-14,
 rShF:-38,rShA:44,rElb:28,rHand:.8,lShA:52,lShF:18,lElb:40,neckP:22,neckY:-18,squash:-.06};
/** Kessie tight behind: leaning in, both forearms on Lukaku's back */
const PRESS:Partial<Pose>={lean:26,pitch:6,lKnee:44,rKnee:40,lHipF:30,rHipF:-4,lShF:64,rShF:58,lShA:18,rShA:16,lElb:44,rElb:40,lHand:.6,rHand:.6,neckP:-6,squash:-.04};
/** the spin: dropped low, arms swinging round with the turn */
const SPIN:Partial<Pose>={lean:22,lKnee:56,rKnee:52,lShA:70,rShA:48,twist:-22,neckY:-24,roll:-6,squash:-.05};
/** the jink: body dropped and tilted into the change of direction (left), the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:9*dir,bend:10*dir,lean:20,lKnee:52,rKnee:50,lShA:dir>0?30:70,rShA:dir>0?70:30,neckY:8*dir,squash:-.04});
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(LUK,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===LUK)yaw=yawL(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='acm'?READY:stand();
 if(k===LUK){// a big man's long, driving strides; the left foot pushes the ball on (PUSH phase)
  const s=clamp((sp-2)/5);p=blendPose(over(idle,WATCH,bump(-1.6,.1,tau)),runCycle(distOf(LUK,tau)/CYC,{speed:.35+.6*s}),clamp((sp-.4)/1.2));}
 else if(sp>.5&&along<-.35*sp){const bp=runCycle(distOf(k,tau)/2.4,{speed:.2});p=blendPose(idle,bp,clamp((sp-.5)/.8));}
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/3.6,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='kick'){const u=(tau-(mv.at-STRIKE_CONTACT*mv.dur))/mv.dur;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.9}),Math.min(sm(0,.1,u),1-sm(1,1.4,u)));if(tau<mv.at+.3)yaw=yawOf(LAND[0]-x,LAND[1]-z);continue;}
  const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.05});}
 if(k===KES){p=over(p,PRESS,bump(-.6,1.25,tau)*1.3);if(tau>1.1&&tau<1.7)p=over(p,{twist:30,neckY:34,lean:10},bump(1.1,1.7,tau));}
 if(k===LUK){
  p=over(p,CONTROL,bump(-.4,.3,tau));
  p=over(p,HOLD,Math.min(1,bump(-.05,1.05,tau)*1.5));
  p=over(p,SPIN,bump(HOLD_END-.05,SPIN_END+.15,tau));
  p=over(p,CUT(-1),bump(4.85,5.45,tau));
  const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.95}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+.9,tau));
 }
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
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;kes?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;under?:()=>void;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (low February sun: long, thrown toward the camera side); big figures cast their own
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.08,e.g[1]+e.h*.02,e.h*.2,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg&&inView(v,bg,br))ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,kesR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===LUK?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===LUK||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===LUK}:{});
  if(e.k===LUK)heroR=r;if(e.k===KES)kesR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,kes:kesR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** "strong body": a short fat red arrow from his hips back into the defender (he sits into him) */
function pushArrow(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(LUK,tau),[kx,kz]=posOf(KES,tau),a=pr(c,[x+.1,1.05,z]),b=pr(c,[lerp(x,kx,.9),1.1,lerp(z,kz,.9)]);if(!a||!b)return;
 const d=toCam(c,[x,1,z])[2],wd=Math.max(5,c.F*.16/d);s.knockout(ribbon([a,b],wd*1.5,{seed:51,taper:.1}),.8*w);laneArrow(s,R,a,b,wd,{progress:w,seed:51,head:wd*2.4});}
/** "the ball safe": a yellow ring round the ball on his far side */
function ballRing(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const b=ballAt(tau),r=groundRing(c,b[0],b[2],.55*w+.1,.45*w+.1,.07,57);if(r){s.knockout(r,.85);s.fill(Y,r,.95*w);}}
/** a ring on the grass under actor k */
function actorRing(s:Sheet,c:Cam,k:number,tau:number,w:number,ink:string,seed:number){if(w<=0)return;const[x,z]=posOf(k,tau),r=groundRing(c,x,z,.8*w,.65*w,.08,seed);if(r){s.knockout(r,.85);s.fill(ink,r,.95*w);}}
/** actor k's path as a lane on the grass, from τa to τb (progress w) */
function runLane(s:Sheet,c:Cam,k:number,ta:number,tb:number,w:number,ink:string,width=.5,seed=61,dashed=false){if(w<=0)return;
 const pts:Pt[]=[];let d=1;const n=30;for(let i=0;i<=n;i++){const tau=lerp(ta,lerp(ta,tb,clamp(w)),i/n),[x,z]=posOf(k,tau),q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(4,c.F*width/d);
 if(!dashed){s.knockout(ribbon(pts,wd*1.6,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(pts,wd,{seed,taper:.1,wobble:.8}),.95);}
 const a=pts[pts.length-2],b=pts[pts.length-1];
 if(dashed)laneArrow(s,ink,pts[0],b,wd,{seed,head:wd*3,dashed:true});else laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>key(t,[[0,T0+.2],[CUEW(0,'long ball'),PASS],[CUEW(0,'Romelu'),-1.05],[CUEW(0,'holds off'),0],[CUEW(0,'spins'),.95],[CUEW(0,'charges'),1.75],[CUEW(0,'They back'),3.4],[CUEW(0,'a jink'),4.7],[CUEW(0,'low shot'),SHOT-.08],[CUEW(0,'near post'),IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-CUEW(0,'near post')]],linear);
const CAM1:V3=[52.5,27,78];
function cam1(t:number):Cam{
 const G=CUEW(0,'near post'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]*.75];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // Perisic on the left → the long ball in the air (framed on its landing spot, Lukaku and Kessie waiting) → the camera follows the ball
 const land:V3=[50,1,-3],m=posOf(LUK,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toLand=sm(CUEW(0,'long ball')-.3,CUEW(0,'Romelu')+.2,t,easeInOutSine),toBall=sm(CUEW(0,'Romelu'),CUEW(0,'holds off')+.2,t,easeInOutSine),toD=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=lerp3(lerp3([bt[0]+4,1,bt[2]],land,toLand),[bt[0],1.5,bt[2]],toBall),T=lerp3(tb,cel,toD);
 const F=key(t,[[0,2700],[CUEW(0,'long ball'),2600],[CUEW(0,'holds off'),7000],[CUEW(0,'spins'),7200],[CUEW(0,'charges'),6300],[CUEW(0,'a jink'),6300],[G,6500],[G+1.4,7000],[S,7200]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t));
  stadium(s,c,v);
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(LUK,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera side-on to the hold-up, then the spin and a tracking pan
const tau2=(t:number)=>{const sa=CUEW(1,'spins away');return key(t,[[0,-.9],[CUEW(1,'strong body'),.05],[CUEW(1,'keep Kessie'),.35],[CUEW(1,'the ball safe'),.62],[sa-.2,HOLD_END-.05],[sa+.9,SPIN_END+.2],[SECS(1),2.9]],linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(LUK,Math.max(-.3,tau)),k=posOf(KES,Math.min(tau,.8)),sa=CUEW(1,'spins away'),E=SECS(1);
 const open=1-sm(0,1.2,t,easeInOutSine),push=sm(CUEW(1,'strong body')-.5,CUEW(1,'keep Kessie'),t,easeInOutSine)*(1-sm(sa-.3,sa+.4,t,easeInOutSine)),track=sm(sa+.3,E,t,easeInOutSine);
 // side-on from the near touchline: the pair in profile (Lukaku facing left, Kessie behind him on the right)
 const mid:V3=[(m[0]+k[0])/2,.95,(m[1]+k[1])/2];
 let C:V3=[mid[0]-.6,1.3+.5*open,mid[2]+8.2+3*open-2*push],T:V3=[mid[0]-.1,.95-.15*push,mid[2]];let F=2750+650*push-400*open;
 C=lerp3(C,[m[0]-4,1.8,m[1]+11],track);T=lerp3(T,[m[0]+3,.9,m[1]],track);F=lerp(F,2400,track);
 return look(C,T,F);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),sb=CUEW(1,'strong body'),kk=CUEW(1,'keep Kessie'),bs=CUEW(1,'the ball safe'),sa=CUEW(1,'spins away'),E=SECS(1);
  stadium(s,c,v);
  ground(s,c);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   // "keep Kessie behind": a red ring under Kessie; "the ball safe": a yellow ring round the ball on the far side
   actorRing(s,c,KES,tau,sm(kk-.15,kk+.3,t,easeOutBack)*(1-sm(sa-.2,sa+.2,t)),R,53);
   ballRing(s,c,tau,sm(bs-.15,bs+.3,t,easeOutBack)*(1-sm(sa+.2,sa+.6,t)));
   // "spins away": his path through the turn and away as a red lane
   runLane(s,c,LUK,HOLD_END-.1,2.6,sm(sa-.1,sa+1.2,t,easeOut)*(1-sm(E-.8,E-.4,t)),R,.4,63);},
   after:()=>{pushArrow(s,c,tau,sm(sb-.1,sb+.35,t,easeOut)*(1-sm(sa-.4,sa-.1,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the jink, the low near-post finish, the celebration
const tau3=(t:number)=>{const iw=CUEW(2,'Inter win');return key(t,[[0,3.7],[CUEW(2,'Early'),4.75],[CUEW(2,'past Gianluigi'),SHOT+.2],[iw,IN_NET+.6],[SECS(2),IN_NET+.6+(SECS(2)-iw)*.85]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'Inter win');return sm(a-.4,a+1,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(LUK,tau),e=sm(SHOT-.3,IN_NET+.2,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'three-nil'),SECS(2),t,easeInOutSine);
 // behind the goal, a little to the left of it (the near-post side), on the jink and the shot
 const mp=posOf(LUK,tau),C0:V3=[117,5.5,-6.5+1.5*e],T0:V3=[lerp(mp[0],102,e),lerp(.9,.8,e),lerp(mp[1]*.9,-2.4,e)];
 const C1:V3=[m[0]-6-hold,2+.5*hold,m[1]+8+1.2*hold],T1:V3=[m[0]+.6,1.2+.6*hold,m[1]-1];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(lerp(5400,3900,e),3300-250*hold,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ea=CUEW(2,'Early'),pg=CUEW(2,'past Gianluigi'),iw=CUEW(2,'Inter win'),u=swing3(t);
  stadium(s,c,v);
  ground(s,c,{goalLater:u<.5});
  // "Early and powerful": a yellow target inside the near post, bottom corner
  const tw=sm(ea-.1,ea+.35,t,easeOutBack)*(1-sm(iw-.2,iw+.3,t));
  if(tw>0){const q=pr(c,[105.05,.35,-3.15]);if(q){const r=c.F*.42/Math.max(1,toCam(c,[105,0,-3])[2])*tw,pts:Pt[]=[];for(let i=0;i<26;i++)pts.push([q[0]+Math.cos(i/26*TAU)*r,q[1]+Math.sin(i/26*TAU)*r]);const rr=ribbon(pts,Math.max(3,r*.22),{close:true,seed:88,taper:0,wobble:.8});s.knockout(rr,.8);s.fill(Y,rr,.95);}}
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   // the jink left, drawn as his red lane on the grass
   runLane(s,c,LUK,4.5,SHOT-.05,sm(0,ea+.2,t,easeOut)*(1-sm(pg-.1,pg+.3,t)),R,.35,65);},
   after:({bg,hero})=>{
   // "past Gianluigi Donnarumma": the ball's low line inside the near post, past the late dive
   const lw=sm(pg-.3,pg+.2,t,easeOut)*(1-sm(iw,iw+.5,t));
   if(lw>0){const a=TP[TP.length-1],pa=pr(c,[a[0],.12,a[1]]),pb=pr(c,[NET[0],.2,NET[2]]);if(pa&&pb){const wd=c.F*.07/Math.max(1,toCam(c,[98,0,-4])[2]);laneArrow(s,R,pa,pb,Math.max(4,wd),{progress:lw,seed:89,head:Math.max(10,wd*3),dashed:true});}}
   if(bg&&tau>SHOT&&tau<SHOT+.14)sparkBurst(s,Y,bg[0],bg[1],70,{n:8,seed:90,width:9});
   // "three-nil": three yellow sparks popping over his head, one after another
   const age=t-CUEW(2,'three-nil');if(hero&&age>-.1&&age<.9){const h=hero.joints.head,n=hero.joints.neck,z=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+6;
    for(let i=0;i<3;i++)sparkBurst(s,Y,h[0]+(i-1)*z*1.3,h[1]-z*(1.05+.25*(i%2)),z*.7,{n:7,seed:91+i,g:easeOutBack(clamp((age+.1-.12*i)/.25))*(1-clamp((age-.55)/.3)),width:Math.max(4,z*.12)});}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(LUK,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised three-quarter camera in front of the hold-up, team-mates running on
const tau4=(t:number)=>key(t,[[0,-.35],[CUEW(3,'use your body'),.05],[CUEW(3,'hold off'),.3],[CUEW(3,'Keep the ball'),.55],[CUEW(3,'your teammates'),.72],[SECS(3),.84]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=posOf(LUK,Math.max(0,tau)),push=sm(CUEW(3,'use your body')-.4,CUEW(3,'hold off')+.3,t,easeInOutSine)*(1-sm(CUEW(3,'your teammates')-.5,CUEW(3,'your teammates')+.4,t,easeInOutSine));
 const wide=sm(CUEW(3,'your teammates')-.5,CUEW(3,'join')+.4,t,easeInOutSine);
 // in front of him (he faces −X), high on the near side: his body between the ball and Kessie, the pitch toward Milan's goal beyond
 let C:V3=[m[0]-7.5,4.2-1.2*push,m[1]+7-1.8*push],T:V3=[m[0]+.4,.8,m[1]-.3];let F=2600+600*push;
 C=lerp3(C,[m[0]-17,15,m[1]+33],wide);T=lerp3(T,[m[0]+11,0,m[1]+8],wide);F=lerp(F,1800,wide);
 return look(C,T,F);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),ub=CUEW(3,'use your body'),ho=CUEW(3,'hold off'),kb=CUEW(3,'Keep the ball'),yt=CUEW(3,'your teammates'),ja=CUEW(3,'join'),E=SECS(3);
  stadium(s,c,v);
  ground(s,c);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   actorRing(s,c,KES,tau,sm(ho-.15,ho+.3,t,easeOutBack)*(1-sm(yt-.3,yt,t)),R,53);
   ballRing(s,c,tau,sm(kb-.15,kb+.3,t,easeOutBack)*(1-sm(E-.8,E-.4,t)));
   // "your teammates can join the attack": Hakimi, Lautaro, Barella and Perisic racing forward (their next three seconds) as red lanes
   const lw=sm(yt-.2,ja+.6,t,easeInOutSine)*(1-sm(E-.6,E-.3,t));
   [HAK,LAU,BAR,PER].forEach((k,i)=>runLane(s,c,k,tau,tau+3.4,clamp(lw*1.15-i*.05),R,.6,70+i*3));},
   after:({hero})=>{
   pushArrow(s,c,tau,sm(ub-.1,ub+.35,t,easeOut)*(1-sm(yt-.4,yt-.1,t)));
   // "use your body": a yellow ring round his hips and back (the shield)
   const bw=sm(ub-.05,ub+.35,t,easeOutBack)*(1-sm(kb-.2,kb+.2,t));
   if(hero&&bw>0){const pl=hero.joints.pelvis,ch=hero.joints.chest,r=Math.hypot(ch[0]-pl[0],ch[1]-pl[1])*1.25*bw+2,cx=(pl[0]+ch[0])/2,cy=(pl[1]+ch[1])/2,pts:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;pts.push([cx+Math.cos(a)*r*.95,cy+Math.sin(a)*r*1.15]);}
    const rr=ribbon(pts,Math.max(3,r*.14),{seed:82,close:true,taper:0,wobble:.8});s.knockout(rr,.7*bw);s.fill(Y,rr,.95*bw);}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'lukaku-signature',format:'11v11',title:"Lukaku's Hold-Up and Finish",theme:'Use your body to hold off defenders and keep the ball safe while your teammates join the attack',
 ageNote:'Serie A, AC Milan v Inter (the Milan derby), San Siro, Milan, 21 February 2021. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and red dust thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
