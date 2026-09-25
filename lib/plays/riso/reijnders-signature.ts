/** Tijjani Reijnders — signature: "the late run into the box" (lib/town/iconicPlays.json: kind "signature", template volley_goal, centre,
 * box; lesson "Arrive late in the box: defenders watch the strikers and forget the midfielder."). An iconic-play riso film (RisoStory,
 * chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer.
 *
 * WHY THIS MOMENT: the signature is a trait, so the film recreates ONE real, written-up goal that shows it: Real Madrid 1–3 AC Milan,
 * Champions League league phase, matchday 4, Santiago Bernabéu, Madrid, Tuesday 5 November 2024, Milan's third goal (73'). The sources
 * describe the play itself — Leão galloping down the left, into the box past Vázquez, squaring it; Reijnders, a central midfielder
 * (he started in the two behind the attack, with Fofana), arriving inside the six-yard box to take a touch and lash a low shot under
 * Lunin — so the goal is staged in the match (the brief allows this when written sources describe the play), and nothing else is.
 * The late-run lesson is drawn over a third, raised angle of the same goal, kept generic in the narration.
 *
 * SOURCES (fetched 24 Sep 2026 with curl and a generic UA, cached in the film scratchpad src-cache/; 6 requests):
 *  - SempreMilan, Oliver Fisher, "Watch: Reijnders gets Milan's third against Real Madrid from Leao assist", 5 Nov 2024: "In the 72nd
 *    minute ... another wonderfully worked goal ... Leao went galloping down the left and into the box past Vazquez and squared it on a
 *    plate to Reijnders, who managed to take a touch and lash a low shot underneath Lunin from close range."
 *    https://sempremilan.com/reijnders-gets-milan-third-goal-real-madrid  (cache: sempremilan-reijnders-goal-rma-2024.*)
 *  - SempreMilan, "Real Madrid 1-3 AC Milan: Thiaw, Morata and Reijnders score ..." match report (same sentence; Morata and Pulisic off
 *    for Abraham and Loftus-Cheek just before; Rüdiger's late goal ruled out).  (cache: sempremilan-rma-milan-2024-report.*)
 *  - AC Milan official, "AC Milan run out 3-1 winners against Real Madrid", 5 Nov 2024: "The third came at 73': unstoppable run down the
 *    left from Leão, ball into the box for Reijnders who controlled well and shot past Lunin to make it 3-1"; line-ups: Real Madrid
 *    (4-3-1-2) Lunin; Vázquez, Rüdiger, Militão, Mendy (74' Fran García); Valverde (46' Camavinga), Modrić (63' Ceballos), Tchouaméni
 *    (46' Díaz); Bellingham (74' Rodrygo); Mbappé, Vinícius Júnior. AC Milan (4-2-3-1) Maignan; Emerson Royal, Thiaw, Tomori, Hernández;
 *    Fofana, Reijnders; Musah, Pulisic (70' Loftus-Cheek), Leão; Morata (70' Abraham). Goals 12' Thiaw, 23' pen. Vinícius, 39' Morata,
 *    73' Reijnders. Referee Vinčić.  (cache: acmilan-rma-milan-2024.*)
 *  - DuckDuckGo result snippets (cache: ddg-reijnders-realmadrid-milan-2024.html): a Getty caption "AC Milan's Rafael Leao goes past
 *    Eder Militao as he sets up Reijnders goal to make it 1-3"; Sports Mole: "Reijnders made it 1-3, blasting past Lunin from inside
 *    the six-yard box"; quotidiano.net: "Madrid (Spain), November 5, 2024".  (ddg-milan-kit-bernabeu-2024.html found no written kit record.)
 *  - Card data: lib/town/playerAppearance.json (Netherlands; skin 2, dark hair), lib/town/playerCareers.json (AZ, Milan 2023–25, Man City).
 * CONFIRMED: the match, ground, date (a November night game), matchday 4, the score 1–3 and the goal order; the 73rd-minute third goal;
 *  Leão's run down the LEFT and into the box, past Vázquez (report) and Militão (photo caption); his square ball; Reijnders' touch and LOW
 *  shot from close range / inside the six-yard box, UNDER Lunin; who was on the pitch at 73' (Abraham and Loftus-Cheek on, Camavinga,
 *  Ceballos and Díaz in Madrid's midfield, Mendy still on); Reijnders started as a central midfielder.
 * INFERRED (illustrative, kept OUT of the narration): every position, run line, speed and timing; Reijnders' run starting from deep
 *  (implied by his role, not described); the shooting foot (RIGHT, his stronger foot) and Leão's squaring foot (right); Abraham and
 *  Rüdiger drifting to the near post; Camavinga as the midfielder left behind; Lunin coming off his line and going down as the ball goes
 *  under him; which end, and the camera side (the main camera on Milan's left, so Milan attack right-to-left on screen); THE KITS — no
 *  written source I read names them: Milan in their red-and-black striped home shirts, white shorts, black socks (black printed navy);
 *  Real Madrid all white; Lunin in blue (a placeholder); numbers from memory (Reijnders 14, Leão 10, Abraham 90, Loftus-Cheek 8, Musah
 *  80, Fofana 29, Lunin 13, Vázquez 17, Militão 3, Rüdiger 22, Mendy 23, Camavinga 6); hair and skin from photographs; the Bernabéu
 *  simplified as a steep, tall three-tier bowl under its closed roof ring, at night.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time, panning with Leão's run to the goal and
 * the celebration; ch2 = slow-motion replay from a low camera behind Reijnders' run: the defenders' chase (red), his late run (blue), the
 * empty space (yellow ring), the touch spark, the low flight under the keeper; ch3 = the lesson from a raised camera behind the goal:
 * red sight-lines from the defenders to the strikers, the forgotten midfielder, the gap, the run into it. All figures are the shared riso
 * athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Full-sheet card-window framing (1.45:1 to square),
 * never sheet.safe. Handedness: the world is right-handed (x toward the goal Milan attack, y up, +z = the attackers' right), athlete.ts's
 * own convention, so his RIGHT foot is the right foot. Scenes read only (t, c); every action keys off cue times, so the recorded voice
 * (withTiming) re-times the film; randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); no cue starts with
 * a contraction, a hyphenated word or "Leão" (Kokoro may split the tilde). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Real Madrid against Milan, in the Champions League. Leão gallops down the left, past two defenders, into the box, and squares it for Reijnders... Goal!',seconds:11.6,
  cues:[[.2,'Real Madrid'],[1.3,'Milan'],[2.1,'Champions League'],[3.7,'gallops down'],[5,'past two defenders'],[6.2,'into the box'],[7.2,'squares it'],[8,'Reijnders'],[9.2,'Goal']]},
 {label:'Watch it again',text:'Watch again, slowly. The defenders chase Leão, and Reijnders runs late from midfield, into the empty space. One touch, then a low shot, right under the keeper!',seconds:11,
  cues:[[.15,'Watch again'],[.9,'slowly'],[1.8,'defenders chase'],[3.5,'Reijnders runs late'],[4.6,'from midfield'],[5.5,'into the empty space'],[7,'One touch'],[8,'low shot'],[8.9,'under the keeper']]},
 {label:'Your turn',text:'Your turn: arrive late in the box. Defenders watch the strikers, and forget the midfielder. So wait, then run into the gap, and be the one they forget!',seconds:10.8,
  cues:[[.15,'Your turn'],[1,'arrive late'],[2.7,'Defenders watch'],[3.7,'strikers'],[4.5,'forget the midfielder'],[6.2,'wait'],[7,'run into the gap'],[8.3,'be the one']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py reijnders-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/reijnders-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-reijnders-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/reijnders-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('reijnders: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys forced monotone in time (a recorded voice can squeeze cue gaps) */
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
/** The film plays inside the player card's picture window: full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
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
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (cameras inside the bowl cull the near stand) */
function quadP(c:Cam,q:V3[],minDepth=16):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};

// ---------------------------------------------------------------- the Bernabéu on a November night: a steep, tall three-tier bowl under a closed roof ring (simplified, inferred)
const CX=52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the pitch-side rim (a squarish rounded rectangle: the stands
 * sit close to the touchlines), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(58+d)*Math.sign(c)*Math.pow(Math.abs(c),.3),y,(39+d)*Math.sign(s)*Math.pow(Math.abs(s),.3)];}
const LOW=(b:number):[number,number]=>[1+16*b,1.2+9*b],MID=(b:number):[number,number]=>[18.5+12*b,12+10*b],UP=(b:number):[number,number]=>[32+17*b,24.5+17*b];
type Bowl={tiers:V3[][][];band:V3[][];roof:V3[][];lamps:[V3,V3][];seats:{P:V3;h:number;away:boolean}[]};
const BOWL:Bowl=(()=>{const o:Bowl={tiers:[[],[],[]],band:[],roof:[],lamps:[],seats:[]};const TF=[LOW,MID,UP];
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  TF.forEach((f,k)=>o.tiers[k].push(Q(f)));
  o.band.push([rim(a,17,10.2),rim(b,17,10.2),rim(b,18.5,12),rim(a,18.5,12)]);
  o.band.push([rim(a,30.5,22.2),rim(b,30.5,22.2),rim(b,32,24.5),rim(a,32,24.5)]);
  o.roof.push([rim(a,14,46),rim(b,14,46),rim(b,52,43.5),rim(a,52,43.5)]);
  o.lamps.push([rim(a,14.6,45.4),rim(b,14.6,45.4)]);
  // the Milan fans: one upper-tier corner behind the goal Milan attack (inferred placement)
  const away=a>.08*TAU&&a<.17*TAU;
  TF.forEach((f,k)=>{const rows=[6,5,6][k];for(let r=0;r<rows;r++)for(let j=0;j<3;j++){const h=hash(i*977+r*31+j*7+k*5000,11);if(h<.14)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(j+.5+(hash(i+r*13+j,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away:away&&k===2});}});}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = phones and cameras), the roof and
 * its floodlight ring */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 s.field(K,.5,.5);s.field(B,.22,.5);
 const tiers=[new Path2D(),new Path2D(),new Path2D()],band=new Path2D(),roof=new Path2D();
 for(let i=0;i<NS;i++){for(let k=0;k<3;k++){const q=quadP(c,BOWL.tiers[k][i]);if(q)addPoly(tiers[k],q);}const r4=quadP(c,BOWL.roof[i],10);if(r4)addPoly(roof,r4);}
 for(const q of BOWL.band){const p=quadP(c,q);if(p)addPoly(band,p);}
 tiers.forEach((p,k)=>{s.knockout(p);s.tone(B,p,.45-.05*k);s.tone(K,p,.5+.05*k);});
 // the crowd: Madrid white (paper), navy, a red-and-black Milan corner, a few phone lights (yellow)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.away?(q.h<.6?2:1):q.h<.58?0:q.h<.93?1:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.85);s.fill(K,inks[1],.8);s.fill(R,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(band,.8);s.tone(K,band,.3);
 s.knockout(roof);s.tone(K,roof,.85);s.tone(B,roof,.35);
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+6||toCam(c,b)[2]<NEAR+6)continue;seg3(c,a,b,.8,lamp);seg3(c,a,b,3.4,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the floodlit grass (yellow × blue) with mowing stripes, boards, paper lines, corner flags and both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ball?:V3}={}){
 const sur=polyP(c,[[-7,0,-40],[112,0,-40],[112,0,40],[-7,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.9);s.tone(K,p,.3);}
 const g=polyP(c,[[-5,0,-38],[110,0,-38],[110,0,38],[-5,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.82);s.tone(K,gp,.12);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[-4,0,37],[109,0,37],[109,.9,37],[-4,.9,37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]));addPoly(pn,polyP(c,[[x,.25,36.95],[x+3.4,.25,36.95],[x+3.4,.65,36.95],[x,.65,36.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(B,pn,.5);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const[x,z] of [[0,-34],[0,34],[105,-34],[105,34]] as Pt[]){seg3(c,[x,0,z],[x,1.55,z],.05,pole);addPoly(flag,polyP(c,[[x,1.55,z],[x,1.2,z],[x+(x?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0,1);
 goal3(s,c,105,1,o.bulge??0,o.ball?.[2]??0,o.ball?.[1]??1);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (bz, by) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)-Math.pow((y-by)/1.4,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,1),1,z],.025,mesh,.7);seg3(c,[back(z,1),1,z],[back(z,0),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles; the kits are INFERRED, see the header)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]];
/** AC Milan: red-and-black striped shirts (black printed navy), white shorts, black socks (inferred) */
const MIL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],pattern:'stripes',patternInk:K,shorts:'paper',socks:K,boots:K,trim:'paper',numberInk:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,seed:3,...o});
/** Real Madrid: all white, navy trim (inferred) */
const RMA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:K,seed:5,...o});
/** Reijnders: No. 14 at Milan, ≈1.85 m, athletic; short dark hair, light-medium skin (card: skin 2, dark hair); right-footed */
const REIJNDERS=MIL({number:14,skin:SKIN_M,hair:K,hairStyle:'short',build:{height:1.85},seed:14});
const LEAO=MIL({number:10,skin:SKIN_D,hair:K,hairStyle:'short',build:{height:1.88},seed:10});
const LUNIN:AthleteStyle={shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:SKIN_L,hair:[Y,.55],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:13,numberInk:'paper',build:{height:1.91},seed:13};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- tracks: keyframed positions [τ, X, Z], Hermite-interpolated, tabled at 50 Hz
type Actor={name:string;style:AthleteStyle;keys:number[][];key?:boolean;role:'mil'|'rma'|'gk'|'hero'};
type Tab={X:number[];Z:number[];D:number[]};
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const DT=.02;
type Track={actors:Actor[];T0:number;tabs:Tab[]};
function track(actors:Actor[],T0:number,T1:number):Track{return{actors,T0,tabs:actors.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;
 for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};})};}
const samp=(T:Track,arr:number[],tau:number)=>{const u=clamp((tau-T.T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(T:Track,k:number,tau:number):[number,number]=>[samp(T,T.tabs[k].X,tau),samp(T,T.tabs[k].Z,tau)];
const distOf=(T:Track,k:number,tau:number)=>samp(T,T.tabs[k].D,tau);
const velOf=(T:Track,k:number,tau:number):[number,number]=>{const a=posOf(T,k,tau-.08),b=posOf(T,k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(T:Track,k:number,tau:number):[number,number]=>{const a=posOf(T,k,tau),b=posOf(T,k,tau-.3),d=posOf(T,k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(T:Track,k:number,tau:number)=>{const v=velOf(T,k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(T:Track,k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(T,k,tau),y=headingOf(T,k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};

// ---------------------------------------------------------------- THE GOAL (τ = seconds after Leão squares it; positions inferred, see the header)
const BEAT_V=-2.6,BEAT_M=-1.05,SQUARE=0,TOUCH=.65,SHOT=1.02,IN_NET=1.22;
const ACTORS:Actor[]=[
 {name:'Reijnders',role:'hero',style:REIJNDERS,key:true,keys:[[-7,58,-5.5],[-5.5,64,-5],[-4,70,-4.4],[-2.6,75.8,-3.8],[-1.5,81,-3.2],[-.7,86,-2.7],[0,91.8,-2.3],[.4,95.4,-2],[TOUCH,97.6,-1.8],[.85,98.7,-1.6],[SHOT,99.2,-1.5],[1.4,99.9,-1.1],[2.2,100.6,2],[3.4,101.6,7.5],[5,102.4,13]]},
 {name:'Leão',role:'mil',style:LEAO,key:true,keys:[[-7,56,-28],[-5.5,63.5,-27.6],[-4,71.5,-26.4],[BEAT_V,79.5,-24.4],[-1.5,86,-21.6],[BEAT_M,89,-20.2],[-.5,92.8,-17.8],[SQUARE,95.8,-15.8],[.5,98.2,-14.6],[1.2,100.4,-14],[2.4,101.8,-10],[3.6,102,-4],[5,102.2,2]]},
 {name:'Abraham',role:'mil',style:MIL({number:90,skin:SKIN_D,build:{height:1.9,bulk:1.06},seed:90}),key:true,keys:[[-7,78,3],[-3,88,1.5],[-1.5,93,-1],[-.5,96.4,-3.6],[0,98,-5],[.7,99.8,-6],[1.6,100.4,-5],[3,101,0],[5,101.6,6]]},
 {name:'Loftus-Cheek',role:'mil',style:MIL({number:8,skin:SKIN_D,build:{height:1.91,bulk:1.1},seed:8}),keys:[[-7,68,9],[-3,80,7.5],[0,89,6],[1,92,5],[2.4,95,4],[5,99,6]]},
 {name:'Musah',role:'mil',style:MIL({number:80,skin:SKIN_D,seed:80}),keys:[[-7,66,23],[-3,77,21],[0,86,18],[2,90,15],[5,95,10]]},
 {name:'Fofana',role:'mil',style:MIL({number:29,skin:SKIN_D,build:{height:1.9},seed:29}),keys:[[-7,54,-4],[-3,60,-4],[0,66,-3],[2,70,-2],[5,76,0]]},
 {name:'Theo',role:'mil',style:MIL({number:19,seed:19}),keys:[[-7,50,-25],[-3,60,-26],[0,68,-26],[2,74,-24],[5,80,-20]]},
 {name:'Emerson',role:'mil',style:MIL({number:22,skin:SKIN_M,seed:22}),keys:[[-7,46,20],[0,56,18],[5,64,16]]},
 {name:'Thiaw',role:'mil',style:MIL({number:28,skin:SKIN_M,build:{height:1.94},seed:28}),keys:[[-7,40,-7],[0,48,-6],[5,54,-4]]},
 {name:'Tomori',role:'mil',style:MIL({number:23,skin:SKIN_D,seed:23}),keys:[[-7,40,8],[0,48,7],[5,54,6]]},
 {name:'Vázquez',role:'rma',style:RMA({number:17,seed:17}),key:true,keys:[[-7,72.5,-24.5],[-5,74,-25.3],[-3.5,77,-25.6],[BEAT_V,79.9,-25.3],[-1.5,83.2,-23.4],[-.7,87,-20.8],[0,90.6,-18.3],[1,93.6,-16.2],[2.2,96,-13.6],[4,97,-11]]},
 {name:'Militão',role:'rma',style:RMA({number:3,skin:SKIN_M,build:{height:1.86},seed:3}),key:true,keys:[[-7,85,-8],[-3.5,87.5,-11.5],[-1.8,89,-15.5],[BEAT_M,90.4,-17.8],[-.6,91.2,-18.4],[0,92.6,-17.4],[.7,95,-14.8],[1.6,96.8,-11.8],[3.5,98,-8]]},
 {name:'Rüdiger',role:'rma',style:RMA({number:22,skin:SKIN_D,hairStyle:'bald',build:{height:1.9,bulk:1.08},seed:22}),key:true,keys:[[-7,80,1],[-3,89.5,-.5],[-1.5,94,-2.4],[-.5,97.2,-4.6],[0,98.7,-5.8],[.7,100.3,-6.6],[1.6,100.8,-5.6],[3.5,101.2,-3]]},
 {name:'Mendy',role:'rma',style:RMA({number:23,skin:SKIN_D,seed:24}),key:true,keys:[[-7,80,14],[-3,90,11],[-1,95,8],[0,96.8,6.2],[1,98.4,3.6],[2,99,2],[4,99.4,1]]},
 {name:'Camavinga',role:'rma',style:RMA({number:6,skin:SKIN_D,hairStyle:'curly',seed:6}),key:true,keys:[[-7,60,-8.5],[-4,67.5,-7.5],[-1.5,75.5,-6],[0,80.5,-5],[.8,83.4,-4.4],[2,86,-4],[4,88,-3.5]]},
 {name:'Ceballos',role:'rma',style:RMA({number:19,seed:19}),keys:[[-7,64,4],[-2,76,3],[0,82,2.5],[2,86,1.5],[4,88,1]]},
 {name:'Díaz',role:'rma',style:RMA({number:21,skin:SKIN_M,build:{height:1.7,bulk:.92},seed:21}),keys:[[-7,66,14],[-2,73,12],[0,77,10.5],[2,80,9],[4,82,8]]},
 {name:'Bellingham',role:'rma',style:RMA({number:5,seed:5}),keys:[[-7,57,-14],[-2,68,-12],[0,73,-11],[2,76,-10],[4,78,-9]]},
 {name:'Mbappé',role:'rma',style:RMA({number:9,skin:SKIN_D,seed:9}),keys:[[-7,50,5],[0,60,3],[4,64,2]]},
 {name:'Vinícius',role:'rma',style:RMA({number:7,skin:SKIN_D,seed:7}),keys:[[-7,52,-20],[0,62,-18],[4,66,-17]]},
 {name:'Lunin',role:'gk',style:LUNIN,key:true,keys:[[-7,103.8,-2.5],[-2,103.6,-4],[0,103.2,-5],[.5,102.6,-4],[.85,102.1,-2.8],[SHOT,101.9,-2.4],[1.5,101.9,-2.4],[4,102.2,-2]]},
];
const MT=track(ACTORS,-7.2,6);
const MIX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const REI=MIX('Reijnders'),LEO=MIX('Leão'),ABR=MIX('Abraham'),VAZ=MIX('Vázquez'),MLT=MIX('Militão'),RUD=MIX('Rüdiger'),MEN=MIX('Mendy'),CAM=MIX('Camavinga'),GK=MIX('Lunin');
const SQ_P=footSpot(MT,LEO,SQUARE,'r',.5);
const TOUCH_P=footSpot(MT,REI,TOUCH,'r',.45);
const SHOT_P=footSpot(MT,REI,SHOT,'r',.42);
/** the finish: low, under Lunin, into the net just right of centre (exact spot inferred) */
const NET_P:V3=[105.3,.22,.9],REST_P:V3=[106.4,.11,1.2];
/** Leão's run with the ball: a touch every long stride, pushed ahead of his right foot */
function carry(tau:number):V3{const ph=distOf(MT,LEO,tau)/3.1,e=((ph%1)+1)%1;const[x,z]=footSpot(MT,LEO,tau,'r',.6+.9*Math.pow(1-e,1.6)*(1-sm(-.5,-.1,tau)),.12);return[x,.11,z];}
function ballM(tau:number):V3{
 if(tau<SQUARE)return carry(tau);
 if(tau<TOUCH)return roll([SQ_P[0],.11,SQ_P[1]],[TOUCH_P[0],.11,TOUCH_P[1]],(tau-SQUARE)/(TOUCH-SQUARE),.2);
 if(tau<SHOT){const u=(tau-TOUCH)/(SHOT-TOUCH),e=1-(1-u)*(1-u);return[lerp(TOUCH_P[0],SHOT_P[0],e),.11,lerp(TOUCH_P[1],SHOT_P[1],e)];}
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT),b=lerp3([SHOT_P[0],.11,SHOT_P[1]],NET_P,u);return[b[0],b[1]+.05*Math.sin(Math.PI*u),b[2]];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return lerp3(NET_P,REST_P,e);
}
const bulgeM=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the base gait from speed: stand / jog / sprint, or a backpedal when moving backwards */
function gait(k:number,tau:number,idle:Pose):{p:Pose;yaw:number;sp:number}{
 const v=velOf(MT,k,tau),sp=Math.hypot(v[0],v[1]);let yaw=sp>.5?yawOf(v[0],v[1]):0;const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(MT,k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(MT,k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 return{p,yaw,sp};}
function lungeAt(p:Pose,yaw:number,x:number,z:number,b:V3,at:number,tau:number):Pose{const u=(tau-(at-.6*.9))/.9;if(u<=0||u>=1.5)return p;
 const s=Math.sin(yaw)*(b[0]-x)+Math.cos(yaw)*(b[2]-z)>0?'r':'l';return blendPose(p,lunge(Math.min(1,u),{side:s}),inWin(u));}
function poseM(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],[x,z]=posOf(MT,k,tau),b=ballM(tau);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='rma'?READY:stand();
 let{p,yaw,sp}=gait(k,tau,idle);if(sp<=.5||a.role==='rma'&&sp<3)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===LEO){
  // the gallop: head up, a long touch every third stride; then the square ball with the right foot (inferred)
  p=over(p,{neckP:10,lean:18},sm(-6,-5,tau)*(1-sm(-.4,0,tau)));
  const D=.7,u=(tau-(SQUARE-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.5}),inWin(u));yaw=lerpA(yaw,yawOf(TOUCH_P[0]-x,TOUCH_P[1]-z)+.5,.7*inWin(u));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.4,IN_NET+1,tau));}
 if(k===REI){
  // the late run: eyes over his left shoulder on Leão, then the cushioned right-foot touch and the low right-foot shot (foot inferred)
  p=over(p,{neckY:34,neckP:-2,twist:8},bump(-2.2,.55,tau)*.85);
  p=over(p,{rHipF:30,rKnee:30,rAnk:26,rHipR:24,lean:20},bump(TOUCH-.18,TOUCH+.14,tau));
  const D=.62,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.95}),inWin(u));yaw=lerpA(yaw,yawOf(NET_P[0]-x,NET_P[2]-z),.85*inWin(u));}
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(IN_NET+.3,IN_NET+.9,tau));}
 if(k===VAZ)p=lungeAt(p,yaw,x,z,b,BEAT_V,tau);
 if(k===MLT)p=lungeAt(p,yaw,x,z,b,BEAT_M,tau);
 if(k===GK){yaw=yawOf(b[0]-x,b[2]-z);const u=(tau-(SHOT-.12))/.8;if(u>0){p=keeperDive(Math.min(1,u),{side:'l',height:.05});yaw=Math.PI;}}
 if(a.role==='mil'&&k!==LEO&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='rma'&&tau>IN_NET+.7)p=over(p,{lean:40,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.7,IN_NET+1.5,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: white with navy star panels (the Champions League ball, simplified)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D();for(let i=0;i<5;i++){const a=rot+i/5*TAU,d=r*(i%2?.58:.34),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d,w=r*.22,q:Pt[]=[];for(let j=0;j<10;j++){const b=a+j/10*TAU,rr=j%2?w*.45:w;q.push([cx+Math.cos(b)*rr,cy+Math.sin(b)*rr]);}pan.addPath(polyPath(q,true));}
 s.fill(K,pan,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the play through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;smear?:boolean;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=-1}=o,A=ACTORS;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 A.forEach((_,k)=>{const[x,z]=posOf(MT,k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballM(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,A[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=A[e.k],{p,yaw}=poseM(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===hero||e.h>520)&&!passing?{prev:poseM(e.k,tauPrev).p,smear:e.k===hero&&o.smear!==false}:{});
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(4,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a ring standing upright in the goal mouth (the plane x = X), around (y, z) */
function ringUp(s:Sheet,c:Cam,X:number,y:number,z:number,rad:number,w:number,seed=49){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[X,y+Math.sin(a)*rad*(.7+.3*w),z+Math.cos(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[X,y,z])*.13),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(Y,rr,.95*w);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61,dashed=false){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(5,c.F*.16/d);
 if(!dashed){s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);}
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,dashed?seg[0]:a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3,dashed});}
/** a 3D polyline arrow (the ball's flight) */
function flight(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,seed=81){if(w<=.02)return;const sp:Pt[]=[];let d=1;for(const P of pts){const q=toCam(c,P);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(5,c.F*.12/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.6}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.6}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** a dashed sight-line from a player's eyes to what he is watching (red: "watching the strikers") */
function sight(s:Sheet,c:Cam,from:[number,number],to:[number,number],w:number,seed:number){if(w<=.02)return;const a=pr(c,[from[0],1.7,from[1]]),b=pr(c,[to[0],1.3,to[1]]);if(!a||!b)return;
 const wd=Math.max(4,kAt(c,[from[0],1.7,from[1]])*.08),e:Pt=[lerp(a[0],b[0],w),lerp(a[1],b[1],w)],L=Math.hypot(e[0]-a[0],e[1]-a[1]),n=Math.max(2,Math.floor(L/(wd*3.2))),p=new Path2D();
 // paper-backed red dashes (red straight onto the grass prints dark), a small head at the end
 for(let i=0;i<n;i++){const u0=i/n,u1=(i+.55)/n;p.addPath(ribbon([[lerp(a[0],e[0],u0),lerp(a[1],e[1],u0)],[lerp(a[0],e[0],u1),lerp(a[1],e[1],u1)]],wd,{seed:seed+i,taper:.2,wobble:.5}));}
 const dx=(e[0]-a[0])/(L||1),dy=(e[1]-a[1])/(L||1),h=wd*2.4;p.addPath(polyPath([[e[0]+dx*h,e[1]+dy*h],[e[0]-dy*h*.7,e[1]+dx*h*.7],[e[0]+dy*h*.7,e[1]-dx*h*.7]],true));
 s.knockout(p,.95);s.fill(R,p,.95);}
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(MT,k,lerp(ta,tb,i/n)));return o;};
const shotPts=(n=10):V3[]=>{const o:V3[]=[];for(let i=0;i<=n;i++)o.push(ballM(lerp(SHOT+.001,IN_NET-.001,i/n)));return o;};
const passPts=(n=10):V3[]=>{const o:V3[]=[];for(let i=0;i<=n;i++)o.push(ballM(lerp(SQUARE+.001,TOUCH-.001,i/n)));return o;};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera (Milan's left), near real time
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'Goal');return key(t,mono([[0,-6.4],[CUEW(0,'gallops'),-4.2],[CUEW(0,'past two'),BEAT_V+.1],[CUEW(0,'into the box'),BEAT_M+.05],[CUEW(0,'squares it'),SQUARE+.05],[CUEW(0,'Reijnders'),SHOT-.05],[G,IN_NET+.45],[S+1,IN_NET+.45+(S+1-G)*.85]]),linear);};
const CAM1:V3=[66,17,-70];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'Goal'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballM(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const cel=posOf(MT,REI,tau),toC=sm(G+.3,G+1.6,t,easeInOutSine);
 // lead the play: aim a little ahead of the ball toward goal (screen left) so the arriving midfielder is in frame before the square
 const lead=sm(CUEW(0,'past two'),CUEW(0,'into the box'),t,easeInOutSine);
 const T=lerp3([bt[0]-2-4*lead,1.4,bt[2]*.5+3+5*lead],[cel[0]-1,1.3,cel[1]],toC);
 const F=key(t,[[0,6400],[CUEW(0,'gallops'),6900],[CUEW(0,'past two'),7200],[CUEW(0,'squares'),7400],[G,7800],[G+1.2,8800],[S,9200]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Goal');
  stadium(s,c,v,t,{roar:sm(G-.4,G+.3,t),flash:sm(G-.2,G+.1,t)});
  ground(s,c,{bulge:bulgeM(tau),ball:NET_P});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8,hero:REI});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(MT,REI,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:10.2,
};

// ---------------------------------------------------------------- 2 · slow replay, low behind Reijnders' run: the chase, the late run, the space, touch, shot
const tau2=(t:number)=>key(t,mono([[0,-3.3],[CUEW(1,'defenders chase'),-2.5],[CUEW(1,'Reijnders runs'),-1.4],[CUEW(1,'into the empty'),.05],[CUEW(1,'One touch'),TOUCH+.02],[CUEW(1,'low shot'),SHOT+.02],[CUEW(1,'under the keeper'),IN_NET-.03],[SECS(1),IN_NET+.45]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(MT,REI,Math.min(tau,SHOT)),open=1-sm(0,1.4,t,easeInOutSine),toGoal=sm(CUEW(1,'One touch')-.8,CUEW(1,'low shot'),t,easeInOutSine);
 const C:V3=[m[0]-10+2*toGoal,3.3+.8*open,m[1]+7-2*toGoal],T:V3=[lerp(m[0]+7,103,.6*toGoal),lerp(.5,.9,toGoal),lerp(m[1]-6,-1,.6*toGoal)];
 return look(C,T,2200-250*open+300*toGoal);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),dc=CUEW(1,'defenders chase'),rl=CUEW(1,'Reijnders runs'),fm=CUEW(1,'from midfield'),es=CUEW(1,'into the empty'),ot=CUEW(1,'One touch'),ls=CUEW(1,'low shot'),uk=CUEW(1,'under the keeper'),E=SECS(1);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)*.6});
  ground(s,c,{bulge:bulgeM(tau),ball:NET_P});
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:REI,under:()=>{
   // "defenders chase Leão": red arrows along Vázquez's and Militão's runs toward him
   const dw=sm(dc-.1,dc+.6,t,easeOut)*(1-sm(es-.3,es+.2,t));
   groundArrow(s,c,runPts(VAZ,-3.3,-.6),dw,R,71);groundArrow(s,c,runPts(MLT,-3.3,-.6),dw,R,73);
   // "Reijnders runs late from midfield": his run, blue, drawn in from deep to the touch spot
   groundArrow(s,c,runPts(REI,-3.3,TOUCH),sm(rl-.1,fm+.5,t,easeOut)*(1-sm(ot,ot+.4,t)),B,63);
   // "into the empty space": the yellow ring where he meets the ball
   ring(s,c,TOUCH_P[0],TOUCH_P[1],1.5,sm(es-.2,es+.25,t,easeOutBack)*(1-sm(ot+.2,ot+.6,t)),Y,45);},
   after:({joints})=>{
    // the square ball lane (yellow) while it rolls
    flight(s,c,passPts(),sm(es-.1,es+.4,t,easeOut)*(1-sm(ot,ot+.4,t)),Y,85);
    // "One touch": a spark on his right boot
    const r=joints.get(REI),age=tau-TOUCH;if(r&&age>-.05&&age<.35)sparkBurst(s,Y,r.joints.rToe[0],r.joints.rToe[1],Math.max(14,r.heightPx*.18),{n:7,seed:93,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.2)/.15)),width:6});
    // "low shot": the flight, low along the grass; "under the keeper": the ring on it in the goal
    flight(s,c,shotPts(),sm(ls-.1,ls+.35,t,easeOut)*(1-sm(E-.6,E-.3,t)),Y,83);
    ringUp(s,c,105,.4,NET_P[2],.55,sm(uk-.2,uk+.2,t,easeOutBack)*(1-sm(E-.6,E-.3,t)));
    }});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(MT,REI,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:5.6,
};

// ---------------------------------------------------------------- 3 · the lesson, raised behind the goal, off the far post: eyes on the strikers, the forgotten midfielder, the gap
const tau3=(t:number)=>{const S=SECS(2);return key(t,mono([[0,-1.7],[CUEW(2,'arrive late'),-1.62],[CUEW(2,'Defenders watch'),-1.55],[CUEW(2,'forget the'),-1.45],[CUEW(2,'wait'),-1.3],[CUEW(2,'run into'),-.55],[CUEW(2,'be the one'),TOUCH],[S-.9,IN_NET+.1],[S,IN_NET+.4]]),linear);};
function cam3(t:number):Cam{
 const S=SECS(2),push=sm(0,S,t,easeInOutSine);
 const C:V3=[114-1.5*push,9-1*push,8-1*push],T:V3=[90+6*push,1.2*push,-9+4.5*push];
 return look(C,T,1750+400*push);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),al=CUEW(2,'arrive late'),dw=CUEW(2,'Defenders watch'),st=CUEW(2,'strikers'),fm=CUEW(2,'forget the'),wt=CUEW(2,'wait'),rg=CUEW(2,'run into'),bo=CUEW(2,'be the one'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)*.5});
  ground(s,c,{bulge:bulgeM(tau),ball:NET_P});
  const fade=1-sm(E-.7,E-.35,t);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:REI,smear:false,under:()=>{
   // "arrive late in the box" / "run into the gap": the yellow gap and his blue run into it
   ring(s,c,TOUCH_P[0],TOUCH_P[1],1.7,sm(al-.2,al+.3,t,easeOutBack)*(1-sm(bo+.3,bo+.8,t))*(1+.12*Math.sin(t*6)*sm(wt,wt+.3,t)*(1-sm(rg,rg+.3,t))),Y,45);
   groundArrow(s,c,runPts(REI,Math.min(tau,-1.3),TOUCH),sm(al,al+.6,t,easeOut)*(1-sm(bo,bo+.5,t)),B,63,t<rg);
   // "strikers": red rings under Leão and Abraham
   const sw=sm(st-.15,st+.25,t,easeOutBack)*(1-sm(bo,bo+.4,t));
   const[lx,lz]=posOf(MT,LEO,tau),[ax,az]=posOf(MT,ABR,tau);ring(s,c,lx,lz,1.1,sw,R,51);ring(s,c,ax,az,1.1,sw,R,53);
   // "forget the midfielder": a pulsing blue ring under Reijnders
   const[rx,rz]=posOf(MT,REI,tau);ring(s,c,rx,rz,1.2,sm(fm-.15,fm+.3,t,easeOutBack)*(1-sm(rg,rg+.4,t)),B,55);},
   after:()=>{
    // "Defenders watch": dashed red sight-lines from four defenders to the two strikers
    const w=sm(dw-.1,dw+.5,t,easeOut)*(1-sm(bo,bo+.4,t));
    const L=posOf(MT,LEO,tau),Ab=posOf(MT,ABR,tau);
    sight(s,c,posOf(MT,VAZ,tau),L,w,111);sight(s,c,posOf(MT,MLT,tau),L,w,113);sight(s,c,posOf(MT,RUD,tau),Ab,w,115);sight(s,c,posOf(MT,MEN,tau),Ab,w*.9,117);
    // the midfielder who should follow him is left behind: a red ✗ on his lost line
    const cw=sm(fm+.2,fm+.5,t,easeOutBack)*(1-sm(rg,rg+.4,t));if(cw>.02){const[cx,cz]=posOf(MT,CAM,tau),[rx,rz]=posOf(MT,REI,tau),P:V3=[lerp(cx,rx,.5),.4,lerp(cz,rz,.5)],q=pr(c,P);
     if(q){const L2=kAt(c,P)*.5*cw,p=new Path2D();for(const[dx,dy] of [[1,1],[1,-1]] as Pt[])p.addPath(ribbon([[q[0]-dx*L2,q[1]-dy*L2],[q[0]+dx*L2,q[1]+dy*L2]],Math.max(4,L2*.3),{seed:71+dx*3+dy,taper:.1,wobble:.8}));s.knockout(p,.9);s.fill(R,p,.95);}}
    // "be the one": the low shot under the keeper, a spark in the net
    flight(s,c,shotPts(),sm(bo+.3,bo+.8,t,easeOut)*fade,Y,87);
    const ga=tau-IN_NET,q=pr(c,NET_P);if(q&&ga>-.05&&ga<.5)sparkBurst(s,Y,q[0],q[1],kAt(c,NET_P)*.8,{n:8,seed:97,g:easeOutBack(clamp((ga+.05)/.15))*(1-clamp((ga-.3)/.2)),width:8});}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'reijnders-signature',format:'11v11',title:"Reijnders' Late Run into the Box",theme:'Arrive late in the box: defenders watch the strikers and forget the midfielder',
 ageNote:'Champions League, Real Madrid 1–3 AC Milan, Santiago Bernabéu, 5 November 2024 (Milan\'s third goal, 73rd minute): Leão\'s run and square ball, Reijnders arriving from midfield. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a kick of turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];a.addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
