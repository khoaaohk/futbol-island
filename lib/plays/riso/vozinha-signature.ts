/** Vozinha — "set your feet, then spring either way": a signature-move riso film (iconic plays, 11v11).
 *
 * WHO: Josimar Dias "Vozinha" (born 3 June 1986), Cape Verde's goalkeeper and captain figure, 40 years old at the 2026 World Cup.
 * WHY A DEMONSTRATION: his card's Top Play (lib/town/iconicPlays.json) is "Seven Saves Against Spain" (Spain 0–0 Cape Verde, World Cup
 *  2026, Group H, 15 June 2026, Mercedes-Benz Stadium, Atlanta). Every account we could reach confirms the match, the 0–0, his seven saves
 *  and that he was player of the match, but none describes the geometry of any single save (which side, which hand, which height, where the
 *  shot came from). The brief forbids staging an invented play inside a named real match, so the film follows the honest FALLBACK:
 *  chapter 1 shows only CONFIRMED things from that match (the final whistle at 0–0, his teammates running to mob him, Cape Verde in all
 *  white, Spain in red with navy shorts), and the saving technique is a separate, clearly labelled demonstration ("Watch how he does it",
 *  a training pitch, a training-bib striker, no opponent or match named) that is never passed off as the Spain game.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad kdp-src/):
 *  - Wikipedia, "2026 FIFA World Cup Group H" (raw): Spain 0–0 Cape Verde, 15 June 2026, 12:00 UTC−4, Mercedes-Benz Stadium, Atlanta,
 *    attendance 67,640; Cape Verde's World Cup debut; kits (Spain red shirts, navy shorts, red socks; Cape Verde all white); line-ups
 *    (Vozinha 1; Moreira 22, Pico 4, Diney 3, Kevin Pina 6, Ryan Mendes 20 (c); Spain: Unai Simón 23, Laporte 14, Cubarsí 22, Pedri 20,
 *    Oyarzabal 21, subs Lamine Yamal 19, Dani Olmo 10, Nico Williams 17, Merino 6)  https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_H
 *  - ESPN report (gameId 760428): "He was the player of the match, pulling off a string of saves at the end of the first half to deny Ferran
 *    Torres, Pedri and Aymeric Laporte"; "Veteran goalkeeper Vozinha broke down in tears after the final whistle"
 *  - Al Jazeera, 16 June 2026: "broke down in tears at the end of the 0-0 draw with Spain after the 40-year-old was mobbed by his teammates"
 *  - Opta Analyst: "He saved all seven of the shots on target he faced ... at 40 years and 12 days old"; Northeastern NetSI: seven saves,
 *    six from inside the box.
 * CONFIRMED: the match, venue, date, 0–0, seven saves, his age (40), player of the match, the final-whistle tears and his teammates mobbing
 *  him; the kits of both outfield teams.
 * INFERRED (illustrative): Vozinha's goalkeeper kit colour (drawn yellow — not confirmed); every position in the chapter-1 celebration (who
 *  reached him first is not claimed); the stadium look (a closed roof with a round centre opening); the whole demonstration (chapters 2–4)
 *  is a generic model of the keeper's set position and dives, not a recreation of any real shot.
 *
 * FRAMING (never top-down; full-sheet card window, never sheet.safe): 1 = LIVE, the broadcast camera at the final whistle in Atlanta,
 *  pushing in on Vozinha as his teammates run to him; 2 = HOW HE DOES IT (demonstration, real time, a low camera beside the goal: small
 *  steps, stop, balanced on the toes, spring, save); 3 = WATCH AGAIN (slow replay from behind the goal: the low save to his left, then a
 *  second shot high to his right); 4 = YOUR TURN (the lesson, side-on: on your toes, set your feet before the shot, spring either way).
 *  Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts. World: right-handed metres, y up (athlete.ts's convention),
 *  the goal line x = 0, the keeper faces −x so HIS LEFT is +z. Inks: yellow, red, blue, navy. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Live: World Cup 2026',text:'The 2026 World Cup, in Atlanta: Spain against Cape Verde. Cape Verde’s forty-year-old keeper, Vozinha, makes seven saves. It ends nil-nil, and his teammates run to hug him!',tail:2.4,
  cues:['World Cup','Atlanta','Spain against Cape Verde','Vozinha','seven saves','nil-nil','his teammates']},
 {label:'How he does it',text:'Watch how he does it. As the striker gets ready, he takes small, quick steps. Just before the kick, he stops, balanced on his toes. Then he springs, and saves!',tail:2.2,
  cues:['Watch how','striker gets ready','small, quick steps','Just before the kick','balanced on his toes','springs']},
 {label:'Watch again',text:'Watch again, slowly. Feet set, weight forward. Low to his left: saved. High to his right: saved again!',tail:2.4,
  cues:['Watch again','Feet set','weight forward','Low to his left','High to his right','saved again']},
 {label:'Your turn',text:'Your turn, keepers: stay on your toes, and set your feet before the shot. Then you can spring either way.',tail:2.4,
  cues:['Your turn','on your toes','set your feet','before the shot','spring either way']},
];
import timingJson from '../../../public/plays/narration/vozinha-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('vozinha: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('vozinha: no cue '+w);return c.at;};
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

// ---------------------------------------------------------------- two worlds: the Atlanta bowl (chapter 1, the real match) and a training pitch (the demonstration)
/** which world the scene is drawing: 'match' (Spain v Cape Verde, confirmed things only) or 'demo' (the labelled demonstration) */
type Mode='match'|'demo';
let MODE:Mode='demo';
const CXS=-52.5,NS=56,PE=.45;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(41+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=46;
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.3+32*b];
type Bowl={seg:V3[][];roof:V3[][];seats:{P:V3;h:number}[];lamps:[V3,V3][];trees:{P:V3;r:number;h:number}[];fence:V3[][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],seats:[],lamps:[],trees:[],fence:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  // the closed roof: panels from the top of the bowl in toward a round opening over the centre circle
  o.roof.push([rim(a,SD1+3,36),rim(b,SD1+3,36),rim(b,-18,44),rim(a,-18,44)]);
  if(i%2===0)o.lamps.push([rim(a,-17,43.5),rim(b,-17,43.5)]);
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.2)continue;const[d,y]=RAKE((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}
  // the training ground: a low fence round the pitch and a ring of trees behind it
  o.fence.push([rim(a,4,0),rim(b,4,0),rim(b,4,2.2),rim(a,4,2.2)]);
  if(i%1===0)o.trees.push({P:rim((i+.5)/NS*TAU,12+hash(i,7)*10,0),r:4+hash(i,9)*3,h:hash(i,5)});}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 if(MODE==='demo'){
  // daylight training ground: a pale printed sky, trees, a fence (no crowd: nothing here claims a match)
  s.field(B,.3,.5);s.field(Y,.12,.5);
  const tr=new Path2D(),tr2=new Path2D(),fc=new Path2D();
  for(const T of BOWL.trees){const d=toCam(c,T.P);if(d[2]<8)continue;const g=scr(c,d),k=c.F/d[2],r=T.r*k;(T.h<.5?tr:tr2).addPath(polyPath([[g[0]-r*.9,g[1]],[g[0]-r*1.05,g[1]-r*1.3],[g[0]-r*.5,g[1]-r*2.3],[g[0]+r*.3,g[1]-r*2.5],[g[0]+r,g[1]-r*1.6],[g[0]+r*.9,g[1]]],true));}
  s.fill(B,tr,.8);s.tone(K,tr,.5);s.fill(Y,tr2,.6);s.tone(B,tr2,.85);
  for(const q of BOWL.fence){const r=quadP(c,q,6);if(r)addPoly(fc,r);}s.knockout(fc);s.fill(K,fc,.35);
  return;}
 // Atlanta: a closed roof, the bowl lit, the crowd (Spain red and yellow, Cape Verde blue, white and red, phone lights)
 s.field(K,.72,.5);s.field(R,.14,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(roof);s.tone(K,roof,.55);s.tone(B,roof,.3);
 s.knockout(bowl);s.tone(B,bowl,.4);s.tone(K,bowl,.34);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.45?0:q.h<.7?1:q.h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.fill(R,inks[0],.85);s.knockout(inks[1],.75);s.fill(B,inks[2],.85);s.fill(Y,inks[3],.95);
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
/** Vozinha: 1.87 m, keeper kit drawn yellow (NOT confirmed), gloves paper */
const VOZ_B={height:1.87,bulk:1.05};
const VOZ_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_D,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'bald',number:1,numberInk:K,build:VOZ_B,seed:1};
/** chapter 1 kits (confirmed): Cape Verde all white; Spain red shirts, navy shorts, red socks */
const capeVerde=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_D,hair:K,line:K,trim:[B,.9],numberInk:[B,.9],hairStyle:'short',...o});
const spain=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:K,socks:[R,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,numberInk:Y,hairStyle:'short',...o});
/** the demonstration striker: a plain training top with a red bib, no number, no club */
const BIB:AthleteStyle={shirt:[R,.8],shorts:K,socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',number:null,hairStyle:'short',build:{height:1.8},seed:88};
const BULGE_Z=0,BULGE_HIGH=false;

// ---------------------------------------------------------------- the demonstration geometry (τ = seconds after shot A is struck; shot B at τ = S2)
const S2=6,TA=.42,TB=.46,DUR=.76,IN_NET=S2+2;
const KX=-.9;/** the keeper's spot on his line, just off it */
const BA:V3=[-11,.11,-1.1],BB:V3=[-12,.11,1.6];
const GK_YAW=Math.PI;
/** the keeper: small steps until τ −0.4 (−0.4 before each shot), then set, balanced on his toes, then the dive */
function keeperPose(tau:number):Pose{
 const rel=tau<S2-2?tau:tau-S2,tDive=tau<S2-2?TA:TB,side:'l'|'r'=tau<S2-2?'l':'r',height=tau<S2-2?0:1;
 let p=rel<-.4?keeperSet(rel*2.2):keeperSet(.25);
 const u=(rel-(tDive-.55*DUR))/DUR;if(u>0)p=blendPose(p,keeperDive(Math.min(1,u),{side,height}),sm(0,.08,u));
 return p;
}
const kKeys=(o:number):number[][]=>[[o-3.2,KX,.1],[o-2.6,KX,-.28],[o-2,KX,.26],[o-1.4,KX,-.22],[o-.85,KX,.14],[o-.4,KX,0]];
const keeperAt=(tau:number)=>solve(keeperPose(tau),VOZ_B,{x:KX,z:0,yaw:GK_YAW});
/** where the ball meets his glove: the leading hand at full stretch (solved from the dive, so hand and ball always meet) */
const HA:V3=(()=>{const sk=keeperAt(TA);return sk.lHa[1]<sk.rHa[1]?sk.lHa:sk.rHa;})();
const HB:V3=(()=>{const sk=keeperAt(S2+TB);return sk.lHa[1]>sk.rHa[1]?sk.lHa:sk.rHa;})();
const YAW_A=yawTo(BA[0],BA[2],HA[0],HA[2]),YAW_B=yawTo(BB[0],BB[2],HB[0],HB[2]);
const SD=.9,S_ST=-STRIKE_CONTACT*SD;
const instep=(yaw:number)=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.9}),{height:1.8},{x:0,z:0,yaw});return mix3(sk.rAn,sk.rToe,.55);};
const IA=instep(YAW_A),IB=instep(YAW_B);
const SA0:[number,number]=[BA[0]-IA[0],BA[2]-IA[2]],SB0:[number,number]=[BB[0]-IB[0],BB[2]-IB[2]];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z] — two casts, one per world
type Role='hero'|'mate'|'opp'|'bib';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
/** chapter 1 (τ = seconds after the final whistle): Vozinha drops to his knees in his area; his teammates run to him (positions inferred) */
const VZ:[number,number]=[-4.2,.6];
const MATCH_ACTORS:Actor[]=[
 {name:'Vozinha',role:'hero',st:VOZ_ST,key:true,keys:[[-12,...VZ],[12,...VZ]]},
 {name:'Moreira',role:'mate',st:capeVerde({number:22,build:{height:1.75},seed:22}),key:true,keys:[[-12,-14,12],[0,-13,11],[3.2,VZ[0]-1.3,VZ[1]+1.2],[12,VZ[0]-1.3,VZ[1]+1.2]]},
 {name:'Pico',role:'mate',st:capeVerde({number:4,build:{height:1.9},seed:4}),key:true,keys:[[-12,-12,-2],[0,-11,-1.5],[2.4,VZ[0]-1.4,VZ[1]-.6],[12,VZ[0]-1.4,VZ[1]-.6]]},
 {name:'Diney',role:'mate',st:capeVerde({number:3,build:{height:1.88},seed:3}),key:true,keys:[[-12,-15,-9],[0,-14,-8],[3,VZ[0]-.4,VZ[1]-1.4],[12,VZ[0]-.4,VZ[1]-1.4]]},
 {name:'Kevin Pina',role:'mate',st:capeVerde({number:6,build:{height:1.83},seed:6}),keys:[[-12,-26,4],[0,-25,3],[4.6,VZ[0]-2.4,VZ[1]+.3],[12,VZ[0]-2.4,VZ[1]+.3]]},
 {name:'Ryan Mendes',role:'mate',st:capeVerde({number:20,build:{height:1.75},seed:20}),key:true,keys:[[-12,-33,-6],[0,-32,-5],[5.2,VZ[0]+.8,VZ[1]+1.3],[12,VZ[0]+.8,VZ[1]+1.3]]},
 {name:'Laporte',role:'opp',st:spain({number:14,build:{height:1.89},seed:14}),keys:[[-12,-22,-3],[0,-21,-2.5],[12,-19,-1]]},
 {name:'Pedri',role:'opp',st:spain({number:20,build:{height:1.74},seed:20}),keys:[[-12,-18,8],[0,-17.5,7.5],[12,-16,6]]},
 {name:'Lamine Yamal',role:'opp',st:spain({number:19,skin:SKIN_M,build:{height:1.8},seed:19}),keys:[[-12,-15,15],[0,-14.5,14],[12,-13,12]]},
 {name:'Oyarzabal',role:'opp',st:spain({number:21,build:{height:1.81},seed:21}),keys:[[-12,-9,-6],[0,-9,-5.5],[12,-10,-4]]},
 {name:'Nico Williams',role:'opp',st:spain({number:17,skin:SKIN_D,build:{height:1.81},seed:17}),keys:[[-12,-20,-14],[0,-19.5,-13],[12,-18,-11]]},
];
/** chapters 2–4, the demonstration (τ = seconds after shot A) */
const DEMO_ACTORS:Actor[]=[
 {name:'Vozinha',role:'hero',st:VOZ_ST,key:true,keys:[...kKeys(0),[2.5,KX,0],...kKeys(S2)]},
 {name:'Striker',role:'bib',st:BIB,key:true,keys:[[-12,-17,-5],[-3,-16,-4.2],[-1.1,-13.2,-2.4],[0,...SA0],[.8,SA0[0]+1.2,SA0[1]+.2],[3,SA0[0]-2,SA0[1]-3],[12,SA0[0]-4,SA0[1]-6]]},
 {name:'Striker 2',role:'bib',st:{...BIB,shirt:[R,.8],seed:89,build:{height:1.84}},key:true,keys:[[-12,-19,5],[S2-3,-18,4.4],[S2-1.1,-14.2,2.9],[S2,...SB0],[S2+.8,SB0[0]+1.2,SB0[1]-.2],[12,SB0[0]+1.4,SB0[1]-.3]]},
];
let ACTORS:Actor[]=DEMO_ACTORS;
const HERO=0;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-12,T1=14,DT=.02;
const tables=(list:Actor[])=>list.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const TAB_MATCH=tables(MATCH_ACTORS),TAB_DEMO=tables(DEMO_ACTORS);
let TABLES=TAB_DEMO;
/** switch worlds: every scene calls this first */
function setMode(m:Mode){MODE=m;ACTORS=m==='match'?MATCH_ACTORS:DEMO_ACTORS;TABLES=m==='match'?TAB_MATCH:TAB_DEMO;}
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- the ball (demo): shot A low to his left, parried wide; shot B high to his right, pushed round the post
const loft=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];
const PA:V3=[-2.6,.11,6.4],PB0:V3=[1.2,2.5,-4.9],PB1:V3=[2.6,.11,-6.6];
const MATCH_BALL:V3=[-52.5,.11,0];
function ballAt(tau:number):V3{
 if(MODE==='match')return MATCH_BALL;
 if(tau<S2-3){
  if(tau<0)return BA;
  if(tau<TA)return loft(BA,HA,tau/TA,.12);
  const u=clamp((tau-TA)/.9);return loft(HA,PA,u,.9);}
 if(tau<S2)return BB;
 if(tau<S2+TB)return loft(BB,HB,(tau-S2)/TB,.35);
 if(tau<S2+TB+.5)return loft(HB,PB0,(tau-S2-TB)/.5,.35);
 const u=clamp((tau-S2-TB-.5)/.6);return[lerp(PB0[0],PB1[0],u),lerp(PB0[1],PB1[1],u*u),lerp(PB0[2],PB1[2],u)];
}
const spinAt=(tau:number)=>TAU*3*tau;
const bulgeAt=(_tau:number)=>0;

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** on his knees in tears, head down, gloves to his face */
const KNEEL=posed({lHipF:0,rHipF:0,lKnee:118,rKnee:118,lAnk:30,rAnk:30,lean:34,neckP:36,lShF:118,rShF:118,lShA:14,rShA:14,lElb:148,rElb:148});
/** teammates hugging him: arms forward and round, leaning in */
const HUG:Partial<Pose>={lShF:78,rShF:78,lShA:36,rShA:36,lElb:70,rElb:70,lean:34,neckP:20};
/** Spain at the whistle: hands on hips, still */
const HIPS:Partial<Pose>={lShA:34,rShA:34,lShF:-10,rShF:-10,lElb:118,rElb:118,neckP:6};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 const idle=a.role==='opp'?READY:stand();
 let p:Pose;
 {const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(MODE==='match'){
  if(k===HERO){p=blendPose(stand(),KNEEL,sm(-.2,.8,tau));yaw=yawTo(x,z,x-8,z+1);}
  if(a.role==='mate'&&sp<1.2){p=over(p,HUG,sm(0,.6,sp<1.2?1:0)*clamp(1-sp));yaw=yawTo(x,z,VZ[0],VZ[1]);}
  if(a.role==='opp'){p=over(p,HIPS,.9);yaw=yawTo(x,z,x+3,z*.5);}
  return{p,yaw};}
 if(k===HERO)return{p:keeperPose(tau),yaw:GK_YAW};
 if(a.role==='bib'){const t0=k===1?0:S2,yT=k===1?YAW_A:YAW_B,u=(tau-t0-S_ST)/SD;
  if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.9}),w);yaw=lerpAng(yaw,yT,sm(-.25,.05,tau-t0));}
  if(sp<.6&&Math.abs(tau-t0)>1.3)yaw=yawTo(x,z,0,0);}
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
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** the shot's path from the strike to τ */
function shotPath(s:Sheet,c:Cam,t0:number,t1:number,tau:number,w:number){if(w<=.02||tau<=t0)return;const pts:Pt[]=[];for(let i=0;i<=20;i++){const p=pr(c,ballAt(lerp(t0,Math.min(tau,t1),i/20)));if(p)pts.push(p);}if(pts.length<3)return;
 const wd=Math.max(6,kAt(c,ballAt(Math.min(tau,t1)))*.12);s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.7*w);s.fill(Y,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
function spark(s:Sheet,c:Cam,P:V3,t:number,t0:number,ink=Y,seed=61){const a=t-t0;if(a<-.08||a>.5)return;const q=pr(c,P);if(!q)return;sparkBurst(s,ink,q[0],q[1],Math.max(44,kAt(c,P)*.5),{n:9,seed,g:easeOutBack(clamp((a+.08)/.14))*(1-clamp((a-.28)/.22)),width:Math.max(4,kAt(c,P)*.05)});}
/** "small, quick steps": a yellow dab under each boot while he shuffles */
function steps(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;const[x,z]=posOf(HERO,tau),sk=solve(keeperPose(tau),VOZ_B,{x,z,yaw:GK_YAW});for(const f of [sk.lToe,sk.rToe])ring(s,c,[f[0],0,f[2]],.18,w,Y,53);}
/** "on his toes": a red ring under each forefoot */
function toes(s:Sheet,c:Cam,tau:number,w:number,ink=R){if(w<=.02)return;const[x,z]=posOf(HERO,tau),sk=solve(keeperPose(tau),VOZ_B,{x,z,yaw:GK_YAW});for(const f of [sk.lToe,sk.rToe])ring(s,c,[f[0],0,f[2]],.22,w,ink,54);}
/** "spring either way": two yellow arrows from his feet along the line, left and right */
function eitherWay(s:Sheet,c:Cam,w:number){if(w<=.02)return;for(const d of [1,-1]){const pts:V3[]=[];for(let i=0;i<=6;i++)pts.push([KX-.6,.3,d*(.5+2.8*w*i/6)]);arrow3(s,c,pts,Math.max(8,kAt(c,[KX,0,0])*.16),Y,.95);}}

// ---------------------------------------------------------------- 1 · LIVE: Atlanta, the final whistle at 0–0 (confirmed things only)
const tau1=(t:number)=>t-CUE(0,'nil-nil');
function cam1(t:number):Cam{
 const tau=tau1(t),vz:V3=[VZ[0],1,VZ[1]];
 return plan(t,[
  [0,0,()=>({P:[-40,30,70],T:[-30,4,0],fov:34})],
  [CUE(0,'Spain against')-.2,1.2,()=>({P:[-34,22,56],T:[-15,1,4],fov:24})],
  [CUE(0,'Vozinha')-.3,1,()=>({P:[-20,9,26],T:add3(vz,[0,.2,0]),fov:13})],
  [CUE(0,'seven')-.1,.8,()=>({P:[-20,9,26],T:add3(vz,[.3,1.2,0]),fov:17})],
  [CUE(0,'his teammates')-.2,1.4,()=>({P:[-16,6,20],T:add3(vz,[-1.2,.1,.3]),fov:15})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  setMode('match');frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tV=CUE(0,'Vozinha'),tS=CUE(0,'seven'),tN=CUE(0,'nil-nil');
  stadium(s,c,t,{roar:sm(tN,tN+.5,t),flash:sm(tN,tN+.3,t)*(1-sm(tN+3,tN+4,t))});
  ground(s,c);
  ring(s,c,[VZ[0],0,VZ[1]],1,sm(tV-.1,tV+.3,t,easeOutBack)*(1-sm(tN+1,tN+1.5,t)),Y,44);
  play(s,c,tau,tp,tpp,{minBall:10,hero:'mid'});
  // "seven saves": seven footballs pop one by one in an arc over his head
  const n=Math.floor(clamp((t-tS)/.16,0,7)),fade=1-sm(tN-.2,tN+.3,t);
  if(fade>0)for(let i=0;i<n;i++){const a=Math.PI*(.15+.7*i/6),P:V3=[VZ[0]-Math.cos(a)*1.9*.3,1.9+Math.sin(a)*1.1,VZ[1]+Math.cos(a)*1.9],q=pr(c,P);if(q){const r=Math.max(10,kAt(c,P)*.2)*fade*easeOutBack(clamp((t-tS-i*.16)/.2));footballPanels(s,q[0],q[1],r,{rot:i,key:K,shadow:B,seed:5});}}
 },
 aperture(t){const c=cam1(t),q=pr(c,[VZ[0],1,VZ[1]])??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:0,
};
ch1.still=CUE(0,'his teammates')+1.2;

// ---------------------------------------------------------------- 2 · HOW HE DOES IT (demonstration, real time, a low camera beside the goal)
const tau2=(t:number)=>key(t,mono([[0,-4.4],[CUE(1,'striker'),-3.3],[CUE(1,'small'),-2.7],[CUE(1,'Just before'),-.75],[CUE(1,'balanced'),-.3],[CUE(1,'springs'),.1],[SECS(1),1.5]]),linear);
function cam2(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-6,1.1,8],T:[-1.4,.55,.3],fov:38})],
  [CUE(1,'Just before')-.2,.9,()=>({P:[-7,1.6,9],T:[-4,.7,0],fov:50})],
  [CUE(1,'springs')-.2,.6,()=>({P:[-5,1.5,8.5],T:[-.8,.7,1.4],fov:42})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  setMode('demo');frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tQ=CUE(1,'small'),tJ=CUE(1,'Just before'),tB=CUE(1,'balanced'),tSp=CUE(1,'springs');
  stadium(s,c,t);ground(s,c);
  steps(s,c,tau,sm(tQ-.1,tQ+.3,t)*(1-sm(tJ,tJ+.3,t)));
  ring(s,c,BA,.6,sm(tJ-.1,tJ+.3,t,easeOutBack)*(1-sm(tSp,tSp+.4,t)),R,55);
  toes(s,c,tau,sm(tB-.1,tB+.3,t)*(1-sm(tSp,tSp+.3,t)));
  shotPath(s,c,0,TA,tau,sm(-.02,.05,tau)*(1-sm(SECS(1)-.9,SECS(1)-.6,t)));
  play(s,c,tau,tp,tpp,{minBall:12,lines:true,prevT:tau2(t-.06),smear:true});
  spark(s,c,HA,tau,TA,Y,61);
 },
 aperture(t){const c=cam2(t),q=pr(c,HA)??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch2.still=CUE(1,'balanced')+.2;

// ---------------------------------------------------------------- 3 · WATCH AGAIN (slow replay from behind the goal: low left, then high right)
const tau3=(t:number)=>{const tl=CUE(2,'Low'),th=CUE(2,'High');return key(t,mono([[0,-1.5],[CUE(2,'Feet set'),-.5],[CUE(2,'weight'),-.2],[tl,TA],[th-.55,TA+.6],[th-.5,S2-.35],[th,S2+TB],[CUE(2,'saved again'),S2+TB+.4],[SECS(2),S2+1.2]]),linear);};
function cam3v(t:number):Cam{
 const th=CUE(2,'High');
 return plan(t,[
  [0,0,()=>({P:[6.5,1.9,-1.8],T:[-9,.7,.4],fov:36})],
  [th-.52,.02,()=>({P:[6.5,1.9,1.8],T:[-9,.9,-.4],fov:36})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  setMode('demo');frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tF=CUE(2,'Feet set'),tW=CUE(2,'weight'),tl=CUE(2,'Low'),th=CUE(2,'High'),tg=CUE(2,'saved again');
  stadium(s,c,t);ground(s,c);
  toes(s,c,tau,sm(tF-.1,tF+.3,t)*(1-sm(tl-.2,tl,t)),R);
  // "weight forward": a small arrow forward from his chest
  const wf=sm(tW-.1,tW+.3,t)*(1-sm(tl-.1,tl+.1,t));if(wf>.02){const sk=keeperAt(tau);arrow3(s,c,[sk.chest,add3(sk.chest,[-.9*wf,-.1,0])],Math.max(5,kAt(c,sk.chest)*.07),Y,.95);}
  if(tau<S2-2)shotPath(s,c,0,TA,tau,sm(-.02,.05,tau)*(1-sm(th-.6,th-.5,t)));else shotPath(s,c,S2,S2+TB,tau,sm(S2-.02,S2+.05,tau));
  play(s,c,tau,tp,tpp,{minBall:12,smear:true});
  spark(s,c,HA,t,tl,Y,61);spark(s,c,HB,t,th,Y,62);
  const sa=sm(tg-.05,tg+.3,t);if(sa>0){const q=pr(c,add3(HB,[0,.4,0]));if(q)sparkBurst(s,Y,q[0],q[1],90+120*sa,{n:10,seed:9,g:easeOutBack(sa),width:12});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.1))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'Low')+.1;

// ---------------------------------------------------------------- 4 · YOUR TURN (side-on: on your toes → set your feet → before the shot → spring either way)
const tau4=(t:number)=>key(t,mono([[0,S2-3.1],[CUE(3,'on your'),S2-1.6],[CUE(3,'set your'),S2-.45],[CUE(3,'before'),S2-.02],[CUE(3,'spring'),S2+.5],[SECS(3),S2+1.6]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-3.5,1.2,-6],T:[-2.2,.7,0],fov:44})],
  [CUE(3,'before')-.3,.8,()=>({P:[-6,1.8,-9],T:[-5,.8,0],fov:52})],
  [CUE(3,'spring')-.1,.8,()=>({P:[-3,1.3,-7],T:[-1,.8,0],fov:50})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  setMode('demo');frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tO=CUE(3,'on your'),tS=CUE(3,'set your'),tB=CUE(3,'before'),tE=CUE(3,'spring'),E=SECS(3);
  stadium(s,c,t);ground(s,c);
  steps(s,c,tau,sm(tO-.1,tO+.3,t)*(1-sm(tS,tS+.3,t)));
  toes(s,c,tau,sm(tS-.1,tS+.3,t)*(1-sm(tE,tE+.3,t)));
  ring(s,c,BB,.6,sm(tB-.1,tB+.25,t,easeOutBack)*(1-sm(tE+.3,tE+.7,t)),R,55);
  shotPath(s,c,S2,S2+TB,tau,sm(S2-.02,S2+.05,tau));
  play(s,c,tau,tp,tpp,{minBall:14,smear:true});
  eitherWay(s,c,sm(tE-.1,tE+.5,t)*(1-sm(E-.8,E-.4,t)));
  spark(s,c,BB,tau,S2,R,63);
 },
 still:0,
};
ch4.still=CUE(3,'set your')+.2;

/** facts the test reads back */
export const FACTS={S2,TA,TB,HA,HB,BA,BB,KX,ballAt,keeperAt,setMode,posOf,keeperPose};

const film:RisoStory={
 id:'vozinha-signature',format:'11v11',title:'Vozinha: set your feet, spring either way',
 theme:'Signature move (a demonstration, not a match recreation): stay on your toes and set your feet before the shot, so you can spring either way',
 ageNote:'Chapter 1: Spain 0–0 Cape Verde, FIFA World Cup 2026, Mercedes-Benz Stadium, Atlanta, 15 June 2026 (confirmed moments only). Chapters 2–4: a labelled demonstration. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a save — a glove-white burst where you tap and the ball bounces away. Reduced motion: the still burst. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  if(age<.4)sparkBurst(s,Y,x,y,90,{n:9,seed,g:age<=0?1:1-clamp(age/.4),width:10});
  const e:Pt=[x-160*u,y-120*Math.sin(Math.PI*u*.8)];
  footballPanels(s,e[0],e[1],28*fade+2,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
