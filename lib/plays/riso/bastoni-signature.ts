/** Alessandro Bastoni — "Signature: the centre-back who joins the attack". Benfica v Internazionale, Champions League quarter-final, first
 * leg, Lisbon (Benfica's home, the Estádio da Luz), Tuesday 11 April 2023 (Inter won 2–0): the 51st-minute opening goal. Bastoni, Inter's
 * LEFT centre-back, leaves the back three, goes forward down Inter's left — the side of Benfica's attacking right-back Gilberto — and crosses
 * for Nicolò Barella's thumping header. An iconic-play riso film (RisoStory, chapters mode): a reconstruction from WRITTEN accounts (we
 * cannot watch the footage), printed as a riso sheet.
 *
 * WHY THIS MOMENT: his iconicPlays entry is a signature ("the centre-back who joins the attack", template overlap_run, side left; lesson
 * "when the space opens, a defender can step up and join the attack"). Wikipedia's account of his playing style names exactly this trait:
 * "despite his nominal role of a defender playing in the back-three, Bastoni often makes overlapping runs on the left side, linking up with
 * either Dimarco or other players in close proximity, and is capable of providing bending crosses into the opposition's penalty area, which
 * led him to assist a number of his team's goals". The Benfica goal is a well-documented assist of that kind in a big match: the match
 * report places it on the left, down the side of a right-back who had been "revelling in the space", and credits Bastoni's cross.
 *
 * SOURCES (pages cached under scratchpad/films/src-cache/):
 *  - The Guardian (PA Media), "Romelu Lukaku's late penalty helps Inter take control of first leg in Benfica", Tue 11 Apr 2023
 *    https://www.theguardian.com/football/2023/apr/11/benfica-internazionale-champions-league-quarter-final-first-leg-match-report
 *    — "Internazionale took a stranglehold on their Champions League quarter-final tie against Benfica"; "went ahead through Nicolò Barella
 *    ... won 2-0 in the first leg in Lisbon"; "Benfica pinned their opponents deep inside their own half, with full-back Gilberto revelling
 *    in the space afforded him down the right. But it was down his side that Inter struck when Barella dispatched Alessandro Bastoni's
 *    51st-minute cross with a thumping header – their first attempt on target"; keeper Odysseas Vlachodimos; André Onana in Inter's goal;
 *    Dimarco, Acerbi, Dumfries, Mkhitaryan on the pitch; referee Michael Oliver; Lukaku's late penalty made it 2–0.
 *    (guardian-ben-int-2023.txt)
 *  - Wikipedia (en) "Alessandro Bastoni" — left-footed, 1.90 m, Inter number 95, left centre-back in Inzaghi's 3–5–2, the Dimarco
 *    partnership, overlapping runs on the left and bending crosses (playing style, quoted above).  (wiki-alessandro-bastoni.txt)
 *  - Inter.it / Guardian line-ups for the 2023 final (same season): Bastoni 95, Barella 23, Dimarco 32, Acerbi 15, Dumfries 2.
 *    (inter-mci-int-2023.txt, guardian-mci-int-2023-live.txt)
 * CONFIRMED by those accounts: the match, the city, the date, the competition and round, the minute (51'), the score it made (1–0; Inter won
 * 2–0); the goal came down Inter's LEFT (Benfica's right, Gilberto's side) while Gilberto was pushing forward; Bastoni crossed; Barella
 * scored with a thumping header; it was Inter's first shot on target; Vlachodimos was Benfica's keeper; Bastoni is a left-footed centre-back
 * (the left one of Inter's back three) who makes overlapping runs down the left; the shirt numbers for that season.
 * INFERRED (illustrative; none of it narrated): the build-up (drawn as Acerbi's pass out, Bastoni carrying forward, a pass into Dimarco,
 * Dimarco coming inside while Bastoni overlaps round the outside, Dimarco's return ball down the line — the classic Bastoni–Dimarco overlap
 * the sources describe in general, not for this goal); every position and timing; that he crossed with his LEFT foot and from where (wide,
 * outside the box); the cross's curl and height; where Barella met it (around the penalty spot) and which side of Vlachodimos it went; the
 * kits (Benfica in their red home shirts with white shorts; Inter in a white change strip with blue trim — not verified, so the narration
 * never names a colour; the keepers' and referee's colours); which way Inter attacked on screen (left → right from the main stand, so Inter's
 * left flank is the FAR touchline); the stadium's look (a rounded two-tier bowl of red seats under a dark roof ring with a floodlight strip,
 * a full house mostly in Benfica red with a pocket of Inter fans), the night sky (a 20:00 kick-off), the camera placements, the celebration.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera panning with the ball
 * from Acerbi's pass out to Barella's header, close to real time; 2 = slow-motion replay from a raised camera BEHIND Bastoni: Gilberto caught
 * upfield (red ring), the empty grass behind him (yellow wash), the pass inside and Bastoni's overlap round the outside (red run lane), the
 * return ball into the space (yellow dashed arrow); 3 = replay from behind the goal: the cross (its flight traced in yellow), the header,
 * the net, then the swing round to the celebration; 4 = the lesson from a raised three-quarter camera behind him (space opens → a defender
 * steps up → joins the attack). All figures are the shared riso athlete (lib/plays/riso/athlete.ts) routed through ONE adapter,
 * drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random
 * value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,lunge,strike,header,keeperSet,keeperDive,celebrate,stand,posed,blendPose,solve,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); every cue starts
 * with a plain word (Kokoro splits contractions and hyphenated words). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The overlap, live',text:'Lisbon, April 2023: Benfica against Inter. Alessandro Bastoni is a centre-back. Space opens on the left, so he steps up, passes, and races round the outside, down the wing. His cross... Barella heads it in!',seconds:15.6,
  cues:[[.2,'Lisbon'],[1.6,'Benfica against'],[3,'Alessandro Bastoni'],[5.1,'Space opens'],[7,'so he steps up'],[8.5,'passes'],[9,'and races round'],[10.9,'down the wing'],[12.3,'His cross'],[13.6,'Barella heads']]},
 {label:'Watch it again',text:'Watch again. Their right back has gone forward, leaving empty grass. Bastoni runs round his team mate, into that space.',seconds:9.2,
  cues:[[.15,'Watch again'],[1.2,'Their right back'],[3.2,'leaving empty grass'],[4.5,'Bastoni runs'],[5.6,'round his team mate'],[6.7,'into that space']]},
 {label:'The header',text:'From behind the goal: a cross from Bastoni, and a thumping header from Nicolò Barella. Inter won two nil.',seconds:9.2,
  cues:[[.15,'From behind'],[1.9,'a cross from'],[4,'a thumping header'],[5.3,'Nicolò Barella'],[6.6,'Inter won']]},
 {label:'Your turn',text:'Your turn: when the space opens, a defender can step up and join the attack!',seconds:7.4,
  cues:[[.15,'Your turn'],[1,'when the space'],[2.4,'a defender'],[3.5,'step up'],[4.6,'join the attack']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py bastoni-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/bastoni-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-bastoni-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/bastoni-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('bastoni: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Inter defend X = 0 and attack +X, Benfica's goal line at 105), Y up,
 * Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so Inter's
 * left flank — Bastoni's side — is the far side (−Z). */
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

// ---------------------------------------------------------------- the Estádio da Luz at night: a rounded two-tier bowl of red seats, the roof ring, the floodlight strip
const CX=52.5,NS=60;
/** a point on the stands: angle th round the pitch centre, d metres out from the inner rim (a rounded superellipse bowl), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.5),y,(41+d)*Math.sign(s)*Math.pow(Math.abs(s),.5)];}
const LOW=(b:number):[number,number]=>[2+16*b,1.5+11*b],UP=(b:number):[number,number]=>[20+18*b,15+17*b];
type Bowl={low:V3[][];up:V3[][];band:V3[][];roof:V3[][];lamps:V3[][];seats:{P:V3;h:number;tier:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],band:[],roof:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  // the paper fascia between the tiers (the executive boxes band)
  o.band.push([rim(a,18,12.6),rim(b,18,12.6),rim(b,20,15),rim(a,20,15)]);
  o.roof.push([rim(a,36,34),rim(b,36,34),rim(b,58,37),rim(a,58,37)]);
  o.lamps.push([rim(a+.02,37,33.2),rim(b-.02,37,33.2),rim(b-.02,37,34.4),rim(a+.02,37,34.4)]);
  for(const [f,rows,tier] of [[LOW,8,0],[UP,8,1]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<5;k++){const h=hash(i*977+r*31+k*7+tier*5000,11);if(h<.1)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/5)/NS*TAU,d,y+.4),h,tier});}}
 return o;})();
/** everything behind the pitch: the night sky, the stands, the crowd (roar lifts the seat marks, flash = photographers) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number;away?:number}={}){
 const{roar=0,flash=0,away=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.55);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.5);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D(),lamp=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.lamps[i],lamp);add(BOWL.band[i],band);}
 s.knockout(low);s.fill(R,low,.7);s.tone(K,low,.22);s.knockout(up);s.fill(R,up,.62);s.tone(K,up,.36);
 // the crowd: a full house in Benfica red and white, a pocket of Inter fans (blue and navy) high in the far corner
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.6/d[2],2,13),aw=q.P[0]>100&&q.P[2]<-18&&q.tier===1,lift=roar>0||aw&&away>0?Math.max(roar*(aw?0:1),aw?away:0)*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=aw?(q.h<.5?3:2):q.h<.3?0:q.h<.82?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(K,inks[2],.85);s.fill(B,inks[3],.9);
 s.knockout(band,.85);s.tone(K,band,.14);
 s.knockout(roof);s.fill(K,roof,.9);
 s.knockout(lamp);s.fill(Y,lamp,.95);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the surround, floodlit grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (Benfica's goal drawn later when it is
 * in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.4);s.tone(K,p,.3);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.86);
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
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,NET[2]);
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
/** Inter: a white change strip with blue trim (inferred, not narrated), navy numbers */
const INT=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:B,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:K,seed:3,...o});
/** Alessandro Bastoni: number 95, 1.90 m, dark short hair, left-footed */
const BASTONI_STYLE=INT({number:95,hair:K,build:{height:1.9,bulk:1.02,thighs:1.06},seed:95});
/** Nicolò Barella: number 23, 1.75 m, dark short hair */
const BARELLA_STYLE=INT({number:23,hair:K,build:{height:1.75,bulk:.98},seed:23});
/** Federico Dimarco: number 32, 1.75 m */
const DIMARCO_STYLE=INT({number:32,hair:[K,.9],build:{height:1.75},seed:32});
/** Benfica: the red home shirts, white shorts, red socks (inferred) */
const BEN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,trim:[K,.5],boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',seed:5,...o});
/** Odysseas Vlachodimos (keeper colours inferred: yellow), André Onana (inferred: blue) */
const VLACHO:AthleteStyle={shirt:[Y,.95],shorts:[Y,.9],socks:[Y,.9],trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:[B,.7],sleeves:'long',build:{height:1.91},seed:51};
const ONANA:AthleteStyle={shirt:[B,.6],shorts:[B,.7],socks:[B,.6],trim:K,boots:K,skin:SKIN_D,hair:K,hairStyle:'short',line:K,gloves:[Y,.6],sleeves:'long',build:{height:1.9},seed:52};
/** referee Michael Oliver: dark kit inferred */
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:Y,boots:K,skin:SKIN_L,hair:[K,.5],hairStyle:'short',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Bastoni's first touch)
type Role='bas'|'int'|'ben'|'gk'|'ref';
/** a keyed move: kick (contact at `at`, toward actor `to` or the header point), header (contact at `at`), dive (full stretch at `at`),
 * lunge (full reach at `at`), take (a first touch that steps in to the ball at `at`) */
type Move={kind:'kick'|'head'|'dive'|'lunge'|'take';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Timeline (τ): Acerbi's pass out (−1.1) → Bastoni's first touch (0) → he carries it up → pass into Dimarco (2.3) → Dimarco comes inside
 * (3.0–4.3) while Bastoni overlaps round the outside → the return ball down the line (4.3 → 5.7) → Bastoni's touch on (6.5) → the cross
 * (7.2) → Barella's header (8.15) → the net. Only the cross, the header and Gilberto's side are confirmed; the rest is illustrative. */
const P_AC=-1.1,P_BD=2.3,T_D=3,P_DB=4.3,T_B=5.7,CROSS=7.2,HEAD=8.15,IN_NET=HEAD+.36;
const ACTORS:Actor[]=[
 {name:'Bastoni',role:'bas',style:BASTONI_STYLE,key:true,moves:[{kind:'take',at:0,dur:.7,side:'l'},{kind:'kick',at:P_BD,dur:.8,side:'l',power:.45},{kind:'kick',at:CROSS,dur:1,side:'l',power:.85}],
  keys:[[-6,36.6,-11],[-4,37,-11.6],[-2,38.4,-12.8],[-1,39.3,-13.5],[0,40.6,-14.3],[.75,43.4,-15.5],[1.5,46.6,-16.7],[2.3,49.8,-18],[3,53.8,-21.6],[3.8,58.4,-26.4],[4.6,63.8,-29.1],[5.2,68.6,-29.8],[5.7,73.2,-29.6],
   [6.5,79.4,-28.8],[7.2,83,-27.7],[7.8,84.2,-26.9],[8.6,85.4,-25.4],[9.6,87.4,-22],[11,91,-16]]},
 {name:'Barella',role:'int',style:BARELLA_STYLE,key:true,moves:[{kind:'head',at:HEAD,dur:1,side:'r'}],
  keys:[[-6,52,-5],[-3,55,-6],[0,58,-7],[3,64,-8],[5,72,-8],[6.5,82,-6.6],[7.5,90.8,-4],[8.15,96.4,-1.9],[8.6,98.2,-1.2],[9.4,99.6,.6],[11,98.6,5]]},
 {name:'Dimarco',role:'int',style:DIMARCO_STYLE,key:true,moves:[{kind:'take',at:T_D,dur:.7,side:'l'},{kind:'kick',at:P_DB,dur:.8,side:'l',power:.5}],
  keys:[[-6,56,-29],[-3,58,-29.5],[0,60,-29.2],[2,60.3,-27],[3,60.6,-25.4],[3.65,62.7,-23.4],[4.3,64.8,-21.6],[5.5,68,-20],[7.2,76,-17],[9,84,-13],[11,90,-10]]},
 {name:'Acerbi',role:'int',style:INT({number:15,hairStyle:'bald',hair:null,build:{height:1.92},seed:15}),moves:[{kind:'kick',at:P_AC,dur:.8,side:'l',power:.5}],
  keys:[[-6,34.5,-1.5],[-4,36,-2],[-2,37.6,-2.4],[P_AC,38.4,-2.6],[0,38.8,-2.8],[4,44,-4],[11,54,-5]]},
 {name:'Darmian',role:'int',style:INT({seed:36,hair:[K,.7]}),keys:[[-6,34,12],[0,38,12],[11,52,10]]},
 {name:'Brozovic',role:'int',style:INT({seed:77,hair:[K,.6]}),keys:[[-6,48,3],[0,52,2],[5,62,0],[11,74,-1]]},
 {name:'Mkhitaryan',role:'int',style:INT({seed:22,hair:[K,.9]}),keys:[[-6,56,10],[0,60,8],[5,72,6],[8.15,86,5],[11,92,4]]},
 {name:'Dumfries',role:'int',style:INT({seed:2,skin:SKIN_D,hair:K,build:{height:1.88}}),keys:[[-6,62,26],[0,70,25],[5,82,20],[8.15,92,14],[11,96,10]]},
 {name:'striker',role:'int',style:INT({seed:10,skin:SKIN_M,hair:K}),keys:[[-6,80,4],[0,84,4],[5,90,4],[7.2,93,3.8],[8.15,96,3.4],[11,99,3]]},
 {name:'striker2',role:'int',style:INT({seed:9,hair:[K,.8],build:{height:1.9}}),keys:[[-6,82,-8],[0,86,-9],[5,91,-8.6],[7.2,94,-7.6],[8.15,97.4,-6.4],[11,99,-4]]},
 {name:'Onana',role:'gk',style:ONANA,keys:[[-6,6,0],[0,8,-1],[11,14,-2]]},
 // Benfica: Gilberto caught upfield, the man who presses Bastoni, the one who follows Dimarco inside, the back line, Vlachodimos
 {name:'Gilberto',role:'ben',style:BEN({seed:41,skin:SKIN_M,hair:K,number:2,numberInk:'paper'}),key:true,
  keys:[[-6,38,-25.6],[-4,39.6,-25.8],[-2,41.4,-25.4],[0,42,-25],[1,43.2,-24.6],[2.3,46.6,-24.8],[3.5,52,-26],[4.6,58,-27],[5.7,64,-27.6],[7.2,72,-26.6],[9,79,-24],[11,84,-20]]},
 {name:'presser',role:'ben',style:BEN({seed:42,hairStyle:'long',hair:[K,.8]}),key:true,engage:[.2,1.8],moves:[{kind:'lunge',at:1.15,dur:.8,side:'l'}],
  keys:[[-6,50,-8],[-3,48,-9.5],[0,46.4,-12.4],[.8,45.6,-14],[1.3,45.4,-14.8],[2,46,-15.4],[3,48.6,-16.6],[6,56,-17],[11,66,-16]]},
 {name:'midfielder',role:'ben',style:BEN({seed:43,skin:SKIN_D,hair:K}),key:true,engage:[3.2,4.8],moves:[{kind:'lunge',at:4.45,dur:.8,side:'r'}],
  keys:[[-6,70,-14],[0,68,-17],[3,66.6,-19.4],[4,66.4,-20.2],[4.5,66.6,-20.6],[5.5,68.6,-20],[7.2,74,-17],[11,84,-12]]},
 {name:'cb1',role:'ben',style:BEN({seed:44,hair:[K,.9],build:{height:1.87}}),keys:[[-6,88,-7],[0,90,-7.5],[5,92,-7],[7.2,93.4,-5],[8.15,95.6,-3.2],[8.6,96.4,-2.8],[11,97,-2]]},
 {name:'cb2',role:'ben',style:BEN({seed:45,hairStyle:'balding',hair:[K,.7],build:{height:1.83}}),keys:[[-6,88,4],[0,90,3.5],[7.2,93,2.4],[8.15,95.4,1.4],[11,97,1]]},
 {name:'Grimaldo',role:'ben',style:BEN({seed:46,hair:[K,.8]}),keys:[[-6,80,18],[0,84,16],[7.2,90,10],[11,93,8]]},
 {name:'mid2',role:'ben',style:BEN({seed:47,skin:SKIN_M,hair:K}),keys:[[-6,66,2],[0,68,1],[5,78,0],[8.15,88,-2],[11,90,-2]]},
 {name:'mid3',role:'ben',style:BEN({seed:48,hairStyle:'curly',hair:K}),keys:[[-6,60,12],[0,62,10],[11,80,8]]},
 {name:'Vlachodimos',role:'gk',style:VLACHO,key:true,moves:[{kind:'dive',at:HEAD+.28,dur:.8,side:'l'}],keys:[[-6,103,.5],[4,102.6,-1],[7.2,102.8,-3.2],[8.15,103.3,-2.6],[11,103.3,-2.6]]},
 {name:'referee',role:'ref',style:REF,keys:[[-6,50,8],[0,54,7],[5,66,6],[9,80,6],[11,84,6]]},
];
const BAS=0,BAR=1,DIM=2,ACE=3,GIL=11,VLA=19;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6,T1=11,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
/** where actor k's LEFT foot meets the ball at τ: ahead along his run and a touch to his left */
function footAt(k:number,tau:number):[number,number]{const p=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1]);const f:Pt=l>.4?[v[0]/l,v[1]/l]:[1,0],left:Pt=[f[1],-f[0]];
 return[p[0]+f[0]*.5+left[0]*.14,p[1]+f[1]*.5+left[1]*.14];}

// ---------------------------------------------------------------- the ball: pass out, the carry, the pass inside, the return ball, the cross, the header
/** Barella's head at the moment of the header (from the athlete's own skeleton), so the cross meets his forehead exactly */
const HEAD_YAW=yawOf(.45,-.5);
const HP:V3=(()=>{const[x,z]=posOf(BAR,HEAD),sk=solve(header(.52),BARELLA_STYLE.build,{x,z,yaw:HEAD_YAW});const h=sk.head,f=sk.face;return[h[0]+(f[0]-h[0])*1.6,h[1]+.04,h[2]+(f[2]-h[2])*1.6];})();
const NET:V3=[105.35,.5,1.9],REST:V3=[106.3,.11,2.2];
type Leg={t0:number;t1:number;a:V3;b:V3;peak:number;bow:number;ease:'roll'|'air'};
const G=(p:[number,number]):V3=>[p[0],.11,p[1]];
const LEGS:Leg[]=(()=>{const L:Leg[]=[];const push=(t0:number,t1:number,a:V3,b:V3,peak=0,bow=0,ease:'roll'|'air'='roll')=>L.push({t0,t1,a,b,peak,bow,ease});
 // Acerbi's feet → Bastoni
 push(P_AC,0,G(footAt(ACE,P_AC)),G(footAt(BAS,0)));
 // the carry: touches at .75 and 1.5, then the pass into Dimarco
 push(0,.75,G(footAt(BAS,0)),G(footAt(BAS,.75)));push(.75,1.5,G(footAt(BAS,.75)),G(footAt(BAS,1.5)));push(1.5,P_BD,G(footAt(BAS,1.5)),G(footAt(BAS,P_BD)));
 push(P_BD,T_D,G(footAt(BAS,P_BD)),G(footAt(DIM,T_D)));
 // Dimarco comes inside with it, then slips it down the line
 push(T_D,3.65,G(footAt(DIM,T_D)),G(footAt(DIM,3.65)));push(3.65,P_DB,G(footAt(DIM,3.65)),G(footAt(DIM,P_DB)));
 push(P_DB,T_B,G(footAt(DIM,P_DB)),G(footAt(BAS,T_B)));
 // Bastoni: one touch on, then the cross
 push(T_B,6.5,G(footAt(BAS,T_B)),G(footAt(BAS,6.5)));push(6.5,CROSS,G(footAt(BAS,6.5)),G(footAt(BAS,CROSS)));
 push(CROSS,HEAD,G(footAt(BAS,CROSS)),HP,4.6,-3.2,'air');
 push(HEAD,IN_NET,HP,NET,.2,0,'air');
 return L;})();
function ballAt(tau:number):V3{
 if(tau<P_AC){const f=footAt(ACE,tau);return[f[0],.11,f[1]];}
 for(const l of LEGS)if(tau<l.t1){const u=clamp((tau-l.t0)/(l.t1-l.t0)),uu=l.ease==='roll'?1-Math.pow(1-u,1.7):u;
  const p=lerp3(l.a,l.b,uu),arc=l.peak*4*uu*(1-uu);
  // the cross bends: a sideways bow, strongest mid-flight (a left-footer crossing from the left curls it away from the keeper)
  const dx=l.b[0]-l.a[0],dz=l.b[2]-l.a[2],dl=Math.hypot(dx,dz)||1,bw=l.bow*4*uu*(1-uu);
  return[p[0]+dz/dl*bw,p[1]+arc,p[2]-dx/dl*bw];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return lerp3(NET,REST,e);
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the first touch: the left leg reaches in to cushion the ball, body over it, arms out */
const TAKE:Partial<Pose>={lHipF:40,lHipA:10,lKnee:34,lAnk:-10,rHipF:-8,rKnee:48,lean:20,bend:-6,lShA:58,rShA:44,lElb:34,rElb:40,neckP:30,squash:-.05};
/** the step up: chest up, head up to see the space */
const HEADUP:Partial<Pose>={neckP:-10,lean:10};
/** where a kick is aimed (ground point) */
function kickTarget(k:number,at:number):[number,number]{if(k===BAS&&at===CROSS)return[HP[0],HP[2]];for(const l of LEGS)if(Math.abs(l.t0-at)<1e-6)return[l.b[0],l.b[2]];return posOf(k,at+.5);}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4){const tgt=a.name==='presser'?BAS:DIM,m=posOf(tgt,tau);yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));}
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ben'?READY:stand();
 if(k===BAS||k===BAR){const s=clamp((sp-2)/4.5);p=blendPose(READY,runCycle(distOf(k,tau)/(k===BAS?4.3:3.9),{speed:.4+.6*s}),clamp((sp-.4)/1.2));}
 else if(sp>.5&&along<-.35*sp){const bp=runCycle(distOf(k,tau)/2.4,{speed:.2});p=blendPose(idle,bp,clamp((sp-.5)/.8));}
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/3.6,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='kick'){const u=(tau-(mv.at-STRIKE_CONTACT*mv.dur))/mv.dur;if(u>0&&u<1.4){const w=Math.min(sm(0,.12,u),1-sm(1,1.4,u)),tg=kickTarget(k,mv.at);p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.6}),w);
    // a left-footed strike: the body opens a little to the right of the target line
    yaw=lerpA(yaw,yawOf(tg[0]-x,tg[1]-z)+(mv.side==='l'?-.25:.25),w);}continue;}
  if(mv.kind==='take'){const w=bump(mv.at-.35,mv.at+.4,tau);if(w>0)p=over(p,TAKE,w*.85);continue;}
  if(mv.kind==='head'){const u=(tau-(mv.at-.52*mv.dur))/mv.dur;if(u>0&&u<1.4){const w=Math.min(sm(0,.1,u),1-sm(1,1.4,u));p=blendPose(p,header(Math.min(1,u)),w);yaw=lerpA(yaw,HEAD_YAW,w);}continue;}
  const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:.25});yaw=yawOf(-1,0);}}
 if(k===BAS){p=over(p,HEADUP,bump(.3,2.1,tau)*.7);p=over(p,HEADUP,bump(3.2,5.4,tau)*.8);
  if(tau>IN_NET+.2)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.2,IN_NET+.7,tau));}
 if(k===BAR&&tau>IN_NET+.25){p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.25,IN_NET+.8,tau));}
 if((a.name==='striker'||a.name==='striker2'||k===DIM)&&tau>IN_NET+.3)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.3,IN_NET+.8,tau));
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
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;bar?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 // replay cameras sit low among the players: an extra right in the lens (closer than 6 m) is left out so it never hides the move
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(hero&&!a.key?6:1.2))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: short, soft, straight down); big figures cast their own
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.17,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg&&inView(v,bg,br))ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,barR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===BAS?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===BAS||e.k===BAR||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&(e.k===BAS||e.k===BAR)}:{});
  if(e.k===BAS)heroR=r;if(e.k===BAR)barR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,bar:barR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replay and the lesson
/** the empty grass down the left channel behind Gilberto: a yellow wash from x0 to x1 (growing with w) */
function emptyGrass(s:Sheet,c:Cam,w:number,x0=58,x1=90){if(w<=0)return;const xe=x0+(x1-x0)*easeOut(clamp(w*1.2));
 const q=polyP(c,[[x0,.01,-33.4],[xe,.01,-33.4],[xe,.01,-21],[x0,.01,-23.5]]);if(q.length<3)return;const p=polyPath(q,true);s.knockout(p,.35*w);s.tone(Y,p,.6*w);}
/** a red ring on the grass round actor k (Gilberto upfield, Bastoni in the back line) */
function ringOn(s:Sheet,c:Cam,k:number,tau:number,w:number,seed:number){if(w<=0)return;const[x,z]=posOf(k,tau),r=groundRing(c,x,z,1.25*w,1.25*w,.1,seed);if(r){s.knockout(r,.85);s.fill(R,r,.95);}}
/** Bastoni's run: a red lane along his track from τa to τb (progress w) */
function runLane(s:Sheet,c:Cam,k:number,ta:number,tb:number,w:number,width=.45){if(w<=0)return;
 const pts:Pt[]=[];let d=1;const n=30;for(let i=0;i<=n;i++){const tau=lerp(ta,lerp(ta,tb,clamp(w)),i/n),[x,z]=posOf(k,tau),q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(5,c.F*width/d);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.1,wobble:.8}),.8);s.fill(R,ribbon(pts,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** a pass: a yellow dashed arrow on the grass for leg i (progress w) */
function passArrow(s:Sheet,c:Cam,a3:V3,b3:V3,w:number,seed:number){if(w<=0)return;const pa=pr(c,[a3[0],.05,a3[2]]),pb=pr(c,[b3[0],.05,b3[2]]);if(!pa||!pb)return;
 const d=toCam(c,[(a3[0]+b3[0])/2,0,(a3[2]+b3[2])/2])[2],wd=Math.max(5,c.F*.2/Math.max(1,d));
 s.knockout(ribbon([pa,pb],wd*1.8,{seed,taper:.1,wobble:.8}),.7*w);laneArrow(s,Y,pa,pb,wd,{progress:w,seed:seed+1,head:wd*3,dashed:true});}
const legAt=(t0:number)=>LEGS.find(l=>Math.abs(l.t0-t0)<1e-6)!;
/** the cross: its flight traced in the air (yellow), up to progress w */
function crossTrace(s:Sheet,c:Cam,w:number){if(w<=0)return;const pts:Pt[]=[];let d=1;for(let i=0;i<=26;i++){const tau=lerp(CROSS,lerp(CROSS,HEAD,w),i/26),q=toCam(c,ballAt(tau));if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(4,c.F*.09/d);s.knockout(ribbon(pts,wd*2,{seed:88,taper:.2,wobble:.6}),.6);s.fill(Y,ribbon(pts,wd,{seed:88,taper:.2,wobble:.6,gaps:[[.2,.28],[.45,.53],[.7,.78]]}),.95);}
/** speed lines streaming off actor k */
function speedLines(s:Sheet,c:Cam,k:number,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1,q=pr(c,[x,1,z]),q2=pr(c,[x+v[0]/l,1,z+v[1]/l]);if(!q||!q2)return;
 const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),Z=c.F/toCam(c,[x,1,z])[2],p=new Path2D();
 for(let j=0;j<3;j++){const oy=(j-1)*Z*.45,ox=Z*(.7+j*.2);p.addPath(ribbon([[q[0]-Math.cos(dir)*ox,q[1]-Math.sin(dir)*ox+oy],[q[0]-Math.cos(dir)*(ox+Z*(1.1+.3*j)),q[1]-Math.sin(dir)*(ox+Z*(1.1+.3*j))+oy]],Z*.05,{seed:9+j,taper:.9,wobble:.5}));}
 s.fill(K,p,.6*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, close to real time
const tau1=(t:number)=>key(t,[[0,-6],[CUEW(0,'Alessandro'),-2.6],[CUEW(0,'Space opens'),-1.2],[CUEW(0,'so he steps'),.1],[CUEW(0,'passes'),P_BD],[CUEW(0,'and races'),3.2],[CUEW(0,'down the wing'),5.4],[CUEW(0,'His cross'),CROSS],[CUEW(0,'Barella heads'),HEAD],[SECS(0)+1,HEAD+SECS(0)+1-CUEW(0,'Barella heads')]],linear);
const CAM1:V3=[52.5,25,72];
function cam1(t:number):Cam{
 const G=CUEW(0,'Barella heads'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // lead the play a little toward the goal, settle on the box for the header and the celebration
 const lead=sm(-1,1,tau)*(1-sm(6.5,8,tau))*4,box:V3=[95,1,-4];
 const wide=1-sm(CUEW(0,'Benfica against'),CUEW(0,'Alessandro'),t,easeInOutSine),T=lerp3([bt[0]+lead,1.2+9*wide,bt[2]*.85-14*wide],box,sm(CUEW(0,'His cross')-.2,G-.2,t,easeInOutSine));
 const F=key(t,[[0,3600],[CUEW(0,'Benfica against'),4400],[CUEW(0,'Alessandro'),7200],[CUEW(0,'so he steps'),7800],[CUEW(0,'down the wing'),7400],[CUEW(0,'His cross'),7000],[G,7600],[G+1.4,8600],[S,8800]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Barella heads');
  stadium(s,c,v,t,{roar:sm(G+.3,G+.8,t),flash:sm(G+.35,G+.6,t),away:sm(G+.3,G+.8,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(BAR,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:11,
};

// ---------------------------------------------------------------- 2 · slow replay, raised camera behind Bastoni: the right back upfield, the empty grass, the overlap
const tau2=(t:number)=>key(t,[[0,1.5],[CUEW(1,'Their right'),1.9],[CUEW(1,'leaving'),P_BD+.1],[CUEW(1,'Bastoni runs'),2.9],[CUEW(1,'round his'),3.8],[CUEW(1,'into that space'),4.7],[SECS(1),6.1]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(BAS,tau),rb=CUEW(1,'Their right'),look2=sm(rb-.4,rb+.3,t,easeInOutSine)*(1-sm(CUEW(1,'leaving')-.3,CUEW(1,'leaving')+.5,t,easeInOutSine));
 // behind him and up, looking down the wing; a glance back over his shoulder at Gilberto; then riding with the overlap
 let C:V3=[m[0]-10,3.6,m[1]+6],T:V3=[m[0]+11,.4,m[1]-3.5];let F=1850;
 const g=posOf(GIL,tau);C=lerp3(C,[m[0]-3,4.6,m[1]+10],look2);T=lerp3(T,[(g[0]+m[0])/2+2,.6,(g[1]+m[1])/2],look2);F=lerp(F,1500,look2);
 const run=sm(CUEW(1,'into that space')-.5,SECS(1),t,easeInOutSine);C=lerp3(C,[m[0]-8,3,m[1]+4.5],run);T=lerp3(T,[m[0]+12,.5,m[1]-1],run);
 return look(C,T,F);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),rb=CUEW(1,'Their right'),eg=CUEW(1,'leaving'),br=CUEW(1,'Bastoni runs'),rh=CUEW(1,'round his'),ins=CUEW(1,'into that space'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const fade=1-sm(E-.9,E-.5,t);
  emptyGrass(s,c,sm(eg-.2,eg+.6,t)*fade);
  passArrow(s,c,legAt(P_BD).a,legAt(P_BD).b,sm(eg-.1,eg+.4,t,easeOut)*(1-sm(rh+.3,rh+.8,t)),64);
  runLane(s,c,BAS,P_BD,T_B,sm(br-.2,ins+.2,t,easeInOutSine)*fade,.4);
  passArrow(s,c,legAt(P_DB).a,legAt(P_DB).b,sm(ins-.1,ins+.5,t,easeOut)*fade,66);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:()=>{
   ringOn(s,c,GIL,tau,sm(rb-.1,rb+.35,t,easeOutBack)*(1-sm(eg+.6,eg+1.1,t)),91);
   speedLines(s,c,BAS,tau,sm(rh-.2,rh+.3,t)*(1-sm(E-.8,E-.4,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(BAS,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:5,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the cross, the header, the net, the celebration
const tau3=(t:number)=>{const w=CUEW(2,'Inter won');return key(t,[[0,CROSS-1.3],[CUEW(2,'a cross'),CROSS-.1],[CUEW(2,'a thumping'),HEAD-.05],[CUEW(2,'Nicolò'),IN_NET+.1],[w,IN_NET+1.1],[SECS(2),IN_NET+1.1+(SECS(2)-w)*.8]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'Nicolò');return sm(a+.4,CUEW(2,'Inter won')+.5,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(BAR,tau),u=swing3(t),e=sm(CROSS,HEAD,tau,easeInOutSine);
 // behind the goal, a little to the right of it: the cross comes in from the left, Barella attacks it
 const C0:V3=[117,5.4,4.5],T0:V3=[lerp(88,97,e),lerp(1.2,1.6,e),lerp(-16,-2.5,e)];
 const C1:V3=[m[0]-8,2.4,m[1]+8.5],T1:V3=[m[0]+.4,1.2,m[1]-1];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2900+700*e,3000,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),cr=CUEW(2,'a cross'),th=CUEW(2,'a thumping'),nb=CUEW(2,'Nicolò'),iw=CUEW(2,'Inter won'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(nb-.1,nb+.3,t)*(1-sm(nb+1,nb+1.4,t)),away:Math.max(sm(IN_NET,IN_NET+.3,tau),sm(iw-.2,iw+.4,t))});
  ground(s,c,{goalLater:u<.5});
  crossTrace(s,c,sm(cr-.15,th,t,linear)*(1-sm(nb+.4,nb+.9,t)));
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({bar,bg})=>{
   // "a thumping header": a spark on his forehead at contact
   const age=tau-HEAD;if(bar&&age>-.05&&age<.35){const h=bar.joints.head;sparkBurst(s,Y,h[0],h[1],c.F*.6/Math.max(1,toCam(c,HP)[2]),{n:9,seed:93,g:easeOutBack(clamp((age+.05)/.15))*(1-clamp((age-.2)/.15)),width:9});}
   if(bg&&tau>IN_NET&&tau<IN_NET+.12)sparkBurst(s,Y,bg[0],bg[1],60,{n:7,seed:90,width:8});}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(BAR,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised three-quarter camera behind him as he steps out of the back line
const tau4=(t:number)=>key(t,[[0,-1.2],[CUEW(3,'when'),-.7],[CUEW(3,'a defender'),-.1],[CUEW(3,'step up'),.5],[CUEW(3,'join'),2.6],[SECS(3),4.4]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(BAS,tau),go=sm(CUEW(3,'step up')-.3,CUEW(3,'join')+1,t,easeInOutSine);
 const C:V3=[m[0]-10+2*go,6-1.4*go,m[1]+11-2*go],T:V3=[m[0]+9+5*go,.3,m[1]-4-3*go];
 return look(C,T,1900+200*go);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),ws=CUEW(3,'when'),ad=CUEW(3,'a defender'),su=CUEW(3,'step up'),ja=CUEW(3,'join'),E=SECS(3),fade=1-sm(E-.9,E-.5,t);
  stadium(s,c,v,t);
  ground(s,c);
  emptyGrass(s,c,sm(ws-.1,ws+.7,t)*fade,52,86);
  runLane(s,c,BAS,0,T_B,sm(su-.2,ja+1.2,t,easeInOutSine)*fade,.42);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   ringOn(s,c,BAS,tau,sm(ad-.1,ad+.35,t,easeOutBack)*(1-sm(su+.4,su+.9,t)),97);
   // "join the attack": a yellow arrow from him toward the penalty box
   const jw=sm(ja-.1,ja+.6,t,easeOut)*fade;if(hero&&jw>0){const[x,z]=posOf(BAS,tau),a=pr(c,[x+2,.05,z]),b=pr(c,[92,.05,-8]);if(a&&b){const wd=Math.max(5,c.F*.28/Math.max(1,toCam(c,[x+10,0,z])[2]));s.knockout(ribbon([a,b],wd*1.8,{seed:98,taper:.1}),.6*jw);laneArrow(s,Y,a,b,wd,{progress:jw,seed:99,head:wd*3,dashed:true});}}
   speedLines(s,c,BAS,tau,sm(su,su+.4,t)*fade);}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'bastoni-signature',format:'11v11',title:'Bastoni: The Centre-Back Who Joins the Attack',theme:'When the space opens, a defender can step up and join the attack',
 ageNote:'Champions League quarter-final, first leg, Benfica 0–2 Inter, Lisbon, 11 April 2023. For players of every age.',
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
