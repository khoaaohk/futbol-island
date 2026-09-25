/** Diego Maradona v England, World Cup quarter-final, Estadio Azteca, Mexico City, 22 June 1986 (Argentina 2–1 England): the second
 * goal, the "Goal of the Century". An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we
 * cannot watch the footage), printed as a riso sheet. Kid-appropriate: the controversial first goal four minutes earlier is not narrated.
 *
 * SOURCES (what the choreography and kit follow):
 *  - Britannica, "Famous FIFA World Cup Goals: Diego Maradona's 'Goal of the Century'"
 *    https://www.britannica.com/sports/Famous-FIFA-World-Cup-Goals-Maradonas-Goal-of-the-Century
 *  - Goal.com, "Revisiting Diego Maradona's 'Goal of the Century' for Argentina against England at the 1986 World Cup"
 *    https://www.goal.com/en/news/revisiting-diego-maradona-s-goal-of-the-century-on-its-36th-anniversary/blt29715b88c60e1fb3
 *  - Wikipedia, "Goal of the century" and "Argentina v England (1986 FIFA World Cup)" (search summaries; the pages were not fetched)
 *    https://en.wikipedia.org/wiki/Goal_of_the_century  https://en.wikipedia.org/wiki/Argentina_v_England_(1986_FIFA_World_Cup)
 *  - FIFA, "Watch Diego Maradona's epic performance v England in 1986"  https://www.fifa.com/en/tournaments/mens/worldcup/articles/diego-maradona-argentina-england
 *  - Kits: Flashscore, "The iconic kit that made history for Argentina against England in the summer of 1986"; Goal.com, "ICONS: From
 *    Tepito to the Azteca"; beIN SPORTS, "The Story Behind Argentina's Improvised Jerseys at Mexico 86"; museumofjerseys.com "Great one-offs –
 *    Argentina, 1986"; englandfootballonline.com "England's Home Uniform World Cup 1986"; Budds, "Peter Shilton's Hand of God shirt".
 * CONFIRMED by those accounts: 22 June 1986, Estadio Azteca, quarter-final, Argentina won 2–1 and Maradona (captain, number 10) scored both;
 * this goal came about four minutes after the first; he collected the ball in his own half, turned ("spun") away and left Peter Beardsley,
 * outpaced Peter Reid, skipped past Terry Butcher, danced round Terry Fenwick (a desperate shirt pull) as he entered the area, went round
 * keeper Peter Shilton (who had come off his line) and scored; a ~60-yard (55 m) run of about 11 seconds past five England players; left
 * foot; he said he meant to pass to Jorge Valdano but "they surrounded me", so he finished it himself; voted FIFA's Goal of the Century in
 * 2002. KIT: Argentina did NOT wear their sky-blue and white stripes: as the designated away side they wore improvised DARK BLUE Le Coq
 * Sportif shirts bought in Mexico City, white-trimmed V-neck, silver numbers ironed on (printed here: blue shirt, paper number and trim).
 * England wore white shirts and navy shorts; Shilton wore a grey (grey and blue) goalkeeper shirt.
 * INFERRED (illustrative): every position and timing between those beats; who passed to him (widely credited to Héctor Enrique) and from
 * where; which way he spun; the exact line of the run, where each defender stood and lunged, the jinks; the number of touches (the film
 * derives ~14 small touches from his stride); which side he rounded Shilton, Shilton's dive, Butcher's late slide as he shot; the finish
 * spot; the celebration run; the other 18 players' positions; Argentina's shorts (dark) and socks (blue), England's white socks and trim
 * inks, Shilton's shorts, socks and gloves; the referee's black kit; the Azteca's shape (a rounded bowl: lower tier, a band of private
 * boxes, a shaded upper tier under the roof ring), the crowd colours, the noon haze, the worn patches on the pitch, the camera placements,
 * the photographers' flashes, the direction of play on screen.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, panning with the ball (from "gets the ball" to "goal" the run plays at 0.8–1.5× real time); 2 = slow-motion replay from a low
 * touchline camera: the spin and the first touches (a glue thread from his left boot to the ball, touch ticks on the grass), a fast
 * replay pan, then Butcher (stay low, the cut); 3 = replay from behind the goal: round Shilton, left-foot finish, then a swing round to the
 * celebration with the Azteca crowd flashing; 4 = the lesson from a low front camera on the Fenwick beat (ball-close ring, touch ticks,
 * stay-low arrow, balance base, the change-of-direction arrow). All figures are the shared riso athlete (lib/plays/riso/athlete.ts),
 * routed through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming)
 * re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,slideTackle,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Mexico City, 1986. Diego Maradona gets the ball, spins away from two England players, and off he goes, from his own half! Past one... still going, past another, into the box... goal!',seconds:13.6,
  cues:[[.2,'Mexico City'],[1.7,'Diego Maradona'],[2.6,'gets the ball'],[3.3,'spins'],[4.9,'and off he goes'],[5.8,'from his own half'],[7,'Past one'],[8,'still going'],[9.2,'past another'],[10.2,'into the box'],[11.9,'goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. Tiny touches keep the ball glued to his left foot. He stays low, and quick cuts beat each defender.',seconds:9.8,
  cues:[[.15,'Watch it again'],[1.8,'Tiny touches'],[3,'glued'],[3.9,'left foot'],[5,'He stays low'],[6.4,'quick cuts'],[7.6,'each defender']]},
 {label:'Round the keeper',text:'He goes round keeper Peter Shilton and scores the Goal of the Century!',seconds:7.4,
  cues:[[.15,'He goes round'],[1.2,'keeper Peter Shilton'],[2.6,'and scores'],[3.6,'the Goal of the Century']]},
 {label:'Your turn',text:'Your turn: keep the ball close with tiny touches, stay low and balanced, and change direction to beat defenders.',seconds:8.6,
  cues:[[.15,'Your turn'],[1,'keep the ball close'],[2.2,'tiny touches'],[3.4,'stay low'],[4.3,'balanced'],[5.3,'change direction'],[6.5,'beat defenders']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py maradona-1986, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/maradona-1986/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-maradona-1986.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/maradona-1986/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('maradona: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Argentina attack +X, England's goal line at 105), Y up, Z across
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
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- the Azteca: one great rounded bowl (lower tier, boxes, shaded upper tier, roof ring)
const CX=52.5,NS=64;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(58+d)*Math.sign(c)*Math.pow(Math.abs(c),.5),y,(41+d)*Math.sign(s)*Math.pow(Math.abs(s),.5)];}
const LOW=(b:number):[number,number]=>[2+24*b,1.8+13*b],UP=(b:number):[number,number]=>[27+21*b,19.5+16*b];
type Bowl={low:V3[][];box:V3[][];up:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number;up:boolean}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],box:[],up:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.box.push([rim(a,26,14.8),rim(b,26,14.8),rim(b,27,19.5),rim(a,27,19.5)]);
  o.roof.push([rim(a,31,41),rim(b,31,41),rim(b,52,38),rim(a,52,38)]);
  o.fascia.push([rim(a,31,39.4),rim(b,31,39.4),rim(b,31,41.4),rim(a,31,41.4)]);
  for(const [f,rows,up] of [[LOW,9,false],[UP,7,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),11);if(h<.18)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,up});}}
 return o;})();
/** everything behind the pitch: noon haze, the bowl, the crowd (roar lifts the seat marks, flash = photographers' bulbs) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 // Mexico City at noon: a hazy pale sky, warmer toward the rim
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.2);
 const haze=new Path2D();haze.rect(-1e4,-v.hy*.6,2e4,1e4);s.tone(Y,haze,.14);
 // the bowl: raked concrete planes (blue × navy grey), the boxes band, the roof ring (navy underside, a paper fascia with lamp dots)
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),fas=new Path2D(),win=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
  add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.box[i],box);add(BOWL.roof[i],roof);add(BOWL.fascia[i],fas);
  const bq=BOWL.box[i],w=quadP(c,[lerp3(bq[0],bq[1],.2),lerp3(bq[0],bq[1],.8),lerp3(bq[3],bq[2],.8),lerp3(bq[3],bq[2],.2)].map((p,j)=>[p[0],j<2?16:18.3,p[2]] as V3));if(w)win.addPath(polyPath(w,true));}
 s.knockout(low);s.tone(B,low,.36);s.tone(K,low,.16);
 s.knockout(up);s.tone(B,up,.4);s.tone(K,up,.3);
 // the crowd: one mark per seat group, sized by distance; white shirts, sombreros and sun-hats (paper / yellow), orange, blue, a few navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.45?0:q.h<.62?1:q.h<.78?2:q.h<.9?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(Y,inks[1],.9);s.fill(O,inks[2],.85);s.fill(B,inks[3],.9);s.fill(K,inks[4],.8);
 // the upper tier sits in the roof's shade; the boxes band and the roof underside print dark
 s.tone(K,up,.2);
 s.knockout(box);s.fill(K,box,.82);s.knockout(win,.6);
 s.knockout(roof);s.tone(K,roof,.6);s.tone(B,roof,.45);
 s.knockout(fas);s.fill(K,fas,.35);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the dry concrete surround, grass (yellow × blue) with mowing stripes and worn patches, boards, paper lines, both goals (the right goal
 * drawn later when it is in front of the players, i.e. from the camera behind it) */
const PATCHES:[number,number,number,number][]=[[30,-12,6,3],[46,18,5,2.2],[61,4,4,2.5],[74,-20,7,3],[88,15,5,2],[97,-6,4,1.6],[20,22,5,2.4],[83,-2,3.5,1.8]];
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(O,p,.22);s.tone(K,p,.14);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // the 1986 Azteca pitch was bumpy and re-laid: a few sun-dried patches where the blue screen is knocked thin
 const pa=new Path2D();PATCHES.forEach(([x,z,rx,rz],i)=>{const pts:Pt[]=[];for(let k=0;k<14;k++){const a=k/14*TAU,w=1+.18*Math.sin(a*3+i);const q=pr(c,[x+Math.cos(a)*rx*w,0,z+Math.sin(a)*rz*w]);if(!q)return;pts.push(q);}pa.addPath(polyPath(pts,true));});s.knockout(pa,.15);
 // boards: far touchline and behind both goals, orange with paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(O,bd,.95);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??1.5);
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
const SKIN:InkFill[]=[[Y,.3],[O,.2]];
const SKIN_TAN:InkFill[]=[[Y,.38],[O,.32],[K,.08]];
const SKIN_D10:InkFill[]=[[Y,.42],[O,.38],[K,.14]];
/** Argentina v England 1986: the improvised dark-blue away shirt (blue, white V-neck trim, silver number = paper); dark shorts, blue socks inferred */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:K,socks:B,boots:K,trim:'paper',skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,seed:3,...o});
const D10_STYLE=ARG({skin:SKIN_D10,number:10,numberInk:'paper',hairStyle:'curly',build:{height:1.65,bulk:1.1,thighs:1.22,head:1.04},seed:10});
/** England: white shirts (paper), navy shorts; white socks and orange trim inferred */
const ENG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.85],socks:'paper',boots:K,trim:O,skin:SKIN,hair:K,hairStyle:'short',line:K,seed:5,...o});
/** Peter Shilton: the grey goalkeeper shirt (confirmed); shorts, socks and gloves inferred */
const SHILTON:AthleteStyle={shirt:[K,.38],shorts:[K,.7],socks:[K,.38],boots:K,skin:SKIN,hair:[K,.85],hairStyle:'short',line:K,gloves:[Y,.6],sleeves:'long',trim:B,build:{height:1.83},seed:51};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_TAN,hair:[K,.9],hairStyle:'short',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Maradona's first touch)
type Role='d10'|'eng'|'gk'|'arg'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a slide tackle (on the ground from `at`) */
type Move={kind:'lunge'|'dive'|'slide';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The England players named in the accounts get the beats the accounts give
 * them (Beardsley + Reid at the spin, Butcher, Fenwick, Shilton); where exactly each stood is inferred. */
const ACTORS:Actor[]=[
 {name:'Maradona',role:'d10',style:D10_STYLE,key:true,keys:[[-3,51.5,7.4],[-1.5,49.8,8.7],[-.3,48.4,9.6],[0,48.1,9.9],[.3,48,10.1],[.6,48.4,10.5],[1,49.6,11.3],[1.5,51.6,12.2],[2.2,54.8,13.1],[3,58.8,13.6],[3.8,62.8,13.6],[4.3,65.3,13.1],[4.6,66.9,13.8],[5,69.1,13.3],[5.6,72.3,12.1],[6.3,75.9,10.9],[7,79.5,9.8],[7.6,82.6,8.9],[8,84.6,8.4],[8.3,86.2,9.1],[8.7,88.3,8.2],[9.3,91.3,6.5],[9.8,93.9,5.2],[10.15,95.7,4.4],[10.45,97,4.7],[10.75,98.3,5.7],[11.05,99.5,5.4],[11.3,100.3,4.7],[11.7,101.4,4.4],[12.2,102.3,5.9],[13,102.5,9.4],[14,101.7,13.8],[15.5,100,19],[17,98,23],[19,96.5,26]]},
 {name:'Enrique',role:'arg',style:ARG({seed:21}),keys:[[-3,39.5,10.4],[-1.2,41.5,11.2],[0,42.6,11.5],[5,52,10],[19,72,6]]},
 {name:'Beardsley',role:'eng',style:ENG({seed:31,hair:[K,.9]}),key:true,engage:[-1.5,1.2],moves:[{kind:'lunge',at:.4,dur:.8,side:'l'}],keys:[[-3,55,5],[-1,51,7.2],[0,49.6,8.4],[.4,49.3,8.8],[1.2,49.8,9.4],[3,51,10],[19,62,8]]},
 {name:'Reid',role:'eng',style:ENG({seed:32,hairStyle:'balding'}),key:true,engage:[-1.5,2],keys:[[-3,54,13.5],[-1,50.8,12.6],[0,49.5,12],[.6,49.2,11.9],[1.2,49.9,12.1],[2,52,13],[3.5,56.5,14.5],[5,60.5,14.8],[8,67,13],[19,76,10]]},
 {name:'Butcher',role:'eng',style:ENG({seed:33,build:{height:1.93,bulk:1.08}}),key:true,engage:[3,5],moves:[{kind:'lunge',at:4.55,dur:.85,side:'r'},{kind:'slide',at:10.95,dur:1.1,side:'r'}],keys:[[-3,74,3],[1,71.5,7],[3,68.6,11],[4,67.3,12.3],[4.5,66.9,12.6],[5,67.3,12.3],[5.8,70,11.4],[7.5,78.5,9],[9.5,90,6.2],[10.5,96.2,5.1],[10.7,97.2,4.9],[19,97.3,4.9]]},
 {name:'Fenwick',role:'eng',style:ENG({seed:34,hairStyle:'curly'}),key:true,engage:[6.8,8.6],moves:[{kind:'lunge',at:8.2,dur:.85,side:'l'}],keys:[[-3,86,-1],[3,85,3],[6,85.5,6.5],[7.6,86.3,7.6],[8.1,86.7,7.7],[8.8,87.2,7.5],[10,90,6],[19,95,4]]},
 {name:'Shilton',role:'gk',style:SHILTON,key:true,moves:[{kind:'dive',at:10.4,dur:.8,side:'r'}],keys:[[-3,103.8,0],[7,103,1.5],[9,101,3],[9.8,98.8,3.9],[10.1,98.1,4.1],[19,98.1,4.1]]},
 {name:'Stevens',role:'eng',style:ENG({seed:35}),keys:[[-3,80,-10],[5,82,-9],[9,90,-6],[12,97,-4],[19,99,-3]]},
 {name:'Sansom',role:'eng',style:ENG({seed:36,hair:[K,.7]}),keys:[[-3,90,24],[9,99,20],[19,102,14]]},
 {name:'Hoddle',role:'eng',style:ENG({seed:37}),keys:[[-3,60,-4],[5,62,-2],[19,74,2]]},
 {name:'Steven',role:'eng',style:ENG({seed:38}),keys:[[-3,62,22],[6,66,20],[19,78,16]]},
 {name:'Hodge',role:'eng',style:ENG({seed:39}),keys:[[-3,66,-11],[5,70,-8],[19,84,-4]]},
 {name:'Lineker',role:'eng',style:ENG({seed:40}),keys:[[-3,44,-8],[6,50,-6],[19,62,-4]]},
 {name:'Valdano',role:'arg',style:ARG({seed:22,hairStyle:'long'}),keys:[[-3,63,-6],[3,72,-6],[7,84,-5],[10,94,-3],[11.6,98.3,-1.2],[13,101.6,1.5],[14.5,103.8,8.5],[16,103.4,15.5],[17.5,101.8,20.8],[19,100.3,24.5]]},
 {name:'Burruchaga',role:'arg',style:ARG({seed:23}),keys:[[-3,55,-14],[6,68,-12],[19,86,6]]},
 {name:'Olarticoechea',role:'arg',style:ARG({seed:24}),keys:[[-3,40,-20],[19,60,-10]]},
 {name:'Batista',role:'arg',style:ARG({seed:25,hairStyle:'balding'}),keys:[[-3,38,-2],[19,48,0]]},
 {name:'Giusti',role:'arg',style:ARG({seed:26}),keys:[[-3,44,24],[19,62,18]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3,60,0],[6,70,2],[12,88,-6],[19,92,-2]]},
];
const D10=0,ENRIQUE=1,BUTCHER=4,FENWICK=5,VALDANO=13;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3,T1=19,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: dragged round in the spin, then small left-foot touches, the finish
/** his dribble stride: one left-foot touch per cycle of CYC metres (the touch lands at the gait's touchPhase) */
const CYC=2.9,SPIN_END=.62,SHOT=11.3,IN_NET=SHOT+.34,PASS=-1;
/** the touches: every stride from the end of the spin, plus the cuts at Butcher and Fenwick and the step round Shilton (inferred) */
const TOUCHES:number[]=(()=>{const forced=[4.45,8.1,10.5],out:number[]=[SPIN_END];let prev=distOf(D10,SPIN_END)/CYC-touchPhase;
 for(let tau=SPIN_END+DT;tau<SHOT-.35;tau+=DT){const ph=distOf(D10,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.3&&forced.every(f=>Math.abs(f-tau)>.3))out.push(tau);prev=ph;}
 return[...out,...forced].sort((a,b)=>a-b).concat([SHOT]);})();
/** the spin: facing the pass (−X) he rolls the ball back under his left sole and turns to his left, out toward +X/+Z (direction inferred) */
const spinU=(tau:number)=>sm(-.05,SPIN_END,tau,easeInOutSine);
function yawD10(tau:number):number{const pass=posOf(ENRIQUE,PASS),m=posOf(D10,tau),face=yawOf(pass[0]-m[0],pass[1]-m[1]),v=velOf(D10,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):-.38;
 if(tau<SPIN_END+.3){const left=(((-.38-face)%TAU)+TAU)%TAU,spin=face+left*spinU(tau-.08);return lerpA(spin,head,sm(SPIN_END,SPIN_END+.3,tau));}
 return head;}
/** his forward and left directions on the ground (x, z) */
const fwdL=(tau:number):[Pt,Pt]=>{const y=yawD10(tau);return[[Math.cos(y),-Math.sin(y)],[-Math.sin(y),-Math.cos(y)]];};
/** ball spot for the left foot: ahead and a touch to his left */
const footAt=(tau:number):[number,number]=>{const p=posOf(D10,tau),[f,l]=fwdL(tau);return[p[0]+f[0]*.46+l[0]*.12,p[1]+f[1]*.46+l[1]*.12];};
const TP=TOUCHES.map(footAt);
const NET:V3=[105.35,.34,1.4],REST:V3=[106.3,.11,1.6];
function ballAt(tau:number):V3{
 if(tau<PASS){const x=posOf(ENRIQUE,tau);return[x[0]+.45,.11,x[1]];}
 if(tau<0){const x=posOf(ENRIQUE,PASS),u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.6),to=footAt(0);return[lerp(x[0]+.45,to[0],e),.11,lerp(x[1],to[1],e)];}
 if(tau<SPIN_END){// under his sole, swept round with the body as he turns (lags the hips a little)
  const p=posOf(D10,tau),[f,l]=fwdL(Math.max(0,tau-.06)),r=lerp(.46,.3,bump(0,SPIN_END,tau));return[p[0]+f[0]*r+l[0]*.12,.11,p[1]+f[1]*r+l[1]*.12];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.3*Math.sin(Math.PI*u*.8),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the spin: left sole on the ball, toes up, knees bent low, arms out wide for balance, chest over the ball */
const SPIN:Partial<Pose>={lHipF:30,lKnee:44,lAnk:-26,lHipR:14,rHipF:18,rKnee:56,rAnk:-4,lean:22,pitch:6,twist:18,lShA:72,rShA:64,lShF:10,rShF:-10,lElb:36,rElb:40,neckP:26,squash:-.05};
/** receiving the pass with his back to goal */
const RECEIVE:Partial<Pose>={lean:14,lHipF:24,lKnee:40,rHipF:-6,rKnee:34,lShA:44,rShA:38,lElb:40,rElb:40,neckP:30};
/** the cut: body dropped and tilted into the turn, the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:10*dir,bend:12*dir,lean:24,lKnee:58,rKnee:54,lShA:dir>0?30:74,rShA:dir>0?74:30,neckY:10*dir,squash:-.05});
/** Fenwick's desperate reach at the shirt (the accounts' "shirt pull") */
const GRAB:Partial<Pose>={rShF:82,rShA:24,rElb:10,rHand:.7,lShF:-30,lShA:30,twist:16,neckP:4};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(D10,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk'&&tau>4)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===D10)yaw=yawD10(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='eng'?READY:stand();
 if(k===D10){// small, quick dribbling strides the whole way (left foot), a touch more run in them at full speed
  const s=clamp((sp-2)/4.5),dr=dribble(distOf(D10,tau)/CYC,{foot:'l',speed:.45+.4*s});p=blendPose(idle,dr,clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='slide'?.42:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.06});
  if(mv.kind==='slide'&&u>0){p=slideTackle(Math.min(1,u),{foot:mv.side});yaw=0;}}
 if(k===FENWICK)p=over(p,GRAB,bump(8.05,8.75,tau));
 if(k===D10){
  if(tau<.3){p=over(p,RECEIVE,bump(-.9,.3,tau));}
  p=over(p,SPIN,bump(-.05,SPIN_END+.15,tau));
  p=over(p,CUT(1),bump(4.2,4.85,tau));p=over(p,CUT(1),bump(7.9,8.55,tau));p=over(p,CUT(1),bump(10.2,10.85,tau));
  const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.5}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+.9,tau));
 }
 if(k===VALDANO&&tau>IN_NET+.3)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.3,IN_NET+.8,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: the 1986 Adidas "Azteca" (paper, navy triad marks)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 // a panel star in the middle and five curved triad marks round it: reads as a football at a glance, Azteca-style when large
 const pan=new Path2D(),tri=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr],[cx+Math.cos(b)*pr*.45,cy+Math.sin(b)*pr*.45]);}return polyPath(q,true);};
 pan.addPath(tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;ring?:number}={}):PlayOut{
 const{minBall=6,hero=false,ring=0}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (short: the sun is almost overhead at noon); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 if(ring>0){const m=posOf(D10,tau),cx=(m[0]+b[0])/2,cz=(m[1]+b[2])/2,r=.45+Math.hypot(m[0]-b[0],m[1]-b[2])/2+.3*(1-ring),pts:Pt[]=[];
  for(let i=0;i<40;i++){const q=pr(c,[cx+Math.cos(i/40*TAU)*r*1.1,0,cz+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
  if(pts.length>30){const q=toCam(c,[cx,0,cz]),rr=ribbon(pts,Math.max(6,c.F*.1/q[2]),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===D10?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===D10||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===D10}:{});
  if(e.k===D10)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the fast pan): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replay and the lesson
/** touch ticks: a yellow spark at each touch as it happens, and the trail of touch spots left on the grass (fading) */
function touchMarks(s:Sheet,c:Cam,tau:number,w:number,span=2.6){if(w<=0)return;
 const dots=new Path2D();let any=false;
 TOUCHES.forEach((T,i)=>{const age=tau-T;if(age<0||age>span||T>=SHOT)return;const[x,z]=TP[i],q=toCam(c,[x,0,z]);if(q[2]<1)return;const g=scr(c,q),r=c.F*.13/q[2]*(1-.45*age/span);
  dots.addPath(polyPath(blob(g[0],g[1],r,r*.42,i+3,{amp:.08,n:12}),true));any=true;
  if(age<.28){const b=pr(c,[x,.12,z]);if(b)sparkBurst(s,Y,b[0],b[1],c.F*.45/q[2],{n:7,seed:i+9,g:easeOutBack(clamp(age/.1))*(1-clamp((age-.18)/.1)),width:Math.max(4,c.F*.035/q[2]),cov:.95*w});}});
 if(any){s.knockout(dots,.8*w);s.fill(Y,dots,.9*w);}
}
/** the cut: an orange arrow on the grass along his real path through the change of direction */
function cutArrow(s:Sheet,c:Cam,tc:number,w:number){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=14;i++){const tau=tc-.55+1.2*i/14,[x,z]=posOf(D10,tau),q=toCam(c,[x,0,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const n=Math.max(2,Math.round(pts.length*w)),seg=pts.slice(0,n),wd=c.F*.12/d;
 s.knockout(ribbon(seg,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(O,ribbon(seg,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,O,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** "stay low": a yellow arrow pressing down over his head */
function lowArrow(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const h=r.joints.head,n=r.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*1.5+8;
 const a:Pt=[h[0],h[1]-u*4.2],b:Pt=[h[0],h[1]-u*1.5];s.knockout(ribbon([a,b],u*.75,{seed:71,taper:.1}),.85*w);laneArrow(s,Y,a,b,u*.42,{progress:w,seed:71,head:u*1.3});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the run between them plays at ~0.8–1.5× real time; the pre-roll is Enrique on the ball) */
const tau1=(t:number)=>{const g=CUEW(0,'gets the ball'),G=CUEW(0,'goal');return key(t,[[0,Math.max(T0,-g-.2)],[g,0],[CUEW(0,'spins'),.55],[CUEW(0,'Past one'),4.95],[CUEW(0,'past another'),8.35],[CUEW(0,'into the box'),9.4],[G,IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-G]],linear);};
const CAM1:V3=[52.5,26,76];
function cam1(t:number):Cam{
 const g=CUEW(0,'gets the ball'),G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[54,4,-12],m=posOf(D10,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(0,g-.1,t,easeInOutSine),toD=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),lerp(open[1],2.5,toBall),lerp(open[2],lerp(bt[2],0,.2),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,[[0,1700],[g-.2,4700],[CUEW(0,'Past one'),5000],[CUEW(0,'into the box'),5600],[G,6000],[G+1.4,6600],[S,6900]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(D10,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: the spin + touches, a fast pan, Butcher
const whip2=(t:number)=>{const w=CUEW(1,'He stays low');return sm(w-.55,w+.1,t,easeInOutSine);};
const tau2=(t:number)=>{const w=CUEW(1,'He stays low');return key(t,[[0,-.75],[CUEW(1,'Tiny'),.1],[CUEW(1,'glued'),.55],[CUEW(1,'left foot'),1.05],[w-.55,1.5],[w+.1,3.55],[CUEW(1,'quick cuts'),4.4],[CUEW(1,'each defender'),4.95],[SECS(1),6.2]],linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(D10,tau),open=1-sm(0,1.4,t,easeInOutSine),push=sm(CUEW(1,'Tiny')-.3,CUEW(1,'glued'),t,easeInOutSine)*(1-sm(CUEW(1,'left foot')+.3,CUEW(1,'He stays')-.3,t)),back=sm(CUEW(1,'each')-.2,SECS(1),t,easeInOutSine);
 const C:V3=[m[0]-3.2-1.5*back+1.5*open,1.5+.3*open,m[1]+9.5+3*open-3*push+2*back],T:V3=[m[0]+1.2+1.4*back,.85-.2*push,m[1]-.2];
 return look(C,T,2750+650*push-250*back-350*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ti=CUEW(1,'Tiny'),gl=CUEW(1,'glued'),lf=CUEW(1,'left foot'),lo=CUEW(1,'He stays'),qc=CUEW(1,'quick cuts'),ed=CUEW(1,'each defender'),w=whip2(t);
  stadium(s,c,v,t);
  ground(s,c);
  touchMarks(s,c,tau,sm(ti-.2,ti+.2,t)*(1-sm(lo-.6,lo-.4,t))+sm(lo+.1,lo+.3,t)*(1-sm(SECS(1)-1,SECS(1)-.6,t)),2.2);
  cutArrow(s,c,4.55,sm(qc-.35,qc+.35,t,easeOut)*(1-sm(SECS(1)-1,SECS(1)-.6,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero,bg,br})=>{
   // "glued": a yellow thread from his left boot to the ball, tugging tight on each touch
   const gw=sm(gl-.15,gl+.3,t)*(1-sm(lo-.7,lo-.45,t));
   if(hero&&bg&&gw>0){const toe=hero.joints.lToe,mid:Pt=[(toe[0]+bg[0])/2,(toe[1]+bg[1])/2+br*.5*(1-gw)];s.knockout(ribbon([toe,mid,bg],br*.5,{seed:81,taper:0,wobble:.6}),.8*gw);s.fill(Y,ribbon([toe,mid,bg],br*.28,{seed:81,taper:0,wobble:.6}),.95*gw);}
   // "left foot": an orange ring round the left boot
   const lw=sm(lf-.15,lf+.25,t,easeOutBack)*(1-sm(lo-.7,lo-.45,t));
   if(hero&&lw>0){const toe=hero.joints.lToe,an=hero.joints.lAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.25*lw+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.8]);}
    s.fill(O,ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*lw);}
   lowArrow(s,hero,sm(lo+.05,lo+.45,t,easeOut)*(1-sm(qc-.2,qc+.1,t)));
   // "each defender": the lunge meets only air — a spark where Butcher's boot arrives too late
   const age=t-ed;if(age>-.3&&age<.5){const[bx,bz]=posOf(BUTCHER,4.6),q=pr(c,[bx+.6,.2,bz+.5]);if(q)sparkBurst(s,O,q[0],q[1],c.F*.5/toCam(c,[bx,.2,bz])[2],{n:8,seed:83,g:easeOutBack(clamp((age+.3)/.2))*(1-clamp((age-.25)/.25)),width:9});}}});
  // the replay wipe as the chapter opens; the fast pan down the pitch (the replay skips ahead to Butcher)
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,Math.sin(Math.PI*w),27,.04);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: round Shilton, the finish, then the celebration and the Azteca
const tau3=(t:number)=>{const g=CUEW(2,'the Goal');return key(t,[[0,9.2],[CUEW(2,'keeper'),10.3],[CUEW(2,'and scores'),SHOT+.08],[g,IN_NET+.55],[SECS(2),IN_NET+.55+(SECS(2)-g)*.8]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'and scores');return sm(a+.5,CUEW(2,'the Goal')+.9,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(D10,tau),e=sm(SHOT-.3,IN_NET+.2,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'the Goal')+.8,SECS(2),t,easeInOutSine);
 const C0:V3=[118.5,7,8.5-1.5*e],T0:V3=[lerp(m[0],101,e),lerp(.9,1,e),lerp(m[1]*.8,2,e)];
 const mm=smooth(D10,tau),C1:V3=[mm[0]-6.5-hold,2+.5*hold,mm[1]-9-1.2*hold],T1:V3=[mm[0]+.6,1.2+.8*hold,mm[1]+1.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(4000+300*sm(0,CUEW(2,'keeper'),t),3500-250*hold,u)*(1-.35*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),g=CUEW(2,'the Goal'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(g-.1,g+.3,t)*(1-sm(SECS(2)-1.2,SECS(2)-.6,t))});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:()=>{
   // "round the keeper": the orange arrow of his step round Shilton
   cutArrow(s,c,10.5,sm(CUEW(2,'He goes')+.3,CUEW(2,'keeper')+.3,t,easeOut)*(1-sm(CUEW(2,'and scores')-.2,CUEW(2,'and scores')+.2,t)));}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(D10,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the Fenwick beat
const tau4=(t:number)=>key(t,[[0,6.3],[CUEW(3,'keep'),6.7],[CUEW(3,'tiny'),7.05],[CUEW(3,'stay low'),7.45],[CUEW(3,'balanced'),7.75],[CUEW(3,'change'),8.05],[CUEW(3,'beat'),8.55],[SECS(3),9.5]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(D10,tau),push=sm(CUEW(3,'keep')-.3,CUEW(3,'keep')+.5,t,easeInOutSine),orbit=sm(CUEW(3,'change')-.4,CUEW(3,'change')+.6,t,easeInOutSine),back=sm(CUEW(3,'beat')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[m[0]+7.2+2*back,1.25+.6*orbit,m[1]+5.2+2.4*orbit+1.5*back],T:V3=[m[0]+.3,.85-.1*push,m[1]-.2];
 return look(C,T,2450+450*push-250*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),kb=CUEW(3,'keep'),ti=CUEW(3,'tiny'),lo=CUEW(3,'stay low'),ba=CUEW(3,'balanced'),ch=CUEW(3,'change'),bt=CUEW(3,'beat'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const m=posOf(D10,tau);
  touchMarks(s,c,tau,sm(ti-.2,ti+.2,t)*(1-sm(E-1.2,E-.8,t)),1.6);
  // "balanced": an orange base under his feet (wide, steady)
  const bal=sm(ba-.1,ba+.35,t,easeOutBack)*(1-sm(ch+.2,ch+.6,t));
  if(bal>0){const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[m[0]+Math.cos(i/36*TAU)*.7*bal,0,m[1]+Math.sin(i/36*TAU)*.55*bal]);if(q)pts.push(q);}if(pts.length>30){const rr=ribbon(pts,c.F*.06/toCam(c,[m[0],0,m[1]])[2],{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9);s.fill(O,rr,.95);}}
  cutArrow(s,c,8.2,sm(ch-.3,ch+.4,t,easeOut)*(1-sm(E-1,E-.6,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,ring:sm(kb-.1,kb+.35,t,easeOutBack)*(1-sm(lo-.2,lo+.2,t)),after:({hero})=>{
   lowArrow(s,hero,sm(lo-.05,lo+.35,t,easeOut)*(1-sm(ch-.3,ch,t)));
   // "beat defenders": Fenwick's grab closes on nothing, speed lines stream off Maradona
   const age=t-bt;if(age>-.2&&age<.6){const[fx,fz]=posOf(FENWICK,8.3),q=pr(c,[fx+.4,1.2,fz+.5]);if(q)sparkBurst(s,O,q[0],q[1],c.F*.45/toCam(c,[fx,1,fz])[2],{n:8,seed:91,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:9});}
   const rw=sm(bt-.1,bt+.4,t)*(1-sm(E-.9,E-.3,t));
   if(rw>0){const q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]+1,1,m[1]]);if(q&&q2){const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=c.F/toCam(c,[m[0],1,m[1]])[2];for(const k of[0,1])s.fill(K,ribbon([[q[0]-Math.cos(dir)*z*(.9+k*.3),q[1]-z*(.5-k*.6)],[q[0]-Math.cos(dir)*z*(1.9+k*.5),q[1]-z*(.5-k*.6)]],z*.05,{seed:9+k,taper:.9,wobble:.5}),.6*rw);}}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'maradona-1986',format:'11v11',title:"Maradona's Goal of the Century",theme:'Close control: tiny touches, low and balanced, change direction to beat defenders',
 ageNote:'World Cup quarter-final, Argentina v England, Estadio Azteca, Mexico City, 22 June 1986. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of dry Azteca turf — grass bits and dust thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and orange dust thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(O,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
