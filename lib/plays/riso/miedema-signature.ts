/** Vivianne Miedema's SIGNATURE film, "the cool finish past the keeper": her second goal in the UEFA Women's Euro 2017 final, Netherlands 4–2
 * Denmark, Sunday 6 August 2017 (kick-off 17:00 CEST), De Grolsch Veste (FC Twente Stadion), Enschede — the 89th-minute goal that made it 4–2
 * and sealed the Netherlands' first European title. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the cool finish past the keeper"; lesson: "Stay calm one-on-one; look at the
 * keeper, then pick your finish"). The 89th-minute goal in a home European final is her best-documented finish, and every report describes
 * exactly that composure: she fooled a defender, and chose the near post while the keeper was wrong-footed. The entry's template says
 * "chip", but the real finish was a LOW shot inside the near post, so that is what is drawn; the narration never says "chip".
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "UEFA Women's Euro 2017 final" (raw wikitext: date, 17:00 CEST kick-off, De Grolsch Veste, 28,182, partly cloudy 20 °C,
 *    scorers and minutes, line-ups with shirt numbers, the kit templates — Netherlands orange shirts and shorts (_ned16h); Denmark white shirts
 *    (_den17a_wom) with black shorts and white socks)  https://en.wikipedia.org/wiki/UEFA_Women%27s_Euro_2017_final
 *  - The Guardian live blog, Simon Burnton, "Holland 4-2 Denmark: Euro 2017 final – as it happened" (6 Aug 2017): "GOAL! Holland 4-2 Denmark
 *    (Miedema, 89 mins) Miedema is played in down the inside left channel, cuts inside and then lashes a low shot inside the near post, with
 *    Petersen wrong-footed."  https://www.theguardian.com/football/live/2017/aug/06/holland-v-denmark-euro-2017-final-live
 *  - AS English (6 Aug 2017, agency report): "Miedema made it 4-2 after fooling a defender inside the box and beating Petersen with a low shot
 *    in the 89th minute."  https://en.as.com/en/2017/08/06/soccer/1502009872_236166.html
 *  - BBC Sport, "Netherlands Women 4-2 Denmark Women" (6 Aug 2017): "two clinically-finished goals"; "virtually every home supporter was
 *    wearing the national team colour of orange"; sold-out 28,182 in Enschede.  https://www.bbc.co.uk/sport/football/40825848
 *  - UEFA.com, "2017 final: Netherlands 4-2 Denmark": "Miedema's excellent run and finish finally put the game beyond Denmark"; Miedema 1.75 m.
 * CONFIRMED: Netherlands 4–2 Denmark (Nadim 6' pen, Miedema 10', Martens 28', Harder 33', Spitse 51', Miedema 89'); the 89' goal: played in
 * down the inside-LEFT channel, cut inside, fooled a defender inside the box, a LOW shot inside the NEAR post, keeper Stina Lykke Petersen
 * (Denmark No 1) wrong-footed. Miedema wore 9 and is 1.75 m. Kits: Netherlands orange shirts and shorts; Denmark white shirts, black shorts,
 * white socks. An orange crowd.
 * INFERRED (illustrative reconstruction): every position, run and timing in metres and seconds; which team-mate played her in and which Danish
 * defender she fooled (neither is named by the sources, so they carry no numbers and are not named); the direction of play on screen (the
 * Dutch attack the goal at x = 0, their LEFT channel on the far side from the main-stand camera); how she cut inside (drawn as a drag with the
 * inside of the LEFT foot, the defender lunging for the outside) and that she shot with her RIGHT foot (not stated; the narration never names
 * a foot); the keeper's lean toward the far post before the shot (the drawn reading of "wrong-footed"); the Dutch socks (orange), Petersen's
 * kit colour (drawn blue); hair (Miedema's strawberry-blonde ponytail) and builds; the celebration; the stadium's look (one roofed bowl with
 * red seats) and the early-evening light (≈ 18:50); TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME: the pass into the inside-left channel, the cut,
 * the low shot inside the near post, the orange stand erupting; ch2 = the slow-motion replay from a LOW camera behind her left shoulder: the
 * defender rushes in and lunges for the outside, Miedema drags it inside (a riso trail), the defender is left behind (an orange lag trail);
 * ch3 = the reverse replay from BEHIND THE NET: the keeper leaning the wrong way (a blue lean arrow), the gap at the near post (a ring), the
 * low shot coming at the camera through the mesh; ch4 = the lesson from a low touchline angle: stay calm (a steady ring), look at the keeper
 * first (a dashed sightline), then pick your finish (the far corner the keeper is guarding crossed out, the near-post arrow to a target ring).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down
 * to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, one continuous silhouette, `prev`
 * secondary motion so the ponytails swing, motionSmear on the sprints and the strike); women's builds (1.62–1.80 m, slimmer bulk) with
 * ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward
 * the goal Denmark defend, y up, +z = the Dutch right = the main-stand side), athlete.ts's own convention, so foot:'r' is the right foot.
 * Inks: yellow, orange, blue, navy (orange = the Dutch shirts and crowd). Everything is keyed to cue times (withTiming swaps in the recorded
 * word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,celebrate,lunge,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. Every cue starts with a plain word (Kokoro splits contractions and hyphens).
 * LEAD: once scripts/plays/kokoro-narrate.py has written public/plays/narration/miedema-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/miedema-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final, live',text:'Enschede, 2017, the Euro final. The Netherlands lead Denmark late in the game. Vivianne Miedema is played in down the left. She cuts inside, and lashes it low. Goal! That seals the title!',tail:2.4,
  cues:['Netherlands lead','late in','Vivianne Miedema','played in','cuts inside','lashes it','Goal','seals']},
 {label:'The cut inside',text:'Watch it again, slowly. A defender rushes in. Vivianne cuts inside, and the defender is fooled.',tail:1.3,
  cues:['Watch it','defender rushes','Vivianne cuts','fooled']},
 {label:'The keeper',text:'Now watch the keeper. She is wrong-footed, leaning the other way, so Vivianne shoots low, inside the near post.',tail:1.6,
  cues:['Now watch','She is','leaning','shoots low','near post']},
 {label:'The secret',text:'The secret? Stay calm one on one. Look at the keeper first, then pick your finish.',tail:2,
  cues:['The secret','Stay calm','Look at','keeper first','then pick','finish']},
];
import timingJson from '../../../public/plays/narration/miedema-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('miedema: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('miedema: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',O='orange',B='blue',K='navy';
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

// ---------------------------------------------------------------- De Grolsch Veste, Enschede, early evening: one roofed bowl, red seats, an orange crowd
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.3+17*b,-40-20*b],
 (a,b)=>[7+18*b,1.3+15*b,lerp(-54,54,a)],
 (a,b)=>[lerp(12,-116,a),1.3+17*b,40+20*b],
 (a,b)=>[-111-18*b,1.3+15*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=11;
/** flags on the stand fronts: [stand, a, kind 0 = the Dutch tricolour (orange-red, white, blue), 1 = an orange banner, 2 = Denmark (red, white cross)] */
const FLAGS:[number,number,number][]=[[0,.28,0],[0,.4,1],[0,.52,0],[0,.64,2],[0,.78,0],[0,.9,1],[1,.2,0],[1,.44,1],[1,.68,0],[2,.14,1],[2,.3,0],[3,.3,2],[3,.66,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a partly cloudy August evening (≈ 18:50): pale blue with a warm low haze
 s.field(B,.18,.45);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-340],[1e4,hz[1]-340],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.26);
  const cl=new Path2D(),r=rng(17);for(let i=0;i<5;i++){const x=lerp(-1600,1600,(i+r())/5),y=hz[1]-420-r()*260,w=240+r()*260,h=34+r()*26;cl.addPath(polyPath(Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*h*(a>Math.PI?1.5:.7)] as Pt;}),true));}
  s.knockout(cl,.55);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);seg3(c,S(0,.5),S(1,.5),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.78),[0,6.5,0]),add3(S(0,.78),[0,6.5,0])]));
  seg3(c,add3(S(0,.78),[0,6.3,0]),add3(S(1,.78),[0,6.3,0]),.4,edge);}
 // red seats: orange + a navy screen
 s.knockout(planes);s.tone(O,planes,.72);s.tone(K,planes,.2);s.knockout(walk,.85);
 // the crowd: virtually every home fan in orange; a few Danish white and red, some blue
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.5)<.05)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.16)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.7?0:h<.8?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(O,inks[0],.95);s.fill(Y,inks[0],.35);s.knockout(inks[1],.75);s.fill(B,inks[2],.9);s.fill(K,inks[3],.9);
 // the roof, its navy underside edge
 s.knockout(roof);s.tone(B,roof,.15);s.fill(K,edge,.85);
 const fl=new Path2D(),or=new Path2D(),bl=new Path2D(),dk=new Path2D(),cr=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.028,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(or,polyP(c,[P(0,.05),P(1,.05),P(1,.075),P(0,.075)]));addPoly(bl,polyP(c,[P(0,.005),P(1,.005),P(1,.03),P(0,.03)]));}
  else if(kind===1){addPoly(or,q);}
  else{dk.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.3,.005),P(.42,.005),P(.42,.075),P(.3,.075)]));addPoly(cr,polyP(c,[P(0,.034),P(1,.034),P(1,.046),P(0,.046)]));}}
 s.knockout(fl);s.knockout(or);s.knockout(dk);s.fill(O,or,.95);s.fill(B,bl,.95);s.fill(O,dk,.95);s.fill(K,dk,.25);s.knockout(cr);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;bz?:number;net?:boolean}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // the main stand's evening shadow across the near touchline strip (the sun is low in the west, behind it)
 const sh=polyP(c,[[-116,0,45],[12,0,45],[12,0,29],[-116,0,26]]);if(sh.length>2)s.tone(K,polyPath(sh,true),.2);
 // advertising boards: navy with orange panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(O,pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 addPoly(ln,polyP(c,Array.from({length:10},(_,i)=>[-11+Math.cos(i/10*TAU)*.12,0,Math.sin(i/10*TAU)*.12] as V3)));
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(O,flag,.95);
 if(o.net!==false)goalNet(s,c,o.bulge??0,o.bz??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out where the shot went in (z ≈ bz) */
function goalNet(s:Sheet,c:Cam,bulge:number,bz:number,front=false){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bw=(z:number)=>bulge*Math.exp(-Math.pow((z-bz)/1.6,2)),back=(z:number)=>X+2+bw(z)*.7,top=(z:number)=>1.9+bw(z)*.2;
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),top(z0),z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),top(z1),z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),top(z),z] as V3)]];
 // seen from behind (front = true) the net is in the foreground: a light veil only, so the play shows through the mesh
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 if(front)s.tone(K,net,.07);else{s.knockout(net,.32);s.tone(K,net,.1);}
 const mesh=new Path2D(),mw=front?.03:.022;
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),top(z),z],mw,mesh,.7);seg3(c,[back(z),top(z),z],[back(z),0,z],mw,mesh,.7);}
 for(let j=1;j<=5;j++){const f=j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),top(zs[i])*f,zs[i]],[back(zs[i+1]),top(zs[i+1])*f,zs[i+1]],mw,mesh,.7);seg3(c,[X,H*f,z0],[back(z0),top(z0)*f,z0],mw,mesh,.7);seg3(c,[X,H*f,z1],[back(z1),top(z1)*f,z1],mw,mesh,.7);}
 s.fill(K,mesh,front?.55:.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[O,.18]],SKIN_M:InkFill[]=[[O,.4],[Y,.4],[K,.12]],SKIN_D:InkFill[]=[[O,.5],[K,.4],[Y,.2]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Netherlands: orange shirts and shorts (Wikipedia kit template, this match), orange socks (inferred), navy trim; Denmark: white shirts, black
 * shorts, white socks (kit template) with orange-red trim; unnamed players carry no number */
const ned=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[O,.95],shorts:[O,.95],socks:[O,.95],boots:K,skin:SKIN_L,hair:[Y,.9],line:K,trim:K,numberInk:'paper',hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const den=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.85],line:K,trim:[O,.9],numberInk:[K,.9],hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const MIE_B=W_BUILD(1.75,.95);
/** Miedema: No 9, 1.75 m (UEFA), strawberry-blonde ponytail (inferred ink: orange over yellow) */
const MIE_ST=ned({number:9,hair:[O,.7],build:MIE_B,seed:9});
const PASSER_ST=ned({hair:[K,.8],build:W_BUILD(1.66),seed:21});
const DEF_ST=den({hair:[Y,.9],build:W_BUILD(1.72,.95),seed:5});
/** Stina Lykke Petersen, Denmark No 1 (kit colour inferred: blue) */
const PETERSEN_ST:AthleteStyle={shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:SKIN_L,hair:[Y,.9],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:'paper',build:W_BUILD(1.72,.95),seed:1};

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

// ---------------------------------------------------------------- the goal = a Play on its own clock τ (seconds; τ = 0 is Miedema's contact)
type Kick={t:number;foot:'l'|'r';power:number};
type Role='hero'|'kicker'|'keeper'|'marker'|'ned'|'den';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;kick?:Kick;dive?:{t:number;side:'l'|'r';height:number};lunge?:{t:number;side:'l'|'r'}};
/** ball segments: carried at an actor's feet, or kicked from A to B (arc = extra height at the middle, m) */
type Seg={t0:number;t1:number;carry?:string;A?:V3;B?:V3;arc?:number;ease?:number};
type Play={actors:Actor[];segs:Seg[];M:V3;G:V3;T_SHOT:number;NET:V3;REST:V3;hero:Actor;marker:Actor;keeper:Actor;CUT:V3};
const SD=.9;
/** the pelvis spot where a kicker's boot meets the ball at P, body turned to face dir (solved once through the skeleton) */
function kickSpot(P:V3,dir:[number,number],k:Kick,build:Build):[number,number]{
 const yaw=yawTo(0,0,dir[0],dir[1]),sk=solve(strike(STRIKE_CONTACT,{foot:k.foot,power:k.power}),build,{x:0,z:0,yaw}),toe=k.foot==='r'?sk.rToe:sk.lToe;
 return[P[0]-dir[0]*.12-toe[0],P[2]-dir[1]*.12-toe[2]];
}
const kickYaw=(dir:[number,number])=>yawTo(0,0,dir[0],dir[1]);
const T_PASS=-4.4,T_REC=-3,T_CUT=-1.15;
/** 89': a team-mate plays her in down the inside-left channel; she carries it at the box, a defender rushes in and lunges for the outside, she
 * drags it inside (T_CUT), takes one more touch and lashes a low right-foot shot inside the near post (z −3.66) with Petersen leaning the
 * other way. */
function goal():Play{
 const PASS_A:V3=[-37,.11,-3.4],PASS_B:V3=[-23.4,.11,-12.2],M:V3=[-11.4,.11,-6.3],G:V3=[0,.2,-3.05],CUT:V3=[-14.6,.11,-10.1];
 const T_SHOT=.44;
 const pdir=dirOf(PASS_A,PASS_B),sdir=dirOf(M,G);
 const passK:Kick={t:T_PASS,foot:'r',power:.7},mieK:Kick={t:0,foot:'r',power:.95};
 const PP=kickSpot(PASS_A,pdir,passK,PASSER_ST.build!),PH=kickSpot(M,sdir,mieK,MIE_B);
 const hero:Actor={name:'Miedema',role:'hero',st:MIE_ST,kick:mieK,phase:.2,
  path:[[-10,-45,-6.5],[-6.5,-35,-9],[-4.4,-29,-11],[T_REC,-24.1,-12.4],[-2,-19.7,-12.1],[-1.5,-17.4,-11.6],[T_CUT,-15.6,-10.9],[-.75,-14.2,-9.2],[-.35,-13.2,-7.9],[0,PH[0],PH[1]],[.55,PH[0]+sdir[0]*1.4,PH[1]+sdir[1]*.8],[1.6,-9.4,-8.4],[3,-7.4,-14.5],[5,-4.5,-21],[7,-3,-25]]};
 const marker:Actor={name:'Danish defender',role:'marker',st:DEF_ST,phase:.6,lunge:{t:T_CUT+.05,side:'r'},
  path:[[-10,-8,-3.4],[-3,-10.6,-6.8],[-1.9,-12.3,-9],[-1.4,-13.2,-10.1],[T_CUT,-13.7,-10.6],[-.6,-14,-10.9],[-.2,-13.7,-10.2],[.4,-12.6,-8.6],[2,-11.2,-7.6]]};
 const keeper:Actor={name:'Petersen',role:'keeper',st:PETERSEN_ST,phase:0,dive:{t:.62,side:'r',height:.05},
  path:[[-10,-1.3,-.6],[-3,-1.7,-1.9],[-1.6,-2.2,-2.3],[-.8,-2.3,-1.6],[-.3,-2.2,-1.05],[0,-2.15,-.95],[3,-2.15,-.95]]};
 const actors:Actor[]=[hero,marker,keeper,
  {name:'team-mate',role:'kicker',st:PASSER_ST,kick:passK,phase:.1,path:[[-10,-50,-1],[-6,-42,-2.4],[T_PASS-.9,PP[0]-pdir[0]*4.5,PP[1]-pdir[1]*4.5],[T_PASS,PP[0],PP[1]],[-3,-33,-5],[-1,-27,-6],[3,-20,-6]]},
  {name:'cover',role:'den',st:den({hair:[K,.8],build:W_BUILD(1.7),seed:12}),phase:.3,path:[[-10,-16,2],[-4,-13,.4],[-1.4,-10.2,-1.6],[0,-8.6,-2.6],[.6,-8,-3],[3,-7.6,-3.2]]},
  {name:'chaser',role:'den',st:den({skin:SKIN_M,hair:K,build:W_BUILD(1.65),seed:13}),phase:.7,path:[[-10,-40,-10],[-4,-30,-10.5],[-2,-24,-11],[0,-18,-10],[3,-14,-9]]},
  {name:'right-back',role:'den',st:den({hair:[Y,.8],build:W_BUILD(1.66),seed:8}),phase:.45,path:[[-10,-30,-24],[-4,-19,-20],[0,-11,-17],[3,-9.5,-16]]},
  {name:'left-back',role:'den',st:den({hair:[O,.5],build:W_BUILD(1.64),seed:19}),phase:.15,path:[[-10,-26,14],[-4,-18,11],[0,-11.5,7.6],[3,-10,6.8]]},
  {name:'left wing',role:'ned',st:ned({hair:[Y,.95],build:W_BUILD(1.71),seed:11}),phase:.5,path:[[-10,-44,-27],[-4,-27,-24],[0,-15,-21],[3,-11,-18]]},
  {name:'runner',role:'ned',st:ned({hair:[K,.85],build:W_BUILD(1.7),seed:10}),phase:.35,path:[[-10,-44,4],[-4,-28,3],[0,-15,1.2],[2,-12,-2],[4,-9,-10]]},
  {name:'right wing',role:'ned',st:ned({skin:SKIN_D,hair:K,build:W_BUILD(1.67),seed:7}),phase:.8,path:[[-10,-40,22],[-4,-27,19],[0,-17,14],[3,-13,8]]},
 ];
 const segs:Seg[]=[{t0:-10,t1:T_PASS,carry:'team-mate'},{t0:T_PASS,t1:T_REC,A:PASS_A,B:PASS_B,arc:.05,ease:.3},{t0:T_REC,t1:0,carry:'Miedema'}];
 return{actors,segs,M,G,T_SHOT,NET:[1.55,.3,-2.9],REST:[1.25,.11,-2.6],hero,marker,keeper,CUT};
}
const GL=goal();

// ---------------------------------------------------------------- the ball on the play's clock
const T_NETD=.1;
function shotAt(pl:Play,u:number):V3{const e=u*(1.06-.06*u);return[lerp(pl.M[0],pl.G[0],e),lerp(pl.M[1],pl.G[1],e)+.1*Math.sin(Math.PI*e),lerp(pl.M[2],pl.G[2],e)];}
function carryAt(pl:Play,who:string,tau:number):V3{const a=pl.actors.find(x=>x.name===who)!;const pp=pathAt(a.path,tau),ahead=pathAt(a.path,tau+.15);
 const d=Math.hypot(ahead[0]-pp[0],ahead[1]-pp[1])||1,dx=(ahead[0]-pp[0])/d,dz=(ahead[1]-pp[1])/d,touch=.45+.35*Math.abs(Math.sin(tau*4.4));return[pp[0]+dx*touch,.11,pp[1]+dz*touch];}
function ballAt(pl:Play,tau:number):V3{
 if(tau<0){for(let i=0;i<pl.segs.length;i++){const s=pl.segs[i],last=i===pl.segs.length-1;if(tau>=s.t1&&!last)continue;
  if(s.carry){const c=carryAt(pl,s.carry,tau),nx=pl.segs[i+1];if(nx?.A){const w=sm(s.t1-.45,s.t1,tau);return mix3(c,nx.A,w);}if(last)return mix3(c,pl.M,sm(s.t1-.4,s.t1,tau));return c;}
  const u=clamp((tau-s.t0)/(s.t1-s.t0)),e=s.ease??.25,v=u*(1+e-e*u);const p=mix3(s.A!,s.B!,v);p[1]+=(s.arc??0)*Math.sin(Math.PI*v);return p;}
  return pl.M;}
 const T=pl.T_SHOT;if(tau<T)return shotAt(pl,tau/T);
 if(tau<T+T_NETD)return mix3(shotAt(pl,1),pl.NET,easeOut((tau-T)/T_NETD));
 const u=clamp((tau-T-T_NETD)/.55),h=pl.NET[1]*(1-u*u)+.11*u*u;return[lerp(pl.NET[0],pl.REST[0],u),Math.max(.11,h),lerp(pl.NET[2],pl.REST[2],u)];
}
const spinAt=(tau:number)=>TAU*(1.6*tau+4*Math.max(0,Math.min(tau,.5)));
const bulgeAt=(pl:Play,tau:number)=>{const tn=pl.T_SHOT+T_NETD;return tau<tn-.03?0:Math.exp(-(tau-tn+.03)*2.4)*(1+.3*Math.sin((tau-tn)*14));};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** the cut inside (inferred): plant on the right, the LEFT boot sweeps the ball across her body, hips sinking, arms out for balance */
const CUT_POSE=posed({rHipF:34,rKnee:56,rAnk:-8,rHipA:12,lHipF:26,lHipA:-22,lHipR:34,lKnee:30,lAnk:12,lean:22,pitch:5,bend:12,roll:9,twist:-10,yaw:12,lShA:62,lShF:12,lElb:36,rShA:44,rShF:-18,rElb:40,neckP:30,neckY:-8,squash:-.05});
/** head up: the look at the keeper a beat before the shot (chin up, eyes on goal) */
const HEAD_UP:Partial<Pose>={neckP:-.12};
const ARMS_UP=posed({lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,lHand:1,rHand:1,neckP:-32,lean:-10,pitch:-3,lHipF:12,rHipF:-4,lKnee:16,rKnee:20,lHipA:8,rHipA:8});
const kickPose=(k:Kick,u:number)=>strike(u,{foot:k.foot,power:k.power});
/** one actor's pose + place at τ (it = idle clock). The Dutch celebrate after the goal; Denmark slump. */
function actorAt(pl:Play,a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(pl,tau),tn=pl.T_SHOT+T_NETD;
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(tabOf(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 const run=runCycle(ph,{speed:clamp((sp-1)/5.5)});
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),run,sm(.5,2,sp));
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);yaw=yawTo(x,z,ball[0],ball[2]);
  // wrong-footed: as she cuts inside, the keeper's weight shifts toward the far post (her left, +z) — hips tilting that way
  const lean=sm(-1,-.35,tau)*(1-sm(.1,.3,tau));if(lean>0)kp={...kp,roll:kp.roll-.2*lean,bend:kp.bend-.14*lean,lKnee:kp.lKnee+.25*lean,neckY:kp.neckY+.1*lean};
  if(a.dive){const D=.8,t0=a.dive.t-.55*D;if(tau>t0){const u=clamp((tau-t0)/D);kp=blendPose(kp,keeperDive(u,{side:a.dive.side,height:a.dive.height}),sm(t0,t0+.1,tau));yaw=lerpAng(yaw,yawTo(x,z,pl.M[0],pl.M[2]),sm(t0,t0+.1,tau));}}
  if(tau>2.4)kp=blendPose(kp,SLUMP,sm(2.4,3,tau)*.5);
  return{pose:kp,place:{x,z,yaw}};
 }
 if(a.role==='hero'||a.role==='kicker'){
  const k=a.kick!,c=STRIKE_CONTACT;
  if(a.role==='hero'){
   // carrying the ball: head over it, short quick strides; the cut inside; the head comes up to look at the keeper
   const carry=sm(T_REC-.2,T_REC+.2,tau)*(1-sm(-.45,-.25,tau));
   if(carry>0)p=blendPose(p,dribble(ph,{foot:'r',speed:.7}),carry*.7);
   const cut=sm(T_CUT-.28,T_CUT,tau)*(1-sm(T_CUT+.05,T_CUT+.34,tau));if(cut>0)p=blendPose(p,CUT_POSE,cut);
   const up=sm(-.8,-.55,tau)*(1-sm(-.3,-.1,tau));if(up>0)p={...p,neckP:lerp(p.neckP,HEAD_UP.neckP!,up)};
   if(tau<T_REC-.2&&sp<2)yaw=lerpAng(yaw,toBall,.8);
  }
  const u=c+(tau-k.t)/SD;
  if(u>0&&u<1.15){const w=sm(0,.14,u)*(a.role==='hero'?1:1-sm(.85,1.1,u));const dir=a===pl.hero?dirOf(pl.M,pl.G):dirOf(ballAt(pl,k.t-.01),ballAt(pl,k.t+.2));
   p=blendPose(p,kickPose(k,clamp(u)),w);yaw=lerpAng(yaw,kickYaw(dir),Math.max(w,sm(k.t-.5,k.t-.2,tau)*(1-sm(k.t+.4,k.t+.8,tau))));}
  if(a.role==='hero'&&tau>k.t+(1-c)*SD){
   const d=distAt(tabOf(a.path),tau);p=blendPose(kickPose(k,1),celebrate(d/4.2,{kind:'run'}),sm(k.t+(1-c)*SD,k.t+(1-c)*SD+.4,tau));
   if(tau>4.2)p=blendPose(p,ARMS_UP,clamp(1-sp/3)*sm(4.2,5.2,tau));
   yaw=lerpAng(yaw,heading,sm(.5,1,tau));
  }
  if(a.role==='kicker'&&tau>tn+.3&&sp<1.2)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(tn+.3,tn+.8,tau)*.9);
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.role==='marker'&&a.lunge){const u=clamp((tau-a.lunge.t+.45)/.8);if(u>0&&tau<1.2){const w=sm(0,.15,u)*(1-sm(.6,1.2,tau));p=blendPose(p,lunge(u,{side:a.lunge.side}),w);if(tau<a.lunge.t+.2)yaw=lerpAng(yaw,yawTo(x,z,pl.CUT[0]-1.5,pl.CUT[2]-1),w);}}
 if(sp<1.4)yaw=lerpAng(yaw,toBall,.8);
 if(tau>tn+.2&&sp<1.2){if(a.role==='ned')p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(tn+.2,tn+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(tn+.2,tn+.9,tau)*.6);}
 if(tau>tn&&a.role==='ned'&&sp<1.2){const r=pathAt(pl.hero.path,tau);yaw=lerpAng(yaw,yawTo(x,z,r[0],r[1]),.8);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the sprints, the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,pl:Play,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(pl,tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 if(P[1]>.3){const sh:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[P[0]+Math.cos(a)*.2,0,P[2]+Math.sin(a)*.16]);if(p)sh.push(p);}if(sh.length>8)s.tone(K,polyPath(sh,true),.3);}
 if(o.lines&&o.prev!==undefined){const a=pr(c,ballAt(pl,o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*1.2)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(240,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number;near?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,pl:Play,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(p:Place,h=1.8)=>{const q=toCam(c,[p.x??0,.9,p.z??0]);if(q[2]<(e.near??1))return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const tn=pl.T_SHOT+T_NETD;
 for(const a of pl.actors){const cur=actorAt(pl,a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(pl,a,tpPrev,e.it-1/12);
  const big=a.role==='hero'||a.role==='kicker'||a.role==='keeper'||a.role==='marker';
  const fast=a.role==='hero'?tp>-3.4&&tp<3:a.role==='kicker'?Math.abs(tp-a.kick!.t)<.5:a.role==='keeper'?tp>0&&tp<tn+.6:a.role==='marker'&&tp>-1.6&&tp<.6;
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,big),cur.place,prev,!!e.smear&&fast);}});}
 const bq=toCam(c,ballAt(pl,tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,pl,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch) */
function panTarget(pl:Play,tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(pl,tau-i*.12);x+=p[0];y+=p[1];z+=p[2];}return[x/5,Math.min(1.6,y/5)*.5+.7,z/5];}
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
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a dashed line in the air between two 3D points (a sightline) */
function dashLine(s:Sheet,c:Cam,a:V3,b:V3,u:number,ink:string,wm=.07){if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<=16;i++){const q=pr(c,mix3(a,b,i/16*u));if(q)pts.push(q);}if(pts.length<3)return;
 const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.55)/9,(i+.95)/9]);const w=Math.max(5,kAt(c,a)*wm),rr=ribbon(pts,w,{taper:0,wobble:.4,gaps});s.knockout(rr,.85);s.fill(ink,rr,.95);}
/** the keeper's weight: a small curved arrow at hip height pointing toward the far post (+z) */
function leanArrow(s:Sheet,c:Cam,P:V3,u:number,ink:string){if(u<=.02)return;const pts:V3[]=[];for(let i=0;i<=8;i++){const k=i/8*u;pts.push([P[0]-.3,1.35+.35*Math.sin(Math.PI*k),P[2]+.2+1.5*k]);}arrow3(s,c,pts,Math.max(6,kAt(c,P)*.09),ink,.95);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
const P1:V3=[-24,17,56];
const tS1=()=>CUE(0,'lashes it')+.15;
const tau1=(t:number)=>Math.max(-9.9,t-tS1());
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:add3(panTarget(GL,tau),[3,0,-1]),fov:15})],
  [tS1()+T_REC-.4,1.2,()=>({P:P1,T:add3(panTarget(GL,tau),[3,0,-.5]),fov:12})],
  [tS1()-1.9,1.2,()=>({P:P1,T:add3(panTarget(GL,tau),[2.5,0,1]),fov:10})],
  [tS1()-.5,.7,()=>({P:P1,T:[-7,1,-5.2],fov:10})],
  [tS1()+1,1.6,()=>({P:P1,T:add3(posOf(GL.hero,tau),[0,1,0]),fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+GL.T_SHOT+T_NETD;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(GL,tau),bz:GL.G[2]});
  play(s,c,GL,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(GL,tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:11,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a LOW camera behind her left shoulder: the cut inside
const tau2=(t:number)=>key(t,mono([[0,-3.3],[CUE(1,'defender rushes'),-2.2],[CUE(1,'Vivianne cuts'),-1.45],[CUE(1,'fooled'),-.85],[SECS(1),-.2]]),linear);
const E2:V3=[-27,1.7,-17.5];
function cam2(t:number):Cam{
 const tau=tau2(t),h=add3(posOf(GL.hero,tau),[0,1,0]),mk=add3(posOf(GL.marker,tau),[0,.9,0]);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(h,[-12,1,-7],.08),fov:24})],
  [CUE(1,'defender rushes')-.2,1.2,()=>({P:add3(E2,[3,0,1]),T:mix3(h,mk,.5),fov:15})],
  [CUE(1,'Vivianne cuts')-.2,1.2,()=>({P:add3(E2,[5.5,-.1,2]),T:mix3(h,mk,.4),fov:13})],
  [CUE(1,'fooled')-.1,1,()=>({P:add3(E2,[6.5,-.1,2.4]),T:mix3(h,GL.M,.3),fov:15})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tR=CUE(1,'defender rushes'),tC=CUE(1,'Vivianne cuts'),tF=CUE(1,'fooled');
  stadium(s,c,t,[1,2,3]);
  ground(s,c);
  const h=GL.hero,mk=GL.marker;
  // "a defender rushes in": her route in, dashed orange
  trail(s,c,mk,-2.6,Math.min(tau,T_CUT),sm(tR-.1,tR+.4,t)*(1-sm(tF+.3,tF+.9,t)*.6),O,.22,true);
  // "cuts inside": Vivianne's route traced in yellow (the drag across the defender)
  trail(s,c,h,-2.2,Math.min(tau,-.3),sm(tC-.3,tC+.3,t),Y,.3);
  play(s,c,GL,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:40});
  // the lunge: a ring where the defender's boot stabs at empty grass
  const lg=sm(tC,tC+.4,t,easeOutBack)*(1-sm(SECS(1)-.8,SECS(1)-.2,t));if(lg>.02)groundRing(s,c,[-14.4,0,-11.5],.55,lg,O,23);
  // "fooled": a spark on the ball as it slips inside
  const f=sm(tF-.1,tF+.1,t)*(1-sm(tF+.4,tF+.8,t));if(f>0){const q=pr(c,ballAt(GL,tp));if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,GL.CUT)*.45)*f,{n:8,seed:21,width:6});}
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(posOf(GL.hero,tau2(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:3.5,
};

// ---------------------------------------------------------------- 3 · the reverse replay from BEHIND THE NET: the keeper wrong-footed, the near post
const tau3=(t:number)=>key(t,mono([[0,-1.3],[CUE(2,'She is'),-.85],[CUE(2,'leaning'),-.45],[CUE(2,'shoots low')+.1,-.02],[CUE(2,'near post')+.3,.5],[SECS(2),1.1]]),linear);
const E3:V3=[4.6,1.55,-1.8];
function cam3v(t:number):Cam{
 const tau=tau3(t),h=add3(posOf(GL.hero,tau),[0,1,0]),k=add3(posOf(GL.keeper,tau),[0,1,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(h,k,.45),fov:34})],
  [CUE(2,'She is')-.2,1,()=>({P:add3(E3,[.2,.05,.3]),T:mix3(h,k,.7),fov:28})],
  [CUE(2,'shoots low')-.3,.8,()=>({P:add3(E3,[.2,0,-.3]),T:mix3([-2,.6,-3.2],h,.35),fov:36})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tS=CUE(2,'She is'),tL=CUE(2,'leaning'),tSh=CUE(2,'shoots low'),tP=CUE(2,'near post');
  stadium(s,c,t,[0,2,3],{roar:sm(tP,tP+.5,t)});
  ground(s,c,{net:false});
  const kp=posOf(GL.keeper,tp);
  // "leaning the other way": a blue arrow over the keeper's hips toward the far post
  leanArrow(s,c,kp,sm(tL-.1,tL+.5,t,easeOut)*(1-sm(tSh+.3,tSh+.8,t)),B);
  // the gap she chooses: a yellow ring at the near post
  const gp=sm(tSh-.4,tSh,t,easeOutBack);if(gp>.02)groundRing(s,c,[-.6,0,-3.1],.75,gp,Y,31);
  // "she is wrong-footed": a dashed navy ring round the keeper
  const wf=sm(tS-.1,tS+.4,t,easeOutBack)*(1-sm(tSh,tSh+.4,t));if(wf>.02)groundRing(s,c,kp,1.1,wf,K,33,.9,true);
  play(s,c,GL,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06),only:44});
  // the net, in front of the camera (we film through the mesh)
  goalNet(s,c,bulgeAt(GL,tau),GL.G[2],true);
 },
 aperture(t){const c=cam3v(t),P=ballAt(GL,tau3(t)),q=pr(c,P)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: stay calm → look at the keeper first → then pick your finish
const tau4=(t:number)=>{const c=CUE(3,'Stay calm'),l=CUE(3,'Look at'),k=CUE(3,'keeper first'),p=CUE(3,'then pick'),f=CUE(3,'finish');
 return key(t,mono([[0,-1.5],[c,-1.35],[l,-.95],[k+.2,-.7],[p+.1,-.45],[f+.1,-.05],[f+.9,.5],[SECS(3),.8]]),linear);};
const E4:V3=[-23,2,-13.5];
function cam4v(t:number):Cam{
 const tau=tau4(t),h=add3(posOf(GL.hero,tau),[0,.9,0]),k=add3(posOf(GL.keeper,tau),[0,.9,0]);
 return plan(t,[
  [0,0,()=>({P:E4,T:mix3(h,k,.35),fov:32})],
  [CUE(3,'Look at')-.2,1,()=>({P:add3(E4,[2,0,1.4]),T:mix3(h,k,.5),fov:32})],
  [CUE(3,'then pick')-.2,1,()=>({P:add3(E4,[4,-.1,2.6]),T:mix3(h,[0,.9,-2],.55),fov:36})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tC=CUE(3,'Stay calm'),tL=CUE(3,'Look at'),tK=CUE(3,'keeper first'),tP=CUE(3,'then pick'),tF=CUE(3,'finish');
  stadium(s,c,t,[0,1,3]);
  ground(s,c,{bulge:bulgeAt(GL,tau),bz:GL.G[2]});
  const h=GL.hero,hp=posOf(h,tp),kp=posOf(GL.keeper,tp);
  // 1 · stay calm: a steady blue ring on the grass under her
  const sc=sm(tC-.1,tC+.4,t,easeOutBack)*(1-sm(tP,tP+.5,t)*.7);if(sc>.02)groundRing(s,c,hp,1.1,sc,B,41);
  // 3 · pick your finish: the far corner the keeper is guarding (navy dashed, crossed out) and the near post (yellow arrow to a ring)
  const pk=sm(tP-.1,tP+.5,t,easeOut);
  if(pk>.02){const M=GL.M,far:V3=[0,.3,2.8];const q=[pr(c,[M[0],.05,M[2]]),pr(c,[lerp(M[0],far[0],pk),.05,lerp(M[2],far[2],pk)])].filter((p):p is Pt=>!!p);
   if(q.length===2){const w=Math.max(6,kAt(c,M)*.1),gaps:[number,number][]=[];for(let i=0;i<6;i++)gaps.push([(i+.6)/6,(i+.95)/6]);const rr=ribbon(q,w,{taper:.2,wobble:0,gaps});s.knockout(rr,.6*pk);s.fill(K,rr,.8*pk);
    if(pk>.7){const e=pr(c,[far[0],.05,far[2]]);if(e){const z=w*1.4,x=new Path2D(),a=clamp((pk-.7)/.3);x.addPath(ribbon([[e[0]-z,e[1]-z],[e[0]+z,e[1]+z]],w*.7,{taper:0,wobble:0}));x.addPath(ribbon([[e[0]-z,e[1]+z],[e[0]+z,e[1]-z]],w*.7,{taper:0,wobble:0}));s.knockout(x,.9*a);s.fill(O,x,.95*a);}}}
   arrow3(s,c,[[GL.M[0],.05,GL.M[2]],mix3([GL.M[0],.05,GL.M[2]],[-.3,.05,-3.1],.5),mix3([GL.M[0],.05,GL.M[2]],[-.3,.05,-3.1],pk)],Math.max(8,kAt(c,GL.M)*.14),Y,.95);
   groundRing(s,c,[-.4,0,-3.1],.6,pk,Y,43);}
  play(s,c,GL,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:46,near:4.5});
  // 2 · look at the keeper first: a dashed yellow sightline from her eyes to the keeper; the keeper's lean in blue
  const lk=sm(tL-.1,tL+.5,t,easeOut)*(1-sm(tF,tF+.4,t));
  if(lk>.02){const sk=solve(actorAt(GL,h,tp,tt).pose,MIE_B,actorAt(GL,h,tp,tt).place);dashLine(s,c,sk.head,add3(kp,[0,1.35,0]),lk,Y);}
  leanArrow(s,c,kp,sm(tK-.1,tK+.5,t,easeOut)*(1-sm(tF,tF+.5,t)),B);
 },
 still:8,
};

const film:RisoStory={
 id:'miedema-signature',format:'11v11',title:"Miedema's cool finish",
 theme:'The cool finish: stay calm one-on-one, look at the keeper first, then pick your finish',
 ageNote:'Netherlands 4–2 Denmark, UEFA Women’s Euro 2017 final, De Grolsch Veste, Enschede, 6 August 2017 — Miedema’s 89th-minute goal. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a calm look and a finish — a dashed yellow sightline, then an orange shot low into a ring. Reduced motion: the still line. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const look:Pt[]=[],shot:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*u;look.push([x-130+130*k,y-60+30*k]);shot.push([x-130+130*k,y+60-60*k]);}
  const gaps:[number,number][]=[];for(let i=0;i<6;i++)gaps.push([(i+.6)/6,(i+.95)/6]);s.fill(Y,ribbon(look,8,{seed,taper:.2,pressure:.3,wobble:1,gaps}),.9*fade);
  s.fill(O,ribbon(shot,13,{seed:seed+1,taper:.8,pressure:.3,wobble:1}),.95*fade);
  if(u>.9){const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push([x+Math.cos(a)*34,y+Math.sin(a)*34]);}s.fill(Y,ribbon(pts,7,{close:true,seed,taper:0,wobble:1.2}),.9*fade);}
  if(age>0&&age<.35&&u>.5)sparkBurst(s,Y,x,y,70,{n:8,seed,g:1-clamp(age/.35),width:9});
  footballPanels(s,shot[shot.length-1][0],shot[shot.length-1][1],24,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
