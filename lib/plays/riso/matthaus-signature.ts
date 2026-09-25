/** Lothar Matthäus — "Signature: the box-to-box power shot". West Germany 4–1 Yugoslavia, 1990 World Cup, Group D, San Siro (Stadio Giuseppe
 * Meazza), Milan, Sunday 10 June 1990, 21:00 local — his SECOND goal (64'/65', 3–1): a solo run of about fifty metres from
 * deep in his own half, finished with a hard drive. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print.
 *
 * WHY THIS MOMENT: his iconicPlays entry is kind "signature" ("the box-to-box power shot", template long_range_goal, centre, long, right
 * foot; lesson "Help defend and attack: box-to-box players cover the whole pitch"). This goal is that signature in one play: the captain
 * takes the ball in his own half, carries it the length of the opponents' half himself and scores with a long-range drive — at a World Cup,
 * and it is the goal both the German and English written sources single out.
 *
 * SOURCES (read Sept 2026 with curl; cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "1990 FIFA World Cup Group D" (raw wikitext: football box, kit templates, line-ups, citing the FIFA match report)
 *    https://en.wikipedia.org/wiki/1990_FIFA_World_Cup_Group_D
 *  - de.wikipedia, "Fußball-Weltmeisterschaft 1990/Gruppe D" (football box, times, goal minutes, kits)
 *  - de.wikipedia, "Lothar Matthäus" (1990 section: "zwei Treffer … einen nach einem Sololauf über 50 Meter")
 *  - en.wikipedia, "Lothar Matthäus" (height 1.74 m, captain, the 1990 World Cup section citing the LA Times)
 *  - Associated Press in the Los Angeles Times, "World Cup '90: Matthaus Lifts West Germany Past Yugoslavia" (11 June 1990)
 *    https://www.latimes.com/archives/la-xpm-1990-06-11-sp-211-story.html
 *  - FIFA.com archived match page (web.archive.org, 2017; score and venue only)
 * CONFIRMED by those accounts: West Germany 4–1 Yugoslavia, the opening Group D match, Sunday 10 June 1990, 21:00, San Siro (Giuseppe Meazza),
 * Milan, 74,765, referee Peter Mikkelsen (Denmark); Matthäus 28' and 64' (LA Times / de.wiki: 65'), Klinsmann 39', Jozić 55', Völler 70'
 * (71'), so this goal made it 3–1; Matthäus was captain, number 10, a midfielder; he "scored twice — on hard drives with each foot" (AP);
 * one of his two goals came "after a solo run over 50 metres" (de.wiki) — the first came "off a pass from Stefan Reuter just outside the
 * edge of the Yugoslav penalty area" (AP), so the solo run is the second; keeper Tomislav Ivković, number 1; West Germany in WHITE shirts
 * (the 1990 black-red-gold chest band), BLACK shorts, WHITE socks; Yugoslavia in BLUE shirts, WHITE shorts, RED socks (kit templates);
 * the line-ups at 64': Illgner 1, Augenthaler 5, Berthold 14, Buchwald 6, Reuter 2, Häßler 8, Matthäus 10, Bein 15, Brehme 3, Völler 9,
 * Klinsmann 18 v Ivković 1, Jozić 6, Vulić 4, Spasić 3, Hadžibegić 5, Baljić 18, Katanec 13, Stojković 10, Vujović 11 and the 55' subs
 * Prosinečki 15 and Brnović 7.
 * INFERRED (illustrative): which foot struck THIS goal (AP only says one goal with each foot; the iconic entry and the common telling give the
 * right foot — drawn right, never narrated); how he came by the ball (drawn: a short lay-off from an unnumbered team-mate ≈ 22 m inside his
 * own half); every exact position — the line of the run (≈ 50 m, diagonal from right of centre toward the D), the strike spot (≈ 24.5 m out,
 * 3 m left of centre) and the target (low-to-mid, the keeper's left, ≈ .85 m high); his touches (big pushes every two strides); every other
 * player's position, run and chase; the flight (≈ .9 s, peak ≈ 1.3 m); Ivković's kit colours (drawn yellow) and his dive; his celebration
 * toward the near touchline; which touchline the TV camera sat on; the armband colour (drawn navy on the left arm); hair colours; the exact
 * shape of the chest band; the stadium dressing (three tiers, spiral-ramp towers, red roof girders, floodlights at dusk). The narration names
 * only what the sources confirm: Milan, 1990, the World Cup, captain, deep in his own half, fifty metres, a hard drive, three–one.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the lit bowl → Matthäus takes the ball deep in
 * his own half → the long carry, panning with him → the drive → pan to the net → he runs off); ch2 = the slow-motion replay, a low tracking
 * angle beside the run (big strides, head up, the ball pushed out in front, a chaser left behind) → bang; ch3 = a second replay from behind
 * the goal: Ivković stretches, the ball is past him; ch4 = the lesson: the whole pitch from high in the main stand — both boxes ringed
 * (defend / attack), a box-to-box arrow, then his run replayed along a red arrow, the shot in yellow and a ring on the net.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), inside the central ~1000 units so it frames
 * from the 1.45:1 card window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes,
 * FK skeleton, full range of motion, `prev` secondary motion, motion smear on the strides and the strike); small figures in the wide shots and
 * every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward the Yugoslav goal, y up, +z = the
 * attacker's right), exactly athlete.ts's convention, so the RIGHT foot strikes without a mirror. Inks: yellow, red, blue, navy. Everything is
 * keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded.
 * Budget: ~150–300 plate ops per frame, passages up to ~600 (as the approved Lahm film). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,celebrate,backpedal,posed,blendPose,touchPhase,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (withTiming matches each cue's FIRST
 * word in order); their `at` and each chapter's `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists.
 * Once the lead has generated public/plays/narration/matthaus-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/matthaus-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:"Milan, 1990, the World Cup! West Germany's captain, Lothar Matthäus, picks up the ball deep in his own half. He runs... and runs... fifty metres! Then a hard drive... Goal!",tail:2.6,
  cues:['Milan','the World Cup',"West Germany's",'Lothar Matthäus','picks up','He runs','and runs','fifty metres','Then a hard','Goal']},
 {label:'Watch it again',text:'Watch it again, from low down. Big strides, head up, the ball pushed out in front. Nobody stops him. Then bang!',tail:2.2,
  cues:['Watch it again','from low','Big strides','head up','the ball pushed','Nobody','Then bang']},
 {label:'From behind the goal',text:"From behind the goal: the keeper stretches, but he can't stop it! Three-one!",tail:1.9,
  cues:['From behind','keeper stretches','but he','Three-one']},
 {label:'The secret',text:'The secret? Box-to-box players help defend and attack, covering the whole pitch. Start near your own goal, carry it forward, then shoot!',tail:2,
  cues:['The secret','Box-to-box','covering','Start near','carry it','then shoot']},
];
import timingJson from '../../../public/plays/narration/matthaus-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('matthaus: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('matthaus: no cue '+w);return c.at;};
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
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Yugoslavia defends is x = 0 (West Germany attack +x), their goal centre z = 0, +z = the attacker's right; West
 * Germany's own goal line is x = −105. The TV camera sits on the z < 0 touchline. */
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
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- San Siro at dusk, 1990: three steep tiers, spiral-ramp towers, red roof girders, floodlights
/** stand planes (a along, b up the rake 0..1): 0 the far side (z > 0), 1 behind the Yugoslav goal, 2 the near side (the camera's, z < 0),
 * 3 behind the German goal. Close to the pitch, three tiers (two walkways), the new 1990 third tier on top. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-117,12,a),1.2+34*b,40+27*b],
 (a,b)=>[8+25*b,1.2+32*b,lerp(-58,58,a)],
 (a,b)=>[lerp(12,-117,a),1.2+34*b,-40-27*b],
 (a,b)=>[-113-25*b,1.2+32*b,lerp(58,-58,a)],
];
const CORNER_OF:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
for(const[i,ai,j,aj] of CORNER_OF)STANDS.push((a,b)=>mix3(STANDS[i](ai,b),STANDS[j](aj,b),a));
const STAND_COLS=[96,60,96,60,14,14,14,14],STAND_ROWS=15,WALKS=[.33,.66];
const withCorners=(which:number[])=>[...which,...CORNER_OF.map((c,k)=>which.includes(c[0])||which.includes(c[2])?4+k:-1).filter(k=>k>=0)];
/** the roof over each stand: an overhang from the back of the top tier, carried on red lattice girders */
const roofIn=(i:number,a:number):V3=>{const t=STANDS[i](a,1),f=STANDS[i](a,.5);return[lerp(t[0],f[0],.85),t[1]+9,lerp(t[2],f[2],.85)];};
const roofOut=(i:number,a:number):V3=>{const t=STANDS[i](a,1);return[t[0],t[1]+9,t[2]];};
/** the four corner towers (the roof's supports; spiral ramps wind round them) */
const TOWERS:[number,number][]=[[22,74],[22,-74],[-127,74],[-127,-74]];
function stadium(s:Sheet,c:Cam,t:number,main:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),which=withCorners(main);
 // a June dusk at 21:00: deep blue sky
 const sky=polyPath([[-1e4,-1e4],[1e4,-1e4],[1e4,1e4],[-1e4,1e4]],true);s.tone(B,sky,.55);s.tone(K,sky,.3);
 // the towers behind the bowl: concrete drums with a spiral ramp
 const tw=new Path2D(),ramp=new Path2D();let anyT=false;
 for(const[x,z] of TOWERS){const q=toCam(c,[x,20,z]);if(q[2]<NEAR+5)continue;const g=scr(c,q);if(Math.abs(g[0])>v.hx+200)continue;anyT=true;
  const rr=5.5;const side:V3=[c.r[0]*rr,0,c.r[2]*rr];
  addPoly(tw,polyP(c,[add3([x,0,z],side),add3([x,50,z],side),add3([x,50,z],[-side[0],0,-side[2]]),add3([x,0,z],[-side[0],0,-side[2]])]));
  for(let k=0;k<9;k++){const y0=k*5.5;seg3(c,add3([x,y0,z],[-side[0],0,-side[2]]),add3([x,y0+4,z],side),.9,ramp);}}
 if(anyT){s.tone(K,tw,.55);s.tone(B,tw,.25);s.fill(K,ramp,.8);}
 const planes=new Path2D(),walk=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const w of WALKS)seg3(c,S(0,w),S(1,w),.8,walk);}
 s.tone(K,planes,.22);s.tone(R,planes,.14);s.knockout(walk,.35);s.fill(Y,walk,.3);
 // the crowd: seeded dots — German white, black, red and gold, a Yugoslav blue patch behind their goal — sized by distance; roar lifts them
 const dots=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],any=[0,0,0,0,0];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],3,14),lift=roar>0?roar*z*1.2*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const yug=si===1&&a>.25&&a<.6;const ink=yug?(h<.75?4:0):h<.55?0:h<.72?1:h<.86?2:3;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}}
 if(any[0])s.knockout(dots[0],.75);if(any[1])s.fill(R,dots[1],.9);if(any[2])s.fill(Y,dots[2],.95);if(any[3])s.fill(K,dots[3],.9);if(any[4])s.fill(B,dots[4],.95);
 // the roof: a dark underside, the red girders along the lip and across, floodlights on the lip
 const rf=new Path2D(),gir=new Path2D(),lamps=new Path2D();let nl=0;
 for(const i of which){const n=i<4?10:2;for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n;addPoly(rf,polyP(c,[roofOut(i,a0),roofOut(i,a1),roofIn(i,a1),roofIn(i,a0)]));
   seg3(c,roofOut(i,a0),roofIn(i,a0),.9,gir);seg3(c,roofOut(i,a0),roofIn(i,a1),.4,gir);
   if(i<4){const L=mix3(roofIn(i,a0),roofIn(i,a1),.5);const q=toCam(c,add3(L,[0,-.8,0]));if(q[2]>NEAR+2){const g=scr(c,q),r=clamp(c.F*1.1/q[2],2.5,16);if(Math.abs(g[0])<v.hx&&Math.abs(g[1])<v.hy){lamps.rect(g[0]-r,g[1]-r*.45,r*2,r*.9);nl++;}}}}
  seg3(c,roofIn(i,0),roofIn(i,1),1.6,gir);seg3(c,roofOut(i,0),roofOut(i,1),1.2,gir);}
 s.tone(K,rf,.7);s.fill(R,gir,.9);
 if(nl){s.knockout(lamps);s.fill(Y,lamps,.55);}
 if(flash>0){const p=new Path2D();let n=0;for(let i=0;i<Math.round(22*flash);i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q||Math.abs(q[0])>v.hx||Math.abs(q[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));n++;}if(n){s.knockout(p);s.fill(Y,p,.95);}}
}
// ---------------------------------------------------------------- grass, lines, boards, both goals
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-119,0,-46],[14,0,-46],[14,0,46],[-119,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.85);s.tone(K,gp,.08);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards along both touchlines and behind the goals: white with red and blue panels
 const bd=new Path2D(),pn=new Path2D(),pb=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6.5,0,-36],[6.5,0,36]);board([-111.5,0,-36],[-111.5,0,36]);board([-110,0,-38],[6.5,0,-38]);board([-110,0,38],[6.5,0,38]);
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%2?pn:pb,polyP(c,[[6.45,.25,z],[6.45,.25,z+3.4],[6.45,.68,z+3.4],[6.45,.68,z]]));}
 for(const zz of[-37.95,37.95])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(k%2?pn:pb,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.tone(K,bd,.14);s.fill(R,pn,.85);s.fill(B,pb,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);L([-105,0,-34+k*17],[-105,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);seg3(c,[-52.6,0,0],[-52.4,0,0],.25,ln);
 for(const[X,sg] of [[0,-1],[-105,1]] as [number,number][]){
  L([X,0,-20.16],[X+sg*16.5,0,-20.16]);L([X+sg*16.5,0,-20.16],[X+sg*16.5,0,20.16]);L([X+sg*16.5,0,20.16],[X,0,20.16]);
  L([X,0,-9.16],[X+sg*5.5,0,-9.16]);L([X+sg*5.5,0,-9.16],[X+sg*5.5,0,9.16]);L([X+sg*5.5,0,9.16],[X,0,9.16]);
  const a=Math.acos(5.5/9.15);if(sg<0)circ(X-11,0,9.15,Math.PI-a,Math.PI+a,12);else circ(X+11,0,9.15,-a,a,12);
  seg3(c,[X+sg*11-.1,0,0],[X+sg*11+.1,0,0],.22,ln);}
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const X of[0,-105])for(const z of[-34,34]){seg3(c,[X,0,z],[X,1.55,z],.05,pole);addPoly(flag,polyP(c,[[X,1.55,z],[X,1.2,z],[X+(X<0?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,1,o.bulge??0);goal3(s,c,-105,-1,0);
}
/** a goal at X (dir = which way the net runs): posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out
 * low toward the attacker's right (z ≈ +2.6), where the drive went in */
function goal3(s:Sheet,c:Cam,X:number,dir:number,bulge:number){
 const z0=-3.66,z1=3.66,H=2.44,bz=2.6,back=(z:number,y=1)=>X+dir*(2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.5,2))*(1-.35*y));
 const zs=[z0,-1.8,0,1.4,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 if(kAt(c,[X,1,0])>6){const mesh=new Path2D();
  for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z,0),0,z],.022,mesh,.7);}
  for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y/1.9),y,zs[i]],[back(zs[i+1],y/1.9),y,zs[i+1]],.022,mesh,.7);}
  s.fill(K,mesh,.7);}
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the shot on one clock τ (seconds; τ = 0 is the strike)
/** the strike spot: ≈ 24.5 m out, just left of centre (inferred: "a hard drive" after a 50 m run) */
const B1:V3=[-24.5,.11,-3];
/** the target: low-to-mid, inside the keeper's LEFT post (the attacker's right) */
const TGT:V3=[0,.85,2.55];
const CHX=TGT[0]-B1[0],CHZ=TGT[2]-B1[2],DG=Math.hypot(CHX,CHZ);
const CR:[number,number]=[-CHZ/DG,CHX/DG];
/** a driven ball: barely any bend (metres right of the chord) */
const BOW=.9;
const off=(u:number)=>BOW*u*(1-u);
/** height: a parabola through the target, peaking ≈ 1.3 m */
const [HA,HB]=(()=>{const y1=TGT[1]-.11,pk=1.2;const a=2*pk+Math.sqrt(4*pk*pk-4*pk*y1);return[a,a-y1];})();
const hAt=(u:number)=>.11+HA*u-HB*u*u;
const flightU=(u:number):V3=>{const o=off(u);return[B1[0]+CHX*u+CR[0]*o,hAt(u),B1[2]+CHZ*u+CR[1]*o];};
const H0:[number,number]=[CHX/DG,CHZ/DG];
const R0:[number,number]=[-H0[1],H0[0]];
const FLY=.9;// ≈ 25 m, a hard drive
const uAt=(tau:number)=>{const u=clamp(tau/FLY);return u*(1.15-.15*u);};
const tauAtU=(u:number)=>{const k=clamp(u);return FLY*(1.15-Math.sqrt(1.3225-.6*k))/.3;};
const GOAL_PT=flightU(1),NET_HIT:V3=[1.55,.7,2.75],REST:V3=[1.1,.11,2.3],IN_NET=FLY+.12;

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
/** West Germany 1990 home: white shirts (the black-red-gold chest band is drawn by the adapter), black shorts, white socks */
const germany=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:[K,.8],line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Yugoslavia 1990 home: blue shirts, white shorts, red socks */
const yugoslavia=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:'paper',socks:[R,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const LM_B={height:1.74,bulk:1.02,thighs:1.1};
const LM_ST=germany({number:10,hair:[K,.85],build:LM_B,seed:10});
const KEEPER_ST:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[Y,.9],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.85,bulk:1},seed:61};
const ILLGNER_ST:AthleteStyle={shirt:[R,.55],shorts:K,socks:[R,.5],boots:K,skin:SKIN_L,hair:[K,.7],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.9},seed:62};
const CHASER_ST=yugoslavia({number:13,build:{height:1.84},seed:13});

// ---------------------------------------------------------------- Matthäus: takes the lay-off deep in his own half, carries it ≈ 50 m, drives it in
/** approach to the strike from the LEFT of the ball (≈ 14° off the shot line) — a right-footer's run-up */
const APP=14*Math.PI/180;
const DIR:[number,number]=[H0[0]*Math.cos(APP)+R0[0]*Math.sin(APP),H0[1]*Math.cos(APP)+R0[1]*Math.sin(APP)];
const RIGHT:[number,number]=[-DIR[1],DIR[0]];
const YAW_K=yawTo(0,0,DIR[0],DIR[1]);
/** the carry: diagonally in from right of centre (the drawn line; inferred) */
const D1:[number,number]=[Math.cos(-8*Math.PI/180),Math.sin(-8*Math.PI/180)];
const along=(p:[number,number],d:[number,number],k:number):[number,number]=>[p[0]+d[0]*k,p[1]+d[1]*k];
/** where his pelvis stands at contact so the laces of his RIGHT boot meet the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT),LM_B,{x:0,z:0,yaw:YAW_K}),toe:[number,number]=[B1[0]-DIR[0]*.12+RIGHT[0]*.04,B1[2]-DIR[1]*.12+RIGHT[1]*.04];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const T_PASS=-9.0,T_RCV=-7.9,T_RUN0=1.3,SPEED=6.4;
/** his touches: big pushes every two strides; then the strike at 0 */
const TOUCHES=[T_RCV,-6.6,-5.3,-4.0,-2.7,-1.45];
const CP:[number,number]=along(PC,DIR,-3.5);
/** distance still to run to the strike spot at τ (≈ 6.4 m/s from the first touch; a jog before it) */
const distAt=(tau:number)=>tau>=T_RCV?SPEED*tau:SPEED*T_RCV+3.4*(tau-T_RCV);
const pathAt=(d:number):[number,number]=>d>=-3.5?along(PC,DIR,d):along(CP,D1,d+3.5);
/** the pelvis track (τ, x, z): a cubic Hermite through keys on the drawn line (the join into the run-up rounds off) */
const TRACK:[number,number,number][]=[...[-10.4,T_PASS,T_RCV,-6.6,-5.3,-4.0,-2.7,-1.45].map(t=>[t,...pathAt(distAt(t))] as [number,number,number]),[-.52,...along(PC,DIR,-1.9)],[0,...PC],[.7,...along(PC,DIR,.9)]] as [number,number,number][];
function hermite(T:[number,number,number][],t:number):[number,number]{
 if(t<=T[0][0])return[T[0][1],T[0][2]];const n=T.length;if(t>=T[n-1][0])return[T[n-1][1],T[n-1][2]];
 let i=0;while(t>T[i+1][0])i++;const a=T[i],b=T[i+1],h=b[0]-a[0],u=(t-a[0])/h;
 const tan=(k:number,j:1|2)=>{const p=T[Math.max(0,k-1)],q=T[Math.min(n-1,k+1)];return(q[j]-p[j])/(q[0]-p[0]);};
 const h00=2*u*u*u-3*u*u+1,h10=u*u*u-2*u*u+u,h01=-2*u*u*u+3*u*u,h11=u*u*u-u*u;
 return[h00*a[1]+h10*h*tan(i,1)+h01*b[1]+h11*h*tan(i+1,1),h00*a[2]+h10*h*tan(i,2)+h01*b[2]+h11*h*tan(i+1,2)];
}
/** the run off afterwards: toward the near touchline, arms out (inferred) */
const P_AFTER=along(PC,DIR,.9),CORNER:[number,number]=[-14,-30];
const CL=Math.hypot(CORNER[0]-P_AFTER[0],CORNER[1]-P_AFTER[1]);
function celebS(tau:number){const u=tau-T_RUN0;if(u<=0)return 0;const s=u<.6?7*u*u/1.2:7*(u-.3),a=CL-3.2;return s<a?s:a+3.2*(1-Math.exp(-(s-a)/3.2));}
function celebPos(tau:number):[number,number]{const s=celebS(tau)/CL;return[lerp(P_AFTER[0],CORNER[0],s),lerp(P_AFTER[1],CORNER[1],s)];}
const CELEB_YAW=yawTo(P_AFTER[0],P_AFTER[1],CORNER[0],CORNER[1]);
const lmXZ=(tau:number):[number,number]=>tau<T_RUN0-.35?hermite(TRACK,tau):celebPos(tau);
const lmVel=(tau:number):[number,number]=>{const a=hermite(TRACK,tau-.05),b=hermite(TRACK,tau+.05);return[(b[0]-a[0])*10,(b[1]-a[1])*10];};
/** the ball at each touch: just ahead of his right boot along his run */
const footAt=(tau:number):[number,number]=>{const p=hermite(TRACK,tau),v=lmVel(tau),l=Math.hypot(v[0],v[1])||1,f:[number,number]=[v[0]/l,v[1]/l];return[p[0]+f[0]*.55-f[1]*.12,p[1]+f[1]*.55+f[0]*.12];};
const TP=TOUCHES.map(footAt);
/** the lay-off: an (unnumbered) team-mate, infield and a little behind */
const PASSER:[number,number]=[TP[0][0]-6,TP[0][1]+9];
function ballAt(tau:number):V3{
 if(tau<T_PASS)return[PASSER[0]+.5,.11,PASSER[1]-.3];
 if(tau<T_RCV){const u=(tau-T_PASS)/(T_RCV-T_PASS),e=1-Math.pow(1-u,1.7),a:[number,number]=[PASSER[0]+.5,PASSER[1]-.3];return[lerp(a[0],TP[0][0],e),.11,lerp(a[1],TP[0][1],e)];}
 const last=TOUCHES.length-1;
 if(tau<TOUCHES[last]){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<=0){const u=(tau-TOUCHES[last])/-TOUCHES[last],e=1-Math.pow(1-u,1.8);return[lerp(TP[last][0],B1[0],e),.11,lerp(TP[last][1],B1[2],e)];}
 if(tau<FLY)return flightU(uAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.45),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.1*Math.abs(Math.sin((tau-IN_NET-.45)*9))*Math.exp(-(tau-IN_NET-.45)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?TAU*2.2*(tau-T_PASS):TAU*10*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));
/** his stride phase: two full strides between touches, the right foot meeting the ball (touchPhase) exactly at each touch */
function lmPhase(tau:number){
 if(tau<T_RCV)return touchPhase+(tau-T_RCV)*1.4;
 const last=TOUCHES.length-1;let k=0;while(k<last&&tau>=TOUCHES[k+1])k++;
 if(k>=last)return touchPhase+2*last+(tau-TOUCHES[last])*1.54;
 return touchPhase+2*(k+(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]));
}
const RUN_END=-STRIKE_CONTACT;
function lmPose(tau:number,it=0):Pose{
 const v=lmVel(tau),sp=Math.hypot(v[0],v[1]),ph=lmPhase(tau);
 let p=runCycle(ph,{speed:clamp((sp-2.5)/4.5,.25,.9)});
 // a push at every touch: the right boot reaches the ball, head dips to it; between touches, head up
 let near=99;for(const T of TOUCHES)if(Math.abs(tau-T)<Math.abs(near))near=tau-T;
 if(tau>T_RCV-.3)p=blendPose(p,dribble(ph,{foot:'r',speed:.9}),.85*Math.exp(-Math.pow(near/.2,2)));
 // before the lay-off arrives: looking at the passer
 if(tau<T_RCV)p.neckY+=(35*(1-sm(T_RCV-.9,T_RCV-.2,tau)))*Math.PI/180;
 if(tau>RUN_END-.12){const us=STRIKE_CONTACT+tau;p=blendPose(p,strike(Math.min(1,us),{power:1}),sm(RUN_END-.12,RUN_END+.04,tau));
  const lo=sm(RUN_END,-.05,tau)*(1-sm(.12,.5,tau));p.lean+=.12*lo;p.neckP+=.12*lo;}
 if(tau>T_RUN0-.35){const s=celebS(tau);p=blendPose(p,celebrate(s/4.3,{kind:'run'}),sm(T_RUN0-.35,T_RUN0+.25,tau));}
 p.neckP+=.03*Math.sin(it*2.2)*(tau<T_PASS?1:0);
 return p;
}
function lmPlace(tau:number):Place{
 const[x,z]=lmXZ(tau);
 if(tau>=T_RUN0-.35)return{x,z,yaw:lerpAng(YAW_K,CELEB_YAW,sm(T_RUN0-.35,T_RUN0+.3,tau))};
 const v=lmVel(tau),sp=Math.hypot(v[0],v[1]);
 let yaw=sp>.5?Math.atan2(-v[1],v[0]):YAW_K;
 if(tau<T_RCV)yaw=lerpAng(yaw,yawTo(x,z,PASSER[0],PASSER[1]),.3*(1-sm(T_RCV-.8,T_RCV-.1,tau)));
 if(tau>RUN_END-.25)yaw=lerpAng(yaw,YAW_K,sm(RUN_END-.25,RUN_END,tau));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- the chaser: a Yugoslav midfielder who turns and chases from behind, and loses ground
function chaserAt(tau:number,it:number):{pose:Pose;place:Place}{
 // he starts ≈ 4 m goal-side and to the right of the lay-off, turns as Matthäus goes by, then chases at ≈ 5.8 m/s (falls further behind)
 const at=(t:number):[number,number]=>{const st:[number,number]=[TP[0][0]+4,TP[0][1]+4.5];if(t<T_RCV+.35)return[st[0]+(t-T_RCV)*.6,st[1]];
  const lag=.8+(t-T_RCV-.35)*(SPEED-5.8),l=pathAt(Math.min(distAt(t)-lag,-3.6)),w=sm(T_RCV+.35,T_RCV+1.8,t);return[lerp(st[0],l[0]-D1[1]*2.3,w),lerp(st[1],l[1]+D1[0]*2.3,w)];};
 const tt=Math.min(tau,.9),[x,z]=at(tt),a=at(tt-.05),b=at(tt+.05),sp=Math.hypot(b[0]-a[0],b[1]-a[1])*10;
 let p=blendPose(stand(),runCycle(tt*1.5+.3,{speed:clamp((sp-1)/5.5)}),clamp(sp/2.2));
 if(tau<T_RCV+.3)p=blendPose(p,backpedal(tau*2.2),.6);
 if(tau>.9)p=blendPose(p,posed({lHipF:26,rHipF:20,lKnee:30,rKnee:26,lean:30,pitch:6,neckP:24,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24}),sm(.9,1.6,tau));
 const l=lmXZ(tau),yaw=sp>1.2?Math.atan2(-(b[1]-a[1]),b[0]-a[0]):yawTo(x,z,l[0],l[1]);
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- everyone else
type Role='keeper'|'gk2'|'def'|'mid'|'att'|'passer';
/** from = where they are at the lay-off, to = where they are at the strike (defenders drop off, attackers run on) */
type Actor={role:Role;st:AthleteStyle;from:[number,number];to:[number,number];phase:number;chase?:[number,number,number]};
const ACTORS:Actor[]=[
 {role:'keeper',st:KEEPER_ST,from:[-2.5,.2],to:[-1,.3],phase:0},
 {role:'def',st:yugoslavia({number:6,build:{height:1.86},seed:31}),from:[-36,-1],to:[-17.5,-.5],phase:.4},
 {role:'def',st:yugoslavia({number:5,build:{height:1.83},seed:32}),from:[-38,8],to:[-18.5,6.5],phase:.9},
 {role:'def',st:yugoslavia({number:3,build:{height:1.84},seed:33}),from:[-40,-12],to:[-17.5,-8.5],phase:.5},
 {role:'def',st:yugoslavia({number:4,build:{height:1.8},seed:34}),from:[-42,17],to:[-23,15],phase:.2},
 {role:'def',st:yugoslavia({number:18,build:{height:1.76},seed:35}),from:[-46,-24],to:[-27,-25],phase:.7},
 {role:'mid',st:yugoslavia({number:10,build:{height:1.78},seed:36}),from:[-66,8],to:[-50,6],phase:.3},
 {role:'mid',st:yugoslavia({number:15,build:{height:1.78},hair:[K,.6],seed:37}),from:[-62,-18],to:[-47,-15],phase:.8},
 {role:'mid',st:yugoslavia({number:7,build:{height:1.76},seed:38}),from:[-60,20],to:[-44,16],phase:.1},
 {role:'mid',st:yugoslavia({number:11,build:{height:1.8},seed:39}),from:[-86,14],to:[-74,12],phase:.6},
 {role:'att',st:germany({number:9,build:{height:1.8},hairStyle:'curly',seed:41}),from:[-40,11],to:[-15,8.5],phase:.2,chase:[.25,-.6,1.2]},
 {role:'att',st:germany({number:18,build:{height:1.81},hair:[Y,.85],seed:42}),from:[-42,-15],to:[-15.5,-9],phase:.7,chase:[.45,-1.6,-1]},
 {role:'att',st:germany({number:15,build:{height:1.8},seed:43}),from:[-58,15],to:[-36,13],phase:.35,chase:[.7,-2.4,.8]},
 {role:'att',st:germany({number:8,build:{height:1.66},seed:44}),from:[-60,-24],to:[-40,-22],phase:.85},
 {role:'mid',st:germany({number:3,build:{height:1.76},hair:[Y,.7],seed:45}),from:[-66,-30],to:[-52,-29],phase:.6},
 {role:'mid',st:germany({number:2,build:{height:1.8},seed:46}),from:[-66,27],to:[-54,26],phase:.15},
 {role:'mid',st:germany({number:14,build:{height:1.85},seed:47}),from:[-86,17],to:[-72,15],phase:.45},
 {role:'mid',st:germany({number:5,build:{height:1.82},seed:48}),from:[-90,-6],to:[-78,-5],phase:.55},
 {role:'gk2',st:ILLGNER_ST,from:[-101,0],to:[-96,0],phase:.2},
 {role:'passer',st:germany({number:null,build:{height:1.85},seed:49}),from:[PASSER[0]-.3,PASSER[1]+.25],to:[PASSER[0]+5,PASSER[1]+1],phase:.1},
];
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const CD:[number,number]=[(CORNER[0]-P_AFTER[0])/CL,(CORNER[1]-P_AFTER[1])/CL];
function chaseEnd(a:Actor):[number,number]{const[,al,sd]=a.chase??[0,0,0];return[CORNER[0]+CD[0]*al-CD[1]*sd,CORNER[1]+CD[1]*al+CD[0]*sd];}
/** the drift every outfield player makes during the carry: from `from` at the lay-off to `to` at the strike */
function driftAt(a:Actor,tau:number):[number,number]{const u=sm(T_RCV,0,tau,linear);return[lerp(a.from[0],a.to[0],u),lerp(a.from[1],a.to[1],u)];}
function chaseS(a:Actor,tau:number,start:[number,number]){const E=chaseEnd(a),L=Math.hypot(E[0]-start[0],E[1]-start[1]),u=tau-1.4-(a.chase?.[0]??0);if(u<=0)return 0;const s=u<.6?6.8*u*u/1.2:6.8*(u-.3),b=Math.max(0,L-3);return s<b?s:b+(L-b)*(1-Math.exp(-(s-b)/Math.max(.1,L-b)));}
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const bp=ballAt(Math.max(-10,Math.min(tau,FLY))),br=Math.sin(it*2.1+a.phase*TAU),[x,z]=driftAt(a,Math.min(tau,.4)),toBall=yawTo(x,z,bp[0],bp[2]);
 const dl=Math.hypot(a.to[0]-a.from[0],a.to[1]-a.from[1])/-T_RCV,moving=tau>T_RCV&&tau<.4&&dl>.5;
 if(a.chase&&tau>1.3){const w=sm(1.3,1.8,tau),st:[number,number]=[x,z],q=(tt:number):[number,number]=>{const E=chaseEnd(a),L=Math.hypot(E[0]-st[0],E[1]-st[1])||1,u=chaseS(a,tt,st)/L;return[lerp(st[0],E[0],u),lerp(st[1],E[1],u)];};
  const p0=q(tau),p1=q(tau+.06),sp=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])/.06,dist=chaseS(a,tau,st);
  let pose=blendPose(runCycle(dist/4.4+a.phase,{speed:clamp(sp/7)}),celebrate(it*.9+a.phase,{kind:'arms'}),clamp(1-sp/2.2));
  pose=blendPose(blendPose(DEF_P,stand(),.4),pose,w);
  return{pose,place:{x:p0[0],z:p0[1],yaw:sp>1.2?yawTo(p0[0],p0[1],p1[0],p1[1]):yawTo(p0[0],p0[1],...lmXZ(tau))}};}
 switch(a.role){
  case 'keeper':{
   // set on his line, creeping as the runner comes, then the stretch to his LEFT (+z) toward the low drive: beaten
   let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.5,-.12,tau));
   const dv=clamp((tau-.1)/1.1);if(tau>.1)p=blendPose(p,keeperDive(dv,{side:'l',height:.35}),sm(.1,.18,tau));
   if(tau>2)p=blendPose(p,SLUMP,sm(2,2.7,tau)*.7);
   const[kx,kz]=driftAt(a,Math.min(tau,.1)),yaw=lerpAng(yawTo(kx,kz,bp[0],bp[2]),Math.PI,sm(.05,.3,tau));
   return{pose:p,place:{x:kx,z:kz,yaw}};}
  case 'gk2':{const p=blendPose(keeperSet(it*.8),stand(),.5);return{pose:p,place:{x,z,yaw:toBall}};}
  case 'passer':{
   // the lay-off: a side-foot pass into Matthäus, then a jog forward in support
   const k=clamp((tau-(T_PASS-.52))/1.2);let p=blendPose(blendPose(stand(),DEF_P,.3+.2*br),strike(k,{power:.35}),sm(T_PASS-.62,T_PASS-.45,tau)*(1-sm(T_PASS+.3,T_PASS+.7,tau)));
   if(tau>T_PASS+.5)p=blendPose(p,runCycle((tau-T_PASS)*1.4,{speed:.35}),sm(T_PASS+.5,T_PASS+.9,tau));
   const fwd=tau>T_PASS+.5?Math.min(6,(tau-T_PASS-.5)*2.4):0,yaw0=yawTo(a.from[0],a.from[1],TP[0][0],TP[0][1]);
   return{pose:p,place:{x:a.from[0]+fwd,z:a.from[1],yaw:lerpAng(yaw0,0,sm(T_PASS+.4,T_PASS+.9,tau))}};}
  case 'def':{
   // backing off as he comes: a low backpedal, facing the ball; slumping after
   let p=blendPose(DEF_P,stand(),.3+.2*br);if(moving)p=blendPose(p,backpedal(tau*2.2+a.phase),.75);
   if(tau>.3&&tau<1.1){const d=Math.hypot(x-flightU(.3)[0],z-flightU(.3)[2]);if(d<3)p=blendPose(p,posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lShA:40,rShA:40,lean:10,neckP:-20}),.6);}
   if(tau>1.3)p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.6);
   return{pose:p,place:{x,z,yaw:toBall}};}
  case 'mid':{
   let p=blendPose(DEF_P,stand(),.3+.2*br);if(moving)p=blendPose(p,runCycle(tau*1.45+a.phase,{speed:.45}),.85);
   if(tau>1.3&&a.st.shirt!=='paper')p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.5);
   return{pose:p,place:{x,z,yaw:moving?yawTo(a.from[0],a.from[1],a.to[0],a.to[1]):toBall}};}
  default:{
   // German attackers: running on ahead of the carry (they pull the defenders back)
   let p=blendPose(stand(),DEF_P,.4+.2*br);if(moving)p=blendPose(p,runCycle(tau*1.5+a.phase,{speed:.6}),.9);
   const toGoal=yawTo(x,z,0,0);
   return{pose:p,place:{x,z,yaw:moving?lerpAng(yawTo(a.from[0],a.from[1],a.to[0],a.to[1]),toBall,.3):lerpAng(toBall,toGoal,sm(0,.6,tau))}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?, extra?): athlete.ts figure; prev = the pose one drawn frame earlier
 * (secondary motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the strides, the strike, the dive).
 * extra (Germany's outfield white shirts, only when the figure is big enough to read it): the 1990 black-red-gold band across the chest
 * (front only), and for the captain the armband on the LEFT upper arm. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false,extra:{band?:boolean;captain?:boolean}={}){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const r=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(r.detail==='low'||r.heightPx<56)return r;
 const J=r.joints,sk=r.sk,w=Math.max(2.2,r.heightPx*.022);
 if(extra.band){const f:V3=[sk.face[0]-sk.head[0],sk.face[1]-sk.head[1],sk.face[2]-sk.head[2]],e:V3=[camera.eye[0]-sk.chest[0],camera.eye[1]-sk.chest[1],camera.eye[2]-sk.chest[2]];
  const front=dot3(f,e)/(Math.hypot(...f)*Math.hypot(...e)||1);
  if(front>.25){const a:Pt=[lerp(J.lSh[0],J.pelvis[0],.24),lerp(J.lSh[1],J.pelvis[1],.24)],b:Pt=[lerp(J.rSh[0],J.pelvis[0],.24),lerp(J.rSh[1],J.pelvis[1],.24)],
   dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);
   if(L>w*3){const nx=-dy/L,ny=dx/L,zig=(o:number):Pt[]=>{const pts:Pt[]=[];for(let i=0;i<=6;i++){const u=.1+.8*i/6,h=(i%2?1:-1)*w*.7;pts.push([a[0]+dx*u+nx*(o+h),a[1]+dy*u+ny*(o+h)]);}return pts;};
    const cov=clamp((front-.25)/.35);s.fill(K,ribbon(zig(-w*.9),w*.9,{taper:0,wobble:0}),.9*cov);s.fill(R,ribbon(zig(0),w*.9,{taper:0,wobble:0}),.95*cov);s.fill(Y,ribbon(zig(w*.9),w*.9,{taper:0,wobble:0}),.95*cov);}}}
 if(extra.captain){const sh=J.lSh,el=J.lEl,a:Pt=[lerp(sh[0],el[0],.35),lerp(sh[1],el[1],.35)],b:Pt=[lerp(sh[0],el[0],.62),lerp(sh[1],el[1],.62)];
  if(Math.hypot(b[0]-a[0],b[1]-a[1])>w*.5){const p=ribbon([a,b],w*2.6,{taper:0,wobble:0});s.fill(K,p,.85);}}
 return r;
}

// ---------------------------------------------------------------- the ball (1990: the Etrusco Unico, drawn as the riso panel ball)
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid'|'low'};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<3.5)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(e.hero==='low'||(!hero&&px<120))return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=lmPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=lmPose(tp,e.it),prev={pose:lmPose(tpp,e.it-1/12),place:lmPlace(tpp)};
  drawPlayer(s,pose,c,detailFor(LM_ST,d,true),pl,prev,!!e.smear&&(tp>T_RCV&&tp<.45||tp>T_RUN0+.2),{band:true,captain:true});}});}
 {const cur=chaserAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=chaserAt(tpp,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(CHASER_ST,d,false),cur.place,prev,false);}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpp,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='keeper'),cur.place,prev,!!e.smear&&a.role==='keeper'&&tp>.1&&tp<1.1,{band:a.st.shirt==='paper'});}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const lxz=(tau:number,y=0):V3=>{const p=lmXZ(tau);return[p[0],y,p[1]];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** the carry starts on "picks up"; the ball reaches the net just after "Goal"; real time throughout */
const tS1=()=>Math.max(CUE(0,'Goal')-IN_NET+.2,CUE(0,'picks up')-T_RCV+.1);
const T_WAIT=-10.4;
const tau1=(t:number)=>Math.max(T_WAIT,t-tS1());
/** the camera gantry, high on the near side, level with the halfway-to-box area */
const P1:V3=[-40,21,-64];
function cam1(t:number):Cam{
 const tau=tau1(t),hero=():V3=>{const b=ballAt(Math.min(tau,0)),l=lxz(tau);return add3(mix3(l,[b[0],0,b[2]],.4),[4,.9,0]);};
 return plan(t,[
  [0,0,()=>({P:P1,T:[-42,12,34],fov:50})],
  [CUE(0,'the World')-.2,1.6,()=>({P:P1,T:[-58,14,44],fov:40})],
  [CUE(0,"West")-.3,1.3,()=>({P:P1,T:hero(),fov:11})],
  [CUE(0,'picks up')-.2,1,()=>({P:P1,T:hero(),fov:8.5})],
  [CUE(0,'fifty')-.3,1.2,()=>({P:P1,T:hero(),fov:10})],
  [tS1()-.3,.8,()=>({P:P1,T:[-12,1,-.5],fov:17})],
  [tS1()+FLY-.2,.8,()=>({P:P1,T:[-2,1,1.5],fov:11})],
  [tS1()+T_RUN0+.4,1.4,()=>({P:P1,T:add3(lxz(tau),[0,1,1]),fov:11})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal'),tN=tS1()+IN_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(Math.max(g,tN),Math.max(g,tN)+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:15,lines:true,prevT:tau1(t-.06),hero:'mid'});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:11.4,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay: a low tracking angle beside the run → bang
const tau2=(t:number)=>key(t,mono([[0,-4.6],[CUE(1,'Big strides'),-3.5],[CUE(1,'the ball pushed'),-2.75],[CUE(1,'Nobody'),-1.6],[CUE(1,'Then bang')-.2,-.3],[CUE(1,'Then bang')+.25,.05],[SECS(1)-.9,IN_NET+.15],[SECS(1),IN_NET+.6]]),linear);
/** low on his left, a little ahead, tracking with him (the lens ≈ 1.3 m up): the ball and the stride in one frame; at the strike the
 * dolly stops and the lens pans after the drive */
const OFF2:V3=[5,1.5,-15];
function cam2(t:number):Cam{
 const tau=tau2(t),tl=Math.min(tau,-.1),l=lxz(tl),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:add3(l,OFF2),T:add3(mix3(l,[ballAt(tl)[0],0,ballAt(tl)[2]],.35),[1.2,.95,0]),fov:17})],
  [CUE(1,'Then bang')+.1,.9,()=>({P:add3(lxz(-.1),[3,2.6,-22]),T:mix3([-10,1,0],b,.5),fov:22})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the drive so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.6){const pts=pathPts(c,Math.max(0,tau-.5),Math.min(tau,FLY+.001),18),fade=1-sm(FLY+.1,IN_NET+.6,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13});
  // "Then bang!": a burst off the boot at contact
  const hit=sm(-.02,.3,tau);if(hit>0&&hit<1){const q=pr(c,B1);if(q)sparkBurst(s,Y,q[0],q[1],70+120*hit,{n:9,seed:17,g:easeOutBack(hit),width:10});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/Math.max(NEAR,q[2])*1.2),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · the reverse-angle replay from behind the goal: the keeper stretches, beaten
const tau3=(t:number)=>key(t,mono([[0,-1.2],[CUE(2,'From behind')+.6,-.05],[CUE(2,'keeper stretches'),.3],[CUE(2,'but he'),FLY-.12],[CUE(2,'Three-one'),IN_NET+.3],[SECS(2),IN_NET+1]]),linear);
/** low behind the goal, off the near post (below the bar): the drive comes at the lens past the keeper's stretch */
const E3:V3=[6.2,1.3,-5.6];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([-20,1.2,-2],b,.3*sm(0,.5,tau)),fov:30})],
  [CUE(2,'keeper stretches')-.3,.9,()=>({P:add3(E3,[-.6,0,.4]),T:[-3,.9,1.3],fov:24})],
  [CUE(2,'Three-one')-.35,.9,()=>({P:add3(E3,[-1,.1,.6]),T:[-.4,.8,1.9],fov:21})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tC=CUE(2,'Three-one');
  stadium(s,c,t,[2,3],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.5),Math.min(tau,FLY+.001),16),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // "Three-one!": a yellow burst where it went in
  const hit=sm(tC-.05,tC+.35,t);if(hit>0&&hit<1){const q=pr(c,[0,.85,2.55]);if(q)sparkBurst(s,Y,q[0],q[1],90+150*hit,{n:10,seed:23,g:easeOutBack(hit),width:12});}
 },
 aperture(t){const c=cam3v(t),P=ballAt(Math.min(tau3(t),IN_NET)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*.11/Math.max(NEAR,q[2])*1.3),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 4 · the lesson: box to box — defend at one end, attack at the other, carry it the whole way, shoot
const tau4=(t:number)=>key(t,mono([[0,T_WAIT],[CUE(3,'Start near')-.2,T_PASS+.2],[CUE(3,'Start near')+.6,T_RCV+.2],[CUE(3,'then shoot')-.25,-.35],[CUE(3,'then shoot')+.5,FLY],[SECS(3),IN_NET+.6]]),linear);
/** the whole pitch from high in the main stand (never top-down), then a push toward the Yugoslav box for the shot */
const E4:V3=[-52.5,46,-104];
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E4,T:[-52.5,0,-2],fov:37})],
  [CUE(3,'then shoot')-.5,1.2,()=>({P:[-40,26,-62],T:[-14,0,0],fov:30})],
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
/** a flat ring on the grass (or upright in the goal mouth) */
function ring3(s:Sheet,c:Cam,ctr:V3,r:number,upright:boolean,grow:number,ink:string,seed:number,rz=r){
 const pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,upright?[ctr[0],ctr[1]+Math.sin(a)*r*grow,ctr[2]+Math.cos(a)*r*grow]:[ctr[0]+Math.cos(a)*r*grow,ctr[1],ctr[2]+Math.sin(a)*rz*grow]);if(p)pts.push(p);}
 if(pts.length>20){const rr=ribbon(pts,Math.max(6,kAt(c,ctr)*.5),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9);s.fill(ink,rr,.95);}
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tB=CUE(3,'Box-to-box'),tW=CUE(3,'covering'),tS=CUE(3,'Start near'),tC=CUE(3,'carry it'),tF=CUE(3,'then shoot');
  stadium(s,c,t,[0,1,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · "Box-to-box … help defend and attack": a red ring on his own box (defend), a yellow ring on theirs (attack)
  const bx=sm(tB-.1,tB+.6,t,easeOutBack)*(1-sm(tF-.6,tF-.1,t));
  if(bx>.02){ring3(s,c,[-96,.05,0],9.5,false,bx,R,41,17);ring3(s,c,[-9,.05,0],9.5,false,sm(tB+.5,tB+1.1,t,easeOutBack)*(1-sm(tF-.6,tF-.1,t)),Y,42,17);}
  // 2 · "covering the whole pitch": a double arrow box to box
  const cw=sm(tW-.1,tW+.9,t,easeOut)*(1-sm(tS-.1,tS+.3,t));
  if(cw>.02){const pts:V3[]=[];for(let i=0;i<=14;i++){const u=i/14*cw;pts.push([lerp(-86,-19,u),.3,-26+6*Math.sin(Math.PI*u)]);}
   arrow3(s,c,pts,Math.max(8,kAt(c,[-52,0,-26])*.9),Y,.95);
   if(cw>.9){const back:V3[]=[];for(let i=0;i<=14;i++){const u=i/14;back.push([lerp(-19,-86,u),.3,26-6*Math.sin(Math.PI*u)]);}arrow3(s,c,back,Math.max(8,kAt(c,[-52,0,26])*.9),R,.95);}}
  // 3 · "Start near your own goal … carry it forward": his real run, a red arrow growing behind him
  const sn=sm(tS-.1,tS+.4,t,easeOutBack)*(1-sm(tF+.2,tF+.8,t));
  if(sn>.02){const p0=lxz(T_RCV);ring3(s,c,[p0[0],.05,p0[2]],2.6,false,sn,Y,43);}
  const cr=clamp((tau-T_RCV)/(-T_RCV))*(1-sm(tF+.6,tF+1.2,t));
  if(t>tC-.3&&cr>.02){const pts:V3[]=[];for(let i=0;i<=16;i++){const tt2=lerp(T_RCV,Math.min(tau,-.3),i/16),p=hermite(TRACK,tt2);pts.push([p[0],.3,p[1]]);}
   arrow3(s,c,pts,Math.max(8,kAt(c,lxz(tau))*.6),R,.95);}
  // 4 · "then shoot": the drive (yellow), a ring on the net
  if(tau>0){const pts=partial(pathPts(c,0,FLY,30),clamp(tau/FLY)),w=Math.max(8,kAt(c,flightU(.5))*.2);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95);}}
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,hero:t<tF-.4?'low':undefined});
  const dn=sm(tF+.35,tF+.85,t,easeOutBack);
  if(dn>.02)ring3(s,c,TGT,.55,true,dn,Y,44);
 },
 still:9,
};

const film:RisoStory={
 id:'matthaus-signature',format:'11v11',title:"Matthäus's box-to-box drive",
 theme:'Box-to-box players help defend and attack: they cover the whole pitch, carry it forward and shoot',
 ageNote:'West Germany 4–1 Yugoslavia, 1990 World Cup, San Siro, Milan, 10 June 1990: his fifty-metre solo run. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a long carry and a drive — a red run arrow with a spinning ball on its tip, then a straight yellow strike. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const run:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*Math.min(1,u*1.6);run.push([x-150+130*k,y+60-40*k+10*Math.sin(k*Math.PI*3)]);}
  if(run.length>2)s.fill(R,ribbon(run,10,{seed,taper:.6,wobble:.6}),.9*fade);
  const k2=clamp(u*1.6-.6),e:Pt=[x-20+170*k2,y+20-120*k2];
  if(k2>0)s.fill(Y,ribbon([[x-20,y+20],e],14,{seed,taper:.8,pressure:.3,wobble:.6}),.95*fade);
  if(age>0&&age<.3)sparkBurst(s,Y,x-20,y+20,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,k2>0?e[0]:run[run.length-1][0],k2>0?e[1]:run[run.length-1][1],34,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
