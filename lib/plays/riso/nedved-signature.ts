/** Pavel Nedvěd — signature: the two-footed long shot. Juventus 3–1 Real Madrid, UEFA Champions League semi-final second leg, Stadio
 * delle Alpi, Turin, Wednesday 14 May 2003 (an evening kick-off under floodlights; Juventus through 4–3 on aggregate): Nedvěd's goal for
 * 3–0 (72nd minute in the Guardian's minute-by-minute, 73' on the ESPN / UEFA score lines). An iconic-play riso film (RisoStory, chapters
 * mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "the two-footed long shot", lesson "Work on your weaker foot so you
 * can shoot as soon as you get space"): it is the best-documented goal of his Ballon d'Or year, the night UEFA headlined "Madrid fall to
 * brilliant Nedved". The Guardian's live report shows the trait all evening — a long-range shot teed up by Davids (5'), another "from
 * distance" over the bar (53') — and then the goal: through on Zambrotta's pass from halfway, he "sprints between the static Real centre
 * back pairing and buries the ball past Casillas". No hesitation, no set-up: he got a yard of space and shot. The film is built around that.
 *
 * SOURCES (fetched Sept 2026 with a generic UA, cached under the session scratchpad films/src-cache/):
 *  - The Guardian, minute-by-minute, "Juventus 3 - 1 Real Madrid (Agg: 4-3)", 14 May 2003: "72 mins GOAL: Juventus 3 - 0 Real Madrid (Agg:
 *    4-2) Pavel Nedved latches on to a fantastic Zambrotta pass from the half-way line, sprints between the static Real centre back pairing
 *    and buries the ball past Casillas in the Real Madrid goal"; Nedvěd's long-range efforts at 5' and 53'; Trezeguet 11', Del Piero 42',
 *    Figo's penalty saved by Buffon, Nedvěd's late booking that cost him the final, Zidane 88'; the names on the pitch (Hierro, Helguera,
 *    Salgado, Roberto Carlos, Cambiasso, Guti, Figo, Zidane, Raúl, Ronaldo on for Conceição at 51'; Birindelli off for Pessotto at 59';
 *    McManaman and Camoranesi on only after the goal); Zambrotta "switched from the right flank to the left" late on (so right flank at 72')
 *    https://www.theguardian.com/football/2003/may/14/minutebyminute.sport   (cache: guardian-juv-rma-2003-mbm.txt)
 *  - Los Angeles Times, "Juventus Stuns Real Madrid, 3-1", 15 May 2003: Turin, 3–1, 4–3 on aggregate, Trezeguet and Nedvěd scored, Del
 *    Piero one goal and one assist, 3–0 through 88 minutes, Nedvěd's second yellow of the competition keeping him out of the final
 *    https://www.latimes.com/archives/la-xpm-2003-may-15-sp-soccer15-story.html   (cache: latimes-juv-rma-2003.txt)
 *  - ESPN match page 97885 (14 May 2003): scorers Trezeguet 12', Del Piero 42', Nedvěd 73', Zidane 89'   (cache: espn-juv-rma-2003.html)
 *  - Match listing (Dailymotion description, via search snippet): Stadio delle Alpi, Wednesday 14 May 2003; Juventus: Buffon, Thuram,
 *    Tudor, Montero, Birindelli (Pessotto 60), Zambrotta, Tacchinardi, Davids, Nedvěd, Trezeguet (Camoranesi 76), Del Piero; radio-commentary
 *    note: "a warm evening, pitch in good condition, 67,000 spectators"   (cache: ddg-nedved-madrid-2003.html)
 *  - Wikipedia, "Pavel Nedvěd" (raw): wide left midfielder; "crossing ability with his left foot and his ability to cut inside and shoot with
 *    his right foot" (a two-footed player); "powerful and accurate strikes", "explosive pace", "trademark long blonde hair"; suspended for
 *    the 2003 final   (cache: wiki-pavel-nedved.txt)
 * CONFIRMED by those accounts: the match, date, ground, evening kick-off, the score 2–0 on the night before the goal and 3–0 after it;
 * Zambrotta's pass from the halfway line; Nedvěd running between the two Real centre-backs, who were "static"; the finish past Casillas;
 * the 22 players on the pitch at that moment; Nedvěd's long blond hair; that he shot from distance twice earlier that night; that he could
 * use both feet (left-foot crosses, right-foot shots).
 * INFERRED (illustrative, and kept OUT of the narration): every exact position, speed and timing; the kits (Juventus in their home black-
 * and-white stripes with white shorts and socks; Real Madrid in all white — not verified for that night); the shirt numbers (Nedvěd 11,
 * Zambrotta 19, Casillas 1 — general knowledge); the goalkeepers' kits; Zambrotta carrying the ball up to halfway on the near (right)
 * side and passing with his RIGHT foot; the ball lofted over midfield and bouncing between the centre-backs; which centre-back stood where
 * (Hierro to Nedvěd's left, Helguera to his right); Nedvěd arriving from the left and taking ONE touch; the shot with his LEFT foot (his
 * weaker foot — the source does not name the foot) from the edge of the box into the corner to Casillas's right; Casillas's late dive;
 * the direction of play on screen (Juventus attacking left to right from the main-stand camera); the delle Alpi's shape (a wide oval
 * bowl beyond an athletics track under a ring roof, drawn generically), the crowd colours; the ball (drawn as a paper ball with navy stars,
 * after the Champions League star-ball); the celebration.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time, panning with Zambrotta's pass and Nedvěd's
 * run to the net; ch2 = the slow-motion replay from a raised camera behind Nedvěd's left shoulder: the gap between the two centre-backs
 * (a yellow ring), his run through it (blue), no slowing down, and the yellow spot where he shoots at once; ch3 = a second replay angle from
 * BEHIND THE GOAL: the defenders closing (red arrows) a moment too late, the strike, the net; ch4 = the lesson, low beside him as he
 * shoots: both boots ringed (either foot), the weaker one pulsing, the ring of space, the shot. All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Full-sheet card-window framing (1.45:1 to square), never
 * sheet.safe. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random
 * value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'Live in Turin',text:'Juventus lead Real Madrid in the 2003 Champions League semi-final. Zambrotta looks up from halfway: a long pass... Pavel Nedved sprints between the two centre-backs... and buries it past Casillas! Three nil!',seconds:15.5,
  cues:[[.2,'Juventus lead'],[1.1,'Real Madrid'],[2.5,'Champions League'],[4.3,'Zambrotta looks up'],[5.4,'from halfway'],[6.4,'a long pass'],[7.9,'Pavel Nedved sprints'],[9.1,'between the two'],[10.9,'and buries it'],[11.8,'past Casillas'],[13,'Three nil']]},
 {label:'Watch it again',text:"Watch again, slowly. Nedved finds the gap between the defenders. He doesn't slow down. He doesn't wait. He shoots!",seconds:8.4,
  cues:[[.15,'Watch again'],[.9,'slowly'],[1.6,'Nedved finds'],[2.4,'the gap'],[3.9,"He doesn't slow"],[5.1,"He doesn't wait"],[6.3,'He shoots']]},
 {label:'From behind the goal',text:'From behind the goal: he hits it hard, before the defenders can close him down. Goal!',seconds:7.4,
  cues:[[.15,'From behind'],[1.3,'he hits it hard'],[2.7,'before the defenders'],[4,'close him down'],[5.3,'Goal']]},
 {label:'Your turn',text:'Nedved could shoot with either foot. Your turn: practise with your weaker foot, so you can shoot as soon as you get space.',seconds:9.6,
  cues:[[.15,'Nedved could'],[1.2,'either foot'],[2.3,'Your turn'],[3.1,'practise with'],[3.9,'your weaker foot'],[5.1,'so you can shoot'],[6.2,'as soon as'],[7,'you get space']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py nedved-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/nedved-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-nedved-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/nedved-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('nedved: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Juventus's goal at 0, Juventus attack +X, Real's goal line at 105),
 * Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z,
 * so Juventus's right flank (Zambrotta) is the near side and Nedvěd, wide left, starts on the far side. */
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

// ---------------------------------------------------------------- the Stadio delle Alpi at night: a wide oval bowl beyond a running track, under a ring roof
const CX=52.5,NS=60;
/** a point on the bowl: angle th round the pitch centre, d metres out from the stand's front rim (an oval pushed out by the track), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(70+d)*Math.sign(c)*Math.pow(Math.abs(c),.55),y,(50+d)*Math.sign(s)*Math.pow(Math.abs(s),.55)];}
const LOW=(b:number):[number,number]=>[1+22*b,1.4+11*b],UP=(b:number):[number,number]=>[25+20*b,15+15*b];
type Bowl={low:V3[][];up:V3[][];band:V3[][];roof:V3[][];lamps:[V3,V3][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],band:[],roof:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW));o.up.push(Q(UP));
  o.band.push([rim(a,23,12.4),rim(b,23,12.4),rim(b,25,15),rim(a,25,15)]);
  o.roof.push([rim(a,16,37),rim(b,16,37),rim(b,52,35),rim(a,52,35)]);
  o.lamps.push([rim(a,16.6,36.4),rim(b,16.6,36.4)]);
  for(const [f,rows,off] of [[LOW,8,0],[UP,7,5000]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+off,13);if(h<.14)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = camera flashes), the roof and its lamps */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 s.field(K,.74,.5);s.field(B,.24,.5);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D();
 for(let i=0;i<NS;i++){const r1=quadP(c,BOWL.low[i]);if(r1)addPoly(low,r1);const r2=quadP(c,BOWL.up[i]);if(r2)addPoly(up,r2);const r3=quadP(c,BOWL.band[i]);if(r3)addPoly(band,r3);const r4=quadP(c,BOWL.roof[i],10);if(r4)addPoly(roof,r4);}
 s.knockout(low);s.tone(B,low,.34);s.tone(K,low,.34);
 s.knockout(up);s.tone(B,up,.3);s.tone(K,up,.46);
 // the crowd: black-and-white Juventus shirts and scarves, white, a few camera flashes (yellow)
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<16)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  const ink=q.h<.52?0:q.h<.96?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.fill(K,inks[0],.9);s.knockout(inks[1],.72);s.fill(Y,inks[2],.95);
 s.knockout(band);s.fill(K,band,.85);
 s.knockout(roof);s.tone(B,roof,.45);s.fill(K,roof,.7);
 // the floodlight strip under the roof's inner edge, with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+6||toCam(c,b)[2]<NEAR+6)continue;seg3(c,a,b,.8,lamp);seg3(c,a,b,3.2,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),T12=Math.floor(tt*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<16)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+13*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the running track round the pitch (a dark neutral band, colour not asserted), the floodlit grass with mowing stripes, boards, paper
 * lines, corner flags and both goals (the Real goal drawn later when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const trk=polyP(c,[[-16,0,-47],[121,0,-47],[121,0,47],[-16,0,47]]);if(trk.length>2){const p=polyPath(trk,true);s.knockout(p);s.tone(K,p,.5);s.tone(R,p,.22);s.tone(B,p,.2);}
 const sur=polyP(c,[[-8,0,-40],[113,0,-40],[113,0,40],[-8,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.9);s.tone(K,p,.25);}
 const g=polyP(c,[[-5,0,-37.5],[110,0,-37.5],[110,0,37.5],[-5,0,37.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37.5],[(k+1)*5.25,0,-37.5],[(k+1)*5.25,0,37.5],[k*5.25,0,37.5]]));s.tone(K,st,.12);
 // boards: along the far touchline and behind both goals (generic navy boards with blue and paper panels)
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.34]];
/** Juventus: black-and-white stripes (the black printed navy), white shorts and socks (the home kit; inferred for the night) */
const JUV=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,pattern:'stripes',patternInk:'paper',shorts:'paper',socks:'paper',boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:3,...o});
/** Real Madrid: all white (inferred for the night) with navy trim and numbers */
const RMA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:[K,.85],skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:K,shade:[K,.26],seed:5,...o});
/** Nedvěd: the long blond hair (confirmed), number 11 */
const NED_STYLE=JUV({number:11,hair:[Y,.95],hairStyle:'long',build:{height:1.77,bulk:1},seed:11});
const CASILLAS:AthleteStyle={shirt:[B,.8],shorts:[K,.85],socks:[B,.8],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:'paper',build:{height:1.85},seed:1};
const BUFFON:AthleteStyle={shirt:[K,.55],shorts:[K,.7],socks:[K,.55],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:Y,build:{height:1.91},seed:41};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Zambrotta's pass)
type Role='ned'|'juv'|'rma'|'gk';
type Move={kind:'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The beats the account gives (Zambrotta's pass from halfway, Nedvěd sprinting
 * between the two static centre-backs, the finish past Casillas) are kept; every exact spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Nedved',role:'ned',style:NED_STYLE,key:true,keys:[[-6.5,55,-17],[-4,58,-16],[-2,61.5,-14.5],[-1,64.8,-12.8],[0,70,-10],[1,77.5,-6.2],[1.95,84.3,-2.6],[2.5,87.9,-1.3],[3.1,91.2,-.3],[4,94.5,2.5],[5.5,97.5,7],[8,99,11]]},
 {name:'Zambrotta',role:'juv',style:JUV({number:19,seed:19,build:{height:1.81}}),key:true,keys:[[-6.5,40.5,22],[-4,45.2,19.8],[-2,49.8,17.6],[-1,52.3,16.3],[0,54.2,15.3],[.8,56.4,14.8],[2.5,61,13.6],[5,67,12],[8,72,11]]},
 {name:'Del Piero',role:'juv',style:JUV({number:10,seed:10,build:{height:1.74}}),keys:[[-6.5,66,12],[-3,69,10.5],[0,73,8.4],[2,80,6.5],[3.2,85,5],[5,92,4],[8,96,6]]},
 {name:'Trezeguet',role:'juv',style:JUV({number:17,seed:17,skin:SKIN_M,build:{height:1.9}}),keys:[[-6.5,73,5],[-3,75,5.5],[0,77,6.5],[2,84,6.5],[3.2,90,4.5],[5,95,4],[8,97,6]]},
 {name:'Davids',role:'juv',style:JUV({seed:26,skin:SKIN_D,hairStyle:'long',build:{height:1.69,bulk:1.08}}),keys:[[-6.5,46,-5],[-3,48,-5],[0,51,-4.5],[3,57,-4],[8,62,-3]]},
 {name:'Tacchinardi',role:'juv',style:JUV({seed:20}),keys:[[-6.5,40,6],[-3,43,6],[0,46,5.5],[3,51,4.5],[8,55,4]]},
 {name:'Pessotto',role:'juv',style:JUV({seed:7}),keys:[[-6.5,36,-24],[-3,39,-23.5],[0,42,-23],[3,47,-21],[8,52,-20]]},
 {name:'Thuram',role:'juv',style:JUV({seed:21,skin:SKIN_D,hairStyle:'bald',build:{height:1.85}}),keys:[[-6.5,32,21],[0,36,19],[8,42,17]]},
 {name:'Tudor',role:'juv',style:JUV({seed:15,build:{height:1.93}}),keys:[[-6.5,27,5],[0,30,5],[8,36,5]]},
 {name:'Montero',role:'juv',style:JUV({seed:4,skin:SKIN_M}),keys:[[-6.5,27,-6],[0,30,-6],[8,36,-5]]},
 {name:'Buffon',role:'gk',style:BUFFON,keys:[[-6.5,8,0],[0,10,0],[8,12,0]]},
 {name:'Hierro',role:'rma',style:RMA({number:4,seed:44,build:{height:1.87}}),key:true,keys:[[-6.5,76,-9],[-3,78.5,-9.4],[0,79.8,-9.6],[1.3,80.6,-9.3],[2,82,-8],[2.6,84.6,-6.4],[4,88,-4],[8,92,0]]},
 {name:'Helguera',role:'rma',style:RMA({number:6,seed:46,build:{height:1.85}}),key:true,keys:[[-6.5,76,4],[-3,78.5,3.6],[0,79.8,3.2],[1.3,80.4,2.8],[2,82.4,1.2],[2.6,85.2,.3],[4,89,1],[8,93,3]]},
 {name:'Salgado',role:'rma',style:RMA({number:2,seed:42}),key:true,keys:[[-6.5,72,-20],[-3,75,-19.5],[0,77,-18.5],[1.5,80,-15.5],[2.6,84.6,-11.4],[4,89,-7],[8,93,-4]]},
 {name:'Roberto Carlos',role:'rma',style:RMA({number:3,seed:43,skin:SKIN_D,hairStyle:'bald',build:{height:1.68,bulk:1.1,thighs:1.16}}),keys:[[-6.5,52,24],[-4,51,22.6],[-2,53,20.2],[0,56.5,18.6],[1,60,17.2],[3,68,14],[8,78,10]]},
 {name:'Cambiasso',role:'rma',style:RMA({seed:19,hairStyle:'bald'}),keys:[[-6.5,62,-3],[-3,63,-4.5],[0,64,-5.6],[1.5,67,-6.2],[3,72,-5],[8,80,-3]]},
 {name:'Guti',role:'rma',style:RMA({seed:14,hair:[Y,.8],hairStyle:'long'}),keys:[[-6.5,58,7],[-3,58.5,8.5],[0,59,9],[2,62,7.5],[8,70,5]]},
 {name:'Zidane',role:'rma',style:RMA({number:5,seed:55,hairStyle:'balding',build:{height:1.85}}),keys:[[-6.5,50,2],[-3,51,3.5],[0,52,4.5],[3,56,4],[8,62,3]]},
 {name:'Figo',role:'rma',style:RMA({number:10,seed:50}),keys:[[-6.5,48,-24],[-3,49,-22],[0,50.5,-20.5],[3,55,-17],[8,62,-14]]},
 {name:'Raul',role:'rma',style:RMA({number:7,seed:57}),keys:[[-6.5,43,-4],[-3,44,-3.5],[0,46,-3],[3,49,-2],[8,54,-1]]},
 {name:'Ronaldo',role:'rma',style:RMA({number:11,seed:59,skin:SKIN_M,hairStyle:'bald',build:{height:1.83,bulk:1.12}}),keys:[[-6.5,40,8],[-3,41,8.3],[0,42.5,8.5],[3,45,8],[8,48,7]]},
 {name:'Casillas',role:'gk',style:CASILLAS,key:true,moves:[{kind:'dive',at:2.86,dur:.9,side:'r'}],keys:[[-6.5,101,2],[0,101.4,.6],[1.9,102,-.2],[2.45,102.4,-.5],[3,102.4,-.6],[8,102.4,-.6]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const NED=IX('Nedved'),ZAM=IX('Zambrotta'),HIE=IX('Hierro'),HEL=IX('Helguera'),SAL=IX('Salgado'),CAS=IX('Casillas');
const JUVS=new Set(ACTORS.map((a,i)=>a.role==='juv'||a.role==='ned'?i:-1));
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6.5,T1=8,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot */
function footSpot(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(k,tau),y=headingOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}

// ---------------------------------------------------------------- the ball: Zambrotta's carry, THE PASS over midfield, the bounce, Nedvěd's touch, THE SHOT
const PASS=0,BOUNCE=1.2,MEET=1.95,SHOT=2.5,IN_NET=SHOT+.42;
/** Zambrotta's carry up to halfway: touches with his right foot (inferred) */
const TOUCHES=[-6.3,-5.1,-3.9,-2.8,-1.8,PASS];
const TP=TOUCHES.map(t=>footSpot(ZAM,t,'r'));
const MEET_PT=footSpot(NED,MEET,'l',.5);
const SHOT_PT=footSpot(NED,SHOT,'l',.42);
/** where the pass bounces: most of the way to the meeting spot, between the two centre-backs */
const BOUNCE_PT:Pt=[lerp(TP[TP.length-1][0],MEET_PT[0],.8),lerp(TP[TP.length-1][1],MEET_PT[1],.8)];
const NET:V3=[105.35,.42,-2.7],REST:V3=[106.5,.11,-2.3];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
function ballAt(tau:number):V3{
 if(tau<PASS){const t=Math.max(tau,TOUCHES[0]);let k=0;while(k+1<TOUCHES.length&&t>=TOUCHES[k+1])k++;const u=(t-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const P0:V3=[TP[TP.length-1][0],.11,TP[TP.length-1][1]],Bp:V3=[BOUNCE_PT[0],.11,BOUNCE_PT[1]],M:V3=[MEET_PT[0],.11,MEET_PT[1]],S:V3=[SHOT_PT[0],.11,SHOT_PT[1]];
 if(tau<BOUNCE){const u=(tau-PASS)/(BOUNCE-PASS),b=lerp3(P0,Bp,u*(1.12-.12*u));return[b[0],.11+2.3*4*u*(1-u),b[2]];}
 if(tau<MEET){const u=(tau-BOUNCE)/(MEET-BOUNCE),b=roll(Bp,M,u,.25);return[b[0],.11+.45*Math.sin(Math.PI*Math.min(1,u*1.6))*(1-u),b[2]];}
 if(tau<SHOT)return roll(M,S,(tau-MEET)/(SHOT-MEET),.3);
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(S[0],NET[0],u),.11+(NET[1]-.11)*u+.22*Math.sin(Math.PI*u),lerp(S[2],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return lerp3(NET,REST,e);
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** Zambrotta looks up before the pass (head lifted, chest open toward the far side) */
const LOOK_UP:Partial<Pose>={neckP:-10,neckY:24,twist:8};
/** the defenders caught flat: weight back, arms out, heads turning after the runner */
const CAUGHT:Partial<Pose>={lean:-4,pitch:-4,lShA:34,rShA:34,lElb:30,rElb:30,neckY:30};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='rma'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='rma'&&sp<3.5&&tau<SHOT)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.7);
 for(const mv of a.moves??[]){const t0=mv.at-.55*mv.dur,u=(tau-t0)/mv.dur;if(u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.14});}
 if(k===CAS){yaw=tau<2.86-.5?yawOf(b[0]-x,b[2]-z):Math.PI;}
 if(k===ZAM){
  for(let i=0;i<TOUCHES.length-1;i++)p=over(p,{rHipF:34,rKnee:26,rAnk:34,rHipR:10},bump(TOUCHES[i]-.16,TOUCHES[i]+.1,tau));
  p=over(p,LOOK_UP,bump(-1.6,PASS-.05,tau)*.9);
  const D=.9,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.8}),inWin(u));yaw=lerpA(yaw,yawOf(BOUNCE_PT[0]-x,BOUNCE_PT[1]-z),.6*inWin(u));}
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.4,IN_NET+.9,tau));}
 if(k===NED){
  // the receiving touch (left instep pushes it on) and THE SHOT with the left foot (inferred), no slowing down in between
  p=over(p,{lHipF:32,lKnee:24,lAnk:30,lHipR:14},bump(MEET-.17,MEET+.1,tau));
  const D=.72,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:1}),inWin(u));yaw=lerpA(yaw,yawOf(NET[0]-x,NET[2]-z),.85*inWin(u));}
  if(tau>IN_NET+.35)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.35,IN_NET+.9,tau));}
 if((k===HIE||k===HEL)&&tau>.6&&tau<2.4)p=over(p,CAUGHT,bump(.6,2.4,tau)*.8);
 if(JUVS.has(k)&&k!==NED&&k!==ZAM&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='rma'&&tau>IN_NET+.8)p=over(p,{lean:40,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.8,IN_NET+1.6,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a paper ball with navy stars (after the Champions League star-ball)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const star=new Path2D();for(let i=0;i<3;i++){const a=rot+i/3*TAU,d=r*.52,cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d,w=r*.3,q:Pt[]=[];for(let j=0;j<10;j++){const b=rot*.5+j/10*TAU,rr=j%2?w*.42:w;q.push([cx+Math.cos(b)*rr,cy+Math.sin(b)*rr]);}star.addPath(polyPath(q,true));}
 s.fill(K,star,.9);s.restore();
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
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(6,c.F*.16/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** a runner's path from τa to τb as ground points */
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(ta,tb,i/n)));return o;};
/** a straight ground path a → b */
const linePts=(a:Pt,b:Pt,n=12):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const u=i/n;o.push([lerp(a[0],b[0],u),lerp(a[1],b[1],u)]);}return o;};
/** the gap Nedvěd runs through: between the two centre-backs as he passes them */
const GAP_T=1.3;
const gapPt=():Pt=>{const a=posOf(HIE,GAP_T),b=posOf(HEL,GAP_T);return[(a[0]+b[0])/2,(a[1]+b[1])/2];};
/** speed lines trailing a runner (screen space, behind the body) */
function speedLines(s:Sheet,c:Cam,k:number,tau:number,w:number){if(w<=.02)return;const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1,ux=v[0]/l,uz=v[1]/l;
 const z0=kAt(c,[x,1,z]);for(let i=0;i<3;i++){const h=.55+i*.38,a=pr(c,[x-ux*(.7+i*.2),h,z-uz*(.7+i*.2)]),b=pr(c,[x-ux*(2.4+i*.5),h,z-uz*(2.4+i*.5)]);if(a&&b)s.fill(K,ribbon([a,b],z0*.05,{seed:9+i,taper:.9,wobble:.5}),.6*w);}}
/** a small ring round a boot (screen space, from the drawn joints) */
function bootRing(s:Sheet,r:DrawResult|undefined,foot:'l'|'r',w:number,ink:string,seed:number){if(!r||w<=.02)return;const toe=r.joints[foot==='l'?'lToe':'rToe'],heel=r.joints[foot==='l'?'lHeel':'rHeel'],
 cx=(toe[0]+heel[0])/2,cy=(toe[1]+heel[1])/2,rad=Math.max(9,Math.hypot(toe[0]-heel[0],toe[1]-heel[1])*1.05)*(.75+.25*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.8]);}
 const rr=ribbon(pts,Math.max(4,rad*.2),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (Zambrotta's carry plays at real time, the pass and run a little slower) */
const tau1=(t:number)=>{const S=SECS(0),G=CUEW(0,'past Casillas');return key(t,mono([[0,-6.2],[CUEW(0,'Zambrotta looks up'),-1.2],[CUEW(0,'a long pass'),-.05],[CUEW(0,'Pavel Nedved'),.85],[CUEW(0,'between the two'),1.4],[CUEW(0,'and buries it'),SHOT-.06],[G,IN_NET],[S+1,IN_NET+(S+1-G)*.85]]),linear);};
const CAM1:V3=[66,28,76];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUEW(0,'past Casillas'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the camera rides the ball, leading it toward goal during the pass and the run; after the goal it settles on Nedvěd
 const lead=sm(-1.4,.2,tau)*(1-sm(2,2.8,tau))*6,cel=posOf(NED,tau),toC=sm(G+.5,G+1.6,t,easeInOutSine);
 const T0:V3=[bt[0]+lead,0,bt[2]*.7-2],T=lerp3(T0,[cel[0]-1,1.2,cel[1]],toC);
 const F=key(t,[[0,6200],[CUEW(0,'Zambrotta'),6800],[CUEW(0,'a long pass'),5600],[CUEW(0,'Pavel'),6000],[CUEW(0,'and buries'),6800],[G,7400],[G+1.4,8600],[S,8900]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'past Casillas');
  stadium(s,c,v,t,{roar:sm(G-.1,G+.5,t),flash:sm(G,G+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,hero:NED});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(NED,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:11.6,
};

// ---------------------------------------------------------------- 2 · slow replay, raised behind Nedvěd's left shoulder: the gap, no slowing down, the shot
const tau2=(t:number)=>key(t,mono([[0,-.2],[CUEW(1,'Nedved finds'),.45],[CUEW(1,'the gap'),1.15],[CUEW(1,"He doesn't slow"),1.75],[CUEW(1,"He doesn't wait"),2.2],[CUEW(1,'He shoots'),SHOT-.03],[SECS(1),SHOT+.3]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(NED,Math.min(tau,SHOT)),open=1-sm(0,1.2,t,easeInOutSine),push=sm(CUEW(1,"He doesn't wait")-.5,CUEW(1,'He shoots'),t,easeInOutSine);
 const C:V3=[m[0]-10+3*open+2.5*push,4.6-1*push,m[1]-6.5+1.5*push],T:V3=[m[0]+9-3*push,.5,m[1]+2.6];
 return look(C,T,2450-300*open+150*push);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),nf=CUEW(1,'Nedved finds'),tg=CUEW(1,'the gap'),ds=CUEW(1,"He doesn't slow"),dw=CUEW(1,"He doesn't wait"),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  const out=1-sm(E-.8,E-.4,t);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:NED,under:()=>{
   // "the gap": the yellow ring between the two centre-backs, red rings on the two defenders; "Nedved finds": his run through it (blue)
   const [gx,gz]=gapPt(),[hx,hz]=posOf(HIE,GAP_T),[lx,lz]=posOf(HEL,GAP_T),gw=sm(tg-.2,tg+.3,t,easeOutBack)*(1-sm(dw-.2,dw+.3,t));
   ring(s,c,hx,hz,1.1,gw,R,44);ring(s,c,lx,lz,1.1,gw,R,45);ring(s,c,gx,gz,2.2,gw,Y,46);
   groundArrow(s,c,runPts(NED,.2,MEET),sm(nf-.1,tg+.4,t,easeOut)*out,B,63);
   // "He doesn't wait": the yellow spot where he shoots, one touch after the ball arrives
   ring(s,c,SHOT_PT[0],SHOT_PT[1],1.2,sm(dw-.15,dw+.3,t,easeOutBack)*out,Y,47);},
   after:()=>{speedLines(s,c,NED,tau,sm(ds-.1,ds+.3,t)*(1-sm(dw+.2,dw+.6,t)));
    // "He shoots": a spark at the boot as it meets the ball
    const age=tau-SHOT;if(age>-.06&&age<.35){const q=pr(c,[SHOT_PT[0],.15,SHOT_PT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[SHOT_PT[0],0,SHOT_PT[1]])*.8,{n:9,seed:93,g:easeOutBack(clamp((age+.06)/.08))*(1-clamp((age-.2)/.15)),width:9});}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:6.4,
};

// ---------------------------------------------------------------- 3 · second replay angle from behind the goal: the defenders a moment too late, the strike, the net
const tau3=(t:number)=>{const g=CUEW(2,'Goal');return key(t,mono([[0,1.45],[CUEW(2,'he hits it hard'),SHOT-.04],[CUEW(2,'before the defenders'),SHOT+.1],[CUEW(2,'close him down'),SHOT+.3],[g,IN_NET+.08],[SECS(2),IN_NET+.08+(SECS(2)-g)*.8]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),g=CUEW(2,'Goal'),turn=sm(g+.3,SECS(2)-.3,t,easeInOutSine),nd=smooth(NED,tau);
 const C0:V3=[114.5,4,-1.5],T0:V3=[lerp(lerp(nd[0],102,.3),96,sm(SHOT,IN_NET,tau,easeInOutSine)),2.2,lerp(lerp(nd[1],-1,.3),-1.6,sm(SHOT,IN_NET,tau))];
 const C1:V3=[nd[0]+7,2.4,nd[1]-7.5],T1:V3=[nd[0]-.5,1.1,nd[1]+1];
 return look(lerp3(C0,C1,turn),lerp3(T0,T1,turn),lerp(3500-500*sm(SHOT,IN_NET,tau),3200,turn));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),g=CUEW(2,'Goal'),turn=sm(g+.3,SECS(2)-.3,t,easeInOutSine),bd=CUEW(2,'before the defenders'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(g-.1,g+.3,t)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{goalLater:turn<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:NED,under:()=>{
   // "before the defenders can close him down": red arrows from each chaser toward him — they stop short; the shot has gone
   const w=sm(bd-.2,bd+.5,t,easeOut)*(1-sm(g-.3,g+.1,t)),target=SHOT_PT;
   for(const [k,sd] of [[HIE,71],[HEL,72],[SAL,73]] as [number,number][]){const p=posOf(k,SHOT-.25),dx=target[0]-p[0],dz=target[1]-p[1],l=Math.hypot(dx,dz)||1,stop=Math.max(0,l-1.6);
    groundArrow(s,c,linePts(p,[p[0]+dx/l*stop,p[1]+dz/l*stop],8),w,R,sd);}}});
  if(turn<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(NED,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 4 · the lesson: low beside Nedvěd — either foot, the weaker foot, the space, shoot
const tau4=(t:number)=>key(t,mono([[0,1.5],[CUEW(3,'Nedved could'),1.62],[CUEW(3,'either foot'),1.78],[CUEW(3,'Your turn'),1.92],[CUEW(3,'practise'),2.02],[CUEW(3,'your weaker'),2.12],[CUEW(3,'so you can'),2.24],[CUEW(3,'as soon as'),2.36],[CUEW(3,'you get space'),SHOT],[SECS(3),SHOT+.42]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(NED,Math.min(tau,SHOT+.2)),push=sm(0,1.4,t,easeInOutSine),rise=sm(CUEW(3,'so you can')-.4,CUEW(3,'you get space'),t,easeInOutSine);
 const C:V3=[m[0]-2.8-1.6*(1-push)-1.5*rise,1.4+2.4*rise,m[1]-3.8-1.2*(1-push)-1.5*rise],T:V3=[m[0]+2.2+4*rise,.75-.1*rise,m[1]+.3];
 return look(C,T,1750+250*push-250*rise);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),ef=CUEW(3,'either foot'),wf=CUEW(3,'your weaker'),sc=CUEW(3,'so you can'),as=CUEW(3,'as soon as'),gs=CUEW(3,'you get space'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  const [nx,nz]=posOf(NED,Math.min(tau,SHOT));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:NED,under:()=>{
   // "so you can shoot": his ring of space on the grass (blue); "as soon as": the yellow lane to goal from the spot he shoots from
   ring(s,c,nx,nz,3,sm(sc-.2,sc+.3,t,easeOutBack)*(1-sm(E-.9,E-.5,t)),B,48);
   groundArrow(s,c,linePts(SHOT_PT,[103.6,-2.6],10),sm(as-.1,gs+.2,t,easeOut)*(1-sm(E-.9,E-.5,t)),Y,69);},
   after:({joints})=>{
    // "either foot": both boots ringed; "your weaker foot": the left one pulses bigger (the one he shoots with here)
    const r=joints.get(NED),bw=sm(ef-.15,ef+.25,t,easeOutBack)*(1-sm(sc+.2,sc+.6,t)),pulse=sm(wf-.1,wf+.2,t)*(1+.25*Math.sin(TAU*1.6*Math.max(0,t-wf)));
    bootRing(s,r,'r',bw*(1-.5*sm(wf-.1,wf+.2,t)),B,81);bootRing(s,r,'l',Math.max(bw,Math.min(1.3,pulse)*(1-sm(sc+.2,sc+.6,t))),Y,82);
    // "get space": the strike spark
    const age=tau-SHOT;if(age>-.06&&age<.4){const q=pr(c,[SHOT_PT[0],.15,SHOT_PT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,[SHOT_PT[0],0,SHOT_PT[1]])*.75,{n:9,seed:94,g:easeOutBack(clamp((age+.06)/.08))*(1-clamp((age-.25)/.15)),width:9});}}});
 },
 still:6,
};

const film:RisoStory={
 id:'nedved-signature',format:'11v11',title:"Nedvěd's Two-Footed Shot",theme:'Work on your weaker foot so you can shoot as soon as you get space',
 ageNote:'Champions League semi-final, Juventus 3–1 Real Madrid, Stadio delle Alpi, Turin, 14 May 2003. For players of every age.',
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
