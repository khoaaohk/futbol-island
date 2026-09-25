/** Lindsey Heaps (née Horan; USA captain) — signature: "the midfield strike from the edge" (lib/town/iconicPlays.json: kind "signature",
 * template long_range_goal, centre, edge, right foot; lesson "Keep your head over the ball and strike through the middle of it."). An
 * iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer.
 *
 * WHY THIS MATCH, AND THE HONEST FALLBACK: the two moments suggested for her both turned out to be HEADERS, not strikes from the edge — her
 * winner in the 2024 CONCACAF W Gold Cup final (the Guardian/AP: "Horan scored with a header in first-half stoppage time ... off a
 * well-placed cross from Emily Fox") and, from memory only, her 2023 World Cup equaliser v the Netherlands (not re-checked; not used). No
 * written source I could read (research budget: ~8 polite fetches) describes ONE logged Heaps goal struck from the edge of the box. So, per
 * the brief's fallback (as in the approved Falcão film), the film OPENS on a REAL, sourced Heaps moment — she arrives from midfield and
 * heads the only goal of the 2024 Gold Cup final, USA 1–0 Brazil, Snapdragon Stadium, San Diego, Sunday 10 March 2024, 45+1' — and then says
 * plainly "Here's how she does it" and shows the edge-of-the-box strike as a DEMONSTRATION (empty stands, a neutral grey keeper, an unnumbered
 * team-mate) that is never passed off as that match or any other.
 *
 * SOURCES (fetched 23 Sep 2026 with curl and a generic UA, cached in the film scratchpad src-cache/):
 *  - The Guardian (AP), "Horan's header secures inaugural W Gold Cup title for USWNT over Brazil", 10 Mar 2024: "Lindsey Horan scored with a
 *    header in first-half stoppage time and the United States beat Brazil 1-0"; "Horan scored just moments into stoppage time with a header
 *    off a well-placed cross from Emily Fox"; sellout 31,528 at Snapdragon Stadium; her earlier goals of the tournament were penalties.
 *    https://www.theguardian.com/football/2024/mar/10/uswnt-usa-brazil-soccer-w-gold-cup-final-lindsey-horan-report  (cache: guardian-usa-bra-2024-goldcup.*)
 *  - Wikipedia, "2024 CONCACAF W Gold Cup final" (raw): 10 March 2024, 17:15 local (20:15 ET), Snapdragon Stadium, 1–0, Horan 45+1',
 *    referee Melissa Borjas, 31,528; line-ups and numbers — USA: Naeher 1, Fox 23 (RB), Girma 4, Davidson 12, Dunn 19, Coffey 17, Albert 15,
 *    Horan 10 (CM), Rodman 22, Lavelle 16, Morgan 7; Brazil: Luciana 1 (GK), Antônia 2, Tarciane 3, Thaís 5, Adriana 11, Duda Santos 21,
 *    Duda Sampaio 20, Yasmim 6 (LM), Gabi Portilho 18, Zaneratto 10, Gabi Nunes 9.  (cache: wiki-2024-w-gold-cup-final.txt)
 *  - Wikipedia, "Lindsey Heaps" (raw): midfielder, 5 ft 9 in (1.75 m); captained the USA; a striker at PSG (46 goals in 56) before moving
 *    to central midfield; began using her married name in 2025.  (cache: wiki-lindsey-heaps.txt)
 * CONFIRMED: the match, venue, date, 17:15 kick-off (daylight), sellout crowd; the goal a Heaps HEADER from Emily Fox's cross, 45+1', the
 *  only goal; Heaps No. 10 in central midfield, Fox No. 23 at right-back, Morgan 7, Rodman 22, Albert 15; Brazil's keeper Luciana (1),
 *  Tarciane 3, Antônia 2, Thaís 5, Yasmim 6, Duda Sampaio 20; her height; her midfield role.
 * INFERRED (illustrative, never narrated): the kits (USA white shirts, navy shorts, white socks; Brazil yellow shirts, blue shorts, white
 *  socks; Luciana in red) — no written source for the kits was read; every position, run and timing of the header goal (Fox crossing from
 *  the right touchline ≈26 m out, Heaps arriving from deep to meet it ≈9 m out, the header low to Luciana's right); the late-afternoon
 *  light (≈18:05 in San Diego in March); the stadium shape; hair (Heaps light-brown/blonde tied back, from photographs, not text).
 *  Chapters 2–4 are a DEMONSTRATION of the signature strike (right foot per iconicPlays params): the cut-back, the spot (just outside the
 *  box, a little left of centre), the low far-corner finish, the keeper and team-mate — not footage of a particular match.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, panning with the ball: Fox carries it down
 * the right, Heaps runs up from midfield, the cross, the header, the net, the celebration; ch2 = the demonstration from a lower side camera:
 * her run from midfield traced on the grass, the edge of the box lit yellow, the cut-back rolls to her, a first-time right-foot strike low
 * into the corner; ch3 = slow-motion replay from a LOW camera on her kicking side: a plumb line from her head down to the ball (head over
 * it), a ring on the right boot, a red dot on the ball's middle and an arrow straight through it; ch4 = the lesson from a three-quarter
 * front angle, then behind her as the ball skims into the corner. Composed on the FULL sheet (world units = sheet units centred on the
 * canvas; never sheet.safe), 1.45:1 card window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts
 * (continuous silhouettes, FK skeleton, `prev` secondary motion so ponytails swing, motionSmear on the header, the sprint and the strike);
 * women's builds with ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is
 * right-handed (x toward the goal Brazil defend, y up, +z = the attackers' right, the main-stand side), athlete.ts's own convention, so
 * her RIGHT foot is the right foot. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word
 * onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,header,runCycle,stand,keeperSet,keeperDive,backpedal,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/heaps-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/heaps-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The 2024 final, live',text:'San Diego, 2024: the Gold Cup final, USA against Brazil. Captain Lindsey Heaps runs up from midfield. Emily Fox crosses... Heaps heads it in! That goal won the cup.',tail:1.8,
  cues:['San Diego','Gold Cup final','Captain Lindsey Heaps','runs up','Emily Fox crosses','heads it in','won the cup']},
 {label:'From the edge',text:'Heaps loves to arrive from midfield and shoot from the edge of the box. Here’s how she does it. The ball rolls back... bang, low into the corner!',tail:1.6,
  cues:['Heaps loves','arrive from midfield','edge of the box','Here’s how','rolls back','bang','low into the corner']},
 {label:'Slow motion',text:'Watch slowly. Her head stays over the ball. Her right foot strikes right through the middle.',tail:1.4,
  cues:['Watch slowly','head stays over','right foot','through the middle']},
 {label:'The secret',text:'The secret? Keep your head over the ball, and strike through the middle of it.',tail:1.8,
  cues:['The secret','head over the ball','strike through','middle of it']},
];
import timingJson from '../../../public/plays/narration/heaps-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('heaps: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('heaps: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Brazil defend is x = 0 (the USA attack +x), goal centre z = 0, +z = the attackers' right (the main-stand side). */
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
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- Snapdragon Stadium, late afternoon: an open bowl, one canopy over the main stand
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.3+22*b,-42-30*b],
 (a,b)=>[8+24*b,1.3+17*b,lerp(-56,56,a)],
 (a,b)=>[lerp(14,-118,a),1.3+24*b,42+30*b],
 (a,b)=>[-113-24*b,1.3+17*b,lerp(56,-56,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=14,WALKS=[[.42],[.5],[.45],[.5]];
/** `empty`: the demonstration chapters print the seats with no crowd (no match is claimed there) */
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number;empty?:boolean}={}){
 const{roar=0,flash=0,empty=false}=o,v=view(s),tt=twos(t);
 // a clear March evening over San Diego: a pale blue screen, a warm low band toward the horizon
 s.field(B,.16,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.2);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.5,walk);
  if(i===2){addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.7),[0,10,0]),add3(S(0,.7),[0,10,0])]));seg3(c,add3(S(0,.7),[0,9.8,0]),add3(S(1,.7),[0,9.8,0]),.35,edge);}
  // the open stands' top rail against the sky
  else seg3(c,S(0,1),S(1,1),.5,edge);}
 s.knockout(planes);s.tone(K,planes,.5);s.tone(B,planes,.3);s.knockout(walk,.8);
 if(!empty){
  // the crowd: USA white, red and navy, a block of Brazil yellow; the roar lifts them
  const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
  for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.045))continue;
   for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,11);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,12)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
    const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
    const bra=si===3&&a>.55||si===0&&a<.12;const ink=bra?(h<.8?3:0):h<.58?0:h<.8?1:h<.95?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
  s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 }
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
/** hi: 0..1 lights the edge of the box (the 18-yard line) in yellow */
function ground(s:Sheet,c:Cam,o:{bulge?:number;bz?:number;by?:number;hi?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.93);s.tone(B,gp,.76);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: navy with red and paper panels
 const bd=new Path2D(),pn=new Path2D(),pw=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(k%2?pn:pw,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(k%2?pn:pw,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pw,.85);s.knockout(pn,.85);s.fill(R,pn,.9);
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
 const hi=o.hi??0;if(hi>.02){const e=new Path2D(),n=Math.max(2,Math.round(8*hi));for(let k=0;k<n;k++){const z0=lerp(-20.16,20.16,k/8),z1=lerp(-20.16,20.16,Math.min(1,(k+1)/8));seg3(c,[-16.5,.01,z0],[-16.5,.01,z1],.3,e,3);}
  s.knockout(e,.9*hi);s.fill(Y,e,.95*hi);}
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,o.bulge??0,o.bz??0,o.by??1);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out where the ball went in (bz across, by height 0..1.9) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number,by:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.5,2))*Math.exp(-Math.pow((y-by)/1.1,2));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,.95),.95,z],.022,mesh,.7);seg3(c,[back(z,.95),.95,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles; the kits are INFERRED, see the header)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[K,.3],[Y,.3]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** USA: white shirts, navy shorts, white socks, navy numbers */
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.9],numberInk:[K,.9],hairStyle:'ponytail',build:W_BUILD(1.68),...o});
/** Brazil: yellow shirts, blue shorts, white socks, blue numbers */
const bra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:[B,.9],socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:[B,.9],numberInk:[B,.9],hairStyle:'ponytail',build:W_BUILD(1.66),...o});
const HEAPS_B=W_BUILD(1.75,.95);
/** Heaps: No. 10, light-brown/blonde hair tied back */
const HEAPS_ST=usa({number:10,hair:[Y,.7],build:HEAPS_B,seed:10});
const LUCIANA_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:'paper',build:W_BUILD(1.73,.95),seed:1};
/** the demonstration's neutral keeper and team-mate (no match claimed): grey kit / USA kit with no number */
const DEMO_GK:AthleteStyle={shirt:[K,.35],shorts:[K,.5],socks:[K,.35],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',build:W_BUILD(1.72,.95),seed:71};
const DEMO_MATE:AthleteStyle=usa({hair:[R,.5],build:W_BUILD(1.66,.9),seed:72});

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a cumulative-distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-14,T_MAX=10,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
const TABS=new Map<Path,number[]>();
function tabOf(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
/** metres per full run cycle (two strides) */
const CYCLE_M=3.9;
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const ARMS_OUT=posed({lShA:104,rShA:100,lShF:10,rShF:14,lElb:14,rElb:18,lHand:1,rHand:1,neckP:-28,lean:-6,pitch:-3,lHipF:14,rHipF:-2,lKnee:18,rKnee:22,lHipA:8,rHipA:8});

// ================================================================ PLAY A — the real goal: Fox's cross, Heaps' header (τ = 0 is the header)
/** Heaps meets it ≈9 m out, a touch right of centre; she heads it low to Luciana's right (inferred) */
const PH:[number,number]=[-8.9,1.2];
const GA:V3=[0,.36,-2.3];
const YAW_H=lerpAng(yawTo(PH[0],PH[1],GA[0],GA[2]),yawTo(PH[0],PH[1],-26,25),.28);
/** the ball meets her forehead: the face point pushed out by a ball radius (solved once through the skeleton at header contact) */
const HA:V3=(()=>{const sk=solve(header(.52),HEAPS_B,{x:PH[0],z:PH[1],yaw:YAW_H});const d:V3=[sk.face[0]-sk.head[0],sk.face[1]-sk.head[1],sk.face[2]-sk.head[2]],l=Math.hypot(d[0],d[1],d[2])||1;return[sk.face[0]+d[0]/l*.1,sk.face[1]+d[1]/l*.1,sk.face[2]+d[2]/l*.1];})();
const T_HA0=-.52,HDUR=1;
const T_CROSS=-1.2,T_HF=.5,T_NETA=T_HF+.08;
const NET_A:V3=[1.5,.42,-2.5],REST_A:V3=[1.2,.11,-2.3];
/** Heaps: from the centre circle's edge, a lope, then the late burst into the box; after the goal she wheels away to the main-stand corner */
const HA_PATH:Path=[[-14,-40,-4],[-9,-37,-3],[-6,-32.5,-2],[-4,-26.5,-.6],[-2.5,-19.5,.3],[-1.3,-13.4,.9],[T_HA0,PH[0],PH[1]],[T_HA0+HDUR,PH[0]+.2,PH[1]],
 [1.6,-7.8,3.2],[2.8,-7.1,8],[4.2,-6.4,13.6],[5.8,-6.2,18.6],[7.6,-6.8,21.4]];
function heapsAPose(tau:number):Pose{
 const sp=speedAt(HA_PATH,tau);
 let p=blendPose(stand(),runCycle(distAt(tabOf(HA_PATH),tau)/CYCLE_M,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 // eyes up on the cross while it is in the air
 p.neckP-=16*DEG*sm(T_CROSS,T_CROSS+.3,tau)*(1-sm(-.8,-.55,tau));
 const w=sm(T_HA0-.26,T_HA0,tau)*(1-sm(T_HA0+HDUR-.05,T_HA0+HDUR+.3,tau));
 if(w>0)p=blendPose(p,header(clamp((tau-T_HA0)/HDUR)),w);
 if(tau>.6){const c=celebrate(distAt(tabOf(HA_PATH),tau)/4.2,{kind:'run'});p=blendPose(p,c,sm(.6,1.1,tau));
  if(tau>5.8)p=blendPose(p,ARMS_OUT,sm(5.8,6.8,tau));}
 return p;
}
function heapsAPlace(tau:number):Place{
 if(tau>=T_HA0&&tau<=T_HA0+HDUR*.9)return{x:PH[0],z:PH[1],yaw:YAW_H};
 const[x,z]=pathAt(HA_PATH,tau),a=pathAt(HA_PATH,tau+.1),sp=speedAt(HA_PATH,tau),b=ballA(tau);
 let yaw=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(1.2,3,sp));
 yaw=lerpAng(yaw,YAW_H,sm(T_HA0-.4,T_HA0,tau)*(1-sm(T_HA0+HDUR*.9,T_HA0+HDUR+.4,tau)));
 if(tau>5.8)yaw=lerpAng(yaw,yawTo(x,z,-10,50),sm(5.8,6.8,tau));
 return{x,z,yaw};
}
/** Fox carries it down the right; the cross leaves her right boot at T_CROSS */
const FOX_PATH:Path=[[-14,-52,22.6],[-9,-45.5,23.6],[-5,-36.4,24.8],[-2.6,-30.6,25.4],[T_CROSS,-27.6,25.6],[0,-26.6,25.2],[3,-24,23.5]];
const C0:V3=(()=>{const[x,z]=pathAt(FOX_PATH,T_CROSS);const a=Math.atan2(PH[1]-z,PH[0]-x);return[x+Math.cos(a)*.45,.11,z+Math.sin(a)*.45];})();
function foxBall(tau:number):V3{{const[x,z]=pathAt(FOX_PATH,tau),a=pathAt(FOX_PATH,tau+.15),l=Math.hypot(a[0]-x,a[1]-z)||1,push=.5+.28*Math.abs(Math.sin(tau*Math.PI*1.25));return[x+(a[0]-x)/l*push,.11,z+(a[1]-z)/l*push];}}
function ballA(tau:number):V3{
 if(tau<T_CROSS-.35)return foxBall(tau);
 if(tau<T_CROSS){const s0=foxBall(T_CROSS-.35);return mix3(s0,C0,(tau-T_CROSS+.35)/.35);}
 if(tau<0){const u=(tau-T_CROSS)/(-T_CROSS),P=mix3(C0,HA,u);P[1]+=3.4*4*u*(1-u)*(1-.15*u);return P;}
 if(tau<T_HF){const u=tau/T_HF,P=mix3(HA,GA,u);P[1]=u<.72?lerp(HA[1],.12,Math.pow(u/.72,1.3)):.12+(GA[1]-.12)*Math.sin((u-.72)/.28*Math.PI/2);return P;}
 if(tau<T_NETA)return mix3(GA,NET_A,easeOut((tau-T_HF)/(T_NETA-T_HF)));
 const u=clamp((tau-T_NETA)/.5);return[lerp(NET_A[0],REST_A[0],u),Math.max(.11,NET_A[1]*(1-u*u)+.11*u*u),lerp(NET_A[2],REST_A[2],u)];
}
const spinA=(tau:number)=>TAU*1.4*tau;
const bulgeA=(tau:number)=>tau<T_NETA-.03?0:Math.exp(-(tau-T_NETA+.03)*2.4)*(1+.3*Math.sin((tau-T_NETA)*14));

// ================================================================ PLAY B — the demonstration: the cut-back, the strike from the edge (σ = 0 is contact)
/** the spot: just outside the box (x = −16.5), a little left of centre; the finish low into the far corner (Luciana's-side-agnostic: a
 * neutral keeper's left) */
const SB:V3=[-17.7,.11,-.9];
const GB:V3=[0,.3,2.9];
const SHOT_DIR:V3=(()=>{const d:V3=[GB[0]-SB[0],0,GB[2]-SB[2]],l=Math.hypot(d[0],d[2]);return[d[0]/l,0,d[2]/l];})();
/** her run-up: a right-footed strike comes from a little to the left of the line of the shot */
const KDIR:[number,number]=(()=>{const a=Math.atan2(GB[2]-SB[2],GB[0]-SB[0])+.3;return[Math.cos(a),Math.sin(a)];})();
const YAW_K=yawTo(0,0,KDIR[0],KDIR[1]);
const KSD=.85;
/** her pelvis at contact so the RIGHT boot meets the ball (solved once through the skeleton) */
const PK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),HEAPS_B,{x:0,z:0,yaw:YAW_K});const tx=SB[0]-KDIR[0]*.1,tz=SB[2]-KDIR[1]*.1;return[tx-sk.rToe[0],tz-sk.rToe[2]];})();
const T_PB=-1.0,T_FB=.62,T_NETB=T_FB+.08;
const NET_B:V3=[1.6,.36,3.05],REST_B:V3=[1.2,.11,2.8];
const HB_PATH:Path=[[-14,-46,-5],[-8,-41,-4.4],[-5,-34.5,-3.4],[-3,-28.4,-2.4],[-1.5,-23,-1.7],[-.5,PK[0]-KDIR[0]*1.9,PK[1]-KDIR[1]*1.9],[0,PK[0],PK[1]],
 [.55,PK[0]+KDIR[0]*1.3,PK[1]+KDIR[1]*1.3],[1.6,PK[0]+KDIR[0]*3,PK[1]+KDIR[1]*3.2],[3.2,PK[0]+KDIR[0]*4.2,PK[1]+KDIR[1]*4.6],[6,PK[0]+KDIR[0]*4.6,PK[1]+KDIR[1]*5]];
function heapsBPose(tau:number):Pose{
 const sp=speedAt(HB_PATH,tau);
 let p=blendPose(stand(),runCycle(distAt(tabOf(HB_PATH),tau)/CYCLE_M,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 // a glance up at the goal, then the head goes down over the ball as the pass arrives
 p.neckP-=18*DEG*sm(-2.2,-1.9,tau)*(1-sm(-1.5,-1.2,tau));
 const us=STRIKE_CONTACT+tau/KSD;
 if(us>.05){const w=sm(.05,.2,us)*(tau<1.2?1:1-sm(1.2,1.7,tau));p=blendPose(p,strike(clamp(us,0,1),{foot:'r',power:1}),w);}
 if(tau>1.5){p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(1.5,2.1,tau)*.55);}
 return p;
}
function heapsBPlace(tau:number):Place{
 const[x,z]=pathAt(HB_PATH,tau),sp=speedAt(HB_PATH,tau),a=pathAt(HB_PATH,tau+.1),b=ballB(tau);
 let yaw=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(1.2,3,sp));
 const w=sm(-.6,-.3,tau)*(1-sm(.6,1,tau));yaw=lerpAng(yaw,YAW_K,w);
 return{x,z,yaw};
}
/** the team-mate near the left byline: she carries it in, then rolls it back across the edge of the box */
const MATE_PATH:Path=[[-14,-17,-15],[-6,-11.8,-12.4],[-3,-8.8,-11.2],[T_PB,-7.3,-10.6],[1,-6.9,-10.3],[4,-7.6,-9.4]];
const MB0:V3=(()=>{const[x,z]=pathAt(MATE_PATH,T_PB);const a=Math.atan2(SB[2]-z,SB[0]-x);return[x+Math.cos(a)*.42,.11,z+Math.sin(a)*.42];})();
function mateBall(tau:number):V3{{const[x,z]=pathAt(MATE_PATH,tau),a=pathAt(MATE_PATH,tau+.15),l=Math.hypot(a[0]-x,a[1]-z)||1,push=.5+.25*Math.abs(Math.sin(tau*Math.PI*1.3));return[x+(a[0]-x)/l*push,.11,z+(a[1]-z)/l*push];}}
function ballB(tau:number):V3{
 if(tau<T_PB-.3)return mateBall(tau);
 if(tau<T_PB){const s0=mateBall(T_PB-.3);return mix3(s0,MB0,(tau-T_PB+.3)/.3);}
 if(tau<0){const u=(tau-T_PB)/(-T_PB);return mix3(MB0,SB,u*(1.25-.25*u));}
 if(tau<T_FB){const u=tau/T_FB,P=mix3(SB,GB,u);P[1]=.11+(GB[1]-.11)*u+.12*Math.sin(Math.PI*u);return P;}
 if(tau<T_NETB)return mix3(GB,NET_B,easeOut((tau-T_FB)/(T_NETB-T_FB)));
 const u=clamp((tau-T_NETB)/.5);return[lerp(NET_B[0],REST_B[0],u),Math.max(.11,NET_B[1]*(1-u*u)+.11*u*u),lerp(NET_B[2],REST_B[2],u)];
}
const spinB=(tau:number)=>tau<=0?TAU*1.1*tau:TAU*3.2*Math.min(tau,T_NETB)+TAU*1.1*Math.max(0,tau-T_NETB);
const bulgeB=(tau:number)=>tau<T_NETB-.03?0:Math.exp(-(tau-T_NETB+.03)*2.4)*(1+.3*Math.sin((tau-T_NETB)*14));

// ---------------------------------------------------------------- everyone else (both plays)
type Role='run'|'def'|'keeper'|'passer';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;team:'usa'|'bra'|'demo';
 /** a pass: [contact τ, foot, power, target] */kick?:[number,'l'|'r',number,V3];/** keeper: dive start τ, side, height */dive?:[number,'l'|'r',number]};
type Play={ball:(tau:number)=>V3;spin:(tau:number)=>number;bulge:(tau:number)=>number;tNet:number;bz:number;by:number;actors:Actor[];
 hero:{st:AthleteStyle;pose:(tau:number)=>Pose;place:(tau:number)=>Place;smear:(tau:number)=>boolean}};
const ACTORS_A:Actor[]=[
 {name:'Fox',role:'passer',team:'usa',st:usa({number:23,hair:[R,.55],build:W_BUILD(1.65,.92),seed:23}),path:FOX_PATH,phase:.2,kick:[T_CROSS,'r',.75,HA]},
 {name:'Albert',role:'run',team:'usa',st:usa({number:15,hair:[Y,.8],build:W_BUILD(1.73,.95),seed:15}),path:[[-14,-47,6],[-6,-40,6.5],[-2,-34,7.4],[3,-30,8]],phase:.55},
 {name:'Morgan',role:'run',team:'usa',st:usa({number:7,hair:K,build:W_BUILD(1.7,.92),seed:7}),path:[[-14,-18,-3],[-6,-15,-2.4],[-2.4,-10.6,-2.8],[-.9,-6.8,-3.6],[0,-5.8,-3.9],[2,-5.2,-2.6],[5,-6.2,4]],phase:.35},
 {name:'Rodman',role:'run',team:'usa',st:usa({number:22,skin:SKIN_D,hair:K,hairStyle:'curly',build:W_BUILD(1.7,.9),seed:22}),path:[[-14,-22,-16],[-6,-17,-13],[-2,-11,-9.5],[0,-8.6,-8.4],[3,-8,-4],[6,-7,6]],phase:.75},
 {name:'Tarciane',role:'def',team:'bra',st:bra({number:3,skin:SKIN_D,build:W_BUILD(1.73,.95),seed:3}),path:[[-14,-21,1],[-6,-17.2,.6],[-2.6,-12.8,.4],[-.8,-9.9,-.1],[0,-9.5,-.3],[3,-9.4,-.6]],phase:.1},
 {name:'Thaís',role:'def',team:'bra',st:bra({number:5,build:W_BUILD(1.71,.95),seed:5}),path:[[-14,-19,-4.5],[-6,-15.6,-3.6],[-2.4,-10.8,-3.9],[-.8,-7.4,-4.2],[0,-6.4,-4.4],[3,-6,-4]],phase:.6},
 {name:'Antônia',role:'def',team:'bra',st:bra({number:2,build:W_BUILD(1.64,.93),seed:2}),path:[[-14,-20,8],[-6,-15.8,7.4],[-2.4,-10,5.4],[-.8,-6.2,3.6],[0,-5.2,3.2],[3,-5,3]],phase:.3},
 {name:'Yasmim',role:'def',team:'bra',st:bra({number:6,build:W_BUILD(1.63,.9),seed:6}),path:[[-14,-40,18],[-8,-38,20.2],[-4,-31.4,22],[-2,-28.4,23.4],[0,-27.2,23.8],[3,-25,22.5]],phase:.8},
 {name:'Duda Sampaio',role:'run',team:'bra',st:bra({number:20,skin:SKIN_L,hair:[R,.5],build:W_BUILD(1.68,.92),seed:20}),path:[[-14,-35,-2],[-6,-28.5,-1.6],[-2.5,-20.8,-.5],[0,-15.4,.6],[3,-13,1]],phase:.45},
 {name:'Luciana',role:'keeper',team:'bra',st:LUCIANA_ST,path:[[-14,-5,1.6],[-6,-3.2,2.2],[-2,-2.2,1.8],[-.6,-1.6,1],[0,-1.4,.7],[4,-1.4,.7]],phase:0,dive:[.05,'r',.18]},
];
const ACTORS_B:Actor[]=[
 {name:'Mate',role:'passer',team:'demo',st:DEMO_MATE,path:MATE_PATH,phase:.4,kick:[T_PB,'r',.55,SB]},
 {name:'Keeper',role:'keeper',team:'demo',st:DEMO_GK,path:[[-14,-3,-1.2],[-4,-2.2,-1.6],[-1.2,-1.8,-.8],[0,-1.6,-.4],[4,-1.5,-.3]],phase:0,dive:[.12,'l',.12]},
];
const PLAY_A:Play={ball:ballA,spin:spinA,bulge:bulgeA,tNet:T_NETA,bz:NET_A[2],by:.5,actors:ACTORS_A,
 hero:{st:HEAPS_ST,pose:heapsAPose,place:heapsAPlace,smear:tau=>(tau>-2.6&&tau<.4)||(tau>1&&tau<4.5)}};
const PLAY_B:Play={ball:ballB,spin:spinB,bulge:bulgeB,tNet:T_NETB,bz:NET_B[2],by:.4,actors:ACTORS_B,
 hero:{st:HEAPS_ST,pose:heapsBPose,place:heapsBPlace,smear:tau=>tau>-3&&tau<.6}};
/** one actor's pose + place at τ (it = idle clock). The USA celebrate after the goal; Brazil's heads drop. */
function actorAt(pl:Play,a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=pl.ball(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(tabOf(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='keeper'){
  let kp=blendPose(keeperSet(it*1.3),backpedal(ph*1.6),sm(.3,1,sp));
  if(a.dive&&tau>a.dive[0]){const[t0,side,h]=a.dive,u=clamp((tau-t0)/1.25);kp=blendPose(kp,keeperDive(u*.95,{side,height:h}),sm(t0,t0+.15,tau));}
  if(a.team==='bra'&&tau>2.6)kp=blendPose(kp,SLUMP,sm(2.6,3.4,tau)*.4);
  return{pose:kp,place:{x,z,yaw:toBall}};
 }
 if(a.role==='def'){const back=blendPose(READY,backpedal(ph*1.4),sm(.4,1.2,sp));p=blendPose(back,p,sm(2.5,4,sp));}
 if(a.kick){const[t0,foot,power,tg]=a.kick,us=STRIKE_CONTACT+(tau-t0)/.8;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,yawTo(x,z,tg[0],tg[2]),w);}}
 if(tau>pl.tNet+.2&&sp<1.6){if(a.team==='usa')p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(pl.tNet+.2,pl.tNet+.7,tau)*.9);else if(a.team==='bra')p=blendPose(p,SLUMP,sm(pl.tNet+.2,pl.tNet+.9,tau)*.6);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the header, the sprint, the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball on screen
function drawBall(s:Sheet,c:Cam,pl:Play,tau:number,o:{min?:number;lines?:boolean;prev?:number;dot?:number}={}){
 const P=pl.ball(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined){const a=pr(c,pl.ball(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(280,d*1.5),spread:r*.9,width:Math.max(2.5,r*.18),cov:.85});}}
 footballPanels(s,g[0],g[1],r,{rot:pl.spin(tau),key:K,shadow:B,seed:5});
 // "the middle of the ball": a red dot on its centre
 const dt=o.dot??0;if(dt>.02){const p=new Path2D();p.arc(g[0],g[1],r*.26*(.6+.4*dt),0,TAU);s.knockout(p,.9*dt);s.fill(R,p,.95*dt);}
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,pl:Play,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,pl.ball(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number;dot?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,pl:Play,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(p:Place,h=1.8)=>{const q=toCam(c,[p.x??0,.9,p.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const H=pl.hero,p0=H.place(tp),d=visible(p0);if(d>0)items.push({d,draw:()=>{const pose=H.pose(tp),prev={pose:H.pose(tpPrev),place:H.place(tpPrev)};
  drawPlayer(s,pose,c,detailFor(H.st,d,true),p0,prev,!!e.smear&&H.smear(tp));}});}
 for(const a of pl.actors){const cur=actorAt(pl,a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(pl,a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='keeper'),cur.place,prev,!!e.smear&&a.role==='keeper'&&tp>-.2&&tp<1.1);}});}
 const bq=toCam(c,pl.ball(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,pl,tau,{min:e.minBall,lines:e.lines,prev:e.prevT,dot:e.dot});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(pl:Play,tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=pl.ball(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5+3,Math.min(1.4,y/5)*.6+.6,z/5];}
/** smoothed ground point under the hero (cameras ride this) */
const hxz=(pl:Play,tau:number):V3=>{let x=0,z=0;for(let i=-2;i<=2;i++){const p=pl.hero.place(tau+i*.12);x+=p.x??0;z+=p.z??0;}return[x/5,0,z/5];};

/** her run so far, traced on the grass (a riso replay trail under the players) */
function runTrail(s:Sheet,c:Cam,path:Path,t0:number,t1:number,fade:number,wm=.34){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=26;i++){const tau=lerp(t0,t1,i/26),p=pathAt(path,tau),q=pr(c,[p[0],.02,p[1]]);if(q)pts.push(q);}
 if(pts.length<3)return;const e=pathAt(path,t1),w=Math.max(9,kAt(c,[e[0],0,e[1]])*wm);s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0}),.9*fade);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring on the grass around a ground point (radius in metres), drawn as a projected ellipse */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[P[0]+Math.cos(a)*rm*(.7+.3*u),.02,P[2]+Math.sin(a)*rm*(.7+.3*u)]);if(q)pts.push(q);}if(pts.length<10)return;
 const w=Math.max(5,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** "head over the ball": a dashed yellow plumb line from her head straight down to the ball, a ring round the head */
function plumb(s:Sheet,c:Cam,tau:number,u:number){if(u<=.02)return;const sk=solve(heapsBPose(tau),HEAPS_B,heapsBPlace(tau)),b=ballB(Math.min(tau,0));
 const top:V3=add3(sk.head,[0,.05,0]),bot:V3=[sk.head[0],.22,sk.head[2]],a=pr(c,top),e=pr(c,mix3(top,bot,u));if(!a||!e)return;
 const gaps:[number,number][]=[];for(let i=0;i<7;i++)gaps.push([(i+.6)/7,(i+.95)/7]);
 const w=Math.max(6,kAt(c,sk.head)*.045),p=ribbon([a,e],w,{taper:0,pressure:0,wobble:0,gaps});s.knockout(p,.9*u);s.fill(Y,p,.95*u);
 ring3(s,c,sk.head,.2,u,Y,41);groundRing(s,c,[b[0],0,b[2]],.3,u,Y,42);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** real time; the header lands just after "heads it in" */
const tS1=()=>CUE(0,'heads it in')+.15;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-24,21,-60];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,0,14],fov:22})],
  [CUE(0,'Gold Cup')-.2,1.4,()=>({P:P1,T:mix3(panTarget(PLAY_A,tau),[-24,0,4],.4),fov:17})],
  [CUE(0,'Captain')-.3,1.1,()=>({P:P1,T:mix3(panTarget(PLAY_A,tau),add3(hxz(PLAY_A,tau),[0,1,0]),.5),fov:13})],
  [CUE(0,'Emily Fox')-.3,1,()=>({P:P1,T:mix3(panTarget(PLAY_A,tau),[-10,1,2],.45),fov:12})],
  [tS1()-.35,.7,()=>({P:P1,T:mix3(panTarget(PLAY_A,tau),[-5,1.2,0],.5),fov:11})],
  [tS1()+T_NETA+.5,1.6,()=>({P:P1,T:add3(hxz(PLAY_A,tau),[0,1,0]),fov:8.5})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NETA;
  stadium(s,c,t,[2,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeA(tau),bz:NET_A[2],by:.5});
  play(s,c,PLAY_A,tau,tp,tpp,{it:tt,minBall:12,lines:tau>T_CROSS&&tau<T_NETA,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),q=pr(c,add3(hxz(PLAY_A,tau1(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · the demonstration: from midfield to the edge, the cut-back, the strike
const tS2=()=>CUE(1,'bang')+.05;
const tau2=(t:number)=>key(t,mono([[0,-7.2],[CUE(1,'arrive from')+.2,-5.2],[CUE(1,'rolls back'),T_PB-.2],[tS2(),0],[SECS(1),SECS(1)-tS2()]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),k=hxz(PLAY_B,tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[-3,4.5,15]),T:add3(k,[4,.8,-1]),fov:30})],
  [CUE(1,'edge of')-.3,1.2,()=>({P:add3(k,[-2,5,16]),T:mix3(add3(k,[0,.8,0]),[-15,0,-1.6],.6),fov:30})],
  [CUE(1,'Here’s how')-.2,1.1,()=>({P:add3(k,[-3,3,11]),T:mix3(add3(k,[0,.8,0]),SB,.45),fov:28})],
  [tS2()-.3,.5,()=>({P:[-28,3.4,9],T:[-12,.6,.4],fov:38})],
  [CUE(1,'low into')-.1,.8,()=>({P:[-27,3.4,9],T:[-6,.7,1.6],fov:32})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),tA=CUE(1,'arrive from'),tE=CUE(1,'edge of'),tB=tS2();
  stadium(s,c,t,[0,1,3],{empty:true});
  ground(s,c,{bulge:bulgeB(tau),bz:NET_B[2],by:.4,hi:sm(tE-.1,tE+.5,t)*(1-sm(tB+.3,tB+1,t))});
  // "arrive from midfield": her run traced on the grass behind her
  runTrail(s,c,HB_PATH,-7,Math.min(tau,-.4),sm(tA-.2,tA+.5,t)*(1-sm(tB,tB+.6,t)));
  // the spot: a yellow ring on the grass where the ball will arrive
  groundRing(s,c,[SB[0],0,SB[2]],.8,sm(tE+.2,tE+.7,t,easeOutBack)*(1-sm(tB-.1,tB+.1,t)),Y,51);
  if(tau>0&&tau<T_NETB+.8){const pts=pathPts(c,PLAY_B,0,Math.min(tau,T_FB),16),fade=1-sm(T_NETB,T_NETB+.8,tau);if(pts.length>2){const w=Math.max(7,kAt(c,PLAY_B.ball(Math.min(tau,T_FB)))*.13);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,PLAY_B,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:tau>0&&tau<T_NETB,prevT:tau2(t-.06),only:70});
  const hit=sm(-.02,.04,tau)*(1-sm(.1,.28,tau));if(hit>0){const q=pr(c,SB);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,SB)*.6)*hit,{n:9,seed:10,width:Math.max(4,kAt(c,SB)*.05)});}
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(hxz(PLAY_B,tau2(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:9.2,
};

// ---------------------------------------------------------------- 3 · slow-motion replay, LOW on her kicking side: head over the ball, right foot through the middle
const tau3=(t:number)=>key(t,mono([[0,-1.25],[CUE(2,'head stays')+.1,-.5],[CUE(2,'right foot'),-.05],[CUE(2,'through the middle')+.3,.015],[SECS(2),.5]]),linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),k=hxz(PLAY_B,tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[-1.2,.9,5.2]),T:add3(k,[.9,.75,0]),fov:30})],
  [CUE(2,'head stays')-.2,1,()=>({P:add3(SB,[-.9,.85,4.3]),T:add3(SB,[-.3,.8,0]),fov:30})],
  [CUE(2,'right foot')-.2,.8,()=>({P:add3(SB,[-.6,.45,3.1]),T:add3(SB,[-.1,.35,0]),fov:28})],
  [CUE(2,'through the middle')-.1,.7,()=>({P:add3(SB,[-.4,.5,3.2]),T:add3(SB,[.9,.3,.3]),fov:30})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tH=CUE(2,'head stays'),tR=CUE(2,'right foot'),tM=CUE(2,'through the middle');
  stadium(s,c,t,[0,3],{empty:true});
  ground(s,c,{bulge:bulgeB(tau),bz:NET_B[2],by:.4});
  play(s,c,PLAY_B,tau,tp,tpp,{it:tt,smear:true,minBall:14,only:40,dot:sm(tM-.1,tM+.3,t,easeOutBack)});
  plumb(s,c,tp,sm(tH-.05,tH+.5,t)*(1-sm(tM+.6,tM+1.1,t)));
  const rf=sm(tR-.1,tR+.3,t,easeOutBack)*(1-sm(tM+.6,tM+1.1,t));if(rf>.02){const sk=solve(heapsBPose(tp),HEAPS_B,heapsBPlace(tp));ring3(s,c,mix3(sk.rAn,sk.rToe,.4),.2,rf,R,31);}
  // "through the middle": a red arrow straight through the ball's centre toward the corner
  const st=sm(tM-.05,tM+.6,t,easeOut);if(st>.02){const a0:V3=add3(SB,[-SHOT_DIR[0]*.55,0,-SHOT_DIR[2]*.55]),a1:V3=add3(SB,[SHOT_DIR[0]*2.2,.08,SHOT_DIR[2]*2.2]);arrow3(s,c,[a0,mix3(a0,a1,.5*st),mix3(a0,a1,st)],Math.max(8,kAt(c,SB)*.06),R,.95);}
  const hit=sm(-.01,.01,tau)*(1-sm(.03,.12,tau));if(hit>0){const q=pr(c,SB);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,SB)*.5)*hit,{n:9,seed:12,width:Math.max(5,kAt(c,SB)*.04)});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(SB,[0,.4,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: head over the ball → strike through the middle → low into the corner
const tau4=(t:number)=>key(t,mono([[0,-.95],[CUE(3,'head over')+.2,-.3],[CUE(3,'strike through'),-.03],[CUE(3,'middle of it')+.15,.03],[SECS(3),.9]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:add3(SB,[3.6,1.5,3.1]),T:add3(SB,[-.8,.65,-.2]),fov:34})],
  [CUE(3,'head over')-.3,.9,()=>({P:add3(SB,[3,1.3,2.6]),T:add3(SB,[-.6,.7,-.1]),fov:30})],
  [CUE(3,'strike through')-.2,.8,()=>({P:add3(SB,[2.2,.8,2.8]),T:add3(SB,[-.1,.35,0]),fov:30})],
  [CUE(3,'middle of it')+.1,1,()=>({P:add3(SB,[-4.2,1.7,-1.6]),T:[-1,.7,1.8],fov:34})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tH=CUE(3,'head over'),tS=CUE(3,'strike through'),tM=CUE(3,'middle of it');
  stadium(s,c,t,[0,1,2,3],{empty:true});
  ground(s,c,{bulge:bulgeB(tau),bz:NET_B[2],by:.4});
  if(tau>0&&tau<T_NETB+.9){const pts=pathPts(c,PLAY_B,0,Math.min(tau,T_FB),16);if(pts.length>2){const w=Math.max(7,kAt(c,PLAY_B.ball(Math.min(tau,T_FB)))*.13);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9);}}
  play(s,c,PLAY_B,tau,tp,tpp,{it:tt,smear:true,minBall:14,only:45,dot:sm(tS-.1,tS+.3,t,easeOutBack)*(1-sm(tM+.4,tM+.8,t))});
  plumb(s,c,tp,sm(tH-.05,tH+.5,t)*(1-sm(tM-.2,tM+.2,t)));
  const st=sm(tS-.05,tS+.5,t,easeOut)*(1-sm(tM+.4,tM+.8,t));if(st>.02){const a0:V3=add3(SB,[-SHOT_DIR[0]*.55,0,-SHOT_DIR[2]*.55]),a1:V3=add3(SB,[SHOT_DIR[0]*2.4,.1,SHOT_DIR[2]*2.4]);arrow3(s,c,[a0,mix3(a0,a1,.5*st),mix3(a0,a1,st)],Math.max(8,kAt(c,SB)*.06),R,.95);}
  // low into the corner: a yellow ring where it lands in the net
  groundRing(s,c,[GB[0]+.5,0,GB[2]],.7,sm(tM+.6,tM+1.1,t,easeOutBack),Y,61);
 },
 still:6.2,
};

const film:RisoStory={
 id:'heaps-signature',format:'11v11',title:'Heaps: the strike from the edge',
 theme:'Arrive from midfield and shoot from the edge: keep your head over the ball and strike through the middle of it',
 ageNote:'Opens on USA 1–0 Brazil, CONCACAF W Gold Cup final, Snapdragon Stadium, San Diego, 10 March 2024 (Heaps’s header from Emily Fox’s cross) — then her edge-of-the-box strike shown as a demonstration, not one logged goal. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little low drive — a yellow streak skims from the touch and the ball zips away. Reduced motion: the still streak. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.5)/.3),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*u;pts.push([x+230*k,y-26*k-14*Math.sin(Math.PI*k)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.9,pressure:.3,wobble:1}),.95*fade);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,70,{n:8,seed,g:1-clamp(age/.3),width:10});
  const e=pts[pts.length-1];footballPanels(s,e[0],e[1],28,{rot:age*6+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
