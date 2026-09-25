/** Roberto Baggio v Spain, World Cup quarter-final, Foxboro Stadium (Foxborough, near Boston), 9 July 1994 (Italy 2–1 Spain): the
 * 88th-minute winner. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot watch
 * the footage), printed as a riso sheet.
 *
 * SOURCES (what the choreography and kit follow):
 *  - Wikipedia, "1994 FIFA World Cup knockout stage" (match box, line-ups, kit templates Kit_body_italia_cm1994 / Kit_body_esp94a /
 *    Kit_shorts_esp94a, kick-off 12:00 EDT, attendance 53,400, referee Sándor Puhl)  https://en.wikipedia.org/wiki/1994_FIFA_World_Cup_knockout_stage
 *  - Wikipedia, "Roberto Baggio" (§ 1994 World Cup: "After receiving the ball from Giuseppe Signori, he dribbled past the Spanish goalkeeper
 *    Andoni Zubizarreta, scoring off-balance from a tight angle", three minutes remaining)  https://en.wikipedia.org/wiki/Roberto_Baggio
 *  - Giancarlo Padovan, "La resurrezione dell'Arrigo", Corriere della Sera, 10 July 1994 (via storiedicalcio.altervista.org): Berti wins the
 *    ball in midfield, Signori turns it on ("la gira") over an unsteady Spaniard, the pitch opens for Baggio's stride; in the area
 *    Zubizarreta stands up to him and makes him veer RIGHT, too far it seems; he dribbles the keeper, goes wide, the goal shrinks to "a
 *    skewed slice" while Spanish defenders race back onto the line; he strikes, curling his RIGHT foot, into the corner.
 *  - The42.ie, "The greatest World Cup tragedies: Roberto Baggio, USA 1994" (6 June 2014): passes from Nicola Berti and Signori; Signori
 *    "flicked through for Baggio, who rounded Zubizarreta"; as he stepped past the keeper "the ball skewed awkwardly off his boot and
 *    narrowed the angle considerably"; he drove it home "despite Abelardo desperately stretching to make a block on the goal-line".
 *  - Wikipedia, "Foxboro Stadium" (open-air, bare-bones bowl, almost completely exposed; natural grass 1991–2001).
 * CONFIRMED by those accounts: date, venue, quarter-final, 2–1, D. Baggio 25', Caminero 58' (1–1), R. Baggio 88'; Signori (on at half
 * time) and Berti (on at 66') were on the pitch; Berti won the ball in midfield, Signori flicked it through, Baggio ran clear, the keeper
 * Zubizarreta (captain, 1) came to him and made him go right, Baggio went round him, the ball ran wide and made the angle tight, Spanish
 * defenders got back to the line, Abelardo stretched on the line, Baggio scored with his right foot (a curled finish) off balance. KITS:
 * Italy in blue shirts (Diadora, white V-neck trim), WHITE shorts, blue socks; Spain in their all-WHITE away kit with a red-and-yellow
 * band (shirt, shorts) and white socks; Baggio wore 10 and his ponytail ("il Divin Codino"). Kick-off at noon: a midsummer sun overhead.
 * INFERRED (illustrative): every position, speed and timing between those beats; where on the pitch Berti won it and where Signori
 * stood (the left, where the Corriere says he played); which foot Signori flicked with (his left, his stronger foot); which Spaniard he
 * flicked it over; the number of Baggio's touches; the exact line round the keeper, Zubizarreta's low dive; which corner (the far one)
 * and the ball's curl; Abelardo's and Alkorta's spots on the line; the celebration run; the other players' positions; Zubizarreta's kit
 * (printed grey), boots, the referee's black kit; the red-and-yellow band printed only as red trim (collar, cuffs, socks) — the athlete
 * library has no side-band pattern; the stadium detail (one low tier of benches, the crowd colours, red ad boards), the camera placements
 * and the direction of play on screen.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, panning with the ball from Berti's interception to the goal; 2 = slow-motion replay from a low touchline camera: the run, the
 * keeper coming, the touch wide round him (orange path), the ball running too far; 3 = replay from low on the goal-line extension beside him: the tight angle (a
 * yellow wedge of visible goal), Abelardo on the line, the side-foot pass into the far corner, then a swing to the celebration and the
 * crowd; 4 = the lesson from a low infield camera: one-on-one ring, "stay calm" (eyes up on the keeper), the path around, the pass into
 * the net. Every figure is the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Scenes read only
 * (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Boston, 1994. Italy and Spain are level, two minutes left. Signori flicks it through, and Roberto Baggio runs clear! The keeper rushes out... Baggio goes round him... goal!',seconds:13,
  cues:[[.2,'Boston'],[1.9,'Italy and Spain'],[3.4,'two minutes left'],[5,'Signori flicks'],[6.6,'Roberto Baggio'],[8.2,'The keeper rushes out'],[9.6,'Baggio goes round'],[11.2,'goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. Baggio stays calm and takes the ball wide, around keeper Zubizarreta. It runs a little too far...',seconds:9,
  cues:[[.15,'Watch it again'],[1.9,'Baggio stays calm'],[3.3,'takes the ball wide'],[4.6,'around keeper Zubizarreta'],[6.6,'It runs a little too far']]},
 {label:'Tight angle',text:'But from a tight angle, past a defender on the line, he passes it into the net. Italy are into the semi-final!',seconds:9.2,
  cues:[[.2,'But from a tight angle'],[2,'past a defender'],[3.6,'he passes it'],[4.4,'into the net'],[5.6,'Italy are into']]},
 {label:'Your turn',text:'Your turn: one-on-one with the keeper? Stay calm, take it around them, and pass it into the net.',seconds:8.4,
  cues:[[.15,'Your turn'],[1.3,'with the keeper'],[2.8,'Stay calm'],[3.9,'take it around'],[5.4,'pass it into the net']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py baggio-spain-1994, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/baggio-spain-1994/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-baggio-spain-1994.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/baggio-spain-1994/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('baggio: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Italy attack +X, Spain's goal line at 105), Y up, Z across
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
/** a projected quad only when it is comfortably in front of the camera (the cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Foxboro Stadium: one low, open, bare-bones bowl of benches under a summer sky
const CX=52.5,NS=56;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.45),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.45)];}
const TIER=(b:number):[number,number]=>[2+30*b,1.4+17.5*b];
type Bowl={tier:V3[][];wall:V3[][];rimB:V3[][];aisle:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={tier:[],wall:[],rimB:[],aisle:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(u0:number,u1:number):V3[]=>{const[d0,y0]=TIER(u0),[d1,y1]=TIER(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.tier.push(Q(0,1));
  o.wall.push([rim(a,1.6,0),rim(b,1.6,0),rim(b,2,1.4),rim(a,2,1.4)]);
  o.rimB.push([rim(a,32,19.9),rim(b,32,19.9),rim(b,32.4,21.4),rim(a,32.4,21.4)]);
  if(i%4===0){const w=.05;o.aisle.push([rim(a,2,1.4),rim(a+w,2,1.4),rim(a+w,32,18.9),rim(a,32,18.9)]);}
  for(let r=0;r<12;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.14)continue;
   const[d,y]=TIER((r+.5)/12);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** everything behind the pitch: the summer sky, the bench bowl, the crowd (roar lifts the seat marks, flash = cameras going off) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 // a clear July noon: pale blue sky, warmer at the horizon
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.24);
 const haze=new Path2D();haze.rect(-1e4,-v.hy*.4,2e4,1e4);s.tone(Y,haze,.1);
 const tier=new Path2D(),wall=new Path2D(),rb=new Path2D(),ai=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(BOWL.tier[i],tier);add(BOWL.wall[i],wall);add(BOWL.rimB[i],rb);}
 for(const q of BOWL.aisle){const r=quadP(c,q);if(r)ai.addPath(polyPath(r,true));}
 // aluminium benches in the sun: pale grey concrete-and-metal rake (blue × navy screens)
 s.knockout(tier);s.tone(B,tier,.3);s.tone(K,tier,.16);
 // the crowd: one mark per seat group, sized by distance; Italy blue, white shirts, Spain's red and yellow, a few navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.4?0:q.h<.62?1:q.h<.76?2:q.h<.9?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(B,inks[1],.9);s.fill(R,inks[2],.85);s.fill(Y,inks[3],.9);s.fill(K,inks[4],.8);
 s.knockout(ai,.5);
 s.knockout(rb);s.fill(K,rb,.7);
 s.knockout(wall);s.fill(K,wall,.55);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the track surround, grass (yellow × blue) with mowing stripes, red boards, paper lines, both goals (the right goal drawn later when it
 * is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(R,p,.16);s.tone(K,p,.16);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // boards: far touchline and behind both goals, red with paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.95);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-2);
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
const SKIN:InkFill[]=[[Y,.3],[R,.2]];
const SKIN_ITA:InkFill[]=[[Y,.36],[R,.26],[K,.05]];
/** Italy 1994 (Diadora): blue shirt, white trim and number (paper), WHITE shorts, blue socks */
const ITA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:B,boots:K,trim:'paper',skin:SKIN_ITA,hair:K,hairStyle:'short',line:K,seed:3,...o});
/** Roberto Baggio: 10, the ponytail (il Divin Codino), 1.74 m */
const RB10_STYLE=ITA({number:10,numberInk:'paper',hairStyle:'ponytail',hair:[K,.95],build:{height:1.74,bulk:.98},seed:10});
/** Spain 1994 away: all white (paper) with the red-and-yellow band, printed as red trim (collar, cuffs, sock tops) */
const ESP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:R,skin:SKIN,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** Andoni Zubizarreta (captain, 1): keeper kit not verified — printed grey, gloves yellow (inferred) */
const ZUBI:AthleteStyle={shirt:[K,.42],shorts:[K,.75],socks:[K,.42],boots:K,skin:SKIN,hair:[K,.9],hairStyle:'balding',line:K,gloves:[Y,.7],sleeves:'long',trim:Y,build:{height:1.86},seed:51};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: the ponytail and the hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the ball: Berti's pass, Signori's flick, Baggio's touches, the finish (τ = s after the flick)
const PASS0=-1.5,FLICK=0;
/** Baggio's touches [τ, x, z]: collect the flick, two touches at goal, the touch RIGHT round the keeper, the step past that skews wide;
 * the last row is the shot (right foot, curled into the far corner). Positions inferred to the accounts. */
const TOUCH:[number,number,number][]=[[1.75,83.8,-1],[2.3,87.6,-.2],[2.85,91.4,.6],[3.35,94.6,1.2],[4,97.8,5.4],[4.7,100.6,8.6]];
const SHOT=TOUCH[TOUCH.length-1][0],IN_NET=SHOT+.6;
const NET:V3=[105.4,.3,-2.3],REST:V3=[106.4,.11,-2.2];
/** where each touch sends him: pelvis behind the ball (.5 m) and a touch to its left (right foot on the ball) */
const dirTo=(k:number):[number,number]=>{const a=TOUCH[Math.max(0,k-1)],b=TOUCH[k===0?1:k],dx=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};
const BAG_KEYS:number[][]=(()=>{const o:number[][]=[[-6,65.5,-1.6],[-3,67,-2.2],[-1.4,68.4,-2.6],[0,70,-2.8],[1,77,-2]];
 TOUCH.forEach(([t,x,z],k)=>{const[dx,dz]=dirTo(k);o.push([t,x-dx*.5+dz*.14,z-dz*.5-dx*.14]);});
 return o.concat([[5.05,102,7.6],[5.5,102.6,8.4],[6.3,102,11.5],[7.5,100.2,16],[9,98,21],[11,95.5,26],[13,93.5,29]]);})();

// ---------------------------------------------------------------- the players: keyframed tracks
type Role='rb10'|'ita'|'esp'|'gk'|'ref';
/** a keyed move: a pass/flick (contact at `at`), a lunge (full reach at `at`), a keeper dive (full stretch at `at`) */
type Move={kind:'kick'|'lunge'|'dive';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
const ACTORS:Actor[]=[
 {name:'R. Baggio',role:'rb10',style:RB10_STYLE,key:true,keys:BAG_KEYS},
 {name:'Signori',role:'ita',style:ITA({number:20,numberInk:'paper',seed:20,hair:[K,.8]}),key:true,moves:[{kind:'kick',at:FLICK,dur:.8,side:'l',power:.3}],keys:[[-6,58,-12.5],[-3,59.5,-11.5],[-1.2,61.3,-10.4],[0,62,-10.1],[1,63.5,-9.8],[4,70,-8],[13,78,-5]]},
 {name:'Berti',role:'ita',style:ITA({number:14,numberInk:'paper',seed:14,hairStyle:'curly'}),key:true,moves:[{kind:'kick',at:PASS0,dur:.8,side:'r',power:.4}],keys:[[-6,47,4],[-3.6,48.8,1.4],[-2.6,50,-.4],[-1.5,51.3,-1.6],[0,53,-2.5],[4,60,-3],[13,70,-2]]},
 {name:'Zubizarreta',role:'gk',style:ZUBI,key:true,moves:[{kind:'dive',at:3.55,dur:.85,side:'l'}],keys:[[-6,101.5,-1.5],[0,102.6,-.8],[1.7,102.8,-.4],[2.6,100,.3],[3.3,97.3,.9],[13,97.3,.9]]},
 {name:'Abelardo',role:'esp',style:ESP({seed:31,build:{height:1.84,bulk:1.06}}),key:true,moves:[{kind:'lunge',at:5.02,dur:.8,side:'r'}],engage:[4.1,6],keys:[[-6,82,-6],[0,84,-3.5],[1.5,88,-1.5],[3,95,.2],[4,101.5,1.6],[4.6,104,2.2],[13,104.2,2.3]]},
 {name:'Alkorta',role:'esp',style:ESP({seed:32,hairStyle:'long'}),key:true,keys:[[-6,80,1],[0,82.5,-2.4],[1.8,86,-3.6],[3,91.5,-3.4],[4.4,99,-3.8],[5.4,103.2,-4.6],[13,103.8,-4.2]]},
 {name:'Nadal',role:'esp',style:ESP({seed:33,build:{height:1.86}}),keys:[[-6,70,-2],[-1,66,-6],[0,64.2,-7.6],[1,65,-7.4],[4,76,-3],[13,90,2]]},
 {name:'Otero',role:'esp',style:ESP({seed:34}),keys:[[-6,82,14],[3,90,10],[6,96,9],[13,98,12]]},
 {name:'Ferrer',role:'esp',style:ESP({seed:35,hair:[K,.7]}),keys:[[-6,80,-18],[3,88,-14],[6,95,-9],[13,99,-6]]},
 {name:'Hierro',role:'esp',style:ESP({seed:36}),keys:[[-6,64,6],[2,70,3],[6,84,2],[13,95,4]]},
 {name:'Caminero',role:'esp',style:ESP({seed:37,hairStyle:'curly'}),keys:[[-6,52,-6],[-2.5,50.6,-2.2],[0,53,-4],[6,66,-2],[13,80,0]]},
 {name:'Goikoetxea',role:'esp',style:ESP({seed:38}),keys:[[-6,58,18],[6,70,14],[13,82,10]]},
 {name:'Salinas',role:'esp',style:ESP({seed:39,hairStyle:'balding'}),keys:[[-6,46,-14],[13,62,-8]]},
 {name:'Luis Enrique',role:'esp',style:ESP({seed:40}),keys:[[-6,44,10],[13,62,6]]},
 {name:'Massaro',role:'ita',style:ITA({number:19,numberInk:'paper',seed:19,hairStyle:'balding'}),keys:[[-6,72,-15],[1,79,-12],[4,90,-8],[6,96,-4],[8,99,4],[13,99.5,20]]},
 {name:'D. Baggio',role:'ita',style:ITA({number:13,numberInk:'paper',seed:13}),keys:[[-6,44,-4],[2,52,-2],[13,72,6]]},
 {name:'Donadoni',role:'ita',style:ITA({number:16,numberInk:'paper',seed:16}),keys:[[-6,55,16],[3,64,13],[13,84,16]]},
 {name:'referee',role:'ref',style:REF,keys:[[-6,56,4],[3,70,4],[8,86,6],[13,92,10]]},
];
const RB10=0,BERTI=2,ZUBIZ=3,ABELARDO=4,CAMINERO=10,MASSARO=14;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6,T1=13,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

/** foot spots: Berti's right foot, Signori's left foot (ahead of the pelvis along the heading) */
const footOf=(k:number,tau:number,side:number):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1,f=[v[0]/l,v[1]/l];return[p[0]+f[0]*.45-f[1]*.12*side,p[1]+f[1]*.45+f[0]*.12*side];};
const BERTI_BALL=footOf(BERTI,PASS0,1),SIG_BALL=footOf(1,FLICK,-1);
function ballAt(tau:number):V3{
 if(tau<PASS0){const p=footOf(BERTI,Math.max(tau,-2.6),1);if(tau<-2.6){// Caminero's ball, stolen by Berti at τ −2.6
   const c=posOf(CAMINERO,tau);return[lerp(c[0]+.45,p[0],sm(-3.2,-2.6,tau)),.11,lerp(c[1],p[1],sm(-3.2,-2.6,tau))];}return[p[0],.11,p[1]];}
 if(tau<FLICK){const u=(tau-PASS0)/(FLICK-PASS0),e=1-Math.pow(1-u,1.5);return[lerp(BERTI_BALL[0],SIG_BALL[0],e),.11,lerp(BERTI_BALL[1],SIG_BALL[1],e)];}
 const T=TOUCH;
 if(tau<T[0][0]){// the flick: turned on first time, lifted over the Spaniard's leg, dropping for Baggio's stride
  const u=(tau-FLICK)/(T[0][0]-FLICK),e=1-Math.pow(1-u,1.35);return[lerp(SIG_BALL[0],T[0][1],e),.11+1.15*Math.sin(Math.PI*Math.min(1,u*1.15)),lerp(SIG_BALL[1],T[0][2],e)];}
 if(tau<SHOT){let k=0;while(k+1<T.length&&tau>=T[k+1][0])k++;const u=(tau-T[k][0])/(T[k+1][0]-T[k][0]),e=k===4?1-(1-u)*(1-u)*.6-.4*(1-u):1-(1-u)*(1-u);return[lerp(T[k][1],T[k+1][1],e),.11,lerp(T[k][2],T[k+1][2],e)];}
 const s0=T[T.length-1];
 if(tau<IN_NET){// the finish: a right-foot pass, curled low toward the far corner (bends away from Abelardo, back toward the post)
  const u=(tau-SHOT)/(IN_NET-SHOT),bx=lerp(s0[1],NET[0],u),bz=lerp(s0[2],NET[2],u),cu=Math.sin(Math.PI*u)*.9;return[bx-cu*.35,.11+.22*Math.sin(Math.PI*u*.9),bz+cu];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the cut round the keeper: body dropped and tilted into the turn, the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:10*dir,bend:12*dir,lean:22,lKnee:56,rKnee:52,lShA:dir>0?30:74,rShA:dir>0?74:30,neckY:10*dir,squash:-.05});
/** off balance at the finish: falling away to his right, left arm flung out, head still over the ball */
const OFFBAL:Partial<Pose>={roll:14,bend:10,lShA:96,lShF:20,lElb:24,rShA:40,neckP:30,neckY:-8};
/** a lane arrow on the grass: knocked out to paper first (yellow over the yellow × blue grass would vanish), then printed */
function lane(s:Sheet,ink:string,a:Pt,b:Pt,wd:number,o:{progress?:number;dashed?:boolean;seed?:number}={}){const pg=o.progress??1;if(pg<=0)return;
 const e:Pt=[lerp(a[0],b[0],pg),lerp(a[1],b[1],pg)];s.knockout(ribbon([a,e],wd*1.6,{seed:(o.seed??1)+7,taper:.2,wobble:1}),.85);
 laneArrow(s,ink,a,b,wd,{progress:pg,dashed:o.dashed,seed:o.seed,cov:.95,head:wd*2.8});}
/** "stay calm": head up, eyes on the keeper, shoulders level */
const HEADUP:Partial<Pose>={neckP:-6,lean:10};
/** Baggio's gait phase: one stride per touch, so his right foot meets the ball at each touch (touchPhase); a free run before */
function phaseB(tau:number):number{const T=TOUCH,d0=distOf(RB10,T[0][0]);
 if(tau<T[0][0])return touchPhase+(distOf(RB10,tau)-d0)/3.3;
 let k=0;while(k+1<T.length&&tau>=T[k+1][0])k++;if(k>=T.length-1)return touchPhase+k+(tau-T[k][0])*1.6;
 return touchPhase+k+(tau-T[k][0])/(T[k+1][0]-T[k][0]);}
/** yaw of Baggio: his run, turned toward the ball at the finish */
function yawB(tau:number):number{const v=velOf(RB10,tau),sp=Math.hypot(v[0],v[1]),b=ballAt(Math.min(tau,SHOT)),m=posOf(RB10,tau);
 let y=sp>.4?yawOf(v[0],v[1]):0;
 const aim=yawOf(NET[0]-TOUCH[5][1],NET[2]-TOUCH[5][2]);y=lerpA(y,aim,sm(SHOT-.45,SHOT-.1,tau)*(1-sm(SHOT+.5,SHOT+1,tau)));
 if(tau<SHOT&&tau>TOUCH[4][0])y=lerpA(y,yawOf(b[0]-m[0],b[2]-m[1]),.3);
 return y;}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(RB10,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk'&&tau<3.1)yaw=lerpA(yawOf(b[0]-x,b[2]-z),yaw,sm(1.8,2.3,tau)*(1-sm(2.9,3.2,tau)));
 if(a.role==='gk'&&tau>=3.1)yaw=yawOf(m[0]-x,m[1]-z+.4);
 if(k===RB10)yaw=yawB(tau);
 if(a.role==='gk'&&tau>3.25)yaw=yawOf(94.6-97.3,1.2-.9);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='esp'?READY:stand();
 if(k===RB10){const s=clamp((sp-2)/5),ph=phaseB(tau),run=runCycle(ph,{speed:.55+.4*s});
  p=tau>TOUCH[0][0]-.25?blendPose(run,dribble(ph,{foot:'r',speed:1}),.45):run;p=blendPose(idle,p,clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='kick'?STRIKE_CONTACT:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='kick'&&u>0&&u<1.3)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.5}),Math.min(sm(0,.15,u),1-sm(1,1.3,u)));
  if(mv.kind==='lunge'&&u>0&&u<1.6)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1.1,1.6,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:0});}
 if(k===RB10){
  p=over(p,HEADUP,bump(1.9,3.2,tau)*.8);
  p=over(p,CUT(1),bump(3.1,3.75,tau));
  const D=.85,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.55}),Math.min(sm(0,.15,u),1-sm(1.05,1.5,u)));
  p=over(p,OFFBAL,bump(SHOT-.3,SHOT+.7,tau)*.8);
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));
 }
 if(k===MASSARO&&tau>IN_NET+.4)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+.9,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: 1994's paper-white ball with navy panel marks
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),tri=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr],[cx+Math.cos(b)*pr*.45,cy+Math.sin(b)*pr*.45]);}return polyPath(q,true);};
 pan.addPath(tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;gk?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (short: the July sun is almost overhead at noon); big figures cast their own
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,gkR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===RB10?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===RB10||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===RB10}:{});
  if(e.k===RB10)heroR=r;if(e.k===ZUBIZ)gkR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,gk:gkR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring on the grass round a set of ground points (one-on-one: Baggio + keeper; the defender on the line) */
function groundRing(s:Sheet,c:Cam,pts:[number,number][],pad:number,w:number,ink:string,seed:number){if(w<=0)return;
 const cx=pts.reduce((a,p)=>a+p[0],0)/pts.length,cz=pts.reduce((a,p)=>a+p[1],0)/pts.length;let rx=pad,rz=pad;for(const p of pts){rx=Math.max(rx,Math.abs(p[0]-cx)+pad);rz=Math.max(rz,Math.abs(p[1]-cz)+pad);}
 const q:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,r=pr(c,[cx+Math.cos(a)*rx*(.7+.3*w),0,cz+Math.sin(a)*rz*(.7+.3*w)]);if(r)q.push(r);}
 if(q.length<30)return;const d=toCam(c,[cx,0,cz])[2],rr=ribbon(q,Math.max(5,c.F*.09/d),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** "takes the ball wide": an orange arrow on the grass along the ball's real path round the keeper (τ a → b), drawn on with w */
function pathArrow(s:Sheet,c:Cam,a:number,b:number,w:number,ink=R,seed=61){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=18;i++){const bb=ballAt(lerp(a,b,i/18)),q=toCam(c,[bb[0],0,bb[2]]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=Math.max(4,c.F*.12/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const p0=seg[seg.length-2],p1=seg[seg.length-1];laneArrow(s,ink,p0,[p1[0]+(p1[0]-p0[0])*.01,p1[1]+(p1[1]-p0[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** "the angle is tight": the yellow wedge of goal he can see from the ball (ball → both posts, on the grass) */
function wedge(s:Sheet,c:Cam,w:number){if(w<=0)return;const b=TOUCH[5],A=pr(c,[b[1],0,b[2]]),P1=pr(c,[105,0,-3.66]),P2=pr(c,[105,0,3.66]);if(!A||!P1||!P2)return;
 const tri=polyPath([A,[lerp(A[0],P1[0],w),lerp(A[1],P1[1],w)],[lerp(A[0],P2[0],w),lerp(A[1],P2[1],w)]],true);s.knockout(tri,.5*w);s.fill(Y,tri,.75*w);
 const d=toCam(c,[b[1],0,b[2]])[2];s.fill(K,ribbon([P1,P2],Math.max(4,c.F*.07/d),{seed:77,taper:0,wobble:.6}),.8*w);}
/** "stay calm": a steady yellow sight line from his eyes to the keeper, and a level bar above his head */
function calmMark(s:Sheet,hero:DrawResult|undefined,gk:DrawResult|undefined,w:number){if(!hero||w<=0)return;const h=hero.joints.head,n=hero.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*1.5+6;
 if(gk){const g=gk.joints.head,e:Pt=[lerp(h[0],g[0],w),lerp(h[1],g[1],w)];s.knockout(ribbon([h,e],u*.35,{seed:73,taper:0,wobble:.4}),.7);s.fill(Y,ribbon([h,e],u*.2,{seed:73,taper:0,wobble:.4,gaps:[[.2,.3],[.5,.6],[.8,.9]]}),.95);}
 const bar:Pt[]=[[h[0]-u*1.4*w,h[1]-u*2.2],[h[0]+u*1.4*w,h[1]-u*2.2]];s.knockout(ribbon(bar,u*.6,{seed:74,taper:.1}),.85*w);s.fill(Y,ribbon(bar,u*.38,{seed:74,taper:.1}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (from Berti's interception at ~τ −2.6 through the flick to the ball in the net) */
const tau1=(t:number)=>{const f=CUEW(0,'Signori'),G=CUEW(0,'goal');return key(t,[[0,Math.max(T0,-f)],[f,FLICK],[CUEW(0,'Roberto'),1.55],[CUEW(0,'The keeper'),2.7],[CUEW(0,'Baggio goes'),3.5],[G,IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-G]],linear);};
const CAM1:V3=[70,23,70];
function cam1(t:number):Cam{
 const G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[62,4,-8],m=posOf(RB10,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(.4,CUEW(0,'two minutes'),t,easeInOutSine),toD=sm(G+.5,G+1.5,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.2,toBall),lerp(open[2],lerp(bt[2],0,.25),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,[[0,1800],[CUEW(0,'two minutes'),3900],[CUEW(0,'Signori'),4300],[CUEW(0,'The keeper'),5000],[G,5600],[G+1.5,6400],[S,6700]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(RB10,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:10,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: the run, the keeper, the touch wide
const tau2=(t:number)=>key(t,[[0,1.35],[CUEW(1,'Baggio stays'),2.2],[CUEW(1,'takes the ball'),3.2],[CUEW(1,'around keeper'),3.7],[CUEW(1,'It runs'),4.1],[SECS(1),4.6]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(RB10,tau),open=1-sm(0,1.4,t,easeInOutSine),push=sm(CUEW(1,'Baggio stays')-.3,CUEW(1,'takes')-.3,t,easeInOutSine),back=sm(CUEW(1,'around')-.2,SECS(1),t,easeInOutSine);
 const C:V3=[m[0]-3.5-1.5*back+1.5*open,1.5+.3*open+.4*back,m[1]+11+3*open-2*push+2.5*back],T:V3=[m[0]+2.2+1.2*back,.9-.1*push,m[1]-.4+1.5*back];
 return look(C,T,2500+450*push-350*back-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),bc=CUEW(1,'Baggio stays'),tw=CUEW(1,'takes the ball'),ak=CUEW(1,'around keeper'),rf=CUEW(1,'It runs'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,
   under:()=>{
    // "takes the ball wide": the orange path of the ball round the keeper, drawn as it happens
    pathArrow(s,c,3.35,4,sm(tw-.2,ak+.3,t,easeOut)*(1-sm(E-.9,E-.5,t)),R,61);
    // "a little too far": the skew wide, a red dashed trail ahead of the ball
    const rw=sm(rf-.2,rf+.5,t,easeOut)*(1-sm(E-.7,E-.4,t));
    if(rw>0){const a=pr(c,[TOUCH[4][1],0,TOUCH[4][2]]),b=pr(c,[TOUCH[5][1]+.6,0,TOUCH[5][2]+.7]);if(a&&b){const d=toCam(c,[TOUCH[5][1],0,TOUCH[5][2]])[2];lane(s,R,a,b,Math.max(4,c.F*.1/d),{dashed:true,progress:rw,seed:63});}}},
   after:({hero,gk})=>{
    calmMark(s,hero,gk,sm(bc-.1,bc+.5,t,easeOut)*(1-sm(tw+.2,tw+.6,t)));
    // "around keeper Zubizarreta": the keeper's reach closes on nothing — a spark where his gloves land
    const age=t-ak;if(age>-.3&&age<.6){const[kx,kz]=posOf(ZUBIZ,3.6),q=pr(c,[kx+.2,.3,kz+1.6]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.55/toCam(c,[kx,.3,kz+1.6])[2],{n:8,seed:83,g:easeOutBack(clamp((age+.3)/.2))*(1-clamp((age-.35)/.25)),width:9});}}});
  // the replay wipe as the chapter opens
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4.8,
};

// ---------------------------------------------------------------- 3 · replay from low on the goal-line extension: the tight angle, Abelardo on the line, the finish, the celebration
const tau3=(t:number)=>{const g=CUEW(2,'Italy');return key(t,[[0,4.35],[CUEW(2,'But from'),4.45],[CUEW(2,'past a'),4.6],[CUEW(2,'he passes'),SHOT+.02],[CUEW(2,'into the net'),IN_NET+.05],[g,IN_NET+1.2],[SECS(2),IN_NET+1.2+(SECS(2)-g)*.8]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'into the net');return sm(a+.4,CUEW(2,'Italy')+.8,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),hold=sm(CUEW(2,'Italy')+.8,SECS(2),t,easeInOutSine),push=sm(0,CUEW(2,'he passes'),t,easeInOutSine);
 const C0:V3=[104.2-.6*push,1.7,19-1.5*push],T0:V3=[102.6,.8,2.6];
 const mm=smooth(RB10,tau),C1:V3=[mm[0]-7.5-hold,2.2+.5*hold,mm[1]-10-1.5*hold],T1:V3=[mm[0]+.6,1.3+.6*hold,mm[1]+1.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(1900+350*push,3300-250*hold,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ta=CUEW(2,'But from'),pd=CUEW(2,'past a'),hp=CUEW(2,'he passes'),it=CUEW(2,'into the net'),g=CUEW(2,'Italy'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(g-.2,g+.3,t)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,
   under:()=>{
    // "a tight angle": only a thin slice of goal to aim at
    wedge(s,c,sm(ta-.1,ta+.6,t,easeOut)*(1-sm(hp-.6,hp-.2,t)));
    // "past a defender on the line": a red ring round Abelardo's feet
    const[ax,az]=posOf(ABELARDO,tau);groundRing(s,c,[[ax,az]],.9,sm(pd-.15,pd+.3,t,easeOutBack)*(1-sm(it-.2,it+.2,t)),R,91);
    // "he passes it": a yellow lane along the grass from the ball into the far corner
    const pw=sm(hp-.35,hp+.1,t,easeOut)*(1-sm(it+.3,it+.8,t));
    if(pw>0){const a=pr(c,[TOUCH[5][1],0,TOUCH[5][2]]),b=pr(c,[NET[0],0,NET[2]]);if(a&&b){const d=toCam(c,[103,0,3])[2];lane(s,Y,a,b,Math.max(5,c.F*.1/d),{progress:pw,seed:93});}}}});
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(RB10,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.9,
};

// ---------------------------------------------------------------- 4 · the lesson: a low infield camera on the one-on-one
const tau4=(t:number)=>key(t,[[0,2.55],[CUEW(3,'with the'),2.85],[CUEW(3,'Stay calm'),3.1],[CUEW(3,'take it'),3.3],[CUEW(3,'pass it'),SHOT-.2],[SECS(3),IN_NET+.2]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(RB10,tau),push=sm(CUEW(3,'with the')-.3,CUEW(3,'Stay')+.3,t,easeInOutSine),orbit=sm(CUEW(3,'take it')-.3,CUEW(3,'pass it')+.3,t,easeInOutSine);
 const g=sm(3.8,4.7,tau,easeInOutSine),C0:V3=[m[0]-6.5+1.5*orbit,1.35+.5*orbit,m[1]-6.5-2*orbit],T0:V3=[m[0]+3.2,.85,m[1]+1.8+1.2*orbit];
 return look(lerp3(C0,[89.5,2.2,5.5],g),lerp3(T0,[102.5,.9,3],g),lerp(2150+400*push-250*orbit,1550,g));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wk=CUEW(3,'with the'),sc=CUEW(3,'Stay calm'),ta=CUEW(3,'take it'),pi=CUEW(3,'pass it'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,
   under:()=>{
    // "one-on-one with the keeper": one yellow ring round the two of them
    groundRing(s,c,[posOf(RB10,tau),posOf(ZUBIZ,tau)],1,sm(wk-.1,wk+.4,t,easeOutBack)*(1-sm(sc+.3,sc+.7,t)),Y,95);
    pathArrow(s,c,3.35,SHOT,sm(ta-.2,ta+.8,t,easeOut)*(1-sm(E-.8,E-.4,t)),R,97);
    const pw=sm(pi-.1,pi+.5,t,easeOut)*(1-sm(E-.6,E-.3,t));
    if(pw>0){const a=pr(c,[TOUCH[5][1],0,TOUCH[5][2]]),b=pr(c,[NET[0],0,NET[2]]);if(a&&b){const d=toCam(c,[103,0,3])[2];lane(s,Y,a,b,Math.max(5,c.F*.1/d),{progress:pw,seed:99});}}},
   after:({hero,gk})=>{calmMark(s,hero,gk,sm(sc-.1,sc+.4,t,easeOut)*(1-sm(ta+.2,ta+.6,t)));}});
 },
 still:5,
};

const film:RisoStory={
 id:'baggio-spain-1994',format:'11v11',title:"Baggio's late winner",theme:'One-on-one with the keeper: stay calm, take it around them, pass it into the net',
 ageNote:'World Cup quarter-final, Italy v Spain, Foxboro Stadium near Boston, 9 July 1994. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of summer turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits (yellow × blue) and a few red flecks thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
