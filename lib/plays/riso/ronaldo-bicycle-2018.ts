/** Cristiano Ronaldo's bicycle kick — Juventus 0–3 Real Madrid, UEFA Champions League quarter-final first leg, Allianz Stadium, Turin,
 * 3 April 2018. An iconic-play riso film (RisoStory, chapters mode) played in the player card's picture window or StoryFilmPlayer.
 * A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 via web search result summaries; the pages themselves could not be fetched in this session):
 *  - theScore, "Anatomy of a Classic Goal: Ronaldo's bicycle kick vs. Juventus" https://www.thescore.com/seri/news/1970149
 *  - ESPN match report, "Juventus 0-3 Real Madrid (Apr 3, 2018)" https://www.espn.com/soccer/report/_/gameId/509303
 *  - CBS Sports, "Ronaldo's Champions League bicycle kick goal for Real Madrid earns praise from Juventus fans"
 *    https://www.cbssports.com/soccer/news/ronaldos-champions-league-bicycle-kick-goal-for-real-madrid-earns-applause-from-juventus-fans
 *  - ESPN, "Real Madrid's Cristiano Ronaldo thanks Juventus fans for 'amazing' goal reaction"
 *    https://www.espn.com/soccer/story/_/id/37549976/real-madrid-cristiano-ronaldo-thanks-juventus-fans-amazing-goal-reaction
 *  - Goal.com, "WATCH: Cristiano Ronaldo's incredible bicycle kick goal in Champions League against Juventus"
 *    https://www.goal.com/en-us/news/watch-ronaldos-incredible-bicycle-kick-goal-in-champions-league-against-juventus/lqtu8mgj0yge1n2jpzs72wjho
 *  - ABC News, "Cristiano Ronaldo bicycle kick goal helps Real Madrid down Juventus in Champions League" (4 Apr 2018)
 *    https://www.abc.net.au/news/2018-04-04/ronaldo-scores-from-bicycle-kick-in-real-madrid-rout/9616370
 *  - FOX Sports, "Even for Cristiano Ronaldo, bicycle kick goal was special" https://www.foxsports.com/stories/soccer/even-for-cristiano-ronaldo-bicycle-kick-goal-was-special
 *  - FIFA, "Ronaldo's gravity-defying acrobatics" https://inside.fifa.com/news/ronaldo-gravity-defying-acrobatics
 *  - Inquirer Sports, "Ronaldo's overhead kick against Juventus wins UEFA goal of season" https://sports.inquirer.net/317307/ronaldos-overhead-kick-juventus-wins-uefa-goal-season/amp
 * CONFIRMED by those accounts: 3 April 2018, Allianz Stadium, Turin, quarter-final first leg, final score 0–3 (Ronaldo 3', Ronaldo 64',
 * Marcelo 72'); the bicycle kick made it 2–0 in the 64th minute; Dani Carvajal floated/crossed the ball in from the RIGHT; Ronaldo, with his
 * back to goal, leapt and struck an overhead kick with his RIGHT leg; the contact was about 2.3–2.4 m high (2.38 m is the commonly quoted
 * figure) and he took it "right off the head" of Mattia De Sciglio, who was also in the air; the ball went in "inside the right post" past a
 * "flat-footed" Gianluigi Buffon; the Juventus fans rose and applauded; Zidane called it one of the most beautiful goals in history.
 * INFERRED (illustrative reconstruction): every position and run on the pitch; Carvajal's distance from goal and the flight time/apex of the
 * cross (drawn ~1.55 s, ~4 m apex); the body mechanics (left leg swings up first, push-off, scissor, landing on hands then back); which touchline
 * the main camera sat on (the cross is drawn coming from the near side); the ball's height as it crossed the line; Buffon's kit colour (drawn
 * steel blue, the 2017–18 keeper kit colour, with yellow gloves); Juventus shorts/socks (drawn black shorts, white socks); the kit numbers of
 * players other than Ronaldo's 7; the other players shown; Ronaldo's celebration run.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Carvajal down the right, the cross, the kick, the
 * net) · ch2 = the TV slow-motion REPLAY from a low reverse angle, close on Ronaldo (eyes on the ball, the early jump, flat in the air, the
 * scissor, the landing) · ch3 = a replay from BEHIND THE GOAL (the ball past a flat-footed Buffon) that tilts up to the Juventus fans standing
 * to clap · ch4 = the lesson on a training ground: a young player on a soft crash mat, a coach tossing the ball, the move in four body shapes.
 * Composed for the card window (≈ 1.45:1 down to square): the world is centred on the CANVAS centre (not the safe region), cameras are real
 * pinhole projections of metres, key action stays inside the central ~1000 × 1000 units.
 *
 * FIGURES: every body goes through ONE adapter, drawPlayer() → the shared fluid-body library ./athlete (forward-kinematic skeleton, tapered
 * muscular limbs, full range of motion). The bicycle kick is authored as key poses on that skeleton (angles, not points) and flown on a real
 * ballistic pelvis arc, so the body goes horizontal and inverted, the legs scissor and the arms reach back to cushion the landing.
 * Kits: Real Madrid all white (paper) with navy trim, Ronaldo's 7 on the back; Juventus black-and-white stripes; Buffon in keeper kit.
 * Inks: yellow (floodlights, grass with blue, highlights), red (skin screen, crowd, cones), blue (grass, keeper kit, mat), navy (key line,
 * stripes, night). Scenes read only their local t; drawn objects (bodies, ball) on twos, cameras on ones; all randomness seeded.
 * Budget: ~120–220 plate ops per frame (4 plates), ~300 on passage frames. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,settle,TAU,type Pt} from '../../paths/riso/motion';
import {sparkBurst} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,posed,clampPose,keyPoses,blendPose,stand,runCycle,strike,header,keeperSet,lunge,celebrate,
 type Pose,type V3,type AthleteStyle,type Place,type InkFill,type Build,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional timings (≈2.6 words/s). `at` = word onset in the chapter's audio (s); `seconds` includes the silent
 * tail that carries the .65 s passage. The Kokoro generator (scripts/plays/kokoro-narrate.py) writes timing.json; withTiming then swaps in the
 * real clip lengths and word onsets and every action below re-times itself. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Turin, 2018. Real Madrid attack down the right. Ronaldo waits in the box, back to goal. Carvajal crosses. Ronaldo flies up... Goal!',seconds:13.6,
  cues:[[.2,'Turin'],[1.32,'Real Madrid attack'],[3.98,'Ronaldo waits'],[7.56,'Carvajal crosses'],[9.03,'Ronaldo flies'],[10.59,'Goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. His eyes never leave the ball. He jumps early, lies flat in the air, and scissors his legs.',seconds:11.6,
  cues:[[.15,'Watch it again'],[2.19,'His eyes'],[5.24,'jumps early'],[6.15,'lies flat'],[8.6,'scissors']]},
 {label:'Behind the goal',text:"Buffon can't move. It's two-nil, and even the Juventus fans stand up and clap!",seconds:7.7,
  cues:[[.15,'Buffon'],[.53,"can't move"],[1.66,"It's two-nil"],[3.73,'Juventus fans'],[4.5,'stand up'],[5.65,'clap']]},
 {label:'Your turn',text:'Beginners: practise on soft ground, with a coach. The secret is timing and body shape. Watch the ball, jump early, and land safely on your hands and back.',seconds:15,
  cues:[[.15,'Beginners'],[1.56,'soft ground'],[3.25,'coach'],[5.14,'timing'],[5.91,'body shape'],[7.03,'Watch the ball'],[8.33,'jump early'],[9.64,'land safely'],[11.18,'hands and back']]},
];
/** Kokoro timing: null until the lead voices the film. After running kokoro-narrate.py, replace `null` with the import of
 * '../../../public/plays/narration/ronaldo-bicycle-2018/timing.json' (as the other films do) — nothing else changes. */
import timingJson from '../../../public/plays/narration/ronaldo-bicycle-2018/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('cr7: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const lerpAng=(a:number,b:number,u:number)=>{let d=((b-a)%TAU+TAU*1.5)%TAU-Math.PI;return a+d*u;};

// ---------------------------------------------------------------- the card-window frame + the TV camera (a real pinhole projection)
/** world (0,0) on the CANVAS centre, 1 world unit = 1 sheet unit (× the engine's arrival scale, so passages and seams stay exact) */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame() so aperture(t) (which gets no sheet)
 * uses the same lens as the frame it zooms out of */
let LENS=1;
/** metres, right-handed, y up. The Juventus goal line is x = 0 (posts z = ±3.66, net toward +x), the pitch runs to x = −105, touchlines
 * z = ±34. Real Madrid attack +x; their right wing is +z (the near side for the main camera). */
type Cam={eye:V3;F:number;f:V3;r:V3;u:V3;project(p:V3):[number,number,number];scale(p:V3):number};
function lookAt(eye:V3,target:V3,F:number):Cam{const f=nrm(sub(target,eye)),r=nrm(cross(f,[0,1,0])),u=cross(r,f);
 return{eye,F,f,r,u,project:p=>{const d=sub(p,eye),z=Math.max(.05,dot(d,f));return[F*dot(d,r)/z,-F*dot(d,u)/z,z];},scale:p=>F/Math.max(.05,dot(sub(p,eye),f))};}
const NEAR=.35;
const toCam=(c:Cam,P:V3):V3=>{const d=sub(P,c.eye);return[dot(d,c.r),dot(d,c.u),dot(d,c.f)];};
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
/** polygon clipped against the near plane, projected */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped), width wm metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,cap=1e9){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=clamp(c.F*wm/qa[2]/2,1.1,cap),wb=clamp(c.F*wm/qb[2]/2,1.1,cap),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
type View={hx:number;hy:number};
/** half the visible sheet (with margin for the .68 passage preview) */
const view=(s:Sheet):View=>({hx:s.W/(2*.68)+80,hy:s.H/(2*.68)+80});

// ---------------------------------------------------------------- the Allianz Stadium at night: steep bowl, roof lights, crowd, boards, grass, lines, goal
/** stand planes (a along, b up the rake 0..1): far side, behind the goal, near (main) side, far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-112,10,a),1.2+19*b,-39-24*b],
 (a,b)=>[10+24*b,1.2+19*b,lerp(46,-46,a)],
 (a,b)=>[lerp(10,-112,a),1.2+19*b,39+24*b],
 (a,b)=>[-114-24*b,1.2+19*b,lerp(-46,46,a)],
];
const STAND_COLS=[88,52,88,52],STAND_ROWS=13;
/** night sky, stand planes, crowd speckle (Juventus black and white, a few yellow and blue), roof edge with floodlights, camera flashes.
 * roar lifts the crowd (standing and clapping) — one knockout + a few fills. */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.88);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D();
 for(const S of STANDS){addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of[.36,.7])seg3(c,S(0,b),S(1,b),.7,walk);
  addPoly(roof,polyP(c,[S(0,1),S(1,1),add(S(1,1.18),[0,3,0]),add(S(0,1.18),[0,3,0])]));}
 s.tone(B,planes,.32);s.knockout(walk,.6);
 const dots=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=[0,0,0,0];
 STANDS.forEach((S,si)=>{const cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.36)<.03||Math.abs(b-.7)<.03)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.5/q[2],2.5,12),lift=roar>0?roar*z*(.5+.9*Math.max(0,Math.sin(tt*11+h*TAU))):0;
   const ink=h<.66?0:h<.9?1:h<.96?2:3;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}});
 if(any[0])s.knockout(dots[0],.75);if(any[1])s.fill(K,dots[1],.95);if(any[2])s.fill(Y,dots[2],.95);if(any[3])s.fill(B,dots[3],.95);
 // roof: a dark overhang with a paper edge line and floodlight panels along it
 s.fill(K,roof,.95);
 const edge=new Path2D(),lamp=new Path2D(),halo=new Path2D();
 STANDS.forEach((S,si)=>{seg3(c,add(S(0,1.18),[0,3,0]),add(S(1,1.18),[0,3,0]),.5,edge);for(let i=0;i<8;i++){const P=add(S((i+.5)/8,1.14),[0,2.7,0]),q=toCam(c,P);if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx+300||Math.abs(p[1])>v.hy+300)continue;
  const w=clamp(c.F*1.6/q[2],4,90),h=w*.45;lamp.rect(p[0]-w,p[1]-h,w*2,h*2);const r=w*3.2;halo.addPath(polyPath(blob(p[0],p[1]+r*.3,r,r*.8,si*9+i,{amp:.08,n:14}),true));}});
 s.knockout(halo,.2);s.tone(Y,halo,.45);s.knockout(edge,.7);s.knockout(lamp);s.fill(Y,lamp,.6);
 if(flash>0){const p=new Path2D();let n=0;for(let i=0;i<14;i++){const r1=hash(i*17+Math.floor(t*12)*101,3),r2=hash(i*29+Math.floor(t*12)*7,4),q=pr(c,STANDS[Math.floor(r1*4)%4](r2,.1+.8*hash(i,Math.floor(t*12))));if(!q||Math.abs(q[0])>v.hx||Math.abs(q[1])>v.hy)continue;const z=12+16*flash;
  p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));n++;}if(n){s.knockout(p);s.fill(Y,p,.95);}}
}
/** grass (yellow × blue = green), mowing stripes, LED boards, paper lines */
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-50],[14,0,-50],[14,0,50],[-118,0,50]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.88);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-38],[-(k+1)*5.5,0,-38],[-(k+1)*5.5,0,38],[-k*5.5,0,38]]));s.tone(K,st,.12);
 // LED boards: blue with yellow panels (behind the goal and along the far touchline)
 const bd=new Path2D(),pn=new Path2D();
 addPoly(bd,polyP(c,[[8.6,0,-30],[8.6,0,30],[8.6,.95,30],[8.6,.95,-30]]));addPoly(bd,polyP(c,[[-110,0,-37.5],[6,0,-37.5],[6,.95,-37.5],[-110,.95,-37.5]]));
 for(let k=0;k<10;k++){const z=-28+k*6;addPoly(pn,polyP(c,[[8.55,.25,z],[8.55,.25,z+3.4],[8.55,.7,z+3.4],[8.55,.7,z]]));}
 for(let k=0;k<18;k++){const x=-106+k*6.2;addPoly(pn,polyP(c,[[x,.25,-37.45],[x+3.4,.25,-37.45],[x+3.4,.7,-37.45],[x,.7,-37.45]]));}
 s.knockout(bd);s.fill(B,bd,.95);s.fill(K,bd,.3);s.fill(Y,pn,.95);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 const circ=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-11,0,9.15,Math.PI-.927,Math.PI+.927,10);circ(-52.5,0,9.15,0,TAU,24);
 addPoly(ln,polyP(c,[[-11.18,0,-.18],[-10.82,0,-.18],[-10.82,0,.18],[-11.18,0,.18]]));
 s.knockout(ln);
}
/** the goal: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2)),zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[0,0,z0],[0,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[0,0,z1],[0,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[0,H,z0],[0,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],[...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));s.knockout(net,.32);
 const mesh=new Path2D(),w=.022,S3=(a:V3,b:V3,ww:number,m:Path2D)=>seg3(c,a,b,ww,m,2.2);
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);S3([0,H,z],[back(z),1.9,z],w,mesh);S3([back(z),1.9,z],[back(z),0,z],w,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++)S3([back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],w,mesh);S3([0,y*H/1.9,z0],[back(z0),y,z0],w,mesh);S3([0,y*H/1.9,z1],[back(z1),y,z1],w,mesh);}
 for(let j=1;j<4;j++){const u=j/4;S3([2*u,H-.54*u,z0],[2*u,H-.54*u,z1],w,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D(),fo=new Path2D();for(const[a,b] of [[[0,0,z0],[0,H,z0]],[[0,0,z1],[0,H,z1]],[[0,H,z0-.06],[0,H,z1+.06]]] as [V3,V3][]){seg3(c,a,b,.13,fr);seg3(c,a,b,.2,fo);}
 s.knockout(fo);s.stroke(K,fo,2.2,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the ball
/** paper ball, navy pentagon panels, blue shade crescent, navy rim, glint. (x,y) = centre; r in sheet units */
function ball(s:Sheet,x:number,y:number,r:number,rot:number,smear=0,dir=0){
 let pts=blob(x,y,r,r,3,{amp:.02,n:28});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(q=>{const b=-((q[0]-x)*dx+(q[1]-y)*dy);return b>0?[q[0]-dx*smear*Math.min(1,b/r),q[1]-dy*smear*Math.min(1,b/r)] as Pt:q;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 const sh=new Path2D();sh.arc(x,y,r*1.05,0,TAU);sh.moveTo(x-r*.28+r*1.2,y-r*.3);sh.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);s.tone(B,sh,.45);
 if(r>5){const pan=new Path2D(),pent=(cx:number,cy:number,pr_:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr_,cy+Math.sin(a)*pr_]);}return polyPath(q,true);};
  pan.addPath(pent(x+Math.cos(rot)*r*.2,y+Math.sin(rot)*r*.2,r*.3,rot));for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92,r*.28,a+Math.PI));}s.fill(K,pan,.95);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.2,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN1:InkFill[]=[[Y,.32],[R,.2]],SKIN2:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN3:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
const REAL=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN1,hair:K,line:K,trim:[K,.45],number:n,numberInk:K,hairStyle:'short',seed:n,...o});
const JUVE=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:K,shorts:[K,.88],socks:'paper',boots:K,skin:SKIN1,hair:K,line:K,number:n,numberInk:Y,hairStyle:'short',seed:40+n,...o});
const B_CR7:Build={height:1.87,bulk:1.04,thighs:1.1};

// ---------------------------------------------------------------- the play: keyframed tracks (τ = seconds after Carvajal's cross)
/** contact (the overhead kick) and the goal: the cross flies 1.55 s; the shot reaches the line .44 s later */
const TC=1.55,TG=TC+.44,T_TAKE=TC-.3;
type Role='cr7'|'carvajal'|'sandro'|'desciglio'|'buffon'|'run';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
/** positions [τ, x, z], Hermite-interpolated. All inferred from the written accounts (see header). */
const ACTORS:Actor[]=[
 {name:'Cristiano Ronaldo',role:'cr7',hero:true,style:REAL(7,{build:B_CR7,skin:SKIN2,seed:7}),keys:[[-10,-21,-4.8],[-7,-19,-4.2],[-3.5,-15.4,-2.3],[-1.2,-12.4,-.8],[.3,-11.5,-.3],[.8,-11.15,-.08],[T_TAKE,-11.02,0],[TC,-10.9,.05],[TC+.5,-10.62,.12],[TC+2.3,-10.5,.2],[TC+3.5,-8.6,5.2],[TC+5.5,-5.5,12],[TC+9,-3,17]]},
 {name:'Carvajal',role:'carvajal',style:REAL(2,{build:{height:1.73,bulk:.96},seed:2}),keys:[[-10,-64,30],[-6,-46,26.5],[-3,-35,23],[-1,-28.4,20.9],[0,-25.6,19.8],[.5,-24.8,19.2],[1.5,-23.6,18.4],[4,-21,17],[9,-15,12]]},
 {name:'De Sciglio',role:'desciglio',style:JUVE(2,{build:{height:1.83},skin:SKIN1}),keys:[[-10,-19.5,-2.5],[-6,-17,-1.4],[-3,-14,.2],[-1,-12.4,.8],[.6,-12,1.5],[TC-.6,-11.75,1.5],[TC,-11.7,1.5],[TC+.8,-11.5,1.6],[TC+4,-10,1.5],[TC+9,-8,2]]},
 {name:'Alex Sandro',role:'sandro',style:JUVE(12,{skin:SKIN3,hairStyle:'curly'}),keys:[[-10,-58,21],[-6,-43,21],[-3,-33.2,20.2],[-1,-28.2,19.1],[0,-26.9,18.8],[.6,-26.3,18.6],[3,-25,17.3],[9,-21,15]]},
 {name:'Chiellini',role:'run',style:JUVE(3,{build:{height:1.87,bulk:1.06}}),keys:[[-10,-14,5],[-4,-10.5,4],[0,-8.2,3.4],[TC,-7.6,3.1],[TC+2,-6.8,3.2],[TC+9,-6,4]]},
 {name:'Barzagli',role:'run',style:JUVE(15,{build:{height:1.87},hairStyle:'balding'}),keys:[[-10,-13,-4],[-4,-9.5,0],[0,-7.4,1.4],[TC,-6.7,1.8],[TC+2,-6.2,2.2],[TC+9,-6,2.5]]},
 {name:'Pjanić',role:'run',style:JUVE(5,{build:{height:1.78}}),keys:[[-10,-26,4],[-4,-20,3.6],[0,-17.2,3],[TC+1,-15.8,2.6],[TC+9,-14,2]]},
 {name:'Khedira',role:'run',style:JUVE(6,{build:{height:1.89}}),keys:[[-10,-28,-10],[-4,-21,-8.6],[0,-17.6,-7.3],[TC+1,-16.6,-6.6],[TC+9,-15,-6]]},
 {name:'Matuidi',role:'run',style:JUVE(14,{skin:SKIN3,hairStyle:'bald'}),keys:[[-10,-38,15],[-4,-27.5,12.2],[0,-22.4,10.2],[TC+1,-20.6,9],[TC+9,-18,7]]},
 {name:'Real 9',role:'run',style:REAL(9,{skin:SKIN2,seed:9}),keys:[[-10,-19,-6],[-4,-12,-1],[0,-9.2,4],[TC,-8,5.6],[TC+2,-7.4,5.4],[TC+9,-7,5]]},
 {name:'Real 22',role:'run',style:REAL(22,{build:{height:1.77},seed:22}),keys:[[-10,-34,8],[-4,-24,7.8],[0,-19,7.2],[TC+1,-17.2,6.6],[TC+9,-12,6]]},
 {name:'Buffon',role:'buffon',style:{shirt:[B,.6],shorts:[B,.6],socks:[B,.6],boots:K,skin:SKIN1,hair:K,line:K,gloves:Y,number:1,numberInk:'paper',sleeves:'long',hairStyle:'short',build:{height:1.92},seed:1},
  keys:[[-10,-1.8,1.2],[-4,-1.5,2.6],[-1,-1.25,2.4],[0,-1.2,2.1],[TC-.4,-1.05,1.1],[TC,-1.02,1],[TC+9,-1,1]]},
];
const CR7=0,CARV=1,DES=2,BUF=ACTORS.findIndex(a=>a.role==='buffon');
/** Hermite through time-spaced keys (tangents scaled per segment so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const T0=-11,T1=14,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
/** yaw that faces the direction (dx,dz): athlete.ts faces +x at yaw 0 and yaw turns left, so facing = (cos y, −sin y) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);

// ---------------------------------------------------------------- the bicycle kick: key poses on the athlete skeleton (u = seconds from contact)
/** Mechanics: set with the back to goal and the eyes on the ball → the LEFT knee drives up while the right foot pushes off (take-off .3 s
 * before contact, so the jump peaks at the ball: "jump early") → the body tips back past horizontal, both legs rising → the SCISSOR: the left
 * leg drops as the right leg whips up straight, laces through the ball above the hips → arms out wide, then reaching back to the ground →
 * land on the hands, then the upper back, chin tucked, knees up → sit up, kneel, get up. Pitch −96° at contact = horizontal and slightly
 * inverted (head below the hips). */
const BIKE:[number,Pose][]=[
 [-.45,posed({lHipF:34,rHipF:48,lKnee:46,rKnee:74,lAnk:-8,rAnk:14,lean:16,pitch:2,neckP:-38,lShA:34,rShA:30,lShF:-26,rShF:16,lElb:44,rElb:50})],
 [-.3,posed({pitch:-14,lean:-8,lHipF:98,lKnee:78,lAnk:30,rHipF:-10,rKnee:14,rAnk:52,lShF:72,rShF:64,lShA:44,rShA:40,lElb:40,rElb:46,neckP:-32})],
 [-.17,posed({pitch:-60,lean:-12,lHipF:124,lKnee:26,lAnk:40,rHipF:36,rKnee:100,rAnk:36,lShA:86,rShA:84,lShF:18,rShF:12,lElb:24,rElb:28,neckP:18})],
 [-.07,posed({pitch:-84,lean:-10,lHipF:70,lKnee:40,lAnk:40,rHipF:74,rKnee:62,rAnk:44,lShA:90,rShA:90,lShF:-12,rShF:-12,lElb:18,rElb:18,neckP:38})],
 [0,posed({pitch:-96,lean:-8,rHipF:100,rKnee:8,rAnk:52,lHipF:-14,lKnee:52,lAnk:30,lShA:88,rShA:88,lShF:-36,rShF:-36,lElb:14,rElb:14,neckP:48,lHand:1,rHand:1})],
 [.14,posed({pitch:-100,lean:-4,rHipF:122,rKnee:20,rAnk:40,lHipF:-26,lKnee:60,lAnk:24,lShA:58,rShA:58,lShF:-66,rShF:-66,lElb:10,rElb:10,neckP:46,lHand:1,rHand:1})],
 [.34,posed({pitch:-90,lean:6,rHipF:98,rKnee:46,lHipF:8,lKnee:74,lShA:36,rShA:36,lShF:-78,rShF:-78,lElb:22,rElb:22,neckP:52,lHand:1,rHand:1})],
 [.58,posed({pitch:-90,lean:26,rHipF:82,rKnee:82,lHipF:70,lKnee:92,lShA:42,rShA:42,lShF:-56,rShF:-56,lElb:56,rElb:56,neckP:46,lHand:.8,rHand:.8})],
 [1.15,posed({pitch:-14,lean:14,lHipF:88,rHipF:76,lKnee:62,rKnee:34,lShA:26,rShA:26,lShF:-44,rShF:-44,lElb:14,rElb:14,neckP:6,lHand:1,rHand:1})],
 [1.75,posed({lHipF:96,lKnee:118,lAnk:10,rHipF:-8,rKnee:104,rAnk:40,lean:24,pitch:4,lShA:30,rShA:30,lShF:20,rShF:10,lElb:40,rElb:40,neckP:-8})],
 [2.3,runCycle(.05,{speed:.45})],
];
const CONTACT_POSE=clampPose(BIKE[4][1]);
/** pelvis height of a pose when its lowest point touches the ground */
const pelvisY=(p:Pose,b:Build)=>solve({...p,air:0},b).pelvis[1];
/** the laces: 60 % from the ankle to the toe */
const lacesOf=(sk:{rAn:V3;rToe:V3})=>mix3(sk.rAn,sk.rToe,.6);
/** a ballistic pelvis: take-off at u0 from standing height, through (0, hc) at contact, gravity 9.81 */
function jumpArc(b:Build,contactLaces:number){
 const sk=solve({...CONTACT_POSE,air:0},b),hc=contactLaces-(lacesOf(sk)[1]-sk.pelvis[1]),y0=pelvisY(clampPose(BIKE[1][1]),b),v=(hc-y0+4.905*.09)/.3;
 return{hc,y0,v,h:(u:number)=>y0+v*(u+.3)-4.905*(u+.3)*(u+.3)};
}
/** a jumper's pose with its air channel set from the ballistic arc (air ≥ 0 grounds it on landing) */
function flyPose(p:Pose,u:number,arc:{h:(u:number)=>number},b:Build):Pose{if(u<=-.3||u>1.2)return p;return{...p,air:clamp(arc.h(u)-pelvisY(p,b),0,2)};}
const ARC_CR7=jumpArc(B_CR7,2.33);
/** Ronaldo faces out of the box (back to goal), a little toward the crosser: facing (−.97, −.26) → the kick goes back over his head to +x */
const R_YAW=yawTo(-.97,-.26);

// ---------------------------------------------------------------- the ball
type State={pose:Pose;place:Place};
const BALL_R=.11;
/** Carvajal's contact point (right foot, just in front of the planted left) */
const P0:V3=(()=>{const[x,z]=posOf(CARV,0),r=posOf(CR7,TC),d=nrm([r[0]-x,0,r[1]-z]);return[x+d[0]*.3-d[2]*.12,BALL_R,z+d[2]*.3+d[0]*.12];})();
/** the contact point: the ball sits on Ronaldo's laces at TC */
const PC:V3=(()=>{const[x,z]=posOf(CR7,TC),sk=solve({...CONTACT_POSE,air:clamp(ARC_CR7.hc-pelvisY(CONTACT_POSE,B_CR7),0,2)},B_CR7,{x,z,yaw:R_YAW}),l=lacesOf(sk);return add(l,mul(nrm(sub(P0,l)),BALL_R+.03));})();
/** where it crosses the line: inside the right post (the attackers' right = +z) */
const PG:V3=[0,.8,2.95],NETP:V3=[1.55,.62,3.12],REST:V3=[1.62,BALL_R,3.3];
const V_CROSS:V3=[(PC[0]-P0[0])/TC,(PC[1]-P0[1]+4.905*TC*TC)/TC,(PC[2]-P0[2])/TC];
const V_SHOT:V3=(()=>{const d=TG-TC;return[(PG[0]-PC[0])/d,(PG[1]-PC[1]+4.905*d*d)/d,(PG[2]-PC[2])/d];})();
function ballAt(tau:number):V3{
 if(tau<0){// Carvajal's dribble down the right: touches every ~1.9 m, then he sets the ball for the cross
  const dribble=(tt:number):V3=>{const p=posOf(CARV,tt),v=velOf(CARV,tt),l=Math.hypot(v[0],v[1])||1,f=((distOf(CARV,tt)/1.9)%1+1)%1,d=.42+.38*(f<.18?f/.18:1-(f-.18)/.82);return[p[0]+v[0]/l*d,BALL_R,p[1]+v[1]/l*d];};
  if(tau<-.4)return dribble(tau);const u=easeOut((tau+.4)/.4);return mix3(dribble(-.4),P0,u);}
 if(tau<TC){const t=tau;return[P0[0]+V_CROSS[0]*t,P0[1]+V_CROSS[1]*t-4.905*t*t,P0[2]+V_CROSS[2]*t];}
 if(tau<TG){const t=tau-TC;return[PC[0]+V_SHOT[0]*t,PC[1]+V_SHOT[1]*t-4.905*t*t,PC[2]+V_SHOT[2]*t];}
 if(tau<TG+.22)return mix3(PG,NETP,easeOut((tau-TG)/.22));
 const u=clamp((tau-TG-.22)/.35);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u*u),lerp(NETP[2],REST[2],u)];
}
const ballSpin=(tau:number)=>tau<0?distOf(CARV,tau)/BALL_R:tau<TC?tau*9:tau<TG?TC*9-(tau-TC)*40:TC*9-(TG-TC)*40;
const bulgeAt=(tau:number)=>tau<TG+.05?0:Math.exp(-(tau-TG-.05)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/8),ph=distOf(k,tau)/(2.4+2.2*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:18,rShA:16,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'cr7':{const u=tau-TC;
   if(u>=-.62&&u<2.3)pose=keyPoses(u,[[-.62,loco(k,TC-.62)],...BIKE]);
   else if(u>=2.3){const run=celebrate(distOf(k,tau)/4,{kind:'run'});pose=blendPose(BIKE[BIKE.length-1][1],run,sm(2.3,2.9,u));}
   pose=flyPose(pose,u,ARC_CR7,B_CR7);
   yaw=lerpAng(faceYaw(k,tau,[posOf(CARV,tau)[0],0,posOf(CARV,tau)[1]]),R_YAW,sm(-1.5,-.62,u));
   if(u>1.6)yaw=lerpAng(R_YAW,faceYaw(k,tau),sm(1.6,2.8,u));
   break;}
  case 'carvajal':{const w=sm(-.75,-.5,tau)*(1-sm(.45,.9,tau));if(w>0)pose=blendPose(pose,strike(clamp((tau+.5)/.95)),w);
   const r=posOf(CR7,TC);yaw=lerpAng(yaw,yawTo(r[0]-x,r[1]-z),sm(-1.4,-.6,tau)*(1-sm(.8,1.6,tau)));break;}
  case 'sandro':{const w=sm(-.7,-.5,tau)*(1-sm(.35,.7,tau));if(w>0)pose=blendPose(pose,lunge(clamp((tau+.55)/.9),{side:'l'}),w);const c=posOf(CARV,tau);yaw=lerpAng(yaw,yawTo(c[0]-x,c[1]-z),sm(-2,-1,tau));break;}
  case 'desciglio':{const w=sm(TC-.8,TC-.56,tau)*(1-sm(TC+.5,TC+.85,tau));if(w>0)pose=blendPose(pose,header(clamp((tau-(TC-.56))/1.05)),w);
   yaw=lerpAng(yaw,yawTo(P0[0]-x,P0[2]-z),sm(-1,0,tau)*(1-sm(TC+.6,TC+1.4,tau)));break;}
  case 'buffon':{const ph=Math.min(tau,TC-.1)*1.4;pose=keeperSet(ph);
   // flat-footed: the set holds while the shot flies past, then he turns to look at the net
   if(tau>TG+.2)pose=blendPose(pose,posed({...{lHipF:30,rHipF:30,lKnee:34,rKnee:34,lean:10,lShA:22,rShA:22,lElb:30,rElb:30},neckY:-70,neckP:6}),sm(TG+.2,TG+.9,tau));
   yaw=faceYaw(k,Math.min(tau,TC));break;}
  default:break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- THE ADAPTER: every body in this film goes through here
/** drawPlayer(sheet, pose, camera, style, place, motion): one call per figure → the shared fluid-body library (lib/plays/riso/athlete.ts).
 * `prev` (the pose one drawn frame earlier) turns on secondary motion (hair, shirt hem) and, with `smear`, a halftone motion trail. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:State;smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,camera,style,place,{prevPlace:o.prev.place,threshold:9});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ---------------------------------------------------------------- the pitch through a camera: shadows, bodies, the ball, the goal, in depth order
type PlayOpts={dtau?:number;smear?:boolean;spark?:number;goalLast?:boolean};
/** τ = the play clock for this frame (on twos); dtau = τ per drawn frame (for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,o:PlayOpts={}):{ball:Pt|null;br:number;cr7?:DrawResult}{
 const{dtau=0,smear=false,spark=0,goalLast=false}=o;
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(4,c.F*BALL_R/bq[2]):0;
 // ball shadow on the grass
 const gq=pr(c,[b[0],0,b[2]]);if(gq&&b[0]<.1){const k=c.F/Math.max(1,toCam(c,[b[0],0,b[2]])[2]),r=clamp(.16*k*(1-Math.min(.7,b[1]/4)),2,300);s.tone(K,polyPath(blob(gq[0],gq[1],r,r*.3,2,{amp:.05,n:12}),true),.45*(1-Math.min(.8,b[1]/5)));}
 type Item={d:number;draw:()=>void};const items:Item[]=[];let cr7:DrawResult|undefined;const m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;const passing=!!s._passage.pending;
 ACTORS.forEach((a,k)=>{const st=stateOf(k,tau),x=st.place.x??0,z=st.place.z??0,q=toCam(c,[x,1,z]);if(q[2]<NEAR+.5)return;const p=scr(c,q),h=c.F*1.9/q[2];
  if(Math.abs(p[0])>v.hx+h||Math.abs(p[1])>v.hy+h)return;
  const prev=dtau>0&&(a.hero||a.role==='desciglio')?stateOf(k,tau-dtau):undefined;
  // the outgoing scene of a passage is zoomed past the camera: its figures must not climb to high detail (cost), so they print simply
  const key_=a.hero||a.role==='desciglio'||a.role==='buffon',style=passing?{...a.style,detail:a.hero?'mid' as const:'low' as const}:!key_&&h*ppu<150?{...a.style,detail:'low' as const}:a.style;
  items.push({d:q[2],draw:()=>{const r=drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!!a.hero});if(a.hero)cr7=r;}});});
 const inNet=b[0]>.05;
 const drawBall=()=>{if(!bg)return;const sp=tau>TC&&tau<TG?Math.hypot(...V_SHOT):tau>0&&tau<TC?16:0,nb=pr(c,sub(b,mul(tau<TC?V_CROSS:V_SHOT,.03)));
  const dir=nb?Math.atan2(bg[1]-nb[1],bg[0]-nb[0]):0,sm_=nb&&sp>0?Math.min(br*3,Math.hypot(bg[0]-nb[0],bg[1]-nb[1])*1.4):0;ball(s,bg[0],bg[1],br,ballSpin(tau),sm_,dir);
  if(spark>0)sparkBurst(s,Y,bg[0],bg[1],br*4.2,{n:9,seed:17,g:easeOutBack(clamp(spark*2))*(1-clamp((spark-.5)*2)),width:br*.5});};
 const goal=()=>goal3(s,c,bulgeAt(tau),b[2]);
 if(!goalLast){if(inNet)drawBall();goal();}
 if(!inNet||goalLast)items.push({d:bq[2],draw:drawBall});
 items.sort((p,q)=>q.d-p.d);for(const it of items)it.draw();
 if(goalLast)goal();
 return{ball:bg,br,cr7};
}

// ---------------------------------------------------------------- 1 · LIVE: the high main-stand camera, real time
/** τ from chapter time: real time, anchored so the cross leaves on "crosses" and the ball crosses the line on "Goal" */
function tau1(t:number){const tC=CUEW(0,'Carvajal')+.35,tG=CUEW(0,'Goal')+.05,k=clamp(TG/Math.max(.5,tG-tC),.6,1.25);return(t-tC)*k;}
const E1:V3=[-46,21,62];
function cam1(t:number):Cam{
 const tau=tau1(t),tW=CUEW(0,'Ronaldo waits'),tC=CUEW(0,'Carvajal'),tG=CUEW(0,'Goal'),S=SECS(0);
 const bs=(u:number):V3=>{const q=ballAt(u);return[q[0],0,q[2]];},bt=mul(add(add(bs(tau),bs(tau-.3)),bs(tau-.6)),1/3);
 const r=posOf(CR7,tau),R3:V3=[r[0],0,r[1]],ahead:V3=[bt[0]+6,0,bt[2]-3];
 const w1=sm(tW-.3,tW+1.4,t,easeInOutSine),w2=sm(tC,tC+1.3,t,easeInOutSine),w3=sm(tG+.4,tG+2,t,easeInOutSine);
 const T=mix3(mix3(mix3(ahead,mix3(bt,R3,.5),w1),mix3(bt,R3,.62),w2),mix3(R3,[0,0,2],.35),w3);T[1]=1.2;
 const F=key(t,[[0,3300],[CUEW(0,'Real'),3900],[tW,4300],[tC,4600],[CUEW(0,'Ronaldo flies'),6200],[tG,6600],[S,7400]],easeInOutSine)*LENS;
 return lookAt(E1,T,F);
}
const ch1:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam1(t),tau=tau1(twos(t)),tG=CUEW(0,'Goal');
  stadium(s,c,v,t,{roar:sm(tG+.2,tG+.9,t),flash:sm(tG+.3,tG+.6,t)});
  ground(s,c);play(s,c,v,tau);},
 aperture(t){const c=cam1(t),b=ballAt(tau1(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*BALL_R/q[2]*1.6),12);},
 still:10,
};

// ---------------------------------------------------------------- 2 · REPLAY: slow motion from a low reverse angle, close on Ronaldo
function tau2(t:number){return key(t,mono([[0,TC-1.05],[CUEW(1,'His eyes'),TC-.62],[CUEW(1,'jumps early'),T_TAKE],[CUEW(1,'lies flat'),TC-.17],[CUEW(1,'scissors'),TC-.1],[CUEW(1,'scissors')+1.1,TC+.08],[SECS(1),TC+.55]]),linear);}
function cam2(t:number):Cam{
 const tau=tau2(t),[x,z]=posOf(CR7,tau),S=SECS(1),sc=CUEW(1,'scissors'),follow=sm(sc+1.2,S-.5,t,easeInOutSine);
 const b=ballAt(tau),lift=sm(CUEW(1,'jumps early')-.3,CUEW(1,'lies flat'),t,easeInOutSine)*(1-sm(sc+1.4,S,t));
 const E:V3=[x+2-follow*.6,1.05+.3*lift,z-7.6],T0:V3=[x+.3-.5*sm(0,CUEW(1,'His eyes'),t),1.45+.35*lift,z];
 const T=mix3(T0,[b[0],Math.max(.9,b[1]),b[2]],follow*.85);
 const F=key(t,[[0,2100],[CUEW(1,'His eyes'),2750],[CUEW(1,'jumps early'),2500],[CUEW(1,'lies flat'),2700],[sc,2550],[S,2300]],easeInOutSine)*LENS;
 return lookAt(E,T,F);
}
const ch2:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam2(t),tp=twos(t),tau=tau2(tp),dtau=Math.max(.004,tau-tau2(tp-1/12));
  stadium(s,c,v,t);ground(s,c);play(s,c,v,tau,{dtau,smear:true,spark:tau>=TC-.01?(tau-TC)/.18:0});},
 aperture(t){const c=cam2(t),b=ballAt(tau2(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(22,c.F*BALL_R/q[2]*1.4),12);},
 still:7.2,
};

// ---------------------------------------------------------------- 3 · REPLAY behind the goal: past Buffon, then up to the Juventus fans
function tau3(t:number){return key(t,mono([[0,TC-.3],[CUEW(2,'Buffon')+.25,TC+.02],[CUEW(2,"It's")+.15,TG+.03],[SECS(2),TG+2.6]]),linear);}
const E3:V3=[7.2,1.75,-1.5];
/** the fans' section: far side stand, x −34 … 4 */
const FANS=(()=>{const out:{a:number;b:number;h:number}[]=[];for(let j=0;j<11;j++)for(let i=0;i<46;i++){const h=hash(i*97+j*13,21);if(h<.1)continue;out.push({a:(i+.5+(hash(i,j)-.5)*.35)/46,b:.03+j*.05,h});}return out;})();
const fanPt=(a:number,b:number):V3=>[lerp(-34,4,a),1.2+19*b,-39-24*b];
function cam3(t:number):Cam{
 const tau=tau3(t),tF=CUEW(2,'Juventus'),up=sm(tF-.35,tF+1.1,t,easeInOutSine);
 const b=ballAt(Math.min(tau,TG)),toPlay:V3=mix3([-9,1.2,-.2],[b[0]-2,Math.max(1,b[1]),b[2]],.35*sm(0,CUEW(2,"It's"),t));
 const T=mix3(toPlay,fanPt(.6,.2),up),F=lerp(2000,4400,up)*LENS;
 return lookAt(add(E3,[0,.3*up,-.3*up]),T,F);
}
/** the fans: seated rows that stand up and clap (bodies, heads, hands) — batched: knockout, shirts, skin, hair, hands */
function fans(s:Sheet,c:Cam,v:View,t:number,rise:number,clap:number){
 if(rise<=0&&clap<=0&&c.f[2]>-.3)return;
 const sil=new Path2D(),dark=new Path2D(),stripe=new Path2D(),skin=new Path2D(),hair=new Path2D(),hands=new Path2D();let n=0;
 for(const f of FANS){const stand=clamp(rise*1.6-f.h*.6),P=fanPt(f.a,f.b),q=toCam(c,add(P,[0,.45+.5*stand,0]));if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;
  const k=c.F/q[2],w=.46*k,h=.62*k,hr=.13*k,x=p[0],y=p[1];n++;
  const body=polyPath([[x-w/2,y+h*.6],[x-w*.42,y-h*.35],[x-w*.18,y-h*.5],[x+w*.18,y-h*.5],[x+w*.42,y-h*.35],[x+w/2,y+h*.6]],true);sil.addPath(body);
  if(f.h<.45)dark.addPath(body);else if(f.h<.8){for(let i=-1;i<=1;i++)stripe.addPath(rectPath(x+i*w*.28-w*.06,y-h*.45,w*.12,h*1.05));}
  const head=polyPath(blob(x,y-h*.5-hr*.9,hr,hr*1.1,Math.floor(f.h*99),{amp:.06,n:10}),true);sil.addPath(head);skin.addPath(head);
  hair.addPath(polyPath(blob(x,y-h*.5-hr*1.35,hr*.95,hr*.55,Math.floor(f.h*77),{amp:.08,n:10}),true));
  if(stand>.2){const ph=twos(t)*10+f.h*TAU,gap=clap>0?w*(.04+.3*Math.abs(Math.sin(ph))*clap):w*.34,hy=y-h*.45-(clap>0?hr*2.2*clap:0),hs=hr*.72;
   for(const sx of[-1,1]){const hx=x+sx*(gap/2+hs);const hp=polyPath(blob(hx,hy,hs,hs*1.15,Math.floor(f.h*55)+sx,{amp:.05,n:8}),true);hands.addPath(hp);sil.addPath(hp);}}}
 if(!n)return;s.knockout(sil);s.fill(K,dark,.9);s.fill(K,stripe,.9);s.tone(Y,skin,.4);s.tone(R,skin,.3);s.fill(K,hair,.85);s.tone(Y,hands,.4);s.tone(R,hands,.32);s.stroke(K,sil,2.2,.9);
}
const ch3:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam3(t),tp=twos(t),tau=tau3(tp),tF=CUEW(2,'Juventus'),tS=CUEW(2,'stand up'),tCl=CUEW(2,'clap');
  const rise=sm(tF+.2,tS+.6,t),clap=sm(tS,tCl+.3,t);
  stadium(s,c,v,t,{roar:.6*sm(tF,tS+.5,t),flash:sm(tCl,tCl+.5,t)*.8});
  fans(s,c,v,t,rise,clap);
  ground(s,c);play(s,c,v,tau,{dtau:Math.max(.004,tau-tau3(tp-1/12)),goalLast:true});
  // the one bright flash in the stand — the passage material into the lesson
  const fl=sm(SECS(2)-1.3,SECS(2)-.7,t);if(fl>0){const q=pr(c,fanPt(.62,.34));if(q)sparkBurst(s,Y,q[0],q[1],90+120*fl,{n:10,seed:5,g:fl,width:14});}},
 aperture(t){const c=cam3(t),q=pr(c,fanPt(.62,.34))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:5,
};

// ---------------------------------------------------------------- 4 · THE LESSON: a young player on a soft crash mat, a coach tossing the ball
/** training ground, metres: mat centred on the origin (3.2 × 2 × .3 m); the player faces the coach (−x) with a small goal behind (+x);
 * the camera is side-on from −z so the kicking (right) leg is the near one. */
const B_KID:Build={height:1.38,bulk:.9,head:1.12},MAT_H=.3,MAT:[number,number,number,number]=[-1.6,1.6,-1,1];
const KID:AthleteStyle={shirt:R,shorts:'paper',socks:R,boots:K,skin:SKIN2,hair:K,line:K,trim:'paper',hairStyle:'curly',build:B_KID,seed:31};
const COACH:AthleteStyle={shirt:B,shorts:B,socks:B,boots:K,skin:SKIN1,hair:K,line:K,trim:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8,bulk:1.05},seed:32};
const TC4=1.5,ARC_KID=jumpArc(B_KID,2.33*1.38/1.87*.92),KID_X=.1,COACH_X=-2.7;
/** the lesson clock (kid τ, contact at TC4): slow motion keyed to the words */
function tau4(t:number){return key(t,mono([[0,TC4-3.2],[CUEW(3,'timing'),TC4-1.15],[CUEW(3,'Watch'),TC4-.55],[CUEW(3,'jump early'),TC4-.3],[CUEW(3,'land safely'),TC4+.36],[CUEW(3,'hands and back'),TC4+.56],[SECS(3),TC4+1.25]]),linear);}
const KNEEL=posed({lHipF:92,lKnee:92,lAnk:-10,rHipF:-4,rKnee:112,rAnk:40,lean:10,pitch:2,rShF:24,rElb:40,lShF:14,lShA:26,lElb:30,neckP:-4,rHand:.6});
const TOSS=[[-2.2,KNEEL],[-1.55,posed({lHipF:92,lKnee:92,lAnk:-10,rHipF:-4,rKnee:112,rAnk:40,lean:16,pitch:2,rShF:-38,rElb:14,lShF:30,lShA:24,lElb:30,neckP:-2,rHand:.7})],
 [-1.15,posed({lHipF:92,lKnee:92,lAnk:-10,rHipF:-4,rKnee:112,rAnk:40,lean:6,pitch:0,rShF:78,rElb:10,lShF:30,lShA:30,lElb:30,neckP:-14,rHand:1})],
 [-.6,posed({lHipF:92,lKnee:92,lAnk:-10,rHipF:-4,rKnee:112,rAnk:40,lean:4,rShF:60,rElb:20,lShF:10,lShA:26,lElb:30,neckP:-18,rHand:1})]] as [number,Pose][];
function coachState(tau:number):State{return{pose:keyPoses(tau-TC4,TOSS),place:{x:COACH_X,z:.25,y:0,yaw:0}};}
const READY_KID=posed({lHipF:30,rHipF:36,lKnee:40,rKnee:48,lean:14,pitch:3,neckP:-20,lShA:28,rShA:26,lShF:10,rShF:4,lElb:50,rElb:50});
function kidState(tau:number):State{
 const u=tau-TC4,pre=(tt:number)=>blendPose(stand(),READY_KID,.45+.3*Math.sin(tt*3.2));let pose=pre(tau);
 if(u>=-.62)pose=keyPoses(u,[[-.62,pre(TC4-.62)],...BIKE.slice(0,9)]);
 pose=flyPose(pose,u,ARC_KID,B_KID);
 const x=KID_X+.28*sm(-.3,.4,u);return{pose,place:{x,z:0,y:MAT_H,yaw:Math.PI}};
}
/** toss: from the coach's hand (release at TC4−1.15) on a ballistic arc to the laces at contact, then off over the kid's head into the goal */
const REL=TC4-1.15;
const HAND0:V3=(()=>{const sk=solve(clampPose(TOSS[2][1]),{height:1.8,bulk:1.05},{x:COACH_X,z:.25,yaw:0});return add(sk.rHa,[.1,.02,0]);})();
const KC:V3=(()=>{const sk=solve({...CONTACT_POSE,air:clamp(ARC_KID.hc-pelvisY(CONTACT_POSE,B_KID),0,2)},B_KID,{x:KID_X+.28*sm(-.3,.4,0),z:0,y:MAT_H,yaw:Math.PI}),l=lacesOf(sk);return add(l,[-(BALL_R+.03),.02,0]);})();
const V_TOSS:V3=(()=>{const d=TC4-REL;return[(KC[0]-HAND0[0])/d,(KC[1]-HAND0[1]+4.905*d*d)/d,(KC[2]-HAND0[2])/d];})();
function kidBall(tau:number):V3{
 if(tau<REL){const sk=solve(coachState(tau).pose,{height:1.8,bulk:1.05},{x:COACH_X,z:.25,yaw:0});return add(sk.rHa,[.1,.02,0]);}
 if(tau<TC4){const d=tau-REL;return[HAND0[0]+V_TOSS[0]*d,HAND0[1]+V_TOSS[1]*d-4.905*d*d,HAND0[2]+V_TOSS[2]*d];}
 const d=tau-TC4;return[KC[0]+9*d,KC[1]+1.2*d-4.905*d*d,KC[2]];
}
/** the crash mat as a projected box; `dip` squashes the top around dx (landing) */
function mat(s:Sheet,c:Cam,dip:number,dx:number,glow:number){
 const[x0,x1,z0,z1]=MAT,N=8,top=(x:number,z:number):V3=>[x,MAT_H-dip*.12*Math.exp(-Math.pow((x-dx)/.9,2))*(z>z0&&z<z1?1:.6),z];
 const topPts:V3[]=[];for(let i=0;i<=N;i++)topPts.push(top(lerp(x0,x1,i/N),z0));for(let i=N;i>=0;i--)topPts.push(top(lerp(x0,x1,i/N),z1));
 const front:V3[]=[];for(let i=0;i<=N;i++)front.push(top(lerp(x0,x1,i/N),z0));front.push([x1,0,z0],[x0,0,z0]);
 const sideL:V3[]=[top(x0,z0),top(x0,z1),[x0,0,z1],[x0,0,z0]],sideR:V3[]=[top(x1,z0),top(x1,z1),[x1,0,z1],[x1,0,z0]];
 const all=new Path2D(),tp=new Path2D(),sd=new Path2D();addPoly(tp,polyP(c,topPts));for(const q of[front,sideL,sideR])addPoly(sd,polyP(c,q));all.addPath(tp);all.addPath(sd);
 s.knockout(all);s.fill(B,all,.95);s.tone(K,sd,.45);s.tone(Y,tp,.2);
 const seam=new Path2D();for(const z of[-.35,.35]){const q:V3[]=[];for(let i=0;i<=N;i++)q.push(top(lerp(x0,x1,i/N),z));const p=q.map(v=>pr(c,v)).filter((v):v is Pt=>!!v);if(p.length>1)seam.addPath(ribbon(p,3,{seed:9,taper:.2,wobble:.5}));}
 s.fill(K,seam,.6);
 const edge=polyP(c,topPts);if(edge.length>2){s.fill(K,ribbon(edge,3.4,{seed:11,close:true,pressure:.3,wobble:.8}),.9);
  if(glow>0){const e=ribbon(edge,10+8*glow,{seed:12,close:true,pressure:.2,wobble:1});s.knockout(e,.9*glow);s.fill(Y,e,.95*glow);}}
}
function cam4(t:number):Cam{
 const tc=CUEW(3,'coach'),tt=CUEW(3,'timing'),tw=CUEW(3,'Watch'),tl=CUEW(3,'land safely'),S=SECS(3);
 const tx=key(t,[[0,-.2],[CUEW(3,'soft ground'),-.1],[tc,-1.2],[tt+.3,-1.05],[tw,-.25],[tl,.1],[S,-.35]],easeInOutSine);
 const ty=key(t,[[0,.9],[tc,.85],[tw,1.25],[CUEW(3,'jump early'),1.35],[tl,.95],[S,1.05]],easeInOutSine);
 const F=key(t,[[0,1800],[CUEW(3,'soft ground'),2300],[tc,2050],[tw,2550],[tl,2500],[S,2200]],easeInOutSine)*LENS;
 return lookAt([tx+.5,2.1,-6.4],[tx,ty,0],F);
}
/** "body shape": a blue ghost of the flat, inverted contact shape printed where the kid will be, so the move has a target to fly into */
function ghost(s:Sheet,c:Cam,show:number){
 if(show<=0)return;const st=kidState(TC4);
 drawPlayer(s,st.pose,c,{shirt:[B,.32*show],shorts:[B,.2*show],socks:[B,.2*show],boots:[B,.45*show],skin:[[B,.2*show]],hair:[B,.45*show],line:B,shade:null,shadow:false,detail:'mid',lineWeight:.8,build:B_KID,seed:50},st.place);
}
/** the training ground: pale day sky with a dot ramp, a line of trees, a fence, grass, cones, a small goal */
function training(s:Sheet,c:Cam,v:View){
 s.field(Y,.1,.4);
 const sky=new Path2D();sky.rect(-1e4,-1e4,2e4,2e4);s.tone(B,sky,(x,y)=>clamp(.34-(y+900)/3200),[-v.hx,-v.hy,v.hx*2,v.hy*2]);
 const trees=new Path2D();for(let i=0;i<16;i++){const x=-24+i*3.4,q=pr(c,[x,3.2+1.4*hash(i,3),26]);if(!q)continue;const k=c.F/toCam(c,[x,0,26])[2],r=(2+hash(i,5))*k;trees.addPath(polyPath(blob(q[0],q[1],r,r*.9,i,{amp:.12,n:16}),true));}
 s.tone(B,trees,.6);s.tone(K,trees,.3);
 const g=polyP(c,[[-40,0,-12],[40,0,-12],[40,0,40],[-40,0,40]]);if(g.length>2){const gp=polyPath(g,true);s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.7);
  const st=new Path2D();for(let k=-8;k<8;k+=2)addPoly(st,polyP(c,[[k*2.5,0,-12],[(k+1)*2.5,0,-12],[(k+1)*2.5,0,40],[k*2.5,0,40]]));s.tone(K,st,.1);}
 const fence=new Path2D();seg3(c,[-40,1,24],[40,1,24],.08,fence);seg3(c,[-40,.5,24],[40,.5,24],.08,fence);for(let x=-40;x<=40;x+=2.5)seg3(c,[x,0,24],[x,1.1,24],.08,fence);s.fill(K,fence,.7);
 // cones and a small goal behind the mat (the ball's target)
 const cones=new Path2D();for(const[x,z] of[[-5,3],[-3.6,3],[-2.2,3],[3.4,-2.2]] as [number,number][]){const a=pr(c,[x-.12,0,z]),b=pr(c,[x+.12,0,z]),tp=pr(c,[x,.3,z]);if(a&&b&&tp)cones.addPath(polyPath([a,tp,b],true));}
 s.knockout(cones);s.fill(R,cones,.95);s.stroke(K,cones,2,.8);
 const gl=new Path2D();for(const[a,b] of[[[5.2,0,-1.5],[5.2,1.2,-1.5]],[[5.2,0,1.5],[5.2,1.2,1.5]],[[5.2,1.2,-1.55],[5.2,1.2,1.55]]] as [V3,V3][])seg3(c,a,b,.08,gl);
 const nt=new Path2D();addPoly(nt,polyP(c,[[5.2,1.2,-1.5],[5.2,1.2,1.5],[6.1,0,1.5],[6.1,0,-1.5]]));s.tone(K,nt,.2);s.knockout(gl);s.stroke(K,gl,2,.9);
}
const ch4:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam4(t),tp=twos(t),tau=tau4(tp),u=tau-TC4;
  const tS=CUEW(3,'soft ground'),tC=CUEW(3,'coach'),tB=CUEW(3,'body shape'),tW=CUEW(3,'Watch'),tJ=CUEW(3,'jump early'),tL=CUEW(3,'land safely'),tH=CUEW(3,'hands and back');
  training(s,c,v);
  const land=sm(.3,.45,u)*(1-sm(.8,1.3,u)),dip=(land+settle(u,.42,{amp:.35,freq:2.5,decay:4})*(u>.42?1:0))+.5*sm(tS,tS+.25,t)*(1-sm(tS+.25,tS+.9,t));
  mat(s,c,dip,KID_X+.3,sm(tS-.1,tS+.3,t)*(1-sm(tS+1.2,tS+1.8,t)));
  // ghost body shapes appear on "body shape" and light up one by one as the move passes them
  ghost(s,c,sm(tB-.1,tB+.6,t)*(1-sm(-.12,.02,u)));
  const co=coachState(tau),kd=kidState(tau),prevK=kidState(tau4(tp-1/12));
  drawPlayer(s,co.pose,c,COACH,co.place);
  const b=kidBall(tau),bq=toCam(c,b),bg=bq[2]>NEAR?scr(c,bq):null,br=bg?c.F*BALL_R/bq[2]:0;
  // "land safely on your hands and back": yellow glows printed under the body where the hands, then the upper back meet the mat
  const lh=sm(tL-.1,tL+.3,t),lb=sm(tH-.1,tH+.3,t);
  if(lh>0||lb>0){const sk=solve(kd.pose,B_KID,kd.place),P=(q:V3)=>scr(c,toCam(c,q)),gl=new Path2D(),rad=c.F*.13/toCam(c,sk.chest)[2];
   if(lh>0)for(const j of[sk.lHa,sk.rHa]){const q=P(j),r=rad*(.55+.45*lh);gl.addPath(polyPath(blob(q[0],q[1],r,r,7,{amp:.06,n:14}),true));}
   if(lb>0){const q=P(mix3(sk.chest,sk.neck,.4));gl.addPath(polyPath(blob(q[0],q[1],rad*(1+.6*lb),rad*(.6+.3*lb),9,{amp:.06,n:14}),true));}
   s.knockout(gl,.75);s.fill(Y,gl,.9);s.stroke(K,gl,3,.8);}
  const kr=drawPlayer(s,kd.pose,c,KID,kd.place,{prev:prevK,smear:u>-.35&&u<.3});
  if(bg){ball(s,bg[0],bg[1],br,tau*6);
   if(t>tC-.2&&t<tC+1)sparkBurst(s,Y,bg[0],bg[1],br*3.4,{n:8,seed:3,g:easeOutBack(sm(tC-.2,tC+.2,t))*(1-sm(tC+.6,tC+1,t)),width:br*.4});
   // "Watch the ball": a ring on the ball and the kid's sight line to it
   const w=sm(tW-.15,tW+.3,t)*(1-sm(tJ+.3,tJ+.8,t));
   if(w>0){const ring:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;ring.push([bg[0]+Math.cos(a)*br*1.8,bg[1]+Math.sin(a)*br*1.8]);}const rr=ribbon(ring,Math.max(4,br*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rr,.9*w);s.fill(Y,rr,.95*w);
    const e=kr.joints.face,d=Math.hypot(bg[0]-e[0],bg[1]-e[1]);if(d>br*2.4){const ux=(bg[0]-e[0])/d,uy=(bg[1]-e[1])/d,a:Pt=[e[0]+ux*br*.8,e[1]+uy*br*.8],z:Pt=[bg[0]-ux*br*2.1,bg[1]-uy*br*2.1];
     const gaps:[number,number][]=[];for(let i=0;i<6;i++)gaps.push([(i+.6)/6.2,(i+.95)/6.2]);s.fill(Y,ribbon([a,z],Math.max(4,br*.22),{seed:13,taper:.3,wobble:.6,gaps}),.95*w);}}}
  // "jump early": a spark under the push-off foot
  const jk=sm(tJ-.05,tJ+.2,t)*(1-sm(tJ+.5,tJ+.9,t));if(jk>0){const f=kr.joints.rToe;sparkBurst(s,Y,f[0],f[1],90,{n:8,seed:21,g:easeOutBack(jk),width:12});}
 },
 still:12,
};

// ---------------------------------------------------------------- touch: a turf kick (grass bits + paper flecks) and a yellow spark
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size;(i%3?a:b).addPath(polyPath([[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]],true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}

const film:RisoStory={
 id:'ronaldo-bicycle-2018',format:'11v11',title:"Ronaldo's bicycle kick",theme:'Timing and body shape: watch the ball, jump early, land safely',
 ageNote:'Champions League quarter-final, Juventus v Real Madrid, Turin, 3 April 2018. Beginners practise only on soft ground with a coach.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
export default film;
