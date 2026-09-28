/** Vincent Kompany v Leicester — Manchester City 1–0 Leicester City, Premier League, Etihad Stadium, Manchester, Monday 6 May 2019
 * (20:00 kick-off, the goal at dusk under floodlights). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture
 * window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction of the captain's 70th-minute long-range winner from WRITTEN
 * accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad kdp-src/):
 *  - Sky Sports team sheet, 6 May 2019: both line-ups and numbers; "V Kompany (c) Goal scored 70'"; "A Laporte Assist 70'"; referee Mike
 *    Dean; attendance 54,506  https://www.skysports.com/football/manchester-city-vs-leicester-city/teams/391123
 *  - ESPN report: "Kompany stepped up for the winner on 70 minutes with an unstoppable swerving shot from 25 yards out that rippled the
 *    back of the net in upper right corner"  https://www.espn.com/soccer/report/_/gameId/513474
 *  - The Week, 7 May 2019: "Kompany picked up the ball 35 yards out. The veteran Belgian defender prodded it forward a few steps, looked up,
 *    steadied himself and then let fly. Schmeichel stood no chance as the ball rocketed into the top corner"; Kompany: "Everyone was saying
 *    don't shoot"; Guardiola: "No shoot Vinnie, no shoot!"  https://theweek.com/premier-league/101083/vincent-kompany-wonder-goal-man-city-leicester-premier-league-title-race
 *  - Mancitysquare / Premier League archive: "the Foxes were all too content to let the captain run with the ball"; his first goal from
 *    outside the box for City; City went on to win the title at Brighton the following Sunday.
 * CONFIRMED by those accounts: the date, ground, 1–0 and 70th minute; Laporte's assist; Kompany picked the ball up about 35 yards out,
 * Leicester let him come forward, he prodded it on a few steps, looked up, steadied himself and struck a swerving shot from about 25 yards
 * into the TOP RIGHT corner past Schmeichel; everyone (Guardiola included) was telling him not to shoot. Numbers: Kompany 4, Laporte 14,
 * Agüero 10, Sterling 7, Bernardo Silva 20, David Silva 21, Gündoğan 8, Walker 2, Zinchenko 35, Sané 19; Schmeichel 1, Pereira 14,
 * Evans 6, Maguire 15, Chilwell 3, Ndidi 25, Tielemans 21, Choudhury 38, Maddison 10, Albrighton 11, Vardy 9. City in sky blue shirts,
 * white shorts, sky blue socks (the 2018–19 home kit).
 * INFERRED (illustrative): every exact position and timing; the RIGHT foot (Kompany is right-footed; the reports name no foot); where he
 * picked it up (right of centre) and how Laporte's pass reached him; the swerve drawn as a slight outward bend that comes back in;
 * Schmeichel's late dive to his left; LEICESTER'S KIT FOR THIS MATCH WAS NOT CONFIRMED by a fetched source — drawn in their white 2018–19
 * third kit with blue trim (a recollection of the footage); Schmeichel's kit (drawn red); the stadium look (a boxy three-tier bowl under
 * a cable-hung roof with masts) and the crowd colours; the dusk sky; which teammates waved "don't shoot".
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (Laporte → Kompany, "don't shoot", the shot,
 * the net); ch2 = the slow replay from a LOW camera behind Kompany (nobody closes him down, a few steps, looks up, steadies, strikes it
 * clean); ch3 = a replay from behind the goal (Schmeichel's dive, the top corner) ending on the celebration; ch4 = the lesson (the defence
 * backs off → nobody closes → set your feet → strike it clean → surprise the keeper). Composed on the FULL sheet (never sheet.safe).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts. Handedness: right-handed world (x toward Leicester's goal, y up,
 * +z = the main-stand side = Kompany's right), athlete.ts's own convention. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,posed,blendPose,celebrate,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Manchester, 2019: City against Leicester, chasing the title. Captain Vincent Kompany gets the ball, thirty yards out. Everyone shouts: don’t shoot! He shoots... top corner!',tail:2.6,
  cues:['Manchester','City against Leicester','chasing the title','Vincent Kompany','thirty yards','Everyone shouts','don’t shoot','He shoots','top corner']},
 {label:'Watch it again',text:'Watch again. Nobody closes him down, so he takes a few steps, looks up, and steadies himself. Then he strikes it clean, through the middle of the ball.',tail:1.6,
  cues:['Watch again','Nobody closes','takes a few steps','looks up','steadies himself','strikes it clean']},
 {label:'Top corner',text:'Kasper Schmeichel dives, but it flies into the top corner! The captain’s goal helps City win the title.',tail:2.4,
  cues:['Kasper Schmeichel','dives','flies into','The captain','win the title']},
 {label:'Your turn',text:'Your turn: if the defence backs off and nobody closes you down, set your feet and strike it clean. You might surprise the keeper!',tail:2.2,
  cues:['Your turn','defence backs off','nobody closes','set your feet','strike it clean','surprise the keeper']},
];
import timingJson from '../../../public/plays/narration/kompany-leicester-2019/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('kompany: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kompany: no cue '+w);return c.at;};
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

// ---------------------------------------------------------------- the Etihad at dusk: a boxy three-tier bowl under a cable-hung roof with white masts
const CXS=-52.5,NS=56,PE=.3;
/** a point on the bowl: angle th round the pitch centre (0 = behind Leicester's goal, +90° = the main stand), d metres out from the front
 * row (a near-rectangle with rounded corners), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=44;
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.3+33*b];
type Bowl={seg:V3[][];tiers:V3[][];roof:V3[][];masts:[V3,V3][];seats:{P:V3;h:number}[];lamps:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],tiers:[],roof:[],masts:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  for(const u of [.34,.67]){const[dm,ym]=RAKE(u);o.tiers.push([rim(a,dm,ym),rim(b,dm,ym),rim(b,dm+1,ym+2),rim(a,dm+1,ym+2)]);}
  o.roof.push([rim(a,16,39),rim(b,16,39),rim(b,SD1+3,37),rim(a,SD1+3,37)]);
  if(i%2===0)o.lamps.push([rim(a,16.5,38.6),rim(b,16.5,38.6)]);
  if(i%7===3)o.masts.push([rim(a,SD1+6,0),rim(a,SD1+6,62)]);
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.2)continue;const[d,y]=RAKE((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a May dusk over Manchester: blue sky deepening to navy at the top, a warm band low on the horizon
 s.field(B,.62,.5);s.field(K,.34,.5);
 const bowl=new Path2D(),tiers=new Path2D(),roof=new Path2D(),mast=new Path2D(),cable=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.tiers){const r=quadP(c,q);if(r)addPoly(tiers,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 for(const[a,b] of BOWL.masts){if(toCam(c,a)[2]<20)continue;seg3(c,a,b,1.4,mast,1.4);const top=add3(b,[0,-2,0]),at=(u:number)=>rim(Math.atan2(a[2]*59,(a[0]-CXS)*40)+u,16,39);seg3(c,top,at(-.18),.25,cable,.8);seg3(c,top,at(.18),.25,cable,.8);}
 s.knockout(bowl);s.tone(B,bowl,.55);s.tone(K,bowl,.3);
 // the crowd: sky blue and white City fans, a few blue Leicester, phone lights; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.55?0:q.h<.93?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(K,inks[1],.55);s.fill(Y,inks[2],.95);
 s.fill(K,tiers,.85);
 s.knockout(roof);s.tone(K,roof,.55);
 s.knockout(mast,.9);s.fill(K,cable,.7);
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
/** City: sky blue shirts, white shorts, sky blue socks (the 2018–19 home kit); navy numbers */
const SKY:InkFill=[B,.5];
const city=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:SKY,shorts:'paper',socks:SKY,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Leicester: drawn in the white 2018–19 third kit with blue trim — NOT confirmed for this match (see INFERRED) */
const leicester=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[B,.95],numberInk:[B,.95],hairStyle:'short',...o});
const VK_B={height:1.93,bulk:1.1};
const VK_ST=city({number:4,skin:SKIN_D,build:VK_B,seed:4});
const SCHM_ST:AthleteStyle={shirt:[R,.85],shorts:[R,.85],socks:[R,.85],boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.89},seed:1};

// ---------------------------------------------------------------- the strike geometry (τ = seconds after Kompany's contact)
/** struck about 25 yards out, right of centre (inferred); the swerve finishes in the TOP RIGHT corner (confirmed) */
const C_BALL:V3=[-23.4,.11,1.6];
const GOAL_PT:V3=[0,2.12,3.2];
const BULGE_Z=3.1,BULGE_HIGH=true;
const YAW_S=yawTo(C_BALL[0],C_BALL[2],GOAL_PT[0],GOAL_PT[2]);
/** "strikes it clean, through the middle of the ball": laces, toe down, knee and chest over the ball, head still */
const CLEAN:Partial<Pose>={rAnk:50,lean:22,pitch:6,neckP:32,lShA:72,rShA:44};
const SD=1,S_ST=-STRIKE_CONTACT*SD;
function sStrike(tau:number):Pose{const u=(tau-S_ST)/SD;return over(strike(clamp(u),{foot:'r',power:1}),CLEAN,bump(-.4,.3,tau));}
const INSTEP=(()=>{const sk=solve(sStrike(0),VK_B,{x:0,z:0,yaw:YAW_S});return mix3(sk.rAn,sk.rToe,.55);})();
const P0:[number,number]=[C_BALL[0]-INSTEP[0],C_BALL[2]-INSTEP[2]];
/** Laporte's pass (τ −3.6) → Kompany picks it up ~35 yards out (−2.7) → prods it on (touches at −2.7, −1.8, −1.05) → steadies → strikes */
const T_LA=-3.6,T_RC=-2.7,T_T2=-1.8,T_T3=-1.05,FLY=.86,IN_NET=FLY+.1;
const LA:V3=[-41,.11,-3.2],RC:V3=[-32.2,.11,3.1],B2:V3=[-29.3,.11,2.6],B3:V3=[-26.2,.11,2.1];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'city'|'lei'|'gk';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Kompany',role:'hero',st:VK_ST,key:true,keys:[[-12,-40,7],[-6,-37,5],[-3.4,-34.2,3.8],[T_RC,RC[0]-.55,RC[2]+.2],[T_T2,B2[0]-.6,B2[2]+.2],[T_T3,B3[0]-.65,B3[2]+.2],[-.4,P0[0]-.6,P0[1]],[0,...P0],[.4,P0[0]+1.6,P0[1]+.5],[1.4,P0[0]+4,P0[1]+3],[3,P0[0]+7,P0[1]+9],[5,P0[0]+9,P0[1]+15],[12,P0[0]+9.5,P0[1]+16]]},
 {name:'Laporte',role:'city',st:city({number:14,build:{height:1.89},seed:14}),key:true,keys:[[-12,-44,-5],[T_LA,LA[0]-.5,LA[2]-.1],[0,-38,-2],[12,-34,0]]},
 {name:'Agüero',role:'city',st:city({number:10,build:{height:1.73},seed:10}),key:true,keys:[[-12,-15,-3],[-3,-14.2,-1.6],[0,-13.6,-1],[2,-12,2],[5,P0[0]+8,P0[1]+13.5],[12,P0[0]+8,P0[1]+13.5]]},
 {name:'Bernardo Silva',role:'city',st:city({number:20,build:{height:1.73},seed:20}),key:true,keys:[[-12,-19,15],[-3,-17.5,13],[0,-17,12],[4,P0[0]+9.8,P0[1]+14],[12,P0[0]+9.8,P0[1]+14]]},
 {name:'David Silva',role:'city',st:city({number:21,build:{height:1.7},seed:21}),keys:[[-12,-22,-9],[0,-20,-7.5],[5,P0[0]+10,P0[1]+16.5],[12,P0[0]+10,P0[1]+16.5]]},
 {name:'Sterling',role:'city',st:city({number:7,skin:SKIN_D,build:{height:1.7},seed:7}),keys:[[-12,-16,-19],[0,-14.5,-16],[12,-12,-10]]},
 {name:'Sané',role:'city',st:city({number:19,skin:SKIN_D,build:{height:1.83},seed:19}),keys:[[-12,-17,23],[0,-15,21],[12,-11,17]]},
 {name:'Ndidi',role:'lei',st:leicester({number:25,skin:SKIN_D,build:{height:1.85},seed:25}),key:true,keys:[[-12,-26,1],[T_RC,-24,1.8],[-1,-20.5,1.4],[0,-19.8,1.2],[12,-19,1]]},
 {name:'Tielemans',role:'lei',st:leicester({number:21,hair:[Y,.5],build:{height:1.76},seed:21}),keys:[[-12,-28,-6],[T_RC,-26,-5],[0,-22,-4],[12,-21,-3.5]]},
 {name:'Maddison',role:'lei',st:leicester({number:10,build:{height:1.75},seed:10}),keys:[[-12,-31,9],[T_RC,-29.5,8.6],[0,-25.5,7.2],[12,-24,6]]},
 {name:'Choudhury',role:'lei',st:leicester({number:38,skin:SKIN_M,build:{height:1.8},seed:38}),keys:[[-12,-30,-13],[0,-24,-10],[12,-22,-9]]},
 {name:'Albrighton',role:'lei',st:leicester({number:11,build:{height:1.75},seed:11}),keys:[[-12,-33,17],[0,-26,15],[12,-24,13]]},
 {name:'Maguire',role:'lei',st:leicester({number:15,build:{height:1.94,bulk:1.12},seed:15}),keys:[[-12,-16,-3],[0,-13.5,-2],[12,-12,-1.5]]},
 {name:'Evans',role:'lei',st:leicester({number:6,build:{height:1.88},seed:6}),keys:[[-12,-16,5],[0,-13.8,4.4],[12,-12.5,4]]},
 {name:'Pereira',role:'lei',st:leicester({number:14,build:{height:1.75},seed:14}),keys:[[-12,-18,14],[0,-15.5,12],[12,-14,11]]},
 {name:'Chilwell',role:'lei',st:leicester({number:3,build:{height:1.78},seed:3}),keys:[[-12,-17,-14],[0,-14.5,-12],[12,-13,-11]]},
 {name:'Schmeichel',role:'gk',st:SCHM_ST,key:true,keys:[[-12,-4,.2],[-2,-3,.5],[0,-1.8,.7],[12,-1.8,.7]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,LAPORTE=IX('Laporte'),AGUERO=IX('Agüero'),BERNARDO=IX('Bernardo Silva'),SCHM=IX('Schmeichel'),NDIDI=IX('Ndidi');
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

// ---------------------------------------------------------------- the ball: Laporte's pass, three prods forward, the swerving strike, the net
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
/** the swerve: bends a little out to the left, then back in and up into the top right corner */
const flight=(e:number):V3=>{const b=mix3(C_BALL,GOAL_PT,e);return[b[0],b[1]+.8*Math.sin(Math.PI*e),b[2]-.55*Math.sin(Math.PI*e)];};
const flightE=(u:number)=>u*(1.12-.12*u);
const NET_HIT:V3=[1.75,2,3.25],REST:V3=[1.2,.11,2.9];
function ballAt(tau:number):V3{
 if(tau<T_LA){const[x,z]=posOf(LAPORTE,tau);return[x+.5,.11,z+.1];}
 if(tau<T_RC)return roll(LA,RC,(tau-T_LA)/(T_RC-T_LA),.3);
 if(tau<T_T2)return roll(RC,B2,(tau-T_RC)/(T_T2-T_RC),.5);
 if(tau<T_T3)return roll(B2,B3,(tau-T_T2)/(T_T3-T_T2),.5);
 if(tau<0)return roll(B3,C_BALL,(tau-T_T3)/-T_T3,.5);
 if(tau<FLY)return flight(flightE(tau/FLY));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55);return[lerp(NET_HIT[0],REST[0],u),lerp(NET_HIT[1],REST[1],u*u),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>TAU*(tau<0?1.6*tau:6*Math.min(tau,IN_NET)+1.5*Math.max(0,tau-IN_NET));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** "don't shoot!": arms out, palms down, waving */
const WAVE=(tau:number):Partial<Pose>=>({lShA:95+25*Math.sin(tau*9),rShA:95+25*Math.sin(tau*9+1),lElb:30,rElb:30,lHand:1,rHand:1,neckP:-10});
/** "looks up … steadies himself": head up to the goal, then a still, balanced set over the ball */
const LOOK:Partial<Pose>={neckP:-16,neckY:0,lean:4};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
/** the three prods forward: short right-foot pushes */
const PRODS=[T_RC,T_T2,T_T3];
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='lei'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===LAPORTE){const D=.75,u=(tau-(T_LA-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.4}),w);yaw=lerpAng(yaw,yawTo(x,z,RC[0],RC[2]),w);}}
 if(k===HERO){
  for(const tp of PRODS){const D=.5,u=(tau-(tp-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u)*.85;p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.12}),w);}}
  if(tau>-.9&&tau<-.2)p=over(p,LOOK,bump(-.95,-.15,tau));
  const u=(tau-S_ST)/SD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,sStrike(tau),w);yaw=lerpAng(yaw,YAW_S,sm(-.3,.05,u));}
  if(tau>IN_NET+.2)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:'run'}),sm(IN_NET+.2,IN_NET+.7,tau)*(1-sm(4.6,5.2,tau)));
  if(tau>5)p=over(p,JOY,sm(5,5.5,tau));
 }
 // "don't shoot!": Agüero and Bernardo wave him down as he sets himself
 if((k===AGUERO||k===BERNARDO)&&tau>-1.9&&tau<.2)p=over(p,WAVE(tau),bump(-1.9,.2,tau)*1.2);
 if(k===SCHM){const at=.8,dur=.95,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.95}),sm(0,.1,u));yaw=Math.PI;}}
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='city')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='lei')p=over(p,DESPAIR,w*.85);}
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
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.6*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
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
/** "the defence backs off": short red arrows along the Leicester midfielders' own retreat */
function backOff(s:Sheet,c:Cam,w:number){if(w<=.02)return;for(const n of ['Ndidi','Tielemans','Maddison']){const k=IX(n),pts:V3[]=[];for(let i=0;i<=6;i++)pts.push(at3(k,lerp(T_RC,lerp(T_RC,0,w),i/6),.04));if(Math.hypot(pts[6][0]-pts[0][0],pts[6][2]-pts[0][2])>.5)arrow3(s,c,pts,Math.max(6,kAt(c,pts[6])*.12),R,.95);}}
/** "nobody closes him down": a yellow bubble of space round him that grows */
function space(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;const[x,z]=posOf(HERO,tau);ring(s,c,[x,0,z],4.2*w+.6,Math.min(1,w*1.4),Y,44);}
function spark(s:Sheet,c:Cam,P:V3,t:number,t0:number,ink=Y,seed=61){const a=t-t0;if(a<-.08||a>.5)return;const q=pr(c,P);if(!q)return;sparkBurst(s,ink,q[0],q[1],Math.max(44,kAt(c,P)*.5),{n:9,seed,g:easeOutBack(clamp((a+.08)/.14))*(1-clamp((a-.28)/.22)),width:Math.max(4,kAt(c,P)*.05)});}
/** "strike it clean": a red ring round the middle of the ball at contact */
function ballMark(s:Sheet,c:Cam,w:number){if(w<=.02)return;const q=pr(c,C_BALL);if(!q)return;const r=Math.max(16,kAt(c,C_BALL)*.3)*(.6+.4*w),pts:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 s.fill(R,ribbon(pts,Math.max(3,r*.16),{close:true,seed:85,taper:0,wobble:.6}),.95*w);s.fill(R,ribbon([[q[0]-r*.35,q[1]],[q[0]+r*.35,q[1]]],Math.max(3,r*.14),{seed:86,taper:.1,wobble:.3}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time anchored on the strike (just after "He shoots")
const tau1=(t:number)=>t-(CUE(0,'He shoots')+.35);
const P1:V3=[-32,24,74];
function cam1(t:number):Cam{
 const tau=tau1(t),hp=at3(HERO,tau,1),b=ballAt(Math.min(tau,IN_NET)),g=CUE(0,'top corner');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-32,2,-8],fov:26})],
  [CUE(0,'Vincent')-.3,1,()=>({P:P1,T:mix3(hp,b,.5),fov:10})],
  [CUE(0,'Everyone')-.2,.8,()=>({P:P1,T:add3(hp,[5,0,-1]),fov:11})],
  [CUE(0,'He shoots')+.1,.7,()=>({P:P1,T:mix3(hp,[-6,1.4,2],.45),fov:11})],
  [g,1.2,()=>({P:P1,T:[-1,1.5,2.4],fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'top corner'),ds=CUE(0,'don’t');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // "thirty yards out": a ring where he picks it up
  const ty=CUE(0,'thirty');ring(s,c,RC,1,sm(ty-.1,ty+.3,t,easeOutBack)*(1-sm(ty+1.2,ty+1.6,t)),Y,44);
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
  // "don't shoot!": red sparks over the waving teammates
  for(const k of [AGUERO,BERNARDO]){const q=pr(c,at3(k,tau,2.4));if(q){const a=t-ds;if(a>-.1&&a<.8)sparkBurst(s,R,q[0],q[1],Math.max(34,kAt(c,at3(k,tau,2.4))*.5),{n:6,seed:30+k,g:easeOutBack(clamp((a+.1)/.2))*(1-clamp((a-.5)/.3)),width:Math.max(3,kAt(c,C_BALL)*.04)});}}
  spark(s,c,C_BALL,tau,0,Y,19);
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'top corner')+.3;

// ---------------------------------------------------------------- 2 · slow replay, low behind Kompany
const tau2=(t:number)=>key(t,mono([[0,-3.3],[CUE(1,'Nobody'),-2.8],[CUE(1,'takes a few'),-2.2],[CUE(1,'looks up'),-.85],[CUE(1,'steadies'),-.45],[CUE(1,'strikes'),0],[SECS(1),.75]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),hp=at3(HERO,Math.min(tau,.25),.9),b=ballAt(Math.min(tau,FLY));
 const behind=(d:number,h:number,side:number):V3=>{const[x,z]=posOf(HERO,Math.min(tau,.2));return[x-d,h,z+side];};
 return plan(t,[
  [0,0,()=>({P:behind(7,1.8,3),T:mix3(hp,[-18,1,1],.5),fov:44})],
  [CUE(1,'takes a few')-.2,1,()=>({P:behind(6,1.6,2.6),T:mix3(hp,[-12,1,2],.4),fov:38})],
  [CUE(1,'looks up')-.2,.8,()=>({P:behind(4.6,1.4,2.2),T:mix3(add3(hp,[1,.4,0]),[0,1.6,2],.25),fov:34})],
  [CUE(1,'strikes')+.1,1.2,()=>({P:behind(5,1.5,2.2),T:mix3(add3(C_BALL,[8,1.2,.8]),b,.5),fov:36})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tN=CUE(1,'Nobody'),tF=CUE(1,'takes a few'),tL=CUE(1,'looks up'),tS=CUE(1,'steadies'),tK=CUE(1,'strikes');
  stadium(s,c,t);
  ground(s,c);
  space(s,c,tau,sm(tN-.1,tN+.9,t)*(1-sm(tL,tL+.4,t)));
  backOff(s,c,sm(tN,tN+1.2,t)*(1-sm(tF+.6,tF+1,t)));
  // "takes a few steps": a yellow tick on the grass at each prod
  for(const [i,tp0] of PRODS.entries()){const w=sm(tp0-.05,tp0+.2,tau)*(1-sm(tL,tL+.4,t));if(w>0){const P=ballAt(tp0);ring(s,c,P,.35,w,Y,50+i);}}
  shotPath(s,c,tau,1-sm(.8,.9,tau),{min:7});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "looks up": a dashed sight line from his head to the top corner
  const lu=sm(tL-.1,tL+.3,t)*(1-sm(tS+.2,tS+.5,t));
  if(hr&&lu>.02){const H=hr.sk.head,a=pr(c,H),b=pr(c,GOAL_PT);if(a&&b){const e:Pt=[lerp(a[0],b[0],lu),lerp(a[1],b[1],lu)];const u=Math.max(3,c.F*.035/toCam(c,H)[2]);s.knockout(ribbon([a,e],u*1.7,{seed:71,taper:0,wobble:.4}),.7*lu);s.fill(Y,ribbon([a,e],u*.85,{seed:71,taper:0,wobble:.4,gaps:[[.15,.22],[.36,.43],[.57,.64],[.78,.85]]}),.95*lu);}}
  // "steadies himself": a ring under his standing foot
  const sd=sm(tS-.1,tS+.3,t,easeOutBack)*(1-sm(tK+.3,tK+.7,t));if(hr&&sd>.02){const lf=hr.sk.lToe;ring(s,c,[lf[0],0,lf[2]],.45,sd,R,52);}
  ballMark(s,c,sm(tK-.15,tK+.1,t,easeOutBack)*(1-sm(tK+.5,tK+.9,t)));
  spark(s,c,C_BALL,t,tK,Y,61);
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),FLY)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'steadies')+.2;

// ---------------------------------------------------------------- 3 · behind the goal: Schmeichel's dive, the top corner, the captain
const tau3=(t:number)=>{const tc=CUE(2,'The captain');return key(t,mono([[0,-.45],[CUE(2,'Kasper'),-.1],[CUE(2,'dives'),.5],[CUE(2,'flies into'),IN_NET],[tc,IN_NET+1.4],[SECS(2)+1,IN_NET+1.4+(SECS(2)+1-tc)*.9]]),linear);};
const E3:V3=[7,2.2,-3.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),hp=at3(HERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([C_BALL[0],1,C_BALL[2]],b,.3),fov:30})],
  [CUE(2,'dives')-.2,.7,()=>({P:add3(E3,[-.8,-.2,.6]),T:[-1.6,1.4,2],fov:26})],
  [CUE(2,'The captain')-.2,1.3,()=>({P:[-6,2.4,24],T:add3(hp,[.5,.3,0]),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tF=CUE(2,'flies'),tW=CUE(2,'win the');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tW-.1,tW+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const fade=1-sm(FLY+.1,IN_NET+.7,tau);shotPath(s,c,tau,fade,{from:Math.max(0,tau-.5),min:8});}
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  goalRing(s,c,GOAL_PT,sm(tF-.1,tF+.3,t,easeOutBack)*(1-sm(tF+1,tF+1.5,t)),Y);
  const fb=sm(tW-.05,tW+.35,t);if(fb>0){const q=pr(c,add3(at3(HERO,tau),[0,3.4,0]));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'flies')+.2;

// ---------------------------------------------------------------- 4 · the lesson: the defence backs off → nobody closes you → set your feet → strike it clean → surprise the keeper
const tau4=(t:number)=>key(t,mono([[0,-3.4],[CUE(3,'defence'),-2.8],[CUE(3,'nobody'),-1.8],[CUE(3,'set your'),-.45],[CUE(3,'strike it'),0],[CUE(3,'surprise'),IN_NET],[SECS(3),IN_NET+.6]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),hp=at3(HERO,Math.min(tau,0),.9);
 return plan(t,[
  [0,0,()=>({P:add3(hp,[-6,5,11]),T:add3(hp,[7,0,-2]),fov:40})],
  [CUE(3,'set your')-.3,.9,()=>({P:add3(hp,[-3,2.2,6]),T:add3(hp,[2.5,.2,-1]),fov:34})],
  [CUE(3,'strike it')+.1,1.2,()=>({P:[C_BALL[0]-9,4.6,C_BALL[2]+2.5],T:[-10,1,2],fov:36})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tD=CUE(3,'defence'),tN=CUE(3,'nobody'),tS=CUE(3,'set your'),tK=CUE(3,'strike it'),tP=CUE(3,'surprise'),E=SECS(3);
  stadium(s,c,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  backOff(s,c,sm(tD-.1,tD+1,t)*(1-sm(tS,tS+.4,t)));
  space(s,c,tau,sm(tN-.1,tN+.8,t)*(1-sm(tK,tK+.3,t)));
  const sk=sm(tK-.05,tK+.3,t);if(sk>.02)shotPath(s,c,tau,sk*(1-sm(E-.8,E-.4,t)),{min:9,ink:Y});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:14});
  const sd=sm(tS-.1,tS+.3,t,easeOutBack)*(1-sm(tK+.3,tK+.7,t));if(hr&&sd>.02){const lf=hr.sk.lToe;ring(s,c,[lf[0],0,lf[2]],.45,sd,R,52);}
  ballMark(s,c,sm(tK-.15,tK+.1,t,easeOutBack)*(1-sm(tK+.5,tK+.9,t)));
  goalRing(s,c,GOAL_PT,sm(tP-.1,tP+.3,t,easeOutBack)*(1-sm(E-.7,E-.3,t)),Y,78);
  spark(s,c,C_BALL,t,tK,R,62);
 },
 still:0,
};
ch4.still=CUE(3,'set your')+.25;

/** facts the test reads back */
export const FACTS={GOAL_PT,C_BALL,RC,T_RC,T_LA,FLY,IN_NET,ballAt,posOf,
 heroAt:(tau:number)=>{const{p,yaw}=poseOf(HERO,tau),[x,z]=posOf(HERO,tau);return solve(p,VK_B,{x,z,yaw});},
 keeperAt:(tau:number)=>{const{p,yaw}=poseOf(SCHM,tau),[x,z]=posOf(SCHM,tau);return solve(p,{height:1.89},{x,z,yaw});},
 nearestLeicester:(tau:number)=>{const[hx,hz]=posOf(HERO,tau);let m=1e9;ACTORS.forEach((a,k)=>{if(a.role!=='lei')return;const[x,z]=posOf(k,tau);m=Math.min(m,Math.hypot(x-hx,z-hz));});return m;}};

const film:RisoStory={
 id:'kompany-leicester-2019',format:'11v11',title:"Kompany's long-range title winner",
 theme:'If the defence backs off and nobody closes you down, set your feet and strike it clean',
 ageNote:'Manchester City 1–0 Leicester City, Premier League, Etihad Stadium, Manchester, 6 May 2019. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a swerving strike — a yellow streak that bends out and back in, a ball at its tip. Reduced motion: the still streak. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.4)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+300*k,y-110*k-40*Math.sin(Math.PI*k)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:.6}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,R,x,y,80,{n:7,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*18+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
