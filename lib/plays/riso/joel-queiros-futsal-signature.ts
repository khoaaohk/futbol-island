/** Joel Queirós — "the pivot toe-poke finish": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Joel Ricardo Ribeiro Queirós (born 21 May 1982, Porto), PORTUGAL's 1.92 m pivot: 143 caps / 107 goals for Portugal (2002–14),
 *  Benfica 2009–14, UEFA Futsal Cup winner 2009–10, Futsal EURO 2010 runner-up and Golden Boot. That matches the card (playerAppearance.json
 *  country "Portugal"; playerBios "Tall Portuguese pivot who scored 107 goals for Portugal and won the 2010 UEFA Futsal Cup with Benfica").
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature, the pivot's toe-poke finish. No source we could reach says that any
 *  single Joel goal was a toe-poke, so the toe-poke itself is a separate, clearly labelled demonstration (chapters 3–4). The real-match
 *  chapters recreate the one Joel goal that a written source DOES describe, in the biggest club match of his career: the 2010 UEFA Futsal
 *  Cup final. UEFA's report says he "was awarded a free-kick on the edge of the area. The forward positioned himself to accept Ricardinho's
 *  short pass before blasting in his 12th goal of the competition" — a pivot's first-time, no-backlift finish, the same idea as the
 *  toe-poke. The narration says "blasts it in" (the source's word), never "toe-poke", for the real goal.
 *  (Match choice: no other futsal film uses the 2009–10 UEFA Futsal Cup; the Portugal films use the 2021 World Cup final, Euro 2022,
 *  the 2022 Finalissima, Euro 2026 and the 2021 Champions League final.)
 *  1  LIVE (broadcast camera, main stand, real time): 2010 UEFA Futsal Cup FINAL, 25 Apr 2010, Pavilhão Atlântico, Lisbon, Interviú Madrid
 *     2–3 SL Benfica (a.e.t.), 9,400 (a competition record). The camera starts up on the hanging board: Interviú lead 0–1 (Marquinho 7'07").
 *     It trucks down onto the court: at 11'28" Schumacher fouls Joel at the edge of the area; Ricardinho plays the free kick short and Joel
 *     blasts it in (11'29"), 1–1. He runs off celebrating; team-mates chase him.
 *  2  REPLAY (TV slow motion, low behind the ball): the short pass and the hit again, the net bulges; then the board over the end wall
 *     prints the final result, 3–2 after extra time (Arnaldo 21'31", Betão 24'10", Davi 2 Ex' 50"), and a star stamps over Joel — the
 *     competition's top scorer (12 goals).
 *  3  HOW HE DOES IT (a demonstration, no match claimed; Joel in a plain training top, the defender in a neutral yellow bib): the ball
 *     arrives, a defender rushes in, there is no time to swing the leg (a red crossed-out swing arc), so he jabs it with his toes — goal.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Use a toe-poke to shoot fast when there is no time to swing your leg."): three cards
 *     (no big swing, toe-poke, fast) and a tick, over the same demonstration.
 * Sources (written; fetched once, cached in scratchpad/films/src-cache/):
 *  - UEFA.com match report, "Benfica lift Futsal Cup in Lisbon", Paul Bryan, 25 Apr 2010 (via web.archive.org 20100427070425):
 *    Final 25/04/2010 18:30 local, Pavilhão Atlântico, Lisbon; Interviú Madrid 2–3 SL Benfica (aet); goals Marquinho 7'07", Joel Queirós
 *    11'29", Arnaldo 21'31", Betão 24'10", Davi 2 Ex' 50"; competition-record 9,400 crowd; Marquinho slotted through Bébé's legs; "Joel
 *    Queirós was awarded a free-kick on the edge of the area ... positioned himself to accept Ricardinho's short pass before blasting in his
 *    12th goal of the competition, leaving him as top scorer"; Benfica's first title. — uefa.com/futsalcup/matches/season=2010/round=2000067/match=2002326/report/
 *  - UEFA.com minute-by-minute commentary (web.archive.org 20100429051904): "11' 28'' Schumacher (Interviú Madrid) commits a foul after
 *    challenging Joel Queirós (Benfica). 11' 29'' Joel Queirós (Benfica) scores!"
 *  - UEFA.com line-ups (web.archive.org 20100429050245): Benfica 1 Bébé (GK), 4 Pedro Costa (C), 6 Arnaldo, 10 Ricardinho, 25 Joel Queirós,
 *    11 Davi, 13 César Paulo ...; Interviú 1 Luis Amado (GK) (C), 3 Torras, 6 Gabriel, 8 Schumacher, 12 Betão, 2 Marquinho ...
 *  - Wikipedia, "2009–10 UEFA Futsal Cup" (raw): the final box (same scorers and minutes, attendance 9,400); top scorer Joel Queirós, 12.
 *  - Wikipedia, "Joel Queirós" (raw): born 21 May 1982 in Porto; 1.92 m; pivot; Benfica 2009–14; Portugal 2002–14, 143 caps, 107 goals.
 *  - Wikipedia, "Inter FS" (raw): nickname "La Máquina Verde" (the club colour is green) — background for the kit note below.
 * CONFIRMED: competition, round, date, venue, crowd, the score line (0–1 → 1–1 → final 3–2 a.e.t.) and every goal time; the foul by
 *  Schumacher on Joel one second before the goal; that the goal came from a free kick on the edge of the area, played short by Ricardinho
 *  and hit hard by Joel; Joel's shirt number (25), Ricardinho's (10), the keepers (Luis Amado, Bébé); Joel top scorer with 12; his height.
 * INFERRED (never named in the narration): the kits (Benfica red shirts / white shorts / red socks as the hosts; Interviú drawn in a white
 *  change strip with blue shorts — their club colour is green, which four riso inks cannot print as a shirt, and the strip worn that day
 *  is not verified; Amado in yellow); which end Benfica attacked; exactly where on the edge of the area the free kick was, the side of the
 *  short pass, the two-man wall, where the ball went in and Joel's shooting foot (right) — "short pass, then a hard first-time hit" is
 *  all the source gives; the board's look; where the celebration runs; the other players' positions. Chapters 3–4 demonstrate the
 *  toe-poke (how a pivot does it, right foot), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the toe-poke). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z. The free kick is authored ONCE in an "attack frame" (goal line Z = 11, goal centre X = 0, camera behind the ball);
 * chapter 1's side stage views the same choreography through a ROTATION (sideGen: X = −9 − Z, Z = 10 + X, yaw + 90°), so feet stay right.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Benfica, diagram rings), yellow (lights, bib, keeper, flight lines), blue (court, Interviú shorts), navy (key line, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–300 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2010 UEFA Futsal Cup final',text:'Lisbon, 2010, the UEFA Futsal Cup final. Benfica are one down. Big Joel is fouled at the edge of the box. Ricardinho rolls it short, and Joel blasts it in! One all!',tail:2.6,
  cues:['Lisbon','Benfica are','one down','Big Joel','fouled','Ricardinho rolls','Joel blasts','One all'],heads:{'Lisbon':'Final 2010','one down':'0–1','One all':'1–1'}},
 {label:'Replay: short pass, quick hit',text:'Watch again: one short pass, one quick hit. Benfica won in extra time, and Joel was top scorer!',tail:2.4,
  cues:['Watch again','short pass','quick hit','Benfica won','Joel was','top scorer'],heads:{'Benfica won':'3–2 a.e.t.','top scorer':'Top scorer'}},
 {label:'How he does it',text:'His trademark is the toe-poke. This is how he does it: the defender rushes in, no time to swing, so he jabs it with his toes. Goal!',tail:2.2,
  cues:['His trademark','how he does it','defender rushes','no time','jabs','Goal'],heads:{'His trademark':'Toe-poke','Goal':''}},
 {label:'Practise it',text:'Your turn: no time to swing? Use a toe-poke and shoot fast!',tail:2.8,
  cues:['Your turn','no time','Use a','shoot fast'],heads:{'Your turn':'No time? Toe!','shoot fast':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/joel-queiros-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/joel-queiros-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/joel-queiros-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('joel: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('joel: no cue '+w);return c.at;};
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
function camPath(s:Sheet,t:number,K0:Key[]){const v=key(t,padKeys(mono(K0),[0,0,1,0]),easeInOutSine,true);cam(s,v[0]||0,v[1]||0,Number.isFinite(v[2])?v[2]:1,Number.isFinite(v[3])?v[3]:0);}

// ---------------- stage: a perspective camera over the court floor (metres → world units); X right, Y up, Z away ----------------
type Stage={F:number;eye:number;cx:number;cz:number};
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const k=st.F/Math.max(.25,Z-st.cz);return[(X-st.cx)*k,(st.eye-Yh)*k];};
const kAt=(st:Stage,Z:number)=>st.F/Math.max(.25,Z-st.cz);
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; knocked out to paper first so the ink prints clean on the blue court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
function floorArc(st:Stage,X:number,Z:number,r:number,a0:number,a1:number,n=18):Pt[]{const o:Pt[]=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);o.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return o;}

// ---------------- players: the shared athlete library ----------------
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
/** Joel: born in Porto, 1.92 m, a pivot (Wikipedia); Benfica no. 25 (UEFA line-ups). Benfica red / white / red — inferred; short hair
 * (playerAppearance); right foot inferred. */
const JBUILD={height:1.92,bulk:1.08};
const SKIN_J:InkFill[]=[[Y,.4],[R,.26]];
const JOEL:AthleteStyle={shirt:R,shorts:'paper',socks:R,boots:K,skin:SKIN_J,hair:K,line:K,trim:'paper',number:25,numberInk:'paper',hairStyle:'short',build:JBUILD,seed:6};
/** the demonstration: a plain white training top, navy shorts (no match kit claimed) */
const JOEL_TRAIN:AthleteStyle={...JOEL,shirt:'paper',shorts:K,socks:K,trim:R,number:null,seed:7};
const SKINS:InkFill[][]=[[[Y,.42],[R,.28]],[[Y,.35],[R,.2]],[[Y,.5],[R,.36],[K,.12]],[[Y,.4],[R,.24]]];
const BEN=(n:number,num:number|null=null):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,skin:SKINS[n%4],hair:K,line:K,trim:'paper',number:num,numberInk:'paper',hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.7+hash(n,3)*.12},seed:20+n});
/** Ricardinho, no. 10 (UEFA line-ups); 1.67 m */
const RICARDINHO:AthleteStyle={...BEN(1,10),hairStyle:'short',build:{height:1.67},seed:30};
/** Interviú: drawn in a white change strip with blue shorts (INFERRED — the club colour is green; the strip that day is not verified) */
const INT=(n:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:SKINS[(n+1)%4],hair:K,line:K,trim:B,hairStyle:(['short','curly','bald','short'] as const)[n%4],build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Luis Amado — Interviú's keeper, in yellow (inferred) */
const AMADO:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKINS[1],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:62};
/** the demonstration defender: a neutral yellow training bib */
const DEMO_D:AthleteStyle={shirt:[Y,.9],shorts:K,socks:K,boots:K,skin:[[Y,.4],[R,.24]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** the attack frame (goal line Z = 11) seen from chapter 1's side stage (goal line X = −20): a rotation, so handedness is kept */
const sideXZ=(X:number,Z:number):[number,number]=>[-9-Z,10+X];
const sideGen=(g:Gen):Gen=>t=>{const a=g(t),[X,Z]=sideXZ(a.X,a.Z);return{pose:a.pose,yaw:a.yaw+Math.PI/2,X,Z};};

// ---------------- the moves ----------------
/** the pivot's hold (back to goal, left arm back into the marker) and the stumble after the foul */
const HOLD=posed({lHipF:34,rHipF:44,rKnee:66,lKnee:66,lHipA:18,rHipA:10,lean:26,pitch:5,neckP:10,neckY:22,lShF:-30,lShA:52,lElb:18,rShA:32,rElb:50,twist:8});
const STUMBLE=posed({lHipF:-24,lKnee:40,rHipF:52,rKnee:58,lean:38,pitch:14,lShF:64,rShF:40,lShA:58,rShA:64,lElb:30,rElb:26,neckP:-18,air:.05});
/** the toe-poke (right foot): ready → tiny cock of the knee (no backswing) → the knee snaps straight and the TOE jabs the ball
 * (TOE_CONTACT .5) → a short follow-through. The whole move takes ≈ .45 s in the films. */
const TOE_CONTACT=.5;
function toePoke(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,posed({lHipF:16,rHipF:12,lKnee:28,rKnee:28,lean:14,pitch:4,lShA:24,rShA:24,lElb:44,rElb:44,neckP:18})],
  [.3,posed({lHipF:22,lKnee:36,rHipF:-4,rKnee:74,rAnk:6,lean:16,pitch:4,lShA:44,rShA:30,lShF:22,rShF:-20,lElb:40,rElb:50,neckP:26,twist:6})],
  [TOE_CONTACT,posed({lHipF:24,lKnee:36,lAnk:-4,rHipF:30,rKnee:8,rAnk:-2,lean:10,pitch:4,lShA:50,lShF:-12,rShA:36,rShF:26,lElb:34,rElb:44,neckP:30,twist:-6,squash:.04})],
  [.72,posed({lHipF:18,lKnee:30,rHipF:44,rKnee:16,rAnk:4,lean:6,lShA:40,rShA:30,rShF:30,lShF:-16,lElb:36,rElb:44,neckP:20,twist:-10})],
  [1,posed({lHipF:12,rHipF:20,lKnee:24,rKnee:30,lean:8,lShA:22,rShA:22,lElb:36,rElb:36,neckP:6})],
 ];
 return keyPoses(t,keys);
}
/** where the ball sits at contact: just past the kicking toe along the foot (library coords, place at the origin) */
function toeBall(pose:Pose,yaw:number,build:{height:number;bulk?:number},ahead=.08):V3{const sk=solve(pose,build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*ahead,BALL_R,toe[2]+d[2]/l*ahead];}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
function drawBall(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??8,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,Yh>.3?.28:.45);ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.14)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.52)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Interviú's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X+6,GOAL_X+10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage,bulge:number,bz:number,by:number){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GOAL_X-lerp(Db,Dt,Yh/H)-d,Yh,Z);};
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,GOAL_X,Yh,POST_N),b=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GOAL_X+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GOAL_X,H+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- REPLAY / DEMO court facing the goal end (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;inGoal?:(st:Stage)=>void};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-10,-30,10,GZ),true);s.knockout(court,.25);s.fill(B,court,.82);
 const lines=new Path2D(),arcPts:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
 lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));
 lines.addPath(polyPath(floorStrip(st,[[-10,-30],[-10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,-30],[10,GZ]],.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalEnd(s,st,bulge,bx,by);o.inGoal?.(st);postsEnd(s,st);
}
function goalEnd(s:Sheet,st:Stage,bulge:number,bx:number,by:number){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H)+d);};
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,X,Yh,GZ),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GZ)*.018),.6);
}
function postsEnd(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,GZ);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,GZ)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---------------- the hanging scoreboard (a riso seven-segment board; score + match clock) ----------------
const SEG:Record<string,number[]>={'0':[1,1,1,1,1,1,0],'1':[0,1,1,0,0,0,0],'2':[1,1,0,1,1,0,1],'3':[1,1,1,1,0,0,1],'4':[0,1,1,0,0,1,1],'5':[1,0,1,1,0,1,1],'6':[1,0,1,1,1,1,1],'7':[1,1,1,0,0,0,0],'8':[1,1,1,1,1,1,1],'9':[1,1,1,1,0,1,1]};
const SEGL:[Pt,Pt][]=[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[1,2]],[[0,2],[1,2]],[[0,1],[0,2]],[[0,0],[0,1]],[[0,1],[1,1]]];
function digits(path:Path2D,str:string,x:number,y:number,h:number,seed:number,sy=1):number{
 const w=h*.5,gap=h*.26,lw=h*.13;let cx=x;
 for(const ch of str){
  if(ch===':'){for(const dy of[.6,1.4])path.addPath(polyPath(blob(cx+lw*.6,y+dy*h/2,lw*.62,lw*.62,seed+dy*7,{n:10}),true));cx+=lw*1.2+gap;continue;}
  const on=SEG[ch];if(!on){cx+=w+gap;continue;}
  if(ch==='1')cx-=w*.55;
  on.forEach((v,i)=>{if(!v)return;const[a,b]=SEGL[i],p:Pt[]=[[cx+a[0]*w,y+h/2+(a[1]-1)*h/2*sy],[cx+b[0]*w,y+h/2+(b[1]-1)*h/2*sy]];path.addPath(ribbon(p,lw,{seed:seed+i,taper:0,wobble:.4}));});
  cx+=w+gap;}
 return cx-x-gap;
}
type Board={home:number;away:number;clock:string;flip:number;flipAway?:number;glow:number;blank?:boolean;cables?:boolean};
/** the board, flat to the camera, centred at sheet point c, k units per metre (6 m × 3 m): Benfica (red swatch) left, Interviú (paper
 * swatch, blue band) right */
function scoreboard(s:Sheet,c:Pt,k:number,b:Board,seed:number){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 if(b.cables!==false){const cab=new Path2D();for(const u of[.18,.82])cab.addPath(ribbon([[x0+W*u,y0],[x0+W*u+(u-.5)*k*.6,y0-k*9]],Math.max(2,k*.04),{seed:seed+2,taper:0,wobble:.5}));s.fill(K,cab,.8);}
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(R,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const pr=polyPath(handCut([[x0+k*.35,ly],[x0+k*.35+sw,ly],[x0+k*.35+sw,ly+sh],[x0+k*.35,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(pr);s.fill(R,pr);
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);s.fill(B,rectPath(ax,ly+sh*.66,sw,sh*.34));
 if(b.blank)return;
 const dh=H*.36,num=new Path2D(),sy=1-.8*Math.sin(Math.PI*clamp(b.flip)),sa=1-.8*Math.sin(Math.PI*clamp(b.flipAway??0));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,sy);digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20,sa);
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));
 s.knockout(num);
 const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);
}
const mmss=(sec:number)=>{const m=Math.floor(sec/60),ss=Math.floor(sec%60);return`${m}:${ss<10?'0':''}${ss}`;};

// ================= THE FREE KICK, authored once in the attack frame (goal line Z = 11, goal X ±1.5; camera behind the ball) =================
/** foul / free-kick spot on the edge of the area (7.6 m out, a little right of centre — position inferred) */
const B0:[number,number]=[.3,3.4];
/** Ricardinho's short pass goes left to P2; Joel hits it first time toward the near side of the goal (TGT; inferred) */
const P2:[number,number]=[-1.5,3.15],TGT:V3=[-1.02,.62,GZ+.02];
const JSET:[number,number]=[-2.35,1.55],FOULJ:[number,number]=[.3,3.78],SCHU0:[number,number]=[.36,4.42];
const RIC_SET:[number,number]=[.95,2.72];
/** the two-man wall 5 m from the ball, covering the direct line to the far side (inferred) */
const WALL:[number,number][]=[[.08,8.35],[.66,8.4]];
const KEEP:[number,number]=[.15,10.35];
const JYAW=yawTo(TGT[0]-P2[0],TGT[2]-P2[1]);
const JSB=toMine((()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),JBUILD,{yaw:JYAW}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08] as V3;})());
const JPL:[number,number]=[P2[0]-JSB[0],P2[1]-JSB[2]];
/** Ricardinho's pass: a soft right-foot touch across the ball toward P2 */
const RYAW=yawTo(P2[0]-B0[0],P2[1]-B0[1]);
const RSB=toMine((()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.15}),{height:1.67},{yaw:RYAW}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08] as V3;})());
const RPL:[number,number]=[B0[0]-RSB[0],B0[1]-RSB[2]];
const CELEB:[number,number]=[-5.6,4.2];
type FL={foul:number;tap:number;hit:number;set:boolean};
const FLIGHT=.3;
function freeKick(L:FL){
 const pre=L.set?-99:L.foul;
 /** Joel: holds back to goal → fouled (stumbles) → walks to his spot → two steps → strikes → runs off celebrating */
 const joel:Gen=t=>{
  if(!L.set&&t<L.foul){const b=.03*Math.sin(t*2.1);return{pose:HOLD,yaw:FACE_CAMERA+b,X:FOULJ[0]+b,Z:FOULJ[1]};}
  if(!L.set&&t<L.foul+1.1){const u=sm(L.foul,L.foul+.45,t,easeOut),r=sm(L.foul+.5,L.foul+1.1,t);return{pose:blendPose(blendPose(HOLD,STUMBLE,u),stand(),r),yaw:FACE_CAMERA+.2*u,X:FOULJ[0]-.1*u,Z:FOULJ[1]-.75*u};}
  const f0:[number,number]=L.set?JSET:[FOULJ[0]-.1,FOULJ[1]-.75],w0=L.set?-99:L.foul+1.1,w1=L.tap-.6;
  if(t<L.hit-.62){const u=sm(w0,w1,t,easeIO),X=lerp(f0[0],JSET[0],u),Z=lerp(f0[1],JSET[1],u),walking=u>0&&u<1;
   const pose=walking?blendPose(stand(),runCycle(t*runCadence(.15),{speed:.15}),.8):blendPose(stand(),posed({lHipF:14,rHipF:20,lKnee:24,rKnee:30,lean:14,neckP:16,lShA:18,rShA:18,lElb:40,rElb:40}),.7);
   const yw=walking?yawTo(JSET[0]-f0[0],JSET[1]-f0[1]):JYAW+.4;return{pose,yaw:lerp(yw,JYAW+.4,sm(w1-.3,w1,t)),X,Z};}
  if(t<L.hit){const u=sm(L.hit-.62,L.hit,t,easeIn),s0=key(t,[[L.hit-.62,0],[L.hit,STRIKE_CONTACT]],linear);return{pose:strike(s0,{foot:'r'}),yaw:lerp(JYAW+.4,JYAW,sm(L.hit-.62,L.hit-.3,t)),X:lerp(JSET[0],JPL[0],u),Z:lerp(JSET[1],JPL[1],u)};}
  if(t<L.hit+.55){const s1=key(t,[[L.hit,STRIKE_CONTACT],[L.hit+.55,1]],linear),u=sm(L.hit,L.hit+.55,t);return{pose:strike(s1,{foot:'r'}),yaw:JYAW,X:JPL[0]+.35*Math.cos(JYAW)*u,Z:JPL[1]+.35*Math.sin(JYAW)*u};}
  const u=sm(L.hit+.55,L.hit+3,t,easeOut),a:[number,number]=[JPL[0]+.35*Math.cos(JYAW),JPL[1]+.35*Math.sin(JYAW)];
  let pose=blendPose(strike(1,{foot:'r'}),celebrate((t-L.hit)*1.3,{kind:'run'}),sm(L.hit+.55,L.hit+.8,t));pose=blendPose(pose,celebrate((t-L.hit)*1.1,{kind:'arms'}),sm(L.hit+2.6,L.hit+3.1,t));
  return{pose,yaw:lerp(yawTo(CELEB[0]-a[0],CELEB[1]-a[1]),FACE_CAMERA+.6,sm(L.hit+2.6,L.hit+3.2,t)),X:lerp(a[0],CELEB[0],u),Z:lerp(a[1],CELEB[1],u)};};
 /** Ricardinho: walks up behind the ball → the short pass → jogs after Joel */
 const ric:Gen=t=>{
  const r0:[number,number]=L.set?RPL:[2.6,1.4];
  if(t<L.tap-.3){const u=sm(pre+.6,L.tap-.9,t,easeIO),walking=u>0&&u<1;return{pose:walking?blendPose(stand(),runCycle(t*runCadence(.2),{speed:.2}),.85):stand(),yaw:walking?yawTo(RPL[0]-r0[0],RPL[1]-r0[1]):RYAW+.5,X:lerp(r0[0],RPL[0],u),Z:lerp(r0[1],RPL[1],u)};}
  if(t<L.tap+.5){const s0=key(t,[[L.tap-.3,.3],[L.tap,STRIKE_CONTACT],[L.tap+.5,.85]],linear);return{pose:strike(s0,{foot:'r',power:.15}),yaw:RYAW,X:RPL[0],Z:RPL[1]};}
  const go=sm(L.hit+.5,L.hit+3,t,easeIO),tx=CELEB[0]+.9,tz=CELEB[1]+.8;
  return{pose:blendPose(blendPose(strike(.85,{foot:'r',power:.15}),stand(),sm(L.tap+.5,L.tap+.9,t)),runCycle(t*runCadence(.8),{speed:.8}),go>0&&go<.98?1:0),yaw:go>0?yawTo(tx-RPL[0],tz-RPL[1]):RYAW,X:lerp(RPL[0],tx,go),Z:lerp(RPL[1],tz,go)};};
 /** Schumacher: tight on Joel's back → the foul (a lunge through him) → into the wall */
 const PRESS=posed({lHipF:30,rHipF:36,lKnee:50,rKnee:54,lean:24,lShF:52,rShF:44,lShA:20,rShA:22,lElb:34,rElb:40,neckP:10});
 const WALLP=posed({lHipF:6,rHipF:6,lKnee:14,rKnee:14,lean:6,lShF:18,rShF:18,lShA:-8,rShA:-8,lElb:110,rElb:110,neckP:4});
 const wallGen=(i:number):Gen=>t=>{
  const [wx,wz]=WALL[i];
  if(i===0&&!L.set&&t<L.foul+.8){const lu=sm(L.foul-.25,L.foul+.1,t);return{pose:blendPose(blendPose(backpedal(t*.9),PRESS,.8),lunge(.6,{side:'r'}),lu*(1-sm(L.foul+.3,L.foul+.8,t))),yaw:FACE_CAMERA,X:SCHU0[0],Z:SCHU0[1]-.35*lu};}
  const from:[number,number]=i===0?[SCHU0[0],SCHU0[1]-.3]:[2.2,6.2],u=L.set?1:sm(L.foul+.8,L.tap-.5,t,easeIO),walking=u>0&&u<1;
  let pose=walking?blendPose(stand(),runCycle(t*runCadence(.3),{speed:.3}),.85):WALLP;
  // the ball flies past them: heads turn; after the goal they drop
  pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lean:22,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24}),sm(L.hit+.6,L.hit+1.4,t));
  return{pose,yaw:walking?yawTo(wx-from[0],wz-from[1]):FACE_CAMERA-.15*sm(L.hit,L.hit+.3,t)*(i?1:.6),X:lerp(from[0],wx,u),Z:lerp(from[1],wz,u)};};
 /** Luis Amado: set on his line, shifts a step, dives to his right (−X) a beat late */
 const keeper:Gen=t=>{const d=(t-L.hit+.06)/.8;
  if(d<0)return{pose:keeperSet(t*1.4),yaw:FACE_CAMERA+.1,X:KEEP[0]-.25*sm(L.tap,L.tap+.4,t),Z:KEEP[1]};
  return{pose:keeperDive(Math.min(1,d),{side:'r',height:.3}),yaw:FACE_CAMERA+.1,X:KEEP[0]-.25,Z:KEEP[1]};};
 /** the other outfield players (positions inferred): Interviú marking, Benfica team-mates who run to Joel */
 const OTH:[number,number][]=[[-2.9,6.1],[2.6,5.0]],MATE:[number,number][]=[[3.1,.6],[-3.4,-1.8]];
 const other=(i:number):Gen=>t=>({pose:blendPose(backpedal(.25+i*.3+t*.2),posed({lHipF:6,rHipF:6,lKnee:12,rKnee:12,lean:22,neckP:44,lShA:10,rShA:10}),sm(L.hit+.8,L.hit+1.6,t)),yaw:FACE_CAMERA+(i?-.5:.5),X:OTH[i][0],Z:OTH[i][1]});
 const mate=(i:number):Gen=>t=>{const[x0,z0]=MATE[i],go=sm(L.hit+.3+.25*i,L.hit+3,t,easeIO),tx=CELEB[0]+[-.9,.2][i],tz=CELEB[1]+[.7,-.8][i];
  const pose=go>0&&go<.98?runCycle(t*runCadence(.9)+i*.3,{speed:.9}):go>=.98?celebrate(t*1.1+i*.3,{kind:'arms'}):blendPose(stand(),backpedal(t*.4+i),.3);
  return{pose,yaw:go>0?yawTo(tx-x0,tz-z0):yawTo(B0[0]-x0,B0[1]-z0),X:lerp(x0,tx,go),Z:lerp(z0,tz,go)};};
 /** the ball: at Joel's feet → loose after the foul → placed → the short pass → the hit → the net */
 const ballAt=(t:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}=>{
  if(!L.set&&t<L.foul)return{X:B0[0],Y:BALL_R,Z:B0[1]-.02*Math.sin(t*3),flying:false,spin:t*.5};
  if(t<L.tap)return{X:B0[0],Y:BALL_R,Z:B0[1],flying:false,spin:0};
  if(t<L.hit){const u=sm(L.tap,L.hit,t,easeOut);return{X:lerp(B0[0],P2[0],u),Y:BALL_R,Z:lerp(B0[1],P2[1],u),flying:false,spin:u*10};}
  if(t<L.hit+FLIGHT){const u=sm(L.hit,L.hit+FLIGHT,t,linear),M:V3=[lerp(P2[0],TGT[0],.5),.62,lerp(P2[1],TGT[2],.5)],a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return{X:a*P2[0]+b*M[0]+c*TGT[0],Y:a*BALL_R+b*M[1]+c*TGT[1],Z:a*P2[1]+b*M[2]+c*TGT[2],flying:true,spin:10+u*30};}
  const d=sm(L.hit+FLIGHT,L.hit+FLIGHT+.5,t,easeOut);return{X:TGT[0],Y:lerp(TGT[1],BALL_R,d),Z:GZ+.2+.45*d,flying:false,spin:40};};
 return{joel,ric,wall:[wallGen(0),wallGen(1)],keeper,others:[other(0),other(1)],mates:[mate(0),mate(1)],ball:ballAt};
}
type FK=ReturnType<typeof freeKick>;
/** Joel's chest in a take (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,JBUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}

// ================= chapter 1 — LIVE: the 2010 UEFA Futsal Cup final, 1–1 (Joel, 11'29") =================
const C1={lisbon:A(0,'Lisbon'),benfica:A(0,'Benfica are'),down:A(0,'one down'),big:A(0,'Big Joel'),fouled:A(0,'fouled'),rolls:A(0,'Ricardinho'),blasts:A(0,'Joel blasts'),one:A(0,'One all'),end:AUTH[0].seconds};
const HIT1=Math.max(C1.rolls+1.2,C1.blasts+.12),FL1:FL={foul:C1.fouled+.1,tap:Math.max(C1.rolls+.45,HIT1-.85),hit:HIT1,set:false};
const FK1=freeKick(FL1);
const BOARD_AT:V3=[0,11,10];
function board1(T:number):Board{
 const f=FL1.hit+FLIGHT+.05,home=T<f?0:1,clock=T<C1.down+.5?lerp(7*60+7,7*60+12,sm(0,C1.down+.5,T,linear)):11*60+(T<f?28:29);
 return{home,away:1,clock:mmss(clock),flip:sm(f,f+.25,T,linear),flipAway:0,glow:pulse(T,f,1.6)};
}
/** the camera: up on the board (0–1), then it trucks left and tilts down onto the edge of Interviú's area; it holds for the goal */
const CX_COURT=-14.4;
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.down+.35,0],[C1.big-.05,CX_COURT],[C1.end,CX_COURT-.6]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.down,.62],[C1.down+.35,.64],[C1.big-.05,.7],[C1.one,.7],[C1.end,.76]]),easeInOutSine),
 y:key(T,mono([[0,-620],[C1.down,-720],[C1.down+.35,-700],[C1.big-.05,1000],[C1.one,1010],[C1.end,1060]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),goalT=FL1.hit+FLIGHT,g=pulse(Tc,goalT,.35);
 cam(s,0,c.y+3*g*Math.sin(Tc*80),c.zoom);
 const b=FK1.ball(T),inNet=b.Z>GZ+.05,[bx,bz]=sideXZ(TGT[0],TGT[2]);
 const cheer=T<goalT?.12+.15*sm(FL1.tap,FL1.hit,T):1-.3*sm(C1.end-1.5,C1.end,T);
 const drawB=()=>{const[X,Z]=sideXZ(b.X,b.Z);drawBall(s,st,X,b.Y,Z,120,{min:8,rot:b.spin,smear:b.flying?.4:0,dir:Math.PI});};
 courtSide(s,st,T,{cheer,flash:pulse(T,goalT,1.2),bulge:.45*sm(goalT-.08,goalT,T)*(1-.6*sm(goalT+.3,goalT+1.2,T))+.1*settle(T,goalT,{amp:1,freq:3,decay:3}),bz,by:TGT[1],
  keeper:()=>{athlete(s,st,sideGen(FK1.keeper),T,AMADO,{detail:'low'});if(inNet)drawB();}});
 const bc=proj(st,BOARD_AT[0],BOARD_AT[1],BOARD_AT[2]),kb=kAt(st,BOARD_AT[2]);scoreboard(s,bc,kb,board1(T),501);
 // "one down": a red ring round Interviú's 1 on the board
 const ring=easeOutBack(sm(C1.down,C1.down+.3,T))*(1-sm(C1.big-.4,C1.big-.1,T));
 if(ring>.02){const q=blob(bc[0]+kb*1.1,bc[1]-kb*.55,kb*.75*Math.min(1,ring),kb*.62*Math.min(1,ring),502,{n:22});const rp=ribbon([...q,q[0]],kb*.1,{seed:503,close:true,wobble:1});s.knockout(rp);s.fill(R,rp);}
 if(T<C1.down+.2)return;// the court below is out of shot until the truck
 // "Big Joel": a red ring on the floor round him; "fouled": a yellow burst at the contact
 const jn=sideGen(FK1.joel)(T);
 const jr=easeOutBack(sm(C1.big,C1.big+.35,T))*(1-sm(C1.fouled+.2,C1.fouled+.6,T));if(jr>.02)floorDashRing(s,st,R,jn.X,jn.Z,.75,7,504,jr);
 if(T>=FL1.foul-.05&&T<FL1.foul+.6){const[fx,fz]=sideXZ(FOULJ[0],FOULJ[1]+.3),p=proj(st,fx,1.1,fz);sparkBurst(s,Y,p[0],p[1],130,{n:9,seed:505,g:easeOut(sm(FL1.foul-.05,FL1.foul+.15,T))*(1-sm(FL1.foul+.3,FL1.foul+.6,T))});}
 // "rolls it short": the navy dashed pass line; "blasts": the yellow flight line
 if(T>FL1.tap&&T<FL1.hit+1.2){const pts:Pt[]=[];for(let k=0;k<=8;k++){const q=FK1.ball(lerp(FL1.tap,Math.min(T,FL1.hit),k/8)),[X,Z]=sideXZ(q.X,q.Z);pts.push(proj(st,X,0,Z));}dashed(s,K,pts,7,506,{dash:22,cov:.85});}
 if(T>FL1.hit){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=FK1.ball(lerp(FL1.hit,Math.min(T,FL1.hit+FLIGHT),k/12)),[X,Z]=sideXZ(q.X,q.Z);pts.push(proj(st,X,q.Y,Z));}dashed(s,Y,pts,8,507,{dash:26,cov:1-sm(FL1.hit+1.4,FL1.hit+2,T)});}
 type It={z:number;draw:()=>void};const items:It[]=[];
 const add=(gen:Gen,style:AthleteStyle,o:{detail?:'low'|'mid';smear?:number}={})=>{const sg=sideGen(gen);items.push({z:sg(T).Z,draw:()=>athlete(s,st,sg,T,style,{detail:o.detail??'low',smear:o.smear})});};
 FK1.wall.forEach((w,i)=>add(w,i===0?{...INT(0),number:8,numberInk:B}:INT(1)));
 FK1.others.forEach((w,i)=>add(w,INT(2+i)));
 FK1.mates.forEach((w,i)=>add(w,BEN(2+i)));
 add(FK1.ric,RICARDINHO);
 add(FK1.joel,{...JOEL,number:null},{detail:'mid',smear:T>FL1.hit-.2&&T<FL1.hit+.2?.12:0});
 if(!inNet){const[X,Z]=sideXZ(b.X,b.Z);items.push({z:Z-.01,draw:drawB});}
 items.sort((a,c2)=>c2.z-a.z).forEach(it=>it.draw());
 if(T>=goalT&&T<goalT+.9){const p=proj(st,GOAL_X-.4,1.2,bz);sparkBurst(s,Y,p[0],p[1],160,{n:12,seed:508,g:easeOut(sm(goalT,goalT+.3,T))*(1-sm(goalT+.5,goalT+.9,T))});}
 // "One all": the Benfica red ring stamps round Joel as the team reaches him
 const oa=easeOutBack(sm(C1.one,C1.one+.35,T));if(oa>.02)floorDashRing(s,st,R,jn.X,jn.Z,.9,8,509,oa);
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),sideGen(FK1.joel)(tt),.14));},still:FL1.hit+.15};

// ================= chapter 2 — REPLAY (TV, low behind the ball): short pass, quick hit; the result; top scorer =================
const C2={again:A(1,'Watch'),pass:A(1,'short pass'),hit:A(1,'quick hit'),won:A(1,'Benfica won'),was:A(1,'Joel was'),top:A(1,'top scorer'),end:AUTH[1].seconds};
const HIT2=Math.max(C2.pass+.75,C2.hit+.1),FL2:FL={foul:-9,tap:Math.max(C2.pass+.05,HIT2-1),hit:HIT2,set:true};
const FK2=freeKick(FL2);
const st2:Stage={F:1500,eye:1.45,cx:-.55,cz:-3.6};
/** the board on the end wall above the goal (not the real board's look — inferred) */
const BOARD2:V3=[0,4.5,13.2];
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,f0=proj(st,-.6,1.1,3.2),g=proj(st,-.5,1.2,GZ),goalT=FL2.hit+FLIGHT,bc=proj(st,BOARD2[0],BOARD2[1],BOARD2[2]),kb=kAt(st,BOARD2[2])*.55;
  const jc=FK2.joel(Math.min(tt,FL2.hit+3)),jp=proj(st,jc.X,1.2,jc.Z);
  camPath(s,t,[[0,f0[0]+40,f0[1]-60,1.1],[C2.pass,f0[0]+20,f0[1]-50,1.12],[C2.hit,L2(f0,g,.4)[0],L2(f0,g,.4)[1]-60,1.02],[goalT+.3,L2(f0,g,.5)[0],L2(f0,g,.5)[1]-90,.98],[C2.won,L2(jp,bc,.5)[0],L2(jp,bc,.5)[1],.94],[C2.end,L2(jp,bc,.5)[0]-20,L2(jp,bc,.5)[1],.98]]);
  const b=FK2.ball(tt),inNet=b.Z>GZ+.05;
  const drawB=()=>drawBall(s,st,b.X,b.Y,b.Z,220,{rot:b.spin,smear:b.flying?.45:0,dir:-Math.PI/2+.25});
  arena(s,st,{t:tt,cheer:tt<goalT?.15:1-.3*sm(C2.end-1.2,C2.end,tt),flash:pulse(tt,goalT,1.3)+.4*pulse(tt,C2.won,1.2),bulge:.5*sm(goalT-.08,goalT,tt)*(1-.6*sm(goalT+.3,goalT+1.4,tt))+.12*settle(tt,goalT,{amp:1,freq:3,decay:3}),bx:TGT[0],by:TGT[1],inGoal:()=>{if(inNet)drawB();}});
  // "Benfica won": the board prints the final score, 3–2, at the end of extra time (50:00)
  const lit=sm(C2.won,C2.won+.3,tt);scoreboard(s,bc,kb,{home:3,away:2,clock:'50:00',flip:lit,glow:pulse(tt,C2.won+.15,1.4),blank:lit<.5,cables:false},601);
  if(tt>=C2.won){const u=sm(C2.won,C2.won+2.5,tt,linear),top=proj(st,0,6,WALLZ)[1];confetti(s,[R,Y,'paper'],[-900,top-200+u*500,1800,420],24,Math.floor(tt*6),{size:16});}
  // "short pass": navy dashed; "quick hit": the yellow flight line
  if(tt>FL2.tap){const pts:Pt[]=[];for(let k=0;k<=8;k++){const q=FK2.ball(lerp(FL2.tap,Math.min(tt,FL2.hit),k/8));pts.push(proj(st,q.X,0,q.Z));}dashed(s,K,pts,10,602,{dash:30,cov:.85*(1-sm(C2.won-.3,C2.won+.2,tt))});}
  if(tt>FL2.hit){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=FK2.ball(lerp(FL2.hit,Math.min(tt,FL2.hit+FLIGHT),k/12));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,12,603,{dash:40,cov:1-sm(C2.won-.3,C2.won+.2,tt)});}
  // "quick hit": a red ring on the floor at the spot he hits it from (no backlift, first time)
  const hr=easeOutBack(sm(FL2.hit,FL2.hit+.3,tt))*(1-sm(C2.won-.3,C2.won,tt));if(hr>.02)floorDashRing(s,st,R,P2[0],P2[1],.5,9,604,hr);
  const its:{z:number;draw:()=>void}[]=[];
  const add=(gen:Gen,style:AthleteStyle,o:{detail?:'mid'|'high';smear?:number}={})=>its.push({z:gen(tt).Z,draw:()=>athlete(s,st,gen,tt,style,{detail:o.detail??'mid',smear:o.smear})});
  add(FK2.keeper,AMADO);FK2.wall.forEach((w,i)=>add(w,INT(i)));FK2.others.forEach((w,i)=>add(w,INT(2+i)));FK2.mates.forEach((w,i)=>add(w,BEN(2+i)));
  add(FK2.ric,RICARDINHO);add(FK2.joel,JOEL,{detail:'high',smear:tt>FL2.hit-.2&&tt<FL2.hit+.2?.14:0});
  if(!inNet)its.push({z:b.Z-.01,draw:drawB});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=goalT&&tt<goalT+.9){const p=proj(st,TGT[0],TGT[1]+.2,GZ+.3);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:605,g:easeOut(sm(goalT,goalT+.3,tt))*(1-sm(goalT+.5,goalT+.9,tt))});}
  // "Joel was": a red ring at his feet; "top scorer": a yellow star over his head
  const jz=FK2.joel(tt),rg=easeOutBack(sm(C2.was,C2.was+.35,tt));if(rg>.02)floorDashRing(s,st,R,jz.X,jz.Z,.65,9,606,rg);
  const sg=easeOutBack(sm(C2.top,C2.top+.4,tt));
  if(sg>.02){const sk=solve(jz.pose,JBUILD,placeAt(jz.X,jz.Z,jz.yaw)),hd=toMine(sk.head),hp=proj(st,hd[0],hd[1]+.55,hd[2]),r=kAt(st,hd[2])*.28*sg,q=star(hp[0],hp[1],r,.1*Math.sin(tt*3));
   s.fill(K,polyPath(star(hp[0]+6,hp[1]+6,r),true),.5);const sp=polyPath(q,true);s.knockout(sp);s.fill(Y,sp);s.fill(K,ribbon([...q,q[0]],5,{seed:607,close:true,wobble:.8}),.9);}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,FK2.joel(tt),.13));},
 still:FL2.hit+.08,
};
function star(cx:number,cy:number,r:number,rot=0):Pt[]{const q:Pt[]=[];for(let i=0;i<10;i++){const a=rot-Math.PI/2+i/10*TAU,rr=i%2?r*.45:r;q.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}return q;}

// ================= the demonstration (chapters 3–4): the ball arrives, a defender rushes in, no time to swing, TOE-POKE =================
type TL={pass0:number;pass1:number;rush:number;hit:number};
/** Joel's spot 5.4 m out, a little left; he shoots across to the far side, low (all a demonstration) */
const J3:[number,number]=[-.5,GZ-5.4],TGT3:V3=[1.05,.32,GZ+.02];
const YAW3=yawTo(TGT3[0]-J3[0],TGT3[2]-J3[1]);
const TB=toMine(toeBall(toePoke(TOE_CONTACT),YAW3,JBUILD,.09)),BC:[number,number]=[J3[0]+TB[0],J3[1]+TB[2]];
const PASS3:[number,number]=[4.2,2.4],D0:[number,number]=[-3.0,GZ-2.0],D1:[number,number]=[-1.45,GZ-4.6];
function demo(L:TL){
 const joel:Gen=t=>{
  const ready=posed({lHipF:16,rHipF:12,lKnee:28,rKnee:28,lean:14,pitch:4,lShA:24,rShA:24,lElb:44,rElb:44,neckP:18});
  let pose:Pose;
  if(t<L.hit-.3)pose=blendPose(stand(),ready,sm(L.pass0,L.pass1,t))
  else if(t<L.hit+.5)pose=toePoke(key(t,[[L.hit-.3,0],[L.hit-.12,.3],[L.hit,TOE_CONTACT],[L.hit+.5,1]],linear));
  else pose=blendPose(toePoke(1),celebrate((t-L.hit-.6)*1.2,{kind:'arms'}),sm(L.hit+.6,L.hit+1,t));
  const look=t<L.pass1?yawTo(PASS3[0]-J3[0],PASS3[1]-J3[1])*.35+YAW3*.65:YAW3;
  return{pose,yaw:lerp(look,YAW3,sm(L.pass1-.3,L.pass1,t)),X:J3[0],Z:J3[1]};};
 const def:Gen=t=>{const u=sm(L.rush-.3,L.hit+.05,t,easeIn),X=lerp(D0[0],D1[0],u),Z=lerp(D0[1],D1[1],u);
  let pose=u<=0?blendPose(stand(),backpedal(t*.6),.4):u<1?runCycle(t*runCadence(.9),{speed:.9}):stand();
  pose=blendPose(pose,lunge(sm(L.hit-.15,L.hit+.35,t)*.8,{side:'r'}),sm(L.hit-.2,L.hit,t));
  return{pose,yaw:yawTo(D1[0]-D0[0],D1[1]-D0[1])+.9*sm(L.hit+.2,L.hit+.8,t),X,Z};};
 const fl=.26;
 const ballAt=(t:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}=>{
  if(t<L.pass0)return{X:PASS3[0],Y:BALL_R,Z:PASS3[1],flying:false,spin:0};
  if(t<L.pass1){const u=sm(L.pass0,L.pass1,t,easeOut);return{X:lerp(PASS3[0],BC[0],u),Y:BALL_R,Z:lerp(PASS3[1],BC[1],u),flying:false,spin:u*12};}
  if(t<L.hit)return{X:BC[0],Y:BALL_R,Z:BC[1],flying:false,spin:12};
  if(t<L.hit+fl){const u=sm(L.hit,L.hit+fl,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(BC[0],TGT3[0],.5),.38,lerp(BC[1],TGT3[2],.5)];return{X:a*BC[0]+b*M[0]+c*TGT3[0],Y:a*BALL_R+b*M[1]+c*TGT3[1],Z:a*BC[1]+b*M[2]+c*TGT3[2],flying:true,spin:12+u*30};}
  const d=sm(L.hit+fl,L.hit+fl+.5,t,easeOut);return{X:TGT3[0],Y:lerp(TGT3[1],BALL_R,d),Z:GZ+.2+.45*d,flying:false,spin:42};};
 return{joel,def,ball:ballAt,fl};
}
type Demo=ReturnType<typeof demo>;
/** the big swing he has no time for: an arc behind his right leg (library coords → ours), crossed out in red */
function swingArc(st:Stage,z:{X:number;Z:number},n=10):Pt[]{const bx=-Math.cos(YAW3),bz=-Math.sin(YAW3),rx=Math.cos(YAW3-Math.PI/2)*.22,rz=Math.sin(YAW3-Math.PI/2)*.22,o:Pt[]=[];
 for(let k=0;k<=n;k++){const a=k/n*Math.PI*.95,r=.95;const X=z.X+rx+bx*Math.sin(a)*r*.7-Math.cos(YAW3)*Math.cos(a)*r*.2,Z=z.Z+rz+bz*Math.sin(a)*r*.7-Math.sin(YAW3)*Math.cos(a)*r*.2,Yh=.2+Math.sin(a)*.9;o.push(proj(st,X,Yh,Z));}return o;}
function demoScene(s:Sheet,st:Stage,tt:number,D:Demo,L:TL,c:{trade?:number;how?:number;rush?:number;none:number;jab:number;goal:number},detail:'mid'|'high'){
 const b=D.ball(tt),goalT=L.hit+D.fl,inNet=b.Z>GZ+.05;
 const drawB=()=>drawBall(s,st,b.X,b.Y,b.Z,314,{rot:b.spin,smear:b.flying?.4:0,dir:-Math.PI/2+.5});
 arena(s,st,{t:tt,cheer:.35*pulse(tt,goalT,1.4),bulge:.5*sm(goalT-.08,goalT,tt)*(1-.6*sm(goalT+.3,goalT+1.2,tt))+.12*settle(tt,goalT,{amp:1,freq:3,decay:3}),bx:TGT3[0],by:TGT3[1],inGoal:()=>{if(inNet)drawB();}});
 const z=D.joel(tt),d=D.def(tt);
 // "His trademark": a yellow dashed ring round his right boot (the toe)
 if(c.trade!==undefined&&c.how!==undefined){const g=easeOutBack(sm(c.trade,c.trade+.4,tt))*(1-sm(c.how+.3,c.how+.7,tt));if(g>.02)floorDashRing(s,st,Y,BC[0],BC[1],.42,8,301,g);}
 // the pass in (navy dashed, as it rolls)
 if(tt>L.pass0&&tt<L.hit+.4){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=D.ball(lerp(L.pass0,Math.min(tt,L.pass1),k/10));pts.push(proj(st,q.X,0,q.Z));}dashed(s,K,pts,9,303,{dash:28,cov:.8});}
 // "defender rushes in": a red arrow along his run
 if(c.rush!==undefined){const g=sm(c.rush,c.rush+.5,tt,easeOut)*(1-sm(c.jab+.3,c.jab+.7,tt));if(g>.02){const pts=[proj(st,D0[0]+.2,0,D0[1]-.2),proj(st,lerp(D0[0],D1[0],.5),0,lerp(D0[1],D1[1],.5)),proj(st,D1[0]-.25,0,D1[1]+.35)];const pp=partial(pts,g),rp=ribbon(pp,12,{seed:304,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(g>.6)arrowHead(s,R,pp,30,305);}}
 // "no time to swing": the big backswing arc, dashed, then a red cross over it
 {const g=sm(c.none,c.none+.4,tt,easeOut)*(1-sm(c.jab,c.jab+.3,tt));if(g>.02){const pts=swingArc(st,z);dashed(s,Y,pts,9,306,{dash:26,progress:g});
  const x=sm(c.none+.35,c.none+.6,tt);if(x>.02){const m=pts[Math.floor(pts.length/2)],r=60*easeOutBack(x);for(const sgn of[1,-1]){const rp=ribbon([[m[0]-r,m[1]-r*sgn],[m[0]+r,m[1]+r*sgn]],14,{seed:307+sgn,taper:.1,wobble:1});s.knockout(rp);s.fill(R,rp);}}}}
 // "jabs": a short yellow jab arrow off the toe, then the flight line
 {const g=sm(c.jab-.05,c.jab+.2,tt,easeOut)*(1-sm(c.goal+.3,c.goal+.7,tt));if(g>.02){const a=proj(st,BC[0]-Math.cos(YAW3)*.5,.12,BC[1]-Math.sin(YAW3)*.5),e=proj(st,BC[0]+Math.cos(YAW3)*.35,.12,BC[1]+Math.sin(YAW3)*.35),pts=partial([a,L2(a,e,.5),e],g),rp=ribbon(pts,13,{seed:308,taper:.2,wobble:1});s.knockout(rp);s.fill(Y,rp);if(g>.6)arrowHead(s,Y,pts,30,309);}}
 if(tt>L.hit){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=D.ball(lerp(L.hit,Math.min(tt,L.hit+D.fl),k/12));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,312,{dash:38});}
 const items:{z:number;draw:()=>void}[]=[
  {z:d.Z,draw:()=>athlete(s,st,D.def,tt,DEMO_D,{detail,smear:tt>L.rush&&tt<L.hit?.1:0})},
  {z:z.Z+.001,draw:()=>athlete(s,st,D.joel,tt,JOEL_TRAIN,{detail,smear:tt>L.hit-.15&&tt<L.hit+.15?.15:0})},
 ];
 if(!inNet)items.push({z:b.flying?b.Z:b.Z-.01,draw:drawB});
 items.sort((a,c2)=>c2.z-a.z).forEach(it=>it.draw());
 if(tt>=goalT&&tt<goalT+.9){const p=proj(st,TGT3[0],TGT3[1]+.3,GZ+.3);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:315,g:easeOut(sm(goalT,goalT+.3,tt))*(1-sm(goalT+.5,goalT+.9,tt))});}
}

// ================= chapter 3 — HOW HE DOES IT =================
const C3={trade:A(2,'His trademark'),how:A(2,'how he'),rush:A(2,'defender'),none:A(2,'no time'),jab:A(2,'jabs'),goal:A(2,'Goal'),end:AUTH[2].seconds};
const TL3:TL={pass0:C3.how-.2,pass1:C3.rush+.1,rush:C3.rush,hit:C3.jab+.08};
const DEMO3=demo(TL3);
const st3:Stage={F:1500,eye:1.8,cx:3.4,cz:J3[1]-6.0};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,f0=proj(st,J3[0],.9,J3[1]),g=proj(st,.3,1.1,GZ),mid=L2(f0,g,.4);
  camPath(s,t,[[0,f0[0]+30,f0[1]-40,1.6],[C3.how,f0[0]+20,f0[1]-40,1.55],[C3.rush,mid[0],mid[1]-20,1.3],[C3.none,L2(f0,mid,.6)[0],L2(f0,mid,.6)[1]-20,1.45],[C3.jab,L2(f0,mid,.6)[0],L2(f0,mid,.6)[1]-20,1.48],[C3.goal+.2,mid[0],mid[1]-30,1.32],[C3.end,mid[0],mid[1]-30,1.3]]);
  demoScene(s,st,tt,DEMO3,TL3,C3,'high');
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,DEMO3.joel(tt),.13));},
 still:C3.none+.5,
};

// ================= chapter 4 — PRACTISE: no time to swing? use a toe-poke and shoot fast; three cards; a tick =================
const C4={turn:A(3,'Your turn'),none:A(3,'no time'),use:A(3,'Use a'),fast:A(3,'shoot fast'),end:AUTH[3].seconds};
const TL4:TL={pass0:C4.turn-.4,pass1:C4.turn+.5,rush:C4.none-.4,hit:C4.fast+.05};
const DEMO4=demo(TL4);
const st4:Stage={F:1500,eye:1.9,cx:3.0,cz:J3[1]-6.2};
const CARD_W=150,CARD_H=165;
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,f0=proj(st,J3[0],.9,J3[1]),g=proj(st,.3,1,GZ),fc=L2(f0,g,.3);
  camPath(s,t,[[0,fc[0],fc[1]+40,1.35],[C4.none,fc[0],fc[1]+190,1.12],[C4.end,fc[0],fc[1]+190,1.12]]);
  demoScene(s,st,tt,DEMO4,TL4,{none:C4.none,jab:C4.fast,goal:C4.fast+.4},'mid');
  // three cards rise on "Your turn": NO BIG SWING, TOE-POKE, FAST — each prints its figure on its word
  const rise=sm(C4.turn,C4.turn+.6,tt,easeOut);
  if(rise>.01){const cy=fc[1]+190+335+(1-rise)*600,xs=[fc[0]-360,fc[0],fc[0]+360],on=[C4.none,C4.use,C4.fast],cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   xs.forEach((cx,i)=>{const q=handCut([[cx-CARD_W,cy-CARD_H],[cx+CARD_W,cy-CARD_H],[cx+CARD_W,cy+CARD_H],[cx-CARD_W,cy+CARD_H]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(B,cards,.16);
   xs.forEach((cx,i)=>{const u=sm(on[i],on[i]+.3,tt,easeOutBack);if(u<=.01)return;const gy=cy+CARD_H-28;
    const fcam=figureCam({x:cx+10,y:gy,height:262*(.9+.1*u),azimuth:-120,elevation:14,fov:16,at:[.2,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=i===0?strike(.4,{foot:'r'}):i===1?toePoke(TOE_CONTACT):toePoke(.72),Pc=(j:V3):Pt=>{const q=fcam.project(j);return[q[0],q[1]];};
    const cb=i===0?[.55,BALL_R,.2] as V3:toeBall(toePoke(TOE_CONTACT),0,JBUILD,.09),bb=Pc(i===2?[cb[0]+.8,BALL_R+.1,cb[2]]:cb),bR=BALL_R*(fcam.scale?fcam.scale(cb):100);
    // the diagrams: 1 = the big swing arc crossed out; 2 = the short yellow jab off the toe; 3 = speed lines behind the ball
    if(i===0){const sk=solve(pose,JBUILD,{}),ft=Pc(sk.rToe),hp=Pc(sk.rHip),pts:Pt[]=[];for(let k=0;k<=10;k++){const a=-.9+k/10*1.9;pts.push([hp[0]+Math.sin(a)*(ft[1]-hp[1])*1.05,hp[1]+Math.cos(a)*(ft[1]-hp[1])*1.05]);}dashed(s,Y,pts,7,84,{dash:18});
     const m=pts[5];for(const sg of[1,-1])s.fill(R,ribbon([[m[0]-44,m[1]-44*sg],[m[0]+44,m[1]+44*sg]],11,{seed:85+sg,taper:.1,wobble:1}));}
    if(i===1){const a=Pc([cb[0]-.45,.12,cb[2]]),e=Pc([cb[0]+.35,.12,cb[2]]);s.fill(Y,ribbon([a,L2(a,e,.5),e],10,{seed:86,taper:.2,wobble:1}));arrowHead(s,Y,[a,L2(a,e,.5),e],22,87);}
    if(i===2)speedLines(s,R,bb[0]-bR*1.2,bb[1],Math.PI,{n:4,seed:88,len:bR*3.2,width:5});
    shadow(s,bb[0],Pc([cb[0]+(i===2?.8:0),0,cb[2]])[1],bR*1.1,bR*.3,89+i,.4);ball(s,bb[0],bb[1],bR,81+i);
    drawAthlete(s,pose,fcam,{...JOEL_TRAIN,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "shoot fast": a big blue tick stamps over the FAST card, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.fast+.45,C4.fast+.8,tt));
  if(tick>.02){const c:Pt=[fc[0]+500,fc[1]+190+200],S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(B,tp);}
 },
 still:C4.use+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'joel-queiros-futsal-signature',format:'futsal',title:'Joel Queirós’s toe-poke finish',theme:'Use a toe-poke to shoot fast when there is no time to swing your leg.',
 ageNote:'For players aged 7–12: Joel’s free-kick goal in the 2010 UEFA Futsal Cup final is real (UEFA’s match report); exactly where it went in is not described, and the toe-poke is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball, a navy boot toe jabs it and a short yellow jab arrow shoots out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const jab=sm(.05,.2,age,easeOut),go=sm(.2,.7,age,easeOut),bx=x+go*160;
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.3*(1-go));
  if(age<.45){const tx=x-r*2.2+jab*r*1.3,toe=polyPath(blob(tx,y+r*.2,r*.7,r*.36,seed+3,{n:18}),true);s.fill(K,toe,.85*(1-sm(.3,.45,age)));}
  if(go>.02&&go<1){const pts:Pt[]=[[x-r*.4,y],[bx-r*1.2,y]];const rp=ribbon(pts,10*(1-go)+3,{seed,taper:.3,wobble:1});s.knockout(rp);s.fill(Y,rp);}
  ball(s,bx,y,r,seed,{rot:age*6});
 },
};
export default film;
