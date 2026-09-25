/** Steven Gerrard v West Ham, FA Cup final, Millennium Stadium, Cardiff, 13 May 2006 (Liverpool 3–3 West Ham after extra time,
 * Liverpool won 3–1 on penalties): the stoppage-time equaliser, "The Gerrard Final". An iconic-play riso film (RisoStory, chapters mode):
 * a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched Sept 2026):
 *  - Wikipedia, "2006 FA Cup final" (raw article: match summary, line-ups + shirt numbers, kit templates, shoot-out)
 *    https://en.wikipedia.org/wiki/2006_FA_Cup_final
 *  - BBC Sport, "Liverpool 3-3 West Ham (aet)", 13 May 2006  https://news.bbc.co.uk/sport1/hi/football/fa_cup/4756045.stm
 *  - The Guardian, Rob Smyth, "Liverpool v West Ham – live!" (minute by minute), 13 May 2006
 *    https://www.theguardian.com/football/2006/may/13/minutebyminute.sport
 *  - BBC Sport, "FA Cup final: The greatest goal from the last 50 years voted by you" (27 May 2015, incl. Shaka Hislop's recollection)
 *    https://www.bbc.co.uk/sport/football/32628391
 *  - FourFourTwo, "Gerrard: 2006 display against West Ham probably my best ever" (1 Nov 2017)
 *    https://www.fourfourtwo.com/features/gerrard-2006-display-against-west-ham-probably-my-best-ever-just-dont-call-it-gerrard-final
 * CONFIRMED by those accounts: 13 May 2006, Millennium Stadium, Cardiff (Wembley was being rebuilt); West Ham led 3–2 (Konchesky 64')
 * entering injury time; four minutes of added time were being announced; Riise played the ball into the West Ham area, it was HEADED
 * clear ("a header clear", BBC 2015) "but only as far as Gerrard", about 35 yards out ("fully 35 yards", BBC; "35, maybe 40 yards",
 * Guardian); Gerrard was hobbling with cramp; he hit it FIRST TIME, a HALF-VOLLEY (Hislop: "He absolutely smashed this half-volley"), on
 * a LOW trajectory past Shaka Hislop's RIGHT into the BOTTOM / FAR corner ("homing in on the side netting in the far corner", Guardian);
 * Hislop: "there were a lot of players between him and me"; 3–3, minute 90+1; no more goals in extra time; Liverpool won the shoot-out 3–1
 * (Reina saved from Zamora, Konchesky and Ferdinand; Gerrard scored his). KIT: Liverpool in red (red shirts, shorts and socks), Gerrard
 * captain, number 8, playing on the RIGHT of midfield; West Ham in their change strip of WHITE (Guardian: "West Ham in their change strip
 * of white"; Wikipedia's kit template: white shirt, shorts and socks with dark lower sleeves). Hislop wore 34. Right foot: the Guardian
 * MBM ("unless Gerrard's right foot intervenes again", 96') and the brief; Gerrard was right-footed.
 * INFERRED (illustrative): which end Liverpool attacked and so the direction of play on screen (drawn left → right from the main stand);
 * every position between those beats — Riise's spot on the left, the flight of his ball, WHO headed it clear (drawn: a West Ham centre-back,
 * Gabbidon, challenged by Morientes), the loop of the clearance, the bounce just before the strike, Gerrard's exact spot (drawn ~34 yards,
 * right of centre), his approach steps and the limp (which leg had cramp is not known), the shot's height (drawn peaking ~1 m) and a small
 * swerve; Hislop's late dive; the positions of the other 20 players and the referee; the celebration run; the colour of Hislop's kit
 * (drawn yellow with navy shorts — not confirmed), the navy trim, boots, the white numbers; the match ball (drawn a plain white ball with
 * navy panels); the Millennium Stadium's look (a steep rectangular bowl of red seats, roof open under a sunny sky — the day was hot and many
 * players had cramp — the four corner masts), the crowd colours and flags, the boards, the camera placements.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera in near
 * real time, panning with the ball (Riise's long ball, the header, the drop, the strike, the net, then back to Gerrard); 2 = the slow-motion
 * replay from a low touchline camera on Gerrard's right (tired legs, head down, body over the ball, the strike through the middle);
 * 3 = the replay from behind the goal (the ball flying low past Hislop into the far corner) swinging round to the celebration and the
 * Liverpool end; 4 = the lesson from a low front three-quarter camera on the strike (body over the ball, through the middle, the low path).
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Scenes read only (t, c); every
 * action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,speedLines,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,strike,header,keeperSet,keeperDive,celebrate,stand,posed,blendPose,solve,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Cardiff, 2006, the FA Cup final. Liverpool are losing three-two in added time, and Steven Gerrard waits, thirty-five yards out. The ball is headed clear... it drops... first time... goal! Three-three!',seconds:14.2,
  cues:[[.2,'Cardiff'],[1.9,'the FA Cup final'],[3.3,'Liverpool are losing'],[5,'added time'],[6.3,'Steven Gerrard'],[7.8,'yards out'],[9.4,'headed clear'],[10.7,'drops'],[11.8,'first time'],[12.9,'goal']]},
 {label:'Watch it again',text:'Watch again, slowly. Tired legs, but head down, body leaning over the ball, and he strikes right through the middle.',seconds:8.6,
  cues:[[.15,'Watch again'],[1.6,'Tired legs'],[2.8,'head down'],[3.8,'body leaning'],[5.6,'strikes'],[6.5,'through the middle']]},
 {label:'Bottom corner',text:'Low and hard, past keeper Shaka Hislop, into the bottom corner! Liverpool win the cup on penalties.',seconds:7.6,
  cues:[[.15,'Low and hard'],[1.4,'keeper Shaka Hislop'],[3,'bottom corner'],[4.1,'Liverpool win'],[5.7,'penalties']]},
 {label:'Your turn',text:'Your turn: body over the ball, strike through the middle, and your long shot stays low and powerful.',seconds:7.4,
  cues:[[.15,'Your turn'],[1,'body over the ball'],[2.4,'strike through'],[4,'long shot'],[4.9,'low and powerful']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py gerrard-cup-2006, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/gerrard-cup-2006/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-gerrard-cup-2006.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/gerrard-cup-2006/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('gerrard: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Liverpool attack +X, West Ham's goal line at 105), Y up, Z across
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

// ---------------------------------------------------------------- the Millennium Stadium: a steep rectangular bowl, red seats, open roof, corner masts
const CX=52.5,NS=64;
/** a point on the bowl: angle th around the pitch centre, d metres out from the inner rim (a squarish superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.32),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.32)];}
const LOW=(b:number):[number,number]=>[2+22*b,1.4+11*b],UP=(b:number):[number,number]=>[27+24*b,17+18*b];
type Bowl={low:V3[][];box:V3[][];up:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number;end:number}[];masts:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],box:[],up:[],roof:[],fascia:[],seats:[],masts:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.box.push([rim(a,24.5,12.4),rim(b,24.5,12.4),rim(b,27,17),rim(a,27,17)]);
  o.roof.push([rim(a,14,44.5),rim(b,14,44.5),rim(b,56,41),rim(a,56,41)]);
  o.fascia.push([rim(a,14,42.6),rim(b,14,42.6),rim(b,14,44.6),rim(a,14,44.6)]);
  for(const [f,rows,up] of [[LOW,8,false],[UP,8,true]] as [(u:number)=>[number,number],number,boolean][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+(up?5000:0),13);if(h<.14)continue;
   const[d,y]=f((r+.5)/rows),P=rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4);o.seats.push({P,h,end:P[0]<CX-40?-1:P[0]>CX+40?1:0});}}
 for(const th of [Math.PI*.22,Math.PI*.78,Math.PI*1.22,Math.PI*1.78])o.masts.push([rim(th,58,40),rim(th,50,92)]);
 return o;})();
/** everything behind the pitch: a sunny Cardiff sky over the open roof, the bowl, the crowd (roar lifts the marks, flash = cameras) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const haze=new Path2D();haze.rect(-1e4,-v.hy*.4,2e4,1e4);s.tone(Y,haze,.1);
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),fas=new Path2D(),mast=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
  add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.box[i],box);add(BOWL.roof[i],roof);add(BOWL.fascia[i],fas);}
 for(const [a,b] of BOWL.masts){if(toCam(c,a)[2]>30&&toCam(c,b)[2]>30)seg3(c,a,b,1.6,mast);}
 // the masts first (behind the roof), paper white with a navy key line
 s.knockout(mast);s.stroke(K,mast,2,.8);
 // red seat banks under the crowd (the bowl is famous for its red seats)
 s.knockout(low);s.fill(R,low,.55);s.tone(K,low,.14);
 s.knockout(up);s.fill(R,up,.5);s.tone(K,up,.26);
 // the crowd: Liverpool red at the −X end and along the sides, West Ham claret (red × navy) and sky blue at the +X end, white shirts everywhere
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.end>0?(q.h<.4?0:q.h<.62?3:q.h<.85?4:1):(q.h<.36?0:q.h<.8?1:q.h<.9?2:4);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(Y,inks[2],.9);s.fill(B,inks[3],.85);s.fill(K,inks[4],.8);
 s.knockout(box);s.fill(K,box,.82);
 s.knockout(roof);s.tone(K,roof,.55);s.tone(B,roof,.35);
 s.knockout(fas);s.fill(K,fas,.4);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the surround, grass (yellow × blue) with mowing stripes, navy boards with paper panels, paper lines, both goals (the West Ham goal is
 * drawn later when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(R,p,.2);s.tone(K,p,.16);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
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
 goal3(s,c,0,-1,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around the ball's corner (far post, low) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-NET[2])/1.6,2)));
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
const SKIN1:InkFill[]=[[Y,.32],[R,.18]],SKIN2:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN3:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Liverpool 2005-06: all red (confirmed); white trim and numbers inferred */
const LIV=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,trim:'paper',skin:SKIN1,hair:K,hairStyle:'short',line:K,number:n,numberInk:'paper',seed:n??70,...o});
/** Steven Gerrard, captain, number 8 (confirmed); 1.83 m, short brown hair */
const GERRARD_BUILD={height:1.83,bulk:1.02};
const GERRARD_STYLE=LIV(8,{hair:[K,.72],build:GERRARD_BUILD,seed:8});
/** West Ham's change strip of white (confirmed); the dark (navy) trim of the lower sleeves drawn as trim, navy numbers inferred */
const WHU=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:[K,.9],skin:SKIN1,hair:K,hairStyle:'short',line:K,number:n,numberInk:K,seed:40+(n??9),...o});
/** Shaka Hislop, 34 (confirmed); the keeper kit colour that day is not confirmed: drawn yellow with navy shorts */
const HISLOP:AthleteStyle={shirt:Y,shorts:[K,.85],socks:Y,boots:K,skin:SKIN3,hair:K,hairStyle:'bald',line:K,gloves:[K,.6],trim:[K,.8],number:34,numberInk:K,sleeves:'long',build:{height:1.93,bulk:1.05},seed:34};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN1,hair:[K,.9],hairStyle:'balding',line:K,trim:[Y,.8],seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the strike geometry (τ = seconds after Gerrard's contact)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** the far-post bottom corner, Hislop's right (confirmed: low, bottom/far corner, past his right) */
const NET:V3=[105.3,.36,-3.05],REST:V3=[106.2,.11,-2.85];
/** the ball at contact: ~34 yards out, right of centre (inferred spot) — CX0/CZ0 on the ground */
const CX0=75.4,CZ0=7.7;
const YAW_S=yawOf(NET[0]-CX0,NET[2]-CZ0);
const FWD:Pt=[Math.cos(YAW_S),-Math.sin(YAW_S)];
/** "body over the ball": head down, chest over the ball, standing knee bent — laid over the library strike at contact */
const BODY_OVER:Partial<Pose>={lean:30,pitch:10,neckP:26,lKnee:42,lHipF:26};
const GD=1.0,G_ST=-STRIKE_CONTACT*GD;
/** Gerrard's strike pose at τ (right foot, full power), independent of where he stands */
function gStrike(tau:number):Pose{const u=(tau-G_ST)/GD;return over(strike(clamp(u),{foot:'r',power:1}),BODY_OVER,bump(-.34,.24,tau));}
/** where his laces meet the ball at contact, relative to his pelvis */
const LACE=(()=>{const sk=solve(gStrike(0),GERRARD_BUILD,{x:0,z:0,yaw:YAW_S}),p=lerp3(sk.rAn,sk.rToe,.62);return p;})();
const C_BALL:V3=[CX0,clamp(LACE[1]+.02,.14,.34),CZ0];
const P0:Pt=[CX0-LACE[0],CZ0-LACE[2]];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'liv'|'whu'|'gk'|'ref';
/** a keyed move at `at` (contact / full stretch), lasting dur: a header, a kick (strike), a keeper dive; yaw held through it */
type Move={kind:'header'|'kick'|'dive';at:number;dur:number;side?:'l'|'r';yaw:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
const T_RIISE=-4.7,T_HEAD=-2.3,T_BOUNCE=-.13,IN_NET=1.12;
const RIISE_AT:Pt=[55.6,-20.6],HEAD_AT:V3=[94.2,2.5,-2.1];
const G=(dx:number,dz:number)=>[P0[0]+dx,P0[1]+dz];
const ACTORS:Actor[]=[
 {name:'Gerrard',role:'hero',style:GERRARD_STYLE,key:true,keys:[[-10,...G(-5.8,4.3)],[-5,...G(-4,2.9)],[T_HEAD,...G(-2.9,1.9)],[-.9,...G(-FWD[0]*1.9,-FWD[1]*1.9)],[-.45,...G(-FWD[0]*1.02,-FWD[1]*1.02)],[0,...P0],[.45,...G(FWD[0]*.8,FWD[1]*.8)],[1.25,...G(FWD[0]*1.5,FWD[1]*1.5+.5)],[2.2,...G(2,3.6)],[3.5,...G(2.6,8)],[5.5,...G(3,13.5)],[8,...G(3.4,18.5)]]},
 {name:'Riise',role:'liv',style:LIV(6,{hair:[Y,.7],seed:6}),key:true,moves:[{kind:'kick',at:T_RIISE,dur:1,side:'l',yaw:yawOf(38.6,18.5)}],keys:[[-10,49,-23.5],[-7,52.4,-22],[T_RIISE-.5,RIISE_AT[0]-.9,RIISE_AT[1]-.35],[T_RIISE,RIISE_AT[0]-.35,RIISE_AT[1]-.12],[T_RIISE+.6,RIISE_AT[0]+.5,RIISE_AT[1]+.1],[T_RIISE+3,RIISE_AT[0]+3,RIISE_AT[1]+1],[8,RIISE_AT[0]+9,RIISE_AT[1]+3]]},
 {name:'Gabbidon (inferred)',role:'whu',style:WHU(4,{seed:44}),key:true,moves:[{kind:'header',at:T_HEAD,dur:1,yaw:yawOf(-1,.35)}],keys:[[-10,95.5,-5],[-5,95,-3.4],[T_HEAD-.8,HEAD_AT[0]+.3,HEAD_AT[2]-.2],[T_HEAD,HEAD_AT[0]+.12,HEAD_AT[2]],[T_HEAD+1,HEAD_AT[0]-.6,HEAD_AT[2]+.3],[0,89.5,.5],[8,88,1]]},
 {name:'Morientes',role:'liv',style:LIV(19,{seed:19}),key:true,moves:[{kind:'header',at:T_HEAD+.08,dur:1,yaw:yawOf(-1,-.5)}],keys:[[-10,96,-8],[-5,95.6,-5],[T_HEAD,HEAD_AT[0]+.55,HEAD_AT[2]-.75],[T_HEAD+1.2,94.4,-2.3],[1.5,94,-1],[8,92,-1]]},
 {name:'Ferdinand',role:'whu',style:WHU(5,{skin:SKIN3,seed:45}),keys:[[-10,97,1],[T_HEAD,96.4,1.6],[0,90.5,4.2],[8,89,4]]},
 {name:'Scaloni',role:'whu',style:WHU(2,{hairStyle:'long',seed:42}),keys:[[-10,95,-12],[T_HEAD,94.5,-10],[0,90,-7.5],[8,89,-7]]},
 {name:'Konchesky',role:'whu',style:WHU(3,{seed:43}),keys:[[-10,95,12],[T_HEAD,94,11],[0,89,9.5],[8,88,9]]},
 {name:'Reo-Coker',role:'whu',style:WHU(20,{skin:SKIN3,seed:60}),key:true,keys:[[-10,85,3],[T_HEAD,86,2.5],[-.5,81.2,4.4],[0,80.4,4.9],[1,80,5],[8,80,5]]},
 {name:'Benayoun',role:'whu',style:WHU(15,{seed:55}),keys:[[-10,82,-8],[T_HEAD,84,-6],[0,81.5,-3.2],[8,81,-3]]},
 {name:'Dailly',role:'whu',style:WHU(7,{seed:47}),keys:[[-10,90,6],[T_HEAD,91,5],[0,86,6],[8,85,6]]},
 {name:'Sheringham',role:'whu',style:WHU(8,{hairStyle:'balding',seed:48}),keys:[[-10,80,12],[T_HEAD,82,11],[0,79,10.8],[8,79,11]]},
 {name:'Zamora',role:'whu',style:WHU(25,{skin:SKIN2,seed:65}),keys:[[-10,68,-6],[0,70,-4],[8,71,-4]]},
 {name:'Harewood',role:'whu',style:WHU(10,{skin:SKIN3,seed:50}),keys:[[-10,64,3],[0,66,2],[8,67,2]]},
 {name:'Cisse',role:'liv',style:LIV(9,{skin:SKIN3,hair:[Y,.8],seed:9}),keys:[[-10,97,6],[T_HEAD,97.5,4.2],[0,95,4],[8,94,4]]},
 {name:'Hyypia',role:'liv',style:LIV(4,{hair:[Y,.6],build:{height:1.93},seed:4}),keys:[[-10,98,-4],[T_HEAD,97.8,-5.2],[0,96,-4],[8,95,-4]]},
 {name:'Carragher',role:'liv',style:LIV(23,{seed:23}),keys:[[-10,86,-12],[T_HEAD,88,-10],[0,87,-9],[8,86,-9]]},
 {name:'Kromkamp',role:'liv',style:LIV(2,{seed:2}),keys:[[-10,80,22],[T_HEAD,84,19],[0,86,17],[8,86,17]]},
 {name:'Sissoko',role:'liv',style:LIV(22,{skin:SKIN3,seed:22}),keys:[[-10,65,-2],[0,70,-1],[8,72,0]]},
 {name:'Hamann',role:'liv',style:LIV(16,{seed:16}),keys:[[-10,60,6],[0,63,5],[8,65,5]]},
 {name:'Finnan',role:'liv',style:LIV(3,{seed:3}),keys:[[-10,58,18],[0,64,17],[8,66,16]]},
 {name:'Hislop',role:'gk',style:HISLOP,key:true,moves:[{kind:'dive',at:.98,dur:.95,side:'r',yaw:Math.PI+.08}],keys:[[-10,103.4,-1],[T_HEAD,103.9,-.8],[0,103.3,.2],[.4,103.3,.1],[8,103.3,.1]]},
 {name:'referee',role:'ref',style:REF,keys:[[-10,74,-8],[0,80,-10],[8,81,-9]]},
];
const HERO=0,RIISE=1,HISLOP_K=ACTORS.findIndex(a=>a.role==='gk');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Riise's long ball, the header, the bounce, the half-volley, the net
const BOUNCE:V3=[CX0+FWD[0]*.75+.15,.11,CZ0+FWD[1]*.75-.25];
const LAUNCH:V3=(()=>{const[x,z]=RIISE_AT;return[x+.35,.11,z+.2];})();
/** a ballistic loop from a to b over T seconds (x/z linear, y with gravity) */
function loopBall(a:V3,b:V3,u:number,T:number):V3{const g=9.8,vy=(b[1]-a[1]+.5*g*T*T)/T,tt=u*T;return[lerp(a[0],b[0],u),a[1]+vy*tt-.5*g*tt*tt,lerp(a[2],b[2],u)];}
function ballAt(tau:number):V3{
 if(tau<T_RIISE){const[x,z]=posOf(RIISE,tau),v=velOf(RIISE,tau),sp=Math.hypot(v[0],v[1])||1;return[x+v[0]/sp*.55,.11,z+v[1]/sp*.55];}
 if(tau<T_HEAD)return loopBall(LAUNCH,HEAD_AT,(tau-T_RIISE)/(T_HEAD-T_RIISE),T_HEAD-T_RIISE);
 if(tau<T_BOUNCE)return loopBall(HEAD_AT,BOUNCE,(tau-T_HEAD)/(T_BOUNCE-T_HEAD),T_BOUNCE-T_HEAD);
 if(tau<0){const u=(tau-T_BOUNCE)/-T_BOUNCE;return[lerp(BOUNCE[0],C_BALL[0],u),lerp(BOUNCE[1],C_BALL[1],Math.sin(u*Math.PI/2)),lerp(BOUNCE[2],C_BALL[2],u)];}
 if(tau<IN_NET){const u=tau/IN_NET,e=u*(1.1-.1*u);// fast and low, a touch of swerve (inferred), peaking about a metre up
  return[lerp(C_BALL[0],NET[0],e),lerp(C_BALL[1],NET[1],e)+.72*Math.sin(Math.PI*e),lerp(C_BALL[2],NET[2],e)+.55*Math.sin(Math.PI*e)];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e)+.2*Math.sin(Math.PI*u)*(1-u),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** hands on heads (West Ham, after the goal) and arms up (Liverpool) */
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='whu'?READY:stand();
 if(k===HERO){// hobbling with cramp before the strike: short jog strides, a lurch onto the sore side (which leg is not known)
  const ph=distOf(k,tau)/1.9;p=blendPose(idle,runCycle(ph,{speed:tau<-.9?.05:.55,stride:tau<-.9?.7:1}),clamp((sp-.3)/.8));
  p=over(p,{bend:7*Math.sin(TAU*ph),lean:14,neckP:tau<-.9?-26:10},clamp(1-sm(-1.2,-.6,tau))*clamp((sp-.2)/.6));
  // watching the high ball come down
  if(tau<-.6)p=over(p,{neckP:-30},bump(-3,-.4,tau));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='dive'){const t0=mv.at-.55*mv.dur,u=(tau-t0)/mv.dur;if(u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:.05});yaw=mv.yaw;}continue;}
  const c=mv.kind==='header'?.52:STRIKE_CONTACT,t0=mv.at-c*mv.dur,u=(tau-t0)/mv.dur;
  if(u>0&&u<1.4){const w=Math.min(sm(0,.12,u),1-sm(1,1.4,u));p=blendPose(p,mv.kind==='header'?header(Math.min(1,u)):strike(Math.min(1,u),{foot:mv.side,power:.9}),w);yaw=lerpA(yaw,mv.yaw,w);}}
 if(k===HERO){
  const u=(tau-G_ST)/GD,w=Math.min(sm(-.08,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,gStrike(tau),w);yaw=lerpA(yaw,YAW_S,sm(-.3,.05,u));}
  if(tau>IN_NET+.35)p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(IN_NET+.35,IN_NET+.9,tau));
 }
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='liv')p=over(p,JOY,w);if(a.role==='whu')p=over(p,DESPAIR,w*.9);}
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
 // small ground shadows batched in one op (a sunny afternoon: short, dark); big figures cast their own through the athlete
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
/** the shot's path: a ribbon along the ball's real flight from contact to τ (w = strength); low = the ground trace under it */
function shotPath(s:Sheet,c:Cam,tau:number,w:number,o:{ink?:string;ground?:boolean;from?:number}={}){if(w<=0||tau<=0)return;
 const{ink=R,ground=false,from=0}=o,pts:Pt[]=[];let d=1;const t1=Math.min(tau,IN_NET);
 for(let i=0;i<=24;i++){const tt=lerp(from,t1,i/24),b=ballAt(tt),q=toCam(c,ground?[b[0],.02,b[2]]:b);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const wd=Math.max(4,c.F*(ground?.06:.09)/Math.max(d,9));
 s.knockout(ribbon(pts,wd*1.8,{seed:61,taper:.3,wobble:.8}),.8*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.3,wobble:.8}),.95*w);}
/** "head down / body over the ball": a yellow plumb line dropped straight down from his head to the grass — the ball sits under it */
function plumb(s:Sheet,c:Cam,r:DrawResult|undefined,w:number){if(!r||w<=0)return;
 const H=r.sk.head,a=pr(c,[H[0],H[1]+.12,H[2]]),b=pr(c,[H[0],0,H[2]]);if(!a||!b)return;const u=c.F*.05/toCam(c,H)[2],e:Pt=[a[0]+(b[0]-a[0])*w,a[1]+(b[1]-a[1])*w];
 s.knockout(ribbon([a,e],u*1.6,{seed:71,taper:0,wobble:.5}),.8*w);s.fill(Y,ribbon([a,e],u*.8,{seed:71,taper:0,wobble:.5,gaps:[[.22,.3],[.52,.6]]}),.95*w);
 if(w>.9){const g=new Path2D();g.addPath(polyPath(blob(b[0],b[1],u*3,u*1.1,3,{amp:.05,n:14}),true));s.fill(Y,g,.9*(w-.9)*10);}}
/** a yellow arrow pressing down over his head */
function downArrow(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const h=r.joints.head,n=r.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*1.5+8;
 const a:Pt=[h[0]-u*.4,h[1]-u*4],b:Pt=[h[0]+u*.2,h[1]-u*1.4];s.knockout(ribbon([a,b],u*.75,{seed:72,taper:.1}),.85*w);laneArrow(s,Y,a,b,u*.42,{progress:w,seed:72,head:u*1.3});}
/** "through the middle": a red target ring round the ball with a dot at its centre, and an arrow straight through it */
function target(s:Sheet,bg:Pt|null,br:number,w:number,dir=0){if(!bg||w<=0)return;const r=br*(1.6+.5*(1-w)),pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([bg[0]+Math.cos(a)*r,bg[1]+Math.sin(a)*r]);}
 s.fill(R,ribbon(pts,Math.max(3,br*.22),{seed:81,close:true,taper:0,wobble:.8}),.95*w);
 const dot=new Path2D();dot.arc(bg[0],bg[1],Math.max(2.5,br*.24),0,TAU);s.fill(R,dot,.95*w);
 const L=br*3.4,a:Pt=[bg[0]-Math.cos(dir)*L,bg[1]-Math.sin(dir)*L],b:Pt=[bg[0]+Math.cos(dir)*L,bg[1]+Math.sin(dir)*L];laneArrow(s,R,a,b,Math.max(3,br*.2),{progress:w,seed:82,head:br*.8,cov:.95});}
/** tired legs: small navy zigzag strain marks round a calf */
function strain(s:Sheet,r:DrawResult|undefined,w:number,t:number){if(!r||w<=0)return;const k=r.joints.lKn,a=r.joints.lAn,m:Pt=[(k[0]+a[0])/2,(k[1]+a[1])/2],L=Math.hypot(k[0]-a[0],k[1]-a[1]),p=new Path2D();
 for(const sd of [-1,1]){const pts:Pt[]=[];for(let i=0;i<5;i++)pts.push([m[0]+sd*(L*.45+i*L*.09),m[1]-L*.25+i*L*.12+(i%2?L*.08:-L*.08)*(1+.3*Math.sin(t*18))]);p.addPath(ribbon(pts,Math.max(2.5,L*.06),{seed:90+sd,taper:.5,wobble:.5}));}
 s.fill(R,p,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the header → net plays at ~1× real time) */
const tau1=(t:number)=>{const G=CUEW(0,'goal');return key(t,[[0,-9.4],[CUEW(0,'added time'),-5.2],[CUEW(0,'headed clear'),T_HEAD+.1],[CUEW(0,'drops'),-1],[CUEW(0,'first time'),-.08],[G,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-G]],linear);};
const CAM1:V3=[60,23,76];
function cam1(t:number):Cam{
 const G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t),lp=CUEW(0,'Liverpool');
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // after the header the director holds Gerrard, the ball and the goal together
 const hold=sm(T_HEAD-.4,T_HEAD+.9,tau,easeInOutSine)*(1-sm(G+.3,G+1.2,t)),mid:V3=[(P0[0]+101)/2,0,(P0[1]+0)/2+1];
 const open:V3=[62,6,-6],m=posOf(HERO,tau),cel:V3=[m[0]+1,1.1,m[1]];
 const toBall=sm(0,lp,t,easeInOutSine),toD=sm(G+.4,G+1.5,t,easeInOutSine);
 const follow=lerp3(bt,mid,hold),tb:V3=[lerp(open[0],follow[0],toBall),lerp(open[1],2.2,toBall),lerp(open[2],lerp(follow[2],0,.25),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,[[0,2000],[lp,3500],[CUEW(0,'Steven'),4300],[CUEW(0,'headed'),4600],[CUEW(0,'first'),5000],[G,5000],[G+1.5,6400],[S,6800]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.05,G+.5,t),flash:sm(G+.15,G+.4,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,after:({bg})=>{
   // "Steven Gerrard": a small yellow marker ring round him on the TV picture (a broadcast telestrator circle) until the ball drops
   const w=sm(CUEW(0,'Steven')-.1,CUEW(0,'Steven')+.3,t,easeOutBack)*(1-sm(CUEW(0,'drops')-.2,CUEW(0,'drops')+.2,t));
   if(w>0){const[x,z]=posOf(HERO,tau),pts:Pt[]=[];for(let i=0;i<30;i++){const q=pr(c,[x+Math.cos(i/30*TAU)*1.6,0,z+Math.sin(i/30*TAU)*1.1]);if(q)pts.push(q);}
    if(pts.length>20){const r=Math.max(3,c.F*.1/toCam(c,[x,0,z])[2]);s.knockout(ribbon(pts,r*1.8,{close:true,seed:5,taper:0,wobble:.8}),.8*w);s.fill(Y,ribbon(pts,r,{close:true,seed:5,taper:0,wobble:.8}),.95*w);}}
   // "first time": a spark off his boot at contact
   const age=tau;if(age>-.05&&age<.3&&bg){const q=pr(c,C_BALL);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.9/toCam(c,C_BALL)[2],{n:8,seed:11,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.18)/.12)),width:6});}
   // "yards out": the distance ticks along the ground from the ball to the goal line
   const yw=sm(CUEW(0,'yards')-.1,CUEW(0,'yards')+.4,t)*(1-sm(CUEW(0,'headed')-.3,CUEW(0,'headed'),t));
   if(yw>0){const dots=new Path2D();for(let i=1;i<10;i++){const u=i/10;if(u>yw)break;const q=pr(c,[lerp(P0[0]+.8,105,u),0,lerp(P0[1],NET[2],u)]);if(q){const r=c.F*.16/toCam(c,[lerp(P0[0],105,u),0,0])[2];dots.addPath(polyPath(blob(q[0],q[1],r*1.4,r*.5,i,{amp:.08,n:10}),true));}}s.knockout(dots,.8);s.fill(Y,dots,.95);}
  }});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(HERO,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:12.4,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low touchline camera on his right
const tau2=(t:number)=>key(t,[[0,-1.9],[CUEW(1,'Tired'),-1.35],[CUEW(1,'head down'),-.62],[CUEW(1,'body'),-.26],[CUEW(1,'strikes'),-.01],[CUEW(1,'through'),.1],[SECS(1),.62]],linear);
/** his right side (the kicking side) on the ground */
const RIGHT:Pt=[Math.sin(YAW_S),Math.cos(YAW_S)];
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(HERO,Math.min(tau,.3)),open=1-sm(0,1.2,t,easeInOutSine),push=sm(CUEW(1,'head')-.3,CUEW(1,'body')+.3,t,easeInOutSine),after=sm(CUEW(1,'through')-.3,SECS(1),t,easeInOutSine);
 const d=8.2+3*open-1.4*push+1.5*after,C:V3=[m[0]+RIGHT[0]*d-FWD[0]*(1.2-1.2*after),1.05+.4*open,m[1]+RIGHT[1]*d-FWD[1]*(1.2-1.2*after)],T:V3=[m[0]+FWD[0]*(.6+2.2*after),.82-.12*push,m[1]+FWD[1]*(.6+2.2*after)];
 return look(C,T,2500+450*push-300*after-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),tl=CUEW(1,'Tired'),hd=CUEW(1,'head down'),bo=CUEW(1,'body'),st=CUEW(1,'strikes'),th=CUEW(1,'through'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  shotPath(s,c,tau,sm(th-.1,th+.3,t)*(1-sm(E-.9,E-.5,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,near:4.5,after:({hero,bg,br})=>{
   strain(s,hero,sm(tl-.1,tl+.25,t)*(1-sm(hd-.3,hd,t)),t);
   downArrow(s,hero,sm(hd-.05,hd+.35,t,easeOut)*(1-sm(bo+.3,bo+.6,t)));
   plumb(s,c,hero,sm(bo-.05,bo+.35,t)*(1-sm(st+.2,st+.5,t)));
   // "strikes": the contact spark on the laces
   const age=t-st;if(age>-.2&&age<.6&&bg)sparkBurst(s,Y,bg[0],bg[1],br*4,{n:9,seed:13,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(4,br*.3)});
   // "through the middle": the target on the ball as it leaves the boot, the arrow along the flight
   if(bg){const b=ballAt(tau),q=pr(c,[b[0]+FWD[0],b[1],b[2]+FWD[1]]),dir=q?Math.atan2(q[1]-bg[1],q[0]-bg[0]):0;target(s,bg,br,sm(th-.15,th+.25,t,easeOutBack)*(1-sm(E-.9,E-.5,t)),dir);}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.9,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: past Hislop into the far corner, then the celebration
const tau3=(t:number)=>{const bc=CUEW(2,'bottom');return key(t,[[0,-.45],[CUEW(2,'Low'),-.05],[CUEW(2,'keeper'),.62],[bc,IN_NET+.02],[CUEW(2,'Liverpool'),IN_NET+.9],[SECS(2),IN_NET+.9+(SECS(2)-CUEW(2,'Liverpool'))*.8]],linear);};
const swing3=(t:number)=>sm(CUEW(2,'bottom')+.35,CUEW(2,'Liverpool')+.4,t,easeInOutSine);
const tilt3=(t:number)=>sm(CUEW(2,'penalties')-.4,CUEW(2,'penalties')+.5,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),up=tilt3(t),b=ballAt(Math.min(tau,IN_NET)),m=smooth(HERO,tau);
 const C0:V3=[113.5,2.1,-8.2],T0:V3=[lerp(88,b[0],.35),1.1,lerp(2,b[2],.4)];
 const C1:V3=[m[0]+7,2.4+1.5*up,m[1]+11],T1:V3=[m[0]-3*up,1.1+2.6*up,m[1]+5*up];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2300+500*sm(0,CUEW(2,'keeper'),t),3000-900*up,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),bc=CUEW(2,'bottom'),pe=CUEW(2,'penalties'),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(bc,bc+.4,t),flash:sm(bc-.1,bc+.3,t)*(1-sm(bc+1.5,bc+2,t))+sm(pe-.2,pe+.2,t)});
  ground(s,c,{goalLater:true});
  // "Low and hard": the red ground trace of the flight grows behind the ball
  shotPath(s,c,tau,sm(CUEW(2,'Low')-.1,CUEW(2,'Low')+.3,t)*(1-sm(bc+.6,bc+1.1,t)),{ground:true});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,near:6,after:({bg,br})=>{
   if(bg&&tau>0&&tau<IN_NET){const b=ballAt(tau),q=pr(c,ballAt(tau-.05));if(q)speedLines(s,K,bg[0],bg[1],Math.atan2(bg[1]-q[1],bg[0]-q[0]),{n:5,seed:17,len:br*6,spread:br*1.2,width:Math.max(2,br*.2),cov:.7});void b;}}});
  goal3(s,c,105,1,bulgeAt(tau));
  // "bottom corner": a yellow burst in the corner as the net bulges
  const age=t-bc;if(age>-.1&&age<.7){const q=pr(c,NET);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.9/toCam(c,NET)[2],{n:10,seed:19,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.45)/.25)),width:8});}
  // "on penalties": the Liverpool end celebrates — red and paper confetti across the picture
  const cw=sm(pe-.1,pe+.4,t);if(cw>0){const fall=(t-pe)*140;confetti(s,[R,'paper',Y],[-v.hx,-v.hy-300+fall,2*v.hx,v.hy*1.4],42,31,{size:64,cov:.95*cw});}
  streaks(s,v,1-sm(0,.45,t),33);
  void E;
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HERO,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.4,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front three-quarter camera on the strike
const tau4=(t:number)=>key(t,[[0,-.5],[CUEW(3,'Your'),-.4],[CUEW(3,'body'),-.16],[CUEW(3,'strike'),-.03],[CUEW(3,'long'),.06],[CUEW(3,'low'),.4],[SECS(3),1.05]],linear);
function cam4(t:number):Cam{
 const push=sm(CUEW(3,'Your')-.2,CUEW(3,'body')+.4,t,easeInOutSine),back=sm(CUEW(3,'long')-.3,SECS(3),t,easeInOutSine);
 const base:Pt=[P0[0]-FWD[0]*.4,P0[1]-FWD[1]*.4],side:Pt=[FWD[0]*.5+RIGHT[0]*.87,FWD[1]*.5+RIGHT[1]*.87],d=7.4-1.2*push+5*back;
 const C:V3=[base[0]+side[0]*d-FWD[0]*2.5*back,1.05+.5*back,base[1]+side[1]*d-FWD[1]*2.5*back],T:V3=[base[0]+FWD[0]*(.7+5*back),.78+.3*back,base[1]+FWD[1]*(.7+5*back)];
 return look(C,T,2350+450*push-900*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUEW(3,'Your'),bo=CUEW(3,'body'),st=CUEW(3,'strike'),ls=CUEW(3,'long'),lp=CUEW(3,'low'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  shotPath(s,c,tau,sm(ls-.1,ls+.3,t)*(1-sm(E-.8,E-.4,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,near:5.5,after:({hero,bg,br})=>{
   // "Your turn": a yellow ring on the grass under the ball
   const yw=sm(yt-.1,yt+.35,t,easeOutBack)*(1-sm(bo-.2,bo+.1,t));
   if(yw>0){const b=ballAt(tau),pts:Pt[]=[];for(let i=0;i<32;i++){const q=pr(c,[b[0]+Math.cos(i/32*TAU)*.6*yw,0,b[2]+Math.sin(i/32*TAU)*.45*yw]);if(q)pts.push(q);}if(pts.length>24){const r=c.F*.05/toCam(c,[b[0],0,b[2]])[2];s.knockout(ribbon(pts,r*1.8,{close:true,seed:7,taper:0}),.85);s.fill(Y,ribbon(pts,r,{close:true,seed:7,taper:0}),.95);}}
   downArrow(s,hero,sm(bo-.05,bo+.35,t,easeOut)*(1-sm(st-.2,st+.1,t)));
   plumb(s,c,hero,sm(bo-.05,bo+.35,t)*(1-sm(ls-.2,ls+.1,t)));
   if(bg){const b=ballAt(tau),q=pr(c,[b[0]+FWD[0],b[1],b[2]+FWD[1]]),dir=q?Math.atan2(q[1]-bg[1],q[0]-bg[0]):0;target(s,bg,br,sm(st-.1,st+.3,t,easeOutBack)*(1-sm(ls+.1,ls+.4,t)),dir);
    // "low and powerful": speed lines off the ball skimming away
    const lw=sm(lp-.1,lp+.2,t)*(1-sm(E-.8,E-.4,t));if(lw>0&&tau>0&&q)speedLines(s,K,bg[0],bg[1],dir,{n:6,seed:23,len:br*7,spread:br*1.3,width:Math.max(2,br*.22),cov:.75*lw});}}});
 },
 still:3.2,
};

const film:RisoStory={
 id:'gerrard-cup-2006',format:'11v11',title:"Gerrard's cup final rocket",theme:'Long-range shooting: body over the ball, strike through the middle to keep it low and powerful',
 ageNote:'FA Cup final, Liverpool v West Ham, Millennium Stadium, Cardiff, 13 May 2006. For players of every age.',
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
