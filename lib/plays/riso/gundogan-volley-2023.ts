/** İlkay Gündoğan's 12-second volley — Manchester City 2–1 Manchester United, FA Cup final, Saturday 3 June 2023, Wembley Stadium, London
 * (the fastest goal in FA Cup final history). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the broadcast footage itself was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 26 2026 with curl, cached in the build scratchpad cardfilms6/src/):
 *  - Wikipedia, "2023 FA Cup final" (raw wikitext): 3 June 2023, Wembley; "Just 12 seconds into the match, İlkay Gündoğan opened the
 *    scoring for Manchester City with a right-footed volley from just outside the penalty area, making it the fastest goal in FA Cup Final
 *    history" (previous record Louis Saha, 25 s, 2009); Gündoğan scored again (51'), Fernandes a penalty; City 2–1; kits: City sky-blue
 *    shirts (77BBFF), white shorts, sky-blue socks; United red shirts (FF0000), black shorts, black socks; Ortega GK 18, Lindelöf CB 2.
 *    https://en.wikipedia.org/wiki/2023_FA_Cup_final
 *  - PA Media via The Irish News, "Ilkay Gundogan makes FA Cup final history with quickfire goal inside 12 seconds", 3 June 2023: "He had
 *    actually taken kick-off and knocked the ball back to Stefan Ortega in the City goal. The goalkeeper launched the ball forward for Erling
 *    Haaland to nod it on. As Kevin De Bruyne challenged Victor Lindelof, the ball dropped for Gundogan to smash in a brilliant volley past the
 *    static David De Gea from 25 yards."
 *  - The FA (thefa.com) match report, 3 June 2023: "Lindelof ... was indecisive dealing with Ortega's long ball and after De Bruyne's
 *    knockdown, Gundogan volleyed home a thunderous strike into De Gea's top corner"; "City were sizzling in the Wembley sunshine".
 *  - FourFourTwo, 3 June 2023: "volleying into the top corner of David De Gea's goal when a loose flick on sat up perfectly for him"; "City
 *    taking the kick off and passing the ball straight back to goalkeeper Stefan Ortega. Erling Haaland rose to head the ball on".
 *  - Sky Sports match report, 3 June 2023: "A long ball pumped forward was won by Erling Haaland and Gundogan seized upon the loose ball from
 *    25 yards, producing an epic volley"; captain; player of the match.
 * CONFIRMED: date, Wembley, a sunny afternoon; City kicked off, the ball went back to Ortega, his long ball, Haaland's nod-on, De Bruyne and
 *  Lindelöf contesting, the ball dropping loose to Gündoğan ≈ 25 yards out, his RIGHT-FOOTED VOLLEY into De Gea's TOP CORNER, De Gea static
 *  ("rooted to the spot"); 12 seconds, the fastest FA Cup final goal; kits as above; Gündoğan was City's captain.
 * CONFLICTING (so the narration does not say who touched it last): the FA calls it De Bruyne's knockdown, PA says the ball dropped as De
 *  Bruyne challenged Lindelöf, FourFourTwo says a loose flick — the film shows the two of them jumping together and the ball popping up.
 * INFERRED (illustrative, never named in the narration): WHICH top corner (drawn: De Gea's right, −z — NOT verified), Gündoğan's exact spot
 *  (drawn central, slightly right) and the ball's height at contact (drawn just before it lands, a volley on the drop); whether the back-pass
 *  went straight to Ortega (drawn: one long ground pass); every position, path and timing (τ-clock: the goal ≈ 10.9 s after the kick);
 *  the unnamed players (no numbers), the keepers' kits (Ortega printed yellow, De Gea printed navy — NOT verified); which touchline the main
 *  camera is on (the arch over the far stand); the crowd colours.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera following the ball in REAL TIME from the kick-off to the goal
 * (a gentle time warp keeps it on the words, never faster than 1.7×); ch2 = the slow-motion replay LOW BEHIND GÜNDOĞAN (the ball dropping,
 * head over it, the right-foot swing, a ring on the laces); ch3 = the second replay from BEHIND THE GOAL (into the top corner, the net
 * bulges; the keeper can't reach it); ch4 = the lesson (his run from the kick-off spot as a lit path — switched on from the first second —
 * a sight line to the falling ball, the laces). Composed on the FULL sheet. Handedness: right-handed world (x toward United's goal, y up,
 * +z = City's right), athlete.ts's convention, so strike({foot:'r'}) is his RIGHT foot. De Gea faces −x, so HIS right is −z. Inks:
 * yellow, red, blue, navy (City sky = a light blue screen). Everything keyed to cue times (withTiming), poses on twos, cameras on ones. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';
import timingJson from '../../../public/plays/narration/gundogan-volley-2023/timing.json';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Twelve seconds',text:'The 2023 FA Cup final at Wembley. Manchester City kick off! The ball goes back to the keeper, Stefan Ortega... he kicks it long. Erling Haaland heads it on. The ball pops up, and İlkay Gündoğan volleys it! Goal! After just twelve seconds!',tail:2.2,
  cues:['2023 FA Cup','Manchester City kick off','goes back','kicks it long','heads it on','pops up','İlkay','volleys','Goal','twelve']},
 {label:'Watch it again',text:'Watch it again, slowly. Gündoğan watches the ball drop. He keeps his head over it, and swings his right foot through. Laces!',tail:1.4,
  cues:['Watch it again','watches','head over','swings','Laces']},
 {label:'Top corner',text:"From behind the goal: the ball flies into the top corner. It's too fast for the keeper!",tail:2,
  cues:['From behind','top corner','too fast']},
 {label:'The secret',text:'The secret? Be switched on from the very first second. Watch a falling ball, and hit it with your laces!',tail:1.8,
  cues:['The secret','first second','Watch a falling','laces']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('gundogan: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('gundogan: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const DEG=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
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

// ---------------------------------------------------------------- Wembley in the June sunshine: red seats in three tiers, the roof, the arch
const CX=-52.5;
/** 0 the far side (+z, under the arch), 1 behind United's goal (+x), 2 the main stand (−z, the camera side), 3 behind City's goal (−x) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122,17,a),1.2+40*b,43+40*b],
 (a,b)=>[9+38*b,1.2+40*b,lerp(62,-62,a)],
 (a,b)=>[lerp(17,-122,a),1.2+36*b,-43-36*b],
 (a,b)=>[-114-38*b,1.2+40*b,lerp(-62,62,a)],
];
const STAND_COLS=[110,76,110,76],STAND_ROWS=18;
const FASCIA:[number,number][]=[[.3,.36],[.6,.66]];
const ARCH:V3[]=Array.from({length:33},(_,i)=>{const u=i/32,y=133*(1-Math.pow(2*u-1,2));return[CX+(u-.5)*315,y,80+y*Math.tan(22*DEG)];});
/** crowd: [paper (white), blue (City sky), red (United), yellow (flags, sun)] */
const CROWD_MIX:[number,number,number,number][]=[[.2,.38,.34,.08],[.2,.3,.44,.06],[.2,.38,.34,.08],[.2,.48,.26,.06]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a sunny June afternoon: a pale blue sky screen over paper, a warm yellow haze low down
 s.field(B,.32,.4);
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
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.62);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.22);
 // the roof's shadow over the main-stand side of the pitch (afternoon sun)
 addPoly(st,[]);const sh=polyP(c,[[-110,0,-34],[5,0,-34],[5,0,-22],[-110,0,-26]]);if(sh.length>2)s.tone(K,polyPath(sh,true),.16);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);board([-110.5,0,-38],[-110.5,0,38]);
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.7);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([CX,0,-34+k*17],[CX,0,-34+(k+1)*17]);L([-105,0,-34+k*17],[-105,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(CX,0,9.15);
 for(const[gx,d] of [[0,-1],[-105,1]] as [number,number][]){L([gx,0,-20.16],[gx+16.5*d,0,-20.16]);L([gx+16.5*d,0,-20.16],[gx+16.5*d,0,20.16]);L([gx+16.5*d,0,20.16],[gx,0,20.16]);
  L([gx,0,-9.16],[gx+5.5*d,0,-9.16]);L([gx+5.5*d,0,-9.16],[gx+5.5*d,0,9.16]);L([gx+5.5*d,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+11*d,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,12);}
 for(const cx of[-11,-94,CX]){const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([cx+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
}
/** a goal at x = X facing play (dir = −1: the net goes to +x, United's goal; +1: to −x, City's goal); bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,X:number,dir:number,bulge=0,bz=0,by=1.2){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X-2*dir-dir*bulge*.8*Math.exp(-Math.pow((z-bz)/1.4,2)-Math.pow((y-by)/1.1,2));
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_D:InkFill[]=[[Y,.8],[R,.62],[K,.28]];
/** City: sky-blue shirts, white shorts, sky-blue socks (sourced); navy numbers/trim (inferred) */
const city=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],shorts:'paper',socks:[B,.5],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:K,hairStyle:'short',number:null,...o});
/** United: red shirts, black shorts, black socks (sourced); paper numbers (inferred) */
const utd=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',number:null,...o});
const B_GUN:Build={height:1.8,bulk:.97},B_HAA:Build={height:1.95,bulk:1.1,thighs:1.1},B_KDB:Build={height:1.81},B_LIN:Build={height:1.87},B_ORT:Build={height:1.85},B_DDG:Build={height:1.92};
const GUN_ST=city({number:8,hair:[K,.9],build:B_GUN,seed:8});
const HAA_ST=city({number:9,hair:[Y,.75],hairStyle:'ponytail',build:B_HAA,seed:9});
const KDB_ST=city({number:17,hair:[Y,.55],build:B_KDB,seed:17});
const LIN_ST=utd({number:2,hair:[Y,.5],build:B_LIN,seed:2});
const ORT_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.9],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,trim:K,gloves:'paper',sleeves:'long',number:18,numberInk:K,build:B_ORT,seed:18};
const DDG_ST:AthleteStyle={shirt:[K,.72],shorts:[K,.8],socks:[K,.72],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,trim:[B,.8],gloves:'paper',sleeves:'long',number:1,numberInk:'paper',build:B_DDG,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds from the kick)
const BALL_R=.11,GRAV=9.81;
/** τ: the kick-off pass back (0), Ortega's touch (TA), his long kick (TK), Haaland's nod-on (TH), the pop-up (TC), the volley (TV), the line (TG) */
const TA=3.8,TK=5.4,TH=7.9,TC=8.65,TV=10.05,TG=10.85;
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const G3:V3=[0,-GRAV,0];
const KO:V3=[-52.5,BALL_R,0];
/** Ortega meets the pass at the edge of his six-yard box and sets it for the long kick */
const OB:V3=[-100.2,BALL_R,.5],OK2:V3=[-99.2,BALL_R,.4];
/** Haaland's header point and his pelvis (solved from the header pose) */
const HH_PL:Place={x:-33.2,z:-.8,yaw:0};
const HAA_HU=.52;
const HH:V3=(()=>{const sk=solve(header(HAA_HU),B_HAA,HH_PL),d=sub3(sk.face,sk.head),l=Math.hypot(d[0],d[1],d[2])||1;return add3(sk.face,[d[0]/l*.13,d[1]/l*.13+.03,d[2]/l*.13]);})();
/** the contest: Lindelöf (facing his own goal? no — facing the ball, back toward his goal) and De Bruyne jump together; the ball pops up */
const LIN_PL:Place={x:-27.6,z:.3,yaw:Math.PI};
const CP:V3=(()=>{const sk=solve(header(.52),B_LIN,LIN_PL);return add3(sk.head,[-.16,.12,0]);})();
/** Gündoğan's volley: right foot, just before the falling ball lands; he faces the top corner */
const GOAL_PT:V3=[0,2.12,-3.05];
const GUN_X=-23.4,GUN_Z=2.1,YAW_V=yawTo(GOAL_PT[0]-GUN_X,GOAL_PT[2]-GUN_Z);
const POWER=1;
const GUN_PL:Place=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:POWER,foot:'r'}),B_GUN,{x:0,z:0,yaw:YAW_V}),d=nrm2(GOAL_PT[0]-GUN_X,GOAL_PT[2]-GUN_Z);return{x:GUN_X-sk.rToe[0]-d[0]*.1,z:GUN_Z-sk.rToe[2]-d[1]*.1,yaw:YAW_V};})();
const VP:V3=[GUN_X,.2,GUN_Z];
const ORT_PL:Place=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:1,foot:'r'}),B_ORT,{x:0,z:0,yaw:0});return{x:OK2[0]-.1-sk.rToe[0],z:OK2[2]-sk.rToe[2],yaw:0};})();
const V_LONG=launch(OK2,HH,TH-TK,G3),V_NOD=launch(HH,CP,TC-TH,G3),V_POP=launch(CP,VP,TV-TC,G3),V_SHOT=launch(VP,GOAL_PT,TG-TV,[0,-GRAV*.55,0]);
const NET_HIT:V3=[1.7,1.8,-2.6],REST:V3=[1.2,BALL_R,-2.3];
function ballAt(tau:number):V3{
 if(tau<=0)return KO;
 if(tau<TA){const u=easeOut(tau/TA);return mix3(KO,OB,u);}
 if(tau<TK){const u=sm(TA,TK-.15,tau);return mix3(OB,OK2,u);}
 if(tau<TH)return flyA(OK2,V_LONG,G3,tau-TK);
 if(tau<TC)return flyA(HH,V_NOD,G3,tau-TH);
 if(tau<TV)return flyA(CP,V_POP,G3,tau-TC);
 if(tau<TG)return flyA(VP,V_SHOT,[0,-GRAV*.55,0],tau-TV);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- tracks [τ, x, z]
type Role='gun'|'haa'|'kdb'|'lin'|'ort'|'ddg'|'city'|'utd';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-4,T1=16,DT=.02;
const ACTORS:Actor[]=[
 {name:'İlkay Gündoğan',role:'gun',hero:true,style:GUN_ST,keys:[[T0,-53.2,.4],[-.6,-53.1,.3],[.4,-52.4,.6],[3,-44,1.6],[6,-35,2.2],[8.6,-26.8,2.4],[TV-.5,GUN_PL.x!,GUN_PL.z!],[TV+.15,GUN_PL.x!,GUN_PL.z!],[TV+.6,GUN_PL.x!+.8,GUN_PL.z!-.3],[TV+2.4,-16,-4],[T1,-8,-14]]},
 {name:'Erling Haaland',role:'haa',hero:true,style:HAA_ST,keys:[[T0,-52.8,-1.6],[.2,-52.4,-1.6],[3,-44,-1.3],[6,-36.4,-1],[TH-.6,HH_PL.x!,HH_PL.z!],[TH+.1,HH_PL.x!,HH_PL.z!],[TH+.5,HH_PL.x!+.4,HH_PL.z!],[TH+1.6,-29,-2],[TV+2,-20,-6],[T1,-12,-12]]},
 {name:'Kevin De Bruyne',role:'kdb',hero:true,style:KDB_ST,keys:[[T0,-54,9],[1,-51,8],[4,-40,5],[6.5,-31,2.4],[TC-.4,-28.4,1.2],[TC+.4,-28.1,1.3],[TV+1,-24,1],[T1,-14,-8]]},
 {name:'Victor Lindelöf',role:'lin',hero:true,style:LIN_ST,keys:[[T0,-22,-2.5],[3,-22.5,-2],[6,-25.5,-.4],[TC-.5,LIN_PL.x!,LIN_PL.z!],[TC+.4,LIN_PL.x!,LIN_PL.z!],[TV+1,-25.5,-.4],[T1,-22,-2]]},
 {name:'Stefan Ortega',role:'ort',hero:true,style:ORT_ST,keys:[[T0,-102,0],[1,-101.8,.2],[TA-.4,-101.2,.4],[TA,OB[0]-.75,OB[2]],[TK-.5,ORT_PL.x!,ORT_PL.z!],[TK+.1,ORT_PL.x!,ORT_PL.z!],[TK+1,ORT_PL.x!+.8,ORT_PL.z!],[T1,-100,0]]},
 {name:'David De Gea',role:'ddg',hero:true,style:DDG_ST,keys:[[T0,-4,0],[TK,-3.4,.3],[TC,-1.8,.6],[TV,-1.3,.3],[T1,-1.3,.3]]},
 // United's back line and midfield (unnamed)
 {name:'utd rb',role:'utd',style:utd({skin:SKIN_D,seed:41}),keys:[[T0,-24,-22],[6,-26,-18],[TV,-22,-12],[T1,-20,-10]]},
 {name:'utd cb',role:'utd',style:utd({skin:SKIN_M,seed:42}),keys:[[T0,-22,6],[6,-24,4.4],[TV,-20.6,5.6],[T1,-18,5]]},
 {name:'utd lb',role:'utd',style:utd({seed:43}),keys:[[T0,-24,20],[6,-27,15],[TV,-22,12],[T1,-20,10]]},
 {name:'utd dm',role:'utd',style:utd({skin:SKIN_M,seed:44}),keys:[[T0,-40,3],[6,-35,4],[TV,-27,5],[T1,-24,4]]},
 {name:'utd cm',role:'utd',style:utd({seed:45}),keys:[[T0,-44,-10],[6,-38,-6],[TV,-29,-4],[T1,-25,-3]]},
 {name:'utd am',role:'utd',style:utd({seed:46}),keys:[[T0,-47,-2],[6,-45,-1],[TV,-38,0],[T1,-33,0]]},
 // City's midfield and defence (unnamed)
 {name:'city dm',role:'city',style:city({build:{height:1.91},seed:61}),keys:[[T0,-60,-4],[6,-50,-4],[TV,-40,-3],[T1,-34,-2]]},
 {name:'city cm',role:'city',style:city({seed:62}),keys:[[T0,-58,-14],[6,-46,-12],[TV,-34,-10],[T1,-28,-9]]},
 {name:'city lw',role:'city',style:city({seed:63}),keys:[[T0,-54,-24],[6,-40,-22],[TV,-28,-18],[T1,-24,-16]]},
 {name:'city cb',role:'city',style:city({skin:SKIN_D,seed:64}),keys:[[T0,-76,-8],[6,-70,-6],[TV,-60,-4],[T1,-55,-3]]},
 {name:'city cb2',role:'city',style:city({seed:65}),keys:[[T0,-76,8],[6,-70,6],[TV,-60,5],[T1,-55,4]]},
];
const GUN=0,HAA=1,KDB=2,LIN=3,ORT=4,DDG=5;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- poses
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 return blendPose(stand(),run,clamp((sp-.25)/1.15));
}
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-1.5)/2.5);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const lerpA=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
type State={pose:Pose;place:Place};
/** head over the ball: chin down, eyes on it as it drops */
const EYES=posed({lHipF:22,rHipF:14,lKnee:26,rKnee:22,lean:16,pitch:5,neckP:30,lShA:30,rShA:26,lElb:40,rElb:40});
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'gun':{
   // the kick-off: a short pass back with his right foot
   const ko=win(tau,-.5,.55,.15);if(ko>0){pose=blendPose(pose,strike(clamp(tau/1+STRIKE_CONTACT),{power:.35,foot:'r'}),ko);yaw=Math.PI;}
   if(tau>TC-.2&&tau<TV-.5){pose=blendPose(pose,EYES,sm(TC-.2,TC+.3,tau)*.7);}
   // the volley
   const w=win(tau,TV-.55,TV+.95,.18);if(w>0){pose=blendPose(pose,strike(clamp((tau-TV)/.9+STRIKE_CONTACT),{power:POWER,foot:'r'}),w);}
   if(tau>TV-.7&&tau<TV+.6)yaw=lerpA(yaw,YAW_V,sm(TV-.7,TV-.4,tau)*(1-sm(TV+.3,TV+.6,tau)));
   if(tau>TV+.9){pose=blendPose(pose,celebrate(distOf(k,tau)/4.2,{kind:'run'}),sm(TV+.9,TV+1.5,tau));}
   break;}
  case 'haa':{if(tau>TH-.6&&tau<TH+.45){const u=(tau-(TH-HAA_HU*1))/1;pose=blendPose(pose,header(clamp(u)),win(tau,TH-.6,TH+.45,.2));yaw=lerpA(yaw,0,win(tau,TH-.8,TH+.5,.3));}
   if(tau>TG+.2)pose=blendPose(pose,celebrate(tau,{kind:'arms'}),sm(TG+.2,TG+.8,tau)*.8);break;}
  case 'kdb':{if(tau>TC-.55&&tau<TC+.7){const hp=header(clamp((tau-(TC-.52))/1));hp.air*=.8;pose=blendPose(pose,hp,win(tau,TC-.55,TC+.7,.2));yaw=lerpA(yaw,yawTo(1,-.3),win(tau,TC-.7,TC+.5,.3));}
   if(tau>TG+.2)pose=blendPose(pose,celebrate(tau*.9,{kind:'arms'}),sm(TG+.2,TG+.8,tau)*.8);break;}
  case 'lin':{if(tau>TC-.55&&tau<TC+.7){pose=blendPose(pose,header(clamp((tau-(TC-.52))/1)),win(tau,TC-.55,TC+.7,.2));yaw=lerpA(yaw,Math.PI,win(tau,TC-.8,TC+.5,.3));}break;}
  case 'ort':{const w=win(tau,TK-.6,TK+.8,.2);if(w>0){pose=blendPose(pose,strike(clamp((tau-TK)/1+STRIKE_CONTACT),{power:1,foot:'r'}),w);yaw=lerpA(yaw,0,w);}
   break;}
  case 'ddg':{pose=blendPose(keeperSet(tau*1.2),stand(),tau<TC?.5:0);yaw=faceYaw(k,Math.min(tau,TG),undefined);
   // rooted: a small late lean only (sourced: "static", "rooted to the spot")
   if(tau>TG)pose=blendPose(pose,posed({lHipF:10,rHipF:10,lKnee:14,rKnee:14,lean:4,neckP:-10,neckY:40,lShA:20,rShA:20}),sm(TG,TG+.5,tau));break;}
  case 'utd':if(tau>TG+.4)pose=blendPose(pose,posed({lHipF:14,rHipF:10,lKnee:18,rKnee:14,lean:12,neckP:24,lShA:20,rShA:20}),sm(TG+.6,TG+1.4,tau));break;
  case 'city':if(tau>TG+.4)pose=blendPose(pose,celebrate(tau*.8+k,{kind:'arms'}),sm(TG+.4,TG+1,tau)*.6);break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- drawing
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.04;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3+P[1]*.25,0,P[2]+Math.sin(a)*rad+P[1]*.18]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.45-P[1]*.05,.08,.45));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const st=stateOf(k,tau);const q=toCam(c,[st.place.x??0,.9,st.place.z??0]);if(q[2]<1)return;const g=scr(c,q),kk=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+kk||g[1]<-v.hy-kk||g[1]>v.hy+kk)return;
  const hero=!!a.hero,px=kk*ppu,style:AthleteStyle=passing?{...a.style,detail:hero?'mid':'low'}:(!hero&&px<120)||px<44?{...a.style,detail:'low'}:a.style;
  const prev=hero?stateOf(k,tauPrev):undefined,smear=!!o.smear&&!passing&&((k===GUN&&tau>TV-.3&&tau<TV+.4)||(k===HAA&&tau>TH-.3&&tau<TH+.2));
  items.push({d:q[2],draw:()=>drawPlayer(s,st.pose,c,style,st.place,prev,smear)});});
 let out:{g:Pt;r:number}|null=null;
 const P=ballAt(tau),bq=toCam(c,P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,P,spinAt(tau),{min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null});if(r)out={g:r.g,r:r.r};}});
 {const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,0,-1,bulgeAt(tau),GOAL_PT[2],GOAL_PT[1])});}
 {const gq=toCam(c,[-106,1.2,0]);if(gq[2]>NEAR)items.push({d:gq[2],draw:()=>goal3(s,c,-105,1)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out as {g:Pt;r:number}|null};
}
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const gnd=(P:V3,y=1):V3=>[P[0],y,P[2]];
function ringPx(s:Sheet,g:Pt,rr:number,ink:string,a:number,seed=8){if(a<=0)return;const ring:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU;ring.push([g[0]+Math.cos(u)*rr,g[1]+Math.sin(u)*rr]);}const rp=ribbon(ring,Math.max(4,rr*.14),{seed,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*a);s.fill(ink,rp,.95*a);}
function trail(s:Sheet,c:Cam,t0:number,t1:number,fade:number){
 if(fade<=0||t1<=t0)return;const pts:Pt[]=[];for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(t0,t1,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=clamp(kAt(c,ballAt(t1))*.16,6,22);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, kick-off to goal (a gentle warp onto the words)
const tau1=(t:number)=>{const k0=CUE(0,'Manchester City kick off')+.5;if(t<k0)return Math.max(T0,t-k0);
 return key(t,mono([[k0,0],[CUE(0,'kicks it long')+.2,TK],[CUE(0,'heads it on')+.1,TH],[CUE(0,'volleys')+.1,TV],[CUE(0,'volleys')+6.1,TV+6]]),linear);};
const P1:V3=[-40,22,-64];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,14,30],fov:40})],
  [CUE(0,'Manchester City kick off')-.4,1.2,()=>({P:P1,T:[KO[0],1,0],fov:9})],
  [CUE(0,'goes back')-.1,1.4,()=>({P:P1,T:mix3(gnd(b),[-80,1,0],.3),fov:22})],
  [CUE(0,'kicks it long')-.4,1,()=>({P:P1,T:mix3(gnd(b,1+b[1]*.5),[-60,1,0],.2),fov:26})],
  [CUE(0,'heads it on')-.4,1,()=>({P:P1,T:mix3(gnd(b,1+b[1]*.4),[-28,1,1],.5),fov:10})],
  [CUE(0,'volleys')-.4,.6,()=>({P:P1,T:mix3(gnd(b,1+b[1]*.3),[-12,1.2,0],.4),fov:13})],
  [CUE(0,'Goal')+.3,1.4,()=>({P:P1,T:at(GUN,tau,1.2),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tG=CUE(0,'Goal');
  stadium(s,c,t,[0,1,3],{roar:sm(tG-.5,tG,t),flash:sm(tG-.2,tG+.2,t)*(1-sm(tG+2,tG+3,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{min:12,lines:true,prevBall:tau1(t-.06)});
  // the pop-up: a small yellow spark where the two heads meet it
  const pu=win(tau,TC-.02,TC+.4,.08);if(pu>0){const q=pr(c,CP);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(30,kAt(c,CP)*.4)*easeOutBack(pu),{n:7,seed:13,width:Math.max(4,kAt(c,CP)*.03)});}
  const hv=win(tau,TV-.02,TV+.35,.06);if(hv>0&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(34,r.ball.r*4),{n:8,seed:19,g:easeOutBack(hv),width:Math.max(4,r.ball.r*.4)});
 },
 aperture(t){const c=cam1(t),g=pr(c,at(GUN,tau1(twos(t)),1.2))??[0,0];return apertureDisc(g[0],g[1],40,12);},
 get still(){return CUE(0,'volleys')+.2;},
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low behind Gündoğan: watch it drop, head over it, the swing, laces
const tau2=(t:number)=>key(t,mono([[0,TC-.3],[CUE(1,'watches'),TC+.5],[CUE(1,'head over'),TV-.5],[CUE(1,'swings'),TV-.12],[CUE(1,'Laces'),TV+.02],[SECS(1),TV+.6]]),linear);
const E2:V3=[-31.2,1.5,7];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(tau),gp=at(GUN,tau,1);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(gp,b,.5),fov:30})],
  [CUE(1,'watches')-.2,1,()=>({P:add3(E2,[1.5,0,-.6]),T:mix3(gp,b,.55),fov:22})],
  [CUE(1,'head over')-.2,.8,()=>({P:add3(E2,[3,-.3,-1.2]),T:mix3(add3(gp,[0,.2,0]),VP,.5),fov:17})],
  [CUE(1,'swings')-.2,.7,()=>({P:add3(E2,[1.4,-.3,-1]),T:add3(VP,[.4,.5,0]),fov:24})],
  [CUE(1,'Laces')+.2,1,()=>({P:add3(E2,[1.4,-.1,-1]),T:mix3(VP,GOAL_PT,.35),fov:30})],
 ]);
}
const ch2:Scene={
 draw(s,t){frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,1],{roar:sm(TG,TG+.4,tau)});ground(s,c);
  trail(s,c,Math.max(TC,tau-.7),Math.min(tau,TV+.5),1-sm(TV+.4,TV+.8,tau));
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[GUN,HAA,KDB,LIN,DDG,6,7,8,11]});
  // "watches the ball drop": a dashed yellow sight line from his eyes to the ball
  const ws=win(t,CUE(1,'watches')-.1,CUE(1,'swings')+.1,.3);
  if(ws>0){const st=stateOf(GUN,tau),sk=solve(st.pose,B_GUN,st.place),a=pr(c,sk.face),b=pr(c,ballAt(tau));if(a&&b){const rb=new Path2D(),n=8;for(let i=0;i<n;i++){const u0=i/n,ue=(i+.6)/n;rb.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)]],Math.max(5,kAt(c,sk.face)*.035),{seed:13+i,taper:.2,wobble:0}));}s.knockout(rb,.95*ws);s.fill(Y,rb,.95*ws);}}
  // "head over it": a red arc over his head and the ball
  const ho=win(t,CUE(1,'head over')-.1,CUE(1,'Laces'),.25);if(ho>0){const st=stateOf(GUN,tau),sk=solve(st.pose,B_GUN,st.place),h=pr(c,add3(sk.head,[0,.25,0])),f=pr(c,VP);if(h&&f){const mid:Pt=[(h[0]+f[0])/2+40,(h[1]+f[1])/2];const pr2=ribbon([h,mid,f],Math.max(5,kAt(c,sk.head)*.03),{seed:5,taper:.3,wobble:.5});s.knockout(pr2,.9*ho);s.fill(R,pr2,.95*ho);}}
  // "Laces!": a ring on his right boot and a burst on the ball
  const la=sm(CUE(1,'Laces')-.1,CUE(1,'Laces')+.3,t,easeOutBack);if(la>.02){const st=stateOf(GUN,tau),sk=solve(st.pose,B_GUN,st.place),f=pr(c,mix3(sk.rAn,sk.rToe,.5));if(f)ringPx(s,f,kAt(c,sk.rToe)*.28*clamp(la),Y,1,21);
   if(r.ball&&tau>TV-.05&&tau<TV+.4)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*5),{n:9,seed:17,g:easeOutBack(clamp((tau-TV+.05)/.2)),width:Math.max(5,r.ball.r*.5)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'Laces')+.1;},
};

// ---------------------------------------------------------------- 3 · from behind the goal: into the top corner, too fast for the keeper
const tau3=(t:number)=>key(t,mono([[0,TV-.6],[CUE(2,'top corner'),TG+.05],[CUE(2,'too fast'),TG+.7],[SECS(2),TG+3.2]]),linear);
const E3:V3=[7.5,3.4,2.4];
function cam3v(t:number):Cam{
 const tau=tau3(t);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-16,1.6,.8],fov:24})],
  [CUE(2,'top corner')-.5,.7,()=>({P:E3,T:[-4,1.8,-1.8],fov:30})],
  [CUE(2,'too fast')-.2,1,()=>({P:add3(E3,[-1,0,-1]),T:mix3(at(DDG,tau,1.3),GOAL_PT,.5),fov:22})],
 ]);
}
const ch3:Scene={
 draw(s,t){frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tC=CUE(2,'top corner');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG,TG+.3,tau)*(1-sm(TG+1.6,TG+2.4,tau))});ground(s,c);
  trail(s,c,Math.max(TV,tau-.6),Math.min(tau,TG),1-sm(TG+.2,TG+.6,tau));
  play(s,c,tau,tp,{smear:true,min:12,lines:true,prevBall:tau3(t-.06)});
  // the top corner lights up as it goes in
  const tc=sm(tC-.1,tC+.3,t)*(1-sm(tC+1.8,tC+2.4,t));if(tc>0){const box=polyP(c,[[0,1.35,-3.66],[0,1.35,-2.2],[0,2.44,-2.2],[0,2.44,-3.66]]);if(box.length>2){const bp=polyPath(box,true);s.stroke(Y,bp,Math.max(5,kAt(c,GOAL_PT)*.05),.95*tc);s.tone(Y,bp,.3*tc);}}
  // "too fast for the keeper": a red dashed reach line from his glove that falls short of the ball's path
  const tf=win(t,CUE(2,'too fast')-.1,SECS(2),.3);if(tf>0){const st=stateOf(DDG,tau),sk=solve(st.pose,B_DDG,st.place),a=pr(c,sk.lHa),b=pr(c,mix3(sk.lHa,GOAL_PT,.55));if(a&&b){const gaps:[number,number][]=[];for(let i=0;i<6;i++)gaps.push([(i+.6)/6,(i+.95)/6]);const d=ribbon([a,b],Math.max(5,kAt(c,sk.lHa)*.04),{seed:3,taper:.2,wobble:.4,gaps});s.knockout(d,.9*tf);s.fill(R,d,.95*tf);}}
 },
 aperture(t){const c=cam3v(t),q=pr(c,GOAL_PT)??[0,0];return apertureDisc(q[0],q[1],50,12);},
 get still(){return CUE(2,'top corner')+.3;},
};

// ---------------------------------------------------------------- 4 · the lesson: switched on from the first second → watch a falling ball → laces
const tau4=(t:number)=>key(t,mono([[0,TC-.6],[CUE(3,'first second'),TC-.2],[CUE(3,'Watch a falling'),TC+.6],[CUE(3,'laces'),TV+.01],[CUE(3,'laces')+1.2,TV+.12],[SECS(3),TV+.3]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),gp=at(GUN,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-36,15,-30],T:[-37,0,1],fov:48})],
  [CUE(3,'first second')-.2,1.3,()=>({P:[-38,15,-30],T:[-38.5,0,1.2],fov:50})],
  [CUE(3,'Watch a falling')-.3,1,()=>({P:[-30,2.4,-6],T:mix3(gp,ballAt(tau),.5),fov:24})],
  [CUE(3,'laces')-.2,.8,()=>({P:[-29,1.6,-4.5],T:add3(VP,[.2,.3,0]),fov:14})],
 ]);
}
const ch4:Scene={
 draw(s,t){frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tF=CUE(3,'first second'),tW=CUE(3,'Watch a falling'),tL=CUE(3,'laces');
  stadium(s,c,t,[0,1,3],{roar:.3});ground(s,c);
  // "switched on from the very first second": his run from the kick-off spot drawn out as a lit path, a ring on the centre spot
  const fs=sm(tF-.2,tF+1.1,t,easeInOutSine)*(1-sm(tW+1,tW+1.6,t));
  if(fs>0){const pts:Pt[]=[];for(let i=0;i<=24;i++){const[x,z]=posOf(GUN,lerp(.3,TV-.5,i/24*fs));const p=pr(c,[x,.02,z]);if(p)pts.push(p);}
   if(pts.length>2){const w=clamp(kAt(c,at(GUN,4,0))*.3,12,34),rb=ribbon(pts,w,{seed:9,taper:.1,wobble:.6});s.knockout(rb,.9);s.fill(Y,rb,.9);s.stroke(K,rb,2,.7);}
   const q=pr(c,KO);if(q)ringPx(s,q,Math.max(18,kAt(c,KO)*.9),R,clamp(fs*2),31);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[GUN,7,9,10]});
  // "Watch a falling ball": the ball's drop dashed in yellow ahead of it, to the spot where he meets it
  const wf=win(t,tW-.1,tL+.3,.3);if(wf>0){const pts:Pt[]=[];for(let i=0;i<=14;i++){const p=pr(c,ballAt(lerp(Math.max(tau,TC),TV,i/14)));if(p)pts.push(p);}if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.6)/9,(i+.95)/9]);const d=ribbon(pts,Math.max(6,kAt(c,VP)*.035),{seed:21,taper:.2,wobble:.5,gaps});s.knockout(d,.85*wf);s.fill(Y,d,.95*wf);}
   const q=pr(c,[VP[0],.02,VP[2]]);if(q)ringPx(s,q,Math.max(14,kAt(c,VP)*.3),R,wf,33);}
  // "hit it with your laces": a ring on the laces at contact, a burst
  const la=sm(tL-.1,tL+.3,t,easeOutBack);if(la>.02){const st=stateOf(GUN,tau),sk=solve(st.pose,B_GUN,st.place),f=pr(c,mix3(sk.rAn,sk.rToe,.5));if(f)ringPx(s,f,kAt(c,sk.rToe)*.28*clamp(la),Y,1,41);
   if(r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*5)*clamp(la),{n:10,seed:61,width:Math.max(5,r.ball.r*.5)});}
 },
 get still(){return CUE(3,'laces')+.3;},
};

const film:RisoStory={
 id:'gundogan-volley-2023',format:'11v11',title:"Gündoğan's 12-second volley",
 theme:'Be switched on from the first second: watch a falling ball, keep your head over it and volley it with your laces',
 ageNote:'Manchester City 2–1 Manchester United, FA Cup final, Wembley, 3 June 2023 — the fastest goal in an FA Cup final. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a volley — a ball drops in, a yellow spark on contact and it rockets away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.35),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-30*(1-u):x+260*easeOut(out),by=age<.3?y-160*(1-u)*(1-u):y-90*easeOut(out);
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts — checked by tests/play-film-gundogan-volley-2023.cjs. */
export const FACTS={TV,TG,VP,GOAL_PT,HH,CP,ballAt,
 gundoganAt:(tau:number)=>{const st=stateOf(GUN,tau),sk=solve(st.pose,B_GUN,st.place);return{lToe:sk.lToe,rToe:sk.rToe,pelvis:sk.pelvis};},
 haalandHead:()=>{const st=stateOf(HAA,TH),sk=solve(st.pose,B_HAA,st.place);return sk.head;},
 ortegaToes:()=>{const st=stateOf(ORT,TK),sk=solve(st.pose,B_ORT,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 OK2};
