/** Iconic-play film · Dani Alves, "Signature: the overlap with Messi" (lib/town/iconicPlays.json, kind "signature", template overlap_run,
 * right side; lesson "Pass and keep running; the return pass will find you in space").
 *
 * HONEST FALLBACK ("Here's how he did it"): the brief asks for ONE real, well-documented moment. The research below found the partnership
 * itself described precisely in writing, but not one specific Alves–Messi overlap goal described move by move (checked: the 2009 Club World
 * Cup final winner — the BBC credits a Xavi cross, not Alves; Messi's 400th Barça goal, 18 Apr 2015, which Alves set up by his own account —
 * the Guardian/Reuters report only says "on the counterattack", no build-up). So, per the brief's fallback, the film recreates the SIGNATURE
 * PATTERN the sources describe — Alves passing to Messi on Barcelona's right, overlapping round the outside, getting it back and setting Messi
 * up — at Camp Nou in Barcelona's home kit, and the narration says so ("Here's how Dani Alves did it at Barcelona, again and again"). It names
 * no match, date, opponent or score.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Goal.com, Ben Hayward, "Farewell Dani Alves – Messi's chief assistant and the best full-back in Barcelona's history" (27 Jun 2016,
 *    web.archive.org copy; goal-alves-farewell-2016.txt): "Given the freedom of the right flank, he has set up more goals for Lionel Messi
 *    than anyone else at the Catalan club, including both Xavi and Andres Iniesta"; Guardiola at his 2008 unveiling: "Along with Messi, if
 *    they work together, we will have the best right flank in the world"; "Under Pep, Alves often operated as an unorthodox winger"; "With
 *    Alves and Messi in full flow, teams often buckled in that sector of the pitch"; Alves "set up Messi's 400th Barca goal"; eight seasons.
 *  - Wikipedia, "Dani Alves" (raw wikitext; wiki-dani-alves.txt), Style of play: "an offensive right-back … known in particular for his pace,
 *    stamina, overlapping attacking runs, and technical skills"; "good crossing accuracy and distribution, which allows him to link up with
 *    midfielders, and makes him an effective assist provider along the right flank"; his own words: "I'm a full-back who plays a combination
 *    game".
 *  - Wikipedia, "2009 FIFA Club World Cup final" (wiki-2009-cwc-final.txt): the Barça team sheet with Alves RB number 2 and Messi RW number 10
 *    (their numbers from 2009–10); BBC Sport, "Barcelona beat Estudiantes to win the Club World Cup" (19 Dec 2009; bbc-8422908.txt); The
 *    Guardian (Reuters), "Lionel Messi's 400th goal helps Barcelona beat Valencia in La Liga" (18 Apr 2015; guardian-barca-valencia-2015.txt);
 *    Wikipedia, "2008–09 FC Barcelona season" (Alves wore 20 in his first season); ESPN oral history of Barça's 2009 (Alves's own words).
 * CONFIRMED by those accounts: Alves played right-back for Barcelona (2008–2016) with Messi in front of him on the right; he made overlapping
 * runs, combined with team-mates and crossed; he set up more Messi goals than anyone at the club; numbers 2 (Alves) and 10 (Messi); Messi is
 * left-footed (drawn so: his return pass and finish are left-footed); Camp Nou is Barcelona's home ground.
 * INFERRED (illustrative, never narrated as a fact about one game): the whole choreography — Alves's inside pass near halfway, Messi dribbling
 * inside and pulling the left-back with him, the overlap on the touchline, the return pass into the space, the low cross and Messi's first-time
 * finish; every position, path and timing; the opponents (anonymous, all white, no names) and their keeper's and the referee's kits; the home
 * kit's details (blue-and-garnet stripes, blue shorts and socks — the usual look of those seasons, drawn plain); night under floodlights; the
 * Camp Nou bowl's shape and the crowd colours; skin screens and hair; the cameras and lenses. Alves's right foot for the pass and the cross is
 * inferred (he was right-footed) and not named in the narration.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera at halfway, near
 * real time, panning with the ball (pass, overlap, return, cross, goal); 2 = slow replay from a low rail camera on the touchline running
 * beside Alves (the defender follows Messi inside; nobody follows Alves; the empty space on the wing; teaching marks: rings, the space);
 * 3 = the lesson from a raised three-quarter camera behind the right flank: the pass, the run round the outside (dashed), the space, the
 * return pass. All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Scenes read
 * only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The overlap, live',text:"Here's how Dani Alves did it at Barcelona, again and again. The right-back passes to Messi... and keeps running! Round the outside. Messi slides it back into his path. Alves crosses... and Messi scores!",seconds:15.8,
  cues:[[.2,"Here's how"],[.9,'Dani Alves'],[2,'at Barcelona'],[3,'again and again'],[4.6,'The right-back'],[5.5,'passes to Messi'],[7,'keeps running'],[8.3,'Round the outside'],[9.6,'Messi slides'],[10.6,'into his path'],[11.8,'Alves crosses'],[13.1,'Messi scores']]},
 {label:'Watch it again',text:'Watch again, slowly. The defender follows Messi inside. Nobody follows Alves. He sprints into the empty space on the wing, and the ball is waiting for him.',seconds:11.6,
  cues:[[.15,'Watch again'],[1.5,'The defender'],[2.2,'follows Messi'],[3.5,'Nobody follows'],[4.6,'He sprints'],[5.5,'the empty space'],[6.5,'on the wing'],[7.6,'the ball is waiting'],[8.8,'for him']]},
 {label:'Your turn',text:'Your turn: pass to a teammate, then keep running! Go round the outside, into space. The return pass will find you there.',seconds:9.4,
  cues:[[.15,'Your turn'],[.9,'pass to a teammate'],[2.6,'keep running'],[3.8,'round the outside'],[4.8,'into space'],[5.9,'The return pass'],[7,'find you there']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py dani-alves-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/dani-alves-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-dani-alves-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/dani-alves-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('dani-alves-signature: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit.
 * Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Barça attack +X, the goal line they attack at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera = Barça's RIGHT flank, Alves's wing). */
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
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (the cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Camp Nou at night: a huge, steep three-tier bowl close to the pitch (shape inferred)
const CX=52.5,NS=60;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a squarish superellipse just outside the pitch), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(62+d)*Math.sign(c)*Math.pow(Math.abs(c),.45),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.45)];}
const T1=(b:number):[number,number]=>[1+20*b,1+11*b],T2=(b:number):[number,number]=>[23+14*b,14+11*b],T3=(b:number):[number,number]=>[39+24*b,27+21*b];
type Bowl={tiers:V3[][][];band:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={tiers:[[],[],[]],band:[],fascia:[],lamps:[],seats:[]},TIERS=[T1,T2,T3];
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  TIERS.forEach((f,k)=>o.tiers[k].push(Q(f,0,1)));
  o.band.push([rim(a,21,12),rim(b,21,12),rim(b,23,14),rim(a,23,14)],[rim(a,37,25),rim(b,37,25),rim(b,39,27),rim(a,39,27)]);
  o.fascia.push([rim(a,63,48),rim(b,63,48),rim(b,63,50),rim(a,63,50)]);
  if(i%3===0)o.lamps.push(rim(a+.5/NS*TAU,63,51));
  TIERS.forEach((f,k)=>{const rows=k===2?9:6,J=5;for(let r=0;r<rows;r++)for(let j=0;j<J;j++){const h=hash(i*977+r*31+j*7+k*5000,23);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(j+.5+(hash(i+r*13+j,6)-.5)*.5)/J)/NS*TAU,d,y+.4),h});}});}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the blaugrana crowd (roar lifts the seat marks), the lit rim */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number}={}){
 const{roar=0}=o;
 const sky=rectPath(-1e4,-1e4,2e4,2e4);s.tone(K,sky,.85);s.tone(B,sky,.35);
 const tier=[new Path2D(),new Path2D(),new Path2D()],band=new Path2D(),fas=new Path2D(),lamp=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){for(let k=0;k<3;k++)add(BOWL.tiers[k][i],tier[k]);add(BOWL.fascia[i],fas);}
 for(const q of BOWL.band)add(q,band);
 for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]>30){const g=scr(c,d),z=clamp(c.F*1.2/d[2],3,16);if(inView(v,g))lamp.addPath(polyPath([[g[0]-z*1.4,g[1]],[g[0],g[1]-z*.6],[g[0]+z*1.4,g[1]],[g[0],g[1]+z*.6]],true));}}
 s.knockout(tier[2]);s.tone(B,tier[2],.42);s.tone(K,tier[2],.36);
 s.knockout(tier[1]);s.tone(B,tier[1],.4);s.tone(K,tier[1],.26);
 s.knockout(tier[0]);s.tone(B,tier[0],.36);s.tone(K,tier[0],.18);
 // the crowd: paper shirts, garnet (red), blue, navy and a few yellow senyera flags
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.42?0:q.h<.66?1:q.h<.84?2:q.h<.94?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.9);s.fill(B,inks[2],.9);s.fill(K,inks[3],.8);s.fill(Y,inks[4],.9);
 s.knockout(band,.5);
 s.knockout(fas);s.fill(K,fas,.5);s.knockout(lamp);s.fill(Y,lamp,.6);
}
/** the apron, red boards, the floodlit grass with mowing stripes, the paper lines, both goals */
function ground(s:Sheet,c:Cam){
 const ap=polyP(c,Array.from({length:48},(_,i)=>rim(i/48*TAU,0,0)));if(ap.length>2){const p=polyPath(ap,true);s.knockout(p);s.tone(K,p,.5);s.tone(B,p,.35);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.86);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // boards along the far touchline and behind both goals: red with paper panels
 const bd=new Path2D(),pn=new Path2D(),bq=(q:V3[])=>{const r=polyP(c,q);if(r.length>2)bd.addPath(polyPath(r,true));};
 bq([[-4,0,-39],[109,0,-39],[109,.9,-39],[-4,.9,-39]]);bq([[110,0,-38],[110,0,38],[110,.9,38],[110,.9,-38]]);bq([[-5,0,-38],[-5,0,38],[-5,.9,38],[-5,.9,-38]]);
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-38.9],[x+3.2,.25,-38.9],[x+3.2,.65,-38.9],[x,.65,-38.9]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<12;k++){const z=-36+k*6.2,q=polyP(c,[[109.9,.25,z],[109.9,.25,z+3.2],[109.9,.65,z+3.2],[109.9,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.95);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 for(const [x,z,a0] of [[0,-34,0],[105,-34,Math.PI/2],[105,34,Math.PI],[0,34,-Math.PI/2]] as [number,number,number][])circ(x,z,1,a0,a0+Math.PI/2,4);
 s.knockout(ln);
 goal3(s,c,0,-1);goal3(s,c,105,1);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep */
function goal3(s:Sheet,c:Cam,X:number,d:number){
 const z0=-3.66,z1=3.66,H=2.44,bk=X+d*2;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bk,1.9,z0],[bk,0,z0]],[[X,0,z1],[X,H,z1],[bk,1.9,z1],[bk,0,z1]],[[X,H,z0],[X,H,z1],[bk,1.9,z1],[bk,1.9,z0]],[[bk,0,z0],[bk,0,z1],[bk,1.9,z1],[bk,1.9,z0]]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bk,1.9,z],.025,mesh);seg3(c,[bk,1.9,z],[bk,0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;seg3(c,[bk,y,z0],[bk,y,z1],.025,mesh);seg3(c,[X,y*H/1.9,z0],[bk,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bk,y,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
// skin: one flat screen + at most one light screen (athlete.ts guidance); tones are illustrative
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Barcelona at home (inferred look of those seasons): blue-and-garnet stripes (red ink striped with blue), blue shorts, blue socks */
const BAR=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:B,shorts:B,socks:B,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:Y,seed:4,...o});
/** the opponents: anonymous, all white with navy trim (illustrative) */
const OPP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:K,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:K,seed:30,...o});
/** Dani Alves: number 2, right-back, dark short hair */
const ALVES_STYLE=BAR(SKIN_D,{number:2,build:{height:1.72,bulk:1,thighs:1.08},seed:22});
/** Lionel Messi: number 10, small and quick, left-footed */
const MESSI_STYLE=BAR(SKIN_L,{number:10,build:{height:1.7,bulk:.92},seed:19});
const KEEPER:AthleteStyle={shirt:[Y,.9],shorts:[K,.8],socks:[Y,.9],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',trim:K,gloves:[R,.6],number:1,numberInk:K,build:{height:1.88,bulk:1.05},seed:51};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'balding',line:K,build:{height:1.82,bulk:.95},seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Alves's pass to Messi)
type Role='bar'|'opp'|'gk'|'ref';
/** a keyed action: kick (contact at `at`), lunge (full reach at `at`), dive (keeper, full stretch at `at`) */
type Act={kind:'kick'|'lunge'|'dive';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];acts?:Act[];dribble?:[number,number,'l'|'r'][];engage?:[number,number,number];key?:boolean};
const ALVES=0,MESSI=1,LB=2,WING=3,CB1=4,CB2=5,GK=6;
const PASS=0,PASS_IN=.55,RET=2.8,RET_IN=3.6,CROSS=5.45,SHOT=6.4,GOAL_T=6.85;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The pattern (pass inside, overlap outside, return, cross for Messi) is the
 * sourced signature; every position and time is illustrative (see INFERRED). */
const ACTORS:Actor[]=[
 {name:'Alves',role:'bar',style:ALVES_STYLE,key:true,dribble:[[-4.5,-.1,'r'],[RET_IN,CROSS-.15,'r']],
  acts:[{kind:'kick',at:PASS,dur:.8,side:'r',power:.4},{kind:'kick',at:CROSS,dur:.95,side:'r',power:.72}],
  keys:[[-4.5,42,27],[-2.5,46.5,28.2],[-1,50,28.8],[0,52.3,29],[.8,56,30],[1.8,62,30.8],[2.8,68.5,31],[3.6,74,30.6],[4.4,79,29.6],[5,83,28.4],[5.45,85.6,27.6],[6,88,26.8],[7,91,24],[8.5,95,19.5],[10,96.5,18.5]]},
 {name:'Messi',role:'bar',style:MESSI_STYLE,key:true,dribble:[[PASS_IN,RET-.05,'l']],
  acts:[{kind:'kick',at:RET,dur:.8,side:'l',power:.42},{kind:'kick',at:SHOT,dur:.85,side:'l',power:.85}],
  keys:[[-4.5,64,21],[-2.5,61.5,22.6],[-.6,59,23.6],[.55,58.3,23.2],[1.3,60.6,21.6],[2.1,64,19.2],[2.8,67,17.6],[3.6,71.5,15.2],[4.6,79,12],[5.5,86.5,9],[6.1,91.6,6.9],[6.4,93.6,6.2],[7,96,6.6],[8.5,99.5,11],[10,100.2,13.5]]},
 {name:'left-back',role:'opp',style:OPP({number:3,seed:33}),key:true,engage:[.4,3.2,MESSI],acts:[{kind:'lunge',at:2.72,dur:.8,side:'r'}],
  keys:[[-4.5,72,25],[-2,69,25],[0,65.5,24.8],[.9,63.2,23.6],[1.7,64.6,21.4],[2.5,67,19.6],[3.1,68.3,18.9],[4,71.5,18.4],[6,80,16],[10,88,14]]},
 {name:'winger',role:'opp',style:OPP({number:7,seed:37}),key:true,keys:[[-4.5,51,24],[-2,54,25.5],[0,55.5,26.5],[1.5,58.5,27.5],[3,63.5,28.5],[4.5,69,28.6],[6,74.5,27.5],[10,80,25]]},
 {name:'centre-back',role:'opp',style:OPP({number:4,build:{height:1.9},hair:[K,.9],seed:34}),key:true,acts:[{kind:'lunge',at:6.25,dur:.8,side:'l'}],
  keys:[[-4.5,84,9],[3,86,11],[5,89.5,12],[5.9,92,9.5],[6.4,93.6,8.3],[7.5,94.5,8],[10,95,8]]},
 {name:'centre-back 2',role:'opp',style:OPP({number:5,build:{height:1.87},seed:35}),key:true,keys:[[-4.5,85,-4],[3,87.5,-2],[5.5,92,1],[6.5,95,3],[10,97,3]]},
 {name:'keeper',role:'gk',style:KEEPER,key:true,acts:[{kind:'dive',at:6.62,dur:.9,side:'r'}],keys:[[-4.5,101.5,1.5],[4,101.8,3],[5.8,102.4,4.4],[6.3,102.6,3.6],[10,102.6,3.6]]},
 {name:'right-back',role:'opp',style:OPP({number:2,seed:32}),keys:[[-4.5,80,-22],[6,90,-12],[10,93,-10]]},
 {name:'opp 8',role:'opp',style:OPP({number:8,hair:[Y,.5],seed:38}),keys:[[-4.5,64,6],[10,80,6]]},
 {name:'opp 6',role:'opp',style:OPP({number:6,seed:36}),keys:[[-4.5,70,-6],[10,84,-4]]},
 {name:'opp 11',role:'opp',style:OPP({number:11,seed:41}),keys:[[-4.5,58,-20],[10,72,-18]]},
 {name:'Barça 6',role:'bar',style:BAR(SKIN_L,{number:6,build:{height:1.7},seed:6}),keys:[[-4.5,46,12],[10,68,10]]},
 {name:'Barça 8',role:'bar',style:BAR(SKIN_L,{number:8,hairStyle:'balding',build:{height:1.71},seed:8}),keys:[[-4.5,60,-8],[10,80,-6]]},
 {name:'Barça 9',role:'bar',style:BAR(SKIN_M,{number:9,build:{height:1.8},seed:9}),keys:[[-4.5,78,-2],[4,86,-3],[6.2,95,-4.5],[10,97,-4]]},
 {name:'Barça 16',role:'bar',style:BAR(SKIN_L,{number:16,build:{height:1.89},seed:16}),keys:[[-4.5,40,3],[10,56,3]]},
 {name:'Barça 3',role:'bar',style:BAR(SKIN_L,{number:3,build:{height:1.93},seed:3}),keys:[[-4.5,32,8],[10,46,8]]},
 {name:'referee',role:'ref',style:REF,keys:[[-4.5,56,6],[6,76,8],[10,84,10]]},
];
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-5,TB=11,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
/** an actor's running heading (x, z) — the last clear direction of travel */
function headOf(k:number,tau:number):[number,number]{for(const dt of [0,-.3,-.7,.4]){const v=velOf(k,tau+dt),l=Math.hypot(v[0],v[1]);if(l>.6)return[v[0]/l,v[1]/l];}return[1,0];}
/** the ball spot at an actor's foot: ahead and a touch to the kicking side (right = (−fz, fx)) */
const footAt=(k:number,tau:number,side:'l'|'r'='r',ahead=.5):V3=>{const p=posOf(k,tau),[fx,fz]=headOf(k,tau),s=side==='r'?.14:-.14;return[p[0]+fx*ahead-fz*s,.11,p[1]+fz*ahead+fx*s];};

// ---------------------------------------------------------------- the ball: the pass inside, Messi's carry, the return into space, the cross, the finish
const NET:V3=[105.5,.55,-2.3],REST:V3=[106.6,.12,-2.5];
type Leg={t0:number;t1:number;a:()=>V3;b:()=>V3;h:number;ease?:number};
/** passes between feet (a, b evaluated at the leg's ends); h = apex height */
const LEGS:Leg[]=[
 {t0:PASS,t1:PASS_IN,a:()=>footAt(ALVES,PASS),b:()=>footAt(MESSI,PASS_IN,'l'),h:.08,ease:.3},
 {t0:RET,t1:RET_IN,a:()=>footAt(MESSI,RET,'l'),b:()=>footAt(ALVES,RET_IN,'r',.6),h:.05,ease:.3},
 {t0:CROSS,t1:SHOT,a:()=>footAt(ALVES,CROSS),b:()=>footAt(MESSI,SHOT,'l'),h:.35,ease:.15},
 {t0:SHOT,t1:GOAL_T,a:()=>footAt(MESSI,SHOT,'l'),b:()=>NET,h:.2,ease:0},
];
/** on the ball: [from, to, actor, foot] */
const HOLDS:[number,number,number,'l'|'r'][]=[[-9,PASS,ALVES,'r'],[PASS_IN,RET,MESSI,'l'],[RET_IN,CROSS,ALVES,'r']];
function ballAt(tau:number):V3{
 for(const [a,b,k,f] of HOLDS)if(tau>=a&&tau<b){const p=footAt(k,tau,f,.5),pulse=.22*Math.max(0,Math.sin(distOf(k,tau)/2.2*TAU));const[fx,fz]=headOf(k,tau);return[p[0]+fx*pulse,.11,p[2]+fz*pulse];}
 for(const L of LEGS)if(tau>=L.t0&&tau<L.t1){const a=L.a(),b=L.b(),u=(tau-L.t0)/(L.t1-L.t0),e=lerp(u,1-(1-u)*(1-u),L.ease??0);
  return[lerp(a[0],b[0],e),lerp(a[1],b[1],e)+L.h*4*e*(1-e),lerp(a[2],b[2],e)];}
 const u=clamp((tau-GOAL_T)/.8),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** Alves after the goal: both arms up */
const ARMS_UP:Partial<Pose>={lShF:160,rShF:160,lShA:30,rShA:30,lElb:20,rElb:20,neckP:-18,lean:-2};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 const hd=headOf(k,tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):Math.hypot(b[0]-x,b[2]-z)<1.4?yawOf(hd[0],hd[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage){const[e0,e1,tk]=a.engage,m=posOf(tk,tau);if(tau>e0&&tau<e1+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(e0,e0+.4,tau),1-sm(e1,e1+.4,tau)));}
 if(a.role==='gk'||(a.role==='ref'&&sp<.4))yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='opp'?READY:stand();
 const dr=a.dribble?.find(d=>tau>d[0]-.2&&tau<d[1]+.3);
 if(dr){const w=Math.min(sm(dr[0]-.2,dr[0]+.2,tau),1-sm(dr[1],dr[1]+.3,tau));const run=runCycle(distOf(k,tau)/3.6,{speed:clamp((sp-2)/5)}),db=dribble(distOf(k,tau)/2.4,{foot:dr[2],speed:.45+.45*clamp((sp-1.5)/4)});
  p=blendPose(blendPose(idle,run,clamp((sp-.4)/.9)),db,w*clamp((sp-.2)/.6+.4)*(k===ALVES?.8:1));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.2);p=blendPose(idle,runCycle(distOf(k,tau)/(k===ALVES?4:3.4),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.acts??[]){
  if(mv.kind==='kick'){const st=mv.at-STRIKE_CONTACT*mv.dur,u=(tau-st)/mv.dur;
   if(u>0&&u<1.45){const w=Math.min(sm(0,.18,u),1-sm(1,1.45,u)),b0=ballAt(mv.at+.02),b1=ballAt(mv.at+.2),aim=yawOf(b1[0]-b0[0],b1[2]-b0[2]);
    p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.6}),w);
    // a pass or cross is struck across the body: the hips open a little away from the line of the ball
    const off=mv.side==='r'?.3:-.3;yaw=lerpA(yaw,aim+off,w*sm(0,.4,u));}}
  if(mv.kind==='lunge'){const t0=mv.at-.6*mv.dur,u=(tau-t0)/mv.dur;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
  if(mv.kind==='dive'){const t0=mv.at-.55*mv.dur,u=(tau-t0)/mv.dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:mv.side,height:.25}),sm(0,.1,u));yaw=yawOf(-1,0);}}}
 // the goal: Messi wheels away, Alves throws his arms up and runs to him
 if(k===MESSI&&tau>SHOT+.5)p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(SHOT+.5,SHOT+1,tau));
 if(k===ALVES&&tau>GOAL_T+.1)p=over(p,ARMS_UP,sm(GOAL_T+.1,GOAL_T+.6,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;rings?:[number,number,string][]}={}):PlayOut{
 const{minBall=6,hero=false,rings=[]}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // floodlit shadows: small, soft, batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.16,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 // rings on the grass under named players: [actor, weight, ink]
 for(const [rk,w,ink] of rings){if(w<=.01)continue;const[x,z]=posOf(rk,tau),pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*.95,0,z+Math.sin(i/36*TAU)*.8]);if(q)pts.push(q);}
  if(pts.length>30){const q=toCam(c,[x,0,z]),rr=ribbon(pts,Math.max(5,c.F*.1/q[2]),{close:true,seed:43+rk,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:Math.hypot(b[0],b[2])/.11,key:K,shadow:B,seed:3});};
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only Alves keeps 'mid'
  const detail=passing?(e.k===ALVES?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(a.key||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&(e.k===ALVES||e.k===MESSI)}:{});}
 if(!ballDone)drawBall();
 const out={list,bg,br};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** a spark on the ball for .4 s after a touch at T0 */
function touchSpark(s:Sheet,c:Cam,tau:number,T0:number,bg:Pt|null,seed:number){const age=tau-T0;if(age>-.05&&age<.4&&bg)sparkBurst(s,Y,bg[0],bg[1],c.F*.5/Math.max(2,toCam(c,ballAt(tau))[2]),{n:9,seed,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.22)/.15)),width:10});}

// ---------------------------------------------------------------- teaching marks
/** an arrow on the grass along actor k's real path from τa to τb, drawn up to fraction w; dashed = a run still to come */
function pathArrow(s:Sheet,c:Cam,k:number,ta:number,tb:number,w:number,ink:string,o:{seed?:number;dashed?:boolean;width?:number}={}){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=18;i++){const tau=ta+(tb-ta)*i/18,[x,z]=posOf(k,tau),q=toCam(c,[x,0,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=c.F*(o.width??.13)/d,seed=o.seed??61;
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8,gaps:o.dashed?[[.14,.22],[.36,.44],[.58,.66],[.8,.86]]:[]}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** an arrow on the grass through ground points (x, z), drawn up to fraction w */
function groundArrow(s:Sheet,c:Cam,P:[number,number][],w:number,ink:string,seed:number,width=.35,dashed=false){if(w<=0)return;
 const pts:Pt[]=[];let d=10;for(let i=0;i<P.length-1;i++)for(let j=0;j<8;j++){const u=j/8,q=toCam(c,[lerp(P[i][0],P[i+1][0],u),0,lerp(P[i][1],P[i+1][1],u)]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 const q=toCam(c,[P[P.length-1][0],0,P[P.length-1][1]]);if(q[2]>=1)pts.push(scr(c,q));
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=Math.max(5,c.F*width/Math.max(4,d));
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8,gaps:dashed?[[.14,.22],[.36,.44],[.58,.66],[.8,.86]]:[]}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** the empty space on the wing: a breathing zone on the grass with a dashed outline */
function zone(s:Sheet,c:Cam,P:[number,number][],w:number,t:number,ink:string,seed:number){if(w<=0)return;
 const n=P.length,cx=P.reduce((a,p)=>a+p[0],0)/n,cz=P.reduce((a,p)=>a+p[1],0)/n,pts:Pt[]=[];
 for(let i=0;i<n*6;i++){const a=P[Math.floor(i/6)],b=P[(Math.floor(i/6)+1)%n],u=(i%6)/6,br=1+.03*Math.sin(t*5)*w;const q=pr(c,[cx+(lerp(a[0],b[0],u)-cx)*br,0,cz+(lerp(a[1],b[1],u)-cz)*br]);if(q)pts.push(q);}
 if(pts.length<n*4)return;const zp=polyPath(pts,true);s.tone(ink,zp,.6*w);s.knockout(zp,.2*w);
 const q=toCam(c,[cx,0,cz]);s.fill(ink,ribbon(pts,Math.max(5,c.F*.16/Math.max(4,q[2])),{close:true,seed,taper:0,wobble:1.4,gaps:[[.1,.16],[.3,.36],[.5,.56],[.7,.76],[.9,.96]]}),.95*w);}
/** the space in behind the left-back that the return pass is played into */
const SPACE:[number,number][]=[[69,26],[79,25.5],[81,30],[79,33.4],[69,33.4],[67,30]];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera at halfway, near real time
/** τ from chapter-1 time, keyed to the cue words (≈ real time from the pass to the goal) */
const tau1=(t:number)=>{const MS=CUEW(0,'Messi scores');return key(t,[[0,-4.4],[CUEW(0,'passes'),-.3],[CUEW(0,'keeps'),1.1],[CUEW(0,'Round'),2.2],[CUEW(0,'Messi slides'),RET-.05],[CUEW(0,'into his'),RET_IN],[CUEW(0,'Alves crosses'),CROSS-.05],[MS,SHOT+.05],[SECS(0)+1,SHOT+.05+(SECS(0)+1-MS)*.9]],linear);};
const CAM1:V3=[52.5,30,90];
function cam1(t:number):Cam{
 const tau=tau1(t),S=SECS(0);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.3),b2=bs(tau-.6),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the director frames the ball but leans toward the box as the move reaches it
 const box=sm(4.6,6.2,tau),tb:V3=[lerp(bt[0]+3,93,box*.45),1.2,lerp(bt[2]-3,12,box*.5)];
 const open:V3=[52.5,4,2],toBall=sm(.2,CUEW(0,'at Barcelona')+.6,t,easeInOutSine);
 const T=lerp3(open,tb,toBall);
 const F=key(t,[[0,1700],[CUEW(0,'again and'),3900],[CUEW(0,'The right'),4700],[CUEW(0,'Round'),4400],[CUEW(0,'Alves crosses'),3900],[CUEW(0,'Messi scores'),4300],[S,4700]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),ms=CUEW(0,'Messi scores');
  stadium(s,c,v,t,{roar:sm(ms,ms+.4,t)});
  ground(s,c);
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,after:({bg})=>touchSpark(s,c,tau,SHOT,bg,81)});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(ALVES,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:12.2,
};

// ---------------------------------------------------------------- 2 · slow replay, a low rail camera on the touchline beside Alves
const tau2=(t:number)=>key(t,[[0,-.6],[CUEW(1,'The defender'),.5],[CUEW(1,'follows'),1.2],[CUEW(1,'Nobody'),2],[CUEW(1,'He sprints'),2.5],[CUEW(1,'the empty'),2.75],[CUEW(1,'the ball is'),RET_IN-.05],[SECS(1),4.5]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(ALVES,tau),open=1-sm(0,1.2,t,easeInOutSine);
 // early the lens leans inside to hold Messi and the left-back; then it rides with Alves
 const inside=1-sm(CUEW(1,'Nobody')-.3,CUEW(1,'He sprints')+.3,t,easeInOutSine);
 const C:V3=[m[0]-7-3*open,2.4+.8*inside,40.5];
 const T:V3=[m[0]+5+2*inside,1,lerp(m[1]-2,m[1]-8,inside)];
 return look(C,T,1750-250*open-200*inside);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),df=CUEW(1,'The defender'),fm=CUEW(1,'follows'),nb=CUEW(1,'Nobody'),hs=CUEW(1,'He sprints'),es=CUEW(1,'the empty'),bw=CUEW(1,'the ball is');
  stadium(s,c,v,t);
  ground(s,c);
  // "the empty space on the wing": the space in behind, in yellow
  zone(s,c,SPACE,sm(es-.2,es+.3,t,easeOutBack)*(1-.5*sm(bw+.4,SECS(1),t)),t,Y,95);
  // "He sprints": his run still to come, dashed yellow along the touchline
  pathArrow(s,c,ALVES,Math.max(tau,0),RET_IN,sm(hs-.2,hs+.5,t,easeOut)*(1-sm(bw-.2,bw+.2,t)),Y,{dashed:true,seed:71});
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,
   rings:[[LB,sm(df-.15,df+.3,t,easeOutBack)*(1-sm(nb+.2,nb+.7,t)),R],[MESSI,sm(fm-.15,fm+.3,t,easeOutBack)*(1-sm(nb+.2,nb+.7,t)),R],[ALVES,sm(nb-.15,nb+.3,t,easeOutBack),Y]],
   after:({bg})=>{touchSpark(s,c,tau,RET_IN,bg,77);touchSpark(s,c,tau,RET,bg,79);}});
  // the replay wipe as the chapter opens
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,bump(hs-.2,es+.6,t)*.4,27,.02);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(ALVES,tau2(t)),q=toCam(c,[x,1.2,z]);if(q[2]<NEAR)return apertureDisc(0,0,10,12);const g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:8.2,
};

// ---------------------------------------------------------------- 3 · the lesson: a raised three-quarter camera behind the right flank
const tau3=(t:number)=>key(t,[[0,-1.5],[CUEW(2,'pass to'),0],[CUEW(2,'keep running'),1.2],[CUEW(2,'round the'),2.2],[CUEW(2,'into space'),2.6],[CUEW(2,'The return'),RET],[CUEW(2,'find you'),RET_IN],[SECS(2),4.6]],linear);
function cam3(t:number):Cam{
 const tau=tau3(t),a=smooth(ALVES,clamp(tau,-1.5,4.2)),m=smooth(MESSI,clamp(tau,-1.5,3.2)),open=1-sm(0,1.2,t,easeInOutSine);
 const late=sm(RET-.2,RET_IN+.6,tau,easeInOutSine)*.65,T:V3=[lerp((a[0]+m[0])/2+2,a[0],late),.4,lerp((a[1]+m[1])/2-1,a[1]-3,late)];
 const C:V3=[T[0]-12-4*open,7.5+2*open,T[2]+19+3*open];
 return look(C,T,1700-200*open);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),pt=CUEW(2,'pass to'),kr=CUEW(2,'keep running'),ro=CUEW(2,'round the'),is=CUEW(2,'into space'),rp=CUEW(2,'The return'),fy=CUEW(2,'find you'),E=SECS(2);
  stadium(s,c,v,t);
  ground(s,c);
  const loop=t>fy+.4?.5+.5*Math.sin((t-fy)*5):1;
  // "into space": the empty space in behind
  zone(s,c,SPACE,sm(is-.2,is+.3,t,easeOutBack),t,Y,96);
  // "pass to a teammate": the pass inside, in red; "The return pass": back into the space, in red
  const pA=posOf(ALVES,PASS),pM=posOf(MESSI,PASS_IN),rM=posOf(MESSI,RET),rA=posOf(ALVES,RET_IN);
  groundArrow(s,c,[[pA[0]+.6,pA[1]-.6],[pM[0],pM[1]+.6]],sm(pt-.1,pt+.5,t,easeOut),R,97,.28);
  groundArrow(s,c,[[rM[0]+.6,rM[1]+.4],[rA[0]-.6,rA[1]-.3]],sm(rp-.1,rp+.5,t,easeOut),R,99,.28);
  // "keep running … round the outside": his run, dashed, then solid as he runs it
  pathArrow(s,c,ALVES,0,RET_IN,sm(kr-.1,kr+.6,t,easeOut)*(t<fy?1:.75+.25*loop),Y,{seed:98,width:.26,dashed:true});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,
   rings:[[ALVES,sm(.1,.5,t,easeOutBack),Y],[MESSI,sm(pt-.1,pt+.3,t,easeOutBack)*(1-sm(ro,ro+.4,t)),R],[LB,bump(ro-.2,is+.4,t),R]],
   after:({bg})=>{touchSpark(s,c,tau,RET_IN,bg,91);if(t>fy&&bg)sparkBurst(s,Y,bg[0],bg[1]-12,60,{n:7,seed:93+Math.floor(t*6),g:.5*loop*(1-sm(E-.5,E,t)),width:8});}});
 },
 still:7.4,
};

const film:RisoStory={
 id:'dani-alves-signature',format:'11v11',title:'Dani Alves: The Overlap',theme:'Pass and keep running: the overlapping full-back and the return pass into space',
 ageNote:'How Dani Alves and Messi combined on Barcelona’s right, again and again (an illustrative recreation of the pattern, not one match). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a splash of floodlit turf — grass bits and paper flecks, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and paper flecks thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
