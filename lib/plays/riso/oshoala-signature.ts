/** Asisat Oshoala's SIGNATURE film, "the quick finish in the box": her goal in the 2019 UEFA Women's Champions League final, Lyon 4–1
 * Barcelona, Saturday 18 May 2019 (kick-off 18:00 CEST), Groupama Arena (Ferencváros Stadion), Budapest — Barcelona's only goal, in the
 * 89th minute. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer.
 * A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the quick finish in the box"; lesson: "Stay alert in the box; the quickest
 * striker to react often scores"). This is the best-documented goal of her club career (a Champions League final, and the first goal by an
 * African player in a Women's Champions League final), and every report describes exactly that signature: she got onto Lieke Martens's
 * through ball first, took ONE touch round the onrushing keeper and finished at once ("Played through the middle by Martens, Oshoala took
 * one touch to take the ball round Bouhaddi before sliding home" — Guardian). The film shows the whole move live, then replays the reaction
 * and the one-touch finish; the narration claims no more than the reports.
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2019 UEFA Women's Champions League final" (raw wikitext: date, 18:00 CEST kick-off, Groupama Arena, 19,487, scorers and
 *    minutes, line-ups with shirt numbers and substitutions, the kit templates — Lyon all white (_ol1920H), Barcelona home _fcbarcelona1819H
 *    with blue shorts and socks)  https://en.wikipedia.org/wiki/2019_UEFA_Women%27s_Champions_League_final
 *  - The Guardian, Suzanne Wrack, "Hegerberg stars as Lyon crush Barcelona to win Women's Champions League" (18 May 2019): "As the clock
 *    ticked down, Barcelona got their consolation … Played through the middle by Martens, Oshoala took one touch to take the ball round
 *    Bouhaddi before sliding home"; photo caption "Asisat Oshoala watches her shot trickle in for a late consolation goal"
 *    https://www.theguardian.com/football/2019/may/18/lyon-barcelona-womens-champions-league-final-match-report
 *  - Reuters, Simon Evans, "Hegerberg hat-trick fires Lyon to fourth straight Champions League" (18 May 2019, web.archive.org copy):
 *    "substitute Asisat Oshoala pulled a goal back in the 89th minute after a clever through ball from Lieke Martens"
 *  - Goal.com, Samuel Ahmadu, "Barcelona's Asisat Oshoala makes history in Uefa Women's Champions League final" (18 May 2019,
 *    web.archive.org copy): "the first African to score in a Uefa Women's Champions League final"; 89th minute
 *  - Wikipedia, "Asisat Oshoala" (raw wikitext: height 1.73 m; first African to score in a Champions League final)
 * CONFIRMED: Lyon 4–1 Barcelona; Oshoala (Barcelona 20, a second-half substitute) scored in the 89th minute from Martens's (22) through ball
 * "through the middle"; she took one touch round Bouhaddi (Lyon keeper, 16) and slid the ball home, a slow finish that "trickled" in; the
 * first African to score in a Women's Champions League final. Lyon on the pitch late on (subs per Wikipedia): Bouhaddi 16, Bronze 2,
 * Renard 3, Mbock 29, Majri 7, Henry 6, Kumagai 5 (72'), Bacha 4 (82'); Barcelona: Martens 22, Alexia 11, Mariona 9, Andressa 10 (69').
 * Kits: Lyon all white; Barcelona in their 2018–19 home shirt (blue and garnet stripes, blue shorts and socks). NOTE: the sources disagree
 * on when she came on (Wikipedia 69', Goal.com 87'), so the narration does not say.
 * INFERRED (illustrative reconstruction): every position, run and timing in metres and seconds; the direction of play on screen (Barcelona
 * attack the goal at x = 0 in the second half — the end Lyon attacked in the first half in hegerberg-signature.ts); which way she went
 * round the keeper (drawn to her left, the keeper wrong-footed to her own left); the feet (Martens's pass, Oshoala's touch and finish all
 * drawn RIGHT-footed — the reports do not say); which defenders chased her (Renard and Mbock drawn a step behind); Bouhaddi's keeper kit
 * (drawn red with navy shorts); hair (Oshoala's braids drawn tied back) and builds; the celebrations (kept small at 4–1); Groupama Arena's
 * look (one green-seated, roofed bowl); the low evening sun (≈ 19:50 in May); TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME: Martens slips it through, Oshoala gets there
 * first, one touch round Bouhaddi and in; ch2 = the slow-motion replay from the camera BEHIND THE GOAL: she reacts first, the defender a step
 * behind (riso trails); ch3 = the slow-motion replay from a LOW camera by the far post: the one touch past the keeper, the slide home, the
 * ball trickling in; ch4 = the lesson from a low touchline angle: stay alert (a ring in the box), react first (rings on the pass and her first
 * step), one quick touch (arrow round the keeper), finish (arrow + target), the gap the defender can't close.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down
 * to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, one continuous silhouette, `prev`
 * secondary motion so the ponytails swing, motionSmear on the sprints and strikes); women's builds (1.60–1.78 m, slimmer bulk) with
 * ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward
 * the goal Lyon defend, y up, +z = the main-stand side), athlete.ts's own convention, so foot:'r' is the right foot.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,lunge,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. Every cue starts with a plain word (Kokoro splits contractions and hyphens).
 * LEAD: once scripts/plays/kokoro-narrate.py has written public/plays/narration/oshoala-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/oshoala-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Budapest, 2019, the Champions League final. Lyon lead Barcelona four-nil, one minute left. Martens slips it through. Asisat Oshoala gets there first, one touch round the keeper... and in!',tail:2.1,
  cues:['Budapest','Lyon lead','one minute','Martens slips','Asisat Oshoala','gets there','one touch','and in']},
 {label:'First to react',text:'Watch again. The pass is played, and Asisat reacts first. Her defender is a step behind.',tail:1.3,
  cues:['Watch again','pass is played','reacts first','defender is','step behind']},
 {label:'One touch',text:'One touch past Bouhaddi. She slides it home, and it trickles in! The first African to score in a Women\'s Champions League final.',tail:1.4,
  cues:['One touch','past Bouhaddi','slides it','trickles in','first African']},
 {label:'The secret',text:'The secret? Stay alert in the box. React first, one quick touch, and finish. The quickest striker to react often scores!',tail:1.9,
  cues:['The secret','Stay alert','React first','quick touch','and finish','quickest striker']},
];
import timingJson from '../../../public/plays/narration/oshoala-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('oshoala: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('oshoala: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
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

// ---------------------------------------------------------------- Groupama Arena, low evening sun (≈ 19:50): one green-seated, roofed bowl
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+16*b,-40-21*b],
 (a,b)=>[7+19*b,1.3+14*b,lerp(-54,54,a)],
 (a,b)=>[lerp(12,-116,a),1.3+16*b,40+21*b],
 (a,b)=>[-111-19*b,1.3+14*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=11;
/** flags on the stand fronts: [stand, a, kind 0 = Lyon (white, red + blue), 1 = Barça (blue + garnet stripes)] */
const FLAGS:[number,number,number][]=[[0,.3,1],[0,.44,0],[0,.58,1],[0,.72,0],[0,.86,0],[1,.22,0],[1,.46,1],[1,.7,1],[2,.14,0],[2,.3,1],[2,.56,1],[3,.3,1],[3,.66,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a late May evening sky (≈ 19:50, twenty minutes before sunset): pale blue under a warm, low haze
 s.field(B,.2,.45);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.38);s.tone(R,polyPath([[-1e4,hz[1]-160],[1e4,hz[1]-160],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.1);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);seg3(c,S(0,.5),S(1,.5),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.78),[0,6.5,0]),add3(S(0,.78),[0,6.5,0])]));
  seg3(c,add3(S(0,.78),[0,6.3,0]),add3(S(1,.78),[0,6.3,0]),.4,edge);}
 // green seats: yellow + blue overprint
 s.knockout(planes);s.tone(Y,planes,.7);s.tone(B,planes,.62);s.knockout(walk,.85);
 // the crowd: Lyon white, red and blue; Barça blue and garnet; Budapest neutrals
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.5)<.05)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.2)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.55?0:h<.75?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(B,inks[2],.9);s.fill(K,inks[3],.9);
 // the roof, its navy underside edge
 s.knockout(roof);s.tone(B,roof,.15);s.fill(K,edge,.85);
 const fl=new Path2D(),rd=new Path2D(),bl=new Path2D(),st=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(rd,polyP(c,[P(0,.03),P(1,.03),P(1,.045),P(0,.045)]));addPoly(bl,polyP(c,[P(0,.045),P(1,.045),P(1,.06),P(0,.06)]));}
  else{st.addPath(polyPath(q,true));for(let k=0;k<5;k+=2)addPoly(rd,polyP(c,[P(k/5,.005),P((k+1)/5,.005),P((k+1)/5,.075),P(k/5,.075)]));}}
 s.knockout(fl);s.knockout(st);s.fill(B,st,.95);s.fill(R,rd,.95);s.fill(B,bl,.95);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;bz?:number}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // the low sun: the far stand's shadow now reaches well onto the pitch
 const sh=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,-19],[-116,0,-24]]);if(sh.length>2)s.tone(K,polyPath(sh,true),.22);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goalNet(s,c,o.bulge??0,o.bz??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out where the shot went in (z ≈ bz) */
function goalNet(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bw=(z:number)=>bulge*Math.exp(-Math.pow((z-bz)/1.6,2)),back=(z:number)=>X+2+bw(z)*.7,top=(z:number)=>1.9+bw(z)*.2;
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),top(z0),z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),top(z1),z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),top(z),z],.022,mesh,.7);seg3(c,[back(z),top(z),z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const f=j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),top(zs[i])*f,zs[i]],[back(zs[i+1]),top(zs[i+1])*f,zs[i+1]],.022,mesh,.7);seg3(c,[X,H*f,z0],[back(z0),top(z0)*f,z0],.022,mesh,.7);seg3(c,[X,H*f,z1],[back(z1),top(z1)*f,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[R,.42],[Y,.4],[K,.12]],SKIN_D:InkFill[]=[[R,.5],[K,.4],[Y,.2]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Lyon all white (Wikipedia kit template, this match) with red and blue trim; Barcelona 2018–19 home: blue and garnet stripes, blue shorts and socks */
const lyon=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:[B,.95],hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const barca=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:[Y,.9],pattern:'stripes',patternInk:[R,.95],numberInk:[Y,.95],hairStyle:'ponytail',build:W_BUILD(1.67),...o});
const OSH_B=W_BUILD(1.73,.96);
/** Oshoala, Barcelona 20: 1.73 m (Wikipedia), braids tied back (drawn as a dark ponytail) */
const OSH_ST=barca({number:20,skin:SKIN_D,hair:K,hairStyle:'ponytail',build:OSH_B,seed:20});
const MARTENS_ST=barca({number:22,hair:[Y,.95],build:W_BUILD(1.7),seed:22});
const RENARD_ST=lyon({number:3,skin:SKIN_D,hair:K,build:W_BUILD(1.78,.95),seed:3});
const BOUHADDI_ST:AthleteStyle={shirt:[R,.92],shorts:[K,.9],socks:[R,.92],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:16,numberInk:'paper',build:W_BUILD(1.75,.95),seed:16};

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-10,T_MAX=9,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
const CYCLE_M=3.7;
const TABS=new Map<Path,number[]>();
function tabOf(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
const dirOf=(a:V3,b:V3):[number,number]=>{const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};

// ---------------------------------------------------------------- the goal on its own clock τ (seconds; τ = 0 is Oshoala's finish)
/** a kick: sd = seconds the whole strike() move spans (the touch is quicker than the pass or the finish); dir = where the ball goes */
type Kick={t:number;foot:'l'|'r';power:number;sd:number;dir:[number,number]};
type Role='hero'|'kicker'|'keeper'|'marker'|'lyon'|'barca';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;kicks?:Kick[];dive?:{t:number;side:'l'|'r';height:number};lunge?:{t:number;side:'l'|'r'}};
/** ball segments: carried at an actor's feet, or kicked from A to B (arc = extra height at the middle, m) */
type Seg={t0:number;t1:number;carry?:string;A?:V3;B?:V3;arc?:number;ease?:number};
/** the pelvis spot where a kicker's boot meets the ball at P, body turned to face dir (solved once through the skeleton) */
function kickSpot(P:V3,k:Kick,build:Build):[number,number]{
 const dir=k.dir,yaw=yawTo(0,0,dir[0],dir[1]);
 const sk=solve(strike(STRIKE_CONTACT,{foot:k.foot,power:k.power}),build,{x:0,z:0,yaw}),toe=k.foot==='r'?sk.rToe:sk.lToe;
 return[P[0]-dir[0]*.12-toe[0],P[2]-dir[1]*.12-toe[2]];
}
const kickYaw=(dir:[number,number])=>yawTo(0,0,dir[0],dir[1]);

/** THE GOAL (89'): Martens slips a through ball down the middle; Oshoala reacts first, takes ONE touch round the onrushing Bouhaddi (to her
 * left, inferred) and slides it home, the ball trickling over the line. τ: pass −3.3, touch −1.6, finish 0, over the line ≈ +1.05. */
const PASS_A:V3=[-31,.11,1.8],TOUCH:V3=[-11.6,.11,-.3],M:V3=[-6.5,.11,-3.1],G:V3=[0,.12,-.95];
const T_PASS=-3.3,T_TOUCH=-1.6,T_SHOT=1.05,T_NETD=.3;
const NET:V3=[.75,.11,-.78],REST:V3=[.95,.11,-.74];
const mK:Kick={t:T_PASS,foot:'r',power:.55,sd:.9,dir:dirOf(PASS_A,TOUCH)};
const tK:Kick={t:T_TOUCH,foot:'r',power:.12,sd:.6,dir:dirOf(TOUCH,M)};
const fK:Kick={t:0,foot:'r',power:.35,sd:.8,dir:dirOf(M,G)};
const PM=kickSpot(PASS_A,mK,MARTENS_ST.build!),PT=kickSpot(TOUCH,tK,OSH_B),PF=kickSpot(M,fK,OSH_B);
const HERO:Actor={name:'Oshoala',role:'hero',st:OSH_ST,kicks:[tK,fK],phase:.2,
 path:[[-10,-29,-5.2],[-6,-26.6,-4.4],[T_PASS-.5,-24.4,-3.4],[T_PASS,-23.4,-3],[T_PASS+.8,-18.6,-1.9],[T_TOUCH-.35,PT[0]-tK.dir[0]*2.1-.3,PT[1]-.3],[T_TOUCH,PT[0],PT[1]],
  [T_TOUCH+.55,-9.9,-2.3],[-.35,PF[0]-fK.dir[0]*1.5,PF[1]-fK.dir[1]*1.5-.15],[0,PF[0],PF[1]],[.5,PF[0]+1.3,PF[1]+.25],[1.3,-3.9,-2.5],[2.4,-3,-2.9],[4,-2.9,-3.4],[7,-4,-5]]};
const MARKER:Actor={name:'Renard',role:'marker',st:RENARD_ST,phase:.6,lunge:{t:-.15,side:'l'},
 path:[[-10,-26,-1.2],[T_PASS,-22.2,-1.6],[T_PASS+.8,-18.9,-.7],[T_TOUCH,-14.7,-1.1],[-.6,-11.6,-2.6],[0,-9.9,-3.3],[1.2,-8.6,-3.5],[3,-8.2,-3.4]]};
const KEEPER:Actor={name:'Bouhaddi',role:'keeper',st:BOUHADDI_ST,phase:0,dive:{t:T_TOUCH+.08,side:'l',height:0},
 path:[[-10,-2,.2],[T_PASS,-2.6,.3],[T_PASS+.9,-5.6,.1],[T_TOUCH-.25,-9.2,-.1],[T_TOUCH+.2,-10.1,.05],[4,-10.2,.1]]};
const ACTORS:Actor[]=[HERO,MARKER,KEEPER,
 {name:'Martens',role:'kicker',st:MARTENS_ST,kicks:[mK],phase:.4,path:[[-10,-47,6.5],[-6,-40,4.6],[T_PASS-.5,PM[0]-mK.dir[0]*2.6,PM[1]-mK.dir[1]*2.6+.3],[T_PASS,PM[0],PM[1]],[-1.5,-26,2.6],[0,-22.5,2.2],[3,-19,1.4]]},
 {name:'Mbock',role:'lyon',st:lyon({number:29,skin:SKIN_D,hair:K,build:W_BUILD(1.72,.95),seed:29}),phase:.3,path:[[-10,-25,-7.5],[T_PASS,-22,-6.4],[T_TOUCH,-16.4,-5.2],[0,-11.8,-5.4],[3,-10.2,-5.2]]},
 {name:'Bronze',role:'lyon',st:lyon({number:2,hair:[K,.85],build:W_BUILD(1.72,.95),seed:2}),phase:.1,path:[[-10,-27,-15],[T_PASS,-23.5,-12.5],[0,-15.5,-9.4],[3,-13.5,-8.6]]},
 {name:'Bacha',role:'lyon',st:lyon({number:4,hair:[K,.9],build:W_BUILD(1.62),seed:4}),phase:.7,path:[[-10,-27,13],[T_PASS,-23,10.5],[0,-16.5,7.4],[3,-15,6.6]]},
 {name:'Henry',role:'lyon',st:lyon({number:6,skin:SKIN_M,hair:K,build:W_BUILD(1.71),seed:6}),phase:.45,path:[[-10,-37,3.8],[T_PASS,-33.2,1.4],[0,-25,-.4],[3,-22,-.6]]},
 {name:'Kumagai',role:'lyon',st:lyon({number:5,hair:K,build:W_BUILD(1.71),seed:5}),phase:.85,path:[[-10,-33,10],[T_PASS,-29,7.4],[0,-21.5,4.6],[3,-19.5,3.8]]},
 {name:'Alexia',role:'barca',st:barca({number:11,hair:[R,.55],build:W_BUILD(1.7),seed:11}),phase:.15,path:[[-10,-44,-9],[T_PASS,-35,-7.4],[0,-24.5,-5.6],[3,-19,-4.4]]},
 {name:'Mariona',role:'barca',st:barca({number:9,hair:K,build:W_BUILD(1.6),seed:9}),phase:.55,path:[[-10,-41,15],[T_PASS,-31,12],[0,-21,8.6],[3,-15.5,6]]},
 {name:'Andressa',role:'barca',st:barca({number:10,skin:SKIN_M,hair:K,build:W_BUILD(1.64),seed:10}),phase:.9,path:[[-10,-38,-13.5],[T_PASS,-30,-12.6],[0,-19.5,-11],[3,-14.5,-8.4]]},
];
const SEGS:Seg[]=[{t0:-10,t1:T_PASS,carry:'Martens'},{t0:T_PASS,t1:T_TOUCH,A:PASS_A,B:TOUCH,arc:.02,ease:.35},{t0:T_TOUCH,t1:0,A:TOUCH,B:M,arc:0,ease:.5}];
const byName=(n:string)=>ACTORS.find(a=>a.name===n)!;

// ---------------------------------------------------------------- the ball on the goal's clock
/** the finish: a side-foot roll that slows as it goes (it "trickles in") */
function shotAt(u:number):V3{const e=1-Math.pow(1-clamp(u),1.55);return[lerp(M[0],G[0],e),.11+.01*Math.sin(Math.PI*e),lerp(M[2],G[2],e)];}
function carryAt(who:string,tau:number):V3{const a=byName(who);const[x,z]=pathAt(a.path,tau),ahead=pathAt(a.path,tau+.15);
 const d=Math.hypot(ahead[0]-x,ahead[1]-z)||1,dx=(ahead[0]-x)/d,dz=(ahead[1]-z)/d,touch=.45+.35*Math.abs(Math.sin(tau*4.4));return[x+dx*touch,.11,z+dz*touch];}
function ballAt(tau:number):V3{
 if(tau<0){for(let i=0;i<SEGS.length;i++){const s=SEGS[i];if(tau>=s.t1&&i<SEGS.length-1)continue;
  if(s.carry){const c=carryAt(s.carry,tau),nx=SEGS[i+1];if(nx?.A){const w=sm(s.t1-.45,s.t1,tau);return mix3(c,nx.A,w);}return c;}
  const u=clamp((tau-s.t0)/(s.t1-s.t0)),e=s.ease??.25,v=u*(1+e-e*u);const p=mix3(s.A!,s.B!,v);p[1]+=(s.arc??0)*Math.sin(Math.PI*v);return p;}
  return M;}
 if(tau<T_SHOT)return shotAt(tau/T_SHOT);
 if(tau<T_SHOT+T_NETD)return mix3(shotAt(1),NET,easeOut((tau-T_SHOT)/T_NETD));
 return mix3(NET,REST,easeOut(clamp((tau-T_SHOT-T_NETD)/.8)));
}
const spinAt=(tau:number)=>TAU*(1.5*tau+2.2*clamp((tau+3.3)/1.7)+1.5*clamp((tau+1.6)/1.6)+1.2*clamp(tau/1.05));
/** it only just reaches the net: a small, soft ripple */
const bulgeAt=(tau:number)=>{const tn=T_SHOT+T_NETD;return tau<tn-.05?0:.28*Math.exp(-(tau-tn+.05)*2.2)*(1+.3*Math.sin((tau-tn)*12));};
const T_GOAL=T_SHOT+.02;// the ball crosses the line

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** the striker on her toes: low, weight forward, eyes on the passer */
const ALERT=posed({lHipF:26,rHipF:12,lKnee:36,rKnee:26,lean:18,pitch:5,neckP:-8,lShA:22,rShA:20,lShF:14,rShF:-8,lElb:58,rElb:50});
/** watching it roll in: upright, arms slightly out, head following the ball */
const WATCH=posed({lHipF:8,rHipF:14,lKnee:14,rKnee:20,lean:4,pitch:0,neckP:6,lShA:30,rShA:30,lShF:8,rShF:8,lElb:36,rElb:36});
const kickPose=(k:Kick,u:number)=>strike(u,{foot:k.foot,power:k.power});
/** one actor's pose + place at τ (it = idle clock). Barcelona celebrate a little after the goal (it is 4–1); Lyon keep their shape. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau),tg=T_GOAL;
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(tabOf(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 const run=runCycle(ph,{speed:clamp((sp-1)/5.5)});
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),run,sm(.5,2,sp));
 const lyonSide=a.st.shirt==='paper';
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);yaw=yawTo(x,z,ball[0],ball[2]);
  if(sp>1.5)kp=blendPose(kp,run,sm(1.5,3,sp)*.7);
  if(a.dive){const D=.8,t0=a.dive.t-.55*D;if(tau>t0){const u=clamp((tau-t0)/D),w=sm(t0,t0+.1,tau);kp=blendPose(kp,keeperDive(u,{side:a.dive.side,height:a.dive.height}),w);yaw=lerpAng(yaw,yawTo(x,z,TOUCH[0]-3,TOUCH[2]),w);}}
  return{pose:kp,place:{x,z,yaw}};
 }
 if(a.role==='hero'||a.role==='kicker'){
  const ks=a.kicks!;
  if(a.role==='hero'){p=blendPose(ALERT,run,sm(.6,2.2,sp));if(tau<T_PASS&&sp<2.4)yaw=lerpAng(yaw,toBall,.7);}
  ks.forEach((k,j)=>{const c=STRIKE_CONTACT,u=c+(tau-k.t)/k.sd,last=j===ks.length-1&&a.role==='hero';
   if(u>0&&u<1.15){const w=sm(0,.14,u)*(last?1:1-sm(.8,1.1,u));p=blendPose(p,kickPose(k,clamp(u)),w);yaw=lerpAng(yaw,kickYaw(k.dir),Math.max(w,sm(k.t-.45,k.t-.2,tau)*(1-sm(k.t+.35,k.t+.7,tau))));}});
  if(a.role==='hero'){const k=fK,end=k.t+(1-STRIKE_CONTACT)*k.sd;
   if(tau>end){const w=sm(end,end+.45,tau);p=blendPose(kickPose(k,1),blendPose(run,WATCH,sm(1.2,.3,sp)),w);yaw=lerpAng(yaw,lerpAng(heading,toBall,sm(1.4,.4,sp)),w);
    if(tau>tg+.5)p=blendPose(p,celebrate(it*.8,{kind:'arms'}),sm(tg+.5,tg+1.1,tau)*.7);}}
  if(a.role==='kicker'&&tau>tg+.3&&sp<1.4)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(tg+.3,tg+.8,tau)*.8);
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.role==='marker'&&a.lunge){const u=clamp((tau-a.lunge.t+.45)/.8);if(u>0&&tau<1.4){const w=sm(0,.15,u)*(1-sm(1.1,1.4,tau));p=blendPose(p,lunge(u,{side:a.lunge.side}),w);yaw=lerpAng(yaw,yawTo(x,z,M[0],M[2]),w);}}
 if(sp<1.4)yaw=lerpAng(yaw,toBall,.8);
 if(tau>tg+.2&&sp<1.2){if(!lyonSide)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(tg+.2,tg+.7,tau)*.75);else p=blendPose(p,SLUMP,sm(tg+.2,tg+.9,tau)*.3);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the sprint, the touch, the finish). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 if(o.lines&&o.prev!==undefined){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*1.2)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(240,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(p:Place,h=1.8)=>{const q=toCam(c,[p.x??0,.9,p.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  const big=a.role==='hero'||a.role==='kicker'||a.role==='keeper'||a.role==='marker';
  const fast=a.role==='hero'?tp>T_PASS&&tp<.8:a.role==='kicker'?Math.abs(tp-T_PASS)<.5:a.role==='keeper'?tp>T_TOUCH-.6&&tp<T_TOUCH+.6:a.role==='marker'&&tp>-1&&tp<.8;
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,big),cur.place,prev,!!e.smear&&fast);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch) */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.12);x+=p[0];y+=p[1];z+=p[2];}return[x/5,Math.min(1.6,y/5)*.5+.7,z/5];}
const posOf=(a:Actor,tau:number):V3=>{const[x,z]=pathAt(a.path,tau);return[x,0,z];};
/** a ring on the grass (radius rm metres) around a ground point */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number,cov=.95,dashed=false){if(u<=.02)return;const pts:Pt[]=[];const r=rm*(.75+.25*u);
 for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[P[0]+Math.cos(a)*r,.02,P[2]+Math.sin(a)*r]);if(q)pts.push(q);}if(pts.length<20)return;
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<10;i++)gaps.push([(i+.55)/10,(i+.95)/10]);
 const w=Math.max(4,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2,gaps});s.knockout(rr,.9*u);s.fill(ink,rr,cov*u);}
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** a runner's route on the grass between two τs (a riso replay trail), ink + width in metres */
function trail(s:Sheet,c:Cam,a:Actor,t0:number,t1:number,fade:number,ink:string,wm=.3,dashed=false){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=20;i++){const[x,z]=pathAt(a.path,lerp(t0,t1,i/20)),q=pr(c,[x,.02,z]);if(q)pts.push(q);}
 if(pts.length<3)return;const[x1,z1]=pathAt(a.path,t1),w=Math.max(8,kAt(c,[x1,0,z1])*wm),gaps:[number,number][]=[];if(dashed)for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);
 s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0,gaps}),.45*fade);s.fill(ink,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0,gaps}),.9*fade);}
/** the ball's route between two τs, a dashed line in one ink */
function ballTrail(s:Sheet,c:Cam,t0:number,tau:number,fade:number,ink:string,wm=.1){
 if(tau<=t0+.05||fade<=.02)return;const pts=pathPts(c,t0,tau,16);if(pts.length<3)return;const w=Math.max(6,kAt(c,ballAt(tau))*wm);
 const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.6)/8,(i+.95)/8]);s.knockout(ribbon(pts,w*1.5,{taper:.4,pressure:.2,wobble:0,gaps}),.4*fade);s.fill(ink,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0,gaps}),.9*fade);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** the gap between the striker and her defender: a red bar on the grass that grows with u */
function gapBar(s:Sheet,c:Cam,tp:number,u:number){if(u<=.02)return;const a=posOf(HERO,tp),b=posOf(MARKER,tp),qa=pr(c,[a[0],.05,a[2]]),qb=pr(c,[b[0],.05,b[2]]);if(!qa||!qb)return;
 const w=Math.max(6,kAt(c,a)*.06),br=ribbon([qb,[lerp(qb[0],qa[0],u),lerp(qb[1],qa[1],u)]],w,{taper:0,wobble:.5});s.knockout(br,.9*u);s.fill(R,br,.95*u);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
const P1:V3=[-24,17,72];
/** τ = 0 (the finish) is placed so the ball crosses the line on "and in" */
const tS1=()=>CUE(0,'and in')+.1-T_GOAL;
const tau1=(t:number)=>Math.max(-9.9,t-tS1());
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:add3(panTarget(tau),[3,0,-2]),fov:15})],
  [tS1()+T_PASS-.4,1.2,()=>({P:P1,T:add3(panTarget(tau),[3.5,0,-2]),fov:12.5})],
  [tS1()+T_TOUCH-.3,1,()=>({P:P1,T:[-7.5,1,-1.6],fov:10.5})],
  [tS1()+T_GOAL+.7,1.6,()=>({P:P1,T:add3(posOf(HERO,tau),[0,1,0]),fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_GOAL;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t)*.7,flash:sm(tN,tN+.25,t)*(1-sm(tN+2,tN+3,t))*.7});
  ground(s,c,{bulge:bulgeAt(tau),bz:G[2]});
  play(s,c,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow-motion replay from BEHIND THE GOAL: she reacts first, the defender a step behind
const tau2=(t:number)=>key(t,mono([[0,-5.2],[CUE(1,'pass is played'),T_PASS-.25],[CUE(1,'reacts first'),T_PASS+.35],[CUE(1,'step behind'),T_TOUCH-.55],[SECS(1),T_TOUCH-.15]]),linear);
const E2:V3=[12,5.6,-8];
function cam2v(t:number):Cam{
 const tau=tau2(t),h=add3(posOf(HERO,tau),[0,1,0]);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(h,add3(ballAt(tau),[0,.6,0]),.45),fov:13})],
  [CUE(1,'pass is played')-.2,1.1,()=>({P:E2,T:mix3(h,add3(ballAt(tau),[0,.6,0]),.3),fov:11})],
  [CUE(1,'reacts first')-.1,1,()=>({P:add3(E2,[-.5,-.3,.4]),T:mix3(h,posOf(MARKER,tau),.3),fov:7.5})],
  [CUE(1,'step behind')-.2,1,()=>({P:add3(E2,[-.8,-.4,.6]),T:add3(mix3(h,posOf(MARKER,tau),.4),[0,.1,0]),fov:9})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2v(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tP=CUE(1,'pass is played'),tR=CUE(1,'reacts first'),tB=CUE(1,'step behind');
  stadium(s,c,t,[0,2,3]);
  ground(s,c);
  // the pass (red, dashed) traced as it travels; her run (yellow) from the moment it is played
  ballTrail(s,c,T_PASS,Math.min(tau,T_TOUCH),sm(tP-.1,tP+.4,t),R,.12);
  trail(s,c,HERO,T_PASS,Math.min(tau,T_TOUCH),sm(tR-.3,tR+.2,t),Y,.3);
  // "a step behind": the defender's route, dashed red, and the gap between them
  trail(s,c,MARKER,T_PASS,Math.min(tau,T_TOUCH),sm(tB-.3,tB+.2,t),R,.2,true);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:60});
  gapBar(s,c,tp,sm(tB-.1,tB+.5,t));
  // "reacts first": a spark on her first quick step as the ball leaves Martens's boot
  const k=sm(tR-.15,tR,t)*(1-sm(tR+.2,tR+.5,t));if(k>0){const[x,z]=pathAt(HERO.path,tau);const q=pr(c,[x,.3,z]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,[x,0,z])*.7)*k,{n:8,seed:21,width:6});}
 },
 aperture(t){const c=cam2v(t),q=pr(c,add3(posOf(HERO,tau2(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:3.5,
};

// ---------------------------------------------------------------- 3 · slow-motion replay from a LOW camera by the far post: one touch, the slide home, it trickles in
const tau3=(t:number)=>key(t,mono([[0,T_TOUCH-.75],[CUE(2,'One touch')+.15,T_TOUCH-.1],[CUE(2,'past Bouhaddi')+.3,T_TOUCH+.45],[CUE(2,'slides it')+.1,-.05],[CUE(2,'trickles in'),T_SHOT*.8],[CUE(2,'first African'),T_GOAL+.35],[SECS(2),T_GOAL+1.6]]),linear);
const E3:V3=[-.8,1.35,-12.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),h=add3(posOf(HERO,tau),[0,.95,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(h,TOUCH,.4),fov:17})],
  [CUE(2,'past Bouhaddi')-.2,1,()=>({P:add3(E3,[-.6,0,.4]),T:mix3(h,posOf(KEEPER,tau),.35),fov:19})],
  [CUE(2,'slides it')-.3,1,()=>({P:add3(E3,[-.6,-.1,.8]),T:mix3(h,ballAt(tau),.5),fov:22})],
  [CUE(2,'trickles in')-.4,.9,()=>({P:add3(E3,[-.2,-.15,1]),T:mix3([-.3,.3,-1],h,.3),fov:22})],
  [CUE(2,'first African')-.2,1.2,()=>({P:add3(E3,[-.4,-.05,1.2]),T:h,fov:14})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tO=CUE(2,'One touch'),tS=CUE(2,'slides it'),tT=CUE(2,'trickles in'),tA=CUE(2,'first African');
  stadium(s,c,t,[1,2,3],{roar:sm(tT,tT+.5,t)*.6,flash:sm(tA-.2,tA+.3,t)*(1-sm(SECS(2)-.8,SECS(2),t))});
  ground(s,c,{bulge:bulgeAt(tau),bz:G[2]});
  // the one touch round the keeper (yellow, dashed) and the finish (red, dashed), traced as the ball rolls
  ballTrail(s,c,T_TOUCH,Math.min(tau,0),sm(tO,tO+.4,t)*(1-sm(tA,tA+.6,t)*.6),Y,.12);
  ballTrail(s,c,0,Math.min(tau,T_SHOT),sm(tS,tS+.3,t)*(1-sm(tA,tA+.6,t)*.6),R,.12);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06),hero:'mid',only:50});
  // the touch: a spark on her boot as it nicks past the keeper
  const k=sm(T_TOUCH-.06,T_TOUCH,tau)*(1-sm(T_TOUCH+.15,T_TOUCH+.4,tau));if(k>0){const q=pr(c,TOUCH);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,TOUCH)*.5)*k,{n:8,seed:23,width:6});}
  // "trickles in": a ring on the line where it crosses
  groundRing(s,c,[0,0,G[2]],.7,sm(tT-.1,tT+.4,t,easeOutBack)*(1-sm(tA+.4,tA+1,t)),Y,31);
  // "the first African": a yellow star-burst around her
  const fa=sm(tA-.1,tA+.4,t,easeOutBack);if(fa>.02){const h=add3(posOf(HERO,tp),[0,1.05,0]);ring3(s,c,h,1.15,fa,Y,41);
   const q=pr(c,h);if(q&&t<tA+.6)sparkBurst(s,Y,q[0],q[1],kAt(c,h)*1.9*fa,{n:10,seed:43,width:8,g:1-sm(tA,tA+.6,t)});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(posOf(HERO,tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: stay alert → react first → one quick touch → finish → the quickest to react
const tau4=(t:number)=>{const a=CUE(3,'Stay alert'),r=CUE(3,'React first'),q=CUE(3,'quick touch'),f=CUE(3,'and finish'),k=CUE(3,'quickest striker');
 return key(t,mono([[0,-4.4],[a+.6,-3.8],[r,T_PASS-.1],[r+.9,T_PASS+.6],[q,T_TOUCH-.3],[q+.6,T_TOUCH+.35],[f,-.15],[f+.8,.55],[k+.2,T_GOAL],[SECS(3),T_GOAL+.9]]),linear);};
const E4:V3=[-11.5,2.1,-12.5];
function cam4v(t:number):Cam{
 const tau=tau4(t),h=add3(posOf(HERO,tau),[0,.9,0]);
 return plan(t,[
  [0,0,()=>({P:E4,T:mix3(h,[-14,1,-1],.4),fov:30})],
  [CUE(3,'React first')-.2,1,()=>({P:add3(E4,[-3.5,-.2,.2]),T:mix3(h,[-18,.8,0],.3),fov:28})],
  [CUE(3,'quick touch')-.3,1,()=>({P:add3(E4,[1.5,-.3,1]),T:mix3(h,TOUCH,.4),fov:24})],
  [CUE(3,'and finish')-.2,1,()=>({P:add3(E4,[4,-.3,1.2]),T:mix3(h,[-2,.5,-1.5],.5),fov:26})],
  [CUE(3,'quickest striker')-.3,1,()=>({P:add3(E4,[1.5,.3,-3.5]),T:mix3(h,posOf(MARKER,tau),.5),fov:30})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tA=CUE(3,'Stay alert'),tR=CUE(3,'React first'),tQ=CUE(3,'quick touch'),tF=CUE(3,'and finish'),tK=CUE(3,'quickest striker');
  stadium(s,c,t,[1,2,3]);
  ground(s,c,{bulge:bulgeAt(tau),bz:G[2]});
  // 1 · stay alert in the box: a dashed yellow ring rides with her
  const al=sm(tA-.1,tA+.4,t,easeOutBack)*(1-sm(tR+.5,tR+1,t));if(al>.02)groundRing(s,c,posOf(HERO,tp),1.6,al,Y,11,.95,true);
  // 3 · one quick touch: a yellow arrow on the grass round the keeper
  const qt=sm(tQ-.1,tQ+.5,t,easeOut)*(1-sm(tK+.2,tK+.8,t)*.5);
  if(qt>.02){const mid:V3=[-9.4,.03,-2];arrow3(s,c,[[TOUCH[0],.03,TOUCH[2]],mix3([TOUCH[0],.03,TOUCH[2]],mid,Math.min(1,qt*2)),mix3(mid,[M[0],.03,M[2]],Math.max(0,qt*2-1))],Math.max(8,kAt(c,mid)*.14),Y,.95);}
  // 4 · finish: a red arrow to a target ring inside the post
  const fn=sm(tF-.1,tF+.5,t,easeOut),fo=1-sm(tK,tK+.5,t)*.6;if(fn>.02){arrow3(s,c,[[M[0],.04,M[2]],mix3([M[0],.04,M[2]],[G[0],.04,G[2]],fn)],Math.max(7,kAt(c,M)*.12),R,.95*fo);groundRing(s,c,[G[0],0,G[2]],.6,fn,R,33);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:46});
  // 2 · react first: a red ring on the ball as the pass is struck, a yellow ring on her first step; the defender's late route
  const rf=sm(tR-.1,tR+.35,t,easeOutBack)*(1-sm(tQ-.2,tQ+.3,t));
  if(rf>.02){const cur=actorAt(HERO,tp,tt),sk=solve(cur.pose,OSH_B,cur.place);ring3(s,c,sk.rAn,.3,rf,Y,41);ring3(s,c,ballAt(Math.min(tp,T_TOUCH)),.35,rf,R,43);}
  // 5 · the quickest to react: the defender's lag trail and the gap she can't close
  const qs=sm(tK-.1,tK+.4,t);if(qs>.02){trail(s,c,MARKER,T_PASS,Math.min(tau,.2),qs,R,.2,true);gapBar(s,c,tp,qs);}
 },
 still:8,
};

const film:RisoStory={
 id:'oshoala-signature',format:'11v11',title:"Oshoala's quick finish",
 theme:'The quick finish in the box: stay alert, react first, one quick touch past the keeper, and finish',
 ageNote:'Lyon 4–1 Barcelona, UEFA Women’s Champions League final, Groupama Arena, Budapest, 18 May 2019 — Oshoala’s 89th-minute goal, the first by an African player in a Women’s Champions League final. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little one-touch-round — a yellow touch curls past a navy ring (the keeper) and a red roll finishes it. Reduced motion: the still line. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const tch:Pt[]=[],fin:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10;const a=Math.min(1,u*2)*k,b=Math.max(0,u*2-1)*k;tch.push([x-130+80*a,y+10-60*Math.sin(Math.PI*a)]);fin.push([x-50+130*b,y+10-10*b]);}
  const kp:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;kp.push([x-90+Math.cos(a)*26,y+30+Math.sin(a)*26]);}
  s.fill(K,ribbon(kp,6,{close:true,seed,taper:0,wobble:1.2}),.8*fade);
  s.fill(Y,ribbon(tch,13,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  if(u>.5){const gaps:[number,number][]=[];for(let i=0;i<5;i++)gaps.push([(i+.6)/5,(i+.95)/5]);s.fill(R,ribbon(fin,9,{seed:seed+1,taper:.5,pressure:.3,wobble:1,gaps}),.9*fade);}
  if(age>0&&age<.35&&u>.5)sparkBurst(s,Y,x+80,y,70,{n:8,seed,g:1-clamp(age/.35),width:9});
  const e=u>.5?fin[fin.length-1]:tch[tch.length-1];footballPanels(s,e[0],e[1],24,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
