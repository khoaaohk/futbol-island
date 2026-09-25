/** Lautaro Martínez — Signature: the swivel-and-shoot finish. An iconic-play riso film (RisoStory, chapters mode), recreated from written
 * accounts (we cannot watch the footage) and printed as a riso sheet.
 *
 * THE MOMENT: the Copa América 2024 final, Argentina 1–0 Colombia after extra time, Hard Rock Stadium, Miami Gardens, 14 July 2024 — his
 * winning goal in the 112th minute. WHY THIS MOMENT: it is his most famous and best-documented goal, and it shows the heart of the card's
 * lesson ("shoot before the defender can block"): he escaped Carlos Cuesta and shot at once. HONEST NOTE: no source we could read calls
 * this goal a swivel — it is a run onto a through ball and a quick finish, not a back-to-goal turn. So chapters 1–3 recreate the real goal
 * only, and the swivel itself appears only in the lesson (chapter 4), openly as a demonstration ("His favourite finish is a quick turn
 * and shot... Your turn"), never presented as this goal.
 *
 * SOURCES (cached under scratchpad/films/src-cache, read 23 Sep 2026):
 *  - Wikipedia, "2024 Copa América final" (raw wikitext: result, venue, date, the kick-off delay, the match summary, line-ups, numbers,
 *    substitutions and the kit templates) https://en.wikipedia.org/wiki/2024_Copa_Am%C3%A9rica_final
 *    (it cites CNN, "Argentina wins Copa América in Miami final marred by chaotic crowd scenes..." 15 Jul 2024, for the delay)
 *  - Wikipedia, "Lautaro Martínez" (the only goal in the 112th minute of extra time; the Golden Boot with five goals)
 *    https://en.wikipedia.org/wiki/Lautaro_Mart%C3%ADnez
 *  - Wikipedia (es), "Copa América 2024" (the final's scorer and minute, 112')
 * CONFIRMED by those accounts: 14 July 2024, Hard Rock Stadium, Miami Gardens; kick-off delayed by over an hour and twenty minutes by the
 * crowd trouble (so the goal came late at night, under the lights); 0–0 after 90 minutes; Lautaro (No. 22), Giovani Lo Celso (16) and
 * Leandro Paredes (5) all came on in the 97th minute for Álvarez, Enzo Fernández and Mac Allister; the goal in the 112th minute: "a
 * counter-attack by Kevin Castaño was cut by Paredes as he recovered the ball in the midfield and passed the ball to Lo Celso, who played a
 * through ball to Lautaro Martínez and escaped Carlos Cuesta, shooting on goal and scoring the 1–0" (Wikipedia); Colombia's keeper Camilo
 * Vargas (12), Cuesta (2), Davinson Sánchez (23), Johan Mojica (17), Santiago Arias (4); Di María (11) and Nicolás González (15) were still
 * on for Argentina, Messi was off injured (66'); referee Raphael Claus. KIT (Wikipedia kit templates): Argentina in the home pattern
 * (sky-blue and white stripes); Colombia in the yellow home shirt with blue shorts and orange-red socks.
 * INFERRED (illustrative, kept out of the narration): WHICH FOOT (drawn: a right-foot first touch and right-foot shot — Lautaro is
 * right-footed, but no source we read names the foot for this goal); the side of the box (drawn: Argentina's right channel, on the near
 * side of the main camera), the shot spot (about 10 m out) and where it went in (drawn: high, inside the near post, over Vargas's dive);
 * Lo Celso's passing foot (drawn left); every position and timing between the beats; Castaño's pass direction; the other players'
 * positions; Argentina's shorts (drawn black = navy, as in the other Argentina films) and socks (white); the keeper's and referee's kits;
 * the celebration run; the Hard Rock bowl (drawn as a squared bowl under a canopy roof), crowd colours and boards; the ball print; cameras.
 * The lesson's swivel (ch. 4) is a demonstration of the signature, not footage of this match.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; NEVER top-down): 1 = live, the high main-stand
 * camera, near real time, panning from Paredes's interception to the net; 2 = slow-motion replay from a low touchline camera just ahead of
 * the play: the through ball printed on the grass, the sprint past Cuesta, the shot before he can block; 3 = replay from behind the goal:
 * past Vargas, then up to the celebration and the champions' paper; 4 = the lesson, a low side camera in the same box: back to goal, a
 * quick turn, the shot before the defender's block arrives. All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed
 * through ONE adapter, drawPlayer(). Scenes read only (t); every action keys off cue times, so the recorded voice (withTiming) re-times the
 * film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it) and its cue words. `tail` = silence after the last word. Cue words must stay substrings, in order;
 * withTiming matches a cue by its FIRST word, in order — so every cue starts with a plain word (no contraction, no hyphen), and no cue's
 * first word repeats inside the cue before it. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The winner, live',text:'Miami, 2024, the Copa América final. Extra time, still nil-nil. Paredes wins the ball, Lo Celso slides it through, and Lautaro Martínez races away from Cuesta... and scores!',tail:2.6,
  cues:['Miami','the Copa América final','Extra time','Paredes wins','Lo Celso','Lautaro Martínez','races away','and scores']},
 {label:'No waiting',text:'Watch again, slowly. Lautaro sprints past Cuesta into the box. He does not wait: he shoots before Cuesta can block!',tail:1.4,
  cues:['Watch again','slowly','Lautaro sprints','into the box','He does not wait','he shoots','before Cuesta']},
 {label:'Champions',text:'Past Vargas, into the net! One-nil in the 112th minute, and Argentina are champions again!',tail:2,
  cues:['Past Vargas','into the net','minute','Argentina are champions']},
 {label:'Your turn',text:'His favourite finish is a quick turn and shot. Your turn: in the box, spin quickly and shoot before the defender can block!',tail:2,
  cues:['His favourite','Your turn','spin quickly','shoot before','the defender']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py lautaro-signature writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/lautaro-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * (tests/play-film-lautaro-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/lautaro-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lautaro: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lautaro: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys forced to increase in time (a real voice can crowd authored offsets; a camera can never reorder) */
function mono(K0:[number,number][]):[number,number][]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,k[1]];});}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Argentina attack +X, Colombia's goal line at X = 105, the right of the
 * main camera), Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right at
 * +Z, so Argentina's right channel — where Lautaro runs — is the near side. */
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

// ---------------------------------------------------------------- Hard Rock Stadium at night: a squared bowl of stands under a canopy roof
const CX=52.5,NS=64;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(62+d)*Math.sign(c)*Math.pow(Math.abs(c),.32),y,(44+d)*Math.sign(s)*Math.pow(Math.abs(s),.32)];}
const LOW=(b:number):[number,number]=>[2+20*b,1.6+11*b],UP=(b:number):[number,number]=>[24+22*b,15+18*b];
type Bowl={low:V3[][];up:V3[][];roof:V3[][];band:V3[][];seats:{P:V3;h:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],roof:[],band:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  // the canopy: a flat roof ring over the seats (the pitch stays open to the night sky)
  o.roof.push([rim(a,30,38),rim(b,30,38),rim(b,62,41),rim(a,62,41)]);
  o.band.push([rim(a,30,36.6),rim(b,30,36.6),rim(b,30,38.1),rim(a,30,38.1)]);
  o.lamps.push(rim(a+.5/NS*TAU,30,37.3));
  for(const [f,rows] of [[LOW,9],[UP,8]] as [(u:number)=>[number,number],number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+rows*500,17);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** the night sky, the bowl, the crowd (roar lifts the marks; flash = phone lights and camera flashes) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.fill(K,rectPath(-1e4,-1e4,2e4,2e4),.92);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const low=new Path2D(),up=new Path2D(),roof=new Path2D(),band=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.band[i],band);}
 s.knockout(low,.8);s.tone(B,low,.5);s.tone(K,low,.3);
 s.knockout(up,.8);s.tone(B,up,.45);s.tone(K,up,.45);
 // the crowd: Argentina's sky blue and white and Colombia's yellow, shared across the bowl (mix inferred)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.4*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.34?0:q.h<.6?1:q.h<.86?2:q.h<.93?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.8);s.fill(B,inks[1],.6);s.fill(Y,inks[2],.9);s.fill(R,inks[3],.8);s.fill(K,inks[4],.7);
 s.knockout(roof);s.tone(K,roof,.7);s.tone(B,roof,.45);
 s.knockout(band);s.fill(Y,band,.55);
 const lamps=new Path2D();for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=clamp(c.F*.9/d[2],3,16);lamps.addPath(polyPath(blob(g[0],g[1],z,z*.55,3,{amp:.05,n:10}),true));}
 s.knockout(lamps);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** grass under floodlights (yellow × blue, a navy night screen) with mowing stripes, LED boards, paper lines, both goals */
function ground(s:Sheet,c:Cam,o:{goalLater?:boolean;bulge?:number;bz?:number;by?:number}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.5);s.tone(K,p,.35);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(B,bd,.9);s.tone(K,bd,.3);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0,1);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.bz??NET[2],o.by??NET[1]);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (bz, by) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2))*(.6+.4*Math.exp(-Math.pow((y-by)/1.1,2))));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.32);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Argentina: sky-blue (blue screen) and white stripes (confirmed, home pattern); black shorts (navy) and white socks (inferred) */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],pattern:'stripes',patternInk:'paper',shorts:K,socks:'paper',boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:K,seed:3,...o});
/** Colombia: the yellow home shirt, blue shorts, orange-red socks (the kit template: FFFF00 / 1770B0 / FF6600) */
const COL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[B,.85],socks:[R,.9],boots:K,trim:[B,.8],skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:K,seed:5,...o});
/** Lautaro Martínez, 1.74 m, No. 22, a strong, compact striker; dark short hair */
const LM:AthleteStyle=ARG({number:22,skin:SKIN_M,hair:[K,.95],build:{height:1.74,bulk:1.06,thighs:1.1},seed:22});
/** Camilo Vargas, No. 12 — keeper kit colours INFERRED (drawn red), paper gloves */
const VARGAS:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,trim:K,skin:SKIN_M,hair:[K,.9],hairStyle:'short',line:K,shade:[K,.3],gloves:'paper',sleeves:'long',number:12,numberInk:K,build:{height:1.86},seed:12};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'bald',line:K,seed:13};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- casts: keyframed tracks, Hermite-interpolated, tabled at 50 Hz
type Role='hero'|'arg'|'col'|'gk'|'ref';
type Move={kind:'lunge'|'kick'|'dive';at:number;dur:number;side:'l'|'r';power?:number;height?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const DT=.02;
type Tab={X:number[];Z:number[];D:number[]};
function tables(actors:Actor[],T0:number,T1:number):Tab[]{return actors.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});}
const samp=(arr:number[],T0:number,tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
/** everything play() needs from a cast */
type Cast={actors:Actor[];hero:number;pos:(k:number,tau:number)=>[number,number];pose:(k:number,tau:number)=>{p:Pose;yaw:number};place:(k:number,tau:number,yaw:number)=>Place;ball:(tau:number)=>V3;fast:(k:number,tau:number)=>boolean};

// ---------------------------------------------------------------- poses (degrees via posed; athlete.ts clamps to real range of motion)
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:28,lKnee:40,rKnee:38,lHipA:8,rHipA:8,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** a right-foot touch on the run: the boot reaches forward and cushions the ball into his stride */
const TOUCH_R:Partial<Pose>={rHipF:44,rKnee:34,rAnk:-12,rHipR:24,lKnee:40,lean:20,neckP:22,lShA:40,rShA:30};
/** receiving back to goal (the lesson): low, wide base, arm out to feel the defender */
const HOLD:Partial<Pose>={lean:22,pitch:6,lKnee:52,rKnee:50,lHipF:34,rHipF:30,lHipA:14,rHipA:14,rShA:70,rShF:-20,rElb:30,neckP:-8,squash:-.04};
/** generic moves for any actor (defender lunge, a pass/kick, keeper dive) */
function moves(a:Actor,p:Pose,tau:number):Pose{
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='kick'?STRIKE_CONTACT:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='kick'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.5}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:mv.height??.3});}
 return p;
}
/** run / backpedal / idle for everyone who is not the hero */
function gait(a:Actor,k:number,tau:number,sp:number,moveYaw:number,yaw:number,dist:number):Pose{
 const idle=a.role==='gk'?keeperSet(tau*1.3):a.role==='col'?READY:stand();
 if(a.role==='col'&&sp>.5&&Math.cos(moveYaw-yaw)<-.3)return blendPose(idle,backpedal(dist/1.25),clamp((sp-.5)/.8));
 const s=clamp((sp-2.2)/5.5);return blendPose(idle,runCycle(dist/3.4,{speed:s}),clamp((sp-.5)/.9));
}

// ================================================================ THE MATCH CAST (τ = seconds from Lautaro's first touch)
/** the beats: Castaño's pass, Paredes's interception, his pass to Lo Celso, the through ball, Lautaro's first touch (τ 0), the shot */
const T_CP=-4.2,T_INT=-3.55,T_P1=-3.05,T_LC=-2.3,T_TB=-1.55,SHOT=.52,IN_NET=SHOT+.34;
const M0=-7,M1=12;
const M_ACT:Actor[]=[
 {name:'Lautaro',role:'hero',style:LM,key:true,keys:[[M0,77.2,1.2],[-4,78.6,2.2],[T_TB,81.4,3.8],[-1,84.2,5],[-.5,87.3,6.1],[0,90.4,6.9],[.3,92.2,6.8],[SHOT,93.5,6.4],[1,95.4,6.9],[2,97.6,9.5],[3.5,99.6,14.5],[6,101.2,22],[9,102,28],[M1,102.3,30]]},
 {name:'Cuesta',role:'col',style:COL({number:2,build:{height:1.86},seed:2}),key:true,engage:[-1.2,1.1],moves:[{kind:'lunge',at:SHOT+.12,dur:.7,side:'r'}],
  keys:[[M0,78.4,-.6],[-4,80,.4],[T_TB,82.6,2.2],[-1,84.4,3.3],[-.5,87,4.4],[0,89.6,5.1],[SHOT,92.3,5.2],[1.2,93.6,5.6],[3,95,6.2],[M1,97,7]]},
 {name:'Vargas',role:'gk',style:VARGAS,key:true,moves:[{kind:'dive',at:SHOT+.2,dur:.85,side:'l',height:.75}],keys:[[M0,103.6,-.5],[-2,103.2,.6],[0,102.4,1.6],[SHOT,101.9,2],[M1,101.9,2]]},
 {name:'Paredes',role:'arg',style:ARG({number:5,hairStyle:'short',seed:5}),key:true,moves:[{kind:'lunge',at:T_INT,dur:.6,side:'r'},{kind:'kick',at:T_P1,dur:.7,side:'r',power:.45}],
  keys:[[M0,53.5,-9.5],[-5,55.2,-8.6],[T_INT,56.6,-7.9],[T_P1,57.4,-7.6],[-2,60.5,-6.6],[0,66,-5],[4,74,-3],[M1,82,-1]]},
 {name:'Lo Celso',role:'arg',style:ARG({number:16,hairStyle:'long',seed:16}),key:true,moves:[{kind:'kick',at:T_TB,dur:.7,side:'l',power:.6}],
  keys:[[M0,61,-1.5],[-5,62.8,-2.4],[T_LC,65.4,-3.2],[T_TB,66.5,-2.9],[0,70,-1.5],[4,80,1],[M1,90,3]]},
 {name:'Castaño',role:'col',style:COL({seed:41}),moves:[{kind:'kick',at:T_CP,dur:.7,side:'r',power:.4}],keys:[[M0,66,-6.5],[-5,62.8,-6.9],[T_CP,61.2,-7],[T_INT,60.6,-7.1],[-2,61.5,-6.4],[2,66,-4.5],[M1,75,-2]]},
 {name:'Sánchez',role:'col',style:COL({number:23,build:{height:1.87},hair:[K,.9],skin:SKIN_D,seed:23}),key:true,keys:[[M0,79,-7],[-2,83,-4.5],[0,88.5,-1.5],[SHOT,90.8,-.2],[3,95,1],[M1,97,2]]},
 {name:'Mojica',role:'col',style:COL({number:17,skin:SKIN_D,seed:17}),keys:[[M0,76,15],[-2,82,13.5],[0,88,11.5],[3,94,11],[M1,97,12]]},
 {name:'Arias',role:'col',style:COL({number:4,seed:4}),keys:[[M0,74,-17],[-2,80,-14],[0,86,-11],[3,92,-8],[M1,95,-7]]},
 {name:'Uribe',role:'col',style:COL({seed:44}),keys:[[M0,63,4],[-2,66,2],[2,76,1],[M1,86,1]]},
 {name:'Borja',role:'col',style:COL({skin:SKIN_D,seed:45}),keys:[[M0,56,-2],[-2,57,-1],[3,63,0],[M1,72,0]]},
 {name:'Di María',role:'arg',style:ARG({number:11,hairStyle:'curly',build:{height:1.8,bulk:.92},seed:11}),keys:[[M0,68,19],[-2,76,17],[0,84,15.5],[2,91,14],[M1,99,20]]},
 {name:'González',role:'arg',style:ARG({number:15,seed:15}),keys:[[M0,70,-18],[-2,78,-16],[0,86,-13],[2,92,-10],[M1,98,-6]]},
 {name:'De Paul',role:'arg',style:ARG({number:7,hairStyle:'long',seed:7}),keys:[[M0,58,6],[-2,65,6],[1,74,6],[M1,86,8]]},
 {name:'referee',role:'ref',style:REF,keys:[[M0,62,12],[0,76,11],[M1,88,11]]},
];
const LAU=0,CUE=1,VAR=2,PAR=3,LOC=4,CAS=5;
const M_TAB=tables(M_ACT,M0,M1);
const mPos=(k:number,tau:number):[number,number]=>[samp(M_TAB[k].X,M0,tau),samp(M_TAB[k].Z,M0,tau)];
const mDist=(k:number,tau:number)=>samp(M_TAB[k].D,M0,tau);
const mVel=(k:number,tau:number):[number,number]=>{const a=mPos(k,tau-.08),b=mPos(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const mSmooth=(k:number,tau:number):[number,number]=>{const a=mPos(k,tau),b=mPos(k,tau-.3),d=mPos(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the match ball: Castaño's pass, the interception, two passes, the through ball, touch, shot
/** a boot spot ahead of actor k: forward f metres, right r metres of his heading */
function bootAt(k:number,tau:number,f=.55,r=.14):[number,number]{const p=mPos(k,tau),v=mVel(k,tau),y=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):0,fw:Pt=[Math.cos(y),-Math.sin(y)],rt:Pt=[Math.sin(y),Math.cos(y)];return[p[0]+fw[0]*f+rt[0]*r,p[1]+fw[1]*f+rt[1]*r];}
const CAS_FROM:V3=(()=>{const[x,z]=bootAt(CAS,T_CP,.5,.12);return[x,.11,z];})();
const INT_AT:V3=(()=>{const[x,z]=mPos(PAR,T_INT);return[x+.45,.11,z+.3];})();
const P1_FROM:V3=(()=>{const[x,z]=bootAt(PAR,T_P1,.5,.12);return[x,.11,z];})();
const LC_AT:V3=(()=>{const[x,z]=mPos(LOC,T_LC);return[x-.45,.11,z-.1];})();
const TB_FROM:V3=(()=>{const[x,z]=mPos(LOC,T_TB);return[x+.45,.11,z-.15];})();
const RECV:V3=(()=>{const[x,z]=bootAt(LAU,0,.55,.14);return[x,.11,z];})();
/** where the first touch sets the ball: a stride ahead, a touch inside, ready for the shot */
const SHOT_FROM:V3=[94.25,.11,6.4];
const NET:V3=[105.3,1.95,2.5],REST:V3=[106.1,.11,2.3];
const hop=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];
/** a ground pass that slows a little as it rolls (u in 0..1 → eased distance) */
const roll=(a:V3,b:V3,u:number):V3=>{const e=1-(1-u)*(1-u)*.55-.45*(1-u);return[lerp(a[0],b[0],e),.11,lerp(a[2],b[2],e)];};
function mBall(tau:number):V3{
 if(tau<T_CP){const[x,z]=bootAt(CAS,tau,.5,.12);return[x,.11,z];}
 if(tau<T_INT)return hop(CAS_FROM,INT_AT,sm(T_CP,T_INT,tau,linear),.35);
 if(tau<T_P1)return lerp3(INT_AT,P1_FROM,sm(T_INT,T_P1,tau));
 if(tau<T_LC)return roll(P1_FROM,LC_AT,sm(T_P1,T_LC,tau,linear));
 if(tau<T_TB)return lerp3(LC_AT,TB_FROM,sm(T_LC,T_TB,tau));
 if(tau<0)return roll(TB_FROM,RECV,sm(T_TB,0,tau,linear));
 if(tau<SHOT)return roll(RECV,SHOT_FROM,sm(0,SHOT,tau,linear));
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(SHOT_FROM[0],NET[0],u),lerp(.11,NET[1],u)+.35*Math.sin(Math.PI*u),lerp(SHOT_FROM[2],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e)+.5*Math.sin(Math.PI*Math.min(1,u*1.4))*(1-u),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

/** Lautaro's right boot meets the ball at the shot: his body is nudged so the solved toe lands on SHOT_FROM */
const SHOT_D=.72,SHOT_YAW=yawOf(NET[0]-SHOT_FROM[0],NET[2]-SHOT_FROM[2])+.1;
let _shift:[number,number]|null=null;
function lShift():[number,number]{if(_shift)return _shift;const[x,z]=mPos(LAU,SHOT),sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.8}),LM.build,{x,z,yaw:SHOT_YAW});
 return _shift=[SHOT_FROM[0]-lerp(sk.rToe[0],sk.rAn[0],.35),SHOT_FROM[2]-lerp(sk.rToe[2],sk.rAn[2],.35)];}
function mPlace(k:number,tau:number,yaw:number):Place{const[x,z]=mPos(k,tau);if(k===LAU){const d=lShift(),w=sm(SHOT-.55,SHOT-.2,tau)*(1-sm(SHOT+.45,SHOT+1,tau));return{x:x+d[0]*w,z:z+d[1]*w,yaw};}return{x,z,yaw};}
function mPose(k:number,tau:number):{p:Pose;yaw:number}{
 const a=M_ACT[k],v=mVel(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=mPos(k,tau),m=mPos(LAU,tau),b=mBall(tau),mv=yawOf(v[0],v[1]);
 let yaw=sp>.5?mv:yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau))*.6);
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===PAR&&tau>T_INT-.6&&tau<T_P1+.5)yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(LC_AT[0]-x,LC_AT[2]-z),sm(T_INT,T_P1-.2,tau));
 if(k===LOC&&tau>T_LC-.8&&tau<T_TB+.5)yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(RECV[0]-TB_FROM[0],RECV[2]-TB_FROM[2]),sm(T_LC-.2,T_TB-.3,tau));
 if(k===LAU){
  yaw=sp>.5?mv:yawOf(1,0);
  yaw=lerpA(yaw,SHOT_YAW,sm(SHOT-.55,SHOT-.2,tau)*(1-sm(SHOT+.3,SHOT+.7,tau)));
  if(tau<T_TB-.2)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.5);
  // a jog while the ball is in midfield, then a full sprint onto the through ball; the right-foot touch, the right-foot strike
  const s=clamp((sp-2)/5.5);
  let p=blendPose(stand(),runCycle(mDist(LAU,tau)/3.9,{speed:.3+.7*s}),clamp((sp-.3)/.8));
  p=over(p,TOUCH_R,bump(-.28,.2,tau));
  const u=(tau-(SHOT-STRIKE_CONTACT*SHOT_D))/SHOT_D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.8}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.5)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.5,IN_NET+1,tau));
  return{p,yaw};}
 let p=gait(a,k,tau,sp,mv,yaw,mDist(k,tau));
 p=moves(a,p,tau);
 if(k===VAR&&tau<SHOT-.1)p=blendPose(p,runCycle(tau*1.6,{speed:.3}),bump(-1.8,.3,tau)*.5);
 if(a.role==='arg'&&tau>IN_NET+.4)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+.9,tau));
 if(a.role==='col'&&k!==VAR&&tau>IN_NET+.6)p=over(p,{lean:34,neckP:30,lShA:10,rShA:10,lHipF:10,rHipF:10,lKnee:12,rKnee:12},sm(IN_NET+.6,IN_NET+1.4,tau)*.8);
 return{p,yaw};
}
const MATCH:Cast={actors:M_ACT,hero:LAU,pos:mPos,pose:mPose,place:mPlace,ball:mBall,
 fast:(k,tau)=>(k===LAU&&tau>SHOT-.35&&tau<SHOT+.3)||(k===VAR&&tau>SHOT&&tau<SHOT+.7)||(k===CUE&&tau>SHOT-.2&&tau<SHOT+.35)};

// ================================================================ THE LESSON CAST: a demonstration of the swivel (not match footage)
/** τd: the pass arrives at ARRIVE; he turns over TURN seconds, rolling the ball round with his right foot; the shot at DSHOT; the
 * defender, marking tight behind him, lunges a moment too late */
const ARRIVE=0,TURN=.5,DSHOT=.82,D_IN=DSHOT+.32;
const D0=-2.5,D1=5;
const D_ACT:Actor[]=[
 {name:'Lautaro',role:'hero',style:LM,key:true,keys:[[D0,91.4,-.4],[-1,92.1,-.3],[ARRIVE,92.4,-.25],[ARRIVE+TURN,92.75,.2],[DSHOT,93.05,.45],[1.8,94.5,1.4],[D1,97,4]]},
 {name:'defender',role:'col',style:COL({number:2,build:{height:1.86},seed:2}),key:true,moves:[{kind:'lunge',at:DSHOT+.1,dur:.65,side:'l'}],keys:[[D0,93.7,-.55],[-1,93.7,-.45],[ARRIVE,93.75,-.4],[DSHOT,94.1,-.15],[D1,94.6,.2]]},
 {name:'passer',role:'arg',style:ARG({number:16,hairStyle:'long',seed:16}),key:true,moves:[{kind:'kick',at:-1.15,dur:.7,side:'l',power:.5}],keys:[[D0,79.5,-2],[-1.15,80.2,-1.9],[D1,82,-1.2]]},
 {name:'Vargas',role:'gk',style:VARGAS,key:true,moves:[{kind:'dive',at:DSHOT+.2,dur:.85,side:'r',height:.2}],keys:[[D0,103.3,0],[DSHOT,102.6,.2],[D1,102.6,.2]]},
];
const D_TAB=tables(D_ACT,D0,D1);
const dPos=(k:number,tau:number):[number,number]=>[samp(D_TAB[k].X,D0,tau),samp(D_TAB[k].Z,D0,tau)];
const dDist=(k:number,tau:number)=>samp(D_TAB[k].D,D0,tau);
const dVel=(k:number,tau:number):[number,number]=>{const a=dPos(k,tau-.08),b=dPos(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
/** his heading through the swivel: back to goal (facing −X) → a left turn through facing +Z → facing the goal */
const D_SHOT_FROM:V3=[93.75,.11,.95],D_NET:V3=[105.3,.35,-2.4];
const D_SHOT_YAW=yawOf(D_NET[0]-D_SHOT_FROM[0],D_NET[2]-D_SHOT_FROM[2])+.1;
const dYaw=(tau:number)=>lerp(Math.PI,TAU+D_SHOT_YAW,sm(ARRIVE-.05,ARRIVE+TURN,tau,easeInOutSine));
/** the ball rides round him on the swivel: from in front of him (towards the passer) to his right front, ready to strike */
function dRide(tau:number):V3{const[x,z]=dPos(0,tau),y=dYaw(tau),fw:Pt=[Math.cos(y),-Math.sin(y)],rt:Pt=[Math.sin(y),Math.cos(y)];return[x+fw[0]*.5+rt[0]*.2,.11,z+fw[1]*.5+rt[1]*.2];}
const D_PASS:V3=[80.7,.11,-1.95],D_RECV:V3=dRide(ARRIVE);
function dBall(tau:number):V3{
 if(tau<-1.15)return D_PASS;
 if(tau<ARRIVE)return roll(D_PASS,D_RECV,sm(-1.15,ARRIVE,tau,linear));
 if(tau<ARRIVE+TURN)return dRide(tau);
 if(tau<DSHOT)return lerp3(dRide(ARRIVE+TURN),D_SHOT_FROM,sm(ARRIVE+TURN,DSHOT,tau));
 if(tau<D_IN){const u=(tau-DSHOT)/(D_IN-DSHOT);return[lerp(D_SHOT_FROM[0],D_NET[0],u),lerp(.11,D_NET[1],u)+.25*Math.sin(Math.PI*u),lerp(D_SHOT_FROM[2],D_NET[2],u)];}
 const u=clamp((tau-D_IN)/.45),e=1-(1-u)*(1-u);return[lerp(D_NET[0],106,e),.11+.24*(1-e),lerp(D_NET[2],-2.2,e)];
}
let _dshift:[number,number]|null=null;
function dShift():[number,number]{if(_dshift)return _dshift;const[x,z]=dPos(0,DSHOT),sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.7}),LM.build,{x,z,yaw:D_SHOT_YAW});
 return _dshift=[D_SHOT_FROM[0]-lerp(sk.rToe[0],sk.rAn[0],.35),D_SHOT_FROM[2]-lerp(sk.rToe[2],sk.rAn[2],.35)];}
function dPlace(k:number,tau:number,yaw:number):Place{const[x,z]=dPos(k,tau);if(k===0){const d=dShift(),w=sm(ARRIVE+TURN-.15,DSHOT-.1,tau)*(1-sm(DSHOT+.45,DSHOT+1,tau));return{x:x+d[0]*w,z:z+d[1]*w,yaw};}return{x,z,yaw};}
function dPose(k:number,tau:number):{p:Pose;yaw:number}{
 const a=D_ACT[k],v=dVel(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=dPos(k,tau),b=dBall(tau),m=dPos(0,tau);
 if(k===0){
  let yaw=dYaw(tau);if(tau>DSHOT+.4)yaw=lerpA(yaw,sp>.5?yawOf(v[0],v[1]):yaw,sm(DSHOT+.4,DSHOT+.8,tau));
  let p=over(stand(),HOLD,1-sm(ARRIVE-.1,ARRIVE+.15,tau));
  // the swivel: a quick pivot on the left foot, the right boot rolling the ball round (a dribble touch through the turn)
  const tw=bump(ARRIVE-.1,ARRIVE+TURN+.1,tau);
  p=blendPose(p,dribble(.6+.4*sm(ARRIVE,ARRIVE+TURN,tau),{foot:'r',speed:.5}),tw);
  p=over(p,{twist:-24,roll:-6,lean:24,neckY:-20,lShA:46,rShA:36},tw*.7);
  const u=(tau-(DSHOT-STRIKE_CONTACT*.6))/.6;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>D_IN+.5)p=blendPose(p,runCycle(dDist(0,tau)/3.4,{speed:.5}),clamp((sp-.3)/.8));
  return{p,yaw};}
 let yaw=a.role==='gk'?yawOf(b[0]-x,b[2]-z):k===1?yawOf(m[0]-x,m[1]-z):sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(k===1)yaw=lerpA(yaw,Math.PI,1-sm(ARRIVE,ARRIVE+TURN,tau));
 let p=gait(a,k,tau,sp,yawOf(v[0],v[1]),yaw,dDist(k,tau));
 if(k===1)p=over(READY,{lean:18,rShA:50,lShA:40},1-sm(DSHOT,DSHOT+.1,tau));
 p=moves(a,p,tau);
 return{p,yaw};
}
const DEMO:Cast={actors:D_ACT,hero:0,pos:dPos,pose:dPose,place:dPlace,ball:dBall,
 fast:(k,tau)=>(k===0&&tau>ARRIVE-.1&&tau<DSHOT+.3)||(k===1&&tau>DSHOT-.1&&tau<DSHOT+.4)||(k===3&&tau>DSHOT&&tau<DSHOT+.7)};

// ---------------------------------------------------------------- the ball print (paper, sky-blue and gold panels, navy key; print inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D(),sw=(cx:number,cy:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<6;i++){const a=a0+i/6*1.4;q.push([cx+Math.cos(a)*r*.55,cy+Math.sin(a)*r*.55]);}for(let i=5;i>=0;i--){const a=a0+i/6*1.4;q.push([cx+Math.cos(a)*r*.25,cy+Math.sin(a)*r*.25]);}return polyPath(q,true);};
 for(let i=0;i<3;i++)pan.addPath(sw(x,y,rot+i/3*TAU));
 s.fill(B,pan,.8);s.fill(Y,pan,.35);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
}

// ---------------------------------------------------------------- drawing a cast through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,C:Cast,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 C.actors.forEach((_,k)=>{const pl=C.place(k,tau,0),x=pl.x!,z=pl.z!,q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=C.ball(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: soft, short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,C.actors[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;const joints=new Map<number,DrawResult>();if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=C.actors[e.k],px=e.h*ppu,big=e.h>=300;
  const q=C.pose(e.k,tauP),qp=C.pose(e.k,tauPrev),place={...C.place(e.k,tauP,q.yaw),x:e.x,z:e.z},prevPlace=C.place(e.k,tauPrev,qp.yaw);
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===C.hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,q.p,c,{...a.style,shadow:e.h<420?false:undefined,detail},place,big&&!passing?{prev:qp.p,prevPlace,smear:hero&&C.fast(e.k,tauP)}:{});
  joints.set(e.k,r);if(e.k===C.hero)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe) */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks
/** a spark on the ball at a contact (age = τ since the contact) */
function contactSpark(s:Sheet,c:Cam,P:V3,age:number,seed:number,span=.35){if(age<-.02||age>span)return;const q=pr(c,[P[0],P[1]+.1,P[2]]);if(!q)return;const d=toCam(c,P)[2];
 sparkBurst(s,Y,q[0],q[1],c.F*.6/d,{n:9,seed,g:easeOutBack(clamp((age+.02)/.08))*(1-clamp((age-span*.6)/(span*.4))),width:Math.max(6,c.F*.045/d)});}
/** the ball's path on the grass from τ a to τ b (orange ribbon, drawn up to progress w) */
function pathMarks(s:Sheet,C:Cast,c:Cam,a:number,b:number,w:number,seed=61){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=24;i++){const tau=lerp(a,b,i/24*w),p=C.ball(tau),q=toCam(c,[p[0],.02,p[2]]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const wd=c.F*.1/d;s.knockout(ribbon(pts,wd*1.7,{seed,taper:.1,wobble:.8}),.75);s.fill(R,ribbon(pts,wd,{seed,taper:.1,wobble:.8}),.95);}
/** a ground ring round a spot (rx, rz metres), printed in ink at weight w */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,w:number,ink:string,seed:number){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*rx*w,.02,z+Math.sin(i/36*TAU)*rz*w]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,c.F*.06/Math.max(1,toCam(c,[x,0,z])[2]),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9);s.fill(ink,rr,.95);}
/** a straight arrow on the grass from a to b (yellow), drawn up to progress w */
function groundArrow(s:Sheet,c:Cam,a3:V3,b3:V3,w:number,seed:number,ink=Y){if(w<=0)return;const a=pr(c,a3),b=pr(c,b3);if(!a||!b)return;const d=toCam(c,a3)[2],wd=c.F*.15/Math.max(1,d);
 s.knockout(ribbon([a,b],wd*1.6,{seed,taper:.1}),.8*Math.min(1,w*2));laneArrow(s,ink,a,b,wd,{progress:w,seed:seed+1,head:wd*3});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const pw=CUEW(0,'Paredes'),lc=CUEW(0,'Lo Celso'),lm=CUEW(0,'Lautaro'),ra=CUEW(0,'races'),sc=CUEW(0,'and scores'),S=SECS(0);
 return key(t,mono([[0,M0+.2],[pw,T_INT-.05],[lc,T_TB-.25],[lm,T_TB+.5],[ra,-.35],[sc,IN_NET-.05],[S+1,IN_NET-.05+(S+1-sc)]]),linear);};
const CAM1:V3=[70,24,72];
function cam1(t:number):Cam{
 const tau=tau1(t),sc=CUEW(0,'and scores'),bs=(u:number):V3=>{const b=mBall(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3+3*(1-sm(-.6,SHOT,tau)),1.1,(b0[2]+b1[2]+b2[2])/3*.7];
 const open:V3=[60,6,-6],toBall=sm(0,CUEW(0,'Extra')-.2,t,easeInOutSine),m=mPos(LAU,tau),cel:V3=[m[0]-2,1.1,m[1]],toJ=sm(sc+.6,sc+1.8,t,easeInOutSine);
 const T=lerp3(lerp3(open,bt,toBall),cel,toJ);
 const F=key(t,[[0,1500],[CUEW(0,'Extra')-.2,5600],[CUEW(0,'Paredes'),6200],[CUEW(0,'Lautaro'),6600],[sc,7200],[sc+1.8,9000],[SECS(0),9400]],easeInOutSine);
 return look(CAM1,T,F);}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t));
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.5,tau),flash:sm(IN_NET+.1,IN_NET+.4,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,MATCH,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=mPos(LAU,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a low touchline camera just ahead of the play
const tau2=(t:number)=>{const ls=CUEW(1,'Lautaro sprints'),ib=CUEW(1,'into the box'),hd=CUEW(1,'He does'),hs=CUEW(1,'he shoots'),bc=CUEW(1,'before Cuesta'),S=SECS(1);
 return key(t,mono([[0,T_TB-.35],[CUEW(1,'slowly'),T_TB-.05],[ls,-1.05],[ib,-.3],[hd,.12],[hs,SHOT-.06],[bc,SHOT+.1],[bc+.9,SHOT+.3],[S,SHOT+.42]]),linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=mSmooth(LAU,tau),push=sm(CUEW(1,'into the box')-.4,CUEW(1,'he shoots'),t,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine);
 const C:V3=[m[0]+10+2*open,1.5+.5*open,m[1]+9+2.5*open-1.5*push],T:V3=[m[0]+2.4,.8,m[1]-1.2];
 return look(C,T,2500+600*push-400*open);}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ls=CUEW(1,'Lautaro sprints'),ib=CUEW(1,'into the box'),hs=CUEW(1,'he shoots'),bc=CUEW(1,'before Cuesta'),S=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const fade=1-sm(S-.9,S-.5,t);
  // the through ball printed on the grass as it runs (from Lo Celso's boot to Lautaro's first touch)
  pathMarks(s,MATCH,c,T_TB,Math.max(T_TB,Math.min(tau,0)),sm(ls-.4,ls,t)*fade);
  // "into the box": the box's edge lights up where he crosses it
  const bw=sm(ib-.1,ib+.3,t,easeOut)*(1-sm(hs-.2,hs+.2,t));if(bw>0){const ln=new Path2D();seg3(c,[88.5,.02,2],[88.5,.02,14],.28*bw,ln);s.knockout(ln,.85*bw);s.fill(Y,ln,.95*bw);}
  play(s,MATCH,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:({hero,joints})=>{
   // "he shoots": a spark as the right boot strikes, and a red ring round the boot
   contactSpark(s,c,SHOT_FROM,tau-SHOT,83,.45);
   const lw=sm(hs-.1,hs+.25,t,easeOutBack)*(1-sm(bc+.4,bc+.8,t));
   if(hero&&lw>0){const toe=hero.joints.rToe,an=hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*lw+3,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.85]);}
    s.knockout(ribbon(pts,Math.max(5,r*.3),{seed:82,close:true,taper:0,wobble:.8}),.8*lw);s.fill(R,ribbon(pts,Math.max(3,r*.18),{seed:82,close:true,taper:0,wobble:.8}),.95*lw);}
   // "before Cuesta can block": a navy gap bar between his lunging boot and the ball's path — too late
   const cj=joints.get(CUE),gw=sm(bc-.05,bc+.3,t,easeOut)*fade;
   if(cj&&gw>0){const toe=cj.joints.rToe,bp=pr(c,mBall(Math.min(tau,SHOT+.06)));if(bp){const d=Math.hypot(bp[0]-toe[0],bp[1]-toe[1]);if(d>6){const u=clamp(gw);s.fill(K,ribbon([toe,[lerp(toe[0],bp[0],u),lerp(toe[1],bp[1],u)]],Math.max(3,c.F*.04/toCam(c,SHOT_FROM)[2]),{seed:88,taper:0,wobble:.6}),.9);
    sparkBurst(s,R,toe[0],toe[1],Math.max(10,d*.25),{n:6,seed:89,g:u,width:6});}}}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=mBall(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: past Vargas, then the champions
const tau3=(t:number)=>{const pv=CUEW(2,'Past Vargas'),it=CUEW(2,'into the net'),mn=CUEW(2,'minute'),S=SECS(2);
 return key(t,mono([[0,SHOT-.7],[pv,SHOT+.02],[it,IN_NET+.02],[mn,IN_NET+.9],[S,IN_NET+.9+(S-mn)*.85]]),linear);};
const swing3=(t:number)=>sm(CUEW(2,'into the net')+.3,CUEW(2,'Argentina')+.4,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=mSmooth(LAU,tau),u=swing3(t),pv=sm(-.2,CUEW(2,'Past Vargas')+.2,t,easeInOutSine);
 const C0:V3=[117,4.4-1.2*pv,-1.5],T0:V3=[lerp(96,98,pv),lerp(1.2,1.4,pv),lerp(5.2,3.8,pv)];
 const C1:V3=[m[0]-7,2.4,m[1]-8],T1:V3=[m[0]+.8,2.1,m[1]+2.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3300+900*pv,2600,u));}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),it=CUEW(2,'into the net'),ac=CUEW(2,'Argentina'),u=swing3(t),S=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(ac-.2,ac+.3,t)});
  ground(s,c,{goalLater:u<.5});
  // "Past Vargas": the flight of the shot printed as it goes (yellow over the paper)
  const fw=sm(CUEW(2,'Past Vargas')-.2,CUEW(2,'Past Vargas')+.2,t)*(1-sm(it+.6,it+1,t));
  if(fw>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const q=pr(c,mBall(lerp(SHOT,Math.min(Math.max(tau,SHOT+.01),IN_NET),i/16)));if(q)pts.push(q);}if(pts.length>3){const d=toCam(c,NET)[2],wd=c.F*.06/d;s.knockout(ribbon(pts,wd*1.8,{seed:91,taper:.6}),.8*fw);s.fill(Y,ribbon(pts,wd,{seed:91,taper:.6}),.95*fw);}}
  play(s,MATCH,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2],NET[1]);
  // "into the net": a spark where the net takes it
  contactSpark(s,c,NET,tau-IN_NET,93,.5);
  // "Argentina are champions again": sky-blue and white paper ribbons over the frame
  const cw=sm(ac-.1,ac+.5,t)*(1-sm(S-.5,S,t)*.3);if(cw>0){const fall=(t-ac)*240;confetti(s,[B,'paper',Y],[-v.hx,-v.hy-400+fall,2*v.hx,2*v.hy],Math.round(80*cw),71,{size:42,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=mPos(LAU,tau3(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.2/q[2]),12);},
 still:2.2,
};

// ---------------------------------------------------------------- 4 · the lesson: back to goal, spin quickly, shoot before the block (a demonstration)
const tau4=(t:number)=>{const hf=CUEW(3,'His'),yt=CUEW(3,'Your'),sq=CUEW(3,'spin'),sb=CUEW(3,'shoot before'),td=CUEW(3,'the defender'),S=SECS(3);
 return key(t,mono([[0,-2.2],[hf,-2],[yt,-.9],[sq,ARRIVE-.02],[sb,DSHOT-.04],[td,DSHOT+.1],[td+.8,D_IN+.2],[S,D_IN+1]]),linear);};
function cam4(t:number):Cam{
 const tau=tau4(t),push=sm(CUEW(3,'spin')-.5,CUEW(3,'shoot')+.2,t,easeInOutSine),[x,z]=dPos(0,Math.min(tau,DSHOT));
 const sh=sm(CUEW(3,'shoot before')-.3,CUEW(3,'the defender')+.4,t,easeInOutSine);
 const C:V3=[x-4.6+1.6*push-.5*sh,1.35+.6*sh,z+8.2-1.2*push+2*sh],T:V3=[x+2.6+2.4*sh,.9,z-.6-.5*sh];
 return look(C,T,2300+500*push-800*sh);}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),hf=CUEW(3,'His'),sq=CUEW(3,'spin'),sb=CUEW(3,'shoot before'),td=CUEW(3,'the defender'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{bulge:tau>D_IN?Math.exp(-(tau-D_IN)*2.2):0,bz:D_NET[2],by:D_NET[1]});
  const[x,z]=dPos(0,tau);
  // "His favourite finish": a yellow ring under him, back to goal, the defender tight behind
  groundRing(s,c,x,z,.8,.65,sm(hf-.1,hf+.35,t,easeOutBack)*(1-sm(sq-.2,sq+.1,t)),Y,7);
  // "spin quickly": a curved arrow round him on the grass, drawn as he turns
  const sw=sm(sq-.15,sq+.25,t,easeOut)*(1-sm(sb+.2,sb+.6,t));
  if(sw>0){const pts:Pt[]=[];for(let i=0;i<=20;i++){const a=Math.PI+i/20*Math.PI*.95*sw,q=pr(c,[x+Math.cos(a)*1.25,.02,z-Math.sin(a)*1.25]);if(q)pts.push(q);}
   if(pts.length>4){const d=toCam(c,[x,0,z])[2],wd=c.F*.12/d;s.knockout(ribbon(pts,wd*1.6,{seed:43,taper:.1}),.85);s.fill(Y,ribbon(pts,wd,{seed:43,taper:.1}),.95);const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,Y,a,[b[0]+(b[0]-a[0])*.4,b[1]+(b[1]-a[1])*.4],wd,{seed:44,head:wd*3});}}
  // "shoot before": a red arrow from the ball to the goal
  groundArrow(s,c,[D_SHOT_FROM[0]+.3,.02,D_SHOT_FROM[2]],[104.2,.02,D_NET[2]*.9],sm(sb-.1,sb+.35,t,easeOut)*(1-sm(E-.8,E-.4,t)),47,R);
  play(s,DEMO,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({joints})=>{
   contactSpark(s,c,D_SHOT_FROM,tau-DSHOT,95,.45);
   // "the defender can block": his lunge arrives after the ball has gone — a navy gap and a small burst at his boot
   const dj=joints.get(1),gw=sm(td-.05,td+.3,t,easeOut)*(1-sm(E-.8,E-.4,t));
   if(dj&&gw>0){const toe=dj.joints.lToe;sparkBurst(s,K,toe[0],toe[1],c.F*.35/Math.max(1,toCam(c,[x,0,z])[2]),{n:7,seed:96,g:gw,width:6});}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'lautaro-signature',format:'11v11',title:'Lautaro: turn and shoot',theme:'Turn quickly in the box and shoot before the defender can block',
 ageNote:'Copa América final, Argentina v Colombia, Hard Rock Stadium, Miami, 14 July 2024, with a lesson demonstration of his favourite finish. For players of every age.',
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
/** Solved contacts (pitch metres; Colombia's goal line at X = 105) — checked by the film test. */
export const FACTS={SHOT_FROM,RECV,SHOT,IN_NET,T_INT,T_TB,ballAt:mBall,
 rightToeAt:(tau:number)=>{const q=mPose(LAU,tau);return solve(q.p,LM.build,mPlace(LAU,tau,q.yaw)).rToe;},
 posOf:(name:string,tau:number)=>mPos(M_ACT.findIndex(a=>a.name===name),tau),
 demo:{D_SHOT_FROM,DSHOT,ballAt:dBall,yawAt:dYaw,rightToeAt:(tau:number)=>{const q=dPose(0,tau);return solve(q.p,LM.build,dPlace(0,tau,q.yaw)).rToe;}}};
