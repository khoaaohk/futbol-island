/** Ryan Giggs v Arsenal, FA Cup semi-final replay, Villa Park, Birmingham, 14 April 1999 (Arsenal 1–2 Manchester United, after extra
 * time): the winning goal in the 109th minute. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN
 * accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched Sept 2026, cached in the film agents' scratchpad src-cache):
 *  - Wikipedia, "Arsenal 1–2 Manchester United (1999)" (raw wikitext: summary, kit infobox, Martin Tyler's commentary quote)
 *    https://en.wikipedia.org/wiki/Arsenal_1%E2%80%932_Manchester_United_(1999)
 *  - Wikipedia, "1998–99 FA Cup", semi-finals section  https://en.wikipedia.org/wiki/1998%E2%80%9399_FA_Cup
 *  - BBC News, "Giggs magic sinks Gunners" (14 April 1999)  https://news.bbc.co.uk/2/hi/sport/football/fa_cup/319696.stm
 *  - The Guardian, "Arsenal 1 - 2 Man Utd" minute-by-minute report (April 1999)  https://www.theguardian.com/football/1999/apr/14/newsstory.sport3
 *  - ManUtd.com, "On This Day: Giggs tears Arsenal to ribbons" (Harry Robinson)
 *    https://www.manutd.com/en/news/detail/on-this-day-1999-fa-cup-semi-final-giggs-april-14th-2021
 *  - The Guardian, "The Joy of Six: FA Cup semi-final memories" (Rob Smyth, 15 April 2011) — context only
 * CONFIRMED by those accounts: Wednesday 14 April 1999, Villa Park, the replay after a 0–0 draw; Beckham 17–18' (0–1), Bergkamp 69' (1–1,
 * deflected), Keane sent off (second yellow, on Overmars), Schmeichel saved Bergkamp's injury-time penalty; extra time; in the 109th minute
 * Patrick Vieira misplaced a "weary" pass that Giggs (on as a 62nd-minute substitute for Blomqvist) intercepted just inside the Manchester
 * United half; he "runs down the left" and dribbles past Vieira, Lee Dixon (twice), Martin Keown and Tony Adams — "with 11 touches" — and
 * beats David Seaman with a LEFT-footed strike "into the roof of the net from a tight angle" / "lashed the ball over Seaman"; United had ten
 * men; he turned and ran back toward his own half, took his shirt off and whirled it through the air in front of a "raucous United end";
 * compared with Maradona's 1986 solo goal; KIT (Wikipedia match infobox): Arsenal in their red home shirts with white sleeves and white
 * shorts; United in their WHITE away shirts with BLACK shorts and black socks; the BBC report was published 22:43 GMT, so the goal came
 * under floodlights on a dark evening. Line-ups at the moment of the goal: Kanu had replaced Parlour (105'), Overmars Ljungberg; Scholes,
 * Yorke and Giggs were United's substitutes on the pitch.
 * INFERRED (illustrative): every position and timing between those beats (the order Vieira → Dixon → Dixon again → Keown → Adams follows the
 * sources' listing and Tyler's "past Dixon who comes back at him" but no account gives the full sequence; the line of the run; which way each
 * cut went — out past Dixon, in as he comes back, out past Keown; how each defender lunged, Adams sliding in as he shot); the spacing of the 11 touches and that
 * every touch is with the left foot; the shooting spot (≈ 9 m out, ≈ 6.5 m wide of the near post) and the ball's line; Seaman coming off
 * his line and going down low toward the ball; the direction of play on screen (United attacking right to left under the main-stand
 * camera, so the left wing is the near side); Giggs's shirt number (11, his usual number that season) and hair; Arsenal's socks (red, per
 * the infobox base colour) — and athlete.ts prints one ink for shirt and sleeves, so Arsenal's white sleeves are NOT drawn; Seaman's
 * keeper kit (a blue shirt) and the referee's black kit; which hand whirled the shirt; the other 17 players' positions; Villa Park's shape
 * (four rectangular roofed stands, lamp strips along the roof lips), the crowd colours, the ball design, the camera placements.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, panning with the ball from Vieira's pass to the goal; 2 = slow-motion replay from a low touchline camera: close touches (a thread
 * from his left boot to the ball, touch ticks), a fast replay pan, then the three changes of direction (orange route arrows on the grass,
 * out · in · out) and each lunge that meets only air; 3 = replay from behind the goal: the tight-angle finish over the diving keeper into the
 * roof of the net, then a swing round to the shirt-whirling celebration run; 4 = the lesson from low behind Giggs (ball-close ring, touch
 * ticks, the change-of-direction arrow, speed lines, then the keeper going down and the yellow "finish high" target in the top of the goal).
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). World: right-handed metres
 * exactly like athlete.ts (X toward Arsenal's goal at 105, Y up, Z across; the main-stand camera sits at −Z, which is United's LEFT wing),
 * so his left foot is his left foot without a mirrored projector. Scenes read only (t, c); every action keys off cue times, so the recorded
 * voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,slideTackle,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈ .2 s a word + .021 s a letter + punctuation pauses, calibrated on the voiced Maradona film) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:"Villa Park, 1999, extra time. Ryan Giggs pounces on a loose pass in his own half. Past Vieira, past Dixon twice, past Keown, past Adams... he scores!",tail:2.1,
  cues:['Villa Park','extra time','Ryan Giggs','pounces','own half','Past Vieira','past Dixon','twice','past Keown','past Adams','he scores']},
 {label:'Watch it again',text:"Watch it again, slowly. Close touches keep the ball tight to his left foot. At full speed he changes direction: out, in, out! Defenders can't keep up.",tail:1.3,
  cues:['Watch it again','Close touches','tight','left foot','At full speed','changes direction','out,','in,','out!','Defenders']},
 {label:'Into the roof',text:'From a tight angle, he lashes it high over David Seaman, into the roof of the net!',tail:2.6,
  cues:['From a tight angle','lashes','high over','David Seaman','into the roof']},
 {label:'Your turn',text:'Your turn: dribble with close touches, change direction at speed, and when the keeper goes down, finish high!',tail:1.6,
  cues:['Your turn','dribble','close touches','change direction','at speed','keeper goes down','finish high']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py giggs-arsenal-1999, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/giggs-arsenal-1999/timing.json';
 * and pass `timingJson as NarrationTiming` here: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times itself. */
import timingJson from '../../../public/plays/narration/giggs-arsenal-1999/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .2 s + .021 s a letter per word, pauses after , : . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.34;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('giggs: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('giggs: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (United attack +X, Arsenal's goal line at 105), Y up, Z across
 * (0 = the middle, −34 = the near touchline under the main-stand camera = United's left wing). A figure facing +X has its right side at +Z. */
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
function quadP(c:Cam,q:V3[],minDepth=8):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Villa Park at night: four roofed stands, floodlit crowd, lamp strips
/** stand planes (a along, b up the rake 0..1): 0 the far side (+Z), 1 behind Arsenal's goal (X > 105), 2 the near main stand (−Z, the
 * camera's gantry side), 3 behind the other goal. Shapes are illustrative (inferred), not a survey of 1999 Villa Park. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-7,112,a),1.5+17*b,40+25*b],
 (a,b)=>[112+24*b,1.5+19*b,lerp(40,-40,a)],
 (a,b)=>[lerp(112,-7,a),1.5+13*b,-40-19*b],
 (a,b)=>[-7-23*b,1.5+18*b,lerp(-40,40,a)],
];
const SEGS=10,ROWS=12,COLS=[96,62,96,62];
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 // a dark April night over Birmingham: a deep blue-navy sky, lifted a little by the floodlight haze
 const sky=rectPath(-1e4,-1e4,2e4,2e4);s.tone(B,sky,.55);s.tone(K,sky,.62);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),lip=new Path2D(),lamp=new Path2D(),halo=new Path2D();
 const pts=(S:(a:number,b:number)=>V3,a0:number,a1:number,b0:number,b1:number):V3[]=>[S(a0,b0),S(a1,b0),S(a1,b1),S(a0,b1)];
 const up=(p:V3,d:number):V3=>[p[0],p[1]+d,p[2]];
 STANDS.forEach((S,si)=>{for(let i=0;i<SEGS;i++){const a0=i/SEGS,a1=(i+1)/SEGS,q=quadP(c,pts(S,a0,a1,0,1));if(!q)continue;addPoly(planes,q);
   const w=quadP(c,pts(S,a0,a1,.47,.52));if(w)addPoly(walk,w);
   // the cantilever roof: a dark overhang from the back wall out over the top rows, a paper fascia along its lip, lamps under the lip
   const rq=quadP(c,[up(S(a0,1),2),up(S(a1,1),2),up(S(a1,.72),9),up(S(a0,.72),9)]);if(rq)addPoly(roof,rq);
   seg3(c,up(S(a0,.72),8.8),up(S(a1,.72),8.8),.5,lip);
   if(si!==2){const m=(a0+a1)/2,L=up(S(m,.72),8.1),q2=toCam(c,L);if(q2[2]>12){seg3(c,up(S(m-.03,.72),8.1),up(S(m+.03,.72),8.1),.8,lamp);const g=scr(c,q2),r2=clamp(c.F*5/q2[2],6,140);halo.addPath(polyPath(blob(g[0],g[1]+r2*.35,r2*1.6,r2,si*31+i,{amp:.06,n:16}),true));}}}});
 s.tone(Y,halo,.16);
 s.knockout(planes);s.tone(B,planes,.4);s.tone(K,planes,.42);s.knockout(walk,.5);
 // the crowd: one mark per seat group, sized by distance; red and white for both clubs, a little navy and yellow; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 STANDS.forEach((S,si)=>{const cols=COLS[si];for(let j=0;j<ROWS;j++){const b=(j+.5)/ROWS;if(Math.abs(b-.495)<.04)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<8)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.55/q[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.6?0:h<.84?1:h<.95?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}});
 s.knockout(inks[0],.75);s.fill(R,inks[1],.92);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(lip,.75);
 s.knockout(lamp);s.fill(Y,lamp,.95);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const r1=hash(i*17+T12*101,3),r2=hash(i*29+T12*7,4),q=pr(c,STANDS[Math.floor(r1*4)](r2,.1+.8*hash(i,T12)));if(!q||!inView(v,q))continue;
  const z=8+14*flash*hash(i,T12+3);p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the dark surround, floodlit grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (the Arsenal goal drawn later when it
 * is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-8,0,-40],[113,0,-40],[113,0,40],[-8,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.5);s.tone(K,p,.35);}
 const g=polyP(c,[[-5,0,-37],[110,0,-37],[110,0,37],[-5,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.84);s.tone(K,gp,.08);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]));s.tone(K,st,.1);
 // boards: the far touchline and behind both goals, navy with yellow panels (the near boards sit under the camera)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,37],[109,0,37],[109,.9,37],[-4,.9,37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,36.95],[x+3.4,.25,36.95],[x+3.4,.65,36.95],[x,.65,36.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));addPoly(pn,polyP(c,[[-3.45,.25,z],[-3.45,.25,z+3.4],[-3.45,.65,z+3.4],[-3.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 // corner flags at Arsenal's end
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);addPoly(flag,polyP(c,[[105,1.55,z],[105,1.2,z],[104.55,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,NET[2]);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back and the roof out around z = bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))),top=(z:number)=>1.9+bulge*.35*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.4,-1.2,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),top(z0),z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),top(z1),z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),top(z),z],.025,mesh,.7);seg3(c,[back(z),top(z),z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=j/6;for(let i=0;i<zs.length-1;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),top(za)*y,za],[back(zb),top(zb)*y,zb],.025,mesh,.7);}seg3(c,[X,y*H,z0],[back(z0),top(z0)*y,z0],.025,mesh,.7);seg3(c,[X,y*H,z1],[back(z1),top(z1)*y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;for(let i=0;i<zs.length-1;i++){const za=zs[i],zb=zs[i+1];seg3(c,[lerp(X,back(za),u),lerp(H,top(za),u),za],[lerp(X,back(zb),u),lerp(H,top(zb),u),zb],.025,mesh,.7);}}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.3],[R,.2]];
const SKIN_W:InkFill[]=[[Y,.34],[R,.26]];
const SKIN_D:InkFill[]=[[Y,.42],[R,.36],[K,.2]];
/** Manchester United: the white away shirt (paper), black shorts and socks (confirmed); black trim and numbers inferred */
const UTD=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.95],socks:[K,.95],boots:K,trim:K,numberInk:K,skin:SKIN,hair:K,hairStyle:'short',line:K,seed:3,...o});
const GIGGS_ST=UTD({number:11,skin:SKIN_W,hair:[K,.95],hairStyle:'curly',build:{height:1.8,bulk:.94,thighs:1.04},seed:11});
/** after the goal: the shirt comes off (a light skin screen for the bare torso; the whirled shirt is drawn in his hand) */
const GIGGS_BARE:AthleteStyle={...GIGGS_ST,shirt:[R,.26],number:null,trim:null};
/** Arsenal: red shirts, white shorts (confirmed; the white sleeves cannot print — one ink per shirt); red socks per the infobox base colour */
const ARS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,trim:'paper',numberInk:'paper',skin:SKIN,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** David Seaman: keeper kit inferred (blue shirt, navy shorts), gloves inferred */
const SEAMAN:AthleteStyle={shirt:[B,.8],shorts:[K,.9],socks:[B,.8],boots:K,skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,gloves:[Y,.7],sleeves:'long',trim:K,build:{height:1.93,bulk:1.06},seed:51};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN,hair:[K,.9],hairStyle:'balding',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Giggs's interception)
type Role='giggs'|'ars'|'gk'|'utd'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a slide tackle (on the ground from `at`, heading `yaw`),
 * a short pass (contact at `at`) */
type Move={kind:'lunge'|'dive'|'slide'|'pass';at:number;dur:number;side:'l'|'r';yaw?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** the shot and the pass (τ) */
const SHOT=8.0,PASS=-1;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The Arsenal players named in the accounts get the beats the accounts give them
 * (Vieira's pass, Dixon twice, Keown, Adams, Seaman); where exactly each stood and in which order is inferred. */
const ACTORS:Actor[]=[
 {name:'Giggs',role:'giggs',style:GIGGS_ST,key:true,keys:[[-2.6,46.6,-13.6],[-1.6,47.9,-12.2],[-.7,49.3,-10.6],[0,50.4,-9.6],[.4,52.1,-9.5],[.8,54.2,-9.9],[1.2,56.5,-10.6],[1.6,58.9,-11.4],[2.4,63.5,-12.9],[2.9,66.3,-13.4],[3.3,68.4,-13.6],[3.7,70.6,-15.2],[4.2,73.4,-15.9],[4.6,75.4,-15.8],[4.95,77.2,-15],[5.35,79.2,-13.4],[5.8,81.4,-12.3],[6.1,83,-12.2],[6.5,85.2,-13.1],[7,88.3,-12.8],[7.5,91.6,-11.6],[7.8,93.6,-11.1],[8,94.7,-10.8],[8.3,95.6,-10.9],[8.8,96.7,-12.3],[9.4,96.9,-14.8],[10.2,96,-17.8],[11.2,92.6,-20.8],[12.5,87.6,-23.2],[14,81.8,-24.8],[16,74.5,-25.8],[18,67.5,-26.2]]},
 {name:'Vieira',role:'ars',style:ARS({skin:SKIN_D,seed:34,build:{height:1.93,bulk:.96}}),key:true,engage:[-.2,1],moves:[{kind:'pass',at:PASS,dur:.8,side:'r'},{kind:'lunge',at:.55,dur:.8,side:'r'}],keys:[[-2.6,56.8,-2.6],[-1.6,55.6,-3.6],[-1,54.8,-4.4],[0,54.2,-5.9],[.5,53.6,-7.8],[1,54,-8.8],[1.6,55.4,-9.4],[3,59.5,-10],[8,68,-10],[18,72,-12]]},
 {name:'Dixon',role:'ars',style:ARS({seed:32,hair:[K,.8]}),key:true,engage:[2.4,5.2],moves:[{kind:'lunge',at:3.35,dur:.8,side:'r'},{kind:'lunge',at:4.98,dur:.8,side:'r'}],keys:[[-2.6,73,-15],[1,71.6,-13.6],[2.6,70.3,-12.4],[3.3,69.9,-12.3],[3.6,70.1,-12.6],[4,71.5,-13.3],[4.5,74,-13.4],[4.9,76,-13.6],[5.4,77.3,-14.3],[6,79.5,-15],[7,84,-15],[9,89,-15],[18,92,-15]]},
 {name:'Keown',role:'ars',style:ARS({seed:33,hairStyle:'short',build:{height:1.85,bulk:1.06}}),key:true,engage:[4.8,6.4],moves:[{kind:'lunge',at:6.1,dur:.8,side:'r'}],keys:[[-2.6,84,-4],[2,82.5,-6.5],[4.5,81.8,-9.2],[5.6,82.4,-10.4],[6,82.6,-10.7],[6.5,83,-10.9],[7.2,86,-11],[9,90.5,-10.5],[18,93,-9]]},
 {name:'Adams',role:'ars',style:ARS({seed:36,build:{height:1.91,bulk:1.08}}),key:true,engage:[6,7.4],moves:[{kind:'slide',at:SHOT-.08,dur:1.1,side:'r',yaw:yawOf(2.9,-2.8)}],keys:[[-2.6,86,1.5],[3,86,-.8],[5.5,88.6,-4.5],[6.6,91,-6.6],[7.2,92.3,-7.4],[7.46,92.5,-7.6],[18,92.5,-7.6]]},
 {name:'Seaman',role:'gk',style:SEAMAN,key:true,moves:[{kind:'dive',at:SHOT+.1,dur:.75,side:'r'}],keys:[[-2.6,103.8,.3],[5,103.4,-.8],[7,102.6,-2.4],[7.69,102.2,-3.2],[18,102.2,-3.2]]},
 {name:'Winterburn',role:'ars',style:ARS({seed:37}),keys:[[-2.6,74,14],[8,84,4],[18,88,0]]},
 {name:'Petit',role:'ars',style:ARS({seed:38,hairStyle:'ponytail',hair:[Y,.55]}),keys:[[-2.6,60,3],[8,68,0],[18,72,-2]]},
 {name:'Kanu',role:'ars',style:ARS({seed:39,skin:SKIN_D,build:{height:1.97,bulk:.92}}),keys:[[-2.6,50,8],[8,62,2],[18,70,-4]]},
 {name:'Bergkamp',role:'ars',style:ARS({seed:40,hair:[Y,.5]}),keys:[[-2.6,44,2],[8,58,-4],[18,66,-8]]},
 {name:'Anelka',role:'ars',style:ARS({seed:41,skin:SKIN_D}),keys:[[-2.6,40,-2],[8,54,-8],[18,62,-12]]},
 {name:'Overmars',role:'ars',style:ARS({seed:42,skin:SKIN_D,hairStyle:'bald',build:{height:1.73}}),keys:[[-2.6,43,16],[8,56,10],[18,64,4]]},
 {name:'Yorke',role:'utd',style:UTD({seed:21,skin:SKIN_D}),keys:[[-2.6,58,12],[7,84,0],[9,91,-5],[11,91,-14],[13,87,-19.5],[15,81,-22.5],[18,74,-24]]},
 {name:'Scholes',role:'utd',style:UTD({seed:22,hair:[R,.7]}),keys:[[-2.6,46,6],[8,64,-2],[18,74,-14]]},
 {name:'Beckham',role:'utd',style:UTD({seed:23,hair:[Y,.9]}),keys:[[-2.6,48,22],[8,70,10],[12,82,-6],[18,80,-18]]},
 {name:'Butt',role:'utd',style:UTD({seed:24}),keys:[[-2.6,41,-3],[8,60,-8],[18,70,-16]]},
 {name:'P. Neville',role:'utd',style:UTD({seed:25}),keys:[[-2.6,33,-17],[18,50,-18]]},
 {name:'Stam',role:'utd',style:UTD({seed:26,hairStyle:'bald',build:{height:1.91,bulk:1.1}}),keys:[[-2.6,27,-3],[18,40,-4]]},
 {name:'Johnsen',role:'utd',style:UTD({seed:27}),keys:[[-2.6,27,6],[18,40,4]]},
 {name:'G. Neville',role:'utd',style:UTD({seed:28}),keys:[[-2.6,31,17],[18,46,12]]},
 {name:'referee',role:'ref',style:REF,keys:[[-2.6,57,5],[8,80,-3],[18,86,-8]]},
];
const GIGGS=0,VIEIRA=1,DIXON=2,KEOWN=3,SEAMAN_K=5;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3,T1=18,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Vieira's pass, eleven left-foot touches (the last is the shot), the roof of the net
/** the 11 touches ("with 11 touches", ManUtd.com): the interception, the dribble, the cuts at Dixon (3.3), Dixon again (4.95) and Keown
 * (6.1), and the shot. Spacing inferred. */
const TOUCHES:number[]=[0,.8,1.6,2.45,3.3,4.2,4.95,5.6,6.1,7.0,SHOT];
/** his dribble stride is synced to the touches: one gait cycle between touches, the touch landing at the gait's touchPhase */
const CYCN=TOUCHES.slice(0,-1).map((T,i)=>Math.max(1,Math.round((TOUCHES[i+1]-T)*1.3)));
function gPhase(tau:number):number{if(tau<=0)return touchPhase+tau*1.35;let acc=0;
 for(let i=0;i+1<TOUCHES.length;i++){if(tau<TOUCHES[i+1])return touchPhase+acc+CYCN[i]*(tau-TOUCHES[i])/(TOUCHES[i+1]-TOUCHES[i]);acc+=CYCN[i];}
 return touchPhase+acc+(tau-SHOT)*1.35;}
/** his heading (yaw), smoothed from the track; through the strike it swings toward the shot line */
const SHOT_YAW=(()=>{const[x,z]=posOf(GIGGS,SHOT);return yawOf(105.5-x,-2.4-z);})();
function yawG(tau:number):number{const v=velOf(GIGGS,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):0;return lerpA(head,SHOT_YAW,bump(SHOT-.55,SHOT+.45,tau)*.7);}
/** his forward and left directions on the ground (x, z) */
const fwdL=(tau:number):[Pt,Pt]=>{const y=yawG(tau);return[[Math.cos(y),-Math.sin(y)],[-Math.sin(y),-Math.cos(y)]];};
/** ball spot for the left foot: ahead and a touch to his left */
const footAt=(tau:number):[number,number]=>{const p=posOf(GIGGS,tau),[f,l]=fwdL(tau);return[p[0]+f[0]*.46+l[0]*.12,p[1]+f[1]*.46+l[1]*.12];};
const TP=TOUCHES.map(footAt);
/** the finish: from the last touch spot, rising, over the keeper, into the roof of the net just inside the near post (inferred line) */
const FLY=.38,IN_NET=SHOT+FLY;
const NET:V3=[106.1,2.08,-2.4],REST:V3=[106.3,.11,-1.7];
const vieiraBall=(tau:number):[number,number]=>{const p=posOf(VIEIRA,tau),to=footAt(0),d=Math.hypot(to[0]-p[0],to[1]-p[1])||1;return[p[0]+(to[0]-p[0])/d*.45,p[1]+(to[1]-p[1])/d*.45];};
function ballAt(tau:number):V3{
 if(tau<PASS){const b=vieiraBall(tau);return[b[0],.11,b[1]];}
 if(tau<0){const x=vieiraBall(PASS),u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.4),to=TP[0];return[lerp(x[0],to[0],e),.11,lerp(x[1],to[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/FLY;return[lerp(s0[0],NET[0],u),lerp(.11,NET[1],u)+.28*Math.sin(Math.PI*u),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e)+.35*Math.sin(Math.PI*Math.min(1,u*1.4))*(1-u),lerp(NET[2],REST[2],e)];
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
/** stepping in to cut out the pass: a long reach with the left boot, arms out */
const INTERCEPT:Partial<Pose>={lHipF:52,lKnee:18,lAnk:-16,rHipF:-14,rKnee:40,lean:14,lShA:58,rShA:46,lElb:30,rElb:36,neckP:32,squash:-.04};
/** pulling the shirt up over his head: both arms up, elbows bent */
const PULL:Partial<Pose>={lShA:150,rShA:150,lShF:30,rShF:30,lElb:110,rElb:110,neckP:18,lean:8};
/** whirling the shirt: right arm straight up (hand inferred), left arm out wide, head back, mouth open to the crowd */
const WHIRL:Partial<Pose>={rShA:168,rShF:12,rElb:14,rShR:10,lShA:86,lShF:10,lElb:24,neckP:-24,lean:-2,twist:6};
/** celebration timing (τ): the shirt comes off at SHIRT_OFF */
const SHIRT_OFF=9.8;
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(GIGGS,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===GIGGS)yaw=yawG(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ars'?READY:stand();
 if(k===GIGGS){// short, quick dribbling strides synced to the touches (left foot), more run in them at full speed
  const s=clamp((sp-2)/4.5);p=blendPose(idle,dribble(gPhase(tau),{foot:'l',speed:.5+.4*s}),clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='pass'){const t0=mv.at-STRIKE_CONTACT*mv.dur,u=(tau-t0)/mv.dur;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.3}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));continue;}
  const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='slide'?.42:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.02});
  if(mv.kind==='slide'&&u>0){p=slideTackle(Math.min(1,u),{foot:mv.side});yaw=mv.yaw??yaw;}}
 if(k===GIGGS){
  p=over(p,INTERCEPT,bump(-.45,.3,tau));
  p=over(p,CUT(-1),bump(3.0,3.65,tau));p=over(p,CUT(1),bump(4.65,5.3,tau));p=over(p,CUT(-1),bump(5.8,6.45,tau));
  const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:1}),Math.min(sm(0,.15,u),1-sm(1,1.5,u)));
  // the celebration: arms up as he wheels away, the shirt pulled over his head, then whirled overhead all the way back
  if(tau>SHOT+.8)p=over(p,{lShA:120,rShA:120,lShF:20,rShF:20,lElb:40,rElb:40,neckP:-18},sm(SHOT+.8,SHOT+1.2,tau)*(1-sm(SHIRT_OFF-.6,SHIRT_OFF-.35,tau)));
  p=over(p,PULL,bump(SHIRT_OFF-.6,SHIRT_OFF+.15,tau)*1.4);
  if(tau>SHIRT_OFF)p=over(p,{...WHIRL,rShF:12+14*Math.sin(tau*TAU*1.6)},sm(SHIRT_OFF,SHIRT_OFF+.3,tau));
 }
 if(k===ACTORS.findIndex(q=>q.name==='Yorke')&&tau>IN_NET+.3)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.3,IN_NET+.8,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** the whirled shirt: a white cloth swinging round his raised hand (inferred hand), drawn over him */
function shirtWhirl(s:Sheet,r:DrawResult,tau:number){if(tau<SHIRT_OFF)return;
 const h=r.joints.rHa,hd=r.joints.head,n=r.joints.neck,u=Math.hypot(hd[0]-n[0],hd[1]-n[1])*2.4+6,a=tau*TAU*1.6,w=sm(SHIRT_OFF,SHIRT_OFF+.25,tau);
 const tip:Pt=[h[0]+Math.cos(a)*u*1.9*w,h[1]+Math.sin(a)*u*.7*w-u*.2],mid:Pt=[h[0]+Math.cos(a-.5)*u*1.1*w,h[1]+Math.sin(a-.5)*u*.45*w];
 const cloth=ribbon([h,mid,tip],u*.9,{seed:117,taper:.35,wobble:u*.08});s.knockout(cloth);s.stroke(K,cloth,Math.max(2,u*.08),.9);}
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;ring?:number}={}):PlayOut{
 const{minBall=6,hero=false,ring=0}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // floodlight shadows: small figures get a faint cross of four short shadows in one op (the lamps sit on all four roofs)
 const sh=new Path2D();for(const e of list)if(e.h<420){const sd=ACTORS[e.k].style.seed??1;for(const[ox,oy] of [[.11,.02],[-.11,.02],[.05,-.03],[-.05,.04]] as Pt[])sh.addPath(polyPath(blob(e.g[0]+ox*e.h,e.g[1]+oy*e.h,e.h*.12,e.h*.03,sd,{amp:.05,n:10}),true));}
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.3);
 if(ring>0){const m=posOf(GIGGS,tau),cx=(m[0]+b[0])/2,cz=(m[1]+b[2])/2,r=.45+Math.hypot(m[0]-b[0],m[1]-b[2])/2+.3*(1-ring),pts:Pt[]=[];
  for(let i=0;i<40;i++){const q=pr(c,[cx+Math.cos(i/40*TAU)*r*1.1,0,cz+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
  if(pts.length>30){const q=toCam(c,[cx,0,cz]),rr=ribbon(pts,Math.max(6,c.F*.1/q[2]),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:Math.hypot(b[0],b[2])/.11,key:K,shadow:B,seed:4});};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only Giggs keeps 'mid'
  const detail=passing?(e.k===GIGGS?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const style=e.k===GIGGS&&tauP>=SHIRT_OFF?GIGGS_BARE:a.style;
  const r=drawPlayer(s,p,c,{...style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===GIGGS||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===GIGGS}:{});
  if(e.k===GIGGS){heroR=r;if(px>=22)shirtWhirl(s,r,tauP);}}
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
/** touch ticks: a yellow spark at each touch as it happens, and the trail of touch spots left on the grass (fading) */
function touchMarks(s:Sheet,c:Cam,tau:number,w:number,span=2.6){if(w<=0)return;
 const dots=new Path2D();let any=false;
 TOUCHES.forEach((T,i)=>{const age=tau-T;if(age<0||age>span||T>=SHOT)return;const[x,z]=TP[i],q=toCam(c,[x,0,z]);if(q[2]<1)return;const g=scr(c,q),r=c.F*.13/q[2]*(1-.45*age/span);
  dots.addPath(polyPath(blob(g[0],g[1],r,r*.42,i+3,{amp:.08,n:12}),true));any=true;
  if(age<.28){const b=pr(c,[x,.12,z]);if(b)sparkBurst(s,Y,b[0],b[1],c.F*.45/q[2],{n:7,seed:i+9,g:easeOutBack(clamp(age/.1))*(1-clamp((age-.18)/.1)),width:Math.max(4,c.F*.035/q[2]),cov:.95*w});}});
 if(any){s.knockout(dots,.8*w);s.fill(Y,dots,.9*w);}
}
/** a change of direction: an orange arrow on the grass along his real path through the cut at tc (w grows it along the path) */
function cutArrow(s:Sheet,c:Cam,tc:number,w:number,lead=.55,len=1.2){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=14;i++){const tau=tc-lead+len*i/14,[x,z]=posOf(GIGGS,tau),q=toCam(c,[x,0,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=c.F*.12/d;
 s.knockout(ribbon(seg,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(R,ribbon(seg,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** a lunge meeting only air: an orange spark where the defender's boot arrives too late */
function missSpark(s:Sheet,c:Cam,k:number,at:number,t:number,t0:number){const age=t-t0;if(age<=-.3||age>=.5)return;const[x,z]=posOf(k,at),m=posOf(GIGGS,at-.25),P:V3=[lerp(x,m[0],.45),.25,lerp(z,m[1],.45)],q=pr(c,P);
 if(q)sparkBurst(s,R,q[0],q[1],c.F*.5/toCam(c,P)[2],{n:8,seed:83+k,g:easeOutBack(clamp((age+.3)/.2))*(1-clamp((age-.25)/.25)),width:9});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the run between them plays at ~0.8–1.3× real time; the pre-roll is Vieira on the ball) */
const tau1=(t:number)=>{const G=CUEW(0,'he scores');return key(t,mono([[0,-2.9],[CUEW(0,'Ryan Giggs'),-.9],[CUEW(0,'pounces')+.25,0],[CUEW(0,'Past Vieira'),.6],[CUEW(0,'past Dixon'),3.3],[CUEW(0,'twice'),4.95],[CUEW(0,'past Keown'),6.1],[CUEW(0,'past Adams'),7.5],[G+.1,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+.9-G)]]),linear);};
const CAM1:V3=[52.5,24,-70];
function cam1(t:number):Cam{
 const G=CUEW(0,'he scores'),S=SECS(0),tau=tau1(t),gg=CUEW(0,'Ryan Giggs');
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[58,5,20],m=posOf(GIGGS,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(.3,gg,t,easeInOutSine),toG=sm(G+.5,G+1.6,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.2,toBall),lerp(open[2],lerp(bt[2],0,.25),toBall)],T=lerp3(tb,cel,toG);
 const F=key(t,mono([[0,1500],[gg,4300],[CUEW(0,'past Dixon'),4700],[CUEW(0,'past Adams'),5300],[G,5700],[G+1.4,6300],[S,6500]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'he scores');
  stadium(s,c,v,t,{roar:sm(G,G+.5,t),flash:sm(G+.1,G+.35,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(GIGGS,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: close touches, a fast pan, out · in · out
const whip2=(t:number)=>{const w=CUEW(1,'At full speed');return sm(w-.5,w+.15,t,easeInOutSine);};
const tau2=(t:number)=>{const w=CUEW(1,'At full speed');return key(t,mono([[0,-.7],[CUEW(1,'Close'),0],[CUEW(1,'tight'),.55],[CUEW(1,'left foot'),1.05],[w-.5,1.45],[w+.15,2.55],[CUEW(1,'changes'),2.95],[CUEW(1,'out,'),3.4],[CUEW(1,'in,'),4.9],[CUEW(1,'out!'),6.05],[CUEW(1,'Defenders'),6.35],[SECS(1),7.0]]),linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(GIGGS,tau),open=1-sm(0,1.4,t,easeInOutSine),push=sm(CUEW(1,'Close')-.3,CUEW(1,'tight'),t,easeInOutSine)*(1-sm(CUEW(1,'left foot')+.3,CUEW(1,'At full')-.3,t)),back=sm(CUEW(1,'changes')-.3,CUEW(1,'out,')+.2,t,easeInOutSine);
 const C:V3=[m[0]-3.4-4*back+1.5*open,1.5+.5*back+.3*open,m[1]-9.5-3*open+3*push-6*back],T:V3=[m[0]+1.2+3*back,.85-.2*push,m[1]+.4+.6*back];
 return look(C,T,2750+650*push-900*back-350*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),cl=CUEW(1,'Close'),ti=CUEW(1,'tight'),lf=CUEW(1,'left foot'),af=CUEW(1,'At full'),o1=CUEW(1,'out,'),i1=CUEW(1,'in,'),o2=CUEW(1,'out!'),df=CUEW(1,'Defenders'),E=SECS(1),w=whip2(t);
  stadium(s,c,v,t);
  ground(s,c);
  touchMarks(s,c,tau,sm(cl-.2,cl+.2,t)*(1-sm(af-.6,af-.4,t))+sm(af+.2,af+.4,t)*(1-sm(E-1,E-.6,t)),2.2);
  // out · in · out: each word paints that cut's route on the grass (and the ones before it stay)
  const fade=1-sm(E-.9,E-.5,t);
  cutArrow(s,c,3.3,sm(o1-.3,o1+.3,t,easeOut)*fade);cutArrow(s,c,4.95,sm(i1-.3,i1+.3,t,easeOut)*fade);cutArrow(s,c,6.1,sm(o2-.3,o2+.3,t,easeOut)*fade);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero,bg,br})=>{
   // "tight": a yellow thread from his left boot to the ball, tugging tight on each touch
   const gw=sm(ti-.15,ti+.3,t)*(1-sm(af-.7,af-.45,t));
   if(hero&&bg&&gw>0){const toe=hero.joints.lToe,mid:Pt=[(toe[0]+bg[0])/2,(toe[1]+bg[1])/2+br*.5*(1-gw)];s.knockout(ribbon([toe,mid,bg],br*.5,{seed:81,taper:0,wobble:.6}),.8*gw);s.fill(Y,ribbon([toe,mid,bg],br*.28,{seed:81,taper:0,wobble:.6}),.95*gw);}
   // "left foot": a red ring round the left boot
   const lw=sm(lf-.15,lf+.25,t,easeOutBack)*(1-sm(af-.7,af-.45,t));
   if(hero&&lw>0){const toe=hero.joints.lToe,an=hero.joints.lAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.25*lw+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.8]);}
    s.fill(R,ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*lw);}
   // each lunge meets only air
   missSpark(s,c,DIXON,3.35,t,o1+.1);missSpark(s,c,DIXON,4.98,t,i1+.1);missSpark(s,c,KEOWN,6.1,t,df);}});
  // the replay wipe as the chapter opens; the fast pan down the pitch (the replay skips ahead to Dixon)
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,Math.sin(Math.PI*w),27,.04);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the tight-angle finish, then the shirt-whirling run
const tau3=(t:number)=>{const r=CUEW(2,'into the roof');return key(t,mono([[0,6.9],[CUEW(2,'lashes'),SHOT-.1],[CUEW(2,'high over'),SHOT+.1],[CUEW(2,'David'),SHOT+.22],[r,IN_NET+.08],[r+1.2,IN_NET+.9],[SECS(2),Math.max(SHIRT_OFF+1.2,IN_NET+.9+(SECS(2)-r-1.2)*1.25)]]),linear);};
const swing3=(t:number)=>{const r=CUEW(2,'into the roof');return sm(r+.6,r+1.9,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(GIGGS,tau),e=sm(SHOT-.3,IN_NET+.2,tau,easeInOutSine),u=swing3(t);
 // behind the net, a little off to the near-post side, low: the ball rises past the diving keeper toward us, into the roof
 const C0:V3=[117.5,4.2+1.2*e,-6.5+1.5*e],T0:V3=[lerp(m[0],101,e),lerp(1,1.4,e),lerp(m[1]*.85,-3.5,e)];
 // then round to the pitch side of the celebration run (the near stand's United end behind him)
 const C1:V3=[m[0]-7.5,1.9,m[1]+8.5],T1:V3=[m[0]+.4,1.35,m[1]-.6];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(4300+500*e,3000,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),r=CUEW(2,'into the roof'),u=swing3(t),ho=CUEW(2,'high over');
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(r-.1,r+.3,t)*(1-sm(SECS(2)-1.2,SECS(2)-.6,t))});
  ground(s,c,{goalLater:u<.5,bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({bg,br})=>{
   // "high over": a yellow flight trail from the boot, rising over the keeper
   const hw=sm(ho-.2,ho+.1,t)*(1-sm(r+.5,r+1,t));if(hw>0&&tau>SHOT){const pts:Pt[]=[];for(let i=0;i<=12;i++){const q=pr(c,ballAt(lerp(SHOT,Math.min(tau,IN_NET),i/12)));if(q)pts.push(q);}
    if(pts.length>2&&bg){s.knockout(ribbon(pts,br*.9,{seed:91,taper:.9,wobble:.5}),.7*hw);s.fill(Y,ribbon(pts,br*.55,{seed:91,taper:.9,wobble:.5}),.95*hw);}}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(GIGGS,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: low behind Giggs, from the Keown cut to the finish (the run plays ~1.5× here)
const tau4=(t:number)=>key(t,mono([[0,4.9],[CUEW(3,'dribble'),5.15],[CUEW(3,'close'),5.4],[CUEW(3,'change'),6.1],[CUEW(3,'at speed'),6.6],[CUEW(3,'keeper'),SHOT-.2],[CUEW(3,'finish'),SHOT+.12],[SECS(3),IN_NET+.45]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),push=sm(CUEW(3,'close')-.3,CUEW(3,'close')+.4,t,easeInOutSine),goal=sm(CUEW(3,'at speed')+.2,CUEW(3,'keeper')+.2,t,easeInOutSine);
 // directly behind him along his run (so the chasers stay beside or behind the lens, not in it), a little high; late on, the aim opens to
 // take in the goal while he stays in the lower left of the frame
 const m=posOf(GIGGS,Math.min(tau,SHOT+.1)),a=posOf(GIGGS,Math.min(tau,SHOT+.1)-.5),dx=m[0]-a[0],dz=m[1]-a[1],l=Math.hypot(dx,dz)||1,hx=dx/l,hz=dz/l;
 const back=7.2-1.2*push+1.6*goal;
 const C:V3=[m[0]-hx*back+hz*1.2,2.3-.3*push+.5*goal,m[1]-hz*back-hx*1.2],T:V3=[lerp(m[0]+hx*5,lerp(m[0],105,.5),goal),lerp(.9,1.2,goal),lerp(m[1]+hz*5,lerp(m[1],-3,.5),goal)];
 return look(C,T,2500+350*push-800*goal);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),dr=CUEW(3,'dribble'),cl=CUEW(3,'close'),ch=CUEW(3,'change'),at=CUEW(3,'at speed'),kd=CUEW(3,'keeper'),fh=CUEW(3,'finish'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  const m=posOf(GIGGS,tau);
  // "finish high": the top of the goal mouth lights up yellow (printed on the net, behind the players)
  const fw=sm(fh-.2,fh+.3,t,easeOutBack)*(1-sm(E-.5,E-.15,t));
  if(fw>0){const q=polyP(c,[[105.05,1.5,-3.55],[105.05,1.5,3.55],[105.05,2.38,3.55],[105.05,2.38,-3.55]]);if(q.length>2){const p=polyPath(q,true);s.knockout(p,.5*fw);s.fill(Y,p,.8*fw);}}
  // "keeper goes down": a navy band low across the goal mouth, where the keeper is
  const kw=sm(kd-.2,kd+.25,t)*(1-sm(E-.9,E-.5,t));
  if(kw>0){const q=polyP(c,[[105.05,.05,-3.6],[105.05,.05,3.6],[105.05,.8,3.6],[105.05,.8,-3.6]]);if(q.length>2)s.tone(K,polyPath(q,true),.55*kw);}
  touchMarks(s,c,tau,sm(cl-.2,cl+.2,t)*(1-sm(kd-.4,kd,t)),1.6);
  cutArrow(s,c,6.1,sm(ch-.3,ch+.4,t,easeOut)*(1-sm(kd-.5,kd-.1,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,ring:sm(dr-.1,dr+.35,t,easeOutBack)*(1-sm(ch-.2,ch+.2,t)),after:({hero,br})=>{
   // "at speed": speed lines stream off him
   const rw=sm(at-.1,at+.3,t)*(1-sm(kd-.3,kd,t));
   if(rw>0&&hero){const q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]+1,1,m[1]]);if(q&&q2){const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=c.F/toCam(c,[m[0],1,m[1]])[2];
    for(const k of[0,1,2]){const y0=q[1]-z*(.75-k*.45);s.fill(K,ribbon([[q[0]-Math.cos(dir)*z*.45,y0-Math.sin(dir)*z*.45],[q[0]-Math.cos(dir)*z*(1.3+k*.3),y0-Math.sin(dir)*z*(1.3+k*.3)]],z*.05,{seed:9+k,taper:.9,wobble:.5}),.6*rw);}}}
   // the keeper's down arrow
   if(kw>0){const[sx,sz]=posOf(SEAMAN_K,tau),a=pr(c,[sx,2.7,sz]),b=pr(c,[sx,1.4,sz]);if(a&&b){const wd=Math.max(5,c.F*.14/toCam(c,[sx,2,sz])[2]);s.knockout(ribbon([a,b],wd*1.6,{seed:71,taper:.1}),.8*kw);laneArrow(s,K,a,b,wd,{progress:kw,seed:71,head:wd*2.6});}}
   // the ball's rising line traced into the top of the goal
   if(fw>0&&tau>SHOT){const pts:Pt[]=[];for(let i=0;i<=12;i++){const qq=pr(c,ballAt(lerp(SHOT,Math.min(tau,IN_NET),i/12)));if(qq)pts.push(qq);}if(pts.length>2){const wd=Math.max(4,br*.6);s.knockout(ribbon(pts,wd*1.6,{seed:93,taper:.8}),.8*fw);s.fill(Y,ribbon(pts,wd,{seed:93,taper:.8}),.95*fw);}}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'giggs-arsenal-1999',format:'11v11',title:"Giggs's Wonder Goal",theme:'Close touches, change direction at speed, finish high when the keeper goes down',
 ageNote:'FA Cup semi-final replay, Arsenal v Manchester United, Villa Park, Birmingham, 14 April 1999. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of wet April turf — grass bits and spray thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits (yellow × blue) and a few red flecks thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%4?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.7*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
