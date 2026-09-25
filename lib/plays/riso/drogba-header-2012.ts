/** Didier Drogba's 88th-minute equaliser — Bayern Munich 1–1 Chelsea (Chelsea won 4–3 on penalties), UEFA Champions League final,
 * 19 May 2012, Fußball Arena München (the Allianz Arena), Munich. An iconic-play riso film (RisoStory, chapters mode) played by the card's
 * picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage
 * itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2012 UEFA Champions League final" (raw wikitext: match summary, line-ups, Kits section citing UEFA "Tactical Line-ups –
 *    Final – Saturday 19 May 2012", attendance 62,500, 20 °C partly cloudy) https://en.wikipedia.org/wiki/2012_UEFA_Champions_League_final
 *  - Wikimedia Commons kit templates Kit_body_FCBAYERN_1112h.png / Kit_shorts_FCBAYERN_1112h.png (the pattern files that page's kit table uses)
 *  - The Guardian, Daniel Taylor, "Chelsea win Champions League on penalties over Bayern Munich" (19 May 2012)
 *    https://www.theguardian.com/football/2012/may/19/bayern-munich-chelsea-champions-league-final
 *  - Sky Sports match report (19 May 2012, via web.archive.org) http://www.skysports.com/football/match_report/0,,11065_3510294,00.html
 *  - Wikipedia, "Didier Drogba" (2011–12 section) https://en.wikipedia.org/wiki/Didier_Drogba
 *  - Wikipedia (de), "UEFA Champions League 2011/12" (Finale: Bayern had 16 corners to none before the 88th minute)
 * CONFIRMED by those accounts: the final, 19 May 2012, in Munich, Bayern's own ground; Müller's 83rd-minute header put Bayern 1–0 up; in the
 * 88th minute ("with two minutes left", Sky) Chelsea won their FIRST corner of the match; Juan Mata (10) took it — "Mata's corner was whipped
 * across the penalty area and Drogba was fast and decisive, flashing his header into the top corner" (Guardian); "Drogba got to it first and
 * powered a header past Manuel Neuer at the near post" (Wikipedia); "Drogba rose at the near post to power Mata's corner home … the ball
 * speeding past Neuer at such pace, from so close, there was no time for reaction" (Sky); 1–1, extra time, Chelsea won the shoot-out 4–3 and
 * Drogba scored the winning penalty. Kits (UEFA line-ups via Wikipedia): Bayern all red (red shirts, red shorts, red socks); Chelsea blue
 * shirts, blue shorts, white socks. Numbers: Drogba 11, Mata 10, Neuer 1. Man of the match: Drogba.
 * INFERRED (illustrative reconstruction, never named in the narration): WHICH corner — drawn from Chelsea's RIGHT (+z), an in-swinger off
 * Mata's LEFT foot (his stronger foot; "whipped" and a near-post finish fit an in-swinger, not verified in the footage); every position, run and
 * timing in metres and seconds (the corner ≈ 31 m in ≈ 1.3 s, apex ≈ 3.5 m; Drogba starting near the penalty spot and sprinting ≈ 7 m to meet
 * it ≈ 5 m out at the near post, heading it into the top of the near corner in ≈ 0.2 s); his marker (drawn unnamed, beaten to the ball); where
 * the other players stood (Bayern in red, Chelsea in blue, no numbers except the named three); Neuer standing near the middle of his goal and
 * only flinching (no touch drawn, following Sky's "no time for reaction"); Neuer's kit (drawn navy); Drogba running off toward the corner flag;
 * the kit trims and number colours; hair; the night light, the grey seats, the three tiers and the white roof ring of the arena, the crowd colours
 * and flags; the camera side (drawn: the main camera on the side opposite the corner, Chelsea attacking left → right on screen); the TV camera
 * positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the crowded box, Mata at the far corner flag, the
 * corner, Drogba's burst to the near post, the header, the net, he runs off); ch2 = the TV slow-motion REPLAY from a low camera behind the
 * near post looking back out at his run and leap, with a replay trail on the corner; ch3 = a second REPLAY angle, high behind the goal: the
 * header comes at the camera past Neuer, then live again for the celebration; ch4 = the lesson: a close, very slow replay with teaching marks
 * (a ring on the near-post zone, lit footprints of the run that gets there first, the take-off spark, forehead glow and power lines, the aim
 * arrow and a target ring in the top corner). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe),
 * so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hair and hems, motionSmear on the corner, the header, Neuer's flinch). Handedness: the world is right-handed (x toward
 * Bayern's goal, y up, +z = Chelsea's right), exactly athlete.ts's convention, so Mata's strike({foot:'l'}) is his LEFT foot and the corner
 * from Chelsea's right is the +z corner; the near post is z = +3.66; header() is symmetric, and Drogba's redirect is a snap of the head and
 * shoulders to his LEFT (toward the goal: he meets the ball facing out toward the corner a little). Inks: yellow, red, blue, navy. Everything is
 * keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small figures
 * print at 'low', every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc,PASSAGE} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Two minutes left',text:'Munich, 2012, the Champions League final. Bayern lead Chelsea one–nil, two minutes left. Chelsea win their first corner. Juan Mata whips it in... Didier Drogba powers a header in! One-all!',tail:2.2,
  cues:['Munich','Champions League final','Bayern lead','two minutes left','first corner','Juan Mata','whips it in','Didier Drogba','powers a header','One-all']},
 {label:'Watch it again',text:'Watch again, slowly. Drogba sprints to the near post, gets there first, and uses his forehead to power it into the top corner.',tail:1.6,
  cues:['Watch again','sprints','near post','gets there first','forehead','power it','top corner']},
 {label:'Behind the goal',text:'From behind the goal, see how fast it flies. The keeper has no time to move. Chelsea win on penalties!',tail:2.2,
  cues:['From behind','how fast','keeper','no time','Chelsea win','penalties']},
 {label:'Attack the near post',text:'Attack the near post! Get there first, jump, and power your header where you aim.',tail:2,
  cues:['Attack the near post','Get there first','jump','power your header','where you aim']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/drogba-header-2012/timing.json, add
 *   import timingJson from '../../../public/plays/narration/drogba-header-2012/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/drogba-header-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('drogba: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('drogba: no cue '+w);return c.at;};
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
/** Pitch: Bayern's goal line is x = 0 (Chelsea attack +x), goal centre z = 0, +z = Chelsea's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Munich arena at night: a steep closed bowl, three tiers, a white roof ring
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind Bayern's goal (+x), 2 the main stand (−z, the camera side),
 * 3 the other end. Closed corners: the side stands run past the goal lines. Steeper and taller than an open bowl (three stacked tiers). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-126,22,a),1.2+33*b,40+30*b],
 (a,b)=>[8+28*b,1.2+31*b,lerp(-62,62,a)],
 (a,b)=>[lerp(22,-126,a),1.2+33*b,-40-30*b],
 (a,b)=>[-112-28*b,1.2+31*b,lerp(62,-62,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] */
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=15,TIER=[.34,.67];
/** flags on the stand fronts: [stand, a, 0 = Bayern (red with a paper band) | 1 = Chelsea (blue)] */
const FLAGS:[number,number,number][]=[[0,.26,0],[0,.4,0],[0,.55,1],[0,.7,0],[0,.84,0],[1,.2,0],[1,.4,0],[1,.62,0],[1,.8,0],[2,.25,0],[2,.45,1],[3,.3,1],[3,.5,1],[3,.7,1]];
/** where the Chelsea blue sits in the crowd (inferred): most of the far end (stand 3), a patch of the far side */
const blueAt=(si:number,a:number)=>si===3?.62:si===0&&a>.48&&a<.62?.4:.05;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a May night in Munich: a navy sky, a floodlit blue haze low down
 s.field(K,.5,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  // the one continuous roof ring: a pale membrane overhang over the top rows, a paper fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,11,0]),add3(S(0,.74),[0,11,0])]));
  seg3(c,add3(S(0,.74),[0,10.8,0]),add3(S(1,.74),[0,10.8,0]),.5,edge);}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.74),[0,11,0]),add3(A(ai,.74),[0,11,0])]));}
 // grey seats under the crowd, paper tier fascias
 s.knockout(planes);s.tone(K,planes,.42);s.tone(B,planes,.2);s.knockout(tier,.8);
 // the crowd: seeded dots (Bayern red and white, Chelsea blue, a few yellow), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hb=hash(i*7+j*53+si*3,21),ink=hb<blueAt(si,a)?2:h<.62?1:h<.9?0:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.35);s.knockout(edge,.8);
 // flags on the stand fronts: Bayern's red (a paper band) and Chelsea's blue
 const fl=new Path2D(),red=new Path2D(),blue=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(red,polyP(c,[P(0,.005),P(1,.005),P(1,.03),P(0,.03)]));addPoly(red,polyP(c,[P(0,.05),P(1,.05),P(1,.075),P(0,.075)]));}
  else addPoly(blue,q);}
 s.knockout(fl);s.fill(R,red,.95);s.fill(B,blue,.95);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.022,.74),[0,10,0]),b=add3(S(u+.022,.74),[0,10,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-44],[13,0,-44],[13,0,44],[-118,0,44]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: blue with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.6,0,-37.5],[5.6,0,37.5]);board([-110,0,-37.5],[5.6,0,-37.5]);board([-110,0,37.5],[5.6,0,37.5]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.5,.25,z],[5.5,.25,z+3.3],[5.5,.68,z+3.3],[5.5,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
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
/** Bayern's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back/roof out around (bz, by) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-1.8,0,1.3,2.6,z1];
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
/** Chelsea: blue shirts and shorts, white socks; paper numbers and trim (trim inferred) */
const che=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Bayern: all red (shirts, shorts, socks); paper numbers and trim (trim inferred) */
const fcb=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.82,bulk:1},...o});
const B_DRO:Build={height:1.89,bulk:1.1,thighs:1.1},B_MAT:Build={height:1.70,bulk:.86},B_NEU:Build={height:1.93,bulk:1.02};
const DRO_ST=che({number:11,skin:SKIN_D,hair:[K,.95],build:B_DRO,seed:11});
const MAT_ST=che({number:10,hair:[K,.9],build:B_MAT,seed:10});
/** Neuer's kit colour is not in the sources: drawn navy (inferred) */
const NEU_ST:AthleteStyle={shirt:[K,.8],shorts:[K,.85],socks:[K,.8],boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:'paper',gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:B_NEU,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Mata's corner)
const BALL_R=.11,GRAV=9.81;
/** the whipped corner flies TF s to Drogba's forehead; his header reaches the goal line TG (a powerful header from ≈ 5 m) */
const TF=1.3,TG=TF+.22;
/** Drogba's header spot (his pelvis) ≈ 5 m out at the near post; he faces a little out toward the incoming ball, the goal to his left */
const HP:[number,number]=[-4.9,3.2],YAW_H=yawTo(.8,.6);
/** Drogba's header pose: header() with a strong spring off his sprint and the head + shoulders snapping to his LEFT (toward the goal) */
function droHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.05;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.18);
 p.neckY+=lerp(-.1,.5,sn)*w;p.twist+=lerp(-.06,.32,sn)*w;p.neckP+=.05*w;return p;}
/** contact on the header clock: mid-snap, forehead driving through the ball */
const CU=.48,HD=.95,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(droHeader(CU),B_DRO,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the quadrant at the +z corner flag) */
const P0:V3=[-.45,BALL_R,33.55];
/** the in-swinger: a steady sideways pull TOWARD goal (+x) on top of gravity */
const SWING:V3=[2.6,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Mata strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_M=yawTo(DC[0],DC[1]);
/** where Mata's pelvis stands at contact so his LEFT boot meets the back of the ball (solved once, FK) */
const PCM:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),B_MAT,{x:0,z:0,yaw:YAW_M});return[P0[0]-DC[0]*.12-sk.lToe[0],P0[2]-DC[1]*.12-sk.lToe[2]];})();
/** the run-up: from behind the ball and to its right (a left-footer's angle) */
const RIGHT_M:[number,number]=[-DC[1],DC[0]],RUN0:[number,number]=[PCM[0]-DC[0]*3.2+RIGHT_M[0]*1.5,PCM[1]-DC[1]*3.2+RIGHT_M[1]*1.5];
/** where the header crosses the goal line: high at the NEAR post (+z), into the top corner, past Neuer */
const GOAL_PT:V3=[0,2.12,3.18],NET_HIT:V3=[1.45,1.85,3.35],REST:V3=[1.05,BALL_R,2.95];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='dro'|'mat'|'gk'|'mark'|'che'|'fcb';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=12,DT=.02;
const mp=(u:number):[number,number]=>[PCM[0]+DC[0]*u,PCM[1]+DC[1]*u];
/** after the goal the Chelsea players chase Drogba toward the corner flag */
const toFlag=(x:number,z:number,k:number):number[][]=>[[TG+1+k*.2,x,z],[TG+4+k*.3,lerp(x,-3,.6),lerp(z,26,.6)],[T1,lerp(x,-2.5,.8),lerp(z,29,.85)]];
/** the run: from near the penalty spot, a burst across the front of his marker to the near post */
const RUN_A:[number,number]=[-10.6,-.8];
const ACTORS:Actor[]=[
 {name:'Didier Drogba',role:'dro',hero:true,style:DRO_ST,keys:[[T0,-11.8,-1.6],[-6,-11.2,-.6],[-3,-11.6,-1.4],[-1.2,-11,-1.1],[-.55,...RUN_A],[TJ-.3,HP[0]-.5,HP[1]-.4],[TJ-.05,HP[0],HP[1]],[TF+.45,HP[0]+.3,HP[1]+.3],[TF+1.4,-4.2,7],[TF+3.6,-3.4,15],[TF+6.6,-2.2,25],[T1,-1.2,29.5]]},
 {name:'Juan Mata',role:'mat',hero:true,style:MAT_ST,keys:[[T0,.6,36.2],[-6.4,.2,35.3],[-5.2,...mp(-.7)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...mp(-1.5)],[0,...mp(0)],[.7,...mp(.9)],[3,...mp(3.4)],[T1,-3,28]]},
 {name:'Manuel Neuer',role:'gk',hero:true,style:NEU_ST,keys:[[T0,-.7,.2],[-2,-.8,.5],[0,-.9,.9],[TF-.4,-1,1.2],[TF,-1,1.25],[T1,-1,1.25]]},
 {name:'Bayern marker (beaten)',role:'mark',hero:true,style:fcb({build:{height:1.92,bulk:1.04},skin:SKIN_D,seed:17}),keys:[[T0,-10.8,-2.2],[-3,-10.6,-2],[-1.2,-10.2,-1.8],[-.5,-9.8,-1.6],[TJ-.3,-6.4,1.6],[TF,-6,2.2],[TF+.8,-5.6,2.6],[T1,-5.2,2.8]]},
 {name:'Bayern near post',role:'fcb',style:fcb({seed:21}),keys:[[T0,-.8,4.4],[0,-.7,4.2],[TF,-1,3.9],[T1,-1.2,3.2]]},
 {name:'Bayern six-yard 1',role:'fcb',style:fcb({build:{height:1.9},seed:22}),keys:[[T0,-4.6,1.4],[-2,-4.8,1.1],[0,-5,.9],[TF,-4.6,1.3],[T1,-4.2,.8]]},
 {name:'Bayern six-yard 2',role:'fcb',style:fcb({skin:SKIN_M,seed:23}),keys:[[T0,-4.8,-2.4],[-2,-5,-2.2],[0,-5.3,-2],[TF,-5,-1.4],[T1,-4.6,-1]]},
 {name:'Bayern zone 1',role:'fcb',style:fcb({build:{height:1.87},seed:24}),keys:[[T0,-7.8,4.8],[-2,-7.6,4.4],[0,-7.4,4.2],[TF,-6.8,3.8],[T1,-6.4,3.2]]},
 {name:'Bayern zone 2',role:'fcb',style:fcb({skin:SKIN_M,seed:25}),keys:[[T0,-8.6,.6],[-2,-8.4,.4],[0,-8.2,.3],[TF,-7.6,.8],[T1,-7.2,1]]},
 {name:'Bayern far post',role:'fcb',style:fcb({build:{height:1.84},seed:26}),keys:[[T0,-6.2,-5.2],[0,-6.4,-4.8],[TF,-6.2,-4],[T1,-5.8,-3.2]]},
 {name:'Bayern edge',role:'fcb',style:fcb({seed:27}),keys:[[T0,-15.6,2.8],[-2,-15.4,2.4],[0,-15.2,2.2],[TF,-13.6,2],[T1,-12.8,2.2]]},
 {name:'Bayern back',role:'fcb',style:fcb({skin:SKIN_M,build:{height:1.86},seed:28}),keys:[[T0,-12.8,-4.6],[-2,-12.6,-4.4],[0,-12.4,-4.2],[TF,-11,-3.4],[T1,-10.2,-2.8]]},
 {name:'Chelsea attacker 1',role:'che',style:che({skin:SKIN_M,build:{height:1.89},hairStyle:'curly',seed:41}),keys:[[T0,-6.8,-1.4],[-2,-6.6,-1.2],[0,-6.4,-1],[TF,-5.6,-.4],...toFlag(-5.2,0,0)]},
 {name:'Chelsea attacker 2',role:'che',style:che({build:{height:1.93},seed:42}),keys:[[T0,-8.4,-3.8],[-2,-8.2,-3.6],[0,-8,-3.4],[TF,-7,-2.4],...toFlag(-6.8,-2,1)]},
 {name:'Chelsea attacker 3',role:'che',style:che({skin:SKIN_D,seed:43}),keys:[[T0,-9.4,3.6],[-2,-9.2,3.2],[0,-9,3],[TF,-8,3.4],...toFlag(-7.4,3.6,2)]},
 {name:'Chelsea attacker 4',role:'che',style:che({seed:44}),keys:[[T0,-14.4,-.6],[-2,-14.2,-.4],[0,-14,-.3],[TF,-12.8,.6],...toFlag(-12,1.4,3)]},
];
const DRO=0,MAT=1,GK=2,MARK=3;
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
/** placed in the quadrant (Mata sets it down early) → the corner → the header → the roof of the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.12)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.12));
 const u=clamp((tau-TG-.12)/.55),b=u>=1?.12*Math.abs(Math.sin((tau-TG-.67)*9))*Math.exp(-(tau-TG-.67)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*5:TF*TAU*5-(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.06?0:Math.exp(-(tau-TG-.06)*2.4)*(1+.3*Math.sin((tau-TG)*14));

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
/** Neuer: set, then only a flinch — a half dive to his left (+z, the near post) that starts as the ball is already past him */
const FLINCH=(u:number)=>keeperDive(clamp(u),{side:'l',height:.7}),T_FL=TF+.1,FL_L=1.1;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'dro':{
   // eyes on the corner, the burst to the near post, the spring, the header snapped toward goal, the landing, the run to the flag
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=droHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   if(tau<-.6){yaw=faceYaw(k,tau,P0);}
   const w=sm(TJ-.5,TJ-.15,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'mat':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'l'}),w);
   if(tau<-4.8&&tau>-6.6){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   if(tau>-3.6&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_M,sm(-2.2,-1.2,tau));}
   yaw=lerpAng(yaw,YAW_M,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.4,.8,tau)*(1-sm(TF-.7,TF-.5,tau)));
   if(tau>T_FL-.1){pose=blendPose(pose,FLINCH((tau-T_FL)/FL_L),.45*sm(T_FL-.1,T_FL+.1,tau)*(1-sm(TG+.9,TG+1.5,tau)));}
   if(tau>TG+1.2)pose=blendPose(pose,DEJECT,sm(TG+1.4,TG+2.2,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.05));if(tau>TF+.4)yaw=lerpAng(yaw,Math.PI,sm(TF+.4,TF+1,tau));break;}
  case 'mark':{// beaten to the near post: a late, lower jump behind Drogba, then hands on hips
   if(tau>TF-.5&&tau<TF+1){const hp=header(clamp((tau-(TF-.35))/.95));hp.air*=.45;pose=blendPose(pose,hp,sm(TF-.5,TF-.35,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'fcb':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'che':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the header, the flinch). */
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
const FULL_CAP=3;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null,cap=FULL_CAP):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,preview=s.arrival<PASSAGE.seam-1e-3,scr0=s._passage.screen,passing=!!s._passage.pending||preview;// the outgoing shot of a passage, or the incoming preview (arrival < .88 only inside a passage, never a settled frame, so the seam stays exact)
 // heat cap: at most FULL_CAP big non-hero figures print at full detail (the nearest); the rest of a crowded box prints 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>cap?near[cap-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  // true off-canvas cull (reads the live transform, so it also holds inside the passage's zoom): a figure wholly outside the card is skipped
  // (in the incoming preview the visible window is the aperture's screen polygon, so cull against its bounds instead)
  {const d=m.transformPoint(new DOMPoint(g[0],g[1])),rr=k*ppu*s.dpr;let x0=0,y0=0,x1=s.width*s.dpr,y1=s.height*s.dpr;
   if(preview&&scr0){x0=Math.max(x0,Math.min(...scr0.map(p=>p[0])));x1=Math.min(x1,Math.max(...scr0.map(p=>p[0])));y0=Math.max(y0,Math.min(...scr0.map(p=>p[1])));y1=Math.min(y1,Math.max(...scr0.map(p=>p[1])));}
   if(d.x<x0-rr||d.x>x1+rr||d.y<y0-rr||d.y>y1+rr)continue;}
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:number}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===DRO&&tau>TJ-.4&&tau<TF+.3)||(k===MAT&&tau>-.25&&tau<.35)||(k===GK&&tau>T_FL&&tau<T_FL+.6))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]},o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time (×≈1), anchored so his forehead meets it on "powers a header" (the corner is struck on or just after "whips it in") */
function tau1(t:number){const tW=CUE(0,'whips it in')-.05,tH=CUE(0,'powers a header')+.1,k=clamp(TF/Math.max(.5,tH-tW),.85,1.15),tX=tH-TF/k;return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-24,21,-64];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-8,0,10],fov:25})],
  [CUE(0,'Bayern lead')-.2,1.4,()=>({P:P1,T:[-7,1,1.5],fov:12})],
  [CUE(0,'two minutes')+.6,1.2,()=>({P:P1,T:mix3(at(MAT,tau,.9),[-4,1,20],.4),fov:12})],
  [CUE(0,'first corner')-.1,1,()=>({P:P1,T:mix3(at(MAT,tau,1),P0,.35),fov:3.3})],
  [CUE(0,'whips it in')+.05,.9,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.3+.3*b[1],0]),[HP[0],1.5,HP[1]],.3+.5*sm(0,TF,tau)),fov:lerp(11,13,sm(-.1,.6,tau))})],
  [CUE(0,'powers a header')-.3,.6,()=>({P:P1,T:[HP[0]+1.4,1.4,HP[1]-.3],fov:4.2})],
  [CUE(0,'One-all')-.4,1.5,()=>{const w=at(DRO,tau,1.2);return{P:P1,T:mix3(w,[-2,1.2,4],.35),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'One-all'),tN=CUE(0,'powers a header')+.3;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tA-.2,tA+.3,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'powers a header')+.3;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind the near post, looking back out at Drogba
const tau2=(t:number)=>key(t,mono([[0,-1.3],[CUE(1,'sprints'),-.6],[CUE(1,'near post'),-.05],[CUE(1,'gets there first'),TJ-.1],[CUE(1,'forehead'),TF-.12],[CUE(1,'power it'),TF+.02],[CUE(1,'top corner'),TG+.1],[SECS(1)-.2,TG+.7]]),linear);
const E2:V3=[3.4,.9,8.6];
function cam2(t:number):Cam{
 const tau=tau2(t),r=at(DRO,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-9,1.2,-.5],fov:34})],
  [CUE(1,'sprints')-.2,1,()=>({P:E2,T:mix3(r,[HP[0],1.3,HP[1]],.25),fov:24})],
  [CUE(1,'gets there')-.3,1,()=>({P:add3(E2,[0,.2,-.3]),T:[HP[0],1.9,HP[1]],fov:18})],
  [CUE(1,'forehead')-.2,.8,()=>({P:add3(E2,[0,.3,-.4]),T:[HEAD_PT[0]+.3,HEAD_PT[1]-.45,HEAD_PT[2]],fov:17})],
  [CUE(1,'top corner')-.1,1.1,()=>({P:add3(E2,[0,.3,-.4]),T:mix3([HEAD_PT[0],1.5,HEAD_PT[2]],[0,1.5,3.2],.7),fov:40})],
 ]);
}
/** the replay trail: the corner's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.55,tau));
  const r=play(s,c,tau,tp,{smear:true,min:10,cap:2});
  // the touch: a spark on his forehead at contact
  const hit=(tau-TF)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'power it')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal, the header comes at the camera
const tau3=(t:number)=>key(t,mono([[0,-.2],[CUE(2,'how fast'),TF-.08],[CUE(2,'keeper'),TG+.05],[CUE(2,'no time'),TG+.5],[CUE(2,'Chelsea win'),TG+1.6],[CUE(2,'penalties'),TG+2.8],[SECS(2),TG+4.8]]),linear);
const E3:V3=[10.5,5.2,7];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(DRO,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-7,1.4,1.5],fov:32})],
  [CUE(2,'how fast')-.4,.9,()=>({P:E3,T:[-3.5,1.8,2.6],fov:24})],
  [CUE(2,'keeper')+.2,1.2,()=>({P:E3,T:[-.6,1.5,2],fov:22})],
  [CUE(2,'Chelsea win')-.2,1.8,()=>({P:[7,7.5,10],T:r,fov:26})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tW=CUE(2,'Chelsea win'),tE=CUE(2,'penalties');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tW-.1,tW+.3,t)*.8,sm(tE,tE+.3,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the replay graphic: the header's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(DRO,tau3(twos(t))),sk=solve(p.pose,B_DRO,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'keeper')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
/** the near-post zone: the ground in front of the near post, just inside the six-yard box */
const NPZ:V3=[-4.6,0,3.3];
const tau4=(t:number)=>key(t,mono([[0,-1.1],[CUE(3,'Get there first'),-.55],[CUE(3,'jump'),TJ+.05],[CUE(3,'power your header'),TF-.05],[CUE(3,'where you aim'),TF+.08],[SECS(3),TG+.55]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(DRO,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-11,2.6,10.5],T:[-6.4,1,1.8],fov:44})],
  [CUE(3,'Get there')-.2,1,()=>({P:[-10.5,1.8,10],T:mix3(w,[HP[0],1,HP[1]],.45),fov:38})],
  [CUE(3,'jump')-.2,.8,()=>({P:[-9.8,1.5,9.4],T:[HP[0]+.3,1.6,HP[1]],fov:25})],
  [CUE(3,'power')-.2,.8,()=>({P:[-9.8,1.7,9.2],T:mix3([HEAD_PT[0],HEAD_PT[1]-.2,HEAD_PT[2]],[0,2,3.2],.35),fov:27})],
  [CUE(3,'where you aim')+.1,.9,()=>({P:[-10.2,1.9,9.4],T:mix3([HEAD_PT[0],HEAD_PT[1]-.3,HEAD_PT[2]],[0,1.8,3.2],.5),fov:40})],
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
/** a flat dashed ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<12;i++)gaps.push([(i+.66)/12,(i+.96)/12]);
 const d=ribbon(pts.concat([pts[0]]),Math.max(7,kAt(c,P)*.11),{seed:31,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
/** a target ring standing in the goal mouth (the goal-line plane x = 0) */
function goalRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 if(a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0],P[1]+Math.sin(u)*rad,P[2]+Math.cos(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const d=ribbon(pts.concat([pts[0]]),Math.max(6,kAt(c,P)*.07),{seed:37,taper:0,wobble:.6,pressure:.2});s.knockout(d,.85*a);s.fill(ink,d,.95*a);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tA=CUE(3,'Attack'),tG=CUE(3,'Get there first'),tJp=CUE(3,'jump'),tP=CUE(3,'power your header'),tW=CUE(3,'where you aim');
  stadium(s,c,t,[0,1,3],{roar:.35+.4*sm(tA,tA+.6,t)*(1-sm(tG+.6,tG+1.4,t))+.6*sm(tP+.2,tP+.8,t)});
  ground(s,c);
  // "Attack the near post": a red ring on the near-post zone and an arrow of the run into it
  const ap=sm(tA-.1,tA+.4,t)*(1-sm(tJp+.2,tJp+.8,t));groundRing(s,c,NPZ,1.5,R,ap);
  if(ap>0){const pts:V3[]=[];const u=sm(tA,tA+1,t,easeInOutSine);for(let i=0;i<=8;i++){const[x,z]=herm(ACTORS[DRO].keys,lerp(-.55,TJ-.05,u*i/8));pts.push([x,.02,z]);}arrow3(s,c,pts,Math.max(8,kAt(c,NPZ)*.08),R,.9*ap);}
  // "Get there first": his run's footprints light up in order as he arrives ahead of his marker
  const run=sm(tG-.2,tG+.3,t)*(1-sm(tP+.2,tP+.8,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<9;k++){const Tk=-.55+k*((TJ-.05+.55)/8),[x,z]=posOf(DRO,Tk),v=velOf(DRO,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[DRO,GK,MARK]});
  // "jump": a spark under his take-off, an up arrow beside him
  const jp=sm(tJp-.1,tJp+.3,t)*(1-sm(tP,tP+.4,t));
  if(jp>0){const q=pr(c,[HP[0],.05,HP[1]]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(70,kAt(c,[HP[0],0,HP[1]])*.7)*jp,{n:9,seed:41,g:easeOutBack(jp),width:12});
   const side:V3=[HP[0]-1,0,HP[1]+.7];arrow3(s,c,[add3(side,[0,.4,0]),add3(side,[0,.4+.8*jp,0]),add3(side,[0,.4+1.6*jp,0])],Math.max(9,kAt(c,side)*.09),R,.95*jp);}
  // "power your header": a ring on the ball, his forehead glows, power lines off the ball
  const pw=sm(tP-.2,tP+.2,t);
  if(pw>0&&r.ball&&tau<TF+.08){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp_=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*pw);s.fill(Y,rp_,.95*pw);}
  if(pw>0){const st=stateOf(DRO,tau),sk=solve(st.pose,B_DRO,st.place),h=sk.head,fc=sk.face,fp=add3(h,mul3(sub3(fc,h),1.05)),q=pr(c,add3(fp,[0,.05,0])),fade=1-sm(tW+1.2,tW+1.8,t);
   if(q){const rr=kAt(c,fp)*.07*clamp(pw,0,1.2),glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8*fade);s.fill(Y,glow,.9*fade);}
   if(r.ball&&tau>TF&&tau<TG+.3){const b=pr(c,ballAt(tau)),a=pr(c,HEAD_PT);if(b&&a)speedLines(s,R,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:13,len:Math.max(90,Math.hypot(b[0]-a[0],b[1]-a[1])),spread:r.ball.r*1.4,width:Math.max(4,r.ball.r*.25),cov:.9});}}
  // "where you aim": a target ring in the top corner, and the header's path drawn into it
  const aim=sm(tW-.25,tW+.2,t);
  if(aim>0){goalRing(s,c,GOAL_PT,.34,R,aim);
   const arr=sm(tW,tW+.9,t,easeInOutSine);if(arr>0){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*arr*i/8));arrow3(s,c,pts,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95);}}
 },
 get still(){return CUE(3,'where you aim')+.3;},
};

const film:RisoStory={
 id:'drogba-header-2012',format:'11v11',title:"Drogba's near-post header",
 theme:'Attack the near post: get there first, jump, and power your header where you aim',
 ageNote:'Bayern Munich 1–1 Chelsea (Chelsea won 4–3 on penalties), Champions League final, Munich, 19 May 2012. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a near-post header — a ball whips in from the side, a yellow spark where it is met, and it is powered away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.35),fade=1-clamp((age-.55)/.2);
  const bx=age<.3?x-190*(1-u):x+240*easeOut(out),by=age<.3?y-90*(1-u)*(1-u)-10:y-40*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Bayern's goal line x = 0, +z = Chelsea's right) — checked by tests/play-film-drogba-header-2012.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,cornerFoot:'l' as const,
 mataContact:()=>{const st=stateOf(MAT,0),sk=solve(st.pose,B_MAT,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 drogbaAt:(tau:number)=>{const st=stateOf(DRO,tau),sk=solve(st.pose,B_DRO,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 markerAt:(tau:number)=>{const st=stateOf(MARK,tau),sk=solve(st.pose,fcb().build,st.place);return{head:sk.head};},
 neuerAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_NEU,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
