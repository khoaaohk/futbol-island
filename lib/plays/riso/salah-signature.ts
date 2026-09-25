/** Mohamed Salah's signature — cutting inside onto the left foot. The moment: Liverpool v Everton, the 229th Merseyside derby, Premier
 * League, Anfield, Liverpool, Sunday 10 December 2017 (Liverpool 1–1 Everton): the 42nd-minute goal that won the 2018 FIFA Puskás Award.
 * An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * printed as a riso sheet.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Salah a signature, not a match ("cutting inside onto the left foot"; lesson "Cut inside onto your
 * stronger foot and curl it into the far corner"). Wikipedia's "Mohamed Salah" (playing style) describes exactly that trait — a winger on
 * the right flank, "a position which allows him to cut into the centre onto his stronger left foot" — and this goal is its best-documented
 * example: received on the right edge of the box, cut inside, curled with the left foot around a defender into the FAR TOP CORNER, and it
 * won the Puskás Award, so every account describes it.
 *
 * SOURCES (Sept 2026, read as raw pages, cached under the build scratchpad films/src-cache/):
 *  - The Guardian, Andy Hunter, "Wayne Rooney penalty earns Everton unlikely derby point at Liverpool" (10 Dec 2017)
 *    https://www.theguardian.com/football/2017/dec/10/liverpool-everton-premier-league-match-report
 *  - The Guardian minute-by-minute, Ben Fisher, "Liverpool 1-1 Everton: Premier League – as it happened" (10 Dec 2017)
 *    https://www.theguardian.com/football/live/2017/dec/10/liverpool-v-everton-premier-league-live (pages 1–2)
 *  - BBC Sport, "Liverpool 1-1 Everton" (10 Dec 2017)  https://www.bbc.com/sport/football/42212594
 *  - Liverpool FC, "Salah's Merseyside derby goal wins Puskas Award" (24 Sep 2018) https://www.liverpoolfc.com/news/first-team/318067-salah-goal-fifa-puskas-award
 *  - Wikipedia (raw wikitext): "Mohamed Salah" (playing style, number 11, 2018 Puskás Award), "2017–18 Liverpool F.C. season" and
 *    "2017–18 Everton F.C. season" (match boxes, kit infoboxes), "FIFA Puskás Award" (2018: Salah, Liverpool v Everton, 38%)
 * CONFIRMED by those accounts: Sunday 10 December 2017, kick-off 14:15, Anfield, attendance 53,082, referee Craig Pawson; Salah scored on 42
 * minutes (1–0), Rooney's 77th-minute penalty made it 1–1; it was a snowy, chilly afternoon ("snowy, icy turf", "Pickford was left grasping
 * at snow"); the move came from a Liverpool free-kick deep in Everton's half (Gueye's foul on Mané, booked 42'), the ball was worked out to
 * Joe Gomez (bursting down the RIGHT flank), who found Salah on the edge of the penalty area; Salah spun away from a weak challenge by Cuco
 * Martina ("spinning away from his marker"), advanced into the box, cut inside / wriggled away from / held off Idrissa Gueye, and bent a
 * LEFT-footed shot ("an almost identical left-footed strike" came minutes later) "around Ashley Williams's torso" into the FAR, TOP corner;
 * "a sublime curling finish from an angle"; Jordan Pickford dived in vain; Salah was the right-sided winger ("Martina can't cope with
 * Salah"), wore 11; the goal won the 2018 FIFA Puskás Award. KIT: Liverpool's 2017/18 home kit, all red (Wikipedia kit infobox). Named
 * players on the pitch: Liverpool — Gomez, Lovren, Klavan, Robertson, Henderson, Milner, Oxlade-Chamberlain, Mané, Solanke, Salah;
 * Everton — Pickford, Kenny, Holgate, Williams, Martina, Gueye, Davies, Rooney, Sigurdsson, Calvert-Lewin, Niasse.
 * INFERRED (illustrative reconstruction): Everton in their 2017/18 home kit (royal blue shirt, white shorts and socks — the kit infobox's
 * home strip; not verified for that day, so the narration never names a colour); both keepers' kits (Pickford drawn yellow), the ball
 * (drawn white with navy panels), boots; the direction of play (Liverpool drawn attacking the Anfield Road end in the first half, left to
 * right on the main camera) and the Everton fans' corner there; the exact spots: where Gomez passed from, where Salah received (the right
 * corner of the box), which way he spun (drawn: out toward the touchline, away from Martina), the number and timing of his touches (drawn
 * with the left foot), where Gueye and Williams stood, the flight (≈ 15 m, ≈ .75 s, rising to chest height past Williams then dipping under
 * the bar), Pickford's dive to his right, the celebration (a run toward the corner, arms out); every other player's position; how heavy the
 * snow was (drawn: a light flurry and a dusted surround); Anfield's stands, crowd colours, the TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high Main Stand
 * camera, near real time, from Gomez to the goal and the roar; 2 = slow-motion replay from a low camera behind Salah's right shoulder: he
 * starts wide (the narrow shooting angle), cuts inside (the path arrow), onto his LEFT foot (a ring on the boot) and the goal opens up (the
 * angle wedge widens); 3 = replay from behind Everton's goal: the curl around Williams into the far top corner past Pickford's dive, then
 * the pan to the celebration; 4 = the lesson from a raised coaching angle behind him (cut-in arrow, stronger-foot ring, curl trail, far
 * corner target). Every body is the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Handedness: the world
 * is right-handed exactly like athlete.ts (x toward Everton's goal, y up, +z = Liverpool's right = the near touchline), so strike({foot:'l'})
 * is Salah's LEFT foot. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film;
 * every random value is seeded. Heat: small figures print at 'low', only named figures at full detail, everything capped in a passage. */
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
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Anfield, December 2017, in the snow: Liverpool against Everton. Joe Gomez passes to Mohamed Salah on the right. He spins away... cuts inside... left foot... what a goal!',tail:2.4,
  cues:['Anfield','in the snow','Liverpool against Everton','Joe Gomez','Mohamed Salah','He spins away','cuts inside','left foot','what a goal']},
 {label:'Watch it again',text:'Watch again, slowly. Salah starts wide on the right. He cuts inside, onto his stronger left foot, and suddenly the whole goal opens up.',tail:1.6,
  cues:['Watch again','starts wide','cuts inside','stronger left foot','the whole goal opens up']},
 {label:'Round the defender',text:"He curls it around Ashley Williams, into the far top corner. Jordan Pickford can't reach it. It won the Puskás Award!",tail:2.2,
  cues:['He curls it','Ashley Williams','far top corner','Pickford',"can't reach it",'Puskás Award']},
 {label:'Your turn',text:'Your turn: cut inside onto your stronger foot, then curl it into the far corner.',tail:1.8,
  cues:['Your turn','cut inside','stronger foot','curl it','far corner']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py salah-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/salah-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/salah-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('salah: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('salah: no cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Liverpool attack +X; Everton's goal line at 105, the Anfield Road end),
 * Y up, Z across (0 = the middle, +34 = the near touchline under the Main Stand camera = Liverpool's right). */
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

// ---------------------------------------------------------------- Anfield on a snowy December afternoon
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z, two tiers), 1 the Kop behind Liverpool's own goal (x < 0: one great
 * single tier), 2 the Main Stand (+z, the camera side, three tiers), 3 the Anfield Road end behind Everton's goal (x > 105). Corners open. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-9,114,a),1.4+23*b,-41-30*b],
 (a,b)=>[-9-36*b,1.4+31*b,lerp(40,-40,a)],
 (a,b)=>[lerp(114,-9,a),1.4+33*b,41+37*b],
 (a,b)=>[114+25*b,1.4+18*b,lerp(-38,38,a)],
];
const STAND_COLS=[100,76,100,64],STAND_ROWS=[12,15,14,10],TIERS=[[.5],[],[.36,.7],[]];
/** flags and banners along the stand fronts: [stand, a, b, 0 = red flag | 1 = red-and-paper halves | 2 = a long red banner] */
const FLAGS:[number,number,number,number][]=[[1,.12,.3,0],[1,.26,.55,1],[1,.4,.2,0],[1,.52,.62,2],[1,.66,.35,0],[1,.8,.5,1],[1,.9,.25,0],[0,.3,.1,2],[0,.12,.55,0],[0,.5,.2,1],[3,.6,.3,0],[3,.8,.5,1]];
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // a low grey snow sky, paler toward the horizon
 s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.3);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.12);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)[0,1].forEach(i=>s.knockout(polyPath([[-1e4,hz[1]+80-i*140],[1e4,hz[1]+80-i*140],[1e4,hz[1]-260-i*140],[-1e4,hz[1]-260-i*140]],true),.25));
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i])seg3(c,S(0,b),S(1,b),1.2,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.7),[0,12,0]),add3(S(0,.7),[0,12,0])]));
  seg3(c,add3(S(0,.7),[0,11.8,0]),add3(S(1,.7),[0,11.8,0]),.5,edge);}
 // red seats under the crowd, paper tier fascias
 s.knockout(planes);s.tone(R,planes,.62);s.tone(K,planes,.3);s.knockout(tier,.8);
 // the crowd: Liverpool red, winter white and navy coats, a few yellow stewards; Everton blue in the Anfield Road corner; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.4,16),away=si===3&&a<.26,lift=roar>0&&!away?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=away?(h<.62?3:0):h<.42?1:h<.7?0:h<.94?2:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.85);s.fill(B,inks[3],.95);s.fill(Y,inks[4],.95);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.8);
 const fl=new Path2D(),half=new Path2D();
 for(const[si,a,b0,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=kind===2?.1:.028,hb=kind===2?.04:.07,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,b0),P(1,b0),P(1,b0+hb),P(0,b0+hb)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===1)addPoly(half,polyP(c,[P(.5,b0),P(1,b0),P(1,b0+hb),P(.5,b0+hb)]));}
 s.knockout(fl);s.fill(R,fl,.95);s.knockout(half,.9);
 // floodlights on along the roof lips (a dim winter afternoon)
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.7),[0,11,0]),b=add3(S(u+.025,.7),[0,11,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.6);
}
/** snow-dusted surround, green grass with mowing stripes and a few snow patches, red boards, paper lines, both goals (Everton's drawn later
 * when it is in front of the players, i.e. from the camera behind it) */
const PATCHES:[number,number,number,number][]=(()=>{const r=rng(117),o:[number,number,number,number][]=[];for(let i=0;i<26;i++){const side=r()<.5?-1:1;o.push([r()*105,side*(30+r()*4.5),2+r()*5,.6+r()*1.4]);}
 for(let i=0;i<8;i++)o.push([r()<.5?r()*3:102+r()*3,(r()-.5)*60,1.2+r()*2,1+r()*2]);return o;})();
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sn=polyP(c,[[-12,0,-40],[117,0,-40],[117,0,40],[-12,0,40]]);if(sn.length<3)return;const snp=polyPath(sn,true);s.knockout(snp);s.tone(B,snp,.14);
 const g=polyP(c,[[-3,0,-36.5],[108,0,-36.5],[108,0,36.5],[-3,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.12);
 // snow lying along the touchlines and behind the goals ("snowy, icy turf"): soft paper patches
 const pt=new Path2D();for(const[x,z,a,b] of PATCHES){const q:V3[]=[];for(let i=0;i<10;i++){const u=i/10*TAU;q.push([x+Math.cos(u)*a,0,z+Math.sin(u)*b]);}addPoly(pt,polyP(c,q));}s.knockout(pt,.55);
 // LED boards: red with paper panels (no lettering) on the far side and behind both goals
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([-4,0,-38],[109,0,-38]);board([109,0,-37],[109,0,37]);board([-4,0,37],[-4,0,-37]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-37.95],[x+3.4,.25,-37.95],[x+3.4,.68,-37.95],[x,.68,-37.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.68,z+3.4],[108.95,.68,z]]));}
 s.knockout(bd);s.fill(R,bd,.85);s.fill(K,bd,.3);s.knockout(pn,.85);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-3);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz (high: the ball went in under the bar) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(.4+.6*y/1.9));
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
/** the flurry: seeded paper flakes drifting down across the frame (one knockout op) */
function snowfall(s:Sheet,v:View,t:number,amt=1,seed=3){if(amt<=.02)return;const p=new Path2D(),r=rng(seed),W=2*v.hx,H=2*v.hy;
 for(let i=0;i<64;i++){const x0=r()*W,y0=r()*H,sp=40+r()*70,sz=3+r()*6*(i%5===0?2:1),sw=Math.sin(t*1.3+i)*14;
  const y=((y0+t*sp)%H+H)%H-v.hy,x=((x0+t*12+sw)%W+W)%W-v.hx;p.moveTo(x+sz,y);p.arc(x,y,sz,0,TAU);}
 s.knockout(p,.85*amt);}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Liverpool 2017/18 home (confirmed): all red; paper trim and numbers (inferred) */
const LFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Everton 2017/18 home (inferred for the day): royal blue shirt, white shorts, white socks; navy trim */
const EFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Mohamed Salah, number 11 (confirmed), left-footed (confirmed); his 2017 curly hair (and beard — not modelled) */
const SALAH_ST=LFC({number:11,skin:SKIN_M,hairStyle:'curly',build:{height:1.75,bulk:.96,thighs:1.06},seed:11});
/** Jordan Pickford: keeper kit inferred (yellow) */
const PICK_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.6],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,build:{height:1.85},seed:1};
const REF:AthleteStyle={shirt:[K,.88],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'bald',line:K,sleeves:'long',seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Salah's first touch)
type Role='sal'|'lfc'|'efc'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a strike (contact at `at`) */
type Move={kind:'lunge'|'dive'|'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]; the named beats follow the accounts, every spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Salah',role:'sal',style:SALAH_ST,key:true,keys:[[-4.5,85.6,18.2],[-2.6,86.4,16.6],[-1.2,87.2,15.3],[-.25,87.6,14.95],[0,87.7,14.9],[.3,88.2,15.35],[.6,89.1,15.4],[1,90.5,14.4],[1.4,91.9,12.9],[1.8,93.2,11.3],[2.1,94.2,10],[2.4,94.9,9.1],[2.55,95.1,8.9],[2.85,95.5,8.6],[3.4,96.2,9.1],[4.2,97.2,12.6],[5,97.9,17.4],[5.8,98.3,21.2],[6.4,98.4,22.4],[9,98.4,22.6]]},
 {name:'Gomez',role:'lfc',style:LFC({number:12,skin:SKIN_D,seed:12}),key:true,engage:[-2,-.6],moves:[{kind:'strike',at:-1.05,dur:.8,side:'r',power:.4}],keys:[[-4.5,78,26.6],[-3,79.4,25.4],[-2.2,80.2,24.6],[-1.05,80.9,24],[0,81.6,23.3],[3,85,21.5],[9,92,20]]},
 {name:'Solanke',role:'lfc',style:LFC({number:29,skin:SKIN_D,build:{height:1.87},seed:29}),keys:[[-4.5,100.6,-3.6],[0,100.1,-3],[2.6,101,-2.2],[5,100.4,2],[9,99,8]]},
 {name:'Mane',role:'lfc',style:LFC({number:19,skin:SKIN_D,build:{height:1.75},seed:19}),keys:[[-4.5,98,-12.5],[0,98.4,-12.8],[2.6,99.6,-9.8],[5,99,-2],[9,98.6,10]]},
 {name:'Oxlade-Chamberlain',role:'lfc',style:LFC({number:21,skin:SKIN_M,seed:21}),keys:[[-4.5,90.8,-6.4],[0,91.8,-5.2],[2.6,93.8,-3],[5,96,6],[9,97.4,16]]},
 {name:'Milner',role:'lfc',style:LFC({number:7,seed:7}),keys:[[-4.5,83.6,-2],[0,84.6,-1.5],[9,90,6]]},
 {name:'Henderson',role:'lfc',style:LFC({number:14,hair:[K,.7],seed:14}),keys:[[-4.5,74,2],[0,75,2.5],[9,80,4]]},
 {name:'Robertson',role:'lfc',style:LFC({number:26,hair:[Y,.5],seed:26}),keys:[[-4.5,80,-27],[0,81,-26],[9,84,-20]]},
 {name:'Lovren',role:'lfc',style:LFC({number:6,seed:6,build:{height:1.88}}),keys:[[-4.5,60,-7],[9,63,-6]]},
 {name:'Klavan',role:'lfc',style:LFC({number:17,hair:[Y,.6],seed:17,build:{height:1.87}}),keys:[[-4.5,60,8],[9,63,8]]},
 {name:'Martina',role:'efc',style:EFC({number:44,skin:SKIN_D,seed:44}),key:true,engage:[-2.5,1.6],moves:[{kind:'lunge',at:.3,dur:.75,side:'l'}],keys:[[-4.5,88.8,13.2],[-1.2,88.4,14],[0,88.3,14.05],[.4,88.8,14.4],[.9,89.4,14.9],[1.6,90.4,14],[2.6,92.2,12.2],[4,93.4,11.4],[9,94,11.2]]},
 {name:'Gueye',role:'efc',style:EFC({number:17,skin:SKIN_D,hairStyle:'short',build:{height:1.74,bulk:1.04},seed:45}),key:true,engage:[.4,3],moves:[{kind:'lunge',at:2.08,dur:.7,side:'r'}],keys:[[-4.5,90.4,5.6],[0,91.1,7.4],[1,92.9,9.8],[1.6,94.2,11],[2.1,95.1,11],[2.5,95.7,10.3],[3,96.2,10.4],[9,97,11]]},
 {name:'Williams',role:'efc',style:EFC({number:5,hairStyle:'bald',build:{height:1.83,bulk:1.08},seed:46}),key:true,engage:[0,3.4],moves:[{kind:'lunge',at:2.72,dur:.7,side:'r'}],keys:[[-4.5,98.6,6.4],[0,98.4,5.4],[1.5,98.1,4.4],[2.3,98,3.7],[2.7,97.9,3.5],[9,98.4,3.4]]},
 {name:'Holgate',role:'efc',style:EFC({number:30,skin:SKIN_M,seed:47}),engage:[0,3],keys:[[-4.5,100,-1],[0,99.8,-1.6],[2.6,100.3,-2.3],[9,100.6,-2]]},
 {name:'Kenny',role:'efc',style:EFC({number:23,hair:[Y,.5],seed:48}),keys:[[-4.5,97,-11],[0,96.6,-10.4],[2.6,98,-8.4],[9,99,-7]]},
 {name:'Davies',role:'efc',style:EFC({number:26,skin:SKIN_M,hairStyle:'curly',seed:49}),engage:[.5,2.8],keys:[[-4.5,90,-2.4],[0,90.6,-1],[2.6,92.2,1.2],[9,93,2]]},
 {name:'Sigurdsson',role:'efc',style:EFC({number:10,hair:[Y,.5],seed:50}),engage:[0,2.8],keys:[[-4.5,85,4],[0,86,5.6],[2.6,88.6,7],[9,90,7]]},
 {name:'Rooney',role:'efc',style:EFC({number:10,hairStyle:'balding',build:{height:1.76,bulk:1.1},seed:51}),keys:[[-4.5,86,-8.4],[0,86.6,-7],[3,89,-5],[9,90,-5]]},
 {name:'Calvert-Lewin',role:'efc',style:EFC({number:29,skin:SKIN_M,build:{height:1.87},seed:52}),keys:[[-4.5,74,-4],[9,78,-3]]},
 {name:'Niasse',role:'efc',style:EFC({number:19,skin:SKIN_D,seed:53}),keys:[[-4.5,70,6],[9,74,5]]},
 {name:'Pickford',role:'gk',style:PICK_ST,key:true,moves:[{kind:'dive',at:3.12,dur:.95,side:'r'}],keys:[[-4.5,103.8,.8],[0,103.6,1.2],[2,103.4,1.5],[2.55,103.4,1.4],[9,103.4,1.4]]},
 {name:'referee',role:'ref',style:REF,keys:[[-4.5,79,4],[0,80.5,6],[9,84,8]]},
];
const SAL=0,GOM=1,MAR=10,GUE=11,WIL=12,PIC=20;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-5,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Gomez's pass, the spin, the left-foot touches inside, the curl
const PASS=-1.05,SHOT=2.55,IN_NET=SHOT+.78,SPIN_END=.6;
/** the touches (left foot): the first touch spinning away from Martina, three touches in, the drag inside Gueye; then the shot (inferred count) */
const TOUCHES=[0,.6,1.12,1.62,2.08,SHOT];
/** where the shot aims: the far top corner (under the bar, inside the far post) */
const GOALPT:V3=[105,2.12,-3.02],NET:V3=[106.5,1.7,-3.25],REST:V3=[106.3,.11,-2.9];
/** Salah's heading: facing Gomez to receive, then the spin out toward the touchline and round to the goal; square to the shot; then free */
function yawSal(tau:number):number{
 const v=velOf(SAL,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):yawOf(1,-.3);
 if(tau<SPIN_END){const g=posOf(GOM,PASS),m=posOf(SAL,tau),face=yawOf(g[0]-m[0],g[1]-m[1]);return lerpA(face,head,sm(-.08,SPIN_END,tau,easeInOutSine));}
 const w=sm(SHOT-.7,SHOT-.2,tau)*(1-sm(SHOT+.5,SHOT+1.1,tau));return lerpA(head,SHOT_YAW,w);
}
/** his forward and right directions on the ground (x, z) */
const fwdR=(y:number):[Pt,Pt]=>[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];
/** ball spot for the LEFT foot: ahead and a touch to his left */
function footAt(tau:number,yaw=yawSal(tau)):[number,number]{const p=posOf(SAL,tau),[f,r]=fwdR(yaw);return[p[0]+f[0]*.55-r[0]*.14,p[1]+f[1]*.55-r[1]*.14];}
/** the shot: a quadratic curve on the ground starting LEFT of the target (outside the far post, round Williams) and bending back right —
 * a left-footer's inside-foot curl; height rises to chest height past Williams and dips under the bar */
const SHOT_YAW=(()=>{const p=posOf(SAL,SHOT),dx=GOALPT[0]-p[0],dz=GOALPT[2]-p[1],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l;return yawOf(dx/l-rx*.3,dz/l-rz*.3);})();
const TP=TOUCHES.map(T=>footAt(T));
const S0=TP[TP.length-1];
const CURL:[Pt,Pt,Pt]=(()=>{const dx=GOALPT[0]-S0[0],dz=GOALPT[2]-S0[1],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l,k=.19*l;return[[S0[0],S0[1]],[(S0[0]+GOALPT[0])/2-rx*k,(S0[1]+GOALPT[2])/2-rz*k],[GOALPT[0],GOALPT[2]]];})();
function curlAt(u:number):V3{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*CURL[0][0]+b*CURL[1][0]+c*CURL[2][0],.12+(GOALPT[1]-.12)*Math.pow(u,1.25)+.75*Math.sin(Math.PI*u)*(1-.3*u),a*CURL[0][1]+b*CURL[1][1]+c*CURL[2][1]];}
/** Gomez's pass: from his right boot to Salah's feet */
const GP=():[number,number]=>{const g=posOf(GOM,PASS);return[g[0]+.5,g[1]-.35];};
function ballAt(tau:number):V3{
 if(tau<-2.2){const u=clamp((tau+4.5)/2.3),e=1-Math.pow(1-u,2),g=posOf(GOM,-2.2);return[lerp(74.5,g[0]+.5,e),.11,lerp(14.5,g[1]-.4,e)];}// the free-kick worked out to Gomez
 if(tau<PASS){const u=(tau+2.2)/(PASS+2.2),a=posOf(GOM,-2.2),b=GP(),e=1-Math.pow(1-u,1.8);return[lerp(a[0]+.5,b[0],e),.11,lerp(a[1]-.4,b[1],e)];}
 if(tau<0){const u=(tau-PASS)/-PASS,a=GP(),b=TP[0],e=1-Math.pow(1-u,1.3);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-Math.pow(1-u,2.4);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<IN_NET)return curlAt((tau-SHOT)/(IN_NET-SHOT));
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOALPT,NET,u);
 const w=clamp((tau-IN_NET-.2)/.5),e=w*w;return[lerp(NET[0],REST[0],w),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],w)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** showing for the pass: knees soft, arms out, eyes on the ball */
const RECEIVE:Partial<Pose>={lean:10,lHipF:24,lKnee:34,rHipF:20,rKnee:30,lShA:40,rShA:46,lElb:40,rElb:36,neckP:22};
/** the spin: low, the left sole rolling the ball round, the right arm out against Martina */
const SPIN:Partial<Pose>={lean:20,roll:-8,bend:-8,lHipF:30,lHipA:18,lKnee:40,lAnk:20,rKnee:52,rHipF:26,rShA:74,rShF:10,rElb:30,lShA:40,neckP:24,neckY:-10,squash:-.04};
/** a touch inside: the left leg reaches across and the laces/inside meet the ball, a glance down */
const PUSH_L:Partial<Pose>={lHipF:40,lKnee:24,lAnk:30,lHipR:-12,neckP:18};
/** the drag inside Gueye: body dipped left, right arm up holding him off */
const CUTIN:Partial<Pose>={roll:-10,bend:-12,lean:22,lKnee:56,rKnee:48,lHipA:-10,rShA:80,rShF:18,rElb:40,lShA:34,neckY:-10,squash:-.05};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(SAL,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]-.4&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0]-.4,a.engage[0],tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 // the keeper tracks the ball, then is set square to the shot (a dive's direction is fixed at the set: his right = −z, the far post)
 if(a.role==='gk')yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(-1,.3),sm(SHOT-.4,SHOT,tau));
 if(k===SAL)yaw=yawSal(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='efc'?READY:stand();
 if(sp>.5&&along<-.35*sp&&k!==SAL)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5),cyc=k===SAL?3.1:3.4;p=blendPose(idle,runCycle(distOf(k,tau)/cyc,{speed:s}),clamp((sp-.4)/.9));}
 for(const mv of a.moves??[]){const lead=mv.kind==='dive'?.55:mv.kind==='strike'?.52:.6,t0=mv.at-lead*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.85});
  if(mv.kind==='strike'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===SAL){
  p=over(p,RECEIVE,sm(-2.4,-1.4,tau)*(1-sm(-.3,.05,tau)));
  p=over(p,SPIN,bump(-.2,SPIN_END+.05,tau));
  for(const T of TOUCHES)if(T<SHOT&&T>.3&&Math.abs(tau-T)<.2)p=over(p,PUSH_L,bump(T-.2,T+.12,tau)*(T===TOUCHES[4]?.4:1));
  p=over(p,CUTIN,bump(1.85,2.4,tau));
  const D=.82,st=SHOT-.52*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau)*(1-sm(5.8,6.2,tau)));
  if(tau>5.8)p=blendPose(p,celebrate((tau-5.8)*.9,{kind:'arms'}),sm(5.8,6.2,tau));
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
 // soft ground shadows under a grey sky, batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.38);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===SAL?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===SAL||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===SAL}:{});
  if(e.k===SAL)heroR=r;}
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
/** the shooting angle: a wedge on the grass from the ball to both posts — narrow out wide, wide once he has cut inside */
function angleWedge(s:Sheet,c:Cam,from:[number,number],w:number,ink=Y){if(w<=0)return;
 const a=pr(c,[from[0],0,from[1]]),p1=pr(c,[105,0,-3.66]),p2=pr(c,[105,0,3.66]);if(!a||!p1||!p2)return;
 const wedge=polyPath([a,p1,p2],true);s.knockout(wedge,.35*w);s.tone(ink,wedge,.55*w);
 const q=toCam(c,[from[0],0,from[1]]),lw=Math.max(3,c.F*.05/q[2]);s.fill(ink,ribbon([a,p1],lw,{seed:91,taper:.3,wobble:.6}),.95*w);s.fill(ink,ribbon([a,p2],lw,{seed:92,taper:.3,wobble:.6}),.95*w);}
/** the cut inside: a red path on the grass tracing his run from the right edge of the box to the shot, arrowhead at the end */
function cutArrow(s:Sheet,c:Cam,w:number,prog=1,a0=0,a1=SHOT-.05){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=24;i++){const tau=lerp(a0,a1,i/24),m=posOf(SAL,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(SAL,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.13/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed:61,taper:.1,wobble:.8}),.7*w);s.fill(R,ribbon(sub,wd,{seed:62,taper:.1,wobble:.8,gaps:[[.18,.24],[.42,.48],[.66,.72]]}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,R,pv,e,wd,{seed:63,head:wd*3.2,cov:.95*w});}}
/** a ring round a boot (the stronger left foot) */
function bootRing(s:Sheet,hero:DrawResult|undefined,w:number,ink=Y){if(!hero||w<=0)return;const toe=hero.joints.lToe,an=hero.joints.lAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.85]);}
 const rr=ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8});s.knockout(rr,.8*w);s.fill(ink,rr,.95*w);}
/** the curl: a yellow dashed trail through the air along the ball's path, from the boot to where it is now (or all of it) */
function curlTrail(s:Sheet,c:Cam,tau:number,w:number,full=false){if(w<=0)return;const end=full?1:clamp((tau-SHOT)/(IN_NET-SHOT));if(end<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=28;i++){const q=pr(c,curlAt(end*i/28));if(q)pts.push(q);}if(pts.length<4)return;const q=toCam(c,curlAt(end*.5)),wd=Math.max(4,c.F*.09/q[2]);
 s.knockout(ribbon(pts,wd*1.5,{seed:71,taper:.4,wobble:.6}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:72,taper:.4,wobble:.6,gaps:[[.12,.18],[.3,.36],[.48,.54],[.66,.72],[.84,.9]]}),.95*w);}
/** the far top corner: a ring in the goal mouth where the ball goes in */
function cornerRing(s:Sheet,c:Cam,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<30;i++){const a=i/30*TAU,q=pr(c,[105,GOALPT[1]+Math.sin(a)*.42,GOALPT[2]+Math.cos(a)*.5]);if(q)pts.push(q);}if(pts.length<20)return;
 const q=toCam(c,[105,GOALPT[1],GOALPT[2]]),rr=ribbon(pts,Math.max(4,c.F*.07/q[2]),{close:true,seed:77,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high Main Stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'what a goal');return key(t,mono([[0,-4.5],[CUE(0,'Joe Gomez'),-2.3],[CUE(0,'Mohamed'),-.35],[CUE(0,'He spins'),.15],[CUE(0,'cuts inside'),1.7],[CUE(0,'left foot'),SHOT-.1],[G,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[62,22,66];
function cam1(t:number):Cam{
 const G=CUE(0,'what a goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,SHOT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[86,3,4],m=posOf(SAL,tau),cel:V3=[m[0]-.5,1,m[1]];
 const toBall=sm(CUE(0,'in the snow'),CUE(0,'Joe Gomez')+.3,t,easeInOutSine),toS=sm(G+.5,G+1.6,t,easeInOutSine),toGoal=sm(CUE(0,'cuts inside'),CUE(0,'left foot'),t,easeInOutSine)*(1-toS);
 const tb:V3=[lerp(open[0],bt[0]+2+2*toGoal,toBall),lerp(open[1],1.5,toBall),lerp(open[2],lerp(bt[2],3,.25+.2*toGoal),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,2200],[CUE(0,'Liverpool against'),2600],[CUE(0,'Joe Gomez'),3800],[CUE(0,'Mohamed'),4500],[CUE(0,'cuts inside'),5100],[G,5400],[G+1.6,7200],[S,7600]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'what a goal');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
  snowfall(s,v,t,1,3);
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(SAL,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera behind Salah's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-.9],[CUE(1,'starts wide'),-.15],[CUE(1,'cuts inside'),1.05],[CUE(1,'stronger'),2.05],[CUE(1,'the whole goal'),2.42],[SECS(1),2.62]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(SAL,Math.min(tau,2.3)),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUE(1,'the whole goal')-.4,CUE(1,'the whole goal')+.5,t,easeInOutSine);
 const C:V3=[m[0]-3-1.5*open-1.5*wide,1.6+.4*open+.9*wide,m[1]+8.2+1.5*open+1.2*wide],T:V3=[lerp(m[0]+2.4,100.5,wide*.8),lerp(.95,1.1,wide),lerp(m[1]-1.6,2.5,wide*.8)];
 return look(C,T,lerp(2700-300*open,2150,wide));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),sw=CUE(1,'starts wide'),ci=CUE(1,'cuts inside'),sf=CUE(1,'stronger'),wg=CUE(1,'the whole goal'),E=SECS(1);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  // "starts wide": the narrow angle from the right edge of the box, and a red ring where he receives
  const narrow=sm(sw-.1,sw+.4,t,easeOutBack)*(1-sm(ci+.2,ci+.7,t));angleWedge(s,c,TP[0],narrow*.8,R);groundRing(s,c,TP[0][0],TP[0][1],.8,R,narrow,42);
  // "cuts inside": the path of the run into the box
  cutArrow(s,c,sm(ci-.2,ci+.2,t)*(1-sm(E-.7,E-.3,t)),sm(ci-.2,ci+1.2,t),0,Math.min(SHOT-.05,Math.max(.3,tau)));
  // "the whole goal opens up": the wedge from the ball, now wide
  angleWedge(s,c,[ballAt(Math.min(tau,SHOT))[0],ballAt(Math.min(tau,SHOT))[2]],sm(wg-.15,wg+.45,t,easeOutBack)*(1-sm(E-.5,E-.2,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[SAL,MAR,GUE,WIL,PIC],after:({hero})=>{
   bootRing(s,hero,sm(sf-.1,sf+.35,t,easeOutBack)*(1-sm(E-.6,E-.3,t)));}});
  snowfall(s,v,t*.35,.8,5);
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(SAL,tau2(t)),q=toCam(c,[m[0],1.4,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind Everton's goal: the curl, the corner, Pickford, the celebration
const tau3=(t:number)=>{const pa=CUE(2,'Puskás');return key(t,mono([[0,1.95],[CUE(2,'He curls'),SHOT-.12],[CUE(2,'Ashley'),SHOT+.2],[CUE(2,'far top'),IN_NET-.08],[CUE(2,'Pickford'),IN_NET+.12],[CUE(2,"can't"),IN_NET+.45],[pa,5.2],[SECS(2),5.2+(SECS(2)-pa)*.8]]),linear);};
const swing3=(t:number)=>sm(CUE(2,"can't")+.2,CUE(2,'Puskás')+.3,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),C:V3=[117.5,5.2+.8*u,-7.5+2*u],e=sm(SHOT-.3,IN_NET,tau,easeInOutSine);
 const m=smooth(SAL,Math.min(tau,6.4)),T0:V3=[lerp(97,101.5,e),lerp(1.1,1.6,e),lerp(6.5,1.2,e)],T1:V3=[m[0]-.3,1.1,m[1]-.5];
 return look(C,lerp3(T0,T1,u),lerp(lerp(4300,3900,e),6600,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),hc=CUE(2,'He curls'),aw=CUE(2,'Ashley'),ft=CUE(2,'far top'),pk=CUE(2,'Pickford'),pa=CUE(2,'Puskás'),u=swing3(t);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  groundRing(s,c,...posOf(WIL,Math.min(tau,SHOT+.4)),.75,K,sm(aw-.15,aw+.3,t,easeOutBack)*(1-sm(ft+.3,ft+.7,t)),44);
  groundRing(s,c,...posOf(PIC,Math.min(tau,SHOT)),.8,K,sm(pk-.15,pk+.3,t,easeOutBack)*(1-sm(pa-.4,pa,t)),45);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[SAL,GUE,WIL,PIC],after:()=>{
   curlTrail(s,c,tau,sm(hc-.1,hc+.2,t)*(1-sm(pa-.3,pa+.1,t)));}});
  if(u<.5){goal3(s,c,105,1,bulgeAt(tau),GOALPT[2]);cornerRing(s,c,sm(ft-.15,ft+.3,t,easeOutBack)*(1-sm(pa-.3,pa+.1,t)));}
  // the Puskás Award: a yellow burst over the celebration
  const pw=sm(pa-.1,pa+.4,t);if(pw>0){const m=posOf(SAL,tau),q=pr(c,[m[0],2.6,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.4/toCam(c,[m[0],2.6,m[1]])[2],{n:10,seed:88,g:easeOutBack(pw),width:12,cov:.95});}
  snowfall(s,v,t*.4,.8,7);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(SAL,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle behind him, the whole move marked out
const tau4=(t:number)=>key(t,mono([[0,-.4],[CUE(3,'Your'),-.3],[CUE(3,'cut inside'),.3],[CUE(3,'stronger'),SHOT-.35],[CUE(3,'curl it'),SHOT+.05],[CUE(3,'far corner'),IN_NET-.05],[SECS(3),IN_NET+.25]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),orbit=sm(CUE(3,'curl it')-.5,CUE(3,'far corner')+.3,t,easeInOutSine),m=smooth(SAL,Math.min(tau,SHOT));
 const C:V3=[lerp(86.5,88,orbit),lerp(6.4,6.2,orbit),lerp(27,24,orbit)],T:V3=[lerp(m[0]+3.5,98,orbit*.7),.2,lerp(m[1]-2.5,3,orbit*.7)];
 return look(C,T,lerp(2900,2600,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your'),ci=CUE(3,'cut inside'),sf=CUE(3,'stronger'),cl=CUE(3,'curl it'),fc=CUE(3,'far corner'),E=SECS(3);
  stadium(s,c,v,t,[0,3]);
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2]});
  groundRing(s,c,TP[0][0],TP[0][1],.8,R,sm(yt,yt+.4,t,easeOutBack)*(1-sm(E-.6,E-.3,t)),42);
  cutArrow(s,c,sm(ci-.2,ci+.2,t)*(1-sm(E-.6,E-.3,t)),sm(ci-.1,ci+1.1,t));
  angleWedge(s,c,S0,sm(sf-.1,sf+.4,t)*(1-sm(cl+.2,cl+.6,t))*.8);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[SAL,GUE,WIL,PIC],after:({hero})=>{
   bootRing(s,hero,sm(sf-.1,sf+.35,t,easeOutBack)*(1-sm(E-.6,E-.3,t)));
   curlTrail(s,c,tau,sm(cl-.15,cl+.2,t)*(1-sm(E-.6,E-.3,t)),t>cl+.2);}});
  cornerRing(s,c,sm(fc-.15,fc+.3,t,easeOutBack)*(1-sm(E-.6,E-.3,t)));
  snowfall(s,v,t*.3,.6,9);
 },
 still:2.6,
};

const film:RisoStory={
 id:'salah-signature',format:'11v11',title:"Salah's cut inside",theme:'Cutting inside onto the stronger foot and curling it into the far corner',
 ageNote:'Premier League, Liverpool 1–1 Everton, Anfield, 10 December 2017: the 2018 FIFA Puskás Award goal. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a puff of snow off the turf — paper flakes thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}puff(s,x,y,age,seed);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** snow puff: paper and green bits thrown from a point, ballistic, 0..1 s */
function puff(s:Sheet,x:number,y:number,age:number,seed:number){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*2,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*2,z=12+r()*16;(i%3?a:b).addPath(polyPath(blob(px,py,z,z*.8,i+seed,{amp:.1,n:10}),true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(a,.95*fade);s.fill(Y,b,.9*fade);s.tone(B,b,.6*fade);
}
export default film;
