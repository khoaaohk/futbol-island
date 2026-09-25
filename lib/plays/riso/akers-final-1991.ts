/** Michelle Akers v Norway, the first FIFA Women's World Cup final, Tianhe Stadium, Guangzhou, 30 November 1991 (USA 2–1 Norway): the
 * 78th-minute winner. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (the footage itself was
 * not reviewed), printed as a riso sheet.
 *
 * SOURCES (what the choreography and kit follow; cached under scratchpad/films/src-cache/):
 *  - Sports Illustrated, Alexander Abnos, "Start of Something Big" (the 1991 goal, with Akers, Heinrichs, Jennings-Gabarra quotes)
 *    https://www.si.com/longform/soccer-goals/goal4.html (read via web.archive.org, 11 Feb 2019 capture)
 *  - Wikipedia, "1991 FIFA Women's World Cup final" (date, kick-off 19:45 local, venue, score, scorers + minutes, line-ups + numbers, referee,
 *    attendance, 80-minute matches, the kit templates) https://en.wikipedia.org/wiki/1991_FIFA_Women%27s_World_Cup_final
 *  - Wikipedia, "Michelle Akers" (5 ft 10 in; scored both goals in the final) https://en.wikipedia.org/wiki/Michelle_Akers
 *  - Wikimedia Commons kit pattern files Kit_body_nor91h.png / Kit_shorts_nor91h.png (Norway: red shirt; white shorts with red panels)
 * CONFIRMED by those accounts: 30 Nov 1991, Tianhe Stadium, Guangzhou, 19:45 kick-off (a floodlit night game), ≈63,000 (SI: 60,000, "a
 *  remarkably quiet" crowd); matches were 80 minutes; Akers (No. 10, then Akers-Stahl) scored in the 20th minute, Linda Medalen equalised in
 *  the 29th, so it was 1–1 until Akers' winner in the 78th minute — two minutes from the end. THE GOAL: Shannon Higgins (No. 3) hit a long,
 *  lofted ball from midfield, too strong for any US forward; Norway defender Tina Svensson (No. 16) intercepted it; Akers, "still in full-on
 *  hunting mode", charged down on her back; Svensson tried a back-pass to keeper Reidun Seth (No. 1) just as Akers bumped her right
 *  shoulder; the pass fell short of Seth, who was off her line; Akers took a touch past the keeper; the ball, on her weaker LEFT foot, rolled
 *  toward the end line and the angle got tighter while Seth scrambled back to her goal; Akers: "I better cut this back and pass it in with
 *  my RIGHT foot... I took a deep breath and just kinda... did it" — the ball rolled over the line. Akers was 5 ft 10 in (1.78 m) with a
 *  "signature mop of wily, curly hair". KIT: USA all white (white shirts, shorts, socks with blue stripes; hand-me-down Adidas shirts);
 *  Norway red shirts, white shorts with red panels, navy socks. Referee Vadim Zhuk (Soviet Union).
 * INFERRED (illustrative): every position and time in metres and seconds between those beats; the side of the pitch and which side of the
 *  goal she finished from (here the far side from the main-stand camera); where Higgins hit it from; Svensson's first touch and right-footed
 *  back-pass; how far out Seth was (≈7 m) and her short lunge at the touch; the cut-back being a left-foot inside drag; the side-foot pass;
 *  that Seth was still retreating as the ball crossed; the celebration run; the other players' positions; the USA shirt's blue trim and navy
 *  numbers (the exact 1991 shirt pattern was not verified); Seth's yellow kit; Akers' hair ink (mid-brown) and everyone's hair styles;
 *  Tianhe's shape (an oval bowl round a red running track, floodlight banks on the rim); the crowd colours; the ball's panels; the cameras.
 *  The narration names none of the inferred details (not the side, not the kit colours).
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 * time, panning with the ball from Higgins' long ball to the goal; 2 = the slow-motion replay from a low touchline camera: Akers presses
 * Svensson (a red press arrow), the back-pass rolls short of the keeper (a dashed line and a gap bracket), Akers is there first (a spark);
 * 3 = the replay from behind the goal: the goal angle shrinking (a yellow wedge), the deep breath (a ring round her), the cut-back and the
 * right-foot pass (a red ring on the boot), the net, then a swing round to her celebration under the floodlights; 4 = the lesson from a low
 * front camera: press (arrow), pounce (spark), stay calm (breath ring), pass it into the net (a yellow lane). All figures are the shared riso
 * athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(); women footballers use athlete.ts builds (height ≈1.62–1.78,
 * bulk ≈.9) with ponytails / curly / short hair. The world is right-handed (athlete.ts's convention: X toward Norway's goal, Y up, +Z toward
 * the main stand), so the left touch and the right-foot finish need no mirrored projector. Scenes read only (t, c); every action keys off cue
 * times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.5 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The winner, live',text:"Guangzhou, 1991, the first Women's World Cup final. One-one, two minutes left. Norway's defender wins a long ball, but Michelle Akers chases her down! The back-pass is short... Akers pounces, round the keeper... goal!",seconds:16.6,
  cues:[[.2,'Guangzhou'],[1.5,"first Women's"],[3.6,'One-one'],[4.5,'two minutes left'],[5.8,"Norway's defender"],[7,'long ball'],[8.1,'Michelle Akers'],[9.1,'chases her down'],[10.5,'The back-pass'],[12,'Akers pounces'],[13.1,'round the keeper'],[14.6,'goal']]},
 {label:'Watch it again',text:'Watch it again. Akers presses hard, so the defender has to rush. Her back-pass stops short, and Akers gets there first.',seconds:8.6,
  cues:[[.15,'Watch it again'],[1.4,'presses hard'],[2.8,'has to rush'],[4,'Her back-pass'],[4.9,'stops short'],[6.1,'gets there first']]},
 {label:'Stay calm',text:'The angle is tight. She stays calm, takes a deep breath, and passes it in with her right foot.',seconds:8.6,
  cues:[[.15,'The angle is tight'],[1.6,'stays calm'],[2.7,'deep breath'],[3.9,'passes it in'],[5.1,'right foot']]},
 {label:'Your turn',text:'Your turn: press defenders, pounce on mistakes, then stay calm and pass it into the net.',seconds:7.6,
  cues:[[.15,'Your turn'],[1,'press defenders'],[2.2,'pounce on mistakes'],[3.6,'stay calm'],[4.6,'pass it into the net']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py akers-final-1991, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/akers-final-1991/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-akers-final-1991.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/akers-final-1991/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('akers: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (the USA attack +X, Norway's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
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

// ---------------------------------------------------------------- Tianhe at night: an oval bowl round a red running track, floodlit rim
const CX=52.5,NS=48;
/** a point on the oval: angle th around the pitch centre, d metres out from the track's outer edge, height y (superellipse) */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(64+d)*Math.sign(c)*Math.pow(Math.abs(c),.5),y,(46+d)*Math.sign(s)*Math.pow(Math.abs(s),.5)];}
const STAND=(b:number):[number,number]=>[1+33*b,1.4+24*b];
type Bowl={stand:V3[][];wall:V3[][];fascia:V3[][];lights:V3[][];track:V3[];trackIn:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={stand:[],wall:[],fascia:[],lights:[],track:[],trackIn:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=STAND(0),[d1,y1]=STAND(1);
  o.stand.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.wall.push([rim(a,0,0),rim(b,0,0),rim(b,1,1.4),rim(a,1,1.4)]);
  o.fascia.push([rim(a,34,25.4),rim(b,34,25.4),rim(b,34.5,28),rim(a,34.5,28)]);
  // floodlight banks along the rim of both long sides (inferred placement)
  if(i%4===1&&Math.abs(Math.sin(a+.07))>.55)o.lights.push([rim(a,34.6,27.2),rim(b+.02,34.6,27.2),rim(b+.02,34.6,30.2),rim(a,34.6,30.2)]);
  o.track.push(rim(a,0,0));
  const c=Math.cos(a),s=Math.sin(a);o.trackIn.push([CX+56.5*Math.sign(c)*Math.pow(Math.abs(c),.5),0,38.2*Math.sign(s)*Math.pow(Math.abs(s),.5)]);
  for(let r=0;r<11;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.22)continue;const[d,y]=STAND((r+.5)/11);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** everything behind the pitch: the night sky, the floodlit bowl, the crowd (roar lifts the marks, flash = photographers' bulbs) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.fill(K,rectPath(-1e4,-1e4,2e4,2e4),.9);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.35);
 const st=new Path2D(),fas=new Path2D(),li=new Path2D(),glow=new Path2D();
 for(let i=0;i<NS;i++){const q=quadP(c,BOWL.stand[i]);if(q)st.addPath(polyPath(q,true));const f=quadP(c,BOWL.fascia[i]);if(f)fas.addPath(polyPath(f,true));}
 for(const L of BOWL.lights){const q=quadP(c,L,30);if(!q)continue;li.addPath(polyPath(q,true));const cx=(q[0][0]+q[2][0])/2,cy=(q[0][1]+q[2][1])/2,w=Math.abs(q[1][0]-q[0][0])+8;
  glow.addPath(polyPath(blob(cx,cy,w*1.5,w*.9,7,{amp:.05,n:16}),true));}
 s.knockout(st);s.tone(B,st,.5);s.tone(K,st,.42);
 // the crowd: one mark per seat group; white shirts (paper), yellow, red, blue, navy; the flags and lit faces nearer the pitch
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,12),lift=roar>0?roar*z*1.2*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.45?0:q.h<.6?1:q.h<.76?2:q.h<.9?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.55);s.fill(Y,inks[1],.7);s.fill(R,inks[2],.7);s.fill(B,inks[3],.8);s.fill(K,inks[4],.8);
 s.knockout(fas);s.fill(K,fas,.7);s.tone(B,fas,.4);
 s.tone(Y,glow,.35);s.knockout(li);s.fill(Y,li,.55);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the track, the floodlit grass with mowing stripes, boards, paper lines and both goals (the right goal drawn later from behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const tr=polyP(c,BOWL.track);if(tr.length>2){const p=polyPath(tr,true);s.knockout(p);s.fill(R,p,.62);s.tone(K,p,.2);}
 const ti=polyP(c,BOWL.trackIn);if(ti.length>2){const p=polyPath(ti,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.85);s.tone(K,p,.15);}
 const g=polyP(c,[[-3,0,-36],[108,0,-36],[108,0,36],[-3,0,36]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);
 const stp=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-36],[(k+1)*5.25,0,-36],[(k+1)*5.25,0,36],[k*5.25,0,36]]);if(q.length>2)stp.addPath(polyPath(q,true));}s.tone(K,stp,.1);
 // boards: far touchline and behind both goals, red with paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-2,0,-36],[107,0,-36],[107,.9,-36],[-2,.9,-36]]),polyP(c,[[107.5,0,-30],[107.5,0,30],[107.5,.9,30],[107.5,.9,-30]]),polyP(c,[[-2.5,0,30],[-2.5,0,-30],[-2.5,.9,-30],[-2.5,.9,30]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<17;k++){const x=0+k*6.2,q=polyP(c,[[x,.25,-35.95],[x+3.4,.25,-35.95],[x+3.4,.65,-35.95],[x,.65,-35.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<9;k++){const z=-28+k*6.4,q=polyP(c,[[107.45,.25,z],[107.45,.25,z+3.4],[107.45,.65,z+3.4],[107.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
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
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-2.3);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.6*Math.exp(-Math.pow((z-bz)/1.6,2)));
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
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]];
/** women footballers: athletic builds, a touch slimmer through the shoulders */
const W=(h:number,o:{bulk?:number;thighs?:number}={})=>({height:h,bulk:o.bulk??.92,thighs:o.thighs??1.06,head:1.02});
/** USA 1991: all white (confirmed: white shirts, shorts, socks with blue stripes); blue trim and navy numbers inferred */
const USA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:B,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',numberInk:K,build:W(1.67),seed:5,...o});
/** Michelle Akers: No. 10 and 5 ft 10 in (1.78 m) (confirmed), a curly mop of hair (confirmed, SI); a strong target forward's build */
const AKERS_ST:AthleteStyle=USA({number:10,hair:[K,.58],hairStyle:'curly',build:W(1.78,{bulk:.97,thighs:1.12}),seed:10});
/** Norway 1991: red shirts, white shorts with red panels (the trim), navy socks (confirmed kit panels) */
const NOR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:'paper',socks:K,boots:K,skin:SKIN_L,hair:[Y,.8],hairStyle:'ponytail',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',build:W(1.69),seed:31,...o});
const SVENSSON_ST:AthleteStyle=NOR({number:16,hair:[Y,.9],hairStyle:'short',build:W(1.7,{bulk:.95}),seed:16});
/** Reidun Seth: No. 1 (confirmed); the yellow keeper's kit is inferred */
const SETH_ST:AthleteStyle={shirt:[Y,.95],trim:K,shorts:K,socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.75],hairStyle:'ponytail',line:K,shade:[K,.28],sleeves:'long',gloves:'paper',number:1,numberInk:K,build:W(1.72,{bulk:.95}),seed:1};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'short',line:K,build:{height:1.8},seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: curls, ponytails and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Svensson's back-pass)
type Role='akers'|'usa'|'nor'|'sven'|'gk'|'ref';
type Move={kind:'lunge';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** the beats (times and places inferred; see the header) */
const KICK=-3.4,LAND=-1.5,CTRL=-.9,POUNCE=.95,CUT=2.7,SHOT=3.1,LINE=3.75,IN_NET=3.95;
const GOALPT:[number,number]=[105,-2.5];
const ACTORS:Actor[]=[
 {name:'Akers',role:'akers',style:AKERS_ST,key:true,keys:[[-10,72,8],[-6,75,7],[KICK,79.3,5.6],[-2.4,82.6,4.6],[LAND,85.6,3.6],[-.6,88.6,2.5],[0,90.3,1.8],[.5,92.4,1.5],[POUNCE,94.2,1.15],[1.4,96.1,-.2],[1.8,97.9,-1.7],[2.3,100.2,-3.6],[CUT,101.6,-4.85],[SHOT,101.8,-4.92],[3.5,102.05,-4.7],[4.2,101.6,-3.4],[5.2,99.8,-.2],[6.5,97.3,3.6],[8,95,6.8],[10,93.2,9.2]]},
 {name:'Svensson',role:'sven',style:SVENSSON_ST,key:true,keys:[[-10,82,4],[-6,82.5,3.6],[KICK,84,3],[LAND,87.3,2.4],[CTRL,88.5,1.9],[-.4,89.8,1.5],[0,90.55,1.25],[.5,91.2,1.1],[1.2,91.9,1.2],[2.5,93.5,.6],[4,96,-.8],[10,97.5,-1.5]]},
 {name:'Seth',role:'gk',style:SETH_ST,key:true,moves:[{kind:'lunge',at:1.12,dur:.8,side:'r'},{kind:'lunge',at:3.55,dur:.8,side:'r'}],keys:[[-10,103.6,0],[KICK,102.3,.4],[LAND,100,.6],[0,98.2,.5],[.9,97.6,.45],[1.3,97.45,.3],[1.8,98.3,-.2],[2.6,101.2,-1],[3.3,103.3,-1.5],[3.8,104,-1.8],[10,104,-1.6]]},
 {name:'Higgins',role:'usa',style:USA({number:3,hair:[K,.7],build:W(1.63),seed:3}),keys:[[-10,52.5,-7.5],[-6,55.5,-6.4],[KICK,58.4,-5.6],[-2,61,-5],[2,66,-3.5],[10,76,0]]},
 {name:'Jennings',role:'usa',style:USA({number:12,hair:[Y,.85],hairStyle:'long',build:W(1.63),seed:12}),keys:[[-10,76,15],[KICK,80,13.6],[0,87.5,10.4],[4,95.5,5.2],[7,97,5.6],[10,96.2,8.6]]},
 {name:'Heinrichs',role:'usa',style:USA({number:2,hair:[K,.8],hairStyle:'short',build:W(1.65),seed:2}),keys:[[-10,75,-12],[KICK,79,-11],[0,86,-9],[4,95,-6.5],[7,96.4,2],[10,95.6,7.4]]},
 {name:'Lilly',role:'usa',style:USA({number:13,hair:[K,.72],build:W(1.63,{bulk:.94,thighs:1.1}),seed:13}),keys:[[-10,60,9],[KICK,63,8.4],[3,70,7],[10,80,7]]},
 {name:'Foudy',role:'usa',style:USA({number:11,hair:[K,.62],build:W(1.68),seed:11}),keys:[[-10,58,-14],[KICK,60,-13],[4,66,-10],[10,74,-6]]},
 {name:'Store',role:'nor',style:NOR({number:8,seed:32}),keys:[[-10,85,-6],[KICK,86.5,-5.4],[0,89.5,-4],[4,96.5,-3.4],[10,98,-2.5]]},
 {name:'Espeseth',role:'nor',style:NOR({number:4,hair:[K,.7],build:W(1.72,{bulk:.95}),seed:33}),keys:[[-10,82,10],[KICK,83.5,9.2],[0,88,7.2],[4,95.5,4.4],[10,97,3.2]]},
 {name:'Nyborg',role:'nor',style:NOR({number:5,hairStyle:'short',seed:34}),keys:[[-10,80,-16],[KICK,82,-15],[0,86.5,-12],[4,92,-9],[10,95,-7]]},
 {name:'Zaborowski',role:'nor',style:NOR({number:2,seed:35}),keys:[[-10,66,-3],[KICK,68,-2.6],[2,74,-1.2],[10,82,0]]},
 {name:'Haugen',role:'nor',style:NOR({number:7,hair:[K,.6],seed:36}),keys:[[-10,62,4],[KICK,64,5],[2,70,5.5],[10,79,6]]},
 {name:'Carlsen',role:'nor',style:NOR({number:6,seed:37,hairStyle:'short'}),keys:[[-10,57,-1],[KICK,59,-2],[2,63,-3],[10,70,-4]]},
 {name:'Riise',role:'nor',style:NOR({number:9,seed:38}),keys:[[-10,62,16],[KICK,63,15],[3,68,13],[10,76,11]]},
 {name:'referee',role:'ref',style:REF_ST,keys:[[-10,66,4],[KICK,69,4.5],[0,79,5.6],[4,88,6],[10,91,5]]},
];
const AKERS=0,SVEN=1,SETH=2,HIGGINS=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-10,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball
const LANDP:[number,number]=[87.2,2.1],CTRLP:[number,number]=[89,1.75],CARRY:[number,number]=[90.2,1.45],BACKP:[number,number]=[91,1.3],
 SHORT:[number,number]=[94.6,.95],WIDE:[number,number]=[102.45,-5.05],SETP:[number,number]=[102.2,-4.55];
const NETP:V3=[105.9,.12,-2.3],REST:V3=[106,.11,-2.25];
/** the ball ahead of Higgins' feet while she brings it forward */
function higginsBall(tau:number):[number,number]{const p=posOf(HIGGINS,tau),v=velOf(HIGGINS,Math.min(tau,KICK-.1)),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*.5,p[1]+v[1]/l*.5];}
const easeD=(u:number,p:number)=>1-Math.pow(1-clamp(u),p);
function ballAt(tau:number):V3{
 if(tau<KICK){const b=higginsBall(tau);return[b[0],.11,b[1]];}
 if(tau<LAND){const s0=higginsBall(KICK),u=(tau-KICK)/(LAND-KICK),e=easeD(u,1.25);return[lerp(s0[0],LANDP[0],e),.11+10*4*u*(1-u)*(1-.15*u),lerp(s0[1],LANDP[1],e)];}
 if(tau<CTRL){const u=(tau-LAND)/(CTRL-LAND);return[lerp(LANDP[0],CTRLP[0],u),.11+1.3*4*u*(1-u),lerp(LANDP[1],CTRLP[1],u)];}
 if(tau<-.4){const e=easeD((tau-CTRL)/(-.4-CTRL),1.6);return[lerp(CTRLP[0],CARRY[0],e),.11,lerp(CTRLP[1],CARRY[1],e)];}
 if(tau<0){const e=easeD((tau+.4)/.4,1.4);return[lerp(CARRY[0],BACKP[0],e),.11,lerp(CARRY[1],BACKP[1],e)];}
 if(tau<POUNCE){const e=easeD(tau/POUNCE,2);return[lerp(BACKP[0],SHORT[0],e),.11,lerp(BACKP[1],SHORT[1],e)];}
 if(tau<CUT){const e=easeD((tau-POUNCE)/(CUT-POUNCE),1.7);return[lerp(SHORT[0],WIDE[0],e),.11,lerp(SHORT[1],WIDE[1],e)];}
 if(tau<SHOT){const e=easeInOutSine(clamp((tau-CUT)/(SHOT-CUT-.08)));return[lerp(WIDE[0],SETP[0],e),.11,lerp(WIDE[1],SETP[1],e)];}
 if(tau<LINE){const e=easeD((tau-SHOT)/(LINE-SHOT),1.15);return[lerp(SETP[0],GOALPT[0],e),.11,lerp(SETP[1],GOALPT[1],e)];}
 if(tau<IN_NET){const u=(tau-LINE)/(IN_NET-LINE);return[lerp(GOALPT[0],NETP[0],u),.11,lerp(GOALPT[1],NETP[2],u)];}
 const e=easeD((tau-IN_NET)/.5,2);return[lerp(NETP[0],REST[0],e),lerp(NETP[1],REST[1],e),lerp(NETP[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:.6*Math.exp(-(tau-IN_NET)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));
/** the ball's spin (the panels roll with the distance it has travelled) */
const spinAt=(tau:number)=>{const a=ballAt(tau),b=ballAt(tau-.1);return(a[0]+a[2]*.7)/.11+Math.hypot(a[0]-b[0],a[2]-b[2]);};

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:9,rHipA:9,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-8});
/** the press: shoulder dropped into Svensson on her left, arms tucked, head down (a fair shoulder-to-shoulder challenge) */
const SHOULDER:Partial<Pose>={roll:-12,bend:-10,lean:18,lShA:14,lShF:-10,lElb:70,rShA:32,rShF:30,neckP:14,neckY:-10,squash:-.04};
/** the cut-back: the left foot reaches across and drags the ball back toward goal, body low, arms out for balance */
const DRAG:Partial<Pose>={lHipF:32,lHipA:-16,lHipR:-18,lKnee:26,lAnk:-12,rHipF:14,rKnee:44,lean:20,pitch:6,twist:-14,lShA:58,rShA:48,lElb:34,rElb:38,neckP:32,neckY:6,squash:-.05};
/** the deep breath: chin up a touch, shoulders settle */
const BREATH:Partial<Pose>={neckP:4,lShA:28,rShA:28,lean:10};
/** Svensson knocked off balance by the shoulder (to her left) */
const STUMBLE:Partial<Pose>={roll:-16,bend:-14,lShA:70,rShA:52,lElb:26,rElb:30,lHipA:18,neckY:12,lean:4};
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk'){const fb=yawOf(b[0]-x,b[2]-z);yaw=tau>1.45&&tau<3.1?lerpA(fb,yaw,sm(1.45,1.8,tau)*(1-sm(2.8,3.1,tau))):fb;}
 if(k===SVEN&&tau>-.7&&tau<.5){const s=posOf(SETH,tau);yaw=lerpA(yaw,yawOf(s[0]-x,s[1]-z),bump(-.8,.6,tau)*1.6);}
 if(k===AKERS&&tau>2.35&&tau<3.9){yaw=lerpA(yaw,yawOf(GOALPT[0]-x,GOALPT[1]-z),Math.min(sm(2.35,2.7,tau),1-sm(3.5,3.9,tau)));}
 if(a.role==='usa'||a.role==='nor'||a.role==='ref'){if(sp<1.2)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),1-sp/1.2);}
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='nor'||a.role==='sven'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5),stride=k===AKERS?3.9:3.4;p=blendPose(idle,runCycle(distOf(k,tau)/stride,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-.6*mv.dur,u=(tau-t0)/mv.dur;
  if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 if(k===SVEN){// first touch on the bounce, then the right-footed back-pass
  p=over(p,{rHipF:30,rKnee:30,rAnk:20,lean:16,neckP:30,lShA:40,rShA:30},bump(CTRL-.3,CTRL+.25,tau));
  const D=.8,st=-STRIKE_CONTACT*D,u=(tau-st)/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.35}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  p=over(p,STUMBLE,bump(.05,1,tau));}
 if(k===AKERS){
  p=over(p,SHOULDER,bump(-.45,.35,tau));
  // the touch past the keeper: her LEFT foot (a short, quick poke)
  {const D=.55,st=POUNCE-STRIKE_CONTACT*D,u=(tau-st)/D;if(u>0&&u<1.3)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.22}),Math.min(sm(0,.2,u),1-sm(1,1.3,u)));}
  p=over(p,DRAG,bump(CUT-.3,CUT+.3,tau));
  p=over(p,BREATH,bump(CUT+.1,SHOT-.1,tau)*.6);
  // the finish: a side-foot pass with her RIGHT foot (toes turned out through contact)
  {const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));p=over(p,{rHipR:40},bump(.3,.8,u));}}
  if(tau>LINE+.35){const w=sm(LINE+.35,LINE+.9,tau);p=blendPose(p,tau<6.4?celebrate(tau*.9,{kind:'run'}):celebrate((tau-6.4)*1.1,{kind:'arms'}),w);}
 }
 if((k===4||k===5)&&tau>LINE+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(LINE+.5,LINE+1,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(a.key?1.2:7))return;// a TV camera keeps extras off its lens
 const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.8/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.16,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.85,br*.26,2,{amp:.05,n:12}),true));s.tone(K,sh,.4);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:spinAt(tau),key:K,shadow:B,seed:5});};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===AKERS?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===AKERS||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===AKERS}:{});
  if(e.k===AKERS)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ground ribbon through world points (knocked out, then printed) */
function groundRibbon(s:Sheet,c:Cam,pts:[number,number][],wm:number,ink:string,w:number,seed:number,arrow=false){if(w<=0)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<2)return;const n=Math.max(2,Math.round(sp.length*clamp(w))),seg=sp.slice(0,n),wd=Math.max(4,c.F*wm/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 if(arrow){const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}}
/** "presses": a red arrow on the grass along Akers' chase onto Svensson's back */
function pressArrow(s:Sheet,c:Cam,w:number){const pts:[number,number][]=[];for(let i=0;i<=12;i++)pts.push(posOf(AKERS,-2.2+2.05*i/12));groundRibbon(s,c,pts,.12,R,w,61,true);}
/** "stops short": the back-pass line to the keeper, dashed where the ball never got, and a gap bracket */
function shortMarks(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;
 const k=posOf(SETH,Math.min(tau,.9)),dash=new Path2D();
 for(let i=0;i<7;i++){const u0=i/7,u1=u0+.5/7,a=pr(c,[lerp(SHORT[0],k[0],u0),.03,lerp(SHORT[1],k[1],u0)]),b=pr(c,[lerp(SHORT[0],k[0],u1),.03,lerp(SHORT[1],k[1],u1)]);if(a&&b)dash.addPath(ribbon([a,b],Math.max(3,c.F*.07/toCam(c,[SHORT[0],0,SHORT[1]])[2]),{seed:70+i,taper:0}));}
 s.knockout(dash,.7*w);s.fill(Y,dash,.95*w);
 const q=toCam(c,[SHORT[0],0,SHORT[1]]);if(q[2]<1)return;const g=scr(c,q),r=c.F*.35/q[2]*w,pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push([g[0]+Math.cos(a)*r*1.3,g[1]+Math.sin(a)*r*.5]);}
 s.fill(R,ribbon(pts,Math.max(3,r*.2),{seed:74,close:true,taper:0,wobble:.8}),.95*w);}
/** the goal angle: a yellow wedge on the grass from the ball to both posts (it narrows as the ball runs wide) */
function angleWedge(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const b=ballAt(tau),q=polyP(c,[[b[0],.02,b[2]],[105,.02,-3.66],[105,.02,3.66]]);if(q.length<3)return;const p=polyPath(q,true);s.knockout(p,.5*w);s.tone(Y,p,.75*w);}
/** "a deep breath": two soft rings expanding round her chest */
function breathRing(s:Sheet,r:DrawResult|undefined,t:number,t0:number,w:number){if(!r||w<=0)return;const ch=r.joints.chest,h=Math.hypot(r.joints.head[0]-(r.joints.lAn[0]+r.joints.rAn[0])/2,r.joints.head[1]-(r.joints.lAn[1]+r.joints.rAn[1])/2)*1.1;
 for(const k of[0,1]){const u=((t-t0)/1.4+k*.5)%1;if(u<0)continue;const rad=h*(.25+.35*u),pts:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;pts.push([ch[0]+Math.cos(a)*rad*.8,ch[1]+Math.sin(a)*rad]);}
  const rb=ribbon(pts,Math.max(3,h*.035*(1-u)+2),{seed:80+k,close:true,taper:0,wobble:.8});s.knockout(rb,.85*w*(1-u));s.fill(Y,rb,.95*w*(1-u));}}
/** a red ring round a boot */
function bootRing(s:Sheet,r:DrawResult|undefined,foot:'l'|'r',w:number){if(!r||w<=0)return;const toe=foot==='r'?r.joints.rToe:r.joints.lToe,an=foot==='r'?r.joints.rAn:r.joints.lAn,rad=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*rad*1.2,cy+Math.sin(a)*rad*.8]);}s.fill(R,ribbon(pts,Math.max(3,rad*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*w);}
/** a spark at a world point */
function sparkAt(s:Sheet,c:Cam,P:V3,age:number,seed:number,ink=Y){if(age<-.3||age>.5)return;const q=toCam(c,P);if(q[2]<1)return;const g=scr(c,q);sparkBurst(s,ink,g[0],g[1],c.F*.5/q[2],{n:8,seed,g:easeOutBack(clamp((age+.3)/.2))*(1-clamp((age-.25)/.25)),width:Math.max(5,c.F*.04/q[2])});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const g=CUEW(0,'goal');return key(t,[[0,-9.4],[CUEW(0,'long ball'),KICK+.3],[CUEW(0,'chases'),-1.3],[CUEW(0,'The back-pass'),0],[CUEW(0,'Akers pounces'),POUNCE+.05],[CUEW(0,'round the keeper'),1.85],[g,LINE+.1],[SECS(0)+1,LINE+.1+SECS(0)+1-g]],linear);};
const CAM1:V3=[52.5,25,84];
function cam1(t:number):Cam{
 const G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t),lb=CUEW(0,'long ball');
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[62,6,-10],m=posOf(AKERS,tau),cel:V3=[m[0]-1,1.1,m[1]];
 const toBall=sm(.4,3.4,t,easeInOutSine),toA=sm(G+.5,G+1.6,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0]+2,toBall),lerp(open[1],2,toBall),lerp(open[2],bt[2]*.8,toBall)],T=lerp3(tb,cel,toA);
 const F=key(t,[[0,1500],[3.4,2900],[lb,3300],[CUEW(0,'chases'),5000],[CUEW(0,'The back-pass'),6000],[CUEW(0,'round'),6600],[G,6900],[G+1.5,7600],[S,7800]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(AKERS,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:10,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera: the press, the short back-pass, first to it
const tau2=(t:number)=>key(t,[[0,-2.5],[CUEW(1,'presses'),-1.75],[CUEW(1,'has to rush'),-.55],[CUEW(1,'Her back-pass'),-.02],[CUEW(1,'stops short'),.62],[CUEW(1,'gets there'),POUNCE],[SECS(1),1.55]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),a=smooth(AKERS,tau),sv=smooth(SVEN,tau),wide=sm(CUEW(1,'Her back-pass')-.4,CUEW(1,'stops short'),t,easeInOutSine)*(1-sm(CUEW(1,'gets there')+.2,SECS(1),t,easeInOutSine)*.6);
 const mid:[number,number]=[(a[0]+sv[0])/2,(a[1]+sv[1])/2],k=posOf(SETH,Math.min(tau,.9)),tg:[number,number]=[lerp(mid[0],(mid[0]+k[0])/2,wide),lerp(mid[1],(mid[1]+k[1])/2,wide)];
 const open=1-sm(0,1.3,t,easeInOutSine);
 const C:V3=[tg[0]-4.5+1.5*open,1.5+.4*open+.8*wide,tg[1]+10+3*open+3.5*wide],T:V3=[tg[0]+1,.85,tg[1]-.3];
 return look(C,T,2700-650*wide-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),pr1=CUEW(1,'presses'),hb=CUEW(1,'Her back-pass'),ss=CUEW(1,'stops short'),gt=CUEW(1,'gets there'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  pressArrow(s,c,sm(pr1-.2,pr1+.9,t,easeOut)*(1-sm(hb-.4,hb,t)));
  shortMarks(s,c,tau,sm(ss-.2,ss+.3,t,easeOutBack)*(1-sm(E-1,E-.6,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:()=>{
   sparkAt(s,c,[SHORT[0],.15,SHORT[1]],t-gt,83);
   // "has to rush": speed ticks off Svensson's head as Akers closes
   const rw=bump(CUEW(1,'has to rush')-.2,hb+.3,t);if(rw>0){const[x,z]=posOf(SVEN,tau),q=pr(c,[x,2.05,z]);if(q){const zz=c.F/toCam(c,[x,2,z])[2];for(let i=0;i<3;i++){const a=-Math.PI/2+(i-1)*.5;s.fill(R,ribbon([[q[0]+Math.cos(a)*zz*.18,q[1]+Math.sin(a)*zz*.18],[q[0]+Math.cos(a)*zz*.34,q[1]+Math.sin(a)*zz*.34]],zz*.045,{seed:90+i,taper:.3}),.95*rw);}}}
  }});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the tight angle, the breath, the right-foot pass, the celebration
const tau3=(t:number)=>{const rf=CUEW(2,'right foot');return key(t,[[0,1.15],[CUEW(2,'The angle'),1.35],[CUEW(2,'stays calm'),2.35],[CUEW(2,'deep breath'),2.8],[CUEW(2,'passes it in'),SHOT-.05],[rf,LINE+.05],[rf+.9,IN_NET+.6],[SECS(2),IN_NET+.6+(SECS(2)-rf-.9)*.9]],linear);};
const swing3=(t:number)=>{const rf=CUEW(2,'right foot');return sm(rf+.35,rf+1.6,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(AKERS,tau),u=swing3(t),push=sm(CUEW(2,'stays calm')-.5,CUEW(2,'deep breath'),t,easeInOutSine),hold=sm(CUEW(2,'right foot')+1.5,SECS(2),t,easeInOutSine);
 const C0:V3=[117.5,4.2,-9.5+2*push],T0:V3=[lerp(m[0],(m[0]+104)/2,.35),1,lerp(m[1],-2.5,.25)];
 const mm=smooth(AKERS,tau),C1:V3=[mm[0]+6.5+hold,1.9+.4*hold,mm[1]+7+1.4*hold],T1:V3=[mm[0]-.4,1.2+.3*hold,mm[1]-.6];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3000+1100*push,3100-200*hold,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),at=CUEW(2,'The angle'),sc=CUEW(2,'stays calm'),db=CUEW(2,'deep breath'),pi=CUEW(2,'passes it in'),rf=CUEW(2,'right foot'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(LINE,LINE+.3,tau),flash:sm(rf-.1,rf+.3,t)*(1-sm(SECS(2)-1.2,SECS(2)-.6,t))});
  ground(s,c,{goalLater:u<.5});
  angleWedge(s,c,tau,sm(at-.1,at+.5,t,easeOut)*(1-sm(pi-.3,pi+.1,t)));
  // the pass line: a yellow lane from her boot to the net as she passes it in
  const lw=sm(pi-.1,pi+.5,t,easeOut)*(1-sm(rf+.6,rf+1.1,t));if(lw>0)groundRibbon(s,c,[[SETP[0],SETP[1]],[lerp(SETP[0],GOALPT[0],.5),lerp(SETP[1],GOALPT[1],.5)],[GOALPT[0]+.6,GOALPT[1]+.1]],.1,Y,lw,64,true);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   breathRing(s,hero,t,db,sm(sc-.1,sc+.3,t)*(1-sm(pi-.3,pi,t)));
   bootRing(s,hero,'r',sm(rf-.15,rf+.25,t,easeOutBack)*(1-sm(rf+.8,rf+1.1,t)));}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),GOALPT[1]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(AKERS,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera travelling with her, press → pounce → calm → pass it in
const tau4=(t:number)=>key(t,[[0,-1.6],[CUEW(3,'press'),-.7],[CUEW(3,'pounce'),POUNCE+.02],[CUEW(3,'stay calm'),2.72],[CUEW(3,'pass it into'),SHOT-.1],[SECS(3),LINE+.35]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(AKERS,tau),late=sm(CUEW(3,'pounce')+.4,CUEW(3,'stay calm'),t,easeInOutSine),back=sm(CUEW(3,'pass it into')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[m[0]+6.5+1.2*back,1.35+.5*back,m[1]+7-10.5*late+1*back],T:V3=[m[0]+1.2+1.5*back,.9,m[1]-.3-1.2*late+.4*back];
 return look(C,T,2350-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),pd=CUEW(3,'press'),pm=CUEW(3,'pounce'),scl=CUEW(3,'stay calm'),pi=CUEW(3,'pass it into'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  pressArrow(s,c,sm(pd-.2,pd+.7,t,easeOut)*(1-sm(pm-.5,pm-.2,t)));
  shortMarks(s,c,tau,sm(pm-.3,pm,t)*(1-sm(pm+.7,pm+1,t)));
  const lw=sm(pi-.1,pi+.5,t,easeOut)*(1-sm(E-.8,E-.4,t));if(lw>0)groundRibbon(s,c,[[SETP[0],SETP[1]],[lerp(SETP[0],GOALPT[0],.5),lerp(SETP[1],GOALPT[1],.5)],[GOALPT[0]+.6,GOALPT[1]+.1]],.1,Y,lw,66,true);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   sparkAt(s,c,[SHORT[0],.15,SHORT[1]],t-pm,93);
   breathRing(s,hero,t,scl,sm(scl-.1,scl+.3,t)*(1-sm(pi-.2,pi+.1,t)));
   bootRing(s,hero,'r',sm(pi-.1,pi+.3,t,easeOutBack)*(1-sm(E-.8,E-.4,t)));}});
 },
 still:3.4,
};

const film:RisoStory={
 id:'akers-final-1991',format:'11v11',title:"Akers' World Cup Winner",theme:'Striker instincts: press defenders, pounce on mistakes, stay calm to finish',
 ageNote:"The first FIFA Women's World Cup final, USA v Norway, Tianhe Stadium, Guangzhou, 30 November 1991. For players of every age.",
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.7*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
