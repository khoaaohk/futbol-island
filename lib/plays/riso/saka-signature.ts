/** Bukayo Saka's signature — face up the defender, cut inside from the right and curl it. The moment: England 1–1 Switzerland (after extra
 * time, England won 5–3 on penalties), UEFA Euro 2024 quarter-final, Merkur Spiel-Arena, Düsseldorf, Saturday 6 July 2024, 18:00: Saka's
 * 80th-minute equaliser. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage
 * itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Saka a signature, not a match ("the cut inside and curl", side right, foot left; lesson "Face up
 * your defender, then drive inside to open up the shot"). Wikipedia's "Bukayo Saka" (playing style) describes exactly that trait —
 * "Predominantly a right winger … Naturally left-footed, he is known for cutting inside to score long-range, curled efforts" — and its
 * best-documented example on the biggest stage is this equaliser: Wikipedia's "UEFA Euro 2024 final" (England's route) says Saka equalised
 * "in the 80th minute when he cut in from the right before shooting low to the left corner of the net". He was player of the match.
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia (raw), "UEFA Euro 2024 knockout stage" — the England v Switzerland box: 6 July 2024, 18:00, Merkur Spiel-Arena, Düsseldorf,
 *    attendance 46,907, referee Daniele Orsato; Embolo 75', Saka 80'; 1–1 a.e.t., 5–3 pens (Saka scored England's third kick); line-ups
 *    and numbers; kits from the UEFA tactical line-ups (England _eng24h: white shirts, NAVY shorts 000066, white socks; Switzerland
 *    _sui24h: red shirts, dark-red shorts A60014, red socks); man of the match Saka   https://en.wikipedia.org/wiki/UEFA_Euro_2024_knockout_stage
 *  - Wikipedia (raw), "UEFA Euro 2024 final" (England's route to the final): "Bukayo Saka then equalising for England in the 80th minute
 *    when he cut in from the right before shooting low to the left corner of the net"   https://en.wikipedia.org/wiki/UEFA_Euro_2024_final
 *  - Wikipedia (raw), "Bukayo Saka": player of the match v Switzerland, "scoring the equaliser in a 1–1 draw and also scoring in the
 *    subsequent penalty shootout"; playing style (right winger, naturally left-footed, cuts inside for curled efforts); cites UEFA.com,
 *    "England 1–1 Switzerland (aet, 5–3 pens): Pickford and Saka lead Southgate's men into semis" (6 July 2024; the live page is script-
 *    rendered, so its text was not readable)   https://en.wikipedia.org/wiki/Bukayo_Saka
 * CONFIRMED by those accounts: date, kick-off, ground, round, attendance, referee; Switzerland led 1–0 (Embolo 75'), Saka equalised on 80
 * minutes — ten minutes of normal time left, five minutes after the Swiss goal; he CUT IN FROM THE RIGHT and shot LOW to the LEFT CORNER
 * of the net (the far corner from the right); Yann Sommer (1) in the Swiss goal; Saka wore 7; the kits above; England won the shoot-out.
 * INFERRED (illustrative reconstruction): the shooting foot — drawn LEFT (Wikipedia: "naturally left-footed", cutting inside from the right
 * onto it is his trademark; the narration never names the foot); who passed to him (drawn: an unnumbered England midfielder infield — not
 * named); the defender he faced up (drawn: Ricardo Rodríguez, 13, the left of Switzerland's back three in the line-up — not named in the
 * narration); the Wikipedia line-up table lists Saka as "LWB", but the account ("cut in from the right"), his role all tournament and his
 * signature put him on the RIGHT, as drawn; the exact spots and timings: where he received (the right channel, level with the box), the
 * face-up (defender backing off then stopping), the number of touches, the feint, where he shot from (just outside the box, right of
 * centre), the flight (≈ 20 m, ≈ .75 s, knee height, bending back inside the far post); Sommer's dive to his right, his keeper kit (drawn
 * yellow); Saka's celebration run toward the near corner; every other player's position; the ball (white, navy panels); the direction of
 * play and which touchline the main camera was on (drawn: England attacking left to right, Saka's wing under the main camera); the arena's
 * seats, roof, boards and crowd colours; the TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand
 * camera, near real time, from the pass to the goal and the roar; 2 = slow-motion replay from a low camera behind Saka's right shoulder:
 * he runs straight at the defender (arrow), the defender stops (ring), he drives inside (the red run) and the goal opens up (the angle
 * wedge widens); 3 = replay from behind the Swiss goal: the low curl across Sommer into the far corner, then the pan to the celebration;
 * 4 = the lesson from a raised coaching angle behind him (face-up line, drive-inside arrow, the wedge that opens up). Every body is the
 * shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Handedness: the world is right-handed exactly like
 * athlete.ts (x toward Switzerland's goal, y up, +z = England's right = the near touchline), so strike({foot:'l'}) is Saka's LEFT foot.
 * Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is
 * seeded. Heat: small figures print at 'low', only named figures at full detail, everything capped in a passage. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.6 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Düsseldorf, Euro 2024. England are losing to Switzerland, with ten minutes left. The ball comes to Bukayo Saka on the right. He faces up his defender... cuts inside... shoots... one-one!',tail:2.4,
  cues:['Düsseldorf','England are losing','Switzerland','ten minutes','Bukayo Saka','He faces up','cuts inside','shoots','one-one']},
 {label:'Watch it again',text:'Watch again, slowly. Saka runs straight at the defender and makes him stop. Then he drives inside, and suddenly the goal opens up.',tail:1.6,
  cues:['Watch again','runs straight','makes him stop','drives inside','the goal opens up']},
 {label:'Into the corner',text:"He shoots low, across the keeper, into the far corner. Yann Sommer can't reach it. Five minutes after Switzerland scored, it's one-one!",tail:2.2,
  cues:['He shoots low','across the keeper','far corner','Yann Sommer',"can't reach it",'Five minutes']},
 {label:'Your turn',text:'Your turn: face up your defender, then drive inside to open up the shot.',tail:1.8,
  cues:['Your turn','face up','drive inside','open up the shot']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py saka-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/saka-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/saka-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('saka: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('saka: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
const frame=(s:Sheet)=>{LENS=Math.pow(Math.min(1,s.W/1620),.45);return view(s,cam(s,0,0,1));};

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (England attack +X; Switzerland's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main camera = England's right, Saka's wing). */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units, scaled by the window's LENS); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F0:number):Cam{const F=F0*LENS,f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
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
const addPoly=(p:Path2D,q:Pt[])=>{if(q.length>2)p.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;

// ---------------------------------------------------------------- the Merkur Spiel-Arena on a July evening (an enclosed two-tier bowl under a roof)
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z), 1 behind England's own goal (x < 0), 2 the main stand (+z, the camera
 * side), 3 behind Switzerland's goal (x > 105). Closed corners, one tier break each (inferred). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-12-28*b,117+28*b,a),.2+28*b,-40-30*b],
 (a,b)=>[-10-28*b,.2+26*b,lerp(42+30*b,-42-30*b,a)],
 (a,b)=>[lerp(117+28*b,-12-28*b,a),.2+28*b,40+30*b],
 (a,b)=>[115+28*b,.2+26*b,lerp(-42-30*b,42+30*b,a)],
];
const STAND_COLS=[110,70,110,70],STAND_ROWS=[13,12,13,12],TIERS=[[.5],[.5],[.5],[.5]];
/** flags along the stand fronts: [stand, a, b, 0 = an England flag (paper, red cross) | 1 = a Swiss flag (red, paper cross)] */
const FLAGS:[number,number,number,number][]=[[0,.2,.12,0],[0,.36,.58,0],[0,.52,.2,1],[0,.7,.6,0],[0,.86,.14,1],[1,.3,.2,0],[1,.6,.55,0],[3,.25,.18,1],[3,.5,.6,1],[3,.75,.25,0],[2,.3,.15,0],[2,.66,.2,1]];
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // a warm summer-evening wash under the roof
 const all=rectPath(-1e4,-1e4,2e4,2e4);s.tone(B,all,.2);s.tone(Y,all,.12);
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i])seg3(c,S(0,b),S(1,b),1.3,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.6),[0,13,0]),add3(S(0,.6),[0,13,0])]));
  seg3(c,add3(S(0,.6),[0,12.8,0]),add3(S(1,.6),[0,12.8,0]),.6,edge);}
 // dark seats under the crowd (inferred), paper tier fascias
 s.knockout(planes);s.tone(K,planes,.5);s.tone(R,planes,.18);s.knockout(tier,.8);
 // the crowd: England white, red and navy; Switzerland red at the far end (inferred); the roar lifts the England rows
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,23);if(h<.18)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.4,16),swiss=si===3,lift=roar>0&&!swiss?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=swiss?(h<.7?1:h<.85?0:2):h<.5?0:h<.8?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.fill(R,inks[1],.95);s.fill(K,inks[2],.85);
 s.knockout(roof);s.fill(K,roof,.88);s.tone(B,roof,.2);s.knockout(edge,.85);
 const fl=new Path2D(),red=new Path2D(),crossE=new Path2D(),crossS=new Path2D();
 for(const[si,a,b0,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.034,hb=.06,P=(u:number,bb:number)=>S(a+u*w,b0+bb*hb);
  const q=polyP(c,[P(0,0),P(1,0),P(1,1),P(0,1)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));if(kind===1)red.addPath(polyPath(q,true));
  // the cross: England's runs edge to edge (St George), Switzerland's is a short square cross in the middle
  const cr=kind===1?crossS:crossE,e=kind===1?.25:0;
  addPoly(cr,polyP(c,[P(e,.4),P(1-e,.4),P(1-e,.6),P(e,.6)]));addPoly(cr,polyP(c,[P(.42,e*.9),P(.58,e*.9),P(.58,1-e*.9),P(.42,1-e*.9)]));}
 s.knockout(fl);s.fill(R,red,.95);s.fill(R,crossE,.95);s.knockout(crossS);s.stroke(K,fl,1.4,.6);
}
/** the grass surround, grass with mowing stripes, navy LED boards with paper and red panels, paper lines, both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sr=polyP(c,[[-12,0,-40],[117,0,-40],[117,0,40],[-12,0,40]]);if(sr.length<3)return;const srp=polyPath(sr,true);s.knockout(srp);s.fill(Y,srp,.8);s.tone(B,srp,.85);
 const g=polyP(c,[[-3,0,-36.5],[108,0,-36.5],[108,0,36.5],[-3,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D(),rp=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([-4,0,-38],[109,0,-38]);board([109,0,-37],[109,0,37]);board([-4,0,37],[-4,0,-37]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(k%3===1?rp:pn,polyP(c,[[x,.25,-37.95],[x+3.4,.25,-37.95],[x+3.4,.68,-37.95],[x,.68,-37.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%3===1?rp:pn,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.68,z+3.4],[108.95,.68,z]]));}
 s.knockout(bd);s.fill(K,bd,.88);s.knockout(pn,.85);s.fill(R,rp,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.1,0,TAU,6);}
 circ(105,-34,1,Math.PI/2,Math.PI,4);circ(105,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);addPoly(flag,polyP(c,[[105,1.55,z],[105,1.2,z],[104.55,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-3);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz, low (the ball went in along the ground) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(1-.6*y/1.9));
 const zs=[z0,-2.6,-1.3,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.025,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.72);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** England Euro 2024 home v Switzerland (UEFA tactical line-ups): white shirts, NAVY shorts, white socks; navy trim and numbers */
const ENG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.85],numberInk:K,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Switzerland Euro 2024 home (UEFA tactical line-ups): red shirts, dark-red shorts, red socks; paper trim and numbers (inferred) */
const SUI=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:[R,1],socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.82,bulk:1},...o});
/** Bukayo Saka, number 7 (confirmed), naturally left-footed (confirmed trait); short hair */
const SAKA_ST=ENG({number:7,skin:SKIN_D,hairStyle:'short',build:{height:1.78,bulk:.98,thighs:1.04},seed:7});
/** Yann Sommer, number 1: keeper kit inferred (drawn yellow) */
const SOM_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.83},seed:1};
const REF:AthleteStyle={shirt:[K,.88],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'bald',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Saka's first touch)
type Role='sak'|'eng'|'sui'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a strike (contact at `at`) */
type Move={kind:'lunge'|'dive'|'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]; the confirmed beats (cut in from the right, low shot to the far corner) set
 * the shape, every spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Saka',role:'sak',style:SAKA_ST,key:true,keys:[[-6,79.2,27.4],[-4,80.6,25.4],[-2.2,82,23],[-1,82.9,21.8],[-.25,83.3,21.3],[0,83.4,21.2],[.5,84.2,20.7],[1,85.1,20],[1.4,85.7,19.5],[1.75,86.1,19.25],[2.05,86.5,18.6],[2.35,87.1,17],[2.65,87.8,15.1],[2.95,88.4,13.4],[3.1,88.6,12.9],[3.5,89.2,12.6],[4.3,90.2,14.4],[5.2,91.8,17.8],[6.2,93.4,21.2],[7,94.2,22.6],[9,94.4,23]]},
 {name:'England midfielder (the pass)',role:'eng',style:ENG({number:null,skin:SKIN_M,seed:61}),key:true,moves:[{kind:'strike',at:-1.25,dur:.8,side:'r',power:.45}],keys:[[-6,72.5,12],[-3,74.4,12.6],[-2,75.2,12.9],[-1.25,75.8,13.1],[0,76.6,13.4],[3,80,14.5],[9,86,12]]},
 {name:'Kane',role:'eng',style:ENG({number:9,build:{height:1.88,bulk:1.04},seed:9}),keys:[[-6,96,4],[0,96.8,2.6],[2.6,97.6,.8],[4,97.8,1.4],[9,96,6]]},
 {name:'Bellingham',role:'eng',style:ENG({number:10,skin:SKIN_D,build:{height:1.86},seed:10}),keys:[[-6,90,-4],[0,92,-4.6],[2.6,94.6,-5.2],[4.2,95,-3],[9,94,6]]},
 {name:'Foden',role:'eng',style:ENG({number:11,build:{height:1.71},seed:11}),keys:[[-6,86,-15],[0,88.6,-13.4],[3,91.6,-11.6],[9,93,-4]]},
 {name:'England midfielder',role:'eng',style:ENG({number:null,seed:63}),keys:[[-6,66,0],[0,68,1],[9,74,4]]},
 {name:'Rodriguez',role:'sui',style:SUI({number:13,seed:13,build:{height:1.8,bulk:1.02}}),key:true,engage:[-1.2,3.2],moves:[{kind:'lunge',at:2.42,dur:.72,side:'r'}],keys:[[-6,92.4,15.4],[-3,91.2,16.8],[-1,90.2,18.2],[0,89.7,18.8],[.6,89.1,19],[1.2,88.6,19],[1.5,88.4,18.9],[1.9,88.35,18.8],[2.3,88.5,18.2],[2.7,88.9,17],[3.2,89.4,15.6],[9,91,14.6]]},
 {name:'Xhaka',role:'sui',style:SUI({number:10,hair:[K,.8],seed:14,build:{height:1.86,bulk:1.04}}),key:true,engage:[.5,3.3],keys:[[-6,82,7.2],[-2,83.4,8.8],[0,84.4,9.8],[1.5,85.6,11.2],[2.6,86.8,12.2],[3.1,87.2,12],[9,88,10]]},
 {name:'Akanji',role:'sui',style:SUI({number:5,skin:SKIN_D,seed:15,build:{height:1.87}}),key:true,engage:[1,3.2],keys:[[-6,96.4,6],[0,95.6,5.8],[2,94.6,6.4],[3,94.2,6.8],[9,95,6]]},
 {name:'Schär',role:'sui',style:SUI({number:22,seed:16,build:{height:1.86}}),keys:[[-6,97,-3],[0,96.6,-3.4],[3,96.4,-2.2],[9,97,-2]]},
 {name:'Widmer',role:'sui',style:SUI({number:3,seed:17}),keys:[[-6,93,-15],[0,94.6,-13.6],[3,95.6,-11],[9,96,-9]]},
 {name:'Freuler',role:'sui',style:SUI({number:8,seed:18}),keys:[[-6,80,-2],[0,82,0],[3,85,3],[9,88,4]]},
 {name:'Aebischer',role:'sui',style:SUI({number:20,seed:19}),keys:[[-6,74.5,21],[-2,77.4,21.6],[0,79.4,21.4],[2,82.6,19.6],[3,84,18.2],[9,87,16]]},
 {name:'Sommer',role:'gk',style:SOM_ST,key:true,moves:[{kind:'dive',at:3.62,dur:.95,side:'r'}],keys:[[-6,103.4,3.4],[0,103.4,3.6],[2,103.3,2.6],[3,103.2,1.8],[9,103.2,1.8]]},
 {name:'referee',role:'ref',style:REF,keys:[[-6,70,6],[0,74,8],[9,80,9]]},
];
const SAK=0,PAS=1,ROD=6,XHA=7,AKA=8,SOM=13;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6.5,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the pass, the face-up touches, the drive inside, the low curl
const PASS=-1.25,SHOT=3.1,IN_NET=SHOT+.78;
/** touches (left foot): receive, two carrying at the defender, the feint outside, the drive inside, one more, the shot (inferred count) */
const TOUCHES=[0,.7,1.4,2.05,2.6,SHOT];
/** where the shot goes in: low, just inside the far (left) post */
const GOALPT:V3=[105,.32,-3.02],NET:V3=[106.6,.3,-3.3],REST:V3=[106.2,.11,-2.9];
/** Saka's heading: facing the pass to receive, then along his run; square to the shot; then free */
function yawSak(tau:number):number{
 const v=velOf(SAK,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):yawOf(1,-.3);
 if(tau<.4){const g=posOf(PAS,PASS),m=posOf(SAK,tau),face=yawOf(g[0]-m[0],g[1]-m[1]);return lerpA(face,head,sm(-.3,.4,tau,easeInOutSine));}
 const w=sm(SHOT-.7,SHOT-.2,tau)*(1-sm(SHOT+.5,SHOT+1.1,tau));return lerpA(head,SHOT_YAW,w);
}
/** his forward and right directions on the ground (x, z) */
const fwdR=(y:number):[Pt,Pt]=>[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];
/** ball spot for the LEFT foot: ahead and a touch to his left */
function footAt(tau:number,yaw=yawSak(tau)):[number,number]{const p=posOf(SAK,tau),[f,r]=fwdR(yaw);return[p[0]+f[0]*.55-r[0]*.14,p[1]+f[1]*.55-r[1]*.14];}
/** the shot: a quadratic curve on the ground starting LEFT of the target (aimed outside the far post) and bending back right — a
 * left-footer's inside-foot curl — kept low, a little above knee height mid-flight, and in at the bottom corner */
const SHOT_YAW=(()=>{const p=posOf(SAK,SHOT),dx=GOALPT[0]-p[0],dz=GOALPT[2]-p[1],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l;return yawOf(dx/l-rx*.25,dz/l-rz*.25);})();
const TP=TOUCHES.map(T=>footAt(T));
const S0=TP[TP.length-1];
const CURL:[Pt,Pt,Pt]=(()=>{const dx=GOALPT[0]-S0[0],dz=GOALPT[2]-S0[1],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l,k=.14*l;return[[S0[0],S0[1]],[(S0[0]+GOALPT[0])/2-rx*k,(S0[1]+GOALPT[2])/2-rz*k],[GOALPT[0],GOALPT[2]]];})();
function curlAt(u:number):V3{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*CURL[0][0]+b*CURL[1][0]+c*CURL[2][0],.12+(GOALPT[1]-.12)*u+.38*Math.sin(Math.PI*u),a*CURL[0][1]+b*CURL[1][1]+c*CURL[2][1]];}
/** the pass: from the midfielder's right boot to Saka's feet */
const GP=():[number,number]=>{const g=posOf(PAS,PASS);return[g[0]+.5,g[1]+.3];};
function ballAt(tau:number):V3{
 if(tau<-2.4){const u=clamp((tau+6)/3.6),e=1-Math.pow(1-u,1.6),g=posOf(PAS,-2.4);return[lerp(66.5,g[0]+.5,e),.11,lerp(1.5,g[1]+.2,e)];}// worked across to him
 if(tau<PASS){const u=(tau+2.4)/(PASS+2.4),a=posOf(PAS,-2.4),b=GP(),e=1-Math.pow(1-u,1.8);return[lerp(a[0]+.5,b[0],e),.11,lerp(a[1]+.2,b[1],e)];}
 if(tau<0){const u=(tau-PASS)/-PASS,a=GP(),b=TP[0],e=1-Math.pow(1-u,1.3);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-Math.pow(1-u,2.4);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<IN_NET)return curlAt((tau-SHOT)/(IN_NET-SHOT));
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOALPT,NET,u);
 const w=clamp((tau-IN_NET-.2)/.5);return[lerp(NET[0],REST[0],w),lerp(NET[1],REST[1],w),lerp(NET[2],REST[2],w)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** a defender's ready stance: side-on-ish, low, knees bent, arms out for balance */
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the defender STOPS: feet planted wide, low, weight back, eyes on the ball (the face-up has frozen him) */
const SET_D=posed({lHipF:40,rHipF:36,lKnee:62,rKnee:58,lHipA:16,rHipA:16,lean:22,pitch:4,lShA:34,rShA:34,lShF:16,rShF:16,lElb:48,rElb:48,neckP:14,squash:-.04});
/** showing for the pass: knees soft, arms out, eyes on the ball */
const RECEIVE:Partial<Pose>={lean:10,lHipF:24,lKnee:34,rHipF:20,rKnee:30,lShA:40,rShA:46,lElb:40,rElb:36,neckP:22};
/** facing up: square to the defender, head up, the ball under the left foot, arms loose */
const FACE:Partial<Pose>={lean:14,neckP:-4,lShA:30,rShA:34,lElb:48,rElb:48};
/** a carrying touch: the left leg reaches forward, laces meet the ball, a glance down */
const PUSH_L:Partial<Pose>={lHipF:40,lKnee:24,lAnk:30,lHipR:-8,neckP:18};
/** the feint outside: body dipped to his right (toward the touchline), right shoulder dropped */
const FEINT:Partial<Pose>={roll:10,bend:12,lean:18,rKnee:58,lKnee:36,rHipA:18,lShA:52,rShA:18,neckY:12,squash:-.04};
/** the drive inside: the left foot drags it across (to his left), body dipped left, right arm up for balance */
const CUTIN:Partial<Pose>={roll:-12,bend:-12,lean:22,lHipA:26,lHipF:30,lKnee:34,lAnk:18,lHipR:-20,rKnee:52,rShA:78,rShF:18,rElb:40,lShA:30,neckY:-12,squash:-.05};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(SAK,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]-.4&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0]-.4,a.engage[0],tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 // the keeper tracks the ball, then is set square to the shot (a dive's direction is fixed at the set: his right = −z, the far post)
 if(a.role==='gk')yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(-1,.35),sm(SHOT-.4,SHOT,tau));
 if(k===SAK)yaw=yawSak(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='sui'?READY:stand();
 if(sp>.5&&along<-.35*sp&&k!==SAK)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5),cyc=k===SAK?3.1:3.4;p=blendPose(idle,runCycle(distOf(k,tau)/cyc,{speed:s}),clamp((sp-.4)/.9));}
 // Rodríguez stops and sets as Saka faces him up
 if(k===ROD)p=blendPose(p,SET_D,sm(1.1,1.5,tau)*(1-sm(2.1,2.3,tau)));
 for(const mv of a.moves??[]){const lead=mv.kind==='dive'?.55:mv.kind==='strike'?.52:.6,t0=mv.at-lead*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.05});
  if(mv.kind==='strike'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===SAK){
  p=over(p,RECEIVE,sm(-2.4,-1.4,tau)*(1-sm(-.3,.05,tau)));
  p=over(p,FACE,sm(.2,.7,tau)*(1-sm(1.8,2.1,tau)));
  for(const T of TOUCHES)if(T>.3&&T<2&&Math.abs(tau-T)<.2)p=over(p,PUSH_L,bump(T-.2,T+.12,tau));
  p=over(p,FEINT,bump(1.72,2.12,tau));
  p=over(p,CUTIN,bump(2.02,2.72,tau));
  const D=.82,st=SHOT-.52*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.75}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau)*(1-sm(6.6,7,tau)));
  if(tau>6.6)p=blendPose(p,celebrate((tau-6.6)*.9,{kind:'arms'}),sm(6.6,7,tau));
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: white with navy panels (inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:5});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;full?:number[]}={}):PlayOut{
 const{minBall=6,hero=false,full}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // soft ground shadows under the roof lights, batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.38);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===SAK?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===SAK||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===SAK}:{});
  if(e.k===SAK)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ground ring (ellipse on the grass) in an ink */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rad:number,ink:string,w:number,seed=41){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*rad*1.1,0,z+Math.sin(i/36*TAU)*rad]);if(q)pts.push(q);}if(pts.length<28)return;
 const q=toCam(c,[x,0,z]),rr=ribbon(pts,Math.max(5,c.F*.08/q[2]),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** the shooting angle: a wedge on the grass from the ball to both posts — narrow out wide, wide once he has driven inside */
function angleWedge(s:Sheet,c:Cam,from:[number,number],w:number,ink=Y){if(w<=0)return;
 const a=pr(c,[from[0],0,from[1]]),p1=pr(c,[105,0,-3.66]),p2=pr(c,[105,0,3.66]);if(!a||!p1||!p2)return;
 const wedge=polyPath([a,p1,p2],true);s.knockout(wedge,.35*w);s.tone(ink,wedge,.55*w);
 const q=toCam(c,[from[0],0,from[1]]),lw=Math.max(3,c.F*.05/q[2]);s.fill(ink,ribbon([a,p1],lw,{seed:91,taper:.3,wobble:.6}),.95*w);s.fill(ink,ribbon([a,p2],lw,{seed:92,taper:.3,wobble:.6}),.95*w);}
/** face up: a yellow dashed line on the grass straight from Saka to his defender, arrowhead at the defender */
function faceLine(s:Sheet,c:Cam,tau:number,w:number,prog=1){if(w<=0)return;
 const m=posOf(SAK,tau),d=posOf(ROD,tau),dx=d[0]-m[0],dz=d[1]-m[1],l=Math.hypot(dx,dz)||1,pts:Pt[]=[];
 for(let i=0;i<=12;i++){const u=lerp(.1,Math.max(.12,1-.7/l),i/12),q=pr(c,[m[0]+dx*u,0,m[1]+dz*u]);if(q)pts.push(q);}if(pts.length<4)return;
 const sub=partial(pts,clamp(prog)),q=toCam(c,[m[0]+dx*.5,0,m[1]+dz*.5]),wd=Math.max(4,c.F*.1/q[2]);
 s.knockout(ribbon(sub,wd*1.5,{seed:51,taper:.1,wobble:.6}),.7*w);s.fill(Y,ribbon(sub,wd,{seed:52,taper:.1,wobble:.6,gaps:[[.2,.28],[.45,.53],[.7,.78]]}),.95*w);
 if(sub.length>2&&prog>.3){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,Y,pv,e,wd,{seed:53,head:wd*3,cov:.95*w});}}
/** the drive inside: a red path on the grass tracing his run from the face-up to the shot, arrowhead at the end */
function cutArrow(s:Sheet,c:Cam,w:number,prog=1,a0=1.7,a1=SHOT-.05){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=24;i++){const tau=lerp(a0,a1,i/24),m=posOf(SAK,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(SAK,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.13/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed:61,taper:.1,wobble:.8}),.7*w);s.fill(R,ribbon(sub,wd,{seed:62,taper:.1,wobble:.8,gaps:[[.18,.24],[.42,.48],[.66,.72]]}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,R,pv,e,wd,{seed:63,head:wd*3.2,cov:.95*w});}}
/** the curl: a yellow dashed trail just above the grass along the ball's path, from the boot to where it is now (or all of it) */
function curlTrail(s:Sheet,c:Cam,tau:number,w:number,full=false){if(w<=0)return;const end=full?1:clamp((tau-SHOT)/(IN_NET-SHOT));if(end<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=28;i++){const q=pr(c,curlAt(end*i/28));if(q)pts.push(q);}if(pts.length<4)return;const q=toCam(c,curlAt(end*.5)),wd=Math.max(4,c.F*.09/q[2]);
 s.knockout(ribbon(pts,wd*1.5,{seed:71,taper:.4,wobble:.6}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:72,taper:.4,wobble:.6,gaps:[[.12,.18],[.3,.36],[.48,.54],[.66,.72],[.84,.9]]}),.95*w);}
/** the far bottom corner: a ring in the goal mouth where the ball goes in */
function cornerRing(s:Sheet,c:Cam,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<30;i++){const a=i/30*TAU,q=pr(c,[105,.42+Math.sin(a)*.36,GOALPT[2]+Math.cos(a)*.48]);if(q)pts.push(q);}if(pts.length<20)return;
 const q=toCam(c,[105,.42,GOALPT[2]]),rr=ribbon(pts,Math.max(4,c.F*.07/q[2]),{close:true,seed:77,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'one-one');return key(t,mono([[0,-5.6],[CUE(0,'Bukayo'),-.35],[CUE(0,'He faces'),.25],[CUE(0,'cuts inside'),2.1],[CUE(0,'shoots'),SHOT-.05],[G,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[70,22,70];
function cam1(t:number):Cam{
 const G=CUE(0,'one-one'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,SHOT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[84,3,6],m=posOf(SAK,tau),cel:V3=[m[0]-.5,1,m[1]];
 const toBall=sm(CUE(0,'England are'),CUE(0,'ten minutes')+.3,t,easeInOutSine),toS=sm(G+.5,G+1.6,t,easeInOutSine),toGoal=sm(CUE(0,'cuts inside'),CUE(0,'shoots'),t,easeInOutSine)*(1-toS);
 const tb:V3=[lerp(open[0],bt[0]+3+3*toGoal,toBall),lerp(open[1],1.4,toBall),lerp(open[2],lerp(bt[2],4,.25+.25*toGoal),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,2100],[CUE(0,'Switzerland'),2500],[CUE(0,'ten minutes'),3400],[CUE(0,'Bukayo'),4300],[CUE(0,'He faces'),4800],[CUE(0,'cuts inside'),4700],[G,4900],[G+1.6,6600],[S,7000]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'one-one');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(SAK,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera behind Saka's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-.7],[CUE(1,'runs straight'),.15],[CUE(1,'makes him stop'),1.3],[CUE(1,'drives inside'),2.02],[CUE(1,'the goal opens'),2.85],[SECS(1),3.02]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(SAK,Math.min(tau,2.9)),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUE(1,'the goal opens')-.4,CUE(1,'the goal opens')+.5,t,easeInOutSine);
 const C:V3=[m[0]-4.2-1.5*open-1.2*wide,1.6+.4*open+.9*wide,m[1]+6.8+1.5*open+1.4*wide],T:V3=[lerp(m[0]+3,100.5,wide*.8),lerp(.95,1.1,wide),lerp(m[1]-1.4,2.5,wide*.8)];
 return look(C,T,lerp(2600-300*open,2100,wide));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),rs=CUE(1,'runs straight'),ms=CUE(1,'makes him stop'),di=CUE(1,'drives inside'),go=CUE(1,'the goal opens'),E=SECS(1);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  // "runs straight at the defender": the narrow angle from out wide, and a dashed line straight at him
  const st=sm(rs-.1,rs+.4,t)*(1-sm(di-.1,di+.4,t));angleWedge(s,c,[ballAt(Math.min(tau,1.6))[0],ballAt(Math.min(tau,1.6))[2]],st*.7,R);
  faceLine(s,c,Math.min(tau,1.9),st,sm(rs-.1,rs+.9,t));
  // "makes him stop": a navy ring round the defender's planted feet
  groundRing(s,c,...posOf(ROD,Math.min(tau,2.1)),.85,K,sm(ms-.15,ms+.3,t,easeOutBack)*(1-sm(di+.2,di+.6,t)),44);
  // "drives inside": the path of the run across the box edge
  cutArrow(s,c,sm(di-.2,di+.2,t)*(1-sm(E-.7,E-.3,t)),sm(di-.2,di+1,t),1.7,Math.min(SHOT-.05,Math.max(1.8,tau)));
  // "the goal opens up": the wedge from the ball, now wide
  angleWedge(s,c,[ballAt(Math.min(tau,SHOT))[0],ballAt(Math.min(tau,SHOT))[2]],sm(go-.15,go+.45,t,easeOutBack)*(1-sm(E-.5,E-.2,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[SAK,ROD,XHA,AKA,SOM]});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(SAK,tau2(t)),q=toCam(c,[m[0],1.4,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the Swiss goal: the low curl, the far corner, Sommer, the celebration
const tau3=(t:number)=>{const fm=CUE(2,'Five minutes');return key(t,mono([[0,SHOT-.5],[CUE(2,'He shoots'),SHOT-.1],[CUE(2,'across'),SHOT+.32],[CUE(2,'far corner'),IN_NET-.06],[CUE(2,'Yann'),IN_NET+.14],[CUE(2,"can't"),IN_NET+.5],[fm,5.8],[SECS(2),5.8+(SECS(2)-fm)*.8]]),linear);};
const swing3=(t:number)=>sm(CUE(2,"can't")+.2,CUE(2,'Five minutes')+.3,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),C:V3=[117.5,4.6+.8*u,-7.8+2*u],e=sm(SHOT-.3,IN_NET,tau,easeInOutSine);
 const m=smooth(SAK,Math.min(tau,7.2)),T0:V3=[lerp(94,101.5,e),lerp(1,.9,e),lerp(9,-.6,e)],T1:V3=[m[0]-.3,1.1,m[1]-.5];
 return look(C,lerp3(T0,T1,u),lerp(lerp(3900,3700,e),6200,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),hs=CUE(2,'He shoots'),ak=CUE(2,'across'),fc=CUE(2,'far corner'),ys=CUE(2,'Yann'),fm=CUE(2,'Five minutes'),u=swing3(t);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  // "across the keeper": a navy ring under Sommer, then under him again as he dives
  groundRing(s,c,...posOf(SOM,Math.min(tau,SHOT)),.8,K,sm(ak-.15,ak+.3,t,easeOutBack)*(1-sm(fc+.2,fc+.6,t))+sm(ys-.15,ys+.3,t,easeOutBack)*(1-sm(fm-.4,fm,t)),45);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[SAK,ROD,AKA,SOM],after:()=>{
   curlTrail(s,c,tau,sm(hs-.1,hs+.2,t)*(1-sm(fm-.3,fm+.1,t)));}});
  if(u<.5){goal3(s,c,105,1,bulgeAt(tau),GOALPT[2]);cornerRing(s,c,sm(fc-.15,fc+.3,t,easeOutBack)*(1-sm(fm-.3,fm+.1,t)));}
  // "Five minutes after Switzerland scored, it's one-one!": a yellow burst over the celebration
  const pw=sm(fm-.1,fm+.4,t);if(pw>0){const m=posOf(SAK,tau),q=pr(c,[m[0],2.6,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.4/toCam(c,[m[0],2.6,m[1]])[2],{n:10,seed:88,g:easeOutBack(pw),width:12,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(SAK,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle behind him, the whole move marked out
const tau4=(t:number)=>key(t,mono([[0,-.3],[CUE(3,'Your'),-.1],[CUE(3,'face up'),.7],[CUE(3,'drive inside'),1.95],[CUE(3,'open up'),SHOT+.02],[SECS(3),IN_NET+.3]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),orbit=sm(CUE(3,'open up')-.5,CUE(3,'open up')+.6,t,easeInOutSine),m=smooth(SAK,Math.min(tau,SHOT));
 const C:V3=[lerp(79.5,82,orbit),lerp(6.6,6.4,orbit),lerp(30,27,orbit)],T:V3=[lerp(m[0]+4,97,orbit*.7),.2,lerp(m[1]-2.5,4,orbit*.7)];
 return look(C,T,lerp(2700,2450,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your'),fu=CUE(3,'face up'),di=CUE(3,'drive inside'),ou=CUE(3,'open up'),E=SECS(3);
  stadium(s,c,v,t,[0,3]);
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2]});
  groundRing(s,c,TP[0][0],TP[0][1],.8,R,sm(yt,yt+.4,t,easeOutBack)*(1-sm(E-.6,E-.3,t)),42);
  faceLine(s,c,Math.min(tau,1.9),sm(fu-.15,fu+.3,t)*(1-sm(di+.3,di+.8,t)),sm(fu-.1,fu+.8,t));
  groundRing(s,c,...posOf(ROD,Math.min(tau,2.1)),.85,K,sm(fu+.3,fu+.7,t,easeOutBack)*(1-sm(di+.3,di+.8,t)),44);
  cutArrow(s,c,sm(di-.2,di+.2,t)*(1-sm(E-.6,E-.3,t)),sm(di-.1,di+1.1,t));
  angleWedge(s,c,S0,sm(ou-.1,ou+.4,t,easeOutBack)*(1-sm(E-.5,E-.2,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[SAK,ROD,XHA,SOM],after:()=>{
   curlTrail(s,c,tau,sm(ou+.1,ou+.4,t)*(1-sm(E-.6,E-.3,t)));}});
  cornerRing(s,c,sm(ou+.4,ou+.8,t,easeOutBack)*(1-sm(E-.5,E-.2,t)));
 },
 still:2.6,
};

const film:RisoStory={
 id:'saka-signature',format:'11v11',title:"Saka's cut inside",theme:'Face up your defender, then drive inside to open up the shot',
 ageNote:'UEFA Euro 2024 quarter-final, England 1–1 Switzerland (England won 5–3 on penalties), Düsseldorf, 6 July 2024. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf kick: grass bits and paper flecks thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size;(i%3?a:b).addPath(polyPath([[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]],true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
