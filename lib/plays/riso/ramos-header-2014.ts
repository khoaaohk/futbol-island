/** Sergio Ramos's 92:48 equaliser — Real Madrid 4–1 Atlético Madrid (after extra time), UEFA Champions League final, 24 May 2014,
 * Estádio da Luz, Lisbon. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2014 UEFA Champions League final" (raw wikitext; its match summary cites ESPN FC "Real finally secure La Decima", BBC Sport,
 *    Yahoo Sport; its Kits section cites UEFA.com "Atlético to wear home kit for final", 23 May 2014)
 *    https://en.wikipedia.org/wiki/2014_UEFA_Champions_League_final
 *  - Wikipedia (es), "Final de la Liga de Campeones de la UEFA 2013-14" (kit table) https://es.wikipedia.org/wiki/Final_de_la_Liga_de_Campeones_de_la_UEFA_2013-14
 *  - BBC Sport, Phil McNulty, "Real Madrid 4–1 Atlético Madrid" (24 May 2014) https://www.bbc.com/sport/football/27383593
 *  - Wikipedia, "Sergio Ramos" (2013–14 season section) https://en.wikipedia.org/wiki/Sergio_Ramos
 * CONFIRMED by those accounts (and the brief): the final, 24 May 2014, Estádio da Luz, Lisbon; Atlético led 1–0 through Godín's 36th-minute
 * header; in the third minute of stoppage time (93rd minute; the brief's 92:48; BBC: "90 seconds from the end of five minutes of stoppage
 * time") Ramos headed Luka Modrić's corner FROM THE RIGHT "into the left of the net" past Thibaut Courtois (ESPN FC via Wikipedia; BBC: "Ramos
 * rose magnificently to direct Modric's corner past Courtois"); 1–1; Real won 4–1 after extra time (Bale 110', Marcelo 118', Ronaldo pen
 * 120'); both sides wore HOME kits: Real Madrid all white, Atlético red-and-white stripes, blue shorts, red socks; Ramos wore 4, Modrić 19,
 * Courtois 13; fans' man of the match: Ramos.
 * INFERRED (illustrative reconstruction): every position, run and timing in metres and seconds (the corner ≈ 34 m of flight in ≈ 1.9 s,
 * apex ≈ 6 m, swinging away from goal off Modrić's RIGHT foot — his stronger foot, not verified in the footage; Ramos lurking outside the
 * box and meeting it ≈ 10 m out, a little toward the near post, heading it down, low into the left corner in ≈ 0.5 s); where the other
 * sixteen players stood and who marked Ramos (drawn unnamed: Atlético in stripes, Real in white, no numbers except the named three);
 * Courtois staying on his line and diving late to his right without touching it; the camera side (drawn: the main camera on the side
 * opposite the corner, Real attacking right → left on screen); the kit trims and number colours; Courtois's kit colour (drawn yellow);
 * hair; Ramos's celebration run toward the corner flag; the night light, the red seats and the roof of the Luz, the crowd colours and
 * flags; the TV camera positions and lenses. The narration names none of the inferred details.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the crowded box, Ramos waiting outside it,
 * Modrić at the corner flag, the corner, the header, the net, Ramos runs off); ch2 = the TV slow-motion REPLAY from a low camera beside the
 * far post looking back at Ramos's run and leap, with a replay trail on the corner; ch3 = a second REPLAY angle, high behind the goal: the
 * header comes at the camera past Courtois's dive, then live again for the celebration; ch4 = the lesson: a close, very slow replay with
 * teaching marks (a last-minute clock, a ring where he waits outside the box, lit footprints of the timed run, the take-off spark, the ball
 * ring and the arrow of the header down into the corner). Composed on the FULL sheet (world units = sheet units centred on the canvas; never
 * sheet.safe), so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hair and hems, motionSmear on the corner, the header, the dive). Handedness: the world is right-handed (x toward
 * Atlético's goal, y up, +z = Real's right), exactly athlete.ts's convention, so Modrić's strike({foot:'r'}) is his RIGHT foot and the corner
 * from Real's right is the +z corner; header() is symmetric, and Ramos's redirect is a snap of the head and shoulders to his LEFT (−z).
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Heat: small figures print at 'low', every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Ninety-three minutes',text:'Lisbon, 2014, the Champions League final. Real Madrid are losing to Atlético, and time is almost up. Luka Modrić swings in a corner... Sergio Ramos heads it in! One-all!',tail:2.2,
  cues:['Lisbon','Champions League final','Real Madrid are losing','time is almost up','Luka','swings in','Sergio Ramos','heads it in','One-all']},
 {label:'Watch it again',text:'Watch again, slowly. Ramos waits outside the box, then sprints in, times his jump, and heads the ball into the corner.',tail:1.6,
  cues:['Watch again','waits outside','sprints in','times his jump','heads the ball','into the corner']},
 {label:'Behind the goal',text:'From behind the goal, see it fly past the keeper. Real Madrid go on to win four–one in extra time!',tail:2.2,
  cues:['From behind','fly past','keeper','Real Madrid','win','extra time']},
 {label:'Never stop',text:'Keep going until the final whistle! Wait outside the box, time your run, jump, and head it down.',tail:1.9,
  cues:['Keep going','final whistle','Wait outside','time your run','jump','head it down']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/ramos-header-2014/timing.json, add
 *   import timingJson from '../../../public/plays/narration/ramos-header-2014/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/ramos-header-2014/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('ramos: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('ramos: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Atlético's goal line is x = 0 (Real attack +x), goal centre z = 0, +z = Real's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Estádio da Luz at night: a deep closed bowl of red seats, one roof ring
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind Atlético's goal (+x), 2 the main stand (−z, the camera side),
 * 3 the other end. Closed corners: the side stands run past the goal lines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-128,24,a),1.4+27*b,42+34*b],
 (a,b)=>[9+32*b,1.4+25*b,lerp(-66,66,a)],
 (a,b)=>[lerp(24,-128,a),1.4+27*b,-42-34*b],
 (a,b)=>[-114-32*b,1.4+25*b,lerp(66,-66,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] */
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=14,TIER=[.46];
/** flags on the stand fronts: [stand, a, 0 = Real Madrid (white) | 1 = Atlético (red-and-white stripes)] */
const FLAGS:[number,number,number][]=[[0,.28,0],[0,.4,1],[0,.55,0],[0,.68,1],[0,.82,0],[1,.2,0],[1,.38,0],[1,.6,1],[1,.8,0],[2,.25,1],[2,.4,0],[3,.35,1],[3,.62,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a May night in Lisbon: a navy sky, a floodlit blue haze low down
 s.field(K,.5,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  // the one continuous roof ring: a dark overhang over the top rows, a paper fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.72),[0,12,0]),add3(S(0,.72),[0,12,0])]));
  seg3(c,add3(S(0,.72),[0,11.8,0]),add3(S(1,.72),[0,11.8,0]),.5,edge);}
 // the closed corners of the bowl: seats and roof run on round from one stand to the next
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.72),[0,12,0]),add3(A(ai,.72),[0,12,0])]));}
 // red seats under the crowd (the Luz is Benfica's), a paper tier fascia
 s.knockout(planes);s.tone(R,planes,.62);s.tone(K,planes,.28);s.knockout(tier,.8);
 // the crowd: seeded dots (white Madrid shirts, Atlético red, navy, a few yellow), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.58?0:h<.8?1:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 // flags on the stand fronts: Madrid's white (a yellow crest dot) and Atlético's red-and-white stripes
 const fl=new Path2D(),stripe=new Path2D(),crest=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===1){for(let k=0;k<3;k++){const u0=(2*k+.5)/6,u1=u0+1/6;addPoly(stripe,polyP(c,[P(u0,.005),P(u1,.005),P(u1,.075),P(u0,.075)]));}}
  else addPoly(crest,polyP(c,[P(.42,.028),P(.58,.028),P(.58,.052),P(.42,.052)]));}
 s.knockout(fl);s.fill(R,stripe,.95);s.fill(Y,crest,.95);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.72),[0,11,0]),b=add3(S(u+.025,.72),[0,11,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: blue with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.35);s.knockout(pn,.85);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** Atlético's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around z = bz */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.3,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Real Madrid's home kit: all white (shirt, shorts, socks), navy trim and numbers (trim inferred) */
const real=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:K,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Atlético's home kit: red-and-white stripes, blue shorts, red socks */
const atleti=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:'paper',shorts:B,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:[B,.9],numberInk:[B,.9],hairStyle:'short',build:{height:1.8,bulk:1},...o});
const B_RAM:Build={height:1.84,bulk:1.04,thighs:1.06},B_MOD:Build={height:1.72,bulk:.86},B_COU:Build={height:1.99,bulk:.98};
const RAM_ST=real({number:4,hair:[K,.9],skin:SKIN_M,build:B_RAM,seed:4});
const MOD_ST=real({number:19,hairStyle:'long',hair:[Y,.8],build:B_MOD,seed:19});
const COU_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.7],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:13,numberInk:K,build:B_COU,seed:13};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Modrić's corner)
const BALL_R=.11,GRAV=9.81;
/** the corner flies TF s to Ramos's forehead; his header reaches the goal line TG */
const TF=1.9,TG=TF+.5;
/** Ramos's header spot (his pelvis) ≈ 10 m out, a little toward the near post; he faces the goal, a touch toward the incoming ball */
const HP:[number,number]=[-10.2,1.3],YAW_H=yawTo(1,.14);
/** Ramos's header pose: header() with a powerful spring (run-up) and the head + shoulders snapping to his LEFT (toward the left corner) */
function ramHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.4;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.22,.24,sn)*w;p.twist+=lerp(-.08,.16,sn)*w;p.neckP+=.28*w;return p;}
/** contact on the header clock: mid-snap, eyes open, forehead driving down through the ball */
const CU=.47,HD=1.0,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(ramHeader(CU),B_RAM,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the quadrant at the +z corner flag) */
const P0:V3=[-.45,BALL_R,33.55];
/** the out-swinger: a steady sideways pull AWAY from goal (−x) on top of gravity */
const SWING:V3=[-2.4,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Modrić strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_M=yawTo(DC[0],DC[1]);
/** where Modrić's pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCM:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_MOD,{x:0,z:0,yaw:YAW_M});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** the run-up: from behind the ball and to its left (a right-footer's angle) */
const LEFT_M:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCM[0]-DC[0]*3.4+LEFT_M[0]*1.6,PCM[1]-DC[1]*3.4+LEFT_M[1]*1.6];
/** where the header crosses the goal line: low in the LEFT corner (−z, Courtois's right), past his late dive */
const GOAL_PT:V3=[0,.42,-3.02],NET_HIT:V3=[1.55,.3,-3.2],REST:V3=[1.1,BALL_R,-2.85];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='ram'|'mod'|'gk'|'mark'|'real'|'atl';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=12,DT=.02;
const mp=(u:number):[number,number]=>[PCM[0]+DC[0]*u,PCM[1]+DC[1]*u];
/** after the goal the Madrid players chase Ramos toward the corner flag */
const toFlag=(x:number,z:number,k:number):number[][]=>[[TF+1.2+k*.2,x,z],[TF+4+k*.3,lerp(x,-2.5,.6),lerp(z,27,.6)],[T1,lerp(x,-2,.8),lerp(z,30,.85)]];
const ACTORS:Actor[]=[
 {name:'Sergio Ramos',role:'ram',hero:true,style:RAM_ST,keys:[[T0,-21,-4.2],[-6,-20.2,-3.4],[-3,-19.6,-3.6],[-1.2,-19.2,-3],[-.3,-18,-2.1],[TJ-.36,HP[0],HP[1]],[TF+.5,HP[0],HP[1]],[TF+1.4,-8.4,4.2],[TF+3.6,-5,14],[TF+6.6,-2,25],[T1,-1,30]]},
 {name:'Luka Modrić',role:'mod',hero:true,style:MOD_ST,keys:[[T0,.6,36.4],[-6.4,.2,35.4],[-5.2,...mp(-.7)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...mp(-1.6)],[0,...mp(0)],[.7,...mp(.9)],[3,...mp(3.5)],[T1,-3,28]]},
 {name:'Thibaut Courtois',role:'gk',hero:true,style:COU_ST,keys:[[T0,-.6,.5],[-2,-.7,.9],[0,-.8,1.2],[TF-.4,-.9,1.1],[TF,-.95,.9],[T1,-.9,.9]]},
 {name:'Atlético defender (beaten)',role:'mark',hero:true,style:atleti({build:{height:1.86,bulk:1},seed:41}),keys:[[T0,-13,1.2],[-3,-12.6,1.5],[0,-12.4,1.7],[TF-.6,-11.9,2.1],[TF,-11.7,2.3],[T1,-10.8,2.4]]},
 {name:'Atlético near post',role:'atl',style:atleti({skin:SKIN_M,seed:42}),keys:[[T0,-.9,4.3],[0,-.8,4.1],[TF,-1.2,3.2],[T1,-1.4,2.6]]},
 {name:'Atlético six-yard 1',role:'atl',style:atleti({build:{height:1.87},seed:43}),keys:[[T0,-4.2,3.6],[-2,-4.6,3.2],[0,-4.8,2.9],[TF,-5.4,2.4],[T1,-5,1.4]]},
 {name:'Atlético six-yard 2',role:'atl',style:atleti({skin:SKIN_M,seed:44}),keys:[[T0,-4.8,-.8],[-2,-5,-1],[0,-5.2,-1.2],[TF,-5.8,-1],[T1,-5.2,-.4]]},
 {name:'Atlético marker',role:'atl',style:atleti({build:{height:1.83},seed:45}),keys:[[T0,-8.4,5],[-2,-8,4.6],[0,-8.2,4.4],[TF,-8.8,3.6],[T1,-8,3]]},
 {name:'Atlético edge',role:'atl',style:atleti({skin:SKIN_D,seed:46}),keys:[[T0,-15.4,-4.6],[-2,-15.8,-4.2],[0,-15.2,-3.4],[TF,-12.6,-1.6],[T1,-11.5,-1]]},
 {name:'Atlético zone',role:'atl',style:atleti({build:{height:1.76},seed:47}),keys:[[T0,-12.4,4],[-2,-12,3.6],[0,-11.8,3.4],[TF,-11,2.4],[T1,-10,2]]},
 {name:'Atlético back post',role:'atl',style:atleti({skin:SKIN_M,seed:48}),keys:[[T0,-6.2,-5.4],[0,-6.3,-5],[TF,-6.6,-4],[T1,-6,-3.2]]},
 {name:'Madrid attacker 1',role:'real',style:real({build:{height:1.86},seed:61}),keys:[[T0,-6.4,1.2],[-2,-6.2,1.8],[0,-6,2],[TF,-4.9,2.6],...toFlag(-4.2,3,0)]},
 {name:'Madrid attacker 2',role:'real',style:real({hair:[R,.5],seed:62}),keys:[[T0,-9,6.2],[-2,-8.6,5.8],[0,-8.4,5.6],[TF,-7.2,4.8],...toFlag(-6.6,5,1)]},
 {name:'Madrid attacker 3',role:'real',style:real({skin:SKIN_D,build:{height:1.9},seed:63}),keys:[[T0,-7.8,-2.8],[-2,-7.4,-2.6],[0,-7.2,-2.4],[TF,-6.2,-1.6],...toFlag(-6.4,-.6,2)]},
 {name:'Madrid attacker 4',role:'real',style:real({seed:64,skin:SKIN_M}),keys:[[T0,-11.6,-5],[-2,-11,-4.8],[0,-10.8,-4.4],[TF,-9.2,-3.4],...toFlag(-9,-2,3)]},
];
const RAM=0,MOD=1,GK=2,MARK=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 // a held key (same spot twice) keeps zero speed at its ends
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** placed in the quadrant (Modrić sets it down early) → the corner → the header → the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*4:TF*TAU*4-(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // set-piece jostling: knees bent, arms out, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** Courtois: set on his line, then a late low dive to his right (default side 'r' = −z for a keeper facing −x) */
const DIVE=(u:number)=>keeperDive(clamp(u),{height:.12}),T_DIVE=TF+.04,DIVE_L=.95;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'ram':{
   // eyes on the ball as it comes over; he arrives facing the goal, gathers, springs, heads down to his left, lands, runs off
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=ramHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   if(tau<-.4){yaw=faceYaw(k,tau,P0);}
   const w=sm(TJ-.9,TJ-.3,tau)*(1-sm(TF+.55,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'mod':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   if(tau<-4.8&&tau>-6.6){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   if(tau>-3.6&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_M,sm(-2.2,-1.2,tau));}
   yaw=lerpAng(yaw,YAW_M,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.6,1.1,tau)*(1-sm(TF-.85,TF-.65,tau)));
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));}
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'mark':{// beaten: a late, lower jump behind Ramos, then hands on hips
   if(tau>TF-.6&&tau<TF+1){const hp=header(clamp((tau-(TF-.4))/1.0));hp.air*=.5;pose=blendPose(pose,hp,sm(TF-.6,TF-.4,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'atl':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'real':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the header, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 // heat cap: at most FULL_CAP big non-hero figures print at full detail (the nearest); the rest of a crowded box prints 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===RAM&&tau>TJ&&tau<TF+.3)||(k===MOD&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time (×≈1), anchored so the corner is struck on "swings in" and his forehead meets it on "Sergio Ramos" */
function tau1(t:number){const tX=CUE(0,'swings in')-.05,tH=CUE(0,'Sergio Ramos')+.45,k=clamp(TF/Math.max(.5,tH-tX),.85,1.15);return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-26,21,-64];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-9,0,12],fov:25})],
  [CUE(0,'Real Madrid')-.2,1.4,()=>({P:P1,T:[-9.5,1,1.5],fov:12})],
  [CUE(0,'time is')-.1,1.3,()=>({P:P1,T:mix3(at(RAM,tau,1),[-10,1,1],.35),fov:11})],
  [CUE(0,'Luka')-.9,.8,()=>({P:P1,T:mix3(at(MOD,tau,.9),P0,.35),fov:4.4})],
  [CUE(0,'swings in')+.05,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.4+.3*b[1],0]),[HP[0],1.6,HP[1]],.25+.5*sm(0,TF,tau)),fov:lerp(12,16,sm(-.1,.8,tau))})],
  [CUE(0,'Sergio')-.45,.8,()=>({P:P1,T:[HP[0]+1.2,1.6,HP[1]-1.2],fov:7})],
  [CUE(0,'heads it in')+.3,1.5,()=>{const w=at(RAM,tau,1.2);return{P:P1,T:mix3(w,[-2,1.2,-2],.35),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'One-all'),tN=CUE(0,'Sergio')+.8;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tA-.2,tA+.3,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Sergio')+.5;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low beside the far post, looking back at Ramos
const tau2=(t:number)=>key(t,mono([[0,-1.6],[CUE(1,'waits outside'),-1.2],[CUE(1,'sprints in'),-.3],[CUE(1,'times his jump'),TJ+.05],[CUE(1,'heads the ball'),TF-.04],[CUE(1,'into the corner'),TF+.2],[SECS(1)-.2,TG+.6]]),linear);
const E2:V3=[5.5,3,-17];
function cam2(t:number):Cam{
 const tau=tau2(t),r=at(RAM,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-13,1.4,-.5],fov:26.5})],
  [CUE(1,'waits outside')-.2,1.1,()=>({P:E2,T:mix3(r,[-10,1.2,1],.2),fov:10.9})],
  [CUE(1,'sprints in')-.2,1,()=>({P:E2,T:mix3(r,[HP[0],1.4,HP[1]],.3),fov:11.7})],
  [CUE(1,'times his jump')-.3,1,()=>({P:add3(E2,[0,.2,.4]),T:[HP[0],2.1,HP[1]],fov:10.1})],
  [CUE(1,'heads the ball')-.3,.8,()=>({P:add3(E2,[0,.3,.6]),T:[HEAD_PT[0]+.3,HEAD_PT[1]-.15,HEAD_PT[2]-.2],fov:7})],
  [CUE(1,'into the corner')+.1,1.2,()=>({P:add3(E2,[0,.3,.6]),T:mix3([HEAD_PT[0],1.4,HEAD_PT[2]],[0,.6,-3],.55),fov:17.2})],
 ]);
}
/** the replay trail: the corner's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.9),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.55,tau));
  const r=play(s,c,tau,tp,{smear:true,min:10});
  // the touch: a spark on his forehead at contact
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'heads the ball')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal, the header comes at the camera
const tau3=(t:number)=>key(t,mono([[0,-.3],[CUE(2,'fly past'),TF+.05],[CUE(2,'keeper'),TG+.05],[CUE(2,'Real Madrid'),TG+1.4],[CUE(2,'win'),TG+2.6],[CUE(2,'extra time'),TG+4.2],[SECS(2),TG+6.2]]),linear);
const E3:V3=[12,6.5,8.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(RAM,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-8,1.4,1],fov:30})],
  [CUE(2,'fly past')-.4,.9,()=>({P:E3,T:[-4.5,1.2,-.5],fov:21})],
  [CUE(2,'keeper')+.2,1.2,()=>({P:E3,T:[-1.5,.8,-2.2],fov:19})],
  [CUE(2,'Real Madrid')-.2,1.8,()=>({P:[8,7.5,12],T:r,fov:22})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tW=CUE(2,'win'),tE=CUE(2,'extra time');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tW-.1,tW+.3,t)*.8,sm(tE,tE+.3,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the replay graphic: the header's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(RAM,tau3(twos(t))),sk=solve(p.pose,B_RAM,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'keeper')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
const LURK:V3=[-19.4,0,-3.4];
const tau4=(t:number)=>key(t,mono([[0,-3.2],[CUE(3,'final whistle'),-2.6],[CUE(3,'Wait outside'),-2],[CUE(3,'time your run'),-.6],[CUE(3,'jump'),TJ+.1],[CUE(3,'head it down'),TF-.06],[SECS(3),TG+.45]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(RAM,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-16,2.4,-15],T:[-15,1.2,-1],fov:40})],
  [CUE(3,'Wait outside')-.2,1,()=>({P:[-17,1.8,-12],T:mix3(w,[-17,1,-1],.3),fov:30})],
  [CUE(3,'time your run')-.2,1.2,()=>({P:[-14.5,1.6,-11],T:mix3(w,[HP[0],1,HP[1]],.45),fov:32})],
  [CUE(3,'jump')-.2,.8,()=>({P:[-13,1.5,-8.5],T:[HP[0],1.8,HP[1]],fov:24})],
  [CUE(3,'head it down')-.2,.9,()=>({P:[-12.6,1.8,-7.6],T:mix3([HEAD_PT[0],HEAD_PT[1]-.3,HEAD_PT[2]],[0,.6,-3],.3),fov:36})],
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
/** "the final whistle": a stadium clock face (no numbers) printed in the top corner of the frame, its red hand sweeping up to the top */
function clockFace(s:Sheet,g:number,sweep:number){
 if(g<=0)return;const x=-lerp(270,330,1-g)-120,y=-300,r=120*easeOutBack(clamp(g)),face=polyPath(blob(x,y,r,r,5,{amp:.03,n:32}),true);
 s.knockout(face);s.stroke(K,face,6,.9);s.tone(Y,face,.3);
 const ticks=new Path2D();for(let i=0;i<12;i++){const a=i/12*TAU-Math.PI/2,a0:Pt=[x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78],a1:Pt=[x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92];ticks.addPath(ribbon([a0,a1],i%3?5:9,{seed:i,taper:0,wobble:0}));}s.fill(K,ticks,.9);
 // the last slice before the top (the last minutes) printed red; the hand sweeps into it
 const sl=new Path2D();sl.moveTo(x,y);for(let i=0;i<=8;i++){const a=-Math.PI/2-TAU/12+i/8*TAU/12;sl.lineTo(x+Math.cos(a)*r*.74,y+Math.sin(a)*r*.74);}sl.closePath();s.fill(R,sl,.7);
 const ha=-Math.PI/2-TAU/12*(1-sweep)-.9*(1-g);s.fill(K,ribbon([[x,y],[x+Math.cos(ha)*r*.8,y+Math.sin(ha)*r*.8]],10,{seed:3,taper:.6,wobble:0}),.95);
}
/** a flat dashed ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;s.stroke(ink,polyPath(pts,true),Math.max(5,kAt(c,P)*.07),.95*a);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tK=CUE(3,'Keep going'),tW=CUE(3,'final whistle'),tO=CUE(3,'Wait outside'),tR=CUE(3,'time your run'),tJp=CUE(3,'jump'),tD=CUE(3,'head it down');
  stadium(s,c,t,[0,1,3],{roar:.35+.5*sm(tK,tK+.6,t)*(1-sm(tW+1,tW+2,t))+.6*sm(tD+.3,tD+.9,t)});
  ground(s,c);
  // "Wait outside the box": a red ring where he waits, outside the eighteen-yard line
  const wo=sm(tO-.15,tO+.3,t)*(1-sm(tR+.6,tR+1.2,t));groundRing(s,c,LURK,.9,R,wo);
  // "time your run": his run's footprints light up in order as he arrives; the corner's path arrives at the same spot
  const run=sm(tR-.2,tR+.3,t)*(1-sm(tD+.2,tD+.8,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<10;k++){const Tk=-.6+k*((TJ-.2+.6)/9),[x,z]=posOf(RAM,Tk),v=velOf(RAM,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);
   const X=pr(c,[HP[0],.01,HP[1]]);if(X){const rr=kAt(c,[HP[0],0,HP[1]])*.5,ring=polyPath(blob(X[0],X[1],rr,rr*.32,7,{n:20}),true);s.stroke(R,ring,Math.max(5,rr*.14),.95*run);}
   const pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,flyA(P0,V_CROSS,SWING,lerp(TF*.5,TF,i/24)));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.62)/10,(i+.98)/10]);const d=ribbon(partial(pts,sm(tR,tR+1.2,t)),Math.max(7,kAt(c,HEAD_PT)*.06),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*run);s.fill(Y,d,.95*run);}}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[RAM,GK,MARK]});
  // "Keep going": a burst over him; "the final whistle": the clock
  const kg=sm(tK,tK+.35,t)*(1-sm(tK+1.2,tK+1.7,t));if(kg>0){const q=pr(c,at(RAM,tau,3.2));if(q)sparkBurst(s,Y,q[0],q[1],200*kg,{n:12,seed:9,g:easeOutBack(kg),width:16});}
  clockFace(s,sm(tW-.25,tW+.25,t)*(1-sm(tO+.4,tO+.9,t)),sm(tW,tW+1.1,t,easeInOutSine));
  // "jump": a spark under his take-off, an up arrow beside him
  const jp=sm(tJp-.1,tJp+.3,t)*(1-sm(tD,tD+.4,t));
  if(jp>0){const q=pr(c,[HP[0],.05,HP[1]]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(70,kAt(c,[HP[0],0,HP[1]])*.7)*jp,{n:9,seed:41,g:easeOutBack(jp),width:12});
   const side:V3=[HP[0]-.9,0,HP[1]-.7];arrow3(s,c,[add3(side,[0,.4,0]),add3(side,[0,.4+.8*jp,0]),add3(side,[0,.4+1.6*jp,0])],Math.max(9,kAt(c,side)*.09),R,.95*jp);}
  // "head it down": a ring on the ball, his forehead glows, and the header's path is printed down into the corner
  const hd=sm(tD-.2,tD+.2,t);
  if(hd>0&&r.ball&&tau<TF+.1){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp_=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*hd);s.fill(Y,rp_,.95*hd);}
  if(hd>0){const st=stateOf(RAM,tau),sk=solve(st.pose,B_RAM,st.place),h=sk.head,fc=sk.face,fp=add3(h,mul3(sub3(fc,h),1.05)),q=pr(c,add3(fp,[0,.05,0])),fade=1-sm(tD+1.6,tD+2.2,t);
   if(q){const rr=kAt(c,fp)*.07*clamp(hd,0,1.2),glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8*fade);s.fill(Y,glow,.9*fade);}
   const arr=sm(tD+.1,tD+1,t,easeInOutSine);if(arr>0){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*arr*i/8));pts.push(mix3(GOAL_PT,NET_HIT,.4*arr));arrow3(s,c,pts,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95);}}
 },
 get still(){return CUE(3,'head it down')+.3;},
};

const film:RisoStory={
 id:'ramos-header-2014',format:'11v11',title:"Ramos's last-minute header",
 theme:'Keep going until the final whistle: wait outside the box, time your run to the corner, jump and head it down',
 ageNote:'Real Madrid 4–1 Atlético Madrid (after extra time), Champions League final, Lisbon, 24 May 2014. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little header — a ball drops in on an arc, a yellow spark where it is met, and it is driven down and away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.35?x+170*(1-u):x-220*easeOut(out),by=age<.35?y-130*(1-u)*(1-u)-10:y+120*out;
  if(age>.3&&age<.65)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.3)/.12))*(1-clamp((age-.5)/.15)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Atlético's goal line x = 0, +z = Real's right) — checked by tests/play-film-ramos-header-2014.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,cornerFoot:'r' as const,
 modricContact:()=>{const st=stateOf(MOD,0),sk=solve(st.pose,B_MOD,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 ramosAt:(tau:number)=>{const st=stateOf(RAM,tau),sk=solve(st.pose,B_RAM,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 courtoisAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_COU,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
