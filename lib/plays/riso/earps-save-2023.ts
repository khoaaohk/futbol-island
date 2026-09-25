/** Mary Earps saves Jenni Hermoso's penalty — Spain 1–0 England, 2023 FIFA Women's World Cup final, Stadium Australia, Sydney,
 * Sunday 20 August 2023 (second half, Spain leading 1–0). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture
 * window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction of the kick and the save from WRITTEN accounts and two agency photographs
 * (the broadcast footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026; fetched with curl, cached in the film scratchpad src-cache/):
 *  - Wikipedia, "2023 FIFA Women's World Cup final" (date, 20:00 UTC+10 kick-off, Stadium Australia, 75,784, clear night 14.3 °C, referee
 *    Tori Penso (USA), line-ups + numbers, the kit boxes: Spain red shirts, navy shorts and socks; England light-blue shirts and shorts,
 *    white socks; the match narrative: Carmona 29', Walsh's accidental handball from a corner, "After a lengthy VAR review, Spain forward
 *    Jennifer Hermoso took the penalty in the 70th minute, with the shot saved by Earps") https://en.wikipedia.org/wiki/2023_FIFA_Women%27s_World_Cup_final
 *  - Wikipedia, "Mary Earps" (1.73 m; "saved a penalty from Jennifer Hermoso in the 68th minute"; Golden Glove) https://en.wikipedia.org/wiki/Mary_Earps
 *  - The Guardian, Suzanne Wrack, "Spain win Women's World Cup as Olga Carmona strike breaks England hearts", 20 Aug 2023 ("In the 64th
 *    minute Walsh conceded a penalty ... Earps ... went the right way for Jenni Hermoso's low spot-kick, grasping the ball")
 *    https://www.theguardian.com/football/2023/aug/20/spain-england-womens-world-cup-final-match-report
 *  - The Guardian, "Women's World Cup final: Spain crowned after beating England – in pictures", 20 Aug 2023: caption "Earps dives low to
 *    her left and saves the spot-kick!" (photo: Brendon Thorne/Getty Images — Earps in an all-green keeper kit with long sleeves and light
 *    gloves, blonde ponytail, both gloves on the ball at ground level right beside her left-hand post); the handball photo (Catherine
 *    Ivill/Getty) shows the kits: England light blue with white socks, Spain red shirts, navy shorts and socks, yellow numbers
 *    https://www.theguardian.com/football/gallery/2023/aug/20/womens-world-cup-final-spain-crowned-after-beating-england-in-pictures
 *  - The Guardian, "Clamour grows for Nike to sell replica Mary Earps shirt after World Cup final", 20 Aug 2023 (Golden Glove; her shout
 *    after the save) https://www.theguardian.com/football/2023/aug/20/nike-replica-mary-earps-lionesses-england-shirt-world-cup-final-golden-glove
 *  - BBC Sport, "Lionesses miss opportunity to cement legend status", 20 Aug 2023 ("Earps superbly saved Jenni Hermoso's penalty")
 *    https://www.bbc.com/sport/football/66562418
 * CONFIRMED: Sunday 20 August 2023, a night final at Stadium Australia, Sydney; Spain led 1–0 (Carmona 29'); the penalty came from a
 *  handball by Walsh (4), given after VAR; Hermoso (10) took it; it was LOW; Earps (1) DIVED LOW TO HER LEFT and saved it with both gloves,
 *  beside her left post; she shouted in celebration; she won the Golden Glove; Spain went on to win 1–0. Kits as above; Earps in green.
 * INFERRED (illustrative): Hermoso's shooting foot (drawn right-footed, the usual; not narrated), her run-up (≈4.6 m from her left at ≈20°,
 *  a normal pace), the shot speed (≈80 km/h, ≈.5 s to the gloves) and its exact line (just inside the post, ≈.3 m high); the exact minute
 *  (sources say 68' and 70' — not narrated); which end and which touchline (the save goes toward the camera side); Earps' set stance
 *  (arms wide) and the moment she moved; her gathering the ball in, getting up and roaring with clenched fists (the shout is sourced, the
 *  pose is drawn); teammates running to her; Spain's reaction; which players stood where outside the box (7 of each side drawn); Penso's
 *  yellow kit and her gesture to the spot; hair (Earps blonde ponytail from the photo; Hermoso's dark hair tied back from memory);
 *  Hermoso's height; the crowd's colours, banners, roof lights and camera placements. England's light blue is printed as a light navy
 *  screen (this ink set spends its fourth plate on green: Earps' kit and the grass).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the bowl → the box, 1–0 → the referee points
 * to the spot, Hermoso sets the ball → Earps big on her line → the run, the low shot, the dive → "Saved!", Earps roars, teammates run in);
 * ch2 = the slow-motion replay, LOW from behind the penalty spot, off Hermoso's left shoulder (Earps waits big and patient, then springs
 * low; a riso trail on the ball; the gloves stop it); ch3 = the second replay angle from BEHIND THE GOAL by the post, through the net (both
 * gloves on the ball beside the post, then live again as she roars); ch4 = the lesson: stay big (a yellow shape spans her) → read the
 * kicker's body (a sight line; rings on the hips and the planting foot, arrows where they point) → dive with strong hands (a red dive
 * arrow, a yellow burst at the gloves). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe),
 * framing from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion so the ponytails swing, motionSmear on
 * the run, the strike and the dive); women's builds (1.62–1.80 m, slimmer bulk) with ponytails; small wide-shot figures and every figure
 * inside a passage print at `low` detail. Handedness: the world is right-handed (x toward England's goal, y up, +z = the kicker's right,
 * the main-stand side), athlete.ts's own convention, so Hermoso's RIGHT foot strikes with no mirrored projector; Earps faces −x, so her
 * LEFT is +z (keeperDive side 'l'). The ball is aimed at Earps' solved gloves, so it always meets her hands. Inks: yellow, red, green,
 * navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness
 * seeded. Budget ≈ 150–320 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Skeleton} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/earps-save-2023/timing.json, add
 *   import timingJson from '../../../public/plays/narration/earps-save-2023/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word only, in order — so no cue starts with a word that also appears between it and the previous
 * cue's first word (hence 'hips', 'planting', not 'the hips'). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The save, live',text:'Sydney, the 2023 World Cup final. Spain lead England one-nil, and win a penalty. Jenni Hermoso steps up. Mary Earps waits on her line... Hermoso shoots low. Earps dives to her left. Saved!',tail:2.4,
  cues:['Sydney','Spain lead','win a penalty','Jenni Hermoso','Mary Earps','Hermoso shoots','Earps dives','Saved']},
 {label:'Watch it again',text:'Watch it again, slowly. Earps stays big and patient. Then she springs low, and both strong hands stop the ball.',tail:1.4,
  cues:['Watch it again','stays big','springs low','strong hands','stop the ball']},
 {label:'Right by the post',text:'From behind the goal: both gloves, right by the post. England are still in it!',tail:1.8,
  cues:['From behind','both gloves','right by','England are']},
 {label:'The secret',text:"The secret? Keepers, stay big. Read the kicker's body: the hips and the planting foot. Then dive with strong hands.",tail:1.8,
  cues:['The secret','stay big','Read','hips','planting','dive with','strong hands']},
];
import timingJson from '../../../public/plays/narration/earps-save-2023/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('earps: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('earps: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',G='green',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: England's goal line is x = 0 (the kick goes +x), the goal centre z = 0, +z = the kicker's right (the main-stand side). */
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

// ---------------------------------------------------------------- Stadium Australia at night (the same bowl as the Kerr semi-final film)
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind England's goal, 2 the main stand (z>0, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.3+30*b,-42-34*b],
 (a,b)=>[8+30*b,1.3+27*b,lerp(-58,58,a)],
 (a,b)=>[lerp(14,-118,a),1.3+26*b,42+30*b],
 (a,b)=>[-113-30*b,1.3+27*b,lerp(58,-58,a)],
];
const STAND_COLS=[104,72,104,72],STAND_ROWS=16,WALKS=[[.4,.72],[.45],[.45],[.45]];
/** banners on the stand fronts: [stand, a, kind 0 = Spain (red | yellow | red), 1 = St George (paper, red cross)] */
const FLAGS:[number,number,number][]=[[0,.42,0],[0,.55,1],[0,.68,0],[0,.8,1],[1,.2,1],[1,.4,0],[1,.62,1],[1,.82,0],[2,.12,1],[2,.3,0],[3,.28,0],[3,.6,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a clear winter night in Sydney: a deep navy print over the paper, a faint floodlit haze over the bowl
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-700],[1e4,hz[1]-700],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.14);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.6,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.86),[0,9.5,0]),add3(S(0,.86),[0,9.5,0])]));
  seg3(c,add3(S(0,.86),[0,9.3,0]),add3(S(1,.86),[0,9.3,0]),.45,edge);}
 s.knockout(planes);s.tone(K,planes,.55);s.tone(G,planes,.22);s.knockout(walk,.5);
 // the crowd: Spain red and yellow, England white and red, a scatter of green; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.5?0:h<.72?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.knockout(inks[2],.8);s.fill(Y,inks[2],.95);s.fill(G,inks[3],.8);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 // banners: Spain red-yellow-red; St George (paper, red cross)
 const red=new Path2D(),gold=new Path2D(),fl=new Path2D(),cr=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.07),P(0,.07)]);if(q.length<3)continue;
  if(kind===0){red.addPath(polyPath(q,true));addPoly(gold,polyP(c,[P(0,.022),P(1,.022),P(1,.053),P(0,.053)]));}
  else{fl.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.07),P(.43,.07)]));addPoly(cr,polyP(c,[P(0,.032),P(1,.032),P(1,.043),P(0,.043)]));}}
 s.knockout(red);s.fill(R,red,.95);s.knockout(gold);s.fill(Y,gold,.95);s.knockout(fl);s.fill(R,cr,.95);
 // floodlights along the roof lip with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.86),[0,8.6,0]),b=add3(S(u+.025,.86),[0,8.6,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass under the floodlights, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{goal?:boolean}={}){
 const g=polyP(c,[[-116,0,-45],[12,0,-45],[12,0,45],[-116,0,45]]);if(g.length<3)return;const gp=polyPath(g,true);
 // a lighter, yellower green than Earps' kit (yellow under a green screen), so the keeper reads on the grass
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(G,gp,.5);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(G,st,.2);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 // the penalty spot: a round white disc
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 if(o.goal!==false)goal3(s,c);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep */
function goal3(s:Sheet,c:Cam){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=()=>X+2;
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(),1.9,z0],[back(),0,z0]],[[X,0,z1],[X,H,z1],[back(),1.9,z1],[back(),0,z1]],
  [[X,H,z0],[X,H,z1],[back(),1.9,z1],[back(),1.9,z0]],[[back(),0,z0],[back(),0,z1],[back(),1.9,z1],[back(),1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(),1.9,z],.022,mesh,.7);seg3(c,[back(),1.9,z],[back(),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(),y,zs[i]],[back(),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Spain: red shirts, navy shorts and socks, yellow numbers */
const spain=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_M,hair:K,line:K,trim:Y,numberInk:Y,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
/** England's light-blue kit (a light navy screen on this sheet), white socks, navy numbers */
const eng=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.36],shorts:[K,.36],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const HERM_B=W_BUILD(1.7,.95);
const HERM_ST=spain({number:10,hair:[K,.95],build:HERM_B,seed:10});
const EARPS_B=W_BUILD(1.73,.96);
/** Mary Earps: all green, long sleeves, light gloves, blonde ponytail (the photo) */
const EARPS_ST:AthleteStyle={shirt:[G,.95],shorts:[G,.95],socks:[G,.95],boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:[K,.8],gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:[K,.85],build:EARPS_B,seed:1};
/** referee Tori Penso (kit colour inferred) */
const REF_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:K,hairStyle:'ponytail',build:W_BUILD(1.7),seed:30};

// ---------------------------------------------------------------- the kick on one clock τ (seconds; τ = 0 is the contact)
/** the ball on the spot, 11 m out */
const B0:V3=[-11,.11,0];
/** Hermoso: right foot, approach from her LEFT (≈ 20°), so the instep opens toward her right — Earps' left (+z) */
const DIRN=Math.hypot(1,.36),DIR:[number,number]=[1/DIRN,.36/DIRN];
const YAW_H=yawTo(0,0,DIR[0],DIR[1]);
const SD=.9,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.35,RUN_L=3.2,STRIKE_L=1.4,G_MARK=-(RUN_L+STRIKE_L),G_BALL=-.35;
const POWER=.8;
/** where Hermoso's pelvis stands at contact so the toe of her RIGHT boot meets the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:POWER}),HERM_B,{x:0,z:0,yaw:YAW_H}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];

// ---------------------------------------------------------------- Earps: big on her line, set, the low dive to her left, the gather, the roar
/** she starts to go just as the ball is struck; full stretch at u ≈ .55 of the dive; the gloves meet the ball at u = SAVE_U */
const T_DIVE=-.04,DIVE_S=.95,SAVE_U=.6,T_SAVE=T_DIVE+SAVE_U*DIVE_S;
const EARPS_X=-.12;
const EARPS_PLACE:Place={x:EARPS_X,z:0,yaw:Math.PI};
/** stay big: knees bent, on the balls of her feet, arms wide and low, palms open to the kicker */
const BIG=posed({lHipF:44,rHipF:44,lHipA:20,rHipA:20,lKnee:52,rKnee:52,lAnk:-4,rAnk:-4,lean:16,pitch:6,lShA:84,rShA:84,lShF:22,rShF:22,lElb:26,rElb:26,lShR:20,rShR:20,lHand:1,rHand:1,neckP:-12});
/** on the ground after the save: elbows fold, the ball pulled into her chest */
const DIVE_END=keeperDive(1,{side:'l',height:0});
/** up on her feet, fists clenched, chest out, head back: the roar */
const ROAR=posed({dz:DIVE_END.dz,lHipF:26,rHipF:26,lHipA:22,rHipA:22,lKnee:40,rKnee:40,lean:-6,pitch:-2,neckP:-28,lShA:46,rShA:46,lShF:-16,rShF:-16,lElb:104,rElb:104,lShR:10,rShR:10,lHand:0,rHand:0});
const T_UP=1.45,T_ROAR=2.05;
function earpsPose(tau:number,it:number):Pose{
 let p=blendPose(keeperSet(it*1.1),BIG,.9);
 if(tau>T_DIVE-.45)p=blendPose(p,keeperSet(.75),sm(T_DIVE-.45,T_DIVE,tau)*.6);
 if(tau>T_DIVE){const u=clamp((tau-T_DIVE)/DIVE_S);p=blendPose(p,keeperDive(u,{side:'l',height:0}),sm(T_DIVE,T_DIVE+.05,tau));
  // the gather: once the gloves meet it, the elbows fold and the arms pull the ball in
  const g=sm(T_SAVE+.05,T_SAVE+.5,tau);if(g>0){p.lElb=lerp(p.lElb,100*DEG,g);p.rElb=lerp(p.rElb,110*DEG,g);p.lShA=lerp(p.lShA,120*DEG,g);p.rShA=lerp(p.rShA,112*DEG,g);p.lShF=lerp(p.lShF,40*DEG,g);p.rShF=lerp(p.rShF,44*DEG,g);p.neckP=lerp(p.neckP,20*DEG,g);}}
 if(tau>T_UP){const u=sm(T_UP,T_ROAR,tau,easeInOutSine);p=blendPose(p,ROAR,u);
  // the roar pumps: fists down, elbows snap
  const pump=Math.max(0,Math.sin((tau-T_ROAR)*7))*sm(T_ROAR-.1,T_ROAR+.2,tau);p.lElb-=26*DEG*pump;p.rElb-=26*DEG*pump;p.neckP-=8*DEG*pump;p.lean-=4*DEG*pump;}
 return p;
}
/** the midpoint of her two gloves */
const gloves=(sk:Skeleton):V3=>mix3(sk.lHa,sk.rHa,.5);
const earpsSk=(tau:number,it=0)=>solve(earpsPose(tau,it),EARPS_B,EARPS_PLACE);
/** where the ball meets the gloves (a hair in front of the palms, toward the kicker), solved once */
const TGT:V3=(()=>{const g=gloves(earpsSk(T_SAVE));return[g[0]-.1,Math.max(.14,g[1]),g[2]];})();

// ---------------------------------------------------------------- the ball: the low shot to the gloves, held, dropped when she gets up
const T_DROP=T_UP+.25;
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<T_SAVE){const u=tau/T_SAVE,e=u*(1.12-.12*u);return[lerp(B0[0],TGT[0],e),lerp(B0[1],TGT[1],e)+.12*Math.sin(Math.PI*e),lerp(B0[2],TGT[2],e)];}
 const held=(t:number):V3=>{const g=gloves(earpsSk(t)),off=sm(T_SAVE,T_SAVE+.35,t);return[g[0]-.1*(1-off),Math.max(.11,g[1]-.02*off),g[2]];};
 if(tau<T_DROP)return held(tau);
 const H=held(T_DROP),u=clamp((tau-T_DROP)/.55),REST:V3=[H[0]-.9,.11,H[2]+.35];
 const y=u<.6?lerp(H[1],.11,(u/.6)**2):.11+.14*Math.sin(Math.PI*(u-.6)/.4);
 return[lerp(H[0],REST[0],easeOut(u)),Math.max(.11,y),lerp(H[2],REST[2],easeOut(u))];
}
const spinAt=(tau:number)=>tau<=0?0:tau<T_SAVE?-TAU*4*tau:-TAU*4*T_SAVE-TAU*.4*Math.min(tau-T_SAVE,.4);

// ---------------------------------------------------------------- Hermoso: sets the ball, walks back to her mark, the run, the low strike, hands on head
const P_PLACE=posed({lHipF:70,rHipF:40,lKnee:100,rKnee:60,lean:40,pitch:12,neckP:30,lShF:62,rShF:66,lElb:18,rElb:20,lShA:14,rShA:12,lHand:.8,rHand:.8});
const P_WAIT=posed({lHipF:-4,rHipF:10,lKnee:12,rKnee:18,lAnk:0,rAnk:-4,lean:6,pitch:1,neckP:-2,lShA:14,rShA:14,lShF:2,rShF:0,lElb:22,rElb:24});
const P_GO=posed({lHipF:-18,rHipF:22,lKnee:24,rKnee:30,lAnk:16,rAnk:-6,lean:14,pitch:4,neckP:10,lShA:22,rShA:20,lShF:-12,rShF:14,lElb:40,rElb:46,twist:-8});
const HANDS_HEAD=posed({lShA:150,rShA:150,lShF:36,rShF:36,lElb:138,rElb:138,lShR:30,rShR:30,neckP:14,lean:10,lHipF:6,rHipF:10,lKnee:12,rKnee:14,lHand:1,rHand:1});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.35);p.air=0;return p;};
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function runG(tau:number){const u=runU(tau);return G_MARK+RUN_L*(1.1*u-.1*u*u);}
function hermPose(tau:number,walk=1,it=0):Pose{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk;if(u<.12)return blendPose(P_PLACE,stand(),sm(0,.12,u));
   const d=Math.abs(G_MARK-G_BALL)*sm(.12,.82,u,linear);let p=walkPose(d*.72);if(u>.82)p=blendPose(p,P_WAIT,sm(.82,1,u));return p;}
  const br=.5+.5*Math.sin(it*2.1),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.35,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(2.4*u,{speed:.6}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.4+(tau-RUN_END)*1.6,{speed:.55});
 let p=blendPose(run,strike(Math.min(1,us),{power:POWER}),sm(RUN_END,RUN_END+.14,tau));
 // she stops, watches it saved, and her hands go to her head
 if(tau>.6)p=blendPose(p,P_WAIT,sm(.6,1,tau));
 if(tau>1)p=blendPose(p,HANDS_HEAD,sm(1,1.5,tau));
 return p;
}
function hermPlace(tau:number,walk=1):Place{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk,g=lerp(G_BALL,G_MARK,sm(.12,.82,u,linear)),[x,z]=gPos(g);
   return{x,z,yaw:u<.12?YAW_H:lerpAng(lerpAng(YAW_H,YAW_H+Math.PI,sm(.08,.2,u)),YAW_H+TAU,sm(.8,1,u))};}
  const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_H};}
 let g:number;
 if(tau<RUN_END)g=runG(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.9*(1-Math.pow(1-clamp(tau/.9),2));
 const[x,z]=gPos(g);return{x,z,yaw:YAW_H};
}

// ---------------------------------------------------------------- everyone else: waiting outside the box, then the reactions
type Role='ref'|'ar'|'esp'|'eng'|'rush';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number};
const ACTORS:Actor[]=[
 {name:'Penso',role:'ref',st:REF_ST,x:-13.4,z:-8.6,phase:.6},
 {name:'assistant',role:'ar',st:{...REF_ST,seed:31},x:.2,z:-20.6,phase:.1},
];
{// seven of each side along the edge of the box (outside the area and the arc); three England defenders will run to Earps
 const esp:[number,number,number][]=[[4,-19.2,-9.5],[6,-21.5,-5.2],[18,-20.4,4.6],[19,-18.6,10.4],[3,-24,.8],[8,-18.4,-13.8],[2,-22.6,12.8]];
 const engl:[number,number,number,Role][]=[[6,-18.1,-7.6,'rush'],[5,-19.6,-2.8,'rush'],[16,-19.7,2.9,'rush'],[4,-21.2,8.2,'eng'],[2,-18.2,12.2,'eng'],[8,-21.8,-10.8,'eng'],[7,-23.4,4.2,'eng']];
 esp.forEach(([n,x,z],i)=>ACTORS.push({name:'Spain '+n,role:'esp',st:spain({number:n,hair:i%3===0?[Y,.55]:K,build:W_BUILD(1.64+.03*(i%3),.9),seed:40+i,detail:'low'}),x,z,phase:i*.23}));
 engl.forEach(([n,x,z,r],i)=>ACTORS.push({name:'England '+n,role:r,st:eng({number:n,hair:i%2===0?[Y,.7]:K,build:W_BUILD(1.66+.04*(i%3),.92),seed:50+i,detail:'low'}),x,z,phase:i*.31}));}
const HIPS=posed({lShA:30,rShA:30,lShF:-24,rShF:-24,lElb:96,rElb:96,lShR:-40,rShR:-40,lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:6,neckP:2});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const POINT=posed({rShF:62,rShA:42,rElb:6,rHand:1,lShA:16,lElb:24,lHipF:10,rHipF:12,lKnee:14,rKnee:14,lean:6,neckY:14});
const T_RUSH=.55,RUSH_V=6.2;
/** a rusher's spot beside Earps (she ends up ≈ 2.2 m to her left of the centre, + z) */
const EARPS_END:[number,number]=(()=>{const sk=earpsSk(3);return[sk.pelvis[0],sk.pelvis[2]];})();
function rushPos(a:Actor,tau:number):[number,number,number]{// x, z, speed
 const tx=EARPS_END[0]-1.1-.5*a.phase,tz=EARPS_END[1]-1.4+2.6*a.phase,L=Math.hypot(tx-a.x,tz-a.z),d=Math.max(0,tau-T_RUSH)*RUSH_V;
 if(d>=L)return[tx,tz,0];const acc=Math.min(1,Math.max(0,tau-T_RUSH)/.5);return[a.x+(tx-a.x)*d/L,a.z+(tz-a.z)*d/L,acc];
}
function actorAt(a:Actor,tau:number,it:number,tpoint=-99):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0]+2,B0[2]),br=Math.sin(it*2.1+a.phase*TAU),saved=sm(T_SAVE+.1,T_SAVE+.6,tau);
 switch(a.role){
  case 'ref':{let p=blendPose(stand(),HIPS,.3+.1*br);if(tpoint>-99)p=blendPose(p,POINT,Math.sin(Math.PI*clamp(tpoint/1.6)));return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-11,0)}};}
  case 'ar':return{pose:blendPose(stand(),HIPS,.2),place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-5,0)}};
  case 'esp':{let p=blendPose(stand(),HIPS,.35+.1*br);if(saved>0)p=blendPose(p,a.phase*10%2<1?HANDS_HEAD:SLUMP,saved*.85);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
  case 'eng':{let p=blendPose(stand(),HIPS,.2+.1*br);if(saved>0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),saved);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
  default:{const[x,z,sp]=rushPos(a,tau);let p=blendPose(stand(),HIPS,.2+.1*br);
   if(tau>T_RUSH){const d=Math.max(0,tau-T_RUSH)*RUSH_V;p=blendPose(p,runCycle(d/3.9+a.phase,{speed:.85}),sm(T_RUSH,T_RUSH+.25,tau)*(sp>0?1:0));if(sp===0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),.8);}
   const yaw=tau>T_RUSH?yawTo(a.x,a.z,EARPS_END[0],EARPS_END[1]):toBall;return{pose:p,place:{x,z,yaw}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the run, the strike, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<T_SAVE){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:G,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=20):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;walk?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';crowd?:boolean;point?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const walk=e.walk??1;
 {const pl=hermPlace(tp,walk),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=hermPose(tp,walk,e.it),prev={pose:hermPose(tpPrev,walk,e.it-1/12),place:hermPlace(tpPrev,walk)};
  drawPlayer(s,pose,c,detailFor(HERM_ST,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2&&tp<.35);}});}
 {const d=visible({x:EARPS_X+.4,z:tp>T_SAVE?1.6:0});if(d>0)items.push({d,draw:()=>{const pose=earpsPose(tp,e.it),prev={pose:earpsPose(tpPrev,e.it-1/12),place:EARPS_PLACE};drawPlayer(s,pose,c,detailFor(EARPS_ST,d,true),EARPS_PLACE,prev,!!e.smear&&tp>T_DIVE&&tp<T_SAVE+.2);}});}
 for(const a of ACTORS){if(!e.crowd&&a.role!=='ref'&&a.role!=='ar'&&a.role!=='rush')continue;const cur=actorAt(a,tp,e.it,e.point),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12,e.point);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-(tau>T_SAVE&&tau<T_DROP?.35:0),draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const hxz=(tau:number,walk=1):V3=>{const p=hermPlace(tau,walk);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** contact: a beat after "Hermoso shoots", and never before she has had time to settle at her mark after "Mary Earps" */
const tS1=()=>Math.max(CUE(0,'Hermoso shoots')+.25,CUE(0,'Mary Earps')+.8-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0-5,t-tS1());
/** she sets the ball and walks back to her mark: from "Jenni Hermoso" until before the run */
const walk1=(t:number)=>{const a=CUE(0,'Jenni Hermoso')-.2,b=Math.max(a+.8,Math.min(a+3,tS1()+T_RUN0-1));return sm(a,b,t,linear);};
const P1:V3=[-34,20,58];
function cam1(t:number):Cam{
 const tRun=tS1()+T_RUN0,w=walk1(t),ep:V3=[EARPS_X,1,0];
 return plan(t,[
  [0,0,()=>({P:P1,T:[-28,2,-4],fov:44})],
  [CUE(0,'Spain lead')-.2,1.2,()=>({P:P1,T:[-14,1,0],fov:15})],
  [CUE(0,'win a penalty')-.1,.9,()=>({P:P1,T:[-12.5,1,-3.6],fov:8})],
  [CUE(0,'Jenni Hermoso')-.2,.9,()=>({P:P1,T:add3(hxz(T_RUN0-.5,w),[0,1,0]),fov:5.6})],
  [CUE(0,'Mary Earps')-.25,.8,()=>({P:P1,T:ep,fov:4.4})],
  [Math.max(tRun-.35,CUE(0,'Mary Earps')+.5),.7,()=>({P:P1,T:[-5.4,1,.5],fov:13.5})],
  [tS1()+T_SAVE+.25,.8,()=>({P:P1,T:[-1,1,1.6],fov:8})],
  [tS1()+T_UP+.3,1.4,()=>({P:P1,T:[-3,1,1.8],fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_SAVE,tSv=CUE(0,'Saved');
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tSv-.1,tSv+.3,t)*(1-sm(tSv+2.2,tSv+3.2,t))});
  ground(s,c);
  play(s,c,tau,tp,tpp,{it:tt,walk:walk1(tt),minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',crowd:true,point:tt-CUE(0,'win a penalty')+.2});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low behind the spot: big and patient, then the spring
const tau2=(t:number)=>key(t,mono([[0,T_RUN0+.15],[CUE(1,'stays big'),-.5],[CUE(1,'springs low'),T_DIVE+.03],[CUE(1,'strong hands'),T_SAVE-.03],[CUE(1,'stop the ball'),T_SAVE+.12],[SECS(1),T_SAVE+.9]]),linear);
const E2:V3=[-17,1.35,-4.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,T_SAVE));
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(add3(hxz(tau),[4,1,0]),[-1.5,1,.3],sm(T_RUN0,-.4,tau)),fov:22})],
  [CUE(1,'stays big')-.25,1,()=>({P:add3(E2,[4,-.2,1.2]),T:[-.6,.95,.2],fov:15})],
  [CUE(1,'springs low')-.1,.9,()=>({P:add3(E2,[5,-.35,1.5]),T:mix3(b,[-.3,.6,1.8],.6),fov:15})],
  [CUE(1,'strong hands')-.15,1,()=>({P:add3(E2,[5.6,-.4,1.8]),T:add3(TGT,[-.2,.15,-.4]),fov:8.5})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(T_SAVE,T_SAVE+.4,tau)});
  ground(s,c);
  // the replay trail: the low shot so far, fading once it is held (under the players)
  if(tau>.02&&tau<T_SAVE+.9){const pts=pathPts(c,Math.max(0,tau-.5),Math.min(tau,T_SAVE),16),fade=1-sm(T_SAVE+.2,T_SAVE+.9,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_SAVE)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // the gloves meet it: a small yellow burst on the ball
  const hit=sm(T_SAVE-.02,T_SAVE+.08,tau)*(1-sm(T_SAVE+.3,T_SAVE+.7,tau));if(hit>0){const q=pr(c,TGT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,TGT)*.5)*easeOutBack(hit),{n:9,seed:23,width:Math.max(5,kAt(c,TGT)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 3 · the reverse angle from behind the goal by the post: both gloves on it, then the roar
const tau3=(t:number)=>key(t,mono([[0,T_SAVE-.3],[CUE(2,'both gloves'),T_SAVE+.06],[CUE(2,'right by'),T_SAVE+.35],[CUE(2,'England are'),T_UP+.1],[SECS(2),T_UP+.1+(SECS(2)-CUE(2,'England are'))]]),linear);
const E3:V3=[4.3,.95,5.2];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[-1.2,.45,2.2],fov:30})],
  [CUE(2,'both gloves')-.2,.9,()=>({P:add3(E3,[-.4,-.15,-.5]),T:add3(TGT,[0,.05,0]),fov:22})],
  [CUE(2,'England are')-.2,1.3,()=>({P:add3(E3,[.6,1.1,.6]),T:[-2.2,1.05,2.4],fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tE=CUE(2,'England are');
  stadium(s,c,t,[0,2,3],{roar:.3+.7*sm(T_SAVE,T_SAVE+.4,tau),flash:.8*sm(tE-.1,tE+.3,t)});
  ground(s,c,{goal:false});
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10,crowd:true});
  // from behind, the net is between the camera and the play
  goal3(s,c);
  // the post she saved it beside: a yellow ring on the ground at its foot, as the cue lands
  const rp=sm(CUE(2,'right by')-.1,CUE(2,'right by')+.4,t)*(1-sm(tE-.2,tE+.3,t));
  if(rp>.02){const pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,[Math.cos(a)*.55,.02,3.66+Math.sin(a)*.55]);if(p)pts.push(p);}if(pts.length>20){const rr=ribbon(pts,Math.max(6,kAt(c,[0,0,3.66])*.06),{close:true,seed:31,taper:0,wobble:1});s.knockout(rr,.85*rp);s.fill(Y,rr,.95*rp);}}
 },
 aperture(t){const c=cam3v(t),P=ballAt(tau3(t)),q=pr(c,P)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:1.2,
};

// ---------------------------------------------------------------- 4 · the lesson: stay big → read the kicker's body (hips, planting foot) → dive with strong hands
const T_PLANT=(.22-STRIKE_CONTACT)*SD;
const tau4=(t:number)=>key(t,mono([[0,-2.2],[CUE(3,'Read'),-1.6],[CUE(3,'hips'),-.55],[CUE(3,'planting'),T_PLANT],[CUE(3,'dive with'),-.02],[CUE(3,'strong hands'),T_SAVE-.02],[SECS(3),T_SAVE+.45]]),linear);
function cam4v(t:number):Cam{
 const pl:V3=(()=>{const p=hermPlace(T_PLANT);return[p.x??0,0,p.z??0];})();
 return plan(t,[
  [0,0,()=>({P:[-4.6,1.5,-3.6],T:[-.2,.95,0],fov:34})],
  [CUE(3,'Read')-.2,1.1,()=>({P:[2.3,1.95,-1.05],T:[-12,.85,-.5],fov:20})],
  [CUE(3,'planting')-.2,.9,()=>({P:add3(pl,[3.2,1.3,3.6]),T:add3(pl,[.3,.45,0]),fov:28})],
  [CUE(3,'dive with')-.2,1,()=>({P:[-5.8,1.4,5.6],T:[-.4,.55,1.7],fov:36})],
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
/** a ring round a 3D point in a plane: horizontal (on the ground) or upright facing the camera */
function ring3(s:Sheet,c:Cam,at:V3,r:number,w:number,ink:string,cov:number,flat=true,seed=43){
 const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,P:V3=flat?[at[0]+Math.cos(a)*r,at[1],at[2]+Math.sin(a)*r]:add3(at,[c.r[0]*Math.cos(a)*r+c.u[0]*Math.sin(a)*r,c.r[1]*Math.cos(a)*r+c.u[1]*Math.sin(a)*r,c.r[2]*Math.cos(a)*r+c.u[2]*Math.sin(a)*r]),p=pr(c,P);if(p)pts.push(p);}
 if(pts.length<28)return;const rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:.8});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tB=CUE(3,'stay big'),tR=CUE(3,'Read'),tH=CUE(3,'hips'),tP=CUE(3,'planting'),tD=CUE(3,'dive with'),tS=CUE(3,'strong hands');
  stadium(s,c,t,[0,1,2,3],{});
  ground(s,c);
  // 1 · stay big: a yellow shape spanning her gloves, head and boots, behind her
  const big=sm(tB-.15,tB+.4,t,easeOutBack)*(1-sm(tR+.3,tR+.9,t));
  if(big>.02){const sk=earpsSk(tp,tt),cen=mix3(sk.pelvis,sk.chest,.5),grow=(P:V3)=>mix3(cen,add3(P,[0,0,0]),.2+.95*clamp(big)),q=[sk.lHa,add3(sk.head,[0,.18,0]),sk.rHa,sk.rToe,sk.lToe].map(P=>pr(c,grow(P))).filter((p):p is Pt=>!!p);
   if(q.length>4){const hullP=ribbon(q,Math.max(8,kAt(c,cen)*.05),{close:true,seed:5,taper:0,wobble:1.2});const fillP=polyPath(q,true);s.tone(Y,fillP,.3*clamp(big));s.knockout(hullP,.9*clamp(big));s.fill(Y,hullP,.95*clamp(big));}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // 2 · read the kicker's body: a dashed yellow sight line from Earps' eyes to Hermoso's hips
  const sl=sm(tR-.15,tR+.5,t,easeOutBack)*(1-sm(tD-.1,tD+.3,t));
  const hs=solve(hermPose(tp,1,tt),HERM_B,hermPlace(tp));
  if(sl>.02){const ek=earpsSk(tp,tt),a=pr(c,ek.face),b=pr(c,hs.pelvis);
   if(a&&b){const rb=new Path2D(),n=9,w=Math.max(8,kAt(c,ek.face)*.04),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);}}
  // 3 · the hips: a ring round them and an arrow where they point (open toward her right — Earps' left)
  const hp=sm(tH-.15,tH+.4,t,easeOutBack)*(1-sm(tD+.2,tD+.7,t));
  if(hp>.02){ring3(s,c,hs.pelvis,.3,Math.max(6,kAt(c,hs.pelvis)*.035),Y,clamp(hp),false,47);
   const a:V3=[hs.pelvis[0],hs.pelvis[1],hs.pelvis[2]],b=add3(a,[DIR[0]*1.3*clamp(hp),0,DIR[1]*1.3*clamp(hp)]);arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(6,kAt(c,a)*.04),Y,.95);}
  // 4 · the planting foot: a ring on the grass round it and a ground arrow along the way it points
  const pf=sm(tP-.15,tP+.4,t,easeOutBack)*(1-sm(tD+.2,tD+.7,t));
  if(pf>.02){const ps=solve(hermPose(T_PLANT),HERM_B,hermPlace(T_PLANT)),foot:V3=[(ps.lAn[0]+ps.lToe[0])/2,.02,(ps.lAn[2]+ps.lToe[2])/2];ring3(s,c,foot,.28,Math.max(6,kAt(c,foot)*.035),Y,clamp(pf),true,53);
   const f=Math.hypot(ps.lToe[0]-ps.lHeel[0],ps.lToe[2]-ps.lHeel[2])||1,dx=(ps.lToe[0]-ps.lHeel[0])/f,dz=(ps.lToe[2]-ps.lHeel[2])/f,a:V3=[foot[0]+dx*.3,.03,foot[2]+dz*.3],b:V3=[a[0]+dx*1.6*clamp(pf),.03,a[2]+dz*1.6*clamp(pf)];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(6,kAt(c,a)*.04),Y,.95);}
  // 5 · dive: a red arrow along her low dive to her left
  const dv=sm(tD-.1,tD+.35,t,easeOutBack)*(1-sm(tS+.6,tS+1.2,t));
  if(dv>.02){const a:V3=[EARPS_X-.3,.7,.1],b:V3=[EARPS_X-.4,.35,.1+2.5*clamp(dv)];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.06),R,.95);}
  // 6 · strong hands: a yellow burst round the gloves as they stop the ball
  const sh=sm(tS-.05,tS+.4,t);if(sh>0&&tau>T_SAVE-.05){const q=pr(c,TGT);if(q){sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,TGT)*.8)*easeOutBack(sh),{n:10,seed:61,width:Math.max(6,kAt(c,TGT)*.05)});ring3(s,c,TGT,.28,Math.max(6,kAt(c,TGT)*.035),Y,clamp(sh),false,59);}}
 },
 still:9,
};

const film:RisoStory={
 id:'earps-save-2023',format:'11v11',title:"Earps' penalty save v Spain",
 theme:'Goalkeeping: stay big, read the kicker\'s body (hips and planting foot), then dive with strong hands',
 ageNote:'Spain 1–0 England, 2023 FIFA Women\'s World Cup final, Stadium Australia, Sydney, 20 August 2023. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a keeper's glove-burst — two green palms clap shut on a small ball with a yellow spark. Reduced motion: the still pose. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.35)),fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed);
  if(age>0&&age<.4)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.4),width:9,cov:fade});
  for(const sd of[-1,1]){const cx=x+sd*(46-20*u),p=new Path2D();p.ellipse(cx,y,20,28,sd*.3,0,TAU);s.knockout(p,.9*fade);s.fill(G,p,.95*fade);s.stroke(K,p,3,.85*fade);}
  footballPanels(s,x,y,22,{rot:r()*TAU,key:K,shadow:G,seed:5});
 },
};
export default film;
