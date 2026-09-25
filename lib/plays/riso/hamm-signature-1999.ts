/** Mia Hamm v Denmark, FIFA Women's World Cup opening match, Giants Stadium, East Rutherford, New Jersey, 19 June 1999 (USA 3–0): her
 * 17th-minute goal. An iconic-play riso film (RisoStory, chapters mode) for Hamm's SIGNATURE entry ("the dribble and shot": run at
 * defenders with confidence, then finish when you see the gap): a 1:1 reconstruction from written accounts (we cannot watch the footage),
 * printed as a riso sheet.
 * WHY THIS MOMENT: it is the best-documented example of her signature — two written match reports describe it touch by touch (a chest
 * trap, a cut back, the ball popped over a defender and a left-footed finish into the top corner), it opened the 1999 World Cup in front
 * of the biggest crowd ever to watch a women's sporting event, and it is the goal US Soccer called "highlight reel". (The iconicPlays
 * entry's "beaten: 2" is not followed: the accounts name ONE defender beaten, so the film beats one.)
 *
 * SOURCES (what the choreography and kits follow):
 *  - U.S. Soccer match report, "USA Opens 1999 Women's World Cup With 3-0 Victory Over Denmark" (19 June 1999), archived:
 *    https://web.archive.org/web/2017/http://www.ussoccer.com/stories/2014/03/17/11/32/usa-opens-1999-womens-world-cup-with-3-0-victory-over-denmark-hamm-foudy-and-lilly-score-in-front-of
 *  - Gary Davidson, SoccerTimes, "Incredible Hamm lifts United States to 3-0 shutout of Denmark" (19 June 1999), archived:
 *    https://web.archive.org/web/2013/http://www.soccertimes.com/worldcup/1999/games/jun19.htm
 *  - Wikipedia, "1999 FIFA Women's World Cup Group A" (date, kick-off, scorers, stadium, attendance, referee) and "Mia Hamm"
 *  - Match photographs (captions and kits only): Getty Images 1440003702 (Jamie Squire/Allsport, "Mia Hamm … turns to shoot for goal
 *    against Dorthe Larsen"), Getty 140989341 (George Tiedemann/SI, "USA Mia Hamm (9) in action vs Denmark"), AFP/Getty 51614980 (Timothy
 *    Clary: Hamm "jumps into the arms of teammate Carla Overbeck as she celebrates after scoring the first goal").
 * CONFIRMED by those accounts: Saturday 19 June 1999, 3 pm, Giants Stadium, "a sparkling day", sunny, 79 °F; a sell-out 78,972, "the
 * largest crowd ever to watch a women's team sporting event", a crowd "bathed in red, white and blue"; the 17th minute; defender Brandi
 * Chastain (No. 6) "sent a long pass" / "a floated pass" to Hamm (No. 9) "in the right side of the box" (penalty area); Hamm "pulled the
 * ball down with a chest trap to her right foot, cut back and lofted a ball to her left foot to elude defender Katrine Pedersen" (No. 14)
 * — "popped the bouncing ball over a Danish defender" — and "ripped her left-footed shot over the outstretched hand of goalkeeper Dorthe
 * Larsen (No. 1) and just under the crossbar from 12 yards out" / "drilled a 15-yard shot into the near top corner"; Foudy: Hamm "was
 * bouncing the ball off her body"; Hamm's 110th international goal; she jumped into Carla Overbeck's arms to celebrate. KITS (the match
 * photos): USA red shirts (paper number 9), navy shorts with white piping, red socks with a white band; Denmark white shirts with red
 * chevron trim, red shorts, white socks; Larsen a black goalkeeper kit with white shoulder panels. Hamm: a dark-brown ponytail. Giants
 * Stadium's pitch-level wall behind the ad boards is blue.
 * INFERRED (illustrative): the side of the pitch and direction of play as drawn (the right side of the box is drawn on the near side, under
 * the main-stand camera); where Chastain stood (deep on the left) and her right foot; the ball's flight and bounce heights; the exact spot
 * of the trap, the pop and the shot (inside the 12–15 yards the reports give); that the pop was with her right foot (the reports say "to
 * her left foot"); the bounce before the shot (a half-volley); which side of Pedersen she ran; Pedersen's lunge; Larsen's position and dive;
 * every other player's position (other players are unnumbered on purpose); everyone's hair apart from Hamm's; Denmark's number colour;
 * the goalkeeper's gloves; Giants Stadium's shape as drawn (an open, steep, three-tier bowl, no roof), the crowd colours, the ad boards,
 * the camera placements and lenses; Hamm's celebration run (the Overbeck hug is left out of the drawing).
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high main-stand camera in real
 * time: Chastain's long ball, the chest trap, the pop, the goal; 2 = slow-motion replay from a low camera in front of Hamm: the chest trap
 * (a ring on her chest), the flick over Pedersen (the pop arc), the run round her; 3 = slow-motion replay from behind the goal: the
 * left-foot shot over Larsen's hand, under the bar, then the crowd; 4 = the lesson from behind Hamm: a run-at arrow, "eyes up" sightline,
 * the gap lit up, the finish arrow. All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter,
 * drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded.
 *
 * LEAD: when public/plays/narration/hamm-signature-1999/timing.json exists, replace the null in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/hamm-signature-1999/timing.json';  (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,keyPoses,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'New Jersey, 1999. The first game of the Women’s World Cup: USA against Denmark. Brandi Chastain floats a long ball. Mia Hamm brings it down, pops it over a defender... and scores!',seconds:14.2,
  cues:[[.2,'New Jersey'],[1.9,'The first game'],[4.4,'USA against Denmark'],[6.2,'Brandi Chastain'],[7,'floats a long ball'],[8.4,'Mia Hamm'],[9.2,'brings it down'],[10.2,'pops it over'],[11.9,'and scores']]},
 {label:'Watch again',text:'Watch again, slowly. Hamm traps it on her chest. She flicks it over Katrine Pedersen and runs round her.',seconds:8.4,
  cues:[[.15,'Watch again'],[1.7,'Hamm traps'],[2.5,'on her chest'],[3.6,'She flicks it'],[4.7,'Katrine Pedersen'],[6,'runs round her']]},
 {label:'Left foot',text:'Left foot! She fires it past the keeper’s hand, just under the bar. Nearly eighty thousand fans go wild!',seconds:7.8,
  cues:[[.15,'Left foot'],[1.1,'She fires it'],[1.9,'past the keeper'],[3.2,'just under the bar'],[4.6,'Nearly eighty thousand'],[6.1,'go wild']]},
 {label:'Your turn',text:'Your turn: run at defenders with confidence. Keep your eyes up, and when you see the gap, finish!',seconds:8.2,
  cues:[[.15,'Your turn'],[.9,'run at defenders'],[2.2,'with confidence'],[3.3,'Keep your eyes up'],[4.9,'when you see the gap'],[6.4,'finish']]},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py hamm-signature-1999 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/hamm-signature-1999/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('hamm: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (the USA attack +X; Denmark's goal line at X = 105), Y up, Z across
 * (+34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so "the right side of the box"
 * (the attackers' right) is the near side (+Z), and the NEAR post of Hamm's shot is the post at Z = +3.66. Larsen, facing −X, has that
 * post on her LEFT. */
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
const depth=(c:Cam,P:V3)=>toCam(c,P)[2];
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
/** a projected quad only when it is comfortably in front of the camera */
function quadP(c:Cam,q:V3[],minDepth=12):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Giants Stadium: a steep, open, three-tier bowl in the June sun
const CX=52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a boxy rounded rectangle), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(62+d)*Math.sign(c)*Math.pow(Math.abs(c),.3),y,(41+d)*Math.sign(s)*Math.pow(Math.abs(s),.3)];}
/** the tiers: lower bowl, a fascia band (the club level), the upper deck, each [d, y] at its front and back */
const TIERS:[number,number,number,number][]=[[2,1.6,26,13],[27,15.5,50,34]];
type Bowl={seats:V3[][][];fascia:V3[][];wall:V3[][];top:V3[][];crowd:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={seats:[[],[]],fascia:[],wall:[],top:[],crowd:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU;
  TIERS.forEach(([d0,y0,d1,y1],k)=>{o.seats[k].push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
   for(let r=0;r<9;r++)for(let j=0;j<3;j++){const h=hash(i*977+r*31+j*7+k*5003,11);if(h<.1)continue;const u=(r+.5)/9;o.crowd.push({P:rim((i+(j+.5+(hash(i+r*13+j+k*71,4)-.5)*.5)/3)/NS*TAU,lerp(d0,d1,u),lerp(y0,y1,u)+.45),h});}});
  o.fascia.push([rim(a,26,13),rim(b,26,13),rim(b,27,15.5),rim(a,27,15.5)]);
  o.wall.push([rim(a,0,0),rim(b,0,0),rim(b,2,1.6),rim(a,2,1.6)]);
  o.top.push([rim(a,50,34),rim(b,50,34),rim(b,50.6,37),rim(a,50.6,37)]);}
 return o;})();
/** everything behind the pitch: the sky, the bowl, the crowd (roar lifts the marks, flash = flag-waving sparkle) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.26);
 const seats=new Path2D(),fas=new Path2D(),wall=new Path2D(),top=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=polyP(c,q);if(r.length>2)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.seats[0][i],seats);add(BOWL.seats[1][i],seats);add(BOWL.fascia[i],fas);add(BOWL.wall[i],wall);add(BOWL.top[i],top);}
 s.knockout(seats);s.tone(Y,seats,.16);s.tone(R,seats,.1);
 // the crowd, "bathed in red, white and blue": white shirts and hats (paper), red, blue, a little yellow and navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.crowd){const d=toCam(c,q.P);if(d[2]<12)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.4?0:q.h<.62?1:q.h<.8?2:q.h<.9?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.85);s.fill(B,inks[2],.85);s.fill(Y,inks[3],.9);s.fill(K,inks[4],.75);
 // the club-level fascia and the pitch-level wall are Giants Stadium blue; the rim a navy lip against the sky
 s.knockout(fas);s.fill(B,fas,.8);s.tone(K,fas,.2);s.knockout(wall);s.fill(B,wall,.9);s.tone(K,wall,.25);s.knockout(top);s.fill(K,top,.35);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.crowd[Math.floor(hash(i*17+T12*101,3)*BOWL.crowd.length)],d=toCam(c,q.P);if(d[2]<12)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the grass surround, the pitch (yellow × blue) with mowing stripes, ad boards, paper lines, the far goal and the corner flags */
function ground(s:Sheet,c:Cam){
 const sur=polyP(c,[[-10,0,-41],[115,0,-41],[115,0,41],[-10,0,41]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.85);s.tone(B,p,.7);}
 const g=polyP(c,[[-3,0,-37],[108,0,-37],[108,0,37],[-3,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // ad boards: the far touchline and behind the goals (red, with paper panels)
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-38.5],[110,0,-38.5],[110,.9,-38.5],[-4,.9,-38.5]]),polyP(c,[[110.5,0,-36],[110.5,0,36],[110.5,.9,36],[110.5,.9,-36]]),polyP(c,[[-5.5,0,36],[-5.5,0,-36],[-5.5,.9,-36],[-5.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-38.45],[x+3.4,.25,-38.45],[x+3.4,.65,-38.45],[x,.65,-38.45]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[110.45,.25,z],[110.45,.25,z+3.4],[110.45,.65,z+3.4],[110.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.9);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.1,0,TAU,6);}
 circ(105,34,1,Math.PI,1.5*Math.PI,5);circ(105,-34,1,Math.PI/2,Math.PI,5);
 s.knockout(ln);
 goal3(s,c,0,-1);
 // corner flags (navy poles, red flags) at Denmark's end
 const pole=new Path2D(),flag=new Path2D();
 for(const z of [34,-34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);const a=pr(c,[105,1.55,z]),b=pr(c,[105,1.4,z-Math.sign(z)*.45]),e=pr(c,[105,1.2,z]);if(a&&b&&e)flag.addPath(polyPath([a,b,e],true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep. net = paper haze strength (lighter when the camera looks through it). */
const GOAL={x:105,z0:-3.66,z1:3.66,h:2.44};
function goal3(s:Sheet,c:Cam,X:number,d:number,net=.3,bulge?:{z:number;y:number;k:number}){
 const z0=-3.66,z1=3.66,H=2.44,bx=X+d*2;
 // the back of the net bellies out behind where the ball hits it (bulge.k 0..1)
 const bb=(z:number,y:number)=>bulge?bx+d*.55*bulge.k*Math.max(0,1-Math.hypot(z-bulge.z,(y-bulge.y)*1.3)/1.8):bx;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const n=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)n.addPath(polyPath(q,true));}
 s.knockout(n,net);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bb(z,1.9),1.9,z],.025,mesh);for(let j=0;j<3;j++){const y0=1.9*(1-j/3),y1=1.9*(1-(j+1)/3);seg3(c,[bb(z,y0),y0,z],[bb(z,y1),y1,z],.025,mesh);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=lerp(z0,z1,i/4),zb=lerp(z0,z1,(i+1)/4);seg3(c,[bb(za,y),y,za],[bb(zb,y),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]];
/** women footballers: athletic builds, a touch slimmer through the shoulders; heights from the players' listed heights where known */
const W=(h:number,o:{bulk?:number;thighs?:number}={})=>({height:h,bulk:o.bulk??.93,thighs:o.thighs??1.06,head:1.02});
/** USA 19 June 1999 (the match photos): red shirts, paper numbers and trim, navy shorts, red socks with a white band */
const USA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:K,socks:R,boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',build:W(1.68),seed:5,...o});
/** Mia Hamm: No. 9, 5 ft 5 in (1.65 m), a dark-brown ponytail (all confirmed by the photos); quick, strong legs */
const HAMM:AthleteStyle=USA({number:9,hair:[K,.78],hairStyle:'ponytail',skin:SKIN_L,build:W(1.65,{bulk:.94,thighs:1.12}),seed:9});
/** Brandi Chastain: No. 6 (confirmed); blonde short hair (inferred) */
const CHASTAIN:AthleteStyle=USA({number:6,hair:[Y,.85],hairStyle:'short',build:W(1.7),seed:6});
/** Denmark 19 June 1999 (the match photos): white shirts with red chevron trim, red shorts, white socks; red numbers (inferred) */
const DEN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:R,shorts:R,socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.8],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',numberInk:R,build:W(1.7),seed:31,...o});
/** Katrine Pedersen: No. 14 (confirmed); fair ponytail (inferred) */
const PEDERSEN:AthleteStyle=DEN({number:14,hair:[Y,.9],hairStyle:'ponytail',build:W(1.7,{bulk:.96}),seed:14});
/** Dorthe Larsen: No. 1; black goalkeeper kit with white shoulder panels (the photo); gloves inferred */
const LARSEN:AthleteStyle={shirt:[K,.95],trim:'paper',shorts:[K,.95],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.75],hairStyle:'short',line:K,shade:[K,.3],sleeves:'long',gloves:[Y,.9],number:1,numberInk:'paper',build:W(1.74,{bulk:.98}),seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: the ponytail and hem trail); smear = a halftone echo + speed lines for fast moves. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the play (T = play seconds, T = 0 = Chastain strikes the long ball)
const FIG=1.06;// figures 6 % over life size so they read in a small card window
/** the beats: the ball reaches her chest, drops to her right foot, is popped over Pedersen, bounces, the left-foot shot, in the net */
const T_CHEST=2.5,T_DROP=2.92,T_POP=3.32,T_LAND=3.98,T_SHOT=4.3,T_GOAL=4.82;
type Role='hamm'|'gk'|'passer'|'ped'|'usa'|'den';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions are Hermite-interpolated between keys [T, X, Z]. Only Hamm, Chastain, Pedersen and Larsen have beats in the accounts; everyone
 * else is an illustrative marker, unnamed and unnumbered. */
const ACTORS:Actor[]=[
 {name:'Hamm',role:'hamm',style:HAMM,key:true,keys:[[-4,79.5,19.5],[-1.5,82,18],[0,83.8,16.6],[1,86.6,14.8],[1.8,89.2,13.2],[2.3,90.2,12.6],[2.7,90.5,12.4],[3.05,90.75,12.1],[3.32,91.05,11.95],[3.62,92.1,12.4],[3.95,93.3,11.7],[4.3,94,10.3],[4.7,94.7,9.7],[5.3,95.6,10.8],[6.2,97,13.8],[7.4,98.3,17.6],[9,99.4,21]]},
 {name:'Larsen',role:'gk',style:LARSEN,key:true,keys:[[-4,102.4,-1.2],[0,102.5,-.4],[2,103,1.6],[3.3,103.3,1.6],[4.1,103.7,1.1],[9,103.7,1.1]]},
 {name:'Chastain',role:'passer',style:CHASTAIN,key:true,keys:[[-4,55,-4.2],[-1.6,57.3,-6.2],[-.5,59,-7.2],[0,59.6,-7.5],[.6,60.1,-7.4],[3,62.5,-5.5],[9,68,-2]]},
 {name:'Pedersen',role:'ped',style:PEDERSEN,key:true,keys:[[-4,97.5,4.8],[0,97.2,5.8],[1.4,95.4,8.6],[2.5,93.4,10.5],[3,92.55,11.05],[3.32,92.3,11.2],[3.7,92.35,11.1],[4.1,92.9,10.3],[4.6,93.8,9.2],[5.2,94.6,8.4],[9,95.6,7.6]]},
 {name:'den2',role:'den',style:DEN({seed:32,hairStyle:'short',hair:[Y,.7]}),keys:[[-4,99,-1.5],[0,99.3,-1],[2.5,99.9,2.3],[4.2,100.6,3.3],[9,100.2,3]]},
 {name:'den3',role:'den',style:DEN({seed:33,hair:[K,.7]}),keys:[[-4,95.5,-7],[0,95.7,-6],[2.5,97.2,-2.5],[4.3,98.2,-.2],[9,97.8,1]]},
 {name:'den4',role:'den',style:DEN({seed:34,hair:[Y,.8]}),keys:[[-4,88,-9],[0,88.7,-8],[2.5,91.4,-4.8],[4.3,93.2,-2.5],[9,93.4,-1]]},
 {name:'den5',role:'den',style:DEN({seed:35,hairStyle:'short',hair:[K,.6]}),keys:[[-4,81,-2],[0,82.5,-1.5],[2,85.8,0],[3.5,88,1.2],[5,90,2],[9,91.5,2.6]]},
 {name:'den6',role:'den',style:DEN({seed:36}),keys:[[-4,72,-2],[0,73,-3],[3,77,-1],[9,80,1]]},
 {name:'usa2',role:'usa',style:USA({seed:42,hair:[K,.8]}),keys:[[-4,96.8,-3.5],[0,97.3,-3],[2.5,98.8,.2],[4.4,99.5,1.6],[6,99,4],[9,98.5,8]]},
 {name:'usa3',role:'usa',style:USA({seed:43,hair:[Y,.7],hairStyle:'short'}),keys:[[-4,91,-12],[0,92.5,-11],[2.5,95.8,-6.5],[4.4,97.2,-4],[6.2,97.5,0],[9,97.8,5]]},
 {name:'usa4',role:'usa',style:USA({seed:44,hair:[K,.7]}),keys:[[-4,80,-14],[0,82,-13],[3,86.5,-8.5],[5,88.5,-5],[9,92,2]]},
 {name:'usa5',role:'usa',style:USA({seed:45,hair:[Y,.8]}),keys:[[-4,72,4],[0,73.5,5],[3,78,6.5],[5,80,6],[9,86,9]]},
];
const HAMM_I=0,GK_I=1,PASS_I=2,PED_I=3;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posOf(k,T-.08),b=posOf(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bumpT=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** Hamm's chest trap (confirmed: "pulled the ball down with a chest trap to her right foot"): arms spread wide for balance, chest out and
 * leaning back under the dropping ball, knees soft, chin down watching it; then she folds forward over it as it drops to her right foot */
const TRAP=(T:number)=>keyPoses(T,[
 [T_CHEST-.55,posed({lHipF:26,rHipF:18,lKnee:30,rKnee:26,lShA:40,rShA:40,lShF:14,rShF:14,lElb:60,rElb:60,lean:6,pitch:2,neckP:-26})],
 [T_CHEST-.18,posed({lHipF:24,rHipF:30,lKnee:34,rKnee:40,lShA:74,rShA:70,lShF:22,rShF:20,lElb:46,rElb:48,lean:-20,pitch:-6,neckP:22,lHand:.8,rHand:.8,air:.02})],
 [T_CHEST,posed({lHipF:22,rHipF:30,lKnee:36,rKnee:44,lShA:80,rShA:76,lShF:24,rShF:22,lElb:40,rElb:44,lean:-26,pitch:-8,neckP:38,lHand:1,rHand:1,squash:-.04})],
 [T_CHEST+.22,posed({lHipF:26,rHipF:34,lKnee:38,rKnee:48,lShA:62,rShA:58,lShF:18,rShF:16,lElb:50,rElb:50,lean:4,pitch:0,neckP:40,lHand:.6,rHand:.6})],
 [T_DROP-.05,posed({lHipF:20,rHipF:40,lKnee:30,rKnee:56,rAnk:26,lShA:46,rShA:40,lShF:10,rShF:14,lElb:56,rElb:56,lean:18,pitch:4,neckP:44})],
 [T_DROP+.2,posed({lHipF:26,rHipF:22,lKnee:34,rKnee:36,lShA:40,rShA:38,lElb:60,rElb:58,lean:16,pitch:4,neckP:36})],
],{});
/** the pop over Pedersen: a short, soft right-foot scoop (a strike with little back-lift), eyes on the ball */
const POP=(T:number)=>strike(clamp((T-T_POP)/.7+STRIKE_CONTACT),{foot:'r',power:.22});
/** the finish: a full left-foot strike on the half-volley, contact at T_SHOT */
const SHOT=(T:number)=>strike(clamp((T-T_SHOT)/.95+STRIKE_CONTACT),{foot:'l',power:1});
/** Hamm's facing: toward the incoming ball (and Chastain) for the trap, round toward goal for the cut and pop, at the near post for the shot */
const HAMM_FACE_TRAP=yawOf(59.6-90.5,-7.5-12.4),HAMM_FACE_POP=yawOf(1,-.72),HAMM_FACE_SHOT=yawOf(105-94,3.3-10)+14*RAD;
function hammYaw(T:number):number{const v=velOf(HAMM_I,T),run=yawOf(v[0],v[1]);
 if(T<1.9)return run;
 if(T<T_DROP+.1)return lerpA(run,HAMM_FACE_TRAP,sm(1.9,2.25,T));
 if(T<T_POP+.15)return lerpA(HAMM_FACE_TRAP,HAMM_FACE_POP,sm(T_DROP+.05,T_POP-.1,T,easeInOutSine));
 if(T<T_SHOT-.45)return lerpA(HAMM_FACE_POP,run,sm(T_POP+.15,T_POP+.35,T));
 if(T<T_SHOT+.45)return lerpA(run,HAMM_FACE_SHOT,sm(T_SHOT-.45,T_SHOT-.25,T));
 return lerpA(HAMM_FACE_SHOT,run,sm(T_SHOT+.45,T_SHOT+.9,T));}
/** Larsen's dive to her left (the near post), full stretch just as the ball flies over her hand */
const LARSEN_DIVE=(T:number)=>keeperDive(clamp((T-(T_GOAL-.02))/.9+.55),{side:'l',height:.9});
/** the whole pose of actor k at T, with its yaw */
function poseOf(k:number,T:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,T);
 const[hx,hz]=posOf(HAMM_I,T);
 let yaw=sp>.9?yawOf(v[0],v[1]):yawOf(hx-x,hz-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(T*1.3):stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,T)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='passer'){yaw=lerpA(yaw,PASS_YAW,sm(-1,-.3,T)*(1-sm(.8,1.6,T)));const u=(T-(-STRIKE_CONTACT*1.0))/1.0;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u)),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(a.role==='hamm'){yaw=hammYaw(T);
  const wt=sm(T_CHEST-.75,T_CHEST-.45,T)*(1-sm(T_DROP+.12,T_DROP+.3,T));if(wt>0)p=blendPose(p,TRAP(T),wt);
  const wp=sm(T_POP-.4,T_POP-.22,T)*(1-sm(T_POP+.2,T_POP+.36,T));if(wp>0)p=blendPose(p,POP(T),wp);
  const ws=sm(T_SHOT-.5,T_SHOT-.3,T)*(1-sm(T_SHOT+.45,T_SHOT+.7,T));if(ws>0)p=blendPose(p,SHOT(T),ws);
  // the celebration: a run toward the main stand, arms out, then the jump with both arms up
  if(T>T_GOAL+.2){const wc=sm(T_GOAL+.2,T_GOAL+.6,T);p=blendPose(p,T<T_GOAL+3.1?celebrate(distOf(k,T)/3.3,{kind:'run'}):celebrate((T-T_GOAL-3.1)*1.1,{kind:'arms'}),wc);
   if(T>T_GOAL+2.8)yaw=lerpA(yaw,yawOf(-.6,1),sm(T_GOAL+2.8,T_GOAL+3.3,T));}}
 if(a.role==='ped'){// jockeys Hamm, then jabs a leg at the ball as it is popped over her (her left leg toward the ball, Hamm's side)
  yaw=lerpA(yawOf(hx-x,hz-z),yaw,sm(3.7,4.1,T));
  const wl=sm(T_POP-.45,T_POP-.25,T)*(1-sm(T_POP+.35,T_POP+.6,T));if(wl>0)p=blendPose(p,lunge(clamp((T-T_POP)/.8+.6),{side:'l'}),wl);}
 if(a.role==='gk'){const b=ballAt(Math.min(T,T_SHOT));yaw=lerpA(Math.PI,yawOf(b[0]-x,b[2]-z),.6);if(T>T_GOAL-.55)p=blendPose(LARSEN_DIVE(T),keeperSet(T*1.3),sm(T_GOAL+1.6,T_GOAL+2.6,T,easeInOutSine));}
 if(a.role==='usa'&&T>T_GOAL+.6){p=blendPose(p,celebrate((T-T_GOAL)*1.1+k*.3,{kind:'arms'}),sm(T_GOAL+.6,T_GOAL+1.1,T)*clamp(1-(sp-.8)/1.5));}
 return{p,yaw};
}

// ---------------------------------------------------------------- the contacts, solved from the bodies; the ball
const PASS_YAW=yawOf(90.5-59.6,12.4+7.5);
function skAt(k:number,T:number){const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T);return solve(p,ACTORS[k].style.build,{x,z,yaw},FIG);}
// ballAt is referenced by poseOf (Larsen's yaw) before the contacts exist: until they are solved the ball rests at Chastain's feet
let BALL0:V3=[59.9,.11,-7.3],CHEST_PT:V3=[91.3,1.25,11.8],DROP:V3=[91.6,.11,11.6],POP_PT:V3=[92.2,.11,11.4],SHOT_PT:V3=[94.5,.2,9.2],SOLVED=false;
/** the near top corner, just under the bar (confirmed) and just inside the near post; the net and the rest after it */
const TOP:V3=[105.1,2.2,3.2],NET:V3=[106.7,1.5,2.95],REST:V3=[106.55,.11,2.7];
let LAND:V3=[94.2,.11,9.6];
/** the ball at play time T: Chastain's long floated ball, onto Hamm's chest, down to her right foot, popped over Pedersen, one bounce, the
 * left-foot half-volley into the near top corner, the net */
function ballAt(T:number):V3{
 if(T<0||!SOLVED)return BALL0;
 if(T<T_CHEST)return lerp3(BALL0,CHEST_PT,T/T_CHEST,7.4);
 if(T<T_DROP)return lerp3(CHEST_PT,DROP,sm(T_CHEST,T_DROP,T,u=>u*u*.4+u*.6),.18);
 if(T<T_POP)return lerp3(DROP,POP_PT,(T-T_DROP)/(T_POP-T_DROP),.42);
 if(T<T_LAND)return lerp3(POP_PT,LAND,(T-T_POP)/(T_LAND-T_POP),1.75);
 if(T<T_SHOT)return lerp3(LAND,SHOT_PT,(T-T_LAND)/(T_SHOT-T_LAND),.34);
 if(T<T_GOAL)return lerp3(SHOT_PT,TOP,(T-T_SHOT)/(T_GOAL-T_SHOT),.28);
 if(T<T_GOAL+.18)return lerp3(TOP,NET,(T-T_GOAL)/.18);
 if(T<T_GOAL+.75)return lerp3(NET,REST,sm(T_GOAL+.18,T_GOAL+.75,T,u=>u*u));
 return REST;
}
{const sp=skAt(PASS_I,0);BALL0=[sp.rToe[0],.11,sp.rToe[2]];
 const sc=skAt(HAMM_I,T_CHEST),d=sub3(sc.chest,sc.pelvis),f:V3=[Math.cos(HAMM_FACE_TRAP),0,-Math.sin(HAMM_FACE_TRAP)];CHEST_PT=[sc.chest[0]+f[0]*.17+d[0]*.1,sc.chest[1]+.08,sc.chest[2]+f[2]*.17+d[2]*.1];
 const sd=skAt(HAMM_I,T_DROP);DROP=[sd.rToe[0],.11,sd.rToe[2]];
 const s1=skAt(HAMM_I,T_POP);POP_PT=[s1.rToe[0],Math.max(.11,s1.rToe[1]),s1.rToe[2]];
 const s2=skAt(HAMM_I,T_SHOT);SHOT_PT=[s2.lToe[0],Math.max(.12,s2.lToe[1]),s2.lToe[2]];
 LAND=[lerp(POP_PT[0],SHOT_PT[0],.84),.11,lerp(POP_PT[2],SHOT_PT[2],.84)];SOLVED=true;}

// ---------------------------------------------------------------- the ball print
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:3});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={bg:Pt|null;br:number;hamm?:DrawResult;ped?:DrawResult;gk?:DrawResult};
/** everything on the pitch at T (positions on ones, poses on twos at Tp; Tprev = the drawing before, for secondary motion); the goal is
 * printed in depth order with the players (through its net when the camera is behind it) */
function play(s:Sheet,c:Cam,v:View,T:number,Tp:number,Tprev:number,o:{minBall?:number;near?:number;hero?:boolean;after?:(r:PlayOut)=>void;ghost?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,T),q=toCam(c,[x,.9,z]);if(q[2]<(o.near??3.5))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(T),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<380)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg){const hgt=b[1];sh.addPath(polyPath(blob(bground[0],bground[1],br*.9/(1+hgt*.3),br*.28/(1+hgt*.3),2,{amp:.05,n:12}),true));}s.tone(K,sh,.4);
 const out:PlayOut={bg,br};
 type It={d:number;draw:()=>void};const items:It[]=[];
 const behind=c.C[0]>GOAL.x+.5,bk=T>T_GOAL?bumpT(T_GOAL,T_GOAL+.9,T):0;
 items.push({d:behind?-1:depth(c,[106,1.2,0]),draw:()=>goal3(s,c,105,1,behind?.16:.3,bk>0?{z:NET[2],y:NET[1],k:bk}:undefined)});
 if(bg)items.push({d:bq[2],draw:()=>ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11)});
 for(const e of list)items.push({d:e.d,draw:()=>{
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,Tp),px=e.h*ppu,big=e.h>=260;
  // phone heat: low detail for small figures and extras; during a passage only Hamm keeps 'mid'
  const detail=passing?(e.k===HAMM_I?'mid':'low'):px<50||(!a.key&&px<170)?'low':'auto';
  const fast=(e.k===HAMM_I&&((T>T_POP-.2&&T<T_POP+.25)||(T>T_SHOT-.25&&T<T_SHOT+.3)))||(e.k===GK_I&&T>T_GOAL-.35&&T<T_GOAL+.3)||(e.k===PED_I&&T>T_POP-.2&&T<T_POP+.3);
  const prv=big&&!passing?poseOf(e.k,Tprev):null;
  const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:e.h<380?false:undefined,detail},{x:e.x,z:e.z,yaw},prv?{prev:prv.p,prevPlace:{x:e.x,z:e.z,yaw:prv.yaw},smear:hero&&fast}:{});
  if(e.k===HAMM_I)out.hamm=r;if(e.k===PED_I)out.ped=r;if(e.k===GK_I)out.gk=r;}});
 items.sort((p,q)=>q.d-p.d);
 o.ghost?.(out);
 for(const it of items)it.draw();
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a yellow ring on the grass round a point (a stamped spot), knocked out under */
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r,.01,z+Math.sin(i/36*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,c.F*.07/depth(c,[x,0,z])),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a flight path of the ball between play times a..b as a bold ribbon with an arrowhead (progress u) */
function flightArrow(s:Sheet,c:Cam,a:number,b:number,u:number,ink:string,wm=.12){if(u<=0)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=18;i++){const P=ballAt(lerp(a,b,i/18)),q=toCam(c,P);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=partial(smoothPts(pts,false,6,2),u),wd=Math.max(7,c.F*wm/d);if(line.length<2)return;
 s.knockout(ribbon(line,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(line,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const e=line[line.length-1],p0=line[Math.max(0,line.length-3)];if(Math.hypot(e[0]-p0[0],e[1]-p0[1])>1)laneArrow(s,ink,p0,[e[0]+(e[0]-p0[0])*.02,e[1]+(e[1]-p0[1])*.02],wd,{seed:62,head:wd*3});}
/** "eyes up": a dotted yellow sightline from her eyes to a point */
function sightline(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number){if(!r||!to||w<=0)return;const h=r.joints.face,n=r.joints.head,hs=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+6;
 const L=Math.hypot(to[0]-h[0],to[1]-h[1]);if(L<hs)return;const dots=new Path2D(),N=Math.max(3,Math.min(14,Math.floor(L/(hs*1.1))));
 for(let i=1;i<N;i++){const u=i/N;if(u>w)break;const x=lerp(h[0],to[0],u),y=lerp(h[1],to[1],u),rr=hs*.28;dots.addPath(polyPath(blob(x,y,rr,rr,i+5,{amp:.1,n:10}),true));}
 s.knockout(dots,.8);s.fill(Y,dots,.95);}
/** "with confidence": little yellow ticks sparking round her head */
function ticks(s:Sheet,r:DrawResult|undefined,w:number,t:number){if(!r||w<=0)return;const h=r.joints.head,n=r.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*2+6;
 const p=new Path2D();for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.42,pulse=1+.12*Math.sin(t*9+i),r0=u*1.25*pulse,r1=u*(1.25+.75*w)*pulse;p.addPath(ribbon([[h[0]+Math.cos(a)*r0,h[1]+Math.sin(a)*r0],[h[0]+Math.cos(a)*r1,h[1]+Math.sin(a)*r1]],u*.22,{seed:80+i,taper:.5,wobble:.3}));}
 s.knockout(p,.85*w);s.fill(Y,p,.95*w);}
/** a stamped ring round a point on screen (the chest trap): knocked out under */
function screenRing(s:Sheet,p:Pt|null,r:number,w:number,ink=Y){if(!p||w<=0)return;const pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([p[0]+Math.cos(a)*r*(1+.04*Math.sin(a*3)),p[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,r*.16),{close:true,seed:17,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** the goal-mouth "gap": the near top corner lit up as a yellow frame just inside the post and under the bar */
function gapFrame(s:Sheet,c:Cam,w:number){if(w<=0)return;const q=polyP(c,[[105,1.5,2.4],[105,2.4,2.4],[105,2.4,3.62],[105,1.5,3.62]]);if(q.length<4)return;
 const pts=smoothPts(q,true,4,1);const rr=ribbon(pts,Math.max(5,c.F*.06/depth(c,[105,2,3])),{close:true,seed:19,taper:0,wobble:.8});s.knockout(rr,.85*w);s.fill(Y,rr,.95*w);
 const fillp=polyPath(q,true);s.tone(Y,fillp,.35*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** T from chapter-1 time: real time, the long ball struck just as "floats" is said, so the chest lands on "brings it down" and the goal
 * on "scores" */
const kick1=()=>CUEW(0,'floats')-.25;
const tau1=(t:number)=>clamp(t-kick1(),T0,T1);
const CAM1:V3=[64,30,80];
function cam1(t:number):Cam{
 const T=tau1(t),S=SECS(0),bc=CUEW(0,'Brandi');
 // open wide on the sunlit bowl, settle on Chastain as she lines it up, then follow the long ball into the box and stay on the finish
 const wide:V3=[60,13,-52],pass:V3=[64,.5,-4],b=ballAt(T),bt:V3=[lerp(b[0],96,.3),.6,lerp(b[2],7,.35)],fin:V3=[97.5,1,6.5];
 const toPass=sm(1,bc-.3,t,easeInOutSine),follow=sm(-.1,1.4,T,easeInOutSine),finish=sm(T_POP-.6,T_SHOT,T,easeInOutSine);
 let tg=lerp3(wide,pass,toPass);tg=lerp3(tg,bt,follow);tg=lerp3(tg,fin,finish);
 const F=key(t,[[0,2300],[bc-.3,6200],[kick1()+.5,5000],[kick1()+T_CHEST-.4,7200],[kick1()+T_POP,8600],[kick1()+T_GOAL+.6,7400],[S,7000]],easeInOutSine);
 return look(CAM1,tg,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),T=tau1(t),tp=tau1(twos(t)),sc=CUEW(0,'and scores');
  stadium(s,c,v,t,{roar:sm(sc-.3,sc+.4,t)*(1-sm(SECS(0)-.6,SECS(0),t)*.4),flash:sm(sc-.2,sc+.3,t)*(1-sm(sc+2.4,sc+3,t))});
  ground(s,c);
  play(s,c,v,T,tp,tau1(twos(t)-1/12),{minBall:7});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(HAMM_I,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:11.9,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera in front of her: the chest trap, the flick over Pedersen
const tau2=(t:number)=>key(t,[[0,1.7],[CUEW(1,'Hamm traps'),2.05],[CUEW(1,'on her chest'),T_CHEST+.02],[CUEW(1,'She flicks'),T_POP-.18],[CUEW(1,'Katrine'),T_POP+.28],[CUEW(1,'runs round'),T_LAND-.05],[SECS(1),T_SHOT-.12]],linear);
function cam2(t:number):Cam{
 const S=SECS(1),T=tau2(t),turn=sm(CUEW(1,'She flicks')-.6,CUEW(1,'Katrine')+.4,t,easeInOutSine),back=sm(CUEW(1,'runs round')-.4,S,t,easeInOutSine);
 // in front of her as she faces the long ball, swinging round to her side as she turns to goal and goes round Pedersen
 const C:V3=[lerp(84.2,87.6,turn)+1.2*back,lerp(1.7,2.1,turn)+.5*back,lerp(5.4,1.6,turn)-.4*back];
 const[hx,hz]=posOf(HAMM_I,T),b=ballAt(T);
 const tg:V3=[lerp(hx,b[0],.35)+.4*turn,lerp(1.15,1.0,turn),lerp(hz,b[2],.35)-.3*turn];
 return look(C,tg,lerp(1900,1750,turn)-150*back);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),T=tau2(t),tp=tau2(twos(t)),hb=CUEW(1,'Hamm traps'),wc=CUEW(1,'on her chest'),fl=CUEW(1,'She flicks'),kp=CUEW(1,'Katrine'),rr=CUEW(1,'runs round'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,T,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,near:2,ghost:()=>{
   // "Hamm traps it": the long ball's flight so far, printed behind the ball (red)
   flightArrow(s,c,Math.max(0,T-1.3),Math.min(T,T_CHEST),sm(hb-.2,hb+.3,t)*(1-sm(wc+.3,wc+.8,t)),R,.08);
   // "flicks it over Katrine Pedersen": the pop's arc over her (yellow), then Hamm's run round her (red dashed on the grass)
   flightArrow(s,c,T_POP,Math.max(T_POP+.01,Math.min(T,T_LAND)),sm(fl-.1,fl+.3,t)*(1-sm(E-1,E-.6,t)),Y,.07);
   const rw=sm(rr-.2,rr+.4,t,easeOut)*(1-sm(E-.9,E-.55,t));if(rw>0){const pts:Pt[]=[];for(let i=0;i<=14;i++){const[x,z]=posOf(HAMM_I,lerp(T_POP,T_SHOT,i/14)),q=pr(c,[x,.01,z]);if(q)pts.push(q);}
    if(pts.length>4){const d=depth(c,[93.4,0,10.8]);const line=partial(smoothPts(pts,false,4,2),rw);if(line.length>1){s.knockout(ribbon(line,Math.max(6,c.F*.09/d),{seed:65,taper:.1,wobble:.6}),.8);laneArrow(s,R,line[Math.max(0,line.length-3)],line[line.length-1],Math.max(4,c.F*.05/d),{seed:66,head:Math.max(10,c.F*.16/d)});s.fill(R,ribbon(line,Math.max(4,c.F*.05/d),{seed:65,taper:.1,wobble:.6}),.9);}}}},
   after:({hamm,ped})=>{
    // "on her chest": a yellow ring stamped on her chest as the ball lands on it
    if(hamm){const ch=hamm.joints.chest,nk=hamm.joints.neck,rad=Math.hypot(ch[0]-nk[0],ch[1]-nk[1])*1.25+8;screenRing(s,[lerp(ch[0],nk[0],.35),lerp(ch[1],nk[1],.35)],rad,sm(wc-.15,wc+.25,t,easeOutBack)*(1-sm(fl-.4,fl,t)));}
    // "Katrine Pedersen": a red ring round the defender's feet as the ball goes over her
    if(ped){const w=sm(kp-.1,kp+.3,t,easeOutBack)*(1-sm(rr+.3,rr+.8,t));if(w>0){const[px,pz]=posOf(PED_I,T);groundRing(s,c,px,pz,.75,w,R);}}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(HAMM_I,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · slow replay from behind the goal: the left foot, over Larsen's hand, under the bar; the crowd
const tau3=(t:number)=>{const lf=CUEW(2,'Left foot'),sf=CUEW(2,'She fires'),pk=CUEW(2,'past the keeper'),ub=CUEW(2,'just under'),ne=CUEW(2,'Nearly');
 return key(t,[[0,T_LAND-.2],[lf+.4,T_SHOT-.1],[sf+.3,T_SHOT+.04],[pk+.6,T_GOAL-.1],[ub+.5,T_GOAL+.12],[ne,T_GOAL+.9],[SECS(2),T_GOAL+3.6]],linear);};
const rise3=(t:number)=>sm(CUEW(2,'Nearly')-.5,CUEW(2,'Nearly')+.9,t,easeInOutSine);
function cam3(t:number):Cam{
 const T=tau3(t),up=rise3(t),pan=sm(CUEW(2,'She fires')-.2,CUEW(2,'just under')+.2,t,easeInOutSine);
 const C:V3=[111.2-2*up,2.1+3.4*up,6.2+3.5*up],b=ballAt(Math.min(T,T_GOAL)),[hx,hz]=posOf(HAMM_I,Math.min(T,T_SHOT+.2));
 // long lens on Hamm as she shoots, panning with the ball to the near top corner, then up to the crowd
 const tg0:V3=[lerp(hx+.5,lerp(101,b[0],.4),pan),lerp(1,1.5,pan),lerp(hz-.4,lerp(5,b[2],.4),pan)],tg1:V3=[88,9,42];
 return look(C,lerp3(tg0,tg1,up),lerp(lerp(3000,1900,pan),900,up));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),T=tau3(t),tp=tau3(twos(t)),lf=CUEW(2,'Left foot'),pk=CUEW(2,'past the keeper'),ub=CUEW(2,'just under'),ne=CUEW(2,'Nearly'),gw=CUEW(2,'go wild'),up=rise3(t);
  stadium(s,c,v,t,{roar:sm(ub,ub+.6,t),flash:sm(ne-.1,ne+.4,t)});
  ground(s,c);
  play(s,c,v,T,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,near:1.2,after:({hamm,gk})=>{
   // "Left foot!": a spark off her left boot at contact
   const age=T-T_SHOT;if(hamm&&age>-.03&&age<.35){const q=hamm.joints.lToe;sparkBurst(s,Y,q[0],q[1],c.F*.5/depth(c,SHOT_PT),{n:9,seed:91,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.2)/.15)),width:Math.max(6,c.F*.04/depth(c,SHOT_PT))});}
   // "past the keeper's hand": a red ring round Larsen's reaching glove
   if(gk){const w=sm(pk+.2,pk+.6,t,easeOutBack)*(1-sm(ub+.6,ub+1.1,t)),hi=gk.joints.lHa[1]<gk.joints.rHa[1],hd=hi?gk.joints.lHa:gk.joints.rHa,sh=hi?gk.joints.lSh:gk.joints.rSh;screenRing(s,hd,Math.hypot(hd[0]-sh[0],hd[1]-sh[1])*.55+6,w,R);}
   // "just under the bar": the shot's line printed as it flies (yellow), and the corner lit
   flightArrow(s,c,T_SHOT,Math.max(T_SHOT+.01,Math.min(T,T_GOAL)),sm(lf,lf+.3,t)*(1-sm(ne-.6,ne-.2,t)),Y,.09);
   gapFrame(s,c,sm(ub-.1,ub+.3,t,easeOutBack)*(1-sm(ne-.5,ne-.1,t)));}});
  // "Nearly eighty thousand fans go wild": the camera lifts to the crowd — flags and confetti over the bowl
  if(up>.2){const k=sm(ne,gw+.6,t),fall=(t-ne)*260;for(const[sd,off] of [[7,0],[8,.5]] as [number,number][]){const y0=-v.hy*2.2+((fall+off*v.hy*2)%(v.hy*2.4));confetti(s,[R,B,Y,'paper'],[-v.hx,y0,v.hx*2,v.hy*1.6],Math.round(36*k),sd,{size:34,cov:.95});}}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),q=toCam(c,[88,9,42]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(10,c.F*3/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: behind Hamm, the goal at the top of the frame
const tau4=(t:number)=>{const rd=CUEW(3,'run at'),wc=CUEW(3,'with confidence'),ey=CUEW(3,'Keep your eyes'),gp=CUEW(3,'when you see'),fn=CUEW(3,'finish');
 return key(t,[[0,T_POP-.5],[rd+.2,T_POP-.4],[wc+.2,T_POP-.25],[ey+.4,T_POP-.12],[gp,T_POP+.1],[gp+1,T_LAND],[fn,T_SHOT-.05],[fn+.8,T_GOAL],[SECS(3),T_GOAL+.6]],linear);};
function cam4(t:number):Cam{
 const push=sm(CUEW(3,'with confidence')-.3,CUEW(3,'Keep your eyes')+.3,t,easeInOutSine),back=sm(CUEW(3,'finish')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[82.6+1.8*push-1.2*back,6.4-1.2*push+.8*back,24.5-1*push+.6*back];
 const tg:V3=[96.4+.8*push,1,8.2-.4*push];
 return look(C,tg,2500+500*push-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),T=tau4(t),tp=tau4(twos(t)),rd=CUEW(3,'run at'),wc=CUEW(3,'with confidence'),ey=CUEW(3,'Keep your eyes'),gp=CUEW(3,'when you see'),fn=CUEW(3,'finish'),E=SECS(3);
  stadium(s,c,v,t,{roar:sm(fn+.6,fn+1,t)});
  ground(s,c);
  // "the gap": a yellow ring where the ball will drop behind Pedersen
  const gw=sm(gp-.1,gp+.35,t,easeOutBack)*(1-sm(E-1,E-.6,t));groundRing(s,c,LAND[0],LAND[2],.6,gw);
  play(s,c,v,T,tp,tau4(twos(t)-1/12),{minBall:6,near:3,hero:true,ghost:()=>{
   // "run at defenders": a bold red arrow on the grass from Hamm straight at Pedersen
   const aw=sm(rd-.1,rd+.5,t,easeOut)*(1-sm(E-1,E-.6,t));if(aw>0){const[hx,hz]=posOf(HAMM_I,1.7),[px,pz]=posOf(PED_I,T_POP),a=pr(c,[hx+.3,.01,hz-.2]),b=pr(c,[lerp(hx,px,.8),.01,lerp(hz,pz,.8)]);
    if(a&&b){const wd=Math.max(7,c.F*.12/depth(c,[hx,0,hz]));s.knockout(ribbon([a,[lerp(a[0],b[0],aw),lerp(a[1],b[1],aw)]],wd*2,{seed:70,taper:0,wobble:.6}),.8);laneArrow(s,R,a,b,wd,{progress:aw,seed:71,head:wd*2.6});}}
   // "when you see the gap": the pop's arc over her into the ring
   flightArrow(s,c,T_POP,Math.max(T_POP+.01,Math.min(T,T_LAND)),sm(gp,gp+.4,t)*(1-sm(E-1,E-.6,t)),Y,.08);},
   after:({hamm})=>{
    ticks(s,hamm,sm(wc-.1,wc+.4,t,easeOutBack)*(1-sm(ey+.2,ey+.6,t)),t);
    // "keep your eyes up": her sightline to the near top corner
    sightline(s,hamm,pr(c,[105,2.1,3]),sm(ey-.1,ey+.6,t)*(1-sm(gp+.8,gp+1.2,t)));
    gapFrame(s,c,sm(gp+.3,gp+.7,t,easeOutBack)*(1-sm(E-.8,E-.5,t)));
    // "finish!": the shot's line into the corner and a big yellow burst in the net
    flightArrow(s,c,T_SHOT,Math.max(T_SHOT+.01,Math.min(T,T_GOAL)),sm(fn-.1,fn+.3,t)*(1-sm(E-.7,E-.4,t)),Y,.12);
    const age=T-T_GOAL;if(age>-.03&&age<.6){const q=pr(c,TOP);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.7/depth(c,TOP),{n:10,seed:93,g:easeOutBack(clamp((age+.03)/.1))*(1-clamp((age-.4)/.2)),width:Math.max(6,c.F*.05/depth(c,TOP))});}}});
 },
 still:5.4,
};

const film:RisoStory={
 id:'hamm-signature-1999',format:'11v11',title:"Hamm's dribble and shot",theme:'Run at defenders with confidence, then finish when you see the gap',
 ageNote:'Women’s World Cup opening match, USA v Denmark, Giants Stadium, New Jersey, 19 June 1999. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little burst of red-white-and-blue confetti and a yellow spark where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const g=easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3));if(g>0)sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age<.9){const u=easeOut(clamp(age/.6)),r=80+160*u;confetti(s,[R,B,'paper'],[x-r,y-r*.8+120*age*age,r*2,r*1.4],10,seed+1,{size:18*(1-clamp((age-.6)/.3))+2,cov:.95});}},
};
export default film;
/** Solved contact points (pitch metres; X to Denmark's goal line at 105, Z across; the near post at Z = +3.66) — checked by the test. */
export const FACTS={BALL0,CHEST_PT,POP_PT,SHOT_PT,LAND,TOP,GOAL,ballAt,T_CHEST,T_POP,T_SHOT,T_GOAL,
 hammAt:(T:number)=>posOf(HAMM_I,T),pedersenAt:(T:number)=>posOf(PED_I,T),
 /** Larsen's hands at T (for the "over the outstretched hand" check) */
 larsenHands:(T:number)=>{const sk=skAt(GK_I,T);return[sk.lHa,sk.rHa];},
 hammToes:(T:number)=>{const sk=skAt(HAMM_I,T);return{l:sk.lToe,r:sk.rToe,chest:sk.chest};}};
