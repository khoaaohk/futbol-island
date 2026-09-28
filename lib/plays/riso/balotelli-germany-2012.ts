/** Balotelli v Germany — Germany 1–2 Italy, UEFA Euro 2012 semi-final, National Stadium, Warsaw, 28 June 2012 (20:45 local, an
 * evening kick-off under floodlights). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction of Mario Balotelli's 36th-minute second goal from WRITTEN
 * accounts (the footage itself was not reviewed), printed as a riso sheet. Football only: the film cuts away from him after the goal.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad kdp-src/):
 *  - Wikipedia, "UEFA Euro 2012 knockout stage" (raw): date, Warsaw, 1–2, Balotelli 20' and 36', Özil 90+2' pen; both line-ups with
 *    numbers; kit templates: Germany all white (shirt, shorts, socks), Italy blue shirts, white shorts, blue socks
 *    https://en.wikipedia.org/wiki/UEFA_Euro_2012_knockout_stage
 *  - AP match report (Fox Sports / Inquirer): "The second goal began with a long vertical pass from Riccardo Montolivo ... Balotelli
 *    collected the pass ... controlled the ball with his chest and then sprinted forward and unleashed a blazing shot from the edge of
 *    the area as Germany goalkeeper Manuel Neuer again stood immobile"; "blasted a long shot into the top right corner as German
 *    goalkeeper Manuel Neuer stood frozen"  https://www.foxsports.com/stories/soccer/balotelli-muscles-italy-into-euro-2012-final
 *  - Sports Illustrated, 28 June 2012: "the lack of pressure on Montolivo's long ball to the screwed-up offside trap that allowed
 *    Balotelli to barrel through the middle virtually unmolested"  https://www.si.com/more-sports/2012/06/28/italy-germany-euro-2012-mario-balotelli
 *  - Search summaries (UEFA.com / France 24): "smashing home from just outside the box after beating the offside trap following a
 *    Riccardo Montolivo through ball"; "Montolivo picked out Balotelli, whose run caught out Germany defender Philipp Lahm"
 * CONFIRMED by those accounts: the date, ground, score and 36th minute; Montolivo's long ball over the German line; Balotelli beat the
 * offside trap (Lahm caught out) and went through the middle; he controlled it with his chest, ran on and struck from the edge of the
 * area into the TOP RIGHT corner; Neuer did not move. Kits: Germany all white; Italy blue shirts, white shorts, blue socks. Numbers:
 * Balotelli 9, Montolivo 18, Cassano 10, Pirlo 21, Marchisio 8, De Rossi 16; Neuer 1, Lahm 16, Hummels 5, Badstuber 14, Boateng 20,
 * Khedira 6, Schweinsteiger 7, Kroos 18, Özil 8.
 * INFERRED (illustrative): every exact position and timing; the RIGHT foot (Balotelli is right-footed; the reports say "blasted", no
 * foot named) and a laces strike; the direction of play on screen (Italy attacking left to right from the main-stand camera); where
 * Montolivo hit it from (inside Italy's half, left of centre); the chest control while running (drawn half-turned, not with his back to
 * goal); the bounce before the strike; Neuer's kit (drawn grey — its colour was not confirmed); the stadium look (an enclosed bowl with a
 * ring roof); the crowd colours; the referee is left out.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (the long ball → the run behind Lahm →
 * the chest → the thunderbolt → the net); ch2 = the slow replay from a LOW camera behind Balotelli's right shoulder (on the last
 * defender's shoulder, the sprint, one touch, laces through it); ch3 = a replay from BEHIND THE GOAL (the ball flies past a frozen
 * Neuer into the top corner) ending on Italy's players running to him; ch4 = the lesson: a camera level with the German line (the
 * offside line, the shoulder, break through, look up, strike). Composed on the FULL sheet (world units = sheet units centred on the
 * canvas; never sheet.safe), kept in the central ~1000 units so it frames from the 1.45:1 card window down to square.
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every figure inside a passage print low.
 * Handedness: right-handed world (x toward Germany's goal, y up, +z = the main-stand side = Balotelli's right as he attacks), athlete.ts's
 * own convention, so his RIGHT foot strikes without a mirrored projector. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Warsaw, 2012. Euro semi-final: Germany against Italy. Montolivo launches a long ball. Mario Balotelli beats the offside trap, chests it down, and... bang! Top corner!',tail:2.6,
  cues:['Warsaw','Germany against Italy','Montolivo','long ball','Mario Balotelli','offside trap','chests it down','bang','Top corner']},
 {label:'Watch it again',text:'Watch again, slowly. He waits on the shoulder of the last defender, then sprints in behind. One touch, head down, and he hits it with his laces.',tail:1.6,
  cues:['Watch again','waits on the shoulder','sprints in behind','One touch','head down','hits it']},
 {label:'Top corner',text:'Manuel Neuer does not even move. Two goals for Balotelli, and Italy are in the final!',tail:2.4,
  cues:['Manuel Neuer','does not even move','Two goals','Italy are in the final']},
 {label:'Your turn',text:'Your turn, strikers: stay on the shoulder of the last defender. When you break through, look up, and strike it hard.',tail:2.2,
  cues:['Your turn','stay on the shoulder','last defender','break through','look up','strike it hard']},
];
import timingJson from '../../../public/plays/narration/balotelli-germany-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('balotelli: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('balotelli: no cue '+w);return c.at;};
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

// ---------------------------------------------------------------- the Warsaw bowl: an enclosed, steep two-tier bowl close to the pitch under a ring roof
const CXS=-52.5,NS=56,PE=.4;
/** a point on the bowl: angle th round the pitch centre (0 = behind Germany's goal, +90° = the main stand), d metres out from the
 * front row (a rounded-rectangle superellipse hugging the pitch), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(58+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(39.5+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=40;
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.4+31*b];
type Bowl={seg:V3[][];tier:V3[][];roof:V3[][];seats:{P:V3;h:number}[];lamps:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],tier:[],roof:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1),[dm,ym]=RAKE(.48);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  // the balcony between the tiers (a dark band of executive boxes)
  o.tier.push([rim(a,dm,ym),rim(b,dm,ym),rim(b,dm+1.2,ym+2.4),rim(a,dm+1.2,ym+2.4)]);
  // the ring roof: a membrane from the back of the stands in to over the front rows
  o.roof.push([rim(a,12,37),rim(b,12,37),rim(b,SD1+3,34),rim(a,SD1+3,34)]);
  if(i%2===0)o.lamps.push([rim(a,12.5,36.6),rim(b,12.5,36.6)]);
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.2)continue;const[d,y]=RAKE((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a late-June evening: deep navy with a blue glow over the roof rim
 s.field(K,.66,.5);s.field(B,.3,.5);
 const bowl=new Path2D(),tier=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.tier){const r=quadP(c,q);if(r)addPoly(tier,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(bowl);s.tone(R,bowl,.3);s.tone(K,bowl,.36);
 // the crowd: Italy blue, white (Germany), Polish red-and-white neutrals, phone lights (yellow); the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.4?0:q.h<.72?1:q.h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.72);s.fill(B,inks[1],.85);s.fill(R,inks[2],.8);s.fill(Y,inks[3],.95);
 s.fill(K,tier,.85);
 s.knockout(roof);s.tone(K,roof,.6);s.tone(B,roof,.25);
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
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out HIGH in the top right-hand corner (z +3.1) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=3.1,back=(z:number,y=0)=>X+2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.4,2))*(y>1.2?1:.3);
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
/** Italy: blue shirts, white shorts, blue socks (confirmed); white numbers (inferred) */
const italy=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:'paper',socks:[B,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
/** Germany: all white (confirmed); black trim and numbers (printed navy, inferred) */
const germany=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
const BALO_B={height:1.89,bulk:1.1};
const BALO_ST=italy({number:9,skin:SKIN_D,build:BALO_B,seed:9});
const NEUER_ST:AthleteStyle={shirt:[K,.55],shorts:[K,.7],socks:[K,.55],boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:{height:1.93},seed:1};

// ---------------------------------------------------------------- the strike geometry (τ = seconds after Balotelli's contact)
/** where the ball is struck: the edge of the area, a little right of centre (inferred); into the TOP RIGHT corner (confirmed) */
const CX0=-19.2,CZ0=.9;
const GOAL_PT:V3=[0,2.12,3.15];
const YAW_S=yawTo(CX0,CZ0,GOAL_PT[0],GOAL_PT[2]);
/** a laces strike: toe pointed, knee over the ball, head down, arms wide for balance */
const LACES:Partial<Pose>={rAnk:48,lean:20,pitch:6,neckP:30,lShA:70,rShA:46};
const SD=1,S_ST=-STRIKE_CONTACT*SD;
function sStrike(tau:number):Pose{const u=(tau-S_ST)/SD;return over(strike(clamp(u),{foot:'r',power:1}),LACES,bump(-.4,.3,tau));}
const INSTEP=(()=>{const sk=solve(sStrike(0),BALO_B,{x:0,z:0,yaw:YAW_S});return mix3(sk.rAn,sk.rToe,.55);})();
const C_BALL:V3=[CX0,.11,CZ0];
const P0:[number,number]=[CX0-INSTEP[0],CZ0-INSTEP[2]];

// ---------------------------------------------------------------- the build-up: Montolivo's long ball → the chest → the bounce
const T_LB=-4,T_CH=-1.7,T_B1=-1.22,T_B2=-.55,FLY=.64,IN_NET=FLY+.1;
const LB0:V3=[-58.5,.11,-3.5],CH:V3=[-27.9,1.32,2.35],B1:V3=[-26.1,.11,2.05],B2:V3=[-22.5,.11,1.45];
/** the offside line when Montolivo strikes (the German back four step up to x = −39) */
const LINE_X=-39;
/** where Balotelli stands on the last defender's shoulder as the ball is struck */
const SHOULDER:[number,number]=[-39.3,4.4];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'ita'|'ger'|'gk';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const Br=(dx:number,dz:number)=>[P0[0]+dx,P0[1]+dz];
const ACTORS:Actor[]=[
 {name:'Balotelli',role:'hero',st:BALO_ST,key:true,keys:[[-12,-46,7],[-5.5,-40.5,5],[T_LB,...SHOULDER],[-3,-35.2,3.7],[T_CH,CH[0]-.25,CH[2]-.05],[T_B2,...Br(-3.1,.45)],[0,...P0],[.4,...Br(1.9,.35)],[1.3,...Br(4.4,1.1)],[2.6,...Br(5.4,1.4)],[12,...Br(5.5,1.4)]]},
 {name:'Montolivo',role:'ita',st:italy({number:18,build:{height:1.82},seed:18}),key:true,keys:[[-12,-61,-4.5],[T_LB,-59,-3.9],[-2,-56,-3],[0,-50,-1],[4,-42,1],[12,-38,2]]},
 {name:'Cassano',role:'ita',st:italy({number:10,build:{height:1.75,bulk:1.08},seed:10}),keys:[[-12,-42,-9],[T_LB,-40.2,-8.6],[-2,-33,-8],[0,-29,-7],[3,-22,-3],[6,P0[0]+4.8,P0[1]+.4],[12,P0[0]+4.8,P0[1]+.4]]},
 {name:'Marchisio',role:'ita',st:italy({number:8,build:{height:1.8},seed:8}),keys:[[-12,-50,12],[0,-38,10],[4,-28,6],[8,P0[0]+3.8,P0[1]+2.6],[12,P0[0]+3.8,P0[1]+2.6]]},
 {name:'Pirlo',role:'ita',st:italy({number:21,hair:K,hairStyle:'long',build:{height:1.77},seed:21}),keys:[[-12,-64,4],[0,-58,3],[12,-50,3]]},
 {name:'De Rossi',role:'ita',st:italy({number:16,build:{height:1.84},seed:16}),keys:[[-12,-55,-15],[0,-50,-12],[12,-42,-8]]},
 {name:'Lahm',role:'ger',st:germany({number:16,build:{height:1.7},seed:16}),key:true,keys:[[-12,-40.5,7],[T_LB,-38.9,6.3],[-3,-37.6,5.2],[T_CH,-31.4,3.4],[0,-24.2,2.3],[1,-21.5,2],[3,-19.5,2],[12,-19,2]]},
 {name:'Badstuber',role:'ger',st:germany({number:14,build:{height:1.9},seed:14}),key:true,keys:[[-12,-40.5,-2],[T_LB,-38.9,-1.4],[-3,-37.5,-.8],[T_CH,-31,-.5],[0,-23.5,-.6],[1,-20.8,-.2],[12,-19.8,0]]},
 {name:'Hummels',role:'ger',st:germany({number:5,build:{height:1.92},seed:5}),keys:[[-12,-40.6,-9],[T_LB,-39,-8.6],[-2,-35,-7],[0,-29,-5.4],[12,-24,-4]]},
 {name:'Boateng',role:'ger',st:germany({number:20,skin:SKIN_D,build:{height:1.92},seed:20}),keys:[[-12,-41,-18],[T_LB,-39.4,-17],[0,-33,-13],[12,-28,-10]]},
 {name:'Khedira',role:'ger',st:germany({number:6,build:{height:1.89},seed:6}),keys:[[-12,-50,1],[T_LB,-53,-.5],[0,-47,0],[12,-40,1]]},
 {name:'Schweinsteiger',role:'ger',st:germany({number:7,hair:[Y,.6],build:{height:1.83},seed:7}),keys:[[-12,-53,-8],[T_LB,-55.2,-5.2],[0,-50,-4],[12,-44,-3]]},
 {name:'Neuer',role:'gk',st:NEUER_ST,key:true,keys:[[-12,-5,-.5],[-3,-3.8,.3],[-1.2,-2,.5],[0,-1.4,.55],[12,-1.4,.55]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,MONTO=IX('Montolivo'),LAHM=IX('Lahm'),NEUER=IX('Neuer');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
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

// ---------------------------------------------------------------- the ball: the long ball, the chest, two bounces, the thunderbolt, the net
const MB:V3=(()=>{const[x,z]=posOf(MONTO,T_LB);return[x+.55,.11,z+.2];})();
/** a lofted ball: straight in plan, a parabola of peak h over the chord */
const loft=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];
const flight=(e:number):V3=>{const b=mix3(C_BALL,GOAL_PT,e);return[b[0],b[1]+.45*Math.sin(Math.PI*e),b[2]];};
const NET_HIT:V3=[1.75,2,3.2],REST:V3=[1.2,.11,2.9];
function ballAt(tau:number):V3{
 if(tau<T_LB){const[x,z]=posOf(MONTO,tau);return[x+.55,.11,z+.2];}
 if(tau<T_CH)return loft(MB,CH,(tau-T_LB)/(T_CH-T_LB),5.6);
 if(tau<T_B1){const u=(tau-T_CH)/(T_B1-T_CH);const p=mix3(CH,B1,u);return[p[0],lerp(CH[1],.11,u*u),p[2]];}
 if(tau<T_B2)return loft(B1,B2,(tau-T_B1)/(T_B2-T_B1),.55);
 if(tau<0)return loft(B2,C_BALL,-(tau-T_B2)/T_B2,.12);
 if(tau<FLY)return flight(tau/FLY);
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55);return[lerp(NET_HIT[0],REST[0],u),lerp(NET_HIT[1],REST[1],u*u),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>TAU*(tau<0?1.8*tau:7*Math.min(tau,IN_NET)+1.5*Math.max(0,tau-IN_NET));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** the chest cushion: chest pushed out and back to meet the dropping ball, chin down watching it, arms wide */
const CHEST:Partial<Pose>={lean:-22,pitch:-6,neckP:34,lShA:78,rShA:78,lShF:20,rShF:20,lElb:34,rElb:34};
/** after the goal he slows and stands, arms low (football only: no celebration pose) */
const STILL:Partial<Pose>={lShA:14,rShA:14,lElb:20,rElb:20,neckP:-6};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ger'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===MONTO){const D=.9,u=(tau-(T_LB-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.8}),w);yaw=lerpAng(yaw,yawTo(x,z,CH[0],CH[2]),w);}}
 if(k===NEUER){
  // "stood immobile": set, weight on his toes, and he never moves as the ball flies past
  p=keeperSet(tau<-1?tau*1.4:-1.4);
  if(tau>IN_NET+.2)p=over(p,{neckY:-70,neckP:-10,lShA:30,rShA:30},sm(IN_NET+.2,IN_NET+.8,tau));}
 if(k===HERO){
  if(tau<T_LB+.1&&tau>-6)p=over(p,{neckY:28,neckP:-4},bump(-6.2,T_LB+.2,tau)*.8);// scanning the line and the passer
  const cw=bump(T_CH-.4,T_CH+.32,tau);if(cw>0)p=over(p,CHEST,cw);
  const u=(tau-S_ST)/SD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,sStrike(tau),w);yaw=lerpAng(yaw,YAW_S,sm(-.3,.05,u));}
  if(tau>IN_NET+.6){p=over(p,STILL,sm(IN_NET+.6,IN_NET+1.6,tau));if(sp<.6)yaw=yawTo(x,z,x-4,z+6);}
 }
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='ita')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='ger')p=over(p,DESPAIR,w*.85);}
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
function shotPath(s:Sheet,c:Cam,tau:number,w:number,o:{ink?:string;from?:number;min?:number}={}){if(w<=0||tau<=0)return;
 const{ink=Y,from=0,min=8}=o,pts=pathPts(c,from,Math.min(tau,FLY+.001),24);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(Math.min(tau,FLY)))*.14);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
/** the long ball's flight so far */
function longPath(s:Sheet,c:Cam,tau:number,w:number){if(w<=0||tau<=T_LB)return;const pts=pathPts(c,T_LB,Math.min(tau,T_CH),20);if(pts.length<3)return;
 s.fill(Y,ribbon(pts,Math.max(5,kAt(c,ballAt(Math.min(tau,T_CH)))*.09),{seed:63,taper:.7,pressure:.2,wobble:0,gaps:[[.12,.2],[.36,.44],[.6,.68]]}),.9*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** "sprints in behind": his real run on the grass from τa toward τb, drawn out as an arrow */
function runArrow(s:Sheet,c:Cam,ta:number,tb:number,w:number,ink=Y){if(w<=.02)return;const pts:V3[]=[];const te=lerp(ta,tb,w);for(let i=0;i<=10;i++)pts.push(at3(HERO,lerp(ta,te,i/10),.04));arrow3(s,c,pts,Math.max(8,kAt(c,pts[pts.length-1])*.16),ink,.95);}
/** the offside line across the pitch at the German back line (yellow dashes on the grass) */
function offsideLine(s:Sheet,c:Cam,w:number,ink=Y){if(w<=.02)return;const p=new Path2D();const z0=-26,z1=26,n=18;for(let i=0;i<n;i+=2){const a=lerp(z0,z1,i/n),b=lerp(z0,z1,(i+1)/n);if(i/n>w)break;seg3(c,[LINE_X,.01,a],[LINE_X,.01,Math.min(b,lerp(z0,z1,w))],.35,p,2);}
 s.knockout(p,.85);s.fill(ink,p,.95);}
function goalRing(s:Sheet,c:Cam,P:V3,w:number,ink=R,seed=77){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(24,kAt(c,P)*.45)*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(5,r*.14),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** "look up": a dashed sight line from his head to the top corner */
function sightLine(s:Sheet,c:Cam,r:DrawResult|undefined,w:number){if(!r||w<=.02)return;const H=r.sk.head,a=pr(c,[H[0],H[1]+.05,H[2]]),b=pr(c,GOAL_PT);if(!a||!b)return;const e:Pt=[lerp(a[0],b[0],w),lerp(a[1],b[1],w)];
 const u=Math.max(3,c.F*.04/toCam(c,H)[2]);s.knockout(ribbon([a,e],u*1.7,{seed:71,taper:0,wobble:.4}),.7*w);s.fill(Y,ribbon([a,e],u*.85,{seed:71,taper:0,wobble:.4,gaps:[[.15,.22],[.36,.43],[.57,.64],[.78,.85]]}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** real time, anchored on the strike landing on "bang" (the chest then falls on "chests it down", the net on "Top corner") */
const tau1=(t:number)=>t-CUE(0,'bang');
const P1:V3=[-34,26,76];
function cam1(t:number):Cam{
 const tau=tau1(t),hp=at3(HERO,tau,1),b=ballAt(Math.min(tau,IN_NET)),g=CUE(0,'Top corner');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,3,-18],fov:34})],
  [CUE(0,'Montolivo')-.3,1,()=>({P:P1,T:mix3(at3(MONTO,tau,1),[LINE_X,1,2],.55),fov:14})],
  [CUE(0,'long ball')+.2,1.2,()=>({P:P1,T:mix3(b,hp,.6),fov:10.5})],
  [CUE(0,'chests it down')-.3,.8,()=>({P:P1,T:add3(hp,[2.5,0,0]),fov:7.2})],
  [CUE(0,'bang')-.15,.6,()=>({P:P1,T:mix3(hp,[-5,1.2,2],.5),fov:8.6})],
  [g+.2,1.4,()=>({P:P1,T:[-1,1.4,2.6],fov:7})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Top corner');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // "beats the offside trap": the German line lights up as he runs through it
  const ot=CUE(0,'offside trap');offsideLine(s,c,sm(ot-.2,ot+.5,t)*(1-sm(ot+1.4,ot+2,t)));
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
  // the chest: a small spark of contact
  const age=tau-T_CH;if(age>-.05&&age<.35){const q=pr(c,CH);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,CH)*.5),{n:7,seed:13,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.2)/.15)),width:Math.max(4,kAt(c,CH)*.05)});}
  // "bang": the strike flash
  const bg=tau;if(bg>-.04&&bg<.3){const q=pr(c,C_BALL);if(q)sparkBurst(s,R,q[0],q[1],Math.max(50,kAt(c,C_BALL)*.6),{n:9,seed:19,g:easeOutBack(clamp((bg+.04)/.1))*(1-clamp((bg-.16)/.14)),width:Math.max(5,kAt(c,C_BALL)*.06)});}
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Top corner')+.3;

// ---------------------------------------------------------------- 2 · slow-motion replay, low behind Balotelli's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-4.6],[CUE(1,'waits on'),-4.2],[CUE(1,'sprints'),T_LB+.1],[CUE(1,'One touch'),T_CH+.05],[CUE(1,'head down'),-.3],[CUE(1,'hits it'),0],[SECS(1),.7]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),hp=at3(HERO,Math.min(tau,.3),.9),b=ballAt(Math.min(tau,FLY));
 const behind=(d:number,h:number,side:number):V3=>{const[x,z]=posOf(HERO,Math.min(tau,.2));return[x-d,h,z+side];};
 return plan(t,[
  [0,0,()=>({P:behind(7,1.7,3.2),T:mix3(hp,[LINE_X+2,1,-2],.4),fov:44})],
  [CUE(1,'sprints')-.2,1,()=>({P:behind(6.5,1.5,2.6),T:mix3(hp,b,.4),fov:36})],
  [CUE(1,'One touch')-.3,.8,()=>({P:behind(4.6,1.3,2.3),T:add3(hp,[1,.3,0]),fov:30})],
  [CUE(1,'hits it')+.1,1.2,()=>({P:behind(4.4,1.4,2.2),T:mix3(add3(C_BALL,[6,.8,.6]),b,.5),fov:32})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tW=CUE(1,'waits on'),tS=CUE(1,'sprints'),tO=CUE(1,'One touch'),tH=CUE(1,'head down'),tK=CUE(1,'hits it');
  stadium(s,c,t);
  ground(s,c);
  // "waits on the shoulder": the offside line and a ring under him, level with the last defender
  const wo=sm(tW-.15,tW+.4,t)*(1-sm(tS+.4,tS+.9,t));offsideLine(s,c,wo);ring(s,c,[SHOULDER[0],0,SHOULDER[1]],.8,sm(tW-.1,tW+.35,t,easeOutBack)*(1-sm(tS,tS+.4,t)),Y,44);
  // "sprints in behind": his run drawn on as he makes it
  runArrow(s,c,T_LB,T_CH,sm(tS-.1,tO,t)*(1-sm(tH,tH+.4,t)));
  longPath(s,c,tau,sm(tS-.3,tS,t)*(1-sm(tO+.3,tO+.7,t)));
  shotPath(s,c,tau,1-sm(.65,.72,tau),{min:7});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "one touch": a ring on the chest as the ball drops off it
  const ot=sm(tO-.1,tO+.25,t,easeOutBack)*(1-sm(tO+.7,tO+1.1,t));
  if(hr&&ot>.02){const ch=hr.joints.chest,r=Math.max(12,hr.heightPx/(s.getTransform().a/s.dpr)*.1)*ot,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([ch[0]+Math.cos(a)*r*1.2,ch[1]+Math.sin(a)*r]);}
   s.fill(R,ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*ot);}
  // "head down": a yellow plumb from his head to the ball
  const hd=sm(tH-.12,tH+.25,t)*(1-sm(tK+.2,tK+.6,t));
  if(hr&&hd>.02){const Hh=hr.sk.head,a=pr(c,Hh),bb=pr(c,ballAt(Math.min(tau,0)));if(a&&bb){const e:Pt=[lerp(a[0],bb[0],hd),lerp(a[1],bb[1],hd)];s.fill(Y,ribbon([a,e],Math.max(3,c.F*.035/toCam(c,Hh)[2]),{seed:71,taper:0,wobble:.5,gaps:[[.25,.33],[.55,.63]]}),.95*hd);}}
  // "hits it with his laces": the spark at contact
  const sf=sm(tK-.1,tK+.2,t,easeOutBack)*(1-sm(tK+.6,tK+1,t));
  if(sf>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,C_BALL)*.45)*sf,{n:10,seed:61,width:Math.max(5,kAt(c,C_BALL)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),FLY)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'head down')+.2;

// ---------------------------------------------------------------- 3 · behind the goal: past a frozen Neuer into the top corner
const tau3=(t:number)=>{const tm=CUE(2,'does not');return key(t,mono([[0,-.5],[CUE(2,'Manuel Neuer'),-.12],[tm,.35],[tm+.8,IN_NET],[CUE(2,'Two goals'),IN_NET+1.1],[SECS(2)+1,IN_NET+1.1+(SECS(2)+1-CUE(2,'Two goals'))*.9]]),linear);};
const E3:V3=[7,2.1,-3];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET));
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([CX0,1,CZ0],b,.3),fov:30})],
  [CUE(2,'Manuel Neuer')-.2,.7,()=>({P:add3(E3,[-.8,-.3,.6]),T:mix3(at3(NEUER,0,1.2),b,.35),fov:24})],
  [CUE(2,'does not')+.5,1,()=>({P:add3(E3,[-.6,.1,.4]),T:[-.6,1.8,2.2],fov:26})],
  [CUE(2,'Two goals')-.1,1.4,()=>({P:[-8,2.4,16],T:add3(at3(HERO,IN_NET+2),[1,.4,0]),fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tm=CUE(2,'does not'),tf=CUE(2,'Italy are');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tf-.1,tf+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const fade=1-sm(FLY+.1,IN_NET+.7,tau);shotPath(s,c,tau,fade,{from:Math.max(0,tau-.5),min:8});}
  // "does not even move": a still ring under Neuer's boots (he stays set)
  const [nx,nz]=posOf(NEUER,0);ring(s,c,[nx,0,nz],.9,sm(tm-.1,tm+.3,t,easeOutBack)*(1-sm(tm+1.4,tm+1.9,t)),R,45);
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  goalRing(s,c,GOAL_PT,sm(tm+.5,tm+.9,t,easeOutBack)*(1-sm(tm+1.6,tm+2.1,t)),Y);
  // "Italy are in the final": a burst of paper and yellow over the Italy players (the passage material into the lesson)
  const fb=sm(tf-.05,tf+.35,t);if(fb>0){const q=pr(c,add3(at3(HERO,IN_NET+2),[1,3.6,.5]));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'does not')+.6;

// ---------------------------------------------------------------- 4 · the lesson: on the shoulder → break through → look up → strike it hard
const tau4=(t:number)=>key(t,mono([[0,-5.6],[CUE(3,'stay on'),-4.8],[CUE(3,'last defender'),T_LB],[CUE(3,'break through'),-3],[CUE(3,'look up'),-.5],[CUE(3,'strike it'),0],[SECS(3),IN_NET+.5]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),hp=at3(HERO,tau,.9);
 return plan(t,[
  [0,0,()=>({P:[LINE_X-3,4,19],T:[LINE_X,.8,3.5],fov:28})],
  [CUE(3,'break through')-.2,1.2,()=>({P:add3(hp,[-7,3.4,10]),T:add3(hp,[4,0,-1]),fov:30})],
  [CUE(3,'look up')-.3,.9,()=>({P:[CX0-10,3.3,CZ0+7],T:[-13,1,1.4],fov:34})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tS=CUE(3,'stay on'),tL=CUE(3,'last defender'),tB=CUE(3,'break through'),tU=CUE(3,'look up'),tK=CUE(3,'strike it'),E=SECS(3);
  stadium(s,c,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · stay on the shoulder: the offside line + a ring under him, level with Lahm
  offsideLine(s,c,sm(tS-.15,tS+.6,t)*(1-sm(tB+.4,tB+.8,t)));
  ring(s,c,[SHOULDER[0],0,SHOULDER[1]],.8,sm(tS,tS+.35,t,easeOutBack)*(1-sm(tB,tB+.4,t)),Y,44);
  // 2 · the last defender: a red ring under Lahm
  ring(s,c,at3(LAHM,Math.min(tau,T_LB)),.8,sm(tL-.1,tL+.3,t,easeOutBack)*(1-sm(tB,tB+.4,t)),R,46);
  // 3 · break through: the run behind the line
  runArrow(s,c,T_LB,-.6,sm(tB-.1,tU,t)*(1-sm(E-1.2,E-.8,t)));
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:14});
  // 4 · look up: the sight line to the top corner
  sightLine(s,c,hr,sm(tU-.1,tU+.4,t)*(1-sm(tK+.3,tK+.7,t)));
  // 5 · strike it hard: the path into the top corner and a ring on it
  const sk=sm(tK-.05,tK+.3,t);if(sk>.02)shotPath(s,c,tau,sk,{min:9,ink:Y});
  goalRing(s,c,GOAL_PT,sm(tK+.2,tK+.6,t,easeOutBack)*(1-sm(E-.9,E-.5,t)),Y,78);
  const sf=sm(tK-.1,tK+.2,t,easeOutBack)*(1-sm(tK+.6,tK+1,t));if(sf>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,R,p[0],p[1],Math.max(50,kAt(c,C_BALL)*.5)*sf,{n:10,seed:62,width:Math.max(5,kAt(c,C_BALL)*.05)});}
 },
 still:0,
};
ch4.still=CUE(3,'look up')+.25;

/** facts the test reads back */
export const FACTS={GOAL_PT,C_BALL,CH,LINE_X,SHOULDER,IN_NET,FLY,T_CH,T_LB,ballAt,posOf,heroAt:(tau:number)=>{const{p,yaw}=poseOf(HERO,tau),[x,z]=posOf(HERO,tau);return solve(p,BALO_B,{x,z,yaw});},
 neuerAt:(tau:number)=>posOf(NEUER,tau)};

const film:RisoStory={
 id:'balotelli-germany-2012',format:'11v11',title:"Balotelli's thunderbolt v Germany",
 theme:'Stay on the shoulder of the last defender, break through, look up and strike it hard',
 ageNote:'Germany 1–2 Italy, UEFA Euro 2012 semi-final, National Stadium, Warsaw, 28 June 2012. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a thunderbolt — a straight yellow streak from the point with a ball at its tip. Reduced motion: the still streak. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.35)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const e:Pt=[x+320*u,y-120*u];
  s.fill(Y,ribbon([[x,y],e],16,{seed,taper:.9,pressure:.3,wobble:.6}),.95*fade);
  if(age>0&&age<.3)sparkBurst(s,R,x,y,80,{n:7,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
