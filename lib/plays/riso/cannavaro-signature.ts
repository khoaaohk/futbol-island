/** Fabio Cannavaro, "Signature: out-jumping taller strikers" — v Germany, World Cup semi-final, Westfalenstadion ("FIFA WM-Stadion
 * Dortmund"), 4 July 2006 (Germany 0–2 Italy after extra time): in the last minute of extra time, with Germany pouring forward, Italy's
 * captain (1.76 m) out-jumps the much taller Per Mertesacker (1.98 m) to head the ball out of his area, bursts out, dispossesses Lukas
 * Podolski and carries it to Francesco Totti: the start of the move that ended in Del Piero's goal. An iconic-play riso film (RisoStory,
 * chapters mode) played by the card's picture window: a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed).
 *
 * WHY THIS MOMENT: the entry in lib/town/iconicPlays.json is a signature (out-jumping taller strikers; lesson "Timing beats height: jump
 * early and use your arms for balance"). Both sources below single out exactly this header as the action that "sums up Cannavaro in
 * Germany": the smallest centre-back in the duel beating a 1.98 m forward in the air, in the biggest moment of the semi-final. Wikipedia's
 * playing-style section says the same of his game in general (small for a defender, but his elevation, timing and athleticism let him
 * "outjump larger players"). Same match as lib/plays/riso/del-piero-germany-2006.ts: the kits, the stadium and the night are kept identical
 * (the stadium/ground/goal code is copied from it), the compositions are new and follow Cannavaro.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Fabio Cannavaro" (height 1.76 m; "in the last minute of extra-time, with Italy leading 1–0 and facing a German attack,
 *    Cannavaro outjumped Per Mertesacker to clear the ball from his area. He subsequently ran forward to dispossess Lukas Podolski, and
 *    carried the ball up to Francesco Totti in midfield, who started the play that led to Italy's second goal, which was scored by
 *    Alessandro Del Piero from an assist by Alberto Gilardino"; playing style: "relatively small stature … outjump larger players")
 *    https://en.wikipedia.org/wiki/Fabio_Cannavaro  [wiki-fabio-cannavaro.txt]
 *  - Football Italia, Luca Cetta & Sam Lewis, "Mondiali Memories – Germany 06" (web.archive.org 2016-08-16: "With Germany pouring forward in
 *    search of a late equaliser … the Neapolitan outjumped the much taller Per Mertesacker to clear the ball from danger. He then burst from
 *    the penalty area and dispossessed Lukas Podolski. Cannavaro surged ahead, finally leaving possession to Francesco Totti. It was the
 *    origin of Italy's second goal, scored by Alessandro Del Piero.")  [football-italia-mondiali-memories-2006.txt]
 *  - Wikipedia, "Per Mertesacker" (height 1.98 m)  [wiki-per-mertesacker.txt]
 *  - Wikipedia, "2006 FIFA World Cup knockout stage" (Germany vs Italy: 4 July 2006, 21:00, Westfalenstadion, Dortmund; Grosso 119', Del
 *    Piero 120+1'; numbers: Cannavaro 5 (captain), Totti 10, Mertesacker 17, Podolski 20, Lehmann 1, Buffon 1; the kit boxes: Germany
 *    white shirts / black shorts / white socks, Italy all blue)  [wiki-2006-wc-ko.txt]
 *  - BBC Sport match report, 4 July 2006 ("Fabio Cannavaro, exceptional throughout the match, marshalled the Italian back line"; Gilardino
 *    rolled it to Del Piero for the second goal as Germany "pushed forward in desperation")  [bbc-4991640.html]
 * CONFIRMED by those accounts: the match, date, venue and 21:00 kick-off (so floodlights); the moment (last minute of extra time, Italy
 *  1–0 up, Germany attacking); Cannavaro out-jumps Mertesacker, the much taller man (1.76 m v 1.98 m: 22 cm), and heads the ball clear of
 *  his own area; he bursts out of the box, dispossesses Podolski, carries the ball forward and leaves it to Totti in midfield; that move
 *  ends in Del Piero's goal (assist Gilardino); the numbers; Italy all blue, Germany white shirts with black trim, black shorts, white socks.
 * INFERRED (illustrative): how the ball came into the box (drawn as a high ball hoisted in from the German left, +Z) and who hit it
 *  (unnamed); every position, distance and time; which side of Mertesacker Cannavaro stood; that Cannavaro took off first (the film's
 *  teaching reading of "outjumped": early take-off, arms up for balance, the ball met at the top of the leap) and Mertesacker's late,
 *  lower jump; the header's direction and the bounce to Podolski; how the ball was won (a right-foot poke, head-on); the carry and the
 *  short pass to Totti; Totti's forward ball towards Gilardino; the other players and where they stood; the keeper and referee kit colours;
 *  hair colours; the stadium as drawn (see the del-piero film: steep stands, roof ring, eight yellow pylons, stylised); the +Teamgeist ball
 *  as drawn; the camera placements. Narration names only the confirmed facts (no foot, no side, no scorer of the cross).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, live, near real time (the German attack → the high ball →
 * the two men go up → the header clear → he starts to burst out); ch2 = the slow-motion replay from a LOW camera out in front of the duel,
 * looking back at Buffon's goal, so the two heads are side by side (height bars: 1.98 m v 1.76 m; he jumps first, arms out, and meets the
 * ball at the top of his leap, above Mertesacker's head); ch3 = a second replay, a low chase camera beside him on the burst (the run
 * painted on the grass, the ball won from Podolski, the pass to Totti) that lifts to show the move running on to Del Piero's goal; ch4 =
 * the lesson from a three-quarter camera on the duel again (the take-off spot, "jump early", the arm rings, the header high and away).
 * Composed on the FULL sheet (never sheet.safe), so it frames from the 1.45:1 card window down to square. Every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (FK skeleton, `prev` secondary motion, a motion smear on the leap and the burst); small wide-shot
 * figures and every figure inside a passage print at `low`. Handedness: the world is right-handed (X toward Germany's goal, Y up, +Z = the
 * main-stand side = an Italy attacker's RIGHT), athlete.ts's convention, so no mirrored projector. Everything keys off cue times
 * (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones, all randomness seeded. Budget: ~150–330 plate ops/frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,header,keeperSet,stand,posed,blendPose,solve,
 touchPhase,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult,type Skeleton} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and each chapter's `seconds`
 * are ESTIMATES (≈2.5 words/s + punctuation pauses) until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in order,
 * so no cue starts with a word that also appears between it and the previous cue (and no cue starts with a hyphenated word). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The header, live',text:"Dortmund, 2006: the last minute of extra time. Germany send a high ball into Italy's box. Captain Fabio Cannavaro out-jumps giant Per Mertesacker and heads it clear!",tail:2.2,
  cues:['Dortmund','the last minute','Germany send','high ball','Captain Fabio','giant Per','heads it clear']},
 {label:'Watch the jump',text:'Watch again. Mertesacker is twenty-two centimetres taller, but Cannavaro jumps first, arms out for balance, and meets the ball at the top of his leap.',tail:1.6,
  cues:['Watch again','Mertesacker is','taller','but Cannavaro','jumps first','arms out','meets','top of']},
 {label:'The burst',text:"Then he bursts out, wins the ball from Podolski and finds Totti. That move ended in Del Piero's goal!",tail:1.8,
  cues:['Then he bursts','wins the ball','Podolski','finds Totti','That move',"Del Piero's goal"]},
 {label:'Your turn',text:'Your turn: timing beats height. Jump early, use your arms for balance, and head it high and away.',tail:1.6,
  cues:['Your turn','timing beats','Jump early','use your arms','head it']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py cannavaro-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/cannavaro-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/cannavaro-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the Kokoro films, ≈2.5 words/s): .19 s + .018 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.018*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('cannavaro: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('cannavaro: no cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre (the engine's arrival scale is kept, so
 * passages behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Italy attack +X, Germany's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. */
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
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Westfalenstadion at night: four steep stands hugging the pitch, filled
// corners, a roof ring with floodlights along its lip, the eight yellow pylons holding the roof on cables (placement stylised)
const X0=-7,X1=112,ZS=40,RISE=30,DEPTH=31;
type StandF=(a:number,b:number)=>V3;
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind Germany's goal (x>105), 2 the main stand (z>0, camera side),
 * 3 behind Italy's goal (x<0). The long stands run on into the corners, so the bowl is closed. */
const STANDS:StandF[]=[
 (a,b)=>[lerp(X0-DEPTH*b,X1+DEPTH*b,a),1.4+RISE*b,-ZS-DEPTH*b],
 (a,b)=>[X1+DEPTH*b,1.4+RISE*b,lerp(-ZS-DEPTH*b,ZS+DEPTH*b,a)],
 (a,b)=>[lerp(X1+DEPTH*b,X0-DEPTH*b,a),1.4+RISE*b,ZS+DEPTH*b],
 (a,b)=>[X0-DEPTH*b,1.4+RISE*b,lerp(ZS+DEPTH*b,-ZS-DEPTH*b,a)],
];
const COLS=[20,10,20,10],WALK:[number,number]=[.47,.53];
/** roof: from the top of the stand in to b = .12 over the seats, a floodlit lip */
const ROOF=(S:StandF,a:number,b:number):V3=>{const p=S(a,b);return[p[0],b>.9?35.5:38.2,p[2]];};
type StandQ={low:V3[];up:V3[];walk:V3[];roof:V3[];lip:[V3,V3]};
const STANDQ:StandQ[][]=STANDS.map((S,si)=>{const n=COLS[si],o:StandQ[]=[];for(let i=0;i<n;i++){const a0=i/n,a1=(i+1)/n;
 o.push({low:[S(a0,0),S(a1,0),S(a1,WALK[0]),S(a0,WALK[0])],up:[S(a0,WALK[1]),S(a1,WALK[1]),S(a1,1),S(a0,1)],walk:[S(a0,WALK[0]),S(a1,WALK[0]),S(a1,WALK[1]),S(a0,WALK[1])],
  roof:[ROOF(S,a0,1),ROOF(S,a1,1),ROOF(S,a1,.12),ROOF(S,a0,.12)],lip:[ROOF(S,a0+.15/n,.12),ROOF(S,a1-.15/n,.12)]});}return o;});
/** seats: one mark per seat group; ita = the blue Italian end (behind Buffon's goal, stand 3) and a corner block */
const SEATS:{P:V3;h:number;ita:boolean}[]=(()=>{const o:{P:V3;h:number;ita:boolean}[]=[];
 STANDS.forEach((S,si)=>{const cols=COLS[si]*3;for(let j=0;j<10;j++){const b=j<5?.04+.085*j:.58+.085*(j-5);for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.14)continue;
  const a=(i+.5+(hash(i+j*31+si,9)-.5)*.6)/cols;o.push({P:S(a,b),h,ita:(si===3&&a>.18&&a<.62)||(si===0&&a<.1)});}}});return o;})();
/** flags on the stand fronts: [stand, a, kind] kind 0 = Germany (black | red | gold bands), 1 = Italy (green | white | red) */
const FLAGS:[number,number,number][]=[[0,.2,0],[0,.34,0],[0,.5,0],[0,.63,1],[0,.76,0],[0,.9,0],[1,.3,0],[1,.55,0],[1,.75,0],[3,.28,1],[3,.42,1],[3,.55,1],[2,.3,0],[2,.6,0]];
/** the eight yellow pylons outside the stands (four a side), their tops above the roof, cables down to the roof lip (stylised) */
const PYLONS:[number,number][]=[[-17,-83],[31,-83],[74,-83],[122,-83],[-17,83],[31,83],[74,83],[122,83]];
/** a summer night in Dortmund under floodlights: navy sky, the pylons, the stands and crowd, the roof, the lamps */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number;ita?:number;flags?:number}={}){
 const{roar=0,flash=0,ita=0,flags=0}=o,tt=twos(t),Bnd=1e4,passing=!!s._passage.pending;
 s.field(B,.55,.6);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.45);
 const hz=pr(c,[c.C[0]+c.f[0]*1e4,c.C[1],c.C[2]+c.f[2]*1e4])?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-620],[-Bnd,hz-520]],true),.3);
 // the pylons (behind the stands: the stands knock out over their feet), lattice cross-bars, cables to the roof lip
 const py=new Path2D(),br=new Path2D(),cb=new Path2D(),wr=nrm3([c.r[0],0,c.r[2]]);
 for(const[x,z] of PYLONS){const bot:V3=[x,14,z],top:V3=[x,66,z],w0=2.6,w1=.8,q=quadP(c,[[bot[0]-wr[0]*w0,bot[1],bot[2]-wr[2]*w0],[bot[0]+wr[0]*w0,bot[1],bot[2]+wr[2]*w0],[top[0]+wr[0]*w1,top[1],top[2]+wr[2]*w1],[top[0]-wr[0]*w1,top[1],top[2]-wr[2]*w1]],20);
  if(!q)continue;py.addPath(polyPath(q,true));
  if(!passing)for(let k=0;k<6;k++){const y0=18+k*8,y1=y0+8,wa=lerp(w0,w1,(y0-14)/52)*.8,wb=lerp(w0,w1,(y1-14)/52)*.8;seg3(c,[x-wr[0]*wa,y0,z-wr[2]*wa],[x+wr[0]*wb,y1,z+wr[2]*wb],.22,br,.6);seg3(c,[x+wr[0]*wa,y0,z+wr[2]*wa],[x-wr[0]*wb,y1,z-wr[2]*wb],.22,br,.6);}
  const zl=Math.sign(z)*(ZS+DEPTH*.25);for(const dx of[-14,14])seg3(c,[x,64,z],[x+dx,38.4,zl],.18,cb,.6);}
 s.knockout(py);s.fill(Y,py,.95);s.fill(K,br,.55);s.fill(K,cb,.6);
 // the stands: steep concrete planes (navy × blue), the walkway band between the tiers
 const low=new Path2D(),up=new Path2D(),walk=new Path2D(),roof=new Path2D(),lamp=new Path2D();
 for(const col of STANDQ)for(const q of col){addPoly(low,quadP(c,q.low));addPoly(up,quadP(c,q.up));addPoly(walk,quadP(c,q.walk));addPoly(roof,quadP(c,q.roof,16));
  const a=toCam(c,q.lip[0]),b=toCam(c,q.lip[1]);if(Math.min(a[2],b[2])>16)seg3(c,q.lip[0],q.lip[1],1.3,lamp);}
 s.knockout(low);s.tone(K,low,.5);s.tone(B,low,.3);
 s.knockout(up);s.tone(K,up,.62);s.tone(B,up,.3);
 // the crowd: Germany's white, red, gold and black; the blue Italian end; the roar lifts the marks (ita = only the Italian end)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of SEATS){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.55/d[2],2.2,14),r=q.ita?Math.max(roar,ita):roar,lift=r>0?r*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.ita?(q.h<.36?0:4):q.h<.46?0:q.h<.64?1:q.h<.8?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.92);s.fill(Y,inks[2],.9);s.fill(K,inks[3],.85);s.fill(B,inks[4],.95);
 s.knockout(walk,.4);
 // flags on the tier fronts (they are hoisted a little higher on the flags cue)
 const fl=new Path2D(),rd=new Path2D(),gd=new Path2D(),bk=new Path2D(),gr=new Path2D();
 if(!passing)for(const[si,a,kind] of FLAGS){const S=STANDS[si],w=si%2?.018:.013,hgt=.035+.02*flags,P=(u:number,b:number)=>S(a+u*w,b),q=quadP(c,[P(0,.01),P(1,.01),P(1,.01+hgt),P(0,.01+hgt)]);if(!q)continue;fl.addPath(polyPath(q,true));
  if(kind===0){const band=(b0:number,b1:number,p:Path2D)=>addPoly(p,quadP(c,[P(0,.01+hgt*b0),P(1,.01+hgt*b0),P(1,.01+hgt*b1),P(0,.01+hgt*b1)]));band(.667,1,bk);band(.333,.667,rd);band(0,.333,gd);}
  else{const strip=(u0:number,u1:number,p:Path2D)=>addPoly(p,quadP(c,[P(u0,.01),P(u1,.01),P(u1,.01+hgt),P(u0,.01+hgt)]));strip(0,.333,gr);strip(.667,1,rd);}}
 s.knockout(fl);s.fill(K,bk,.95);s.fill(R,rd,.95);s.fill(Y,gd,.95);s.fill(Y,gr,.92);s.tone(B,gr,.72);
 // the roof ring (dark underside) and the floodlight strip along its lip
 s.knockout(roof);s.tone(K,roof,.7);s.tone(B,roof,.3);
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=SEATS[Math.floor(hash(i*17+T12*101,3)*SEATS.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the floodlit grass (yellow × blue) with mowing stripes, the boards, paper lines, both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-7,0,-40],[112,0,-40],[112,0,40],[-7,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(K,p,.5);s.tone(B,p,.25);}
 const g=polyP(c,[[-5,0,-37.5],[110,0,-37.5],[110,0,37.5],[-5,0,37.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.82);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37.5],[(k+1)*5.25,0,-37.5],[(k+1)*5.25,0,37.5],[k*5.25,0,37.5]]));s.tone(K,st,.12);
 // boards: along both touchlines and behind both goals, navy with paper and red panels
 const bd=new Path2D(),pn=new Path2D(),pr2=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,[b[0],.9,b[2]],[a[0],.9,a[2]]]));
 board([-4,0,-37],[109,0,-37]);board([109,0,-36],[109,0,36]);board([-4,0,36],[-4,0,-36]);board([109,0,37],[-4,0,37]);
 for(let k=0;k<18;k++){const x=-2+k*6.2,P=(z:number)=>polyP(c,[[x,.25,z],[x+3.4,.25,z],[x+3.4,.65,z],[x,.65,z]]);addPoly(k%3?pn:pr2,P(-36.95));addPoly(k%3?pn:pr2,P(36.95));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%3?pn:pr2,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.65,z+3.4],[108.95,.65,z]]));addPoly(pn,polyP(c,[[-3.95,.25,z],[-3.95,.25,z+3.4],[-3.95,.65,z+3.4],[-3.95,.65,z]]));}
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
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, high) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.72);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles) — identical to the del-piero film (same night)
const SKIN:InkFill[]=[[Y,.32],[R,.2]];
const SKIN_M:InkFill[]=[[Y,.4],[R,.28],[B,.06]];
/** Italy 4 July 2006: all blue (shirt, shorts, socks; the kit boxes), paper numbers and trim */
const ITA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:K,trim:'paper',numberInk:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,seed:3,...o});
/** Fabio Cannavaro: number 5, 1.76 m (confirmed), dark short hair */
const CAN_STYLE=ITA({number:5,build:{height:1.76,bulk:1.05},hair:K,seed:5});
/** Germany: white shirts with black trim, black shorts, white socks (the kit boxes) */
const GER=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,trim:K,numberInk:K,skin:SKIN,hair:[K,.7],hairStyle:'short',line:K,seed:5,...o});
/** Per Mertesacker: number 17, 1.98 m (confirmed); his fair hair inferred */
const MER_STYLE=GER({number:17,build:{height:1.98,bulk:1.02},hair:[Y,.6],seed:17});
/** Lukas Podolski: number 20 (confirmed); dark hair inferred */
const POD_STYLE=GER({number:20,build:{height:1.82,bulk:1.02},hair:[K,.85],seed:20});
const LEHMANN:AthleteStyle={shirt:[K,.42],shorts:[K,.62],socks:[K,.42],boots:K,skin:SKIN,hair:[Y,.75],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:Y,number:1,numberInk:'paper',build:{height:1.9},seed:41};
const BUFFON:AthleteStyle={shirt:[K,.3],shorts:[K,.55],socks:[K,.3],boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:Y,number:1,numberInk:'paper',build:{height:1.91},seed:42};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'balding',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: the hem trails); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyed tracks (τ = seconds after Cannavaro's header)
type Role='can'|'ita'|'ger'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** the beats (τ): the high ball is hit, the header (0), the clearance lands, Podolski's control, the ball won, Cannavaro collects,
 * his pass to Totti, Totti's touch and forward ball, Gilardino takes it */
const LAUNCH=-1.9,LAND1=1.25,POD_T=1.6,TACKLE=2.75,CAN_RX=3.3,PASS_T=5.9,TOT_RX=6.45,TOT_PASS=6.95,GIL_RX=8.7;
/** the header move: header() over HD seconds, contact (.52) at τ = 0; Mertesacker's jump starts MER_LATE later and is lower */
const HD=1.0,H0=-.52*HD,MER_LATE=.2,MER_AIR=.68;
/** the high ball's line: U points from the duel back toward where it was hit; P runs across it (to the duel's left, seen from the ball) */
const U:Pt=[.866,.5],P:Pt=[-.5,.866];
const DUEL:Pt=[10.8,.6];
const MER_AT:Pt=[DUEL[0]+.3*U[0]+.8*P[0],DUEL[1]+.3*U[1]+.8*P[1]];
const yawU=Math.atan2(-U[1],U[0]);
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Everything but the named beats is inferred (see the header). */
const ACTORS:Actor[]=[
 {name:'Cannavaro',role:'can',style:CAN_STYLE,key:true,keys:[[-5.5,12.6,2.4],[-3,11.8,1.5],[-1.3,11.05,.85],[-.52,10.85,.65],[0,10.8,.6],[.45,10.95,.66],[1,12.5,1.35],[1.5,15.4,2.5],[2,19.1,3.6],[2.5,22.9,4.6],[2.75,24.55,5.05],[3,25.9,4.7],[3.3,27.2,4.35],[4,30.3,3.5],[5,34.6,2.1],[5.9,38.3,.7],[6.5,40.1,.2],[8,43,.2],[10.5,45,.4]]},
 {name:'Mertesacker',role:'ger',style:MER_STYLE,key:true,keys:[[-5.5,14,3.4],[-3,12.3,2.4],[-1.3,MER_AT[0]+.2,MER_AT[1]+.15],[-.3,MER_AT[0],MER_AT[1]],[.6,MER_AT[0]+.05,MER_AT[1]+.05],[1.6,MER_AT[0]+.6,MER_AT[1]+.4],[4,14.5,3],[10.5,21,3.5]]},
 {name:'Podolski',role:'ger',style:POD_STYLE,key:true,keys:[[-5.5,36,9.5],[-2,31.6,8.2],[0,30.1,7.7],[1,29.2,7.3],[1.6,28.4,6.95],[2,27.3,6.45],[2.45,26.2,5.95],[2.75,25.75,5.75],[3.2,25.5,5.6],[4,25.3,5],[10.5,26,3]]},
 {name:'Totti',role:'ita',style:ITA({number:10,hair:[K,.72],build:{height:1.8,bulk:1.03},seed:10}),key:true,keys:[[-5.5,30,-6],[0,29,-5.2],[3,33,-4],[5,38.6,-2.8],[6.45,41.4,-2.3],[6.95,42.1,-2.35],[7.8,43.6,-2.6],[10.5,47,-3]]},
 {name:'Gilardino',role:'ita',style:ITA({number:11,build:{height:1.84,bulk:.97},hair:[K,.9],seed:11}),keys:[[-5.5,50,-8],[0,48,-10],[5,50,-12],[7,54,-13.4],[8.7,59.6,-14],[10.5,65,-14]]},
 {name:'Del Piero',role:'ita',style:ITA({number:7,build:{height:1.74,bulk:.98},seed:7}),keys:[[-5.5,34,9],[0,31,8],[5,37,5],[7,44,2],[10.5,58,-3]]},
 {name:'Materazzi',role:'ita',style:ITA({number:23,build:{height:1.93,bulk:1.06},seed:23}),keys:[[-5.5,10.5,-3.4],[0,9.6,-3.2],[3,11,-3],[10.5,20,-3]]},
 {name:'Zambrotta',role:'ita',style:ITA({number:19,seed:19}),keys:[[-5.5,13,11],[0,11.5,9.5],[3,15,9],[10.5,24,8]]},
 {name:'Grosso',role:'ita',style:ITA({number:3,hairStyle:'long',seed:13}),keys:[[-5.5,12,-12.5],[0,10.5,-11.5],[3,14,-12],[10.5,24,-13]]},
 {name:'Pirlo',role:'ita',style:ITA({number:21,hairStyle:'long',seed:21}),keys:[[-5.5,21,-4.5],[0,18.5,-5],[3,22,-4.6],[10.5,33,-4]]},
 {name:'Gattuso',role:'ita',style:ITA({number:8,hairStyle:'long',seed:8}),keys:[[-5.5,18,-9],[0,15.8,-8.6],[3,20,-8.4],[10.5,30,-8]]},
 {name:'Iaquinta',role:'ita',style:ITA({number:15,seed:15}),keys:[[-5.5,25,15],[0,23,14],[5,30,13],[10.5,42,10]]},
 {name:'Buffon',role:'gk',style:BUFFON,keys:[[-5.5,4,.8],[0,3.1,.5],[3,5,.4],[10.5,8,0]]},
 {name:'Lehmann',role:'gk',style:LEHMANN,keys:[[-5.5,100,0],[10.5,99,-.5]]},
 {name:'German crosser',role:'ger',style:GER({seed:33}),keys:[[-5.5,37.5,16.5],[-3,35,15],[-1.9,33.9,14.1],[0,32.6,13.2],[4,31,11],[10.5,33,9]]},
 {name:'German forward',role:'ger',style:GER({seed:34,hair:[K,.9]}),keys:[[-5.5,11.5,-2.2],[0,8.9,-2.4],[3,10,-2.2],[10.5,18,-1]]},
 {name:'German mid 1',role:'ger',style:GER({seed:36,hair:[Y,.5]}),keys:[[-5.5,22.5,-1],[0,19.6,-1.6],[3,22.6,-1],[10.5,34,0]]},
 {name:'German mid 2',role:'ger',style:GER({seed:37}),keys:[[-5.5,33,-9],[0,29.5,-9.5],[10.5,40,-8]]},
 {name:'German mid 3',role:'ger',style:GER({seed:39,hair:[K,.6]}),keys:[[-5.5,40,3],[0,37.5,2.2],[10.5,50,0]]},
 {name:'German full-back',role:'ger',style:GER({seed:40}),keys:[[-5.5,44,-21],[0,41,-21],[10.5,55,-17]]},
 {name:'German back',role:'ger',style:GER({seed:31,hair:[K,.85]}),keys:[[-5.5,55,0],[0,53,-1],[5,55,-4],[10.5,66,-10]]},
 {name:'German wide',role:'ger',style:GER({seed:38}),keys:[[-5.5,46,22],[0,43,21],[10.5,52,15]]},
 {name:'referee',role:'ref',style:REF,keys:[[-5.5,31,-10],[0,28,-10],[5,33,-7],[10.5,44,-4]]},
];
const CAN=0,MER=1,POD=2,TOT=3,GIL=4,CROSSER=14;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-5.5,T1=10.5,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headYaw=(k:number,tau:number,fb:number)=>{const v=velOf(k,tau);return Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):fb;};
/** a boot spot: ahead of the body and out to one side (right = +Z when facing +X) */
function footSpot(k:number,tau:number,yaw:number,side:'l'|'r',ahead:number,out:number):V3{const[x,z]=posOf(k,tau),f:Pt=[Math.cos(yaw),-Math.sin(yaw)],r:Pt=[Math.sin(yaw),Math.cos(yaw)],sg=side==='r'?1:-1;
 return[x+f[0]*ahead+r[0]*out*sg,.11,z+f[1]*ahead+r[1]*out*sg];}

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the jostle before the jump: knees bent, eyes up at the dropping ball */
const EYES_UP=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:12,lean:10,pitch:2,lShA:30,rShA:34,lShF:18,rShF:10,lElb:50,rElb:46,neckP:-20});
/** a keyed strike blended over a run: contact at `at`, the whole move `dur` seconds */
function withStrike(p:Pose,tau:number,at:number,dur:number,foot:'l'|'r',power:number):Pose{const u=(tau-(at-.52*dur))/dur;
 return u>0&&u<1.4?blendPose(p,strike(Math.min(1,u),{foot,power}),Math.min(sm(0,.15,u),1-sm(1,1.4,u))):p;}
/** a jump for the high ball: header() from start s0 over HD, blended in over the crouch and out over the landing; air scaled */
function withJump(p:Pose,tau:number,s0:number,airK:number):Pose{const u=(tau-s0)/HD;if(u<=-.3||u>=1.35)return p;
 const h=header(clamp(u));h.air*=airK;return blendPose(p,h,Math.min(sm(-.3,0,u),1-sm(1,1.35,u)));}
const CAN_YAW=(tau:number)=>tau<.55?yawU:lerpA(yawU,headYaw(CAN,tau,yawU),sm(.55,1.1,tau));
/** the whole pose of actor k at τ, with its yaw (Cannavaro's and Mertesacker's duel poses never read the ball, so the ball can be
 * built from Cannavaro's solved skeleton) */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau);
 let yaw:number;
 if(k===CAN)yaw=CAN_YAW(tau);
 else if(k===MER)yaw=tau<.9?yawU:lerpA(yawU,yawTo(k,tau,ballAt(tau)),sm(.9,1.5,tau));
 else if(k===POD&&tau>POD_T-.4&&tau<TACKLE+.5)yaw=lerpA(headYaw(k,tau,Math.PI),Math.PI,.5);
 else{const b=ballAt(tau);yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);}
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ger'?READY:stand();
 if(k===CAN&&tau>CAN_RX-.2&&tau<PASS_T+.1){const s=clamp((sp-2)/4.5);p=blendPose(idle,dribble(distOf(CAN,tau)/CYC,{foot:'r',speed:.55+.4*s}),clamp((sp-.3)/.8));}
 else if(k===POD&&tau>POD_T-.1&&tau<TACKLE){p=blendPose(idle,dribble(distOf(POD,tau)/3.4,{foot:'l',speed:.6}),clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.2);p=blendPose(idle,runCycle(distOf(k,tau)/(3.2+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===CAN||k===MER){const w=win(-2.4,k===CAN?H0+.05:H0+MER_LATE+.1,tau,.5,.3);if(w>0)p=blendPose(p,EYES_UP,w);
  // the leap: Cannavaro's at H0 (contact at τ 0, a touch more lift: his elevation), Mertesacker's MER_LATE later and lower
  p=k===CAN?withJump(p,tau,H0,1.12):withJump(p,tau,H0+MER_LATE,MER_AIR);
  // Cannavaro's arms go OUT for balance through the leap (the lesson), wider than the stock header's
  if(k===CAN){const u=(tau-H0)/HD;p=over(p,{lShA:98,rShA:98,lShF:26,rShF:26,lElb:30,rElb:30,lHand:.6,rHand:.6,neckP:-14},bump(.1,.85,u)*(1-bump(.4,.62,u)));}
  // Mertesacker, late: an elbow up, the other arm reaching (not at the ball yet), eyes on it
  else{const u=(tau-H0-MER_LATE)/HD;p=over(p,{lShA:64,lShF:50,lElb:70,rShA:78,rShF:48,rElb:88,neckP:-16},bump(.05,.9,u));}}
 if(k===CAN){const D=.7,u=(tau-(TACKLE-.6*D))/D;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  p=withStrike(p,tau,PASS_T,.7,'r',.4);
  // after the pass: a clenched-fist "go!" as the move runs on (inferred)
  if(tau>PASS_T+.5)p=over(p,{rShF:120,rShA:30,rElb:70,neckP:-12},sm(PASS_T+.5,PASS_T+1,tau)*(1-sm(PASS_T+2.2,PASS_T+2.8,tau)));}
 if(k===POD){const D=.7,u=(tau-(TACKLE+.2-.6*D))/D;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u))*.8);}
 if(k===TOT)p=withStrike(p,tau,TOT_PASS,.7,'r',.55);
 if(k===CROSSER)p=withStrike(p,tau,LAUNCH,.8,'l',.9);
 return{p,yaw};
}
function yawTo(k:number,tau:number,Pt3:V3){const[x,z]=posOf(k,tau);return yawOf(Pt3[0]-x,Pt3[2]-z);}
/** Cannavaro's skeleton at τ (world metres) — the header contact point, the arm rings, the height lines */
const skelOf=(k:number,tau:number):Skeleton=>{const{p,yaw}=poseOf(k,tau),[x,z]=posOf(k,tau),st=ACTORS[k].style;return solve(p,st.build,{x,z,yaw},st.scale??1);};
/** the top of a head (m): the head centre + its radius */
const headTop=(sk:Skeleton)=>sk.head[1]+.12*sk.s;

// ---------------------------------------------------------------- the ball: the high ball, the header, the bounce, Podolski, the ball won, the carry, Totti
const CYC=3.8;
/** the contact: the ball on Cannavaro's forehead at τ 0, from his solved skeleton */
const HEAD_PT:V3=(()=>{const sk=skelOf(CAN,0),f=[sk.face[0]-sk.head[0],sk.face[1]-sk.head[1],sk.face[2]-sk.head[2]],l=Math.hypot(f[0],f[1],f[2])||1;
 return[sk.face[0]+f[0]/l*.12,sk.face[1]+f[1]/l*.12+.03,sk.face[2]+f[2]/l*.12];})();
const CROSS_FROM:V3=(()=>{const[x,z]=posOf(CROSSER,LAUNCH);return[x-.45,.11,z-.2];})();
const LAND_PT:V3=[26.6,.11,6.3],POD_CTRL:V3=(()=>{const[x,z]=posOf(POD,POD_T);return[x-.5,.11,z-.1];})();
const podFoot=(tau:number)=>footSpot(POD,tau,Math.PI,'l',.5,.08);
const TACK_PT:V3=podFoot(TACKLE);
const canYawD=(tau:number)=>headYaw(CAN,tau,0);
const TOUCHES:number[]=(()=>{const out:number[]=[CAN_RX];let prev=distOf(CAN,CAN_RX)/CYC-touchPhase;
 for(let tau=CAN_RX+DT;tau<PASS_T-.3;tau+=DT){const ph=distOf(CAN,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.35)out.push(tau);prev=ph;}
 return[...out,PASS_T];})();
const TP:V3[]=TOUCHES.map(T=>footSpot(CAN,T,canYawD(T),'r',.48,.14));
const TOT_A:V3=(()=>{const[x,z]=posOf(TOT,TOT_RX);return[x-.4,.11,z+.15];})(),TOT_B:V3=(()=>{const[x,z]=posOf(TOT,TOT_PASS);return[x+.35,.11,z+.12];})();
const GIL_PT:V3=(()=>{const[x,z]=posOf(GIL,GIL_RX);return[x+.4,.11,z+.1];})();
const parab=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+h*4*u*(1-u),lerp(a[2],b[2],u)];
/** the header's flight (u 0..1 over 0..LAND1): up off his forehead and away, landing out of the box */
const clearAt=(u:number)=>parab(HEAD_PT,LAND_PT,u,2.4);
const highAt=(u:number)=>parab(CROSS_FROM,HEAD_PT,u,4.6);
function ballAt(tau:number):V3{
 if(tau<LAUNCH){const[x,z]=posOf(CROSSER,tau);return[x-.45,.11,z-.2];}
 if(tau<0)return highAt((tau-LAUNCH)/-LAUNCH);
 if(tau<LAND1)return clearAt(tau/LAND1);
 if(tau<POD_T)return parab(LAND_PT,POD_CTRL,(tau-LAND1)/(POD_T-LAND1),.45);
 if(tau<TACKLE)return lerp3(POD_CTRL,podFoot(tau),sm(POD_T,POD_T+.25,tau));
 if(tau<CAN_RX){const u=(tau-TACKLE)/(CAN_RX-TACKLE);return lerp3(TACK_PT,TP[0],1-Math.pow(1-u,1.6));}
 if(tau<PASS_T){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return lerp3(TP[k],TP[k+1],e);}
 if(tau<TOT_RX){const u=(tau-PASS_T)/(TOT_RX-PASS_T);return lerp3(TP[TP.length-1],TOT_A,1-Math.pow(1-u,1.3));}
 if(tau<TOT_PASS)return lerp3(TOT_A,TOT_B,easeOut((tau-TOT_RX)/(TOT_PASS-TOT_RX)));
 if(tau<GIL_RX)return parab(TOT_B,GIL_PT,(tau-TOT_PASS)/(GIL_RX-TOT_PASS),3.2);
 return footSpot(GIL,tau,headYaw(GIL,tau,0),'r',.5,.12);
}
/** ball spin for the panel print */
const spinAt=(tau:number)=>{const b=ballAt(tau);return(b[0]+b[2])/.11*.5+(tau>0&&tau<LAND1?tau*30:0);};

// ---------------------------------------------------------------- the ball print: the 2006 +Teamgeist (paper, navy propeller swirls)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:28}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 if(r>4){const bl=new Path2D();for(let i=0;i<2;i++){const a0=rot+i*Math.PI,q:Pt[]=[];for(let j=0;j<=6;j++){const a=a0+j*.28,rr=r*(.12+.85*j/6);q.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}bl.addPath(ribbon(q,r*.3,{seed:5+i,taper:.5,wobble:r*.01}));}s.fill(K,bl,.9);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.4,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;res:Record<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;smear?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,smear=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (the floodlights throw soft, short shadows); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg&&bq[2]>NEAR+.3)ball(s,bg[0],bg[1],Math.min(br,420),spinAt(tau));};
 let ballDone=!list.length||bq[2]>=list[0].d;const res:Record<number,DrawResult>={};if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only Cannavaro keeps 'mid'
  const detail=passing?(e.k===CAN?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  res[e.k]=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===CAN||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:smear&&e.k===CAN}:{});}
 if(!ballDone)drawBall();
 const out={list,bg,br,res};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring on the grass round (x, z) — who / where to look */
function ring3(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink:string,seed:number,dashed=false){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r*w,0,z+Math.sin(i/36*TAU)*r*.85*w]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(4,Math.min(26,kAt(c,[x,0,z])*.11)),{close:true,seed,taper:0,wobble:1,gaps:dashed?[[.1,.18],[.35,.43],[.6,.68],[.85,.93]]:[]});s.knockout(rr,.85*Math.min(1,w));s.fill(ink,rr,.95*Math.min(1,w));}
/** an actor's run painted on the grass from τ a to τ b */
function runTrail(s:Sheet,c:Cam,k:number,a:number,b:number,w:number,ink:string,seed:number,width=.34){if(w<=0||b<=a+.05)return;const pts:Pt[]=[];let d=0,n=0;
 for(let tau=a;tau<=b+1e-6;tau+=.1){const[x,z]=posOf(k,tau),q=toCam(c,[x,0,z]);if(q[2]<3)continue;pts.push(scr(c,q));d+=q[2];n++;}
 if(pts.length<3)return;const wd=Math.min(c.F*width/(d/n),26);s.knockout(ribbon(pts,wd*1.6,{seed,taper:.3,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{seed,taper:.3,wobble:.8}),.95*w);}
/** an arrow along 3D points (progress p) */
function arrow3(s:Sheet,c:Cam,P0:V3[],p:number,ink:string,seed:number,dashed=false,width=.3){if(p<=0)return;const pts:Pt[]=[];let d=0,n=0;
 const Pp:V3[]=[P0[0]];for(let i=1;i<P0.length;i++)for(let j=1;j<=8;j++)Pp.push(lerp3(P0[i-1],P0[i],j/8));
 for(const X of Pp){const q=toCam(c,X);if(q[2]<1)continue;pts.push(scr(c,q));d+=q[2];n++;}if(pts.length<2)return;
 const L=pts.length,cut=Math.max(2,Math.round(L*clamp(p))),seg=pts.slice(0,cut),wd=Math.min(c.F*width/(d/n),24);
 if(seg.length>2){s.knockout(ribbon(seg.slice(0,-1),wd*1.7,{seed,taper:.1,wobble:.8}),.7);s.fill(ink,ribbon(seg.slice(0,-1),wd,{seed,taper:.1,wobble:.8,gaps:dashed?[[.2,.3],[.45,.55],[.7,.8]]:[]}),.95);}
 const a=seg[Math.max(0,seg.length-2)],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3.2});}
/** a flight in the air (fn(u) for u0..u1: a riso trail) and its shadow on the grass */
function flightTrail(s:Sheet,c:Cam,fn:(u:number)=>V3,u0:number,u1:number,w:number,ink:string,seed:number,dashed=false){if(w<=0||u1<=u0+.01)return;const pts:Pt[]=[],gp:Pt[]=[];let d=0,n=0;
 for(let i=0;i<=24;i++){const u=lerp(u0,u1,i/24),Q=fn(u),q=toCam(c,Q);if(q[2]<1.5)continue;pts.push(scr(c,q));d+=q[2];n++;const g=pr(c,[Q[0],0,Q[2]]);if(g)gp.push(g);}
 if(pts.length<3)return;const wd=Math.min(c.F*.13/(d/n),20);
 if(gp.length>2)s.tone(K,ribbon(gp,wd*.8,{seed:seed+5,taper:.4,wobble:.6}),.35*w);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.6,wobble:.6}),.6*w);s.fill(ink,ribbon(pts,wd,{seed,taper:.6,wobble:.6,gaps:dashed?[[.12,.2],[.32,.4],[.52,.6],[.72,.8]]:[]}),.95*w);}
/** a ring round a screen point (a hand, the ball) */
function ring2(s:Sheet,q:Pt,r:number,w:number,ink:string,seed:number){if(w<=0)return;const rr=r*easeOutBack(clamp(w)),pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr]);}
 const rb=ribbon(pts,Math.max(3,rr*.2),{seed,close:true,taper:0,wobble:.8});s.knockout(rb,.8*Math.min(1,w));s.fill(ink,rb,.95*Math.min(1,w));}
/** a height bar standing on the grass beside a player: a post from the ground to h with a cap tick (grows with w) */
function heightBar(s:Sheet,c:Cam,x:number,z:number,h:number,w:number,ink:string,seed:number){if(w<=0)return;const top=h*easeOut(clamp(w)),post=new Path2D(),cap=new Path2D();
 seg3(c,[x,0,z],[x,top,z],.07,post,1.5);const dz:V3=[P[0]*.22,0,P[1]*.22];seg3(c,[x-dz[0],top,z-dz[2]],[x+dz[0],top,z+dz[2]],.07,cap,1.5);
 s.knockout(post,.8*w);s.fill(ink,post,.95*w);s.knockout(cap,.8*w);s.fill(ink,cap,.95*w);}
/** a level line across the duel at height y (the top of a head), from a to b on the ground */
function levelLine(s:Sheet,c:Cam,a:Pt,b:Pt,y:number,w:number,ink:string,seed:number,dashed=false){if(w<=0)return;const q0=pr(c,[a[0],y,a[1]]),q1=pr(c,[b[0],y,b[1]]);if(!q0||!q1)return;
 const pts:Pt[]=[];for(let i=0;i<=8;i++)pts.push([lerp(q0[0],q1[0],i/8),lerp(q0[1],q1[1],i/8)]);const wd=Math.max(4,Math.min(16,kAt(c,[a[0],y,a[1]])*.035));
 const rb=ribbon(pts,wd,{seed,taper:.1,wobble:.6,gaps:dashed?[[.15,.25],[.4,.5],[.65,.75]]:[]});s.knockout(ribbon(pts,wd*1.7,{seed,taper:.1,wobble:.6}),.6*w);s.fill(ink,rb,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const gs=CUE(0,'Germany send'),cf=CUE(0,'Captain'),gp=CUE(0,'giant'),hc=CUE(0,'heads'),S=SECS(0);
 return key(t,mono([[0,-5.2],[gs,LAUNCH-.35],[cf,-.95],[gp,-.45],[hc,.03],[S+1,.03+(S+1-hc)*.95]]),linear);};
const CAM1:V3=[52.5,27,68];
function cam1(t:number):Cam{
 const tau=tau1(t),hb=CUE(0,'high ball'),cf=CUE(0,'Captain'),hc=CUE(0,'heads'),S=SECS(0);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,1,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[34,1,-6],duel:V3=[11.6,1.5,1.2],m=smooth(CAN,tau),run:V3=[m[0]+4,1,m[1]+.5];
 const toBall=sm(CUE(0,'the last')+.2,CUE(0,'Germany send')+.4,t,easeInOutSine),toDuel=sm(hb,cf+.2,t,easeInOutSine),toRun=sm(hc+.8,S,t,easeInOutSine);
 const T=lerp3(lerp3(lerp3(open,bt,toBall),duel,toDuel),run,toRun);
 const F=key(t,mono([[0,1700],[CUE(0,'the last'),2000],[CUE(0,'Germany send')+.4,3300],[hb,3600],[cf+.2,6200],[hc,6800],[hc+.8,6600],[S,4800]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),hb=CUE(0,'high ball'),cf=CUE(0,'Captain'),gp=CUE(0,'giant'),hc=CUE(0,'heads'),E=SECS(0);
  stadium(s,c,v,t,{roar:sm(hc+.1,hc+.6,t)*.5,ita:sm(hc,hc+.5,t),flags:sm(0,.5,t)});
  ground(s,c);
  // "high ball": the ball's flight so far, a yellow trail through the air
  if(tau>LAUNCH&&tau<.2)flightTrail(s,c,highAt,Math.max(0,(tau-LAUNCH)/-LAUNCH-.45),clamp((tau-LAUNCH)/-LAUNCH),win(hb-.2,hc,t,.3,.3),Y,11);
  // who's who: a yellow ring under Cannavaro, a red one under Mertesacker (the taller man)
  ring3(s,c,DUEL[0],DUEL[1],1.3,win(cf-.1,hc+1.2,t,.3,.4),Y,12);
  ring3(s,c,MER_AT[0],MER_AT[1],1.3,win(gp-.1,hc+.9,t,.3,.4),R,13,true);
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:7,smear:true,after:()=>{
   // "heads it clear": a spark where his head meets it, then the clearance's trail out of the box
   const age=t-hc;if(age>-.3&&age<.6){const q=pr(c,HEAD_PT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,HEAD_PT)*.8),{n:9,seed:14,g:easeOutBack(clamp((age+.3)/.25))*(1-clamp((age-.35)/.25)),width:Math.max(6,kAt(c,HEAD_PT)*.06),cov:.95});}
   if(tau>0)flightTrail(s,c,clearAt,Math.max(0,tau/LAND1-.5),clamp(tau/LAND1),1-sm(E-1,E-.5,t),Y,15);}});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(CAN,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.1),12);},
 still:9.6,
};

// ---------------------------------------------------------------- 2 · slow replay from a low camera out in front of the duel (the two heads side by side)
const tau2=(t:number)=>{const me=CUE(1,'Mertesacker'),bc=CUE(1,'but'),jf=CUE(1,'jumps'),ao=CUE(1,'arms'),mt=CUE(1,'meets'),tp=CUE(1,'top');
 return key(t,mono([[0,-1.75],[me,-1.55],[bc,-.9],[jf,-.3],[ao,-.13],[mt,-.015],[tp,.02],[tp+.9,.06],[SECS(1),.55]]),linear);};
function cam2(t:number):Cam{
 const push=sm(CUE(1,'jumps')-.3,CUE(1,'top'),t,easeInOutSine),out=sm(CUE(1,'top')+.9,SECS(1),t,easeInOutSine);
 const mid:Pt=[(DUEL[0]+MER_AT[0])/2,(DUEL[1]+MER_AT[1])/2],d=10.5-1.2*push+1.5*out;
 const C:V3=[mid[0]+U[0]*d-P[0]*1.1,1.7+.2*push+.5*out,mid[1]+U[1]*d-P[1]*1.1],T:V3=[mid[0]-U[0]*.5+P[0]*.05,lerp(1.45,2.1,push)+.2*out,mid[1]-U[1]*.5+P[1]*.05];
 return look(C,T,lerp(2750,3000,push)-350*out);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),me=CUE(1,'Mertesacker'),ta=CUE(1,'taller'),jf=CUE(1,'jumps'),ao=CUE(1,'arms'),mt=CUE(1,'meets'),tt=CUE(1,'top'),E=SECS(1),fade=1-sm(E-.9,E-.55,t);
  stadium(s,c,v,t,{ita:sm(mt,mt+.4,t)*.8});
  ground(s,c);
  // "Mertesacker is … taller": height bars beside the two men (1.98 m red, 1.76 m yellow), gone once the jump starts
  const hw=win(me-.1,jf+.2,t,.45,.35);
  heightBar(s,c,MER_AT[0]+P[0]*.62,MER_AT[1]+P[1]*.62,1.98,hw,R,21);
  heightBar(s,c,DUEL[0]-P[0]*.62,DUEL[1]-P[1]*.62,1.76,win(ta-.25,jf+.2,t,.45,.35),Y,22);
  // "jumps first": his take-off spot on the grass
  ring3(s,c,DUEL[0],DUEL[1],.55,win(jf-.15,mt,t,.3,.3),Y,23);
  play(s,c,v,tau,tp,tau2(twos(t)-1/24),{minBall:5,smear:true,after:({res})=>{
   const cr=res[CAN],mr=res[MER];
   // "jumps first": a lift arrow from the grass up to him as he leaves the ground (Mertesacker still on it)
   const jw=win(jf-.1,ao+.1,t,.2,.3);if(jw>0){const[x,z]=posOf(CAN,tau);arrow3(s,c,[[x-P[0]*.75,.15,z-P[1]*.75],[x-P[0]*.75,1.1,z-P[1]*.75]],jw,Y,24,false,.1);}
   // "arms out": rings round both his hands (balance and a shield)
   const aw=win(ao-.1,mt+.2,t,.25,.3);if(cr&&aw>0){for(const[j,sd] of [['lHa',25],['rHa',26]] as const){const q=cr.joints[j];ring2(s,q,Math.max(10,cr.heightPx*.06),aw,Y,sd);}}
   // "meets": the spark at his forehead
   const age=t-mt;if(age>-.25&&age<.7){const q=pr(c,HEAD_PT);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,HEAD_PT)*.55,{n:10,seed:27,g:easeOutBack(clamp((age+.25)/.25))*(1-clamp((age-.45)/.25)),width:Math.max(5,kAt(c,HEAD_PT)*.04),cov:.95});}
   // "top of his leap": a yellow level line at the top of his head across both men, a red one at Mertesacker's (lower)
   const lw=win(tt-.15,E-.5,t,.3,.4)*fade;
   if(lw>0&&cr&&mr){const a:Pt=[DUEL[0]-P[0]*.5,DUEL[1]-P[1]*.5],b:Pt=[MER_AT[0]+P[0]*.6,MER_AT[1]+P[1]*.6];
    levelLine(s,c,a,b,headTop(cr.sk),lw,Y,28);levelLine(s,c,[MER_AT[0]-P[0]*.2,MER_AT[1]-P[1]*.2],b,headTop(mr.sk),lw,R,29,true);}}});
  streaks(s,v,1-sm(0,.5,t),31);
 },
 aperture(t){const c=cam2(t),q=toCam(c,HEAD_PT),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:5.4,
};

// ---------------------------------------------------------------- 3 · replay 2: a low chase camera beside him on the burst, lifting to show the move run on
const tau3=(t:number)=>{const th=CUE(2,'Then'),wb=CUE(2,'wins'),po=CUE(2,'Podolski'),ft=CUE(2,'finds'),tm=CUE(2,'That'),dp=CUE(2,'Del');
 return key(t,mono([[0,1.45],[th,1.7],[wb,TACKLE-.12],[po,TACKLE+.3],[ft,PASS_T+.05],[tm,TOT_PASS-.1],[dp,TOT_PASS+.9],[SECS(2),GIL_RX+.4]]),linear);};
const lift3=(t:number)=>sm(CUE(2,'That')-.3,CUE(2,'Del')+.2,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(CAN,Math.min(tau,PASS_T+.6)),u=lift3(t),b=ballAt(tau);
 const C0:V3=[m[0]-8.5,2.3,m[1]+6.2],T0:V3=[m[0]+6,.9,m[1]-1.2];
 const C1:V3=[m[0]-6,7.5,m[1]+9],T1:V3=[lerp(b[0],80,.35),.8,lerp(b[2],-6,.3)];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2250,1500,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),th=CUE(2,'Then'),wb=CUE(2,'wins'),po=CUE(2,'Podolski'),ft=CUE(2,'finds'),tm=CUE(2,'That'),dp=CUE(2,'Del'),E=SECS(2),u=lift3(t);
  stadium(s,c,v,t,{roar:sm(dp,dp+.4,t),flash:sm(dp,dp+.3,t)*(1-sm(E-1,E-.6,t)),ita:sm(dp-.2,dp+.3,t)});
  ground(s,c);
  // "bursts out": his run painted on the grass behind him, from the landing
  runTrail(s,c,CAN,.5,Math.min(tau,PASS_T)-.2,sm(th-.1,th+.4,t)*(1-sm(E-.9,E-.55,t)),R,41,.4);
  // "Podolski": a ring under the man he takes it from
  {const[x,z]=posOf(POD,tau);ring3(s,c,x,z,1.2,win(po-.15,ft,t,.3,.35),R,42,true);}
  // "finds Totti": the pass lane
  const fw=win(ft-.35,tm+.2,t,.25,.35);if(fw>0){const a=TP[TP.length-1];arrow3(s,c,[[a[0],0,a[2]],[TOT_A[0],0,TOT_A[2]]],fw,Y,43,true,.3);ring3(s,c,TOT_A[0],TOT_A[2],1.1,fw,Y,44);}
  // "That move": the move's road up the pitch, dashed, to Germany's goal (Totti → Gilardino → Del Piero, drawn as one lane)
  const mw=sm(tm-.2,dp+.3,t,easeOut)*(1-sm(E-.9,E-.55,t));if(mw>0)arrow3(s,c,[[TOT_B[0],0,TOT_B[2]],[GIL_PT[0],0,GIL_PT[2]],[88,0,-6],[103,0,-1]],mw,Y,45,true,.55);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,smear:u<.5,after:({res})=>{
   // "wins the ball": a spark where his boot meets it
   const age=t-wb;if(age>-.25&&age<.6){const P3:V3=[TACK_PT[0],.3,TACK_PT[2]],q=pr(c,P3);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,P3)*.6,{n:9,seed:46,g:easeOutBack(clamp((age+.25)/.25))*(1-clamp((age-.35)/.25)),width:Math.max(5,kAt(c,P3)*.05),cov:.95});}
   void res;}});
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(CAN,tau3(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.0,
};

// ---------------------------------------------------------------- 4 · the lesson: a three-quarter camera on the duel again
const tau4=(t:number)=>{const yt=CUE(3,'Your'),tb=CUE(3,'timing'),je=CUE(3,'Jump'),ua=CUE(3,'use'),hi=CUE(3,'head');
 return key(t,mono([[0,-1.7],[yt,-1.6],[tb,-1.2],[je,-.42],[ua,-.14],[hi,-.02],[hi+.5,.25],[SECS(3),1.05]]),linear);};
function cam4(t:number):Cam{
 const hi=CUE(3,'head'),g=sm(hi-.2,SECS(3),t,easeInOutSine);
 const mid:Pt=[(DUEL[0]+MER_AT[0])/2,(DUEL[1]+MER_AT[1])/2];
 const C:V3=[mid[0]+2.5+3*g,4.2+1.2*g,mid[1]+10.5+2*g],T:V3=[mid[0]+.6+5*g,1.35+.2*g,mid[1]+.4+1.5*g];
 return look(C,T,lerp(2500,2100,g));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your'),tb=CUE(3,'timing'),je=CUE(3,'Jump'),ua=CUE(3,'use'),hi=CUE(3,'head'),E=SECS(3),fade=1-sm(E-.9,E-.55,t);
  stadium(s,c,v,t,{ita:sm(hi,hi+.4,t)*.7});
  ground(s,c);
  // "timing beats height": the ball's path in, dashed, to the point he meets it; his take-off spot (yellow) and Mertesacker's (red, later)
  const tw=win(tb-.15,hi+.2,t,.3,.35);
  flightTrail(s,c,highAt,.55,1,tw,Y,51,true);
  ring3(s,c,DUEL[0],DUEL[1],.8,win(tb-.1,E,t,.3,.4)*fade,Y,52);
  ring3(s,c,MER_AT[0],MER_AT[1],.8,win(je-.1,hi+.4,t,.3,.4),R,53,true);
  // "head it high and away": the clearance's arc drawn ahead, dashed, then the ball follows it
  flightTrail(s,c,clearAt,0,sm(hi-.1,hi+.6,t,easeOut)*.8,sm(hi-.1,hi+.2,t)*fade,Y,54,true);
  play(s,c,v,tau,tp,tau4(twos(t)-1/24),{minBall:5,smear:true,after:({res})=>{
   const cr=res[CAN];
   // "Your turn": a burst over his head as the lesson starts
   const age=t-yt;if(age>-.1&&age<.6){const[x,z]=posOf(CAN,tau),P3:V3=[x,2.4,z],q=pr(c,P3);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,P3)*.6,{n:9,seed:55,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(4,kAt(c,P3)*.05)});}
   // "Jump early": the lift arrow beside him from the grass as he leaves it
   const jw=win(je-.1,ua+.3,t,.2,.3);if(jw>0){const[x,z]=posOf(CAN,tau);arrow3(s,c,[[x-P[0]*.8,.15,z-P[1]*.8],[x-P[0]*.8,1.3,z-P[1]*.8]],jw,Y,56,false,.1);}
   // "use your arms": rings round both hands
   const aw=win(ua-.1,hi+.3,t,.25,.3);if(cr&&aw>0)for(const[j,sd] of [['lHa',57],['rHa',58]] as const)ring2(s,cr.joints[j],Math.max(10,cr.heightPx*.07),aw,Y,sd);
   // "head it": the spark at his forehead
   const ah=t-hi;if(ah>-.2&&ah<.6){const q=pr(c,HEAD_PT);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,HEAD_PT)*.5,{n:9,seed:59,g:easeOutBack(clamp((ah+.2)/.2))*(1-clamp((ah-.35)/.25)),width:Math.max(4,kAt(c,HEAD_PT)*.04),cov:.95});}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'cannavaro-signature',format:'11v11',title:"Cannavaro Out-Jumps the Giant",theme:'Heading: timing beats height — jump early and use your arms for balance',
 ageNote:'World Cup semi-final, Germany v Italy, Westfalenstadion, Dortmund, 4 July 2006 (0–2 after extra time): the last minute of extra time. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — grass bits thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and dark crumbs thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(K,b,.7*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
