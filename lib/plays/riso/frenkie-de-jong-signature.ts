/** Frenkie de Jong — Signature: carrying the ball out of pressure. An iconic-play riso film (RisoStory, chapters mode) played by the
 * card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, printed as a riso sheet from WRITTEN accounts (the footage
 * itself was not reviewed).
 *
 * THE REAL MATCH: Real Madrid 1–4 Ajax (Ajax through 5–3 on aggregate), UEFA Champions League round of 16, second leg, Estadio Santiago
 * Bernabéu, Madrid, Tuesday 5 March 2019, 21:00 local (a night match). WHY THIS MATCH: it is the night of Ajax's 2019 run that the
 * sources single out ("Ajax came and tore them to bits"), de Jong was in Ajax's midfield ("Frenkie de Jong, Donny van de Beek and Schöne
 * picking Madrid's players off", Guardian) and the run made him UEFA's Champions League Midfielder of the Season (Wikipedia).
 * HONEST NOTE (fallback mode, BRIEF "Signature-move players"): no source we could read describes one specific de Jong carry move by move,
 * so the film NEVER stages a carry inside this match. Chapter 1 shows only confirmed things: the Bernabéu at night, the 1–4 score, Ajax
 * celebrating at full time in their black change kit, de Jong (21) among them. The move itself is a separate, clearly labelled
 * demonstration ("This is how he does it", chapters 2–3) on a neutral training pitch in training kit (a white training top with his 21,
 * a team-mate, a defender in a red bib); the lesson (chapter 4) replays the demonstration with teaching marks. The demonstration draws the
 * trait the sources describe (a "natural dribbler" able "to dribble in narrow spaces", "absorbing attacking pressure", compared with
 * Beckenbauer for his "tendency to progress forward in possession") — not any particular match moment.
 *
 * SOURCES (fetched Sept 2026 with a generic UA, cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "2018–19 UEFA Champions League knockout phase" (raw; cache wiki-2018-19-ucl-ko.txt): 5 March 2019, 21:00, Santiago
 *    Bernabéu, Real Madrid 1–4 Ajax (Ziyech 7', Neres 18', Tadić 62', Asensio 70', Schöne 72'), attendance 77,013, referee Felix Brych;
 *    Ajax won 5–3 on aggregate (first leg Ajax 1–2 Real Madrid, 13 Feb 2019).
 *  - The Guardian, Sid Lowe, "Dusan Tadic inspires Ajax to stunning defeat of champions Real Madrid", 5 March 2019
 *    https://www.theguardian.com/football/2019/mar/05/real-madrid-ajax-champions-league-match-report (cache guardian-realmadrid-ajax-2019.txt)
 *    ("Ajax came and tore them to bits, scoring four goals"; "Frenkie de Jong, Donny van de Beek and Schöne picking Madrid's players off";
 *    the VAR wait for the third goal; Nacho sent off in added time).
 *  - The Guardian's lead photograph for that report (Tadić and team-mates celebrating on the Bernabéu pitch at full time; cache
 *    guardian-rma-ajax-2019-tadic.jpg): Ajax in BLACK shirts with white shoulder stripes and white numbers, black shorts, black socks with
 *    a white band; Onana (24) in a light-blue goalkeeper kit; the players with arms raised in front of a stand.
 *  - Wikipedia, "Frenkie de Jong" (raw; cache wiki-frenkie-de-jong.txt): shirt 21 since he turned professional; 1.81 m; in 2018–19 he
 *    "primarily played in the middle of a three-man midfield"; Style of play ("A natural dribbler", "dribble in narrow spaces", "absorbing
 *    attacking pressure", "tendency to progress forward in possession"); UEFA Champions League Midfielder of the Season 2018–19.
 *  - lib/town/playerAppearance.json (light skin, mid-brown slicked hair, stubble; Netherlands) and lib/town/playerCareers.json (Ajax 2016–19,
 *    Barcelona 2019–).
 * CONFIRMED: the match, date, ground, night kick-off, the 1–4 score and that it put Ajax through; Ajax's black change kit and Onana's
 * light-blue kit that night (photograph); Real Madrid in white (photograph background: Madrid players are not in it, but the Bernabéu
 * crowd is mostly white and Real's home kit is white — see INFERRED); de Jong played in Ajax's midfield and wears 21.
 * INFERRED (illustrative): where on the pitch the celebration happened and who stood where (drawn by the far touchline near the corner,
 * in front of an away section, backs to the main-stand camera), which players are drawn (numbers from the photograph where visible: 7, 10,
 * 17, 6, 24; the rest generic), the Madrid players walking off; Real Madrid's all-white kit; the score graphic (a TV score bug, not a
 * stadium board); the stadium drawing (steep, tall, near-rectangular Bernabéu stands, floodlit roof rim). The whole demonstration
 * (chapters 2–4) is illustrative by design: pitch, kits, team-mate, defender, the turn to his RIGHT and the right-foot touches (de Jong is
 * generally described as right-footed; the narration names no foot). The narration names no kit colour.
 *
 * FRAMING (never top-down): ch1 = the high main-stand broadcast camera at the Bernabéu, real time (wide → the celebrating group → a long-lens
 * push onto 21); ch2 = the demonstration live, a high touchline camera, real time (the pass in, the defender rushing at his back, the turn,
 * the carry into space); ch3 = the slow-motion replay from a LOW camera (the peek over his shoulder, his body between the defender and
 * the ball, the spin, head up); ch4 = the lesson from a raised camera behind the play (the pressure arrow, the turn arrow, the carry path,
 * the open space). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), kept in the central
 * ~1000 units so it frames from the 1.45:1 card window down to square.
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every figure inside a passage print at `low`.
 * Handedness: athlete.ts's own right-handed world (x toward the attacking end of the drill, y up, +z to the right of a player facing +x),
 * so his RIGHT foot is +z when he faces +x (and −z while he faces back toward the passer, −x). Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,strike,runCycle,dribble,stand,lunge,celebrate,posed,blendPose,clampPose,keyPoses,touchPhase,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/frenkie-de-jong-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/frenkie-de-jong-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * Every cue starts with a plain word (Kokoro splits contractions and hyphenated words). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Ajax in Madrid',text:'Madrid, 2019. Ajax beat mighty Real Madrid four goals to one! In midfield was Frenkie de Jong, who loves the ball.',tail:1.8,
  cues:['Madrid','Ajax beat','four goals','Frenkie de Jong','loves the ball']},
 {label:'How he does it',text:'This is how he does it. A defender rushes at his back. Frenkie turns away from him and carries the ball into open space!',tail:1.8,
  cues:['This is how','defender rushes','Frenkie turns away','carries the ball','open space']},
 {label:'Watch again',text:'Watch again, slowly. He peeks over his shoulder, keeps his body between the defender and the ball, spins away, and runs with his head up.',tail:1.6,
  cues:['Watch again','peeks over','keeps his body','spins away','head up']},
 {label:'Your turn',text:'Your turn: when you are pressed, turn away from the defender and carry the ball into open space.',tail:2.4,
  cues:['Your turn','pressed','turn away','carry the ball','open space']},
];
import timingJson from '../../../public/plays/narration/frenkie-de-jong-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('de-jong: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('de-jong: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bump=(a:number,b:number,t:number)=>Math.sin(Math.PI*clamp((t-a)/(b-a)));
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
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
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ================================================================ CHAPTER 1 WORLD: the Bernabéu at night (confirmed things only)
/** Pitch: the goal line nearest the celebration is x = 0, goal centre z = 0, +z = the main-stand side, the halfway line x = −52.5. */
const CXS=-52.5,NS=60,PE=.28;
/** a point on the stand ring: angle th round the pitch centre (0 = behind the x = 0 goal, +90° = the main stand), d metres out, height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(58.5+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(40.5+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=34;
/** steep rake (~50°): three tiers climbing to ~42 m */
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.4+40*b];
type Bowl={seg:V3[][];roof:V3[][];seats:{P:V3;h:number;away:boolean}[];lamps:[V3,V3][];tiers:[V3,V3][]};
/** the away section (inferred): the far side near the x = 0 corner, the stand the Ajax players celebrate in front of */
const AWAY0=Math.round(NS*.8),AWAY1=Math.round(NS*.87);
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],seats:[],lamps:[],tiers:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,SD1-9,y1+2.6),rim(b,SD1-9,y1+2.6),rim(b,SD1+2,y1+4),rim(a,SD1+2,y1+4)]);
  if(i%2===0)o.lamps.push([rim(a,SD1-8.6,y1+2.3),rim(b,SD1-8.6,y1+2.3)]);
  for(const f of[.34,.67]){const[d,y]=RAKE(f);o.tiers.push([rim(a,d,y),rim(b,d,y)]);}
  for(let r=0;r<9;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.18)continue;const[d,y]=RAKE((r+.5)/9);
   const away=r<=3&&i>=AWAY0&&i<AWAY1;
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a March night in Madrid: a deep printed navy sky
 s.field(K,.74,.5);s.field(B,.24,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(bowl);s.tone(B,bowl,.4);s.tone(K,bowl,.36);
 // the crowd: one mark per seat group; mostly white Madrid shirts, navy and blue, phone lights (yellow); the away section in Ajax red and
 // white, bouncing with the roar
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0&&q.away?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.away?(q.h<.6?4:0):q.h<.55?0:q.h<.75?1:q.h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(B,inks[1],.6);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.95);s.knockout(inks[4],.6);s.fill(R,inks[4],.9);
 const tf=new Path2D();for(const[a,b] of BOWL.tiers){if(toCam(c,a)[2]<14||toCam(c,b)[2]<14)continue;seg3(c,a,b,.9,tf,1);}s.knockout(tf,.6);s.tone(B,tf,.2);
 s.knockout(roof);s.fill(K,roof,.92);
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+4)continue;seg3(c,a,b,.9,lamp);seg3(c,a,b,3.4,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
const ringPts=(d:number,n=72):V3[]=>{const o:V3[]=[];for(let i=0;i<n;i++)o.push(rim(i/n*TAU,d,0));return o;};
const GRASS=ringPts(0);
function bernabeuGround(s:Sheet,c:Cam){
 const g=polyP(c,GRASS);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.14);
 // advertising boards (generic navy with paper panels)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([4.2,0,-30],[4.2,0,30]);board([-110,0,-37.5],[3,0,-37.5]);board([-110,0,37.5],[3,0,37.5]);
 for(let k=0;k<9;k++){const z=-28+k*6.4;addPoly(pn,polyP(c,[[4.1,.25,z],[4.1,.25,z+3.3],[4.1,.68,z+3.3],[4.1,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.45);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 // the goal at x = 0 (frame and a light net)
 const net=new Path2D();addPoly(net,polyP(c,[[0,2.44,-3.66],[0,2.44,3.66],[2,1.9,3.66],[2,1.9,-3.66]]));addPoly(net,polyP(c,[[2,0,-3.66],[2,0,3.66],[2,1.9,3.66],[2,1.9,-3.66]]));
 s.knockout(net,.32);s.tone(K,net,.12);
 const fr=new Path2D();seg3(c,[0,0,-3.66],[0,2.44,-3.66],.12,fr);seg3(c,[0,0,3.66],[0,2.44,3.66],.12,fr);seg3(c,[0,2.44,-3.72],[0,2.44,3.72],.12,fr);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Ajax that night (confirmed by the photograph): black shirts with white shoulder stripes and white numbers, black shorts, black socks */
const ajax=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',shade:[B,.3],...o});
/** Real Madrid: all white, navy trim (inferred: the usual home kit) */
const real=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** de Jong: 1.81 m, slim; mid-brown hair slicked back (a red + yellow screen), light skin (playerAppearance.json) */
const DJ_B={height:1.81,bulk:.92};
const DJ_HAIR:InkFill=[R,.55];
const DJ_MATCH=ajax({number:21,build:DJ_B,hair:DJ_HAIR,seed:21});

// ---------------------------------------------------------------- chapter 1 cast: full time, Ajax celebrate by the far touchline
type Cel={st:AthleteStyle;x:number;z:number;ph:number;kind:'cel'|'walk'|'gk';x1?:number;z1?:number;key?:boolean};
const DJX=-9,DJZ=-31;
/** the away fans they celebrate toward (far stand, near the corner) */
const FANS:[number,number]=[-4,-48];
const CEL:Cel[]=[
 {st:DJ_MATCH,x:DJX,z:DJZ,ph:.1,kind:'cel',key:true},
 {st:ajax({number:10,build:{height:1.81},hairStyle:'balding',seed:10}),x:-6.6,z:-30.6,ph:.55,kind:'cel',key:true},
 {st:ajax({number:4,build:{height:1.89,bulk:1.06},hair:[Y,.7],seed:4}),x:-11.2,z:-30.4,ph:.3,kind:'cel',key:true},
 {st:ajax({number:17,build:{height:1.8},seed:17}),x:-13.3,z:-31.2,ph:.8,kind:'cel'},
 {st:ajax({number:7,build:{height:1.75},skin:SKIN_D,hairStyle:'curly',seed:7}),x:-4.6,z:-31.4,ph:.2,kind:'cel'},
 {st:ajax({number:6,build:{height:1.84},hair:[Y,.8],seed:6}),x:-15.2,z:-30.2,ph:.65,kind:'cel'},
 {st:ajax({number:22,build:{height:1.8},skin:SKIN_M,seed:22}),x:-2.6,z:-30.1,ph:.4,kind:'cel'},
 {st:ajax({number:20,build:{height:1.83},hair:[Y,.5],seed:20}),x:-8,z:-29.4,ph:.9,kind:'cel'},
 {st:ajax({number:12,build:{height:1.84},skin:SKIN_M,seed:12}),x:-12.4,z:-28.8,ph:.05,kind:'cel'},
 {st:{shirt:[B,.45],shorts:[B,.45],socks:[B,.45],boots:K,skin:SKIN_D,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'bald',number:24,numberInk:K,build:{height:1.9},seed:24},x:-17.6,z:-29.2,ph:.45,kind:'cel'},
 // Madrid players walking off toward the main-stand tunnel (inferred)
 {st:real({number:4,seed:40}),x:-26,z:-12,x1:-31,z1:6,ph:0,kind:'walk'},
 {st:real({number:8,hair:[Y,.7],seed:41}),x:-33,z:-6,x1:-38,z1:12,ph:.3,kind:'walk'},
 {st:real({number:9,skin:SKIN_M,seed:42}),x:-20,z:-4,x1:-27,z1:13,ph:.6,kind:'walk'},
 {st:real({number:20,skin:SKIN_D,seed:43}),x:-40,z:-15,x1:-44,z1:4,ph:.2,kind:'walk'},
];
const DESPAIR:Partial<Pose>={neckP:40,lean:14,lShF:-8,rShF:-8,lElb:20,rElb:20,lShA:8,rShA:8};
function celPose(a:Cel,t:number):{p:Pose;x:number;z:number;yaw:number}{
 if(a.kind==='walk'){const u=clamp(t/14),x=lerp(a.x,a.x1!,u),z=lerp(a.z,a.z1!,u),yaw=yawTo(a.x,a.z,a.x1!,a.z1!),d=Math.hypot(a.x1!-a.x,a.z1!-a.z)*u;
  return{p:over(runCycle(d/1.3+a.ph,{speed:0}),DESPAIR,.8),x,z,yaw};}
 // celebrate: jumps with both arms up toward the away fans; each player on his own rhythm
 const yaw=yawTo(a.x,a.z,FANS[0]+(a.x-DJX)*.3,FANS[1]);
 const p=celebrate(t*.85+a.ph,{kind:'arms'});return{p,x:a.x,z:a.z,yaw};
}

// ---------------------------------------------------------------- the TV score bug (the confirmed 1–4), drawn in screen space
/** seven-segment digit strokes, cell 1 × 1.8 */
const SEG:Record<string,[number,number,number,number][]>={a:[[0,0,1,0]],b:[[1,0,1,.9]],c:[[1,.9,1,1.8]],d:[[0,1.8,1,1.8]],e:[[0,.9,0,1.8]],f:[[0,0,0,.9]],g:[[0,.9,1,.9]]};
const DIG:Record<string,string>={'1':'bc','4':'fgbc'};
function digit(p:Path2D,ch:string,x:number,y:number,h:number,w:number){for(const s of DIG[ch])for(const[a,b,c,d] of SEG[s])p.addPath(ribbon([[x+a*h*.55,y+b*h*.55],[x+c*h*.55,y+d*h*.55]],w,{seed:7+x|0,taper:0,wobble:.2}));}
function scoreBug(s:Sheet,w:number,pulse:number){if(w<=.02)return;
 const k=Math.min(1.25,Math.max(.8,s.W/s.H))*1.3,y0=-s.H*s.fit/2+34,h=86*k,W=300*k,x0=-W/2,sl=(1-easeOut(clamp(w)))*-60;
 const box=polyPath([[x0,y0+sl],[x0+W,y0+sl],[x0+W,y0+h+sl],[x0,y0+h+sl]],true);
 s.knockout(box,.95*w);s.stroke(K,box,5,.9*w);
 // team swatches: Real white (paper with a navy ring), Ajax black (navy)
 const rs=new Path2D();rs.arc(x0+h*.55,y0+h/2+sl,h*.26,0,TAU);s.stroke(K,rs,5,.9*w);
 const as=new Path2D();as.arc(x0+W-h*.55,y0+h/2+sl,h*.26,0,TAU);s.fill(K,as,.95*w);
 const d=new Path2D(),dh=h*.62*(1+.25*pulse),dy=y0+h/2-dh*.5+sl;
 digit(d,'1',x0+W*.34-dh*.28,y0+h/2-h*.31+sl,h*.62,7*k);
 const d4=new Path2D();digit(d4,'4',x0+W*.66-dh*.28,dy,dh,7*k*(1+.25*pulse));
 const dash=ribbon([[-W*.05,y0+h/2+sl],[W*.05,y0+h/2+sl]],6*k,{seed:3,taper:0,wobble:.2});
 s.fill(K,d,.95*w);s.fill(K,dash,.9*w);if(pulse>.02){s.fill(Y,d4,.95*w);}s.fill(pulse>.02?R:K,d4,.95*w);
}

// ================================================================ THE DEMONSTRATION WORLD: a neutral training pitch in daylight
/** the drill: a team-mate plays the ball in to de Jong, who stands with his back to the attacking end (+x); a defender (red bib) rushes
 * at his back from behind-left; de Jong turns away to his RIGHT and carries the ball into the open space (+x, −z). τ = 0: his first touch. */
function trainingGround(s:Sheet,c:Cam){
 const v=view(s);
 // a pale spring sky, a far tree line, a low fence
 s.field(B,.16,.5);
 const tree=new Path2D(),far=62;for(let i=0;i<=48;i++){const x=-110+i*5,h=6+5*hash(i,51),q=toCam(c,[x,h*.55,far]);if(q[2]<5)continue;const g=scr(c,q),rx=c.F*(3.2+1.5*hash(i,52))/q[2],ry=c.F*h*.62/q[2];
  if(Math.abs(g[0])>v.hx+rx||Math.abs(g[1])>v.hy+ry)continue;const el:Pt[]=[];for(let j=0;j<12;j++){const a=j/12*TAU;el.push([g[0]+Math.cos(a)*rx,g[1]+Math.sin(a)*ry]);}tree.addPath(polyPath(el,true));tree.rect(g[0]-rx*.9,g[1],rx*1.8,ry*1.1);}
 s.fill(B,tree,.6);s.tone(K,tree,.45);
 // grass (a big quad to the horizon)
 const g=polyP(c,[[-140,0,-90],[160,0,-90],[160,0,far],[-140,0,far]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.72);
 const st=new Path2D();for(let k=-12;k<14;k+=2)addPoly(st,polyP(c,[[k*6,0,-90],[k*6+6,0,-90],[k*6+6,0,far],[k*6,0,far]]));s.tone(K,st,.12);
 const fence=new Path2D();for(let i=0;i<=40;i++){const x=-60+i*3.2;seg3(c,[x,0,40],[x,1.3,40],.07,fence,.8);}seg3(c,[-60,1.2,40],[68,1.2,40],.06,fence,.8);seg3(c,[-60,.6,40],[68,.6,40],.05,fence,.8);s.fill(K,fence,.7);
 // the drill area: a painted rectangle and a mini goal at the attacking end
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.1,ln);const X0=-24,X1=26,Z0=-18,Z1=16;
 for(let k=0;k<10;k++){L([lerp(X0,X1,k/10),0,Z0],[lerp(X0,X1,(k+1)/10),0,Z0]);L([lerp(X0,X1,k/10),0,Z1],[lerp(X0,X1,(k+1)/10),0,Z1]);}
 for(let k=0;k<6;k++){L([X0,0,lerp(Z0,Z1,k/6)],[X0,0,lerp(Z0,Z1,(k+1)/6)]);L([X1,0,lerp(Z0,Z1,k/6)],[X1,0,lerp(Z0,Z1,(k+1)/6)]);}
 s.knockout(ln,.9);
 const gl=new Path2D(),gn=new Path2D(),GZ=-6;
 seg3(c,[X1,0,GZ-1.5],[X1,1.2,GZ-1.5],.08,gl);seg3(c,[X1,0,GZ+1.5],[X1,1.2,GZ+1.5],.08,gl);seg3(c,[X1,1.2,GZ-1.55],[X1,1.2,GZ+1.55],.08,gl);
 addPoly(gn,polyP(c,[[X1,1.2,GZ-1.5],[X1,1.2,GZ+1.5],[X1+.9,0,GZ+1.5],[X1+.9,0,GZ-1.5]]));s.knockout(gn,.4);s.tone(K,gn,.15);s.knockout(gl);s.stroke(K,gl,1.2,.6);
 // cones along the sides of the drill (red)
 const cones=new Path2D();
 for(const[x,z] of CONES){const b=toCam(c,[x,0,z]);if(b[2]<1)continue;const p=scr(c,b),q=pr(c,[x,.3,z]);if(!q||Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const w=Math.max(2.5,c.F*.14/b[2]);cones.addPath(polyPath([[p[0]-w,p[1]],[q[0],q[1]],[p[0]+w,p[1]]],true));}
 s.knockout(cones);s.fill(R,cones,.95);
}
const CONES:[number,number][]=(()=>{const o:[number,number][]=[];for(let k=0;k<=10;k++){o.push([lerp(-24,26,k/10),-18],[lerp(-24,26,k/10),16]);}for(let k=1;k<6;k++)o.push([-24,lerp(-18,16,k/6)]);return o;})();

/** training kits (illustrative, neutral): de Jong in a white training top with his 21, navy shorts; the team-mate the same; the defender
 * in a red bib over a blue top */
const DJ_ST:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_L,hair:DJ_HAIR,line:K,trim:K,number:21,numberInk:K,hairStyle:'short',build:DJ_B,seed:21};
const MATE_ST:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:K,number:4,numberInk:K,hairStyle:'short',build:{height:1.86,bulk:1.04},seed:4};
const DEF_ST:AthleteStyle={shirt:R,shorts:K,socks:K,boots:K,skin:SKIN_D,hair:K,line:K,trim:[B,.7],numberInk:'paper',hairStyle:'curly',build:{height:1.84,bulk:1.05},seed:5};

// ---------------------------------------------------------------- the drill geometry (τ = seconds after his first touch)
const T_PASS=-1.45,T2=.8,STRIDE=2.3;
/** the carry heads for the open space (+x, −z) */
const OPEN:V3=[12,0,-10];
type Role='hero'|'mate'|'def';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][]};
const ACTORS:Actor[]=[
 {name:'de Jong',role:'hero',st:DJ_ST,keys:[[-5,1.9,1.6],[-3.2,1.1,.9],[-1.7,.1,.05],[-.4,0,0],[0,.02,-.04],[.4,.3,-.38],[T2,1.05,-1.2],[1.6,3.1,-3.0],[2.6,6.1,-5.4],[4,10.3,-8.5],[5.5,14.9,-11.8],[7.5,20.4,-15.3]]},
 {name:'team-mate',role:'mate',st:MATE_ST,keys:[[-5,-18.4,-1.9],[-3,-16.7,-1.5],[T_PASS,-15.05,-1.16],[-.5,-14.4,-.9],[2,-12.8,-1.4],[7.5,-8,-3.6]]},
 {name:'defender',role:'def',st:DEF_ST,keys:[[-5,17,9.4],[-3,12.2,6.6],[-1.6,6.8,3.5],[-.6,3.2,1.62],[0,1.62,.92],[.35,1.18,.72],[.9,1.3,.4],[1.6,2.5,-.9],[2.6,4.7,-3.2],[4,7.9,-5.9],[5.5,11.2,-8.8],[7.5,15.4,-12.2]]},
];
const HERO=0,MATE=1,DEF=2;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const T0=-5,T1=7.5,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- the ball: the pass in, the turning touch, the carry
const mateBall=(tau:number):V3=>{const[x,z]=posOf(MATE,tau);return[x+.45,.11,z+.17];};
const P_PASS=mateBall(T_PASS);
/** the first touch: the ball arrives at his right boot (he faces −x, so his right is −z) */
const TOUCH:V3=[-.45,.11,-.3];
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
/** carry direction (smoothed velocity) and the phase of his dribble: a touch every STRIDE metres, the first at T2 */
const dirOf=(tau:number):[number,number]=>{const v=velOf(HERO,Math.max(tau,T2)),l=Math.hypot(v[0],v[1])||1;return[v[0]/l,v[1]/l];};
const dPhase=(tau:number)=>touchPhase+(distOf(HERO,tau)-distOf(HERO,T2))/STRIDE;
/** lead of the ball in front of his pelvis through one touch cycle: pushed ahead from the boot, then he catches it up */
const lead=(tau:number)=>{const u=((dPhase(tau)-touchPhase)%1+1)%1;return .42+.78*Math.sin(Math.PI*u);};
function carryBall(tau:number):V3{const[x,z]=posOf(HERO,tau),[dx,dz]=dirOf(tau),L=lead(tau);return[x+dx*L-dz*.1,.11,z+dz*L+dx*.1];}
const B2=carryBall(T2);
function ballAt(tau:number):V3{
 if(tau<T_PASS)return mateBall(tau);
 if(tau<0)return roll(P_PASS,TOUCH,(tau-T_PASS)/-T_PASS,.35);
 if(tau<T2)return roll(TOUCH,B2,tau/T2,.55);
 return carryBall(tau);
}
const spinAt=(tau:number)=>TAU*(tau<0?3*tau:-1.8*tau);
/** yaw of the carry: toward the open space */
const YAW_CARRY=yawTo(0,0,OPEN[0],OPEN[2]);

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:26,rHipF:22,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:18,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:48,rElb:48,neckP:-4});
/** the turn: set, knees soft, arms out → the right boot reaches for the ball (inside of the foot, toes out) and guides it past his right
 * side → he pivots on it, the left leg swinging round → the first drive step (keyed over τ −.35 … .75) */
const TURN_KEYS:[number,Pose][]=[
 [0,posed({lHipF:22,rHipF:14,lKnee:42,rKnee:36,lHipA:10,rHipA:12,lean:18,pitch:4,lShA:46,rShA:38,lShF:10,rShF:14,lElb:44,rElb:44,neckP:34})],
 [.35,posed({lHipF:14,lKnee:48,lAnk:-6,rHipF:30,rHipA:16,rHipR:42,rKnee:24,rAnk:-8,lean:24,pitch:5,twist:-22,bend:8,lShA:66,rShA:44,lShF:18,rShF:-10,lElb:36,rElb:48,neckP:38,neckY:-10})],
 [.65,posed({lHipF:44,lHipA:22,lKnee:74,lAnk:20,rHipF:4,rKnee:44,rAnk:-4,lean:26,pitch:8,twist:-14,bend:4,lShA:52,rShA:40,lShF:34,rShF:-26,lElb:60,rElb:60,neckP:18,neckY:-6})],
 [1,posed({lHipF:-20,lKnee:36,lAnk:34,rHipF:52,rKnee:82,rAnk:2,lean:22,pitch:10,twist:10,lShA:18,rShA:18,lShF:40,rShF:-36,lElb:86,rElb:86,neckP:10,air:.04})],
];
const TURN_A=-.35,TURN_B=.75;
const PEEK:Partial<Pose>={neckY:78,twist:24,neckP:-8};
const HEAD_UP:Partial<Pose>={neckP:-8};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='def'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===MATE){if(tau<T_PASS&&sp>.5)p=blendPose(p,dribble(distOf(k,tau)/1.5,{foot:'r',speed:.3}),.7);
  const D=.8,u=(tau-(T_PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),w);yaw=lerpAng(yaw,yawTo(P_PASS[0],P_PASS[2],TOUCH[0],TOUCH[2]),w);}}
 if(k===DEF){// the lunge at the ball as it slips past de Jong's right side, then he turns to chase
  const D=.8,u=(tau-(.25-.6*D))/D;if(u>0&&u<1.3){const w=inWin(u);const bt=ballAt(.25);p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),w);yaw=lerpAng(yaw,yawTo(x,z,bt[0],bt[2]),w);}
  if(tau>-.9&&tau<0)p=over(p,{lean:26,neckP:-14,lShA:30,rShA:30},bump(-.9,.1,tau)*.6);}
 if(k===HERO){
  // before the pass: facing the team-mate, a quick look over the LEFT shoulder at the defender (he faces −x, the defender is behind-left)
  if(tau<TURN_A){yaw=sp>.6?yaw:yawTo(x,z,P_PASS[0],P_PASS[2]);if(tau>-2.2)p=blendPose(p,READY,sm(-2.2,-1.6,tau)*.6);p=over(p,PEEK,bump(-1.35,-.45,tau));}
  // the turn: keyed pose, yaw from facing the passer (π) round to his RIGHT onto the carry line
  const u=(tau-TURN_A)/(TURN_B-TURN_A);
  if(u>-.2&&u<1.4){const w=Math.min(sm(-.2,0,u),1-sm(1,1.4,u));p=blendPose(p,keyPoses(clamp(u),TURN_KEYS),w);}
  if(tau>=TURN_A-.2){const y0=yawTo(0,0,P_PASS[0],P_PASS[2]);const turn=sm(-.08,.62,tau,easeInOutSine);yaw=lerpAng(y0,tau<T2+.2?YAW_CARRY:yaw,turn);
   if(tau>T2+.2){yaw=lerpAng(YAW_CARRY,yawTo(0,0,v[0],v[1]),sm(T2+.2,T2+.8,tau));}}
  // the carry: dribble strides, a touch every STRIDE metres, then head up
  if(tau>TURN_B-.1){const w=sm(TURN_B-.1,TURN_B+.3,tau);p=blendPose(p,dribble(dPhase(tau),{foot:'r',speed:.75}),w);p=over(p,HEAD_UP,sm(1.0,1.5,tau)*.9);}
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the turn, the first touches). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??14,c.F*.11/q[2]);
 const sh:Pt[]=[];for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*.2,0,P[2]+Math.sin(a)*.16]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),.4);
 if(o.lines&&o.prev!==undefined){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.9)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.4),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the drill through a camera
type Env={minBall?:number;lines?:boolean;prevT?:number;smear?:boolean};
/** everything on the pitch, depth-sorted (far first): positions at τ, poses on twos at τp (τpp = the drawing before), the ball at τ.
 * Heat: small figures print at `low`; inside a passage every figure is capped. */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env={}):{hero?:DrawResult;def?:DrawResult}{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;const out:{hero?:DrawResult;def?:DrawResult}={};
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,tp),px=h*ppu,star=k===HERO||k===DEF;
   const detail:AthleteStyle['detail']=passing?(star?'mid':'low'):px<50||(!star&&px<110)?'low':'auto';
   const big=px>=90&&!passing,prev=big?(()=>{const q2=poseOf(k,tpp),[px2,pz2]=posOf(k,tpp);return{pose:q2.p,place:{x:px2,z:pz2,yaw:q2.yaw}};})():undefined;
   const smearOn=!!e.smear&&big&&((k===HERO&&tp>-.2&&tp<1.1)||(k===DEF&&tp>0&&tp<.5));
   const r=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,smearOn);if(k===HERO)out.hero=r;if(k===DEF)out.def=r;}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.05,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return out;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(4,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
/** a ground arrow along world points (x,z), drawn on up to `u` of its length, with a head */
function groundArrow(s:Sheet,c:Cam,P:[number,number][],u:number,w:number,ink=Y,seed=71,wm=.22){if(w<=.02||u<=.02)return;
 const n=Math.max(2,Math.round(P.length*clamp(u))),pts:Pt[]=[];for(let i=0;i<n;i++){const q=pr(c,[P[i][0],.03,P[i][1]]);if(q)pts.push(q);}if(pts.length<2)return;
 const e=pts[pts.length-1],f=pts[pts.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),wd=Math.max(4,kAt(c,[P[n-1][0],0,P[n-1][1]])*wm),hd=wd*2.4,ca=Math.cos(ang),sa=Math.sin(ang);
 const body=ribbon(pts,wd,{seed,taper:.2,wobble:.6});const head=polyPath([[e[0]+ca*hd,e[1]+sa*hd],[e[0]-sa*hd*.8,e[1]+ca*hd*.8],[e[0]+sa*hd*.8,e[1]-ca*hd*.8]],true);
 s.knockout(ribbon(pts,wd*1.7,{seed,taper:.2,wobble:.6}),.6*w);s.knockout(head,.6*w);s.fill(ink,body,.95*w);s.fill(ink,head,.95*w);}
/** the open space: a pale yellow patch on the grass with a ring */
function openSpace(s:Sheet,c:Cam,w:number,seed=88){if(w<=.02)return;const pts:Pt[]=[];const r=3.6*(.6+.4*easeOutBack(clamp(w)));
 for(let i=0;i<36;i++){const a=i/36*TAU,k=1+.08*Math.sin(a*3+seed),p=pr(c,[OPEN[0]+Math.cos(a)*r*k*1.3,0,OPEN[2]+Math.sin(a)*r*k]);if(p)pts.push(p);}if(pts.length<20)return;
 const pp=polyPath(pts,true);s.knockout(pp,.55*w);s.tone(Y,pp,.75*w);const rr=ribbon(pts,Math.max(4,kAt(c,OPEN)*.08),{close:true,seed,taper:0,wobble:1});s.fill(Y,rr,.95*w);s.stroke(K,rr,1.5,.5*w);}
/** the pressure: a red arrow along the defender's run up to τ */
function pressure(s:Sheet,c:Cam,tau:number,w:number){const P:[number,number][]=[];const a=Math.max(T0,tau-2.2),b=Math.min(tau,.05);if(b<=a+.1)return;for(let i=0;i<=16;i++)P.push(posOf(DEF,lerp(a,b,i/16)));groundArrow(s,c,P,1,w,R,73,.2);}
/** the turn: a curved arrow on the ground round his pivot, from facing the passer to the carry line */
function turnArrow(s:Sheet,c:Cam,u:number,w:number){const P:[number,number][]=[];const a0=Math.PI,a1=TAU+yawToGround(YAW_CARRY);for(let i=0;i<=20;i++){const a=lerp(a0,a1,i/20);P.push([Math.cos(a)*1.35,Math.sin(a)*1.35]);}groundArrow(s,c,P,u,w,Y,75,.16);}
/** a facing yaw as a ground angle (x = cos, z = sin) */
const yawToGround=(yaw:number)=>-yaw;
/** the carry path: the ball's track from the turn to τ */
function carryPath(s:Sheet,c:Cam,tau:number,w:number,from=0){if(tau<=from+.1)return;const P:[number,number][]=[];for(let i=0;i<=24;i++){const b=ballAt(lerp(from,tau,i/24));P.push([b[0],b[2]]);}groundArrow(s,c,P,1,w,Y,77,.14);}
/** a dashed eye-line in screen space from a head to a target point */
function eyeLine(s:Sheet,a:Pt,b:Pt,w:number,ink=Y,seed=91){if(w<=.02)return;const pts:Pt[]=[];const u=clamp(w);for(let i=0;i<=12;i++)pts.push([lerp(a[0],b[0],i/12*u),lerp(a[1],b[1],i/12*u)]);
 const gaps:[number,number][]=[];for(let i=0;i<7;i++)gaps.push([(i+.55)/7,(i+.85)/7]);const wd=Math.max(4,Math.hypot(b[0]-a[0],b[1]-a[1])*.018);
 s.knockout(ribbon(pts,wd*1.8,{seed,taper:0,wobble:.3}),.5*w);s.fill(ink,ribbon(pts,wd,{seed,taper:0,wobble:.3,gaps}),.95*w);s.stroke(K,ribbon(pts,wd,{seed,taper:0,wobble:.3,gaps}),1.2,.5*w);}
/** the shield: a thick yellow arc on the ground at his back, between him and the defender */
function shield(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;const[x,z]=posOf(HERO,tau),[dx,dz]=posOf(DEF,tau),a=Math.atan2(dz-z,dx-x),pts:Pt[]=[];
 for(let i=0;i<=14;i++){const b=a+(i/14-.5)*1.7,p=pr(c,[x+Math.cos(b)*.95,.03,z+Math.sin(b)*.95]);if(p)pts.push(p);}if(pts.length<4)return;
 const wd=Math.max(5,kAt(c,[x,0,z])*.13);s.knockout(ribbon(pts,wd*1.6,{seed:93,taper:.5,wobble:.4}),.7*w);s.fill(Y,ribbon(pts,wd,{seed:93,taper:.5,wobble:.4}),.95*w);s.stroke(K,ribbon(pts,wd,{seed:93,taper:.5,wobble:.4}),1.4,.6*w);}

// ================================================================ 1 · Ajax in Madrid: the Bernabéu at full time (high main-stand camera)
const P1:V3=[-26,27,76];
function cam1(t:number):Cam{
 const ab=CUE(0,'Ajax beat'),fj=CUE(0,'Frenkie de Jong');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,4,-14],fov:42})],
  [ab-.4,1.4,()=>({P:P1,T:[-9.5,1.2,-30.2],fov:13})],
  [fj-.3,1.3,()=>({P:P1,T:[DJX,1.15,DJZ],fov:3.4})],
 ]);
}
/** the ball badge over his head on "loves the ball" (a graphic, not match action) */
function badgeAt(c:Cam):Pt|null{return pr(c,[DJX,2.75,DJZ]);}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),ab=CUE(0,'Ajax beat'),fg=CUE(0,'four goals'),fj=CUE(0,'Frenkie de Jong'),lb=CUE(0,'loves the ball');
  stadium(s,c,t,{roar:1,flash:.35+.5*sm(fg-.1,fg+.3,t)*(1-sm(fg+1.4,fg+2.2,t))});
  bernabeuGround(s,c);
  // "Frenkie de Jong": a yellow ring under 21
  ring(s,c,[DJX,0,DJZ],.8,sm(fj-.1,fj+.4,t,easeOutBack),Y,44);
  const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
  CEL.forEach((a,k)=>{const cur=celPose(a,t),q=toCam(c,[cur.x,.9,cur.z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
   items.push({d:q[2],draw:()=>{const P=celPose(a,tt),px=h*ppu,detail:AthleteStyle['detail']=passing?(k===0?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
    const prev=px>=90&&!passing?(()=>{const q2=celPose(a,tt-1/12);return{pose:q2.p,place:{x:q2.x,z:q2.z,yaw:q2.yaw}};})():undefined;
    drawPlayer(s,P.p,c,{...a.st,detail},{x:P.x,z:P.z,yaw:P.yaw},prev);}});});
  items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
  // "Ajax beat mighty Real Madrid": the score bug slides in; "four goals": the 4 pulses
  scoreBug(s,sm(ab-.2,ab+.4,t)*(1-sm(fj+.4,fj+1,t)),bump(fg-.1,fg+1.2,t));
  // "loves the ball": a ball badge pops over his head (a graphic), the material the camera travels into
  const bw=sm(lb-.15,lb+.35,t,easeOutBack);if(bw>.02){const g=badgeAt(c);if(g){const r=Math.max(34,kAt(c,[DJX,2.75,DJZ])*.24)*bw;
   const disc=new Path2D();disc.arc(g[0],g[1],r*1.35,0,TAU);s.knockout(disc,.95);s.fill(Y,disc,.95);s.stroke(K,disc,3,.9);
   footballPanels(s,g[0],g[1],r,{rot:t*1.5,key:K,shadow:B,seed:5});
   if(t<lb+.6)sparkBurst(s,Y,g[0],g[1],r*2.4,{n:8,seed:17,g:easeOutBack(clamp((t-lb)/.3)),width:Math.max(4,r*.12)});}}
 },
 aperture(t){const c=cam1(t),g=badgeAt(c)??[0,0];return apertureDisc(g[0],g[1],Math.max(34,kAt(c,[DJX,2.75,DJZ])*.24)*1.35,12);},
 still:0,
};
ch1.still=CUE(0,'Frenkie de Jong')+1.4;

// ================================================================ 2 · how he does it: the demonstration live, a high touchline camera, real time
/** τ through the chapter: the pass comes in, the defender rushes on "defender rushes", the turn on "Frenkie turns away", the carry on
 * "carries the ball", the open space on "open space"; real time elsewhere */
const tau2=(t:number)=>key(t,mono([[0,-3.9],[CUE(1,'defender rushes'),-2.4],[CUE(1,'Frenkie turns away')+.25,0],[CUE(1,'carries the ball')+.2,1.3],[CUE(1,'open space'),3],[SECS(1),3+(SECS(1)-CUE(1,'open space'))*.9]]),linear);
const P2:V3=[0,7,-16.5];
function cam2(t:number):Cam{
 const tau=tau2(t),h=at3(HERO,tau,1),b=ballAt(tau),tr=CUE(1,'Frenkie turns away');
 return plan(t,[
  [0,0,()=>({P:P2,T:[-5,.6,-.5],fov:44})],
  [CUE(1,'defender rushes')-.3,1.2,()=>({P:P2,T:mix3(h,at3(DEF,tau,1),.45),fov:21})],
  [tr+.2,1.4,()=>({P:P2,T:mix3(h,b,.4),fov:17})],
  [CUE(1,'carries the ball')+.2,1.6,()=>({P:add3(P2,[7,0,-2]),T:mix3(h,[OPEN[0],1,OPEN[2]],.3),fov:24})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tD=CUE(1,'defender rushes'),tT=CUE(1,'Frenkie turns away'),tC=CUE(1,'carries the ball'),tO=CUE(1,'open space'),E=SECS(1);
  trainingGround(s,c);
  openSpace(s,c,sm(tO-.3,tO+.3,t));
  // "defender rushes": the red pressure arrow along his run
  pressure(s,c,tau,sm(tD-.1,tD+.4,t)*(1-sm(tT+.6,tT+1.1,t)));
  // "turns away": the turn arrow round his pivot
  turnArrow(s,c,sm(tT-.1,tT+.6,t),sm(tT-.15,tT+.1,t)*(1-sm(tC+.3,tC+.8,t)));
  // "carries the ball": the ball's track from the turn
  carryPath(s,c,tau,sm(tC-.2,tC+.3,t)*(1-sm(E-.7,E-.3,t)));
  play(s,c,tau,tp,tpp,{minBall:12,lines:true,prevT:tau2(t-.06),smear:true});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'carries the ball')+.3;

// ================================================================ 3 · watch again: slow motion from a LOW camera
const tau3=(t:number)=>key(t,mono([[0,-1.9],[CUE(2,'Watch again'),-1.85],[CUE(2,'peeks over'),-1.2],[CUE(2,'keeps his body'),-.2],[CUE(2,'spins away'),.2],[CUE(2,'head up'),1.25],[SECS(2),2.2]]),linear);
const E3:V3=[-4.6,1.35,-5.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),h=at3(HERO,tau,1.05);
 return plan(t,[
  [0,0,()=>({P:E3,T:[.6,1.1,.6],fov:30})],
  [CUE(2,'keeps his body')-.4,1,()=>({P:add3(E3,[.8,-.2,.6]),T:mix3(h,[.6,.4,.4],.3),fov:30})],
  [CUE(2,'spins away')+.3,1.4,()=>({P:[-3,1.7,-7.4],T:mix3(h,[OPEN[0],1,OPEN[2]],.25),fov:34})],
  [CUE(2,'head up')-.3,1.2,()=>({P:add3(h,[-3.4,1.2,-5.6]),T:mix3(h,[OPEN[0],1,OPEN[2]],.3),fov:40})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  const tP=CUE(2,'peeks over'),tK=CUE(2,'keeps his body'),tS=CUE(2,'spins away'),tH=CUE(2,'head up'),E=SECS(2);
  trainingGround(s,c);
  // "keeps his body between": the yellow shield arc at his back, a red ring under the defender, a yellow ring on the ball
  const kw=sm(tK-.15,tK+.35,t)*(1-sm(tS+.4,tS+.9,t));shield(s,c,tau,kw);ring(s,c,at3(DEF,tau),.8,kw,R,45);
  // "spins away": the turn arrow
  turnArrow(s,c,sm(tS-.2,tS+.5,t),sm(tS-.25,tS,t)*(1-sm(tH,tH+.5,t)));
  // "head up": the open space ahead
  openSpace(s,c,sm(tH-.2,tH+.4,t)*(1-sm(E-.5,E-.2,t)));
  const r=play(s,c,tau,tp,tpp,{minBall:12,smear:true});
  // "peeks over his shoulder": a dashed eye-line from his head to the defender
  const pw=sm(tP-.1,tP+.35,t)*(1-sm(tK-.3,tK+.1,t));if(pw>.02&&r.hero){const d=pr(c,at3(DEF,tau,1.7));if(d)eyeLine(s,r.hero.joints.head,d,pw,Y,91);}
  if(kw>.02){const bq=pr(c,ballAt(tau));if(bq){const rr=Math.max(20,kAt(c,ballAt(tau))*.2),p=new Path2D();p.arc(bq[0],bq[1],rr*(.8+.2*kw),0,TAU);s.stroke(Y,p,Math.max(4,rr*.18),.95*kw);s.stroke(K,p,1.4,.5*kw);}}
  // "head up": the eye-line from his head to the open space
  const hw=sm(tH-.1,tH+.4,t)*(1-sm(E-.5,E-.2,t));if(hw>.02&&r.hero){const o=pr(c,[OPEN[0],.4,OPEN[2]]);if(o)eyeLine(s,r.hero.joints.head,o,hw,Y,92);}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.1))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'keeps his body')+.3;

// ================================================================ 4 · your turn: the lesson from a raised camera behind the play
const tau4=(t:number)=>key(t,mono([[0,-2.6],[CUE(3,'pressed'),-1.2],[CUE(3,'turn away'),.05],[CUE(3,'carry the ball'),1.1],[CUE(3,'open space'),2.7],[SECS(3),3.4]]),linear);
const E4:V3=[-6.5,6,-10.5];
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:add3(E4,[3,-3,4]),T:[1,.6,0],fov:26})],
  [CUE(3,'pressed')-.3,1.1,()=>({P:E4,T:[3,.4,-2.4],fov:34})],
  [CUE(3,'carry the ball')-.2,1.6,()=>({P:add3(E4,[4,1,-1]),T:[8.5,.4,-6.8],fov:38})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tY=CUE(3,'Your turn'),tP=CUE(3,'pressed'),tT=CUE(3,'turn away'),tC=CUE(3,'carry the ball'),tO=CUE(3,'open space'),E=SECS(3);
  trainingGround(s,c);
  // 5 · open space: the yellow patch
  openSpace(s,c,sm(tO-.3,tO+.3,t));
  // 1 · your turn: a ring under him
  ring(s,c,at3(HERO,Math.min(tau,-.4)),.8,sm(tY-.15,tY+.35,t,easeOutBack)*(1-sm(tT-.2,tT+.2,t)),Y,44);
  // 2 · pressed: the red pressure arrow and a ring under the defender
  const pw=sm(tP-.1,tP+.4,t)*(1-sm(E-.8,E-.4,t));pressure(s,c,Math.min(tau,.05),pw);ring(s,c,at3(DEF,tau),.85,pw*(1-sm(tT+.4,tT+.8,t)),R,45);
  // 3 · turn away: the turn arrow
  turnArrow(s,c,sm(tT-.15,tT+.5,t),sm(tT-.2,tT+.05,t)*(1-sm(E-.8,E-.4,t)));
  // 4 · carry the ball: the track into the space
  carryPath(s,c,tau,sm(tC-.2,tC+.3,t)*(1-sm(E-.8,E-.4,t)));
  play(s,c,tau,tp,tpp,{minBall:12,smear:true});
 },
 still:0,
};
ch4.still=CUE(3,'carry the ball')+.6;

const film:RisoStory={
 id:'frenkie-de-jong-signature',format:'11v11',title:"De Jong: carrying the ball out of pressure",
 theme:'When pressed, turn away from the defender and carry the ball into open space',
 ageNote:'Real Madrid 1–4 Ajax, UEFA Champions League round of 16, Santiago Bernabéu, Madrid, 5 March 2019 (the full-time scene), then a clearly labelled "how he does it" demonstration on a training pitch. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: turn away and go — a yellow hook that turns back on itself and runs off into space, a ball riding it. Reduced motion: the still hook. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=18;i++){const k=i/18*u,a=Math.PI*(1-Math.min(1,k*2.2));pts.push(k<.45?[x+60*Math.cos(a)-60,y-60*Math.sin(a)]:[x+(k-.45)/.55*260,y+(k-.45)/.55*60]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:7,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
