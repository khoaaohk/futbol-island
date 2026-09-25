/** Kristine Lilly v China, FIFA Women's World Cup final, Rose Bowl, Pasadena, 10 July 1999 (0–0 after extra time, USA won the shootout
 * 5–4): the goal-line header. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot
 * watch the footage), printed as a riso sheet. A DEFENSIVE moment: the goal we look at is the USA's own (X = 105), China attack it.
 *
 * SOURCES (what the choreography and kits follow):
 *  - Steve Almasy, CNN/SI, "Women's World Cup – Closer Look: Wily Lilly uses her head" (11 July 1999), archived:
 *    https://web.archive.org/web/20041001041616/http://sportsillustrated.cnn.com/soccer/world/1999/womens_worldcup/news/1999/07/10/closer_look/
 *  - Los Angeles Times match report, 11 July 1999: https://www.latimes.com/archives/la-xpm-1999-jul-11-sp-55047-story.html
 *  - Wikipedia, "1999 FIFA Women's World Cup final" (line-ups with shirt numbers, attendance, referee, shootout order, the kit panels)
 *    https://en.wikipedia.org/wiki/1999_FIFA_Women%27s_World_Cup_final
 *  - Wikipedia, "Kristine Lilly" (on the goal line, the golden-goal rule, her shootout goal): https://en.wikipedia.org/wiki/Kristine_Lilly
 * CONFIRMED by those accounts: 10 July 1999, Rose Bowl, Pasadena, crowd 90,185, a sun-baked afternoon (12:50 kick-off); 0–0 after 120
 * minutes; golden-goal extra time, so a goal would have ended the final; the chance came from a China CORNER 9:48 into the first period of
 * extra time (≈ the 100th minute); Chinese defender Fan Yunjie (No. 3; FIFA's sheet: "shot by No. 3 … blocked") hit a "vicious header that
 * soared past" keeper Briana Scurry (No. 1); Lilly (No. 13, 5 ft 4 in, left-footed) was "stationed on the post to Scurry's right": "I ran
 * over to the post for the kick … when the Chinese player hit the corner, I shifted to help make Bri's goal smaller. She headed it right at
 * me; I had to head it" — she "stepped into the ball and headed it out of danger", off the line. Shootout: Xie Huilin, Qiu Haiyan score;
 * Scurry saves from Liu Ying; Overbeck, Fawcett, Lilly, Hamm score; Zhang Ouying, Sun Wen score; Brandi Chastain's fifth penalty wins it
 * 5–4. KITS (Wikipedia kit panels): USA all white (white shirts with a dark-red collar and sleeve hoops, white shorts, white socks); China
 * all red (red shirts and shorts, red socks with white tops). The crowd was "filled with patriotic faces" (CNN/SI).
 * INFERRED (illustrative): which corner (here the one on the main-stand side, so Lilly's post — Scurry's right — is the FAR post); the
 * corner taker (not named in the accounts), her run-up and right foot, the ball's flight and swing; where every other player stood and who
 * marked whom (the other US players are unnumbered on purpose); Fan's run and leap; Scurry's position and her dive; the exact header
 * heights; the direction of Lilly's clearance and where it landed; everyone's hair (Lilly's ponytail, a common look for her then);
 * Scurry's goalkeeper kit colours; the Rose Bowl's shape as drawn (one open bowl, no roof), the crowd colours, the mountains beyond the rim,
 * the ad boards, the camera placements and lenses.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high main-stand camera in real
 * time: the corner, the header, cleared off the line; 2 = slow-motion replay from behind the goal (Lilly's back, No. 13): she guards the
 * post and shifts across as the corner comes in; 3 = slow-motion replay low along the goal line: the header flies past Scurry, Lilly heads
 * it clear, then the crowd (the shootout win); 4 = the lesson from behind the penalty spot, the USA goal at the top of the frame: a
 * ring on her post, "alert" ticks, the eyes-on-the-ball sightline, the header and the clearance arrows. All figures are the shared riso
 * athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue times,
 * so the recorded voice (withTiming) re-times the film; every random value is seeded.
 *
 * LEAD: when public/plays/narration/lilly-goalline-1999/timing.json exists, replace the null in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/lilly-goalline-1999/timing.json';  (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,backpedal,strike,header,keeperSet,keeperDive,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The corner, live',text:'Pasadena, 1999. The World Cup final, USA against China. Extra time, and no goals. China take a corner... a header! Cleared off the line by Kristine Lilly!',seconds:12.6,
  cues:[[.2,'Pasadena'],[1.6,'The World Cup final'],[3,'USA against China'],[4.6,'Extra time'],[5.6,'and no goals'],[7,'China take a corner'],[8.6,'a header'],[9.5,'Cleared off the line'],[10.9,'Kristine Lilly']]},
 {label:'Watch again',text:'Watch again, slowly. Lilly guards the post. As the corner comes in, she steps across to make the goal smaller.',seconds:8.8,
  cues:[[.15,'Watch again'],[1.7,'Lilly guards the post'],[3.4,'As the corner comes in'],[5,'she steps across'],[6.3,'make the goal smaller']]},
 {label:'Eyes on the ball',text:'Fan Yunjie’s header flies past the keeper. Eyes on the ball, Lilly heads it clear! Later, Brandi Chastain’s penalty won the Cup.',seconds:10,
  cues:[[.15,'Fan Yunjie'],[1.4,'flies past the keeper'],[3.1,'Eyes on the ball'],[4.4,'Lilly heads it clear'],[6.6,'Brandi Chastain'],[8.2,'won the Cup']]},
 {label:'Your turn',text:'At corners, guard the post. Stay alert and keep your eyes on the ball: one header can save the game!',seconds:9,
  cues:[[.15,'At corners'],[1.1,'guard the post'],[2.4,'Stay alert'],[3.9,'eyes on the ball'],[5.5,'one header'],[6.7,'save the game']]},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py lilly-goalline-1999 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/lilly-goalline-1999/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lilly: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (China attack +X; the USA goal line at X = 105), Y up, Z across
 * (+34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so Scurry, facing the field (−X),
 * has her RIGHT at −Z: Lilly's post (Scurry's right, the accounts) is the post at Z = −3.66, the far post from the main camera. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const depth=(c:Cam,P:V3)=>toCam(c,P)[2];
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera */
function quadP(c:Cam,q:V3[],minDepth=12):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Rose Bowl: one open, sunlit bowl of seats, the mountains beyond the rim
const CX=52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.45),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.45)];}
const RAKE=(b:number):[number,number]=>[2+44*b,1.4+24*b];
type Bowl={seats:V3[][];wall:V3[][];top:V3[][];hills:V3[][];crowd:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seats:[],wall:[],top:[],hills:[],crowd:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seats.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.wall.push([rim(a,0,0),rim(b,0,0),rim(b,d0,y0),rim(a,d0,y0)]);
  o.top.push([rim(a,d1,y1),rim(b,d1,y1),rim(b,d1+.5,y1+2.4),rim(a,d1+.5,y1+2.4)]);
  const hA=34+26*hash(i,5)+18*Math.sin(a*2+1),hB=34+26*hash(i+1,5)+18*Math.sin(b*2+1);
  o.hills.push([rim(a,460,0),rim(b,460,0),rim(b,460,hB),rim(a,460,hA)]);
  for(let r=0;r<13;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.12)continue;const[d,y]=RAKE((r+.5)/13);o.crowd.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.45),h});}}
 return o;})();
/** everything behind the pitch: the sky, the hazy mountains, the bowl, the crowd (roar lifts the marks, flash = flag-waving sparkle) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.28);
 const hills=new Path2D();for(const q of BOWL.hills){const r=quadP(c,q,60);if(r)hills.addPath(polyPath(r,true));}s.tone(B,hills,.34);s.tone(K,hills,.12);
 const seats=new Path2D(),wall=new Path2D(),top=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=polyP(c,q);if(r.length>2)p.addPath(polyPath(r,true));};add(BOWL.seats[i],seats);add(BOWL.wall[i],wall);add(BOWL.top[i],top);}
 s.knockout(seats);s.tone(Y,seats,.18);s.tone(R,seats,.12);
 // the crowd: one mark per seat group; white shirts and hats (paper), red, blue (a patriotic crowd), a little yellow and navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.crowd){const d=toCam(c,q.P);if(d[2]<12)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.4?0:q.h<.62?1:q.h<.8?2:q.h<.9?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.85);s.fill(B,inks[2],.85);s.fill(Y,inks[3],.9);s.fill(K,inks[4],.75);
 s.knockout(wall);s.fill(K,wall,.55);s.knockout(top);s.fill(K,top,.3);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.crowd[Math.floor(hash(i*17+T12*101,3)*BOWL.crowd.length)],d=toCam(c,q.P);if(d[2]<12)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the grass surround, the pitch (yellow × blue) with mowing stripes, ad boards, paper lines, the far goal and the corner flags */
function ground(s:Sheet,c:Cam){
 const sur=polyP(c,[[-10,0,-41],[115,0,-41],[115,0,41],[-10,0,41]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.85);s.tone(B,p,.7);}
 const g=polyP(c,[[-3,0,-37],[108,0,-37],[108,0,37],[-3,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // ad boards: the far touchline and behind the goals (red, with paper panels)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-38.5],[110,0,-38.5],[110,.9,-38.5],[-4,.9,-38.5]]),polyP(c,[[110.5,0,-36],[110.5,0,36],[110.5,.9,36],[110.5,.9,-36]]),polyP(c,[[-5.5,0,36],[-5.5,0,-36],[-5.5,.9,-36],[-5.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-38.45],[x+3.4,.25,-38.45],[x+3.4,.65,-38.45],[x,.65,-38.45]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[110.45,.25,z],[110.45,.25,z+3.4],[110.45,.65,z+3.4],[110.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.9);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.1,0,TAU,6);}
 // corner arcs at the USA end
 circ(105,34,1,Math.PI,1.5*Math.PI,5);circ(105,-34,1,Math.PI/2,Math.PI,5);
 s.knockout(ln);
 goal3(s,c,0,-1);
 // corner flags (navy poles, red flags) at the USA end
 const pole=new Path2D(),flag=new Path2D();
 for(const z of [34,-34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);const a=pr(c,[105,1.55,z]),b=pr(c,[105,1.4,z-Math.sign(z)*.45]),e=pr(c,[105,1.2,z]);if(a&&b&&e)flag.addPath(polyPath([a,b,e],true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep. net = paper haze strength (lighter when the camera looks through it). */
const GOAL={x:105,z0:-3.66,z1:3.66,h:2.44};
function goal3(s:Sheet,c:Cam,X:number,d:number,net=.3){
 const z0=-3.66,z1=3.66,H=2.44,bx=X+d*2;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const n=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)n.addPath(polyPath(q,true));}
 s.knockout(n,net);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bx,1.9,z],.025,mesh);seg3(c,[bx,1.9,z],[bx,0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;seg3(c,[bx,y,z0],[bx,y,z1],.025,mesh);seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]],SKIN_E:InkFill[]=[[Y,.4],[R,.18]];
/** women footballers: athletic builds, a touch slimmer through the shoulders; heights from the players' listed heights where known */
const W=(h:number,o:{bulk?:number;thighs?:number}={})=>({height:h,bulk:o.bulk??.93,thighs:o.thighs??1.06,head:1.02});
/** USA 1999: all white — white shirts (dark-red collar and sleeve hoops: the red trim), white shorts, white socks (confirmed kit panels) */
const USA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',numberInk:K,build:W(1.68),seed:5,...o});
/** Kristine Lilly: No. 13 (confirmed), 5 ft 4 in (1.63 m, confirmed), dark-brown ponytail (inferred) */
const LILLY:AthleteStyle=USA({number:13,hair:[K,.72],hairStyle:'ponytail',build:W(1.63,{bulk:.94,thighs:1.1}),seed:13});
/** Briana Scurry: No. 1 (confirmed); the goalkeeper kit colours are inferred (a dark shirt, navy shorts, yellow gloves) */
const SCURRY:AthleteStyle={shirt:[K,.8],trim:Y,shorts:[K,.9],socks:[K,.8],boots:K,skin:SKIN_D,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:[Y,.9],number:1,numberInk:'paper',build:W(1.73,{bulk:.98}),seed:1};
/** China 1999: all red (red socks with white tops; confirmed kit panels); paper numbers */
const CHN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:R,socks:R,boots:K,skin:SKIN_E,hair:K,hairStyle:'ponytail',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',build:W(1.66),seed:31,...o});
/** Fan Yunjie: No. 3 (confirmed); hair inferred */
const FAN:AthleteStyle=CHN({number:3,hairStyle:'short',build:W(1.7,{bulk:.97}),seed:3});

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: the ponytail and hem trail); smear = a halftone echo + speed lines for fast moves. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the play (T = play seconds, T = 0 = the corner is struck)
const FIG=1.06;// figures 6 % over life size so they read in a small card window
const T_HEAD=1.35,T_SAVE=1.75,T_LAND=3.0;
type Role='lilly'|'gk'|'taker'|'fan'|'usa'|'chn';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions are Hermite-interpolated between keys [T, X, Z]. Only Lilly, Scurry, Fan Yunjie and the taker have beats in the accounts
 * (the taker's identity is not); everyone else is an illustrative marker, unnamed and unnumbered. */
const ACTORS:Actor[]=[
 {name:'Lilly',role:'lilly',style:LILLY,key:true,keys:[[-9,104.8,-3.35],[-.2,104.8,-3.35],[.5,104.8,-3.22],[1.1,104.9,-2.98],[1.5,104.92,-2.94],[2.1,104.7,-2.95],[3,104.1,-3.3],[4.5,103,-4.3],[8,101,-6]]},
 {name:'Scurry',role:'gk',style:SCURRY,key:true,keys:[[-9,104.3,1.3],[-.2,104.3,1.2],[.9,104.25,.7],[1.2,104.22,.6],[8,104.22,.6]]},
 {name:'taker',role:'taker',style:CHN({seed:37,hairStyle:'ponytail',hair:[K,.9]}),key:true,keys:[[-9,102.6,36.4],[-2.2,102.7,36.3],[-1.3,102.9,36.2],[0,104.02,34.08],[.5,104.2,33.7],[2.5,103.2,32],[8,100.5,28]]},
 {name:'Fan',role:'fan',style:FAN,key:true,keys:[[-9,93.8,6.6],[-1.2,94.3,5.6],[0,95.2,4.3],[.8,97.3,2],[1.15,98.4,1.05],[1.45,98.8,.75],[2.2,99.1,.55],[4,98.6,1.1],[8,97,3]]},
 {name:'marker-fan',role:'usa',style:USA({seed:41,hair:[K,.45]}),keys:[[-9,94.4,5.8],[-1.2,94.8,5],[0,95.5,4.4],[.8,97.1,2.6],[1.2,98,1.7],[1.6,98.3,1.4],[3,97.8,1.9],[8,96,3]]},
 {name:'chn2',role:'chn',style:CHN({seed:32,hairStyle:'short'}),keys:[[-9,97.4,-1],[-1,97.7,-1.4],[.9,99.6,-2.4],[1.8,100.1,-2.7],[3.2,99,-4.6],[8,96,-8]]},
 {name:'usa2',role:'usa',style:USA({seed:42,hair:[Y,.8]}),keys:[[-9,97,-.2],[-1,97.3,-.7],[.9,99.1,-1.8],[1.8,99.5,-2.1],[3.2,98.3,-4.8],[8,95.5,-9]]},
 {name:'chn3',role:'chn',style:CHN({seed:33}),keys:[[-9,101.3,3.8],[0,101.5,3.4],[1,102.2,2.4],[2,102.2,2.2],[5,101,3],[8,99.5,4]]},
 {name:'usa3',role:'usa',style:USA({seed:43,hairStyle:'short',hair:[K,.8]}),keys:[[-9,104.7,3.35],[0,104.7,3.35],[1.4,104.5,3],[3,103.8,2.4],[8,102.5,3.5]]},
 {name:'chn4',role:'chn',style:CHN({seed:34,hairStyle:'short'}),keys:[[-9,92,-6.2],[0,92.4,-5.8],[1.3,94.8,-4.4],[2.3,95.2,-6.8],[3.2,94.6,-9.8],[4.2,93.4,-11.8],[8,91,-14]]},
 {name:'usa4',role:'usa',style:USA({seed:44,hair:[Y,.65]}),keys:[[-9,92.8,-5.2],[0,93.1,-5],[1.3,95.2,-5.1],[2.3,95.6,-7.8],[3.3,94.8,-11],[4.3,93.6,-12.7],[5.5,92.4,-14],[8,89.5,-16.5]]},
 {name:'chn5',role:'chn',style:CHN({seed:35}),keys:[[-9,86.5,1.5],[0,87,1],[3,88.2,-5],[8,88.5,-11]]},
 {name:'usa5',role:'usa',style:USA({seed:45,hairStyle:'short'}),keys:[[-9,88.4,4.2],[0,88.6,3.6],[3,89.2,-2],[8,90,-8]]},
 {name:'usa6',role:'usa',style:USA({seed:46,hair:[K,.85]}),keys:[[-9,99.6,5.6],[0,99.8,5.4],[1.2,100.6,4.6],[3,100,4],[8,98.5,5]]},
];
const LILLY_I=0,SCURRY_I=1,TAKER_I=2,FAN_I=3;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-9,T1=8,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posRaw=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posRaw(k,T-.08),b=posRaw(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** a defender's alert ready stance at a set piece: knees bent, weight forward on the balls of the feet, arms out to feel for the runner */
const READY=posed({lHipF:36,rHipF:32,lKnee:48,rKnee:44,lHipA:12,rHipA:12,lAnk:-8,rAnk:-8,lean:18,pitch:5,lShA:30,rShA:30,lShF:16,rShF:16,lElb:50,rElb:50,neckP:-10});
/** Lilly on the line: the same ready stance, a hand resting toward the post (inferred), eyes up at the corner */
const POST:Partial<Pose>={lShA:48,lShF:28,lElb:30,lHand:1};
/** the taker is shifted so her solved right boot meets the ball at the kick (like the Banks cross) */
const BALL0:V3=[104.55,.11,33.55];
const takerYaw=yawOf(99-104.55,1-33.55);
/** Lilly watches the ball all the way: the corner, then Fan's header coming at her; at contact she turns halfway toward where she sends it */
const lillyYaw=(T:number)=>{const[x,z]=posRaw(LILLY_I,T),b=ballAt(Math.min(T,T_HEAD-.05)),a0=yawOf(b[0]-x,b[2]-z),a1=yawOf(FAN_PT[0]-x,FAN_PT[2]-z),a2=lerpA(a1,yawOf(LAND[0]-x,LAND[2]-z),.4);
 return lerpA(lerpA(a0,a1,sm(T_HEAD-.35,T_HEAD,T)),a2,sm(T_HEAD+.1,T_SAVE,T));};
let _takerShift:[number,number]|null=null;
function takerShift():[number,number]{if(_takerShift)return _takerShift;const[x,z]=posRaw(TAKER_I,0),sk=solve(strike(STRIKE_CONTACT),ACTORS[TAKER_I].style.build,{x,z,yaw:takerYaw},FIG);return _takerShift=[BALL0[0]-sk.rToe[0],BALL0[2]-sk.rToe[2]];}
/** a position with the taker's contact nudge applied */
function posOf(k:number,T:number):[number,number]{const p=posRaw(k,T);if(k!==TAKER_I)return p;const d=takerShift(),w=sm(-.9,-.3,T)*(1-sm(.5,1.2,T));return[p[0]+d[0]*w,p[1]+d[1]*w];}
/** Fan Yunjie's leaping header: contact (header's .52) at T_HEAD, the move lasting 1.15 s */
const fanHead=(T:number)=>{const hp=header(clamp((T-T_HEAD)/1.15+.52));hp.air*=1.1;return hp;};
/** Lilly's header: a short step-up (she barely leaves the ground) into the ball at T_SAVE, neck snapping forward */
const lillyHead=(T:number)=>{const u=clamp((T-T_SAVE)/.95+.52),hp=header(u);hp.air*=.28;hp.lean*=.45;hp.pitch*=.4;hp.dx=.08*sm(.3,.52,u);return hp;};
const SCURRY_DIVE=(T:number)=>keeperDive(clamp((T-1.2)/.8),{side:'r',height:.62});
/** the whole pose of actor k at T, with its yaw */
function poseOf(k:number,T:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,T),b=ballAt(T);
 let yaw=sp>.9?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(T*1.3):a.role==='taker'?stand():T<T_SAVE+.3?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,T)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='taker'){yaw=T<-1.3?yawOf(BALL0[0]-x,BALL0[2]-z):lerpA(yawOf(v[0],v[1]),takerYaw,sm(-.6,-.1,T));const u=(T+STRIKE_CONTACT*1.0)/1.0;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u)),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(a.role==='fan'){if(T>.9)yaw=lerpA(yaw,yawOf(104.7-x,-3-z),sm(.9,1.2,T));const w=sm(.62,.78,T)*(1-sm(2.3,2.8,T));if(w>0)p=blendPose(p,fanHead(T),w);}
 if(a.name==='marker-fan'){const w=sm(.72,.88,T)*(1-sm(2.1,2.6,T));if(w>0){const hp=header(clamp((T-T_HEAD-.05)/1.15+.52));hp.air*=.55;p=blendPose(p,hp,w);}}
 if(a.role==='gk'){yaw=Math.PI;if(T>1.2)p=blendPose(SCURRY_DIVE(T),keeperSet(T*1.3),sm(3.4,4.6,T,easeInOutSine));}
 if(a.role==='lilly'){yaw=T<T_SAVE+.2?lillyYaw(T):lerpA(lillyYaw(T_SAVE+.2),yawOf(-1,-.9),sm(T_SAVE+.3,T_SAVE+1.2,T));
  p=over(READY,POST,1-sm(-.1,.6,T));// "I shifted": off the post hand, a side-step toward the middle, still on the line
  if(T>.2&&T<1.2)p=over(p,{lHipA:22,rHipA:6,bend:-4},bump(.2,1.2,T));
  const w=sm(1.08,1.25,T)*(1-sm(2.6,3.1,T));if(w>0)p=blendPose(p,lillyHead(T),w);
  if(T>2.6)p=blendPose(p,runCycle(distOf(k,T)/3.3,{speed:.2}),sm(2.6,3.2,T)*clamp((sp-.3)/.8));}
 return{p,yaw};
}

// ---------------------------------------------------------------- the contacts, solved from the bodies; the ball
/** Fan's forehead at the header (T_HEAD) and Lilly's forehead at the save (T_SAVE), a ball radius in front of the face */
function forehead(k:number,T:number):V3{const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T),sk=solve(p,ACTORS[k].style.build,{x,z,yaw},FIG),d=sub3(sk.face,sk.head),l=Math.hypot(d[0],d[1],d[2])||1;return[sk.face[0]+d[0]/l*.11,sk.face[1]+d[1]/l*.11+.02,sk.face[2]+d[2]/l*.11];}
// ballAt is referenced by poseOf (yaws) before the contacts exist: until they are solved, the ball rests on the corner spot
let FAN_PT:V3=[98.9,2.2,.7],LILLY_PT:V3=[104.6,1.6,-2.95],SOLVED=false;
const LAND:V3=[95.2,.11,-10.4],HOP1:V3=[94,.11,-11.7],HOP2:V3=[93.5,.11,-12.4];
/** the ball at play time T: on the corner spot, the corner (a swinging flight), Fan's header across goal past Scurry, Lilly's header up and
 * out, the bounces at the edge of the box, then at a US defender's feet as she carries it away */
function ballAt(T:number):V3{
 if(T<0||!SOLVED)return BALL0;
 if(T<T_HEAD){const u=T/T_HEAD,p=lerp3(BALL0,FAN_PT,u,4.2);p[0]-=1.1*Math.sin(Math.PI*u);return p;}
 if(T<T_SAVE)return lerp3(FAN_PT,LILLY_PT,(T-T_HEAD)/(T_SAVE-T_HEAD),.1);
 if(T<T_LAND)return lerp3(LILLY_PT,LAND,sm(T_SAVE,T_LAND,T,u=>u*(1.25-.25*u)),3.4);
 if(T<3.5)return lerp3(LAND,HOP1,(T-T_LAND)/.5,.7);
 if(T<3.85)return lerp3(HOP1,HOP2,(T-3.5)/.35,.2);
 const k=10,[x,z]=posOf(k,T),v=velOf(k,T),s=Math.hypot(v[0],v[1])||1,w=sm(3.85,4.4,T),foot:V3=[x+v[0]/s*.55,.11,z+v[1]/s*.55];
 return lerp3(HOP2,foot,w);
}
FAN_PT=forehead(FAN_I,T_HEAD);SOLVED=true;LILLY_PT=forehead(LILLY_I,T_SAVE);

// ---------------------------------------------------------------- the ball print
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:3});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={bg:Pt|null;br:number;lilly?:DrawResult;fan?:DrawResult};
/** everything on the pitch at T (positions on ones, poses on twos at Tp; Tprev = the drawing before, for secondary motion); the goal is
 * printed in depth order with the players (through its net when the camera is behind it) */
function play(s:Sheet,c:Cam,v:View,T:number,Tp:number,Tprev:number,o:{minBall?:number;near?:number;hero?:boolean;after?:(r:PlayOut)=>void;ghost?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,T),q=toCam(c,[x,.9,z]);if(q[2]<(o.near??3.5))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(T),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<380)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg){const hgt=b[1];sh.addPath(polyPath(blob(bground[0],bground[1],br*.9/(1+hgt*.3),br*.28/(1+hgt*.3),2,{amp:.05,n:12}),true));}s.tone(K,sh,.4);
 const out:PlayOut={bg,br};
 type It={d:number;draw:()=>void};const items:It[]=[];
 const behind=c.C[0]>GOAL.x+.5;
 items.push({d:behind?-1:depth(c,[106,1.2,0]),draw:()=>goal3(s,c,105,1,behind?.16:.3)});
 if(bg)items.push({d:bq[2],draw:()=>ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11)});
 for(const e of list)items.push({d:e.d,draw:()=>{
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,Tp),px=e.h*ppu,big=e.h>=260;
  // phone heat: low detail for small figures and extras; during a passage only Lilly keeps 'mid'
  const detail=passing?(e.k===LILLY_I?'mid':'low'):px<50||(!a.key&&px<170)?'low':'auto';
  const fast=(e.k===LILLY_I&&T>T_SAVE-.25&&T<T_SAVE+.35)||(e.k===FAN_I&&T>T_HEAD-.3&&T<T_HEAD+.3)||(e.k===SCURRY_I&&T>1.3&&T<1.9);
  const prv=big&&!passing?poseOf(e.k,Tprev):null;
  const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:e.h<380?false:undefined,detail},{x:e.x,z:e.z,yaw},prv?{prev:prv.p,prevPlace:{x:e.x,z:e.z,yaw:prv.yaw},smear:hero&&fast}:{});
  if(e.k===LILLY_I)out.lilly=r;if(e.k===FAN_I)out.fan=r;}});
 items.sort((p,q)=>q.d-p.d);
 o.ghost?.(out);
 for(const it of items)it.draw();
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a yellow ring on the grass round a point (a stamped spot), knocked out under */
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r,.01,z+Math.sin(i/36*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,c.F*.07/depth(c,[x,0,z])),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a flight path of the ball between play times a..b as a bold ribbon with an arrowhead (progress u) */
function flightArrow(s:Sheet,c:Cam,a:number,b:number,u:number,ink:string,wm=.12){if(u<=0)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=18;i++){const P=ballAt(lerp(a,b,i/18)),q=toCam(c,P);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=partial(smoothPts(pts,false,6,2),u),wd=Math.max(7,c.F*wm/d);if(line.length<2)return;
 s.knockout(ribbon(line,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(line,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const e=line[line.length-1],p0=line[Math.max(0,line.length-3)];if(Math.hypot(e[0]-p0[0],e[1]-p0[1])>1)laneArrow(s,ink,p0,[e[0]+(e[0]-p0[0])*.02,e[1]+(e[1]-p0[1])*.02],wd,{seed:62,head:wd*3});}
/** "eyes on the ball": a dotted yellow sightline from her eyes to the ball */
function sightline(s:Sheet,r:DrawResult|undefined,bg:Pt|null,w:number){if(!r||!bg||w<=0)return;const h=r.joints.face,n=r.joints.head,hs=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+6;
 const L=Math.hypot(bg[0]-h[0],bg[1]-h[1]);if(L<hs)return;const dots=new Path2D(),N=Math.max(3,Math.min(14,Math.floor(L/(hs*1.1))));
 for(let i=1;i<N;i++){const u=i/N;if(u>w)break;const x=lerp(h[0],bg[0],u),y=lerp(h[1],bg[1],u),rr=hs*.28;dots.addPath(polyPath(blob(x,y,rr,rr,i+5,{amp:.1,n:10}),true));}
 s.knockout(dots,.8);s.fill(Y,dots,.95);}
/** "stay alert": little yellow ticks sparking round her head */
function alertTicks(s:Sheet,r:DrawResult|undefined,w:number,t:number){if(!r||w<=0)return;const h=r.joints.head,n=r.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*2+6;
 const p=new Path2D();for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.42,pulse=1+.12*Math.sin(t*9+i),r0=u*1.25*pulse,r1=u*(1.25+.75*w)*pulse;p.addPath(ribbon([[h[0]+Math.cos(a)*r0,h[1]+Math.sin(a)*r0],[h[0]+Math.cos(a)*r1,h[1]+Math.sin(a)*r1]],u*.22,{seed:80+i,taper:.5,wobble:.3}));}
 s.knockout(p,.85*w);s.fill(Y,p,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** T from chapter-1 time: real time, the corner struck ~1.2 s before "a header" (so the header lands on the word, the clearance just after) */
const kick1=()=>CUEW(0,'a header')-1.25;
const tau1=(t:number)=>clamp(t-kick1(),T0,T1);
const CAM1:V3=[62,31,78];
function cam1(t:number):Cam{
 const T=tau1(t),ct=CUEW(0,'China take'),S=SECS(0);
 // open wide on the sunlit bowl, settle on the box, drift to the corner as she places the ball, then follow the ball into the box and out
 const wide:V3=[80,6,-10],box:V3=[99,1,4],corner:V3=[103.5,.5,26],b=ballAt(T),bt:V3=[lerp(b[0],101,.45),.5,lerp(b[2],0,.4)];
 const toBox=sm(1,ct-2.2,t,easeInOutSine),toCorner=sm(ct-2.4,ct-.8,t,easeInOutSine),follow=sm(-.15,.9,T,easeInOutSine);
 let tg=lerp3(wide,box,toBox);tg=lerp3(tg,corner,toCorner*(1-follow));tg=lerp3(tg,bt,follow);
 const F=key(t,[[0,2600],[ct-2.2,5600],[ct-.8,6600],[kick1()+.6,5600],[kick1()+2.1,6200],[S,5800]],easeInOutSine);
 return look(CAM1,tg,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),T=tau1(t),tp=tau1(twos(t)),cl=CUEW(0,'Cleared');
  stadium(s,c,v,t,{roar:sm(cl-.3,cl+.4,t)*(1-sm(SECS(0)-.6,SECS(0),t)*.4),flash:sm(cl-.2,cl+.3,t)*(1-sm(cl+2.4,cl+3,t))});
  ground(s,c);
  play(s,c,v,T,tp,tau1(twos(t)-1/12),{minBall:7});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(LILLY_I,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · slow replay from behind the goal: Lilly guards the post, shifts across
const tau2=(t:number)=>key(t,[[0,-1.1],[CUEW(1,'Lilly guards'),-.75],[CUEW(1,'As the corner'),-.15],[CUEW(1,'she steps'),.55],[CUEW(1,'make the goal'),.95],[SECS(1),1.2]],linear);
function cam2(t:number):Cam{
 const S=SECS(1),T=tau2(t),push=sm(CUEW(1,'Lilly guards')-.3,CUEW(1,'As the corner'),t,easeInOutSine),pan=sm(CUEW(1,'As the corner')-.2,CUEW(1,'she steps')+.3,t,easeInOutSine),back=sm(CUEW(1,'make the goal')-.3,S,t,easeInOutSine);
 const C:V3=[109.6-1.2*push+.8*back,3.4-.6*push+.4*back,-5.4+1*back],b=ballAt(T);
 const tg:V3=[lerp(103.4,lerp(104,b[0],.35),pan),lerp(.8,.85,pan),lerp(-2.4,lerp(-1.2,b[2]*.12,.5),pan)+back*1.2];
 return look(C,tg,lerp(1150,1350,push)-120*back);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),T=tau2(t),tp=tau2(twos(t)),lg=CUEW(1,'Lilly guards'),ac=CUEW(1,'As the corner'),st=CUEW(1,'she steps'),mg=CUEW(1,'make the goal'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  // "Lilly guards the post": a yellow ring on her spot, just inside the far post
  const[lx,lz]=posOf(LILLY_I,-1);groundRing(s,c,lx-.1,lz,.55,sm(lg-.1,lg+.35,t,easeOutBack)*(1-sm(st-.2,st+.2,t)));
  // "as the corner comes in": the flight so far, printed behind the ball
  play(s,c,v,T,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,ghost:()=>{flightArrow(s,c,0,Math.max(.01,Math.min(T,T_HEAD)),sm(ac-.1,ac+.4,t)*(1-sm(E-1,E-.6,t)),R,.09);},
   after:({lilly})=>{
   // "she steps across": an orange-red arrow on the grass from the post toward the middle of the goal
   const w=sm(st-.15,st+.45,t,easeOut)*(1-sm(E-1,E-.6,t));if(w>0){const a=pr(c,[104.8,.01,-3.45]),b2=pr(c,[104.8,.01,-2.4]);if(a&&b2){const wd=Math.max(6,c.F*.08/depth(c,[104.8,0,-3]));const e2:Pt=[lerp(a[0],b2[0],w),lerp(a[1],b2[1],w)];s.knockout(ribbon([a,e2],wd*2.2,{seed:70,taper:0,wobble:.6}),.85);laneArrow(s,Y,a,b2,wd,{progress:w,seed:71,head:wd*2.6});}}
   // "make the goal smaller": the gap she covers — two yellow brackets from her body to the post and to Scurry
   const g=sm(mg-.1,mg+.4,t,easeOutBack)*(1-sm(E-.9,E-.55,t));
   if(g>0&&lilly){const post=pr(c,[105,1.2,-3.66]),sc=pr(c,[104.2,1.2,.6]),me=lilly.joints.chest;if(post&&sc){const br=new Path2D(),wd=Math.max(4,c.F*.05/depth(c,[104.8,1,-3]));
    br.addPath(ribbon([[me[0],me[1]],[lerp(me[0],post[0],g),lerp(me[1],post[1],g)]],wd,{seed:72,taper:0,wobble:.5}));br.addPath(ribbon([[me[0],me[1]],[lerp(me[0],sc[0],g),lerp(me[1],sc[1],g)]],wd,{seed:73,taper:0,wobble:.5}));s.fill(Y,br,.8*g);}}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(LILLY_I,tau2(t)),q=toCam(c,[x,1.5,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:6.6,
};

// ---------------------------------------------------------------- 3 · slow replay low along the goal line: past Scurry, Lilly heads it clear; the crowd
const tau3=(t:number)=>{const fp=CUEW(2,'flies past'),ey=CUEW(2,'Eyes on'),lh=CUEW(2,'Lilly heads'),bc=CUEW(2,'Brandi');return key(t,[[0,1.05],[fp,1.4],[ey,1.62],[lh,T_SAVE+.02],[lh+1.3,T_SAVE+.65],[bc,2.3],[SECS(2),3.4]],linear);};
const rise3=(t:number)=>sm(CUEW(2,'Brandi')-.5,CUEW(2,'Brandi')+.9,t,easeInOutSine);
function cam3(t:number):Cam{
 const T=tau3(t),push=sm(CUEW(2,'Eyes on')-.4,CUEW(2,'Lilly heads'),t,easeInOutSine)*(1-sm(CUEW(2,'Lilly heads')+.6,CUEW(2,'Brandi')-.5,t)),up=rise3(t);
 const C:V3=[100.6-1.5*up,1.3+2.4*up,-10.2-2*up],b=ballAt(Math.min(T,2.2));
 const tg0:V3=[lerp(102.6,b[0],.2),1.4,lerp(-1.4,b[2],.15)],tg1:V3=[92,9,40];
 return look(C,lerp3(tg0,tg1,up),lerp(lerp(1450,2000,push),900,up));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),T=tau3(t),tp=tau3(twos(t)),ey=CUEW(2,'Eyes on'),lh=CUEW(2,'Lilly heads'),bc=CUEW(2,'Brandi'),wc=CUEW(2,'won the Cup'),E=SECS(2),up=rise3(t);
  stadium(s,c,v,t,{roar:sm(lh+.2,lh+.8,t),flash:sm(bc-.1,bc+.4,t)});
  ground(s,c);
  play(s,c,v,T,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({lilly,bg})=>{
   // "eyes on the ball": her sightline locks onto the ball as it comes
   sightline(s,lilly,bg,sm(ey-.1,ey+.5,t)*(1-sm(lh+.15,lh+.5,t)));
   // the contact: a yellow burst off her forehead
   const age=T-T_SAVE;if(age>-.03&&age<.35){const q=pr(c,LILLY_PT);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.55/depth(c,LILLY_PT),{n:9,seed:91,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.2)/.15)),width:Math.max(6,c.F*.04/depth(c,LILLY_PT))});}
   // "heads it clear": the clearance printed as it flies
   flightArrow(s,c,T_SAVE,Math.max(T_SAVE+.01,Math.min(T,T_LAND)),sm(lh,lh+.3,t)*(1-sm(bc-.6,bc-.2,t)),Y,.1);}});
  // "Brandi Chastain's penalty won the Cup": the camera lifts to the crowd — flags and confetti over the bowl
  if(up>.2){const k=sm(bc,wc+.6,t),fall=(t-bc)*260;for(const[sd,off] of [[7,0],[8,.5]] as [number,number][]){const y0=-v.hy*2.2+((fall+off*v.hy*2)%(v.hy*2.4));confetti(s,[R,B,Y,'paper'],[-v.hx,y0,v.hx*2,v.hy*1.6],Math.round(36*k),sd,{size:34,cov:.95});}}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),q=toCam(c,[92,9,40]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(10,c.F*3/q[2]),12);},
 still:4.8,
};

// ---------------------------------------------------------------- 4 · the lesson: behind the penalty spot, the USA goal at the top of the frame
const tau4=(t:number)=>{const ac=CUEW(3,'At corners'),gp=CUEW(3,'guard'),sa=CUEW(3,'Stay alert'),ey=CUEW(3,'eyes on'),oh=CUEW(3,'one header'),sg=CUEW(3,'save the game');
 return key(t,[[0,-1.2],[ac+.3,-.6],[gp+.8,-.2],[sa+.4,-.05],[ey,.25],[ey+1.2,1.3],[oh+.2,T_HEAD+.15],[oh+1.1,T_SAVE+.05],[sg,T_SAVE+.5],[SECS(3),T_SAVE+1.3]],linear);};
function cam4(t:number):Cam{
 const push=sm(CUEW(3,'guard')-.3,CUEW(3,'guard')+.5,t,easeInOutSine)*(1-sm(CUEW(3,'eyes on')-.3,CUEW(3,'eyes on')+.4,t)),back=sm(CUEW(3,'save the game')-.3,SECS(3),t,easeInOutSine);
 const C:V3=[88.2+4*push-1.5*back,6.4-2*push+.8*back,1.2-2.4*push];
 const tg:V3=[103.2+1.2*push,1.1-.1*push,lerp(-.6,-2.6,push)];
 return look(C,tg,2350+1500*push-250*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),T=tau4(t),tp=tau4(twos(t)),ac=CUEW(3,'At corners'),gp=CUEW(3,'guard'),sa=CUEW(3,'Stay alert'),ey=CUEW(3,'eyes on'),oh=CUEW(3,'one header'),sg=CUEW(3,'save the game'),E=SECS(3);
  stadium(s,c,v,t,{roar:sm(sg,sg+.4,t)});
  ground(s,c);
  // "At corners": the corner's flight from the flag, a red dashed line of where it will go
  const cw=sm(ac-.1,ac+.7,t,easeOut)*(1-sm(E-1,E-.6,t));
  // "guard the post": the ring on her spot and a glow along the post
  const gw=sm(gp-.1,gp+.35,t,easeOutBack)*(1-sm(E-1,E-.6,t));
  const[lx,lz]=posOf(LILLY_I,Math.min(T,-.2));groundRing(s,c,lx-.1,lz,.6,gw);
  play(s,c,v,T,tp,tau4(twos(t)-1/12),{minBall:6,near:8,hero:true,ghost:()=>{flightArrow(s,c,.02,T_HEAD,cw,R,.1);},after:({lilly,bg})=>{
   if(gw>0){const pp=new Path2D();seg3(c,[105,0,-3.66],[105,2.44,-3.66],.3,pp);s.fill(Y,pp,.6*gw);}
   alertTicks(s,lilly,sm(sa-.1,sa+.4,t,easeOutBack)*(1-sm(ey+.4,ey+.8,t)),t);
   sightline(s,lilly,bg,sm(ey-.1,ey+.6,t)*(1-sm(oh+1.1,oh+1.4,t)));
   // "one header": Fan's header across goal (red) is met by Lilly's (yellow), which sends it back out
   flightArrow(s,c,T_HEAD,Math.max(T_HEAD+.01,Math.min(T,T_SAVE)),sm(oh,oh+.3,t)*(1-sm(E-1,E-.6,t)),R,.1);
   flightArrow(s,c,T_SAVE,Math.max(T_SAVE+.01,Math.min(T,T_LAND)),sm(oh+1,oh+1.3,t)*(1-sm(E-.8,E-.5,t)),Y,.12);
   const age=T-T_SAVE;if(age>-.03&&age<.5){const q=pr(c,LILLY_PT);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.6/depth(c,LILLY_PT),{n:10,seed:93,g:easeOutBack(clamp((age+.03)/.1))*(1-clamp((age-.3)/.2)),width:Math.max(6,c.F*.045/depth(c,LILLY_PT))});}
   // "save the game": a big yellow tick of relief over the goal
   const sw=sm(sg-.1,sg+.5,t,easeOutBack);if(sw>0){const a=pr(c,[105,3.4,-.9]),m=pr(c,[105,2.9,-.1]),z=pr(c,[105,4.3,1.4]);if(a&&m&&z){const tk=partial([a,m,z],sw),wd=Math.max(10,c.F*.16/depth(c,[105,3,0]));s.knockout(ribbon(tk,wd*1.6,{seed:95,taper:.2,wobble:1}),.9);s.fill(Y,ribbon(tk,wd,{seed:95,taper:.2,wobble:1}),.95);}}}});
 },
 still:6.2,
};

const film:RisoStory={
 id:'lilly-goalline-1999',format:'11v11',title:"Lilly's goal-line header",theme:'Guard the post at corners: stay alert and keep your eyes on the ball',
 ageNote:'Women’s World Cup final, USA v China, Rose Bowl, Pasadena, 10 July 1999. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little burst of red-white-and-blue confetti and a yellow spark where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const g=easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3));if(g>0)sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age<.9){const u=easeOut(clamp(age/.6)),r=80+160*u;confetti(s,[R,B,'paper'],[x-r,y-r*.8+120*age*age,r*2,r*1.4],10,seed+1,{size:18*(1-clamp((age-.6)/.3))+2,cov:.95});}},
};
export default film;
/** Solved contact points (pitch metres; X to the USA goal line at 105, Z across; Lilly's post at Z = −3.66) — checked by the test. */
export const FACTS={FAN_PT,LILLY_PT,GOAL,BALL0,ballAt,T_HEAD,T_SAVE,scurryAt:(T:number)=>posOf(SCURRY_I,T)};
