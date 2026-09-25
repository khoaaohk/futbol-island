/** Roberto Carlos's "banana" free kick — Brazil 1–1 France, Tournoi de France, Stade de Gerland, Lyon, 3 June 1997 — an iconic-play riso
 * film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, unchanged.
 * A 1:1 reconstruction of the goal from written accounts (we cannot watch the footage), rendered as a riso print.
 *
 * SOURCES (read Sept 2026, via search summaries):
 *  - Sky Sports, "Roberto Carlos' brilliant Brazil free-kick against France remembered"
 *    https://www.skysports.com/football/news/11095/10899358/roberto-carlos-brilliant-brazil-free-kick-against-france-remembered
 *  - Sports Illustrated, "Roberto Carlos: Revisiting THAT Free Kick Against France & the Legacy it Holds 22 Years On" (3 Jun 2019)
 *    https://www.si.com/soccer/2019/06/03/roberto-carlos-revisiting-free-kick-against-france-legacy-it-holds-22-years
 *  - Sports Illustrated, "Roberto Carlos Says His Iconic Free Kick Was Wind-Aided" (29 Nov 2017)
 *    https://www.si.com/soccer/2017/11/29/brazil-legend-roberto-carlos-reveals-lucky-element-aided-his-iconic-free-kick-against-france
 *  - ESPN, "Roberto Carlos' Brazil free kick in 1997: The physics behind 'impossible' strike"
 *    https://www.espn.com/soccer/story/_/id/37475858/physics-impossible-strike
 *  - SportBible, "25 Years Ago Today, Roberto Carlos Scored 'Impossible' Free-Kick Goal Against France" (2 Jun 2022)
 *    https://www.sportbible.com/football/25-years-ago-today-roberto-carlos-scored-impossible-freekick-goal-20220602
 *  - ScienceDaily / Physics World on Dupeux, Le Goff, Quéré & Clanet, "The spinning ball spiral", New Journal of Physics (Sept 2010)
 *    https://www.sciencedaily.com/releases/2010/09/100902073509.htm  https://physicsworld.com/a/brazilian-wondergoal-was-no-fl/
 *  - Wikipedia, "1997 Tournoi de France" https://en.wikipedia.org/wiki/1997_Tournoi_de_France
 * CONFIRMED by those accounts: 3 June 1997, opening game of the Tournoi de France, Stade de Gerland, Lyon, Brazil 1–1 France; the free kick in
 * the 21st minute after Deschamps fouled Romário; about 35 m out (33.13 m in one account); struck with the OUTSIDE of Carlos's LEFT foot;
 * a long run-up (18 steps, one account); the ball seemed to be heading well wide, then swerved back, glanced the inside of the post and went
 * in; Barthez did not move; a ball boy about ten metres from the goal ducked; ~136 km/h with ~14 revolutions per second (one account); a
 * four-man French wall that included Zidane (one account); Carlos said the ball was light and the wind helped; physicists showed the path is
 * a spiral that tightens as the ball slows (the Magnus effect), so the late hook was no fluke.
 * INFERRED (illustrative): every exact position (ball 33.5 m out and 6 m right of centre, the wall 9.15 m away covering the near post, the
 * keeper a step to the far side), which post (the right one from Carlos's view — follows from "right of centre" + "swerved back in"), the
 * flight's height and exact curve (a cubic hook fitted to "wide, then back in off the post"), the run-up's length (15.8 m) and angle, who
 * else stood where, Barthez's and the ball boy's clothes, the referee's dark kit, the TV camera positions, light and weather, the celebration.
 * Kits: Brazil yellow shirts / blue shorts / white socks, Carlos number 6, shaved head, short with heavy thighs; France blue / white / red.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (establishing wide → close on Carlos → the
 * distance → following the run-up → panning with the ball to the goal); ch2 = the slow-motion replay from BEHIND Carlos, so the ball's path
 * is seen bending round the wall (a riso replay trail marks it); ch3 = the lesson: a close, very slow replay of the strike (outside of the
 * foot, across the ball), the spin, then an elevated behind view with the whole curve, where it was heading, and the sideways Magnus push.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas) and kept inside the central ~1000 units, so it frames from the
 * 1.45:1 card window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK
 * skeleton, full range of motion, secondary motion from the previous pose, motion smear on the strike). Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,celebrate,posed,blendPose,backpedal,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/roberto-carlos-free-kick-1997/timing.json, add
 *   import timing from '../../../public/plays/narration/roberto-carlos-free-kick-1997/timing.json';
 * and pass `timing as NarrationTiming` to withTiming below instead of VOICE (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The free kick, live',text:'Lyon, 1997. Brazil against France. Roberto Carlos stands thirty-five metres out. A long run-up, a huge swing of his left foot... Goal!',tail:2,
  cues:['Lyon','Brazil against France','Roberto Carlos','thirty-five metres','A long run-up','huge swing','left foot','Goal']},
 {label:'Watch it again',text:'Watch it again, from behind. The ball flies wide of the wall, so wide that a ball boy ducks! Then it swerves back in, off the post, and Barthez never moves.',tail:1.4,
  cues:['Watch it again','from behind','The ball flies','wide of the wall','a ball boy','ducks','swerves back in','off the post','Barthez never moves']},
 {label:'The secret',text:"The secret? Strike across the ball with the outside of your foot. The ball spins, and the spin makes it curve. That's the Magnus effect!",tail:1.5,
  cues:['The secret','Strike across','outside of your foot','The ball spins','makes it curve','Magnus effect']},
];
import timingJson from '../../../public/plays/narration/roberto-carlos-free-kick-1997/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('roberto-carlos: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('roberto-carlos: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line France defends is x = 0 (Brazil attack +x), the goal centre z = 0, +z = Carlos's right (the ball-boy side). */
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

// ---------------------------------------------------------------- the Gerland bowl: sky, stands, crowd, floodlight pylons
/** stand planes (a along, b up the rake 0..1): 0 far side (z<0), 1 behind the goal, 2 near side (z>0), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.4+19*b,-41-28*b],
 (a,b)=>[8+30*b,1.4+19*b,lerp(-54,54,a)],
 (a,b)=>[lerp(14,-118,a),1.4+19*b,41+28*b],
 (a,b)=>[-113-30*b,1.4+19*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,70,96,70],STAND_ROWS=13;
const PYLONS:V3[]=[[12,0,-50],[12,0,50],[-117,0,-50],[-117,0,50]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a June-evening sky: light blue screen, a warmer band low down
 s.field(B,.2,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.2);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);if(q.length>2)planes.addPath(polyPath(q,true));for(const b of[.5,1])seg3(c,S(0,b),S(1,b),.8,walk);
  const top=polyP(c,[S(0,1),S(1,1),add3(S(1,1),[0,3.2,0]),add3(S(0,1),[0,3.2,0])]);if(top.length>2)roof.addPath(polyPath(top,true));}
 s.knockout(planes);s.tone(K,planes,.45);s.tone(B,planes,.32);s.knockout(walk,.85);s.fill(K,roof,.88);
 // the crowd: seeded dots in every ink, sized by distance (Brazil yellow, France blue, paper, a little red)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.5)<.03)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.34)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.55?0:h<.8?1:h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.6);s.fill(Y,inks[1],.95);s.fill(B,inks[2]);s.fill(R,inks[3],.95);
 // floodlight pylons: lattice masts with a lamp bank
 const mast=new Path2D(),lamp=new Path2D();
 for(const P of PYLONS){if(toCam(c,P)[2]<NEAR+2)continue;seg3(c,P,add3(P,[0,40,0]),.9,mast);const h:V3=add3(P,[0,40,0]),side:V3=[P[0]>0?-1:1,0,P[2]>0?-1:1],ax:V3=[-side[2]*.7,0,side[0]*.7];
  const q=polyP(c,[add3(h,[-ax[0]*4,-2,-ax[2]*4]),add3(h,[ax[0]*4,-2,ax[2]*4]),add3(h,[ax[0]*4,2,ax[2]*4]),add3(h,[-ax[0]*4,2,-ax[2]*4])]);if(q.length>2)lamp.addPath(polyPath(q,true));}
 s.fill(K,mast,.8);s.knockout(lamp);s.fill(Y,lamp,.75);s.stroke(K,lamp,2.2,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.75);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // advertising boards behind the goal and along both touchlines: red with paper panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>{const q=polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]);if(q.length>2)bd.addPath(polyPath(q,true));};
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2,q=polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4,q=polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.95);s.knockout(pn,.85);s.stroke(K,bd,1.6,.7);
 // painted lines
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
 // corner flags
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);const q=polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]);if(q.length>2)flag.addPath(polyPath(q,true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts at z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out where the ball hits (z 2.4) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=2.4,back=(z:number)=>X+2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-1.8,0,1.4,bz,3.2,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
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
const B0:V3=[-33.5,.11,6];// the ball on the free-kick spot: 33.5 m out, 6 m right of centre (≈34 m to the goal)
const DXG=-B0[0],SLOPE=.2,POST_Z=3.49;// initial heading: .2 m right per metre (straight on it would cross the line at z ≈ 12.7: wide)
const HOOK=(B0[2]+SLOPE*DXG-POST_Z)/Math.pow(DXG,3);// the late, tightening hook (a cubic in distance: the Magnus spiral tightens as it slows)
const FLY=1.0,IN_NET=1.13;// ~34 m in 1 s ≈ 122 km/h average (136 km/h off the boot, slowing)
/** distance travelled toward the goal after τ s of flight (decelerating: 42 → 25 m/s) */
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.25-.25*u);};
const tauAtD=(d:number)=>{const k=clamp(d/DXG);return FLY*(1.25-Math.sqrt(1.5625-k))/.5;};
/** the flight as a function of distance d along the pitch: height a low arc (≈2 m passing the wall, 1.2 m at the post), z the hook */
const flight=(d:number):V3=>[B0[0]+d,.11+.267*d-.007*d*d,B0[2]+SLOPE*d-HOOK*d*d*d];
const POST_PT=flight(DXG),NET_HIT:V3=[1.8,.95,2.4],REST:V3=[1.3,.11,2.1];
const WALL_D=9.15,T_WALL=tauAtD(WALL_D+.2);
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(POST_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
/** ball spin (panel rotation): ~14 rev/s off the boot */
const spinAt=(tau:number)=>tau<=0?0:TAU*14*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_D:InkFill[]=[[Y,.45],[R,.32],[B,.1]];
const brazil=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:SKIN_D,hair:K,line:K,trim:B,numberInk:B,hairStyle:'short',...o});
const france=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:R,numberInk:'paper',hairStyle:'short',...o});
const CARLOS_ST=brazil({number:6,hairStyle:'bald',build:{height:1.68,bulk:1.08,thighs:1.3},seed:6});
const BARTHEZ_ST:AthleteStyle={shirt:[K,.45],shorts:K,socks:[K,.45],boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,gloves:Y,sleeves:'long',hairStyle:'bald',number:16,numberInk:'paper',build:{height:1.8,bulk:1.02},seed:16};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'short',build:{height:1.8},seed:30};
const BOY_ST:AthleteStyle={shirt:R,shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,sleeves:'long',hairStyle:'short',build:{height:1.45,bulk:.9,head:1.08},seed:40};

// ---------------------------------------------------------------- Carlos: the long run-up, the strike, the celebration
const DIRN=Math.hypot(1,.12),DIR:[number,number]=[1/DIRN,-.12/DIRN],RIGHT:[number,number]=[-DIR[1],DIR[0]];// approach slightly from the right of the ball
const YAW_C=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.1,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-3.25,RUN_L=13.5,STRIKE_L=2.3;// strike clip seconds, run 2.68 s over 13.5 m + a 2.3 m plant
const CARLOS_B={height:1.68,bulk:1.08,thighs:1.3};
/** where Carlos's pelvis must stand at contact so the outside of his LEFT boot meets the ball's right-back side (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),CARLOS_B,{x:0,z:0,yaw:YAW_C}),toe:[number,number]=[B0[0]-DIR[0]*.13+RIGHT[0]*.05,B0[2]-DIR[1]*.13+RIGHT[1]*.05];return[toe[0]-sk.lToe[0],toe[1]-sk.lToe[2]];})();
const RUN_START:[number,number]=[PC[0]-DIR[0]*(RUN_L+STRIKE_L),PC[1]-DIR[1]*(RUN_L+STRIKE_L)];
const C_SET=posed({lHipF:-12,rHipF:10,lKnee:16,rKnee:22,lAnk:8,rAnk:-4,lean:12,pitch:3,neckP:10,lShA:18,rShA:18,lShF:6,rShF:6,lElb:28,rElb:34,twist:-4});
const C_READY=posed({lHipF:-26,rHipF:24,lKnee:32,rKnee:36,lAnk:22,rAnk:-6,lean:22,pitch:6,neckP:20,lShA:26,rShA:22,lShF:-12,rShF:16,lElb:40,rElb:48,twist:-8});
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
/** Carlos's pose. ready 0..1 = leaning into his mark before the run (ch1), it = an idle clock for breathing */
function carlosPose(tau:number,ready=1,it=0):Pose{
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*2.2);const p=blendPose(C_SET,C_READY,ready);p.lean+=.03*br*(1-ready);p.neckP+=.04*br;p.air=.012*ready*Math.max(0,Math.sin(it*6.5));return p;}
 const cad=(u:number)=>8*Math.pow(u,.9);
 if(tau<RUN_END){const u=runU(tau),v=RUN_L*1.25*Math.pow(Math.max(u,1e-3),.25)/(RUN_END-T_RUN0);return blendPose(C_READY,runCycle(cad(u),{speed:clamp(v/8)}),sm(0,.14,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(8+(tau-RUN_END)*2.2,{speed:.8});
 let p=blendPose(run,strike(Math.min(1,us),{foot:'l',power:1}),sm(RUN_END,RUN_END+.16,tau));
 if(tau>1.2)p=blendPose(p,celebrate((tau-1.2)/1.1,{kind:'arms'}),sm(1.2,1.5,tau));
 return p;
}
function carlosPlace(tau:number):Place{
 let g:number;
 if(tau<=T_RUN0)g=-(RUN_L+STRIKE_L);
 else if(tau<RUN_END)g=-(RUN_L+STRIKE_L)+RUN_L*Math.pow(runU(tau),1.25);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.55*v+.45*(1-(1-v)*(1-v)));}
 else g=.9*(1-Math.pow(1-clamp(tau/.7),2));
 return{x:PC[0]+DIR[0]*g,z:PC[1]+DIR[1]*g,yaw:YAW_C};
}

// ---------------------------------------------------------------- everyone else
type Role='wall'|'keeper'|'boy'|'def'|'att'|'ref';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const WALL_X=B0[0]+WALL_D;
const ACTORS:Actor[]=[
 {name:'Zidane',role:'wall',st:france({number:10,hairStyle:'balding',build:{height:1.85},seed:10}),x:WALL_X,z:5.65,phase:.1},
 {name:'France 5',role:'wall',st:france({number:5,build:{height:1.83,bulk:1.05},seed:11}),x:WALL_X+.05,z:5.08,phase:.6},
 {name:'France 8',role:'wall',st:france({number:8,build:{height:1.8},seed:12}),x:WALL_X,z:4.52,phase:.3},
 {name:'France 7',role:'wall',st:france({number:7,hairStyle:'curly',build:{height:1.78},seed:13}),x:WALL_X+.05,z:3.96,phase:.8},
 {name:'Romário',role:'att',st:brazil({number:11,build:{height:1.69},seed:21}),x:WALL_X+.3,z:3.15,phase:.2},
 {name:'Barthez',role:'keeper',st:BARTHEZ_ST,x:-.55,z:-.8,phase:0},
 {name:'ball boy',role:'boy',st:BOY_ST,x:1.7,z:10.6,phase:0},
 {name:'France 4',role:'def',st:france({number:4,build:{height:1.84},seed:14}),x:-12.5,z:-4.8,phase:.4},
 {name:'France 2',role:'def',st:france({number:2,build:{height:1.8},seed:15}),x:-12,z:.8,phase:.9},
 {name:'France 3',role:'def',st:france({number:3,build:{height:1.82},seed:17}),x:-13.2,z:7.4,phase:.5},
 {name:'Brazil 9',role:'att',st:brazil({number:9,build:{height:1.8},seed:22}),x:-15.4,z:-1.8,phase:.7},
 {name:'Brazil 4',role:'att',st:brazil({number:4,build:{height:1.88},seed:23}),x:-16.2,z:9.2,phase:.15},
 {name:'referee',role:'ref',st:REF_ST,x:-30.5,z:-3.2,phase:.35},
];
const WALL_P=posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lHipA:3,rHipA:3,lShF:30,rShF:30,lShA:-10,rShA:-10,lElb:46,rElb:46,lean:6,neckP:4});
const WALL_J=posed({lHipF:36,rHipF:30,lKnee:74,rKnee:66,lAnk:46,rAnk:46,lShF:22,rShF:22,lShA:-6,rShA:-6,lElb:54,rElb:54,lean:12,air:.4,neckP:-10});
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const BOY_CROUCH=posed({lHipF:96,rHipF:104,lKnee:128,rKnee:132,lAnk:22,rAnk:24,lHipA:14,rHipA:14,lean:24,neckP:-12,lShF:46,rShF:52,lShA:10,rShA:10,lElb:72,rElb:66});
const BOY_DUCK=posed({lHipF:118,rHipF:120,lKnee:146,rKnee:146,lAnk:34,rAnk:34,lHipA:18,rHipA:18,lean:70,pitch:22,neckP:55,lShF:175,rShF:170,lShA:40,rShA:44,lElb:128,rElb:130,bend:18});
const T_DUCK=tauAtD(23.5);
/** one actor's pose + place at τ. it = idle clock; wallOn 0..1 = the wall has set (ch1 before the run) */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),toGoal=yawTo(a.x,a.z,0,2.5),watch=sm(.05,.75,tau,easeInOutSine),br=Math.sin(it*2.1+a.phase*TAU);
 switch(a.role){
  case 'wall':{let p=blendPose(WALL_P,stand(),.25+.12*br);const j=tau<-.12?0:Math.sin(Math.PI*clamp((tau+.12)/.62));p=blendPose(p,WALL_J,j);
   p.neckY=(60*sm(.12,.4,tau)*(1-sm(.7,1.2,tau)))*Math.PI/180;
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(Math.PI,Math.PI+2.1,sm(.35,1.3,tau,easeInOutSine))}};}
  case 'keeper':{let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.4,-.12,tau));p.neckY=(52*sm(.72,1.05,tau))*Math.PI/180;if(tau>1.45)p=blendPose(p,stand(),sm(1.45,2.2,tau));
   return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,B0[0],B0[2])}};}
  case 'boy':{const d=sm(T_DUCK-.05,T_DUCK+.2,tau,easeOut),up=sm(1.7,2.6,tau);const p=blendPose(blendPose(BOY_CROUCH,BOY_DUCK,d),BOY_CROUCH,up);
   return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-6,-2)+.9*d*(1-up)}};}
  case 'ref':{let p=stand();const w=sm(-3.6,-3.35,tau)*(1-sm(-.4,0,tau));p=blendPose(p,posed({rShF:150,rShA:20,rElb:10,lShA:14,lElb:30,neckP:0}),w*.9);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,watch)}};}
  case 'def':{let p=blendPose(DEF_P,backpedal(it*.5+a.phase),.25);p.air+=.015*Math.max(0,br);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,watch)}};}
  default:{let p=blendPose(stand(),DEF_P,.4+.2*br);if(tau>.1){const u=(tau-.1)*1.3;p=blendPose(p,runCycle(u,{speed:.5}),sm(.1,.4,tau));}
   const run=tau>.1?Math.min(2.4,(tau-.1)*3.2):0;
   return{pose:p,place:{x:a.x+run*Math.cos(toGoal),z:a.z-run*Math.sin(toGoal),yaw:lerpAng(toBall,toGoal,watch)}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;trail?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 // shadow on the grass
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.2,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;ready:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[];
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 {const pl=carlosPlace(tau),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=carlosPose(tp,e.ready,e.it),prev={pose:carlosPose(tpPrev,e.ready,e.it-1/12),place:carlosPlace(tpPrev)};
  drawPlayer(s,pose,c,CARLOS_ST,pl,prev,!!e.smear&&tp>RUN_END+.2&&tp<.45);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,a.st,cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const cxz=(tau:number):V3=>{const p=carlosPlace(tau);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter-1 time: Carlos waits at his mark; the run starts on "A long run-up", the strike lands on "left foot", then real time */
const tC1=()=>CUE(0,'left foot')+.15;
const tau1=(t:number)=>{const a=CUE(0,'A long run-up')-.1,c=tC1();return t<a?T_RUN0:t<c?lerp(T_RUN0,0,(t-a)/(c-a)):t-c;};
const P1:V3=[-36,15,52];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-22,0,4],fov:33})],
  [CUE(0,'Roberto Carlos')-.25,.85,()=>({P:P1,T:add3(cxz(tau),[0,.9,0]),fov:4.6})],
  [CUE(0,'thirty-five')+.2,.9,()=>({P:P1,T:add3(mix3(cxz(tau),B0,.3),[0,.6,0]),fov:26})],
  [CUE(0,'A long run-up')-.2,.8,()=>({P:P1,T:add3(cxz(tau),[DIR[0]*1.2,.9,DIR[1]*1.2]),fov:12})],
  [tC1()-.05,.9,()=>({P:P1,T:[-3,1,3],fov:15})],
  [CUE(0,'Goal')+.15,2.4,()=>({P:P1,T:[-.3,1.1,2.4],fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal');
  const ready=sm(CUE(0,'thirty-five'),CUE(0,'thirty-five')+.8,t);
  stadium(s,c,t,[0,1,3],{roar:sm(tC1()+IN_NET,tC1()+IN_NET+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,ready,minBall:16,lines:true,prevT:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from behind Carlos: the banana round the wall
const tau2=(t:number)=>key(t,[[0,-1.2],[CUE(1,'The ball flies'),.02],[CUE(1,'wide of the wall'),T_WALL],[CUE(1,'a ball boy'),T_DUCK-.12],[CUE(1,'ducks'),T_DUCK+.08],[CUE(1,'swerves'),tauAtD(30.2)],[CUE(1,'off the post'),FLY],[CUE(1,'Barthez'),FLY+.32],[SECS(1),FLY+1.5]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>{const u=sm(-1.2,1,tau,easeInOutSine),T=mix3([-25,.2,5.4],[-5,.2,5.2],sm(-.05,.95,tau,easeInOutSine));return{P:mix3([-50,6.8,3.4],[-52,9.5,3.2],u),T:mix3(T,b,.12*sm(0,.2,tau)*(1-sm(.8,1,tau))),fov:lerp(27,21,u)};}],
  [CUE(1,'a ball boy')-.35,.7,()=>({P:[-52,9.5,3.2],T:[-2.5,.7,7.4],fov:9.5})],
  [CUE(1,'swerves')-.1,.7,()=>({P:[-52,9.5,3.2],T:[-3,.9,4.6],fov:11})],
  [CUE(1,'Barthez')-.2,1.4,()=>({P:[-50,8.5,3],T:[0,1.05,1.6],fov:8.5})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the banana so far, fading at the tail (drawn on the grass-side plate before the players)
  if(tau>.02&&tau<IN_NET+.6){const pts=pathPts(c,Math.max(0,tau-.55),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.6,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:7,
};

// ---------------------------------------------------------------- 3 · the lesson: across the ball with the outside of the foot → spin → curve
const tau3=(t:number)=>key(t,[[0,-.62],[CUE(2,'Strike across'),-.07],[CUE(2,'outside'),.003],[CUE(2,'The ball spins'),.03],[CUE(2,'makes it curve'),.2],[CUE(2,'Magnus'),.82],[SECS(2),FLY+.55]],linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:add3(B0,[3.1,.45,2.6]),T:add3(B0,[-.75,.45,.05]),fov:36})],
  [CUE(2,'The ball spins')-.15,.8,()=>({P:add3(b,[-2.4,.85,2.3]),T:add3(b,[.8,0,-.2]),fov:36})],
  [CUE(2,'makes it curve')-.25,1.25,()=>({P:[-56,21,5],T:[-16,0,5.5],fov:36})],
  [CUE(2,'Magnus')+.3,2.2,()=>({P:[-52,19,5],T:[-13,.3,5],fov:33})],
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
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tS=CUE(2,'Strike across'),tO=CUE(2,'outside'),tSp=CUE(2,'The ball spins'),tCv=CUE(2,'makes it curve'),tM=CUE(2,'Magnus');
  stadium(s,c,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.4,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · the ring on the grass round ball and boot (strike across the ball)
  const ring=sm(tS-.25,tS+.3,t,easeOutBack)*(1-sm(tSp,tSp+.5,t));
  if(ring>.02){const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[B0[0]-.25+Math.cos(a)*1.05*(.7+.3*ring),0,B0[2]+.15+Math.sin(a)*.8*(.7+.3*ring)]);if(p)pts.push(p);}
   if(pts.length>30){const rr=ribbon(pts,Math.max(6,kAt(c,B0)*.07),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
  // 3 · the curve (under the players): where it was heading (straight, dashed, wide) and the real banana so far
  const cv=sm(tCv-.15,tCv+.45,t);
  if(cv>.02){const str=new Path2D(),SP=(d:number):V3=>[B0[0]+d,flight(d)[1],B0[2]+SLOPE*d],n=16,reach=cv;for(let i=0;i<n;i++){if(i%2)continue;const a=pr(c,SP(i/n*DXG*reach)),b=pr(c,SP((i+1)/n*DXG*reach));if(a&&b)str.addPath(ribbon([a,b],Math.max(12,kAt(c,SP(i/n*DXG))*.2),{taper:.25,wobble:0}));}
   s.knockout(str);s.stroke(K,str,2.4,.9);
   const pts=partial(pathPts(c,0,FLY,40),clamp(tau/FLY)*cv),w=Math.max(12,kAt(c,[-15,0,6])*.2);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95);}}
  // 5 · the Magnus push: spinning ghost balls along the path, each pushed sideways (left) by its spin
  const mg=sm(tM-.2,tM+.5,t,easeOutBack);
  if(mg>.02){for(const [i,d] of [8,15,22,28.5].entries()){const P=flight(d),n=flight(d+.5),vx=n[0]-P[0],vz=n[2]-P[2],l=Math.hypot(vx,vz),lx=vz/l,lz=-vx/l,g=clamp(mg*1.6-i*.2);if(g<=0)continue;
    const q=pr(c,P);if(q){const r=Math.max(9,kAt(c,P)*.14),gh=polyPath(Array.from({length:16},(_,k)=>[q[0]+Math.cos(k/16*TAU)*r,q[1]+Math.sin(k/16*TAU)*r] as Pt),true);s.knockout(gh);s.tone(K,gh,.2);s.stroke(K,gh,2,.8);}
    arrow3(s,c,[add3(P,[lx*.35,0,lz*.35]),add3(P,[lx*(.35+2.8*g),0,lz*(.35+2.8*g)])],Math.max(11,kAt(c,P)*.22),R,.95);}}
  // the players and the ball (Carlos in high detail, smear on the swing)
  play(s,c,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:14});
  // 2 · across the ball: the boot's sweep (red) and the outside of the left boot lighting up at contact
  const acr=sm(tS-.1,tS+.35,t,easeOut)*(1-sm(tSp,tSp+.4,t));
  if(acr>.02){const a:V3=[B0[0]-DIR[0]*.75+RIGHT[0]*.3,.14,B0[2]-DIR[1]*.75+RIGHT[1]*.3],b:V3=[B0[0]+DIR[0]*.7+RIGHT[0]*.05,.14,B0[2]+DIR[1]*.7+RIGHT[1]*.05];
   arrow3(s,c,[a,mix3(a,b,.35*acr+.1),mix3(a,b,acr)],Math.max(8,kAt(c,B0)*.05),R,.95);}
  const out=sm(tO-.15,tO+.25,t,easeOutBack)*(1-sm(tSp+.2,tSp+.6,t));
  if(out>.02){const p=pr(c,[B0[0]-DIR[0]*.08+RIGHT[0]*.1,.12,B0[2]-DIR[1]*.08+RIGHT[1]*.1]);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(60,kAt(c,B0)*.35)*out,{n:9,seed:61,width:Math.max(6,kAt(c,B0)*.04)});}
  // 4 · the spin: two arrows circling the ball's equator (counter-clockwise seen from above: its right side goes forward)
  const sp=sm(tSp-.15,tSp+.35,t,easeOutBack)*(1-sm(tCv+.6,tCv+1.1,t));
  if(sp>.02){const P=ballAt(Math.min(tau,FLY)),rad=.11*2.3,rot=spinAt(tau)*.15;for(const k of[0,1]){const pts:V3[]=[];for(let i=0;i<=10;i++){const th=rot+k*Math.PI+i/10*Math.PI*.72*sp;pts.push([P[0]+Math.cos(th)*rad,P[1],P[2]-Math.sin(th)*rad]);}
   arrow3(s,c,pts,Math.max(5,kAt(c,P)*.035),Y,.95);}}
 },
 still:9,
};

const film:RisoStory={
 id:'roberto-carlos-free-kick-1997',format:'11v11',title:"Roberto Carlos's banana free kick",
 theme:'Shooting: strike across the ball with the outside of the foot, the spin makes it curve (the Magnus effect)',
 ageNote:'Brazil 1–1 France, Tournoi de France, Stade de Gerland, Lyon, 3 June 1997. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a little banana — a yellow curl that swings out and hooks back, with a spinning ball on its tip. Reduced motion: the still curl. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),dir=hash(seed,2)<.5?1:-1,r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+dir*(170*k-150*k*k*k),y-230*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],34,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
