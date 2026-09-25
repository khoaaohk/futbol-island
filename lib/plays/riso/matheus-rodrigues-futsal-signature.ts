/** Matheus Rodrigues — "the Brazilian wing trick": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Matheus Rodrigues Cézar da Silva, the Brazilian ala (winger) of FC Barcelona — the card's player (country Brazil in
 * lib/town/playerAppearance.json; bio: "Brazilian ala who won titles with Corinthians before joining FC Barcelona in 2020"). Wikipedia
 * confirms the same man: born 3 Oct 1996, São Paulo; 1.85 m; winger; Corinthians 2016–2020, FC Barcelona 2020–; Brazil since 2018.
 * (Not a namesake: Barça's goal lists name him "Matheus Rodrigues"; "Matheus Preá", "Matheus Barichello" etc. are other players.)
 *
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature (the Brazilian wing trick: params side left, trick elastico), not one
 * match. His best-documented big-match goal we could reach in writing is the WINNER of the 2023–24 UEFA Futsal Champions League semi-final:
 * FC Barcelona 5–4 Sporting CP, 3 May 2024, Demirchyan Arena, Yerevan. The goal list shows the game level at 4–4 (Tatinho 23:58) until
 * Matheus Rodrigues scored at 31:10, the last goal of the match. No written source we could reach describes HOW that goal was scored (the
 * UEFA match page is a script shell), so the film follows the brief's fallback rule: the real-match chapter shows ONLY confirmed things
 * (the city, the teams, the round, the documented goal sequence and the 5–4 result, a celebration) and never stages a goal; the trick itself
 * is a separate, clearly labelled demonstration ("Here’s how he does it", plain training tops, no club and no match claimed).
 * (No other futsal film uses this match: Higor's film uses the 2024 third-place match; Pito/Ferrão the 2022 final; Adolfo the 2022 semi.)
 *  1  LIVE (broadcast camera HIGH in the main stand, real time, no ball in play): Yerevan, the semi-final. Matheus runs off celebrating and
 *     knee-slides toward the near touchline, team-mates pile in, Sporting's players walk away. A TV-style match-timeline graphic (Barça swatch
 *     left, Sporting right) drops each goal on its minute — Barça's above the bar, Sporting's below — a score box reads 4–4, then his ball
 *     lands on 31:10 and the box flips to 5–4.
 *  2  HOW HE DOES IT (demonstration, real time; reverse angle from the FAR touchline, 4 m up, goal on the LEFT): on the left wing he runs at
 *     the defender at speed; the OUTSIDE of his left foot pushes the ball out toward the touchline, the defender bites that way; the INSIDE of
 *     the same foot snaps it back in (the elastico); he goes past on the inside and shoots low across the keeper, left foot, far post.
 *  3  WATCH AGAIN (slow-motion replay; a knee-high pitch-side camera 5 m away): the out-and-in touch, the defender's weight going the wrong way.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Tricks work best when you do them at speed and with a purpose."): a practice run from
 *     the main-stand side: sprint at a training mannequin, the trick at speed, then straight to goal; three cards (speed, trick, goal); a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2023–24 UEFA Futsal Champions League" (raw, cached by an earlier film): SF 2, 3 May 2024, 18:00, Demirchyan Arena, Yerevan:
 *    FC Barcelona 5–4 Sporting CP; Barça goals Rafa Félix 8:20 (o.g.), Adolfo 8:48, A. Pérez 18:21, Catela 21:28, Matheus Rodrigues 31:10;
 *    Sporting goals Tomás Paçó 0:54, Zicky Té 16:32, Neves 17:22, Tatinho 23:58. (Final: Barcelona 1–5 Palma, 5 May — not used.)
 *    — https://en.wikipedia.org/wiki/2023%E2%80%9324_UEFA_Futsal_Champions_League
 *  - Wikipedia, "Matheus Rodrigues" (raw, fetched Sep 2026): full name, born 3 Oct 1996 in São Paulo, 1.85 m, winger, club number 3,
 *    Corinthians 2016–20, FC Barcelona 2020–, Brazil 2018–. — https://en.wikipedia.org/wiki/Matheus_Rodrigues
 *  - UEFA.com, "Barça 4-0 Sporting CP" (1 May 2022, cached): "Matheus Rodrigues clipped a post" — the same Barça ala (context only).
 *  - UEFA.com match page 2040529 (Barça v Sporting CP, 2023/24) fetched: a JS shell with no report text.
 * CONFIRMED (the only facts in the narration): the city and year, Barcelona v Sporting in a futsal Champions League semi-final, the score
 *  going to 4–4, Matheus Rodrigues scoring Barça's fifth goal (31:10), the 5–4 win.
 * INFERRED (not named in the narration): kits — Barça navy with red stripes / navy shorts / red socks, Sporting green-and-white hoops / dark
 *  shorts / green socks, the keepers' colours; the warm court colour; the look of the timeline graphic (a TV-style illustration, not the real
 *  broadcast graphic); which end the goals went in, how and where he celebrated (the knee slide), who joined him; the ball left in the net;
 *  his LEFT foot (card bio: "a powerful left-footer"; not in the written sources we reached — the narration says only "one foot"); the
 *  elastico as his wing trick (card data: trick "elastico", side "left"); his short dark hair (card: fade); no shirt numbers. No video was
 *  reviewed. Chapters 2–4 demonstrate the trick, not footage of a particular match.
 * Technique (poses): the elastico is one continuous contact with ONE foot: the outside of the foot carries the ball out (the shoulders dip
 *  that way to sell it), then the foot wraps round the ball and the inside snaps it back across the body; the standing leg stays bent so he
 *  can explode off it the other way. It works at speed because the defender has to commit to the first direction.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the snap, the slide and the strike). Choreography lives in court coordinates (X along the court, the demo goal at X = +20;
 *  Z across, the main stand at Z < 0, so an attacker going to +X has his LEFT toward +Z: the left wing is Z ≈ 16–17). Each stage maps it with
 *  a proper rotation (ROT for the far-touchline cameras), so the left foot stays the left foot. Stages are LEFT-handed (X right, Z away), so
 *  `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (floor, lights, arrows), red (Barça stripes, the defender's bite), green (Sporting hoops, the demo keeper), navy (key line,
 *  stands, Barça shirts). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,runCycle,runCadence,dribble,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 *  Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Yerevan 2024',text:'Yerevan, 2024. Barcelona play Sporting in a futsal Champions League semi final. Four all, then Matheus Rodrigues scores the fifth. Barcelona win five four!',tail:2.2,
  cues:['Yerevan','Barcelona play','semi final','Four all','Matheus Rodrigues','the fifth','Barcelona win'],heads:{'Yerevan':'Yerevan 2024','semi final':'Semi-final','Four all':'4–4','the fifth':'31:10','Barcelona win':'5–4'}},
 {label:'How he does it',text:'Here’s how he does it. He runs at the defender, fast. One foot pushes the ball out, then snaps it back in. The defender is fooled, and he shoots!',tail:2.2,
  cues:['He runs','fast','ball out','snaps it back','is fooled','and he shoots'],heads:{'He runs':'At speed','snaps it back':'Out and in','and he shoots':''}},
 {label:'Watch again',text:'Watch again, slowly. Out and back in, one quick touch. The defender leans the wrong way.',tail:2.4,
  cues:['Watch again','Out and back','one quick touch','The defender','wrong way'],heads:{'one quick touch':'One touch','wrong way':'Fooled'}},
 {label:'Your turn',text:'Your turn. Tricks work best when you do them at speed, and with a purpose: get past and score!',tail:2.6,
  cues:['Your turn','Tricks work','at speed','with a purpose','get past'],heads:{'at speed':'Speed','with a purpose':'Purpose','get past':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/matheus-rodrigues-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/matheus-rodrigues-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/matheus-rodrigues-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('matheus: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('matheus: no cue '+w);return c.at;};
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
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
/** court → stage floor transforms. IDX: the main-stand side (the demo goal at X = +20 on the right). ROT: the FAR touchline cameras,
 *  a 180° turn about the court's centre (stage X = −X, stage Z = 20 − Z), so the demo goal is on the LEFT. Both are proper rotations. */
type Xf=(X:number,Z:number)=>[number,number];
const IDX:Xf=(X,Z)=>[X,Z];
const ROT:Xf=(X,Z)=>[-X,20-Z];
/** BEH: a camera BEHIND the attacker looking up the court toward the goal (stage x = 10 − Z, stage z = X): his left (+Z) is screen-left.
 *  FRT: a camera IN FRONT of him, looking back from the goal side (stage x = Z − 10, stage z = −X): his left is screen-right.
 *  Both are proper rotations (quarter turns), so the left foot stays the left foot. */
const BEH:Xf=(X,Z)=>[10-Z,X];
const FRT:Xf=(X,Z)=>[Z-10,-X];
/** stage → court (for the projector's eye) */
const inv=(xf:Xf,a:number,b:number):[number,number]=>xf===ROT?[-a,20-b]:xf===BEH?[b,10-a]:xf===FRT?[-b,a+10]:[a,b];
const P3=(st:Stage,xf:Xf,X:number,Yh:number,Z:number):Pt=>{const[a,b]=xf(X,Z);return proj(st,a,Yh,b);};
const depthOf=(xf:Xf,X:number,Z:number)=>xf(X,Z)[1];

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the floor */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){const{dash=width*4.5,progress=1}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});s.knockout(p);s.fill(ink,p,1);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
/** a solid floor arrow (court coords through xf): ribbon + head */
function floorArrow(s:Sheet,st:Stage,xf:Xf,ink:string,pts:[number,number][],w:number,head:number,seed:number,g:number){
 if(g<=.02)return;const sp=pts.map(p=>P3(st,xf,p[0],0,p[1])),q=partial(smoothPts(sp,false,6),g),rp=ribbon(q,w,{seed,taper:.15,wobble:1});s.knockout(rp);s.fill(ink,rp);if(g>.5)arrowHead(s,ink,q,head,seed+1);}
/** court-floor points (court coords) → runs of stage points in front of the camera (a low camera inside the court clips the near lines) */
function floorRuns(st:Stage,xf:Xf,pts:[number,number][],step=.5):Pt[][]{
 const dense:[number,number][]=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let k=0;k<n;k++)dense.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)]);}dense.push(pts[pts.length-1]);
 const runs:[number,number][][]=[];let cur:[number,number][]=[];for(const p of dense){const q=xf(p[0],p[1]);if(q[1]>st.cz+.4)cur.push(q);else if(cur.length){runs.push(cur);cur=[];}}if(cur.length)runs.push(cur);
 return runs.filter(r=>r.length>1).map(r=>r as unknown as Pt[]);
}
/** a painted line strip (stage floor coords) */
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorRing(st:Stage,xf:Xf,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(P3(st,xf,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorDashRing(s:Sheet,st:Stage,xf:Xf,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,xf,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. xf maps the court onto the stage. */
function projector(st:Stage,xf:Xf=IDX):Projector{const e=inv(xf,st.cx,st.cz);
 return{eye:[e[0],st.eye,-e[1]] as V3,project(p:V3){const[a,b]=xf(p[0],-p[2]),q=proj(st,a,p[1],b);return[q[0],q[1],b-st.cz];},scale(p:V3){return kAt(st,xf(p[0],-p[2])[1]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) on the court (library yaw 0 faces +X; + turns toward +Z here, i.e. to the figure's LEFT) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAM=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.8],[R,.28]];
const BUILD={height:1.85,bulk:1.0};
/** Matheus at Barça (kit inferred: navy with red stripes, navy shorts, red socks), short dark hair, 1.85 m; no shirt number is claimed */
const MAT:AthleteStyle={shirt:K,pattern:'stripes',patternInk:[R,.95],shorts:[K,.9],socks:[R,.95],boots:'paper',skin:SKIN,hair:K,line:K,trim:[R,.85],hairStyle:'short',build:BUILD,seed:9};
/** Matheus in the demonstration and lesson: a plain yellow training top and navy shorts (no club kit, so no match is implied) */
const MAT_T:AthleteStyle={...MAT,shirt:[Y,.95],pattern:'plain',patternInk:undefined,shorts:K,socks:K,trim:K,boots:'paper'};
const BAR=(n:number):AthleteStyle=>({shirt:K,pattern:'stripes',patternInk:[R,.95],shorts:[K,.9],socks:[R,.95],boots:K,skin:[[[Y,.8],[R,.26]],[[Y,.5],[R,.34],[K,.12]],[[Y,.72],[R,.2]]][n%3] as InkFill[],hair:K,line:K,trim:[R,.85],hairStyle:(['short','curly','bald'] as const)[n%3],build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Sporting (kit inferred): green-and-white hoops, dark shorts, green socks; their keeper in yellow; Barça's keeper in green-grey */
const SCP=(n:number):AthleteStyle=>({shirt:G,pattern:'hoops',patternInk:'paper',shorts:K,socks:G,boots:K,skin:[[[Y,.74],[R,.2]],[[Y,.46],[R,.36],[K,.14]]][n%2] as InkFill[],hair:K,line:K,trim:'paper',hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const SCP_GK:AthleteStyle={shirt:[Y,.9],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
const BAR_GK:AthleteStyle={shirt:[G,.55],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.82},seed:62};
/** the demonstration defender and keeper: neutral training kit (no team is claimed in chapters 2–4) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.8,bulk:1.05},seed:77};
const DEMO_K:AthleteStyle={shirt:[G,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
type AOpt={detail?:'auto'|'low'|'mid'|'high';smear?:number;xf?:Xf};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:AOpt={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st,o.xf),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the strike's contact (library coords, place at the origin) for the given foot */
function strikeBall(yaw:number,foot:'l'|'r'):V3{const sk=solve(strike(STRIKE_CONTACT,{foot}),BUILD,{yaw}),toe=foot==='l'?sk.lToe:sk.rToe,an=foot==='l'?sk.lAn:sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

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
function drawBall(s:Sheet,st:Stage,xf:Xf,b:BallS,seed:number,o:{min?:number;smear?:number;dir?:number}={}){
 const[a,z]=xf(b.X,b.Z),p=proj(st,a,b.Y,z),g=proj(st,a,0,z),r=Math.max(o.min??9,kAt(st,z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena ----------------
/** stepped navy rows, lit faces, green / red / paper shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),grn=new Path2D(),reds=new Path2D(),pap=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.2)grn.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.42)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.5)pap.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(G,grn);s.fill(R,reds);s.knockout(pap,.8);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal court (40 × 20 m) seen from one touchline through xf; the far boards and crowd; the demo goal (court X = +20) with its net. */
const BOARDS=21.2,GX=20,POST_N=8.5,POST_F=11.5,GH=2;
/** the court rectangle through xf, clipped in front of the camera (Sutherland–Hodgman against stage z = cz + .4) */
function courtPoly(st:Stage,xf:Xf):Pt[]{const zc=st.cz+.4,src=([[-20,0],[20,0],[20,20],[-20,20]] as [number,number][]).map(p=>xf(p[0],p[1])),out:[number,number][]=[];
 for(let i=0;i<4;i++){const a=src[i],b=src[(i+1)%4],ia=a[1]>=zc,ib=b[1]>=zc;if(ia)out.push(a);if(ia!==ib){const u=(zc-a[1])/(b[1]-a[1]);out.push([lerp(a[0],b[0],u),zc]);}}
 return out.map(q=>proj(st,q[0],0,q[1]));}
function court(s:Sheet,st:Stage,xf:Xf,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;inGoal?:()=>void;goal?:boolean}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1,goal=true}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 // the warm sports floor (inferred colour): yellow + a red tint; the court a shade lighter than the run-off
 s.fill(Y,rectPath(-span,wall,span*2,span),.5);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const c=polyPath(courtPoly(st,xf),true);s.knockout(c,.3);s.fill(Y,c,.55);s.fill(R,c,.08);
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
 if(goal){goalNet(s,st,xf,bulge,bz,by);o.inGoal?.();goalFrame(s,st,xf);}
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

// ---------------- seven-segment digits (the timeline's time and the score box) ----------------
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

// ================= chapter 1 — LIVE: Yerevan 2024, the semi-final; the celebration (no goal staged) + the match timeline =================
const C1={yer:A(0,'Yerevan'),play:A(0,'Barcelona play'),semi:A(0,'semi final'),four:A(0,'Four all'),mat:A(0,'Matheus'),fifth:A(0,'the fifth'),win:A(0,'Barcelona win'),end:AUTH[0].seconds};
/** the celebration (all inferred): Matheus runs from the right-hand box toward the near touchline, arms out, then knee-slides toward the camera */
const M0:[number,number]=[15.9,14.6],SL:[number,number]=[12.9,6.4];
const SL_YAW=Math.atan2(SL[1]-M0[1],SL[0]-M0[0]);
const T_RUN0=.3,T_SL=C1.mat-.15,T_SLE=T_SL+1.3;
const SL_END:[number,number]=[SL[0]+Math.cos(SL_YAW)*2.5,SL[1]+Math.sin(SL_YAW)*2.5];
const liveM:Gen=T=>{
 if(T<T_SL){const u=sm(T_RUN0,T_SL,T,easeIn),X=lerp(M0[0],SL[0],u)+.3*Math.sin(u*Math.PI),Z=lerp(M0[1],SL[1],u);
  const pose=blendPose(stand(),celebrate((T-T_RUN0)*1.3,{kind:'run'}),sm(0,T_RUN0+.35,T));return{pose,yaw:SL_YAW,X,Z};}
 let pose=celebrate(sm(T_SL,T_SLE,T,linear),{kind:'kneeSlide'});
 if(T>T_SLE){const w=Math.sin((T-T_SLE)*6)*.5+.5;pose={...pose,lShA:pose.lShA-.25*w,rShA:pose.rShA-.25*(1-w),neckP:pose.neckP+.12*w};}
 return{pose,yaw:SL_YAW,X:SL[0],Z:SL[1]};
};
/** Barça's other three (navy/red) run in to him and jump round him; their keeper celebrates at the far end (mostly off frame) */
const BAR_FROM:[number,number][]=[[9.6,11.8],[14.2,17.6],[6.6,8.6]],BAR_AT:[number,number][]=[[-1.1,.8],[1.05,.9],[-.1,1.6]];
const BAR_T0=[C1.four-.2,C1.four+.25,C1.four+.6],BAR_T1=[C1.fifth+.15,C1.fifth+.5,C1.win+.1];
const liveB=(i:number):Gen=>T=>{const t0=BAR_T0[i],t1=BAR_T1[i],u=sm(t0,t1,T,easeIO),tx=SL_END[0]+BAR_AT[i][0],tz=SL_END[1]+BAR_AT[i][1],X=lerp(BAR_FROM[i][0],tx,u),Z=lerp(BAR_FROM[i][1],tz,u);
 const arrived=sm(t1-.2,t1+.1,T);let pose=blendPose(stand(),runCycle(T*runCadence(.9)+i*.3,{speed:.9}),sm(t0-.1,t0+.2,T)*(1-arrived));
 pose=blendPose(pose,celebrate((T-t1)*1.2+i*.27,{kind:'arms'}),arrived);
 return{pose,yaw:arrived>.5?lerp(yawTo(SL_END[0]-X,SL_END[1]-Z),FACE_CAM,.5):yawTo(tx-BAR_FROM[i][0],tz-BAR_FROM[i][1]),X,Z};};
const liveBK:Gen=T=>({pose:blendPose(keeperSet(T),celebrate(T*1.1,{kind:'arms'}),.8),yaw:FACE_RIGHT,X:-18.6,Z:10});
/** Sporting (green hoops): heads down, walking back toward the halfway line; their keeper crouched, hands on his knees */
const SCP_FROM:[number,number][]=[[14.8,8.6],[17.6,16.4],[12.0,12.0],[17.2,6.6]];
const DOWN=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:42,lShA:10,rShA:10,lShF:6,rShF:6,lElb:26,rElb:26});
const liveS=(i:number):Gen=>T=>{const d=Math.max(0,T-.6-i*.3)*(.9+.12*i),X=SCP_FROM[i][0]-d,Z=SCP_FROM[i][1]+Math.sin(i*2+d*.4)*.3,walk=clamp(d*3);
 let pose=blendPose(stand(),runCycle(T*1.1+i*.37,{speed:.05}),walk);pose=blendPose(pose,DOWN,.6);
 return{pose,yaw:FACE_LEFT+[.2,-.3,.1,-.15][i],X,Z};};
const CROUCH=posed({lHipF:62,rHipF:62,lKnee:72,rKnee:72,lHipA:14,rHipA:14,lean:44,neckP:30,lShF:38,rShF:38,lShA:14,rShA:14,lElb:12,rElb:12});
const liveK:Gen=T=>({pose:blendPose(CROUCH,posed({lHipF:8,rHipF:8,lKnee:10,rKnee:10,lean:8,neckP:30,lShA:40,rShA:40,lShF:-20,rShF:-20,lElb:110,rElb:110}),sm(C1.four,C1.mat+.5,T,easeIO)),yaw:FACE_LEFT+.4,X:GX-.9,Z:10.6+.3*sm(C1.four,C1.mat+.5,T)});
/** the main-stand broadcast camera: 17 m outside the near touchline, 9 m up; the stage pans with the focus (x) */
const bst=(camX:number):Stage=>({F:4200,eye:9,cx:camX,cz:-17});
const liveCam=(T:number)=>{const m4=liveM(C1.four);
 const fx=key(T,mono([[0,13],[C1.play,14.4],[C1.four,m4.X],[C1.mat,SL[0]+.4],[C1.win,SL_END[0]+.1],[C1.end,SL_END[0]-.3]]),easeInOutSine),
  fz=key(T,mono([[0,11],[C1.play,10.6],[C1.four,m4.Z-.6],[C1.mat,SL[1]-1.2],[C1.win,SL_END[1]+.4],[C1.end,SL_END[1]+.6]]),easeInOutSine),
  zoom=key(T,mono([[0,.56],[C1.play,.6],[C1.four,.7],[C1.mat,.84],[C1.win,.92],[C1.end,.9]]),easeInOutSine);
 return{fx,fz,zoom};};
/** the goals on a 40-minute clock (Wikipedia goal lists): team 0 = Barça (above the bar), 1 = Sporting (below). The last one is his. */
const GOALS:{sec:number;team:0|1}[]=[{sec:54,team:1},{sec:500,team:0},{sec:528,team:0},{sec:992,team:1},{sec:1042,team:1},{sec:1101,team:0},{sec:1288,team:0},{sec:1438,team:1},{sec:1870,team:0}];
/** stacking: a ball rides up (or down) on a same-team ball less than 80 s before it */
const LEVEL=GOALS.map((g,i)=>GOALS.slice(0,i).filter(h=>h.team===g.team&&g.sec-h.sec<80).length);
/** the TV-style match timeline (screen space, box units): the Barça swatch (left), the 0–40 bar, the Sporting swatch, the nine goal balls,
 *  the score box. g = draw-in (0–1); drops = each ball's landing time; box = score-box drop (0–1); flip = 4→5; stamp = the full-time stamp */
function timeline(s:Sheet,T:number,g:number,drops:number[],box:number,flip:number,stamp:number){
 if(g<=.01)return;
 const top=-(s.H/2)/Math.max(1e-6,Math.min(s.W/BOX_W,s.H/BOX_H)*s.arrival);// the visible top edge (box units), so the graphic hugs the top in every window shape
 const y0=Math.max(top+96,-900),x0=-600,W=1120,H=64,slide=(1-easeOut(g))*-340;
 const plate=handCut([[x0-130,y0-66+slide],[x0+W+130,y0-66+slide],[x0+W+130,y0+H+66+slide],[x0-130,y0+H+66+slide]],901,4,40),pp=polyPath(plate,true);
 s.knockout(pp);s.fill(K,pp,.9);
 // the team swatches: Barça (navy with red stripes) left, Sporting (green with paper hoops) right
 const sw=(x:number,ink:string,kind:'stripes'|'hoops',seed:number)=>{const q=handCut([[x,y0-8+slide],[x+96,y0-8+slide],[x+96,y0+H+8+slide],[x,y0+H+8+slide]],seed,3,30),p=polyPath(q,true);s.knockout(p);s.fill(ink,p);
  const hp=new Path2D();if(kind==='hoops')for(let k=0;k<3;k++)hp.rect(x,y0+4+k*24+slide,96,10);else for(let k=0;k<4;k++)hp.rect(x+8+k*24,y0-8+slide,11,H+16);
  s.save();s.clip(p);if(kind==='hoops')s.knockout(hp);else s.fill(R,hp);s.restore();s.fill(Y,ribbon([...q,q[0]],5,{seed:seed+1,close:true,wobble:.6}),.7);};
 sw(x0-116,K,'stripes',902);sw(x0+W+20,G,'hoops',903);
 // the bar: a paper track with ticks every 10 minutes and a red half-time mark
 const bar=polyPath(handCut([[x0,y0+H*.3+slide],[x0+W,y0+H*.3+slide],[x0+W,y0+H*.7+slide],[x0,y0+H*.7+slide]],904,2,30),true);s.knockout(bar);
 const ticks=new Path2D();for(let m=0;m<=40;m+=10)ticks.rect(x0+W*m/40-3,y0+H*.12+slide,6,H*.76);s.fill(K,ticks,.7);
 const half=new Path2D();half.rect(x0+W/2-4,y0-6+slide,8,H+12);s.fill(R,half,.9);
 // the goal balls: Barça's drop from above onto the top of the bar, Sporting's rise from below; his (the ninth) is big and ringed
 GOALS.forEach((gl,i)=>{const d=drops[i];if(T<d-.35)return;const big=i===GOALS.length-1,r=big?34:22,u=sm(d-.35,d,T,easeIn),bo=settle(T,d,{amp:1,freq:3,decay:5})*(big?16:8);
  const x=x0+W*gl.sec/2400,side=gl.team===0?-1:1,yb=y0+H*.5+slide+side*(r+14+LEVEL[i]*36),y=lerp(yb+side*300,yb,u)+side*Math.abs(bo);
  if(T>=d&&T<d+.4)sparkBurst(s,Y,x,yb,big?110:50,{n:big?10:6,seed:910+i,g:easeOut(sm(d,d+.25,T))*(1-sm(d+.25,d+.4,T))});
  if(big&&T>=d){const ring=easeOutBack(sm(d,d+.3,T));s.fill(Y,ribbon(blob(x,y,r*1.5*ring,r*1.5*ring,915,{n:20}),9,{seed:916,close:true,wobble:1}),.95);}
  ball(s,x,y,r,920+i,{rot:u*4});
  if(big&&T>=d){// "31:10" beside his ball
   const lp=new Path2D();digits(lp,'31:10',x+48,yb-17,34,930);s.knockout(lp);s.fill(Y,lp);}});
 // the score box: drops in under the bar at "Four all" (4–4); the Barça digit flips to 5 on "the fifth"; it stamps on "Barcelona win"
 if(box>.01){const sc=1+.16*stamp,bw=250*sc,bh=124*sc,cx=x0+W-40,by=y0+H+80+slide-(1-box)*140,q=handCut([[cx-bw/2,by],[cx+bw/2,by],[cx+bw/2,by+bh],[cx-bw/2,by+bh]],940,4,30),p=polyPath(q,true);
  s.knockout(p);s.fill(Y,p,.95);s.fill(K,ribbon([...q,q[0]],7,{seed:944,close:true,wobble:1}),.9);
  const n=new Path2D(),dh=82*sc,lx=cx-bw/2+32*sc,rx=cx+bw/2-32*sc-dh*.5,dy=by+(bh-dh)/2;
  const left=flip>.5?'5':'4',fs=flip>0&&flip<1?Math.abs(Math.cos(flip*Math.PI)):1;// the digit flips like a board card
  const ln=new Path2D(),lf=new Path2D(),sy=Math.max(.05,fs),cy=dy+dh/2;digits(ln,left,lx,dy,dh,941);lf.addPath(ln,new DOMMatrix([1,0,0,sy,0,cy*(1-sy)]));s.fill(flip>.5?R:K,lf);
  digits(n,'4',rx,dy,dh,942);n.addPath(ribbon([[cx-18*sc,dy+dh/2],[cx+18*sc,dy+dh/2]],12*sc,{seed:943,taper:0}));s.fill(K,n);
  if(stamp>.05)sparkBurst(s,Y,cx,by+bh/2,220,{n:12,seed:945,g:Math.min(1,stamp*1.3)});}
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.fx),foc=proj(st,c.fx,1,c.fz);
 cam(s,0,foc[1],c.zoom);
 const cheer=.25+.75*sm(C1.yer,C1.play,T);
 court(s,st,IDX,T,{cheer,flash:pulse(T,C1.win,1.2)*.6+pulse(T,C1.fifth,.8)*.4,inGoal:()=>{
  // the ball left in the back of the net (inferred), then the keeper
  drawBall(s,st,IDX,{X:GX+.62,Y:BALL_R,Z:10.9,flying:false,spin:1},18);athlete(s,st,liveK,T,SCP_GK,{detail:'low'});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SCP_FROM.forEach((_,i)=>{const g=liveS(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,SCP(i),{detail:'low'})});});
 BAR_FROM.forEach((_,i)=>{const g=liveB(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BAR(i),{detail:'low'})});});
 items.push({z:liveBK(T).Z,draw:()=>athlete(s,st,liveBK,T,BAR_GK,{detail:'low'})});
 const h=liveM(T);
 items.push({z:h.Z,draw:()=>{
  // "Matheus Rodrigues": a yellow ring stamps round him on the floor and rides with the slide
  const ring=easeOutBack(sm(C1.mat-.05,C1.mat+.3,T))*(1-sm(C1.win+.2,C1.win+.7,T)),sk=solve(h.pose,BUILD,placeAt(h.X,h.Z,h.yaw)),pv=toMine(sk.pelvis);
  floorDashRing(s,st,IDX,Y,pv[0],pv[2],1.0,9,101,ring);
  athlete(s,st,liveM,T,MAT,{detail:'mid',smear:T>T_SL&&T<T_SL+.9?.14:0});}});
 items.sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
 // the TV graphic, fixed on the screen: slides in on "Barcelona play", eight goals drop through "Four all" (4–4), his on "the fifth"
 cam(s,0,0,1);
 const drops=GOALS.map((_,i)=>i<8?lerp(C1.semi+.15,C1.four+.1,i/7):C1.fifth+.1);
 timeline(s,T,sm(C1.play-.1,C1.play+.5,T),drops,sm(C1.four,C1.four+.4,T,easeOut),sm(C1.fifth+.1,C1.fifth+.45,T),pulse(T,C1.win,.8));
 cam(s,0,foc[1],c.zoom);
}
/** a figure's chest on a stage (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,xf:Xf=IDX):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=P3(st,xf,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,depthOf(xf,ch[0],ch[2])),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).fx),liveM(tt),.14));},still:C1.win+.35};

// ================= the move (chapters 2–4): run at him at speed, outside of the LEFT foot out, inside snaps it back in, past, shoot =================
/** the elastico poses (standing on the RIGHT leg, the LEFT foot works the ball). His left is +Z when he faces +X. */
/** OUT: the outside of the left foot carries the ball out to his left, toes turned in; shoulders dip left to sell it */
const ELA_OUT=posed({rHipF:14,rKnee:40,rAnk:-6,lHipF:30,lKnee:30,lAnk:14,lHipA:24,lHipR:-26,lean:18,pitch:6,bend:-12,roll:-4,twist:-10,neckP:32,neckY:6,lShA:54,rShA:34,lShF:-10,rShF:16,lElb:44,rElb:54});
/** SELL: deeper — the foot further out, the standing knee loaded to push off the other way */
const ELA_SELL=posed({rHipF:18,rKnee:50,rAnk:-8,lHipF:26,lKnee:34,lAnk:16,lHipA:34,lHipR:-30,lean:20,pitch:6,bend:-18,roll:-6,twist:-14,neckP:30,neckY:10,lShA:62,rShA:30,lShF:-14,rShF:20,lElb:40,rElb:58,squash:-.04});
/** IN: the foot wraps round the ball and the INSIDE snaps it back across the body to his right; the body follows */
const ELA_IN=posed({rHipF:10,rKnee:42,lHipF:40,lKnee:22,lAnk:-8,lHipA:-20,lHipR:34,lean:20,pitch:7,bend:16,roll:6,twist:16,neckP:28,neckY:-12,lShA:40,rShA:60,lShF:18,rShF:-12,lElb:44,rElb:40,squash:.03});
type Pt2=[number,number];
type MoveP={start:Pt2;trick:Pt2;ctrl:Pt2;shot:Pt2;tgt:V3;tRun:number;tPush:number;tSnap:number;tShoot:number;cheer?:boolean};
const bez=(a:Pt2,c:Pt2,b:Pt2,u:number):Pt2=>{const q=1-u;return[q*q*a[0]+2*q*u*c[0]+u*u*b[0],q*q*a[1]+2*q*u*c[1]+u*u*b[1]];};
const bezD=(a:Pt2,c:Pt2,b:Pt2,u:number):Pt2=>[2*(1-u)*(c[0]-a[0])+2*u*(b[0]-c[0]),2*(1-u)*(c[1]-a[1])+2*u*(b[1]-c[1])];
/** one run of the move, all in court coordinates: the attacker (gen), the ball, the defender, the keeper, and the key times */
function makeMove(p:MoveP){
 const YAW_SH=yawTo(p.tgt[0]-p.shot[0],p.tgt[2]-p.shot[1]),SB=toMine(strikeBall(YAW_SH,'l')),PLANT:Pt2=[p.shot[0]-SB[0],p.shot[1]-SB[2]];
 const tCarry=p.tPush+.45,tIn=p.tSnap+.2,tPlant=p.tShoot-.3,tNet=p.tShoot+.34;
 const SNAP:Pt2=[p.trick[0]+.35,p.trick[1]+.05],YAW_RUN=yawTo(p.trick[0]-p.start[0],p.trick[1]-p.start[1]);
 const pos=(t:number):Pt2=>{
  if(t<=p.tRun)return p.start;
  if(t<p.tPush){const u=sm(p.tRun,p.tPush,t,easeIO);return[lerp(p.start[0],p.trick[0],u),lerp(p.start[1],p.trick[1],u)];}
  if(t<p.tSnap){const u=sm(p.tPush,p.tSnap,t,easeIO);return[lerp(p.trick[0],SNAP[0],u),lerp(p.trick[1],SNAP[1],u)];}
  if(t<tPlant)return bez(SNAP,p.ctrl,PLANT,sm(p.tSnap,tPlant,t,easeInOutSine));
  const f=.25*sm(p.tShoot,p.tShoot+.6,t);return[PLANT[0]+Math.cos(YAW_SH)*f,PLANT[1]+Math.sin(YAW_SH)*f];};
 const yawAt=(t:number)=>{
  if(t<p.tPush)return YAW_RUN;
  const d0=bezD(SNAP,p.ctrl,PLANT,0),yD=Math.atan2(d0[1],d0[0]);
  if(t<p.tSnap)return YAW_RUN+.28*sm(p.tPush,tCarry,t);// turned a touch out: selling the outside
  if(t<tIn+.1)return lerp(YAW_RUN+.28,yD,sm(p.tSnap,tIn+.1,t,easeOut));
  if(t<tPlant){const u=sm(p.tSnap,tPlant,t,easeInOutSine),d=bezD(SNAP,p.ctrl,PLANT,Math.max(.02,u)),y=Math.atan2(d[1],d[0]);return lerp(y,YAW_SH,sm(tPlant-.4,tPlant,t));}
  return YAW_SH;};
 const runPh=(t:number)=>(t-p.tRun)*runCadence(.9)*1.1;
 const gen:Gen=t=>{
  const[X,Z]=pos(t),yaw=yawAt(t);let pose:Pose;
  if(t<p.tPush-.15){pose=blendPose(blendPose(stand(),posed({lHipF:20,rHipF:14,lKnee:30,rKnee:26,lean:14,neckP:26,lShA:24,rShA:24,lElb:40,rElb:40}),.7),dribble(runPh(t),{foot:'l',speed:.9}),sm(p.tRun-.1,p.tRun+.35,t));}
  else if(t<tIn+.2){const r0=dribble(runPh(p.tPush-.15),{foot:'l',speed:.9}),r1=runCycle(.1,{speed:.9});
   pose=keyPoses(t,[[p.tPush-.15,r0],[p.tPush+.22,ELA_OUT],[Math.max(p.tPush+.3,p.tSnap-.08),ELA_SELL],[p.tSnap+.1,ELA_IN],[tIn+.2,r1]]);}
  else if(t<tPlant){pose=runCycle((t-tIn-.2)*runCadence(.9)+.1,{speed:.9});pose=blendPose(pose,strike(.22,{foot:'l'}),sm(tPlant-.18,tPlant,t,easeIO));}
  else{const k=key(t,[[tPlant,.22],[p.tShoot,STRIKE_CONTACT],[p.tShoot+.6,.95]],linear);pose=strike(k,{foot:'l'});
   if(p.cheer&&t>tNet+.5){const u=sm(tNet+.5,tNet+1.1,t,easeIO);pose=blendPose(pose,celebrate((t-tNet-.5)*1.2,{kind:'arms'}),u);return{pose,yaw:lerp(YAW_SH,FACE_CAM+.3,u),X,Z};}}
  return{pose,yaw,X,Z};};
 /** the left toe (court coords) at time t */
 const toe=(t:number):Pt2=>{const a=gen(t),sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),q=toMine(sk.lToe);return[q[0],q[2]];};
 const OUTOFF:Pt2=[.06,.13];// the ball sits just outside (to the left of) the left toe while he carries it out
 const IN:Pt2=[SNAP[0]+.95,SNAP[1]-.72],ctrlB:Pt2=[p.ctrl[0]+.7,p.ctrl[1]-.2];
 const lead=(t:number)=>{const w=(((t-p.tRun)/.46)%1+1)%1,f=w<.15?w/.15:1-(w-.15)/.85;return lerp(.42+.4*f,.5,sm(p.tPush-.35,p.tPush-.1,t));};
 const ballF=(t:number):BallS=>{
  if(t<p.tPush-.15){const[X,Z]=pos(t),l=t<p.tRun?.42:lead(t);return{X:X+Math.cos(YAW_RUN)*l,Y:BALL_R,Z:Z+Math.sin(YAW_RUN)*l,flying:false,spin:(t-p.tRun)*8};}
  if(t<p.tSnap+.03){const q=toe(t),at:Pt2=[q[0]+OUTOFF[0],q[1]+OUTOFF[1]];
   if(t<p.tPush+.15){const[X,Z]=pos(p.tPush-.15),a0:Pt2=[X+Math.cos(YAW_RUN)*.5,Z+Math.sin(YAW_RUN)*.5],w=sm(p.tPush-.15,p.tPush+.15,t,easeIO);return{X:lerp(a0[0],at[0],w),Y:BALL_R,Z:lerp(a0[1],at[1],w),flying:false,spin:4};}
   return{X:at[0],Y:BALL_R,Z:at[1],flying:false,spin:4+sm(p.tPush,p.tSnap,t)};}
  const q0=toe(p.tSnap+.03),o0:Pt2=[q0[0]+OUTOFF[0],q0[1]+OUTOFF[1]];
  if(t<tIn){const u=sm(p.tSnap+.03,tIn,t,easeOut);return{X:lerp(o0[0],IN[0],u),Y:BALL_R,Z:lerp(o0[1],IN[1],u),flying:false,spin:5+u*6};}
  if(t<p.tShoot){const u=sm(tIn,tPlant-.08,t,x=>1-Math.pow(1-x,1.5)),b=bez(IN,ctrlB,p.shot,u);return{X:b[0],Y:BALL_R,Z:b[1],flying:false,spin:11+u*10};}
  if(t<tNet){const u=sm(p.tShoot,tNet,t,linear),M:V3=[lerp(p.shot[0],p.tgt[0],.5),.38,lerp(p.shot[1],p.tgt[2],.5)],a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;
   return{X:a*p.shot[0]+b*M[0]+c*p.tgt[0],Y:a*BALL_R+b*M[1]+c*p.tgt[1],Z:a*p.shot[1]+b*M[2]+c*p.tgt[2],flying:true,spin:20+u*30};}
  const d=sm(tNet,tNet+.3,t,easeOut);return{X:lerp(p.tgt[0],GX+.62,d),Y:lerp(p.tgt[1],BALL_R,sm(tNet+.1,tNet+.4,t)),Z:p.tgt[2]-.08*d,flying:false,spin:40};};
 /** the defender (neutral kit): closes him down, BITES on the out-touch (steps and jabs to his own right = +Z), stranded as the ball goes in */
 const D0:Pt2=[p.trick[0]+3.8,p.trick[1]-.35],D1:Pt2=[p.trick[0]+2.05,p.trick[1]-.1];
 const DEF_POSE=posed({lHipF:30,rHipF:30,lKnee:44,rKnee:44,lean:22,lShF:40,rShF:34,lShA:22,rShA:22,lElb:30,rElb:40,neckP:16});
 const def:Gen=t=>{
  const close=sm(p.tRun+.4,p.tPush,t,easeIO),bite=sm(p.tPush+.1,p.tSnap-.02,t,easeIO),str=sm(p.tSnap+.08,p.tSnap+.7,t,easeIO),chase=sm(p.tSnap+.9,p.tShoot+.5,t,easeIO);
  let pose=blendPose(backpedal(t*1.3),DEF_POSE,.7);
  pose=blendPose(pose,lunge(key(t,[[p.tPush+.1,0],[p.tSnap-.02,.6],[p.tSnap+.5,.8]],linear),{side:'r'}),bite*(1-chase));
  pose=blendPose(pose,posed({lHipF:24,rHipF:40,lKnee:40,rKnee:36,lean:14,twist:24,neckY:70,neckP:0,lShA:34,rShA:44,lElb:30,rElb:30}),str*.75*(1-chase));
  pose=blendPose(pose,runCycle(t*runCadence(.7),{speed:.7}),chase);
  const X=lerp(D0[0],D1[0],close)+1.1*chase,Z=lerp(D0[1],D1[1],close)+.3*bite-.3*chase;
  return{pose,yaw:FACE_LEFT+.35*bite+1.1*str*(1-chase)+(yawTo(1,-.6)+TAU-FACE_LEFT-1.1)*chase,X,Z};};
 const keeper:Gen=t=>{const b=ballF(Math.min(t,p.tShoot)),Z=clamp(10+(b.Z-10)*.3,9.4,11.1);let pose=keeperSet(t*1.2);
  if(t>=p.tShoot+.06)pose=blendPose(pose,keeperDive(sm(p.tShoot+.06,p.tShoot+.8,t,linear)*.95,{side:'l',height:.12}),sm(p.tShoot+.06,p.tShoot+.14,t));
  return{pose,yaw:FACE_LEFT-.2,X:GX-.85,Z};};
 const smear=(t:number)=>(t>p.tSnap-.05&&t<tIn+.1)||(t>p.tShoot-.15&&t<p.tShoot+.2)?.14:0;
 return{gen,ball:ballF,def,keeper,pos,toe,smear,SNAP,IN,PLANT,YAW_SH,tCarry,tIn,tPlant,tNet,D1};
}

// ================= chapter 2 — HOW HE DOES IT: the far-touchline camera, real time, the goal on the LEFT =================
const C2={runs:A(1,'He runs'),fast:A(1,'fast'),out:A(1,'ball out'),snap:A(1,'snaps it back'),fooled:A(1,'is fooled'),shoots:A(1,'and he shoots'),end:AUTH[1].seconds};
const MV2=makeMove({start:[-2.6,16.8],trick:[8.4,16.4],ctrl:[11.4,14.4],shot:[15.9,12.0],tgt:[GX+.05,.32,9.1],tRun:C2.runs-.3,tPush:C2.out,tSnap:C2.snap,tShoot:C2.shoots+.05,cheer:true});
/** the camera BEHIND him, 4.4 m up, dollying up the court 7.5 m behind (a lagged average of his run, so the snap doesn't jerk it) */
function st2At(t:number):Stage{let mx=0,mz=0;for(let k=0;k<4;k++){const q=MV2.pos(t-k*.15);mx+=q[0]/4;mz+=q[1]/4;}return{F:1400,eye:5,cx:lerp(10-mz,0,.85),cz:Math.min(mx-7.5,8.6)};}
function cam2(s:Sheet,st:Stage,t:number,shake=0){
 const[X,Z]=MV2.pos(t),a=P3(st,BEH,X+1.6,.9,Z),g=P3(st,BEH,GX,1,10),w=.5*sm(C2.fooled-.2,C2.shoots,t),zoom=key(t,mono([[0,.95],[C2.runs,.95],[C2.fast,1.0],[C2.out,1.15],[C2.snap,1.2],[C2.fooled,1.05],[C2.shoots,.95],[C2.end,.92]]),easeInOutSine);
 cam(s,lerp(a[0],g[0],w)+shake,lerp(a[1],g[1],w)+40,zoom,0);}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2At(t),xf=BEH,M=MV2;
  cam2(s,st,t,4*pulse(t,C2.shoots+.05,.3)*Math.sin(t*80));
  const b=M.ball(tt),goal=tt>=M.tNet;
  court(s,st,xf,tt,{cheer:goal?.8:.1,flash:pulse(tt,M.tNet,1.2),bulge:.4*sm(M.tNet-.1,M.tNet,tt)*(1-.6*sm(M.tNet+.2,M.tNet+1,tt)),bz:9.1,by:.32,
   inGoal:()=>athlete(s,st,M.keeper,tt,DEMO_K,{xf,detail:'mid'})});
  const[hx,hz]=M.pos(tt);
  // "fast": a dashed yellow track under his run; "He runs": speed lines trail him
  const tr=sm(C2.fast-.1,C2.fast+.6,tt,easeOut)*(1-sm(C2.snap,C2.snap+.5,tt));
  if(tr>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=M.pos(lerp(C2.runs-.3,C2.out,k/10));pts.push(P3(st,xf,q[0],0,q[1]-.35));}dashed(s,Y,pts,9,201,{dash:30,progress:tr});}
  // "ball out": a yellow arrow out toward the touchline; "snaps it back": a yellow hook back in
  const og=sm(C2.out,C2.out+.4,tt,easeOut)*(1-sm(C2.fooled,C2.fooled+.4,tt));
  const tp=M.toe(C2.out);floorArrow(s,st,xf,Y,[[tp[0]+.3,tp[1]-.15],[tp[0]+.55,tp[1]+.35],[tp[0]+.6,tp[1]+.85]],10,26,203,og);
  const ig=sm(C2.snap-.05,C2.snap+.35,tt,easeOut)*(1-sm(C2.shoots-.3,C2.shoots,tt));
  floorArrow(s,st,xf,Y,[[M.SNAP[0]+.6,M.SNAP[1]+.75],[M.SNAP[0]+1.0,M.SNAP[1]+.1],[M.IN[0]+.3,M.IN[1]-.25]],12,30,205,ig);
  // "is fooled": the defender's bite, a red arrow the wrong way (+Z) and a red ring at his feet
  const d=M.def(tt),fg=sm(C2.fooled-.1,C2.fooled+.35,tt,easeOut)*(1-sm(C2.shoots,C2.shoots+.4,tt));
  floorArrow(s,st,xf,R,[[M.D1[0],M.D1[1]],[M.D1[0]-.1,M.D1[1]+.6],[M.D1[0]-.05,M.D1[1]+1.2]],11,28,207,fg);
  floorDashRing(s,st,xf,R,d.X,d.Z,.55,7,209,easeOutBack(fg));
  if(tt>=C2.shoots+.05){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=M.ball(lerp(C2.shoots+.05,Math.min(tt,M.tNet),k/12));pts.push(P3(st,xf,q.X,0,q.Z));}dashed(s,Y,pts,8,211,{dash:28});}
  // speed lines behind him while he runs
  const sl=sm(C2.runs,C2.runs+.3,tt)*(1-sm(C2.out-.2,C2.out+.1,tt));
  if(sl>.02){for(let k=0;k<3;k++){const hgt=.5+k*.42,a=P3(st,xf,hx-.5,hgt,hz),c=P3(st,xf,hx-1.7-k*.3,hgt,hz),rp=ribbon([a,c],7,{seed:212+k,taper:.8,wobble:1});s.knockout(rp,.6*sl);s.fill(Y,rp,sl);}}
  const items:{z:number;draw:()=>void}[]=[
   {z:depthOf(xf,d.X,d.Z),draw:()=>athlete(s,st,M.def,tt,DEMO_D,{xf,detail:'high',smear:tt>C2.out&&tt<C2.snap+.3?.12:0})},
   {z:depthOf(xf,hx,hz)-.02,draw:()=>athlete(s,st,M.gen,tt,MAT_T,{xf,detail:'high',smear:M.smear(tt)})},
   {z:depthOf(xf,b.X,b.Z)-.03,draw:()=>{drawBall(s,st,xf,b,215,{smear:b.flying?.35:0,dir:0});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=M.tNet&&tt<M.tNet+.6){const p=P3(st,xf,GX+.05,.32,9.1);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:216,g:easeOut(sm(M.tNet,M.tNet+.3,tt))*(1-sm(M.tNet+.35,M.tNet+.6,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2At(clock(1,t0).tc),MV2.gen(tt),.14,BEH));},
 still:C2.snap+.1,
};

// ================= chapter 3 — WATCH AGAIN: slow motion, a knee-high pitch-side camera 5 m away (same side); the out-and-in =================
const C3={watch:A(2,'Watch again'),out:A(2,'Out and back'),one:A(2,'one quick touch'),def:A(2,'The defender'),wrong:A(2,'wrong way'),end:AUTH[2].seconds};
/** replay seconds → demo seconds: slow motion (≈0.3–0.6×) from just before the out-touch to just after he is past */
const repT=(t:number)=>key(t,[[0,C2.out-.55],[C3.out,C2.out+.05],[C3.one,C2.snap-.02],[C3.def,C2.snap+.18],[C3.wrong,C2.snap+.55],[C3.end,C2.snap+1.25]],linear);
/** knee-high, in FRONT of him and a little inside (the goal side, looking back up the court): his left foot works on screen-right */
const stR:Stage={F:1150,eye:.9,cx:2.2,cz:-(8.75+5.5)};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),T=repT(tt),st=stR,xf=FRT,M=MV2;
  const[hx,hz]=M.pos(T),dd=M.def(T),g0=L2(P3(st,xf,hx+.5,.9,hz),P3(st,xf,dd.X,.9,dd.Z),.35),zoom=key(t,mono([[0,1.06],[C3.out,1.14],[C3.one,1.2],[C3.def,1.08],[C3.wrong,1.02],[C3.end,.98]]),easeInOutSine);
  cam(s,g0[0]-40,g0[1]+10,zoom);
  const b=M.ball(T);
  court(s,st,xf,T,{cheer:.08,goal:false});
  const d=M.def(T);
  // "Out and back": the ball's V path on the floor, out then in (yellow); "one quick touch": a yellow flash ring at the left boot
  const vg=sm(C3.out-.05,C3.out+.6,tt,easeOut)*(1-sm(C3.wrong+.4,C3.wrong+.8,tt));
  if(vg>.02){const o=M.toe(C2.snap-.05),s0=M.ball(C2.out-.15),pts:Pt[]=[P3(st,xf,s0.X,0,s0.Z),P3(st,xf,o[0]+.06,0,o[1]+.13),P3(st,xf,M.IN[0],0,M.IN[1])];dashed(s,Y,pts,11,301,{dash:30,progress:vg});if(vg>.95)arrowHead(s,Y,pts,30,302);}
  const dg=easeOutBack(sm(C3.def,C3.def+.35,tt))*(1-sm(C3.wrong+.6,C3.wrong+1,tt));floorDashRing(s,st,xf,R,d.X,d.Z,.6,8,303,dg);
  // "wrong way": a red arrow the way his weight went (+Z) and a yellow arrow the way the ball went (−Z)
  const wg=sm(C3.wrong-.1,C3.wrong+.35,tt,easeOut);
  floorArrow(s,st,xf,R,[[d.X,d.Z+.2],[d.X-.1,d.Z+.8],[d.X,d.Z+1.3]],12,30,305,wg);
  floorArrow(s,st,xf,Y,[[M.IN[0]-.2,M.IN[1]+.1],[M.IN[0]+.7,M.IN[1]-.5],[M.IN[0]+1.6,M.IN[1]-.9]],12,30,307,wg);
  const items:{z:number;draw:()=>void}[]=[
   {z:depthOf(xf,d.X,d.Z),draw:()=>athlete(s,st,M.def,T,DEMO_D,{xf,detail:'high',smear:T>C2.out&&T<C2.snap+.3?.14:0})},
   {z:depthOf(xf,hx,hz)-.02,draw:()=>athlete(s,st,M.gen,T,MAT_T,{xf,detail:'high',smear:M.smear(T)})},
   {z:depthOf(xf,b.X,b.Z)-.03,draw:()=>{const o=drawBall(s,st,xf,b,311,{});
    const fl=pulse(tt,C3.one,.7);if(fl>.05)sparkBurst(s,Y,o.p[0],o.p[1],o.r*3.2,{n:9,seed:312,g:Math.min(1,fl*1.3)});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(stR,MV2.gen(repT(tt)),.12,FRT));},
 still:C3.one+.2,
};

// ================= chapter 4 — YOUR TURN: a practice run from the main-stand side — speed, the trick at a mannequin, straight to goal =================
const C4={turn:A(3,'Your turn'),tricks:A(3,'Tricks work'),speed:A(3,'at speed'),purpose:A(3,'with a purpose'),past:A(3,'get past'),end:AUTH[3].seconds};
const MV4=makeMove({start:[-.5,13.5],trick:[9.4,13.2],ctrl:[12.0,11.6],shot:[16.0,11.0],tgt:[GX+.05,.34,9.3],tRun:C4.tricks-.3,tPush:C4.speed+.5,tSnap:C4.purpose+.15,tShoot:C4.past+.8,cheer:true});
const MANN:Pt2=[9.4+1.55,13.2-.2];
const st4:Stage={F:1500,eye:3.2,cx:8,cz:1.5};
/** a training mannequin: a navy flat body on a pole with a round head and a red band (no player, so nothing is claimed) */
function mannequin(s:Sheet,st:Stage,X:number,Z:number,wob:number){
 const P=(dx:number,h:number):Pt=>proj(st,X+dx,h,Z),k=kAt(st,Z),sw=wob*.06;
 shadow(s,P(0,0)[0],P(0,0)[1],k*.35,k*.08,501,.3);
 const pole=ribbon([P(0,0),P(sw,.45)],Math.max(3,k*.05),{seed:502,taper:0});s.fill(K,pole);
 const body=polyPath(smoothPts([P(-.24+sw,.45),P(.24+sw,.45),P(.27+sw*1.5,1.45),P(-.27+sw*1.5,1.45)],true,6,1.2),true);s.knockout(body);s.fill(K,body,.85);
 const band=polyPath([P(-.26+sw*1.2,.95),P(.26+sw*1.2,.95),P(.265+sw*1.3,1.08),P(-.265+sw*1.3,1.08)],true);s.fill(R,band);
 const hd=P(sw*1.8,1.62),hp=polyPath(blob(hd[0],hd[1],k*.12,k*.13,503,{n:18}),true);s.knockout(hp);s.fill(K,hp,.85);
}
const CARD_Y=860,CARD_W=150,CARD_H=172,CARDS:[number,number,'speed'|'trick'|'goal'][]=[[-340,C4.speed-.05,'speed'],[0,C4.purpose-.1,'trick'],[340,C4.past-.1,'goal']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,M=MV4;
  const[hx,hz]=M.pos(t),a=proj(st,hx+1.4,1,hz),g=proj(st,GX-2.5,1,10.5),w=.6*sm(C4.purpose+.3,C4.past+.4,t),zoom=key(t,mono([[0,1.35],[C4.tricks,1.3],[C4.speed,1.25],[C4.purpose,1.35],[C4.past,1.25],[C4.end,1.35]]),easeInOutSine);
  cam(s,lerp(a[0],g[0],w),lerp(a[1],g[1],w)+30,zoom);
  const b=M.ball(tt),goal=tt>=M.tNet;
  court(s,st,IDX,tt,{cheer:goal?.7:.05,flash:pulse(tt,M.tNet,1.2),bulge:.35*sm(M.tNet-.1,M.tNet,tt)*(1-.6*sm(M.tNet+.2,M.tNet+1,tt)),bz:9.3,by:.34,
   inGoal:()=>athlete(s,st,M.keeper,tt,DEMO_K,{detail:'mid'})});
  const[px,pz]=M.pos(tt);
  // "at speed": speed lines trail him; "with a purpose": a dashed yellow arrow from the mannequin to the goal
  const sl=sm(C4.speed-.1,C4.speed+.3,tt)*(1-sm(C4.purpose-.3,C4.purpose,tt));
  if(sl>.02){for(let k=0;k<3;k++){const hgt=.5+k*.42,p0=proj(st,px-.5,hgt,pz),p1=proj(st,px-1.8-k*.3,hgt,pz),rp=ribbon([p0,p1],7,{seed:412+k,taper:.8,wobble:1});s.knockout(rp,.6*sl);s.fill(Y,rp,sl);}}
  const pg=sm(C4.purpose-.1,C4.purpose+.6,tt,easeOut)*(1-sm(C4.past+.8,C4.past+1.2,tt));
  if(pg>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=bez([MANN[0],MANN[1]-.9],[13.6,10.8],[GX-.3,9.6],k/10);pts.push(proj(st,q[0],0,q[1]));}dashed(s,Y,pts,10,414,{dash:30,progress:pg});if(pg>.95)arrowHead(s,Y,pts,30,415);}
  const items:{z:number;draw:()=>void}[]=[
   {z:MANN[1],draw:()=>mannequin(s,st,MANN[0],MANN[1],pulse(tt,C4.purpose+.25,.6)*Math.sin(tt*14))},
   {z:pz+.001,draw:()=>athlete(s,st,M.gen,tt,MAT_T,{detail:'high',smear:M.smear(tt)})},
   {z:b.Z-.05,draw:()=>{drawBall(s,st,IDX,b,403,{smear:b.flying?.35:0,dir:0});}},
  ];
  items.sort((a2,c)=>c.z-a2.z).forEach(it=>it.draw());
  if(tt>=M.tNet&&tt<M.tNet+.6){const p=proj(st,GX+.05,.34,9.3);sparkBurst(s,Y,p[0],p[1],100,{n:10,seed:416,g:easeOut(sm(M.tNet,M.tNet+.3,tt))*(1-sm(M.tNet+.35,M.tNet+.6,tt))});}
  // three cards (screen space): speed, trick, goal — they rise on "at speed", each prints on its word, and drop before the shot
  cam(s,0,0,1);
  const rise=sm(C4.speed-.3,C4.speed+.3,tt,easeOut),drop=sm(C4.past+.35,C4.past+.75,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   const bottom=(s.H/2)/Math.max(1e-6,Math.min(s.W/BOX_W,s.H/BOX_H)*s.arrival),cy=Math.min(CARD_Y,bottom-CARD_H-30);
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,cy-CARD_H+dy],[cx+CARD_W,cy-CARD_H+dy],[cx+CARD_W,cy+CARD_H+dy],[cx-CARD_W,cy+CARD_H+dy]],70+i,7,50);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.16);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=cy+dy+132;
    const fc=figureCam({x:cx-10,y:gy,height:280*(.9+.1*on),azimuth:0,elevation:10,fov:16,at:[0,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    // side view, facing +x (seen from his right): speed = lines behind him; trick = the ball's out-and-in hook; goal = a small goal ahead
    if(kind==='speed'){for(let k=0;k<3;k++){const q=ribbon([Pc([-.45,.5+k*.42,0]),Pc([-1.05-k*.12,.5+k*.42,0])],8,{seed:80+k,taper:.8,wobble:1});s.fill(Y,q,.95);s.fill(K,q,.3);}}
    if(kind==='trick'){const q=[Pc([.35,.05,0]),Pc([.72,.05,0]),Pc([.5,.05,0])],hook=ribbon(smoothPts([[q[0][0],q[0][1]+6],[q[1][0],q[1][1]-24],[q[2][0]+12,q[2][1]+18]],false,6),9,{seed:84,taper:.2,wobble:1});s.fill(Y,hook);s.fill(K,hook,.35);}
    if(kind==='goal'){const gp=[Pc([1.05,0,0]),Pc([1.05,1.0,0]),Pc([1.5,1.0,0]),Pc([1.5,0,0])],gl=ribbon(gp,7,{seed:85,taper:0,wobble:1});s.fill(R,gl);s.fill(K,ribbon([Pc([.5,.2,0]),Pc([1.2,.55,0])],6,{seed:86,taper:.3,gaps:[[.3,.45],[.6,.75]]}),.8);}
    const pose=kind==='speed'?runCycle(.3,{speed:1}):kind==='trick'?ELA_IN:strike(STRIKE_CONTACT,{foot:'l'});
    const bpc=Pc(kind==='speed'?[.55,BALL_R,0]:kind==='trick'?[.5,BALL_R,0]:[.4,BALL_R,0]);ball(s,bpc[0],bpc[1],14,81+i);
    drawAthlete(s,pose,fc,{...MAT_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  cam(s,lerp(a[0],g[0],w),lerp(a[1],g[1],w)+30,zoom);
  // a big tick stamps beside him after the goal, with a navy misregistered echo
  const tick=easeOutBack(sm(M.tNet+.4,M.tNet+.75,tt));
  if(tick>.02){const gp=proj(st,px,0,pz),hh=kAt(st,pz)*1.8,c:Pt=[gp[0]-hh*.75,gp[1]-hh*.75],S=hh*.32*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.purpose+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'matheus-rodrigues-futsal-signature',format:'futsal',title:'Matheus Rodrigues’ wing trick',theme:'Tricks work best when you do them at speed and with a purpose.',
 ageNote:'For players aged 7–12: the 2024 semi-final and his winning goal are real; the trick is shown as a demonstration. Practise it at speed, then go to goal.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flicks out and snaps back in (a yellow hook), a red ring squeaks out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),dx=r*1.1*Math.sin(Math.min(1,u*1.6)*Math.PI)*(1-u*.4);
  if(u<1){const pts:Pt[]=[];for(let k=0;k<=12;k++){const v=k/12;pts.push([x+r*1.2*Math.sin(v*Math.PI),y+r*.9-v*r*.2]);}s.fill(Y,ribbon(partial(pts,easeOut(u)),12*(1-u)+4,{seed,taper:.3,wobble:1}),1);
   s.fill(R,ribbon(blob(x,y+r*.9,r*(1+1.6*u),r*(.3+.5*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(x+dx,y+r*.95,r,r*.2,seed+2,{n:16}),true),.32);
  ball(s,x+dx,y,r,seed,{rot:age*6*(1-u)});
 },
};
export default film;
