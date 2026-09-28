/** Keylor Navas saves Theofanis Gekas's penalty — the shoot-out of the 2014 FIFA World Cup round of 16, Costa Rica 1–1 Greece (a.e.t.,
 * Costa Rica won 5–3 on penalties), Arena Pernambuco, Recife, Sunday 29 June 2014. An iconic-play riso film (RisoStory, chapters mode)
 * played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction of the kick and the save from WRITTEN
 * accounts (the broadcast footage itself was not reviewed), rendered as a riso print. Kept kind: the film celebrates the save and never
 * mocks the kicker.
 *
 * SOURCES (read Sept 26 2026 with curl, cached in the build scratchpad cardfilms6/src/):
 *  - Wikipedia, "2014 FIFA World Cup knockout stage" (raw wikitext; its report cites BBC Sport and The Guardian; kit boxes cite FIFA's
 *    tactical line-ups): 29 June 2014, 17:00 BRT, Itaipava Arena Pernambuco, Recife, 41,242, referee Ben Williams (AUS); Ruiz 52',
 *    Papastathopoulos 90+1'; the shoot-out: Borges ✓ Mitroglou ✓, Ruiz ✓ Christodoulopoulos ✓, González ✓ Holebas ✓, Campbell ✓ Gekas ✗,
 *    Umaña ✓ (5–3) — Costa Rica kicked first, so they led 4–3 when Gekas took Greece's fourth; "Navas saved Gekas' shot before Michael
 *    Umaña scored the winning penalty"; Navas GK 1, Gekas FW 17 (on 69'); kits: Costa Rica white shirts and white shorts (FFFFFF),
 *    Greece all blue (2447D5); Costa Rica's first ever World Cup quarter-final.
 *    https://en.wikipedia.org/wiki/2014_FIFA_World_Cup_knockout_stage
 *  - The Guardian, Paul Wilson at Arena Pernambuco, "Costa Rica beat Greece on penalties to meet Holland in quarter-finals", 29 June 2014:
 *    "Theo Gekas saw his effort, Greece's fourth, saved by Keylor Navas. The goalkeeper ... dived to his right but beat away Gekas's shot
 *    with his left hand"; photo caption "Costa Rica's Keylor Navas saves from the Greece forward Theofanis Gekas in the penalty shootout".
 *    https://www.theguardian.com/football/2014/jun/30/costa-rica-greece-world-cup-2014-last-16-match-report
 *  - Wikipedia, "Keylor Navas": height 1.85 m; man of the match v Greece "after several saves in normal time and a save from Theofanis
 *    Gekas' kick during the penalty shootout"; known for agility and reflexes. https://en.wikipedia.org/wiki/Keylor_Navas
 *  - Wikipedia, "Theofanis Gekas": height 1.80 m; striker. https://en.wikipedia.org/wiki/Theofanis_Gekas
 * CONFIRMED: the date, the city, the shoot-out order and score (Costa Rica 4–3 up when Gekas stepped up), Navas DIVED TO HIS RIGHT and
 *  BEAT THE BALL AWAY WITH HIS LEFT HAND; the next kick (Umaña) won it; Costa Rica reached their first quarter-final; kits as above.
 * INFERRED (illustrative, never named in the narration): Gekas's kicking foot (drawn RIGHT) and his run-up (a short run from his left);
 *  the height (≈1.1 m) and line of the shot and its speed; that it was parried out wide; the keepers' kit colours (Navas printed yellow,
 *  Karnezis printed red — NOT verified), the referee's (navy); where the lines stood in the centre circle; the stadium's seat colours and
 *  roof (drawn as a generic two-tier bowl printed navy/blue), the crowd's colours; Navas's roar; the white shirts running to him (drawn
 *  after "Costa Rica score", i.e. after Umaña's winning kick, which the film does not stage); every camera placement and lens.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the bowl at night → the lines in the centre
 * circle → the goal, 4–3 → Gekas places the ball → Navas bouncing on his line → the run, the shot, the dive to his right → Saved!);
 * ch2 = the slow-motion replay LOW from behind the spot (on his toes, the push-off, the left hand reaching across, a riso trail, the ball
 * bouncing away); ch3 = the second replay angle from BEHIND THE GOAL by his right post (the stop), live again as he jumps up and roars, a
 * pan to the centre circle and the white shirts sprinting to him; ch4 = the lesson: toes (a ring on his feet), watch the ball (a sight
 * line), push off (a red arrow from the legs), strong hand (a yellow ring at the left glove), even a hard shot (the ball bounces off).
 * Composed on the FULL sheet (never sheet.safe). Figures: every body goes through drawPlayer() → athlete.ts. Handedness: right-handed
 * world (x toward the goal, y up, +z = the kicker's right), athlete.ts's own convention, so strike foot 'r' is Gekas's RIGHT foot; Navas
 * faces −x, so HIS RIGHT is −z (keeperDive side 'r') and the ball is aimed at his solved LEFT glove. Inks: yellow, red, blue, navy
 * (grass = yellow under blue). Everything keyed to cue times (withTiming), poses on twos, cameras on ones; randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Skeleton} from './athlete';
import timingJson from '../../../public/plays/narration/navas-greece-2014/timing.json';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The save, live',text:'Recife, the 2014 World Cup. Costa Rica against Greece, and it goes to penalties! Costa Rica lead four-three. Theofanis Gekas steps up. Keylor Navas bounces on his line... Gekas shoots. Navas flies to his right. Saved!',tail:2.4,
  cues:['Recife','Costa Rica against','penalties','Costa Rica lead','Theofanis','Keylor Navas','Gekas shoots','Navas flies','Saved']},
 {label:'Watch it again',text:'Watch it again, slowly. Navas stays on his toes. He pushes off hard, and reaches across with his left hand. Strong hand! The ball bounces away.',tail:1.4,
  cues:['Watch it again','toes','pushes','reaches','Strong hand','bounces']},
 {label:'From behind the goal',text:'From behind the goal: what a stop! Navas jumps up and roars. Next kick, Costa Rica score, and they reach the quarter-finals for the first time!',tail:2.2,
  cues:['From behind','what a stop','jumps up','Next kick','Costa Rica score','quarter-finals']},
 {label:'The secret',text:"The secret? Keepers, stay on your toes. Watch the ball. Push off hard with your legs, and make a strong hand. Even a hard shot can't beat a strong hand!",tail:1.8,
  cues:['The secret','toes','Watch the ball','Push off','strong hand','Even']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ .32 s a word) used only when a cue has no recorded match */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('navas: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('navas: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
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

// ---------------------------------------------------------------- the bowl at night: two tiers, a roof ring with floodlights (generic, inferred)
const CX=-52.5;
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122,17,a),1.2+30*b,-43-32*b],
 (a,b)=>[9+30*b,1.2+30*b,lerp(-62,62,a)],
 (a,b)=>[lerp(17,-122,a),1.2+28*b,43+30*b],
 (a,b)=>[-114-30*b,1.2+30*b,lerp(62,-62,a)],
];
const STAND_COLS=[104,72,104,72],STAND_ROWS=16;
const FASCIA:[number,number][]=[[.44,.5]];
/** crowd colour weights [paper (white shirts), red (Costa Rica red), blue (Greece, Costa Rica blue), yellow (Brazil fans, flags)] */
const CROWD_MIX:[number,number,number,number][]=[[.34,.34,.24,.08],[.32,.4,.2,.08],[.34,.34,.24,.08],[.3,.3,.32,.08]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(K,.84,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-900],[1e4,hz[1]-900],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const[b0,b1] of FASCIA)addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.8),[0,12,0]),add3(S(0,.8),[0,12,0])]));
  seg3(c,add3(S(0,.8),[0,11.8,0]),add3(S(1,.8),[0,11.8,0]),.45,edge);}
 s.knockout(planes);s.tone(B,planes,.5);s.tone(K,planes,.4);s.knockout(fas);s.fill(K,fas,.85);s.tone(Y,fas,.2);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.24)/.76,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(R,inks[1],.95);s.knockout(inks[2],.7);s.fill(B,inks[2],.95);s.knockout(inks[3],.8);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.022,.8),[0,11.4,0]),b=add3(S(u+.022,.8),[0,11.4,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
function ground(s:Sheet,c:Cam,o:{goal?:boolean}={}){
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.7);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.2);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.8);
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
 if(o.goal!==false)goal3(s,c);
}
function goal3(s:Sheet,c:Cam){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=X+2;
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back,1.9,z0],[back,0,z0]],[[X,0,z1],[X,H,z1],[back,1.9,z1],[back,0,z1]],
  [[X,H,z0],[X,H,z1],[back,1.9,z1],[back,1.9,z0]],[[back,0,z0],[back,0,z1],[back,1.9,z1],[back,1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back,1.9,z],.022,mesh,.7);seg3(c,[back,1.9,z],[back,0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back,y,zs[i]],[back,y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back,y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back,y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_T:InkFill[]=[[Y,.5],[R,.34],[K,.1]];
/** Costa Rica: white shirts, white shorts (sourced); white socks, red/blue trim and red numbers (inferred) */
const crc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_T,hair:K,line:K,trim:R,numberInk:R,hairStyle:'short',...o});
/** Greece: all blue (sourced); paper numbers (inferred) */
const gre=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const GEKAS_B={height:1.80,bulk:.98};
const GEKAS_ST=gre({number:17,skin:SKIN_L,hair:[K,.9],build:GEKAS_B,seed:17});
const NAVAS_B={height:1.85,bulk:1};
/** Keylor Navas: 1.85 m, No. 1 (sourced); keeper kit printed yellow with long sleeves and navy gloves (colour NOT verified) */
const NAVAS_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.9],socks:[Y,.95],boots:K,skin:SKIN_T,hair:[K,.95],line:K,trim:K,gloves:[K,.7],sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:NAVAS_B,seed:1};
const REF_ST:AthleteStyle={shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,trim:Y,build:{height:1.83},seed:30};
/** Orestis Karnezis (Greece's keeper) waiting by the penalty-area line (kit colour inferred) */
const KARN_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[K,.8],line:K,trim:K,gloves:'paper',sleeves:'long',number:1,numberInk:'paper',build:{height:1.90},seed:31};

// ---------------------------------------------------------------- the kick on one clock τ (τ = 0 is contact)
const B0:V3=[-11,.11,0];
/** Gekas: RIGHT foot (inferred), a short run from his LEFT (−z) */
const DIRN=Math.hypot(1,.3),DIR:[number,number]=[1/DIRN,.3/DIRN];
const YAW_H=yawTo(0,0,DIR[0],DIR[1]);
const SD=.9,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.6,RUN_L=2.8,STRIKE_L=1.3,G_MARK=-(RUN_L+STRIKE_L),G_BALL=-.35;
const POWER=.85;
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:POWER,foot:'r'}),GEKAS_B,{x:0,z:0,yaw:YAW_H}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];

// ---------------------------------------------------------------- Navas: bouncing on his toes, the push-off to his right, the left hand, up, the roar
const T_DIVE=-.03,DIVE_S=.88,SAVE_U=.55,T_SAVE=T_DIVE+SAVE_U*DIVE_S,DIVE_H=.62;
const NAV_X=-.12;
const NAV_PLACE:Place={x:NAV_X,z:0,yaw:Math.PI};
const DIVE_END=keeperDive(1,{side:'r',height:DIVE_H});
const UP=posed({dz:DIVE_END.dz,lHipF:8,rHipF:8,lHipA:8,rHipA:8,lKnee:10,rKnee:10,lean:2,neckP:0,lShA:26,rShA:26,lShF:6,rShF:6,lElb:22,rElb:22,lHand:.6,rHand:.6});
/** the roar: fists clenched, elbows bent, chest out, head back */
const ROAR=posed({dz:DIVE_END.dz,lHipF:14,rHipF:6,lHipA:14,rHipA:14,lKnee:22,rKnee:14,lean:-8,pitch:-3,neckP:-26,lShA:96,rShA:96,lShF:20,rShF:20,lElb:112,rElb:112,lShR:-10,rShR:-10,lHand:0,rHand:0});
const T_UP=1.4,T_STAND=2.2,T_OPEN=3.1;
/** he stays on his toes: the set position with a live bounce (never flat-footed) */
function navasPose(tau:number,it:number):Pose{
 let p=keeperSet(it*1.6);
 if(tau>T_DIVE-.25)p=blendPose(p,keeperSet(.75),sm(T_DIVE-.25,T_DIVE,tau)*.6);
 if(tau>T_DIVE){const u=clamp((tau-T_DIVE)/DIVE_S);p=blendPose(p,keeperDive(u,{side:'r',height:DIVE_H}),sm(T_DIVE,T_DIVE+.05,tau));}
 if(tau>T_UP)p=blendPose(p,UP,sm(T_UP,T_STAND,tau,easeInOutSine));
 if(tau>T_OPEN)p=blendPose(p,ROAR,sm(T_OPEN,T_OPEN+.45,tau,easeOutBack));
 return p;
}
const navSk=(tau:number,it=0)=>solve(navasPose(tau,it),NAVAS_B,NAV_PLACE);
/** diving to his right, he reaches ACROSS with his LEFT (top) hand (sourced) */
const lead=(sk:Skeleton):V3=>sk.lHa;
const TGT:V3=(()=>{const g=lead(navSk(T_SAVE));return[g[0]-.1,Math.max(.25,g[1]),g[2]];})();

// ---------------------------------------------------------------- the ball: the shot to his right, beaten away wide
const PARRY_S=1.4;
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<T_SAVE){const u=tau/T_SAVE,e=u*(1.1-.1*u);return[lerp(B0[0],TGT[0],e),lerp(B0[1],TGT[1],e)+.25*Math.sin(Math.PI*e),lerp(B0[2],TGT[2],e)];}
 const u=clamp((tau-T_SAVE)/PARRY_S),e=easeOut(u);
 const y=u<.4?lerp(TGT[1],.11,u/.4)+.9*Math.sin(Math.PI*u/.4):.11+.25*Math.sin(Math.PI*(u-.4)/.6);
 return[TGT[0]-4.4*e,Math.max(.11,y),TGT[2]-3.2*e];
}
const spinAt=(tau:number)=>tau<=0?0:tau<T_SAVE?TAU*4*tau:TAU*4*T_SAVE-TAU*1.6*Math.min(tau-T_SAVE,PARRY_S);

// ---------------------------------------------------------------- Gekas: places the ball, walks back, the run, the right-foot strike, a quiet stop
const P_PLACE=posed({lHipF:40,rHipF:70,lKnee:60,rKnee:100,lean:40,pitch:12,neckP:30,lShF:66,rShF:62,lElb:20,rElb:18,lShA:12,rShA:14,lHand:.8,rHand:.8});
const P_WAIT=posed({lHipF:-4,rHipF:10,lKnee:12,rKnee:18,lAnk:0,rAnk:-4,lean:6,pitch:1,neckP:-2,lShA:14,rShA:14,lShF:2,rShF:0,lElb:22,rElb:24});
const P_GO=posed({lHipF:-18,rHipF:22,lKnee:24,rKnee:30,lAnk:16,rAnk:-6,lean:14,pitch:4,neckP:10,lShA:22,rShA:20,lShF:-12,rShF:14,lElb:40,rElb:46,twist:-8});
const HIPS=posed({lShA:30,rShA:30,lShF:-24,rShF:-24,lElb:96,rElb:96,lShR:-40,rShR:-40,lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:6,neckP:2});
const QUIET=posed({lShA:30,rShA:30,lShF:-24,rShF:-24,lElb:96,rElb:96,lShR:-40,rShR:-40,lHipF:8,rHipF:10,lKnee:12,rKnee:14,lean:10,neckP:26});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.35);p.air=0;return p;};
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function runG(tau:number){const w=runU(tau);return G_MARK+RUN_L*(1.1*w-.1*w*w);}
function gekasPose(tau:number,walk=1,it=0):Pose{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk;if(u<.12)return blendPose(P_PLACE,stand(),sm(0,.12,u));
   const d=Math.abs(G_MARK-G_BALL)*sm(.12,.82,u,linear);let p=walkPose(d*.72);if(u>.82)p=blendPose(p,P_WAIT,sm(.82,1,u));return p;}
  const br=.5+.5*Math.sin(it*2.1),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.35,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(2.6*u,{speed:.6}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.6+(tau-RUN_END)*1.6,{speed:.55});
 let p=blendPose(run,strike(Math.min(1,us),{power:POWER,foot:'r'}),sm(RUN_END,RUN_END+.14,tau));
 if(tau>.6)p=blendPose(p,P_WAIT,sm(.6,1,tau));
 if(tau>1)p=blendPose(p,HIPS,sm(1,1.5,tau));
 if(tau>1.8)p=blendPose(p,QUIET,sm(1.8,2.6,tau));
 return p;
}
function gekasPlace(tau:number,walk=1):Place{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk,g=lerp(G_BALL,G_MARK,sm(.12,.82,u,linear)),[x,z]=gPos(g);
   return{x,z,yaw:u<.12?YAW_H:lerpAng(lerpAng(YAW_H,YAW_H+Math.PI,sm(.08,.2,u)),YAW_H+TAU,sm(.8,1,u))};}
  const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_H};}
 let g:number;
 if(tau<RUN_END)g=runG(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.8*(1-Math.pow(1-clamp(tau/.9),2));
 const[x,z]=gPos(g);return{x,z,yaw:YAW_H};
}

// ---------------------------------------------------------------- everyone else: the lines in the centre circle, Karnezis, the officials
type Role='ref'|'ar'|'gk'|'crc'|'gre';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const ACTORS:Actor[]=[
 {name:'Williams',role:'ref',st:REF_ST,x:-7.6,z:6.2,phase:.6},
 {name:'goal-line assistant',role:'ar',st:{...REF_ST,seed:32},x:.25,z:9.6,phase:.1},
 {name:'Karnezis',role:'gk',st:KARN_ST,x:-.6,z:21.2,phase:.3},
];
{const arc=(i:number,sd:number):[number,number]=>{const a=(8+9.5*i)*DEG;return[CX+6.6*Math.cos(a),sd*6.6*Math.sin(a)];};
 for(let i=0;i<7;i++)ACTORS.push({name:'Costa Rica '+i,role:'crc',st:crc({number:[5,10,3,9,4,6,16][i],skin:i%3===1?SKIN_M:SKIN_T,build:{height:1.76+.03*(i%3),bulk:.95+.03*(i%2)},seed:40+i,detail:'low'}),x:arc(i,1)[0],z:arc(i,1)[1],phase:i*.23});
 for(let i=0;i<7;i++)ACTORS.push({name:'Greece '+i,role:'gre',st:gre({number:[9,20,15,19,21,8,4][i],hair:i%2===0?[K,.6]:K,build:{height:1.8+.02*(i%3)},seed:50+i,detail:'low'}),x:arc(i,-1)[0],z:arc(i,-1)[1],phase:i*.31});}
const LINKED=posed({lShA:78,rShA:78,lShF:18,rShF:18,lElb:34,rElb:34,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:6,neckP:4});
const RUSH_V=8.2;
const NAV_END:[number,number]=(()=>{const sk=navSk(3);return[sk.pelvis[0],sk.pelvis[2]];})();
function rushPos(a:Actor,tau:number,tR:number):[number,number,number]{
 const k=Number(a.name.slice(11)),tx=NAV_END[0]-1-.35*(k%3),tz=NAV_END[1]+1.6-.55*k,L=Math.hypot(tx-a.x,tz-a.z),d=Math.max(0,tau-tR-.08*k)*RUSH_V;
 if(d>=L)return[tx,tz,0];const acc=Math.min(1,Math.max(0,tau-tR)/.5);return[a.x+(tx-a.x)*d/L,a.z+(tz-a.z)*d/L,acc];
}
function actorAt(a:Actor,tau:number,it:number,tR:number):{pose:Pose;place:Place}{
 const br=Math.sin(it*2.1+a.phase*TAU),saved=sm(T_SAVE+.1,T_SAVE+.6,tau);
 switch(a.role){
  case 'ref':return{pose:blendPose(stand(),HIPS,.3+.1*br),place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-11,0)}};
  case 'ar':return{pose:blendPose(stand(),HIPS,.2),place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-6,0)}};
  case 'gk':return{pose:blendPose(stand(),HIPS,.25+.1*br),place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-6,0)}};
  case 'gre':return{pose:blendPose(stand(),LINKED,.85-.5*saved),place:{x:a.x,z:a.z,yaw:0}};
  default:{const[x,z,sp]=rushPos(a,tau,tR);let p=blendPose(stand(),LINKED,.85);
   // after the save: a jump of joy on the spot (the shoot-out is not over yet)
   if(saved>0&&tau<tR)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),saved*.55*(1-sm(T_SAVE+2,T_SAVE+3,tau)));
   if(tau>tR){const d=Math.max(0,tau-tR)*RUSH_V;p=blendPose(p,runCycle(d/4.2+a.phase,{speed:.95}),sm(tR,tR+.25,tau)*(sp>0?1:0));if(sp===0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),.8);}
   const yaw=tau>tR?yawTo(a.x,a.z,NAV_END[0],NAV_END[1]):0;return{pose:p,place:{x,z,yaw}};}
 }
}

// ---------------------------------------------------------------- figure adapter + ball
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<T_SAVE+.5){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=20):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

type Env={it:number;walk?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';crowd?:boolean;rush?:number};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending,tR=e.rush??1e9;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const walk=e.walk??1;
 {const pl=gekasPlace(tp,walk),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=gekasPose(tp,walk,e.it),prev={pose:gekasPose(tpPrev,walk,e.it-1/12),place:gekasPlace(tpPrev,walk)};
  drawPlayer(s,pose,c,detailFor(GEKAS_ST,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2&&tp<.35);}});}
 {const d=visible({x:NAV_X+.4,z:tp>T_SAVE?-1.6:0});if(d>0)items.push({d,draw:()=>{const pose=navasPose(tp,e.it),prev={pose:navasPose(tpPrev,e.it-1/12),place:NAV_PLACE};drawPlayer(s,pose,c,detailFor(NAVAS_ST,d,true),NAV_PLACE,prev,!!e.smear&&tp>T_DIVE&&tp<T_SAVE+.25);}});}
 for(const a of ACTORS){const circle=a.role==='crc'||a.role==='gre';if(circle&&!e.crowd&&!(a.role==='crc'&&tp>tR))continue;const cur=actorAt(a,tp,e.it,tR),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12,tR);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const hxz=(tau:number,walk=1):V3=>{const p=gekasPlace(tau,walk);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
const tS1=()=>Math.max(CUE(0,'Gekas shoots')+.25,CUE(0,'Keylor Navas')+.8-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0-5,t-tS1());
const walk1=(t:number)=>{const a=CUE(0,'Theofanis')-.2,b=Math.max(a+.8,Math.min(a+3,tS1()+T_RUN0-1));return sm(a,b,t,linear);};
const P1:V3=[-34,21,60];
function cam1(t:number):Cam{
 const tRun=tS1()+T_RUN0,w=walk1(t),ep:V3=[NAV_X,1.1,0];
 return plan(t,[
  [0,0,()=>({P:P1,T:[-46,24,-40],fov:58})],
  [CUE(0,'Costa Rica against')-.2,1.1,()=>({P:P1,T:[-48,1,0],fov:13})],
  [CUE(0,'Costa Rica lead')-.1,1,()=>({P:P1,T:[-8,1,-.5],fov:15})],
  [CUE(0,'Theofanis')-.2,.9,()=>({P:P1,T:add3(hxz(T_RUN0-.5,w),[0,1,0]),fov:5.8})],
  [CUE(0,'Keylor Navas')-.25,.8,()=>({P:P1,T:ep,fov:4.8})],
  [Math.max(tRun-.35,CUE(0,'Keylor Navas')+.6),.7,()=>({P:P1,T:[-5.4,1,-.5],fov:13.5})],
  [tS1()+T_SAVE+.25,.8,()=>({P:P1,T:[-1.6,1,-1.4],fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_SAVE,tSv=CUE(0,'Saved');
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tSv-.1,tSv+.3,t)*(1-sm(tSv+2,tSv+3,t))});
  ground(s,c);
  play(s,c,tau,tp,tpp,{it:tt,walk:walk1(tt),minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',crowd:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:5.6,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low behind the spot
const tau2=(t:number)=>key(t,mono([[0,T_RUN0+.1],[CUE(1,'toes'),-.8],[CUE(1,'pushes'),T_DIVE+.02],[CUE(1,'reaches'),T_SAVE-.14],[CUE(1,'Strong hand'),T_SAVE+.01],[CUE(1,'bounces'),T_SAVE+.12],[SECS(1),T_SAVE+.9]]),linear);
const E2:V3=[-17,1.35,4.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,T_SAVE));
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(add3(hxz(tau),[4,1,0]),[-1.5,1,-.3],sm(T_RUN0,-.6,tau)),fov:22})],
  [CUE(1,'toes')-.25,1,()=>({P:add3(E2,[4,-.2,-1.2]),T:[-.6,.7,-.2],fov:16})],
  [CUE(1,'pushes')-.1,.9,()=>({P:add3(E2,[5,-.35,-1.5]),T:mix3(b,[-.3,.9,-1.8],.6),fov:15})],
  [CUE(1,'Strong hand')-.15,1,()=>({P:add3(E2,[5.6,-.3,-1.8]),T:add3(TGT,[-.2,.05,.4]),fov:9})],
  [CUE(1,'bounces')-.1,1,()=>({P:add3(E2,[5.2,-.1,-1.8]),T:add3(TGT,[-2,-.2,-1.4]),fov:14})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(T_SAVE,T_SAVE+.4,tau)});
  ground(s,c);
  if(tau>.02&&tau<T_SAVE+.9){const pts=pathPts(c,Math.max(0,tau-.5),Math.min(tau,T_SAVE),16),fade=1-sm(T_SAVE+.2,T_SAVE+.9,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_SAVE)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  // on his toes: little dust puffs under the bouncing feet (before the push-off)
  const tT=CUE(1,'toes');if(t>tT-.1&&tau<T_DIVE){const sk=navSk(tp,tt);for(const f of[sk.lToe,sk.rToe]){const q=pr(c,[f[0],.02,f[2]]);if(q){const a=sm(tT-.1,tT+.3,t,easeOutBack);const p=new Path2D();p.ellipse(q[0],q[1],Math.max(10,kAt(c,f)*.16)*a,Math.max(4,kAt(c,f)*.05)*a,0,0,TAU);s.knockout(p,.8);s.tone(Y,p,.5);}}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  const hit=sm(T_SAVE-.02,T_SAVE+.06,tau)*(1-sm(T_SAVE+.3,T_SAVE+.7,tau));if(hit>0){const q=pr(c,TGT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,TGT)*.5)*easeOutBack(hit),{n:9,seed:23,width:Math.max(5,kAt(c,TGT)*.04)});}
 },
 aperture(t){const c=cam2(t),q=toCam(c,TGT),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*.14/q[2]*1.2),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 3 · from behind the goal by his right post: the stop, the roar, the white shirts
const tau3=(t:number)=>key(t,mono([[0,T_SAVE-.32],[CUE(2,'what a stop'),T_SAVE+.06],[CUE(2,'jumps up')-.2,T_SAVE+.7],[CUE(2,'jumps up')+.9,T_OPEN+.1],[CUE(2,'Next kick'),T_OPEN+.6],[SECS(2),T_OPEN+.6+(SECS(2)-CUE(2,'Next kick'))]]),linear);
const rush3=()=>T_OPEN+.6+(CUE(2,'Costa Rica score')-CUE(2,'Next kick'));
const E3:V3=[4.3,.95,-5.2];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[-1.2,.6,-2.2],fov:30})],
  [CUE(2,'what a stop')-.2,.9,()=>({P:add3(E3,[-.4,-.15,.5]),T:add3(TGT,[0,.05,0]),fov:22})],
  [CUE(2,'jumps up')-.1,1,()=>({P:add3(E3,[-.2,.3,.6]),T:[NAV_END[0],1.2,NAV_END[1]],fov:24})],
  [CUE(2,'Next kick')-.2,1.1,()=>({P:add3(E3,[.7,3.2,.3]),T:[-44,1,1],fov:20})],
  [CUE(2,'Costa Rica score')+.2,2,()=>({P:add3(E3,[.7,4.5,.3]),T:[-24,0,-1],fov:30})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tA=CUE(2,'Costa Rica score');
  stadium(s,c,t,[0,2,3],{roar:.3+.7*sm(T_SAVE,T_SAVE+.4,tau),flash:.9*sm(tA-.1,tA+.3,t)});
  ground(s,c,{goal:false});
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10,crowd:true,rush:rush3()});
  goal3(s,c);
  const w=CUE(2,'what a stop'),hit=sm(w-.1,w+.2,t)*(1-sm(w+.5,w+1,t));
  if(hit>0){const q=pr(c,TGT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,TGT)*.6)*easeOutBack(hit),{n:9,seed:29,width:Math.max(5,kAt(c,TGT)*.045)});}
  // the roar: a red burst round his head as he shouts
  const ro=sm(tau3(CUE(2,'jumps up')+.5),T_OPEN+.4,tau)*(1-sm(CUE(2,'Next kick'),CUE(2,'Next kick')+.6,t));
  if(ro>.02){const sk=navSk(tp,tt),q=pr(c,sk.head);if(q)sparkBurst(s,R,q[0],q[1],Math.max(40,kAt(c,sk.head)*.7)*easeOutBack(ro),{n:8,seed:31,width:Math.max(4,kAt(c,sk.head)*.04)});}
 },
 aperture(t){const c=cam3v(t),g=navSk(tau3(t)),q=pr(c,g.chest)??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:1.4,
};

// ---------------------------------------------------------------- 4 · the lesson: toes → watch the ball → push off → strong hand → even a hard shot
const tau4=(t:number)=>key(t,mono([[0,-2.4],[CUE(3,'toes'),-2],[CUE(3,'Watch the ball'),-.6],[CUE(3,'Push off'),T_DIVE],[CUE(3,'strong hand'),T_SAVE-.02],[CUE(3,'Even'),T_SAVE+.02],[SECS(3),T_SAVE+.3]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-5.2,1.5,3.8],T:[-.2,.9,0],fov:36})],
  // watch the ball: side-on from the clear side of the box (the referee and assistant stand on +z), so Navas, the sight line and the ball on the spot share the frame (the old behind-the-goal eye
  // put Navas behind the camera and blended through empty grass on the way in and out)
  [CUE(3,'Watch the ball')-.2,.8,()=>({P:[-5.6,2.1,-13],T:[-5.6,.8,0],fov:44})],
  [CUE(3,'Push off')-.2,.9,()=>({P:[-5.8,1.4,-5.8],T:[-.4,.7,-1.4],fov:38})],
  [CUE(3,'Even')-.2,1,()=>({P:[-6.4,1.6,-4.4],T:[-.6,.8,-1.8],fov:34})],
 ]);
}
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
function ring3(s:Sheet,c:Cam,at:V3,r:number,w:number,ink:string,cov:number,flat=true,seed=43){
 const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,P:V3=flat?[at[0]+Math.cos(a)*r,at[1],at[2]+Math.sin(a)*r]:add3(at,[c.r[0]*Math.cos(a)*r+c.u[0]*Math.sin(a)*r,c.r[1]*Math.cos(a)*r+c.u[1]*Math.sin(a)*r,c.r[2]*Math.cos(a)*r+c.u[2]*Math.sin(a)*r]),p=pr(c,P);if(p)pts.push(p);}
 if(pts.length<28)return;const rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:.8});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tT=CUE(3,'toes'),tW=CUE(3,'Watch the ball'),tP=CUE(3,'Push off'),tS=CUE(3,'strong hand'),tE=CUE(3,'Even');
  stadium(s,c,t,[0,1,2,3],{});
  ground(s,c);
  // 1 · toes: a yellow ring on the grass round his bouncing feet
  const to=sm(tT-.1,tT+.35,t,easeOutBack)*(1-sm(tW-.1,tW+.3,t));
  if(to>.02){const sk=navSk(tp,tt),ft:V3=[(sk.lAn[0]+sk.rAn[0])/2,.02,(sk.lAn[2]+sk.rAn[2])/2];ring3(s,c,ft,.6,Math.max(6,kAt(c,ft)*.035),Y,clamp(to),true,41);}
  // 3 · push off: a red arrow from his planted legs along the dive to his right
  const po=sm(tP-.15,tP+.35,t,easeOutBack)*(1-sm(tS+.2,tS+.6,t));
  if(po>.02){const a:V3=[NAV_X,.3,0],b:V3=[NAV_X-.3,.9,-2.2*clamp(po)];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.06),R,.95);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // 2 · watch the ball: a dashed yellow sight line from his eyes to the ball
  const sl=sm(tW-.15,tW+.5,t,easeOutBack)*(1-sm(tP+.1,tP+.5,t));
  if(sl>.02){const ek=navSk(tp,tt),a=pr(c,ek.face),b=pr(c,ballAt(tau));
   if(a&&b){const rb=new Path2D(),n=9,w=Math.max(8,kAt(c,ek.face)*.04),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);}}
  // 4 · strong hand: a yellow ring round the left glove as it meets the ball
  const sh=sm(tS-.05,tS+.4,t,easeOutBack);
  if(sh>.02&&tau>T_SAVE-.1){const g=lead(navSk(tp,tt));ring3(s,c,g,.3+.05*sm(tE-.1,tE+.3,t),Math.max(6,kAt(c,g)*.035),Y,clamp(sh),false,59);}
  // 5 · even a hard shot: the ball bounces off — a burst at the hand
  const ev=sm(tE-.05,tE+.35,t)*(1-sm(tE+1.2,tE+1.8,t));if(ev>0){const q=pr(c,TGT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,TGT)*.8)*easeOutBack(ev),{n:10,seed:61,width:Math.max(6,kAt(c,TGT)*.05)});}
 },
 still:9,
};

const film:RisoStory={
 id:'navas-greece-2014',format:'11v11',title:"Navas's shoot-out save",
 theme:'Goalkeeping in a shoot-out: stay on your toes, watch the ball, push off hard and make a strong hand',
 ageNote:'Costa Rica 1–1 Greece (Costa Rica won 5–3 on penalties), 2014 FIFA World Cup round of 16, Arena Pernambuco, Recife, 29 June 2014. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a strong hand — one yellow glove punches the ball away with a spark. Reduced motion: the still pose. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.35)),fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed);
  if(age>0&&age<.4)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.4),width:9,cov:fade});
  const p=new Path2D();p.ellipse(x-40+18*u,y,22,30,-.3,0,TAU);s.knockout(p,.9*fade);s.fill(Y,p,.9*fade);s.stroke(K,p,3,.85*fade);
  footballPanels(s,x+30*u,y-14*u,22,{rot:r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
