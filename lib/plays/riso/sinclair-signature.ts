/** Christine Sinclair's SIGNATURE film, "the striker's finish": her hat-trick header, Canada 3–4 USA (after extra time), Olympic women's
 * football semi-final, Monday 6 August 2012, Old Trafford, Manchester, the 73rd minute (Canada lead 3–2). An iconic-play riso film
 * (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction
 * of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT: the iconicPlays entry is kind "signature" ("Great strikers are always in the right place: watch where the ball will
 * land"). Sinclair's third goal that night is the best-documented example of it: several written accounts describe the same thing — a
 * Canadian corner, Sinclair reading its flight, "pushing off two markers" (Globe and Mail) / beating "two defenders" (Wikipedia) to reach the
 * ball first, and a header "back across the face of goal" to the far post. It completed the most famous hat-trick of her career (the
 * Toronto Star's Cathal Kelly called the game her best performance). Her record-breaking 185th goal (v St Kitts and Nevis, January
 * 2020) was the other candidate; the 2012 goal is described far more precisely and shows the signature, so it is filmed.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "Canada v United States (2012 Summer Olympics)" (raw wikitext; cites The Guardian live blog, the NYT, Our Game Magazine,
 *    Caitlin Murray's "The National Team") https://en.wikipedia.org/wiki/Canada_v_United_States_(2012_Summer_Olympics)
 *  - Wikipedia, "Football at the 2012 Summer Olympics – Women's tournament – Knockout stage" (date, 19:45 kick-off, 26,630, line-ups,
 *    shirt numbers, Sinclair captain, and the kit template _can12a / _usa12a)
 *  - The Guardian, Graham Parker, "Olympic women's soccer 2012 – USA 4-3 Canada – as it happened" (6 Aug 2012): "The Canadians have another
 *    corner...and SINCLAIR SCORES WITH A BEAUTIFUL HEADER BACK ACROSS THE GOAL!"
 *    https://www.theguardian.com/sport/2012/aug/06/olympics-2012-football-usa-canada-live
 *  - The Guardian, Andy Hunter, match report (6 Aug 2012): "Within two minutes Canada were ahead again, courtesy of an outstanding header
 *    from Sinclair from a corner." https://www.theguardian.com/sport/2012/aug/06/london-2012-canada-usa-womens-football
 *  - The Globe and Mail, Cathal Kelly, "The greatest game of women's soccer ever played" (oral history, 2015): "Sinclair scored an
 *    absolutely remarkable goal – her third of the game – pushing off two markers and heading back across the face of goal. Canada was up
 *    3-2." https://www.theglobeandmail.com/sports/soccer/an-oral-history-soccer/article24914992/
 *  - Our Game Magazine, Tiffany Weimer, "Olympic Recap: U.S. vs. Canada" (7 Aug 2012) https://www.ourgamemag.com/2012/08/07/olympic-recap-u-s-vs-canada/
 * CONFIRMED: the semi-final, 6 August 2012, Old Trafford, 19:45 kick-off, 26,630 in the ground; 2–2 after Rapinoe's 70th-minute strike;
 * in the 73rd minute Canada won a corner, Sinclair (No. 12, captain) got free of two US markers and headed it back across goal inside the
 * far post past Hope Solo (No. 1): 3–2 and her hat-trick. Kits (the knockout-stage kit template): Canada all white with red trim, the USA
 * in navy shirts, shorts and socks with white sleeves. The USA's back four at that moment: O'Hara, Rampone, Buehler, LePeilbet (LePeilbet
 * went off in the 76th minute) — which two marked Sinclair is not stated, so the markers are drawn unnamed, without numbers.
 * CONFLICT: Our Game Magazine swaps the two headers (67th from a Matheson corner, 73rd from a Tancredi cross), and Wikipedia calls both
 * corners (the 73rd "taken by Tancredi"); the Guardian live blog and report (written that night) and the Globe put the corner on the 73rd.
 * The film follows the majority: the 73rd-minute goal comes from a corner. The corner TAKER is disputed, so she is drawn unnamed (no number)
 * and the narration does not name her.
 * INFERRED (illustrative reconstruction): every position, run and timing in metres and seconds (the corner from Canada's RIGHT, the flag
 * on the main-stand side, struck with the taker's RIGHT foot, ≈ 33 m of flight in ≈ 1.5 s, apex ≈ 4 m; Sinclair meeting it ≈ 6 m out just
 * on the near-post side of centre and glancing it back across into the far side of the net, low, in ≈ 0.55 s); the push-off as drawn;
 * where every other player stood; Solo's late dive to her right; the kit colours of both keepers (Solo drawn blue; not shown in the
 * template); the white sleeves the template shows are not drawn (athlete.ts prints one shirt ink); hair (Sinclair a dark ponytail); the
 * celebration run; the evening light (the 73rd minute ≈ 9 pm, just after an August sunset), the red seats of Old Trafford, crowd colours
 * and flags; the TV camera positions and lenses. The narration names none of the inferred details.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the box jostling, the corner, Sinclair's header,
 * the net, her run away); ch2 = the TV slow-motion REPLAY from a low camera by the byline looking back at Sinclair's face (eyes on the ball,
 * the push away from two markers, the jump), with a replay trail on the corner; ch3 = a second REPLAY angle, high behind the goal: the
 * header goes back across the face of goal, past Solo's dive, inside the far post, then live again for the celebration; ch4 = the lesson: a
 * close, very slow replay with teaching marks (her footprints lighting up to a ring on "the right place", a dashed sight-line from her eyes
 * to the ball, the corner's predicted arc dropping into a target ring where it "will land", the header arrow into a ring at the far post).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window
 * down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for the ponytails and hems, motionSmear on the corner, the header, the keeper's dive). Women footballers: per-player
 * builds (Sinclair 1.75 m) and hair (ponytails, one short crop). Handedness: the world is right-handed (x toward the USA's goal, y up, +z =
 * Canada's right), exactly athlete.ts's convention, so the taker's strike({foot:'r'}) is her RIGHT foot and the corner from Canada's right
 * comes from +z; header() is symmetric, and Sinclair's redirect is a turn of the head and shoulders to her LEFT (toward the far post) with
 * the chin coming down; Solo faces −x, so keeperDive({side:'r'}) takes her toward −z, the far post. Inks: yellow, red, blue, navy. Everything
 * is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small
 * figures print at 'low', at most four big non-hero figures print full, every figure inside a passage is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The hat-trick',text:"Old Trafford, 2012. Canada and the USA are level, two-all, in the Olympic semi-final. Canada take a corner... Christine Sinclair heads it in! Her third goal: a hat-trick!",tail:2.2,
  cues:['Old Trafford','Canada and the USA','two-all','Olympic semi-final','take a corner','Christine Sinclair','heads it in','Her third goal','hat-trick']},
 {label:'Watch it again',text:"Watch again, slowly. Sinclair watches the ball in the air. She pushes away from two defenders and gets to the spot first.",tail:1.7,
  cues:['Watch again','watches the ball','in the air','pushes away','two defenders','gets to the spot']},
 {label:'Behind the goal',text:"From behind the goal: she heads it back across, to the far post, away from the keeper.",tail:2.3,
  cues:['From behind','heads it back','far post','away from the keeper']},
 {label:'The right place',text:"Great strikers are always in the right place. Watch where the ball will land, and get there first!",tail:2,
  cues:['Great strikers','right place','Watch where','will land','get there first']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/sinclair-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/sinclair-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/sinclair-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('sinclair: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('sinclair: no cue '+w);return c.at;};
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
/** Pitch: the USA's goal line is x = 0 (Canada attack +x), goal centre z = 0, +z = Canada's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- Old Trafford at night: a big closed bowl of red seats, three tiers, one roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z), 1 behind the USA's goal (+x), 2 the main stand (+z, the camera side),
 * 3 the other end. Closed corners: the side stands run past the goal lines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-128,24,a),1.4+32*b,-(42+38*b)],
 (a,b)=>[9+34*b,1.4+29*b,lerp(66,-66,a)],
 (a,b)=>[lerp(24,-128,a),1.4+32*b,42+38*b],
 (a,b)=>[-114-34*b,1.4+29*b,lerp(-66,66,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] */
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=15,TIER=[.36,.68];
/** flags on the stand fronts: [stand, a, 0 = the Stars and Stripes | 1 = the Maple Leaf] */
const FLAGS:[number,number,number][]=[[0,.3,0],[0,.42,1],[0,.56,0],[0,.7,1],[0,.83,0],[1,.22,1],[1,.4,0],[1,.62,0],[1,.8,1],[2,.26,0],[2,.44,1],[3,.35,0],[3,.62,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // an August night in Manchester (the 73rd minute ≈ 9 pm, just after sunset): a navy sky, a floodlit blue haze low down
 s.field(K,.52,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  // the cantilever roof: a dark overhang over the top tier, a paper fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,13,0]),add3(S(0,.74),[0,13,0])]));
  seg3(c,add3(S(0,.74),[0,12.8,0]),add3(S(1,.74),[0,12.8,0]),.5,edge);}
 // (the tier fascias print with the roof lip, over the crowd: one knockout)
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.74),[0,13,0]),add3(A(ai,.74),[0,13,0])]));}
 // Old Trafford's red seats, paper tier fascias
 s.knockout(planes);s.tone(R,planes,.66);s.tone(K,planes,.26);
 // the crowd: 26,630 in a big bowl, so plenty of empty red seats; seeded dots (white, Canada red, USA navy, a few yellow), sized by
 // distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,23);if(h<.4+.14*b)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.66?0:h<.8?1:h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.92);tier.addPath(edge);s.knockout(tier,.8);
 // flags on the stand fronts: the Stars and Stripes (paper, red stripes, a navy canton) and the Maple Leaf (red bars, a red leaf)
 const fl=new Path2D(),stripe=new Path2D(),canton=new Path2D(),leaf=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){for(let k=0;k<3;k++){const b0=.005+(.075*(2*k+1))/7,b1=b0+.075/7;addPoly(stripe,polyP(c,[P(0,b0),P(1,b0),P(1,b1),P(0,b1)]));}addPoly(canton,polyP(c,[P(0,.045),P(.42,.045),P(.42,.08),P(0,.08)]));}
  else{addPoly(stripe,polyP(c,[P(0,.005),P(.25,.005),P(.25,.08),P(0,.08)]));addPoly(stripe,polyP(c,[P(.75,.005),P(1,.005),P(1,.08),P(.75,.08)]));
   addPoly(leaf,polyP(c,([[.5,.072],[.54,.06],[.58,.063],[.565,.05],[.61,.054],[.585,.04],[.6,.033],[.53,.035],[.52,.022],[.48,.022],[.47,.035],[.4,.033],[.415,.04],[.39,.054],[.435,.05],[.42,.063],[.46,.06]] as [number,number][]).map(([u,b])=>P(u,b))));}}
 s.knockout(fl);s.fill(R,stripe,.95);s.fill(K,canton,.95);s.fill(R,leaf,.95);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.74),[0,12,0]),b=add3(S(u+.025,.74),[0,12,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** the USA's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around z = bz, at height by */
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


// ---------------------------------------------------------------- the cast: kits (athlete.ts styles) — women footballers
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** the USA's navy kit (shirt, shorts, socks), red trim, paper numbers */
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.82],shorts:[K,.88],socks:[K,.85],boots:K,skin:SKIN_L,hair:[K,.7],line:K,shade:[B,.35],trim:R,numberInk:'paper',hairStyle:'ponytail',build:{height:1.7,bulk:.88},...o});
/** Canada all in white, red trim and numbers */
const canada=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:R,numberInk:R,hairStyle:'ponytail',build:{height:1.7,bulk:.9},...o});
const B_SIN:Build={height:1.75,bulk:.9,thighs:1.04},B_CRN:Build={height:1.68,bulk:.9},B_SOLO:Build={height:1.75,bulk:.95},B_MA:Build={height:1.7,bulk:.9},B_MB:Build={height:1.73,bulk:.92};
const SIN_ST=canada({number:12,hair:[K,.85],build:B_SIN,seed:12});
const CRN_ST=canada({hair:[Y,.9],build:B_CRN,seed:31});
const SOLO_ST:AthleteStyle={shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:SKIN_L,hair:[Y,.55],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:'paper',build:B_SOLO,seed:1};
const MA_ST=usa({hair:[K,.8],build:B_MA,seed:51});
const MB_ST=usa({hair:[Y,.8],build:B_MB,seed:52});

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the corner kick)
const BALL_R=.11;
/** the corner flies TF s to Sinclair's forehead; her header reaches the goal line TG */
const TF=1.5,TG=TF+.55;
/** Sinclair's header spot (her pelvis) ≈ 6 m out, just on the near-post side of centre; she faces between the incoming ball and the goal
 * and glances it to her LEFT, back across the face of goal */
const HP:[number,number]=[-6.3,1.2],YAW_S=yawTo(.8,.6);
/** Sinclair's header pose: header() with a good spring, head + shoulders turning to her LEFT through contact, the chin coming down */
function sinHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.2;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.12,.5,sn)*w;p.twist+=lerp(-.06,.26,sn)*w;p.neckP+=.12*w;return p;}
/** contact on the header clock */
const CU=.5,HD=1.0,TJ=TF-CU*HD;
/** her forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(sinHeader(CU),B_SIN,{x:HP[0],z:HP[1],yaw:YAW_S}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the arc at the flag on Canada's right, the main-stand side) */
const P0:V3=[-.45,BALL_R,33.55];
const DC=nrm2(HEAD_PT[0]-P0[0],HEAD_PT[2]-P0[2]),YAW_C=yawTo(DC[0],DC[1]);
/** where the taker's pelvis stands at contact so her RIGHT boot meets the back of the ball (solved once, FK) */
const PCR:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_CRN,{x:0,z:0,yaw:YAW_C});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** where the header crosses the goal line: low, just inside the FAR post (−z), then the side netting */
const GOAL_PT:V3=[0,.62,-3.12],NET_HIT:V3=[1.45,.45,-3.35],REST:V3=[1.05,BALL_R,-2.9];
const ballistic=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const fly=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const V_CORNER=ballistic(P0,HEAD_PT,TF),V_HEAD=ballistic(HEAD_PT,GOAL_PT,TG-TF);
/** the push away from the two markers (Sinclair's arms), τ window */
const PUSH0=.35,PUSH1=1.0;

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='sin'|'crn'|'gk'|'mark'|'can'|'usa';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-12,T1=12,DT=.02;
const rp=(u:number):[number,number]=>[PCR[0]+DC[0]*u,PCR[1]+DC[1]*u];
/** after the goal the Canadians chase Sinclair toward the main-stand touchline */
const toSin=(x:number,z:number,k:number):number[][]=>[[TG+.6+k*.2,x,z],[TG+3.5+k*.3,lerp(x,-9,.55),lerp(z,14,.55)],[T1,lerp(x,-10,.8),lerp(z,21,.8)]];
const ACTORS:Actor[]=[
 {name:'Christine Sinclair',role:'sin',hero:true,style:SIN_ST,keys:[[T0,-12.4,4.2],[-6,-12,3.4],[-3,-11.6,4],[-1,-10.9,3.4],[0,-10.2,2.9],[PUSH0+.1,-9.3,2.4],[PUSH1,-7.7,1.7],[TJ-.3,HP[0],HP[1]],[TF+.5,HP[0],HP[1]],[TF+1.4,-6.6,4.6],[TF+3.6,-8.2,11.5],[TF+6.6,-9.8,19],[T1,-10.6,25]]},
 {name:'corner taker (Canada)',role:'crn',hero:true,style:CRN_ST,keys:[[T0,...rp(-3.4)],[-2.6,...rp(-3.4)],[-.55,...rp(-1.3)],[0,...rp(0)],[.7,...rp(.9)],[3,...rp(2.6)],[T1,-6,24]]},
 {name:'Hope Solo',role:'gk',hero:true,style:SOLO_ST,keys:[[T0,-.9,.9],[-2,-.9,1.1],[0,-1,1.3],[.8,-1.2,1.5],[TF-.3,-1.35,1.3],[TF,-1.35,1.2],[T1,-1.2,.6]]},
 {name:'USA marker (goal side)',role:'mark',hero:true,style:MA_ST,keys:[[T0,-11.2,3.5],[-6,-10.9,2.9],[-3,-10.5,3.3],[-1,-9.9,2.8],[0,-9.3,2.3],[PUSH0+.15,-8.9,1.5],[PUSH1,-8,.6],[TF-.2,-7.3,.15],[TF,-7.1,.1],[T1,-6.4,.4]]},
 {name:'USA marker (behind)',role:'mark',hero:true,style:MB_ST,keys:[[T0,-13.4,4.8],[-6,-13,4.2],[-3,-12.6,4.6],[-1,-12,4.1],[0,-11.4,3.6],[PUSH0+.2,-10.6,3.5],[PUSH1,-9.4,3.1],[TF-.2,-8.2,2.8],[TF,-8,2.8],[T1,-7.6,2.6]]},
 {name:'USA near-post defender',role:'usa',style:usa({skin:SKIN_M,hair:[K,.8],seed:61}),keys:[[T0,-.8,3.9],[0,-.9,3.9],[TF,-1.3,3.4],[T1,-1.6,3]]},
 {name:'Canada near-post runner',role:'can',style:canada({skin:SKIN_M,hair:[K,.7],seed:45}),keys:[[T0,-7.6,5.6],[-2,-7.2,5.2],[0,-6.4,4.6],[.9,-3.6,3.6],[TF,-2.8,3.2],[T1,-3,3]]},
 {name:'USA defender (far post)',role:'usa',style:usa({hair:[R,.5],hairStyle:'short',seed:62}),keys:[[T0,-4.6,-3.2],[0,-4.5,-2.9],[TF,-4.1,-2.4],[T1,-3.6,-2]]},
 {name:'Canada far-post runner',role:'can',style:canada({skin:SKIN_D,build:{height:1.63,bulk:.94},hairStyle:'curly',seed:46}),keys:[[T0,-10.5,-4.4],[-2,-10,-4.8],[0,-9.2,-4.5],[TF,-6.8,-3.8],[T1,-6.2,-3.2]]},
 {name:'USA edge-of-box',role:'usa',style:usa({hair:[Y,.7],seed:63}),keys:[[T0,-17.5,1.4],[0,-17,1.8],[TF,-15.2,1.4],[T1,-14.5,1.8]]},
 {name:'Canada edge-of-box',role:'can',style:canada({hair:[Y,.95],seed:47}),keys:[[T0,-19.5,-1.6],[0,-19,-1.2],[TF,-17.4,-.6],...toSin(-16.8,-.4,1)]},
];
const SIN=0,CRN=1,GK=2,MA=3,MB=4;
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
/** in the arc → the corner → Sinclair's header → the far side of the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return fly(P0,V_CORNER,tau);
 if(tau<TG)return fly(HEAD_PT,V_HEAD,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.69)*9))*Math.exp(-(tau-TG-.69)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*4:TF*TAU*4+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.2+2*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:22,rShA:20,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** the push-off: both forearms out, a hand on each marker, shoulders squared, chin up at the ball */
const PUSH=posed({lShA:62,rShA:58,lShF:34,rShF:30,lElb:26,rElb:30,lHand:1,rHand:1,lean:6,neckP:-30});
/** a marker shoved off balance: shoulders back, arms flung, weight on the heels */
const SHOVED=posed({lean:-14,pitch:-6,lShA:48,rShA:40,lShF:40,rShF:12,lElb:30,rElb:40,lHipF:18,rHipF:6,lKnee:26,rKnee:16,neckP:-22});
/** Solo: set, shuffling across with the corner, then a late dive to her RIGHT (−z, the far post); the header is already past her hands */
const L0=TF+.1,DIVE_L=1.1;
const divePose=(u:number)=>{const p=keeperDive(clamp(u),{side:'r',height:.28});p.dz*=.72;p.air*=.8;return p;};
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'sin':{
   // she loiters by the penalty spot with two markers on her, watches the corner away, pushes off them, arrives, springs and glances it
   // back across goal, then runs away to the main-stand side
   if(tau>PUSH0-.2&&tau<PUSH1+.3)pose=blendPose(pose,blendPose(pose,PUSH,.85),win(tau,PUSH0-.2,PUSH1+.3,.25));
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=sinHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   // eyes on the ball: before the kick she faces the corner; through the flight she tracks it
   if(tau<TJ-.3)yaw=lerpAng(yaw,faceYaw(k,tau,tau<0?P0:ballAt(tau)),.7);
   const w=sm(TJ-.6,TJ-.2,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_S:lerpAng(yaw,YAW_S,w);break;}
  case 'crn':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   yaw=lerpAng(yaw,YAW_C,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau<-1.1)yaw=YAW_C;
   if(tau>TG+.4){const c=celebrate(tau-TG,{kind:'arms'});pose=blendPose(pose,c,sm(TG+.4,TG+.9,tau)*.8);}break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(pose,set,sm(-1.5,-.8,tau));
   if(tau>L0-.2)pose=blendPose(pose,divePose((tau-L0)/DIVE_L),sm(L0-.2,L0,tau));
   if(tau>TG+1.3)pose=blendPose(pose,DEJECT,sm(TG+1.5,TG+2.3,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1),ballAt(Math.min(tau,TF-.1)));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'mark':{// two markers tight on Sinclair: shoved off balance by her push, then a late, low jump that never reaches the ball
   const sh=win(tau,PUSH0+.1,PUSH1+.25,.25);if(sh>0)pose=blendPose(pose,SHOVED,sh*.8);
   if(tau>TF-.45&&tau<TF+.8){const hp=header(clamp((tau-(TF-.34))/1.0));hp.air*=.3;pose=blendPose(pose,hp,sm(TF-.45,TF-.28,tau)*(1-sm(TF+.4,TF+.8,tau)));}
   if(tau>TF+.7)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));
   yaw=faceYaw(k,Math.min(tau,TF),tau<0?P0:ballAt(Math.min(tau,TF)));break;}
  case 'usa':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);yaw=faceYaw(k,Math.min(tau,TF+.2),tau<0?P0:undefined);break;
  case 'can':if(tau>TG+.3){const c=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,c,sm(TG+.4,TG+1,tau)*.7);}
   if(tau<0)yaw=faceYaw(k,tau,P0);break;
 }
 return{pose,place:{x,z,yaw}};
}
// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the cross, the header, the leap). */
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
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;star?:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number;under?:boolean}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 // heat cap: at most FULL_CAP big non-hero figures print at full detail (the nearest); the rest print 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.star?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<(f.star?44:64)?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 // under: the see-through net prints first (the camera behind the goal looks through the mesh at the keeper and the ball)
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:goal.under?1e9:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];netUnder?:boolean}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,star:k===SIN,
  smear:o.smear&&((k===SIN&&tau>TJ&&tau<TF+.3)||(k===CRN&&tau>-.25&&tau<.35)||(k===GK&&tau>L0+.1&&tau<L0+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],under:o.netUnder});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time (×≈1), anchored so the corner is struck on "corner" and her forehead meets it just after "Christine" */
function tau1(t:number){const tX=CUE(0,'take a corner')+.45,tH=CUE(0,'Christine')+.45,k=clamp(TF/Math.max(.5,tH-tX),.85,1.15);return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-30,20,62];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-9,0,10],fov:26})],
  [CUE(0,'Canada and')-.2,1.4,()=>({P:P1,T:[-8.6,1,3.2],fov:13})],
  [CUE(0,'Olympic')-.2,1.3,()=>({P:P1,T:[-4.5,1,17.5],fov:23})],
  [CUE(0,'take a corner')+.45,1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[HP[0],1.6,HP[1]],.25+.55*sm(0,TF,tau)),fov:lerp(23,14,sm(-.1,1.1,tau))})],
  [CUE(0,'Christine')-.45,.8,()=>({P:P1,T:[HP[0]+2,1.6,HP[1]-.9],fov:7.5})],
  [CUE(0,'heads it in')+.5,1.5,()=>{const w=at(SIN,tau,1.2);return{P:P1,T:mix3(w,[-4,1.2,3],.3),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'hat-trick'),tN=CUE(0,'Christine')+.9;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tA-.2,tA+.3,t)*(1-sm(tA+2,tA+2.8,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Christine')+.6;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low by the byline, looking back at Sinclair
const tau2=(t:number)=>key(t,mono([[0,-1.3],[CUE(1,'watches the ball'),-.05],[CUE(1,'in the air'),.3],[CUE(1,'pushes away'),PUSH0+.05],[CUE(1,'two defenders'),PUSH1-.05],[CUE(1,'gets to the spot'),TJ+.2],[SECS(1)-.2,TG+.45]]),linear);
const E2:V3=[1,1.3,10];
/** ch2 leaves out the two near-post players, who would stand between the low byline camera and Sinclair */
const CH2_ONLY=[0,1,2,3,4,7,8,9,10];
function cam2(t:number):Cam{
 const tau=tau2(t),w=at(SIN,tau,1.4);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-9,1.5,2.6],fov:30})],
  [CUE(1,'watches the ball')-.2,1.1,()=>({P:E2,T:mix3(w,[-8,1.8,1.6],.3),fov:19})],
  [CUE(1,'pushes away')-.3,1,()=>({P:add3(E2,[0,.1,-.3]),T:mix3(w,[-8.4,1.3,1.8],.3),fov:17})],
  [CUE(1,'gets to the spot')-.4,.9,()=>({P:add3(E2,[0,.3,-.6]),T:[HP[0]+.2,2,HP[1]],fov:13})],
  [CUE(1,'gets to the spot')+.7,.7,()=>({P:add3(E2,[0,.3,-.6]),T:[HEAD_PT[0]+.3,HEAD_PT[1]-.1,HEAD_PT[2]-.2],fov:10})],
  [CUE(1,'gets to the spot')+1.4,1.1,()=>({P:add3(E2,[0,.4,-.8]),T:mix3([HEAD_PT[0],1.6,HEAD_PT[2]],[0,.8,-3],.6),fov:30})],
 ]);
}
/** the replay trail: the ball's path so far, a fading yellow ribbon (printed under the players) */
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
  const r=play(s,c,tau,tp,{smear:true,min:10,only:CH2_ONLY});
  // the touch: a spark on her forehead at contact
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/Math.max(NEAR,q[2])*1.3),12);},
 get still(){return CUE(1,'gets to the spot')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal, back across the face of goal
const tau3=(t:number)=>key(t,mono([[0,TF-1.0],[CUE(2,'heads it back'),TF+.02],[CUE(2,'far post'),TG+.02],[CUE(2,'away from'),TG+.5],[SECS(2),TG+3.2]]),linear);
const E3:V3=[9.5,5.4,6.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),m=at(SIN,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-5,1.3,.6],fov:25})],
  [CUE(2,'heads it back')-.4,.9,()=>({P:E3,T:[-3.4,1.2,-.6],fov:21})],
  [CUE(2,'far post')-.1,1,()=>({P:E3,T:[-1,.9,-2.2],fov:18})],
  [CUE(2,'away from')+.5,1.8,()=>({P:add3(E3,[-1,-1,0]),T:m,fov:15})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12);
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(TG+2.2,TG+2.6,tau)*.8)});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),netUnder:true});
  // the replay graphic: the header's path printed back across the face of goal, over the net so it reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.4,TG+.9,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(SIN,tau3(twos(t))),sk=solve(p.pose,B_SIN,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'far post')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-1.8],[CUE(3,'right place'),-1.05],[CUE(3,'Watch where'),.15],[CUE(3,'will land'),.75],[CUE(3,'get there first'),TJ+.15],[SECS(3),TG+.35]]),linear);
const P4:V3=[-14.5,2.6,-4.2];
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(SIN,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:P4,T:[-8.5,1.4,3.2],fov:30})],
  [CUE(3,'right place')-.2,1.2,()=>({P:add3(P4,[1.5,-.4,1]),T:mix3(w,[HP[0],1,HP[1]],.4),fov:27})],
  [CUE(3,'Watch where')-.3,1.1,()=>({P:add3(P4,[1,-.6,.8]),T:[-6,2.4,6],fov:40})],
  [CUE(3,'will land')-.1,1,()=>({P:add3(P4,[1.5,-.6,.8]),T:[HEAD_PT[0],HEAD_PT[1]-.2,HEAD_PT[2]+1],fov:32})],
  [CUE(3,'get there first')-.2,1.1,()=>({P:[-11,5,-8],T:[-3.6,1.3,-.9],fov:36})],
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
/** a target ring printed round P, facing the camera (rad in metres at P's depth) */
function goalRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,P);if(a<=0||!X)return;const R_=kAt(c,P)*rad,pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU;pts.push([X[0]+Math.cos(u)*R_,X[1]+Math.sin(u)*R_]);}const w=Math.max(12,kAt(c,P)*.1),rr=ribbon(pts,w,{seed:12,close:true,wobble:.6,pressure:.2});s.stroke(K,rr,Math.max(3,w*.25),.9*a);s.knockout(rr,a);s.fill(ink,rr,.95*a);
}
/** a dashed ribbon through projected points (gaps every other step), knocked out and printed in one ink */
function dashed(s:Sheet,pts:Pt[],w:number,ink:string,a:number,n=10,seed=5){
 if(a<=0||pts.length<3)return;const gaps:[number,number][]=[];for(let i=0;i<n;i++)gaps.push([(i+.55)/n,(i+.95)/n]);
 const rr=ribbon(pts,w,{seed,taper:0,wobble:.5,pressure:.1,gaps});s.stroke(K,rr,Math.max(2,w*.2),.85*a);s.knockout(rr,a);s.fill(ink,rr,.95*a);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tG=CUE(3,'Great strikers'),tR=CUE(3,'right place'),tW=CUE(3,'Watch where'),tL=CUE(3,'will land'),tF=CUE(3,'get there first');
  stadium(s,c,t,[0,1,3],{roar:.35+.3*sm(tG,tG+.6,t)*(1-sm(tR+1,tR+2,t))+.6*sm(tF+.8,tF+1.4,t)});
  ground(s,c);
  // "the right place": her run's footprints light up in order as she arrives, a red ring on the spot where she jumps
  const run=sm(tR-.2,tR+.3,t)*(1-sm(tF+.4,tF+1,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<9;k++){const Tk=-1+k*((TJ-.3+1)/8),[x,z]=posOf(SIN,Tk),v=velOf(SIN,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);
   const X=pr(c,[HP[0],.01,HP[1]]);if(X){const rr=kAt(c,[HP[0],0,HP[1]])*.55,ring=polyPath(blob(X[0],X[1],rr,rr*.32,7,{n:20}),true);s.stroke(R,ring,Math.max(5,rr*.14),.95*run);}}
  // "will land": the corner's whole flight printed ahead of the ball as a dashed yellow arc, into a target ring where she will meet it
  const land=sm(tL-.25,tL+.25,t)*(1-sm(tF+.3,tF+.9,t));
  if(land>0){const pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,fly(P0,V_CORNER,lerp(TF*.35,TF,i/24)));if(p)pts.push(p);}dashed(s,pts,Math.max(8,kAt(c,HEAD_PT)*.05),Y,land,12,5);
   goalRing(s,c,HEAD_PT,.42*clamp(sm(tL-.25,tL+.25,t,easeOutBack),0,1.2),Y,land);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[SIN,MA,MB,GK]});
  // "Great strikers": a burst over her
  const kg=sm(tG,tG+.35,t)*(1-sm(tG+1.2,tG+1.7,t));if(kg>0){const q=pr(c,at(SIN,tau,3.1));if(q)sparkBurst(s,Y,q[0],q[1],190*kg,{n:12,seed:9,g:easeOutBack(kg),width:16});}
  // "Watch where": a dashed sight-line from her eyes to the ball, and a ring on the ball
  const eye=sm(tW-.2,tW+.25,t)*(1-sm(tF-.1,tF+.3,t));
  if(eye>0&&tau>0&&tau<TF){const st=stateOf(SIN,tau),sk=solve(st.pose,B_SIN,st.place),a=pr(c,sk.face),b=pr(c,ballAt(tau));
   if(a&&b){const pts:Pt[]=[];for(let i=0;i<=8;i++)pts.push([lerp(a[0],b[0],i/8),lerp(a[1],b[1],i/8)]);dashed(s,pts,Math.max(5,kAt(c,sk.face)*.03),B,eye,7,11);}
   if(r.ball){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU;ring.push([g[0]+Math.cos(u)*rr,g[1]+Math.sin(u)*rr]);}const rp_=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*eye);s.fill(Y,rp_,.95*eye);}}
  // "get there first": the header's arrow back across goal into a ring inside the far post
  const gf=sm(tF-.1,tF+.3,t);
  if(gf>0){const arr=sm(tF+.2,tF+1.1,t,easeInOutSine);if(arr>0&&tau>=TF-.05){const pts:V3[]=[];for(let i=0;i<=10;i++)pts.push(fly(HEAD_PT,V_HEAD,(TG-TF)*arr*i/10));arrow3(s,c,pts,Math.max(14,kAt(c,HEAD_PT)*.06),Y,.95);}
   goalRing(s,c,GOAL_PT,.45*clamp(sm(tF+.6,tF+1,t,easeOutBack),0,1.2),Y,sm(tF+.6,tF+.9,t)*(1-sm(SECS(3)-.6,SECS(3)-.1,t)));}
 },
 get still(){return CUE(3,'will land')+.4;},
};

const film:RisoStory={
 id:'sinclair-signature',format:'11v11',title:"Sinclair's hat-trick header",
 theme:'Great strikers are always in the right place: watch where the ball will land, and get there first',
 ageNote:'Canada 3–4 USA (after extra time), Olympic women’s football semi-final, Old Trafford, 6 August 2012: Sinclair’s third goal, 73rd minute. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little glancing header — a ball drops in on an arc, a yellow spark where it is met, and it flicks away low. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.35?x+170*(1-u):x-190*easeOut(out),by=age<.35?y-130*(1-u)*(1-u)-10:y+40*out;
  if(age>.3&&age<.65)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.3)/.12))*(1-clamp((age-.5)/.15)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; the USA's goal line x = 0, +z = Canada's right) — checked by tests/play-film-sinclair-signature.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,cornerFoot:'r' as const,PUSH0,PUSH1,
 takerContact:()=>{const st=stateOf(CRN,0),sk=solve(st.pose,B_CRN,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 sinclairAt:(tau:number)=>{const st=stateOf(SIN,tau),sk=solve(st.pose,B_SIN,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis,x:st.place.x??0,z:st.place.z??0};},
 soloAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_SOLO,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis,head:sk.head};},
 markerAt:(i:0|1,tau:number)=>{const st=stateOf(i?MB:MA,tau),sk=solve(st.pose,i?B_MB:B_MA,st.place);return{x:st.place.x??0,z:st.place.z??0,head:sk.head};}};
