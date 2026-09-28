/** Iconic-play film · Kyle Walker, "Signature: the recovery sprint" (lib/town/iconicPlays.json: kind "signature", template
 * last_ditch_tackle, side right; lesson "If a winger gets past you, don't give up: sprint back on the inside and win the ball."). A riso
 * film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer.
 *
 * A LABELLED DEMONSTRATION, NOT A MATCH. Walker's recovery pace is a trait seen in hundreds of games, but I found no written account that
 * describes ONE recovery sprint beat by beat (who, where, which minute) well enough to restage it (a search on 26 Sep 2026 turned up only
 * general scouting lines and a race he lost to Adama Traoré). So, per the brief, nothing here is claimed as a real match: the narration says
 * "Watch how he does it", and the setting is an evening training pitch — no crowd, no score, no date, no opponent club: Walker in a plain
 * light-blue training top, a winger in a yellow bib, cones on the touchline, floodlight masts, a training keeper.
 *
 * WHAT IS TRUE: Kyle Walker is a right-back (right-footed), famous for his speed and his recovery runs (card data: lib/town/playerProfiles.json,
 * lib/town/playerCareers.json; Wikipedia "Kyle Walker": English right-back, known for his pace). The coaching point is the card's lesson.
 * INFERRED (illustrative): everything in the demo — the winger's knock past on the outside, every position, path, speed and timing, which
 * way Walker turns (a drop-step toward the touchline side the ball went), the inside lane, the foot he pokes with (solved from the geometry:
 * his LEFT, the foot nearest the ball, never narrated), the kits, the ground and the evening sky.
 *
 * FRAMING (TV cameras, never top-down): ch1 = a raised touchline camera, real time: the winger dribbles at Walker, knocks the ball past him on
 * the outside and races away; ch2 = the camera runs with them low along the touchline: Walker turns, pumps his arms and sprints back on the
 * inside; ch3 = the slow-motion replay from BEHIND THE GOAL he protects: he gets in front of the winger and pokes the ball away; ch4 = the
 * lesson from high behind him (the only chapter with teaching marks: the winger ringed, the inside lane, the ball-to-goal line with him on
 * it, the win). Distinct from pacho-signature (a sunny training pitch, a ball chipped over a centre-back's head). Composed on the FULL sheet.
 * FIGURES: every body goes through drawPlayer() → athlete.ts. Handedness: right-handed world, athlete.ts's convention (x toward the goal
 * Walker defends, y up; a figure facing +x has +z on its right). He plays right-back, so facing up the pitch (−x) his right is −z: the flank
 * is the −z touchline. Inks: yellow, red, blue, navy. Everything keyed to cue times (withTiming), poses on twos, cameras on ones. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,runCycle,dribble,stand,keeperSet,celebrate,posed,blendPose,backpedal,lunge,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';
import timingJson from '../../../public/plays/narration/kyle-walker-signature/timing.json';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'How he does it',text:'Kyle Walker is one of the fastest defenders in the world. Watch how he does it! A winger dribbles at him, knocks the ball past him... and races away.',tail:1.4,
  cues:['Kyle Walker','fastest','Watch how','A winger','knocks','races']},
 {label:"Don't give up",text:"But Walker doesn't give up! He turns, pumps his arms, and sprints back on the inside.",tail:1.6,
  cues:['But Walker','turns','pumps','sprints back','inside']},
 {label:'The replay',text:'Watch again, from behind the goal. He gets in front of the winger, and pokes the ball away. Won it!',tail:1.8,
  cues:['Watch again','gets in front','pokes','Won it']},
 {label:'The lesson',text:"If a winger gets past you, don't give up! Sprint back on the inside, then win the ball.",tail:2,
  cues:['If a winger','Sprint back','inside','then win']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('walker: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('walker: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
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

// ---------------------------------------------------------------- the evening training ground: dusk sky, a tree line, a fence, floodlight masts
const MASTS:V3[]=[[8,0,-44],[8,0,44],[-60,0,-44],[-60,0,44],[-112,0,-44],[-112,0,44]];
function grounds(s:Sheet,c:Cam,t:number){
 // dusk: red low on the horizon under a blue-navy sky, stepped bands
 s.field(B,.62,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){const band=(y0:number,y1:number)=>polyPath([[-1e4,hz[1]-y0],[1e4,hz[1]-y0],[1e4,hz[1]-y1],[-1e4,hz[1]-y1]],true);
  s.tone(K,band(2000,420),.5);s.tone(K,band(420,240),.28);s.knockout(band(240,0),.35);s.tone(R,band(240,0),.5);s.tone(Y,band(120,0),.5);}
 // the tree line all round the ground: a navy ribbon of blobs sitting on the far fences
 const trees=new Path2D();
 const ring:[V3,V3][]=[[[30,0,-70],[30,0,70]],[[-140,0,-70],[30,0,-70]],[[-140,0,70],[30,0,70]],[[-140,0,-70],[-140,0,70]]];
 for(const[a,b] of ring){for(let i=0;i<22;i++){const u=i/22,P=mix3(a,b,u+.5/22),h=7+5*hash(i*13+a[0],3),q=toCam(c,P);if(q[2]<NEAR)continue;const g=scr(c,q),k=c.F/q[2],w=k*6.5,hh=k*h;
  trees.addPath(polyPath(blob(g[0],g[1]-hh*.55,w*.6,hh*.6,11+i,{n:14}),true));}}
 s.fill(K,trees,.88);
 // the green fence round the pitch (dark), and the floodlight masts with lamp heads and yellow halos
 const fence=new Path2D();const F=(a:V3,b:V3)=>addPoly(fence,polyP(c,[a,b,add3(b,[0,2.4,0]),add3(a,[0,2.4,0])]));
 F([12,0,-42],[12,0,42]);F([-116,0,-42],[12,0,-42]);F([-116,0,42],[12,0,42]);F([-116,0,-42],[-116,0,42]);
 s.knockout(fence);s.tone(K,fence,.62);s.tone(Y,fence,.25);
 const mast=new Path2D(),lamp=new Path2D(),halo=new Path2D();
 for(const m of MASTS){seg3(c,m,add3(m,[0,24,0]),.35,mast);const top=add3(m,[0,24,0]);seg3(c,add3(top,[0,0,-1.6]),add3(top,[0,0,1.6]),1.2,lamp);const g=pr(c,top);if(g){const r=clamp(kAt(c,top)*6,10,160);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.7,0,0,TAU);}}
 s.fill(K,mast,.9);s.knockout(halo,.3);s.tone(Y,halo,.45);s.knockout(lamp);s.fill(Y,lamp,.9);
}
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-116,0,-42],[12,0,-42],[12,0,42],[-116,0,42]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.8);s.tone(B,gp,.72);
 // worn training stripes run ACROSS the pitch (different from a match pitch's mowing)
 const st=new Path2D();for(let k=0;k<24;k+=2)addPoly(st,polyP(c,[[-110,0,-34+k*2.9],[5,0,-34+k*2.9],[5,0,-34+(k+1)*2.9],[-110,0,-34+(k+1)*2.9]]));s.tone(K,st,.12);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++)L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 s.knockout(ln);
 // orange-red training cones along the right-back's touchline
 const cone=new Path2D();for(let i=0;i<7;i++){const x=-46+i*6,z=-35.2,a=pr(c,[x,.5,z]),b=pr(c,[x-.25,0,z]),d=pr(c,[x+.25,0,z]);if(a&&b&&d)cone.addPath(polyPath([a,b,d],true));}
 s.knockout(cone);s.fill(R,cone,.95);s.fill(Y,cone,.5);
 goal3(s,c);
}
function goal3(s:Sheet,c:Cam){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=X+2;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back,1.9,z0],[back,0,z0]],[[X,0,z1],[X,H,z1],[back,1.9,z1],[back,0,z1]],[[X,H,z0],[X,H,z1],[back,1.9,z1],[back,1.9,z0]],[[back,0,z0],[back,0,z1],[back,1.9,z1],[back,1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();for(let i=0;i<=10;i++){const z=lerp(z0,z1,i/10);seg3(c,[X,H,z],[back,1.9,z],.022,mesh,.7);seg3(c,[back,1.9,z],[back,0,z],.022,mesh,.7);}
 for(let j=1;j<=4;j++){const y=1.9*j/5;seg3(c,[back,y,z0],[back,y,z1],.022,mesh,.7);}s.knockout(mesh,.8);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);s.fill(K,fo,.9);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_D:InkFill[]=[[Y,.8],[R,.6],[K,.3]];
const B_WAL:Build={height:1.83,bulk:1.02,thighs:1.08},B_WIN:Build={height:1.76,bulk:.94},B_GK:Build={height:1.9};
/** Walker: a plain light-blue training top (a blue screen), navy shorts, blue socks — no number, no crest (a demo) */
const WAL_ST:AthleteStyle={shirt:[B,.55],shorts:[K,.9],socks:[B,.55],boots:K,skin:SKIN_D,hair:[K,.95],hairStyle:'short',line:K,trim:[K,.8],number:null,build:B_WAL,seed:2};
/** the winger: a yellow training bib over a navy top */
const WIN_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[K,.85],boots:K,skin:SKIN_L,hair:[R,.5],hairStyle:'short',line:K,trim:[K,.9],number:null,build:B_WIN,seed:11};
const GK_ST:AthleteStyle={shirt:[R,.85],shorts:[K,.9],socks:[R,.85],boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,trim:K,gloves:'paper',sleeves:'long',number:null,build:B_GK,seed:1};

// ---------------------------------------------------------------- the demo on one clock τ (τ = 0: the winger knocks it past)
const T0=-4,T1=8,DT=.02;
const WIN_KEYS=[[T0,-44,-24.2],[-2,-38.2,-24.3],[-1,-35.2,-24.5],[0,-32.3,-24.7],[.5,-29.6,-26.0],[1.0,-26.0,-26.4],[1.5,-22.8,-26.3],[2.0,-19.9,-26.0],[2.5,-17.4,-25.8],[2.85,-15.9,-25.7],[3.5,-14.6,-25.4],[5,-13.8,-25],[T1,-13.4,-24.8]];
const WAL_KEYS=[[T0,-32.5,-23.8],[-2,-31.4,-23.8],[-1,-30.2,-23.8],[0,-29.3,-23.8],[.35,-29.15,-23.85],[.8,-28.2,-23.9],[1.3,-25.3,-24.0],[1.8,-21.3,-24.2],[2.3,-17.1,-24.5],[2.6,-15.1,-24.7],[2.85,-14.2,-24.8],[3.5,-13.7,-24.3],[5,-14.4,-22.6],[T1,-14.6,-22.2]];
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const mkTable=(keys:number[][])=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};};
const TAB=[mkTable(WAL_KEYS),mkTable(WIN_KEYS)];
const WAL=0,WIN=1;
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TAB[k].X,tau),samp(TAB[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TAB[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball: dribbled, knocked past on the outside, poked away by Walker
const BALL_R=.11,T_POKE=2.85;
const P_POKE:V3=[-14.3,BALL_R,-25.35];
function ballAt(tau:number):V3{
 if(tau<0){const[x,z]=posOf(WIN,tau),v=velOf(WIN,tau),sp=Math.hypot(v[0],v[1])||1,ph=(distOf(WIN,tau)/1.8)%1,lead=.45+.5*ph;return[x+v[0]/sp*lead,BALL_R,z+v[1]/sp*lead-.12];}
 if(tau<T_POKE){const e=1-Math.exp(-tau/1.3),e2=1-Math.exp(-T_POKE/1.3),x=lerp(-31.8,P_POKE[0],e/e2);return[x,BALL_R+.18*Math.max(0,Math.sin(Math.PI*clamp(tau/.28))),lerp(-24.9,P_POKE[2],sm(0,.7,tau))];}
 const u=1-Math.exp(-(tau-T_POKE)/.7),d:[number,number]=[-.28,.96];return[P_POKE[0]+d[0]*4.4*u,BALL_R,P_POKE[2]+d[1]*4.4*u];
}
const spinAt=(tau:number)=>tau*TAU*2.2;

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:22,lHipA:14,rHipA:14,lKnee:46,rKnee:40,lAnk:-8,rAnk:-8,lean:18,pitch:6,neckP:-6,lShA:30,rShA:30,lShF:14,rShF:10,lElb:50,rElb:50});
/** the drop-step: hips open toward the touchline side, weight back, then the first big push */
const DROP=posed({lHipF:50,rHipF:-10,lHipA:20,rHipA:8,lHipR:30,lKnee:70,rKnee:30,lAnk:10,rAnk:30,lean:30,pitch:10,twist:-24,neckY:30,neckP:-4,lShF:-40,rShF:60,lShA:20,rShA:24,lElb:90,rElb:90});
const T_TURN=.05,TURN_L=.32;
type State={pose:Pose;place:Place};
function walkerState(tau:number):State{
 const[x,z]=posOf(WAL,tau),v=velOf(WAL,tau),sp=Math.hypot(v[0],v[1]);let pose:Pose,yaw:number;
 if(tau<T_TURN){// jockeying backward, facing the winger (−x)
  pose=blendPose(READY,backpedal(distOf(WAL,tau)/1.4),.55);yaw=Math.PI;}
 else{const u=clamp((tau-T_TURN)/TURN_L),run=runCycle(distOf(WAL,tau)/4.4,{speed:clamp(sp/8.5)});
  pose=u<1?blendPose(blendPose(READY,DROP,sm(0,.5,u)),run,sm(.45,1,u)):run;
  // the turn: toward the touchline side (the ball went down the line on his right as he faced up the pitch) — yaw π → 0 through π/2 (facing −z)
  yaw=u<1?Math.PI-Math.PI*easeInOutSine(u):yawTo(v[0],v[1]);
  // the poke: a left-leg lunge at the ball, then he settles on it
  if(tau>T_POKE-.28){const lu=clamp((tau-(T_POKE-.28))/.46*.6/.6)*.6+(tau>T_POKE+.18?clamp((tau-T_POKE-.18)/.5)*.4:0);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_POKE-.28,T_POKE-.1,tau)*(1-sm(T_POKE+.6,T_POKE+1.1,tau)));}
  if(tau>T_POKE+.9){pose=blendPose(pose,READY,sm(T_POKE+.9,T_POKE+1.6,tau));yaw=lerpAng(yaw,yawTo(-.28,.96),sm(T_POKE+.5,T_POKE+1.2,tau));}
 }
 return{pose,place:{x,z,yaw}};
}
function wingerState(tau:number):State{
 const[x,z]=posOf(WIN,tau),v=velOf(WIN,tau),sp=Math.hypot(v[0],v[1]);let pose:Pose;
 if(tau<-.2)pose=dribble(distOf(WIN,tau)/1.8,{foot:'l',speed:clamp(sp/7)});
 else if(tau<.3)pose=blendPose(dribble(distOf(WIN,tau)/1.8,{foot:'l',speed:.6}),runCycle(distOf(WIN,tau)/4.2,{speed:.8}),sm(-.2,.3,tau));
 else pose=runCycle(distOf(WIN,tau)/4.2,{speed:clamp(sp/8)});
 // beaten to it: he pulls up, arms out
 if(tau>T_POKE+.2)pose=blendPose(pose,posed({lHipF:14,rHipF:8,lKnee:20,rKnee:16,lean:8,lShA:40,rShA:40,lElb:30,rElb:30,neckP:10}),sm(T_POKE+.2,T_POKE+1,tau));
 return{pose,place:{x,z,yaw:sp>.5?yawTo(v[0],v[1]):0}};
}
const GK_PLACE:Place={x:-1.2,z:-1.4,yaw:Math.PI};
const gkState=(tau:number):State=>({pose:blendPose(keeperSet(tau*1.1),stand(),.4),place:{...GK_PLACE,yaw:yawTo(ballAt(tau)[0]+1.2,ballAt(tau)[2]+1.4)}});

// ---------------------------------------------------------------- drawing
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*.2,0,P[2]+Math.sin(a)*.16]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),.4);
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.3),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r};
}
/** everything on the pitch, depth-sorted: Walker and the winger (prev = one drawn frame earlier), the training keeper, the ball */
function play(s:Sheet,c:Cam,tau:number,tp:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number}={}){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],passing=!!s._passage.pending;
 const add=(st:State,prev:State|undefined,style:AthleteStyle,hero:boolean,smear:boolean)=>{const q=toCam(c,[st.place.x??0,.9,st.place.z??0]);if(q[2]<1)return;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)return;
  const sty=passing?{...style,detail:hero?'mid' as const:'low' as const}:!hero?{...style,detail:'low' as const}:style;items.push({d:q[2],draw:()=>drawPlayer(s,st.pose,c,sty,st.place,prev,smear&&!passing)});};
 add(walkerState(tau),walkerState(tp),WAL_ST,true,!!o.smear&&tau>0&&tau<T_POKE+.3);
 add(wingerState(tau),wingerState(tp),WIN_ST,true,!!o.smear&&tau>-.2&&tau<2.6);
 add(gkState(tau),undefined,GK_ST,false,false);
 const P=ballAt(tau),bq=toCam(c,P);let out:{g:Pt;r:number}|null=null;
 if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{out=drawBall(s,c,P,spinAt(tau),{min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out as {g:Pt;r:number}|null};
}
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,w=.07){
 if(a<=0)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<14;i++)gaps.push([(i+.66)/14,(i+.96)/14]);
 const d=ribbon(pts,Math.max(5,kAt(c,P)*w),{seed:31,close:true,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}

// ---------------------------------------------------------------- 1 · real time from a raised touchline camera: the winger knocks it past
const tau1=(t:number)=>Math.max(T0,t-(CUE(0,'knocks')+.2));
const P1:V3=[-24,6.5,-50];
function cam1(t:number):Cam{
 const tau=tau1(t),mid=mix3(at(WAL,tau,1),at(WIN,tau,1),.5);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,6,-10],fov:44})],
  [CUE(0,'fastest')-.2,1.1,()=>({P:P1,T:at(WAL,tau,1.1),fov:8})],
  [CUE(0,'Watch how')-.2,1,()=>({P:P1,T:mix3(mid,[-30,1,-24],.2),fov:14})],
  [CUE(0,'A winger')-.1,1,()=>({P:P1,T:mix3(mid,ballAt(tau),.3),fov:11})],
  [CUE(0,'races')-.3,1,()=>({P:P1,T:mix3(at(WIN,tau,1),ballAt(tau),.5),fov:15})],
 ]);
}
const ch1:Scene={
 draw(s,t){frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12);grounds(s,c,t);ground(s,c);
  const r=play(s,c,tau,tp,{min:12,lines:true,prevBall:tau1(t-.06)});
  // the knock past: a yellow flick-spark at the ball as it goes by him
  const k=sm(-.05,.1,tau)*(1-sm(.4,.8,tau));if(k>0&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(30,r.ball.r*3.5)*easeOutBack(k),{n:7,seed:9,width:Math.max(4,r.ball.r*.35)});
  // "one of the fastest": speed lines trail Walker while the camera is close on him (he jogs across to his starting spot)
  const f=sm(CUE(0,'fastest')-.1,CUE(0,'fastest')+.3,t)*(1-sm(CUE(0,'Watch how'),CUE(0,'Watch how')+.5,t));
  if(f>0){const w=pr(c,at(WAL,tau,1.1));if(w)speedLines(s,Y,w[0],w[1],Math.PI,{n:4,seed:3,len:kAt(c,at(WAL,tau,1))*1.6*f,spread:kAt(c,at(WAL,tau,1))*.9,width:Math.max(4,kAt(c,at(WAL,tau,1))*.05),cov:.9});}
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'knocks')+.4;},
};

// ---------------------------------------------------------------- 2 · the camera runs with them low along the touchline: turn, arms, the sprint on the inside
const tau2=(t:number)=>key(t,mono([[0,-.25],[CUE(1,'turns'),T_TURN+.02],[CUE(1,'pumps'),.7],[CUE(1,'sprints back'),1.25],[CUE(1,'inside'),1.9],[SECS(1),2.45]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),w=at(WAL,tau,1.1),x=w[0];
 return plan(t,[
  [0,0,()=>({P:[x-2,1.6,-40],T:mix3(w,at(WIN,tau,1),.4),fov:26})],
  [CUE(1,'turns')-.2,.6,()=>({P:[x-1,1.4,-38.5],T:w,fov:18})],
  [CUE(1,'pumps')-.2,.8,()=>({P:[x+1.5,1.3,-37.5],T:add3(w,[0,.2,0]),fov:14})],
  [CUE(1,'sprints back')-.2,.8,()=>({P:[x+3,1.9,-39],T:mix3(w,at(WIN,tau,1),.35),fov:24})],
  [CUE(1,'inside')-.2,.8,()=>({P:[x+8,3.4,-33],T:mix3(w,at(WIN,tau,1),.5),fov:28})],
 ]);
}
const ch2:Scene={
 draw(s,t){frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);grounds(s,c,t);ground(s,c);
  play(s,c,tau,tp,{smear:true,min:12});
  // "turns": a red swoosh round his hips as he drops and turns
  const tu=sm(CUE(1,'turns')-.1,CUE(1,'turns')+.3,t)*(1-sm(CUE(1,'pumps'),CUE(1,'pumps')+.4,t));
  if(tu>0){const w=at(WAL,tau,.95),pts:V3[]=[];for(let i=0;i<=10;i++){const a=Math.PI+Math.PI*.9*i/10*clamp(tu*1.3);pts.push([w[0]+Math.cos(a)*.7,.95,w[2]-Math.sin(a)*.7]);}arrow3(s,c,pts,Math.max(6,kAt(c,w)*.05),R,.95*tu);}
  // "pumps his arms": yellow sparks on his hands
  const pu=sm(CUE(1,'pumps')-.1,CUE(1,'pumps')+.2,t)*(1-sm(CUE(1,'sprints back'),CUE(1,'sprints back')+.4,t));
  if(pu>0){const st=walkerState(tau),sk=solve(st.pose,B_WAL,st.place);for(const h of[sk.lHa,sk.rHa]){const q=pr(c,h);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(22,kAt(c,h)*.25)*easeOutBack(pu),{n:5,seed:17+(h===sk.lHa?0:3),width:Math.max(3,kAt(c,h)*.02)});}}
  // "on the inside": a yellow lane on the grass between the winger's line and the goal side
  const ins=sm(CUE(1,'inside')-.1,CUE(1,'inside')+.4,t);
  if(ins>0){const w=at(WAL,tau,0),zone=polyP(c,[[w[0]-6,.01,-24.6],[w[0]+6*ins+2,.01,-24.6],[w[0]+6*ins+2,.01,-23.2],[w[0]-6,.01,-23.2]]);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.35*ins);s.tone(Y,zp,.5*ins);}}
 },
 aperture(t){const c=cam2(t),st=walkerState(tau2(twos(t))),sk=solve(st.pose,B_WAL,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'sprints back')+.2;},
};

// ---------------------------------------------------------------- 3 · slow-motion replay from behind the goal he protects: in front, the poke
const tau3=(t:number)=>key(t,mono([[0,1.2],[CUE(2,'gets in front'),2.35],[CUE(2,'pokes'),T_POKE-.06],[CUE(2,'Won it'),T_POKE+.5],[SECS(2),T_POKE+1.4]]),linear);
const E3:V3=[6,3.2,-11];
function cam3v(t:number):Cam{
 const tau=tau3(t),w=at(WAL,tau,1.1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(w,at(WIN,tau,1),.5),fov:18})],
  [CUE(2,'gets in front')-.2,.8,()=>({P:E3,T:add3(w,[0,-.1,0]),fov:12})],
  [CUE(2,'pokes')-.2,.6,()=>({P:E3,T:mix3(w,P_POKE,.5),fov:10})],
  [CUE(2,'Won it')-.1,1,()=>({P:E3,T:mix3(w,ballAt(T_POKE+1.2),.5),fov:14})],
 ]);
}
const ch3:Scene={
 draw(s,t){frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12);grounds(s,c,t);ground(s,c);
  // "gets in front": a navy ball-to-goal line with Walker standing on it
  const gf=sm(CUE(2,'gets in front')-.1,CUE(2,'gets in front')+.4,t)*(1-sm(CUE(2,'Won it'),CUE(2,'Won it')+.6,t));
  if(gf>0){const b=ballAt(tau),a=pr(c,[b[0],.02,b[2]]),g=pr(c,[0,.02,0]);if(a&&g){const gaps:[number,number][]=[];for(let i=0;i<12;i++)gaps.push([(i+.6)/12,(i+.95)/12]);const d=ribbon([a,[lerp(a[0],g[0],gf),lerp(a[1],g[1],gf)]],Math.max(5,kAt(c,b)*.06),{seed:4,taper:0,wobble:.5,gaps});s.knockout(d,.9*gf);s.fill(K,d,.9*gf);}}
  const r=play(s,c,tau,tp,{smear:true,min:12});
  const pk=sm(T_POKE-.03,T_POKE+.06,tau)*(1-sm(T_POKE+.35,T_POKE+.8,tau));if(pk>0){const q=pr(c,P_POKE);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,P_POKE)*.6)*easeOutBack(pk),{n:9,seed:21,width:Math.max(5,kAt(c,P_POKE)*.05)});}
  const wn=sm(CUE(2,'Won it')-.1,CUE(2,'Won it')+.3,t,easeOutBack);if(wn>.02&&r.ball){const g=r.ball.g,rr=r.ball.r*2.2*clamp(wn),ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rg=ribbon(ring,Math.max(4,r.ball.r*.3),{seed:8,close:true,wobble:.8});s.knockout(rg,.9);s.fill(Y,rg,.95);}
 },
 aperture(t){const c=cam3v(t),q=pr(c,ballAt(tau3(twos(t))))??[0,0];return apertureDisc(q[0],q[1],40,12);},
 get still(){return CUE(2,'pokes')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson, high behind Walker
const tau4=(t:number)=>key(t,mono([[0,-.4],[CUE(3,'If a winger'),.1],[CUE(3,'Sprint back'),1.1],[CUE(3,'inside'),2.1],[CUE(3,'then win'),T_POKE-.05],[SECS(3),T_POKE+.9]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(WAL,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-9,7,-15],T:[-28,.6,-24.8],fov:15})],
  [CUE(3,'Sprint back')-.2,1.2,()=>({P:[-6,6,-16],T:mix3(w,[-20,.5,-24.5],.5),fov:23})],
  [CUE(3,'then win')-.3,1,()=>({P:[-5,4.5,-18],T:mix3(w,P_POKE,.5),fov:17})],
 ]);
}
const ch4:Scene={
 draw(s,t){frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);grounds(s,c,t);ground(s,c);
  const tI=CUE(3,'If a winger'),tS=CUE(3,'Sprint back'),tN=CUE(3,'inside'),tW=CUE(3,'then win');
  // "If a winger gets past you": a red ring under the winger
  groundRing(s,c,at(WIN,tau,0),.8,R,sm(tI-.1,tI+.3,t)*(1-sm(tW,tW+.5,t)),.12);
  // "Sprint back": his whole path as a red arrow along the grass, drawn out
  const sp=sm(tS-.1,tS+.9,t,easeInOutSine)*(1-sm(tW+.8,tW+1.4,t));
  if(sp>0){const pts:V3[]=[];for(let i=0;i<=12;i++){const[x,z]=posOf(WAL,lerp(.35,T_POKE,i/12*clamp(sp)));pts.push([x,.02,z]);}arrow3(s,c,pts,Math.max(7,kAt(c,at(WAL,1.5,0))*.07),R,.9);}
  // "on the inside": the yellow inside lane between the winger's line and the goal
  const ins=sm(tN-.1,tN+.4,t)*(1-sm(tW+.8,tW+1.4,t));
  if(ins>0){const zone=polyP(c,[[-30,.01,-24.9],[-12,.01,-24.9],[-12,.01,-23.2],[-30,.01,-23.2]]);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.35*ins);s.tone(Y,zp,.5*ins);}}
  const r=play(s,c,tau,tp,{smear:true,min:12});
  // "then win the ball": a yellow burst at the poke and a ring on the ball
  const wn=sm(tW-.05,tW+.35,t,easeOutBack);if(wn>.02&&tau>T_POKE-.1){const q=pr(c,P_POKE);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,P_POKE)*.7)*clamp(wn),{n:10,seed:61,width:Math.max(5,kAt(c,P_POKE)*.05)});
   if(r.ball){const g=r.ball.g,rr=r.ball.r*2.2,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rg=ribbon(ring,Math.max(4,r.ball.r*.3),{seed:8,close:true,wobble:.8});s.knockout(rg,.9*clamp(wn));s.fill(Y,rg,.95*clamp(wn));}}
 },
 get still(){return CUE(3,'then win')+.3;},
};

const film:RisoStory={
 id:'kyle-walker-signature',format:'11v11',title:'Walker: the recovery sprint',
 theme:"Don't give up when a winger gets past you: turn, sprint back on the inside, get in front and win the ball",
 ageNote:'A demonstration of Kyle Walker\'s signature recovery sprint (not a specific match). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a burst of speed — yellow speed lines streak out from the touch and a little dust puff. Reduced motion: the puff. */
 touch(s,x,y,age,seed){
  const r=rng(seed),fade=age<=0?1:1-clamp((age-.5)/.3);
  if(age>0)speedLines(s,Y,x,y,r()*TAU,{n:4,seed,len:160*easeOut(clamp(age/.3)),spread:50,width:8,cov:.9*fade});
  const p=polyPath(blob(x,y+20,40+30*clamp(age/.4),14,seed,{n:14}),true);s.knockout(p,.8*fade);s.tone(K,p,.3*fade);
 },
};
export default film;
/** Solved facts — checked by tests/play-film-kyle-walker-signature.cjs. */
export const FACTS={T_POKE,P_POKE,ballAt,
 walkerAt:(tau:number)=>{const st=walkerState(tau),sk=solve(st.pose,B_WAL,st.place);return{pelvis:sk.pelvis,lToe:sk.lToe,rToe:sk.rToe,yaw:st.place.yaw??0};},
 wingerAt:(tau:number)=>{const[x,z]=posOf(WIN,tau);return{x,z};}};
