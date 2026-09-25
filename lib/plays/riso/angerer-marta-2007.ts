/** Nadine Angerer saves Marta's penalty — Germany 1–0 Brazil (final score 2–0), 2007 FIFA Women's World Cup final, Hongkou Football
 * Stadium, Shanghai, Sunday 30 September 2007 (20:00 local kick-off, 64th minute). An iconic-play riso film (RisoStory, chapters mode) played
 * by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction of the kick and the save from WRITTEN accounts
 * (the broadcast footage was not reviewed; no photograph of the save was available), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 with curl, cached in the film scratchpad src-cache/):
 *  - Wikipedia, "2007 FIFA Women's World Cup final" (30 September 2007, 20:00 CST, Hongkou Football Stadium, Shanghai, 31,000; referee
 *    Tammy Ogston (Australia); Germany 2–0 Brazil, Prinz 52', Laudehr 86'; Bresonik booked 63'; the line-ups and shirt numbers (Angerer 1,
 *    Marta 10, Cristiane 11; Ester off / Rosana on 63'); the kit boxes: Germany white shirts, black shorts, white socks; Brazil yellow
 *    shirts, blue shorts, blue socks; "Germany had not conceded a single goal in the whole competition"; Marta had scored 7)
 *    https://en.wikipedia.org/wiki/2007_FIFA_Women%27s_World_Cup_final
 *  - Wikipedia, "Nadine Angerer" (1.75 m; first choice after Rottenberg's injury; "did not concede a single goal" all tournament, a record
 *    540 minutes; "blocking a penalty kick by Marta in the 2–0 final"; a penalty-saving specialist) https://en.wikipedia.org/wiki/Nadine_Angerer
 *  - de.wikipedia, "Fußball-Weltmeisterschaft der Frauen 2007" (the final: "In der 64. Minute brachte Linda Bresonik Cristiane im Strafraum zu
 *    Fall. Den anschließenden Elfmeter von Marta konnte Nadine Angerer jedoch parieren"; Marta top scorer with 7 and best player; Angerer
 *    best goalkeeper; Germany the first team to win the title without conceding) https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_der_Frauen_2007
 *  - The Guardian (staff and agencies), "Germany win World Cup", 30 Sep 2007 ("Marta ... failed to beat Nadine Angerer from the spot after
 *    Linda Bresonik had felled Cristiane"; Germany completed the tournament without conceding) https://www.theguardian.com/football/2007/sep/30/newsstory.sport6
 *  - lib/plays/riso/marta-spin-2007.ts (same tournament, read-only): Marta's look (1.62 m, slim build, dark ponytail, number 10, left-footed).
 * CONFIRMED: the date, venue, evening kick-off, crowd, referee; Germany led 1–0 (Prinz 52'); in the 64th minute Bresonik fouled Cristiane in
 *  the box; Marta (10), the tournament's top scorer, took the penalty; Angerer (1) saved / parried it; Germany won 2–0 and Angerer conceded
 *  no goal in the whole tournament. Kits: Germany white / black / white; Brazil yellow / blue / blue.
 * INFERRED (illustrative, not narrated): Marta's kicking foot (drawn LEFT, her stronger foot) and her run-up (≈4.6 m, from her right at
 *  ≈20°); the side and height of the kick and of the dive (drawn: low-to-mid, to Angerer's right, both palms parrying it wide of her right
 *  post — the narration only says "dives" and "pushed away"); where the ball went after the save; which end and which touchline; the
 *  shot speed; Angerer's keeper kit (drawn red, long sleeves, light gloves) and hair (short and blonde, from memory); her getting up with
 *  clenched fists; teammates running to her and Brazil's reaction; who stood where outside the box (7 of each side, numbers from the
 *  line-up); Ogston's kit (drawn black) and gesture; hair and builds of the others; Hongkou's look (a football-only bowl close to the
 *  pitch under a ring roof, floodlights), the crowd's colours and flags, every camera position and lens, and the replay speed.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the bowl → the box, 1–0 → the referee points
 * to the spot, Marta sets the ball → Angerer patient on her line → the run, the left-foot kick, the dive → "Saved!", she gets up, teammates
 * run in); ch2 = the slow-motion replay, LOW from behind the penalty spot off Marta's right shoulder (Angerer waits, reads the run, then
 * springs; a riso trail on the ball; the palms push it away); ch3 = the second replay angle from BEHIND THE GOAL by her right post (the
 * parry flies wide toward the camera, then live again: 2–0 and a clean sheet); ch4 = the lesson: stay patient on your line (the goal line
 * glows under her) → read the kicker (a sight line; her run traced on the grass; a ring on the hips and an arrow where they point) → dive
 * with strong hands (a red dive arrow, a yellow burst at the palms). Composed on the FULL sheet (world units = sheet units centred on the
 * canvas; never sheet.safe), framing from the 1.45:1 card window down to square. Figures: every body goes through ONE adapter,
 * drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion so the ponytails swing, motionSmear on the run,
 * the kick and the dive); women's builds (1.62–1.78 m, slimmer bulk) with ponytails (Angerer short hair); small wide-shot figures and every
 * figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward Germany's goal, y up, +z = the main-stand
 * side), athlete.ts's own convention, so Marta's LEFT boot strikes with no mirrored projector; Angerer faces −x, so her RIGHT is −z
 * (keeperDive side 'r'). The ball is aimed at Angerer's solved palms, so it always meets her hands. Inks: yellow, red, blue, navy (the
 * grass = yellow under a blue screen). Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos,
 * cameras on ones; all randomness seeded. Budget ≈ 150–320 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Skeleton} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/angerer-marta-2007/timing.json, add
 *   import timingJson from '../../../public/plays/narration/angerer-marta-2007/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word only, in order — so no cue starts with a word that also appears between it and the previous
 * cue's first word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The save, live',text:"Shanghai, the 2007 World Cup final. Germany lead Brazil one-nil, then Brazil win a penalty. Marta, the tournament's top scorer, steps up. Nadine Angerer waits on her line... Marta shoots. Angerer dives. Saved!",tail:2.4,
  cues:['Shanghai','Germany lead','then Brazil','Marta, the','Nadine Angerer','Marta shoots','Angerer dives','Saved']},
 {label:'Watch it again',text:"Watch it again, slowly. Angerer stays patient. She reads Marta's run, then dives. Strong hands!",tail:1.6,
  cues:['Watch it again','stays patient','reads','then dives','Strong hands']},
 {label:'Never beaten',text:'From behind the goal: pushed away! Germany won two-nil, and Angerer let in no goals all tournament.',tail:1.8,
  cues:['From behind','pushed away','Germany won','no goals']},
 {label:'The secret',text:'The secret? Keepers, stay patient on your line. Read the kicker: her run and her hips. Then dive with strong hands.',tail:1.8,
  cues:['The secret','stay patient','Read','run and','hips','dive with','strong hands']},
];
import timingJson from '../../../public/plays/narration/angerer-marta-2007/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('angerer: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('angerer: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Germany's goal line is x = 0 (the kick goes +x), the goal centre z = 0, +z = the main-stand side. */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- Hongkou Football Stadium at night (football-only: the stands sit close to the pitch)
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind Germany's goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-114,10,a),1.2+28*b,-39-30*b],
 (a,b)=>[6+27*b,1.2+25*b,lerp(-54,54,a)],
 (a,b)=>[lerp(10,-114,a),1.2+24*b,39+27*b],
 (a,b)=>[-111-27*b,1.2+25*b,lerp(54,-54,a)],
];
const STAND_COLS=[104,72,104,72],STAND_ROWS=16,WALKS=[[.48],[.48],[.48],[.48]];
/** flags on the stand fronts: [stand, a, kind 0 = Germany (navy | red | yellow bands), 1 = Brazil (yellow, a blue disc), 2 = China (red, a yellow star)] */
const FLAGS:[number,number,number][]=[[0,.36,0],[0,.5,1],[0,.62,2],[0,.78,0],[1,.2,1],[1,.42,0],[1,.64,2],[1,.84,1],[2,.14,0],[2,.32,1],[3,.3,2],[3,.62,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // an autumn night in Shanghai: a deep navy print over the paper, a faint floodlit haze over the bowl
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-700],[1e4,hz[1]-700],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.14);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.7,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.8),[0,10.5,0]),add3(S(0,.8),[0,10.5,0])]));
  seg3(c,add3(S(0,.8),[0,10.3,0]),add3(S(1,.8),[0,10.3,0]),.45,edge);}
 s.knockout(planes);s.tone(K,planes,.55);s.tone(B,planes,.24);s.knockout(walk,.5);
 // the crowd: a mostly Chinese crowd in red, Brazil yellow, Germany white, a scatter of blue; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.45?0:h<.72?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.knockout(inks[2],.8);s.fill(Y,inks[2],.95);s.fill(B,inks[3],.85);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 // flags: Germany navy-red-yellow bands; Brazil yellow with a blue disc; China red with a yellow star
 const red=new Path2D(),gold=new Path2D(),navy=new Path2D(),blue=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.07),P(0,.07)]);if(q.length<3)continue;
  if(kind===0){addPoly(navy,polyP(c,[P(0,.049),P(1,.049),P(1,.07),P(0,.07)]));addPoly(red,polyP(c,[P(0,.027),P(1,.027),P(1,.049),P(0,.049)]));addPoly(gold,polyP(c,[P(0,.005),P(1,.005),P(1,.027),P(0,.027)]));}
  else if(kind===1){gold.addPath(polyPath(q,true));addPoly(blue,polyP(c,[P(.36,.025),P(.64,.025),P(.64,.05),P(.36,.05)]));}
  else{red.addPath(polyPath(q,true));addPoly(gold,polyP(c,[P(.12,.05),P(.3,.05),P(.3,.062),P(.12,.062)]));}}
 s.knockout(red);s.knockout(gold);s.knockout(navy);s.fill(R,red,.95);s.fill(Y,gold,.95);s.fill(K,navy,.95);s.fill(B,blue,.95);
 // floodlights along the roof lip with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.8),[0,9.6,0]),b=add3(S(u+.025,.8),[0,9.6,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass under the floodlights, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{goal?:boolean}={}){
 const g=polyP(c,[[-112,0,-42],[9,0,-42],[9,0,42],[-112,0,42]]);if(g.length<3)return;const gp=polyPath(g,true);
 // green = yellow under a blue screen
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.52);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.18);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([4.5,0,-37],[4.5,0,37]);board([-109,0,-37],[4.5,0,-37]);board([-109,0,37],[4.5,0,37]);
 for(let k=0;k<12;k++){const z=-35+k*6.1;addPoly(pn,polyP(c,[[4.4,.25,z],[4.4,.25,z+3.3],[4.4,.68,z+3.3],[4.4,.68,z]]));}
 for(const zz of[-36.9,36.9])for(let k=0;k<18;k++){const x=-107+k*6.3;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 // the penalty spot: a round white disc
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 if(o.goal!==false)goal3(s,c);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep */
function goal3(s:Sheet,c:Cam){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=()=>X+2;
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(),1.9,z0],[back(),0,z0]],[[X,0,z1],[X,H,z1],[back(),1.9,z1],[back(),0,z1]],
  [[X,H,z0],[X,H,z1],[back(),1.9,z1],[back(),1.9,z0]],[[back(),0,z0],[back(),0,z1],[back(),1.9,z1],[back(),1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(),1.9,z],.022,mesh,.7);seg3(c,[back(),1.9,z],[back(),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(),y,zs[i]],[back(),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** women footballers: slimmer athletic builds (the Marta film's WOMAN build) */
const W_BUILD=(height:number,bulk=.88)=>({height,bulk,thighs:1.02,head:1.03});
/** Germany: white shirts, black shorts (navy ink), white socks, black numbers */
const ger=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:K,numberInk:K,hairStyle:'ponytail',shade:[K,.26],build:W_BUILD(1.7),...o});
/** Brazil: yellow shirts, blue shorts and socks, blue numbers */
const bra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[B,.92],socks:[B,.92],boots:K,skin:SKIN_M,hair:[K,.9],line:K,trim:B,numberInk:B,hairStyle:'ponytail',shade:[K,.26],build:W_BUILD(1.66),...o});
const MARTA_B=W_BUILD(1.62,.86);
/** Marta: number 10, dark ponytail (as in the Marta 2007 film) */
const MARTA_ST=bra({number:10,hair:[K,.95],build:MARTA_B,seed:10});
const ANG_B=W_BUILD(1.75,.94);
/** Nadine Angerer: number 1; keeper kit drawn red with long sleeves and light gloves, short blonde hair (both inferred) */
const ANG_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:[K,.8],gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,shade:[K,.26],build:ANG_B,seed:1};
/** referee Tammy Ogston (kit colour inferred: black) */
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:'paper',hairStyle:'ponytail',build:W_BUILD(1.68),seed:30};

// ---------------------------------------------------------------- the kick on one clock τ (seconds; τ = 0 is the contact)
/** the ball on the spot, 11 m out */
const B0:V3=[-11,.11,0];
/** Marta: LEFT foot, approach from her RIGHT (≈ 20°), so the instep opens toward her left — Angerer's right (−z) */
const DIRN=Math.hypot(1,.36),DIR:[number,number]=[1/DIRN,-.36/DIRN];
const YAW_M=yawTo(0,0,DIR[0],DIR[1]);
const SD=.9,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.35,RUN_L=3.2,STRIKE_L=1.4,G_MARK=-(RUN_L+STRIKE_L),G_BALL=-.35;
const POWER=.8;
/** where Marta's pelvis stands at contact so the toe of her LEFT boot meets the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l',power:POWER}),MARTA_B,{x:0,z:0,yaw:YAW_M}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.lToe[0],toe[1]-sk.lToe[2]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];

// ---------------------------------------------------------------- Angerer: patient on her line, set, the dive to her right, the parry, up again
/** she waits until the ball is struck; full stretch at u ≈ .55 of the dive; the palms meet the ball at u = SAVE_U */
const T_DIVE=-.03,DIVE_S=.95,SAVE_U=.58,T_SAVE=T_DIVE+SAVE_U*DIVE_S,DIVE_H=.25;
const ANG_X=-.12;
const ANG_PLACE:Place={x:ANG_X,z:0,yaw:Math.PI};
/** patient on her line: knees bent, weight on the balls of her feet, hands low and open, eyes on the kicker */
const SET=posed({lHipF:46,rHipF:46,lHipA:18,rHipA:18,lKnee:56,rKnee:56,lAnk:-4,rAnk:-4,lean:18,pitch:6,lShA:58,rShA:58,lShF:30,rShF:30,lElb:34,rElb:34,lShR:20,rShR:20,lHand:1,rHand:1,neckP:-12});
/** up on her feet, fists clenched, chest out, head back */
const DIVE_END=keeperDive(1,{side:'r',height:DIVE_H});
const ROAR=posed({dz:DIVE_END.dz,lHipF:26,rHipF:26,lHipA:22,rHipA:22,lKnee:40,rKnee:40,lean:-6,pitch:-2,neckP:-28,lShA:46,rShA:46,lShF:-16,rShF:-16,lElb:104,rElb:104,lShR:10,rShR:10,lHand:0,rHand:0});
const T_UP=1.45,T_ROAR=2.05;
function angPose(tau:number,it:number):Pose{
 let p=blendPose(keeperSet(it*1.1),SET,.9);
 // a tiny forward bounce onto her toes as Marta reaches the ball (patient: no early move)
 if(tau>T_DIVE-.45)p=blendPose(p,keeperSet(.75),sm(T_DIVE-.45,T_DIVE,tau)*.6);
 if(tau>T_DIVE){const u=clamp((tau-T_DIVE)/DIVE_S);p=blendPose(p,keeperDive(u,{side:'r',height:DIVE_H}),sm(T_DIVE,T_DIVE+.05,tau));
  // the parry: stiff wrists, palms locked through the ball for a beat after contact
  const g=sm(T_SAVE-.05,T_SAVE+.05,tau)*(1-sm(T_SAVE+.15,T_SAVE+.4,tau));if(g>0){p.lElb=lerp(p.lElb,0,g);p.rElb=lerp(p.rElb,0,g);}}
 if(tau>T_UP){const u=sm(T_UP,T_ROAR,tau,easeInOutSine);p=blendPose(p,ROAR,u);
  const pump=Math.max(0,Math.sin((tau-T_ROAR)*7))*sm(T_ROAR-.1,T_ROAR+.2,tau);p.lElb-=26*DEG*pump;p.rElb-=26*DEG*pump;p.neckP-=8*DEG*pump;p.lean-=4*DEG*pump;}
 return p;
}
const palms=(sk:Skeleton):V3=>mix3(sk.lHa,sk.rHa,.5);
const angSk=(tau:number,it=0)=>solve(angPose(tau,it),ANG_B,ANG_PLACE);
/** where the ball meets the palms (a hair in front of them, toward the kicker), solved once */
const TGT:V3=(()=>{const g=palms(angSk(T_SAVE));return[g[0]-.1,Math.max(.16,g[1]),g[2]];})();

// ---------------------------------------------------------------- the ball: the kick to the palms, parried wide of the right post
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<T_SAVE){const u=tau/T_SAVE,e=u*(1.12-.12*u);return[lerp(B0[0],TGT[0],e),lerp(B0[1],TGT[1],e)+.14*Math.sin(Math.PI*e),lerp(B0[2],TGT[2],e)];}
 // pushed away: out toward the byline, wide of the post (stays in front of the goal line until it is past the post)
 const u=clamp((tau-T_SAVE)/1.3),e=easeOut(u),y=u<.5?TGT[1]+.75*Math.sin(Math.PI*u/.5*.5)*(1-u/.5)+(.11-TGT[1])*(u/.5)**2:.11+.22*Math.abs(Math.sin(Math.PI*(u-.5)/.5))*(1-u);
 return[TGT[0]+1.3*e*e*e,Math.max(.11,y),TGT[2]-3.6*e];
}
const spinAt=(tau:number)=>tau<=0?0:tau<T_SAVE?TAU*4*tau:TAU*4*T_SAVE-TAU*2*Math.min(tau-T_SAVE,1);

// ---------------------------------------------------------------- Marta: sets the ball, walks back to her mark, the run, the left-foot kick, hands on head
const P_PLACE=posed({lHipF:70,rHipF:40,lKnee:100,rKnee:60,lean:40,pitch:12,neckP:30,lShF:62,rShF:66,lElb:18,rElb:20,lShA:14,rShA:12,lHand:.8,rHand:.8});
const P_WAIT=posed({lHipF:10,rHipF:-4,lKnee:18,rKnee:12,lAnk:-4,rAnk:0,lean:6,pitch:1,neckP:-2,lShA:14,rShA:14,lShF:0,rShF:2,lElb:24,rElb:22});
const P_GO=posed({lHipF:22,rHipF:-18,lKnee:30,rKnee:24,lAnk:-6,rAnk:16,lean:14,pitch:4,neckP:10,lShA:20,rShA:22,lShF:14,rShF:-12,lElb:46,rElb:40,twist:8});
const HANDS_HEAD=posed({lShA:150,rShA:150,lShF:36,rShF:36,lElb:138,rElb:138,lShR:30,rShR:30,neckP:14,lean:10,lHipF:6,rHipF:10,lKnee:12,rKnee:14,lHand:1,rHand:1});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.35);p.air=0;return p;};
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function runG(tau:number){const u=runU(tau);return G_MARK+RUN_L*(1.1*u-.1*u*u);}
function martaPose(tau:number,walk=1,it=0):Pose{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk;if(u<.12)return blendPose(P_PLACE,stand(),sm(0,.12,u));
   const d=Math.abs(G_MARK-G_BALL)*sm(.12,.82,u,linear);let p=walkPose(d*.72);if(u>.82)p=blendPose(p,P_WAIT,sm(.82,1,u));return p;}
  const br=.5+.5*Math.sin(it*2.1),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.35,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 // the run: phase .5 = left foot down, so she arrives on the right (planting) foot for a left-foot kick
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(.5+2.4*u,{speed:.6}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.9+(tau-RUN_END)*1.6,{speed:.55});
 let p=blendPose(run,strike(Math.min(1,us),{foot:'l',power:POWER}),sm(RUN_END,RUN_END+.14,tau));
 // she stops, sees it saved, and her hands go to her head
 if(tau>.6)p=blendPose(p,P_WAIT,sm(.6,1,tau));
 if(tau>1)p=blendPose(p,HANDS_HEAD,sm(1,1.5,tau));
 return p;
}
function martaPlace(tau:number,walk=1):Place{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk,g=lerp(G_BALL,G_MARK,sm(.12,.82,u,linear)),[x,z]=gPos(g);
   return{x,z,yaw:u<.12?YAW_M:lerpAng(lerpAng(YAW_M,YAW_M+Math.PI,sm(.08,.2,u)),YAW_M+TAU,sm(.8,1,u))};}
  const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_M};}
 let g:number;
 if(tau<RUN_END)g=runG(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.9*(1-Math.pow(1-clamp(tau/.9),2));
 const[x,z]=gPos(g);return{x,z,yaw:YAW_M};
}

// ---------------------------------------------------------------- everyone else: waiting outside the box, then the reactions
type Role='ref'|'ar'|'bra'|'ger'|'rush';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const ACTORS:Actor[]=[
 {name:'Ogston',role:'ref',st:REF_ST,x:-13.4,z:8.6,phase:.6},
 {name:'assistant',role:'ar',st:{...REF_ST,hair:[K,.8],seed:31},x:.2,z:-20.6,phase:.1},
];
{// seven of each side along the edge of the box (numbers from the line-up at 64'; positions inferred); three Germany defenders run to Angerer
 const brs:[number,number,number][]=[[11,-19.2,-9.5],[8,-21.5,-5.2],[7,-20.4,4.6],[9,-18.6,10.4],[2,-24,.8],[6,-18.4,-13.8],[5,-22.6,12.8]];
 const grs:[number,number,number,Role][]=[[6,-18.1,-7.6,'rush'],[5,-19.6,-2.8,'rush'],[17,-19.7,2.9,'rush'],[9,-21.2,8.2,'ger'],[2,-18.2,12.2,'ger'],[14,-21.8,-10.8,'ger'],[10,-23.4,4.2,'ger']];
 brs.forEach(([n,x,z],i)=>ACTORS.push({name:'Brazil '+n,role:'bra',st:bra({number:n,skin:i%3===1?SKIN_D:SKIN_M,hair:[K,.9],hairStyle:i%3===2?'curly':'ponytail',build:W_BUILD(1.62+.03*(i%3),.88),seed:40+i,detail:'low'}),x,z,phase:i*.23}));
 grs.forEach(([n,x,z,r],i)=>ACTORS.push({name:'Germany '+n,role:r,st:ger({number:n,hair:i%2===0?[Y,.7]:[K,.75],build:W_BUILD(1.68+.03*(i%3),.9),seed:50+i,detail:'low'}),x,z,phase:i*.31}));}
const HIPS=posed({lShA:30,rShA:30,lShF:-24,rShF:-24,lElb:96,rElb:96,lShR:-40,rShR:-40,lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:6,neckP:2});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const POINT=posed({rShF:62,rShA:42,rElb:6,rHand:1,lShA:16,lElb:24,lHipF:10,rHipF:12,lKnee:14,rKnee:14,lean:6,neckY:14});
const T_RUSH=.55,RUSH_V=6.2;
/** a rusher's spot beside Angerer (she ends up ≈ 2.2 m to her right of the centre, − z) */
const ANG_END:[number,number]=(()=>{const sk=angSk(3);return[sk.pelvis[0],sk.pelvis[2]];})();
function rushPos(a:Actor,tau:number):[number,number,number]{// x, z, speed
 const tx=ANG_END[0]-1.1-.5*a.phase,tz=ANG_END[1]+1.4-2.6*a.phase,L=Math.hypot(tx-a.x,tz-a.z),d=Math.max(0,tau-T_RUSH)*RUSH_V;
 if(d>=L)return[tx,tz,0];const acc=Math.min(1,Math.max(0,tau-T_RUSH)/.5);return[a.x+(tx-a.x)*d/L,a.z+(tz-a.z)*d/L,acc];
}
function actorAt(a:Actor,tau:number,it:number,tpoint=-99):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0]+2,B0[2]),br=Math.sin(it*2.1+a.phase*TAU),saved=sm(T_SAVE+.1,T_SAVE+.6,tau);
 switch(a.role){
  case 'ref':{let p=blendPose(stand(),HIPS,.3+.1*br);if(tpoint>-99)p=blendPose(p,POINT,Math.sin(Math.PI*clamp(tpoint/1.6)));return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-11,0)}};}
  case 'ar':return{pose:blendPose(stand(),HIPS,.2),place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-5,0)}};
  case 'bra':{let p=blendPose(stand(),HIPS,.35+.1*br);if(saved>0)p=blendPose(p,a.phase*10%2<1?HANDS_HEAD:SLUMP,saved*.85);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
  case 'ger':{let p=blendPose(stand(),HIPS,.2+.1*br);if(saved>0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),saved);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
  default:{const[x,z,sp]=rushPos(a,tau);let p=blendPose(stand(),HIPS,.2+.1*br);
   if(tau>T_RUSH){const d=Math.max(0,tau-T_RUSH)*RUSH_V;p=blendPose(p,runCycle(d/3.9+a.phase,{speed:.85}),sm(T_RUSH,T_RUSH+.25,tau)*(sp>0?1:0));if(sp===0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),.8);}
   const yaw=tau>T_RUSH?yawTo(a.x,a.z,ANG_END[0],ANG_END[1]):toBall;return{pose:p,place:{x,z,yaw}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the run, the kick, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<T_SAVE+.6){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=20):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;walk?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';crowd?:boolean;point?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const walk=e.walk??1;
 {const pl=martaPlace(tp,walk),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=martaPose(tp,walk,e.it),prev={pose:martaPose(tpPrev,walk,e.it-1/12),place:martaPlace(tpPrev,walk)};
  drawPlayer(s,pose,c,detailFor(MARTA_ST,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2&&tp<.35);}});}
 {const d=visible({x:ANG_X+.4,z:tp>T_SAVE?-1.6:0});if(d>0)items.push({d,draw:()=>{const pose=angPose(tp,e.it),prev={pose:angPose(tpPrev,e.it-1/12),place:ANG_PLACE};drawPlayer(s,pose,c,detailFor(ANG_ST,d,true),ANG_PLACE,prev,!!e.smear&&tp>T_DIVE&&tp<T_SAVE+.2);}});}
 for(const a of ACTORS){if(!e.crowd&&a.role!=='ref'&&a.role!=='ar'&&a.role!=='rush')continue;const cur=actorAt(a,tp,e.it,e.point),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12,e.point);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-(Math.abs(tau-T_SAVE)<.12?.35:0),draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const mxz=(tau:number,walk=1):V3=>{const p=martaPlace(tau,walk);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** contact: a beat after "Marta shoots", and never before she has had time to settle at her mark after "Nadine Angerer" */
const tS1=()=>Math.max(CUE(0,'Marta shoots')+.25,CUE(0,'Nadine Angerer')+.8-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0-5,t-tS1());
/** she sets the ball and walks back to her mark: from "Marta, the" until before the run */
const walk1=(t:number)=>{const a=CUE(0,'Marta, the')-.2,b=Math.max(a+.8,Math.min(a+3,tS1()+T_RUN0-1));return sm(a,b,t,linear);};
const P1:V3=[-34,20,58];
function cam1(t:number):Cam{
 const tRun=tS1()+T_RUN0,w=walk1(t),ep:V3=[ANG_X,1,0];
 return plan(t,[
  [0,0,()=>({P:P1,T:[-28,2,-4],fov:44})],
  [CUE(0,'Germany lead')-.2,1.2,()=>({P:P1,T:[-14,1,0],fov:15})],
  [CUE(0,'then Brazil')-.1,.9,()=>({P:P1,T:[-12.5,1,3.6],fov:8})],
  [CUE(0,'Marta, the')-.2,.9,()=>({P:P1,T:add3(mxz(T_RUN0-.5,w),[0,1,0]),fov:5.6})],
  [CUE(0,'Nadine Angerer')-.25,.8,()=>({P:P1,T:ep,fov:4.4})],
  [Math.max(tRun-.35,CUE(0,'Nadine Angerer')+.5),.7,()=>({P:P1,T:[-5.4,1,-.5],fov:13.5})],
  [tS1()+T_SAVE+.25,.8,()=>({P:P1,T:[-1,1,-1.8],fov:9})],
  [tS1()+T_UP+.3,1.4,()=>({P:P1,T:[-3,1,-1.8],fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_SAVE,tSv=CUE(0,'Saved');
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tSv-.1,tSv+.3,t)*(1-sm(tSv+2.2,tSv+3.2,t))});
  ground(s,c);
  play(s,c,tau,tp,tpp,{it:tt,walk:walk1(tt),minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',crowd:true,point:tt-CUE(0,'then Brazil')+.2});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low behind the spot: patient, reads the run, then the spring
const tau2=(t:number)=>key(t,mono([[0,T_RUN0+.15],[CUE(1,'stays patient'),-.85],[CUE(1,'reads'),-.45],[CUE(1,'then dives'),T_DIVE+.03],[CUE(1,'Strong hands'),T_SAVE-.03],[SECS(1),T_SAVE+.7]]),linear);
const E2:V3=[-17,1.35,4.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,T_SAVE));
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(add3(mxz(tau),[4,1,0]),[-1.5,1,-.3],sm(T_RUN0,-.4,tau)),fov:22})],
  [CUE(1,'stays patient')-.25,1,()=>({P:add3(E2,[4,-.2,-1.2]),T:[-.6,.95,-.2],fov:15})],
  [CUE(1,'then dives')-.1,.9,()=>({P:add3(E2,[5,-.35,-1.5]),T:mix3(b,[-.3,.6,-1.8],.6),fov:15})],
  [CUE(1,'Strong hands')-.15,1,()=>({P:add3(E2,[5.6,-.4,-1.8]),T:add3(TGT,[-.2,.15,.4]),fov:9})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(T_SAVE,T_SAVE+.4,tau)});
  ground(s,c);
  // the replay trail: the kick so far, fading after the parry (under the players)
  if(tau>.02&&tau<T_SAVE+.9){const pts=pathPts(c,Math.max(0,tau-.5),Math.min(tau,T_SAVE),16),fade=1-sm(T_SAVE+.2,T_SAVE+.9,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_SAVE)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // the palms meet it: a small yellow burst on the ball
  const hit=sm(T_SAVE-.02,T_SAVE+.08,tau)*(1-sm(T_SAVE+.3,T_SAVE+.7,tau));if(hit>0){const q=pr(c,TGT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,TGT)*.5)*easeOutBack(hit),{n:9,seed:23,width:Math.max(5,kAt(c,TGT)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 3 · the reverse angle from behind the goal by her right post: the parry, then 2–0 and a clean sheet
const tau3=(t:number)=>key(t,mono([[0,T_SAVE-.32],[CUE(2,'pushed away'),T_SAVE+.04],[CUE(2,'Germany won'),T_SAVE+.75],[CUE(2,'no goals'),T_UP+.25],[SECS(2),T_UP+.25+(SECS(2)-CUE(2,'no goals'))]]),linear);
const E3:V3=[4.3,.95,-5.4];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[-1.2,.45,-2.2],fov:30})],
  [CUE(2,'pushed away')-.2,.9,()=>({P:add3(E3,[-.4,-.1,.5]),T:add3(TGT,[.3,.1,-.6]),fov:26})],
  [CUE(2,'Germany won')-.2,1.3,()=>({P:add3(E3,[.6,1.1,-.6]),T:[-2.2,1.05,-2.4],fov:36})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tG=CUE(2,'Germany won');
  stadium(s,c,t,[0,2,3],{roar:.3+.7*sm(T_SAVE,T_SAVE+.4,tau),flash:.8*sm(tG-.1,tG+.3,t)});
  ground(s,c,{goal:false});
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10,crowd:true});
  // from behind, the net is between the camera and the play
  goal3(s,c);
  // the palms: a yellow ring where they met the ball, as "pushed away" lands
  const rp=sm(CUE(2,'pushed away')-.1,CUE(2,'pushed away')+.35,t)*(1-sm(tG-.2,tG+.3,t));
  if(rp>.02){const q=pr(c,TGT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,TGT)*.55)*easeOutBack(clamp(rp)),{n:9,seed:29,width:Math.max(5,kAt(c,TGT)*.04),cov:clamp(rp)});}
 },
 aperture(t){const c=cam3v(t),P=ballAt(tau3(t)),q=pr(c,P)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:1.2,
};

// ---------------------------------------------------------------- 4 · the lesson: stay patient on your line → read the kicker (her run, her hips) → dive with strong hands
const tau4=(t:number)=>key(t,mono([[0,-2.2],[CUE(3,'Read'),-1.9],[CUE(3,'run and'),-1.15],[CUE(3,'hips'),-.35],[CUE(3,'dive with'),-.02],[CUE(3,'strong hands'),T_SAVE-.02],[SECS(3),T_SAVE+.45]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-4.6,1.5,3.6],T:[-.2,.8,0],fov:36})],
  [CUE(3,'Read')-.2,1.1,()=>({P:[2.3,1.95,1.05],T:[-12,.85,.8],fov:22})],
  [CUE(3,'hips')-.2,.9,()=>({P:[-6.2,1.6,-3.8],T:add3(mxz(-.3),[.2,.8,0]),fov:30})],
  [CUE(3,'dive with')-.2,1,()=>({P:[-5.8,1.4,-5.6],T:[-.4,.55,-1.7],fov:36})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring round a 3D point in a plane: horizontal (on the ground) or upright facing the camera */
function ring3(s:Sheet,c:Cam,at:V3,r:number,w:number,ink:string,cov:number,flat=true,seed=43){
 const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,P:V3=flat?[at[0]+Math.cos(a)*r,at[1],at[2]+Math.sin(a)*r]:add3(at,[c.r[0]*Math.cos(a)*r+c.u[0]*Math.sin(a)*r,c.r[1]*Math.cos(a)*r+c.u[1]*Math.sin(a)*r,c.r[2]*Math.cos(a)*r+c.u[2]*Math.sin(a)*r]),p=pr(c,P);if(p)pts.push(p);}
 if(pts.length<28)return;const rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:.8});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tP=CUE(3,'stay patient'),tR=CUE(3,'Read'),tRun=CUE(3,'run and'),tH=CUE(3,'hips'),tD=CUE(3,'dive with'),tS=CUE(3,'strong hands');
  stadium(s,c,t,[0,1,2,3],{});
  ground(s,c);
  // 1 · stay patient on your line: the goal line glows yellow between the posts, a ring at her feet
  const pat=sm(tP-.15,tP+.45,t,easeOutBack)*(1-sm(tR+.4,tR+1,t));
  if(pat>.02){const u=clamp(pat),a:V3=[0,.02,-3.66*u],b:V3=[0,.02,3.66*u],q=[pr(c,a),pr(c,[0,.02,0]),pr(c,b)].filter((p):p is Pt=>!!p);
   if(q.length===3){const rb=ribbon(q,Math.max(8,kAt(c,[0,0,0])*.09),{seed:7,taper:.15,wobble:1});s.knockout(rb,.9*u);s.fill(Y,rb,.95*u);}
   ring3(s,c,[ANG_X,.02,0],.55,Math.max(6,kAt(c,[ANG_X,0,0])*.035),Y,u,true,41);}
  // 2 · read the kicker, her run: the run traced on the grass from her mark toward the ball
  const rn=sm(tRun-.15,tRun+.6,t)*(1-sm(tH-.1,tH+.35,t));
  if(rn>.02){const pts:V3[]=[];for(let i=0;i<=10;i++){const g=lerp(G_MARK,-STRIKE_L*.3,i/10*clamp(rn));const[x,z]=gPos(g);pts.push([x,.03,z]);}arrow3(s,c,pts,Math.max(5,kAt(c,pts[0])*.035),Y,.9*clamp(rn));}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // read: a dashed yellow sight line from Angerer's eyes to Marta's hips
  const sl=sm(tR-.15,tR+.5,t,easeOutBack)*(1-sm(tD-.1,tD+.3,t));
  const ms=solve(martaPose(tp,1,tt),MARTA_B,martaPlace(tp));
  if(sl>.02){const ek=angSk(tp,tt),a=pr(c,ek.face),b=pr(c,ms.pelvis);
   if(a&&b){const rb=new Path2D(),n=9,w=Math.max(8,kAt(c,ek.face)*.04),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);}}
  // 3 · her hips: a ring round them and an arrow where they point (open toward her left — Angerer's right)
  const hp=sm(tH-.15,tH+.4,t,easeOutBack)*(1-sm(tD+.2,tD+.7,t));
  if(hp>.02){ring3(s,c,ms.pelvis,.3,Math.max(6,kAt(c,ms.pelvis)*.035),Y,clamp(hp),false,47);
   const a:V3=[ms.pelvis[0],ms.pelvis[1],ms.pelvis[2]],b=add3(a,[DIR[0]*1.3*clamp(hp),0,DIR[1]*1.3*clamp(hp)]);arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(6,kAt(c,a)*.04),Y,.95);}
  // 4 · dive: a red arrow along her dive to her right
  const dv=sm(tD-.1,tD+.35,t,easeOutBack)*(1-sm(tS+.6,tS+1.2,t));
  if(dv>.02){const a:V3=[ANG_X-.3,.8,-.1],b:V3=[ANG_X-.4,.45,-.1-2.5*clamp(dv)];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.06),R,.95);}
  // 5 · strong hands: a yellow burst round the palms as they push the ball away
  const sh=sm(tS-.05,tS+.4,t);if(sh>0&&tau>T_SAVE-.05){const q=pr(c,TGT);if(q){sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,TGT)*.8)*easeOutBack(sh),{n:10,seed:61,width:Math.max(6,kAt(c,TGT)*.05)});ring3(s,c,TGT,.28,Math.max(6,kAt(c,TGT)*.035),Y,clamp(sh),false,59);}}
 },
 still:9,
};

const film:RisoStory={
 id:'angerer-marta-2007',format:'11v11',title:"Angerer saves Marta's penalty",
 theme:'Goalkeeping: stay patient on your line, read the kicker (her run and her hips), then dive with strong hands',
 ageNote:'Germany 2–0 Brazil, 2007 FIFA Women\'s World Cup final, Hongkou Stadium, Shanghai, 30 September 2007. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a keeper's parry — two red palms push a small ball away with a yellow spark. Reduced motion: the still pose. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.35)),fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed);
  if(age>0&&age<.4)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.4),width:9,cov:fade});
  for(const sd of[-1,1]){const cx=x+sd*(46-20*u),p=new Path2D();p.ellipse(cx,y,20,28,sd*.3,0,TAU);s.knockout(p,.9*fade);s.fill(R,p,.95*fade);s.stroke(K,p,3,.85*fade);}
  footballPanels(s,x,y,22,{rot:r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
