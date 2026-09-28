/** Lúcio's far-post header — United States 2–3 Brazil, FIFA Confederations Cup final, Sunday 28 June 2009, Ellis Park Stadium,
 * Johannesburg. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx)
 * or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as
 * a riso print.
 *
 * SOURCES (read Sept 26 2026 with curl, cached in the build scratchpad cardfilms6/src/):
 *  - Wikipedia, "2009 FIFA Confederations Cup final" (raw wikitext; cites the Guardian and NYT minute-by-minutes and FIFA's report):
 *    28 June 2009, 20:30 SAST, Ellis Park Stadium, Johannesburg, 52,291, referee Martin Hansson (SWE); Dempsey 10', Donovan 27',
 *    Luís Fabiano 46' 74', Lúcio 84'; "Elano's corner kick in the 84th minute was headed into the goal by Brazilian captain Lúcio, who had
 *    beaten Clint Dempsey to the ball"; kits: USA all white (FFFFFF), Brazil yellow shirts (FFD630), blue shorts (2F5FD0), blue socks
 *    (3459AC); Lúcio CB No. 3 (captain), Elano MF No. 7 (on 67'). https://en.wikipedia.org/wiki/2009_FIFA_Confederations_Cup_final
 *  - The Guardian, Rob Smyth, "USA 2-3 Brazil – as it happened", 28 June 2009: "GOAL! Brazil 3-2 USA (Lucio 84) ... The corner was hammered
 *    to the far post by Elano and the captain Lucio, who had escaped his marker Dempsey, planted a firm header past Howard and in off the
 *    unprotected post"; the corner came from a Maicon–Fabiano move on the right that DeMerit put behind; "Lucio is seriously on the brink
 *    of tears. Elano is on his knees, pumping both fists". https://www.theguardian.com/football/2009/jun/28/usa-brazil-confederations-cup-live
 *  - CNN, "Brazil survive U.S. scare to win Confed Cup", 28 June 2009: "Lucio found space in the box to powerfully head a corner from
 *    second-half substitute Elano into the net off the left-hand upright, with the U.S. defense having crucially left the post unguarded."
 *    https://us.cnn.com/2009/SPORT/football/06/28/brazil.usa.confederations.cup/index.html
 *  - FIFA (inside.fifa.com), "The decisive goal: Lucio seals golden comeback": "Elano looped a corner towards the far post, where ... captain
 *    Lucio was waiting to head the ball powerfully into the back of the net"; Lúcio: "I sprinted to the corner flag to embrace Elano and my
 *    other team-mates". https://inside.fifa.com/tournaments/mens/confederationscup/russia2017/news/the-decisive-goal-lucio-seals-golden-comeback-2891515
 * CONFIRMED: the date, the stadium, a night kick-off; the USA led 2–0 at half-time and Brazil came back to 2–2; the 84th-minute corner by
 *  Elano to the FAR POST; Lúcio (captain, No. 3) escaped his marker Dempsey and powered a header past Howard IN OFF THE LEFT-HAND POST
 *  (unguarded); he sprinted to the corner flag to embrace Elano; Brazil won 3–2; kits as above.
 * INFERRED (illustrative, never named in the narration): the corner from Brazil's RIGHT (+z) — consistent with "far post" = the left-hand
 *  post and with the move down the right that won it; Elano's RIGHT foot (an out-swinger from the right); every position, run and timing
 *  (the corner ≈ 1.45 s to Lúcio's head; his start near the penalty spot and his curl to the far post; the header ≈ .38 s to the line);
 *  Lúcio's 1.88 m and Dempsey's 1.85 m; the other players (unnamed, no numbers); Howard's keeper kit (printed red) and his late dive; the
 *  stadium drawn as a generic two-tier bowl; which touchline the main camera is on; the crowd's colours; every camera placement and lens.
 *
 * FRAMING (the TV broadcast, never top-down; distinct from the near-post Carvajal film): ch1 = the high main-stand camera in REAL TIME,
 * the corner on the FAR touchline (the bowl at night → the box → Elano at the flag → the looped corner → the far-post header → Lúcio runs
 * toward the flag); ch2 = the slow-motion replay from LOW BEHIND THE PENALTY AREA on the far-post side, following Lúcio's run away from
 * Dempsey (a yellow ring on him, a red ring on the empty post); ch3 = a second replay LOW ON THE GOAL LINE BEYOND THE LEFT POST: the header
 * comes down at us, in off the post, then he sprints to the corner flag and hugs Elano; ch4 = the lesson from behind the penalty spot:
 * the far-post zone, "get free" (a gap arrow away from the marker), "head it down" (a down arrow into the corner). Composed on the FULL
 * sheet (never sheet.safe). FIGURES: every body goes through drawPlayer() → athlete.ts. Handedness: right-handed world (x toward the US
 * goal, y up, +z = Brazil's right), athlete.ts's own convention, so strike({foot:'r'}) is Elano's RIGHT foot and the far post is z = −3.66
 * (the left-hand post as Brazil attack). Howard faces −x, so his dive to HIS RIGHT (side 'r') goes to −z. Inks: yellow, red, blue, navy.
 * Everything keyed to cue times (withTiming), poses on twos, cameras on ones; randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';
import timingJson from '../../../public/plays/narration/lucio-header-2009/timing.json';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Johannesburg, 2009',text:'Johannesburg, the 2009 Confederations Cup final. Brazil against the USA. The USA led two-nil, but Brazil came back to two-two! Six minutes left. Elano swings in a corner... Captain Lúcio heads it in! Brazil lead three-two!',tail:2.4,
  cues:['Johannesburg','Brazil against','two-nil','came back','Six minutes','Elano','Captain','heads it in','Brazil lead']},
 {label:'Watch it again',text:'Watch again, slowly. Lúcio starts away from the goal. He escapes his marker and runs to the far post. Nobody is with him!',tail:1.6,
  cues:['Watch again','starts away','escapes','far post','Nobody']},
 {label:'In off the post',text:'From beside the goal: he heads it down hard. It goes in off the post! Lúcio sprints to the corner flag to hug Elano.',tail:2.4,
  cues:['From beside','heads it down','off the post','sprints','hug']},
 {label:'The secret',text:'Defenders can score too! Attack the far post, get free of your marker, and head the ball down hard, toward the corner.',tail:2,
  cues:['Defenders','Attack the far post','get free','head the ball down','toward the corner']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lucio: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lucio: no cue '+w);return c.at;};
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

// ---------------------------------------------------------------- Ellis Park at night (generic two-tier bowl, inferred)
const CX=-52.5;
/** stand planes: 0 the far side (+z, the corner below it), 1 behind the US goal (+x), 2 the main stand (−z, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122,17,a),1.2+32*b,43+32*b],
 (a,b)=>[9+30*b,1.2+30*b,lerp(62,-62,a)],
 (a,b)=>[lerp(17,-122,a),1.2+30*b,-43-30*b],
 (a,b)=>[-114-30*b,1.2+30*b,lerp(-62,62,a)],
];
const STAND_COLS=[106,74,106,74],STAND_ROWS=16;
const FASCIA:[number,number][]=[[.46,.52]];
/** crowd colour weights: [paper (USA white, shirts), yellow (Brazil), blue (Brazil blue, USA blue), red (USA red, scarves)] */
const CROWD_MIX:[number,number,number,number][]=[[.3,.38,.16,.16],[.28,.4,.16,.16],[.3,.38,.16,.16],[.34,.32,.16,.18]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a clear highveld winter night: deep navy, a faint glow above the bowl
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-900],[1e4,hz[1]-900],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.24);
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const[b0,b1] of FASCIA)addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.82),[0,10,0]),add3(S(0,.82),[0,10,0])]));
  seg3(c,add3(S(0,.82),[0,9.8,0]),add3(S(1,.82),[0,9.8,0]),.45,edge);}
 s.knockout(planes);s.tone(K,planes,.55);s.knockout(fas);s.fill(K,fas,.85);s.tone(R,fas,.2);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.22)/.78,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(Y,inks[1],.95);s.knockout(inks[2],.7);s.fill(B,inks[2],.95);s.knockout(inks[3],.7);s.fill(R,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.82),[0,9.4,0]),b=add3(S(u+.025,.82),[0,9.4,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.7);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.2);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.7);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
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
/** Brazil: yellow shirts, blue shorts, blue socks (sourced); green/blue trim and numbers (inferred, printed blue) */
const bra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[B,.95],socks:[B,.9],boots:K,skin:SKIN_M,hair:K,line:K,trim:[B,.9],numberInk:[B,.95],hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** USA: all white (sourced); navy trim and numbers (inferred) */
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.85],numberInk:K,hairStyle:'short',build:{height:1.83,bulk:1},...o});
const B_LUC:Build={height:1.88,bulk:1.06,thighs:1.06},B_ELA:Build={height:1.75,bulk:.94},B_DEM:Build={height:1.85,bulk:1},B_HOW:Build={height:1.91,bulk:1.04};
/** Lúcio: No. 3, the captain; long dark hair (inferred detail), tanned */
const LUC_ST=bra({number:3,hair:[K,.95],hairStyle:'long',skin:SKIN_T,build:B_LUC,seed:3});
const ELA_ST=bra({number:7,hair:[K,.9],skin:SKIN_T,build:B_ELA,seed:7});
const DEM_ST=usa({number:8,hair:[K,.8],build:B_DEM,seed:8});
const HOW_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:'paper',hairStyle:'bald',line:K,trim:K,gloves:'paper',sleeves:'long',number:1,numberInk:'paper',build:B_HOW,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (τ = 0 is Elano's corner)
const BALL_R=.11,GRAV=9.81;
/** the looped corner flies TF s to Lúcio's head; his header reaches the goal line TG */
const TF=1.45,TG=TF+.38;
/** Lúcio's header spot (pelvis) just beyond the far (left-hand) post, 3.4 m out; he meets it facing the ball, the goal over his LEFT shoulder */
const HP:[number,number]=[-3.4,-5.1],FACE:[number,number]=nrm2(.35,.94),YAW_H=yawTo(FACE[0],FACE[1]);
/** the header: header() with a big spring, head and shoulders turning LEFT (toward the goal) and nodding DOWN */
function lucHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.2;const w=Math.sin(Math.PI*clamp((u-.3)/.42)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.1,.55,sn)*w;p.twist+=lerp(-.05,.25,sn)*w;p.neckP+=.2*w*sn;return p;}
const CU=.47,HD=1.0,TJ=TF-CU*HD;
const HEAD_PT:V3=(()=>{const sk=solve(lucHeader(CU),B_LUC,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.03,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot: the +z corner flag (Brazil's right, the far touchline from the main camera) */
const P0:V3=[-.45,BALL_R,33.55];
/** a right-footer's out-swinger from the right: a steady pull AWAY from the goal line (−x) on top of gravity */
const SWING:V3=[-1.6,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_K=yawTo(DC[0],DC[1]);
const PCK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_ELA,{x:0,z:0,yaw:YAW_K});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
const LEFT_K:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCK[0]-DC[0]*3.2+LEFT_K[0]*1.5,PCK[1]-DC[1]*3.2+LEFT_K[1]*1.5];
/** the header is driven DOWN and just inside the left-hand post: it clips the inside of the post and goes in (sourced: "in off the post") */
const GOAL_PT:V3=[0,.55,-3.42],NET_HIT:V3=[1.5,.35,-2.4],REST:V3=[1.2,BALL_R,-2.2];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z]
type Role='luc'|'ela'|'gk'|'dem'|'bra'|'usa';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=13,DT=.02;
const kp=(u:number):[number,number]=>[PCK[0]+DC[0]*u,PCK[1]+DC[1]*u];
/** after the goal Lúcio sprints to the corner flag (+z) where Elano waits; team-mates chase */
const FLAG:[number,number]=[-1.8,31.2];
const toFlag=(x:number,z:number,k:number):number[][]=>[[TG+.6+k*.2,x,z],[TG+4+k*.3,lerp(x,FLAG[0]-1.5,.55),lerp(z,FLAG[1]-4,.55)],[T1,lerp(x,FLAG[0]-2,.85),lerp(z,FLAG[1]-3,.85)]];
const ACTORS:Actor[]=[
 {name:'Lúcio',role:'luc',hero:true,style:LUC_ST,keys:[[T0,-11.6,-.6],[-6,-11.3,-.8],[-2,-11,-1],[-.6,-10.6,-1.4],[.3,-8.6,-3],[TJ-.28,HP[0],HP[1]],[TF+.4,HP[0],HP[1]],[TF+1.2,-4.4,-1],[TF+3.2,-3.8,10],[TF+5.8,-2.6,24],[TF+7.2,FLAG[0]-.5,FLAG[1]-.8],[T1,FLAG[0]-.5,FLAG[1]-.8]]},
 {name:'Elano',role:'ela',hero:true,style:ELA_ST,keys:[[T0,.2,35.6],[-6.4,-.1,34.8],[-5.2,...kp(-.7)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...kp(-1.6)],[0,...kp(0)],[.7,...kp(.9)],[3,...kp(2.6)],[5,FLAG[0]+.2,FLAG[1]],[T1,FLAG[0]+.2,FLAG[1]]]},
 {name:'Tim Howard',role:'gk',hero:true,style:HOW_ST,keys:[[T0,-.8,1.4],[-2,-.8,1.2],[0,-.9,.8],[TF-.4,-1,-.4],[TF,-1,-.9],[T1,-.9,-1]]},
 {name:'Clint Dempsey (beaten)',role:'dem',hero:true,style:DEM_ST,keys:[[T0,-11,.1],[-6,-10.8,-.1],[-2,-10.4,-.3],[-.6,-10.1,-.6],[.3,-9,-1.2],[TF-.6,-7.2,-2.4],[TF,-6.4,-3.2],[TF+.6,-6,-3.6],[T1,-5.8,-3.4]]},
 {name:'US near post',role:'usa',style:usa({seed:41}),keys:[[T0,-.8,4.2],[0,-.7,4.1],[TF,-.9,3.6],[T1,-1,3.2]]},
 {name:'US six-yard 1',role:'usa',style:usa({build:{height:1.93},skin:SKIN_D,seed:42}),keys:[[T0,-4.8,3.4],[0,-5,3.2],[TF,-5.2,2],[T1,-4.8,1.6]]},
 {name:'US six-yard 2',role:'usa',style:usa({build:{height:1.9},seed:43}),keys:[[T0,-5.4,.4],[0,-5.6,.2],[TF,-5.8,-.4],[T1,-5.4,-.6]]},
 {name:'US marker',role:'usa',style:usa({seed:44}),keys:[[T0,-9.4,3.4],[0,-9.2,3.2],[TF,-8.4,2.2],[T1,-7.8,1.8]]},
 {name:'US edge',role:'usa',style:usa({seed:45}),keys:[[T0,-16,1.8],[0,-15.6,1.4],[TF,-14.2,.6],[T1,-13.4,.4]]},
 {name:'Brazil 1',role:'bra',style:bra({skin:SKIN_D,build:{height:1.92,bulk:1.06},seed:61}),keys:[[T0,-8.6,3.6],[0,-8.2,3.4],[TF,-6.6,2.6],...toFlag(-6,2.4,0)]},
 {name:'Brazil 2',role:'bra',style:bra({seed:62}),keys:[[T0,-10.2,4.8],[0,-9.8,4.6],[TF,-7.6,3.8],...toFlag(-7,3.4,1)]},
 {name:'Brazil 3',role:'bra',style:bra({skin:SKIN_T,seed:63}),keys:[[T0,-6.4,1.2],[0,-6.2,1],[TF,-5.6,.6],...toFlag(-5.2,.6,2)]},
];
const LUC=0,ELA=1,GK=2,DEM=3;
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
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*4:TF*TAU*4+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));
const postAt=(tau:number)=>tau<TG-.02?0:Math.exp(-(tau-TG)*4);

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
/** the hug at the flag: arms round each other */
const HUG=posed({lShA:70,rShA:70,lShF:70,rShF:70,lElb:70,rElb:70,lShR:30,rShR:30,lHipF:12,rHipF:6,lKnee:16,rKnee:10,lean:12,neckP:10});
/** Howard: set, then a late dive to HIS RIGHT (side 'r' = −z for a keeper facing −x), beaten by the header */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.25}),T_DIVE=TF+.02,DIVE_L=.95;
type State={pose:Pose;place:Place};
const T_HUG=TF+7.2;
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'luc':{
   if(tau<-.3)yaw=faceYaw(k,tau,P0);
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=lucHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau)*(1-sm(T_HUG-.4,T_HUG,tau)));}
   if(tau>T_HUG-.4){pose=blendPose(pose,HUG,sm(T_HUG-.4,T_HUG,tau));yaw=lerpAng(yaw,yawTo(1,.3),sm(T_HUG-.6,T_HUG,tau));}
   const w=sm(TJ-.6,TJ-.15,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'ela':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   if(tau<-4.8&&tau>-6.6){pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   if(tau>-3.6&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_K,sm(-2.2,-1.2,tau));}
   if(tau>-3.4&&tau<-1.4)pose=blendPose(pose,{...pose,rShF:40*Math.PI/180,rShA:150*Math.PI/180,rElb:10*Math.PI/180},win(tau,-3.4,-1.4,.4)*.9);
   yaw=lerpAng(yaw,YAW_K,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   // Elano pumps both fists (sourced: "on his knees, pumping both fists" — drawn standing), then the hug
   if(tau>TG+.4){const c=celebrate(tau*.9,{kind:'arms'});pose=blendPose(pose,c,sm(TG+.4,TG+1,tau)*.85*(1-sm(T_HUG-.4,T_HUG,tau)));}
   if(tau>T_HUG-.4){pose=blendPose(pose,HUG,sm(T_HUG-.4,T_HUG,tau));yaw=lerpAng(yaw,yawTo(-1,-.3),sm(T_HUG-.6,T_HUG,tau));}
   else if(tau>TG+1)yaw=lerpAng(yaw,faceYaw(k,tau,[posOf(LUC,tau)[0],0,posOf(LUC,tau)[1]]),sm(TG+1,TG+1.6,tau));
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.6,1.1,tau)*(1-sm(TF-.85,TF-.65,tau)));
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));}
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'dem':{// a step behind, a late jump
   if(tau<-.3)yaw=faceYaw(k,tau,P0);
   if(tau>TF-.5&&tau<TF+1){const hp=header(clamp((tau-(TF-.3))/1.0));hp.air*=.55;pose=blendPose(pose,hp,.55*sm(TF-.5,TF-.3,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau)*.7);if(tau>=-.3)yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'usa':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.7);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'bra':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
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
  smear:o.smear&&((k===LUC&&tau>TJ&&tau<TF+.3)||(k===ELA&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
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

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, the corner on the far touchline
function tau1(t:number){const tH=CUE(0,'heads it in')-.05;return Math.max(T0+.5,t-(tH-TF));}
const P1:V3=[-22,23,-70];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-20,10,22],fov:38})],
  [CUE(0,'Brazil against')-.3,1.3,()=>({P:P1,T:[-8,1,0],fov:16})],
  [CUE(0,'came back')-.2,1.2,()=>({P:P1,T:[-9,1,-1.5],fov:11})],
  [CUE(0,'Six minutes')-.4,1.1,()=>({P:P1,T:mix3(at(ELA,tau,.9),P0,.25),fov:5})],
  [CUE(0,'Elano')+.2,.6,()=>({P:P1,T:mix3(at(ELA,tau,.9),P0,.45),fov:6})],
  [CUE(0,'heads it in')-TF+.05,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[HP[0],1.6,HP[1]],.25+.6*sm(0,TF,tau)),fov:lerp(12,15,sm(0,.9,tau))})],
  [CUE(0,'heads it in')-.35,.6,()=>({P:P1,T:[HP[0]+1.6,1.3,HP[1]+1.2],fov:8})],
  [CUE(0,'Brazil lead')+.2,1.4,()=>{const w=at(LUC,tau,1.1);return{P:P1,T:mix3(w,[-4,1.2,6],.3),fov:14};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tL=CUE(0,'Brazil lead'),tN=CUE(0,'heads it in')+.3;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tL-.3,tL+.2,t)*(1-sm(tL+2,tL+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:15,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'heads it in')+.2;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind the box on the far-post side
const tau2=(t:number)=>key(t,mono([[0,-2.2],[CUE(1,'starts away'),-1.6],[CUE(1,'escapes'),-.2],[CUE(1,'far post'),TJ-.3],[CUE(1,'Nobody'),TF-.12],[SECS(1)-.2,TG+.4]]),linear);
const E2:V3=[-24,3.4,-15];
function cam2(t:number):Cam{
 const tau=tau2(t),r=at(LUC,tau,1.3),d=at(DEM,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-8,1,-1],fov:30})],
  [CUE(1,'starts away')-.3,1,()=>({P:E2,T:mix3(r,d,.4),fov:11})],
  [CUE(1,'escapes')-.2,1,()=>({P:E2,T:mix3(r,d,.25),fov:13})],
  [CUE(1,'far post')-.2,1,()=>({P:add3(E2,[2,0,0]),T:mix3(r,[HP[0],1.4,HP[1]],.5),fov:12})],
  [CUE(1,'Nobody')-.2,.8,()=>({P:add3(E2,[3,.3,0]),T:mix3(HEAD_PT,[-1.5,1.2,-3.4],.3+.4*sm(TF,TG,tau)),fov:lerp(10,13,sm(TF,TG,tau))})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tN=CUE(1,'Nobody');
  stadium(s,c,t,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.5,tau));
  // "that's him": a yellow ring under Lúcio; "Nobody is with him": a red ring on the empty space round the far post
  groundRing(s,c,at(LUC,tau,0),.75,Y,sm(CUE(1,'starts away')-.3,CUE(1,'starts away')+.1,t)*(1-sm(TJ-.1,TJ+.1,tau)),.14);
  groundRing(s,c,[HP[0]+.4,0,HP[1]+.2],1.6*easeOutBack(clamp((t-tN+.1)/.5)),R,sm(tN-.1,tN+.3,t)*(1-sm(TG,TG+.4,tau)),.1);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'Nobody')+.1;},
};

// ---------------------------------------------------------------- 3 · low on the goal line beyond the left post: in off the post, then the sprint to the flag
const tau3=(t:number)=>key(t,mono([[0,TJ-.6],[CUE(2,'heads it down'),TF+.02],[CUE(2,'off the post'),TG+.02],[CUE(2,'sprints')-.2,TG+1.2],[CUE(2,'hug')-.3,T_HUG-.35],[SECS(2),T_HUG+1.2]]),linear);
const E3:V3=[.6,1.1,-9.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(LUC,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0]+.3,1.7,HP[1]+.8],fov:26})],
  [CUE(2,'heads it down')-.3,.7,()=>({P:E3,T:[HEAD_PT[0]+.6,HEAD_PT[1]-.4,HEAD_PT[2]+.8],fov:22})],
  [CUE(2,'off the post')-.2,.6,()=>({P:E3,T:[-.1,.7,-3.2],fov:24})],
  [CUE(2,'sprints')-.2,1.6,()=>({P:add3(E3,[-1,4,-2]),T:mix3(r,[FLAG[0],1,FLAG[1]],.25),fov:26})],
  [CUE(2,'hug')-.4,1.2,()=>({P:add3(E3,[-1.5,5,-2]),T:[FLAG[0]-.4,1.2,FLAG[1]-.4],fov:9})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tH=CUE(2,'hug');
  stadium(s,c,t,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),.7*sm(tH-.1,tH+.3,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the header's path printed over the net; a yellow flash on the post as it clips it
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.1,TG+.45,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=clamp(kAt(c,HEAD_PT)*.12,6,20);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const ph=sm(TG-.02,TG+.06,tau)*(1-sm(TG+.4,TG+.9,tau));if(ph>0){const q=pr(c,GOAL_PT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,GOAL_PT)*.5)*easeOutBack(ph),{n:9,seed:27,width:Math.max(5,kAt(c,GOAL_PT)*.04)});}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // the hug: a yellow ring round the two of them at the flag
  const hg=sm(tH-.1,tH+.4,t,easeOutBack);if(hg>.02){const m=mix3(at(LUC,tau,1.1),at(ELA,tau,1.1),.5),q=pr(c,m);if(q){const rr=kAt(c,m)*1.1*clamp(hg),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*.9]);}const rg=ribbon(pts,Math.max(5,rr*.08),{close:true,seed:12,taper:0,wobble:.8});s.knockout(rg,.9);s.fill(Y,rg,.95);}}
 },
 aperture(t){const c=cam3v(t),p=stateOf(LUC,tau3(twos(t))),sk=solve(p.pose,B_LUC,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],50,12);},
 get still(){return CUE(2,'off the post')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: from behind the penalty spot
const tau4=(t:number)=>key(t,mono([[0,-1.4],[CUE(3,'Attack'),-.9],[CUE(3,'get free'),-.1],[CUE(3,'head the ball down'),TF-.04],[CUE(3,'head the ball down')+1,TF+.06],[CUE(3,'toward the corner'),TG+.02],[SECS(3),TG+.3]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(LUC,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-17,5.2,9.5],T:[-5,.6,-3],fov:36})],
  [CUE(3,'Attack')-.2,1,()=>({P:[-16,4.4,8.5],T:[-3.6,.5,-4.6],fov:28})],
  [CUE(3,'get free')-.2,1,()=>({P:[-15,3.4,7],T:mix3(w,[-4.5,1,-4.4],.5),fov:24})],
  [CUE(3,'head the ball down')-.2,.9,()=>({P:[-13.5,2.8,6],T:mix3(HEAD_PT,[0,.6,-3.4],.35),fov:22})],
  [CUE(3,'toward the corner')-.2,.9,()=>({P:[-13,2.6,5.4],T:[-1.2,.9,-3.4],fov:22})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tD=CUE(3,'Defenders'),tA=CUE(3,'Attack'),tG=CUE(3,'get free'),tH=CUE(3,'head the ball down'),tC=CUE(3,'toward the corner');
  stadium(s,c,t,[0,1,3],{roar:.35+.3*sm(tC+.2,tC+.8,t)});
  ground(s,c);
  // "Defenders can score too": a yellow ring on Lúcio (the centre-back) from the first word
  groundRing(s,c,at(LUC,tau,0),.75,Y,sm(tD-.1,tD+.4,t)*(1-sm(tH-.1,tH+.2,t)),.14);
  // "Attack the far post": the far-post zone lights up yellow, a red ring where he meets it
  const za=sm(tA-.1,tA+.4,t)*(1-sm(tC+.8,tC+1.4,t));
  if(za>0){const zone=polyP(c,[[-.2,.01,-2.4],[-5.5,.01,-2.4],[-5.5,.01,-8],[-.2,.01,-8]]);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.3*za);s.tone(Y,zp,.35*za);}
   groundRing(s,c,[HP[0],0,HP[1]],.85,R,za);}
  // "get free of your marker": a red gap arrow from the marker toward Lúcio's run, the marker ringed navy a step behind
  const gf=sm(tG-.15,tG+.35,t)*(1-sm(tH+.3,tH+.8,t));
  if(gf>0){const l=at(LUC,tau,.05),d=at(DEM,tau,.05);arrow3(s,c,[mix3(d,l,.1),mix3(d,l,.1+.8*gf)],Math.max(8,kAt(c,l)*.07),R,.95*gf);
   const X=pr(c,d);if(X){const rr=kAt(c,d)*.5,ring=polyPath(blob(X[0],X[1],rr,rr*.34,7,{n:20}),true);s.stroke(K,ring,Math.max(4,rr*.1),.8*gf);}}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[LUC,GK,DEM,4,6]});
  // "head the ball down hard": a ring on the ball at his forehead, then a yellow arrow down along the header
  const hd=sm(tH-.15,tH+.25,t)*(1-sm(tC+1,tC+1.5,t));
  if(hd>0){if(r.ball&&tau<TF+.1){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*hd);s.fill(Y,rp,.95*hd);}
   const arr=sm(tH+.2,tC,t,easeInOutSine);if(arr>0){const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*arr*i/8));arrow3(s,c,q,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95*hd);}}
  // "toward the corner": the bottom corner inside the post lights up (a red frame), a burst as it goes in
  const tc=sm(tC-.1,tC+.3,t);
  if(tc>0){const box=polyP(c,[[0,.05,-3.6],[0,.05,-2.2],[0,1.1,-2.2],[0,1.1,-3.6]]);if(box.length>2){const bp=polyPath(box,true);s.stroke(R,bp,Math.max(5,kAt(c,GOAL_PT)*.05),.95*tc);s.tone(R,bp,.3*tc);}
   if(tau>TG-.02){const q=pr(c,GOAL_PT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,GOAL_PT)*.6)*easeOutBack(tc),{n:10,seed:61,width:Math.max(6,kAt(c,GOAL_PT)*.05)});}}
 },
 get still(){return CUE(3,'toward the corner')+.3;},
};

const film:RisoStory={
 id:'lucio-header-2009',format:'11v11',title:"Lúcio's far-post header",
 theme:'Defenders can score: attack the far post, get free of your marker and head the ball down hard toward the corner',
 ageNote:'United States 2–3 Brazil, FIFA Confederations Cup final, Ellis Park, Johannesburg, 28 June 2009. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a header — a ball loops in, a yellow spark where it is met, and it is nodded down and away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x+200*(1-u):x-120*easeOut(out),by=age<.3?y-120*(1-u)*(1-u):y+90*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (metres; the US goal line x = 0, +z = Brazil's right) — checked by tests/play-film-lucio-header-2009.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,cornerFoot:'r' as const,
 elanoContact:()=>{const st=stateOf(ELA,0),sk=solve(st.pose,B_ELA,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 lucioAt:(tau:number)=>{const st=stateOf(LUC,tau),sk=solve(st.pose,B_LUC,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 dempseyAt:(tau:number)=>{const st=stateOf(DEM,tau);return{x:st.place.x??0,z:st.place.z??0};}};
