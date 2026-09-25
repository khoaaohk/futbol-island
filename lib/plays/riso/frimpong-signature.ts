/** Jeremie Frimpong's SIGNATURE film, "the rocket run down the right": his debut goal for Liverpool in the 2025 FA Community Shield,
 * Crystal Palace 2–2 Liverpool (Palace won 3–2 on penalties), Wembley Stadium, London, Sunday 10 August 2025, 21st minute (1–1 → 1–2).
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1
 * reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the rocket run down the right", template overlap_run, side right; lesson:
 * "Use your speed to get beyond the defender, then look up before you cross"). This goal is the best-documented single example I could
 * read of exactly that trait: the right-back runs at the opposing wing-back, beats him, gets into the box on the right and delivers what
 * "looked like a cross" — BBC Sport: "right-back Jeremie Frimpong jinked into the Palace box and chipped what looked like a cross over
 * Henderson, the ball hitting the far post and bouncing in"; "the confidence and impudence that Frimpong showed in beating Palace
 * full-back Tyrick Mitchell ... whether Frimpong meant it or not". The brief's first candidate (his 90+5' goal in Leverkusen 3–0 Bayern,
 * 10 Feb 2024) is confirmed as a fact (Wikipedia season article: BayArena, Stanišić 18', Grimaldo 50', Frimpong 90+5') but I could not
 * read ANY written description of its build-up within the research budget (a Guardian URL 404'd, DuckDuckGo returned a bot wall, Bing
 * returned nothing relevant, ESPN's API refused), so that goal is not used.
 *
 * SOURCES (read 23 Sep 2026 with curl, generic User-Agent, cached in the build scratchpad films/src-cache/):
 *  - BBC Sport live page + match report, Charlotte Coates, "Crystal Palace beat Liverpool on penalties to win Community Shield"
 *    (10 Aug 2025) https://www.bbc.com/sport/football/live/cy7y0p1p7ezt  (bbc-live-cpfc-lfc-shield-2025.html/.txt): key events, assists,
 *    line-ups and formations, the report text quoted above, "sun-drenched Wembley", attendance 82,645, the 20th-minute Jota tribute.
 *  - Wikipedia, "Jeremie Frimpong" (raw; wiki-jeremie-frimpong.txt): right-back / right wing-back, height 1.71 m, Liverpool debut in the
 *    Community Shield "scoring a lofted chip goal in a 2–2 draw in normal time, with Liverpool eventually losing on penalties".
 *  - Wikipedia, "2023–24 Bayer 04 Leverkusen season" (raw; wiki-2023-24-leverkusen-season.txt): the Bayern 3–0 facts above (not used).
 * CONFIRMED: Wembley, 10 Aug 2025, Community Shield; Ekitiké 4' (assist Wirtz), Mateta pen 17', Frimpong 21' (assist Szoboszlai), Sarr
 * 77'; Palace won the shoot-out 3–2. Frimpong was the right-back (No. 30); he beat Tyrick Mitchell (Palace's left wing-back, No. 3), jinked
 * into the box and chipped a ball that "looked like a cross" over Dean Henderson (No. 1); it hit the FAR post and went in. Line-ups (BBC):
 * Palace 3-4-2-1 — Henderson 1; Richards 26, Lacroix 5, Guéhi 6; Muñoz 2, Wharton 20, Kamada 18, Mitchell 3; Sarr 7, Eze 10; Mateta 14.
 * Liverpool 4-2-3-1 — Alisson 1; Frimpong 30, Konaté 5, van Dijk 4, Kerkez 6; Jones 17, Szoboszlai 8; Salah 11, Wirtz 7, Gakpo 18;
 * Ekitiké 22. A sunny afternoon (15:00 kick-off, "sun-drenched Wembley").
 * INFERRED (illustrative reconstruction, never narrated as fact): every position, run, speed and timing in metres and seconds; the shape of
 * Szoboszlai's pass (drawn as a ball out to the right touchline) and of the beat past Mitchell (drawn as a feint outside and a quick cut
 * inside, Mitchell lunging the wrong way); that Frimpong struck it with his RIGHT foot (the natural foot from the right side; no source
 * names it); the ball's flight (a looping ≈ 3 m-high chip, ≈ 1.35 s) and Henderson's back-pedal and late reach; where the other players
 * were (Ekitiké and Salah drawn arriving in the box, Palace's back three dropping); which end Liverpool attacked and which touchline the
 * main camera was on (drawn: attacking left to right, Frimpong's wing the FAR side); THE KITS — not confirmed by any source I could
 * read: Liverpool drawn in their red home kit, Palace in a white change strip with red-and-blue trim so the two sides read apart, Henderson
 * in yellow — so the narration never names a kit colour; the fans' ends; hair and builds (Frimpong short and quick, 1.71 m, curly hair);
 * the stadium's look (a bowl of red seats, the arch over the far stand); the celebration; the camera positions.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main camera in REAL TIME, panning with the ball: Szoboszlai's pass, the
 * sprint down the right, the beat past Mitchell, the chip in off the far post; ch2 = the slow-motion replay from a LOW touchline camera
 * behind Frimpong on the right wing: the pass, the burst of speed (speed lines), the jink inside, Mitchell left behind; ch3 = the second
 * replay from BEHIND THE GOAL by the far post: the chip lifted over Henderson, "cross or shot?", the far post and in, then live for the
 * celebration; ch4 = the lesson: use your speed (his run arrowed down the wing), get past the defender (a ring on Mitchell), look up (a
 * ring on his eyes and a dashed sight line), before you cross (a ring on the boot), pick your target (rings at the far post and on the
 * arriving team-mates).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down
 * to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, one continuous silhouette, `prev`
 * secondary motion, motionSmear on the sprint, the jink, the lunge and the chip); small wide-shot figures and every figure inside a passage
 * print at `low` detail. Handedness: the world is right-handed (x toward the goal Palace defend, y up, +z = Liverpool's right = the far
 * touchline from the main camera), athlete.ts's own convention, so foot:'r' is the right foot. Inks: yellow, red, blue, navy. Everything
 * is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperTip,backpedal,lunge,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/frimpong-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/frimpong-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). Every cue starts with a plain
 * word (Kokoro splits contractions and hyphenated words). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The run, live',text:'Wembley, August 2025. Liverpool play Crystal Palace. Jeremie Frimpong races down the right wing. He skips past Tyrick Mitchell, into the box... and his chip floats in!',tail:2.6,
  cues:['Wembley','Liverpool play','Jeremie Frimpong','races down','skips past','into the box','his chip','floats in']},
 {label:'The rocket run',text:'Watch again. Szoboszlai slips it to him and he flies. One quick jink inside, and the defender is left behind.',tail:1.2,
  cues:['Watch again','Szoboszlai','he flies','quick jink','left behind']},
 {label:'Cross or shot?',text:'Then he lifts it over Dean Henderson. Was it a cross or a shot? It hits the far post and drops in!',tail:2.2,
  cues:['Then he lifts','Dean Henderson','cross or','hits the far post','drops in']},
 {label:'The secret',text:'Your turn! Use your speed to get past the defender. Then look up before you cross, and pick your target.',tail:2.0,
  cues:['Your turn','Use your speed','past the defender','look up','before you cross','pick your target']},
];
import timingJson from '../../../public/plays/narration/frimpong-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('frimpong: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('frimpong: no cue '+w);return c.at;};
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
const DEG=Math.PI/180;
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Palace defend is x = 0 (Liverpool attack +x), goal centre z = 0, +z = Liverpool's right (the far side from the main camera). */
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

// ---------------------------------------------------------------- Wembley on a sunny August afternoon: a bowl of red seats in two tiers, the arch, a full house
/** stand planes (a along, b up the rake 0..1): 0 the main-camera side (z<0), 1 behind this goal, 2 the far side behind Frimpong's wing
 * (z>0, the arch above it), 3 the far end. Wembley's bowl sits a little back from the pitch. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122,17,a),1.2+30*b,-44-34*b],
 (a,b)=>[10+30*b,1.2+30*b,lerp(-60,60,a)],
 (a,b)=>[lerp(17,-122,a),1.2+30*b,44+34*b],
 (a,b)=>[-115-30*b,1.2+30*b,lerp(60,-60,a)],
];
const STAND_COLS=[96,64,96,64],STAND_ROWS=12,TIERS=[.42,.46];
/** a full house (82,645); the Palace end behind this goal, the Liverpool end opposite, the side stands split (all inferred) */
const OCC=[.82,.82,.82,.82];
const FAN=(si:number,a:number)=>si===1?'cp':si===3?'lfc':(si===0?a>.5:a<.5)?'cp':'lfc';
/** the arch: a 315 m span rising 133 m, leaning back over the far stand */
const ARCH:V3[]=Array.from({length:25},(_,i)=>{const u=i/24,y=133*(1-Math.pow(2*u-1,2));return[-52.5+(u-.5)*315,y,90+y*Math.tan(22*DEG)];});
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a clear summer sky: a light blue field, a deeper band high up
 s.field(B,.24,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-1e4],[1e4,hz[1]-1e4],[1e4,hz[1]-700],[-1e4,hz[1]-560]],true),.2);
 // the arch (a paper tube with a navy edge) behind the far roof
 if(which.includes(2)){const pts:Pt[]=[];let ok=true;for(const p of ARCH){const q=toCam(c,p);if(q[2]<8){ok=false;break;}pts.push(scr(c,q));}
  if(ok){const w=clamp(7.4*kAt(c,ARCH[12]),3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.9);s.stroke(K,tube,Math.max(1.4,w*.12),.55);}}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of TIERS)addPoly(tier,polyP(c,[S(0,b),S(1,b),S(1,b+.04),S(0,b+.04)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.8),[0,9,0]),add3(S(0,.8),[0,9,0])]));
  seg3(c,add3(S(0,.8),[0,8.8,0]),add3(S(1,.8),[0,8.8,0]),.5,edge);}
 // Wembley's red seats, the tier fronts in navy
 s.knockout(planes);s.fill(R,planes,.5);s.tone(K,planes,.14);s.tone(K,tier,.6);
 // the crowd: Palace fans in red and blue with white; Liverpool fans in red with white
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let n=0;
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIERS.some(w=>b>w-.03&&b<w+.07))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6),a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols;if(h>OCC[si])continue;
   const P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.1*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hh=hash(i*7+j*13+si,9),ink=FAN(si,a)==='cp'?(hh<.4?2:hh<.75?1:0):(hh<.65?1:0);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);n++;}}}
 if(n){s.knockout(inks[0],.72);s.knockout(inks[1],.6);s.fill(R,inks[1],.95);s.knockout(inks[2],.6);s.fill(B,inks[2],.95);}
 s.knockout(roof);s.fill(K,roof,.85);s.knockout(edge,.8);
 if(flash>0){const p=new Path2D(),m=Math.round(16*flash);for(let i=0;i<m;i++){const r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[i%which.length],q=pr(c,STANDS[si](.1+.8*r2,.1+.6*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;shake?:number}={}){
 const g=polyP(c,[[-120,0,-46],[16,0,-46],[16,0,46],[-120,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([5,0,-38],[5,0,38]);board([-110,0,-38],[5,0,-38]);board([-110,0,38],[5,0,38]);
 for(let k=0;k<12;k++){const z=-35+k*6;addPoly(pn,polyP(c,[[4.9,.25,z],[4.9,.25,z+3.2],[4.9,.66,z+3.2],[4.9,.66,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.2;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.3,.25,zz],[x+3.3,.66,zz],[x,.66,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.85);
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
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,o.bulge??0,o.shake??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out where the ball went in (z ≈ BZ); shake wobbles
 * the far post (z = −3.66) after the ball hits it */
const BZ=-2.4;
function goal3(s:Sheet,c:Cam,bulge:number,shake:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-BZ)/1.5,2));
 const zs=[z0,BZ,0,1.5,z1];
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
 const wob=shake*.05,fr=new Path2D(),fo=new Path2D();
 const frame3=(w:number,out:Path2D)=>{seg3(c,[X,0,z0],[X+wob,H,z0+wob*.5],w,out);seg3(c,[X,0,z1],[X,H,z1],w,out);seg3(c,[X+wob,H,z0-.06],[X,H,z1+.06],w,out);};
 frame3(.12,fr);frame3(.2,fo);s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Liverpool: red home shirts, shorts and socks, white numbers (inferred, see the header). Palace: a white change strip with red-and-blue
 * trim (inferred); Henderson in yellow (inferred). */
const lfc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[R,.95],socks:[R,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const palace=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[B,.9],numberInk:R,hairStyle:'short',...o});
/** Jeremie Frimpong: 1.71 m (confirmed), a light, quick frame, curly dark hair */
const FRIM_B={height:1.71,bulk:.95,thighs:1.06};
const FRIM_ST=lfc({number:30,skin:SKIN_D,hair:K,hairStyle:'curly',build:FRIM_B,seed:30});
const MITCH_B={height:1.75,bulk:1};
const MITCH_ST=palace({number:3,skin:SKIN_D,hair:K,build:MITCH_B,seed:3});
const HENDERSON_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[R,.45],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.88,bulk:1.02},seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Frimpong's chip)
/** the chip: from the right side of the box, over Henderson, onto the inside of the FAR post (z = −3.66) at τ = TC */
const TC=1.35;
const J_BALL:V3=[-11,.11,16.8];
const POST_HIT:V3=[.04,1.3,-3.46];
const VY=(POST_HIT[1]-J_BALL[1]+4.9*TC*TC)/TC;
/** a looping, floated ball (what "looked like a cross"): ≈ 3 m at its peak, bending a touch toward the goal as it drops */
function chipAt(u:number):V3{const tt=u*TC,e=u,bend=Math.sin(Math.PI*u);
 return[lerp(J_BALL[0],POST_HIT[0],e)+bend*.7,J_BALL[1]+VY*tt-4.9*tt*tt,lerp(J_BALL[2],POST_HIT[2],e)-bend*.35];}
/** off the post and in: a sharp kick into the side netting, then it drops and settles */
const T_NET=TC+.22,NET_HIT:V3=[1.5,.6,-2.3],REST:V3=[1.15,.11,-1.9];
const spinAt=(tau:number)=>tau<=0?TAU*1.6*tau:TAU*3*Math.min(tau,TC)+TAU*1.2*Math.max(0,tau-TC);
const bulgeAt=(tau:number)=>tau<T_NET-.03?0:Math.exp(-(tau-T_NET+.03)*2.4)*(1+.3*Math.sin((tau-T_NET)*14));
const shakeAt=(tau:number)=>tau<TC?0:Math.exp(-(tau-TC)*5)*Math.sin((tau-TC)*44);

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a cumulative-distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-9,T_MAX=10,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
const CYCLE_M=4.4;
const TABS=new Map<Path,number[]>();
function tabOf(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}

// ---------------------------------------------------------------- Frimpong: the ball out wide, the sprint, the jink inside past Mitchell, look up, the RIGHT-footed chip
const OSD=.95;
/** his body at the chip: open, facing between the far post and the goal */
const CHIP_DIR:[number,number]=(()=>{const a=Math.atan2(POST_HIT[2]-J_BALL[2],POST_HIT[0]-J_BALL[0])+.28;return[Math.cos(a),Math.sin(a)];})();
const YAW_F=yawTo(0,0,CHIP_DIR[0],CHIP_DIR[1]);
/** Frimpong's pelvis at contact so the RIGHT boot meets the ball (solved once) */
const PF:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.6}),FRIM_B,{x:0,z:0,yaw:YAW_F});const tx=J_BALL[0]-CHIP_DIR[0]*.1,tz=J_BALL[2]-CHIP_DIR[1]*.1;return[tx-sk.rToe[0],tz-sk.rToe[2]];})();
/** receives at T_RX, sprints (≈ 8 m/s), feints outside then cuts inside at T_JINK, into the box, plants, chips */
const T_PASS=-4.4,T_RX=-3.4,T_JINK=-1.95;
const FRIM_PATH:Path=[[-9,-47,31.4],[-6.5,-42.5,31],[T_PASS,-35.6,29.6],[T_RX,-31.2,28.6],[-2.6,-25.6,27.6],[T_JINK,-21.3,26.8],[-1.55,-18.9,24.7],[-1,-15.8,21.6],[-.5,-13.6,19.1],[0,PF[0],PF[1]],[.6,PF[0]+CHIP_DIR[0]*1.2,PF[1]+CHIP_DIR[1]*1.2]];
/** the celebration: he wheels away toward the corner by the Liverpool fans on the far side */
const T_CEL=TC+.35;
const CEL_PATH:Path=[[T_CEL,PF[0]+CHIP_DIR[0]*1.6,PF[1]+CHIP_DIR[1]*1.6],[T_CEL+.8,-8.4,19.5],[T_CEL+1.8,-6,25],[T_CEL+3,-3.6,30],[T_CEL+4.2,-3,31.6]];
/** Szoboszlai: the pass out to the right from the inside-right channel */
const SZ_PATH:Path=[[-9,-44,11],[-6,-40.6,12.8],[T_PASS,-37.9,14],[-3,-35.2,15],[0,-27.5,15.5],[3,-22,14],[6,-20,13]];
const SZ_BALL:V3=(()=>{const[x,z]=pathAt(SZ_PATH,T_PASS);return[x+.55,.11,z+.35];})();
/** the ball at his feet while he runs with it: pushed well ahead at pace (a "rocket run"), touched on the stride */
const YAW_PASS=(()=>{const[x,z]=pathAt(FRIM_PATH,T_RX);return yawTo(SZ_BALL[0],SZ_BALL[2],x,z);})();
function carryAt(tau:number):V3{const[x,z]=pathAt(FRIM_PATH,tau),a=pathAt(FRIM_PATH,tau+.15),d=Math.hypot(a[0]-x,a[1]-z)||1,touch=.6+.75*Math.abs(Math.sin((tau-T_RX)*3.4));return[x+(a[0]-x)/d*touch,.11,z+(a[1]-z)/d*touch];}
function szBallAt(tau:number):V3{const[x,z]=pathAt(SZ_PATH,tau);const[x0,z0]=pathAt(SZ_PATH,T_PASS);return[SZ_BALL[0]+x-x0,.11,SZ_BALL[2]+z-z0];}
function ballAt(tau:number):V3{
 if(tau<T_PASS)return szBallAt(tau);
 if(tau<T_RX)return mix3(SZ_BALL,carryAt(T_RX),easeOut(clamp((tau-T_PASS)/(T_RX-T_PASS)))*.2+.8*clamp((tau-T_PASS)/(T_RX-T_PASS)));
 if(tau<-.6)return carryAt(tau);
 if(tau<0)return mix3(carryAt(-.6),J_BALL,easeOut(clamp((tau+.6)/.55)));
 if(tau<TC)return chipAt(tau/TC);
 if(tau<T_NET)return mix3(POST_HIT,NET_HIT,easeOut((tau-TC)/(T_NET-TC)));
 const u=clamp((tau-T_NET)/.5),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.08*Math.abs(Math.sin((tau-T_NET-.5)*9))*Math.exp(-(tau-T_NET-.5)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
/** "look up": his head comes up to the box a beat before the chip */
const lookW=(tau:number)=>sm(-.95,-.6,tau)*(1-sm(-.22,-.04,tau));
/** the jink: the body dips outside (feint) then leans hard inside as the right foot pushes off */
const feintW=(tau:number)=>sm(T_JINK-.45,T_JINK-.2,tau)*(1-sm(T_JINK-.15,T_JINK,tau));
const cutW=(tau:number)=>sm(T_JINK-.12,T_JINK+.05,tau)*(1-sm(T_JINK+.3,T_JINK+.6,tau));
const ARMS_OUT=posed({lShA:112,rShA:108,lShF:14,rShF:18,lElb:14,rElb:18,lHand:1,rHand:1,neckP:-30,lean:-8,pitch:-3,lHipF:12,rHipF:-4,lKnee:16,rKnee:20,lHipA:8,rHipA:8});
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
function frimPose(tau:number,it:number):Pose{
 if(tau>=T_CEL){const s=distAt(tabOf(CEL_PATH),tau),sp=speedAt(CEL_PATH,tau);
  let p=blendPose(strike(1,{foot:'r',power:.6}),celebrate(s/4.2,{kind:'run'}),sm(T_CEL,T_CEL+.35,tau));
  if(tau>T_CEL+3)p=blendPose(p,celebrate(it*.9,{kind:'arms'}),clamp(1-sp/3)*sm(T_CEL+3,T_CEL+3.8,tau));
  return p;}
 const sp=speedAt(FRIM_PATH,tau),ph=distAt(tabOf(FRIM_PATH),tau)/CYCLE_M+.2;
 let p=blendPose(READY,runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 // carrying it at pace: eyes flick down to the ball between strides (chin down a little)
 if(tau>T_RX-.2&&tau<-.6)p.neckP+=10*DEG*sm(T_RX-.2,T_RX+.2,tau);
 // the feint (dip outside, to his right) then the cut (lean hard inside, to his left)
 const f=feintW(tau),c=cutW(tau);
 if(f>0){p.roll+=9*DEG*f;p.bend+=8*DEG*f;p.lHipA+=12*DEG*f;}
 if(c>0){p.roll-=16*DEG*c;p.bend-=10*DEG*c;p.rHipA+=24*DEG*c;p.rKnee+=14*DEG*c;p.lShA+=26*DEG*c;p.twist-=8*DEG*c;}
 // look up: chin up, head turned to the box (the far post and the runners) a beat before the chip
 const lw=lookW(tau);if(lw>0){const pl=frimPlace(tau);p.neckP-=22*DEG*lw;p.neckY+=clamp(wrap(yawTo(pl.x??0,pl.z??0,-3,-1)-(pl.yaw??0)),-1.2,1.2)*.6*lw;}
 // the chip (right foot, soft)
 const us=STRIKE_CONTACT+tau/OSD;
 if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot:'r',power:.6}),w);}
 return p;
}
function frimPlace(tau:number):Place{
 if(tau>=T_CEL){const[x,z]=pathAt(CEL_PATH,tau),a=pathAt(CEL_PATH,tau+.1),sp=speedAt(CEL_PATH,tau);
  const run=yawTo(x,z,a[0],a[1]),toFans=yawTo(x,z,-10,48);return{x,z,yaw:lerpAng(lerpAng(YAW_F,run,sm(T_CEL,T_CEL+.5,tau)),toFans,clamp(1-sp/2.5)*sm(T_CEL+2.6,T_CEL+3.6,tau))};}
 const[x,z]=pathAt(FRIM_PATH,tau),a=pathAt(FRIM_PATH,tau+.1),b=ballAt(tau);let yaw=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(.8,2,speedAt(FRIM_PATH,tau)));
 const us=STRIKE_CONTACT+tau/OSD;if(us>.05){const w=sm(.05,.2,us);yaw=lerpAng(yaw,YAW_F,w);}
 return{x,z,yaw};
}

// ---------------------------------------------------------------- everyone else
type Role='run'|'mitch'|'keeper'|'passer'|'watch';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;lfc:boolean};
/** Mitchell: jockeys back as Frimpong comes at him, is sold the feint and lunges OUTSIDE, then turns and chases */
const MITCH_PATH:Path=[[-9,-11.5,23.5],[-6,-12.6,24],[T_PASS,-14.6,24.8],[T_RX,-16.2,25.4],[-2.6,-17.6,25.9],[T_JINK,-18.5,26.3],[-1.6,-18.7,26.9],[-1.25,-18.6,26.8],[-.7,-16.8,24.4],[0,-14.6,22],[1,-12.6,20.2],[3,-11.6,19.2]];
const T_LUNGE=T_JINK-.25;
const ACTORS:Actor[]=[
 {name:'Mitchell',role:'mitch',st:MITCH_ST,path:MITCH_PATH,phase:.45,lfc:false},
 {name:'Henderson',role:'keeper',st:HENDERSON_ST,path:[[-9,-3.6,3.8],[-2,-3.8,3.6],[0,-3.4,3],[.5,-3.1,2.2],[1.1,-2.9,1.4],[3,-2.7,1.2]],phase:0,lfc:false},
 {name:'Szoboszlai',role:'passer',st:lfc({number:8,hair:[Y,.7],build:{height:1.86,bulk:1},seed:8}),path:SZ_PATH,phase:.3,lfc:true},
 {name:'Ekitike',role:'run',st:lfc({number:22,skin:SKIN_D,build:{height:1.9,bulk:.93},seed:22}),path:[[-9,-24,1],[-4,-15,3],[-1.5,-10.4,4.2],[0,-7.4,4],[1.4,-5.4,2.6],[4,-5,2]],phase:.55,lfc:true},
 {name:'Salah',role:'run',st:lfc({number:11,skin:SKIN_M,hairStyle:'curly',build:{height:1.75},seed:11}),path:[[-9,-26,-2],[-4,-17,-3.4],[-1.5,-12,-4.6],[0,-9,-5],[1.4,-6,-4.6],[4,-5.2,-4]],phase:.15,lfc:true},
 {name:'Gakpo',role:'run',st:lfc({number:18,skin:SKIN_M,build:{height:1.93,bulk:.96},seed:18}),path:[[-9,-32,-14],[-4,-24,-11],[0,-17,-8.5],[2,-15,-7.5],[5,-14,-7]],phase:.8,lfc:true},
 {name:'Wirtz',role:'run',st:lfc({number:7,hair:[R,.45],build:{height:1.77},seed:7}),path:[[-9,-34,5],[-4,-27,8],[0,-20.5,10.5],[2,-18,11],[5,-17,11]],phase:.05,lfc:true},
 {name:'Jones',role:'run',st:lfc({number:17,hair:[R,.5],build:{height:1.85},seed:17}),path:[[-9,-48,2],[-4,-42,4],[0,-35,6],[3,-31,7]],phase:.65,lfc:true},
 {name:'Guehi',role:'run',st:palace({number:6,skin:SKIN_D,build:{height:1.82,bulk:1.03},seed:6}),path:[[-9,-14,9],[-4,-11.5,9.4],[-1.5,-9.6,9.2],[0,-8.4,8],[1.4,-7,6.6],[4,-6.6,6]],phase:.35,lfc:false},
 {name:'Lacroix',role:'watch',st:palace({number:5,skin:SKIN_D,build:{height:1.9,bulk:1.05},seed:5}),path:[[-9,-14,1.5],[-4,-11,2.6],[-1.5,-9,3.2],[0,-7.8,3],[1.4,-6.2,2.2],[4,-5.8,1.8]],phase:.7,lfc:false},
 {name:'Richards',role:'watch',st:palace({number:26,skin:SKIN_D,build:{height:1.88},seed:26}),path:[[-9,-15,-6],[-4,-12,-5.6],[-1.5,-10,-5.2],[0,-9.4,-5.4],[1.4,-7.4,-5],[4,-6.8,-4.6]],phase:.9,lfc:false},
 {name:'Munoz',role:'run',st:palace({number:2,skin:SKIN_M,build:{height:1.75},seed:2}),path:[[-9,-26,-20],[-4,-18,-15],[0,-12,-11.5],[2,-10.4,-10],[5,-10,-9.6]],phase:.25,lfc:false},
 {name:'Wharton',role:'run',st:palace({number:20,hair:[R,.4],build:{height:1.8},seed:20}),path:[[-9,-30,12],[-4,-24,13.5],[-1.5,-19,15],[0,-16.4,15.6],[2,-14.4,15],[5,-14,14.4]],phase:.5,lfc:false},
];
/** one actor's pose + place at τ (it = idle clock). Liverpool celebrate after the goal; Palace slump. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(tabOf(a.path),tau)/CYCLE_M+a.phase;
 const br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='passer'){const us=STRIKE_CONTACT+(tau-T_PASS)/OSD;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot:'r',power:.7}),w);yaw=lerpAng(yaw,YAW_PASS,w);}}
 if(a.role==='mitch'){
  // jockeying: a low backpedal facing Frimpong, then the lunge to the OUTSIDE (his left, +z), then he turns and chases
  const f=frimPlace(tau),face=yawTo(x,z,f.x??0,f.z??0);
  if(tau<T_LUNGE+.8){const bp=backpedal(it*2.2+a.phase);p=blendPose(p,bp,sm(T_RX-.4,T_RX,tau)*(1-sm(T_LUNGE-.1,T_LUNGE+.05,tau)));yaw=lerpAng(yaw,face,sm(T_RX-.6,T_RX,tau));}
  const lu=clamp((tau-T_LUNGE)/.75);if(tau>T_LUNGE-.1&&tau<T_LUNGE+1.1){const w=sm(T_LUNGE-.1,T_LUNGE+.05,tau)*(1-sm(T_LUNGE+.75,T_LUNGE+1.1,tau));p=blendPose(p,lunge(lu,{side:'l'}),w);}
  if(tau>T_LUNGE+.6)yaw=lerpAng(face,heading,sm(T_LUNGE+.6,T_LUNGE+1.1,tau));
  if(tau>T_NET+.2)p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.role==='keeper'){
  let kp=keeperSet(it*1.3);
  // Henderson comes across to his near post, then back-pedals and stretches as the chip loops over him
  const u=clamp((tau-.45)/1.05);if(tau>.4){kp=blendPose(kp,keeperTip(u,{hand:'l'}),sm(.4,.55,tau)*(1-sm(TC+1.6,TC+2.4,tau)));}
  if(tau>TC+1.6)kp=blendPose(kp,SLUMP,sm(TC+1.6,TC+2.4,tau)*.6);
  const look=tau<0?ballAt(tau):ballAt(Math.min(tau,TC-.4));
  return{pose:kp,place:{x,z,yaw:yawTo(x,z,look[0],look[2])}};
 }
 if(a.role==='watch'){p=blendPose(p,READY,.4);if(tau>T_NET+.2)p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.7);return{pose:p,place:{x,z,yaw:toBall}};}
 if(tau>T_NET+.2&&sp<1.2){if(a.lfc)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);}
 if(tau>T_NET&&sp<1.2){const r=frimPlace(tau);yaw=lerpAng(yaw,yawTo(x,z,r.x??0,r.z??0),.8);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hems trail), smear = halftone echo + speed lines on fast limbs (the sprint, the jink, the lunge, the chip). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>T_PASS&&tau<T_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=frimPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=frimPose(tp,e.it),prev={pose:frimPose(tpPrev,e.it-1/12),place:frimPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(FRIM_ST,d,true),pl,prev,!!e.smear&&((tp>T_RX&&tp<.5)||(tp>T_CEL&&tp<T_CEL+2.4)));}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='mitch'||a.role==='keeper'),cur.place,prev,!!e.smear&&((a.role==='mitch'&&tp>T_LUNGE-.2&&tp<T_LUNGE+.8)||(a.role==='keeper'&&tp>.6&&tp<TC+.3)));}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5+2.5,Math.min(1.4,y/5)*.6+.6,z/5];}
const fxz=(tau:number):V3=>{const p=frimPlace(tau);return[p.x??0,0,p.z??0];};
const mxz=(tau:number):V3=>{const p=pathAt(MITCH_PATH,tau);return[p[0],0,p[1]];};
/** a projected ring on the view plane around a 3D point (radius in metres) */
function ring3(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){const q=pr(c,P);if(!q||u<=.02)return;const k=kAt(c,P),r=rm*k*(.7+.3*u),pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,k*.035),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a trail on the grass along Frimpong's run between two τ (a yellow ribbon, optionally dashed) */
function runTrail(s:Sheet,c:Cam,ta:number,tb:number,u:number,w:number,ink:string,dashed=false){
 if(u<=.02||tb<=ta)return;const pts:Pt[]=[];for(let i=0;i<=22;i++){const q=pr(c,add3(fxz(lerp(ta,tb,i/22)),[0,.03,0]));if(q)pts.push(q);}if(pts.length<3)return;
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<8;i++)gaps.push([(i+.55)/8,(i+.9)/8]);
 const rb=ribbon(partial(pts,u),w,{taper:.4,pressure:.2,wobble:.6,gaps});s.knockout(rb,.8);s.fill(ink,rb,.95);}
/** the post strike: a spark on the far post */
function postSpark(s:Sheet,c:Cam,tau:number){const hit=sm(TC-.02,TC+.04,tau)*(1-sm(TC+.12,TC+.35,tau));if(hit<=0)return;const q=pr(c,POST_HIT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,POST_HIT)*.6)*hit,{n:9,seed:23,width:Math.max(5,kAt(c,POST_HIT)*.04)});}

// ---------------------------------------------------------------- 1 · live: the high main camera, real time, panning with the ball
/** real time; the chip leaves his boot on "his chip" */
const tS1=()=>CUE(0,'his chip')+.1;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-31,19,-46];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-38,0,18],fov:22})],
  [CUE(0,'Jeremie Frimpong')-.6,1.4,()=>({P:P1,T:add3(panTarget(tau),[1,0,-1]),fov:8.5})],
  [CUE(0,'skips past')-.4,1,()=>({P:P1,T:add3(panTarget(tau),[1.5,0,-1.5]),fov:7.5})],
  [tS1()-.2,1,()=>({P:P1,T:mix3(panTarget(tau),[-4,1.2,4],.5),fov:10})],
  [tS1()+TC+.3,1.2,()=>({P:P1,T:add3(fxz(tau),[0,1,0]),fov:7.5})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,[2,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau),shake:shakeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
  postSpark(s,c,tau);
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9.5,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low touchline camera behind Frimpong: the pass, the burst, the jink, Mitchell left behind
const tau2=(t:number)=>key(t,mono([[0,-5],[CUE(1,'Szoboszlai'),T_PASS-.3],[CUE(1,'he flies')+.2,T_RX+.1],[CUE(1,'quick jink'),T_JINK-.35],[CUE(1,'left behind')+.3,T_JINK+.55],[SECS(1),-.75]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),f=add3(fxz(tau),[0,1,0]);
 return plan(t,[
  [0,0,()=>{const q=pathAt(SZ_PATH,tau);return{P:add3(f,[-10,1,7]),T:mix3([q[0],1,q[1]],f,.6),fov:34};}],
  [CUE(1,'he flies')-.4,1,()=>({P:add3(f,[-9,.8,6.5]),T:add3(f,[4,-.1,-1.5]),fov:26})],
  [CUE(1,'quick jink')-.5,1,()=>({P:add3(f,[-7,.6,5]),T:mix3(f,add3(mxz(tau),[0,1,0]),.5),fov:24})],
  [CUE(1,'left behind')-.1,1,()=>({P:add3(f,[-7.5,.9,5.5]),T:add3(f,[2.5,0,-1.5]),fov:26})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tF=CUE(1,'he flies'),tJ=CUE(1,'quick jink'),tL=CUE(1,'left behind');
  stadium(s,c,t,[1,0]);
  ground(s,c);
  // "quick jink inside": the cut drawn on the grass as it happens (a yellow dashed trail)
  const jw=sm(tJ-.2,tJ+.3,t);if(jw>.02)runTrail(s,c,T_JINK-.5,Math.min(tp,T_JINK+.9),1,Math.max(6,kAt(c,fxz(tau))*.08),Y,true);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06)});
  // "he flies": speed lines streaming off him
  const fl=sm(tF-.1,tF+.3,t)*(1-sm(tJ-.3,tJ,t));if(fl>.02){const f=add3(fxz(tp),[0,1,0]),a=pr(c,f),b=pr(c,add3(fxz(tp-.12),[0,1,0]));if(a&&b){const k=kAt(c,f);speedLines(s,K,a[0],a[1],Math.atan2(a[1]-b[1],a[0]-b[0]),{n:6,seed:31,len:k*2.6*fl,spread:k*.9,width:Math.max(3,k*.05),cov:.75});}}
  // "left behind": a red ring on Mitchell as he is beaten
  const lb=sm(tL-.2,tL+.2,t,easeOutBack);if(lb>.02)ring3(s,c,add3(mxz(tp),[0,1,0]),.9,lb,R,17);
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(fxz(tau2(t)),[0,1,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:5.5,
};

// ---------------------------------------------------------------- 3 · second replay from behind the goal by the far post; then live for the celebration
const tau3=(t:number)=>{const a=CUE(2,'Then he lifts'),h=CUE(2,'Dean Henderson'),x=CUE(2,'cross or'),p=CUE(2,'hits the far'),d=CUE(2,'drops in');
 return key(t,mono([[0,-1.2],[a+.3,-.1],[h+.3,.55],[x+.3,1.0],[p+.1,TC],[d+.2,T_NET+.3],[SECS(2),T_NET+.3+(SECS(2)-d-.2)]]),linear);};
const E3:V3=[5.2,1.8,-6];
function cam3v(t:number):Cam{
 const tau=tau3(t),f=add3(fxz(tau),[0,1.1,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(f,[-4,1.4,4],.35),fov:24})],
  [CUE(2,'Dean Henderson')-.3,.9,()=>({P:E3,T:mix3(ballAt(Math.min(tau,TC)),[-3,1.6,1],.5),fov:26})],
  [CUE(2,'hits the far')-.4,.6,()=>({P:E3,T:[-1.6,1.3,-2.2],fov:28})],
  [CUE(2,'drops in')+.4,1.6,()=>({P:[4,2.4,15],T:f,fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tX=CUE(2,'cross or'),tD=CUE(2,'drops in');
  stadium(s,c,t,[3,2,0],{roar:sm(tD-.3,tD+.3,t),flash:sm(tD-.2,tD+.2,t)});
  ground(s,c,{bulge:bulgeAt(tau),shake:shakeAt(tau)});
  // the chip's path so far: a yellow replay trail
  if(tau>0&&tau<T_NET+.8){const pts=pathPts(c,0,Math.min(tau,TC),18),fade=1-sm(T_NET,T_NET+.8,tau);if(pts.length>2){const w=Math.max(7,kAt(c,ballAt(Math.min(tau,TC)))*.12);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.4*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  // "cross or shot?": two faint ghost lines from his boot — one across the six-yard box (the cross), one at goal (the shot)
  const cs=sm(tX-.1,tX+.3,t)*(1-sm(tX+1.1,tX+1.5,t));
  if(cs>.02){arrow3(s,c,[J_BALL,[-6,1.8,5],[-3.2,1.2,-5.2]],Math.max(6,kAt(c,[-6,1,4])*.06),B,.8*cs,true);arrow3(s,c,[J_BALL,[-5,2.6,7],[0,1.4,-3.2]],Math.max(6,kAt(c,[-5,1,6])*.06),R,.85*cs,true);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,only:60,lines:true,prevT:tau3(t-.06)});
  postSpark(s,c,tau);
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(fxz(tau3(t)),[0,1.3,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4.2,
};

// ---------------------------------------------------------------- 4 · the lesson: use your speed → past the defender → look up → before you cross → pick your target
const tau4=(t:number)=>{const u=CUE(3,'Use your'),p=CUE(3,'past the'),l=CUE(3,'look up'),b=CUE(3,'before you'),k=CUE(3,'pick your');
 return key(t,mono([[0,T_RX-.3],[u,T_RX],[p+.6,T_JINK+.7],[l,-.75],[l+.8,-.45],[b+.5,.05],[k,.45],[SECS(3),TC+.2]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),f=add3(fxz(tau),[0,1.2,0]);
 return plan(t,[
  [0,0,()=>({P:add3(f,[-10,2.4,7]),T:add3(f,[6,-.4,-2]),fov:30})],
  [CUE(3,'look up')-.4,1.1,()=>({P:add3(f,[-6.5,1.6,5.5]),T:add3(f,[3,.2,-2.5]),fov:28})],
  [CUE(3,'pick your')-.3,1.2,()=>({P:[-22,5.5,25],T:[-5,.8,1],fov:34})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tU=CUE(3,'Use your'),tP=CUE(3,'past the'),tL=CUE(3,'look up'),tB=CUE(3,'before you'),tK=CUE(3,'pick your');
  stadium(s,c,t,[1,0]);
  ground(s,c,{bulge:bulgeAt(tau),shake:shakeAt(tau)});
  // 1 · use your speed: his run arrowed on the grass down the wing
  const us=sm(tU-.1,tU+.8,t,easeOut)*(1-sm(tL-.3,tL+.2,t));if(us>.02)runTrail(s,c,T_RX,T_JINK,us,Math.max(7,kAt(c,fxz(tau))*.1),Y);
  // 2 · past the defender: the cut inside traced (dashed)
  const pd=sm(tP-.1,tP+.6,t,easeOut)*(1-sm(tB-.2,tB+.3,t));if(pd>.02)runTrail(s,c,T_JINK-.1,-.3,pd,Math.max(6,kAt(c,fxz(tau))*.08),Y,true);
  // 5 · pick your target: the far post and the team-mates arriving, lit on the grass
  const pk=sm(tK-.1,tK+.5,t,easeOutBack);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:55});
  const fa=frimPose(tp,tt),fp=frimPlace(tp),fk=solve(fa,FRIM_B,fp);
  // 2 · a red ring round Mitchell as he is beaten
  const mr=sm(tP-.1,tP+.3,t,easeOutBack)*(1-sm(tL-.2,tL+.3,t));if(mr>.02)ring3(s,c,add3(mxz(tp),[0,1,0]),.95,mr,R,33);
  // 3 · look up: a yellow ring on his eyes and a dashed sight line into the box
  const lu=sm(tL-.1,tL+.35,t,easeOutBack)*(1-sm(tK-.3,tK+.2,t));
  if(lu>.02){ring3(s,c,fk.face,.22,lu,Y,31);const e=add3(fk.face,[0,.05,0]),g:V3=[-3,1.2,-2];arrow3(s,c,[e,mix3(e,g,.5*lu),mix3(e,g,.9*lu)],Math.max(7,kAt(c,e)*.05),Y,.95,true);}
  // 4 · before you cross: a red ring on the striking boot
  const bc=sm(tB-.05,tB+.3,t,easeOutBack)*(1-sm(tK+.4,tK+.9,t));if(bc>.02)ring3(s,c,fk.rToe,.3,bc,R,35);
  if(pk>.02){ring3(s,c,[0,1.2,-3.66],.9,pk,Y,41);for(const n of['Salah','Ekitike']){const a=ACTORS.find(q=>q.name===n)!,p=actorAt(a,tp,tt).place;ring3(s,c,[p.x??0,1,p.z??0],.85,pk,Y,43);}
   const pts=partial(pathPts(c,0,TC,20),pk);if(pts.length>2){const w=Math.max(7,kAt(c,[-4,1.5,4])*.08);s.knockout(ribbon(pts,w*1.5,{taper:.6,pressure:.2,wobble:0}),.4);s.fill(Y,ribbon(pts,w,{taper:.6,pressure:.2,wobble:0}),.9);}}
 },
 still:8,
};

const film:RisoStory={
 id:'frimpong-signature',format:'11v11',title:"Jeremie Frimpong's rocket run",
 theme:'Running with the ball on the wing: use your speed to get past the defender, then look up before you cross',
 ageNote:'Crystal Palace 2–2 Liverpool (Palace won on penalties), FA Community Shield, Wembley Stadium, London, 10 August 2025. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little rocket run — a red streak races right, cuts in, and a yellow ball loops over into the corner. Reduced motion: the still arc. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const run:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*Math.min(1,u*2);run.push([x-200+150*k,y+60-20*Math.max(0,k-.6)*2.5]);}
  if(run.length>2)s.fill(R,ribbon(run,12,{seed,taper:.9,pressure:.3,wobble:1}),.9*fade);
  const lift=clamp(u*2-1),pts:Pt[]=[];for(let i=0;i<=14;i++){const k=i/14*lift;pts.push([x-50+160*k,y+40-150*Math.sin(Math.PI*k)+10*k]);}
  if(lift>0&&pts.length>2)s.fill(Y,ribbon(pts,11,{seed:seed+1,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e:Pt=lift>0?pts[pts.length-1]:run[run.length-1];
  if(age>0&&age<.35&&u>.9)sparkBurst(s,Y,e[0],e[1],70,{n:8,seed,g:1-clamp(age/.35),width:10});
  footballPanels(s,e[0],e[1],28,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
