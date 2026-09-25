/** Viktor Gyökeres's signature — "the powerful run through defenders" — recreated from ONE real moment: Sporting CP 4–1 Manchester City,
 * UEFA Champions League league phase (matchday 4), Estádio José Alvalade, Lisbon, Tuesday 5 November 2024 (Ruben Amorim's last home game
 * before leaving for Manchester United). City led through Phil Foden's early goal; in the 38th minute Geovany Quenda slid a through ball
 * and Gyökeres ran on to it and drove home the equaliser, a RIGHT-footed shot from the RIGHT side of the box into the BOTTOM LEFT corner
 * (the far corner) past Ederson. He added two second-half penalties for the first Champions League hat-trick by a Sporting player.
 * WHY THIS MOMENT: iconicPlays.json gives Gyökeres a signature, not one match ("the powerful run through defenders", central, beats 2,
 * into the box; lesson "Use your body to shield the ball as you drive toward goal"). His Wikipedia profile describes exactly that player
 * ("physicality, pace, and stamina … his acceleration to exploit space behind defenders … his strength and size to shield the ball"),
 * and this is the best-documented open-play goal of his most famous night: a through ball, a run into the box, a powerful finish. BBC Sport
 * wrote that City's 19-year-old centre-back Jahmai Simpson-Pusey, on his first senior start, "was given a baptism of fire by Gyokeres".
 * An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot watch the footage), printed
 * as a riso sheet.
 *
 * SOURCES (pages cached under scratchpad/films/src-cache/):
 *  - BBC Sport live page + report, "Sporting 4–1 Manchester City: Viktor Gyokeres hat-trick as Ruben Amorim's side thrash Man City"
 *    (5 Nov 2024) https://www.bbc.co.uk/sport/football/live/c238450zre1t (pages 1 and 4). Report: "The Swede drove home a 38th-minute
 *    leveller to Phil Foden's early opener and then kept his cool after the break to beat Ederson twice from the spot"; "Jahmai
 *    Simpson-Pusey was handed his first senior start in central defence … given a baptism of fire by Gyokeres"; "another routine pass
 *    across the area went straight to a blue shirt" (City in blue). Opta text commentary: "Goal! Sporting Lisbon 1, Manchester City 1.
 *    Viktor Gyökeres (Sporting Lisbon) right footed shot from the right side of the box to the bottom left corner. Assisted by Geovany
 *    Quenda with a through ball." Line-up names in the commentary: Ederson, Rico Lewis, Akanji, Simpson-Pusey, Matheus Nunes, Kovacic,
 *    Bernardo Silva, Foden, Savinho, Haaland; Franco Israel, Quenda, Pote, Trincão, Hjulmand, Morita, Diomande, Maxi Araújo, Catamo.
 *  - Wikipedia, "Viktor Gyökeres" (raw): the hat-trick v City on 5 Nov 2024 (first by a Sporting player in the Champions League era);
 *    style of play (quoted above); his trademark celebration, "crossing both of his hands over his mouth" (the mask).
 * CONFIRMED by those accounts: date, venue (Sporting at home), competition, the score before (0–1, Foden) and after (1–1) and the final
 * 4–1; the minute (38'); the assist (Geovany Quenda, a through ball); the finish (right foot, from the right side of the box, into the
 * bottom left = far corner, past Ederson); City in blue shirts; Simpson-Pusey starting at centre-back and struggling against him.
 * INFERRED (illustrative, from the signature and general knowledge; not narrated unless stated): every position and timing between those
 * beats; where Quenda passed from (the right, his left foot) and the line of the pass; the line of the run (from the centre out into the
 * right channel and into the box); THE TWO DEFENDERS HE GOES THROUGH — a centre-back chasing on his inside shoulder whom he holds off
 * with his body and left arm, then a covering defender stepping across at the edge of the box whose lunge he pushes the ball past (the
 * signature's "beats 2"; the defenders are not named; the narration only says "the defender" / "the next defender" and presents the
 * slow replay as how he does it); the number of touches; Ederson coming off his line and diving toward the far post; the celebration (his
 * trademark mask, Wikipedia — that he did it after this goal is inferred); the other players' positions. KITS: Sporting's home hoops,
 * green and white, with black shorts (Sporting always wear the hoops at home; not verified for this night, not narrated); City's sky-blue
 * shirts (BBC: "a blue shirt") printed as a pale navy screen, white shorts (inferred); Gyökeres's number 9; Ederson's yellow and
 * Franco Israel's dark keeper kits and the referee's navy (inferred). The ground: Alvalade's roofed two-tier bowl with its multicoloured
 * seats, a full house under floodlights at night (kick-off 20:00 local; the crowd colours are inferred); which way Sporting attacked on
 * screen (inferred).
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, from Quenda on the ball to the goal; 2 = slow-motion replay from a low camera in front of the run: his body between the chasing
 * defender (ringed red, a red push arrow from his shoulder) and the ball on his far foot (a yellow ring), then the camera swings to the
 * touchline as he pushes the ball past the next defender's lunge (his red lane); 3 = replay from behind the goal: the low shot across
 * Ederson into the far corner (a yellow target, a dashed line), the net, then the celebration (three sparks for the hat-trick); 4 = the
 * lesson from a raised three-quarter camera in front of him: the body shield (a yellow ring), the push arrow, the ball ring, and the
 * drive toward goal as a red lane. All figures are the shared riso athlete (lib/plays/riso/athlete.ts) routed through ONE adapter,
 * drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,lunge,strike,keeperSet,keeperDive,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); every cue starts
 * with a plain word (Kokoro splits contractions and hyphenated words). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Lisbon, 2024. Manchester City lead Sporting. Geovany Quenda slides a pass through, and Viktor Gyökeres is off! Strong and fast, he drives on. Right foot... far corner!',seconds:13.6,
  cues:[[.2,'Lisbon'],[2,'Manchester City'],[3.9,'Geovany Quenda'],[5,'slides a pass'],[6.4,'Viktor'],[8.2,'Strong and fast'],[9.4,'he drives on'],[10.6,'Right foot'],[11.9,'far corner']]},
 {label:'Watch it again',text:'Watch it again, slowly. He keeps his body between the defender and the ball. Then he pushes on, past the next defender.',seconds:9.4,
  cues:[[.15,'Watch it again'],[2.1,'He keeps his body'],[3.6,'the defender'],[4.4,'and the ball'],[5.6,'Then he pushes'],[6.8,'past the next']]},
 {label:'The finish',text:'A hard, low shot across Ederson, and Sporting are level! He scored a hat-trick that night, and Sporting won four-one.',seconds:8.8,
  cues:[[.15,'A hard'],[1.3,'across Ederson'],[2.7,'Sporting are level'],[4.2,'He scored'],[6.1,'Sporting won']]},
 {label:'Your turn',text:'Your turn: when a defender gets close, use your body to shield the ball, and drive toward goal!',seconds:7.8,
  cues:[[.15,'Your turn'],[1.1,'when a defender'],[2.7,'use your body'],[3.8,'shield the ball'],[5.1,'drive toward goal']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py gyokeres-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/gyokeres-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-gyokeres-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/gyokeres-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('gyokeres: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',G='green',K='navy';
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Sporting attack +X, City's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so Gyökeres's
 * "right side of the box" is +Z and the bottom LEFT corner (his far corner) is the post at −Z. */
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
/** a closed ground ring (ellipse rx × rz round x,z) as a ribbon path, or null when off camera */
function groundRing(c:Cam,x:number,z:number,rx:number,rz:number,wm:number,seed:number):Path2D|null{const pts:Pt[]=[];
 for(let i=0;i<30;i++){const q=pr(c,[x+Math.cos(i/30*TAU)*rx,0,z+Math.sin(i/30*TAU)*rz]);if(q)pts.push(q);}
 if(pts.length<24)return null;const d=toCam(c,[x,0,z])[2];if(d<1)return null;return ribbon(pts,Math.max(3,c.F*wm/d),{close:true,seed,taper:0,wobble:1});}

// ---------------------------------------------------------------- Alvalade at night: a roofed two-tier bowl, multicoloured seats, a full house
const CX=52.5,NS=64;
/** a point on the stands: angle th round the pitch centre, d metres out from the inner rim (a squared superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(58+d)*Math.sign(c)*Math.pow(Math.abs(c),.26),y,(39+d)*Math.sign(s)*Math.pow(Math.abs(s),.26)];}
const LOW=(b:number):[number,number]=>[2+15*b,1.4+10.5*b],UP=(b:number):[number,number]=>[19+17*b,14+15*b];
type Bowl={low:V3[][];up:V3[][];band:V3[][];roof:V3[][];lamps:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],band:[],roof:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.band.push([rim(a,17,11.9),rim(b,17,11.9),rim(b,19,14),rim(a,19,14)]);
  o.roof.push([rim(a,33,31),rim(b,33,31),rim(b,52,33),rim(a,52,33)]);
  if(i%2===0)o.lamps.push([rim(a,33.5,30.4),rim(b,33.5,30.4),rim(b,33.5,31.1),rim(a,33.5,31.1)]);
  // the crowd: 3 heads across each segment on 6 rows per tier (a few empty seats)
  for(const f of [LOW,UP])for(let r=0;r<6;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(f===UP?5:0),23);if(h<.12)continue;const[d,y]=f((r+.5)/6);
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.45),h});}}
 return o;})();
/** everything behind the pitch: the night sky and the full, multicoloured stands under the roof and its floodlight rail */
function stadium(s:Sheet,c:Cam,o:{t:number;cheer?:number}){
 const{t,cheer=0}=o,tt=twos(t);
 s.field(K,.82,.5);
 const low=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D(),lamp=new Path2D(),glow=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.band[i],band);add(BOWL.roof[i],roof);}
 for(const q of BOWL.lamps){const r=quadP(c,q,14);if(r){lamp.addPath(polyPath(r,true));const m=r.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]),w=Math.abs(r[1][0]-r[0][0])*.9+8;glow.addPath(polyPath(blob(m[0],m[1],w,w*.5,5,{amp:.08,n:12}),true));}}
 // the seats: Alvalade's mixed colours read as a green-yellow screen; the tier band and aisles pale
 s.knockout(low);s.tone(G,low,.4);s.tone(Y,low,.3);s.tone(K,low,.35);s.knockout(up);s.tone(G,up,.35);s.tone(Y,up,.25);s.tone(K,up,.42);
 s.knockout(band,.7);s.tone(G,band,.3);
 // the crowd, a full house: white and green shirts and scarves, navy coats, yellow — bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=toCam(c,q.P)[2];if(d<16)continue;const p=scr(c,toCam(c,q.P));if(Math.abs(p[0])>2600||Math.abs(p[1])>2000)continue;
  const z=clamp(c.F*.5/d,2,13),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.45?0:q.h<.72?1:q.h<.9?3:2].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.8);s.fill(G,inks[1],.85);s.fill(Y,inks[2],.85);s.fill(K,inks[3],.85);}
 s.knockout(roof);s.fill(K,roof,.94);
 s.tone(Y,glow,.3);s.knockout(lamp);s.fill(Y,lamp,.9);
}
/** the surround, floodlit grass (yellow × green) with mowing stripes, boards, paper lines, both goals (City's goal drawn later when it is
 * in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(G,p,.5);s.tone(K,p,.3);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.78);s.tone(G,gp,.86);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // LED boards: far touchline and behind both goals, navy with paper panels (no brands)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.2,-36.95],[x+3.6,.2,-36.95],[x+3.6,.7,-36.95],[x,.7,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.2,z],[108.45,.2,z+3.6],[108.45,.7,z+3.6],[108.45,.7,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.88);s.knockout(pn,.85);s.tone(G,pn,.35);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-3);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]];
const SKIN_M:InkFill[]=[[Y,.4],[R,.3],[K,.1]];
const SKIN_D:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** Sporting CP home (inferred, see the header): green and white hoops (a paper pattern knocked out of the green), black shorts printed
 * navy, green socks, paper numbers */
const SCP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[G,.95],pattern:'hoops',patternInk:'paper',shorts:K,socks:[G,.95],trim:G,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',seed:3,...o});
/** Viktor Gyökeres: number 9, short light-brown hair, a big strong frame (1.87 m) */
const GYO_STYLE=SCP({hair:[R,.5],hairStyle:'short',number:9,build:{height:1.87,bulk:1.14,thighs:1.18,head:1.01},seed:9});
/** Manchester City: sky-blue shirts (BBC: "a blue shirt"), printed as a pale navy screen; white shorts (inferred), sky socks, navy numbers */
const SKY:InkFill=[K,.42];
const MCI=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:SKY,shorts:'paper',socks:SKY,trim:K,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:K,seed:5,...o});
/** Ederson: 1.88 m; a yellow keeper kit (inferred), navy trim */
const EDERSON:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_M,hair:K,hairStyle:'bald',line:K,gloves:[G,.7],sleeves:'long',trim:K,build:{height:1.88,bulk:1.05},seed:31};
/** Franco Israel (far end, barely seen): a dark keeper kit (inferred) */
const ISRAEL:AthleteStyle={shirt:[K,.7],shorts:[K,.8],socks:[K,.7],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,gloves:[Y,.6],sleeves:'long',trim:Y,build:{height:1.9},seed:52};
/** the referee: navy (inferred) */
const REF:AthleteStyle={shirt:[K,.85],shorts:[K,.95],socks:[K,.85],trim:Y,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Gyökeres's first touch)
type Role='gyo'|'scp'|'mci'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a pass (contact at `at`) */
type Move={kind:'lunge'|'dive'|'kick';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Quenda, Gyökeres and Ederson get the beats the accounts give them; the two
 * defenders he goes through and where everybody stood are inferred (see the header). */
const PASS=-1.3,SHOT=2.45,IN_NET=SHOT+.55;
const ACTORS:Actor[]=[
 {name:'Gyökeres',role:'gyo',style:GYO_STYLE,key:true,keys:[[-4.8,64,3.5],[-3,66,4],[-2,67.6,4.3],[PASS,69.8,5],[-.6,74.4,8.2],[0,78.3,11],[.5,81.8,11.4],[1,85.3,11.3],[1.3,87.3,11.4],[1.7,89.9,12],[2.1,92.3,11.3],[SHOT,94,10.5],
  [2.8,95.3,10.2],[3.4,96.6,11.8],[4.4,98.3,16.5],[5.6,99.8,21.5],[7,100.8,25],[9,101.2,26.5]]},
 // the chasing centre-back on his inside shoulder (inferred; unnamed)
 {name:'chaser',role:'mci',style:MCI({seed:41,hair:[K,.9],skin:SKIN_D,build:{height:1.85,bulk:1.05}}),key:true,engage:[-.2,1.7],keys:[[-4.8,72.5,2],[PASS,73.5,2.6],[-.6,75.2,6.4],[0,77.6,9.9],[.5,81.2,10.3],[1,84.6,10.2],[1.3,86.3,10.4],[1.7,87.7,10.6],[2.4,89.6,10.2],[4,92.5,9],[9,95,8]]},
 // the covering defender stepping across at the edge of the box (inferred; unnamed)
 {name:'cover',role:'mci',style:MCI({seed:42,hair:[K,.6],build:{height:1.86}}),key:true,engage:[.6,1.9],moves:[{kind:'lunge',at:1.32,dur:.8,side:'r'}],keys:[[-4.8,93,1],[PASS,93.3,2],[0,92.3,5.6],[.8,90.5,8.7],[1.25,89.6,10.3],[1.8,89.5,10.8],[2.5,90.6,10.4],[4,93,10],[9,96,9]]},
 {name:'Quenda',role:'scp',style:SCP({seed:57,number:57,skin:SKIN_D,hair:K}),key:true,moves:[{kind:'kick',at:PASS,dur:1,side:'l'}],keys:[[-4.8,54,25],[-2.6,57.6,23.4],[PASS,60.2,22],[0,63,21.5],[3,72,21],[9,88,20]]},
 {name:'Trincão',role:'scp',style:SCP({seed:17,skin:SKIN_M,hair:K}),keys:[[-4.8,62,-6],[0,70,-3],[SHOT,84,-1.5],[9,94,4]]},
 {name:'Pote',role:'scp',style:SCP({seed:8,hair:K}),keys:[[-4.8,58,-14],[0,66,-12],[3,78,-9],[9,90,-5]]},
 {name:'Araújo',role:'scp',style:SCP({seed:20,hair:[K,.7]}),keys:[[-4.8,52,-28],[0,60,-26],[9,78,-18]]},
 {name:'Hjulmand',role:'scp',style:SCP({seed:42,hair:[Y,.7]}),keys:[[-4.8,48,2],[0,52,3],[9,66,5]]},
 {name:'Morita',role:'scp',style:SCP({seed:5,hair:K}),keys:[[-4.8,44,12],[0,47,11],[9,58,10]]},
 {name:'scp cb1',role:'scp',style:SCP({seed:26,skin:SKIN_D,hair:K}),keys:[[-4.8,34,-8],[9,44,-6]]},
 {name:'scp cb2',role:'scp',style:SCP({seed:6,hair:[K,.6]}),keys:[[-4.8,33,10],[9,43,8]]},
 {name:'Israel',role:'gk',style:ISRAEL,keys:[[-4.8,6,0],[9,9,0]]},
 // City: two more defenders recovering, midfielders chasing back, the forwards stranded upfield
 {name:'mci wide',role:'mci',style:MCI({seed:43}),keys:[[-4.8,80,26],[0,84,21],[2,90,18],[4,94,16],[9,96,15]]},
 {name:'mci cb3',role:'mci',style:MCI({seed:44,hair:[Y,.6]}),keys:[[-4.8,76,-10],[0,84,-6],[SHOT,92,-4.5],[9,97,-3]]},
 {name:'mci m1',role:'mci',style:MCI({seed:45,hairStyle:'long'}),keys:[[-4.8,62,8],[0,68,8],[3,80,8],[9,88,6]]},
 {name:'mci m2',role:'mci',style:MCI({seed:46,hair:[K,.5]}),keys:[[-4.8,60,-4],[0,66,-3],[9,85,-2]]},
 {name:'mci m3',role:'mci',style:MCI({seed:47,skin:SKIN_M}),keys:[[-4.8,56,16],[0,62,15],[9,80,12]]},
 {name:'mci f1',role:'mci',style:MCI({seed:48,hairStyle:'long',build:{height:1.95}}),keys:[[-4.8,48,-2],[9,58,-1]]},
 {name:'mci f2',role:'mci',style:MCI({seed:49,skin:SKIN_M}),keys:[[-4.8,50,14],[9,60,12]]},
 {name:'mci f3',role:'mci',style:MCI({seed:50,hair:[K,.7]}),keys:[[-4.8,52,-18],[9,62,-16]]},
 {name:'Ederson',role:'gk',style:EDERSON,key:true,moves:[{kind:'dive',at:SHOT+.3,dur:.8,side:'l'}],keys:[[-4.8,102.6,1],[1,102.8,3],[2.2,102.3,3.5],[9,102.3,3.5]]},
 {name:'referee',role:'ref',style:REF,keys:[[-4.8,60,-12],[0,68,-10],[9,86,-8]]},
];
const GYO=0,CHA=1,COV=2,QUE=3;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4.8,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- Gyökeres's heading, the ball
/** the far corner he aims at (bottom left from his side: the post at −Z) */
const NET:V3=[105.35,.26,-3.1],REST:V3=[106.2,.11,-2.9];
const CYC=4.5,PUSH=-.05;
function yawG(tau:number):number{const v=velOf(GYO,tau),sp=Math.hypot(v[0],v[1]),p=posOf(GYO,tau);
 let y=sp>.6?yawOf(v[0],v[1]):yawOf(1,0);
 // opening the body toward the far corner for the shot
 y=lerpA(y,yawOf(NET[0]-p[0],NET[2]-p[1])*.55+yawOf(1,0)*.45,bump(SHOT-.45,SHOT+.45,tau)*.9);
 return y;}
const fwdG=(tau:number):[Pt,Pt]=>{const y=yawG(tau);return[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];};
/** ball spot for the right foot: ahead and a touch to his right (the side away from the chasing defender) */
const footAt=(tau:number,reach=.6):[number,number]=>{const p=posOf(GYO,tau),[f,r]=fwdG(tau);return[p[0]+f[0]*reach+r[0]*.16,p[1]+f[1]*reach+r[1]*.16];};
/** the touches: the first touch on the through ball, a right-foot push every second stride while he holds the defender off, the push
 * past the covering defender's lunge (1.25), the set touch (1.95), the shot */
const TOUCHES:number[]=(()=>{const forced=[0,1.22,1.95],out:number[]=[];let prev=distOf(GYO,0)/CYC-PUSH,skip=false;
 for(let tau=DT;tau<SHOT-.4;tau+=DT){const ph=distOf(GYO,tau)/CYC-PUSH;if(Math.floor(ph)>Math.floor(prev)){if(!skip&&forced.every(f=>Math.abs(f-tau)>.3))out.push(tau);skip=!skip;}prev=ph;}
 return[...forced,...out].sort((a,b)=>a-b).concat([SHOT]);})();
const TP=TOUCHES.map(t=>footAt(t,t===0?.5:t===1.22?.55:.62));
/** Quenda's through ball: from his left boot along the grass, slowing, onto Gyökeres's first touch */
const QFOOT=(()=>{const p=posOf(QUE,PASS);return[p[0]+.5,p[1]-.25] as [number,number];})();
const LAND=TP[0];
function ballAt(tau:number):V3{
 if(tau<PASS){const p=posOf(QUE,tau),v=velOf(QUE,tau),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*.55,.11,p[1]+v[1]/l*.55];}
 if(tau<0){const u=(tau-PASS)/-PASS,e=1-(1-u)*(1-u)*.55-u*.45*(1-u);return[lerp(QFOOT[0],LAND[0],e),.11,lerp(QFOOT[1],LAND[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.2*Math.sin(Math.PI*u*.7),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** THE SHIELD: leaning into the chasing defender on his left, the left arm out and bent to fend him, left shoulder forward, chest over
 * the ball on his right foot, a glance across at the defender */
const SHIELD:Partial<Pose>={roll:-8,bend:-10,lShA:64,lShF:6,lElb:30,lHand:.8,twist:-12,neckY:10,neckP:10,squash:-.03};
/** the chaser: leaning in, the right arm across Gyökeres's back */
const CHASE:Partial<Pose>={roll:8,bend:8,rShA:52,rShF:26,rElb:30,rHand:.7,neckY:-16,twist:10};
/** the push past the lunge: body dropped and tilted out to his right, the far arm out */
const CUT:Partial<Pose>={roll:9,bend:10,lean:20,lKnee:52,rKnee:50,lShA:66,rShA:30,neckY:-6,squash:-.04};
/** the mask celebration (Wikipedia: "crossing both of his hands over his mouth") */
const MASK:Partial<Pose>={lShF:52,rShF:52,lShA:-14,rShA:-14,lElb:145,rElb:145,lHand:.9,rHand:.9,neckP:-6,lean:-6,pitch:-3,lHipF:14,rHipF:6,lKnee:14,rKnee:10};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(GYO,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4){const w=Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau));yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),w*(k===CHA?.35:1));}
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===GYO){yaw=yawG(tau);if(tau>IN_NET+.3)yaw=lerpA(yaw,yawOf(-1,1),sm(IN_NET+.3,IN_NET+1.3,tau)*(sp<2.5?1:.3));}
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='mci'?READY:stand();
 if(k===GYO){// a big man's long, driving strides; the right foot pushes the ball on (PUSH phase)
  const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(distOf(GYO,tau)/CYC,{speed:.35+.6*s}),clamp((sp-.4)/1.2));}
 else if(sp>.5&&along<-.35*sp){const bp=runCycle(distOf(k,tau)/2.4,{speed:.2});p=blendPose(idle,bp,clamp((sp-.5)/.8));}
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/3.6,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='kick'){const u=(tau-(mv.at-STRIKE_CONTACT*mv.dur))/mv.dur;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.6}),Math.min(sm(0,.1,u),1-sm(1,1.4,u)));if(tau<mv.at+.3&&tau>mv.at-.8)yaw=yawOf(LAND[0]-x,LAND[1]-z);continue;}
  const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.08});}
 if(k===CHA)p=over(p,CHASE,bump(-.3,1.8,tau)*1.3);
 if(k===GYO){
  p=over(p,SHIELD,Math.min(1,bump(-.15,1.75,tau)*1.5));
  p=over(p,CUT,bump(1.0,1.6,tau));
  const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.95}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.5)p=over(p,MASK,sm(IN_NET+.5,IN_NET+1.1,tau));
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print (paper, navy panel marks)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.3);
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
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;under?:()=>void;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: short, soft, straight down); big figures cast their own
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1]+e.h*.01,e.h*.17,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg&&inView(v,bg,br))ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===GYO?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===GYO||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===GYO}:{});
  if(e.k===GYO)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** "his body": a short fat red arrow from his left shoulder into the chasing defender (he leans into him) */
function pushArrow(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(GYO,tau),[kx,kz]=posOf(CHA,tau),a=pr(c,[x,1.3,z-.15]),b=pr(c,[lerp(x,kx,.95),1.3,lerp(z,kz,.95)]);if(!a||!b)return;
 const d=toCam(c,[x,1.2,z])[2],wd=Math.max(5,c.F*.15/d);s.knockout(ribbon([a,b],wd*1.5,{seed:51,taper:.1}),.8*w);laneArrow(s,R,a,b,wd,{progress:w,seed:51,head:wd*2.4});}
/** "the ball": a yellow ring round the ball on his far (right) foot */
function ballRing(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const b=ballAt(tau),r=groundRing(c,b[0],b[2],.55*w+.1,.45*w+.1,.07,57);if(r){s.knockout(r,.85);s.fill(Y,r,.95*w);}}
/** a ring on the grass under actor k */
function actorRing(s:Sheet,c:Cam,k:number,tau:number,w:number,ink:string,seed:number){if(w<=0)return;const[x,z]=posOf(k,tau),r=groundRing(c,x,z,.8*w,.65*w,.08,seed);if(r){s.knockout(r,.85);s.fill(ink,r,.95*w);}}
/** actor k's path as a lane on the grass, from τa to τb (progress w) */
function runLane(s:Sheet,c:Cam,k:number,ta:number,tb:number,w:number,ink:string,width=.5,seed=61,dashed=false){if(w<=0)return;
 const pts:Pt[]=[];let d=1;const n=30;for(let i=0;i<=n;i++){const tau=lerp(ta,lerp(ta,tb,clamp(w)),i/n),[x,z]=posOf(k,tau),q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(4,c.F*width/d);
 if(!dashed){s.knockout(ribbon(pts,wd*1.6,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(pts,wd,{seed,taper:.1,wobble:.8}),.95);}
 const a=pts[pts.length-2],b=pts[pts.length-1];
 if(dashed)laneArrow(s,ink,pts[0],b,wd,{seed,head:wd*3,dashed:true});else laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** a yellow ring round his hips and back (the shield) */
function shieldRing(s:Sheet,hero:DrawResult|undefined,w:number,seed:number){if(!hero||w<=0)return;const pl=hero.joints.pelvis,ch=hero.joints.chest,r=Math.hypot(ch[0]-pl[0],ch[1]-pl[1])*1.25*w+2,cx=(pl[0]+ch[0])/2,cy=(pl[1]+ch[1])/2,pts:Pt[]=[];
 for(let i=0;i<28;i++){const a=i/28*TAU;pts.push([cx+Math.cos(a)*r*.95,cy+Math.sin(a)*r*1.15]);}
 const rr=ribbon(pts,Math.max(3,r*.14),{seed,close:true,taper:0,wobble:.8});s.knockout(rr,.7*w);s.fill(Y,rr,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>key(t,[[0,T0+.3],[CUEW(0,'Geovany'),-2.1],[CUEW(0,'slides'),PASS],[CUEW(0,'Viktor'),-.3],[CUEW(0,'Strong'),.55],[CUEW(0,'he drives'),1.3],[CUEW(0,'Right foot'),SHOT-.06],[CUEW(0,'far corner'),IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-CUEW(0,'far corner')]],linear);
const CAM1:V3=[52.5,25,76];
function cam1(t:number):Cam{
 const G0=CUEW(0,'far corner'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]*.8];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // "Manchester City lead": a wide opening on the game; Quenda on the ball with Gyökeres in the frame → follow the ball → the celebration
 const q=posOf(QUE,tau),g=posOf(GYO,tau),pair:V3=[(q[0]+g[0])/2+2,1,(q[1]+g[1])/2],m=posOf(GYO,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(CUEW(0,'slides')-.2,CUEW(0,'Viktor')+.4,t,easeInOutSine),toD=sm(G0+.4,G0+1.4,t,easeInOutSine);
 const T=lerp3(lerp3(pair,[bt[0]+2,1.2,bt[2]],toBall),cel,toD);
 const F=key(t,[[0,3000],[CUEW(0,'Manchester'),3300],[CUEW(0,'Geovany'),4300],[CUEW(0,'Viktor'),5400],[CUEW(0,'Strong'),6600],[CUEW(0,'Right foot'),6300],[G0,6500],[G0+1.4,7600],[S,7900]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G0=CUEW(0,'far corner');
  stadium(s,c,{t,cheer:sm(G0-.1,G0+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(GYO,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9.5,
};

// ---------------------------------------------------------------- 2 · slow replay: a low camera in front of the run, then swinging to the touchline for the push past
const tau2=(t:number)=>key(t,[[0,-.5],[CUEW(1,'He keeps'),.1],[CUEW(1,'the defender'),.35],[CUEW(1,'and the ball'),.6],[CUEW(1,'Then he'),.95],[CUEW(1,'past the next'),1.4],[SECS(1),2.05]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(GYO,tau),k=posOf(CHA,tau),E=SECS(1),th=CUEW(1,'Then he');
 const open=1-sm(0,1.2,t,easeInOutSine),push=sm(CUEW(1,'He keeps')-.5,CUEW(1,'the defender'),t,easeInOutSine),swing=sm(th-.4,th+1.2,t,easeInOutSine);
 // in front of him, low: the chasing defender on screen right, the ball on his right foot on screen left
 const mid:V3=[(m[0]*2+k[0])/3,.95,(m[1]*2+k[1])/3];
 let C:V3=[mid[0]+12+3*open-2*push,1.6+.5*open,mid[2]+1.2],T:V3=[mid[0],.8-.1*push,mid[2]-.1];let F=2500+500*push-400*open;
 // "Then he pushes on": the camera swings out to the near touchline, side-on, the covering defender beyond him
 C=lerp3(C,[m[0]+3.5,2.2,m[1]+13],swing);T=lerp3(T,[m[0]+1.2,.85,m[1]-.6],swing);F=lerp(F,2600,swing);
 F=lerp(F,2300,sm(E-1.2,E,t,easeInOutSine));
 return look(C,T,F);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),hk=CUEW(1,'He keeps'),td=CUEW(1,'the defender'),ab=CUEW(1,'and the ball'),th=CUEW(1,'Then he'),pn=CUEW(1,'past the next'),E=SECS(1);
  stadium(s,c,{t});
  ground(s,c);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   // "the defender": a red ring under the chaser; "and the ball": a yellow ring round the ball on his far foot
   actorRing(s,c,CHA,tau,sm(td-.15,td+.3,t,easeOutBack)*(1-sm(th-.2,th+.2,t)),R,53);
   ballRing(s,c,tau,sm(ab-.15,ab+.3,t,easeOutBack)*(1-sm(pn+.2,pn+.6,t)));
   // "past the next defender": a red ring under him, and Gyökeres's path round the lunge as a red lane
   actorRing(s,c,COV,tau,sm(pn-.15,pn+.3,t,easeOutBack)*(1-sm(E-.8,E-.4,t)),R,54);
   runLane(s,c,GYO,1.05,2.2,sm(th-.1,pn+.9,t,easeOut)*(1-sm(E-.7,E-.35,t)),R,.24,63);},
   after:({hero})=>{
   pushArrow(s,c,tau,sm(hk-.1,hk+.35,t,easeOut)*(1-sm(th-.4,th-.1,t)));
   shieldRing(s,hero,sm(hk-.05,hk+.35,t,easeOutBack)*(1-sm(td+.2,td+.6,t)),82);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the low shot across Ederson, the net, the celebration
const tau3=(t:number)=>{const sl=CUEW(2,'Sporting are');return key(t,[[0,1.75],[CUEW(2,'A hard'),2.2],[CUEW(2,'across'),SHOT+.3],[sl,IN_NET+.7],[SECS(2),IN_NET+.7+(SECS(2)-sl)*.75]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'Sporting are');return sm(a-.05,a+.3,t,easeInOutSine);};/* a fast whip-pan (a mid-swing frame only sees empty grass) */
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(GYO,tau),e=sm(SHOT-.3,IN_NET+.2,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'He scored'),SECS(2),t,easeInOutSine);
 // behind the goal, just to the far-post side, high on the net: the shooter coming in from the right side of the box
 const mp=posOf(GYO,tau),C0:V3=[122,7.5,-6+1.5*e],T0:V3=[lerp(mp[0],99.5,e),lerp(.9,.7,e),lerp(mp[1]*.85,2.4,e)];
 // the celebration: a low camera in front of him as he stops and makes the mask
 const C1:V3=[m[0]-6.5-hold,1.9+.4*hold,m[1]+6+1.2*hold],T1:V3=[m[0]+.5,1.3+.3*hold,m[1]];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,Math.sqrt(u)),lerp(lerp(4200,2900,e),3300-250*hold,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ah=CUEW(2,'A hard'),ae=CUEW(2,'across'),sl=CUEW(2,'Sporting are'),hs=CUEW(2,'He scored'),u=swing3(t);
  stadium(s,c,{t,cheer:sm(sl-.6,sl,t)});
  ground(s,c,{goalLater:u<.5});
  // "A hard, low shot": a yellow target in the far bottom corner
  const tw=sm(ah-.1,ah+.35,t,easeOutBack)*(1-sm(sl-.2,sl+.3,t));
  if(tw>0){const q=pr(c,[105.05,.35,NET[2]]);if(q){const r=c.F*.42/Math.max(1,toCam(c,[105,0,NET[2]])[2])*tw,pts:Pt[]=[];for(let i=0;i<26;i++)pts.push([q[0]+Math.cos(i/26*TAU)*r,q[1]+Math.sin(i/26*TAU)*r]);const rr=ribbon(pts,Math.max(3,r*.22),{close:true,seed:88,taper:0,wobble:.8});s.knockout(rr,.8);s.fill(Y,rr,.95);}}
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,
   after:({bg,hero})=>{
   // "across Ederson": the ball's low line across the keeper into the far corner
   const lw=sm(ae-.3,ae+.2,t,easeOut)*(1-sm(sl,sl+.5,t));
   if(lw>0){const a=TP[TP.length-1],pa=pr(c,[a[0],.12,a[1]]),pb=pr(c,[NET[0],.2,NET[2]]);if(pa&&pb){const wd=c.F*.07/Math.max(1,toCam(c,[100,0,3])[2]),pm:Pt=[lerp(pa[0],pb[0],lw),lerp(pa[1],pb[1],lw)];s.knockout(ribbon([pa,pm],Math.max(4,wd)*1.7,{seed:87,taper:.1,wobble:.6}),.85);laneArrow(s,R,pa,pb,Math.max(4,wd),{progress:lw,seed:89,head:Math.max(10,wd*3),dashed:true});}}
   if(bg&&tau>SHOT&&tau<SHOT+.14)sparkBurst(s,Y,bg[0],bg[1],70,{n:8,seed:90,width:9});
   // "He scored a hat-trick": three yellow sparks popping over his head, one after another
   const age=t-hs;if(hero&&age>-.1&&age<1.4){const h=hero.joints.head,n=hero.joints.neck,z=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+6;
    for(let i=0;i<3;i++)sparkBurst(s,Y,h[0]+(i-1)*z*1.3,h[1]-z*(1.05+.25*(i%2)),z*.7,{n:7,seed:91+i,g:easeOutBack(clamp((age+.1-.3*i)/.25))*(1-clamp((age-1)/.35)),width:Math.max(4,z*.12)});}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(GYO,tau3(t)),q=toCam(c,[x,1.3,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised three-quarter camera in front of him, the shield, then the drive toward goal
const tau4=(t:number)=>key(t,[[0,-.25],[CUEW(3,'when a'),.1],[CUEW(3,'use your body'),.4],[CUEW(3,'shield the ball'),.6],[CUEW(3,'drive toward'),.8],[SECS(3),1.0]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=posOf(GYO,Math.max(0,tau)),push=sm(CUEW(3,'use your body')-.4,CUEW(3,'shield')+.3,t,easeInOutSine)*(1-sm(CUEW(3,'drive')-.5,CUEW(3,'drive')+.3,t,easeInOutSine));
 const wide=sm(CUEW(3,'drive')-.5,CUEW(3,'drive')+.8,t,easeInOutSine);
 // in front of him and to his left (the defender's side), raised: body between the chaser and the ball; then high and wide toward goal
 let C:V3=[m[0]+7.5,4-1.1*push,m[1]-4.5+1.2*push],T:V3=[m[0]-.2,.85,m[1]-.2];let F=2500+650*push;
 C=lerp3(C,[m[0]-6,13,m[1]+22],wide);T=lerp3(T,[m[0]+10,0,m[1]-4],wide);F=lerp(F,1900,wide);
 return look(C,T,F);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wd=CUEW(3,'when a'),ub=CUEW(3,'use your body'),sb=CUEW(3,'shield'),dv=CUEW(3,'drive'),E=SECS(3);
  stadium(s,c,{t});
  ground(s,c);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   actorRing(s,c,CHA,tau,sm(wd-.15,wd+.3,t,easeOutBack)*(1-sm(dv-.3,dv,t)),R,53);
   ballRing(s,c,tau,sm(sb-.15,sb+.3,t,easeOutBack)*(1-sm(E-.8,E-.4,t)));
   // "drive toward goal": his path on to the shot as a red lane, then a dashed yellow line into the far corner
   const lw=sm(dv-.2,dv+1,t,easeInOutSine)*(1-sm(E-.5,E-.25,t));
   runLane(s,c,GYO,tau,SHOT,lw,R,.6,70);
   if(lw>.9){const a=TP[TP.length-1],pa=pr(c,[a[0],.1,a[1]]),pb=pr(c,[NET[0],.2,NET[2]]);if(pa&&pb){const w=Math.max(4,c.F*.05/Math.max(1,toCam(c,[a[0],0,a[1]])[2])),pg=clamp((lw-.9)*10),pm:Pt=[lerp(pa[0],pb[0],pg),lerp(pa[1],pb[1],pg)];s.knockout(ribbon([pa,pm],w*1.8,{seed:71,taper:.1,wobble:.6}),.85);laneArrow(s,R,pa,pb,w,{progress:pg,seed:72,dashed:true,head:14});}}},
   after:({hero})=>{
   pushArrow(s,c,tau,sm(ub-.1,ub+.35,t,easeOut)*(1-sm(dv-.4,dv-.1,t)));
   shieldRing(s,hero,sm(ub-.05,ub+.35,t,easeOutBack)*(1-sm(sb+.4,sb+.8,t)),83);}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'gyokeres-signature',format:'11v11',title:"Gyökeres's Power Run",theme:'Use your body to shield the ball from the defender as you drive toward goal',
 ageNote:'UEFA Champions League, Sporting CP v Manchester City, Estádio José Alvalade, Lisbon, 5 November 2024. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and red dust thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(G,a,.6*fade);
}
export default film;
