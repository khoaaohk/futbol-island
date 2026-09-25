/** Sergio González — "the tireless wing runner": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Sergio González, born 30 Jun 1997, Spanish futsal ala (winger). Matches the card: country Spain (lib/town/playerAppearance.json) and
 *  bio "Spanish ala who has played for FC Barcelona and Spain's national team, a hard-working wide player who covers the whole court"
 *  (lib/town/playerBios.json). Spain No. 7 at the 2021 FIFA Futsal World Cup (then with Viña Albali Valdepeñas); Barcelona No. 16 in
 *  the current Wikipedia squad list; RFEF's "Mejor Ala" of the 2021/22 season (Futsal RFEF video title, playerHighlightLibrary.json).
 *  Not the football coach Sergio González (Catalonia 2015–18) and not the Paraguay keeper Giovanni González.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the overlap run from the right wing, lesson "Run into space to
 *  give your teammate an easy pass." — not one match. No written source we could reach describes a single González run or goal in words
 *  (the UEFA match page is a script shell; Wikipedia gives scorer + minute only), so the film follows the brief's honest fallback: it
 *  opens on a REAL, documented match he scored in — KMF Loznica-Grad 0–2 FC Barcelona, UEFA Futsal Champions League 2023/24 MAIN ROUND,
 *  28 Oct 2023, Lagator Hall, Loznica (Serbia) — showing ONLY confirmed things (the arena, the teams at 0–0, his celebration as the
 *  scoreboard goes to 0–1 after his 23'08" opener, and the 0–2 full time after Adolfo's 38'06"). His goal itself is NOT staged. Then
 *  "This is how he runs" shows the overlap in a separate, clearly labelled demonstration in neutral training kit that is never passed off
 *  as that match. (No other futsal film uses this match — checked by grep for "Loznica"; the Adolfo film uses the 2022 semi-final, the
 *  Pito / Ferrão / Dídac Plana films the 2022 final.)
 *  1  LIVE (broadcast camera, main stand): Loznica (home, paper shirts) v Barcelona (blue-and-red stripes); the teams set at 0–0 with the
 *     ball on the centre spot, González ringed on "Winger" out on Barça's right wing, a yellow lane along his wing on "Sergio"; whip pan
 *     (a cut in time) to his celebration as the scoreboard ticks to 0–1 on "first goal"; whip pan to full time, 0–2 ringed on "two nil".
 *  2  HOW HE RUNS (a demonstration, real time, side-on from the main stand, the goal on the RIGHT; González in a plain yellow training
 *     top, his teammate in white, red-bib defenders, a blue-bib keeper — no match claimed): his teammate has the ball on the right with a
 *     defender in front; González sprints round the OUTSIDE of him (the overlap) into the empty space down the wing; the teammate slides
 *     an easy pass into that space and González shoots first time with his right foot, low to the far post.
 *  3  WATCH AGAIN (slow-motion replay, a closer and lower camera at the near touchline): the defender cannot mark both players —
 *     two red lines from him, one to each; González runs into the space (yellow ring) and the pass is easy.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Run into space to give your teammate an easy pass."): the move again; three cards
 *     (run, find the space, the easy pass); a tick.
 * Sources (written; fetched with curl, generic User-Agent, ≤ 8 requests, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2023–24 UEFA Futsal Champions League" (raw, cached: wiki-2023-24-uefa-futsal-cl.txt): main round Group 2, match MR 2.6,
 *    28 October 2023, 15:30, KMF Loznica-Grad (SRB) 0–2 FC Barcelona (ESP); goals "S. González 23'08"", "Adolfo 38'06""; Lagator Hall,
 *    Loznica; referees Daniel Matkovic (Switzerland), Damian Grabowski (Poland). Barcelona were later runners-up (final 5 May 2024, Yerevan).
 *  - Wikipedia, "2021 FIFA Futsal World Cup squads" (raw, fetched Sep 2026: wiki-2021-futsal-wc-squads.txt): Spain No. 7 "Sérgio González",
 *    MF, born 30 June 1997, club Viña Albali Valdepeñas.
 *  - Wikipedia, "FC Barcelona Futsal" (raw, cached: wiki-fcb-futsal.txt): current squad No. 16, Spain, Winger, Sergio González.
 *  - Portuguese Wikipedia, "Copa do Mundo de Futsal de 2021" (raw, cached): Spain's 2021 World Cup scorers — González is not among them
 *    (so the World Cup is not used as "his" match).
 *  - The UEFA match page (uefa.com/uefafutsalchampionsleague/match/2038883--loznica-grad-2018-vs-barca/) was fetched but is a script shell.
 * CONFIRMED: the match, date, venue, competition and round, Serbia, the 0–2 result, his goal at 23'08" as the FIRST goal (so 0–0 before it,
 *  0–1 after it), Adolfo's 38'06" second, his position (winger / ala), Spain, Barcelona. The narration only states these (plus the entry's
 *  signature, framed as "how he runs").
 * INFERRED (not named in the narration): both kits that day (Barça blue-and-red stripes / navy shorts; Loznica paper shirts / navy shorts),
 *  the keepers' colours, the court colour (drawn blue), which end each team attacked, that the 0–0 shot is a kick-off (second half), every
 *  position in chapter 1, that he plays on the RIGHT wing (from the card's params), where and how he celebrated, the scoreboard's look,
 *  Serbian flags in the stands, his shirt number that day (none is drawn), his hair (short, dark) and light skin (card appearance).
 *  No video was reviewed. Chapters 2–4 are a demonstration of the overlap run, not a recreation of any match play (the right-footed
 *  first-time finish and the angles are chosen to read clearly).
 * Technique (the overlap): the ala starts BEHIND and INSIDE the teammate on the ball; when the defender squares up to that teammate, he
 *  sprints round the outside, along the touchline, and arrives in the space beyond the defender at full speed. The defender cannot
 *  follow both players, so the teammate's pass into the space is easy; the runner meets it first time.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the sprint and the shot). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across;
 *  +v = the attackers' RIGHT); each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages
 *  are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: blue (the court, Barça stripes), red (Barça stripes, rings, the pass lane, the bibs), yellow (lights, the run lane, the training
 *  tops), navy (key line, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet
 *  (card window 1.45:1 → square); never sheet.safe. Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones.
 *  All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,runCycle,runCadence,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Loznica 2023',text:'A Futsal Champions League game in Loznica, Serbia, in 2023. Barcelona play the home team. Winger Sergio González scores the first goal. Barcelona win two nil!',tail:2.6,
  cues:['A Futsal','Loznica','Barcelona play','Winger','Sergio','scores','first goal','Barcelona win','two nil'],
  heads:{'A Futsal':'Champions League 2023','Winger':'Winger (ala)','first goal':'0–1','Barcelona win':'Full time','two nil':'0–2'}},
 {label:'How he runs',text:'This is how he runs. His teammate has the ball, with a defender in front. He sprints round the outside, into the space. Easy pass, and he shoots!',tail:2.4,
  cues:['This is how','His teammate','the ball','a defender','sprints round','the outside','into the space','Easy pass','he shoots'],heads:{'This is how':'The overlap','he shoots':''}},
 {label:'Watch again',text:'Watch again, slowly. The defender cannot stop both players. So he runs into the space, and the pass is easy!',tail:2.2,
  cues:['Watch again','The defender','both players','runs into','the space','pass is easy'],heads:{'Watch again':'Slow motion','both players':'1 defender, 2 players','pass is easy':''}},
 {label:'Your turn',text:'Your turn: run into space to give your teammate an easy pass!',tail:2.8,
  cues:['Your turn','run into','space','give your','easy pass'],heads:{'Your turn':'Find the space','easy pass':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/sergio-gonzalez-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/sergio-gonzalez-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/sergio-gonzalez-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('sergio-gonzalez: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue in chapter i whose words are w (exact match first, else the first that starts with w; throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words===w)??AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('sergio-gonzalez: no cue '+w);return c.at;};
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
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
/** a yellow dashed line cased in navy (reads on the yellow wood) */
function cased(s:Sheet,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){dashed(s,K,pts,width*1.8,seed,{...o,ko:false,cov:.9});dashed(s,Y,pts,width,seed,{...o});}
function casedHead(s:Sheet,pts:Pt[],size:number,seed:number){arrowHead(s,K,pts,size*1.35,seed,.9);arrowHead(s,Y,pts,size,seed);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
/** a red dashed line cased in paper (the pass lane) */
function redLane(s:Sheet,pts:Pt[],width:number,seed:number,o:{progress?:number;cov?:number}={}){dashed(s,R,pts,width,seed,{dash:width*3.6,progress:o.progress,cov:o.cov??1});}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- the LOCAL court frame: u = metres out from the goal line (0 = the line), v = across (0 = the goal's centre) ----------------
/** a stage frame: where the goal centre sits on the stage floor and the rotation (a proper rotation, never a mirror) */
type Frame={ox:number;oz:number;rot:number};
const toStage=(fr:Frame,u:number,v:number):[number,number]=>{const c=Math.cos(fr.rot),sn=Math.sin(fr.rot);return[fr.ox+u*c-v*sn,fr.oz+u*sn+v*c];};
type Loc={pose:Pose;yaw:number;u:number;v:number};
type LGen=(t:number)=>Loc;

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
/** yaw that faces the floor direction (du,dv) (library yaw 0 faces +u; + turns toward +v) */
const yawTo=(du:number,dv:number)=>Math.atan2(dv,du);
/** his skin: a light screen (card appearance: skin 1, dark hair, short) */
const SKIN:InkFill[]=[[Y,.8],[R,.3]];
const BUILD={height:1.76,bulk:1};
/** González for Barcelona (kit INFERRED): blue shirt with red stripes, navy shorts, navy socks; short dark hair; no number is claimed */
const SERG:AthleteStyle={shirt:B,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:'paper',skin:SKIN,hair:K,line:K,trim:Y,hairStyle:'short',build:BUILD,seed:9};
/** González in the demonstration and lesson: a plain yellow training top and navy shorts (no club kit, so no match is implied) */
const SERG_T:AthleteStyle={...SERG,shirt:[Y,.95],pattern:'plain',patternInk:undefined,shorts:K,socks:K,trim:K,boots:'paper'};
/** his teammate in the demonstration: a plain white (paper) training top */
const MATE_T:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.62],[R,.3],[K,.08]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8},seed:31};
/** Barça team-mates (kit inferred) */
const BAR=(n:number):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:K,skin:[[[Y,.8],[R,.26]],[[Y,.62],[R,.3],[K,.08]],[[Y,.78],[R,.22]]][n%3] as InkFill[],hair:K,line:K,trim:Y,hairStyle:(['short','curly','balding'] as const)[n%3],build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Loznica (kit inferred): paper shirts with red trim, navy shorts, paper socks */
const LOZ=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[[Y,.78],[R,.24]],[[Y,.72],[R,.3]]][n%2] as InkFill[],hair:K,line:K,trim:R,hairStyle:n%3?'short':'bald',build:{height:1.74+hash(n,4)*.12},seed:40+n});
const LOZ_GK:AthleteStyle={shirt:[Y,.85],shorts:K,socks:K,boots:K,skin:[[Y,.76],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.86},seed:61};
/** the demonstration defenders and keeper: neutral training bibs (no team is claimed in chapters 2–4) */
const DEMO_D:AthleteStyle={shirt:[R,.8],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'short',build:{height:1.8,bulk:1.05},seed:77};
const DEMO_D2:AthleteStyle={shirt:[R,.8],shorts:K,socks:K,boots:K,skin:[[Y,.5],[R,.34],[K,.12]],hair:K,line:K,trim:K,hairStyle:'bald',build:{height:1.84,bulk:1.08},seed:79};
const DEMO_K:AthleteStyle={shirt:[B,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:78};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-1/12),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc){const sk=solve(l.pose,BUILD,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}

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

// ---------------- the arena: blue court (inferred), stands with Serbian (and a few Barça) flags, futsal goal ----------------
/** stepped navy rows, lit faces, yellow / blue / red shirts, Serbian (red-blue-white, inferred) and Barça (blue / red) flags, roof lights */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),pap=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);if(hash(i,8)<.22)continue;const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.2)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.42)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%3===2){blues.addPath(band(0,.5));reds.addPath(band(.5,1));}
  else{reds.addPath(band(0,1/3));blues.addPath(band(1/3,2/3));pap.addPath(band(2/3,1));}}
 s.fill(Y,heads,.6);s.knockout(pap);s.knockout(yel);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh; posts red/paper bands */
function goalNet(s:Sheet,st:Stage,fr:Frame){
 const H=2,Db=.95,Dt=.55,P=(u:number,Yh:number,v:number):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,Yh,Z);};
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
/** convex hull of a few points (goal quads seen from any angle stay clean) */
function convex(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
/** the court's painted lines in the local frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots, touchlines */
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMax:number){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));
 for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[0,v],[uMax,v]]),.05),true));
}

// ---- SIDE court from the main stand: the halfway line at X = 0, the near touchline Z = 0, the far boards Z = 21; the goal on frame fr ----
const BOARDS=21;
/** chapter 1 + 2: the goal at X = −20 (left); chapter 3 + 4: the SAME local court turned 180° (the goal at X = +20, right) */
const FA:Frame={ox:-20,oz:10,rot:0},FR:Frame={ox:20,oz:10,rot:Math.PI};
type CourtOpt={cheer?:number;flash?:number;keeper?:()=>void};
function courtSide(s:Sheet,st:Stage,fr:Frame,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 // the blue sports floor (UEFA photo): a flat blue screen, a darker navy run-off band beyond the touchlines, a faint seeded mottle
 s.fill(B,rectPath(-span,wall,span*2,span),.34);
 const run=new Path2D(),a0=proj(st,st.cx-40,0,20.4),a1=proj(st,st.cx+40,0,BOARDS);run.rect(a0[0],a1[1],a1[0]-a0[0],a0[1]-a1[1]);
 const n0=proj(st,st.cx-40,0,Math.max(st.cz+.6,-1)),n1=proj(st,st.cx+40,0,-.4);if(n1[1]<n0[1])run.rect(n0[0],n1[1],n1[0]-n0[0],n0[1]-n1[1]);s.fill(K,run,.28);
 const mot=new Path2D();for(let k=0;k<40;k++){const x=st.cx-24+hash(k,11)*48,z=Math.max(st.cz+1,0)+hash(k,12)*20,p=proj(st,x,0,z),r=kAt(st,z)*(.6+hash(k,13)*1.2);mot.addPath(polyPath(blob(p[0],p[1],r*2.2,r*.5,300+k,{amp:.2,n:10}),true));}s.fill(B,mot,.12);
 const lines=new Path2D();courtLines(st,fr,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,20]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,fr);o.keeper?.();goalPosts(s,st,fr);
}

// ================= shared bits: the ball on a stage, floor points, joints, depth sort =================
type BallS={u:number;y:number;v:number;moving:boolean;spin:number};
function lerpAng(a:number,b:number,u:number){let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;}
/** a ball drawn on stage st through frame fr, with its floor shadow */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:BallS,seed:number,min=9,dir=0){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.moving?.25:0,dir});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** his chest (the passage enters his shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'head'|'face'|'pelvis'|'rToe'|'chest'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};

// ================= the overlap (local frame: u = metres out from the goal line, v across; +v = the attackers' RIGHT) =================
/** the defender's stance: low, knees bent, square to the man on the ball, arms out for balance */
const GUARD=(b:number)=>posed({lHipF:30,rHipF:26,lKnee:46+6*b,rKnee:44+6*b,lAnk:-6,rAnk:-6,lHipA:18,rHipA:18,lHipR:10,rHipR:10,lean:22,pitch:4,neckP:-6,lShF:20,lShA:30,lElb:50,rShA:30,rShF:20,rElb:50,air:.012*b});
const MATE0:[number,number]=[12.6,6.0];// his teammate on the ball, out on the right
const D1P:[number,number]=[10.8,5.4];// the defender in front of the teammate
const D2P:[number,number]=[6.4,.6];// the covering defender, central
const GKP:[number,number]=[.6,.4];
const S0:[number,number]=[18.4,2.6];// González: behind and inside his teammate
const SH:[number,number]=[8.0,7.4];// THE SPACE: where the pass meets his right boot
const NET:[number,number]=[-.3,-1.05];// low, inside the far post
const YAW_SHOT=yawTo(NET[0]-SH[0],NET[1]-SH[1]);
const SHOT_POW=.8,PASS_POW=.4;
/** where he stands for the first-time shot: the right toe on the ball at the strike's contact */
const SPOT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:SHOT_POW}),BUILD,{yaw:YAW_SHOT}),toe=sk.rToe;return[SH[0]-toe[0],SH[1]+toe[2]];})();
const YAW_M=yawTo(SH[0]-MATE0[0],SH[1]-MATE0[1]);
/** the ball at the teammate's right boot at the pass's contact (local) */
const MB0:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:PASS_POW}),{height:1.8},{yaw:YAW_M}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[MATE0[0]+toe[0]+d[0]/l*.08,MATE0[1]-(toe[2]+d[1]/l*.08)];})();
/** his run: from behind and inside, round the OUTSIDE of his teammate along the touchline, into the space (metres, local) */
const RUN:Pt[]=smoothPts([S0,[16.6,5.0],[14.6,7.8],[12.4,8.9],[10.2,8.7],SPOT] as Pt[],false,.1,2.5);
const RUN_S=(()=>{const s=[0];for(let i=1;i<RUN.length;i++)s.push(s[i-1]+Math.hypot(RUN[i][0]-RUN[i-1][0],RUN[i][1]-RUN[i-1][1]));return s;})();
const RUN_L=RUN_S[RUN_S.length-1];
function runAt(d:number):{p:[number,number];dir:number}{
 let i=1;while(i<RUN.length-1&&RUN_S[i]<d)i++;const a=RUN[i-1],b=RUN[i],seg=RUN_S[i]-RUN_S[i-1]||1,u=Math.max(0,Math.min(1,(d-RUN_S[i-1])/seg));
 return{p:[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],dir:Math.atan2(b[1]-a[1],b[0]-a[0])};
}
type OT={step:number;go:number;hit:number;shot:number};
type Overlap={serg:LGen;mate:LGen;d1:LGen;d2:LGen;gk:LGen;ball:(t:number)=>BallS;dist:(t:number)=>number};
function makeOverlap(T:OT):Overlap{
 const arrive=T.shot-.25,A0=.15,prof=(x:number)=>(x<A0?x*x/(2*A0):A0/2+(x-A0))/(1-A0/2);
 const dist=(t:number)=>t<=T.go?0:t>=arrive?RUN_L:RUN_L*prof((t-T.go)/(arrive-T.go));
 const spd=Math.min(1,RUN_L/(arrive-T.go)/(1-A0/2)/6.5);
 const ballF=(t:number):BallS=>{
  if(t<T.hit)return{u:MB0[0],y:BALL_R,v:MB0[1],moving:false,spin:0};
  if(t<T.shot){const p=sm(T.hit,T.shot,t,x=>x*(1.25-.25*x));return{u:lerp(MB0[0],SH[0],p),y:BALL_R,v:lerp(MB0[1],SH[1],p),moving:true,spin:p*10};}
  const f=sm(T.shot,T.shot+.42,t,linear);
  if(f<1)return{u:lerp(SH[0],NET[0],f),y:BALL_R+.35*Math.sin(Math.PI*f*.5),v:lerp(SH[1],NET[1],f),moving:true,spin:10+f*14};
  const d=sm(T.shot+.42,T.shot+.9,t,easeOut);return{u:lerp(NET[0],-.7,d),y:lerp(BALL_R+.35,BALL_R,d),v:NET[1],moving:d<1,spin:24};};
 // ---- González: waits behind; sprints round the outside, eyes on the ball; meets the pass first time with the right foot
 const shotS=(t:number)=>key(t,[[T.shot-.45,.08],[T.shot-.25,.22],[T.shot,STRIKE_CONTACT],[T.shot+.45,.8],[T.shot+1,1]],linear);
 const serg:LGen=t=>{
  const{p,dir}=runAt(dist(t));
  let pose=idle(t,.2),yaw=yawTo(MATE0[0]-p[0],MATE0[1]-p[1]);
  const go=sm(T.go-.3,T.go+.1,t,easeIO);
  if(go>0){const ph=Math.max(0,t-T.go+.3)*runCadence(spd);pose=blendPose(pose,runCycle(ph,{speed:spd*(.4+.6*sm(T.go-.3,T.go+.6,t))}),go);yaw=lerpAng(yaw,dir,go);
   // head over his shoulder to the ball while he runs
   const b=ballF(t),look=Math.atan2(b.v-p[1],b.u-p[0]);let dy=look-yaw;while(dy>Math.PI)dy-=TAU;while(dy<-Math.PI)dy+=TAU;
   pose={...pose,neckY:Math.max(-1.1,Math.min(1.1,dy))*.7*go*(1-sm(T.shot-.5,T.shot-.3,t))};}
  const k=sm(T.shot-.45,T.shot-.3,t,easeIO);
  if(k>0){pose=blendPose(pose,strike(shotS(t),{foot:'r',power:SHOT_POW}),k*(1-sm(T.shot+1,T.shot+1.3,t)));yaw=lerpAng(yaw,YAW_SHOT,k);}
  const c=sm(T.shot+1,T.shot+1.3,t,easeIO);if(c>0)pose=blendPose(pose,celebrate((t-T.shot-1)*1.1,{kind:'arms'}),c);
  return{pose,yaw,u:p[0],v:p[1]};};
 // ---- the teammate: on the ball, shielding; slides the easy pass into the space with his right foot
 const passS=(t:number)=>key(t,[[T.hit-.5,.18],[T.hit,STRIKE_CONTACT],[T.hit+.5,.84],[T.hit+1.1,.98]],linear);
 const mate:LGen=t=>{const b=Math.sin(t*4.6)*.5+.5;
  let pose=posed({lHipF:18,rHipF:10,lKnee:30+6*b,rKnee:22+4*b,lHipA:12,rHipA:10,lean:16,neckP:22,lShA:34,rShA:26,lElb:40,rElb:36,lShF:10,rShF:-6});
  const w=sm(T.hit-.55,T.hit-.4,t,easeIO)*(1-sm(T.hit+1.1,T.hit+1.5,t,easeIO));
  if(w>0)pose=blendPose(pose,strike(passS(t),{foot:'r',power:PASS_POW}),w);
  const g=sm(T.shot+.9,T.shot+1.3,t,easeIO);if(g>0)pose=blendPose(pose,celebrate((t-T.shot)*1.1+.4,{kind:'arms'}),g);
  return{pose,yaw:YAW_M,u:MATE0[0],v:MATE0[1]};};
 // ---- the defender on the ball: steps up, squares up; his head turns to the runner (he cannot follow both); chases too late
 const d1:LGen=t=>{const b=Math.sin(t*5.2)*.5+.5,up=sm(T.step,T.step+.5,t,easeIO),base:[number,number]=[lerp(D1P[0]-.8,D1P[0],up),lerp(D1P[1]-.4,D1P[1],up)];
  let pose=GUARD(b),yaw=yawTo(MATE0[0]-base[0],MATE0[1]-base[1]),u=base[0],v=base[1];
  const s=serg(t),look=Math.atan2(s.v-v,s.u-u);let dy=look-yaw;while(dy>Math.PI)dy-=TAU;while(dy<-Math.PI)dy+=TAU;
  const lw=sm(T.go+.6,T.go+1.1,t)*(1-sm(T.hit+.05,T.hit+.3,t));pose={...pose,neckY:Math.max(-1.2,Math.min(1.2,dy))*lw};
  const ch=sm(T.hit+.1,T.hit+.5,t,easeIO);
  if(ch>0){const d=Math.max(0,t-T.hit-.2),run=Math.min(1.3,d*2.4),to=[SH[0]-base[0],SH[1]-base[1]],l=Math.hypot(to[0],to[1]);u=base[0]+to[0]/l*run;v=base[1]+to[1]/l*run;
   pose=blendPose(pose,runCycle(d*runCadence(.6),{speed:.6}),ch);yaw=lerpAng(yaw,Math.atan2(to[1],to[0]),ch);}
  return{pose,yaw,u,v};};
 // ---- the cover defender: shifts across after the pass — too late
 const d2:LGen=t=>{const b=Math.sin(t*5)*.5+.5,sh=sm(T.hit,T.shot+.2,t,easeIO),u=lerp(D2P[0],6.9,sh),v=lerp(D2P[1],3.4,sh);
  let pose=GUARD(b);if(sh>0&&sh<1)pose=blendPose(pose,runCycle((t-T.hit)*runCadence(.5),{speed:.5}),Math.sin(Math.PI*sh));
  const bl=ballF(Math.min(t,T.shot));return{pose,yaw:Math.atan2(bl.v-v,bl.u-u),u,v};};
 // ---- the keeper: shifts to the near post as the pass goes; dives to his right (the far post) — beaten
 const gk:LGen=t=>{const bl=ballF(Math.min(t,T.shot)),sh=sm(T.hit,T.shot,t,easeIO)*.6,yaw=Math.atan2(bl.v-GKP[1]-sh,bl.u-GKP[0])*.6,dv=sm(T.shot-.02,T.shot+.9,t);
  if(dv<=0)return{pose:keeperSet(t*1.3),yaw,u:GKP[0],v:GKP[1]+sh};
  return{pose:keeperDive(dv,{side:'r',height:.2}),yaw,u:GKP[0],v:GKP[1]+sh};};
 return{serg,mate,d1,d2,gk,ball:ballF,dist};
}
/** the run lane: the yellow dashed route round the outside (cased in navy), drawn to `progress` */
function runLane(s:Sheet,st:Stage,fr:Frame,g:number,seed:number,w=13,from=0){if(g<=.02)return;const pts=RUN.filter((_,i)=>i%6===0||i===RUN.length-1).map(([u,v])=>fp(st,fr,u,v));const line=partial(pts,g);const cut=from>0?partial(line.slice().reverse(),1-from).reverse():line;if(cut.length<2)return;cased(s,cut,w,seed,{dash:w*3.2});if(g>.5)casedHead(s,cut,w*3,seed+1);}
/** the pass lane: a red dashed line from the teammate's boot into the space */
function passLane(s:Sheet,st:Stage,fr:Frame,g:number,seed:number,w=12){if(g<=.02)return;redLane(s,[fp(st,fr,MB0[0],MB0[1]),fp(st,fr,lerp(MB0[0],SH[0],.5),lerp(MB0[1],SH[1],.5)),fp(st,fr,SH[0],SH[1])],w,seed,{progress:g});if(g>.9)arrowHead(s,R,[fp(st,fr,MB0[0],MB0[1]),fp(st,fr,SH[0],SH[1])],w*2.6,seed+1);}

// ================= chapter 1 — LIVE: Loznica-Grad v Barcelona, 28 Oct 2023. Only confirmed things: the arena, the teams at 0–0, González
// (winger) out on Barça's wing, then (cut) his celebration as the scoreboard goes to 0–1, and (cut) the 0–2 full time. His goal is NOT staged.
// Local u = metres from LOZNICA's goal (Barça attack towards u = 0, the left); +v = Barça's right (the far side). ==========
const C1={loz:A(0,'Loznica'),bar:A(0,'Barcelona play'),wing:A(0,'Winger'),serg:A(0,'Sergio'),scores:A(0,'scores'),first:A(0,'first goal'),win:A(0,'Barcelona win'),two:A(0,'two nil'),end:AUTH[0].seconds};
/** two whip pans (cuts in time): 0–0 → his celebration (23'08", 0–1) → full time (0–2) */
const W0=C1.scores-.14,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** 0–0, the ball on the centre spot: Barça in their half (González out on the right wing, the far side), Loznica by the ball */
const KO_BAR:[number,number][]=[[23.2,5.8],[27.4,.3],[23.6,-5.2],[21.2,.9]];// González, fixo, left ala, pivot
const KO_LOZ:[number,number][]=[[19.55,.35],[16.2,4.6],[16.4,-5],[13.2,.3]];// by the ball, alas, fixo
const CEL:[number,number]=[8.2,-.6],FIN:[number,number]=[17.2,.6];
function kickoffGen(i:number,team:'bar'|'loz'):LGen{const p=(team==='bar'?KO_BAR:KO_LOZ)[i];return t=>({pose:idle(t,i+(team==='bar'?0:.37)),yaw:team==='bar'?Math.PI:0,u:p[0],v:p[1]});}
const phaseOf=(T:number)=>T<WM?0:T<VM?1:2;
const liveS:LGen=T=>{const ph=phaseOf(T);
 if(ph===0)return kickoffGen(0,'bar')(T);
 if(ph===1){const run=sm(WM,WM+.9,T,easeOut);return{pose:run<1?blendPose(celebrate((T-WM)*1.3,{kind:'run'}),celebrate((T-WM)*1.1,{kind:'arms'}),sm(WM+.6,WM+.9,T)):celebrate((T-WM)*1.1,{kind:'arms'}),yaw:-Math.PI/2+.5+.3*Math.sin((T-WM)*1.4),u:CEL[0]+(1-run)*2.2,v:CEL[1]+(1-run)*1.2};}
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2-.35,u:FIN[0]+.3,v:FIN[1]-1.2};};
const liveBar=(i:number):LGen=>T=>{// i = 0..2: fixo, left ala, pivot
 const ph=phaseOf(T);
 if(ph===0)return kickoffGen(i+1,'bar')(T);
 if(ph===1){const from:[number,number]=([[18.2,.6],[15.6,-5.2],[11.4,1.8]] as [number,number][])[i];
  const go=sm(WM,WM+1.5,T,easeOut),tgt:[number,number]=[CEL[0]+[.9,-.8,1.2][i],CEL[1]+[-.9,.9,.8][i]],u=lerp(from[0],tgt[0],go),v=lerp(from[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:Math.atan2(CEL[1]-v,CEL[0]-u),u,v};}
 const spot:[number,number][]=[[FIN[0]-.9,FIN[1]+1.1],[FIN[0]+.8,FIN[1]+1.2],[FIN[0]-.6,FIN[1]-.2]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.2,.5][i],u:spot[i][0],v:spot[i][1]};};
/** Loznica after the goal and at full time: heads down, hands on hips */
const DOWN=posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:30,rShA:30,lShF:-20,rShF:-20,lElb:110,rElb:110});
const liveLoz=(i:number):LGen=>T=>{const ph=phaseOf(T);if(ph===0)return kickoffGen(i,'loz')(T);
 const base=(ph===1?[[5.4,-2.6],[6.4,7.2],[3.2,-.9],[12.4,-5.8]]:[[22.2,5.8],[24.4,-6.6],[26.2,2.2],[20.6,7.4]])[i] as [number,number];
 return{pose:DOWN,yaw:ph<2?(i%2?.7:-.5):Math.PI*.8,u:base[0],v:base[1]};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:DOWN,yaw:.4,u:.8,v:-.4};
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.bar,1.4],[C1.wing,3.2],[C1.serg,2.4],[W0,2.2],[W1,-11.4],[V0,-11],[V1,-3.2],[C1.end,-3]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.bar,.62],[C1.wing+.2,1.35],[C1.serg+.3,1.3],[W0,1.25],[W1,.9],[C1.first,.94],[V0,.94],[V1,.96],[C1.end,1.02]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.wing+.2,800],[C1.serg,820],[W1,930],[V0,930],[V1,960],[C1.end,950]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'2':[0,2,3,4,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the arena scoreboard: Loznica (home) left (red tab), Barcelona right (blue-over-red tab); ring = a yellow ring round Barça's score; flash = the new digit */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,ring=0,flash=0){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19,bx=cx+W*.3-h*.55;
 const tab=(ink:string,x:number,y0:number,hh:number)=>{const p=new Path2D();p.rect(x,y0,W*.16,hh);s.fill(ink,p);};
 tab(R,cx-W*.38,top-H+H*.06,H*.07);tab(B,cx+W*.22,top-H+H*.05,H*.045);tab(R,cx+W*.22,top-H+H*.095,H*.045);
 digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],bx,y,h);s.knockout(lit);s.fill(Y,lit);
 if(flash>.02){const p=new Path2D();digit(p,score[2],bx,y,h);s.fill(R,p,flash*.8);}
 if(ring>.02){const c:Pt=[bx+h*.27,y+h*.5],rr=h*.72*ring;s.fill(Y,ribbon(blob(c[0],c[1],rr,rr*1.1,151,{n:20}),Math.max(5,h*.09),{seed:152,close:true,wobble:1.2}),1);}
 return{cx,W,H,top};
}
const ST1=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=ST1(c.x),ph=phaseOf(T);
 cam(s,0,c.y,c.zoom);
 courtSide(s,st,FA,T,{cheer:ph===0?.15:ph===1?.9*sm(C1.first-.3,C1.first+.2,T)+.3:.8,flash:ph===1?pulse(T,C1.first,1.2):ph===2?pulse(T,VM,1.2)+.6*pulse(T,C1.two,1.2):0,
  keeper:()=>{athlete(s,st,FA,liveGK,T,LOZ_GK,{detail:'low'});}});
 const score=ph===2?(T>=C1.two?'0-2':'0-1'):ph===1&&T>=C1.first?'0-1':'0-0';
 scoreboard(s,st,c.x,score,ph===2?easeOutBack(sm(C1.two+.1,C1.two+.5,T)):0,ph===1?pulse(T,C1.first,.8):ph===2?pulse(T,C1.two,.8):0);
 const items:Item[]=[];
 KO_LOZ.forEach((_,i)=>{const g=liveLoz(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,LOZ(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveBar(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,BAR(i),{detail:'low'})});});
 items.push({z:depth(FA,liveS(T))-.02,draw:()=>athlete(s,st,FA,liveS,T,SERG,{detail:'mid'})});
 if(ph===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,moving:false,spin:0},18);}});
 // "Winger": a red dashed ring under him; "Sergio": his lane — a yellow arrow down the right wing from his feet towards the goal
 if(ph===0){const l=liveS(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.wing,C1.wing+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,R,X,Z,1.15,14,51,g);}});
  const ln=sm(C1.serg,C1.serg+.8,T,easeOut)*(1-sm(W0-.3,W0,T));if(ln>.02)items.push({z:Z+1,draw:()=>{const pts=[fp(st,FA,l.u-1.3,l.v+.4),fp(st,FA,l.u-6,l.v+.9),fp(st,FA,l.u-11,l.v+1)],line=partial(pts,ln);cased(s,line,14,52,{dash:46});if(ln>.6)casedHead(s,line,44,53);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "first goal": a spark over his head as the scoreboard ticks
 if(ph===1&&T>=C1.first&&T<C1.first+.6){const h=jointPt(st,FA,liveS(T),'head');sparkBurst(s,Y,h[0],h[1]-60,150,{n:12,seed:61,g:easeOut(sm(C1.first,C1.first+.35,T))});}
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(ST1(liveCam(tc).x),FA,liveS(tt),.14));},still:C1.wing+.3};

// ================= chapter 2 — HOW HE RUNS (demonstration, real time, side-on from the main stand, the goal on the RIGHT) =================
const C2={how:A(1,'This is how'),mate:A(1,'His teammate'),ball:A(1,'the ball'),def:A(1,'a defender'),spr:A(1,'sprints round'),out:A(1,'the outside'),space:A(1,'into the space'),easy:A(1,'Easy pass'),shoots:A(1,'he shoots'),end:AUTH[1].seconds};
const T2:OT={step:C2.def,go:C2.spr-.3,hit:C2.easy-.05,shot:C2.shoots+.1};
const ov=makeOverlap(T2);
const ST2:Stage={F:4200,eye:4.2,cx:11,cz:-20};
/** a floor ring that pops on a cue and fades on another */
function popRing(s:Sheet,st:Stage,fr:Frame,u:number,v:number,r:number,t:number,on:number,off:number,ink:string,seed:number,w=14){const g=easeOutBack(sm(on,on+.35,t))*(1-sm(off,off+.3,t));if(g<=.02)return;const[X,Z]=toStage(fr,u,v);floorDashRing(s,st,K,X,Z,r,w*1.6,seed,g);floorDashRing(s,st,ink,X,Z,r,w,seed+1,g);}
function overlapItems(s:Sheet,st:Stage,fr:Frame,O:Overlap,t:number,o:{hero:'high'|'mid';smear:number;min?:number}):Item[]{
 const b=O.ball(t),a=O.ball(t-.05),p=fp(st,fr,a.u,a.v),q=fp(st,fr,b.u,b.v),bd=Math.atan2(q[1]-p[1],q[0]-p[0]);
 return[
  {z:depth(fr,O.mate(t)),draw:()=>athlete(s,st,fr,O.mate,t,MATE_T,{detail:'mid'})},
  {z:depth(fr,O.d1(t)),draw:()=>athlete(s,st,fr,O.d1,t,DEMO_D,{detail:'mid'})},
  {z:depth(fr,O.d2(t)),draw:()=>athlete(s,st,fr,O.d2,t,DEMO_D2,{detail:'mid'})},
  {z:depth(fr,O.serg(t))-.001,draw:()=>athlete(s,st,fr,O.serg,t,SERG_T,{detail:o.hero,smear:o.smear})},
  {z:depth(fr,b)-.02,draw:()=>{drawBallL(s,st,fr,b,221,o.min??9,bd);}},
 ];
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=ST2,hit=pulse(t,T2.shot,.35);
  // the camera follows the play: between González and his teammate (then the space), then between him and the goal for the shot
  {const sx=(u:number,v:number)=>{const[X,Z]=toStage(FR,u,v);return proj(st,X,1,Z)[0];},S=ov.serg(twos(t)),mid=lerp(sx(MATE0[0],MATE0[1]),sx(SH[0],SH[1]),sm(C2.out,C2.easy,t,easeIO)),
   gl=sx(1,0),x=lerp(lerp(mid,sx(S.u,S.v),.5),lerp(sx(SH[0],SH[1]),gl,.45),sm(C2.easy+.3,C2.shoots+.3,t,easeIO)),
   z=key(t,mono([[0,1.3],[C2.how,1.45],[C2.def,1.4],[C2.spr,1.3],[C2.easy,1.22],[C2.shoots+.2,1.05],[C2.end,1.08]]),easeInOutSine);
   cam(s,x+5*hit*Math.sin(t*80),key(t,mono([[0,600],[C2.space,620],[C2.shoots,600],[C2.end,590]]),easeInOutSine),z);}
  courtSide(s,st,FR,tt,{cheer:.05+.6*sm(T2.shot+.3,T2.shot+.8,tt),flash:pulse(tt,T2.shot+.4,1),keeper:()=>{athlete(s,st,FR,ov.gk,tt,DEMO_K,{detail:'mid'});}});
  const S=ov.serg(tt),[SX,SZ]=toStage(FR,S.u,S.v);
  // "This is how": a red dashed ring under him; "His teammate" / "the ball": a yellow ring under the teammate and the ball; "a defender": red under him
  popRing(s,st,FR,S.u,S.v,1,tt,C2.how,C2.mate,R,210);
  popRing(s,st,FR,MB0[0],MB0[1],.9,tt,C2.mate,C2.spr,Y,212);
  const D=ov.d1(tt);popRing(s,st,FR,D.u,D.v,.9,tt,C2.def,C2.spr+.2,R,214);
  // "sprints round" … "the outside": his route round the outside draws ahead of him; "into the space": the space rings up
  const rl=sm(C2.spr-.1,C2.out+.2,tt,easeOut)*(1-sm(T2.shot-.2,T2.shot+.2,tt));
  runLane(s,st,FR,rl,216,13,ov.dist(tt)/RUN_L);
  popRing(s,st,FR,SH[0],SH[1],1.3,tt,C2.space,T2.shot,Y,218,16);
  // "Easy pass": the lane from the teammate's boot into the space
  passLane(s,st,FR,sm(C2.easy-.15,C2.easy+.3,tt,easeOut)*(1-sm(T2.shot,T2.shot+.3,tt)),220);
  const fast=tt>T2.go&&tt<T2.shot-.3?.1:(tt>T2.shot-.2&&tt<T2.shot+.15)?.12:0;
  const items=overlapItems(s,st,FR,ov,tt,{hero:'high',smear:fast});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=T2.shot&&tt<T2.shot+.4){const p=fp(st,FR,SH[0],SH[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:222,g:easeOut(sm(T2.shot,T2.shot+.25,tt))});}
  // the goal: a spark in the far corner
  const gT=T2.shot+.42;if(tt>=gT&&tt<gT+.6){const p=fp(st,FR,NET[0]-.4,NET[1],.5);sparkBurst(s,R,p[0],p[1],150,{n:12,seed:231,g:easeOut(sm(gT,gT+.35,tt))});}
  void SX;void SZ;
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(ST2,FR,ov.serg(tt),.13));},
 still:C2.def+.5,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, a closer, lower camera at the touchline; the goal on the RIGHT) =================
const C3={watch:A(2,'Watch again'),def:A(2,'The defender'),both:A(2,'both players'),runs:A(2,'runs into'),space:A(2,'the space'),easy:A(2,'pass is easy'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq3(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.go-.6],[C3.def,T2.go+.1],[C3.both,T2.go+1.1],[C3.runs,T2.go+1.9],[C3.space,T2.hit-.3],[C3.easy,T2.hit+.2],[C3.end,T2.shot+.9]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const ov3:Overlap={serg:g3(ov.serg),mate:g3(ov.mate),d1:g3(ov.d1),d2:g3(ov.d2),gk:g3(ov.gk),ball:t=>ov.ball(seq3(t)),dist:t=>ov.dist(seq3(t))};
const ST3:Stage={F:2200,eye:1.5,cx:10,cz:-6};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=ST3,q=seq3(tt),hit=pulse(q,T2.shot,.4);
  {const sx=(u:number,v:number)=>{const[X,Z]=toStage(FR,u,v);return proj(st,X,1,Z)[0];},S=ov3.serg(twos(tt)),M=sx(MATE0[0],MATE0[1]),
   Dq=ov3.d1(tt),x=lerp((M+sx(S.u,S.v)+sx(Dq.u,Dq.v))/3,lerp(sx(SH[0],SH[1]),sx(1,0),.4),sm(T2.hit-.1,T2.shot+.3,q,easeIO)),z=key(t,mono([[0,1.2],[C3.def,1.02],[C3.both+.3,.96],[C3.runs,1.15],[C3.easy,1.2],[C3.end,1.08]]),easeInOutSine);
   cam(s,x+6*hit*Math.sin(t*90),key(t,mono([[0,190],[C3.runs,200],[C3.end,180]]),easeInOutSine)+4*hit*Math.cos(t*77),z);}
  courtSide(s,st,FR,tt,{cheer:.1+.5*sm(T2.shot+.3,T2.shot+.8,q),flash:pulse(q,T2.shot+.4,1.2),keeper:()=>{athlete(s,st,FR,ov3.gk,tt,DEMO_K,{detail:'mid'});}});
  // "The defender": a red ring under him; "both players": two red dashed lines from him — one to each attacker
  const D=ov3.d1(tt);popRing(s,st,FR,D.u,D.v,.9,tt,C3.def,C3.runs,R,310);
  const bl=sm(C3.both-.1,C3.both+.4,tt,easeOut)*(1-sm(C3.space,C3.space+.3,tt));
  if(bl>.02){const S=ov3.serg(tt),M=ov3.mate(tt),d0=fp(st,FR,D.u,D.v);for(const[P,sd] of[[M,312],[S,314]] as [Loc,number][]){const e=fp(st,FR,P.u,P.v);redLane(s,[d0,L2(d0,e,.5),e],12,sd,{progress:bl});}}
  // "runs into": his route; "the space": the ring; "pass is easy": the lane
  runLane(s,st,FR,sm(C3.runs-.1,C3.runs+.5,tt,easeOut)*(1-sm(T2.shot-.2,T2.shot+.2,q)),316,15,ov3.dist(tt)/RUN_L);
  popRing(s,st,FR,SH[0],SH[1],1.3,tt,C3.space,C3.end,Y,318,17);
  passLane(s,st,FR,sm(C3.easy-.2,C3.easy+.3,tt,easeOut)*(1-sm(T2.shot,T2.shot+.3,q)),320,14);
  const fast=q>T2.go&&q<T2.shot-.3?.22:(q>T2.shot-.2&&q<T2.shot+.15)?.25:0;
  const items=overlapItems(s,st,FR,ov3,tt,{hero:'high',smear:fast,min:10});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(q>=T2.shot&&q<T2.shot+.4){const p=fp(st,FR,SH[0],SH[1],.2);sparkBurst(s,Y,p[0],p[1],140,{n:11,seed:322,g:easeOut(sm(T2.shot,T2.shot+.3,q))});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(ST3,FR,ov3.serg(tt),.13));},
 still:C3.both+.2,
};

// ================= chapter 4 — YOUR TURN: the move again; three cards (run, find the space, the easy pass); a tick =================
const C4={your:A(3,'Your turn'),run:A(3,'run into'),space:A(3,'space'),give:A(3,'give your'),easy:A(3,'easy pass'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.go-.5],[C4.run,T2.go+.2],[C4.space,T2.go+1.8],[C4.give,T2.hit-.2],[C4.easy,T2.shot-.1],[C4.end,T2.shot+1.6]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const ov4:Overlap={serg:g4(ov.serg),mate:g4(ov.mate),d1:g4(ov.d1),d2:g4(ov.d2),gk:g4(ov.gk),ball:t=>ov.ball(seq4(t)),dist:t=>ov.dist(seq4(t))};
const ST4:Stage={F:2600,eye:2.4,cx:12,cz:-10};
const CARD_Y=660,CARD_W=175,CARDS:[number,number,'run'|'space'|'pass'][]=[[-420,C4.run,'run'],[0,C4.space,'space'],[420,C4.easy,'pass']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=ST4,q=seq4(tt);
  camPath(s,t,[[0,-400,40,.9],[C4.your+.4,-300,330,.8],[C4.space,-80,340,.8],[C4.easy,160,340,.8],[C4.end,260,340,.82]]);
  courtSide(s,st,FR,tt,{cheer:.1+.7*sm(T2.shot+.3,T2.shot+.8,q)*(1-sm(C4.end-1,C4.end,tt)),flash:pulse(q,T2.shot+.4,1.2),keeper:()=>{athlete(s,st,FR,ov4.gk,tt,DEMO_K,{detail:'low'});}});
  runLane(s,st,FR,sm(C4.run-.1,C4.run+.4,tt,easeOut)*(1-sm(T2.shot-.2,T2.shot+.2,q)),401,12,ov4.dist(tt)/RUN_L);
  popRing(s,st,FR,SH[0],SH[1],1.2,tt,C4.space,C4.end,Y,403,14);
  passLane(s,st,FR,sm(C4.give-.1,C4.give+.3,tt,easeOut)*(1-sm(T2.shot,T2.shot+.3,q)),405,12);
  const items=overlapItems(s,st,FR,ov4,tt,{hero:'mid',smear:q>T2.go&&q<T2.shot?.18:0,min:9});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (run, space, easy pass)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='run'?-30:kind==='pass'?-40:0),y:gy+25,height:320*(.9+.1*on),azimuth:kind==='space'?60:kind==='run'?0:30,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='run'?runCycle(.3,{speed:1}):kind==='space'?idle(.4,0):strike(STRIKE_CONTACT,{foot:'r',power:.6});
    const csk=solve(pose,BUILD,{}),Pp=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // run = a yellow arrow ahead of him; space = a yellow dashed ring round his feet; pass = a red lane arriving at his right boot
    if(kind==='run'){const a=Pp([.6,0,0]),c2=Pp([2.4,0,0]),pts:Pt[]=[a,L2(a,c2,.5),c2];dashed(s,Y,pts,9,85,{dash:22});arrowHead(s,Y,pts,26,86);}
    if(kind==='space'){const ring:Pt[]=[];for(let k=0;k<=20;k++){const a=k/20*TAU;ring.push(Pp([Math.cos(a)*.9,0,Math.sin(a)*.9]));}dashed(s,Y,ring,8,88,{dash:18});}
    if(kind==='pass'){const tb:V3=[csk.rToe[0]+.1,BALL_R,csk.rToe[2]],p0=Pp(tb),e=Pp([tb[0],BALL_R,tb[2]-2.2]);dashed(s,R,[e,L2(e,p0,.5),p0],8,91,{dash:20});}
    drawAthlete(s,pose,fc,{...SERG_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='pass'){const tb:V3=[csk.rToe[0]+.1,BALL_R,csk.rToe[2]],p0=Pp(tb),bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);}
    s.restore();});
   s.fill(K,frames);}
  // "easy pass": a big tick (yellow over red, navy echo) stamps beside him after the shot
  const tick=easeOutBack(sm(T2.shot+.3,T2.shot+.75,q));
  if(tick>.02){const M=ov4.serg(tt),[,MZ]=toStage(FR,M.u,M.v),g=fp(st,FR,M.u,M.v),h=kAt(st,MZ)*1.8,c:Pt=[g[0]-h*.7,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.space+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'sergio-gonzalez-futsal-signature',format:'futsal',title:'Sergio González: the tireless wing runner',theme:'Run into space to give your teammate an easy pass.',
 ageNote:'For players aged 7–12: the 2023 Champions League game in Loznica, his first goal and Barcelona’s 2–0 win are real; the overlap run is shown as a demonstration. Run into the space, then the pass is easy.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball sits still; a yellow dashed run curls round it into the space and the ball rolls after it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const g=sm(0,.45,age,easeOut)*(1-sm(1,1.3,age)),pts:Pt[]=[[x-r*1.6,y+r*1.4],[x-r*.4,y-r*1.9],[x+r*1.8,y-r*1.6],[x+r*3,y-r*.2]];
  if(g>.02){const line=partial(smoothPts(pts,false,8),g);s.fill(K,ribbon(line,18,{seed:seed+5,taper:.2,wobble:1}),.9);s.fill(Y,ribbon(line,11,{seed,taper:.2,wobble:1}),1);}
  const roll=sm(.45,.9,age,easeOut),bx=x+r*2.4*roll;
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:roll*6});
 },
};
export default film;
