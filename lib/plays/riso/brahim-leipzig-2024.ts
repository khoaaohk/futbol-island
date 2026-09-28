/** Brahim Díaz v RB Leipzig — RB Leipzig 0–1 Real Madrid, UEFA Champions League round of 16, first leg, Red Bull Arena, Leipzig,
 * 13 February 2024 (21:00 local, a floodlit winter night). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture
 * window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction of the 48th-minute solo goal from WRITTEN accounts (the footage
 * itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad kdp-src/):
 *  - Sky Sports report: "Picking up the ball wide on the right, Diaz span away from Raum and cut inside Simons and then Schlager before
 *    curling a left-foot shot across Gulacsi and inside the far post"  https://www.skysports.com/football/news/11945/13071012/rb-leipzig-0-1-real-madrid-brahim-diaz-fills-jude-bellinghams-boots-as-visitors-earn-champions-league-win
 *  - CNN, 14 Feb 2024: "picked the ball up on the right touchline, before beating his defender with a deft body-feint. He then dribbled past
 *    two more Leipzig players ... unleashing a curling effort with his left foot which hit the top corner of the net"; "curled his effort into
 *    the far corner"  https://www.cnn.com/2024/02/14/sport/brahim-diaz-real-madrid-champions-league-spt-intl
 *  - AP (ABC News): "Diaz picked up the ball near the sideline, shook off three players, cut in towards the box and curled a superb shot past
 *    keeper Péter Gulácsi"; realmadrid.com: "evading the attentions of three defenders at pace and bending the ball beautifully around Gulácsi
 *    with his left boot"; UEFA goal of the week
 *  - ESPN line-ups (gameId 691514): Leipzig Gulácsi 1, Klostermann 16, Orbán 4, Simakan 2, Raum 22, Henrichs 39, Schlager 24, Olmo 7,
 *    Simons 20, Openda 17, Sesko 30; Real Madrid Lunin 13, Carvajal 2, Nacho 6, Tchouaméni 18, Mendy 23, Valverde 15, Kroos 8, Camavinga 12,
 *    Brahim Díaz 21, Vinícius Júnior 7, Rodrygo 11; Brahim Díaz 48'
 * CONFIRMED by those accounts: the date, ground, 0–1 and 48th minute; he picked the ball up wide on the RIGHT touchline; beat Raum first
 * (a spin / body-feint), then cut inside past Simons and then Schlager (three defenders), at pace, staying on his feet; a curling LEFT-foot
 * shot from just outside the box, across Gulácsi into the FAR corner (inside the far post, the top corner). Numbers as above.
 * INFERRED (illustrative): every exact position and timing; how many touches; the curl drawn as a ball that starts outside the far post and
 * bends back in (a left-foot inside curl bends left-to-right from his view); KITS: Leipzig in white (their home kit) and REAL MADRID drawn in
 * their navy 2023–24 away kit — neither confirmed for this match by a fetched source; Gulácsi's kit (drawn yellow); the stadium look (a
 * steep enclosed bowl under a roof) and the crowd colours.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (the pick-up on the right → the spin past Raum →
 * cut past Simons → past Schlager → the curl → the net); ch2 = the slow replay from a LOW camera behind him (small quick touches, the ball close,
 * changes of direction); ch3 = a replay from behind the goal (the shot bends round Gulácsi into the far corner) ending on the celebration;
 * ch4 = the lesson (keep the ball close with small touches, change direction past each defender). Composed on the FULL sheet (never sheet.safe).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts. Handedness: right-handed world (x toward Leipzig's goal, y up,
 * +z = the main-stand side = Brahim's right), athlete.ts's own convention. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,lunge,posed,blendPose,celebrate,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Leipzig, 2024. Champions League: RB Leipzig against Real Madrid. Brahim Díaz gets the ball out wide. He spins away from one defender, cuts past another, and another... then curls it in!',tail:2.6,
  cues:['Leipzig','RB Leipzig against Real Madrid','Brahim Díaz','out wide','spins away','cuts past','and another','curls it in']},
 {label:'Watch it again',text:'Watch again, slowly. Small, quick touches keep the ball close to his feet, so he can change direction the moment a defender comes.',tail:1.6,
  cues:['Watch again','Small, quick touches','close to his feet','change direction','defender comes']},
 {label:'Far corner',text:'His left-footed shot bends around Gulácsi, into the far corner. Real Madrid win one-nil.',tail:2.4,
  cues:['His left-footed shot','bends around','Gulácsi','far corner','Real Madrid win']},
 {label:'Your turn',text:'Your turn: keep the ball close with small touches. Then you can change direction past each defender.',tail:2.4,
  cues:['Your turn','keep the ball close','small touches','change direction','each defender']},
];
import timingJson from '../../../public/plays/narration/brahim-leipzig-2024/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('brahim: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('brahim: no cue '+w);return c.at;};
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

// ---------------------------------------------------------------- the Red Bull Arena on a February night: one steep enclosed bowl under a translucent roof
const CXS=-52.5,NS=56,PE=.38;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(58+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(39+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=36;
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.2+27*b];
type Bowl={seg:V3[][];roof:V3[][];seats:{P:V3;h:number}[];lamps:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,4,31),rim(b,4,31),rim(b,SD1+2,30),rim(a,SD1+2,30)]);
  o.lamps.push([rim(a,4.4,30.6),rim(b,4.4,30.6)]);
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.2)continue;const[d,y]=RAKE((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(K,.78,.5);s.field(B,.16,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(bowl);s.tone(K,bowl,.4);s.tone(R,bowl,.2);
 // the crowd: Leipzig red and white, a white-and-navy Madrid corner, phone lights
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.45?0:q.h<.75?1:q.h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.fill(R,inks[0],.85);s.knockout(inks[1],.75);s.fill(K,inks[2],.7);s.fill(Y,inks[3],.95);
 s.knockout(roof,.6);s.tone(K,roof,.25);
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
/** Real Madrid: drawn in the navy 2023–24 away kit (NOT confirmed for this match), white numbers */
const madrid=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
/** RB Leipzig: drawn in white with red trim (their home colours; NOT confirmed for this match) */
const leipzig=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.95],numberInk:[R,.95],hairStyle:'short',...o});
const BD_B={height:1.7,bulk:.92};
const BD_ST=madrid({number:21,skin:SKIN_M,build:BD_B,seed:21});
const GUL_ST:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.91},seed:1};

// ---------------------------------------------------------------- the geometry (τ = seconds after the shot)
/** picks it up on the right touchline (−5.5) → spins away from Raum (−4.4) → cuts inside Simons (−2.6) → then Schlager (−1.4) → the shot (0) */
const T_FEED=-7,T_PICK=-5.5,T_SPIN=-4.4,T_SIM=-2.6,T_SCH=-1.4,FLY=.95,IN_NET=FLY+.08;
const FEED:V3=[-50,.11,24.5];
/** the curled shot: from just outside the box on the right, into the FAR (left) corner, high inside the post */
const C_BALL:V3=[-20.4,.11,8.4];
const GOAL_PT:V3=[0,1.9,-3.1];
const BULGE_Z=-3,BULGE_HIGH=true;
const YAW_S=yawTo(C_BALL[0],C_BALL[2],GOAL_PT[0],GOAL_PT[2]);
/** a left-foot inside curl: hip opened, the inside of the left foot wraps round the ball, body leaning away, right arm out */
const CURL:Partial<Pose>={lHipR:32,lAnk:4,lean:14,roll:8,neckP:28,rShA:84,lShA:36};
const SD=.9,S_ST=-STRIKE_CONTACT*SD;
function sStrike(tau:number):Pose{const u=(tau-S_ST)/SD;return over(strike(clamp(u),{foot:'l',power:.75}),CURL,bump(-.35,.3,tau));}
const LTOE=(()=>{const sk=solve(sStrike(0),BD_B,{x:0,z:0,yaw:YAW_S});return mix3(sk.lAn,sk.lToe,.55);})();
const P0:[number,number]=[C_BALL[0]-LTOE[0],C_BALL[2]-LTOE[2]];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'rm'|'rbl'|'gk';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Brahim Díaz',role:'hero',st:BD_ST,key:true,keys:[[-12,-44,30],[-7,-42,29.5],[T_PICK,-40.2,28],[-4.8,-39.2,27],[T_SPIN,-38.8,26.4],[-3.7,-35.8,24],[-3,-33.4,22.4],[T_SIM,-32,21.3],[-2.05,-29.2,18.4],[-1.7,-27.6,16.6],[T_SCH,-26.2,15.3],[-.85,-23.8,12.2],[-.35,P0[0]-1.1,P0[1]+1],[0,...P0],[.5,P0[0]+1.4,P0[1]-.2],[1.6,P0[0]+3.5,P0[1]+2.6],[3.2,P0[0]+5,P0[1]+8],[5,P0[0]+5.5,P0[1]+12],[12,P0[0]+5.5,P0[1]+12]]},
 {name:'Raum',role:'rbl',st:leipzig({number:22,build:{height:1.8},seed:22}),key:true,keys:[[-12,-33,25],[T_PICK,-36.4,26.2],[T_SPIN,-37.6,26.8],[-3.8,-37.8,26.2],[-2.5,-36,24.6],[0,-31,20],[12,-26,17]]},
 {name:'Simons',role:'rbl',st:leipzig({number:20,skin:SKIN_M,build:{height:1.68},seed:20}),key:true,keys:[[-12,-27,18],[T_SPIN,-29.6,19.8],[T_SIM,-31,20.6],[-2,-31.2,20.2],[0,-28,17],[12,-24,14]]},
 {name:'Schlager',role:'rbl',st:leipzig({number:24,build:{height:1.74},seed:24}),key:true,keys:[[-12,-22,11],[T_SIM,-24.2,13.4],[T_SCH,-25.2,14.3],[-1,-25.2,13.8],[0,-23.6,11.6],[12,-21,9]]},
 {name:'Henrichs',role:'rbl',st:leipzig({number:39,build:{height:1.83},seed:39}),keys:[[-12,-14,-14],[0,-14,-10],[12,-12,-8]]},
 {name:'Orbán',role:'rbl',st:leipzig({number:4,build:{height:1.89},seed:4}),keys:[[-12,-15,-3],[0,-13.5,-1.5],[12,-12,-1]]},
 {name:'Simakan',role:'rbl',st:leipzig({number:2,skin:SKIN_D,build:{height:1.87},seed:2}),keys:[[-12,-15,5],[0,-13.2,4.2],[12,-12,4]]},
 {name:'Klostermann',role:'rbl',st:leipzig({number:16,build:{height:1.89},seed:16}),keys:[[-12,-18,14],[0,-15,11],[12,-13,10]]},
 {name:'Vinícius Júnior',role:'rm',st:madrid({number:7,skin:SKIN_D,build:{height:1.76},seed:7}),key:true,keys:[[-12,-24,-16],[0,-12,-9],[3,-10,-2],[5,P0[0]+4.2,P0[1]+11.3],[12,P0[0]+4.2,P0[1]+11.3]]},
 {name:'Rodrygo',role:'rm',st:madrid({number:11,skin:SKIN_M,build:{height:1.74},seed:11}),keys:[[-12,-26,-2],[0,-14,-.5],[5,P0[0]+6.3,P0[1]+12.4],[12,P0[0]+6.3,P0[1]+12.4]]},
 {name:'Valverde',role:'rm',st:madrid({number:15,build:{height:1.82},seed:15}),keys:[[-12,-44,12],[0,-30,10],[5,P0[0]+5,P0[1]+13.5],[12,P0[0]+5,P0[1]+13.5]]},
 {name:'Gulácsi',role:'gk',st:GUL_ST,key:true,keys:[[-12,-3,1.5],[-2,-2,1.6],[-.4,-1.6,1.1],[0,-1.5,1],[12,-1.5,1]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,RAUM=IX('Raum'),SIMONS=IX('Simons'),SCHL=IX('Schlager'),GK=IX('Gulácsi');
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

// ---------------------------------------------------------------- the ball: the feed, the dribble (close to his left foot), the curl, the net
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
/** in the dribble the ball stays about half a metre ahead of him, nudged with each small touch */
function carry(tau:number):V3{const[x,z]=posOf(HERO,tau),[vx,vz]=velOf(HERO,tau),l=Math.hypot(vx,vz)||1,ph=(distOf(HERO,tau)/1.1)%1,lead=.45+.25*Math.sin(ph*TAU);return[x+vx/l*lead,.11,z+vz/l*lead];}
const PICK:V3=(()=>carry(T_PICK))();
const CARRY_END=-.35,CE:V3=(()=>carry(CARRY_END))();
const DIR=(()=>{const dx=GOAL_PT[0]-C_BALL[0],dz=GOAL_PT[2]-C_BALL[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
/** the curl: the ball starts left of the target line (outside the far post) and bends back in (left-to-right from his view) */
const flight=(e:number):V3=>{const b=mix3(C_BALL,GOAL_PT,e),k=1.25*Math.sin(Math.PI*e);return[b[0]+DIR[1]*k,b[1]+.9*Math.sin(Math.PI*e),b[2]-DIR[0]*k];};
const NET_HIT:V3=[1.7,1.6,-3.2],REST:V3=[1.2,.11,-2.9];
function ballAt(tau:number):V3{
 if(tau<T_FEED)return FEED;
 if(tau<T_PICK)return roll(FEED,PICK,(tau-T_FEED)/(T_PICK-T_FEED),.4);
 if(tau<CARRY_END)return carry(tau);
 if(tau<0)return mix3(CE,C_BALL,(tau-CARRY_END)/-CARRY_END);
 if(tau<FLY)return flight(tau/FLY);
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55);return[lerp(NET_HIT[0],REST[0],u),lerp(NET_HIT[1],REST[1],u*u),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>TAU*(tau<0?2*tau:-6*Math.min(tau,IN_NET)-1.5*Math.max(0,tau-IN_NET));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
/** the three beaten defenders: each lunges at the ball a moment too late */
const LUNGES:[number,number,'l'|'r'][]=[[RAUM,T_SPIN,'r'],[SIMONS,T_SIM,'r'],[SCHL,T_SCH,'r']];
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='rbl'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 for(const[d,t0,side] of LUNGES)if(k===d){const D=.8,u=(tau-(t0-.6*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,lunge(Math.min(1,u),{side}),w);yaw=lerpAng(yaw,yawTo(x,z,b[0],b[2]),w);}}
 if(k===HERO){
  // small quick touches with the left foot while he carries it
  if(tau>T_PICK-.2&&tau<CARRY_END)p=blendPose(p,dribble(distOf(k,tau)/1.1,{foot:'l',speed:.7}),.75*Math.min(sm(T_PICK-.2,T_PICK+.2,tau),1-sm(CARRY_END-.3,CARRY_END,tau)));
  // the spin away from Raum: a full turn on the ball
  yaw+=TAU*sm(T_SPIN-.28,T_SPIN+.28,tau,easeInOutSine);
  const u=(tau-S_ST)/SD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,sStrike(tau),w);yaw=lerpAng(yaw,YAW_S,sm(-.3,.05,u));}
  if(tau>IN_NET+.2)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:'run'}),sm(IN_NET+.2,IN_NET+.7,tau)*(1-sm(4.6,5.2,tau)));
  if(tau>5)p=over(p,JOY,sm(5,5.5,tau));
 }
 if(k===GK){const at=.8,dur=.9,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'r',height:.9}),sm(0,.1,u));yaw=Math.PI;}}
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='rm')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='rbl')p=over(p,DESPAIR,w*.85);}
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
function shotPath(s:Sheet,c:Cam,tau:number,w:number,o:{from?:number;min?:number}={}){if(w<=.02||tau<=0)return;const{from=0,min=8}=o,pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,ballAt(lerp(from,Math.min(tau,FLY),i/24)));if(p)pts.push(p);}if(pts.length<3)return;
 const wd=Math.max(min,kAt(c,ballAt(Math.min(tau,FLY)))*.13);s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
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
function spark(s:Sheet,c:Cam,P:V3,t:number,t0:number,ink=Y,seed=61){const a=t-t0;if(a<-.08||a>.5)return;const q=pr(c,P);if(!q)return;sparkBurst(s,ink,q[0],q[1],Math.max(44,kAt(c,P)*.5),{n:9,seed,g:easeOutBack(clamp((a+.08)/.14))*(1-clamp((a-.28)/.22)),width:Math.max(4,kAt(c,P)*.05)});}
/** "small, quick touches": a yellow tick where the ball was at each touch so far (one per ~1.1 m he runs) */
const TOUCHES:number[]=(()=>{const o:number[]=[];let last=-1;for(let a=T_PICK;a<CARRY_END;a+=.02){const n=Math.floor(distOf(HERO,a)/1.1);if(n!==last){o.push(a);last=n;}}return o;})();
function ticks(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;for(const [i,a] of TOUCHES.entries()){if(a>tau)break;ring(s,c,ballAt(a),.22,w,Y,90+i);}}
/** "change direction": an arrow along his new line out of each cut (the spin, past Simons, past Schlager) */
const CUTS=[T_SPIN,T_SIM,T_SCH];
function cutArrows(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;for(const t0 of CUTS){if(tau<t0-.1)continue;const pts:V3[]=[];for(let i=0;i<=6;i++)pts.push(at3(HERO,t0+.15+.55*i/6,.04));arrow3(s,c,pts,Math.max(6,kAt(c,pts[6])*.12),Y,.95*w);}}
/** a red ring under each beaten defender at the moment he is passed */
function beaten(s:Sheet,c:Cam,t:number,cue:number,k:number,t0:number,seed:number){ring(s,c,at3(k,t0),.8,sm(cue-.1,cue+.3,t,easeOutBack)*(1-sm(cue+1.1,cue+1.5,t)),R,seed);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time anchored on the shot
const tau1=(t:number)=>t-(CUE(0,'curls it')+.2);
const P1:V3=[-34,23,72];
function cam1(t:number):Cam{
 const tau=tau1(t),hp=at3(HERO,tau,1),g=CUE(0,'curls it');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-38,2,14],fov:26})],
  [CUE(0,'Brahim')-.3,1,()=>({P:P1,T:add3(hp,[2,0,-1]),fov:11})],
  [CUE(0,'spins')-.3,.8,()=>({P:P1,T:add3(hp,[3,0,-2]),fov:10})],
  [CUE(0,'cuts past')-.3,.8,()=>({P:P1,T:add3(hp,[4,0,-3]),fov:11})],
  [g-.2,.8,()=>({P:P1,T:mix3(hp,[-4,1.4,-1],.45),fov:12})],
  [g+.7,1,()=>({P:P1,T:[-1.5,1.4,-2],fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'curls it'),ow=CUE(0,'out wide');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.25,tau)*(1-sm(IN_NET+2.5,IN_NET+3.5,tau))});
  ground(s,c,{bulge:bulgeAt(tau)});
  ring(s,c,PICK,1,sm(ow-.1,ow+.3,t,easeOutBack)*(1-sm(ow+1.2,ow+1.6,t)),Y,44);
  beaten(s,c,t,CUE(0,'spins'),RAUM,T_SPIN,45);beaten(s,c,t,CUE(0,'cuts past'),SIMONS,T_SIM,46);beaten(s,c,t,CUE(0,'and another'),SCHL,T_SCH,47);
  shotPath(s,c,tau,1-sm(IN_NET+.5,IN_NET+1,tau),{min:7});
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
  spark(s,c,C_BALL,tau,0,R,19);
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'curls it')+.4;

// ---------------------------------------------------------------- 2 · slow replay, low behind him: small touches, the ball close, the changes of direction
const tau2=(t:number)=>key(t,mono([[0,-5.2],[CUE(1,'Small'),-4.8],[CUE(1,'close'),-3.9],[CUE(1,'change'),-2.7],[CUE(1,'defender'),-1.5],[SECS(1),-.2]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),hp=at3(HERO,tau,.8),[vx,vz]=velOf(HERO,tau-.3),l=Math.hypot(vx,vz)||1,bx=-vx/l,bz=-vz/l;
 const pos:V3=[hp[0]+bx*7.5+bz*2.6,3.2,hp[2]+bz*7.5-bx*2.6];
 return plan(t,[
  [0,0,()=>({P:pos,T:add3(hp,[-bx*4,.1,-bz*4]),fov:40})],
  [CUE(1,'close')-.2,.8,()=>({P:[hp[0]+bx*5+bz*2.8,3.6,hp[2]+bz*5-bx*2.8],T:add3(hp,[-bx*1.2,-.4,-bz*1.2]),fov:34})],
  [CUE(1,'change')-.2,.9,()=>({P:pos,T:add3(hp,[-bx*5,0,-bz*5]),fov:44})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tS=CUE(1,'Small'),tC=CUE(1,'close'),tD=CUE(1,'change'),tF=CUE(1,'defender');
  stadium(s,c,t);ground(s,c);
  ticks(s,c,tau,sm(tS-.1,tS+.3,t));
  cutArrows(s,c,tau,sm(tD-.1,tD+.3,t));
  // "the moment a defender comes": red arrows from Simons and Schlager toward the ball, arriving where it has just been
  const fw=sm(tF-.15,tF+.35,t);if(fw>.02)for(const [k,t0] of [[SIMONS,T_SIM],[SCHL,T_SCH]] as [number,number][]){const a=at3(k,t0-.6,.04),b=ballAt(t0-.05),pts:V3[]=[];for(let i=0;i<=5;i++)pts.push(mix3(a,[b[0],.04,b[2]],i/5*fw));arrow3(s,c,pts,Math.max(5,kAt(c,a)*.1),R,.95);}
  const hr=play(s,c,tau,tp,tpp,{minBall:12,smear:true});
  // "close to his feet": a yellow ring binding boot and ball
  const cf=sm(tC-.1,tC+.3,t,easeOutBack)*(1-sm(tD,tD+.4,t));if(hr&&cf>.02){const b=ballAt(tau),toe=hr.sk.lToe,m:V3=[(b[0]+toe[0])/2,0,(b[2]+toe[2])/2];ring(s,c,m,.55,cf,Y,58);}
 },
 aperture(t){const c=cam2(t),q=pr(c,ballAt(tau2(t)))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:0,
};
ch2.still=CUE(1,'close')+.3;

// ---------------------------------------------------------------- 3 · behind the goal: the curl round Gulácsi into the far corner
const tau3=(t:number)=>{const tw=CUE(2,'Real Madrid');return key(t,mono([[0,-.5],[CUE(2,'His left'),-.1],[CUE(2,'bends'),.45],[CUE(2,'Gulácsi'),.8],[CUE(2,'far corner'),IN_NET+.2],[tw,IN_NET+1.3],[SECS(2)+1,IN_NET+1.3+(SECS(2)+1-tw)*.9]]),linear);};
const E3:V3=[7,2.2,3.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),hp=at3(HERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([C_BALL[0],1,C_BALL[2]],b,.3),fov:32})],
  [CUE(2,'Gulácsi')-.2,.6,()=>({P:add3(E3,[-.6,-.2,-.8]),T:[-1.5,1.4,-1.8],fov:28})],
  [CUE(2,'Real Madrid')-.3,1.3,()=>({P:[-6,2.6,26],T:add3(hp,[.5,.3,0]),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tH=CUE(2,'His left'),tG=CUE(2,'Gulácsi'),tF=CUE(2,'far corner'),tW=CUE(2,'Real Madrid');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tW-.1,tW+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  shotPath(s,c,tau,1-sm(IN_NET+.6,IN_NET+1.1,tau),{min:8});
  ring(s,c,at3(GK,.5),.9,sm(tG-.1,tG+.3,t,easeOutBack)*(1-sm(tF+.4,tF+.8,t)),R,45);
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  const lf=sm(tH-.1,tH+.25,t,easeOutBack)*(1-sm(tH+.7,tH+1.1,t));if(hr&&lf>.02){const toe=hr.sk.lToe;ring(s,c,[toe[0],0,toe[2]],.4,lf,Y,59);}
  goalRing(s,c,GOAL_PT,sm(tF-.1,tF+.3,t,easeOutBack)*(1-sm(tF+1,tF+1.5,t)),Y);
  const fb=sm(tW-.05,tW+.35,t);if(fb>0){const q=pr(c,add3(at3(HERO,tau),[0,3.4,0]));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'bends')+.3;

// ---------------------------------------------------------------- 4 · the lesson: keep it close with small touches → change direction past each defender
const tau4=(t:number)=>key(t,mono([[0,-5.6],[CUE(3,'keep'),-5.2],[CUE(3,'small'),-4.6],[CUE(3,'change'),-2.9],[CUE(3,'each'),-1.3],[SECS(3),-.1]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),hp=at3(HERO,tau,.8);
 return plan(t,[
  [0,0,()=>({P:add3(hp,[-3,5,7.5]),T:add3(hp,[2,0,-1.5]),fov:38})],
  [CUE(3,'change')-.3,1,()=>({P:add3(hp,[-2,6,8.5]),T:add3(hp,[3,0,-3]),fov:44})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tK=CUE(3,'keep'),tS=CUE(3,'small'),tC=CUE(3,'change'),tE=CUE(3,'each');
  stadium(s,c,t);ground(s,c);
  ticks(s,c,tau,sm(tS-.1,tS+.3,t));
  cutArrows(s,c,tau,sm(tC-.1,tC+.3,t));
  ring(s,c,at3(RAUM,T_SPIN),.8,sm(tE-.1,tE+.3,t,easeOutBack),R,45);ring(s,c,at3(SIMONS,T_SIM),.8,sm(tE,tE+.4,t,easeOutBack),R,46);ring(s,c,at3(SCHL,T_SCH),.8,sm(tE+.1,tE+.5,t,easeOutBack),R,47);
  const hr=play(s,c,tau,tp,tpp,{minBall:14,smear:true});
  const cf=sm(tK-.1,tK+.3,t,easeOutBack)*(1-sm(tC,tC+.4,t));if(hr&&cf>.02){const b=ballAt(tau),toe=hr.sk.lToe,m:V3=[(b[0]+toe[0])/2,0,(b[2]+toe[2])/2];ring(s,c,m,.55,cf,Y,58);}
 },
 still:0,
};
ch4.still=CUE(3,'change')+.3;

/** facts the test reads back */
export const FACTS={GOAL_PT,C_BALL,PICK,T_PICK,T_SPIN,T_SIM,T_SCH,FLY,IN_NET,ballAt,posOf,
 heroAt:(tau:number)=>{const{p,yaw}=poseOf(HERO,tau),[x,z]=posOf(HERO,tau);return solve(p,BD_B,{x,z,yaw});},
 defAt:(n:string,tau:number)=>posOf(IX(n),tau)};

const film:RisoStory={
 id:'brahim-leipzig-2024',format:'11v11',title:"Brahim Díaz's slalom in Leipzig",
 theme:'Keep the ball close with small touches so you can change direction past each defender',
 ageNote:'RB Leipzig 0–1 Real Madrid, UEFA Champions League round of 16, first leg, Red Bull Arena, Leipzig, 13 February 2024. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a slalom — a zig-zag of little yellow touches from the point with a ball skipping along it. Reduced motion: the still zig-zag. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.2),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*u;pts.push([x+260*k,y+34*Math.sin(k*TAU*1.5)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,10,{seed,taper:.5,pressure:.3,wobble:.6,gaps:[[.15,.2],[.35,.4],[.55,.6],[.75,.8]]}),.95*fade);
  const e=pts[pts.length-1];footballPanels(s,e[0],e[1],24,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
