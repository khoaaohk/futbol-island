/** Luis Suárez — "Signature: the cheeky nutmeg finish" (lib/town/iconicPlays.json, kind "signature"). An iconic-play riso film (RisoStory,
 * chapters mode): a 1:1 reconstruction, from WRITTEN accounts (the footage was not reviewed), of ONE real goal that shows the signature:
 * Paris Saint-Germain 1–3 Barcelona, Champions League quarter-final first leg, Parc des Princes, Paris, Wednesday 15 April 2015 (20:45,
 * floodlit), Suárez's second goal of the night, 79th minute (0–3): he is sprung clear, David Luiz comes across to cover, Suárez plays the
 * ball through Luiz's legs, runs on and finishes into the top corner.
 * WHY THIS MOMENT: Wikipedia notes Suárez's "particular penchant for nutmegging opponents (putting the ball through their legs)", and this
 * night is the best-documented example: he "nutmegged PSG defender David Luiz twice before scoring both goals" (Wikipedia; BBC). The 79th-
 * minute goal is the one where every account puts the nutmeg directly before the finish. Kid-appropriate: nothing controversial is shown.
 *
 * SOURCES (read Sept 2026 with curl, cached under scratchpad/films/src-cache/):
 *  - The Guardian, Scott Murray, "PSG v Barcelona: Champions League quarter-final, first leg – as it happened", 15 Apr 2015
 *    https://www.theguardian.com/football/live/2015/apr/15/psg-barcelona-champions-league-live  (guardian-psg-bar-2015-live.txt)
 *    79 min: "He's sprung clear down the inside-left channel, PSG's defence all over the shop. Luiz comes across to cover, and is nutmegged
 *    for his trouble. Suarez strides towards the area, and lashes a shot of extreme violence into the top-right corner of the net."
 *    Kits: "PSG take to the field in their dark-blue shirts with red-and-white flash … so [Barcelona] are in their … third choice of neon
 *    yellow." Line-ups (Sirigu in goal; Luiz on for the injured Thiago Silva in the first half); referee Mark Clattenburg.
 *  - BBC Sport, "Paris St-Germain 1-3 Barcelona", 15 Apr 2015  https://www.bbc.com/sport/football/32295986  (bbc-32295986.txt)
 *    "Luiz … fell foul of Suarez again for the Uruguayan's second goal, suffering a second nutmeg as the striker took himself clear on goal
 *    before curling a magnificent finish into the top corner."
 *  - Wikipedia, "2014–15 UEFA Champions League knockout phase" (15 April 2015, 20:45, Parc des Princes, 45,893; Neymar 18', Suárez 67' 79',
 *    Mathieu 82' o.g.; referee Clattenburg)  https://en.wikipedia.org/wiki/2014%E2%80%9315_UEFA_Champions_League_knockout_phase
 *  - Wikipedia, "Luis Suárez (Uruguayan footballer)" (the two nutmegs on Luiz that night; his penchant for nutmegs)
 *    https://en.wikipedia.org/wiki/Luis_Su%C3%A1rez_(Uruguayan_footballer)
 * CONFIRMED by those accounts: date, venue, floodlit evening kick-off, the 79th minute, 0–2 → 0–3 (Barcelona already leading); Suárez sprung
 *  clear down the INSIDE-LEFT channel; Luiz came ACROSS to cover and was nutmegged; Suárez then strode toward the area ("took himself clear
 *  on goal") and CURLED / lashed the shot into the TOP corner (the Guardian: top-right); Salvatore Sirigu was PSG's keeper; it was Luiz's
 *  second nutmeg of the night; PSG in dark-blue shirts with the red-and-white flash, Barcelona in neon yellow.
 * INFERRED (illustrative, not narrated unless noted): who played the pass that sprang him (a yellow team-mate, unnamed) and from where;
 *  every position and timing between the confirmed beats; the side he ran round Luiz (drawn: Luiz's right, the touchline side); the number
 *  of touches; his shooting foot (drawn RIGHT, his stronger foot; a right-foot curler from the inside-left bending into the far top corner —
 *  the narration never names the foot); where exactly he shot from (drawn: at the edge of the box); Sirigu's dive (drawn: to his left, beaten);
 *  which end PSG defended and the direction of play on screen; the other players' positions (Neymar, Messi, Marquinhos, Maxwell, van der
 *  Wiel, Matuidi); shirt numbers (Suárez 9, Neymar 11, Messi 10 — well known; Luiz 32, Sirigu 30 from memory); Barcelona's yellow shorts and
 *  socks and navy trim; PSG's navy shorts and socks; the flash drawn only on the shirt FRONT; Sirigu's grey keeper kit; the referee's black;
 *  Luiz's big curly hair; the crowd colours (PSG navy, red and white; a small yellow away block); the Parc's look (a steep, two-tier,
 *  football-only bowl close to the pitch under a continuous roof with floodlights along its lip); the ball print; every camera.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera
 * in near real time (the floodlit Parc → the pass → Suárez clear → Luiz across → through the legs → the curler → goal); 2 = slow-motion
 * replay from a LOW camera behind Suárez: Luiz stretches, his legs open (a yellow "gate" between his feet), the poke with the right boot,
 * the ball through the gap, the dart round him; 3 = replay from BEHIND THE GOAL: the curling shot into the top corner past Sirigu's dive,
 * then a swing round to the celebration under the floodlights; 4 = the lesson from a low camera BEHIND LUIZ (watch his feet → the gate
 * opens → the ball through it → sprint round → meet it). All bodies go through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, `prev`
 * secondary motion, motionSmear on the fast moves); small wide-shot figures print at `low` detail. Handedness: the world is right-handed
 * like athlete.ts (x toward PSG's goal, y up, +z = the main-stand side), so a figure attacking +x has its right side at +z and Suárez's
 * RIGHT boot strikes with no mirrored projector; the inside-left channel is −z (the far side); Sirigu faces −x, so his LEFT is +z.
 * Scenes read only (t, c); every action keys off cue times (withTiming re-times the film); all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` key the action; their `at` and each chapter's `seconds` are ESTIMATES until the
 * Kokoro voice exists. withTiming matches a cue by its FIRST word only, in order, so no cue starts with a word that also appears between it
 * and the previous cue's first word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Paris, 2015. Barcelona, in bright yellow, lead Paris Saint-Germain. Luis Suárez races clear. David Luiz rushes across... through his legs! Suárez curls it into the top corner. Goal!',tail:1.9,
  cues:['Paris','Barcelona','Luis Suárez','races clear','David Luiz','through his legs','Suárez curls','top corner','Goal']},
 {label:'Watch it again',text:'Watch it again, slowly. Luiz stretches and his legs open. Suárez pokes the ball through the gap, and darts round to collect it.',tail:1.4,
  cues:['Watch it again','Luiz stretches','legs open','pokes','through the gap','darts round','collect it']},
 {label:'The finish',text:'Then a curling shot past keeper Salvatore Sirigu. His second nutmeg on Luiz that night!',tail:1.9,
  cues:['Then','curling shot','Salvatore Sirigu','second nutmeg','that night']},
 {label:'Your turn',text:"Your turn: watch the defender's feet. If their legs open, play the ball through them, then sprint round to meet it!",tail:1.5,
  cues:['Your turn','watch the',"legs open",'play the ball','sprint round','meet it']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py suarez-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/suarez-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times. */
import timingJson from '../../../public/plays/narration/suarez-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ .32 s a word, as calibrated on the approved films' Kokoro timings): pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('suarez: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('suarez: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre (full-sheet framing, never sheet.safe). */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Barcelona attack +X, PSG's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
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
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a ring of ground points (x, z, rx, rz) projected */
function ringPts(c:Cam,x:number,z:number,rx:number,rz:number,n=32):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,q=pr(c,[x+Math.cos(a)*rx,0,z+Math.sin(a)*rz]);if(q)o.push(q);}return o;}

// ---------------------------------------------------------------- the Parc des Princes at night: a steep two-tier bowl close to the pitch, one continuous roof
/** stand planes (a along 0..1, b up the rake 0..1): 0 the far side (z<0), 1 the main stand (z>0, the TV camera's side), 2 behind PSG's
 * goal (x>105), 3 behind the other goal (x<0). The shape is inferred: football-only, stands right against the touchlines, a roof all round. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-9,114,a),1.2+27*b,-38.5-27*b],
 (a,b)=>[lerp(114,-9,a),1.2+25*b,38.5+26*b],
 (a,b)=>[110+26*b,1.2+25*b,lerp(-54,54,a)],
 (a,b)=>[-5-26*b,1.2+25*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,96,64,64],STAND_ROWS=14,TIER=.46;
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number;flash?:number;lamps?:number}={}){
 const{roar=0,flash=0,lamps=0}=o,tt=twos(t);
 // an April night in Paris: deep navy over the paper, a faint floodlit haze above the bowl
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-700],[1e4,hz[1]-700],[1e4,hz[1]+80],[-1e4,hz[1]+80]],true),.12);
 const planes=new Path2D(),band=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  // the tier split: a dark band of boxes between the lower and upper tiers
  addPoly(band,polyP(c,[S(0,TIER-.035),S(1,TIER-.035),S(1,TIER+.035),S(0,TIER+.035)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.82),[0,9.5,0]),add3(S(0,.82),[0,9.5,0])]));
  seg3(c,add3(S(0,.82),[0,9.3,0]),add3(S(1,.82),[0,9.3,0]),.5,edge);}
 s.knockout(planes);s.tone(K,planes,.55);s.tone(B,planes,.24);
 // the crowd: PSG navy, red and white, a small block of Barcelona yellow (inferred); the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-TIER)<.05)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.2)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<2)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.55/q[2],2.4,16),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const away=si===0&&a>.84&&a<.96&&b>TIER;
   const ink=away?3:h<.5?0:h<.72?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.fill(K,inks[0],.8);s.knockout(inks[1],.8);s.fill(R,inks[1],.95);s.knockout(inks[2],.75);s.knockout(inks[3]);s.fill(Y,inks[3],.95);
 s.knockout(band);s.fill(K,band,.9);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.6);
 // floodlights along the roof lip with yellow haloes (brighter on `lamps`)
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i],n=i<2?9:6;for(let k=0;k<n;k++){const u=(k+.5)/n,a=add3(S(u-.02,.82),[0,8.8,0]),b=add3(S(u+.02,.82),[0,8.8,0]),m=lerp3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*(4.2+2.5*lamps),8,160);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22+.2*lamps);s.tone(Y,halo,.4+.25*lamps);s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const r1=hash(i*17+T12*101,3),r2=hash(i*29+T12*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,T12)));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
/** floodlit grass (yellow under a blue screen) with mowing stripes, LED boards, paper lines and both goals (PSG's goal can be drawn later,
 * in front of the players, when the camera is behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.55);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(B,st,.18);
 // LED boards: navy with paper and yellow panels
 const bd=new Path2D(),pn=new Path2D(),pn2=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([-4,0,-36.5],[109,0,-36.5]);board([109,0,-36],[109,0,36]);board([-4,0,36],[-4,0,-36]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(k%3?pn:pn2,polyP(c,[[x,.25,-36.45],[x+3.4,.25,-36.45],[x+3.4,.65,-36.45],[x,.65,-36.45]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%3?pn:pn2,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.65,z+3.4],[108.95,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.knockout(pn2);s.fill(Y,pn2,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??3);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, ballY ≈ 2) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.32],[R,.2]];
const SKIN_S:InkFill[]=[[Y,.36],[R,.26],[K,.04]];
const SKIN_M:InkFill[]=[[Y,.42],[R,.32],[K,.12]];
/** Barcelona: the neon-yellow third kit (confirmed); yellow shorts and socks, navy trim and numbers inferred */
const BAR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:Y,socks:Y,boots:K,trim:K,numberInk:K,skin:SKIN_S,hair:K,hairStyle:'short',line:K,shade:[K,.3],seed:3,...o});
/** Luis Suárez: number 9, short dark hair, right-footed */
const SUAREZ_ST=BAR({number:9,skin:SKIN_S,hair:[K,.95],build:{height:1.82,bulk:1.06,thighs:1.1},seed:9});
/** PSG: dark-blue shirts (confirmed) with the red-and-white flash (printed by drawPlayer on the shirt front); navy shorts and socks inferred */
const PSG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,trim:R,numberInk:'paper',skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.35],seed:5,...o});
/** David Luiz: big curly hair (inferred from his familiar look), tall; number 32 from memory */
const LUIZ_ST=PSG({number:32,skin:SKIN_M,hair:[K,.95],hairStyle:'curly',build:{height:1.89,bulk:1.05,head:1.08},seed:32});
/** Salvatore Sirigu: grey keeper kit (inferred), long sleeves */
const SIRIGU_ST:AthleteStyle={shirt:[K,.4],shorts:[K,.7],socks:[K,.4],boots:K,skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,gloves:[Y,.7],sleeves:'long',trim:Y,number:30,numberInk:K,build:{height:1.92},seed:30};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN,hair:[K,.5],hairStyle:'bald',line:K,seed:12};

/** PSG's red flash with its white edges, printed on the shirt FRONT when it faces the camera (athlete.ts has no single-band pattern) */
function psgFlash(s:Sheet,c:Cam,r:DrawResult){
 if(r.detail==='low')return;const sk=r.sk,up=nrm3(sub3(sk.neck,sk.pelvis)),f=nrm3(cross3(up,nrm3(sub3(sk.rSh,sk.lSh)))),fh=nrm3(cross3(up,nrm3(sub3(sk.rHip,sk.lHip))));
 if(dot3(f,nrm3(sub3(c.C,sk.chest)))<.2)return;
 const P3:V3[]=[add3(add3(sk.neck,mul3(up,-.07)),mul3(f,.1)),add3(sk.chest,mul3(f,.14)),add3(add3(sk.pelvis,mul3(up,.12)),mul3(fh,.13))],pts:Pt[]=[];
 for(const p of P3){const q=pr(c,p);if(!q)return;pts.push(q);}
 const w=kAt(c,sk.chest);s.knockout(ribbon(pts,w*.17,{seed:7,taper:0,wobble:.3}),.9);s.fill(R,ribbon(pts,w*.1,{seed:7,taper:0,wobble:.3}),.95);
}
/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;flash?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.flash)psgFlash(s,camera,r);
 return r;
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after the nutmeg poke)
type Role='suarez'|'bar'|'psg'|'luiz'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];engage?:[number,number];key?:boolean};
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** the ball events (τ): the pass that springs him, his touches (receive, two carries, the POKE through the legs at 0, the collection behind
 * Luiz, one more carry), the shot, the ball in the net */
const PASS=-3.4,RECV=-2.3,SHOT=2.6,IN_NET=SHOT+.62;
const TOUCHES=[RECV,-1.5,-.7,0,1.0,1.8];
/** Suárez's run: clear down the inside-left channel (−z), round Luiz on the touchline side, strides to the edge of the box, the shot */
const SK:number[][]=[[-10,49,-17],[-6,55.5,-16.6],[-4.2,60.4,-16.2],[-3.4,62.8,-15.8],[-2.3,67,-14.9],[-1.5,70.8,-13.9],[-.7,74.4,-13],[0,77,-12.45],
 [.3,77.8,-13.3],[.6,78.9,-13.8],[.85,80,-13.4],[1.0,80.6,-12.85],[1.4,82.5,-12],[1.8,84.5,-11.2],[2.2,86.3,-10.45],[2.6,87.9,-9.85],[3.0,89.1,-9.6],
 [3.5,90.4,-9.8],[4.2,91.8,-11],[5.2,93.1,-13.6],[6.5,94.2,-17],[8,95,-20]];
/** the right-foot ball spot at τ on Suárez's keys: ahead and a touch to his right */
function footOn(keys:number[][],tau:number):[number,number]{const p=herm(keys,tau),a=herm(keys,tau-.08),b=herm(keys,tau+.08),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;
 return[p[0]+fx*.45-fz*.12,p[1]+fz*.45+fx*.12];}
/** the gate: where the poked ball crosses x = 78.1 — Luiz stands there, feet either side of the ball's line */
const POKE0=footOn(SK,0),COLLECT=footOn(SK,1.0),GATE_X=78.15,GATE_Z=lerp(POKE0[1],COLLECT[1],(GATE_X-POKE0[0])/(COLLECT[0]-POKE0[0]));
const ACTORS:Actor[]=[
 {name:'Suárez',role:'suarez',style:SUAREZ_ST,key:true,keys:SK},
 {name:'Luiz',role:'luiz',style:LUIZ_ST,key:true,engage:[-2.2,.7],keys:[[-10,87,1],[-5,86,-2],[-3,83.6,-5.4],[-2,81.3,-8.6],[-1.1,79.5,-11],[-.45,78.5,GATE_Z+.1],[-.1,GATE_X,GATE_Z],[.4,GATE_X-.05,GATE_Z],[.75,78.4,GATE_Z-.25],[1.15,79.4,-12.7],[1.8,82.2,-11.7],[3,86.2,-10.4],[4.5,89.6,-10.8],[8,92,-12.5]]},
 {name:'Sirigu',role:'gk',style:SIRIGU_ST,key:true,keys:[[-10,101.2,-1],[-1,101.3,-2],[1.5,101.7,-2.7],[2.6,101.9,-3],[8,101.9,-3]]},
 {name:'passer',role:'bar',style:BAR({number:8,seed:21}),keys:[[-10,44,-4],[-6,50,-5.2],[-4,54.6,-6.1],[-3.4,55.9,-6.4],[-2.5,57.5,-6],[8,68,-3]]},
 {name:'Neymar',role:'bar',style:BAR({number:11,seed:22}),keys:[[-10,52,5],[-4,62,3],[0,73.5,.5],[2.6,85,-.5],[4,89.5,-4],[5.5,92.5,-10],[8,94,-16]]},
 {name:'Messi',role:'bar',style:BAR({number:10,seed:23,build:{height:1.7}}),keys:[[-10,45,11],[-4,54,9],[1,66,7],[8,80,2]]},
 {name:'Marquinhos',role:'psg',style:PSG({number:5,seed:31}),keys:[[-10,83,5],[-4,84,2.5],[0,85.6,-1.6],[2.6,92.2,-4.4],[4,95,-5.5],[8,96.5,-7]]},
 {name:'Maxwell',role:'psg',style:PSG({number:17,seed:32,hairStyle:'bald'}),keys:[[-10,80,15],[-3,82,11],[0,86,6],[3,94,2],[8,97,0]]},
 {name:'van der Wiel',role:'psg',style:PSG({number:23,seed:33}),keys:[[-10,62,-24],[-3,66,-21],[0,73,-18.5],[2,80,-16],[4,87,-14.5],[8,91,-15]]},
 {name:'Matuidi',role:'psg',style:PSG({number:14,seed:34,skin:SKIN_M,hairStyle:'bald'}),keys:[[-10,64,3],[-3,67,-1],[0,72,-4],[3,80,-6.5],[8,86,-8]]},
 {name:'referee',role:'ref',style:REF,keys:[[-10,60,7],[-3,66,3],[0,73,1],[4,84,-3],[8,88,-5]]},
];
const SUA=0,LUIZ=1,GK=2,PASSER=3,NEYMAR=4;
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the pass, small right-foot touches, the poke through the legs, the curler
const TP=TOUCHES.map(t=>footOn(SK,t)),SHOT0=footOn(SK,SHOT);
/** the top corner (the Guardian: top-right; +z is the shooter's right) and where the ball drops in the net */
const NET:V3=[105.3,2.12,3.05],REST:V3=[106.4,.11,2.5];
/** the curl: a quadratic Bézier whose control point swings out past the far post (+z) and bends back in (right-foot inside curl) */
const CURL:V3=[97.5,1.9,5.6];
function passFrom():[number,number]{const p=posOf(PASSER,PASS),v=velOf(PASSER,PASS),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*.45,p[1]+v[1]/l*.45];}
function ballAt(tau:number):V3{
 if(tau<PASS){const p=posOf(PASSER,tau),v=velOf(PASSER,tau),l=Math.hypot(v[0],v[1])||1,ph=distOf(PASSER,tau)/2.6,bob=.3*Math.abs(Math.sin(ph*Math.PI));return[p[0]+v[0]/l*(.45+bob),.11,p[1]+v[1]/l*(.45+bob)];}
 if(tau<RECV){const a=passFrom(),u=(tau-PASS)/(RECV-PASS),e=1-Math.pow(1-u,1.4);return[lerp(a[0],TP[0][0],e),.11,lerp(a[1],TP[0][1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const a=TP[k],b=k+1<TP.length?TP[k+1]:SHOT0,t1=k+1<TOUCHES.length?TOUCHES[k+1]:SHOT,u=(tau-TOUCHES[k])/(t1-TOUCHES[k]),e=1-(1-u)*(1-u);
  return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT),A:V3=[SHOT0[0],.11,SHOT0[1]],v=1-u;return[v*v*A[0]+2*v*u*CURL[0]+u*u*NET[0],v*v*A[1]+2*v*u*CURL[1]+u*u*NET[1],v*v*A[2]+2*v*u*CURL[2]+u*u*NET[2]];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e)*(1-u)+REST[1]*u+.25*Math.sin(Math.PI*u)*(1-u),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** Luiz stretches for the ball: the right leg reaches long and wide, the left bends low — the legs OPEN (the gate) */
const SPLAY:Partial<Pose>={lHipA:26,rHipA:40,lHipF:34,rHipF:40,rHipR:30,lKnee:64,rKnee:16,rAnk:-14,lAnk:6,lean:30,pitch:6,bend:-10,lShA:58,rShA:42,lShF:6,rShF:24,lElb:40,rElb:34,neckP:34,squash:-.05};
/** Suárez's poke: a short jab with the toe of the right boot, body low over the ball */
const POKE_T=0;
/** Suárez's gait phase: running free by distance before the pass arrives; from the first touch one stride per touch (two while he darts
 * round Luiz), so the right foot meets the ball at every touch (dribble's touchPhase) */
const PH0=Math.floor(distOf(SUA,RECV)/3.3)+touchPhase;
const PH_KEYS:[number,number][]=[[RECV,PH0],[-1.5,PH0+1],[-.7,PH0+2],[0,PH0+3],[1.0,PH0+5],[1.8,PH0+6],[SHOT,PH0+7]];
function gaitPh(tau:number):number{const f=(u:number)=>distOf(SUA,u)/3.3;
 if(tau<RECV)return f(tau)+PH0-f(RECV);if(tau>SHOT)return PH0+7+f(tau)-f(SHOT);return key(tau,PH_KEYS,linear);}
function yawSua(tau:number):number{const v=velOf(SUA,tau),sp=Math.hypot(v[0],v[1]),b=ballAt(tau),[x,z]=posOf(SUA,tau);return sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(SUA,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===SUA)yaw=yawSua(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='psg'||a.role==='luiz'?READY:stand();
 if(k===SUA){
  const s=clamp((sp-2)/4.5),ph=gaitPh(tau),run=runCycle(ph,{speed:.55+.4*s}),dr=dribble(ph,{foot:'r',speed:.5+.4*s});
  // with the ball he dribbles; while the ball rolls through Luiz's legs he simply sprints round
  const free=tau<RECV-.2?1:bump(.05,1.0,tau);p=blendPose(idle,blendPose(dr,run,free),clamp((sp-.3)/.8));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 if(k===LUIZ){p=over(p,SPLAY,Math.min(1,1.25*bump(-.45,.75,tau)));if(tau>.6&&tau<1.3)p=over(p,{twist:-30,neckY:-40,lean:20},bump(.6,1.3,tau));}
 if(k===PASSER){const D=.7,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===GK){const D=.85,at=IN_NET-.08,u=(tau-(at-.55*D))/D;if(u>0)p=keeperDive(Math.min(1,u),{side:'l',height:.95});}
 if(k===SUA){
  // the poke through the legs, then the curler; after the goal, the celebration run
  {const D=.55,u=(tau-(POKE_T-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.28}),.85*Math.min(sm(0,.2,u),1-sm(.9,1.3,u)));}
  {const D=.9,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:1}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+.9,tau));
 }
 if(k===NEYMAR&&tau>IN_NET+.2)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.2,IN_NET+.7,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:5});}
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;luiz?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;trail?:number}={}):PlayOut{
 const{minBall=6,hero=false,trail=0}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: soft and short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 // the ball's riso trail (a yellow ribbon along the last stretch of its path)
 if(trail>0){const pts:Pt[]=[];for(let i=0;i<=12;i++){const q=pr(c,ballAt(tau-.4+.4*i/12));if(q)pts.push(q);}if(pts.length>4){s.knockout(ribbon(pts,br*1.2,{seed:44,taper:.9,wobble:.6}),.6*trail);s.fill(Y,ribbon(pts,br*.8,{seed:44,taper:.9,wobble:.6}),.9*trail);}}
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,luizR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===SUA?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const psg=a.role==='psg'||a.role==='luiz';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===SUA||e.k===LUIZ||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===SUA,flash:psg}:{flash:psg&&!passing});
  if(e.k===SUA)heroR=r;if(e.k===LUIZ)luizR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,luiz:luizR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replay and the lesson
/** the GATE: a yellow halftone triangle between Luiz's two ankles and his hips — the gap the ball goes through */
function gate(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const j=r.joints,l=j.lAn,rr=j.rAn,top:Pt=[(j.lHip[0]+j.rHip[0])/2,(j.lHip[1]+j.rHip[1])/2],
 cx=(l[0]+rr[0]+top[0])/3,cy=(l[1]+rr[1]+top[1])/3,g=(p:Pt):Pt=>[cx+(p[0]-cx)*(.6+.4*w),cy+(p[1]-cy)*(.6+.4*w)],tri=[g(l),g(rr),g([top[0],lerp(top[1],(l[1]+rr[1])/2,.12)])];
 const hw=Math.max(3,Math.hypot(l[0]-rr[0],l[1]-rr[1])*.06);s.knockout(ribbon([...tri,tri[0]],hw*2,{seed:51,taper:0,wobble:.5}),.7*w);s.tone(Y,polyPath(tri,true),.5*w);s.fill(Y,ribbon([...tri,tri[0]],hw,{seed:51,taper:0,wobble:.5}),.95*w);}
/** a ground arrow along a list of world points (drawn progressively with w) */
function groundArrow(s:Sheet,c:Cam,P:[number,number][],ink:string,w:number,seed:number,wm=.12){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(const[x,z] of P){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=c.F*wm/d;
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
const ballPath=(t0:number,t1:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const b=ballAt(lerp(t0,t1,i/n));o.push([b[0],b[2]]);}return o;};
const runPath=(t0:number,t1:number,n=16):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(SUA,lerp(t0,t1,i/n)));return o;};
/** a red ring round his right boot ("pokes") */
function bootRing(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const toe=r.joints.rToe,an=r.joints.rAn,rad=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.25*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*rad*1.2,cy+Math.sin(a)*rad*.8]);}s.fill(R,ribbon(pts,Math.max(3,rad*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*w);}
/** a flat ring on the grass (x, z) */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,ink:string,w:number,seed:number){if(w<=0)return;const pts=ringPts(c,x,z,rx*(.6+.4*w),rz*(.6+.4*w),36);if(pts.length<30)return;
 const rr=ribbon(pts,Math.max(4,kAt(c,[x,0,z])*.07),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUEW(0,'Goal'),S=SECS(0);return key(t,mono([[0,-9.4],[CUEW(0,'Luis')-.1,-4.1],[CUEW(0,'races'),-2.5],[CUEW(0,'David'),-1.3],[CUEW(0,'through'),.12],[CUEW(0,'Suárez curls'),1.25],[CUEW(0,'top corner'),SHOT+.05],[G,IN_NET+.05],[S+1,IN_NET+.05+(S+1-G)*.9]]),linear);};
const CAM1:V3=[58,23,62];
function cam1(t:number):Cam{
 const L=CUEW(0,'Luis'),G=CUEW(0,'Goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN_NET));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[66,6,-4],m=posOf(SUA,tau),cel:V3=[m[0]-1,1.1,m[1]];
 const toBall=sm(L-1.6,L,t,easeInOutSine),toS=sm(G+.4,G+1.5,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.2,toBall),lerp(open[2],bt[2]*.85,toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,1500],[L-1.6,1900],[L,4500],[CUEW(0,'David'),5000],[CUEW(0,'through'),5400],[G,5000],[G+1.5,6000],[S,6300]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Goal');
  stadium(s,c,v,t,[0,2,3],{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)*(1-sm(SECS(0)-.9,SECS(0)-.4,t))});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(SUA,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9.5,
};

// ---------------------------------------------------------------- 2 · slow replay, low camera behind Suárez: the stretch, the gate, the poke, the dart
const tau2=(t:number)=>key(t,mono([[0,-1.35],[CUEW(1,'Luiz'),-.5],[CUEW(1,'legs'),-.12],[CUEW(1,'pokes'),0],[CUEW(1,'through'),.28],[CUEW(1,'darts'),.55],[CUEW(1,'collect'),1.0],[SECS(1),1.55]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(SUA,tau),open=1-sm(0,1.2,t,easeInOutSine),push=sm(CUEW(1,'Luiz')-.2,CUEW(1,'legs')+.2,t,easeInOutSine)*(1-sm(CUEW(1,'darts')-.2,CUEW(1,'collect'),t,easeInOutSine)),back=sm(CUEW(1,'collect')-.3,SECS(1),t,easeInOutSine);
 const tg:[number,number]=[lerp(GATE_X,m[0]+2.5,sm(.4,1.3,tau)),lerp(GATE_Z,m[1]+.4,sm(.4,1.3,tau))];
 const C:V3=[m[0]-4.6-1.2*open+.8*push-.6*back,1.25+.35*open+.4*back,m[1]-2.8-.8*open+.3*push-.8*back],T:V3=[lerp(m[0],tg[0],.55),.78-.12*push,lerp(m[1],tg[1],.55)];
 return look(C,T,2500+650*push-200*back-250*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),lu=CUEW(1,'Luiz'),lo=CUEW(1,'legs'),po=CUEW(1,'pokes'),th=CUEW(1,'through'),da=CUEW(1,'darts'),co=CUEW(1,'collect'),E=SECS(1);
  stadium(s,c,v,t,[0,2]);
  ground(s,c);
  // "darts round": the red arrow of his run round Luiz; "through the gap": the ball's line through the gate
  groundArrow(s,c,ballPath(0,1.0),Y,sm(th-.2,th+.4,t,easeOut)*(1-sm(E-.9,E-.5,t)),61,.09);
  groundArrow(s,c,runPath(0,1.0),R,sm(da-.25,da+.45,t,easeOut)*(1-sm(E-.9,E-.5,t)),63);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,trail:sm(th-.3,th,t)*(1-sm(da+.3,da+.7,t)),after:({hero,luiz})=>{
   // "Luiz stretches": his reach; "legs open": the gate between his feet
   gate(s,luiz,sm(lo-.2,lo+.3,t,easeOutBack)*(1-sm(th+.4,th+.8,t)));
   bootRing(s,hero,sm(po-.15,po+.2,t,easeOutBack)*(1-sm(th+.1,th+.4,t)));
   if(luiz&&t>lu-.1&&t<lo){const f=luiz.joints.rToe,g=bump(lu-.1,lo,t);sparkBurst(s,Y,f[0],f[1],kAt(c,[GATE_X,0,GATE_Z])*.5,{n:7,seed:71,g,width:7,cov:.9});}
   // "collect it": a spark where he meets the ball again behind Luiz
   const age=t-co;if(age>-.2&&age<.6){const q=pr(c,[COLLECT[0],.12,COLLECT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[COLLECT[0],0,COLLECT[1]])*.6,{n:8,seed:73,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:9});}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the curler into the top corner, then the celebration
const tau3=(t:number)=>{const sn=CUEW(2,'second');return key(t,mono([[0,1.6],[CUEW(2,'Then'),1.85],[CUEW(2,'curling'),SHOT],[CUEW(2,'Salvatore'),IN_NET-.02],[sn,IN_NET+1],[CUEW(2,'that'),IN_NET+1.6],[SECS(2),IN_NET+1.6+(SECS(2)-CUEW(2,'that'))*.8]]),linear);};
const swing3=(t:number)=>sm(CUEW(2,'Salvatore')+.5,CUEW(2,'second')+.5,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(SUA,tau),e=sm(SHOT-.1,IN_NET,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'that'),SECS(2),t,easeInOutSine);
 const C0:V3=[112.5,4.4,5.2],T0:V3=[lerp(m[0],101,e),lerp(.9,1.5,e),lerp(m[1],1.2,e)];
 const C1:V3=[m[0]+2.5+hold,1.8+.5*hold,m[1]-7.5-1.2*hold],T1:V3=[m[0]+.3,1.15+.5*hold,m[1]];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(4600+500*sm(0,CUEW(2,'curling'),t),3200-250*hold,u)*(1-.42*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),sn=CUEW(2,'second'),th=CUEW(2,'that'),u=swing3(t);
  stadium(s,c,v,t,u<.5?[0,1,3]:[0,1,2,3],{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(sn-.2,sn+.3,t)*(1-sm(SECS(2)-1.1,SECS(2)-.6,t)),lamps:sm(th-.2,th+.3,t)});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,trail:tau>SHOT&&tau<IN_NET+.5?1-sm(IN_NET,IN_NET+.5,tau):0});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  // "second nutmeg": two yellow ball badges pop over his head as the swing lands on him
  const nw=sm(sn-.05,sn+.35,t,easeOutBack)*(1-sm(SECS(2)-.9,SECS(2)-.5,t));
  if(nw>0){const m=posOf(SUA,tau),q=pr(c,[m[0],2.2,m[1]]);if(q){const r=kAt(c,[m[0],2.2,m[1]])*.17*nw;for(const k of[-1,1]){const x=q[0]+k*r*1.35,y=q[1]-r*.2;ball(s,x,y,r,k);}}}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(SUA,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: a low camera behind Luiz, looking back at Suárez
const tau4=(t:number)=>key(t,mono([[0,-1.1],[CUEW(3,'watch'),-.7],[CUEW(3,'legs'),-.1],[CUEW(3,'play'),.22],[CUEW(3,'sprint'),.55],[CUEW(3,'meet'),1.0],[SECS(3),1.45]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(SUA,tau),push=sm(CUEW(3,'watch')-.3,CUEW(3,'legs')+.2,t,easeInOutSine),back=sm(CUEW(3,'sprint')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[GATE_X+5.4+1.6*back-.8*push,1.05+.4*back,GATE_Z-1.9-1.2*back],T:V3=[lerp(GATE_X,m[0],.35)-.3,.7-.1*push+.1*back,lerp(GATE_Z,m[1],.3)-.4*back];
 return look(C,T,2350+550*push-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wa=CUEW(3,'watch'),lo=CUEW(3,'legs'),pl=CUEW(3,'play'),sp=CUEW(3,'sprint'),me=CUEW(3,'meet'),E=SECS(3);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  const L=posOf(LUIZ,tau);
  // "watch the defender's feet": a yellow ring round his feet
  groundRing(s,c,L[0],L[1],1,1.15,Y,sm(wa-.1,wa+.35,t,easeOutBack)*(1-sm(pl-.2,pl+.2,t)),7);
  groundArrow(s,c,ballPath(0,1.0),Y,sm(pl-.2,pl+.4,t,easeOut)*(1-sm(E-.9,E-.5,t)),81,.1);
  groundArrow(s,c,runPath(0,1.0),R,sm(sp-.25,sp+.45,t,easeOut)*(1-sm(E-.9,E-.5,t)),83);
  // "meet it": a red ring where boot and ball meet again
  groundRing(s,c,COLLECT[0],COLLECT[1],.65,.65,R,sm(me-.15,me+.3,t,easeOutBack)*(1-sm(E-.6,E-.3,t)),9);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({luiz})=>{
   gate(s,luiz,sm(lo-.15,lo+.3,t,easeOutBack)*(1-sm(sp+.1,sp+.5,t)));}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'suarez-signature',format:'11v11',title:"Suárez's cheeky nutmeg finish",theme:'If a defender opens their legs, play the ball through them, sprint round and meet it',
 ageNote:'Champions League quarter-final, Paris Saint-Germain 1–3 Barcelona, Parc des Princes, Paris, 15 April 2015 (79th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: grass bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.6*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
