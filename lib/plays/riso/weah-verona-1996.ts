/** George Weah for AC Milan v Hellas Verona, Serie A matchday 1, San Siro (Stadio Giuseppe Meazza), Milan, 8 September 1996 (Milan won
 * 4–1): the 85th-minute "coast to coast" goal. Verona's corner is overhit, Weah controls it inside his own penalty area and runs the
 * whole length of the pitch to score. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts and
 * one match photograph (we cannot watch the footage), printed as a riso sheet.
 *
 * SOURCES (what the choreography and kit follow; pages cached under scratchpad/films/src-cache/):
 *  - The Guardian, Simon Burnton, "The Joy of Six: Goals from corners" (17 June 2011)
 *    https://www.theguardian.com/sport/blog/2011/jun/17/joy-of-six-goals-corner-kicks
 *  - Planet Football, Tom Victor, "A forensic analysis of George Weah's wonderful solo goal for AC Milan"
 *    https://www.planetfootball.com/nostalgia/forensic-analysis-george-weahs-solo-goal-verona-21-years/
 *  - Wikipedia (en) "George Weah" (cites FIFA 2013: "rifling the ball into the bottom left corner") and "1996–97 AC Milan season"
 *    (match box: 8 Sep 1996, Milan 4–1 Verona, Weah 85', San Siro, 54,128, referee Rodomonti; kit table)
 *  - Wikipedia (it) "George Weah" (controlled in his own area with the outside of the right foot, corner from the goalkeeper's left, 90
 *    metres, beat the keeper as he came out) and "Hellas Verona Football Club 1996-1997" (kits: Erreà / Ferroli; keeper Attilio Gregori)
 *  - Match photograph (Carlo Fumagalli / AP, 8 Sep 1996, it.wikipedia File:Serie A 1996-97 - Milan vs Verona - Gol di George Weah.jpg,
 *    caption: during the run, referee Rodomonti playing advantage): shows the kits worn that day.
 * CONFIRMED by those accounts: date, stadium, matchday 1, 85th minute, Milan led 2–1 and the goal made it 3–1 (final 4–1); a Verona
 * corner, overhit, fell to Weah a couple of yards inside Milan's own penalty area; he controlled the high ball deftly (outside of the right
 * foot) and set off; Milan had called every player back for the corner, so there was nobody ahead to pass to; he ran ~90 m, beat several
 * Verona players (three by one account, seven by another) — one Verona defender nearly won it with three men round him, the referee
 * played advantage; a team-mate only caught up once he had passed halfway (Boban: "When's he going to stop?"); he finished low into the
 * bottom-left corner past keeper Attilio Gregori, who came off his line; an exuberant celebration. KITS (the photo): Milan red-and-black
 * stripes (printed red + navy), white shorts with a red hem, white socks with a red band, Weah in red boots; Verona the yellow change
 * kit (yellow shirt with navy collar, yellow shorts, yellow socks with a navy band); the referee in a teal-green shirt (printed blue),
 * black shorts and socks.
 * INFERRED (illustrative): every position and timing between those beats; which way Milan attacked on screen and the side of the pitch;
 * the corner's flight; the line of the run (centre, then right of centre), where each Verona player stood and lunged, the jinks; the
 * number and spacing of touches; that he dribbled and shot with his RIGHT foot (the control is confirmed right-footed, the photo shows a
 * right-foot touch; the shooting foot is not stated — not narrated); Weah's number 9; the keepers' kits (Gregori dark, Rossi grey); the
 * celebration run; the other players' positions and who they are (none are named); San Siro's look (three tiers under the 1990 roof with
 * its red girders; the corner towers are left out), crowd colours, boards, sunshine, camera placements.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real time,
 * panning from the corner to the goal; 2 = slow-motion replay from a low touchline camera: the control, a pull-back to the crowded box
 * (every Milan player ringed), a view from behind Weah over the open grass (yellow wash), then a fast tracking pan with the chasers left
 * behind; 3 = replay from behind the goal: calm, the low finish past Gregori into the bottom corner, the celebration; 4 = the lesson from a
 * raised three-quarter camera behind the run (box → look up → space → break fast → all the way). All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts) routed through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the
 * recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {beats,shotAt,reframe,near,steady,type View as DView,type Keep,type Pin} from './director';
import {drawAthlete,motionSmear,runCycle,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:"San Siro, 1996. Verona's corner flies too long. George Weah controls it in his own box, and off he goes! Past one... past another... and another... goal!",seconds:13,
  cues:[[.2,'San Siro'],[1.6,"Verona's corner"],[2.6,'too long'],[3.5,'George Weah'],[4.3,'controls it'],[5.2,'his own box'],[6.2,'and off he goes'],[7.8,'Past one'],[9.1,'past another'],[10.3,'and another'],[11.7,'goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. Every Milan player was back for the corner. Weah sees open grass ahead, and runs faster than anyone can chase.',seconds:10.2,
  cues:[[.15,'Watch it again'],[1.8,'Every Milan player'],[3.2,'back for the corner'],[4.7,'Weah sees'],[5.4,'open grass'],[6.6,'and runs'],[7.4,'faster than anyone']]},
 {label:'The finish',text:'Ninety metres later, he stays calm and fires it low past the keeper, into the corner!',seconds:8.2,
  cues:[[.15,'Ninety metres'],[1.4,'stays calm'],[2.4,'fires it low'],[3.4,'past the keeper'],[4.4,'into the corner']]},
 {label:'Your turn',text:'Your turn: after you defend a corner, look up. Space ahead? Break fast. A quick counter-attack can go all the way!',seconds:9.4,
  cues:[[.15,'Your turn'],[1.2,'defend a corner'],[2.4,'look up'],[3.4,'Space ahead'],[4.4,'Break fast'],[5.6,'A quick counter-attack'],[7.2,'all the way']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py weah-verona-1996, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/weah-verona-1996/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-weah-verona-1996.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/weah-verona-1996/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('weah: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window (~1566 × 1080 units). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>{const z=cam(s,0,0,1);DV={w:s.W/z,h:s.H/z};return view(s,z);};
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1566,h:1080};

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Milan defend X = 0 and attack +X, Verona's goal line at 105), Y up,
 * Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. */
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
/** a closed ground ring (ellipse rx × rz round x,z) as a ribbon path, or null when off camera */
function groundRing(c:Cam,x:number,z:number,rx:number,rz:number,wm:number,seed:number):Path2D|null{const pts:Pt[]=[];
 for(let i=0;i<30;i++){const q=pr(c,[x+Math.cos(i/30*TAU)*rx,0,z+Math.sin(i/30*TAU)*rz]);if(q)pts.push(q);}
 if(pts.length<24)return null;const d=toCam(c,[x,0,z])[2];if(d<1)return null;return ribbon(pts,Math.max(3,c.F*wm/d),{close:true,seed,taper:0,wobble:1});}

// ---------------------------------------------------------------- San Siro: a tall, squared bowl (three rings) under the 1990 roof with its red girders
const CX=52.5,NS=64;
/** a point on the stands: angle th round the pitch centre, d metres out from the inner rim (a squared superellipse: San Siro is a box), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(59+d)*Math.sign(c)*Math.pow(Math.abs(c),.28),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.28)];}
const LOW=(b:number):[number,number]=>[2+15*b,1.6+10*b],MID=(b:number):[number,number]=>[16+12*b,12.5+10*b],UP=(b:number):[number,number]=>[26+16*b,25+17*b];
type Bowl={low:V3[][];mid:V3[][];up:V3[][];band:V3[][];roof:V3[][];girder:V3[][];seats:{P:V3;h:number;tier:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],mid:[],up:[],band:[],roof:[],girder:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.mid.push(Q(MID,0,1));o.up.push(Q(UP,0,1));
  // the balcony fronts between the rings (pale concrete)
  o.band.push([rim(a,16,11.6),rim(b,16,11.6),rim(b,16,12.9),rim(a,16,12.9)]);o.band.push([rim(a,26,23.8),rim(b,26,23.8),rim(b,26,25.3),rim(a,26,25.3)]);
  o.roof.push([rim(a,30,44),rim(b,30,44),rim(b,50,46),rim(a,50,46)]);
  // the red roof girders run along each side above the roof edge
  o.girder.push([rim(a,33,46),rim(b,33,46),rim(b,33,50.5),rim(a,33,50.5)]);
  for(const [f,rows,tier] of [[LOW,8,0],[MID,6,1],[UP,8,2]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<5;k++){const h=hash(i*977+r*31+k*7+tier*5000,11);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/5)/NS*TAU,d,y+.4),h,tier});}}
 return o;})();
/** everything behind the pitch: the September sky, the stands, the crowd (roar lifts the seat marks, flash = photographers) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const low=new Path2D(),mid=new Path2D(),up=new Path2D(),band=new Path2D(),roof=new Path2D(),gird=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 for(let i=0;i<NS;i++){add(BOWL.low[i],low);add(BOWL.mid[i],mid);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.girder[i],gird);}
 for(const q of BOWL.band)add(q,band);
 s.knockout(low);s.tone(K,low,.3);s.knockout(mid);s.tone(K,mid,.36);s.knockout(up);s.tone(B,up,.3);s.tone(K,up,.3);
 // the crowd: Milan red and black, white shirts, a few yellow Verona fans, blue
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.62/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.4?0:q.h<.62?1:q.h<.82?2:q.h<.9?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.9);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.9);s.fill(B,inks[4],.9);
 s.knockout(band,.8);s.tone(K,band,.12);
 s.knockout(roof);s.tone(K,roof,.62);s.tone(B,roof,.35);
 s.knockout(gird);s.fill(R,gird,.95);s.tone(K,gird,.15);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the surround, grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (the Verona goal drawn later when it is in
 * front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(R,p,.2);s.tone(K,p,.2);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // boards: far touchline and behind both goals, paper with red panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.2,-36.95],[x+3.6,.2,-36.95],[x+3.6,.7,-36.95],[x,.7,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.2,z],[108.45,.2,z+3.6],[108.45,.7,z+3.6],[108.45,.7,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd,.9);s.fill(R,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 // corner arcs (the corner the move starts from, and the rest)
 for(const [x,z,a0] of [[0,-34,0],[0,34,-Math.PI/2],[105,-34,Math.PI/2],[105,34,Math.PI]] as [number,number,number][])circ(x,z,1,a0,a0+Math.PI/2,5);
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-2.8);
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
const SKIN_L:InkFill[]=[[Y,.3],[R,.2]];
const SKIN_M:InkFill[]=[[Y,.4],[R,.3],[K,.1]];
const SKIN_D:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** AC Milan 1996–97 home (the photo): red-and-black stripes (red + navy), white shorts with a red hem, white socks with a red band */
const ACM=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:K,shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',seed:3,...o});
/** George Weah: number 9 (inferred), cropped hair, red boots (the photo), tall and lean */
const WEAH_STYLE=ACM({skin:SKIN_D,hair:K,hairStyle:'short',boots:R,number:9,numberInk:'paper',build:{height:1.86,bulk:.96,thighs:1.1},seed:9});
/** Hellas Verona 1996–97 yellow change kit (the photo): yellow shirt with a navy collar, yellow shorts, yellow socks with a navy band */
const HV=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:Y,socks:Y,trim:K,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',seed:5,...o});
/** Attilio Gregori: keeper kit inferred (dark), Sebastiano Rossi: inferred (grey) */
const GREGORI:AthleteStyle={shirt:[K,.8],shorts:[K,.9],socks:[K,.8],boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,gloves:[Y,.6],sleeves:'long',trim:Y,build:{height:1.84},seed:51};
const ROSSI:AthleteStyle={shirt:[K,.4],shorts:[K,.7],socks:[K,.4],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'long',line:K,gloves:[Y,.6],sleeves:'long',trim:R,build:{height:1.9},seed:52};
/** referee Pasquale Rodomonti: the teal-green shirt printed blue, black shorts and socks (the photo) */
const REF:AthleteStyle={shirt:[B,.8],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Weah's first touch)
type Role='weah'|'acm'|'hv'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a corner kick (contact at `at`) */
type Move={kind:'lunge'|'dive'|'kick';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Every Milan player back in the box at the corner (confirmed); the individual
 * spots, the Verona men who close him down, and the lines they run are inferred. */
const KICK=-3.05;
const ACTORS:Actor[]=[
 {name:'Weah',role:'weah',style:WEAH_STYLE,key:true,keys:[[-3.6,12.2,5.2],[-1.6,13.1,5.9],[-.4,14,6.4],[0,14.2,6.5],[.35,14.6,6.5],[1,16.4,6.3],[2,21.2,5.8],[3,27.4,5],[4,34,4.3],[4.6,38,4.7],[5.2,42,4.3],[6,47.4,3],[7,53.4,2],[8,58.6,2.1],[8.8,62.4,2.9],
  [9.4,65,3.4],[10,67.8,3.6],[10.8,71.6,3.6],[11.6,75.6,3.8],[12.4,79.6,4.8],[13,82.6,5.2],[13.6,85.8,4.4],[14.4,89.6,3.4],[15.1,92.8,2.7],[15.8,95.1,2.3],[16.3,96.4,2.8],[17.2,98.4,7],[18.6,99.8,13],[20.5,100.4,20]]},
 // Milan, all back for the corner, then trailing upfield; one team-mate sprints up in support and catches him only past halfway
 {name:'Rossi',role:'gk',style:ROSSI,keys:[[-3.6,1.2,-1.2],[0,1.4,-.6],[3,4,0],[20.5,12,0]]},
 {name:'support',role:'acm',style:ACM({seed:21,hair:[K,.7]}),keys:[[-3.6,9,-2],[0,10,-1],[1.5,13,-2],[4,24,-4],[7,42,-6],[10,58,-6],[13,74,-4],[16,88,-2],[20.5,98,4]]},
 {name:'acm2',role:'acm',style:ACM({seed:22}),keys:[[-3.6,5.5,3],[0,6,3.4],[3,12,4],[20.5,52,4]]},
 {name:'acm3',role:'acm',style:ACM({seed:23,hairStyle:'balding'}),keys:[[-3.6,6.5,-4.5],[0,7,-4],[3,12,-4],[20.5,50,-6]]},
 {name:'acm4',role:'acm',style:ACM({seed:24,hair:[K,.6]}),keys:[[-3.6,3.2,-6.5],[0,3.4,-6],[3,8,-6],[20.5,44,-10]]},
 {name:'acm5',role:'acm',style:ACM({seed:25}),keys:[[-3.6,11.5,-7],[0,11,-6],[3,17,-5],[20.5,60,-8]]},
 {name:'acm6',role:'acm',style:ACM({seed:26,hairStyle:'long'}),keys:[[-3.6,4.5,1],[0,5,.6],[3,10,1],[20.5,46,2]]},
 {name:'acm7',role:'acm',style:ACM({seed:27}),keys:[[-3.6,15,-.5],[0,15.5,0],[3,22,1],[20.5,64,0]]},
 {name:'acm8',role:'acm',style:ACM({seed:28,hair:[K,.95]}),keys:[[-3.6,8.5,9],[0,9,8.5],[3,15,8],[20.5,56,10]]},
 {name:'acm9',role:'acm',style:ACM({seed:29}),keys:[[-3.6,1.5,3.6],[0,1.6,3.6],[3,6,3],[20.5,40,4]]},
 {name:'acm10',role:'acm',style:ACM({seed:30,hairStyle:'curly'}),keys:[[-3.6,13,-11],[0,13,-10],[3,20,-9],[20.5,58,-12]]},
 // Verona: the corner taker and five men in the box (then chasing, too late); four back who try to stop him
 {name:'taker',role:'hv',style:HV({seed:31}),moves:[{kind:'kick',at:KICK,dur:1.1,side:'r'}],keys:[[-5,-1.6,-34.8],[-3.6,-.9,-34.2],[KICK,.35,-33.5],[-1.5,1.8,-32],[2,8,-26],[20.5,60,-14]]},
 {name:'hv2',role:'hv',style:HV({seed:32,hairStyle:'curly'}),keys:[[-3.6,6.5,-1.5],[0,8,.5],[1.5,12,2.5],[6,36,3],[12,66,3],[20.5,93,1]]},
 {name:'hv3',role:'hv',style:HV({seed:33}),keys:[[-3.6,4,-3],[0,5.5,-2],[1.5,9,-1],[6,32,0],[12,60,1],[20.5,88,-2]]},
 {name:'hv4',role:'hv',style:HV({seed:34,hair:[K,.6]}),keys:[[-3.6,10,4],[0,11.6,6],[1.2,14.5,7.4],[3,22,7.5],[6,38,6.5],[12,68,6],[20.5,94,6]]},
 {name:'hv5',role:'hv',style:HV({seed:35,hairStyle:'long'}),keys:[[-3.6,7.5,6.5],[0,8.5,7.2],[1.5,12,7],[6,33,6],[12,62,6],[20.5,86,8]]},
 {name:'hv6',role:'hv',style:HV({seed:36}),keys:[[-3.6,17.5,2],[0,17.2,3],[1,18,4.6],[3,24,4.8],[6,40,4.5],[12,66,4.5],[20.5,90,4]]},
 {name:'past one',role:'hv',style:HV({seed:37,hairStyle:'balding'}),key:true,engage:[3.4,5.6],moves:[{kind:'lunge',at:4.75,dur:.8,side:'l'}],keys:[[-3.6,45,-5],[0,44,-3],[3,40.6,.6],[4.3,40,2.4],[4.9,40.5,3],[5.6,42.4,3.2],[7,47,3],[20.5,74,2]]},
 {name:'past another',role:'hv',style:HV({seed:38}),key:true,engage:[7.8,10],moves:[{kind:'lunge',at:9.3,dur:.85,side:'r'}],keys:[[-3.6,60,-9],[0,60,-7],[5,61.5,-2],[8,63.6,1.4],[9,64.4,2],[9.6,64.8,2.3],[10.4,66.6,2.4],[20.5,88,1]]},
 {name:'third man',role:'hv',style:HV({seed:39,hair:[K,.95]}),key:true,engage:[8,10],keys:[[-3.6,62,13],[0,62,11],[5,63,8],[8,64.4,6.4],[9.2,65.6,5.6],[10,67,5.6],[12,74,5.4],[20.5,90,6]]},
 {name:'and another',role:'hv',style:HV({seed:40}),key:true,engage:[11.6,13.6],moves:[{kind:'lunge',at:12.95,dur:.85,side:'l'}],keys:[[-3.6,76,-1],[0,75,0],[8,76,1.5],[11.6,80.4,2.6],[12.6,82.2,3.2],[13.2,82.8,3.3],[14,84.5,3],[20.5,96,2]]},
 {name:'Gregori',role:'gk',style:GREGORI,key:true,moves:[{kind:'dive',at:16.25,dur:.8,side:'r'}],keys:[[-3.6,103.8,0],[8,103.5,.8],[13,102.8,1.6],[14.6,101.2,2.2],[15.5,99.6,2.4],[15.8,99.3,2.4],[20.5,99.3,2.4]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3.6,22,16],[0,23,17],[5,40,19],[9.4,58,15],[14,78,12],[20.5,90,11]]},
];
const W9=0,GREG=23;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3.6,T1=20.5,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the corner, the control, long right-foot pushes at pace, the finish
/** his stride: one gait cycle per CYC metres; a right-foot push lands where the right foot reaches forward (gait phase PUSH) */
const CYC=4.1,PUSH=.9,SHOT=15.85,IN_NET=SHOT+.42;
/** open-grass stretches where he knocks it further (every second stride) */
const OPEN=(tau:number)=>(tau>1.4&&tau<3.9)||(tau>5.6&&tau<8.2)||(tau>10.2&&tau<12);
const TOUCHES:number[]=(()=>{const forced=[0,.55,4.55,9.55,13.1],out:number[]=[];let prev=distOf(W9,.9)/CYC-PUSH,skip=false;
 for(let tau=.9;tau<SHOT-.5;tau+=DT){const ph=distOf(W9,tau)/CYC-PUSH;if(Math.floor(ph)>Math.floor(prev)){const open=OPEN(tau);if(!(open&&skip)&&forced.every(f=>Math.abs(f-tau)>.33))out.push(tau);skip=open&&!skip;}prev=ph;}
 return[...out,...forced].sort((a,b)=>a-b).concat([SHOT]);})();
const CORNER:V3=[.35,.11,-33.4],NET:V3=[105.4,.26,-2.9],REST:V3=[106.5,.11,-2.7];
/** heading of Weah (yaw): watching the high ball before the control, then along his run */
function yawW(tau:number):number{const v=velOf(W9,tau),head=Math.hypot(v[0],v[1])>.6?yawOf(v[0],v[1]):0,[x,z]=posOf(W9,tau);
 if(tau<.2){const face=yawOf(CORNER[0]-x,CORNER[2]-z);return lerpA(face,head,sm(-.5,.2,tau));}
 return head;}
const fwdR=(tau:number):[Pt,Pt]=>{const y=yawW(tau);return[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];};
/** ball spot for the right foot: ahead and a touch to his right */
const footAt=(tau:number):[number,number]=>{const p=posOf(W9,tau),[f,r]=fwdR(tau);return[p[0]+f[0]*.55+r[0]*.14,p[1]+f[1]*.55+r[1]*.14];};
const TP=TOUCHES.map(footAt);
function ballAt(tau:number):V3{
 if(tau<KICK)return CORNER;
 if(tau<0){// the overhit corner: a high hanging ball over the box, dropping onto his right foot at knee height
  const u=(tau-KICK)/-KICK,to=TP[0];return[lerp(CORNER[0],to[0],u),lerp(.11,.5,u)+15*u*(1-u),lerp(CORNER[2],to[1],u)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);
  const y=k===0?lerp(.5,.11,clamp(u*2.5))+.12*Math.max(0,Math.sin(Math.PI*clamp(u*2.5-1,0,1))):.11;return[lerp(TP[k][0],TP[k+1][0],e),y,lerp(TP[k][1],TP[k+1][1],e)];}
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
/** watching the corner come over: head back, arms up for balance and position */
const WATCH:Partial<Pose>={neckP:-34,lean:2,lShA:34,rShA:30,lElb:50,rElb:50,lKnee:26,rKnee:26};
/** the control: right leg lifted and turned in, the OUTSIDE of the right boot cushions the dropping ball; arms wide, eyes on the ball */
const CONTROL:Partial<Pose>={rHipF:36,rHipA:-14,rHipR:-34,rKnee:62,rAnk:14,lHipF:10,lKnee:26,lAnk:-4,lean:10,bend:-8,roll:-4,lShA:70,rShA:54,lShF:12,rShF:-14,lElb:30,rElb:36,neckP:34,twist:-10,squash:-.03};
/** the jink: body dropped and tilted into the change of direction, the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:9*dir,bend:10*dir,lean:20,lKnee:52,rKnee:50,lShA:dir>0?30:70,rShA:dir>0?70:30,neckY:8*dir,squash:-.04});
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(W9,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===W9)yaw=yawW(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='hv'?READY:stand();
 if(k===W9){// long, fast strides; the right foot pushes the ball on (PUSH phase)
  const s=clamp((sp-2)/4.5);p=blendPose(over(idle,WATCH,1-sm(-.9,-.2,tau)),runCycle(distOf(W9,tau)/CYC,{speed:.35+.6*s}),clamp((sp-.4)/1.2));}
 else if(sp>.5&&along<-.35*sp){const bp=runCycle(distOf(k,tau)/2.4,{speed:.2});p=blendPose(idle,bp,clamp((sp-.5)/.8));}
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/3.6,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='kick'){const u=(tau-(mv.at-STRIKE_CONTACT*mv.dur))/mv.dur;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.85}),Math.min(sm(0,.1,u),1-sm(1,1.4,u)));if(tau<mv.at+.2)yaw=yawOf(10,26);continue;}
  const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.08});}
 if(k===W9){
  p=over(p,CONTROL,bump(-.45,.4,tau));
  p=over(p,CUT(-1),bump(4.2,5.1,tau));p=over(p,CUT(1),bump(9.1,10,tau));p=over(p,CUT(1),bump(12.6,13.5,tau));
  const D=.85,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+.9,tau));
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print (paper, navy panel marks)
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
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (September afternoon sun); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.05,e.g[1],e.h*.15,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg&&inView(v,bg,br))ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===W9?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===W9||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===W9}:{});
  if(e.k===W9)heroR=r;}
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
/** Milan's crowded penalty area at the corner: a red screen over the box and a yellow ring under every Milan player in it */
function boxMarks(s:Sheet,c:Cam,tau:number,wBox:number,wRings:number){
 if(wBox>0){const q=polyP(c,[[0,.01,-20.16],[16.5,.01,-20.16],[16.5,.01,20.16],[0,.01,20.16]]);if(q.length>2){const p=polyPath(q,true);s.tone(R,p,.42*wBox);}}
 if(wRings>0){const p=new Path2D();let any=false;ACTORS.forEach((a,k)=>{if(a.role!=='acm'&&a.role!=='weah'&&!(a.role==='gk'&&k!==GREG))return;const[x,z]=posOf(k,tau);if(x>18)return;const r=groundRing(c,x,z,.75*wRings,.6*wRings,.09,k+70);if(r){p.addPath(r);any=true;}});
  if(any){s.knockout(p,.85);s.fill(Y,p,.95);}}
}
/** the open grass ahead of him: a yellow wash on the empty half beyond the box */
function openGrass(s:Sheet,c:Cam,w:number){if(w<=0)return;const x1=lerp(22,64,easeOut(clamp(w)));
 const q=polyP(c,[[22,.01,-26],[x1,.01,-30],[x1,.01,30],[22,.01,26]]);if(q.length<3)return;const p=polyPath(q,true);s.knockout(p,.35*w);s.tone(Y,p,.6*w);}
/** his run as a red lane on the grass, from τa to τb (progress w) */
function runLane(s:Sheet,c:Cam,ta:number,tb:number,w:number,width=.55){if(w<=0)return;
 const pts:Pt[]=[];let d=1;const n=40;for(let i=0;i<=n;i++){const tau=lerp(ta,lerp(ta,tb,clamp(w)),i/n),[x,z]=posOf(W9,tau),q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(5,c.F*width/d);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.1,wobble:.8}),.8);s.fill(R,ribbon(pts,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** "look up": a yellow sight line from his eyes up the pitch */
function sightLine(s:Sheet,c:Cam,r:DrawResult|undefined,tau:number,w:number){if(!r||w<=0)return;const[x,z]=posOf(W9,tau),q=pr(c,[x+24,1.7,z-2]);if(!q)return;
 const h=r.joints.head,n=r.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])+4;s.knockout(ribbon([h,q],u*.7,{seed:71,taper:.1}),.7*w);laneArrow(s,Y,h,q,u*.4,{progress:w,seed:71,head:u*1.4,dashed:true});}
/** speed lines streaming off him (he is faster than the chasers) */
function speedLines(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(W9,tau),q=pr(c,[x,1,z]),q2=pr(c,[x+1,1,z]);if(!q||!q2)return;
 const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),Z=c.F/toCam(c,[x,1,z])[2],p=new Path2D();
 for(let k=0;k<3;k++){const oy=(k-1)*Z*.45,ox=Z*(.7+k*.2);p.addPath(ribbon([[q[0]-Math.cos(dir)*ox,q[1]+oy],[q[0]-Math.cos(dir)*(ox+Z*(1.1+.3*k)),q[1]+oy]],Z*.05,{seed:9+k,taper:.9,wobble:.5}));}
 s.fill(K,p,.6*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>key(t,[[0,T0+.1],[CUEW(0,"Verona's"),KICK],[CUEW(0,'too long'),-1.7],[CUEW(0,'controls'),0],[CUEW(0,'his own box'),.7],[CUEW(0,'and off'),2],[CUEW(0,'Past one'),5.1],[CUEW(0,'past another'),9.8],[CUEW(0,'and another'),13.3],[CUEW(0,'goal'),IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-CUEW(0,'goal')]],linear);
const CAM1:V3=[52.5,27,78];
/** Director beats (lib/plays/riso/director.ts, Oct 4 2026): a short establishing wide of San Siro, then pulled out on the corner (the taker,
 * the ball's long flight and the box), push in low as Weah controls it, pull back to follow him with the open grass ahead of him, a little
 * closer through the three dribbles (each Verona man stays in frame as he is beaten), push in low for the finish (Gregori and the goal kept
 * in frame), and hold on the celebration. The subject glides from the taker to Weah along the ball's flight (no hard switch). */
const B1=beats([[0,'wide'],[1.1,{from:'space',size:.24}],[CUEW(0,'controls')-.5,'tight'],[CUEW(0,'and off')-.15,'follow'],
 [CUEW(0,'Past one')-.4,{from:'follow',size:.46,low:.5}],[CUEW(0,'and another')+.2,{from:'tight',az:35}],[CUEW(0,'goal')+.3,{from:'reaction',az:30}]]);
const TAKER=ACTORS.findIndex(a=>a.name==='taker'),FOES=ACTORS.map((a,k)=>a.role==='hv'||a.role==='gk'?k:-1).filter(k=>k>=0&&k!==TAKER);
/** the directed camera, averaged over ±.45 s (director steady(): the fit clamp's answer changes as players move; averaging makes every
 * change a smooth move, never a snap), then rebuilt once */
function cam1(t:number):Cam{const r=steady(t,cam1Pin,.45,5);return look(r.eye,r.target,r.F);}
function cam1Pin(t:number):Pin{const c=cam1Authored(t),tau=tau1(t),sh=shotAt(t,B1);
 const w=easeInOutSine(clamp((tau-KICK)/1.8)),tk=posOf(TAKER,tau),m=posOf(W9,tau),hero:V3=[lerp(tk[0],m[0],w),0,lerp(tk[1],m[1],w)];
 const fin=sm(13.6,15.2,tau)*(1-sm(IN_NET+.6,IN_NET+1.4,tau)),keep:Keep[]=[...near(hero,FOES.map(k=>{const p=posOf(k,tau);return[p[0],0,p[1]] as V3;}),3,6),...(fin>.01?[{P:NET,w:fin}]:[])];
 return reframe({eye:c.C,target:c.T,F:c.F},{hero,ball:ballAt(tau),keep},sh,DV);}
function cam1Authored(t:number):Cam&{T:V3}{
 const G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]*.75];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the corner: framed on the box (the ball is high above it); then the camera follows the ball
 const box:V3=[9,1,-7],m=posOf(W9,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(CUEW(0,'too long')-.2,CUEW(0,'controls')+.3,t,easeInOutSine),toD=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=lerp3(box,[bt[0],1.5,bt[2]],toBall),T=lerp3(tb,cel,toD);
 const F=key(t,[[0,2500],[CUEW(0,'controls'),3300],[CUEW(0,'and off'),3600],[CUEW(0,'Past one'),4000],[CUEW(0,'and another'),4600],[G,5000],[G+1.4,6200],[S,6500]],easeInOutSine);
 return{...look(CAM1,T,F),T};
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(W9,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: the control, the crowded box, the open grass, the chase
const whip2=(t:number)=>{const w=CUEW(1,'and runs');return sm(w-.5,w+.15,t,easeInOutSine);};
const tau2=(t:number)=>{const w=CUEW(1,'and runs');return key(t,[[0,-1.25],[CUEW(1,'Every'),.28],[CUEW(1,'back for'),.6],[CUEW(1,'Weah sees'),1],[CUEW(1,'open grass'),1.5],[w-.5,1.95],[w+.15,5.6],[CUEW(1,'faster'),6.4],[SECS(1),8.4]],linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(W9,tau),w=whip2(t),ev=CUEW(1,'Every'),ws=CUEW(1,'Weah sees');
 const pull=sm(ev-.4,ev+.7,t,easeInOutSine)*(1-sm(ws-.7,ws+.2,t,easeInOutSine)),behind=sm(ws-.7,ws+.2,t,easeInOutSine);
 // close on the control (low, near side) → pulled back to show the crowded box → behind him, over the open grass → tracking alongside
 // side-on to the control (he faces the corner flag), so the ball dropping onto the outside of his right boot is in profile
 let C:V3=[m[0]+7.4,1.5,m[1]-1.2],T:V3=[m[0]-.2,.85,m[1]+.2];let F=2700;
 C=lerp3(C,[31,9,27],pull);T=lerp3(T,[8,.5,-1.5],pull);F=lerp(F,2250,pull);
 // (Oct 4 2026: aim a little lower so his boots stay inside the window — they were cut off at the bottom edge)
 C=lerp3(C,[m[0]-7.5,2.6,m[1]+3.5],behind);T=lerp3(T,[m[0]+14,-1.6,m[1]-1.5],behind);F=lerp(F,2150,behind);
 C=lerp3(C,[m[0]-3,1.9,m[1]+12.5],w);T=lerp3(T,[m[0]+2.5,.9,m[1]],w);F=lerp(F,2450,w);
 return look(C,T,F);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ev=CUEW(1,'Every'),bf=CUEW(1,'back for'),ws=CUEW(1,'Weah sees'),og=CUEW(1,'open grass'),ru=CUEW(1,'and runs'),fa=CUEW(1,'faster'),w=whip2(t),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const out=1-sm(ru-.6,ru-.3,t);
  boxMarks(s,c,tau,sm(ev-.2,ev+.4,t)*out,sm(bf-.2,bf+.35,t,easeOutBack)*out);
  openGrass(s,c,sm(og-.25,og+.6,t)*out);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // the control: a yellow spark on the outside of his right boot as the ball drops onto it
   const age=t-(CUEW(1,'Every')-.35);if(hero&&age>-.2&&age<.5){const f=hero.joints.rToe;sparkBurst(s,Y,f[0],f[1],c.F*.4/Math.max(1,toCam(c,[posOf(W9,0)[0],.3,posOf(W9,0)[1]])[2]),{n:8,seed:81,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.3)/.2)),width:9});}
   // "faster than anyone can chase": speed lines stream off him, the chasers fall behind
   speedLines(s,c,tau,sm(fa-.3,fa+.3,t)*(1-sm(E-.9,E-.4,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,Math.sin(Math.PI*w),27,.04);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: calm, the low finish, the celebration
const tau3=(t:number)=>{const g=CUEW(2,'into the corner');return key(t,[[0,13.7],[CUEW(2,'stays calm'),15.05],[CUEW(2,'fires'),SHOT+.02],[CUEW(2,'past the keeper'),SHOT+.22],[g,IN_NET+.2],[SECS(2),IN_NET+.2+(SECS(2)-g)*.85]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'into the corner');return sm(a+.3,a+1.5,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(W9,tau),e=sm(SHOT-.3,IN_NET+.2,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'into the corner')+1.2,SECS(2),t,easeInOutSine);
 const C0:V3=[117.5,6,5.5-3*e],T0:V3=[lerp(m[0],101,e),lerp(.9,1,e),lerp(m[1]*.8,-1,e)];
 const C1:V3=[m[0]-7-hold,2+.5*hold,m[1]-8-1.2*hold],T1:V3=[m[0]+.6,1.2+.6*hold,m[1]+1.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3900+300*sm(0,CUEW(2,'stays'),t),3400-250*hold,u)*(1-.3*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),sc=CUEW(2,'stays calm'),pk=CUEW(2,'past the keeper'),ic=CUEW(2,'into the corner'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(ic-.1,ic+.3,t)*(1-sm(SECS(2)-1.2,SECS(2)-.6,t))});
  ground(s,c,{goalLater:u<.5});
  // "stays calm": a yellow balance ring round him as he steadies before the shot
  const cw=sm(sc-.1,sc+.35,t,easeOutBack)*(1-sm(pk-.4,pk,t));
  if(cw>0){const[x,z]=posOf(W9,tau),r=groundRing(c,x,z,.9*cw,.7*cw,.07,7);if(r){s.knockout(r,.9);s.fill(Y,r,.95);}}
  // "into the corner": a yellow target in the bottom-left corner of the net
  const tw=sm(pk-.3,pk+.2,t,easeOutBack)*(1-sm(ic+.6,ic+1.2,t));
  if(tw>0){const q=pr(c,[105.1,.35,-2.95]);if(q){const r=c.F*.42/Math.max(1,toCam(c,[105,0,-3])[2])*tw,pts:Pt[]=[];for(let i=0;i<26;i++)pts.push([q[0]+Math.cos(i/26*TAU)*r,q[1]+Math.sin(i/26*TAU)*r]);const rr=ribbon(pts,Math.max(3,r*.22),{close:true,seed:88,taper:0,wobble:.8});s.knockout(rr,.8);s.fill(Y,rr,.95);}}
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({bg})=>{
   // "past the keeper": the ball's low line past Gregori's late dive
   const lw=sm(pk-.25,pk+.25,t,easeOut)*(1-sm(ic+.5,ic+1,t));
   if(lw>0){const a=TP[TP.length-1],pa=pr(c,[a[0],.12,a[1]]),pb=pr(c,[NET[0],.2,NET[2]]);if(pa&&pb){const wd=c.F*.08/Math.max(1,toCam(c,[100,0,0])[2]);laneArrow(s,R,pa,pb,Math.max(4,wd),{progress:lw,seed:89,head:Math.max(10,wd*3),dashed:true});}}
   if(bg&&tau>SHOT&&tau<SHOT+.12)sparkBurst(s,Y,bg[0],bg[1],60,{n:7,seed:90,width:8});}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(W9,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised three-quarter camera behind the counter-attack
const tau4=(t:number)=>key(t,[[0,-3.3],[CUEW(3,'defend'),-2.5],[CUEW(3,'look up'),.2],[CUEW(3,'Space'),.9],[CUEW(3,'Break'),1.8],[CUEW(3,'A quick'),5.2],[CUEW(3,'all the way'),12.2],[SECS(3),IN_NET+.3]],linear);
/** Director beats (lesson): a lesson framing on Weah for "Your turn", eased out over Milan's crowded box (every ringed Milan player kept), closer on
 * Weah as he looks up (the sight line's end kept), pulled out over the open grass ("Space ahead?"), following his break with the lane
 * ahead of him, and pulled out again so the run reaches the goal ("all the way"). */
const B4=beats([[0,'lesson'],[CUEW(3,'defend')-.3,{from:'lesson',size:.3}],[CUEW(3,'look up')-.3,{from:'lesson',size:.42}],[CUEW(3,'Space')-.3,'space'],
 [CUEW(3,'Break')-.3,'follow'],[CUEW(3,'all the way')-.4,{from:'space',size:.26}]]);
const RINGED=ACTORS.map((a,k)=>a.role==='acm'||a.role==='weah'||(a.role==='gk'&&k!==GREG)?k:-1).filter(k=>k>=0);
function cam4(t:number):Cam{const r=steady(t,cam4Pin,.45,5);return look(r.eye,r.target,r.F);}
function cam4Pin(t:number):Pin{const c=cam4Authored(t),tau=tau4(t),[x,z]=posOf(W9,tau),sh=shotAt(t,B4),dc=CUEW(3,'defend'),lu=CUEW(3,'look up'),sa=CUEW(3,'Space'),bf=CUEW(3,'Break'),aw=CUEW(3,'all the way');
 // every keep fades in and out over .6 s (eased) round its cue: nothing appears or vanishes within a frame
 const R=(a:number,b:number)=>sm(a-.6,a,t,easeInOutSine)*(1-sm(b-.5,b+.1,t,easeInOutSine));
 const wBox=R(dc,lu),wSee=R(lu+.3,sa),wSpace=R(sa+.2,bf),wGoal=sm(aw-.8,aw,t,easeInOutSine);
 const keep:Keep[]=[...(wBox>.01?RINGED.flatMap(k=>{const p=posOf(k,Math.min(tau,0));const w=.9*wBox*(1-sm(16,20,p[0]));return w>.01?[{P:[p[0],0,p[1]] as V3,w}]:[];}):[]),...(wSee>.01?[{P:[x+24,1.7,z-2] as V3,w:.7*wSee}]:[]),
  ...(wSpace>.01?[{P:[46,0,-8] as V3,w:.6*wSpace},{P:[46,0,8] as V3,w:.6*wSpace}]:[]),{P:[x+12,0,z] as V3,w:.8*sm(bf-.8,bf,t,easeInOutSine)*(1-wGoal)},...(wGoal>.01?[{P:[105,1.2,-1] as V3,w:wGoal}]:[]),
  // the ball joins the frame as it drops to him (before that it is out at the corner flag, not the lesson's subject)
  {P:ballAt(tau),w:sm(-1.4,-.3,tau)}];
 return reframe({eye:c.C,target:c.T,F:c.F},{hero:[x,0,z],ball:null,keep},sh,DV);}
function cam4Authored(t:number):Cam&{T:V3}{
 const tau=tau4(t),m=smooth(W9,Math.max(0,tau)),push=sm(CUEW(3,'look up')-.4,CUEW(3,'look up')+.4,t,easeInOutSine)*(1-sm(CUEW(3,'Space')-.2,CUEW(3,'Space')+.5,t,easeInOutSine));
 const pre=1-sm(CUEW(3,'defend')+.6,CUEW(3,'look up'),t,easeInOutSine);
 const C:V3=[m[0]-19+6*push-4*pre,13-5*push+3*pre,m[1]+21-7*push],T:V3=[m[0]+13-7*push-11*pre,.2,m[1]-3-3*pre];
 return{...look(C,T,1900+500*push),T};
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),dc=CUEW(3,'defend'),lu=CUEW(3,'look up'),sa=CUEW(3,'Space'),bf=CUEW(3,'Break'),qc=CUEW(3,'A quick'),aw=CUEW(3,'all the way'),E=SECS(3);
  stadium(s,c,v,t,{roar:sm(aw+.2,aw+.8,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  boxMarks(s,c,Math.min(tau,0),sm(dc-.2,dc+.3,t)*(1-sm(bf-.3,bf+.2,t)),sm(dc,dc+.4,t,easeOutBack)*(1-sm(lu+.2,lu+.6,t)));
  openGrass(s,c,sm(sa-.25,sa+.5,t)*(1-sm(qc-.2,qc+.4,t)));
  // "Break fast" … "all the way": his run drawn as a red lane growing up the pitch, ahead of him
  runLane(s,c,0,SHOT,sm(bf-.2,aw+.5,t,easeInOutSine)*(1-sm(E-.8,E-.4,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   sightLine(s,c,hero,tau,sm(lu-.1,lu+.45,t,easeOut)*(1-sm(bf-.2,bf+.2,t)));
   speedLines(s,c,tau,sm(qc-.2,qc+.3,t)*(1-sm(aw-.2,aw+.2,t)));
   const age=t-aw;if(age>-.1&&age<.7){const q=pr(c,[105,1.2,-1]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.2/Math.max(1,toCam(c,[105,1,0])[2]),{n:9,seed:95,g:easeOutBack(clamp((age+.1)/.25))*(1-clamp((age-.45)/.25)),width:9});}}});
 },
 still:4.2,
};

const film:RisoStory={
 id:'weah-verona-1996',format:'11v11',title:"Weah's Coast-to-Coast Goal",theme:'After defending a corner, look up: if there is space ahead, break fast — a quick counter-attack can go all the way',
 ageNote:'Serie A, AC Milan v Hellas Verona, San Siro, Milan, 8 September 1996. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of turf — grass bits and dust thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and red dust thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
