/** Gheorghe Hagi's long-range lob — Colombia 1–3 Romania, 1994 World Cup, Group A, Rose Bowl, Pasadena, Saturday 18 June 1994 — an
 * iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026; page text fetched directly):
 *  - Wikipedia, "1994 FIFA World Cup Group A" — match box, line-ups, kit templates, referee, attendance
 *    https://en.wikipedia.org/wiki/1994_FIFA_World_Cup_Group_A
 *  - Wikipedia, "Gheorghe Hagi" — captain, the "spectacular 35-meter lob from the side of the field, with the ball not spinning in the air",
 *    "naturally left-footed", AFP / Diario AS / L'Équipe rankings of the goal   https://en.wikipedia.org/wiki/Gheorghe_Hagi
 *  - Adevărul, "VIDEO 23 de ani de când România a răpus Columbia la Mondialul din SUA" (18 June 2017) — the build-up, the earlier lob
 *    Córdoba pushed behind, the ball barely spinning, Hagi's own words   https://adevarul.ro/sport/video-23-de-ani-de-cand-romania-a-rapus-columbia-1791907.html
 *  - Mediafax, "Golul lui Hagi din meciul cu Columbia în 1994, printre cele mai frumoase din istoria CM" (27 May 2010, the AFP top 10):
 *    from 40 metres, into the far side of Óscar Córdoba's net at a very tight angle
 *    https://www.mediafax.ro/sport/golul-lui-hagi-din-meciul-cu-columbia-in-1994-printre-cele-mai-frumoase-din-istoria-cm-galerie-video-6185175
 *  - Click.ro, "Lobul lui Hagi cu Columbia, în Top 10 al Mondialelor" (27 May 2010) — minute 34, "from 40 metres"
 *    https://click.ro/actualitate/lobul-lui-hagi-cu-columbia-in-top-10-al-221235.html
 *  - The Guardian, "The best ever World Cup match? Romania 3–2 Argentina at USA 94" (26 June 2018) — Dumitrescu's curler "from near the
 *    touchline … replicating a goal scored by Hagi against Colombia"   https://www.theguardian.com/football/2018/jun/26/world-cup-best-game-argentina-romania-usa-94-hagi
 * CONFIRMED by those accounts: Saturday 18 June 1994, 4:30 pm local, Rose Bowl, Pasadena, 91,856 spectators, referee Jamal Al Sharif
 * (Syria); Colombia 1–3 Romania: Răducioiu 16' (Hagi assist), HAGI 34', Valencia 43', Răducioiu 89'; Hagi captain, number 10, playing on
 * the left; Córdoba (1) in goal for Colombia, Valderrama (10) captain; the build-up: a Dan Petrescu throw-in, Ilie Dumitrescu switched play
 * to Dorinel Munteanu, Munteanu passed to Hagi; Hagi struck from wide, "from the side of the field" / near the touchline, 35–40 m out,
 * with his (natural) LEFT foot, a lob with almost no spin that beat Córdoba into the far side of the net at a tight angle (Adevărul: "în
 * vinclu", into the top corner); Hagi: "I knew their keeper was restless and came out too far. I had studied his game and was sure I'd
 * catch him at least once"; earlier he had tried a 35 m lob that Córdoba pushed behind for a corner. KITS (Wikipedia kit templates for this
 * match): Romania all YELLOW (shirt, shorts, socks); Colombia BLUE shirts, RED shorts, red socks. Răducioiu's long blond hair (Adevărul:
 * "îşi flutură chica blondă"); Valderrama's blond curls.
 * INFERRED (illustrative): every exact position (Hagi's strike 28.6 m up the pitch and 23.6 m left of the goal's centre ≈ 37 m from the
 * goal, ≈ 39 m to the far post; Córdoba ≈ 6.6 m off his line), the length of Hagi's carry (the film gives him ≈ 4.5 s and about five
 * touches so the look-up reads) and where Munteanu passed from, the flight (peak ≈ 8 m, ≈ 2.3 s, a straight line in plan: no spin, no
 * curl), exactly where it crossed the line, Córdoba's back-pedal and late left-handed leap, every other player's spot and run, all skin
 * tones, Córdoba's grey keeper kit, number inks and trims, the referee's black kit, the camera positions and which side of the pitch the
 * play is on, the Rose Bowl's shape as drawn (one open, rounded bowl with tunnel portals, no roof), the San Gabriel mountains behind the
 * far rim, the crowd's colours, and the celebrations.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (the carry is keyed to the narration, the
 * strike and flight run at ~1–1.3× real time): the bowl wide → the build-up down the left → Hagi → the distance to goal → close on him
 * looking up → pan to Córdoba off his line → the lob → the net; ch2 = slow-motion replay from LOW BEHIND Hagi's left shoulder: the left foot
 * slides under the ball and it floats up over the pitch; ch3 = slow-motion replay from BEHIND THE GOAL, through the net: Córdoba
 * back-pedals and leaps, the ball drops over him into the far corner; ch4 = the lesson from high behind Hagi: a tricolour burst for 3–1,
 * then a paused replay: his eye-line to the keeper (look up), the gap between Córdoba and his line (off the line), the lob's arc over him
 * (well-weighted), and the distance ticked off along the grass (from far away).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central ~1000 units, so
 * it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev` secondary motion, motion smear on
 * the strike and the keeper's leap); small figures in the wide shots and every figure inside a passage print at `low` detail.
 * Handedness: the world is right-handed (x toward Colombia's goal, y up, +z = the attacker's right), exactly athlete.ts's convention, so
 * Hagi's LEFT foot strikes (strike foot 'l') without a mirrored projector, and he plays on the −z (left) wing.
 * Inks: yellow, red, blue, navy (also Romania's blue-yellow-red tricolour). Everything is keyed to cue times (withTiming swaps in the
 * recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperTip,backpedal,celebrate,posed,blendPose,
 STRIKE_CONTACT,touchPhase,type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/hagi-lob-1994/timing.json, add
 *   import timingJson from '../../../public/plays/narration/hagi-lob-1994/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The lob, live',text:'The Rose Bowl, 1994. Romania against Colombia at the World Cup. Gheorghe Hagi gets the ball wide on the left, forty yards out. He looks up. The keeper is off his line! Hagi lifts it... Goal!',tail:2.4,
  cues:['The Rose Bowl','Romania against Colombia','Gheorghe Hagi','gets the ball','forty yards','He looks up','The keeper','off his line','Hagi lifts it','Goal']},
 {label:'Watch it again',text:'Watch it again. His left foot slides under the ball, and it floats high.',tail:1.5,
  cues:['Watch it again','left foot','under the ball','floats high']},
 {label:'Behind the goal',text:'From behind the goal: Córdoba scrambles back, but it drops into the far corner.',tail:1.7,
  cues:['From behind','Córdoba','scrambles back','but it drops','far corner']},
 {label:'Look up!',text:'Romania won three-one! The secret? Always look up. If the keeper is off the line, a well-weighted lob can beat them from far away.',tail:1.8,
  cues:['Romania won','The secret','Always look up','off the line','well-weighted','beat them','far away']},
];
import timingJson from '../../../public/plays/narration/hagi-lob-1994/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('hagi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('hagi: no cue '+w);return c.at;};
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
const norm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const DEG=Math.PI/180;
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Colombia's goal line is x = 0 (Romania attack +x), goal centre z = 0, +z = the attacker's right; the halfway line x = −52.5. */
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

// ---------------------------------------------------------------- the Rose Bowl: a June-afternoon sky, the mountains, one open bowl, the crowd
const CX=-52.5,SECT=56;
/** the bowl: th around the pitch centre, b 0 (front row) … 1 (the rim). A rounded rectangle in plan, one open tier, no roof. */
function rim(th:number,b:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+50*b)*Math.sign(c)*Math.pow(Math.abs(c),.6),1.2+24*b,(42+46*b)*Math.sign(s)*Math.pow(Math.abs(s),.6)];}
/** skip the part of the bowl the camera sits in (it would print as huge planes across the bottom of the frame) */
function sectorOn(c:Cam,th:number){const ex=c.eye[0]-CX,ez=c.eye[2],el=Math.hypot(ex,ez);if(el<48)return true;return(Math.cos(th)*ex+Math.sin(th)*ez)/el<.5;}
/** the San Gabriel mountains: a hazy ridge far beyond the rim (world points) */
const RIDGE:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=26;i++){const a=i/26,x=lerp(-1400,900,a),h=70+55*Math.sin(a*9.1+.6)+35*Math.sin(a*23+2)+30*hash(i,3);o.push([x,Math.max(30,h),900+120*Math.sin(a*5)]);}return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a pale, hazy June sky; warm haze low down
 s.field(B,.15,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.2);
 // the mountains (only when the camera looks their way)
 {const q:Pt[]=[];for(const P of RIDGE){const p=pr(c,P);if(p)q.push(p);}
  if(q.length>4){const base=pr(c,[0,0,900]);const y0=(base?base[1]:q[0][1])+600;const m=polyPath([[q[0][0],y0],...q,[q[q.length-1][0],y0]],true);s.tone(B,m,.42);s.tone(K,m,.14);}}
 // the bowl's concrete, tunnel portals, the rim
 const bowl=new Path2D(),portal=new Path2D(),edge=new Path2D(),on:number[]=[];
 for(let i=0;i<SECT;i++){const th0=i/SECT*TAU,th1=(i+1)/SECT*TAU,thm=(th0+th1)/2;if(!sectorOn(c,thm))continue;on.push(i);
  addPoly(bowl,polyP(c,[rim(th0,0),rim(th1,0),rim(th1,1),rim(th0,1)]));
  seg3(c,rim(th0,1),rim(th1,1),.7,edge);
  if(i%4===1){const a=rim(lerp(th0,th1,.3),.14),b=rim(lerp(th0,th1,.7),.14);addPoly(portal,polyP(c,[a,b,add3(b,[0,2.4,0]),add3(a,[0,2.4,0])]));}}
 s.knockout(bowl);s.tone(K,bowl,.3);s.tone(Y,bowl,.18);
 // the crowd: 91,856 — seeded dots (Colombia's yellow shirts, red, blue, white; a few thousand Romanians in yellow too), sized by distance
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const i of on){const th0=i/SECT*TAU,th1=(i+1)/SECT*TAU;for(let j=0;j<16;j++){const b=(j+.5)/16;
  for(let k=0;k<5;k++){const h=hash(i*131+j*7919+k*17,5);if(h<.22)continue;if(i%4===1&&b<.24&&k>0&&k<4)continue;
   const P=rim(lerp(th0,th1,(k+.5+(hash(i+j*31+k,9)-.5)*.6)/5),b),q=toCam(c,add3(P,[0,.5,0]));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.2,17),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.5?0:h<.74?1:h<.86?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.fill(Y,inks[0],.95);s.knockout(inks[1],.75);s.fill(R,inks[2],.9);s.fill(B,inks[3],.9);
 s.knockout(portal);s.fill(K,portal,.9);s.knockout(edge,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),q=pr(c,rim(r1*TAU,.1+.8*r2));if(!q||!sectorOn(c,r1*TAU))continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;noGoal?:boolean}={}){
 // the apron under the camera's own (culled) stand is grass too, so the frame's bottom edge never shows bare paper
 const ex=c.eye[0],ez=c.eye[2],x0=ex<-100?-140:-112,x1=ex>0?40:7.4,z0=ez<-40?-95:-42,z1=ez>40?95:42;
 const g=polyP(c,[[x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: white, with coloured panels
 const bd=new Path2D(),pr1=new Path2D(),pb=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([4.4,0,-37],[4.4,0,37]);board([-109.4,0,-37],[4.4,0,-37]);board([-109.4,0,37],[4.4,0,37]);board([-109.4,0,-37],[-109.4,0,37]);
 for(let k=0;k<12;k++){const z=-35+k*6.1;addPoly(k%2?pb:pr1,polyP(c,[[4.3,.22,z],[4.3,.22,z+3.2],[4.3,.68,z+3.2],[4.3,.68,z]]));}
 for(const zz of[-36.9,36.9])for(let k=0;k<18;k++){const x=-107+k*6.2;addPoly(k%2?pb:pr1,polyP(c,[[x,.22,zz],[x+3.3,.22,zz],[x+3.3,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.stroke(K,bd,1.2,.5);s.fill(R,pr1,.9);s.fill(B,pb,.9);
 // painted lines (the whole pitch)
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(const X of[0,-52.5,-105])for(let k=0;k<4;k++)L([X,0,-34+k*17],[X,0,-34+(k+1)*17]);
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 for(const[X,d] of [[0,-1],[-105,1]] as [number,number][]){
  L([X,0,-20.16],[X+16.5*d,0,-20.16]);L([X+16.5*d,0,-20.16],[X+16.5*d,0,20.16]);L([X+16.5*d,0,20.16],[X,0,20.16]);
  L([X,0,-9.16],[X+5.5*d,0,-9.16]);L([X+5.5*d,0,-9.16],[X+5.5*d,0,9.16]);L([X+5.5*d,0,9.16],[X,0,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)circ(X-11,0,9.15,Math.PI-a,Math.PI+a,12);else circ(X+11,0,9.15,-a,a,12);
  seg3(c,[X+11*d-.1,0,0],[X+11*d+.1,0,0],.22,ln);}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 // corner flags
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 if(!o.noGoal)goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out at the far top corner (z +2.9) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=2.9,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2));
 const zs=[z0,-1.8,0,1.8,2.9,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the strike)
/** the strike: 28.6 m out, 23.6 m to the left of the goal's centre (≈ 37 m from goal, ≈ 39 m to the far post) */
const B0:V3=[-28.6,.11,-23.6];
/** where it crosses the line: the far side, just under the bar */
const G:V3=[0,2.05,2.95];
const DXZ=Math.hypot(G[0]-B0[0],G[2]-B0[2]),U:[number,number]=[(G[0]-B0[0])/DXZ,(G[2]-B0[2])/DXZ];
/** the lob: a straight line in plan (almost no spin — no curl), height a skewed arc (peak ≈ 8 m past half way: air drag steepens the drop) */
const ARC=7.2;
function lobAt(u:number):V3{const w=Math.pow(clamp(u),1.2);return[B0[0]+U[0]*DXZ*u,.11+(G[1]-.11)*u+ARC*4*w*(1-w),B0[2]+U[1]*DXZ*u];}
const FLY=2.3;
const uAt=(tau:number)=>{const k=clamp(tau/FLY);return k*(1.25-.25*k);};
const tauAtU=(u:number)=>FLY*(1.25-Math.sqrt(1.5625-clamp(u)))/.5;
const NET_HIT:V3=[1.55,1.25,3.2],REST:V3=[1.15,.11,2.7],IN_NET=FLY+.16;

// ---- the build-up: Munteanu's pass, Hagi's carry (inferred lengths; see the header)
const T_PASS=-6.2,T_RECV=-5.0,SD=1.0,T_SET=-STRIKE_CONTACT*SD,STRIKE_L=1.5;
/** Hagi approaches the ball from its right (a left-footer), so his run points a little left of the shot line */
const DIR=norm2(U[0]+.36*U[1],U[1]-.36*U[0]),RIGHT:[number,number]=[-DIR[1],DIR[0]];
const YAW_H=yawTo(0,0,DIR[0],DIR[1]);
const H_BUILD={height:1.74,bulk:1.02,thighs:1.12};
/** where Hagi's pelvis stands at contact so his LEFT toe is just behind and under the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),H_BUILD,{x:0,z:0,yaw:YAW_H}),toe:[number,number]=[B0[0]-DIR[0]*.13+RIGHT[0]*.03,B0[2]-DIR[1]*.13+RIGHT[1]*.03];return[toe[0]-sk.lToe[0],toe[1]-sk.lToe[2]];})();
const H_P:[number,number]=[PC[0]-DIR[0]*STRIKE_L,PC[1]-DIR[1]*STRIKE_L];
const LEAD_END=Math.hypot(B0[0]-H_P[0],B0[2]-H_P[1]);
/** the reception: Hagi's pelvis, and the ball .55 m in front of him */
const H_R:[number,number]=[-39.9,-27.9];
const D0=norm2(H_P[0]-H_R[0],H_P[1]-H_R[1]),CARRY=Math.hypot(H_P[0]-H_R[0],H_P[1]-H_R[1]);
const R0:V3=[H_R[0]+D0[0]*.55,.11,H_R[1]+D0[1]*.55];
const M0:[number,number]=[-49.6,-31.6];
const TOUCHES=Math.max(3,Math.round(CARRY/2.1)),STRIDE=CARRY/TOUCHES;
/** progress along the carry, 0..1 (slow off the reception, quicker into the strike) */
const carryU=(tau:number)=>{const u=clamp((tau-T_RECV)/(T_SET-T_RECV));return .35*u+.65*u*u;};
/** the carry bows a little infield (to the attacker's right) */
const RIGHT0:[number,number]=[-D0[1],D0[0]];
function carryAt(tau:number):[number,number]{const u=carryU(tau),bow=.9*Math.sin(Math.PI*u);return[lerp(H_R[0],H_P[0],u)+RIGHT0[0]*bow,lerp(H_R[1],H_P[1],u)+RIGHT0[1]*bow];}
function heading(tau:number):[number,number]{const a=carryAt(tau-.06),b=carryAt(tau+.06);return norm2(b[0]-a[0],b[1]-a[1]);}
/** dribble phase: a touch (phase = touchPhase) exactly at the reception and at the set-up of the strike */
const dphase=(tau:number)=>touchPhase+carryU(tau)*CARRY/STRIDE;
function ballAt(tau:number):V3{
 if(tau<=T_PASS)return[M0[0]+.5,.11,M0[1]+.2];
 if(tau<T_RECV){const u=clamp((tau-T_PASS)/(T_RECV-T_PASS)),e=u*(1.35-.35*u);return[lerp(M0[0]+.5,R0[0],e),.11,lerp(M0[1]+.2,R0[2],e)];}
 if(tau<T_SET){const p=carryAt(tau),d=heading(tau),w=((dphase(tau)-touchPhase)%1+1)%1,lead=lerp(.55,LEAD_END,sm(-1.5,T_SET,tau))+.62*Math.sin(Math.PI*w)*(1-sm(-1.2,T_SET,tau)*.6);
  return[p[0]+d[0]*lead,.11,p[1]+d[1]*lead];}
 if(tau<=0)return B0;
 if(tau<FLY)return lobAt(uAt(tau));
 if(tau<IN_NET)return mix3(G,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
/** hardly any spin on a lob like this ("the ball not spinning in the air"): a slow drift of the panels in flight */
const spinAt=(tau:number)=>tau<=0?(tau>T_RECV?(carryU(tau)*CARRY)/.11*.5:0):TAU*.6*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
const romania=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:B,numberInk:B,hairStyle:'short',...o});
const colombia=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:R,socks:R,boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const HAGI_ST=romania({number:10,skin:[[Y,.4],[R,.24]],build:H_BUILD,seed:10});
const KEEPER_ST:AthleteStyle={shirt:[K,.42],shorts:[K,.85],socks:[K,.42],boots:K,skin:SKIN_M,hair:K,line:K,trim:R,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:{height:1.83},seed:16};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_M,hair:K,line:K,hairStyle:'short',build:{height:1.78},seed:30};

// ---------------------------------------------------------------- degree overrides (like athlete.ts's own `over`)
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*DEG;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));

// ---------------------------------------------------------------- Hagi: the carry, the look up, the left-footed lob
/** head up: when he looks up to find Córdoba (confirmed: "he spotted the keeper off his line"; the timing is inferred) */
const T_LOOK=-3.3;
const lookAt=(tau:number)=>Math.max(bump(T_LOOK-.25,T_LOOK+1.05,tau)*1.15,.6*bump(-1.55,-.85,tau));
/** Hagi's pose. look (0..1) forces the head up (the lesson's paused replay); it = idle clock */
function hagiPose(tau:number,look=0,it=0):Pose{
 let p:Pose;
 if(tau<T_RECV){const u=clamp((tau-T_PASS+1)/(T_RECV-T_PASS+1));p=runCycle(it*1.1+u*1.8,{speed:.3});
  // watching the pass come in over his left shoulder
  p=over(p,{neckY:52,neckP:10,twist:14},sm(T_PASS-.6,T_PASS,tau)*(1-sm(T_RECV-.25,T_RECV+.1,tau)));
  p=blendPose(p,dribble(dphase(T_RECV),{foot:'l',speed:.45}),sm(T_RECV-.3,T_RECV,tau));}
 else if(tau<T_SET){p=dribble(dphase(tau),{foot:'l',speed:.45});}
 else{const us=STRIKE_CONTACT+tau/SD,dr=dribble(dphase(T_SET)+(tau-T_SET)*1.4,{foot:'l',speed:.45});
  p=blendPose(dr,strike(Math.min(1,us),{foot:'l',power:.72}),sm(T_SET,T_SET+.14,tau));
  // the lob: lean back a touch, the ankle locked, the foot slides UNDER the ball and lifts (a short, high follow-through)
  const lo=sm(T_SET+.1,-.02,tau)*(1-sm(.1,.45,tau));p=over(p,{lean:-6,pitch:-2,lAnk:34,neckP:30},.7*lo);
  if(tau>0)p=over(p,{lHipF:84,lKnee:30},.5*bump(0,.55,tau));
  // watching it drop in, then the celebration: arms up, a jump
  if(tau>.6)p=over(p,{neckP:-18,neckY:8},sm(.6,1.2,tau)*(1-sm(FLY,FLY+.4,tau)));
  if(tau>FLY-.1)p=blendPose(p,celebrate((tau-FLY)*1.1,{kind:'arms'}),sm(FLY-.1,FLY+.35,tau));}
 const lk=Math.max(look,tau>T_RECV&&tau<T_SET?lookAt(tau):0);
 if(lk>0)p=over(p,{neckP:-16,neckY:-16,lean:8,lShA:34,rShA:30},clamp(lk));
 return p;
}
function hagiPlace(tau:number):Place{
 if(tau<T_RECV){const u=clamp((tau-T_PASS+1)/(T_RECV-T_PASS+1)),e=u*(1.2-.2*u);return{x:H_R[0]-D0[0]*2.2*(1-e),z:H_R[1]-D0[1]*2.2*(1-e),yaw:yawTo(0,0,D0[0],D0[1])};}
 if(tau<T_SET){const p=carryAt(tau),h=heading(tau),y=yawTo(0,0,h[0],h[1]);return{x:p[0],z:p[1],yaw:lerpAng(y,YAW_H,sm(T_SET-.45,T_SET,tau))};}
 let g:number;
 if(tau<0){const v=(tau-T_SET)/-T_SET;g=-STRIKE_L+STRIKE_L*(.55*v+.45*(1-(1-v)*(1-v)));}
 else g=.9*(1-Math.pow(1-clamp(tau/.7),2));
 return{x:PC[0]+DIR[0]*g,z:PC[1]+DIR[1]*g,yaw:lerpAng(YAW_H,yawTo(0,0,U[0],U[1]),sm(.3,1,tau))};
}

// ---------------------------------------------------------------- Córdoba: off his line, the scramble back, the late leap
const KP0:[number,number]=[-6.6,-2.0],KP1:[number,number]=[-2.3,.7],T_BACK=.12,T_LEAP=1.5;
const keeperYaw=(x:number,z:number)=>yawTo(x,z,B0[0],B0[2]);
function keeperAt(tau:number,it:number):{pose:Pose;place:Place}{
 let pose:Pose,x=KP0[0],z=KP0[1];
 if(tau<T_BACK){pose=keeperSet(it*1.3);}
 else if(tau<T_LEAP){const u=sm(T_BACK,T_LEAP,tau,easeInOutSine);x=lerp(KP0[0],KP1[0],u);z=lerp(KP0[1],KP1[1],u);
  pose=blendPose(keeperSet(.75),backpedal((tau-T_BACK)*2.6),sm(T_BACK,T_BACK+.2,tau));pose=over(pose,{neckP:-40},sm(T_BACK,.6,tau));}
 else{x=KP1[0];z=KP1[1];pose=blendPose(backpedal((T_LEAP-T_BACK)*2.6),keeperTip(clamp(tau-T_LEAP),{hand:'l'}),sm(T_LEAP,T_LEAP+.12,tau));
  // turn to look at the net, then sink
  if(tau>T_LEAP+1.1)pose=blendPose(pose,posed({lHipF:70,rHipF:64,lKnee:110,rKnee:104,lean:30,neckP:26,neckY:60,lShA:20,rShA:20,lShF:30,rShF:30,lElb:30,rElb:30}),sm(T_LEAP+1.1,T_LEAP+1.8,tau)*.8);}
 return{pose,place:{x,z,yaw:keeperYaw(x,z)}};
}

// ---------------------------------------------------------------- everyone else (positions inferred): piecewise-linear runs, faces the ball
type Role='col'|'rom'|'ref'|'munt';
type Actor={name:string;role:Role;st:AthleteStyle;keys:[number,number,number][];phase:number};
const ACTORS:Actor[]=[
 {name:'Herrera',role:'col',st:colombia({number:4,skin:SKIN_D,build:{height:1.75},seed:40}),keys:[[-6.2,-25,-12],[-2.5,-28.5,-16.3],[0,-27.9,-18.6],[2.5,-25,-18]],phase:.1},
 {name:'Escobar',role:'col',st:colombia({number:2,build:{height:1.83},seed:41}),keys:[[-6.2,-17,-6],[0,-14,-5.4],[2.4,-8,-3]],phase:.6},
 {name:'Perea',role:'col',st:colombia({number:15,skin:SKIN_D,build:{height:1.82},seed:42}),keys:[[-6.2,-16,3],[0,-13,1.8],[2.4,-7.5,1.2]],phase:.3},
 {name:'Pérez',role:'col',st:colombia({number:20,build:{height:1.76},seed:43}),keys:[[-6.2,-19,13],[0,-15,10],[2.4,-10.5,7]],phase:.8},
 {name:'Álvarez',role:'col',st:colombia({number:14,build:{height:1.78},seed:44}),keys:[[-6.2,-35,-13],[0,-30.5,-15],[2.4,-26,-13]],phase:.4},
 {name:'Gómez',role:'col',st:colombia({number:6,build:{height:1.77},seed:45}),keys:[[-6.2,-34,-2],[0,-28.5,-4.5],[2.4,-23,-4]],phase:.9},
 {name:'Valderrama',role:'col',st:colombia({number:10,hairStyle:'curly',hair:[Y,.95],build:{height:1.75,head:1.08},seed:46}),keys:[[-6.2,-41,4],[0,-36,0],[2.4,-33,-2]],phase:.5},
 {name:'Rincón',role:'col',st:colombia({number:19,skin:SKIN_D,build:{height:1.85},seed:47}),keys:[[-6.2,-45,-19],[0,-39,-18],[2.4,-35,-16]],phase:.2},
 {name:'Asprilla',role:'col',st:colombia({number:21,skin:SKIN_D,build:{height:1.76,bulk:.92},seed:48}),keys:[[-6.2,-57,-5],[2.4,-54,-4]],phase:.7},
 {name:'Valencia',role:'col',st:colombia({number:11,skin:SKIN_D,build:{height:1.8},seed:49}),keys:[[-6.2,-58,9],[2.4,-55,7]],phase:.15},
 {name:'Munteanu',role:'munt',st:romania({number:7,build:{height:1.77},seed:20}),keys:[[-7,-50.3,-31.9],[T_PASS,-50.1,-31.8],[0,-41,-30],[2.4,-36,-28]],phase:.35},
 {name:'Răducioiu',role:'rom',st:romania({number:9,hairStyle:'long',hair:[Y,.9],build:{height:1.8},seed:21}),keys:[[-6.2,-23,-9],[0,-15.5,-6.5],[2.4,-9,-4.5]],phase:.55},
 {name:'Dumitrescu',role:'rom',st:romania({number:11,build:{height:1.77},seed:22}),keys:[[-6.2,-25,7],[0,-17.5,4.5],[2.4,-12,3]],phase:.25},
 {name:'Lupescu',role:'rom',st:romania({number:5,build:{height:1.84},seed:23}),keys:[[-6.2,-43,-4],[0,-37,-6.5],[2.4,-34,-6]],phase:.65},
 {name:'Popescu',role:'rom',st:romania({number:6,build:{height:1.86},seed:24}),keys:[[-6.2,-51,6],[0,-45,2]],phase:.45},
 {name:'Petrescu',role:'rom',st:romania({number:2,build:{height:1.78},seed:25}),keys:[[-6.2,-41,24],[0,-33,20],[2.4,-29,18]],phase:.75},
 {name:'Al Sharif',role:'ref',st:REF_ST,keys:[[-6.2,-39,-9],[0,-31.5,-11],[2.4,-26,-10]],phase:.05},
];
function keyPos(keys:[number,number,number][],tau:number):[number,number]{const n=keys.length;if(tau<=keys[0][0])return[keys[0][1],keys[0][2]];if(tau>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(i<n-2&&tau>=keys[i+1][0])i++;const[t0,x0,z0]=keys[i],[t1,x1,z1]=keys[i+1],u=easeInOutSine(clamp((tau-t0)/(t1-t0)))*.3+(tau-t0)/(t1-t0)*.7;return[lerp(x0,x1,u),lerp(z0,z1,u)];}
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=keyPos(a.keys,tau),[x2,z2]=keyPos(a.keys,tau+.1),vx=(x2-x)/.1,vz=(z2-z)/.1,sp=Math.hypot(vx,vz),b=ballAt(Math.min(tau,FLY));
 if(a.role==='munt'&&tau<T_PASS+.6){const d=norm2(R0[0]-M0[0],R0[2]-M0[1]),y=yawTo(0,0,d[0],d[1]),u=STRIKE_CONTACT+(tau-T_PASS)/.9;
  const pose=u<0?stand():blendPose(stand(),strike(Math.min(1,u),{power:.3}),sm(-.1,.1,u));return{pose,place:{x:M0[0]+.5-d[0]*.55-d[1]*.1,z:M0[1]+.2-d[1]*.55+d[0]*.1,yaw:y}};}
 const toBall=yawTo(x,z,b[0],b[2]),moveYaw=yawTo(0,0,vx,vz),ph=it*1.4+a.phase;
 let pose:Pose,yaw=toBall;
 if(sp<.35)pose=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lean:14,lShA:20,rShA:20,lElb:40,rElb:40}),.5+.3*Math.sin(it*2+a.phase*TAU));
 else if(Math.cos(wrap(moveYaw-toBall))<-.2&&a.role==='col'){pose=backpedal(ph*1.6);}
 else{pose=runCycle(ph,{speed:clamp(sp/7.5)});yaw=lerpAng(moveYaw,toBall,.25);}
 // heads up to follow the flight; Colombians sag after the goal
 if(tau>.2)pose=over(pose,{neckP:-30},sm(.2,.8,tau)*(1-sm(FLY,FLY+.5,tau)));
 if(tau>FLY+.3&&a.role==='col')pose=blendPose(pose,posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20}),sm(FLY+.3,FLY+1,tau)*.7);
 if(tau>FLY+.3&&a.role==='rom')pose=blendPose(pose,celebrate(it*.9+a.phase,{kind:'arms'}),sm(FLY+.3,FLY+.9,tau)*.9);
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the strike, the keeper's leap). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.05,.12,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(240,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;look?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const look=e.look??0;
 {const pl=hagiPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=hagiPose(tp,look,e.it),prev={pose:hagiPose(tpPrev,look,e.it-1/12),place:hagiPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(HAGI_ST,d,true),pl,prev,!!e.smear&&tp>T_SET+.2&&tp<.4);}});}
 {const cur=keeperAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=keeperAt(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(KEEPER_ST,d,true),cur.place,prev,!!e.smear&&tp>T_LEAP+.2&&tp<T_LEAP+.8);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const hxz=(tau:number,y=1):V3=>{const p=hagiPlace(tau);return[p.x??0,y,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera
/** the carry is keyed to the narration (the pass on "gets the ball", the look up on "He looks up"); the strike just after "Hagi lifts it"
 * and the ball in the net on "Goal" (≈ 1–1.3× real time); after that, real time */
function tau1(t:number){const g=CUE(0,'Goal'),hl=CUE(0,'Hagi lifts'),tStrike=Math.max(hl+.35,g+.1-FLY/1.3);
 return key(t,mono([[0,T_PASS-CUE(0,'gets the ball')*.35-.2],[CUE(0,'gets the ball'),T_PASS],[CUE(0,'He looks up')+.1,T_LOOK+.1],[tStrike,0],[Math.max(tStrike+.5,g+.1),FLY+.05],[SECS(0)+.5,FLY+.05+Math.max(.5,SECS(0)+.4-g)]]),linear);}
const P1:V3=[-34,23,-84];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,2,-6],fov:36})],
  [CUE(0,'Romania against')-.2,1.4,()=>({P:P1,T:[-41,.8,-24],fov:20})],
  [CUE(0,'Gheorghe Hagi')-.2,.8,()=>({P:P1,T:hxz(tau,1),fov:4.4})],
  [CUE(0,'gets the ball')+.4,.8,()=>({P:P1,T:mix3(hxz(tau,.9),ballAt(tau),.4),fov:9})],
  [CUE(0,'forty yards')-.1,.9,()=>({P:P1,T:[-17,1.5,-12],fov:30})],
  [CUE(0,'He looks up')-.25,.6,()=>({P:P1,T:hxz(tau,1.3),fov:3.4})],
  [CUE(0,'The keeper')-.15,.6,()=>({P:P1,T:[-3.6,1.3,-.8],fov:9})],
  [CUE(0,'Hagi lifts')-.35,.6,()=>({P:P1,T:mix3(hxz(tau,1),[-2,2,0],.45),fov:30})],
  [CUE(0,'Hagi lifts')+.5,1,()=>({P:P1,T:mix3(ballAt(Math.min(tau,FLY)),[-1,2,1],.6),fov:26})],
  [CUE(0,'Goal')-.15,1.1,()=>({P:P1,T:[-.4,1.4,1.2],fov:7.5})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.4,g+3.4,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:15,lines:true,prevT:tau1(t-.06),hero:'mid'});
  // "off his line": a yellow ring pops round Córdoba's feet
  const ko=sm(CUE(0,'off his')-.1,CUE(0,'off his')+.3,t,easeOutBack)*(1-sm(CUE(0,'Hagi lifts')+.2,CUE(0,'Hagi lifts')+.7,t));
  if(ko>.02){const k=keeperAt(tp,tt).place,ring:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,p=pr(c,[(k.x??0)+Math.cos(a)*.9*ko,0,(k.z??0)+Math.sin(a)*.9*ko]);if(p)ring.push(p);}
   if(ring.length>28){const rr=ribbon(ring,Math.max(5,kAt(c,[k.x??0,0,k.z??0])*.1),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ko);s.fill(Y,rr,.95*ko);}}
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow-motion replay from low behind Hagi's left shoulder
const tau2=(t:number)=>key(t,mono([[0,-1.35],[CUE(1,'left foot'),-.3],[CUE(1,'under the ball')+.2,.03],[CUE(1,'floats high'),.55],[SECS(1),1.25]]),linear);
const LEFT:[number,number]=[U[1],-U[0]];
const E2:V3=[B0[0]-U[0]*6.5+LEFT[0]*2.6,1.15,B0[2]-U[1]*6.5+LEFT[1]*2.6];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.max(0,Math.min(tau,FLY)));
 return plan(t,[
  [0,0,()=>({P:E2,T:add3(mix3(B0,hxz(tau,0),.4),[0,.75,0]),fov:32})],
  [CUE(1,'left foot')-.25,.7,()=>({P:add3(E2,[U[0]*1.5,-.2,U[1]*1.5]),T:add3(B0,[-U[0]*.3,.35,-U[1]*.3]),fov:17})],
  [CUE(1,'floats high')-.3,1.1,()=>({P:add3(E2,[0,.3,0]),T:mix3(b,[-4,2,-1],.25),fov:40})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t);
  ground(s,c);
  // the replay trail: the rise so far (under the players)
  if(tau>.02){const pts=pathPts(c,Math.max(0,tau-.8),Math.min(tau,FLY),18);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13});
  // "under the ball": a small yellow scoop mark under the ball at contact
  const un=sm(CUE(1,'under')-.1,CUE(1,'under')+.3,t,easeOutBack)*(1-sm(CUE(1,'floats')-.1,CUE(1,'floats')+.4,t));
  if(un>.02){const p=pr(c,add3(B0,[0,-.02,0]));if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,B0)*.4)*un,{n:9,seed:61,width:Math.max(5,kAt(c,B0)*.035)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · slow-motion replay from behind the goal, through the net
const tau3=(t:number)=>key(t,mono([[0,1.05],[CUE(2,'Córdoba'),1.3],[CUE(2,'scrambles'),1.55],[CUE(2,'but it drops'),2.02],[CUE(2,'far corner')+.2,FLY+.02],[SECS(2),IN_NET+.9]]),linear);
const E3:V3=[6.6,2.3,5.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([-9,3.2,-4],b,.35),fov:36})],
  [CUE(2,'scrambles')-.2,.9,()=>({P:E3,T:mix3([-2.6,2.2,.2],b,.35),fov:30})],
  [CUE(2,'far corner')-.3,1,()=>({P:add3(E3,[-.4,-.2,-.4]),T:[.2,1.6,2.4],fov:26})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{noGoal:true});
  // the replay trail: the drop over the keeper
  if(tau<IN_NET+.6){const pts=pathPts(c,Math.max(.4,tau-.9),Math.min(tau,FLY),18),fade=1-sm(FLY,IN_NET+.6,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13});
  // seen THROUGH the net: the goal prints over the players
  goal3(s,c,bulgeAt(tau));
 },
 aperture(t){const c=cam3v(t),P=ballAt(tau3(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 4 · the lesson: look up → off the line → a well-weighted lob → from far away
const tau4=(t:number)=>key(t,mono([[0,-1.75],[CUE(3,'Always'),-1.6],[CUE(3,'well-weighted')-.1,-1.2],[CUE(3,'well-weighted')+.5,-.1],[CUE(3,'beat them'),.25],[CUE(3,'far away')+.3,FLY-.05],[SECS(3),IN_NET+.3]]),linear);
/** the lesson's high side view: square to the shot line from the infield side, so the lob reads in profile */
/** over Hagi's shoulder: what he sees when he looks up */
const POV:V3=(()=>{const h=hagiPlace(-1.6),x=h.x??0,z=h.z??0,d=norm2(KP0[0]-x,KP0[1]-z);return[x-d[0]*5.4+d[1]*1.1,3.1,z-d[1]*5.4-d[0]*1.1];})();
const MID:V3=[(B0[0]+G[0])/2,0,(B0[2]+G[2])/2],E4:V3=[MID[0]-LEFT[0]*46,11,MID[2]-LEFT[1]*46];
function cam4v(t:number):Cam{
 const tau=tau4(t);
 return plan(t,[
  [0,0,()=>({P:add3(E4,[U[0]*5,-3.5,U[1]*5]),T:hxz(tau,1.2),fov:24})],
  [CUE(3,'The secret')-.1,1.2,()=>({P:POV,T:[KP0[0]-4,-.6,KP0[1]-4],fov:36})],
  [CUE(3,'off the line')-.2,.9,()=>({P:POV,T:[-3.4,.9,-.7],fov:10})],
  [CUE(3,'well-weighted')-.2,1,()=>({P:E4,T:add3(MID,[0,4.2,0]),fov:40})],
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
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tW=CUE(3,'Romania won'),tA=CUE(3,'Always'),tO=CUE(3,'off the line'),tL=CUE(3,'well-weighted'),tB=CUE(3,'beat them'),tF=CUE(3,'far away');
  const look=sm(tA-.2,tA+.3,t)*(1-sm(tL+.1,tL+.5,t));
  stadium(s,c,t,{roar:.4*(1-sm(tA,tA+1,t)),flash:.8*(1-sm(tW+1.2,tW+2,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  const kp=keeperAt(Math.min(tp,.1),tt).place,kx=kp.x??0,kz=kp.z??0;
  // "off the line": the empty space behind Córdoba (red halftone) and a yellow gap bracket from his line to his feet
  const off=sm(tO-.2,tO+.4,t,easeOut)*(1-sm(tF+.4,tF+1,t));
  if(off>.02){const zone=polyP(c,[[0,0,-3.66],[0,0,3.66],[lerp(0,kx+.5,off),0,kz+2.2],[lerp(0,kx+.5,off),0,kz-2.2]]);if(zone.length>2){const zp=polyPath(zone,true);s.tone(R,zp,.4*off);s.stroke(R,zp,2,.6*off);}
   const a:V3=[-.15,0,kz-.2],b:V3=[lerp(-.15,kx+.45,off),0,kz-.2];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(7,kAt(c,a)*.28),Y,.95);arrow3(s,c,[b,mix3(a,b,.5),a],Math.max(7,kAt(c,a)*.28),Y,.95*sm(tO+.2,tO+.5,t));}
  // "well-weighted lob": the whole arc, drawn as the ball flies it (yellow, knocked out of the grass)
  const arc=sm(tL-.3,tL+.5,t);
  if(arc>.02){const pts=partial(pathPts(c,0,FLY,40),clamp(Math.max(arc*.35,uAt(Math.max(0,tau)))));const w=Math.max(20,kAt(c,[-14,2,-10])*.24);
   if(pts.length>2){const rb=ribbon(pts,w,{taper:.4,pressure:.2,wobble:0});s.knockout(ribbon(pts,w*1.7,{taper:.4,pressure:.2,wobble:0}),.6*arc);s.fill(Y,rb,.95*arc);s.stroke(K,rb,2.2,.8*arc);}}
  // "from far away": ticks every 5 m along the grass from the strike to the goal
  const far=sm(tF-.2,tF+.8,t);
  if(far>.02){const tk=new Path2D(),n=Math.floor(DXZ/5);for(let i=1;i<=n;i++){if(i/n>far)break;const P:V3=[B0[0]+U[0]*i*5,0,B0[2]+U[1]*i*5];seg3(c,[P[0]-U[1]*.8,0,P[2]+U[0]*.8],[P[0]+U[1]*.8,0,P[2]-U[0]*.8],.35,tk);}
   s.knockout(tk);s.fill(K,tk,.9);}
  play(s,c,tau,tp,tpp,{it:tt,look,smear:true,minBall:14});
  // "Always look up": a dashed yellow eye-line from Hagi's eyes to Córdoba
  if(look>.02){const sk=solve(hagiPose(tp,look,tt),H_BUILD,hagiPlace(tp)),h=pr(c,sk.face),kk=pr(c,[kx,1.6,kz]);
   if(h&&kk){const e:Pt=[lerp(h[0],kk[0],look),lerp(h[1],kk[1],look)],gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.62)/9.2,(i+.95)/9.2]);const w=Math.max(15,kAt(c,B0)*.05);
    s.knockout(ribbon([h,e],w*1.7,{seed:13,taper:.3,wobble:.6,gaps}),.9*look);s.fill(Y,ribbon([h,e],w,{seed:13,taper:.3,wobble:.6,gaps}),.95*look);s.stroke(K,ribbon([h,e],w,{seed:13,taper:.3,wobble:.6,gaps}),1.6,.6*look);
    if(look>.9)sparkBurst(s,Y,kk[0],kk[1]-10,Math.max(95,kAt(c,[kx,1.6,kz])*1.1),{n:8,seed:21,width:12});}}
  // "Romania won three-one!": a blue-yellow-red (tricolour) burst over the stands
  const won=sm(tW-.05,tW+.5,t)*(1-sm(tA-.3,tA+.2,t));
  if(won>.02){const q:Pt|null=[0,-230];if(q){sparkBurst(s,B,q[0]-160,q[1],140+120*won,{n:9,seed:3,g:easeOutBack(won),width:14});sparkBurst(s,Y,q[0],q[1]-40,150+140*won,{n:11,seed:9,g:easeOutBack(won),width:15});sparkBurst(s,R,q[0]+160,q[1],140+120*won,{n:9,seed:5,g:easeOutBack(won),width:14});
   confetti(s,[B,Y,R],[q[0]-420,q[1]-260+200*won,840,420],24,7,{size:26,cov:.95*won});}}
 },
 still:8,
};

const film:RisoStory={
 id:'hagi-lob-1994',format:'11v11',title:"Hagi's long-range lob",
 theme:'Always look up: if the keeper is off the line, a well-weighted lob can beat them from far away',
 ageNote:'Colombia 1–3 Romania, World Cup group match, Rose Bowl, Pasadena, 18 June 1994. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little lob — a yellow arc rises high and drops, with the ball on its tip. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.65)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=18;i++){const k=i/18*u,w=Math.pow(k,1.2);pts.push([x+230*k,y-330*4*w*(1-w)+40*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],34,{rot:age*3+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
