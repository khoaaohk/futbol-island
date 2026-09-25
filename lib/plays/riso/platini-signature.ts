/** Michel Platini's signature: the curled free kick — France 3–2 Yugoslavia, UEFA Euro 1984, Group 1, Stade Geoffroy-Guichard,
 * Saint-Étienne, 19 June 1984 (the 77th-minute free kick that completed his "perfect hat-trick").
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * lib/town/iconicPlays.json lists Platini as kind "signature" ("the curled free kick"; lesson: curl it over the wall by striking the side of
 * the ball). WHY THIS MOMENT: of his Euro 1984 free kicks it is the one the sources describe as exactly this signature — "a direct free kick
 * which looped over the wall and into the top corner" — struck with his RIGHT foot (French Wikipedia: the hat-trick came "du gauche, de la
 * tête et pour finir du droit sur coup franc direct"). His better-known free kick in the final v Spain (27 June 1984) was a LOW shot that
 * curled around the wall and squirmed under Luis Arconada — a goalkeeping error, not the over-the-wall curl the lesson teaches, so it was
 * not chosen. A 1:1 reconstruction from written accounts (we cannot watch the footage), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 with curl; cached in scratchpad/films/src-cache):
 *  - Wikipedia, "UEFA Euro 1984 Group 1" (raw wikitext: France 3–2 Yugoslavia, 19 June 1984, 20:30, Stade Geoffroy-Guichard, Saint-Étienne,
 *    47,510, referee André Daina (Switzerland); Platini 59', 62', 77'; Šestić 32', D. Stojković 84' pen.; line-ups; both kit templates)
 *    https://en.wikipedia.org/wiki/UEFA_Euro_1984_Group_1
 *  - Wikipedia, "UEFA Euro 1984 final" (raw wikitext, route to the final, after O'Brien 2021 p.130): Yugoslavia led 1–0; Platini levelled
 *    (a shot under Simović), then a diving header, "before Platini completed his second hat-trick of the tournament when he scored with a
 *    direct free kick which looped over the wall and into the top corner of the Yugoslavia goal". Also the final (why it was not chosen).
 *    https://en.wikipedia.org/wiki/UEFA_Euro_1984_final
 *  - Wikipédia (fr), "Championnat d'Europe de football 1984" and "Michel Platini" (raw wikitext): the "coup du chapeau parfait" — three
 *    consecutive goals in one half, left foot, head, then right foot from a direct free kick; his free kicks "contournent le mur ... en une
 *    courbe ... pour aller se loger dans la lucarne" (curl round the wall into the top corner).
 *  - BBC Sport, Stephan Shemilt, "Euro 1984: Michel Platini at his peak inspires France" (12 May 2012): two hat-tricks in the group, nine goals.
 *  - The Guardian, Steven Pye, "How France hosted and won Euro 1984" (10 June 2016): "Platini scoring another hat-trick in a 3-2 win".
 *  - Wikimedia Commons kit patterns Kit_body_france78a.png / Kit_shorts_yugoslavia84.png (the template's Yugoslavia kit for this match).
 * CONFIRMED by those pages: 19 June 1984, Stade Geoffroy-Guichard, Saint-Étienne; France v Yugoslavia at Euro 1984; Yugoslavia 1–0 up
 *  (Šestić 32'); Platini 59' (left foot), 62' (diving header), 77' (direct free kick, RIGHT foot) — a perfect hat-trick; the free kick looped
 *  over the wall into the top corner; France won 3–2. Numbers: Platini 10 (captain), Simović 1. Kits (templates): France blue shirts, white
 *  shorts, red socks; Yugoslavia white shirts with blue and red trim, white shorts, white socks with blue stripes.
 * INFERRED / ILLUSTRATIVE: every position in metres (the ball 22 m out, 0.8 m right of centre), the wall (four men, who they were, their
 *  numbers), WHICH top corner (drawn: the left one from Platini's view — not named in the narration), the ball's exact height, curve and speed
 *  (a cubic fitted to "looped over the wall and into the top corner"), his run-up, where Simović stood and his late dive, his kit (a grey
 *  jersey), the others' places, the referee's black kit, the ball (an Adidas Tango-style ball), the stadium's look (four roofed stands close to
 *  the pitch), the dusk light, the camera positions, the slow-motion speed, the celebration, and the lesson diagrams.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (wide → close on Platini → the wall → his run-up
 * → panning with the ball to the goal → the celebration); ch2 = the slow-motion replay from BEHIND Platini, high, so the ball is seen looping
 * over the wall and dipping into the corner (a riso replay trail), then close on the celebration; ch3 = the lesson: a low view behind the
 * ball — hit the middle (straight line), hit the side (spin ring, curling path) — then the kick again from behind with the curl drawn.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), frames from 1.45:1 down to square.
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts. Inks: yellow, red, blue, navy. Cue-keyed; seeded randomness. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,backpedal,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `at` times and chapter `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once
 * public/plays/narration/platini-signature/timing.json exists, replace VOICE below with
 *   import timingJson from '../../../public/plays/narration/platini-signature/timing.json';  const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
 * (every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The free kick, live',text:'Saint-Étienne, 1984. France against Yugoslavia, and Michel Platini has scored twice. Free kick to France. Platini steps up... over the wall, top corner! Hat-trick!',tail:1.8,
  cues:['Saint-Étienne','France against Yugoslavia','scored twice','Free kick','Platini steps up','over the wall','top corner','Hat-trick']},
 {label:'Watch it again',text:"Watch it again. His right foot strikes the ball's side. It loops over the wall and dips into the top corner. Left foot, head, right foot: a perfect hat-trick!",tail:1.3,
  cues:['Watch it again','right foot',"ball's side",'loops','over the wall','dips','top corner','Left foot','perfect hat-trick']},
 {label:'The secret',text:'The secret? Hit the middle and the ball flies straight. Hit its side and it spins and curls. Your turn: curl it over the wall by striking the side of the ball.',tail:1.4,
  cues:['The secret','Hit the middle','flies straight','Hit its side','spins','curls','Your turn','over the wall','striking the side']},
];
import timingJson from '../../../public/plays/narration/platini-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-zà-ÿ0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('platini: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('platini: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
const D2R=Math.PI/180;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal Yugoslavia defends is x = 0 (France attack +x), goal centre z = 0, +z = Platini's right (the main-stand side). */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov});

// ---------------------------------------------------------------- Geoffroy-Guichard (illustrative): four roofed stands close to the pitch
/** stand planes (a along, b up the rake 0..1): 0 far side (z<0), 1 behind the goal, 2 near side (z>0), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,12,a),1.2+17*b,-39-24*b],
 (a,b)=>[7+24*b,1.2+15*b,lerp(-50,50,a)],
 (a,b)=>[lerp(12,-116,a),1.2+17*b,39+24*b],
 (a,b)=>[-111-24*b,1.2+15*b,lerp(50,-50,a)],
];
const STAND_COLS=[96,70,96,70],STAND_ROWS=12;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a late-June dusk (kick-off 20:30; the free kick came near 21:50): pale blue sky, a warm band low down
 s.field(B,.18,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.26);s.tone(R,polyPath([[-1e4,hz[1]-220],[1e4,hz[1]-220],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.16);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),lamps=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);if(q.length>2)planes.addPath(polyPath(q,true));seg3(c,S(0,.5),S(1,.5),.8,walk);
  // every stand is roofed (inferred), a floodlight strip under the roof edge
  const top=polyP(c,[S(0,1),S(1,1),add3(S(1,1),[0,3,0]),add3(S(0,1),[0,3,0])]);if(top.length>2)roof.addPath(polyPath(top,true));
  for(let k=0;k<6;k++){const a0=.08+k*.16,q2=polyP(c,[add3(S(a0,1),[0,.4,0]),add3(S(a0+.05,1),[0,.4,0]),add3(S(a0+.05,1),[0,1.4,0]),add3(S(a0,1),[0,1.4,0])]);if(q2.length>2)lamps.addPath(polyPath(q2,true));}}
 s.knockout(planes);s.tone(K,planes,.42);s.tone(B,planes,.3);s.knockout(walk,.85);s.fill(K,roof,.9);
 // the crowd: seeded dots — tricolour blue, paper and red, and some Saint-Étienne green (yellow over blue)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.5)<.03)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.34)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.55?0:h<.75?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.6);s.fill(B,inks[1],.95);s.fill(R,inks[2],.9);s.fill(Y,inks[3],.9);s.fill(B,inks[3],.6);
 s.knockout(lamps);s.fill(Y,lamps,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-116,0,-44],[12,0,-44],[12,0,44],[-116,0,44]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.75);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // advertising boards: paper with red panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>{const q=polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]);if(q.length>2)bd.addPath(polyPath(q,true));};
 board([5.5,0,-37],[5.5,0,37]);board([-110,0,-37],[5.5,0,-37]);board([-110,0,37],[5.5,0,37]);
 for(let k=0;k<12;k++){const z=-35+k*6,q=polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(const zz of[-36.9,36.9])for(let k=0;k<18;k++){const x=-108+k*6.4,q=polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd,.9);s.fill(R,pn,.9);s.fill(B,pn,.25);s.stroke(K,bd,1.6,.7);
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
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);const q=polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]);if(q.length>2)flag.addPath(polyPath(q,true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out high in the top corner the ball hits */
const HIT_Z=-2.9;
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1.9)=>X+2+bulge*.8*Math.exp(-Math.pow((z-HIT_Z)/1.5,2))*(.35+.65*y/1.9);
 const zs=[z0,HIT_Z,-2,-.6,.8,2.2,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the strike)
const B0:V3=[-22,.11,.8];// 22 m out, 0.8 m right of centre (inferred)
const DXG=-B0[0],WALL_D=9.15;
/** the flight as a function of distance d toward the goal: "looped over the wall" — 2.78 m at the wall, peak ≈ 3.2 m, dipping to 2.18 m at the
 * line; sideways: almost straight at first, then the spin curls it left into the top corner (z −2.9). */
const HA=.421482,HB=-.0136678,HC=-.0000551646,SL=.03,CURL=.00900826;
const flight=(d:number):V3=>[B0[0]+d,.11+HA*d+HB*d*d+HC*d*d*d,B0[2]+SL*d-CURL*d*d];
const FLY=1.25,IN_NET=1.37;// 22 m in 1.25 s: a lofted, spinning ball (≈ 63 km/h average), slowing
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.2-.2*u);};
const tauAtD=(d:number)=>{const k=clamp(d/DXG);return FLY*(1.2-Math.sqrt(1.44-.8*k))/.4;};
const LINE_PT=flight(DXG),NET_HIT:V3=[1.7,1.75,HIT_Z-.1],REST:V3=[1.2,.11,-2.5];
const T_WALL=tauAtD(WALL_D);
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(LINE_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:TAU*9*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- the cast: kits of 19 June 1984 (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.5],[R,.3]],SKIN_D:InkFill[]=[[Y,.45],[R,.32],[B,.1]];
/** France: blue shirts, white shorts, red socks */
const france=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:'paper',socks:R,boots:K,skin:SKIN_L,hair:K,line:K,numberInk:'paper',hairStyle:'short',...o});
/** Yugoslavia: white shirts with blue and red trim, white shorts, white socks (blue stripes) */
const yugoslavia=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:[B,.8],shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,numberInk:[B,.85],hairStyle:'short',...o});
const PLATINI_B={height:1.78,bulk:.98,thighs:1.04};
const PLATINI_ST=france({number:10,hairStyle:'curly',hair:K,build:PLATINI_B,seed:10});
const SIMOVIC_ST:AthleteStyle={shirt:[K,.45],trim:'paper',shorts:K,socks:[K,.45],boots:K,skin:SKIN_L,hair:K,line:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:{height:1.88,bulk:1.02},seed:1};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_M,hair:K,line:K,hairStyle:'balding',build:{height:1.76},seed:30};

// ---------------------------------------------------------------- Platini: stand, a short run, strike the ball's RIGHT side with the right foot
const DIRN=Math.hypot(1,.42),DIR:[number,number]=[1/DIRN,.42/DIRN],RIGHT:[number,number]=[-DIR[1],DIR[0]];// from the ball's left, angled
const YAW_P=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.05,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=RUN_END-.85,RUN_L=2.1,STRIKE_L=1.05;// a short run of a few steps, then the plant
/** where Platini's pelvis stands at contact so his RIGHT boot meets the back-right of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),PLATINI_B,{x:0,z:0,yaw:YAW_P}),toe:[number,number]=[B0[0]-DIR[0]*.12+RIGHT[0]*.03,B0[2]-DIR[1]*.12+RIGHT[1]*.03];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const P_SET=posed({lHipF:4,rHipF:-8,lKnee:10,rKnee:14,lAnk:2,rAnk:6,lean:6,neckP:14,lShA:12,rShA:14,lShF:-4,rShF:2,lElb:22,rElb:20,twist:6});
const P_READY=posed({lHipF:14,rHipF:-14,lKnee:22,rKnee:24,lAnk:10,rAnk:12,lean:12,pitch:2,neckP:22,lShA:22,rShA:18,lShF:8,rShF:-10,lElb:30,rElb:28,twist:4});
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
/** Platini's pose. ready 0..1 = eyes on the ball before the run; it = idle clock for breathing */
function platiniPose(tau:number,ready=1,it=0):Pose{
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*2.2);const p=blendPose(P_SET,P_READY,ready);p.lean+=.03*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_READY,runCycle(.5+u*1.4,{speed:.4}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(1.9+(tau-RUN_END)*1.4,{speed:.4});
 let p=blendPose(run,strike(Math.min(1,us),{foot:'r',power:.75}),sm(RUN_END,RUN_END+.14,tau));
 // wrapping the inside of the foot round the ball's side: hips open, the follow-through swings across the body
 const wrapU=sm(-.12,.1,tau)*(1-sm(.5,.9,tau));p.twist+=14*D2R*wrapU;p.rHipA-=10*D2R*wrapU;p.lean-=6*D2R*wrapU;
 if(tau>1.5)p=blendPose(p,celebrate((tau-1.5)/1.1,{kind:'arms'}),sm(1.5,1.8,tau));
 return p;
}
function platiniPlace(tau:number):Place{
 let g:number;
 if(tau<=T_RUN0)g=-(RUN_L+STRIKE_L);
 else if(tau<RUN_END)g=-(RUN_L+STRIKE_L)+RUN_L*runU(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.6*(1-Math.pow(1-clamp(tau/.6),2))+(tau>1.5?Math.min(3.4,(tau-1.5)*2.6):0);
 return{x:PC[0]+DIR[0]*g,z:PC[1]+DIR[1]*g,yaw:YAW_P};
}

// ---------------------------------------------------------------- everyone else (positions illustrative)
type Role='wall'|'keeper'|'def'|'att'|'ref';
type Actor={role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const WALL_X=B0[0]+WALL_D;
const KEEP_X=-.5,KEEP_Z=1.1;
const ACTORS:Actor[]=[
 {role:'wall',st:yugoslavia({number:6,build:{height:1.84,bulk:1.04},seed:6}),x:WALL_X,z:-.95,phase:.1},
 {role:'wall',st:yugoslavia({number:5,hairStyle:'curly',build:{height:1.8},seed:5}),x:WALL_X+.05,z:-.35,phase:.6},
 {role:'wall',st:yugoslavia({number:8,build:{height:1.82},seed:8}),x:WALL_X,z:.25,phase:.3},
 {role:'wall',st:yugoslavia({number:15,hairStyle:'curly',build:{height:1.86},seed:15}),x:WALL_X+.05,z:.85,phase:.8},
 {role:'keeper',st:SIMOVIC_ST,x:KEEP_X,z:KEEP_Z,phase:0},
 {role:'def',st:yugoslavia({number:2,build:{height:1.8},seed:2}),x:-10.8,z:-4.4,phase:.4},
 {role:'def',st:yugoslavia({number:16,build:{height:1.76},seed:16}),x:-11.4,z:2.3,phase:.9},
 {role:'def',st:yugoslavia({number:7,hair:[K,.6],build:{height:1.75},seed:7}),x:-12.4,z:6.4,phase:.5},
 {role:'att',st:france({number:4,hairStyle:'curly',build:{height:1.86,bulk:1.02},seed:4}),x:-12.8,z:-.9,phase:.7},
 {role:'att',st:france({number:14,skin:SKIN_D,hairStyle:'curly',build:{height:1.76,bulk:.92},seed:14}),x:-11.8,z:4.3,phase:.15},
 {role:'att',st:france({number:12,build:{height:1.63,bulk:.9},seed:12}),x:-17.6,z:-3.2,phase:.25},
 {role:'ref',st:REF_ST,x:-25.5,z:5.2,phase:.35},
];
const WALL_P=posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lHipA:3,rHipA:3,lShF:30,rShF:30,lShA:-10,rShA:-10,lElb:46,rElb:46,lean:6,neckP:4});
const WALL_J=posed({lHipF:36,rHipF:30,lKnee:74,rKnee:66,lAnk:46,rAnk:46,lShF:22,rShF:22,lShA:-6,rShA:-6,lElb:54,rElb:54,lean:12,air:.45,neckP:-24});
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
/** Simović: set on the open side of the wall; he reads it late and dives to his right, well short of the corner (inferred) */
const DIVE0=.62,DIVE_T=1.05;
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),toGoal=yawTo(a.x,a.z,0,-2),watch=sm(.05,.8,tau,easeInOutSine),br=Math.sin(it*2.1+a.phase*TAU);
 switch(a.role){
  case 'wall':{let p=blendPose(WALL_P,stand(),.25+.12*br);const j=tau<-.1?0:Math.sin(Math.PI*clamp((tau+.1)/.62));p=blendPose(p,WALL_J,j);
   p.neckY=(-55*sm(T_WALL,T_WALL+.35,tau)*(1-sm(1.1,1.6,tau)))*D2R;
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(Math.PI,Math.PI-2.1,sm(.5,1.4,tau,easeInOutSine))}};}
  case 'keeper':{let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.4,-.12,tau));
   if(tau>DIVE0)p=keeperDive(clamp((tau-DIVE0)/DIVE_T),{side:'r',height:.85});
   return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,B0[0],B0[2])}};}
  case 'ref':{let p=stand();p=blendPose(p,posed({rShF:150,rShA:20,rElb:10,lShA:14,lElb:30}),sm(-3.2,-2.9,tau)*(1-sm(-.6,-.2,tau))*.9);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,watch)}};}
  case 'def':{let p=blendPose(DEF_P,backpedal(it*.5+a.phase),.25);p.air+=.015*Math.max(0,br);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,watch)}};}
  default:{let p=blendPose(stand(),DEF_P,.4+.2*br);if(tau>.1){const u=(tau-.1)*1.3;p=blendPose(p,runCycle(u,{speed:.5}),sm(.1,.4,tau));}
   const run=tau>.1?Math.min(2.4,(tau-.1)*3.2):0;
   return{pose:p,place:{x:a.x+run*Math.cos(toGoal),z:a.z-run*Math.sin(toGoal),yaw:lerpAng(toBall,toGoal,watch)}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): prev = the pose one drawn frame earlier (secondary motion),
 * smear = halftone echo + speed lines on fast limbs (the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the 1984 ball: white with black Tango-style triads
function tango(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,11,{amp:.02,n:24}),disc=polyPath(pts,true);s.knockout(disc);
 if(r<12){s.fill(K,ribbon(pts,Math.max(3,r*.22),{seed:12,close:true,wobble:.4}));return;}
 s.save();s.clip(disc);s.tone(K,crescent(x,y,r*1.02,[-.42,-.45]),.24);
 const pan=new Path2D();for(let i=0;i<4;i++){const a=rot+i/4*TAU,cx=x+Math.cos(a)*r*.55,cy=y+Math.sin(a)*r*.55,q:Pt[]=[];for(let k=0;k<3;k++){const b=a+Math.PI+(k-1)*.8;q.push([cx+Math.cos(b)*r*.42,cy+Math.sin(b)*r*.42]);}pan.addPath(ribbon(smoothPts(q,false,6,2),Math.max(2.5,r*.12),{taper:.3,wobble:0}));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(3.5,r*.075),{seed:12,close:true,pressure:.5,wobble:r*.02}));
}
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 tango(s,g[0],g[1],r,spinAt(tau));
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;ready:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[];
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 {const pl=platiniPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=platiniPose(tp,e.ready,e.it),prev={pose:platiniPose(tpPrev,e.ready,e.it-1/12),place:platiniPlace(tpPrev)};
  drawPlayer(s,pose,c,PLATINI_ST,pl,prev,!!e.smear&&tp>RUN_END+.2&&tp<.4);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,a.st,cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const pxz=(tau:number):V3=>{const p=platiniPlace(tau);return[p.x??0,0,p.z??0];};
/** a yellow replay trail behind the ball */
function trail(s:Sheet,c:Cam,tau:number,back:number,fade:number){
 if(tau<=.02||fade<=.02)return;const pts=pathPts(c,Math.max(0,tau-back),Math.min(tau,FLY+.001),20);if(pts.length<3)return;
 const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter-1 time: Platini waits over the ball; his run starts on "Platini steps up"; the ball clears the wall near "over the wall"
 * and hits the net near "top corner", then real time */
const tC1=()=>Math.max(CUE(0,'Platini steps up')+1.25,CUE(0,'top corner')+.15-IN_NET);
const tau1=(t:number)=>{const c=tC1(),a=c-1.3;return t<a?T_RUN0:t<c?lerp(T_RUN0,0,(t-a)/(c-a)):t-c;};
const P1:V3=[-28,15,50];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-16,0,-1],fov:34})],
  [CUE(0,'scored twice')-.3,.9,()=>({P:P1,T:add3(pxz(tau),[.5,.95,0]),fov:7})],
  [CUE(0,'Free kick')-.1,.9,()=>({P:P1,T:[-15,.5,0],fov:22})],
  [CUE(0,'Platini steps up')-.1,.7,()=>({P:P1,T:add3(pxz(tau),[1.2,.8,0]),fov:11})],
  [tC1()-.05,.9,()=>({P:P1,T:[-3,1.4,-1.6],fov:17})],
  [CUE(0,'Hat-trick')-.1,1.4,()=>({P:P1,T:add3(pxz(tau),[.6,1,-.4]),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=tC1()+IN_NET;
  const ready=sm(CUE(0,'Free kick'),CUE(0,'Free kick')+.8,t);
  stadium(s,c,t,[0,1,3],{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.8,g+3.8,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,ready,minBall:15,lines:true,prevT:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from behind Platini: loop over, spin, dip
const tau2=(t:number)=>key(t,[[0,-1.3],[CUE(1,'right foot'),-.35],[CUE(1,"ball's side"),.02],[CUE(1,'loops'),tauAtD(4)],[CUE(1,'over the wall'),T_WALL],[CUE(1,'dips'),tauAtD(17)],[CUE(1,'top corner'),FLY],[CUE(1,'Left foot'),IN_NET+.3],[SECS(1),IN_NET+2.4]],linear);
const P2:V3=[-43,7.5,2.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>{const u=sm(-1.3,.2,tau,easeInOutSine);return{P:mix3(add3(B0,[-5.5,2.2,-2.4]),P2,u),T:mix3(add3(B0,[.6,.5,.2]),[-11,1.5,-.4],u),fov:lerp(30,24,u)};}],
  [CUE(1,'over the wall')-.3,.9,()=>({P:P2,T:mix3([-9,1.9,-.5],b,.35),fov:21})],
  [CUE(1,'dips')-.2,.9,()=>({P:P2,T:[-3,1.9,-2.1],fov:13})],
  [CUE(1,'top corner')+.5,1.2,()=>{const p=pxz(Math.min(tau,IN_NET+2));return{P:add3(p,[2,4,14]),T:add3(p,[0,1.1,0]),fov:16};}],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)*(1-sm(IN_NET+1.9,IN_NET+2.4,tau)*.5)});
  ground(s,c,{bulge:bulgeAt(tau)});
  trail(s,c,tau,.7,1-sm(FLY+.1,IN_NET+.7,tau));
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
  // contact: a spark off the RIGHT side of the ball as the inside of the boot wraps round it
  const hit=sm(-.03,.02,tau)*(1-sm(.12,.3,tau));
  if(hit>.02){const p=pr(c,[B0[0]-.05,.12,B0[2]+.1]);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,B0)*.4)*hit,{n:9,seed:61,width:Math.max(5,kAt(c,B0)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:7,
};

// ---------------------------------------------------------------- 3 · the lesson: middle = straight, side = spin + curl; then the kick again
/** τ: frozen before the kick while the diagrams play; the strike after "Your turn"; the flight across "over the wall" → the end */
const tau3=(t:number)=>key(t,[[0,-1.6],[CUE(2,'Your turn')-.2,-1.6],[CUE(2,'Your turn')+1,0],[CUE(2,'over the wall')+.1,T_WALL*.6],[CUE(2,'striking the side'),tauAtD(15)],[SECS(2)-.5,IN_NET+.2],[SECS(2),IN_NET+.5]],linear);
/** the close, low view behind the ball (from its back-right, looking down the pitch) */
const P3:V3=add3(B0,[-2.3,.85,1.25]),T3:V3=add3(B0,[3,.35,-.9]);
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:P3,T:T3,fov:34})],
  [CUE(2,'curls')-.25,.9,()=>({P:add3(B0,[-7,3.2,2.6]),T:[-8,1.2,-1],fov:38})],
  [CUE(2,'Your turn')-.2,.9,()=>({P:[-40,7.5,2],T:[-10,1.6,-.4],fov:25})],
  [CUE(2,'striking the side')-.3,1.1,()=>({P:[-38,6.5,1.5],T:[-3,2,-1.8],fov:15})],
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
/** a red contact dot on the ball's surface, u 0 = dead centre of the back, 1 = its right side */
function contactDot(s:Sheet,c:Cam,u:number,cov:number){
 if(cov<=.02)return;const a=u*62*D2R,P:V3=[B0[0]-.11*Math.cos(a),.11,B0[2]+.11*Math.sin(a)],g=pr(c,P);if(!g)return;
 const r=Math.max(7,kAt(c,B0)*.035),pts:Pt[]=[];for(let i=0;i<18;i++){const q=i/18*TAU;pts.push([g[0]+Math.cos(q)*r,g[1]+Math.sin(q)*r]);}
 const d=polyPath(pts,true);s.knockout(d,.9*cov);s.fill(R,d,.95*cov);s.stroke(K,d,Math.max(2,r*.2),.9*cov);
}
/** the spin: a blue ring of arrows round the ball, turning (counter-clockwise seen from above) */
function spinRing(s:Sheet,c:Cam,u:number,t:number){
 if(u<=.02)return;const rad=.3,pts:V3[]=[],a0=-t*4;
 for(let i=0;i<=14;i++){const a=a0+i/14*TAU*.8*u;pts.push([B0[0]+Math.cos(a)*rad,.13,B0[2]-Math.sin(a)*rad]);}
 arrow3(s,c,pts,Math.max(5,kAt(c,B0)*.028),B,.95*Math.min(1,u*1.5));
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tM=CUE(2,'Hit the middle'),tS=CUE(2,'flies straight'),tH=CUE(2,'Hit its side'),tSp=CUE(2,'spins'),tC=CUE(2,'curls'),tY=CUE(2,'Your turn'),tO=CUE(2,'over the wall'),tE=CUE(2,'striking the side');
  stadium(s,c,t,[0,1,2]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · middle → straight: a red dashed-feel straight arrow from the ball, grown on "flies straight"
  const st=sm(tS-.15,tS+.6,t)*(1-sm(tH,tH+.4,t));
  if(st>.02){const pts:V3[]=[];for(let i=0;i<=6;i++){const d=.4+i/6*(8.2*st);pts.push([B0[0]+d,.14+d*.04,B0[2]]);}arrow3(s,c,pts,Math.max(7,kAt(c,add3(B0,[3,0,0]))*.06),R,.9);}
  // 2 · side → spin → curl: the curling path grows from the ball
  const cu=sm(tC-.1,tC+.9,t)*(1-sm(tY-.1,tY+.3,t));
  if(cu>.02){const pts:V3[]=[];for(let i=0;i<=16;i++){const f=flight(.4+i/16*(DXG-.8)*cu);pts.push(f);}arrow3(s,c,pts,Math.max(7,kAt(c,flight(8))*.09),B,.95);}
  // 3 · the kick again: the aim line up over the wall, then the real flight as a yellow trail
  const am=sm(tO-.2,tO+.5,t)*(1-sm(SECS(2)-.8,SECS(2)-.4,t));
  if(am>.02){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(flight(.6+i/8*(WALL_D+1.4)*am));pts.forEach(p=>{p[1]+=.35;});arrow3(s,c,pts,Math.max(8,kAt(c,flight(WALL_D))*.12),R,.9);}
  if(tau>.02){const pv=sm(tY+.9,tY+1.2,t),pts=partial(pathPts(c,0,FLY,40),clamp(tau/FLY)),w=Math.max(10,kAt(c,[-12,2,0])*.16);if(pts.length>2&&pv>.02){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5*pv);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95*pv);}}
  // 4 · Platini, the wall, Simović and the ball
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
  // 5 · on the ball (drawn over it): the contact dot slides from the middle to the side; the spin ring
  const dotCov=sm(tM-.1,tM+.3,t,easeOutBack)*(1-sm(tC+.4,tC+.9,t));
  contactDot(s,c,sm(tH-.1,tH+.5,t,easeInOutSine),dotCov);
  spinRing(s,c,sm(tSp-.1,tSp+.5,t)*(1-sm(tC+.5,tC+1,t)),t);
  // 6 · the strike: a spark off the side of the ball at contact
  const hit=sm(tY+.95,tY+1.05,t,easeOutBack)*(1-sm(tY+1.3,tY+1.6,t));
  if(hit>.02){const p=pr(c,[B0[0]-.05,.12,B0[2]+.1]);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,B0)*.4)*hit,{n:9,seed:61,width:Math.max(5,kAt(c,B0)*.04)});}
  // 7 · "striking the side": the corner it finds, ringed
  const rg=sm(tE+.4,tE+.9,t,easeOutBack);
  if(rg>.02){const m:V3=[0,2.1,HIT_Z],g=pr(c,m);if(g){const r=kAt(c,m)*.5*(.7+.3*rg),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([g[0]+Math.cos(a)*r,g[1]+Math.sin(a)*r]);}
   const rr=ribbon(pts,Math.max(5,r*.12),{close:true,seed:31,taper:0,wobble:1});s.knockout(rr,.9*rg);s.fill(R,rr,.95*rg);}}
 },
 still:9,
};

const film:RisoStory={
 id:'platini-signature',format:'11v11',title:"Platini's curled free kick",
 theme:'Free kicks: strike the side of the ball so it spins, and curl it over the wall into the top corner',
 ageNote:'Signature move: France 3–2 Yugoslavia, UEFA Euro 1984, Stade Geoffroy-Guichard, Saint-Étienne, 19 June 1984. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a little free kick — a yellow arc that loops over a tiny wall and curls down, a Tango ball on its tip. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),dir=hash(seed,2)<.5?1:-1,r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+dir*(60*k-150*k*k),y-320*k+180*k*k]);}
  const wall=new Path2D();for(let i=0;i<3;i++)wall.addPath(polyPath([[x+dir*(-20+i*18)-7,y-40],[x+dir*(-20+i*18)+7,y-40],[x+dir*(-20+i*18)+7,y-8],[x+dir*(-20+i*18)-7,y-8]],true));
  s.fill(K,wall,.8*fade);
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  tango(s,e[0],e[1],30,age*14+r()*TAU);
 },
};
export default film;
