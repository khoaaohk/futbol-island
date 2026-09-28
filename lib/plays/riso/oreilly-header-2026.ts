/** Nico O'Reilly's far-post header — Arsenal 0–2 Manchester City, EFL Cup (Carabao Cup) final, Sunday 22 March 2026, Wembley Stadium,
 * London: his SECOND goal of the final (64'). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the broadcast footage itself was not
 * reviewed), rendered as a riso print.
 *
 * WHICH GOAL AND WHY: O'Reilly headed both goals. The first (60') came from a goalkeeping error; per the brief the film leaves that out
 * entirely (never shown, never described — the narration only says he "has just scored a header") and celebrates the clean second one.
 *
 * SOURCES (read Sept 26 2026 with curl, cached in the build scratchpad cardfilms6/src/):
 *  - Wikipedia, "2026 EFL Cup final" (raw wikitext): 22 March 2026, Wembley, 88,486, referee Peter Bankes; Arsenal 0–2 Manchester City;
 *    O'Reilly 60', 64'; "Nico O'Reilly then doubled City's lead with another header from a cross by Matheus Nunes in the 64th minute from the
 *    right"; man of the match (Alan Hardaker Trophy); kits: Arsenal red shirts (F00000), white shorts, red socks; City sky-blue shirts
 *    (98C6EB), white shorts, navy socks (1C214F); O'Reilly LB No. 33, Matheus Nunes No. 27 (right-back).
 *    https://en.wikipedia.org/wiki/2026_EFL_Cup_final
 *  - BBC Sport live report, "O'Reilly the hero as Man City beat Arsenal to win EFL Cup", 22 March 2026: "O'Reilly swiftly doubled City's
 *    advantage, arriving at the far post to power home Matheus Nunes' cross with another header"; assists: Matheus Nunes (64'); numbers
 *    33 O'Reilly, 27 Matheus Nunes. https://www.bbc.co.uk/sport/football/live/cy030p56zx4t
 *  - BBC Sport, Shamoon Hafez, "Boyhood Man City fan to Wembley winner – O'Reilly's fairytale continues", 22 March 2026: "a pair of
 *    second-half headers into the goal in front of his club's ecstatic supporters"; "The second just four minutes later was a
 *    brilliantly-placed header from Matheus Nunes' cross"; "O'Reilly took the adulation of the City fans after his goals"; he turned 21
 *    the day before; Guardiola: "strong in the aerial actions especially offensively". https://www.bbc.co.uk/sport/football/articles/cn4vzejl0pno
 *  - Card data: lib/town/playerProfiles.json ("Late runs into the box", "Strong heading for a full-back"), playerAppearance.json (skin 3,
 *    curly black hair).
 * CONFIRMED: date, Wembley, 0–0 at half-time, O'Reilly's two headers four minutes apart, the second from Matheus Nunes's cross from the
 *  RIGHT, O'Reilly ARRIVING AT THE FAR POST to power it home, the goal in front of the City fans, his celebration with them; kits as above.
 * INFERRED (illustrative, never named in the narration): that it was a cross on the run by Nunes (a right-footer's out-swinger); every
 *  position, run and timing (his late run from outside the box; the cross ≈ 1.15 s; the header ≈ .4 s to the line); WHERE the header went
 *  (drawn back across goal, low, inside the right-hand side — "brilliantly placed" is all the source says); the defenders (unnamed, no
 *  numbers); the keeper (unnamed; kit printed yellow — NOT verified) diving late; O'Reilly's height (1.85 m); the time of day and light; the
 *  crowd colours; which touchline the main camera is on (the arch over the far stand); every camera placement and lens.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Wembley → the box → Nunes running down the right
 * → the cross → O'Reilly arriving at the far post → the header, the net → he runs to the City fans); ch2 = the replay from HIGH BEHIND THE
 * GOAL, looking back up the pitch: his late run from outside the box, behind the defenders, to the far post (a yellow ring on him, the run
 * lit); ch3 = a second replay LOW ON THE GOAL LINE BY THE NEAR POST: the header comes back across at us (forehead ring, eyes-open sight line,
 * a down arrow), "two headers" = two yellow marks; ch4 = the lesson from behind his run (the lit late run, a ring on the ball at his forehead).
 * Distinct from lucio-header-2009 (a corner, not open play; night; different cameras). Composed on the FULL sheet. FIGURES: every body goes
 * through drawPlayer() → athlete.ts. Handedness: right-handed world (x toward Arsenal's goal, y up, +z = City's right), athlete.ts's
 * convention, so strike({foot:'r'}) is Nunes's RIGHT foot and the far post is z = −3.66. The keeper faces −x, so his dive to HIS LEFT
 * (side 'l') goes to +z. Inks: yellow, red, blue, navy. Everything keyed to cue times (withTiming), poses on twos, cameras on ones. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';
import timingJson from '../../../public/plays/narration/oreilly-header-2026/timing.json';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Wembley, 2026',text:"Wembley, the 2026 League Cup final. Arsenal against Manchester City. Nico O'Reilly has just scored a header. Four minutes later, Matheus Nunes crosses from the right... O'Reilly arrives at the far post. Another header! Goal!",tail:2.4,
  cues:['Wembley','Arsenal against','Nico',"Four minutes",'Matheus Nunes','crosses','arrives','Another header','Goal']},
 {label:'Arrive late',text:'Watch again. He starts outside the box, then runs in late, behind the defenders, to the far post.',tail:1.6,
  cues:['Watch again','starts outside','runs in late','behind the defenders','far post']},
 {label:'The header',text:'From beside the goal: forehead, eyes open, and power it down! Two headers in four minutes.',tail:2.2,
  cues:['From beside','forehead','eyes open','power it down','Two headers']},
 {label:'The secret',text:'Full-backs can score too! Arrive late in the box, and attack the ball with your forehead.',tail:2,
  cues:['Full-backs','Arrive late','attack the ball','forehead']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('oreilly: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('oreilly: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const DEG=Math.PI/180;
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

// ---------------------------------------------------------------- 3D projection
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

// ---------------------------------------------------------------- Wembley on a March afternoon: red seats in three tiers, the roof, the arch
const CX=-52.5;
/** 0 the far side (+z, under the arch), 1 behind Arsenal's goal (+x, City's fans), 2 the main stand (−z, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122,17,a),1.2+40*b,43+40*b],
 (a,b)=>[9+38*b,1.2+40*b,lerp(62,-62,a)],
 (a,b)=>[lerp(17,-122,a),1.2+36*b,-43-36*b],
 (a,b)=>[-114-38*b,1.2+40*b,lerp(-62,62,a)],
];
const STAND_COLS=[110,76,110,76],STAND_ROWS=18;
const FASCIA:[number,number][]=[[.3,.36],[.6,.66]];
const ARCH:V3[]=Array.from({length:33},(_,i)=>{const u=i/32,y=133*(1-Math.pow(2*u-1,2));return[CX+(u-.5)*315,y,80+y*Math.tan(22*DEG)];});
/** crowd: [paper (white), blue (City sky), red (Arsenal), yellow (flags)]; City's fans behind the goal O'Reilly scored in (sourced) */
const CROWD_MIX:[number,number,number,number][]=[[.2,.36,.38,.06],[.18,.64,.12,.06],[.2,.36,.38,.06],[.2,.14,.6,.06]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a clear March afternoon going to evening: blue sky screen, a warm band low down (time of day inferred)
 s.field(B,.42,.4);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-380],[1e4,hz[1]-380],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);s.tone(B,polyPath([[-1e4,hz[1]-3000],[1e4,hz[1]-3000],[1e4,hz[1]-700],[-1e4,hz[1]-700]],true),.3);}
 {const pts:Pt[]=[];let ok=true;for(const p of ARCH){const q=toCam(c,p);if(q[2]<8){ok=false;break;}pts.push(scr(c,q));}
  if(ok&&pts.length>2){const w=clamp(7.4*c.F/toCam(c,ARCH[16])[2],3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.95);s.stroke(K,tube,Math.max(1.5,w*.1),.7);
   const tick=new Path2D();for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w*.5,ny=dx/l*w*.5;tick.moveTo(pts[i][0]-nx,pts[i][1]-ny);tick.lineTo(pts[i][0]+nx+dx/l*w*.4,pts[i][1]+ny+dy/l*w*.4);}
   s.stroke(K,tick,Math.max(1.5,w*.08),.5);}}
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D(),shade=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const[b0,b1] of FASCIA)addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));
  addPoly(shade,polyP(c,[S(0,.72),S(1,.72),S(1,1),S(0,1)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.86),[0,11,0]),add3(S(0,.86),[0,11,0])]));
  seg3(c,add3(S(0,.86),[0,10.8,0]),add3(S(1,.86),[0,10.8,0]),.45,edge);}
 s.knockout(planes);s.tone(R,planes,.55);s.tone(K,planes,.18);s.tone(K,shade,.4);s.knockout(fas);s.fill(K,fas,.8);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.22)/.78,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.85);s.knockout(inks[1],.7);s.fill(B,inks[1],.55);s.knockout(inks[2],.7);s.fill(R,inks[2],.95);s.knockout(inks[3],.8);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(B,p,.8);}
}
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.7);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.2);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.5);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([CX,0,-34+k*17],[CX,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(CX,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 for(const cx of[-11,CX]){const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([cx+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** the US goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz; postHit flashes the left post */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number,postHit=0){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.4,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
 if(postHit>0){const ph=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.14,ph);s.fill(Y,ph,.95*postHit);}
}

// ---------------------------------------------------------------- the cast: kits
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_T:InkFill[]=[[Y,.52],[R,.36],[K,.12]],SKIN_D:InkFill[]=[[Y,.8],[R,.62],[K,.28]];
/** City: sky-blue shirts, white shorts, navy socks (sourced); navy numbers (inferred) */
const city=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],shorts:'paper',socks:[K,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:K,hairStyle:'short',number:null,build:{height:1.8,bulk:1},...o});
/** Arsenal: red shirts, white shorts, red socks (sourced); paper numbers (inferred) */
const ars=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:'paper',socks:[R,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',number:null,build:{height:1.83,bulk:1},...o});
const B_ORE:Build={height:1.85,bulk:1.02,thighs:1.04},B_NUN:Build={height:1.83,bulk:1},B_GK:Build={height:1.86};
/** Nico O'Reilly: No. 33, curly black hair, skin tone 3 (card data) */
const ORE_ST=city({number:33,hair:[K,.95],hairStyle:'curly',skin:SKIN_M,build:B_ORE,seed:33});
const NUN_ST=city({number:27,hair:[K,.9],skin:SKIN_T,build:B_NUN,seed:27});
const GK_ST:AthleteStyle={shirt:[Y,.9],shorts:[Y,.85],socks:[Y,.9],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,trim:K,gloves:'paper',sleeves:'long',number:null,build:B_GK,seed:13};

// ---------------------------------------------------------------- the play on one clock τ (τ = 0 is Nunes's cross)
const BALL_R=.11,GRAV=9.81;
const TF=1.15,TG=TF+.4;
/** O'Reilly's header spot (pelvis) at the far post, 4.6 m out; he meets it facing the ball, the goal over his LEFT shoulder */
const HP:[number,number]=[-4.6,-4.6],FACE:[number,number]=nrm2(-.28,.96),YAW_H=yawTo(FACE[0],FACE[1]);
/** the header: a big spring, forehead through the ball, head and shoulders turning LEFT (back across goal) and down */
function oreHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.15;const w=Math.sin(Math.PI*clamp((u-.3)/.42)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.1,.7,sn)*w;p.twist+=lerp(-.05,.32,sn)*w;p.neckP+=.25*w*sn;return p;}
const CU=.47,HD=1.0,TJ=TF-CU*HD;
const HEAD_PT:V3=(()=>{const sk=solve(oreHeader(CU),B_ORE,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.03,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** Nunes crosses on the run from the right (+z), level with the edge of the box */
const P0:V3=[-15.5,BALL_R,23.5];
const SWING:V3=[-1.2,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_K=yawTo(DC[0],DC[1]);
const PCK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_NUN,{x:0,z:0,yaw:YAW_K});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** his run down the right touchline */
const RUN:[number,number]=nrm2(1,-.12);
/** the header goes back across goal, low, inside the right-hand side (placement inferred) */
const GOAL_PT:V3=[0,.5,1.5],NET_HIT:V3=[1.5,.4,1.7],REST:V3=[1.2,BALL_R,1.6];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z]
type Role='ore'|'nun'|'gk'|'ars'|'city';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-8,T1=12,DT=.02;
const rp=(u:number):[number,number]=>[PCK[0]+RUN[0]*u,PCK[1]+RUN[1]*u];
/** after the goal he runs to the City fans behind the goal (sourced: "took the adulation of the City fans") */
const FANS:[number,number]=[-1.2,-15];
const ACTORS:Actor[]=[
 {name:"Nico O'Reilly",role:'ore',hero:true,style:ORE_ST,keys:[[T0,-22,-10],[-4,-20.4,-9.4],[-1.6,-19.2,-8.6],[-.8,-17.2,-7.6],[0,-13.2,-6.4],[TJ-.28,HP[0],HP[1]],[TF+.4,HP[0],HP[1]],[TF+1.2,-3.2,-7.4],[TF+3.2,-1.8,-11.5],[TF+5,FANS[0],FANS[1]],[T1,FANS[0],FANS[1]]]},
 {name:'Matheus Nunes',role:'nun',hero:true,style:NUN_ST,keys:[[T0,...rp(-44)],[-3,...rp(-20)],[-1,...rp(-6.8)],[0,...rp(0)],[.8,...rp(4.6)],[2.4,...rp(9)],[T1,-6,19]]},
 {name:'keeper',role:'gk',hero:true,style:GK_ST,keys:[[T0,-1.2,2.4],[-1,-1,2.2],[0,-1,1.6],[TF-.4,-1.05,-.6],[TF,-1.05,-1],[T1,-1,-1]]},
 {name:'Arsenal near post',role:'ars',style:ars({skin:SKIN_D,build:{height:1.9},seed:41}),keys:[[T0,-10,4.6],[-1,-7,4.2],[0,-5.6,3.2],[TF,-5.2,2.6],[T1,-5,2.4]]},
 {name:'Arsenal centre',role:'ars',style:ars({build:{height:1.92},seed:42}),keys:[[T0,-12,1],[-1,-9.4,.8],[0,-7.6,.4],[TF,-6.8,-.2],[T1,-6.4,-.4]]},
 {name:'Arsenal marker',role:'ars',style:ars({skin:SKIN_M,seed:43}),keys:[[T0,-13,-3],[-1,-10.6,-2.6],[0,-8.8,-2.2],[TF,-7.6,-2.4],[T1,-7,-2.4]]},
 {name:'Arsenal full-back',role:'ars',style:ars({seed:44}),keys:[[T0,-18,18],[-1,-15,20.5],[0,-14,21.8],[TF,-12.4,20.4],[T1,-11.6,19]]},
 {name:'Arsenal midfield',role:'ars',style:ars({seed:45}),keys:[[T0,-24,4],[-1,-19,3],[0,-17,2.6],[TF,-15.6,2],[T1,-15,1.6]]},
 {name:'City striker',role:'city',style:city({build:{height:1.95,bulk:1.1},hair:[Y,.75],hairStyle:'ponytail',seed:61}),keys:[[T0,-12,3],[-1,-8.6,2.2],[0,-7,1.6],[TF,-6.2,1],[T1,-5,-2]]},
 {name:'City winger',role:'city',style:city({skin:SKIN_D,seed:62}),keys:[[T0,-14,-1],[-1,-11,-.6],[0,-9.6,-.2],[TF,-8.6,-.4],[T1,-6.4,-4]]},
 {name:'City midfield',role:'city',style:city({seed:63}),keys:[[T0,-26,10],[-1,-21,9],[0,-19,8],[TF,-17,6.6],[T1,-12,-6]]},
];
const ORE=0,NUN=1,GK=2;
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
/** Nunes carries it down the right (a touch ahead of him), crosses, O'Reilly heads it back across into the net */
function ballAt(tau:number):V3{
 if(tau<=0){const[x,z]=posOf(NUN,tau),ph=(distOf(NUN,tau)/2.6)%1,lead=tau>-.35?lerp(.7,0,sm(-.35,0,tau)):.5+.5*ph;const t=[x+RUN[0]*lead,BALL_R,z+RUN[1]*lead-.1] as V3;return tau>-.35?mix3(t,P0,sm(-.35,0,tau)):t;}
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?distOf(NUN,tau)*2:tau<TF?tau*TAU*4:TF*TAU*4+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));
const postAt=(_tau:number)=>0;

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** in front of the fans: arms wide, chest out */
const FANS_POSE=posed({lShA:120,rShA:120,lShF:20,rShF:20,lElb:10,rElb:10,lHipF:10,rHipF:6,lKnee:12,rKnee:8,lean:-10,pitch:-3,neckP:-20,lHand:1,rHand:1});
/** the keeper: set, then a late dive to HIS LEFT (+z) as the header goes back across him */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.2}),T_DIVE=TF+.06,DIVE_L=.95;
type State={pose:Pose;place:Place};
const T_FANS=TF+5;
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'ore':{
   if(tau<-2)yaw=faceYaw(k,tau,ballAt(tau));
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=oreHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau)*(1-sm(T_FANS-.5,T_FANS,tau)));}
   if(tau>T_FANS-.5){pose=blendPose(pose,FANS_POSE,sm(T_FANS-.5,T_FANS,tau));yaw=lerpAng(yaw,0,sm(T_FANS-.8,T_FANS,tau));}
   const w=sm(TJ-.5,TJ-.1,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'nun':{const w=win(tau,-.5,.8,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   yaw=lerpAng(yawTo(RUN[0],RUN[1]),YAW_K,sm(-.45,-.1,tau)*(1-sm(.5,1,tau)));
   if(tau>TG+.5){pose=blendPose(pose,celebrate(tau*.9,{kind:'arms'}),sm(TG+.5,TG+1.1,tau)*.8);}break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(-1.2,-.6,tau)*(1-sm(TF-.85,TF-.65,tau)));
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));}
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'ars':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.6);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'city':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- figure adapter, ball, scene
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
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number;post:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz,goal.post)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===ORE&&tau>TJ&&tau<TF+.3)||(k===NUN&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],post:postAt(tau)});
}

type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,w=.07){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<14;i++)gaps.push([(i+.66)/14,(i+.96)/14]);
 const d=ribbon(pts,Math.max(5,kAt(c,P)*w),{seed:31,close:true,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}

function ringPx(s:Sheet,g:Pt,rr:number,ink:string,a:number,seed=8){if(a<=0)return;const ring:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU;ring.push([g[0]+Math.cos(u)*rr,g[1]+Math.sin(u)*rr]);}const rp_=ribbon(ring,Math.max(4,rr*.14),{seed,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*a);s.fill(ink,rp_,.95*a);}
/** his late run lit on the grass from a start time to τ */
function runPath(s:Sheet,c:Cam,t0:number,t1:number,ink:string,a:number){if(a<=0||t1<=t0)return;const pts:V3[]=[];for(let i=0;i<=14;i++){const[x,z]=posOf(ORE,lerp(t0,t1,i/14));pts.push([x,.02,z]);}arrow3(s,c,pts,clamp(kAt(c,pts[7])*.1,7,26),ink,.9*a);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tH=CUE(0,'Another header')-.05;return Math.max(T0+.5,t-(tH-TF));}
const P1:V3=[-22,23,-70];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-20,10,22],fov:38})],
  [CUE(0,'Arsenal against')-.3,1.3,()=>({P:P1,T:[-10,1,3],fov:18})],
  [CUE(0,'Nico')-.2,1,()=>({P:P1,T:at(ORE,tau,1.1),fov:7})],
  [CUE(0,'Four minutes')-.2,1.1,()=>({P:P1,T:mix3(at(NUN,tau,1),[-10,1,8],.3),fov:13})],
  [CUE(0,'crosses')-.2,1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[HP[0],1.5,HP[1]],.3+.5*sm(0,TF,tau)),fov:lerp(13,16,sm(0,.9,tau))})],
  [CUE(0,'arrives')-.1,.7,()=>({P:P1,T:[HP[0]+1.4,1.3,HP[1]+1.6],fov:8.5})],
  [CUE(0,'Goal')+.2,1.4,()=>{const w=at(ORE,tau,1.1);return{P:P1,T:mix3(w,[-2,1,-12],.3),fov:13};}],
 ]);
}
const ch1:Scene={
 draw(s,t){frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tG=CUE(0,'Goal'),tN=CUE(0,'Another header')+.3;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tG-.3,tG+.2,t)*(1-sm(tG+2,tG+3,t))});
  ground(s,c);
  // "Nico O'Reilly": a yellow ring under him (he has already scored once)
  groundRing(s,c,at(ORE,tau,0),.8,Y,win(t,CUE(0,'Nico')-.1,CUE(0,'Four minutes')+.4,.3),.14);
  play(s,c,tau,tp,{min:15,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Another header')+.2;},
};

// ---------------------------------------------------------------- 2 · the replay from high behind the goal: the late run, behind the defenders, to the far post
const tau2=(t:number)=>key(t,mono([[0,-2.4],[CUE(1,'starts outside'),-1.8],[CUE(1,'runs in late'),-.8],[CUE(1,'behind the defenders'),TJ-.55],[CUE(1,'far post'),TF-.12],[SECS(1)-.2,TG+.35]]),linear);
const E2:V3=[9,9.5,-5];
function cam2(t:number):Cam{
 const tau=tau2(t),r=at(ORE,tau,1);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-14,.5,-3],fov:34})],
  [CUE(1,'starts outside')-.2,1,()=>({P:E2,T:mix3(r,[-10,0,-4],.3),fov:26})],
  [CUE(1,'behind the defenders')-.2,1,()=>({P:add3(E2,[-1,-1,0]),T:mix3(r,[-7,0,-2],.4),fov:24})],
  [CUE(1,'far post')-.2,.9,()=>({P:add3(E2,[-2,-2,0]),T:[HP[0]-.5,1,HP[1]+.5],fov:20})],
 ]);
}
const ch2:Scene={
 draw(s,t){frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  const tS=CUE(1,'starts outside'),tR=CUE(1,'runs in late'),tB=CUE(1,'behind the defenders'),tF=CUE(1,'far post');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.5,tau));
  // "starts outside the box": the box edge glows under him
  const so=win(t,tS-.1,tR+.4,.3);if(so>0){const e=polyP(c,[[-16.5,.01,-9],[-16.1,.01,-9],[-16.1,.01,1],[-16.5,.01,1]]);if(e.length>2){const ep=polyPath(e,true);s.knockout(ep,.8*so);s.fill(Y,ep,.95*so);}}
  groundRing(s,c,at(ORE,tau,0),.8,Y,sm(tS-.3,tS+.1,t)*(1-sm(TJ-.1,TJ+.1,tau)),.12);
  // "runs in late": his run lit as it happens
  runPath(s,c,-1.8,Math.min(tau,TJ-.2),Y,sm(tR-.1,tR+.3,t)*(1-sm(TF+.2,TF+.6,tau)));
  // "behind the defenders": navy rings on the three defenders, all facing the ball
  const bd=win(t,tB-.1,tF+.6,.25);if(bd>0)for(const k of[3,4,5])groundRing(s,c,at(k,tau,0),.7,K,bd,.08);
  // "to the far post": a red ring on the spot, nobody there
  groundRing(s,c,[HP[0],0,HP[1]],1.1,R,sm(tF-.1,tF+.3,t)*(1-sm(TG,TG+.4,tau)),.1);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'far post')+.1;},
};

// ---------------------------------------------------------------- 3 · low on the goal line by the near post: forehead, eyes open, power it down
const tau3=(t:number)=>key(t,mono([[0,TJ-.5],[CUE(2,'forehead'),TF-.03],[CUE(2,'eyes open'),TF],[CUE(2,'power it down'),TF+.18],[CUE(2,'Two headers'),TG+.9],[SECS(2),TG+3]]),linear);
const E3:V3=[-1.8,1.4,9.4];
function cam3v(t:number):Cam{
 const tau=tau3(t);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0],1.6,HP[1]],fov:24})],
  [CUE(2,'forehead')-.3,.7,()=>({P:E3,T:[HEAD_PT[0],HEAD_PT[1]-.1,HEAD_PT[2]],fov:12})],
  [CUE(2,'power it down')-.1,.8,()=>({P:E3,T:mix3(HEAD_PT,GOAL_PT,.5),fov:24})],
  [CUE(2,'Two headers')-.2,1.4,()=>({P:add3(E3,[-2,2,0]),T:at(ORE,tau,1.2),fov:20})],
 ]);
}
const ch3:Scene={
 draw(s,t){frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tF=CUE(2,'forehead'),tE=CUE(2,'eyes open'),tP=CUE(2,'power it down'),tT=CUE(2,'Two headers');
  stadium(s,c,t,[1,2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const st=stateOf(ORE,tau),sk=solve(st.pose,B_ORE,st.place);
  // "forehead": a yellow ring on his forehead
  const fh=win(t,tF-.1,tP+.3,.2);if(fh>0){const q=pr(c,sk.face);if(q)ringPx(s,q,kAt(c,sk.face)*.16,Y,fh,11);}
  // "eyes open": a dashed yellow sight line from his eyes to the ball
  const eo=win(t,tE-.1,tP+.1,.2);if(eo>0){const a=pr(c,sk.face),b=pr(c,ballAt(Math.min(tau,TF)));if(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])>8){const rb=new Path2D();for(let i=0;i<5;i++){const u0=i/5,ue=(i+.6)/5;rb.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)]],Math.max(4,kAt(c,sk.face)*.02),{seed:3+i,taper:.2,wobble:0}));}s.knockout(rb,.95*eo);s.fill(Y,rb,.95*eo);}}
  // "power it down": the header's path as a yellow arrow
  const pd=win(t,tP-.1,tT+.5,.25);if(pd>0){const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*i/8*clamp((t-tP+.1)/.6)));arrow3(s,c,q,Math.max(7,kAt(c,HEAD_PT)*.035),Y,.95*pd);}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // "Two headers in four minutes": two small balls pop up above him, each ringed
  const th=sm(tT-.1,tT+.4,t,easeOutBack);if(th>.02){const h=pr(c,add3(sk.head,[0,.7,0]));if(h){const rr=kAt(c,sk.head)*.14;for(const[i,dx] of [[0,-1],[1,1]] as [number,number][]){const a=clamp((t-tT+.1-i*.35)/.35);if(a<=0)continue;const g:Pt=[h[0]+dx*rr*1.6,h[1]-rr*.4*easeOutBack(a)];ringPx(s,g,rr*1.25*easeOutBack(a),Y,1,40+i);footballPanels(s,g[0],g[1],rr*.8*easeOutBack(a),{rot:i,key:K,shadow:B,seed:5});}}}
 },
 aperture(t){const c=cam3v(t),p=stateOf(ORE,tau3(twos(t))),sk=solve(p.pose,B_ORE,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],50,12);},
 get still(){return CUE(2,'power it down')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: from behind his run
const tau4=(t:number)=>key(t,mono([[0,-2.2],[CUE(3,'Full-backs'),-1.9],[CUE(3,'Arrive late'),-1.2],[CUE(3,'attack the ball'),TJ-.1],[CUE(3,'forehead'),TF-.02],[CUE(3,'forehead')+1,TF+.08],[SECS(3),TF+.25]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(ORE,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-26,4.5,-14],T:mix3(w,[-10,.5,-5],.4),fov:26})],
  [CUE(3,'Arrive late')-.2,1.1,()=>({P:[-24,4,-13],T:mix3(w,[HP[0],.8,HP[1]],.5),fov:26})],
  [CUE(3,'attack the ball')-.2,.9,()=>({P:[-17,2.6,-10],T:mix3([HP[0],1.6,HP[1]],HEAD_PT,.4),fov:22})],
  [CUE(3,'forehead')-.2,.8,()=>({P:[-14,2.4,-8.5],T:HEAD_PT,fov:14})],
 ]);
}
const ch4:Scene={
 draw(s,t){frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tB=CUE(3,'Full-backs'),tA=CUE(3,'Arrive late'),tK=CUE(3,'attack the ball'),tF=CUE(3,'forehead');
  stadium(s,c,t,[0,1],{roar:.35+.3*sm(tF+.2,tF+.8,t)});
  ground(s,c);
  groundRing(s,c,at(ORE,tau,0),.8,Y,win(t,tB-.1,tK+.2,.3),.14);
  // "Arrive late in the box": the run drawn ahead of him as a red arrow into the far-post zone, the zone lit
  const al=sm(tA-.1,tA+.9,t,easeInOutSine)*(1-sm(tF+.6,tF+1.2,t));
  if(al>0){const zone=polyP(c,[[-.2,.01,-2.6],[-6.5,.01,-2.6],[-6.5,.01,-7.5],[-.2,.01,-7.5]]);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.3*al);s.tone(Y,zp,.35*al);}
   runPath(s,c,-1.2,lerp(-1.2,TJ-.2,al),R,1);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[ORE,NUN,GK,3,4,5]});
  // "attack the ball": the cross's last metres dashed in, a red ring where he meets it
  const ak=win(t,tK-.1,tF+.8,.25);if(ak>0){const pts:Pt[]=[];for(let i=0;i<=14;i++){const p=pr(c,flyA(P0,V_CROSS,SWING,lerp(TF*.55,TF,i/14)));if(p)pts.push(p);}if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.62)/8,(i+.98)/8]);const d=ribbon(pts,clamp(kAt(c,HEAD_PT)*.06,6,20),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*ak);s.fill(Y,d,.95*ak);}
   groundRing(s,c,[HP[0],0,HP[1]],.85,R,ak);}
  // "with your forehead": a ring on his forehead and a burst on the ball
  const fh=sm(tF-.1,tF+.3,t,easeOutBack);if(fh>.02){const st=stateOf(ORE,tau),sk=solve(st.pose,B_ORE,st.place),q=pr(c,sk.face);if(q)ringPx(s,q,kAt(c,sk.face)*.17*clamp(fh),Y,1,41);
   if(r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*5)*clamp(fh),{n:10,seed:61,width:Math.max(5,r.ball.r*.5)});}
 },
 get still(){return CUE(3,'forehead')+.3;},
};

const film:RisoStory={
 id:'oreilly-header-2026',format:'11v11',title:"O'Reilly's far-post header",
 theme:'Full-backs can score: arrive late in the box, get to the far post and attack the ball with your forehead',
 ageNote:'Arsenal 0–2 Manchester City, EFL Cup final, Wembley, 22 March 2026 — his second header of the final. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a header — a ball floats in, a yellow spark where the forehead meets it, and it is powered away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-180*(1-u):x+150*easeOut(out),by=age<.3?y-110*(1-u)*(1-u):y+70*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts — checked by tests/play-film-oreilly-header-2026.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,crossFoot:'r' as const,
 nunesContact:()=>{const st=stateOf(NUN,0),sk=solve(st.pose,B_NUN,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 oreillyAt:(tau:number)=>{const st=stateOf(ORE,tau),sk=solve(st.pose,B_ORE,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 oreillyPos:(tau:number)=>posOf(ORE,tau)};
