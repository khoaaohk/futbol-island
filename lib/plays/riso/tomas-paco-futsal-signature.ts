/** Tomás Paçó — "the calm pass from the back": a signature riso film (iconic plays, FUTSAL, fixo).
 *
 * WHY THIS MOMENT: Tomás Paçó's entry (lib/town/iconicPlays.json) is a signature, the calm pass, not one match. UEFA.com's report of the
 * 2021 UEFA Futsal Champions League FINAL describes ONE Tomás pass in words, and it is exactly that signature: with Sporting 2–0 down at
 * half-time, "Six minutes into the second half two Sporting academy products combined to pull one back as Tomás Paço, 20, played across for
 * the 19-year-old Zicky Té … to control and roll the ball in." So the film recreates THAT pass (the goal is at 25:48 on Wikipedia's box).
 * (Match choice: the Bernardo Paçó film uses the EURO 2026 semi-final v France, where Tomás was Player of the Match, but no written source
 * we have describes a Tomás pass in that match; this final is a different match that no other futsal film uses — Guitta uses the 2019
 * final, Pito / Ferrão / Plana the 2022 final — and it has a documented Tomás assist. The Zicky Té film only mentions it as background.)
 *  1  LIVE (broadcast camera, main stand, real time): 3 May 2021, Krešimir Ćosić Hall, Zadar, behind closed doors (attendance 0: the
 *     stands are empty). Barça lead 2–0. Tomás gets the ball, takes his time, and plays it across; Zicky controls it and rolls it in: 2–1.
 *  2  REPLAY (slow motion, a long lens from BEHIND Sporting's attack, low, looking up the court at Barça's goal — the pass reads right to
 *     left across the screen): he takes his time, finds Zicky free, passes it across; Zicky controls it and scores. "A calm pass!"
 *  3  FULL TIME (a low courtside camera, CONFIRMED THINGS ONLY): the arena board runs through Sporting's comeback (2–2, 2–3, 2–4, 3–4); the
 *     final whistle, Sporting jump together; (cut) captain João Matos lifts the trophy, Tomás and Zicky beside him. No other play is staged.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Stay calm on the ball and pass to the teammate who is free."): kid-height demonstration
 *     in training kit (no match claimed): sole on the ball, look up, one team-mate is marked (red cross), one is free (yellow ring), pass.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - UEFA.com, "UEFA Futsal Champions League final report: Barça 3-4 Sporting" (3 May 2021; uefa-futsal-cl-2021-final-report.txt):
 *    "overturning a 2-0 half-time deficit to dethrone Barça in Zadar"; "Six minutes into the second half two Sporting academy products
 *    combined to pull one back as Tomás Paço, 20, played across for the 19-year-old Zicky Té, inspirational in the second-half comeback, to
 *    control and roll the ball in. Just 91 seconds later it was 2-2"; Marcênio "struck past Guitta"; João Matos "tapped in after Taynan's
 *    free-kick squeezed through the legs of Didac Plana"; Pany Varela; Ferrao "pulled one back with three minutes left"; "Sporting
 *    celebrations"; Nuno Dias: "the young players who were made in the Sporting academy".
 *  - UEFA.com (pt), "Sporting sagra-se bicampeão da UEFA Futsal Champions League" (uefa-pt-sporting-ucl-2021.txt): photo caption "João Matos,
 *    capitão do Sporting, com o troféu"; 2–0 at half-time, level within two minutes (Zicky Té, Erick).
 *  - Wikipedia, "2020–21 UEFA Futsal Champions League" (raw; wiki-2020-21-uefa-futsal-cl.txt): final 3 May 2021, 20:00, Krešimir Ćosić
 *    Hall, Zadar, attendance 0 (behind closed doors); Barcelona 3–4 Sporting CP; goals Marcênio 0:51, Ximbinha 17:54, Ferrão 37:05; Zicky
 *    25:48, Erick 27:19, João Matos 30:16, Pauleta 36:26.
 *  - lib/town/playerProfiles.json / playerBios: Tomás Paçó, Sporting CP fixo, Portugal international; twin brother of goleiro Bernardo.
 * CONFIRMED: competition, date, venue, empty arena, both teams, Barça 2–0 at half-time, the goal six minutes into the second half (25:48)
 *  that made it 2–1, Tomás (aged 20) "played across" for Zicky Té (aged 19), who controlled and rolled the ball in; Guitta in Sporting's goal,
 *  Dídac Plana in Barça's; the scoreline order 2–2 → 2–3 → 2–4 → 3–4; the final 3–4; João Matos (captain) with the trophy.
 * INFERRED (never named in the narration): WHERE on the court it happened and every position; that Tomás carried it a few metres first;
 *  the pass's line (a diagonal across from the near side to the far side) and pace; both players' feet (right; Zicky stops it with his sole
 *  and turns); which goal was Barça's; Plana shuffling and diving; the other players' runs; kits — Sporting green-and-white hoops / navy
 *  shorts / green socks, Barça navy with red stripes / navy shorts / red socks, Guitta dark, Plana red (as in the approved Guitta and Pito
 *  films); the court colour; the hanging board's look and place; the group jump at the whistle; the trophy's shape; Tomás 1.80 m (not
 *  sourced), short dark hair; no shirt numbers are claimed. No video was reviewed. Chapter 4 is a coaching demonstration, not footage.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the pass, the roll-in and the lunge). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z. The replay reuses the live choreography through a rotation `FWD` (a proper rotation, so feet keep their side).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (floor, lights, the pass line, the "free" ring), red (Barça stripes, posts, the "marked" cross), green (Sporting hoops,
 * board tab), navy (key line, Barça shirts, empty seats). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it
 * on the FULL sheet (card window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones;
 * no crowd to draw (the stands are empty rows). All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 *  Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2021 final',text:'The 2021 Futsal Champions League final. Barcelona lead Sporting two nil. Then Tomás Paçó, just twenty, plays it across. Zicky Té controls it and rolls it in. Two one!',tail:2.2,
  cues:['The 2021','Barcelona lead','Then Tomás','plays it across','Zicky','rolls it in','Two one'],heads:{'The 2021':'Final 2021','Barcelona lead':'2–0','Two one':'2–1'}},
 {label:'Replay: the calm pass',text:'Watch again, slowly. Tomás takes his time. He finds Zicky, who is free, and passes it across. Zicky controls it, and scores. A calm pass!',tail:1.8,
  cues:['Watch again','takes his time','He finds','who is free','passes it across','Zicky controls','and scores','calm pass'],heads:{'He finds':'Look up','calm pass':'Calm pass'}},
 {label:'Full time',text:'Sporting keep attacking. From two nil down, they win four three. Champions of Europe!',tail:2.4,
  cues:['Sporting keep','From two','they win','four three','Champions of'],heads:{'four three':'Sporting 4–3','Champions of':'Champions'}},
 {label:'Your turn',text:'Your turn. Stay calm on the ball. Look up, and pass to the teammate who is free!',tail:2.6,
  cues:['Your turn','Stay calm','Look up','pass to','who is free'],heads:{'Stay calm':'Stay calm','who is free':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/tomas-paco-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/tomas-paco-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/tomas-paco-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('tomas-paco: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('tomas-paco: no cue '+w);return c.at;};
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
/** court → camera-stage floor transforms. IDX: the main-stand stages see the court as it is (Barça's goal at X = +20, the main stand at Z < 0).
 *  FWD: the replay's long lens sits BEHIND Sporting's end looking up the court at Barça's goal: stage X = 10 − court Z, stage Z = court X + 20
 *  (a proper rotation: facing +X, a player's right is −Z, which lands on stage +X). */
type Xf=(X:number,Z:number)=>[number,number];
const IDX:Xf=(X,Z)=>[X,Z];
const FWD:Xf=(X,Z)=>[10-Z,X+20];
const FWD_INV:Xf=(x,z)=>[z-20,10-x];
const P3=(st:Stage,xf:Xf,X:number,Yh:number,Z:number):Pt=>{const[a,b]=xf(X,Z);return proj(st,a,Yh,b);};
const depthOf=(xf:Xf,X:number,Z:number)=>xf(X,Z)[1];

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the floor */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number}={}){const{dash=width*4.5,cov=1,progress=1}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24,xf:Xf=IDX):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(P3(st,xf,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a dashed floor ring (court coords through xf) that grows in with g */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1,xf:Xf=IDX){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26,xf),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a red "marked" cross on the floor (court coords through xf) */
function floorCross(s:Sheet,st:Stage,X:number,Z:number,r:number,w:number,seed:number,g:number,xf:Xf=IDX){if(g<=.02)return;const R0=r*g,a=[P3(st,xf,X-R0,0,Z-R0),P3(st,xf,X+R0,0,Z+R0)],b=[P3(st,xf,X-R0,0,Z+R0),P3(st,xf,X+R0,0,Z-R0)];
 const p=new Path2D();p.addPath(ribbon(a,w,{seed,taper:.2,wobble:1}));p.addPath(ribbon(b,w,{seed:seed+1,taper:.2,wobble:1}));s.knockout(p);s.fill(R,p);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. xf maps the court onto the stage. */
function projector(st:Stage,xf:Xf=IDX,inv:Xf=IDX):Projector{const e=inv(st.cx,st.cz);
 return{eye:[e[0],st.eye,-e[1]] as V3,project(p:V3){const[a,b]=xf(p[0],-p[2]),q=proj(st,a,p[1],b);return[q[0],q[1],b-st.cz];},scale(p:V3){return kAt(st,xf(p[0],-p[2])[1]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) on the court (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN_T:InkFill[]=[[Y,.86],[R,.26]],SKIN_Z:InkFill[]=[[R,.46],[Y,.6],[K,.28]];
const BUILD_T:Build={height:1.8,bulk:1.02},BUILD_Z:Build={height:1.85,bulk:1.06};
/** Sporting (kit inferred): green-and-white hoops, navy shorts, green socks */
const SCP=(n:number):AthleteStyle=>({shirt:G,pattern:'hoops',patternInk:'paper',shorts:K,socks:G,boots:K,skin:n%3===1?[[Y,.72],[R,.4]]:n%3===2?[[R,.6],[K,.34]]:[[Y,.84],[R,.24]],hair:K,line:K,trim:'paper',hairStyle:n%3===1?'bald':'short',build:{height:1.72+hash(n,3)*.12},seed:40+n});
/** Tomás Paçó: Sporting kit, short dark hair, 1.80 m (inferred); no shirt number is claimed */
const TOMAS:AthleteStyle={...SCP(0),skin:SKIN_T,hairStyle:'short',build:BUILD_T,seed:3};
/** Zicky Té (1.85 m, Wikipedia): Sporting kit */
const ZICKY:AthleteStyle={...SCP(1),skin:SKIN_Z,hairStyle:'short',build:BUILD_Z,seed:6};
/** João Matos, Sporting's captain (lifts the trophy; captain's band in yellow) */
const MATOS:AthleteStyle={...SCP(2),skin:[[Y,.78],[R,.3]],hairStyle:'balding',trim:Y,build:{height:1.8},seed:44};
/** Barça (kit inferred): navy with red stripes, navy shorts, red socks */
const BAR=(n:number):AthleteStyle=>({shirt:K,pattern:'stripes',patternInk:[R,.95],shorts:[K,.9],socks:[R,.95],boots:K,skin:n%2?[[Y,.8],[R,.26]]:[[R,.52],[Y,.5],[K,.2]],hair:K,line:K,trim:[R,.85],hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,5)*.12},seed:20+n});
/** Guitta, Sporting's keeper (dark kit inferred); Dídac Plana, Barça's keeper (red kit inferred) */
const GUITTA:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:G,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.77},seed:61};
const PLANA:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:62};
/** the lesson: Tomás in a plain green training top; team-mates in paper tops; the defender in a navy bib (no team claimed) */
const TOMAS_T:AthleteStyle={...TOMAS,shirt:[G,.9],pattern:'plain',patternInk:undefined,shorts:K,socks:K,trim:'paper'};
const MATE=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:n?[[R,.5],[Y,.55],[K,.22]]:[[Y,.8],[R,.24]],hair:K,line:K,trim:G,hairStyle:n?'curly':'short',build:{height:1.76},seed:70+n});
const DEMO_D:AthleteStyle={shirt:[K,.8],shorts:K,socks:K,boots:'paper',skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:Y,hairStyle:'short',build:{height:1.8,bulk:1.04},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
type AOpt={detail?:'auto'|'low'|'mid'|'high';smear?:number;xf?:Xf;inv?:Xf};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:AOpt={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st,o.xf,o.inv),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a RIGHT-foot strike's contact, facing +X (our coords, relative to the place) */
function strikeOff(build:Build):[number,number]{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),build,{yaw:0}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1,m=toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);return[m[0],m[2]];}
const rot2=(o:[number,number],yaw:number):[number,number]=>[o[0]*Math.cos(yaw)-o[1]*Math.sin(yaw),o[0]*Math.sin(yaw)+o[1]*Math.cos(yaw)];
const OFF_T=strikeOff(BUILD_T),OFF_Z=strikeOff(BUILD_Z);

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
type BallS={X:number;Y:number;Z:number;moving:boolean;spin:number};
/** a court ball on a stage (through xf): ground shadow, optional yellow trail, the ball */
function drawBall(s:Sheet,st:Stage,xf:Xf,b:BallS,seed:number,o:{min?:number;trail?:Pt[];smear?:number;dir?:number}={}){
 const[a,z]=xf(b.X,b.Z),p=proj(st,a,b.Y,z),g=proj(st,a,0,z),r=Math.max(o.min??9,kAt(st,z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);
 if(o.trail&&o.trail.length>1){const trp=ribbon(o.trail,r*1.3,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: EMPTY stands (attendance 0, behind closed doors) ----------------
/** stepped navy rows of empty tip-up seats (paper slots), roof lights; no crowd is drawn — the 2021 final was played behind closed doors */
function emptyStands(s:Sheet,top:number,kw:number,scroll=0){
 const span=9000,rowH=.55*kw;s.fill(K,rectPath(-span,top-span,span*2,span),.4);
 const rows=new Path2D();for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.55);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const seats=new Path2D(),gap=.5*kw,off=scroll*kw,x0=-3200,x1=3200;
 for(let r=0;r<11;r++){const y=top-(r+.62)*rowH;for(let x=x0-((off%gap)+gap)%gap;x<x1;x+=gap){if(hash(Math.round((x+off)/gap)*7+r*131,9)<.06)continue;seats.rect(x,y-rowH*.26,gap*.62,rowH*.3);}}
 s.knockout(seats,.42);s.fill(G,seats,.22);
 // an aisle every so often (stairs), knocked out lighter
 const aisles=new Path2D();for(let i=-8;i<=8;i++){const ax=i*9*kw-((off*.9)%(9*kw));aisles.rect(ax,top-12*rowH,gap*.8,12*rowH);}s.fill(K,aisles,.35);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw;for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the warm sports floor (inferred colour): yellow + a red tint, run-off a step darker */
function floorBase(s:Sheet,wall:number,court:Pt[]){const span=9000;s.fill(Y,rectPath(-span,wall,span*2,span),.5);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const c=polyPath(court,true);s.knockout(c,.3);s.fill(Y,c,.55);s.fill(R,c,.08);}

// ---- MAIN-STAND court (IDX): Barça's goal at X = +20 (inferred end), the far boards at Z = 21.2 ----
const TOUCH_FAR=20,BOARDS=21.2,GX=20,POST_N=8.5,POST_F=11.5,GH=2;
function courtSide(s:Sheet,st:Stage,o:{bulge?:number;bz?:number;by?:number;keeper?:()=>void;board?:()=>void}={}){
 const{bulge=0,bz=10,by=.3}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 floorBase(s,wall,floorQuad(st,-20,0,20,TOUCH_FAR));
 const lines=new Path2D();
 for(const sg of[1,-1]){const arc:Pt[]=[],gx=GX*sg;
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([gx-sg*6*Math.sin(a),POST_N-6*Math.cos(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([gx-sg*6*Math.sin(a),POST_F+6*Math.cos(a)]);}
  lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[gx-sg*6,gx-sg*10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GX,0],[GX,TOUCH_FAR]],[[-GX,0],[-GX,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 emptyStands(s,wall-board,kw,st.cx);
 o.board?.();
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
/** Barça's goal (right end), net going +X; bulge pushes the back of the net outward round (bz, by) */
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

// ---- REPLAY court through FWD (stage coords: Sporting's goal line z = 0, Barça's goal line z = 40, touchlines x = ±10, far wall behind Barça's goal) ----
const WALL_F=41.6;
function endCourt(s:Sheet,st:Stage){
 const wall=proj(st,0,0,WALL_F)[1],kw=kAt(st,WALL_F),span=9000;
 floorBase(s,wall,floorQuad(st,-10,0,10,40));
 const lines=new Path2D();
 for(const[z0,dir] of[[0,1],[40,-1]] as [number,number][]){const arc:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([-1.5-6*Math.cos(a),z0+dir*6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([1.5+6*Math.cos(a),z0+dir*6*Math.sin(a)]);}
  const q=arc.filter(p=>p[1]>st.cz+1);if(q.length>1)lines.addPath(polyPath(floorStrip(st,q,.05),true));for(const d of[6,10]){const z=z0+dir*d;if(z>st.cz+1)lines.addPath(polyPath(floorRing(st,0,z,.12,12),true));}}
 const zc=Math.max(0,st.cz+1);
 for(const seg of[[[-10,zc],[10,zc]],[[-10,zc],[-10,40]],[[10,zc],[10,40]],[[-10,20],[10,20]],[[-10,40],[10,40]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,20+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALL_F)[0],x1=proj(st,i*2.4+1.9,0,WALL_F)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 emptyStands(s,wall-board,kw,0);
}
/** Barça's goal seen from the front through FWD (goal line z = 40): the net behind (drawn first), then the red-banded frame (drawn last) */
function farNet(s:Sheet,st:Stage,ripple:number){
 const Db=.95,Dt=.55,back=(x:number,Yh:number):Pt=>proj(st,x,Yh+ripple*.06*Math.sin(x*9),40+lerp(Db,Dt,Yh/GH));
 const hull=[proj(st,-1.5,0,40),back(-1.5,0),back(-1.5,GH),proj(st,-1.5,GH,40),proj(st,1.5,GH,40),back(1.5,GH),back(1.5,0),proj(st,1.5,0,40)];
 const np=polyPath(hull,true);s.knockout(np,.55);s.fill(K,np,.18);
 const mesh=new Path2D();for(let x=-1.5;x<=1.5+1e-6;x+=.25){const a=back(x,0),b=back(x,GH);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.25){const a=back(-1.5,Yh),b=back(1.5,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.4,kAt(st,40)*.02),.55);
}
function farPosts(s:Sheet,st:Stage){
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,40)*.014);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:4,taper:0,wobble:.4}));};
 for(const x of[-1.5,1.5]){const P=(Yh:number,dx:number):Pt=>proj(st,x+dx,Yh,40);quad([P(0,-w),P(0,w),P(GH+w,w),P(GH+w,-w)]);for(let k=0;k<8;k+=2)bands.addPath(polyPath([P(k/8*GH,-w),P(k/8*GH,w),P((k+1)/8*GH,w),P((k+1)/8*GH,-w)],true));}
 const B=(x:number,dy:number):Pt=>proj(st,x,GH+dy,40);quad([B(-1.5,-w),B(1.5,-w),B(1.5,w),B(-1.5,w)]);
 for(let k=0;k<12;k+=2)bands.addPath(polyPath([B(lerp(-1.5,1.5,k/12),-w),B(lerp(-1.5,1.5,(k+1)/12),-w),B(lerp(-1.5,1.5,(k+1)/12),w),B(lerp(-1.5,1.5,k/12),w)],true));
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE: Zadar 2021, Barça 2–0 up; Tomás takes his time and plays it across; Zicky controls and rolls it in: 2–1 =================
const C1={y21:A(0,'The 2021'),lead:A(0,'Barcelona'),then:A(0,'Then Tom'),across:A(0,'plays it'),zicky:A(0,'Zicky'),rolls:A(0,'rolls it'),two:A(0,'Two one'),end:AUTH[0].seconds};
/** the build-up (inferred): a team-mate (S0) in Sporting's half rolls it to Tomás on the near side */
const S0P:[number,number]=[-2.6,10.4];
const T_RCV=C1.then-.55,TR:[number,number]=[4.4,5.0];
/** the pass: contact on "plays it across", a diagonal across to Zicky's feet (≈8.6 m in ≈0.95 s) */
const T_PASS=C1.across+.12,T_ARR=T_PASS+.95;
const TP:[number,number]=[9.5,5.4];// Tomás's plant for the pass
const ZP:[number,number]=[15.5,12.1];// Zicky's plant
const YAW_IN=(()=>{const tb=[TP[0]+6,TP[1]];return yawTo(tb[0]-ZP[0],tb[1]-ZP[1]);})();
/** the finish: Zicky stops it with his sole, turns with it, rolls it low into the far corner past Plana */
const T_SHOT=C1.rolls+.06,T_IN=T_SHOT+.55;
const TGT:[number,number]=[GX+.05,11.15];
const YAW_G=yawTo(TGT[0]-ZP[0],TGT[1]-ZP[1]);
const ZB_SHOT:[number,number]=(()=>{const o=rot2(OFF_Z,YAW_G);return[ZP[0]+o[0],ZP[1]+o[1]];})();
const ZB_IN:[number,number]=(()=>{const o=rot2(OFF_Z,YAW_IN);return[ZP[0]+o[0],ZP[1]+o[1]];})();
const YAW_P=yawTo(ZB_IN[0]-TP[0],ZB_IN[1]-TP[1]);
const TB:[number,number]=(()=>{const o=rot2(OFF_T,YAW_P);return[TP[0]+o[0],TP[1]+o[1]];})();
const CARRY_DIR=(()=>{const dx=TP[0]-TR[0],dz=TP[1]-TR[1],l=Math.hypot(dx,dz);return[dx/l,dz/l] as [number,number];})();
const T_C1=T_PASS-.42;
/** Zicky's body yaw: faces the pass → sole stop → turns with it (through facing the camera) → faces the goal for the roll */
const zYaw=(T:number)=>lerp(YAW_IN,YAW_G,sm(T_ARR+.08,T_SHOT-.2,T,easeIO));
function liveBall(T:number):BallS{
 const roll=(a:[number,number],b:[number,number],t0:number,t1:number,e=easeOut):BallS=>{const u=sm(t0,t1,T,e);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),moving:u>0&&u<1,spin:u*8};};
 const tIn:[number,number]=[TR[0]+CARRY_DIR[0]*.5,TR[1]+CARRY_DIR[1]*.5];
 if(T<T_RCV-1.3)return{X:S0P[0]+.5,Y:BALL_R,Z:S0P[1]-.1,moving:false,spin:0};
 if(T<T_RCV)return roll([S0P[0]+.5,S0P[1]-.1],tIn,T_RCV-1.3,T_RCV);
 // the carry: ahead of his feet, touched every other stride, slowing into the plant
 if(T<T_C1){const u=sm(T_RCV,T_C1,T,easeIO),d=Math.hypot(TB[0]-tIn[0],TB[1]-tIn[1])*u,touch=.1*Math.abs(Math.sin((T-T_RCV)*5));
  const dx=(TB[0]-tIn[0])/Math.max(.01,Math.hypot(TB[0]-tIn[0],TB[1]-tIn[1])),dz=(TB[1]-tIn[1])/Math.max(.01,Math.hypot(TB[0]-tIn[0],TB[1]-tIn[1]));
  return{X:tIn[0]+dx*(d+touch*(1-u)),Y:BALL_R,Z:tIn[1]+dz*(d+touch*(1-u)),moving:true,spin:(T-T_RCV)*9};}
 if(T<T_PASS)return{X:TB[0],Y:BALL_R,Z:TB[1],moving:false,spin:(T_C1-T_RCV)*9};
 if(T<T_ARR+.02)return{...roll(TB,ZB_IN,T_PASS,T_ARR,t=>1-(1-t)*(1-t)*.6-.4*(1-t)),moving:true,spin:T*14};
 // under his sole, then turned round with him on the same radius
 if(T<T_SHOT){const o=rot2(OFF_Z,zYaw(T));return{X:ZP[0]+o[0],Y:BALL_R,Z:ZP[1]+o[1],moving:false,spin:T*3};}
 if(T<T_IN){const u=sm(T_SHOT,T_IN,T,linear);return{X:lerp(ZB_SHOT[0],TGT[0],u),Y:BALL_R,Z:lerp(ZB_SHOT[1],TGT[1],u),moving:true,spin:20+u*18};}
 const d=sm(T_IN,T_IN+.35,T,easeOut);return{X:lerp(TGT[0],GX+.8,d),Y:BALL_R,Z:TGT[1]+.08*d,moving:false,spin:40};
}
/** a calm head: chin up, scanning left and right while he carries (neckY swings between the far side and straight ahead) */
const headUp=(p:Pose,T:number,amt:number):Pose=>({...p,neckP:lerp(p.neckP,-.12,amt),neckY:lerp(p.neckY,.55*Math.sin(T*2.2)+.25,amt)});
/** Tomás live: waits → receives → carries calmly, head up → right-foot pass across → turns and runs to Zicky, arms up */
const liveT:Gen=T=>{
 let X:number,Z:number,pose:Pose,yaw:number;
 if(T<T_RCV){const u=sm(T_RCV-1.4,T_RCV,T,easeIO);X=lerp(TR[0]-1.6,TR[0],u);Z=lerp(TR[1]-.4,TR[1],u);yaw=lerp(yawTo(S0P[0]-TR[0],S0P[1]-TR[1])+.3,yawTo(CARRY_DIR[0],CARRY_DIR[1])+.4,sm(T_RCV-.6,T_RCV,T));
  pose=blendPose(blendPose(stand(),backpedal(T*1.1),.3),runCycle(T*runCadence(.4),{speed:.4}),Math.min(1,u*3)*(1-sm(T_RCV-.4,T_RCV,T)));pose=headUp(pose,T,.5);}
 else if(T<T_C1){const u=sm(T_RCV,T_C1,T,easeIO);X=lerp(TR[0],TP[0],u);Z=lerp(TR[1],TP[1],u);
  yaw=lerp(yawTo(CARRY_DIR[0],CARRY_DIR[1])+.4*(1-sm(T_RCV,T_RCV+.4,T)),YAW_P-.25,sm(T_C1-.6,T_C1,T,easeIO));
  pose=headUp(dribble((T-T_RCV)*1.5,{foot:'r',speed:.45}),T,.75);}
 else if(T<T_PASS+.7){X=TP[0];Z=TP[1];yaw=lerp(YAW_P-.25,YAW_P,sm(T_C1,T_PASS-.1,T));
  const st=key(T,[[T_C1,.2],[T_PASS-.16,.4],[T_PASS,STRIKE_CONTACT],[T_PASS+.7,.9]],linear);
  pose=blendPose(dribble((T_C1-T_RCV)*1.5,{foot:'r',speed:.45}),strike(st,{foot:'r',power:.45}),sm(T_C1,T_C1+.14,T));
  pose={...pose,neckP:lerp(pose.neckP,.2,sm(T_PASS-.3,T_PASS,T))};}
 else{const e=liveT(T_PASS+.699),u=sm(T_PASS+.7,T_IN+.9,T,easeIO),goal=sm(T_IN,T_IN+.4,T),tgt:[number,number]=[ZP[0]-1.2,ZP[1]-1.6];
  X=lerp(e.X,tgt[0],u);Z=lerp(e.Z,tgt[1],u);yaw=lerp(e.yaw,yawTo(tgt[0]-e.X,tgt[1]-e.Z),sm(T_PASS+.7,T_PASS+1,T));
  pose=blendPose(strike(.9,{foot:'r',power:.45}),runCycle(T*runCadence(.6),{speed:.6}),sm(T_PASS+.7,T_PASS+1,T));pose=blendPose(pose,celebrate((T-T_IN)*1.2,{kind:'arms'}),goal*(u>.9?1:.6));}
 return{pose,yaw,X,Z};
};
/** Zicky live: drifts into space on the far side → sole stop → turns with it → right foot rolls it in → runs off, arms out */
const SOLE=posed({lHipF:6,lKnee:22,rHipF:34,rKnee:52,rAnk:-24,lean:12,neckP:34,lShA:34,rShA:28,lElb:34,rElb:28});
const liveZ:Gen=T=>{
 let X=ZP[0],Z=ZP[1],pose:Pose,yaw=zYaw(T);
 if(T<T_ARR-.2){const u=sm(T_RCV,T_ARR-.35,T,easeIO);X=lerp(ZP[0]+.6,ZP[0],u);Z=lerp(ZP[1]+2.2,ZP[1],u);yaw=lerp(yawTo(-1,-.3),YAW_IN,sm(T_PASS-.3,T_PASS+.3,T));
  const mv=u>0&&u<1?1:0;pose=blendPose(blendPose(stand(),backpedal(T*1.2),.3),runCycle(T*runCadence(.5),{speed:.5}),mv*Math.min(1,u*3)*(1-u));}
 else if(T<T_SHOT-.22){pose=blendPose(stand(),SOLE,sm(T_ARR-.2,T_ARR,T,easeIO)*(1-.4*sm(T_ARR+.3,T_SHOT-.25,T)));}
 else if(T<T_SHOT+.6){const st=key(T,[[T_SHOT-.22,.3],[T_SHOT,STRIKE_CONTACT],[T_SHOT+.6,.86]],linear);pose=blendPose(blendPose(stand(),SOLE,.6),strike(st,{foot:'r',power:.4}),sm(T_SHOT-.22,T_SHOT-.12,T));}
 else{const run=T-T_SHOT-.6,u=sm(T_SHOT+.6,T_SHOT+1,T,easeIO),dir=-1.1;X=ZP[0]+Math.cos(dir)*run*2.4*u;Z=ZP[1]+Math.sin(dir)*run*2.4*u;yaw=lerp(YAW_G,dir,u);
  pose=blendPose(strike(.86,{foot:'r',power:.4}),celebrate(run*1.3,{kind:'run'}),u);}
 return{pose,yaw,X,Z};
};
/** the others (inferred shape): Sporting S0 (the ball-player behind), S1 far ala, S2 near ala making a run; Barça B0 in front of Tomás,
 *  B1 goal side near the near post, B2 with S2, B3 deep far side. After the goal the Sporting pair run in, Barça heads drop. */
type Mark={p:[number,number][];t:number[]};
const SPORT:Mark[]=[
 {p:[S0P,S0P,[0.8,9.4],[4.2,8.2]],t:[0,T_RCV-1.3,T_PASS,T_IN+1]},
 {p:[[6.6,16.4],[8.2,16.2],[11.4,15.4],[13.4,13.8]],t:[0,T_RCV,T_ARR,T_IN+1]},
 {p:[[9.6,2.2],[11.2,2.0],[14.6,2.8],[14.8,6.8]],t:[0,T_RCV,T_ARR,T_IN+1]},
];
const BARM:Mark[]=[
 {p:[[9.2,6.9],[11.6,6.9],[12.7,7.3],[12.2,8.4]],t:[0,T_RCV,T_PASS,T_IN+1]},
 {p:[[16.4,8.2],[16.7,8.6],[16.1,10.9],[17.2,10.2]],t:[0,T_PASS,T_SHOT,T_IN+1]},
 {p:[[11.2,3.4],[12.4,3.2],[15.4,3.6],[16.2,4.2]],t:[0,T_RCV,T_ARR,T_IN+1]},
 {p:[[5.4,13.4],[7.2,13.2],[10.4,13.6],[11.2,13.4]],t:[0,T_RCV,T_ARR,T_IN+1]},
];
function markAt(m:Mark,T:number):[number,number]{let k=0;while(k<m.t.length-2&&T>m.t[k+1])k++;const u=sm(m.t[k],m.t[k+1],T,easeIO);return[lerp(m.p[k][0],m.p[k+1][0],u),lerp(m.p[k][1],m.p[k+1][1],u)];}
const HEAD_DOWN=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20});
const moverGen=(m:Mark,team:'s'|'b',i:number):Gen=>T=>{const[X,Z]=markAt(m,T),b=liveBall(T),v=markAt(m,T+.1),mv=Math.hypot(v[0]-X,v[1]-Z)*10,post=sm(T_IN+.3,T_IN+1.2,T);
 let pose=mv>.9?runCycle(T*runCadence(Math.min(1,mv/6))+i*.3,{speed:Math.min(1,mv/6)}):blendPose(stand(),backpedal(T*1.2+i*.2),.4);
 if(team==='s'&&i===0)pose=blendPose(pose,posed({lHipF:-10,rHipF:36,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,pulse(T,T_RCV-1.35,.3)*2));
 if(team==='b'&&i===1)pose=blendPose(pose,lunge(key(T,[[T_SHOT-.35,0],[T_SHOT,.6],[T_SHOT+.6,.9]],linear),{side:'l'}),sm(T_SHOT-.45,T_SHOT-.25,T)*(1-post));
 if(team==='b')pose=blendPose(pose,HEAD_DOWN,post);else pose=blendPose(pose,celebrate(T*1.1+i,{kind:'arms'}),post*.8);
 return{pose,yaw:team==='b'&&post>0?lerp(yawTo(b.X-X,b.Z-Z),FACE_LEFT,post*.6):yawTo(b.X-X,b.Z-Z),X,Z};};
const liveGuitta:Gen=T=>({pose:keeperSet(T*1.2),yaw:FACE_RIGHT,X:-19.1,Z:10+.4*Math.sin(T*.4)});
/** Plana: set on the near side (Tomás's side), shuffles across after the pass, dives to his right — too late, the ball rolls past */
const livePlana:Gen=T=>{let pose=keeperSet(T*1.3);const d=sm(T_SHOT,T_SHOT+.7,T,linear);if(T>=T_SHOT)pose=blendPose(pose,keeperDive(d*.8,{side:'r',height:.08}),sm(T_SHOT,T_SHOT+.08,T));
 return{pose,yaw:FACE_LEFT+.18,X:GX-.8,Z:lerp(9.2,9.9,sm(T_PASS,T_SHOT,T,easeIO))};};
const liveCam=(T:number)=>({x:key(T,mono([[0,3.6],[T_RCV-1.3,3.4],[T_RCV,6.2],[C1.then+.4,7.6],[T_PASS,10.6],[T_ARR,13.2],[T_SHOT,14.6],[T_IN+.4,15.2],[C1.end,14.6]]),easeInOutSine),
 zoom:key(T,mono([[0,.66],[T_RCV,.74],[C1.then+.5,.86],[T_PASS-.2,.84],[T_ARR,.8],[T_SHOT,.86],[T_IN+.6,.94],[C1.end,1.0]]),easeInOutSine),
 y:key(T,mono([[0,1260],[T_RCV,1300],[T_PASS,1280],[T_SHOT,1230],[C1.end,1260]]),easeInOutSine)});
/** the main-stand broadcast camera: 16 m outside the near touchline, 7.5 m up */
const bst=(camX:number):Stage=>({F:4200,eye:7.5,cx:camX,cz:-16});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const b=liveBall(T);
 courtSide(s,st,{bulge:.4*sm(T_IN-.05,T_IN+.05,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.08*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:TGT[1],by:.3,
  keeper:()=>{athlete(s,st,livePlana,T,PLANA,{detail:'low'});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SPORT.forEach((m,i)=>{const g=moverGen(m,'s',i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,SCP(i+3),{detail:'low'})});});
 BARM.forEach((m,i)=>{const g=moverGen(m,'b',i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BAR(i),{detail:'low'})});});
 items.push({z:10,draw:()=>athlete(s,st,liveGuitta,T,GUITTA,{detail:'low'})});
 items.push({z:liveZ(T).Z,draw:()=>athlete(s,st,liveZ,T,ZICKY,{smear:T>T_SHOT-.15&&T<T_SHOT+.2?.1:0})});
 items.push({z:liveT(T).Z,draw:()=>athlete(s,st,liveT,T,TOMAS,{smear:T>T_PASS-.15&&T<T_PASS+.2?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const tr:Pt[]=[];if(b.moving&&(T>T_PASS&&T<T_ARR||T>T_SHOT&&T<T_IN))for(let k=0;k<=8;k++){const q=liveBall(Math.max(T>T_SHOT?T_SHOT:T_PASS,T-.22+k*.0275));tr.push(proj(st,q.X,q.Y,q.Z));}
  drawBall(s,st,IDX,b,18,{trail:tr});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** a figure's chest on a stage (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},build:Build,r=.09,xf:Xf=IDX):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=P3(st,xf,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,depthOf(xf,ch[0],ch[2])),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveT(tt),BUILD_T,.12));},still:T_PASS+.05};

// ================= chapter 2 — REPLAY: slow motion, a long lens low behind Sporting's attack: takes his time, finds Zicky free, passes it across =================
const C2={watch:A(1,'Watch'),time:A(1,'takes his'),finds:A(1,'He finds'),free:A(1,'who is'),passes:A(1,'passes it'),zc:A(1,'Zicky controls'),scores:A(1,'and scores'),calm:A(1,'calm pass'),end:AUTH[1].seconds};
/** replay seconds → live seconds: ≈0.4–0.8× slow motion (never faster than real time) */
const repT=(t:number)=>key(t,[[0,T_RCV-.2],[C2.time,T_RCV+.35],[C2.finds,T_C1-.55],[C2.free,T_C1-.2],[C2.passes+.1,T_PASS],[C2.zc,T_ARR+.05],[C2.scores+.15,T_SHOT+.12],[C2.calm,T_IN+.3],[C2.end,T_IN+.9]],linear);
const stR:Stage={F:2600,eye:6.2,cx:.6,cz:-6};
const RO={xf:FWD,inv:FWD_INV};
const RP=(q:[number,number],h=.9):Pt=>P3(stR,FWD,q[0],h,q[1]);
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=repT(tt),Tcam=repT(t),kick=pulse(Tcam,T_PASS,.4),net=pulse(Tcam,T_IN,.6);
  const fT=RP(TP),fZ=RP(ZP),fG=RP([GX,10],.9);
  camPath(s,t,[[0,fT[0]+40,fT[1]-10,2.3],[C2.time,fT[0]+20,fT[1]-20,2.5],[C2.finds,lerp(fT[0],fZ[0],.4),lerp(fT[1],fZ[1],.4)-10,2.05],[C2.passes,lerp(fT[0],fZ[0],.5),lerp(fT[1],fZ[1],.5)-10,1.95],
   [C2.zc,lerp(fZ[0],fG[0],.3),fZ[1]-10,2.2],[C2.scores+.3,lerp(fZ[0],fG[0],.5),lerp(fZ[1],fG[1],.5)-10,2.15],[C2.calm,lerp(fT[0],fG[0],.5),lerp(fT[1],fG[1],.5),1.75],[C2.end,lerp(fT[0],fG[0],.5),lerp(fT[1],fG[1],.5),1.8]],
   [5*kick*Math.sin(t*90),4*net*Math.sin(t*60)]);
  const b=liveBall(T);
  endCourt(s,stR);
  // "takes his time": a slow yellow ring breathes under him; "He finds": a yellow sight line from his head to Zicky;
  // "who is free": a yellow dashed ring round Zicky (no defender inside it); "passes it across" / "calm pass": the dashed pass line + arrow
  const tr0=sm(C2.time,C2.time+.4,tt,easeOut)*(1-sm(C2.passes-.2,C2.passes+.2,tt));
  if(tr0>.02){const p=liveT(T);floorDashRing(s,stR,Y,p.X,p.Z,.75+.08*Math.sin(tt*3),9,201,tr0,FWD);}
  const fr=easeOutBack(sm(C2.free,C2.free+.35,tt))*(1-sm(C2.scores+.4,C2.scores+.8,tt));
  if(fr>.02)floorDashRing(s,stR,Y,ZP[0]+.2,ZP[1]+.1,1.5,10,202,fr,FWD);
  const pl=sm(C2.passes-.1,C2.zc,tt,easeOut),pg=Math.max(pl*(1-sm(C2.scores,C2.scores+.4,tt)),sm(C2.calm-.1,C2.calm+.5,tt,easeOut));
  if(pg>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=L2(TB,ZB_IN,k/12);pts.push(RP(q as [number,number],0));}dashed(s,Y,pts,8,203,{dash:26,progress:pg});if(pg>.95)arrowHead(s,Y,pts,24,204);}
  const its:{z:number;draw:()=>void}[]=[];
  its.push({z:40.9,draw:()=>farNet(s,stR,net)});
  its.push({z:40,draw:()=>farPosts(s,stR)});
  SPORT.forEach((m,i)=>{const g=moverGen(m,'s',i),p=g(T);its.push({z:depthOf(FWD,p.X,p.Z),draw:()=>athlete(s,stR,g,T,SCP(i+3),{...RO,detail:"low"})});});
  BARM.forEach((m,i)=>{const g=moverGen(m,'b',i),p=g(T);its.push({z:depthOf(FWD,p.X,p.Z),draw:()=>athlete(s,stR,g,T,BAR(i),{...RO,detail:"low"})});});
  const kp=livePlana(T);its.push({z:depthOf(FWD,kp.X,kp.Z),draw:()=>athlete(s,stR,livePlana,T,PLANA,{...RO,detail:'mid'})});
  const zp=liveZ(T);its.push({z:depthOf(FWD,zp.X,zp.Z),draw:()=>athlete(s,stR,liveZ,T,ZICKY,{...RO,detail:'high',smear:T>T_SHOT-.2&&T<T_SHOT+.25?.14:0})});
  const tp=liveT(T);its.push({z:depthOf(FWD,tp.X,tp.Z),draw:()=>{
   athlete(s,stR,liveT,T,TOMAS,{...RO,detail:'high',smear:T>T_PASS-.2&&T<T_PASS+.25?.14:0});
   // the sight line: from his eyes to Zicky, on "He finds"
   const sl=sm(C2.finds-.05,C2.finds+.45,tt,easeOut)*(1-sm(C2.passes-.1,C2.passes+.3,tt));
   if(sl>.02){const sk=solve(tp.pose,BUILD_T,placeAt(tp.X,tp.Z,tp.yaw)),hd=toMine(sk.head),a=P3(stR,FWD,hd[0],hd[1]+.05,hd[2]),z2=solve(zp.pose,BUILD_Z,placeAt(zp.X,zp.Z,zp.yaw)),zh=toMine(z2.head),c=P3(stR,FWD,zh[0],zh[1]+.05,zh[2]);
    dashed(s,Y,[a,L2(a,c,.5),c],6,205,{dash:18,progress:sl});}}});
  const bz=depthOf(FWD,b.X,b.Z);
  its.push({z:bz-.02,draw:()=>{const tr:Pt[]=[];if(b.moving&&(T>T_SHOT&&T<T_IN))for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_SHOT,T-.14+k*.0175));tr.push(P3(stR,FWD,q.X,q.Y,q.Z));}
   const o=drawBall(s,stR,FWD,b,97,{min:8,trail:tr});if(T>=T_PASS&&T<T_PASS+.2)sparkBurst(s,Y,o.p[0],o.p[1],o.r*2.6,{n:10,seed:98,g:easeOut(sm(T_PASS,T_PASS+.15,T))});}});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(T>=T_IN&&T<T_IN+.6){const p=RP(TGT,.3);sparkBurst(s,Y,p[0],p[1],110,{n:12,seed:99,g:easeOut(sm(T_IN,T_IN+.25,T))*(1-sm(T_IN+.35,T_IN+.6,T))});}
 },
 aperture(t0){const{tt}=clock(1,t0),T=repT(tt);return aperture(chestPts(stR,liveT(T),BUILD_T,.14,FWD));},
 still:C2.passes+.3,
};

// ================= chapter 3 — FULL TIME (confirmed things only): the board runs through the comeback to 3–4; the whistle; the trophy =================
const C3={keep:A(2,'Sporting keep'),from:A(2,'From two'),win:A(2,'they win'),ft:A(2,'four three'),champ:A(2,'Champions'),end:AUTH[2].seconds};
/** the board's score (Barça listed first): 2–1 → 2–2 (27:19) → 2–3 (30:16) → 2–4 (36:26) → 3–4 (37:05) */
const FLIPS:[number,[number,number]][]=[[0,[2,1]],[C3.keep+.55,[2,2]],[C3.from+.3,[2,3]],[C3.win-.1,[2,4]],[C3.ft-.05,[3,4]]];
const scoreAt=(t:number)=>{let s=FLIPS[0][1];for(const f of FLIPS)if(t>=f[0])s=f[1];return s;};
const lastFlip=(t:number)=>{let s=-9;for(const f of FLIPS)if(t>=f[0]&&f[0]>0)s=f[0];return s;};
const SEG:number[][]=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1]];
function digit(p:Path2D,x:number,y:number,w:number,h:number,n:number){const t=w*.2,on=SEG[n]||SEG[0],hh=h/2;
 const bars:[number,number,number,number][]=[[x+t,y,w-2*t,t],[x+w-t,y+t*.5,t,hh-t*.5],[x+w-t,y+hh,t,hh-t*.5],[x+t,y+h-t,w-2*t,t],[x,y+hh,t,hh-t*.5],[x,y+t*.5,t,hh-t*.5],[x+t,y+hh-t/2,w-2*t,t]];
 bars.forEach((b,i)=>{if(on[i])p.rect(b[0],b[1],b[2],b[3]);});}
/** the hanging arena board over the far side (inferred look): Barça tab (red) left, Sporting tab (green) right, lit yellow digits */
const BOARD:[number,number,number]=[-1.5,5.2,17];
function scoreboard(s:Sheet,st:Stage,sc:[number,number],flash:number){
 const c=proj(st,BOARD[0],BOARD[1],BOARD[2]),k=kAt(st,BOARD[2]),w=4.4*k,h=1.7*k,x=c[0]-w/2,y=c[1]-h/2;
 const cab=new Path2D();cab.moveTo(x+w*.2,y);cab.lineTo(x+w*.2,y-6*k);cab.moveTo(x+w*.8,y);cab.lineTo(x+w*.8,y-6*k);s.stroke(K,cab,Math.max(2,k*.04),.8);
 const box=rectPath(x,y,w,h);s.knockout(box);s.fill(K,box,.92);
 s.fill(R,rectPath(x+w*.05,y+h*.14,w*.16,h*.1));s.fill(K,rectPath(x+w*.05,y+h*.3,w*.16,h*.1),.6);
 s.fill(G,rectPath(x+w*.79,y+h*.14,w*.16,h*.1));s.knockout(rectPath(x+w*.79,y+h*.3,w*.16,h*.1),.8);
 const dg=new Path2D(),dw=w*.13,dh=h*.62,dy=y+h*.2;digit(dg,x+w*.28,dy,dw,dh,sc[0]);dg.rect(x+w*.47,dy+dh*.45,w*.06,dh*.1);digit(dg,x+w*.59,dy,dw,dh,sc[1]);
 s.knockout(dg);s.fill(Y,dg,.75+.25*Math.min(1,flash));
 if(flash>.05)s.fill(Y,ribbon([[x-8,y-8],[x+w+8,y-8],[x+w+8,y+h+8],[x-8,y+h+8],[x-8,y-8]],10*flash,{seed:91,taper:0,wobble:1}),Math.min(1,flash));
}
/** a low courtside camera (bench side), 2 m up */
const st3=(x:number):Stage=>({F:2600,eye:2.0,cx:x,cz:-7});
/** the whistle group (inferred detail of "Sporting celebrations"): Tomás, Zicky, Matos and two team-mates jump together; Guitta runs in */
const GRP:[number,number]=[-1.6,7.2];
const GRP_OFF:[number,number][]=[[-.55,-.35],[.55,-.3],[0,.45],[-1.05,.45],[1.05,.5]];// Tomás, Zicky, Matos, S3, S4
const GRP_FROM:[number,number][]=[[-5.6,5.4],[3.2,9.6],[-4.2,12.4],[-8.4,9.2],[2.6,4.0]];
/** the trophy (a cut): Matos in the middle lifting it, Tomás on his right, Zicky on his left, the others behind */
const TRO:[number,number]=[-1.2,6.8];
const TRO_OFF:[number,number][]=[[-.85,.1],[.85,.12],[0,0],[-.5,.9],[.55,.95]];
const LIFT=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:-6,neckP:-30,lShF:170,rShF:170,lShA:14,rShA:14,lElb:22,rElb:22,lHand:.3,rHand:.3});
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
const ftSCP=(i:number):Gen=>t=>{
 if(t>=C3.champ){const[ox,oz]=TRO_OFF[i],X=TRO[0]+ox,Z=TRO[1]+oz;
  if(i===2)return{pose:blendPose(stand(),LIFT,sm(C3.champ,C3.champ+.6,t,easeOutBack)),yaw:FACE_CAMERA,X,Z};
  return{pose:celebrate((t-C3.champ)*1.1+i*.37,{kind:'arms'}),yaw:FACE_CAMERA+(i%2?-.3:.3),X,Z};}
 const[fx,fz]=GRP_FROM[i],[ox,oz]=GRP_OFF[i],tx=GRP[0]+ox,tz=GRP[1]+oz,u=sm(C3.ft+.05,C3.ft+1.2,t,easeIO);
 const X=lerp(fx,tx,u),Z=lerp(fz,tz,u);
 let pose=blendPose(idle(t,i*.4),runCycle(t*runCadence(.85)+i*.3,{speed:.85}),Math.min(1,u*4)*(1-sm(C3.ft+1,C3.ft+1.25,t)));
 pose=blendPose(pose,celebrate((t-C3.ft)*1.2+i*.3,{kind:'arms'}),sm(C3.ft+1,C3.ft+1.3,t));
 const yaw=u<.9?yawTo(tx-fx,tz-fz):yawTo(GRP[0]-X,GRP[1]-Z);
 return{pose,yaw,X,Z};};
const SCP3=[TOMAS,ZICKY,MATOS,SCP(5),SCP(7)];
const ftGuitta:Gen=t=>{const u=sm(C3.ft+.2,C3.ft+1.8,t,easeIO);return{pose:u>0&&u<1?runCycle(t*runCadence(.9),{speed:.9}):t>=C3.champ?celebrate(t*1.1,{kind:'arms'}):blendPose(idle(t,2),celebrate(t*1.1,{kind:'arms'}),sm(C3.ft+1.6,C3.ft+1.9,t)),yaw:t>=C3.champ?FACE_CAMERA:FACE_RIGHT,
 X:t>=C3.champ?TRO[0]-1.6:lerp(-12.6,GRP[0]-2,u),Z:t>=C3.champ?TRO[1]+1.3:lerp(9.4,GRP[1]+.6,u)};};
const SAD:[number,number][]=[[4.8,11.8],[6.8,8.4],[3.2,14.6],[8.6,12.6]];
const ftBAR=(i:number):Gen=>t=>({pose:blendPose(idle(t,i+1),HEAD_DOWN,sm(C3.ft,C3.ft+.8,t)),yaw:FACE_LEFT+[.6,-.3,.9,-.8][i],X:SAD[i][0],Z:SAD[i][1]});
/** the cup (inferred shape): paper with a navy key line and yellow glints, held between Matos's hands */
function trophy(s:Sheet,st:Stage,g:Gen,t:number){const a=g(t),sk=solve(a.pose,MATOS.build,placeAt(a.X,a.Z,a.yaw)),l=toMine(sk.lHa),r=toMine(sk.rHa),m:[number,number,number]=[(l[0]+r[0])/2,(l[1]+r[1])/2+.14,(l[2]+r[2])/2],p=proj(st,m[0],m[1],m[2]),k=kAt(st,m[2]);
 const cup:Pt[]=[[-.2,-.5],[.2,-.5],[.16,-.28],[.05,-.2],[.05,-.06],[.13,0],[-.13,0],[-.05,-.06],[-.05,-.2],[-.16,-.28]].map(([x,y])=>[p[0]+x*k,p[1]+y*k] as Pt);
 const sp=smoothPts(cup,true,6,2),path=polyPath(sp,true);s.knockout(path);s.fill(Y,path,.18);s.fill(K,ribbon([...sp,sp[0]],Math.max(3,k*.02),{seed:141,close:true,wobble:.5}));
 s.fill(Y,polyPath(blob(p[0]-.08*k,p[1]-.4*k,.03*k,.07*k,142,{n:10}),true));}
const ftCam=(t:number)=>({x:key(t,mono([[0,-1.2],[C3.ft,-1.4],[C3.champ,-1.3],[C3.end,-1.2]]),easeInOutSine),
 zoom:key(t,mono([[0,1.5],[C3.win,1.45],[C3.ft+.1,1.3],[C3.ft+1.2,.98],[C3.champ-.05,1.0],[C3.champ+.05,1.18],[C3.end,1.26]]),easeInOutSine),
 y:key(t,mono([[0,-190],[C3.win,-180],[C3.ft+.1,-150],[C3.ft+1.2,150],[C3.champ-.05,160],[C3.champ+.05,190],[C3.end,200]]),easeInOutSine)});
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),c=ftCam(t),st=st3(c.x);
  cam(s,0,c.y,c.zoom);
  const lf=lastFlip(tt),flash=pulse(tt,lf,1.1)+.6*pulse(tt,C3.champ,1.2);
  courtSide(s,st,{board:()=>scoreboard(s,st,scoreAt(tt) as [number,number],flash)});
  type It={z:number;draw:()=>void};const items:It[]=[];
  const add=(g:Gen,style:AthleteStyle,d:'low'|'mid'|'auto'='auto')=>items.push({z:g(tt).Z,draw:()=>athlete(s,st,g,tt,style,{detail:d})});
  SCP3.forEach((sty,i)=>{const g=ftSCP(i);if(i===2&&tt>=C3.champ)items.push({z:g(tt).Z,draw:()=>{athlete(s,st,g,tt,sty,{detail:'auto'});trophy(s,st,g,tt);}});else add(g,sty);});
  add(ftGuitta,GUITTA,'mid');SAD.forEach((_,i)=>add(ftBAR(i),BAR(i),'low'));
  items.sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
  // "four three": the whistle — a yellow burst over the group; "Champions of": a yellow ring under the cup-lifter's group + sparks
  if(tt>=C3.ft&&tt<C3.ft+.9){const q=proj(st,GRP[0],2.4,GRP[1]);sparkBurst(s,Y,q[0],q[1],110,{n:12,seed:133,g:easeOut(sm(C3.ft,C3.ft+.35,tt))*(1-sm(C3.ft+.6,C3.ft+.9,tt))});}
  const ch=easeOutBack(sm(C3.champ+.1,C3.champ+.45,tt));floorDashRing(s,st,Y,TRO[0],TRO[1]+.3,1.6,10,134,ch);
  if(tt>=C3.champ+.2&&tt<C3.champ+1.2){const g=ftSCP(2)(tt),sk=solve(g.pose,MATOS.build,placeAt(g.X,g.Z,g.yaw)),hh=toMine(sk.lHa),q=proj(st,hh[0],hh[1]+.5,hh[2]);sparkBurst(s,Y,q[0],q[1],80,{n:10,seed:135,g:easeOut(sm(C3.champ+.2,C3.champ+.5,tt))*(1-sm(C3.champ+.8,C3.champ+1.2,tt))});}
  // the cut to the trophy: a paper flash
  const cut=1-sm(C3.champ,C3.champ+.22,tt);if(tt>=C3.champ&&cut>.02)s.knockout(rectPath(-9000,-9000,18000,18000),cut*.9);
 },
 aperture(t0){const{tt,tc}=clock(2,t0);return aperture(chestPts(st3(ftCam(tc).x),ftSCP(0)(tt),BUILD_T,.14));},
 still:C3.ft-.1,
};

// ================= chapter 4 — YOUR TURN (demonstration, training kit): stay calm on the ball, look up, the free team-mate, pass =================
const C4={turn:A(3,'Your turn'),calm:A(3,'Stay calm'),look:A(3,'Look up'),pass:A(3,'pass to'),free:A(3,'who is'),end:AUTH[3].seconds};
/** Tomás with his sole on the ball; team-mate A (near, marked by the defender), team-mate B (far, free); the pass goes across to B */
const P4:[number,number]=[-1.4,4.2],MA:[number,number]=[1.5,3.1],MB:[number,number]=[0.1,8.8],D4:[number,number]=[0.85,3.55];
const Y4=yawTo(MB[0]-P4[0],MB[1]-P4[1]);
const B4:[number,number]=(()=>{const o=rot2(OFF_T,Y4);return[P4[0]+o[0],P4[1]+o[1]];})();
const T4P=C4.pass+.1,T4A=T4P+.85;
const MB_IN:[number,number]=[MB[0]-.5*Math.cos(Y4),MB[1]-.5*Math.sin(Y4)];
const practiceT:Gen=t=>{
 let pose:Pose,yaw=Y4-.35;
 if(t<T4P-.35){pose=blendPose(stand(),SOLE,.75);
  // "Look up": the chin comes up and the head turns — to A (marked), then to B (free)
  const lk=sm(C4.look-.1,C4.look+.25,t);const look=lerp(-.55,.45,sm(C4.look+.3,C4.look+.9,t,easeIO));pose={...pose,neckP:lerp(pose.neckP,-.1,lk),neckY:lerp(0,look,lk)};}
 else{const st=key(t,[[T4P-.35,.28],[T4P,STRIKE_CONTACT],[T4P+.7,.9]],linear);pose=blendPose(blendPose(stand(),SOLE,.75),strike(st,{foot:'r',power:.45}),sm(T4P-.35,T4P-.2,t));yaw=lerp(Y4-.35,Y4,sm(T4P-.35,T4P-.05,t));
  if(t>T4A+.3)pose=blendPose(pose,celebrate((t-T4A-.3)*1.2,{kind:'arms'}),sm(T4A+.3,T4A+.7,t));}
 return{pose,yaw,X:P4[0],Z:P4[1]};};
const practiceBall=(t:number):[number,number]=>{if(t<T4P-.35){const o=rot2(OFF_T,Y4-.35);return[P4[0]+o[0]*.8,P4[1]+o[1]*.8];}if(t<T4P)return L2([P4[0]+rot2(OFF_T,Y4-.35)[0]*.8,P4[1]+rot2(OFF_T,Y4-.35)[1]*.8],B4,sm(T4P-.35,T4P-.1,t)) as [number,number];
 return L2(B4,MB_IN,sm(T4P,T4A,t,u=>1-(1-u)*(1-u))) as [number,number];};
const mateA:Gen=t=>({pose:blendPose(stand(),backpedal(t*1.1),.3),yaw:yawTo(P4[0]-MA[0],P4[1]-MA[1]),X:MA[0],Z:MA[1]});
const mateB:Gen=t=>{let pose=blendPose(stand(),backpedal(t*1.1+.5),.25);if(t>=T4A-.2)pose=blendPose(pose,SOLE,sm(T4A-.2,T4A,t));if(t>T4A+.4)pose=blendPose(pose,celebrate((t-T4A-.4)*1.2,{kind:'arms'}),sm(T4A+.4,T4A+.8,t));return{pose,yaw:Y4+Math.PI,X:MB[0],Z:MB[1]};};
const defD:Gen=t=>({pose:blendPose(backpedal(t*1.1),posed({lHipF:30,rHipF:30,lKnee:44,rKnee:44,lean:22,lShF:30,rShF:34,lShA:30,rShA:20,lElb:30,rElb:40,neckP:14}),.7),yaw:yawTo(P4[0]-D4[0],P4[1]-D4[1]),X:D4[0]+.06*Math.sin(t*1.4),Z:D4[1]});
/** kid height: the camera 1.1 m up, a few metres off the near touchline, looking across the court */
const st4:Stage={F:1500,eye:1.1,cx:.4,cz:-3.4};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  const gT=proj(st,P4[0],.9,P4[1]),gB=proj(st,MB[0],.9,MB[1]);
  camPath(s,t,[[0,gT[0]+160,gT[1]-40,1.35],[C4.calm,gT[0]+90,gT[1]-10,1.7],[C4.look,lerp(gT[0],gB[0],.5)+60,lerp(gT[1],gB[1],.5)-10,1.45],[C4.pass,lerp(gT[0],gB[0],.5)+40,lerp(gT[1],gB[1],.5)-10,1.4],[C4.free,lerp(gT[0],gB[0],.6),lerp(gT[1],gB[1],.6)-10,1.55],[C4.end,lerp(gT[0],gB[0],.6),lerp(gT[1],gB[1],.6)-10,1.6]]);
  courtSide(s,st,{});
  // "Stay calm": a slow yellow ring breathes under him; "Look up": a red cross under the marked team-mate, a yellow ring under the free one
  const cr=sm(C4.calm,C4.calm+.5,tt,easeOut)*(1-sm(C4.pass,C4.pass+.4,tt));floorDashRing(s,st,Y,P4[0],P4[1],.7+.06*Math.sin(tt*2.4),9,401,cr);
  const mk=easeOutBack(sm(C4.look+.2,C4.look+.5,tt));floorCross(s,st,(MA[0]+D4[0])/2,(MA[1]+D4[1])/2,.55,11,402,mk);
  const fr=easeOutBack(sm(C4.look+.7,C4.look+1.05,tt));floorDashRing(s,st,Y,MB[0],MB[1],1.15,11,403,fr);
  if(tt>=T4P-.05){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=L2(B4,MB_IN,k/10);pts.push(proj(st,q[0],0,q[1]));}const pg=sm(T4P-.05,T4A,tt,easeOut);dashed(s,Y,pts,9,404,{dash:28,progress:pg});if(pg>.95)arrowHead(s,Y,pts,26,405);}
  const[bx,bz]=practiceBall(tt),bp=proj(st,bx,BALL_R,bz),br=kAt(st,bz)*BALL_R;
  const items:{z:number;draw:()=>void}[]=[
   {z:MB[1],draw:()=>athlete(s,st,mateB,tt,MATE(1),{detail:'high'})},
   {z:D4[1],draw:()=>athlete(s,st,defD,tt,DEMO_D,{detail:'high'})},
   {z:MA[1],draw:()=>athlete(s,st,mateA,tt,MATE(0),{detail:'high'})},
   {z:P4[1],draw:()=>athlete(s,st,practiceT,tt,TOMAS_T,{detail:'high',smear:tt>T4P-.15&&tt<T4P+.2?.14:0})},
   {z:bz-.3,draw:()=>{shadow(s,bp[0],proj(st,bx,0,bz)[1],br*1.15,br*.3,406,.45);ball(s,bp[0],bp[1],br,407,{rot:tt>T4P?tt*9:0});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Look up": a yellow halo over his head while he scans
  const hu=easeOutBack(sm(C4.look,C4.look+.3,tt))*(1-sm(C4.pass-.2,C4.pass+.1,tt));
  if(hu>.02){const p=practiceT(tt),sk=solve(p.pose,BUILD_T,placeAt(p.X,p.Z,p.yaw)),hd=toMine(sk.head),c=proj(st,hd[0],hd[1]+.28,hd[2]),r=.22*kAt(st,hd[2])*hu;s.fill(Y,ribbon(blob(c[0],c[1],r,r*.45,408,{n:20}),Math.max(5,r*.14),{seed:409,close:true,wobble:1}),.95);}
  // "who is free": a big tick stamps beside the free team-mate as the ball arrives
  const tick=easeOutBack(sm(T4A-.05,T4A+.3,tt));
  if(tick>.02){const g=proj(st,MB[0],0,MB[1]),h=kAt(st,MB[1])*1.85,c:Pt=[g[0]+h*.55,g[1]-h*.8],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:410,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:411,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:412,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.look+1.1,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'tomas-paco-futsal-signature',format:'futsal',title:'Tomás Paçó’s calm pass',theme:'Stay calm on the ball and pass to the teammate who is free.',
 ageNote:'For players aged 7–12: the 2021 final and the pass across to Zicky Té are real; the positions are drawn from the written report. Practise it with two friends.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls away along a yellow dashed pass line to a yellow "free" ring; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=40;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.7),e=easeOut(u),bx=x+e*r*3.2,by=y-e*r*.6;
  if(u<1){const pts:Pt[]=[[x,y+r*.9],[x+r*1.6,y+r*.5],[x+r*3.2,y+r*.3]];dashed(s,Y,pts,7,seed,{dash:20,progress:Math.min(1,u*1.4)});
   s.fill(Y,ribbon(blob(x+r*3.2,y+r*.4,r*(.6+.6*u),r*(.2+.2*u),seed+1,{n:20}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(bx,by+r*.95,r,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:age*8*(1-u)+e*6});
 },
};
export default film;
