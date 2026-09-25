/** Kevin De Bruyne — signature: the killer through-ball. Belgium 3–2 Japan, World Cup round of 16, Rostov Arena, Rostov-on-Don,
 * 2 July 2018 (21:00 local, a night match under floodlights): the counter-attack in the 94th minute (90+4). An iconic-play riso film
 * (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "the killer through-ball", lesson "pass into the space in front
 * of your striker so they can run onto it"): it is De Bruyne's best-documented pass on the biggest stage. Released by Courtois, he carried
 * the ball upfield and, with red shirts everywhere, "chose just the right moment to feed Meunier on the right" (Guardian) — "a terrific
 * pass" that "freed" Meunier (Goal.com): the ball went into the space ahead of a sprinting team-mate, who ran onto it at full speed and
 * crossed first time for the winner. The film is built around that pass.
 *
 * SOURCES (fetched Sept 2026 with a generic UA, cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "2018 FIFA World Cup knockout stage" (raw): date, 21:00 MSK kick-off, Rostov Arena, 3–2, Chadli 90+4; the summary "In the
 *    last minute of stoppage time, Courtois found Kevin De Bruyne with a long throw, who freed Thomas Meunier with a pass, Meunier squared
 *    a low cross from the right and, when Romelu Lukaku dummied the ball, substitute Nacer Chadli was on hand to complete the comeback
 *    for Belgium with a low finish"; both line-ups with numbers; the kit templates (Belgium all red; Japan navy shirts, shorts and socks)
 *    https://en.wikipedia.org/wiki/2018_FIFA_World_Cup_knockout_stage   (cache: wiki-2018-wc-ko.txt)
 *  - The Guardian, Stuart James, "Belgium's Nacer Chadli seals comeback win over Japan with last-gasp winner", 2 July 2018: "Thibaut
 *    Courtois, who had started that counterattack by claiming a corner"; "Kevin De Bruyne, released by Courtois, carry the ball upfield
 *    for at least 60 yards. There were red shirts everywhere but De Bruyne ... chose just the right moment to feed Meunier on the right.
 *    Romelu Lukaku selflessly allowed Meunier's low cross to run through to Chadli"
 *    https://www.theguardian.com/football/2018/jul/02/belgium-japan-world-cup-last-16-match-report   (cache: guardian-bel-jpn-2018-report.txt)
 *  - Goal.com, Jamie Smith, "Belgium 3 Japan 2: Last-gasp Chadli completes comeback" (web.archive.org 3 July 2018): Honda's injury-time
 *    free-kick turned wide; "Courtois claimed the resulting corner and within seconds the ball was in the net at the other end. Courtois
 *    found Kevin De Bruyne with a long throw and the Manchester City playmaker freed Meunier with a terrific pass ... Meunier kept his
 *    cool to square a low cross and, when Lukaku dummied the ball, substitute Chadli was on hand to sweep Belgium into ... a quarter-final"
 *    (cache: goal-bel-jpn-2018.txt)
 *  - The Guardian, "Six World Cup breakaway goals to rival Belgium's against Japan" and "Martínez tactics" (3 July 2018): "a lightning
 *    team move", "turned an opposition corner into a jet-heeled breakaway", "that wonderful 60-yard dash in injury-time"
 *  - FIFA, "Belgium dig deep to edge out Japan" (archived): "a textbook counter-attack in the fourth minute of stoppage time"
 * CONFIRMED by those accounts: the match, date, ground, night kick-off, 2–2 going into stoppage time, the winner at 90+4; Japan's corner
 * (after Honda's free-kick was turned wide) caught by Courtois; his throw out to De Bruyne; De Bruyne's run with the ball of about 60
 * yards; his pass to Meunier on the RIGHT; Meunier's LOW cross from the right; Lukaku's dummy; Chadli (a substitute) finishing low into
 * an open goal; Japan's players left chasing. KIT: Belgium red shirts, red shorts, red socks; Japan navy shirts, navy shorts, navy socks.
 * Numbers: Courtois 1, De Bruyne 7, Meunier 15, Lukaku 9, Chadli 22, Hazard 10, Witsel 6, Fellaini 8, Kompany 4, Vertonghen 5,
 * Alderweireld 2; Japan: Kawashima 1, Honda 4, Yamaguchi 16, Hasebe 17, Nagatomo 5, Yoshida 22, Shoji 3, Sakai 19, Kagawa 10,
 * Inui 14, Osako 15.
 * INFERRED (illustrative, and kept OUT of the narration): every exact position, speed and timing; the corner coming from Belgium's left
 * (the far side on screen) and Honda taking it with his left foot; Courtois catching it high and BOWLING the ball out underarm (sources
 * say "long throw"); De Bruyne starting near the right edge of his own box and striking the pass with his RIGHT foot (his stronger foot);
 * the ball's route and weight into the space ahead of Meunier; Meunier crossing first time with his right foot; Lukaku stepping over the
 * ball around the penalty spot; Chadli arriving at the far post and sweeping it in with his LEFT foot; Kawashima's late dive; where
 * each Japan player chased from (Yamaguchi retreating in front of De Bruyne, Nagatomo behind Meunier); Belgium's shirt pattern (drawn
 * plain), their yellow numbers and navy trim; both keepers' kits (Courtois yellow, Kawashima pale yellow); the direction of play on
 * screen (Belgium attacking left to right from the main-stand camera, which puts Meunier on the NEAR touchline); the Rostov Arena's
 * shape (a boxy two-tier bowl under a continuous roof ring with a floodlight strip), the crowd colours (Belgian red, Japanese blue,
 * white, phone lights); the celebration.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time, panning with the ball from the corner
 * to the net; ch2 = the slow-motion replay from a raised camera behind De Bruyne's left shoulder: NOT to Meunier's feet (a red ring,
 * crossed out) but into the space in front of him (a yellow target on the grass, the ball's lane, Meunier's run); ch3 = a second replay
 * angle from BEHIND JAPAN'S GOAL: Meunier runs onto it without slowing, the low cross, Lukaku's dummy, Chadli, the net; ch4 = the lesson
 * over De Bruyne's shoulder as he looks up (spot the run, pass into the space, they run onto it). All figures are the shared riso
 * athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Full-sheet card-window framing (1.45:1 to square),
 * never sheet.safe. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film;
 * every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,keyPoses,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The winner, live',text:'Belgium against Japan, two all, the last minute. Courtois throws it to Kevin De Bruyne. Off he races with the ball, on and on and on... then the pass, into space for Meunier! Low cross... Chadli scores!',seconds:16.4,
  cues:[[.2,'Belgium against Japan'],[1.5,'two all'],[2.3,'the last minute'],[3.8,'Courtois throws'],[5,'Kevin De Bruyne'],[6.3,'Off he races'],[7.8,'on and on'],[10,'then the pass'],[10.9,'into space'],[12.4,'Low cross'],[13.6,'Chadli scores']]},
 {label:'Watch it again',text:"Watch again, slowly. De Bruyne does not pass to Meunier's feet. He passes into the space in front of him.",seconds:8.8,
  cues:[[.15,'Watch again'],[.9,'slowly'],[1.6,'De Bruyne'],[2.3,'does not pass'],[3.1,"Meunier's feet"],[4.6,'He passes'],[5.4,'into the space'],[6.4,'in front of him']]},
 {label:'Onto it',text:'Meunier never slows down. Low cross, Lukaku lets it run... goal!',seconds:7,
  cues:[[.15,'Meunier never'],[1.1,'slows down'],[2.1,'Low cross'],[3,'Lukaku lets it run'],[4.6,'goal']]},
 {label:'Your turn',text:"Your turn: spot your teammate's run and pass into the space in front of them, so they can run onto it.",seconds:9,
  cues:[[.15,'Your turn'],[1,"spot your teammate's run"],[2.6,'and pass'],[3.2,'into the space'],[4.1,'in front of them'],[5.2,'so they can'],[6,'run onto it']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py de-bruyne-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/de-bruyne-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-de-bruyne-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/de-bruyne-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('de-bruyne: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre at z0 units per world unit (the engine's
 * arrival scale is kept, so passages and seams behave as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Belgium's goal at 0, Belgium attack +X, Japan's goal line at 105),
 * Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z,
 * so Belgium's right flank (Meunier) is the near side. */
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

// ---------------------------------------------------------------- the Rostov Arena at night: a boxy two-tier bowl under a continuous roof ring
const CX=52.5,NS=60;
/** a point on the bowl: angle th round the pitch centre, d metres out from the pitch-side rim (a boxy superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.32),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.32)];}
const LOW=(b:number):[number,number]=>[1+21*b,1.2+12*b],UP=(b:number):[number,number]=>[24+19*b,15.5+16*b];
type Bowl={low:V3[][];up:V3[][];band:V3[][];roof:V3[][];lamps:[V3,V3][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],band:[],roof:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW));o.up.push(Q(UP));
  o.band.push([rim(a,22,13.2),rim(b,22,13.2),rim(b,24,15.5),rim(a,24,15.5)]);
  o.roof.push([rim(a,18,36.5),rim(b,18,36.5),rim(b,50,34),rim(a,50,34)]);
  o.lamps.push([rim(a,18.6,35.9),rim(b,18.6,35.9)]);
  for(const [f,rows,off] of [[LOW,8,0],[UP,7,5000]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+off,11);if(h<.16)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = phones and cameras), the roof and its lamps */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 s.field(K,.72,.5);s.field(B,.28,.5);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D();
 for(let i=0;i<NS;i++){const r1=quadP(c,BOWL.low[i]);if(r1)addPoly(low,r1);const r2=quadP(c,BOWL.up[i]);if(r2)addPoly(up,r2);const r3=quadP(c,BOWL.band[i]);if(r3)addPoly(band,r3);const r4=quadP(c,BOWL.roof[i],10);if(r4)addPoly(roof,r4);}
 s.knockout(low);s.tone(B,low,.4);s.tone(K,low,.3);
 s.knockout(up);s.tone(B,up,.38);s.tone(K,up,.42);
 // the crowd: Belgian red, Japanese blue, white shirts, a few phone lights (yellow)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.h<.5?0:q.h<.72?1:q.h<.95?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.fill(R,inks[0],.85);s.fill(B,inks[1],.8);s.knockout(inks[2],.7);s.fill(Y,inks[3],.95);
 s.knockout(band);s.fill(K,band,.85);
 s.knockout(roof);s.fill(K,roof,.9);
 // the floodlight strip under the roof edge, with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+6||toCam(c,b)[2]<NEAR+6)continue;seg3(c,a,b,.8,lamp);seg3(c,a,b,3.2,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the floodlit grass (yellow × blue) with mowing stripes, boards, paper lines, corner flags and both goals (the Japan goal drawn later
 * when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-41],[114,0,-41],[114,0,41],[-9,0,41]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.9);s.tone(K,p,.25);}
 const g=polyP(c,[[-5,0,-38],[110,0,-38],[110,0,38],[-5,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]));s.tone(K,st,.12);
 // boards: along the far touchline and behind both goals (navy LED boards with blue and paper panels, generic)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));addPoly(pn,polyP(c,[[-3.45,.25,z],[-3.45,.25,z+3.4],[-3.45,.65,z+3.4],[-3.45,.65,z]]));}
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
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]],SKIN_J:InkFill[]=[[Y,.46],[R,.22]];
/** Belgium: all red (confirmed); yellow numbers and navy trim inferred (the shirt's diamond pattern is printed plain) */
const BEL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:Y,seed:3,...o});
/** Japan: navy shirts, shorts and socks (confirmed); white numbers and trim inferred */
const JPN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,shorts:K,socks:K,boots:K,trim:'paper',skin:SKIN_J,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
const KDB_STYLE=BEL({number:7,hair:[Y,.9],build:{height:1.81,bulk:1},seed:7});
const COURTOIS:AthleteStyle={shirt:Y,shorts:[K,.85],socks:Y,boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.99},seed:1};
const KAWASHIMA:AthleteStyle={shirt:[Y,.55],shorts:[Y,.55],socks:[Y,.55],boots:K,skin:SKIN_J,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,build:{height:1.85},seed:41};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Courtois lets the ball go)
type Role='kdb'|'bel'|'jpn'|'gk';
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The beats the accounts give (Courtois claims the corner and throws, De Bruyne's
 * ~60-yard carry, the pass to Meunier on the right, the low cross, Lukaku's dummy, Chadli) are kept; every exact spot is inferred. */
const ACTORS:Actor[]=[
 {name:'De Bruyne',role:'kdb',style:KDB_STYLE,key:true,keys:[[-4.6,11,10.5],[-1.6,11.5,9.8],[-.4,12.2,9.2],[.95,15.2,8.2],[2,23,7],[3,31.5,6],[4,40,5],[5,48.6,4.2],[6,57.3,3.5],[7,65.8,3],[7.5,69.4,3.3],[8.5,74.4,4.6],[10,78.4,5.5],[13,82,6]]},
 {name:'Courtois',role:'gk',style:COURTOIS,key:true,keys:[[-4.6,1.3,-.6],[-3,1.6,-.9],[-1.6,3,-1.3],[-1,4.3,-.5],[-.35,5.7,.5],[0,6.3,.9],[1,6.6,1.1],[13,9,2]]},
 {name:'Meunier',role:'bel',style:BEL({number:15,seed:15,hair:K,build:{height:1.9}}),key:true,keys:[[-4.6,20,22],[-1.6,22,24],[0,25,26],[1,31,26.5],[2,38.5,26.2],[3,46,25.5],[4,53.5,24.5],[5,61,23.5],[6,68.5,22.5],[7,76,21.2],[7.8,82,20],[8.25,85.6,19.1],[8.8,88.4,18],[10,91,16],[13,95,12]]},
 {name:'Lukaku',role:'bel',style:BEL({number:9,seed:9,skin:SKIN_D,hair:K,build:{height:1.91,bulk:1.14,thighs:1.1}}),key:true,keys:[[-4.6,34,-2],[0,40,0],[2,52,1],[4,66,2],[6,80,3.2],[7.5,90,4.4],[8.4,94.8,4.8],[9,95.5,4.9],[10,96.4,4.4],[13,99,6]]},
 {name:'Chadli',role:'bel',style:BEL({number:22,seed:22,skin:SKIN_M,hair:K,build:{height:1.87}}),key:true,keys:[[-4.6,25,-8],[0,31,-9],[2,44,-9],[4,58,-8.5],[6,73,-7.5],[8,88,-5.5],[9,96.6,-4],[9.5,100.3,-3.3],[9.8,101.4,-3],[10.5,102.4,-1.6],[11.4,101.2,2.4],[13,97.5,9]]},
 {name:'Hazard',role:'bel',style:BEL({number:10,seed:10,skin:SKIN_M,hair:K,build:{height:1.73,bulk:1.06}}),keys:[[-4.6,24,-18],[0,30,-19],[4,55,-18],[8,84,-14],[10,92,-11],[13,97,-5]]},
 {name:'Witsel',role:'bel',style:BEL({number:6,seed:6,skin:SKIN_M,hairStyle:'curly'}),keys:[[-4.6,14,-6],[0,17,-5],[8,48,-2],[13,60,0]]},
 {name:'Fellaini',role:'bel',style:BEL({number:8,seed:8,skin:SKIN_M,hairStyle:'curly',build:{height:1.94}}),keys:[[-4.6,4,-2.5],[0,7,-2],[8,32,-2],[13,44,-1]]},
 {name:'Kompany',role:'bel',style:BEL({number:4,seed:4,skin:SKIN_D,hairStyle:'bald'}),keys:[[-4.6,5,3],[0,8,3],[13,24,4]]},
 {name:'Vertonghen',role:'bel',style:BEL({number:5,seed:5}),keys:[[-4.6,5,-7],[0,8,-7],[13,24,-6]]},
 {name:'Alderweireld',role:'bel',style:BEL({number:2,seed:2}),keys:[[-4.6,9,14],[0,11,14],[13,28,12]]},
 {name:'Honda',role:'jpn',style:JPN({number:4,seed:44,hair:[Y,.8]}),key:true,keys:[[-4.6,-1.3,-35.3],[-3.5,-.7,-34.5],[-3,.35,-33.6],[-2.4,1.4,-33],[0,4,-31],[13,24,-24]]},
 {name:'Yamaguchi',role:'jpn',style:JPN({number:16,seed:46}),key:true,moves:[{kind:'lunge',at:6.95,dur:.8,side:'r'}],keys:[[-4.6,30,6],[0,33,5],[1.5,34.5,4.4],[3,38.5,4],[4,45,3.4],[5,52,2.6],[6,59,1.8],[6.8,64.2,1.4],[7.4,66.2,1.6],[8,69,1.2],[10,80,-.6],[13,90,-1]]},
 {name:'Nagatomo',role:'jpn',style:JPN({number:5,seed:45}),keys:[[-4.6,14,20],[0,17,21],[4,42,22],[8,78,18.5],[9,84.5,15.5],[13,93,9]]},
 {name:'Hasebe',role:'jpn',style:JPN({number:17,seed:47}),keys:[[-4.6,8,-4],[0,11,-3],[8,54,-2],[13,72,0]]},
 {name:'Yoshida',role:'jpn',style:JPN({number:22,seed:48,build:{height:1.89}}),keys:[[-4.6,4,1],[0,6.5,1.5],[13,50,2]]},
 {name:'Shoji',role:'jpn',style:JPN({number:3,seed:49}),keys:[[-4.6,3,-3.5],[0,5,-3],[13,45,-3]]},
 {name:'Kagawa',role:'jpn',style:JPN({number:10,seed:50}),keys:[[-4.6,10,6],[0,13,6],[13,48,6]]},
 {name:'Osako',role:'jpn',style:JPN({number:15,seed:51}),keys:[[-4.6,3.5,-1],[0,5.5,0],[13,40,1]]},
 {name:'Inui',role:'jpn',style:JPN({number:14,seed:52}),keys:[[-4.6,7,-10],[0,9,-10],[13,42,-10]]},
 {name:'Sakai',role:'jpn',style:JPN({number:19,seed:53}),keys:[[-4.6,20,-20],[0,24,-19],[8,62,-14],[13,82,-8]]},
 {name:'Kawashima',role:'gk',style:KAWASHIMA,key:true,moves:[{kind:'dive',at:9.66,dur:.9,side:'r'}],keys:[[-4.6,101,0],[6,102.5,1.5],[8.3,103,2.4],[9.1,102.6,.3],[9.45,102.3,-.8],[13,102.3,-.8]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const KDB=IX('De Bruyne'),GK=IX('Courtois'),MEU=IX('Meunier'),LUK=IX('Lukaku'),CHA=IX('Chadli'),HONDA=IX('Honda'),YAMA=IX('Yamaguchi'),KAWA=IX('Kawashima');
const BELS=new Set(ACTORS.map((a,i)=>a.role==='bel'||a.role==='kdb'?i:-1));
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4.6,T1=13,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(k,tau),y=headingOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}

// ---------------------------------------------------------------- the ball: the corner, Courtois's hands, the bowl out, the carry, THE PASS, the cross, the finish
const CORNER_KICK=-3,CATCH=-1.6,THROW0=-.63,RELEASE=0,RECEIVE=.95,PASS=7,MEET=8.25,SHOT=9.5,IN_NET=SHOT+.3;
/** De Bruyne's run: sprint strides of SL metres; he knocks the ball on with his right foot every second stride (inferred) */
const SL=3.9;
const TOUCHES:number[]=(()=>{const out:number[]=[RECEIVE];let prev=distOf(KDB,RECEIVE)/SL;let n=0;
 for(let tau=RECEIVE+DT;tau<PASS-.45;tau+=DT){const ph=distOf(KDB,tau)/SL-.92;if(Math.floor(ph)>Math.floor(prev)){n++;if(n%2===0&&tau-out[out.length-1]>.5)out.push(tau);}prev=ph;}
 return[...out,PASS];})();
const TP=TOUCHES.map(t=>footSpot(KDB,t,'r'));
const CORNER:V3=[.9,.11,-33.1];
const catchPt=():V3=>{const[x,z]=posOf(GK,CATCH);return[x+.25,2.62,z];};
const MEET_PT=footSpot(MEU,MEET,'r',.45);
const SHOT_PT=footSpot(CHA,SHOT,'l',.4);
const NET:V3=[105.4,.38,-1.2],REST:V3=[106.4,.11,-.9];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
function gkHold(tau:number):V3{const[x,z]=posOf(GK,tau),y=yawOf(posOf(KDB,RECEIVE)[0]-x,posOf(KDB,RECEIVE)[1]-z),f:Pt=[Math.cos(y),-Math.sin(y)];
 const chest:V3=[x+f[0]*.35,1.2,z+f[1]*.35],hip:V3=[x-f[0]*.25,.62,z-f[1]*.25],rel:V3=[x+f[0]*.9,.2,z+f[1]*.9];
 if(tau<CATCH+.4)return lerp3(catchPt(),chest,sm(CATCH,CATCH+.4,tau));
 if(tau<THROW0+.3)return lerp3(chest,hip,sm(THROW0,THROW0+.3,tau,easeInOutSine));
 return lerp3(hip,rel,sm(THROW0+.3,RELEASE,tau));}
function ballAt(tau:number):V3{
 if(tau<CORNER_KICK)return CORNER;
 if(tau<CATCH){const u=(tau-CORNER_KICK)/(CATCH-CORNER_KICK),P=catchPt();const b=lerp3(CORNER,P,u);return[b[0],lerp(CORNER[1],P[1],u)+7.2*Math.sin(Math.PI*u)*(1-.3*u),b[2]+1.6*Math.sin(Math.PI*u)];}
 if(tau<RELEASE)return gkHold(tau);
 const rel=gkHold(RELEASE-1e-4),tp0:V3=[TP[0][0],.11,TP[0][1]];
 if(tau<RECEIVE){const u=(tau-RELEASE)/(RECEIVE-RELEASE),b=roll(rel,tp0,u,.2);return[b[0],.11+(rel[1]-.11)*(1-u)*(1-u)+.12*Math.abs(Math.sin(Math.PI*u*1.6))*(1-u),b[2]];}
 if(tau<PASS){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const P0:V3=[TP[TP.length-1][0],.11,TP[TP.length-1][1]],M:V3=[MEET_PT[0],.11,MEET_PT[1]],S:V3=[SHOT_PT[0],.11,SHOT_PT[1]];
 if(tau<MEET)return roll(P0,M,(tau-PASS)/(MEET-PASS),.35);
 if(tau<SHOT){const u=(tau-MEET)/(SHOT-MEET),b=roll(M,S,u,.2);return[b[0],.11+.22*Math.sin(Math.PI*u),b[2]];}
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(S[0],NET[0],u),.11+(NET[1]-.11)*u,lerp(S[2],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return lerp3(NET,REST,e);
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** Courtois claims the corner: up off one leg, both arms above the head, palms to the ball */
const CATCH_POSE:Partial<Pose>={lShF:168,rShF:168,lShA:18,rShA:18,lElb:22,rElb:22,lHand:1,rHand:1,air:.38,lHipF:10,lKnee:30,rHipF:64,rKnee:92,rAnk:30,neckP:-42,lean:-8};
/** clutching it to the chest */
const HOLD:Partial<Pose>={lShF:52,rShF:52,lShA:14,rShA:14,lElb:112,rElb:112,lShR:30,rShR:30,neckP:6,lean:10};
/** the bowl out (right hand, underarm): chest → back-swing → release low in a long stride (release at .7) → follow-through */
function bowl(u:number):Pose{return keyPoses(u,[
 [0,posed({lHipF:18,rHipF:10,lKnee:22,rKnee:22,lShF:52,rShF:52,lElb:110,rElb:110,lean:10})],
 [.35,posed({lHipF:40,lKnee:40,rHipF:-18,rKnee:34,lean:30,rShF:-62,rShA:12,rElb:10,lShF:44,lShA:30,lElb:40,twist:-22,neckP:22})],
 [.7,posed({lHipF:66,lKnee:84,rHipF:-32,rKnee:62,rAnk:30,lean:54,pitch:10,rShF:36,rElb:8,rShA:8,lShA:52,lShF:0,lElb:40,twist:12,neckP:12,rHand:1,squash:-.05})],
 [1,posed({lHipF:46,lKnee:60,rHipF:-8,rKnee:40,lean:34,rShF:74,rElb:20,rShA:10,lShA:40,lElb:50,twist:16,neckP:0,rHand:1})],
]);}
/** Lukaku's dummy: he opens up and lifts his right leg over the ball, letting it run through (inferred shape) */
const DUMMY:Partial<Pose>={rHipF:46,rHipA:26,rKnee:70,rAnk:20,lKnee:34,lHipF:16,twist:-14,lean:22,bend:-8,lShA:40,rShA:48,lElb:40,rElb:40,neckP:38,squash:-.03};
/** De Bruyne looks up before the pass (head lifted, chest open) */
const LOOK_UP:Partial<Pose>={neckP:-8,neckY:-26,twist:-6};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='jpn'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),inWin(u));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:.12});}}
 if(a.role==='gk'&&k===KAWA&&tau<9.66-.5)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===KAWA&&tau>=9.66-.5)yaw=Math.PI;
 if(k===GK){yaw=tau<CATCH?yawOf(b[0]-x,b[2]-z):lerpA(yawOf(b[0]-x,b[2]-z),yawOf(posOf(KDB,RECEIVE)[0]-x,posOf(KDB,RECEIVE)[1]-z),sm(CATCH,CATCH+.6,tau));
  p=over(p,CATCH_POSE,bump(CATCH-.55,CATCH+.35,tau));p=over(p,HOLD,sm(CATCH+.15,CATCH+.45,tau)*(1-sm(THROW0-.05,THROW0+.1,tau)));
  const u=(tau-THROW0)/.9;if(u>0&&u<1.4)p=blendPose(p,bowl(Math.min(1,u)),inWin(u));}
 if(k===HONDA){const D=1,u=(tau-(CORNER_KICK-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.7}),inWin(u));if(tau<CORNER_KICK+.2)yaw=lerpA(yaw,yawOf(3-x,-1-z),.6);}
 if(k===KDB){
  if(tau<RECEIVE-.2&&sp<1.5)yaw=yawOf(b[0]-x,b[2]-z);
  for(let i=0;i<TOUCHES.length-1;i++)p=over(p,{rHipF:34,rKnee:26,rAnk:34,rHipR:10},bump(TOUCHES[i]-.16,TOUCHES[i]+.1,tau));
  p=over(p,LOOK_UP,bump(5.2,PASS-.1,tau)*.9);
  const D=.8,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),inWin(u));yaw=lerpA(yaw,yawOf(MEET_PT[0]-x,MEET_PT[1]-z),.55*inWin(u));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.4,IN_NET+.9,tau));}
 if(k===MEU){const D=.85,u=(tau-(MEET-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.6}),inWin(u));yaw=lerpA(yaw,yawOf(SHOT_PT[0]-x,SHOT_PT[1]-z),.7*inWin(u));}
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.3,IN_NET+.8,tau));}
 if(k===LUK){const w=bump(8.55,9.45,tau);if(w>0){p=over(p,DUMMY,w);yaw=lerpA(yaw,yawOf(MEET_PT[0]-x,MEET_PT[1]-z),w);}
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.3,IN_NET+.8,tau));}
 if(k===CHA){const D=.8,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.5}),inWin(u));yaw=lerpA(yaw,yawOf(NET[0]-x,NET[2]-z),.8*inWin(u));}
  if(tau>IN_NET+.5)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.5,IN_NET+1,tau));}
 if(BELS.has(k)&&k!==KDB&&k!==MEU&&k!==LUK&&k!==CHA&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='jpn'&&tau>IN_NET+.8)p=over(p,{lean:40,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.8,IN_NET+1.6,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: the 2018 Adidas Telstar (paper, navy pixel panels)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D();for(let i=0;i<6;i++){const a=rot+i/6*TAU+(i%2)*.3,d=r*(i%2?.62:.3),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d,w=r*.24;pan.addPath(polyPath([[cx-w,cy-w*.5],[cx+w*.4,cy-w*.8],[cx+w,cy+w*.3],[cx-w*.2,cy+w*.8]],true));}
 s.fill(K,pan,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=-1}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: short, soft); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===hero||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:e.k===hero}:{});
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / a fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a cross (✗) on the grass: "not there" */
function crossOut(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number){if(w<=.02)return;const k=kAt(c,[x,0,z]),p=new Path2D(),L=rad*w;
 for(const[dx,dz] of [[1,1],[1,-1]] as Pt[]){const a=pr(c,[x-dx*L,0,z-dz*L]),b=pr(c,[x+dx*L,0,z+dz*L]);if(a&&b)p.addPath(ribbon([a,b],Math.max(5,k*.2),{seed:71+dx*3+dz,taper:.1,wobble:.8}));}
 s.knockout(p,.9);s.fill(R,p,.95);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(6,c.F*.16/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** Meunier's run from τa to τb as ground points */
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(ta,tb,i/n)));return o;};
/** the pass lane: from De Bruyne's boot to the meeting spot */
const passPts=(n=12):[number,number][]=>{const a=TP[TP.length-1],o:[number,number][]=[];for(let i=0;i<=n;i++){const u=i/n;o.push([lerp(a[0],MEET_PT[0],u),lerp(a[1],MEET_PT[1],u)]);}return o;};
/** "look up": a dashed yellow sight line from his eyes to a point */
function sightLine(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number){if(!r||!to||w<=.02)return;const h=r.joints.head,u=Math.max(4,Math.hypot(h[0]-r.joints.neck[0],h[1]-r.joints.neck[1])*.35);
 const end:Pt=[lerp(h[0],to[0],w),lerp(h[1],to[1],w)];s.knockout(ribbon([h,end],u*1.8,{seed:91,taper:.2,wobble:.6}),.7);laneArrow(s,Y,h,end,u,{dashed:true,seed:92,head:u*3});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the corner and the run play at ~1–1.5× real time) */
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'Chadli');return key(t,mono([[0,-4.4],[CUEW(0,'two all'),-3.15],[CUEW(0,'the last minute'),-2.2],[CUEW(0,'Courtois throws'),-.45],[CUEW(0,'Kevin De Bruyne'),.7],[CUEW(0,'Off he races'),1.6],[CUEW(0,'then the pass'),PASS-.15],[CUEW(0,'into space'),7.6],[CUEW(0,'Low cross'),MEET],[G,IN_NET-.05],[S+1,IN_NET-.05+(S+1-G)*.9]]),linear);};
const CAM1:V3=[52.5,27,74];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'Chadli'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the pre-roll frames the corner + Courtois; then the camera rides the ball (a little ahead of it during the run)
 const lead=sm(1.2,3,tau)*(1-sm(8,9.4,tau))*4,cel=posOf(CHA,tau),toC=sm(G+.5,G+1.6,t,easeInOutSine);
 const T0:V3=[lerp(4,bt[0],sm(-4.4,-3.2,tau))+lead,0,lerp(-12,bt[2]*.7,sm(-4.4,-2.6,tau))],T=lerp3(T0,[cel[0]-1,1.2,cel[1]],toC);
 const F=key(t,[[0,4300],[CUEW(0,'Courtois'),5600],[CUEW(0,'Off he'),5200],[CUEW(0,'then the pass'),4900],[CUEW(0,'Low cross'),5600],[G,6300],[G+1.4,7000],[S,7300]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Chadli');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,hero:KDB});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(CHA,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, raised behind De Bruyne's left shoulder: not to the feet — into the space
const tau2=(t:number)=>key(t,mono([[0,4.4],[CUEW(1,'De Bruyne'),5.3],[CUEW(1,'does not'),5.75],[CUEW(1,"Meunier's feet"),6.2],[CUEW(1,'He passes'),6.8],[CUEW(1,'into the space'),PASS+.05],[CUEW(1,'in front'),7.55],[SECS(1),MEET+.15]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(KDB,tau),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUEW(1,'He passes')-.4,CUEW(1,'into the space')+.4,t,easeInOutSine);
 const mp=smooth(MEU,Math.min(tau,MEET)),aim=.32+.18*wide;
 const C:V3=[m[0]-11-2*wide+3*open,5+1.5*wide,m[1]-6-1*wide],T:V3=[lerp(m[0],mp[0],aim)+2,.3,lerp(m[1],mp[1],aim)];
 return look(C,T,2500-350*wide-250*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),mf=CUEW(1,"Meunier's feet"),hp=CUEW(1,'He passes'),is=CUEW(1,'into the space'),fr=CUEW(1,'in front'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:KDB,under:()=>{
   // "Meunier's feet": a red ring where he is now — and a cross: not there
   const fw=sm(mf-.15,mf+.25,t,easeOutBack)*(1-sm(E-1,E-.6,t)),[mx,mz]=posOf(MEU,Math.min(tau,6.2));
   ring(s,c,mx,mz,1.1,fw,R,44);crossOut(s,c,mx,mz,1.05,sm(mf+.35,mf+.65,t,easeOut)*(1-sm(E-1,E-.6,t)));
   // "into the space": the yellow target ahead of him, his run and the ball's lane to it
   const sw=sm(is-.2,is+.25,t,easeOutBack)*(1-sm(E-.8,E-.4,t));
   ring(s,c,MEET_PT[0],MEET_PT[1],1.5,sw,Y,45);
   groundArrow(s,c,runPts(MEU,6,MEET),sm(hp-.2,is+.3,t,easeOut)*(1-sm(E-.8,E-.4,t)),B,63);
   groundArrow(s,c,passPts(),sm(is,fr+.2,t,easeOut)*(1-sm(E-.8,E-.4,t)),Y,65);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · second replay angle from behind Japan's goal: onto it, the cross, the dummy, the net
const tau3=(t:number)=>{const g=CUEW(2,'goal');return key(t,mono([[0,7.7],[CUEW(2,'slows down'),MEET-.05],[CUEW(2,'Low cross'),8.55],[CUEW(2,'Lukaku'),9.05],[g,IN_NET+.1],[SECS(2),IN_NET+.1+(SECS(2)-g)*.85]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),g=CUEW(2,'goal'),turn=sm(g+.4,SECS(2)-.4,t,easeInOutSine),ch=smooth(CHA,tau);
 const C0:V3=[113.5,4.6,-8.5],T0:V3=[lerp(90,98,sm(MEET,SHOT,tau,easeInOutSine)),.9,lerp(12,1,sm(MEET,SHOT,tau,easeInOutSine))];
 const C1:V3=[ch[0]+7,2.4,ch[1]-8],T1:V3=[ch[0]-1,1.1,ch[1]+1];
 return look(lerp3(C0,C1,turn),lerp3(T0,T1,turn),lerp(2700+400*sm(MEET,SHOT,tau),3200,turn));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),g=CUEW(2,'goal'),turn=sm(g+.4,SECS(2)-.4,t,easeInOutSine),ls=CUEW(2,'Lukaku'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(g-.1,g+.3,t)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{goalLater:turn<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:tau<MEET+.4?MEU:CHA,under:()=>{
   // "never slows down": his run arrow onto the ball; "Lukaku lets it run": a yellow ring at the ball as it passes his feet
   groundArrow(s,c,runPts(MEU,7.3,MEET),sm(.1,CUEW(2,'slows down')+.3,t,easeOut)*(1-sm(CUEW(2,'Low cross')-.1,CUEW(2,'Low cross')+.3,t)),B,66);
   const [lx,lz]=posOf(LUK,9);ring(s,c,lx,lz,1.2,sm(ls-.1,ls+.3,t,easeOutBack)*(1-sm(g-.3,g,t)),Y,47);}});
  if(turn<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(CHA,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: over De Bruyne's shoulder — spot the run, pass into the space, they run onto it
const tau4=(t:number)=>key(t,mono([[0,5.6],[CUEW(3,'spot'),6.05],[CUEW(3,'and pass'),6.75],[CUEW(3,'into the space'),PASS+.05],[CUEW(3,'in front'),7.45],[CUEW(3,'so they'),7.95],[CUEW(3,'run onto'),MEET],[SECS(3),MEET+.5]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(KDB,Math.min(tau,PASS+.3)),push=sm(0,1.2,t,easeInOutSine),follow=sm(CUEW(3,'so they')-.4,SECS(3)-.3,t,easeInOutSine),mp=smooth(MEU,tau);
 const C:V3=[m[0]-6.5-1.5*(1-push),4+.8*follow,m[1]-4.8-1.5*(1-push)],T0:V3=[lerp(m[0],MEET_PT[0],.42),.4,lerp(m[1],MEET_PT[1],.42)],T1:V3=[lerp(m[0],mp[0],.62),.5,lerp(m[1],mp[1],.62)];
 return look(C,lerp3(T0,T1,follow),2050+200*push-200*follow);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),sp=CUEW(3,'spot'),ap=CUEW(3,'and pass'),is=CUEW(3,'into the space'),fr=CUEW(3,'in front'),st=CUEW(3,'so they'),ro=CUEW(3,'run onto'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:KDB,under:()=>{
   groundArrow(s,c,runPts(MEU,5.8,MEET),sm(sp,sp+.9,t,easeOut)*(1-sm(E-1,E-.6,t)),B,67);
   ring(s,c,MEET_PT[0],MEET_PT[1],1.5,sm(is-.2,is+.25,t,easeOutBack)*(1-sm(E-.9,E-.5,t)),Y,48);
   groundArrow(s,c,passPts(),sm(ap,fr+.3,t,easeOut)*(1-sm(E-.9,E-.5,t)),Y,69);},
   after:({joints})=>{
    // "spot your teammate's run": a sight line from his eyes to Meunier
    const r=joints.get(KDB),[mx,mz]=posOf(MEU,tau);sightLine(s,r,pr(c,[mx,1.6,mz]),sm(sp+.2,sp+.8,t,easeOut)*(1-sm(ap-.1,ap+.3,t)));
    // "run onto it": ball and runner meet — a yellow spark at Meunier's boot
    const age=t-ro;if(age>-.2&&age<.7){const q=pr(c,[MEET_PT[0],.15,MEET_PT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[MEET_PT[0],0,MEET_PT[1]])*.7,{n:8,seed:93,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.45)/.25)),width:9});}
    // "so they": speed lines trail Meunier
    const rw=sm(st-.1,st+.3,t)*(1-sm(E-.8,E-.3,t));
    if(rw>0){const q=pr(c,[mx,1.1,mz]),q2=pr(c,[mx+1,1.1,mz]);if(q&&q2){const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=kAt(c,[mx,1,mz]);for(const k of[0,1])s.fill(K,ribbon([[q[0]-Math.cos(dir)*z*(.7+k*.3),q[1]-Math.sin(dir)*z*(.7+k*.3)-z*(.3-k*.5)],[q[0]-Math.cos(dir)*z*(1.7+k*.5),q[1]-Math.sin(dir)*z*(1.7+k*.5)-z*(.3-k*.5)]],z*.05,{seed:9+k,taper:.9,wobble:.5}),.6*rw);}}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'de-bruyne-signature',format:'11v11',title:"De Bruyne's Killer Pass",theme:'Pass into the space in front of your teammate so they can run onto it',
 ageNote:'World Cup round of 16, Belgium 3–2 Japan, Rostov Arena, 2 July 2018 (the 94th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];a.addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
