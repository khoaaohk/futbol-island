/** Rui Costa — signature: the perfect through ball. Portugal 3–2 England, UEFA Euro 2000 Group A, Philips Stadion, Eindhoven,
 * Monday 12 June 2000 (20:45 local kick-off, so the 59th minute is played in the last of the June evening light under the floodlights):
 * Rui Costa's pass, Nuno Gomes's winner, 59'.
 * An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * printed as a riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "the perfect through ball", through_ball_assist, centre, right
 * foot; lesson "Weight your pass so the striker can run onto it without breaking stride"): it is the best-documented single through ball
 * of his career that we could confirm touch by touch. UEFA's own account of the match is headlined on him ("Inspired by Rui Costa,
 * Portugal came from 2-0 down") and describes the winner as "another fantastic ball from Rui Costa [that] split their defence asunder.
 * Nuno Gomes brought it under instant control and, as Adams slid in, he lashed his shot into the roof of the net"; the BBC calls it a
 * "low-level, skittering" ball that "found Gomes in acres of space behind Adams". Wikipedia's player article names these assists
 * ("he assisted the last two goals by João Pinto and Nuno Gomes in a 3–2 comeback win over England") and describes him as a classic
 * number 10 known for "vision, and precise passing".
 *
 * SOURCES (fetched Sept 2026 with a generic UA, slowly, cached under the session scratchpad films/src-cache/):
 *  - UEFA.com, "England floored by thrilling Portugal comeback in EURO 2000 Group A" (6 Oct 2003): "Portugal's 59th-minute winner as
 *    another fantastic ball from Rui Costa spilt their defence asunder. Nuno Gomes brought it under instant control and, as Adams slid in,
 *    he lashed his shot into the roof of the net"; "Portugal's star-studded midfield, directed by Rui Costa"; line-ups.
 *    https://www.uefa.com/uefaeuro/history/news/0253-0d7b302dbc26-b74bf2c5efda-1000--england-floored-by-thrilling-portugal-comeback-in-euro-20/
 *    (cache: uefa-eng-por-2000.txt)
 *  - BBC Sport, "England crushed in five-goal classic", 13 June 2000: photo caption "Gomes slips the winner past Adams and Seaman";
 *    "on 57 minutes ... he was forced to replace McManaman ... with Dennis Wise. And barely had the substitution been made when a
 *    low-level, skittering cross from Costa found Gomes in acres of space behind Adams, who failed to recover in time to stop the
 *    Portuguese striker's hammer blow"; key moments "60 mins: Gomes claims the winner"; teams; referee Anders Frisk.
 *    https://news.bbc.co.uk/2/hi/euro2000/788135.stm   (cache: bbc-788135.txt)
 *  - Wikipedia, "UEFA Euro 2000 Group A" (raw): 12 June 2000, 20:45, Philips Stadion, Eindhoven, 3–2, Nuno Gomes 59'; both line-ups with
 *    shirt numbers and positions, substitutions (McManaman off 58', Wise on); kit boxes: Portugal dark-red shirts, GREEN shorts with
 *    yellow sides, dark-red socks; England white shirts, navy shorts, white socks.   (cache: wiki-euro2000-groupA.txt)
 *  - Wikipedia, "Rui Costa" (raw): the two assists v England at Euro 2000; attacking midfielder, vision, precise passing, "an accurate
 *    striker of the ball with either foot".   (cache: wiki-rui-costa.txt)
 *  - Wikipedia, "Nuno Gomes" (raw): his first international goal, the winner v England at Euro 2000.   (cache: wiki-nuno-gomes.txt)
 * CONFIRMED by those accounts: the match, date, ground, 20:45 kick-off, 2–2 at the time, the goal in the 59th minute; a pass from Rui
 * Costa (10) that split England's defence, low and skidding ("low-level, skittering"); Nuno Gomes (21) in space BEHIND Tony Adams (5),
 * one controlling touch ("instant control"), Adams sliding in, the shot lashed high "into the roof of the net" past David Seaman (1);
 * Wise (17) had just come on for McManaman. KIT: Portugal dark-red shirts, green shorts, dark-red socks; England white shirts, navy
 * shorts, white socks. On the pitch at 59': Portugal Baía 1, Abel Xavier 14, Jorge Costa 2, Couto 5, Dimas 13, Paulo Bento 17,
 * Vidigal 4, Rui Costa 10, Figo 7, Nuno Gomes 21, João Pinto 8; England Seaman 1, G. Neville 2, Adams 5, Campbell 4, P. Neville 3,
 * Beckham 7, Scholes 8, Ince 14, Wise 17, Shearer 9, Heskey 19.
 * INFERRED (illustrative, and kept OUT of the narration): the direction of play on screen (Portugal attacking left to right from the
 * main-stand camera); where on the pitch Rui Costa passed from (right of centre, about 35 m out) and which foot (his right, the
 * template's foot — the sources don't say); the build-up (Vidigal → Rui Costa); Gomes's exact run (from between the centre-backs,
 * diagonally in behind Adams) and his shooting foot (right); that Adams was the left-sided centre-back; the side of the net; Seaman
 * coming off his line and diving; every other player's position; number colours (Portugal yellow, England navy); Seaman's keeper kit
 * (yellow) and ponytail; Abel Xavier's bleached hair; the yellow side stripes on Portugal's shorts are left out; the Terrestra
 * Silverstream ball print (simplified); the Philips Stadion's shape (four steep two-tier roofed stands close to the pitch, lights along
 * the roof edge), crowd colours and the evening sky; the celebrations.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, real time, riding the ball from Rui Costa to the net;
 * ch2 = the slow-motion replay from a raised camera behind Rui Costa's right shoulder: the pass goes into the SPACE in front of Gomes
 * (yellow ring), not to his feet (red ring), his run (navy arrow), the ball's lane; ch3 = a second replay angle from BEHIND ENGLAND'S
 * GOAL: the controlling touch, Adams's slide, the shot into the roof of the net; ch4 = the lesson over Rui Costa's shoulder: too soft
 * (red, short), too hard (red, into the keeper), just right (yellow, in the striker's stride). All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Full-sheet card-window framing (1.45:1 to square), never
 * sheet.safe. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded. Inks: yellow, red, green, navy (grass = yellow under green, maroon = red under a navy shade). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,strike,slideTackle,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.4 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The perfect pass, live',text:'Euro 2000: Portugal against England, two-all. Rui Costa on the ball. He looks up... and slides it through! Nuno Gomes runs onto it... and smashes it in! Portugal lead three-two!',seconds:14.2,
  cues:[[.2,'Euro 2000'],[1.5,'Portugal against England'],[3.2,'two-all'],[4.3,'Rui Costa on the ball'],[6,'He looks up'],[7.1,'slides it through'],[8.6,'Nuno Gomes runs onto it'],[10.3,'smashes it in'],[11.7,'Portugal lead']]},
 {label:'Watch it again',text:'Watch again, slowly. Rui Costa passes into the space in front of Nuno Gomes, not to his feet. Not too hard, not too soft.',seconds:10.6,
  cues:[[.15,'Watch again'],[.9,'slowly'],[1.7,'Rui Costa passes'],[2.9,'into the space'],[4.1,'in front of Nuno Gomes'],[5.6,'not to his feet'],[7,'Not too hard'],[8.1,'not too soft']]},
 {label:'Behind the goal',text:'Behind the goal: one touch, no slowing down, and he lashes it into the roof of the net.',seconds:7.9,
  cues:[[.15,'Behind the goal'],[1.6,'one touch'],[2.6,'no slowing down'],[3.9,'he lashes it'],[5.2,'roof of the net']]},
 {label:'Your turn',text:'Your turn: weight your pass so your striker can run onto it without breaking stride.',seconds:7.6,
  cues:[[.15,'Your turn'],[.9,'weight your pass'],[2.2,'so your striker'],[3.3,'can run onto it'],[4.6,'without breaking stride']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py rui-costa-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/rui-costa-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-rui-costa-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/rui-costa-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('rui-costa: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys forced monotone in time (a recorded voice can squeeze cue gaps) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',G='green',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window: full-sheet framing (never sheet.safe), the engine's arrival scale kept. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Portugal attack +X, England's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so Portugal's
 * right (Figo's wing) is the near side. */
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
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (cameras inside the ground cull the stand behind them) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};

// ---------------------------------------------------------------- the Philips Stadion in 2000 (inferred shape): four steep two-tier roofed stands hard by the pitch
/** stands as (a along, b up the rake) → metres: 0 far side, 1 near side (under the camera), 2 behind Portugal's goal (west), 3 behind England's goal (east) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-13,118,a),1.2+20*b,-(39+24*b)],
 (a,b)=>[lerp(118,-13,a),1.2+20*b,39+24*b],
 (a,b)=>[-8-22*b,1.2+18*b,lerp(44,-44,a)],
 (a,b)=>[113+22*b,1.2+18*b,lerp(-44,44,a)],
];
const SEGS=[16,16,10,10],ROWS=[15,15,13,13];
/** crowd colour weights: [paper (England white), red (both), green (Portugal), yellow (flags, scarves)] */
const MIX:[number,number,number,number]=[.34,.38,.16,.12];
type Seat={P:V3;h:number};
const SEATS:Seat[][]=STANDS.map((S,si)=>{const o:Seat[]=[],cols=SEGS[si]*6;for(let j=0;j<ROWS[si];j++){const b=(j+.5)/ROWS[si];if(b>.44&&b<.54)continue;
 for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.14)continue;o.push({P:S((i+.5+(hash(i+j*31,8)-.5)*.6)/cols,b),h:(h-.14)/.86});}}return o;});
/** the evening sky over the roofs, the four stands (whichever face the camera), the crowd, the roofs and the lights along their edge */
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 // a June evening at a quarter to ten: deep blue-navy with a warm band low over the roofs
 s.field(K,.5,.5);s.field(G,.1,.5);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-1400],[1e4,hz[1]-1400],[1e4,hz[1]+80],[-1e4,hz[1]+80]],true),.22);}
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D(),lamp=new Path2D(),halo=new Path2D();
 for(const si of which){const S=STANDS[si],n=SEGS[si];
  for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n;
   const q=quadP(c,[S(a0,0),S(a1,0),S(a1,1),S(a0,1)]);if(q)addPoly(planes,q);
   const f=quadP(c,[S(a0,.45),S(a1,.45),S(a1,.53),S(a0,.53)]);if(f)addPoly(fas,f);
   // the roof: from the back of the top tier forward over the seats, a lit edge carrying the floodlights
   const front=(a:number):V3=>{const p=S(a,.3);return[p[0],23.5,p[2]];};
   const rq=quadP(c,[add3(S(a0,1),[0,1.2,0]),add3(S(a1,1),[0,1.2,0]),front(a1),front(a0)],10);if(rq)addPoly(roof,rq);
   const fa=front(a0),fb=front(a1);if(toCam(c,fa)[2]>12&&toCam(c,fb)[2]>12){seg3(c,fa,fb,.45,edge);
    const m=lerp3(fa,fb,.5),g=pr(c,[m[0],m[1]-.5,m[2]]);if(g){const r=clamp(kAt(c,m)*3.2,6,110);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.55,0,0,TAU);
     seg3(c,lerp3(fa,fb,.3),lerp3(fa,fb,.7),.9,lamp);}}}}
 s.knockout(planes);s.tone(K,planes,.5);s.tone(G,planes,.14);s.knockout(fas);s.fill(K,fas,.85);s.tone(Y,fas,.18);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which)for(const q of SEATS[si]){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(!inView(v,p))continue;
  const z=clamp(c.F*.55/d[2],2.2,16),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0,u=q.h;
  const ink=u<MIX[0]?0:u<MIX[0]+MIX[1]?1:u<MIX[0]+MIX[1]+MIX[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.82);s.knockout(inks[1],.7);s.fill(R,inks[1],.92);s.knockout(inks[2],.7);s.fill(G,inks[2],.92);s.knockout(inks[3],.8);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.92);
 s.knockout(halo,.2);s.tone(Y,halo,.4);s.knockout(edge,.6);s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<18;i++){const si=which[Math.floor(hash(i*7+T12,5)*which.length)],L=SEATS[si],q=L[Math.floor(hash(i*17+T12*101,3)*L.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the floodlit grass (yellow × green) with mowing stripes, boards, paper lines, flags and both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;ballY?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-8,0,-39],[113,0,-39],[113,0,39],[-8,0,39]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.85);s.tone(G,p,.9);s.tone(K,p,.22);}
 const g=polyP(c,[[-5,0,-37],[110,0,-37],[110,0,37],[-5,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(G,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]));s.tone(K,st,.12);
 // boards: along both touchlines and behind both goals (generic navy boards with pale panels)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-36.5],[109,0,-36.5],[109,.9,-36.5],[-4,.9,-36.5]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.45],[x+3.4,.25,-36.45],[x+3.4,.65,-36.45],[x,.65,-36.45]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));addPoly(pn,polyP(c,[[-3.45,.25,z],[-3.45,.25,z+3.4],[-3.45,.65,z+3.4],[-3.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.tone(R,pn,.3);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const[x,z] of [[0,-34],[0,34],[105,-34],[105,34]] as Pt[]){seg3(c,[x,0,z],[x,1.55,z],.05,pole);addPoly(flag,polyP(c,[[x,1.55,z],[x,1.2,z],[x+(x?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0,o.ballY);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, ballY) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by=1){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=by)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)-Math.pow((y-by)/1.4,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,.95),.95,z],.025,mesh,.7);seg3(c,[back(z,.95),.95,z],[back(z,0),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_O:InkFill[]=[[Y,.42],[R,.26],[K,.05]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]];
/** Portugal: dark-red shirts, green shorts, dark-red socks (confirmed, kit box). Dark red = the red plate under a deep navy shade; green
 * trim and yellow numbers inferred */
const POR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[G,.95],socks:[R,.95],boots:K,trim:[G,.9],shade:[K,.5],skin:SKIN_O,hair:K,hairStyle:'short',line:K,numberInk:Y,seed:3,...o});
/** England: white shirts, navy shorts, white socks (confirmed); navy numbers and trim inferred */
const ENG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.95],socks:'paper',boots:K,trim:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,numberInk:K,seed:5,...o});
const RUI_STYLE=POR({number:10,hair:K,skin:SKIN_O,build:{height:1.8,bulk:.98},seed:10});
/** David Seaman: 1.93 m; keeper kit colour and the ponytail inferred */
const SEAMAN:AthleteStyle={shirt:[Y,.85],shorts:[Y,.85],socks:[Y,.85],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'ponytail',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.93,bulk:1.08},seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Rui Costa's pass)
type Role='rui'|'por'|'eng'|'gk';
type Move={kind:'slide'|'dive';at:number;dur:number;side:'l'|'r'};
/** face: a defender faces the ball (and backpedals) until τ face */
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean;face?:number};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The confirmed beats (Rui Costa's pass splitting the defence, Gomes in
 * behind Adams, one touch, Adams sliding in, the shot into the roof of the net past Seaman) are kept; every exact spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Rui Costa',role:'rui',style:RUI_STYLE,key:true,keys:[[-6,62.6,12.4],[-4,64.2,10.8],[-2.9,65.3,9.9],[-2.2,66.3,9.4],[-1.5,67.5,9.5],[-.8,68.6,9.7],[0,69.5,9.9],[.5,70.3,9.8],[1.5,71.8,8.9],[3,74,7.2],[6,78,5]]},
 {name:'Nuno Gomes',role:'por',style:POR({number:21,seed:21,hair:K,build:{height:1.81}}),key:true,keys:[[-6,82.4,-3],[-3,83.5,-2.5],[-1,84.3,-2.3],[-.3,84.9,-2],[0,85.5,-1.6],[.4,86.9,-.7],[.8,88.3,.3],[1.25,90,1.3],[1.55,91.1,1.7],[1.85,92,1.9],[2.2,93.2,2.2],[2.8,95,4],[4,97.2,9],[6,99.2,15]]},
 {name:'Vidigal',role:'por',style:POR({number:4,seed:4,skin:SKIN_D,hairStyle:'bald',build:{height:1.84}}),keys:[[-6,57,3],[-4,59.3,4.5],[-2.9,60.6,5.2],[-1,62,5.5],[6,66,4]]},
 {name:'Figo',role:'por',style:POR({number:7,seed:7}),key:true,keys:[[-6,78,24],[0,82,23],[1.5,86,20],[6,94,14]]},
 {name:'João Pinto',role:'por',style:POR({number:8,seed:8,build:{height:1.72}}),keys:[[-6,80,-12],[0,83,-11],[1.5,87,-9],[6,95,-6]]},
 {name:'Paulo Bento',role:'por',style:POR({number:17,seed:17,hairStyle:'balding'}),keys:[[-6,55,-4],[0,58,-3],[6,64,-2]]},
 {name:'Abel Xavier',role:'por',style:POR({number:14,seed:14,skin:SKIN_D,hair:[Y,.9],build:{height:1.88}}),keys:[[-6,60,26],[0,63,27],[6,70,24]]},
 {name:'Dimas',role:'por',style:POR({number:13,seed:13}),keys:[[-6,56,-26],[0,58,-25],[6,62,-22]]},
 {name:'Jorge Costa',role:'por',style:POR({number:2,seed:2,hairStyle:'bald'}),keys:[[-6,44,-7],[6,50,-5]]},
 {name:'Couto',role:'por',style:POR({number:5,seed:5,hairStyle:'long'}),keys:[[-6,44,7],[6,50,6]]},
 {name:'Adams',role:'eng',style:ENG({number:5,seed:31,build:{height:1.91,bulk:1.06}}),key:true,face:.35,moves:[{kind:'slide',at:1.95,dur:.9,side:'r'}],keys:[[-6,85.8,5.8],[-2,86.2,5.4],[0,86.4,5],[.35,86.6,4.8],[.8,87.6,4.3],[1.2,89,3.8],[1.5,90.1,3.5],[1.7,90.8,3.3],[2.3,92.6,2.9],[6,93,2.8]]},
 {name:'Campbell',role:'eng',style:ENG({number:4,seed:32,skin:SKIN_D,hair:K,hairStyle:'bald',build:{height:1.88,bulk:1.1}}),key:true,face:.4,keys:[[-6,85.2,-6],[0,85.8,-5],[.8,87.4,-4],[1.6,89.6,-3],[3,92,-2],[6,93,-1]]},
 {name:'P. Neville',role:'eng',style:ENG({number:3,seed:33,hair:K}),face:.6,keys:[[-6,84,16],[0,85,14.5],[1.5,88,11],[6,92,8]]},
 {name:'G. Neville',role:'eng',style:ENG({number:2,seed:34,hair:K}),face:.6,keys:[[-6,84.5,-17],[0,85.4,-15],[1.5,88.6,-12],[6,92,-9]]},
 {name:'Ince',role:'eng',style:ENG({number:14,seed:35,skin:SKIN_D,hairStyle:'bald'}),face:.8,keys:[[-6,76,-3],[0,77.5,-1.5],[1.5,80.5,0],[6,85,1]]},
 {name:'Scholes',role:'eng',style:ENG({number:8,seed:36,hair:[R,.7],build:{height:1.7}}),face:.8,keys:[[-6,73,15],[-2,72.5,13.5],[0,71.8,12.6],[1.5,73.5,11],[6,79,8]]},
 {name:'Wise',role:'eng',style:ENG({number:17,seed:37,build:{height:1.68}}),keys:[[-6,76,21],[0,77.5,20],[6,84,16]]},
 {name:'Beckham',role:'eng',style:ENG({number:7,seed:38,hair:[Y,.75]}),keys:[[-6,74,-20],[0,75.5,-18],[6,82,-14]]},
 {name:'Shearer',role:'eng',style:ENG({number:9,seed:39,hair:K,build:{height:1.83,bulk:1.08}}),keys:[[-6,60,-1],[0,61,1],[6,66,3]]},
 {name:'Heskey',role:'eng',style:ENG({number:19,seed:40,skin:SKIN_D,hairStyle:'bald',build:{height:1.88,bulk:1.12}}),keys:[[-6,63,-8],[0,64,-7],[6,68,-6]]},
 {name:'Seaman',role:'gk',style:SEAMAN,key:true,moves:[{kind:'dive',at:2.02,dur:.9,side:'r'}],keys:[[-6,102.2,.6],[0,102.3,.4],[1.2,101.5,1],[1.7,101,1.3],[6,101,1.3]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const RUI=IX('Rui Costa'),GOMES=IX('Nuno Gomes'),VID=IX('Vidigal'),ADAMS=IX('Adams'),SEAMAN_I=IX('Seaman');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6,T1=6,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(k,tau),y=headingOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}

// ---------------------------------------------------------------- the ball: Vidigal → Rui Costa, THE THROUGH BALL, the touch, the shot, the net
const P1=-2.9,R1=-2.2,PASS=0,RECEIVE=1.25,SHOT=1.85,IN_NET=SHOT+.36;
const PASS_PT=footSpot(RUI,PASS,'r',.42,.16);
/** where the pass meets Gomes's stride (the "space in front of him") and where his feet were when it was played */
const RECV_PT=footSpot(GOMES,RECEIVE,'r',.45,.1),FEET_AT_PASS=posOf(GOMES,PASS);
const SHOT_PT=footSpot(GOMES,SHOT,'r',.42,.14);
const NET:V3=[105.4,2.05,-1.1],REST:V3=[106.4,.11,-.9];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
/** dribble: the ball knocked on with the RIGHT foot, the runner catching it up */
function carried(k:number,tau:number,ts:number[]):V3{let i=0;while(i+1<ts.length&&tau>=ts[i+1])i++;const u=clamp((tau-ts[i])/((ts[i+1]??ts[i]+.5)-ts[i])),ahead=.35+.75*Math.sin(Math.PI*Math.pow(u,.8));const[x,z]=footSpot(k,tau,'r',ahead,.12);return[x,.11,z];}
function passPath(a:V3,b:V3,u:number):V3{const q=roll(a,b,u,.25);return[q[0],.11+.06*Math.sin(Math.PI*u),q[2]];}
const RUI_TOUCH=[R1+.05,-1.5,-.8,PASS-.28];
/** the through ball: low and skidding ("low-level, skittering"), a couple of tiny hops, slowing a little as it reaches his stride */
function throughPath(u:number):V3{const q=roll([PASS_PT[0],.11,PASS_PT[1]],[RECV_PT[0],.11,RECV_PT[1]],u,.32);return[q[0],.11+.16*Math.abs(Math.sin(Math.PI*u*2.6))*(1-u)*(1-u),q[2]];}
/** the shot: lashed on the rise into the roof of the net */
function shotPath(u:number):V3{const A:V3=[SHOT_PT[0],.11,SHOT_PT[1]],b=lerp3(A,NET,u);return[b[0],lerp(.11,NET[1],Math.pow(u,.8))+.35*Math.sin(Math.PI*u),b[2]];}
function ballAt(tau:number):V3{
 if(tau<P1)return carried(VID,tau,[T0,-5.3,-4.5,-3.7,P1]);
 if(tau<R1){const a=footSpot(VID,P1,'r',.4),b=footSpot(RUI,R1,'r',.45);return passPath([a[0],.11,a[1]],[b[0],.11,b[1]],(tau-P1)/(R1-P1));}
 if(tau<PASS-.28)return carried(RUI,tau,RUI_TOUCH);
 if(tau<PASS){const a=carried(RUI,PASS-.28,RUI_TOUCH);return lerp3(a,[PASS_PT[0],.11,PASS_PT[1]],sm(PASS-.28,PASS,tau,easeOut));}
 if(tau<RECEIVE)return throughPath((tau-PASS)/(RECEIVE-PASS));
 if(tau<SHOT-.2){const a:V3=[RECV_PT[0],.11,RECV_PT[1]],b=carried(GOMES,tau,[RECEIVE,SHOT]);return lerp3(a,b,sm(RECEIVE,RECEIVE+.12,tau));}
 if(tau<SHOT){const a=carried(GOMES,SHOT-.2,[RECEIVE,SHOT]);return lerp3(a,[SHOT_PT[0],.11,SHOT_PT[1]],sm(SHOT-.2,SHOT,tau,easeOut));}
 if(tau<IN_NET)return shotPath((tau-SHOT)/(IN_NET-SHOT));
 const u=clamp((tau-IN_NET)/.55),e=1-(1-u)*(1-u);const b=lerp3(NET,REST,e);return[b[0],lerp(NET[1],.11,Math.min(1,u*1.5)),b[2]];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** Rui Costa lifts his head before the pass: chin up, eyes across to Gomes (to his left, toward −Z) */
const LOOK_UP:Partial<Pose>={neckP:-10,neckY:28,twist:5,lean:6};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 const toBall=yawOf(b[0]-x,b[2]-z);
 let yaw=sp>.5?yawOf(v[0],v[1]):toBall;
 if(a.face!==undefined&&tau<a.face)yaw=toBall;
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='eng'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.45)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='slide'&&u>0){p=blendPose(p,slideTackle(Math.min(1,u),{foot:mv.side}),sm(0,.1,u));const sp2=SHOT_PT;yaw=lerpA(yaw,yawOf(sp2[0]-x,sp2[1]-z),sm(0,.2,u));}
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.8});}
 if(k===SEAMAN_I)yaw=tau<mv0(SEAMAN_I)?toBall:Math.PI;
 if(k===RUI){
  if(tau<R1+.1&&sp<2)yaw=toBall;
  for(const t of RUI_TOUCH.slice(0,3))p=over(p,{rHipF:30,rKnee:26,rAnk:30,rHipR:14},bump(t-.16,t+.1,tau));
  p=over(p,LOOK_UP,bump(-1,-.12,tau)*.95);
  const D=.8,u=(tau-(PASS-.52*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.55}),inWin(u));yaw=lerpA(yaw,yawOf(RECV_PT[0]-x,RECV_PT[1]-z)+.12,.8*inWin(u));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.4,IN_NET+.9,tau));}
 if(k===GOMES){
  // the one controlling touch in stride (right foot, inferred), then the strike
  p=over(p,{rHipF:34,rKnee:30,rAnk:26,rHipR:16},bump(RECEIVE-.16,RECEIVE+.1,tau));
  const D=.8,u=(tau-(SHOT-.52*D))/D;if(u>0&&u<1.3){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:1}),inWin(u*1.05));yaw=lerpA(yaw,yawOf(NET[0]-x,NET[2]-z),inWin(u));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+1,tau));}
 if((a.role==='por')&&k!==GOMES&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='eng'&&k!==ADAMS&&tau>IN_NET+.8)p=over(p,{lean:36,neckP:36,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.8,IN_NET+1.6,tau)*.7);
 return{p,yaw};
}
function mv0(k:number){const m=ACTORS[k].moves?.[0];return m?m.at-.55*m.dur:Infinity;}

// ---------------------------------------------------------------- the ball print: the 2000 Terrestra Silverstream, simplified (paper, navy/silver tri-lobes)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.35);
 if(r>5){const pan=new Path2D();for(let i=0;i<3;i++){const a=rot+i/3*TAU,c=Math.cos(a),sn=Math.sin(a),cx=x+c*r*.52,cy=y+sn*r*.52,w=r*.2;
   pan.addPath(polyPath([[cx-sn*w*1.6,cy+c*w*1.6],[cx+c*w*1.1,cy+sn*w*1.1],[cx+sn*w*1.6,cy-c*w*1.6]],true));}
  s.fill(K,pan,.85);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=-1}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (evening floodlights: short, soft); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8*Math.max(.35,1-b[1]*.15),br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===hero||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:e.k===hero}:{});
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a red "not here" cross painted on the grass inside a ring */
function crossMark(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,seed=51){if(w<=.02)return;const p=new Path2D(),d=rad*.55;
 for(const[a,b] of [[[x-d,z-d],[x+d,z+d]],[[x-d,z+d],[x+d,z-d]]] as [[number,number],[number,number]][]){const A=pr(c,[a[0],0,a[1]]),Bq=pr(c,[b[0],0,b[1]]);if(!A||!Bq)return;p.addPath(ribbon([A,Bq],Math.max(5,kAt(c,[x,0,z])*.16),{seed:seed++,taper:.2,wobble:.8}));}
 s.knockout(p,.9*w);s.fill(R,p,.95*w);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(6,c.F*.16/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** the through ball's lane on the grass, dashed yellow, from Rui Costa's boot toward a spot, drawn in with w */
function passLane(s:Sheet,c:Cam,to:[number,number],w:number,ink=Y,seed=81){if(w<=.02)return;const A=pr(c,[PASS_PT[0],.05,PASS_PT[1]]),Bq=pr(c,[lerp(PASS_PT[0],to[0],w),.05,lerp(PASS_PT[1],to[1],w)]);if(!A||!Bq)return;
 const wd=Math.max(5,kAt(c,[to[0],0,to[1]])*.14);s.knockout(ribbon([A,Bq],wd*1.8,{seed,taper:.1,wobble:.6}),.75);laneArrow(s,ink,A,Bq,wd,{dashed:true,seed:seed+1,head:wd*3});}
/** a run from τa to τb as ground points */
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(ta,tb,i/n)));return o;};
/** "he looks up": a dashed yellow sight line from his eyes to a point */
function sightLine(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number){if(!r||!to||w<=.02)return;const h=r.joints.head,u=Math.max(6,Math.hypot(h[0]-r.joints.neck[0],h[1]-r.joints.neck[1])*.6);
 const end:Pt=[lerp(h[0],to[0],w),lerp(h[1],to[1],w)];s.knockout(ribbon([h,end],u*1.8,{seed:91,taper:.2,wobble:.6}),.7);laneArrow(s,Y,h,end,u,{dashed:true,seed:92,head:u*3});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter-1 time, keyed to the cue words (the build-up a touch slow, the through ball and the finish near real time) */
const tau1=(t:number)=>{const S=SECS(0),sm2=CUEW(0,'smashes');return key(t,mono([[0,-5.9],[CUEW(0,'Rui Costa on'),-2.3],[CUEW(0,'He looks up'),-.8],[CUEW(0,'slides it through'),-.05],[CUEW(0,'Nuno Gomes runs'),1.15],[sm2,IN_NET-.05],[sm2+.9,IN_NET+.45],[S+1,IN_NET+.45+(S+1-sm2-.9)*.8]]),linear);};
const CAM1:V3=[76,18,62];
function cam1(t:number):Cam{
 const S=SECS(0),sm2=CUEW(0,'smashes'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.3),b2=bs(tau-.6),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // "Rui Costa on the ball … he looks up": the camera leans on number 10; through the pass it opens to hold the whole lane; at the shot it frames the box
 const lane=sm(CUEW(0,'He looks up')-.2,CUEW(0,'slides it')+.2,t,easeInOutSine)*(1-sm(CUEW(0,'Nuno Gomes')-.3,CUEW(0,'Nuno Gomes')+.6,t,easeInOutSine));
 const box=sm(RECEIVE,SHOT+.1,tau,easeInOutSine),cel=smooth(GOMES,tau),toC=sm(sm2+.9,sm2+2,t,easeInOutSine);
 let T:V3=[bt[0]+2,1.6,bt[2]*.8];
 T=lerp3(T,[79,1.4,5],lane*.8);T=lerp3(T,[97,1.4,1],box);T=lerp3(T,[cel[0]-1,1.2,cel[1]+3],toC);
 const F=key(t,[[0,4300],[CUEW(0,'Rui Costa on'),5300],[CUEW(0,'He looks up'),4600],[CUEW(0,'slides it'),3800],[CUEW(0,'Nuno Gomes'),4600],[sm2,5300],[sm2+1.4,6800],[S,7200]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),sm2=CUEW(0,'smashes'),rc=CUEW(0,'Rui Costa on'),lu=CUEW(0,'He looks up');
  stadium(s,c,v,t,[0,2,3],{roar:sm(sm2+.2,sm2+.7,t),flash:sm(sm2+.3,sm2+.55,t)});
  const b=ballAt(tau);ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2],ballY:b[1]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,hero:tau<RECEIVE-.3?RUI:GOMES,under:()=>{
   // "Rui Costa on the ball": a yellow ring under number 10 (a broadcast highlight)
   const[rx,rz]=posOf(RUI,tau);ring(s,c,rx,rz,1.3,sm(rc-.1,rc+.4,t,easeOutBack)*(1-sm(lu+.3,lu+.8,t)),Y,44);}});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(GOMES,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, raised behind Rui Costa's right shoulder: the pass into the space, not to his feet
const tau2=(t:number)=>key(t,mono([[0,-1.3],[CUEW(1,'Rui Costa passes'),-.35],[CUEW(1,'into the space'),.12],[CUEW(1,'in front of'),.5],[CUEW(1,'not to his feet'),.85],[CUEW(1,'Not too hard'),RECEIVE-.08],[SECS(1),RECEIVE+.3]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(RUI,Math.min(tau,PASS+.1)),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUEW(1,'Rui Costa passes')+.2,CUEW(1,'in front of')+.2,t,easeInOutSine);
 const C:V3=[m[0]-6+1.5*open-.5*wide,2.6+3.2*wide,m[1]+3.6+.6*wide],T:V3=[m[0]+7+7*wide,.8,m[1]-2.5-3.6*wide];
 return look(C,T,2100-400*wide-150*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),rp=CUEW(1,'Rui Costa passes'),is=CUEW(1,'into the space'),fr=CUEW(1,'in front of'),nf=CUEW(1,'not to his feet'),th=CUEW(1,'Not too hard'),ts=CUEW(1,'not too soft'),E=SECS(1);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  const fade=1-sm(E-.8,E-.4,t);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:tau<PASS+.3?RUI:GOMES,under:()=>{
   // "into the space in front of Nuno Gomes": his run (navy) and the spot the pass meets it (yellow ring)
   groundArrow(s,c,runPts(GOMES,Math.max(-.3,Math.min(tau,.1)),RECEIVE),sm(is-.2,is+.7,t,easeOut)*fade,K,63);
   ring(s,c,RECV_PT[0],RECV_PT[1],1.3,sm(fr-.1,fr+.3,t,easeOutBack)*fade,Y,45);
   // "not to his feet": where his feet were when the ball was played (red ring and cross)
   const nw=sm(nf-.1,nf+.3,t,easeOutBack)*(1-sm(th-.2,th+.3,t));ring(s,c,FEET_AT_PASS[0],FEET_AT_PASS[1],1,nw,R,46);crossMark(s,c,FEET_AT_PASS[0],FEET_AT_PASS[1],1,nw);
   // the ball's lane
   passLane(s,c,RECV_PT,sm(rp+.3,is+.6,t,easeOut)*fade);},
   after:({joints})=>{
    // "Rui Costa passes": his eyes on the runner first
    const r=joints.get(RUI),[gx,gz]=posOf(GOMES,tau);sightLine(s,r,pr(c,[gx,1.6,gz]),sm(.3,rp,t,easeOut)*(1-sm(rp+.3,rp+.7,t)));
    // "Not too hard, not too soft": the ball arrives in the ring right in his stride — a spark on each beat
    for(const[at,sd] of [[th,95],[ts,96]] as [number,number][]){const age=t-at-.1;if(age>-.15&&age<.6){const q=pr(c,[RECV_PT[0],.2,RECV_PT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[RECV_PT[0],0,RECV_PT[1]])*.9,{n:8,seed:sd,g:easeOutBack(clamp((age+.15)/.18))*(1-clamp((age-.35)/.25)),width:8});}}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · second replay angle from behind England's goal: the touch, the slide, the roof of the net
const tau3=(t:number)=>key(t,mono([[0,RECEIVE-.5],[CUEW(2,'one touch'),RECEIVE+.02],[CUEW(2,'no slowing'),RECEIVE+.35],[CUEW(2,'he lashes'),SHOT-.02],[CUEW(2,'roof of the net'),IN_NET+.05],[SECS(2),IN_NET+1.4]]),linear);
function cam3(t:number):Cam{
 const tau=tau3(t),g=smooth(GOMES,Math.min(tau,IN_NET)),push=sm(0,CUEW(2,'he lashes'),t,easeInOutSine),net=sm(CUEW(2,'he lashes')+.2,CUEW(2,'roof of the net')+.2,t,easeInOutSine);
 const C:V3=[112.5,lerp(5.6,4.4,push),lerp(-6,-4.5,push)],T:V3=[lerp(g[0]+1,100,net),lerp(1,1.3,net),lerp(g[1],.5,net)];
 return look(C,T,lerp(3600,4300,push)-900*net);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ot=CUEW(2,'one touch'),hl=CUEW(2,'he lashes'),rn=CUEW(2,'roof of the net'),E=SECS(2);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(IN_NET,IN_NET+.3,tau)*(1-sm(E-1.2,E-.6,t))});
  const b=ballAt(tau);ground(s,c,{goalLater:true});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:GOMES,under:()=>{
   ring(s,c,RECV_PT[0],RECV_PT[1],1.2,sm(ot-.4,ot,t,easeOutBack)*(1-sm(ot+.5,ot+.9,t)),Y,47);},
   after:()=>{
    // "one touch": a spark at the controlling touch; "he lashes it": a spark at the strike
    for(const[at,P,sd] of [[ot,RECV_PT,97],[hl,SHOT_PT,98]] as [number,[number,number],number][]){const age=t-at-.05;if(age>-.15&&age<.6){const q=pr(c,[P[0],.15,P[1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[P[0],0,P[1]])*.6,{n:8,seed:sd,g:easeOutBack(clamp((age+.15)/.18))*(1-clamp((age-.35)/.25)),width:8});}}}});
  goal3(s,c,105,1,bulgeAt(tau),NET[2],b[1]);
  // "the roof of the net": a yellow flash high inside the net as it bulges
  {const age=t-rn;if(age>-.2&&age<.8){const q=pr(c,NET);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,NET)*1.1,{n:10,seed:99,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.5)/.3)),width:10});}}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(GOMES,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: over Rui Costa's shoulder — too soft, too hard, just right
/** too soft: the ball dies in front of the centre-backs; too hard: it runs through to the keeper */
const SOFT:[number,number]=[lerp(PASS_PT[0],RECV_PT[0],.55),lerp(PASS_PT[1],RECV_PT[1],.55)],HARD:[number,number]=[100.2,-1.6];
const tau4=(t:number)=>key(t,mono([[0,-1.1],[CUEW(3,'weight your pass'),-.25],[CUEW(3,'so your striker'),.3],[CUEW(3,'can run onto it'),.85],[CUEW(3,'without breaking'),RECEIVE],[SECS(3),RECEIVE+.55]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(RUI,Math.min(tau,PASS+.1)),push=sm(0,1.2,t,easeInOutSine),wide=sm(CUEW(3,'weight')-.2,CUEW(3,'so your striker')+.3,t,easeInOutSine);
 const C:V3=[m[0]-6.5-1.5*(1-push)-.5*wide,2.6+3.4*wide,m[1]+3.4+.8*wide],T:V3=[m[0]+8+8*wide,.7,m[1]-2-4*wide];
 return look(C,T,2100+200*push-500*wide);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wp=CUEW(3,'weight your pass'),ss=CUEW(3,'so your striker'),ro=CUEW(3,'can run onto it'),wb=CUEW(3,'without breaking'),E=SECS(3);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  const fade=1-sm(E-.9,E-.5,t),wrong=sm(wp+.2,wp+.6,t,easeOutBack)*(1-sm(ro-.2,ro+.2,t));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:tau<PASS+.3?RUI:GOMES,under:()=>{
   // "weight your pass": too soft (red, short, in front of the defenders) and too hard (red, through to the keeper)
   ring(s,c,SOFT[0],SOFT[1],1,wrong,R,48);crossMark(s,c,SOFT[0],SOFT[1],1,wrong,52);
   ring(s,c,HARD[0],HARD[1],1,wrong,R,49);crossMark(s,c,HARD[0],HARD[1],1,wrong,54);
   // "so your striker": his run (navy); "can run onto it": the just-right spot (yellow), the ball's lane to it
   groundArrow(s,c,runPts(GOMES,Math.max(-.5,Math.min(tau,.2)),RECEIVE+.2),sm(ss-.2,ss+.6,t,easeOut)*fade,K,68);
   ring(s,c,RECV_PT[0],RECV_PT[1],1.35,sm(ro-.1,ro+.3,t,easeOutBack)*fade,Y,50);
   passLane(s,c,RECV_PT,sm(ro-.1,ro+.6,t,easeOut)*fade,Y,84);},
   after:()=>{const age=t-wb-.1;if(age>-.15&&age<.6){const q=pr(c,[RECV_PT[0],.2,RECV_PT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[RECV_PT[0],0,RECV_PT[1]])*.9,{n:8,seed:94,g:easeOutBack(clamp((age+.15)/.18))*(1-clamp((age-.35)/.25)),width:8});}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'rui-costa-signature',format:'11v11',title:"Rui Costa's Perfect Pass",theme:'Weight your pass so the striker can run onto it without breaking stride',
 ageNote:'UEFA Euro 2000 Group A, Portugal 3–2 England, Eindhoven, 12 June 2000 (the 59th-minute winner). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of evening turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];a.addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(G,a,.6*fade);
}
export default film;
