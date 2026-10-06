/** Iconic-play film · Giacinto Facchetti, "Signature: the attacking full-back pioneer" — shown through one real, sourced moment: Inter v
 * Liverpool, European Cup semi-final second leg, San Siro, Milan, 12 May 1965 (kick-off 21:15 CET, 76,601). Inter won 3–0 (Corso 8',
 * Peiró 9', Facchetti 60'/62') after losing the first leg 3–1 at Anfield, so Facchetti's goal, the third, is the one that sent them to the
 * final (4–3 on aggregate), which they won against Benfica.
 *
 * WHY THIS MOMENT: Facchetti's signature (lib/town/iconicPlays.json, kind "signature", template overlap_run, side left) is the trait of the
 * left-back who runs forward when his team attacks. The Guardian obituary names this goal among his great moments ("A year later, he scored
 * the third goal, when Liverpool, 3-1 winners in the first leg, were beaten 3-0 in the second leg semi-final at San Siro") and describes the
 * trait itself ("the towering embodiment of the overlapping full back", "Facchetti's spectacular incursions from left back, his thundering
 * right-footed shots"); it.wikipedia's Inter 1964–65 season page describes the goal as the "definitivo suggello apposto da Facchetti in
 * proiezione offensiva" — the final seal, put on by Facchetti pushing forward in attack. The lesson is the entry's `lesson` field.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, generic UA, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "1964–65 European Cup" (both semi-final boxes: date, time, score, scorers, San Siro, 76,601, referee José María Ortiz de
 *    Mendíbil (Spain); Liverpool won the first leg 3–1)  (wiki-1964-65-european-cup.txt)
 *  - it.wikipedia, "Football Club Internazionale 1964-1965" (season story: the comeback inspired by Corso's free kick and Peiró's steal,
 *    "before the definitive seal put on by Facchetti in an attacking push"; beating the Liverpool keeper Tommy LAWRENCE; Facchetti 62';
 *    the kit table: home shirt blue with black stripes, black shorts, blue socks with a black band)  (itwiki-inter-1964-65.txt)
 *  - it.wikipedia, "Coppa dei Campioni 1964-1965" (Facchetti No. 3 in the final's line-up)  (itwiki-coppa-campioni-1964-65.txt)
 *  - Wikipedia, "Giacinto Facchetti" (left-back, 1.91 m, "one of the first prominent attacking full-backs", "attacking runs down the left
 *    flank", "his tendency to cut into the centre in order to strike on goal, which was very unusual for full-backs at the time")
 *    (wiki-giacinto-facchetti.txt)
 *  - The Guardian, Brian Glanville, "Giacinto Facchetti" obituary, 11 Sep 2006 (quoted above; "despite being essentially right-footed" he was
 *    turned into a left back "with licence to move into attack")  (guardian-facchetti-obit-2006.txt)
 * CONFIRMED by those accounts: the match, date, venue, crowd, referee; 2–0 at the time of the goal (Corso 8', Peiró 9') and that the third
 *  goal took Inter through; Facchetti scored it, from left-back, going forward in attack; the Liverpool keeper was Tommy Lawrence; Inter went
 *  on to win the 1965 European Cup; Facchetti was right-footed, tall (1.91 m), and known for cutting inside to shoot; Inter's home kit that
 *  season (blue-and-black stripes, black shorts, blue socks).
 * INFERRED (illustrative, never narrated as fact): the whole build-up — Suárez's pass out to Corso on the left, Facchetti's overlap outside
 *  Corso, Corso's left-footed pass into his path, the touch inside and the RIGHT-footed shot into the far corner (his stronger foot, but the
 *  foot for THIS goal is not in the sources, so the narration never names it); every position, path and timing; that Inter wore the home
 *  stripes that night (their home tie) and long sleeves; Liverpool's all-red strip (adopted in Nov 1964) with white collars; the numbers of
 *  everyone but Facchetti (Inter's usual 1–11: Sarti, Burgnich, Facchetti, Bedin, Guarneri, Picchi, Jair, Mazzola, Peiró, Suárez, Corso;
 *  Liverpool's shown as numbers only, no names); Lawrence's dark jersey and his dive; the white ball; which end Inter attacked and the
 *  director's camera on the main stand; San Siro drawn as the 1965 two-ring open bowl with four corner floodlight pylons; the crowd colours;
 *  the celebration. The newsreel look (vignette, flicker, film scratches) and the scoreboard tab are the film's framing, not the broadcast's.
 *
 * FRAMING (a 1960s TV/newsreel broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera,
 * near real time, panning with the move (a "2-0" tab turns to "3-0" on "Goal"); 2 = slow replay from a low touchline camera running beside
 * him: the overlap and his run (his ring, the dashed run still to come); 3 = the reverse-angle replay from behind the goal: the shot, the
 * dive, the net, the celebration, a European Cup stamp; 4 = the lesson on the left flank: their box lights up, his run forward, and the
 * extra passing option he gives (a second pass line to him). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed
 * through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times
 * the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,crescent} from '../../paths/riso/shapes';
import {beats,shotAt,reframe,near,steady,type View as DView,type Keep,type Pin} from './director';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue times (≈2.6 words/s with pauses at punctuation) until the recorded voice exists. `at` = word onset (s); `seconds` = clip
 * length incl. the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it) and
 * start with a plain word (Kokoro splits contractions and hyphenated words). */
function prov(label:string,text:string,cues:string[]):{label:string;narration:string;seconds:number;cues:{at:number;words:string}[]}{
 const words=text.split(/\s+/),onset:number[]=[],starts:number[]=[];let t=.2,ci=0;
 words.forEach(w=>{starts.push(ci);ci+=w.length+1;onset.push(t);t+=.27+.01*w.length;if(/\.\.\.$/.test(w))t+=.45;else if(/[.!?]$/.test(w))t+=.35;else if(/[,;:]$/.test(w))t+=.18;});
 let from=0;const out=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('facchetti-signature: cue '+c);from=k+c.length;let wi=0;while(wi+1<starts.length&&starts[wi+1]<=k)wi++;return{at:+onset[wi].toFixed(2),words:c};});
 return{label,narration:text,seconds:+(t+1).toFixed(2),cues:out};}
const TIMING=[
 prov('The goal, live','San Siro, 1965. Inter lead Liverpool two-nil; one more goal sends them to the final. Look who is charging forward... the left-back, Giacinto Facchetti! He shoots... Goal!',
  ['San Siro','Inter lead Liverpool','one more goal','the final','Look who','charging forward','the left-back','Giacinto Facchetti','He shoots','Goal']),
 prov('Watch it again','Watch again, slowly. A defender, sprinting up the pitch like an attacker. Back then, defenders hardly ever did that!',
  ['Watch again','A defender','sprinting up','like an attacker','Back then','hardly ever']),
 prov('Behind the goal','From behind the goal: the shot flies past the keeper, Tommy Lawrence. Inter were off to the final, and won the European Cup!',
  ['From behind','shot flies','past the keeper','Tommy Lawrence','Inter were off','the final','and won','the European Cup']),
 prov('Your turn','Your turn: when your team attacks, the full-back runs forward too. That gives your team one more option!',
  ['Your turn','when your team attacks','the full-back','runs forward','That gives','one more option']),
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py facchetti-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/facchetti-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-facchetti-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/facchetti-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING,VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('facchetti-signature: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>{const z=cam(s,0,0,1);DV={w:s.W/z,h:s.H/z};return view(s,z);};
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1566,h:1080};
/** samples per steady() window (heat: each is one reframe, no drawing) */
const STEADY_N=3;
/** the visible sheet rectangle in world units and world units per css px */
function screenBox(s:Sheet){const pw=s.width*s.dpr,ph=s.height*s.dpr,a=s.toWorld(0,0),b=s.toWorld(pw,ph);return{x0:Math.min(a[0],b[0]),y0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),y1:Math.max(a[1],b[1]),k:Math.abs(b[0]-a[0])/Math.max(1,s.width)};}

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Inter attack +X, Liverpool's goal line at 105), Y up, Z across (0 = the
 * middle, −34 = the near touchline under the main-stand camera = Inter's LEFT flank, Facchetti's wing). */
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
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** newsreel gate weave: a tiny seeded jolt of the camera target, changing on twos */
const weave=(t:number,amt=.12):V3=>{const n=Math.floor(t*12);return[(hash(n,11)-.5)*amt,(hash(n,12)-.5)*amt*.6,(hash(n,13)-.5)*amt];};

// ---------------------------------------------------------------- San Siro, 1965, at night: an open two-ring bowl, four corner floodlight pylons
const CX=52.5,NS=52;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a rounded rectangle), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(62+d)*Math.sign(c)*Math.pow(Math.abs(c),.55),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.55)];}
const LOW=(b:number):[number,number]=>[2+24*b,1+13*b],UP=(b:number):[number,number]=>[27+24*b,17+19*b];
type Bowl={low:V3[][];band:V3[][];up:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],band:[],up:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number]):V3[]=>{const[d0,y0]=f(0),[d1,y1]=f(1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW));o.up.push(Q(UP));o.band.push([rim(a,26,14),rim(b,26,14),rim(b,27.5,17.2),rim(a,27.5,17.2)]);
  for(const [f,rows,up] of [[LOW,7,false],[UP,6,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),29);if(h<.16)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,6)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** the four corner pylons (lattice towers outside the bowl, a bank of lamps on top) */
const PYLONS:V3[]=[[-24,0,-78],[129,0,-78],[129,0,78],[-24,0,78]],PYL_H=56;
function pylons(s:Sheet,c:Cam,v:View){
 const mast=new Path2D(),lamp=new Path2D(),glow=new Path2D();let n=0;
 for(const P of PYLONS){const d=toCam(c,[P[0],30,P[2]])[2];if(d<30)continue;const g0=pr(c,P),g1=pr(c,[P[0],PYL_H,P[2]]);if(!g0||!g1)continue;if(!inView(v,g1,200)&&!inView(v,g0,200))continue;
  const w0=c.F*2.2/d,w1=c.F*.9/d;mast.addPath(polyPath([[g0[0]-w0,g0[1]],[g0[0]+w0,g0[1]],[g1[0]+w1,g1[1]],[g1[0]-w1,g1[1]]],true));
  const lw=c.F*5/d,lh=c.F*3.4/d;lamp.rect(g1[0]-lw,g1[1]-lh,lw*2,lh);
  glow.addPath(polyPath(Array.from({length:12},(_,k)=>[g1[0]+Math.cos(k/12*TAU)*lw*2.4,g1[1]-lh*.5+Math.sin(k/12*TAU)*lh*2.2] as Pt),true));n++;}
 if(!n)return;s.tone(Y,glow,.3);s.fill(K,mast,.8);s.knockout(lamp);s.fill(Y,lamp,.95);}
/** everything behind the pitch: the night sky, the pylons, the bowl, the crowd (roar lifts the seat marks, flash = flashbulbs) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 const sky=rectPath(-1e4,-1e4,2e4,2e4);s.tone(K,sky,.86);s.tone(B,sky,.3);
 pylons(s,c,v);
 const low=new Path2D(),up=new Path2D(),band=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(BOWL.up[i],up);add(BOWL.band[i],band);add(BOWL.low[i],low);}
 s.knockout(up);s.tone(B,up,.4);s.tone(K,up,.42);
 s.knockout(low);s.tone(B,low,.36);s.tone(K,low,.26);
 // the crowd: Inter blue and black (most), white shirts and scarves, a pocket of Liverpool red
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.36?0:q.h<.66?1:q.h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(B,inks[1],.9);s.fill(K,inks[2],.85);s.fill(R,inks[3],.85);
 s.knockout(band);s.fill(K,band,.9);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,5)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12+3);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the floodlit grass (no running track at San Siro) with mowing stripes, the paper lines, the goals (the one at 105 later if asked) */
function ground(s:Sheet,c:Cam,o:{goalLater?:boolean}={}){
 const ap=polyP(c,Array.from({length:48},(_,i)=>rim(i/48*TAU,0,0)));if(ap.length>2){const p=polyPath(ap,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.9);s.tone(K,p,.2);}
 const g=polyP(c,[[-4,0,-38],[109,0,-38],[109,0,38],[-4,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.82);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 for(const [x,z,a0] of [[0,-34,0],[105,-34,Math.PI/2],[105,34,Math.PI],[0,34,-Math.PI/2]] as [number,number,number][])circ(x,z,1,a0,a0+Math.PI/2,4);
 s.knockout(ln);
 goal3(s,c,0,-1);
 if(!o.goalLater)goal3(s,c,105,1);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge = the net pushed back where the ball hit (0..1) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge=0){
 const z0=-3.66,z1=3.66,H=2.44,bk=(y:number,z:number)=>X+d*(2+bulge*.7*Math.exp(-((z-2.8)**2)/1.4-((y-.9)**2)/.8));
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bk(1.9,z0),1.9,z0],[bk(0,z0),0,z0]],[[X,0,z1],[X,H,z1],[bk(1.9,z1),1.9,z1],[bk(0,z1),0,z1]],[[X,H,z0],[X,H,z1],[bk(1.9,z1),1.9,z1],[bk(1.9,z0),1.9,z0]]];
 const back:V3[]=[];for(let i=0;i<=8;i++){const z=lerp(z0,z1,i/8);back.push([bk(0,z),0,z]);}for(let i=8;i>=0;i--){const z=lerp(z0,z1,i/8);back.push([bk(1.9,z),1.9,z]);}planes.push(back);
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bk(1.9,z),1.9,z],.025,mesh);for(let j=0;j<3;j++){const y0=1.9*j/3,y1=1.9*(j+1)/3;seg3(c,[bk(y1,z),y1,z],[bk(y0,z),y0,z],.025,mesh);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=lerp(z0,z1,i/4),zb=lerp(z0,z1,(i+1)/4);seg3(c,[bk(y,za),y,za],[bk(y,zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[bk(y,z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bk(y,z1),y,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
// skin: one flat screen + at most one light screen (athlete.ts guidance); tones are illustrative
const LIGHT:InkFill[]=[[R,.2],[Y,.45]],OLIVE:InkFill[]=[[R,.35],[Y,.6],[K,.18]],DARK:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** Inter at home in 1964–65 (it.wikipedia kit table): blue shirt with black stripes, black shorts, blue socks; long sleeves (inferred) */
const INT=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:[K,.95],shorts:[K,.95],socks:B,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',numberInk:'paper',seed:4,...o});
/** Liverpool all in red (inferred for this night), white collars */
const LFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:R,socks:R,boots:K,skin:LIGHT,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.3],sleeves:'long',numberInk:'paper',seed:30,...o});
/** Giacinto Facchetti: No. 3, 1.91 m, dark hair */
const FAC_STYLE=INT(LIGHT,{number:3,build:{height:1.91,bulk:1.04,thighs:1.06},seed:23});
/** Tommy Lawrence: a dark keeper's jersey (inferred), stocky */
const LAWRENCE:AthleteStyle={shirt:[K,.7],shorts:[K,.85],socks:[K,.7],boots:K,skin:LIGHT,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',trim:'paper',build:{height:1.8,bulk:1.12},seed:51};
const SARTI:AthleteStyle={shirt:[K,.55],shorts:[K,.85],socks:[K,.55],boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,sleeves:'long',seed:52};
/** the referee, Ortiz de Mendíbil: black (navy) */
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:LIGHT,hair:[K,.8],hairStyle:'balding',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds; 0 = Facchetti in full stride past Corso's line)
type Role='int'|'lfc'|'gk'|'ref';
type Act={kind:'kick'|'lunge'|'dive';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];acts?:Act[];dribble?:[number,number,'l'|'r'][];engage?:[number,number,number];key?:boolean;cheer?:number};
const FAC=0,CORSO=1,SUAREZ=2,MAZZOLA=3,PEIRO=4,RB=5,RM=6,CB5=7,CB4=8,LAW=9;
const PASS1=-2.4,RECV1=-1.3,PASS2=1.9,RECV2=3.1,SHOT=4.15,LINE_T=4.62,NET_T=4.8;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Every position is inferred (see the header). */
const ACTORS:Actor[]=[
 {name:'Facchetti',role:'int',style:FAC_STYLE,key:true,dribble:[[RECV2,SHOT,'r']],acts:[{kind:'kick',at:SHOT,dur:1,side:'r',power:.95}],cheer:5.1,
  keys:[[-8,33,-24],[-5,39,-26],[-3,46,-28],[-1.3,55,-29.5],[0,63,-30.4],[1,70.5,-30.4],[2,77.5,-28.6],[2.8,82.8,-25],[RECV2,84.9,-23.3],[3.6,87.6,-20.4],[SHOT,90.2,-17.1],[4.6,91.8,-15.9],[5.4,93.4,-17.6],[6.6,95,-22.5],[8,96,-27.5],[11,96.5,-29]]},
 {name:'Corso',role:'int',style:INT(LIGHT,{number:11,seed:11}),key:true,dribble:[[RECV1,PASS2,'l']],acts:[{kind:'kick',at:PASS2,dur:.8,side:'l',power:.5}],cheer:5.6,
  keys:[[-8,60,-20],[-4,63,-23],[RECV1,66,-24],[0,68.4,-22.6],[1.2,70.6,-21.6],[PASS2,71.5,-21.2],[3,74,-20],[5,80,-19],[7,90,-21],[9,93.5,-25],[11,94,-26.5]]},
 {name:'Suárez',role:'int',style:INT(OLIVE,{number:10,seed:10}),key:true,dribble:[[-8,PASS1,'r']],acts:[{kind:'kick',at:PASS1,dur:.8,side:'r',power:.55}],
  keys:[[-8,48,-4],[-5,52,-5],[PASS1,56,-6],[0,60,-7],[4,68,-8],[11,76,-10]]},
 {name:'Mazzola',role:'int',style:INT(LIGHT,{number:8,seed:8}),key:true,cheer:5.3,
  keys:[[-8,78,-4],[0,86,-5],[3,93,-5],[SHOT,96,-4],[6,95,-12],[8,95.2,-22],[11,95.5,-25]]},
 {name:'Peiró',role:'int',style:INT(OLIVE,{number:9,seed:9}),key:true,cheer:5.8,
  keys:[[-8,80,6],[0,88,5],[3,95,4],[SHOT,97.5,3],[6.5,97,-8],[9,96.8,-20],[11,97,-24]]},
 {name:'RB 2',role:'lfc',style:LFC({number:2,seed:32}),key:true,engage:[-2,PASS2,CORSO],acts:[{kind:'lunge',at:PASS2+.05,dur:.8,side:'r'}],
  keys:[[-8,80,-20],[-3,76,-22],[0,73.2,-22.2],[1.5,72.8,-21.8],[PASS2,73,-21.6],[3,77,-22.2],[SHOT,83.5,-19.5],[6,87,-17],[11,88,-15]]},
 {name:'RM 7',role:'lfc',style:LFC({number:7,seed:37}),key:true,
  keys:[[-8,52,-16],[-3,58,-21],[0,64.5,-25],[2,73,-26.5],[RECV2,79,-24.5],[SHOT,85,-21],[6,88,-19],[11,89,-18]]},
 {name:'CB 5',role:'lfc',style:LFC({number:5,build:{height:1.87,bulk:1.12},seed:35}),key:true,acts:[{kind:'lunge',at:SHOT+.08,dur:.8,side:'l'}],
  keys:[[-8,88,-3],[0,90,-6],[2,91,-8.5],[RECV2,92,-10.5],[SHOT,93.4,-11.2],[5,94.3,-11],[11,95,-10]]},
 {name:'CB 4',role:'lfc',style:LFC({number:4,seed:34}),key:true,
  keys:[[-8,90,6],[0,92,2],[3,95,0],[SHOT,97,.5],[6,98,1],[11,98.5,1.5]]},
 {name:'Lawrence',role:'gk',style:LAWRENCE,key:true,acts:[{kind:'dive',at:LINE_T-.04,dur:.9,side:'l'}],
  keys:[[-8,100,-1],[0,101.5,-3],[RECV2,102.4,-4.6],[SHOT,102.7,-4],[11,102.7,-4]]},
 {name:'LB 3',role:'lfc',style:LFC({number:3,seed:33}),keys:[[-8,88,14],[0,91,10],[SHOT,95,8],[11,97,7]]},
 {name:'LFC 6',role:'lfc',style:LFC({number:6,seed:36}),keys:[[-8,70,-6],[0,78,-6],[SHOT,86,-4],[11,90,-3]]},
 {name:'LFC 8',role:'lfc',style:LFC({number:8,seed:38}),keys:[[-8,62,6],[0,70,4],[SHOT,80,2],[11,86,2]]},
 {name:'LFC 10',role:'lfc',style:LFC({number:10,seed:40}),keys:[[-8,56,14],[0,64,12],[SHOT,74,10],[11,80,9]]},
 {name:'LFC 9',role:'lfc',style:LFC({number:9,seed:39}),keys:[[-8,48,2],[0,54,0],[11,64,-2]]},
 {name:'LFC 11',role:'lfc',style:LFC({number:11,seed:41}),keys:[[-8,58,24],[0,66,20],[11,80,16]]},
 {name:'Jair',role:'int',style:INT(DARK,{number:7,seed:7}),keys:[[-8,72,24],[0,82,20],[SHOT,90,16],[11,92,12]]},
 {name:'Bedin',role:'int',style:INT(LIGHT,{number:4,seed:14}),keys:[[-8,46,8],[0,52,6],[11,64,4]]},
 {name:'Picchi',role:'int',style:INT(LIGHT,{number:6,hairStyle:'balding',seed:16}),keys:[[-8,34,0],[0,40,0],[11,48,0]]},
 {name:'Guarneri',role:'int',style:INT(LIGHT,{number:5,seed:15}),keys:[[-8,38,-10],[0,42,-10],[11,50,-8]]},
 {name:'Burgnich',role:'int',style:INT(LIGHT,{number:2,seed:12}),keys:[[-8,40,20],[0,46,18],[11,56,14]]},
 {name:'Sarti',role:'gk',style:SARTI,keys:[[-8,10,0],[11,16,0]]},
 {name:'referee',role:'ref',style:REF,keys:[[-8,62,4],[0,72,-4],[SHOT,80,-8],[11,86,-10]]},
];
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-8,T1=11,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
function headOf(k:number,tau:number):[number,number]{for(const dt of [0,-.3,-.7,.4]){const v=velOf(k,tau+dt),l=Math.hypot(v[0],v[1]);if(l>.6)return[v[0]/l,v[1]/l];}return[1,0];}
/** the ball spot at an actor's foot: ahead and a touch to the kicking side (right = (−fz, fx)) */
const footAt=(k:number,tau:number,side:'l'|'r'='r',ahead=.5):V3=>{const p=posOf(k,tau),[fx,fz]=headOf(k,tau),s=side==='r'?.14:-.14;return[p[0]+fx*ahead-fz*s,.11,p[1]+fz*ahead+fx*s];};

// ---------------------------------------------------------------- the ball: Suárez → Corso, Corso → Facchetti's run, the touch inside, the shot, the net
const LINE:V3=[105.1,.78,2.62],NETP:V3=[106.6,.9,2.9],REST:V3=[106.2,.11,2.5];
type Leg={t0:number;t1:number;a:()=>V3;b:()=>V3;h:number;ease?:number};
const LEGS:Leg[]=[
 {t0:PASS1,t1:RECV1,a:()=>footAt(SUAREZ,PASS1),b:()=>footAt(CORSO,RECV1,'l'),h:.4,ease:.35},
 {t0:PASS2,t1:RECV2,a:()=>footAt(CORSO,PASS2,'l'),b:()=>footAt(FAC,RECV2,'r'),h:.15,ease:.3},
 {t0:SHOT,t1:LINE_T,a:()=>footAt(FAC,SHOT,'r'),b:()=>LINE,h:.22,ease:.08},
 {t0:LINE_T,t1:NET_T,a:()=>LINE,b:()=>NETP,h:0,ease:.4},
 {t0:NET_T,t1:5.4,a:()=>NETP,b:()=>REST,h:0,ease:.5},
];
const HOLDS:[number,number,number,'l'|'r'][]=[[-99,PASS1,SUAREZ,'r'],[RECV1,PASS2,CORSO,'l'],[RECV2,SHOT,FAC,'r']];
function ballAt(tau:number):V3{
 for(const [a,b,k,f] of HOLDS)if(tau>=a&&tau<b){const p=footAt(k,tau,f,.5),pulse=.22*Math.max(0,Math.sin(distOf(k,tau)/2.2*TAU));const[fx,fz]=headOf(k,tau);return[p[0]+fx*pulse,.11,p[2]+fz*pulse];}
 for(const L of LEGS)if(tau>=L.t0&&tau<L.t1){const a=L.a(),b=L.b(),u=(tau-L.t0)/(L.t1-L.t0),e=lerp(u,1-(1-u)*(1-u),L.ease??0);
  return[lerp(a[0],b[0],e),lerp(a[1],b[1],e)+L.h*4*e*(1-e),lerp(a[2],b[2],e)];}
 return REST;
}
/** how far the net is pushed back (0..1) */
const netBulge=(tau:number)=>tau<LINE_T+.05?0:Math.exp(-(tau-NET_T)*2.2)*clamp((tau-LINE_T)/.15)*(1+.25*Math.sin((tau-NET_T)*16));

// ---------------------------------------------------------------- poses
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the 1960s goal celebration: both arms straight up, chin up */
const ARMS_UP:Partial<Pose>={lShF:165,rShF:165,lShA:26,rShA:26,lElb:12,rElb:12,lHand:.8,rHand:.8,neckP:-24,lean:-2};
/** Liverpool heads drop */
const SLUMP:Partial<Pose>={neckP:24,lean:20,lShF:-6,rShF:-6,lShA:10,rShA:10,lElb:20,rElb:20};
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),hd=headOf(k,tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):Math.hypot(b[0]-x,b[2]-z)<1.4?yawOf(hd[0],hd[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage){const[e0,e1,tk]=a.engage,m=posOf(tk,tau);if(tau>e0&&tau<e1+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(e0,e0+.4,tau),1-sm(e1,e1+.4,tau)));}
 // the keeper faces the shooter and keeps that heading through the dive (his yaw is frozen once the shot is struck)
 if(a.role==='gk'&&k===LAW){const bs=ballAt(Math.min(tau,SHOT)),ps=posOf(LAW,Math.min(tau,SHOT));yaw=yawOf(bs[0]-ps[0],bs[2]-ps[1]);}
 if(a.role==='ref'&&sp<.4)yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='lfc'?READY:stand();
 const dr=a.dribble?.find(d=>tau>d[0]-.2&&tau<d[1]+.3);
 if(dr){const w=Math.min(sm(dr[0]-.2,dr[0]+.2,tau),1-sm(dr[1],dr[1]+.3,tau));const run=runCycle(distOf(k,tau)/3.6,{speed:clamp((sp-2)/5)}),db=dribble(distOf(k,tau)/2.6,{foot:dr[2],speed:.45+.45*clamp((sp-1.5)/4)});
  p=blendPose(blendPose(idle,run,clamp((sp-.4)/.9)),db,w*clamp((sp-.2)/.6+.4)*(k===FAC?.75:1));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.2);p=blendPose(idle,runCycle(distOf(k,tau)/(k===FAC?4.1:3.4),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.acts??[]){
  if(mv.kind==='kick'){const st=mv.at-STRIKE_CONTACT*mv.dur,u=(tau-st)/mv.dur;
   if(u>0&&u<1.45){const w=Math.min(sm(0,.18,u),1-sm(1,1.45,u)),b0=ballAt(mv.at+.02),b1=ballAt(mv.at+.25),aim=yawOf(b1[0]-b0[0],b1[2]-b0[2]);
    p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.6}),w);yaw=lerpA(yaw,aim,w*sm(0,.4,u));}}
  if(mv.kind==='lunge'){const t0=mv.at-.6*mv.dur,u=(tau-t0)/mv.dur;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
  if(mv.kind==='dive'){const t0=mv.at-.55*mv.dur,u=(tau-t0)/mv.dur;if(u>0){const w=sm(0,.1,u)*(1-sm(2.6,3.4,u));p=blendPose(p,keeperDive(Math.min(1,u),{side:mv.side,height:.3}),w);}}
 }
 if(a.cheer!==undefined&&tau>a.cheer)p=over(p,ARMS_UP,sm(a.cheer,a.cheer+.4,tau)*(k===FAC?1:.85));
 if(a.role==='lfc'&&tau>LINE_T+.6)p=over(p,SLUMP,sm(LINE_T+.6,LINE_T+1.4,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- the white floodlight ball (paper, blue shade, navy stitched panels; inferred)
function ball(s:Sheet,x:number,y:number,r:number,spin:number){
 const disc=polyPath(Array.from({length:24},(_,i)=>{const a=i/24*TAU;return[x+Math.cos(a)*r,y+Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);s.tone(B,crescent(x,y,r*1.02,[-.4,-.45]),.5);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=6;i++){const u=i/6*2-1,px=u*r*.95,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([x+px*ca-py*sa,y+px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.2,r*.05),.8);s.stroke(K,disc,Math.max(1.5,r*.08),.95);
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;heroes:Map<number,DrawResult>};
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:number;after?:(r:PlayOut)=>void;rings?:[number,number,string][]}={}):PlayOut{
 const{minBall=6,hero=-1,rings=[]}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.16,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 for(const [rk,w,ink] of rings){if(w<=.01)continue;const[x,z0]=posOf(rk,tau),z=z0+(rk===LAW?2.2*sm(LINE_T-.5,LINE_T+.3,tau):0),pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*.95,0,z+Math.sin(i/36*TAU)*.8]);if(q)pts.push(q);}
  if(pts.length>30){const q=toCam(c,[x,0,z]),rr=ribbon(pts,Math.max(5,c.F*.1/q[2]),{close:true,seed:43+rk,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d;const heroes=new Map<number,DrawResult>();if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(a.key||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:e.k===hero}:{});
  if(a.key)heroes.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,heroes};
 o.after?.(out);
 return out;
}
/** the replay wipe: long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** THE NEWSREEL LOOK (1965 TV film): a rounded vignette, a soft flicker, bright scratches and dust that change on twos. ≤ 5 ops. */
function newsreel(s:Sheet,t:number,amt=1){if(amt<=.01)return;const bx=screenBox(s),k=bx.k,W=bx.x1-bx.x0,H=bx.y1-bx.y0,T12=Math.floor(t*12);
 const vg=new Path2D();vg.rect(bx.x0-20*k,bx.y0-20*k,W+40*k,H+40*k);
 const rr=(ix:number,iy:number,rad:number):Pt[]=>{const pts:Pt[]=[];const cx0=bx.x0+ix+rad,cx1=bx.x1-ix-rad,cy0=bx.y0+iy+rad,cy1=bx.y1-iy-rad;
  for(const [cx,cy,a0] of [[cx1,cy0,-Math.PI/2],[cx1,cy1,0],[cx0,cy1,Math.PI/2],[cx0,cy0,Math.PI]] as [number,number,number][])for(let i=0;i<=5;i++){const a=a0+i/5*Math.PI/2;pts.push([cx+Math.cos(a)*rad,cy+Math.sin(a)*rad]);}return pts;};
 const m=Math.min(W,H);vg.addPath(polyPath(rr(W*.015,H*.02,m*.16),true));s.tone(K,vg,.5*amt,undefined,'evenodd');
 const vg2=new Path2D();vg2.rect(bx.x0-20*k,bx.y0-20*k,W+40*k,H+40*k);vg2.addPath(polyPath(rr(W*.06,H*.08,m*.2),true));s.tone(K,vg2,.16*amt,undefined,'evenodd');
 // flicker: the whole frame breathes a little darker on some drawings
 const fl=hash(T12,71);if(fl>.55)s.tone(K,rectPath(bx.x0,bx.y0,W,H),.05*amt*(fl-.4)/.6);
 // scratches (bright vertical hairlines) and dust (dark specks)
 const sc=new Path2D();for(let i=0;i<3;i++){if(hash(T12*3+i,72)<.45)continue;const x=bx.x0+W*(.08+.84*hash(T12*7+i,73)),y0=bx.y0+H*hash(T12+i,74)*.4,y1=y0+H*(.3+.6*hash(T12+i,75)),w=(.8+.8*hash(i,T12))*k;
  sc.moveTo(x,y0);sc.lineTo(x+w,y0);sc.lineTo(x+w+2*k*Math.sin(i+T12),y1);sc.lineTo(x+2*k*Math.sin(i+T12),y1);sc.closePath();}
 s.knockout(sc,.75*amt);
 const du=new Path2D();for(let i=0;i<4;i++){if(hash(T12*5+i,76)<.5)continue;const x=bx.x0+W*hash(T12*11+i,77),y=bx.y0+H*hash(T12*13+i,78),z=(1.5+3*hash(i,T12+9))*k;du.addPath(polyPath(blob(x,y,z,z*.6,T12+i,{amp:.3,n:7}),true));}
 s.fill(K,du,.7*amt);}
/** the score tab, top left: a striped Inter chip, digits in paper segments, a red Liverpool chip; w = 0..1 (slides in) */
const SEG:Record<string,string>={'0':'abcdef','2':'abdeg','3':'abcdg','-':'g'};
function scoreTab(s:Sheet,w:number,text:string,pop=0){if(w<=.01)return;const bx=screenBox(s),k=bx.k,h=22*k,x=bx.x0+18*k-(1-w)*150*k,y=bx.y0+16*k,dw=h*.42,dh=h*.64,t=h*.1,gap=h*.2;
 const tw=h*.5+text.length*(dw+gap)+h*.55;
 const tab=new Path2D();tab.rect(x,y,tw,h);s.knockout(tab,.9*w);s.fill(K,tab,.95*w);
 const ci=new Path2D();ci.rect(x+h*.14,y+h*.18,h*.26,dh);s.fill(B,ci,.95*w);const cs=new Path2D();cs.rect(x+h*.2,y+h*.18,h*.07,dh);cs.rect(x+h*.33,y+h*.18,h*.07,dh);s.knockout(cs,.5*w);
 const cl=new Path2D();cl.rect(x+tw-h*.4,y+h*.18,h*.26,dh);s.fill(R,cl,.95*w);
 const dg=new Path2D();[...text].forEach((ch,i)=>{const ox=x+h*.55+i*(dw+gap),oy=y+h*.18-(i===0?pop*h*.2:0),S:Record<string,[number,number,number,number]>={a:[ox,oy,dw,t],b:[ox+dw-t,oy,t,dh/2],c:[ox+dw-t,oy+dh/2,t,dh/2],d:[ox,oy+dh-t,dw,t],e:[ox,oy+dh/2,t,dh/2],f:[ox,oy,t,dh/2],g:[ox,oy+dh/2-t/2,dw,t]};
  for(const sg of SEG[ch]??'')dg.rect(...S[sg]);});
 s.knockout(dg,w);if(pop>0)s.fill(Y,dg,.9*pop);}

// ---------------------------------------------------------------- teaching marks
function pathArrow(s:Sheet,c:Cam,k:number,ta:number,tb:number,w:number,ink:string,o:{seed?:number;dashed?:boolean;width?:number}={}){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=18;i++){const tau=ta+(tb-ta)*i/18,[x,z]=posOf(k,tau),q=toCam(c,[x,0,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=c.F*(o.width??.13)/d,seed=o.seed??61;
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8,gaps:o.dashed?[[.14,.22],[.36,.44],[.58,.66],[.8,.86]]:[]}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** a straight pass line on the grass between two ground points, drawn up to fraction w */
function passLine(s:Sheet,c:Cam,A:[number,number],Bq:[number,number],w:number,ink:string,seed:number,dashed=true){if(w<=0)return;
 const pts:Pt[]=[];let d=10;for(let i=0;i<=12;i++){const u=i/12*w,q=toCam(c,[lerp(A[0],Bq[0],u),0,lerp(A[1],Bq[1],u)]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const wd=Math.max(5,c.F*.28/Math.max(4,d));
 s.knockout(ribbon(pts,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(pts,wd,{seed,taper:.1,wobble:.8,gaps:dashed?[[.14,.22],[.36,.44],[.58,.66],[.8,.86]]:[]}),.95);
 const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
function zone(s:Sheet,c:Cam,P:[number,number][],w:number,t:number,ink:string,seed:number){if(w<=0)return;
 const n=P.length,cx=P.reduce((a,p)=>a+p[0],0)/n,cz=P.reduce((a,p)=>a+p[1],0)/n,pts:Pt[]=[];
 for(let i=0;i<n*6;i++){const a=P[Math.floor(i/6)],b=P[(Math.floor(i/6)+1)%n],u=(i%6)/6,br=1+.03*Math.sin(t*5)*w;const q=pr(c,[cx+(lerp(a[0],b[0],u)-cx)*br,0,cz+(lerp(a[1],b[1],u)-cz)*br]);if(q)pts.push(q);}
 if(pts.length<n*4)return;const zp=polyPath(pts,true);s.tone(ink,zp,.6*w);s.knockout(zp,.2*w);
 const q=toCam(c,[cx,0,cz]);s.fill(ink,ribbon(pts,Math.max(5,c.F*.16/Math.max(4,q[2])),{close:true,seed,taper:0,wobble:1.4,gaps:[[.1,.16],[.3,.36],[.5,.56],[.7,.76],[.9,.96]]}),.95*w);}
const ATT_ZONE:[number,number][]=[[88.5,-20],[104,-20],[104,20],[88.5,20]];
/** a "+1" in paper segments on a yellow disc, floating over a ground point (the extra option) */
function plusOne(s:Sheet,c:Cam,x:number,z:number,w:number,t:number){if(w<=.01)return;const g=pr(c,[x,2.6,z]);if(!g)return;const d=toCam(c,[x,2.6,z])[2],r=clamp(c.F*.55/d,14,60)*easeOutBack(clamp(w))*(1+.04*Math.sin(t*6));
 const disc=polyPath(Array.from({length:20},(_,i)=>[g[0]+Math.cos(i/20*TAU)*r,g[1]+Math.sin(i/20*TAU)*r] as Pt),true);s.knockout(disc);s.fill(Y,disc,.95);s.stroke(K,disc,Math.max(2,r*.08),.9);
 const p=new Path2D(),u=r*.14;p.rect(g[0]-r*.62,g[1]-u/2,r*.56,u);p.rect(g[0]-r*.34-u/2,g[1]-r*.28,u,r*.56);p.rect(g[0]+r*.18,g[1]-r*.42,u*1.1,r*.84);p.moveTo(g[0]+r*.18,g[1]-r*.42);p.lineTo(g[0]+r*.18+u*1.1,g[1]-r*.42);p.lineTo(g[0]+r*.02,g[1]-r*.22);p.lineTo(g[0]-r*.02,g[1]-r*.3);p.closePath();
 s.fill(K,p,.95);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUEW(0,'Goal'),E=SECS(0);return key(t,[[0,-7.6],[CUEW(0,'Look who'),-1.7],[CUEW(0,'charging'),-.3],[CUEW(0,'the left-back'),1.3],[CUEW(0,'Giacinto'),2.6],[CUEW(0,'He shoots'),SHOT-.25],[G,LINE_T+.1],[E+1,LINE_T+.1+(E+1-G)*.9]],linear);};
const CAM1:V3=[50,31,-92];
/** Director beats (lib/plays/riso/director.ts, Oct 4 2026): a short establishing wide of the floodlit bowl, then follow Suárez on the ball;
 * pull out for his pass to Corso so Facchetti's run from left-back is in the same frame ("Look who is charging forward"), follow Facchetti
 * up the wing, pull out again for Corso's pass into his path (passer and runner both in shot), push in low for the shot, swung round
 * behind his shoulder so the keeper and the goal mouth stay in frame, and close on Facchetti's celebration after "Goal". The first pass
 * (a 20 m ball, Suárez to Corso) stays near the authored width: from this side camera nothing closer holds passer and receiver. */
const B1=beats([[0,'wide'],[1,{from:'follow',size:.4}],[CUEW(0,'the final')-1,{from:'space',size:.12,az:-35,ball:.1}],[CUEW(0,'Look who')-.1,{from:'follow',size:.4}],
 [CUEW(0,'the left-back')-.1,{from:'space',size:.3,ball:.15}],[CUEW(0,'He shoots')-.4,{from:'tight',az:-30,low:.5}],[CUEW(0,'Goal')+.3,'reaction']]);
const FOES=ACTORS.map((a,k)=>a.role==='lfc'||a.role==='gk'?k:-1).filter(k=>k>=0);
const at3=(k:number,tau:number,y=0):V3=>{const p=posOf(k,tau);return[p[0],y,p[1]];};
/** both feet-and-head points of a player as soft keeps of weight w */
const keepP=(k:number,tau:number,w:number):Keep[]=>w<=.01?[]:[{P:at3(k,tau),w},{P:at3(k,tau,1.85),w}];
/** the directed camera, averaged over ±.35 s (director steady(): the fit clamp and keep hand-overs become smooth moves) */
function cam1(t:number):Cam{const p=steady(t,dir1,.35,STEADY_N);return look(p.eye,p.target,p.F);}
function dir1(t:number):Pin{
 const a=cam1Authored(t),tau=tau1(t),sh=shotAt(t,B1),G=CUEW(0,'Goal'),lp=CUEW(0,'the final')-1,ch=CUEW(0,'charging'),lb=CUEW(0,'the left-back')-.1,hs=CUEW(0,'He shoots')-.4;
 // the centre of the shot, blended (never cut): Suárez on the ball; the middle of Suárez and Corso as he plays the first pass; the middle
 // of Corso and the charging Facchetti while it travels ("Look who"); Facchetti up the wing; the middle of Corso and Facchetti while Corso's
 // pass travels into his run; Facchetti again for the shot and after
 const f=CUEW(0,'the final'),su=posOf(SUAREZ,tau),co=posOf(CORSO,tau),fa=posOf(FAC,tau),cf:[number,number]=[(co[0]+fa[0])/2,(co[1]+fa[1])/2];
 const chain:[number,[number,number]][]=[[sm(lp+.2,lp+.9,t,easeInOutSine),[(su[0]+co[0])/2,(su[1]+co[1])/2]],[sm(f+.1,f+.7,t,easeInOutSine),cf],
  [sm(ch-.2,ch+.4,t,easeInOutSine),fa],[sm(lb-.3,lb+.3,t,easeInOutSine),cf],[sm(hs-.7,hs,t,easeInOutSine),fa]];
 let h=su;for(const[u,q] of chain)h=[lerp(h[0],q[0],u),lerp(h[1],q[1],u)];
 const hero:V3=[h[0],0,h[1]];
 const keep:Keep[]=near(hero,FOES.map(k=>at3(k,tau)),3.5,7);
 // the first pass: Suárez to Corso, then Corso and the charging Facchetti; the second: Corso (the passer) and his runner; the shot: the
 // keeper and the goal mouth
 const E=easeInOutSine,wS=Math.min(sm(lp+.4,lp+1.1,t,E),1-sm(f+.1,f+.8,t,E)),wC=Math.max(Math.min(sm(lp+.4,lp+1.1,t,E),1-sm(ch,ch+.7,t,E)),Math.min(sm(lb-.4,lb+.3,t,E),1-sm(hs-.8,hs-.1,t,E))),
  wF=Math.min(sm(f+.1,f+.8,t,E),1-sm(ch,ch+.7,t,E)),wG=Math.min(sm(hs-.1,hs+.6,t,E),1-sm(G+.2,G+.9,t,E));
 keep.push(...keepP(SUAREZ,tau,wS),...keepP(CORSO,tau,wC),...keepP(FAC,tau,wF),...keepP(LAW,tau,wG));
 if(wG>.01)for(const z of [-3.66,3.66])keep.push({P:[105,0,z],w:wG},{P:[105,2.44,z],w:wG});
 // after the goal the ball rests in the net: the focus hands over to Facchetti so the camera can close on the celebration
 const b=ballAt(tau),cu=sm(G+.1,G+.9,t,easeInOutSine),ball=lerp3(b,[fa[0],1,fa[1]],cu);
 const r=reframe({eye:a.C,target:a.T,F:a.F},{hero,ball,keep,height:1.9},sh,DV,{margin:.82});
 return r;
}
function cam1Authored(t:number):{C:V3;T:V3;F:number}{
 const tau=tau1(t),S=SECS(0);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.3),b2=bs(tau-.6),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // as he nears the box the director widens to hold the goal; after the goal he follows Facchetti's celebration
 const box=sm(2.4,4.2,tau),m=posOf(FAC,tau),cel=sm(LINE_T+.3,LINE_T+2,tau,easeInOutSine);
 const tb0:V3=[lerp(bt[0],95,box*.5),1.2,lerp(bt[2],-9,box*.45)],tb=lerp3(tb0,[m[0],1.2,m[1]],cel*.7);
 const open:V3=[52,4,4],toBall=sm(.2,CUEW(0,'Inter lead')+.8,t,easeInOutSine);
 const T=lerp3(open,tb,toBall),j=weave(t);
 const F=key(t,[[0,1600],[CUEW(0,'Inter lead'),3600],[CUEW(0,'Look who'),5200],[CUEW(0,'the left-back'),5000],[CUEW(0,'He shoots'),4300],[CUEW(0,'Goal'),5000],[S,6000]],easeInOutSine);
 return{C:CAM1,T:[T[0]+j[0]*8,T[1]+j[1]*8,T[2]+j[2]*8],F};
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Goal');
  stadium(s,c,v,t,{roar:sm(G-.1,G+.3,t),flash:bump(G,G+2.2,t)*.8});
  ground(s,c,{goalLater:true});
  const lb=CUEW(0,'the left-back');
  // "the left-back": a quick ring picks him out of the wide shot, gone before the shot
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8,hero:FAC,rings:[[FAC,sm(lb-.15,lb+.3,t,easeOutBack)*(1-sm(CUEW(0,'He shoots')-.3,CUEW(0,'He shoots'),t)),Y]]});
  goal3(s,c,105,1,netBulge(tau));
  newsreel(s,t);
  const sc=sm(CUEW(0,'Inter lead')-.2,CUEW(0,'Inter lead')+.35,t,easeOutBack);
  scoreTab(s,sc,t<G?'2-0':'3-0',bump(G,G+.9,t));
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(FAC,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9.5,
};

// ---------------------------------------------------------------- 2 · slow replay, a low touchline camera running beside him
const tau2=(t:number)=>key(t,[[0,-1.9],[CUEW(1,'A defender'),-.8],[CUEW(1,'sprinting'),.4],[CUEW(1,'like an'),1.9],[CUEW(1,'Back then'),RECV2],[CUEW(1,'hardly'),3.7],[SECS(1),SHOT+.1]],linear);
/** Director beats for the slow replay: the low running camera is already close, so it stays as authored for the overlap and the sprint;
 * on "Back then" it pushes in low on the touch — Corso's pass arriving in Facchetti's stride and his touch inside — with the chasing
 * defenders soft-kept in frame. */
const B2=beats([[0,'wide'],[CUEW(1,'Back then')-.4,'tight']]);
/** the directed camera, averaged over ±.35 s (director steady(): the fit clamp and keep hand-overs become smooth moves) */
function cam2(t:number):Cam{const p=steady(t,dir2,.35,STEADY_N);return look(p.eye,p.target,p.F);}
function dir2(t:number):Pin{
 const a=cam2Authored(t),tau=tau2(t),fa=posOf(FAC,tau),hero:V3=[fa[0],0,fa[1]];
 const r=reframe({eye:a.C,target:a.T,F:a.F},{hero,ball:ballAt(tau),keep:near(hero,FOES.map(k=>at3(k,tau)),3,6),height:1.9},shotAt(t,B2),DV);
 return r;
}
function cam2Authored(t:number):{C:V3;T:V3;F:number}{
 const tau=tau2(t),m=smooth(FAC,Math.min(tau,SHOT)),g=sm(2.6,SHOT,tau,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine),j=weave(t,.06);
 const C:V3=[m[0]-4.5-3*open+2*g,1.9+.8*g,-39+2.5*g];
 const T:V3=[lerp(m[0]+5,98,g*.7)+j[0],1+j[1],lerp(m[1]+1,-8,g*.6)+j[2]];
 return{C,T,F:lerp(2600,2100,g)-400*open};
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ad=CUEW(1,'A defender'),sp=CUEW(1,'sprinting'),la=CUEW(1,'like an'),bt=CUEW(1,'Back then'),he=CUEW(1,'hardly');
  stadium(s,c,v,t);
  ground(s,c);
  // "sprinting up the pitch": his run still to come, dashed yellow on the grass
  pathArrow(s,c,FAC,Math.max(tau,-1),RECV2+.4,sm(sp-.2,sp+.5,t,easeOut)*(1-sm(bt-.2,bt+.3,t)),Y,{dashed:true,seed:71});
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:FAC,rings:[[FAC,sm(ad-.15,ad+.3,t,easeOutBack)*(1-sm(la+.4,la+.9,t)),Y],[CORSO,sm(la-.3,la+.1,t,easeOutBack)*(1-sm(bt,bt+.4,t)),B]],after:({bg})=>{
   // "Back then": the pass arrives in his stride — a spark on the ball; "hardly ever": his touch inside
   for(const [T0,sd] of [[RECV2,77],[3.62,79]] as [number,number][]){const age=tau-T0;if(age>-.05&&age<.4&&bg)sparkBurst(s,Y,bg[0],bg[1],c.F*.5/Math.max(2,toCam(c,ballAt(tau))[2]),{n:9,seed:sd,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.22)/.15)),width:10});}
  }});
  newsreel(s,t);
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,bump(sp-.2,la+.6,t)*.4,27,.02);
  void he;
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(FAC,tau2(t)),q=toCam(c,[x,1.2,z]);if(q[2]<NEAR)return apertureDisc(0,0,10,12);const g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · reverse angle from behind the goal: the shot, the dive, the net, the celebration
const tau3=(t:number)=>{const E=SECS(2);return key(t,[[0,3.3],[CUEW(2,'shot flies'),SHOT-.02],[CUEW(2,'past the'),LINE_T-.02],[CUEW(2,'Tommy'),NET_T+.4],[CUEW(2,'Inter were'),6.2],[E,6.2+(E-CUEW(2,'Inter were'))*.75]],linear);};
/** Director beats for the reverse angle: hold the authored wide behind the goal through the replay wipe, pull in to frame the shooter and
 * the keeper together as "the shot flies", push in tight on Tommy Lawrence's dive as it goes "past the keeper" (the ball held in frame),
 * ease back to the authored camera while it pans from the keeper to the scorer (no close-up whip across 15 m), then close on Facchetti's
 * celebration for "Inter were off to the final". */
const B3=beats([[0,'wide'],[CUEW(2,'shot flies')-.8,{from:'space',size:.3}],[CUEW(2,'past the')-.35,'tight'],[CUEW(2,'Tommy')+.15,'wide'],[CUEW(2,'Inter were')-.3,'reaction']]);
/** the directed camera, averaged over ±.35 s (director steady(): the fit clamp and keep hand-overs become smooth moves) */
function cam3(t:number):Cam{const p=steady(t,dir3,.35,STEADY_N);return look(p.eye,p.target,p.F);}
function dir3(t:number):Pin{
 const a=cam3Authored(t),tau=tau3(t),fa=posOf(FAC,tau),lw0=posOf(LAW,tau),lw:[number,number]=[lw0[0],lw0[1]+2.2*sm(LINE_T-.5,LINE_T+.3,tau)],pk=CUEW(2,'past the'),iw=CUEW(2,'Inter were');
 // the centre of the shot, blended: Facchetti (the shooter) → Lawrence for the dive (where his dive lands, as his ring) → Facchetti for the
 // celebration, handed back on the authored camera's own pan to him (cel) so the hero never leaves the authored frame
 const cel=sm(LINE_T+.4,6.4,tau,easeInOutSine),u=Math.min(sm(pk-.6,pk,t,easeInOutSine),1-cel),hero:V3=[lerp(fa[0],lw[0],u),0,lerp(fa[1],lw[1],u)];
 // the shooter and the keeper both held as the shot is struck, then the keeper (now the hero) and the ball
 const E=easeInOutSine,wK=Math.min(sm(CUEW(2,'shot flies')-1.1,CUEW(2,'shot flies')-.4,t,E),1-sm(pk-.3,pk+.4,t,E)),wF=Math.min(wK,1-sm(pk-.4,pk+.3,t,E)),cu=sm(pk-.2,pk+.5,t,E);
 const keep:Keep[]=[...keepP(FAC,tau,wF),...(wK>.01?[{P:[lw[0],0,lw[1]] as V3,w:wK},{P:[lw[0],1.85,lw[1]] as V3,w:wK}]:[])];
 // once the ball is over the line (it ends in the net under the camera) the focus hands from the ball to the man in the shot
 const r=reframe({eye:a.C,target:a.T,F:a.F},{hero,ball:lerp3(ballAt(tau),[hero[0],1,hero[2]],cu),keep,height:1.9},shotAt(t,B3),DV);
 return r;
}
function cam3Authored(t:number):{C:V3;T:V3;F:number}{
 const tau=tau3(t),m=smooth(FAC,tau),cel=sm(LINE_T+.4,6.4,tau,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine),j=weave(t,.05);
 const C:V3=lerp3([113+2*open,6+.6*open,6],[104.5,2.8,-8],cel);
 const shotT:V3=[lerp(m[0],103,.42),.5,lerp(m[1],0,.42)];
 const T=lerp3(shotT,[m[0],1.3,m[1]],cel);
 return{C,T:[T[0]+j[0],T[1]+j[1],T[2]+j[2]],F:lerp(2700,2500,cel)-400*open};
}
/** the European Cup (the big-eared trophy), a newsreel stamp top right; w = 0..1 */
function cupStamp(s:Sheet,w:number,t:number){if(w<=.01)return;const bx=screenBox(s),k=bx.k,H=Math.min(bx.x1-bx.x0,bx.y1-bx.y0)*.3*easeOutBack(clamp(w)),cx=bx.x1-H*.75-16*k,by=bx.y0+H*1.1+14*k;
 const P=(u:number,v:number):Pt=>[cx+u*H,by-v*H];
 const body=polyPath([P(-.22,0),P(.22,0),P(.14,.08),P(.07,.14),P(.06,.4),P(.24,.52),P(.3,.8),P(-.3,.8),P(-.24,.52),P(-.06,.4),P(-.07,.14),P(-.14,.08)],true);
 const ears=new Path2D();for(const sgn of [-1,1]){const pts:Pt[]=[];for(let i=0;i<=14;i++){const a=-Math.PI*.55+i/14*Math.PI*1.25;pts.push(P(sgn*(.33+.17*Math.cos(a)),.62+.2*Math.sin(a)));}ears.addPath(ribbon(pts,Math.max(3,H*.06),{seed:81+sgn,taper:.1}));}
 const all=new Path2D();all.addPath(body);all.addPath(ears);s.knockout(all);s.fill(Y,all,.95);s.tone(R,body,.25);s.stroke(K,body,Math.max(1.5,H*.02),.9);
 sparkBurst(s,Y,cx-H*.1,by-H*.72,H*.9,{n:8,seed:97+Math.floor(t*6),g:.8*w,width:Math.max(3,H*.04)});}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),sf=CUEW(2,'shot flies'),pk=CUEW(2,'past the'),tl=CUEW(2,'Tommy'),iw=CUEW(2,'Inter were'),ec=CUEW(2,'the European');
  stadium(s,c,v,t,{roar:sm(pk,pk+.4,t),flash:Math.max(bump(pk,pk+2,t),.6*bump(ec-.2,ec+1.5,t))});
  ground(s,c,{goalLater:true});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:6,hero:FAC,rings:[[LAW,sm(tl-.2,tl+.2,t,easeOutBack)*(1-sm(iw-.3,iw,t)),R],[FAC,sm(iw-.2,iw+.3,t,easeOutBack),Y]],after:({bg})=>{
   const age=tau-SHOT;if(age>-.05&&age<.35&&bg)sparkBurst(s,Y,bg[0],bg[1],c.F*.6/Math.max(2,toCam(c,ballAt(tau))[2]),{n:10,seed:83,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.2)/.15)),width:12});
   void sf;}});
  // the goal nearest the camera goes over the players: its net is between us and them
  goal3(s,c,105,1,netBulge(tau));
  const g=pr(c,LINE);const ag=tau-LINE_T;if(g&&ag>0&&ag<.5)sparkBurst(s,Y,g[0],g[1],c.F*1.1/Math.max(3,toCam(c,LINE)[2]),{n:11,seed:85,g:easeOutBack(clamp(ag/.12))*(1-clamp((ag-.3)/.2)),width:14});
  newsreel(s,t);
  cupStamp(s,sm(ec-.25,ec+.35,t),t);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(FAC,tau3(t)),q=toCam(c,[x,1.3,z]);if(q[2]<NEAR)return apertureDisc(0,0,10,12);const g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:7.5,
};

// ---------------------------------------------------------------- 4 · the lesson: the left flank from a low touchline camera
const tau4=(t:number)=>{const E=SECS(3),om=CUEW(3,'one more');return key(t,[[0,-1.2],[CUEW(3,'when your'),-.6],[CUEW(3,'runs forward'),.2],[CUEW(3,'That gives'),1.5],[om,1.75],[om+1.3,RECV2],[E+1,RECV2+.4]],linear);};
/** Director beats for the lesson: start on Facchetti and Corso at lesson size; pull back to the authored wide on "when your team attacks" so
 * the lit-up box and the whole left flank are in shot; push in again on "the full-back" for his run forward (the next metres of his run
 * held in frame); pull out on "That gives" so Corso, his first option (Mazzola) and the extra one (Facchetti's run) all fit with both
 * pass lines. */
const B4=beats([[0,'lesson'],[CUEW(3,'when your')-.2,'wide'],[CUEW(3,'the full-back')-.6,{from:'lesson',size:.46}],[CUEW(3,'That gives')-.35,{from:'space',size:.24,ball:.1}]]);
/** the directed camera, averaged over ±.35 s (director steady(): the fit clamp and keep hand-overs become smooth moves) */
function cam4(t:number):Cam{const p=steady(t,dir4,.35,STEADY_N);return look(p.eye,p.target,p.F);}
function dir4(t:number):Pin{
 const a=cam4Authored(t),tau=tau4(t),fa=posOf(FAC,tau),hero:V3=[fa[0],0,fa[1]],yg=CUEW(3,'That gives'),rf=CUEW(3,'the full-back');
 const co=posOf(CORSO,Math.min(tau,PASS2)),mz=posOf(MAZZOLA,Math.min(tau,PASS2)+.5),fr=posOf(FAC,RECV2);
 // Corso soft-kept throughout; the next metres of Facchetti's run while it is drawn; the pass-line ends (Mazzola, the run's end) from "That gives"
 const wR=Math.min(sm(rf-.7,rf,t,easeInOutSine),1-sm(yg-1,yg-.2,t,easeInOutSine)),wP=sm(yg-1,yg-.1,t,easeInOutSine),nx=posOf(FAC,Math.min(tau+.5,RECV2));
 const keep:Keep[]=[...near(hero,[[co[0],0,co[1]]],4,9),...(wR>.01?[{P:[nx[0],0,nx[1]] as V3,w:wR}]:[]),
  ...(wP>.01?[{P:[mz[0],0,mz[1]] as V3,w:wP},{P:[mz[0],1.85,mz[1]] as V3,w:wP},{P:[fr[0],0,fr[1]] as V3,w:wP},{P:[co[0],0,co[1]] as V3,w:wP},{P:[co[0],1.85,co[1]] as V3,w:wP}]:[])];
 const r=reframe({eye:a.C,target:a.T,F:a.F},{hero,ball:ballAt(tau),keep,height:1.9},shotAt(t,B4),DV);
 return r;
}
function cam4Authored(t:number):{C:V3;T:V3;F:number}{
 const tau=tau4(t),m=smooth(FAC,tau),co=posOf(CORSO,tau),at=CUEW(3,'when your'),yg=CUEW(3,'That gives'),j=weave(t,.04);
 const mid:[number,number]=[(m[0]+co[0])/2,(m[1]+co[1])/2];
 // "when your team attacks": the camera looks up the pitch at their box, then settles on Corso + Facchetti + the box
 const up=bump(at-.1,at+1.6,t),wide=sm(yg-.3,yg+.8,t,easeInOutSine);
 const T:V3=[lerp(lerp(mid[0]+4,94,up*.8),88,wide*.4)+j[0],.6+j[1],lerp(lerp(mid[1]+3,-6,up*.6),-12,wide*.5)+j[2]];
 const C:V3=[lerp(mid[0]-14,mid[0]-6,wide),lerp(6,10,wide),lerp(-50,-54,wide)];
 return{C,T,F:lerp(2000,1650,wide)};
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUEW(3,'Your turn'),at=CUEW(3,'when your'),fb=CUEW(3,'the full-back'),rf=CUEW(3,'runs forward'),yg=CUEW(3,'That gives'),om=CUEW(3,'one more');
  stadium(s,c,v,t);
  ground(s,c);
  // "when your team attacks": their box lights up and the attack arrow points at it
  zone(s,c,ATT_ZONE,sm(at-.2,at+.3,t,easeOutBack),t,Y,95);
  // "run forward too": his real run, in yellow
  pathArrow(s,c,FAC,Math.max(-1.2,tau-.6),RECV2,sm(rf-.1,rf+.7,t,easeOut),Y,{seed:98,width:.3});
  // "You give your team": Corso's first option (Mazzola) in navy; "one more option": the second line, to Facchetti, in yellow
  const co=posOf(CORSO,Math.min(tau,PASS2)),mz=posOf(MAZZOLA,Math.min(tau,PASS2)+.5),fr=posOf(FAC,RECV2);
  passLine(s,c,co,mz,sm(yg-.1,yg+.5,t,easeOut),K,101);
  passLine(s,c,co,fr,sm(om-.1,om+.45,t,easeOut),Y,103);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:FAC,rings:[[FAC,Math.max(sm(yt-.1,yt+.35,t,easeOutBack)*(1-sm(at-.2,at+.2,t)),sm(fb-.15,fb+.3,t,easeOutBack)),Y],[CORSO,sm(yg-.2,yg+.2,t,easeOutBack)*.8,B]]});
  const fp=posOf(FAC,tau);plusOne(s,c,fp[0],fp[1],sm(om+.1,om+.6,t),t);
  newsreel(s,t,.8);
 },
 still:7,
};

const film:RisoStory={
 id:'facchetti-signature',format:'11v11',title:'Facchetti Joins the Attack',theme:'The attacking full-back: when your team attacks, run forward and give an extra option',
 ageNote:'European Cup semi-final, second leg, Inter v Liverpool, San Siro, Milan, 12 May 1965 (Inter won 3–0). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.7,mottle:.55},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a puff of San Siro turf and a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: grass bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(B,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
