/** Enzo Fernández — "the curler from range" (signature card). The real moment that shows it: World Cup 2022, Group C, Argentina 2–0
 * Mexico, Lusail Stadium, Qatar, 26 November 2022, 87th minute: from a short corner on the left, Messi passes to Enzo on the left corner
 * of the penalty area; he shimmies past Érick Gutiérrez and curls a right-foot shot across goal, past the leaping Guillermo Ochoa, into the
 * far top corner. WHY THIS MOMENT: it is his most famous goal and exactly the card's trait (a curled strike from the edge of the box into the
 * far corner, away from the keeper), and written sources describe the play itself, so it is recreated in the real match (not a demo).
 * An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot watch the footage).
 *
 * SOURCES (cached under scratchpad/films/src-cache, read 24 Sep 2026):
 *  - Wikipedia, "2022 FIFA World Cup Group C" (raw wikitext: date, 22:00 kick-off, Lusail Stadium, attendance 88,966, referee Daniele
 *    Orsato, line-ups, numbers and substitutions, the match kit template, "a curled finish in the top right corner of the net", Messi's assist)
 *    https://en.wikipedia.org/wiki/2022_FIFA_World_Cup_Group_C
 *  - FIFA Training Centre, "Post Match Summary Report — Group C — Argentina v Mexico" (official event data: 86', FERNANDEZ Enzo,
 *    "On Target – Goal", RIGHT FOOT, delivery "Pass"; Messi 63' left foot)   https://www.fifatrainingcentre.com/media/native/world-cup-2022/report_133014.pdf
 *  - The Guardian live blog (Rob Smyth, 26 Nov 2022): "Argentina took a short corner on the left and fed the ball into Fernandez on the left
 *    corner of the area. He beat Gutierrez through sleight of hip, then shaped an extravagant curling shot across goal. It beat the leaping
 *    Ochoa and nestled in the far corner." and "the shimmy"   https://www.theguardian.com/football/live/2022/nov/26/argentina-v-mexico-world-cup-2022-live-score-updates
 *  - The Guardian match report (Nick Ames): "a sumptuous late curler"; "Messi ... passed to Fernández"
 *    https://www.theguardian.com/football/2022/nov/26/argentina-mexico-world-cup-group-c-match-report
 *  - BBC Sport match report: "a superb second with a curling shot into the top corner three minutes from time"
 *    https://www.bbc.com/sport/football/63685898
 * CONFIRMED: 26 November 2022, Lusail Stadium, 22:00 local (night, under the lights), 88,966; Messi had scored (64') for 1–0; the goal in the
 * 87th minute (FIFA: 86') made it 2–0; a short corner on the LEFT; Messi's pass (assist) to Enzo on the LEFT corner of the area; the shimmy
 * past Érick Gutiérrez (No. 14, on since 42'); RIGHT foot; curled across goal into the FAR TOP corner (Wikipedia: top right of the net, i.e.
 * the far side from a shot on the left); Ochoa (No. 13) leaping and beaten. Enzo came on at 57' and wears 24; Messi 10.
 * KIT (Wikipedia kit template for this match): Argentina in the home sky-blue and white stripes, BLACK shorts, WHITE socks; Mexico in their
 * home GREEN shirts, WHITE shorts, RED socks. (Green = the blue plate overprinted with yellow, a riso overprint, see greenShirt().)
 * INFERRED (illustrative, kept out of the narration): who played the short corner (drawn: De Paul) and Messi's touch before the pass; every
 * position and timing between the beats; the shimmy's direction (drawn: a sway of the hips toward the byline, then the ball dragged inside);
 * the exact shot spot (drawn just inside the corner of the area, about 24 m from the far top corner) and the ball's height and bend; Ochoa's
 * start position and which side he leapt (he must go to his left to reach the far corner); the keeper kit (drawn red), the referee's (navy),
 * Mexico's numbers (navy); the other players' spots; which end Argentina attacked and so which side of the main camera the corner was; the
 * celebration; the Lusail bowl, crowd colours, LED boards; the Al Rihla ball print (the group-stage ball); cameras. Enzo is 1.78 m.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; NEVER top-down): 1 = live, the high main-stand
 * camera, near real time, from the short corner to the net; 2 = slow-motion replay from a low camera behind Enzo: Gutiérrez closes, the
 * hip sway (a red arc), the drag inside (a yellow arrow into the space); 3 = replay from behind the goal: the right-foot strike, the ball's
 * bend printed in the air, Ochoa's leap, the far top corner, then round to the celebration; 4 = the lesson from behind the shooter (open the
 * body, the inside of the foot, the curl arrow, the far-corner target, the keeper's reach). All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). Scenes read only (t); every action keys off cue times, so the
 * recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it) and its cue words. `tail` = silence after the last word. Cue words must stay substrings, in
 * order; withTiming matches a cue by its FIRST word (a plain word, never a contraction or a hyphenated word). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The curler, live',text:'Qatar, 2022, the World Cup. Argentina lead Mexico late on. From a short corner, Messi passes to Enzo Fernández. He shimmies, and curls it... into the top corner!',tail:2.4,
  cues:['Qatar','Argentina lead','From a short corner','Messi passes','Enzo Fernández','He shimmies','curls it','into the top corner']},
 {label:'The shimmy',text:'Watch again, slowly. Gutiérrez closes him down. Enzo sways his hips one way, then slips past the other way.',tail:1.3,
  cues:['Watch again','slowly','Gutiérrez closes','Enzo sways','slips past']},
 {label:'The curl',text:'Right foot. The ball bends across goal, past the leaping Ochoa, into the far corner. Argentina win two-nil!',tail:2.2,
  cues:['Right foot','bends across','past the leaping','into the far','Argentina win']},
 {label:'Your turn',text:"Your turn: open your body, and strike with the inside of your foot. Curl the ball towards the far corner, away from the keeper's reach!",tail:2,
  cues:['Your turn','open your body','inside of your foot','Curl the ball','far corner',"away from the keeper's reach"]},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py enzo-fernandez-signature writes timing.json next to
 * script.json). Then add `import timingJson from '../../../public/plays/narration/enzo-fernandez-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/enzo-fernandez-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses) */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('enzo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('enzo: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
function mono(K0:[number,number][]):[number,number][]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,k[1]];});}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Argentina attack +X, Mexico's goal line at X = 105), Y up, Z across
 * (0 = the middle). A player attacking +X has his LEFT at −Z, so the short corner and the left corner of the area are on the −Z side; the
 * main-stand camera sits on that side (Z ≈ −70), so on screen Argentina attack right-to-left and the play is on the near side. */
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

// ---------------------------------------------------------------- Lusail at night: a round bowl, two tiers, the roof ring and its floodlight band
const CX=52.5,NS=64;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.55),y,(43+d)*Math.sign(s)*Math.pow(Math.abs(s),.55)];}
const LOW=(b:number):[number,number]=>[2+22*b,1.6+12*b],UP=(b:number):[number,number]=>[25+22*b,16.5+17*b];
type Bowl={low:V3[][];up:V3[][];roof:V3[][];band:V3[][];seats:{P:V3;h:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],roof:[],band:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.roof.push([rim(a,44,36),rim(b,44,36),rim(b,70,40),rim(a,70,40)]);
  o.band.push([rim(a,44,34.4),rim(b,44,34.4),rim(b,44,36.2),rim(a,44,36.2)]);
  o.lamps.push(rim(a+.5/NS*TAU,44,35.3));
  for(const [f,rows] of [[LOW,9],[UP,8]] as [(u:number)=>[number,number],number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+rows*500,23);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** the night sky, the bowl, the crowd (roar lifts the marks; flash = phone lights and camera flashes). Argentina's sky blue and white fill
 * most of the bowl; Mexico's green (blue × yellow) in big blocks; some red and gold. */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.fill(K,rectPath(-1e4,-1e4,2e4,2e4),.92);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const low=new Path2D(),up=new Path2D(),roof=new Path2D(),band=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.band[i],band);}
 s.knockout(low,.8);s.tone(B,low,.5);s.tone(K,low,.3);
 s.knockout(up,.8);s.tone(B,up,.45);s.tone(K,up,.45);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.4*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.4?0:q.h<.64?1:q.h<.86?2:q.h<.93?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.8);s.fill(B,inks[1],.6);s.fill(Y,inks[2],.9);s.fill(B,inks[2],.75);s.fill(R,inks[3],.8);s.fill(Y,inks[4],.85);
 s.knockout(roof);s.tone(K,roof,.7);s.tone(B,roof,.5);
 s.knockout(band);s.fill(Y,band,.55);
 const lamps=new Path2D();for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=clamp(c.F*.9/d[2],3,16);lamps.addPath(polyPath(blob(g[0],g[1],z,z*.55,3,{amp:.05,n:10}),true));}
 s.knockout(lamps);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** grass under floodlights (yellow × blue, a navy night screen), mowing stripes, LED boards, paper lines, both goals (Mexico's goal at
 * X = 105 is drawn later when the camera sits behind it) */
function ground(s:Sheet,c:Cam,o:{goalLater?:boolean;bulge?:number}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.5);s.tone(K,p,.35);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,37],[109,0,37],[109,.9,37],[-4,.9,37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,36.95],[x+3.4,.25,36.95],[x+3.4,.65,36.95],[x,.65,36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.9);s.tone(K,bd,.2);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 // the corner arc the short corner is taken from
 circ(105,-34,1,Math.PI/2,Math.PI,5);
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,NET[2]);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.32);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
/** Argentina: sky-blue (blue screen) and white stripes, black shorts (navy), white socks — all confirmed by the match kit template */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],pattern:'stripes',patternInk:'paper',shorts:K,socks:'paper',boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:K,seed:3,...o});
/** Mexico: the home kit — green shirt (the blue plate here; greenShirt() overprints yellow on it), white shorts, red socks (kit template) */
const MEX=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.9],shorts:'paper',socks:[R,.9],boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:K,seed:5,...o});
/** Enzo Fernández, 1.78 m, No. 24, dark hair worn long on top (playerAppearance: skin 1, medium hair), light skin */
const ENZO:AthleteStyle=ARG({number:24,skin:SKIN_L,hair:[K,.95],hairStyle:'long',build:{height:1.78,bulk:1,thighs:1.04},seed:24});
/** Guillermo Ochoa, No. 13, curly dark hair — keeper kit colours INFERRED (drawn red), paper gloves */
const OCHOA:AthleteStyle={shirt:[R,.85],shorts:[R,.85],socks:[R,.85],boots:K,trim:K,skin:SKIN_M,hair:[K,.95],hairStyle:'curly',line:K,shade:[K,.3],gloves:'paper',sleeves:'long',number:13,numberInk:K,build:{height:1.85},seed:13};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'bald',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion); smear = a halftone echo + speed lines for fast limbs; green = Mexico's shirt. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean;green?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
 if(o.green)greenShirt(s,r);
 return r;
}
/** Mexico's green: a yellow screen overprinted on the blue shirt (blue × yellow = green, the riso way) over the torso and short sleeves,
 * built from the solved joints (hull of neck, shoulders, upper arms and the waist, pushed out a little). Figures drawn later (nearer)
 * knock it out where they overlap, so it stays inside the painter's order. One op. */
function greenShirt(s:Sheet,r:DrawResult){
 const j=r.joints,P=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
 const pts:Pt[]=[j.neck,j.lSh,j.rSh,P(j.lSh,j.lEl,.5),P(j.rSh,j.rEl,.5),P(j.lSh,j.lHip,.84),P(j.rSh,j.rHip,.84),P(j.neck,j.pelvis,.86)];
 const tl=Math.hypot(j.neck[0]-j.pelvis[0],j.neck[1]-j.pelvis[1]);if(tl<2)return;
 const hull=hull2(pts),cx=hull.reduce((a,p)=>a+p[0],0)/hull.length,cy=hull.reduce((a,p)=>a+p[1],0)/hull.length,w=tl*.1;
 s.fill(Y,polyPath(hull.map(p=>{const dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1;return[p[0]+dx/l*w,p[1]+dy/l*w] as Pt;}),true),.9);
}
function hull2(p:Pt[]):Pt[]{const a=p.slice().sort((u,v)=>u[0]-v[0]||u[1]-v[1]),cr=(o:Pt,u:Pt,v:Pt)=>(u[0]-o[0])*(v[1]-o[1])-(u[1]-o[1])*(v[0]-o[0]),lo:Pt[]=[],hi:Pt[]=[];
 for(const q of a){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=a.length-1;i>=0;i--){const q=a[i];while(hi.length>1&&cr(hi[hi.length-2],hi[hi.length-1],q)<=0)hi.pop();hi.push(q);}
 return lo.slice(0,-1).concat(hi.slice(0,-1));}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds from Enzo's first touch)
type Role='enzo'|'arg'|'mex'|'gk'|'ref';
type Move={kind:'lunge'|'pass'|'dive';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** the beats: the short corner, Messi's pass (left foot), Enzo's first touch (τ 0), the sway, the drag inside, the strike, the net */
const T_CORNER=-3.3,T_RECV=-2.45,T_PASS=-1.05,SWAY=.95,DRAG=1.3,SET=1.78,SHOT=2.2,FLIGHT=1.02,IN_NET=SHOT+FLIGHT;
const ACTORS:Actor[]=[
 {name:'Enzo',role:'enzo',style:ENZO,key:true,keys:[[-6.5,86.2,-22.8],[-3,86.6,-22.4],[-1.4,87.3,-21.6],[0,88.7,-20.1],[.5,89.2,-19.6],[SWAY,89.3,-19.5],[DRAG,89.25,-18.8],[SET,89.05,-17.4],[SHOT,89.0,-16.9],[2.7,89.6,-16.6],[3.6,91.2,-17.4],[5,93.6,-21],[7,96,-26.5],[9,97.8,-30.5]]},
 {name:'Messi',role:'arg',style:ARG({number:10,build:{height:1.7},hair:[K,.95],seed:30}),key:true,moves:[{kind:'pass',at:T_PASS,dur:.8,side:'l',power:.3}],
  keys:[[-6.5,99.2,-27.5],[-4,99.8,-28.6],[T_RECV,100.3,-29.4],[T_PASS,100,-29.1],[0,99.2,-28],[3,98,-25.5],[6,97,-27],[9,97.6,-30]]},
 {name:'Gutiérrez',role:'mex',style:MEX({number:14,seed:14}),key:true,engage:[-.6,2.2],moves:[{kind:'lunge',at:SWAY+.18,dur:.8,side:'r'}],
  keys:[[-6.5,95.2,-13],[-3,95,-13.4],[-1.4,94,-14.6],[0,92.1,-16.9],[.6,91,-18.2],[SWAY,90.7,-18.6],[DRAG+.1,90.75,-19.3],[SET+.1,90.8,-18.9],[SHOT+.2,91.2,-18.1],[4,92.4,-16.8],[9,93.4,-16]]},
 {name:'Ochoa',role:'gk',style:OCHOA,key:true,moves:[{kind:'dive',at:SHOT+.9,dur:.95,side:'l'}],keys:[[-6.5,104.3,-2.4],[-2,104.1,-2.8],[0,104,-1.9],[SHOT,104.1,-1.2],[9,104.1,-1.2]]},
 {name:'De Paul',role:'arg',style:ARG({number:7,hairStyle:'long',seed:7}),moves:[{kind:'pass',at:T_CORNER,dur:.8,side:'r',power:.25}],keys:[[-6.5,105.6,-34.6],[T_CORNER,105.4,-34.4],[-1,103.5,-32],[3,101.5,-28.5],[9,99,-30]]},
 {name:'Alvarado',role:'mex',style:MEX({number:25,seed:25}),keys:[[-6.5,98,-25],[T_RECV,98.6,-27],[0,97.4,-25],[3,96.5,-22.5],[9,96,-24]]},
 {name:'Montes',role:'mex',style:MEX({number:3,build:{height:1.91},seed:3}),keys:[[-6.5,99.5,-5],[0,99.6,-6.2],[SHOT,99.2,-7.4],[9,99.3,-7]]},
 {name:'Moreno',role:'mex',style:MEX({number:15,seed:15}),keys:[[-6.5,98.5,2],[0,98.8,.5],[SHOT,98.5,-1],[9,98.6,-.5]]},
 {name:'Araujo',role:'mex',style:MEX({number:2,build:{height:1.88},seed:2}),keys:[[-6.5,101,-10],[0,100.5,-11.4],[SHOT,100.1,-12.4],[9,100.3,-12]]},
 {name:'Gallardo',role:'mex',style:MEX({number:23,seed:23}),keys:[[-6.5,102.6,-17],[0,101.4,-18.3],[SHOT,100.8,-18.6],[9,101,-18.2]]},
 {name:'Chávez',role:'mex',style:MEX({number:24,seed:124}),keys:[[-6.5,93.6,-7],[0,93.4,-9.4],[SHOT,93,-10.8],[9,93.2,-10]]},
 {name:'Herrera',role:'mex',style:MEX({number:16,seed:16}),keys:[[-6.5,94,5],[0,94.2,3.4],[SHOT,94,1.8],[9,94.4,2.4]]},
 {name:'Álvarez',role:'arg',style:ARG({number:9,build:{height:1.7},seed:9}),keys:[[-6.5,100.6,-3],[0,100.9,-4.2],[SHOT,100.7,-5],[9,99.6,-12]]},
 {name:'Otamendi',role:'arg',style:ARG({number:19,build:{height:1.83},seed:19}),keys:[[-6.5,100.2,1.5],[0,100.4,.2],[SHOT,100.3,-.8],[9,98.5,-8]]},
 {name:'Romero',role:'arg',style:ARG({number:13,build:{height:1.85},seed:13}),keys:[[-6.5,97.2,6],[0,97.4,4.6],[SHOT,97.3,3.8],[9,96.2,-4]]},
 {name:'Palacios',role:'arg',style:ARG({number:14,seed:14}),keys:[[-6.5,91.5,-1.5],[0,91.8,-3],[SHOT,91.6,-4],[9,93.5,-12]]},
 {name:'Jiménez',role:'mex',style:MEX({number:9,build:{height:1.9},seed:9}),keys:[[-6.5,84,-4],[0,85,-6],[SHOT,85.5,-7],[9,86,-8]]},
 {name:'Molina',role:'arg',style:ARG({number:26,hairStyle:'long',seed:26}),keys:[[-6.5,80,12],[0,80.6,10.4],[SHOT,81,9],[9,86,-2]]},
 {name:'referee',role:'ref',style:REF,keys:[[-6.5,84,-9],[0,84.6,-11],[SHOT,84.8,-12],[9,86.5,-15]]},
];
const EN=0,MESSI=1,GUT=2,GK=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-6.5,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: corner, Messi, the pass, the shimmy touches, the curl
/** the far top corner the curl finishes in (inside the far post, under the bar) and where it drops in the net */
const NET:V3=[105.35,2.02,3.02],REST:V3=[106.3,.11,2.7];
const CORNER:V3=[104.75,.11,-33.75];
/** the shot: the ball leaves his right boot here; the curl bends right-to-left (inside of the right foot) from a line aimed outside the far
 * post back into the far top corner — a quadratic curve on the ground plane with a rising-then-dipping height */
const SHOT_FROM:V3=[89.72,.11,-16.02];
const CURL:Pt=(()=>{const dx=NET[0]-SHOT_FROM[0],dz=NET[2]-SHOT_FROM[2],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l;return[(SHOT_FROM[0]+NET[0])/2+rx*3.1,(SHOT_FROM[2]+NET[2])/2+rz*3.1];})();
function curlAt(u:number):V3{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*SHOT_FROM[0]+b*CURL[0]+c*NET[0],.11+(NET[1]-.11)*u+4.2*u*(1-u),a*SHOT_FROM[2]+b*CURL[1]+c*NET[2]];}
const yawEN=(tau:number)=>{const[x,z]=posOf(EN,tau);if(tau<0){const b=ballAt(tau);return yawOf(b[0]-x,b[2]-z);}
 const g=yawOf(NET[0]-x,NET[2]-z),aim=yawOf(CURL[0]-SHOT_FROM[0],CURL[1]-SHOT_FROM[2]);return lerpA(g,aim,sm(SET-.3,SHOT-.2,tau));};
/** Enzo's ball spot for his right foot: ahead and a touch to his right */
const footAt=(tau:number):[number,number]=>{const p=posOf(EN,tau),y=yawEN(Math.max(0,tau)),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)];return[p[0]+f[0]*.5+r[0]*.14,p[1]+f[1]*.5+r[1]*.14];};
const messiFoot=(tau:number):V3=>{const[x,z]=posOf(MESSI,tau);return[x+.35,.11,z+.35];};
const RECV:V3=messiFoot(T_RECV),PASS0:V3=messiFoot(T_PASS);
const E0:V3=(()=>{const f=footAt(0);return[f[0],.11,f[1]];})(),E1:V3=(()=>{const f=footAt(DRAG);return[f[0],.11,f[1]];})(),E2:V3=(()=>{const f=footAt(SET);return[f[0],.11,f[1]];})();
/** a ground roll from a to b over u ∈ [0,1], slowing down (dec = how much) */
const roll=(a:V3,b:V3,u:number,dec=.5):V3=>{const x=clamp(u);return lerp3(a,b,x*(1+dec)-dec*x*x);};
function ballAt(tau:number):V3{
 if(tau<T_CORNER)return CORNER;
 if(tau<T_RECV)return roll(CORNER,RECV,(tau-T_CORNER)/(T_RECV-T_CORNER),.6);
 if(tau<T_PASS)return roll(RECV,PASS0,(tau-T_RECV)/(T_PASS-T_RECV),.8);
 if(tau<0)return roll(PASS0,E0,(tau-T_PASS)/-T_PASS,.35);
 if(tau<DRAG)return roll(E0,E1,sm(.35,DRAG,tau,linear),.9);
 if(tau<SET)return roll(E1,E2,(tau-DRAG)/(SET-DRAG),.7);
 if(tau<SHOT)return roll(E2,SHOT_FROM,(tau-SET)/(SHOT-SET),.5);
 if(tau<IN_NET)return curlAt((tau-SHOT)/FLIGHT);
 const u=clamp((tau-IN_NET)/.55),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],u*u),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (degrees via posed; athlete.ts clamps to real range of motion)
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:28,lKnee:40,rKnee:38,lHipA:8,rHipA:8,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** receiving Messi's pass: open to the ball, knees soft, arms out */
const RECEIVE:Partial<Pose>={lean:12,lKnee:34,rKnee:30,lShA:38,rShA:34,lElb:40,rElb:40,neckP:12};
/** the shimmy: the hips and shoulders sway to his LEFT (toward the byline), weight on the left leg, the right arm out — the fake */
const SWAYP:Partial<Pose>={dz:-.32,roll:-14,bend:-14,twist:-12,lean:18,lKnee:58,rKnee:30,lHipA:14,rHipA:22,lShA:26,rShA:70,rElb:30,neckY:10,squash:-.05};
/** the drag back inside: the right foot rakes the ball across to his right, the body follows */
const DRAGP:Partial<Pose>={dz:.18,roll:10,bend:8,twist:10,lean:16,rHipA:26,rHipF:24,rKnee:40,lKnee:50,lShA:56,rShA:34,neckY:-8};
/** opening the body before the curl: the standing foot planted wide, hips turned toward the far post, arm out for balance */
const OPEN:Partial<Pose>={lShA:70,lShF:20,twist:-10,roll:-8,neckY:-6};
const SHOT_D=.82;
let _shift:[number,number]|null=null;
function enShift():[number,number]{if(_shift)return _shift;const[x,z]=posOf(EN,SHOT),yaw=yawEN(SHOT),sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.6}),ENZO.build,{x,z,yaw});
 return _shift=[SHOT_FROM[0]-lerp(sk.rToe[0],sk.rAn[0],.4),SHOT_FROM[2]-lerp(sk.rToe[2],sk.rAn[2],.4)];}
function placeOf(k:number,tau:number,yaw:number):Place{const[x,z]=posOf(k,tau);if(k===EN){const d=enShift(),w=sm(SHOT-.6,SHOT-.2,tau)*(1-sm(SHOT+.5,SHOT+1,tau));return{x:x+d[0]*w,z:z+d[1]*w,yaw};}return{x,z,yaw};}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(EN,tau),b=ballAt(tau);
 let yaw=sp>.6?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(-1,-.35),sm(SHOT,SHOT+.4,tau));
 if(a.role==='mex'&&!a.engage&&sp<1.2)yaw=yawOf(b[0]-x,b[2]-z);
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.3):a.role==='mex'?READY:stand();
 if(k===EN){
  yaw=yawEN(tau);
  const s=clamp((sp-1)/4),run=runCycle(distOf(EN,tau)/3.2,{speed:.3+.5*s}),dr=dribble(distOf(EN,tau)/1.6,{foot:'r',speed:.35});
  p=blendPose(stand(),tau<0?run:dr,clamp((sp-.25)/.7));
  if(tau<.5)p=over(p,RECEIVE,bump(-1,.5,tau));
  p=over(p,SWAYP,bump(.45,DRAG,tau));
  p=over(p,DRAGP,bump(DRAG-.2,SET+.05,tau));
  p=over(p,OPEN,bump(SET-.1,SHOT+.1,tau)*.8);
  const u=(tau-(SHOT-STRIKE_CONTACT*SHOT_D))/SHOT_D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.6}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));
  return{p,yaw};}
 if(a.role==='mex'&&sp>.5&&Math.cos(yawOf(v[0],v[1])-yaw)<-.3)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='pass'?STRIKE_CONTACT:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='pass'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.3}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:1});}}
 // the pass-takers face where the ball goes
 if(k===MESSI&&tau>T_RECV-.3&&tau<T_PASS+.3)yaw=yawOf(E0[0]-x,E0[2]-z);
 if(a.name==='De Paul'&&tau<T_CORNER+.4)yaw=yawOf(RECV[0]-x,RECV[2]-z);
 if(a.role==='arg'&&k!==EN&&tau>IN_NET+.4)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+.9,tau));
 if(a.role==='mex'&&k!==GUT&&tau>IN_NET+.4)p=over(p,{neckP:40,lean:26,lShA:10,rShA:10,lElb:20,rElb:20},sm(IN_NET+.4,IN_NET+1.2,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: Al Rihla (paper, colour triads, navy key)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.35);
 const pa=new Path2D(),pb=new Path2D(),tri=(cx:number,cy:number,pr0:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr0,cy+Math.sin(a)*pr0],[cx+Math.cos(b)*pr0*.4,cy+Math.sin(b)*pr0*.4]);}return polyPath(q,true);};
 pa.addPath(tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;(i%2?pa:pb).addPath(tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(R,pa,.85);s.fill(B,pb,.8);s.fill(Y,pb,.5);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;gk?:DrawResult};
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const pl=placeOf(k,tau,0),x=pl.x!,z=pl.z!,q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,gkR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],px=e.h*ppu,big=e.h>=300;
  const q=poseOf(e.k,tauP),qp=poseOf(e.k,tauPrev),place={...placeOf(e.k,tauP,q.yaw),x:e.x,z:e.z},prevPlace=placeOf(e.k,tauPrev,qp.yaw);
  const detail=passing?(e.k===EN?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const fast=(e.k===EN&&((tauP>SWAY-.4&&tauP<SET)||(tauP>SHOT-.4&&tauP<SHOT+.3)))||(e.k===GK&&tauP>SHOT+.5&&tauP<IN_NET+.3)||(e.k===GUT&&tauP>SWAY-.2&&tauP<SWAY+.5);
  const r=drawPlayer(s,q.p,c,{...a.style,shadow:e.h<420?false:undefined,detail},place,{...(big&&!passing?{prev:qp.p,prevPlace,smear:hero&&fast}:{}),green:a.role==='mex'});
  if(e.k===EN)heroR=r;if(e.k===GK)gkR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,gk:gkR};
 o.after?.(out);
 return out;
}
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks
/** a ring on the grass round a ground point (w = grow/fade) */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,w:number,ink:string,seed:number){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*rx*w,.02,z+Math.sin(i/36*TAU)*rz*w]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(9,c.F*.06/toCam(c,[x,0,z])[2]),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9);s.fill(ink,rr,.95);}
/** the ball's flight printed in the air from u0 to u1 of the curl (0 = the boot, 1 = the far corner) */
function curlTrail(s:Sheet,c:Cam,u0:number,u1:number,w:number,ink:string,seed:number,arrow=false){if(w<=0||u1<=u0+.01)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=28;i++){const q=toCam(c,curlAt(lerp(u0,u1,i/28)));if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(13,c.F*.09/d);
 s.knockout(ribbon(pts,wd*1.7,{seed,taper:.2,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{seed,taper:.2,wobble:.8}),.95*w);
 if(arrow){const a=pts[pts.length-3],b=pts[pts.length-1];laneArrow(s,ink,a,b,wd,{seed:seed+1,head:wd*3.2,cov:.95*w});}}
/** a target in the goal mouth at the far top corner (rings in the goal plane) */
function cornerTarget(s:Sheet,c:Cam,w:number,seed:number){if(w<=0)return;for(const [rad,ink] of [[.62,R],[.3,Y]] as [number,string][]){const pts:Pt[]=[];for(let i=0;i<30;i++){const q=pr(c,[105.02,NET[1]+Math.sin(i/30*TAU)*rad*w,NET[2]+Math.cos(i/30*TAU)*rad*w]);if(q)pts.push(q);}
 if(pts.length<24)continue;const d=toCam(c,[105,NET[1],NET[2]])[2],rr=ribbon(pts,Math.max(10,c.F*.05/d),{close:true,seed:seed+rad*10,taper:0,wobble:1});s.knockout(rr,.9);s.fill(ink,rr,.95);}}
/** the keeper's reach: a half-disc in the goal mouth around his standing spot — the curl stays outside it */
function reachZone(s:Sheet,c:Cam,w:number,seed:number){if(w<=0)return;const[gx,gz]=posOf(GK,SHOT),R0=2.7*w,pts:Pt[]=[];
 for(let i=0;i<=24;i++){const a=i/24*Math.PI,q=pr(c,[gx+.3,Math.sin(a)*R0,gz+Math.cos(a)*R0]);if(q)pts.push(q);}
 if(pts.length<20)return;const d=toCam(c,[gx,1,gz])[2],area=polyPath(pts,true);s.tone(R,area,.3*w);
 const rr=ribbon(pts,Math.max(10,c.F*.05/d),{seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(R,rr,.95*w);}
/** an arrow on the grass from Enzo toward a ground point */
function groundArrow(s:Sheet,c:Cam,from:[number,number],to:[number,number],w:number,seed:number,ink=Y,len=1){if(w<=0)return;const dx=to[0]-from[0],dz=to[1]-from[1],l=Math.hypot(dx,dz)||1;
 const a=pr(c,[from[0]+dx/l*.6,.02,from[1]+dz/l*.6]),b=pr(c,[from[0]+dx/l*(.6+len),.02,from[1]+dz/l*(.6+len)]);if(!a||!b)return;const wd=Math.max(12,c.F*.14/toCam(c,[from[0],0,from[1]])[2]);
 s.knockout(ribbon([a,b],wd*1.6,{seed,taper:.1}),.8*w);laneArrow(s,ink,a,b,wd,{progress:w,seed:seed+1,head:wd*3});}
/** a ring round a sheet point (the right boot) */
function bootRing(s:Sheet,hero:DrawResult|undefined,w:number,seed:number){if(!hero||w<=0)return;const toe=hero.joints.rToe,an=hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*w+3,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.85]);}
 s.knockout(ribbon(pts,Math.max(5,r*.3),{seed,close:true,taper:0,wobble:.8}),.8*w);s.fill(R,ribbon(pts,Math.max(3,r*.18),{seed,close:true,taper:0,wobble:.8}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const ms=CUEW(0,'Messi passes'),en=CUEW(0,'Enzo'),hs=CUEW(0,'He shimmies'),ci=CUEW(0,'curls it'),it=CUEW(0,'into the top'),S=SECS(0);
 return key(t,mono([[0,T0+.2],[CUEW(0,'From a short')-.1,T_CORNER-.15],[ms,T_PASS-.05],[en,.05],[hs,.55],[ci,SHOT-.05],[it,IN_NET-.1],[S+1,IN_NET-.1+(S+1-it)]]),linear);};
const CAM1:V3=[82,23,-72];
function cam1(t:number):Cam{
 const tau=tau1(t),it=CUEW(0,'into the top'),bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3-1.5,1.1,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[80,8,-4],fs=CUEW(0,'From a short'),toBall=sm(CUEW(0,'Argentina')-.2,fs,t,easeInOutSine),m=posOf(EN,tau),cel:V3=[m[0]+1,1.1,m[1]],toE=sm(it+.7,it+1.9,t,easeInOutSine);
 const gl:V3=[98,1.1,-9],toGoal=sm(CUEW(0,'curls it')-.4,it,t,easeInOutSine)*(1-toE);
 const T=lerp3(lerp3(lerp3(open,bt,toBall),gl,toGoal),cel,toE);
 const F=key(t,[[0,1300],[CUEW(0,'Argentina'),1700],[fs,4800],[CUEW(0,'Enzo'),5600],[CUEW(0,'He shimmies'),5900],[CUEW(0,'curls it'),4700],[it+.4,4700],[it+1.9,6000],[SECS(0),6200]],easeInOutSine);
 return look(CAM1,T,F);}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),ar=CUEW(0,'Argentina'),en=CUEW(0,'Enzo');
  // "Argentina lead": the sky-blue end of the crowd lifts; "into the top corner": the whole bowl roars and flashes
  stadium(s,c,v,t,{roar:Math.max(.5*bump(ar-.1,ar+1.4,t),sm(IN_NET,IN_NET+.5,tau)),flash:Math.max(.5*bump(ar,ar+1.2,t),sm(IN_NET+.1,IN_NET+.4,tau))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // "Enzo Fernández": a yellow ring pops under him as the pass arrives
  const m=posOf(EN,tau);groundRing(s,c,m[0],m[1],1.1,1.1,sm(en-.1,en+.3,t,easeOutBack)*(1-sm(en+1.2,en+1.6,t)),Y,5);
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(EN,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:7,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a low camera behind Enzo: the shimmy
const tau2=(t:number)=>{const gc=CUEW(1,'Gutiérrez'),es=CUEW(1,'Enzo sways'),sp=CUEW(1,'slips past'),S=SECS(1);
 return key(t,mono([[0,-.9],[CUEW(1,'slowly'),-.55],[gc,-.1],[es,.5],[es+.9,SWAY+.1],[sp,DRAG+.02],[sp+1.1,SET],[S,SET+.22]]),linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(EN,tau),g=posOf(GUT,tau),push=sm(CUEW(1,'Gutiérrez')-.3,CUEW(1,'Enzo sways'),t,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine);
 const mid:[number,number]=[(m[0]+g[0])/2,(m[1]+g[1])/2];
 const C:V3=[mid[0]-8.6-2*open+1.2*push,1.55+.4*open,mid[1]-4.4-1.2*open+.6*push],T:V3=[mid[0]+.4,.85,mid[1]+.5];
 return look(C,T,2500+450*push-400*open);}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),gc=CUEW(1,'Gutiérrez'),es=CUEW(1,'Enzo sways'),sp=CUEW(1,'slips past'),S=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const m=posOf(EN,tau),g=posOf(GUT,tau);
  // "Gutiérrez closes him down": a red arrow on the grass from Gutiérrez to Enzo
  groundArrow(s,c,g,m,sm(gc-.1,gc+.5,t,easeOut)*(1-sm(es+.2,es+.6,t)),31,R,Math.max(.3,Math.hypot(m[0]-g[0],m[1]-g[1])-1.4));
  // "slips past him the other way": a yellow arrow into the space inside, and a ring where the space is
  const sw=sm(sp-.15,sp+.45,t,easeOut)*(1-sm(S-.8,S-.4,t));
  groundArrow(s,c,[E1[0],E1[2]],[SHOT_FROM[0],SHOT_FROM[2]+1.5],sw,41,Y,3.2);
  groundRing(s,c,SHOT_FROM[0]-.2,SHOT_FROM[2]+.4,1.2,1.2,sm(sp+.3,sp+.8,t,easeOutBack)*(1-sm(S-.8,S-.4,t)),Y,43);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "Enzo sways his hips one way": a red arc over his hips, sweeping toward the fake side
   const hw=sm(es-.05,es+.35,t,easeOutBack)*(1-sm(sp-.1,sp+.2,t));
   if(hero&&hw>0){const hp=hero.joints.pelvis,lh=hero.joints.lHip,rh=hero.joints.rHip,dx=lh[0]-rh[0],dy=lh[1]-rh[1],L=Math.max(10,Math.hypot(dx,dy)*1.9),ux=dx/(Math.hypot(dx,dy)||1),uy=dy/(Math.hypot(dx,dy)||1);
    const pts:Pt[]=[];for(let i=0;i<=16;i++){const a=-.9+1.8*i/16,k=L*(1.1+.25*Math.cos(a*1.7));pts.push([hp[0]+ux*k*Math.sin(a*.8)*1.3,hp[1]-L*.35-k*.35*Math.cos(a)+uy*k*Math.sin(a*.8)*.6]);}
    const a=pts[pts.length-3],b=pts[pts.length-1];s.knockout(ribbon(pts,L*.26,{seed:51,taper:.1}),.85*hw);s.fill(R,ribbon(pts,L*.15,{seed:51,taper:.1}),.95*hw);laneArrow(s,R,a,b,L*.15,{seed:52,head:L*.42,cov:.95*hw});}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the right-foot curl past Ochoa
const tau3=(t:number)=>{const rf=CUEW(2,'Right foot'),ba=CUEW(2,'bends across'),pl=CUEW(2,'past the leaping'),iff=CUEW(2,'into the far'),tn=CUEW(2,'Argentina win'),S=SECS(2);
 return key(t,mono([[0,SHOT-.85],[rf,SHOT-.2],[rf+.6,SHOT],[ba,SHOT+.12],[pl,SHOT+.75],[iff,IN_NET-.05],[tn,IN_NET+.6],[S,IN_NET+.6+(S-tn)*.9]]),linear);};
const swing3=(t:number)=>sm(CUEW(2,'Argentina win')-.1,CUEW(2,'Argentina win')+1.1,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(EN,tau),u=swing3(t),rf=sm(CUEW(2,'Right foot')-.4,CUEW(2,'bends across'),t,easeInOutSine);
 const C0:V3=[112.5,5.2,12.5],T0:V3=[lerp(93,97.5,rf),lerp(1,1.3,rf),lerp(-12,-4.5,rf)];
 const C1:V3=[m[0]+7.5,2.4,m[1]+6.5],T1:V3=[m[0]-.5,1.3,m[1]-1];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2500-350*rf,2500,u));}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),rf=CUEW(2,'Right foot'),ba=CUEW(2,'bends across'),pl=CUEW(2,'past the leaping'),iff=CUEW(2,'into the far'),tn=CUEW(2,'Argentina win'),u=swing3(t),S=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(tn-.2,tn+.3,t)});
  ground(s,c,{goalLater:u<.5});
  // "bends across goal": the ball's path printed in the air behind it as it curls
  const fl=clamp((tau-SHOT)/FLIGHT);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({hero,gk})=>{
   curlTrail(s,c,0,fl,sm(ba-.2,ba+.1,t)*(1-sm(tn,tn+.6,t)),Y,61);
   // "Right foot": a ring round his right boot as it swings through
   bootRing(s,hero,sm(rf-.1,rf+.25,t,easeOutBack)*(1-sm(ba,ba+.3,t)),82);
   // "past the leaping Ochoa": a red spark at his outstretched glove as the ball flies beyond it
   if(gk){const hw=bump(pl-.1,pl+.9,t);if(hw>0){const hnd=gk.joints.lHa;sparkBurst(s,R,hnd[0],hnd[1],Math.max(14,gk.heightPx*.18),{n:7,seed:71,g:hw,width:Math.max(4,gk.heightPx*.03)});}}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  // "into the far corner": a spark and rings in the far top corner
  const cw=sm(iff-.15,iff+.25,t,easeOutBack)*(1-sm(tn+.2,tn+.6,t));
  if(cw>0){const q=pr(c,[105,NET[1],NET[2]]);if(q){const d=toCam(c,NET)[2];sparkBurst(s,Y,q[0],q[1],c.F*1.1/d,{n:10,seed:75,g:cw,width:Math.max(6,c.F*.08/d)});}}
  // "Argentina win two-nil!": sky-blue and white paper ribbons over the frame
  const zw=sm(tn-.1,tn+.5,t)*(1-sm(S-.5,S,t)*.3);if(zw>0){const fall=(t-tn)*240;confetti(s,[B,'paper',Y],[-v.hx,-v.hy-400+fall,2*v.hx,2*v.hy],Math.round(80*zw),73,{size:42,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(EN,tau3(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.2/q[2]),12);},
 still:2,
};

// ---------------------------------------------------------------- 4 · the lesson: from behind the shooter, looking at the far corner
const tau4=(t:number)=>{const S=SECS(3),ob=CUEW(3,'open your body'),ins=CUEW(3,'inside'),cb=CUEW(3,'Curl the ball'),aw=CUEW(3,'away from');
 return key(t,mono([[0,SET-.25],[ob,SET],[ins,SHOT-.02],[ins+.8,SHOT+.02],[cb,SHOT+.1],[aw,SHOT+.55],[aw+1,IN_NET-.05],[S,IN_NET+.2]]),linear);};
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(EN,Math.min(tau,SHOT)),push=sm(CUEW(3,'open')-.3,CUEW(3,'inside')+.4,t,easeInOutSine),out=sm(CUEW(3,'Curl the ball')-.3,CUEW(3,'far corner'),t,easeInOutSine);
 const C:V3=[m[0]-5.2+1.2*push-1.5*out,1.75+.5*out,m[1]-4.6+1*push-1*out],T0:V3=[m[0]+1.5,.8,m[1]+1.2],T1:V3=[101.5,1.4,-2];
 return look(C,lerp3(T0,T1,out),lerp(2400+500*push,2900,out));}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),ob=CUEW(3,'open your body'),ins=CUEW(3,'inside'),cb=CUEW(3,'Curl the ball'),fc=CUEW(3,'far corner'),aw=CUEW(3,'away from'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  const m=posOf(EN,Math.min(tau,SHOT));
  // "open your body": a yellow arrow on the grass from his planted foot toward the far post (the line his hips open to)
  groundArrow(s,c,m,[105,3.66],sm(ob-.1,ob+.5,t,easeOut)*(1-sm(ins+.4,ins+.8,t)),91,Y,4.5);
  // "away from the keeper's reach": the red half-disc he can reach, the curl outside it
  reachZone(s,c,sm(aw-.1,aw+.45,t,easeOutBack)*(1-sm(E-.6,E-.2,t)),95);
  // "far corner": the target rings in the far top corner
  cornerTarget(s,c,sm(fc-.1,fc+.4,t,easeOutBack)*(1-sm(E-.6,E-.2,t)),97);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "inside of your foot": a ring round the right boot at contact
   bootRing(s,hero,sm(ins-.1,ins+.3,t,easeOutBack)*(1-sm(cb-.1,cb+.3,t)),93);
   // "Curl the ball": the whole bend printed ahead as a yellow arrow (it starts outside the far post and bends back in)
   curlTrail(s,c,0,1,sm(cb-.1,cb+.4,t)*(1-sm(E-.6,E-.2,t)),Y,99,true);}});
 },
 still:4,
};

const film:RisoStory={
 id:'enzo-fernandez-signature',format:'11v11',title:"Enzo Fernández's curler",theme:'Curl the ball towards the far corner, away from the keeper’s reach',
 ageNote:'World Cup group stage, Argentina v Mexico, Lusail Stadium, Qatar, 26 November 2022. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a flick of turf and a spark where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
/** Solved contacts (pitch metres; Mexico's goal line at X = 105) — checked by the film test. */
export const FACTS={SHOT_FROM,NET,CURL,SHOT,IN_NET,ballAt,curlAt,enRightToeAt:(tau:number)=>{const q=poseOf(EN,tau);return solve(q.p,ENZO.build,placeOf(EN,tau,q.yaw)).rToe;},
 posOf:(name:string,tau:number)=>posOf(ACTORS.findIndex(a=>a.name===name),tau),ochoaReachAt:(tau:number)=>{const q=poseOf(GK,tau),sk=solve(q.p,OCHOA.build,placeOf(GK,tau,q.yaw));return[sk.lHa,sk.rHa];}};
