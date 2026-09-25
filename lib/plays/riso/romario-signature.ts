/** Romário's signature — "the quick feint and toe-poke" (lib/town/iconicPlays.json, kind "signature"), shown through ONE real, well-documented
 * moment: Barcelona 5–0 Real Madrid, La Liga matchday 18, Camp Nou, 8 January 1994, the opening goal (24th minute). An iconic-play riso film
 * (RisoStory, chapters mode) played in the player card's picture window or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN
 * accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT: it is the goal the sources single out as the purest example of both halves of his signature — the feint (the "cola de vaca",
 * the cow's tail: he dragged the ball round his marker without it leaving his foot) and the finish (his trademark toe-poke into the corner).
 * El Mundo Deportivo's 2008 readers' poll voted it the most beautiful goal in Barcelona's history.
 *
 * SOURCES (read Sept 2026 with curl; cached under scratchpad/films/src-cache/):
 *  - Wikipedia (en) "Romário" (action=raw): "a hat-trick in the memorable 5–0 win over Real Madrid in the El Clásico at the Camp Nou, with the
 *    spectacular opening goal seeing him drag the ball around the defender without it leaving his foot before finishing with a trademark
 *    toe-poke into the corner of the net"; the toe-poke "with little back-lift" as his trademark (citing The Telegraph, 10 Jan 2012, "Strikers'
 *    trademark goals: ... the Romario toe-poke"); Johan Cruyff: "most of them with his toe".
 *  - Wikipedia (es) "Romário": the goal in that season's clásico, "haciéndole al defensa español Rafael Alkorta un sorprendente regate llamado
 *    «cola de vaca», tras un pase de Josep Guardiola, para batir al guardameta Francisco Buyo, inaugurando el marcador en un histórico 5 a 0
 *    ... en el estadio Camp Nou en enero de 1994"; voted the most beautiful goal in Barça's history (El Mundo Deportivo poll, 2008).
 *  - Wikipedia (pt) "Romário": the dribble "chamado pelos espanhóis de Cola de Vaca" on Alkorta; three goals and an assist in the 5–0.
 *  - Wikipedia (en) "1993–94 FC Barcelona season": 8 January 1994, round 18, Camp Nou, Barcelona 5–0 Real Madrid, Romário 24' 56' 81',
 *    Koeman 47', Iván Iglesias 86'; referee Urío Velázquez.
 *  - GloboEsporte, "Romário supera Maradona em pesquisa" (16 Apr 2008, via the Wayback Machine): "O Baixinho recebeu na entrada da área,
 *    driblou o zagueiro Alkorta e chutou sem chances para o goleiro merengue."
 * CONFIRMED by those accounts: Barcelona 5–0 Real Madrid, Camp Nou, 8 January 1994, the opening goal in the 24th minute; the pass came from
 * Guardiola; Romário received at the EDGE (the "entrance") OF THE PENALTY AREA with defender Rafael Alkorta marking him; the cola de vaca /
 * cow's tail: he dragged the ball round Alkorta without it leaving his foot; then a TOE-POKE into the CORNER past keeper Francisco (Paco)
 * Buyo; Romário went on to score a hat-trick; the Spanish name for the move is "cola de vaca".
 * INFERRED (illustrative reconstruction — the footage was not checked): every position, distance and timing (Guardiola's ~20 m ground pass
 * from centre-left of midfield; Romário just right of centre, BACK TO GOAL, Alkorta tight on his back, a touch to his left); the shape of the
 * drag (drawn: the inside of his RIGHT foot meets the pass and sweeps the ball round his right side while he pivots on his left foot, 180° to
 * face goal, Alkorta leaning the other way); the one step and the RIGHT-footed toe-poke (Romário was right-footed, but the footage was not
 * checked, so the narration never names the foot); WHICH corner (drawn: low, to Buyo's right) and whether Buyo came off his line; the
 * celebration run; which end Barcelona attacked for the main camera; the kits (drawn: Barcelona's blaugrana stripes with navy shorts and blue
 * socks; Real Madrid all white with navy trim; Buyo in yellow; the referee in black); no shirt numbers are printed (not verified); a floodlit
 * evening (kick-off time not verified); the Camp Nou bowl, crowd, boards and lights; the other players (unnamed); the ball (a plain white
 * ball with dark panels).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in near REAL TIME (Guardiola brings it out, the pass, the swish,
 * the toe-poke, the net) · ch2 = the TV slow-motion REPLAY from a low pitch-side camera beside the two players: the cow's tail (the ball's
 * swept path printed on the grass, a glue thread from boot to ball, the tail swish) · ch3 = a replay from BEHIND THE GOAL: the short toe-poke,
 * Buyo's late dive, the corner, then Romário's run and the crowd · ch4 = the lesson from a low front camera on the same beat (the feint arrow,
 * the space it buys, the quick shot line). Composed for the card window (≈ 1.45:1 down to square): the world is centred on the CANVAS centre
 * (never sheet.safe), cameras are real pinhole projections of metres.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → the shared fluid-body library ./athlete. The cow's tail is authored as key
 * poses; the ball is swept on an arc round his right side, just ahead of his turn, with the inside of the right boot sweeping it.
 * Inks: yellow, red, blue, navy. Scenes read only their local t; drawn objects on twos, cameras on ones; all randomness seeded.
 * Budget: ~150–250 plate ops per frame (4 plates); small figures in wide shots print at 'low' detail, passages cap figure detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,posed,keyPoses,blendPose,stand,runCycle,strike,lunge,keeperSet,keeperDive,celebrate,STRIKE_CONTACT,
 type Pose,type V3,type AthleteStyle,type Place,type InkFill,type Build,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional timings (≈2.5 words/s). `at` = word onset in the chapter's audio (s); `seconds` includes the silent
 * tail that carries the .65 s passage. The Kokoro generator (scripts/plays/kokoro-narrate.py) writes timing.json; withTiming then swaps in the
 * real clip lengths and word onsets and every action below re-times itself. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Camp Nou, January 1994. Barcelona against Real Madrid. Romário waits at the edge of the box, a defender on his back. Guardiola passes... one swish of the foot, a toe-poke... goal!',seconds:15,
  cues:[[.2,'Camp Nou'],[2.2,'Barcelona against'],[4.3,'Romário waits'],[7.2,'a defender'],[8.9,'Guardiola passes'],[10.3,'one swish'],[11.8,'a toe-poke'],[13,'goal']]},
 {label:'Watch it again',text:"Watch it again, slowly. He drags the ball round the defender without it leaving his foot. The Spanish call it the cow's tail.",seconds:10.4,
  cues:[[.15,'Watch it again'],[2,'He drags'],[3.3,'round the defender'],[4.6,'without it leaving'],[6.8,'The Spanish'],[8.3,"cow's tail"]]},
 {label:'The toe-poke',text:'No big backswing: a quick toe-poke into the corner, before keeper Buyo is set. Barcelona won five-nil!',seconds:8.4,
  cues:[[.15,'No big backswing'],[1.5,'a quick toe-poke'],[2.8,'into the corner'],[3.9,'keeper Buyo'],[5.5,'Barcelona won'],[6.4,'five-nil']]},
 {label:'Your turn',text:'Your turn: in the box, a small feint buys you the space to shoot. Then shoot quickly!',seconds:7.8,
  cues:[[.15,'Your turn'],[1.4,'a small feint'],[2.6,'buys you'],[3.6,'space to shoot'],[5,'Then shoot quickly']]},
];
/** Kokoro timing: null until the lead voices the film. After running kokoro-narrate.py, replace `null` with the import of
 * '../../../public/plays/narration/romario-signature/timing.json' (as the other films do) — nothing else changes. */
import timingJson from '../../../public/plays/narration/romario-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('romario: cue '+w);return c.at;};
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
const lerpAng=(a:number,b:number,u:number)=>{const d=((b-a)%TAU+TAU*1.5)%TAU-Math.PI;return a+d*clamp(u);};

// ---------------------------------------------------------------- the card-window frame + the TV camera (a real pinhole projection)
/** world (0,0) on the CANVAS centre, 1 world unit = 1 sheet unit (× the engine's arrival scale, so passages and seams stay exact) */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** a narrower (square) window gets a slightly wider lens so the action still fits (set by frame()) */
let LENS=1;
/** metres, right-handed, y up. Real Madrid's goal line is x = 0 (posts z = ±3.66, net toward +x), the pitch runs to x = −105, touchlines
 * z = ±34. Barcelona attack +x; the main camera sits in the main stand on the −z side. A figure facing +x has its right side at +z. */
type Cam={eye:V3;F:number;f:V3;r:V3;u:V3;project(p:V3):[number,number,number];scale(p:V3):number};
function lookAt(eye:V3,target:V3,F:number):Cam{const f=nrm(sub(target,eye)),r=nrm(cross(f,[0,1,0])),u=cross(r,f);
 return{eye,F,f,r,u,project:p=>{const d=sub(p,eye),z=Math.max(.05,dot(d,f));return[F*dot(d,r)/z,-F*dot(d,u)/z,z];},scale:p=>F/Math.max(.05,dot(sub(p,eye),f))};}
const NEAR=.35;
const toCam=(c:Cam,P:V3):V3=>{const d=sub(P,c.eye);return[dot(d,c.r),dot(d,c.u),dot(d,c.f)];};
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
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
const view=(s:Sheet):View=>({hx:s.W/(2*.68)+80,hy:s.H/(2*.68)+80});
/** a projected ground ring (metres) as a ribbon */
function groundRing(c:Cam,cx:number,cz:number,rx:number,rz:number,n=36):Pt[]{const pts:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,q=pr(c,[cx+Math.cos(a)*rx,0,cz+Math.sin(a)*rz]);if(q)pts.push(q);}return pts;}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(1,toCam(c,P)[2]);

// ---------------------------------------------------------------- the Camp Nou on a January evening: a steep open bowl, floodlights on the rim, a packed blaugrana crowd
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-150,45,a),1.4+46*b,40+50*b],
 (a,b)=>[12+42*b,1.4+42*b,lerp(-78,84,a)],
 (a,b)=>[lerp(45,-150,a),1.4+30*b,-40-34*b],
 (a,b)=>[-117-42*b,1.4+42*b,lerp(84,-78,a)],
];
const STAND_COLS=[150,90,130,90],STAND_ROWS=[20,17,13,17],TIERS=[[.3,.62],[.33,.66],[.45],[.33,.66]];
const LAMPS:V3[]=[[-110,49,92],[-60,49,92],[-10,49,92],[38,49,92],[56,46,-40],[56,46,40],[-120,46,-40],[-120,46,40],[-100,34,-76],[-20,34,-76],[30,34,-76]];
/** night sky, stand planes with tier fronts, a crowd speckle (paper, blaugrana red and blue, a few yellow), floodlight halos; roar lifts the
 * crowd, flash pops camera flashes */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t),all=rectPath(-1e4,-1e4,2e4,2e4);
 s.tone(K,all,.86);s.tone(B,all,.25);
 const planes=new Path2D(),fronts=new Path2D();
 const own=(si:number)=>si===2&&c.eye[2]<-38;
 STANDS.forEach((S,si)=>{if(own(si))return;addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[si])seg3(c,S(0,b),S(1,b),1.4,fronts);seg3(c,S(0,1),S(1,1),1.1,fronts);});
 s.knockout(planes);s.fill(B,planes,.7);s.tone(K,planes,.5);
 const dots=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],any=[0,0,0,0];
 STANDS.forEach((S,si)=>{if(own(si))return;const cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(q=>Math.abs(b-q)<.03))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.14)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.52/q[2],2.4,12),lift=roar>0?roar*z*(.4+1.1*Math.max(0,Math.sin(tt*12+h*TAU))):0;
   const ink=h<.46?0:h<.72?1:h<.94?2:3;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}});
 if(any[0])s.knockout(dots[0],.75);if(any[1])s.fill(R,dots[1],.95);if(any[2])s.fill(B,dots[2],.95);if(any[3])s.fill(Y,dots[3],.9);
 s.fill(K,fronts,.85);
 const halo=[new Path2D(),new Path2D(),new Path2D()],core=new Path2D();let nl=0;
 for(const L of LAMPS){const q=toCam(c,L);if(q[2]<NEAR+2)continue;const p=scr(c,q),r=clamp(c.F*1.6/q[2],5,60);if(Math.abs(p[0])>v.hx+r*3||Math.abs(p[1])>v.hy+r*3)continue;nl++;
  for(let k=0;k<3;k++){const rr=r*(1+(3-k)*.55);halo[k].addPath(polyPath(blob(p[0],p[1],rr*1.5,rr,Math.round(L[0])+k,{amp:.04,n:14}),true));}
  core.addPath(rectPath(p[0]-r*1.4,p[1]-r*.35,r*2.8,r*.7));}
 if(nl){s.knockout(halo[2],.25);s.tone(Y,halo[0],.3);s.tone(Y,halo[1],.5);s.tone(Y,halo[2],.7);s.knockout(core,.95);s.fill(Y,core,.6);}
 if(flash>0){const p=new Path2D();const fr=Math.floor(tt*12);for(let i=0;i<12;i++){const r1=hash(i*17+fr*101,3),r2=hash(i*29+fr*7,4),si=r1<.55?0:r1<.8?1:3,q=pr(c,STANDS[si](r2,.08+.8*hash(i,fr)));if(!q||hash(i*5+fr,8)>flash)continue;const z=9+12*flash;
  p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.3],[q[0]+z,q[1]],[q[0],q[1]+z*.3]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}
  s.knockout(p);s.fill(Y,p,.6);}
}
/** grass under floodlights (yellow × blue), mowing stripes, boards with paper panels, paper lines */
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-50],[14,0,-50],[14,0,50],[-118,0,50]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-37],[-(k+1)*5.25,0,-37],[-(k+1)*5.25,0,37],[-k*5.25,0,37]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 addPoly(bd,polyP(c,[[8.6,0,-30],[8.6,0,30],[8.6,.95,30],[8.6,.95,-30]]));addPoly(bd,polyP(c,[[-110,0,37.5],[6,0,37.5],[6,.95,37.5],[-110,.95,37.5]]));addPoly(bd,polyP(c,[[-110,0,-37.5],[6,0,-37.5],[6,.95,-37.5],[-110,.95,-37.5]]));
 for(let k=0;k<10;k++){const z=-28+k*6;addPoly(pn,polyP(c,[[8.55,.3,z],[8.55,.3,z+3],[8.55,.65,z+3],[8.55,.65,z]]));}
 for(let k=0;k<18;k++){const x=-106+k*6.2;addPoly(pn,polyP(c,[[x,.3,37.45],[x+3,.3,37.45],[x+3,.65,37.45],[x,.65,37.45]]));addPoly(pn,polyP(c,[[x,.3,-37.45],[x+3,.3,-37.45],[x+3,.65,-37.45],[x,.65,-37.45]]));}
 s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.3);s.knockout(pn,.9);s.tone(Y,pn,.3);
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
 const mesh=new Path2D(),w=.022,S3=(a:V3,b:V3)=>seg3(c,a,b,w,mesh,2.2);
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);S3([0,H,z],[back(z),1.9,z]);S3([back(z),1.9,z],[back(z),0,z]);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++)S3([back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]]);S3([0,y*H/1.9,z0],[back(z0),y,z0]);S3([0,y*H/1.9,z1],[back(z1),y,z1]);}
 for(let j=1;j<4;j++){const u=j/4;S3([2*u,H-.54*u,z0],[2*u,H-.54*u,z1]);}
 s.fill(K,mesh,.75);
 const fr=new Path2D(),fo=new Path2D();for(const[a,b] of [[[0,0,z0],[0,H,z0]],[[0,0,z1],[0,H,z1]],[[0,H,z0-.06],[0,H,z1+.06]]] as [V3,V3][]){seg3(c,a,b,.13,fr);seg3(c,a,b,.2,fo);}
 s.knockout(fo);s.stroke(K,fo,2.2,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the ball + marks
/** paper ball, navy panels, blue shade crescent, navy rim, glint. (x,y) = centre; r in sheet units; smear stretches it along dir */
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
/** a dashed yellow ribbon through projected points (the ball's path, a shot line) */
function dashes(s:Sheet,pts:Pt[],w:number,cov:number,seed:number,n=9){if(pts.length<2||cov<=0)return;const gaps:[number,number][]=[];for(let i=0;i<n;i++)gaps.push([(i+.62)/n,(i+.98)/n]);
 const p=ribbon(pts,w,{seed,taper:.2,wobble:.6,gaps});s.knockout(p,.85*cov);s.fill(Y,p,.95*cov);}
/** a solid ink ribbon with a knocked-out halo (so it reads over grass and bodies) */
function band(s:Sheet,pts:Pt[],w:number,ink:string,cov:number,seed:number,taper=.1){if(pts.length<2||cov<=0)return;s.knockout(ribbon(pts,w*1.7,{seed,taper,wobble:.8}),.8*cov);s.fill(ink,ribbon(pts,w,{seed,taper,wobble:.8}),.95*cov);}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN1:InkFill[]=[[R,.75],[Y,.2]],SKIN2:InkFill[]=[[Y,.32],[R,.2]],SKIN_ROM:InkFill[]=[[R,.8],[K,.2]];
/** Barcelona 1993–94 home: blaugrana stripes (red shirt, blue stripes); navy shorts and blue socks inferred; no numbers printed */
const BAR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:B,shorts:[K,.95],socks:[B,.9],boots:K,skin:SKIN1,hair:K,line:K,trim:[K,.8],hairStyle:'short',seed:70,...o});
/** Real Madrid (inferred): all white, navy trim */
const RMA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN2,hair:K,line:K,trim:[K,.85],hairStyle:'short',seed:40,...o});
const B_ROM:Build={height:1.67,bulk:1.03,thighs:1.12},B_ALK:Build={height:1.85,bulk:1.04},B_GK:Build={height:1.84};
const ROM_ST=BAR({skin:SKIN_ROM,hair:[K,.95],build:B_ROM,seed:11});
const ALK_ST=RMA({build:B_ALK,hair:[K,.9],seed:41});
const BUYO_ST:AthleteStyle={shirt:Y,shorts:[K,.9],socks:Y,boots:K,skin:SKIN2,hair:[K,.85],line:K,gloves:'paper',trim:K,sleeves:'long',hairStyle:'short',build:B_GK,seed:1};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN2,hair:[K,.7],hairStyle:'balding',line:K,seed:33};

// ---------------------------------------------------------------- the play: keyframed tracks (τ = seconds after Romário's first touch)
/** TPASS: Guardiola's pass · 0: the inside of Romário's right boot meets it (the drag begins) · TREL: the drag ends, he faces goal ·
 * TP: the toe-poke · TG: the ball crosses the line */
const TPASS=-1.9,TREL=.5,TP=.95,TG=TP+.7;
type Role='rom'|'alk'|'pep'|'gk'|'run'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
/** positions [τ, x, z], Hermite-interpolated. All inferred from the written accounts (see header). */
const ACTORS:Actor[]=[
 {name:'Romário',role:'rom',hero:true,style:ROM_ST,keys:[[-12,-21.5,4.6],[-8,-20.4,3.4],[-5,-19,2.4],[-2.5,-18.1,1.9],[-.6,-17.75,1.65],[0,-17.6,1.55],[.25,-17.45,1.25],[TREL,-17.2,1],[TP,-16.75,.85],[1.3,-16.1,.7],[1.8,-15.2,1],[3,-13.6,3.8],[5,-11,9],[8,-8,15],[12,-6,19]]},
 {name:'Rafael Alkorta',role:'alk',style:ALK_ST,keys:[[-12,-19.8,5.2],[-8,-19.2,4.1],[-5,-18.1,3],[-2.5,-17.3,2.4],[-.6,-16.95,2.25],[0,-16.85,2.2],[.35,-16.85,2.65],[.8,-16.9,2.35],[1.3,-16.3,1.6],[2,-15.3,1],[4,-14.6,.6],[12,-14.4,.5]]},
 {name:'Pep Guardiola',role:'pep',style:BAR({skin:SKIN2,build:{height:1.8,bulk:.9},seed:4}),keys:[[-12,-68,-1],[-6,-52,-2.4],[-2.6,-39.6,-3.4],[TPASS,-38,-3.6],[-1.3,-37.3,-3.5],[2,-34,-2],[12,-31,0]]},
 {name:'Paco Buyo',role:'gk',style:BUYO_ST,keys:[[-12,-2,.8],[-3,-2.4,1],[0,-2.7,.9],[.7,-3.1,.6],[1,-3.2,.5],[12,-3.2,.5]]},
 {name:'Madrid centre-back',role:'run',style:RMA({build:{height:1.86},seed:42}),keys:[[-12,-15.5,-6.5],[-4,-14.6,-6],[0,-14,-5.6],[1.4,-13.2,-4.4],[4,-12.4,-3.4],[12,-12,-3]]},
 {name:'Madrid left-back',role:'run',style:RMA({seed:43}),keys:[[-12,-20,-13],[-4,-18,-10.5],[0,-17,-9.5],[3,-15,-8],[12,-14,-8]]},
 {name:'Madrid right-back',role:'run',style:RMA({seed:44,hair:[K,.6]}),keys:[[-12,-21,13],[-4,-19,11.5],[0,-18.4,10.6],[3,-16.5,9],[12,-16,8.5]]},
 {name:'Madrid midfielder',role:'run',style:RMA({seed:45}),keys:[[-12,-33,-5],[-4,-28,-5.4],[0,-25.5,-5],[4,-22,-4],[12,-21,-4]]},
 {name:'Madrid midfielder 2',role:'run',style:RMA({seed:46,hairStyle:'curly'}),keys:[[-12,-33,7],[-4,-28.5,5.6],[0,-26.4,4.8],[4,-23,3.6],[12,-22,3.4]]},
 {name:'Madrid midfielder 3',role:'run',style:RMA({seed:47}),keys:[[-12,-50,4],[-4,-38,1.5],[0,-34,1],[4,-30,.5],[12,-28,0]]},
 {name:'Barcelona forward',role:'run',style:BAR({seed:71}),keys:[[-12,-26,11],[-4,-18,9.5],[0,-14.8,8.4],[1.6,-13.2,6.8],[4,-12,6],[8,-9.5,13],[12,-7.5,17]]},
 {name:'Barcelona midfielder',role:'run',style:BAR({seed:72,skin:SKIN2}),keys:[[-12,-44,-12],[-4,-32,-10.5],[0,-27,-9.4],[4,-22,-8],[12,-18,-9]]},
 {name:'Barcelona midfielder 2',role:'run',style:BAR({seed:73,hairStyle:'curly'}),keys:[[-12,-46,9],[-4,-33,8],[0,-29,7],[4,-24,5.5],[12,-20,2]]},
 {name:'referee',role:'ref',style:REF_ST,keys:[[-12,-50,13],[-4,-34,11],[0,-30,10],[4,-26,8],[12,-22,6]]},
];
const ROM=0,ALK=1,PEP=2,GK=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const T0=-13,T1=13,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
/** yaw that faces the direction (dx,dz): athlete.ts faces +x at yaw 0 and yaw turns left, so facing = (cos y, −sin y) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);

// ---------------------------------------------------------------- the cow's tail: key poses on the athlete skeleton (u = τ)
/** Back to goal, facing the pass (yaw π). The inside of the right boot meets the ball (u 0) and, instead of stopping it, sweeps it out and
 * round his right side while he pivots on the planted left foot (place yaw π → 0 over 0 … TREL, turning to his right); the right leg swings
 * out wide and back, the arms go out for balance, the eyes follow the ball; at TREL he faces goal with the ball in front of him. */
const DRAG:[number,Pose][]=[
 [-.45,posed({lHipF:22,rHipF:20,lKnee:40,rKnee:38,lHipA:10,rHipA:10,lean:18,pitch:4,lShA:40,rShA:36,lElb:48,rElb:46,neckP:30,squash:-.03})],
 [-.18,posed({lHipF:24,lKnee:44,lAnk:-4,rHipF:28,rKnee:44,rHipR:36,rAnk:-8,rHipA:4,lean:20,pitch:4,twist:-6,lShA:50,rShA:44,lElb:44,rElb:42,neckP:36})],
 [0,posed({lHipF:22,lKnee:48,lAnk:-6,lHipA:6,rHipF:36,rKnee:28,rHipR:44,rAnk:-6,rHipA:-6,lean:22,pitch:5,twist:-14,lShA:62,rShA:54,lElb:38,rElb:40,neckP:40,squash:-.04})],
 [.22,posed({lHipF:18,lKnee:50,lAnk:-4,lHipA:8,rHipF:34,rKnee:30,rHipR:40,rAnk:-4,rHipA:34,lean:18,pitch:4,bend:-10,twist:-24,lShA:78,rShA:48,lShF:10,rShF:-10,lElb:32,rElb:40,neckP:34,neckY:-34})],
 [.4,posed({lHipF:16,lKnee:48,lAnk:0,lHipA:6,rHipF:30,rKnee:36,rHipR:34,rAnk:0,rHipA:22,lean:16,pitch:4,bend:-6,twist:-14,lShA:66,rShA:50,lShF:16,rShF:-14,lElb:34,rElb:40,neckP:30,neckY:-16})],
 [TREL+.08,posed({lHipF:-10,lKnee:34,lAnk:30,rHipF:30,rKnee:52,rHipA:6,rAnk:-4,lean:16,pitch:6,twist:6,lShA:40,rShA:36,lShF:20,rShF:-24,lElb:70,rElb:70,neckP:24})],
];
/** the toe-poke: the short strike (little back-lift) with the toes leading — ankle held square instead of pointed at contact */
const TP_D=.55,TP_ST=TP-STRIKE_CONTACT*TP_D;
function toePoke(u:number):Pose{const p=strike(clamp(u),{foot:'r',power:.28});const w=Math.max(0,1-Math.abs(u-STRIKE_CONTACT)/.2);if(w>0)p.rAnk=lerp(p.rAnk,-4*Math.PI/180,w);return p;}
/** Romário's place yaw: facing the pass → the 180° pivot to his right (yaw decreasing through facing −z) → facing the shot → the run */
const R_FACE=Math.PI,SHOT_YAW=(()=>{const[x,z]=posOf(ROM,TP);return yawTo(0-x,-2.9-z);})();
function romYaw(tau:number):number{
 if(tau<0){const p=posOf(ROM,tau),g=posOf(PEP,TPASS);const toPass=yawTo(g[0]-p[0],g[1]-p[1]);return lerpAng(toPass,R_FACE,sm(-1.2,-.3,tau));}
 if(tau<TREL+.12)return R_FACE-(R_FACE-SHOT_YAW)*easeInOutSine(clamp((tau-.04)/(TREL+.08)));
 if(tau<1.5)return SHOT_YAW;
 const v=velOf(ROM,tau);return lerpAng(SHOT_YAW,yawTo(v[0],v[1]),sm(1.5,2.2,tau));
}

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/8),ph=distOf(k,tau)/(2.4+2.2*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:18,rShA:16,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
type State={pose:Pose;place:Place};
/** Alkorta: pressed tight on his back, arms up, reading the turn the wrong way (a lean to his left), then a turn to chase */
const MARK=posed({lHipF:30,rHipF:26,lKnee:44,rKnee:40,lHipA:12,rHipA:12,lean:18,pitch:4,lShA:34,rShA:30,lShF:30,rShF:24,lElb:60,rElb:56,neckP:20});
function romPose(tau:number):Pose{
 let p=loco(ROM,tau);
 if(tau<-.45)p=blendPose(p,DRAG[0][1],sm(-1.4,-.6,tau));
 else if(tau<TP_ST+.06)p=keyPoses(tau,DRAG);
 const u=(tau-TP_ST)/TP_D;
 if(u>0&&u<1.6)p=blendPose(p,toePoke(Math.min(1,u)),sm(0,.12,u)*(1-sm(1.05,1.6,u)));
 if(tau>TG+.1)p=blendPose(p,celebrate(distOf(ROM,tau)/4,{kind:'run'}),sm(TG+.1,TG+.7,tau));
 return p;
}
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);
 if(a.role==='rom')return{pose:romPose(tau),place:{x,z,yaw:romYaw(tau)}};
 let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'alk':{const r=posOf(ROM,tau);
   if(tau<1){pose=blendPose(pose,MARK,1-sm(.9,1.4,tau));yaw=yawTo(r[0]-x,r[1]-z);}
   // the wrong-way lean as the ball goes round the other side: a lunge to his left (+z)
   const w=sm(-.05,.15,tau)*(1-sm(.6,1,tau));if(w>0)pose=blendPose(pose,lunge(clamp(.35+tau*.9),{side:'l'}),w);
   if(tau>.8)yaw=lerpAng(yawTo(r[0]-x,r[1]-z),faceYaw(k,tau),sm(.8,1.3,tau));
   break;}
  case 'pep':{const pd=ballAt(0),g=posOf(PEP,TPASS),dirY=yawTo(pd[0]-g[0],pd[2]-g[1]);
   const w=sm(TPASS-.55,TPASS-.35,tau)*(1-sm(TPASS+.35,TPASS+.8,tau));if(w>0)pose=blendPose(pose,strike(clamp((tau-(TPASS-STRIKE_CONTACT*.9))/.9),{foot:'r',power:.45}),w);
   yaw=lerpAng(yaw,dirY,sm(TPASS-1.2,TPASS-.6,tau)*(1-sm(TPASS+.8,TPASS+1.6,tau)));break;}
  case 'gk':{const td=1.2,du=.8,r=posOf(ROM,tau);
   if(tau<td)pose=keeperSet(tau*1.4);else pose=keeperDive(clamp((tau-td)/du),{side:'r',height:.08});
   yaw=tau<td?yawTo(r[0]-x,r[1]-z):lerpAng(yawTo(r[0]-x,r[1]-z),Math.PI,sm(td,td+.2,tau));break;}
  default:break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ball: Guardiola's dribble → the pass → on the inside of the right boot (the drag) → the roll → the toe-poke → the corner
const BALL_R=.11;
/** the cow's tail: the ball swept on an arc round Romário's right side (world angle π → 2π − the shot heading: from in front of him, facing
 * the pass, through his right, to in front of him facing goal), a little ahead of his body turn so the inside of the right boot sweeps it */
const ARC_END=TAU-SHOT_YAW;
function onBoot(tau:number):V3{const u=clamp(tau/TREL),e=easeInOutSine(u),phi=lerp(Math.PI,ARC_END,e),r=.44+.16*Math.sin(Math.PI*u),[x,z]=posOf(ROM,tau);
 return[x+Math.cos(phi)*r,BALL_R,z+Math.sin(phi)*r];}
/** the toe of the right boot at the toe-poke, and the ball just ahead of it */
const PT:V3=(()=>{const st=stateOf(ROM,TP),sk=solve(st.pose,B_ROM,st.place),f:V3=[Math.cos(SHOT_YAW),0,-Math.sin(SHOT_YAW)];return add([sk.rToe[0],BALL_R,sk.rToe[2]],mul(f,BALL_R+.03));})();
const ATT0:V3=onBoot(0),ATTR:V3=onBoot(TREL);
/** where it crosses the line: low, just inside the post to Buyo's right (−z) */
const PG:V3=[0,.3,-2.95],NETP:V3=[1.5,.28,-3.1],REST:V3=[1.75,BALL_R,-2.9];
const P0:V3=(()=>{const g=posOf(PEP,TPASS),d=sub(ATT0,[g[0],0,g[1]]),l=Math.hypot(d[0],d[2]);return[g[0]+d[0]/l*.45,BALL_R,g[1]+d[2]/l*.45];})();
function ballAt(tau:number):V3{
 if(tau<TPASS){// Guardiola brings it out of midfield: a touch every ~2 m
  const dr=(tt:number):V3=>{const p=posOf(PEP,tt),v=velOf(PEP,tt),l=Math.hypot(v[0],v[1])||1,f=((distOf(PEP,tt)/2)%1+1)%1,d=.42+.4*(f<.2?f/.2:1-(f-.2)/.8);return[p[0]+v[0]/l*d,BALL_R,p[1]+v[1]/l*d];};
  if(tau<TPASS-.4)return dr(tau);return mix3(dr(TPASS-.4),P0,easeOut((tau-TPASS+.4)/.4));}
 if(tau<0){const u=(tau-TPASS)/-TPASS;return mix3(P0,ATT0,1-Math.pow(1-u,1.35));}
 if(tau<TREL)return onBoot(tau);
 if(tau<TP){const u=(tau-TREL)/(TP-TREL);return mix3(ATTR,PT,1-(1-u)*(1-u)*.6-.4*(1-u));}
 if(tau<TG){const u=(tau-TP)/(TG-TP),p=mix3(PT,PG,u);p[1]=lerp(BALL_R,PG[1],u)+.22*Math.sin(Math.PI*u);return p;}
 if(tau<TG+.22)return mix3(PG,NETP,easeOut((tau-TG)/.22));
 const u=clamp((tau-TG-.22)/.45);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u*u),lerp(NETP[2],REST[2],u)];
}
const velAt=(tau:number):V3=>{if(tau>=TG+.5)return[0,0,0];const a=ballAt(tau-.01),b=ballAt(tau+.01);return mul(sub(b,a),50);};
const ballSpin=(tau:number)=>tau<TPASS?distOf(PEP,tau)/BALL_R:tau<TP?(tau-TPASS)*14:(TP-TPASS)*14+(Math.min(tau,TG)-TP)*40;
const bulgeAt=(tau:number)=>tau<TG+.05?0:Math.exp(-(tau-TG-.05)*2.4)*(1+.3*Math.sin((tau-TG)*14));
/** the drag's swept path on the grass (ball positions through the cow's tail) */
const DRAG_PATH:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=20;i++)o.push(ballAt(TREL*i/20));return o;})();

// ---------------------------------------------------------------- THE ADAPTER: every body in this film goes through here
/** drawPlayer(sheet, pose, camera, style, place, motion): one call per figure → the shared fluid-body library (lib/plays/riso/athlete.ts).
 * `prev` (the pose one drawn frame earlier) turns on secondary motion (hair, shirt hem) and, with `smear`, a halftone motion trail. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:State;smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,camera,style,place,{prevPlace:o.prev.place,threshold:9});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ---------------------------------------------------------------- the pitch through a camera: shadows, bodies, the ball, the goal, in depth order
type PlayOpts={dtau?:number;smear?:boolean;goalLast?:boolean;glue?:number;spark?:number};
type PlayOut={ball:Pt|null;br:number;rom?:DrawResult;alk?:DrawResult};
function play(s:Sheet,c:Cam,v:View,tau:number,o:PlayOpts={}):PlayOut{
 const{dtau=0,smear=false,goalLast=false,glue=0,spark=0}=o;
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(4,c.F*BALL_R/bq[2]):0;
 const gq=pr(c,[b[0],0,b[2]]);if(gq&&b[0]<.1){const k=kAt(c,[b[0],0,b[2]]),r=clamp(.16*k,2,300);s.tone(K,polyPath(blob(gq[0],gq[1],r,r*.3,2,{amp:.05,n:12}),true),.45);}
 type Item={d:number;draw:()=>void};const items:Item[]=[];const out:PlayOut={ball:bg,br};const m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;const passing=!!s._passage.pending;
 ACTORS.forEach((a,k)=>{const[x0,z0]=posOf(k,tau),q=toCam(c,[x0,1,z0]);if(q[2]<NEAR+.5)return;const p=scr(c,q),h=c.F*1.9/q[2];
  if(Math.abs(p[0])>v.hx+h||Math.abs(p[1])>v.hy+h)return;
  const st=stateOf(k,tau),keyA=a.hero||k===ALK||k===GK;
  const prev=dtau>0&&keyA?stateOf(k,tau-dtau):undefined;
  // passages print simply; small figures and extras in wide shots print at 'low'
  const style=passing?{...a.style,detail:a.hero?'mid' as const:'low' as const}:!keyA&&h*ppu<150?{...a.style,detail:'low' as const}:h*ppu<60?{...a.style,detail:'low' as const}:a.style;
  items.push({d:q[2],draw:()=>{const r=drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&keyA});if(a.hero)out.rom=r;if(k===ALK)out.alk=r;}});});
 const inNet=b[0]>.05;
 const drawBall=()=>{if(!bg)return;const V=velAt(tau),sp=Math.hypot(V[0],V[1],V[2]),nb=pr(c,sub(b,mul(V,.03)));
  const dir=nb?Math.atan2(bg[1]-nb[1],bg[0]-nb[0]):0,smr=nb&&sp>6?Math.min(br*3,Math.hypot(bg[0]-nb[0],bg[1]-nb[1])*1.4):0;ball(s,bg[0],bg[1],br,ballSpin(tau),smr,dir);
  if(spark>0&&spark<1)sparkBurst(s,Y,bg[0],bg[1],br*4.2,{n:9,seed:17,g:easeOutBack(clamp(spark*2))*(1-clamp((spark-.5)*2)),width:br*.5});};
 const goal=()=>goal3(s,c,bulgeAt(tau),b[2]);
 if(!goalLast){if(inNet)drawBall();goal();}
 if(!inNet||goalLast)items.push({d:bq[2],draw:drawBall});
 items.sort((p,q)=>q.d-p.d);for(const it of items)it.draw();
 if(goalLast)goal();
 // "without it leaving his foot": a yellow thread from the right boot to the ball
 if(glue>0&&out.rom&&bg){const toe=out.rom.joints.rToe,an=out.rom.joints.rAn,f:Pt=[(toe[0]+an[0])/2,(toe[1]+an[1])/2],mid:Pt=[(f[0]+bg[0])/2,(f[1]+bg[1])/2+br*.4*(1-glue)];
  s.knockout(ribbon([f,mid,bg],br*.5,{seed:81,taper:0,wobble:.6}),.8*glue);s.fill(Y,ribbon([f,mid,bg],br*.28,{seed:81,taper:0,wobble:.6}),.95*glue);}
 return out;
}
/** a broadcast replay wipe: long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<14;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L,y],[x0+L,y]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** the cow's tail: the swept path of the ball printed as a tapering swish with a tufted end (grows with w; tuft appears last) */
function tail(s:Sheet,c:Cam,w:number,seed:number,dash=false){if(w<=0)return;
 const pts:Pt[]=[];for(const P of DRAG_PATH){const q=pr(c,[P[0],.02,P[2]]);if(q)pts.push(q);}if(pts.length<4)return;
 const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=clamp(kAt(c,DRAG_PATH[10])*.09,5,26);
 if(dash){dashes(s,seg,wd*.8,1,seed,8);return;}
 s.knockout(ribbon(seg,wd*1.8,{seed,taper:.7,wobble:.8}),.85);s.fill(Y,ribbon(seg,wd,{seed,taper:.7,wobble:.8}),.95);
 const tu=clamp((w-.8)/.2);if(tu>0){const e=seg[seg.length-1],d=seg[seg.length-2],ang=Math.atan2(e[1]-d[1],e[0]-d[0]),tf=new Path2D();
  for(let i=-2;i<=2;i++){const a=ang+i*.28,L=wd*(2.6+.6*Math.cos(i))*tu;tf.addPath(ribbon([e,[e[0]+Math.cos(a)*L*.5,e[1]+Math.sin(a)*L*.5+i*1.5],[e[0]+Math.cos(a)*L,e[1]+Math.sin(a)*L]],wd*.35,{seed:seed+i+3,taper:.9,wobble:.5}));}
  s.knockout(tf,.85);s.fill(Y,tf,.95);s.fill(R,tf,.35);}
}

// ---------------------------------------------------------------- 1 · LIVE: the high main-stand camera, near real time
/** τ from chapter time: real time up to the pass, then keyed to the words (the swish on "one swish", the toe-poke, the ball in on "goal") */
function tau1(t:number){const tp=CUEW(0,'Guardiola passes')+.35,ts=CUEW(0,'one swish')+.15,tk=CUEW(0,'a toe-poke')+.25,tg=CUEW(0,'goal')+.1;
 return key(t,mono([[0,TPASS-tp],[tp,TPASS],[ts,0],[tk,TP],[tg,TG],[SECS(0)+1,TG+SECS(0)+1-tg]]),linear);}
const E1:V3=[-40,24,-70];
function cam1(t:number):Cam{
 const tau=tau1(t),tRom=CUEW(0,'Romário'),tPass=CUEW(0,'Guardiola'),tG=CUEW(0,'goal'),S=SECS(0);
 const bs=(u:number):V3=>{const q=ballAt(u);return[q[0],0,q[2]];},bt=mul(add(add(bs(tau),bs(tau-.3)),bs(tau-.6)),1/3);
 const r=posOf(ROM,tau),R3:V3=[r[0],0,r[1]],mid:V3=mix3(bt,R3,.45);
 const w1=sm(tRom-.8,tRom+.8,t,easeInOutSine)*(1-sm(tPass-.6,tPass+.6,t,easeInOutSine)),w2=sm(tPass-.6,tPass+.8,t,easeInOutSine),w3=sm(tG+.3,tG+1.8,t,easeInOutSine);
 const T=mix3(mix3(mix3(bt,mix3(R3,bt,.25),w1),mix3(mid,[-10,0,.5],.3*sm(0,1,tau)),w2),mix3(R3,[-6,0,-4],.4),w3);T[1]=1.2;
 const F=key(t,[[0,3600],[CUEW(0,'Barcelona'),4000],[tRom,5600],[CUEW(0,'a defender'),6400],[tPass,5000],[CUEW(0,'one swish'),6600],[tG,6400],[S,6000]],easeInOutSine)*LENS;
 return lookAt(E1,T,F);
}
const ch1:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam1(t),tau=tau1(twos(t)),tG=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(tG-.1,tG+.6,t),flash:sm(tG,tG+.4,t)});
  ground(s,c);play(s,c,v,tau);},
 aperture(t){const c=cam1(t),[x,z]=posOf(ROM,tau1(twos(t))),q=toCam(c,[x,1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*.35/q[2]),12);},
 still:9.8,
};

// ---------------------------------------------------------------- 2 · REPLAY: slow motion, a low pitch-side camera beside the two players
function tau2(t:number){return key(t,mono([[0,-1.05],[CUEW(1,'He drags'),-.05],[CUEW(1,'round the'),.2],[CUEW(1,'without'),.38],[CUEW(1,'The Spanish'),TREL+.04],[CUEW(1,"cow's"),TREL+.3],[SECS(1),TREL+.55]]),linear);}
const R_AT0=posOf(ROM,0),E2:V3=[R_AT0[0]+.6,1.05,R_AT0[1]-7.6];
function cam2(t:number):Cam{
 const tau=tau2(t),[x,z]=posOf(ROM,tau),S=SECS(1),tD=CUEW(1,'He drags'),tS=CUEW(1,'The Spanish');
 const b=ballAt(tau),T=mix3(mix3([x,.95,z],[b[0],.35,b[2]],.35*sm(tD-.4,tD+.3,t)),[x+.6,.8,z-.3],sm(tS-.3,S,t,easeInOutSine));
 const F=key(t,[[0,3000],[tD,3900],[CUEW(1,'without'),4300],[tS,3700],[S,3300]],easeInOutSine)*LENS;
 return lookAt(add(E2,[0,.15*sm(tS,S,t),-.8*sm(tS,S,t)]),T,F);
}
const ch2:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam2(t),tp=twos(t),tau=tau2(tp),dtau=Math.max(.004,tau-tau2(tp-1/12));
  const tD=CUEW(1,'He drags'),tR=CUEW(1,'round the'),tW=CUEW(1,'without'),tS=CUEW(1,'The Spanish'),tC=CUEW(1,"cow's"),S=SECS(1);
  stadium(s,c,v,t);ground(s,c);
  // "He drags": the ball's swept path appears on the grass as the drag happens (dashed), then "cow's tail" prints it as a swish with a tuft
  const dash=sm(tD-.2,tD+.2,t)*(1-sm(tS-.3,tS,t));if(dash>0)tail(s,c,clamp(tau/TREL),29,true);
  const sw=sm(tC-.35,tC+.6,t,easeOut)*(1-sm(S-.6,S-.2,t));if(sw>0)tail(s,c,sw*1.05,31);
  // "round the defender": an orange ring on the grass round Alkorta — the ball goes round him, on the other side
  const rr=sm(tR-.15,tR+.35,t,easeOutBack)*(1-sm(tW+.4,tS,t));
  if(rr>0){const[ax,az]=posOf(ALK,tau),pts=groundRing(c,ax,az,.75*rr,.6*rr);if(pts.length>28){const w=clamp(kAt(c,[ax,0,az])*.07,4,20);s.knockout(ribbon(pts,w*1.7,{close:true,seed:37,taper:0,wobble:1}),.85*rr);s.fill(R,ribbon(pts,w,{close:true,seed:37,taper:0,wobble:1}),.95*rr);}}
  play(s,c,v,tau,{dtau,smear:true,glue:sm(tW-.2,tW+.3,t)*(1-sm(tS-.1,tS+.3,t))});
  streaks(s,v,1-sm(0,.45,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(22,c.F*BALL_R/q[2]*1.4),12);},
 still:7,
};

// ---------------------------------------------------------------- 3 · REPLAY behind the goal: the short toe-poke, Buyo's late dive, the corner, then the run and the crowd
function tau3(t:number){return key(t,mono([[0,TREL-.15],[CUEW(2,'a quick'),TP-.12],[CUEW(2,'a quick')+.7,TP+.08],[CUEW(2,'into the'),TP+.4],[CUEW(2,'keeper Buyo'),TG-.05],[CUEW(2,'Barcelona won'),TG+1],[SECS(2),TG+3.6]]),linear);}
const E3:V3=[6.4,1.9,-1.4];
function cam3(t:number):Cam{
 const tau=tau3(t),tW=CUEW(2,'Barcelona won'),S=SECS(2),pan=sm(tW-.8,tW+1.2,t,easeInOutSine);
 const[rx,rz]=posOf(ROM,Math.min(tau,TP)),toShot:V3=mix3([rx,.9,rz],[rx+4,.7,(rz-2.9)/2],.4*sm(CUEW(2,'into')-.3,CUEW(2,'keeper'),t));
 const[cx,cz]=posOf(ROM,tau),T=mix3(toShot,[cx,1.3,cz],pan),F=key(t,[[0,4600],[CUEW(2,'a quick'),5200],[CUEW(2,'into'),4200],[tW,3600],[S,3400]],easeInOutSine)*LENS;
 return lookAt(add(E3,[-1.5*pan,.6*pan,7*pan]),T,F);
}
const ch3:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam3(t),tp=twos(t),tau=tau3(tp),tQ=CUEW(2,'a quick'),tI=CUEW(2,'into the'),tW=CUEW(2,'Barcelona won'),tF=CUEW(2,'five-nil');
  stadium(s,c,v,t,{roar:.8*sm(tW-.4,tW+.3,t),flash:sm(tW-.2,tW+.3,t)*(1-sm(tF+1,SECS(2),t))});
  ground(s,c);
  // "into the corner": the shot line printed ahead of the ball, toe to corner
  const sl=sm(tI-.3,tI+.2,t)*(1-sm(tW-.3,tW+.3,t));
  if(sl>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const q=pr(c,ballAt(TP+(TG-TP)*i/16));if(q)pts.push(q);}dashes(s,pts,7,sl,47,10);}
  const r=play(s,c,v,tau,{dtau:Math.max(.004,tau-tau3(tp-1/12)),smear:true,goalLast:true,spark:(tau-TP)/.3});
  // "No big backswing": a short yellow arc over the kicking boot, the tiny back-lift of the toe-poke
  const bw=sm(.1,.5,t)*(1-sm(tQ+.6,tQ+1.1,t));
  if(bw>0&&r.rom){const k=r.rom.joints.rKn,f=r.rom.joints.rToe,L=Math.hypot(f[0]-k[0],f[1]-k[1]),a0=Math.atan2(f[1]-k[1],f[0]-k[0]),pts:Pt[]=[];for(let i=0;i<=10;i++){const a=a0+(i/10-.5)*.7;pts.push([k[0]+Math.cos(a)*L*1.2,k[1]+Math.sin(a)*L*1.2]);}
   band(s,pts,Math.max(4,L*.08),Y,bw,53,.4);}
  const hn=(tau-TG)/.7;if(hn>0&&hn<1&&r.ball)sparkBurst(s,Y,r.ball[0],r.ball[1],Math.max(60,r.br*5),{n:10,seed:29,g:easeOutBack(clamp(hn*3))*(1-clamp((hn-.6)/.4)),width:Math.max(8,r.br*.6)});
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(ROM,tau3(twos(t))),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.2/q[2]),12);},
 still:4.8,
};

// ---------------------------------------------------------------- 4 · THE LESSON: a low front camera on the same beat (the feint, the space it buys, the quick shot)
function tau4(t:number){return key(t,mono([[0,-.5],[CUEW(3,'a small'),-.05],[CUEW(3,'buys'),TREL-.05],[CUEW(3,'space'),TREL+.2],[CUEW(3,'Then shoot'),TP-.15],[CUEW(3,'Then shoot')+.9,TP+.3],[SECS(3),TP+.75]]),linear);}
function cam4(t:number):Cam{
 const tau=tau4(t),[x,z]=posOf(ROM,Math.min(tau,TP)),tS=CUEW(3,'Then shoot'),S=SECS(3),out=sm(tS-.3,S,t,easeInOutSine);
 const T:V3=mix3([x+.8,.75,z-.2],[x+7,.9,z-1.8],.5*out),F=key(t,[[0,2600],[CUEW(3,'a small'),3000],[CUEW(3,'space'),2700],[tS,2400],[S,2200]],easeInOutSine)*LENS;
 return lookAt([-23.5+1*out,1.7+.3*out,-5.6],T,F);
}
const ch4:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam4(t),tp=twos(t),tau=tau4(tp);
  const tY=CUEW(3,'Your'),tF=CUEW(3,'a small'),tB=CUEW(3,'buys'),tSp=CUEW(3,'space'),tS=CUEW(3,'Then shoot'),S=SECS(3);
  stadium(s,c,v,t);ground(s,c);
  // "a small feint": the cow's tail printed as an orange arrow along the ball's swept path
  const fe=sm(tF-.2,tF+.5,t,easeOut)*(1-sm(S-.8,S-.4,t));
  if(fe>0){const pts:Pt[]=[];for(const P of DRAG_PATH){const q=pr(c,[P[0],.02,P[2]]);if(q)pts.push(q);}const n=Math.max(2,Math.round(pts.length*fe)),seg=pts.slice(0,n),w=clamp(kAt(c,DRAG_PATH[10])*.09,5,24);
   if(seg.length>2){band(s,seg,w,R,1,61);const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],w,{seed:62,head:w*3});}}
  // "space to shoot": a yellow pool of grass opening in front of him, between him and the goal
  const sp=sm(tSp-.2,tSp+.4,t,easeOutBack)*(1-sm(S-.8,S-.3,t));
  if(sp>0){const[x,z]=posOf(ROM,TREL),cx=x+1.6,cz=z-.5,pts=groundRing(c,cx,cz,1.5*sp,1.2*sp,40);if(pts.length>30){const pp=polyPath(pts,true);s.knockout(pp,.6*sp);s.tone(Y,pp,.8*sp);s.fill(K,ribbon(pts,3,{close:true,seed:64,wobble:.8}),.7*sp);}}
  // "Then shoot quickly": the shot line to the corner
  const sl=sm(tS-.1,tS+.4,t)*(1-sm(S-.5,S-.1,t));
  if(sl>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const q=pr(c,ballAt(TP+(TG-TP)*i/16));if(q)pts.push(q);}dashes(s,pts,7,sl,67,10);}
  const r=play(s,c,v,tau,{dtau:Math.max(.004,tau-tau4(tp-1/12)),smear:true,spark:(tau-TP)/.3});
  // "buys you": the gap between Romário and the defender, a yellow bracket stretching open
  const gb=sm(tB-.15,tB+.4,t,easeOut)*(1-sm(tS-.2,tS+.2,t));
  if(gb>0&&r.rom&&r.alk){const a=r.rom.joints.chest,b=r.alk.joints.chest,m:Pt=[(a[0]+b[0])/2,(a[1]+b[1])/2],pa:Pt=[lerp(m[0],a[0],gb),lerp(m[1],a[1],gb)],pb:Pt=[lerp(m[0],b[0],gb),lerp(m[1],b[1],gb)],w=Math.max(5,r.rom.heightPx*.03);
   band(s,[pa,pb],w,Y,1,65,0);for(const e of[pa,pb])band(s,[[e[0],e[1]-w*3],[e[0],e[1]+w*3]],w,Y,1,66,0);}
  // "Your turn": a small spark on the ball as the lesson opens
  if(t>tY-.1&&t<tY+1&&r.ball)sparkBurst(s,Y,r.ball[0],r.ball[1],r.br*3.6,{n:8,seed:3,g:easeOutBack(sm(tY-.1,tY+.3,t))*(1-sm(tY+.6,tY+1,t)),width:r.br*.4});
 },
 still:5.2,
};

// ---------------------------------------------------------------- touch: a turf kick (grass bits + paper flecks) and a yellow spark
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size;(i%3?a:b).addPath(polyPath([[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]],true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}

const film:RisoStory={
 id:'romario-signature',format:'11v11',title:"Romário's cow's tail and toe-poke",theme:'A small feint in the box buys you the space to shoot — then shoot quickly',
 ageNote:'La Liga, Barcelona 5–0 Real Madrid, Camp Nou, 8 January 1994 (the opening goal). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
export default film;
