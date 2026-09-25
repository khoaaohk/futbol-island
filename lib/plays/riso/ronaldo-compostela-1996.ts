/** Ronaldo Nazário v Compostela, La Liga, Estadio Multiusos de San Lázaro, 12 October 1996 (Compostela 1–5 Barcelona) — an iconic-play
 * riso film (RisoStory, chapters mode). A 1:1 reconstruction from written accounts (we cannot watch the footage), printed as a riso sheet.
 *
 * SOURCES (what the choreography follows):
 *  - FC Barcelona, "On this day 25 years ago: Ronaldo's legendary goal against Compostela" (12 Oct 2021)
 *    https://www.fcbarcelona.com/en/news/2286801/on-this-day-25-years-ago-ronaldos-legendary-goal-against-compostela
 *  - FC Barcelona video post, "Goal Ronaldo | October 12, 1996 | Compostela 1, Barça 5"
 *    https://www.facebook.com/fcbarcelona/videos/goal-ronaldo-october-12-1996-compostela-1-bar%C3%A7a-5/798929740883071/
 *  - Kodro Magazine, "El gol de Ronaldo al SD Compostela"  https://www.kodromagazine.com/gol-ronaldo-compostela/
 *  - Fútbolretro, "Ronaldo's goal against Compostela"  https://futbolretro.es/en/el-gol-de-ronaldo-al-compostela/
 *  - Relevo (X, 2022): "arrancó desde el centro del campo, aguantó agarrones y entradas"  https://x.com/relevo/status/1557775492685697024
 *  - ESPN, "Se cumplen 23 años del golazo de Ronaldo al Compostela"; Back Page Football, "Moments of Magic #12 – Ronaldo"
 *  - Kit: El Correo Gallego (17 Jul 2026), the 2026/27 shirt "rememora la equipación utilizada por el Compostela en la temporada 1996/97":
 *    white and sky blue split vertically; SD Compostela (club site, 2023): "blanco e azul celeste" are the club colours.
 *    https://www.elcorreogallego.es/deportes/2026/07/17/sd-compostela-presenta-nueva-camiseta-132558762.html
 * CONFIRMED by those accounts: 12 October 1996 (not the 11th), away at San Lázaro, Barça won 5–1 and Ronaldo scored twice; he picked the ball
 * up just inside his own half / in the centre circle area; first rode a blatant trip, then a shirt pull; burst between two defenders; near the
 * area the defenders could not risk a tackle; he came into the area from the left, cut back inside the last defender and beat keeper Fernando
 * with a low shot tight to the post; ~10 s, ~48 m, 34 strides, 16 touches; Bobby Robson lifted his hands to his head in disbelief; Compostela
 * players in the move (named in their later image-rights case over the Nike advert): Chiba, William, Bellido, Passi, Fabiano, José Ramón, Mauro.
 * INFERRED (illustrative): every position and timing between those beats, which defender did what, who passed to Ronaldo, which foot shot and
 * which post, the keeper's dive, Robson standing up as he reacts (the accounts only say hands to head), the dugout, the stadium's shape
 * (two covered side stands, low ends, Galician hills beyond), the weather, the camera placements, Barça's shorts/socks and number colour,
 * Compostela's shorts (the split-halves shirt is printed as a sky-blue screen: the figure library has no halves pattern), the keeper's kit.
 *
 * FRAMING (the TV broadcast, card window 1.45:1 down to square): 1 = the high main-stand camera, real time, panning with the ball;
 * 2 = slow-motion replay from a low touchline camera (the trip, the shirt pull, the shrug, the strides); 3 = slow replay from behind the goal
 * (cut inside, low shot), then a whip pan to the Barça bench for Robson; 4 = the lesson from a low front camera (balance ring, the pull, ball
 * close). Figures are the shared riso athlete (lib/plays/riso/athlete.ts), all routed through drawPlayer(). Scenes read only (t, c); all
 * actions key off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl. the
 * silent tail that carries the .65 s passage. The words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:"Compostela, 1996. Ronaldo gets the ball near halfway. A trip, a shirt pull, but he stays on his feet! He powers between two players, into the box... goal!",seconds:13.4,
  cues:[[.2,'Compostela'],[2.3,'Ronaldo'],[2.8,'gets the ball'],[4.6,'A trip'],[5.4,'a shirt pull'],[6.8,'stays on his feet'],[8.4,'powers between'],[10,'into the box'],[11.5,'goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. A trip: arms out for balance! A shirt pull: he leans forward and shrugs it off. Then big, powerful strides.',seconds:10.4,
  cues:[[.15,'Watch it again'],[1.9,'A trip'],[2.6,'arms out for balance'],[4.3,'A shirt pull'],[5.3,'leans forward'],[6.3,'shrugs it off'],[7.8,'big, powerful strides']]},
 {label:'The coach',text:'Then a low shot, past the keeper! On the bench, coach Bobby Robson held his head in disbelief.',seconds:7.6,
  cues:[[.15,'Then a low shot'],[1.4,'past the keeper'],[2.6,'On the bench'],[3.8,'Bobby Robson'],[4.7,'held his head'],[5.9,'disbelief']]},
 {label:'Your turn',text:'Your turn: stay strong and balanced when someone pushes you, and keep the ball close as you run.',seconds:7.4,
  cues:[[.15,'Your turn'],[1.1,'strong and balanced'],[2.5,'pushes you'],[3.7,'keep the ball close'],[5.1,'as you run']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py ronaldo-compostela-1996, which writes timing.json next to script.json. Then replace
 * this null with `import timing from '../../../public/plays/narration/ronaldo-compostela-1996/timing.json'` (as messi-getafe-2007.ts does)
 * and pass `timing as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-ronaldo-compostela-1996.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/ronaldo-compostela-1996/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('r9: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units). Centres world (x,y) on the CANVAS centre at `z0` units per
 * world unit (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Same framing as the pilots. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Barça attack +X, goal line 105), Y up, Z across (0 = the middle,
 * +34 = the near touchline under the main stand and the benches, −34 = the far touchline). A figure facing +X has its right side at +Z. */
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

// ---------------------------------------------------------------- San Lázaro: sky, Galician hills, two covered side stands, low ends
/** stand planes (a along, b up the rake 0..1): far side, near/main side (behind the benches), right end, left end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-12,117,a),1.3+12.5*b,-39-19*b],
 (a,b)=>[lerp(117,-12,a),1.3+14*b,43+21*b],
 (a,b)=>[112+13*b,1.1+7*b,lerp(-40,44,a)],
 (a,b)=>[-7-13*b,1.1+7*b,lerp(44,-40,a)],
];
const STAND_COLS=[96,96,54,54],STAND_ROWS=[13,13,8,8];
/** roofs over the two side stands (cantilever slab + a navy fascia) */
const ROOFS:V3[][]=[[[-12,16.5,-37.5],[117,16.5,-37.5],[117,18.6,-60],[-12,18.6,-60]],[[117,17.5,41.5],[-12,17.5,41.5],[-12,19.6,66],[117,19.6,66]]];
/** hills: a ring of rounded ridges round the ground, 420–520 m out */
const HILLS:V3[][]=(()=>{const out:V3[][]=[],N=56;for(let i=0;i<N;i++){const a0=i/N*TAU,a1=(i+1)/N*TAU,h=(a:number)=>28+30*(.5+.5*Math.sin(a*3+1))+18*Math.sin(a*7+.4)*Math.sin(a*2),r=(a:number)=>440+60*Math.sin(a*5);
  const P=(a:number,y:number):V3=>[52.5+Math.cos(a)*r(a),y,Math.sin(a)*r(a)];out.push([P(a0,-5),P(a1,-5),P(a1,h(a1)),P(a0,h(a0))]);}return out;})();
const CLOUDS:[V3,number][]=[[[52,190,-900],150],[[-300,170,-800],120],[[400,210,-850],170],[[700,160,300],150],[[-500,180,200],140],[[52,200,900],160],[[900,190,-200],140]];
/** everything behind the pitch */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 // overcast Galician sky: a pale blue screen, darker toward the top, clouds knocked out of it
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.24);
 const sky=new Path2D();sky.rect(-1e4,-1e4,2e4,1e4-v.hy*.35);s.tone(K,sky,.1);
 const cl=new Path2D();for(const [P,r] of CLOUDS){const q=toCam(c,P);if(q[2]<NEAR)continue;const p=scr(c,q),rr=c.F*r/q[2];if(!inView(v,p,rr*1.6))continue;
  for(let k=0;k<3;k++)cl.addPath(polyPath(blob(p[0]+(k-1)*rr*.8,p[1]+(k===1?-rr*.25:0),rr*(k===1?.9:.7),rr*(k===1?.45:.34),Math.round(P[0])+k,{amp:.12,n:18}),true));}
 s.knockout(cl,.75);
 // hills (green = yellow × blue) with a darker ridge screen
 const hl=new Path2D();for(const H of HILLS){if(H.some(P=>toCam(c,P)[2]<20))continue;const q=polyP(c,H);if(q.length>2)hl.addPath(polyPath(q,true));}
 s.knockout(hl);s.fill(Y,hl,.8);s.tone(B,hl,.75);s.tone(K,hl,.32);
 // stands: raked concrete (blue screen), a walkway knocked out, the roofs and their fascias
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),fascia=new Path2D();
 STANDS.forEach((S,si)=>{const q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);if(q.length>2)planes.addPath(polyPath(q,true));seg3(c,S(0,si<2?.55:1),S(1,si<2?.55:1),.8,walk);seg3(c,S(0,0),S(1,0),.9,walk);});
 for(const Rf of ROOFS){const q=polyP(c,Rf);if(q.length>2)roof.addPath(polyPath(q,true));const q2=polyP(c,[Rf[0],Rf[1],[Rf[1][0],Rf[1][1]-1.2,Rf[1][2]],[Rf[0][0],Rf[0][1]-1.2,Rf[0][2]]]);if(q2.length>2)fascia.addPath(polyPath(q2,true));
  for(let k=0;k<=6;k++){const x=lerp(Rf[0][0],Rf[1][0],k/6);seg3(c,[x,0,Rf[0][2]-1.5*Math.sign(Rf[0][2])],[x,Rf[0][1]-1,Rf[0][2]-1.5*Math.sign(Rf[0][2])],.35,fascia);}}
 s.knockout(planes);s.tone(B,planes,.45);s.tone(K,planes,.32);s.knockout(walk,.8);
 // the crowd: one speckle per seat group, sized by distance, in the club's sky blue and white with a few Barça reds; the far end roars at the goal
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 STANDS.forEach((S,si)=>{const cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(si<2&&Math.abs(b-.55)<.04)continue;
  for(let i=0;i<cols;i++){const hsh=hash(i*131+j*7919+si*17,5);if(hsh<.38)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.46/q[2],2.2,14),lift=roar>0&&si===2?roar*z*1.4*Math.max(0,Math.sin(t*10+hsh*TAU)):0;
   const ink=hsh<.46?0:hsh<.74?1:hsh<.88?2:hsh<.95?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}});
 s.knockout(inks[0],.6);s.tone(B,inks[1],.75);s.fill(K,inks[2],.8);s.fill(R,inks[3],.95);s.fill(Y,inks[4],.95);
 s.knockout(roof);s.tone(K,roof,.55);s.tone(B,roof,.5);s.fill(K,fascia,.9);
 // floodlight pylons at the four corners (day match: lamps unlit, a paper glint)
 const py=new Path2D(),lamps=new Path2D();for(const [x,z] of [[-10,-44],[115,-44],[-10,46],[115,46]] as [number,number][]){seg3(c,[x,0,z],[x,36,z],.9,py);const q=polyP(c,[[x-3,33,z],[x+3,33,z],[x+3,38,z],[x-3,38,z]]);if(q.length>2)lamps.addPath(polyPath(q,true));}
 s.fill(K,py,.85);s.fill(K,lamps,.9);
 if(flash>0){const p=new Path2D();for(let i=0;i<9;i++){const r1=hash(i*17+Math.floor(t*12)*101,3),r2=hash(i*29+Math.floor(t*12)*7,4),q=pr(c,STANDS[r1<.55?2:0](r1<.55?r2:r2*.8+.2,.15+.75*hash(i,Math.floor(t*12))));if(!q)continue;const z=9+13*flash;
  p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** concrete surround, grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (the right goal drawn later when it is in
 * front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-7,0,-39],[112,0,-39],[112,0,43],[-7,0,43]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(K,p,.2);s.tone(R,p,.12);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.86);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.11);
 // boards: far touchline and behind both goals, red with paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.95);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??3);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.3],[R,.2]];
const SKIN_TAN:InkFill[]=[[Y,.38],[R,.3],[K,.08]];
const SKIN_R9:InkFill[]=[[Y,.45],[R,.42],[K,.22]];
/** Barça 1996/97: blaugrana stripes (red + blue overprint), blue shorts and socks (inferred); Ronaldo's 9 on the back */
const BARCA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:B,shorts:B,socks:B,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,seed:3,...o});
const R9_STYLE=BARCA({skin:SKIN_R9,number:9,numberInk:Y,build:{height:1.83,bulk:1.12,thighs:1.24},seed:9});
/** Compostela 1996/97 home: white and sky blue (the halves print as a sky-blue screen); white shorts and sky-blue socks inferred */
const COMPOS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.42],shorts:'paper',socks:[B,.42],boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,trim:[B,.8],seed:5,...o});
const KEEPER:AthleteStyle={shirt:Y,shorts:[K,.78],socks:Y,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,gloves:[R,.55],sleeves:'long',build:{height:1.86},seed:51};
const REF:AthleteStyle={shirt:[K,.85],shorts:[K,.85],socks:[K,.85],boots:K,skin:SKIN,hair:[K,.9],hairStyle:'balding',line:K,seed:12};
/** Bobby Robson (63): white hair, club jacket over dark trousers (trousers overprinted by trousers()); the staff in Barça tracksuits */
const ROBSON:AthleteStyle={shirt:[K,.6],shorts:[K,.45],socks:[K,.45],boots:K,skin:[[Y,.24],[R,.26]],hair:'paper',hairStyle:'short',line:K,sleeves:'long',trim:R,build:{height:1.78,bulk:1.05},seed:63};
const STAFF=(seed:number,hair:InkFill='navy'):AthleteStyle=>({shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:seed%2?SKIN:SKIN_TAN,hair,hairStyle:seed%3?'short':'balding',line:K,sleeves:'long',trim:R,seed});

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = add a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Ronaldo's first touch)
type Role='r9'|'def'|'gk'|'mate'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`) */
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number]};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Compostela names are the players the accounts list in the move; which one
 * trips, pulls or lunges is inferred. */
const ACTORS:Actor[]=[
 {name:'Ronaldo',role:'r9',style:R9_STYLE,keys:[[-3,45.5,12],[-1.6,46.8,9.6],[-.6,48,7.2],[0,48.8,6.2],[.45,50,5.7],[.9,51.7,5.4],[1.3,53,5.2],[1.75,54.6,4.9],[2.15,56.1,4.5],[2.6,58.2,3.9],[3.1,61,3.1],[3.65,64.5,2.2],[4.25,68.4,1],[4.9,72.9,-.6],[5.6,78,-3.1],[6.35,83.4,-6],[7.1,88.4,-9],[7.7,91.2,-10.3],[8.2,92.9,-9.6],[8.55,93.7,-8.1],[8.9,94.1,-6.9],[9.15,94.4,-6.5],[9.6,95.4,-5.8],[10.4,97.6,-2.5],[11.4,99.8,4],[12.6,101.2,11],[14,101.8,17],[16,102,20]]},
 {name:'Barça 6',role:'mate',style:BARCA({seed:6,skin:SKIN_TAN}),keys:[[-3,36.5,-3],[-1.1,39,-1.5],[0,40.2,-.5],[4,48,0],[10,64,-2],[16,72,-4]]},
 {name:'Chiba (trip)',role:'def',style:COMPOS({seed:31,skin:SKIN_TAN}),engage:[-1,1.5],moves:[{kind:'lunge',at:.9,dur:.9,side:'l'}],keys:[[-3,58,1],[-1,55.5,3],[0,53.8,4],[.5,52.6,4.6],[.9,52.2,4.7],[1.4,52,4.9],[2.2,52.8,4.5],[4,56,3],[9,66,0],[16,70,0]]},
 {name:'William (shirt pull)',role:'def',style:COMPOS({seed:32,build:{height:1.85}}),engage:[-1,2.4],keys:[[-3,47,-3],[-1,48.5,0],[0,49.8,1.8],[.9,52.4,3.4],[1.4,53.6,4],[1.75,54.35,4.1],[2.15,55.4,3.8],[2.5,56.2,3.5],[3,57,3.2],[4,58.5,2.8],[9,68,-2],[16,74,-3]]},
 {name:'Bellido',role:'def',style:COMPOS({seed:33,hairStyle:'curly'}),engage:[2.8,4.45],moves:[{kind:'lunge',at:4.2,dur:.8,side:'r'}],keys:[[-3,74,8],[1,71.5,5.5],[3,69.3,3.6],[4,68.3,2.9],[4.25,68,2.7],[4.6,68.4,2.4],[5.5,70.5,1],[9,80,-3],[16,86,-3]]},
 {name:'Passi',role:'def',style:COMPOS({seed:34,skin:SKIN_TAN}),engage:[2.8,4.5],moves:[{kind:'lunge',at:4.25,dur:.8,side:'l'}],keys:[[-3,75,-6],[1,72,-3.5],[3,69.6,-1.6],[4,68.6,-1],[4.25,68.3,-.8],[4.6,68.8,-.5],[5.6,72,-2],[9,85,-6],[16,90,-5]]},
 {name:'Fabiano',role:'def',style:COMPOS({seed:35,build:{height:1.87}}),engage:[6,8.5],moves:[{kind:'lunge',at:8.25,dur:.9,side:'l'}],keys:[[-3,94,-2],[3,95,-5],[6,95,-8.5],[7.4,94.2,-10.4],[7.9,93.8,-10.7],[8.25,93.6,-10.6],[8.6,93.7,-10.2],[9.4,94.8,-8.5],[12,97,-4],[16,98,-2]]},
 {name:'José Ramón',role:'def',style:COMPOS({seed:36,hairStyle:'balding'}),engage:[7.5,9.4],moves:[{kind:'lunge',at:9.2,dur:.8,side:'r'}],keys:[[-3,95,6],[5,96,1],[8,95.6,-2.5],[9,95.3,-3.8],[9.4,95.6,-3.5],[12,98,0],[16,99,1]]},
 {name:'Fernando',role:'gk',style:KEEPER,moves:[{kind:'dive',at:9.35,dur:.75,side:'l'}],keys:[[-3,104,0],[6,103.2,-2],[8,102.2,-3.2],[8.9,101.6,-3.9],[9.1,101.5,-4],[16,101.5,-4]]},
 {name:'Mauro',role:'def',style:COMPOS({seed:37}),keys:[[-3,66,-12],[4,74,-11],[9,86,-12],[16,92,-10]]},
 {name:'Compostela 9',role:'def',style:COMPOS({seed:38,skin:SKIN_TAN}),keys:[[-3,62,14],[4,70,11],[9,82,8],[16,90,6]]},
 {name:'Compostela 10',role:'def',style:COMPOS({seed:39}),keys:[[-3,80,-20],[5,86,-18],[9,92,-15],[16,96,-12]]},
 {name:'Compostela 11',role:'def',style:COMPOS({seed:40,hairStyle:'long'}),keys:[[-3,84,18],[5,90,15],[9,95,11],[16,97,9]]},
 {name:'Barça 10',role:'mate',style:BARCA({seed:7}),keys:[[-3,70,-18],[5,82,-17],[9,94,-16],[16,99,-6]]},
 {name:'Barça 7',role:'mate',style:BARCA({seed:8,skin:SKIN_TAN}),keys:[[-3,72,20],[5,84,18],[9,93,15],[16,100,16]]},
 {name:'Barça 11',role:'mate',style:BARCA({seed:10}),keys:[[-3,52,-20],[5,62,-18],[9,72,-16],[16,84,-10]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3,55,-8],[5,66,-10],[9,82,-14],[16,90,-10]]},
];
const R9=0,MATE=1,TRIP=2,PULL=3,GK=8;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3,T1=16,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: 16 touches (the last is the shot), rolling between them
const TOUCHES=[0,.5,1.12,1.6,2.35,2.85,3.4,3.95,4.45,5.1,5.8,6.5,7.2,7.8,8.45,9.15];
const SHOT=9.15,IN_NET=SHOT+.34,PASS=-1.1;
const footAt=(tau:number):[number,number]=>{const p=posOf(R9,tau),v=velOf(R9,tau),l=Math.hypot(v[0],v[1])||1;return tau<=0?[p[0]-.3,p[1]-.25]:[p[0]+v[0]/l*.5,p[1]+v[1]/l*.5];};
const TP=TOUCHES.map(footAt);
const NET:V3=[105.35,.24,3.05],REST:V3=[106.3,.11,3.2];
function ballAt(tau:number):V3{
 if(tau<PASS){const x=posOf(MATE,tau);return[x[0]+.45,.11,x[1]+.1];}
 if(tau<0){const x=posOf(MATE,PASS),a:Pt=[x[0]+.45,x[1]+.1],u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.6);return[lerp(a[0],TP[0][0],e),.11,lerp(a[1],TP[0][1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.16*Math.sin(Math.PI*u*.9),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the trip: tripped leg kicked back, the other planted, arms flung wide for balance, chest low */
const STUMBLE:Partial<Pose>={pitch:16,lean:24,rHipF:-42,rKnee:100,rAnk:34,lHipF:38,lKnee:48,lAnk:-6,lShA:82,rShA:88,lShF:28,rShF:-24,lElb:24,rElb:20,lHand:.9,rHand:.9,neckP:-18,air:.04,squash:-.06};
/** the shirt pull: chest down and forward, far arm driving back against the puller, the head up */
const TUGGED:Partial<Pose>={pitch:12,lean:26,lShF:-72,lShA:38,lElb:28,rShF:58,rShA:14,rElb:92,neckP:-20,neckY:-18};
/** receiving on the half-turn */
const RECEIVE:Partial<Pose>={lean:12,lHipF:26,lKnee:40,rHipF:-8,rKnee:32,lShA:42,rShA:36,lElb:40,rElb:40,neckP:30};
/** the puller: reaching arm locked on the shirt, leaning back against the run */
const PULLING:Partial<Pose>={rShF:84,rShA:22,rElb:8,rHand:.6,lShF:-30,lShA:30,twist:16,lean:8,pitch:-6,neckP:4};
const FLAIL:Partial<Pose>={pitch:20,lean:28,lShA:70,rShA:74,lShF:40,rShF:30,lElb:30,rElb:30,neckP:-16};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(R9,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk'&&tau>4)yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz,cycle=a.role==='r9'?3.9:3.4;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='def'?READY:stand();
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);let run=runCycle(distOf(k,tau)/cycle,{speed:s});
  if(a.role==='r9'&&sp<5.5)run=blendPose(dribble(distOf(k,tau)/2.6,{speed:.5}),run,clamp((sp-3.2)/2.3));
  p=blendPose(idle,run,clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.12});}
 if(k===PULL){p=over(p,PULLING,Math.min(sm(1.45,1.7,tau),1-sm(2.25,2.45,tau)));p=over(p,FLAIL,bump(2.35,3.1,tau));}
 if(k===TRIP&&tau>1.2)p=over(p,FLAIL,bump(1.2,2.2,tau)*.8);
 if(a.role==='r9'){
  if(tau<.5){const pass=posOf(MATE,PASS);yaw=lerpA(yawOf(pass[0]-x,pass[1]-z),yaw,sm(-.1,.5,tau));p=over(p,RECEIVE,bump(-.5,.35,tau));}
  p=over(p,STUMBLE,bump(.72,1.5,tau));
  const tug=Math.min(sm(1.55,1.8,tau),1-sm(2.3,2.6,tau));
  if(tug>0){p=over(p,TUGGED,tug);/* the shrug: shoulders snap round against the pull, then square up */const q=clamp((tau-1.95)/.4);if(q>0&&q<1){p.twist+=(-26*Math.sin(Math.PI*q)+14*Math.sin(TAU*q))*RAD;p.squash=-.06*Math.sin(Math.PI*q);p.roll=-6*Math.sin(Math.PI*q)*RAD;}}
  p=over(p,{lShA:34,rShA:40,roll:-5,bend:-6},bump(4.02,4.5,tau));
  p=over(p,{roll:10,bend:12,lean:22,neckY:12},bump(8.2,8.7,tau));
  const D=.9,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.72}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.5)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.5,IN_NET+1,tau));
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print
/** paper ball, navy pentagon panels, blue shade crescent, navy rim, glint. (x,y) = centre. */
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 pan.addPath(pent(x+Math.cos(rot)*r*.2,y+Math.sin(rot)*r*.2,r*.3,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92,r*.28,a+Math.PI));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:()=>void;ring?:number}={}){
 const{minBall=6,hero=false,ring=0}=o;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.17,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.9,br*.28,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 if(ring>0){const m=posOf(R9,tau),cx=(m[0]+b[0])/2,cz=(m[1]+b[2])/2,r=.45+Math.hypot(m[0]-b[0],m[1]-b[2])/2+.3*(1-ring),pts:Pt[]=[];
  for(let i=0;i<40;i++){const q=pr(c,[cx+Math.cos(i/40*TAU)*r*1.1,0,cz+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
  if(pts.length>30){const q=toCam(c,[cx,0,cz]),rr=ribbon(pts,Math.max(6,c.F*.1/q[2]),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),big=e.h>=300;
  drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail:e.h<230?'low':'auto'},{x:e.x,z:e.z,yaw},big&&(e.k===R9||e.h>520)?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===R9}:{});}
 if(!ballDone)drawBall();
 o.after?.();
 return{list,bg,br};
}
/** a broadcast speed streak (the whip pan / the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, (near) real time
/** τ from chapter-1 time: keyed to the cue words (the action between them runs at 0.6–1.6× real time) */
const tau1=(t:number)=>{const g=CUEW(0,'gets the ball'),G=CUEW(0,'goal');return key(t,[[0,Math.max(T0,-g-.2)],[g,0],[CUEW(0,'A trip'),.85],[CUEW(0,'a shirt pull'),1.7],[CUEW(0,'stays on'),2.55],[CUEW(0,'powers'),4.2],[CUEW(0,'into the box'),7.3],[G,IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-G]],linear);};
const CAM1:V3=[52.5,14.5,66];
function cam1(t:number):Cam{
 const g=CUEW(0,'gets the ball'),G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[54,0,-4],m=posOf(R9,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(0,g-.2,t,easeInOutSine),toR9=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(9,3.4,toBall),lerp(open[2],lerp(bt[2],0,.25),toBall)],T=lerp3(tb,cel,toR9);
 const F=key(t,[[0,1900],[g-.3,4200],[CUEW(0,'powers'),4500],[CUEW(0,'into the box'),5000],[G,5300],[G+1.4,5900],[S,6200]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(R9,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.83/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: the trip, the shirt pull, the shrug, the strides
const tau2=(t:number)=>key(t,[[0,.15],[CUEW(1,'A trip'),.78],[CUEW(1,'arms out'),1.05],[CUEW(1,'A shirt pull'),1.72],[CUEW(1,'leans forward'),1.95],[CUEW(1,'shrugs'),2.15],[CUEW(1,'big'),2.85],[SECS(1),4.3]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(R9,tau),push=sm(CUEW(1,'leans')-.3,CUEW(1,'shrugs')+.2,t,easeInOutSine)*(1-sm(CUEW(1,'big')-.2,CUEW(1,'big')+.8,t,easeInOutSine));
 const pull=sm(CUEW(1,'big')-.2,SECS(1),t,easeInOutSine),open=1-sm(0,1.4,t,easeInOutSine);
 const C:V3=[m[0]-3.4-1.5*pull+2*open,1.55+.25*open,m[1]+10.5+3*open-2.2*push],T:V3=[m[0]+1.4+1.5*pull,.98,m[1]-.2];
 return look(C,T,2750+500*push-250*pull-350*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),a=CUEW(1,'A trip'),sh=CUEW(1,'shrugs');
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:()=>{
   // the trip and the shrug each leave a small yellow spark where the contact happens
   const m=posOf(R9,tau);for(const [at,y,sd] of [[a+.35,.35,3],[sh,1.35,5]] as [number,number,number][]){const age=t-at;if(age<0||age>.5)continue;const q=pr(c,[m[0]-.25,y,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.55/toCam(c,[m[0],y,m[1]])[2],{n:8,seed:sd,g:easeOutBack(clamp(age/.18))*(1-clamp((age-.3)/.2)),width:10});}}});
  // the replay wipe as the chapter opens
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:6.3,
};

// ---------------------------------------------------------------- 3 · slow replay from behind the goal, then the whip pan to the bench
const tau3=(t:number)=>{const s0=CUEW(2,'Then')+.6,s1=CUEW(2,'past the keeper')+.3;return key(t,[[0,8.05],[s0,SHOT],[s1,IN_NET+.25],[SECS(2),IN_NET+.25+(SECS(2)-s1)]],linear);};
/** the Barça bench (the near touchline, just short of halfway): Robson + three staff, inferred */
const BENCH_Z=39.6,BENCH:{x:number;style:AthleteStyle;robson?:boolean}[]=[{x:47.9,style:STAFF(71)},{x:49,style:ROBSON,robson:true},{x:50.2,style:STAFF(72,'paper')},{x:51.3,style:STAFF(73)}];
const ROBSON_HEAD:V3=[49,1.72,BENCH_Z];
const whip3=(t:number)=>{const b=CUEW(2,'On the bench');return sm(b-.45,b+.6,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(R9,tau),e=sm(SHOT-.3,IN_NET+.2,tau,easeInOutSine),u=whip3(t);
 const C0:V3=[118.5,7.2,3.4-1.2*e],T0:V3=[lerp(m[0],100.5,e),lerp(.9,1,e),lerp(m[1]*.75,-.5,e)];
 const settle=sm(CUEW(2,'Bobby')-.2,SECS(2),t,easeInOutSine),C1:V3=[49.2,2.2,24.5+2.4*settle],T1:V3=[49,1.35,BENCH_Z];
 const F0=(3900+500*sm(0,CUEW(2,'Then'),t))*(1-.3*e),F1=3500+700*settle;
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(F0,F1,u)*(1-.55*Math.sin(Math.PI*u)));
}
/** dark trousers over the athlete's legs (a coach is not in shorts): one tube per leg from the hip through the knee to the ankle */
function trousers(s:Sheet,r:DrawResult,c:Cam){
 const J=r.joints,p=new Path2D(),w=c.scale!(r.sk.pelvis)*r.sk.s;
 for(const sd of ['l','r'] as const){const hip=J[`${sd}Hip`],kn=J[`${sd}Kn`],an=J[`${sd}An`];const pts:Pt[]=[L2(hip,J.pelvis,.25),L2(hip,kn,.5),kn,L2(kn,an,.55),an];p.addPath(ribbon(pts,.17*w,{seed:sd==='l'?3:4,taper:0,pressure:.2,wobble:0}));}
 s.knockout(p);s.tone(K,p,.45);s.stroke(K,p,Math.max(2,.012*w),.9);
}
/** the dugout: back wall, bench, curved perspex roof, the main-stand crowd above it (stadium() draws that) */
function dugout(s:Sheet,c:Cam,front:boolean){
 const x0=46.6,x1=52.6,z0=BENCH_Z-1.3,z1=BENCH_Z+.9;
 if(!front){const wall=polyP(c,[[x0,0,z1],[x1,0,z1],[x1,2.3,z1],[x0,2.3,z1]]),seat=polyP(c,[[x0+.2,.44,BENCH_Z-.2],[x1-.2,.44,BENCH_Z-.2],[x1-.2,.5,BENCH_Z+.35],[x0+.2,.5,BENCH_Z+.35]]),seatF=polyP(c,[[x0+.2,0,BENCH_Z-.2],[x1-.2,0,BENCH_Z-.2],[x1-.2,.44,BENCH_Z-.2],[x0+.2,.44,BENCH_Z-.2]]);
  if(wall.length>2){const p=polyPath(wall,true);s.knockout(p);s.tone(K,p,.5);s.tone(B,p,.35);}
  const bs=new Path2D();if(seat.length>2)bs.addPath(polyPath(seat,true));if(seatF.length>2)bs.addPath(polyPath(seatF,true));s.knockout(bs);s.fill(R,bs,.9);s.tone(K,bs,.3);return;}
 // side panels + the roof (a see-through perspex curve with a navy rim), printed after the figures
 const roof:V3[]=[];for(let i=0;i<=8;i++){const a=i/8*Math.PI/2;roof.push([0,2.3+Math.sin(a)*.25,z1-(z1-z0)*Math.sin(a)*1.02]);}
 const shell=new Path2D(),rim=new Path2D();
 for(const x of [x0,x1]){const q=polyP(c,[[x,0,z1],...roof.map(r=>[x,r[1],r[2]] as V3),[x,0,z0+.1]]);if(q.length>2)shell.addPath(polyPath(q,true));}
 for(let i=0;i<8;i++){const a=roof[i],b2=roof[i+1],q=polyP(c,[[x0,a[1],a[2]],[x1,a[1],a[2]],[x1,b2[1],b2[2]],[x0,b2[1],b2[2]]]);if(q.length>2)shell.addPath(polyPath(q,true));}
 seg3(c,[x0,roof[8][1],roof[8][2]],[x1,roof[8][1],roof[8][2]],.07,rim);for(const x of [x0,x1])for(let i=0;i<8;i++)seg3(c,[x,roof[i][1],roof[i][2]],[x,roof[i+1][1],roof[i+1][2]],.06,rim);seg3(c,[x0,0,z0+.1],[x0,roof[8][1],roof[8][2]],.06,rim);seg3(c,[x1,0,z0+.1],[x1,roof[8][1],roof[8][2]],.06,rim);
 s.tone(B,shell,.2);s.fill(K,rim,.9);
}
function bench(s:Sheet,c:Cam,v:View,t:number,tp:number){
 const rb=CUEW(2,'Bobby'),hh=CUEW(2,'held'),db=CUEW(2,'disbelief');
 dugout(s,c,false);
 const SIT=posed({lHipF:86,rHipF:84,lKnee:88,rKnee:90,lAnk:4,rAnk:2,lHipA:8,rHipA:10,lean:16,pitch:2,lShF:34,rShF:30,lShA:14,rShA:12,lElb:64,rElb:70,neckP:-4});
 const HEAD=posed({lHipF:4,rHipF:10,lKnee:12,rKnee:16,lean:-8,pitch:-4,lShF:28,rShF:28,lShA:104,rShA:104,lShR:80,rShR:80,lElb:142,rElb:142,lHand:.8,rHand:.8,neckP:-16});
 const list=BENCH.map(b=>({b,d:toCam(c,[b.x,1,BENCH_Z])[2]})).sort((p,q)=>q.d-p.d);
 for(const {b} of list){const g=pr(c,[b.x,0,BENCH_Z]);if(!g||!inView(v,g,400))continue;
  const at=(tt:number)=>{let p:Pose;
   if(b.robson){const up=sm(rb-.25,rb+.45,tt),hands=sm(hh-.2,hh+.3,tt,easeOutBack);p=blendPose(SIT,stand(),up);p=blendPose(p,HEAD,hands);
    // leaning in to watch, then (on "disbelief") the slow head shake of a man who cannot believe it
    p=over(p,{lean:30,neckP:-10},(1-up)*sm(0,.8,tt));p.neckY+=(1-sm(db+1.6,db+2.4,tt))*sm(db-.2,db+.2,tt)*20*RAD*Math.sin((tt-db)*7);p.lean+=hands*4*RAD*Math.sin((tt-hh)*3);}
   else{const jump=sm(rb-.6+(b.x-48)*.12,rb-.1+(b.x-48)*.12,tt);p=blendPose(SIT,celebrate(tt*.9+b.x,{kind:'arms'}),jump);}
   return p;};
  const place:Place={x:b.x,z:BENCH_Z,yaw:Math.PI/2};
  const r=drawPlayer(s,at(tp),c,b.style,place,{prev:at(tp-1/12)});
  if(b.robson)trousers(s,r,c);}
 dugout(s,c,true);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),u=whip3(t),c=cam3(t),tau=tau3(t),tp=tau3(twos(t));
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:true});
  if(u<.6)play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true});
  goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  if(u>.35)bench(s,c,v,t,twos(t));
  streaks(s,v,Math.sin(Math.PI*u),33,.05);
 },
 aperture(t){const c=cam3(t),q=toCam(c,ROBSON_HEAD),g=scr(c,q);return apertureDisc(g[0],g[1]+c.F*.35/q[2],Math.max(8,c.F*.14/q[2]),12);},
 still:5.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the shirt pull, balance, ball close
const tau4=(t:number)=>key(t,[[0,1.35],[CUEW(3,'strong'),1.62],[CUEW(3,'pushes'),1.98],[CUEW(3,'keep'),2.55],[CUEW(3,'as you run'),3.15],[SECS(3),4.4]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(R9,tau),push=sm(CUEW(3,'strong')-.3,CUEW(3,'strong')+.5,t,easeInOutSine),orbit=sm(CUEW(3,'keep')-.3,CUEW(3,'keep')+.7,t,easeInOutSine),back=sm(CUEW(3,'as you run')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[m[0]+7.4+2*back,1.3+.4*orbit,m[1]+5.4-3.2*orbit+1.5*back],T:V3=[m[0]+.3,.92-.25*orbit,m[1]-.3];
 return look(C,T,2500+450*push-200*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),st=CUEW(3,'strong'),pu=CUEW(3,'pushes'),kb=CUEW(3,'keep'),ru=CUEW(3,'as you run');
  stadium(s,c,v,t);
  ground(s,c);
  const m=posOf(R9,tau);
  // "strong and balanced": a yellow base ring round his feet, printed on the grass before the players
  const bal=sm(st-.1,st+.35,t,easeOutBack)*(1-sm(kb-.3,kb+.2,t));
  if(bal>0){const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[m[0]+Math.cos(i/36*TAU)*.75*bal,0,m[1]+Math.sin(i/36*TAU)*.6*bal]);if(q)pts.push(q);}if(pts.length>30){const rr=ribbon(pts,c.F*.07/toCam(c,[m[0],0,m[1]])[2],{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9);s.fill(Y,rr,.95);}}
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,ring:sm(kb-.1,kb+.35,t,easeOutBack)*(1-sm(ru+.4,ru+.9,t)),after:()=>{
   // "pushes you": the pull (red, backward, from the puller's hand) against his drive (yellow, forward and down through the lean)
   const pw=sm(pu-.15,pu+.3,t,easeOut)*(1-sm(kb,kb+.4,t));
   if(pw>0){const d=toCam(c,[m[0],1,m[1]])[2],h=c.F*1.83/d,w=h*.045,o=pr(c,[m[0],1.2,m[1]]),vv=velOf(R9,tau),pf=pr(c,[m[0]+vv[0]*.4,1.2,m[1]+vv[1]*.4]);
    const dirTo=(q:Pt|null,fb:number)=>{if(!o||!q)return fb;return Math.atan2(q[1]-o[1],q[0]-o[0]);},af=dirTo(pf,0),ab=af+Math.PI;
    // screen-space arrows off his shoulders: the pull (red) backward against the run, his drive (yellow) the way he runs
    if(o)for(const [ang,ink,sd,back] of [[ab,R,5,1],[af,Y,6,0]] as [number,string,number,number][]){const s0:Pt=[o[0]+Math.cos(ang)*h*.16,o[1]+Math.sin(ang)*h*.16-h*.12],s1:Pt=[s0[0]+Math.cos(ang)*h*(back?.55:.7),s0[1]+Math.sin(ang)*h*(back?.55:.7)];
     s.knockout(ribbon([s0,s1],w*1.9,{seed:sd,taper:.1}),.85*pw);laneArrow(s,ink,s0,s1,w,{progress:pw,seed:sd,head:w*2.6});}}
   // "as you run": speed lines stream off him
   const rw=sm(ru-.1,ru+.4,t)*(1-sm(SECS(3)-.8,SECS(3)-.2,t));
   if(rw>0){const q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]+1,1,m[1]]);if(q&&q2){const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=c.F/toCam(c,[m[0],1,m[1]])[2];for(const k of[0,1])s.fill(K,ribbon([[q[0]-Math.cos(dir)*z*(.9+k*.3),q[1]-z*(.5-k*.6)],[q[0]-Math.cos(dir)*z*(1.9+k*.5),q[1]-z*(.5-k*.6)]],z*.05,{seed:9+k,taper:.9,wobble:.5}),.6*rw);}}}});
 },
 still:4.2,
};

const film:RisoStory={
 id:'ronaldo-compostela-1996',format:'11v11',title:"Ronaldo's solo goal v Compostela",theme:'Strength and balance: ride the challenge, keep the ball close at speed',
 ageNote:'La Liga, San Lázaro, Santiago de Compostela, 12 October 1996. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** grass spray: green bits and paper flecks thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
