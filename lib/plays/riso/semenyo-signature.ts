/** Antoine Semenyo's SIGNATURE film, "the powerful run and shot": his equaliser for Bournemouth at Anfield, Liverpool 4–2 Bournemouth,
 * Premier League opening night, Friday 15 August 2025, 76th minute (2–1 → 2–2). An iconic-play riso film (RisoStory, chapters mode)
 * played by the card's picture window: a 1:1 reconstruction from WRITTEN accounts and one press photograph (the footage itself was not
 * reviewed), printed as a riso sheet. Kid-appropriate: the racist abuse Semenyo reported that night is part of the match record but is
 * not narrated in a film for 7–12 year olds; the late Liverpool goals (4–2) are not shown either — the film is about the run and shot.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Semenyo a signature, not a match ("the powerful run and shot", lesson "Carry the ball at speed
 * into space, then shoot before the defender recovers"). This goal is that lesson in one documented action: Liverpool's attack breaks
 * down, Semenyo carries the ball 40–50 yards through the middle while Liverpool's centre-backs back off, and he shoots early, low into
 * the bottom corner, before anyone gets to him. The written sources DESCRIBE the play (the break, the carry down the middle, the two
 * centre-backs not engaging, the right-foot finish into the bottom corner), so it is staged inside the real match; no separate
 * "how he does it" demonstration is needed. Nothing drawn contradicts the accounts; every guess is listed under INFERRED.
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - BBC Sport live page + match report, Phil McNulty at Anfield, "Liverpool 4-2 Bournemouth" (15 Aug 2025), pages 1 and 2
 *    https://www.bbc.com/sport/football/live/ce833z5j7yzt  (the 76-min "GOAL" entry; Stephen Warnock on BBC Radio 5 Live; line-ups)
 *  - BBC press photograph on that page, "Semenyo fires an equaliser into the net" (Reuters/Getty), and the captions "Semenyo slides on
 *    his knees to celebrate his second goal", "Van Dijk reacts to Bournemouth's equaliser".
 *  - Wikipedia, "Antoine Semenyo" (raw wikitext): 1.85 m, winger; two goals at Anfield on 15 Aug 2025, 64' and 76'.
 * CONFIRMED by those accounts: Anfield, Friday 15 August 2025, the season's opening match; Liverpool led 2–0 (Ekitiké 37', Gakpo 49'),
 * Semenyo made it 2–1 on 64'; on 76' "a Liverpool attack breaks down" — "Mohamed Salah loses the ball on the edge of the box and
 * Bournemouth break" — and Semenyo "breaks from way inside his own area, races down the middle with the Liverpool defence scrambling
 * before he hammers a fine strike into the back of the net" for 2–2 (BBC); "Virgil van Dijk and Ibrahima Konaté just watch the ball,
 * neither of them go towards Semenyo. At one point he's carried the ball for 40-50 yards and he just pulls the ball onto his right foot and
 * finds the bottom corner" (Warnock); the assist is credited to Hamed Traoré (25), on as a 74' substitute for Alex Scott; Semenyo wore 24;
 * Liverpool: Alisson (1), Konaté (5), van Dijk (4, captain), Salah (11), Szoboszlai (8), Wirtz (7), Gakpo (18), with Endo (3), Robertson
 * (26) and Curtis Jones (17) on as substitutes by then; Bournemouth: Evanilson (9), Tavernier (16), Brooks (7), Adams (12), Senesi (5),
 * Diakité (18), Smith (15), Truffert (3), Petrović (1); the photograph shows Bournemouth in ALL ROYAL BLUE (shirt, shorts, socks; white
 * name and number), Liverpool ALL RED (red socks), Alisson in a pale MINT-GREEN keeper kit, a floodlit evening; it is taken from behind
 * Semenyo: he strikes with his RIGHT foot between Konaté (5, on his left) and van Dijk (4, on his right), Alisson goes down, and the ball
 * is low beside the post on the shooter's right; Semenyo celebrated with a knee slide. Liverpool's 4th goal (Salah, 90+4') was "in front
 * of The Kop", so in the second half Bournemouth attacked the Anfield Road end.
 * INFERRED (illustrative reconstruction; none of it named in the narration): who took the ball off Salah (drawn: Senesi's block) and
 * where (≈ 19 m out, Liverpool's right); Traoré's position and the pass (drawn: collected ≈ 26 m out, a right-foot ball forward); where
 * Semenyo received it (drawn: just inside his own half, ≈ 47 m from where he shot); his exact line, speed and number of touches (drawn:
 * right-foot pushes every ≈ 1.15 s, then the left-foot touch across that sets the ball on his right foot); the shooting spot (drawn:
 * ≈ 17 m out, slightly right of centre); the centre-backs' tracks (drawn: backing off, turning to run, then side-on); every other player's
 * position; Alisson's dive (drawn: to his left, the ball past his hands); the celebration line (drawn: away toward the Main Stand side,
 * then the knee slide); which end is on which side of the main camera (drawn: the Anfield Road end on the right, the Kop on the left);
 * where the Bournemouth fans sat (drawn: a red-and-navy block in the Anfield Road end, the corner near the Main Stand); Anfield as drawn
 * (the Kop one great tier, the Kenny Dalglish Stand opposite the camera, red seats, a navy night sky); the ball's design; the camera
 * positions and lenses; Semenyo's hair is drawn short, as on his card.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand
 * camera, near real time, panning from Salah losing the ball to the goal and the knee slide; 2 = slow-motion replay from a low touchline
 * camera running alongside Semenyo: his carry (red trail), the empty space in front of him (yellow), the centre-backs backing away (navy
 * rings, dashed arrows); 3 = replay from behind him (the press photograph's angle): the touch onto his right foot, the low shot (yellow
 * arrow) into the bottom corner; 4 = the lesson from a raised coaching angle: carry at speed (red), into space (yellow), shoot before the
 * defenders get back (navy arrows falling short, the yellow shot). Every body is the shared riso athlete (lib/plays/riso/athlete.ts)
 * through ONE adapter, drawPlayer(). Handedness: the world is right-handed exactly like athlete.ts (x toward Liverpool's goal, y up,
 * +z = the near touchline under the main camera = Bournemouth's right), so strike({foot:'r'}) is Semenyo's RIGHT foot and keeperDive
 * side 'l' is Alisson's left (+z). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times
 * the film; every random value is seeded. Heat: small figures print at 'low', only named figures at full detail, everything capped in a
 * passage; four plates (the keeper's mint is yellow overprinted on a light blue screen, no fifth ink). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,strike,keeperSet,keeperDive,backpedal,lunge,celebrate,stand,posed,blendPose,solve,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Anfield, 2025. Liverpool lead two-one, but Bournemouth win the ball. Antoine Semenyo runs from his own half, straight down the middle. Nobody stops him... bottom corner! Two-two!',tail:3.4,
  cues:['Anfield','Liverpool lead','but Bournemouth','Antoine Semenyo','straight down','Nobody','bottom corner']},
 {label:'Watch it again',text:'Watch again. He carries the ball fast into the empty space. The defenders back away and just watch... but he does not wait!',tail:1.5,
  cues:['Watch again','He carries','into the empty','The defenders','just watch','but he does']},
 {label:'Behind the shot',text:'From behind him: he moves the ball onto his right foot and shoots, low into the bottom corner!',tail:2.6,
  cues:['From behind','he moves','onto his right','and shoots','low into']},
 {label:'Your turn',text:'Your turn: carry the ball at speed into space. Then shoot before the defender gets back!',tail:1.8,
  cues:['Your turn','carry the ball','into space','Then shoot','before the defender']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py semenyo-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/semenyo-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/semenyo-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('semenyo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('semenyo: no cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
const frame=(s:Sheet)=>{LENS=Math.pow(Math.min(1,s.W/1620),.45);return view(s,cam(s,0,0,1));};

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Bournemouth attack +X; Liverpool's goal line at 105, the Anfield Road
 * end), Y up, Z across (0 = the middle, +34 = the near touchline under the main camera = Bournemouth's right; −34 = the far side). */
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

// ---------------------------------------------------------------- Anfield on a floodlit August evening
/** stand planes (a along, b up the rake 0..1): 0 the Kenny Dalglish Stand opposite the camera (−z, two tiers), 1 the Kop behind
 * Bournemouth's own goal (x < 0: one great single tier), 2 the Main Stand (+z, the camera side, three tiers), 3 the Anfield Road end
 * behind Liverpool's goal (x > 105, two tiers; the Bournemouth fans in its corner by the Main Stand). Corners open to the night sky. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-12,117,a),1.3+24*b,-41-30*b],
 (a,b)=>[-10-36*b,1.3+31*b,lerp(40,-40,a)],
 (a,b)=>[lerp(117,-12,a),1.3+33*b,41+37*b],
 (a,b)=>[115+28*b,1.3+25*b,lerp(-40,40,a)],
];
const STAND_COLS=[100,76,100,70],STAND_ROWS=[13,16,15,12],TIERS=[[.5],[],[.36,.7],[.52]];
/** the away block (inferred): the Anfield Road end, its Main Stand corner */
const AWAY=(si:number,a:number)=>si===3&&a>.72;
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // an August night on Merseyside: a navy sky, a floodlit blue haze low down
 s.field(K,.55,.5);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i])seg3(c,S(0,b),S(1,b),1.2,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.7),[0,12,0]),add3(S(0,.7),[0,12,0])]));
  seg3(c,add3(S(0,.7),[0,11.8,0]),add3(S(1,.7),[0,11.8,0]),.5,edge);}
 // red seats under the crowd, the paper tier fascias
 s.knockout(planes);s.tone(R,planes,.66);s.tone(K,planes,.3);s.knockout(tier,.8);
 // the crowd: Liverpool red, white and navy; the Bournemouth block in red and navy (their home stripes) — only they jump at this goal
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const away=AWAY(si,a),z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0&&away?roar*z*1.4*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=away?(h<.6?1:2):h<.4?1:h<.72?0:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 // floodlights along the roof lips
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.7),[0,11,0]),b=add3(S(u+.025,.7),[0,11,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
}
/** the dark surround, floodlit grass with mowing stripes, red boards, paper lines, both goals (Liverpool's drawn later when it is in front
 * of the players, i.e. from the camera behind the play) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean}={}){
 const sn=polyP(c,[[-10,0,-41],[115,0,-41],[115,0,41],[-10,0,41]]);if(sn.length<3)return;const snp=polyPath(sn,true);s.knockout(snp);s.tone(K,snp,.4);s.tone(B,snp,.3);
 const g=polyP(c,[[-4,0,-37],[109,0,-37],[109,0,37],[-4,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: red with paper panels (no lettering) on the far side and behind both goals
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([-5,0,-38.5],[110,0,-38.5]);board([110,0,-37.5],[110,0,37.5]);board([-5,0,37.5],[-5,0,-37.5]);
 for(let k=0;k<18;k++){const x=-3+k*6.3;addPoly(pn,polyP(c,[[x,.25,-38.45],[x+3.4,.25,-38.45],[x+3.4,.68,-38.45],[x,.68,-38.45]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[109.95,.25,z],[109.95,.25,z+3.4],[109.95,.68,z+3.4],[109.95,.68,z]]));}
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
 goal3(s,c,0,-1,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out low around where the ball went in (GOALPT) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number){
 const z0=-3.66,z1=3.66,H=2.44,bz=GOALPT[2],back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(1-.6*Math.abs(y-.3)/1.9));
 const zs=[z0,-2.6,-1.3,0,1.3,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.025,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.72);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]],SKIN_DD:InkFill[]=[[R,.4],[Y,.45],[K,.34]];
/** Liverpool that night: all red (confirmed by the photograph: shirts, shorts, socks); paper trim and numbers */
const LFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Bournemouth that night: all royal blue (confirmed: shirt, shorts, socks), white numbers; navy trim (inferred) */
const AFCB=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Antoine Semenyo (playerAppearance.json: skin 5, short hair, stubble; Ghana): 24 (confirmed), 1.85 m, a powerful runner */
const SEM_ST=AFCB({number:24,skin:[[R,.42],[Y,.48],[K,.28]],hairStyle:'short',build:{height:1.85,bulk:1.06,thighs:1.12},seed:24});
/** Alisson: the pale mint keeper kit (confirmed by the photograph), printed as a light blue screen overprinted yellow (see drawPlayer), 1 */
const GK_ST:AthleteStyle={shirt:[B,.38],shorts:[B,.38],socks:[B,.38],boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.93,bulk:1.02},seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs;
 * mint = overprint yellow on the keeper's light blue kit (shirt, sleeves, shorts) so he prints mint green with four plates. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;mint?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.mint){const j=r.joints,wd=Math.hypot(j.lSh[0]-j.rSh[0],j.lSh[1]-j.rSh[1]),hl=Math.hypot(j.chest[0]-j.pelvis[0],j.chest[1]-j.pelvis[1]),w=Math.max(wd,hl*.7)*.34,p=new Path2D();
  const hullP=(q:Pt[])=>{const cx=q.reduce((a,b)=>a+b[0],0)/q.length,cy=q.reduce((a,b)=>a+b[1],0)/q.length;return polyPath(q.slice().sort((a,b)=>Math.atan2(a[1]-cy,a[0]-cx)-Math.atan2(b[1]-cy,b[0]-cx)),true);};
  p.addPath(ribbon([j.chest,j.pelvis],w*2.3,{taper:0,wobble:.3}));
  p.addPath(ribbon([j.lSh,j.lEl,j.lHa],w*.8,{taper:.2,wobble:.3}));p.addPath(ribbon([j.rSh,j.rEl,j.rHa],w*.8,{taper:.2,wobble:.3}));
  p.addPath(hullP([j.lHip,j.rHip,[lerp(j.rHip[0],j.rKn[0],.45),lerp(j.rHip[1],j.rKn[1],.45)],[lerp(j.lHip[0],j.lKn[0],.45),lerp(j.lHip[1],j.lKn[1],.45)]]));
  s.fill(Y,p,.6);}
 return r;
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Semenyo's first touch)
type Role='sem'|'lfc'|'afc'|'gk';
type Move={kind:'strike'|'lunge';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}

/** the beats (inferred timing; the accounts give the order): Salah loses it (LOSS), Traoré collects and plays it forward, Semenyo's first
 * touch (τ 0), right-foot pushes every ≈ 1.15 s (TOUCHES), the left-foot touch that sets it on his right foot (SET), the shot (SHOT = the
 * right boot on the ball), the ball in the net, the knee slide */
const LOSS=-3.3,TR_RX=-2.35,TR_PASS=-1.25,TOUCHES=[0,1.15,2.3,3.45,4.6],SET=5.4,SHOT=5.95,IN_NET=SHOT+.6,SL0=SHOT+2.5,SLD=1.3;
/** run phase at each touch: a right-foot touch sits at phase n + .92 (the right leg reaching), the left touch at n + .42 */
const PHASE_KEYS:[number,number][]=[[-7,-7.4],[-2.5,-2.08],[0,.92],[1.15,2.92],[2.3,4.92],[3.45,6.92],[4.6,8.92],[SET,10.42]];
/** the knee slide: from P_SL along heading HS (away toward the Main Stand side), the slide's own travel moves the body */
const P_SL:[number,number]=[94.6,12.4],HS:[number,number]=(()=>{const l=Math.hypot(.3,1);return[.3/l,1/l];})(),SL_YAW=yawOf(HS[0],HS[1]);
const slideP=(u:number)=>celebrate(clamp(u),{kind:'kneeSlide'});
const slidePos=(tau:number):[number,number]=>{const d=slideP((tau-SL0)/SLD).dx;return[P_SL[0]+HS[0]*d,P_SL[1]+HS[1]*d];};
const P_SLE=slidePos(SL0+SLD);

const ACTORS:Actor[]=[
 {name:'Semenyo',role:'sem',style:SEM_ST,key:true,moves:[{kind:'strike',at:SHOT,dur:.9,side:'r',power:1}],
  keys:[[-7,33,6],[-4,33.6,5.2],[LOSS,34,4.8],[-2.3,35.2,4],[-1.2,37.9,2.6],[0,42,1.2],[1.15,50.6,.9],[2.3,59.8,.6],[3.45,69.1,.5],[4.6,78.2,.8],[SET,84.2,1.2],[SHOT,87.8,1.5],
   [SHOT+.5,89.9,1.9],[SHOT+1.3,92.2,4.6],[SHOT+1.9,93.6,8.4],[SL0,P_SL[0],P_SL[1]],[SL0+SLD,P_SLE[0],P_SLE[1]],[14,P_SLE[0],P_SLE[1]]]},
 {name:'Konaté',role:'lfc',style:LFC({number:5,skin:SKIN_DD,build:{height:1.94,bulk:1.06},seed:5}),key:true,
  keys:[[-7,50,-7],[-3,54,-6.6],[0,58,-6],[1.3,62,-5.6],[2.5,68.5,-4.8],[3.6,75,-4],[4.7,81.4,-3.2],[5.3,84.5,-2.8],[SHOT,86.6,-2.4],[SHOT+.8,87.8,-2.2],[14,88.4,-2]]},
 {name:'van Dijk',role:'lfc',style:LFC({number:4,skin:SKIN_M,build:{height:1.95,bulk:1.06},seed:4}),key:true,
  keys:[[-7,52,8],[-3,56,7.8],[0,60,7.5],[1.3,64.5,7],[2.5,71,6.2],[3.6,77.5,5.2],[4.7,84,4.3],[5.3,87.6,3.9],[SHOT,90.2,3.6],[SHOT+.8,91.2,3.4],[14,91.6,3.3]]},
 {name:'Alisson',role:'gk',style:GK_ST,key:true,keys:[[-7,99.5,0],[0,100.4,.1],[3,101.2,.3],[5,101.9,.4],[14,101.9,.4]]},
 {name:'Salah',role:'lfc',style:LFC({number:11,skin:SKIN_M,hairStyle:'curly',build:{height:1.75,bulk:.96},seed:11}),moves:[],
  keys:[[-7,27,-10.5],[-5,23.4,-9.2],[LOSS,19.4,-7.8],[-2.4,19.2,-7.4],[-1,20.4,-7],[2,26,-6.4],[8,36,-5],[14,42,-4]]},
 {name:'Traoré',role:'afc',style:AFCB({number:25,skin:SKIN_DD,build:{height:1.8,bulk:.98},seed:25}),moves:[{kind:'strike',at:TR_PASS,dur:.8,side:'r',power:.55}],
  keys:[[-7,29,-5],[-4,26.6,-4],[TR_RX,25.6,-3.2],[TR_PASS,26.8,-2.6],[0,31,-2.2],[3,44,-2],[6,62,-3],[SL0,78,2],[14,88,9]]},
 {name:'Senesi',role:'afc',style:AFCB({number:5,seed:55,hair:[K,.8],build:{height:1.85}}),moves:[{kind:'lunge',at:LOSS,dur:.9,side:'r'}],
  keys:[[-7,15,-5],[-4,17.2,-6.2],[LOSS,18.1,-6.9],[-2,18.3,-6.5],[3,23,-5],[14,34,-3]]},
 {name:'Szoboszlai',role:'lfc',style:LFC({number:8,hair:[Y,.45],build:{height:1.86},seed:8}),keys:[[-7,31,-6],[-3,33.4,-5.5],[0,35.4,-5.5],[2,49,-6],[4,64,-6.5],[SHOT,78.6,-6.5],[SHOT+1.5,84,-5],[14,86,-4]]},
 {name:'Jones',role:'lfc',style:LFC({number:17,skin:SKIN_M,seed:17}),keys:[[-7,27,3],[0,30,4],[3,38,3.5],[14,56,3]]},
 {name:'Wirtz',role:'lfc',style:LFC({number:7,hair:[Y,.5],seed:71}),keys:[[-7,22,6],[0,25,8],[3,31,7],[14,44,6]]},
 {name:'Gakpo',role:'lfc',style:LFC({number:18,skin:SKIN_M,build:{height:1.93},seed:18}),keys:[[-7,19,15],[0,23,15.5],[3,30,14],[14,44,12]]},
 {name:'Robertson',role:'lfc',style:LFC({number:26,hair:[R,.6],seed:26}),keys:[[-7,37,21],[0,42,21],[3,55,19],[SHOT,66,17],[14,72,15]]},
 {name:'Endo',role:'lfc',style:LFC({number:3,hair:K,seed:3}),keys:[[-7,41,-20],[0,45,-19],[3,56,-16],[SHOT,66,-13],[14,72,-12]]},
 {name:'Evanilson',role:'afc',style:AFCB({number:9,skin:SKIN_M,hairStyle:'curly',seed:9}),keys:[[-7,36,-10],[0,43,-10.5],[3,58,-10],[SHOT,76,-8.6],[SL0,88,6],[SL0+2,93,11.4],[14,94,12]]},
 {name:'Tavernier',role:'afc',style:AFCB({number:16,hair:[Y,.5],seed:16}),keys:[[-7,33,13],[0,39,13],[3,53,13.5],[SHOT,70,14],[SL0,84,15],[SL0+2,93.4,15.4],[14,94,15.6]]},
 {name:'Brooks',role:'afc',style:AFCB({number:7,hair:[K,.8],seed:77}),keys:[[-7,27,19],[0,31,20],[3,41,20],[14,62,18]]},
 {name:'Adams',role:'afc',style:AFCB({number:12,skin:SKIN_D,seed:12}),keys:[[-7,23,1],[0,26,1],[3,32,1],[14,46,1]]},
 {name:'Truffert',role:'afc',style:AFCB({number:3,seed:33}),keys:[[-7,14,-18],[0,18,-17],[14,32,-15]]},
 {name:'Smith',role:'afc',style:AFCB({number:15,seed:15}),keys:[[-7,16,17],[0,20,16],[14,34,14]]},
 {name:'Diakité',role:'afc',style:AFCB({number:18,skin:SKIN_DD,seed:18}),keys:[[-7,12,5],[0,15,4],[14,28,3]]},
];
const SEM=0,KON=1,VVD=2,GK=3,SALAH=4,TRA=5,SEN=6;
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-7,T1=14,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
/** position on the ground; Semenyo's knee slide follows the slide's own travel (so the body and the track never disagree) */
const posOf=(k:number,tau:number):[number,number]=>k===SEM&&tau>=SL0?slidePos(Math.min(tau,SL0+SLD)):[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Salah's loss, Traoré's pass, the carry, the set, the shot, the net
/** where it goes in (the photograph: low, beside the post on the shooter's right = +z) */
const GOALPT:V3=[105.1,.3,2.95],NET:V3=[106.7,.28,3.05],REST:V3=[106.3,.11,2.8];
const SHOT_YAW=(()=>{const[x,z]=herm(ACTORS[SEM].keys,SHOT);return yawOf(GOALPT[0]-x,GOALPT[2]-z);})();
/** a foot point ahead of an actor: side +1 = the right boot, −1 = the left */
function footPt(k:number,tau:number,side:number,ahead=.55):[number,number]{const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1,hx=v[0]/l,hz=v[1]/l;return[x+hx*ahead-hz*.12*side,z+hz*ahead+hx*.12*side];}
/** where his right toe meets the ball: solved from the athlete's own skeleton at contact */
const C_PT:[number,number]=(()=>{const p={...strike(STRIKE_CONTACT,{foot:'r',power:1}),dx:0,dz:0},q=herm(ACTORS[SEM].keys,SHOT),sk=solve(p,SEM_ST.build,{x:q[0],z:q[1],yaw:SHOT_YAW});return[sk.rToe[0],sk.rToe[2]];})();
const SET_PT=footPt(SEM,SET,-1,.5);
function ballAt(tau:number):V3{
 if(tau<LOSS){const a=footPt(SALAH,tau,-1);return[a[0],.11,a[1]];}
 if(tau<TR_RX){const u=(tau-LOSS)/(TR_RX-LOSS),a=footPt(SALAH,LOSS,-1),b=footPt(TRA,TR_RX,1),e=1-Math.pow(1-u,1.6);return[lerp(a[0],b[0],e),.11+.35*Math.sin(Math.PI*clamp(u*1.6)),lerp(a[1],b[1],e)];}
 if(tau<TR_PASS){const a=footPt(TRA,tau,1);return[a[0],.11,a[1]];}
 if(tau<0){const u=(tau-TR_PASS)/(0-TR_PASS),a=footPt(TRA,TR_PASS,1),b=footPt(SEM,0,1),e=1-Math.pow(1-u,1.3);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<TOUCHES[TOUCHES.length-1]){let i=0;while(tau>=TOUCHES[i+1])i++;const t0=TOUCHES[i],t1=TOUCHES[i+1],u=(tau-t0)/(t1-t0),a=footPt(SEM,t0,1),b=footPt(SEM,t1,1),e=1-Math.pow(1-u,1.7);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<SET){const t0=TOUCHES[TOUCHES.length-1],u=(tau-t0)/(SET-t0),a=footPt(SEM,t0,1),e=1-Math.pow(1-u,1.7);return[lerp(a[0],SET_PT[0],e),.11,lerp(a[1],SET_PT[1],e)];}
 if(tau<SHOT){const u=(tau-SET)/(SHOT-SET),e=1-Math.pow(1-u,1.5);return[lerp(SET_PT[0],C_PT[0],e),.11,lerp(SET_PT[1],C_PT[1],e)];}
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(C_PT[0],GOALPT[0],u),.11+(GOALPT[1]-.11)*u+.18*Math.sin(Math.PI*u),lerp(C_PT[1],GOALPT[2],u)];}
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOALPT,NET,u);
 const w=clamp((tau-IN_NET-.2)/.5);return[lerp(NET[0],REST[0],w),lerp(NET[1],REST[1],w),lerp(NET[2],REST[2],w)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** Semenyo's carry: chest over the ball, head up between touches, arms driving a little wider for balance */
const CARRY:Partial<Pose>={neckP:6,lShA:20,rShA:20};
/** the right-foot push: toe down, knee over the ball */
const PUSH:Partial<Pose>={rAnk:40,rKnee:40,rHipR:14};
/** van Dijk's reaction afterwards: hands on hips, head down (the "reacts" photograph caption; the exact gesture is inferred) */
const HIPS:Partial<Pose>={lShA:44,rShA:44,lShF:-14,rShF:-14,lElb:112,rElb:112,neckP:24,lean:4};
const bump=(t:number,c:number,w:number)=>Math.max(0,1-Math.abs(t-c)/w);
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(k===TRA&&tau>TR_PASS-.7&&tau<TR_PASS+.45){const g=footPt(SEM,0,1);yaw=yawOf(g[0]-x,g[1]-z);}
 if(k===SEN&&tau>LOSS-.8&&tau<LOSS+1){const g=posOf(SALAH,LOSS);yaw=yawOf(g[0]-x,g[1]-z);}
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.3):stand();
 const s=clamp((sp-2.2)/5.5);let p=blendPose(idle,runCycle(distOf(k,tau)/3.3,{speed:s}),clamp((sp-.4)/.9));
 // the centre-backs: backing off facing the ball, turning to run, then side-on again as he arrives (they never step in)
 if(k===KON||k===VVD){const face=(1-sm(1.1,1.7,tau))+sm(4.4,5.1,tau)*(1-sm(SHOT+.6,SHOT+1.4,tau)),m=posOf(SEM,tau);
  const bp=backpedal(distOf(k,tau)/1.6);p=blendPose(p,bp,face*.9);yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),face);
  if(k===VVD&&tau>IN_NET+.5)p=over(p,HIPS,sm(IN_NET+.5,IN_NET+1.2,tau));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='lunge'?.6:.52)*mv.dur,u=(tau-t0)/mv.dur;
  if(u>0&&u<1.4){const q=mv.kind==='lunge'?lunge(Math.min(1,u),{side:mv.side}):strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7});p=blendPose(p,q,Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}}
 if(k===GK){const u=(tau-SHOT-.02)/1.0;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.12}),sm(0,.08,u));yaw=yawOf(C_PT[0]-x,C_PT[1]-z);}}
 if(k===SEM){
  if(tau<SET+.1){const ph=key(tau,PHASE_KEYS,linear);p=blendPose(idle,runCycle(ph,{speed:s,stride:.94}),clamp((sp-.4)/.9));
   if(tau>-.3){p=over(p,CARRY,sm(-.3,.2,tau));let w=0;for(const tt of TOUCHES)w=Math.max(w,bump(tau,tt,.14));p=over(p,PUSH,w);}}
  const u=(tau-(SHOT-STRIKE_CONTACT*.9))/.9;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:1}),Math.min(sm(0,.12,u),1-sm(1,1.4,u)));
  if(tau>SET-.25&&tau<SHOT+.5)yaw=lerpA(yaw,SHOT_YAW,sm(SET-.25,SET+.1,tau)*(1-sm(SHOT+.2,SHOT+.5,tau)));
  if(tau>SHOT+.7&&tau<SL0)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(SHOT+.7,SHOT+1.2,tau));
  if(tau>=SL0-.15){const w=sm(SL0-.15,SL0+.1,tau);p=blendPose(p,{...slideP((tau-SL0)/SLD),dx:0},w);yaw=lerpA(yaw,SL_YAW,w);}
 }
 // teammates arrive and jump with him
 if((a.role==='afc')&&tau>SL0+1.6&&(k===TRA||a.name==='Evanilson'||a.name==='Tavernier'))p=blendPose(p,celebrate((tau-SL0)*.9+k*.2,{kind:'arms'}),sm(SL0+1.6,SL0+2.1,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a white ball, navy panels, a red shadow ink
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:R,seed:5});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;full?:number[];cap?:number;near?:number}={}):PlayOut{
 const{minBall=6,hero=false,full,cap=40,near=1.2}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 let list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(full&&!full.includes(k)?near:1.2))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 // phone heat: at most `cap` figures, the nearest kept
 if(list.length>cap)list=list.sort((p,q)=>p.d-q.d).slice(0,cap);
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // floodlit ground shadows, batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.03,e.g[1]+e.h*.015,e.h*.15,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg&&b[1]<1.5)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.45);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,distOf(SEM,Math.max(0,tau))/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===SEM?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},{...(big&&(e.k===SEM||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===SEM}:{}),mint:e.k===GK});
  if(e.k===SEM)heroR=r;}
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
/** an arrow on the grass from a to b (metres), drawn on as prog goes 0 → 1 */
function groundArrow(s:Sheet,c:Cam,a:[number,number],b:[number,number],ink:string,w:number,prog=1,seed=51,wm=.16,dashed=false){if(w<=0||prog<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=12;i++){const u=i/12*prog,q=pr(c,[lerp(a[0],b[0],u),0,lerp(a[1],b[1],u)]);if(q)pts.push(q);}if(pts.length<3)return;
 const q=toCam(c,[lerp(a[0],b[0],prog*.5),0,lerp(a[1],b[1],prog*.5)]),wd=Math.max(5,c.F*wm/q[2]);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.1,wobble:.8}),.7*w);
 const e=pts[pts.length-1],pv=pts[Math.max(0,pts.length-3)];s.fill(ink,ribbon(pts.slice(0,-1),wd,{seed:seed+1,taper:.1,wobble:.8,gaps:dashed?[[.14,.22],[.36,.44],[.58,.66],[.8,.86]]:undefined}),.95*w);laneArrow(s,ink,pv,e,wd,{seed:seed+2,head:wd*3,cov:.95*w});}
/** Semenyo's carry on the grass (red), from τ a0 to a1, drawn on as prog goes 0 → 1 */
function pathArrow(s:Sheet,c:Cam,w:number,prog=1,a0=0,a1=SET){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=30;i++){const tau=lerp(a0,a1,i/30),m=posOf(SEM,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(SEM,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.16/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed:61,taper:.1,wobble:.8}),.7*w);s.fill(R,ribbon(sub,wd,{seed:62,taper:.1,wobble:.8}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,R,pv,e,wd,{seed:63,head:wd*3.2,cov:.95*w});}}
/** the empty space in front of him: a yellow patch on the grass from just ahead of him to the centre-backs' line, between them */
function spaceZone(s:Sheet,c:Cam,tau:number,w:number,seed=71){if(w<=0)return;const m=posOf(SEM,tau),kn=posOf(KON,tau),vd=posOf(VVD,tau),x0=m[0]+2.2,x1=Math.min(kn[0],vd[0])-1.2;if(x1-x0<1.5)return;
 const zl=kn[1]+1.2,zr=vd[1]-1.2,pts:V3[]=[[x0,0,m[1]-2],[lerp(x0,x1,.5),0,lerp(m[1]-2,zl,.5)-1],[x1,0,zl],[x1,0,zr],[lerp(x0,x1,.5),0,lerp(m[1]+2,zr,.5)+1],[x0,0,m[1]+2]];
 const q=polyP(c,pts);if(q.length<3)return;const p=polyPath(q,true);void seed;s.knockout(p,.8*w);s.fill(Y,p,.95*w);s.stroke(Y,p,4,.9*w);}
/** a yellow flash at a point in the air (the touch, the shot) */
function flash(s:Sheet,c:Cam,P:V3,size:number,age:number,seed:number){if(age<-.2||age>.6)return;const q=pr(c,P);if(!q)return;const z=c.F/toCam(c,P)[2];
 sparkBurst(s,Y,q[0],q[1],z*size,{n:8,seed,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(4,z*.05),cov:.95});}
/** too late: navy dashed arrows from each centre-back toward the shooting spot that stop short of it */
function recoveryArrows(s:Sheet,c:Cam,w:number,prog:number){if(w<=0)return;
 for(const k of[KON,VVD]){const a=posOf(k,SHOT-.55),dx=C_PT[0]-a[0],dz=C_PT[1]-a[1];groundArrow(s,c,[a[0],a[1]],[a[0]+dx*.45,a[1]+dz*.45],K,w,prog,96+k,.11,true);}}
/** the shot's line on the grass: a yellow arrow from the contact point to the bottom corner */
const shotArrow=(s:Sheet,c:Cam,w:number,prog=1)=>groundArrow(s,c,[C_PT[0]+.7,C_PT[1]+.05],[GOALPT[0]-.2,GOALPT[2]],Y,w,prog,81,.16);
/** the centre-backs backing off: navy dashed arrows from where they were to where they are, behind them */
function backArrows(s:Sheet,c:Cam,tau:number,w:number,from:number){if(w<=0)return;
 for(const k of[KON,VVD]){const a=posOf(k,from),b=posOf(k,tau),l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<2)continue;groundArrow(s,c,[a[0],a[1]],[b[0]-(b[0]-a[0])/l*.9,b[1]-(b[1]-a[1])/l*.9],K,w,1,90+k,.09,true);}}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'bottom corner');return key(t,mono([[0,-6.4],[CUE(0,'Liverpool lead'),-5],[CUE(0,'but Bournemouth'),LOSS-.15],[CUE(0,'Antoine'),-.1],[CUE(0,'straight down'),1.9],[CUE(0,'Nobody'),4.2],[G,IN_NET-.05],[SECS(0),Math.max(SL0+SLD+.6,IN_NET-.05+(SECS(0)-G))]]),linear);};
const CAM1:V3=[52.5,22,62];
function cam1(t:number):Cam{
 const G=CUE(0,'bottom corner'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN_NET));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const m=posOf(SEM,Math.min(tau,13)),cel:V3=[m[0]-1,1,m[1]-1];
 // the pan leads the carry a little (the director looks where the break is going), then settles on the goal and follows him away
 const lead=sm(-.5,1.5,tau)*(1-sm(SHOT-.8,SHOT,tau))*7,toS=sm(G+.4,G+1.8,t,easeInOutSine);
 const tb:V3=[bt[0]+lead,1.2,bt[2]*.7],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,3500],[CUE(0,'but Bournemouth'),3800],[CUE(0,'Antoine'),4100],[CUE(0,'Nobody'),4600],[G,4900],[G+1.8,6600],[S,7400]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'bottom corner');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8,cap:22});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(SEM,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low touchline camera running alongside him
const tau2=(t:number)=>key(t,mono([[0,.4],[CUE(1,'He carries'),.9],[CUE(1,'into the empty'),1.9],[CUE(1,'The defenders'),3],[CUE(1,'just watch'),4.1],[CUE(1,'but he'),5.05],[SECS(1),SET+.15]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(SEM,Math.min(tau,SET)),open=1-sm(0,1.2,t,easeInOutSine);
 // the tracking camera: level with him on the near side, a little behind, looking up the pitch past him at the two centre-backs
 const C:V3=[m[0]-4.5-2*open,1.9+.6*open,m[1]+7],T:V3=[m[0]+7,.9,m[1]-1.2];
 return look(C,T,2000-200*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),hc=CUE(1,'He carries'),ie=CUE(1,'into the empty'),td=CUE(1,'The defenders'),jw=CUE(1,'just watch'),bh=CUE(1,'but he'),E=SECS(1);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  const fade=1-sm(E-.6,E-.3,t);
  // his carry so far: a red trail on the grass behind him
  pathArrow(s,c,sm(hc-.1,hc+.3,t)*fade,1,Math.max(0,tau-1.7),Math.max(.3,tau-.35));
  spaceZone(s,c,tau,sm(ie-.1,ie+.35,t)*(1-sm(bh+.3,bh+.8,t))*fade);
  groundRing(s,c,...posOf(KON,tau),1,K,sm(td-.1,td+.35,t,easeOutBack)*fade,44);
  groundRing(s,c,...posOf(VVD,tau),1,K,sm(td,td+.45,t,easeOutBack)*fade,45);
  backArrows(s,c,tau,sm(jw-.1,jw+.3,t)*fade,tau-1.1);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[SEM,KON,VVD],cap:12,after:()=>{
   for(const tt of TOUCHES){const fp=footPt(SEM,tt,1);flash(s,c,[fp[0],.2,fp[1]],.45,tau-tt,90+tt*3);}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(SEM,tau2(t)),q=toCam(c,[m[0],1.3,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind him (the press photograph's angle): the set touch, the shot, the net
const tau3=(t:number)=>{const li=CUE(2,'low into');return key(t,mono([[0,SET-1.1],[CUE(2,'he moves'),SET-.35],[CUE(2,'onto his right'),SET+.2],[CUE(2,'and shoots'),SHOT],[li,SHOT+.35],[SECS(2),SHOT+.35+(SECS(2)-li)*.6]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=posOf(SEM,Math.min(tau,SHOT)),e=sm(SHOT,IN_NET+.3,tau,easeInOutSine);
 // low behind the shooter, a long lens: Konaté on his left, van Dijk on his right, Alisson and the net beyond
 const C:V3=[m[0]-10.5,1.75,m[1]-.8],T:V3=[lerp(m[0]+6,102,e),lerp(1,.9,e),lerp(m[1]+.4,2.2,e)];
 return look(C,T,lerp(3300,3700,e));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ar=CUE(2,'and shoots'),li=CUE(2,'low into'),E=SECS(2);
  stadium(s,c,v,t,[3],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  shotArrow(s,c,sm(ar-.1,ar+.2,t)*(1-sm(E-.5,E-.2,t)),sm(ar-.1,li+.3,t));
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[SEM,GK,KON,VVD],cap:10,near:8,after:()=>{
   flash(s,c,[SET_PT[0],.2,SET_PT[1]],.5,tau-SET,93);flash(s,c,[C_PT[0],.2,C_PT[1]],.6,tau-SHOT,94);}});
  // the goal: a yellow burst in the corner of the net
  const pw=sm(IN_NET-.05,IN_NET+.3,tau)*(1-sm(E-.5,E-.2,t));if(pw>0){const q=pr(c,GOALPT);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.1/toCam(c,GOALPT)[2],{n:10,seed:88,g:easeOutBack(pw),width:12,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),q=toCam(c,GOALPT),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.3/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle over his left shoulder
const tau4=(t:number)=>key(t,mono([[0,1.2],[CUE(3,'carry the ball'),1.8],[CUE(3,'into space'),3],[CUE(3,'Then shoot'),SET-.3],[CUE(3,'before the'),SHOT+.05],[SECS(3),IN_NET+.4]]),linear);
function cam4(t:number):Cam{
 const orbit=sm(CUE(3,'carry')-.2,SECS(3),t,easeInOutSine);
 const m=smooth(SEM,Math.min(tau4(t),SHOT));
 // raised over his left shoulder, tracking the carry: the space, the two centre-backs and the goal ahead of him (never top-down)
 const C:V3=[m[0]-14,lerp(8.5,7.5,orbit),m[1]-6.5],T:V3=[Math.min(m[0]+11,97),0,m[1]+.8];
 return look(C,T,lerp(2500,2700,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your'),cb=CUE(3,'carry the ball'),is=CUE(3,'into space'),ts=CUE(3,'Then shoot'),bd=CUE(3,'before the'),E=SECS(3),fade=1-sm(E-.6,E-.3,t);
  stadium(s,c,v,t,[0,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  pathArrow(s,c,sm(cb-.1,cb+.25,t)*fade,1,Math.max(0,Math.min(tau,SET)-3.5),Math.max(.4,Math.min(tau,SET)-.05));
  spaceZone(s,c,tau,sm(is-.1,is+.35,t)*(1-sm(ts+.2,ts+.6,t))*fade,72);
  shotArrow(s,c,sm(ts-.1,ts+.25,t)*fade,sm(ts-.1,bd+.2,t));
  // too late: the defenders' recovery arrows stop short of the shot's line
  recoveryArrows(s,c,sm(bd-.1,bd+.3,t)*fade,sm(bd-.1,bd+.7,t));
  groundRing(s,c,C_PT[0],C_PT[1],1.1,Y,sm(bd-.1,bd+.35,t,easeOutBack)*fade,42);
  groundRing(s,c,...posOf(SEM,tau),1,R,sm(yt,yt+.4,t,easeOutBack)*(1-sm(cb+.6,cb+1,t)),43);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[SEM,GK,KON,VVD],cap:14,near:12,after:()=>{flash(s,c,[C_PT[0],.2,C_PT[1]],.5,tau-SHOT,95);}});
 },
 still:2.6,
};

const film:RisoStory={
 id:'semenyo-signature',format:'11v11',title:"Semenyo's run and shot",theme:'Carry the ball at speed into space, then shoot before the defender recovers',
 ageNote:'Premier League, Liverpool 4–2 Bournemouth, Anfield, 15 August 2025: the 76th-minute run and shot that made it 2–2. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — green bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green and yellow bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*2,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*2,z=10+r()*14;(i%3?a:b).addPath(polyPath(blob(px,py,z,z*.8,i+seed,{amp:.1,n:10}),true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.7*fade);s.fill(R,b,.8*fade);
}
export default film;
