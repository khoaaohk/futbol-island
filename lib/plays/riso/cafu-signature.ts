/** Iconic-play film · Cafu, "Signature: the endless right-wing run" — shown through one real, sourced moment: Germany v Brazil, World Cup
 * final, International Stadium Yokohama, 30 June 2002 (Brazil won 2–0), the 73rd minute, and the trophy lift that ended the night.
 *
 * WHY THIS MOMENT: Cafu's signature (lib/town/iconicPlays.json, kind "signature") is a trait — the tireless attacking right-back who defends
 * and attacks for the whole match. The Guardian's minute-by-minute of the 2002 final records the trait inside one match: early on Cafu is
 * back defending (10': Metzelder's "cross is hacked away at the last by Cafu"; 27': Bode's opening "is quickly shut by Cafu"), and in the
 * 73rd minute, with Brazil 1–0 up, "Cafu nearly finds Rivaldo in the box after a hectic run down the right". That late run in a World Cup
 * final is the film's moment; the closing touch is the same night's presentation: "As the heavens open, Cafu leaps onto a podium and is
 * handed the trophy. He takes an age to lift it to the skies but eventually, wheech, up it goes."
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - The Guardian, Scott Murray, "Brazil 2–0 Germany" minute-by-minute (30 June 2002)
 *    https://www.theguardian.com/football/2002/jun/30/minutebyminute.worldcupfootball2002  (guardian-bra-ger-2002-mbm.txt)
 *  - Wikipedia, "2002 FIFA World Cup final" (match summary, line-ups, kit boxes, 69,029, referee Collina, 8 pm kick-off, cloudy)
 *    https://en.wikipedia.org/wiki/2002_FIFA_World_Cup_final  (wiki-2002-wc-final.txt)
 *  - Wikipedia, "Cafu" (right-back known for "pace and energetic attacking runs along the right flank", "stamina", "overlapping attacking
 *    runs down the right flank and ... accurate crosses"; captain in 2002; lifted the trophy; nickname Pendolino)  (wiki-cafu.txt)
 *  - Wikipedia, "2002 FIFA World Cup Group C" and FIFA's archived Brazil v China page (checked for a sourced Cafu assist: none described).
 * CONFIRMED by those accounts: the match, date, venue, the 2–0 score (Ronaldo 67', 79' — so 1–0 at 73'); Cafu, captain, number 2, at right
 * wing-back in Brazil's 3-5-2; the 73rd-minute "hectic run down the right" that "nearly finds Rivaldo in the box"; Cafu's earlier defensive
 * clearances (not drawn as footage, only named by the lesson); the rain ("the heavens open") at the presentation; Cafu leaping onto a podium
 * and lifting the trophy. Kits (Wikipedia kit box for the final): Brazil yellow shirts, blue shorts, BLUE socks; Germany white shirts, black
 * shorts, white socks. Line-ups on at 73': Brazil Marcos; Lúcio, Edmílson, Roque Júnior; Cafu, Gilberto Silva, Kléberson, Ronaldinho,
 * Roberto Carlos; Ronaldo, Rivaldo. Germany Kahn; Linke, Ramelow, Metzelder; Frings, Schneider, Jeremies, Hamann, Bode; Neuville, Klose.
 * INFERRED (illustrative, never narrated as fact): where the run started (here: Kléberson's pass just inside Brazil's half) and every
 * position, path and timing; that the German who met him was Bode (Germany's left side) and the covering centre-back Metzelder; that he
 * went past on the outside; the cross being low and driven with his right foot; Rivaldo's stretch with his left and the ball rolling on
 * past the far post; which end Brazil attacked (the film: left to right from the main stand, so Cafu's right flank is the near side);
 * Kahn's dark kit, Marcos's, the referee's, skin screens and hair (Cafu shaved head); the stadium shape (a two-tier oval bowl around an
 * athletics track, a roof ring with floodlights along its front edge), the track colour, the crowd colours, the podium's size and place,
 * which team-mates stood near it, the trophy being handed up from the right, the TV clock graphic, the cameras and lenses.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, panning with the run (a small "73" clock bug appears on "seventy-three"); 2 = slow replay from a low rail camera on the track,
 * running beside him: past Bode on the outside, on down the wing, the cross (light teaching marks: his ring, his run to come); 3 = the
 * presentation in the rain from a low camera at the podium: the leap, the trophy handed up, the lift, flashbulbs; 4 = the lesson on the
 * right flank (the defending zone at his own box, the attacking zone at theirs, back and forward arrows, a ring that fills like a match
 * clock). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Scenes read only
 * (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {beats,shotAt,reframe,near,steady,type Pin,type Keep,type View as DView} from './director';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The run, live',text:'Yokohama, 2002, the World Cup final. Brazil lead Germany, seventy-three minutes gone... and Cafu is still running! The captain races down the right wing, past his man... and crosses for Rivaldo. So close!',seconds:15.2,
  cues:[[.2,'Yokohama'],[1.8,'the World Cup final'],[3.3,'Brazil lead Germany'],[4.7,'seventy-three'],[6.5,'Cafu is still running'],[8.2,'The captain'],[8.8,'races down'],[9.5,'the right wing'],[10.4,'past his man'],[11.6,'crosses'],[12.6,'Rivaldo'],[13.8,'So close']]},
 {label:'Watch it again',text:'Watch again, slowly. A defender, flying up the wing like an attacker, still sprinting late in the final.',seconds:8,
  cues:[[.15,'Watch again'],[1.4,'A defender'],[2.4,'flying up the wing'],[3.8,'like an attacker'],[5,'still sprinting'],[6,'late in the final']]},
 {label:'The captain',text:'Brazil won, two-nil. As the rain came down, Cafu jumped onto a podium and lifted the World Cup to the sky.',seconds:9.4,
  cues:[[.15,'Brazil won'],[1.3,'two-nil'],[2.4,'As the rain'],[3.1,'came down'],[3.9,'Cafu jumped'],[4.6,'onto a podium'],[5.7,'lifted'],[6.3,'the World Cup'],[7.3,'to the sky']]},
 {label:'Your turn',text:'Your turn: full-backs, defend and attack. Get back, then run forward. Keep running the whole game!',seconds:8.8,
  cues:[[.15,'Your turn'],[.9,'full-backs'],[1.8,'defend'],[2.5,'and attack'],[3.6,'Get back'],[4.4,'then run forward'],[5.8,'Keep running'],[6.8,'the whole game']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py cafu-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/cafu-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-cafu-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/cafu-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('cafu-signature: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',O='orange',B='blue',K='navy';
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
const frame=(s:Sheet)=>{const z=cam(s,0,0,1);DV={w:s.W/z,h:s.H/z};return view(s,z);};
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1566,h:1080};
/** the visible sheet rectangle in world units (through whatever transform is active) and world units per css px */
function screenBox(s:Sheet){const pw=s.width*s.dpr,ph=s.height*s.dpr,a=s.toWorld(0,0),b=s.toWorld(pw,ph);return{x0:Math.min(a[0],b[0]),y0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),y1:Math.max(a[1],b[1]),k:Math.abs(b[0]-a[0])/Math.max(1,s.width)};}

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Brazil attack +X, Germany's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera = Brazil's RIGHT flank, Cafu's wing). */
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

// ---------------------------------------------------------------- International Stadium Yokohama at night: an oval two-tier bowl around the track, a roof ring
const CX=52.5,NS=56;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (an oval superellipse outside the track), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(92+d)*Math.sign(c)*Math.pow(Math.abs(c),.7),y,(50+d)*Math.sign(s)*Math.pow(Math.abs(s),.7)];}
const LOW=(b:number):[number,number]=>[2+30*b,1.2+15*b],UP=(b:number):[number,number]=>[36+26*b,21+23*b];
type Bowl={low:V3[][];box:V3[][];up:V3[][];roof:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],box:[],up:[],roof:[],fascia:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.box.push([rim(a,32,16.2),rim(b,32,16.2),rim(b,36,21),rim(a,36,21)]);
  o.roof.push([rim(a,28,50),rim(b,28,50),rim(b,66,47),rim(a,66,47)]);
  o.fascia.push([rim(a,28,48.4),rim(b,28,48.4),rim(b,28,50.6),rim(a,28,50.6)]);
  o.lamps.push(rim(a+.5/NS*TAU,28,47.9));
  for(const [f,rows,up] of [[LOW,8,false],[UP,6,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),23);if(h<.2)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,6)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** everything behind the pitch: the night sky, the bowl, the crowd (roar lifts the seat marks, flash = camera flashes), the lit roof edge */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 // an 8 pm kick-off under cloud: a deep navy sky, a blue glow over the rim from the floodlights
 const sky=rectPath(-1e4,-1e4,2e4,2e4);s.tone(K,sky,.82);s.tone(B,sky,.4);
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),fas=new Path2D(),lamp=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
  add(BOWL.roof[i],roof);add(BOWL.up[i],up);add(BOWL.low[i],low);add(BOWL.box[i],box);add(BOWL.fascia[i],fas);
  const L=BOWL.lamps[i],d=toCam(c,L);if(d[2]>30){const g=scr(c,d),z=clamp(c.F*1.1/d[2],3,16);if(inView(v,g))lamp.addPath(polyPath([[g[0]-z*1.4,g[1]],[g[0],g[1]-z*.6],[g[0]+z*1.4,g[1]],[g[0],g[1]+z*.6]],true));}}
 s.knockout(roof);s.tone(K,roof,.9);s.tone(B,roof,.3);
 s.knockout(up);s.tone(B,up,.45);s.tone(K,up,.34);
 s.knockout(low);s.tone(B,low,.38);s.tone(K,low,.2);
 // the crowd: Brazil yellow (lots), white shirts, German white and black, blue, a few orange
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.45?1:q.h<.7?0:q.h<.82?3:q.h<.93?4:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(Y,inks[1],.9);s.fill(O,inks[2],.85);s.fill(B,inks[3],.9);s.fill(K,inks[4],.8);
 s.knockout(box);s.fill(K,box,.85);
 // the roof's front edge and its floodlights
 s.knockout(fas);s.fill(K,fas,.3);s.knockout(lamp);s.fill(Y,lamp,.55);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,5)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12+3);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the running track: a stadium oval, straights at z = ±R, bends round (52.5 ± 42.2, 0) */
function ovalPts(R:number,n=22):V3[]{const out:V3[]=[];for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI;out.push([CX+42.2+Math.cos(a)*R,0,Math.sin(a)*R]);}
 for(let i=0;i<=n;i++){const a=Math.PI/2+i/n*Math.PI;out.push([CX-42.2+Math.cos(a)*R,0,Math.sin(a)*R]);}return out;}
const TRACK_OUT=ovalPts(46.3),TRACK_IN=ovalPts(36.5),LANES=[ovalPts(39.8),ovalPts(43.1)];
/** the apron, the track (orange, inferred), the floodlit grass with mowing stripes, the paper lines, both goals */
function ground(s:Sheet,c:Cam,o:{goalLater?:boolean}={}){
 const ap=polyP(c,Array.from({length:48},(_,i)=>rim(i/48*TAU,0,0)));if(ap.length>2){const p=polyPath(ap,true);s.knockout(p);s.tone(K,p,.55);s.tone(B,p,.3);}
 const tr=polyP(c,TRACK_OUT);if(tr.length>2){const p=polyPath(tr,true);s.knockout(p);s.fill(O,p,.9);s.tone(K,p,.18);}
 const ln0=new Path2D();for(const L of LANES)for(let i=0;i<L.length;i++)seg3(c,L[i],L[(i+1)%L.length],.07,ln0);s.knockout(ln0,.7);
 const g=polyP(c,TRACK_IN);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 // corner arcs
 for(const [x,z,a0] of [[0,-34,0],[105,-34,Math.PI/2],[105,34,Math.PI],[0,34,-Math.PI/2]] as [number,number,number][])circ(x,z,1,a0,a0+Math.PI/2,4);
 s.knockout(ln);
 goal3(s,c,0,-1);
 if(!o.goalLater)goal3(s,c,105,1);
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
const LIGHT:InkFill[]=[[O,.2]],MID:InkFill[]=[[O,.75],[Y,.2]],DARK:InkFill[]=[[O,.88],[K,.2]];
/** Brazil in the 2002 final (Wikipedia kit box): yellow shirt, green trim (blue over yellow), blue shorts, BLUE socks */
const BRA=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:[B,.6],shorts:B,socks:B,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.6],seed:4,...o});
/** Germany in the 2002 final (Wikipedia kit box): white shirt, black shorts (navy), white socks; black trim */
const GER=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:K,shorts:[K,.9],socks:'paper',boots:K,skin:LIGHT,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:K,seed:30,...o});
/** Cafu: the captain, number 2, shaved head */
const CAFU_STYLE=BRA(DARK,{number:2,hairStyle:'bald',build:{height:1.76,bulk:1.02,thighs:1.08},seed:22});
/** Oliver Kahn (dark keeper's kit inferred), blond */
const KAHN:AthleteStyle={shirt:[K,.7],shorts:[K,.8],socks:[K,.7],boots:K,skin:LIGHT,hair:[Y,.6],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',trim:'paper',gloves:[Y,.5],build:{height:1.88,bulk:1.08},seed:51};
const MARCOS:AthleteStyle={shirt:[K,.5],shorts:[K,.7],socks:[K,.5],boots:K,skin:MID,hair:K,hairStyle:'short',line:K,sleeves:'long',seed:52};
/** Pierluigi Collina: bald; the kit colour is inferred */
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:LIGHT,hair:null,hairStyle:'bald',line:K,build:{height:1.88,bulk:.92},seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Cafu takes Kléberson's pass)
type Role='bra'|'ger'|'gk'|'ref';
/** a keyed action: kick (contact at `at`), lunge (full reach at `at`) */
type Act={kind:'kick'|'lunge';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];acts?:Act[];dribble?:[number,number,'l'|'r'][];engage?:[number,number,number];key?:boolean};
const CAFU=0,KLEB=1,RIVALDO=2,RONALDO=3,BODE=4,METZ=5,RAMELOW=6,LINKE=7,KAHN_I=8;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The beats come from the account ("a hectic run down the right", "nearly finds
 * Rivaldo in the box"); where exactly each player stood is inferred. */
const ACTORS:Actor[]=[
 {name:'Cafu',role:'bra',style:CAFU_STYLE,key:true,dribble:[[.05,5.7,'r'],[6.6,8,'r']],acts:[{kind:'kick',at:8.05,dur:.95,side:'r',power:.75}],
  keys:[[-4,28,26],[-2,35,27.5],[0,44.5,29],[1.5,53,29.5],[3,61.5,29.6],[4.5,70,29.8],[5.6,76.5,29.4],[6.1,79.5,30.8],[6.6,82.3,30.6],[7.2,86,29],[7.7,88.7,27.2],[8.05,90.4,25.8],[8.6,92.2,24.9],[10,94.3,24.2],[12,95.3,23.8]]},
 {name:'Kléberson',role:'bra',style:BRA(MID,{number:15,seed:15}),key:true,dribble:[[-4.5,-1.35,'r']],acts:[{kind:'kick',at:-1.2,dur:.8,side:'r',power:.45}],
  keys:[[-4.5,37,11.5],[-2.5,40.5,14.5],[-1.2,41.5,16],[0,44,15.5],[4,55,13],[12,75,10]]},
 {name:'Rivaldo',role:'bra',style:BRA(MID,{number:10,build:{height:1.86,bulk:.95},seed:10}),key:true,acts:[{kind:'lunge',at:8.72,dur:.8,side:'l'}],
  keys:[[-4.5,71,-6],[3,80,-5],[6,87,-3],[7.8,92.5,-1.2],[8.4,95.2,-.3],[8.75,96.6,.1],[9.3,97.2,.3],[12,97.3,1]]},
 {name:'Ronaldo',role:'bra',style:BRA(MID,{number:9,hairStyle:'bald',build:{height:1.83,bulk:1.06},seed:9}),key:true,
  keys:[[-4.5,79,4],[4,86,2],[7,93,-3],[8.6,98.5,-5.5],[9.5,99.4,-6],[12,99,-5]]},
 {name:'Bode',role:'ger',style:GER({number:17,hair:[O,.5],build:{height:1.9},seed:37}),key:true,engage:[4,6.6,CAFU],acts:[{kind:'lunge',at:5.85,dur:.8,side:'l'}],
  keys:[[-4.5,75,20],[2,72.5,25],[4.5,75.5,27.8],[5.2,79.5,28.2],[5.8,78.8,28.8],[6.5,78.4,29.4],[7.3,80,29.6],[8.2,83,29.2],[10,88,28],[12,90,27]]},
 {name:'Metzelder',role:'ger',style:GER({number:21,build:{height:1.93},seed:41}),key:true,engage:[6.6,8.4,CAFU],acts:[{kind:'lunge',at:8.02,dur:.8,side:'r'}],
  keys:[[-4.5,88,14],[5,88,20],[7,89,23.5],[7.8,90.1,24.2],[9,91,23.5],[12,92,22]]},
 {name:'Ramelow',role:'ger',style:GER({number:5,hair:[K,.9],seed:35}),key:true,acts:[{kind:'lunge',at:8.55,dur:.8,side:'l'}],
  keys:[[-4.5,86,4],[6,91,5],[8,94.5,4],[8.6,95.8,2.6],[10,96.5,2],[12,97,2]]},
 {name:'Linke',role:'ger',style:GER({number:2,hairStyle:'balding',seed:32}),keys:[[-4.5,90,-8],[8,96.5,-8],[9,98.5,-9.5],[12,99.5,-9.5]]},
 {name:'Kahn',role:'gk',style:KAHN,key:true,keys:[[-4.5,100.5,1],[7,102,4],[8.4,102.8,2.5],[9,103,.5],[10,103,-2.5],[12,103,-4]]},
 {name:'Frings',role:'ger',style:GER({number:22,seed:38}),keys:[[-4.5,80,-26],[12,92,-17]]},
 {name:'Hamann',role:'ger',style:GER({number:8,hair:[K,.7],build:{height:1.89},seed:39}),keys:[[-4.5,58,8],[12,82,6]]},
 {name:'Schneider',role:'ger',style:GER({number:19,seed:40}),keys:[[-4.5,62,-14],[12,82,-11]]},
 {name:'Jeremies',role:'ger',style:GER({number:16,hair:[K,.9],seed:42}),keys:[[-4.5,55,15],[12,78,16]]},
 {name:'Neuville',role:'ger',style:GER({number:7,seed:43}),keys:[[-4.5,44,-4],[12,60,-2]]},
 {name:'Klose',role:'ger',style:GER({number:11,seed:44}),keys:[[-4.5,47,6],[12,62,5]]},
 {name:'Gilberto Silva',role:'bra',style:BRA(DARK,{number:8,hairStyle:'bald',build:{height:1.91},seed:8}),keys:[[-4.5,40,2],[12,60,2]]},
 {name:'Ronaldinho',role:'bra',style:BRA(DARK,{number:11,hairStyle:'long',seed:11}),keys:[[-4.5,60,-10],[12,78,-8]]},
 {name:'Roberto Carlos',role:'bra',style:BRA(DARK,{number:6,hairStyle:'bald',build:{height:1.68,bulk:1.1,thighs:1.25},seed:6}),keys:[[-4.5,48,-26],[12,62,-24]]},
 {name:'Edmílson',role:'bra',style:BRA(DARK,{number:5,seed:5}),keys:[[-4.5,28,0],[12,42,0]]},
 {name:'Lúcio',role:'bra',style:BRA(MID,{number:3,seed:3}),keys:[[-4.5,30,12],[12,44,12]]},
 {name:'Roque Júnior',role:'bra',style:BRA(DARK,{number:4,seed:2}),keys:[[-4.5,30,-12],[12,44,-12]]},
 {name:'Marcos',role:'gk',style:MARCOS,keys:[[-4.5,8,0],[12,14,0]]},
 {name:'referee',role:'ref',style:REF,keys:[[-4.5,60,4],[6,72,8],[12,84,10]]},
];
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4.5,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
/** an actor's running heading (x, z) — the last clear direction of travel */
function headOf(k:number,tau:number):[number,number]{for(const dt of [0,-.3,-.7,.4]){const v=velOf(k,tau+dt),l=Math.hypot(v[0],v[1]);if(l>.6)return[v[0]/l,v[1]/l];}return[1,0];}
/** the ball spot at an actor's foot: ahead and a touch to the kicking side (right = (−fz, fx)) */
const footAt=(k:number,tau:number,side:'l'|'r'='r',ahead=.5):V3=>{const p=posOf(k,tau),[fx,fz]=headOf(k,tau),s=side==='r'?.14:-.14;return[p[0]+fx*ahead-fz*s,.11,p[1]+fz*ahead+fx*s];};

// ---------------------------------------------------------------- the ball: Kléberson's pass, the run, the knock past Bode, the cross, the near miss
const RECEIVE=0,KNOCK=5.75,CROSS=8.05,MISS_T=8.75,OUT_T=10;
const MISS:V3=[97.9,.12,-.6],OUT:V3=[104.2,.11,-14],REST:V3=[107,.11,-18.5];
type Leg={t0:number;t1:number;a:()=>V3;b:()=>V3;h:number;ease?:number};
/** passes between feet (a, b evaluated at the leg's ends); h = apex height */
const LEGS:Leg[]=[
 {t0:-1.2,t1:RECEIVE,a:()=>footAt(KLEB,-1.2),b:()=>footAt(CAFU,RECEIVE),h:.35,ease:.35},
 {t0:KNOCK,t1:6.6,a:()=>footAt(CAFU,KNOCK),b:()=>footAt(CAFU,6.6,'r',.6),h:.12,ease:.3},
 {t0:CROSS,t1:MISS_T,a:()=>footAt(CAFU,CROSS),b:()=>MISS,h:.45,ease:.15},
 {t0:MISS_T,t1:OUT_T,a:()=>MISS,b:()=>OUT,h:0,ease:.2},
];
/** on the ball: [from, to, actor, foot] */
const HOLDS:[number,number,number,'l'|'r'][]=[[-9,-1.2,KLEB,'r'],[RECEIVE,KNOCK,CAFU,'r'],[6.6,CROSS,CAFU,'r']];
function ballAt(tau:number):V3{
 for(const [a,b,k,f] of HOLDS)if(tau>=a&&tau<b){const p=footAt(k,tau,f,.5),pulse=.22*Math.max(0,Math.sin(distOf(k,tau)/2.2*TAU));const[fx,fz]=headOf(k,tau);return[p[0]+fx*pulse,.11,p[2]+fz*pulse];}
 for(const L of LEGS)if(tau>=L.t0&&tau<L.t1){const a=L.a(),b=L.b(),u=(tau-L.t0)/(L.t1-L.t0),e=lerp(u,1-(1-u)*(1-u),L.ease??0);
  return[lerp(a[0],b[0],e),lerp(a[1],b[1],e)+L.h*4*e*(1-e),lerp(a[2],b[2],e)];}
 const u=clamp((tau-OUT_T)/1.4),e=1-(1-u)*(1-u);return[lerp(OUT[0],REST[0],e),.11,lerp(OUT[2],REST[2],e)];
}

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** "so close": hands to the head */
const HANDS_HEAD:Partial<Pose>={lShF:150,rShF:150,lShA:48,rShA:48,lElb:128,rElb:128,lHand:1,rHand:1,neckP:-14,lean:-4};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 const hd=headOf(k,tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):Math.hypot(b[0]-x,b[2]-z)<1.4?yawOf(hd[0],hd[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage){const[e0,e1,tk]=a.engage,m=posOf(tk,tau);if(tau>e0&&tau<e1+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(e0,e0+.4,tau),1-sm(e1,e1+.4,tau)));}
 if(a.role==='gk'&&k===KAHN_I)yaw=yawOf(b[0]-x,b[2]-z);
 if(a.role==='ref'&&sp<.4)yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ger'?READY:stand();
 const dr=a.dribble?.find(d=>tau>d[0]-.2&&tau<d[1]+.3);
 if(dr){const w=Math.min(sm(dr[0]-.2,dr[0]+.2,tau),1-sm(dr[1],dr[1]+.3,tau));const run=runCycle(distOf(k,tau)/3.6,{speed:clamp((sp-2)/5)}),db=dribble(distOf(k,tau)/2.6,{foot:dr[2],speed:.45+.45*clamp((sp-1.5)/4)});
  p=blendPose(blendPose(idle,run,clamp((sp-.4)/.9)),db,w*clamp((sp-.2)/.6+.4)*(k===CAFU?.8:1));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.2);p=blendPose(idle,runCycle(distOf(k,tau)/(k===CAFU?4:3.4),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.acts??[]){
  if(mv.kind==='kick'){const st=mv.at-STRIKE_CONTACT*mv.dur,u=(tau-st)/mv.dur;
   if(u>0&&u<1.45){const w=Math.min(sm(0,.18,u),1-sm(1,1.45,u)),b0=ballAt(mv.at+.02),b1=ballAt(mv.at+.3),aim=yawOf(b1[0]-b0[0],b1[2]-b0[2]);
    p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.6}),w);
    // a cross is struck across the body: the hips open a little away from the line of the ball
    const off=mv.side==='r'?.3:-.3;yaw=lerpA(yaw,aim+off,w*sm(0,.4,u));}}
  const t0=mv.at-.6*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 // the near miss: Rivaldo and Cafu put their hands to their heads
 if((k===RIVALDO||k===CAFU||k===RONALDO)&&tau>MISS_T+.25)p=over(p,HANDS_HEAD,sm(MISS_T+.25,MISS_T+.8,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;heroes:Map<number,DrawResult>};
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
 // the Fevernova: white with gold (drawn with the yellow ink as its shadow ink)
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:Math.hypot(b[0],b[2])/.11,key:K,shadow:Y,seed:3});};
 let ballDone=!list.length||bq[2]>=list[0].d;const heroes=new Map<number,DrawResult>();if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only Cafu keeps 'mid'
  const detail=passing?(e.k===CAFU?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(a.key||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===CAFU}:{});
  if(a.key)heroes.set(e.k,r);}
 if(!ballDone)drawBall();
 const out={list,bg,br,heroes};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** the TV match clock bug, top left: a navy tab, "73" in paper segments and a yellow strip; w = 0..1 (slides in) */
const SEG:Record<string,string>={'7':'abc','3':'abcdg','2':'abdeg','0':'abcdef'};
function clockBug(s:Sheet,w:number,text:string){if(w<=.01)return;const bx=screenBox(s),k=bx.k,h=22*k,x=bx.x0+14*k-(1-w)*120*k,y=bx.y0+14*k;
 const tab=new Path2D();tab.rect(x,y,h*2.4,h);s.knockout(tab,.9*w);s.fill(K,tab,.95*w);
 const strip=new Path2D();strip.rect(x,y+h,h*2.4,h*.18);s.fill(Y,strip,.95*w);
 const dg=new Path2D(),dw=h*.42,dh=h*.64,t=h*.1;
 [...text].forEach((ch,i)=>{const ox=x+h*.3+i*(dw+h*.22),oy=y+h*.18,S:Record<string,[number,number,number,number]>={a:[ox,oy,dw,t],b:[ox+dw-t,oy,t,dh/2],c:[ox+dw-t,oy+dh/2,t,dh/2],d:[ox,oy+dh-t,dw,t],e:[ox,oy+dh/2,t,dh/2],f:[ox,oy,t,dh/2],g:[ox,oy+dh/2-t/2,dw,t]};
  for(const sg of SEG[ch]??'')dg.rect(...S[sg]);});
 const tick=new Path2D();tick.rect(x+h*.3+text.length*(dw+h*.22),y+h*.18,t,h*.2);dg.addPath(tick);
 s.knockout(dg,w);}

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
/** a zone on the grass (the defending area at his own box, the attacking area at theirs) with a breathing dashed outline */
function zone(s:Sheet,c:Cam,P:[number,number][],w:number,t:number,ink:string,seed:number){if(w<=0)return;
 const n=P.length,cx=P.reduce((a,p)=>a+p[0],0)/n,cz=P.reduce((a,p)=>a+p[1],0)/n,pts:Pt[]=[];
 for(let i=0;i<n*6;i++){const a=P[Math.floor(i/6)],b=P[(Math.floor(i/6)+1)%n],u=(i%6)/6,br=1+.03*Math.sin(t*5)*w;const q=pr(c,[cx+(lerp(a[0],b[0],u)-cx)*br,0,cz+(lerp(a[1],b[1],u)-cz)*br]);if(q)pts.push(q);}
 if(pts.length<n*4)return;const zp=polyPath(pts,true);s.tone(ink,zp,.6*w);s.knockout(zp,.2*w);
 const q=toCam(c,[cx,0,cz]);s.fill(ink,ribbon(pts,Math.max(5,c.F*.16/Math.max(4,q[2])),{close:true,seed,taper:0,wobble:1.4,gaps:[[.1,.16],[.3,.36],[.5,.56],[.7,.76],[.9,.96]]}),.95*w);}
const DEF_ZONE:[number,number][]=[[3,14],[18,13],[21,24],[16,32],[4,31]],ATT_ZONE:[number,number][]=[[86,13],[101,13],[103,24],[98,32],[85,31]];
/** a ring on the grass around a ground point that fills clockwise like a match clock (progress u) */
function clockRing(s:Sheet,c:Cam,x:number,z:number,u:number,w:number,t:number){if(w<=0)return;
 const R=2.3,all:Pt[]=[],fill:Pt[]=[];for(let i=0;i<=48;i++){const a=-Math.PI/2+i/48*TAU,q=pr(c,[x+Math.cos(a)*R,0,z+Math.sin(a)*R]);if(!q)return;all.push(q);if(i/48<=u)fill.push(q);}
 const d=toCam(c,[x,0,z])[2],wd=Math.max(5,c.F*.16/Math.max(3,d));
 s.knockout(ribbon(all,wd*1.8,{close:true,seed:91,taper:0}),.6*w);s.tone(K,ribbon(all,wd,{close:true,seed:91,taper:0}),.35*w);
 if(fill.length>1)s.fill(Y,ribbon(fill,wd*1.15,{seed:92,taper:.05,wobble:1}),.95*w);
 // the tick at 12 o'clock and a travelling spark at the tip
 if(fill.length>1&&u<1){const tip=fill[fill.length-1];sparkBurst(s,Y,tip[0],tip[1],wd*2.2,{n:6,seed:93+Math.floor(t*12),g:.8*w,width:wd*.6});}}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (≈ real time; slight catch-up between "past his man" and the cross) */
const tau1=(t:number)=>{const SC=CUEW(0,'So close');return key(t,[[0,-4.3],[CUEW(0,'Brazil lead'),-1.5],[CUEW(0,'seventy'),0],[CUEW(0,'races'),4],[CUEW(0,'past his man'),6],[CUEW(0,'crosses'),CROSS],[CUEW(0,'Rivaldo'),MISS_T],[SC,9.3],[SECS(0)+1,9.3+(SECS(0)+1-SC)*.85]],linear);};
const CAM1:V3=[60,30,86];
/** Director beats (lib/plays/riso/director.ts, Oct 4 2026): a short establishing wide of the bowl, follow Kléberson on the ball, pull out just enough to hold
 * his pass and Cafu running onto it, follow the captain down the wing with the space ahead of him, push in low as he knocks it past
 * Bode (the man being beaten stays in frame), pull back out for the cross so Rivaldo and the goal are in shot, push in on Rivaldo's stretch
 * as the ball rolls past, and hold on the "so close" reaction. */
const B1=beats([[0,'wide'],[.9,'follow'],[CUEW(0,'Brazil lead')-.2,{from:'space',size:.28}],[CUEW(0,'seventy')-.1,{from:'follow',size:.38}],
 [CUEW(0,'past his man')-.7,'tight'],[CUEW(0,'crosses')-.75,{from:'space',size:.24}],[CUEW(0,'Rivaldo')+.1,'tight'],[CUEW(0,'So close')+.3,'reaction']]);
/** the German players (soft keeps: the man Cafu beats, the markers round Rivaldo) */
const FOES=ACTORS.map((a,k)=>a.role==='ger'||a.role==='gk'?k:-1).filter(k=>k>=0);
const foesAt=(tau:number):V3[]=>FOES.map(k=>{const[x,z]=posOf(k,tau);return[x,0,z] as V3;});
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
/** the directed camera, averaged over ±.45 s by steady() so no frame-to-frame snap survives (keeps and hand-overs also ramp ≥ .6 s) */
function cam1(t:number):Cam{const p=steady(t,dir1,.5,5);return look(p.eye,p.target,p.F);}
function dir1(t:number):Pin{const c=cam1Authored(t),tau=tau1(t),sh=shotAt(t,B1);if(sh.k<=1e-4)return{eye:c.C,target:c.T,F:c.F};
 // the subject follows the ball: Kléberson on it, handing over to Cafu while his pass travels, then to Rivaldo while the cross is in the
 // air (blended, never a hard switch)
 const take=sm(CUEW(0,'Brazil lead')+.1,CUEW(0,'seventy')-.2,t,easeInOutSine),hand=sm(CUEW(0,'crosses')-.4,CUEW(0,'Rivaldo')+.9,t,easeInOutSine);
 const k0=posOf(KLEB,tau),a=posOf(CAFU,tau),b=posOf(RIVALDO,tau),ax=lerp(k0[0],a[0],take),az=lerp(k0[1],a[1],take),hero:V3=[lerp(ax,b[0],hand),0,lerp(az,b[1],hand)];
 const keep:Keep[]=near(hero,foesAt(tau),3.5,7);
 // Kléberson's pass (it leaves his foot ≈ .3–.7 s after "Brazil lead"): the passer until the ball has gone, the receiver from just before it is struck
 const BL=CUEW(0,'Brazil lead'),kw=sm(BL-.9,BL-.2,t,easeInOutSine)*(1-sm(BL+.5,BL+1.2,t,easeInOutSine)),cw=sm(BL-.4,BL+.3,t,easeInOutSine)*(1-sm(CUEW(0,'seventy')-.4,CUEW(0,'seventy')+.3,t,easeInOutSine));
 if(kw>.01)keep.push({P:at3(KLEB,tau),w:kw},{P:at3(KLEB,tau,1.8),w:kw});if(cw>.01)keep.push({P:at3(CAFU,tau),w:cw},{P:at3(CAFU,tau,1.8),w:cw});
 // the cross: Rivaldo arriving and the near post stay in frame
 const box=sm(CUEW(0,'crosses')-1.3,CUEW(0,'crosses')-.6,t,easeInOutSine)*(1-hand);if(box>.01)keep.push({P:at3(RIVALDO,tau),w:box},{P:at3(RIVALDO,tau,1.86),w:box},{P:[105,0,3.66],w:box});
 return reframe({eye:c.C,target:c.T,F:c.F},{hero,ball:ballAt(tau),keep},sh,DV);}
function cam1Authored(t:number):Cam&{T:V3}{
 const tau=tau1(t),S=SECS(0);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.25),b2=bs(tau-.5),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // as he nears the box the director widens to hold the box and Rivaldo arriving
 const box=sm(6.3,8.3,tau),tb:V3=[lerp(bt[0],93,box*.55),1.2,lerp(bt[2],12,box*.6)];
 const open:V3=[48,4,4],toBall=sm(.2,CUEW(0,'the World')+1,t,easeInOutSine);
 const T=lerp3(open,tb,toBall);
 const F=key(t,[[0,1700],[CUEW(0,'Brazil lead'),3900],[CUEW(0,'Cafu is'),4500],[CUEW(0,'races'),4300],[CUEW(0,'crosses'),3700],[CUEW(0,'So close'),4200],[S,4600]],easeInOutSine);
 return{...look(CAM1,T,F),T};
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t));
  stadium(s,c,v,t,{roar:sm(CUEW(0,'crosses'),CUEW(0,'crosses')+.4,t)*(1-sm(CUEW(0,'So close')+.3,SECS(0),t))});
  ground(s,c);
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
  clockBug(s,sm(CUEW(0,'seventy')-.2,CUEW(0,'seventy')+.35,t,easeOutBack),'73');
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(CAFU,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:10.6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low rail camera on the track beside him: past Bode, down the wing, the cross
const tau2=(t:number)=>key(t,[[0,3.3],[CUEW(1,'A defender'),4.1],[CUEW(1,'flying'),4.8],[CUEW(1,'like an'),KNOCK+.05],[CUEW(1,'still'),7],[CUEW(1,'late'),CROSS],[SECS(1),9.1]],linear);
/** Director beats for the replay: the wipe opens on the authored rail shot, then follow him "flying up the wing" with the dashed run ahead
 * in frame, push in low as he knocks it past Bode (Bode stays in shot), follow the sprint, and pull out for the cross so Rivaldo and the
 * box are in frame. */
const B2=beats([[0,'wide'],[CUEW(1,'A defender')-.4,'follow'],[CUEW(1,'like an')-.45,'tight'],[CUEW(1,'still')-.4,'follow'],[CUEW(1,'late')-.4,{from:'space',size:.24}]]);
function cam2(t:number):Cam{const p=steady(t,dir2,.45,5);return look(p.eye,p.target,p.F);}
function dir2(t:number):Pin{const c=cam2Authored(t),sh=shotAt(t,B2);if(sh.k<=1e-4)return{eye:c.C,target:c.T,F:c.F};
 const tau=tau2(t),hero=at3(CAFU,tau),keep=near(hero,foesAt(tau),3.5,7),fl=CUEW(1,'flying'),lt=CUEW(1,'late');
 // "flying up the wing": the run ahead of him; "late in the final": Rivaldo and the near post for the cross
 const run=bump(fl-.3,CUEW(1,'like an')-.2,t);if(run>.01)keep.push({P:at3(CAFU,Math.min(CROSS,tau+1)),w:Math.min(1,run*1.5)});
 const box=sm(lt-.8,lt,t,easeInOutSine);if(box>.01)keep.push({P:at3(RIVALDO,tau),w:box},{P:at3(RIVALDO,tau,1.86),w:box},{P:[105,0,3.66],w:box});
 return reframe({eye:c.C,target:c.T,F:c.F},{hero,ball:ballAt(tau),keep},sh,DV);}
function cam2Authored(t:number):Cam&{T:V3}{
 const tau=tau2(t),m=smooth(CAFU,Math.min(tau,CROSS+.3)),g=sm(CROSS-.9,CROSS+.6,tau,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine);
 const C:V3=[m[0]-6.5-2*g-3*open,2.3+1.2*g,39.5+1.5*g];
 const T:V3=[lerp(m[0]+4.5,93.5,g),lerp(1,1.1,g),lerp(m[1]-2.5,9,g)];
 return{...look(C,T,lerp(1900,1500,g)-250*open),T};
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ad=CUEW(1,'A defender'),fl=CUEW(1,'flying'),la=CUEW(1,'like an'),st=CUEW(1,'still'),lt=CUEW(1,'late');
  stadium(s,c,v,t);
  ground(s,c);
  // "flying up the wing": his run to come, dashed yellow along the touchline
  pathArrow(s,c,CAFU,Math.max(tau,4),CROSS,sm(fl-.2,fl+.5,t,easeOut)*(1-sm(st-.2,st+.3,t)),Y,{dashed:true,seed:71});
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,rings:[[CAFU,sm(ad-.15,ad+.3,t,easeOutBack)*(1-sm(fl+.3,fl+.8,t)),Y],[BODE,sm(la-.35,la,t,easeOutBack)*(1-sm(la+.5,la+.9,t)),O]],after:({bg})=>{
   // "like an attacker": a spark on the knock past; "late in the final": a spark on the cross
   for(const [T0,sd] of [[KNOCK,77],[CROSS,79]] as [number,number][]){const age=tau-T0;if(age>-.05&&age<.4&&bg)sparkBurst(s,Y,bg[0],bg[1],c.F*.5/Math.max(2,toCam(c,ballAt(tau))[2]),{n:9,seed:sd,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.22)/.15)),width:10});}
  }});
  clockBug(s,sm(lt-.3,lt+.2,t,easeOutBack),'73');
  // the replay wipe as the chapter opens; speed streaks while he's "still sprinting"
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,bump(st-.2,lt+.2,t)*.45,27,.02);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(CAFU,tau2(t)),q=toCam(c,[x,1.2,z]);if(q[2]<NEAR)return apertureDisc(0,0,10,12);const g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · the captain: the presentation in the rain, a low camera at the podium
const PX=52.5,PZ=22,PH=.5;
/** the podium box (size inferred), paper edges */
function podium(s:Sheet,c:Cam){const x0=PX-.9,x1=PX+.9,z0=PZ-.6,z1=PZ+.6;
 const top=polyP(c,[[x0,PH,z0],[x1,PH,z0],[x1,PH,z1],[x0,PH,z1]]),front=polyP(c,[[x0,0,z1],[x1,0,z1],[x1,PH,z1],[x0,PH,z1]]),side=polyP(c,[[x0,0,z0],[x0,0,z1],[x0,PH,z1],[x0,PH,z0]]);
 const f=new Path2D();if(front.length>2)f.addPath(polyPath(front,true));if(side.length>2)f.addPath(polyPath(side,true));s.knockout(f);s.fill(K,f,.9);s.tone(B,f,.4);
 if(top.length>2){const tp=polyPath(top,true);s.knockout(tp);s.fill(B,tp,.8);s.tone(K,tp,.3);}
 const e=new Path2D();seg3(c,[x0,PH,z1],[x1,PH,z1],.04,e);seg3(c,[x0,PH,z1],[x0,0,z1],.04,e);s.knockout(e,.85);}
/** the World Cup trophy, standing on the midpoint of his hands (world), 0.37 m tall: malachite bands (blue over yellow), golden figures
 * spiralling up to the globe; glint = a spark */
function trophy(s:Sheet,c:Cam,base:V3,glint:number,t:number){
 const A=pr(c,base),Bt=pr(c,[base[0],base[1]+.37,base[2]]);if(!A||!Bt)return;const L=Math.hypot(Bt[0]-A[0],Bt[1]-A[1]);if(L<3)return;
 const ax=[(Bt[0]-A[0])/L,(Bt[1]-A[1])/L],nx=[-ax[1],ax[0]],P=(u:number,w:number):Pt=>[A[0]+ax[0]*L*u+nx[0]*L*w,A[1]+ax[1]*L*u+nx[1]*L*w];
 const prof:[number,number][]=[[0,.2],[.14,.19],[.2,.11],[.4,.085],[.55,.13],[.68,.19],[.74,.16]];
 const body:Pt[]=[...prof.map(([u,w])=>P(u,w)),...prof.slice().reverse().map(([u,w])=>P(u,-w))],bp=polyPath(body,true);
 const gC=P(.83,0),gr=L*.15,globe=new Path2D();globe.arc(gC[0],gC[1],gr,0,TAU);
 const all=new Path2D();all.addPath(bp);all.addPath(globe);s.knockout(all);s.fill(Y,all,.97);s.tone(O,all,.35);
 const bands=polyPath([P(.02,.2),P(.06,.2),P(.06,-.2),P(.02,-.2)],true);bands.addPath(polyPath([P(.09,.195),P(.13,.19),P(.13,-.19),P(.09,-.195)],true));s.fill(B,bands,.85);
 // the figures' spiral and the globe's shade
 const sp=new Path2D();for(const ph of [0,Math.PI]){const pts:Pt[]=[];for(let i=0;i<=10;i++){const u=.2+i/10*.52,w=(.09+.1*i/10)*Math.sin(ph+i/10*2.4*Math.PI);pts.push(P(u,w));}sp.addPath(ribbon(pts,Math.max(1.5,L*.025),{seed:5,taper:.3}));}
 s.fill(O,sp,.8);const sh=new Path2D();sh.arc(gC[0]+gr*.25,gC[1],gr*.8,0,TAU);s.tone(O,sh,.4);
 s.stroke(K,all,Math.max(1.2,L*.018),.85);
 if(glint>0)sparkBurst(s,Y,gC[0]-gr*.3,gC[1]-gr*.3,L*.9,{n:8,seed:97+Math.floor(t*6),g:glint,width:Math.max(3,L*.04)});}
/** the rain: short slanted streaks falling through the frame (knocked out = lit by the floodlights), density w */
function rain(s:Sheet,t:number,w:number){if(w<=.02)return;const bx=screenBox(s),Wd=bx.x1-bx.x0,Hd=bx.y1-bx.y0,k=bx.k,p=new Path2D(),n=Math.round(70*w);
 for(let i=0;i<n;i++){const L=(14+hash(i,3)*22)*k,sp=(700+hash(i,4)*500)*k,x=bx.x0+((hash(i,1)*Wd+t*sp*.25)%Wd),y=bx.y0+((hash(i,2)*Hd+t*sp)%(Hd+L))-L;
  p.moveTo(x,y);p.lineTo(x+L*.25,y+L);p.lineTo(x+L*.25+1.4*k,y+L);p.lineTo(x+1.4*k,y);p.closePath();}
 s.knockout(p,.9);s.tone(B,p,.25);}
/** team-mates at the podium (positions and who stood there inferred) */
const MATES:{style:AthleteStyle;x:number;z:number;ph:number}[]=[
 {style:BRA(MID,{number:9,hairStyle:'bald',seed:9}),x:PX-2.3,z:PZ-1.6,ph:.1},
 {style:BRA(MID,{number:10,build:{height:1.86,bulk:.95},seed:10}),x:PX+2.2,z:PZ-1.4,ph:.45},
 {style:BRA(DARK,{number:6,hairStyle:'bald',build:{height:1.68,bulk:1.1,thighs:1.25},seed:6}),x:PX-4,z:PZ-3.2,ph:.7},
 {style:BRA(MID,{number:3,seed:3}),x:PX+4.1,z:PZ-3,ph:.25},
];
/** Cafu's poses at the podium */
const CHEER=posed({lShA:150,rShA:150,lShF:20,rShF:20,lElb:20,rElb:20,neckP:-20,lHand:0,rHand:0,lean:2});
const CROUCH=posed({lHipF:62,rHipF:62,lKnee:96,rKnee:96,lAnk:-20,rAnk:-20,lean:30,pitch:8,lShF:-30,rShF:-30,lElb:40,rElb:40,neckP:-10});
const TUCK=posed({lHipF:70,rHipF:40,lKnee:95,rKnee:70,lean:12,lShF:120,rShF:120,lShA:30,rShA:30,lElb:30,rElb:30,neckP:-18});
const HOLD_T=posed({lShF:52,rShF:52,lShA:4,rShA:4,lElb:96,rElb:96,lHand:.6,rHand:.6,lean:4,neckP:-6,lHipF:8,rHipF:8,lKnee:12,rKnee:12});
const LIFT=posed({lShF:172,rShF:172,lShA:10,rShA:10,lElb:16,rElb:16,lHand:.6,rHand:.6,lean:-10,neckP:-34,lHipF:4,rHipF:4,lKnee:6,rKnee:6,squash:.03});
function cafuCeremony(t:number):{p:Pose;y:number;z:number;hold:number}{
 const cj=CUEW(2,'Cafu jumped'),op=CUEW(2,'onto'),lf=CUEW(2,'lifted'),sk=CUEW(2,'to the sky');
 const j0=cj-.1,j1=j0+.35,j2=j1+.55;// crouch, take-off, land on the podium
 let p=blendPose(stand(),CHEER,.6*bump(0,cj,t*1)+.0);
 p=blendPose(p,CROUCH,sm(j0-.25,j0,t)*(1-sm(j1-.05,j1+.1,t)));
 p=blendPose(p,TUCK,sm(j1-.05,j1+.12,t)*(1-sm(j2-.15,j2,t)));
 p=blendPose(p,CROUCH,.6*bump(j2-.05,j2+.35,t));
 const hold=sm(op+.4,lf-.1,t);
 p=blendPose(p,HOLD_T,hold*(1-sm(lf,sk,t,easeInOutSine)));
 p=blendPose(p,LIFT,sm(lf,sk+.2,t,easeInOutSine));
 const u=clamp((t-j1)/(j2-j1)),y=t<j1?0:t>j2?PH:PH*u+1.1*u*(1-u)*1.6;
 // he waits on the grass in front of the podium, then jumps up and back onto it
 const z=PZ+1.25*(1-sm(j1-.05,j2,t,easeInOutSine));
 return{p,y,z,hold};
}
function cam3(t:number):Cam{
 const cj=CUEW(2,'Cafu jumped'),sk=CUEW(2,'to the sky'),open=1-sm(0,1.4,t,easeInOutSine),up=sm(sk-.4,sk+1.2,t,easeInOutSine),push=sm(cj-.6,cj+.6,t,easeInOutSine);
 const C:V3=[PX-1.1+2.5*open,.8+1.2*open,PZ+6+3*open-1.2*push];
 const T:V3=[PX+.1,lerp(lerp(1.5,1.9,push),3,up),PZ-.3];
 return look(C,T,lerp(1450,1300,up)-200*open);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),bw=CUEW(2,'Brazil won'),tn=CUEW(2,'two-nil'),ar=CUEW(2,'As the rain'),lf=CUEW(2,'lifted'),wc=CUEW(2,'the World Cup'),sk=CUEW(2,'to the sky');
  stadium(s,c,v,t,{roar:sm(bw,bw+.4,t),flash:Math.max(bump(tn-.1,tn+.9,t),sm(sk-.2,sk+.3,t))});
  ground(s,c);
  podium(s,c);
  const passing=!!s._passage.pending,tp=twos(t);
  // team-mates jumping in the rain (celebrate 'arms'), facing the captain
  const cast:{d:number;fn:()=>void}[]=[];
  MATES.forEach((m,i)=>{const d=toCam(c,[m.x,1,m.z])[2];cast.push({d,fn:()=>{const pose=celebrate(tp*.9+m.ph,{kind:'arms'});drawPlayer(s,pose,c,{...m.style,detail:passing?'low':'auto'},{x:m.x,z:m.z,yaw:yawOf(PX-m.x,PZ-m.z)+.5},passing?{}:{prev:celebrate(tp*.9+m.ph-1/12,{kind:'arms'})});}});});
  // Cafu: onto the podium, handed the trophy, lifts it
  const cf=cafuCeremony(tp),cfPrev=cafuCeremony(tp-1/12);
  cast.push({d:toCam(c,[PX,1,PZ])[2],fn:()=>{
   const r=drawPlayer(s,cf.p,c,{...CAFU_STYLE,detail:passing?'mid':'auto'},{x:PX,z:cf.z,y:cf.y,yaw:yawOf(c.C[0]-PX,c.C[2]-cf.z)},passing?{}:{prev:cfPrev.p,smear:true});
   // the trophy: handed up from the right, then in both hands at the chest, then overhead
   if(cf.hold>0){const sk2=r.sk,mid:V3=lerp3(sk2.lHa,sk2.rHa,.5),from:V3=[mid[0]+.35,mid[1]-.55,mid[2]+.25],base=lerp3(from,[mid[0],mid[1]-.03,mid[2]],easeOut(cf.hold));
    trophy(s,c,base,bump(wc-.1,wc+.7,t)+.8*bump(sk,sk+1,t),t);}
  }});
  cast.sort((a,b)=>b.d-a.d).forEach(e=>e.fn());
  // "As the rain came down"
  rain(s,t,.25+.75*sm(ar-.3,ar+.8,t));
  // the photographers' flashes when he lifts it
  if(t>lf){const p=new Path2D(),T12=Math.floor(t*12),bx=screenBox(s);for(let i=0;i<5;i++){if(hash(i,T12)<.45)continue;const x=lerp(bx.x0,bx.x1,.1+.8*hash(i*7,T12+1)),y=lerp(bx.y0,bx.y1,.08+.3*hash(i*3,T12+2)),z=(7+9*hash(i,T12+5))*bx.k;
   p.addPath(polyPath([[x-z,y],[x,y-z*.3],[x+z,y],[x,y+z*.3]],true));p.addPath(polyPath([[x,y-z],[x+z*.3,y],[x,y+z],[x-z*.3,y]],true));}s.knockout(p);s.fill(Y,p,.9*sm(lf,lf+.3,t));}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),q=toCam(c,[PX,PH+1.5,PZ]);if(q[2]<NEAR)return apertureDisc(0,0,10,12);const g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.2/q[2]),12);},
 still:8.4,
};

// ---------------------------------------------------------------- 4 · the lesson: the whole right flank, a low camera on the track that pans with the words
const tau4=(t:number)=>key(t,[[0,-1],[CUEW(3,'Get back'),.8],[CUEW(3,'then run'),2.2],[CUEW(3,'Keep running'),5.4],[SECS(3),CROSS-.1]],linear);
/** Director beats for the lesson: start close on the full-back (his ring), go back to the authored pans for "defend" / "and attack" / "Get
 * back" (both boxes must be seen), a medium shot for "then run forward" that keeps the run ahead of him in frame, close again for the
 * clock filling round his feet on "Keep running", and the authored wide for "the whole game". */
const B4=beats([[0,{from:'lesson',size:.3}],[CUEW(3,'Your turn')+.3,'wide'],[CUEW(3,'Get back')+.5,{from:'lesson',size:.24}],[CUEW(3,'Keep running')-.8,'lesson'],[CUEW(3,'the whole game')-.5,'wide']]);
function cam4(t:number):Cam{const p=steady(t,dir4,.6,5);return look(p.eye,p.target,p.F);}
function dir4(t:number):Pin{const c=cam4Authored(t),sh=shotAt(t,B4);if(sh.k<=1e-4)return{eye:c.C,target:c.T,F:c.F};
 const tau=tau4(t),hero=at3(CAFU,tau),run=bump(CUEW(3,'Get back')+.4,CUEW(3,'Keep running')-.2,t),keep=near(hero,foesAt(tau),3,6);
 // "then run forward": the yellow run ahead of him stays in frame
 if(run>.01)keep.push({P:at3(CAFU,Math.min(CROSS,tau+.7)),w:Math.min(1,run*1.5)});
 return reframe({eye:c.C,target:c.T,F:c.F},{hero,ball:ballAt(tau),keep},sh,DV);}
function cam4Authored(t:number):Cam&{T:V3}{
 const tau=tau4(t),m=smooth(CAFU,tau),df=CUEW(3,'defend'),at=CUEW(3,'and attack'),gb=CUEW(3,'Get back'),rf=CUEW(3,'then run'),wg=CUEW(3,'the whole game');
 // the target pans: Cafu → his own box ("defend") → their box ("attack") → back to him → with him up the wing → wide on "the whole game"
 const x=key(t,[[0,m[0]],[df-.2,m[0]],[df+.5,16],[at-.1,16],[at+.7,92],[gb-.2,92],[gb+.6,m[0]-4],[rf,m[0]],[SECS(3),m[0]]],easeInOutSine);
 const follow=sm(gb+.4,gb+.8,t);const X=lerp(x,m[0]+2,follow*sm(rf-.3,rf,t));
 const wide=sm(wg-.3,wg+.8,t,easeInOutSine);
 const C:V3=[lerp(X-5,52.5,wide),lerp(6.5,34,wide),lerp(46,88,wide)],T:V3=[lerp(X,54,wide),.4,lerp(24,20,wide)];
 return{...look(C,T,lerp(1700,2400,wide)),T};
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),fb=CUEW(3,'full-backs'),df=CUEW(3,'defend'),at=CUEW(3,'and attack'),gb=CUEW(3,'Get back'),rf=CUEW(3,'then run'),kr=CUEW(3,'Keep running'),wg=CUEW(3,'the whole game'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const m=posOf(CAFU,tau);
  // "defend": his own box, where the crosses come in; "and attack": theirs
  zone(s,c,DEF_ZONE,sm(df-.2,df+.3,t,easeOutBack),t,O,95);
  zone(s,c,ATT_ZONE,sm(at-.2,at+.3,t,easeOutBack),t,Y,96);
  // "Get back": an orange arrow from him back to his own box; "then run forward": his real run, in yellow
  const loop=wg<t?.5+.5*Math.sin((t-wg)*5):1;
  groundArrow(s,c,[[m[0]-2,m[1]-3],[40,24],[16,22]],sm(gb-.1,gb+.6,t,easeOut),O,97,.35,true);
  pathArrow(s,c,CAFU,Math.max(0,tau),CROSS,sm(rf-.1,rf+.6,t,easeOut)*(t<wg?1:.75+.25*loop),Y,{seed:98,width:.3});
  // "keep running": the match clock fills around his feet as he runs
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,rings:[[CAFU,sm(fb-.1,fb+.35,t,easeOutBack)*(1-sm(kr-.3,kr,t)),Y]],after:()=>{
   clockRing(s,c,m[0],m[1],sm(kr,E-.4,t,linear),sm(kr-.2,kr+.2,t,easeOutBack),t);}});
 },
 still:7.6,
};

const film:RisoStory={
 id:'cafu-signature',format:'11v11',title:"Cafu's Endless Run",theme:'The attacking full-back: defend, attack, and keep running for the whole game',
 ageNote:'World Cup final, Germany v Brazil, International Stadium Yokohama, 30 June 2002, 73rd minute. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a splash of the wet Yokohama turf — grass bits and spray, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and blue droplets thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(B,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
