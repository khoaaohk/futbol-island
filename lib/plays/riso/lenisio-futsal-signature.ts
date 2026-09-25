/** Lenísio — "the pivot's quick finish": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: the card's Lenísio (lib/town/playerAppearance.json country Brazil; playerProfiles: "Brazilian pivot/forward and prolific marksman …
 *  netting 11 at the 2008 World Cup") is Lenísio Teixeira Júnior (born 23 Oct 1976, Cuiabá; 1.77 m; PIVOT; Atlético Mineiro, Ulbra,
 *  ElPozo Murcia, Polaris World Cartagena, Malwee; Brazil 1999–2008; 2008 world champion, 2000 World Cup runner-up). Country, position
 *  and bio all match — no namesake problem.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the pivot's quick finish (central, in the box) — not one match.
 *  No written source we could reach describes HOW any single Lenísio goal was scored (FIFA's technical report and match sheets list his
 *  goals and minutes only), so the film follows the brief's honest FALLBACK: chapter 1 is a REAL, documented match and shows only
 *  confirmed things (the arena, the teams, his two goals and their minutes on a TV-style timeline, the 7–0 score, a celebration); no goal,
 *  save or tackle of that match is staged. The finish itself is a separate, clearly framed demonstration ("Here's how he does it",
 *  training tops, no team named, no match claimed).
 *  The match: 2008 FIFA Futsal World Cup (hosted by Brazil), Group A, Match 17, 4 October 2008, 10:30, Nilson Nelson Gymnasium, Brasília
 *  (attendance 8,202): BRAZIL 7–0 RUSSIA (4–0 at half-time). Scorers: 1-0 3' Schumacher, 2-0 8' Prudnikov (own goal), 3-0 14' LENISIO,
 *  4-0 16' Cico, 5-0 22' LENISIO, 6-0 29' Falcão, 7-0 32' Vinícius. Lenísio (No. 10) started.
 *  Match choice: no other futsal film uses this match (Schumacher's film uses the 2008 final, Falcão/Neto the 2012 final, Manoel Tobias
 *  1996, others 2000/2004/2024) — checked by grepping the other films' headers.
 *  1  LIVE (broadcast camera HIGH in the main stand, real time, no ball in play): Brasília, the group match. Lenísio (Brazil's pivot) runs
 *     off celebrating toward the near corner, team-mates chase him, Russia's players walk away. A TV-style match-timeline graphic (0–40 min,
 *     Brazil swatch left, Russia right) drops a big ball on each of his goal minutes (14', 22'), then Brazil's other five goals, then the
 *     full-time box prints 7–0.
 *  2  HOW HE DOES IT (demonstration, real time, main-stand side, goal on the RIGHT; red training tops, a paper-top defender, a blue keeper):
 *     the ala plays the ball across the floor into the box, Lenísio arrives and hits it FIRST TIME, low, right foot, to the far post while
 *     the keeper is still shuffling across from the near post.
 *  3  WATCH AGAIN (slow-motion replay of the demonstration from LOW BEHIND the shooter, looking at the goal): the keeper still moving
 *     (red arrow under his feet), the ball already past him.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Shoot early in the box; futsal keepers have less time to react."): a ball rolled in,
 *     a first-time shot, three cards (in the box, first time, less time), a second rep and a tick.
 * Sources (written; fetched with curl and cached in scratchpad/films/src-cache/):
 *  - FIFA Futsal World Cup Brazil 2008 Technical Report (fifa-ffwc2008-tr.txt, cached by an earlier film): Match 17, 04.10.2008, 10:30,
 *    Brasilia, 8,202, BRAZIL v. RUSSIA 7-0 (4-0), the line-ups (BRA: 2 TIAGO* (GK), 6 GABRIEL*, 8 SCHUMACHER*, 10 LENISIO*, 11 MARQUINHO*;
 *    RUS: 12 ZUEV* (GK) …), the scorers and minutes above, referee Octalivar Carrero (VEN); venue list "Nilson Nelson Gymnasium, Brasilia";
 *    "Russia also reached the second phase … although their emphatic 7-0 defeat by Brazil was a surprise"; Lenísio among Brazil's four
 *    players nominated for the individual awards.
 *  - Wikipedia, "2008 FIFA Futsal World Cup" (raw, cached): hosted by Brazil; Lenísio Bronze Shoe, 11 goals (3rd top scorer).
 *  - Wikipedia, "Lenísio" (raw, fetched Sep 2026): https://en.wikipedia.org/wiki/Len%C3%ADsio — full name, birth, 1.77 m, pivot, clubs.
 *  - Correio Braziliense, "Na primeira Copa do Mundo juntos, os irmãos Vinícius e Lenísio garantem o profissionalismo" (7 Oct 2008):
 *    https://www.correiobraziliense.com.br/app/noticia/superesportes/2008/10/07/interna_superesportes,38570/na-primeira-copa-do-mundo-juntos-os-irmaos-vinicius-e-lenisio-garantem-o-profissionalismo.shtml
 *    — Brazil "surpreender a Rússia com um tranqüilo 7 x 0" at the Ginásio Nilson Nelson; "O pivô Lenísio … o vice-artilheiro, com oito
 *    gols"; he and captain Vinícius are brothers.
 * CONFIRMED (the only facts in the narration): Brasília, 2008, a World Cup at home in Brazil, Brazil v Russia, Lenísio as Brazil's pivot,
 *  his two goals, the 7–0 win. (The goal minutes 14' and 22' appear on the graphic.)
 * INFERRED (not named in the narration): kits — Brazil yellow shirts / blue shorts / white socks, Russia white shirts / red trim / red socks,
 *  the keepers' colours; the court colour (a blue court with a warm run-off); the look of the timeline graphic (a TV-style illustration,
 *  not the real broadcast graphic); which of his goals is being celebrated, which end, where he ran and who chased him; the ball left in the
 *  net; his shooting foot (right, not documented); no shirt numbers. No video was reviewed. Chapters 2–4 demonstrate a first-time finish in
 *  the box, not footage of a particular match.
 * Different from the parallel pivot films (Pito's spin, Higor's shield, Ferrão, Zicky Té): a group match of a home World Cup, a two-goal
 *  timeline with the other five goals filling in, a first-time finish from a pass (no back-to-goal turn), and a replay from BEHIND the
 *  shooter that shows the keeper still moving when the ball goes past him.
 * Technique (poses): the pivot times his run to meet the pass, plants beside the ball and strikes it as it arrives (no stopping touch),
 *  body over the ball to keep it low, aiming across the keeper to the far post while the keeper is still moving across his goal.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strike and the celebration run). Choreography lives in court coordinates (X along the court, the demo goal at
 *  X = +20; Z across, the main stand at Z < 0); each stage maps it with a proper rotation (BEH for the camera behind the shooter), so the
 *  right foot stays the right foot. Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Brazil, lights, diagrams), red (training tops, Russia trim, keeper arrows), blue (court, Brazil shorts, the demo keeper),
 *  navy (key line, stands, shorts). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet.
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 *  Every cue starts with a plain word (Kokoro splits contractions and hyphens), and each cue's first word is the NEXT such word in the
 *  recording (so "play Russia", not "Brazil play": "Brazil" is also the word before it). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Brasília 2008',text:'Brasília, 2008: the World Cup, at home in Brazil. Brazil play Russia. Their pivot, Lenísio, scores twice, and Brazil win seven nil!',tail:2.3,
  cues:['Brasília','the World','play Russia','Their pivot','scores twice','Brazil win'],heads:{'Brasília':'Brasília 2008','play Russia':'BRA v RUS','scores twice':'2 goals','Brazil win':'7–0'}},
 {label:'How he does it',text:'His famous move is the quick finish. Here’s how he does it. The pass comes into the box, and he shoots first time, low, before the keeper is ready!',tail:2.1,
  cues:['His famous','quick finish','The pass','into the box','shoots first','before the keeper'],heads:{'quick finish':'Quick finish','shoots first':'First time','before the keeper':''}},
 {label:'Watch again',text:'Watch again, slowly. The keeper is still moving across. The ball is already past him.',tail:2.2,
  cues:['Watch again','The keeper','still moving','The ball','already past'],heads:{'still moving':'Not set','already past':''}},
 {label:'Your turn',text:'Your turn. Shoot early in the box, because futsal keepers have less time to react!',tail:2.8,
  cues:['Your turn','Shoot early','in the box','futsal keepers','less time'],heads:{'Shoot early':'Shoot early','less time':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/lenisio-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/lenisio-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/lenisio-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lenisio: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lenisio: no cue '+w);return c.at;};
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
/** court → stage floor transforms (proper rotations, so a right foot stays a right foot). IDX: the main-stand side (the demo goal at
 *  X = +20 on the right). BEH: a camera BEHIND the shooter looking along +X at the goal: stage X = 10 − Z (the main stand on the right),
 *  stage Z = X (the goal line at depth 20). */
type Xf=(X:number,Z:number)=>[number,number];
const IDX:Xf=(X,Z)=>[X,Z];
const BEH:Xf=(X,Z)=>[10-Z,X];
const BEH_INV:Xf=(x,z)=>[z,10-x];
/** a camera turned by th about the court point (px,pz): a proper rotation and its inverse */
const rotXf=(th:number,px:number,pz:number):[Xf,Xf]=>{const c=Math.cos(th),s=Math.sin(th);return[(X,Z)=>[c*(X-px)-s*(Z-pz),s*(X-px)+c*(Z-pz)],(x,z)=>[c*x+s*z+px,-s*x+c*z+pz]];};
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
function projector(st:Stage,xf:Xf=IDX,inv:Xf=IDX):Projector{const e=inv(st.cx,st.cz);
 return{eye:[e[0],st.eye,-e[1]] as V3,project(p:V3){const[a,b]=xf(p[0],-p[2]),q=proj(st,a,p[1],b);return[q[0],q[1],b-st.cz];},scale(p:V3){return kAt(st,xf(p[0],-p[2])[1]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) on the court (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAM=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.72],[R,.38],[K,.1]];
const BUILD={height:1.77,bulk:1.04};
/** Lenísio for Brazil (kit inferred: yellow shirt, blue shorts, white socks), close-cropped dark hair, 1.77 m; no shirt number is drawn */
const LEN:AthleteStyle={shirt:Y,shorts:B,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:B,hairStyle:'short',build:BUILD,seed:10};
/** Lenísio in the demonstration and lesson: a plain red training top and navy shorts (no national kit, so no match is implied) */
const LEN_T:AthleteStyle={...LEN,shirt:[R,.92],shorts:K,socks:K,trim:K,boots:'paper'};
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:[[[Y,.8],[R,.26]],[[Y,.52],[R,.34],[K,.14]],[[Y,.74],[R,.22]]][n%3] as InkFill[],hair:K,line:K,trim:B,hairStyle:(['curly','short','bald'] as const)[n%3],build:{height:1.7+hash(n,3)*.12},seed:20+n});
/** Russia (kit inferred): white shirts with red trim, navy shorts, red socks; their keeper in navy; Brazil's keeper in grey-navy */
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:R,boots:K,skin:[[Y,.62],[R,.18]],hair:K,line:K,trim:R,hairStyle:(['short','balding','short','curly'] as const)[n%4],build:{height:1.74+hash(n,4)*.12},seed:40+n});
const RUS_GK:AthleteStyle={shirt:[K,.72],shorts:K,socks:K,boots:K,skin:[[Y,.62],[R,.2]],hair:K,line:K,trim:R,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
const BRA_GK:AthleteStyle={shirt:[K,.5],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.73},seed:62};
/** the demonstration players: a team-mate in the same red training top, a paper-top defender, a blue keeper (no team is claimed) */
const DEMO_A:AthleteStyle={...LEN_T,skin:[[Y,.8],[R,.26]],hairStyle:'curly',build:{height:1.72},seed:76};
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,hairStyle:'short',build:{height:1.83,bulk:1.04},seed:77};
const DEMO_K:AthleteStyle={shirt:[B,.8],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
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

// ---------------- the arena ----------------
/** stepped navy rows, lit faces, a home crowd in yellow / blue / paper shirts, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),blu=new Path2D(),pap=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.34)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)blu.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.54)pap.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(B,blu);s.knockout(pap,.8);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal court (40 × 20 m) through xf; the far boards and crowd; the demo goal (court X = +20) with its net.
 *  quad: the court's footprint in STAGE floor coords (IDX: −20…20 × 0…20; BEH: −10…10 × −20…20). Court colour inferred: a blue court
 *  with a warm run-off (the yellow shirts read clean on it). */
const BOARDS=21.2,GX=20,POST_N=8.5,POST_F=11.5,GH=2;
function court(s:Sheet,st:Stage,xf:Xf,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;inGoal?:()=>void;quad?:[number,number,number,number]|null}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,quad=o.quad===undefined?[-20,0,20,20]:o.quad,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.42);s.fill(R,rectPath(-span,wall,span*2,span),.26);
 const c=quad?polyPath(floorQuad(st,quad[0],quad[1],quad[2],quad[3]),true):rectPath(-span,wall,span*2,span);s.knockout(c,.5);s.fill(B,c,.42);s.fill(K,c,.06);
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
 s.fill(B,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
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
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.4){for(const Z of[POST_N,POST_F]){const a=P3(st,xf,GX,Yh,Z),b=back(Z,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,depthOf(xf,GX,10))*.018),.6);
}
function goalFrame(s:Sheet,st:Stage,xf:Xf){
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,depthOf(xf,GX,10))*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>P3(st,xf,GX+dx,Yh,Z);quad([P(0,-w),P(0,w),P(GH,w),P(GH,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*GH,y1=(k+1)/8*GH;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 const postB=(Z:number)=>{const P=(Yh:number,dz:number):Pt=>P3(st,xf,GX,Yh,Z+dz);quad([P(0,-w),P(0,w),P(GH,w),P(GH,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*GH,y1=(k+1)/8*GH;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 // posts are square; seen end-on (BEH) their width shows across Z, side-on (IDX) across X
 const endOn=xf===BEH;(endOn?postB:post)(POST_F);(endOn?postB:post)(POST_N);
 const Bb=(Z:number,dy:number):Pt=>P3(st,xf,GX,GH+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---------------- seven-segment digits (the timeline's minutes and the full-time score) ----------------
const SEG:Record<string,number[]>={'0':[1,1,1,1,1,1,0],'1':[0,1,1,0,0,0,0],'2':[1,1,0,1,1,0,1],'3':[1,1,1,1,0,0,1],'4':[0,1,1,0,0,1,1],'5':[1,0,1,1,0,1,1],'6':[1,0,1,1,1,1,1],'7':[1,1,1,0,0,0,0],'8':[1,1,1,1,1,1,1],'9':[1,1,1,1,0,1,1]};
const SEGL:[Pt,Pt][]=[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[1,2]],[[0,2],[1,2]],[[0,1],[0,2]],[[0,0],[0,1]],[[0,1],[1,1]]];
function digits(path:Path2D,str:string,x:number,y:number,h:number,seed:number,measure=false):number{
 const w=h*.5,gap=h*.26,lw=h*.14;let cx=x;
 for(const ch of str){
  const on=SEG[ch];if(!on){cx+=w+gap;continue;}
  if(!measure)on.forEach((v,i)=>{if(!v)return;const[a,b]=SEGL[i];path.addPath(ribbon([[cx+a[0]*w,y+a[1]*h/2],[cx+b[0]*w,y+b[1]*h/2]],lw,{seed:seed+i,taper:0,wobble:.4}));});
  cx+=w+gap;}
 return cx-x-gap;
}

// ================= chapter 1 — LIVE: Brasília 2008, Brazil 7–0 Russia; the celebration (no goal staged) + the match timeline =================
const C1={bsb:A(0,'Brasília'),wc:A(0,'the World'),rus:A(0,'play Russia'),piv:A(0,'Their pivot'),twice:A(0,'scores twice'),win:A(0,'Brazil win'),end:AUTH[0].seconds};
/** the celebration (all inferred): Lenísio runs from the right-hand box to the near corner, stops facing the stand and jumps, arms up */
const H0:[number,number]=[15.2,12.2],CORNER:[number,number]=[17.4,2.8];
const T_RUN0=.25,T_STOP=C1.twice-.1,T_ARMS=C1.twice+.5;
const liveH:Gen=T=>{
 const u=sm(T_RUN0,T_STOP,T,easeIO),X=lerp(H0[0],CORNER[0],u)+.3*Math.sin(u*Math.PI),Z=lerp(H0[1],CORNER[1],u);
 const runYaw=yawTo(CORNER[0]-H0[0],CORNER[1]-H0[1]),turn=sm(T_STOP-.3,T_STOP+.4,T,easeIO);
 let pose=celebrate(T*1.25,{kind:'run'});
 pose=blendPose(pose,posed({lHipF:14,rHipF:14,lKnee:16,rKnee:16,lShA:120,rShA:120,lShF:30,rShF:30,lElb:24,rElb:24,neckP:-24,lHand:1,rHand:1}),turn*(1-sm(T_ARMS-.35,T_ARMS,T)));
 pose=blendPose(pose,celebrate((T-T_ARMS)*1.15+.1,{kind:'arms'}),sm(T_ARMS-.35,T_ARMS,T));
 return{pose,yaw:lerp(runYaw,FACE_CAM+.25,turn),X,Z};
};
/** Brazil's other three (yellow) run in to him and jump with him; their keeper celebrates at the far end (mostly off frame) */
const BRA_FROM:[number,number][]=[[9.2,9.8],[12.4,16.4],[6.6,13.6]],BRA_AT:[number,number][]=[[-1.05,.75],[1.0,.95],[-.2,1.55]];
const liveB=(i:number):Gen=>T=>{const f=liveH(T_ARMS+.6),t0=[.4,.9,1.3][i],t1=T_ARMS+[-.3,.1,.45][i],u=sm(t0,t1,T,easeIO),X=lerp(BRA_FROM[i][0],f.X+BRA_AT[i][0],u),Z=lerp(BRA_FROM[i][1],f.Z+BRA_AT[i][1],u);
 const arrived=sm(t1-.2,t1+.1,T);let pose=blendPose(stand(),runCycle(T*runCadence(.9)+i*.3,{speed:.9}),sm(t0-.1,t0+.2,T)*(1-arrived));
 pose=blendPose(pose,celebrate((T-t1)*1.2+i*.27,{kind:'arms'}),arrived);
 return{pose,yaw:arrived>.5?lerp(yawTo(f.X-X,f.Z-Z),FACE_CAM,.5):yawTo(f.X+BRA_AT[i][0]-BRA_FROM[i][0],f.Z+BRA_AT[i][1]-BRA_FROM[i][1]),X,Z};};
const liveBK:Gen=T=>({pose:blendPose(keeperSet(T),celebrate(T*1.1,{kind:'arms'}),.8),yaw:FACE_RIGHT,X:-18.6,Z:10});
/** Russia (white): heads down, walking back toward the halfway line; their keeper crouched, then hands on his head */
const RUS_FROM:[number,number][]=[[14.2,8.2],[16.6,13.9],[12.0,11.4],[17.2,6.6]];
const DOWN=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:42,lShA:10,rShA:10,lShF:6,rShF:6,lElb:26,rElb:26});
const liveR=(i:number):Gen=>T=>{const d=Math.max(0,T-.6-i*.3)*(.9+.12*i),X=RUS_FROM[i][0]-d,Z=RUS_FROM[i][1]+Math.sin(i*2+d*.4)*.3,walk=clamp(d*3);
 let pose=blendPose(stand(),runCycle(T*1.1+i*.37,{speed:.05}),walk);pose=blendPose(pose,DOWN,.6);
 return{pose,yaw:FACE_LEFT+[.2,-.3,.1,-.15][i],X,Z};};
const CROUCH=posed({lHipF:62,rHipF:62,lKnee:72,rKnee:72,lHipA:14,rHipA:14,lean:44,neckP:30,lShF:38,rShF:38,lShA:14,rShA:14,lElb:12,rElb:12});
const liveK:Gen=T=>({pose:blendPose(CROUCH,posed({lHipF:8,rHipF:8,lKnee:10,rKnee:10,lean:8,neckP:30,lShA:40,rShA:40,lShF:-20,rShF:-20,lElb:110,rElb:110}),sm(C1.twice,T_ARMS+.5,T,easeIO)),yaw:FACE_LEFT+.4,X:GX-.9,Z:10.6+.3*sm(C1.twice,T_ARMS+.5,T)});
/** the main-stand broadcast camera: 17 m outside the near touchline, 9 m up; the stage pans with the focus (x) */
const bst=(camX:number):Stage=>({F:4200,eye:9,cx:camX,cz:-17});
const liveCam=(T:number)=>{const h=liveH(T),hA=liveH(T_ARMS);
 const fx=key(T,mono([[0,10.5],[C1.wc,12.4],[C1.rus,13.8],[C1.piv,h.X-1],[T_ARMS,hA.X-.6],[C1.end,hA.X-1.4]]),easeInOutSine),
  fz=key(T,mono([[0,10],[C1.rus,8.4],[C1.piv,5.8],[T_ARMS,3.8],[C1.end,4.2]]),easeInOutSine),
  zoom=key(T,mono([[0,.56],[C1.rus,.6],[C1.piv,.74],[T_ARMS,.9],[C1.win,.86],[C1.end,.84]]),easeInOutSine);
 return{fx,fz,zoom};};
/** Brazil's seven goals on a 40-minute clock (FIFA match sheet, minutes only → placed mid-minute); len = Lenísio's two */
const GOALS:{min:number;len:boolean}[]=[{min:3,len:false},{min:8,len:false},{min:14,len:true},{min:16,len:false},{min:22,len:true},{min:29,len:false},{min:32,len:false}];
/** the TV-style match timeline (screen space, box units): the Brazil swatch (left), the 0–40 bar, the Russia swatch, the goal balls
 *  (Lenísio's two big with their minutes, the other five small), the full-time score box. g = draw-in; bigDrop / restDrop = landing times */
function timeline(s:Sheet,T:number,g:number,bigDrop:number[],restDrop:number,ft:number){
 if(g<=.01)return;
 const top=-(s.H/2)/Math.max(1e-6,Math.min(s.W/BOX_W,s.H/BOX_H)*s.arrival);// the visible top edge (box units), so the graphic hugs the top in every window shape
 const y0=Math.max(top+84,-900),x0=-600,W=1120,H=64,slide=(1-easeOut(g))*-300;
 const plate=handCut([[x0-130,y0-60+slide],[x0+W+130,y0-60+slide],[x0+W+130,y0+H+62+slide],[x0-130,y0+H+62+slide]],901,4,40),pp=polyPath(plate,true);
 s.knockout(pp);s.fill(K,pp,.9);
 // the team swatches: Brazil (yellow over blue) left, Russia (paper with a red band) right
 const sw=(x:number,top2:string|null,band:string,seed:number)=>{const q=handCut([[x,y0-8+slide],[x+96,y0-8+slide],[x+96,y0+H+8+slide],[x,y0+H+8+slide]],seed,3,30),p=polyPath(q,true);s.knockout(p);if(top2)s.fill(top2,p);
  const bp=new Path2D();bp.rect(x,y0+H*.62+slide,96,H*.4);s.save();s.clip(p);s.fill(band,bp);s.restore();};
 sw(x0-116,Y,B,902);sw(x0+W+20,null,R,903);
 // the bar: a paper track with ticks every 10 minutes and a red half-time mark
 const bar=polyPath(handCut([[x0,y0+H*.3+slide],[x0+W,y0+H*.3+slide],[x0+W,y0+H*.7+slide],[x0,y0+H*.7+slide]],904,2,30),true);s.knockout(bar);
 const ticks=new Path2D();for(let m=0;m<=40;m+=10)ticks.rect(x0+W*m/40-3,y0+H*.12+slide,6,H*.76);s.fill(K,ticks,.7);
 const half=new Path2D();half.rect(x0+W/2-4,y0-6+slide,8,H+12);s.fill(R,half,.9);
 let bi=0,ri=0;
 GOALS.forEach((gl,i)=>{const d=gl.len?bigDrop[bi++]:restDrop+.13*ri++;if(T<d-.3)return;const u=sm(d-.3,d,T,easeIn),bo=settle(T,d,{amp:1,freq:3,decay:5})*(gl.len?16:8),x=x0+W*(gl.min-.5)/40,yb=y0+H*.5+slide,y=lerp(yb-300,yb,u)-Math.abs(bo);
  if(gl.len&&T>=d&&T<d+.4)sparkBurst(s,Y,x,yb,90,{n:8,seed:910+i,g:easeOut(sm(d,d+.25,T))*(1-sm(d+.25,d+.4,T))});
  if(gl.len){ball(s,x,y,30,920+i,{rot:u*4});
   if(T>=d){const lp=new Path2D(),lh=34,txt=String(gl.min),lw=digits(lp,txt,0,0,lh,0,true);digits(lp,txt,x-lw/2,y0+H+14+slide,lh,930+i*10);s.knockout(lp);s.fill(Y,lp);}}
  else ball(s,x,y,15,920+i,{rot:u*3});});
 // full time: a score box drops under the right end and prints 7–0 (Brazil 7, Russia 0)
 if(ft>.01){const bx=x0+W-150,by=y0+H+74+slide-(1-ft)*120,q=handCut([[bx,by],[bx+230,by],[bx+230,by+120],[bx,by+120]],940,4,30),p=polyPath(q,true);s.knockout(p);s.fill(Y,p,.95);s.fill(K,ribbon([...q,q[0]],7,{seed:944,close:true,wobble:1}),.9);
  const n=new Path2D();digits(n,'7',bx+30,by+20,80,941);digits(n,'0',bx+160,by+20,80,942);n.addPath(ribbon([[bx+95,by+60],[bx+135,by+60]],12,{seed:943,taper:0}));s.fill(K,n);}
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.fx),foc=proj(st,c.fx,1,c.fz);
 cam(s,0,foc[1],c.zoom);
 const cheer=.3+.7*sm(C1.bsb,C1.wc,T);
 court(s,st,IDX,T,{cheer,flash:pulse(T,T_ARMS,1.2)*.6,inGoal:()=>{
  // the ball left in the back of the net (inferred), then the keeper
  drawBall(s,st,IDX,{X:GX+.62,Y:BALL_R,Z:10.9,flying:false,spin:1},18);athlete(s,st,liveK,T,RUS_GK,{detail:'low'});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 RUS_FROM.forEach((_,i)=>{const g=liveR(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i),{detail:'low'})});});
 BRA_FROM.forEach((_,i)=>{const g=liveB(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BRA(i),{detail:'low'})});});
 items.push({z:liveBK(T).Z,draw:()=>athlete(s,st,liveBK,T,BRA_GK,{detail:'low'})});
 const h=liveH(T);
 items.push({z:h.Z,draw:()=>{
  // "Their pivot": a yellow ring stamps round him on the floor; "scores twice": two balls pop over his head
  const ring=easeOutBack(sm(C1.piv,C1.piv+.35,T))*(1-sm(T_ARMS+.3,T_ARMS+.8,T));floorDashRing(s,st,IDX,Y,h.X,h.Z,.9,9,101,ring);
  athlete(s,st,liveH,T,LEN,{detail:'mid',smear:T>T_RUN0&&T<T_STOP-.2?.1:0});
  if(T>=C1.twice-.1){const sk=solve(h.pose,BUILD,placeAt(h.X,h.Z,h.yaw)),hd=toMine(sk.head),k=kAt(st,hd[2]);
   for(let i=0;i<2;i++){const u=easeOutBack(sm(C1.twice-.1+i*.3,C1.twice+.25+i*.3,T)),a=-Math.PI/2+(i-.5)*.7,p=proj(st,hd[0],hd[1],hd[2]);if(u<=.02)continue;
    ball(s,p[0]+Math.cos(a)*k*.6*u,p[1]+Math.sin(a)*k*.6*u-k*.18,Math.max(12,k*.16*u),130+i,{rot:T*2+i});}}}});
 items.sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
 // the TV graphic, fixed on the screen: slides in on "play Russia", his two balls drop from "scores twice", the other five and 7–0 on "Brazil win"
 cam(s,0,0,1);
 timeline(s,T,sm(C1.rus-.1,C1.rus+.5,T),[C1.twice+.05,C1.twice+.4],C1.win-.15,sm(C1.win+.75,C1.win+1.15,T,easeOut));
 cam(s,0,foc[1],c.zoom);
}
/** a figure's chest on a stage (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,xf:Xf=IDX):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=P3(st,xf,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,depthOf(xf,ch[0],ch[2])),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).fx),liveH(tt),.14));},still:T_ARMS+.3};

// ================= the demonstration (chapters 2–3): the ala's pass into the box, the first-time finish, the keeper still moving =================
const C2={famous:A(1,'His famous'),quick:A(1,'quick finish'),pass:A(1,'The pass'),box:A(1,'into the box'),first:A(1,'shoots first'),keeper:A(1,'before the keeper'),end:AUTH[1].seconds};
/** the finish: the ball met in the box ≈4.7 m out, a touch right of centre; struck first time, low, to the far post (the keeper's right) */
const BALL_SH:[number,number]=[15.3,9.35];
const TGT:V3=[GX+.05,.28,POST_F-.42];
const YAW_SH=yawTo(TGT[0]-BALL_SH[0],TGT[2]-BALL_SH[1]);
const SB=toMine(strikeBall(YAW_SH)),PLANT:[number,number]=[BALL_SH[0]-SB[0],BALL_SH[1]-SB[2]];
const T_HIT=C2.first+.08,T_PASS=T_HIT-1.05,T_IN=T_HIT+.3;
/** the ala's pass: from the left of the box (toward the main-stand side), along the floor, into the box */
const P0:[number,number]=[10.2,6.6];
const YAW_PASS=yawTo(BALL_SH[0]-P0[0],BALL_SH[1]-P0[1]);
const SBA=toMine(strikeBall(YAW_PASS)),ALA_PLANT:[number,number]=[P0[0]-SBA[0],P0[1]-SBA[2]];
/** the ala carries it down the wing (the ball a fixed step ahead), stops, and plays the pass (right foot) */
const ALA_DIR:[number,number]=[Math.cos(-.35),Math.sin(-.35)*-1];
const alaAt=(t:number):[number,number]=>{const u=sm(0,T_PASS-.35,t,easeOut),d=(1-u)*3.2;return[ALA_PLANT[0]-ALA_DIR[0]*d,ALA_PLANT[1]-ALA_DIR[1]*d];};
const demoA:Gen=t=>{
 const[X,Z]=alaAt(t);let pose=dribble(t*1.9,{foot:'r',speed:.55});let yaw=lerp(yawTo(ALA_DIR[0],ALA_DIR[1]),YAW_PASS,sm(T_PASS-1.1,T_PASS-.35,t,easeIO));
 const st=key(t,[[T_PASS-.4,.2],[T_PASS,STRIKE_CONTACT],[T_PASS+.55,.9]],linear);
 pose=blendPose(pose,strike(st,{foot:'r',power:.5}),sm(T_PASS-.5,T_PASS-.3,t)*(1-sm(T_PASS+.6,T_PASS+1.1,t)));
 if(t>T_PASS+.6){pose=blendPose(pose,blendPose(stand(),runCycle(t*runCadence(.5),{speed:.5}),sm(T_PASS+.8,T_PASS+1.2,t)),sm(T_PASS+.6,T_PASS+1.1,t));yaw=lerp(YAW_PASS,yawTo(1,.6),sm(T_PASS+.6,T_PASS+1.2,t));}
 const go=Math.max(0,t-T_PASS-.9)*2.2*sm(T_PASS+.8,T_PASS+1.3,t);
 return{pose,yaw,X:X+Math.cos(yawTo(1,.6))*go,Z:Z+Math.sin(yawTo(1,.6))*go};
};
/** Lenísio: drifts at the back of the box checking his shoulder, then darts to meet the pass and strikes it first time (right foot) */
const RUN0:[number,number]=[13.4,12.3];
const T_R0=T_HIT-1.25,T_PL=T_HIT-.16;
const demoH:Gen=t=>{
 let X:number,Z:number,pose:Pose,yaw:number;
 const runYaw=yawTo(PLANT[0]-RUN0[0],PLANT[1]-RUN0[1]);
 if(t<T_R0){X=RUN0[0]-.5*Math.sin(t*.8)+.3;Z=RUN0[1]+.25*Math.sin(t*1.1);yaw=lerp(FACE_RIGHT+.4,yawTo(P0[0]-X,P0[1]-Z),.5+.3*Math.sin(t*1.3));
  pose=blendPose(stand(),runCycle(t*1.4,{speed:.15}),.5);pose=blendPose(pose,posed({neckY:-40,lean:10,lHipF:14,rHipF:14,lKnee:24,rKnee:24,lShA:20,rShA:20,lElb:40,rElb:40}),.4*sm(C2.pass,C2.pass+.4,t));}
 else if(t<T_HIT+.6){const u=sm(T_R0,T_PL,t,easeOut),s0:[number,number]=[RUN0[0]-.5*Math.sin(T_R0*.8)+.3,RUN0[1]+.25*Math.sin(T_R0*1.1)];
  X=lerp(s0[0],PLANT[0],u)+.25*sm(T_HIT,T_HIT+.5,t)*Math.cos(YAW_SH);Z=lerp(s0[1],PLANT[1],u)+.25*sm(T_HIT,T_HIT+.5,t)*Math.sin(YAW_SH);
  yaw=lerp(runYaw,YAW_SH,sm(T_HIT-.5,T_HIT-.15,t,easeIO));
  const st=key(t,[[T_HIT-.34,.22],[T_HIT,STRIKE_CONTACT],[T_HIT+.6,.95]],linear);
  pose=blendPose(runCycle((t-T_R0)*runCadence(.95),{speed:.95}),strike(st,{foot:'r',power:.9}),sm(T_HIT-.42,T_HIT-.3,t));}
 else{const e=demoH(T_HIT+.599);X=e.X;Z=e.Z;yaw=e.yaw;pose=strike(.95,{foot:'r'});
  if(t>T_IN+.45){const u=sm(T_IN+.45,T_IN+1.05,t,easeIO);pose=blendPose(pose,celebrate((t-T_IN-.45)*1.2,{kind:'arms'}),u);yaw=lerp(e.yaw,FACE_CAM+.3,u);}}
 return{pose,yaw,X,Z};
};
/** the ball: carried by the ala → the pass along the floor (≈6.5 m/s, slowing a little) → struck first time → the far corner → in the net */
function demoBall(t:number):BallS{
 const off:[number,number]=[P0[0]-ALA_PLANT[0],P0[1]-ALA_PLANT[1]];
 if(t<T_PASS){const[ax,az]=alaAt(t),touch=.12*Math.abs(Math.sin(t*3.2))*(1-sm(T_PASS-.6,T_PASS-.3,t));return{X:ax+off[0]+ALA_DIR[0]*touch,Y:BALL_R,Z:az+off[1]+ALA_DIR[1]*touch,flying:false,spin:t*6};}
 if(t<T_HIT){const x=sm(T_PASS,T_HIT,t,linear),u=.72*x+.28*easeOut(x);return{X:lerp(P0[0],BALL_SH[0],u),Y:BALL_R,Z:lerp(P0[1],BALL_SH[1],u),flying:false,spin:(t-T_PASS)*16};}
 if(t<T_IN){const u=sm(T_HIT,T_IN,t,linear),M:V3=[lerp(BALL_SH[0],TGT[0],.5),.34,lerp(BALL_SH[1],TGT[2],.5)],a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;
  return{X:a*BALL_SH[0]+b*M[0]+c*TGT[0],Y:a*BALL_R+b*M[1]+c*TGT[1],Z:a*BALL_SH[1]+b*M[2]+c*TGT[2],flying:true,spin:20+u*30};}
 const d=sm(T_IN,T_IN+.3,t,easeOut);return{X:lerp(TGT[0],GX+.66,d),Y:lerp(TGT[1],BALL_R,sm(T_IN+.1,T_IN+.4,t)),Z:TGT[2]+.1*d,flying:false,spin:40};
}
/** the defender: goal-side of Lenísio at the back of the box, a step behind the dart; his block (left leg) arrives too late */
const DEF0:[number,number]=[14.7,13.3];
const DEF_POSE=posed({lHipF:30,rHipF:30,lKnee:44,rKnee:44,lean:22,lShF:40,rShF:34,lShA:22,rShA:22,lElb:30,rElb:40,neckP:16});
const demoD:Gen=t=>{
 const u=sm(T_R0+.2,T_HIT+.1,t,easeIO),X=lerp(DEF0[0],PLANT[0]-.2,u),Z=lerp(DEF0[1],PLANT[1]+2.1,u);
 let pose=blendPose(backpedal(t*1.1),DEF_POSE,.7);
 pose=blendPose(pose,runCycle(t*runCadence(.8),{speed:.8}),sm(T_R0+.15,T_R0+.4,t)*(1-sm(T_HIT-.3,T_HIT-.1,t)));
 pose=blendPose(pose,lunge(key(t,[[T_HIT-.25,0],[T_HIT+.1,.6],[T_HIT+.8,.7]],linear),{side:'l'}),sm(T_HIT-.3,T_HIT-.1,t));
 const b=demoBall(Math.min(t,T_HIT));return{pose,yaw:yawTo(b.X-X,b.Z-Z),X,Z};
};
/** the keeper: set toward the near post while the ball is on the wing, shuffling across as the pass comes in — still moving at the shot;
 *  his dive to the far post (his right) comes late */
const K_Z0=9.15,K_Z1=10.25,T_K0=T_PASS+.1,T_K1=T_HIT+.28,T_DIVE=T_HIT+.1;
const keeperZ=(t:number)=>lerp(K_Z0,K_Z1,sm(T_K0,T_K1,t,easeIO));
const SHUFFLE=posed({lHipF:40,rHipF:34,lKnee:62,rKnee:56,lHipA:24,rHipA:12,lean:24,pitch:4,lShA:40,rShA:40,lShF:30,rShF:30,lElb:40,rElb:40,neckP:4,lHand:1,rHand:1,air:.04});
const demoK:Gen=t=>{const mv=sm(T_K0,T_K0+.15,t)*(1-sm(T_K1-.1,T_K1,t));let pose=blendPose(keeperSet(t*1.2),SHUFFLE,mv*(.6+.4*Math.abs(Math.sin(t*9))));
 if(t>=T_DIVE)pose=blendPose(pose,keeperDive(sm(T_DIVE,T_DIVE+.75,t,linear)*.95,{side:'r',height:.1}),sm(T_DIVE,T_DIVE+.08,t));
 const b=demoBall(Math.min(t,T_HIT));return{pose,yaw:lerp(FACE_LEFT,yawTo(b.X-(GX-.8),b.Z-keeperZ(t)),.55),X:GX-.8,Z:keeperZ(t)};};
const H_SMEAR=(t:number)=>(t>T_R0+.2&&t<T_HIT-.35)?.1:(t>T_HIT-.15&&t<T_HIT+.2)?.16:0;

// ================= chapter 2 — HOW HE DOES IT: the main-stand side, lower and closer, real time, the goal on the RIGHT =================
const st2:Stage={F:1500,eye:2.8,cx:15,cz:-2};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,xf=IDX;
  const gH=proj(st,RUN0[0],1,RUN0[1]),gA=proj(st,P0[0],1,P0[1]),gS=proj(st,BALL_SH[0],1,BALL_SH[1]),gG=proj(st,GX-1,1,10);
  camPath(s,t,[[0,lerp(gH[0],gA[0],.4),lerp(gH[1],gA[1],.4),1.45],[C2.quick,gH[0]-10,gH[1]+10,2.6],[C2.quick+1.6,gH[0]-40,gH[1]+10,2.4],[C2.pass-.3,lerp(gS[0],gA[0],.5),lerp(gS[1],gA[1],.5),1.35],
   [C2.box,lerp(gS[0],gA[0],.45),lerp(gS[1],gA[1],.45),1.35],[C2.first,lerp(gS[0],gG[0],.3),gS[1],1.95],[C2.keeper,lerp(gS[0],gG[0],.5),gS[1],1.8],[C2.end,lerp(gS[0],gG[0],.45),gS[1]+10,1.7]],[4*pulse(t,T_HIT,.3)*Math.sin(t*80),0]);
  const b=demoBall(tt),goal=tt>=T_IN;
  court(s,st,xf,tt,{cheer:goal?.8:.1,flash:pulse(tt,T_IN,1.2),bulge:.42*sm(T_IN-.1,T_IN,tt)*(1-.6*sm(T_IN+.2,T_IN+1,tt)),bz:TGT[2],by:TGT[1],
   inGoal:()=>athlete(s,st,demoK,tt,DEMO_K,{xf,detail:'mid'})});
  const h=demoH(tt),d=demoD(tt),a=demoA(tt);
  // "quick finish": a yellow dashed ring round him; "The pass": the dashed pass lane ala → the spot; "into the box": a yellow target ring on
  // the spot; "shoots first": the dashed shot line; "before the keeper": a red ring at the keeper's feet and his shuffle arrow
  floorDashRing(s,st,xf,Y,h.X,h.Z,.85,9,201,easeOutBack(sm(C2.quick,C2.quick+.35,tt))*(1-sm(C2.pass-.2,C2.pass+.2,tt)));
  const pl=sm(C2.pass,C2.pass+.6,tt,easeOut)*(1-sm(T_HIT,T_HIT+.3,tt));
  if(pl>.02){const pts:Pt[]=[];for(let k2=0;k2<=10;k2++)pts.push(proj(st,lerp(P0[0],BALL_SH[0],k2/10),0,lerp(P0[1],BALL_SH[1],k2/10)));dashed(s,Y,pts,9,202,{dash:30,progress:pl});if(pl>.9)arrowHead(s,Y,pts,28,203);}
  floorDashRing(s,st,xf,Y,BALL_SH[0],BALL_SH[1],.55,8,204,easeOutBack(sm(C2.box,C2.box+.35,tt))*(1-sm(T_HIT+.1,T_HIT+.4,tt)));
  if(tt>=T_HIT){const pts:Pt[]=[];for(let k2=0;k2<=12;k2++){const q=demoBall(lerp(T_HIT,Math.min(tt,T_IN),k2/12));pts.push(proj(st,q.X,0,q.Z));}dashed(s,Y,pts,8,205,{dash:28});}
  const kr=easeOutBack(sm(C2.keeper,C2.keeper+.35,tt));
  if(kr>.02){floorDashRing(s,st,xf,R,GX-.8,keeperZ(T_HIT),.6,8,206,kr);const pts:Pt[]=[proj(st,GX-1.5,0,K_Z0),proj(st,GX-1.5,0,lerp(K_Z0,K_Z1,.5)),proj(st,GX-1.5,0,K_Z1+.3)],q=partial(pts,kr),rp=ribbon(q,10,{seed:207,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(kr>.6)arrowHead(s,R,q,26,208);}
  // figures back to front (stage depth); the ball slots in by depth
  const items:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{xf,detail:'high',smear:tt>T_HIT-.3&&tt<T_HIT+.1?.12:0})},
   {z:a.Z,draw:()=>athlete(s,st,demoA,tt,DEMO_A,{xf,detail:'mid',smear:tt>T_PASS-.1&&tt<T_PASS+.2?.12:0})},
   {z:h.Z-.02,draw:()=>athlete(s,st,demoH,tt,LEN_T,{xf,detail:'high',smear:H_SMEAR(tt)})},
   {z:b.Z-.03,draw:()=>{const tr:Pt[]=[];if(b.flying)for(let k2=0;k2<=8;k2++){const q=demoBall(Math.max(T_HIT,tt-.15+k2*.019));tr.push(proj(st,q.X,q.Y,q.Z));}
    const o=drawBall(s,st,xf,b,211,{trail:tr,smear:b.flying?.35:0,dir:0});if(tt>=T_HIT&&tt<T_HIT+.2)sparkBurst(s,Y,o.p[0],o.p[1],o.r*2.6,{n:10,seed:212,g:easeOut(sm(T_HIT,T_HIT+.15,tt))});}},
  ];
  items.sort((a2,c)=>c.z-a2.z).forEach(it=>it.draw());
  if(tt>=T_IN&&tt<T_IN+.6){const p=P3(st,xf,TGT[0],TGT[1],TGT[2]);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:213,g:easeOut(sm(T_IN,T_IN+.3,tt))*(1-sm(T_IN+.35,T_IN+.6,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,demoH(tt),.14));},
 still:T_HIT+.02,
};

// ================= chapter 3 — WATCH AGAIN: slow motion, LOW BEHIND the shooter looking at the goal; the keeper still moving =================
const C3={watch:A(2,'Watch again'),keeper:A(2,'The keeper'),still:A(2,'still moving'),ball:A(2,'The ball'),past:A(2,'already past'),end:AUTH[2].seconds};
/** replay seconds → demo seconds: slow motion (≈0.2–0.6×, never faster than real time) from the pass's last metres to the ball in the net */
const repT=(t:number)=>key(t,[[0,T_HIT-.95],[C3.keeper,T_HIT-.45],[C3.still,T_HIT-.12],[C3.ball,T_HIT+.04],[C3.past,T_IN-.02],[C3.end,T_IN+.7]],linear);
/** the camera 4 m behind his plant spot, a little to his right (the main-stand side), 1.5 m up, looking along +X */
const stR:Stage={F:1250,eye:1.6,cx:10-PLANT[1]-1.8,cz:PLANT[0]-4.8};
const RO={xf:BEH,inv:BEH_INV};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),T=repT(tt),Tc=repT(t),st=stR,xf=BEH;
  const gH=P3(st,xf,PLANT[0],1,PLANT[1]),gK=P3(st,xf,GX-.8,1,keeperZ(T_HIT)),mid=L2(gH,gK,.5);
  camPath(s,t,[[0,lerp(gH[0],mid[0],.3),gH[1]-40,1.05],[C3.keeper,lerp(mid[0],gK[0],.5),gK[1],1.5],[C3.still,gK[0],gK[1],1.75],[C3.ball,lerp(mid[0],gK[0],.4),lerp(mid[1],gK[1],.5),1.35],[C3.past,lerp(mid[0],gK[0],.6),gK[1],1.45],[C3.end,mid[0],mid[1],1.15]],
   [5*pulse(Tc,T_HIT,.4)*Math.sin(t*90),3*pulse(Tc,T_IN,.5)*Math.sin(t*60)]);
  const b=demoBall(T);
  court(s,st,xf,T,{cheer:T>=T_IN?.7:.05,flash:pulse(T,T_IN,1),bulge:.4*sm(T_IN-.1,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1,T)),bz:TGT[2],by:TGT[1],quad:[-10,-20,10,20],
   inGoal:()=>{}});
  const h=demoH(T),d=demoD(T),a=demoA(T),k=demoK(T);
  // "The keeper": a red dashed ring at his feet; "still moving": a red arrow of his shuffle under him; "The ball": a yellow ring round the
  // ball; "already past": the ball's path glows yellow behind him and a spark
  floorDashRing(s,st,xf,R,GX-.8,k.Z,.55,7,301,easeOutBack(sm(C3.keeper,C3.keeper+.35,tt))*(1-sm(C3.past+.4,C3.past+.9,tt)));
  const mg=sm(C3.still,C3.still+.5,tt,easeOut)*(1-sm(C3.past+.4,C3.past+.9,tt));
  if(mg>.02){const pts:Pt[]=[P3(st,xf,GX-1.4,0,K_Z0),P3(st,xf,GX-1.4,0,lerp(K_Z0,K_Z1,.5)),P3(st,xf,GX-1.4,0,K_Z1+.35)],q=partial(pts,mg),rp=ribbon(q,12,{seed:302,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(mg>.6)arrowHead(s,R,q,30,303);}
  if(T>=T_HIT){const pts:Pt[]=[];for(let k2=0;k2<=12;k2++){const q=demoBall(lerp(T_HIT,Math.min(T,T_IN),k2/12));pts.push(P3(st,xf,q.X,0,q.Z));}dashed(s,Y,pts,9,304,{dash:30});}
  const its:{z:number;draw:()=>void}[]=[];
  its.push({z:depthOf(xf,k.X,k.Z),draw:()=>athlete(s,st,demoK,T,DEMO_K,{...RO,detail:'high'})});
  its.push({z:depthOf(xf,d.X,d.Z),draw:()=>athlete(s,st,demoD,T,DEMO_D,{...RO,detail:'high',smear:T>T_HIT-.3&&T<T_HIT+.1?.12:0})});
  its.push({z:depthOf(xf,a.X,a.Z),draw:()=>athlete(s,st,demoA,T,DEMO_A,{...RO,detail:'mid'})});
  its.push({z:depthOf(xf,h.X,h.Z),draw:()=>athlete(s,st,demoH,T,LEN_T,{...RO,detail:'high',smear:H_SMEAR(T)})});
  its.push({z:depthOf(xf,b.X,b.Z)-.03,draw:()=>{const tr:Pt[]=[];if(b.flying)for(let k2=0;k2<=8;k2++){const q=demoBall(Math.max(T_HIT,T-.1+k2*.0125));tr.push(P3(st,xf,q.X,q.Y,q.Z));}
   const o=drawBall(s,st,xf,b,311,{min:10,trail:tr,smear:b.flying?.25:0,dir:-Math.PI/2});
   const bg=easeOutBack(sm(C3.ball,C3.ball+.3,tt))*(1-sm(C3.past+.3,C3.past+.7,tt));if(bg>.02)s.fill(Y,ribbon(blob(o.p[0],o.p[1],o.r*1.9*bg,o.r*1.9*bg,312,{n:18}),Math.max(4,o.r*.22),{seed:313,close:true,wobble:1}),.95);
   if(T>=T_HIT&&T<T_HIT+.15)sparkBurst(s,Y,o.p[0],o.p[1],o.r*2.6,{n:10,seed:314,g:easeOut(sm(T_HIT,T_HIT+.1,T))});}});
  its.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
  const pp=pulse(tt,C3.past,.7);if(pp>.05){const p=P3(st,xf,TGT[0],TGT[1],TGT[2]);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:315,g:Math.min(1,pp*1.4)});}
 },
 aperture(t0){const{tt}=clock(2,t0),T=repT(tt),b=demoBall(T),p=P3(stR,BEH,b.X,b.Y,b.Z),r=Math.max(10,kAt(stR,depthOf(BEH,b.X,b.Z))*BALL_R)*1.2,q:Pt[]=[];for(let i=0;i<12;i++){const an=i/12*TAU;q.push([p[0]+Math.cos(an)*r,p[1]+Math.sin(an)*r]);}return aperture(q);},
 still:C3.still+.2,
};

// ================= chapter 4 — YOUR TURN: a ball rolled in, a first-time shot; three cards; a second rep; a tick =================
const C4={turn:A(3,'Your turn'),early:A(3,'Shoot early'),box:A(3,'in the box'),keepers:A(3,'futsal keepers'),less:A(3,'less time'),end:AUTH[3].seconds};
const B4:[number,number]=[16.6,9.8],TGT4:V3=[GX+.05,.3,POST_F-.45];
const YAW4=yawTo(TGT4[0]-B4[0],TGT4[2]-B4[1]),SB4=toMine(strikeBall(YAW4)),PL4:[number,number]=[B4[0]-SB4[0],B4[1]-SB4[2]];
const REPS=[C4.early+.12,C4.less+1.35];
const FROM4:[number,number]=[B4[0]-6.2,B4[1]-1.4];
/** which rep is live at t, and its strike time */
const repOf=(t:number)=>t<REPS[0]+1.2?0:1;
const practiceH:Gen=t=>{const ts=REPS[repOf(t)],st=key(t,[[ts-.36,.22],[ts,STRIKE_CONTACT],[ts+.6,.95]],linear);
 const ready=blendPose(stand(),posed({lHipF:22,rHipF:22,lKnee:34,rKnee:34,lean:16,lShA:24,rShA:24,lElb:40,rElb:40,neckY:-30,air:.02*Math.abs(Math.sin(t*5))}),.7);
 let pose=blendPose(ready,strike(st,{foot:'r',power:.85}),sm(ts-.5,ts-.34,t)*(1-sm(ts+.75,ts+1.15,t)));
 const fw=.22*sm(ts,ts+.5,t)*(1-sm(ts+.8,ts+1.2,t));
 if(repOf(t)===1&&t>ts+.9)pose=blendPose(pose,celebrate((t-ts-.9)*1.2,{kind:'arms'}),sm(ts+.9,ts+1.3,t));
 return{pose,yaw:lerp(yawTo(FROM4[0]-PL4[0],FROM4[1]-PL4[1])+.4,YAW4,sm(ts-1.1,ts-.35,t,easeIO)),X:PL4[0]+Math.cos(YAW4)*fw,Z:PL4[1]+Math.sin(YAW4)*fw};};
function ball4(t:number,rep:number):BallS|null{const ts=REPS[rep],t0=ts-1.05,ti=ts+.3;
 if(t<t0-.25)return null;
 if(t<ts){const u=sm(t0,ts,t,x=>.7*x+.3*easeOut(x));return{X:lerp(FROM4[0],B4[0],u),Y:BALL_R,Z:lerp(FROM4[1],B4[1],u),flying:false,spin:t*12};}
 if(t<ti){const u=sm(ts,ti,t,linear),M:V3=[lerp(B4[0],TGT4[0],.5),.36,lerp(B4[1],TGT4[2],.5)],a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return{X:a*B4[0]+b*M[0]+c*TGT4[0],Y:a*BALL_R+b*M[1]+c*TGT4[1],Z:a*B4[1]+b*M[2]+c*TGT4[2],flying:true,spin:20+u*30};}
 const d=sm(ti,ti+.3,t,easeOut);return{X:lerp(TGT4[0],GX+.6-.12*rep,d),Y:lerp(TGT4[1],BALL_R,sm(ti+.1,ti+.4,t)),Z:TGT4[2]-.3*rep+.1*d,flying:false,spin:40};}
/** the practice keeper: set, but each time the shot beats him before he's moved far */
const practiceK:Gen=t=>{const ts=REPS[repOf(t)];let pose=keeperSet(t*1.2);if(t>=ts+.1&&t<ts+1.3)pose=blendPose(pose,keeperDive(sm(ts+.1,ts+.85,t,linear)*.9,{side:'r',height:.1}),sm(ts+.1,ts+.18,t)*(1-sm(ts+1.0,ts+1.3,t)));
 return{pose,yaw:FACE_LEFT-.1,X:GX-.8,Z:9.7};};
/** a DIAGONAL camera for the practice: turned 40° toward the goal (a proper rotation about his spot), 2 m up, 6 m back, so the goal mouth
 *  and the keeper face the camera and every shot visibly goes in */
const[X4,X4I]=rotXf(.7,B4[0],B4[1]);
const st4:Stage={F:1500,eye:2,cx:.9,cz:-6};
const R4={xf:X4,inv:X4I};
const CARD_Y=820,CARD_W=190,CARDS:[number,number,'box'|'first'|'time'][]=[[-420,C4.box-.05,'box'],[0,C4.keepers-.2,'first'],[420,C4.less-.1,'time']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  const gP=P3(st,X4,PL4[0],.9,PL4[1]),gG=P3(st,X4,GX-.5,.9,10);
  camPath(s,t,[[0,lerp(gP[0],gG[0],.45),gP[1]-10,1.25],[C4.early,lerp(gP[0],gG[0],.45),gP[1]-10,1.28],[C4.box-.3,lerp(gP[0],gG[0],.45),gP[1]+170,1.1],[C4.less+.5,lerp(gP[0],gG[0],.45),gP[1]+170,1.1],[C4.less+1,lerp(gP[0],gG[0],.45),gP[1]-10,1.28],[C4.end,lerp(gP[0],gG[0],.45),gP[1]-20,1.32]]);
  const inAt=REPS.map(r=>r+.3),last=tt>=inAt[1]?1:tt>=inAt[0]?0:-1;
  court(s,st,X4,tt,{quad:null,cheer:.7*pulse(tt,inAt[1]+.2,1.4),bulge:last<0?0:.38*sm(inAt[last]-.1,inAt[last],tt)*(1-.6*sm(inAt[last]+.2,inAt[last]+1,tt)),bz:TGT4[2],by:TGT4[1],
   inGoal:()=>{for(let r=0;r<2;r++){const b=ball4(tt,r);if(b&&tt>=inAt[r])drawBall(s,st,X4,b,420+r);}athlete(s,st,practiceK,tt,DEMO_K,{...R4,detail:'mid'});}});
  const h=practiceH(tt);
  // "in the box": a yellow ring on his spot
  floorDashRing(s,st,X4,Y,B4[0],B4[1],.6,8,401,easeOutBack(sm(C4.box,C4.box+.35,tt))*(1-sm(C4.less+.4,C4.less+.8,tt)));
  const items:{z:number;draw:()=>void}[]=[{z:depthOf(X4,h.X,h.Z),draw:()=>athlete(s,st,practiceH,tt,LEN_T,{...R4,detail:'high',smear:REPS.some(r=>tt>r-.15&&tt<r+.2)?.16:0})}];
  for(let r=0;r<2;r++){const b=ball4(tt,r);if(b&&tt<inAt[r])items.push({z:depthOf(X4,b.X,b.Z)-.03,draw:()=>{const tr:Pt[]=[];if(b.flying)for(let k2=0;k2<=8;k2++){const q=ball4(Math.max(REPS[r],tt-.15+k2*.019),r);if(q)tr.push(P3(st,X4,q.X,q.Y,q.Z));}
   drawBall(s,st,X4,b,410+r,{trail:tr,smear:b.flying?.35:0,dir:0});}});}
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "in the box", each prints one step with a small figure; they drop after "less time", before the second rep
  const rise=sm(C4.box-.2,C4.box+.4,tt,easeOut),drop=sm(C4.less+.5,C4.less+.9,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y+230+dy],[cx-CARD_W,CARD_Y+230+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.16);
   CARDS.forEach(([cx,t0c,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+175;
    const fc=figureCam({x:cx+10,y:gy,height:400*(.9+.1*on),azimuth:kind==='time'?-20:-10,elevation:12,fov:16,at:[0,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    // side view, facing +x: box = a yellow ring round his feet; first = the ball met at the foot, a navy arrow on to goal;
    // time = a keeper still in his set position under a red stopwatch arc, almost run out
    if(kind==='box'){const c=Pc([0,0,0]);s.fill(Y,ribbon(blob(c[0],c[1],90,26,84,{n:18}),8,{seed:85,close:true,wobble:1,gaps:[[.1,.18],[.35,.43],[.6,.68],[.85,.93]]}),.95);
     drawAthlete(s,stand(),fc,{...LEN_T,detail:'mid',shadow:[K,.2]},{},{prev:stand()});const bp=Pc([.45,BALL_R,.1]);ball(s,bp[0],bp[1],15,81);}
    if(kind==='first'){const sb=strikeBall(0),a0=Pc(sb),a1=Pc([sb[0]+1.4,.25,sb[2]]),pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,K,pts,8,86,{dash:22});arrowHead(s,K,pts,24,87);
     drawAthlete(s,strike(STRIKE_CONTACT,{foot:'r'}),fc,{...LEN_T,detail:'mid',shadow:[K,.2]},{},{prev:strike(.46,{foot:'r'})});ball(s,a0[0],a0[1],15,82);sparkBurst(s,Y,a0[0],a0[1],40,{n:8,seed:88,g:1});}
    if(kind==='time'){drawAthlete(s,keeperSet(.2),fc,{...DEMO_K,detail:'mid',shadow:[K,.2]},{},{prev:keeperSet(.15)});
     const c=Pc([.8,1.5,0]),u=sm(t0c+.1,t0c+1.2,tt),arc:Pt[]=[];for(let k2=0;k2<=16;k2++){const an=-Math.PI/2+TAU*(1-u*.85)*k2/16;arc.push([c[0]+Math.cos(an)*44,c[1]+Math.sin(an)*44]);}
     s.fill(R,ribbon(arc,10,{seed:89,taper:0,wobble:.8}),.95);s.fill(K,ribbon([c,[c[0],c[1]-34]],6,{seed:90,taper:0}),.9);}
    s.restore();});
   s.fill(K,frames);}
  // the second shot goes in: a big tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(inAt[1]+.1,inAt[1]+.45,tt));
  if(tick>.02){const g=P3(st,X4,h.X,0,h.Z),hh=kAt(st,depthOf(X4,h.X,h.Z))*1.8,c:Pt=[g[0]+hh*.55,g[1]-hh*.95],S=hh*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.keepers+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'lenisio-futsal-signature',format:'futsal',title:'Lenísio’s quick finish',theme:'Shoot early in the box: futsal keepers have less time to react.',
 ageNote:'For players aged 7–12: the 2008 match and his two goals are real; the quick finish is shown as a demonstration. Practise it with a friend.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball fired off — a straight yellow streak shoots out of it and a red ring pops; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.5),sw=easeOut(u);
  if(u<1){s.fill(Y,ribbon([[x-r*.6,y],[x+r*(1+3*sw),y-r*.3*sw]],14*(1-u)+4,{seed,taper:.8,wobble:.6}),1);
   s.fill(R,ribbon(blob(x,y,r*(1.1+1.4*u),r*(1.1+1.4*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(x,y+r*.95,r,r*.2,seed+2,{n:16}),true),.32);
  ball(s,x+r*.25*sw*(1-u),y,r,seed,{rot:age*10*(1-u)});
 },
};
export default film;
