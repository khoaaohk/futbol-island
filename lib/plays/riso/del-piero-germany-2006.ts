/** Alessandro Del Piero v Germany, World Cup semi-final, Westfalenstadion ("FIFA WM-Stadion Dortmund"), 4 July 2006 (Germany 0–2 Italy
 * after extra time): the last-second second goal on the counter-attack, Gilardino's pass, Del Piero's curled finish. An iconic-play riso
 * film (RisoStory, chapters mode) played by the card's picture window: a 1:1 reconstruction from WRITTEN accounts (the footage itself was
 * not reviewed), printed as a riso sheet.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2006 FIFA World Cup knockout stage" (Germany vs Italy box: 4 July 2006, 21:00, Westfalenstadion Dortmund, 65,000, referee
 *    Benito Archundia (Mexico); Grosso 119', Del Piero 120+1'; line-ups + numbers + substitutions; the kit boxes)
 *    https://en.wikipedia.org/wiki/2006_FIFA_World_Cup_knockout_stage
 *  - Wikinews, "Italy score two late in Extra Time to advance to finals, hosts Germany to play in third place match", 4 July 2006 ("Just two
 *    minutes later, Alessandro Del Piero got Italy's second with the last kick of the game when he clipped high past Lehmann's left hand at
 *    the end of a fast break-away with Alberto Gilardino"; Gilardino hit the post earlier in extra time)
 *    https://en.wikinews.org/wiki/Italy_score_two_late_in_Extra_Time_to_advance_to_finals,_hosts_Germany_to_play_in_third_place_match
 *  - Wikipedia, "Alberto Gilardino" (came on as a substitute; "provided the assist for Alessandro Del Piero's goal two minutes after the first
 *    goal") https://en.wikipedia.org/wiki/Alberto_Gilardino
 *  - Wikipedia, "Alessandro Del Piero" (a substitute that night, "in the 121st minute scored Italy's second goal"; wore 7 for Italy from
 *    2002; the "Gol alla Del Piero": a precise curling shot into the far top corner with his stronger foot)
 *    https://en.wikipedia.org/wiki/Alessandro_Del_Piero
 *  - Wikipedia, "Germany–Italy football rivalry" (Germany had never lost in 14 games at the Westfalenstadion before this night)
 *  - Kits: the Wikipedia kit boxes for this match and the Commons kit-part images Kit_shorts_ita06a2.png (blue shorts, blue base 2050C0) and
 *    Kit_left_arm_ger06H.png (white sleeve, black trim line).
 * CONFIRMED by those accounts: 4 July 2006, a 21:00 kick-off in Dortmund (so the extra-time goals came under floodlights); Italy led 1–0
 *  after Grosso's 119th-minute goal; Del Piero (7) and Gilardino (11) were both substitutes; the goal came at 120+1, the last kick of the
 *  game, at the end of a fast break-away with Gilardino, who made the assist; the ball was clipped HIGH past Jens Lehmann's (1) LEFT hand
 *  (Lehmann faces Italy's attack, so the ball went into the half of the goal on the shooter's right); Italy's kit that night all blue (blue
 *  shirt, blue shorts, blue socks), Germany white shirts with black trim, black shorts, white socks; Italy's players on the pitch at the end
 *  (Buffon 1, Zambrotta 19, Cannavaro 5, Materazzi 23, Grosso 3, Pirlo 21, Gattuso 8, Totti 10, Iaquinta 15, Gilardino 11, Del Piero 7).
 * INFERRED (illustrative): how Italy won the ball (drawn as Cannavaro heading a German cross clear) and Totti's first-time pass to start the
 *  break (widely remembered that way but not in the sources read); every position and time in metres/seconds; Gilardino carrying the ball
 *  down Italy's LEFT channel and slipping it inside; Del Piero's sprint from midfield to support; a FIRST-TIME RIGHT-FOOT curler from the
 *  inside-left of the box (Del Piero is right-footed; the curl and the side follow from "clipped high past Lehmann's left hand"), bending
 *  from outside the far post back into the top far corner; Lehmann's dive to his left; which German players chased (unnamed, no numbers);
 *  the direction of play on screen; the celebration (an airplane run); the keeper and referee kit colours (Lehmann grey, Buffon grey-green,
 *  referee black); the stadium as drawn (four steep stands hugging the pitch, filled corners, a roof ring with floodlights, the eight yellow
 *  pylons with roof cables — positions stylised), the crowd colours (Germany's black, red and gold, a blue Italian end) and the flags; the
 *  +Teamgeist ball as drawn (paper with navy propeller swirls); the camera placements.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, live, near real time (the Westfalenstadion at night and its
 * yellow pylons → Germany's cross → cleared → the break down the pitch → Gilardino's pass → the curl → the net); ch2 = the slow replay from
 * a LOW camera behind Cannavaro that becomes a low chase camera beside Del Piero (the ball won, his sprint, the run trail on the grass, the
 * passing lane to "a friend"); ch3 = replay from LOW BEHIND THE SHOOTER (the curl's yellow trail bends from outside the far post into the
 * top corner past Lehmann's left glove) that swings round to the celebration; ch4 = the lesson from a high chase camera (the ball won,
 * the sprint arrow, the support spot, the bend drawn ahead, the far-corner target). Composed on the FULL sheet (never sheet.safe), so it
 * frames from the 1.45:1 card window down to square. Every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, `prev`
 * secondary motion, a motion smear on the sprint and the strike); small wide-shot figures and every figure inside a passage print at `low`.
 * Handedness: the world is right-handed (X toward Germany's goal, Y up, +Z = the main-stand side = an Italy attacker's RIGHT), athlete.ts's
 * convention, so the right foot strikes with no mirrored projector; Lehmann faces −X, so his LEFT is +Z. Everything keys off cue times
 * (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones, all randomness seeded. Budget: ~150–330 plate ops/frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,header,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,touchPhase,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and each chapter's `seconds`
 * are ESTIMATES (≈2.5 words/s + punctuation pauses) until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in order,
 * so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Dortmund, 2006. Italy against Germany, the last minute of extra time. Italy break! Gilardino races forward, and Alessandro Del Piero sprints to join him. Gilardino slips it across... goal!',tail:1.9,
  cues:['Dortmund','Italy against','the last minute','Italy break','Gilardino races','Alessandro Del Piero','sprints','Gilardino slips','goal']},
 {label:'Watch it again',text:'Watch it again. As soon as Italy won the ball, Del Piero sprinted to support, so Gilardino had a friend to pass to.',tail:1.5,
  cues:['Watch it again','As soon as','won the ball','sprinted','so Gilardino','a friend']},
 {label:'Into the corner',text:'He curls it high past keeper Jens Lehmann, into the top corner. Italy are in the final!',tail:1.8,
  cues:['He curls','high','keeper Jens Lehmann','top corner','Italy are in','the final']},
 {label:'Your turn',text:'Your turn: when your team wins the ball, sprint forward to support, then bend it into the far corner.',tail:1.6,
  cues:['Your turn','wins the ball','sprint forward','support','bend it','far corner']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py del-piero-germany-2006, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/del-piero-germany-2006/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/del-piero-germany-2006/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the Kokoro films, ≈2.5 words/s): .19 s + .018 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.018*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('del-piero: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('del-piero: no cue '+w);return c.at;};
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
/** in-then-out window: rises over [a, a+ri], falls over [b-fo, b] */
const win=(a:number,b:number,t:number,ri=.3,fo=.35)=>Math.min(sm(a,a+ri,t),1-sm(b-fo,b,t));
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre (the engine's arrival scale is kept, so
 * passages behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Italy attack +X, Germany's goal line at 105), Y up, Z across
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
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[]|null)=>{if(q&&q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the stands: near parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Westfalenstadion at night: four steep stands hugging the pitch, filled
// corners, a roof ring with floodlights along its lip, the eight yellow pylons holding the roof on cables (placement stylised)
const X0=-7,X1=112,ZS=40,RISE=30,DEPTH=31;
type StandF=(a:number,b:number)=>V3;
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind Germany's goal (x>105), 2 the main stand (z>0, camera side),
 * 3 behind Italy's goal (x<0). The long stands run on into the corners, so the bowl is closed. */
const STANDS:StandF[]=[
 (a,b)=>[lerp(X0-DEPTH*b,X1+DEPTH*b,a),1.4+RISE*b,-ZS-DEPTH*b],
 (a,b)=>[X1+DEPTH*b,1.4+RISE*b,lerp(-ZS-DEPTH*b,ZS+DEPTH*b,a)],
 (a,b)=>[lerp(X1+DEPTH*b,X0-DEPTH*b,a),1.4+RISE*b,ZS+DEPTH*b],
 (a,b)=>[X0-DEPTH*b,1.4+RISE*b,lerp(ZS+DEPTH*b,-ZS-DEPTH*b,a)],
];
const COLS=[20,10,20,10],WALK:[number,number]=[.47,.53];
/** roof: from the top of the stand in to b = .12 over the seats, a floodlit lip */
const ROOF=(S:StandF,a:number,b:number):V3=>{const p=S(a,b);return[p[0],b>.9?35.5:38.2,p[2]];};
type StandQ={low:V3[];up:V3[];walk:V3[];roof:V3[];lip:[V3,V3]};
const STANDQ:StandQ[][]=STANDS.map((S,si)=>{const n=COLS[si],o:StandQ[]=[];for(let i=0;i<n;i++){const a0=i/n,a1=(i+1)/n;
 o.push({low:[S(a0,0),S(a1,0),S(a1,WALK[0]),S(a0,WALK[0])],up:[S(a0,WALK[1]),S(a1,WALK[1]),S(a1,1),S(a0,1)],walk:[S(a0,WALK[0]),S(a1,WALK[0]),S(a1,WALK[1]),S(a0,WALK[1])],
  roof:[ROOF(S,a0,1),ROOF(S,a1,1),ROOF(S,a1,.12),ROOF(S,a0,.12)],lip:[ROOF(S,a0+.15/n,.12),ROOF(S,a1-.15/n,.12)]});}return o;});
/** seats: one mark per seat group; ita = the blue Italian end (behind Buffon's goal, stand 3) and a corner block */
const SEATS:{P:V3;h:number;ita:boolean}[]=(()=>{const o:{P:V3;h:number;ita:boolean}[]=[];
 STANDS.forEach((S,si)=>{const cols=COLS[si]*3;for(let j=0;j<10;j++){const b=j<5?.04+.085*j:.58+.085*(j-5);for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.14)continue;
  const a=(i+.5+(hash(i+j*31+si,9)-.5)*.6)/cols;o.push({P:S(a,b),h,ita:(si===3&&a>.18&&a<.62)||(si===0&&a<.1)});}}});return o;})();
/** flags on the stand fronts: [stand, a, kind] kind 0 = Germany (black | red | gold bands), 1 = Italy (green | white | red) */
const FLAGS:[number,number,number][]=[[0,.2,0],[0,.34,0],[0,.5,0],[0,.63,1],[0,.76,0],[0,.9,0],[1,.3,0],[1,.55,0],[1,.75,0],[3,.28,1],[3,.42,1],[3,.55,1],[2,.3,0],[2,.6,0]];
/** the eight yellow pylons outside the stands (four a side), their tops above the roof, cables down to the roof lip (stylised) */
const PYLONS:[number,number][]=[[-17,-83],[31,-83],[74,-83],[122,-83],[-17,83],[31,83],[74,83],[122,83]];
/** a summer night in Dortmund under floodlights: navy sky, the pylons, the stands and crowd, the roof, the lamps */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number;ita?:number;flags?:number}={}){
 const{roar=0,flash=0,ita=0,flags=0}=o,tt=twos(t),Bnd=1e4,passing=!!s._passage.pending;
 s.field(B,.55,.6);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.45);
 const hz=pr(c,[c.C[0]+c.f[0]*1e4,c.C[1],c.C[2]+c.f[2]*1e4])?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-620],[-Bnd,hz-520]],true),.3);
 // the pylons (behind the stands: the stands knock out over their feet), lattice cross-bars, cables to the roof lip
 const py=new Path2D(),br=new Path2D(),cb=new Path2D(),wr=nrm3([c.r[0],0,c.r[2]]);
 for(const[x,z] of PYLONS){const bot:V3=[x,14,z],top:V3=[x,66,z],w0=2.6,w1=.8,q=quadP(c,[[bot[0]-wr[0]*w0,bot[1],bot[2]-wr[2]*w0],[bot[0]+wr[0]*w0,bot[1],bot[2]+wr[2]*w0],[top[0]+wr[0]*w1,top[1],top[2]+wr[2]*w1],[top[0]-wr[0]*w1,top[1],top[2]-wr[2]*w1]],20);
  if(!q)continue;py.addPath(polyPath(q,true));
  if(!passing)for(let k=0;k<6;k++){const y0=18+k*8,y1=y0+8,wa=lerp(w0,w1,(y0-14)/52)*.8,wb=lerp(w0,w1,(y1-14)/52)*.8;seg3(c,[x-wr[0]*wa,y0,z-wr[2]*wa],[x+wr[0]*wb,y1,z+wr[2]*wb],.22,br,.6);seg3(c,[x+wr[0]*wa,y0,z+wr[2]*wa],[x-wr[0]*wb,y1,z-wr[2]*wb],.22,br,.6);}
  const zl=Math.sign(z)*(ZS+DEPTH*.25);for(const dx of[-14,14])seg3(c,[x,64,z],[x+dx,38.4,zl],.18,cb,.6);}
 s.knockout(py);s.fill(Y,py,.95);s.fill(K,br,.55);s.fill(K,cb,.6);
 // the stands: steep concrete planes (navy × blue), the walkway band between the tiers
 const low=new Path2D(),up=new Path2D(),walk=new Path2D(),roof=new Path2D(),lamp=new Path2D();
 for(const col of STANDQ)for(const q of col){addPoly(low,quadP(c,q.low));addPoly(up,quadP(c,q.up));addPoly(walk,quadP(c,q.walk));addPoly(roof,quadP(c,q.roof,16));
  const a=toCam(c,q.lip[0]),b=toCam(c,q.lip[1]);if(Math.min(a[2],b[2])>16)seg3(c,q.lip[0],q.lip[1],1.3,lamp);}
 s.knockout(low);s.tone(K,low,.5);s.tone(B,low,.3);
 s.knockout(up);s.tone(K,up,.62);s.tone(B,up,.3);
 // the crowd: Germany's white, red, gold and black; the blue Italian end; the roar lifts the marks (ita = only the Italian end)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of SEATS){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.55/d[2],2.2,14),r=q.ita?Math.max(roar,ita):roar,lift=r>0?r*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.ita?(q.h<.36?0:4):q.h<.46?0:q.h<.64?1:q.h<.8?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.92);s.fill(Y,inks[2],.9);s.fill(K,inks[3],.85);s.fill(B,inks[4],.95);
 s.knockout(walk,.4);
 // flags on the tier fronts (they are hoisted a little higher on the flags cue)
 const fl=new Path2D(),rd=new Path2D(),gd=new Path2D(),bk=new Path2D(),gr=new Path2D();
 if(!passing)for(const[si,a,kind] of FLAGS){const S=STANDS[si],w=si%2?.018:.013,hgt=.035+.02*flags,P=(u:number,b:number)=>S(a+u*w,b),q=quadP(c,[P(0,.01),P(1,.01),P(1,.01+hgt),P(0,.01+hgt)]);if(!q)continue;fl.addPath(polyPath(q,true));
  if(kind===0){const band=(b0:number,b1:number,p:Path2D)=>addPoly(p,quadP(c,[P(0,.01+hgt*b0),P(1,.01+hgt*b0),P(1,.01+hgt*b1),P(0,.01+hgt*b1)]));band(.667,1,bk);band(.333,.667,rd);band(0,.333,gd);}
  else{const strip=(u0:number,u1:number,p:Path2D)=>addPoly(p,quadP(c,[P(u0,.01),P(u1,.01),P(u1,.01+hgt),P(u0,.01+hgt)]));strip(0,.333,gr);strip(.667,1,rd);}}
 s.knockout(fl);s.fill(K,bk,.95);s.fill(R,rd,.95);s.fill(Y,gd,.95);s.fill(Y,gr,.92);s.tone(B,gr,.72);
 // the roof ring (dark underside) and the floodlight strip along its lip
 s.knockout(roof);s.tone(K,roof,.7);s.tone(B,roof,.3);
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=SEATS[Math.floor(hash(i*17+T12*101,3)*SEATS.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the floodlit grass (yellow × blue) with mowing stripes, the boards, paper lines, both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-7,0,-40],[112,0,-40],[112,0,40],[-7,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(K,p,.5);s.tone(B,p,.25);}
 const g=polyP(c,[[-5,0,-37.5],[110,0,-37.5],[110,0,37.5],[-5,0,37.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.82);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37.5],[(k+1)*5.25,0,-37.5],[(k+1)*5.25,0,37.5],[k*5.25,0,37.5]]));s.tone(K,st,.12);
 // boards: along both touchlines and behind both goals, navy with paper and red panels
 const bd=new Path2D(),pn=new Path2D(),pr2=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,[b[0],.9,b[2]],[a[0],.9,a[2]]]));
 board([-4,0,-37],[109,0,-37]);board([109,0,-36],[109,0,36]);board([-4,0,36],[-4,0,-36]);board([109,0,37],[-4,0,37]);
 for(let k=0;k<18;k++){const x=-2+k*6.2,P=(z:number)=>polyP(c,[[x,.25,z],[x+3.4,.25,z],[x+3.4,.65,z],[x,.65,z]]);addPoly(k%3?pn:pr2,P(-36.95));addPoly(k%3?pn:pr2,P(36.95));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%3?pn:pr2,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.65,z+3.4],[108.95,.65,z]]));addPoly(pn,polyP(c,[[-3.95,.25,z],[-3.95,.25,z+3.4],[-3.95,.65,z+3.4],[-3.95,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.knockout(pr2);s.fill(R,pr2,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, high) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.72);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.32],[R,.2]];
const SKIN_M:InkFill[]=[[Y,.4],[R,.28],[B,.06]];
/** Italy 4 July 2006: all blue (shirt, shorts, socks; the kit boxes), paper numbers and trim */
const ITA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:K,trim:'paper',numberInk:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,seed:3,...o});
const DP_STYLE=ITA({number:7,build:{height:1.74,bulk:.98},seed:7});
const GIL_STYLE=ITA({number:11,build:{height:1.84,bulk:.97},hair:[K,.9],seed:11});
/** Germany: white shirts with black trim, black shorts, white socks (the kit boxes) */
const GER=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,trim:K,numberInk:K,skin:SKIN,hair:[K,.7],hairStyle:'short',line:K,seed:5,...o});
/** Jens Lehmann: number 1 (confirmed); the grey kit, gloves and his fair hair inferred */
const LEHMANN:AthleteStyle={shirt:[K,.42],shorts:[K,.62],socks:[K,.42],boots:K,skin:SKIN,hair:[Y,.75],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:Y,number:1,numberInk:'paper',build:{height:1.9},seed:41};
const BUFFON:AthleteStyle={shirt:[K,.3],shorts:[K,.55],socks:[K,.3],boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:Y,number:1,numberInk:'paper',build:{height:1.91},seed:42};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'balding',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: the hem trails); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Italy win the ball)
type Role='dp'|'ita'|'ger'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`) */
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r';height?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number,number];key?:boolean};
/** the moments of the break (τ): the cross, the header clear, Totti's pass, Gilardino's first touch, his pass, the shot, the net */
const CROSS=-1.4,TOTTI=1.1,GIL_RX=2.0,GPASS=8.2,SHOT=8.85,FLY=.95,IN_NET=SHOT+FLY;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Everything but the named beats is inferred (see the header). */
const ACTORS:Actor[]=[
 {name:'Del Piero',role:'dp',style:DP_STYLE,key:true,keys:[[-4.5,30,8],[-1.5,31,7.3],[0,32,6.5],[1,35,5.6],[2,41,4.2],[3,47.8,2.8],[4,54.8,1.4],[5,61.8,0],[6,68.8,-1.4],[7,75.8,-2.8],[8,82.6,-4.1],[8.55,86.9,-5],[8.85,88.6,-5.5],[9.3,90.4,-5.6],[10,92.3,-6.8],[11,94.4,-10.2],[12.2,96.2,-15],[13.6,97,-20.5],[15,96.3,-25],[16.5,94.5,-28]]},
 {name:'Gilardino',role:'ita',style:GIL_STYLE,key:true,engage:[7.7,8.6,0],keys:[[-4.5,47,-6],[-1.5,47.5,-9],[0,47.3,-12],[1,46.8,-13.6],[2,47.4,-14.2],[3,52.9,-14.3],[4,58.4,-14.2],[5,63.9,-14],[6,69.4,-13.7],[7,74.9,-13.3],[8,80.4,-12.8],[8.2,81.5,-12.7],[9,84.3,-12.1],[10,86.6,-11.6],[11.5,89.6,-13.6],[13,92.6,-17.5],[16.5,94,-24]]},
 {name:'Totti',role:'ita',style:ITA({number:10,hair:[K,.72],build:{height:1.8,bulk:1.03},seed:10}),key:true,engage:[.2,1.6,0],keys:[[-4.5,39,-1],[-1.5,35.5,-3],[0,34,-4],[.9,33.8,-4.1],[1.2,34,-4.1],[2.2,36.5,-4.6],[5,44,-5.5],[16.5,64,-6]]},
 {name:'Cannavaro',role:'ita',style:ITA({number:5,build:{height:1.76,bulk:1.05},seed:5}),key:true,keys:[[-4.5,19.5,4.5],[-1.5,21.6,3.6],[-.3,23.3,3.05],[0,23.6,3],[.6,24.3,2.7],[2,26.5,1.6],[16.5,42,0]]},
 {name:'Grosso',role:'ita',style:ITA({number:3,hairStyle:'long',seed:13}),keys:[[-4.5,25,-21],[3,34,-22],[16.5,56,-22]]},
 {name:'Zambrotta',role:'ita',style:ITA({number:19,seed:19}),keys:[[-4.5,23,18],[3,31,17],[16.5,52,15]]},
 {name:'Materazzi',role:'ita',style:ITA({number:23,build:{height:1.93,bulk:1.06},seed:23}),keys:[[-4.5,16,-5],[3,22,-5],[16.5,38,-4]]},
 {name:'Pirlo',role:'ita',style:ITA({number:21,hairStyle:'long',seed:21}),keys:[[-4.5,31,12],[2,36,11],[16.5,60,6]]},
 {name:'Gattuso',role:'ita',style:ITA({number:8,hairStyle:'long',seed:8}),keys:[[-4.5,27,-10],[3,33,-10],[16.5,62,-9]]},
 {name:'Iaquinta',role:'ita',style:ITA({number:15,seed:15}),keys:[[-4.5,49,10],[2,52,9.5],[5,60,8],[8.5,72,6],[12,82,2],[16.5,88,-6]]},
 {name:'Buffon',role:'gk',style:BUFFON,keys:[[-4.5,4.5,.5],[0,6,1],[16.5,9,0]]},
 {name:'Lehmann',role:'gk',style:LEHMANN,key:true,moves:[{kind:'dive',at:SHOT+.62,dur:.9,side:'l',height:.85}],keys:[[-4.5,99,0],[2,98.5,-.8],[6,100.8,-1.5],[8.2,102.9,-1.9],[8.8,103.3,-1.8],[16.5,103.3,-1.8]]},
 {name:'German back',role:'ger',style:GER({seed:31,hair:[K,.85],build:{height:1.96}}),key:true,engage:[3,8.35,1],moves:[{kind:'lunge',at:GPASS+.12,dur:.8,side:'l'}],keys:[[-4.5,63,-5],[0,60.5,-8],[2,63.5,-11],[4,70.5,-13],[6,77.2,-13.4],[7.5,82,-13.1],[8.2,84.3,-12.6],[9,85.9,-11.4],[11,87.6,-11.5],[16.5,89,-13]]},
 {name:'German chaser',role:'ger',style:GER({seed:32,hair:[Y,.6]}),key:true,moves:[{kind:'lunge',at:SHOT+.06,dur:.8,side:'l'}],keys:[[-4.5,50,11],[0,47.5,9.6],[2,50.5,7.2],[4,57.8,4],[6,66.6,1.2],[8,78,-1.6],[8.8,84.8,-3.4],[9.5,87.6,-4.3],[11,89.6,-5.5],[16.5,91,-8]]},
 {name:'German crosser',role:'ger',style:GER({seed:33}),keys:[[-4.5,47,24],[-2,44.5,22.3],[-1.4,44,22],[0,43.2,21],[4,49,18],[16.5,70,10]]},
 {name:'German forward',role:'ger',style:GER({seed:34,hair:[K,.9]}),keys:[[-4.5,30,1],[-1.4,25.5,3.4],[-.2,23.4,4.1],[1,24.5,4],[3,30,3],[16.5,56,0]]},
 {name:'German striker',role:'ger',style:GER({seed:35}),keys:[[-4.5,31,-7],[0,22.5,-6.5],[3,28,-6],[16.5,58,-4]]},
 {name:'German mid 1',role:'ger',style:GER({seed:36,hair:[Y,.5]}),keys:[[-4.5,38,11],[0,31,12.5],[3,37,10],[16.5,64,6]]},
 {name:'German mid 2',role:'ger',style:GER({seed:37}),keys:[[-4.5,41,-18],[0,36.5,-18],[16.5,62,-12]]},
 {name:'German wide',role:'ger',style:GER({seed:38}),keys:[[-4.5,52,-26],[16.5,72,-20]]},
 {name:'German mid 3',role:'ger',style:GER({seed:39,hair:[K,.6]}),keys:[[-4.5,45,4],[0,40,2],[16.5,66,0]]},
 {name:'German full-back',role:'ger',style:GER({seed:40}),keys:[[-4.5,58,15],[0,55,14],[16.5,78,10]]},
 {name:'referee',role:'ref',style:REF,keys:[[-4.5,40,-4],[4,50,6],[9,67,10],[16.5,80,5]]},
];
const DP=0,GIL=1,TOT=2,CAN=3,LEH=11,BACK=12,CHASE=13,CROSSER=14;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4.5,T1=16.5,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headYaw=(k:number,tau:number,fb:number)=>{const v=velOf(k,tau);return Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):fb;};
/** a boot spot: ahead of the body and out to one side (right = +Z when facing +X) */
function footSpot(k:number,tau:number,yaw:number,side:'l'|'r',ahead:number,out:number):V3{const[x,z]=posOf(k,tau),f:Pt=[Math.cos(yaw),-Math.sin(yaw)],r:Pt=[Math.sin(yaw),Math.cos(yaw)],sg=side==='r'?1:-1;
 return[x+f[0]*ahead+r[0]*out*sg,.11,z+f[1]*ahead+r[1]*out*sg];}

// ---------------------------------------------------------------- the ball: the German cross, the header clear, Totti's pass, Gilardino's run, his pass, the curl
/** the target: high in the top corner on the shooter's right, past Lehmann's left hand (the side is confirmed, the spot inferred) */
const GOAL_PT:V3=[105,2.12,2.95];
/** Gilardino's touches on the carry: one per stride cycle of CYC metres (the touch lands at the gait's touchPhase), right foot */
const CYC=4.2;
const gilYaw=(tau:number)=>{const base=headYaw(GIL,tau,-.3);return lerpA(base,yawTo(GIL,tau,SPOT),bump(GPASS-.55,GPASS+.45,tau));};
const dpYaw=(tau:number)=>{const base=headYaw(DP,tau,-.2),[x,z]=posOf(DP,tau);return lerpA(base,yawOf(GOAL_PT[0]-x,GOAL_PT[2]-z),bump(SHOT-.7,SHOT+.6,tau));};
function yawTo(k:number,tau:number,P:V3){const[x,z]=posOf(k,tau);return yawOf(P[0]-x,P[2]-z);}
/** the spot Del Piero strikes it from (his right boot at the contact) */
const SPOT:V3=(()=>{const[x,z]=posOf(DP,SHOT),y=yawOf(GOAL_PT[0]-x,GOAL_PT[2]-z);return[x+Math.cos(y)*.4+Math.sin(y)*.18,.11,z-Math.sin(y)*.4+Math.cos(y)*.18];})();
const TOUCHES:number[]=(()=>{const out:number[]=[GIL_RX];let prev=distOf(GIL,GIL_RX)/CYC-touchPhase;
 for(let tau=GIL_RX+DT;tau<GPASS-.3;tau+=DT){const ph=distOf(GIL,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.35)out.push(tau);prev=ph;}
 return[...out,GPASS];})();
const TP:V3[]=TOUCHES.map(T=>footSpot(GIL,T,gilYaw(T),'r',.48,.14));
const CROSS_FROM:V3=(()=>{const[x,z]=posOf(CROSSER,CROSS);return[x-.4,.11,z-.3];})();
const HEAD_PT:V3=(()=>{const[x,z]=posOf(CAN,0);return[x-.25,2.3,z];})();
const TOTTI_PT:V3=(()=>{const[x,z]=posOf(TOT,.95);return[x-.35,.11,z-.12];})();
const parab=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+h*4*u*(1-u),lerp(a[2],b[2],u)];
/** the curl: a horizontal quadratic Bézier that starts out wide of the far post (the shooter's right) and bends back in; the height
 * climbs to ≈ 2.4 m and dips under the bar at the line */
const CURL_C:V3=(()=>{const dx=GOAL_PT[0]-SPOT[0],dz=GOAL_PT[2]-SPOT[2],L=Math.hypot(dx,dz),r:Pt=[-dz/L,dx/L];return[(SPOT[0]+GOAL_PT[0])/2+r[0]*1.9,0,(SPOT[2]+GOAL_PT[2])/2+r[1]*1.9];})();
function flightAt(u:number):V3{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*SPOT[0]+b*CURL_C[0]+c*GOAL_PT[0],.11+6.12*u-4.08*u*u,a*SPOT[2]+b*CURL_C[2]+c*GOAL_PT[2]];}
const flightU=(tau:number)=>{const s=clamp((tau-SHOT)/FLY);return s*(1.12-.12*s);};
const NET_HIT:V3=[106.75,1.92,3.05],REST:V3=[106.25,.11,2.7];
function ballAt(tau:number):V3{
 if(tau<CROSS){const[x,z]=posOf(CROSSER,tau);return[x-.4,.11,z-.3];}
 if(tau<0){const u=(tau-CROSS)/-CROSS;return parab(CROSS_FROM,HEAD_PT,u,5.5);}
 if(tau<.95){const u=tau/.95;return parab(HEAD_PT,TOTTI_PT,u,4.2);}
 if(tau<TOTTI){return lerp3(TOTTI_PT,footSpot(TOT,TOTTI,yawTo(TOT,TOTTI,TP[0]),'r',.4,.14),sm(.95,TOTTI,tau));}
 if(tau<GIL_RX){const a=footSpot(TOT,TOTTI,yawTo(TOT,TOTTI,TP[0]),'r',.4,.14),u=(tau-TOTTI)/(GIL_RX-TOTTI);return lerp3(a,TP[0],1-Math.pow(1-u,1.5));}
 if(tau<GPASS){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return lerp3(TP[k],TP[k+1],e);}
 if(tau<SHOT){const u=(tau-GPASS)/(SHOT-GPASS);return lerp3(TP[TP.length-1],SPOT,1-Math.pow(1-u,1.25));}
 if(tau<IN_NET)return flightAt(flightU(tau));
 if(tau<IN_NET+.16)return lerp3(GOAL_PT,NET_HIT,easeOut((tau-IN_NET)/.16));
 const u=clamp((tau-IN_NET-.16)/.5),h=NET_HIT[1]*(1-u*u)+.11*u*u,bo=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.66)*9))*Math.exp(-(tau-IN_NET-.66)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+bo,lerp(NET_HIT[2],REST[2],u)];
}
const bulgeAt=(tau:number)=>tau<IN_NET+.1?0:Math.exp(-(tau-IN_NET-.1)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));
/** ball spin for the panel print: rolls with distance, spins hard in the curl */
const spinAt=(tau:number)=>{const b=ballAt(tau);return(b[0]+b[2])/.11*.5+(tau>SHOT?Math.min(tau,IN_NET)-SHOT:0)*40;};

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** a keyed strike blended over a run: contact at `at`, the whole move `dur` seconds */
function withStrike(p:Pose,tau:number,at:number,dur:number,foot:'l'|'r',power:number):Pose{const u=(tau-(at-STRIKE_CONTACT*dur))/dur;
 return u>0&&u<1.4?blendPose(p,strike(Math.min(1,u),{foot,power}),Math.min(sm(0,.15,u),1-sm(1,1.4,u))):p;}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4){const g=posOf(GIL,tau),tgt=a.engage[2]?yawOf(g[0]-x,g[1]-z):yawOf(b[0]-x,b[2]-z);yaw=lerpA(yaw,tgt,Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));}
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===DP)yaw=dpYaw(tau);
 if(k===GIL)yaw=gilYaw(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ger'?READY:stand();
 if(k===GIL&&tau>GIL_RX-.2&&tau<GPASS+.1){const s=clamp((sp-2)/4.5);p=blendPose(idle,dribble(distOf(GIL,tau)/CYC,{foot:'r',speed:.55+.4*s}),clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.2);p=blendPose(idle,runCycle(distOf(k,tau)/(3.2+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:mv.height??.5});}
 if(k===CAN){const D=.9,u=(tau+.52*D)/D;if(u>0&&u<1.3)p=blendPose(p,header(Math.min(1,u)),Math.min(sm(0,.15,u),1-sm(1,1.3,u)));}
 if(k===TOT)p=withStrike(p,tau,TOTTI,.7,'r',.45);
 if(k===GIL)p=withStrike(p,tau,GPASS,.7,'r',.35);
 if(k===DP){
  p=withStrike(p,tau,SHOT,.85,'r',.85);
  if(tau>IN_NET+.45)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.45,IN_NET+.95,tau));}
 if(k===GIL&&tau>IN_NET+.3)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.3,IN_NET+.8,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: the 2006 +Teamgeist (paper, navy propeller swirls)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:28}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 if(r>4){const bl=new Path2D();for(let i=0;i<2;i++){const a0=rot+i*Math.PI,q:Pt[]=[];for(let j=0;j<=6;j++){const a=a0+j*.28,rr=r*(.12+.85*j/6);q.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}bl.addPath(ribbon(q,r*.3,{seed:5+i,taper:.5,wobble:r*.01}));}s.fill(K,bl,.9);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.4,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
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
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (the floodlights throw soft, short shadows); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,spinAt(tau));};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===DP?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===DP||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===DP}:{});
  if(e.k===DP)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring on the grass round (x, z) — who / where to look */
function ring3(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink:string,seed:number){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r*w,0,z+Math.sin(i/36*TAU)*r*.85*w]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(4,kAt(c,[x,0,z])*.11),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*Math.min(1,w));s.fill(ink,rr,.95*Math.min(1,w));}
/** an actor's run painted on the grass from τ a to τ b (the support run) */
function runTrail(s:Sheet,c:Cam,k:number,a:number,b:number,w:number,ink:string,seed:number,width=.34){if(w<=0||b<=a+.05)return;const pts:Pt[]=[];let d=0,n=0;
 for(let tau=a;tau<=b+1e-6;tau+=.1){const[x,z]=posOf(k,tau),q=toCam(c,[x,0,z]);if(q[2]<6)continue;pts.push(scr(c,q));d+=q[2];n++;}
 if(pts.length<3)return;const wd=Math.min(c.F*width/(d/n),26);s.knockout(ribbon(pts,wd*1.6,{seed,taper:.3,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{seed,taper:.3,wobble:.8}),.95*w);}
/** an arrow on the grass along 3D ground points (progress p) */
function groundArrow(s:Sheet,c:Cam,P0:V3[],p:number,ink:string,seed:number,dashed=false,width=.3){if(p<=0)return;const pts:Pt[]=[];let d=0,n=0;
 const P:V3[]=[P0[0]];for(let i=1;i<P0.length;i++)for(let j=1;j<=8;j++)P.push(lerp3(P0[i-1],P0[i],j/8));
 for(const X of P){const q=toCam(c,X);if(q[2]<1)continue;pts.push(scr(c,q));d+=q[2];n++;}if(pts.length<2)return;
 const L=pts.length,cut=Math.max(2,Math.round(L*clamp(p))),seg=pts.slice(0,cut),wd=Math.min(c.F*width/(d/n),24);
 if(seg.length>2){s.knockout(ribbon(seg.slice(0,-1),wd*1.7,{seed,taper:.1,wobble:.8}),.7);s.fill(ink,ribbon(seg.slice(0,-1),wd,{seed,taper:.1,wobble:.8,gaps:dashed?[[.2,.3],[.45,.55],[.7,.8]]:[]}),.95);}
 const a=seg[Math.max(0,seg.length-2)],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3.2});}
/** the curl in the air from u0 to u1 of the flight (a riso trail), and its shadow on the grass */
function curlTrail(s:Sheet,c:Cam,u0:number,u1:number,w:number,ink:string,seed:number,dashed=false){if(w<=0||u1<=u0+.01)return;const pts:Pt[]=[],gp:Pt[]=[];let d=0,n=0;
 for(let i=0;i<=24;i++){const u=lerp(u0,u1,i/24),P=flightAt(u),q=toCam(c,P);if(q[2]<1)continue;pts.push(scr(c,q));d+=q[2];n++;const g=pr(c,[P[0],0,P[2]]);if(g)gp.push(g);}
 if(pts.length<3)return;const wd=Math.min(c.F*.13/(d/n),20);
 if(gp.length>2)s.tone(K,ribbon(gp,wd*.8,{seed:seed+5,taper:.4,wobble:.6}),.35*w);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.6,wobble:.6}),.6*w);s.fill(ink,ribbon(pts,wd,{seed,taper:.6,wobble:.6,gaps:dashed?[[.12,.2],[.32,.4],[.52,.6],[.72,.8]]:[]}),.95*w);}
/** a target ring standing in the goal mouth at the top corner */
function cornerTarget(s:Sheet,c:Cam,w:number,seed:number){if(w<=0)return;const pts:Pt[]=[];const r=.48*easeOutBack(clamp(w));
 for(let i=0;i<30;i++){const a=i/30*TAU,q=pr(c,[GOAL_PT[0],GOAL_PT[1]+Math.cos(a)*r,GOAL_PT[2]+Math.sin(a)*r]);if(q)pts.push(q);}
 if(pts.length<24)return;const k=kAt(c,GOAL_PT),rr=ribbon(pts,Math.max(4,k*.1),{close:true,seed,taper:0,wobble:.8});s.knockout(rr,.85);s.fill(Y,rr,.95*Math.min(1,w));
 const dot=pr(c,GOAL_PT);if(dot){const d=polyPath(blob(dot[0],dot[1],k*.09,k*.09,seed,{amp:.05,n:12}),true);s.fill(R,d,.95*Math.min(1,w));}}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the break plays at ~1–1.5× real time; the pre-roll is Germany's attack) */
const tau1=(t:number)=>{const ib=CUE(0,'Italy break'),gs=CUE(0,'Gilardino slips'),G=CUE(0,'goal');return key(t,mono([[0,-3.6],[ib,.9],[gs,GPASS],[G,IN_NET-.02],[SECS(0)+1,IN_NET-.02+SECS(0)+1-G]]),linear);};
const CAM1:V3=[52.5,27,68];
function cam1(t:number):Cam{
 const tau=tau1(t),G=CUE(0,'goal'),S=SECS(0);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3+2,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[58,22,-50],m=posOf(DP,tau),cel:V3=[m[0]-1,1.1,m[1]];
 const toBall=sm(CUE(0,'Italy against')+.3,CUE(0,'the last')+.6,t,easeInOutSine),toD=sm(G+.5,G+1.6,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.4,toBall),lerp(open[2],lerp(bt[2],0,.25),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,mono([[0,1500],[CUE(0,'Italy against')+.3,1650],[CUE(0,'the last')+.6,4300],[CUE(0,'Italy break'),4500],[CUE(0,'Gilardino slips'),5200],[G,5600],[G+1.6,6300],[S,6500]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'goal'),ia=CUE(0,'Italy against');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t),ita:win(ia-.1,CUE(0,'the last')+.5,t)*.9,flags:sm(ia-.1,ia+.4,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOAL_PT[2]});
  const gr=CUE(0,'Gilardino races'),ad=CUE(0,'Alessandro'),sp=CUE(0,'sprints'),gs=CUE(0,'Gilardino slips');
  // who's who in the wide shot: a yellow ring under Gilardino, then under Del Piero; his sprint leaves a trail on the grass
  {const[x,z]=posOf(GIL,tau);ring3(s,c,x,z,1.5,win(gr-.1,ad+.3,t,.3,.4)*1,Y,51);}
  {const[x,z]=posOf(DP,tau);ring3(s,c,x,z,1.5,win(ad-.1,gs+.2,t,.3,.4),Y,52);}
  runTrail(s,c,DP,Math.max(.8,tau-2.6),tau-.25,win(sp-.2,G-.6,t,.4,.5)*.85,R,53,.3);
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8,after:()=>{
   // "slips it across": the pass lane flashes as the ball goes
   const pw=win(gs-.25,gs+.9,t,.2,.4);if(pw>0)groundArrow(s,c,[TP[TP.length-1],lerp3(TP[TP.length-1],SPOT,.5),SPOT],pw,Y,54,true,.45);}});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(DP,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.1),12);},
 still:10.2,
};

// ---------------------------------------------------------------- 2 · slow replay: low behind Cannavaro as the ball is won, then a low chase camera beside Del Piero
const whip2=(t:number)=>{const a=CUE(1,'sprinted')+.55,b=CUE(1,'so Gilardino')-.25;return sm(a,Math.max(a+.4,b),t,easeInOutSine);};
const tau2=(t:number)=>{const sp=CUE(1,'sprinted'),sg=CUE(1,'so Gilardino');return key(t,mono([[0,-.45],[CUE(1,'won the ball'),.12],[sp,.75],[sp+.55,1.15],[Math.max(sp+.95,sg-.25),6.1],[sg,6.55],[CUE(1,'a friend'),7.6],[SECS(1),8.5]]),linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),w=whip2(t),m=smooth(DP,tau),g=smooth(GIL,tau),end=sm(CUE(1,'a friend')-.3,SECS(1),t,easeInOutSine);
 // A: low behind the header, looking up-field at Totti and Del Piero; B: low beside Del Piero on the main-stand side, Gilardino beyond
 const CA:V3=[13.5,1.7,9.5],TA:V3=[31,1.3,.5];
 const mx=(m[0]+g[0])/2,mz=(m[1]+g[1])/2,CB:V3=[mx-15-2*end,3.6+.5*end,mz+3.5+1.5*end],TB:V3=[mx+5+2*end,.9,mz+.6];
 const drift=sm(0,CUE(1,'sprinted')+.4,t,easeInOutSine);
 const CA2:V3=[CA[0]+3*drift,CA[1],CA[2]-1.2*drift];
 return look(lerp3(CA2,CB,w),lerp3(TA,TB,w),lerp(2300+150*drift,2450-150*end,w));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),w=whip2(t),wb=CUE(1,'won the ball'),sp=CUE(1,'sprinted'),sg=CUE(1,'so Gilardino'),af=CUE(1,'a friend'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  // "sprinted": his run painted on the grass behind him (from the moment Italy won the ball)
  runTrail(s,c,DP,.1,tau-.25,sm(sp-.1,sp+.4,t)*(1-sm(E-.9,E-.55,t)),R,61,.42);
  // "a friend": the support spot and the passing lane to it
  const fw=sm(af-.2,af+.35,t,easeOut)*(1-sm(E-.9,E-.55,t));
  ring3(s,c,SPOT[0],SPOT[2],1.2,fw,Y,62);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:()=>{
   // "won the ball": a spark where Cannavaro's head meets it
   const age=t-wb;if(age>-.35&&age<.55&&tau>-.3){const q=pr(c,HEAD_PT);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,HEAD_PT)*.7,{n:9,seed:63,g:easeOutBack(clamp((age+.35)/.25))*(1-clamp((age-.3)/.25)),width:Math.max(5,kAt(c,HEAD_PT)*.05),cov:.95});}
   // "so Gilardino": a ring round Gilardino and the ball he carries
   {const[x,z]=posOf(GIL,tau);ring3(s,c,x,z,1.3,win(sg-.15,af+.2,t,.3,.35),Y,64);}
   if(fw>0){const[gx,gz]=posOf(GIL,tau);groundArrow(s,c,[[gx+.6,0,gz+.4],lerp3([gx,0,gz],SPOT,.5),[SPOT[0],0,SPOT[2]]],fw,Y,65,true,.3);}}});
  // the replay wipe as the chapter opens; the fast pan up the pitch (the replay skips ahead)
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,Math.sin(Math.PI*w),27,.04);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · replay from low behind the shooter: the curl into the top corner, then the celebration
const tau3=(t:number)=>{const ia=CUE(2,'Italy are');return key(t,mono([[0,8.25],[CUE(2,'high'),SHOT+.1],[CUE(2,'keeper'),SHOT+.5],[CUE(2,'top corner'),IN_NET+.05],[ia,IN_NET+.75],[SECS(2),IN_NET+.75+(SECS(2)-ia)*.9]]),linear);};
const swing3=(t:number)=>{const a=CUE(2,'Italy are');return sm(a-.5,a+.9,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),push=sm(CUE(2,'high'),CUE(2,'top corner'),t,easeInOutSine),hold=sm(CUE(2,'the final'),SECS(2),t,easeInOutSine);
 const dg=nrm3([GOAL_PT[0]-SPOT[0],0,GOAL_PT[2]-SPOT[2]]),back=12-3*push,C0:V3=[SPOT[0]-dg[0]*back+dg[2]*.8,3.1,SPOT[2]-dg[2]*back-dg[0]*.8],T0:V3=[lerp(101,104.5,push),lerp(1.3,1.6,push),lerp(.6,2.2,push)];
 const m=smooth(DP,tau),C1:V3=[m[0]+6.5+hold,1.8+.4*hold,m[1]+5.5+1.2*hold],T1:V3=[m[0],1.15,m[1]-.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3300+400*push,2550-150*hold,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),hc=CUE(2,'He curls'),hi=CUE(2,'high'),kp=CUE(2,'keeper'),tc=CUE(2,'top corner'),fi=CUE(2,'the final'),u=swing3(t),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(fi-.1,fi+.3,t)*(1-sm(E-1.1,E-.6,t)),ita:sm(tc,tc+.4,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOAL_PT[2]});
  // the curl: a yellow trail behind the ball through the air (and its shadow on the grass), fading as the camera swings away
  const fu=flightU(tau);curlTrail(s,c,0,fu,(tau>SHOT?1:0)*(1-sm(.2,.6,u)),Y,71);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:4,hero:true,after:({hero})=>{
   // "He curls": an orange ring round his right boot, the striking foot
   const lw=win(hc-.1,hi+.4,t,.25,.3);
   if(hero&&lw>0){const toe=hero.joints.rToe,an=hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*easeOutBack(clamp(lw))+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.8]);}
    s.fill(R,ribbon(pts,Math.max(3,r*.2),{seed:72,close:true,taper:0,wobble:.8}),.95*Math.min(1,lw));}
   // "keeper Jens Lehmann": a spark off his left glove's reach (the ball goes past it)
   const age=t-kp;if(age>-.2&&age<.7){const[lx,lz]=posOf(LEH,SHOT+.62),P:V3=[lx,2.3,lz+2.2],q=pr(c,P);if(q)sparkBurst(s,R,q[0],q[1],kAt(c,P)*.55,{n:8,seed:73,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.45)/.25)),width:Math.max(4,kAt(c,P)*.05)});}
   // "top corner": the target ring in the corner, as the net bulges
   cornerTarget(s,c,sm(tc-.3,tc+.15,t)*(1-sm(.1,.5,u)),74);}});
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(DP,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a high chase camera behind Del Piero, the run, the support spot, the bend, the far corner
const tau4=(t:number)=>key(t,mono([[0,4.3],[CUE(3,'wins'),4.8],[CUE(3,'sprint forward'),5.6],[CUE(3,'support'),7.05],[CUE(3,'bend'),8.3],[CUE(3,'far corner'),SHOT+.35],[SECS(3),IN_NET+.9]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(DP,tau),g=sm(CUE(3,'bend')-.4,CUE(3,'far corner'),t,easeInOutSine),hold=sm(CUE(3,'far corner'),SECS(3),t,easeInOutSine);
 const C:V3=[m[0]-7.8+1.5*hold,3.9+.6*hold,m[1]+3.4],T:V3=[lerp(m[0]+8,101,g),lerp(.6,1.3,g),lerp(m[1]-3.4,.5,g)];
 return look(C,T,lerp(2400,2600,g));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your turn'),wb=CUE(3,'wins'),sf=CUE(3,'sprint forward'),su=CUE(3,'support'),bi=CUE(3,'bend'),fc=CUE(3,'far corner'),E=SECS(3);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)*.8});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOAL_PT[2]});
  const fade=1-sm(E-.9,E-.55,t);
  // "sprint forward": the run still to come, an orange arrow on the grass from his feet to the support spot
  const aw=sm(sf-.2,sf+.6,t,easeOut)*(1-sm(su+.6,su+1.2,t));if(aw>0){const P:V3[]=[];for(let i=0;i<=10;i++){const u=lerp(tau+.25,SHOT-.05,i/10),[x,z]=posOf(DP,u);P.push([x,0,z]);}groundArrow(s,c,P,aw,R,81,false,.38);}
  // "support": the spot beside Gilardino and the dashed lane to it
  const sw=sm(su-.2,su+.3,t,easeOut)*fade;ring3(s,c,SPOT[0],SPOT[2],1.2,sw,Y,82);
  if(sw>0&&tau<SHOT){const[gx,gz]=posOf(GIL,Math.min(tau,GPASS));groundArrow(s,c,[[gx+.5,0,gz+.4],lerp3([gx,0,gz],SPOT,.5),[SPOT[0],0,SPOT[2]]],sw*(1-sm(GPASS,GPASS+.4,tau)),Y,83,true,.26);}
  // "bend it": the curl drawn ahead, dashed, from the spot out wide of the post and back into the corner; then the real one follows it
  curlTrail(s,c,0,sm(bi-.1,bi+.7,t,easeOut),sm(bi-.1,bi+.2,t)*(1-sm(IN_NET+.2,IN_NET+.6,tau))*fade,Y,84,true);
  if(tau>SHOT)curlTrail(s,c,0,flightU(tau),fade,R,85);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:()=>{
   // "wins the ball": a yellow ring round the ball (your team has it)
   const b=ballAt(tau),rw=win(wb-.15,sf+.3,t,.3,.35);if(rw>0){const q=pr(c,b);if(q){const r=kAt(c,b)*.5*easeOutBack(clamp(rw)),pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.7]);}s.fill(Y,ribbon(pts,Math.max(3,r*.18),{seed:86,close:true,taper:0,wobble:.8}),.95*Math.min(1,rw));}}
   // "Your turn": a burst over the hero as the lesson starts
   const age=t-yt;const hero=posOf(DP,tau);if(age>-.1&&age<.6){const P:V3=[hero[0],2.3,hero[1]],q=pr(c,P);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,P)*.7,{n:9,seed:87,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(4,kAt(c,P)*.05)});}
   // "far corner": the target in the corner
   cornerTarget(s,c,sm(fc-.3,fc+.2,t)*fade,88);}});
 },
 still:4.6,
};

const film:RisoStory={
 id:'del-piero-germany-2006',format:'11v11',title:"Del Piero's Last-Minute Curler",theme:'Counter-attack: sprint forward to support the ball carrier, then bend your shot into the far corner',
 ageNote:'World Cup semi-final, Germany v Italy, Westfalenstadion, Dortmund, 4 July 2006 (0–2 after extra time). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — grass bits thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and dark crumbs thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(K,b,.7*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
