/** João Pedro — "the curler from the edge" (signature card). The real moment that shows it: his FIRST Chelsea goal, FIFA Club World Cup
 * 2025 semi-final, Fluminense 0–2 Chelsea, MetLife Stadium, East Rutherford, New Jersey, Tuesday 8 July 2025 (3:00 pm EDT, 35 °C sun),
 * 18th minute: Pedro Neto's cross from the left is half-cleared by Thiago Silva, the ball drops to João Pedro, he takes a touch to the left
 * of the D and curls it into the top right corner past Fábio. Against his boyhood club, so no celebration: hands up, in apology.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives João Pedro a signature, not a match ("Signature: the curler from the edge",
 * long_range_goal, centre, edge, right foot; lesson "Open your body and curl the ball so it bends away from the keeper."). This goal IS that
 * trait: a curled shot from the edge of the area into the top corner, and written sources describe the play itself (the cross, the
 * half-clearance, the touch, the curl, the corner), so it is recreated in the real match, not in a separate demonstration.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A 1:1 reconstruction from WRITTEN accounts (we cannot watch the footage); only the rendering is riso.
 *
 * SOURCES (curl, generic UA, cached under scratchpad/films/src-cache, read 24 Sep 2026):
 *  - Wikipedia, "2025 FIFA Club World Cup knockout stage" (raw wikitext; wiki-2025-cwc-ko.txt): 8 July 2025, 3:00 pm EDT, MetLife Stadium,
 *    East Rutherford; Fluminense 0–2 Chelsea, João Pedro 18', 56'; attendance 70,556; referee François Letexier; both line-ups with shirt
 *    numbers and substitutions (João Pedro 20, off 60'); the kit templates citing FIFA's tactical line-up: Fluminense HOME (_fluminense25h,
 *    garnet body 800000, white shorts, white socks), Chelsea AWAY 2025–26 (_chelsea2526a: cream EEEFDF shirt and socks, dark green-grey
 *    495D54 shorts).   https://en.wikipedia.org/wiki/2025_FIFA_Club_World_Cup_knockout_stage
 *  - The Guardian live blog (Scott Murray; guardian-flu-che-2025-live-p2.txt): "Neto makes good down the left. His cross is half-cleared.
 *    The ball drops to Pedro, who takes a touch to the left of the D and curls an unstoppable shot into the top right. Fabio had no chance!";
 *    "He doesn't celebrate it ... In fact he's almost apologetic"; (page 1) "two pearlers into the top-right corner of the net from the edge
 *    of the box".   https://www.theguardian.com/football/live/2025/jul/08/fluminense-v-chelsea-club-world-cup-semi-final-live
 *  - The Guardian match report (Jacob Steinberg; guardian-flu-che-2025-report.txt): "an error from Thiago Silva in the 18th minute. The former
 *    Chelsea centre-back was too casual when he cleared a cross from Neto. The ball fell to João Pedro ... There was no celebration ... he set
 *    himself and ripped a dipping, swerving shot past Fábio"; "temperatures hitting 35C at kick-off"; Neto "switched to the left"; photo
 *    caption "watches as his curling shot finds the top corner".
 *    https://www.theguardian.com/football/2025/jul/08/fluminense-chelsea-club-world-cup-semi-final-match-report
 *  - The Guardian, Sid Lowe (guardian-flu-che-2025-joaopedro.txt): "The first bent into the top corner"; "after each, up went the hands, in
 *    apology"; he joined Fluminense at 10 (his boyhood club).
 *    https://www.theguardian.com/football/2025/jul/08/joao-pedro-leaves-it-to-chelsea-fans-to-celebrate-after-double-against-old-side
 *  - Card data: lib/town/playerAppearance.json (Brazil; skin 3, black short hair, no facial hair); lib/town/playerCareers.json (Fluminense
 *    2019–20, Watford, Brighton 2023–25, Chelsea 2025–).
 * CONFIRMED: date, venue, kick-off time and heat, the 18th minute, 1–0; Neto (No. 7) on the LEFT; his cross half-cleared by Thiago Silva
 *  (No. 3, Fluminense captain, ex-Chelsea); the ball dropped to João Pedro (No. 20, his full debut, first Chelsea goal); ONE touch, to the
 *  LEFT of the D (the edge of the box); a curled, dipping, swerving shot into the TOP RIGHT corner; Fábio (No. 1) beaten; NO celebration,
 *  hands raised in apology. KITS: Fluminense home garnet/green/white stripes, white shorts, white socks; Chelsea's cream away shirts and
 *  socks with dark green-grey shorts.
 * INFERRED (illustrative, kept out of the narration): the SHOOTING FOOT — no source read names it for this goal; drawn RIGHT (the card says
 *  right foot, the report says his 56' goal was right-footed, and a right-footer's curl into the far top-right corner from the left of the D
 *  is the natural shot), so the narration never says which foot. The bend therefore goes RIGHT-TO-LEFT from his view (inside of the right
 *  foot): the ball leaves on a line outside the far (right) post and swerves back in under the bar. Also inferred: that Silva's clearance
 *  was a header (drawn so) and that Neto crossed with his left foot; every position, speed and timing; the shot spot (drawn ≈ 20 m from the
 *  far top corner, just left of the D); the ball's height and bend; Fábio's start spot and late dive to his left; which end Chelsea attacked
 *  (so which side of the main camera the play is on); the other players' spots (Guga on Neto, Palmer and Nkunku in the box, Nonato closing);
 *  the keeper kit (drawn yellow), numbers' inks; the teammates' run to him afterwards; MetLife drawn as an open, roofless three-tier bowl
 *  under a pale, hot sky; crowd colours (Fluminense fans outnumbered Chelsea's, Guardian); the ball's print (generic); the camera angles.
 *  João Pedro is drawn 1.82 m, Thiago Silva 1.83 m, Fábio 1.88 m.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; NEVER top-down): 1 = live, the high main-stand
 * camera, near real time, from Neto's cross to the net; 2 = slow-motion replay from a low camera behind João Pedro: the ball dropping, the
 * one touch (a ring), the open body (a yellow arrow to the far post); 3 = replay from behind the goal: the swerve and dip printed in the
 * air, past Fábio, the top right corner, then round to him raising his hands; 4 = the lesson from behind the shooter (open the body, the
 * curl arrow bending outside the keeper's reach, the far-corner target). All figures are the shared riso athlete (lib/plays/riso/athlete.ts),
 * routed through ONE adapter, drawPlayer(). Handedness: right-handed pitch metres (athlete.ts convention), so foot:'r' is the right foot.
 * Scenes read only (t); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,dribble,backpedal,strike,header,keeperSet,keeperDive,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it) and its cue words. `tail` = silence after the last word. Cue words must stay substrings, in
 * order; withTiming matches a cue by its FIRST word (a plain word, never a contraction or a hyphenated word, never "João"). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The curler, live',text:"The Club World Cup semi-final. Chelsea's new striker, João Pedro, faces Fluminense, his old club. Neto crosses. Thiago Silva clears it, but only to him. He curls it... into the top corner!",tail:2.4,
  cues:['The Club World Cup','new striker','faces Fluminense','Neto crosses','Thiago Silva clears','but only to him','He curls it','into the top corner']},
 {label:'Set yourself',text:'Watch again, slowly. One touch to set himself. He opens his body towards the far post.',tail:1.3,
  cues:['Watch again','slowly','One touch','He opens his body','far post']},
 {label:'The curl',text:'The ball swerves and dips, past Fábio, into the top corner. No celebration: he raises his hands to say sorry to his boyhood club.',tail:2.2,
  cues:['The ball swerves','dips','past Fábio','into the top','No celebration','he raises his hands']},
 {label:'Your turn',text:'Your turn: open your body, and curl the ball so it bends away from the keeper!',tail:2.2,
  cues:['Your turn','open your body','curl the ball','bends away','the keeper']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py joao-pedro-signature writes timing.json next to
 * script.json). Then add `import timingJson from '../../../public/plays/narration/joao-pedro-signature/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/joao-pedro-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses) */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('joao-pedro: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('joao-pedro: cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Chelsea attack +X, Fluminense's goal line at X = 105), Y up, Z across
 * (0 = the middle). A player attacking +X has his LEFT at −Z, so Neto's wing and the left of the D are on the −Z side; the main-stand camera
 * sits on that side (Z ≈ −74), so on screen Chelsea attack right-to-left and the play is on the near side. The top RIGHT corner (his right)
 * is the +Z post: the far post from a shot on the left. */
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
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;

// ---------------------------------------------------------------- MetLife Stadium: an open, roofless three-tier bowl on a hot afternoon
/** stand planes (a along, b up the rake 0..1): 0 the far side (+Z), 1 behind Fluminense's goal (X > 105), 2 the near side under the main
 * camera (−Z), 3 the far end. Wide margins round the pitch (an NFL bowl), tall rakes, no roof. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-45,150,a),1.2+30*b,44+34*b],
 (a,b)=>[114+30*b,1.2+27*b,lerp(80,-80,a)],
 (a,b)=>[lerp(150,-45,a),1.2+30*b,-44-34*b],
 (a,b)=>[-9-30*b,1.2+27*b,lerp(-80,80,a)],
];
const STAND_COLS=[80,56,80,56],STAND_ROWS=12,TIERS=[.36,.7];
/** the sky, the bowl and the crowd (70,556): Fluminense garnet (red × navy) and green (blue × yellow) and white fill most of it, Chelsea blue
 * in blocks. roar lifts the marks; flash = phone and camera flashes. */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t);
 // a pale, hot summer sky: a light blue field, a warm haze low on the horizon
 s.field(B,.2,.45);
 const hz=pr(c,[c.C[0]+c.f[0]*1e4,c.C[1],c.C[2]+c.f[2]*1e4]);
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-380],[1e4,hz[1]-380],[1e4,hz[1]+1e4],[-1e4,hz[1]+1e4]],true),.2);
 const planes=new Path2D(),fascia=new Path2D(),rim=new Path2D();
 for(let i=0;i<4;i++){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS)seg3(c,S(0,b),S(1,b),1.1,fascia);seg3(c,S(0,1),S(1,1),1.4,rim);}
 s.knockout(planes);s.tone(B,planes,.48);s.tone(K,planes,.18);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(let si=0;si<4;si++){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIERS.some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h>.86)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols;
   const q=toCam(c,S(a,b));if(q[2]<14)continue;const p=scr(c,q);if(!inView(v,p))continue;
   const z=clamp(c.F*.7/q[2],2.4,16),lift=roar>0?roar*z*1.1*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hh=hash(i*7+j*13+si,9),ink=hh<.36?0:hh<.6?1:hh<.8?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 // garnet (red + navy), green (blue + yellow), white, Chelsea blue
 s.fill(R,inks[0],.9);s.tone(K,inks[0],.45);s.fill(B,inks[1],.75);s.fill(Y,inks[1],.85);s.knockout(inks[2],.8);s.fill(B,inks[3],.85);
 s.knockout(fascia,.9);s.fill(K,fascia,.8);s.knockout(rim);s.fill(K,rim,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(16*flash);for(let i=0;i<n;i++){const r2=hash(i*29+Math.floor(tt*12)*7,4),q=pr(c,STANDS[i%4](.1+.8*r2,.1+.6*hash(i,Math.floor(tt*12))));if(!q||!inView(v,q))continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** grass in the sun (yellow × blue), mowing stripes, boards, paper lines, both goals (Fluminense's goal at X = 105 can be drawn later when
 * the camera sits behind it) */
function ground(s:Sheet,c:Cam,o:{goalLater?:boolean;bulge?:number}={}){
 const g=polyP(c,[[-9,0,-44],[114,0,-44],[114,0,44],[-9,0,44]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.76);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,[b[0],.9,b[2]],[a[0],.9,a[2]]]));
 board([109.5,0,-30],[109.5,0,30]);board([-4,0,37],[110,0,37]);board([-4,0,-37],[110,0,-37]);
 for(let k=0;k<10;k++){const z=-29+k*6;addPoly(pn,polyP(c,[[109.45,.25,z],[109.45,.25,z+3.2],[109.45,.66,z+3.2],[109.45,.66,z]]));}
 for(const zz of[-36.95,36.95])for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.3,.25,zz],[x+3.3,.66,zz],[x,.66,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.7);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
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
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_T:InkFill[]=[[Y,.55],[R,.38],[K,.12]],SKIN_D:InkFill[]=[[Y,.72],[R,.55],[K,.26]];
/** Chelsea, the 2025–26 AWAY kit (kit template): cream shirt and socks (a light yellow screen on paper), dark green-grey shorts (navy with a
 * yellow overprint, see overprint()); numbers navy (inferred) */
const CHE=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.16],shorts:[K,.8],socks:[Y,.16],boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:K,seed:3,...o});
/** Fluminense, HOME (kit template): the tricolour stripes — a blue shirt striped red, with yellow overprinted on the whole shirt, so the riso
 * mix prints green (blue × yellow) and garnet (blue × red × yellow) stripes; white shorts, white socks; paper numbers (inferred) */
const FLU=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.8],pattern:'stripes',patternInk:[R,.95],shorts:'paper',socks:'paper',boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
/** João Pedro, 1.82 m, No. 20; card: skin 3, black short hair, no facial hair */
const JP:AthleteStyle=CHE({number:20,skin:SKIN_T,hair:[K,.95],hairStyle:'short',build:{height:1.82,bulk:1,thighs:1.03},seed:20});
/** Fábio, 1.88 m, No. 1 — keeper kit INFERRED (drawn yellow), paper gloves, long sleeves */
const FABIO:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,trim:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,shade:[K,.3],gloves:'paper',sleeves:'long',number:1,numberInk:K,build:{height:1.88},seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion); smear = a halftone echo + speed lines for fast limbs; team adds the kit overprint. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean;team?:'che'|'flu'}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
 if(o.team)overprint(s,r,o.team);
 return r;
}
/** the riso overprints a single ink can't give: Fluminense's shirt gets a yellow screen over the whole torso (blue → green, red stripes →
 * garnet; small far figures have no stripes, so they get red too and print garnet overall); Chelsea's navy shorts get a yellow screen
 * (dark green-grey). A hull of the solved joints, pushed out a little; figures drawn later (nearer) knock it out where they overlap. */
function overprint(s:Sheet,r:DrawResult,team:'che'|'flu'){
 const j=r.joints,P=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
 const tl=Math.hypot(j.neck[0]-j.pelvis[0],j.neck[1]-j.pelvis[1]);if(tl<2)return;
 const pts:Pt[]=team==='flu'?[j.neck,j.lSh,j.rSh,P(j.lSh,j.lEl,.5),P(j.rSh,j.rEl,.5),P(j.lSh,j.lHip,.84),P(j.rSh,j.rHip,.84),P(j.neck,j.pelvis,.86)]
  :[P(j.pelvis,j.neck,.12),j.lHip,j.rHip,P(j.lHip,j.lKn,.42),P(j.rHip,j.rKn,.42),P(j.pelvis,P(j.lKn,j.rKn,.5),.3)];
 const hull=hull2(pts),cx=hull.reduce((a,p)=>a+p[0],0)/hull.length,cy=hull.reduce((a,p)=>a+p[1],0)/hull.length,w=tl*(team==='flu'?.1:.05);
 const path=polyPath(hull.map(p=>{const dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1;return[p[0]+dx/l*w,p[1]+dy/l*w] as Pt;}),true);
 if(team==='flu'){s.fill(Y,path,.88);if(r.detail==='low')s.fill(R,path,.7);}else s.fill(Y,path,.55);
}
function hull2(p:Pt[]):Pt[]{const a=p.slice().sort((u,v)=>u[0]-v[0]||u[1]-v[1]),cr=(o:Pt,u:Pt,v:Pt)=>(u[0]-o[0])*(v[1]-o[1])-(u[1]-o[1])*(v[0]-o[0]),lo:Pt[]=[],hi:Pt[]=[];
 for(const q of a){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=a.length-1;i>=0;i--){const q=a[i];while(hi.length>1&&cr(hi[hi.length-2],hi[hi.length-1],q)<=0)hi.pop();hi.push(q);}
 return lo.slice(0,-1).concat(hi.slice(0,-1));}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds from João Pedro's touch)
type Role='jp'|'che'|'flu'|'gk';
type Move={kind:'pass'|'dive'|'head';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** the beats: Neto's cross, Silva's header clear, the touch (τ 0), the set, the strike, the net */
const T_CROSS=-2.55,T_HEAD=-1.3,SET=.62,SHOT=.95,FLIGHT=.92,IN_NET=SHOT+FLIGHT;
const ACTORS:Actor[]=[
 {name:'João Pedro',role:'jp',style:JP,key:true,keys:[[-5,84.6,-12.4],[-2.5,85.6,-10.9],[-1.2,86.5,-9.9],[0,87.25,-9.15],[.4,87.6,-8.85],[SET,87.75,-8.7],[SHOT,87.85,-8.6],[1.5,88.4,-8.3],[2.6,89.3,-7.9],[4,90.1,-7.4],[6,90.8,-7],[9,91.2,-6.8]]},
 {name:'Neto',role:'che',style:CHE({number:7,build:{height:1.72},skin:SKIN_L,seed:7}),key:true,moves:[{kind:'pass',at:T_CROSS,dur:.8,side:'l',power:.55}],
  keys:[[-5,88.5,-30.5],[-3.6,91.4,-29.2],[T_CROSS,93.3,-27.9],[-1.2,94.1,-26.8],[0,94.3,-24.8],[2,93.8,-21],[4,93,-15],[9,92.6,-10.5]]},
 {name:'Thiago Silva',role:'flu',style:FLU({number:3,build:{height:1.83},skin:SKIN_M,hair:[K,.7],seed:33}),key:true,moves:[{kind:'head',at:T_HEAD,dur:.9,side:'r'}],
  keys:[[-5,99.4,-6.6],[-2.6,99.6,-5.8],[T_HEAD,100.05,-5.0],[0,99.4,-5.6],[SHOT,98.6,-6.5],[3,98.2,-6.8],[9,98.4,-6.4]]},
 {name:'Fábio',role:'gk',style:FABIO,key:true,moves:[{kind:'dive',at:SHOT+.62,dur:.95,side:'l'}],keys:[[-5,104.1,-2.6],[T_HEAD,104.05,-1.8],[0,104,-1.1],[SHOT,104.1,-.7],[9,104.1,-.7]]},
 {name:'Guga',role:'flu',style:FLU({number:23,skin:SKIN_M,seed:23}),keys:[[-5,90.6,-27.4],[T_CROSS,92.1,-26.4],[0,93.6,-22.6],[SHOT,93.8,-21.6],[9,94.5,-18]]},
 {name:'Nonato',role:'flu',style:FLU({number:16,skin:SKIN_D,seed:16}),keys:[[-5,93.6,-8],[T_HEAD,93.2,-8.6],[0,91.2,-9.2],[SHOT,90.1,-9.2],[3,89.9,-9],[9,90.4,-8.6]]},
 {name:'Ignácio',role:'flu',style:FLU({number:4,build:{height:1.86},skin:SKIN_L,seed:4}),keys:[[-5,100.1,-12],[T_HEAD,100.6,-10.4],[0,99.6,-10.8],[SHOT,99,-11.4],[9,99.2,-11]]},
 {name:'Thiago Santos',role:'flu',style:FLU({number:29,build:{height:1.85},skin:SKIN_D,seed:29}),keys:[[-5,100.2,1.6],[T_HEAD,100.6,.4],[0,100,-.6],[SHOT,99.6,-1.4],[9,99.8,-1]]},
 {name:'Renê',role:'flu',style:FLU({number:6,skin:SKIN_M,seed:6}),keys:[[-5,99.4,10.5],[T_HEAD,100.6,7.6],[0,100.4,5.4],[SHOT,100,4.6],[9,100.2,5]]},
 {name:'Hércules',role:'flu',style:FLU({number:35,skin:SKIN_D,seed:35}),keys:[[-5,93.4,-1],[T_HEAD,93.9,-2.6],[0,93.2,-4.2],[SHOT,92.6,-4.8],[9,93,-4.4]]},
 {name:'Bernal',role:'flu',style:FLU({number:5,skin:SKIN_L,seed:55}),keys:[[-5,94.2,4.6],[T_HEAD,95,3],[0,94.6,1.6],[SHOT,94.2,.8],[9,94.4,1.2]]},
 {name:'Palmer',role:'che',style:CHE({number:10,build:{height:1.85,bulk:.95},seed:10}),keys:[[-5,96,-3.4],[T_HEAD,99.2,-2.6],[0,98.4,-1.6],[SHOT,98,-1.2],[2.6,94.6,-3.6],[5,92.8,-4.4],[9,92.6,-4.3]]},
 {name:'Nkunku',role:'che',style:CHE({number:18,skin:SKIN_D,build:{height:1.75},seed:18}),keys:[[-5,97.4,5.2],[T_HEAD,100.9,3],[0,100.4,2.4],[SHOT,99.9,2],[2.8,95.8,-1.6],[5,93.4,-3],[9,93.2,-3.2]]},
 {name:'Enzo',role:'che',style:CHE({number:8,hairStyle:'long',seed:8}),keys:[[-5,86,1.6],[T_HEAD,88.2,.6],[0,89,-.4],[SHOT,89.2,-.8],[3,89.6,-3.4],[9,89.9,-4.4]]},
 {name:'Caicedo',role:'che',style:CHE({number:25,skin:SKIN_D,seed:25}),keys:[[-5,76.8,-3],[0,79.2,-5],[SHOT,79.6,-5.2],[9,82,-6]]},
 {name:'Gusto',role:'che',style:CHE({number:27,skin:SKIN_D,seed:27}),keys:[[-5,86.2,21],[0,89.6,18.2],[SHOT,90.2,17.4],[9,90.6,12]]},
 {name:'Arias',role:'flu',style:FLU({number:21,skin:SKIN_M,seed:21}),keys:[[-5,85.2,-1.2],[0,86.6,-2.8],[SHOT,86.8,-3.2],[9,87.4,-3.6]]},
];
const JPK=0,NETO=1,SILVA=2,GK=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-5,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Neto's cross, Silva's header, the touch, the curl
/** the top right corner the curl finishes in (inside the far post, under the bar) and where it drops in the net */
const NET:V3=[105.35,2.04,3.0],REST:V3=[106.3,.11,2.7];
/** the shot: the ball leaves his right boot here, just left of the D (the D's arc spans z ≈ ±7.3 at x 88.5); the curl bends right-to-left
 * (inside of the right foot) from a line aimed outside the far post back into the top right corner: a quadratic curve on the ground plane
 * with a rising-then-dipping height */
const SHOT_FROM:V3=[88.5,.11,-8.1];
const BEND=2.7;
const CURL:Pt=(()=>{const dx=NET[0]-SHOT_FROM[0],dz=NET[2]-SHOT_FROM[2],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l;return[(SHOT_FROM[0]+NET[0])/2+rx*BEND,(SHOT_FROM[2]+NET[2])/2+rz*BEND];})();
function curlAt(u:number):V3{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*SHOT_FROM[0]+b*CURL[0]+c*NET[0],.11+(NET[1]-.11)*u+4.6*u*(1-u),a*SHOT_FROM[2]+b*CURL[1]+c*NET[2]];}
const yawJP=(tau:number)=>{const[x,z]=posOf(JPK,tau);if(tau<0){const b=ballAt(tau);return yawOf(b[0]-x,b[2]-z);}
 const g=yawOf(NET[0]-x,NET[2]-z),aim=yawOf(CURL[0]-SHOT_FROM[0],CURL[1]-SHOT_FROM[2]);return lerpA(g,aim,sm(SET-.3,SHOT-.15,tau));};
/** his ball spot for the right foot: ahead and a touch to his right */
const footAt=(tau:number):[number,number]=>{const p=posOf(JPK,tau),y=yawJP(Math.max(0,tau)),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)];return[p[0]+f[0]*.55+r[0]*.14,p[1]+f[1]*.55+r[1]*.14];};
/** Neto's left foot as he carries it and crosses */
const netoFoot=(tau:number):V3=>{const[x,z]=posOf(NETO,tau),v=velOf(NETO,tau),l=Math.hypot(v[0],v[1])||1;return[x+v[0]/l*.5-.12,.11,z+v[1]/l*.5-.12];};
const C0:V3=netoFoot(T_CROSS);
/** Silva's forehead at the header (he rises a little): the cross arrives here */
const HEAD:V3=(()=>{const[x,z]=posOf(SILVA,T_HEAD);return[x-.22,2.1,z+.08];})();
const E0:V3=(()=>{const f=footAt(0);return[f[0],.2,f[1]];})(),E2:V3=(()=>{const f=footAt(SET);return[f[0],.11,f[1]];})();
/** a ground roll from a to b over u ∈ [0,1], slowing down (dec = how much) */
const roll=(a:V3,b:V3,u:number,dec=.5):V3=>{const x=clamp(u);return lerp3(a,b,x*(1+dec)-dec*x*x);};
/** a lofted flight a → b over u with an apex `h` above the straight line */
const loft=(a:V3,b:V3,u:number,h:number):V3=>{const x=clamp(u),p=lerp3(a,b,x);return[p[0],p[1]+4*h*x*(1-x),p[2]];};
function ballAt(tau:number):V3{
 if(tau<T_CROSS){const f=netoFoot(tau);return f;}
 if(tau<T_HEAD)return loft(C0,HEAD,(tau-T_CROSS)/(T_HEAD-T_CROSS),3.2);
 if(tau<0)return loft(HEAD,E0,(tau+T_HEAD*-1)/-T_HEAD,3.6);
 if(tau<SET)return roll(E0,E2,tau/SET,.7);
 if(tau<SHOT)return roll(E2,SHOT_FROM,(tau-SET)/(SHOT-SET),.4);
 if(tau<IN_NET)return curlAt((tau-SHOT)/FLIGHT);
 const u=clamp((tau-IN_NET)/.55),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],u*u),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (degrees via posed; athlete.ts clamps to real range of motion)
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:28,lKnee:40,rKnee:38,lHipA:8,rHipA:8,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** receiving the dropping ball: eyes up on it, knees soft, arms out, the right foot lifting to cushion it */
const RECEIVE:Partial<Pose>={lean:6,lKnee:30,rKnee:44,rHipF:34,lShA:40,rShA:34,lElb:36,rElb:36,neckP:-14};
/** setting himself: a small hop-step, the standing (left) foot planted wide, hips and chest opening toward the far post, left arm out */
const OPEN:Partial<Pose>={lShA:72,lShF:18,twist:-12,roll:-9,neckY:-6,lKnee:38,squash:-.04};
/** no celebration: both hands up at chest height, palms open to the Fluminense fans, head a little down — "up went the hands, in apology" */
const SORRY:Partial<Pose>={lShF:78,rShF:78,lShA:36,rShA:36,lElb:62,rElb:62,lShR:30,rShR:30,lHand:1,rHand:1,neckP:18,lean:2};
const SHOT_D=.82;
let _shift:[number,number]|null=null;
function jpShift():[number,number]{if(_shift)return _shift;const[x,z]=posOf(JPK,SHOT),yaw=yawJP(SHOT),sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.7}),JP.build,{x,z,yaw});
 return _shift=[SHOT_FROM[0]-lerp(sk.rToe[0],sk.rAn[0],.4),SHOT_FROM[2]-lerp(sk.rToe[2],sk.rAn[2],.4)];}
function placeOf(k:number,tau:number,yaw:number):Place{const[x,z]=posOf(k,tau);if(k===JPK){const d=jpShift(),w=sm(SHOT-.6,SHOT-.2,tau)*(1-sm(SHOT+.5,SHOT+1,tau));return{x:x+d[0]*w,z:z+d[1]*w,yaw};}return{x,z,yaw};}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(JPK,tau),b=ballAt(tau);
 let yaw=sp>.6?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk')yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(-1,.3),sm(SHOT,SHOT+.4,tau));
 if(a.role==='flu'&&sp<1.2)yaw=yawOf(b[0]-x,b[2]-z);
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.3):a.role==='flu'?READY:stand();
 if(k===JPK){
  yaw=yawJP(tau);
  if(tau>IN_NET+.2)yaw=lerpA(yaw,yawOf(1,-.9),sm(IN_NET+.2,IN_NET+1.2,tau));
  const s=clamp((sp-1)/4),run=runCycle(distOf(JPK,tau)/3.2,{speed:.3+.5*s}),dr=dribble(distOf(JPK,tau)/1.4,{foot:'r',speed:.3});
  p=blendPose(stand(),tau<0?run:dr,clamp((sp-.25)/.7));
  p=over(p,RECEIVE,bump(-1.1,.45,tau));
  p=over(p,OPEN,bump(SET-.35,SHOT+.1,tau)*.85);
  const u=(tau-(SHOT-STRIKE_CONTACT*SHOT_D))/SHOT_D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.2)p=over(p,SORRY,sm(IN_NET+.2,IN_NET+.9,tau));
  return{p,yaw};}
 if(a.role==='flu'&&sp>.5&&Math.cos(yawOf(v[0],v[1])-yaw)<-.3)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='head'?.52:STRIKE_CONTACT)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='pass'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.3}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(mv.kind==='head'&&u>0&&u<1.3)p=blendPose(p,header(Math.min(1,u)),Math.min(sm(0,.12,u),1-sm(1,1.3,u)));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:1});}}
 // the crosser and the header face where the ball goes
 if(k===NETO&&tau>T_CROSS-.6&&tau<T_CROSS+.3)yaw=yawOf(HEAD[0]-x,HEAD[2]-z);
 if(k===SILVA&&tau>T_HEAD-.7&&tau<T_HEAD+.3)yaw=yawOf(C0[0]-x,C0[2]-z);
 // afterwards: his teammates come to him, arms out (inferred); Fluminense heads drop
 if(a.role==='che'&&tau>IN_NET+.4)p=over(p,{lShA:70,rShA:70,lShF:40,rShF:40,lElb:30,rElb:30,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+1,tau)*.8);
 if(a.role==='che'&&tau>IN_NET+.4&&sp<1.2)yaw=yawOf(m[0]-x,m[1]-z);
 if(a.role==='flu'&&tau>IN_NET+.4)p=over(p,{neckP:40,lean:26,lShA:10,rShA:10,lElb:20,rElb:20},sm(IN_NET+.4,IN_NET+1.2,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print (generic: paper, colour triads, navy key; inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.35);
 const pa=new Path2D(),pb=new Path2D(),tri=(cx:number,cy:number,pr0:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr0,cy+Math.sin(a)*pr0],[cx+Math.cos(b)*pr0*.4,cy+Math.sin(b)*pr0*.4]);}return polyPath(q,true);};
 pa.addPath(tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;(i%2?pa:pb).addPath(tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(K,pa,.8);s.fill(R,pb,.8);s.restore();
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
  const detail=passing?(e.k===JPK?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const fast=(e.k===JPK&&tauP>SHOT-.4&&tauP<SHOT+.3)||(e.k===GK&&tauP>SHOT+.3&&tauP<IN_NET+.3)||(e.k===SILVA&&tauP>T_HEAD-.3&&tauP<T_HEAD+.2);
  const r=drawPlayer(s,q.p,c,{...a.style,shadow:e.h<420?false:undefined,detail},place,{...(big&&!passing?{prev:qp.p,prevPlace,smear:hero&&fast}:{}),team:a.role==='flu'?'flu':a.role==='gk'?undefined:'che'});
  if(e.k===JPK)heroR=r;if(e.k===GK)gkR=r;}
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
/** the ball's flight printed in the air from u0 to u1 of the curl (0 = the boot, 1 = the top corner) */
function curlTrail(s:Sheet,c:Cam,u0:number,u1:number,w:number,ink:string,seed:number,arrow=false){if(w<=0||u1<=u0+.01)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=28;i++){const q=toCam(c,curlAt(lerp(u0,u1,i/28)));if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(13,c.F*.09/d);
 s.knockout(ribbon(pts,wd*1.7,{seed,taper:.2,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{seed,taper:.2,wobble:.8}),.95*w);
 if(arrow){const a=pts[pts.length-3],b=pts[pts.length-1];laneArrow(s,ink,a,b,wd,{seed:seed+1,head:wd*3.2,cov:.95*w});}}
/** the straight line he'd get with no curl (boot → a point outside the far post): a dashed navy line, so the bend reads against it */
function noCurlLine(s:Sheet,c:Cam,w:number,seed:number){if(w<=0)return;const a=curlAt(0),dir=[CURL[0]-SHOT_FROM[0],CURL[1]-SHOT_FROM[2]],L=(105-SHOT_FROM[0])/dir[0],p=new Path2D();
 for(let i=0;i<9;i++){const u0=i/9,u1=u0+.055;const A:V3=[a[0]+dir[0]*L*u0,.11+2.6*u0,a[2]+dir[1]*L*u0],Bq:V3=[a[0]+dir[0]*L*u1,.11+2.6*u1,a[2]+dir[1]*L*u1];seg3(c,A,Bq,.1,p,2.5);}
 s.knockout(p,.7*w);s.fill(K,p,.8*w);}
/** a target in the goal mouth at the top right corner (rings in the goal plane) */
function cornerTarget(s:Sheet,c:Cam,w:number,seed:number){if(w<=0)return;for(const [rad,ink] of [[.62,R],[.3,Y]] as [number,string][]){const pts:Pt[]=[];for(let i=0;i<30;i++){const q=pr(c,[105.02,NET[1]+Math.sin(i/30*TAU)*rad*w,NET[2]+Math.cos(i/30*TAU)*rad*w]);if(q)pts.push(q);}
 if(pts.length<24)continue;const d=toCam(c,[105,NET[1],NET[2]])[2],rr=ribbon(pts,Math.max(10,c.F*.05/d),{close:true,seed:seed+rad*10,taper:0,wobble:1});s.knockout(rr,.9);s.fill(ink,rr,.95);}}
/** the keeper's reach: a half-disc in the goal mouth around his standing spot — the curl stays outside it */
function reachZone(s:Sheet,c:Cam,w:number,seed:number){if(w<=0)return;const[gx,gz]=posOf(GK,SHOT),R0=2.6*w,pts:Pt[]=[];
 for(let i=0;i<=24;i++){const a=i/24*Math.PI,q=pr(c,[gx+.3,Math.sin(a)*R0,gz+Math.cos(a)*R0]);if(q)pts.push(q);}
 if(pts.length<20)return;const d=toCam(c,[gx,1,gz])[2],area=polyPath(pts,true);s.tone(R,area,.3*w);
 const rr=ribbon(pts,Math.max(10,c.F*.05/d),{seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(R,rr,.95*w);}
/** an arrow on the grass from a point toward another */
function groundArrow(s:Sheet,c:Cam,from:[number,number],to:[number,number],w:number,seed:number,ink=Y,len=1){if(w<=0)return;const dx=to[0]-from[0],dz=to[1]-from[1],l=Math.hypot(dx,dz)||1;
 const a=pr(c,[from[0]+dx/l*.6,.02,from[1]+dz/l*.6]),b=pr(c,[from[0]+dx/l*(.6+len),.02,from[1]+dz/l*(.6+len)]);if(!a||!b)return;const wd=Math.max(12,c.F*.14/toCam(c,[from[0],0,from[1]])[2]);
 s.knockout(ribbon([a,b],wd*1.6,{seed,taper:.1}),.8*w);laneArrow(s,ink,a,b,wd,{progress:w,seed:seed+1,head:wd*3});}
/** a ring round the right boot */
function bootRing(s:Sheet,hero:DrawResult|undefined,w:number,seed:number){if(!hero||w<=0)return;const toe=hero.joints.rToe,an=hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*w+3,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.85]);}
 s.knockout(ribbon(pts,Math.max(5,r*.3),{seed,close:true,taper:0,wobble:.8}),.8*w);s.fill(R,ribbon(pts,Math.max(3,r*.18),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** open palms: two small yellow sparks at his hands (the apology) */
function palms(s:Sheet,hero:DrawResult|undefined,w:number,seed:number){if(!hero||w<=0)return;for(const [h,sd] of [[hero.joints.lHa,0],[hero.joints.rHa,1]] as [Pt,number][])sparkBurst(s,Y,h[0],h[1],Math.max(12,hero.heightPx*.14),{n:6,seed:seed+sd,g:w,width:Math.max(3,hero.heightPx*.022)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const nc=CUEW(0,'Neto crosses'),ts=CUEW(0,'Thiago Silva'),bo=CUEW(0,'but only'),hc=CUEW(0,'He curls it'),it=CUEW(0,'into the top'),S=SECS(0);
 return key(t,mono([[0,T0+.1],[nc-.3,T_CROSS-.3],[ts,T_HEAD-.05],[bo,-.5],[hc,SHOT-.1],[it,IN_NET-.05],[S+1,IN_NET-.05+(S+1-it)]]),linear);};
const CAM1:V3=[88,24,-74];
function cam1(t:number):Cam{
 const tau=tau1(t),it=CUEW(0,'into the top'),bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3-1,1.1,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[84,8,-4],nf=CUEW(0,'new striker'),nc=CUEW(0,'Neto crosses'),toBall=sm(CUEW(0,'faces')-.2,nc,t,easeInOutSine),m=posOf(JPK,tau),cel:V3=[m[0]+.5,1.1,m[1]],toE=sm(it+.7,it+1.9,t,easeInOutSine);
 const gl:V3=[97,1.1,-4],toGoal=sm(CUEW(0,'He curls')-.3,it,t,easeInOutSine)*(1-toE);
 // "new striker": the camera finds him waiting at the edge of the box before the move
 const jp:V3=[m[0]+1,1.1,m[1]],toJ=bump(nf-.3,CUEW(0,'faces')+.4,t);
 const T=lerp3(lerp3(lerp3(lerp3(open,jp,toJ),bt,toBall),gl,toGoal),cel,toE);
 const F=key(t,[[0,1500],[nf,3600],[CUEW(0,'faces'),3600],[nc,5200],[CUEW(0,'Thiago'),5600],[CUEW(0,'but only'),6600],[CUEW(0,'He curls'),5600],[it+.4,5600],[it+1.9,8200],[SECS(0),8600]],easeInOutSine);
 return look(CAM1,T,F);}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),nf=CUEW(0,'new striker'),nc=CUEW(0,'Neto crosses'),ts=CUEW(0,'Thiago Silva'),bo=CUEW(0,'but only');
  // "into the top corner": the whole bowl roars and flashes
  stadium(s,c,v,t,{roar:Math.max(.35*bump(0,1.6,t),sm(IN_NET,IN_NET+.5,tau)),flash:sm(IN_NET+.1,IN_NET+.4,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  const m=posOf(JPK,tau),n=posOf(NETO,tau),si=posOf(SILVA,tau);
  // "new striker": a yellow ring under him; "Neto crosses": a yellow ring under Neto; "Thiago Silva clears": a red ring under Silva;
  // "but only to him": the yellow ring back under him as the ball drops
  groundRing(s,c,m[0],m[1],1.1,1.1,Math.max(sm(nf-.1,nf+.3,t,easeOutBack)*(1-sm(nf+1.4,nf+1.8,t)),sm(bo-.1,bo+.3,t,easeOutBack)*(1-sm(bo+1.4,bo+1.8,t))),Y,5);
  groundRing(s,c,n[0],n[1],1.1,1.1,sm(nc-.1,nc+.3,t,easeOutBack)*(1-sm(nc+1,nc+1.4,t)),Y,6);
  groundRing(s,c,si[0],si[1],1.1,1.1,sm(ts-.1,ts+.3,t,easeOutBack)*(1-sm(ts+1.1,ts+1.5,t)),R,7);
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(JPK,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:7,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a low camera behind him: the touch, the open body
const tau2=(t:number)=>{const ot=CUEW(1,'One touch'),ho=CUEW(1,'He opens'),fp=CUEW(1,'far post'),S=SECS(1);
 return key(t,mono([[0,-1.05],[CUEW(1,'slowly'),-.6],[ot,-.02],[ot+.9,.3],[ho,SET-.2],[fp,SHOT-.3],[S,SHOT-.2]]),linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(JPK,tau),b=ballAt(tau),bw=clamp(1-Math.hypot(b[0]-m[0],b[2]-m[1])/9),push=sm(CUEW(1,'One touch')-.3,CUEW(1,'He opens'),t,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine);
 const C:V3=[m[0]-6.8-2*open+1.1*push,1.45+.5*open,m[1]-4.8-1.2*open+.7*push],T:V3=[m[0]+1.6+(b[0]-m[0])*.25*bw,.95+Math.min(1.4,b[1]*.25),m[1]+1.4];
 return look(C,T,2350+450*push-350*open);}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ot=CUEW(1,'One touch'),ho=CUEW(1,'He opens'),fp=CUEW(1,'far post'),S=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  // "One touch": a yellow ring on the grass where the ball comes down
  groundRing(s,c,E0[0],E0[2],.8,.8,sm(ot-.1,ot+.35,t,easeOutBack)*(1-sm(ho-.1,ho+.3,t)),Y,41);
  // "He opens his body towards the far post": a yellow arrow along the grass from him to the far post, and a ring at the far post
  const m=posOf(JPK,Math.min(tau,SHOT)),ow=sm(ho-.1,ho+.5,t,easeOut)*(1-sm(S-.7,S-.35,t));
  groundArrow(s,c,m,[105,3.66],ow,43,Y,5.5);
  groundRing(s,c,105,3.66,1.1,1.1,sm(fp-.1,fp+.35,t,easeOutBack)*(1-sm(S-.7,S-.35,t)),Y,45);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(JPK,tau2(t)),q=toCam(c,[x,1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:3,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the swerve, the dip, then the apology
const tau3=(t:number)=>{const sw=CUEW(2,'The ball swerves'),dp=CUEW(2,'dips'),pf=CUEW(2,'past Fábio'),it=CUEW(2,'into the top'),nc=CUEW(2,'No celebration'),S=SECS(2);
 return key(t,mono([[0,SHOT-.7],[sw,SHOT-.02],[dp,SHOT+.4],[pf,SHOT+.66],[it,IN_NET-.03],[nc,IN_NET+.7],[S,IN_NET+.7+(S-nc)*.9]]),linear);};
const swing3=(t:number)=>sm(CUEW(2,'No celebration')-.2,CUEW(2,'No celebration')+1.1,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(JPK,tau),u=swing3(t),sw=sm(CUEW(2,'The ball')-.3,CUEW(2,'past Fábio'),t,easeInOutSine);
 const C0:V3=[112.5,4.6,9.5],T0:V3=[lerp(93,99,sw),lerp(1,1.45,sw),lerp(-6.5,-1.2,sw)];
 const C1:V3=[m[0]+5.2,1.9,m[1]-5.4],T1:V3=[m[0]+.2,1.25,m[1]+.3];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2400-300*sw,2700,u));}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),sw=CUEW(2,'The ball swerves'),dp=CUEW(2,'dips'),pf=CUEW(2,'past Fábio'),it=CUEW(2,'into the top'),nc=CUEW(2,'No celebration'),rh=CUEW(2,'he raises'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)*(1-.6*u),flash:sm(it-.1,it+.3,t)*(1-u)});
  ground(s,c,{goalLater:u<.5});
  // "swerves and dips": the ball's path printed in the air behind it as it bends and drops
  const fl=clamp((tau-SHOT)/FLIGHT);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({hero,gk})=>{
   curlTrail(s,c,0,fl,sm(sw-.2,sw+.1,t)*(1-sm(nc-.2,nc+.4,t)),Y,61);
   // "past Fábio": a red spark at his glove as the ball flies beyond it
   if(gk){const hw=bump(pf-.1,pf+.9,t);if(hw>0){const hnd=gk.joints.lHa;sparkBurst(s,R,hnd[0],hnd[1],Math.max(14,gk.heightPx*.18),{n:7,seed:71,g:hw,width:Math.max(4,gk.heightPx*.03)});}}
   // "he raises his hands": his open palms light up
   if(u>.6)palms(s,hero,sm(rh-.1,rh+.35,t,easeOutBack)*(1-sm(rh+1.6,rh+2.2,t)),81);}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  // "into the top corner": a spark in the top right corner
  const cw=sm(it-.15,it+.25,t,easeOutBack)*(1-sm(nc,nc+.4,t));
  if(cw>0){const q=pr(c,[105,NET[1],NET[2]]);if(q){const d=toCam(c,NET)[2];sparkBurst(s,Y,q[0],q[1],c.F*1.1/d,{n:10,seed:75,g:cw,width:Math.max(6,c.F*.08/d)});}}
  // "dips": a short red tick where the ball starts to drop
  if(dp>0){const dw=bump(dp-.1,dp+1,t),q=pr(c,curlAt(.72));if(dw>0&&q){const d=toCam(c,curlAt(.72))[2];sparkBurst(s,R,q[0],q[1],c.F*.7/d,{n:5,seed:77,g:dw,width:Math.max(4,c.F*.05/d)});}}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(JPK,tau3(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.2/q[2]),12);},
 still:2,
};

// ---------------------------------------------------------------- 4 · the lesson: from behind the shooter, looking at the far corner
const tau4=(t:number)=>{const S=SECS(3),ob=CUEW(3,'open your body'),cb=CUEW(3,'curl the ball'),ba=CUEW(3,'bends away'),tk=CUEW(3,'the keeper');
 return key(t,mono([[0,SET-.35],[ob,SET],[cb-.2,SHOT-.02],[cb+.5,SHOT+.02],[ba,SHOT+.2],[tk,SHOT+.6],[S,IN_NET+.2]]),linear);};
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(JPK,Math.min(tau,SHOT)),push=sm(CUEW(3,'open')-.3,CUEW(3,'curl the ball')+.4,t,easeInOutSine),out=sm(CUEW(3,'curl the ball')+.2,CUEW(3,'bends away')+.3,t,easeInOutSine);
 const C:V3=[m[0]-5+1.1*push-1.6*out,1.7+.6*out,m[1]-4.4+.9*push-1.1*out],T0:V3=[m[0]+1.5,.8,m[1]+1.2],T1:V3=[100.5,1.4,-.5];
 return look(C,lerp3(T0,T1,out),lerp(2300+500*push,2700,out));}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),ob=CUEW(3,'open your body'),cb=CUEW(3,'curl the ball'),ba=CUEW(3,'bends away'),tk=CUEW(3,'the keeper'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  const m=posOf(JPK,Math.min(tau,SHOT));
  // "open your body": a yellow arrow on the grass from his planted foot toward the far post (the line his hips open to)
  groundArrow(s,c,m,[105,3.66],sm(ob-.1,ob+.5,t,easeOut)*(1-sm(cb+.3,cb+.7,t)),91,Y,4.5);
  // "the keeper": the red half-disc he can reach; the curl stays outside it
  reachZone(s,c,sm(tk-.1,tk+.45,t,easeOutBack)*(1-sm(E-.6,E-.2,t)),95);
  // "bends away": the straight line (dashed navy) the ball would take with no curl, and the target in the top corner
  noCurlLine(s,c,sm(ba-.1,ba+.4,t)*(1-sm(E-.6,E-.2,t)),96);
  cornerTarget(s,c,sm(ba-.1,ba+.4,t,easeOutBack)*(1-sm(E-.6,E-.2,t)),97);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "curl the ball": a ring round the right boot at contact, then the whole bend printed as a yellow arrow (it starts outside the far
   // post and bends back in, right to left)
   bootRing(s,hero,sm(cb-.1,cb+.3,t,easeOutBack)*(1-sm(ba-.1,ba+.3,t)),93);
   curlTrail(s,c,0,1,sm(cb+.1,cb+.6,t)*(1-sm(E-.6,E-.2,t)),Y,99,true);}});
 },
 still:4,
};

const film:RisoStory={
 id:'joao-pedro-signature',format:'11v11',title:"João Pedro's curler",theme:'Open your body and curl the ball so it bends away from the keeper',
 ageNote:'Club World Cup semi-final, Fluminense v Chelsea, MetLife Stadium, New Jersey, 8 July 2025. For players of every age.',
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
/** Solved contacts (pitch metres; Fluminense's goal line at X = 105) — checked by the film test. */
export const FACTS={SHOT_FROM,NET,CURL,SHOT,IN_NET,T_HEAD,HEAD,ballAt,curlAt,jpRightToeAt:(tau:number)=>{const q=poseOf(JPK,tau);return solve(q.p,JP.build,placeOf(JPK,tau,q.yaw)).rToe;},
 posOf:(name:string,tau:number)=>posOf(ACTORS.findIndex(a=>a.name===name),tau),fabioReachAt:(tau:number)=>{const q=poseOf(GK,tau),sk=solve(q.p,FABIO.build,placeOf(GK,tau,q.yaw));return[sk.lHa,sk.rHa];},
 silvaHeadAt:(tau:number)=>{const q=poseOf(SILVA,tau),sk=solve(q.p,ACTORS[SILVA].style.build,placeOf(SILVA,tau,q.yaw));return sk.head;}};
