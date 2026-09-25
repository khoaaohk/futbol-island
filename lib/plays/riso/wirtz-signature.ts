/** Florian Wirtz — signature: the clever killer pass. Germany 5–0 Hungary, UEFA Nations League, League A Group 3 (matchday 1),
 * Merkur Spiel-Arena, Düsseldorf, 7 September 2024: the second goal, in the 58th minute — Wirtz's pass, Jamal Musiala's run from his
 * own half, one on one, 2–0. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the
 * footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "the clever killer pass", lesson "look for the run behind the
 * defenders and pass into their path"): the two moments the brief suggested (the Bremen hat-trick that clinched the 2024 title, the
 * Euro 2024 goal v Scotland) are Wirtz GOALS — the Bundesliga report credits none of Leverkusen's five goals that day to a Wirtz pass. The
 * best-documented Wirtz killer pass we could confirm in writing is this one: BBC Sport — "Musiala doubled Germany's lead as they broke
 * from a Hungary corner, running through one on one from his own half to slot home. Florian Wirtz, who set up that goal ..." — a pass
 * that sent a team-mate running in behind the defence, clean through on goal. It shows the lesson exactly.
 *
 * SOURCES (fetched Sept 2026 with a generic UA, cached under the session scratchpad films/src-cache/):
 *  - BBC Sport live page + report, "Germany 5–0 Hungary: Germany thrash Hungary in Nations League opener", 7 Sep 2024
 *    https://www.bbc.com/sport/football/live/cy9erxvydwqt   (cache: bbc-germany-hungary-2024.txt): Sat 7 Sep 2024, UEFA Nations League
 *    League A Group 3, Merkur Spiel-Arena, attendance 49,235; goals Füllkrug 27', Musiala 58', Wirtz 66', Pavlović 77', Havertz 81' pen;
 *    assists "J. Musiala (27', 66', 77'), F. Wirtz (58')"; the report sentence quoted above; both line-ups with numbers (Germany: ter Stegen 1,
 *    Kimmich 6, Tah 4, Schlotterbeck 15, Raum 22, Andrich 8, Groß 5, Wirtz 17, Havertz 7, Musiala 10, Füllkrug 9 — Pavlović on for Groß at
 *    60', so after this goal; Hungary, coach Marco Rossi, 3-4-2-1: Gulácsi 1, Dárdai 4, Orbán 6, Balogh 3, Négo 7, Schäfer 13, Nagy 8,
 *    Kerkez 11, Szoboszlai 10, Sallai 20, Varga 19).
 *  - Wikipedia, "Florian Wirtz" (raw, cache: wiki-florian-wirtz.txt): "On 7 September 2024, Wirtz made his UEFA Nations League debut ...
 *    against Hungary, scoring a goal and providing an assist in a 5–0 victory"; his play "quickly find[s] solutions to set up his teammates
 *    ... a good sense of space and the right pass".
 *  - Bundesliga.com, "Bayer Leverkusen beat Werder Bremen to win the Bundesliga!", 14 Apr 2024 (cache: bl-leverkusen-bremen-2024.txt):
 *    checked and rejected as the film's moment — Wirtz's three goals there were assisted by Andrich, Palacios and Grimaldo; he made none.
 *  - also read and not used: BBC Sport, Eintracht Frankfurt 1–5 Liverpool, 22 Oct 2025 (Wirtz's two assists were a square ball and a
 *    lay-off for a long shot, not a pass in behind); Liverpool FC / BBC on Tottenham 1–2 Liverpool, 20 Dec 2025 (the pass is not
 *    described, and the scorer was injured in the act).
 * CONFIRMED by those accounts: the match, date, ground, competition, 1–0 at the time, the goal in the 58th minute; Germany breaking from a
 * HUNGARY CORNER; Wirtz setting up the goal (credited assist); Musiala running through ONE ON ONE FROM HIS OWN HALF and slotting home;
 * the numbers (Wirtz 17, Musiala 10) and every name above; Gulácsi in Hungary's goal.
 * INFERRED (illustrative, and kept OUT of the narration): every exact position, speed and timing; how Germany won the ball (drawn: Tah
 * heads the corner clear, Wirtz controls it about 20 m out, one touch, looks up); the corner coming from Germany's left (the far side on
 * screen) and its taker; Wirtz striking the pass with his RIGHT foot (his stronger foot) as a driven, rising ball ~40 m into space; where
 * Hungary's two covering defenders stood (near halfway — the film uses Dárdai and Balogh) and the pass dropping BEHIND them into
 * Musiala's path; Musiala running down Germany's left-centre channel, carrying it with his right foot and slotting it low across Gulácsi
 * with his right foot; Gulácsi coming out and diving to his left; Hungary's late chaser (Schäfer); the kits — Germany in their white
 * home shirts, black shorts (printed navy) and white socks, Hungary in red shirts, white shorts and red socks (the real socks may have
 * been green), both keepers' colours; an evening kick-off under floodlights; the direction of play on screen (Germany attacking left to
 * right from the main-stand camera, which puts Musiala's run on the FAR side); the arena's shape (a boxy enclosed bowl under a roof ring),
 * the crowd colours (white, black, Hungarian red, phone lights); the ball (a generic white ball, navy and red panels); the celebration.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time, panning with the ball from the corner to
 * the net; ch2 = the slow-motion replay from a raised camera behind Wirtz's right shoulder: Musiala runs BEHIND the defenders (a dashed
 * line marks their line), NOT to his feet (a red ring, crossed out) but into his path (a yellow target, the ball's lane); ch3 = a second
 * replay angle from BEHIND HUNGARY'S GOAL: Musiala never slows, one on one with Gulácsi, the finish; ch4 = the lesson over Wirtz's
 * shoulder (look for the run behind the defenders, pass into their path). All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Full-sheet card-window framing (1.45:1 to square),
 * never sheet.safe. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,header,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The pass, live',text:'Germany against Hungary. A Hungary corner... Germany win the ball. Florian Wirtz looks up. Jamal Musiala is already running. Wirtz plays it forward, into his path! Musiala races away, all alone... and slots it home!',seconds:16.8,
  cues:[[.2,'Germany against'],[1.6,'A Hungary corner'],[3.4,'Germany win'],[4.9,'Florian Wirtz'],[5.9,'looks up'],[6.9,'Jamal Musiala'],[7.7,'already running'],[8.9,'Wirtz plays'],[9.8,'into his path'],[11.2,'Musiala races'],[12.5,'all alone'],[14.1,'slots it home']]},
 {label:'Watch it again',text:'Watch again, slowly. Musiala runs behind the defenders. Wirtz does not pass to his feet. He passes into his path, where he is going.',seconds:9.6,
  cues:[[.15,'Watch again'],[.9,'slowly'],[1.6,'Musiala runs'],[2.3,'behind the defenders'],[3.5,'Wirtz does not'],[4.3,'to his feet'],[5.2,'He passes'],[5.9,'into his path'],[6.8,'where he is going']]},
 {label:'One on one',text:'Musiala never slows down. He runs and runs, one on one with the keeper... goal!',seconds:7.6,
  cues:[[.15,'Musiala never'],[1,'slows down'],[1.9,'He runs and runs'],[3.1,'one on one'],[3.9,'with the keeper'],[5.3,'goal']]},
 {label:'Your turn',text:'Your turn: look for the run behind the defenders, and pass into their path.',seconds:7.4,
  cues:[[.15,'Your turn'],[1,'look for the run'],[2.3,'behind the defenders'],[3.6,'and pass'],[4.3,'into their path']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py wirtz-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/wirtz-signature/timing.json'` and pass `timingJson as
 * NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-wirtz-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/wirtz-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('wirtz: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Germany's goal at 0, Germany attack +X, Hungary's goal line at 105),
 * Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z,
 * so Germany's LEFT channel (Musiala's run) is the far side (−Z). */
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

// ---------------------------------------------------------------- the Düsseldorf arena at night: a boxy enclosed bowl, three tiers, a roof ring (inferred shape)
const CX=52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the pitch-side rim (a near-rectangular superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.22),y,(39+d)*Math.sign(s)*Math.pow(Math.abs(s),.22)];}
const LOW=(b:number):[number,number]=>[1+15*b,1.2+9*b],MID=(b:number):[number,number]=>[15+8*b,12.5+5*b],UP=(b:number):[number,number]=>[24+16*b,19.5+14*b];
type Bowl={tiers:V3[][][];band:V3[][];roof:V3[][];lamps:[V3,V3][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={tiers:[[],[],[]],band:[],roof:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.tiers[0].push(Q(LOW));o.tiers[1].push(Q(MID));o.tiers[2].push(Q(UP));
  o.band.push([rim(a,23,17.5),rim(b,23,17.5),rim(b,24,19.5),rim(a,24,19.5)]);
  o.roof.push([rim(a,16,37.5),rim(b,16,37.5),rim(b,48,35),rim(a,48,35)]);
  o.lamps.push([rim(a,16.6,36.9),rim(b,16.6,36.9)]);
  for(const [f,rows,off] of [[LOW,6,0],[MID,3,3000],[UP,6,6000]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+off,13);if(h<.15)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = phones and cameras), the roof and its lamps */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 s.field(K,.74,.5);s.field(B,.24,.5);
 const tiers=[new Path2D(),new Path2D(),new Path2D()],band=new Path2D(),roof=new Path2D();
 for(let i=0;i<NS;i++){for(let j=0;j<3;j++){const q=quadP(c,BOWL.tiers[j][i]);if(q)addPoly(tiers[j],q);}const r3=quadP(c,BOWL.band[i]);if(r3)addPoly(band,r3);const r4=quadP(c,BOWL.roof[i],10);if(r4)addPoly(roof,r4);}
 s.knockout(tiers[0]);s.tone(B,tiers[0],.36);s.tone(K,tiers[0],.3);
 s.knockout(tiers[1]);s.tone(K,tiers[1],.62);
 s.knockout(tiers[2]);s.tone(B,tiers[2],.34);s.tone(K,tiers[2],.44);
 // the crowd: German white and black, Hungarian red, a few phone lights (yellow)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.h<.45?0:q.h<.7?1:q.h<.95?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(K,inks[1],.85);s.fill(R,inks[2],.85);s.fill(Y,inks[3],.95);
 s.knockout(band);s.fill(K,band,.9);
 s.knockout(roof);s.fill(K,roof,.9);
 // the floodlight ring under the roof edge, with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+6||toCam(c,b)[2]<NEAR+6)continue;seg3(c,a,b,.8,lamp);seg3(c,a,b,3.2,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the floodlit grass (yellow × blue) with mowing stripes, boards, paper lines, corner flags and both goals (Hungary's goal drawn later
 * when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-41],[114,0,-41],[114,0,41],[-9,0,41]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.9);s.tone(K,p,.25);}
 const g=polyP(c,[[-5,0,-38],[110,0,-38],[110,0,38],[-5,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]));s.tone(K,st,.12);
 // boards: along the far touchline and behind both goals (navy LED boards with red and paper panels, generic)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])addPoly(bd,q);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]));addPoly(pn,polyP(c,[[-3.45,.25,z],[-3.45,.25,z+3.4],[-3.45,.65,z+3.4],[-3.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(R,pn,.35);
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]];
/** Germany: white home shirts, black shorts (printed navy), white socks — inferred for this home match, numbers navy */
const GER=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,trim:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],numberInk:K,seed:3,...o});
/** Hungary: red shirts, white shorts, red socks — inferred (the change of colour against Germany's white) */
const HUN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,trim:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
const WIRTZ_STYLE=GER({number:17,hair:[R,.45],build:{height:1.77},seed:17});
const MUSIALA_STYLE=GER({number:10,skin:SKIN_M,hair:K,hairStyle:'curly',build:{height:1.84},seed:10});
const TER_STEGEN:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,skin:SKIN_L,hair:[Y,.7],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.87},seed:1};
const GULACSI:AthleteStyle={shirt:[B,.85],shorts:[B,.85],socks:[B,.85],boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:'paper',build:{height:1.91},seed:41};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Wirtz's pass)
type Role='wirtz'|'ger'|'hun'|'gk';
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The beats the accounts give (a Hungary corner, Germany breaking, Wirtz's
 * pass, Musiala's run from his own half, one on one, the finish) are kept; every exact spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Wirtz',role:'wirtz',style:WIRTZ_STYLE,key:true,moves:[],keys:[[-5.4,16.5,8.5],[-3,17.6,6.6],[-2.2,18.4,5.8],[-1.7,19,5.3],[-1.1,19.8,5],[-.55,20.9,4.7],[0,21.7,4.4],[.8,23,4],[2,27,3.2],[4,35,2],[7,47,0],[10,57,-1]]},
 {name:'Musiala',role:'ger',style:MUSIALA_STYLE,key:true,keys:[[-5.4,34.5,-9],[-3,35.8,-9.6],[-1.7,37.4,-10],[-1,40,-10.1],[0,45.2,-9.6],[1,51.6,-8.9],[2,58.6,-8.1],[2.35,61,-7.8],[3,65.6,-7.2],[4,72.8,-6.2],[5,80,-5.2],[6,86.6,-4.2],[6.8,91.4,-3.4],[7.5,94.2,-2.2],[8.5,96.6,.4],[10,98.5,4]]},
 {name:'Tah',role:'ger',style:GER({number:4,seed:44,skin:SKIN_D,hair:K,build:{height:1.95,bulk:1.1}}),key:true,keys:[[-5.4,7.4,1.4],[-3.8,7,1],[-3.1,6.7,.7],[-2.4,7,.9],[-1,9,1.6],[10,26,2]]},
 {name:'ter Stegen',role:'gk',style:TER_STEGEN,keys:[[-5.4,1.2,-.8],[-3,1.5,-.4],[10,6,0]]},
 {name:'Schlotterbeck',role:'ger',style:GER({number:15,seed:15,build:{height:1.91}}),keys:[[-5.4,5,-4],[-3,5.4,-3],[10,24,-3]]},
 {name:'Kimmich',role:'ger',style:GER({number:6,seed:6,hair:[Y,.5]}),keys:[[-5.4,9,-9],[-2,11,-8],[10,40,-2]]},
 {name:'Raum',role:'ger',style:GER({number:22,seed:22}),keys:[[-5.4,6,6],[-2,8,7],[10,34,8]]},
 {name:'Andrich',role:'ger',style:GER({number:8,seed:8,hairStyle:'bald'}),keys:[[-5.4,11,-2.5],[-2,12.5,-2],[10,38,0]]},
 {name:'Groß',role:'ger',style:GER({number:5,seed:5,hair:[K,.6]}),keys:[[-5.4,13.5,3],[-2,15,3],[10,42,4]]},
 {name:'Füllkrug',role:'ger',style:GER({number:9,seed:9,build:{height:1.89,bulk:1.08}}),keys:[[-5.4,8.5,-6],[-2,10,-6],[1,15,-5],[10,58,-3]]},
 {name:'Havertz',role:'ger',style:GER({number:7,seed:7,build:{height:1.93}}),keys:[[-5.4,15,12],[-2,17,13],[0,23,14.5],[3,42,14],[6,64,11],[10,86,6]]},
 {name:'Szoboszlai',role:'hun',style:HUN({number:10,seed:60,hair:[Y,.6],build:{height:1.86}}),key:true,keys:[[-5.4,-1.3,-35.4],[-4.6,-.7,-34.6],[-4.2,.3,-33.7],[-3.6,1.6,-33],[-1,5,-30],[10,26,-20]]},
 {name:'Varga',role:'hun',style:HUN({number:19,seed:61,build:{height:1.9}}),keys:[[-5.4,8.2,-.5],[-3.5,7.3,.1],[-2.9,7.2,.3],[-1,9,.5],[10,30,-2]]},
 {name:'Orbán',role:'hun',style:HUN({number:6,seed:62,build:{height:1.89}}),keys:[[-5.4,9,3],[-2,10,3],[10,33,1]]},
 {name:'Sallai',role:'hun',style:HUN({number:20,seed:63}),keys:[[-5.4,10,-5],[-2,11,-5],[10,36,-5]]},
 {name:'Négo',role:'hun',style:HUN({number:7,seed:64,skin:SKIN_D}),keys:[[-5.4,14,11],[-2,15,11],[10,40,6]]},
 {name:'Kerkez',role:'hun',style:HUN({number:11,seed:65}),keys:[[-5.4,19,-20],[-2,20,-20],[10,46,-16]]},
 {name:'Nagy',role:'hun',style:HUN({number:8,seed:66}),keys:[[-5.4,25,-1],[-2,25.5,0],[10,48,0]]},
 {name:'Schäfer',role:'hun',style:HUN({number:13,seed:67}),key:true,moves:[{kind:'lunge',at:.05,dur:.8,side:'r'}],keys:[[-5.4,24,9],[-2.2,23.8,8.4],[-1.4,23.2,7.1],[-.6,22.8,5.9],[0,22.9,5.2],[.8,23.6,4.8],[3,27,3],[10,44,0]]},
 {name:'Dárdai',role:'hun',style:HUN({number:4,seed:68,build:{height:1.9}}),key:true,keys:[[-5.4,52,-2],[-2,53.5,-2.6],[0,55.2,-3.6],[1,55.8,-4.8],[2.35,58.2,-6],[3,62,-6],[4,68.4,-5],[5,75,-4],[6,81.6,-3],[7,87.6,-2],[8.5,93,0],[10,95,1]]},
 {name:'Balogh',role:'hun',style:HUN({number:3,seed:69}),keys:[[-5.4,50,9],[-2,51.5,8.5],[0,53.2,7.6],[1,54.2,6.4],[2.35,56.8,4],[4,64,1.2],[6,76,-.5],[8,86,0],[10,91,1]]},
 {name:'Gulácsi',role:'gk',style:GULACSI,key:true,moves:[{kind:'dive',at:6.95,dur:.9,side:'l'}],keys:[[-5.4,100.5,0],[1,100,-.8],[3.5,99.8,-1.6],[5.5,98.6,-2.4],[6.5,97.7,-2.8],[10,97.7,-2.8]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const WIR=IX('Wirtz'),MUS=IX('Musiala'),TAH=IX('Tah'),TAKER=IX('Szoboszlai'),CHASE=IX('Schäfer'),GUL=IX('Gulácsi');
const GERS=new Set(ACTORS.map((a,i)=>a.role==='ger'||a.role==='wirtz'||i===IX('ter Stegen')?i:-1));
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-5.4,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(k,tau),y=headingOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}

// ---------------------------------------------------------------- the ball: the corner, Tah's header, Wirtz's control, THE PASS, Musiala's run, the finish
const CORNER_KICK=-4.2,HEAD=-3.05,RECEIVE=-1.7,SET_TOUCH=-.8,PASS=0,MEET=2.35,SHOT=6.8,IN_NET=SHOT+.45;
const CORNER:V3=[.9,.11,-33.1];
const headPt=():V3=>{const[x,z]=posOf(TAH,HEAD);return[x-.1,2.5,z];};
const RP=footSpot(WIR,RECEIVE,'r',.4),SP=footSpot(WIR,SET_TOUCH,'r',.45),PP=footSpot(WIR,PASS,'r',.4);
const MEET_PT=footSpot(MUS,MEET,'r',.45);
/** Musiala's run: sprint strides of SL metres; he knocks the ball on with his right foot every second stride (inferred) */
const SL=3.8;
const TOUCHES:number[]=(()=>{const out:number[]=[MEET];let prev=distOf(MUS,MEET)/SL;let n=0;
 for(let tau=MEET+DT;tau<SHOT-.45;tau+=DT){const ph=distOf(MUS,tau)/SL-.92;if(Math.floor(ph)>Math.floor(prev)){n++;if(n%2===0&&tau-out[out.length-1]>.5)out.push(tau);}prev=ph;}
 return[...out,SHOT];})();
const TP=TOUCHES.map(t=>footSpot(MUS,t,'r'));
const NET:V3=[105.4,.3,1.9],REST:V3=[106.4,.11,1.6];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
function ballAt(tau:number):V3{
 if(tau<CORNER_KICK)return CORNER;
 if(tau<HEAD){const u=(tau-CORNER_KICK)/(HEAD-CORNER_KICK),P=headPt();const b=lerp3(CORNER,P,u);return[b[0],lerp(CORNER[1],P[1],u)+6.4*Math.sin(Math.PI*u)*(1-.3*u),b[2]+1.4*Math.sin(Math.PI*u)];}
 if(tau<RECEIVE){const u=(tau-HEAD)/(RECEIVE-HEAD),P=headPt(),Q:V3=[RP[0],.11,RP[1]];const b=lerp3(P,Q,u);return[b[0],lerp(P[1],.11,u)+5.2*Math.sin(Math.PI*u),b[2]];}
 if(tau<SET_TOUCH)return roll([RP[0],.11,RP[1]],[SP[0],.11,SP[1]],(tau-RECEIVE)/(SET_TOUCH-RECEIVE),.4);
 if(tau<PASS)return roll([SP[0],.11,SP[1]],[PP[0],.11,PP[1]],(tau-SET_TOUCH)/(PASS-SET_TOUCH),.3);
 const P0:V3=[PP[0],.11,PP[1]],M:V3=[MEET_PT[0],.11,MEET_PT[1]];
 if(tau<MEET){const u=(tau-PASS)/(MEET-PASS),b=roll(P0,M,u,.25),fl=clamp(u/.8);return[b[0],.11+2.9*Math.sin(Math.PI*fl)*(1-.25*fl)+(u>.8?.25*Math.sin(Math.PI*(u-.8)/.2):0),b[2]];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const S:V3=[TP[TP.length-1][0],.11,TP[TP.length-1][1]];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(S[0],NET[0],u),.11+(NET[1]-.11)*u+.1*Math.sin(Math.PI*u),lerp(S[2],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return lerp3(NET,REST,e);
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** Wirtz cushions the dropping ball: right foot raised, toe up, arms out for balance */
const CUSHION:Partial<Pose>={rHipF:40,rKnee:40,rAnk:-18,rHipR:18,lKnee:30,lShA:48,rShA:40,lElb:30,rElb:36,neckP:34,lean:16};
/** Wirtz looks up before the pass (head lifted and turned to his left, toward Musiala, chest open) */
const LOOK_UP:Partial<Pose>={neckP:-10,neckY:26,twist:8};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='hun'&&tau<HEAD?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),inWin(u));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:.1});}}
 if(k===GUL){if(tau<6.95-.5)yaw=yawOf(b[0]-x,b[2]-z);else yaw=Math.PI;}
 if(a.role==='gk'&&k!==GUL)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===TAKER){const D=1,u=(tau-(CORNER_KICK-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.7}),inWin(u));if(tau<CORNER_KICK+.2)yaw=lerpA(yaw,yawOf(4-x,1-z),.6);}
 if(k===TAH){const D=.8,u=(tau-(HEAD-.52*D))/D;if(u>0&&u<1.3){p=blendPose(p,header(Math.min(1,u)),inWin(u));yaw=lerpA(yaw,yawOf(RP[0]-x,RP[1]-z),.8*inWin(u));}}
 if(k===WIR){
  if(tau<RECEIVE-.2&&sp<2)yaw=yawOf(b[0]-x,b[2]-z);
  p=over(p,CUSHION,bump(RECEIVE-.45,RECEIVE+.25,tau));
  p=over(p,{rHipF:34,rKnee:26,rAnk:34,rHipR:10},bump(SET_TOUCH-.16,SET_TOUCH+.1,tau));
  p=over(p,LOOK_UP,bump(-1.35,PASS-.1,tau)*.9);
  const D=.85,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.7}),inWin(u));yaw=lerpA(yaw,yawOf(MEET_PT[0]-x,MEET_PT[1]-z),.6*inWin(u));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.4,IN_NET+.9,tau));}
 if(k===MUS){
  for(let i=1;i<TOUCHES.length-1;i++)p=over(p,{rHipF:34,rKnee:26,rAnk:34,rHipR:10},bump(TOUCHES[i]-.16,TOUCHES[i]+.1,tau));
  const D=.8,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),inWin(u));yaw=lerpA(yaw,yawOf(NET[0]-x,NET[2]-z),.8*inWin(u));}
  if(tau>IN_NET+.5)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.5,IN_NET+1,tau));}
 if(k===CHASE&&tau<.8)yaw=lerpA(yaw,yawOf(posOf(WIR,tau)[0]-x,posOf(WIR,tau)[1]-z),.8);
 if(GERS.has(k)&&k!==WIR&&k!==MUS&&a.role!=='gk'&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='hun'&&tau>IN_NET+.8)p=over(p,{lean:40,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.8,IN_NET+1.6,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a generic white match ball (paper, navy and red panels)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D(),pr2=new Path2D();for(let i=0;i<6;i++){const a=rot+i/6*TAU+(i%2)*.3,d=r*(i%2?.62:.3),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d,w=r*.22;(i%3===0?pr2:pan).addPath(polyPath([[cx-w,cy-w*.5],[cx+w*.4,cy-w*.8],[cx+w,cy+w*.3],[cx-w*.2,cy+w*.8]],true));}
 s.fill(K,pan,.9);s.fill(R,pr2,.9);s.restore();
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
/** the defenders' line: a dashed navy stripe painted across the grass through Hungary's two covering defenders at τ, drawn in with w */
function defLine(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;const a=posOf(IX('Dárdai'),tau),b=posOf(IX('Balogh'),tau),x=(a[0]+b[0])/2,z0=-22,z1=20,zc=lerp(z0,z1,.5),hw=(z1-z0)/2*w;
 const p=new Path2D();for(let i=0;i<9;i++){const u0=i/9,u1=u0+.6/9,za=zc-hw+2*hw*u0,zb=zc-hw+2*hw*u1;seg3(c,[x,.02,za],[x,.02,zb],.34,p,2.5);}
 s.knockout(p,.85*w);s.fill(K,p,.9*w);}
/** a runner's path from τa to τb as ground points */
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(ta,tb,i/n)));return o;};
/** the pass lane: from Wirtz's boot to the meeting spot */
const passPts=(n=12):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const u=i/n;o.push([lerp(PP[0],MEET_PT[0],u),lerp(PP[1],MEET_PT[1],u)]);}return o;};
/** "look up": a dashed yellow sight line from his eyes to a point */
function sightLine(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number){if(!r||!to||w<=.02)return;const h=r.joints.head,u=Math.max(4,Math.hypot(h[0]-r.joints.neck[0],h[1]-r.joints.neck[1])*.35);
 const end:Pt=[lerp(h[0],to[0],w),lerp(h[1],to[1],w)];s.knockout(ribbon([h,end],u*1.8,{seed:91,taper:.2,wobble:.6}),.7);laneArrow(s,Y,h,end,u,{dashed:true,seed:92,head:u*3});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the corner, the clearance and the run play at ~1–1.4× real time) */
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'slots');return key(t,mono([[0,-5.3],[CUEW(0,'A Hungary corner'),CORNER_KICK-.35],[CUEW(0,'Germany win'),HEAD+.1],[CUEW(0,'Florian Wirtz'),RECEIVE-.1],[CUEW(0,'looks up'),-1.05],[CUEW(0,'Jamal Musiala'),-.65],[CUEW(0,'already running'),-.35],[CUEW(0,'Wirtz plays'),-.05],[CUEW(0,'into his path'),1.1],[CUEW(0,'Musiala races'),MEET+.35],[CUEW(0,'all alone'),4.3],[G,SHOT],[G+.8,IN_NET+.1],[S+1,IN_NET+.1+(S+1-G-.8)*.85]]),linear);};
const CAM1:V3=[52.5,27,74];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'slots'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the pre-roll frames the corner and the box; then the camera rides the ball (leading it along the pass and Musiala's run)
 const lead=sm(-.3,1.2,tau)*(1-sm(5.6,6.8,tau))*3,cel=posOf(MUS,tau),toC=sm(G+1.1,G+2.2,t,easeInOutSine);
 const T0:V3=[lerp(5,bt[0],sm(-5.3,-4.2,tau))+lead,0,lerp(-10,bt[2]*.7,sm(-5.3,-3.6,tau))],T=lerp3(T0,[cel[0]-1,1.2,cel[1]],toC);
 const F=key(t,[[0,4600],[CUEW(0,'Germany win'),5600],[CUEW(0,'looks up'),6200],[CUEW(0,'Wirtz plays'),5300],[CUEW(0,'Musiala races'),5900],[G,6500],[G+1.6,7400],[S,7600]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'slots')+.8;
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,hero:tau<PASS+.5?WIR:MUS});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(MUS,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, raised behind Wirtz's right shoulder: behind the defenders — not to the feet, into the path
const tau2=(t:number)=>key(t,mono([[0,-1.7],[CUEW(1,'Musiala runs'),-1.15],[CUEW(1,'behind'),-.8],[CUEW(1,'Wirtz does not'),-.4],[CUEW(1,'to his feet'),-.2],[CUEW(1,'He passes'),-.05],[CUEW(1,'into his path'),PASS+.2],[CUEW(1,'where'),1.1],[SECS(1),MEET+.2]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(WIR,Math.min(tau,.4)),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUEW(1,'He passes')-.4,CUEW(1,'into his path')+.6,t,easeInOutSine);
 const aim=.34+.16*wide,tx=lerp(m[0],MEET_PT[0],aim),tz=lerp(m[1],MEET_PT[1],aim);
 const C:V3=[m[0]-12-2*wide+3*open,6+2*wide,m[1]+7+1.5*wide],T:V3=[tx,.3,tz];
 return look(C,T,2600-450*wide-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),mr=CUEW(1,'Musiala runs'),bd=CUEW(1,'behind'),tf=CUEW(1,'to his feet'),hp=CUEW(1,'He passes'),ip=CUEW(1,'into his path'),wh=CUEW(1,'where'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const out=1-sm(E-.9,E-.5,t);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:WIR,under:()=>{
   // "behind the defenders": their line, dashed across the grass; Musiala's run (blue) crossing it
   defLine(s,c,Math.min(tau,0),sm(bd-.2,bd+.5,t,easeOut)*out);
   groundArrow(s,c,runPts(MUS,-1.2,MEET),sm(mr-.1,bd+.6,t,easeOut)*out,B,63);
   // "to his feet": a red ring where he is now — and a cross: not there
   const fw=sm(tf-.15,tf+.25,t,easeOutBack)*out,[mx,mz]=posOf(MUS,Math.min(tau,-.2));
   ring(s,c,mx,mz,1.1,fw,R,44);crossOut(s,c,mx,mz,1.05,sm(tf+.35,tf+.65,t,easeOut)*out);
   // "into his path": the yellow target ahead of him and the ball's lane to it
   ring(s,c,MEET_PT[0],MEET_PT[1],1.6,sm(ip-.2,ip+.25,t,easeOutBack)*out,Y,45);
   groundArrow(s,c,passPts(),sm(hp,wh+.2,t,easeOut)*out,Y,65);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · second replay angle from behind Hungary's goal: never slows, one on one, the finish
const tau3=(t:number)=>{const g=CUEW(2,'goal');return key(t,mono([[0,MEET-.5],[CUEW(2,'slows down'),MEET+.25],[CUEW(2,'He runs'),3.4],[CUEW(2,'one on one'),5.3],[CUEW(2,'with the keeper'),6.2],[g,IN_NET+.05],[SECS(2),IN_NET+.05+(SECS(2)-g)*.85]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),g=CUEW(2,'goal'),turn=sm(g+.3,SECS(2)-.3,t,easeInOutSine),mu=smooth(MUS,tau);
 const C0:V3=[113.5,4.8,5.5],T0:V3=[lerp(mu[0],99,.35),.9,lerp(mu[1],-1,.35)];
 const C1:V3=[mu[0]+7,2.4,mu[1]+8],T1:V3=[mu[0]-1,1.1,mu[1]-1];
 return look(lerp3(C0,C1,turn),lerp3(T0,T1,turn),lerp(2300+900*sm(MEET,SHOT,tau),3200,turn));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),g=CUEW(2,'goal'),turn=sm(g+.3,SECS(2)-.3,t,easeInOutSine),oo=CUEW(2,'one on one'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(g-.1,g+.3,t)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{goalLater:turn<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:MUS,under:()=>{
   // "never slows down": his run arrow onto the ball; "one on one": a yellow ring at Musiala, a red one at the keeper
   groundArrow(s,c,runPts(MUS,MEET,4.4),sm(.1,CUEW(2,'slows down')+.4,t,easeOut)*(1-sm(CUEW(2,'He runs')+.4,CUEW(2,'He runs')+.8,t)),B,66);
   const ow=sm(oo-.1,oo+.3,t,easeOutBack)*(1-sm(g-.4,g-.1,t)),[mx,mz]=posOf(MUS,Math.min(tau,SHOT-.2)),[kx,kz]=posOf(GUL,Math.min(tau,SHOT-.2));
   ring(s,c,mx,mz,1.2,ow,Y,47);ring(s,c,kx,kz,1.2,ow,R,48);}});
  if(turn<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(MUS,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: over Wirtz's shoulder — look for the run behind the defenders, pass into their path
const tau4=(t:number)=>key(t,mono([[0,-1.3],[CUEW(3,'look for'),-1],[CUEW(3,'behind'),-.55],[CUEW(3,'and pass'),-.05],[CUEW(3,'into their path'),PASS+.35],[SECS(3),MEET+.35]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(WIR,Math.min(tau,.3)),push=sm(0,1.2,t,easeInOutSine),follow=sm(CUEW(3,'into their')-.3,SECS(3)-.3,t,easeInOutSine),mp=smooth(MUS,tau);
 const C:V3=[m[0]-7-1.5*(1-push),4.6+1*follow,m[1]+5.4+1.5*(1-push)],T0:V3=[lerp(m[0],MEET_PT[0],.4),.4,lerp(m[1],MEET_PT[1],.4)],T1:V3=[lerp(m[0],mp[0],.6),.5,lerp(m[1],mp[1],.6)];
 return look(C,lerp3(T0,T1,follow),2250+250*push-350*follow);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),lf=CUEW(3,'look for'),bd=CUEW(3,'behind'),ap=CUEW(3,'and pass'),ip=CUEW(3,'into their path'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const out=1-sm(E-.9,E-.5,t);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:WIR,under:()=>{
   groundArrow(s,c,runPts(MUS,-1.3,MEET),sm(lf,lf+.9,t,easeOut)*out,B,67);
   defLine(s,c,Math.min(tau,0),sm(bd-.2,bd+.5,t,easeOut)*out);
   groundArrow(s,c,passPts(),sm(ap,ip+.3,t,easeOut)*out,Y,69);
   ring(s,c,MEET_PT[0],MEET_PT[1],1.6,sm(ip-.2,ip+.25,t,easeOutBack)*out,Y,49);},
   after:({joints})=>{
    // "look for the run": a sight line from his eyes to Musiala
    const r=joints.get(WIR),[mx,mz]=posOf(MUS,tau);sightLine(s,r,pr(c,[mx,1.6,mz]),sm(lf+.2,lf+.8,t,easeOut)*(1-sm(ap-.1,ap+.3,t)));
    // ball and runner meet in his path — a yellow spark at Musiala's boot
    const age=tau-MEET;if(age>-.2&&age<.5){const q=pr(c,[MEET_PT[0],.15,MEET_PT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[MEET_PT[0],0,MEET_PT[1]])*.7,{n:8,seed:93,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.3)/.2)),width:9});}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'wirtz-signature',format:'11v11',title:"Wirtz's Killer Pass",theme:'Look for the run behind the defenders and pass into their path',
 ageNote:'UEFA Nations League, Germany 5–0 Hungary, Düsseldorf, 7 September 2024 (the 58th minute). For players of every age.',
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
