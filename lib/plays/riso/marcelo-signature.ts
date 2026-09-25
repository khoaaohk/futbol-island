/** Marcelo's SIGNATURE film, "the attacking left-back" — Real Madrid 4–1 Atlético Madrid (after extra time), UEFA Champions League final,
 * Saturday 24 May 2014, Estádio da Luz, Lisbon: Marcelo's goal for 3–1 in the 118th minute. An iconic-play riso film (RisoStory,
 * chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from
 * WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the attacking left-back"; lesson "A full-back can attack too: time your run
 * when your team has the ball safely"). In the final Marcelo came on at left-back (for Fábio Coentrão, 59') and, in the 118th minute, a
 * DEFENDER, he was the man in the middle outside Atlético's box to take Cristiano Ronaldo's pass and score with his left foot. It is the
 * best-documented goal of his attacking game on the biggest stage, so it stands for the signature: a full-back arriving in attack.
 *
 * SOURCES (read 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2014 UEFA Champions League final" (raw wikitext; kits section cites UEFA.com "Atlético to wear home kit for final")
 *    https://en.wikipedia.org/wiki/2014_UEFA_Champions_League_final — "Ancelotti making a double substitution to replace Fábio Coentrão and
 *    Khedira with Marcelo and Isco"; "Cristiano Ronaldo squared the ball to Marcelo, who scored with his left foot … in the 118th minute";
 *    line-up: Marcelo DF 12 (on 59', yellow 118); both teams in HOME kits.
 *  - ESPN (Opta) commentary, gameId 392450 https://www.espn.com/soccer/commentary/_/gameId/392450 — "118' Goal! Real Madrid 3, Atlético de
 *    Madrid 1. Marcelo (Real Madrid) left footed shot from outside the box to the top right corner. Assisted by Cristiano Ronaldo."
 *    and "119' Marcelo … yellow card for excessive celebration".
 *  - BBC Sport, Phil McNulty, "Real Madrid 4–1 Atlético Madrid" https://www.bbc.com/sport/football/27383593 — "Substitute Marcelo added a
 *    third with a shot Courtois should have saved"; Atlético "exhausted" in extra time.
 *  - Wikipedia, "Marcelo (footballer, born 1988)" — "an extra-time strike from outside the box after coming on as a substitute for Fábio
 *    Coentrão"; naturally left-footed; attacking full-back, "deep runs".
 *  - lib/plays/riso/ramos-header-2014.ts (read-only) for the same night's kits and stadium.
 * CONFIRMED: the match, date, venue; Marcelo a substitute left-back, number 12; the goal in the 118th minute for 3–1; assisted by Ronaldo
 * (7), who "squared" the ball to him; Marcelo's LEFT foot; the shot from OUTSIDE the box; into the shooter's right ("top right") side of
 * Thibaut Courtois's goal (13); the BBC says Courtois should have saved it; Real Madrid all white, Atlético red-and-white stripes, blue
 * shorts, red socks; Real won 4–1.
 * INFERRED (illustrative): every position, run, speed and timing in metres and seconds; that Real had the ball in their own half before the
 * move and that Marcelo ran from deep up the inside-left channel; the midfielder's first pass; Ronaldo's pass from the left with his right
 * foot; the number and path of Marcelo's touches; the shooting spot (≈ 19.5 m out, a little left of centre) and the height (drawn ≈ 1.4 m,
 * the upper half, per Opta's "top"); Courtois diving late to his left without touching it; which end and the camera side (drawn: main
 * camera on the side of Real's left, Real attacking right → left on screen, as in the approved Ramos film); the unnamed players (Atlético
 * in stripes, Real in white, no numbers except the named three); Courtois in yellow; Marcelo's curly hair; the celebration run toward the
 * near touchline; the night light and the stadium. The narration names none of the inferred details (it does not say which part of the
 * goal, nor how high).
 *
 * FRAMING (TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Real keep the ball, the left-back sets off, Ronaldo
 * squares it, the carry, the left-footed shot, the net, the celebration); ch2 = the TV slow-motion REPLAY from a low camera behind the run
 * (Marcelo charges away from the lens, carries, looks up, strikes; tele onto the goal); ch3 = the lesson: a slow replay from a raised
 * three-quarter angle with teaching marks (his left-back spot, the safe ball ring, the lit footprints of the timed run, the pass and shot
 * arrows). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), 1.45:1 down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, `prev` secondary motion, motionSmear on the strike
 * and the dive). Handedness: the world is right-handed (x toward Atlético's goal, y up, +z = Real's right), athlete.ts's convention, so
 * Marcelo's strike({foot:'l'}) is his LEFT foot and the "top right corner" (shooter's right) is the +z side, Courtois's LEFT (dive side 'l').
 * Heat: small figures print at 'low', crowded frames cap full-detail non-heroes at 4, every figure inside a passage is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,backpedal,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Cue `words` are the match keys for the voice's word onsets (each starts with a plain word — no contraction or hyphen first); their `at`
 * and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Extra time',text:'Lisbon, 2014, the Champions League final, extra time. Marcelo is Real Madrid\'s left-back, a defender. But Real have the ball, so off he goes, sprinting forward! Cristiano Ronaldo squares it, Marcelo charges at goal and shoots with his left foot... Goal! Real lead three to one!',tail:2.2,
  cues:['Lisbon','Champions League final','extra time','Marcelo is','defender','Real have the ball','off he goes','sprinting','Cristiano','squares it','charges','shoots','Goal','Real lead']},
 {label:'Watch it again',text:'Watch again, slowly. Ronaldo squares it, and Marcelo is already there, running from deep. He carries it, looks up, and fires past the keeper.',tail:1.8,
  cues:['Watch again','Ronaldo squares','already there','running from deep','carries','looks up','fires','past the keeper']},
 {label:'Join the attack',text:'A full-back can attack too! First, your team keeps the ball safely. Then time your run, and join the attack.',tail:2,
  cues:['full-back','First','keeps the ball','Then time','join the attack']},
];
/** Kokoro timing: null until the lead voices the film (then import public/plays/narration/marcelo-signature/timing.json here). */
import timingJson from '../../../public/plays/narration/marcelo-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('marcelo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('marcelo: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
let LENS=1;
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D projection (right-handed metres, y up)
/** Pitch: Atlético's goal line x = 0 (Real attack +x), goal centre z = 0, +z = Real's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Estádio da Luz at night (as in the approved Ramos film)
/** stand planes: 0 the far side (+z), 1 behind Atlético's goal (+x), 2 the main stand (−z, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-128,24,a),1.4+27*b,42+34*b],
 (a,b)=>[9+32*b,1.4+25*b,lerp(-66,66,a)],
 (a,b)=>[lerp(24,-128,a),1.4+27*b,-42-34*b],
 (a,b)=>[-114-32*b,1.4+25*b,lerp(66,-66,a)],
];
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=14,TIER=[.46];
const FLAGS:[number,number,number][]=[[0,.28,0],[0,.4,1],[0,.55,0],[0,.68,1],[0,.82,0],[1,.2,0],[1,.38,0],[1,.6,1],[1,.8,0],[2,.25,1],[2,.4,0],[2,.6,0],[3,.35,1],[3,.62,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(K,.5,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.72),[0,12,0]),add3(S(0,.72),[0,12,0])]));
  seg3(c,add3(S(0,.72),[0,11.8,0]),add3(S(1,.72),[0,11.8,0]),.5,edge);}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.72),[0,12,0]),add3(A(ai,.72),[0,12,0])]));}
 s.knockout(planes);s.tone(R,planes,.62);s.tone(K,planes,.28);s.knockout(tier,.8);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.58?0:h<.8?1:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 const fl=new Path2D(),stripe=new Path2D(),crest=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===1){for(let k=0;k<3;k++){const u0=(2*k+.5)/6,u1=u0+1/6;addPoly(stripe,polyP(c,[P(u0,.005),P(u1,.005),P(u1,.075),P(u0,.075)]));}}
  else addPoly(crest,polyP(c,[P(.42,.028),P(.58,.028),P(.58,.052),P(.42,.052)]));}
 s.knockout(fl);s.fill(R,stripe,.95);s.fill(Y,crest,.95);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.72),[0,11,0]),b=add3(S(u+.025,.72),[0,11,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.35);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
function goal3(s:Sheet,c:Cam,bulge:number,bz:number,by:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2))*Math.exp(-Math.pow((y-by)/1.1,2));
 const zs=[z0,-2.6,-1.3,0,1.3,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,.95),.95,z],.022,mesh,.7);seg3(c,[back(z,.95),.95,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Real Madrid's home kit: all white, navy trim and numbers (trim inferred) */
const real=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:K,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Atlético's home kit: red-and-white stripes, blue shorts, red socks */
const atleti=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:'paper',shorts:B,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:[B,.9],numberInk:[B,.9],hairStyle:'short',build:{height:1.8,bulk:1},...o});
const B_MAR:Build={height:1.74,bulk:1,thighs:1.08},B_RON:Build={height:1.87,bulk:1.02,thighs:1.06},B_COU:Build={height:1.99,bulk:.98};
const MAR_ST=real({number:12,hairStyle:'curly',hair:[K,.95],skin:SKIN_M,build:B_MAR,seed:12});
const RON_ST=real({number:7,hair:[K,.9],skin:SKIN_L,build:B_RON,seed:7});
const COU_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.7],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:13,numberInk:K,build:B_COU,seed:13};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Marcelo's strike)
const BALL_R=.11,GRAV=9.81,G3:V3=[0,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
/** the shooting spot ≈ 19.5 m out (outside the box, x < −16.5), a little left of centre */
const S0:V3=[-19.6,BALL_R,-1.5];
/** the shot crosses the line in the shooter's RIGHT side (+z), upper half; TS s of flight */
const GOAL_PT:V3=[0,1.42,2.7],NET_HIT:V3=[1.6,1.1,2.85],REST:V3=[1.2,BALL_R,2.5],TS=.8;
const V_SHOT=launch(S0,GOAL_PT,TS,G3);
const DC=nrm2(GOAL_PT[0]-S0[0],GOAL_PT[2]-S0[2]),YAW_S=yawTo(DC[0],DC[1]),RIGHT:[number,number]=[-DC[1],DC[0]];
/** Marcelo's pelvis at contact so his LEFT boot meets the back of the ball (solved once, FK) */
const PCS:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),B_MAR,{x:0,z:0,yaw:YAW_S});return[S0[0]-DC[0]*.12-sk.lToe[0],S0[2]-DC[1]*.12-sk.lToe[2]];})();
const ms=(u:number,side=0):[number,number]=>[PCS[0]+DC[0]*u+RIGHT[0]*side,PCS[1]+DC[1]*u+RIGHT[1]*side];
/** the ball's stops: the midfielder's pass, Ronaldo's square pass (his right foot), Marcelo's receive, his second touch */
const MIDPASS:V3=[-46.6,BALL_R,-3.4],RONRECV:V3=[-40.2,BALL_R,-13.4],RONPASS:V3=[-32.6,BALL_R,-12.4],RECV:V3=[-30.4,BALL_R,-4.9],T2:V3=[-25,BALL_R,-2.7];
const TM=-6.4,TR=-5.7,TP=-2.6,TRC=-2.0,TT2=-1.05;
/** Ronaldo's pelvis at his pass so his RIGHT boot is at the ball */
const PD=nrm2(RECV[0]-RONPASS[0],RECV[2]-RONPASS[2]),YAW_P=yawTo(PD[0],PD[1]);
const PCR:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.35}),B_RON,{x:0,z:0,yaw:YAW_P});return[RONPASS[0]-PD[0]*.12-sk.rToe[0],RONPASS[2]-PD[1]*.12-sk.rToe[2]];})();
const behind=(P:V3,d:[number,number],k:number):[number,number]=>[P[0]-d[0]*k,P[2]-d[1]*k];
const D1=nrm2(T2[0]-RECV[0],T2[2]-RECV[2]),D2=nrm2(S0[0]-T2[0],S0[2]-T2[2]);

type Role='mar'|'ron'|'gk'|'mid'|'real'|'atl';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-13,T1=10,DT=.02;
const ACTORS:Actor[]=[
 {name:'Marcelo',role:'mar',hero:true,style:MAR_ST,keys:[[T0,-53,-21.4],[-8,-51.4,-20.8],[-5.4,-50,-20.3],[-4.2,-43.4,-15.4],[-3.1,-36.4,-10.4],[TRC,...behind(RECV,D1,.75)],[TT2,...behind(T2,D2,.72)],[-.5,...ms(-1.7,.35)],[0,...ms(0)],[.6,...ms(1)],[1.6,-15.5,-6],[3.6,-12,-16],[T1,-9,-27]]},
 {name:'Cristiano Ronaldo',role:'ron',hero:true,style:RON_ST,keys:[[T0,-45,-18],[-8,-43.2,-16],[TR,...behind(RONRECV,nrm2(1,.3),.7)],[-4.2,-37.5,-13.4],[-3.1,PCR[0]-1.3,PCR[1]-.2],[TP,...PCR],[-1.4,-28,-11.5],[0,-22,-9.8],[1.6,-17,-8],[3.6,-13,-14],[T1,-10,-24]]},
 {name:'Thibaut Courtois',role:'gk',hero:true,style:COU_ST,keys:[[T0,-3.2,-.8],[-4,-2.6,-.7],[-1.2,-1.4,-.4],[0,-1.05,-.25],[T1,-1.05,-.25]]},
 {name:'Madrid midfielder',role:'mid',style:real({skin:SKIN_M,seed:61}),keys:[[T0,-52.5,1.5],[-10,-50.5,-.6],[TM,...behind(MIDPASS,nrm2(RONRECV[0]-MIDPASS[0],RONRECV[2]-MIDPASS[2]),.7)],[-4,-44,-3],[T1,-36,-2]]},
 {name:'Madrid attacker 1',role:'real',style:real({hair:[R,.5],seed:62}),keys:[[T0,-34,13],[-6,-31,12],[-2,-24,10.5],[0,-17,8.8],[2,-13,4],[T1,-11,-8]]},
 {name:'Madrid attacker 2',role:'real',style:real({skin:SKIN_D,build:{height:1.9},seed:63}),keys:[[T0,-28,3.5],[-6,-26,5],[-2,-19,6.2],[0,-13.5,5.6],[2,-12,1],[T1,-11,-10]]},
 {name:'Atlético centre-back 1',role:'atl',hero:false,style:atleti({build:{height:1.86},seed:41}),keys:[[T0,-25,-5],[-6,-24,-4.6],[-2.4,-21,-4.6],[-1,-18,-4.8],[0,-17,-5.1],[T1,-15,-8]]},
 {name:'Atlético centre-back 2',role:'atl',style:atleti({skin:SKIN_M,seed:42}),keys:[[T0,-24,3],[-6,-23,3],[-2,-18.5,3.2],[0,-14.6,3.8],[T1,-11,6]]},
 {name:'Atlético full-back 1',role:'atl',style:atleti({build:{height:1.78},seed:43}),keys:[[T0,-30,-17],[-6,-31,-16],[-3,-29,-14.4],[-1,-25,-12.6],[0,-22.6,-11.8],[T1,-17,-10]]},
 {name:'Atlético full-back 2',role:'atl',style:atleti({skin:SKIN_D,seed:44}),keys:[[T0,-25,13],[-6,-24.5,12],[-2,-20,10],[0,-16,9],[T1,-12,6]]},
 {name:'Atlético midfielder 1',role:'atl',style:atleti({seed:45}),keys:[[T0,-39,-7],[-6,-38,-7],[-3,-35,-3],[-1,-30.5,-.4],[0,-28.5,.6],[T1,-24,2.4]]},
 {name:'Atlético midfielder 2',role:'atl',style:atleti({skin:SKIN_M,build:{height:1.76},seed:46}),keys:[[T0,-37,4],[-6,-36,3],[-2,-31,2],[0,-27,1.6],[T1,-22,1]]},
];
const MAR=0,RON=1,GK=2,MID=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** at a carrier's feet (a small dribble bob ahead of him), blended into the next pass spot */
function carried(k:number,tau:number,to:V3,t1:number):V3{const[x,z]=posOf(k,tau),v=velOf(k,tau),d=nrm2(v[0]+1e-3,v[1]),ph=distOf(k,tau)/1.6,ahead=.45+.25*Math.max(0,Math.sin(ph*TAU)),w=sm(t1-.45,t1,tau);
 return[lerp(x+d[0]*ahead,to[0],w),BALL_R,lerp(z+d[1]*ahead,to[2],w)];}
const roll=(A:V3,Bp:V3,u:number):V3=>mix3(A,Bp,easeOut(clamp(u))*.35+clamp(u)*.65);
function ballAt(tau:number):V3{
 if(tau<=TM)return carried(MID,tau,MIDPASS,TM);
 if(tau<TR)return roll(MIDPASS,RONRECV,(tau-TM)/(TR-TM));
 if(tau<=TP)return carried(RON,tau,RONPASS,TP);
 if(tau<TRC)return roll(RONPASS,RECV,(tau-TP)/(TRC-TP));
 if(tau<TT2)return roll(RECV,T2,(tau-TRC)/(TT2-TRC));
 if(tau<0)return roll(T2,S0,(tau-TT2)/(0-TT2));
 if(tau<TS)return flyA(S0,V_SHOT,G3,tau);
 if(tau<TS+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TS)/.14));
 const u=clamp((tau-TS-.14)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TS-.69)*9))*Math.exp(-(tau-TS-.69)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<0?tau*TAU*1.6:tau<TS?tau*TAU*5:TS*TAU*5+(tau-TS)*TAU;
const bulgeAt=(tau:number)=>tau<TS+.08?0:Math.exp(-(tau-TS-.08)*2.4)*(1+.3*Math.sin((tau-TS)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number,carry=false,foot:'l'|'r'='l'):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=carry?dribble(distOf(k,tau)/3.2+k*.37,{foot,speed:.8}):runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:20,rHipF:16,lKnee:24,rKnee:22,lean:12,pitch:4,neckP:-8,lShA:18,rShA:16,lElb:40,rElb:36}),.5+.5*Math.sin(tau*1.3+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** Courtois: set, then a late dive to his LEFT (+z for a keeper facing −x) */
const T_DIVE=.34,DIVE_L=.95,DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.62});
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'mar':{
   // the carry: dribble strides with the left foot on the ball; "looks up": head up before the plant
   const cw=win(tau,TRC-.15,-.45,.2);if(cw>0)pose=blendPose(pose,loco(k,tau,true,'l'),cw);
   if(tau>-.9&&tau<-.4){pose.neckP-=.5*win(tau,-.9,-.4,.15);}
   const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'l'}),w);
   yaw=lerpAng(yaw,YAW_S,sm(-.8,-.4,tau)*(1-sm(.8,1.4,tau)));
   if(tau<TRC-.1&&tau>TP-.6)yaw=lerpAng(yaw,faceYaw(k,tau,RECV),.35);
   if(tau>TS+.1){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TS+.2,TS+.9,tau));}
   break;}
  case 'ron':{
   const cw=win(tau,TR,TP-.5,.3);if(cw>0)pose=blendPose(pose,loco(k,tau,true,'r'),cw);
   const w=win(tau,TP-.5,TP+.7,.2);if(w>0)pose=blendPose(pose,strike(clamp((tau-TP)/1.0+STRIKE_CONTACT),{foot:'r',power:.35}),w);
   yaw=lerpAng(yaw,YAW_P,sm(TP-.7,TP-.35,tau)*(1-sm(TP+.5,TP+1,tau)));
   if(tau>TS+.4){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TS+.5,TS+1.1,tau)*.8);}
   break;}
  case 'mid':{const w=win(tau,TM-.5,TM+.7,.2);if(w>0)pose=blendPose(pose,strike(clamp((tau-TM)/1.0+STRIKE_CONTACT),{foot:'r',power:.45}),w);
   if(tau<=TM){const cw=win(tau,T0,TM-.5,.3);pose=blendPose(pose,loco(k,tau,true,'r'),cw);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(pose,set,sm(-2.4,-1.6,tau));
   if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));
   if(tau>TS+1.4)pose=blendPose(pose,DEJECT,sm(TS+1.6,TS+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,.1));if(tau>0)yaw=lerpAng(yaw,Math.PI,sm(0,.2,tau));break;}
  case 'atl':{// tired defenders retreat facing the ball (backpedal), then drop their heads
   const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),b=ballAt(Math.min(tau,0)),toB=nrm2(b[0]-x,b[2]-z),away=sp>.8&&(v[0]*toB[0]+v[1]*toB[1])/sp<-.2;
   if(away&&tau<.2){pose=blendPose(pose,backpedal(distOf(k,tau)/1.5+k*.3),clamp((sp-.8)/1.2));yaw=yawTo(toB[0],toB[1]);}
   if(tau>TS+.5)pose=blendPose(pose,DEJECT,sm(TS+.8,TS+1.8,tau)*.8);if(tau>.1)yaw=faceYaw(k,.1);break;}
  case 'real':if(tau>TS+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TS+.4,TS+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): prev = the pose one drawn frame earlier (hair and hem secondary motion),
 * smear = halftone echo + speed lines on fast limbs (the strike, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number;by:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz,goal.by)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===MAR&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:NET_HIT[1]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const gnd=(P:V3,y=1):V3=>[P[0],y,P[2]];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: ≈ real time between anchors (the midfielder has it, the left-back sets off on "off he goes", Ronaldo's pass on
 * "squares it", the strike on "shoots", the net on "Goal") */
const tau1=(t:number)=>key(t,mono([[0,-12.6],[CUE(0,'off he goes'),-5.5],[CUE(0,'squares it')+.1,TP],[CUE(0,'shoots')+.15,0],[CUE(0,'Goal'),TS+.2],[SECS(0),TS+3.4]]),linear);
const P1:V3=[-30,22,-68];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau),m=at(MAR,tau,1);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-42,0,-8],fov:15})],
  [CUE(0,'Marcelo is')-.3,1.4,()=>({P:P1,T:m,fov:5.2})],
  [CUE(0,'Real have')-.3,1.3,()=>({P:P1,T:mix3(gnd(b),m,.5),fov:9.5})],
  [CUE(0,'off he goes')-.2,1,()=>({P:P1,T:mix3(gnd(b),m,.6),fov:8.5})],
  [CUE(0,'charges')-.4,1,()=>({P:P1,T:mix3(gnd(b),[-6,1,0],.3),fov:9.5})],
  [CUE(0,'shoots')+.1,.7,()=>({P:P1,T:mix3(gnd(b),[-4,1,1],.6),fov:10})],
  [CUE(0,'Goal')+.3,1.3,()=>({P:P1,T:mix3(at(MAR,tau,1.1),[-4,1,0],.25),fov:7})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tG=CUE(0,'Goal');
  stadium(s,c,t,[0,1,3],{roar:sm(tG-.4,tG+.2,t),flash:sm(tG-.2,tG+.3,t)*(1-sm(tG+2.2,tG+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'shoots')+.3;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low behind the run
const tau2=(t:number)=>key(t,mono([[0,-3.5],[CUE(1,'Ronaldo squares'),TP-.05],[CUE(1,'already there'),TRC],[CUE(1,'running from deep'),-1.6],[CUE(1,'carries'),-1.15],[CUE(1,'looks up'),-.6],[CUE(1,'fires'),-.04],[CUE(1,'past the keeper'),.22],[SECS(1),TS+.9]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=at(MAR,tau,1.1),b=ballAt(tau);
 const P=mix3([-41,2.4,-13.5],[-30,1.9,-6.5],sm(CUE(1,'already there')-.5,CUE(1,'looks up')+.3,t,easeInOutSine));
 return plan(t,[
  [0,0,()=>({P,T:mix3(at(RON,tau,1),m,.5),fov:24})],
  [CUE(1,'already there')-.4,1,()=>({P,T:mix3(m,gnd(b,.5),.35),fov:17})],
  [CUE(1,'looks up')-.3,1,()=>({P,T:mix3(m,[-10,1.2,0],.25),fov:17})],
  [CUE(1,'fires')+.05,.9,()=>({P,T:mix3(gnd(b,b[1]),[0,1.3,1.8],.45),fov:11})],
  [CUE(1,'past the keeper')+.1,1,()=>({P,T:[-.8,1.2,1.4],fov:6.5})],
 ]);
}
/** the replay trail: the shot's path so far, a fading yellow ribbon */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.5),b=Math.min(tau,TS);for(let i=0;i<=18;i++){const p=pr(c,ballAt(lerp(a,b,i/18)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TS)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(TS,TS+.4,tau),flash:sm(TS+.05,TS+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TS+.2,TS+.7,tau));
  const r=play(s,c,tau,tp,{smear:true,min:10});
  const hit=tau/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4.5),{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(5,r.ball.r*.5)});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'fires')+.05;},
};

// ---------------------------------------------------------------- 3 · the lesson: a slow replay from a raised three-quarter angle, with teaching marks
const HOME:V3=[-50,0,-20.3];
const tau3=(t:number)=>key(t,mono([[0,-6.4],[CUE(2,'First'),-6.1],[CUE(2,'keeps the ball'),-5.7],[CUE(2,'Then time'),-5.3],[CUE(2,'join the attack'),TP],[SECS(2)-.4,TS+.2]]),linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),m=at(MAR,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-58,7,-31],T:mix3(m,[-47,0,-15],.3),fov:15})],
  [CUE(2,'keeps the ball')-.3,1.2,()=>({P:[-57,8,-33],T:mix3(m,gnd(ballAt(tau),0),.5),fov:22})],
  [CUE(2,'Then time')+.2,2,()=>({P:[-47,7,-27],T:mix3(m,[-30,0,-6],.4),fov:21})],
  [CUE(2,'join the attack')-.2,1.8,()=>({P:[-35,6,-17],T:mix3(m,[-8,1,0],.55),fov:23})],
 ]);
}
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 if(a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const rp=ribbon(pts,Math.max(5,kAt(c,P)*.09),{seed:8,close:true,wobble:.6,pressure:.2});s.knockout(rp,.9*a);s.fill(ink,rp,.95*a);s.stroke(K,rp,2,.6*a);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12);
  const tF=CUE(2,'full-back'),tK=CUE(2,'keeps the ball'),tR=CUE(2,'Then time'),tJ=CUE(2,'join the attack');
  stadium(s,c,t,[0,1,3],{roar:.3+.5*sm(tJ+1,tJ+2.2,t)});
  ground(s,c);
  // "a full-back": a red ring on his left-back spot
  groundRing(s,c,HOME,1.6,R,sm(tF-.1,tF+.3,t)*(1-sm(tR+1.2,tR+2,t)));
  // "keeps the ball safely": a yellow ring around the ball at a white shirt's feet
  const kb=sm(tK-.15,tK+.3,t)*(1-sm(tJ+.2,tJ+.8,t));if(kb>0){const P=ballAt(tau);groundRing(s,c,[P[0],0,P[2]],1.3,Y,kb);}
  // "time your run": his footprints from the left-back spot light up in order
  const rn=sm(tR-.2,tR+.3,t)*(1-sm(tJ+2,tJ+2.6,t));
  if(rn>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<14;k++){const Tk=-5.3+k*((TRC+5.3)/13),[x,z]=posOf(MAR,Tk),v=velOf(MAR,Tk),n=nrm2(-v[1],v[0]),side=k%2?.3:-.3,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.34,.01,z+n[1]*side+Math.sin(a)*.22]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*rn);s.stroke(K,lit,4,.9*rn);s.knockout(lit,rn);s.fill(Y,lit,.95*rn);}
  const r=play(s,c,tau,tp,{smear:true,min:10,only:[MAR,RON,GK,MID,6,10]});
  // "join the attack": the square pass, then the shot, drawn as arrows as they happen
  const ja=sm(tJ-.2,tJ+.2,t);
  if(ja>0){const pa=clamp((tau-TP+.1)/(TRC-TP+.1));if(pa>0){arrow3(s,c,[mix3(RONPASS,RECV,0),mix3(RONPASS,RECV,pa*.5),mix3(RONPASS,RECV,pa)].map(p=>[p[0],.05,p[2]] as V3),Math.max(7,kAt(c,RECV)*.18),R,.9*ja);}
   const sa=sm(-.1,TS,tau,easeInOutSine);if(sa>0){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(flyA(S0,V_SHOT,G3,TS*sa*i/8));arrow3(s,c,pts,Math.max(7,kAt(c,S0)*.14),Y,.95);}}
  if(r.ball&&tau>-.05&&tau<.3){const h=(tau+.05)/.35;sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4),{n:8,seed:31,g:easeOutBack(clamp(h*2))*(1-clamp((h-.5)*2)),width:6});}
 },
 get still(){return CUE(2,'Then time')+.6;},
};

const film:RisoStory={
 id:'marcelo-signature',format:'11v11',title:'Marcelo, the attacking left-back',
 theme:'A full-back can attack too: time your run when your team has the ball safely',
 ageNote:'Real Madrid 4–1 Atlético Madrid (after extra time), Champions League final, Lisbon, 24 May 2014 — Marcelo\'s goal, 118th minute. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a little left-footed shot — the ball sits, a spark, and it flies off with speed lines. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp((age-.15)/.45),fade=1-clamp((age-.6)/.2);
  if(age>.1&&age<.4)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.1)/.12))*(1-clamp((age-.25)/.15)),width:14});
  const bx=x+260*easeOut(u),by=y-90*Math.sin(Math.PI*u*.8);
  if(u>0&&fade>0)speedLines(s,K,bx,by,Math.PI,{n:4,seed,len:120*u,spread:24,width:4,cov:.8*fade});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Atlético's goal line x = 0, +z = Real's right) — checked by tests/play-film-marcelo-signature.cjs. */
export const FACTS={S0,GOAL_PT,TS,TP,TRC,RECV,RONPASS,ballAt,shotFoot:'l' as const,passer:'Cristiano Ronaldo',
 marceloContact:()=>{const st=stateOf(MAR,0),sk=solve(st.pose,B_MAR,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 ronaldoPass:()=>{const st=stateOf(RON,TP),sk=solve(st.pose,B_RON,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 marceloAt:(tau:number)=>posOf(MAR,tau),
 courtoisAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_COU,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
