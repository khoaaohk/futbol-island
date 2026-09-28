/** Ronald Koeman's free kick — Barcelona 1–0 Sampdoria (a.e.t.), European Cup final, Wednesday 20 May 1992, Wembley Stadium (the old
 * Wembley), London: the 112th-minute goal that won Barcelona their first European Cup. An iconic-play riso film (RisoStory, chapters mode)
 * played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the broadcast footage
 * itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 26 2026 with curl, cached in the build scratchpad cardfilms6/src/):
 *  - Wikipedia, "1992 European Cup final" (raw wikitext): 20 May 1992, Wembley Stadium, London, 70,827; Barcelona won 1–0 after extra time
 *    "thanks to a Ronald Koeman free kick", Koeman 112'; Barcelona's first triumph in the competition; kits: Barcelona all orange (FF8000);
 *    Sampdoria white shirts, blue shorts (0000FF), white socks; Koeman SW No. 4, Bakero No. 6, Stoichkov No. 8, Pagliuca GK No. 1.
 *    https://en.wikipedia.org/wiki/1992_European_Cup_final
 *  - UEFA Champions Journal, Simon Hart, "How Koeman's thunderbolt sparked Barcelona into life": "the right foot of Ronald Koeman and a
 *    free-kick of such ferocity"; referee Aron Schmidhuber penalised Giovanni Invernizzi "a few metres from his own box"; "Stoichkov, his left
 *    foot on the ball, touched it to José Mari Bakero, who teed up Koeman. Pagliuca anticipated correctly but the flight of the ball was so
 *    swift and crisp that it cut through the Samp players rushing out of the wall and flashed past the keeper's right hand like an arrow into
 *    the corner"; "Koeman sprinted to the corner flag and vanished beneath a mob of orange shirts".
 *    https://www.champions-journal.com/interview/koeman-turning-point
 *  - World Football Index, "Sampdoria vs Barcelona 1992 European Cup Final": an indirect free kick after Invernizzi halted Eusebio;
 *    "Stoichkov touched the ball to Bakero who stopped it for the onrushing Koeman to hit. The shot arrowed into the far corner past the
 *    outstretched Pagliuca"; Barcelona "in their orange shirts". https://worldfootballindex.com/2020/04/sampdoria-vs-barcelona-1992-european-cup-final-tactics/
 *  - FC Barcelona, "FC Barcelona's first European Cup success: Wembley 1992": "Koeman's 112th minute free kick decided the game".
 * CONFIRMED: the date, the old Wembley, 0–0 into extra time, the 112th minute; an indirect free kick a few metres outside the Sampdoria box;
 *  Stoichkov's LEFT-foot touch to Bakero, Bakero STOPPING it, Koeman running on to it and striking with his RIGHT foot; low and swift
 *  THROUGH the players rushing out of the wall; PAST PAGLIUCA'S RIGHT HAND into the (far) CORNER — Pagliuca had read it; Koeman's sprint to
 *  the corner flag and the orange pile-on; Barcelona's first European Cup; kits as above.
 * INFERRED (illustrative, never named in the narration): the exact spot (drawn ≈ 21 m out, right of centre — consistent with "far corner" =
 *  the keeper's right); the directions of the touch and the stop; the height of the shot (≈ .4 m, rising a little); its speed (≈ .75 s to
 *  the line); the wall (4 players plus one charging out, unnamed, no numbers); Pagliuca's kit (printed yellow) and dive; the referee;
 *  the corner Koeman ran to; the old stadium drawn as a roofed bowl behind a running track with the twin towers at the far end; the crowd;
 *  a night sky (kick-off 20:15 BST, extra time ≈ 22:10); every camera placement and lens.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the old Wembley and its twin towers at night →
 * the free kick → the touch, the stop, the strike → goal → Koeman sprints away); ch2 = the slow-motion replay LOW BEHIND KOEMAN (the straight
 * run, head over the ball, the laces through the middle, a riso trail); ch3 = the second replay from BEHIND THE GOAL (through the players
 * rushing out, past the keeper's right hand, into the corner; then the sprint to the corner flag and the orange shirts); ch4 = the lesson
 * (a ring on the middle of the ball, the laces, a low-and-hard line). Composed on the FULL sheet. FIGURES: every body goes through
 * drawPlayer() → athlete.ts. Handedness: right-handed world (x toward Sampdoria's goal, y up, +z = Barcelona's right), athlete.ts's
 * convention, so strike({foot:'r'}) is Koeman's RIGHT foot; Pagliuca faces −x, so HIS RIGHT is −z (keeperDive side 'r'). Inks: yellow,
 * orange (Barcelona), blue (Sampdoria's shorts, the night), navy. Everything keyed to cue times (withTiming), poses on twos, cameras on ones. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';
import timingJson from '../../../public/plays/narration/koeman-free-kick-1992/timing.json';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Wembley, 1992',text:'Wembley, 1992, the European Cup final. Barcelona against Sampdoria, still nil-nil in extra time. Free kick! Hristo Stoichkov touches it to José Mari Bakero, who stops it... Ronald Koeman strikes it with his right foot. Goal! Barcelona win their first European Cup!',tail:2.4,
  cues:['Wembley','Barcelona against','extra time','Free kick','Hristo','stops','Ronald Koeman','Goal','first European']},
 {label:'Watch it again',text:'Watch again, slowly. Koeman runs in straight, head over the ball. He hits it hard, through the middle, with his laces.',tail:1.4,
  cues:['Watch again','runs in','head over','hits it hard','laces']},
 {label:'Into the corner',text:"From behind the goal: it flies through the players rushing out, past the keeper's hand, into the corner! Koeman sprints to the corner flag.",tail:2.4,
  cues:['From behind','rushing out','past the','into the corner','sprints']},
 {label:'The secret',text:'The secret? Strike through the middle of the ball with your laces, and keep it low and hard.',tail:1.8,
  cues:['The secret','middle','laces','low and hard']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('koeman: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('koeman: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',O='orange',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
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

// ---------------------------------------------------------------- the old Wembley at night: a roofed bowl behind the running track, the twin towers
const CX=-52.5;
/** stands set back behind the track (a along, b up the rake): 0 far side (+z), 1 behind Sampdoria's goal (+x), 2 main stand (−z), 3 the tower end (−x) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-130,25,a),1.5+22*b,52+30*b],
 (a,b)=>[20+30*b,1.5+22*b,lerp(62,-62,a)],
 (a,b)=>[lerp(25,-130,a),1.5+22*b,-52-30*b],
 (a,b)=>[-125-30*b,1.5+22*b,lerp(-62,62,a)],
];
const STAND_COLS=[110,76,110,76],STAND_ROWS=14;
/** crowd: [paper (Sampdoria white, Barcelona scarves' white), orange (Barcelona), blue (Sampdoria), yellow (Catalan flags)] */
const CROWD_MIX:[number,number,number,number][]=[[.22,.36,.3,.12],[.24,.3,.36,.1],[.22,.36,.3,.12],[.2,.4,.28,.12]];
/** the twin towers (white, domed, a flagpole) behind the −x end */
const TOWERS:[number,number][]=[[-168,-14],[-168,14]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-900],[1e4,hz[1]-900],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);
 // the twin towers, floodlit white against the night
 {const tw=new Path2D(),dome=new Path2D(),pole=new Path2D();for(const[x,z] of TOWERS){addPoly(tw,polyP(c,[[x,0,z-3.4],[x,0,z+3.4],[x,38,z+3.4],[x,38,z-3.4]]));
   const d:V3[]=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI;d.push([x,38+5.5*Math.sin(a),z+3.6*Math.cos(a)]);}addPoly(dome,polyP(c,d));seg3(c,[x,43.5,z],[x,50,z],.25,pole);}
  s.knockout(tw,.95);s.tone(Y,tw,.12);s.knockout(dome,.95);s.stroke(K,dome,2,.7);s.fill(K,pole,.9);}
 const planes=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1,0]),add3(S(1,1),[0,1,0]),add3(S(1,.7),[0,9,0]),add3(S(0,.7),[0,9,0])]));
  seg3(c,add3(S(0,.7),[0,8.8,0]),add3(S(1,.7),[0,8.8,0]),.45,edge);}
 s.knockout(planes);s.tone(K,planes,.55);s.tone(O,planes,.18);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.24)/.76,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(O,inks[1],.95);s.knockout(inks[2],.7);s.fill(B,inks[2],.95);s.knockout(inks[3],.8);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.7),[0,8.4,0]),b=add3(S(u+.03,.7),[0,8.4,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(O,p,.8);}
}
function ground(s:Sheet,c:Cam,o:{goal?:boolean}={}){
 // the running track round the pitch (orange-brown), then the grass
 const tr=polyP(c,[[-128,0,-50],[22,0,-50],[22,0,50],[-128,0,50]]);if(tr.length>2){const tp=polyPath(tr,true);s.knockout(tp);s.tone(O,tp,.55);s.tone(K,tp,.3);}
 const g=polyP(c,[[-115,0,-42],[10,0,-42],[10,0,42],[-115,0,42]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.72);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.2);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.22,zz],[x+3.4,.22,zz],[x+3.4,.66,zz],[x,.66,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.6);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(O,flag,.95);
 if(o.goal!==false)goal3(s,c,0,0);
}
function goal3(s:Sheet,c:Cam,bulge:number,bz:number,by=.5){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.4,2)-Math.pow((y-by)/1,2));
 const zs=[z0,-2.6,-1.4,0,1.4,2.6,z1],ys=[0,.63,1.27,1.9];
 const net=new Path2D();addPoly(net,polyP(c,[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]]));addPoly(net,polyP(c,[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]]));
 addPoly(net,polyP(c,[[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]));addPoly(net,polyP(c,[...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(const z of zs){seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);for(let j=0;j<ys.length-1;j++)seg3(c,[back(z,ys[j]),ys[j],z],[back(z,ys[j+1]),ys[j+1],z],.022,mesh,.7);}
 for(const y of ys.slice(1))for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);
 s.knockout(mesh,.8);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);s.fill(K,fo,.9);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast
const SKIN_L:InkFill[]=[[Y,.35],[O,.14]],SKIN_M:InkFill[]=[[Y,.42],[O,.22],[K,.06]];
/** Barcelona: all orange (sourced); navy numbers (inferred) */
const bar=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[O,.95],shorts:[O,.9],socks:[O,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:K,hairStyle:'short',number:null,...o});
/** Sampdoria: white shirts, blue shorts, white socks (sourced); blue trim (inferred) */
const sam=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[B,.95],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[B,.9],numberInk:[B,.95],hairStyle:'short',number:null,...o});
const B_KOE:Build={height:1.81,bulk:1.06,thighs:1.08},B_STO:Build={height:1.78},B_BAK:Build={height:1.72,bulk:.96},B_PAG:Build={height:1.9};
/** Ronald Koeman: No. 4, strawberry-blond hair (inferred detail) */
const KOE_ST=bar({number:4,hair:[Y,.8],build:B_KOE,seed:4});
const STO_ST=bar({number:8,hair:[K,.95],build:B_STO,seed:8});
const BAK_ST=bar({number:6,hair:[K,.9],skin:SKIN_M,build:B_BAK,seed:6});
const PAG_ST:AthleteStyle={shirt:[Y,.9],shorts:[K,.85],socks:[Y,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,trim:K,gloves:'paper',sleeves:'long',number:1,numberInk:K,build:B_PAG,seed:1};
const REF_ST:AthleteStyle={shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'balding',line:K,trim:'paper',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- the free kick on one clock τ (τ = 0 is Koeman's strike)
const BALL_R=.11,GRAV=9.81;
/** where the ball is placed, where Bakero stops it, where the shot crosses the line (just inside Pagliuca's right-hand post, low) */
const B0:V3=[-22.1,BALL_R,4.3],B1:V3=[-21.2,BALL_R,3.3];
const GOAL_PT:V3=[0,.55,-3.05];
/** the touch and the stop come well before the strike: Bakero holds it under his sole while Koeman runs in */
const T_TOUCH=-3.2,T_STOP=-2.65,TG=.76;
const DIR=nrm2(GOAL_PT[0]-B1[0],GOAL_PT[2]-B1[2]),YAW_K=yawTo(DIR[0],DIR[1]);
const POWER=1;
const KPL:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:POWER,foot:'r'}),B_KOE,{x:0,z:0,yaw:YAW_K});return[B1[0]-DIR[0]*.12-sk.rToe[0],B1[2]-DIR[1]*.12-sk.rToe[2]];})();
const SD=.9,RUN_END=-STRIKE_CONTACT*SD,RUN_L=4.2,STRIKE_L=1.25,T_RUN0=RUN_END-1.1;
const kPos=(g:number):[number,number]=>[KPL[0]+DIR[0]*g,KPL[1]+DIR[1]*g];
/** Stoichkov: stands over the ball, a short LEFT-foot touch to his left-forward */
const TD=nrm2(B1[0]-B0[0],B1[2]-B0[2]),YAW_S=yawTo(TD[0],TD[1]);
const SPL:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:.3,foot:'l'}),B_STO,{x:0,z:0,yaw:YAW_S});return[B0[0]-TD[0]*.1-sk.lToe[0],B0[2]-TD[1]*.1-sk.lToe[2]];})();
/** Bakero: facing the ball, stops it under his right sole, then steps aside for the strike */
const SOLE=posed({rHipF:34,rKnee:36,rAnk:-26,lHipF:10,lKnee:22,lean:10,pitch:3,neckP:30,lShA:30,rShA:24,lElb:40,rElb:40});
const YAW_B=yawTo(B0[0]-B1[0]+.4,B0[2]-B1[2]-.6);
const BPL:[number,number]=(()=>{const sk=solve(SOLE,B_BAK,{x:0,z:0,yaw:YAW_B});return[B1[0]-sk.rToe[0]+Math.cos(YAW_B)*.02,B1[2]-sk.rToe[2]];})();
const V_SHOT=(()=>{const d=TG,a:V3=[0,-GRAV*.4,0];return[(GOAL_PT[0]-B1[0])/d,(GOAL_PT[1]-B1[1]-.5*a[1]*d*d)/d,(GOAL_PT[2]-B1[2])/d] as V3;})();
const NET_HIT:V3=[1.7,.45,-2.7],REST:V3=[1.3,BALL_R,-2.4];
function ballAt(tau:number):V3{
 if(tau<=T_TOUCH)return B0;
 if(tau<T_STOP){const u=easeOut((tau-T_TOUCH)/(T_STOP-T_TOUCH));return mix3(B0,B1,u);}
 if(tau<=0)return B1;
 if(tau<TG){const tt=tau;return[B1[0]+V_SHOT[0]*tt,B1[1]+V_SHOT[1]*tt-.5*GRAV*.4*tt*tt,B1[2]+V_SHOT[2]*tt];}
 if(tau<TG+.12)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.12));
 const u=clamp((tau-TG-.12)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.62)*9))*Math.exp(-(tau-TG-.62)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?(tau>T_TOUCH?(tau-T_TOUCH)*6:0):tau*TAU*4;
const bulgeAt=(tau:number)=>tau<TG+.06?0:Math.exp(-(tau-TG-.06)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- Koeman: the straight run, the strike, the sprint to the corner flag
const P_WAIT=posed({lHipF:-4,rHipF:10,lKnee:12,rKnee:18,lean:8,pitch:2,neckP:14,lShA:16,rShA:16,lElb:30,rElb:30});
const FLAG:[number,number]=[-1.5,32];
function koePlace(tau:number):Place{
 if(tau<T_RUN0){const[x,z]=kPos(-(RUN_L+STRIKE_L));return{x,z,yaw:YAW_K};}
 if(tau<RUN_END){const u=(tau-T_RUN0)/(RUN_END-T_RUN0);const[x,z]=kPos(-(RUN_L+STRIKE_L)+RUN_L*(u*u*(3-2*u)*.4+u*.6));return{x,z,yaw:YAW_K};}
 if(tau<.5){const v=clamp((tau-RUN_END)/(.5-RUN_END));const[x,z]=kPos(-STRIKE_L+(STRIKE_L+.9)*v);return{x,z,yaw:YAW_K};}
 // the sprint to the corner flag (+z), arms out
 const s0=kPos(.9),u=clamp((tau-.5)/4.4),e=u*u*(3-2*u);return{x:lerp(s0[0],FLAG[0],e),z:lerp(s0[1],FLAG[1],e),yaw:lerpAng(YAW_K,yawTo(FLAG[0]-s0[0],FLAG[1]-s0[1]),sm(.5,1.1,tau))};
}
function koePose(tau:number,it=0):Pose{
 if(tau<T_RUN0){const p=blendPose(P_WAIT,stand(),.3);p.neckP+=.03*Math.sin(it*2);return p;}
 if(tau<RUN_END){const u=(tau-T_RUN0)/(RUN_END-T_RUN0);return blendPose(P_WAIT,runCycle(2.2*u,{speed:.55}),sm(0,.25,u));}
 const us=STRIKE_CONTACT+tau/SD;let p=blendPose(runCycle(2.2+(tau-RUN_END)*1.6,{speed:.5}),strike(Math.min(1,us),{power:POWER,foot:'r'}),sm(RUN_END,RUN_END+.12,tau));
 if(tau>.45){const d=Math.hypot(...(()=>{const a=koePlace(tau),b=kPos(.9);return[(a.x??0)-b[0],(a.z??0)-b[1]] as [number,number];})());p=blendPose(p,celebrate(d/4.2,{kind:'run'}),sm(.45,.9,tau));}
 return p;
}
const koeSk=(tau:number)=>solve(koePose(tau),B_KOE,koePlace(tau));

// ---------------------------------------------------------------- Stoichkov, Bakero, Pagliuca, the wall, the others
function stoState(tau:number):{pose:Pose;place:Place}{
 let p=blendPose(P_WAIT,stand(),.4);const w=sm(T_TOUCH-.45,T_TOUCH-.2,tau)*(1-sm(T_TOUCH+.4,T_TOUCH+.8,tau));
 if(w>0)p=blendPose(p,strike(clamp((tau-T_TOUCH)/.9+STRIKE_CONTACT),{power:.3,foot:'l'}),w);
 let x=SPL[0],z=SPL[1];if(tau>T_TOUCH+.5){const u=clamp((tau-T_TOUCH-.5)/1.2);x-=1.4*u;z+=1.2*u;}
 if(tau>TG+.3){p=blendPose(p,runCycle((tau-TG)*1.6,{speed:.9}),sm(TG+.3,TG+.7,tau));const u=clamp((tau-TG-.3)/4.5),e=u*u*(3-2*u);x=lerp(x,FLAG[0]-2,e);z=lerp(z,FLAG[1]-2.5,e);}
 return{pose:p,place:{x,z,yaw:tau>TG+.3?yawTo(FLAG[0]-x,FLAG[1]-z):YAW_S}};
}
function bakState(tau:number):{pose:Pose;place:Place}{
 let p=blendPose(stand(),P_WAIT,.5);let x=BPL[0]+.35,z=BPL[1]-.25;
 const w=sm(T_STOP-.3,T_STOP,tau)*(1-sm(-.3,-.05,tau));if(w>0){p=blendPose(p,SOLE,w);x=lerp(x,BPL[0],w);z=lerp(z,BPL[1],w);}
 // steps aside to his right as Koeman arrives
 if(tau>-.3){const u=clamp((tau+.3)/.5);x+=.2*u;z-=.9*u;}
 if(tau>TG+.3){p=blendPose(p,runCycle((tau-TG)*1.6,{speed:.9}),sm(TG+.3,TG+.7,tau));const u=clamp((tau-TG-.3)/4.8),e=u*u*(3-2*u);x=lerp(x,FLAG[0]-3,e);z=lerp(z,FLAG[1]-3.2,e);}
 return{pose:p,place:{x,z,yaw:tau>TG+.3?yawTo(FLAG[0]-x,FLAG[1]-z):YAW_B}};
}
const PAG_X=-.75,PAG_Z=.5;
const T_DIVE=.28,DIVE_S=.95;
function pagState(tau:number):{pose:Pose;place:Place}{
 let p=keeperSet(tau*1.2);
 // he read it (sourced) and goes to his right, but it flashes past his right hand
 if(tau>T_DIVE-.15)p=blendPose(p,keeperDive(clamp((tau-T_DIVE)/DIVE_S),{side:'r',height:.18}),sm(T_DIVE-.15,T_DIVE,tau));
 return{pose:p,place:{x:PAG_X,z:PAG_Z,yaw:Math.PI}};
}
const pagSk=(tau:number)=>{const s=pagState(tau);return solve(s.pose,B_PAG,s.place);};
/** the wall, 9.15 m from the ball on the line to the near (+z) post, and the players charging out at the kick */
type WallMan={x:number;z:number;k:number};
const WALL:WallMan[]=(()=>{const n=nrm2(0-B1[0],3.66-B1[2]),c0:[number,number]=[B1[0]+n[0]*9.15,B1[2]+n[1]*9.15],p:[number,number]=[-n[1],n[0]];return[-1.5,-.5,.5,1.5].map((o,k)=>({x:c0[0]+p[0]*o*.62,z:c0[1]+p[1]*o*.62,k}));})();
const WALL_ST=[sam({build:{height:1.9},seed:41}),sam({seed:42,hair:[Y,.5]}),sam({seed:43,skin:SKIN_M}),sam({build:{height:1.86},seed:44})];
const RUSH_ST=sam({seed:45});
/** the one who charges out from beside the wall toward the ball (drawn: the shot passes just beside him) */
const RUSH0:[number,number]=[WALL[0].x-.4,WALL[0].z-1.8];
const HANDS=posed({lShF:40,rShF:40,lShA:10,rShA:10,lElb:120,rElb:120,lShR:40,rShR:40,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:4,neckP:6});
function wallState(m:WallMan,tau:number):{pose:Pose;place:Place}{
 let p=blendPose(stand(),HANDS,.9);let x=m.x,z=m.z;
 // at the kick they jump / step out
 if(tau>-.15&&tau<.6){const u=clamp((tau+.15)/.45);p=blendPose(p,posed({lHipF:30,rHipF:30,lKnee:44,rKnee:44,lShF:40,rShF:40,lElb:120,rElb:120,air:.25*Math.sin(Math.PI*u)}),Math.sin(Math.PI*u));x-=.5*u;}
 if(tau>TG+.3)p=blendPose(p,posed({lHipF:20,rHipF:20,lKnee:26,rKnee:26,lean:24,neckP:30,lShA:16,rShA:16}),sm(TG+.4,TG+1.2,tau)*.7);
 return{pose:p,place:{x,z,yaw:yawTo(B1[0]-m.x,B1[2]-m.z)}};
}
function rushState(tau:number):{pose:Pose;place:Place}{
 const u=clamp((tau+.3)/.9),x=RUSH0[0]-3*u*u,z=RUSH0[1]+.3*u;
 const p=tau<-.3?blendPose(stand(),P_WAIT,.5):runCycle(u*2.2,{speed:.7});
 return{pose:tau>TG+.3?blendPose(p,posed({lHipF:20,rHipF:20,lKnee:26,rKnee:26,lean:24,neckP:30}),sm(TG+.4,TG+1.2,tau)*.7):p,place:{x,z,yaw:yawTo(-1,.05)}};
}
const REF:Place={x:-15,z:-6,yaw:yawTo(-6,9)};
/** other Barcelona players waiting at the edge of the box, then chasing Koeman */
const OTHERS:{x:number;z:number;st:AthleteStyle}[]=[{x:-15.2,z:-3,st:bar({seed:61,hair:[Y,.6]})},{x:-14.6,z:-9,st:bar({seed:62})},{x:-17.5,z:9,st:bar({seed:63,skin:SKIN_M})}];
function otherState(i:number,tau:number):{pose:Pose;place:Place}{
 const o=OTHERS[i];let x=o.x,z=o.z,p=blendPose(stand(),P_WAIT,.4);
 if(tau>TG+.2){const u=clamp((tau-TG-.2-.15*i)/5),e=u*u*(3-2*u);x=lerp(o.x,FLAG[0]-2-i,e);z=lerp(o.z,FLAG[1]-4-i*.8,e);p=blendPose(p,runCycle((tau-TG)*1.7+i*.3,{speed:.9}),sm(TG+.2,TG+.6,tau)*(u<1?1:0));}
 return{pose:p,place:{x,z,yaw:tau>TG+.2?yawTo(FLAG[0]-o.x,FLAG[1]-o.z):yawTo(1,0)}};
}

// ---------------------------------------------------------------- drawing
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??14,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<TG+.2){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(220,d*1.3),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r};
}
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;wall?:boolean;only?:string[]};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const add=(name:string,st:{pose:Pose;place:Place},prev:{pose:Pose;place:Place}|undefined,style:AthleteStyle,hero:boolean,smear=false)=>{if(e.only&&!e.only.includes(name))return;
  const q=toCam(c,[st.place.x??0,.9,st.place.z??0]);if(q[2]<1)return;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)return;
  const px=k*ppu,sty:AthleteStyle=passing?{...style,detail:hero?'mid':'low'}:(!hero&&px<120)||px<44?{...style,detail:'low'}:style;
  items.push({d:q[2],draw:()=>drawPlayer(s,st.pose,c,sty,st.place,prev,smear&&!passing)});};
 add('koeman',{pose:koePose(tp,e.it),place:koePlace(tp)},{pose:koePose(tpp,e.it-1/12),place:koePlace(tpp)},KOE_ST,true,!!e.smear&&tp>RUN_END-.2&&tp<.3);
 add('stoichkov',stoState(tp),stoState(tpp),STO_ST,true);
 add('bakero',bakState(tp),bakState(tpp),BAK_ST,true);
 add('pagliuca',pagState(tp),pagState(tpp),PAG_ST,true,!!e.smear&&tp>T_DIVE&&tp<T_DIVE+.6);
 if(e.wall!==false){WALL.forEach((w,i)=>add('wall',wallState(w,tp),undefined,WALL_ST[i],false));add('wall',rushState(tp),undefined,RUSH_ST,false);}
 add('ref',{pose:blendPose(stand(),P_WAIT,.3),place:REF},undefined,REF_ST,false);
 OTHERS.forEach((o,i)=>add('others',otherState(i,tp),undefined,o.st,false));
 const P=ballAt(tau),bq=toCam(c,P);let out:{g:Pt;r:number}|null=null;
 if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{out=drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 {const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,bulgeAt(tau),GOAL_PT[2])});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out as {g:Pt;r:number}|null};
}
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
function ringPx(s:Sheet,g:Pt,rr:number,ink:string,a:number,seed=8){if(a<=0)return;const ring:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU;ring.push([g[0]+Math.cos(u)*rr,g[1]+Math.sin(u)*rr]);}const rp=ribbon(ring,Math.max(4,rr*.14),{seed,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*a);s.fill(ink,rp,.95*a);}
function trail(s:Sheet,c:Cam,t0:number,t1:number,fade:number){
 if(fade<=0||t1<=t0)return;const pts:Pt[]=[];for(let i=0;i<=18;i++){const p=pr(c,ballAt(lerp(t0,t1,i/18)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=clamp(kAt(c,ballAt(t1))*.16,6,22);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const kAtPlace=(tau:number,y=1):V3=>{const p=koePlace(tau);return[p.x??0,y,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
const tS1=()=>Math.max(CUE(0,'Ronald Koeman')+.9,CUE(0,'stops')+.6);
const tau1=(t:number)=>Math.max(-7,t-tS1());
const P1:V3=[-26,22,-66];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-90,20,10],fov:40})],
  [CUE(0,'Barcelona against')-.3,1.4,()=>({P:P1,T:[-14,1,1],fov:22})],
  [CUE(0,'Free kick')-.2,1,()=>({P:P1,T:[B1[0]+4,1,B1[2]],fov:12})],
  [CUE(0,'stops')+.2,1,()=>({P:P1,T:[B1[0]+3,1,B1[2]+.5],fov:10})],
  [CUE(0,'Ronald Koeman')-.2,.8,()=>({P:P1,T:[-14,1,1.2],fov:15})],
  [tS1()+.1,.5,()=>({P:P1,T:mix3([b[0],1,b[2]],[-4,1,-1],.3),fov:13})],
  [CUE(0,'Goal')+.3,1.4,()=>({P:P1,T:kAtPlace(tau,1.1),fov:15})],
 ]);
}
const ch1:Scene={
 draw(s,t){frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tG=CUE(0,'Goal');
  stadium(s,c,t,[0,1,3],{roar:sm(tG-.4,tG,t),flash:sm(tG-.2,tG+.2,t)*(1-sm(tG+2,tG+3,t))});
  ground(s,c,{goal:false});
  play(s,c,tau,tp,tpp,{it:tt,minBall:11,lines:true,prevT:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),g=pr(c,kAtPlace(tau1(twos(t)),1.1))??[0,0];return apertureDisc(g[0],g[1],40,12);},
 get still(){return tS1()+.3;},
};

// ---------------------------------------------------------------- 2 · slow-motion replay low behind Koeman: the straight run, head over it, laces through the middle
const tau2=(t:number)=>key(t,mono([[0,T_RUN0-.8],[CUE(1,'runs in'),T_RUN0+.05],[CUE(1,'head over'),RUN_END+.05],[CUE(1,'hits it hard'),-.02],[CUE(1,'laces'),.06],[SECS(1),.55]]),linear);
const E2:V3=[-31,1.5,6.9];
function cam2(t:number):Cam{
 const tau=tau2(t);
 return plan(t,[
  [0,0,()=>({P:E2,T:[B1[0],.8,B1[2]],fov:26})],
  [CUE(1,'runs in')-.2,1,()=>({P:add3(E2,[2,-.2,-.6]),T:mix3(kAtPlace(tau,.9),B1,.5),fov:22})],
  [CUE(1,'head over')-.2,.8,()=>({P:add3(E2,[4.5,-.5,-1.2]),T:add3(B1,[0,.5,0]),fov:18})],
  [CUE(1,'laces')+.2,1,()=>({P:add3(E2,[4.5,-.3,-1.2]),T:mix3(B1,GOAL_PT,.4),fov:24})],
 ]);
}
const ch2:Scene={
 draw(s,t){frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1],{roar:sm(TG,TG+.4,tau)});ground(s,c,{goal:false});
  trail(s,c,Math.max(0,tau-.5),Math.min(tau,TG),1-sm(TG+.1,TG+.5,tau));
  // "runs in straight": a straight red run line on the grass
  const ri=sm(CUE(1,'runs in')-.1,CUE(1,'runs in')+.6,t)*(1-sm(CUE(1,'laces'),CUE(1,'laces')+.5,t));
  if(ri>0){const a=kPos(-(RUN_L+STRIKE_L)),b=kPos(-STRIKE_L*.6),pa=pr(c,[a[0],.02,a[1]]),pb=pr(c,[lerp(a[0],b[0],ri),.02,lerp(a[1],b[1],ri)]);if(pa&&pb){const d=ribbon([pa,pb],clamp(kAt(c,[a[0],0,a[1]])*.1,6,24),{seed:5,taper:.3,wobble:.4});s.knockout(d,.85*ri);s.fill(O,d,.95*ri);s.stroke(K,d,2,.7*ri);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:['koeman','bakero','stoichkov','pagliuca','wall']});
  const sk=koeSk(tp);
  // "head over the ball": a yellow line from his head down to the ball
  const ho=sm(CUE(1,'head over')-.1,CUE(1,'head over')+.2,t)*(1-sm(CUE(1,'laces'),CUE(1,'laces')+.4,t));
  if(ho>0){const a=pr(c,sk.head),b=pr(c,B1);if(a&&b){const gaps:[number,number][]=[];for(let i=0;i<6;i++)gaps.push([(i+.6)/6,(i+.95)/6]);const d=ribbon([a,b],Math.max(5,kAt(c,sk.head)*.03),{seed:3,taper:.2,wobble:0,gaps});s.knockout(d,.9*ho);s.fill(Y,d,.95*ho);}}
  // "through the middle": a ring on the centre of the ball at contact; "laces": a ring on the boot
  const hm=sm(CUE(1,'hits it hard')-.1,CUE(1,'hits it hard')+.25,t,easeOutBack)*(1-sm(CUE(1,'laces')+.6,CUE(1,'laces')+1.1,t));
  if(hm>.02&&tau<.25){const q=pr(c,ballAt(tau));if(q)ringPx(s,q,kAt(c,B1)*.24*clamp(hm),Y,1,12);}
  const la=sm(CUE(1,'laces')-.1,CUE(1,'laces')+.3,t,easeOutBack);if(la>.02){const f=pr(c,mix3(sk.rAn,sk.rToe,.5));if(f)ringPx(s,f,kAt(c,sk.rToe)*.28*clamp(la),O,1,21);}
 },
 aperture(t){const c=cam2(t),q=pr(c,ballAt(tau2(twos(t))))??[0,0];return apertureDisc(q[0],q[1],30,12);},
 get still(){return CUE(1,'laces')+.1;},
};

// ---------------------------------------------------------------- 3 · from behind the goal: through the players rushing out, past his right hand, into the corner; the sprint
const tau3=(t:number)=>key(t,mono([[0,-.5],[CUE(2,'rushing out'),.24],[CUE(2,'past the'),TG-.14],[CUE(2,'into the corner'),TG+.08],[CUE(2,'sprints')-.2,TG+1],[SECS(2),TG+1+(SECS(2)-CUE(2,'sprints')+.2)*1.1]]),linear);
const E3:V3=[6.5,2.6,-6.4];
function cam3v(t:number):Cam{
 const tau=tau3(t);
 return plan(t,[
  [0,0,()=>({P:E3,T:[B1[0]+4,.9,B1[2]-1],fov:28})],
  [CUE(2,'past the')-.2,.6,()=>({P:E3,T:[-2.4,.8,-1.8],fov:30})],
  [CUE(2,'sprints')-.2,1.6,()=>({P:add3(E3,[-1,3,-2]),T:mix3(kAtPlace(tau,1),[FLAG[0],1,FLAG[1]],.3),fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tR=CUE(2,'rushing out'),tP=CUE(2,'past the'),tC=CUE(2,'into the corner');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG,TG+.3,tau)*(1-sm(TG+1.6,TG+2.4,tau))});ground(s,c,{goal:false});
  trail(s,c,Math.max(0,tau-.5),Math.min(tau,TG),1-sm(TG+.2,TG+.6,tau));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06)});
  // "rushing out": navy arrows on the charging players
  const ro=sm(tR-.1,tR+.3,t)*(1-sm(tP+.4,tP+.9,t));if(ro>0){for(const m of WALL.slice(0,2)){const a=pr(c,[m.x,.05,m.z]),b=pr(c,[m.x-1.6*ro,.05,m.z]);if(a&&b){const d=ribbon([a,b],clamp(kAt(c,[m.x,0,m.z])*.08,4,18),{seed:7,taper:.4,wobble:.3});s.knockout(d,.8*ro);s.fill(K,d,.9*ro);}}}
  // "past the keeper's hand": a yellow ring round his right glove, the ball just beyond it
  const ph=sm(tP-.1,tP+.25,t,easeOutBack)*(1-sm(tC+.8,tC+1.3,t));if(ph>.02){const g=pagSk(tp).rHa,q=pr(c,g);if(q)ringPx(s,q,kAt(c,g)*.22*clamp(ph),Y,1,14);}
  // "into the corner": the bottom corner lights up, a burst
  const ic=sm(tC-.1,tC+.3,t)*(1-sm(tC+1.6,tC+2.2,t));if(ic>0){const box=polyP(c,[[0,.05,-3.66],[0,.05,-2.4],[0,1.1,-2.4],[0,1.1,-3.66]]);if(box.length>2){const bp=polyPath(box,true);s.stroke(O,bp,Math.max(5,kAt(c,GOAL_PT)*.05),.95*ic);s.tone(O,bp,.3*ic);}
   const q=pr(c,GOAL_PT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,GOAL_PT)*.6)*easeOutBack(ic),{n:10,seed:27,width:Math.max(5,kAt(c,GOAL_PT)*.04)});}
  // behind-the-goal view: the net between us and the play
  goal3(s,c,bulgeAt(tau),GOAL_PT[2]);
 },
 aperture(t){const c=cam3v(t),g=pr(c,kAtPlace(tau3(twos(t)),1))??[0,0];return apertureDisc(g[0],g[1],40,12);},
 get still(){return CUE(2,'into the corner')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: through the middle, laces, low and hard
const tau4=(t:number)=>key(t,mono([[0,RUN_END-.5],[CUE(3,'middle'),-.05],[CUE(3,'laces'),.0],[CUE(3,'laces')+1,.02],[CUE(3,'low and hard'),.1],[SECS(3),TG+.3]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-24.5,1.2,1.2],T:add3(B1,[.3,.4,0]),fov:26})],
  [CUE(3,'middle')-.2,.8,()=>({P:[-23.4,.7,1.9],T:add3(B1,[0,.15,0]),fov:14})],
  [CUE(3,'low and hard')-.2,1,()=>({P:[-24,1.8,6.5],T:mix3(B1,GOAL_PT,.45),fov:34})],
 ]);
}
const ch4:Scene={
 draw(s,t){frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12),tM=CUE(3,'middle'),tL=CUE(3,'laces'),tH=CUE(3,'low and hard');
  stadium(s,c,t,[0,1,2],{roar:.3});ground(s,c,{goal:false});
  // "low and hard": a flat orange line from the ball to the corner, under the wall's heads
  const lh=sm(tH-.1,tH+.7,t,easeInOutSine);if(lh>0){const pts:Pt[]=[];for(let i=0;i<=12;i++){const p=pr(c,ballAt(TG*i/12*lh+.001));if(p)pts.push(p);}if(pts.length>2){const d=ribbon(pts,clamp(kAt(c,mix3(B1,GOAL_PT,.4))*.08,6,20),{seed:9,taper:.1,wobble:.4});s.knockout(d,.9);s.fill(O,d,.95);s.stroke(K,d,2,.7);}}
  const r=play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:14,only:['koeman','wall','pagliuca']});
  // "the middle of the ball": crosshair ring on the ball's centre
  const mm=sm(tM-.1,tM+.3,t,easeOutBack)*(1-sm(tH,tH+.5,t));if(mm>.02&&r.ball){ringPx(s,r.ball.g,r.ball.r*1.5*clamp(mm),Y,1,31);const g=r.ball.g,rr=r.ball.r*1.9,cr=new Path2D();cr.moveTo(g[0]-rr,g[1]);cr.lineTo(g[0]+rr,g[1]);cr.moveTo(g[0],g[1]-rr);cr.lineTo(g[0],g[1]+rr);s.stroke(K,cr,Math.max(2,r.ball.r*.1),.8*mm);}
  // "with your laces": a ring on the laces
  const la=sm(tL-.1,tL+.3,t,easeOutBack)*(1-sm(tH,tH+.5,t));if(la>.02){const sk=koeSk(tp),f=pr(c,mix3(sk.rAn,sk.rToe,.5));if(f)ringPx(s,f,kAt(c,sk.rToe)*.3*clamp(la),O,1,41);}
 },
 get still(){return CUE(3,'laces')+.3;},
};

const film:RisoStory={
 id:'koeman-free-kick-1992',format:'11v11',title:"Koeman's European Cup free kick",
 theme:'A powerful free kick: run in straight, keep your head over the ball and strike through the middle with your laces, low and hard',
 ageNote:'Barcelona 1–0 Sampdoria (after extra time), European Cup final, Wembley, 20 May 1992 — Barcelona\'s first European Cup. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a thunderbolt — the ball rockets away low with orange speed lines. Reduced motion: the ball. */
 touch(s,x,y,age,seed){
  const r=rng(seed),u=age<=0?0:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.55)/.25);
  if(age>0)speedLines(s,O,x+200*u,y-20*u,Math.PI,{n:4,seed,len:180*u,spread:40,width:9,cov:.9*fade});
  if(fade>0)footballPanels(s,x+200*u,y-20*u,28,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts — checked by tests/play-film-koeman-free-kick-1992.cjs. */
export const FACTS={B0,B1,GOAL_PT,TG,T_TOUCH,T_STOP,ballAt,
 koemanToes:()=>{const sk=koeSk(0);return{lToe:sk.lToe,rToe:sk.rToe};},
 stoichkovToes:()=>{const st=stoState(T_TOUCH),sk=solve(st.pose,B_STO,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 pagliucaHands:(tau:number)=>{const sk=pagSk(tau);return{lHa:sk.lHa,rHa:sk.rHa};},
 wall:WALL};
