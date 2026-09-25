/** Wendie Renard's SIGNATURE film, "the towering header from a corner": her second goal in France 4–0 South Korea, the opening match of the
 * FIFA Women's World Cup 2019 (Group A), Friday 7 June 2019, 21:00 CEST kick-off, Parc des Princes, Paris (45,261). The goal came in first-half
 * stoppage time (45+2'). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or
 * StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("the towering header from a corner"; lesson: "Attack the ball at its highest
 * point and head it down towards goal"). On the World Cup's opening night Renard (1.87 m) scored TWO headers from corners and was Player of
 * the Match: "Renard leapt higher than all opposition — twice — to score with headers off corner kicks" (NYT). The second is the best
 * described (who took it, which side, where she stood, who marked her, where it went), so it is the film's goal.
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2019 FIFA Women's World Cup Group A" (raw wikitext: date, 21:00 kick-off, Parc des Princes, attendance 45,261, referee
 *    Claudia Umpiérrez, scorers Le Sommer 9', Renard 35' and 45+2', Henry 85'; line-ups with shirt numbers; Player of the Match Renard; the
 *    kit templates for this match — France navy shirts (0F244D), navy shorts, red socks; South Korea all white)
 *    https://en.wikipedia.org/wiki/2019_FIFA_Women%27s_World_Cup_Group_A
 *  - The Guardian, match report, "France 4-0 South Korea" (7 June 2019): "On the stroke of half time Renard scored another, this time a corner
 *    from the left was almost placed onto her head near the penalty spot and, with Hwang Bo-ram attempting to mark her, she powered the ball
 *    over the head of the defender and to the right of a stationary Kim." Also: rain before kick-off, then "the sun came out and the
 *    floodlights beamed"; her first (35') was "another Thiney corner from the right … headed powerfully past Kim" at the far post.
 *    https://www.theguardian.com/football/2019/jun/07/france-women-south-korea-world-cup-match-report
 *  - The Guardian live blog (search-result excerpt): "Majri lifts the corner into the middle from the left and Renard rises highest to plant a
 *    fine header, her second of the evening, into the right corner."
 *  - The Telegraph live report (search-result excerpt): "She repeated the trick just before half-time, deflecting Amel Majri's beautifully
 *    directed corner into the Korean goal while standing on the penalty spot. The power endangered the netting."
 *  - Ouest-France player ratings (search-result excerpt): "MAJRI … Passeuse décisive sur le deuxième but de Renard sur corner (45'+2)."
 *  - AP via the Philadelphia Inquirer and the New York Times (search-result excerpts): a pair of headers off corner kicks, 4–0.
 * CONFIRMED: France 4–0 South Korea, 7 June 2019, Parc des Princes, the World Cup opener; Renard's second goal at 45+2' — a corner from the
 * LEFT taken by Amel Majri (10), met by Renard (3) near / on the penalty spot, Hwang Bo-ram (4) marking her, headed powerfully over the
 * defender, into the right corner, past a STATIONARY Kim Min-jeong (18, the keeper); her second header of the night; France win 4–0. Kits:
 * France navy / navy / red socks, South Korea all white (Wikipedia kit templates for this match).
 * INFERRED (illustrative reconstruction, never named in the narration): Majri's kicking foot (drawn LEFT — she is a left-sided player — so
 * from the left flag the corner is an OUT-swinger bending away from goal toward the spot); every position, run and timing in metres and
 * seconds (the corner ≈ 34 m in ≈ 1.6 s, apex ≈ 4.5 m; Renard stepping in ≈ 2.5 m onto the spot and jumping ≈ .45 m; the header ≈ 11 m in
 * ≈ .5 s, crossing the line low, ≈ .5 m up); "into the right corner" read from the attacker's view (+z); Hwang Bo-ram just goal-side of her,
 * jumping late and lower; everyone else in the box and their places (no numbers except the four named); the keeper's kit (drawn yellow);
 * hair and builds; the celebrations; the direction of play on screen (France attack left → right, the main camera on the side opposite the
 * corner); Parc des Princes' look (a closed two-tier concrete bowl under a continuous roof with floodlights in its lip, blue seats), the
 * crowd colours and flags; the dusk light at ≈ 21:47; TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the crowded box, Majri at the far corner flag,
 * the corner swinging in, Renard rising on the spot, the header, the net, she runs off); ch2 = the TV slow-motion REPLAY from a low
 * pitch-side camera, side-on to her leap (she waits, jumps, meets it at the top of her leap, heads it over her marker), with a replay trail
 * on the corner; ch3 = a second REPLAY angle, high behind the goal, off the far post: the header flies across the frame past the stationary keeper, then the
 * celebration; ch4 = the lesson: a close, very slow replay with teaching marks (the run onto the ball, a ring on the ball at the highest
 * point of her leap with an up arrow, the head-it-down arrow and a target ring low in the corner). Composed on the FULL sheet (world units =
 * sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion so the ponytails swing, motionSmear on the corner, the header). Women footballers: per-player builds (height, slimmer bulk)
 * and ponytails. Handedness: the world is right-handed (x toward Korea's goal, y up, +z = France's right), exactly athlete.ts's convention, so
 * Majri's strike({foot:'l'}) is her LEFT foot and the corner from France's LEFT is the −z corner; header() is symmetric, and Renard's redirect
 * is a snap of the head and shoulders to her RIGHT (toward the +z corner of the goal). Inks: yellow, red, blue, navy. Everything is keyed to
 * cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small figures print
 * at 'low', at most three non-hero figures print at full detail, every figure inside a passage is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc,PASSAGE} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Opening night',text:'Paris, 2019, the Women\'s World Cup opener: France against South Korea. Just before half-time, Amel Majri swings in a corner from the left... Wendie Renard rises and powers it in!',tail:2.4,
  cues:['Paris','World Cup opener','France against','Just before half-time','Amel Majri','swings in','Wendie Renard','rises','powers it in']},
 {label:'Watch it again',text:'Watch again, slowly. Renard waits near the penalty spot. She jumps, meets the ball at the top of her leap, and heads it over her defender.',tail:1.6,
  cues:['Watch again','waits','She jumps','top of her leap','over her defender']},
 {label:'Behind the goal',text:'From behind the goal: the keeper doesn\'t move. Her second header of the night! France win four–nil.',tail:2.2,
  cues:['From behind','keeper','second header','France win']},
 {label:'Up, then down',text:'The secret? Attack the ball at its highest point, then head it down towards goal.',tail:2.2,
  cues:['The secret','Attack the ball','highest point','head it down','towards goal']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/renard-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/renard-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/renard-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('renard: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('renard: no cue '+w);return c.at;};
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
/** Pitch: Korea's goal line is x = 0 (France attack +x), goal centre z = 0, +z = France's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- Parc des Princes at dusk: a closed two-tier concrete bowl, one continuous roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z, behind the corner flag), 1 behind Korea's goal (+x), 2 the main stand
 * (+z, the camera side), 3 the other end. Closed corners: the stands run past the goal lines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-124,20,a),1.2+26*b,-40-24*b],
 (a,b)=>[8+24*b,1.2+25*b,lerp(-60,60,a)],
 (a,b)=>[lerp(20,-124,a),1.2+26*b,40+24*b],
 (a,b)=>[-112-24*b,1.2+25*b,lerp(60,-60,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] */
const CORNERS:[number,number,number,number][]=[[0,1,1,0],[1,1,2,0],[2,1,3,0],[3,1,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=13,TIER=[.46];
/** flags on the stand fronts: [stand, a] — the tricolore (blue | paper | red) */
const FLAGS:[number,number][]=[[0,.22],[0,.4],[0,.58],[0,.76],[1,.2],[1,.42],[1,.66],[1,.84],[2,.3],[2,.55],[3,.3],[3,.66]];
/** where the Korean red sits (inferred): a patch behind the far end, a patch of the far side */
const koreaAt=(si:number,a:number)=>si===3&&a>.55&&a<.8?.5:si===0&&a>.08&&a<.2?.4:.03;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a June dusk in Paris (≈ 21:47, the sun just down after the rain): deep blue sky, a warm band low down under the roof lip
 s.field(B,.42,.5);s.field(K,.18,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.26);s.tone(R,polyPath([[-1e4,hz[1]-220],[1e4,hz[1]-220],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.14);}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.3,tier);
  // the continuous concrete roof: a deep overhang over the top rows, a paper lip where the floodlights sit
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.7),[0,9,0]),add3(S(0,.7),[0,9,0])]));
  seg3(c,add3(S(0,.7),[0,8.8,0]),add3(S(1,.7),[0,8.8,0]),.5,edge);}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.7),[0,9,0]),add3(A(ai,.7),[0,9,0])]));}
 // blue seats under the crowd, a paper tier fascia
 s.knockout(planes);s.tone(B,planes,.6);s.tone(K,planes,.18);s.knockout(tier,.8);
 // the crowd: seeded dots (French blue, white and red; a little Korean red), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,15);if(h<.2)continue;const a=(i+.5+(hash(i+j*31,11)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hk=hash(i*7+j*53+si*3,23),ink=hk<koreaAt(si,a)?1:h<.5?0:h<.72?2:h<.9?1:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.9);
 s.knockout(roof);s.tone(K,roof,.55);s.knockout(edge,.8);
 // tricolore flags on the stand fronts
 const fl=new Path2D(),blue=new Path2D(),red=new Path2D();
 for(const[si,a] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  addPoly(blue,polyP(c,[P(0,.005),P(1/3,.005),P(1/3,.075),P(0,.075)]));addPoly(red,polyP(c,[P(2/3,.005),P(1,.005),P(1,.075),P(2/3,.075)]));}
 s.knockout(fl);s.fill(B,blue,.95);s.fill(R,red,.95);
 // floodlights set into the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<9;k++){const u=(k+.5)/9,a=add3(S(u-.02,.7),[0,8.4,0]),b=add3(S(u+.02,.7),[0,8.4,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.9,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-44],[13,0,-44],[13,0,44],[-118,0,44]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the pitch, every 5.25 m (still damp from the rain: a touch darker)
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.14);
 // advertising boards: navy with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.6,0,-37.5],[5.6,0,37.5]);board([-110,0,-37.5],[5.6,0,-37.5]);board([-110,0,37.5],[5.6,0,37.5]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.5,.25,z],[5.5,.25,z+3.3],[5.5,.68,z+3.3],[5.5,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.25);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 addPoly(ln,polyP(c,Array.from({length:10},(_,i)=>[-11+Math.cos(i/10*TAU)*.12,0,Math.sin(i/10*TAU)*.12] as V3)));
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** Korea's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (bz) */
function goalNet(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.3,0,1.3,2.6,z1];
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
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W=(height:number,bulk=.9):Build=>({height,bulk,head:.97});
/** France: navy shirts and shorts, red socks (Wikipedia kit template, this match); paper numbers, red trim (inferred) */
const fra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,shorts:K,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:'paper',hairStyle:'ponytail',build:W(1.68),...o});
/** South Korea: all white (Wikipedia kit template, this match); red numbers and trim (inferred) */
const kor=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:[R,.95],hairStyle:'ponytail',build:W(1.65),...o});
const B_REN=W(1.87,.97),B_MAJ=W(1.64),B_KIM=W(1.72,.95),B_HWA=W(1.7);
const REN_ST=fra({number:3,skin:SKIN_D,hair:K,build:B_REN,seed:3});
const MAJ_ST=fra({number:10,skin:SKIN_M,hair:K,build:B_MAJ,seed:10});
const HWA_ST=kor({number:4,build:B_HWA,seed:4});
/** the keeper's kit colour is not in the sources: drawn yellow with navy shorts (inferred) */
const KIM_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.85],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:18,numberInk:K,build:B_KIM,seed:18};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Majri's corner)
const BALL_R=.11,GRAV=9.81;
/** the lifted corner flies TF s to Renard's forehead; her header reaches the goal line TG (a powered header from the spot, ≈ 11 m) */
const TF=1.6,TG=TF+.52;
/** Renard's header spot (her pelvis): on the penalty spot. She faces between the incoming ball (from the −z flag) and the goal. */
const HP:[number,number]=[-11.2,-.35],YAW_H=yawTo(.87,-.49);
/** Renard's header pose: header() from a short step-in (a lower spring than a sprinting leap), the head + shoulders snapping to her RIGHT */
function renHeader(u:number):Pose{const p=header(clamp(u));p.air*=.78;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.18);
 p.neckY-=lerp(-.1,.48,sn)*w;p.twist-=lerp(-.06,.3,sn)*w;p.neckP+=.08*w;return p;}
/** contact on the header clock: mid-snap, forehead driving through the ball */
const CU=.48,HD=.95,TJ=TF-CU*HD;
/** her forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(renHeader(CU),B_REN,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the quadrant at the −z corner flag, France's left) */
const P0:V3=[-.45,BALL_R,-33.55];
/** the out-swinger (a left foot from the left flag): a steady sideways pull AWAY from goal (−x) on top of gravity */
const SWING:V3=[-2.2,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Majri strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_M=yawTo(DC[0],DC[1]);
/** where Majri's pelvis stands at contact so her LEFT boot meets the back of the ball (solved once, FK) */
const PCM:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),B_MAJ,{x:0,z:0,yaw:YAW_M});return[P0[0]-DC[0]*.12-sk.lToe[0],P0[2]-DC[1]*.12-sk.lToe[2]];})();
/** the run-up: from behind the ball and to its right (a left-footer's angle) */
const RIGHT_M:[number,number]=[-DC[1],DC[0]],RUN0:[number,number]=[PCM[0]-DC[0]*2.4+RIGHT_M[0]*1.8,PCM[1]-DC[1]*2.4+RIGHT_M[1]*1.8];
/** where the header crosses the goal line: LOW, to the keeper's left = the right corner from France's view (+z) */
const GOAL_PT:V3=[0,.5,2.55],NET_HIT:V3=[1.5,.4,2.8],REST:V3=[1.1,BALL_R,2.5];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='ren'|'maj'|'gk'|'mark'|'fra'|'kor';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=12,DT=.02;
const mp=(u:number):[number,number]=>[PCM[0]+DC[0]*u,PCM[1]+DC[1]*u];
/** after the goal the France players chase Renard toward the main-stand touchline */
const toRen=(x:number,z:number,k:number):number[][]=>[[TG+1+k*.2,x,z],[TG+4+k*.3,lerp(x,-8.6,.6),lerp(z,14,.6)],[T1,lerp(x,-8,.8),lerp(z,21,.85)]];
const ACTORS:Actor[]=[
 {name:'Wendie Renard',role:'ren',hero:true,style:REN_ST,keys:[[T0,-13.5,-2.3],[-6,-13.1,-1.8],[-3,-13.7,-2.2],[-1,-13.3,-1.9],[.3,-12.9,-1.5],[TJ-.35,HP[0]-.6,HP[1]-.45],[TJ-.05,HP[0],HP[1]],[TF+.45,HP[0]+.3,HP[1]+.25],[TF+1.4,-10.4,3],[TF+3.6,-9.6,10],[TF+6.6,-8.6,18],[T1,-8,23]]},
 {name:'Amel Majri',role:'maj',hero:true,style:MAJ_ST,keys:[[T0,.6,-36.2],[-6.4,.2,-35.3],[-5.2,...mp(-.7)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...mp(-1.4)],[0,...mp(0)],[.7,...mp(.9)],[3,...mp(3.4)],[T1,-4,-26]]},
 {name:'Kim Min-jeong',role:'gk',hero:true,style:KIM_ST,keys:[[T0,-.8,-.9],[0,-.9,-1.1],[TF,-1,-1],[T1,-1,-1]]},
 {name:'Hwang Bo-ram',role:'mark',hero:true,style:HWA_ST,keys:[[T0,-12.5,-1.3],[-3,-12.7,-1.5],[-1,-12.4,-1.2],[.3,-12,-.9],[TJ-.3,-10.8,-.2],[TF,-10.3,.25],[TF+.8,-10,.5],[T1,-9.8,.7]]},
 {name:'Korea near post',role:'kor',style:kor({seed:21}),keys:[[T0,-.8,-4.4],[0,-.7,-4.2],[TF,-1,-3.9],[T1,-1.2,-3.3]]},
 {name:'Korea six-yard 1',role:'kor',style:kor({seed:22}),keys:[[T0,-4.6,-1.6],[-2,-4.8,-1.3],[0,-5,-1.1],[TF,-4.6,-.8],[T1,-4.2,-.6]]},
 {name:'Korea six-yard 2',role:'kor',style:kor({build:W(1.68),seed:23}),keys:[[T0,-4.9,2.4],[-2,-5.1,2.2],[0,-5.3,2],[TF,-5,1.5],[T1,-4.6,1.1]]},
 {name:'Korea zone 1',role:'kor',style:kor({build:W(1.7),seed:24}),keys:[[T0,-7.8,-4.8],[-2,-7.6,-4.4],[0,-7.4,-4.2],[TF,-6.8,-3.6],[T1,-6.4,-3.1]]},
 {name:'Korea zone 2',role:'kor',style:kor({seed:25}),keys:[[T0,-8.2,1.4],[-2,-8,1.2],[0,-7.8,1],[TF,-7.4,1.4],[T1,-7,1.6]]},
 {name:'Korea far post',role:'kor',style:kor({build:W(1.66),seed:26}),keys:[[T0,-6.2,5.2],[0,-6.4,4.8],[TF,-6.2,4],[T1,-5.8,3.4]]},
 {name:'Korea edge',role:'kor',style:kor({build:W(1.61),seed:27}),keys:[[T0,-17.4,-3.2],[-2,-17.2,-2.8],[0,-17,-2.6],[TF,-15.4,-1.6],[T1,-14.6,-1.2]]},
 {name:'Korea back',role:'kor',style:kor({build:W(1.64),seed:28}),keys:[[T0,-13.4,4.6],[-2,-13.2,4.4],[0,-13,4.2],[TF,-11.8,3.4],[T1,-11,2.9]]},
 {name:'France attacker 1',role:'fra',style:fra({skin:SKIN_D,build:W(1.72),seed:41}),keys:[[T0,-6.8,-1.2],[-2,-6.6,-1],[0,-6.4,-.8],[TF,-5.8,-.2],...toRen(-5.6,.2,0)]},
 {name:'France attacker 2',role:'fra',style:fra({build:W(1.7),seed:42}),keys:[[T0,-8.6,3.8],[-2,-8.4,3.6],[0,-8.2,3.4],[TF,-7.2,2.8],...toRen(-7,3,1)]},
 {name:'France attacker 3',role:'fra',style:fra({skin:SKIN_M,seed:43}),keys:[[T0,-9.4,-3.8],[-2,-9.2,-3.5],[0,-9,-3.3],[TF,-8.4,-2.8],...toRen(-8,-2.4,2)]},
 {name:'France attacker 4',role:'fra',style:fra({build:W(1.62),seed:44}),keys:[[T0,-18.4,1.4],[-2,-18.2,1.2],[0,-18,1.1],[TF,-16,1.4],...toRen(-15,2,3)]},
];
const REN=0,MAJ=1,GK=2,MARK=3;
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
/** placed in the quadrant (Majri sets it down early) → the corner → the header → the back of the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.12)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.12));
 const u=clamp((tau-TG-.12)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.62)*9))*Math.exp(-(tau-TG-.62)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*4:TF*TAU*4-(tau-TF)*TAU*3;
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
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'ren':{
   // eyes on the corner, the step onto the spot, the spring, the header snapped toward goal, the landing, the run to the touchline
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=renHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   if(tau<.2){yaw=faceYaw(k,tau,P0);}
   const w=sm(TJ-.5,TJ-.15,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'maj':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'l'}),w);
   if(tau<-4.8&&tau>-6.6){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   if(tau>-3.6&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_M,sm(-2.2,-1.2,tau));}
   yaw=lerpAng(yaw,YAW_M,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'gk':{// "a stationary Kim": set on her toes, she never moves toward it; then turns to look at the net
   pose=keeperSet(tau*1.3);
   if(tau>TG+1)pose=blendPose(pose,DEJECT,sm(TG+1.2,TG+2,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF));if(tau>TG+.3)yaw=lerpAng(yaw,Math.PI*.75,sm(TG+.3,TG+.9,tau));break;}
  case 'mark':{// Hwang Bo-ram: goal-side of Renard, a late, lower jump — the header goes over her head
   if(tau>TF-.5&&tau<TF+1){const hp=header(clamp((tau-(TF-.4))/.95));hp.air*=.4;pose=blendPose(pose,hp,sm(TF-.5,TF-.35,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'kor':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'fra':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the header). */
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
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,preview=s.arrival<PASSAGE.seam-1e-3,scr0=s._passage.screen,passing=!!s._passage.pending||preview;
 // heat cap: at most `cap` big non-hero figures print at full detail (the nearest); the rest of a crowded box prints 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>cap?near[cap-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  // true off-canvas cull (reads the live transform, so it also holds inside the passage's zoom)
  {const d=m.transformPoint(new DOMPoint(g[0],g[1])),rr=k*ppu*s.dpr;let x0=0,y0=0,x1=s.width*s.dpr,y1=s.height*s.dpr;
   if(preview&&scr0){x0=Math.max(x0,Math.min(...scr0.map(p=>p[0])));x1=Math.min(x1,Math.max(...scr0.map(p=>p[0])));y0=Math.max(y0,Math.min(...scr0.map(p=>p[1])));y1=Math.min(y1,Math.max(...scr0.map(p=>p[1])));}
   if(d.x<x0-rr||d.x>x1+rr||d.y<y0-rr||d.y>y1+rr)continue;}
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goalNet(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:number}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===REN&&tau>TJ-.4&&tau<TF+.3)||(k===MAJ&&tau>-.25&&tau<.35)||(k===MARK&&tau>TF-.4&&tau<TF+.2))};});
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
/** τ from chapter time: real time (×≈1), anchored so her forehead meets it on "powers it in" */
function tau1(t:number){const tW=CUE(0,'swings in')-.05,tH=CUE(0,'powers it in')+.05,k=clamp(TF/Math.max(.5,tH-tW),.85,1.15),tX=tH-TF/k;return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-24,21,64];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-8,0,-10],fov:25})],
  [CUE(0,'France against')-.2,1.4,()=>({P:P1,T:[-8,1,-1.5],fov:12.5})],
  [CUE(0,'Just before')+.4,1.2,()=>({P:P1,T:mix3(at(MAJ,tau,.9),[-4,1,-20],.4),fov:11})],
  [CUE(0,'Amel Majri')-.1,1,()=>({P:P1,T:mix3(at(MAJ,tau,1),P0,.35),fov:3.6})],
  [tau1Inv(-.35),.9,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.3+.3*b[1],0]),[HP[0],1.5,HP[1]],.3+.5*sm(0,TF,tau)),fov:lerp(12,13.5,sm(-.1,.6,tau))})],
  [tau1Inv(TF-.35),.6,()=>({P:P1,T:[HP[0]+2.2,1.3,HP[1]+.4],fov:5.6})],
  [tau1Inv(TG+.5),1.5,()=>{const w=at(REN,tau,1.2);return{P:P1,T:mix3(w,[-5,1.2,2],.35),fov:12};}],
 ]);
}
/** chapter time at which the play clock reads τ (the inverse of tau1) */
function tau1Inv(tau:number){const tW=CUE(0,'swings in')-.05,tH=CUE(0,'powers it in')+.05,k=clamp(TF/Math.max(.5,tH-tW),.85,1.15),tX=tH-TF/k;return tX+tau/k;}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tN=tau1Inv(TG);
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tN,tN+.3,t)*(1-sm(tN+2.2,tN+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return tau1Inv(TF+.05);},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay: a LOW pitch-side camera, side-on to her leap
const tau2=(t:number)=>key(t,mono([[0,-.9],[CUE(1,'waits'),-.2],[CUE(1,'She jumps'),TJ-.1],[CUE(1,'top of her leap'),TF-.1],[CUE(1,'over her defender'),TF+.12],[SECS(1)-.2,TG+.7]]),linear);
/** low on the main-stand side, ≈ 17 m from her, a long lens (the players between are left out of this replay so her leap reads clearly) */
const E2:V3=[-12.6,1.05,16.5];
const CH2_ONLY=ACTORS.map((_,k)=>k).filter(k=>!['Korea back','France attacker 2','Korea far post'].includes(ACTORS[k].name));
function cam2(t:number):Cam{
 const tau=tau2(t),r=at(REN,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(r,[-9,1.4,-6],.35),fov:24})],
  [CUE(1,'waits')-.2,1,()=>({P:E2,T:mix3(r,[HP[0],1.3,HP[1]],.4),fov:15})],
  [CUE(1,'She jumps')-.3,1,()=>({P:add3(E2,[.3,-.2,-.4]),T:[HP[0]+.3,2,HP[1]],fov:12})],
  [CUE(1,'top of')-.2,.8,()=>({P:add3(E2,[.4,-.3,-.6]),T:[HEAD_PT[0]+.4,HEAD_PT[1]-.35,HEAD_PT[2]],fov:10})],
  [CUE(1,'over her')+.2,1.1,()=>({P:add3(E2,[.6,-.2,-.6]),T:mix3([HEAD_PT[0],1.6,HEAD_PT[2]],[-5,1.3,1.5],.6),fov:24})],
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
  stadium(s,c,t,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.55,tau));
  const r=play(s,c,tau,tp,{smear:true,min:5,cap:2,only:CH2_ONLY});
  // the touch: a spark on her forehead at contact
  const hit=(tau-TF)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'top of her leap')+.3;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal (off the far post), the header flies across past the keeper
const tau3=(t:number)=>key(t,mono([[0,TF-.9],[CUE(2,'keeper'),TF-.05],[CUE(2,'keeper')+.9,TG+.1],[CUE(2,'second header'),TG+.8],[CUE(2,'France win'),TG+2.2],[SECS(2),TG+4.4]]),linear);
const E3:V3=[9.5,4.8,-6.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(REN,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-9,1.5,-.8],fov:30})],
  [CUE(2,'keeper')-.3,.9,()=>({P:E3,T:[-4.5,1.5,.6],fov:26})],
  [CUE(2,'second header')-.1,1.4,()=>({P:[8.5,6.5,-3],T:mix3(r,[-6,1,4],.3),fov:30})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tS=CUE(2,'second header'),tW=CUE(2,'France win');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tS-.1,tS+.3,t)*.7,sm(tW,tW+.3,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the replay graphic: the header's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.4,TG+.9,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  // "the keeper doesn't move": a dashed red ring round her feet, held while the ball flies past
  const km=sm(CUE(2,'keeper')-.1,CUE(2,'keeper')+.3,t)*(1-sm(tS-.2,tS+.3,t));if(km>0){const g=at(GK,tau,0);groundRing(s,c,g,.9,R,km);}
  const hit=(tau-TF)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(REN,tau3(twos(t))),sk=solve(p.pose,B_REN,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'keeper')+.7;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-.5],[CUE(3,'Attack the ball'),TJ-.5],[CUE(3,'highest point'),TF-.12],[CUE(3,'highest point')+.9,TF-.02],[CUE(3,'head it down'),TF+.05],[CUE(3,'towards goal'),TF+.35],[SECS(3),TG+.6]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(REN,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-14,2.2,9.5],T:mix3(w,[HP[0],1.2,HP[1]],.5),fov:40})],
  [CUE(3,'Attack')-.2,1,()=>({P:[-14.2,1.6,8.6],T:mix3(w,[HP[0],1.4,HP[1]],.45),fov:32})],
  [CUE(3,'highest')-.2,.8,()=>({P:[-14,1.5,8.2],T:[HEAD_PT[0]+.2,HEAD_PT[1]-.4,HEAD_PT[2]],fov:22})],
  [CUE(3,'head it down')-.2,.9,()=>({P:[-15,2.2,8.6],T:mix3([HEAD_PT[0],1.6,HEAD_PT[2]],[0,1,2.5],.45),fov:44})],
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
  const tS=CUE(3,'The secret'),tA=CUE(3,'Attack the ball'),tH=CUE(3,'highest point'),tD=CUE(3,'head it down'),tG=CUE(3,'towards goal');
  stadium(s,c,t,[0,1,3],{roar:.3+.3*sm(tS,tS+.6,t)+.6*sm(tG+.2,tG+.8,t)});
  ground(s,c);
  // "Attack the ball": a yellow ring on the spot and her step onto it, lit in order
  const ap=sm(tA-.1,tA+.4,t)*(1-sm(tD+.2,tD+.8,t));groundRing(s,c,[HP[0],0,HP[1]],1.1,Y,ap);
  if(ap>0){const pts:V3[]=[];const u=sm(tA,tA+.9,t,easeInOutSine);for(let i=0;i<=8;i++){const[x,z]=herm(ACTORS[REN].keys,lerp(.3,TJ-.05,u*i/8));pts.push([x,.02,z]);}arrow3(s,c,pts,Math.max(8,kAt(c,[HP[0],0,HP[1]])*.08),Y,.9*ap);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[REN,GK,MARK,MAJ]});
  // "highest point": an up arrow beside her and a ring on the ball at the top of her leap
  const hp=sm(tH-.2,tH+.25,t)*(1-sm(tD+.3,tD+.8,t));
  if(hp>0){const side:V3=[HP[0]-1.15,0,HP[1]+.2];arrow3(s,c,[add3(side,[0,.35,0]),add3(side,[0,.35+.8*hp,0]),add3(side,[0,.35+1.7*hp,0])],Math.max(9,kAt(c,side)*.09),R,.95*hp);
   const q=pr(c,HEAD_PT);if(q){const rr=kAt(c,HEAD_PT)*BALL_R*2.1,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr]);}const rp_=ribbon(ring,Math.max(5,rr*.16),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*hp);s.fill(Y,rp_,.95*hp);}}
  // her forehead glows at contact
  const fg=sm(tH,tH+.3,t)*(1-sm(tG+.8,tG+1.4,t));
  if(fg>0){const st=stateOf(REN,tau),sk=solve(st.pose,B_REN,st.place),h=sk.head,fc=sk.face,fp=add3(h,mul3(sub3(fc,h),1.05)),q=pr(c,add3(fp,[0,.05,0]));
   if(q){const rr=kAt(c,fp)*.07,glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8*fg);s.fill(Y,glow,.9*fg);}}
  // "head it down": the header's path drawn DOWN into the goal, power lines off the ball
  const dn=sm(tD-.15,tD+.8,t,easeInOutSine);
  if(dn>0){const pts:V3[]=[];for(let i=0;i<=10;i++)pts.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*dn*i/10));arrow3(s,c,pts,Math.max(9,kAt(c,HEAD_PT)*.05),R,.95);
   if(r.ball&&tau>TF&&tau<TG+.2){const b=pr(c,ballAt(tau)),a=pr(c,HEAD_PT);if(b&&a)speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:13,len:Math.max(80,Math.hypot(b[0]-a[0],b[1]-a[1])*.8),spread:r.ball.r*1.3,width:Math.max(4,r.ball.r*.22),cov:.85});}}
  // "towards goal": a target ring low in the corner
  const tg=sm(tG-.2,tG+.25,t);if(tg>0)goalRing(s,c,GOAL_PT,.45,Y,tg);
 },
 get still(){return CUE(3,'head it down')+.6;},
};

const film:RisoStory={
 id:'renard-signature',format:'11v11',title:"Renard's towering header",
 theme:'The towering header from a corner: attack the ball at its highest point, then head it down towards goal',
 ageNote:'France 4–0 South Korea, FIFA Women’s World Cup 2019 opening match, Parc des Princes, Paris, 7 June 2019 — Renard’s second header, 45+2′. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a towering header — a ball drops in from high on the left, a yellow spark at the top of the leap, and it is headed down and away.
  * Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.35),fade=1-clamp((age-.55)/.2);
  const bx=age<.3?x-200*(1-u):x+220*easeOut(out),by=age<.3?y-140*(1-u)*(1-u)-10+40*u*(1-u):y+90*out*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Korea's goal line x = 0, +z = France's right) — checked by tests/play-film-renard-signature.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,cornerFoot:'l' as const,
 majriContact:()=>{const st=stateOf(MAJ,0),sk=solve(st.pose,B_MAJ,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 renardAt:(tau:number)=>{const st=stateOf(REN,tau),sk=solve(st.pose,B_REN,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 markerAt:(tau:number)=>{const st=stateOf(MARK,tau),sk=solve(st.pose,B_HWA,st.place);return{head:sk.head};},
 keeperAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_KIM,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
