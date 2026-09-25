/** Petr Čech saves Arjen Robben's extra-time penalty — Bayern Munich 1–1 Chelsea (Chelsea won 4–3 on penalties), UEFA Champions League
 * final, 19 May 2012, Fußball Arena München (the Allianz Arena), Munich, 95th minute, 1–1. An iconic-play riso film (RisoStory, chapters mode)
 * played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the save from WRITTEN
 * accounts and one photograph of the same night (the broadcast footage itself was not reviewed), rendered as a riso print.
 * Same match as lib/plays/riso/drogba-header-2012.ts: the same arena, inks, kits and ball are drawn the same way.
 * Narration text: public/plays/narration/cech-robben-2012/script.json. The lead voices it later with local Kokoro; until then every chapter
 * runs on estimated cue times. EVERY action time is read from cue onsets and chapter seconds, so once timing.json exists `withTiming`
 * re-times the action through the cue words and no scene code changes.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2012 UEFA Champions League final" (raw wikitext): "Drogba fouled Franck Ribéry in the penalty area … earning Bayern a
 *    penalty; Robben took it, but his shot was saved by Čech"; "Arjen Robben missed an awarded penalty, Petr Čech saving the low drive";
 *    line-ups and numbers (Čech 1, Robben 10, Drogba 11); the Kits table (Bayern all red; Chelsea blue shirts and shorts, white socks);
 *    in the shoot-out Čech "having gone the correct direction for every Bayern penalty".
 *  - Wikipedia (de), "UEFA Champions League 2011/12" (Finale): "In der 95. Minute drang Ribéry in den Strafraum von Chelsea ein und wurde von
 *    Drogba gefoult … Torwart Čech hielt den von Arjen Robben geschossenen Strafstoß"; referee Pedro Proença.
 *  - The Guardian, Daniel Taylor, "Chelsea win Champions League on penalties over Bayern Munich" (19 May 2012): "Robben struck his penalty
 *    cleanly enough, low to Cech's left. Cech smothered the shot and was first to the loose ball"; Robben was Chelsea's former player.
 *  - Sky Sports match report (19 May 2012): "Robben seemed unaffected by the delay as his penalty headed for the bottom corner. Cech was equal to
 *    it though, making a superb save to his left and then smothering the rebound"; "three minutes into extra-time when he tripped Ribery".
 *  - BBC Sport, Phil McNulty, "Bayern Munich 1-1 Chelsea" (19 May 2012): "Cech was the saviour as he plunged low to save Robben's poorly struck
 *    spot-kick". BBC Sport, "Arjen Robben admits penalty miss against Chelsea was 'terrible'" (20 May 2012): Robben: "I wanted to shoot the
 *    ball hard and high in the goal but the ball didn't go high enough."
 *  - Wikipedia, "Petr Čech": the rugby-style headguard he wore from January 2007 "for the rest of his career"; Čech and Robben won the
 *    Premier League together at Chelsea (2005, 2006).
 *  - Wikimedia Commons, "Penalty kick Lahm Cech Champions League Final 2012.jpg" (a fan's photo of the same night's shoot-out, 20 May 2012):
 *    Čech in a WHITE long-sleeved shirt and white shorts with dark socks, a black number 1, the black headguard, red-and-white gloves;
 *    Bayern (Lahm) all red; the officials in black; the Chelsea supporters' banners at the far end, the near end red with Bayern fans.
 * CONFIRMED by those sources: the final, 19 May 2012, in Munich, Bayern's ground; 1–1 after Müller (83') and Drogba (88'); in extra time
 *  (95th minute) Drogba tripped Ribéry in the box and the referee gave a penalty; there was a delay before the kick (Ribéry was hurt);
 *  Robben (10), Čech's former Chelsea team-mate, took it; the shot was LOW, toward the bottom corner to ČECH'S LEFT; Robben meant to hit it
 *  hard and high but it "didn't go high enough"; Čech dived low to his left and saved it, then smothered the rebound, first to the loose
 *  ball; Chelsea went on to win the shoot-out 4–3; Čech wore his headguard; his white keeper's kit, dark socks and red/white gloves (photo
 *  of the same match); Bayern all red, Chelsea blue with white socks, officials in black.
 * INFERRED (illustrative reconstruction, never named in the narration): Robben's LEFT foot (his well-known stronger foot; not stated in
 *  these sources); his run-up (a few steps from his left); the exact spot where the ball met Čech (drawn ≈ 2.6 m left of centre, ≈ 0.3 m up,
 *  met by his lower glove); the ball's speed (≈ 22 m/s, 0.5 s); Čech's hands on the save and where the ball spun loose (drawn parried
 *  forward, out toward his left, then smothered lying on his side as Robben follows in); which END of the ground (drawn at the end with the
 *  Bayern fans behind the goal, as in the shoot-out photo) and the main camera's side (the same main stand as the Drogba film); every
 *  other position (players outside the box and the D, the referee and the additional assistant on the goal line), none named or numbered
 *  except Robben, Čech and Drogba; Robben's reaction (hands to his head); Ribéry is not drawn (hurt, off to the side); the headguard's panel
 *  seam and chin strap; the arena, crowd and lights (as the Drogba film draws them); the TV camera positions and lenses. The lesson's
 *  "homework" is general advice for young keepers, not a claim about how Čech prepared for this kick.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the arena, the penalty spot, Robben placing the
 * ball and stepping up, Čech on his line, the kick, the save, the smother); ch2 = the TV slow-motion REPLAY from behind Robben (Čech big and
 * still, waiting for the kick, the push-off to his left, the stop); ch3 = a second REPLAY, low behind the goal through the net (Robben's
 * wanted-it-high ghost path vs the real low one, the ball spinning loose, the pounce); ch4 = the lesson: a close, very slow replay with
 * teaching marks (a keeper's notebook, the big outline, a wait timer, the push-off spark and arrow, the rebound ring). Composed on the FULL
 * sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion, motionSmear on the kick, the dive and the pounce). Čech's headguard is the athlete's dark hair cap plus a panel overlay
 * drawn in the same adapter. Handedness: the world is right-handed (x from the pitch toward Chelsea's goal, y up), exactly athlete.ts's
 * convention; Čech faces −x, so his LEFT is +z; Robben faces +x, so strike({foot:'l'}) is his LEFT foot and a shot to Čech's left goes to +z.
 * Inks: yellow, red, blue, navy (as the Drogba film). Poses on twos, cameras on ones; all randomness seeded. Heat: small figures print at
 * 'low', every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc,PASSAGE} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,mirrorPose,
 STRIKE_CONTACT,type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build,type Skeleton} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Extra time',text:'Munich, 2012, the Champions League final. Extra time, one-all. Penalty to Bayern! Arjen Robben steps up against his old Chelsea teammate, Petr Čech... saved!',tail:3,
  cues:['Munich','Champions League final','Extra time','Penalty to Bayern','Arjen Robben','steps up','old Chelsea teammate','Petr Čech','saved']},
 {label:'Watch again',text:'Watch again, slowly. Čech stays big and still, and waits for the kick. Then he pushes off strongly to his left, and stops it.',tail:1.6,
  cues:['Watch again','stays big','waits for the kick','pushes off strongly','to his left','stops it']},
 {label:'Behind the goal',text:'From behind the goal: Robben wanted it high, but it stays low. The ball spins loose... and Čech pounces on the rebound!',tail:2.2,
  cues:['From behind','wanted it high','stays low','spins loose','pounces']},
 {label:'Do your homework',text:'Keepers, do your homework on penalty takers. Stay big, wait, then push off strongly. And always follow the rebound!',tail:2,
  cues:['Keepers','homework','penalty takers','Stay big','wait','push off strongly','follow the rebound']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/cech-robben-2012/timing.json, add
 *   import timingJson from '../../../public/plays/narration/cech-robben-2012/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/cech-robben-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('cech: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('cech: no cue '+w);return c.at;};
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
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};

/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: CHELSEA's goal line is x = 0 (net toward +x, Bayern attack +x), goal centre z = 0, +z = Čech's left as he faces out; touchlines
 * z = ±34, halfway x = −52.5; the penalty spot is (−11, 0). */
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

// ---------------------------------------------------------------- the Munich arena at night (drawn as in the Drogba film): a steep closed bowl, three tiers, a white roof ring
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind Chelsea's goal (+x), 2 the main stand (−z, the camera side),
 * 3 the other end. Closed corners: the side stands run past the goal lines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-126,22,a),1.2+33*b,40+30*b],
 (a,b)=>[8+28*b,1.2+31*b,lerp(-62,62,a)],
 (a,b)=>[lerp(22,-126,a),1.2+33*b,-40-30*b],
 (a,b)=>[-112-28*b,1.2+31*b,lerp(62,-62,a)],
];
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=15,TIER=[.34,.67];
/** flags on the stand fronts: [stand, a, 0 = Bayern (red with a paper band) | 1 = Chelsea (blue)] */
const FLAGS:[number,number,number][]=[[0,.26,0],[0,.4,0],[0,.55,1],[0,.7,0],[0,.84,0],[1,.2,0],[1,.4,0],[1,.62,0],[1,.8,0],[2,.25,0],[2,.45,1],[3,.3,1],[3,.5,1],[3,.7,1]];
/** where the Chelsea blue sits in the crowd (inferred; the shoot-out photo): the far end (stand 3), a patch of the far side; Bayern red behind Čech */
const blueAt=(si:number,a:number)=>si===3?.62:si===0&&a>.48&&a<.62?.4:.05;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number;blueRoar?:boolean}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(K,.5,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,11,0]),add3(S(0,.74),[0,11,0])]));
  seg3(c,add3(S(0,.74),[0,10.8,0]),add3(S(1,.74),[0,10.8,0]),.5,edge);}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.74),[0,11,0]),add3(A(ai,.74),[0,11,0])]));}
 s.knockout(planes);s.tone(K,planes,.42);s.tone(B,planes,.2);s.knockout(tier,.8);
 // the crowd: seeded dots (Bayern red and white, Chelsea blue, a few yellow); after the save only the blue end jumps
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18);
   const hb=hash(i*7+j*53+si*3,21),ink=hb<blueAt(si,a)?2:h<.62?1:h<.9?0:3,lift=roar>0&&(!o.blueRoar||ink===2)?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.35);s.knockout(edge,.8);
 const fl=new Path2D(),red=new Path2D(),blue=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(red,polyP(c,[P(0,.005),P(1,.005),P(1,.03),P(0,.03)]));addPoly(red,polyP(c,[P(0,.05),P(1,.05),P(1,.075),P(0,.075)]));}
  else addPoly(blue,q);}
 s.knockout(fl);s.fill(R,red,.95);s.fill(B,blue,.95);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.022,.74),[0,10,0]),b=add3(S(u+.022,.74),[0,10,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-44],[13,0,-44],[13,0,44],[-118,0,44]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.6,0,-37.5],[5.6,0,37.5]);board([-110,0,-37.5],[5.6,0,-37.5]);board([-110,0,37.5],[5.6,0,37.5]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.5,.25,z],[5.5,.25,z+3.3],[5.5,.68,z+3.3],[5.5,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.35);s.knockout(pn,.85);
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
/** Chelsea's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof (the ball never reaches it) */
function goal3(s:Sheet,c:Cam){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bk=X+2;
 const zs=[z0,-1.8,0,1.3,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bk,1.9,z0],[bk,0,z0]],[[X,0,z1],[X,H,z1],[bk,1.9,z1],[bk,0,z1]],
  [[X,H,z0],[X,H,z1],[bk,1.9,z1],[bk,1.9,z0]],[[bk,0,z0],[bk,0,z1],[bk,1.9,z1],[bk,1.9,z0]]];
 // seen from behind the goal (the ch3 replay) the net is a light mesh in front of the play, not a pale volume
 const behind=c.eye[0]>bk+.2,mw=behind?.016:.022;
 if(!behind){const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));s.knockout(net,.3);s.tone(K,net,.1);}
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[bk,1.9,z],mw,mesh,.7);seg3(c,[bk,1.9,z],[bk,0,z],mw,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[bk,y,zs[i]],[bk,y,zs[i+1]],mw,mesh,.7);seg3(c,[X,y*H/1.9,z0],[bk,y,z0],mw,mesh,.7);seg3(c,[X,y*H/1.9,z1],[bk,y,z1],mw,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],mw,mesh,.7);}
 s.fill(K,mesh,behind?.5:.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Chelsea: blue shirts and shorts, white socks; paper numbers and trim (trim inferred) */
const che=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',number:null,build:{height:1.8,bulk:1},...o});
/** Bayern: all red (shirts, shorts, socks); paper numbers and trim (trim inferred) */
const fcb=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',number:null,build:{height:1.82,bulk:1},...o});
const B_CECH:Build={height:1.96,bulk:1.02},B_ROB:Build={height:1.8,bulk:.95},B_DRO:Build={height:1.89,bulk:1.1,thighs:1.1};
/** Petr Čech: the white keeper's kit (white shirt with long sleeves, white shorts), dark socks, black number 1, red-and-white gloves and the
 * black headguard — all from the shoot-out photo of the same night. His hair is the dark cap under the headguard overlay. */
const CECH:AthleteStyle={shirt:'paper',shorts:'paper',socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.3],trim:K,gloves:[R,.9],
 sleeves:'long',number:1,numberInk:K,build:B_CECH,seed:1};
/** Arjen Robben (as lib/plays/riso/robben-final-2013.ts draws him): Bayern red, 10, bald */
const ROBBEN:AthleteStyle=fcb({number:10,hair:null,hairStyle:'bald',build:B_ROB,seed:10});
const DROGBA:AthleteStyle=che({number:11,skin:SKIN_D,hair:[K,.95],build:B_DRO,seed:11});
/** the officials in black (the photo), printed in navy */
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'balding',line:K,trim:'paper',sleeves:'short',seed:33};
/** styles that wear Čech's headguard (drawPlayer adds the panel overlay) */
const HEADGUARD=new Set<AthleteStyle>([CECH]);

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Robben's contact)
const BALL_R=.11;
const SPOT:V3=[-11,BALL_R,0];
/** Čech on his line, facing out (yaw π: his left is +z) */
const C_PL:Place={x:.15,z:0,yaw:Math.PI};
/** the dive: keeperDive to his LEFT, low; DUR seconds long, the lower (left) glove meets the ball at UC */
const DUR=.8,UC=.62,TF=.5;// TF: the ball's flight time (≈ 22 m/s — "poorly struck")
const dive=(u:number)=>keeperDive(clamp(u),{side:'l',height:0});
const SAVE0=TF-UC*DUR;// he goes as Robben strikes: "waits for the kick"
const CONTACT_SK=solve(dive(UC),B_CECH,C_PL);
/** where the ball meets his glove: just in front of the left palm */
const HIT:V3=[CONTACT_SK.lHa[0]-(BALL_R+.05),Math.max(BALL_R+.08,CONTACT_SK.lHa[1]),CONTACT_SK.lHa[2]+.02];
// ---- the pounce: off the ground after the dive, he stretches for the loose ball and gathers it into his chest (authored for a right-side
// dive, mirrored to his left like keeperDive). pose dz = 0 here; the body travels through `place`.
const PK=[
 posed({roll:48,pitch:22,lean:30,lHipF:72,lKnee:104,rHipF:58,rKnee:112,lAnk:20,rAnk:20,lShF:92,rShF:84,lShA:22,rShA:18,lElb:34,rElb:30,neckP:8,lHand:1,rHand:1}),
 posed({roll:62,pitch:58,lean:18,lHipF:12,lKnee:30,rHipF:30,rKnee:62,lAnk:30,rAnk:30,lShF:150,rShF:146,lShA:18,rShA:14,lElb:18,rElb:22,neckP:-18,lHand:1,rHand:1}),
 posed({roll:78,pitch:42,lean:38,lHipF:66,rHipF:58,lKnee:88,rKnee:98,lShF:84,rShF:80,lShA:6,rShA:8,lElb:104,rElb:98,lShR:30,rShR:30,neckP:28,lHand:.85,rHand:.85}),
 posed({roll:86,pitch:32,lean:44,lHipF:80,rHipF:72,lKnee:106,rKnee:112,lShF:66,rShF:62,lShA:6,rShA:8,lElb:118,rElb:114,lShR:34,rShR:34,neckP:34,lHand:.8,rHand:.8}),
].map(mirrorPose);
const T_P0=SAVE0+DUR+.05,T_PD=.95,PU_REACH=.62;// the pounce starts as he lands; his hands reach the ball at PU_REACH
const T_GRAB=T_P0+T_PD*PU_REACH;
const DIVE_END=(()=>{const p=dive(1);return{pose:p,sk:solve(p,B_CECH,C_PL)};})();
const PL0:[number,number]=[DIVE_END.sk.pelvis[0],DIVE_END.sk.pelvis[2]],PL1:[number,number]=[PL0[0]-.62,PL0[1]+.06];
const flat=(p:Pose):Pose=>({...p,dz:0,dx:0});
function pounce(u:number):{pose:Pose;place:Place}{
 const keys:[number,Pose][]=[[0,flat(DIVE_END.pose)],[.3,PK[0]],[PU_REACH,PK[1]],[.84,PK[2]],[1,PK[3]]];
 const w=sm(0,PU_REACH,u,easeInOutSine),pose=keyPoses(clamp(u),keys);pose.squash=clamp(-.05*sm(.2,.35,u)+.06*sm(.35,.6,u)-.08*sm(.6,.75,u)+.04*sm(.8,1,u),-.3,.3);
 return{pose,place:{x:lerp(PL0[0],PL1[0],w),z:lerp(PL0[1],PL1[1],w),yaw:Math.PI}};}
const REACH_SK=(()=>{const p=pounce(PU_REACH);return solve(p.pose,B_CECH,p.place);})();
/** the loose ball comes to rest under his reaching gloves */
const BREST:V3=[(REACH_SK.lHa[0]+REACH_SK.rHa[0])/2-.05,BALL_R,(REACH_SK.lHa[2]+REACH_SK.rHa[2])/2];
/** the parry: off the glove, up and forward, one bounce, then rolling slowly into his reach */
const T_B1=TF+.3,B1:V3=mix3(HIT,BREST,.72);B1[1]=BALL_R;
/** "big": tall on the balls of the feet, knees soft, arms wide and low, palms open (holding still, only a small bounce) */
const BIG=posed({lHipF:30,rHipF:30,lHipA:18,rHipA:18,lKnee:40,rKnee:40,lAnk:-4,rAnk:-4,lean:14,pitch:5,lShA:62,rShA:62,lShF:28,rShF:28,lElb:24,rElb:24,lShR:20,rShR:20,lHand:1,rHand:1,neckP:-10});
function cechAt(tau:number):{pose:Pose;place:Place}{
 if(tau>=T_P0)return pounce((tau-T_P0)/T_PD);
 if(tau>=SAVE0){const p=dive((tau-SAVE0)/DUR);return{pose:p,place:C_PL};}
 // before the kick: idle on his line (the delay while Ribéry is treated), then set, then big and still as Robben runs in
 const bob=.5+.5*Math.sin(tau*7);
 let p=blendPose(stand(),keeperSet(tau*1.1),sm(-6.5,-5.2,tau));
 if(tau<-5.2){p.neckY=.25*Math.sin(tau*.5);p.lShA+=.3*sm(-7.6,-7.2,tau)*(1-sm(-6.6,-6.2,tau));p.rShA+=.3*sm(-7.6,-7.2,tau)*(1-sm(-6.6,-6.2,tau));}
 const big={...BIG,lKnee:BIG.lKnee+.05*bob,rKnee:BIG.rKnee+.05*bob};
 p=blendPose(p,big,sm(-2,-1.3,tau,easeInOutSine));
 p=blendPose(p,dive(0),sm(SAVE0-.14,SAVE0,tau));
 return{pose:p,place:C_PL};}
// ---- Robben: the shot, low to Čech's left, with his LEFT foot (inferred) ----
const YR=yawTo(HIT[0]-SPOT[0],HIT[2]-SPOT[2]);
const RSTRIKE=(u:number)=>strike(u,{foot:'l',power:.7});
/** where Robben stands so his left toe meets the ball at contact, facing the shot */
const RFP:[number,number]=(()=>{const sk=solve(RSTRIKE(STRIKE_CONTACT),B_ROB,{yaw:YR});return[SPOT[0]-sk.lToe[0],SPOT[2]-sk.lToe[2]];})();
const RD=nrm2(Math.cos(YR),-Math.sin(YR)),RLEFT:[number,number]=[RD[1],-RD[0]];
const RUN0:[number,number]=[RFP[0]-RD[0]*3.4+RLEFT[0]*1.5,RFP[1]-RD[1]*3.4+RLEFT[1]*1.5];

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='rob'|'gk'|'che'|'fcb'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=10,DT=.02;
/** a player waiting outside the box and the D, then rushing in for the rebound after the kick */
const edge=(x:number,z:number,dx:number,dz:number,d=.12):number[][]=>[[T0,x,z],[-4,x+.2,z-.1],[-1,x,z],[d,x,z],[1.3+d,x+dx*.75,z+dz*.75],[2.4+d,x+dx,z+dz],[T1,x+dx*1.05,z+dz*1.05]];
const ACTORS:Actor[]=[
 {name:'Arjen Robben',role:'rob',hero:true,style:ROBBEN,keys:[[T0,SPOT[0]-.55,SPOT[2]-.25],[-7.4,SPOT[0]-.5,SPOT[2]-.2],[-6.2,RUN0[0]+.3,RUN0[1]+.1],[-4.8,...RUN0],[-1.3,...RUN0],[-.62,RFP[0]-RD[0]*1.5,RFP[1]-RD[1]*1.5],[0,...RFP],
  [.35,RFP[0]+RD[0]*.7,RFP[1]+RD[1]*.7],[1.1,BREST[0]-3.3,BREST[2]-1.3],[1.9,BREST[0]-2.1,BREST[2]-.9],[3,BREST[0]-2,BREST[2]-.85],[T1,BREST[0]-2.1,BREST[2]-.9]]},
 {name:'Petr Čech',role:'gk',hero:true,style:CECH,keys:[[T0,C_PL.x!,C_PL.z!],[T1,C_PL.x!,C_PL.z!]]},
 {name:'Didier Drogba',role:'che',hero:true,style:DROGBA,keys:edge(-17.6,-3.4,5.4,1.4,.05)},
 {name:'Chelsea 2',role:'che',style:che({build:{height:1.9},seed:42}),keys:edge(-17.2,4.2,5.8,.2,.1)},
 {name:'Chelsea 3',role:'che',style:che({skin:SKIN_M,hairStyle:'curly',build:{height:1.89},seed:43}),keys:edge(-16.9,-8.6,4.6,2.2,.02)},
 {name:'Chelsea 4',role:'che',style:che({seed:44}),keys:edge(-18.8,.6,3.2,.6,.2)},
 {name:'Chelsea 5',role:'che',style:che({skin:SKIN_D,seed:45}),keys:edge(-17,9.4,4.2,-2,.15)},
 {name:'Chelsea 6',role:'che',style:che({build:{height:1.75},seed:46}),keys:edge(-20.6,-5.8,2,.6,.3)},
 {name:'Bayern 1',role:'fcb',style:fcb({seed:21}),keys:edge(-17.4,-.8,5.6,.8,0)},
 {name:'Bayern 2',role:'fcb',style:fcb({build:{height:1.9},seed:22}),keys:edge(-17.1,6.6,5.2,-.6,.08)},
 {name:'Bayern 3',role:'fcb',style:fcb({skin:SKIN_M,seed:23}),keys:edge(-17.2,-6.2,5,1.2,.06)},
 {name:'Bayern 4',role:'fcb',style:fcb({build:{height:1.87},seed:24}),keys:edge(-19.4,2.8,3,.4,.25)},
 {name:'Bayern 5',role:'fcb',style:fcb({skin:SKIN_M,seed:25}),keys:edge(-16.9,11.2,3.6,-2.2,.18)},
 {name:'referee',role:'ref',style:REF,keys:[[T0,-13.8,-6.8],[-4,-13.6,-6.6],[T1,-13.6,-6.6]]},
 {name:'additional assistant',role:'ref',style:{...REF,hairStyle:'short',seed:34},keys:[[T0,.35,-6.4],[T1,.35,-6.4]]},
];
const ROB=0,GK=1;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** placed on the spot → the low shot → off the glove → one bounce → rolling into his reach → held in his arms */
function ballAt(tau:number):V3{
 if(tau<-7.4){// Robben carries it to the spot and sets it down
  const u=sm(-8.6,-7.4,tau),hand:V3=[SPOT[0]-.3,.95,SPOT[2]-.2];const p=mix3(hand,SPOT,u);p[1]=lerp(.95,BALL_R,u*u);return p;}
 if(tau<=0)return SPOT;
 if(tau<TF){const u=tau/TF,p=mix3(SPOT,HIT,u);p[1]+=.07*Math.sin(Math.PI*u);return p;}
 if(tau<T_B1){const u=(tau-TF)/(T_B1-TF),p=mix3(HIT,B1,easeOut(u)*.4+u*.6);p[1]=lerp(HIT[1],BALL_R,u)+.42*4*u*(1-u);return p;}
 if(tau<T_GRAB){const u=(tau-T_B1)/(T_GRAB-T_B1),e=1-(1-u)*(1-u),p=mix3(B1,BREST,e);p[1]=BALL_R+.1*Math.abs(Math.sin(u*Math.PI))*(1-u)*(u<.35?1:0);return p;}
 // gathered: the ball rides between his gloves and his chest
 const c=cechAt(tau),sk=solve(c.pose,B_CECH,c.place),hm=mix3(sk.lHa,sk.rHa,.5),held=mix3(hm,sk.chest,.3*sm(T_GRAB,T_GRAB+.5,tau));
 const w=sm(T_GRAB,T_GRAB+.14,tau);return[lerp(BREST[0],held[0],w),Math.max(BALL_R,lerp(BREST[1],held[1],w)),lerp(BREST[2],held[2],w)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*6:tau<T_GRAB?TF*TAU*6-(tau-TF)*TAU*4*(1-clamp((tau-TF)/(T_GRAB-TF))*.8):TF*TAU*6-(T_GRAB-TF)*TAU*2.4;

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // waiting at the edge of the box: weight forward, hands on hips or loose, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:18,rHipF:14,lKnee:24,rKnee:20,lean:12,pitch:3,neckP:-6,lShA:30,rShA:28,lElb:70,rElb:66,lShF:-10,rShF:-8,rAnk:-4,lAnk:-4}),.5+.5*Math.sin(tau*1.3+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
const HEAD_HANDS=posed({lHipF:14,rHipF:18,lKnee:24,rKnee:30,lShF:150,rShF:150,lShA:44,rShA:44,lElb:128,rElb:128,neckP:-14,lean:-4});
/** placing the ball: bent over the spot, both hands down */
const PLACE_BALL=posed({lHipF:78,rHipF:40,lKnee:96,rKnee:52,lean:44,pitch:10,neckP:30,lShF:64,rShF:58,lShA:10,rShA:10,lElb:26,rElb:24});
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k];if(a.role==='gk')return cechAt(tau);
 const[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'rob':{
   if(tau<-7.2)pose=blendPose(pose,PLACE_BALL,sm(-8.8,-8.3,tau)*(1-sm(-7.6,-7.2,tau)));
   if(tau>-4.8&&tau<-1.3){yaw=lerpAng(faceYaw(k,tau,SPOT),YR,.6);pose.neckP+=.05*Math.sin(tau*2.2);}
   // the kick: the strike blended over its window (contact at τ = 0), facing the shot
   if(tau>-.7&&tau<.7){const u=clamp((tau+.57)/1.1),w=Math.sin(clamp((tau+.7)/1.4)*Math.PI);pose=blendPose(pose,RSTRIKE(u),w);yaw=lerpAng(yaw,YR,w);}
   if(tau>=.7&&tau<2)yaw=lerpAng(yaw,faceYaw(k,tau),1);
   // Čech has it: hands to his head, then down (inferred)
   if(tau>T_GRAB+.2){pose=blendPose(pose,HEAD_HANDS,sm(T_GRAB+.2,T_GRAB+.7,tau));yaw=lerpAng(faceYaw(k,tau,BREST),yaw,0);}
   if(tau>T_GRAB+2.2)pose=blendPose(HEAD_HANDS,DEJECT,sm(T_GRAB+2.2,T_GRAB+3,tau));
   break;}
  case 'fcb':if(tau>T_GRAB+.3)pose=blendPose(pose,DEJECT,sm(T_GRAB+.5,T_GRAB+1.4,tau)*.8);if(tau>.3)yaw=faceYaw(k,tau,BREST);break;
  case 'che':if(tau>.3)yaw=faceYaw(k,tau,BREST);if(tau>T_GRAB+.2){const run=celebrate(distOf(k,tau)/4.2+k*.3,{kind:'arms'});pose=blendPose(pose,run,sm(T_GRAB+.3,T_GRAB+.9,tau)*.75);}break;
  case 'ref':yaw=faceYaw(k,tau,SPOT);pose=blendPose(stand(),pose,.3);pose.neckY=.2*Math.sin(tau*.6+k);break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** a unit sphere, sampled once (the headguard's panels) */
const SPH:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=10;i++){const la=-Math.PI/2+i/10*Math.PI;for(let j=0;j<18;j++){const lo=j/18*TAU;o.push([Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)]);}}return o;})();
/** head frame (row-major 3×3; columns forward, up, right) applied to a local direction */
const mv=(m:number[],v:V3):V3=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
function hull2(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:Pt[]=[],up:Pt[]=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
/** Čech's headguard: a padded black cap over the crown, the back of the head and the ears (the rim runs just above the brow), a pale panel
 * seam over the top and a chin strap. Printed after the body with the body's squash mapping; skipped when a hand or elbow is in front of the
 * head (the athlete's dark hair cap, printed in its own depth layer, then reads as the headguard). */
function headguard(s:Sheet,c:Cam,sk:Skeleton,pose:Pose){
 const H=sk.fr.H,hc=sk.head,r=.105*sk.s*1.13,eye=c.eye,view3=nrm3(sub3(hc,eye));
 for(const j of [sk.lHa,sk.rHa,sk.lEl,sk.rEl]){if(toCam(c,j)[2]<toCam(c,hc)[2]-.05){const a=pr(c,j),b=pr(c,hc);if(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<kAt(c,hc)*r*1.9)return;}}
 // the same volume-preserving squash drawAthlete applies (anchored at the lowest joint, along pelvis → neck)
 const raw=(p:V3):Pt|null=>pr(c,p),kq=pose.squash||0;let px=raw;
 if(Math.abs(kq)>1e-3){let low:V3=sk.lToe;for(const j of [sk.rToe,sk.lHeel,sk.rHeel,sk.lKn,sk.rKn,sk.pelvis,sk.lHa,sk.rHa,sk.head])if(j[1]<low[1])low=j;
  const c0=raw(low),a0=raw(sk.pelvis),a1=raw(sk.neck);if(c0&&a0&&a1){let ax=a1[0]-a0[0],ay=a1[1]-a0[1];const al=Math.hypot(ax,ay);if(al<1e-6){ax=0;ay=-1;}else{ax/=al;ay/=al;}const al2=1+kq,pp=1/(1+kq);
   px=(p:V3)=>{const q=raw(p);if(!q)return null;const dx=q[0]-c0[0],dy=q[1]-c0[1],t=dx*ax+dy*ay,ox=dx-ax*t,oy=dy-ay*t;return[c0[0]+ax*t*al2+ox*pp,c0[1]+ay*t*al2+oy*pp];};}}
 const pts:Pt[]=[];for(const u of SPH){if(-.33*u[0]+.94*u[1]<-.13)continue;const d=mv(H,u);if(dot3(d,view3)>.12)continue;const q=px(add3(hc,mul3(d,r)));if(q)pts.push(q);}
 if(pts.length<5)return;
 const capP=polyPath(hull2(pts),true);s.knockout(capP,.9);s.fill(K,capP,.92);
 const hpx=kAt(c,hc)*r;if(hpx<9)return;
 // the pale seam over the crown, front to back, where it faces the camera
 const seam:Pt[]=[];for(let i=0;i<=10;i++){const a=-.2+i/10*2.2,u:V3=[Math.cos(a),Math.sin(a),0],d=mv(H,u);if(dot3(d,view3)>0||-.33*u[0]+.94*u[1]<-.1)continue;const q=px(add3(hc,mul3(d,r*1.01)));if(q)seam.push(q);}
 if(seam.length>2)s.knockout(ribbon(seam,Math.max(1.5,hpx*.09),{taper:.5,pressure:.2,wobble:0}),.85);
 // the chin strap from under each ear to under the chin
 const strap:Pt[]=[];for(const u of [[-.1,-.55,.83],[.25,-.85,.46],[.42,-.9,0],[.25,-.85,-.46],[-.1,-.55,-.83]] as V3[]){const d=mv(H,nrm3(u));if(dot3(d,view3)>.25)continue;const q=px(add3(hc,mul3(d,r*.93)));if(q)strap.push(q);}
 if(strap.length>1)s.fill(K,ribbon(strap,Math.max(1.4,hpx*.07),{taper:0,pressure:0,wobble:0}),.9);
}
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the kick, the dive, the pounce). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const res=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(HEADGUARD.has(style)&&res.detail!=='low')headguard(s,camera,res.sk,pose);
 return res;
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=3;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,cap=FULL_CAP):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,preview=s.arrival<PASSAGE.seam-1e-3,scr0=s._passage.screen,passing=!!s._passage.pending||preview;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>cap?near[cap-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  {const d=m.transformPoint(new DOMPoint(g[0],g[1])),rr=k*ppu*s.dpr;let x0=0,y0=0,x1=s.width*s.dpr,y1=s.height*s.dpr;
   if(preview&&scr0){x0=Math.max(x0,Math.min(...scr0.map(p=>p[0])));x1=Math.min(x1,Math.max(...scr0.map(p=>p[0])));y0=Math.max(y0,Math.min(...scr0.map(p=>p[1])));y1=Math.min(y1,Math.max(...scr0.map(p=>p[1])));}
   if(d.x<x0-rr||d.x>x1+rr||d.y<y0-rr||d.y>y1+rr)continue;}
  const px=k*ppu,low=passing||(!f.hero&&(px<120||q[2]>dCap))||px<44,style:AthleteStyle=low?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,low?undefined:f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2]-.05,draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 {const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier for the heroes), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:number}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===ROB&&tau>-.3&&tau<.3)||(k===GK&&tau>SAVE0&&tau<SAVE0+DUR*.8)||(k===GK&&tau>T_P0+.1&&tau<T_GRAB+.1))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const cechPt=(tau:number,y=.9):V3=>{const c=cechAt(tau),sk=solve(c.pose,B_CECH,c.place);return[sk.pelvis[0],y<0?sk.pelvis[1]:y,sk.pelvis[2]];};
/** a flat ring on the grass (dashed or solid), knocked out then printed */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,dashed=true){
 if(a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];if(dashed)for(let i=0;i<12;i++)gaps.push([(i+.66)/12,(i+.96)/12]);
 const d=ribbon(pts.concat([pts[0]]),Math.max(7,kAt(c,P)*.1),{seed:31,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a screen-space ring round a point */
function ring2(s:Sheet,g:Pt,rad:number,w:number,ink:string,a:number){if(a<=0||rad<2)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU;pts.push([g[0]+Math.cos(u)*rad,g[1]+Math.sin(u)*rad]);}
 const p=ribbon(pts,w,{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(p,.9*a);s.fill(ink,p,.95*a);}
/** "big": a dashed outline through his hands, head and feet — the space he fills */
function bigOutline(s:Sheet,c:Cam,sk:Skeleton,a:number,ink=Y){
 if(a<=.02)return;const cc=pr(c,sk.chest);if(!cc)return;const pts:Pt[]=[];for(const j of [sk.lHa,sk.head,sk.rHa,sk.rToe,sk.lToe]){const p=pr(c,j);if(!p)return;pts.push([lerp(cc[0],p[0],.6+.55*a),lerp(cc[1],p[1],.6+.55*a)]);}
 const gaps:[number,number][]=[];for(let x=.04;x<1;x+=.1)gaps.push([x,x+.035]);
 const d=ribbon(pts,Math.max(7,.06*kAt(c,sk.chest)),{close:true,taper:0,pressure:0,wobble:.6,gaps});s.knockout(d,.9*a);s.fill(ink,d,.95*a);s.stroke(K,d,2,.7*a);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time, anchored so the ball meets his glove on "saved" */
const tau1=(t:number)=>t-(CUE(0,'saved')+.05-TF);
const P1:V3=[-40,22,-62];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-10,0,7],fov:27})],
  [CUE(0,'Extra time')-.2,1.6,()=>({P:P1,T:[-8,1,1],fov:14})],
  [CUE(0,'Penalty to')-.1,1.1,()=>({P:P1,T:mix3(SPOT,at(ROB,tau,.8),.4),fov:8})],
  [CUE(0,'steps up')-.2,1.2,()=>({P:P1,T:mix3(at(ROB,tau,.9),[-4,1,.6],.35),fov:9})],
  [CUE(0,'Petr Čech')-.35,1,()=>({P:P1,T:[-5.4,1,.7],fov:8.6})],
  [CUE(0,'saved')+.15,.9,()=>({P:P1,T:mix3([-1.4,.8,2.2],b,.3),fov:7})],
  [CUE(0,'saved')+1.6,1.4,()=>({P:P1,T:[-3.2,.9,1.6],fov:9.5})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tS=CUE(0,'saved');
  stadium(s,c,t,[0,1,3],{roar:.8*sm(tS+.8,tS+1.3,t),blueRoar:true,flash:sm(tS+.6,tS+1.1,t)*(1-sm(tS+2.4,tS+3,t))});
  ground(s,c);
  // "Penalty to Bayern": a red ring round the spot; Robben's ring on his name, Čech's on his
  const pb=sm(CUE(0,'Penalty')-.1,CUE(0,'Penalty')+.3,t,easeOutBack)*(1-sm(CUE(0,'Arjen'),CUE(0,'Arjen')+.5,t));groundRing(s,c,[SPOT[0],0,SPOT[2]],1.1*clamp(pb,0,1.2),R,clamp(pb),false);
  const rr=sm(CUE(0,'Arjen'),CUE(0,'Arjen')+.3,t,easeOutBack)*(1-sm(CUE(0,'old Chelsea'),CUE(0,'old Chelsea')+.5,t));if(rr>.02)groundRing(s,c,gnd(at(ROB,tau)),1.1*rr,R,clamp(rr));
  const cr=sm(CUE(0,'Petr'),CUE(0,'Petr')+.3,t,easeOutBack)*(1-sm(tS-.5,tS-.1,t));if(cr>.02)groundRing(s,c,[C_PL.x!-.3,0,C_PL.z!],1.1*cr,B,clamp(cr));
  // "old Chelsea teammate": a blue dashed link between the two old team-mates
  const ot=sm(CUE(0,'old Chelsea'),CUE(0,'old Chelsea')+.5,t)*(1-sm(CUE(0,'Petr')+.4,CUE(0,'Petr')+.9,t));
  if(ot>.02){const a=pr(c,at(ROB,tau,.02)),b=pr(c,[C_PL.x!-.3,.02,C_PL.z!]);if(a&&b){const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.1)gaps.push([x,x+.05]);const d=ribbon([a,[lerp(a[0],b[0],ot),lerp(a[1],b[1],ot)]],Math.max(6,kAt(c,SPOT)*.1),{taper:0,wobble:.6,gaps});s.knockout(d,.9);s.fill(B,d,.95);}}
  const r=play(s,c,tau,tp,{min:13,lines:true,prevBall:tau1(t-.06),smear:true,cap:2});
  const hit=(tau-TF)/.2;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*5),{n:9,seed:3,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:10});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'saved')+.2;},
};
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];

// ---------------------------------------------------------------- 2 · the slow-motion replay from behind Robben
const tau2=(t:number)=>key(t,mono([[0,-1.55],[CUE(1,'stays big'),-1.05],[CUE(1,'waits'),-.4],[CUE(1,'pushes off'),.02],[CUE(1,'to his left'),.24],[CUE(1,'stops it'),TF+.01],[SECS(1),TF+.42]]),linear);
const E2:V3=[-36,6.4,2.6];
function cam2(t:number):Cam{
 const tau=tau2(t);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-7,.6,.9],fov:13})],
  [CUE(1,'stays big')-.2,1.4,()=>({P:E2,T:[-3.2,.8,.9],fov:9})],
  [CUE(1,'pushes off')-.3,1,()=>({P:add3(E2,[4,-.8,-.2]),T:mix3([-1,.8,1.3],cechPt(tau),.3),fov:8.4})],
  [CUE(1,'stops it')-.3,.8,()=>({P:add3(E2,[4.4,-.9,-.2]),T:[HIT[0]-.3,.6,HIT[2]-.6],fov:7.6})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tB=CUE(1,'stays big'),tW=CUE(1,'waits'),tP=CUE(1,'pushes off'),tL=CUE(1,'to his left'),tS=CUE(1,'stops it');
  stadium(s,c,t,[1],{roar:.6*sm(TF,TF+.3,tau),blueRoar:true,flash:.2*sm(TF,TF+.3,tau)});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:10,cap:2});
  const st=cechAt(tau),sk=solve(st.pose,B_CECH,st.place);
  // "stays big (and still)": the dashed outline of the space he fills
  bigOutline(s,c,sk,sm(tB,tB+.45,tt,easeOutBack)*(1-sm(tW+.4,tP-.1,tt)));
  // "waits for the kick": a ring on the ball, ticking down until Robben's boot meets it
  const wk=sm(tW-.1,tW+.3,tt)*(1-sm(tP+.1,tP+.5,tt));if(wk>0&&r.ball)ring2(s,r.ball.g,r.ball.r*2.2*(1+.12*Math.sin(tt*9)),Math.max(5,r.ball.r*.3),Y,wk);
  // "pushes off strongly": a spark under the pushing (left) boot at launch, and an arrow of the push toward his left
  const pu=sm(tP-.1,tP+.25,tt)*(1-sm(tS,tS+.4,tt));
  if(pu>0){const f=pr(c,sk.lToe);if(f)sparkBurst(s,Y,f[0],f[1],Math.max(50,kAt(c,sk.lToe)*.6)*pu,{n:9,seed:41,g:easeOutBack(pu),width:10});}
  const la=sm(tL-.15,tL+.5,tt,easeInOutSine)*(1-sm(tS+.4,tS+.9,tt));
  if(la>0){const a:V3=[-.9,.05,.3],b:V3=[-.9,.05,.3+2.4*la];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.07),R,.95);}
  // "stops it": sparks where the glove meets the ball
  const hit=(tau-TF)/.12;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'stops it')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay: low behind the goal, through the net
const tau3=(t:number)=>key(t,mono([[0,-.9],[CUE(2,'wanted'),-.25],[CUE(2,'stays low'),.12],[CUE(2,'spins loose')-.1,TF+.05],[CUE(2,'pounces')-.2,T_GRAB-.2],[CUE(2,'pounces')+.5,T_GRAB+.3],[SECS(2),T_GRAB+1.6]]),linear);
const E3:V3=[8.6,2.3,3.1];
function cam3v(t:number):Cam{
 const tau=tau3(t);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-6.5,.7,.3],fov:30})],
  [CUE(2,'stays low')-.2,.9,()=>({P:E3,T:[-3,.5,1.4],fov:27})],
  [CUE(2,'spins loose')-.2,1,()=>({P:add3(E3,[-.4,-.3,.2]),T:mix3([BREST[0],.35,BREST[2]],cechPt(tau),.4),fov:20})],
  [CUE(2,'pounces')+.8,1.4,()=>({P:add3(E3,[-.2,.1,-.2]),T:mix3(cechPt(tau),at(ROB,tau,1),.35),fov:25})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tH=CUE(2,'wanted'),tL=CUE(2,'stays low'),tX=CUE(2,'spins loose'),tPo=CUE(2,'pounces');
  stadium(s,c,t,[0,2,3],{roar:.9*sm(T_GRAB,T_GRAB+.4,tau),blueRoar:true,flash:sm(T_GRAB,T_GRAB+.4,tau)*.8});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:10,lines:true,prevBall:tau3(t-.06),cap:2});
  // "wanted it high": Robben's plan, a red dashed ghost path up into the goal; "stays low": the real one, in yellow along the grass
  const gh=sm(tH-.1,tH+.6,tt,easeInOutSine)*(1-sm(tX,tX+.5,tt));
  if(gh>0){const top:V3=[0,2.05,HIT[2]*.95],dots=new Path2D();let last:Pt|null=null,prev:Pt|null=null;
   for(let i=0;i<=18;i++){const u=i/18*gh,p=mix3(SPOT,top,u);const q=pr(c,p);if(!q)continue;const rr=Math.max(4,kAt(c,p)*.07);dots.moveTo(q[0]+rr,q[1]);dots.arc(q[0],q[1],rr,0,TAU);prev=last;last=q;}
   if(last&&prev&&gh>.6){const dx=last[0]-prev[0],dy=last[1]-prev[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,z=Math.max(12,kAt(c,top)*.16);dots.addPath(polyPath([[last[0]+ux*z*1.4,last[1]+uy*z*1.4],[last[0]-uy*z,last[1]+ux*z],[last[0]+uy*z,last[1]-ux*z]],true));}
   s.knockout(dots,.9*gh);s.fill(R,dots,.95*gh);s.stroke(K,dots,2,.6*gh);}
  const lo=sm(tL-.1,tL+.3,tt)*(1-sm(tX-.4,tX,tt));
  if(lo>0&&tau>0){const pts:Pt[]=[];for(let i=0;i<=14;i++){const q=pr(c,ballAt(Math.min(tau,TF)*i/14));if(q)pts.push(q);}if(pts.length>2){const w=Math.max(6,kAt(c,HIT)*.1);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*lo);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*lo);}}
  const hit=(tau-TF)/.14;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // "spins loose": a yellow ring chasing the loose ball; "pounces": the ring snaps shut on it as he gathers
  const lz=sm(tX-.1,tX+.3,tt)*(1-sm(tPo+.4,tPo+.9,tt));if(lz>0&&r.ball){const sh=tt>tPo?1-.35*sm(tPo,tPo+.3,tt):1;ring2(s,r.ball.g,r.ball.r*2.3*sh,Math.max(5,r.ball.r*.3),Y,lz);}
  if(tt>tPo-.1&&tt<tPo+.6&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*5),{n:8,seed:29,g:easeOutBack(sm(tPo-.1,tPo+.15,tt))*(1-sm(tPo+.25,tPo+.6,tt)),width:9});
 },
 aperture(t){const c=cam3v(t),p=cechPt(tau3(twos(t)),-1),q=pr(c,p)??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(2,'pounces')+.3;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-2.6],[CUE(3,'Stay big'),-1.1],[CUE(3,'wait'),-.4],[CUE(3,'push off'),.02],[CUE(3,'push off')+.9,TF+.08],[CUE(3,'follow'),TF+.45],[SECS(3)-.4,T_GRAB+.5]]),linear);
const E4:V3=[-7,3.2,-15.5];
function cam4v(t:number):Cam{
 const tau=tau4(t);
 return plan(t,[
  [0,0,()=>({P:E4,T:[-6.9,.6,0],fov:42})],
  [CUE(3,'Stay big')-.3,1.2,()=>({P:[-5.2,1.7,-6.4],T:[-.6,.95,.9],fov:30})],
  [CUE(3,'push off')-.3,1,()=>({P:[-5.6,1.6,-6.2],T:[-.9,.7,1.5],fov:32})],
  [CUE(3,'follow')-.2,1.1,()=>({P:[-6.4,1.8,-6],T:mix3([BREST[0],.4,BREST[2]],cechPt(tau),.4),fov:34})],
 ]);
}
/** the keeper's notebook: a paper page, ruled lines, a little goal with dots where the takers shot (generic, illustrative) */
function notebook(s:Sheet,x:number,y:number,w:number,a:number,t:number){
 if(a<=0)return;const h=w*1.3,rot=-.08+.03*Math.sin(t*1.2),cx=x,cy=y+(1-easeOutBack(a))*h*.4;
 const P=(u:number,v:number):Pt=>{const X=(u-.5)*w,Yv=(v-.5)*h;return[cx+X*Math.cos(rot)-Yv*Math.sin(rot),cy+X*Math.sin(rot)+Yv*Math.cos(rot)];};
 const page=polyPath([P(0,0),P(1,0),P(1,1),P(0,1)],true);s.tone(K,polyPath([P(.04,.04),P(1.04,.04),P(1.04,1.04),P(.04,1.04)],true),.35*a);s.knockout(page,a);s.stroke(K,page,Math.max(2,w*.012),.9*a);
 const lines=new Path2D();for(let i=0;i<5;i++){const v=.56+i*.085;lines.addPath(ribbon([P(.1,v),P(.9,v)],Math.max(1.5,w*.008),{taper:0,wobble:.4}));}s.fill(B,lines,.7*a);
 const gl=ribbon([P(.18,.44),P(.18,.14),P(.82,.14),P(.82,.44)],Math.max(2,w*.018),{taper:0,wobble:.4});s.fill(K,gl,.9*a);
 const dots=new Path2D();for(const[u,v] of [[.27,.38],[.72,.37],[.3,.2],[.68,.22],[.5,.36]] as [number,number][]){const q=P(u,v),rr=w*.03;dots.moveTo(q[0]+rr,q[1]);dots.arc(q[0],q[1],rr,0,TAU);}s.fill(R,dots,.9*a);
 const q=P(.72,.37);ring2(s,q,w*.07,Math.max(2,w*.014),Y,a*sm(.3,1,a));
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tK=CUE(3,'Keepers'),tH=CUE(3,'homework'),tT=CUE(3,'penalty takers'),tB=CUE(3,'Stay big'),tW=CUE(3,'wait'),tP=CUE(3,'push off'),tF=CUE(3,'follow');
  stadium(s,c,t,[0,1],{roar:.5*sm(tF+.4,tF+1,t),blueRoar:true});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:14,only:[ROB,GK],cap:1});
  const st=cechAt(tau),sk=solve(st.pose,B_CECH,st.place);
  // "Keepers": a ring round Čech; "penalty takers": a red ring round Robben
  const kr=sm(tK,tK+.3,tt,easeOutBack)*(1-sm(tH+.2,tH+.6,tt));if(kr>.02)groundRing(s,c,[C_PL.x!-.3,0,C_PL.z!],1.2*kr,B,clamp(kr));
  const tr=sm(tT,tT+.3,tt,easeOutBack)*(1-sm(tB,tB+.4,tt));if(tr>.02)groundRing(s,c,gnd(at(ROB,tau)),1.1*tr,R,clamp(tr));
  // "do your homework": the notebook slides in over the corner of the frame
  const nb=sm(tH-.1,tH+.4,tt)*(1-sm(tB-.2,tB+.2,tt));if(nb>0)notebook(s,-s.W*.02,-s.H*.22,Math.min(s.W*.2,s.H*.34),nb,t);
  // "Stay big": the outline; "wait": a timer arc round him that fills until the kick
  bigOutline(s,c,sk,sm(tB,tB+.4,tt,easeOutBack)*(1-sm(tP,tP+.4,tt)));
  const wt=sm(tW-.1,tW+.25,tt)*(1-sm(tP+.1,tP+.4,tt));
  if(wt>0){const cc=pr(c,[C_PL.x!-.2,1.05,C_PL.z!]);if(cc){const k0=kAt(c,[C_PL.x!,1,C_PL.z!]),R0=1.25*k0,fill=clamp((tau+1.1)/1.1),pts:Pt[]=[];for(let i=0;i<=30;i++){const a=-Math.PI/2+fill*TAU*i/30;pts.push([cc[0]+Math.cos(a)*R0,cc[1]+Math.sin(a)*R0*.95]);}
   s.stroke(Y,polyPath(Array.from({length:36},(_,i)=>[cc[0]+Math.cos(i/36*TAU)*R0,cc[1]+Math.sin(i/36*TAU)*R0*.95] as Pt),true),Math.max(3,.012*k0),.5*wt);if(fill>.01){const d=ribbon(pts,Math.max(6,.04*k0),{taper:0,wobble:.5});s.knockout(d,.9*wt);s.fill(Y,d,.95*wt);}}}
  // "push off strongly": the spark under the pushing boot and the arrow of the push
  const pu=sm(tP-.1,tP+.3,tt)*(1-sm(tF-.2,tF+.2,tt));
  if(pu>0){const f=pr(c,sk.lToe);if(f&&tau<.4)sparkBurst(s,Y,f[0],f[1],Math.max(60,kAt(c,sk.lToe)*.55)*pu,{n:9,seed:43,g:easeOutBack(pu),width:11});
   const a:V3=[-1,.05,.25],b:V3=[-1,.05,.25+2.3*sm(tP,tP+.8,tt,easeInOutSine)];if(b[2]-a[2]>.2)arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(9,kAt(c,a)*.06),R,.95*pu);}
  const hit=(tau-TF)/.14;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:47,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // "follow the rebound": a ring on the loose ball and a dashed arrow from him to it
  const fr=sm(tF-.1,tF+.35,tt)*(1-sm(SECS(3)-.9,SECS(3)-.5,tt));
  if(fr>0&&r.ball){ring2(s,r.ball.g,r.ball.r*2.2,Math.max(5,r.ball.r*.3),Y,fr);
   if(tau<T_GRAB){const from=add3(sk.chest,[0,-.2,0]),to:V3=[BREST[0],.3,BREST[2]];arrow3(s,c,[from,mix3(from,to,.5),mix3(from,to,.85)],Math.max(7,kAt(c,to)*.045),Y,.95*fr);}}
 },
 get still(){return CUE(3,'push off')+.5;},
};

const film:RisoStory={
 id:'cech-robben-2012',format:'11v11',title:"Čech's extra-time penalty save",
 theme:'Keepers: do your homework on penalty takers, stay big, wait, push off strongly — and always follow the rebound',
 ageNote:'Bayern Munich 1–1 Chelsea (Chelsea won 4–3 on penalties), Champions League final, Munich, 19 May 2012. In the 95th minute Petr Čech saved Arjen Robben\'s penalty low to his left and smothered the rebound.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a low shot skids in from the side, a yellow spark where a glove stops it, and it drops dead. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.28),back=clamp((age-.28)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.28?x-220*(1-u):x-50*easeOut(back),by=age<.28?y+18*(1-u):y+22*easeOut(back)-26*Math.sin(Math.PI*back)*(1-back);
  if(age>.24&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.24)/.12))*(1-clamp((age-.44)/.16)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Chelsea's goal line x = 0, +z = Čech's left) — checked by tests/play-film-cech-robben-2012.cjs. */
export const FACTS={SPOT,HIT,BREST,TF,SAVE0,T_GRAB,ballAt,shotFoot:'l' as const,
 robbenContact:()=>{const st=stateOf(ROB,0),sk=solve(st.pose,B_ROB,st.place);return{lToe:sk.lToe,rToe:sk.rToe,yaw:st.place.yaw??0};},
 cechAt:(tau:number)=>{const st=cechAt(tau),sk=solve(st.pose,B_CECH,st.place);return{lHa:sk.lHa,rHa:sk.rHa,chest:sk.chest,head:sk.head,pelvis:sk.pelvis,yaw:st.place.yaw??0};},
 robbenAt:(tau:number)=>{const st=stateOf(ROB,tau),sk=solve(st.pose,B_ROB,st.place);return{pelvis:sk.pelvis};},
 drogbaStyle:DROGBA,cechStyle:CECH,robbenStyle:ROBBEN,
};
