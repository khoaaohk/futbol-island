/** Pito — "the pivot spin and finish": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Pito's entry (lib/town/iconicPlays.json) is a signature, the pivot spin and finish (central, in the box), not one
 * match. The best-documented Pito goal we could reach in writing is his goal in the 2022 UEFA Futsal Champions League FINAL for Barcelona
 * against Sporting CP: the pivot, Barça's most advanced player, wins the ball in the middle, drives at the box and scores. No written source
 * we could reach describes ONE dated Pito spin-and-finish (UEFA and FIFA reports list or praise his goals but do not describe a spin), so
 * the film follows the brief's honest fallback: it opens on the REAL documented goal, then says "Here's how he does it" and shows the spin
 * as a demonstration that is never passed off as that match.
 *  1  LIVE (broadcast camera high in the main stand, real time, goal on the RIGHT): 1 May 2022, Arena Riga, Barcelona 1–0 up (Sergio
 *     Lozano 15:19). Sporting play it square through the middle; Pito steps in, wins the ball, drives forward and scores at 18:35: 2–0.
 *  2  REPLAY (slow motion, REVERSE angle, low BEHIND Sporting's goal, looking back up the court through the net): the steal, the carry
 *     with his head up, the finish past Guitta — just before half-time.
 *  3  HOW HE DOES IT (demonstration; Pito in a red training top, neutral paper/navy defender and green keeper; no match claimed): back to goal, he feels the defender
 *     behind him, the defender leans one way, he spins the other way (over his right shoulder) and shoots. Low side camera by the box.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Feel where the defender is, then turn the other way"): three cards (feel, turn,
 *     finish), a feel-and-turn with the defender, a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - UEFA.com, "Barça 4-0 Sporting CP: Blaugrana beat holders to win UEFA Futsal Champions League" (1 May 2022):
 *    https://www.uefa.com/uefafutsalchampionsleague/news/0275-150aab0f868b-d135ca696494-1000--barca-4-0-sporting-cp-blaugrana-beat-holders-to-win-uefa-fut/
 *    — "Barça took the lead soon after when captain Sergio Lozano beat Guitta with a chipped, angled shot. And it was 2-0 at half-time,
 *    Pito winning the ball in the middle before advancing and striking in."; "two goals just before half-time"; Guitta = Sporting's keeper.
 *  - UEFA.com match page, Barça v Sporting CP (2034717): https://www.uefa.com/uefafutsalchampionsleague/match/2034717--barca-vs-sporting-cp/
 *  - Wikipedia, "2021–22 UEFA Futsal Champions League" (raw): final 1 May 2022, 18:00, Arena Riga, attendance 8,442, Barcelona 4–0
 *    Sporting CP; goals Lozano 15:19, Pito 18:35, Ferrão 20:27, Dídac Plana 38:19.
 *  - Wikipedia, "Pito (futsal player)" (raw): Jean Pierre Guisel Costa, b. 1991, 1.85 m, pivot (and winger), FC Barcelona since 2021;
 *    world champion 2024. — https://en.wikipedia.org/wiki/Pito_(futsal_player)
 *  - Wikipedia, "2024 FIFA Futsal World Cup" (raw) — checked: Pito scored 5 group-stage goals, none in the knockout rounds or the final,
 *    so the World Cup was not used. FIFA.com Lithuania 2021 Matchday 11 review praises a Pito "wonder goal" v Japan but never describes it.
 * CONFIRMED: competition, date, venue, both teams, 1–0 before his goal, his goal at 18:35 making it 2–0 before half-time, "winning the
 *  ball in the middle before advancing and striking in", Guitta in Sporting's goal, Pito a 1.85 m pivot.
 * INFERRED (not named in the narration): kits — Barça navy-and-red stripes / navy shorts, Sporting white shirts with green hoops / navy
 *  shorts, Guitta in a dark kit, Plana in red; the court colour (warm sports floor); HOW he won the ball (an interception of a square pass
 *  here), the carry's line, his shooting foot (right), the low far-post finish, the keeper's dive, which goal and every other position;
 *  shirt numbers (left off). No video was reviewed. Chapters 3–4 are a demonstration of the pivot spin, not footage of a particular match.
 *  (A Ferrão film is built in parallel: this film uses a different moment — Pito's own 2022 final goal — and different set-ups: the goal
 *  on the right, a higher stand camera, a behind-the-net reverse replay and a low side demo.)
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the steal, the spin and the strikes). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z. The replay reuses the live choreography through a rotation `REV` (a proper rotation, so feet and hands keep their side).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (floor, lights), red (Barça stripes, rings), green (Sporting hoops), navy (key line, Barça shirts, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 *  Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2022 final',text:'The 2022 Futsal Champions League final. Barcelona lead Sporting. Pito wins the ball in the middle, drives forward and scores. Two nil!',tail:2.4,
  cues:['The 2022','Barcelona lead','Pito wins','in the middle','drives forward','and scores','Two nil'],heads:{'The 2022':'Final 2022','Barcelona lead':'1–0','Two nil':'2–0'}},
 {label:'Replay: behind the goal',text:'Watch again, in slow motion. He steals it, and carries it forward with his head up. He finishes past the keeper, just before half time.',tail:1.8,
  cues:['Watch again','He steals','carries it','head up','He finishes','half time'],heads:{'He finishes':'2–0','half time':'18:35'}},
 {label:'How he does it',text:'His famous move is the pivot spin. Here’s how he does it: back to goal, he feels the defender lean one way, then spins the other way and shoots!',tail:2.2,
  cues:['His famous','pivot spin','back to goal','feels the defender','lean one way','spins the other','and shoots'],heads:{'pivot spin':'Pivot spin','and shoots':''}},
 {label:'Your turn',text:'Your turn. Feel where the defender is, then turn the other way!',tail:2.6,
  cues:['Your turn','Feel where','defender is','turn the other'],heads:{'Feel where':'Feel, then turn','turn the other':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/pito-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/pito-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/pito-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('pito: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('pito: no cue '+w);return c.at;};
const maps:number[][][]=[];
/** chapter time (recording) → authored scene time: piecewise linear through [0,0], each cue, the passage start and the end */
function authored(i:number,t:number){
 let m=maps[i];
 if(!m){const ch=CHAPTERS[i],Au=AUTH[i],raw:number[][]=[[0,0]];ch.cues.forEach((c,k)=>{if(Au.cues[k])raw.push([c.at,Au.cues[k].at]);});raw.push([ch.seconds-.65,Au.seconds-.65],[ch.seconds,Au.seconds]);
  m=[raw[0]];for(const p of raw.slice(1)){const q=m[m.length-1];if(p[0]>q[0]+.02&&p[1]>q[1]+.02&&p[0]<=ch.seconds&&(p[0]>=ch.seconds-.65||p[0]<ch.seconds-.65-.02))m.push(p);}maps[i]=m;}
 if(t<=0)return 0;for(let k=1;k<m.length;k++)if(t<=m[k][0])return m[k-1][1]+(m[k][1]-m[k-1][1])*(t-m[k-1][0])/(m[k][0]-m[k-1][0]);return m[m.length-1][1];
}
const clock=(i:number,t:number)=>({tt:authored(i,twos(t)),tc:authored(i,t)});
/** key() needs increasing times */
function mono(Kk:Key[],gap=.04):Key[]{const o:Key[]=[];for(const k of Kk){const t=o.length?Math.max(k[0] as number,(o[o.length-1][0] as number)+gap):k[0] as number;o.push([t,...k.slice(1)] as Key);}return o;}

// ---------------- camera: centre a 1566×1080 composition box on the canvas (card window or full screen) ----------------
const BOX_W=1566,BOX_H=1080;
function cam(s:Sheet,x:number,y:number,zoom:number,rot=0){
 const base=Math.min(s.W/BOX_W,s.H/BOX_H),S=zoom*base*s.arrival,c=Math.cos(rot),sn=Math.sin(rot),dx=(s.W/2-s.cx)/S,dy=(s.H/2-s.cy)/S;
 s.camera(x-(c*dx+sn*dy),y-(-sn*dx+c*dy),zoom*base/Math.max(.01,s.fit),rot);
}
function camPath(s:Sheet,t:number,K0:Key[],shake:Pt=[0,0]){const v=key(t,padKeys(mono(K0),[0,0,1,0]),easeInOutSine,true);cam(s,(v[0]||0)+shake[0],(v[1]||0)+shake[1],Number.isFinite(v[2])?v[2]:1,Number.isFinite(v[3])?v[3]:0);}

// ---------------- stage: a perspective camera over the court floor (metres → world units); X right, Y up, Z away ----------------
type Stage={F:number;eye:number;cx:number;cz:number};
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const k=st.F/Math.max(.25,Z-st.cz);return[(X-st.cx)*k,(st.eye-Yh)*k];};
const kAt=(st:Stage,Z:number)=>st.F/Math.max(.25,Z-st.cz);
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** court → camera-stage floor transforms. IDX: the live / demo stages see the court as it is (goal at X = +20, the main stand at Z < 0).
 *  REV: the replay camera sits BEHIND that goal looking back up the court: stage X = court Z − 10, stage Z = 20 − court X (a rotation). */
type Xf=(X:number,Z:number)=>[number,number];
const IDX:Xf=(X,Z)=>[X,Z];
const REV:Xf=(X,Z)=>[Z-10,20-X];
const REV_INV:Xf=(x,z)=>[20-z,x+10];
const P3=(st:Stage,xf:Xf,X:number,Yh:number,Z:number):Pt=>{const[a,b]=xf(X,Z);return proj(st,a,Yh,b);};
const depthOf=(xf:Xf,X:number,Z:number)=>xf(X,Z)[1];

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the floor */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number}={}){const{dash=width*4.5,cov=1,progress=1}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. xf maps the court onto the stage. */
function projector(st:Stage,xf:Xf=IDX,inv:Xf=IDX):Projector{const e=inv(st.cx,st.cz);
 return{eye:[e[0],st.eye,-e[1]] as V3,project(p:V3){const[a,b]=xf(p[0],-p[2]),q=proj(st,a,p[1],b);return[q[0],q[1],b-st.cz];},scale(p:V3){return kAt(st,xf(p[0],-p[2])[1]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) on the court (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0;
const SKIN:InkFill[]=[[Y,.86],[R,.3]];
const BUILD={height:1.85,bulk:1.02};
/** Pito: Barça (kit inferred: navy with red stripes, navy shorts, red socks), short dark hair, 1.85 m; no shirt number is claimed */
const PITO:AthleteStyle={shirt:K,pattern:'stripes',patternInk:[R,.95],shorts:[K,.9],socks:[R,.95],boots:'paper',skin:SKIN,hair:K,line:K,trim:[R,.85],hairStyle:'short',build:BUILD,seed:9};
/** Pito in the demonstration and lesson: a plain red training top (no club kit, so no match is implied) */
const PITO_T:AthleteStyle={...PITO,shirt:[R,.92],pattern:'plain',patternInk:undefined,shorts:K,socks:K,trim:K};
const BAR=(n:number):AthleteStyle=>({shirt:K,pattern:'stripes',patternInk:[R,.95],shorts:[K,.9],socks:[R,.95],boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:[R,.85],hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Sporting (kit inferred): white shirts with green hoops, navy shorts, green socks */
const SCP=(n:number):AthleteStyle=>({shirt:'paper',pattern:'hoops',patternInk:[G,.95],shorts:[K,.9],socks:G,boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:G,hairStyle:n%3?'short':'bald',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Guitta, Sporting's keeper (dark kit inferred); Dídac Plana, Barça's keeper (red kit inferred) */
const GUITTA:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:G,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.84},seed:61};
const PLANA:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:62};
/** the demonstration defender and keeper: neutral training kit (no team is claimed in chapters 3–4) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.83,bulk:1.06},seed:77};
const DEMO_K:AthleteStyle={shirt:[G,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
type AOpt={detail?:'auto'|'low'|'mid'|'high';smear?:number;xf?:Xf;inv?:Xf};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:AOpt={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st,o.xf,o.inv),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the RIGHT-foot strike's contact (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,crescent(x,y,r*1.02,[-.42,-.45]),.2);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
type BallS={X:number;Y:number;Z:number;flying:boolean;spin:number};
/** a court ball on a stage (through xf): ground shadow, optional yellow trail, the ball */
function drawBall(s:Sheet,st:Stage,xf:Xf,b:BallS,seed:number,o:{min?:number;trail?:Pt[];smear?:number;dir?:number}={}){
 const[a,z]=xf(b.X,b.Z),p=proj(st,a,b.Y,z),g=proj(st,a,0,z),r=Math.max(o.min??9,kAt(st,z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);
 if(o.trail&&o.trail.length>1){const trp=ribbon(o.trail,r*1.5,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, green / red / navy shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),grn=new Path2D(),reds=new Path2D(),pap=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.2)grn.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)pap.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(G,grn);s.fill(R,reds);s.knockout(pap,.8);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the warm sports floor (inferred colour): yellow + a red tint, a faint sheen band, run-off a step darker */
function floorBase(s:Sheet,st:Stage,wall:number,court:Pt[]){const span=9000;s.fill(Y,rectPath(-span,wall,span*2,span),.5);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const c=polyPath(court,true);s.knockout(c,.3);s.fill(Y,c,.55);s.fill(R,c,.08);}

// ---- LIVE / DEMO court seen from the main stand side; Sporting's goal at X = +20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GX=20,POST_N=8.5,POST_F=11.5,GH=2;
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 floorBase(s,st,wall,floorQuad(st,-20,0,20,TOUCH_FAR));
 // painted lines: touchlines, goal lines, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GX-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GX-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GX,0],[GX,TOUCH_FAR]],[[-GX,0],[-GX,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GX-6,GX-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 // boards and the crowd on the far side
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
/** Sporting's goal (right end), net going +X; bulge pushes the back of the net outward round (bz, by) */
function sideGoal(s:Sheet,st:Stage,bulge:number,bz:number,by:number){
 const Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GX+lerp(Db,Dt,Yh/GH)+d,Yh,Z);};
 const hull=[proj(st,GX,0,POST_N),proj(st,GX,GH,POST_N),proj(st,GX,GH,POST_F),back(POST_F,GH),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=GH+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.4){const a=proj(st,GX,Yh,POST_N),b=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage){
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GX+dx,Yh,Z);quad([P(0,-w),P(0,w),P(GH,w),P(GH,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*GH,y1=(k+1)/8*GH;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GX,GH+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- REPLAY court from BEHIND Sporting's goal (stage coords: goal line Z = 0, the court runs away to Z = 40, far wall behind it) ----
const WALL_R=41.6;
function endCourt(s:Sheet,st:Stage,t:number,cheer:number,flash:number){
 const wall=proj(st,0,0,WALL_R)[1],kw=kAt(st,WALL_R),span=9000;
 floorBase(s,st,wall,floorQuad(st,-10,0,10,40));
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}
 for(const seg of[[[-10,0],[10,0]],[[-10,-2],[-10,40]],[[10,-2],[10,40]],[[-10,20],[10,20]],[[-10,40],[10,40]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const Z of[6,10])lines.addPath(polyPath(floorRing(st,0,Z,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,20+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALL_R)[0],x1=proj(st,i*2.4+1.9,0,WALL_R)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,0);
 // Barça's goal at the far end, small
 const fg=new Path2D();for(const q of[[proj(st,-1.5,0,40),proj(st,-1.5,GH,40),proj(st,1.5,GH,40),proj(st,1.5,0,40)]])fg.addPath(ribbon(q,Math.max(2.5,kAt(st,40)*.08),{seed:5,taper:0,wobble:.3}));s.knockout(fg);s.fill(R,fg,.8);
}
/** the near goal frame (Z = 0) seen from behind: red-banded posts and bar */
function nearPosts(s:Sheet,st:Stage){
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,0);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,0)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([-1.5,0],[-1.5,GH],8);bar([1.5,0],[1.5,GH],8);bar([-1.5,GH],[1.5,GH],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the net between the camera and the goal: back plane (Z −.95 at the floor → −.55 at the bar height), roof and sides, as a foreground mesh */
function nearNet(s:Sheet,st:Stage,bulge:number,bx:number,by:number){
 const Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,-lerp(Db,Dt,Yh/GH)-d);};
 const mesh=new Path2D();
 for(let X=-1.5;X<=1.5+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=GH+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}const c=proj(st,X,GH,0);mesh.lineTo(c[0],c[1]);}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.3){const a=back(-1.5,Yh);mesh.moveTo(a[0],a[1]);for(let X=-1.2;X<=1.5+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[-1.5,1.5])for(let Yh=0;Yh<=GH+1e-6;Yh+=.4){const a=proj(st,X,Yh,0),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 for(let u=.2;u<1;u+=.2){const a=proj(st,-1.5,GH,-Dt*u),b=proj(st,1.5,GH,-Dt*u);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(2,kAt(st,-.7)*.014),.5);
}

// ================= chapter 1 — LIVE: Riga 2022, 1–0 up; the steal in the middle, the drive, the finish: 2–0 =================
const C1={y22:A(0,'The 2022'),lead:A(0,'Barcelona'),wins:A(0,'Pito wins'),mid:A(0,'in the middle'),drives:A(0,'drives'),scores:A(0,'and scores'),two:A(0,'Two nil'),end:AUTH[0].seconds};
/** the build-up (inferred): Sporting's fixo → the near wing → a square pass across the middle, cut out by Pito */
const S0P:[number,number]=[11,9.6],S2P:[number,number]=[6.4,3.4],S1P:[number,number]=[1.6,11.8];
const PA=[.7,1.55],PB0=C1.wins+.55,T_ST=C1.mid+.1;
const STEAL:[number,number]=[lerp(S2P[0]-.4,S1P[0],.47),lerp(S2P[1]+.3,S1P[1],.47)];
/** the carry and the shot: contact just before "and scores", ≈19 m/s low to the far post */
const T_HIT=C1.scores-.12,T_IN=T_HIT+.5;
const SHOT:[number,number]=[11.3,9.15],TGT:V3=[GX+.05,.34,POST_F-.42];
const YAW_SHOT=yawTo(TGT[0]-SHOT[0],TGT[2]-SHOT[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
const CARRY_DIR=(()=>{const dx=SHOT[0]-STEAL[0],dz=SHOT[1]-STEAL[1],l=Math.hypot(dx,dz);return[dx/l,dz/l] as [number,number];})();
const T_C0=T_ST+.18,T_C1=T_HIT-.34;
function liveBall(T:number):BallS{
 const roll=(a:[number,number],b:[number,number],t0:number,t1:number,e=easeOut):BallS=>{const u=sm(t0,t1,T,e);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:u*8};};
 const s0:[number,number]=[S0P[0]-.45,S0P[1]-.1],s2a:[number,number]=[S2P[0]+.1,S2P[1]+.35],s2b:[number,number]=[S2P[0]-.35,S2P[1]+.35];
 if(T<PA[0])return{X:s0[0],Y:BALL_R,Z:s0[1],flying:false,spin:0};
 if(T<PA[1]+.02)return roll(s0,s2a,PA[0],PA[1]);
 if(T<PB0)return{...roll(s2a,s2b,PA[1]+.2,PB0-.1,easeIO),spin:T*3};
 if(T<T_ST)return roll(s2b,STEAL,PB0,T_ST,linear);
 // the steal: his foot stops it; then the carry — the ball runs ahead of him, touched on every other stride
 if(T<T_C1){const u=sm(T_C0,T_C1,T,easeIn),d=Math.hypot(SHOT[0]-STEAL[0],SHOT[1]-STEAL[1])*u,touch=.18*Math.abs(Math.sin((T-T_C0)*7));
  return{X:STEAL[0]+CARRY_DIR[0]*(d+touch*u),Y:BALL_R,Z:STEAL[1]+CARRY_DIR[1]*(d+touch*u),flying:false,spin:(T-T_ST)*14};}
 if(T<T_HIT)return{X:SHOT[0],Y:BALL_R,Z:SHOT[1],flying:false,spin:(T-T_ST)*14};
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear),M:V3=[lerp(SHOT[0],TGT[0],.5),.45,lerp(SHOT[1],TGT[2],.5)],a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;
  return{X:a*SHOT[0]+b*M[0]+c*TGT[0],Y:a*BALL_R+b*M[1]+c*TGT[1],Z:a*SHOT[1]+b*M[2]+c*TGT[2],flying:true,spin:20+u*30};}
 const d=sm(T_IN,T_IN+.3,T,easeOut),bo=Math.abs(Math.sin(sm(T_IN+.3,T_IN+1.2,T)*Math.PI*2))*.1*(1-sm(T_IN+.3,T_IN+1.2,T));
 return{X:lerp(TGT[0],GX+.62,d),Y:lerp(TGT[1],BALL_R,sm(T_IN+.1,T_IN+.4,T))+bo,Z:TGT[2]+.12*d,flying:false,spin:50};
}
/** Pito live: shadows the square pass → darts in and cuts it out (right foot) → turns and drives, head up → right-foot strike → celebrates */
const P_START:[number,number]=[2.1,5.4],P_CUT:[number,number]=[STEAL[0]-.55,STEAL[1]-.42];
const liveP:Gen=T=>{
 let X:number,Z:number,pose:Pose,yaw:number;
 if(T<T_ST){const u=sm(PB0-.15,T_ST-.05,T,easeIO);X=lerp(P_START[0]+.4*Math.sin(T*.9),P_CUT[0],u);Z=lerp(P_START[1],P_CUT[1],u);
  yaw=lerp(yawTo(S2P[0]-P_START[0],S2P[1]-P_START[1]),yawTo(STEAL[0]-P_CUT[0],STEAL[1]-P_CUT[1])+.5,u);
  pose=blendPose(blendPose(stand(),backpedal(T*1.2),.35*(1-u)),runCycle(T*runCadence(.8),{speed:.8}),Math.min(1,u*2.2)*(1-sm(T_ST-.3,T_ST-.05,T)));
  pose=blendPose(pose,lunge(sm(T_ST-.3,T_ST+.1,T,linear),{side:'r'}),sm(T_ST-.32,T_ST-.12,T));}
 else if(T<T_C1){const u=sm(T_C0,T_C1,T,easeIn),d=Math.hypot(SHOT[0]-STEAL[0],SHOT[1]-STEAL[1])*u,lead=lerp(.42,.62,sm(T_C0,T_C0+.4,T));
  X=STEAL[0]+CARRY_DIR[0]*(d-lead);Z=STEAL[1]+CARRY_DIR[1]*(d-lead);
  const back=sm(T_ST,T_ST+.35,T,easeIO);X=lerp(P_CUT[0],X,back);Z=lerp(P_CUT[1],Z,back);
  yaw=lerp(yawTo(STEAL[0]-P_CUT[0],STEAL[1]-P_CUT[1])+.5,yawTo(CARRY_DIR[0],CARRY_DIR[1]),sm(T_ST,T_ST+.4,T,easeIO));
  pose=blendPose(lunge(.6,{side:'r'}),dribble((T-T_C0)*2.1,{foot:'r',speed:.75}),sm(T_ST,T_ST+.3,T));}
 else if(T<T_HIT+.55){const u=sm(T_C1,T_HIT-.05,T,easeOut),d=Math.hypot(SHOT[0]-STEAL[0],SHOT[1]-STEAL[1])-.62;
  X=lerp(STEAL[0]+CARRY_DIR[0]*d,PLANT[0],u)+.25*sm(T_HIT,T_HIT+.5,T)*Math.cos(YAW_SHOT);Z=lerp(STEAL[1]+CARRY_DIR[1]*d,PLANT[1],u)+.25*sm(T_HIT,T_HIT+.5,T)*Math.sin(YAW_SHOT);
  yaw=lerp(yawTo(CARRY_DIR[0],CARRY_DIR[1]),YAW_SHOT,u);
  const st=key(T,[[T_C1,.08],[T_HIT-.2,.24],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,.95]],linear);
  pose=blendPose(dribble((T_C1-T_C0)*2.1,{foot:'r',speed:.75}),strike(st,{foot:'r'}),sm(T_C1,T_C1+.12,T));}
 else{const u=sm(T_HIT+.55,T_HIT+1.2,T,easeIO),e=liveP(T_HIT+.549),run=T-T_HIT-.55;
  X=e.X+Math.cos(-.7)*run*2.6*u;Z=e.Z+Math.sin(-.7)*run*2.6*u;yaw=lerp(YAW_SHOT,-.7,u);
  pose=blendPose(strike(.95,{foot:'r'}),celebrate(run*1.3,{kind:'run'}),u);}
 return{pose,yaw,X,Z};
};
/** Sporting (white/green, defend +X): the fixo (0) plays it out then drops and blocks too late; the wing (1) passes square; the
 *  intended receiver (2) chases; the far ala (3) drops. Heads drop after the goal. */
type Mark={p:[number,number][];t:number[]};
const SPORT:Mark[]=[
 {p:[S0P,[S0P[0]+.4,S0P[1]-.2],[15.6,9.7],[16.2,10.1]],t:[0,PA[1],T_ST+.3,T_HIT]},
 {p:[S2P,[S2P[0]-.2,S2P[1]+.1],[S2P[0]+1.4,S2P[1]+1.8],[9.4,6.4]],t:[0,PB0,T_ST+.5,T_IN+.5]},
 {p:[[S1P[0]+.6,S1P[1]+.8],S1P,[S1P[0]+2.4,S1P[1]-.9],[9.8,10.6]],t:[0,PB0,T_ST+.4,T_IN+.3]},
 {p:[[8.4,15.4],[9.6,15.2],[12.4,14.2],[14.4,13.4]],t:[0,PB0,T_ST+.5,T_IN]},
];
function markAt(m:Mark,T:number):[number,number]{let k=0;while(k<m.t.length-2&&T>m.t[k+1])k++;const u=sm(m.t[k],m.t[k+1],T,easeIO);return[lerp(m.p[k][0],m.p[k+1][0],u),lerp(m.p[k][1],m.p[k+1][1],u)];}
const liveS=(i:number):Gen=>T=>{const[X,Z]=markAt(SPORT[i],T),b=liveBall(T),post=sm(T_IN+.3,T_IN+1.3,T),v=markAt(SPORT[i],T+.1),mv=Math.hypot(v[0]-X,v[1]-Z)*10;
 let pose=mv>1.2?runCycle(T*runCadence(Math.min(1,mv/6))+i*.3,{speed:Math.min(1,mv/6)}):blendPose(stand(),backpedal(T*1.2+i*.2),.4);
 const kick=i===0?pulse(T,PA[0]-.05,.3):i===1?pulse(T,PB0-.05,.3):0;
 if(kick>0)pose=blendPose(pose,posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
 if(i===0){const lu=key(T,[[T_HIT-.4,0],[T_HIT,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.5,T_HIT-.3,T));}
 if(i===2&&T>T_ST-.2&&T<T_ST+.3)pose=blendPose(pose,posed({lHipF:30,rHipF:-10,lKnee:30,lean:16,lShA:40,rShA:40,rElb:40,lElb:40,neckP:20}),.6);
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 return{pose,yaw:post>0?lerp(yawTo(b.X-X,b.Z-Z),FACE_LEFT,post*.6):yawTo(b.X-X,b.Z-Z),X,Z};};
/** Barça's other three (navy/red) and their keeper: the shape behind Pito; after the goal the three run to him */
const BAR_POS:[number,number][]=[[-3.6,4.4],[-1.4,15.2],[-8.4,10.2]];
const liveB=(i:number):Gen=>T=>{const[x0,z0]=BAR_POS[i],go=sm(T_IN+.3,C1.end,T,easeIO),f=liveP(C1.end),drift=sm(T_ST,T_HIT,T,easeIO)*[4,5,3][i];
 const X=lerp(x0+drift,f.X+[-1.3,-1.1,-1.8][i],go),Z=lerp(z0,f.Z+[.9,1.5,-.4][i],go);
 let pose=blendPose(stand(),runCycle(T*runCadence(.6)+i*.3,{speed:.6}),sm(T_ST,T_ST+.4,T)*(1-go));
 if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.3,T_IN+.7,T));
 return{pose,yaw:go>0?yawTo(f.X-x0,f.Z-z0):FACE_RIGHT+(i-1)*.3,X,Z};};
const livePlana:Gen=T=>({pose:keeperSet(T*1.2),yaw:FACE_RIGHT,X:-19.1,Z:10+.3*Math.sin(T*.4)});
/** Guitta: set, shuffles across with the carry, dives to his right (the far post) — beaten low */
const T_DIVE=T_HIT-.06;
const liveK:Gen=T=>{let pose=keeperSet(T*1.3);const d=sm(T_DIVE,T_DIVE+.7,T,linear);if(T>=T_DIVE)pose=blendPose(pose,keeperDive(d*.95,{side:'r',height:.15}),sm(T_DIVE,T_DIVE+.08,T));
 return{pose,yaw:FACE_LEFT+.12,X:GX-.78,Z:lerp(10.3,9.7,sm(T_ST,T_HIT-.3,T,easeIO))};};
const liveCam=(T:number)=>({x:key(T,mono([[0,5.8],[PA[1],6.2],[PB0,4.8],[T_ST,5.6],[T_C1,11.6],[T_HIT,13.6],[T_IN,14.8],[T_IN+1,14.4],[C1.end,12.6]]),easeInOutSine),
 zoom:key(T,mono([[0,.66],[PB0,.74],[T_ST,.82],[T_C1,.72],[T_HIT,.68],[T_IN+.4,.74],[C1.end,.9]]),easeInOutSine),
 y:key(T,mono([[0,1400],[T_ST,1380],[T_HIT,1360],[C1.end,1400]]),easeInOutSine)});
/** the main-stand broadcast camera: 17 m outside the near touchline, 8.5 m up (higher than the other futsal films) */
const bst=(camX:number):Stage=>({F:4200,eye:8.5,cx:camX,cz:-17});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.12,flash:pulse(T,T_IN,1.2),bulge:.45*sm(T_IN-.1,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.1*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:TGT[2],by:TGT[1],
  keeper:()=>{athlete(s,st,liveK,T,GUITTA,{detail:'low'});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SPORT.forEach((_,i)=>{const g=liveS(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,SCP(i),{detail:'low'})});});
 BAR_POS.forEach((_,i)=>{const g=liveB(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BAR(i),{detail:'low'})});});
 items.push({z:livePlana(T).Z,draw:()=>athlete(s,st,livePlana,T,PLANA,{detail:'low'})});
 items.push({z:liveP(T).Z,draw:()=>athlete(s,st,liveP,T,PITO,{smear:(T>T_ST-.3&&T<T_ST+.1)||(T>T_HIT-.2&&T<T_HIT+.25)?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const tr:Pt[]=[];if(b.flying)for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}
  drawBall(s,st,IDX,b,18,{trail:tr,smear:b.flying?.5:0,dir:Math.PI*.02});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** a figure's chest on a stage (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,xf:Xf=IDX):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=P3(st,xf,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,depthOf(xf,ch[0],ch[2])),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveP(tt),.12));},still:T_HIT+.05};

// ================= chapter 2 — REPLAY: slow motion, low, from BEHIND the goal through the net: steal, carry, finish =================
const C2={watch:A(1,'Watch'),steals:A(1,'He steals'),carries:A(1,'carries'),head:A(1,'head up'),fin:A(1,'He finishes'),half:A(1,'half time'),end:AUTH[1].seconds};
/** replay seconds → live seconds: ≈0.4–0.5× slow motion throughout (never faster than real time) */
const repT=(t:number)=>key(t,[[0,T_ST-1.35],[C2.steals+.15,T_ST],[C2.fin+.12,T_HIT],[C2.fin+1.35,T_IN+.08],[C2.end,T_IN+.08+(C2.end-C2.fin-1.35)*.45]],linear);
const stR:Stage={F:1500,eye:3.1,cx:0,cz:-6.2};
const RO={xf:REV,inv:REV_INV};
const RB=(q:[number,number]):Pt=>{const[a,b]=REV(q[0],q[1]);return proj(stR,a,.9,b);};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=repT(tt),Tcam=repT(t),hit=pulse(Tcam,T_HIT,.4),net=pulse(Tcam,T_IN,.6);
  const fSt=RB(STEAL),fSh=RB(SHOT);
  camPath(s,t,[[0,fSt[0]+60,fSt[1]-40,2.3],[C2.steals,fSt[0]+40,fSt[1]-30,2.35],[C2.carries,lerp(fSt[0],fSh[0],.4),lerp(fSt[1],fSh[1],.4)-30,1.9],[C2.head,fSh[0]+40,fSh[1]-10,1.5],[C2.fin,fSh[0]+120,fSh[1]+40,1.2],[C2.fin+.9,120,160,1.02],[C2.half,60,120,1.05],[C2.end,60,110,1.08]],
   [8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+5*net*Math.sin(t*60)]);
  const b=liveBall(T),goal=T>=T_IN;
  endCourt(s,stR,T,goal?1-.3*sm(C2.end-1,C2.end,tt):.1,pulse(T,T_IN,1.2));
  // "He steals it": a red ring stamps round the stolen ball; "carries it": the yellow dashed carry line; "head up": a yellow halo on his head
  const ringG=easeOutBack(sm(C2.steals,C2.steals+.35,tt))*(1-sm(C2.carries+.3,C2.carries+.7,tt));
  if(ringG>.02){const[a,z]=REV(STEAL[0],STEAL[1]);floorDashRing(s,stR,R,a,z,.55,Math.max(5,kAt(stR,z)*.05),201,ringG);}
  if(tt>=C2.carries-.1){const u=sm(C2.carries-.1,C2.fin,tt,easeOut),pts:Pt[]=[];for(let k=0;k<=12;k++){const q=L2(STEAL,SHOT,k/12),[a,z]=REV(q[0],q[1]);pts.push(proj(stR,a,0,z));}
   if(u>.02){dashed(s,Y,pts,9,202,{dash:30,progress:u});if(u>.95)arrowHead(s,Y,pts,26,203);}}
  const its:{z:number;draw:()=>void}[]=[];
  SPORT.forEach((_,i)=>{const g=liveS(i),p=g(T);its.push({z:depthOf(REV,p.X,p.Z),draw:()=>athlete(s,stR,g,T,SCP(i),{...RO,detail:'mid'})});});
  BAR_POS.forEach((_,i)=>{const g=liveB(i),p=g(T);its.push({z:depthOf(REV,p.X,p.Z),draw:()=>athlete(s,stR,g,T,BAR(i),{...RO,detail:'low'})});});
  const pp=liveP(T);its.push({z:depthOf(REV,pp.X,pp.Z),draw:()=>{
   const hu=easeOutBack(sm(C2.head,C2.head+.3,tt))*(1-sm(C2.fin-.1,C2.fin+.2,tt));
   if(hu>.02){const sk=solve(pp.pose,BUILD,placeAt(pp.X,pp.Z,pp.yaw)),hd=toMine(sk.head),c=P3(stR,REV,hd[0],hd[1],hd[2]),r=.36*kAt(stR,depthOf(REV,hd[0],hd[2]))*hu;s.fill(Y,ribbon(blob(c[0],c[1],r,r*.8,204,{n:20}),Math.max(5,r*.12),{seed:205,close:true,wobble:1}),.95);}
   athlete(s,stR,liveP,T,PITO,{...RO,detail:'high',smear:(T>T_ST-.3&&T<T_ST+.15)||(T>T_HIT-.3&&T<T_HIT+.3)?.14:0});}});
  const kp=liveK(T);its.push({z:depthOf(REV,kp.X,kp.Z),draw:()=>athlete(s,stR,liveK,T,GUITTA,{...RO,detail:'high'})});
  const bz=depthOf(REV,b.X,b.Z),drawB=()=>{const tr:Pt[]=[];if(b.flying)for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.12+k*.015)),[a,z]=REV(q.X,q.Z);tr.push(proj(stR,a,q.Y,z));}
   const o=drawBall(s,stR,REV,b,97,{min:10,trail:tr,smear:b.flying?.3:0,dir:Math.PI*.5});if(T>=T_HIT&&T<T_HIT+.2)sparkBurst(s,Y,o.p[0],o.p[1],o.r*2.6,{n:10,seed:98,g:easeOut(sm(T_HIT,T_HIT+.15,T))});};
  if(bz>=0)its.push({z:bz+(b.flying?0:-.2),draw:drawB});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  nearPosts(s,stR);
  if(bz<0)drawB();
  const[bxr]=REV(TGT[0],TGT[2]);
  nearNet(s,stR,.35*sm(T_IN-.05,T_IN+.05,T)*(1-.6*sm(T_IN+.2,T_IN+1,T))+.08*settle(T,T_IN,{amp:1,freq:3,decay:3}),bxr,TGT[1]);
  if(T>=T_IN&&T<T_IN+.5){const[a,z]=REV(TGT[0],TGT[2]),p=proj(stR,a,TGT[1],z);sparkBurst(s,Y,p[0],p[1],150,{n:12,seed:99,g:easeOut(sm(T_IN,T_IN+.2,T))*(1-sm(T_IN+.3,T_IN+.5,T))});}
  // "half time": navy/paper confetti from the far stands for the 2–0
  if(tt>=C2.half-.4){const u=sm(C2.half-.4,C2.half+2.4,tt,linear),top=proj(stR,0,5,WALL_R)[1];confetti(s,[R,K,'paper'],[-700,top-160+u*300,1400,300],22,Math.floor(tt*6),{size:12});}
 },
 aperture(t0){const{tt}=clock(1,t0),T=repT(tt),b=liveBall(T),[a,z]=REV(b.X,b.Z),p=proj(stR,a,b.Y,z),r=Math.max(10,kAt(stR,z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const an=i/12*TAU;q.push([p[0]+Math.cos(an)*r,p[1]+Math.sin(an)*r]);}return aperture(q);},
 still:C2.fin+.2,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration): back to goal, feel, the defender leans, spin the other way, shoot =================
const C3={famous:A(2,'His famous'),spin:A(2,'pivot spin'),back:A(2,'back to goal'),feels:A(2,'feels'),lean:A(2,'lean one'),spins:A(2,'spins the'),shoots:A(2,'and shoots'),end:AUTH[2].seconds};
/** the pivot back to goal on the edge of the box; the defender tight behind him (goal side), both face −X; the shot goes low to the far post */
const DTGT:V3=[GX+.05,.32,POST_F-.45];
const HOLD=posed({lHipF:34,rHipF:34,lKnee:52,rKnee:52,lHipA:16,rHipA:16,lHipR:10,rHipR:10,lean:28,pitch:4,neckP:18,lShF:-24,rShF:-24,lShA:34,rShA:34,lElb:34,rElb:34});
/** feeling: the left arm reaches back onto the defender, the head glances over the shoulder */
const FEEL=posed({lHipF:34,rHipF:30,lKnee:52,rKnee:50,lHipA:16,rHipA:14,lean:26,pitch:4,twist:14,neckP:12,neckY:62,lShF:-58,lShA:22,lElb:14,rShF:-10,rShA:40,rElb:40});
/** mid-spin: weight on the left foot, the right leg swings round wide, shoulders lead the turn (to his right) */
const SPIN=posed({lHipF:22,lKnee:40,rHipF:44,rHipA:34,rHipR:28,rKnee:62,lean:18,twist:-26,neckY:-34,neckP:10,lShA:62,rShA:52,lElb:40,rElb:44,squash:-.04});
const D3=(()=>{const yaw=yawTo(DTGT[0]-14.4,DTGT[2]-10.3),sb=toMine(strikeBall(yaw));return{yaw,ball:[14.4,10.3] as [number,number],plant:[14.4-sb[0],10.3-sb[2]] as [number,number]};})();
const PV:[number,number]=[D3.plant[0]-.18,D3.plant[1]-.06];// where he holds, back to goal
const DEF:[number,number]=[PV[0]+.78,PV[1]+.02];
const T_ARR=C3.back-.05,T_SP0=C3.spins-.05,T_SP1=C3.spins+.75,T_SH=C3.shoots+.02,T_SIN=T_SH+.36;
const demoP:Gen=t=>{
 let X=PV[0],Z=PV[1],pose:Pose,yaw=FACE_LEFT;
 if(t<T_ARR-.9){pose=blendPose(backpedal(t*1.1),HOLD,.55+.2*Math.sin(t*2));X+=.08*Math.sin(t*1.7);}
 else if(t<T_SP0){pose=blendPose(HOLD,FEEL,sm(C3.feels-.2,C3.feels+.25,t,easeIO)*(1-.35*sm(C3.lean+.2,T_SP0,t)));X+=.1*sm(C3.feels,C3.lean,t)-.05*sm(C3.lean,C3.lean+.4,t);}
 else if(t<T_SP1){const u=sm(T_SP0,T_SP1,t,easeIO);pose=keyPoses(t,[[T_SP0,blendPose(HOLD,FEEL,.65)],[lerp(T_SP0,T_SP1,.5),SPIN],[T_SP1,strike(.24,{foot:'r'})]]);
  yaw=lerp(FACE_LEFT,D3.yaw,u);X=lerp(PV[0]+.05,D3.plant[0],u);Z=lerp(PV[1],D3.plant[1],u);}
 else{const st=key(t,[[T_SP1,.24],[T_SH,STRIKE_CONTACT],[T_SH+.6,.95]],linear);pose=strike(st,{foot:'r'});yaw=D3.yaw;X=D3.plant[0]+.2*sm(T_SH,T_SH+.5,t);Z=D3.plant[1];
  if(t>T_SIN+.5){const u=sm(T_SIN+.5,T_SIN+1.1,t,easeIO);pose=blendPose(pose,celebrate((t-T_SIN-.5)*1.2,{kind:'arms'}),u);yaw=lerp(D3.yaw,-1.2,u);}}
 return{pose,yaw,X,Z};
};
/** the ball: rolled in from the left to his feet → held in front of him → carried round the spin on his right sole → struck */
function demoBall(t:number):BallS{
 const front=(p:{X:number;Z:number;yaw:number},r:number):[number,number]=>[p.X+Math.cos(p.yaw)*r,p.Z+Math.sin(p.yaw)*r];
 if(t<T_ARR){const u=sm(T_ARR-1.15,T_ARR,t,easeOut),end=front(demoP(T_ARR),.52);return{X:lerp(end[0]-8,end[0],u),Y:BALL_R,Z:lerp(end[1]+.4,end[1],u),flying:false,spin:u*10};}
 if(t<T_SP0){const f=front(demoP(t),.52);return{X:f[0],Y:BALL_R,Z:f[1],flying:false,spin:0};}
 if(t<T_SP1){const u=sm(T_SP0,T_SP1,t,easeIO),p=demoP(t),a=lerp(FACE_LEFT,D3.yaw+.35,u),r=lerp(.52,.62,u),o=[p.X+Math.cos(a)*r,p.Z+Math.sin(a)*r],w=sm(.7,1,u);
  return{X:lerp(o[0],D3.ball[0],w),Y:BALL_R,Z:lerp(o[1],D3.ball[1],w),flying:false,spin:u*6};}
 if(t<T_SH)return{X:D3.ball[0],Y:BALL_R,Z:D3.ball[1],flying:false,spin:6};
 if(t<T_SIN){const u=sm(T_SH,T_SIN,t,linear),M:V3=[lerp(D3.ball[0],DTGT[0],.5),.42,lerp(D3.ball[1],DTGT[2],.5)],a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;
  return{X:a*D3.ball[0]+b*M[0]+c*DTGT[0],Y:a*BALL_R+b*M[1]+c*DTGT[1],Z:a*D3.ball[1]+b*M[2]+c*DTGT[2],flying:true,spin:20+u*30};}
 const d=sm(T_SIN,T_SIN+.3,t,easeOut);return{X:lerp(DTGT[0],GX+.62,d),Y:lerp(DTGT[1],BALL_R,sm(T_SIN+.1,T_SIN+.4,t)),Z:DTGT[2]+.1*d,flying:false,spin:40};
}
/** the defender: tight behind him, a hand on his back ("feels"), leans to HIS left (toward the camera) on "lean one way", stranded */
const demoD:Gen=t=>{
 const lean=sm(C3.lean-.1,C3.lean+.35,t,easeIO),stranded=sm(T_SP0+.2,T_SP1+.4,t,easeIO);
 let pose=blendPose(backpedal(t*1.1),posed({lHipF:30,rHipF:30,lKnee:44,rKnee:44,lean:22,lShF:40,rShF:34,lShA:20,rShA:20,lElb:30,rElb:40,neckP:14}),.7);
 pose=blendPose(pose,posed({lHipF:22,rHipF:30,lKnee:40,rKnee:48,lHipA:30,lean:20,bend:-16,lShF:36,rShF:20,lShA:40,rShA:24,lElb:30,rElb:40,neckP:14,neckY:14}),lean);
 pose=blendPose(pose,lunge(.6,{side:'l'}),lean*.5);
 pose=blendPose(pose,posed({lHipF:20,rHipF:24,lKnee:40,rKnee:40,lean:14,neckY:-70,neckP:0,lShA:30,rShA:30,lElb:30,rElb:30,twist:-20}),stranded*.7);
 return{pose,yaw:FACE_LEFT+.35*stranded,X:DEF[0]+.08*Math.sin(t*1.3)*(1-lean),Z:DEF[1]-.4*lean};
};
const demoK:Gen=t=>{let pose=keeperSet(t*1.2);if(t>=T_SH+.08)pose=blendPose(pose,keeperDive(sm(T_SH+.08,T_SH+.8,t,linear)*.95,{side:'r',height:.15}),sm(T_SH+.08,T_SH+.16,t));return{pose,yaw:FACE_LEFT+.25,X:GX-.8,Z:9.8};};
/** a low camera by the side of the box, 1.7 m up — nearer and lower than the live shot */
const st3:Stage={F:1500,eye:1.7,cx:17.1,cz:.3};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  const g0=proj(st,PV[0],1,PV[1]),gG=proj(st,GX-1.2,1,10);
  camPath(s,t,[[0,g0[0]+160,g0[1]-70,1.2],[C3.spin,g0[0]+90,g0[1]-60,1.6],[C3.back-.4,g0[0]+70,g0[1]-50,1.75],[C3.feels,g0[0]+50,g0[1]-50,2.0],[C3.lean,g0[0]+50,g0[1]-45,1.95],[C3.spins,g0[0]+80,g0[1]-45,1.8],[C3.shoots,lerp(g0[0],gG[0],.5),g0[1]-30,1.25],[C3.end,lerp(g0[0],gG[0],.55),g0[1]-30,1.2]]);
  const b=demoBall(tt),goal=tt>=T_SIN;
  courtSide(s,st,tt,{cheer:goal?.8:0,flash:pulse(tt,T_SIN,1.2),bulge:.4*sm(T_SIN-.1,T_SIN,tt)*(1-.6*sm(T_SIN+.2,T_SIN+1,tt)),bz:DTGT[2],by:DTGT[1],
   keeper:()=>athlete(s,st,demoK,tt,DEMO_K,{detail:'mid'})});
  // "pivot spin": a yellow dashed ring round him; "back to goal": a navy dashed arrow from his back to the goal;
  // "lean one way": a red arrow under the defender; "spins the other": a yellow curved arrow round him; "shoots": the dashed shot line
  const pr=easeOutBack(sm(C3.spin,C3.spin+.35,tt))*(1-sm(C3.back-.2,C3.back+.2,tt));floorDashRing(s,st,Y,PV[0],PV[1],.9,9,301,pr);
  const bg=sm(C3.back,C3.back+.5,tt,easeOut)*(1-sm(C3.feels,C3.feels+.4,tt));
  if(bg>.02){const pts:Pt[]=[];for(let k=0;k<=8;k++)pts.push(proj(st,lerp(PV[0]+1.2,GX-.4,k/8),0,lerp(PV[1],10,k/8)));dashed(s,K,pts,10,302,{dash:34,progress:bg});if(bg>.9)arrowHead(s,K,pts,30,303);}
  const lg=sm(C3.lean,C3.lean+.5,tt,easeOut)*(1-sm(T_SP1,T_SP1+.4,tt));
  if(lg>.02){const a=proj(st,DEF[0],0,DEF[1]-.1),c=proj(st,DEF[0],0,DEF[1]-1.5),pts=[a,L2(a,c,.5),c],q=partial(pts,lg),rp=ribbon(q,13,{seed:304,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(lg>.6)arrowHead(s,R,q,32,305);}
  const sg=sm(C3.spins-.15,C3.spins+.5,tt,easeOut)*(1-sm(T_SH+.5,T_SH+.9,tt));
  if(sg>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=lerp(FACE_LEFT,D3.yaw+.2,k/14);pts.push(proj(st,PV[0]+Math.cos(a)*1.05,0,PV[1]+Math.sin(a)*1.05));}dashed(s,Y,pts,13,306,{dash:36,progress:sg});if(sg>.9)arrowHead(s,Y,pts,36,307);}
  if(tt>=T_SH){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=demoBall(lerp(T_SH,Math.min(tt,T_SIN),k/12));pts.push(proj(st,q.X,0,q.Z));}dashed(s,Y,pts,9,308,{dash:30});}
  // figures back to front; the ball slots in by depth
  const f=demoP(tt),d=demoD(tt);
  const items:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'high',smear:tt>C3.lean&&tt<C3.lean+.4?.14:0})},
   {z:f.Z+.001,draw:()=>athlete(s,st,demoP,tt,PITO_T,{detail:'high',smear:(tt>T_SP0&&tt<T_SP1)||(tt>T_SH-.15&&tt<T_SH+.2)?.16:0})},
   {z:b.Z-.02,draw:()=>{drawBall(s,st,IDX,b,311,{smear:b.flying?.35:0,dir:0});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "feels the defender": a red contact spark where his hand meets the defender
  const fe=pulse(tt,C3.feels+.15,.8);if(fe>.05){const sk=solve(f.pose,BUILD,placeAt(f.X,f.Z,f.yaw)),h=toMine(sk.lHa),p=proj(st,h[0],h[1],h[2]);sparkBurst(s,R,p[0],p[1],70,{n:8,seed:312,g:Math.min(1,fe*1.4)});}
  if(tt>=T_SIN&&tt<T_SIN+.6){const p=proj(st,DTGT[0],DTGT[1],DTGT[2]);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:313,g:easeOut(sm(T_SIN,T_SIN+.3,tt))*(1-sm(T_SIN+.35,T_SIN+.6,tt))});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoP(tt),.13));},
 still:lerp(T_SP0,T_SP1,.5),
};

// ================= chapter 4 — YOUR TURN: three cards (feel, turn, finish); feel, the defender leans, turn the other way; a tick =================
const C4={turn:A(3,'Your turn'),feel:A(3,'Feel where'),def:A(3,'defender is'),other:A(3,'turn the other'),end:AUTH[3].seconds};
const P4:[number,number]=[.2,4.2],D4:[number,number]=[.98,4.22];
const T4S=C4.other,T4E=C4.other+.8,Y4E=-.35;
const practiceP:Gen=t=>{let pose=blendPose(HOLD,FEEL,sm(C4.feel-.1,C4.feel+.3,t,easeIO)*(1-sm(T4S-.1,T4S+.1,t))),yaw=FACE_LEFT;
 if(t>=T4S){const u=sm(T4S,T4E,t,easeIO);pose=keyPoses(t,[[T4S,blendPose(HOLD,FEEL,.5)],[lerp(T4S,T4E,.5),SPIN],[T4E,dribble(.1,{foot:'r',speed:.5})]]);yaw=lerp(FACE_LEFT,Y4E,u);
  if(t>T4E)pose=blendPose(dribble((t-T4E)*1.6+.1,{foot:'r',speed:.5}),celebrate((t-T4E-.6)*1.2,{kind:'arms'}),sm(T4E+.5,T4E+.9,t));}
 const go=Math.max(0,t-T4E)*1.3*(1-sm(T4E+.5,T4E+.9,t));return{pose,yaw,X:P4[0]+Math.cos(Y4E)*go,Z:P4[1]+Math.sin(Y4E)*go};};
const practiceD:Gen=t=>{const lean=sm(C4.def,C4.def+.4,t,easeIO);let pose=blendPose(backpedal(t*1.1),posed({lHipF:30,rHipF:30,lKnee:44,rKnee:44,lean:22,lShF:40,rShF:34,lShA:20,rShA:20,lElb:30,rElb:40,neckP:14}),.7);
 pose=blendPose(pose,posed({lHipF:22,rHipF:30,lKnee:40,rKnee:48,lHipA:30,lean:20,bend:-16,lShF:36,rShF:20,lShA:40,rShA:24,lElb:30,rElb:40,neckP:14}),lean);
 return{pose,yaw:FACE_LEFT+.3*sm(T4S,T4E,t),X:D4[0],Z:D4[1]-.35*lean};};
const st4:Stage={F:1500,eye:2.4,cx:.2,cz:-2.6};
const CARD_Y=850,CARD_W=190,CARDS:[number,number,'feel'|'turn'|'finish'][]=[[-420,C4.feel+.1,'feel'],[0,C4.def-.2,'turn'],[420,C4.def+.35,'finish']];
function practiceBall(t:number):[number,number]{const p=practiceP(t),r=.5;if(t<T4S)return[p.X+Math.cos(FACE_LEFT)*r,p.Z];const a=lerp(FACE_LEFT,Y4E,sm(T4S,T4E,t,easeIO));const lead=t>T4E?.55:r;return[p.X+Math.cos(a)*lead,p.Z+Math.sin(a)*lead];}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,80,380,1.15],[C4.feel-.4,60,420,1.1],[C4.feel+.3,40,630,.94],[C4.other-.3,40,630,.94],[C4.other+.5,70,420,1.2],[C4.end,80,400,1.24]]);
  courtSide(s,st,tt,{cheer:.8*pulse(tt,T4E+.5,1.4)});
  const[bx,bz]=practiceBall(tt),bp=proj(st,bx,BALL_R,bz),br=kAt(st,bz)*BALL_R;
  const items:{z:number;draw:()=>void}[]=[
   {z:practiceD(tt).Z,draw:()=>athlete(s,st,practiceD,tt,DEMO_D,{detail:'high'})},
   {z:practiceP(tt).Z+.001,draw:()=>athlete(s,st,practiceP,tt,PITO_T,{detail:'high',smear:tt>T4S&&tt<T4E?.14:0})},
   {z:bz-.3,draw:()=>{shadow(s,bp[0],proj(st,bx,0,bz)[1],br*1.15,br*.3,402,.45);ball(s,bp[0],bp[1],br,403,{rot:tt*3});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Feel where", each prints one step with a small figure; they drop before the turn
  const rise=sm(C4.feel-.2,C4.feel+.4,tt,easeOut),drop=sm(C4.other-.5,C4.other-.1,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y+230+dy],[cx-CARD_W,CARD_Y+230+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.16);
   CARDS.forEach(([cx,t0c,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+175;
    const fc=figureCam({x:cx+10,y:gy,height:400*(.9+.1*on),azimuth:kind==='finish'?20:-60,elevation:14,fov:16,at:[0,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=kind==='feel'?FEEL:kind==='turn'?SPIN:strike(STRIKE_CONTACT,{foot:'r'}),Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    // the step's diagram on the floor: feel = a red ring behind him, turn = a yellow arc arrow, finish = a navy arrow to goal
    if(kind==='feel'){const c=Pc([-.7,0,0]);s.fill(R,ribbon(blob(c[0],c[1],70,24,80,{n:18}),7,{seed:84,close:true,wobble:1}),.9);}
    if(kind==='turn'){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=Math.PI*.9*k/10+.2;pts.push(Pc([Math.cos(a)*.7,0,Math.sin(a)*.7]));}dashed(s,Y,pts,8,85,{dash:22});arrowHead(s,Y,pts,24,86);}
    if(kind==='finish'){const sb=strikeBall(0),a0=Pc(sb),a1=Pc([sb[0]+1.6,.2,sb[2]]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,K,pts,8,87,{dash:22});arrowHead(s,K,pts,24,88);ball(s,a0[0],a0[1],16,81);}
    drawAthlete(s,pose,fc,{...PITO_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "turn the other way": a big tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(T4E-.1,T4E+.25,tt));
  if(tick>.02){const f=practiceP(tt),g=proj(st,f.X,0,f.Z),h=kAt(st,f.Z)*1.85,c:Pt=[g[0]+h*.62,g[1]-h*.72],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.def+.4,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'pito-futsal-signature',format:'futsal',title:'Pito’s pivot spin',theme:'Feel where the defender is, then turn the other way.',
 ageNote:'For players aged 7–12: the 2022 final goal is real; the pivot spin is shown as a demonstration. Practise it with a friend.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball spins on the spot — a yellow turning arc sweeps round it, a red ring squeaks out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),sw=easeOut(u);
  if(u<1){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=-Math.PI*.2+sw*Math.PI*1.6*k/12;pts.push([x+Math.cos(a)*r*1.9,y+Math.sin(a)*r*.8]);}s.fill(Y,ribbon(pts,10*(1-u)+3,{seed,taper:.5,wobble:1}),1);
   s.fill(R,ribbon(blob(x,y+r*.9,r*(1+1.6*u),r*(.3+.5*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(x,y+r*.95,r,r*.2,seed+2,{n:16}),true),.32);
  ball(s,x,y,r,seed,{rot:age*9*(1-u)+sw*6});
 },
};
export default film;
