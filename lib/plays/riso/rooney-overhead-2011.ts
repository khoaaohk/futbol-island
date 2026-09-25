/** Wayne Rooney's overhead kick — Manchester United 2–1 Manchester City, Premier League, Old Trafford, 12 February 2011. An iconic-play riso
 * film (RisoStory, chapters mode) played in the player card's picture window or StoryFilmPlayer. A 1:1 reconstruction of the goal from
 * WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 via web search result summaries; page fetches were not available in this session):
 *  - Sky Sports, "Wayne Rooney: Overhead kick against Man City in 2011 my most important goal"
 *    https://www.skysports.com/football/news/11667/10851933/wayne-rooney-overhead-kick-against-man-city-in-2011-my-most-important-goal
 *  - FourFourTwo, Nani on his assist ("My cross wasn't perfect…")
 *    https://www.fourfourtwo.com/person/player/my-cross-wasnt-perfect-former-manchester-united-star-nani-describes-his-assist-for-wayne-rooneys-overhead-kick
 *  - Al Jazeera, "Brilliant Rooney downs City" (12 Feb 2011) https://www.aljazeera.com/sports/2011/2/12/brilliant-rooney-downs-city
 *  - Bleacher Report, "Wayne Rooney Bicycle Kick Earns Manchester United 2-1 Win Over Manchester City"
 *    https://bleacherreport.com/articles/606282-wayne-rooney-bicycle-kick-earns-manchester-united-2-1-win-over-manchester-city
 *  - Duke WCWP, "Rooney's Bicycle Kick" https://sites.duke.edu/wcwp/capturing-the-game/goals/rooneys-bicycle-kick
 *  - CNN, "#MyBeautifulGame — Wayne Rooney's overhead kick relived" https://edition.cnn.com/2016/01/18/football/wayne-rooney-record-my-beautiful-game
 *  - 11v11 / ESPN / Sky match pages (score, minutes, attendance 75,322)
 *    https://www.11v11.com/matches/manchester-united-v-manchester-city-12-february-2011-293811/  https://www.espn.com/soccer/match/_/gameId/292922
 *  - Kits: Football Kit Archive / SoccerBible / True Colours, Manchester United 2010-11 home (red Nike shirt, white V-neck; worn with white
 *    shorts + black socks among its options) and Manchester City 2010-11 home (Umbro sky blue shirt, white shorts, sky blue socks)
 *    https://www.footballkitarchive.com/manchester-united-2010-11-home-kit-925/  https://www.footballkitarchive.com/manchester-city-2010-11-home-kit/1089/
 *    https://www.truecoloursfootballkits.com/2010/11/21/manchester-city-2010-11-kits/
 * CONFIRMED by those accounts: Saturday 12 February 2011, Old Trafford, Premier League, United 2–1 City (Nani 41', David Silva 65',
 * Rooney 78'); it was 1–1 when Rooney scored; Nani crossed from the RIGHT; the cross took a deflection (named as off Pablo Zabaleta's back)
 * and went high in the air; Rooney said the deflection "slowed the ball down and gave me time to adjust myself, turn my body"; with his back
 * to goal he leapt (from around the penalty spot) and wrapped his RIGHT foot round the ball; it flew into the TOP CORNER while Joe Hart stayed
 * rooted to his line; Martin Tyler: "It defies description"; voted the best goal of the Premier League's first 20 seasons (20 Seasons
 * Awards, 2012); Rooney wore 10; United went on to win the league.
 * INFERRED (illustrative reconstruction): every position and run on the pitch (Nani's wing position, where the deflection happened, the
 * loop's height (drawn ~7.5 m apex) and flight time (~2.3 s), the other players shown and their numbers); which top corner (drawn: the
 * corner to Hart's right, away from the crosser); which way United attacked and so which touchline the cross came from for the main camera
 * (drawn: the far touchline, the camera on the low South Stand looking at the three-tier stand opposite); the body mechanics beyond "right
 * foot, back to goal" (left knee drives up, tip back past horizontal, scissor, land on the hands then the back); Rooney's celebration run;
 * the matchday kit combination (drawn: United red shirt / white shorts / black socks; City sky blue shirt / white shorts / sky blue socks);
 * Hart's keeper kit colour (drawn dark navy with yellow gloves: City's 2010-11 set included an all-black kit; the one worn that day was not
 * confirmed); Hart's number (drawn 25); the overcast winter-daylight look (kick-off time not confirmed); seat colours, boards and roof.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Nani on the far wing, the cross, the deflection
 * looping up, the kick, the net) · ch2 = the TV slow-motion REPLAY from a low pitch-side camera on Rooney's right, a long lens that follows
 * the looping ball down to him (the deflection, eyes on the ball, the turn, the early jump, the right foot over his head) · ch3 = a replay
 * from BEHIND THE NET (the ball past a rooted Hart into the top corner) panning to Rooney's run and the crowd going wild · ch4 = the lesson in
 * a sports hall: a young player on soft gym mats, a coach tossing the ball, the move keyed to the words. Composed for the card window
 * (≈ 1.45:1 down to square): the world is centred on the CANVAS centre (never sheet.safe), cameras are real pinhole projections of metres.
 *
 * FIGURES: every body goes through ONE adapter, drawPlayer() → the shared fluid-body library ./athlete. The overhead kick is authored as key
 * poses on that skeleton and flown on a real ballistic pelvis arc; unlike the Ronaldo 2018 film it is a sideways-turned scissor (roll + twist,
 * the ball arriving from high on his left after a looping deflection). Kits: United red with white shorts and black socks (Rooney's 10),
 * City sky blue (a blue screen) with white shorts, Hart in dark keeper kit.
 * Inks: yellow (grass with blue, highlights, gym floor with red), red (United, seats, skin screen), blue (City, sky, grass, mats), navy (key
 * line, coats, roof). Scenes read only their local t; drawn objects on twos, cameras on ones; all randomness seeded.
 * Budget: ~150–240 plate ops per frame (4 plates); small figures in the wide shot print at 'low' detail, passages cap figure detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,settle,TAU,type Pt} from '../../paths/riso/motion';
import {sparkBurst} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,posed,clampPose,keyPoses,blendPose,stand,runCycle,strike,keeperSet,celebrate,
 type Pose,type V3,type AthleteStyle,type Place,type InkFill,type Build,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional timings (≈2.5 words/s). `at` = word onset in the chapter's audio (s); `seconds` includes the silent
 * tail that carries the .65 s passage. The Kokoro generator (scripts/plays/kokoro-narrate.py) writes timing.json; withTiming then swaps in the
 * real clip lengths and word onsets and every action below re-times itself. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Old Trafford, 2011. United and City, one-all. Nani on the right. His cross hits a defender and loops up. Rooney... overhead kick! Top corner!',seconds:12.6,
  cues:[[.2,'Old Trafford'],[1.9,'United and City'],[3.8,'Nani on the right'],[5.4,'His cross'],[6,'hits a defender'],[7.2,'loops up'],[8.2,'Rooney'],[9,'overhead kick'],[10.3,'Top corner']]},
 {label:'Watch it again',text:'Slow motion. The deflection takes the speed off the ball. Rooney watches it, turns his body, jumps early, swings his right foot over his head.',seconds:11.8,
  cues:[[.15,'Slow motion'],[1.3,'The deflection'],[2.1,'takes the speed'],[4.3,'Rooney watches'],[5.6,'turns his body'],[6.9,'jumps early'],[8,'swings his right foot']]},
 {label:'Behind the net',text:"Joe Hart can't move. Two-one, and Old Trafford goes wild!",seconds:7.2,
  cues:[[.15,'Joe Hart'],[.8,"can't move"],[2,'Two-one'],[3.2,'Old Trafford'],[4.1,'goes wild']]},
 {label:'Your turn',text:'Beginners: only practise on soft mats, with a coach. The secret is timing and body shape. Watch the ball, jump early, and land on your hands and back.',seconds:13.6,
  cues:[[.15,'Beginners'],[1,'only practise'],[2,'soft mats'],[3.1,'coach'],[5,'timing'],[5.9,'body shape'],[7.2,'Watch the ball'],[8.3,'jump early'],[9.4,'land'],[10.6,'hands and back']]},
];
/** Kokoro timing: null until the lead voices the film. After running kokoro-narrate.py, replace `null` with the import of
 * '../../../public/plays/narration/rooney-overhead-2011/timing.json' (as the other films do) — nothing else changes. */
import timingJson from '../../../public/plays/narration/rooney-overhead-2011/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('rooney: cue '+w);return c.at;};
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
/** a narrower (square) window gets a slightly wider lens so the action still fits (set by frame(), read by aperture()) */
let LENS=1;
/** metres, right-handed, y up. City's goal line is x = 0 (posts z = ±3.66, net toward +x), the pitch runs to x = −105, touchlines z = ±34.
 * United attack +x; their right wing is +z — the FAR touchline for the main camera on the −z side. */
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

// ---------------------------------------------------------------- Old Trafford on a grey February day: tiered stands, red seats, packed crowd, roof, grass, lines, goal
/** stand planes (a along, b up the rake 0..1): the tall three-tier stand opposite (+z), behind City's goal, the low main stand (−z), far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-140,38,a),1.2+31*b,39+33*b],
 (a,b)=>[10+22*b,1.2+22*b,lerp(-62,62,a)],
 (a,b)=>[lerp(34,-136,a),1.2+18*b,-39-20*b],
 (a,b)=>[-114-22*b,1.2+22*b,lerp(62,-62,a)],
];
const STAND_COLS=[140,72,128,72],STAND_ROWS=[19,13,11,13],TIERS=[[.34,.67],[.5],[.55],[.5]];
/** overcast sky wash, red-seated stand planes with tier fronts, a packed crowd speckle (red shirts, white, dark winter coats), a grey roof with
 * a white fascia. roar lifts the crowd (jumping) — one knockout + a few fills. */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t),all=rectPath(-1e4,-1e4,2e4,2e4);
 s.tone(B,all,.2);s.tone(K,all,.12);
 const planes=new Path2D(),fronts=new Path2D(),roof=new Path2D(),fascia=new Path2D();
 const own=(si:number)=>si===2&&c.eye[2]<-38;
 STANDS.forEach((S,si)=>{if(own(si))return;addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[si])seg3(c,S(0,b),S(1,b),1.3,fronts);
  const r0=add(S(0,1),[0,.4,0]),r1=add(S(1,1),[0,.4,0]),r2=add(S(1,1.14),[0,4.5,0]),r3=add(S(0,1.14),[0,4.5,0]);addPoly(roof,polyP(c,[r0,r1,r2,r3]));seg3(c,r3,r2,.9,fascia);});
 s.knockout(planes);s.fill(R,planes,.62);s.tone(K,planes,.18);
 const dots=[new Path2D(),new Path2D(),new Path2D()],any=[0,0,0];
 STANDS.forEach((S,si)=>{if(own(si))return;const cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(q=>Math.abs(b-q)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.12)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.5/q[2],2.5,12),lift=roar>0?roar*z*(.4+1.1*Math.max(0,Math.sin(tt*12+h*TAU))):0;
   const ink=h<.5?1:h<.78?0:2;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}});
 if(any[0])s.knockout(dots[0],.8);if(any[1])s.fill(R,dots[1],.95);if(any[2])s.fill(K,dots[2],.9);
 s.fill(K,fronts,.8);
 s.knockout(roof);s.tone(K,roof,.5);s.tone(B,roof,.3);s.knockout(fascia,.9);
}
/** grass (yellow × blue = green), mowing stripes, red LED boards with paper panels, paper lines */
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-50],[14,0,-50],[14,0,50],[-118,0,50]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-38],[-(k+1)*5.5,0,-38],[-(k+1)*5.5,0,38],[-k*5.5,0,38]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 addPoly(bd,polyP(c,[[8.6,0,-30],[8.6,0,30],[8.6,.95,30],[8.6,.95,-30]]));addPoly(bd,polyP(c,[[-110,0,37.5],[6,0,37.5],[6,.95,37.5],[-110,.95,37.5]]));addPoly(bd,polyP(c,[[-110,0,-37.5],[6,0,-37.5],[6,.95,-37.5],[-110,.95,-37.5]]));
 for(let k=0;k<10;k++){const z=-28+k*6;addPoly(pn,polyP(c,[[8.55,.3,z],[8.55,.3,z+3],[8.55,.65,z+3],[8.55,.65,z]]));}
 for(let k=0;k<18;k++){const x=-106+k*6.2;addPoly(pn,polyP(c,[[x,.3,37.45],[x+3,.3,37.45],[x+3,.65,37.45],[x,.65,37.45]]));addPoly(pn,polyP(c,[[x,.3,-37.45],[x+3,.3,-37.45],[x+3,.65,-37.45],[x,.65,-37.45]]));}
 s.knockout(bd);s.fill(R,bd,.95);s.fill(K,bd,.25);s.knockout(pn,.9);
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
/** the goal: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (bz, by) */
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
/** a dashed yellow ribbon through projected points (the ball's path, a sight line) */
function dashes(s:Sheet,pts:Pt[],w:number,cov:number,seed:number,n=9){if(pts.length<2||cov<=0)return;const gaps:[number,number][]=[];for(let i=0;i<n;i++)gaps.push([(i+.62)/n,(i+.98)/n]);
 const p=ribbon(pts,w,{seed,taper:.2,wobble:.6,gaps});s.knockout(p,.85*cov);s.fill(Y,p,.95*cov);}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN1:InkFill[]=[[Y,.32],[R,.2]],SKIN2:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN3:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** United 2010-11: red shirt, white shorts, black (navy) socks */
const UTD=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:[K,.9],boots:K,skin:SKIN1,hair:K,line:K,trim:'paper',number:n,numberInk:'paper',hairStyle:'short',seed:n??60,...o});
/** City 2010-11: sky blue shirt (a blue screen), white shorts, sky blue socks */
const CITY=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],shorts:'paper',socks:[B,.5],boots:K,skin:SKIN1,hair:K,line:K,trim:'paper',number:n,numberInk:K,hairStyle:'short',seed:40+(n??9),...o});
const B_ROO:Build={height:1.76,bulk:1.1,thighs:1.12};

// ---------------------------------------------------------------- the play: keyframed tracks (τ = seconds after Nani's cross)
/** TD: the cross clips Zabaleta's back · TC: the overhead kick (the deflection's slow, high loop) · TG: the ball in the top corner */
const TD=.16,TC=TD+2.3,TG=TC+.42,T_TAKE=TC-.3;
type Role='roo'|'nani'|'zab'|'hart'|'mark'|'run';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
/** Nani's contact spot, and the line of his cross toward Rooney's contact spot (Zabaleta stands in it) */
const NANI0:[number,number]=[-22,21.5],ROO_C:[number,number]=[-11.1,.15];
const CROSS_DIR=(()=>{const dx=ROO_C[0]-NANI0[0],dz=ROO_C[1]-NANI0[1],l=Math.hypot(dx,dz);return[dx/l,dz/l] as [number,number];})();
const ZAB0:[number,number]=[NANI0[0]+CROSS_DIR[0]*2.6,NANI0[1]+CROSS_DIR[1]*2.6];
/** positions [τ, x, z], Hermite-interpolated. All inferred from the written accounts (see header). */
const ACTORS:Actor[]=[
 {name:'Wayne Rooney',role:'roo',hero:true,style:UTD(10,{build:B_ROO,skin:SKIN2,hairStyle:'balding',seed:10}),keys:[[-10,-22,-6],[-6,-18,-3.2],[-3,-14.2,-1.1],[0,-12.7,.9],[1.1,-12.1,.8],[TC-.8,-11.45,.4],[TC-.3,-11.2,.22],[TC,ROO_C[0],ROO_C[1]],[TC+.5,-10.95,.05],[TC+2.3,-10.8,0],[TC+3.6,-8.6,-5.5],[TC+6,-5.2,-13.5],[TC+9,-2.6,-21]]},
 {name:'Nani',role:'nani',style:UTD(17,{build:{height:1.76},skin:SKIN3,seed:17}),keys:[[-10,-50,26],[-6,-37,24.6],[-3,-28.5,23],[-1,-23.8,22],[0,NANI0[0],NANI0[1]],[.5,-21.4,21.2],[2,-20.4,20.4],[9,-15,15]]},
 {name:'Zabaleta',role:'zab',style:CITY(5,{build:{height:1.76},seed:5}),keys:[[-10,-30,15],[-6,-26,18.2],[-3,-22.8,19],[-1,ZAB0[0]-.6,ZAB0[1]+.3],[0,ZAB0[0],ZAB0[1]],[TD+.5,ZAB0[0]+.2,ZAB0[1]-.2],[3,-19,17],[9,-16,12]]},
 {name:'City marker',role:'mark',style:CITY(null,{build:{height:1.9,bulk:1.06}}),keys:[[-10,-18,-4],[-4,-13.5,-.6],[0,-11.6,.2],[TC-.8,-10.2,-.2],[TC,-9.9,-.4],[TC+2,-9.4,-.6],[TC+9,-8,-2]]},
 {name:'City centre-back',role:'run',style:CITY(null,{build:{height:1.88}}),keys:[[-10,-15,6],[-4,-10.5,5.6],[0,-8.4,5.2],[TC,-7.2,4.4],[TC+2,-6.8,4.2],[TC+9,-6,4]]},
 {name:'City full-back',role:'run',style:CITY(null,{skin:SKIN3}),keys:[[-10,-16,-12],[-4,-12,-10.4],[0,-10.4,-9.8],[TC,-9.4,-10],[TC+9,-8,-10]]},
 {name:'City midfielder',role:'run',style:CITY(null,{build:{height:1.8}}),keys:[[-10,-30,2],[-4,-24,4],[0,-20.4,5.4],[TC+1,-17.2,4.8],[TC+9,-15,4]]},
 {name:'United forward',role:'run',style:UTD(null,{seed:61}),keys:[[-10,-20,8],[-4,-12,9.4],[0,-8.2,7.2],[TC,-6.4,5.6],[TC+2,-6.2,5.4],[TC+9,-6,5]]},
 {name:'United midfielder',role:'run',style:UTD(null,{seed:62,skin:SKIN2}),keys:[[-10,-34,4],[-4,-26,6],[0,-21.6,6.8],[TC+1,-19.4,5.6],[TC+9,-15,4]]},
 {name:'Joe Hart',role:'hart',style:{shirt:[K,.85],shorts:[K,.85],socks:[K,.85],boots:K,skin:SKIN1,hair:K,line:K,gloves:Y,trim:[Y,.8],number:25,numberInk:Y,sleeves:'long',hairStyle:'short',build:{height:1.96},seed:25},
  keys:[[-10,-2.4,1.6],[-4,-1.6,2.8],[-1,-1.2,2.4],[0,-1.15,2.1],[TD+1,-1.05,1.2],[TC-.4,-.95,.5],[TC,-.9,.4],[TC+9,-.9,.4]]},
];
const ROO=0,NANI=1,ZAB=2,HART=ACTORS.findIndex(a=>a.role==='hart');
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

// ---------------------------------------------------------------- the overhead kick: key poses on the athlete skeleton (u = seconds from contact)
/** Mechanics: adjusting under the looping ball, eyes up ("gave me time to adjust myself, turn my body") → plant, the LEFT knee drives up
 * while the right foot pushes off (take-off .3 s before contact: "jump early") → he tips back past horizontal, turned a little onto his left
 * side (roll + twist: the ball drops in from high on his left) → the SCISSOR: the left leg drops as the right leg whips over, laces wrapped
 * round the ball above the hips → arms reach back and out to the left → land on the hands, then the back and shoulder, knees up, chin tucked
 * → roll up, kneel, get up and run. */
const OVER:[number,Pose][]=[
 [-.55,posed({lHipF:28,rHipF:34,lKnee:40,rKnee:52,lAnk:-8,rAnk:-4,lean:8,pitch:0,neckP:-42,lShA:42,rShA:34,lShF:-10,rShF:18,lElb:52,rElb:56,twist:-6})],
 [-.3,posed({pitch:-12,lean:-6,roll:-6,twist:8,lHipF:94,lKnee:84,lAnk:28,rHipF:-12,rKnee:16,rAnk:54,lShF:64,rShF:48,lShA:54,rShA:46,lElb:44,rElb:50,neckP:-34})],
 [-.16,posed({pitch:-54,lean:-14,roll:-14,twist:14,lHipF:120,lKnee:36,lAnk:40,rHipF:24,rKnee:108,rAnk:40,lShA:98,rShA:72,lShF:14,rShF:34,lElb:26,rElb:34,neckP:18})],
 [-.06,posed({pitch:-78,lean:-10,roll:-20,twist:16,lHipF:78,lKnee:44,lAnk:40,rHipF:70,rKnee:72,rAnk:46,lShA:106,rShA:80,lShF:-8,rShF:6,lElb:20,rElb:26,neckP:36})],
 [0,posed({pitch:-88,lean:-8,roll:-24,twist:18,rHipF:104,rKnee:6,rAnk:54,rHipA:-6,lHipF:-12,lKnee:56,lAnk:30,lShA:112,rShA:70,lShF:-34,rShF:-6,lElb:16,rElb:34,neckP:48,lHand:1,rHand:1})],
 [.14,posed({pitch:-96,lean:-2,roll:-30,twist:14,rHipF:124,rKnee:22,rAnk:40,rHipA:-14,lHipF:-22,lKnee:64,lAnk:24,lShA:82,rShA:52,lShF:-64,rShF:-40,lElb:10,rElb:24,neckP:46,lHand:1,rHand:1})],
 [.34,posed({pitch:-88,lean:8,roll:-38,twist:10,rHipF:96,rKnee:50,lHipF:10,lKnee:78,lShA:46,rShA:40,lShF:-80,rShF:-66,lElb:18,rElb:26,neckP:52,lHand:1,rHand:1})],
 [.56,posed({pitch:-86,lean:26,roll:-30,rHipF:84,rKnee:86,lHipF:72,lKnee:96,lShA:44,rShA:40,lShF:-58,rShF:-50,lElb:52,rElb:56,neckP:46,lHand:.8,rHand:.8})],
 [1.1,posed({pitch:-24,lean:18,roll:-10,lHipF:86,rHipF:70,lKnee:70,rKnee:40,lShA:28,rShA:26,lShF:-40,rShF:-44,lElb:20,rElb:20,neckP:4,lHand:1,rHand:1})],
 [1.7,posed({lHipF:96,lKnee:118,lAnk:10,rHipF:-8,rKnee:104,rAnk:40,lean:24,pitch:4,lShA:30,rShA:30,lShF:20,rShF:10,lElb:40,rElb:40,neckP:-8})],
 [2.3,runCycle(.05,{speed:.5})],
];
const CONTACT_POSE=clampPose(OVER[4][1]);
/** pelvis height of a pose when its lowest point touches the ground */
const pelvisY=(p:Pose,b:Build)=>solve({...p,air:0},b).pelvis[1];
/** the laces: 60 % from the ankle to the toe */
const lacesOf=(sk:{rAn:V3;rToe:V3})=>mix3(sk.rAn,sk.rToe,.6);
/** a ballistic pelvis: take-off at u = −.3 from standing height, through (0, hc) at contact, gravity 9.81 */
function jumpArc(b:Build,contactLaces:number){
 const sk=solve({...CONTACT_POSE,air:0},b),hc=contactLaces-(lacesOf(sk)[1]-sk.pelvis[1]),y0=pelvisY(clampPose(OVER[1][1]),b),v=(hc-y0+4.905*.09)/.3;
 return{hc,y0,v,h:(u:number)=>y0+v*(u+.3)-4.905*(u+.3)*(u+.3)};
}
function flyPose(p:Pose,u:number,arc:{h:(u:number)=>number},b:Build):Pose{if(u<=-.3||u>1.2)return p;return{...p,air:clamp(arc.h(u)-pelvisY(p,b),0,2)};}
const ARC_ROO=jumpArc(B_ROO,1.95);
/** Rooney: back to goal, turned toward the far touchline the cross came from */
const R_YAW=yawTo(-.9,.44);

// ---------------------------------------------------------------- the ball: Nani's cross → Zabaleta's back → a slow high loop → the laces → the top corner
type State={pose:Pose;place:Place};
const BALL_R=.11;
/** Nani's contact point (right foot, just in front of the planted left) */
const P0:V3=[NANI0[0]+CROSS_DIR[0]*.3-CROSS_DIR[1]*.12,BALL_R,NANI0[1]+CROSS_DIR[1]*.3+CROSS_DIR[0]*.12];
/** the deflection: Zabaleta's back, chest height */
const PD:V3=[ZAB0[0]-CROSS_DIR[0]*.22,1.3,ZAB0[1]-CROSS_DIR[1]*.22];
/** the contact point: the ball sits on Rooney's laces at TC */
const PC:V3=(()=>{const sk=solve({...CONTACT_POSE,air:clamp(ARC_ROO.hc-pelvisY(CONTACT_POSE,B_ROO),0,2)},B_ROO,{x:ROO_C[0],z:ROO_C[1],yaw:R_YAW}),l=lacesOf(sk);return add(l,mul(nrm(sub([PD[0],l[1]+4,PD[2]],l)),BALL_R+.03));})();
/** where it crosses the line: the top corner to Hart's right (the attackers' left = −z) */
const PG:V3=[0,2.2,-3.05],NETP:V3=[1.5,1.7,-3.2],REST:V3=[1.6,BALL_R,-3.1];
const ballistic=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const V_CROSS=ballistic(P0,PD,TD),V_LOOP=ballistic(PD,PC,TC-TD),V_SHOT=ballistic(PC,PG,TG-TC);
const fly=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
function ballAt(tau:number):V3{
 if(tau<0){// Nani's run down the right: touches every ~1.9 m, then he sets the ball for the cross
  const dribble=(tt:number):V3=>{const p=posOf(NANI,tt),v=velOf(NANI,tt),l=Math.hypot(v[0],v[1])||1,f=((distOf(NANI,tt)/1.9)%1+1)%1,d=.42+.38*(f<.18?f/.18:1-(f-.18)/.82);return[p[0]+v[0]/l*d,BALL_R,p[1]+v[1]/l*d];};
  if(tau<-.4)return dribble(tau);const u=easeOut((tau+.4)/.4);return mix3(dribble(-.4),P0,u);}
 if(tau<TD)return fly(P0,V_CROSS,tau);
 if(tau<TC)return fly(PD,V_LOOP,tau-TD);
 if(tau<TG)return fly(PC,V_SHOT,tau-TC);
 if(tau<TG+.22)return mix3(PG,NETP,easeOut((tau-TG)/.22));
 const u=clamp((tau-TG-.22)/.45);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u*u),lerp(NETP[2],REST[2],u)];
}
const velAt=(tau:number):V3=>tau<TD?V_CROSS:tau<TC?V_LOOP:V_SHOT;
const ballSpin=(tau:number)=>tau<0?distOf(NANI,tau)/BALL_R:tau<TC?tau*7:tau<TG?TC*7-(tau-TC)*40:TC*7-(TG-TC)*40;
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
/** Zabaleta turns his back on the cross (the ball clips it) */
const TURN_AWAY=posed({lHipF:30,rHipF:22,lKnee:40,rKnee:34,lean:26,pitch:6,twist:-20,neckP:30,neckY:-30,lShA:12,rShA:14,lShF:40,rShF:44,lElb:110,rElb:110,squash:-.05});
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'roo':{const u=tau-TC;
   if(u>=-.8&&u<2.3)pose=keyPoses(u,[[-.8,loco(k,TC-.8)],...OVER]);
   else if(u>=2.3){const run=celebrate(distOf(k,tau)/4,{kind:'run'});pose=blendPose(OVER[OVER.length-1][1],run,sm(2.3,2.9,u));}
   pose=flyPose(pose,u,ARC_ROO,B_ROO);
   // eyes on the ball the whole loop; he settles into his back-to-goal angle as it drops ("turn my body")
   yaw=lerpAng(faceYaw(k,tau,[PD[0],0,PD[2]]),R_YAW,sm(-1.6,-.6,u));
   if(u>1.6)yaw=lerpAng(R_YAW,faceYaw(k,tau),sm(1.6,2.8,u));
   break;}
  case 'nani':{const w=sm(-.75,-.5,tau)*(1-sm(.45,.9,tau));if(w>0)pose=blendPose(pose,strike(clamp((tau+.5)/.95)),w);
   yaw=lerpAng(yaw,yawTo(CROSS_DIR[0],CROSS_DIR[1]),sm(-1.4,-.6,tau)*(1-sm(.8,1.6,tau)));break;}
  case 'zab':{const face=yawTo(-CROSS_DIR[0],-CROSS_DIR[1]),w=sm(-.35,-.05,tau)*(1-sm(TD+.4,TD+1,tau));
   pose=blendPose(pose,TURN_AWAY,w);yaw=lerpAng(lerpAng(yaw,face,sm(-2,-.8,tau)),face+Math.PI*.85,w);break;}
  case 'mark':{yaw=faceYaw(k,tau);if(tau>TC-1&&tau<TC+1.4){const w=sm(TC-1,TC-.5,tau)*(1-sm(TC+.6,TC+1.4,tau));pose=blendPose(pose,posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lean:4,neckP:-30,lShA:30,rShA:30,lElb:40,rElb:40}),w);}break;}
  case 'hart':{const ph=Math.min(tau,TC-.1)*1.4;pose=keeperSet(ph);
   // rooted to his line: the set holds as the ball flies past, then his head turns to the net
   if(tau>TG+.15)pose=blendPose(pose,posed({lHipF:30,rHipF:30,lKnee:34,rKnee:34,lean:10,lShA:22,rShA:22,lElb:30,rElb:30,neckY:-70,neckP:-6}),sm(TG+.15,TG+.9,tau));
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
type PlayOpts={dtau?:number;smear?:boolean;spark?:number;goalLast?:boolean;hit?:number};
/** τ = the play clock for this frame (on twos); dtau = τ per drawn frame (for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,o:PlayOpts={}):{ball:Pt|null;br:number;roo?:DrawResult}{
 const{dtau=0,smear=false,spark=0,goalLast=false,hit=0}=o;
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(4,c.F*BALL_R/bq[2]):0;
 const gq=pr(c,[b[0],0,b[2]]);if(gq&&b[0]<.1){const k=c.F/Math.max(1,toCam(c,[b[0],0,b[2]])[2]),r=clamp(.16*k*(1-Math.min(.7,b[1]/5)),2,300);s.tone(K,polyPath(blob(gq[0],gq[1],r,r*.3,2,{amp:.05,n:12}),true),.45*(1-Math.min(.8,b[1]/7)));}
 type Item={d:number;draw:()=>void};const items:Item[]=[];let roo:DrawResult|undefined;const m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;const passing=!!s._passage.pending;
 ACTORS.forEach((a,k)=>{const st=stateOf(k,tau),x=st.place.x??0,z=st.place.z??0,q=toCam(c,[x,1,z]);if(q[2]<NEAR+.5)return;const p=scr(c,q),h=c.F*1.9/q[2];
  if(Math.abs(p[0])>v.hx+h||Math.abs(p[1])>v.hy+h)return;
  const prev=dtau>0&&(a.hero||a.role==='zab')?stateOf(k,tau-dtau):undefined;
  // the outgoing scene of a passage is zoomed past the camera: its figures print simply; small figures in wide shots print at 'low'
  const key_=a.hero||a.role==='zab'||a.role==='hart',style=passing?{...a.style,detail:a.hero?'mid' as const:'low' as const}:!key_&&h*ppu<150?{...a.style,detail:'low' as const}:h*ppu<60?{...a.style,detail:'low' as const}:a.style;
  items.push({d:q[2],draw:()=>{const r=drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!!a.hero});if(a.hero)roo=r;}});});
 const inNet=b[0]>.05;
 const drawBall=()=>{if(!bg)return;const V=velAt(tau),sp=tau>0&&tau<TG?Math.hypot(...V):0,nb=pr(c,sub(b,mul(V,.03)));
  const dir=nb?Math.atan2(bg[1]-nb[1],bg[0]-nb[0]):0,sm_=nb&&sp>0?Math.min(br*3,Math.hypot(bg[0]-nb[0],bg[1]-nb[1])*1.4):0;ball(s,bg[0],bg[1],br,ballSpin(tau),sm_,dir);
  if(spark>0)sparkBurst(s,Y,bg[0],bg[1],br*4.2,{n:9,seed:17,g:easeOutBack(clamp(spark*2))*(1-clamp((spark-.5)*2)),width:br*.5});};
 // the deflection: a small burst where the cross clips Zabaleta's back
 if(hit>0&&hit<1){const q=pr(c,PD);if(q){const r=Math.max(18,c.F*.45/Math.max(1,toCam(c,PD)[2]));sparkBurst(s,Y,q[0],q[1],r,{n:8,seed:23,g:easeOutBack(clamp(hit*2.5))*(1-clamp((hit-.55)/.45)),width:Math.max(3,r*.12)});}}
 const goal=()=>goal3(s,c,bulgeAt(tau),b[2]);
 if(!goalLast){if(inNet)drawBall();goal();}
 if(!inNet||goalLast)items.push({d:bq[2],draw:drawBall});
 items.sort((p,q)=>q.d-p.d);for(const it of items)it.draw();
 if(goalLast)goal();
 return{ball:bg,br,roo};
}

// ---------------------------------------------------------------- 1 · LIVE: the high main-stand camera, real time
/** τ from chapter time: real time, anchored so the ball clips the defender on "hits" and Rooney strikes on "overhead" */
function tau1(t:number){const tH=CUEW(0,'hits')+.05,tO=CUEW(0,'overhead')-.05,k=clamp((TC-TD)/Math.max(.5,tO-tH),.75,1.25);return TD+(t-tH)*k;}
const E1:V3=[-44,21,-64];
function cam1(t:number):Cam{
 const tau=tau1(t),tN=CUEW(0,'Nani'),tL=CUEW(0,'loops'),tR=CUEW(0,'Rooney'),tT=CUEW(0,'Top'),S=SECS(0);
 const bs=(u:number):V3=>{const q=ballAt(u);return[q[0],0,q[2]];},bt=mul(add(add(bs(tau),bs(tau-.3)),bs(tau-.6)),1/3);
 const r=posOf(ROO,tau),R3:V3=[r[0],0,r[1]],wide:V3=[-30,0,8];
 const w1=sm(tN-.3,tN+1.4,t,easeInOutSine),w2=sm(tL-.4,tR+.3,t,easeInOutSine),w3=sm(tT+.3,tT+2,t,easeInOutSine);
 const T=mix3(mix3(mix3(wide,mix3(bt,R3,.3),w1),mix3(bt,R3,.62),w2),mix3(R3,[-2,0,-2],.4),w3);T[1]=1.4+2.2*w2*(1-w3);
 const F=key(t,[[0,2700],[CUEW(0,'United'),3300],[tN,4000],[CUEW(0,'His'),4300],[tL,4300],[tR,5000],[tT,6000],[S,6600]],easeInOutSine)*LENS;
 return lookAt(E1,T,F);
}
const ch1:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam1(t),tau=tau1(twos(t)),tT=CUEW(0,'Top');
  stadium(s,c,v,t,{roar:sm(tT-.2,tT+.6,t)});
  ground(s,c);play(s,c,v,tau,{hit:(tau-TD)/.5});},
 aperture(t){const c=cam1(t),b=ballAt(tau1(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*BALL_R/q[2]*1.6),12);},
 still:9.6,
};

// ---------------------------------------------------------------- 2 · REPLAY: slow motion from a low pitch-side camera on Rooney's right
function tau2(t:number){return key(t,mono([[0,TD-.45],[CUEW(1,'The deflection'),TD],[CUEW(1,'takes'),TD+.4],[CUEW(1,'Rooney watches'),TC-1.05],[CUEW(1,'turns'),TC-.62],[CUEW(1,'jumps early'),T_TAKE],[CUEW(1,'swings'),TC-.08],[CUEW(1,'swings')+1.1,TC+.1],[SECS(1),TC+.6]]),linear);}
/** Rooney's facing and right-hand side on the ground (x,z) */
const R_F:[number,number]=[Math.cos(R_YAW),-Math.sin(R_YAW)],R_RT:[number,number]=[-R_F[1],R_F[0]];
const E2:V3=[ROO_C[0]+R_RT[0]*8.6-R_F[0]*1.4,1.05,ROO_C[1]+R_RT[1]*8.6-R_F[1]*1.4];
function cam2(t:number):Cam{
 const tau=tau2(t),[x,z]=posOf(ROO,tau),S=SECS(1),tw=CUEW(1,'Rooney watches'),sc=CUEW(1,'swings');
 const b=ballAt(tau),onRoo=sm(tw-1,tw+.4,t,easeInOutSine),follow=sm(sc+1,S-.3,t,easeInOutSine),lift=sm(CUEW(1,'jumps')-.3,sc,t,easeInOutSine)*(1-sm(sc+1.2,S,t));
 const R3:V3=[x,1.3+.35*lift,z],onBall:V3=[b[0],Math.max(1,b[1]),b[2]];
 const T=mix3(mix3(onBall,mix3(R3,onBall,.1),onRoo),mix3(R3,[PG[0]-3,1.6,PG[2]],.5),follow);
 const F=key(t,[[0,5600],[CUEW(1,'takes'),4200],[tw,3100],[CUEW(1,'turns'),3400],[CUEW(1,'jumps'),3100],[sc,3200],[S,2400]],easeInOutSine)*LENS;
 return lookAt(E2,T,F);
}
/** "turns his body": a yellow ground arc swept round his feet with an arrow head */
function turnArrow(s:Sheet,c:Cam,x:number,z:number,g:number){
 if(g<=0)return;const pts:Pt[]=[];const a0=Math.atan2(-R_F[1],-R_F[0])+.4,sweep=2.4*g;
 for(let i=0;i<=16;i++){const a=a0+sweep*i/16,q=pr(c,[x+Math.cos(a)*.75,.02,z+Math.sin(a)*.75]);if(q)pts.push(q);}
 if(pts.length<3)return;const w=Math.max(5,c.F*.07/Math.max(1,toCam(c,[x,0,z])[2])),p=ribbon(pts,w,{seed:31,taper:.3,wobble:.5});
 const e=pts[pts.length-1],d=pts[pts.length-2],ang=Math.atan2(e[1]-d[1],e[0]-d[0]),hd=w*2.4;
 p.addPath(polyPath([[e[0]+Math.cos(ang)*hd,e[1]+Math.sin(ang)*hd],[e[0]+Math.cos(ang+2.2)*hd,e[1]+Math.sin(ang+2.2)*hd],[e[0]+Math.cos(ang-2.2)*hd,e[1]+Math.sin(ang-2.2)*hd]],true));
 s.knockout(p,.85);s.fill(Y,p,.95);s.stroke(K,p,2,.6);
}
const ch2:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam2(t),tp=twos(t),tau=tau2(tp),dtau=Math.max(.004,tau-tau2(tp-1/12));
  const tk=CUEW(1,'takes'),tw=CUEW(1,'Rooney watches'),tt=CUEW(1,'turns'),tj=CUEW(1,'jumps');
  stadium(s,c,v,t);ground(s,c);
  // "takes the speed off": the loop printed as a dashed yellow arc from the deflection down to Rooney's laces
  const arc=sm(tk-.1,tk+.9,t)*(1-sm(tj-.2,tj+.4,t));
  if(arc>0){const pts:Pt[]=[];for(let i=0;i<=26;i++){const u=i/26*arc,q=pr(c,fly(PD,V_LOOP,u*(TC-TD)));if(q)pts.push(q);}dashes(s,pts,7,1,41,12);}
  const[rx,rz]=posOf(ROO,tau);turnArrow(s,c,rx,rz,sm(tt-.1,tt+.7,t)*(1-sm(tj+.1,tj+.6,t)));
  const r=play(s,c,v,tau,{dtau,smear:true,spark:tau>=TC-.01?(tau-TC)/.18:0,hit:(tau-TD)/.35});
  // "Rooney watches it": a sight line from his eyes to the ball
  const w=sm(tw-.15,tw+.4,t)*(1-sm(tj,tj+.5,t));
  if(w>0&&r.roo&&r.ball){const e=r.roo.joints.face,bg=r.ball,d=Math.hypot(bg[0]-e[0],bg[1]-e[1]);if(d>r.br*3){const ux=(bg[0]-e[0])/d,uy=(bg[1]-e[1])/d;dashes(s,[[e[0]+ux*r.br,e[1]+uy*r.br],[bg[0]-ux*r.br*2,bg[1]-uy*r.br*2]],Math.max(4,r.br*.3),w,13,6);}}
  // "jumps early": a spark under the push-off (right) foot
  const jk=sm(tj-.05,tj+.25,t)*(1-sm(tj+.6,tj+1,t));if(jk>0&&r.roo){const f=r.roo.joints.rToe;sparkBurst(s,Y,f[0],f[1],80,{n:8,seed:21,g:easeOutBack(jk),width:11});}
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(22,c.F*BALL_R/q[2]*1.4),12);},
 still:8.2,
};

// ---------------------------------------------------------------- 3 · REPLAY behind the net: past a rooted Hart, then Rooney's run and the crowd
function tau3(t:number){return key(t,mono([[0,TC-.3],[CUEW(2,'Joe Hart')+.3,TC+.08],[CUEW(2,"can't")+.5,TG],[CUEW(2,'Two')+.3,TG+.6],[CUEW(2,'Old Trafford'),TG+2.2],[SECS(2),TG+5.4]]),linear);}
const E3:V3=[6.8,1.6,-1.7];
/** the fans' section: the low main stand (−z), x −28 … 2 */
const FANS=(()=>{const out:{a:number;b:number;h:number}[]=[];for(let j=0;j<9;j++)for(let i=0;i<40;i++){const h=hash(i*97+j*13,27);if(h<.08)continue;out.push({a:(i+.5+(hash(i,j+3)-.5)*.35)/40,b:.04+j*.07,h});}return out;})();
const fanPt=(a:number,b:number):V3=>[lerp(-28,2,a),1.2+18*b,-39-20*b];
function cam3(t:number):Cam{
 const tau=tau3(t),tO=CUEW(2,'Old Trafford'),pan=sm(tO-.5,tO+1.1,t,easeInOutSine);
 const b=ballAt(Math.min(tau,TG)),toPlay:V3=mix3([-10,1.5,-1.4],[b[0]-1.5,Math.max(1.2,b[1]),b[2]],.45*sm(0,CUEW(2,'Two'),t));
 const[rx,rz]=posOf(ROO,tau),T=mix3(toPlay,mix3([rx,1.4,rz],fanPt(.5,.3),.45),pan),F=lerp(2300,2600,pan)*LENS;
 return lookAt(add(E3,[0,.4*pan,-.8*pan]),T,F);
}
/** the fans: rows jumping with both arms up and red/white scarves held high — batched: knockout, shirts, skin, scarves, hands */
function fans(s:Sheet,c:Cam,v:View,t:number,rise:number){
 if(rise<=0)return;
 const sil=new Path2D(),red=new Path2D(),dark=new Path2D(),skin=new Path2D(),hair=new Path2D(),scarfR=new Path2D(),scarfW=new Path2D();let n=0;const tt=twos(t);
 for(const f of FANS){const up=clamp(rise*1.5-f.h*.5),jump=up*.18*Math.max(0,Math.sin(tt*9+f.h*TAU)),P=fanPt(f.a,f.b),q=toCam(c,add(P,[0,.5+.45*up+jump,0]));if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;
  const k=c.F/q[2],w=.48*k,h=.64*k,hr=.13*k,x=p[0],y=p[1];n++;
  const body=polyPath([[x-w/2,y+h*.6],[x-w*.42,y-h*.35],[x-w*.18,y-h*.5],[x+w*.18,y-h*.5],[x+w*.42,y-h*.35],[x+w/2,y+h*.6]],true);sil.addPath(body);
  if(f.h<.5)red.addPath(body);else if(f.h<.8)dark.addPath(body);
  const head=polyPath(blob(x,y-h*.5-hr*.9,hr,hr*1.1,Math.floor(f.h*99),{amp:.06,n:10}),true);sil.addPath(head);skin.addPath(head);
  hair.addPath(polyPath(blob(x,y-h*.5-hr*1.35,hr*.95,hr*.55,Math.floor(f.h*77),{amp:.08,n:10}),true));
  if(up>.15){const ay=y-h*.45-hr*2.6*up,sw=Math.sin(tt*7+f.h*9)*w*.25;
   for(const sx of[-1,1]){const ax=x+sx*w*.42;sil.addPath(ribbon([[x+sx*w*.3,y-h*.3],[ax+sw*.3,ay]],w*.2,{seed:Math.floor(f.h*50)+sx}));skin.addPath(polyPath(blob(ax+sw*.3,ay,hr*.6,hr*.66,Math.floor(f.h*55)+sx,{amp:.05,n:8}),true));}
   if(f.h>.35&&f.h<.7){const sc=rectPath(x-w*.42+sw*.3,ay-hr*.5,w*.84,hr*.9);sil.addPath(sc);(f.h<.52?scarfR:scarfW).addPath(sc);}}}
 if(!n)return;s.knockout(sil);s.fill(R,red,.9);s.fill(K,dark,.85);s.tone(Y,skin,.4);s.tone(R,skin,.3);s.fill(K,hair,.85);s.fill(R,scarfR,.95);s.stroke(K,sil,2.2,.9);
}
const ch3:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam3(t),tp=twos(t),tau=tau3(tp),tO=CUEW(2,'Old Trafford'),tW=CUEW(2,'goes wild');
  stadium(s,c,v,t,{roar:.7*sm(tO,tW+.4,t)});
  fans(s,c,v,t,sm(tO-.2,tW+.5,t));
  ground(s,c);const r=play(s,c,v,tau,{dtau:Math.max(.004,tau-tau3(tp-1/12)),goalLast:true});
  // "Two-one": the ball meets the net in the top corner — a yellow burst so it reads through the mesh
  const hn=(tau-TG)/.7;if(hn>0&&hn<1&&r.ball)sparkBurst(s,Y,r.ball[0],r.ball[1],Math.max(60,r.br*5),{n:10,seed:29,g:easeOutBack(clamp(hn*3))*(1-clamp((hn-.6)/.4)),width:Math.max(8,r.br*.6)});
  // the passage material into the lesson: one red scarf held high in the stand, sparked yellow
  const fl=sm(SECS(2)-1.3,SECS(2)-.7,t);if(fl>0){const q=pr(c,fanPt(.55,.36));if(q)sparkBurst(s,Y,q[0],q[1],90+120*fl,{n:10,seed:5,g:fl,width:14});}},
 aperture(t){const c=cam3(t),q=pr(c,fanPt(.55,.36))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:4.6,
};

// ---------------------------------------------------------------- 4 · THE LESSON: a sports hall, soft gym mats, a coach tossing the ball
/** hall floor, metres: mats centred on the origin (3.4 × 2.2 × .3 m); the player faces the coach (−x) with a foam goal behind (+x);
 * the camera is a low front three-quarter from −z, so the kicking (right) leg is the near one. */
const B_KID:Build={height:1.38,bulk:.9,head:1.12},MAT_H=.3,MAT:[number,number,number,number]=[-1.7,1.7,-1.1,1.1];
const KID:AthleteStyle={shirt:Y,shorts:[K,.9],socks:Y,boots:K,skin:SKIN3,hair:K,line:K,trim:[K,.8],hairStyle:'short',build:B_KID,seed:33};
const COACH:AthleteStyle={shirt:[K,.85],shorts:[K,.85],socks:'paper',boots:K,skin:SKIN1,hair:K,line:K,trim:[R,.9],sleeves:'long',hairStyle:'balding',build:{height:1.8,bulk:1.05},seed:34};
const TC4=1.5,ARC_KID=jumpArc(B_KID,1.4),KID_X=.1,COACH_X=-2.8;
/** the lesson clock (kid τ, contact at TC4): slow motion keyed to the words */
function tau4(t:number){return key(t,mono([[0,TC4-3.2],[CUEW(3,'timing'),TC4-1.2],[CUEW(3,'Watch'),TC4-.6],[CUEW(3,'jump early'),TC4-.3],[CUEW(3,'land'),TC4+.36],[CUEW(3,'hands and back'),TC4+.56],[SECS(3),TC4+1.25]]),linear);}
/** the coach stands and tosses underarm */
const CSET=posed({lHipF:14,rHipF:6,lKnee:14,rKnee:10,lean:8,rShF:10,rElb:60,lShF:10,lShA:18,lElb:40,neckP:4,rHand:.6});
const TOSS=[[-2.3,CSET],[-1.7,posed({lHipF:30,rHipF:-6,lKnee:30,rKnee:14,lean:22,rShF:-44,rElb:12,lShF:24,lShA:24,lElb:40,neckP:-4,rHand:.7})],
 [-1.2,posed({lHipF:22,rHipF:-10,lKnee:18,rKnee:10,lean:4,rShF:112,rElb:8,lShF:30,lShA:30,lElb:36,neckP:-18,rHand:1})],
 [-.6,posed({lHipF:14,rHipF:4,lKnee:14,rKnee:10,lean:2,rShF:88,rElb:16,lShF:12,lShA:22,lElb:30,neckP:-22,rHand:1})],
 [.6,CSET]] as [number,Pose][];
function coachState(tau:number):State{return{pose:keyPoses(tau-TC4,TOSS),place:{x:COACH_X,z:.3,y:0,yaw:0}};}
const READY_KID=posed({lHipF:30,rHipF:36,lKnee:40,rKnee:48,lean:14,pitch:3,neckP:-22,lShA:28,rShA:26,lShF:10,rShF:4,lElb:50,rElb:50});
function kidState(tau:number):State{
 const u=tau-TC4,pre=(tt:number)=>blendPose(stand(),READY_KID,.45+.3*Math.sin(tt*3.2));let pose=pre(tau);
 if(u>=-.62)pose=keyPoses(u,[[-.62,pre(TC4-.62)],...OVER.slice(1,9)]);
 pose=flyPose(pose,u,ARC_KID,B_KID);
 const x=KID_X+.3*sm(-.3,.4,u);return{pose,place:{x,z:0,y:MAT_H,yaw:Math.PI}};
}
/** toss: from the coach's hand (release at TC4−1.2) on a ballistic arc to the laces at contact, then back over the kid's head into the goal */
const REL=TC4-1.2;
const handAt=(tau:number)=>{const st=coachState(tau),sk=solve(st.pose,{height:1.8,bulk:1.05},st.place);return add(sk.rHa,[.1,.03,0]);};
const HAND0:V3=handAt(REL);
const KC:V3=(()=>{const sk=solve({...CONTACT_POSE,air:clamp(ARC_KID.hc-pelvisY(CONTACT_POSE,B_KID),0,2)},B_KID,{x:KID_X+.3*sm(-.3,.4,0),z:0,y:MAT_H,yaw:Math.PI}),l=lacesOf(sk);return add(l,[-(BALL_R+.03),.03,0]);})();
const V_TOSS=ballistic(HAND0,KC,TC4-REL);
function kidBall(tau:number):V3{
 if(tau<REL)return handAt(tau);
 if(tau<TC4)return fly(HAND0,V_TOSS,tau-REL);
 const d=tau-TC4;return[KC[0]+8*d,Math.max(BALL_R,KC[1]+1.4*d-4.905*d*d),KC[2]-.6*d];
}
/** the mats as a projected box in two halves; `dip` squashes the top around dx (landing) */
function mats(s:Sheet,c:Cam,dip:number,dx:number,glow:number){
 const[x0,x1,z0,z1]=MAT,N=8,top=(x:number,z:number):V3=>[x,MAT_H-dip*.12*Math.exp(-Math.pow((x-dx)/.9,2))*(z>z0&&z<z1?1:.6),z];
 const topPts:V3[]=[];for(let i=0;i<=N;i++)topPts.push(top(lerp(x0,x1,i/N),z0));for(let i=N;i>=0;i--)topPts.push(top(lerp(x0,x1,i/N),z1));
 const front:V3[]=[];for(let i=0;i<=N;i++)front.push(top(lerp(x0,x1,i/N),z0));front.push([x1,0,z0],[x0,0,z0]);
 const sideL:V3[]=[top(x0,z0),top(x0,z1),[x0,0,z1],[x0,0,z0]];
 const all=new Path2D(),tp=new Path2D(),sd=new Path2D();addPoly(tp,polyP(c,topPts));for(const q of[front,sideL])addPoly(sd,polyP(c,q));all.addPath(tp);all.addPath(sd);
 s.knockout(all);s.fill(B,all,.95);s.tone(K,sd,.4);s.tone(Y,tp,.12);
 // the seam between the two mats and the carry handles on the front face
 const seam=new Path2D();{const q:V3[]=[];for(let i=0;i<=6;i++)q.push(top(0,lerp(z0,z1,i/6)));const p=q.map(v=>pr(c,v)).filter((v):v is Pt=>!!v);if(p.length>1)seam.addPath(ribbon(p,3.2,{seed:9,taper:.2,wobble:.5}));}
 for(const hx of[-1.1,-.5,.5,1.1]){const a=pr(c,[hx-.14,.2,z0-.01]),b=pr(c,[hx+.14,.2,z0-.01]);if(a&&b)seam.addPath(ribbon([a,b],3,{seed:10,taper:.1}));}
 s.fill(K,seam,.7);
 const edge=polyP(c,topPts);if(edge.length>2){s.fill(K,ribbon(edge,3.4,{seed:11,close:true,pressure:.3,wobble:.8}),.9);
  if(glow>0){const e=ribbon(edge,10+8*glow,{seed:12,close:true,pressure:.2,wobble:1});s.knockout(e,.9*glow);s.fill(Y,e,.95*glow);}}
}
function cam4(t:number):Cam{
 const tc=CUEW(3,'coach'),tt=CUEW(3,'timing'),tw=CUEW(3,'Watch'),tl=CUEW(3,'land'),S=SECS(3);
 const tx=key(t,[[0,-.4],[CUEW(3,'soft'),-.1],[tc,-1.3],[tt+.3,-1.1],[tw,-.2],[tl,.15],[S,-.3]],easeInOutSine);
 const ty=key(t,[[0,.95],[tc,1],[tw,1.3],[CUEW(3,'jump'),1.3],[tl,.8],[S,.95]],easeInOutSine);
 const F=key(t,[[0,1700],[CUEW(3,'soft'),2150],[tc,2000],[tw,2750],[tl,2800],[S,2300]],easeInOutSine)*LENS;
 return lookAt([tx-1.6,1.3,-6.2],[tx,ty,0],F);
}
/** "body shape": a blue stencil of the contact shape printed where the kid will be, so the move has a shape to fly into */
function ghost(s:Sheet,c:Cam,show:number){
 if(show<=0)return;const st=kidState(TC4);
 drawPlayer(s,st.pose,c,{shirt:[B,.32*show],shorts:[B,.2*show],socks:[B,.2*show],boots:[B,.45*show],skin:[[B,.2*show]],hair:[B,.45*show],line:B,shade:null,shadow:false,detail:'mid',lineWeight:.8,build:B_KID,seed:50},st.place);
}
/** the sports hall: a painted block wall with wall bars and high windows, a wooden floor with court lines, a foam goal */
function hall(s:Sheet,c:Cam,v:View){
 s.field(Y,.08,.4);
 const W=8,wall=polyP(c,[[-30,0,W],[30,0,W],[30,9,W],[-30,9,W]]);if(wall.length>2){const wp=polyPath(wall,true);s.tone(B,wp,.3);
  const blocks=new Path2D();for(let r=1;r<18;r++)seg3(c,[-30,r*.5,W-.01],[30,r*.5,W-.01],.02,blocks);s.fill(K,blocks,.25);}
 const win=new Path2D();for(let i=0;i<7;i++){const x=-12+i*4;addPoly(win,polyP(c,[[x,5.4,W-.02],[x+2.8,5.4,W-.02],[x+2.8,7.6,W-.02],[x,7.6,W-.02]]));}s.knockout(win);s.tone(Y,win,.3);
 // wall bars: rails and rungs
 const bars=new Path2D();for(let k=0;k<5;k++){const x=-7+k*1.1;seg3(c,[x,0,W-.15],[x,3.2,W-.15],.07,bars);seg3(c,[x+.9,0,W-.15],[x+.9,3.2,W-.15],.07,bars);for(let r=1;r<12;r++)seg3(c,[x,r*.27,W-.15],[x+.9,r*.27,W-.15],.04,bars);}
 s.knockout(bars);s.fill(Y,bars,.7);s.fill(R,bars,.4);s.stroke(K,bars,1.4,.6);
 // wooden floor (yellow × red), planks and court lines
 const g=polyP(c,[[-30,0,-14],[30,0,-14],[30,0,W],[-30,0,W]]);if(g.length>2){const gp=polyPath(g,true);s.knockout(gp);s.fill(Y,gp,.75);s.tone(R,gp,.3);
  const pl=new Path2D();for(let k=-24;k<24;k++)seg3(c,[k*.9,0,-14],[k*.9,0,W],.02,pl);s.fill(K,pl,.18);
  const ln=new Path2D();seg3(c,[-30,0,5.5],[30,0,5.5],.06,ln);seg3(c,[-4.5,0,-14],[-4.5,0,5.5],.06,ln);const cc:Pt[]=[];for(let i=0;i<=20;i++){const a=Math.PI+i/20*Math.PI,q=pr(c,[-4.5+Math.cos(a+Math.PI/2)*2.5,0,5.5-Math.abs(Math.sin(a))*2.5]);if(q)cc.push(q);}
  s.fill(R,ln,.9);if(cc.length>1)s.fill(B,ribbon(cc,3,{seed:44}),.8);}
 // a foam goal behind the mats (the ball's target)
 const gl=new Path2D();for(const[a,b] of[[[5.4,0,-1.6],[5.4,1.3,-1.6]],[[5.4,0,1.6],[5.4,1.3,1.6]],[[5.4,1.3,-1.66],[5.4,1.3,1.66]]] as [V3,V3][])seg3(c,a,b,.12,gl);
 const nt=new Path2D();addPoly(nt,polyP(c,[[5.4,1.3,-1.6],[5.4,1.3,1.6],[6.3,0,1.6],[6.3,0,-1.6]]));s.tone(K,nt,.2);s.knockout(gl);s.fill(R,gl,.9);s.stroke(K,gl,2,.9);
}
const ch4:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam4(t),tp=twos(t),tau=tau4(tp),u=tau-TC4;
  const tS=CUEW(3,'soft'),tC=CUEW(3,'coach'),tT=CUEW(3,'timing'),tB=CUEW(3,'body shape'),tW=CUEW(3,'Watch'),tJ=CUEW(3,'jump early'),tL=CUEW(3,'land'),tH=CUEW(3,'hands and back');
  hall(s,c,v);
  const land=sm(.3,.45,u)*(1-sm(.8,1.3,u)),dip=(land+settle(u,.42,{amp:.35,freq:2.5,decay:4})*(u>.42?1:0))+.5*sm(tS,tS+.25,t)*(1-sm(tS+.25,tS+.9,t));
  mats(s,c,dip,KID_X+.3,sm(tS-.1,tS+.3,t)*(1-sm(tS+1.2,tS+1.8,t)));
  ghost(s,c,sm(tB-.1,tB+.6,t)*(1-sm(-.12,.02,u)));
  // "timing": the toss's path printed ahead of the ball as a dashed arc, from the coach's hand to the laces
  const ta=sm(tT-.1,tT+.6,t)*(1-sm(tJ,tJ+.4,t));
  if(ta>0){const pts:Pt[]=[];for(let i=0;i<=20;i++){const q=pr(c,fly(HAND0,V_TOSS,(TC4-REL)*i/20));if(q)pts.push(q);}dashes(s,pts,6,ta,52,10);}
  const co=coachState(tau),kd=kidState(tau),prevK=kidState(tau4(tp-1/12));
  drawPlayer(s,co.pose,c,COACH,co.place);
  const b=kidBall(tau),bq=toCam(c,b),bg=bq[2]>NEAR?scr(c,bq):null,br=bg?c.F*BALL_R/bq[2]:0;
  // "land on your hands and back": yellow glows printed under the body where the hands, then the upper back meet the mat
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
    const e=kr.joints.face,d=Math.hypot(bg[0]-e[0],bg[1]-e[1]);if(d>br*2.4){const ux=(bg[0]-e[0])/d,uy=(bg[1]-e[1])/d;dashes(s,[[e[0]+ux*br*.8,e[1]+uy*br*.8],[bg[0]-ux*br*2.1,bg[1]-uy*br*2.1]],Math.max(4,br*.22),w,13,6);}}}
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
 id:'rooney-overhead-2011',format:'11v11',title:"Rooney's overhead kick",theme:'Timing and body shape: watch the ball, jump early, land on your hands and back',
 ageNote:'Premier League, Manchester United v Manchester City, Old Trafford, 12 February 2011. Beginners practise only on soft mats with a coach.',
 spec:{paper:'#f1ede3',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
export default film;
