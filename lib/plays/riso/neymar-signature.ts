/** Neymar, "Signature: the skill that beats a defender": his Puskás Award goal for Santos v Flamengo, Campeonato Brasileiro round 12,
 * Estádio Urbano Caldeira (Vila Belmiro), Santos, Wednesday 27 July 2011, 21:50 local (Santos 4–5 Flamengo). The goal made it 3–0 on 25
 * minutes. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot watch the footage),
 * printed as a riso sheet.
 *
 * WHY THIS MOMENT: iconicPlays.json lists Neymar as a SIGNATURE (a skill that beats a defender, lesson "practise one trick until it's
 * automatic, then use it when a defender is close"). This goal is the best-documented example of it: the accounts name every defender he
 * beat and the trick he used on the last one (a "drible da vaca": ball past one side of the defender, run round the other side), and it
 * won FIFA's Puskás Award 2011. NOTE: the JSON params say trick "elastico"; the real move in this goal was the drible da vaca, so the film
 * shows (and names) the drible da vaca and never claims an elastico.
 *
 * SOURCES (cached under scratchpad/films/src-cache/):
 *  - Wikipedia (pt), "Santos 4–5 Flamengo (2011)" (raw wikitext): date, venue, kick-off, attendance 12,968, referee, both line-ups with
 *    shirt numbers, goal minutes (Neymar 25'), the kit boxes (Santos all white "_santos1112H"; Flamengo "_fla11H" home shirt), and "Neymar
 *    marcou o terceiro ... após deixar dois marcadores para trás, tabelar com Borges e aplicar um drible memorável no zagueiro Ronaldo
 *    Angelim". https://pt.wikipedia.org/wiki/Santos_4%E2%80%935_Flamengo_(2011)
 *  - UOL, Gabriel Carneiro, "Gol Puskas de Neymar foi há 9 anos: onde estão os personagens do lance?" (27/07/2020, via web.archive.org):
 *    the move beat by beat — Rafael restarts, Léo stops a clearance and gives it to Ibson on Santos's LEFT, Ibson to Neymar "cercado por
 *    Luiz Antônio e Léo Moura, quase na linha lateral"; he carries it INTO THE MIDDLE with a baffling dribble, Léo Moura mistimes and is
 *    left behind; Willians runs beside him "ao longo de alguns metros" and can't catch him; Neymar plays it HARD to Borges (further ahead,
 *    outside the box), Borges shields it from centre-back Welinton and returns it FIRST TIME; Angelim steps in front of him and takes "um
 *    drible da vaca" at the edge of the box; keeper Felipe rushes out, left-back Júnior César leaves his man and SLIDES in; "Mesmo caído,
 *    Neymar bateu na saída de Felipe e fez o gol"; Elano, on the right expecting a pass, is first to hug him; Borges follows him.
 *  - globoesporte.com, "Gol de Neymar contra o Flamengo concorre ao Prêmio Puskas da Fifa" (18/11/2011, via web.archive.org): "recebeu a
 *    bola no lado esquerdo, próximo ao meio-campo, se livrou de dois marcadores, tabelou com Borges e ainda deu um drible desconcertante no
 *    zagueiro Ronaldo Angelim até tocar para o fundo das redes."
 *  - Wikipedia (en), "FIFA Puskás Award" 2011 table (Neymar, Santos v Flamengo, 3–0, 2011 Campeonato Brasileiro Série A, winner).
 * CONFIRMED by those accounts: match, date, venue, night kick-off (21:50), minute (25'), score after it (3–0), Neymar's number 11, the
 * pass chain Léo → Ibson → Neymar on the left near halfway by the touchline; the two markers (Luiz Antônio, Léo Moura) beaten by carrying
 * it inside; Willians chasing alongside; the hard pass to Borges outside the box, Borges shielding from Welinton, first-time return; the
 * drible da vaca on Ronaldo Angelim at the edge of the box; Felipe rushing out; Júnior César's slide; the finish while falling, past Felipe
 * as he came out; Elano (from the right) first to celebrate, then Borges. Santos all white (kit box); Flamengo in the home red-and-black
 * hooped shirt (kit box "_fla11H").
 * INFERRED (illustrative): every position and timing between those beats; the direction of play on screen and which touchline was under
 * the main camera (the film puts Santos's left wing on the near side); which of Neymar's feet made each touch and the shot (right foot,
 * his stronger foot — not stated in the sources, so the narration never names the foot); which side of Angelim the ball went and which
 * side Neymar ran (ball to Angelim's left, Neymar round his right); where exactly the shot went in; Felipe's smother dive; how he fell;
 * the other players' spots; Flamengo's white shorts and red socks, Felipe's grey kit and gloves, the referee's black kit; Neymar's 2011
 * mohawk (a well-known look, drawn small); the Vila Belmiro drawn as a compact floodlit ground (low stands close to the pitch, four
 * corner floodlight masts), the crowd colours, the boards, the ball print; all camera placements.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, panning with the ball; 2 = slow-motion replay from a low touchline camera on the trick itself (the ball's path and Neymar's path
 * split round Angelim, then meet again); 3 = replay from behind the goal: Júnior César's slide, the falling finish past Felipe, a swing
 * round to the celebration under the floodlights; 4 = the lesson from a low front camera (practice tally, "automatic" thread, the
 * defender-close bracket, the trick). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter,
 * drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,slideTackle,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and each chapter's `seconds`
 * are ESTIMATES (≈2.5 words/s + punctuation pauses) until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in order,
 * so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Santos against Flamengo, July 2011. Neymar gets it by the touchline. Two defenders close in. He cuts inside and races away! Pass to Borges, straight back... one defender left... goal!',tail:2,
  cues:['Santos against','July 2011','Neymar gets','Two defenders','cuts inside','races away','Pass to Borges','straight back','one defender','goal']},
 {label:'Watch the trick',text:'Watch the trick, slowly. The defender steps in front. Neymar pokes the ball past one side, runs round the other side, and picks it up!',tail:1.4,
  cues:['Watch the trick','slowly','The defender steps','pokes the ball','one side','runs round','other side','picks it up']},
 {label:'Past the keeper',text:'Even as he falls, he slides it past the keeper. It won the Puskás Award!',tail:2.2,
  cues:['Even as he falls','slides it','past the keeper','It won','Puskás Award']},
 {label:'Your turn',text:'Your turn: practise one trick again and again, until it\'s automatic. Then use it when a defender gets close!',tail:1.6,
  cues:['Your turn','practise one trick','again and again','automatic','Then use it','defender gets close']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py neymar-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/neymar-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/neymar-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the Kokoro films, ≈2.5 words/s): .19 s + .018 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.018*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('neymar: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('neymar: no cue '+w);return c.at;};
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
/** in-then-out window: rises over [a, a+ri], falls over [b-fo, b] */
const win=(a:number,b:number,t:number,ri=.3,fo=.35)=>Math.min(sm(a,a+ri,t),1-sm(b-fo,b,t));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Santos attack +X, Flamengo's goal line at 105), Y up, Z across.
 * The main stand and its camera are on the −Z side, so Santos's LEFT wing (−Z) is the near touchline and the attack runs right → left
 * on screen (inferred). A figure facing +X has its right side at +Z. */
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
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[]|null)=>{if(q&&q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the stands: near parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=12):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Vila Belmiro at night: a compact ground, low stands close to the
// pitch on all four sides, four corner floodlight masts (all stylised, inferred)
const X0=-6,X1=111,ZS=38,RISE=14,DEPTH=19;
type StandF=(a:number,b:number)=>V3;
/** stand planes (a along, b up the rake 0..1): 0 the far side (z>0), 1 behind Flamengo's goal (x>105), 2 the main stand (z<0, camera
 * side), 3 behind the other goal (x<0). */
const STANDS:StandF[]=[
 (a,b)=>[lerp(X0-DEPTH*b*.3,X1+DEPTH*b*.3,a),1.2+RISE*b,ZS+DEPTH*b],
 (a,b)=>[X1+DEPTH*b,1.2+RISE*.9*b,lerp(ZS-2,-ZS+2,a)],
 (a,b)=>[lerp(X1+DEPTH*b*.3,X0-DEPTH*b*.3,a),1.2+RISE*1.3*b,-ZS-DEPTH*b],
 (a,b)=>[X0-DEPTH*b,1.2+RISE*.9*b,lerp(-ZS+2,ZS-2,a)],
];
const COLS=[16,8,16,8];
const STANDQ:V3[][][]=STANDS.map((S,si)=>{const n=COLS[si],o:V3[][]=[];for(let i=0;i<n;i++){const a0=i/n,a1=(i+1)/n;o.push([S(a0,0),S(a1,0),S(a1,1),S(a0,1)]);}return o;});
/** the roof over the far stand (a thin paper-edged canopy on posts, inferred) */
const ROOF:V3[][]=(()=>{const o:V3[][]=[];for(let i=0;i<8;i++){const a0=i/8,a1=(i+1)/8,P=(a:number,b:number):V3=>{const p=STANDS[0](a,b);return[p[0],b>.9?RISE+6.5:RISE+4.8,p[2]];};o.push([P(a0,.25),P(a1,.25),P(a1,1),P(a0,1)]);}return o;})();
/** seats: one mark per seat group; fla = the Flamengo corner (red and black) */
const SEATS:{P:V3;h:number;fla:boolean}[]=(()=>{const o:{P:V3;h:number;fla:boolean}[]=[];
 STANDS.forEach((S,si)=>{const cols=COLS[si]*3;for(let j=0;j<7;j++){const b=.06+.13*j;for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.16)continue;
  const a=(i+.5+(hash(i+j*31+si,9)-.5)*.6)/cols;o.push({P:S(a,b),h,fla:si===3&&a>.55});}}});return o;})();
/** four corner floodlight masts (x, z): a tall column, a lamp bank facing the pitch */
const MASTS:[number,number][]=[[-14,-50],[119,-50],[-14,50],[119,50]];
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t),Bnd=1e4,passing=!!s._passage.pending;
 // a July night on the coast: navy sky, a floodlit blue haze low down
 s.field(B,.5,.6);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.5);
 const hz=pr(c,[c.C[0]+c.f[0]*1e4,c.C[1],c.C[2]+c.f[2]*1e4])?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-470]],true),.3);
 // the masts (behind the stands), their lamp banks glowing yellow
 const ms=new Path2D(),lamp=new Path2D(),glow=new Path2D(),wr=nrm3([c.r[0],0,c.r[2]]);
 for(const[x,z] of MASTS){const q=quadP(c,[[x-wr[0]*.9,0,z-wr[2]*.9],[x+wr[0]*.9,0,z+wr[2]*.9],[x+wr[0]*.5,44,z+wr[2]*.5],[x-wr[0]*.5,44,z-wr[2]*.5]],18);if(!q)continue;ms.addPath(polyPath(q,true));
  const L=quadP(c,[[x-wr[0]*4,43,z-wr[2]*4],[x+wr[0]*4,43,z+wr[2]*4],[x+wr[0]*4,49,z+wr[2]*4],[x-wr[0]*4,49,z-wr[2]*4]],18);if(L)lamp.addPath(polyPath(L,true));
  const g=pr(c,[x,46,z]);if(g&&!passing){const r=kAt(c,[x,46,z])*9;glow.addPath(polyPath(blob(g[0],g[1],r,r*.8,x+z,{amp:.06,n:18}),true));}}
 s.tone(Y,glow,.3);s.knockout(ms);s.fill(K,ms,.9);s.knockout(lamp);s.fill(Y,lamp,.95);
 // the stands: low concrete terraces (navy × blue)
 const st=new Path2D();for(const col of STANDQ)for(const q of col)addPoly(st,quadP(c,q));
 s.knockout(st);s.tone(K,st,.55);s.tone(B,st,.3);
 // the crowd: Santos white and black (paper / navy), a few yellow; the Flamengo corner red and black; the roar lifts the marks
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of SEATS){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.55/d[2],2.2,14),lift=roar>0&&!q.fla?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.fla?(q.h<.6?2:3):q.h<.55?0:q.h<.9?3:1;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(Y,inks[1],.9);s.fill(R,inks[2],.92);s.fill(K,inks[3],.9);
 // the far stand's canopy
 const rf=new Path2D(),rl=new Path2D();for(const q of ROOF){addPoly(rf,quadP(c,q));const a=toCam(c,q[0]),b=toCam(c,q[1]);if(Math.min(a[2],b[2])>14)seg3(c,q[0],q[1],.8,rl);}
 s.knockout(rf);s.tone(K,rf,.72);s.tone(B,rf,.3);s.knockout(rl,.8);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=SEATS[Math.floor(hash(i*17+T12*101,3)*SEATS.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the floodlit grass (yellow × blue) with mowing stripes, the boards, paper lines, both goals (the Flamengo goal drawn later when it is
 * in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(K,p,.5);s.tone(R,p,.2);}
 const g=polyP(c,[[-4,0,-36],[109,0,-36],[109,0,36],[-4,0,36]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.82);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-36],[(k+1)*5.25,0,-36],[(k+1)*5.25,0,36],[k*5.25,0,36]]));s.tone(K,st,.12);
 // boards: along both touchlines and behind both goals, navy with paper and red panels
 const bd=new Path2D(),pn=new Path2D(),pr2=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,[b[0],.9,b[2]],[a[0],.9,a[2]]]));
 board([-3,0,-36.5],[108,0,-36.5]);board([108,0,-35.5],[108,0,35.5]);board([-3,0,35.5],[-3,0,-35.5]);board([108,0,36.5],[-3,0,36.5]);
 for(let k=0;k<18;k++){const x=-1+k*6.1,P=(z:number)=>polyP(c,[[x,.25,z],[x+3.4,.25,z],[x+3.4,.65,z],[x,.65,z]]);addPoly(k%3?pn:pr2,P(-36.45));addPoly(k%3?pn:pr2,P(36.45));}
 for(let k=0;k<11;k++){const z=-33+k*6.2;addPoly(k%3?pn:pr2,polyP(c,[[107.95,.25,z],[107.95,.25,z+3.4],[107.95,.65,z+3.4],[107.95,.65,z]]));addPoly(pn,polyP(c,[[-2.95,.25,z],[-2.95,.25,z+3.4],[-2.95,.65,z+3.4],[-2.95,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.knockout(pr2);s.fill(R,pr2,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ (low) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=0)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2))*(1-y*.3));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1),1.9,z] as V3),[back(z0,1),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1),1.9,z],.025,mesh,.7);seg3(c,[back(z,1),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y/1.9),y,za],[back(zb,y/1.9),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0,y/1.9),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y/1.9),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.72);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.32],[R,.2]];
const SKIN_M:InkFill[]=[[Y,.4],[R,.28],[B,.06]];
const SKIN_D:InkFill[]=[[Y,.42],[R,.36],[K,.16]];
/** Santos 27 July 2011: all white (kit box "_santos1112H"): paper shirt, shorts and socks, navy (black) trim and numbers */
const SAN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:K,numberInk:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,seed:3,...o});
/** Neymar: number 11 (line-up), slim build (1.75 m), his 2011 mohawk added in the adapter (inferred look, drawn small) */
const NEY_STYLE=SAN({number:11,skin:SKIN_M,build:{height:1.75,bulk:.9,thighs:.96},seed:11});
/** Flamengo: the home red-and-black hooped shirt (kit box "_fla11H"); white shorts and red socks inferred */
const FLA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'hoops',patternInk:K,shorts:'paper',socks:R,boots:K,trim:'paper',numberInk:'paper',skin:SKIN,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** Felipe: number 1 (line-up); the grey kit and gloves inferred */
const FELIPE:AthleteStyle={shirt:[K,.42],shorts:[K,.62],socks:[K,.42],boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:Y,number:1,numberInk:'paper',build:{height:1.88},seed:41};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'balding',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs;
 * mohawk = Neymar's 2011 crest of hair, a small navy ridge over the crown once the figure is big enough to read it. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;mohawk?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.mohawk&&r.heightPx>70){const h=r.joints.head,n=r.joints.neck,f=r.joints.face,ux=h[0]-n[0],uy=h[1]-n[1],ul=Math.hypot(ux,uy)||1,rad=ul*.72,fx=f[0]-h[0],fy=f[1]-h[1],fl=Math.hypot(fx,fy);
  const U:Pt=[ux/ul,uy/ul],F:Pt=fl>1e-3?[fx/fl,fy/fl]:[0,0],P=(a:number,b:number):Pt=>[h[0]+U[0]*rad*a+F[0]*rad*b,h[1]+U[1]*rad*a+F[1]*rad*b];
  s.fill(K,ribbon([P(.62,-.72),P(1.05,-.35),P(1.16,.12),P(.98,.58)],rad*.42,{seed:111,taper:.6,wobble:.4}),.95);}
 return r;
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Neymar's first touch)
type Role='ney'|'fla'|'gk'|'san'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a slide tackle (on the ground from `at`) */
type Move={kind:'lunge'|'dive'|'slide';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The Flamengo players named in the accounts get the beats the accounts give
 * them (Luiz Antônio + Léo Moura at the touchline, Willians alongside, Welinton on Borges, Angelim, Júnior César's slide, Felipe out);
 * where exactly each stood is inferred. */
const ACTORS:Actor[]=[
 {name:'Neymar',role:'ney',style:NEY_STYLE,key:true,keys:[[-2.4,47.2,-27.6],[-1.2,48.4,-29.2],[-.4,49.2,-30.1],[0,49.6,-30.4],[.35,50.6,-30.2],[.7,51.9,-29.1],[1.05,53.4,-27.4],[1.5,55.6,-25.6],[2.1,58.8,-23.5],[2.8,62.6,-21.3],[3.5,66.4,-19.2],[4.1,69.7,-17.4],[4.6,72.6,-15.8],[5.1,75.8,-14.3],[5.6,78.9,-12.9],[6,81.2,-12],[6.35,83.1,-11.5],[6.65,84.5,-11.9],[6.95,86,-13],[7.25,87.9,-12.9],[7.55,89.5,-11.2],[7.8,90.3,-9.5],[8.05,91.2,-8.1],[8.3,92,-7.1],[8.6,92.5,-6.7],[9.6,92.6,-6.6],[10.2,91.8,-8.4],[11,90,-12],[12.5,86.5,-18.5],[14,83.5,-23]]},
 {name:'Ibson',role:'san',style:SAN({seed:21,number:7}),keys:[[-2.4,40.5,-24.5],[-1.6,41.4,-25.4],[-1,42,-25.8],[1,45,-24],[6,58,-18],[14,70,-14]]},
 {name:'Luiz Antônio',role:'fla',style:FLA({seed:31,number:38}),key:true,engage:[-1.4,1.2],moves:[{kind:'lunge',at:.45,dur:.8,side:'r'}],keys:[[-2.4,54.5,-23.5],[-1,52.3,-26.2],[0,51.6,-27.3],[.5,51.3,-27.6],[1.2,51.7,-27.2],[2.4,53.6,-25.4],[6,58,-21],[14,68,-16]]},
 {name:'Léo Moura',role:'fla',style:FLA({seed:32,number:2}),key:true,engage:[-1.4,1.6],moves:[{kind:'lunge',at:.85,dur:.85,side:'l'}],keys:[[-2.4,57,-31],[-1,54.4,-31.2],[0,53,-30.9],[.6,52.7,-30.4],[1.2,53,-29.6],[2,54.8,-27.6],[3.5,58.8,-24.5],[6,64,-21],[14,76,-17]]},
 {name:'Willians',role:'fla',style:FLA({seed:33,number:8}),key:true,engage:[1.4,4.3],keys:[[-2.4,58,-12],[0,57.4,-17.5],[1.2,56.8,-22.4],[1.8,58.6,-22],[2.5,62,-20.2],[3.2,65.6,-18.2],[3.9,68.8,-16.4],[4.5,71.2,-14.9],[5.5,74.5,-13.2],[7,78,-12],[14,84,-10]]},
 {name:'Borges',role:'san',style:SAN({seed:22,number:9,build:{height:1.8,bulk:1.05}}),key:true,keys:[[-2.4,76,-4],[2,79.5,-4.6],[4,82.2,-5.8],[4.9,82.7,-6.3],[5.4,83.4,-6.5],[6.5,86.5,-5.2],[8,91,-2.8],[9,92.5,-4.2],[9.9,92.4,-5.6],[11,90.4,-10.6],[12.5,87,-17],[14,84,-21.5]]},
 {name:'Welinton',role:'fla',style:FLA({seed:34,number:3,build:{height:1.86,bulk:1.05}}),key:true,engage:[3.8,5.6],keys:[[-2.4,86,-2],[3,85,-4],[4.5,84.2,-5.2],[4.95,83.6,-5.5],[5.5,84.2,-5.7],[7,88,-4.5],[14,92,-3]]},
 {name:'Angelim',role:'fla',style:FLA({seed:35,number:4,hairStyle:'bald',build:{height:1.84,bulk:1.06}}),key:true,engage:[5.4,7.2],moves:[{kind:'lunge',at:6.55,dur:.8,side:'l'}],keys:[[-2.4,92,-9],[3,90,-10],[5,88.4,-10.8],[6,87.4,-11.4],[6.4,87.1,-11.6],[6.9,87.2,-11.5],[7.4,88,-10.8],[8.2,90,-9],[14,91,-8]]},
 {name:'Júnior César',role:'fla',style:FLA({seed:36,number:6}),key:true,moves:[{kind:'slide',at:7.95,dur:1,side:'l'}],keys:[[-2.4,90,10],[4,93,6],[6.5,94,2.4],[7.4,93.6,-.8],[7.7,93.4,-2.4],[14,93.4,-2.4]]},
 {name:'Felipe',role:'gk',style:FELIPE,key:true,moves:[{kind:'dive',at:8.1,dur:.8,side:'r'}],keys:[[-2.4,103.6,-1],[5,103.2,-2.2],[6.8,102.2,-3],[7.4,100.4,-3.8],[7.85,98.9,-4.4],[8.1,98.4,-4.6],[14,98.4,-4.6]]},
 {name:'Elano',role:'san',style:SAN({seed:23,number:8}),keys:[[-2.4,74,16],[5,85,12],[8,92,9],[9.2,93.4,3],[10.2,92.4,-5.6],[11,90.6,-10.4],[12.5,87.2,-16.8],[14,84.4,-21.2]]},
 {name:'Ganso',role:'san',style:SAN({seed:24,number:10,build:{height:1.84}}),keys:[[-2.4,62,-4],[3,64,-3],[8,76,-2],[14,82,-8]]},
 {name:'Arouca',role:'san',style:SAN({seed:25,number:5}),keys:[[-2.4,48,-6],[6,56,-6],[14,66,-6]]},
 {name:'Renato',role:'fla',style:FLA({seed:37,number:11}),keys:[[-2.4,60,6],[6,70,2],[14,80,-2]]},
 {name:'Thiago Neves',role:'fla',style:FLA({seed:38,number:7}),keys:[[-2.4,46,4],[6,52,2],[14,62,-2]]},
 {name:'Ronaldinho',role:'fla',style:FLA({seed:39,number:10,hairStyle:'long'}),keys:[[-2.4,42,-12],[6,48,-10],[14,58,-8]]},
 {name:'referee',role:'ref',style:REF,keys:[[-2.4,56,-10],[6,74,-6],[14,86,-10]]},
];
const NEY=0,IBSON=1,WILLIANS=4,BORGES=5,ANGELIM=7,ELANO=10;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-2.4,T1=14,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Ibson's pass, the dribble, the one-two, the drible da vaca, the finish
/** beats (τ): Ibson's pass; the hard pass to Borges; Borges's first-time return; the poke past Angelim; the pick-up; the shot */
const IB_PASS=-1,PASS1=4.1,BORGES_T=4.85,RETURN_AT=5.6,VACA=6.4,PICKUP=7.72,SHOT=8.1,IN_NET=SHOT+.62;
/** his dribble stride: one right-foot touch per cycle of CYC metres (the touch lands at the gait's touchPhase) */
const CYC=2.7;
/** Neymar's facing: along his run, or at the ball when he is (almost) standing */
function yawNey(tau:number):number{const v=velOf(NEY,tau),sp=Math.hypot(v[0],v[1]);if(tau<-.1){const b=posOf(IBSON,IB_PASS),m=posOf(NEY,tau);return yawOf(b[0]-m[0],b[1]-m[1]);}
 if(tau>SHOT+.1&&tau<9.8)return yawOf(105-posOf(NEY,tau)[0],1-posOf(NEY,tau)[1]);return sp>.4?yawOf(v[0],v[1]):0;}
/** his forward and right directions on the ground (x, z) */
const fwdR=(tau:number):[Pt,Pt]=>{const y=yawNey(tau);return[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];};
/** ball spot for the right foot: ahead and a touch to his right */
const footAt=(tau:number):[number,number]=>{const p=posOf(NEY,tau),[f,r]=fwdR(tau);return[p[0]+f[0]*.48+r[0]*.12,p[1]+f[1]*.48+r[1]*.12];};
/** dribble touches (one a stride, the touch at the gait's touch phase) in [a, b) */
function strideTouches(a:number,b:number,forced:number[]=[]):number[]{const out:number[]=[a];let prev=distOf(NEY,a)/CYC-touchPhase;
 for(let tau=a+DT;tau<b-.3;tau+=DT){const ph=distOf(NEY,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.3&&forced.every(f=>Math.abs(f-tau)>.3))out.push(tau);prev=ph;}
 return[...out,...forced].sort((x,y)=>x-y);}
/** ball keys [τ, x, z, kind]: kind 0 = a touch (kicked, then rolls and slows), 1 = a pass (quick, nearly even pace). Built once. */
const BORGES_FOOT:[number,number]=(()=>{const p=posOf(BORGES,BORGES_T);return[p[0]-.45,p[1]-.25];})();
const VACA_END:[number,number]=[90.6,-8.6];
const TOUCHES:number[]=[...strideTouches(0,PASS1,[.75]),...strideTouches(RETURN_AT,VACA,[])];
const BK:[number,number,number,number][]=[
 ...TOUCHES.filter(t=>t<PASS1).map(t=>[t,...footAt(t),0] as [number,number,number,number]),
 [PASS1,...footAt(PASS1),1],[BORGES_T,...BORGES_FOOT,1],
 ...TOUCHES.filter(t=>t>=RETURN_AT).map(t=>[t,...footAt(t),0] as [number,number,number,number]),
 [VACA,...footAt(VACA),0],[PICKUP,...VACA_END,0],[SHOT,...footAt(SHOT),0],
];
const NET:V3=[105.3,.3,1.6],REST:V3=[106.2,.11,1.9];
function ballAt(tau:number):V3{
 if(tau<IB_PASS){const x=posOf(IBSON,tau);return[x[0]+.45,.11,x[1]-.1];}
 if(tau<0){const x=posOf(IBSON,IB_PASS),u=(tau-IB_PASS)/-IB_PASS,e=1-Math.pow(1-u,1.4),to=footAt(0);return[lerp(x[0]+.45,to[0],e),.11,lerp(x[1]-.1,to[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<BK.length&&tau>=BK[k+1][0])k++;const a=BK[k],b=BK[k+1],u=(tau-a[0])/(b[0]-a[0]),e=a[3]===1?1-(1-u)*(1-u)*.35-.65*(1-u):1-(1-u)*(1-u);
  return[lerp(a[1],b[1],e),.11,lerp(a[2],b[2],e)];}
 const s0=footAt(SHOT);
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.22*Math.sin(Math.PI*u*.8),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** receiving Ibson's pass side-on by the touchline */
const RECEIVE:Partial<Pose>={lean:12,rHipF:26,rKnee:34,lHipF:-4,lKnee:30,lShA:40,rShA:34,lElb:40,rElb:40,neckP:28,neckY:-18};
/** the cut inside / the run round: body dropped and tilted into the turn, the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:10*dir,bend:12*dir,lean:24,lKnee:58,rKnee:54,lShA:dir>0?30:74,rShA:dir>0?74:30,neckY:10*dir,squash:-.05});
/** the drible da vaca: a poke with the inside of the right boot, pushing the ball out to his right, past the defender's other side */
const POKE:Partial<Pose>={rHipF:38,rHipA:26,rHipR:30,rKnee:22,rAnk:24,lKnee:40,lHipF:20,lean:18,roll:-8,bend:-10,lShA:62,rShA:46,lElb:34,rElb:36,neckP:30,neckY:-18,squash:-.04};
/** falling: after the slide takes his standing leg he lands on his left hip, right leg still up from the shot */
const FALL=posed({pitch:-38,lean:18,roll:14,rHipF:62,rKnee:14,rAnk:30,lHipF:36,lKnee:74,lHipA:14,lShA:58,lShF:-34,lElb:30,rShA:48,rShF:36,rElb:44,neckP:26,lHand:.8});
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(NEY,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk'&&tau>3)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===NEY)yaw=yawNey(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='fla'?READY:stand();
 if(k===NEY){// quick, short dribbling strides on the ball; a full sprint while the ball is away (the one-two)
  const s=clamp((sp-2)/4.5),dr=dribble(distOf(NEY,tau)/CYC,{foot:'r',speed:.45+.4*s}),run=runCycle(distOf(NEY,tau)/3.3,{speed:clamp((sp-2)/5)}),free=win(PASS1+.15,RETURN_AT-.1,tau,.25,.3);
  p=blendPose(idle,blendPose(dr,run,free),clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='slide'?.42:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.02});
  if(mv.kind==='slide'&&u>0){p=slideTackle(Math.min(1,u),{foot:mv.side});const d=posOf(NEY,mv.at);yaw=yawOf(d[0]-x,d[1]-z);}}
 if(k===WILLIANS)p=over(p,{twist:-14,roll:-6,lShA:40},bump(2.4,4,tau)*.8);
 if(k===BORGES){// the lay-off: side-on, shielding Welinton with his back, a first-time right-foot touch
  p=over(p,{lean:22,lHipF:30,lKnee:52,rHipF:30,rHipA:18,rHipR:26,rKnee:26,lShA:58,rShA:40,twist:-14,neckP:30},bump(4.4,5.35,tau));
  if(tau>IN_NET+.2)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.2,IN_NET+.7,tau));}
 if(k===ELANO&&tau>IN_NET)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},bump(IN_NET,IN_NET+2.2,tau));
 if(k===NEY){
  if(tau<.35)p=over(p,RECEIVE,bump(-.9,.35,tau));
  p=over(p,CUT(1),bump(.45,1.25,tau));
  p=over(p,POKE,bump(VACA-.28,VACA+.2,tau));
  p=over(p,CUT(-1),bump(VACA+.1,PICKUP-.15,tau));
  const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.2)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.55}),Math.min(sm(0,.15,u),1-sm(.62,.9,u)));
  const fall=Math.min(sm(SHOT+.12,SHOT+.45,tau),1-sm(9.3,9.75,tau));if(fall>0)p=blendPose(p,FALL,fall);
  if(tau>9.45)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(9.45,9.95,tau));
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a white match ball with navy panels (design inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 pan.addPath(pent(x+Math.cos(rot)*r*.12,y+Math.sin(rot)*r*.12,r*.3,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.26,a));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;cast:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: short, soft); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;const cast=new Map<number,DrawResult>();if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===NEY?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},{...(big&&(e.k===NEY||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===NEY}:{}),mohawk:e.k===NEY});
  cast.set(e.k,r);if(e.k===NEY)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,cast};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replay and the lesson
/** a ground path (x, z samples) drawn as a ribbon with an arrow head, revealed to `w` */
function groundArrow(s:Sheet,c:Cam,pts3:[number,number][],ink:string,w:number,seed:number,width=.2){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(const[x,z] of pts3){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=c.F*width/d;
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** the ball's path round Angelim (the poke) and Neymar's path the other way round him, sampled once */
const BALL_PATH:[number,number][]=Array.from({length:14},(_,i)=>{const b=ballAt(lerp(VACA+.02,PICKUP,i/13));return[b[0],b[2]];});
const RUN_PATH:[number,number][]=Array.from({length:16},(_,i)=>posOf(NEY,lerp(VACA,PICKUP,i/15)));
/** a ring on the grass round a player (the defender who steps in) */
function ringAt(s:Sheet,c:Cam,x:number,z:number,r:number,ink:string,w:number,seed:number){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const q=pr(c,[x+Math.cos(i/40*TAU)*r*1.1,0,z+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.1),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the run between them plays at ~0.8–1.5× real time; the pre-roll is Ibson on the ball) */
const tau1=(t:number)=>{const g=CUE(0,'Neymar gets'),G=CUE(0,'goal');return key(t,mono([[0,Math.max(T0,-g*.8-.3)],[g,-.05],[CUE(0,'cuts inside'),.7],[CUE(0,'races away'),1.9],[CUE(0,'Pass to Borges'),PASS1-.1],[CUE(0,'straight back'),BORGES_T+.05],[CUE(0,'one defender'),VACA-.3],[G,IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-G]]),linear);};
const CAM1:V3=[57,19,-82];
function cam1(t:number):Cam{
 const g=CUE(0,'Neymar gets'),G=CUE(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[58,3,-4],m=posOf(NEY,tau),cel:V3=[m[0]-1,1.1,m[1]];
 const toBall=sm(0,g-.1,t,easeInOutSine),toD=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.2,toBall),lerp(open[2],lerp(bt[2],0,.15),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,mono([[0,2300],[g-.2,5600],[CUE(0,'races away'),5300],[CUE(0,'one defender'),6400],[G,6800],[G+1.4,7600],[S,8000]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(NEY,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: the drible da vaca
const tau2=(t:number)=>key(t,mono([[0,5.35],[CUE(1,'slowly'),5.62],[CUE(1,'The defender'),5.95],[CUE(1,'pokes'),VACA-.05],[CUE(1,'one side'),VACA+.35],[CUE(1,'runs round'),VACA+.62],[CUE(1,'other side'),VACA+.98],[CUE(1,'picks'),PICKUP-.02],[SECS(1),PICKUP+.3]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(NEY,tau),an=posOf(ANGELIM,6.4),open=1-sm(0,1.4,t,easeInOutSine),push=sm(CUE(1,'The defender')-.3,CUE(1,'pokes'),t,easeInOutSine),back=sm(CUE(1,'picks')-.3,SECS(1),t,easeInOutSine);
 const cx=lerp(m[0],an[0],.45),cz=lerp(m[1],an[1],.45);
 const C:V3=[cx-2.5+1.5*open-2*back,1.6+.5*open+.8*back,cz-11-3*open+1.5*push-2*back],T:V3=[cx+.8+.8*back,.8,cz+.6];
 return look(C,T,2400+500*push-300*back-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ds=CUE(1,'The defender'),po=CUE(1,'pokes'),os=CUE(1,'one side'),rr=CUE(1,'runs round'),ot=CUE(1,'other side'),pk=CUE(1,'picks'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const[ax,az]=posOf(ANGELIM,tau);
  // "the defender steps in front": a red ring round Angelim
  ringAt(s,c,ax,az,.75,R,sm(ds-.1,ds+.35,t,easeOutBack)*(1-sm(E-1.1,E-.7,t)),43);
  // "one side": the ball's path (yellow) past Angelim; "other side": Neymar's path (navy) round him
  groundArrow(s,c,BALL_PATH,Y,sm(os-.3,os+.5,t,easeOut)*(1-sm(E-1,E-.6,t)),61,.16);
  groundArrow(s,c,RUN_PATH,K,sm(ot-.45,ot+.5,t,easeOut)*(1-sm(E-1,E-.6,t)),71,.14);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero,bg})=>{
   // "pokes the ball": a yellow spark at the poke
   const ag=t-po;if(ag>-.2&&ag<.5){const b=ballAt(VACA),q=pr(c,[b[0],.15,b[2]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,b)*.5,{n:8,seed:83,g:easeOutBack(clamp((ag+.2)/.2))*(1-clamp((ag-.25)/.25)),width:9});}
   // "picks it up": a yellow spark where the two paths meet again
   const ap=t-pk;if(ap>-.2&&ap<.6&&bg){sparkBurst(s,Y,bg[0],bg[1],(hero?.heightPx??200)*.35,{n:9,seed:84,g:easeOutBack(clamp((ap+.2)/.2))*(1-clamp((ap-.35)/.25)),width:10});}
   // "runs round": speed lines trailing off Neymar
   const rw=win(rr-.1,pk,t,.2,.3);if(rw>0&&hero){const h=hero.joints.pelvis,z=hero.heightPx;for(const k of[0,1,2])s.fill(K,ribbon([[h[0]+z*(.25+k*.05),h[1]-z*(.25-k*.18)],[h[0]+z*(.7+k*.1),h[1]-z*(.25-k*.18)]],z*.025,{seed:9+k,taper:.9,wobble:.5}),.6*rw);}}});
  // the replay wipe as the chapter opens
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the slide, the falling finish, the celebration
const tau3=(t:number)=>{const g=CUE(2,'It won');return key(t,mono([[0,7.35],[CUE(2,'Even'),7.55],[CUE(2,'slides'),SHOT+.02],[CUE(2,'past the keeper'),SHOT+.42],[g,IN_NET+.7],[SECS(2),IN_NET+.7+(SECS(2)-g)*.85]]),linear);};
const swing3=(t:number)=>{const a=CUE(2,'past the keeper');return sm(a+.5,CUE(2,'It won')+.9,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(NEY,Math.min(tau,SHOT+.3)),e=sm(SHOT-.2,IN_NET+.2,tau,easeInOutSine),u=swing3(t),hold=sm(CUE(2,'Puskás')-.2,SECS(2),t,easeInOutSine);
 const C0:V3=[117,5.5,-7+1.5*e],T0:V3=[lerp(m[0],100,e),lerp(.9,1,e),lerp(m[1]*.9,-1.5,e)];
 const mm=smooth(NEY,tau),C1:V3=[mm[0]+6-hold,2+.8*hold,mm[1]-9.5-1.5*hold],T1:V3=[mm[0]-.4,1.2+.6*hold,mm[1]+1.2];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3500+300*sm(0,CUE(2,'slides'),t),3300-300*hold,u)*(1-.3*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),g=CUE(2,'It won'),pa=CUE(2,'Puskás'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:Math.max(sm(g-.1,g+.3,t),sm(pa-.1,pa+.2,t))*(1-sm(SECS(2)-1.2,SECS(2)-.6,t))});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "Even as he falls": the slide meets his standing foot — a red spark at the contact
   const ev=t-CUE(2,'Even');if(ev>0&&ev<1.6){const d=posOf(NEY,SHOT),q=pr(c,[d[0]+.3,.25,d[1]+.4]);const ag=tau-SHOT;if(q&&ag>-.25&&ag<.45)sparkBurst(s,R,q[0],q[1],kAt(c,[d[0],.2,d[1]])*.5,{n:8,seed:91,g:easeOutBack(clamp((ag+.25)/.2))*(1-clamp((ag-.2)/.25)),width:9});}
   // "Puskás Award": a yellow star burst over his head as the crowd flashes
   const aw=t-pa;if(aw>-.1&&hero){const h=hero.joints.head,z=hero.heightPx;sparkBurst(s,Y,h[0],h[1]-z*.35,z*.28*easeOutBack(clamp((aw+.1)/.35)),{n:10,seed:92,g:1,width:Math.max(5,z*.03),cov:.95*(1-sm(SECS(2)-pa-.9,SECS(2)-pa-.5,aw))});}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(NEY,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the trick
const tau4=(t:number)=>key(t,mono([[0,5.45],[CUE(3,'practise'),5.6],[CUE(3,'automatic'),5.85],[CUE(3,'Then use it'),6.05],[CUE(3,'defender gets'),VACA-.1],[CUE(3,'defender gets')+1.1,VACA+.75],[SECS(3),PICKUP+.2]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(NEY,tau),push=sm(CUE(3,'practise')-.3,CUE(3,'practise')+.5,t,easeInOutSine),orbit=sm(CUE(3,'Then use it')-.4,CUE(3,'defender gets')+.6,t,easeInOutSine),back=sm(CUE(3,'defender gets')+.5,SECS(3),t,easeInOutSine);
 const C:V3=[m[0]+7.5+2*back,1.3+.6*orbit,m[1]-5.5-2*orbit-1.5*back],T:V3=[m[0]+.8+back,.85-.1*push,m[1]+.4];
 return look(C,T,2400+450*push-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),pt=CUE(3,'practise'),ag=CUE(3,'again and'),wt=CUE(3,'automatic'),tu=CUE(3,'Then use it'),dc=CUE(3,'defender gets'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const m=posOf(NEY,tau),[ax,az]=posOf(ANGELIM,tau);
  // "practise one trick, again and again": a tally of practice ticks printed on the grass beside him, one more on each beat
  const reps=[pt+.3,ag,ag+.45,ag+.9],tick=new Path2D();let tk=0;
  reps.forEach((r0,i)=>{const w=sm(r0-.05,r0+.2,t,easeOutBack)*(1-sm(E-1.2,E-.8,t));if(w<=0)return;tk=Math.max(tk,w);const x0=m[0]-1.6+i*.42,z0=m[1]-1.3,a=pr(c,[x0,.02,z0]),b=pr(c,[x0+.18,.02,z0-1.05*w]);if(a&&b)tick.addPath(ribbon([a,b],kAt(c,[x0,0,z0])*.12,{seed:100+i,taper:.2,wobble:.6}));});
  if(tk>0){s.knockout(tick,.85);s.fill(Y,tick,.95);}
  // "defender gets close": a red bracket between them, shrinking as Angelim steps in
  const dw=win(dc-.3,dc+1.3,t,.25,.35);if(dw>0){const a=pr(c,[m[0]+.4,.03,m[1]]),b=pr(c,[ax-.4,.03,az]);if(a&&b){const wd=kAt(c,[m[0],0,m[1]])*.1;s.knockout(ribbon([a,b],wd*1.8,{seed:77,taper:0,wobble:.6}),.8*dw);s.fill(R,ribbon([a,b],wd,{seed:77,taper:0,wobble:.6}),.95*dw);sparkBurst(s,R,b[0],b[1],wd*3.5,{n:6,seed:78,g:dw,width:Math.max(4,wd*.5)});}}
  // the trick itself: the ball's path and his path round the defender
  groundArrow(s,c,BALL_PATH,Y,sm(dc+.2,dc+.9,t,easeOut)*(1-sm(E-.9,E-.5,t)),61,.16);
  groundArrow(s,c,RUN_PATH,K,sm(dc+.5,dc+1.3,t,easeOut)*(1-sm(E-.9,E-.5,t)),71,.14);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({hero,bg,br})=>{
   // "automatic": the ball on a yellow thread to his right boot (it goes where the foot goes)
   const gw=win(wt-.15,tu+.2,t,.3,.35);
   if(hero&&bg&&gw>0){const toe=hero.joints.rToe,mid:Pt=[(toe[0]+bg[0])/2,(toe[1]+bg[1])/2+br*.5*(1-gw)];s.knockout(ribbon([toe,mid,bg],br*.5,{seed:81,taper:0,wobble:.6}),.8*gw);s.fill(Y,ribbon([toe,mid,bg],br*.28,{seed:81,taper:0,wobble:.6}),.95*gw);}
   // "Then use it": a yellow ring pops round the boot and the ball
   const uw=sm(tu-.1,tu+.3,t,easeOutBack)*(1-sm(dc-.2,dc+.1,t));
   if(hero&&bg&&uw>0){const toe=hero.joints.rToe,cx=(toe[0]+bg[0])/2,cy=(toe[1]+bg[1])/2,r=(Math.hypot(toe[0]-bg[0],toe[1]-bg[1])/2+br)*uw+2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.75]);}
    s.fill(Y,ribbon(pts,Math.max(3,r*.14),{seed:82,close:true,taper:0,wobble:.8}),.95*uw);}}});
 },
 still:5.2,
};

const film:RisoStory={
 id:'neymar-signature',format:'11v11',title:"Neymar's Puskás Goal",theme:'A trick that beats a defender: practise it until it is automatic, then use it when a defender is close',
 ageNote:'Campeonato Brasileiro, Santos v Flamengo, Vila Belmiro, Santos, 27 July 2011 (Santos 4–5 Flamengo). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and red-brown dust thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.6*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
