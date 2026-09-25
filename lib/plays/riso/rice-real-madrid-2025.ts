/** Declan Rice's two free kicks — Arsenal 3–0 Real Madrid, Champions League quarter-final first leg, Emirates Stadium, London, Tuesday
 * 8 April 2025 — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or
 * StoryFilmPlayer. A 1:1 reconstruction of both goals from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched 23 Sep 2026, cached under scratchpad/films/src-cache):
 *  - The Guardian, David Hytner, "Declan Rice's double rocket sinks Real Madrid to put Arsenal in dreamland" (8 Apr 2025)
 *    https://www.theguardian.com/football/2025/apr/08/arsenal-real-madrid-champions-league-quarter-final-first-leg-match-report
 *  - The Guardian, Barney Ronay, "Declan Rice topples Real Madrid with black swans and silver bullets" (8 Apr 2025)
 *    https://www.theguardian.com/football/2025/apr/08/declan-rice-arsenal-real-madrid-football-champions-league
 *  - The Guardian, "Arsenal 3-0 Real Madrid: Champions League quarter-final – as it happened" (8 Apr 2025, incl. Rice's post-match quotes)
 *    https://www.theguardian.com/football/live/2025/apr/08/arsenal-v-real-madrid-champions-league-quarter-final-live
 *  - BBC Sport live page + report, "Arsenal 3–0 Real Madrid" (8 Apr 2025, line-ups and numbers) https://www.bbc.com/sport/football/live/cx256773e2yt
 *  - Wikipedia, "Declan Rice" and "2024–25 Real Madrid CF season" (kit templates) and "2024–25 UEFA Champions League knockout phase"
 * CONFIRMED by those accounts: Tuesday 8 April 2025, Emirates Stadium, an evening kick-off ("the light died above the lip of the stand");
 *  Arsenal 3–0 (Rice 58', Rice 70', Merino 75'); Rice had never scored a direct free kick in his professional career; both free kicks were
 *  won by Saka. FIRST (58'): "slightly to the right of centre" / "planted to the right of the goal", "just Rice behind it", RIGHT foot,
 *  "round the wall" not over it, "heading for the crowd at first", started "a yard or so outside Thibaut Courtois's left-hand post" and
 *  came back inside "at the very last – halfway up the net", "a couple of centimetres inside the near post"; "Courtois flew to his left but
 *  couldn't get near it"; teammates rushed to congratulate him. The wall: Rice said "a four-man wall and there was a gap" (Ronay wrote
 *  five; we draw Rice's four). SECOND (70'): after Camavinga's foul (booked), "a little more to the left" / "to the left of centre", a
 *  "long-range effort", Rice "paced back, no disguise, all intent", "flashed it over the wall and straight into the top corner as Courtois
 *  dived in vain to his left", the "top right-hand corner" (BBC) = "the far, top corner" = "the same side" as the first; Courtois "left a
 *  gap on that side, thinking Rice would go to the near post"; "the net bulged outwards"; then Rice "jumped on to the top of an advertising
 *  board, arms outstretched". Rice: "I practise going to the keeper's side a lot"; "It's hit the wall too many times or gone over the bar."
 *  Kits: Real Madrid in their white home kit ("putty-coloured", Guardian; the season's third kit is dark grey, the away orange); Arsenal in
 *  red and white; "the stands fluttering with red and white plastic flags". Numbers (BBC): Rice 41, Saka 7, Merino 23, Saliba 2,
 *  Martinelli 11, Ødegaard 8; Courtois 1, Rüdiger 22, Asencio 35, Valverde 8, Bellingham 5, Camavinga 6, Mbappé 9, Vinícius 7.
 * INFERRED (illustrative): every exact position (FK1 ≈ 23 m out and 3.2 m right of centre; FK2 ≈ 27.5 m out and 2.4 m left), the run-ups,
 *  the flight curves (heights, speeds, the exact bend), which Madrid players stood in each wall and where the other players stood, where
 *  Courtois stood before each kick, the keeper kit colour (blue here; not named), Arsenal's socks (white), the referee's kit, Rice's hair,
 *  which end Arsenal attacked and which side the main camera sat (the +z, attacker's-right side), where Rice ran after each goal and which
 *  board he climbed (a near-side touchline board), the Emirates bowl simplified (red seats, a club-level band, a dark roof with lamps), the
 *  crowd colours and flags, the TV camera positions. Arsenal's WHITE SLEEVES: athlete.ts prints one ink per shirt, so the sleeves are
 *  over-printed by this film's adapter (paper patches on the near arm's upper sleeve, see drawPlayer) — mid/high detail only.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = live, the high main-stand camera in REAL TIME: the floodlit bowl, the four-man wall, Rice
 * alone behind the ball, his run, the ball round the outside of the wall and back inside the near post; ch2 = the slow-motion replay of
 * that first kick from LOW BEHIND Rice: the ball heads outside the post (a dashed "heading" line), bends back in (a yellow replay trail),
 * Courtois flies to his left; ch3 = live again, twelve minutes later: the second kick from the main-stand camera, over the five-man wall into
 * the top far corner, the net bulging; a director's cut to a pitch-level camera as Rice climbs the advertising board, arms wide, the red
 * and white flags waving; ch4 = the lesson: practice trails (into the wall, over the bar, wide, then the one), a close, very slow strike
 * with the foot wrapping round the ball, the spin, then the elevated behind view: where it was heading (dashed) and the real bend round
 * the wall and inside the post.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), inside the central ~1000 units so it frames
 * from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE adapter,
 * drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev` secondary motion, motion smear on the strike
 * and the runs); small figures in wide shots and every figure inside a passage print at `low` detail. Handedness: the world is right-handed
 * (x toward the goal Madrid defend, y up, +z = Rice's right), athlete.ts's own convention, so his RIGHT foot strikes without mirroring.
 * Inks: yellow, red, blue, navy (Madrid's white is the paper). Everything is keyed to cue times (withTiming swaps in the recorded word
 * onsets), poses on twos, cameras on ones; all randomness seeded. Budget: ~150–300 plate ops per frame, passages up to ~600. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/rice-real-madrid-2025/timing.json, add
 *   import timingJson from '../../../public/plays/narration/rice-real-madrid-2025/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The first free kick',text:'Arsenal against Real Madrid, 2025. Declan Rice has never scored a free kick. He steps up, and curls it round the wall... Goal!',tail:2.4,
  cues:['Arsenal against','Declan Rice','never scored','steps up','curls it','round the wall','Goal']},
 {label:'Watch it again',text:"Watch it again. It starts outside the post, then bends back inside. Courtois dives, but it's just too good!",tail:1.6,
  cues:['Watch it again','starts outside','bends back','Courtois dives','too good']},
 {label:'Another one!',text:'Twelve minutes later, another one! Over the wall and into the top corner. Rice leaps onto the boards, arms wide!',tail:2,
  cues:['Twelve minutes','another one','Over the wall','top corner','Rice leaps','arms wide']},
 {label:'The secret',text:'The secret? Practise! Rice had practised free kicks again and again. Wrap your foot round the ball, and it bends round the wall.',tail:1.8,
  cues:['The secret','Practise','again and again','Wrap your foot','it bends','round the wall']},
];
import timingJson from '../../../public/plays/narration/rice-real-madrid-2025/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('rice: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('rice: no cue '+w);return c.at;};
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
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Madrid defend is x = 0 (Arsenal attack +x), the goal centre z = 0, +z = Rice's right (the main-camera side). */
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

// ---------------------------------------------------------------- the Emirates at night: a continuous red bowl, club-level band, dark roof, lamps
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the near side (z>0, the camera side), 3 the
 * other end; 4..7 the corners that close the bowl */
const SIDE=(a:number,b:number,s:number):V3=>[lerp(-118,14,s>0?1-a:a),1.4+26*b,s*(41+34*b)];
const END=(a:number,b:number,x0:number,d:number):V3=>[x0+d*30*b,1.4+26*b,lerp(-56,56,d>0?a:1-a)];
const STANDS:((a:number,b:number)=>V3)[]=[(a,b)=>SIDE(a,b,-1),(a,b)=>END(a,b,8,1),(a,b)=>SIDE(a,b,1),(a,b)=>END(a,b,-112,-1)];
/** the corner quads between stand i's end (a = 1) and stand i+1's start (a = 0) */
const CORNER=(i:number,a:number,b:number):V3=>mix3(STANDS[i](1,b),STANDS[(i+1)%4](0,b),a);
const ALL=(i:number)=>i<4?STANDS[i]:(a:number,b:number)=>CORNER(i-4,a,b);
const STAND_COLS=[100,70,100,70,14,14,14,14],STAND_ROWS=14,BAND=[.44,.52];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a spring night over north London: the navy sky, a faint blue glow above the roof
 s.field(K,.86,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);
 const planes=new Path2D(),band=new Path2D(),roof=new Path2D(),edge=new Path2D();
 const ws=[...which,...which.flatMap(i=>{const n=(i+1)%4,p=(i+3)%4;return[which.includes(n)?4+i:-1,which.includes(p)?4+p:-1];})].filter((x,k,a)=>x>=0&&a.indexOf(x)===k);
 for(const i of ws){const S=ALL(i);addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));addPoly(band,polyP(c,[S(0,BAND[0]),S(1,BAND[0]),S(1,BAND[1]),S(0,BAND[1])]));
  // the roof: a dark overhang tilted out over the top rows, a pale fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,9,0]),add3(S(0,.74),[0,9,0])]));
  seg3(c,add3(S(0,.74),[0,8.8,0]),add3(S(1,.74),[0,8.8,0]),.5,edge);}
 // red seats under the crowd; the club-level fascia band
 s.knockout(planes);s.tone(R,planes,.62);s.tone(K,planes,.38);s.knockout(band,.8);s.tone(K,band,.22);
 // the crowd: seeded dots (Arsenal red and white, a little navy), sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const si of ws){const S=ALL(si),cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(b>BAND[0]-.03&&b<BAND[1]+.03)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.62?0:h<.9?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.85);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 // floodlights: lamp strips along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.03,.74),[0,8.2,0]),b=add3(S(u+.03,.74),[0,8.2,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 // the red-and-white flags: when the crowd roars, little flags wave above the heads
 if(roar>.05){const fr=new Path2D(),fw=new Path2D();for(let i=0;i<60;i++){const si=which[i%which.length],S=STANDS[si],h=hash(i*37+si,13),P=S(.05+.9*h,.08+.8*hash(i,29)),q=toCam(c,P);if(q[2]<NEAR+3)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;
  const z=clamp(c.F*1.1/q[2],4,26)*(.6+.4*roar),sw=Math.sin(tt*9+h*TAU)*z*.35,y0=p[1]-z*1.3;const f=polyPath([[p[0],y0],[p[0]+z*1.3,y0+sw*.4],[p[0]+z*1.3,y0+z*.8+sw*.4],[p[0],y0+z*.8]],true);(h<.5?fr:fw).addPath(f);}
  s.knockout(fw);s.fill(R,fr,.95);}
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- floodlit grass, lines, LED boards, corner flags, the goal
/** the advertising boards: along both touchlines (z = ±37.9) and behind the goal (x = 5) */
const BOARD_Z=37.9,BOARD_H=.95;
function ground(s:Sheet,c:Cam,o:{bulge?:number;bz?:number;by?:number;post?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);s.tone(K,gp,.14);
 // mowing stripes across the width, every 5.5 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.12);
 // LED boards: navy with glowing red and yellow panels
 const bd=new Path2D(),pn=new Path2D(),py=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,BOARD_H,0]),add3(a,[0,BOARD_H,0])]));
 board([5,0,-38],[5,0,38]);board([-110,0,-BOARD_Z],[5,0,-BOARD_Z]);board([-110,0,BOARD_Z],[5,0,BOARD_Z]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(k%3?pn:py,polyP(c,[[4.9,.2,z],[4.9,.2,z+3.6],[4.9,.75,z+3.6],[4.9,.75,z]]));}
 for(const zz of[-BOARD_Z+.05,BOARD_Z-.05])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(k%3?pn:py,polyP(c,[[x,.2,zz],[x+3.8,.2,zz],[x+3.8,.75,zz],[x,.75,zz]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.8);s.fill(R,pn,.9);s.knockout(py,.8);s.fill(Y,py,.9);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 // corner flags
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,o.bulge??0,o.bz??3,o.by??1.2,o.post??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (bz, by);
 * post = a yellow flash on the +z (near, Courtois's left-hand) post */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number,by:number,post:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.5,2)-Math.pow((y-by)/1.1,2));
 const zs=[z0,-1.8,0,1.8,3,z1],ys=[0,.63,1.27,1.9];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.35);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);for(let j=0;j<3;j++)seg3(c,[back(z,ys[3-j]),ys[3-j],z],[back(z,ys[2-j]),ys[2-j],z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
 if(post>0){const p=new Path2D();seg3(c,[X,0,z1],[X,H,z1],.13,p);s.fill(Y,p,.95*post);}
}

// ---------------------------------------------------------------- the two kicks (τ = 0 is the strike; flight parameterised by distance d)
type Kick={B0:V3;/** goal-line z / y the ball crosses at */zG:number;yG:number;/** z / y as it passes the wall (9.15 m) */zW:number;yW:number;fly:number;
 /** wall men's z */wall:number[];keeper:[number,number];/** keeper's late dive (to his left, +z): start τ, height 0..1, reach 0..1 */dive:[number,number,number];
 runL:number;power:number;D:number;S:number;H:number;HA:number;HB:number;inNet:number;netHit:V3;rest:V3;wallX:number};
const WALL_D=9.15;
function makeKick(o:{B0:V3;zG:number;yG:number;zW:number;yW:number;fly:number;wall:number[];keeper:[number,number];dive:[number,number,number];runL:number;power:number}):Kick{
 const D=-o.B0[0],a1=WALL_D,c1=a1*a1*(.4+.6*a1/D),c2=D*D,r1=o.zW-o.B0[2],r2=o.zG-o.B0[2];
 // z(d) = z0 + S·d − H·d²(.4 + .6 d/D): it leaves heading right (S), and bends left, tightening late (H)
 const H=(r1*D-r2*a1)/(c2*a1-c1*D),S=(r1+H*c1)/a1;
 // y(d) = .11 + HA·d − HB·d² through the wall point and the goal-line point
 const y1=o.yW-.11,y2=o.yG-.11,HB=(y1*D-y2*a1)/(a1*D*D-D*a1*a1),HA=(y1+HB*a1*a1)/a1;
 return{...o,D,S,H,HA,HB,inNet:o.fly+.12,netHit:[1.6,o.yG*.9,o.zG-.25],rest:[1.2,.11,o.zG-.8],wallX:o.B0[0]+WALL_D};
}
/** FIRST (58'): right of centre, ROUND the outside of a four-man wall, starting outside the near post, back inside it halfway up */
const K1=makeKick({B0:[-23,.11,3.2],zW:4.45,yW:1.75,zG:3.5,yG:1.22,fly:1.02,wall:[1.95,2.5,3.05,3.6],keeper:[-.7,-.2],dive:[.55,.55,.8],runL:4.2,power:.9});
/** SECOND (70'): left of centre, further out, OVER a five-man wall into the far top corner (Rice's right, Courtois's left) */
const K2=makeKick({B0:[-27.5,.11,-2.4],zW:-.2,yW:2.55,zG:3.2,yG:2.12,fly:1.06,wall:[-2.35,-1.75,-1.15,-.55,.05],keeper:[-.75,-1.2],dive:[.5,.95,.95],runL:5.6,power:1});
const flight=(k:Kick,d:number):V3=>[k.B0[0]+d,.11+k.HA*d-k.HB*d*d,k.B0[2]+k.S*d-k.H*d*d*(.4+.6*d/k.D)];
/** straight on: the same height, no bend (the replay's and the lesson's "where it was heading") */
const straight=(k:Kick,d:number):V3=>[k.B0[0]+d,.11+k.HA*d-k.HB*d*d,k.B0[2]+k.S*d];
const dAt=(k:Kick,tau:number)=>{const u=clamp(tau/k.fly);return k.D*u*(1.25-.25*u);};
const tauAtD=(k:Kick,d:number)=>{const q=clamp(d/k.D);return k.fly*(1.25-Math.sqrt(1.5625-q))/.5;};
function ballAt(k:Kick,tau:number):V3{
 if(tau<=0)return k.B0;
 if(tau<k.fly)return flight(k,dAt(k,tau));
 const G=flight(k,k.D);
 if(tau<k.inNet)return mix3(G,k.netHit,easeOut((tau-k.fly)/(k.inNet-k.fly)));
 const u=clamp((tau-k.inNet)/.55),h=k.netHit[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-k.inNet-.55)*9))*Math.exp(-(tau-k.inNet-.55)*3.5):0;
 return[lerp(k.netHit[0],k.rest[0],u),Math.max(.11,h)+b,lerp(k.netHit[2],k.rest[2],u)];
}
/** ball spin (panel rotation): ~9 rev/s off the boot */
const spinAt=(k:Kick,tau:number)=>tau<=0?0:TAU*9*Math.min(tau,k.inNet)+TAU*2*Math.max(0,tau-k.inNet);
const bulgeAt=(k:Kick,tau:number)=>tau<k.inNet-.03?0:Math.exp(-(tau-k.inNet+.03)*2.4)*(1+.3*Math.sin((tau-k.inNet)*14));
const groundOf=(k:Kick,tau:number)=>({bulge:bulgeAt(k,tau),bz:k.zG,by:k.yG});

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Arsenal: red shirts (white sleeves over-printed by drawPlayer), white shorts, white socks with red trim, white numbers */
const ARSENAL=new WeakSet<AthleteStyle>();
const arsenal=(o:Partial<AthleteStyle>={}):AthleteStyle=>{const st:AthleteStyle={shirt:[R,.95],shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:'paper',hairStyle:'short',...o};ARSENAL.add(st);return st;};
/** Real Madrid: all white, navy trim and numbers */
const madrid=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:[K,.9],shade:[K,.22],hairStyle:'short',...o});
const RICE_B={height:1.85,bulk:1.04};
const RICE_ST=arsenal({number:41,hair:[K,.85],build:RICE_B,seed:41});
/** Courtois: 1.99 m, dark short hair (as courtois-final-2022); the keeper kit colour that night is not in the sources (blue, inferred) */
const COURTOIS:AthleteStyle={shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:SKIN_L,hair:[K,.95],hairStyle:'short',line:K,trim:[K,.7],shade:[K,.3],gloves:[Y,.8],sleeves:'long',number:1,numberInk:'paper',build:{height:1.99,bulk:1.02},seed:1};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'balding',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- Rice: the mark, the angled run-up, the strike, the celebration
/** approach from the LEFT of the ball (≈ 23°), so the right leg swings round the back of it */
const DIRN=Math.hypot(1,.42),DIR:[number,number]=[1/DIRN,.42/DIRN],RIGHT:[number,number]=[-DIR[1],DIR[0]];
const YAW_R=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.5,STRIKE_L=1.6;
/** where Rice's pelvis stands at contact so the inside of his RIGHT boot meets the ball's right-back side (solved once per kick, FK) */
const pcOf=(k:Kick):[number,number]=>{const sk=solve(strike(STRIKE_CONTACT),RICE_B,{x:0,z:0,yaw:YAW_R}),toe:[number,number]=[k.B0[0]-DIR[0]*.12+RIGHT[0]*.06,k.B0[2]-DIR[1]*.12+RIGHT[1]*.06];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];};
const PC1=pcOf(K1),PC2=pcOf(K2);
const PC=(k:Kick)=>k===K1?PC1:PC2;
/** hands on hips at his mark, eyes on the goal; then the lean into the run */
const R_SET=posed({lHipF:-6,rHipF:8,lKnee:10,rKnee:16,lean:6,pitch:2,neckP:-4,lShA:44,rShA:44,lShF:-18,rShF:-18,lElb:112,rElb:112,lShR:30,rShR:30,twist:-4});
const R_READY=posed({lHipF:-20,rHipF:22,lKnee:26,rKnee:32,lAnk:18,rAnk:-6,lean:16,pitch:5,neckP:14,lShA:30,rShA:26,lShF:-10,rShF:14,lElb:40,rElb:46,twist:-10});
const ARMS_WIDE=posed({lShA:100,rShA:100,lShF:14,rShF:14,lElb:8,rElb:8,lHand:1,rHand:1,neckP:-8,lean:-8,pitch:-3,lHipF:8,rHipF:-2,lKnee:10,rKnee:12,lHipA:12,rHipA:12});
const FISTS=posed({lShA:40,rShA:40,lShF:40,rShF:40,lElb:120,rElb:120,neckP:-20,lean:4,lHipF:20,rHipF:16,lKnee:30,rKnee:26});
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
/** the celebration run: from the follow-through to a target, accelerating to 7 m/s, easing in. FK1: toward the near side, teammates pile
 * in; FK2: to a near-side touchline board, which he climbs (TARGET beside the board, then up onto it) */
const RUN_T0=1.3;
type Celeb={from:[number,number];to:[number,number];L:number;tArrive:number;yaw:number};
function celebOf(k:Kick,to:[number,number]):Celeb{const p=PC(k),from:[number,number]=[p[0]+DIR[0]*.9,p[1]+DIR[1]*.9],L=Math.hypot(to[0]-from[0],to[1]-from[1]);
 const c:Celeb={from,to,L,tArrive:0,yaw:yawTo(from[0],from[1],to[0],to[1])};let t=RUN_T0;while(celebS(c,t)<L-.9&&t<30)t+=.01;c.tArrive=t;return c;}
function celebS(c:Celeb,tau:number){const u=tau-RUN_T0;if(u<=0)return 0;const s=u<.6?7*u*u/1.2:7*(u-.3),a=c.L-3.2;return s<a?s:a+3.2*(1-Math.exp(-(s-a)/3.2));}
function celebPos(c:Celeb,tau:number):[number,number]{const s=celebS(c,tau)/c.L;return[lerp(c.from[0],c.to[0],s),lerp(c.from[1],c.to[1],s)];}
const C1=celebOf(K1,[-12,14]),C2=celebOf(K2,[-8.5,BOARD_Z-.75]);
const CEL=(k:Kick)=>k===K1?C1:C2;
/** FK2: the hop up onto the board (τ start) — .25 s after he pulls up beside it */
const T_UP=C2.tArrive+.1;
/** Rice's pose. ready 0..1 = leaning into his mark before the run, it = an idle clock for breathing */
function ricePose(k:Kick,tau:number,ready=1,it=0):Pose{
 const c=CEL(k);
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*2.2);const p=blendPose(R_SET,R_READY,ready);p.lean+=.03*br*(1-ready);p.neckP+=.04*br;p.air=.01*ready*Math.max(0,Math.sin(it*6.5));return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(R_READY,runCycle(2.6*Math.pow(u,.9),{speed:.55+.35*u}),sm(0,.18,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.6+(tau-RUN_END)*1.6,{speed:.8});
 let p=blendPose(run,strike(Math.min(1,us),{power:k.power}),sm(RUN_END,RUN_END+.14,tau));
 // chest over the ball through contact, the hip driving through; easing off in the follow-through
 const lo=sm(RUN_END,-.05,tau)*(1-sm(.12,.5,tau));p.lean+=.1*lo;p.neckP+=.1*lo;
 if(tau>RUN_T0-.35){const s=celebS(c,tau),sp=clamp((celebS(c,tau+.05)-celebS(c,tau-.05))/.1/7);
  p=blendPose(p,runCycle(s/4.4,{speed:.85}),sm(RUN_T0-.35,RUN_T0+.25,tau));
  if(k===K1){if(tau>c.tArrive-.6)p=blendPose(p,blendPose(FISTS,celebrate(tau*.9,{kind:'arms'}),.6),clamp(1-sp*1.6)*sm(c.tArrive-.6,c.tArrive+.1,tau));}
  else if(tau>c.tArrive-.6){const up=sm(T_UP,T_UP+.35,tau);
   // pull up beside the board, a crouch, the hop up, then tall on top of it with his arms outstretched
   p=blendPose(p,posed({lHipF:40,rHipF:34,lKnee:60,rKnee:56,lean:18,lShF:-30,rShF:-30,lShA:20,rShA:20,lElb:30,rElb:30}),clamp(1-sp*1.6)*(1-up));
   if(up>0)p=blendPose(p,posed({lHipF:50,rHipF:10,lKnee:90,rKnee:30,lAnk:30,rAnk:40,lean:6,lShA:70,rShA:70,lShF:40,rShF:40,air:.05}),Math.sin(Math.PI*up));
   p=blendPose(p,ARMS_WIDE,sm(T_UP+.3,T_UP+.8,tau));
   p.lShA+=.08*Math.sin(it*3);p.rShA+=.08*Math.sin(it*3+1);}}
 return p;
}
function ricePlace(k:Kick,tau:number):Place{
 const pc=PC(k),c=CEL(k),L0=k.runL+STRIKE_L;let g:number;
 if(tau<=T_RUN0)g=-L0;
 else if(tau<RUN_END)g=-L0+k.runL*Math.pow(runU(tau),1.2);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.55*v+.45*(1-(1-v)*(1-v)));}
 else g=.9*(1-Math.pow(1-clamp(tau/.7),2));
 const x=pc[0]+DIR[0]*g,z=pc[1]+DIR[1]*g;
 if(tau<RUN_T0-.35)return{x,z,yaw:YAW_R};
 const[cx,cz]=celebPos(c,tau);
 if(k===K1){const turn=sm(c.tArrive-.45,c.tArrive+.5,tau,easeInOutSine);return{x:cx,z:cz,yaw:lerpAng(lerpAng(YAW_R,c.yaw,sm(RUN_T0-.35,RUN_T0+.3,tau)),c.yaw+Math.PI*.8,turn)};}
 // FK2: up onto the board (its top edge at BOARD_H), turning to face the pitch as he lands
 const up=sm(T_UP,T_UP+.35,tau),hop=.35*Math.sin(Math.PI*up),turn=sm(T_UP-.1,T_UP+.45,tau,easeInOutSine);
 return{x:cx,z:lerp(cz,BOARD_Z,up),y:BOARD_H*up+hop,yaw:lerpAng(lerpAng(YAW_R,c.yaw,sm(RUN_T0-.35,RUN_T0+.3,tau)),Math.PI/2+.2,turn)};
}

// ---------------------------------------------------------------- everyone else
type Role='wall'|'keeper'|'def'|'att'|'ref';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number;/** FK1 celebration: [start delay s, side offset m] */chase?:[number,number]};
function castOf(k:Kick):Actor[]{
 const W=k===K1?[madrid({number:8,skin:SKIN_M,build:{height:1.82},seed:10}),madrid({number:5,skin:SKIN_M,build:{height:1.86},seed:11}),madrid({number:6,skin:SKIN_D,hairStyle:'curly',build:{height:1.85},seed:12}),madrid({number:22,skin:SKIN_D,build:{height:1.9,bulk:1.06},hairStyle:'bald',seed:13})]
  :[madrid({number:22,skin:SKIN_D,build:{height:1.9,bulk:1.06},hairStyle:'bald',seed:13}),madrid({number:5,skin:SKIN_M,build:{height:1.86},seed:11}),madrid({number:6,skin:SKIN_D,hairStyle:'curly',build:{height:1.85},seed:12}),madrid({number:8,skin:SKIN_M,build:{height:1.82},seed:10}),madrid({number:9,skin:SKIN_D,build:{height:1.78},seed:14})];
 const out:Actor[]=k.wall.map((z,i)=>({name:'wall'+i,role:'wall' as Role,st:W[i],x:k.wallX+(i%2)*.05,z,phase:i*.23}));
 out.push({name:'Courtois',role:'keeper',st:COURTOIS,x:k.keeper[0],z:k.keeper[1],phase:0});
 const s=k===K1?1:-1;
 out.push({name:'Asencio',role:'def',st:madrid({number:35,build:{height:1.84},seed:15}),x:-11.5,z:s*-5.2,phase:.4},
  {name:'Valverde',role:'def',st:madrid({number:7,skin:SKIN_D,build:{height:1.76},seed:16}),x:-12.4,z:s*1.8,phase:.9},
  {name:'Alaba',role:'def',st:madrid({number:4,skin:SKIN_D,build:{height:1.8},seed:17}),x:-10.8,z:s*6.4,phase:.5},
  {name:'Merino',role:'att',st:arsenal({number:23,build:{height:1.89},seed:21}),x:-12.9,z:s*-3.6,phase:.2,chase:[.25,1.3]},
  {name:'Saliba',role:'att',st:arsenal({number:2,skin:SKIN_D,build:{height:1.92},seed:22}),x:-12.2,z:s*3.9,phase:.7,chase:[.45,-1.2]},
  {name:'Saka',role:'att',st:arsenal({number:7,skin:SKIN_D,build:{height:1.78},seed:23}),x:k.B0[0]+3.4,z:k.B0[2]-5.2*s,phase:.15,chase:[0,.2]},
  {name:'referee',role:'ref',st:REF_ST,x:k.B0[0]+4.5,z:k.B0[2]+6.8*s,phase:.35});
 return out;
}
const CAST1=castOf(K1),CAST2=castOf(K2);
const WALL_P=posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lHipA:3,rHipA:3,lShF:30,rShF:30,lShA:-10,rShA:-10,lElb:46,rElb:46,lean:6,neckP:4});
const WALL_J=posed({lHipF:36,rHipF:30,lKnee:74,rKnee:66,lAnk:46,rAnk:46,lShF:22,rShF:22,lShA:-6,rShA:-6,lElb:54,rElb:54,lean:12,air:.42,neckP:-24});
const DEF_P=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** one actor's pose + place at τ (it = idle clock) */
function actorAt(k:Kick,a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,k.B0[0],k.B0[2]),toGoal=yawTo(a.x,a.z,0,k.zG*.5),look=sm(.05,.75,tau,easeInOutSine),br=Math.sin(it*2.1+a.phase*TAU);
 // FK1: teammates rush to congratulate him
 if(k===K1&&a.chase&&tau>1.4){const c=C1,E=(tt:number):[number,number]=>{const p=celebPos(c,tt);return[p[0]-1.1*Math.cos(c.yaw)+a.chase![1]*.8,p[1]+1.1*Math.sin(c.yaw)+a.chase![1]];};
  const u=clamp((tau-1.4-a.chase[0])/2.2),q=(tt:number):[number,number]=>{const e=E(tt),w=easeInOutSine(clamp((tt-1.4-a.chase![0])/2.2));return[lerp(a.x,e[0],w),lerp(a.z,e[1],w)];};
  const p0=q(tau),p1=q(tau+.06),sp=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])/.06;
  let pose=blendPose(runCycle(tau*1.6+a.phase,{speed:clamp(sp/7)}),celebrate(it*.9+a.phase,{kind:'arms'}),clamp(1-sp/2.2));
  pose=blendPose(blendPose(DEF_P,stand(),.4),pose,sm(0,.15,u));
  return{pose,place:{x:p0[0],z:p0[1],yaw:sp>1.2?yawTo(p0[0],p0[1],p1[0],p1[1]):yawTo(p0[0],p0[1],...celebPos(c,tau))}};}
 switch(a.role){
  case 'wall':{let p=blendPose(WALL_P,stand(),.25+.12*br);
   const j=tau<-.12?0:Math.sin(Math.PI*clamp((tau+.12)/.62));p=blendPose(p,WALL_J,j);
   // heads snap round to their left as the ball goes by / over, then the shoulders slump
   p.neckY=(55*sm(.12,.45,tau)*(1-sm(.9,1.5,tau)))*Math.PI/180;if(tau>1.3)p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.8);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(Math.PI,Math.PI+2.1,sm(.35,1.3,tau,easeInOutSine))}};}
  case 'keeper':{const[t0,h,reach]=k.dive;let p=blendPose(keeperSet(it*1.3),keeperSet(.75),sm(-.4,-.12,tau));
   // "Courtois flew to his left" / "dived in vain to his left": a late, full stretch toward +z as it goes in
   if(tau>t0)p=blendPose(p,keeperDive(clamp((tau-t0)/1.3)*reach,{side:'l',height:h}),sm(t0,t0+.25,tau));
   return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,k.B0[0],k.B0[2])}};}
  case 'ref':{const p=blendPose(stand(),DEF_P,.2);return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,look)}};}
  case 'def':{let p=blendPose(DEF_P,stand(),.3+.2*br);p.air+=.012*Math.max(0,br);if(tau>1.3)p=blendPose(p,SLUMP,sm(1.3,1.9,tau)*.6);
   return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(toBall,toGoal,look)}};}
  default:{let p=blendPose(stand(),DEF_P,.4+.2*br);const go=a.name!=='Saka'&&tau>.1;if(go)p=blendPose(p,runCycle((tau-.1)*1.3,{speed:.5}),sm(.1,.4,tau));
   const run=go?Math.min(2.4,(tau-.1)*3.2):0;
   return{pose:p,place:{x:a.x+run*Math.cos(toGoal),z:a.z-run*Math.sin(toGoal),yaw:lerpAng(toBall,toGoal,look)}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs. Arsenal shirts get their WHITE SLEEVES here: athlete.ts prints
 * one shirt ink, so at mid/high detail the upper sleeve of each arm in front of the chest is knocked back to paper and re-outlined. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const res=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(ARSENAL.has(style)&&res.detail!=='low'){const sk=res.sk,dc=toCam(camera,sk.chest)[2],p=new Path2D();let n=0;
  for(const side of['l','r'] as const){const sh=sk[`${side}Sh`],el=sk[`${side}El`];if(toCam(camera,sh)[2]>dc+.1)continue;
   const d:V3=[el[0]-sh[0],el[1]-sh[1],el[2]-sh[2]],a=add3(sh,[d[0]*.1,d[1]*.1,d[2]*.1]),b=add3(sh,[d[0]*.46,d[1]*.46,d[2]*.46]),A=pr(camera,a),Bq=pr(camera,b);if(!A||!Bq)continue;
   p.addPath(ribbon([A,Bq],Math.max(3,kAt(camera,sh)*.13*sk.s*(style.build?.bulk??1)),{taper:0,wobble:0,seed:3}));n++;}
  if(n){s.knockout(p,.95);s.stroke(K,p,Math.max(1.2,res.heightPx*.012),.8);}}
 return res;
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,k:Kick,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(k,tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<k.inNet){const a=pr(c,ballAt(k,o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(k,tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,k:Kick,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(k,lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;ready:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'mid'};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. */
function play(s:Sheet,c:Cam,k:Kick,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9+(pl.y??0),pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),kk=c.F/q[2]*h;return Math.abs(g[0])>v.hx+kk||g[1]<-v.hy-kk||g[1]>v.hy+kk?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const cel=CEL(k);
 {const pl=ricePlace(k,tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=ricePose(k,tp,e.ready,e.it),prev={pose:ricePose(k,tpPrev,e.ready,e.it-1/12),place:ricePlace(k,tpPrev)};
  const st=detailFor(RICE_ST,d,true);if(st!==RICE_ST)ARSENAL.add(st);
  drawPlayer(s,pose,c,st,pl,prev,!!e.smear&&((tp>RUN_END+.2&&tp<.45)||(tp>RUN_T0+.3&&tp<cel.tArrive-.3)));}});}
 for(const a of (k===K1?CAST1:CAST2)){const cur=actorAt(k,a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(k,a,tpPrev,e.it-1/12);
  const st=detailFor(a.st,d,a.role==='keeper'||a.role==='wall');if(st!==a.st&&ARSENAL.has(a.st))ARSENAL.add(st);drawPlayer(s,cur.pose,c,st,cur.place,prev);}});}
 const bq=toCam(c,ballAt(k,tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,k,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const rxz=(k:Kick,tau:number):V3=>{const p=ricePlace(k,tau);return[p.x??0,p.y??0,p.z??0];};

// ---------------------------------------------------------------- 1 · live, the first kick: the high main-stand camera, real time
/** the strike lands on "curls it"; the run starts just before "steps up"; real time throughout */
const tS1=()=>Math.max(CUE(0,'curls it')-.05,CUE(0,'steps up')-.25-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0-.2,t-tS1());
const P1:V3=[-38,17,56];
function cam1(t:number):Cam{
 const tau=tau1(t),k=K1;
 return plan(t,[
  [0,0,()=>({P:P1,T:[-20,0,0],fov:34})],
  [CUE(0,'Declan Rice')-.25,1,()=>({P:P1,T:add3(rxz(k,tau),[2.2,.9,-.4]),fov:6.5})],
  [CUE(0,'never scored')-.1,1.1,()=>({P:P1,T:add3(mix3(k.B0,[k.wallX,0,2.8],.6),[0,.8,0]),fov:13})],
  [CUE(0,'steps up')-.3,.8,()=>({P:P1,T:add3(rxz(k,tau),[3,.9,0]),fov:11})],
  [tS1()-.1,.9,()=>({P:P1,T:[-5,1.3,2.2],fov:15})],
  [CUE(0,'Goal')+.1,2,()=>({P:P1,T:add3(rxz(k,Math.max(tau,1.5)),[3,1,-2]),fov:13})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),k=K1,tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+k.inNet;
  const ready=sm(CUE(0,'steps up')-.8,CUE(0,'steps up')-.1,t);
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,groundOf(k,tau));
  play(s,c,k,tau,tp,tpp,{it:tt,ready,minBall:16,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(K1,tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay of the first kick from low behind Rice
const tau2=(t:number)=>key(t,mono([[0,T_RUN0+.2],[CUE(1,'Watch it')+.9,-.55],[CUE(1,'starts outside')-.1,.03],[CUE(1,'starts outside')+.9,tauAtD(K1,WALL_D+.5)],
 [CUE(1,'bends back'),tauAtD(K1,15)],[CUE(1,'Courtois dives'),tauAtD(K1,21.5)],[CUE(1,'too good'),K1.inNet+.05],[SECS(1),K1.inNet+.9]]),linear);
const E2:V3=[K1.B0[0]-12,3.1,K1.B0[2]+1.2];
function cam2(t:number):Cam{
 const tau=tau2(t),k=K1,b=ballAt(k,Math.min(tau,k.fly));
 return plan(t,[
  [0,0,()=>{const u=sm(T_RUN0,1,tau,easeInOutSine),T=mix3(add3(k.B0,[6,.4,.3]),[-6,1.4,3.4],sm(-.05,.8,tau,easeInOutSine));return{P:mix3(E2,add3(E2,[-1.5,.8,0]),u),T:mix3(T,b,.15*sm(0,.2,tau)*(1-sm(.7,1,tau))),fov:lerp(30,22,u)};}],
  [CUE(1,'bends back')-.2,.8,()=>({P:add3(E2,[-1.5,.8,0]),T:[-4.5,1.4,3.8],fov:12})],
  [CUE(1,'Courtois dives')-.2,.8,()=>({P:add3(E2,[-1.5,.8,0]),T:[-.4,1.2,2.2],fov:9})],
  [CUE(1,'too good')+.1,1.3,()=>({P:add3(E2,[-1,.6,0]),T:[.3,1,2.6],fov:8})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),k=K1,tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),tO=CUE(1,'starts outside'),tB=CUE(1,'bends back');
  stadium(s,c,t,[0,1,2],{roar:sm(k.inNet,k.inNet+.4,tau),flash:sm(k.inNet+.1,k.inNet+.3,tau)});
  ground(s,c,{...groundOf(k,tau),post:sm(tO+.2,tO+.6,t)*(1-sm(tB+.5,tB+1.2,t))});
  // "starts outside the post": a dashed navy line where it was heading, straight on and wide of the near post
  const hd=sm(tO-.1,tO+.6,t)*(1-sm(tB+.8,tB+1.6,t));
  if(hd>.02){const str=new Path2D(),n=16;for(let i=1;i<n;i+=2){const a=pr(c,straight(k,i/n*k.D*hd)),b=pr(c,straight(k,(i+1)/n*k.D*hd));if(a&&b)str.addPath(ribbon([a,b],Math.max(6,kAt(c,straight(k,i/n*k.D))*.12),{taper:.25,wobble:0}));}
   s.knockout(str);s.stroke(K,str,2.2,.9*hd);}
  // the replay trail: the bend so far, fading at the tail (under the players)
  if(tau>.02&&tau<k.inNet+.7){const pts=pathPts(c,k,Math.max(0,tau-.75),Math.min(tau,k.fly+.001),20),fade=1-sm(k.fly+.1,k.inNet+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(k,Math.min(tau,k.fly)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,k,tau,tp,tpp,{it:tt,ready:1,smear:true,minBall:13});
 },
 aperture(t){const c=cam2(t),P=ballAt(K1,tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 3 · live, the second kick (main stand) → cut to pitch level: up on the board
/** the ball goes in on "top corner"; after the director's cut Rice hops onto the board on "Rice leaps" and his arms open on "arms wide" */
const tS3=()=>Math.max(CUE(2,'top corner')-K2.inNet+.1,CUE(2,'another one')+.3-T_RUN0);
const tCut=()=>Math.max(tS3()+K2.inNet+.8,CUE(2,'Rice leaps')-.5);
const tau3=(t:number)=>{if(t<tCut())return Math.max(T_RUN0-.2,t-tS3());const a=CUE(2,'Rice leaps');return key(t,mono([[tCut(),T_UP-.5-(a-tCut())],[a,T_UP-.05],[CUE(2,'arms wide'),T_UP+.35],[SECS(2),T_UP+.35+SECS(2)-CUE(2,'arms wide')]]),linear);};
const P3:V3=[-41,17,56];
function cam3a(t:number):Cam{
 const tau=tau3(t),k=K2;
 return plan(t,[
  [0,0,()=>({P:P3,T:[-19,.5,-1],fov:30})],
  [CUE(2,'another one')-.2,1,()=>({P:P3,T:add3(mix3(rxz(k,tau),[k.wallX,0,-1],.35),[0,1,0]),fov:13})],
  [tS3()-.1,.9,()=>({P:P3,T:[-6,1.6,.5],fov:16})],
  [tS3()+k.fly-.1,.8,()=>({P:P3,T:[-1.5,1.6,1.8],fov:10})],
 ]);
}
/** the pitch-level camera by the near touchline, looking out at the board with the fans behind */
function cam3b(t:number):Cam{
 const tau=tau3(t),r=rxz(K2,tau),B:V3=[r[0],r[1]+1.2,r[2]];
 return plan(t,[
  [0,0,()=>({P:[r[0]-7,2.8,BOARD_Z-12.5],T:add3(B,[1.2,-.2,0]),fov:26})],
  [CUE(2,'arms wide')-.3,1,()=>({P:[r[0]-5,2.9,BOARD_Z-10.5],T:add3(B,[.6,0,0]),fov:19})],
 ]);
}
/** fans in the near-side lower tier behind the board: cut-paper bodies that jump up with their arms raised; red-and-white flags wave */
const FANS=(()=>{const out:{a:number;b:number;h:number}[]=[];for(let j=0;j<9;j++)for(let i=0;i<46;i++){const h=hash(i*97+j*13,21);if(h<.12)continue;out.push({a:.06+(i+.5+(hash(i,j)-.5)*.35)/46*.3,b:.04+j*.045,h});}return out;})();
function fans(s:Sheet,c:Cam,t:number,rise:number,wave:number){
 const v=view(s),sil=new Path2D(),red=new Path2D(),navy=new Path2D(),skin=new Path2D(),hair=new Path2D(),arms=new Path2D();let n=0;const tt=twos(t);
 for(const f of FANS){const up=clamp(rise*1.5-f.h*.5),hop=up*Math.max(0,Math.sin(tt*9+f.h*TAU))*.18,P=STANDS[2](f.a,f.b),q=toCam(c,add3(P,[0,.5+.35*up+hop,0]));if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;
  const k=c.F/q[2],w=.46*k,h=.62*k,hr=.13*k,x=p[0],y=p[1];if(w<2.5)continue;n++;
  const body=polyPath([[x-w/2,y+h*.6],[x-w*.42,y-h*.35],[x-w*.18,y-h*.5],[x+w*.18,y-h*.5],[x+w*.42,y-h*.35],[x+w/2,y+h*.6]],true);sil.addPath(body);
  if(f.h<.55)red.addPath(body);else if(f.h<.62)navy.addPath(body);
  const head=polyPath(blob(x,y-h*.5-hr*.9,hr,hr*1.1,Math.floor(f.h*99),{amp:.06,n:10}),true);sil.addPath(head);skin.addPath(head);
  hair.addPath(polyPath(blob(x,y-h*.5-hr*1.4,hr*.95,hr*.5,Math.floor(f.h*77),{amp:.08,n:10}),true));
  if(up>.25){const sw=Math.sin(tt*7+f.h*9)*.25*wave;for(const sx of[-1,1]){const a0:Pt=[x+sx*w*.36,y-h*.38],a1:Pt=[x+sx*w*(.55+.2*up)+sw*w,y-h*.5-h*1.05*up];const r=ribbon([a0,a1],Math.max(1.6,w*.16),{seed:f.h*50+sx,taper:.2,wobble:0});arms.addPath(r);sil.addPath(r);}}}
 if(!n)return;s.knockout(sil);s.fill(R,red,.9);s.fill(K,navy,.85);s.tone(Y,skin,.4);s.tone(R,skin,.3);s.tone(Y,arms,.35);s.tone(R,arms,.25);s.fill(K,hair,.85);s.stroke(K,sil,2,.85);
 // red-and-white plastic flags held up and waving (half red, half paper)
 const fr=new Path2D(),fw=new Path2D();
 for(let i=0;i<9;i++){const a0=.07+i*.034,b0=.1+.26*hash(i,5),base=STANDS[2](a0,b0),sw=Math.sin(tt*6+i*1.7)*.5*wave,W=1.3,H=.9,top=1.2+1.2*rise;
  const P=(u:number,vv:number):V3=>[base[0]-u*W+sw*vv*.4,base[1]+top+H*(1-vv)+.2*Math.sin(u*3+tt*7+i)*wave,base[2]+sw*u*.3];
  const q=polyP(c,[P(0,0),P(.5,0),P(1,0),P(1,1),P(.5,1),P(0,1)]);if(q.length<3)continue;(i%2?fr:fw).addPath(polyPath(q,true));}
 if(rise>.05){s.knockout(fw);s.knockout(fr);s.fill(R,fr,.95);s.stroke(K,fw,2,.8);s.stroke(K,fr,2,.8);}
}
const ch3:Scene={
 draw(s,t){
  frame(s);const k=K2,tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tN=tS3()+k.inNet,cut=t>=tCut();
  if(!cut){const c=cam3a(t);
   stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)});
   ground(s,c,groundOf(k,tau));
   play(s,c,k,tau,tp,tpp,{it:tt,ready:sm(CUE(2,'Twelve')+.3,CUE(2,'another one'),t),minBall:16,lines:true,prevT:tau3(t-.06),hero:'mid',smear:true});
   return;}
  const c=cam3b(t),tA=CUE(2,'arms wide'),rise=.55+.45*sm(tA-.4,tA+.4,t);
  stadium(s,c,t,[1,2],{roar:rise,flash:.5+.5*sm(tA-.1,tA+.3,t)});
  fans(s,c,t,rise,.6+.4*sm(tA-.2,tA+.6,t));
  ground(s,c,{bulge:0,bz:k.zG,by:k.yG});
  play(s,c,k,tau,tau3(Math.max(tCut(),tt)),tau3(Math.max(tCut(),tt-1/12)),{it:tt,ready:1,smear:true,minBall:10});
  // "arms wide": a burst of paper and yellow over the board (the passage material into the lesson)
  const wc=sm(tA+.1,tA+.5,t);if(wc>0){const r=rxz(k,tau),q=pr(c,[r[0],r[1]+2.6,r[2]+.5]);if(q)sparkBurst(s,Y,q[0],q[1],110+150*wc,{n:11,seed:9,g:easeOutBack(wc),width:14});}
 },
 aperture(t){if(t<tCut()){const c=cam3a(t),P=ballAt(K2,tau3(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);}
  const c=cam3b(t),r=rxz(K2,tau3(t)),q=pr(c,[r[0],r[1]+1.3,r[2]])??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:6,
};

// ---------------------------------------------------------------- 4 · the lesson: practise → wrap the foot round the ball → it bends round the wall
const tau4=(t:number)=>key(t,mono([[0,-1.3],[CUE(3,'again and again')+1.2,-1.1],[CUE(3,'Wrap your foot')-.1,-.35],[CUE(3,'Wrap your foot')+.9,.003],[CUE(3,'it bends'),.04],[CUE(3,'round the wall'),tauAtD(K1,WALL_D+1)],[SECS(3),K1.fly+.3]]),linear);
/** the practice kicks: [end of the flight] into the wall, over the bar, wide, … the ones that did not go in */
const MISSES:V3[]=[[K1.wallX,1.5,2.7],[0,4.6,1.2],[0,1.4,6.3],[K1.wallX,1.7,3.4]];
function cam4v(t:number):Cam{
 const tau=tau4(t),k=K1,b=ballAt(k,Math.max(0,Math.min(tau,k.fly)));
 return plan(t,[
  [0,0,()=>({P:[k.B0[0]-11,5,k.B0[2]+1.5],T:[-8,1.6,2.8],fov:36})],
  [CUE(3,'Wrap your foot')-.4,1,()=>({P:add3(k.B0,[3.2,.7,3.2]),T:add3(k.B0,[-.7,.75,-.4]),fov:42})],
  [CUE(3,'it bends')-.1,.7,()=>({P:add3(b,[-2.4,.9,1.8]),T:add3(b,[.8,0,-.2]),fov:36})],
  [CUE(3,'round the wall')-.35,1.1,()=>({P:[-40,21,4.5],T:[-10,.4,3.2],fov:27})],
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
  frame(s);const k=K1,c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tP=CUE(3,'Practise'),tA=CUE(3,'again and again'),tW=CUE(3,'Wrap your foot'),tB=CUE(3,'it bends'),tR=CUE(3,'round the wall');
  stadium(s,c,t,[0,1,2]);
  ground(s,c,groundOf(k,tau));
  // "Practise … again and again": ghost practice balls (dashed navy arcs) that hit the wall, fly over the bar, go wide
  const pv=sm(tP-.1,tP+.3,t)*(1-sm(tW-.5,tW,t));
  if(pv>.02){for(let i=0;i<MISSES.length;i++){const u=sm(tP+.1+i*.5,tP+.6+i*.5,t);if(u<=0)continue;const E=MISSES[i],pts:Pt[]=[];
    for(let j=0;j<=14;j++){const w=j/14*u,P:V3=[lerp(k.B0[0],E[0],w),.11+(E[1]-.11)*w+2.2*Math.sin(Math.PI*w)*(E[0]>-5?1:.35),lerp(k.B0[2],E[2],w)],q=pr(c,P);if(q)pts.push(q);}
    if(pts.length>2){const g:[number,number][]=[];for(let j=0;j<6;j++)g.push([(j+.6)/6.2,(j+.95)/6.2]);const r=ribbon(pts,Math.max(7,kAt(c,[-12,1,3])*.16),{taper:.3,wobble:.4,gaps:g,seed:i*7});s.knockout(r,.8*pv);s.fill(Y,r,.75*pv);s.stroke(K,r,2,.8*pv);}
    const e=pts[pts.length-1];if(e&&u>=1)footballPanels(s,e[0],e[1],Math.max(8,kAt(c,E)*.11),{rot:i,key:K,shadow:B,seed:5+i});}}
  // "round the wall" (under the players): where it was heading (straight on, dashed) and the real bend, round the wall end and inside the post
  const cv=sm(tR-.25,tR+.6,t);
  if(cv>.02){const str=new Path2D(),n=18;for(let i=0;i<n;i+=2){const a=pr(c,straight(k,i/n*k.D*cv)),b=pr(c,straight(k,(i+1)/n*k.D*cv));if(a&&b)str.addPath(ribbon([a,b],Math.max(11,kAt(c,straight(k,i/n*k.D))*.2),{taper:.25,wobble:0}));}
   s.knockout(str);s.stroke(K,str,2.4,.9);
   const pts=partial(pathPts(c,k,0,k.fly,40),cv),w=Math.max(15,kAt(c,[-12,1.8,3.5])*.26);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95);}}
  play(s,c,k,Math.max(tau,-.5),tp,tpp,{it:tt,ready:1,smear:true,minBall:14});
  // "Wrap your foot round the ball": the boot's path (red) wrapping round the right-back of the ball, a yellow ring on the ball
  const wr=sm(tW-.1,tW+.6,t,easeOut)*(1-sm(tB+.3,tB+.8,t));
  if(wr>.02){const B0=k.B0,pts:V3[]=[];for(let i=0;i<=12;i++){const a=Math.PI*(.72+.85*i/12*wr),r=.42;pts.push([B0[0]+r*(Math.cos(a)*DIR[0]+Math.sin(a)*RIGHT[0]),.13,B0[2]+r*(Math.cos(a)*DIR[1]+Math.sin(a)*RIGHT[1])]);}
   arrow3(s,c,pts,Math.max(7,kAt(c,B0)*.05),R,.95);
   const ring:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[B0[0]+Math.cos(a)*.2,.11+Math.sin(a)*.2*.2,B0[2]+Math.sin(a)*.2]);if(p)ring.push(p);}
   if(ring.length>30){const rr=ribbon(ring,Math.max(5,kAt(c,B0)*.03),{close:true,seed:43,taper:0,wobble:1});s.knockout(rr,.9*wr);s.fill(Y,rr,.95*wr);}}
  // "it bends": two spin arrows round the ball's equator (counter-clockwise from above: its right side goes forward → it bends left)
  const sp=sm(tB-.15,tB+.35,t,easeOutBack)*(1-sm(tR+.3,tR+.8,t));
  if(sp>.02){const P=ballAt(k,Math.max(0,Math.min(tau,k.fly))),rad=.11*2.3,rot=spinAt(k,Math.max(0,tau))*.15;for(const j of[0,1]){const pts:V3[]=[];for(let i=0;i<=10;i++){const th=rot+j*Math.PI+i/10*Math.PI*.72*sp;pts.push([P[0]+Math.cos(th)*rad,P[1],P[2]-Math.sin(th)*rad]);}
   arrow3(s,c,pts,Math.max(5,kAt(c,P)*.035),Y,.95);}}
  // the wall end the ball goes round: a red bracket over the last man's shoulder
  const we=sm(tR,tR+.5,t,easeOutBack);
  if(we>.02){const z=k.wall[k.wall.length-1]+.35,P:V3=[k.wallX,2.5,z];arrow3(s,c,[[k.wallX,3.3,z-1.4],[k.wallX,3.3,z-.4],add3(P,[0,.3*we,.5*we])],Math.max(8,kAt(c,P)*.15),R,.95*we);}
 },
 still:9,
};

const film:RisoStory={
 id:'rice-real-madrid-2025',format:'11v11',title:"Rice's two free kicks v Real Madrid",
 theme:'Free kicks: practise, then wrap your foot round the ball so it bends round the wall',
 ageNote:'Arsenal 3–0 Real Madrid, Champions League quarter-final first leg, Emirates Stadium, London, 8 April 2025. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little bender — a yellow path that heads right and bends back left, with a spinning ball on its tip. Reduced motion: the still bend. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+120*k-190*k*k,y-240*k+60*k*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],34,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
