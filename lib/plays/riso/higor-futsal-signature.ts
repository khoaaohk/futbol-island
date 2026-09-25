/** Higor — "the strong back-to-goal turn": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Higor's entry (lib/town/iconicPlays.json) is a signature, the pivot's strong back-to-goal turn (use your body as a shield),
 * not one match. The best-documented Higor performance we could reach in writing is his HAT-TRICK for Benfica in the 2023–24 UEFA Futsal
 * Champions League third-place match against Sporting CP (5 May 2024, Demirchyan Arena, Yerevan; Sporting 3–6 Benfica; Higor 10:27, 21:21,
 * 21:58). No written source we could reach describes HOW any of those goals was scored (the UEFA match page is a script shell), so the film
 * follows the brief's fallback rule: the real-match chapter shows ONLY confirmed things (the arena, the teams, the goal times, the final score,
 * a celebration) and never stages a goal; the turn itself is a separate, clearly labelled demonstration ("Here's how he does it", plain
 * training tops, no club and no match claimed). The Brazil 2024 World Cup was checked: Higor is not in the goal lists, so it was not used.
 *  1  LIVE (broadcast camera HIGH in the main stand, real time, no ball in play): Yerevan, the third-place match. Higor (Benfica's pivot) runs
 *     off celebrating toward the near corner, team-mates chase him, Sporting's players walk away. A TV-style match-timeline graphic
 *     (0–40 min, Sporting swatch left, Benfica right) drops a ball on each of his three goal times (the last two only 37 s apart), then the
 *     full-time box prints 3–6.
 *  2  HOW HE DOES IT (demonstration, real time; reverse angle from the FAR touchline, 4 m up, goal on the LEFT): the pass in, back to goal,
 *     he sits low and wide with his body between the ball and the defender; the defender reaches round one side (his right leg round the
 *     far side); Higor drags the ball the other way with his right sole, turns over his LEFT shoulder and shoots low, right foot.
 *  3  WATCH AGAIN (slow-motion replay of the demonstration; a knee-high camera 4 m away on the main-stand side, goal on the RIGHT): the
 *     reaching leg is stopped by his hips and back; a yellow shield plate prints on his back; the turn.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Use your body as a shield to protect the ball from behind."): the defender circles
 *     behind him, he keeps turning his back to him so the ball stays on the far side; three cards (low, shield, arm); a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2023–24 UEFA Futsal Champions League" (raw, cached by an earlier film): third-place match 5 May 2024, 15:00, Demirchyan
 *    Arena, Yerevan: Sporting CP 3–6 Benfica; goals Rafagnin 19:53, Taynan 21:35, Zicky Té 38:08 (Sporting); Arthur 8:55, Higor de Souza
 *    10:27, 21:21, 21:58, Lúcio Rocha 37:57, 39:34 (Benfica). Also Higor v Prishtina 01 (37:38) in the elite round.
 *    — https://en.wikipedia.org/wiki/2023%E2%80%9324_UEFA_Futsal_Champions_League
 *  - Wikipedia, "Higor de Souza" (raw, fetched Sep 2026): Higor Ribeiro de Souza, born 18 July 1998; 1.78 m; position PIVOT; Corinthians
 *    2017–20, Palma Futsal 2020–22, Benfica 2022–26; Brazil international. — https://en.wikipedia.org/wiki/Higor_de_Souza
 *  - UEFA.com match page 2040533 (Sporting CP v Benfica, 2023/24) fetched: a JS shell with no report text.
 *  - Wikipedia, "2024 FIFA Futsal World Cup" (raw, cached): Higor does not appear among the scorers.
 *  - FIFA.com, Lithuania 2021 Matchday 11 review (cached): "Higor Pires of Japan" is a different player (Japan's keeper) — not used.
 * CONFIRMED (the only facts in the narration): the city and year, Benfica v Sporting for third place in Europe, Higor as the pivot, his three
 *  goals (a hat-trick) and their times, the 6–3 win (Sporting 3–6 Benfica on the sheet), his height (1.78 m).
 * INFERRED (not named in the narration): kits — Benfica red shirts / white shorts / red socks, Sporting green-and-white hoops / dark shorts
 *  / green socks, the keepers' colours; the warm court colour; the look of the timeline graphic (a TV-style illustration, not the real
 *  broadcast graphic); which end the goals went in, where and how he celebrated, who chased him; the ball left in the net; Higor's short
 *  hair (card appearance: buzz cut) and his shooting foot (right, not documented); no shirt numbers. No video was reviewed.
 *  Chapters 2–4 demonstrate the pivot's shield and turn, not footage of a particular match.
 * Different from the parallel pivot films (Pito, Ferrão, Zicky Té): a different match (the 2024 third-place match, a hat-trick), no
 *  hanging scoreboard (a match-timeline graphic instead), the demo filmed from the FAR touchline with the goal on the left, a knee-high
 *  replay from the other side, a turn over the LEFT shoulder, and the lesson on the shield (the defender circles, the ball stays away).
 * Technique (poses): the pivot sits low with a wide base (feet wider than the hips, knees bent, weight forward on the balls of the feet),
 *  back and hips against the defender, arms out and bent for balance and to feel him, head turned to glance over the shoulder; the ball
 *  is kept on the far foot, away from the defender; when the defender commits round one side, the pivot drags the ball with the sole to the
 *  other side and turns on the standing foot, then shoots early.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the reach, the turn and the strike). Choreography lives in court coordinates (X along the court, the demo goal at X = +20;
 *  Z across, the main stand at Z < 0); each stage maps it with a proper rotation (ROT for the far-touchline camera), so the right foot stays
 *  the right foot. Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (floor, lights, shield, diagrams), red (Benfica, the reach arrows), green (Sporting hoops, the demo keeper), navy (key line,
 *  stands, shorts). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 *  Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Yerevan 2024',text:'Yerevan, 2024. Benfica play Sporting for third place in Europe. Their pivot, Higor, scores three goals, a hat trick. Benfica win six three!',tail:2.2,
  cues:['Yerevan','Benfica play','third place','Their pivot','three goals','hat trick','Benfica win'],heads:{'Yerevan':'Yerevan 2024','third place':'3rd place','hat trick':'Hat-trick','Benfica win':'6–3'}},
 {label:'How he does it',text:'Here’s how he does it. Back to goal, he stays low and wide, his body between the ball and the defender. The defender reaches round, so he turns the other way and shoots!',tail:2.2,
  cues:['Back to goal','low and wide','his body','reaches round','turns the other','and shoots'],heads:{'Back to goal':'Back to goal','and shoots':''}},
 {label:'Watch again',text:'Watch again, slowly. The defender can’t get to the ball. His body is the shield.',tail:2.4,
  cues:['Watch again','The defender','get to the','His body','the shield'],heads:{'His body':'The shield'}},
 {label:'Your turn',text:'Your turn. Stay low, and use your body as a shield to protect the ball from behind!',tail:2.6,
  cues:['Your turn','Stay low','your body','protect the ball'],heads:{'Stay low':'Low and strong','protect the ball':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/higor-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/higor-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/higor-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('higor: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('higor: no cue '+w);return c.at;};
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
/** court → stage floor transforms. IDX: the main-stand side (the demo goal at X = +20 on the right). ROT: the FAR touchline camera,
 *  a 180° turn about the court's centre (stage X = −X, stage Z = 20 − Z), so the demo goal is on the LEFT. Both are proper rotations. */
type Xf=(X:number,Z:number)=>[number,number];
const IDX:Xf=(X,Z)=>[X,Z];
const ROT:Xf=(X,Z)=>[-X,20-Z];
const P3=(st:Stage,xf:Xf,X:number,Yh:number,Z:number):Pt=>{const[a,b]=xf(X,Z);return proj(st,a,Yh,b);};
const depthOf=(xf:Xf,X:number,Z:number)=>xf(X,Z)[1];

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the floor */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){const{dash=width*4.5,progress=1}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});s.knockout(p);s.fill(ink,p,1);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
/** court-floor points (court coords) → runs of stage points in front of the camera (a low camera inside the court clips the near lines) */
function floorRuns(st:Stage,xf:Xf,pts:[number,number][],step=.5):Pt[][]{
 const dense:[number,number][]=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let k=0;k<n;k++)dense.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)]);}dense.push(pts[pts.length-1]);
 const runs:[number,number][][]=[];let cur:[number,number][]=[];for(const p of dense){const q=xf(p[0],p[1]);if(q[1]>st.cz+.4)cur.push(q);else if(cur.length){runs.push(cur);cur=[];}}if(cur.length)runs.push(cur);
 return runs.filter(r=>r.length>1).map(r=>r as unknown as Pt[]);
}
/** a painted line strip (stage floor coords) */
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorRing(st:Stage,xf:Xf,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(P3(st,xf,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorDashRing(s:Sheet,st:Stage,xf:Xf,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,xf,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. xf maps the court onto the stage. */
function projector(st:Stage,xf:Xf=IDX):Projector{const e=xf===ROT?[-st.cx,20-st.cz]:[st.cx,st.cz];
 return{eye:[e[0],st.eye,-e[1]] as V3,project(p:V3){const[a,b]=xf(p[0],-p[2]),q=proj(st,a,p[1],b);return[q[0],q[1],b-st.cz];},scale(p:V3){return kAt(st,xf(p[0],-p[2])[1]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) on the court (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAM=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.84],[R,.34]];
const BUILD={height:1.78,bulk:1.06};
/** Higor at Benfica (kit inferred: red shirt, white shorts, red socks), short dark hair, 1.78 m; no shirt number is claimed */
const HIGOR:AthleteStyle={shirt:R,shorts:'paper',socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:'paper',hairStyle:'short',build:BUILD,seed:11};
/** Higor in the demonstration and lesson: a plain yellow training top and navy shorts (no club kit, so no match is implied) */
const HIGOR_T:AthleteStyle={...HIGOR,shirt:[Y,.95],shorts:K,socks:K,trim:K,boots:'paper'};
const BEN=(n:number):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,skin:[[[Y,.8],[R,.26]],[[Y,.5],[R,.34],[K,.12]],[[Y,.72],[R,.2]]][n%3] as InkFill[],hair:K,line:K,trim:'paper',hairStyle:(['short','curly','bald'] as const)[n%3],build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Sporting (kit inferred): green-and-white hoops, dark shorts, green socks; their keeper in yellow; Benfica's keeper in navy */
const SCP=(n:number):AthleteStyle=>({shirt:G,pattern:'hoops',patternInk:'paper',shorts:K,socks:G,boots:K,skin:[[[Y,.74],[R,.2]],[[Y,.46],[R,.36],[K,.14]]][n%2] as InkFill[],hair:K,line:K,trim:'paper',hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const SCP_GK:AthleteStyle={shirt:[Y,.9],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
const BEN_GK:AthleteStyle={shirt:[K,.6],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.82},seed:62};
/** the demonstration defender and keeper: neutral training kit (no team is claimed in chapters 2–4) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.84,bulk:1.05},seed:77};
const DEMO_K:AthleteStyle={shirt:[G,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
type AOpt={detail?:'auto'|'low'|'mid'|'high';smear?:number;xf?:Xf};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:AOpt={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st,o.xf),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
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

// ---------------- the arena ----------------
/** stepped navy rows, lit faces, green / red / paper shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),grn=new Path2D(),reds=new Path2D(),pap=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.2)grn.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.48)pap.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(G,grn);s.fill(R,reds);s.knockout(pap,.8);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal court (40 × 20 m) seen from one touchline through xf; the far boards and crowd; the demo goal (court X = +20) with its net.
 *  side: where that goal appears on the stage (+1 right for IDX, −1 left for ROT). */
const BOARDS=21.2,GX=20,POST_N=8.5,POST_F=11.5,GH=2;
function court(s:Sheet,st:Stage,xf:Xf,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;inGoal?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 // the warm sports floor (inferred colour): yellow + a red tint; the court a shade lighter than the run-off
 s.fill(Y,rectPath(-span,wall,span*2,span),.5);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const c=polyPath(floorQuad(st,-20,0,20,20),true);s.knockout(c,.3);s.fill(Y,c,.55);s.fill(R,c,.08);
 // painted lines (court coords, clipped in front of the camera): touchlines, goal lines, halfway, both 6 m areas, the marks, the circle
 const lines=new Path2D(),add=(pts:[number,number][])=>{for(const r of floorRuns(st,xf,pts))lines.addPath(polyPath(floorStrip(st,r,.05),true));};
 add([[-20,0],[20,0]]);add([[-20,20],[20,20]]);add([[20,0],[20,20]]);add([[-20,0],[-20,20]]);add([[0,0],[0,20]]);
 for(const e of[1,-1]){const arc:[number,number][]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([e*(GX-6*Math.sin(a)),POST_N-6*Math.cos(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([e*(GX-6*Math.sin(a)),POST_F+6*Math.cos(a)]);}add(arc);
  for(const X of[GX-6,GX-10]){const q=xf(e*X,10);if(q[1]>st.cz+.5)lines.addPath(polyPath(floorRing(st,xf,e*X,10,.12,12),true));}}
 const cc:[number,number][]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}add(cc);
 s.knockout(lines,.94);
 // boards and the crowd on the far side
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,xf,bulge,bz,by);o.inGoal?.();goalFrame(s,st,xf);
}
/** the demo goal's net (court X = +20; the net runs out to +X), drawn through xf; bulge pushes the back out round (bz, by) */
function goalNet(s:Sheet,st:Stage,xf:Xf,bulge:number,bz:number,by:number){
 const Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return P3(st,xf,GX+lerp(Db,Dt,Yh/GH)+d,Yh,Z);};
 const hull=[P3(st,xf,GX,0,POST_N),P3(st,xf,GX,GH,POST_N),P3(st,xf,GX,GH,POST_F),back(POST_F,GH),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=GH+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.4){const a=P3(st,xf,GX,Yh,POST_N),b=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,depthOf(xf,GX,10))*.018),.6);
}
function goalFrame(s:Sheet,st:Stage,xf:Xf){
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,depthOf(xf,GX,10))*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>P3(st,xf,GX+dx,Yh,Z);quad([P(0,-w),P(0,w),P(GH,w),P(GH,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*GH,y1=(k+1)/8*GH;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>P3(st,xf,GX,GH+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---------------- seven-segment digits (the timeline's times and the full-time score) ----------------
const SEG:Record<string,number[]>={'0':[1,1,1,1,1,1,0],'1':[0,1,1,0,0,0,0],'2':[1,1,0,1,1,0,1],'3':[1,1,1,1,0,0,1],'4':[0,1,1,0,0,1,1],'5':[1,0,1,1,0,1,1],'6':[1,0,1,1,1,1,1],'7':[1,1,1,0,0,0,0],'8':[1,1,1,1,1,1,1],'9':[1,1,1,1,0,1,1]};
const SEGL:[Pt,Pt][]=[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[1,2]],[[0,2],[1,2]],[[0,1],[0,2]],[[0,0],[0,1]],[[0,1],[1,1]]];
function digits(path:Path2D,str:string,x:number,y:number,h:number,seed:number,measure=false):number{
 const w=h*.5,gap=h*.26,lw=h*.14;let cx=x;
 for(const ch of str){
  if(ch===':'){if(!measure)for(const dy of[.6,1.4])path.addPath(polyPath(blob(cx+lw*.6,y+dy*h/2,lw*.6,lw*.6,seed+dy*7,{n:10}),true));cx+=lw*1.2+gap;continue;}
  const on=SEG[ch];if(!on){cx+=w+gap;continue;}
  if(!measure)on.forEach((v,i)=>{if(!v)return;const[a,b]=SEGL[i];path.addPath(ribbon([[cx+a[0]*w,y+a[1]*h/2],[cx+b[0]*w,y+b[1]*h/2]],lw,{seed:seed+i,taper:0,wobble:.4}));});
  cx+=w+gap;}
 return cx-x-gap;
}

// ================= chapter 1 — LIVE: Yerevan 2024, the third-place match; the celebration (no goal staged) + the match timeline =================
const C1={yer:A(0,'Yerevan'),play:A(0,'Benfica play'),third:A(0,'third place'),piv:A(0,'Their pivot'),three:A(0,'three goals'),hat:A(0,'hat trick'),win:A(0,'Benfica win'),end:AUTH[0].seconds};
/** the celebration (all inferred): Higor runs from the right-hand box to the near corner, stops facing the stand and jumps with his arms up */
const H0:[number,number]=[15.4,12.4],CORNER:[number,number]=[17.6,2.7];
const T_RUN0=.25,T_STOP=C1.three-.1;
const liveH:Gen=T=>{
 const u=sm(T_RUN0,T_STOP,T,easeIO),X=lerp(H0[0],CORNER[0],u)+.25*Math.sin(u*Math.PI),Z=lerp(H0[1],CORNER[1],u);
 const runYaw=yawTo(CORNER[0]-H0[0],CORNER[1]-H0[1]),turn=sm(T_STOP-.3,T_STOP+.4,T,easeIO);
 let pose=celebrate(T*1.25,{kind:'run'});
 pose=blendPose(pose,celebrate((T-C1.hat)*1.15+.1,{kind:'arms'}),sm(C1.hat-.35,C1.hat,T));
 pose=blendPose(pose,posed({lHipF:14,rHipF:14,lKnee:16,rKnee:16,lShA:120,rShA:120,lShF:30,rShF:30,lElb:24,rElb:24,neckP:-24,lHand:1,rHand:1}),turn*(1-sm(C1.hat-.35,C1.hat,T)));
 return{pose,yaw:lerp(runYaw,FACE_CAM+.25,turn),X,Z};
};
/** Benfica's other three (red) run in to him and jump with him; their keeper celebrates at the far end (mostly off frame) */
const BEN_FROM:[number,number][]=[[9.5,9.4],[12.2,16.2],[6.8,13.8]],BEN_AT:[number,number][]=[[-1.05,.75],[1.0,.95],[-.2,1.55]];
const liveB=(i:number):Gen=>T=>{const f=liveH(C1.hat+.6),t0=[.4,.9,1.3][i],t1=C1.hat+[.1,.45,.8][i],u=sm(t0,t1,T,easeIO),X=lerp(BEN_FROM[i][0],f.X+BEN_AT[i][0],u),Z=lerp(BEN_FROM[i][1],f.Z+BEN_AT[i][1],u);
 const arrived=sm(t1-.2,t1+.1,T);let pose=blendPose(stand(),runCycle(T*runCadence(.9)+i*.3,{speed:.9}),sm(t0-.1,t0+.2,T)*(1-arrived));
 pose=blendPose(pose,celebrate((T-t1)*1.2+i*.27,{kind:'arms'}),arrived);
 return{pose,yaw:arrived>.5?lerp(yawTo(f.X-X,f.Z-Z),FACE_CAM,.5):yawTo(f.X+BEN_AT[i][0]-BEN_FROM[i][0],f.Z+BEN_AT[i][1]-BEN_FROM[i][1]),X,Z};};
const liveBK:Gen=T=>({pose:blendPose(keeperSet(T),celebrate(T*1.1,{kind:'arms'}),.8),yaw:FACE_RIGHT,X:-18.6,Z:10});
/** Sporting (green hoops): heads down, walking back toward the halfway line; their keeper crouched, hands on his knees */
const SCP_FROM:[number,number][]=[[14.4,8.4],[16.8,13.8],[12.2,11.6],[17.4,6.9]];
const DOWN=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:42,lShA:10,rShA:10,lShF:6,rShF:6,lElb:26,rElb:26});
const liveS=(i:number):Gen=>T=>{const d=Math.max(0,T-.6-i*.3)*(.9+.12*i),X=SCP_FROM[i][0]-d,Z=SCP_FROM[i][1]+Math.sin(i*2+d*.4)*.3,walk=clamp(d*3);
 let pose=blendPose(stand(),runCycle(T*1.1+i*.37,{speed:.05}),walk);pose=blendPose(pose,DOWN,.6);
 return{pose,yaw:FACE_LEFT+[.2,-.3,.1,-.15][i],X,Z};};
const CROUCH=posed({lHipF:62,rHipF:62,lKnee:72,rKnee:72,lHipA:14,rHipA:14,lean:44,neckP:30,lShF:38,rShF:38,lShA:14,rShA:14,lElb:12,rElb:12});
const liveK:Gen=T=>({pose:blendPose(CROUCH,posed({lHipF:8,rHipF:8,lKnee:10,rKnee:10,lean:8,neckP:30,lShA:40,rShA:40,lShF:-20,rShF:-20,lElb:110,rElb:110}),sm(C1.three,C1.hat+.5,T,easeIO)),yaw:FACE_LEFT+.4,X:GX-.9,Z:10.6+.3*sm(C1.three,C1.hat+.5,T)});
/** the main-stand broadcast camera: 17 m outside the near touchline, 9 m up; the stage pans with the focus (x) */
const bst=(camX:number):Stage=>({F:4200,eye:9,cx:camX,cz:-17});
const liveCam=(T:number)=>{const h=liveH(T);
 const fx=key(T,mono([[0,11],[C1.yer+.3,12.5],[C1.play,14],[C1.piv,h.X-1],[C1.hat,liveH(C1.hat).X-.6],[C1.end,liveH(C1.hat).X-1.4]]),easeInOutSine),
  fz=key(T,mono([[0,10],[C1.play,8.4],[C1.piv,5.6],[C1.hat,3.7],[C1.end,4.2]]),easeInOutSine),
  zoom=key(T,mono([[0,.56],[C1.play,.6],[C1.piv,.74],[C1.hat,.9],[C1.win,.86],[C1.end,.84]]),easeInOutSine);
 return{fx,fz,zoom};};
/** goal times on a 40-minute clock (Wikipedia line-up box) */
const GOALS:{sec:number;label:string;lift:number}[]=[{sec:10*60+27,label:'10:27',lift:0},{sec:21*60+21,label:'21:21',lift:0},{sec:21*60+58,label:'21:58',lift:1}];
/** the TV-style match timeline (screen space, box units): the Sporting swatch (left), the 0–40 bar, the Benfica swatch, three goal balls,
 *  the full-time score box. g = draw-in (0–1); drops = each ball's landing time; ft = full-time box print (0–1) */
function timeline(s:Sheet,T:number,g:number,drops:number[],ft:number){
 if(g<=.01)return;
 const top=-(s.H/2)/Math.max(1e-6,Math.min(s.W/BOX_W,s.H/BOX_H)*s.arrival);// the visible top edge (box units), so the graphic hugs the top in every window shape
 const y0=Math.max(top+84,-900),x0=-600,W=1120,H=64,slide=(1-easeOut(g))*-300;
 const plate=handCut([[x0-130,y0-60+slide],[x0+W+130,y0-60+slide],[x0+W+130,y0+H+62+slide],[x0-130,y0+H+62+slide]],901,4,40),pp=polyPath(plate,true);
 s.knockout(pp);s.fill(K,pp,.9);
 // the team swatches: Sporting (green with paper hoops) left, Benfica (red) right
 const sw=(x:number,ink:string,hoops:boolean,seed:number)=>{const q=handCut([[x,y0-8+slide],[x+96,y0-8+slide],[x+96,y0+H+8+slide],[x,y0+H+8+slide]],seed,3,30),p=polyPath(q,true);s.knockout(p);s.fill(ink,p);
  if(hoops){const hp=new Path2D();for(let k=0;k<3;k++)hp.rect(x,y0+4+k*24+slide,96,10);s.save();s.clip(p);s.knockout(hp);s.restore();}};
 sw(x0-116,G,true,902);sw(x0+W+20,R,false,903);
 // the bar: a paper track with ticks every 10 minutes and a red half-time mark
 const bar=polyPath(handCut([[x0,y0+H*.3+slide],[x0+W,y0+H*.3+slide],[x0+W,y0+H*.7+slide],[x0,y0+H*.7+slide]],904,2,30),true);s.knockout(bar);
 const ticks=new Path2D();for(let m=0;m<=40;m+=10)ticks.rect(x0+W*m/40-3,y0+H*.12+slide,6,H*.76);s.fill(K,ticks,.7);
 const half=new Path2D();half.rect(x0+W/2-4,y0-6+slide,8,H+12);s.fill(R,half,.9);
 // the goal balls drop onto the bar; the last two are only 37 s apart, so the third rides up on the second
 GOALS.forEach((gl,i)=>{const d=drops[i];if(T<d-.35)return;const u=sm(d-.35,d,T,easeIn),bo=settle(T,d,{amp:1,freq:3,decay:5})*16,x=x0+W*gl.sec/2400+gl.lift*14,yb=y0+H*.5+slide-gl.lift*44,y=lerp(yb-300,yb,u)-Math.abs(bo);
  if(T>=d&&T<d+.4)sparkBurst(s,Y,x,yb,90,{n:8,seed:910+i,g:easeOut(sm(d,d+.25,T))*(1-sm(d+.25,d+.4,T))});
  ball(s,x,y,30,920+i,{rot:u*4});
  if(T>=d&&i!==1){// the times: 10:27 under its ball, "21:21 21:58" under the pair
   const lp=new Path2D(),lh=34,txt=i===0?'10:27':'21:21 21:58',lw=digits(lp,txt,0,0,lh,0,true),cx=i===0?x:x-14;digits(lp,txt,cx-lw/2,y0+H+14+slide,lh,930+i*10);s.knockout(lp);s.fill(Y,lp);}});
 // full time: a score box drops under the right end and prints 3–6 (Sporting 3, Benfica 6)
 if(ft>.01){const bx=x0+W-150,by=y0+H+74+slide-(1-ft)*120,q=handCut([[bx,by],[bx+230,by],[bx+230,by+120],[bx,by+120]],940,4,30),p=polyPath(q,true);s.knockout(p);s.fill(Y,p,.95);s.fill(K,ribbon([...q,q[0]],7,{seed:944,close:true,wobble:1}),.9);
  const n=new Path2D();digits(n,'3',bx+30,by+20,80,941);digits(n,'6',bx+160,by+20,80,942);n.addPath(ribbon([[bx+95,by+60],[bx+135,by+60]],12,{seed:943,taper:0}));s.fill(K,n);}
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.fx),foc=proj(st,c.fx,1,c.fz);
 cam(s,0,foc[1],c.zoom);
 const cheer=.25+.75*sm(C1.yer,C1.play,T);
 court(s,st,IDX,T,{cheer,flash:pulse(T,C1.hat,1.2)*.6,inGoal:()=>{
  // the ball left in the back of the net (inferred), then the keeper
  drawBall(s,st,IDX,{X:GX+.62,Y:BALL_R,Z:10.9,flying:false,spin:1},18);athlete(s,st,liveK,T,SCP_GK,{detail:'low'});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SCP_FROM.forEach((_,i)=>{const g=liveS(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,SCP(i),{detail:'low'})});});
 BEN_FROM.forEach((_,i)=>{const g=liveB(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BEN(i),{detail:'low'})});});
 items.push({z:liveBK(T).Z,draw:()=>athlete(s,st,liveBK,T,BEN_GK,{detail:'low'})});
 const h=liveH(T);
 items.push({z:h.Z,draw:()=>{
  // "Their pivot": a yellow ring stamps round him on the floor; "hat trick": three balls pop in an arc over his head
  const ring=easeOutBack(sm(C1.piv,C1.piv+.35,T))*(1-sm(C1.hat+.3,C1.hat+.8,T));floorDashRing(s,st,IDX,Y,h.X,h.Z,.9,9,101,ring);
  athlete(s,st,liveH,T,HIGOR,{detail:'mid'});
  if(T>=C1.hat-.1){const sk=solve(h.pose,BUILD,placeAt(h.X,h.Z,h.yaw)),hd=toMine(sk.head),k=kAt(st,hd[2]);
   for(let i=0;i<3;i++){const u=easeOutBack(sm(C1.hat-.1+i*.18,C1.hat+.25+i*.18,T)),a=-Math.PI/2+(i-1)*.62,p=proj(st,hd[0],hd[1],hd[2]);if(u<=.02)continue;
    ball(s,p[0]+Math.cos(a)*k*.62*u,p[1]+Math.sin(a)*k*.62*u-k*.18,Math.max(12,k*.16*u),130+i,{rot:T*2+i});}}}});
 items.sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
 // the TV graphic, fixed on the screen: slides in on "Benfica play", a ball drops on each goal time from "three goals", 3–6 on "Benfica win"
 cam(s,0,0,1);
 timeline(s,T,sm(C1.play-.1,C1.play+.5,T),[C1.three+.05,C1.three+.4,C1.three+.62],sm(C1.win,C1.win+.4,T,easeOut));
 cam(s,0,foc[1],c.zoom);
}
/** a figure's chest on a stage (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,xf:Xf=IDX):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=P3(st,xf,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,depthOf(xf,ch[0],ch[2])),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).fx),liveH(tt),.14));},still:C1.hat+.35};

// ================= the demonstration (chapters 2–3): back to goal, low and wide, the defender reaches round, drag, turn left, shoot =================
const C2={back:A(1,'Back to goal'),low:A(1,'low and wide'),body:A(1,'his body'),reach:A(1,'reaches round'),turn:A(1,'turns the other'),shoots:A(1,'and shoots'),end:AUTH[1].seconds};
/** Higor holds at PV facing −X (back to goal); the defender tight behind him (goal side), also facing −X. His right is +Z, his left −Z. */
const PV:[number,number]=[12.8,10.25],DEF:[number,number]=[PV[0]+.8,PV[1]+.05];
/** the shot: after the turn the ball sits toward goal on his left (−Z) side; low inside the near post (keeper's left) */
const TGT:V3=[GX+.05,.3,POST_N+.5];
const BALL_SH:[number,number]=[PV[0]+.42,PV[1]-.72];
const YAW_SH=yawTo(TGT[0]-BALL_SH[0],TGT[2]-BALL_SH[1]);
const SB=toMine(strikeBall(YAW_SH)),PLANT:[number,number]=[BALL_SH[0]-SB[0],BALL_SH[1]-SB[2]];
const T_ARR=C2.back-.05,T_R0=C2.reach-.15,T_R1=C2.reach+.4,T_SP0=C2.turn-.12,T_SP1=T_SP0+.72,T_SH=C2.shoots+.04,T_SIN=T_SH+.34;
/** ready: sitting back into the defender, arms a little out */
const HOLD=posed({lHipF:30,rHipF:30,lKnee:44,rKnee:44,lHipA:12,rHipA:12,lean:22,pitch:3,neckP:14,lShF:-14,rShF:-14,lShA:36,rShA:36,lElb:40,rElb:40});
/** THE SHIELD: low and wide (feet wider than the hips, knees bent), back into him, arms out and bent, a glance over the left shoulder */
const SHIELD=posed({lHipF:34,rHipF:34,lKnee:64,rKnee:64,lHipA:26,rHipA:26,lHipR:16,rHipR:16,lean:30,pitch:6,neckP:10,neckY:48,lShF:-34,rShF:-26,lShA:52,rShA:48,lElb:44,rElb:40});
/** the left arm reaches back onto the defender as he comes round (feel him, don't push) */
const SHIELD_ARM=posed({lHipF:34,rHipF:30,lKnee:64,rKnee:60,lHipA:26,rHipA:22,lHipR:16,rHipR:12,lean:28,pitch:6,twist:10,neckP:8,neckY:70,lShF:-60,lShA:30,lElb:20,rShF:-20,rShA:52,rElb:44});
/** mid-turn: weight on the LEFT foot, the right sole drags the ball across, shoulders lead the turn to his left */
const TURN=posed({lHipF:22,lKnee:44,lHipA:10,rHipF:40,rHipA:-8,rHipR:-12,rKnee:58,rAnk:-10,lean:18,twist:28,neckY:40,neckP:10,lShA:60,rShA:50,lElb:40,rElb:46,squash:-.04});
const demoH:Gen=t=>{
 let X=PV[0],Z=PV[1],pose:Pose,yaw=FACE_LEFT;
 if(t<T_ARR){pose=blendPose(backpedal(t*1.1),HOLD,.6+.2*Math.sin(t*2));X+=.1*Math.sin(t*1.5);}
 else if(t<T_SP0){pose=blendPose(HOLD,SHIELD,sm(C2.low-.1,C2.low+.35,t,easeIO));pose=blendPose(pose,SHIELD_ARM,sm(T_R0,T_R1,t,easeIO)*(1-.5*sm(T_R1+.3,T_SP0,t)));
  X+=.06*sm(C2.low,C2.low+.4,t)+.05*Math.sin(t*3)*sm(C2.low,C2.body,t)*(1-sm(T_R0,T_R1,t));Z-=.08*sm(T_R0,T_R1,t);}// he sits back into him and leans off the reaching side
 else if(t<T_SP1){const u=sm(T_SP0,T_SP1,t,easeIO);pose=keyPoses(t,[[T_SP0,blendPose(SHIELD,SHIELD_ARM,.5)],[lerp(T_SP0,T_SP1,.48),TURN],[T_SP1,strike(.24,{foot:'r'})]]);
  yaw=lerp(FACE_LEFT,YAW_SH+TAU,u);X=lerp(PV[0]+.06,PLANT[0],u);Z=lerp(PV[1]-.08,PLANT[1],u);}
 else{const st=key(t,[[T_SP1,.24],[T_SH,STRIKE_CONTACT],[T_SH+.6,.95]],linear);pose=strike(st,{foot:'r'});yaw=YAW_SH+TAU;X=PLANT[0]+.2*sm(T_SH,T_SH+.5,t);Z=PLANT[1];
  if(t>T_SIN+.5){const u=sm(T_SIN+.5,T_SIN+1.1,t,easeIO);pose=blendPose(pose,celebrate((t-T_SIN-.5)*1.2,{kind:'arms'}),u);yaw=lerp(YAW_SH+TAU,TAU-1.3,u);}}
 return{pose,yaw,X,Z};
};
/** the ball: played in along the floor from the halfway side → stopped under his right sole → kept out in front (away from the defender)
 *  → dragged across to his left and round as he turns → struck */
function demoBall(t:number):BallS{
 const front=(p:{X:number;Z:number;yaw:number},r:number,side=0):[number,number]=>[p.X+Math.cos(p.yaw+side)*r,p.Z+Math.sin(p.yaw+side)*r];
 if(t<T_ARR){const u=sm(T_ARR-1.2,T_ARR,t,easeOut),end=front(demoH(T_ARR),.5,-.2);return{X:lerp(end[0]-9,end[0],u),Y:BALL_R,Z:lerp(end[1]+.8,end[1],u),flying:false,spin:u*12};}
 if(t<T_SP0){const p=demoH(t),side=lerp(-.2,-.05,sm(C2.low,C2.low+.4,t))-.3*sm(T_R0,T_R1,t);// as he comes round the right (+Z), the sole rolls it a touch the other way (−Z)
  const f=front(p,lerp(.5,.56,sm(C2.low,C2.low+.4,t)),-side);return{X:f[0],Y:BALL_R,Z:f[1],flying:false,spin:t*.4};}
 if(t<T_SP1){const u=sm(T_SP0,T_SP1,t,easeIO),p=demoH(t),a=lerp(FACE_LEFT+.35,YAW_SH+TAU-.05,u),r=lerp(.56,.5,u),o:[number,number]=[p.X+Math.cos(a)*r,p.Z+Math.sin(a)*r],w=sm(.72,1,u);
  return{X:lerp(o[0],BALL_SH[0],w),Y:BALL_R,Z:lerp(o[1],BALL_SH[1],w),flying:false,spin:u*6};}
 if(t<T_SH)return{X:BALL_SH[0],Y:BALL_R,Z:BALL_SH[1],flying:false,spin:6};
 if(t<T_SIN){const u=sm(T_SH,T_SIN,t,linear),M:V3=[lerp(BALL_SH[0],TGT[0],.5),.4,lerp(BALL_SH[1],TGT[2],.5)],a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;
  return{X:a*BALL_SH[0]+b*M[0]+c*TGT[0],Y:a*BALL_R+b*M[1]+c*TGT[1],Z:a*BALL_SH[1]+b*M[2]+c*TGT[2],flying:true,spin:20+u*30};}
 const d=sm(T_SIN,T_SIN+.3,t,easeOut);return{X:lerp(TGT[0],GX+.62,d),Y:lerp(TGT[1],BALL_R,sm(T_SIN+.1,T_SIN+.4,t)),Z:TGT[2]-.08*d,flying:false,spin:40};
}
/** the defender: tight on his back; on "reaches round" he steps round the RIGHT (+Z) side and jabs his right leg in; stranded as Higor turns away */
const DEF_POSE=posed({lHipF:30,rHipF:30,lKnee:44,rKnee:44,lean:22,lShF:40,rShF:34,lShA:22,rShA:22,lElb:30,rElb:40,neckP:16});
const demoD:Gen=t=>{
 const reach=sm(T_R0,T_R1,t,easeIO),stranded=sm(T_SP0+.15,T_SP1+.4,t,easeIO);
 let pose=blendPose(backpedal(t*1.1),DEF_POSE,.72);
 pose=blendPose(pose,lunge(key(t,[[T_R0,0],[T_R1,.6],[T_SP1,.75]],linear),{side:'r'}),reach);
 pose=blendPose(pose,posed({lHipF:24,rHipF:40,lKnee:40,rKnee:36,lean:14,twist:-24,neckY:80,neckP:0,lShA:34,rShA:44,lElb:30,rElb:30}),stranded*.75);
 return{pose,yaw:FACE_LEFT-.45*reach+.9*stranded,X:DEF[0]-.18*reach,Z:DEF[1]+.3*reach+.15*stranded};
};
const demoK:Gen=t=>{let pose=keeperSet(t*1.2);if(t>=T_SH+.06)pose=blendPose(pose,keeperDive(sm(T_SH+.06,T_SH+.8,t,linear)*.95,{side:'l',height:.12}),sm(T_SH+.06,T_SH+.14,t));
 return{pose,yaw:FACE_LEFT-.18,X:GX-.85,Z:lerp(10.1,9.8,sm(T_SP0,T_SH,t,easeIO))};};
const DEMO_SMEAR=(t:number)=>(t>T_SP0&&t<T_SP1)||(t>T_SH-.15&&t<T_SH+.2)?.16:0;
/** the shield on the floor: a thick yellow half-ring round his back (the defender's side, +X) with a navy edge — the wall the defender meets */
function shieldPlate(s:Sheet,st:Stage,xf:Xf,h:{X:number;Z:number},g:number,seed:number,cov=.9){
 if(g<=.02)return;const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=-Math.PI/2*g+k/14*Math.PI*g;pts.push(P3(st,xf,h.X+Math.cos(a)*.62,0,h.Z+Math.sin(a)*.62));}
 const w=Math.max(8,kAt(st,depthOf(xf,h.X,h.Z))*.16),rp=ribbon(pts,w,{seed,taper:.15,wobble:1});s.knockout(rp);s.fill(Y,rp,cov);s.fill(K,ribbon(pts,w*.25,{seed:seed+1,taper:.15,wobble:1}),.7);
}

// ================= chapter 2 — HOW HE DOES IT: the far-touchline camera, real time, the goal on the LEFT =================
/** the reverse broadcast angle: 11 m outside the far touchline, 4.2 m up */
const st2:Stage={F:1700,eye:4.2,cx:-PV[0],cz:-11};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,xf=ROT;
  const g0=P3(st,xf,PV[0],1,PV[1]),gG=P3(st,xf,GX-1,1,10),bl=P3(st,xf,PV[0]-6,1,PV[1]+.5);
  camPath(s,t,[[0,lerp(bl[0],g0[0],.5),g0[1]+10,1.5],[C2.back,g0[0]+10,g0[1]+10,2.0],[C2.low,g0[0],g0[1]+5,2.45],[C2.body,g0[0]-10,g0[1],2.55],[C2.reach,g0[0]-20,g0[1],2.5],
   [C2.turn,g0[0]-60,g0[1]+5,2.2],[C2.shoots,lerp(g0[0],gG[0],.55),g0[1]+10,1.55],[C2.end,lerp(g0[0],gG[0],.55),g0[1]+10,1.5]],[4*pulse(t,T_SH,.3)*Math.sin(t*80),0]);
  const b=demoBall(tt),goal=tt>=T_SIN;
  court(s,st,xf,tt,{cheer:goal?.8:.1,flash:pulse(tt,T_SIN,1.2),bulge:.4*sm(T_SIN-.1,T_SIN,tt)*(1-.6*sm(T_SIN+.2,T_SIN+1,tt)),bz:TGT[2],by:TGT[1],
   inGoal:()=>athlete(s,st,demoK,tt,DEMO_K,{xf,detail:'mid'})});
  const h=demoH(tt),d=demoD(tt);
  // "Back to goal": a navy dashed arrow from his back toward the goal; "low and wide": a yellow bracket between his feet;
  // "his body": the yellow shield plate; "reaches round": a red arrow of the defender's reach; "turns the other": a yellow turn arc; the shot line
  const bg=sm(C2.back,C2.back+.45,tt,easeOut)*(1-sm(C2.low+.2,C2.low+.6,tt));
  if(bg>.02){const pts:Pt[]=[];for(let k=0;k<=8;k++)pts.push(P3(st,xf,lerp(PV[0]+1.4,GX-.5,k/8),0,lerp(PV[1],10,k/8)));dashed(s,K,pts,10,201,{dash:34,progress:bg});if(bg>.9)arrowHead(s,K,pts,30,202);}
  const wg=easeOutBack(sm(C2.low,C2.low+.35,tt))*(1-sm(C2.body+.2,C2.body+.6,tt));
  if(wg>.02){const a=P3(st,xf,PV[0],0,PV[1]-.55*wg),c=P3(st,xf,PV[0],0,PV[1]+.55*wg),rp=ribbon([a,L2(a,c,.5),c],9,{seed:203,taper:0,wobble:1});s.knockout(rp);s.fill(Y,rp);
   for(const e of[a,c]){const tk=ribbon([[e[0],e[1]-18],[e[0],e[1]+18]],8,{seed:204,taper:0});s.knockout(tk);s.fill(Y,tk);}}
  const rg=sm(C2.reach,C2.reach+.45,tt,easeOut)*(1-sm(T_SP1,T_SP1+.4,tt));
  if(rg>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=-.1+k/10*1.5;pts.push(P3(st,xf,PV[0]+Math.cos(a)*.95,0,PV[1]+Math.sin(a)*.95));}const q=partial(pts,rg),rp=ribbon(q,11,{seed:205,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(rg>.6)arrowHead(s,R,q,28,206);}
  const tg=sm(C2.turn-.15,C2.turn+.45,tt,easeOut)*(1-sm(T_SH+.4,T_SH+.8,tt));
  if(tg>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=lerp(FACE_LEFT+.2,YAW_SH+TAU,k/14);pts.push(P3(st,xf,PV[0]+Math.cos(a)*1.05,0,PV[1]+Math.sin(a)*1.05));}dashed(s,Y,pts,12,207,{dash:34,progress:tg});if(tg>.9)arrowHead(s,Y,pts,32,208);}
  if(tt>=T_SH){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=demoBall(lerp(T_SH,Math.min(tt,T_SIN),k/12));pts.push(P3(st,xf,q.X,0,q.Z));}dashed(s,Y,pts,8,209,{dash:28});}
  // figures back to front (stage depth); the ball slots in by depth; the shield plate sits between him and the defender
  const sg=sm(C2.body-.05,C2.body+.4,tt,easeOutBack)*(1-sm(C2.reach+.2,T_SP0,tt));
  const items:{z:number;draw:()=>void}[]=[
   {z:depthOf(xf,d.X,d.Z),draw:()=>athlete(s,st,demoD,tt,DEMO_D,{xf,detail:'high',smear:tt>T_R0&&tt<T_R1?.12:0})},
   {z:99,draw:()=>shieldPlate(s,st,xf,h,sg,210)},
   {z:depthOf(xf,h.X,h.Z)-.02,draw:()=>athlete(s,st,demoH,tt,HIGOR_T,{xf,detail:'high',smear:DEMO_SMEAR(tt)})},
   {z:depthOf(xf,b.X,b.Z)-.03,draw:()=>{drawBall(s,st,xf,b,211,{smear:b.flying?.35:0,dir:Math.PI});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=T_SIN&&tt<T_SIN+.6){const p=P3(st,xf,TGT[0],TGT[1],TGT[2]);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:212,g:easeOut(sm(T_SIN,T_SIN+.3,tt))*(1-sm(T_SIN+.35,T_SIN+.6,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,demoH(tt),.14,ROT));},
 still:C2.reach+.3,
};

// ================= chapter 3 — WATCH AGAIN: slow motion, a knee-high camera 4 m away on the main-stand side; the shield =================
const C3={watch:A(2,'Watch again'),def:A(2,'The defender'),get:A(2,'get to the'),body:A(2,'His body'),shield:A(2,'the shield'),end:AUTH[2].seconds};
/** replay seconds → demo seconds: slow motion (≈0.3–0.7×, never faster than real time) from just before the reach to just after the shot */
const repT=(t:number)=>key(t,[[0,T_R0-.75],[C3.def,T_R0],[C3.get,T_R1-.05],[C3.body,T_R1+.35],[C3.shield,T_SP0-.05],[C3.end,T_SH+.45]],linear);
const stR:Stage={F:1150,eye:.8,cx:PV[0]+.3,cz:PV[1]-4.3};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),T=repT(tt),st=stR,xf=IDX;
  const g0=proj(st,PV[0]+.35,.95,PV[1]),gs=proj(st,BALL_SH[0]+.8,.7,BALL_SH[1]);
  camPath(s,t,[[0,g0[0]+60,g0[1]-10,1.08],[C3.def,g0[0]+80,g0[1]-10,1.14],[C3.get,g0[0]+60,g0[1]+10,1.2],[C3.body,g0[0]+20,g0[1]-10,1.14],[C3.shield,g0[0]+40,g0[1],1.08],[C3.end,lerp(g0[0],gs[0],.8)+120,g0[1]+10,.96]],
   [5*pulse(T,T_SH,.4)*Math.sin(t*90),0]);
  const b=demoBall(T);
  court(s,st,xf,T,{cheer:T>=T_SIN?.7:.05,flash:pulse(T,T_SIN,1),inGoal:()=>athlete(s,st,demoK,T,DEMO_K,{xf,detail:'mid'})});
  const h=demoH(T),d=demoD(T);
  // "The defender": a red dashed ring round the defender's reaching (right) foot; "get to the": a red stop bar where his reach meets the hips
  const dsk=solve(d.pose,{height:1.84,bulk:1.05},placeAt(d.X,d.Z,d.yaw)),rf=toMine(dsk.rToe);
  const rr=easeOutBack(sm(C3.def,C3.def+.35,tt))*(1-sm(C3.body,C3.body+.4,tt));floorDashRing(s,st,xf,R,rf[0],rf[2],.32,7,301,rr);
  const items:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,demoD,T,DEMO_D,{xf,detail:'high',smear:T>T_R0&&T<T_R1?.14:0})},
   {z:h.Z+.02,draw:()=>athlete(s,st,demoH,T,HIGOR_T,{xf,detail:'high',smear:DEMO_SMEAR(T)})},
   {z:b.Z-.04,draw:()=>{const o=drawBall(s,st,xf,b,311,{smear:b.flying?.35:0,dir:0});
    // "His body": the ball glows safe on the far side of him
    const gl=sm(C3.body,C3.body+.3,tt)*(1-sm(C3.shield+.6,C3.shield+1,tt));if(gl>.02)s.fill(Y,ribbon(blob(o.p[0],o.p[1],o.r*1.7,o.r*1.7,312,{n:18}),Math.max(4,o.r*.22),{seed:313,close:true,wobble:1}),gl);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  const bar=sm(C3.get,C3.get+.25,tt,easeOutBack)*(1-sm(C3.body+.3,C3.body+.6,tt));
  if(bar>.02){const hs=solve(h.pose,BUILD,placeAt(h.X,h.Z,h.yaw)),pv=toMine(hs.pelvis),c=proj(st,pv[0]+.28,.45,pv[2]+.1),L=110*bar,p=ribbon([[c[0],c[1]-L],[c[0],c[1]+L]],16,{seed:314,taper:0,wobble:1});s.knockout(p);s.fill(R,p);
   sparkBurst(s,R,c[0],c[1],60,{n:8,seed:315,g:Math.min(1,bar)});}
  // "the shield": the yellow shield plate prints on his back (in front of the defender, behind him)
  const sh=sm(C3.body-.1,C3.body+.35,tt,easeOutBack)*(1-sm(C3.shield+.9,C3.shield+1.3,tt));
  if(sh>.02){const hs=solve(h.pose,BUILD,placeAt(h.X,h.Z,h.yaw)),ch=toMine(hs.chest),c=proj(st,ch[0]+.3,ch[1]-.05,ch[2]),k=kAt(st,ch[2])*.62*sh,
   q:Pt[]=[[-.5,-.62],[.5,-.62],[.5,.05],[0,.72],[-.5,.05]].map(v=>[c[0]+v[0]*k,c[1]+v[1]*k] as Pt),sm2=smoothPts(q,true,6,2.4),p=polyPath(sm2,true);
   s.fill(Y,p,.48);s.fill(K,ribbon([...sm2,sm2[0]],Math.max(5,k*.07),{seed:316,close:true,wobble:1}),.9);
   const stamp=pulse(tt,C3.shield,.6);if(stamp>.05)sparkBurst(s,Y,c[0],c[1],k*1.5,{n:10,seed:317,g:Math.min(1,stamp*1.4)});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(stR,demoH(repT(tt)),.12));},
 still:C3.body+.3,
};

// ================= chapter 4 — YOUR TURN: the defender circles behind him; he keeps his back to him, the ball on the far side; cards; a tick =================
const C4={turn:A(3,'Your turn'),low:A(3,'Stay low'),body:A(3,'your body'),protect:A(3,'protect the ball'),end:AUTH[3].seconds};
const P4:[number,number]=[.1,4.3];
/** the defender's angle round him on the floor (always on the far side, +Z, so the camera sees Higor's front): he circles from one side to the other */
const ang4=(t:number)=>key(t,[[0,2.5],[C4.low,2.45],[C4.body,2.0],[C4.protect,1.2],[C4.protect+.9,1.0],[C4.end,1.05]],easeInOutSine);
const practiceD:Gen=t=>{const a=ang4(t),X=P4[0]+Math.cos(a)*.82,Z=P4[1]+Math.sin(a)*.82,poke=pulse(t,C4.body+.1,.5)+pulse(t,C4.protect+.05,.5);
 let pose=blendPose(backpedal(t*1.3),DEF_POSE,.7);pose=blendPose(pose,lunge(.55,{side:'r'}),Math.min(1,poke*1.2));
 return{pose,yaw:yawTo(P4[0]-X,P4[1]-Z),X,Z};};
const practiceH:Gen=t=>{const a=ang4(t),yaw=a+Math.PI,lowG=sm(C4.low-.2,C4.low+.3,t,easeIO),ok=sm(C4.protect+.9,C4.protect+1.3,t,easeIO);
 let pose=blendPose(HOLD,SHIELD,lowG);pose=blendPose(pose,SHIELD_ARM,sm(C4.body,C4.body+.3,t)*(1-ok)*.8);
 pose=blendPose(pose,posed({lHipF:30,rHipF:30,lKnee:52,rKnee:52,lHipA:20,rHipA:20,lean:22,neckP:6,neckY:30,lShA:48,rShA:48,lShF:-20,rShF:-20,lElb:44,rElb:44}),ok*.6);
 return{pose,yaw,X:P4[0]-Math.cos(a)*.04*Math.sin(t*3),Z:P4[1]};};
/** the ball always sits on the side away from the defender */
function practiceBall(t:number):[number,number]{const p=practiceH(t);return[p.X+Math.cos(p.yaw-.12)*.5,p.Z+Math.sin(p.yaw-.12)*.5];}
const st4:Stage={F:1500,eye:2.3,cx:.2,cz:-2.4};
const CARD_Y=820,CARD_W=190,CARDS:[number,number,'low'|'shield'|'arm'][]=[[-420,C4.low+.05,'low'],[0,C4.body-.1,'shield'],[420,C4.protect-.1,'arm']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,90,380,1.12],[C4.low-.4,70,420,1.08],[C4.low+.3,40,610,.94],[C4.protect+.9,40,610,.94],[C4.protect+1.5,80,420,1.2],[C4.end,90,400,1.24]]);
  court(s,st,IDX,tt,{cheer:.7*pulse(tt,C4.protect+1.1,1.4)});
  const[bx,bz]=practiceBall(tt),bp=proj(st,bx,BALL_R,bz),br=kAt(st,bz)*BALL_R,h=practiceH(tt),d=practiceD(tt);
  // the defender's circling path, a red dashed arc behind him; the shield plate on "your body"
  const arcG=sm(C4.body-.3,C4.body+.2,tt)*(1-sm(C4.protect+1,C4.protect+1.4,tt));
  if(arcG>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=lerp(2.6,.8,k/12);pts.push(proj(st,P4[0]+Math.cos(a)*1.15,0,P4[1]+Math.sin(a)*1.15));}dashed(s,R,pts,8,401,{dash:26,progress:arcG});}
  const items:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,practiceD,tt,DEMO_D,{detail:'high'})},
   {z:h.Z+.001,draw:()=>athlete(s,st,practiceH,tt,HIGOR_T,{detail:'high'})},
   {z:bz-.05,draw:()=>{shadow(s,bp[0],proj(st,bx,0,bz)[1],br*1.15,br*.3,402,.45);ball(s,bp[0],bp[1],br,403,{rot:tt*2});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Stay low", each prints one step with a small figure; they drop after "protect the ball"
  const rise=sm(C4.low-.2,C4.low+.4,tt,easeOut),drop=sm(C4.protect+.6,C4.protect+1,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y+230+dy],[cx-CARD_W,CARD_Y+230+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.16);
   CARDS.forEach(([cx,t0c,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+175;
    const fc=figureCam({x:cx+10,y:gy,height:400*(.9+.1*on),azimuth:0,elevation:12,fov:16,at:[0,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    // side view, facing +x: low = a yellow bracket between wide feet; shield = the plate on his back; arm = a red ring where the defender is
    if(kind==='low'){const a=Pc([0,0,-.4]),c=Pc([0,0,.4]);s.fill(Y,ribbon([a,c],10,{seed:84,taper:0,wobble:1}),.95);}
    if(kind==='shield'){const q=[[-.72,1.55,0],[-.36,1.55,0],[-.3,1.0,0],[-.5,.45,0],[-.72,1.0,0]].map(v=>Pc(v as V3)),sp=smoothPts(q,true,6,2.4);s.fill(Y,polyPath(sp,true),.5);s.fill(K,ribbon([...sp,sp[0]],6,{seed:85,close:true,wobble:1}),.9);}
    if(kind==='arm'){const c=Pc([-.75,0,0]);s.fill(R,ribbon(blob(c[0],c[1],70,24,86,{n:18}),7,{seed:87,close:true,wobble:1}),.9);}
    const bpc=Pc([.5,BALL_R,0]);ball(s,bpc[0],bpc[1],15,81+i);
    drawAthlete(s,kind==='arm'?SHIELD_ARM:kind==='shield'?SHIELD:blendPose(SHIELD,HOLD,.2),fc,{...HIGOR_T,detail:'mid',shadow:[K,.2]},{},{prev:SHIELD});
    s.restore();});
   s.fill(K,frames);}
  // a big tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.protect+1,C4.protect+1.35,tt));
  if(tick>.02){const g=proj(st,h.X,0,h.Z),hh=kAt(st,h.Z)*1.8,c:Pt=[g[0]+hh*.7,g[1]-hh*.72],S=hh*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.body+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'higor-futsal-signature',format:'futsal',title:'Higor’s strong turn',theme:'Use your body as a shield to protect the ball from behind.',
 ageNote:'For players aged 7–12: the 2024 hat-trick is real; the shield and turn are shown as a demonstration. Practise it with a friend.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball with a yellow shield arc swinging round behind it and a red ring squeaking out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),sw=easeOut(u);
  if(u<1){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=Math.PI*.3+sw*Math.PI*1.1*k/12;pts.push([x+Math.cos(a)*r*1.8,y-Math.sin(a)*r*1.1]);}s.fill(Y,ribbon(pts,12*(1-u)+4,{seed,taper:.3,wobble:1}),1);
   s.fill(R,ribbon(blob(x,y+r*.9,r*(1+1.6*u),r*(.3+.5*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(x,y+r*.95,r,r*.2,seed+2,{n:16}),true),.32);
  ball(s,x,y,r,seed,{rot:age*6*(1-u)});
 },
};
export default film;
