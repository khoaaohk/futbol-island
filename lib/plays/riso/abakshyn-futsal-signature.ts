/** Danyil Abakshyn — "the toe-poke after the turn": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Danyil (Danylo) Abakshyn (Даниїл / Данило Абакшин), born 22 Dec 1997, Ukraine's futsal forward (card bio, lib/town/playerBios.json:
 *  "Ukrainian futsal forward who won the Silver Boot at the 2024 World Cup, scoring a hat-trick as Ukraine beat France to take a historic
 *  bronze"; card country Ukraine in lib/town/playerAppearance.json; card role pivot). Sources agree: same player, same country.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "the toe-poke after the turn" — not one match. No written source we
 *  could reach describes a toe-poke goal of his, so the move itself is a separate, labelled demonstration. The real-match chapters show his
 *  best-documented big match — the 2024 FIFA Futsal World Cup MATCH FOR THIRD PLACE, Ukraine 7–1 France, 6 Oct 2024, Humo Arena, Tashkent —
 *  and ONE play of his that a written source describes: his first goal (29'20", making it 5–1). In his own words (Football 24 interview,
 *  11 Oct 2024): a moment before, keeper Oleksandr Sukhov made a save that stopped France making it 4–2; he "used Sashko's save", "waited a
 *  little so it was comfortable to strike", knew "how it would go when the ball came down", and hit the target; the interviewer notes all
 *  three of his goals that day came "in one style — each time from his own half". Then 29'39" (19 seconds later) and 32'50": a hat-trick,
 *  his 7th goal of the tournament and the Silver Boot. (No other futsal film uses this match — checked by grep; Mykytiuk's film uses the
 *  2024 quarter-final v Venezuela and Mouhoudine's the EURO 2026 France–Ukraine quarter-final.)
 *  1  LIVE (broadcast camera high in the main stand, real time): the bronze match in Tashkent, scoreboard 4–1. France attack Ukraine's goal
 *     (left); a French shot; Sukhov saves and the ball loops up out of the box; Abakshyn (No. 9) in his own half lets it come down and
 *     strikes it first time the length of the court into France's goal (right); the camera follows the ball; 5–1; a whip pan (a cut in
 *     time) to him celebrating in front of the main stand.
 *  2  WATCH AGAIN (TV slow-motion replay, low pitch-side camera): the ball dropping, the wait, the strike (the halfway line lights up behind
 *     the ball: "own half"); then a whip pan (a cut in time — goals two and three are NOT staged) to the team celebrating while the
 *     scoreboard ticks 6–1, 7–1; three balls stamp in for the hat-trick; the final whistle; a bronze medal.
 *  3  HOW HE DOES IT (a demonstration, real time, side-on from the main stand, the goal on the RIGHT; Abakshyn in a plain yellow training
 *     top, neutral paper-kit passer and defender, a blue-bib keeper — no match claimed): back to goal, the pass into his feet, he spins off
 *     the defender's shoulder and toe-pokes it at once, inside the far post, while the keeper is still shuffling across.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "In futsal, a quick toe-poke can beat the keeper before they are set."): the demo again
 *     from low behind; three cards (turn, toe-poke, keeper not set); a tick.
 * Sources (written; fetched with curl once and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2024 FIFA Futsal World Cup" (raw; wiki-2024-futsal-wc.txt): match for third place, 6 October 2024, 17:30, Humo Arena,
 *    Tashkent: Ukraine 7–1 France; Ukraine goals Cherniavskyi 10'20", Zvarych 21'06", Zhuk 26'55" 27'39", Abakshyn 29'20" 29'39" 32'50";
 *    France Saadaoui 22'10"; attendance 4,890; referee Daniel Rodríguez (Uruguay). So it was 4–1 before his first goal. Awards: Silver Shoe
 *    Danyil Abakshyn (7 goals). https://en.wikipedia.org/wiki/2024_FIFA_Futsal_World_Cup
 *  - Wikipedia, "2024 FIFA Futsal World Cup squads" (raw; wiki-2024-futsal-wc-squads.txt): Ukraine No. 9 Danyil Abakshyn, FW, born
 *    22 Dec 1997, HIT Kyiv.
 *  - Ukrainian Wikipedia, "Абакшин Даниіл Андрійович" (raw; ukwiki-abakshyn.txt): Ukrainian futsal player; bronze at the 2024 World Cup;
 *    hat-trick in the third-place match v France (7:1) earning the Silver Boot (7 goals in 7 games); top assister of the tournament.
 *  - Football 24 (Lyubomyr Kuzmyak, 11 Oct 2024), interview "Я набивав 100 разів…" (football24-abakshyn-interview.txt): "three goals in three
 *    minutes" v France, "each time from his own half"; the first came straight after a Sukhov save, he waited for the ball to come down and
 *    struck. https://football24.ua/…_n844951/
 *  - FIFA.com awards article (cached JSON; fifa-cxm-2024-futsal-awards-article.json): adidas Silver Boot Danyil Abakshyn (Ukraine).
 * CONFIRMED: the match, round, date, venue, 7–1, the 4–1 score before his first goal, his three goal minutes (two 19 s apart), No. 9,
 *  that goal one followed a Sukhov save and he let the ball come down before striking, that all three came from his own half, the Silver
 *  Boot, Ukraine's bronze. The narration only states these (plus the entry's signature, framed as "his trick").
 * INFERRED (not named in the narration): the French shot before the save (a chance France would have scored from, per the interview) and
 *  where it came from; the ball's loop and single bounce; his striking foot (right) and exact spot; that France's goal was empty because
 *  they were attacking with a flying goalkeeper (implied by three goals from his own half; the flying keeper is drawn in a red keeper's
 *  shirt); both kits (Ukraine yellow / blue / yellow, France all blue — not checked for that match), Sukhov's shirt, the court colour
 *  (blue), which end each team attacked, every other player's position, the celebration spot, the scoreboard's look, his hair (short,
 *  dark). No video was reviewed. Chapters 3–4 are a demonstration of the turn and toe-poke, not a recreation of any match play.
 * Technique (poses): back to goal, knees bent, the defender felt with the forearm; he receives with the sole, then spins off the
 *  defender's shoulder on the side he is not covering, dragging the ball round; without a backswing he stabs the ball with the toe (ankle
 *  locked, toe forward) — the shot comes a beat earlier than a laced drive, before the keeper has planted his feet.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strike, the turn and the poke). Chapters 1–2 are choreographed straight on the stage floor (X along the court,
 *  Z away from the main stand); chapters 3–4 in the LOCAL frame of the demo goal (u = metres out from the goal line, v = across) mapped by a
 *  proper rotation (no mirror), so the right foot stays the right foot. Stages are LEFT-handed, so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated until the lead voices it; `authored()` maps each chapter's recorded clock through the cue anchors
 *  back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Ukraine, the training top, lights), red (France's tricolour, the keeper shirts, rings), blue (the court, France, Ukraine's
 *  shorts), navy (key line, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet
 *  (card window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,lerp,clamp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,runCycle,runCadence,dribble,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: World Cup 2024',text:'The 2024 Futsal World Cup, the match for bronze, in Tashkent. Ukraine lead France four one. Keeper Sukhov saves, and Danyil Abakshyn strikes from his own half. Goal! Five one!',tail:2.4,
  cues:['The 2024','match for bronze','in Tashkent','Ukraine lead','four one','Keeper','saves','Danyil','strikes','own half','Goal','Five one'],
  heads:{'The 2024':'Bronze match 2024','Danyil':'No. 9','Goal':'29′20″','Five one':'5–1'}},
 {label:'Watch again',text:'Watch again. He waits for the ball to drop, then strikes. Nineteen seconds later he scores again, then again: a hat-trick! Ukraine win seven one!',tail:2.4,
  cues:['Watch again','waits','ball to drop','strikes','Nineteen','scores again','then again','a hat','Ukraine win','seven one'],
  heads:{'Watch again':'Slow motion','Nineteen':'6–1','then again':'7–1','a hat':'Hat-trick','seven one':'Bronze'}},
 {label:'How he does it',text:'This is his trick: back to goal, he turns and pokes it with his toe, before the keeper is set!',tail:2.4,
  cues:['This is','his trick','back to goal','turns','pokes','with his toe','before the keeper','set'],heads:{'This is':'The toe-poke','set':''}},
 {label:'Your turn',text:'Your turn: a quick toe-poke can beat the keeper before they are set!',tail:2.8,
  cues:['Your turn','a quick','can beat','before they','are set'],heads:{'Your turn':'Quick feet','are set':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/abakshyn-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/abakshyn-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/abakshyn-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('abakshyn: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue in chapter i whose words are w (exact match first, else the first that starts with w; throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words===w)??AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('abakshyn: no cue '+w);return c.at;};
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

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
/** a yellow dashed line cased in navy */
function cased(s:Sheet,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){dashed(s,K,pts,width*1.8,seed,{...o,ko:false,cov:.9});dashed(s,Y,pts,width,seed,{...o});}
function casedHead(s:Sheet,pts:Pt[],size:number,seed:number){arrowHead(s,K,pts,size*1.35,seed,.9);arrowHead(s,Y,pts,size,seed);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function redLane(s:Sheet,pts:Pt[],width:number,seed:number,o:{progress?:number;cov?:number}={}){dashed(s,R,pts,width,seed,{dash:width*3.6,progress:o.progress,cov:o.cov??1});}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- frames: the stage floor itself (chapters 1–2) and a goal's LOCAL frame (u out from its line, v across) ----------------
type Frame={ox:number;oz:number;rot:number};
const toStage=(fr:Frame,u:number,v:number):[number,number]=>{const c=Math.cos(fr.rot),sn=Math.sin(fr.rot);return[fr.ox+u*c-v*sn,fr.oz+u*sn+v*c];};
/** ID: local = stage (X, Z). FU: Ukraine's goal on the LEFT (X = −20). FF: France's goal on the RIGHT (X = +20) — also the demo goal. */
const ID:Frame={ox:0,oz:0,rot:0},FU:Frame={ox:-20,oz:10,rot:0},FF:Frame={ox:20,oz:10,rot:Math.PI};
type Loc={pose:Pose;yaw:number;u:number;v:number};
type LGen=(t:number)=>Loc;

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
/** his skin: a light screen (card appearance: light skin) */
const SKIN:InkFill[]=[[Y,.8],[R,.26]];
const BUILD={height:1.8,bulk:1.02};
/** Abakshyn for Ukraine (kit INFERRED): yellow shirt, blue shorts, yellow socks; No. 9 (CONFIRMED) in blue; short dark hair (inferred) */
const ABK:AthleteStyle={shirt:Y,shorts:B,socks:Y,boots:K,skin:SKIN,hair:K,line:K,trim:B,hairStyle:'short',number:9,numberInk:B,build:BUILD,seed:9};
/** Abakshyn in the demonstration and lesson: a plain yellow training top and navy shorts (no national kit, so no match is implied) */
const ABK_T:AthleteStyle={...ABK,shirt:[Y,.95],shorts:K,socks:K,trim:K,boots:'paper',number:null};
/** Ukraine team-mates (kit inferred) */
const UKR=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:Y,boots:K,skin:[[[Y,.8],[R,.24]],[[Y,.74],[R,.28]],[[Y,.78],[R,.22]]][n%3] as InkFill[],hair:K,line:K,trim:B,hairStyle:(['balding','curly','short'] as const)[n%3],build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Sukhov, Ukraine's keeper (shirt inferred): red long sleeves */
const UKR_GK:AthleteStyle={shirt:[R,.8],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.86},seed:62};
/** France (kit inferred): all blue, red trim */
const FRA=(n:number):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:'paper',skin:[[[Y,.74],[R,.3]],[[Y,.56],[R,.34],[K,.14]],[[Y,.42],[R,.36],[K,.24]]][n%3] as InkFill[],hair:K,line:K,trim:R,hairStyle:(['short','bald','curly'] as const)[n%3],build:{height:1.74+hash(n,3)*.12},seed:40+n});
/** France's flying goalkeeper up the court (INFERRED): a red keeper's shirt over blue shorts */
const FRA_FLY:AthleteStyle={shirt:R,shorts:B,socks:B,boots:'paper',skin:[[Y,.6],[R,.32],[K,.1]],hair:K,line:K,trim:K,sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
/** the demonstration defender, passer and keeper: neutral training kit (no team is claimed in chapters 3–4) */
const DEMO_P:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.76},seed:77};
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.5],[R,.34],[K,.12]],hair:K,line:K,trim:R,hairStyle:'bald',build:{height:1.84,bulk:1.08},seed:79};
const DEMO_K:AthleteStyle={shirt:[B,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-1/12),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc){const sk=solve(l.pose,BUILD,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}
/** where to stand (local) so that, in `pose` facing `yaw`, the ball sits just ahead of the chosen toe at `ball` */
function toePlace(pose:Pose,yaw:number,ball:[number,number],foot:'r'|'l'='r'):[number,number]{
 const sk=solve(pose,BUILD,{yaw}),toe=foot==='r'?sk.rToe:sk.lToe,an=foot==='r'?sk.rAn:sk.lAn,d=[toe[0]-an[0],-(toe[2]-an[2])],l=Math.hypot(d[0],d[1])||1;
 return[ball[0]-toe[0]-d[0]/l*.09,ball[1]+toe[2]-d[1]/l*.09];
}
function lerpAng(a:number,b:number,u:number){let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;}
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** heads down, hands on hips */
const DOWN=posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:30,rShA:30,lShF:-20,rShF:-20,lElb:110,rElb:110});
/** watching a ball high in the air: chin up */
const LOOKUP=(b:number)=>posed({lHipF:14,rHipF:18,lKnee:22+6*b,rKnee:26+6*b,lHipA:10,rHipA:12,lean:2,neckP:-38,lShA:24,rShA:30,lElb:40,rElb:34,air:.01*b});

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,rectPath(x-r*.1,y-r*1.2,r*1.4,r*2.4),.18);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
type BallS={u:number;y:number;v:number;moving:boolean;spin:number};
/** a ball drawn on stage st through frame fr, with its floor shadow */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:BallS,seed:number,min=9,dir=0){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15*(1+b.y*.3),r*.3,seed+5,.45/(1+b.y*.6));ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.moving?.25:0,dir});return{p,r};
}
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
function jointPt(st:Stage,fr:Frame,l:Loc,name:'head'|'face'|'pelvis'|'rToe'|'chest'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];

// ---------------- the arena: blue court (inferred), stands with Ukraine and France flags, two futsal goals ----------------
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,flags=true){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),paper=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);if(hash(i,8)<.22)continue;const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.22)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.42)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: Ukraine (blue over yellow) and France (blue | white | red, vertical)
 for(let f=0;f<(flags?6:0);f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  const col=(u0:number,u1:number)=>polyPath([pole(u0,0),pole(u1,0),pole(u1,1),pole(u0,1)],true);
  if(f%3===2){blues.addPath(col(0,1/3));paper.addPath(col(1/3,2/3));reds.addPath(col(2/3,1));}
  else{blues.addPath(band(0,.5));yel.addPath(band(.5,1));}}
 s.fill(Y,heads,.6);s.knockout(paper);s.knockout(yel);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh; posts red/paper bands; ripple = the back of the net bulging */
function goalNet(s:Sheet,st:Stage,fr:Frame,ripple=0){
 const H=2,Db=.95+ripple*.35,Dt=.55+ripple*.15,P=(u:number,Yh:number,v:number):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,Yh,Z);};
 const back=(v:number,Yh:number):Pt=>P(-lerp(Db,Dt,Yh/H),Yh,v);
 const pts=[P(0,0,-1.5),P(0,H,-1.5),P(0,H,1.5),P(0,0,1.5),back(1.5,0),back(1.5,H),back(-1.5,H),back(-1.5,0)];
 const hull=polyPath(convex(pts),true);s.knockout(hull,.6);s.fill(K,hull,.2);
 const mesh=new Path2D();for(let v=-1.5;v<=1.5+1e-6;v+=.3){const a=back(v,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(v,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(-1.5,Yh);mesh.moveTo(a[0],a[1]);for(let v=-1.2;v<=1.5+1e-6;v+=.3){const b=back(v,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const v of[-1.5,1.5])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=P(0,Yh,v),b=back(v,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 const Zc=toStage(fr,0,0)[1];s.stroke(K,mesh,Math.max(1.6,kAt(st,Zc)*.018),.6);
}
function goalPosts(s:Sheet,st:Stage,fr:Frame){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),P=(u:number,Yh:number,v:number):[Pt,number]=>{const[X,Z]=toStage(fr,u,v);return[proj(st,X,Yh,Z),kAt(st,Z)];};
 const Zc=toStage(fr,0,0)[1],lw=Math.max(2,kAt(st,Zc)*.012);
 const bar=(a:V3,b:V3,n:number)=>{const seg=(u0:number,u1:number):Pt[]=>{const[p0,k0]=P(lerp(a[0],b[0],u0),lerp(a[1],b[1],u0),lerp(a[2],b[2],u0)),[p1,k1]=P(lerp(a[0],b[0],u1),lerp(a[1],b[1],u1),lerp(a[2],b[2],u1));
   const dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;return[[p0[0]+nx*w*k0,p0[1]+ny*w*k0],[p1[0]+nx*w*k1,p1[1]+ny*w*k1],[p1[0]-nx*w*k1,p1[1]-ny*w*k1],[p0[0]-nx*w*k0,p0[1]-ny*w*k0]];};
  const q=seg(-.02,1.02);frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<n;k+=2)bands.addPath(polyPath(seg(k/n,(k+1)/n),true));};
 bar([0,0,-1.5],[0,H,-1.5],8);bar([0,0,1.5],[0,H,1.5],8);bar([0,H,-1.5],[0,H,1.5],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
function convex(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
/** one end's painted lines in a goal frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots, touchlines to halfway */
function courtLines(st:Stage,fr:Frame,lines:Path2D){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));
 for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[0,v],[20,v]]),.05),true));
}
const BOARDS=21;
type CourtOpt={cheer?:number;flash?:number;keeperU?:()=>void;keeperF?:()=>void;rippleF?:number;goals?:'both'|'F';flags?:boolean};
/** the whole court side-on from the main stand: halfway line at X = 0, near touchline Z = 0, far boards Z = 21 */
function court(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,goals='both'}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.34);
 const run=new Path2D(),a0=proj(st,st.cx-40,0,20.4),a1=proj(st,st.cx+40,0,BOARDS);run.rect(a0[0],a1[1],a1[0]-a0[0],a0[1]-a1[1]);
 const n0=proj(st,st.cx-40,0,Math.max(st.cz+.6,-1)),n1=proj(st,st.cx+40,0,-.4);if(n1[1]<n0[1])run.rect(n0[0],n1[1],n1[0]-n0[0],n0[1]-n1[1]);s.fill(K,run,.28);
 const mot=new Path2D();for(let k=0;k<40;k++){const x=st.cx-24+hash(k,11)*48,z=Math.max(st.cz+1,0)+hash(k,12)*20,p=proj(st,x,0,z),r=kAt(st,z)*(.6+hash(k,13)*1.2);mot.addPath(polyPath(blob(p[0],p[1],r*2.2,r*.5,300+k,{amp:.2,n:10}),true));}s.fill(B,mot,.12);
 const lines=new Path2D();courtLines(st,FF,lines);if(goals==='both')courtLines(st,FU,lines);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,20]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,o.flags??true);
 if(goals==='both'&&st.cx<6){goalNet(s,st,FU);o.keeperU?.();goalPosts(s,st,FU);}
 if(st.cx>-6){goalNet(s,st,FF,o.rippleF??0);o.keeperF?.();goalPosts(s,st,FF);}
}
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'1':[2,5],'4':[1,2,3,5],'5':[0,1,3,5,6],'6':[0,1,3,4,5,6],'7':[0,2,5]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the arena scoreboard: Ukraine left (blue-over-yellow tab), France right (blue | paper | red tab); ring round both scores; flash = the new digit */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,ring=0,flash=0,big=1){
 const kw=kAt(st,BOARDS)*big,wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kAt(st,BOARDS)-.55*kAt(st,BOARDS)*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;
 const tab=(ink:string,x:number,y0:number,w:number,hh:number)=>{const p=new Path2D();p.rect(x,y0,w,hh);s.fill(ink,p);};
 tab(B,cx-W*.38,top-H+H*.05,W*.16,H*.045);tab(Y,cx-W*.38,top-H+H*.095,W*.16,H*.045);
 tab(B,cx+W*.22,top-H+H*.05,W*.053,H*.09);tab(R,cx+W*.326,top-H+H*.05,W*.053,H*.09);
 digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);s.knockout(lit);s.fill(Y,lit);
 if(flash>.02){const p=new Path2D();digit(p,score[0],cx-W*.3,y,h);s.fill(R,p,flash*.8);}
 if(ring>.02){const c:Pt=[cx,y+h*.5],rr=W*.55*ring;s.fill(Y,ribbon(blob(c[0],c[1],rr,h*.85*ring,151,{n:24}),Math.max(5,h*.09),{seed:152,close:true,wobble:1.2}),1);}
 return{cx,W,H,top};
}
/** a bronze medal stamp (yellow + red screens make bronze on the paper) on a blue-and-yellow ribbon, with a big 3 */
function medal(s:Sheet,x:number,y:number,r:number,g:number){
 if(g<=.02)return;const R0=r*g,rib1=polyPath([[x-R0*.9,y-R0*2.6],[x-R0*.2,y-R0*2.6],[x+R0*.25,y-R0*.8],[x-R0*.45,y-R0*.8]],true),rib2=polyPath([[x+R0*.9,y-R0*2.6],[x+R0*.2,y-R0*2.6],[x-R0*.25,y-R0*.8],[x+R0*.45,y-R0*.8]],true);
 s.knockout(rib1);s.knockout(rib2);s.fill(B,rib1);s.fill(Y,rib2);
 const disc=polyPath(blob(x,y,R0,R0,171,{amp:.02,n:30}),true);s.knockout(disc);s.fill(Y,disc,.85);s.fill(R,disc,.5);s.fill(K,disc,.12);
 s.fill(K,ribbon(blob(x,y,R0,R0,171,{amp:.02,n:30}),Math.max(4,R0*.08),{seed:172,close:true,wobble:.6}),.9);
 const three=new Path2D(),h=R0*1.05;const SEG3=[0,2,3,5,6],w=h*.55,t=h*.14,x0=x-w/2,y0=y-h/2,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];
 for(const k of SEG3){const[a,b,c,d]=segs[k];three.rect(x0+a,y0+b,c,d);}s.knockout(three);s.fill(K,three,.85);
}
/** the whip pans: yellow speed lines sweep across the frame (cuts in time) */
function whip(s:Sheet,st:Stage,camX:number,Tc:number,a0:number,a1:number){if(Tc<a0||Tc>=a1)return;const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,camX,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}

// ================= chapter 1 — LIVE: the bronze match, 4–1 → the save → the drop → the strike from his own half → 5–1 =================
// Everything on the stage floor (frame ID): Ukraine's goal LEFT (X = −20), France's goal RIGHT (X = +20).
const C1={y24:A(0,'The 2024'),bronze:A(0,'match for bronze'),tash:A(0,'in Tashkent'),lead:A(0,'Ukraine lead'),fo:A(0,'four one'),keeper:A(0,'Keeper'),saves:A(0,'saves'),dan:A(0,'Danyil'),strikes:A(0,'strikes'),half:A(0,'own half'),goal:A(0,'Goal'),five:A(0,'Five one'),end:AUTH[0].seconds};
const tSave=C1.saves+.05,tShot=tSave-.42,tStrike=C1.strikes+.1,tLand=tStrike-.54,tGoal=Math.max(C1.goal-.05,tStrike+1.3),tPass=C1.lead+.3,tRecv=tPass+.7;
const W0=C1.five-.14,W1=W0+.26,WM=(W0+W1)/2;
/** Sukhov's set spot and the dive (to his LEFT, toward the far post) that meets the shot */
const GK0:[number,number]=[-19.35,10.25],YAW_GK=.45,DIVE_AT=.42;
const SVP:[number,number,number]=(()=>{const sk=solve(keeperDive(DIVE_AT,{side:'l',height:.35}),{height:1.86},{yaw:YAW_GK}),h=sk.lHa;return[GK0[0]+h[0],h[1],GK0[1]-h[2]];})();
/** the shooter (France, from the right of Ukraine's box), the ball at his right toe at contact */
const SB0:[number,number]=[-13.2,13.5];
const YAW_SH=Math.atan2(SVP[2]-SB0[1],SVP[0]-SB0[0]);
const SH_P=toePlace(strike(STRIKE_CONTACT,{foot:'r',power:.9}),YAW_SH,SB0);
/** the French passer out on the near side */
const PB0:[number,number]=[-9.6,6.7];
const YAW_PA=Math.atan2(SB0[1]-PB0[1],SB0[0]-PB0[0]);
const PA_P=toePlace(strike(STRIKE_CONTACT,{foot:'r',power:.45}),YAW_PA,PB0);
/** Abakshyn's strike: the ball at SP (after one bounce), struck first time toward France's empty goal */
const SP:[number,number]=[-7.3,12.3],GL:[number,number,number]=[20,10.8,.5],NET:[number,number,number]=[20.7,10.85,.35];
const YAW_S=Math.atan2(GL[1]-SP[1],GL[0]-SP[0]);
const AB_S=toePlace(strike(STRIKE_CONTACT,{foot:'r',power:.95}),YAW_S,SP);
const L1:[number,number]=[SP[0]-.45,SP[1]+.04];
const AB0:[number,number]=[-5.6,15.2];
/** where he celebrates (INFERRED): in front of the main stand */
const CEL:[number,number]=[-3.2,3.4];
const strikeS=(t:number,c:number)=>key(t,[[c-.6,.1],[c,STRIKE_CONTACT],[c+.5,.82],[c+1,1]],linear);
function ball1(T:number):BallS{
 if(T<tPass)return{u:PB0[0],y:BALL_R,v:PB0[1],moving:false,spin:0};
 if(T<tRecv){const p=sm(tPass,tRecv,T,x=>x*(1.2-.2*x));return{u:lerp(PB0[0],SB0[0],p),y:BALL_R,v:lerp(PB0[1],SB0[1],p),moving:true,spin:p*10};}
 if(T<tShot)return{u:SB0[0],y:BALL_R,v:SB0[1],moving:false,spin:10};
 if(T<tSave){const p=sm(tShot,tSave,T,linear);return{u:lerp(SB0[0],SVP[0],p),y:lerp(BALL_R,SVP[1],p)+.25*4*p*(1-p),v:lerp(SB0[1],SVP[2],p),moving:true,spin:10+p*8};}
 if(T<tLand){const D=tLand-tSave,f=(T-tSave)/D,hp=clamp(9.8*D*D/8,1.4,4.2);return{u:lerp(SVP[0],L1[0],f),y:lerp(SVP[1],BALL_R,f)+4*hp*f*(1-f),v:lerp(SVP[2],L1[1],f),moving:true,spin:18+f*6};}
 if(T<tStrike){const f=(T-tLand)/.6;return{u:lerp(L1[0],SP[0],f/.9),y:BALL_R+1.6*f*(1-f),v:lerp(L1[1],SP[1],f/.9),moving:false,spin:24+f*2};}
 if(T<tGoal){const p=sm(tStrike,tGoal,T,x=>x*(1.25-.25*x));return{u:lerp(SP[0],GL[0],p),y:lerp(.25,GL[2],p)+.9*4*p*(1-p),v:lerp(SP[1],GL[1],p),moving:true,spin:30+p*30};}
 const q=sm(tGoal,tGoal+.2,T,easeOut),d=sm(tGoal+.2,tGoal+.6,T,easeOut);return{u:lerp(GL[0],NET[0],q),y:lerp(lerp(GL[2],NET[2],q),BALL_R,d),v:lerp(GL[1],NET[1],q),moving:T<tGoal+.3,spin:60};
}
/** Abakshyn, chapter 1: up by halfway → drifts under the loop → waits, chin up → strikes first time (right foot) → celebrates */
const abk1:LGen=T=>{
 const b=Math.sin(T*5)*.5+.5;
 const mv=sm(tShot-.3,tLand-.35,T,easeIO),u=lerp(AB0[0],AB_S[0],mv),v=lerp(AB0[1],AB_S[1],mv);
 let pose=idle(T,.2);
 const run=Math.sin(Math.PI*mv);if(run>.02)pose=blendPose(pose,runCycle(T*runCadence(.5),{speed:.5}),Math.min(1,run*1.6));
 const look=sm(tSave,tSave+.25,T)*(1-sm(tLand-.4,tLand-.1,T));if(look>0)pose=blendPose(pose,LOOKUP(b),look);
 const k=sm(tStrike-.62,tStrike-.5,T,easeIO);if(k>0)pose=blendPose(pose,strike(strikeS(T,tStrike),{foot:'r',power:.95}),k*(1-sm(tStrike+.9,tStrike+1.15,T,easeIO)));
 let yaw=Math.atan2(ball1(T).v-v,ball1(T).u-u);yaw=lerpAng(yaw,YAW_S,sm(tLand-.5,tStrike-.4,T,easeIO));
 const go=sm(tStrike+.9,tStrike+1.25,T,easeIO);
 if(go>0){const r=sm(tStrike+.9,tGoal+1.4,T,easeOut),cu=lerp(AB_S[0],CEL[0],r),cv=lerp(AB_S[1],CEL[1],r);
  pose=blendPose(pose,r<.97?celebrate((T-tStrike)*1.3,{kind:'run'}):celebrate((T-tStrike)*1.1,{kind:'arms'}),go);
  if(T>=WM)return{pose:celebrate((T-WM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2+.25*Math.sin((T-WM)*1.4),u:CEL[0],v:CEL[1]};
  return{pose,yaw:lerpAng(YAW_S,Math.atan2(CEL[1]-AB_S[1],CEL[0]-AB_S[0]),go),u:cu,v:cv};}
 return{pose,yaw,u,v};
};
/** Sukhov: set, the dive to his left that makes the save, down, then up to celebrate */
const gk1:LGen=T=>{
 const d=key(T,[[tShot-.12,0],[tSave,DIVE_AT],[tSave+.6,.85],[tSave+1.2,1]],linear);
 let pose=d<=0?keeperSet(T*1.3):keeperDive(d,{side:'l',height:.35});
 const up=sm(tGoal,tGoal+.6,T,easeIO);if(up>0)pose=blendPose(pose,celebrate((T-tGoal)*1.1,{kind:'arms'}),up);
 return{pose,yaw:YAW_GK,u:GK0[0],v:GK0[1]};
};
const lookAt=(u:number,v:number,T:number)=>{const b=ball1(T);return Math.atan2(b.v-v,b.u-u);};
/** the French: passer, shooter, a runner at the far post, a player on the far side, and the flying keeper up the court */
const FR_POS:[number,number][]=[[PA_P[0],PA_P[1]],[SH_P[0],SH_P[1]],[-15.4,6.9],[-11.6,17.4],[-2.9,7.1]];
const fra1=(i:number):LGen=>T=>{
 const[u0,v0]=FR_POS[i];let pose=idle(T,i*.37+.1),u=u0,v=v0;
 if(i===0){const k=sm(tPass-.62,tPass-.5,T);if(k>0)pose=blendPose(pose,strike(strikeS(T,tPass),{foot:'r',power:.45}),k*(1-sm(tPass+.9,tPass+1.2,T)));
  if(T<tPass+.5)return{pose,yaw:YAW_PA,u,v};
  // then he follows the play in toward the box
  const f=sm(tPass+.5,tSave+.4,T,easeIO);if(f>0){u=lerp(u0,-13.6,f);v=lerp(v0,8.8,f);pose=blendPose(pose,runCycle(T*runCadence(.6),{speed:.6}),Math.sin(Math.PI*f));}}
 if(i===1){const k=sm(tShot-.62,tShot-.5,T);if(k>0)pose=blendPose(pose,strike(strikeS(T,tShot),{foot:'r',power:.9}),k*(1-sm(tShot+.9,tShot+1.2,T)));
  if(T<tShot+.5)return{pose,yaw:T<tRecv?YAW_PA+Math.PI:YAW_SH,u,v};}
 // the flying keeper (and the others, a beat later) turn and chase back as the strike goes long
 const chase=sm(tStrike-.2+(i===4?0:.25),tGoal+.4,T,easeIO);
 if(chase>0){const tx=[2,1,-2,4,9][i],tz=[9,11.5,9.5,13,10.2][i],r=sm(tStrike-.2,tGoal+.6,T,x=>x)*(i===4?1:.45);u=lerp(u,tx,r);v=lerp(v,tz,r);
  pose=blendPose(pose,runCycle(T*runCadence(.9)+i*.3,{speed:.9}),Math.min(1,chase*2)*(1-sm(tGoal+.2,tGoal+.6,T)));}
 const down=sm(tGoal+.2,tGoal+.6,T);if(down>0)pose=blendPose(pose,DOWN,down);
 const yaw=chase>0&&down<1?Math.atan2(0,1):lookAt(u,v,T);
 return{pose,yaw,u,v};
};
const UK_POS:[number,number][]=[[-15.0,12.2],[-17.0,8.6],[-12.2,8.4]];
const ukr1=(i:number):LGen=>T=>{
 const[u0,v0]=UK_POS[i];let pose=idle(T,i*.29+.5),u=u0,v=v0,yaw=lookAt(u0,v0,T);
 const go=sm(tGoal-.1,tGoal+.3,T);
 if(go>0){const r=sm(tGoal-.1,tGoal+2.2,T,easeOut),tu=CEL[0]+[-1,1.1,.2][i],tv=CEL[1]+[1,.9,1.8][i];u=lerp(u0,tu,r);v=lerp(v0,tv,r);
  pose=blendPose(pose,r<.95?celebrate(T*1.2+i*.3,{kind:'run'}):celebrate(T*1.1+i*.4,{kind:'arms'}),go);yaw=Math.atan2(tv-v0,tu-u0);}
 if(T>=WM){const tu=CEL[0]+[-1.1,1.2,.3][i],tv=CEL[1]+[1,.8,1.7][i];return{pose:celebrate((T-WM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.3,.1][i],u:tu,v:tv};}
 return{pose,yaw,u,v};
};
const ST1=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function liveCam(T:number){
 const base=key(T,mono([[0,-11.5],[C1.lead,-12.2],[C1.keeper,-16],[tSave+.1,-15.8],[C1.dan,-10.8],[tStrike-.2,-8.2]]),easeInOutSine);
 const bx=ball1(T).u,w=sm(tStrike-.1,tStrike+.8,T)*(T<WM?1:0);
 let x=lerp(base,clamp(bx-2.2,-9,15.4),w);if(T>=WM)x=key(T,mono([[WM,-3.6],[C1.end,-3.2]]),easeInOutSine);
 const zoom=T<WM?key(T,mono([[0,.62],[C1.fo,.66],[C1.keeper,.8],[tSave+.4,.82],[C1.dan,.84],[tStrike,.8],[tGoal,.72],[W0,.74]]),easeInOutSine):key(T,mono([[WM,.9],[C1.end,.96]]),easeInOutSine);
 const y=T<WM?key(T,mono([[0,1060],[C1.keeper,1040],[tSave+.6,960],[tStrike,1030],[tGoal,1040]]),easeInOutSine):key(T,mono([[WM,1380],[C1.end,1360]]),easeInOutSine);
 return{x,zoom,y};
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=ST1(c.x),scored=T>=tGoal+.1;
 cam(s,0,c.y,c.zoom);
 court(s,st,T,{cheer:scored?1:.15+.2*sm(tStrike,tGoal,T),flash:pulse(T,tGoal+.1,1.2)+.5*pulse(T,WM,1),rippleF:pulse(T,tGoal+.05,.5),
  keeperU:()=>{athlete(s,st,ID,gk1,T,UKR_GK,{detail:'low'});}});
 const sb=scoreboard(s,st,c.x,scored?'5-1':'4-1',easeOutBack(sm(C1.fo,C1.fo+.4,T))*(1-sm(C1.keeper-.2,C1.keeper+.1,T))+(T>=WM?easeOutBack(sm(C1.five,C1.five+.4,T)):0),pulse(T,tGoal+.1,.8));
 // "match for bronze": the medal that is at stake stamps in beside the scoreboard, then steps back
 medal(s,sb.cx-sb.W*.95,sb.top-sb.H*.5,sb.H*.5,easeOutBack(sm(C1.bronze,C1.bronze+.4,T))*(1-sm(C1.lead,C1.lead+.3,T)));
 const items:Item[]=[];
 const add=(g:LGen,st2:AthleteStyle,detail:'low'|'mid',smear=0,dz=0)=>items.push({z:g(T).v+dz,draw:()=>athlete(s,st,ID,g,T,st2,{detail,smear})});
 FR_POS.forEach((_,i)=>add(fra1(i),i===4?FRA_FLY:FRA(i),'low'));
 UK_POS.forEach((_,i)=>add(ukr1(i),UKR(i),'low'));
 const strikeFast=T>tStrike-.2&&T<tStrike+.15?.1:0;
 add(abk1,ABK,'mid',strikeFast,-.02);
 const b=ball1(T);
 items.push({z:b.v-.03,draw:()=>{const p=drawBallL(s,st,ID,b,18,8);if(b.moving&&T>tStrike&&T<tGoal)speedLines(s,Y,p.p[0]-p.r*3,p.p[1],Math.PI,{n:5,seed:19,len:220,spread:p.r*2.2,width:7,cov:.8});}});
 // "Keeper": a red dashed ring under Sukhov; "Danyil": a yellow ring under Abakshyn
 const kr=easeOutBack(sm(C1.keeper,C1.keeper+.35,T))*(1-sm(tSave+.3,tSave+.6,T));
 if(kr>.02)items.push({z:GK0[1]+1,draw:()=>{floorDashRing(s,st,K,GK0[0]+.3,GK0[1],1.1,20,50,kr);floorDashRing(s,st,R,GK0[0]+.3,GK0[1],1.1,12,51,kr);}});
 const dr=easeOutBack(sm(C1.dan,C1.dan+.35,T))*(1-sm(tStrike-.3,tStrike,T));
 if(dr>.02){const l=abk1(T);items.push({z:l.v+1,draw:()=>{floorDashRing(s,st,K,l.u,l.v,1.1,20,52,dr);floorDashRing(s,st,Y,l.u,l.v,1.1,12,53,dr);}});}
 // "own half": the halfway line lights up (cased yellow) — the strike starts on his side of it
 const hl=sm(C1.half-.1,C1.half+.35,T,easeOut)*(1-sm(tGoal+.3,tGoal+.7,T));
 if(hl>.02)items.push({z:20.5,draw:()=>{cased(s,[proj(st,0,0,0),proj(st,0,0,10),proj(st,0,0,20)],13,54,{dash:40,progress:hl});
  const b0=ball1(Math.min(T,tGoal)),tr:Pt[]=[];for(let k=0;k<=12;k++){const u=lerp(SP[0],b0.u,k/12),v=lerp(SP[1],b0.v,k/12);tr.push(proj(st,u,0,v));}cased(s,tr,10,59,{dash:30,progress:hl});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "saves": a spark on Sukhov's glove; "strikes": a spark at the boot; "Goal": a spark in the net
 if(T>=tSave&&T<tSave+.5){const p=proj(st,SVP[0],SVP[1],SVP[2]);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:55,g:easeOut(sm(tSave,tSave+.3,T))});}
 if(T>=tStrike&&T<tStrike+.5){const p=proj(st,SP[0],.25,SP[1]);sparkBurst(s,Y,p[0],p[1],130,{n:11,seed:56,g:easeOut(sm(tStrike,tStrike+.3,T))});}
 if(T>=tGoal&&T<tGoal+.7&&T<W0){const p=proj(st,NET[0],.8,NET[1]);sparkBurst(s,Y,p[0],p[1],190,{n:14,seed:57,g:easeOut(sm(tGoal,tGoal+.4,T))});sparkBurst(s,R,p[0],p[1],120,{n:9,seed:58,g:easeOut(sm(tGoal+.05,tGoal+.45,T))});}
 whip(s,st,c.x,Tc,W0,W1);
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(ST1(liveCam(tc).x),ID,abk1(tt),.14));},still:C1.dan+.3};

// ================= chapter 2 — WATCH AGAIN: slow-motion from a low pitch-side camera; then (cut) the hat-trick on the scoreboard =================
const C2={watch:A(1,'Watch again'),waits:A(1,'waits'),drop:A(1,'ball to drop'),strikes:A(1,'strikes'),n19:A(1,'Nineteen'),again:A(1,'scores again'),then:A(1,'then again'),hat:A(1,'a hat'),win:A(1,'Ukraine win'),seven:A(1,'seven one'),end:AUTH[1].seconds};
const W2=C2.n19-.14,W3=W2+.26,WM2=(W2+W3)/2;
/** replay clock: chapter time → chapter 1 time (about half speed through the drop and the strike) */
const seq2=(t:number)=>key(t,mono([[0,tSave+.35],[C2.waits,tSave+.75],[C2.drop,tLand-.12],[C2.strikes,tStrike],[W2,tStrike+.62]]),linear);
const ST2=(cx:number):Stage=>({F:7000,eye:3.4,cx,cz:-13});
function replayCamX(q:number){const b=ball1(q).u,a=abk1(q).u;return q<tStrike?lerp(lerp(a,b,.3),a+.6,sm(tLand-.4,tStrike-.1,q)):a+.6+(b-SP[0])*.3;}
/** the celebration knot after the cut (Ukraine players round Abakshyn by the halfway line) */
const KN:[number,number]=[1.2,8.2];
const knotGen=(i:number):LGen=>T=>{const o=[[0,0],[-1,.8],[1.1,.7],[.2,1.6]][i];return{pose:celebrate(T*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[0,.4,-.4,.1][i],u:KN[0]+o[0],v:KN[1]+o[1]};};
const downGen=(i:number):LGen=>T=>({pose:blendPose(DOWN,idle(T,i),.2),yaw:[2.4,-2.6,3,-2.2][i],u:[8.2,10.4,6.6,-6.2][i],v:[9.6,14.6,15.6,12.4][i]});
function replay(s:Sheet,tt:number,tc:number){
 if(tc<WM2){
  const q=seq2(tt),qc=seq2(tc),st=ST2(replayCamX(qc)),hit=pulse(q,tStrike,.4);
  const zoom=key(tc,mono([[0,.86],[C2.waits,.9],[C2.drop,1],[C2.strikes,.96],[W2,.84]]),easeInOutSine),y=key(tc,mono([[0,560],[C2.waits,600],[C2.drop,700],[C2.strikes,720],[W2,720]]),easeInOutSine);
  cam(s,6*hit*Math.sin(tc*90),y+4*hit*Math.cos(tc*77),zoom);
  court(s,st,q,{cheer:.2+.6*sm(tStrike,tStrike+.6,q),flash:pulse(q,tStrike,1),keeperU:()=>{athlete(s,st,ID,gk1,q,UKR_GK,{detail:'low'});}});
  const items:Item[]=[];
  const add=(g:LGen,sty:AthleteStyle,detail:'low'|'mid'|'high',smear=0,dz=0)=>items.push({z:g(q).v+dz,draw:()=>athlete(s,st,ID,g,q,sty,{detail,smear})});
  FR_POS.forEach((_,i)=>add(fra1(i),i===4?FRA_FLY:FRA(i),'low'));UK_POS.forEach((_,i)=>add(ukr1(i),UKR(i),'low'));
  add(abk1,ABK,'high',q>tStrike-.3&&q<tStrike+.2?.2:0,-.02);
  const b=ball1(q);items.push({z:b.v-.03,draw:()=>{drawBallL(s,st,ID,b,218,10);}});
  // "waits": a yellow dashed arc of the ball's fall to the spot where it lands (a ring on the floor)
  const wa=sm(C2.waits,C2.waits+.5,tt,easeOut)*(1-sm(C2.strikes,C2.strikes+.3,tt));
  if(wa>.02)items.push({z:L1[1]+.9,draw:()=>{const pts:Pt[]=[];for(let k=0;k<=10;k++){const qq=lerp(q,tLand,k/10);const bb=ball1(qq);pts.push(proj(st,bb.u,bb.y,bb.v));}if(q<tLand)cased(s,pts,10,231,{dash:26,progress:wa});floorDashRing(s,st,K,L1[0],L1[1],.45,16,232,wa);floorDashRing(s,st,Y,L1[0],L1[1],.45,9,233,wa);}});
  // "own half": the halfway line glows behind the strike
  const hl=sm(C2.strikes,C2.strikes+.4,tt,easeOut);
  if(hl>.02)items.push({z:20.5,draw:()=>{cased(s,[proj(st,0,0,2),proj(st,0,0,10),proj(st,0,0,19)],14,234,{dash:44,progress:hl});}});
  items.sort((a,c2)=>c2.z-a.z).forEach(it=>it.draw());
  // "strikes": a red ring round his right boot at contact
  const bt=easeOutBack(sm(C2.strikes-.1,C2.strikes+.25,tt))*(1-sm(C2.strikes+.4,C2.strikes+.7,tt));
  if(bt>.02){const l=abk1(q),tp=jointPt(st,ID,l,'rToe'),r=kAt(st,l.v)*.4*bt;s.fill(R,ribbon(blob(tp[0],tp[1],r,r*.75,241,{n:22}),10,{seed:242,close:true,wobble:1}),1);}
  whip(s,st,st.cx,tc,W2,W3);
  return;
 }
 // after the cut: the broadcast camera over the halfway line, the team celebrating, the scoreboard ticking
 const st=ST1(1.2),T=tt;
 cam(s,0,key(tc,mono([[WM2,1080],[C2.hat,1000],[C2.end,990]]),easeInOutSine),key(tc,mono([[WM2,.9],[C2.hat,.8],[C2.end,.84]]),easeInOutSine));
 court(s,st,T,{cheer:.7+.3*sm(C2.win,C2.win+.3,T),flash:pulse(T,C2.again,1)+pulse(T,C2.then,1)+pulse(T,C2.win,1.2)});
 const score=T<C2.again+.1?'5-1':T<C2.then+.1?'6-1':'7-1';
 const sb=scoreboard(s,st,1.2,score,easeOutBack(sm(C2.seven,C2.seven+.4,T)),pulse(T,C2.again+.1,.8)+pulse(T,C2.then+.1,.8));
 const items:Item[]=[];
 [0,1,2,3].forEach(i=>{const g=downGen(i);items.push({z:g(T).v,draw:()=>athlete(s,st,ID,g,T,i===3?FRA_FLY:FRA(i),{detail:'low'})});});
 [1,2,3].forEach(i=>{const g=knotGen(i);items.push({z:g(T).v,draw:()=>athlete(s,st,ID,g,T,UKR(i-1),{detail:'low'})});});
 const g0=knotGen(0);items.push({z:KN[1]-.01,draw:()=>athlete(s,st,ID,g0,T,ABK,{detail:'mid'})});
 items.sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
 // "a hat": three balls stamp in under the scoreboard, one per goal
 for(let k=0;k<3;k++){const g=easeOutBack(sm(C2.hat+k*.12,C2.hat+k*.12+.35,T));if(g<=.02)continue;const x=sb.cx+(k-1)*sb.H*.75,y=sb.top+sb.H*.55;ball(s,x,y,sb.H*.28*g,260+k);}
 // "seven one": the bronze medal stamps in beside the scoreboard
 medal(s,sb.cx-sb.W*.95,sb.top-sb.H*.5,sb.H*.62,easeOutBack(sm(C2.seven,C2.seven+.45,T)));
 if(T>=C2.win&&T<C2.win+.6){const h=jointPt(st,ID,g0(T),'head');sparkBurst(s,Y,h[0],h[1]-60,160,{n:12,seed:271,g:easeOut(sm(C2.win,C2.win+.35,T))});}
}
const sc2:Scene={draw(s,t){const{tt,tc}=clock(1,t);replay(s,tt,tc);},aperture(t){const{tt}=clock(1,t);return aperture(chestPts(ST1(1.2),ID,knotGen(0)(tt),.14));},still:C2.drop};

// ================= chapter 3 — HOW HE DOES IT (demonstration, the goal on the RIGHT): back to goal, the pass, the spin, the toe-poke =================
// Local frame FF: u = metres out from the goal line, v across (v > 0 is nearer the main stand, since Z = 10 − v). He turns toward the camera.
const C3={this:A(2,'This is'),trick:A(2,'his trick'),back:A(2,'back to goal'),turns:A(2,'turns'),pokes:A(2,'pokes'),toe:A(2,'with his toe'),before:A(2,'before the keeper'),set:A(2,'set'),end:AUTH[2].seconds};
type DemoT={hit:number;recv:number;t0:number;t1:number;poke:number};
const T3:DemoT={hit:C3.this+.15,recv:C3.this+.85,t0:C3.turns-.2,t1:C3.turns+.45,poke:C3.toe+.1};
const PA3:[number,number]=[11.6,-2.6];
const AB3:[number,number]=[7.4,.3],DF3:[number,number]=[6.45,.42];
const YAW_A0=Math.atan2(PA3[1]-AB3[1],PA3[0]-AB3[0]);
const BP3:[number,number]=[5.45,1],GT3:[number,number,number]=[-.35,-1.12,.32];
const YAW_P=Math.atan2(GT3[1]-BP3[1],GT3[0]-BP3[0])+TAU;// ≈ +3.5: he keeps turning the same way (counter-clockwise from above, through facing the main stand) to face the goal
const POKE_POW=.2;
const pokePose=(t:number)=>{const p=strike(t,{foot:'r',power:POKE_POW}),w=Math.max(0,1-Math.abs(t-STRIKE_CONTACT)/.18);p.rAnk=lerp(p.rAnk,-.05,w);return p;};
const AB3P=toePlace(pokePose(STRIKE_CONTACT),YAW_P,BP3);
const AB3T:[number,number]=[6.1,1.05];// after the spin: goal-side of the defender, on the side he isn't covering
const YAW_PA3=Math.atan2(AB3[1]-PA3[1],AB3[0]-PA3[0]);
const PB3=toePlace(strike(STRIKE_CONTACT,{foot:'r',power:.45}),YAW_PA3,[PA3[0]-.5,PA3[1]+.2]);
const FRONT=.45;
type Demo={abk:LGen;def:LGen;pas:LGen;gk:LGen;ball:(t:number)=>BallS};
function makeDemo(T:DemoT):Demo{
 const pos=(t:number):[number,number]=>{
  if(t<T.t0)return AB3;
  if(t<T.t1){const p=sm(T.t0,T.t1,t,easeIO);return[lerp(AB3[0],AB3T[0],p),lerp(AB3[1],AB3T[1],p)+Math.sin(Math.PI*p)*.25];}
  const p=sm(T.t1,T.poke-.2,t,easeIO);return[lerp(AB3T[0],AB3P[0],p),lerp(AB3T[1],AB3P[1],p)];};
 const yawA=(t:number)=>t<T.t0?YAW_A0:lerp(YAW_A0,YAW_P,sm(T.t0,T.poke-.25,t,easeIO));
 const front=(t:number):[number,number]=>{const p=pos(t),y=yawA(t);return[p[0]+Math.cos(y)*FRONT,p[1]+Math.sin(y)*FRONT];};
 const abk:LGen=t=>{
  const b=Math.sin(t*5)*.5+.5,[u,v]=pos(t),yaw=yawA(t);
  // back to goal: knees bent, left forearm back feeling the defender, right arm out calling for it
  let pose=posed({lHipF:18,rHipF:22,lKnee:30+6*b,rKnee:32+6*b,lHipA:14,rHipA:14,lean:16,neckP:8,lShF:-34,lShA:30,lElb:44,rShF:36,rShA:42,rElb:30});
  // receive: right sole out
  pose=blendPose(pose,posed({lHipF:14,rHipF:34,lKnee:34,rKnee:30,rAnk:-16,lHipA:12,rHipA:18,lean:18,neckP:30,lShF:-30,lShA:40,lElb:44,rShA:40,rElb:40}),sm(T.recv-.35,T.recv,t,easeIO)*(1-sm(T.recv+.2,T.t0,t,easeIO)));
  // the spin: a quick dribble drag, head round first
  const sp=sm(T.t0-.05,T.t0+.1,t)*(1-sm(T.poke-.35,T.poke-.25,t));
  if(sp>0)pose=blendPose(pose,{...dribble((t-T.t0)*2.6,{foot:'r',speed:.45}),neckY:.4*(1-sm(T.t0,T.t1,t))},sp);
  // the toe-poke: no backswing, stab through
  const pk=sm(T.poke-.3,T.poke-.2,t,easeIO);
  if(pk>0)pose=blendPose(pose,pokePose(key(t,[[T.poke-.28,.3],[T.poke,STRIKE_CONTACT],[T.poke+.35,.8],[T.poke+.7,1]],linear)),pk*(1-sm(T.poke+.75,T.poke+1,t)));
  const cel=sm(T.poke+.75,T.poke+1,t,easeIO);if(cel>0)return{pose:blendPose(pose,celebrate((t-T.poke)*1.2,{kind:'arms'}),cel),yaw:lerpAng(yaw,-Math.PI/2,cel),u,v};
  return{pose,yaw,u,v};};
 const def:LGen=t=>{
  const b=Math.sin(t*5.4)*.5+.5;
  let pose=posed({lHipF:30,rHipF:22,lKnee:48+6*b,rKnee:42+6*b,lAnk:-6,rAnk:-6,lHipA:16,rHipA:16,lHipR:10,rHipR:10,lean:24,pitch:4,neckP:-8,lShF:46,lShA:22,lElb:70,rShA:32,rShF:6,rElb:44,twist:4});
  // beaten on the turn: a late lunge to his left, then he turns to look
  const l=sm(T.t0+.15,T.t0+.3,t)*(1-sm(T.poke+.2,T.poke+.6,t));if(l>0)pose=blendPose(pose,lunge(key(t,[[T.t0+.15,.25],[T.t1+.1,.6],[T.poke+.2,.85]],linear),{side:'l'}),l);
  const w=sm(T.poke+.2,T.poke+.6,t);if(w>0)pose=blendPose(pose,DOWN,w*.7);
  const ab=pos(t),yaw=lerpAng(Math.atan2(ab[1]-DF3[1],ab[0]-DF3[0])*.5,Math.PI,sm(T.poke,T.poke+.6,t,easeIO));
  return{pose,yaw,u:DF3[0],v:DF3[1]};};
 const pas:LGen=t=>{
  let pose=blendPose(stand(),posed({lHipF:14,rHipF:20,lKnee:24,rKnee:30,lean:14,neckP:18,lShA:22,rShA:22,lElb:34,rElb:34}),.6);
  if(t>T.hit-.55)pose=blendPose(pose,strike(key(t,[[T.hit-.5,.18],[T.hit,STRIKE_CONTACT],[T.hit+.5,.84],[T.hit+1.1,.98]],linear),{foot:'r',power:.45}),sm(T.hit-.55,T.hit-.4,t,easeIO)*(1-sm(T.hit+1.1,T.hit+1.5,t,easeIO)));
  const clap=sm(T.poke+.5,T.poke+.9,t,easeIO);if(clap>0)pose=blendPose(pose,celebrate((t-T.poke)*1.1,{kind:'arms'}),clap*.8);
  return{pose,yaw:YAW_PA3,u:PB3[0],v:PB3[1]};};
 // the keeper: shuffling across toward the side the turn goes (still moving, feet not planted) — the poke goes back inside the far post
 const gkV=(t:number)=>key(t,[[T.t0,-.55],[T.poke+.1,.35]],easeIO);
 const gk:LGen=t=>{
  const d=key(t,[[T.poke+.14,0],[T.poke+.45,.5],[T.poke+1,.88],[T.poke+1.4,1]],linear);
  const sh=sm(T.t0,T.poke+.1,t),pose=d>0?keeperDive(d,{side:'r',height:.25}):blendPose(keeperSet(t*1.3),posed({lHipF:30,rHipF:30,lKnee:56,rKnee:56,lHipA:30*Math.abs(Math.sin(t*9)),rHipA:30*Math.abs(Math.sin(t*9)),lean:22,lShA:40,rShA:40,lElb:40,rElb:40,air:.05*Math.abs(Math.sin(t*9))}),Math.sin(Math.PI*sh)*.8);
  return{pose,yaw:Math.atan2(BP3[1]-gkV(t),BP3[0])*.5,u:.75,v:gkV(t)};};
 const BR=front(T.recv);
 const ballF=(t:number):BallS=>{
  const P0:[number,number]=[PA3[0]-.5,PA3[1]+.2];
  if(t<T.hit)return{u:P0[0],y:BALL_R,v:P0[1],moving:false,spin:0};
  if(t<T.recv){const p=sm(T.hit,T.recv,t,x=>x*(1.15-.15*x));return{u:lerp(P0[0],BR[0],p),y:BALL_R,v:lerp(P0[1],BR[1],p),moving:true,spin:p*12};}
  if(t<T.t1){const f=front(t),g=sm(T.recv,T.recv+.2,t);return{u:lerp(BR[0],f[0],g),y:BALL_R,v:lerp(BR[1],f[1],g),moving:t>T.t0,spin:12+(t-T.recv)*6};}
  if(t<T.poke){const f=front(T.t1),p=sm(T.t1,T.poke,t,easeIO);return{u:lerp(f[0],BP3[0],p),y:BALL_R,v:lerp(f[1],BP3[1],p),moving:true,spin:16+p*3};}
  const ta=T.poke+.4;
  if(t<ta){const p=sm(T.poke,ta,t,linear);return{u:lerp(BP3[0],GT3[0],p),y:lerp(BALL_R,GT3[2],p)+.12*4*p*(1-p),v:lerp(BP3[1],GT3[1],p),moving:true,spin:22+p*20};}
  const d=sm(ta,ta+.4,t,easeOut);return{u:lerp(GT3[0],-.8,d),y:lerp(GT3[2],BALL_R,d),v:GT3[1]+.05*d,moving:t<ta+.2,spin:44};};
 return{abk,def,pas,gk,ball:ballF};
}
const demo=makeDemo(T3);
const ST3:Stage={F:6500,eye:3.6,cx:15,cz:-10};
/** a curved turn arrow round the defender (yellow, cased) */
const TURN3:[number,number][]=[[AB3[0]+.35,AB3[1]+.2],[AB3[0]+.1,AB3[1]+.95],[AB3[0]-.7,AB3[1]+1.2],[AB3T[0]-.5,AB3T[1]+.2]];
function demoItems(s:Sheet,st:Stage,fr:Frame,D:Demo,q:number,det:'mid'|'high',smear:number):Item[]{
 const b=D.ball(q),A0=D.abk(q);
 const bd=(()=>{const a=D.ball(q-.05),p=fp(st,fr,a.u,a.v,a.y),r=fp(st,fr,b.u,b.v,b.y);return Math.atan2(r[1]-p[1],r[0]-p[0]);})();
 return[
  {z:depth(fr,D.pas(q)),draw:()=>athlete(s,st,fr,D.pas,q,DEMO_P,{detail:'mid'})},
  {z:depth(fr,D.def(q)),draw:()=>athlete(s,st,fr,D.def,q,DEMO_D,{detail:det})},
  {z:depth(fr,A0)-.001,draw:()=>athlete(s,st,fr,D.abk,q,ABK_T,{detail:det,smear})},
  {z:depth(fr,b)-.02,draw:()=>{drawBallL(s,st,fr,b,321,9,bd);}},
 ];
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=ST3,hit=pulse(tt,T3.poke,.35);
  camPath(s,t,[[0,-1250,860,.6],[C3.this,-1200,860,.62],[T3.recv,-850,880,.86],[C3.back,-800,890,.98],[C3.turns,-700,890,1.02],[C3.pokes,-300,880,.86],[C3.toe,300,870,.7],[C3.before,700,860,.66],[C3.end,720,860,.66]],[5*hit*Math.sin(t*80),0]);
  const inNet=tt>=T3.poke+.4;
  court(s,st,tt,{goals:'F',flags:false,cheer:.05+.5*sm(T3.poke+.4,T3.poke+.8,tt),flash:pulse(tt,T3.poke+.4,1),rippleF:pulse(tt,T3.poke+.4,.5),keeperF:()=>{athlete(s,st,FF,demo.gk,tt,DEMO_K,{detail:'mid'});}});
  const A0=demo.abk(tt),[AX,AZ]=toStage(FF,A0.u,A0.v);
  const rg=easeOutBack(sm(C3.this,C3.this+.35,tt))*(1-sm(C3.back-.1,C3.back+.2,tt));
  if(rg>.02){floorDashRing(s,st,K,AX,AZ,1,20,310,rg);floorDashRing(s,st,Y,AX,AZ,1,12,311,rg);}
  // "back to goal": a red dashed arrow from his back to the goal behind him
  const bg=sm(C3.back,C3.back+.4,tt,easeOut)*(1-sm(C3.turns,C3.turns+.3,tt));
  if(bg>.02){const pts=[fp(st,FF,A0.u-.4,A0.v),fp(st,FF,A0.u-3,A0.v*.6),fp(st,FF,1.2,0)];redLane(s,pts,12,312,{progress:bg});if(bg>.9)arrowHead(s,R,pts,32,313);}
  // "turns": the yellow turn arrow round the defender's shoulder
  const ta=sm(C3.turns-.1,C3.turns+.35,tt,easeOut)*(1-sm(T3.poke,T3.poke+.3,tt));
  if(ta>.02){const pts=smoothPts(TURN3.map(([u,v])=>fp(st,FF,u,v)),false,8);cased(s,pts,11,314,{dash:30,progress:ta});if(ta>.9)casedHead(s,pts,30,315);}
  const fast=(tt>T3.t0&&tt<T3.t1)?.1:(tt>T3.poke-.2&&tt<T3.poke+.12)?.12:0;
  demoItems(s,st,FF,demo,tt,'high',fast).sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "with his toe": a red ring round the right toe, a spark at contact
  const tr=easeOutBack(sm(T3.poke-.12,T3.poke+.15,tt))*(1-sm(T3.poke+.4,T3.poke+.7,tt));
  if(tr>.02){const tp=jointPt(st,FF,A0,'rToe'),r=kAt(st,AZ)*.35*tr;s.fill(R,ribbon(blob(tp[0],tp[1],r,r*.75,316,{n:22}),9,{seed:317,close:true,wobble:1}),1);}
  if(tt>=T3.poke&&tt<T3.poke+.4){const p=fp(st,FF,BP3[0],BP3[1],.15);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:318,g:easeOut(sm(T3.poke,T3.poke+.25,tt))});}
  // "before the keeper": a navy/red ring under the keeper, still on the move
  const kr=easeOutBack(sm(C3.before,C3.before+.35,tt));
  if(kr>.02){const g=demo.gk(tt),[KX,KZ]=toStage(FF,g.u,g.v);floorDashRing(s,st,K,KX,KZ,1,20,319,kr);floorDashRing(s,st,R,KX,KZ,1,12,320,kr);}
  // "set": in — a spark in the net
  if(inNet&&tt<T3.poke+1.1){const p=fp(st,FF,-.6,GT3[1],.6);sparkBurst(s,Y,p[0],p[1],150,{n:13,seed:321,g:easeOut(sm(T3.poke+.4,T3.poke+.75,tt))});}
  const sg=easeOutBack(sm(C3.set,C3.set+.35,tt));
  if(sg>.02){const p=fp(st,FF,-.5,GT3[1],.4);sparkBurst(s,R,p[0],p[1],170*sg,{n:9,seed:322,g:sg});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(ST3,FF,demo.abk(tt),.13));},
 still:C3.turns+.3,
};

// ================= chapter 4 — YOUR TURN: the demo again from low behind the passer's side; three cards (turn, toe-poke, keeper not set); a tick =================
const C4={your:A(3,'Your turn'),quick:A(3,'a quick'),beat:A(3,'can beat'),before:A(3,'before they'),set:A(3,'are set'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T3.hit-.4],[C4.quick,T3.t0],[C4.beat,T3.poke-.05],[C4.before,T3.poke+.3],[C4.end,T3.poke+1.8]]),linear);
const ST4:Stage={F:2000,eye:1.1,cx:13.4,cz:3.5};
const CARD_Y=660,CARD_W=175,CARDS:[number,number,'turn'|'poke'|'keeper'][]=[[-420,C4.quick,'turn'],[0,C4.beat,'poke'],[420,C4.before,'keeper']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=ST4,q=seq4(tt);
  const CK4:Key[]=[[0,-500,0,.9],[C4.your+.4,-300,200,.8],[C4.quick,-200,200,.8],[C4.beat,500,200,.8],[C4.before+.4,800,200,.8],[C4.end,850,200,.8]];
  camPath(s,t,CK4);const camX4=key(t,padKeys(mono(CK4),[0,0,1,0]),easeInOutSine,true)[0];
  court(s,st,tt,{goals:'F',flags:false,cheer:.1+.7*sm(T3.poke+.4,T3.poke+.8,q)*(1-sm(C4.end-1,C4.end,tt)),flash:pulse(q,T3.poke+.4,1.2),rippleF:pulse(q,T3.poke+.4,.5),keeperF:()=>{athlete(s,st,FF,demo.gk,q,DEMO_K,{detail:'mid'});}});
  demoItems(s,st,FF,demo,q,'mid',q>T3.poke-.2&&q<T3.poke+.1?.15:0).sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx0],i)=>{const cx=cx0+camX4;const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx0,tc0,kind],i)=>{const cx=cx0+camX4;const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='poke'?-50:0),y:gy+25,height:320*(.9+.1*on),azimuth:kind==='turn'?-40:kind==='poke'?0:90,elevation:14,fov:18,at:[0,0,0]});
    const Pp=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    if(kind==='turn'){const pose={...dribble(.3,{foot:'r',speed:.45}),neckY:-.4};
     const arc:Pt[]=[];for(let k=0;k<=10;k++){const a=-Math.PI*.1-k/10*Math.PI*1.1;arc.push(Pp([Math.cos(a)*.75,0,Math.sin(a)*.75]));}
     dashed(s,Y,arc,9,86,{dash:20});arrowHead(s,Y,arc,26,87);
     drawAthlete(s,pose,fc,{...ABK_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});}
    if(kind==='poke'){const pose=pokePose(STRIKE_CONTACT),csk=solve(pose,BUILD,{}),tb:V3=[csk.rToe[0]+.09,BALL_R,csk.rToe[2]];
     drawAthlete(s,pose,fc,{...ABK_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
     const p0=Pp(tb),bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);s.fill(R,ribbon(blob(p0[0]-bR*.6,p0[1],bR*1.6,bR*1.4,90,{n:18}),6,{seed:93,close:true,wobble:1}),1);
     speedLines(s,Y,p0[0]+bR*2.4,p0[1],0,{n:4,seed:94,len:120,spread:bR*1.6,width:6,cov:.9});}
    if(kind==='keeper'){const pose=blendPose(keeperSet(.3),posed({lHipF:30,rHipF:30,lKnee:56,rKnee:56,lHipA:34,rHipA:10,lean:22,lShA:40,rShA:40,lElb:40,rElb:40,air:.08}),.8);
     drawAthlete(s,pose,fc,{...DEMO_K,detail:'mid',shadow:[K,.2]},{},{prev:pose});
     const a=Pp([.3,.25,-1.1]),b2=Pp([-.4,.2,1.3]);dashed(s,R,[a,L2(a,b2,.5),b2],9,95,{dash:22});arrowHead(s,R,[a,L2(a,b2,.5),b2],26,96);
     const bb=Pp([-.3,.2,1.1]);ball(s,bb[0],bb[1],BALL_R*(fc.scale?fc.scale([-.3,.2,1.1]):100),97);}
    s.restore();});
   s.fill(K,frames);}
  // "are set": a big tick (yellow over red, navy echo)
  const tick=easeOutBack(sm(C4.set,C4.set+.45,tt));
  if(tick>.02){const A0=demo.abk(q),g=fp(st,FF,A0.u,A0.v),[,AZ]=toStage(FF,A0.u,A0.v),h=kAt(st,AZ)*1.8,c:Pt=[g[0]+h*.55,g[1]-h*.95],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.beat+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'abakshyn-futsal-signature',format:'futsal',title:'Danyil Abakshyn: the toe-poke after the turn',theme:'In futsal, a quick toe-poke can beat the keeper before they are set.',
 ageNote:'For players aged 7–12: the 2024 World Cup bronze match, his strike from his own half and his hat-trick are real; the turn and toe-poke are shown as a demonstration. Quick feet, quick shot.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball spins round a yellow turn arc, then darts off on a toe-poke with speed lines; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const turn=sm(0,.35,age,easeOut),a=Math.PI*(1-turn),shot=sm(.45,.7,age,x2=>x2*x2);
  const bx=x+Math.cos(a)*r*1.4*(1-shot)+shot*220,by=y-Math.sin(a)*r*.6*(1-shot);
  const arc:Pt[]=[];for(let k=0;k<=12;k++){const aa=Math.PI*(1-k/12*turn);arc.push([x+Math.cos(aa)*r*1.4,y-Math.sin(aa)*r*.6+r*1.05]);}
  if(turn>.05&&age<1)s.fill(Y,ribbon(arc,10,{seed:seed+3,taper:.3,wobble:1}),.9*(1-sm(.8,1,age)));
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:age*8,smear:shot>0&&shot<1?.3:0,dir:0});
  if(shot>0&&shot<1)speedLines(s,Y,bx-r*2,by,Math.PI,{n:5,seed:seed+4,len:160,spread:r*1.6,width:8,cov:.9});
 },
};
export default film;
