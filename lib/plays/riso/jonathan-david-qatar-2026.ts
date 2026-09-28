/** Jonathan David v Qatar — Canada 6–0 Qatar, FIFA World Cup 2026, Group B, BC Place, Vancouver, 18 June 2026 (15:00 local, under the
 * closed roof). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or
 * StoryFilmPlayer. A reconstruction of David's 29th-minute first goal of his hat-trick — the right-footed volley — from WRITTEN accounts
 * (the footage itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad kdp-src/):
 *  - Wikipedia, "2026 FIFA World Cup Group B" (raw): Canada 6–0 Qatar, 18 June 2026, BC Place, Vancouver, attendance 52,497; goals Larin 16',
 *    J. David 29', 45+3', 90+2', Saliba 64', Manai 75' og; Canada's first World Cup win; David the first North American man to score a World
 *    Cup hat-trick since 1930; kits (Canada all black, the third kit; Qatar white shirts and shorts, maroon socks); line-ups (David 10,
 *    Buchanan 17, Larin 9, Eustáquio 7 (c), Koné 8, Ali Ahmed 20, Johnston 2, Laryea 22; Abunada 1, Pedro Miguel 2, Khoukhi 16 (c),
 *    Al-Oui 13, Homam Ahmed 14, Gaber 5, Madibo 23)  https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_B
 *  - ESPN live commentary (gameId 760440), 29': "A STUNNING GOAL FROM DAVID! ... Buchanan makes a driving run before chopping the ball onto
 *    his left foot. He proceeds to take a shot, but it deflects into the path of David inside the box, who expertly hits a right-footed
 *    volley into the bottom-right corner!!"; half-time summary: "David found the bottom-right corner with a stunning right-footed volley"
 *  - Inter Miami CF match recap: "David then doubled Canada's advantage in the 29th minute with a powerful volley from the right end of the
 *    box"; AP (ESPN / Global News): "David doubled the lead with a right-footed volley in the 29th"
 * CONFIRMED by those accounts: the date, ground, 29th minute, 2–0 at the time and 6–0 at the end; Buchanan's driving run and cut onto his
 * LEFT foot, his shot DEFLECTED into David's path INSIDE the box, on the RIGHT side of the box; David's first-time RIGHT-footed VOLLEY into
 * the BOTTOM-RIGHT corner; his hat-trick; Canada's first World Cup win. Kits: Canada all black; Qatar white shirts and shorts, maroon socks.
 * INFERRED (illustrative): every exact position and timing; where Buchanan started his run (the right wing); which Qatar player the shot
 * deflected off (drawn: an unnamed defender's boot) and how high it popped up; the volley height (about knee height); Abunada's kit
 * (drawn blue) and his dive; the direction of play on screen; the roof and the red crowd.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (Buchanan's run → the cut → the shot → the
 * deflection → the volley → the net); ch2 = the slow replay from a LOW camera behind David (he keeps moving, the ball pops up, eyes on it,
 * the right-foot volley); ch3 = a replay from behind the goal (low into the bottom corner) ending on the celebration; ch4 = the lesson (keep
 * moving in the box, hit it first time before the defender can block it). Composed on the FULL sheet (never sheet.safe).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts. Handedness: right-handed world (x toward Qatar's goal, y up,
 * +z = the main-stand side = David's right), athlete.ts's own convention. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,volley,runCycle,dribble,stand,keeperSet,keeperDive,lunge,posed,blendPose,celebrate,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Vancouver, 2026. World Cup: Canada against Qatar. Tajon Buchanan drives in from the right and shoots. It deflects up... and Jonathan David volleys it first time. Goal!',tail:2.6,
  cues:['Vancouver','Canada against Qatar','Tajon Buchanan','drives in','shoots','deflects up','Jonathan David','volleys','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. David keeps moving in the box, so he is ready when the ball pops up. Eyes on the ball, then a right-footed volley.',tail:1.6,
  cues:['Watch again','keeps moving','ready','pops up','Eyes on the ball','right-footed volley']},
 {label:'Bottom corner',text:'Into the bottom corner! David scores a hat-trick, and Canada win their first ever World Cup game.',tail:2.4,
  cues:['Into the bottom corner','hat-trick','Canada win','first ever']},
 {label:'Your turn',text:'Your turn, strikers: keep moving in the box. When the ball comes to you, hit it first time, before the defender can block it.',tail:2.2,
  cues:['Your turn','keep moving','comes to you','first time','before the defender']},
];
import timingJson from '../../../public/plays/narration/jonathan-david-qatar-2026/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('david: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('david: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one */
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
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bump=(a:number,b:number,t:number)=>Math.sin(Math.PI*clamp((t-a)/(b-a)));
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Germany's goal line is x = 0 (Italy attack +x), goal centre z = 0, +z = the main-stand side, the halfway line x = −52.5. */
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
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- BC Place: a round bowl under a closed cable roof, a red Canada crowd
const CXS=-52.5,NS=56,PE=.5;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(41+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=44;
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.3+30*b];
type Bowl={seg:V3[][];tier:V3[][];roof:V3[][];ribs:[V3,V3][];seats:{P:V3;h:number}[];lamps:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],tier:[],roof:[],ribs:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1),[dm,ym]=RAKE(.5);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.tier.push([rim(a,dm,ym),rim(b,dm,ym),rim(b,dm+1,ym+2.2),rim(a,dm+1,ym+2.2)]);
  o.roof.push([rim(a,SD1+3,34),rim(b,SD1+3,34),rim(b,-30,50),rim(a,-30,50)]);
  if(i%4===0)o.ribs.push([rim(a,SD1+3,34),rim(a,-30,50)]);
  if(i%2===0)o.lamps.push([rim(a,SD1,33),rim(b,SD1,33)]);
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.2)continue;const[d,y]=RAKE((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(K,.7,.5);s.field(B,.2,.5);
 const bowl=new Path2D(),tier=new Path2D(),roof=new Path2D(),rib=new Path2D();
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 for(const[a,b] of BOWL.ribs)seg3(c,a,b,.5,rib,.9);
 s.knockout(roof);s.tone(K,roof,.45);s.knockout(rib,.7);
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.tier){const r=quadP(c,q);if(r)addPoly(tier,r);}
 s.knockout(bowl);s.tone(R,bowl,.35);s.tone(K,bowl,.3);
 // the crowd: Canada red (most of it), white, a few maroon Qatar, phone lights
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.7?0:q.h<.93?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.fill(R,inks[0],.9);s.knockout(inks[1],.8);s.fill(Y,inks[2],.95);
 s.fill(K,tier,.85);
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+4)continue;seg3(c,a,b,.9,lamp);seg3(c,a,b,3.4,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
const GRASS=(()=>{const o:V3[]=[];for(let i=0;i<64;i++)o.push(rim(i/64*TAU,-.5,0));return o;})();
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,GRASS);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.14);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([4.2,0,-30],[4.2,0,30]);board([-110,0,-37],[3,0,-37]);board([-110,0,37],[3,0,37]);
 for(let k=0;k<9;k++){const z=-28+k*6.4;addPoly(pn,polyP(c,[[4.1,.25,z],[4.1,.25,z+3.3],[4.1,.68,z+3.3],[4.1,.68,z]]));}
 for(const zz of[-36.9,36.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.5);
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
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out where the ball hits (BULGE_Z, high or low) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=BULGE_Z,back=(z:number,y=0)=>X+2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.4,2))*((y>1.2)===BULGE_HIGH?1:.3);
 const zs=[z0,-1.8,0,1.8,3,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,2),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,2),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,2),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,2),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,2),1.9,z],.022,mesh,.7);seg3(c,[back(z,2),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Canada: all black (the third kit, confirmed; black prints navy), red trim and white numbers (inferred) */
const canada=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:R,numberInk:'paper',hairStyle:'short',...o});
/** Qatar: white shirts and shorts, maroon socks (confirmed; maroon printed red) */
const qatar=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:[R,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:[R,.9],numberInk:[R,.9],hairStyle:'short',...o});
const JD_B={height:1.8,bulk:1};
const JD_ST=canada({number:10,skin:SKIN_D,build:JD_B,seed:10});
const ABU_ST:AthleteStyle={shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:{height:1.86},seed:1};

// ---------------------------------------------------------------- the geometry (τ = seconds after David's volley)
/** the volley: right side of the box (confirmed "right end of the box"), low into the BOTTOM-RIGHT corner (confirmed) */
const GOAL_PT:V3=[0,.38,3.15];
const BULGE_Z=3.1,BULGE_HIGH=false;
const VX=-10.9,VZ=6.4;
const YAW_V=yawTo(VX,VZ,GOAL_PT[0],GOAL_PT[2])+22*Math.PI/180;
const VH=.35,VD=.9,V_ST=-.5*VD;
function vVolley(tau:number):Pose{return volley(clamp((tau-V_ST)/VD),{foot:'r',height:VH});}
/** the right boot at contact, relative to his pelvis (FK), so the ball meets the boot exactly */
const VTOE=(()=>{const sk=solve(vVolley(0),JD_B,{x:0,z:0,yaw:YAW_V});return mix3(sk.rAn,sk.rToe,.6);})();
const VP:V3=[VX,Math.max(.2,VTOE[1]),VZ];
const P0:[number,number]=[VX-VTOE[0],VZ-VTOE[2]];
/** Buchanan's run from the right, the cut onto his left foot (τ −2.25), the left-foot shot (−1.75), the deflection (−1.5), the loop to David */
const T_CUT=-2.25,T_BU=-1.75,T_DF=-1.5,FLY=.46,IN_NET=FLY+.08;
const CUT:V3=[-20.8,.11,12.6],BU:V3=[-19,.11,11],DF:V3=[-15.6,.45,9.1];
const YAW_BU=yawTo(BU[0],BU[2],-2,1);
const BTOE=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l',power:.8}),{height:1.83},{x:0,z:0,yaw:YAW_BU});return mix3(sk.lAn,sk.lToe,.55);})();
const B0:[number,number]=[BU[0]-BTOE[0],BU[2]-BTOE[2]];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'can'|'qat'|'gk';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Jonathan David',role:'hero',st:JD_ST,key:true,keys:[[-12,-16,1],[-6,-14.5,2.5],[-4,-13.2,1.4],[-2.5,-12.4,3.4],[T_DF,-12.2,4.8],[-.6,P0[0]-.9,P0[1]-.2],[0,...P0],[.5,P0[0]+1.2,P0[1]+.6],[1.6,P0[0]+3,P0[1]+4],[3.4,P0[0]+3.5,P0[1]+10],[5,P0[0]+4,P0[1]+13],[12,P0[0]+4,P0[1]+13]]},
 {name:'Buchanan',role:'can',st:canada({number:17,skin:SKIN_D,build:{height:1.83},seed:17}),key:true,keys:[[-12,-36,20],[-5,-29,18],[-3.2,-23.2,14.4],[T_CUT,CUT[0]-.5,CUT[1]+.1],[T_BU,...B0],[-1,B0[0]+1.2,B0[1]-.5],[1,B0[0]+2.5,B0[1]],[5,P0[0]+5,P0[1]+12.2],[12,P0[0]+5,P0[1]+12.2]]},
 {name:'Larin',role:'can',st:canada({number:9,build:{height:1.88},seed:9}),key:true,keys:[[-12,-13,-4],[-3,-10.5,-2.6],[0,-8.6,-1.4],[2,-8,1],[5,P0[0]+3,P0[1]+13.8],[12,P0[0]+3,P0[1]+13.8]]},
 {name:'Eustáquio',role:'can',st:canada({number:7,build:{height:1.77},seed:7}),keys:[[-12,-30,4],[0,-24,6],[6,P0[0]+4.6,P0[1]+14.2],[12,P0[0]+4.6,P0[1]+14.2]]},
 {name:'Koné',role:'can',st:canada({number:8,skin:SKIN_D,build:{height:1.88},seed:8}),keys:[[-12,-32,-6],[0,-26,-5],[12,-20,-2]]},
 {name:'Ali Ahmed',role:'can',st:canada({number:20,build:{height:1.8},seed:20}),keys:[[-12,-24,-20],[0,-18,-17],[12,-14,-12]]},
 {name:'Pedro Miguel',role:'qat',st:qatar({number:2,build:{height:1.85},seed:2}),key:true,keys:[[-12,-12,8],[-3,-13.5,9],[T_DF,DF[0]+.55,DF[2]-.35],[0,-14.2,8.6],[12,-13.5,8]]},
 {name:'Khoukhi',role:'qat',st:qatar({number:16,skin:SKIN_D,build:{height:1.82},seed:16}),key:true,keys:[[-12,-10,1],[-3,-10.2,2.2],[0,-9.2,3.6],[12,-8.6,3.4]]},
 {name:'Al-Oui',role:'qat',st:qatar({number:13,build:{height:1.78},seed:13}),keys:[[-12,-11,-7],[0,-9.5,-5],[12,-9,-4]]},
 {name:'Homam Ahmed',role:'qat',st:qatar({number:14,build:{height:1.8},seed:14}),key:true,keys:[[-12,-16,15],[-3,-18,13],[T_BU,-17.4,10.2],[0,-15.4,9.6],[12,-14,9]]},
 {name:'Gaber',role:'qat',st:qatar({number:5,build:{height:1.8},seed:5}),keys:[[-12,-21,-3],[0,-18,-2.5],[12,-16,-2]]},
 {name:'Madibo',role:'qat',st:qatar({number:23,skin:SKIN_D,build:{height:1.8},seed:23}),keys:[[-12,-23,-9],[0,-19.5,-8],[12,-17,-7]]},
 {name:'Abunada',role:'gk',st:ABU_ST,key:true,keys:[[-12,-2.5,.5],[-2,-2,1.2],[-.4,-1.6,1.4],[0,-1.5,1.4],[12,-1.5,1.4]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,BUCH=IX('Buchanan'),DEFL=IX('Pedro Miguel'),GK=IX('Abunada');
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-12,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- the ball: Buchanan's carry, the cut, the shot, the deflection, the volley, the net
const loft=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];
const NET_HIT:V3=[1.6,.3,3.3],REST:V3=[1.2,.11,3];
function ballAt(tau:number):V3{
 if(tau<T_CUT){const[x,z]=posOf(BUCH,tau),[vx,vz]=velOf(BUCH,tau),l=Math.hypot(vx,vz)||1;return[x+vx/l*.55,.11,z+vz/l*.55];}
 if(tau<T_BU){const u=(tau-T_CUT)/(T_BU-T_CUT);return mix3(CUT,BU,u);}
 if(tau<T_DF)return mix3(BU,DF,(tau-T_BU)/(T_DF-T_BU));
 if(tau<0)return loft(DF,VP,(tau-T_DF)/-T_DF,2.3);
 if(tau<FLY)return mix3(VP,GOAL_PT,tau/FLY);
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.5);return mix3(NET_HIT,REST,easeOut(u));
}
const spinAt=(tau:number)=>TAU*(tau<0?2*tau:7*Math.min(tau,IN_NET)+1.5*Math.max(0,tau-IN_NET));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** "eyes on the ball": head tilted up to the dropping ball, then down over it */
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='qat'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===BUCH){
  if(tau<T_CUT)p=blendPose(p,dribble(distOf(k,tau)/1.7,{foot:'r',speed:.8}),.7);
  const D=.75,u=(tau-(T_BU-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.8}),w);yaw=lerpAng(yaw,YAW_BU,w);}}
 if(k===DEFL){const D=.8,u=(tau-(T_DF-.6*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),w);yaw=lerpAng(yaw,yawTo(x,z,BU[0],BU[2]),w);}}
 if(k===HERO){
  // eyes on the dropping ball: head up as it loops, then down over the contact
  if(tau<0&&tau>T_DF)p=over(p,{neckP:-24},bump(T_DF,-.35,tau));
  const u=(tau-V_ST)/VD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.3,u));
  if(w>0){p=blendPose(p,vVolley(tau),w);yaw=lerpAng(yaw,YAW_V,sm(-.35,0,tau));}
  if(tau>IN_NET+.2)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:'run'}),sm(IN_NET+.2,IN_NET+.7,tau)*(1-sm(4.6,5.2,tau)));
  if(tau>5)p=over(p,JOY,sm(5,5.5,tau));
 }
 if(k===GK){const at=.36,dur=.85,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.05}),sm(0,.1,u));yaw=Math.PI;}}
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='can')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='qat')p=over(p,DESPAIR,w*.85);}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.08,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>-.1&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={minBall?:number;lines?:boolean;prevT?:number;smear?:boolean;hero?:'high'|'mid'};
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env={}):DrawResult|undefined{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;let heroR:DrawResult|undefined;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,tp),px=h*ppu,hero=k===HERO;
   const detail:AthleteStyle['detail']=passing?(hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':hero&&e.hero==='mid'&&px>170?'mid':'auto';
   const big=px>=90&&!passing,prev=big?(()=>{const q2=poseOf(k,tpp),[px2,pz2]=posOf(k,tpp);return{pose:q2.p,place:{x:px2,z:pz2,yaw:q2.yaw}};})():undefined;
   const r=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,!!e.smear&&hero&&big&&tp>-.45&&tp<.35);if(hero)heroR=r;}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return heroR;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
function trail(s:Sheet,c:Cam,ta:number,tb:number,tau:number,w:number,o:{ink?:string;dash?:boolean;min?:number;seed?:number}={}){if(w<=.02||tau<=ta)return;
 const{ink=Y,dash=false,min=6,seed=63}=o;const pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,ballAt(lerp(ta,Math.min(tau,tb),i/24)));if(p)pts.push(p);}if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(Math.min(tau,tb)))*.12);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.7,pressure:.2,wobble:0}),.75*w);
 s.fill(ink,ribbon(pts,wd,{seed,taper:.7,pressure:.2,wobble:0,gaps:dash?[[.1,.16],[.26,.32],[.42,.48],[.58,.64],[.74,.8]]:[]}),.95*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
function goalRing(s:Sheet,c:Cam,P:V3,w:number,ink=R,seed=77){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(24,kAt(c,P)*.45)*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(5,r*.14),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** "keeps moving": his own run in the box drawn on as an arrow */
function runArrow(s:Sheet,c:Cam,k:number,ta:number,tb:number,w:number,ink=Y){if(w<=.02)return;const pts:V3[]=[];const te=lerp(ta,tb,w);for(let i=0;i<=12;i++)pts.push(at3(k,lerp(ta,te,i/12),.04));arrow3(s,c,pts,Math.max(7,kAt(c,pts[pts.length-1])*.13),ink,.95);}
function spark(s:Sheet,c:Cam,P:V3,t:number,t0:number,ink=Y,seed=61){const a=t-t0;if(a<-.08||a>.5)return;const q=pr(c,P);if(!q)return;sparkBurst(s,ink,q[0],q[1],Math.max(44,kAt(c,P)*.5),{n:9,seed,g:easeOutBack(clamp((a+.08)/.14))*(1-clamp((a-.28)/.22)),width:Math.max(4,kAt(c,P)*.05)});}
/** "eyes on the ball": a dashed yellow line from his head to the dropping ball */
function eyes(s:Sheet,c:Cam,r:DrawResult|undefined,tau:number,w:number){if(!r||w<=.02)return;const H=r.sk.head,a=pr(c,H),b=pr(c,ballAt(Math.min(tau,0)));if(!a||!b)return;const e:Pt=[lerp(a[0],b[0],w),lerp(a[1],b[1],w)];const u=Math.max(3,c.F*.035/toCam(c,H)[2]);
 s.knockout(ribbon([a,e],u*1.7,{seed:71,taper:0,wobble:.4}),.7*w);s.fill(Y,ribbon([a,e],u*.85,{seed:71,taper:0,wobble:.4,gaps:[[.2,.28],[.46,.54],[.72,.8]]}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time anchored on the volley
const tau1=(t:number)=>t-(CUE(0,'volleys')+.15);
const P1:V3=[-26,24,72];
function cam1(t:number):Cam{
 const tau=tau1(t),bu=at3(BUCH,tau,1),hp=at3(HERO,tau,1),b=ballAt(Math.min(tau,IN_NET)),g=CUE(0,'Goal');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-26,2,4],fov:26})],
  [CUE(0,'Tajon')-.3,1,()=>({P:P1,T:mix3(bu,[-14,1,6],.3),fov:13})],
  [CUE(0,'shoots')-.2,.8,()=>({P:P1,T:mix3(b,hp,.45),fov:11})],
  [CUE(0,'Jonathan')-.2,.8,()=>({P:P1,T:mix3(hp,[-6,1,4],.35),fov:10})],
  [g-.6,1,()=>({P:P1,T:[-2,1,3],fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.25,tau)*(1-sm(IN_NET+2.5,IN_NET+3.5,tau))});
  ground(s,c,{bulge:bulgeAt(tau)});
  const dr=CUE(0,'drives');runArrow(s,c,BUCH,-4.2,T_CUT,sm(dr-.1,dr+.9,t)*(1-sm(dr+2,dr+2.5,t)));
  trail(s,c,T_DF,0,tau,sm(-1.45,-1.3,tau)*(1-sm(.6,1,tau)),{dash:true});
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
  spark(s,c,DF,tau,T_DF,Y,13);spark(s,c,VP,tau,0,R,19);
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Goal')+.3;

// ---------------------------------------------------------------- 2 · slow replay, low behind David
const tau2=(t:number)=>key(t,mono([[0,-4.4],[CUE(1,'keeps'),-3.6],[CUE(1,'ready'),-1.9],[CUE(1,'pops up'),-1.45],[CUE(1,'Eyes'),-.5],[CUE(1,'right-footed'),0],[SECS(1),.6]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),hp=at3(HERO,Math.min(tau,.2),.9),b=ballAt(Math.min(tau,FLY));
 const behind=(d:number,h:number,side:number):V3=>{const[x,z]=posOf(HERO,Math.min(tau,.1));return[x-d,h,z+side];};
 return plan(t,[
  [0,0,()=>({P:behind(7,1.8,-3),T:mix3(hp,[-4,1,3],.4),fov:46})],
  [CUE(1,'pops up')-.2,.8,()=>({P:behind(6,1.5,-2.8),T:mix3(hp,b,.5),fov:42})],
  [CUE(1,'Eyes')-.2,.8,()=>({P:behind(4.4,1.3,-2.4),T:add3(hp,[1.2,.1,-.2]),fov:36})],
  [CUE(1,'right-footed')+.15,1.1,()=>({P:behind(4.8,1.4,-2.4),T:mix3(add3(VP,[5,.3,-1]),b,.5),fov:38})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tK=CUE(1,'keeps'),tR=CUE(1,'ready'),tP=CUE(1,'pops up'),tE=CUE(1,'Eyes'),tV=CUE(1,'right-footed');
  stadium(s,c,t);ground(s,c);
  runArrow(s,c,HERO,-4.2,-1.6,sm(tK-.1,tR,t)*(1-sm(tP+.3,tP+.7,t)));
  ring(s,c,at3(HERO,tau),.7,sm(tR-.1,tR+.3,t,easeOutBack)*(1-sm(tE,tE+.3,t)),Y,44);
  trail(s,c,T_DF,0,tau,sm(tP-.2,tP+.1,t)*(1-sm(tV+.3,tV+.7,t)),{dash:true});
  trail(s,c,0,FLY,tau,sm(tV-.1,tV+.1,t),{min:7,seed:66});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  eyes(s,c,hr,tau,sm(tE-.1,tE+.3,t)*(1-sm(tV,tV+.3,t)));
  const bm=sm(tV-.12,tV+.2,t,easeOutBack)*(1-sm(tV+.6,tV+1,t));
  if(hr&&bm>.02){const toe=hr.joints.rToe,an=hr.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*bm+3,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.9]);}
   s.fill(R,ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*bm);}
  spark(s,c,VP,t,tV,Y,61);
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),FLY)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'Eyes')+.2;

// ---------------------------------------------------------------- 3 · behind the goal: low into the bottom corner, the celebration
const tau3=(t:number)=>{const th=CUE(2,'hat-trick');return key(t,mono([[0,-.3],[CUE(2,'Into'),.15],[CUE(2,'Into')+.7,IN_NET+.3],[th,IN_NET+1.6],[SECS(2)+1,IN_NET+1.6+(SECS(2)+1-th)*.9]]),linear);};
const E3:V3=[7,1.9,-.6];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),hp=at3(HERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([VX,.8,VZ],b,.3),fov:30})],
  [CUE(2,'Into')+.2,.6,()=>({P:add3(E3,[-.6,-.3,1]),T:[-1,.6,2.6],fov:26})],
  [CUE(2,'hat-trick')-.3,1.3,()=>({P:[-2,2.4,24],T:add3(hp,[.5,.3,0]),fov:30})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tI=CUE(2,'Into'),tC=CUE(2,'Canada win'),tF=CUE(2,'first ever');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tC-.1,tC+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  trail(s,c,0,FLY,tau,1-sm(IN_NET+.4,IN_NET+1,tau),{min:8,seed:66});
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  goalRing(s,c,GOAL_PT,sm(tI+.3,tI+.7,t,easeOutBack)*(1-sm(tI+1.4,tI+1.9,t)),Y);
  // "a hat-trick": three footballs pop over him, one by one
  const th=CUE(2,'hat-trick'),n=Math.floor(clamp((t-th)/.22,0,3)),fd=1-sm(tF+.4,tF+.9,t);
  if(fd>0)for(let i=0;i<n;i++){const P=add3(at3(HERO,tau),[0,2.5,(i-1)*.8]),q=pr(c,P);if(q)footballPanels(s,q[0],q[1],Math.max(12,kAt(c,P)*.22)*fd*easeOutBack(clamp((t-th-i*.22)/.2)),{rot:i,key:K,shadow:B,seed:5});}
  const fb=sm(tC-.05,tC+.35,t);if(fb>0){const q=pr(c,add3(at3(HERO,tau),[0,3.6,0]));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'Into')+.3;

// ---------------------------------------------------------------- 4 · the lesson: keep moving → the ball comes to you → first time → before the defender blocks it
const tau4=(t:number)=>key(t,mono([[0,-4.6],[CUE(3,'keep'),-4],[CUE(3,'comes'),-1.4],[CUE(3,'first time'),0],[CUE(3,'before'),.3],[SECS(3),IN_NET+.6]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),hp=at3(HERO,Math.min(tau,0),.9);
 return plan(t,[
  [0,0,()=>({P:add3(hp,[-5,4.5,-9]),T:add3(hp,[4,0,1]),fov:40})],
  [CUE(3,'comes')-.2,.9,()=>({P:add3(hp,[-6,3.4,-7]),T:mix3(hp,[-15,1.2,8],.4),fov:42})],
  [CUE(3,'first time')-.1,.8,()=>({P:[VX-6,2.6,VZ-7],T:[-5,.8,4],fov:40})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tK=CUE(3,'keep'),tC=CUE(3,'comes'),tF=CUE(3,'first time'),tB=CUE(3,'before'),E=SECS(3);
  stadium(s,c,t);ground(s,c,{bulge:bulgeAt(tau)});
  runArrow(s,c,HERO,-4.4,-1.2,sm(tK-.1,tC,t)*(1-sm(tF,tF+.4,t)));
  trail(s,c,T_DF,0,tau,sm(tC-.2,tC+.1,t)*(1-sm(E-1,E-.6,t)),{dash:true});
  trail(s,c,0,FLY,tau,sm(tF-.1,tF+.1,t)*(1-sm(E-.8,E-.4,t)),{min:8,seed:66});
  play(s,c,tau,tp,tpp,{smear:true,minBall:14});
  // "before the defender can block it": Khoukhi's closing run, a red arrow that stops short of the ball
  const kh=IX('Khoukhi'),bw=sm(tB-.15,tB+.4,t)*(1-sm(E-.8,E-.4,t));if(bw>.02){const a=at3(kh,-.2,.04),pts:V3[]=[];for(let i=0;i<=6;i++)pts.push(mix3(a,[VX+1.4,.04,VZ-.9],i/6*bw));arrow3(s,c,pts,Math.max(6,kAt(c,a)*.12),R,.95);ring(s,c,[VX+1.6,0,VZ-1],.6,bw,R,57);}
  spark(s,c,VP,tau,0,Y,62);
 },
 still:0,
};
ch4.still=CUE(3,'comes')+.3;

/** facts the test reads back */
export const FACTS={GOAL_PT,VP,DF,BU,T_BU,T_DF,FLY,IN_NET,ballAt,posOf,
 heroAt:(tau:number)=>{const{p,yaw}=poseOf(HERO,tau),[x,z]=posOf(HERO,tau);return solve(p,JD_B,{x,z,yaw});},
 buchAt:(tau:number)=>{const{p,yaw}=poseOf(BUCH,tau),[x,z]=posOf(BUCH,tau);return solve(p,{height:1.83},{x,z,yaw});}};

const film:RisoStory={
 id:'jonathan-david-qatar-2026',format:'11v11',title:"Jonathan David's volley v Qatar",
 theme:'Keep moving in the box and hit the ball first time, before the defender can block it',
 ageNote:'Canada 6–0 Qatar, FIFA World Cup 2026, Group B, BC Place, Vancouver, 18 June 2026. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a first-time volley — a ball drops in a dashed loop and is struck away in a straight yellow streak. Reduced motion: the still streak. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:clamp(age/.5),fade=age<=0?1:1-clamp((age-.6)/.2),r=rng(seed);
  const e:Pt=u<.4?[x-80+80*u/.4,y-90*Math.sin(Math.PI*(.5+u/.8))]:[x+280*easeOut((u-.4)/.6),y-60*easeOut((u-.4)/.6)];
  if(u>.4)s.fill(Y,ribbon([[x,y],e],14,{seed,taper:.8,pressure:.3,wobble:.6}),.95*fade);
  if(age>.18&&age<.45)sparkBurst(s,R,x,y,80,{n:7,seed,g:1-clamp((age-.18)/.27),width:10});
  footballPanels(s,e[0],e[1],28,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
