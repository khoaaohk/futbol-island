/** Clarence Seedorf — "Signature: the long-range thunderbolt". Real Madrid v Atlético Madrid, La Liga 1997–98 round 1, Estadio Santiago
 * Bernabéu, Madrid, 30 August 1997 (Real Madrid 1–1 Atlético: Juninho 15', Seedorf 75'). An iconic-play riso film (RisoStory, chapters
 * mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: Seedorf's signature is the long-range strike; English Wikipedia's career summary singles out exactly one ("Seedorf
 * scored a notable long-range goal against Atlético Madrid in 1997"), and it is the goal most retold of his Real Madrid years ("none more
 * notable than this rocket", The Football Faithful). One real, well-documented moment that shows the whole signature.
 *
 * SOURCES (fetched Sept 2026, cached under scratchpad/films/src-cache/):
 *  - Wikipedia, "Clarence Seedorf" (raw)  https://en.wikipedia.org/wiki/Clarence_Seedorf
 *  - Wikipedia, "1997–98 Real Madrid CF season" (raw: round 1 match box, squad + shirt numbers, kit maker)
 *    https://en.wikipedia.org/wiki/1997%E2%80%9398_Real_Madrid_CF_season
 *  - The Football Faithful, "Clarence Seedorf's incredible long-range strike against Atletico Madrid"
 *    https://thefootballfaithful.com/clarence-seedorfs-incredible-goal-against-atletico-madrid/
 *  - Colgados por el Fútbol, "Clarence Seedorf marcó un gol estratosférico al Atlético" (search-result summary: "más de 40 metros",
 *    "José Francisco Molina", "no fue suficiente para dar la victoria")  https://colgadosporelfutbol.com/clarence-seedorf-marco-un-gol-estratosferico-al-atletico/
 *  - Search-result descriptions of the broadcast clip ("Golazo De Clarence Seedorf Al Atlético De Madrid 30/08/1997"; a Facebook post:
 *    "el Madrid pierde 0-1, Clarence Seedorf conduce el balón por el centro del campo escorado un poco a banda derecha, cuando de repente
 *    suelta un latigazo directo a portería que pilla de sorpresa a Molina").
 *  - Wikipedia, "1996–97 Real Madrid CF season" (ruled out the January 1997 derby: Seedorf's 84' goal in a 4–1 win at the Calderón).
 * CONFIRMED by those accounts: 30 August 1997, opening day of 1997–98, at the Bernabéu; Atlético led 1–0 through Juninho (15'); Seedorf
 * scored at 75'; it finished 1–1 (the goal "was not enough for the win"); Seedorf RAN WITH THE BALL through the middle of the pitch, drifting
 * a little to the RIGHT, and suddenly let fly; he had SPOTTED goalkeeper José Francisco Molina OFF HIS LINE; the ball was struck from "just a
 * matter of yards inside the Atletico half", "more than 40 metres" out, and went "arrowing into the TOP CORNER" with "power and precision".
 * Real Madrid wore Kelme kits (Teka sponsor) — the home strip is all white. Seedorf wore 10 (1997–98 squad list).
 * INFERRED (illustrative): the RIGHT foot (the signature entry's foot; Seedorf was naturally right-footed, but the foot for this strike is
 * not stated in the written accounts, so the narration never names it); WHICH top corner (drawn: the far corner, to Molina's right) and the
 * exact spot (drawn ~5 m inside the Atlético half, ~7 m right of centre, ~48 m from goal); the flight (drawn rising to ~6 m and dipping,
 * a slight swerve); Molina's exact position (drawn ~7 m off his line) and his back-pedal and late leap; Atlético in their home red-and-white
 * stripes with blue shorts (the usual strip, no clash with white — not confirmed for this match), the sock colours, Molina's kit (drawn
 * yellow with navy shorts), the navy trim and numbers on Real's white; the other 20 players' positions and identities (not named), the
 * referee; that it was an evening game under floodlights (drawn); the celebration run; the Bernabéu's look in 1997 (a steep rectangular
 * three-tier bowl with its corner stair towers, floodlights on the rim, crowd colours), the boards, the match ball, the camera placements.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in near real
 * time, panning with Seedorf as he carries the ball over halfway, then the strike and the long flight into the top corner; 2 = the
 * slow-motion replay from a low touchline camera on his right (eyes on the ball, the planted standing foot, the laces, through the ball);
 * 3 = the replay from behind the goal (the ball dipping past the back-pedalling Molina into the top corner) swinging round to the
 * celebration; 4 = the lesson from a low front three-quarter camera (laces, through the ball, follow through towards goal).
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Scenes read only (t, c); every
 * action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,speedLines,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,strike,keeperSet,keeperTip,backpedal,celebrate,stand,posed,blendPose,solve,
 STRIKE_CONTACT,touchPhase,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Madrid, 1997, the derby at the Bernabéu. Real Madrid are losing one-nil to Atlético. Clarence Seedorf runs with the ball, just past halfway... he looks up, the keeper is off his line... boom!... Top corner! One-one!',seconds:16,
  cues:[[.2,'Madrid'],[1.9,'the derby'],[3.4,'Real Madrid are losing'],[5.6,'Clarence Seedorf'],[7,'runs with the ball'],[8.4,'past halfway'],[9.7,'looks up'],[10.6,'the keeper'],[12.1,'boom'],[13.6,'Top corner'],[14.6,'One-one']]},
 {label:'Watch it again',text:'Watch again, slowly. Eyes on the ball, standing foot planted, and he strikes it with his laces, right through the ball.',seconds:9.4,
  cues:[[.15,'Watch again'],[1.6,'Eyes on the ball'],[3,'standing foot'],[4.6,'strikes it'],[5.9,'laces'],[6.9,'right through']]},
 {label:'Top corner',text:'Over forty metres! It flies past keeper Molina and into the top corner. The derby ends one-one.',seconds:7.6,
  cues:[[.15,'Over forty metres'],[1.6,'keeper Molina'],[3.1,'top corner'],[4.4,'The derby ends'],[5.6,'one-one']]},
 {label:'Your turn',text:'Your turn: strike through the ball with your laces, and follow through towards goal.',seconds:7,
  cues:[[.15,'Your turn'],[1,'strike through'],[2.4,'laces'],[3.4,'follow through'],[4.4,'towards goal']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py seedorf-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/seedorf-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-seedorf-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/seedorf-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('seedorf: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Real Madrid attack +X, Atlético's goal line at 105), Y up, Z across
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
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Bernabéu (1997): a steep rectangular three-tier bowl, stair towers, floodlit rim
const CX=52.5,NS=64;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a squared-off superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.2),y,(39+d)*Math.sign(s)*Math.pow(Math.abs(s),.2)];}
/** three steep tiers climbing to ~48 m (the third ring, 1992, is famously near-vertical) */
const T1=(b:number):[number,number]=>[2+19*b,1.3+10*b],T2=(b:number):[number,number]=>[23+11*b,13+11*b],T3=(b:number):[number,number]=>[36+16*b,26.5+21*b];
type Bowl={tiers:V3[][][];bands:V3[][];fascia:V3[][];lamps:V3[][];seats:{P:V3;h:number;end:number}[];towers:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={tiers:[[],[],[]],bands:[],fascia:[],lamps:[],seats:[],towers:[]};
 const TIERS=[T1,T2,T3],ROWS=[6,5,6];
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  TIERS.forEach((f,k)=>o.tiers[k].push(Q(f,0,1)));
  o.bands.push([rim(a,21,11.3),rim(b,21,11.3),rim(b,23,13),rim(a,23,13)]);o.bands.push([rim(a,34,24),rim(b,34,24),rim(b,36,26.5),rim(a,36,26.5)]);
  o.fascia.push([rim(a,52,47.5),rim(b,52,47.5),rim(b,53,50.5),rim(a,53,50.5)]);
  // floodlight banks along the rim of the two long sides
  if(i%4===1&&Math.abs(Math.sin(a))>.55){const m=(a+b)/2,dd=.035;o.lamps.push([rim(m-dd,52.3,48),rim(m+dd,52.3,48),rim(m+dd,52.3,50),rim(m-dd,52.3,50)]);}
  TIERS.forEach((f,k)=>{for(let r=0;r<ROWS[k];r++)for(let q=0;q<3;q++){const h=hash(i*977+r*31+q*7+k*5000,13);if(h<.12)continue;
   const[d,y]=f((r+.5)/ROWS[k]),P=rim((i+(q+.5+(hash(i+r*13+q,4)-.5)*.5)/3)/NS*TAU,d,y+.4);o.seats.push({P,h,end:P[0]>CX+40?1:0});}});}
 for(const th of [Math.PI*.2,Math.PI*.8,Math.PI*1.2,Math.PI*1.8])o.towers.push(rim(th,56,0));
 return o;})();
/** everything behind the pitch: a floodlit night sky, the bowl, the crowd (roar lifts the marks, flash = cameras) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.78);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.35);
 // the corner stair towers (drum-shaped, beyond the stands)
 const tw=new Path2D();for(const P of BOWL.towers){const a:V3=[P[0],0,P[2]],b:V3=[P[0],54,P[2]];if(toCam(c,a)[2]>30&&toCam(c,b)[2]>30)seg3(c,a,b,14,tw);}
 s.knockout(tw);s.tone(K,tw,.3);s.tone(Y,tw,.12);
 const tiers=[new Path2D(),new Path2D(),new Path2D()],band=new Path2D(),fas=new Path2D(),lamp=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){for(let k=0;k<3;k++)add(BOWL.tiers[k][i],tiers[k]);add(BOWL.fascia[i],fas);}
 for(const q of BOWL.bands)add(q,band);for(const q of BOWL.lamps)add(q,lamp);
 // grey concrete tiers under the crowd, darker as they climb into the night
 tiers.forEach((p,k)=>{s.knockout(p);s.tone(K,p,.2+.1*k);s.tone(B,p,.12);});
 // the crowd: Madrid white everywhere, navy / blue scarves, and the red-and-white Atlético followers at the +X end
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.end>0?(q.h<.45?0:q.h<.8?1:4):(q.h<.5?0:q.h<.7?4:q.h<.86?3:2);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.8);s.fill(R,inks[1],.95);s.fill(Y,inks[2],.85);s.fill(B,inks[3],.8);s.fill(K,inks[4],.8);
 s.knockout(band);s.fill(K,band,.85);
 s.knockout(fas);s.fill(K,fas,.7);
 // the floodlights: paper-white banks with a yellow glow
 s.knockout(lamp);s.tone(Y,lamp,.35);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the surround, floodlit grass (yellow × blue) with mowing stripes, navy boards with paper panels, paper lines, both goals (the Atlético goal
 * is drawn later when it is in front of the players, i.e. from the camera behind it). hw = halfway-line highlight 0..1 */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean;hw?:number}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(R,p,.18);s.tone(K,p,.2);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.86);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 // "just past halfway": the halfway line glows yellow
 const hw=o.hw??0;if(hw>0){const h=new Path2D();seg3(c,[52.5,0,-34],[52.5,0,34],.45,h);s.fill(Y,h,.95*hw);}
 goal3(s,c,0,-1,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around the ball's corner (top, far post) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-NET[2])/1.6,2))*(.4+.6*y));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z,0),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y/1.9),y,za],[back(zb,y/1.9),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0,y/1.9),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1,y/1.9),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN1:InkFill[]=[[Y,.32],[R,.18]],SKIN2:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN3:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Real Madrid 1997-98 (Kelme): all white (confirmed home strip); navy trim and numbers inferred */
const RMA=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:[K,.9],skin:SKIN1,hair:K,hairStyle:'short',line:K,number:n,numberInk:K,seed:n??70,...o});
/** Clarence Seedorf, number 10 (1997-98 squad list); 1.76 m, powerful build, close-cropped hair */
const SEEDORF_BUILD={height:1.76,bulk:1.08,thighs:1.1};
const SEEDORF_STYLE=RMA(10,{skin:SKIN3,hair:K,build:SEEDORF_BUILD,seed:10});
/** Atlético Madrid: red-and-white stripes, blue shorts (their usual home strip — inferred for this match), blue socks inferred */
const ATM=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:'paper',shorts:B,socks:B,boots:K,trim:'paper',skin:SKIN1,hair:K,hairStyle:'short',line:K,number:n,numberInk:K,seed:40+(n??9),...o});
/** José Francisco Molina: the keeper kit colour that day is not confirmed — drawn yellow with navy shorts */
const MOLINA:AthleteStyle={shirt:Y,shorts:[K,.85],socks:Y,boots:K,skin:SKIN1,hair:K,hairStyle:'short',line:K,gloves:[K,.6],trim:[K,.8],number:null,sleeves:'long',build:{height:1.86,bulk:1.02},seed:1};
const REF:AthleteStyle={shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN1,hair:[K,.9],hairStyle:'balding',line:K,trim:'paper',seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the strike geometry (τ = seconds after Seedorf's contact)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** the top corner, far post — Molina's right (top corner confirmed; which one inferred) */
const NET:V3=[105.25,2.1,-2.95],REST:V3=[106.5,.11,-2.4];
/** the ball at contact: ~5 m inside the Atlético half, right of centre, ~48 m from goal (inferred spot from "a matter of yards inside the half") */
const CX0=57.4,CZ0=7.2;
const YAW_S=yawOf(NET[0]-CX0,NET[2]-CZ0);
const FWD:Pt=[Math.cos(YAW_S),-Math.sin(YAW_S)];
/** eyes on the ball, chest over it at contact, laces through the middle — laid over the library strike */
const THROUGH:Partial<Pose>={lean:20,pitch:6,neckP:26,lKnee:36,lHipF:24};
const GD=1.0,G_ST=-STRIKE_CONTACT*GD;
/** Seedorf's strike pose at τ (right foot, full power), independent of where he stands */
function sStrike(tau:number):Pose{const u=(tau-G_ST)/GD;return over(strike(clamp(u),{foot:'r',power:1}),THROUGH,bump(-.36,.2,tau));}
/** where his laces meet the ball at contact, relative to his pelvis */
const LACE=(()=>{const sk=solve(sStrike(0),SEEDORF_BUILD,{x:0,z:0,yaw:YAW_S}),p=lerp3(sk.rAn,sk.rToe,.62);return p;})();
const C_BALL:V3=[CX0,clamp(LACE[1]+.02,.14,.34),CZ0];
const P0:Pt=[CX0-LACE[0],CZ0-LACE[2]];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'rma'|'atm'|'gk'|'ref';
/** a keyed move at `at` (the touch), lasting dur: a keeper's leap; yaw held through it */
type Move={kind:'tip';at:number;dur:number;yaw:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
const IN_NET=1.72,T_LAST=-1.25;
const G=(dx:number,dz:number)=>[P0[0]+dx,P0[1]+dz];
const ACTORS:Actor[]=[
 {name:'Seedorf',role:'hero',style:SEEDORF_STYLE,key:true,keys:[[-11,28.5,12.6],[-7.5,36,11],[-3,48.2,8.6],[-1.6,52.6,7.9],[-.9,...G(-FWD[0]*1.9,-FWD[1]*1.9)],[-.45,...G(-FWD[0]*1.02,-FWD[1]*1.02)],[0,...P0],[.45,...G(FWD[0]*.8,FWD[1]*.8)],[1.3,...G(FWD[0]*1.5,FWD[1]*1.5+.6)],[2.3,...G(2.2,3.8)],[3.6,...G(3.2,8.4)],[5.6,...G(4,13.8)],[8,...G(4.6,19)],[10,...G(5,23)]]},
 // Atlético: a midfielder chasing him from behind, one stepping out too late, the back four sitting deep
 {name:'Atlético midfielder (chasing)',role:'atm',style:ATM(null,{seed:51}),key:true,keys:[[-11,27,9],[-7.5,34,8.4],[-3,45.8,6.4],[0,54.2,5.2],[1,55.5,4.8],[10,58,4]]},
 {name:'Atlético midfielder (stepping out)',role:'atm',style:ATM(null,{skin:SKIN2,seed:52}),key:true,keys:[[-11,56,14],[-3,60.5,11],[-1,61.6,9.8],[0,61.2,9.3],[1.2,60.6,9],[10,61,9]]},
 {name:'Atlético midfielder',role:'atm',style:ATM(null,{seed:53}),keys:[[-11,50,-4],[-3,58,-3],[0,62,-1.6],[10,63,-1]]},
 {name:'Atlético midfielder',role:'atm',style:ATM(null,{hairStyle:'long',seed:54}),keys:[[-11,48,-18],[-3,56,-16],[0,60,-14],[10,62,-13]]},
 {name:'Atlético centre-back',role:'atm',style:ATM(null,{seed:55}),keys:[[-11,82,-5],[-3,80,-4.6],[0,79.4,-4.2],[10,80,-4]]},
 {name:'Atlético centre-back',role:'atm',style:ATM(null,{skin:SKIN3,seed:56}),keys:[[-11,83,3],[-3,81.4,3.4],[0,80.4,3.8],[10,80.5,3.8]]},
 {name:'Atlético full-back',role:'atm',style:ATM(null,{seed:57}),keys:[[-11,78,-17],[-3,77,-16],[0,76.5,-15],[10,77,-15]]},
 {name:'Atlético full-back',role:'atm',style:ATM(null,{seed:58}),keys:[[-11,76,19],[-3,74.5,17.4],[0,73.6,16.4],[10,74,16]]},
 {name:'Atlético forward',role:'atm',style:ATM(null,{skin:SKIN2,seed:59}),keys:[[-11,40,-8],[0,47,-6],[10,49,-6]]},
 {name:'Molina',role:'gk',style:MOLINA,key:true,moves:[{kind:'tip',at:IN_NET-.02,dur:.9,yaw:Math.PI+.12}],keys:[[-11,96.6,1],[-3,97.2,.8],[-.6,97.8,.5],[0,97.9,.4],[.5,99.3,-.2],[1.1,100.9,-.9],[1.45,101.6,-1.3],[2.6,101.9,-1.5],[10,101.9,-1.5]]},
 // Real Madrid: the forwards pulling the back line deep, midfielders in support
 {name:'Real forward',role:'rma',style:RMA(null,{seed:71}),keys:[[-11,74,-4],[-3,78,-2.5],[0,80.6,-1.2],[10,82,-1]]},
 {name:'Real forward',role:'rma',style:RMA(null,{hairStyle:'long',seed:72}),keys:[[-11,72,9],[-3,76,11],[0,78.6,12.4],[10,80,13]]},
 {name:'Real winger',role:'rma',style:RMA(null,{seed:73}),keys:[[-11,66,-24],[-3,71,-22],[0,73,-21],[10,74,-21]]},
 {name:'Real midfielder',role:'rma',style:RMA(null,{skin:SKIN2,seed:74}),keys:[[-11,40,-8],[-3,47,-9],[0,51,-9.5],[10,54,-9]]},
 {name:'Real full-back',role:'rma',style:RMA(null,{skin:SKIN3,seed:75}),keys:[[-11,42,24],[-3,50,23],[0,54,22],[10,57,22]]},
 {name:'Real centre-back',role:'rma',style:RMA(null,{seed:76}),keys:[[-11,34,-3],[0,40,-2],[10,42,-2]]},
 {name:'referee',role:'ref',style:REF,keys:[[-11,42,-10],[-3,50,-11],[0,55,-11],[10,58,-10]]},
];
const HERO=0,MOL=ACTORS.findIndex(a=>a.role==='gk');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-11,TB=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the carry, the last roll, the thunderbolt, the net
/** dribble stride (m per gait cycle): one touch per cycle, at touchPhase */
const STR=2.4;
const gaitOf=(tau:number)=>distOf(HERO,tau)/STR;
/** the carry: the right foot pushes the ball ~1.4 m ahead at each touch, then he runs back onto it */
function carryBall(tau:number):V3{const[x,z]=posOf(HERO,tau),v=velOf(HERO,tau),sp=Math.hypot(v[0],v[1])||1,f=((gaitOf(tau)-touchPhase)%1+1)%1,
 off=f<.25?.5+.9*easeOut(f/.25):1.4-.9*(f-.25)/.75;return[x+v[0]/sp*off+.12,.11,z+v[1]/sp*off];}
const B_LAST=carryBall(T_LAST);
function ballAt(tau:number):V3{
 if(tau<T_LAST)return carryBall(tau);
 if(tau<0){const u=(tau-T_LAST)/-T_LAST,e=u*(1.35-.35*u);return[lerp(B_LAST[0],C_BALL[0],e),lerp(.11,C_BALL[1],sm(.85,1,u)),lerp(B_LAST[2],C_BALL[2],e)];}
 if(tau<IN_NET){const u=tau/IN_NET,e=u*(1.22-.22*u);// rising to ~6 m and dipping late into the top corner, a touch of swerve (inferred)
  return[lerp(C_BALL[0],NET[0],e),lerp(C_BALL[1],NET[1],e)+5.2*Math.sin(Math.PI*Math.pow(e,.92)),lerp(C_BALL[2],NET[2],e)+.9*Math.sin(Math.PI*e)];}
 const u=clamp((tau-IN_NET)/.7),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),Math.max(.11,lerp(NET[1],REST[1],Math.min(1,u*1.6))+.25*Math.sin(Math.PI*u)*(1-u)),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** hands on heads (Atlético, after the goal) and arms up (Real Madrid) */
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='atm'?READY:stand();
 if(a.role==='gk'){yaw=Math.PI+.05*Math.sin(tau);
  // off his line, then back-pedalling as the ball goes over
  p=tau>.05?blendPose(idle,backpedal(distOf(k,tau)/1.3),clamp((sp-.3)/.8)):blendPose(idle,runCycle(distOf(k,tau)/3,{speed:.2}),clamp((sp-.4)/.8));}
 else if(k===HERO){// carrying the ball: head up between touches ("he looks up"), head down onto the ball near the strike
  const ph=gaitOf(tau);p=blendPose(idle,dribble(ph,{foot:'r',speed:clamp((sp-1)/3)}),clamp((sp-.3)/.8));
  p=over(p,{neckP:-10,neckY:-6},bump(-2.2,-.7,tau));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-.62*mv.dur,u=(tau-t0)/mv.dur;if(u>0){p=blendPose(p,keeperTip(Math.min(1,u),{hand:'r'}),sm(0,.12,u));yaw=mv.yaw;}}
 if(k===HERO){
  const u=(tau-G_ST)/GD,w=Math.min(sm(-.08,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,sStrike(tau),w);yaw=lerpA(yaw,YAW_S,sm(-.3,.05,u));}
  if(tau>IN_NET+.35)p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(IN_NET+.35,IN_NET+.9,tau));
 }
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='rma')p=over(p,JOY,w);if(a.role==='atm')p=over(p,DESPAIR,w*.9);}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a white match ball with navy panels (design inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 pan.addPath(pent(x+Math.cos(rot)*r*.12,y+Math.sin(rot)*r*.12,r*.3,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9,r*.26,a));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;near?:number}={}):PlayOut{
 const{minBall=6,hero=false,near=1.2}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(k===HERO?1.2:near))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: soft, short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg){const k=clamp(1-b[1]/8,.3,1);sh.addPath(polyPath(blob(bground[0],bground[1],br*.85*k,br*.26*k,2,{amp:.05,n:12}),true));}s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===HERO?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===HERO||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===HERO}:{});
  if(e.k===HERO)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / a fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** the shot's path: a ribbon along the ball's real flight from contact to τ (w = strength); ground = the trace under it */
function shotPath(s:Sheet,c:Cam,tau:number,w:number,o:{ink?:string;ground?:boolean;from?:number}={}){if(w<=0||tau<=0)return;
 const{ink=R,ground=false,from=0}=o,pts:Pt[]=[];let d=1;const t1=Math.min(tau,IN_NET);
 for(let i=0;i<=28;i++){const tt=lerp(from,t1,i/28),b=ballAt(tt),q=toCam(c,ground?[b[0],.02,b[2]]:b);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const wd=Math.max(4,c.F*(ground?.06:.09)/Math.max(d,9));
 s.knockout(ribbon(pts,wd*1.8,{seed:61,taper:.3,wobble:.8}),.8*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.3,wobble:.8}),.95*w);}
/** "eyes on the ball": a dashed yellow sight line from his eyes to the ball */
function sight(s:Sheet,c:Cam,r:DrawResult|undefined,bg:Pt|null,w:number){if(!r||!bg||w<=0)return;
 const a=r.joints.face??r.joints.head,u=Math.max(3,r.heightPx*.018),e:Pt=[a[0]+(bg[0]-a[0])*w,a[1]+(bg[1]-a[1])*w];void c;
 s.knockout(ribbon([a,e],u*2.2,{seed:71,taper:0,wobble:.5}),.8*w);s.fill(Y,ribbon([a,e],u,{seed:71,taper:0,wobble:.5,gaps:[[.2,.3],[.45,.55],[.7,.8]]}),.95*w);}
/** "standing foot planted": a yellow ring on the grass round the planted left foot, next to the ball */
function plant(s:Sheet,c:Cam,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const A=r.sk.lAn,pts:Pt[]=[];
 for(let i=0;i<30;i++){const q=pr(c,[A[0]+Math.cos(i/30*TAU)*.34*(.6+.4*w),0,A[2]+Math.sin(i/30*TAU)*.26*(.6+.4*w)]);if(q)pts.push(q);}
 if(pts.length<20)return;const u=Math.max(3,c.F*.035/toCam(c,A)[2]);s.knockout(ribbon(pts,u*2,{close:true,seed:73,taper:0}),.8*w);s.fill(Y,ribbon(pts,u,{close:true,seed:73,taper:0,wobble:.6}),.95*w);}
/** "laces": the top of the kicking boot lights up yellow (the hard, flat part of the foot) */
function laces(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const a=r.joints.rAn,b=r.joints.rToe,m:Pt=[lerp(a[0],b[0],.55),lerp(a[1],b[1],.55)],L=Math.hypot(b[0]-a[0],b[1]-a[1])+6;
 const p=polyPath(blob(m[0],m[1],L*.62,L*.62,9,{amp:.06,n:18}),true),q=new Path2D();q.arc(m[0],m[1],L*(.9+.25*(1-w)),0,TAU);q.moveTo(m[0]+L*.72,m[1]);q.arc(m[0],m[1],L*.72,0,TAU,true);
 s.fill(Y,q,.95*w);s.knockout(ribbon([a,b],Math.max(4,L*.22),{seed:74,taper:.2}),.6*w);s.fill(Y,ribbon([a,b],Math.max(3,L*.14),{seed:74,taper:.2}),.95*w);void p;}
/** "through the ball": a red target ring round the ball with a dot at its centre, and an arrow straight through it */
function target(s:Sheet,bg:Pt|null,br:number,w:number,dir=0){if(!bg||w<=0)return;const r=br*(1.6+.5*(1-w)),pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([bg[0]+Math.cos(a)*r,bg[1]+Math.sin(a)*r]);}
 s.fill(R,ribbon(pts,Math.max(3,br*.22),{seed:81,close:true,taper:0,wobble:.8}),.95*w);
 const dot=new Path2D();dot.arc(bg[0],bg[1],Math.max(2.5,br*.24),0,TAU);s.fill(R,dot,.95*w);
 const L=br*3.4,a:Pt=[bg[0]-Math.cos(dir)*L,bg[1]-Math.sin(dir)*L],b:Pt=[bg[0]+Math.cos(dir)*L,bg[1]+Math.sin(dir)*L];laneArrow(s,R,a,b,Math.max(3,br*.2),{progress:w,seed:82,head:br*.8,cov:.95});}
/** "follow through towards goal": the kicking boot's path after contact as a yellow swoosh, ending in an arrow aimed at the goal */
function followThrough(s:Sheet,c:Cam,tau:number,w:number){if(w<=0||tau<=.02)return;const pts:Pt[]=[];let dep=10;
 for(let i=0;i<=12;i++){const tt=lerp(0,Math.min(tau,.24),i/12),{p,yaw}=poseOf(HERO,tt),[x,z]=posOf(HERO,tt),sk=solve(p,SEEDORF_BUILD,{x,z,yaw}),q=toCam(c,sk.rToe);if(q[2]<1)continue;pts.push(scr(c,q));dep=q[2];}
 if(pts.length<4)return;const u=Math.max(4,c.F*.07/dep);
 s.knockout(ribbon(pts,u*1.8,{seed:91,taper:.6,wobble:0}),.8*w);s.fill(Y,ribbon(pts,u*.8,{seed:91,taper:.6,wobble:0}),.95*w);
 const e=pts[pts.length-1],gq=pr(c,[P0[0]+FWD[0]*5,.9,P0[1]+FWD[1]*5]);if(!gq)return;const dx=gq[0]-e[0],dy=gq[1]-e[1],l=Math.hypot(dx,dy)||1,L=Math.min(l,u*14);
 laneArrow(s,Y,e,[e[0]+dx/l*L,e[1]+dy/l*L],u*.7,{progress:w,seed:92,head:u*2.2,cov:.95});}
/** distance ticks along the grass from the strike spot to the goal line ("over forty metres") */
function distanceDots(s:Sheet,c:Cam,w:number){if(w<=0)return;const dots=new Path2D();
 for(let i=1;i<12;i++){const u=i/12;if(u>w)break;const P:V3=[lerp(CX0+.8,105,u),0,lerp(CZ0,NET[2],u)],q=pr(c,P);if(q){const r=c.F*.18/Math.max(4,toCam(c,P)[2]);dots.addPath(polyPath(blob(q[0],q[1],r*1.4,r*.5,i,{amp:.08,n:10}),true));}}
 s.knockout(dots,.8);s.fill(Y,dots,.95);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the carry and the flight play at ~1× real time) */
const tau1=(t:number)=>{const G=CUEW(0,'Top');return key(t,[[0,-10.3],[CUEW(0,'Clarence'),-4.7],[CUEW(0,'runs'),-3.3],[CUEW(0,'past'),-2],[CUEW(0,'looks'),-1.1],[CUEW(0,'the keeper'),-.55],[CUEW(0,'boom'),-.02],[G,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-G]],linear);};
const CAM1:V3=[56,17,64];
function cam1(t:number):Cam{
 const G=CUEW(0,'Top'),S=SECS(0),tau=tau1(t),lp=CUEW(0,'Real');
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.3),b2=bs(tau-.6),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // from "looks up" the director widens to hold Seedorf, the keeper off his line and the goal together
 const hold=sm(CUEW(0,'looks')-.3,CUEW(0,'the keeper')+.4,t,easeInOutSine)*(1-sm(G+.3,G+1.2,t)),mid:V3=[(P0[0]+100)/2,0,(P0[1]+0)/2];
 const open:V3=[48,1.2,2],m=posOf(HERO,tau),cel:V3=[m[0]+1,1.1,m[1]];
 const toBall=sm(0,lp,t,easeInOutSine),toD=sm(G+.4,G+1.5,t,easeInOutSine);
 const follow=lerp3(bt,mid,hold),tb:V3=[lerp(open[0],follow[0],toBall),lerp(open[1],1.6,toBall),lerp(open[2],lerp(follow[2],0,.25),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,[[0,2000],[lp,3200],[CUEW(0,'Clarence'),4400],[CUEW(0,'past'),4400],[CUEW(0,'looks'),3600],[CUEW(0,'the keeper'),2300],[G,2300],[G+1.5,4800],[S,5200]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'Top'),ps=CUEW(0,'past'),kp=CUEW(0,'the keeper'),bm=CUEW(0,'boom');
  stadium(s,c,v,t,{roar:sm(G+.05,G+.5,t),flash:sm(G+.15,G+.4,t)});
  ground(s,c,{bulge:bulgeAt(tau),hw:sm(ps-.1,ps+.3,t)*(1-sm(ps+1.4,ps+1.9,t))});
  // the thunderbolt's comet tail: a short red trail behind the ball while it flies
  shotPath(s,c,tau,sm(bm-.05,bm+.15,t)*(1-sm(G+.2,G+.7,t)),{from:Math.max(0,Math.min(tau,IN_NET)-.45)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,after:({bg})=>{
   // "Clarence Seedorf": a yellow telestrator ring round him until he strikes
   const w=sm(CUEW(0,'Clarence')-.1,CUEW(0,'Clarence')+.3,t,easeOutBack)*(1-sm(bm-.5,bm-.1,t));
   if(w>0){const[x,z]=posOf(HERO,tau),pts:Pt[]=[];for(let i=0;i<30;i++){const q=pr(c,[x+Math.cos(i/30*TAU)*1.6,0,z+Math.sin(i/30*TAU)*1.1]);if(q)pts.push(q);}
    if(pts.length>20){const r=Math.max(3,c.F*.1/toCam(c,[x,0,z])[2]);s.knockout(ribbon(pts,r*1.8,{close:true,seed:5,taper:0,wobble:.8}),.8*w);s.fill(Y,ribbon(pts,r,{close:true,seed:5,taper:0,wobble:.8}),.95*w);}}
   // "the keeper is off his line": a red ring on Molina and a dashed red gap back to his empty goal line
   const kw=sm(kp-.1,kp+.3,t,easeOutBack)*(1-sm(G-.2,G+.2,t));
   if(kw>0){const[x,z]=posOf(MOL,tau),pts:Pt[]=[];for(let i=0;i<30;i++){const q=pr(c,[x+Math.cos(i/30*TAU)*1.5,0,z+Math.sin(i/30*TAU)*1.1]);if(q)pts.push(q);}
    const r=Math.max(3,c.F*.1/toCam(c,[x,0,z])[2]);if(pts.length>20){s.knockout(ribbon(pts,r*1.8,{close:true,seed:6,taper:0,wobble:.8}),.8*kw);s.fill(R,ribbon(pts,r,{close:true,seed:6,taper:0,wobble:.8}),.95*kw);}
    const a=pr(c,[x+1.5,0,z]),b=pr(c,[105,0,z]);if(a&&b)s.fill(R,ribbon([a,[lerp(a[0],b[0],kw),lerp(a[1],b[1],kw)]],r*.8,{seed:8,taper:0,gaps:[[.15,.3],[.45,.6],[.75,.9]]}),.95*kw);}
   // "boom": a spark off his boot at contact
   const age=tau;if(age>-.05&&age<.3&&bg){const q=pr(c,C_BALL);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.1/toCam(c,C_BALL)[2],{n:8,seed:11,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.18)/.12)),width:6});}
   // "Top corner": a yellow burst in the corner as the net bulges
   const ga=t-G;if(ga>-.1&&ga<.7){const q=pr(c,NET);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.4/toCam(c,NET)[2],{n:10,seed:19,g:easeOutBack(clamp((ga+.1)/.2))*(1-clamp((ga-.45)/.25)),width:6});}
  }});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(HERO,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:13.4,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low touchline camera on his right
const tau2=(t:number)=>key(t,[[0,-1.9],[CUEW(1,'Eyes'),-1.25],[CUEW(1,'standing'),-.34],[CUEW(1,'strikes'),-.05],[CUEW(1,'laces'),.005],[CUEW(1,'right through'),.08],[SECS(1),.6]],linear);
/** his right side (the kicking side) on the ground */
const RIGHT:Pt=[Math.sin(YAW_S),Math.cos(YAW_S)];
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(HERO,Math.min(tau,.3)),open=1-sm(0,1.2,t,easeInOutSine),push=sm(CUEW(1,'standing')-.3,CUEW(1,'laces')+.3,t,easeInOutSine),after=sm(CUEW(1,'right through')-.3,SECS(1),t,easeInOutSine);
 const d=8.2+3*open-1.6*push+1.5*after,C:V3=[m[0]+RIGHT[0]*d-FWD[0]*(1.2-1.2*after),1.0+.4*open,m[1]+RIGHT[1]*d-FWD[1]*(1.2-1.2*after)],T:V3=[m[0]+FWD[0]*(.6+2.2*after),.8-.14*push+.4*after,m[1]+FWD[1]*(.6+2.2*after)];
 return look(C,T,2500+500*push-300*after-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ey=CUEW(1,'Eyes'),sf=CUEW(1,'standing'),st=CUEW(1,'strikes'),la=CUEW(1,'laces'),th=CUEW(1,'right through'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  shotPath(s,c,tau,sm(th-.1,th+.3,t)*(1-sm(E-.9,E-.5,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,near:4.5,after:({hero,bg,br})=>{
   sight(s,c,hero,bg,sm(ey-.05,ey+.35,t,easeOut)*(1-sm(sf+.2,sf+.5,t)));
   plant(s,c,hero,sm(sf-.05,sf+.3,t,easeOutBack)*(1-sm(la+.3,la+.6,t)));
   // "strikes it": the contact spark
   const age=t-st;if(age>-.2&&age<.6&&bg)sparkBurst(s,Y,bg[0],bg[1],br*4,{n:9,seed:13,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(4,br*.3)});
   laces(s,hero,sm(la-.1,la+.25,t,easeOutBack)*(1-sm(th+.2,th+.5,t)));
   // "right through the ball": the target on the ball as it leaves the boot, the arrow along the flight
   if(bg){const b=ballAt(tau),q=pr(c,ballAt(tau+.05)),dir=q?Math.atan2(q[1]-bg[1],q[0]-bg[0]):0;void b;target(s,bg,br,sm(th-.15,th+.25,t,easeOutBack)*(1-sm(E-.9,E-.5,t)),dir);}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: over the back-pedalling Molina into the top corner, then the celebration
const tau3=(t:number)=>{const tc=CUEW(2,'top');return key(t,[[0,-.25],[CUEW(2,'Over'),0],[CUEW(2,'keeper'),.95],[tc,IN_NET+.02],[CUEW(2,'The derby'),IN_NET+.9],[SECS(2),IN_NET+.9+(SECS(2)-CUEW(2,'The derby'))*.8]],linear);};
const swing3=(t:number)=>sm(CUEW(2,'top')+.35,CUEW(2,'The derby')+.4,t,easeInOutSine);
const tilt3=(t:number)=>sm(CUEW(2,'one-one')-.5,CUEW(2,'one-one')+.5,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),up=tilt3(t),b=ballAt(Math.min(tau,IN_NET)),m=smooth(HERO,tau);
 const C0:V3=[114,3.4,3.2],T0:V3=[lerp(80,b[0],.4),lerp(2.4,b[1],.45),lerp(1,b[2],.4)];
 const C1:V3=[m[0]+7,2.4+1.5*up,m[1]+11],T1:V3=[m[0]-3*up,1.1+2.6*up,m[1]+5*up];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(1900+700*sm(0,CUEW(2,'top'),t),3000-900*up,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ov=CUEW(2,'Over'),tc=CUEW(2,'top'),oo=CUEW(2,'one-one');
  stadium(s,c,v,t,{roar:sm(tc,tc+.4,t),flash:sm(tc-.1,tc+.3,t)*(1-sm(tc+1.5,tc+2,t))+sm(oo-.2,oo+.2,t)*.6});
  ground(s,c,{goalLater:true});
  // "Over forty metres": the distance ticks run up the grass, the red flight line grows behind the ball
  distanceDots(s,c,sm(ov-.1,ov+.9,t)*(1-sm(tc+.4,tc+.9,t)));
  shotPath(s,c,tau,sm(ov-.1,ov+.3,t)*(1-sm(tc+.6,tc+1.1,t)));
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,near:6,after:({bg,br})=>{
   if(bg&&tau>0&&tau<IN_NET){const q=pr(c,ballAt(tau-.05));if(q)speedLines(s,K,bg[0],bg[1],Math.atan2(bg[1]-q[1],bg[0]-q[0]),{n:5,seed:17,len:br*6,spread:br*1.2,width:Math.max(2,br*.2),cov:.7});}}});
  goal3(s,c,105,1,bulgeAt(tau));
  // "top corner": a yellow burst in the corner as the net bulges
  const age=t-tc;if(age>-.1&&age<.7){const q=pr(c,NET);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.9/toCam(c,NET)[2],{n:10,seed:19,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.45)/.25)),width:8});}
  // "one-one": the Bernabéu erupts — white and navy paper across the picture
  const cw=sm(oo-.1,oo+.4,t);if(cw>0){const fall=(t-oo)*140;confetti(s,['paper',K,Y],[-v.hx,-v.hy-300+fall,2*v.hx,v.hy*1.4],42,31,{size:64,cov:.95*cw});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HERO,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front three-quarter camera on the strike
const tau4=(t:number)=>key(t,[[0,-.55],[CUEW(3,'Your'),-.45],[CUEW(3,'strike'),-.06],[CUEW(3,'laces'),.005],[CUEW(3,'follow'),.2],[CUEW(3,'towards'),.42],[SECS(3),1.0]],linear);
function cam4(t:number):Cam{
 const push=sm(CUEW(3,'Your')-.2,CUEW(3,'laces')+.3,t,easeInOutSine),back=sm(CUEW(3,'towards')-.3,SECS(3),t,easeInOutSine);
 const base:Pt=[P0[0]-FWD[0]*.4,P0[1]-FWD[1]*.4],side:Pt=[FWD[0]*.5+RIGHT[0]*.87,FWD[1]*.5+RIGHT[1]*.87],d=7.2-1.2*push+5*back;
 const C:V3=[base[0]+side[0]*d-FWD[0]*2.5*back,1.05+.6*back,base[1]+side[1]*d-FWD[1]*2.5*back],T:V3=[base[0]+FWD[0]*(.7+5*back),.8+.6*back,base[1]+FWD[1]*(.7+5*back)];
 return look(C,T,2350+450*push-900*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUEW(3,'Your'),st=CUEW(3,'strike'),la=CUEW(3,'laces'),fo=CUEW(3,'follow'),tg=CUEW(3,'towards'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  shotPath(s,c,tau,sm(tg-.1,tg+.3,t)*(1-sm(E-.8,E-.4,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,near:5.5,after:({hero,bg,br})=>{
   // "Your turn": a yellow ring on the grass under the ball
   const yw=sm(yt-.1,yt+.35,t,easeOutBack)*(1-sm(st-.2,st+.1,t));
   if(yw>0){const b=ballAt(tau),pts:Pt[]=[];for(let i=0;i<32;i++){const q=pr(c,[b[0]+Math.cos(i/32*TAU)*.6*yw,0,b[2]+Math.sin(i/32*TAU)*.45*yw]);if(q)pts.push(q);}if(pts.length>24){const r=c.F*.05/toCam(c,[b[0],0,b[2]])[2];s.knockout(ribbon(pts,r*1.8,{close:true,seed:7,taper:0}),.85);s.fill(Y,ribbon(pts,r,{close:true,seed:7,taper:0}),.95);}}
   if(bg){const q=pr(c,ballAt(tau+.05)),dir=q?Math.atan2(q[1]-bg[1],q[0]-bg[0]):0;target(s,bg,br,sm(st-.1,st+.3,t,easeOutBack)*(1-sm(fo-.1,fo+.2,t)),dir);}
   laces(s,hero,sm(la-.1,la+.25,t,easeOutBack)*(1-sm(fo+.1,fo+.4,t)));
   followThrough(s,c,tau,sm(fo-.1,fo+.3,t)*(1-sm(E-.7,E-.35,t)));
   // "towards goal": speed lines off the ball racing away
   const lw=sm(tg-.1,tg+.2,t)*(1-sm(E-.8,E-.4,t));if(lw>0&&tau>0&&bg){const q=pr(c,ballAt(tau-.05));if(q)speedLines(s,K,bg[0],bg[1],Math.atan2(bg[1]-q[1],bg[0]-q[0]),{n:6,seed:23,len:br*7,spread:br*1.3,width:Math.max(2,br*.22),cov:.75*lw});}}});
 },
 still:3.4,
};

const film:RisoStory={
 id:'seedorf-signature',format:'11v11',title:"Seedorf's long-range thunderbolt",theme:'Long-range shooting: strike through the ball with your laces and follow through towards goal',
 ageNote:'Real Madrid v Atlético Madrid, La Liga, Santiago Bernabéu, Madrid, 30 August 1997. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a thump of turf — grass bits thrown up and a yellow strike spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and red dust thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
