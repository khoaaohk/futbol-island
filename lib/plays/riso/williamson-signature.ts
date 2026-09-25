/** Leah Williamson's signature — "stepping in to steal the pass" (lib/town/iconicPlays.json: kind "signature", template
 * interception_counter, side center, lesson "Watch the passer's hips and step in before the ball reaches the striker."). An iconic-play
 * riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer, rendered as a riso print.
 *
 * WHY THIS MATCH, AND THE HONEST FALLBACK: no written source I could read logs ONE specific Williamson interception with a minute (the
 * accounts of her two Euro finals credit the big moments to others — Walsh's pass and Toone's chip, Kelly's winner in 2022; Russo's header,
 * Hampton's saves and Kelly's penalty in 2025). So, per the brief's fallback, the film recreates the SIGNATURE ("this is how she defends")
 * inside the real match whose sources describe her defending best: England 1–1 Spain (England won 3–1 on penalties), the UEFA Women's
 * Euro 2025 final, St. Jakob-Park, Basel, Sunday 27 July 2025 (18:00 CEST, partly cloudy, 21 °C) — Williamson captained England, played the
 * full 120 minutes at centre-back against the best passing team in the world and lifted the trophy. The Guardian's ratings: "England's last
 * line of defence on occasions. Clean tackles. Didn't give away a foul in 90 minutes. Passing exemplary." The Guardian live blog (119'):
 * "Williamson plays excellently against Spanish team." Williamson to BBC Sport: "The girls put in a defensive performance for the ages."
 * The narration never claims a minute, a scoreline at that moment or a named Spanish passer: it says "This is how captain Leah Williamson
 * defends" and "Spain try to pass to their striker".
 *
 * SOURCES (read Sept 2026 as page source with a generic UA; cached under the session scratchpad films/src-cache/ and films/russo/):
 *  - Wikipedia (raw wikitext), "UEFA Women's Euro 2025 final": date, venue, kick-off 18:00, weather (partly cloudy, 21 °C), attendance
 *    34,203, line-ups with numbers and positions (England: Hampton 1; Bronze 2, Williamson 6 (c), Carter 16, Greenwood 5; Toone 10, Walsh 4,
 *    Stanway 8; Russo 23 … Spain: Cata Coll 13; Batlle 2, Paredes 4 (c), Aleixandri 14, Carmona 7; Bonmatí 6, Guijarro 12, Alexia 11;
 *    Esther González 9 …), the kit templates (England white shirts, blue shorts 0048CE, white socks; Spain all red); the match summary
 *    ("captain Leah Williamson sending the ball across the goalface").
 *  - UEFA.com match report "England v Spain" (penalties, Williamson's saved kick, line-ups); The FA's match report (Williamson "charged
 *    forward through the midfield and centred a low cross").
 *  - The Guardian, "England v Spain: Women's Euro 2025 final — player ratings" (Williamson 8: quote above).
 *  - The Guardian live blog of the final (119' entry quoted above; Williamson won the coin toss for the shoot-out end).
 *  - BBC Sport live text of the final (Williamson's quotes; 4-2-3-1 line-up graphic listing Bronze, Williamson, Carter, Greenwood).
 *  - (checked, not used) Wikipedia "UEFA Women's Euro 2022 final", BBC and Guardian reports + ratings of the 2022 final: no logged
 *    Williamson interception either ("Calm leadership at the back … put her body on the line"; a corner scrambled off the line).
 *  - lib/plays/riso/russo-final-2025.ts (the same match, read-only): St. Jakob-Park, kits and camera language.
 * CONFIRMED: Sunday 27 July 2025, St. Jakob-Park, Basel; England v Spain, the Euro final; Williamson (No. 6) captain and centre-back for the
 *  whole match; the kits (England white / blue / white; Spain all red); every number drawn (Williamson 6, Walsh 4, Stanway 8, Toone 10,
 *  Carter 16, Bronze 2, Greenwood 5; Spain Esther González 9, Guijarro 12, Bonmatí 6, Alexia 11); England won the Euro on penalties.
 *  Her reputation for clean defending and exemplary passing in that game (Guardian).
 * INFERRED / ILLUSTRATIVE (the fallback — this is a demonstration of her signature in that match, not one logged moment): the whole move
 *  (Bonmatí to Guijarro, Guijarro's pass into Esther González's feet, Williamson reading the hips, stepping in front and stealing it, the
 *  calm pass to Walsh); that Williamson was the RIGHT centre-back (the line-up order Bronze, Williamson, Carter, Greenwood); which foot
 *  (her right); every position, run, speed and timing; the captain's armband colour (yellow here); her hair colour and ponytail; the other
 *  players' spots; which end England defended on screen; the stadium, crowd, cameras and lenses; the evening light.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, panning with the ball: Spain build, Guijarro
 * aims a pass into Esther González's feet, Williamson steps in front of her and steals it, a calm pass to Walsh; ch2 = the slow-motion
 * replay from a LOW touchline camera: a sight line from her eyes to the passer's hips, the hips turn toward the striker (red arrow), she
 * moves early (a riso trail), her boot gets there first (a spark), the calm pass (a trail); ch3 = the lesson from a camera just behind her
 * shoulder (her point of view): the passer's hips ringed, the step-in arrow, the pass line, the ball stolen before it reaches the striker.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) so it frames from the 1.45:1 card window
 * down to square (a narrower window widens the lens a little). Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK
 * skeleton, `prev` secondary motion so the ponytails swing, motionSmear on the step-in and the passes); women's builds with ponytails;
 * small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward the
 * goal England defend, y up, +z toward the main-stand camera) — athlete.ts's own convention, so Williamson's RIGHT boot is her right.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras
 * on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,lunge,backpedal,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. Every cue starts with a plain word (no contraction / hyphen), and no cue's first
 * word appears between it and the previous cue. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/williamson-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/williamson-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final, live',text:'Basel, the 2025 Euro final: England against Spain. This is how captain Leah Williamson defends. Spain try to pass to their striker... Williamson steps in and steals it!',tail:3.4,
  cues:['Basel','England against','This is how','Spain try','their striker','Williamson steps','steals it']},
 {label:'Watch her read it',text:"Watch again, slowly. Leah watches the passer's hips. They turn toward the striker, so she moves early. Her boot gets there first, then a calm pass to Keira Walsh.",tail:1.9,
  cues:['Watch again','Leah watches','They turn','moves early','Her boot','calm pass']},
 {label:'Step in first',text:"England won that final on penalties. The secret? Watch the passer's hips, and step in before the ball reaches the striker!",tail:2.2,
  cues:['England won','The secret','Watch the','step in','before the ball','reaches the striker']},
];
import timingJson from '../../../public/plays/narration/williamson-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('williamson: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('williamson: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** unit facing (x,z) and right-hand (x,z) for a yaw */
const fwdOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const rightOf=(yaw:number):[number,number]=>[Math.sin(yaw),Math.cos(yaw)];
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line England defend is x = 0 (Spain attack +x), goal centre z = 0, +z = toward the main stand (the camera side). */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- St. Jakob-Park: a summer evening, a steep two-tier box of red seats under a roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal England defend, 2 the main stand (z>0), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+24*b,-40-28*b],
 (a,b)=>[7+26*b,1.3+22*b,lerp(-54,54,a)],
 (a,b)=>[lerp(12,-116,a),1.3+20*b,40+24*b],
 (a,b)=>[-111-26*b,1.3+22*b,lerp(54,-54,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=14,WALKS=[[.46],[.5],[.5],[.5]];
/** flags on the stand fronts: [stand, a, kind 0 = St George, 1 = Spain] */
const FLAGS:[number,number,number][]=[[0,.2,0],[0,.34,1],[0,.5,0],[0,.62,1],[0,.74,0],[0,.86,0],[1,.18,0],[1,.36,1],[1,.6,0],[2,.1,0],[2,.24,1],[3,.3,1],[3,.62,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a warm, partly cloudy July evening: pale blue sky, a yellow haze low down
 s.field(B,.15,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.2);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.82),[0,8.5,0]),add3(S(0,.82),[0,8.5,0])]));
  seg3(c,add3(S(0,.82),[0,8.3,0]),add3(S(1,.82),[0,8.3,0]),.4,edge);}
 s.knockout(planes);s.tone(R,planes,.55);s.tone(K,planes,.22);s.knockout(walk,.85);
 // the crowd: England white and red, Spain red and yellow, some navy; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.6?0:h<.84?1:h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(Y,inks[2],.95);s.fill(K,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.8);
 const fl=new Path2D(),cr=new Path2D(),es=new Path2D(),band=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.075),P(.43,.075)]));addPoly(cr,polyP(c,[P(0,.034),P(1,.034),P(1,.046),P(0,.046)]));}
  else{es.addPath(polyPath(q,true));addPoly(band,polyP(c,[P(0,.023),P(1,.023),P(1,.057),P(0,.057)]));}}
 s.knockout(fl);s.fill(R,cr,.95);s.knockout(es);s.fill(R,es,.95);s.fill(Y,band,.95);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.82),[0,7.6,0]),b=add3(S(u+.03,.82),[0,7.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.9,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, the goal England defend
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 s.knockout(ln);
 // the goal (only its frame and a light net: it sits behind the action)
 const net=new Path2D(),X=0,H=2.44;for(const P of[[[X,0,-3.66],[X,H,-3.66],[X+2,1.9,-3.66],[X+2,0,-3.66]],[[X,0,3.66],[X,H,3.66],[X+2,1.9,3.66],[X+2,0,3.66]],[[X,H,-3.66],[X,H,3.66],[X+2,1.9,3.66],[X+2,1.9,-3.66]],[[X+2,0,-3.66],[X+2,0,3.66],[X+2,1.9,3.66],[X+2,1.9,-3.66]]] as V3[][])addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const fo=new Path2D();seg3(c,[X,0,-3.66],[X,H,-3.66],.2,fo);seg3(c,[X,0,3.66],[X,H,3.66],.2,fo);seg3(c,[X,H,-3.7],[X,H,3.7],.2,fo);s.fill(K,fo,.9);
 const fr=new Path2D();seg3(c,[X,0,-3.66],[X,H,-3.66],.12,fr);seg3(c,[X,0,3.66],[X,H,3.66],.12,fr);seg3(c,[X,H,-3.72],[X,H,3.72],.12,fr);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[B,.95],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const spain=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:[Y,.95],numberInk:[Y,.95],hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const WIL_B=W_BUILD(1.71,.93);
const WIL_ST=england({number:6,hair:[K,.62],build:WIL_B,seed:6});
const ESTHER_B=W_BUILD(1.72,.93);
const ESTHER_ST=spain({number:9,build:ESTHER_B,seed:9});
const PATRI_B=W_BUILD(1.66,.92);
const PATRI_ST=spain({number:12,build:PATRI_B,seed:12});

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Williamson's boot on the ball)
/** Bonmatí carries it, then passes to Guijarro; Guijarro sets it and aims a firm ground pass at Esther González's feet */
const B_START:V3=[-42.6,.11,-3.4],B_PASS0:V3=[-36.1,.11,-8.6],G_BALL:V3=[-31.3,.11,-4.1],G_SET:V3=[-30.4,.11,-3.4],E_FEET:V3=[-19.4,.11,-3.1];
const T_BPASS=-3.2,T_GRCV=-2.35,T_GTOUCH=-1.95,T_PASS=-.8;
const PDIR:[number,number]=(()=>{const dx=E_FEET[0]-G_SET[0],dz=E_FEET[2]-G_SET[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
/** the pass: 12.6 m/s off the boot, slowing on the grass */
const PV0=12.6,PDEC=2.5;
const passAt=(dt:number):V3=>{const d=PV0*dt-.5*PDEC*dt*dt;return[G_SET[0]+PDIR[0]*d,.11,G_SET[2]+PDIR[1]*d];};
/** where her boot meets it: 0.8 s after the pass, about two metres in front of the striker */
const I:V3=passAt(-T_PASS);
/** she faces the passer as she steps across the ball's line */
const Y_W=yawTo(I[0],I[2],G_SET[0],G_SET[2]);
const FW=fwdOf(Y_W),RT=rightOf(Y_W);
/** the steal knocks it a stride ahead, to her front-left (toward Walsh) */
const B1:V3=[I[0]+FW[0]*1.15-RT[0]*.95,.11,I[2]+FW[1]*1.15-RT[1]*.95];
/** the calm pass to Walsh */
const W_RCV:V3=[-28.6,.11,3.9],W_CARRY:V3=[-32.6,.11,6.6];
const T_WPASS=1.45,T_WRCV=2.3;
const roll=(a:V3,b:V3,u:number):V3=>mix3(a,b,clamp(u)*(1.35-.35*clamp(u)));
function ballAt(tau:number):V3{
 if(tau<T_BPASS){const u=clamp((tau+9)/(9+T_BPASS));const p=mix3(B_START,B_PASS0,u);const nud=.18*Math.max(0,Math.sin(tau*6.4));return[p[0]+.6*nud,p[1],p[2]-.5*nud];}// Bonmatí's short carrying touches
 if(tau<T_GRCV)return roll(B_PASS0,G_BALL,(tau-T_BPASS)/(T_GRCV-T_BPASS));
 if(tau<T_GTOUCH)return mix3(G_BALL,G_SET,easeOut(clamp((tau-T_GRCV)/(T_GTOUCH-T_GRCV))));
 if(tau<T_PASS)return G_SET;
 if(tau<0)return passAt(tau-T_PASS);
 if(tau<.6)return mix3(I,B1,easeOut(tau/.6));
 if(tau<T_WPASS)return B1;
 if(tau<T_WRCV)return roll(B1,W_RCV,(tau-T_WPASS)/(T_WRCV-T_WPASS));
 return mix3(W_RCV,W_CARRY,sm(T_WRCV+.15,T_WRCV+2.6,tau,linear));
}
/** panel spin follows the distance rolled */
const spinAt=(tau:number)=>{const p=ballAt(tau);return(p[0]*.9+p[2]*.45)/.11;};

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a cumulative-distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-12,T_MAX=9,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
const TABS=new Map<Path,number[]>();
function tabOf(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
/** metres per full run cycle (two strides) */
const CYCLE_M=3.8;

// ---------------------------------------------------------------- Williamson: reads the hips, moves early, steps across, steals it, calm pass
const T_GO=-1.45,T_LUNGE=-.42,LUNGE_REACH=.6,T_REC=.42,SD_W=.8,W_POW=.4;
const T_WS0=T_WPASS-STRIKE_CONTACT*SD_W,T_WS1=T_WPASS+(1-STRIKE_CONTACT)*SD_W;
/** the lunge's full reach (.6) puts her RIGHT boot on the ball at I (solved once, FK) */
const RC:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH,{side:'r'}),WIL_B,{x:0,z:0,yaw:Y_W});return[I[0]-sk.rToe[0]+FW[0]*.04,I[2]-sk.rToe[2]+FW[1]*.04];})();
/** the pass to Walsh: pelvis so the RIGHT boot meets the ball at B1 */
const Y_P=yawTo(B1[0],B1[2],W_RCV[0],W_RCV[2]),FP=fwdOf(Y_P);
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:W_POW}),WIL_B,{x:0,z:0,yaw:Y_P});return[B1[0]-FP[0]*.1-sk.rToe[0],B1[2]-FP[1]*.1-sk.rToe[2]];})();
/** goal-side of the striker, a stride to her left, before the move */
const W0:[number,number]=[-16.1,-1.85];
const RS:[number,number]=[RC[0]-FW[0]*.75-RT[0]*.55,RC[1]-FW[1]*.75-RT[1]*.55];
const WIL_PATH:Path=[[-12,-14.2,-1.4],[-6,-15.2,-1.6],[-3,-15.8,-1.8],[T_GO,W0[0],W0[1]],[-.95,lerp(W0[0],RS[0],.5)+.1,lerp(W0[1],RS[1],.5)+.2],[T_LUNGE,RS[0],RS[1]],[-.02,RC[0],RC[1]],
 [T_REC,RC[0]+FW[0]*.3,RC[1]+FW[1]*.3],[T_WS0,PC[0]-FP[0]*.7,PC[1]-FP[1]*.7],[T_WPASS,PC[0],PC[1]],[T_WS1,PC[0]+FP[0]*.4,PC[1]+FP[1]*.4],[T_WS1+2.4,PC[0]+FP[0]*1.6-1.2,PC[1]+FP[1]*1.6-.4]];
/** a defender's ready stance: low, on the toes, arms loose, weight forward */
const READY_D=posed({lHipF:30,rHipF:24,lKnee:46,rKnee:40,lHipA:12,rHipA:12,lAnk:-6,rAnk:-6,lean:22,pitch:4,lShA:24,rShA:22,lShF:12,rShF:8,lElb:52,rElb:50,neckP:-8});
function wilAt(tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(WIL_PATH,tau),sp=speedAt(WIL_PATH,tau),ahead=pathAt(WIL_PATH,tau+.1),b=ballAt(tau);
 let p:Pose,yaw:number;
 if(tau<T_GO){
  // reading: set, goal-side of the striker, small shuffles, head on the passer
  const sh=blendPose(READY_D,backpedal(it*1.2),.25+.2*clamp(sp));p=sh;
  yaw=lerpAng(yawTo(x,z,b[0],b[2]),Y_W,.35);
 }else if(tau<T_LUNGE){
  // she moves early: from the set stance straight into a sprint
  const ph=distAt(tabOf(WIL_PATH),tau)/CYCLE_M+.3,run=runCycle(ph,{speed:clamp((sp-1)/4.5)});
  p=blendPose(READY_D,run,sm(T_GO,T_GO+.28,tau));
  yaw=lerpAng(yawTo(x,z,ahead[0],ahead[1]),Y_W,sm(-.9,T_LUNGE,tau)*.8);
 }else if(tau<T_REC){
  // the step across and the steal: lunge 0 → .6 (contact at τ 0) → 1
  const u=tau<0?LUNGE_REACH*sm(T_LUNGE,0,tau,linear):LUNGE_REACH+(1-LUNGE_REACH)*clamp(tau/T_REC);
  const ph=distAt(tabOf(WIL_PATH),T_LUNGE)/CYCLE_M+.3;
  p=blendPose(runCycle(ph,{speed:.8}),lunge(u,{side:'r'}),sm(T_LUNGE,T_LUNGE+.14,tau));yaw=Y_W;
 }else if(tau<T_WS0){
  // gathers herself and steps to the ball: calm, head up
  const ph=distAt(tabOf(WIL_PATH),tau)/CYCLE_M;
  p=blendPose(lunge(1,{side:'r'}),dribble(ph,{foot:'r',speed:.3}),sm(T_REC,T_REC+.3,tau));p.neckP-=12*DEG*sm(.7,T_WS0,tau);
  yaw=lerpAng(Y_W,Y_P,sm(T_REC,T_WS0,tau));
 }else if(tau<T_WS1+.2){
  const us=clamp(STRIKE_CONTACT+(tau-T_WPASS)/SD_W);const ph=distAt(tabOf(WIL_PATH),T_WS0)/CYCLE_M;
  p=blendPose(dribble(ph,{foot:'r',speed:.3}),strike(us,{power:W_POW}),sm(T_WS0,T_WS0+.1,tau));yaw=Y_P;
 }else{
  const ph=distAt(tabOf(WIL_PATH),tau)/CYCLE_M;
  p=blendPose(strike(1,{power:W_POW}),runCycle(ph,{speed:.2}),sm(T_WS1+.2,T_WS1+.6,tau));yaw=lerpAng(Y_P,yawTo(x,z,ahead[0],ahead[1]),sm(T_WS1+.3,T_WS1+.9,tau)*clamp(sp/1.5));
 }
 // her head: on the passer while she reads, on the ball as she steps in, then up toward Walsh
 const look=tau<T_PASS+.1?yawTo(x,z,G_SET[0],G_SET[2]):tau<T_REC?yawTo(x,z,b[0],b[2]):yawTo(x,z,W_RCV[0],W_RCV[2]);
 const bodyYaw=yaw+p.yaw;p.neckY=clamp(wrap(look-bodyYaw)*.8,-50*DEG,50*DEG)*(tau<T_WS0-.1||tau>T_WS1+.3?1:.3);
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- Esther González: checks toward the ball, asks for it, too late
const ESTHER_PATH:Path=[[-12,-15.4,-3.6],[-4,-16.4,-3.4],[-1.5,-16.9,-3.2],[-.4,-18.4,-3.1],[.25,-19.1,-3.05],[1,-19.2,-2.9],[2.2,-19.9,-1.9],[4.5,-22.2,.2]];
const ASK=posed({lHipF:18,rHipF:10,lKnee:26,rKnee:22,lean:10,pitch:3,lShA:40,rShA:36,lShF:36,rShF:30,lElb:30,rElb:34,lHand:1,rHand:1,neckP:6});
const ARMS_WIDE=posed({lHipF:8,rHipF:14,lKnee:18,rKnee:22,lean:2,pitch:0,lShA:64,rShA:60,lShF:30,rShF:24,lElb:40,rElb:38,lHand:1,rHand:1,neckP:-10});
function estherAt(tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(ESTHER_PATH,tau),sp=speedAt(ESTHER_PATH,tau),ahead=pathAt(ESTHER_PATH,tau+.1),b=ballAt(tau);
 const ph=distAt(tabOf(ESTHER_PATH),tau)/CYCLE_M+.6;
 let p=blendPose(blendPose(stand(),READY_D,.3),runCycle(ph,{speed:clamp((sp-1)/5)}),sm(.6,2,sp));
 // she checks back toward the passer, arms out asking for the ball…
 p=blendPose(p,ASK,sm(-1.1,-.6,tau)*(1-sm(-.05,.2,tau))*.55);
 // …and it never arrives: arms out wide, then she turns to chase
 if(tau>.1)p=blendPose(p,ARMS_WIDE,sm(.1,.5,tau)*(1-sm(1.4,2,tau))*.85);
 const toBall=yawTo(x,z,b[0],b[2]),heading=yawTo(x,z,ahead[0],ahead[1]);
 const yaw=tau<1.4?toBall:lerpAng(toBall,heading,sm(1.4,2.2,tau)*clamp(sp/2));
 const br=Math.sin(it*2+1);p.neckP+=br*2*DEG;
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- Patri Guijarro: receives, sets, the hips open toward the striker, the pass
const Y_G=yawTo(G_SET[0],G_SET[2],E_FEET[0],E_FEET[2]),FG=fwdOf(Y_G);
const SD_G=.85,G_POW=.55,T_GS0=T_PASS-STRIKE_CONTACT*SD_G;
const GC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:G_POW}),PATRI_B,{x:0,z:0,yaw:Y_G});return[G_SET[0]-FG[0]*.1-sk.rToe[0],G_SET[2]-FG[1]*.1-sk.rToe[2]];})();
const PATRI_PATH:Path=[[-12,-34.2,-1.2],[-6,-33.4,-2.2],[T_GRCV-.2,G_BALL[0]-.5,G_BALL[2]-.1],[T_GTOUCH+.1,G_BALL[0]-.25,G_BALL[2]+.25],[T_GS0,GC[0]-FG[0]*.55,GC[1]-FG[1]*.55],[T_PASS,GC[0],GC[1]],[T_PASS+.6,GC[0]+FG[0]*.5,GC[1]+FG[1]*.5],[3,GC[0]+FG[0]*3,GC[1]+FG[1]*3+.5],[6,GC[0]+FG[0]*4.2,GC[1]+FG[1]*4.2+1]];
const TRAP=posed({lHipF:10,rHipF:40,rKnee:40,rAnk:20,lKnee:24,lean:18,pitch:3,neckP:34,lShA:40,rShA:30,lElb:40,rElb:40});
function patriAt(tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(PATRI_PATH,tau),sp=speedAt(PATRI_PATH,tau),ahead=pathAt(PATRI_PATH,tau+.1),b=ballAt(tau);
 const ph=distAt(tabOf(PATRI_PATH),tau)/CYCLE_M+.1;
 let p=blendPose(blendPose(READY_D,stand(),.6),runCycle(ph,{speed:clamp((sp-1)/5)}),sm(.5,2,sp));
 let yaw=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,ahead[0],ahead[1]),sm(1.5,3,sp));
 // the first touch, then a couple of dribbling steps as she sets it
 const w=Math.sin(Math.PI*clamp((tau-T_GRCV+.25)/.5));if(w>0)p=blendPose(p,TRAP,w*.8);
 if(tau>T_GTOUCH-.1&&tau<T_GS0+.1)p=blendPose(p,dribble(ph,{foot:'r',speed:.3}),sm(T_GTOUCH-.1,T_GTOUCH+.1,tau)*.8);
 if(tau>T_GTOUCH-.2)yaw=lerpAng(yaw,Y_G,sm(T_GTOUCH-.2,T_GS0,tau));
 // the pass: the hips and shoulders open toward the striker (strike's backswing), the RIGHT boot through the ball
 const us=STRIKE_CONTACT+(tau-T_PASS)/SD_G;
 if(us>0&&us<1.25){const k=sm(0,.1,us)*(1-sm(1,1.25,us));p=blendPose(p,strike(clamp(us),{power:G_POW}),k);yaw=lerpAng(yaw,Y_G,k);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- everyone else (generic runners)
type Actor={name:string;st:AthleteStyle;path:Path;phase:number;/** a pass: [contact τ, foot, power, aim] */kick?:[number,'l'|'r',number,V3];/** a first touch at τ */touch?:number;eng:boolean};
const ACTORS:Actor[]=[
 {name:'Bonmati',eng:false,st:spain({number:6,build:W_BUILD(1.61,.9),seed:42}),path:[[-12,-44.4,-2.2],[-9,-43.4,-3.0],[T_BPASS,B_PASS0[0]-.55,B_PASS0[2]+.2],[-1.5,-34.2,-8.2],[1,-31.5,-7.4],[4,-29.5,-6]],phase:.9,kick:[T_BPASS,'r',.5,G_BALL]},
 {name:'Alexia',eng:false,st:spain({number:11,hair:[Y,.7],build:W_BUILD(1.73,.93),seed:44}),path:[[-12,-24.5,-12.5],[-4,-23.6,-11.4],[-.5,-22.6,-10.2],[1.5,-23.4,-9.4],[4,-25.5,-9.6]],phase:.35},
 {name:'Walsh',eng:true,st:england({number:4,hair:[Y,.8],build:W_BUILD(1.67),seed:4}),path:[[-12,-25.2,.4],[-4,-26,.8],[-.2,-26.4,1.4],[1.2,-27.4,2.8],[T_WRCV,W_RCV[0]-.4,W_RCV[2]+.05],[T_WRCV+.6,W_RCV[0]-1,W_RCV[2]+.6],[5,W_CARRY[0]-.6,W_CARRY[2]+.3]],phase:.5,touch:T_WRCV},
 {name:'Stanway',eng:true,st:england({number:8,hair:[Y,.85],build:W_BUILD(1.64,.95),seed:8}),path:[[-12,-28,-10],[-4,-28.8,-8.2],[-1,-29.2,-6.6],[1.5,-30.4,-5.4],[4,-31.4,-3.2]],phase:.1},
 {name:'Toone',eng:true,st:england({number:10,build:W_BUILD(1.65),seed:10}),path:[[-12,-34.5,5.5],[-4,-34,4.4],[0,-33.6,3.8],[3,-35.5,6],[6,-38,8]],phase:.7},
 {name:'Carter',eng:true,st:england({number:16,skin:SKIN_M,hair:K,build:W_BUILD(1.7,.95),seed:16}),path:[[-12,-14.6,5.8],[-4,-15.4,5.6],[-1,-16.2,5.2],[1.5,-16.9,4.4],[4,-18.2,3.6]],phase:.2},
 {name:'Bronze',eng:true,st:england({number:2,hair:K,build:W_BUILD(1.72,.95),seed:2}),path:[[-12,-16.8,-15.6],[-4,-17.4,-14.2],[-1,-17.8,-13],[2,-19.4,-12.4],[5,-22,-12]],phase:.6},
 {name:'Greenwood',eng:true,st:england({number:5,hair:[Y,.7],build:W_BUILD(1.65),seed:5}),path:[[-12,-18.2,16.4],[-4,-18.6,15.2],[0,-19.2,14.2],[3,-21.4,13.4]],phase:.45},
];
const SLUMP=posed({lHipF:22,rHipF:22,lKnee:30,rKnee:30,lean:26,pitch:5,neckP:26,lShA:14,rShA:14,lShF:20,rShF:20,lElb:20,rElb:20});
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(tabOf(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY_D,stand(),.45+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.touch!==undefined){const w=Math.sin(Math.PI*clamp((tau-a.touch+.25)/.5));if(w>0){p=blendPose(p,TRAP,w*.8);yaw=lerpAng(yaw,toBall,w);}}
 if(a.kick){const[t0,foot,power,aim]=a.kick,us=STRIKE_CONTACT+(tau-t0)/.8;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,yawTo(x,z,aim[0],aim[2]),w);}}
 // the steal: England lift (a teammate's joy, briefly), Spain's attackers sag
 if(tau>.3&&tau<2.4&&sp<1.4){if(!a.eng)p=blendPose(p,SLUMP,sm(.3,.8,tau)*(1-sm(1.8,2.4,tau))*.4);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?, captain?): athlete.ts figure; prev = the pose one drawn frame earlier
 * (secondary motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the step-in, the passes); captain = the
 * armband on the left upper arm (drawn only when that arm faces the camera and the figure is not a `low` speck). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false,captain=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const res=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(captain&&res.detail!=='low'){const sk=res.sk,ds=toCam(camera,sk.lSh)[2],dc=toCam(camera,sk.chest)[2];
  if(ds<dc-.04){const a=mix3(sk.lSh,sk.lEl,.28),b=mix3(sk.lSh,sk.lEl,.44),pa=pr(camera,a),pb=pr(camera,b);
   if(pa&&pb){const k=kAt(camera,a),dx=pb[0]-pa[0],dy=pb[1]-pa[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*k*.058,ny=dx/l*k*.058;
    const band=polyPath([[pa[0]+nx,pa[1]+ny],[pb[0]+nx,pb[1]+ny],[pb[0]-nx,pb[1]-ny],[pa[0]-nx,pa[1]-ny]],true);s.knockout(band);s.fill(Y,band,.95);s.stroke(K,band,Math.max(1.2,k*.008),.8);}}}
 return res;
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*.2,0,P[2]+Math.sin(a)*.16]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),.45);
 const moving=(tau>T_BPASS&&tau<T_GTOUCH)||(tau>T_PASS&&tau<.6)||(tau>T_WPASS&&tau<T_WRCV);
 if(o.lines&&o.prev!==undefined&&moving){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(220,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=20):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<3.2)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const star=(fn:(t:number,it:number)=>{pose:Pose;place:Place},st:AthleteStyle,smear:(t:number)=>boolean,captain=false)=>{
  const cur=fn(tp,e.it),d=visible(cur.place);if(d<0)return;
  items.push({d,draw:()=>{const prev=fn(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(st,d,true),cur.place,prev,!!e.smear&&smear(tp),captain);}});};
 star(wilAt,WIL_ST,t=>(t>T_GO+.2&&t<T_REC)||(t>T_WS0&&t<T_WS1),true);
 star(estherAt,ESTHER_ST,t=>t>-.9&&t<.3);
 star(patriAt,PATRI_ST,t=>t>T_GS0&&t<T_PASS+.4);
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev,false);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal England defend */
function panTarget(tau:number):V3{let x=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];z+=p[2];}return[x/5+3,.7,z/5+.5];}
const wxz=(tau:number):V3=>{const p=wilAt(tau,0).place;return[p.x??0,0,p.z??0];};
/** Williamson's face / Guijarro's pelvis and hip-facing (for the sight line and the hips arrow) */
const wilFace=(tau:number):V3=>{const w=wilAt(tau,0);return solve(w.pose,WIL_B,w.place).face;};
function patriHips(tau:number):{P:V3;dir:[number,number]}{const g=patriAt(tau,0),sk=solve(g.pose,PATRI_B,g.place),rx=sk.rHip[0]-sk.lHip[0],rz=sk.rHip[2]-sk.lHip[2],l=Math.hypot(rx,rz)||1;
 return{P:mix3(sk.lHip,sk.rHip,.5),dir:[rz/l,-rx/l]};}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** real time; the steal lands just after "Williamson steps" */
const tS1=()=>CUE(0,'Williamson steps')+.45;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-25,14,34];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:add3(panTarget(tau),[-2,0,0]),fov:17})],
  [CUE(0,'England against')-.2,1.6,()=>({P:P1,T:add3(panTarget(tau),[-1,0,0]),fov:14})],
  [CUE(0,'This is how')-.1,1.4,()=>({P:P1,T:mix3(panTarget(tau),add3(wxz(tau),[0,.8,0]),.55),fov:11.5})],
  [CUE(0,'Spain try')-.2,1,()=>({P:P1,T:mix3(panTarget(tau),[-23,.8,-2.6],.4),fov:12})],
  [tS1()-.6,.7,()=>({P:P1,T:mix3(panTarget(tau),add3(wxz(tau),[0,.8,0]),.5),fov:9})],
  [tS1()+T_REC+.3,1.4,()=>({P:P1,T:mix3(panTarget(tau),[-24.5,.8,.5],.4),fov:11})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+.05;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t)*(1-sm(tN+2.2,tN+3.2,t))*.6});
  ground(s,c);
  play(s,c,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
  // the steal: a small yellow burst at her boot
  const hit=sm(-.03,.06,tau)*(1-sm(.2,.45,tau));if(hit>0){const q=pr(c,I);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(34,kAt(c,I)*.9)*hit,{n:8,seed:17,width:Math.max(4,kAt(c,I)*.06)});}
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low touchline camera: the read, the hips, the early move, the steal
const tau2=(t:number)=>{const lw=CUE(1,'Leah watches'),th=CUE(1,'They turn'),me=CUE(1,'moves early'),hb=CUE(1,'Her boot'),cp=CUE(1,'calm pass');
 return key(t,mono([[0,-2.6],[lw,-2.1],[th,-1.75],[me,T_GO-.05],[hb-.15,-.1],[hb+.35,.15],[cp-.2,T_WS0-.1],[cp+.9,T_WPASS+.2],[SECS(1),T_WRCV+.1]]),linear);};
const E2:V3=[-22.5,1.5,11];
/** Williamson's run so far, traced on the grass (a riso replay trail under the players) */
function runTrail(s:Sheet,c:Cam,t0:number,t1:number,fade:number,wm=.3){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=20;i++){const q=pr(c,add3(wxz(lerp(t0,t1,i/20)),[0,.02,0]));if(q)pts.push(q);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,wxz(t1))*wm);s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0}),.9*fade);}
/** a dashed sight line (screen space) from a to b */
function sight(s:Sheet,c:Cam,a:V3,b:V3,u:number,ink:string,seed:number){const pa=pr(c,a),pb=pr(c,b);if(!pa||!pb||u<=.02)return;const pts:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*u;pts.push([lerp(pa[0],pb[0],k),lerp(pa[1],pb[1],k)]);}
 const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.55)/8,(i+.95)/8]);const w=Math.max(4,kAt(c,a)*.028);
 const r=ribbon(pts,w,{seed,taper:.1,pressure:.1,wobble:0,gaps});s.knockout(ribbon(pts,w*1.8,{seed,taper:.1,pressure:.1,wobble:0,gaps}),.5*u);s.fill(ink,r,.95);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring lying on the grass around a point (radius in metres) */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,q=pr(c,[P[0]+Math.cos(a)*rm*(.7+.3*u),.02,P[2]+Math.sin(a)*rm*(.7+.3*u)]);if(q)pts.push(q);}
 if(pts.length<8)return;const w=Math.max(4,kAt(c,P)*.07);const rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** the hips: a ring round the passer's pelvis and a red arrow where they point */
function hipsMark(s:Sheet,c:Cam,tau:number,ring:number,arrow:number){
 const h=patriHips(tau);
 if(ring>.02){const q=pr(c,h.P);if(q){const k=kAt(c,h.P),r=.36*k*(.75+.25*ring),pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.62]);}
  const rr=ribbon(pts,Math.max(4,k*.045),{close:true,seed:29,taper:0,wobble:1.1});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
 if(arrow>.02){const a=add3(h.P,[0,-.1,0]),L=2.8*arrow,b:V3=[a[0]+h.dir[0]*L,a[1]-.3*arrow,a[2]+h.dir[1]*L];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(6,kAt(c,a)*.07),R,.95);}
}
function cam2(t:number):Cam{
 const tau=tau2(t),w=add3(wxz(tau),[0,1,0]),g=patriHips(Math.min(tau,T_PASS+.3)).P;
 return plan(t,[
  [0,0,()=>({P:E2,T:[-23,1,-2.8],fov:32})],
  [CUE(1,'Leah watches')-.4,1.1,()=>({P:E2,T:add3(w,[-1.6,-.1,0]),fov:17})],
  [CUE(1,'They turn')-.35,1,()=>({P:add3(E2,[-3,0,0]),T:add3(g,[1,-.1,0]),fov:14})],
  [CUE(1,'moves early')-.25,1,()=>({P:add3(E2,[-1,0,-3]),T:mix3(w,I,.4),fov:22})],
  [CUE(1,'Her boot')-.4,.8,()=>({P:add3(E2,[-1,-.3,-4.5]),T:add3(I,[0,.45,.6]),fov:15})],
  [CUE(1,'calm pass')-.2,1.4,()=>({P:add3(E2,[-3,.1,-3]),T:mix3(w,W_RCV,.45),fov:26})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tL=CUE(1,'Leah watches'),tT=CUE(1,'They turn'),tM=CUE(1,'moves early'),tH=CUE(1,'Her boot'),tC=CUE(1,'calm pass');
  stadium(s,c,t,[0,3]);
  ground(s,c);
  runTrail(s,c,T_GO,Math.min(tau,0),sm(tM-.2,tM+.4,t)*(1-sm(tC,tC+.6,t)));
  // the calm pass: its path, traced as it rolls
  if(tau>T_WPASS){const pts=pathPts(c,T_WPASS,Math.min(tau,T_WRCV),14);if(pts.length>2){const w=Math.max(7,kAt(c,B1)*.1);s.knockout(ribbon(pts,w*1.5,{taper:.6,pressure:.2,wobble:0}),.45);s.fill(Y,ribbon(pts,w,{taper:.6,pressure:.2,wobble:0}),.9);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10,lines:true,prevT:tau2(t-.06)});
  // "Leah watches the passer's hips": her sight line to the hips; "They turn toward the striker": the hips ringed, a red arrow
  const lw=sm(tL-.1,tL+.4,t)*(1-sm(tM+.2,tM+.7,t));if(lw>.02)sight(s,c,wilFace(tp),patriHips(tp).P,lw,Y,13);
  hipsMark(s,c,tp,sm(tL,tL+.4,t,easeOutBack)*(1-sm(tM+.3,tM+.8,t)),sm(tT-.05,tT+.45,t,easeOut)*(1-sm(tM+.3,tM+.8,t)));
  // "Her boot gets there first": a spark where it meets the ball
  const hit=sm(tH-.05,tH+.2,t,easeOutBack)*(1-sm(tH+.7,tH+1.2,t));if(hit>.02){const q=pr(c,I);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,I)*.6)*hit,{n:9,seed:23,width:Math.max(5,kAt(c,I)*.05)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/q[2]*1.3),12);},
 still:7,
};

// ---------------------------------------------------------------- 3 · the lesson, from just behind her shoulder: hips → step in → before the ball reaches the striker
const tau3=(t:number)=>{const ew=CUE(2,'England won'),sc=CUE(2,'The secret'),wt=CUE(2,'Watch the'),si=CUE(2,'step in'),bb=CUE(2,'before the ball'),rs=CUE(2,'reaches the striker');
 return key(t,mono([[0,-2.9],[ew+.2,-2.6],[sc,-2.2],[wt,-1.75],[si-.1,T_GO],[bb,-.5],[rs+.2,0],[SECS(2),.35]]),linear);};
function cam3v(t:number):Cam{
 const tau=tau3(t),w=add3(wxz(tau),[0,0,0]);
 return plan(t,[
  [0,0,()=>({P:[-10.5,2.5,.8],T:[-24,1.2,-3.2],fov:36})],
  [CUE(2,'Watch the')-.3,1,()=>({P:[-11.2,2.3,.4],T:[-26,1.1,-3.3],fov:30})],
  [CUE(2,'step in')-.2,1.4,()=>({P:add3(w,[4.6,2.1,1.9]),T:add3(I,[-2,.6,-.2]),fov:34})],
  [CUE(2,'reaches the striker')-.3,1,()=>({P:add3(w,[4,1.9,2.2]),T:add3(I,[-.4,.4,0]),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tE=CUE(2,'England won'),tW=CUE(2,'Watch the'),tS=CUE(2,'step in'),tB=CUE(2,'before the ball'),tR=CUE(2,'reaches the striker');
  stadium(s,c,t,[3,0,2],{roar:sm(tE-.2,tE+.3,t)*(1-sm(tE+1.6,tE+2.4,t)),flash:sm(tE-.1,tE+.3,t)*(1-sm(tE+1.6,tE+2.4,t))});
  ground(s,c);
  // "England won that final on penalties": a paper-and-yellow burst over the far end
  const wn=sm(tE-.1,tE+.5,t)*(1-sm(tE+1.8,tE+2.4,t));if(wn>0){const q=pr(c,[-80,9,-20]);if(q)sparkBurst(s,Y,q[0],q[1],90+120*wn,{n:11,seed:9,g:easeOutBack(clamp(wn)),width:13});}
  // "step in": the ground arrow from where she read it to where her boot meets the ball
  const st=sm(tS-.1,tS+.5,t,easeOut);if(st>.02){const a=add3(wxz(T_GO),[0,.03,0]),m=add3(wxz(-.8),[0,.03,0]),e:V3=[I[0],.03,I[2]];
   arrow3(s,c,st<.5?[a,mix3(a,m,st*2)]:[a,m,mix3(m,e,(st-.5)*2)],Math.max(8,kAt(c,m)*.09),Y,.95);}
  // "before the ball": the pass line, dashed, from the passer to the striker's feet
  const bb=sm(tB-.1,tB+.4,t,easeOut);if(bb>.02)arrow3(s,c,[add3(G_SET,[0,.05,0]),mix3(G_SET,E_FEET,.5*bb),mix3(G_SET,E_FEET,.92*bb)],Math.max(6,kAt(c,I)*.06),R,.9,true);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:50});
  // "Watch the passer's hips": her sight line + the hips ring and arrow
  const wh=sm(tW-.1,tW+.4,t,easeOutBack)*(1-sm(tS+.3,tS+.8,t));if(wh>.02){sight(s,c,wilFace(tp),patriHips(tp).P,wh,Y,31);hipsMark(s,c,tp,wh,wh);}
  // "reaches the striker": the striker's feet ringed (red), the steal point ringed (yellow) + a spark as her boot gets there first
  const rs=sm(tR-.15,tR+.3,t,easeOutBack);if(rs>.02){const e=estherAt(tp,0).place;groundRing(s,c,[e.x??0,0,e.z??0],.7,rs,R,41);groundRing(s,c,I,.55,rs,Y,43);}
  const hit=sm(-.04,.06,tau)*(1-sm(.25,.35,tau));if(hit>.02){const q=pr(c,I);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,I)*.5)*hit,{n:9,seed:61,width:Math.max(5,kAt(c,I)*.04)});}
 },
 still:9,
};

const film:RisoStory={
 id:'williamson-signature',format:'11v11',title:'Williamson steals the pass',
 theme:'Intercepting: read the passer’s hips, move early and step in front of the striker before the ball reaches her — then a calm pass',
 ageNote:'How Leah Williamson defends, shown in England 1–1 Spain (England won 3–1 on penalties), UEFA Women’s Euro 2025 final, St. Jakob-Park, Basel, 27 July 2025. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a little steal — a red pass line runs toward a dot and a yellow boot-tick cuts across it; the ball pops out. Reduced motion: the still mark. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const line:Pt[]=[];for(let i=0;i<=8;i++){const k=i/8*Math.min(1,u*1.4);line.push([x-170+170*k,y+8*Math.sin(k*3)]);}
  if(line.length>2)s.fill(R,ribbon(line,9,{seed,taper:.6,pressure:.3,wobble:1,gaps:[[.2,.3],[.5,.6]]}),.9*fade);
  const cut=clamp(u*1.6-.6);if(cut>0){const a:Pt=[x+20,y+70],b:Pt=[lerp(a[0],x-10,cut),lerp(a[1],y-6,cut)];s.fill(Y,ribbon([a,[lerp(a[0],b[0],.5)+6,lerp(a[1],b[1],.5)],b],14,{seed:seed+1,taper:.8,pressure:.3,wobble:1}),.95*fade);}
  if(age>0&&age<.35&&u>.6)sparkBurst(s,Y,x,y,70,{n:8,seed,g:1-clamp(age/.35),width:9});
  const out=clamp(u*1.6-1);footballPanels(s,x-30*out,y-40*out*(1-out*.5),26,{rot:age*18+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
