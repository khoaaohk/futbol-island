/** Toni Kroos's free kick — Germany 2–1 Sweden, 2018 World Cup, Group F, Fisht Olympic Stadium, Sochi, 23 June 2018 (kick-off 21:00
 * local, a night match) — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 with curl; cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "2018 FIFA World Cup Group F" (raw wikitext: match summary, football box, kit templates, line-ups; citing the FIFA
 *    tactical line-up and match report PDFs) https://en.wikipedia.org/wiki/2018_FIFA_World_Cup_Group_F
 *  - BBC Sport, Steve Sutcliffe, "Germany 2 Sweden 1" (23 June 2018) https://www.bbc.com/sport/football/44439176
 *  - The Guardian, David Hytner, "Toni Kroos brings off late miracle for Germany to stun Sweden" (23 June 2018)
 *    https://www.theguardian.com/football/2018/jun/23/toni-kroos-germany-sweden-world-cup-match-report
 *  - FIFA, "Kroos strikes late in thrilling win" (23 June 2018; web.archive.org copy of inside.fifa.com)
 *  - Wikipedia, "Jimmy Durmaz" (conceded the free kick) and "Toni Kroos"
 * CONFIRMED by those accounts: Saturday 23 June 2018, Fisht Olympic Stadium, Sochi, 21:00 MSK, 44,287; Toivonen 32' (0–1, a lob over
 * Neuer after Kroos gave the ball away), Reus 48' (1–1, off his knee), Boateng sent off (second yellow) late on, Kroos 90+5' (2–1) "with
 * 18 seconds of the five minutes of stoppage time remaining" (94:39 by FIFA's clock — the latest winner in World Cup history); Sweden's
 * Jimmy Durmaz conceded the free kick; it was "to the left of the penalty area" and "the angle ... looked to be too tight"; Kroos "made it
 * slightly better by touching the ball to Marco Reus, who gave it back"; Kroos swept the return "into the top right corner from left of the
 * penalty area with his RIGHT foot"; "the bend on the shot wicked and it fizzed beyond Olsen into the far, top corner"; keeper Robin Olsen
 * "could do nothing"; Germany in WHITE shirts, BLACK shorts, WHITE socks (home), Sweden in their DARK-BLUE away kit (navy shirts, dark
 * shorts, blue socks); Kroos number 8, Reus 11, Olsen 1; "a wild night"; German players ran to their own fans, Sweden's slumped.
 * INFERRED (illustrative): every exact position (the kick ≈ 17.5 m out and 21 m left of centre, just outside the left corner of the box;
 * the tap ≈ 1.8 m infield to Reus), that Reus stopped it dead under his sole (the accounts only say he "gave it back"), Reus's and every
 * other player's position, the Swedish wall (three men) and who stood in the box, Olsen's starting spot, his dive and his kit colours
 * (drawn red), the run-up (≈ 2.4 m, from the left of the ball), the flight (peak ≈ 3.1 m, ≈ 1.1 s, the exact bend), where the ball met the
 * net, Kroos's run to the near touchline afterwards, hair colours, the referee (not shown), which touchline the TV camera sat on (drawn on
 * Kroos's side), the Fisht roof shells, crowd colours (German white, Swedish yellow), the LED boards.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Fisht at night wide → the crowded box → the
 * keeper → the ball → the tight angle → close on Kroos → the tap, the stop, the strike → pan with the ball to the far top corner → Kroos
 * runs off, flashbulbs); ch2 = the slow-motion replay from LOW BEHIND Kroos (tap, stop, the ball rising over everyone, swinging wide and
 * bending back in; a riso replay trail); ch3 = a second replay, reverse angle from behind the goal: Olsen flies across, too late, into
 * the top corner; ch4 = the lesson: from high behind the kick, the tight red wedge from the first spot, the short pass, the new yellow
 * wedge, then the curl (spin, up and over, down into the far corner) with where it was heading dashed.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), kept inside the central ~1000 units so it
 * frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev` secondary motion, motion smear on the
 * strike); small figures in the wide shots and every figure inside a passage print at `low` detail. Handedness: the world is right-handed
 * (x toward the goal, y up, +z = the attacker's right), exactly athlete.ts's convention, so Kroos's RIGHT foot strikes without a mirror.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Budget: ~150–300 plate ops per frame, passages up to ~600 (as the approved free-kick film). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (withTiming matches each cue's FIRST
 * word in order, so every cue starts with a word that cannot be matched early); their `at` and each chapter's `seconds` are ESTIMATES
 * (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/kroos-sweden-2018/timing.json, add
 *   import timingJson from '../../../public/plays/narration/kroos-sweden-2018/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The free kick, live',text:'Sochi, 2018. Germany and Sweden are level, and time is almost up. A free kick, wide on the left. Toni Kroos taps it to Marco Reus, Reus stops it... and Kroos curls it... Goal!',tail:2.4,
  cues:['Sochi','Germany and Sweden','time is almost up','A free kick','wide on the left','Toni Kroos','taps it','stops it','Kroos curls','Goal']},
 {label:'Watch it again',text:'Watch it again, from behind. The little pass opens the angle. It rises over everyone, swings wide, and bends back in.',tail:1.6,
  cues:['Watch it again','from behind','The little pass','opens the angle','rises over','swings wide','bends back']},
 {label:'From behind the goal',text:'From behind the goal: the keeper flies, too late! Top corner!',tail:1.9,
  cues:['From behind the goal','keeper flies','too late','Top corner']},
 {label:'The secret',text:'The secret? A tight angle? Pass it short to open it up. Then curl it, up and over, into the far corner.',tail:1.8,
  cues:['The secret','A tight angle','Pass it short','open it up','Then curl','up and over','far corner']},
];
import timingJson from '../../../public/plays/narration/kroos-sweden-2018/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('kroos: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kroos: no cue '+w);return c.at;};
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
/** Pitch: the goal line Sweden defends is x = 0 (Germany attack +x), the goal centre z = 0, +z = the attacker's right; the free kick is on
 * the LEFT (z < 0), the TV camera on that side (z ≈ −60). */
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

// ---------------------------------------------------------------- Fisht at night: navy sky, white roof shells, floodlights, crowd
/** stand planes (a along, b up the rake 0..1): 0 the far side (z > 0), 1 behind the goal, 2 the near side (the camera's, z < 0), 3 the
 * other end. The two long sides carry Fisht's white roof shells. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.4+22*b,41+30*b],
 (a,b)=>[9+26*b,1.4+17*b,lerp(-58,58,a)],
 (a,b)=>[lerp(14,-118,a),1.4+22*b,-41-30*b],
 (a,b)=>[-113-26*b,1.4+17*b,lerp(58,-58,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=13,WALK=.5;
/** the roof shell over a long side at a (0..1 along): rises from the back row and arches over the stand, higher in the middle */
const shell=(i:number,a:number,v:number):V3=>{const S=STANDS[i],top=S(a,1),front=S(a,.42),arch=7*Math.sin(Math.PI*a);return[lerp(top[0],front[0],v),top[1]+3+arch*.6+(9+arch)*v*(1.25-v),lerp(top[2],front[2],v)];};
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a wild night: a deep navy print, a faint blue glow over the bowl
 s.tone(K,polyPath([[-1e4,-1e4],[1e4,-1e4],[1e4,1e4],[-1e4,1e4]],true),.86);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.35);
 const planes=new Path2D(),walk=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));seg3(c,S(0,WALK),S(1,WALK),.6,walk);}
 s.tone(B,planes,.3);s.knockout(walk,.55);
 // the crowd: seeded dots (German white, Swedish yellow, a little red and blue), sized by distance; roar lifts them
 const dots=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],any=[0,0,0,0];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.04)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/q[2],2.4,14),lift=roar>0?roar*z*1.2*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.62?0:h<.9?1:h<.96?2:3;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}}
 if(any[0])s.knockout(dots[0],.75);if(any[1])s.fill(Y,dots[1],.95);if(any[2])s.fill(R,dots[2],.9);if(any[3])s.fill(B,dots[3],.95);
 // the white roof shells over the long sides, ribbed, lit from below; floodlight strips along the lip
 const sh=new Path2D(),rib=new Path2D(),lamp=new Path2D(),halo=new Path2D();let nl=0;
 for(const i of which){if(i!==0&&i!==2)continue;const n=10;
  for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n;addPoly(sh,polyP(c,[shell(i,a0,0),shell(i,a1,0),shell(i,a1,.5),shell(i,a1,1),shell(i,a0,1),shell(i,a0,.5)]));seg3(c,shell(i,a0,0),shell(i,a0,1),.5,rib);}
  for(let k=0;k<7;k++){const P=shell(i,(k+.5)/7,.98),q=toCam(c,P);if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx+300||Math.abs(p[1])>v.hy+300)continue;
   const w=clamp(c.F*1.5/q[2],3,80),hh=w*.4;lamp.rect(p[0]-w,p[1]-hh,w*2,hh*2);const r=w*3;halo.addPath(polyPath(blob(p[0],p[1]+r*.35,r,r*.8,i*9+k,{amp:.08,n:14}),true));nl++;}}
 s.knockout(sh,.9);s.tone(B,sh,.16);s.fill(K,rib,.45);
 if(nl){s.knockout(halo,.2);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.55);}
 if(flash>0){const p=new Path2D();let n=0;for(let i=0;i<Math.round(22*flash);i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q||Math.abs(q[0])>v.hx||Math.abs(q[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));n++;}if(n){s.knockout(p);s.fill(Y,p,.95);}}
}
// ---------------------------------------------------------------- grass, lines, LED boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.82);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.14);
 // LED boards behind the goal and along both touchlines: blue with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6.5,0,-36],[6.5,0,36]);board([-110,0,-38],[6.5,0,-38]);board([-110,0,38],[6.5,0,38]);
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[6.45,.25,z],[6.45,.25,z+3.4],[6.45,.68,z+3.4],[6.45,.68,z]]));}
 for(const zz of[-37.95,37.95])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(B,bd,.95);s.fill(K,bd,.3);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
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
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out at the top-RIGHT corner (z +3) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=3,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2));
 const zs=[z0,-1.8,0,1.8,3,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the strike)
/** where Reus stops it (the strike spot): just outside the box, level with its left edge */
const B1:V3=[-17.2,.11,-19.6];
/** the target: the far top corner (Kroos's right), just under the bar and inside the far post */
const TGT:V3=[0,2.12,2.95];
const CHX=TGT[0]-B1[0],CHZ=TGT[2]-B1[2],DG=Math.hypot(CHX,CHZ);
/** the chord (ball → corner) and its right-hand side on the ground */
const CR:[number,number]=[-CHZ/DG,CHX/DG];
/** the bend: the ball leaves heading right of the far post and swings back left, tightening late (metres right of the chord) */
const BOW=8;
const off=(u:number)=>BOW*u*(1-u)*(.6+.8*u);
/** height: a parabola in u through the corner, peaking ≈ 3.1 m (over the heads in the box) */
const [HA,HB]=(()=>{const y1=TGT[1]-.11,pk=3;const a=2*pk+Math.sqrt(4*pk*pk-4*pk*y1);return[a,a-y1];})();
const hAt=(u:number)=>.11+HA*u-HB*u*u;
const flightU=(u:number):V3=>{const o=off(u);return[B1[0]+CHX*u+CR[0]*o,hAt(u),B1[2]+CHZ*u+CR[1]*o];};
/** straight on: the first heading kept, no bend (the lesson's "where it was heading": wide of the far post) */
const straightU=(u:number):V3=>{const o=BOW*.6*u;return[B1[0]+CHX*u+CR[0]*o,hAt(u),B1[2]+CHZ*u+CR[1]*o];};
/** the initial heading and its right (ground plane) */
const H0:[number,number]=(()=>{const x=CHX+CR[0]*BOW*.6,z=CHZ+CR[1]*BOW*.6,l=Math.hypot(x,z);return[x/l,z/l];})();
const R0:[number,number]=[-H0[1],H0[0]];
/** a point in the shot's frame from o: f forward along the first heading, r to its right, y up (absolute) */
const LOC=(o:V3,f:number,r:number,y:number):V3=>[o[0]+H0[0]*f+R0[0]*r,y,o[2]+H0[1]*f+R0[1]*r];
const FLY=1.1;// ≈ 29 m in 1.1 s ("fizzed ... like a rocket")
const uAt=(tau:number)=>{const u=clamp(tau/FLY);return u*(1.25-.25*u);};
const tauAtU=(u:number)=>{const k=clamp(u);return FLY*(1.25-Math.sqrt(1.5625-k))/.5;};
const GOAL_PT=flightU(1),NET_HIT:V3=[1.65,1.8,3.05],REST:V3=[1.2,.11,2.55],IN_NET=FLY+.13;

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
const germany=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
const sweden=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],shorts:K,socks:B,boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:Y,numberInk:Y,hairStyle:'short',...o});
const KROOS_B={height:1.83,bulk:.96};
const KROOS_ST=germany({number:8,hair:[Y,.7],build:KROOS_B,seed:8});
const REUS_B={height:1.8,bulk:.95};
const REUS_ST=germany({number:11,hair:[Y,.95],build:REUS_B,seed:11});
const KEEPER_ST:AthleteStyle={shirt:[R,.92],shorts:[R,.92],socks:[R,.92],boots:K,skin:SKIN_L,hair:[Y,.85],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.98,bulk:1.02},seed:16};

// ---------------------------------------------------------------- Kroos: over the ball, the tap, two steps, the strike, the run
/** approach from the LEFT of the ball (≈ 26° off the first heading), so the right leg sweeps across the back of it */
const APP=26*Math.PI/180;
const DIR:[number,number]=[H0[0]*Math.cos(APP)+R0[0]*Math.sin(APP),H0[1]*Math.cos(APP)+R0[1]*Math.sin(APP)];
const RIGHT:[number,number]=[-DIR[1],DIR[0]];
const YAW_K=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.3,RUN_L=.85,STRIKE_L=1.6,T_TAP=-1.75,T_STOP=-1.12,T_LIFT=-.8;
/** where Kroos's pelvis stands at contact so the inside of his RIGHT boot meets the ball's right-back side (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT),KROOS_B,{x:0,z:0,yaw:YAW_K}),toe:[number,number]=[B1[0]-DIR[0]*.12+RIGHT[0]*.06,B1[2]-DIR[1]*.12+RIGHT[1]*.06];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
/** his mark over the ball, and the free-kick spot at his right foot there (the tap rolls it ≈ 1.8 m on to Reus) */
const S0:[number,number]=[PC[0]-DIR[0]*(RUN_L+STRIKE_L),PC[1]-DIR[1]*(RUN_L+STRIKE_L)];
const B0:V3=[S0[0]+DIR[0]*.42+RIGHT[0]*.14,.11,S0[1]+DIR[1]*.42+RIGHT[1]*.14];
function ballAt(tau:number):V3{
 if(tau<=T_TAP)return B0;
 if(tau<T_STOP)return mix3(B0,B1,easeOut((tau-T_TAP)/(T_STOP-T_TAP))*.93+.07*clamp((tau-T_TAP)/(T_STOP-T_TAP)));
 if(tau<=0)return B1;
 if(tau<FLY)return flightU(uAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?(tau>T_TAP&&tau<T_STOP?TAU*2*(tau-T_TAP):0):TAU*9*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));
/** over the ball, hands on hips; the tap (a short side-foot push with the right); ready to go */
const K_SET=posed({lHipF:-4,rHipF:10,lKnee:12,rKnee:16,lean:10,pitch:2,neckP:10,lShA:44,rShA:44,lShF:-18,rShF:-18,lElb:112,rElb:112,lShR:30,rShR:30,twist:-4});
const K_WIND=posed({lHipF:8,rHipF:-14,rHipR:34,rKnee:30,lKnee:22,rAnk:-6,lean:14,pitch:3,neckP:30,lShA:34,rShA:28,lShF:10,rShF:-12,lElb:40,rElb:40,twist:6});
const K_TAP=posed({lHipF:6,rHipF:26,rHipR:44,rHipA:6,rKnee:16,rAnk:-12,lKnee:24,lean:14,pitch:3,neckP:32,lShA:38,rShA:30,lShF:-8,rShF:14,lElb:40,rElb:44,twist:-8});
const K_READY=posed({lHipF:-18,rHipF:22,lKnee:26,rKnee:32,lAnk:18,rAnk:-6,lean:16,pitch:5,neckP:20,lShA:30,rShA:26,lShF:-10,rShF:14,lElb:40,rElb:46,twist:-10});
/** the run afterwards: toward the near touchline, arms out (inferred) */
const P_AFTER:[number,number]=[PC[0]+DIR[0]*.9,PC[1]+DIR[1]*.9],CORNER:[number,number]=[-7.5,-30.5];
const RUN_T0=1.3,CL=Math.hypot(CORNER[0]-P_AFTER[0],CORNER[1]-P_AFTER[1]);
function celebS(tau:number){const u=tau-RUN_T0;if(u<=0)return 0;const s=u<.6?7*u*u/1.2:7*(u-.3),a=CL-3.2;return s<a?s:a+3.2*(1-Math.exp(-(s-a)/3.2));}
function celebPos(tau:number):[number,number]{const s=celebS(tau)/CL;return[lerp(P_AFTER[0],CORNER[0],s),lerp(P_AFTER[1],CORNER[1],s)];}
const CELEB_YAW=yawTo(P_AFTER[0],P_AFTER[1],CORNER[0],CORNER[1]);
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function kroosPose(tau:number,ready=1,it=0):Pose{
 if(tau<=T_RUN0){
  const br=.5+.5*Math.sin(it*2.2);let p=blendPose(K_SET,K_WIND,ready*sm(T_TAP-.45,T_TAP-.12,tau));
  if(tau>T_TAP-.12)p=blendPose(p,K_TAP,sm(T_TAP-.12,T_TAP+.02,tau)*(1-sm(T_TAP+.1,T_TAP+.35,tau)));
  if(tau>T_TAP+.1)p=blendPose(p,K_READY,sm(T_TAP+.1,T_RUN0,tau));
  p.lean+=.03*br*(1-ready);p.neckP+=.04*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(K_READY,runCycle(1.6*Math.pow(u,.9),{speed:.5+.3*u}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(1.6+(tau-RUN_END)*1.6,{speed:.75});
 let p=blendPose(run,strike(Math.min(1,us),{power:.95}),sm(RUN_END,RUN_END+.14,tau));
 const lo=sm(RUN_END,-.05,tau)*(1-sm(.12,.5,tau));p.lean+=.1*lo;p.neckP+=.1*lo;
 if(tau>RUN_T0-.35){const s=celebS(tau);p=blendPose(p,celebrate(s/4.3,{kind:'run'}),sm(RUN_T0-.35,RUN_T0+.25,tau));}
 return p;
}
function kroosPlace(tau:number):Place{
 let g:number;
 if(tau<=T_RUN0)g=-(RUN_L+STRIKE_L);
 else if(tau<RUN_END)g=-(RUN_L+STRIKE_L)+RUN_L*Math.pow(runU(tau),1.2);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.55*v+.45*(1-(1-v)*(1-v)));}
 else g=.9*(1-Math.pow(1-clamp(tau/.7),2));
 const x=PC[0]+DIR[0]*g,z=PC[1]+DIR[1]*g;
 if(tau<RUN_T0-.35)return{x,z,yaw:YAW_K};
 const[cx,cz]=celebPos(tau);
 return{x:cx,z:cz,yaw:lerpAng(YAW_K,CELEB_YAW,sm(RUN_T0-.35,RUN_T0+.3,tau))};
}
// ---------------------------------------------------------------- Reus: faces Kroos a stride beyond the spot, stops it under his sole, steps aside
/** he faces back toward Kroos from the infield side of the ball (so the tap goes across, infield) */
const YAW_R=yawTo(0,0,-DIR[0]-RIGHT[0]*.9,-DIR[1]-RIGHT[1]*.9);
const R_STOP=posed({rHipF:36,rKnee:34,rAnk:-24,rHipR:8,lKnee:26,lHipF:6,lean:12,pitch:3,neckP:34,lShA:34,rShA:26,lShF:8,rShF:-10,lElb:34,rElb:30});
const R_WAIT=posed({lHipF:14,rHipF:10,lKnee:22,rKnee:20,lean:12,pitch:3,neckP:24,lShA:20,rShA:20,lElb:40,rElb:40});
/** Reus's pelvis at the stop so his right sole sits on top of the ball at B1 */
const PR:[number,number]=(()=>{const sk=solve(R_STOP,REUS_B,{x:0,z:0,yaw:YAW_R});return[B1[0]-sk.rToe[0]+DIR[0]*.05,B1[2]-sk.rToe[2]+DIR[1]*.05];})();
function reusAt(tau:number,it:number):{pose:Pose;place:Place}{
 const br=Math.sin(it*2.1+.4);let p=blendPose(R_WAIT,stand(),.3+.15*br);
 // the sole goes onto the ball as it arrives, lifts off, then he steps aside (to his left) and turns to watch it fly
 p=blendPose(p,R_STOP,sm(T_STOP-.28,T_STOP-.02,tau)*(1-sm(T_LIFT,T_LIFT+.2,tau)));
 const side=sm(T_LIFT,T_LIFT+.55,tau,easeInOutSine),st=Math.sin(Math.PI*side);
 if(st>.01)p=blendPose(p,runCycle(side*.9,{speed:.3}),st*.7);
 p.neckY=(-50*sm(-.05,.5,tau))*Math.PI/180;
 if(tau>1.3)p=blendPose(p,celebrate(it*.9,{kind:'arms'}),sm(1.3,1.7,tau));
 const x=PR[0]+RIGHT[0]*1.1*side-DIR[0]*.3*side,z=PR[1]+RIGHT[1]*1.1*side-DIR[1]*.3*side;
 return{pose:p,place:{x,z,yaw:lerpAng(YAW_R,yawTo(x,z,TGT[0],TGT[2]),sm(-.1,.5,tau))}};
}

// ---------------------------------------------------------------- everyone else
type Role='wall'|'keeper'|'def'|'att';
type Actor={role:Role;st:AthleteStyle;x:number;z:number;phase:number;chase?:[number,number,number]};
/** the wall, lined up 9.15 m from the free-kick spot toward the near post */
const ND:[number,number]=(()=>{const x=0-B0[0],z=-3.66-B0[2],l=Math.hypot(x,z);return[x/l,z/l];})();
const WC:[number,number]=[B0[0]+ND[0]*9.15,B0[2]+ND[1]*9.15];
const wallAt=(k:number):[number,number]=>[WC[0]-ND[1]*.55*k,WC[1]+ND[0]*.55*k];
const ACTORS:Actor[]=[
 {role:'wall',st:sweden({number:21,hair:K,skin:SKIN_M,build:{height:1.73},seed:10}),x:wallAt(-1)[0],z:wallAt(-1)[1],phase:.1},
 {role:'wall',st:sweden({number:7,build:{height:1.78},seed:11}),x:wallAt(0)[0],z:wallAt(0)[1],phase:.6},
 {role:'wall',st:sweden({number:10,hair:K,build:{height:1.77},seed:12}),x:wallAt(1)[0],z:wallAt(1)[1],phase:.3},
 {role:'keeper',st:KEEPER_ST,x:-.7,z:-1.5,phase:0},
 {role:'def',st:sweden({number:4,build:{height:1.92,bulk:1.06},seed:14}),x:-9.4,z:-4.6,phase:.4},
 {role:'def',st:sweden({number:3,build:{height:1.87},seed:15}),x:-8.8,z:-.9,phase:.9},
 {role:'def',st:sweden({number:2,build:{height:1.89},seed:17}),x:-9.9,z:2.6,phase:.5},
 {role:'def',st:sweden({number:6,build:{height:1.82},seed:18}),x:-7.3,z:5.2,phase:.2},
 {role:'def',st:sweden({number:11,hair:K,build:{height:1.85},seed:19}),x:-11.6,z:-2.3,phase:.7},
 {role:'att',st:germany({number:13,build:{height:1.86},seed:21}),x:-10.3,z:-3,phase:.2,chase:[.25,-.6,1.4]},
 {role:'att',st:germany({number:23,build:{height:1.89,bulk:1.06},hair:K,skin:SKIN_M,seed:22}),x:-9.2,z:.9,phase:.7,chase:[.4,-1.4,-1.2]},
 {role:'att',st:germany({number:9,build:{height:1.81},seed:23}),x:-11.1,z:4.3,phase:.35,chase:[.55,-2.2,1]},
 {role:'att',st:germany({number:20,skin:SKIN_D,build:{height:1.85},seed:24}),x:-8.1,z:6.8,phase:.85,chase:[.7,-2.6,-.4]},
];
const WALL_P=posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lHipA:3,rHipA:3,lShF:30,rShF:30,lShA:-10,rShA:-10,lElb:46,rElb:46,lean:6,neckP:4});
const WALL_J=posed({lHipF:36,rHipF:30,lKnee:74,rKnee:66,lAnk:46,rAnk:46,lShF:22,rShF:22,lShA:-6,rShA:-6,lElb:54,rElb:54,lean:12,air:.38,neckP:-24});
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const JUMP=posed({lHipF:30,rHipF:26,lKnee:60,rKnee:54,lAnk:40,rAnk:40,lShA:70,rShA:70,lShF:40,rShF:40,lElb:40,rElb:40,lean:-4,air:.3,neckP:-40});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const CD:[number,number]=[(CORNER[0]-P_AFTER[0])/CL,(CORNER[1]-P_AFTER[1])/CL];
function chaseEnd(a:Actor):[number,number]{const[,al,sd]=a.chase??[0,0,0];return[CORNER[0]+CD[0]*al-CD[1]*sd,CORNER[1]+CD[1]*al+CD[0]*sd];}
function chaseS(a:Actor,tau:number){const E=chaseEnd(a),L=Math.hypot(E[0]-a.x,E[1]-a.z),u=tau-1.4-(a.chase?.[0]??0);if(u<=0)return 0;const s=u<.6?6.8*u*u/1.2:6.8*(u-.3),b=Math.max(0,L-3);return s<b?s:b+(L-b)*(1-Math.exp(-(s-b)/Math.max(.1,L-b)));}
/** where the ball crosses nearest an actor (for heads following it) */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const bp=ballAt(Math.max(-2,Math.min(tau,FLY))),toBall=yawTo(a.x,a.z,bp[0],bp[2]),br=Math.sin(it*2.1+a.phase*TAU);
 if(a.chase&&tau>1.3){const w=sm(1.3,1.8,tau),q=(tt:number):[number,number]=>{const E=chaseEnd(a),L=Math.hypot(E[0]-a.x,E[1]-a.z)||1,u=chaseS(a,tt)/L;return[lerp(a.x,E[0],u),lerp(a.z,E[1],u)];};
  const p0=q(tau),p1=q(tau+.06),sp=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])/.06,dist=chaseS(a,tau);
  let pose=blendPose(runCycle(dist/4.4+a.phase,{speed:clamp(sp/7)}),celebrate(it*.9+a.phase,{kind:'arms'}),clamp(1-sp/2.2));
  pose=blendPose(blendPose(DEF_P,stand(),.4),pose,w);
  return{pose,place:{x:p0[0],z:p0[1],yaw:sp>1.2?yawTo(p0[0],p0[1],p1[0],p1[1]):yawTo(p0[0],p0[1],...celebPos(tau))}};}
 switch(a.role){
  case 'wall':{
   // they break toward the ball after the tap, then jump as it is struck, heads snapping round as it goes by
   const brk=sm(T_TAP+.15,T_TAP+1.2,tau),step=Math.sin(Math.PI*clamp((tau-T_TAP-.15)/1.05));let p=blendPose(WALL_P,stand(),.25+.12*br);
   if(step>.01)p=blendPose(p,runCycle((tau-T_TAP)*1.8+a.phase,{speed:.45}),step*.8);
   const j=tau<-.1?0:Math.sin(Math.PI*clamp((tau+.1)/.62));p=blendPose(p,WALL_J,j);
   p.neckY=(-55*sm(.1,.45,tau)*(1-sm(.9,1.5,tau)))*Math.PI/180;if(tau>1.3)p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.8);
   const x=a.x-ND[0]*1.4*brk,z=a.z-ND[1]*1.4*brk;
   return{pose:p,place:{x,z,yaw:lerpAng(yawTo(a.x,a.z,B0[0],B0[2]),toBall,sm(T_TAP,0,tau))}};}
  case 'keeper':{
   // set, a shuffle toward the middle as the ball is rolled across, then the full-stretch dive to his LEFT (+z): too late
   let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.4,-.12,tau));
   const dv=clamp((tau-.5)/1.25);if(tau>.5)p=blendPose(p,keeperDive(dv,{side:'l',height:.9}),sm(.5,.58,tau));
   if(tau>1.9)p=blendPose(p,SLUMP,sm(1.9,2.6,tau)*.7);
   const sh=.3*sm(T_TAP+.2,-.1,tau),yaw=lerpAng(yawTo(a.x,a.z+sh,B1[0],B1[2]),Math.PI,sm(.3,.55,tau));
   return{pose:p,place:{x:a.x,z:a.z+sh,yaw}};}
  case 'def':{
   let p=blendPose(DEF_P,stand(),.3+.2*br);p.air+=.012*Math.max(0,br);
   // the ones under the flight jump for it; heads follow the ball
   const d=Math.hypot(a.x-flightU(.6)[0],a.z-flightU(.6)[2]);if(d<4.5){const j=Math.sin(Math.PI*clamp((tau-.35)/.55));if(j>0)p=blendPose(p,JUMP,j*.9);}
   if(tau>1.3)p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.6);
   return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
  default:{let p=blendPose(stand(),DEF_P,.4+.2*br);if(tau>.05){p=blendPose(p,runCycle((tau-.05)*1.3+a.phase,{speed:.5}),sm(.05,.35,tau)*(1-sm(1.1,1.4,tau)));}
   const run=tau>.05?Math.min(2,(tau-.05)*3):0,toGoal=yawTo(a.x,a.z,0,0);
   return{pose:p,place:{x:a.x+run*Math.cos(toGoal),z:a.z-run*Math.sin(toGoal),yaw:lerpAng(toBall,toGoal,sm(0,.6,tau))}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the tap, the strike, the run). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;ready:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=kroosPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=kroosPose(tp,e.ready,e.it),prev={pose:kroosPose(tpp,e.ready,e.it-1/12),place:kroosPlace(tpp)};
  drawPlayer(s,pose,c,detailFor(KROOS_ST,d,true),pl,prev,!!e.smear&&((tp>RUN_END+.2&&tp<.45)||(tp>RUN_T0+.2)));}});}
 {const cur=reusAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=reusAt(tpp,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(REUS_ST,d,true),cur.place,prev);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpp,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='keeper'),cur.place,prev,!!e.smear&&a.role==='keeper'&&tp>.4&&tp<1.3);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const kxz=(tau:number):V3=>{const p=kroosPlace(tau);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** the strike lands so the ball reaches the net just after "Goal"; before the tap Kroos waits over the ball; real time throughout */
const tS1=()=>Math.max(CUE(0,'Goal')-IN_NET+.12,CUE(0,'taps it')-T_TAP);
const T_WAIT=T_TAP-.5;
const tau1=(t:number)=>Math.max(T_WAIT,t-tS1());
const P1:V3=[-19,19,-63];
function cam1(t:number):Cam{
 const tau=tau1(t),tT=tS1()+T_TAP;
 return plan(t,[
  [0,0,()=>({P:P1,T:[-11,0,-5],fov:36})],
  [CUE(0,'Germany and')-.2,1.2,()=>({P:P1,T:[-9.6,.9,.6],fov:14})],
  [CUE(0,'time is almost')-.25,.9,()=>({P:P1,T:[-.8,1.2,-.4],fov:7})],
  [CUE(0,'A free kick')-.1,1,()=>({P:P1,T:add3(mix3(B0,B1,.5),[0,.8,0]),fov:8})],
  [CUE(0,'wide on the left')-.05,1.1,()=>({P:P1,T:[-9.5,.6,-9],fov:24})],
  [CUE(0,'Toni Kroos')-.25,.8,()=>({P:P1,T:add3(mix3(kxz(tau),B1,.35),[0,.9,0]),fov:6})],
  [Math.max(tT-.4,CUE(0,'Toni Kroos')+.5),.8,()=>({P:P1,T:add3(mix3(B0,B1,.6),[0,.8,0]),fov:9})],
  [tS1()-.05,.95,()=>({P:P1,T:[-7,1.6,-4.5],fov:20})],
  [tS1()+FLY-.25,.8,()=>({P:P1,T:[-.5,1.5,1.5],fov:12})],
  [tS1()+RUN_T0+.4,1.4,()=>({P:P1,T:add3(kxz(tau),[0,1,1]),fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal'),tN=tS1()+IN_NET;
  const ready=sm(CUE(0,'Toni Kroos'),CUE(0,'Toni Kroos')+.6,t);
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(Math.max(g,tN),Math.max(g,tN)+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,ready,minBall:15,lines:true,prevT:tau1(t-.06),hero:'mid'});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind Kroos: tap, stop, rise, swing wide, bend back
const tau2=(t:number)=>key(t,mono([[0,T_TAP-.35],[CUE(1,'The little'),T_TAP-.05],[CUE(1,'opens'),T_STOP+.1],[CUE(1,'rises')-.4,.02],[CUE(1,'rises')+.35,tauAtU(.3)],[CUE(1,'swings wide'),tauAtU(.62)],[CUE(1,'bends back'),tauAtU(.9)],[SECS(1)-.9,IN_NET+.1],[SECS(1),IN_NET+.8]]),linear);
const E2:V3=LOC(B1,-11,-.6,3.1);
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>{const u=sm(T_RUN0,.9,tau,easeInOutSine),T=mix3(LOC(B1,5,-.3,.5),LOC(B1,17,.8,1.6),sm(-.05,.9,tau,easeInOutSine));return{P:mix3(E2,add3(E2,[0,.9,0]),u),T:mix3(T,b,.15*sm(0,.2,tau)*(1-sm(.8,1,tau))),fov:lerp(30,24,u)};}],
  [CUE(1,'swings wide')-.2,.9,()=>({P:add3(E2,[0,.9,0]),T:add3(flightU(.72),[0,-.2,0]),fov:14})],
  [CUE(1,'bends back')-.25,.9,()=>({P:add3(E2,[0,.9,0]),T:[-.2,1.8,2.6],fov:9})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the bend so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.7),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · the reverse-angle replay from behind the goal: Olsen flies, too late
const tau3=(t:number)=>key(t,mono([[0,-.45],[CUE(2,'From behind')+.5,.05],[CUE(2,'keeper flies'),.55],[CUE(2,'too late'),FLY-.12],[CUE(2,'Top corner'),IN_NET],[SECS(2),IN_NET+.9]]),linear);
/** low behind the far post (below the bar): the ball in the top corner reads clearly ABOVE the diving keeper */
const E3:V3=[5.6,1.45,8.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([-12,1.4,-10],b,.35*sm(0,.5,tau)),fov:34})],
  [CUE(2,'keeper flies')-.3,.9,()=>({P:add3(E3,[-.8,0,-.6]),T:[-2.5,1.4,.8],fov:22})],
  [CUE(2,'Top corner')-.35,.9,()=>({P:add3(E3,[-1.2,0,-.9]),T:[-.4,1.6,2],fov:17})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tC=CUE(2,'Top corner');
  stadium(s,c,t,[2,3],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.6),Math.min(tau,FLY+.001),18),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:12});
  // "Top corner!": a yellow burst where it went in
  const hit=sm(tC-.05,tC+.35,t);if(hit>0&&hit<1){const q=pr(c,[0,2.1,2.95]);if(q)sparkBurst(s,Y,q[0],q[1],90+150*hit,{n:10,seed:23,g:easeOutBack(hit),width:12});}
 },
 aperture(t){const c=cam3v(t),P=ballAt(Math.min(tau3(t),IN_NET)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/Math.max(NEAR,q[2])*1.3),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 4 · the lesson: tight angle → short pass → the new angle → curl it up, over and into the far corner
const tau4=(t:number)=>key(t,mono([[0,T_TAP-.45],[CUE(3,'Pass it'),T_TAP-.05],[CUE(3,'open it'),T_STOP+.15],[CUE(3,'Then curl')-.3,-.35],[CUE(3,'Then curl')+.25,.003],[CUE(3,'up and'),tauAtU(.45)],[CUE(3,'far corner'),FLY-.08],[SECS(3),IN_NET+.4]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:LOC(B0,-9,-2.5,9.5),T:LOC(B0,13,2.2,0),fov:46})],
  [CUE(3,'Then curl')-.45,.9,()=>({P:LOC(B1,-4.6,-3.4,2.1),T:LOC(B1,1.2,.2,.55),fov:40})],
  [CUE(3,'up and')-.3,1.1,()=>({P:LOC(B1,-18,-3,14),T:LOC(B1,17,1.8,1),fov:34})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** the shooting angle from a spot: a flat wedge on the grass to the two posts */
function wedge(c:Cam,o:V3):Path2D{const p=new Path2D();addPoly(p,polyP(c,[[o[0],.02,o[2]],[0,.02,-3.66],[0,.02,3.66]]));return p;}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tA=CUE(3,'A tight'),tP=CUE(3,'Pass it'),tO=CUE(3,'open it'),tC=CUE(3,'Then curl'),tU=CUE(3,'up and'),tF=CUE(3,'far corner');
  stadium(s,c,t,[0,1]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · "A tight angle?": the thin red wedge from the free-kick spot, 2 · "open it up": the yellow wedge from where Reus stops it
  const wa=sm(tA-.15,tA+.4,t)*(1-sm(tC-.6,tC-.2,t)),wb=sm(tO-.15,tO+.4,t)*(1-sm(tC-.5,tC-.1,t));
  if(wa>.02){const p=wedge(c,B0);s.knockout(p,.6*wa);s.fill(R,p,.55*wa);s.stroke(R,p,3,.95*wa);}
  if(wb>.02){const p=wedge(c,B1);s.knockout(p,.7*wb);s.fill(Y,p,.8*wb);s.stroke(K,p,2.4,.8*wb);}
  // 3 · the curl: where it was heading (straight, dashed) and the real bend so far
  const cv=sm(tU-.3,tU+.4,t);
  if(cv>.02){const str=new Path2D(),n=18;for(let i=0;i<n;i+=2){const a=pr(c,straightU(i/n*cv*1.05)),b=pr(c,straightU((i+1)/n*cv*1.05));if(a&&b)str.addPath(ribbon([a,b],Math.max(12,kAt(c,straightU(i/n))*.2),{taper:.25,wobble:0}));}
   s.knockout(str);s.stroke(K,str,2.4,.9);}
  if(tau>0){const pts=partial(pathPts(c,0,FLY,40),clamp(tau/FLY)),w=Math.max(15,kAt(c,flightU(.5))*.24);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95);}}
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:14});
  // "Pass it short": the little pass arrow from the spot to Reus
  const pa=sm(tP-.1,tP+.4,t,easeOut)*(1-sm(tC-.4,tC,t));
  if(pa>.02){const a=add3(B0,[0,.25,0]),b=add3(B1,[0,.25,0]);arrow3(s,c,[a,mix3(a,b,.5*pa),mix3(a,b,.9*pa)],Math.max(7,kAt(c,B1)*.08),Y,.95);}
  // the spin at the strike: two arrows circling the ball's equator (its right side goes forward → it bends left)
  const sp=sm(tC-.05,tC+.4,t,easeOutBack)*(1-sm(tU+.1,tU+.6,t));
  if(sp>.02){const P=ballAt(Math.min(tau,FLY)),rad=.11*2.3,rot=spinAt(tau)*.15;for(const k of[0,1]){const pts:V3[]=[];for(let i=0;i<=10;i++){const th=rot+k*Math.PI+i/10*Math.PI*.72*sp;pts.push([P[0]+Math.cos(th)*rad,P[1],P[2]-Math.sin(th)*rad]);}
   arrow3(s,c,pts,Math.max(5,kAt(c,P)*.035),Y,.95);}}
  // "up and over": an up arrow over the heads in the box; "far corner": a ring on the far top corner and the arrow down into it
  const up=sm(tU-.05,tU+.45,t,easeOutBack);
  if(up>.02){const P=flightU(.5);arrow3(s,c,[add3(P,[0,-1.6,0]),add3(P,[0,-1.6+1.2*up,0]),add3(P,[0,-1.6+1.9*up,0])].map(p=>[p[0]-H0[0]*1.2,p[1],p[2]-H0[1]*1.2] as V3),Math.max(10,kAt(c,P)*.2),R,.95*(1-sm(tF+.6,tF+1.2,t)));}
  const dn=sm(tF-.05,tF+.5,t,easeOutBack);
  if(dn>.02){const P=flightU(.8),G=flightU(.985);arrow3(s,c,[add3(P,[0,1.2,0]),mix3(add3(P,[0,1.2,0]),add3(G,[0,.5,0]),.5*dn),mix3(add3(P,[0,1.2,0]),add3(G,[0,.5,0]),dn)],Math.max(10,kAt(c,P)*.2),R,.95);
   const ring:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,[0,TGT[1]+Math.sin(a)*.42*dn,TGT[2]+Math.cos(a)*.42*dn]);if(p)ring.push(p);}
   if(ring.length>20){const rr=ribbon(ring,Math.max(5,kAt(c,TGT)*.08),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9);s.fill(Y,rr,.95);}}
 },
 still:9,
};

const film:RisoStory={
 id:'kroos-sweden-2018',format:'11v11',title:"Kroos's free kick v Sweden",
 theme:'Free kicks: when the angle is too tight, a short pass can open a better one; then curl it up and over into the far corner',
 ageNote:'Germany 2–1 Sweden, 2018 World Cup, Fisht Olympic Stadium, Sochi, 23 June 2018. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little pass and a curler — a short yellow tap, then a path that rises, swings out and bends back, a spinning ball on its tip. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+30+90*k-150*k*k,y-260*k+120*k*k]);}
  s.fill(Y,ribbon([[x-40,y+20],[x+30,y]],10,{seed,taper:.6,wobble:.6}),.9*fade);
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x+30,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],34,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
