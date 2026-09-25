/** Zlatan Ibrahimović's bicycle kick — Sweden 4–2 England, international friendly, the opening match at the Friends Arena, Solna
 * (Stockholm), Wednesday 14 November 2012. FIFA Puskás Award 2013. An iconic-play riso film (RisoStory, chapters mode) played in the player
 * card's picture window or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print.
 *
 * SOURCES (fetched Sept 2026, cached in the film agents' scratchpad src-cache):
 *  - BBC Sport match report, "Sweden 4-2 England" (14 Nov 2012) https://www.bbc.com/sport/football/20306158
 *  - BBC Sport, "Zlatan Ibrahimovic goal like 'a video game', says Sweden coach" (14 Nov 2012) https://www.bbc.com/sport/football/20334786
 *  - The Guardian, "Zlatan Ibrahimovic: I liked the first goal more because it was history" (15 Nov 2012)
 *    https://www.theguardian.com/football/2012/nov/15/zlatan-ibrahimovic-goal-sweden-england
 *  - Wikipedia, "Zlatan Ibrahimović" (Sweden section) and "FIFA Puskás Award" (2013: 1st, Ibrahimović, Sweden v England 4–2, friendly, 48.7 %)
 * CONFIRMED by those accounts: 14 November 2012, the first ever match at the new 50,000-seat Friends Arena, played under the CLOSED ROOF;
 * Sweden 4–2 England, Ibrahimović scored all four; this was the fourth, in stoppage time; Joe Hart "tore out of his area to head a punt
 * clear" — "headed clear from just outside his area" — and the ball fell toward Ibrahimović, who struck an overhead (bicycle) kick with his
 * back to goal from about 30 yards (BBC; Wikipedia says 35); it looped in; Ibrahimović: "Hart was a long way out", "I hit it in mid-air",
 * "I was on the ground when it was on the way in", he saw "their defender [Ryan Shawcross] running back to try to clear but it bounced over
 * him" / "a defender sliding in"; Gerrard (100th cap): "an overhead kick ... when the ball is six feet in the air"; Ibrahimović was 6 ft 5 in,
 * his hair tied up (the Guardian: he left "his hair let down"); it won the 2013 FIFA Puskás Award (goal of the year).
 * INFERRED (illustrative reconstruction): every position and run on the pitch (Hart's header ~1.5 m outside the D, Zlatan's contact spot
 * ~27 m out and a little to the left of centre as he faces away, Shawcross's line back and his slide, the other players drawn); who punted
 * (drawn: Sweden's keeper, unnamed, from his own box); the heights and flight times (punt apex ~15 m, header apex ~6 m, the loop apex ~4 m,
 * one bounce ~5 m out, in at ~1.1 m); his kicking foot (drawn RIGHT — he is right-footed; not stated in the sources read, so not narrated);
 * the body mechanics beyond "back to goal, in mid-air, landed on the ground"; which end and which side the main camera saw it from; the
 * kits (drawn: Sweden yellow shirts with blue numbers, blue shorts, yellow socks, Ibrahimović 10; England white shirts, navy shorts, white
 * socks; Hart in a blue keeper kit; Sweden's keeper in black) — the England strip and both keeper kits were not verified, so none is named in
 * the narration; the roof, seat colours, boards and crowd.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the punt, Hart racing out to head it, the ball
 * dropping to Zlatan 30 yards out, the kick, the loop, the net) · ch2 = the TV slow-motion REPLAY from a low pitch-side camera on Zlatan's
 * right, a long lens (Hart far off his line with the goal empty behind him, Zlatan's back to goal, the jump, the kick over his head) · ch3 = a
 * replay from BEHIND THE NET (the loop over the sliding defender, the bounce, the net) panning to the crowd · ch4 = the lesson on a youth
 * pitch: a player dribbles, checks the keeper, sees them off their line, looks up and chips it in from far out. Composed for the card window
 * (≈ 1.45:1 down to square): the world is centred on the CANVAS centre (never sheet.safe), cameras are real pinhole projections of metres.
 *
 * FIGURES: every body goes through ONE adapter, drawPlayer() → the shared fluid-body library ./athlete. The bicycle kick is authored as key
 * poses on that skeleton (a full back-to-goal scissor, a little twist) flown on a real ballistic pelvis arc; Hart heads with header().
 * Inks: yellow (Sweden, grass with blue, highlights), red (boards, skin screen), blue (Sweden shorts, Hart, roof light, grass), navy (key line,
 * the closed roof, seats). Scenes read only their local t; drawn objects on twos, cameras on ones; all randomness seeded.
 * Budget: ~150–240 plate ops per frame (4 plates); small figures in the wide shot print at 'low' detail, passages cap figure detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt} from '../../paths/riso/motion';
import {sparkBurst} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,posed,clampPose,keyPoses,blendPose,stand,runCycle,strike,header,dribble,slideTackle,keeperSet,keeperTip,celebrate,
 type Pose,type V3,type AthleteStyle,type Place,type InkFill,type Build,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional timings (≈2.5 words/s). `at` = word onset in the chapter's audio (s); `seconds` includes the silent
 * tail that carries the .65 s passage. The Kokoro generator (scripts/plays/kokoro-narrate.py) writes timing.json; withTiming then swaps in the
 * real clip lengths and word onsets and every action below re-times itself. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Stockholm, 2012, Sweden against England. A long ball forward. Joe Hart races out of his goal and heads it away. Zlatan Ibrahimovic... bicycle kick, from thirty yards!',seconds:12.8,
  cues:[[.2,'Stockholm'],[1.9,'Sweden against England'],[3.6,'A long ball'],[5.1,'Joe Hart'],[5.8,'races out'],[7.2,'heads it away'],[8.5,'Zlatan'],[9.9,'bicycle kick'],[11,'thirty yards']]},
 {label:'Watch it again',text:'Slow motion. The keeper is far off his line. Zlatan has his back to goal, so he jumps and kicks the ball over his head.',seconds:10.4,
  cues:[[.15,'Slow motion'],[1.2,'The keeper'],[2.1,'far off his line'],[3.9,'his back to goal'],[5.7,'jumps'],[6.4,'kicks the ball'],[7.4,'over his head']]},
 {label:'Behind the net',text:'It loops over a defender, bounces, and drops into the net. Goal of the Year!',seconds:7.4,
  cues:[[.4,'loops over'],[1,'a defender'],[1.9,'bounces'],[2.7,'drops into the net'],[4.2,'Goal of the Year']]},
 {label:'Your turn',text:'Your lesson: keep checking where the keeper is. If they come off their line, look up. You can score from far out!',seconds:9.8,
  cues:[[.15,'Your lesson'],[1.1,'keep checking'],[2.3,'the keeper'],[3.4,'come off their line'],[4.9,'look up'],[6.3,'score from far out']]},
];
/** Kokoro timing: null until the lead voices the film. After running kokoro-narrate.py, replace `null` with the import of
 * '../../../public/plays/narration/zlatan-england-2012/timing.json' (as the other films do) — nothing else changes. */
import timingJson from '../../../public/plays/narration/zlatan-england-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('zlatan: cue '+w);return c.at;};
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
/** a narrower (square) window gets a slightly wider lens so the action still fits (set by frame()) */
let LENS=1;
/** metres, right-handed, y up. England's goal line is x = 0 (posts z = ±3.66, net toward +x), the pitch runs to x = −105, touchlines
 * z = ±34. Sweden attack +x; the main camera sits high on the −z side. */
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

// ---------------------------------------------------------------- the Friends Arena on its opening night: roof closed, steep bowl, yellow-and-blue crowd
/** stand planes (a along, b up the rake 0..1): the stand opposite (+z), behind England's goal, the main stand (−z), the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-140,38,a),1.2+30*b,39+30*b],
 (a,b)=>[10+24*b,1.2+26*b,lerp(-66,66,a)],
 (a,b)=>[lerp(34,-136,a),1.2+26*b,-39-26*b],
 (a,b)=>[-114-24*b,1.2+26*b,lerp(66,-66,a)],
];
const STAND_COLS=[140,72,128,72],STAND_ROWS=[18,14,12,14],TIERS=[[.45],[.45],[.5],[.45]];
/** the closed roof: a dark navy canopy with rows of floodlights, a steep bowl of dark seats packed with fans (yellow Sweden shirts, blue,
 * white, dark coats). roar lifts the crowd (jumping) — one knockout + a few fills. */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t),all=rectPath(-1e4,-1e4,2e4,2e4);
 s.tone(K,all,.55);s.tone(B,all,.3);
 // the roof's lighting rings: rows of paper lamps high over the bowl
 const lamps=new Path2D();let nl=0;
 for(let ring=0;ring<2;ring++)for(let i=0;i<46;i++){const a=i/46*TAU,rx=78+ring*16,rz=58+ring*14,P:V3=[-52.5+Math.cos(a)*rx,42+ring*4,Math.sin(a)*rz],q=toCam(c,P);if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;
  const z=clamp(c.F*.9/q[2],2.4,14);lamps.addPath(polyPath(blob(p[0],p[1],z,z*.55,i+ring*50,{amp:.05,n:8}),true));nl++;}
 if(nl){s.knockout(lamps,.95);s.tone(Y,lamps,.25);}
 const planes=new Path2D(),fronts=new Path2D();
 const own=(si:number)=>si===2&&c.eye[2]<-38;
 STANDS.forEach((S,si)=>{if(own(si))return;addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[si])seg3(c,S(0,b),S(1,b),1.3,fronts);});
 s.knockout(planes);s.fill(K,planes,.55);s.tone(B,planes,.35);
 const dots=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],any=[0,0,0,0];
 STANDS.forEach((S,si)=>{if(own(si))return;const cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(q=>Math.abs(b-q)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.1)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.5/q[2],2.5,12),lift=roar>0?roar*z*(.4+1.1*Math.max(0,Math.sin(tt*12+h*TAU))):0;
   const ink=h<.52?0:h<.7?1:h<.84?2:3;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}});
 // yellow shirts, blue, white, dark coats
 if(any[0]){s.knockout(dots[0],.8);s.fill(Y,dots[0],.95);}if(any[1]){s.knockout(dots[1],.8);s.fill(B,dots[1],.9);}if(any[2])s.knockout(dots[2],.85);if(any[3])s.fill(K,dots[3],.9);
 s.fill(K,fronts,.85);
}
/** grass (yellow × blue = green), mowing stripes, red boards with paper panels, paper lines */
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-50],[14,0,-50],[14,0,50],[-118,0,50]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-38],[-(k+1)*5.25,0,-38],[-(k+1)*5.25,0,38],[-k*5.25,0,38]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 addPoly(bd,polyP(c,[[8.6,0,-30],[8.6,0,30],[8.6,.95,30],[8.6,.95,-30]]));addPoly(bd,polyP(c,[[-110,0,37.5],[6,0,37.5],[6,.95,37.5],[-110,.95,37.5]]));addPoly(bd,polyP(c,[[-110,0,-37.5],[6,0,-37.5],[6,.95,-37.5],[-110,.95,-37.5]]));
 for(let k=0;k<10;k++){const z=-28+k*6;addPoly(pn,polyP(c,[[8.55,.3,z],[8.55,.3,z+3],[8.55,.65,z+3],[8.55,.65,z]]));}
 for(let k=0;k<18;k++){const x=-106+k*6.2;addPoly(pn,polyP(c,[[x,.3,37.45],[x+3,.3,37.45],[x+3,.65,37.45],[x,.65,37.45]]));addPoly(pn,polyP(c,[[x,.3,-37.45],[x+3,.3,-37.45],[x+3,.65,-37.45],[x,.65,-37.45]]));}
 s.knockout(bd);s.fill(R,bd,.9);s.fill(K,bd,.3);s.knockout(pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);L([-105,0,-34+k*17],[-105,0,-34+(k+1)*17]);}
 for(const[x0,sg] of[[0,-1],[-105,1]] as [number,number][]){L([x0,0,-20.16],[x0+sg*16.5,0,-20.16]);L([x0+sg*16.5,0,-20.16],[x0+sg*16.5,0,20.16]);L([x0+sg*16.5,0,20.16],[x0,0,20.16]);
  L([x0,0,-9.16],[x0+sg*5.5,0,-9.16]);L([x0+sg*5.5,0,-9.16],[x0+sg*5.5,0,9.16]);L([x0+sg*5.5,0,9.16],[x0,0,9.16]);}
 const circ=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-11,0,9.15,Math.PI-.927,Math.PI+.927,10);circ(-52.5,0,9.15,0,TAU,24);
 addPoly(ln,polyP(c,[[-11.18,0,-.18],[-10.82,0,-.18],[-10.82,0,.18],[-11.18,0,.18]]));
 s.knockout(ln);
}
/** a goal on the line x = gx (net toward +x): posts z ±hw, bar H, net 2 m deep with a sloping roof; bulge pushes the back out around (bz) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number,o:{hw?:number;H?:number;gx?:number}={}){
 const{hw=3.66,H=2.44,gx=0}=o,z0=-hw,z1=hw,D=H*.82,back=(z:number)=>gx+D+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2)),zs=[z0,-hw/2,0,hw/2,z1],top=H*.78;
 const planes:V3[][]=[[[gx,0,z0],[gx,H,z0],[back(z0),top,z0],[back(z0),0,z0]],[[gx,0,z1],[gx,H,z1],[back(z1),top,z1],[back(z1),0,z1]],
  [[gx,H,z0],[gx,H,z1],...zs.slice().reverse().map(z=>[back(z),top,z] as V3)],[...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),top,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));s.knockout(net,.32);
 const mesh=new Path2D(),w=.022,S3=(a:V3,b:V3,ww:number,m:Path2D)=>seg3(c,a,b,ww,m,2.2);
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);S3([gx,H,z],[back(z),top,z],w,mesh);S3([back(z),top,z],[back(z),0,z],w,mesh);}
 for(let j=1;j<=5;j++){const y=top*j/6;for(let i=0;i<4;i++)S3([back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],w,mesh);S3([gx,y*H/top,z0],[back(z0),y,z0],w,mesh);S3([gx,y*H/top,z1],[back(z1),y,z1],w,mesh);}
 for(let j=1;j<4;j++){const u=j/4;S3([gx+D*u,H-(H-top)*u,z0],[gx+D*u,H-(H-top)*u,z1],w,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D(),fo=new Path2D();for(const[a,b] of [[[gx,0,z0],[gx,H,z0]],[[gx,0,z1],[gx,H,z1]],[[gx,H,z0-.06],[gx,H,z1+.06]]] as [V3,V3][]){seg3(c,a,b,.13,fr);seg3(c,a,b,.2,fo);}
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
/** a yellow ground arrow from a to b (world), width wm metres, grown by g */
function groundArrow(s:Sheet,c:Cam,a:V3,b:V3,wm:number,g:number,seed:number){
 if(g<=0)return;const e=mix3(a,b,g),pts:Pt[]=[];for(let i=0;i<=10;i++){const q=pr(c,mix3(a,e,i/10));if(q)pts.push(q);}if(pts.length<3)return;
 const d=toCam(c,e)[2],w=Math.max(5,c.F*wm/Math.max(1,d)),p=ribbon(pts,w,{seed,taper:.25,wobble:.5});
 const E=pts[pts.length-1],D=pts[pts.length-2],ang=Math.atan2(E[1]-D[1],E[0]-D[0]),hd=w*2.3;
 p.addPath(polyPath([[E[0]+Math.cos(ang)*hd,E[1]+Math.sin(ang)*hd],[E[0]+Math.cos(ang+2.2)*hd,E[1]+Math.sin(ang+2.2)*hd],[E[0]+Math.cos(ang-2.2)*hd,E[1]+Math.sin(ang-2.2)*hd]],true));
 s.knockout(p,.85);s.fill(Y,p,.95);s.stroke(K,p,2,.6);
}
/** the empty goal mouth printed as a yellow glow between the posts (x = gx) */
function mouthGlow(s:Sheet,c:Cam,g:number,o:{hw?:number;H?:number;gx?:number}={}){
 if(g<=0)return;const{hw=3.66,H=2.44,gx=0}=o,q=polyP(c,[[gx,0,-hw],[gx,0,hw],[gx,H,hw],[gx,H,-hw]]);if(q.length<3)return;const p=polyPath(q,true);
 s.knockout(p,.55*g);s.fill(Y,p,.75*g);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN1:InkFill[]=[[Y,.32],[R,.2]],SKIN2:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN3:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Sweden: yellow shirt with blue numbers, blue shorts, yellow socks */
const SWE=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:B,socks:Y,boots:K,skin:SKIN1,hair:K,line:K,trim:B,number:n,numberInk:B,hairStyle:'short',seed:n??70,...o});
/** England (inferred): white shirt, navy shorts, white socks */
const ENG=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.9],socks:'paper',boots:K,skin:SKIN1,hair:K,line:K,trim:[K,.8],number:n,numberInk:K,hairStyle:'short',seed:40+(n??9),...o});
const B_ZL:Build={height:1.95,bulk:1.06,thighs:1.06},B_HART:Build={height:1.96},B_SHAW:Build={height:1.91,bulk:1.05};

// ---------------------------------------------------------------- the play: keyframed tracks (τ = seconds after Hart's header)
/** TP: the punt · 0: Hart's header · TC: the bicycle kick · TB: the bounce · TG: over the line */
const TP=-3.4,TC=1.75,DS=1.6,TB=TC+DS,T_TAKE=TC-.3;
type Role='zl'|'hart'|'shaw'|'gk'|'run';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
/** Zlatan's contact spot (~27 m out, a little left of centre as he faces away from goal) and Hart's header spot (just outside his area) */
const ZC:[number,number]=[-26.2,-5.6],HH:[number,number]=[-18,-2.6];
/** positions [τ, x, z], Hermite-interpolated. All inferred from the written accounts (see header). */
const ACTORS:Actor[]=[
 {name:'Zlatan Ibrahimović',role:'zl',hero:true,style:SWE(10,{build:B_ZL,skin:SKIN2,hairStyle:'ponytail',seed:10}),
  keys:[[-9,-46,-1],[-6,-38,-2],[TP,-31,-2.8],[-1.6,-25.2,-3.2],[-.4,-21.8,-3.4],[0,-21.4,-3.5],[.35,-21.8,-3.8],[TC-.8,-24.4,-4.9],[TC-.35,-25.7,-5.4],[TC,ZC[0],ZC[1]],[TC+.5,-26.4,-5.6],[TC+2.6,-26.3,-5.6],[TC+4,-24,-6.6],[TC+7,-18,-10]]},
 {name:'Joe Hart',role:'hart',style:{shirt:[B,.62],shorts:[B,.62],socks:[B,.62],boots:K,skin:SKIN1,hair:K,line:K,gloves:'paper',trim:[K,.7],number:1,numberInk:K,sleeves:'long',hairStyle:'short',build:B_HART,seed:1},
  keys:[[-9,-3,-.4],[TP,-3.4,-.8],[-2.2,-6.4,-1.2],[-1,-13.6,-2.1],[-.3,-17.1,-2.5],[0,HH[0],HH[1]],[.45,-18.6,-2.7],[TC,-17.8,-2.3],[TB,-13.6,-1.6],[TB+4,-9.5,-1]]},
 {name:'Ryan Shawcross',role:'shaw',style:ENG(null,{build:B_SHAW,seed:44}),
  keys:[[-9,-44,5],[TP,-34,4.6],[-1,-24.5,3.4],[0,-21.5,2.6],[TC,-12.4,.6],[TB-.9,-7.4,-.7],[TB-.55,-6.3,-.95],[TB+4,-6.2,-.95]]},
 {name:'Sweden keeper',role:'gk',style:{shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN1,hair:K,line:K,gloves:Y,trim:[Y,.8],number:1,numberInk:Y,sleeves:'long',hairStyle:'short',build:{height:1.99},seed:2},
  keys:[[-9,-87,2.2],[TP-1,-86.4,2],[TP,-85.9,1.9],[TP+1.5,-85,1.6],[TB+4,-83,1]]},
 {name:'England defender',role:'run',style:ENG(null,{build:{height:1.93},skin:SKIN3,seed:45}),keys:[[-9,-44,11],[TP,-36,9.5],[0,-26,6.2],[TC,-21,4],[TB,-16,2],[TB+4,-13,1.4]]},
 {name:'England midfielder',role:'run',style:ENG(null,{seed:46}),keys:[[-9,-48,-15],[TP,-42,-13],[0,-34,-11],[TC,-30.5,-9.6],[TB+4,-27,-8.6]]},
 {name:'England midfielder 2',role:'run',style:ENG(null,{skin:SKIN2,seed:47}),keys:[[-9,-54,1],[TP,-46,1.5],[0,-38,0],[TC,-34,-1.4],[TB+4,-30,-2.4]]},
 {name:'Sweden midfielder',role:'run',style:SWE(null,{seed:71}),keys:[[-9,-52,-7],[TP,-45,-7],[0,-37,-6.5],[TC,-33.5,-6.2],[TB+4,-29,-6]]},
 {name:'Sweden forward',role:'run',style:SWE(null,{skin:SKIN2,seed:72}),keys:[[-9,-54,12],[TP,-47,11],[0,-39,9.5],[TC,-35.5,8.2],[TB+4,-31,6]]},
];
const ZL=0,HART=1,SHAW=2,GK=3;
/** Hermite through time-spaced keys (tangents scaled per segment so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const T0=-10,T1=14,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
/** yaw that faces the direction (dx,dz): athlete.ts faces +x at yaw 0 and yaw turns left, so facing = (cos y, −sin y) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);

// ---------------------------------------------------------------- the bicycle kick: key poses on the athlete skeleton (u = seconds from contact)
/** Mechanics: backing away from goal under the dropping header, eyes up → plant, the LEFT knee drives up while the right foot pushes off
 * (take-off .3 s before contact) → he tips back past horizontal with a little twist → the SCISSOR: the left leg drops as the right leg
 * whips over, laces through the ball above his head height ("I hit it in mid-air") → arms out and back → land on the hands and back ("I was
 * on the ground when it was on the way in"), knees up, chin tucked, head lifted to watch it → sit up and get up. */
const OVER:[number,Pose][]=[
 [-.45,posed({lHipF:34,rHipF:48,lKnee:46,rKnee:74,lAnk:-8,rAnk:14,lean:14,pitch:2,neckP:-40,lShA:34,rShA:30,lShF:-24,rShF:16,lElb:44,rElb:50})],
 [-.3,posed({pitch:-14,lean:-8,roll:-4,twist:6,lHipF:98,lKnee:78,lAnk:30,rHipF:-10,rKnee:14,rAnk:52,lShF:70,rShF:62,lShA:46,rShA:42,lElb:40,rElb:46,neckP:-34})],
 [-.17,posed({pitch:-60,lean:-12,roll:-8,twist:10,lHipF:124,lKnee:26,lAnk:40,rHipF:36,rKnee:100,rAnk:36,lShA:90,rShA:80,lShF:16,rShF:14,lElb:24,rElb:28,neckP:18})],
 [-.07,posed({pitch:-84,lean:-10,roll:-10,twist:12,lHipF:70,lKnee:40,lAnk:40,rHipF:74,rKnee:62,rAnk:44,lShA:96,rShA:86,lShF:-12,rShF:-10,lElb:18,rElb:20,neckP:38})],
 [0,posed({pitch:-96,lean:-8,roll:-12,twist:12,rHipF:102,rKnee:8,rAnk:52,lHipF:-14,lKnee:52,lAnk:30,lShA:94,rShA:82,lShF:-36,rShF:-30,lElb:14,rElb:18,neckP:48,lHand:1,rHand:1})],
 [.14,posed({pitch:-100,lean:-4,roll:-14,twist:10,rHipF:122,rKnee:20,rAnk:40,lHipF:-26,lKnee:60,lAnk:24,lShA:62,rShA:56,lShF:-66,rShF:-62,lElb:10,rElb:12,neckP:46,lHand:1,rHand:1})],
 [.34,posed({pitch:-90,lean:6,roll:-12,twist:6,rHipF:98,rKnee:46,lHipF:8,lKnee:74,lShA:38,rShA:36,lShF:-78,rShF:-76,lElb:22,rElb:22,neckP:52,lHand:1,rHand:1})],
 [.58,posed({pitch:-90,lean:26,roll:-8,rHipF:82,rKnee:82,lHipF:70,lKnee:92,lShA:42,rShA:42,lShF:-56,rShF:-56,lElb:56,rElb:56,neckP:46,lHand:.8,rHand:.8})],
 [1.3,posed({pitch:-62,lean:40,roll:-4,rHipF:80,rKnee:90,lHipF:74,lKnee:96,lShA:30,rShA:30,lShF:-40,rShF:-40,lElb:30,rElb:30,neckP:30,lHand:1,rHand:1})],
 [2.1,posed({pitch:-20,lean:30,lHipF:92,rHipF:84,lKnee:84,rKnee:70,lShA:26,rShA:26,lShF:-30,rShF:-36,lElb:20,rElb:20,neckP:0,lHand:1,rHand:1})],
 [2.8,posed({lHipF:96,lKnee:118,lAnk:10,rHipF:-8,rKnee:104,rAnk:40,lean:24,pitch:4,lShA:30,rShA:30,lShF:20,rShF:10,lElb:40,rElb:40,neckP:-8})],
 [3.4,runCycle(.05,{speed:.5})],
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
/** laces ~2 m up: "the ball is six feet in the air" (Gerrard) */
const ARC_ZL=jumpArc(B_ZL,2.05);
/** Zlatan at contact: back to goal — facing straight away from the goal centre */
const Z_YAW=yawTo(ZC[0],ZC[1]);

// ---------------------------------------------------------------- the ball: the punt → Hart's head → a high loop back out → the laces → over Shawcross, one bounce → the net
type State={pose:Pose;place:Place};
const BALL_R=.11;
/** Hart's header pose at contact, and where it meets the ball (just in front of his forehead) */
const HEAD_T=(tau:number)=>clamp((tau+.55)/1.05);
const H_YAW=yawTo(-85.4-HH[0],1.8-HH[1]);
const PH:V3=(()=>{const p=header(.52),sk=solve(p,B_HART,{x:HH[0],z:HH[1],yaw:H_YAW}),f:V3=[Math.cos(H_YAW),0,-Math.sin(H_YAW)];return add(add(sk.head,mul(f,.2)),[0,.08,0]);})();
/** the punt: from the Sweden keeper's boot */
const P0:V3=[-85.4,.5,1.8];
/** the contact point: the ball sits on Zlatan's laces at TC */
const PC:V3=(()=>{const sk=solve({...CONTACT_POSE,air:clamp(ARC_ZL.hc-pelvisY(CONTACT_POSE,B_ZL),0,2)},B_ZL,{x:ZC[0],z:ZC[1],yaw:Z_YAW}),l=lacesOf(sk);return add(l,mul(nrm(sub([PH[0],l[1]+3,PH[2]],l)),BALL_R+.03));})();
/** the bounce (~5 m out, just left of centre) and the flight on into the net */
const PB:V3=[-5.2,BALL_R,-1];
const ballistic=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const V_PUNT=ballistic(P0,PH,-TP),V_HEAD=ballistic(PH,PC,TC),V_SHOT=ballistic(PC,PB,DS);
const V_BOUNCE:V3=[V_SHOT[0]*.72,-(V_SHOT[1]-9.81*DS)*.5,V_SHOT[2]*.72];
const TG=TB+(-PB[0])/V_BOUNCE[0];
const fly=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const PG:V3=fly(PB,V_BOUNCE,TG-TB),NETP:V3=[1.55,PG[1]*.8,PG[2]+.2],REST:V3=[1.6,BALL_R,PG[2]+.3];
function ballAt(tau:number):V3{
 if(tau<TP){// in the Sweden keeper's hands, dropped onto the boot for the punt
  const[x,z]=posOf(GK,tau),held:V3=[x+.35,1.15,z],u=sm(TP-.3,TP,tau);return mix3(held,P0,u*u);}
 if(tau<0)return fly(P0,V_PUNT,tau-TP);
 if(tau<TC)return fly(PH,V_HEAD,tau);
 if(tau<TB)return fly(PC,V_SHOT,tau-TC);
 if(tau<TG)return fly(PB,V_BOUNCE,tau-TB);
 if(tau<TG+.22)return mix3(PG,NETP,easeOut((tau-TG)/.22));
 const u=clamp((tau-TG-.22)/.45);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u*u),lerp(NETP[2],REST[2],u)];
}
const velAt=(tau:number):V3=>tau<TP?[0,0,0]:tau<0?V_PUNT:tau<TC?V_HEAD:tau<TB?V_SHOT:V_BOUNCE;
const ballSpin=(tau:number)=>tau<TP?0:tau<TC?(tau-TP)*6:tau<TG?(TC-TP)*6-(tau-TC)*22:(TC-TP)*6-(TG-TC)*22;
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
/** the Sweden keeper holds the ball at the chest, then punts */
const HOLD=posed({lHipF:14,rHipF:8,lKnee:16,rKnee:12,lean:10,lShF:62,rShF:62,lShA:14,rShA:14,lElb:70,rElb:70,neckP:-4,lHand:.8,rHand:.8});
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'zl':{const u=tau-TC;
   // eyes up on the dropping header the whole way back out; he settles into his back-to-goal angle as it drops
   if(tau>-.3&&u<-.8)pose={...pose,neckP:pose.neckP-.7*sm(-.3,.4,tau)};
   if(u>=-.8&&u<3.4)pose=keyPoses(u,[[-.8,{...loco(k,TC-.8),neckP:loco(k,TC-.8).neckP-.7}],...OVER]);
   else if(u>=3.4){const run=celebrate(distOf(k,tau)/4,{kind:'run'});pose=blendPose(OVER[OVER.length-1][1],run,sm(3.4,4,u));}
   pose=flyPose(pose,u,ARC_ZL,B_ZL);
   yaw=lerpAng(faceYaw(k,tau),Z_YAW,sm(-1.4,-.5,u));
   if(u>2.4)yaw=lerpAng(Z_YAW,faceYaw(k,tau),sm(2.4,3.6,u));
   break;}
  case 'hart':{const w=sm(-.8,-.55,tau)*(1-sm(.5,.9,tau));if(w>0)pose=blendPose(pose,header(HEAD_T(tau)),w);
   // racing out along his run, squared up to the punt for the header; stranded, he turns to watch it sail over, then runs back
   yaw=lerpAng(faceYaw(k,tau),H_YAW,sm(-1.2,-.5,tau));if(tau>.5)yaw=lerpAng(H_YAW,faceYaw(k,tau,ballAt(tau)),sm(.5,1.2,tau));
   if(tau>.6&&tau<TC+.6){const q=sm(.6,1,tau)*(1-sm(TC,TC+.6,tau));pose=blendPose(pose,posed({lHipF:22,rHipF:18,lKnee:30,rKnee:26,lean:6,neckP:-30,neckY:0,lShA:24,rShA:24,lElb:50,rElb:50,lHand:1,rHand:1}),q);}
   break;}
  case 'shaw':{// running back to his line with the loop over his shoulder, then the slide as it bounces
   const st=(tau-(TB-.75))/1.25;if(st>0)pose=blendPose(pose,slideTackle(clamp(st)),sm(0,.12,st));
   yaw=st>0?yawTo(1,-.12):faceYaw(k,tau);
   if(st<=0&&tau>TC)pose={...pose,neckY:pose.neckY+.6*sm(TC,TC+.4,tau),neckP:pose.neckP-.3};
   break;}
  case 'gk':{const pt=(tau-TP)/1+.52;
   pose=tau<TP-.6?HOLD:pt<1.05?blendPose(HOLD,strike(clamp(pt),{power:1}),sm(TP-.6,TP-.35,tau)):blendPose(strike(1),loco(k,tau),sm(TP+.6,TP+1.2,tau));
   yaw=yawTo(1,0);break;}
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
type PlayOpts={dtau?:number;smear?:boolean;spark?:number;goalLast?:boolean;hit?:number;bounce?:number;minR?:number};
/** τ = the play clock for this frame (on twos); dtau = τ per drawn frame (for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,o:PlayOpts={}):{ball:Pt|null;br:number;zl?:DrawResult;hart?:DrawResult}{
 const{dtau=0,smear=false,spark=0,goalLast=false,hit=0,bounce=0,minR=4}=o;
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minR,c.F*BALL_R/bq[2]):0;
 const gq=pr(c,[b[0],0,b[2]]);if(gq&&b[0]<.1){const k=c.F/Math.max(1,toCam(c,[b[0],0,b[2]])[2]),r=clamp(.16*k*(1-Math.min(.7,b[1]/5)),2,300);s.tone(K,polyPath(blob(gq[0],gq[1],r,r*.3,2,{amp:.05,n:12}),true),.45*(1-Math.min(.8,b[1]/8)));}
 type Item={d:number;draw:()=>void};const items:Item[]=[];let zl:DrawResult|undefined,hart:DrawResult|undefined;const m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;const passing=!!s._passage.pending;
 ACTORS.forEach((a,k)=>{const st=stateOf(k,tau),x=st.place.x??0,z=st.place.z??0,q=toCam(c,[x,1,z]);if(q[2]<NEAR+.5)return;const p=scr(c,q),h=c.F*1.9/q[2];
  if(Math.abs(p[0])>v.hx+h||Math.abs(p[1])>v.hy+h)return;
  const main=a.hero||a.role==='hart'||a.role==='shaw',prev=dtau>0&&main?stateOf(k,tau-dtau):undefined;
  // the outgoing scene of a passage is zoomed past the camera: its figures print simply; small figures in wide shots print at 'low'
  const style=passing?{...a.style,detail:a.hero?'mid' as const:'low' as const}:!main&&h*ppu<150?{...a.style,detail:'low' as const}:h*ppu<60?{...a.style,detail:'low' as const}:a.style;
  items.push({d:q[2],draw:()=>{const r=drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!!a.hero});if(a.hero)zl=r;if(k===HART)hart=r;}});});
 const inNet=b[0]>.05;
 const drawBall=()=>{if(!bg)return;const V=velAt(tau),sp=tau>TP&&tau<TG?Math.hypot(...V):0,nb=pr(c,sub(b,mul(V,.03)));
  const dir=nb?Math.atan2(bg[1]-nb[1],bg[0]-nb[0]):0,sm_=nb&&sp>0?Math.min(br*3,Math.hypot(bg[0]-nb[0],bg[1]-nb[1])*1.4):0;ball(s,bg[0],bg[1],br,ballSpin(tau),sm_,dir);
  if(spark>0)sparkBurst(s,Y,bg[0],bg[1],br*4.2,{n:9,seed:17,g:easeOutBack(clamp(spark*2))*(1-clamp((spark-.5)*2)),width:br*.5});};
 // Hart's header: a small burst where his forehead meets the punt
 if(hit>0&&hit<1){const q=pr(c,PH);if(q){const r=Math.max(18,c.F*.45/Math.max(1,toCam(c,PH)[2]));sparkBurst(s,Y,q[0],q[1],r,{n:8,seed:23,g:easeOutBack(clamp(hit*2.5))*(1-clamp((hit-.55)/.45)),width:Math.max(3,r*.12)});}}
 // the bounce: a turf puff where it lands in front of the sliding defender
 if(bounce>0&&bounce<1){const q=pr(c,[PB[0],0,PB[2]]);if(q){const r=Math.max(16,c.F*.5/Math.max(1,toCam(c,PB)[2]));sparkBurst(s,Y,q[0],q[1],r,{n:7,seed:31,g:easeOutBack(clamp(bounce*3))*(1-clamp((bounce-.5)/.5)),width:Math.max(3,r*.12)});}}
 const goal=()=>goal3(s,c,bulgeAt(tau),b[2]);
 if(!goalLast){if(inNet)drawBall();goal();}
 if(!inNet||goalLast)items.push({d:bq[2],draw:drawBall});
 items.sort((p,q)=>q.d-p.d);for(const it of items)it.draw();
 if(goalLast)goal();
 return{ball:bg,br,zl,hart};
}

// ---------------------------------------------------------------- 1 · LIVE: the high main-stand camera, real time
/** τ from chapter time: real time, anchored so Hart heads it on "heads" and the kick lands near "bicycle" */
function tau1(t:number){const tL=CUEW(0,'A long'),tH=CUEW(0,'heads')+.15,tB=CUEW(0,'bicycle')-.1;
 if(t<tH){const k=clamp(-TP/Math.max(.5,tH-tL),.8,1.25);return Math.max(-9.5,(t-tH)*k);}
 const k=clamp(TC/Math.max(.5,tB-tH),.75,1.2);return(t-tH)*k;}
const E1:V3=[-34,24,-66];
function cam1(t:number):Cam{
 const tau=tau1(t),tL=CUEW(0,'A long'),tJ=CUEW(0,'Joe'),tZ=CUEW(0,'Zlatan'),tT=CUEW(0,'thirty'),S=SECS(0);
 const b=ballAt(tau),bs:V3=[b[0],1.4+.62*Math.min(b[1],16),b[2]],z=posOf(ZL,tau),Z3:V3=[z[0],1.4,z[1]],box:V3=[-15,1.2,-2],gk:V3=[-80,1.2,2];
 const w0=sm(tL-.4,tL+1.2,t,easeInOutSine),w1=sm(tJ-.2,tJ+1.4,t,easeInOutSine),w2=sm(tZ-.6,tZ+.6,t,easeInOutSine),w3=sm(tT-.2,tT+1.2,t,easeInOutSine);
 const T=mix3(mix3(mix3(mix3(gk,bs,w0),mix3(bs,box,.35),w1),mix3(Z3,[-14,1.4,-3],.35),w2),[-9,1.2,-2.5],w3);
 const F=key(t,[[0,3900],[tL,3300],[tJ,3800],[CUEW(0,'heads'),4500],[tZ,5000],[CUEW(0,'bicycle'),5200],[tT,4300],[S,4700]],easeInOutSine)*LENS;
 return lookAt(E1,T,F);
}
const ch1:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam1(t),tau=tau1(twos(t)),tT=CUEW(0,'thirty');
  stadium(s,c,v,t,{roar:sm(tT-.1,tT+.8,t)});
  ground(s,c);
  // the wide shot's ball is small: a short dashed yellow trail behind it while it flies (the punt, the header, the loop)
  if(tau>TP+.1&&tau<TG){const pts:Pt[]=[];for(let i=0;i<=10;i++){const u=tau-.55+.55*i/10;if(u<TP)continue;const q=pr(c,ballAt(u));if(q)pts.push(q);}dashes(s,pts,11,.9,19,5);}
  play(s,c,v,tau,{hit:tau/.5,bounce:(tau-TB)/.5,minR:12});},
 aperture(t){const c=cam1(t),b=ballAt(tau1(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*BALL_R/q[2]*1.6),12);},
 still:10,
};

// ---------------------------------------------------------------- 2 · REPLAY: slow motion from a low pitch-side camera on Zlatan's right
function tau2(t:number){return key(t,mono([[0,-.95],[CUEW(1,'The keeper'),-.3],[CUEW(1,'far off'),.1],[CUEW(1,'his back'),TC-1.05],[CUEW(1,'jumps'),T_TAKE],[CUEW(1,'kicks'),TC-.1],[CUEW(1,'over his'),TC+.02],[CUEW(1,'over his')+1.2,TC+.18],[SECS(1),TC+.75]]),linear);}
/** Zlatan's facing and right-hand side on the ground (x,z) at contact */
const Z_F:[number,number]=[Math.cos(Z_YAW),-Math.sin(Z_YAW)],Z_RT:[number,number]=[-Z_F[1],Z_F[0]];
const E2:V3=[ZC[0]+Z_RT[0]*10.5+Z_F[0]*1.5,1.1,ZC[1]+Z_RT[1]*10.5+Z_F[1]*1.5];
function cam2(t:number):Cam{
 const tau=tau2(t),[x,z]=posOf(ZL,tau),S=SECS(1),tk=CUEW(1,'The keeper'),tf=CUEW(1,'far off'),tb=CUEW(1,'his back'),tj=CUEW(1,'jumps'),to=CUEW(1,'over his');
 const hp=posOf(HART,tau),H3:V3=[hp[0],1.5,hp[1]],gap:V3=[-9,1.3,-1.5];
 const lift=sm(tj-.3,to,t,easeInOutSine)*(1-sm(to+1.2,S,t)),Z3:V3=[x,1.3+.4*lift,z];
 const T=mix3(mix3(mix3(H3,gap,sm(tk,tf+.8,t,easeInOutSine)),mix3(Z3,gap,.12),sm(tf+1.2,tb+.3,t,easeInOutSine)),mix3(Z3,[PB[0],1.5,PB[2]],.35),sm(to+1.1,S-.2,t,easeInOutSine));
 const F=key(t,[[0,3600],[tk,3300],[tf,2300],[tf+1.2,2300],[tb,3300],[tj,3100],[to,3200],[S,2700]],easeInOutSine)*LENS;
 return lookAt(E2,T,F);
}
const ch2:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam2(t),tp=twos(t),tau=tau2(tp),dtau=Math.max(.004,tau-tau2(tp-1/12));
  const tf=CUEW(1,'far off'),tb=CUEW(1,'his back'),tj=CUEW(1,'jumps'),tk=CUEW(1,'kicks');
  stadium(s,c,v,t);ground(s,c);
  // "far off his line": the empty goal lights up and a yellow arrow measures the gap from Hart back to his goal
  const gw=sm(tf-.1,tf+.6,t)*(1-sm(tb+.4,tb+1.2,t));
  if(gw>0){const h=posOf(HART,tau);mouthGlow(s,c,gw);groundArrow(s,c,[h[0]+.8,.02,h[1]],[-.6,.02,-.3],.18,sm(tf-.1,tf+.9,t),43);}
  // "his back to goal": an arrow on the grass from his heels back toward the goal he cannot see
  const bw=sm(tb-.1,tb+.6,t)*(1-sm(tj-.1,tj+.4,t));
  if(bw>0){const[zx,zz]=posOf(ZL,tau),d=nrm([-zx,0,-zz]);groundArrow(s,c,[zx+d[0]*.5,.02,zz+d[2]*.5],[zx+d[0]*5,.02,zz+d[2]*5],.14,sm(tb-.1,tb+.8,t),47);}
  const r=play(s,c,v,tau,{dtau,smear:true,spark:tau>=TC-.01?(tau-TC)/.2:0,hit:tau/.35});
  // eyes on the dropping ball: a sight line from his face to it until the jump
  const w=sm(tb+.3,tb+.8,t)*(1-sm(tj,tj+.4,t));
  if(w>0&&r.zl&&r.ball){const e=r.zl.joints.face,bg=r.ball,d=Math.hypot(bg[0]-e[0],bg[1]-e[1]);if(d>r.br*3){const ux=(bg[0]-e[0])/d,uy=(bg[1]-e[1])/d;dashes(s,[[e[0]+ux*r.br,e[1]+uy*r.br],[bg[0]-ux*r.br*2,bg[1]-uy*r.br*2]],Math.max(4,r.br*.3),w,13,6);}}
  // "jumps": a spark under the push-off (right) foot
  const jk=sm(tj-.05,tj+.25,t)*(1-sm(tj+.6,tj+1,t));if(jk>0&&r.zl){const f=r.zl.joints.rToe;sparkBurst(s,Y,f[0],f[1],80,{n:8,seed:21,g:easeOutBack(jk),width:11});}
  // "kicks the ball": the shot's loop printed ahead as a dashed arc toward goal
  const ka=sm(tk+.4,tk+1.4,t);if(ka>0){const pts:Pt[]=[];for(let i=0;i<=24;i++){const q=pr(c,fly(PC,V_SHOT,DS*ka*i/24));if(q)pts.push(q);}dashes(s,pts,7,ka,41,12);}
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(22,c.F*BALL_R/q[2]*1.4),12);},
 still:8,
};

// ---------------------------------------------------------------- 3 · REPLAY behind the net: over the sliding defender, the bounce, the net, the crowd
function tau3(t:number){return key(t,mono([[0,TC+.15],[CUEW(2,'loops'),TC+.5],[CUEW(2,'a defender'),TC+1.05],[CUEW(2,'bounces'),TB],[CUEW(2,'drops'),TG+.05],[CUEW(2,'Goal'),TG+1.3],[SECS(2),TG+4]]),linear);}
const E3:V3=[6.8,1.7,1.6];
/** the fans' section: the main stand (−z), x −40 … 0 */
const FANS=(()=>{const out:{a:number;b:number;h:number}[]=[];for(let j=0;j<9;j++)for(let i=0;i<40;i++){const h=hash(i*97+j*13,27);if(h<.08)continue;out.push({a:(i+.5+(hash(i,j+3)-.5)*.35)/40,b:.04+j*.07,h});}return out;})();
const fanPt=(a:number,b:number):V3=>[lerp(-36,2,a),1.2+26*b,-39-26*b];
function cam3(t:number):Cam{
 const tau=tau3(t),tG=CUEW(2,'Goal'),pan=sm(tG-.5,tG+1.1,t,easeInOutSine);
 const b=ballAt(Math.min(tau,TG)),toPlay:V3=mix3([-14,1.6,-3],[b[0]-1.5,Math.max(1.2,b[1]*.8),b[2]],.5*sm(0,CUEW(2,'drops'),t));
 const[zx,zz]=posOf(ZL,tau),T=mix3(toPlay,mix3([zx,1.2,zz],fanPt(.45,.3),.5),pan),F=lerp(2900,2600,pan)*LENS;
 return lookAt(add(E3,[0,.4*pan,-.8*pan]),T,F);
}
/** the fans: rows jumping with both arms up and yellow/blue scarves held high — batched: knockout, shirts, skin, scarves, hands */
function fans(s:Sheet,c:Cam,v:View,t:number,rise:number){
 if(rise<=0)return;
 const sil=new Path2D(),yel=new Path2D(),blu=new Path2D(),dark=new Path2D(),skin=new Path2D(),hair=new Path2D(),scarfY=new Path2D(),scarfB=new Path2D();let n=0;const tt=twos(t);
 for(const f of FANS){const up=clamp(rise*1.5-f.h*.5),jump=up*.18*Math.max(0,Math.sin(tt*9+f.h*TAU)),P=fanPt(f.a,f.b),q=toCam(c,add(P,[0,.5+.45*up+jump,0]));if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;
  const k=c.F/q[2],w=.48*k,h=.64*k,hr=.13*k,x=p[0],y=p[1];n++;
  const body=polyPath([[x-w/2,y+h*.6],[x-w*.42,y-h*.35],[x-w*.18,y-h*.5],[x+w*.18,y-h*.5],[x+w*.42,y-h*.35],[x+w/2,y+h*.6]],true);sil.addPath(body);
  if(f.h<.5)yel.addPath(body);else if(f.h<.68)blu.addPath(body);else if(f.h<.85)dark.addPath(body);
  const head=polyPath(blob(x,y-h*.5-hr*.9,hr,hr*1.1,Math.floor(f.h*99),{amp:.06,n:10}),true);sil.addPath(head);skin.addPath(head);
  hair.addPath(polyPath(blob(x,y-h*.5-hr*1.35,hr*.95,hr*.55,Math.floor(f.h*77),{amp:.08,n:10}),true));
  if(up>.15){const ay=y-h*.45-hr*2.6*up,sw=Math.sin(tt*7+f.h*9)*w*.25;
   for(const sx of[-1,1]){const ax=x+sx*w*.42;sil.addPath(ribbon([[x+sx*w*.3,y-h*.3],[ax+sw*.3,ay]],w*.2,{seed:Math.floor(f.h*50)+sx}));skin.addPath(polyPath(blob(ax+sw*.3,ay,hr*.6,hr*.66,Math.floor(f.h*55)+sx,{amp:.05,n:8}),true));}
   if(f.h>.35&&f.h<.7){const sc=rectPath(x-w*.42+sw*.3,ay-hr*.5,w*.84,hr*.9);sil.addPath(sc);(f.h<.52?scarfY:scarfB).addPath(sc);}}}
 if(!n)return;s.knockout(sil);s.fill(Y,yel,.95);s.fill(B,blu,.9);s.fill(K,dark,.85);s.tone(Y,skin,.4);s.tone(R,skin,.3);s.fill(K,hair,.85);s.fill(Y,scarfY,.95);s.fill(B,scarfB,.95);s.stroke(K,sil,2.2,.9);
}
const ch3:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam3(t),tp=twos(t),tau=tau3(tp),tG=CUEW(2,'Goal');
  stadium(s,c,v,t,{roar:.7*sm(tG-.3,tG+.6,t)});
  fans(s,c,v,t,sm(tG-.4,tG+.6,t));
  ground(s,c);const r=play(s,c,v,tau,{dtau:Math.max(.004,tau-tau3(tp-1/12)),goalLast:true,bounce:(tau-TB)/.6});
  // "drops into the net": a yellow burst so the ball reads through the mesh
  const hn=(tau-TG)/.7;if(hn>0&&hn<1&&r.ball)sparkBurst(s,Y,r.ball[0],r.ball[1],Math.max(60,r.br*5),{n:10,seed:29,g:easeOutBack(clamp(hn*3))*(1-clamp((hn-.6)/.4)),width:Math.max(8,r.br*.6)});
  // the passage material into the lesson: one yellow scarf held high in the stand, sparked
  const fl=sm(SECS(2)-1.3,SECS(2)-.7,t);if(fl>0){const q=pr(c,fanPt(.5,.36));if(q)sparkBurst(s,Y,q[0],q[1],90+120*fl,{n:10,seed:5,g:fl,width:14});}},
 aperture(t){const c=cam3(t),q=pr(c,fanPt(.5,.36))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:4.6,
};

// ---------------------------------------------------------------- 4 · THE LESSON: a youth pitch — check the keeper, see them off their line, look up, chip it in
/** youth goal on x = 0 (5 m × 2 m), the player dribbles in from −x, the keeper walks off the line; the camera is a low three-quarter behind
 * the player's right shoulder. */
const B_KID:Build={height:1.42,bulk:.9,head:1.12},B_KGK:Build={height:1.46,bulk:.95,head:1.1},GW=2.5,GH=2;
const KID:AthleteStyle={shirt:Y,shorts:B,socks:Y,boots:K,skin:SKIN3,hair:K,line:K,trim:B,number:10,numberInk:B,hairStyle:'curly',build:B_KID,seed:33};
const KGK:AthleteStyle={shirt:[R,.9],shorts:[K,.85],socks:[R,.9],boots:K,skin:SKIN1,hair:K,line:K,gloves:Y,trim:[K,.8],sleeves:'long',hairStyle:'ponytail',build:B_KGK,seed:34};
/** lesson times (chapter seconds): the chip's contact lands on "score", the keeper walks out on "come off" */
const L=()=>{const tc=CUEW(3,'keep'),tk=CUEW(3,'the keeper'),to=CUEW(3,'come off'),tl=CUEW(3,'look up'),ts=CUEW(3,'score');return{tc,tk,to,tl,ts,TK:ts+.25};};
const KX0=-25,KSP=.95;
function kidX(t:number){const{TK}=L();return KX0+KSP*Math.min(t,TK-.3)+KSP*.5*clamp(t-(TK-.3),0,.6);}
function kidState(t:number):State{
 const{tc,tk,tl,TK}=L(),x=kidX(t);let pose=dribble(t*1.55,{speed:.35});
 // head checks: a quick look up at the keeper on "keep checking", again on "the keeper", then the big look up
 const look=Math.max(sm(tc-.05,tc+.2,t)*(1-sm(tc+.55,tc+.8,t)),sm(tk-.05,tk+.2,t)*(1-sm(tk+.6,tk+.85,t)),sm(tl-.1,tl+.25,t)*(1-sm(TK-.7,TK-.45,t)));
 pose={...pose,neckP:pose.neckP-1.1*look,lean:pose.lean-.18*look};
 const st=(t-(TK-.52))/1;if(st>0)pose=blendPose(pose,strike(clamp(st),{power:.8}),sm(0,.12,st));
 return{pose,place:{x,z:0,y:0,yaw:0}};
}
function keeperX(t:number){const{to}=L();return lerp(-1.2,-10.5,sm(to-.3,to+1.8,t,easeInOutSine));}
function kgkState(t:number):State{
 const{to,TK}=L(),x=keeperX(t),moving=sm(to-.3,to+.1,t)*(1-sm(to+1.3,to+1.7,t));
 let pose=blendPose(keeperSet(t*1.2),runCycle(t*1.6,{speed:.3}),moving);
 const tip=(t-(TK+.1))/1.1;if(tip>0)pose=blendPose(pose,keeperTip(clamp(tip)),sm(0,.15,tip));
 return{pose,place:{x:x+(tip>0?.8*sm(.1,.7,tip):0),z:.2,y:0,yaw:Math.PI}};
}
/** the chip: off the laces at TK, over the keeper, dipping under the bar */
const CHIP_T=1.15,CHIP_TO:V3=[.25,1.45,.5];
function kidBall(t:number):V3{
 const{TK}=L();
 if(t<TK){const x=kidX(t),f=((t*1.55-.97)%1+1)%1,d=.3+.32*(f<.2?f/.2:1-(f-.2)/.8);return[x+d+.1,BALL_R,.12];}
 const A:V3=[kidX(TK)+.42,BALL_R,.12],V=ballistic(A,CHIP_TO,CHIP_T),u=t-TK;
 if(u<CHIP_T)return fly(A,V,u);const w=u-CHIP_T;return[CHIP_TO[0]+Math.min(1.1,w*4),Math.max(BALL_R,CHIP_TO[1]-w*2.2),CHIP_TO[2]];
}
function cam4(t:number):Cam{
 const{tc,to,tl,ts}=L(),S=SECS(3),kx=kidX(t);
 const near:V3=[kx+3.2,.85,.5],far:V3=[kx+9.5,1,.4];
 const T0_=mix3(near,far,sm(to-.4,to+1.2,t,easeInOutSine)*(1-sm(ts-.4,ts+.4,t,easeInOutSine))*.9);
 const T=mix3(T0_,[-4,1.2,.2],sm(ts+.5,S-.6,t,easeInOutSine));
 const F=key(t,[[0,2000],[tc,2100],[to,1800],[tl,1800],[ts,1900],[S,2300]],easeInOutSine)*LENS;
 return lookAt([kx-4.6,1.5,-2.6],T,F);
}
/** a daytime youth pitch: pale sky, a line of trees, grass with a painted box, cones */
function youthPitch(s:Sheet,c:Cam,v:View){
 const all=rectPath(-1e4,-1e4,2e4,2e4);s.tone(B,all,.22);
 // tree line far behind the goal
 const tr=new Path2D();for(let i=0;i<26;i++){const x=24+hash(i,3)*6,z=-60+i*5,h=6+hash(i,5)*5,top=pr(c,[x,h,z]),bot=pr(c,[x,0,z]);if(!top||!bot)continue;const r=Math.abs(bot[1]-top[1])*.45;tr.addPath(polyPath(blob(top[0],(top[1]+bot[1])/2,r,Math.abs(bot[1]-top[1])*.55,i,{amp:.12,n:12}),true));}
 s.knockout(tr);s.fill(B,tr,.7);s.tone(Y,tr,.5);s.tone(K,tr,.25);
 const g=polyP(c,[[-60,0,-40],[30,0,-40],[30,0,40],[-60,0,40]]);if(g.length<3)return;const gp=polyPath(g,true);s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.7);
 const st=new Path2D();for(let k=0;k<12;k+=2)addPoly(st,polyP(c,[[-k*4,0,-30],[-(k+1)*4,0,-30],[-(k+1)*4,0,30],[-k*4,0,30]]));s.tone(K,st,.1);
 const ln=new Path2D(),Ln=(a:V3,b:V3)=>seg3(c,a,b,.1,ln);
 Ln([0,0,-25],[0,0,25]);Ln([0,0,-11],[-13,0,-11]);Ln([-13,0,-11],[-13,0,11]);Ln([-13,0,11],[0,0,11]);Ln([0,0,-5],[-4.5,0,-5]);Ln([-4.5,0,-5],[-4.5,0,5]);Ln([-4.5,0,5],[0,0,5]);
 s.knockout(ln);
 const cones=new Path2D();for(const[x,z] of [[-22,-3.5],[-22,3.5],[-16,-6],[-16,6]] as [number,number][]){const a=pr(c,[x,.28,z]),b1=pr(c,[x-.14,0,z]),b2=pr(c,[x+.14,0,z]);if(a&&b1&&b2)cones.addPath(polyPath([a,b2,b1],true));}
 s.knockout(cones);s.fill(R,cones,.9);s.fill(Y,cones,.5);
}
const ch4:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam4(t),tp=twos(t),{tc,tk,to,tl,ts,TK}=L();
  youthPitch(s,c,v);
  // "come off their line": the gap behind the keeper lights up, an arrow from the keeper back to the empty goal
  const gw=sm(to+.6,to+1.3,t)*(1-sm(TK+.6,TK+1.2,t));if(gw>0){mouthGlow(s,c,gw,{hw:GW,H:GH});groundArrow(s,c,[keeperX(t)+.7,.02,.2],[-.5,.02,.2],.16,sm(to+.6,to+1.6,t),61);}
  const kd=kidState(tp),prevK=kidState(tp-1/12),gk=kgkState(tp),prevG=kgkState(tp-1/12),b=kidBall(tp),gd=b[0]>.05?Math.exp(-(tp-TK-CHIP_T)*2.4):0;
  const kq=toCam(c,[kgkState(tp).place.x??0,1,.2])[2],bq0=toCam(c,b)[2];
  const drawGoal=()=>goal3(s,c,gd,b[2],{hw:GW,H:GH});
  const drawKgk=()=>{const r=drawPlayer(s,gk.pose,c,KGK,gk.place,{prev:prevG});
   // "keep checking" / "the keeper": a yellow ring over the keeper each time the player looks
   const ring=Math.max(sm(tc,tc+.25,t)*(1-sm(tc+.7,tc+1,t)),sm(tk,tk+.25,t)*(1-sm(tk+.8,tk+1.1,t)));
   if(ring>0){const h=r.joints.head,rad=r.heightPx*.2,pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push([h[0]+Math.cos(a)*rad*1.3,h[1]+Math.sin(a)*rad*.7-rad*1.6]);}const rr=ribbon(pts,Math.max(4,rad*.14),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}};
  const drawBall_=()=>{const bq=toCam(c,b);if(bq[2]<NEAR)return;const g=scr(c,bq),br=Math.max(4,c.F*BALL_R/bq[2]),u=tp-TK;ball(s,g[0],g[1],br,tp*6,u>0&&u<CHIP_T?br*1.2:0,-Math.PI/2);
   if(u>0&&u<.4)sparkBurst(s,Y,g[0],g[1],br*4,{n:8,seed:3,g:easeOutBack(clamp(u*5))*(1-clamp((u-.2)/.2)),width:br*.4});
   if(u>CHIP_T&&u<CHIP_T+.7)sparkBurst(s,Y,g[0],g[1],br*6,{n:10,seed:29,g:easeOutBack(clamp((u-CHIP_T)*4))*(1-clamp((u-CHIP_T-.4)/.3)),width:br*.6});};
  // depth order: goal (far), keeper, ball / kid (near)
  if(b[0]>.05){drawBall_();drawGoal();drawKgk();}
  else{drawGoal();if(bq0>kq)drawBall_();drawKgk();if(bq0<=kq&&tp>TK)drawBall_();}
  // "look up": the player's sight line over the keeper to the goal
  const lw=sm(tl-.1,tl+.4,t)*(1-sm(TK-.2,TK+.2,t));
  const kr=drawPlayer(s,kd.pose,c,KID,kd.place,{prev:prevK,smear:tp>TK-.3&&tp<TK+.4});
  if(tp<=TK&&b[0]<=.05)drawBall_();
  if(lw>0){const e=kr.joints.face,gq=pr(c,[0,GH*.7,.3]);if(gq){const d=Math.hypot(gq[0]-e[0],gq[1]-e[1]),ux=(gq[0]-e[0])/d,uy=(gq[1]-e[1])/d;const mid:Pt=[(e[0]+gq[0])/2,(e[1]+gq[1])/2-d*.12];dashes(s,[[e[0]+ux*12,e[1]+uy*12],mid,gq],6,lw,13,10);}}
  // "score from far out": the chip's path printed ahead of the ball as a dashed arc
  const ca=sm(ts-.2,ts+.3,t)*(1-sm(TK+CHIP_T+.3,TK+CHIP_T+.9,t));if(ca>0){const A:V3=[kidX(TK)+.42,BALL_R,.12],V=ballistic(A,CHIP_TO,CHIP_T),pts:Pt[]=[];for(let i=0;i<=20;i++){const q=pr(c,fly(A,V,CHIP_T*i/20*sm(ts-.2,ts+.4,t)));if(q)pts.push(q);}dashes(s,pts,6,ca,52,10);}
 },
 still:9,
};

// ---------------------------------------------------------------- touch: a turf kick (grass bits + paper flecks) and a yellow spark
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size;(i%3?a:b).addPath(polyPath([[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]],true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}

const film:RisoStory={
 id:'zlatan-england-2012',format:'11v11',title:"Zlatan's bicycle kick",theme:'If the keeper is off their line, look up: you can score from far out',
 ageNote:'International friendly, Sweden v England, Friends Arena, Solna (Stockholm), 14 November 2012. FIFA Puskás Award 2013.',
 spec:{paper:'#f1ede3',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
export default film;
