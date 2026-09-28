/** Rodrigo De Paul — "The Long Pass That Won the Copa": Argentina 1–0 Brazil, Copa América final, Estádio do Maracanã, Rio de Janeiro,
 * 10 July 2021 (21:00 local, a floodlit night final, a small socially-distanced crowd). An iconic-play riso film (RisoStory, chapters mode)
 * played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction of the 22nd-minute goal —
 * De Paul's long pass from his own half, over Renan Lodi, for Ángel Di María's chip — from WRITTEN accounts (the footage itself was not
 * reviewed), printed as a riso sheet. The film is about the PASS (De Paul's card); the finish is shown as it happened.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad kdp-src/):
 *  - Wikipedia, "2021 Copa América final" (raw): date, venue, 1–0, "Ángel Di María opened the scoring for Argentina in the 22nd minute,
 *    receiving a long pass from Rodrigo De Paul and beating defender Renan Lodi to lob the ball over the advancing goalkeeper Ederson";
 *    both line-ups with numbers; kit templates (Argentina sky-blue-and-white stripes; Brazil yellow shirts, blue shorts)
 *    https://en.wikipedia.org/wiki/2021_Copa_Am%C3%A9rica_final
 *  - The Guardian, 10 July 2021: "Rodrigo De Paul made a long pass to Ángel Di María, who took advantage of some sloppy defending from the
 *    left-back Renan Lodi to control the ball and loft it over Ederson"  https://www.theguardian.com/football/2021/jul/10/argentina-brazil-copa-america-final-lionel-messi
 *  - Search summaries (Al Jazeera / VAVEL / CBS): "launched a sublime, long-range pass from deep in his own half ... sailing over the
 *    Brazilian defense"; "Di Maria got free down the right ... a fine ball from Rodrigo de Paul really should have been settled by the
 *    defender, but he took a poor angle on it, and it fell right to Di Maria, who beat Ederson with a chip"
 *  - The Di María card film (lib/plays/riso/di-maria-maracana-2021.ts, another builder) cites Goal.com: "With one touch of his left foot,
 *    he gained control, while the second chipped the ball over the head of Ederson"; its inferred choices are matched here.
 * CONFIRMED by those accounts: the date, venue, score and 22nd minute; a LONG pass from DEEP IN DE PAUL'S OWN HALF, over the top of the
 * Brazil defence; Renan Lodi (Brazil's LEFT-back, so Di María ran down Argentina's RIGHT) misjudged it; Di María controlled it (left foot)
 * and chipped/lobbed it over the ADVANCING Ederson into the net; the only goal; Argentina's first Copa since 1993. Numbers: De Paul 7,
 * Di María 11, Messi 10, Lautaro Martínez 22, Paredes 5, Lo Celso 20; Lodi 16, Marquinhos 4, Thiago Silva 3, Casemiro 5, Fred 8,
 * Neymar 10, Ederson 23.
 * INFERRED (illustrative): every exact position and timing (a ~40 m lofted pass from right of centre); De Paul's RIGHT foot (he is
 * right-footed; the reports name no foot); his look up before receiving; where Lodi stood and how he missed it (drawn: he steps toward it
 * and the ball bounces past him); the chip with the left foot and where it dropped in (just left of centre, under the bar); kits:
 * Argentina's sky-blue-and-white stripes (confirmed) with black shorts and white socks, Brazil yellow shirts, blue shorts, white socks,
 * Ederson in dark navy; which end Argentina attacked on the TV picture (screen-right from the main camera, their right wing on the near
 * side); the bowl and ring roof; the thin crowd; Messi's spot.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (De Paul looks up → the long pass → over
 * Lodi → Di María's touch → the chip → the net); ch2 = the slow replay from a LOW camera behind De Paul (he checks the space before the ball
 * reaches him, opens his body, strikes long with his right foot); ch3 = a replay from behind the Brazil line (the pass drops over Lodi into
 * Di María's path, the chip over Ederson) ending on the celebration; ch4 = the lesson (look up early, spot the runner in space behind the
 * defence, one long pass). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts. Handedness: right-handed world (x toward Brazil's goal, y up,
 * +z = the main-stand side = Argentina's right wing), athlete.ts's own convention. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,posed,blendPose,celebrate,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Rio de Janeiro, 2021. Copa América final: Argentina against Brazil. Rodrigo De Paul looks up, and sends a long pass over the defence. Di María runs onto it... and lifts it over the keeper. Goal!',tail:2.6,
  cues:['Rio de Janeiro','Argentina against Brazil','Rodrigo De Paul','looks up','long pass','over the defence','Di María','lifts it','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. De Paul checks the space before the ball even reaches him. He opens his body, and hits it long with his right foot.',tail:1.6,
  cues:['Watch again','checks the space','reaches him','opens his body','hits it long']},
 {label:'Over the top',text:'The pass drops over Renan Lodi, right into Di María’s path. One touch, one chip over Ederson. Argentina win the Copa!',tail:2.4,
  cues:['The pass drops','Renan Lodi','right into','One touch','one chip','Argentina win']},
 {label:'Your turn',text:'Your turn, midfielders: look up early. If a runner is in space behind the defence, one long pass can find him.',tail:2.2,
  cues:['Your turn','look up early','runner','behind the defence','one long pass']},
];
import timingJson from '../../../public/plays/narration/de-paul-copa-2021/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('de-paul: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('de-paul: no cue '+w);return c.at;};
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

// ---------------------------------------------------------------- the Maracanã at night: a round two-tier bowl under a white ring roof, mostly empty seats
const CXS=-52.5,NS=60,PE=.62;
/** a point on the bowl: angle th round the pitch centre (0 = behind Brazil's goal, +90° = the main stand), d metres out from the front
 * row (a rounded oval), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(64+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(44+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=46;
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.2+26*b];
type Bowl={seg:V3[][];roof:V3[][];seats:{P:V3;h:number}[];lamps:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  // the white membrane ring roof, from the back of the bowl in over the upper tier
  o.roof.push([rim(a,20,31),rim(b,20,31),rim(b,SD1+2,30),rim(a,SD1+2,30)]);
  if(i%2===0)o.lamps.push([rim(a,20.5,30.6),rim(b,20.5,30.6)]);
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.2)continue;const[d,y]=RAKE((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(K,.7,.5);s.field(B,.26,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 // the empty seats: a blue-and-yellow patchwork (Maracanã's coloured seats), then the few fans in yellow, sky blue and white
 s.knockout(bowl);s.tone(B,bowl,.42);s.tone(K,bowl,.38);
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){if(q.h<.72)continue;const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.82?0:q.h<.93?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.fill(Y,inks[0],.95);s.knockout(inks[1],.8);s.fill(R,inks[2],.8);
 s.knockout(roof);s.tone(K,roof,.18);
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+4)continue;seg3(c,a,b,.9,lamp);seg3(c,a,b,3.4,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(18*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
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
/** Argentina: sky-blue-and-white stripes (confirmed), black shorts (printed navy) and white socks (inferred), navy numbers */
const argentina=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[B,.55],shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Brazil: yellow shirts, blue shorts (confirmed), white socks (inferred), green-ish trim printed blue */
const brazil=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[B,.95],socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:B,numberInk:B,hairStyle:'short',...o});
const DP_B={height:1.8,bulk:1.02};
const DP_ST=argentina({number:7,hair:K,hairStyle:'long',build:DP_B,seed:7});
const DIM_B={height:1.8,bulk:.9};
const DIM_ST=argentina({number:11,hairStyle:'curly',build:DIM_B,seed:11});
const EDERSON_ST:AthleteStyle={shirt:[K,.85],shorts:[K,.85],socks:[K,.85],boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:23,numberInk:Y,build:{height:1.88},seed:23};

// ---------------------------------------------------------------- the geometry (τ = seconds after Di María's chip)
/** De Paul's long pass: τ = −4.1, from right of centre deep in Argentina's half (inferred), lofted ~40 m over the Brazil line */
const T_PASS=-4.1,T_L1=-1.55,T_TCH=-.85,FLY=1.2,IN_NET=FLY+.1;
const DPB:V3=[-63,.11,1.2];
const L1:V3=[-20.6,.11,12.3],TCH:V3=[-16.5,.11,10.1],C_BALL:V3=[-12.3,.11,7.4];
/** the chip crosses the line just left of centre, under the bar (inferred) */
const GOAL_PT:V3=[0,1.85,-.6];
const BULGE_Z=-.6,BULGE_HIGH=true;
const YAW_P=yawTo(DPB[0],DPB[2],L1[0],L1[2]),YAW_C=yawTo(C_BALL[0],C_BALL[2],GOAL_PT[0],GOAL_PT[2]),YAW_T=yawTo(TCH[0],TCH[2],C_BALL[0],C_BALL[2]);
/** the long pass: a driven, lofted strike with the RIGHT foot, body opened toward the right wing */
const LONG:Partial<Pose>={rAnk:36,lean:-4,pitch:-2,neckP:18,lShA:80,rShA:40};
const PD=1,P_ST=-STRIKE_CONTACT*PD;
function pStrike(tau:number):Pose{const u=(tau-T_PASS-P_ST)/PD;return over(strike(clamp(u),{foot:'r',power:.85}),LONG,bump(-.4,.3,tau-T_PASS));}
/** the chip: a short backswing, the LEFT foot stabs under the ball, body leaning back a touch */
const CHIP:Partial<Pose>={lAnk:-12,lean:-6,neckP:26,rShA:74,lShA:40};
const CD=.8,C_ST=-STRIKE_CONTACT*CD;
function cStrike(tau:number):Pose{const u=(tau-C_ST)/CD;return over(strike(clamp(u),{foot:'l',power:.35}),CHIP,bump(-.35,.25,tau));}
const TD=.55,T_ST=-STRIKE_CONTACT*TD;
function tTouch(tau:number):Pose{const u=(tau-T_TCH-T_ST)/TD;return strike(clamp(u),{foot:'l',power:.15});}
const RTOE=(()=>{const sk=solve(pStrike(T_PASS),DP_B,{x:0,z:0,yaw:YAW_P});return mix3(sk.rAn,sk.rToe,.55);})();
const LTOE_C=(()=>{const sk=solve(cStrike(0),DIM_B,{x:0,z:0,yaw:YAW_C});return mix3(sk.lAn,sk.lToe,.6);})();
const LTOE_T=(()=>{const sk=solve(tTouch(T_TCH),DIM_B,{x:0,z:0,yaw:YAW_T});return mix3(sk.lAn,sk.lToe,.6);})();
const DP0:[number,number]=[DPB[0]-RTOE[0],DPB[2]-RTOE[2]];
const DM0:[number,number]=[C_BALL[0]-LTOE_C[0],C_BALL[2]-LTOE_C[2]];
const DMT:[number,number]=[TCH[0]-LTOE_T[0],TCH[2]-LTOE_T[2]];
/** where the ball comes to De Paul from (a short pass from a teammate behind him, inferred) */
const FEED:V3=[-72,.11,-4.5],T_FEED=-6.2;

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'arg'|'bra'|'gk';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'De Paul',role:'hero',st:DP_ST,key:true,keys:[[-12,-66,-4],[-7,-65,-1.8],[-5,DP0[0]-1.1,DP0[1]-.5],[T_PASS,...DP0],[-3,DP0[0]+2.2,DP0[1]+.6],[0,DP0[0]+8,DP0[1]+3],[3,DP0[0]+16,DP0[1]+6],[12,DP0[0]+26,DP0[1]+9]]},
 {name:'Di María',role:'arg',st:DIM_ST,key:true,keys:[[-12,-36,21],[-6,-33.5,20],[T_PASS,-31,18.8],[-2.6,-23.4,14.8],[-1.5,-19.6,12.4],[T_TCH,...DMT],[0,...DM0],[.5,DM0[0]+1.6,DM0[1]+.3],[1.6,DM0[0]+4,DM0[1]+5],[3.2,DM0[0]+6,DM0[1]+12],[5,DM0[0]+7,DM0[1]+15],[12,DM0[0]+7,DM0[1]+15]]},
 {name:'Paredes',role:'arg',st:argentina({number:5,build:{height:1.8},seed:5}),keys:[[-12,-74,-6.5],[T_FEED,-72.6,-4.9],[0,-68,-2],[12,-56,2]]},
 {name:'Messi',role:'arg',st:argentina({number:10,hair:K,build:{height:1.7},seed:10}),key:true,keys:[[-12,-42,-9],[T_PASS,-38,-7],[0,-27,-3.5],[3,-22,2],[6,DM0[0]+5,DM0[1]+13],[12,DM0[0]+5,DM0[1]+13]]},
 {name:'Lautaro',role:'arg',st:argentina({number:22,build:{height:1.74},seed:22}),keys:[[-12,-32,-2],[T_PASS,-29,-1],[0,-19,-1.5],[3,-14,3],[6,DM0[0]+6.2,DM0[1]+11.5],[12,DM0[0]+6.2,DM0[1]+11.5]]},
 {name:'Lo Celso',role:'arg',st:argentina({number:20,build:{height:1.77},seed:20}),keys:[[-12,-48,-18],[0,-38,-14],[12,-30,-8]]},
 {name:'Renan Lodi',role:'bra',st:brazil({number:16,build:{height:1.78},seed:16}),key:true,keys:[[-12,-28,15],[T_PASS,-26,13.8],[-2.4,-23,13],[T_L1,-21.5,12.9],[-1,-20.7,12.6],[0,-18.4,11.2],[2,-15,9.5],[12,-14,9]]},
 {name:'Marquinhos',role:'bra',st:brazil({number:4,build:{height:1.83},seed:4}),keys:[[-12,-27,5],[T_PASS,-26,5],[-1.5,-19.5,5],[0,-16.6,4.5],[12,-14,4]]},
 {name:'Thiago Silva',role:'bra',st:brazil({number:3,hairStyle:'bald',skin:SKIN_D,build:{height:1.83},seed:3}),keys:[[-12,-27,-4],[T_PASS,-26,-4],[0,-18,-2.5],[12,-15,-1]]},
 {name:'Danilo',role:'bra',st:brazil({number:2,build:{height:1.84},seed:2}),keys:[[-12,-27,-14],[T_PASS,-26.5,-13],[0,-20,-9],[12,-16,-6]]},
 {name:'Casemiro',role:'bra',st:brazil({number:5,skin:SKIN_M,build:{height:1.85},seed:52}),keys:[[-12,-48,2],[T_PASS,-52,3],[0,-42,4],[12,-30,5]]},
 {name:'Fred',role:'bra',st:brazil({number:8,skin:SKIN_D,build:{height:1.69},seed:8}),keys:[[-12,-50,-6],[T_PASS,-55,-4],[0,-46,-2],[12,-34,0]]},
 {name:'Ederson',role:'gk',st:EDERSON_ST,key:true,keys:[[-12,-3,.4],[-2.2,-2.6,1.4],[-1,-4,2.4],[0,-6.1,3.4],[.35,-6.6,3.7],[2,-6.8,3.8],[12,-6.8,3.8]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,DIM=IX('Di María'),FEEDER=IX('Paredes'),LODI=IX('Renan Lodi'),EDER=IX('Ederson');
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

// ---------------------------------------------------------------- the ball: the feed, the long pass, the bounce past Lodi, the touch, the chip, the net
const loft=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
const NET_HIT:V3=[1.6,1.1,-.7],REST:V3=[1.1,.11,-.6];
function ballAt(tau:number):V3{
 if(tau<T_FEED){const[x,z]=posOf(FEEDER,tau);return[x+.5,.11,z+.2];}
 if(tau<T_PASS-.05)return roll(FEED,DPB,(tau-T_FEED)/(T_PASS-.05-T_FEED),.45);
 if(tau<T_PASS)return DPB;
 if(tau<T_L1)return loft(DPB,L1,(tau-T_PASS)/(T_L1-T_PASS),8);
 if(tau<T_TCH)return loft(L1,TCH,(tau-T_L1)/(T_TCH-T_L1),1.35);
 if(tau<0)return roll(TCH,C_BALL,(tau-T_TCH)/-T_TCH,.35);
 if(tau<FLY)return loft(C_BALL,GOAL_PT,tau/FLY,2.3);
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55);return[lerp(NET_HIT[0],REST[0],u),lerp(NET_HIT[1],REST[1],u*u),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>TAU*(tau<0?1.6*tau:-2*Math.min(tau,IN_NET)+.5*Math.max(0,tau-IN_NET));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:.8*Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** Lodi's stretch: he leans in with his left leg toward the dropping ball and misses it */
const REACH:Partial<Pose>={lHipF:70,lKnee:20,lAnk:-10,rKnee:40,lean:18,roll:-10,lShA:60,rShA:40,neckP:20};
/** Ederson rushing out: low, arms spreading to make himself big */
const SPREAD:Partial<Pose>={lShA:70,rShA:70,lElb:20,rElb:20,lean:24,lKnee:50,rKnee:50,lHipA:18,rHipA:18,lHand:1,rHand:1,neckP:-16};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bra'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===FEEDER){const D=.7,u=(tau-(T_FEED-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.3}),w);yaw=lerpAng(yaw,yawTo(x,z,DPB[0],DPB[2]),w);}}
 if(k===HERO){
  // "looks up": head up and turned to the right wing while the ball is still rolling to him, then back down to the ball
  if(tau<T_PASS)p=over(p,{neckY:-55,neckP:-12},bump(T_FEED-.3,T_PASS-.35,tau));
  const u=(tau-T_PASS-P_ST)/PD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,pStrike(tau),w);yaw=lerpAng(yaw,YAW_P,sm(-.3,.05,u));}
  if(tau>T_PASS+.6&&tau<T_PASS+2.6)yaw=lerpAng(yaw,yawTo(x,z,L1[0],L1[2]),.6);// watching his pass
  if(tau>IN_NET+.3)p=over(p,JOY,sm(IN_NET+.3,IN_NET+.9,tau));
 }
 if(k===DIM){
  const ut=(tau-T_TCH-T_ST)/TD,wt=Math.min(sm(-.1,.1,ut),1-sm(1,1.3,ut));if(wt>0){p=blendPose(p,tTouch(tau),wt);yaw=lerpAng(yaw,YAW_T,wt);}
  const u=(tau-C_ST)/CD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,cStrike(tau),w);yaw=lerpAng(yaw,YAW_C,sm(-.3,.05,u));}
  if(tau>IN_NET+.2)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:'run'}),sm(IN_NET+.2,IN_NET+.7,tau)*(1-sm(4.6,5.2,tau)));
  if(tau>5)p=over(p,JOY,sm(5,5.5,tau));
 }
 if(k===LODI){const w=bump(T_L1-.45,T_L1+.45,tau);if(w>0){p=over(p,REACH,w);yaw=lerpAng(yaw,yawTo(x,z,L1[0],L1[2]),w);}}
 if(k===EDER){if(tau>-1.3&&tau<.9)p=over(p,SPREAD,bump(-1.3,.9,tau)*1.2);if(tau>.5)p=over(p,{neckY:80,neckP:-30},sm(.5,1,tau));}
 if(tau>IN_NET+.25&&k!==HERO&&k!==DIM){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='arg')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='bra')p=over(p,DESPAIR,w*.85);}
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
/** the ball's real path between τa and τb (dashed yellow ribbon, drawn on up to τ) */
function trail(s:Sheet,c:Cam,ta:number,tb:number,tau:number,w:number,o:{ink?:string;dash?:boolean;min?:number;seed?:number}={}){if(w<=.02||tau<=ta)return;
 const{ink=Y,dash=true,min=5,seed=63}=o,pts=pathPts(c,ta,Math.min(tau,tb),26);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(Math.min(tau,tb)))*.1);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.7,pressure:.2,wobble:0}),.8*w);
 s.fill(ink,ribbon(pts,wd,{seed,taper:.7,pressure:.2,wobble:0,gaps:dash?[[.1,.16],[.26,.32],[.42,.48],[.58,.64],[.74,.8]]:[]}),.95*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
function goalRing(s:Sheet,c:Cam,P:V3,w:number,ink=R,seed=77){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(24,kAt(c,P)*.45)*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(5,r*.14),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** "looks up": a yellow sight wedge on the grass from De Paul toward the space behind Lodi */
function sightWedge(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;const[x,z]=posOf(HERO,tau),T:V3=[lerp(x,L1[0],w),0,lerp(z,L1[2],w)],dx=T[0]-x,dz=T[2]-z,l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,half=l*.09;
 const q=polyP(c,[[x,.02,z],[T[0]+nx*half,.02,T[2]+nz*half],[T[0]-nx*half,.02,T[2]-nz*half]]);if(q.length<3)return;const p=polyPath(q,true);s.knockout(p,.4*Math.min(1,w*3));s.fill(Y,p,.4*Math.min(1,w*3));s.stroke(Y,p,3,.95);}
/** the Brazil back line (dashed red across the pitch) */
function backLine(s:Sheet,c:Cam,xLine:number,w:number){if(w<=.02)return;const p=new Path2D();const z0=-22,z1=22,n=16;for(let i=0;i<n;i+=2){if(i/n>w)break;seg3(c,[xLine,.01,lerp(z0,z1,i/n)],[xLine,.01,Math.min(lerp(z0,z1,(i+1)/n),lerp(z0,z1,w))],.3,p,2);}s.knockout(p,.85);s.fill(R,p,.95);}
function spark(s:Sheet,c:Cam,P:V3,t:number,t0:number,ink=Y,seed=61){const a=t-t0;if(a<-.08||a>.5)return;const q=pr(c,P);if(!q)return;sparkBurst(s,ink,q[0],q[1],Math.max(44,kAt(c,P)*.5),{n:9,seed,g:easeOutBack(clamp((a+.08)/.14))*(1-clamp((a-.28)/.22)),width:Math.max(4,kAt(c,P)*.05)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time anchored on the chip ("lifts it")
const tau1=(t:number)=>t-CUE(0,'lifts it');
const P1:V3=[-38,25,74];
function cam1(t:number):Cam{
 const tau=tau1(t),dp=at3(HERO,tau,1),dm=at3(DIM,tau,1),b=ballAt(Math.min(tau,IN_NET)),g=CUE(0,'Goal');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-56,2,-6],fov:24})],
  [CUE(0,'Rodrigo')-.3,.9,()=>({P:P1,T:add3(dp,[4,0,2]),fov:11})],
  [CUE(0,'long pass')+.1,1.1,()=>({P:P1,T:mix3(b,[-26,1,12],.45),fov:19})],
  [CUE(0,'Di María')-.2,1,()=>({P:P1,T:mix3(dm,b,.4),fov:11})],
  [CUE(0,'lifts it')-.2,.8,()=>({P:P1,T:mix3(dm,[-4,1.5,1],.5),fov:12})],
  [g-.3,1,()=>({P:P1,T:[-2,1.4,0],fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal'),lu=CUE(0,'looks up'),od=CUE(0,'over the defence');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  sightWedge(s,c,tau,sm(lu-.1,lu+.5,t)*(1-sm(lu+2.2,lu+2.6,t)));
  trail(s,c,T_PASS,T_L1,tau,sm(od-.3,od+.1,t)*(1-sm(od+2.4,od+3,t)));
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
  spark(s,c,DPB,tau,T_PASS,Y,13);spark(s,c,C_BALL,tau,0,R,19);
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Goal')+.3;

// ---------------------------------------------------------------- 2 · slow replay, low behind De Paul
const tau2=(t:number)=>key(t,mono([[0,-7.2],[CUE(1,'checks'),-5.9],[CUE(1,'reaches'),-4.75],[CUE(1,'opens'),-4.35],[CUE(1,'hits it'),T_PASS],[SECS(1),-2.7]]),easeInOutSine);
function cam2(t:number):Cam{
 const tau=tau2(t),dp=at3(HERO,Math.min(tau,T_PASS+.3),1),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:add3(dp,[-6.5,1.6,-3.4]),T:add3(dp,[8,-.2,5]),fov:44})],
  [CUE(1,'checks')-.2,1,()=>({P:add3(dp,[-5.4,1.5,-2.6]),T:add3(dp,[10,1,9]),fov:40})],
  [CUE(1,'reaches')-.2,.8,()=>({P:add3(dp,[-4.4,1.2,-2.4]),T:add3(dp,[1.4,.2,.8]),fov:34})],
  [CUE(1,'hits it')+.15,1.3,()=>({P:add3(dp,[-6,1.7,-3.4]),T:add3(dp,[16,1,11]),fov:42})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tC=CUE(1,'checks'),tR=CUE(1,'reaches'),tO=CUE(1,'opens'),tH=CUE(1,'hits it');
  stadium(s,c,t);
  ground(s,c);
  // "checks the space": the sight wedge to the right wing while the ball is still on its way
  sightWedge(s,c,tau,sm(tC-.1,tC+.7,t)*(1-sm(tO-.1,tO+.3,t)));
  // "before the ball even reaches him": the feed's path drawn in, a ring where it will arrive
  trail(s,c,T_FEED,T_PASS,tau,sm(tR-.3,tR,t)*(1-sm(tH,tH+.3,t)),{seed:64});
  ring(s,c,DPB,.7,sm(tR-.1,tR+.3,t,easeOutBack)*(1-sm(tH-.1,tH+.2,t)),Y,44);
  trail(s,c,T_PASS,T_L1,tau,sm(tH-.1,tH+.2,t),{dash:false,min:6});
  const hr=play(s,c,tau,tp,tpp,{minBall:12});
  // "opens his body": a red arc swinging round his hips toward the right wing
  const ob=sm(tO-.1,tO+.35,t,easeOutBack)*(1-sm(tH+.2,tH+.6,t));
  if(hr&&ob>.02){const pv=hr.sk.pelvis,pts:Pt[]=[];for(let i=0;i<=14;i++){const a=YAW_P+Math.PI*.9-i/14*Math.PI*.9*ob,p=pr(c,[pv[0]+Math.cos(a)*.75,pv[1],pv[2]-Math.sin(a)*.75]);if(p)pts.push(p);}
   if(pts.length>3){const wd=Math.max(4,kAt(c,pv)*.06);s.knockout(ribbon(pts,wd*1.7,{seed:83,taper:.3,wobble:.5}),.8*ob);s.fill(R,ribbon(pts,wd,{seed:83,taper:.3,wobble:.5}),.95*ob);}}
  spark(s,c,DPB,t,tH,Y,61);
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/Math.max(1,q[2])*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'opens')+.2;

// ---------------------------------------------------------------- 3 · over the top: behind the Brazil line, the drop past Lodi, the touch, the chip
const tau3=(t:number)=>{const ta=CUE(2,'Argentina win');return key(t,mono([[0,-2.5],[CUE(2,'The pass'),-2.25],[CUE(2,'Renan Lodi'),T_L1-.1],[CUE(2,'right into'),T_TCH-.15],[CUE(2,'One touch'),T_TCH+.05],[CUE(2,'one chip'),0],[ta,IN_NET+.6],[SECS(2)+1,IN_NET+.6+(SECS(2)+1-ta)*.9]]),linear);};
const E3:V3=[-5,2.6,21];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),dm=at3(DIM,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([-21,1,12.5],b,.35),fov:30})],
  [CUE(2,'right into')-.2,.8,()=>({P:add3(E3,[-2,-.6,-2]),T:mix3(dm,b,.5),fov:30})],
  [CUE(2,'one chip')-.1,.9,()=>({P:[5,2.2,12],T:mix3(b,[-4,2,1],.5),fov:34})],
  [CUE(2,'Argentina win')-.2,1.3,()=>({P:[4,2.6,26],T:add3(dm,[.5,.3,0]),fov:30})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tP=CUE(2,'The pass'),tL=CUE(2,'Renan Lodi'),tR=CUE(2,'right into'),tT=CUE(2,'One touch'),tC=CUE(2,'one chip'),tA=CUE(2,'Argentina win');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tA-.1,tA+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  trail(s,c,T_PASS,T_TCH,tau,sm(tP-.2,tP+.2,t)*(1-sm(tT+.4,tT+.8,t)));
  ring(s,c,at3(LODI,T_L1),.8,sm(tL-.1,tL+.3,t,easeOutBack)*(1-sm(tR+.3,tR+.7,t)),R,46);
  ring(s,c,TCH,.9,sm(tR-.1,tR+.3,t,easeOutBack)*(1-sm(tC,tC+.3,t)),Y,47);
  trail(s,c,0,FLY,tau,sm(tC-.1,tC+.2,t)*(1-sm(tA+.4,tA+.9,t)),{dash:false,min:6,seed:66});
  play(s,c,tau,tp,tpp,{minBall:12});
  spark(s,c,add3(TCH,[0,.1,0]),t,tT,Y,62);
  goalRing(s,c,GOAL_PT,sm(tC+.8,tC+1.2,t,easeOutBack)*(1-sm(tA+.6,tA+1.1,t)),Y);
  const fb=sm(tA-.05,tA+.35,t);if(fb>0){const q=pr(c,add3(at3(DIM,tau),[0,3.4,0]));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(DIM,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'One touch')+.3;

// ---------------------------------------------------------------- 4 · the lesson: look up early → the runner → the space behind → one long pass
const tau4=(t:number)=>key(t,mono([[0,-6.6],[CUE(3,'look up'),-6],[CUE(3,'runner'),-5.1],[CUE(3,'behind'),-4.6],[CUE(3,'one long'),T_PASS],[SECS(3),-1.4]]),easeInOutSine);
function cam4v(t:number):Cam{
 const tau=tau4(t),dp=at3(HERO,Math.min(tau,T_PASS),1);
 return plan(t,[
  [0,0,()=>({P:add3(dp,[-8,5,-6]),T:add3(dp,[10,0,7]),fov:34})],
  [CUE(3,'runner')-.2,1,()=>({P:[-44,8,-6],T:[-30,0,14],fov:42})],
  [CUE(3,'one long')+.1,1.4,()=>({P:[-42,24,-24],T:[-40,0,7],fov:56})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tU=CUE(3,'look up'),tN=CUE(3,'runner'),tB=CUE(3,'behind'),tL=CUE(3,'one long'),E=SECS(3);
  stadium(s,c,t);
  ground(s,c);
  sightWedge(s,c,tau,sm(tU-.1,tU+.7,t)*(1-sm(tL+.3,tL+.7,t)));
  ring(s,c,at3(DIM,tau),.9,sm(tN-.1,tN+.3,t,easeOutBack)*(1-sm(E-1,E-.6,t)),Y,48);
  backLine(s,c,-25.8,sm(tB-.15,tB+.5,t)*(1-sm(E-1,E-.6,t)));
  ring(s,c,L1,1.6,sm(tB,tB+.4,t,easeOutBack)*(1-sm(E-.9,E-.5,t)),Y,49);
  trail(s,c,T_PASS,T_L1,tau,sm(tL-.1,tL+.2,t),{dash:false,min:6});
  play(s,c,tau,tp,tpp,{minBall:14});
  spark(s,c,DPB,t,tL,Y,63);
 },
 still:0,
};
ch4.still=CUE(3,'behind')+.3;

/** facts the test reads back */
export const FACTS={T_PASS,T_L1,T_TCH,FLY,IN_NET,DPB,L1,TCH,C_BALL,GOAL_PT,ballAt,posOf,
 heroAt:(tau:number)=>{const{p,yaw}=poseOf(HERO,tau),[x,z]=posOf(HERO,tau);return solve(p,DP_B,{x,z,yaw});},
 dimAt:(tau:number)=>{const{p,yaw}=poseOf(DIM,tau),[x,z]=posOf(DIM,tau);return solve(p,DIM_B,{x,z,yaw});},
 lodiAt:(tau:number)=>posOf(LODI,tau),ederAt:(tau:number)=>posOf(EDER,tau)};

const film:RisoStory={
 id:'de-paul-copa-2021',format:'11v11',title:"De Paul's long pass in the Copa final",
 theme:'Look up early: one long pass over the defence can find a runner in space',
 ageNote:'Argentina 1–0 Brazil, Copa América final, Estádio do Maracanã, Rio de Janeiro, 10 July 2021. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a long pass — a dashed yellow arc lofts from the point and a ball drops at its end. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.55)),fade=age<=0?1:1-clamp((age-.6)/.2),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=18;i++){const k=i/18*u;pts.push([x+340*k,y-170*Math.sin(Math.PI*k)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,12,{seed,taper:.6,pressure:.3,wobble:.8,gaps:[[.2,.28],[.45,.53],[.7,.78]]}),.95*fade);
  const e=pts[pts.length-1];footballPanels(s,e[0],e[1],28,{rot:age*10+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
