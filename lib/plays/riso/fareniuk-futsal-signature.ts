/** Artem Fareniuk — "the pivot who links play": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Artem Fareniuk (Артем Миколайович Фаренюк), born 9 Nov 1992 in Sumy, Ukraine's futsal forward/pivot (card: lib/town/playerBios.json
 *  "Experienced Ukrainian futsal international ... a pivot who helps link the team's attacks"; lib/town/playerAppearance.json country
 *  Ukraine — the sources below agree: same name, same country, same role). Not a football namesake.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "the pivot who links play", lesson "Show for the pass, then play it
 *  back and spin away." — not one match. No written source we could reach describes HOW any single Fareniuk goal or lay-off happened, so the
 *  film follows the brief's honest fallback: the real-match chapter shows ONLY confirmed things from a real, documented match in which he
 *  started and scored — Uragan 2–1 Araz, UEFA Futsal Champions League 2021/22 main round, 28 Oct 2021, Ivano-Frankivsk — and the wall pass
 *  itself is a separate, clearly labelled demonstration ("This is how he does it") that is never passed off as that match.
 *  (Other Ukraine futsal films use the 2024 World Cup QF v Venezuela (Mykytiuk) and EURO 2026 QF v France (Mouhoudine); an Abakshyn film is
 *  in progress in parallel. This is a CLUB match, used by no other film — checked by grep for Uragan/Araz.)
 *  1  LIVE (broadcast camera, main stand, real time): the hall in Ivano-Frankivsk (a small crowd: 250), Uragan (black, drawn navy) v Araz
 *     (red); at the start Fareniuk is Uragan's most advanced player, ringed; whip pan (a cut in time) to his celebration with the scoreboard
 *     at 2–0 (his goal, 15'04"); whip pan to the final whistle, 2–1, Uragan's players jump, Araz's heads drop. His goal is NOT staged.
 *  2  HOW HE DOES IT (a demonstration, real time, side-on from the main stand; Fareniuk in plain Uragan-style navy, a blue-bib team-mate, a
 *     neutral paper/navy defender and keeper — no match claimed): the ala has the ball; Fareniuk, marked from behind, SHOWS for the pass
 *     (checks out toward the ball, arm pointing to his feet); plays it back first time with the inside of his right foot; as the defender
 *     turns his head to watch the ball, Fareniuk spins away over his LEFT shoulder into the space behind; the ala gives it back; he scores.
 *  3  WATCH AGAIN (slow-motion replay, reverse angle: low, behind the ala's shoulder looking at the goal): the defender's eyes follow the
 *     ball (a red eye-line), so nobody follows the spin (the empty space ringed, the run drawn).
 *  4  YOUR TURN (lesson from the entry's `lesson`): he runs it again; three cards (show, play it back, spin away); a tick.
 * Sources (written; fetched with curl, ≤ 8 requests, cached in scratchpad/films/src-cache/):
 *  - Wikipedia (uk), "Фаренюк Артем Миколайович" (raw; ukwiki-fareniuk.txt): born 9 Nov 1992, Sumy; futsal forward (нападник) of the
 *    Ukraine national team and Eurobus Przemyśl (Poland); Uragan Ivano-Frankivsk 2018–2024 (163 games, 115 goals; Extra-liga top scorer
 *    2018/19 and 2023/24); World Cup 2024 bronze; Euro 2022 (4 games, no goals). Search result (ukwiki-search-fareniuk.json) confirms the
 *    same person. — https://uk.wikipedia.org/wiki/Фаренюк_Артем_Миколайович
 *  - Wikipedia (en), "2024 FIFA Futsal World Cup" squads (cached, wiki-2024-futsal-wc-squads.txt): Ukraine No. 11, FW, Artem Fareniuk,
 *    born 9 Nov 1992, Eurobus Przemyśl.
 *  - UEFA match API, match 2033595 (uefa-api-uragan-araz-2021.json): UEFA Futsal Champions League 2021/22, Main Round, 28 Oct 2021
 *    (kick-off 16:00 UTC), Hall "IF Professional College of Physical Education", Ivano-Frankivsk; Uragan 2–1 Araz-Naxçivan; attendance 250;
 *    goals Nazar Shved 9'46" (1–0), Artem Fareniuk 15'04" (2–0), Ramiz Chovdarov 29'29" (2–1). — https://match.uefa.com/v5/matches?matchId=2033595
 *  - UEFA lineups API (uefa-api-uragan-araz-2021-lineups.json): Fareniuk in Uragan's starting five, shirt No. 10, FORWARD; Uragan shirt
 *    colour #000000 (black), Araz #FF0000 (red). — https://match.uefa.com/v5/matches/2033595/lineups
 *  - Wikipedia (en), "2021–22 UEFA Futsal Champions League" (cached): group of Uragan (hosts), Araz, Liqeni, United Galați; Uragan won all
 *    three games (11–2) and went through. — https://en.wikipedia.org/wiki/2021%E2%80%9322_UEFA_Futsal_Champions_League
 *  - UEFA.com match page 2033595 fetched: a JS shell, no goal description.
 * CONFIRMED (the narration states only these): a 2021 Futsal Champions League match in Ukraine, Uragan v Araz, Fareniuk a forward in the
 *  starting five, he scored Uragan's second goal (2–0), Uragan won 2–1.
 * INFERRED (not named in the narration): black shirts drawn in navy ink with navy shorts/socks and a yellow trim; Araz red with paper shorts;
 *  Araz keeper in blue; the wood court and hall look; the crowd's flags; which end; every position in chapter 1; where he celebrated; that
 *  he played as the pivot at that moment ("pivot" = futsal's forward, as on his card). No video was reviewed. Chapters 2–4 are a
 *  demonstration of the pivot's wall pass (a one-two), not a recreation of any real goal.
 * Technique (poses): the pivot starts marked, back to goal; he checks OUT toward the ball (showing), arm pointing at his feet; he plays it
 *  back first time with the inside of the foot nearest the ball (right); the defender's head follows the ball; the pivot spins the other
 *  way (over his left shoulder) and runs into the space behind the defender; the return pass meets his run; a first-time right-foot finish.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the spin and the strike). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across);
 *  each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are LEFT-handed (X right, Z
 *  away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Araz, arrows, eye-line), blue (the demo team-mate's bib, crowd, flags), navy (key line,
 *  Uragan's black, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,runCycle,runCadence,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,mirrorPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Uragan v Araz',text:'A 2021 Futsal Champions League night in Ukraine. Uragan play Araz. Fareniuk is the pivot, the player up front. He scores the second goal, and Uragan win two one!',tail:2.4,
  cues:['A 2021','in Ukraine','Uragan play','Fareniuk','pivot','player up front','He scores','second goal','Uragan win','two one'],heads:{'A 2021':'Champions League 2021','second goal':'2–0','two one':'2–1'}},
 {label:'How he does it',text:'A pivot links the team’s play. This is how he does it: he shows for the pass, plays it back, spins away, gets it back and scores!',tail:2.2,
  cues:['A pivot','links','This is how','shows for','plays it back','spins away','gets it back','scores'],heads:{'A pivot':'The pivot','scores':''}},
 {label:'Watch again',text:'Watch again, slowly. The defender watches the ball, so nobody follows his spin!',tail:2.2,
  cues:['Watch again','defender watches','the ball','nobody follows','his spin'],heads:{'Watch again':'Slow motion','his spin':''}},
 {label:'Your turn',text:'Your turn: show for the pass, then play it back and spin away!',tail:2.6,
  cues:['Your turn','show for','play it back','spin away'],heads:{'Your turn':'Show, pass, spin','spin away':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/fareniuk-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/fareniuk-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/fareniuk-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('fareniuk: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('fareniuk: no cue '+w);return c.at;};
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
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);void seed;}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- the LOCAL court frame: u = metres out from the goal line (0 = the line), v = across (0 = the goal's centre) ----------------
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
const SKIN:InkFill[]=[[Y,.8],[R,.26]];
const BUILD={height:1.8,bulk:1.06};
/** Fareniuk: Uragan — black shirt (navy ink), navy shorts and socks, yellow trim (all but the shirt colour inferred), No. 10 (his club number
 * that night), short dark hair */
const FAR:AthleteStyle={shirt:K,shorts:K,socks:K,boots:'paper',skin:SKIN,hair:K,line:K,trim:Y,hairStyle:'short',number:10,numberInk:'paper',build:BUILD,seed:9};
/** in the demonstration: the same plain navy top, no number (no match is claimed) */
const FAR_T:AthleteStyle={...FAR,number:null};
const URA=(n:number):AthleteStyle=>({shirt:K,shorts:K,socks:K,boots:[K,.6],skin:[[[Y,.8],[R,.24]],[[Y,.76],[R,.2]],[[Y,.78],[R,.28]]][n%3] as InkFill[],hair:K,line:K,trim:Y,hairStyle:(['short','balding','curly'] as const)[n%3],build:{height:1.74+hash(n,3)*.12},seed:20+n});
const ARA=(n:number):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,skin:[[[Y,.72],[R,.3]],[[Y,.6],[R,.32],[K,.1]]][n%2] as InkFill[],hair:K,line:K,trim:'paper',hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const ARA_GK:AthleteStyle={shirt:B,shorts:K,socks:B,boots:K,skin:[[Y,.74],[R,.24]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:61};
/** the demonstration (chapters 2–4): a blue-bib team-mate (the ala), a neutral paper/navy defender and keeper; no team is claimed */
const DEMO_A:AthleteStyle={shirt:B,shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:'paper',hairStyle:'curly',build:BUILD,seed:71};
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.6],[R,.3],[K,.1]],hair:K,line:K,trim:R,hairStyle:'bald',build:{height:1.84,bulk:1.08},seed:77};
const DEMO_GK:AthleteStyle={shirt:[K,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:78};
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

// ---------------- the hall: wood court, a small crowd (250 that night), futsal goal ----------------
/** stepped navy rows; `crowd` = the share of seats filled; lit faces, a few blue/red shirts, blue-over-yellow flags, roof lights */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,crowd=.42){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),flagsB=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<9;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977;if(hash(i,11)>crowd*(1.2-r*.06))continue;const hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.12)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: blue over yellow, hung on the rail and waving
 for(let f=0;f<4;f++){const fx=-2400+f*1400+hash(f,6)*300-((off*.3)%1400),fy=top-(1.5+hash(f,7)*4)*rowH-cheer*rowH*1.2,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const top2=polyPath([pole(0,0),pole(.5,0),pole(1,0),pole(1,.5),pole(.5,.5),pole(0,.5)],true),bot=polyPath([pole(0,.5),pole(.5,.5),pole(1,.5),pole(1,1),pole(.5,1),pole(0,1)],true);
  flagsB.addPath(top2);yel.addPath(bot);}
 s.fill(Y,heads,.6);s.fill(R,reds);s.fill(B,blues);s.knockout(flagsB);s.knockout(yel);s.fill(B,flagsB);s.fill(Y,yel);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh bulging round (bu, by, bv) */
function goalNet(s:Sheet,st:Stage,fr:Frame,bulge:number,bv:number,by:number){
 const H=2,Db=.95,Dt=.55,P=(u:number,Yh:number,v:number):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,Yh,Z);};
 const back=(v:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((v-bv)**2+(Yh-by)**2)/.35);return P(-lerp(Db,Dt,Yh/H)-d,Yh,v);};
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
/** the court's painted lines in the local frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots */
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMax:number){
 /** local points → stage floor points, densified and clipped to what is in front of the camera */
 const S=(pts:Pt[])=>{const o:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[Math.min(pts.length-1,i+1)],n=i<pts.length-1?6:1;for(let k=0;k<n;k++){const q=toStage(fr,lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n));if(q[1]>st.cz+.8)o.push(q);}}return o;},arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 const add=(pts:Pt[])=>{if(pts.length>1)lines.addPath(polyPath(floorStrip(st,pts,.05),true));};
 add(S([[0,-10],[0,10]]));add(S(arc));
 for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);if(Z>st.cz+.8)lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])add(S([[0,v],[uMax,v]]));
}
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void;crowd?:number};
/** the ad boards and the stands above a wall line */
function boards(s:Sheet,st:Stage,wall:number,kw:number,xs:(i:number)=>[number,number],t:number,o:CourtOpt){
 const span=9000,board=.95*kw;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const[x0,x1]=xs(i);ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,o.cheer??0,o.flash??0,st.cx,o.crowd);
}
// ---- SIDE court from the broadcast position (chapters 1–2): the goal at X = −20, the near touchline Z = 0, the far boards Z = 21 ----
const TOUCH_FAR=20,BOARDS=21,FA:Frame={ox:-20,oz:10,rot:0};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<46;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FA,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,TOUCH_FAR]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 const base=Math.floor(st.cx/3)*3;boards(s,st,wall,kw,i=>[proj(st,base+i*3+.3,0,BOARDS)[0],proj(st,base+i*3+2.4,0,BOARDS)[0]],t,o);
 goalNet(s,st,FA,bulge,bv,by);o.keeper?.();goalPosts(s,st,FA);
}
// ---- REVERSE ANGLE (chapters 3–4): the camera stands on the OTHER touchline and looks back across the court (a proper 180° turn of the
//      frame, never a mirror): the goal is on the RIGHT, the ala beyond the pivot, the far boards at Z = WALLZ behind them ----
const WALLZ=17,FB:Frame={ox:8,oz:6,rot:Math.PI};
function arena(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{bulge=0,bv=0,by=1}=o,wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),span=6000;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.3);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-40;i<40;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLZ),proj(st,X0,0,WALLZ)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLZ);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALLZ;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FB,lines,20);s.knockout(lines,.92);
 boards(s,st,wall,kw,i=>[proj(st,i*2.4+.3,0,WALLZ)[0],proj(st,i*2.4+1.9,0,WALLZ)[0]],t,o);
 goalNet(s,st,FB,bulge,bv,by);o.keeper?.();goalPosts(s,st,FB);
}

// ================= the wall pass (local frame): poses, the pivot, the defender, the ala, the ball, the keeper =================
/** CALL: showing for the ball — a low, open stance, the LEFT arm pointing down at his feet ("to me"), head up to the ball */
const CALL=posed({lHipF:24,rHipF:20,lKnee:40,rKnee:38,lAnk:-8,rAnk:-8,lHipA:12,rHipA:14,lHipR:8,rHipR:14,lean:20,pitch:4,neckP:6,neckY:-10,
 lShF:62,lShA:24,lElb:14,rShF:16,rShA:30,rElb:52,twist:-8,squash:-.03});
/** the first-time lay-off with the inside of the RIGHT foot: wind (the foot drawn back, toes turned out), contact, short follow-through */
const LAY_W=posed({lHipF:20,lKnee:40,lAnk:-8,lHipA:10,rHipF:-14,rKnee:44,rAnk:10,rHipR:46,rHipA:8,lean:18,pitch:4,neckP:30,neckY:-12,lShA:44,lShF:10,lElb:40,rShA:36,rShF:-10,rElb:44,twist:6});
const LAY_C=posed({lHipF:22,lKnee:42,lAnk:-8,lHipA:10,rHipF:22,rKnee:20,rAnk:-12,rHipR:52,rHipA:-6,lean:20,pitch:4,neckP:34,neckY:-14,lShA:50,lShF:-6,lElb:34,rShA:34,rShF:18,rElb:46,twist:-4,squash:-.03});
const LAY_F=posed({lHipF:20,lKnee:38,lAnk:-6,lHipA:10,rHipF:34,rKnee:24,rAnk:-8,rHipR:44,rHipA:-10,lean:18,pitch:3,neckP:20,neckY:-24,lShA:44,lShF:-10,lElb:40,rShA:30,rShF:24,rElb:50,twist:-8});
/** the spin over the LEFT shoulder, pushing off the right foot (the mirror of a right-shoulder turn) */
const SPIN=mirrorPose(posed({lHipF:30,lKnee:52,lHipA:6,lAnk:-4,rHipF:34,rKnee:70,rHipA:30,rHipR:22,rAnk:10,lean:24,bend:-10,twist:-28,roll:-6,neckY:-38,neckP:16,
 lShF:14,lShA:64,lElb:40,rShF:-12,rShA:60,rElb:46,squash:-.06}));
/** the defender pressing close behind: forearms on the pivot's back */
const PRESS=posed({lHipF:30,rHipF:14,lKnee:44,rKnee:38,lAnk:-6,lHipA:12,rHipA:12,lean:24,neckP:14,lShF:58,rShF:50,lShA:18,rShA:16,lElb:52,rElb:46});
const readyP=(t:number,ph=0)=>{const b=Math.sin(t*5.2+ph)*.5+.5;return posed({lHipF:18,rHipF:18,lKnee:30+6*b,rKnee:28+6*b,lHipA:10,rHipA:10,lean:16,neckP:8,lShA:22,rShA:22,lElb:40,rElb:40});};
/** the ball's spot at a pose's contact: the toe of a strike, or the inside of the right foot for a lay-off (local u, v) */
function contact(pose:Pose,yaw:number,kind:'toe'|'inside'):[number,number]{
 const sk=solve(pose,BUILD,{yaw});
 if(kind==='toe'){const toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.08,-(toe[2]+d[1]/l*.08)];}
 const m=[lerp(sk.rAn[0],sk.rToe[0],.55),lerp(sk.rAn[2],sk.rToe[2],.55)],d=[sk.lAn[0]-sk.rAn[0],sk.lAn[2]-sk.rAn[2]],l=Math.hypot(d[0],d[1])||1;
 return[m[0]+d[0]/l*(BALL_R+.03),-(m[1]+d[1]/l*(BALL_R+.03))];
}
const S0:[number,number]=[6.3,.9];// the pivot's start: marked, near the D
const P0:[number,number]=[8.1,.35];// where he shows (checks out toward the ball)
const DS:[number,number]=[5.55,1.15];// the defender's start (tight, goal side)
const D0:[number,number]=[7.05,.7];// the defender at the lay-off, still tight behind him
const A0:[number,number]=[11.7,-3.3];// the ala with the ball
const A1:[number,number]=[11.3,-2.1];// the ala after stepping inside for the lay-off
const YB=yawTo(A0[0]-P0[0],A0[1]-P0[1]);// the pivot faces the ball
const YA0=yawTo(P0[0]-A0[0],P0[1]-A0[1]);// the ala faces the pivot
const LAYB=contact(LAY_C,YB,'inside'),LB:[number,number]=[P0[0]+LAYB[0],P0[1]+LAYB[1]];// the lay-off ball spot
const PASSB=contact(strike(STRIKE_CONTACT,{foot:'r',power:.45}),YA0,'toe'),AB0:[number,number]=[A0[0]+PASSB[0],A0[1]+PASSB[1]];
const SHOT:[number,number]=[4.2,2.05];// where the return pass meets his run (the ball at the finish)
const TGT:V3=[-.1,.34,-1.05];// low, inside the far post
const YS=yawTo(TGT[0]-SHOT[0],TGT[2]-SHOT[1])+TAU;// facing the far post (unwrapped: he keeps turning left)
const SB=contact(strike(STRIKE_CONTACT,{foot:'r'}),YS,'toe'),PS:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[1]];// his stance at the strike
const YA1=yawTo(SHOT[0]-A1[0],SHOT[1]-A1[1]);// the ala faces the run for the return pass
const RETB=contact(strike(STRIKE_CONTACT,{foot:'r',power:.5}),YA1,'toe'),AB1:[number,number]=[A1[0]+RETB[0],A1[1]+RETB[1]];
/** his run after the spin: out round the defender's blind side and in toward the goal (a quadratic curve to the strike stance) */
const RUN0:[number,number]=[8.05,1.35],RUNC:[number,number]=[6.9,3.3];
const runAt=(u:number):[number,number]=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*RUN0[0]+b*RUNC[0]+c*PS[0],a*RUN0[1]+b*RUNC[1]+c*PS[1]];};
const runDir=(u:number)=>{const p=runAt(Math.max(0,u-.02)),q=runAt(Math.min(1,u+.02));return yawTo(q[0]-p[0],q[1]-p[1]);};
/** unwrap a yaw near a reference (so turns go the short, intended way) */
const near=(y:number,ref:number)=>{let v=y;while(v-ref>Math.PI)v-=TAU;while(v-ref<-Math.PI)v+=TAU;return v;};
type WallT={show0:number;show1:number;pass0:number;lay:number;lay1:number;spin0:number;spin1:number;ret0:number;hit:number};
type Wall={piv:LGen;def:LGen;ala:LGen;gk:LGen;ball:(t:number)=>{u:number;y:number;v:number;flying:boolean;spin:number};inn:number;T:WallT};
function makeWall(T:WallT):Wall{
 const inn=T.hit+.32,run1=T.hit-.3;
 const YRUN0=near(runDir(0),YB+Math.PI),YSP=near(YS,runDir(1));
 const piv:LGen=t=>{
  let pose:Pose,yaw=YB,u=S0[0],v=S0[1];
  if(t<T.show0){pose=readyP(t);yaw=near(YB,0)*.5;}
  else if(t<T.show1){const w=sm(T.show0,T.show1,t,easeIO);u=lerp(S0[0],P0[0],w);v=lerp(S0[1],P0[1],w);
   const ph=(t-T.show0)*runCadence(.5);pose=blendPose(runCycle(ph,{speed:.5}),CALL,sm(T.show1-.3,T.show1,t,easeIO));yaw=lerp(yawTo(P0[0]-S0[0],P0[1]-S0[1]),YB,sm(T.show0+.3,T.show1,t,easeIO));}
  else if(t<T.lay+.5){u=P0[0];v=P0[1];pose=keyPoses(t,[[T.show1,CALL],[Math.max(T.show1+.05,T.lay-.3),blendPose(CALL,LAY_W,.6)],[T.lay-.12,LAY_W],[T.lay,LAY_C],[T.lay+.25,LAY_F],[T.lay+.5,readyP(t)]]);}
  else if(t<T.spin0){u=P0[0];v=P0[1];pose=blendPose(readyP(t),posed({lHipF:22,rHipF:18,lKnee:40,rKnee:36,lean:20,neckP:10,neckY:-30,lShA:24,rShA:24,lElb:40,rElb:40}),.6);}
  else if(t<T.spin1){const w=sm(T.spin0,T.spin1,t,easeIO);u=lerp(P0[0],RUN0[0],w);v=lerp(P0[1],RUN0[1],w);yaw=lerp(YB,YRUN0,w);
   pose=keyPoses(t,[[T.spin0,readyP(t)],[lerp(T.spin0,T.spin1,.5),SPIN],[T.spin1,runCycle(.1,{speed:.8})]]);}
  else if(t<run1){const e=sm(T.spin1,run1,t,linear),q=runAt(e);u=q[0];v=q[1];yaw=near(runDir(e),YRUN0);
   pose=runCycle(.1+(t-T.spin1)*runCadence(.8),{speed:.8});
   const s0=sm(run1-.25,run1,t,easeIO);if(s0>0){pose=blendPose(pose,strike(.22,{foot:'r'}),s0);yaw=lerp(yaw,YSP,s0);}}
  else{u=PS[0];v=PS[1];yaw=YSP;pose=strike(key(t,[[run1,.22],[T.hit,STRIKE_CONTACT],[T.hit+.5,.82],[T.hit+1.1,.95]],linear),{foot:'r'});
   const c=sm(inn+.4,inn+.9,t,easeIO);if(c>0){pose=blendPose(pose,celebrate((t-inn-.4)*1.1,{kind:'arms'}),c);yaw=lerp(YSP,YSP+1.4,c);}
   const fwd=t>T.hit?.3*sm(T.hit,T.hit+.6,t,easeOut):0;u-=fwd;}
  return{pose,yaw,u,v};};
 const def:LGen=t=>{
  let pose:Pose=PRESS,yaw=0,u=DS[0],v=DS[1];
  if(t<T.show0){pose=blendPose(readyP(t,1),PRESS,.6);}
  else if(t<T.show1+.2){const w=sm(T.show0+.1,T.show1+.2,t,easeIO);u=lerp(DS[0],D0[0],w);v=lerp(DS[1],D0[1],w);pose=blendPose(runCycle((t-T.show0)*runCadence(.4),{speed:.4}),PRESS,sm(T.show1-.2,T.show1+.2,t,easeIO));}
  else{u=D0[0];v=D0[1];}
  // after the lay-off: his head (and then his body) turn to follow the ball to the ala — he watches the ball
  const watch=sm(T.lay,T.lay+.45,t,easeIO);
  if(watch>0&&t<T.spin1+.35)pose=blendPose(pose,posed({lHipF:26,rHipF:18,lKnee:42,rKnee:38,lHipA:12,rHipA:12,lean:18,neckP:6,neckY:-44,twist:-14,lShF:30,rShF:30,lShA:22,rShA:22,lElb:50,rElb:50}),watch);
  yaw=-.45*watch;
  // too late: he turns and chases
  const late=sm(T.spin1+.35,T.spin1+.9,t,easeIO);
  if(late>0){const w=sm(T.spin1+.35,T.hit+.2,t,easeOut);u=lerp(D0[0],5.7,w);v=lerp(D0[1],1.6,w);yaw=lerp(-.45,Math.PI*.85,late);pose=blendPose(pose,runCycle((t-T.spin1)*runCadence(.55),{speed:.55}),late);}
  return{pose,yaw,u,v};};
 const ala:LGen=t=>{
  let pose:Pose,yaw=YA0,u=A0[0],v=A0[1];
  if(t<T.pass0-.35)pose=readyP(t,2);
  else if(t<T.pass0+.5)pose=strike(key(t,[[T.pass0-.35,.2],[T.pass0,STRIKE_CONTACT],[T.pass0+.5,.85]],linear),{foot:'r',power:.45});
  else if(t<T.lay1-.1){const w=sm(T.pass0+.5,T.lay1-.1,t,easeIO);u=lerp(A0[0],A1[0],w);v=lerp(A0[1],A1[1],w);yaw=lerp(YA0,yawTo(LB[0]-A1[0],LB[1]-A1[1]),w);pose=blendPose(runCycle((t-T.pass0)*runCadence(.35),{speed:.35}),readyP(t,2),sm(T.lay1-.4,T.lay1-.1,t));}
  else if(t<T.ret0-.35){u=A1[0];v=A1[1];yaw=lerp(yawTo(LB[0]-A1[0],LB[1]-A1[1]),YA1,sm(T.lay1,T.ret0-.35,t,easeIO));pose=blendPose(readyP(t,2),posed({lHipF:20,rHipF:24,lKnee:36,rKnee:30,lean:14,neckP:28,lShA:30,rShA:30,lElb:40,rElb:40}),.7);}
  else{u=A1[0];v=A1[1];yaw=YA1;pose=strike(key(t,[[T.ret0-.35,.24],[T.ret0,STRIKE_CONTACT],[T.ret0+.5,.85],[T.ret0+1.2,1]],linear),{foot:'r',power:.5});
   const c=sm(inn+.3,inn+.8,t,easeIO);if(c>0)pose=blendPose(pose,celebrate((t-inn-.3)*1.1+.4,{kind:'arms'}),c);}
  return{pose,yaw,u,v};};
 const gk:LGen=t=>{const d=sm(T.hit+.02,T.hit+.5,t,linear);let pose=keeperSet(t*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'l'});
  const shuffle=sm(T.ret0,T.hit,t,easeIO);return{pose,yaw:.35*shuffle,u:.6,v:lerp(-.2,.55,shuffle)};};
 const ballF=(t:number)=>{
  if(t<T.pass0)return{u:AB0[0],v:AB0[1],y:BALL_R,flying:false,spin:0};
  if(t<T.lay){const w=sm(T.pass0,T.lay,t,easeOut);return{u:lerp(AB0[0],LB[0],w),v:lerp(AB0[1],LB[1],w),y:BALL_R,flying:false,spin:w*12};}
  if(t<T.lay1){const w=sm(T.lay,T.lay1,t,easeOut);return{u:lerp(LB[0],AB1[0],w),v:lerp(LB[1],AB1[1],w),y:BALL_R,flying:false,spin:12+w*9};}
  if(t<T.ret0)return{u:AB1[0],v:AB1[1],y:BALL_R,flying:false,spin:21};
  if(t<T.hit){const w=sm(T.ret0,T.hit,t,x=>.4*x+.6*easeOut(x));return{u:lerp(AB1[0],SHOT[0],w),v:lerp(AB1[1],SHOT[1],w),y:BALL_R,flying:false,spin:21+w*12};}
  if(t<inn){const u=sm(T.hit,inn,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M=[lerp(SHOT[0],TGT[0],.5),.4,lerp(SHOT[1],TGT[2],.5)];
   return{u:a*SHOT[0]+b*M[0]+c*TGT[0],y:a*BALL_R+b*M[1]+c*TGT[1],v:a*SHOT[1]+b*M[2]+c*TGT[2],flying:true,spin:33+u*30};}
  const d=sm(inn+.05,inn+.35,t,easeIn),bo=Math.abs(Math.sin(sm(inn+.35,inn+1.1,t)*Math.PI*2))*.1*(1-sm(inn+.35,inn+1.1,t));
  return{u:-.62,y:lerp(TGT[1],BALL_R,d)+bo,v:TGT[2]+.05,flying:false,spin:63};};
 return{piv,def,ala,gk,ball:ballF,inn,T};
}
/** a ball drawn on stage st through frame fr, with its floor shadow (a moving ball smears back along its path) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:{u:number;y:number;v:number;flying:boolean;spin:number},prev:{u:number;y:number;v:number},seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R),[PX,PZ]=toStage(fr,prev.u,prev.v),o=proj(st,PX,prev.y,PZ),mv=Math.hypot(p[0]-o[0],p[1]-o[1]);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:mv>r*.6?Math.min(.5,mv/r*.12):0,dir:Math.atan2(p[1]-o[1],p[0]-o[0])});return{p,r};
}
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** the pivot's chest (the passage enters his navy shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
function jointPt(st:Stage,fr:Frame,l:Loc,name:'lEl'|'lHa'|'lSh'|'chest'|'pelvis'|'rToe'|'head'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** the ball path between two times, as floor points on a stage */
function ballLine(st:Stage,fr:Frame,w:Wall,t0:number,t1:number,n=12):Pt[]{const o:Pt[]=[];for(let k=0;k<=n;k++){const q=w.ball(lerp(t0,t1,k/n));o.push(fp(st,fr,q.u,q.v,q.y));}return o;}

// ================= chapter 1 — LIVE: Uragan v Araz, 28 Oct 2021. Only confirmed things: the hall, the teams, Fareniuk up front, then (cut)
// his celebration with the scoreboard at 2–0, and (cut) the final whistle at 2–1. No goal, pass or tackle of the match is staged. =================
const C1={ukr:A(0,'in Ukraine'),ura:A(0,'Uragan play'),far:A(0,'Fareniuk'),piv:A(0,'pivot'),front:A(0,'player up'),scores:A(0,'He scores'),second:A(0,'second'),win:A(0,'Uragan win'),two:A(0,'two one'),end:AUTH[0].seconds};
const W0=C1.scores-.12,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** the start (local u from Araz's goal; halfway = 20): Uragan attacking toward u → 0, Fareniuk the furthest forward */
const KO_URA:[number,number][]=[[21,.6],[23.6,-5.2],[23.2,5.4],[27.8,.3]];// Fareniuk, right ala, left ala, fixo
const KO_ARA:[number,number][]=[[18.6,-2],[16.4,4.8],[16.2,-4.8],[13.4,.4]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
const CEL:[number,number]=[9.4,-2.8];
const CEL_IN:[number,number][]=[[14.8,1.6],[16,-6.4],[21.4,.6]];
const FIN:[number,number]=[15.2,.2];// the final whistle: Uragan in a knot
function kickoffGen(i:number,team:'ura'|'ara'):LGen{const p=(team==='ura'?KO_URA:KO_ARA)[i];return t=>({pose:idle(t,i+(team==='ura'?0:.37)),yaw:team==='ura'?Math.PI:0,u:p[0],v:p[1]});}
const liveF:LGen=T=>{
 if(T<WM)return kickoffGen(0,'ura')(T);
 if(T<VM){const c=celebrate((T-WM)*1.1,{kind:'arms'});return{pose:c,yaw:-Math.PI/2+.4*Math.sin((T-WM)*1.4),u:CEL[0],v:CEL[1]};}
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2-.35,u:FIN[0]+.3,v:FIN[1]-1.1};};
const liveUra=(i:number):LGen=>T=>{
 if(T<WM)return kickoffGen(i+1,'ura')(T);
 if(T<VM){const a=CEL_IN[i],go=sm(WM,VM-.6,T,easeOut),tgt:[number,number]=[CEL[0]+[.9,-.8,1.1][i],CEL[1]+[-.9,.8,.9][i]],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(CEL[0]-u,CEL[1]-v),u,v};}
 const spot:[number,number][]=[[FIN[0]-.9,FIN[1]+1.1],[FIN[0]+.8,FIN[1]+1.3],[FIN[0]-.6,FIN[1]-1.9]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.2,.5][i],u:spot[i][0],v:spot[i][1]};};
const liveAra=(i:number):LGen=>T=>{if(T<WM)return kickoffGen(i,'ara')(T);
 const base:[number,number]=T<VM?[[5.2,3.6],[6.4,-6.2],[3.2,-.9],[12.4,5.8]][i] as [number,number]:[[19.6,5.8],[21.8,-6.6],[23.4,2.6],[18.2,7.4]][i] as [number,number];
 return{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24}),yaw:T<VM?(i%2?.7:-.5):Math.PI*.8,u:base[0],v:base[1]};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:16,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),yaw:.4,u:.8,v:-.4};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
const liveCam=(T:number)=>({x:key(T,mono([[0,-.5],[C1.ura,0],[C1.far,.4],[C1.front,-.8],[W0,-1.6],[W1,-10.6],[C1.second,-10.8],[V0,-10.9],[V1,-5.2],[C1.end,-5]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.ura,.58],[C1.far+.2,.86],[C1.piv,.95],[C1.front,.9],[W0,.9],[W1,.86],[C1.second,.92],[V0,.94],[V1,1.02],[C1.end,1.08]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.far+.2,1000],[C1.front,1010],[W1,990],[V0,990],[V1,960],[C1.end,950]]),easeInOutSine)});
/** seven-segment digits on the hall scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'2':[0,2,3,4,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,glow:number){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;// Uragan left (a paper tab: their black shirts), Araz right (a red tab)
 const tab=(x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);return p;};s.knockout(tab(cx-W*.38));s.fill(R,tab(cx+W*.22));
 digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);s.fill(Y,lit);
 if(glow>.02){const ring=blob(cx-W*.3+h*.27,y+h/2,h*.75*(1+.3*(1-glow)),h*.7*(1+.3*(1-glow)),133,{n:22});s.fill(R,ribbon([...ring,ring[0]],9,{seed:134,close:true,wobble:1}),glow);}
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:T<VM?1:2;
 courtSide(s,st,T,{cheer:phase===0?.1:phase===1?.9:1,flash:phase===1?pulse(T,WM,1.2):phase===2?pulse(T,VM,1.2)+.6*pulse(T,C1.two,1.2):0,crowd:.42,
  keeper:()=>{athlete(s,st,FA,liveGK,T,ARA_GK,{detail:'low'});}});
 if(phase>0)scoreboard(s,st,c.x,phase===1?'2-0':'2-1',phase===1?pulse(T,C1.second,1.4):pulse(T,C1.two,1.4));
 const items:Item[]=[];
 KO_ARA.forEach((_,i)=>{const g=liveAra(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ARA(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveUra(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,URA(i),{detail:'low'})});});
 items.push({z:depth(FA,liveF(T))-.02,draw:()=>athlete(s,st,FA,liveF,T,FAR,{detail:'mid'})});
 if(phase===0)items.push({z:10,draw:()=>{const q={u:20,y:BALL_R,v:0,flying:false,spin:0};drawBallL(s,st,FA,q,q,18);}});
 // "pivot": a red dashed ring under him; "player up front": an arrow from him toward Araz's goal (he is Uragan's furthest player forward)
 if(phase===0){const l=liveF(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.piv,C1.piv+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,R,X,Z,1.15,14,51,g);}});
  const ar=sm(C1.front,C1.front+.5,T,easeOut)*(1-sm(W0-.3,W0,T));if(ar>.02)items.push({z:Z+.8,draw:()=>{const pts=[fp(st,FA,l.u-.9,l.v),fp(st,FA,l.u-2.6,l.v-.1),fp(st,FA,l.u-4.4,l.v)];cased(s,pts,16,52,{dash:50,progress:ar});if(ar>.9)casedHead(s,pts,46,53);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "in Ukraine": a blue-over-yellow pennant stamps above the hall; "Uragan play Araz": two team tabs (navy v red) under it
 const pen=easeOutBack(sm(C1.ukr,C1.ukr+.4,T))*(1-sm(C1.far,C1.far+.4,T));
 if(pen>.02){const top=proj(st,c.x,0,BOARDS)[1]-2.6*kAt(st,BOARDS),x=0,w=260*pen,h=170*pen,f=polyPath(handCut([[x-w/2,top-h],[x+w/2,top-h],[x+w/2,top],[x-w/2,top]],141,3,60),true),hi=polyPath([[x-w/2,top-h],[x+w/2,top-h],[x+w/2,top-h/2],[x-w/2,top-h/2]],true);
  const lo=polyPath([[x-w/2,top-h/2],[x+w/2,top-h/2],[x+w/2,top],[x-w/2,top]],true);s.knockout(f);s.fill(Y,lo);s.fill(B,hi);s.fill(K,ribbon(handCut([[x-w/2,top-h],[x+w/2,top-h],[x+w/2,top],[x-w/2,top]],141,3,60).concat([[x-w/2,top-h]]),6,{seed:142,wobble:1}),.9);
  const tb=sm(C1.ura,C1.ura+.35,T,easeOut);if(tb>.02)for(const[k,ink]of[[-1,K],[1,R]]as[number,string][]){const q=polyPath(blob(x+k*(w/2+90)*tb,top-h/2,70*tb,70*tb,143+k,{n:20}),true);s.knockout(q);s.fill(ink,q);}}
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveF(tt),.14));},still:C1.front+.3};

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, side-on): show, play it back, spin away, get it back, score =================
const C2={pivot:A(1,'A pivot'),links:A(1,'links'),how:A(1,'This is'),shows:A(1,'shows'),plays:A(1,'plays'),spins:A(1,'spins'),gets:A(1,'gets'),scores:A(1,'scores'),end:AUTH[1].seconds};
const T2:WallT=(()=>{const show0=C2.shows-.15,show1=show0+.8,pass0=C2.shows+.35,lay=Math.max(C2.plays+.12,pass0+1),lay1=lay+.72,spin0=Math.max(lay+.4,C2.spins-.35),spin1=spin0+.42,
 ret0=Math.max(lay1+.25,C2.gets-.05),hit=Math.max(C2.scores+.05,ret0+1.05,spin1+1.3);return{show0,show1,pass0,lay,lay1,spin0,spin1,ret0,hit};})();
const wall2=makeWall(T2);
const st2=(cx:number):Stage=>({F:3000,eye:2.6,cx,cz:-.4});
/** the camera follows the move along the side: [time, stage cx (m), y, zoom] */
const cam2=(t:number)=>key(t,padKeys(mono([[0,-10.9,440,.54],[C2.links,-10.9,440,.56],[C2.how,-11,440,.58],[C2.how+.9,-12.6,410,.86],[C2.shows,-11.8,410,.8],[T2.lay,-10.6,420,.66],[T2.spin0,-11.8,410,.84],[T2.spin1+.4,-13.2,420,.82],[T2.hit,-16.2,430,.8],[wall2.inn+.6,-16.8,430,.82],[C2.end,-16.8,430,.84]]),[0,-10,420,.8]),easeInOutSine,true);
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),c=cam2(t),st=st2(c[0]),w=wall2,T=T2,inn=w.inn,hit=pulse(t,T.hit,.35);
  cam(s,5*hit*Math.sin(t*80),c[1],c[2]);
  const goal=tt>=inn;
  courtSide(s,st,tt,{cheer:goal?.6:0,flash:pulse(tt,inn,1.2),crowd:.2,bulge:.5*sm(inn-.1,inn,tt)*(1-.6*sm(inn+.3,inn+1.2,tt))+.1*settle(tt,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FA,w.gk,tt,DEMO_GK,{detail:'auto'});}});
  const piv=w.piv(tt),[,PZ]=toStage(FA,piv.u,piv.v);
  // "A pivot": the navy/red ring under him; "links": a yellow dashed link between him and the ala
  const rg=easeOutBack(sm(C2.pivot,C2.pivot+.35,tt))*(1-sm(C2.shows-.2,C2.shows+.2,tt));
  if(rg>.02){const[X,Z]=toStage(FA,piv.u,piv.v);floorDashRing(s,st,K,X,Z,.9,20,201,rg);floorDashRing(s,st,R,X,Z,.9,12,202,rg);}
  const lk=sm(C2.links,C2.links+.6,tt,easeOut)*(1-sm(C2.shows,C2.shows+.3,tt));
  if(lk>.02){const a=w.ala(tt),p1=fp(st,FA,piv.u,piv.v),p2=fp(st,FA,a.u,a.v),m:Pt=[(p1[0]+p2[0])/2,(p1[1]+p2[1])/2+40];cased(s,[p1,m,p2],12,203,{dash:40,progress:lk});}
  // "shows for the pass": a yellow arrow of his check run out toward the ball
  const sh=sm(C2.shows,C2.shows+.5,tt,easeOut)*(1-sm(T.lay+.2,T.lay+.6,tt));
  if(sh>.02){const pts=[fp(st,FA,S0[0]+.2,S0[1]),fp(st,FA,lerp(S0[0],P0[0],.5),lerp(S0[1],P0[1],.5)-.1),fp(st,FA,P0[0]+.5,P0[1])];cased(s,pts,12,204,{dash:36,progress:sh});if(sh>.9)casedHead(s,pts,34,205);}
  // "plays it back": the lay-off line; "spins away": the yellow spin arc; "gets it back": the return line; "scores": the shot line
  if(tt>T.lay)cased(s,ballLine(st,FA,w,T.lay,Math.min(tt,T.lay1)),10,206,{dash:34});
  const sp=sm(T.spin0-.05,T.spin0+.4,tt,easeOut)*(1-sm(T.hit+.3,T.hit+.8,tt));
  if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=YB+.3+k/14*2.8;pts.push(fp(st,FA,P0[0]+Math.cos(a)*1.2,P0[1]+Math.sin(a)*1.2));}cased(s,pts,12,207,{dash:34,progress:sp});if(sp>.9)casedHead(s,pts,32,208);}
  if(tt>T.ret0)cased(s,ballLine(st,FA,w,T.ret0,Math.min(tt,T.hit)),10,209,{dash:34});
  if(tt>T.hit)cased(s,ballLine(st,FA,w,T.hit,Math.min(tt,inn)),10,210,{dash:36});
  const b=w.ball(tt),bp=w.ball(tt-1/12);
  const items:Item[]=[
   {z:depth(FA,w.def(tt)),draw:()=>athlete(s,st,FA,w.def,tt,DEMO_D,{detail:'auto'})},
   {z:depth(FA,w.ala(tt)),draw:()=>athlete(s,st,FA,w.ala,tt,DEMO_A,{detail:'auto',smear:Math.abs(tt-T.pass0)<.18||Math.abs(tt-T.ret0)<.18?.12:0})},
   {z:PZ-.001,draw:()=>athlete(s,st,FA,w.piv,tt,FAR_T,{detail:'high',smear:(tt>T.spin0&&tt<T.spin1+.05)||(tt>T.hit-.15&&tt<T.hit+.2)?.14:0})},
   {z:depth(FA,b)-.02,draw:()=>{drawBallL(s,st,FA,b,bp,211);if(tt>=T.lay&&tt<T.lay+.35){const p=fp(st,FA,LB[0],LB[1],.15);sparkBurst(s,Y,p[0],p[1],90,{n:8,seed:212,g:easeOut(sm(T.lay,T.lay+.25,tt))});}
    if(tt>=T.hit&&tt<T.hit+.35){const p=fp(st,FA,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],110,{n:9,seed:213,g:easeOut(sm(T.hit,T.hit+.25,tt))});}}},
  ];
  items.sort((a,c2)=>c2.z-a.z).forEach(it=>it.draw());
  // "shows": a red ring on his pointing arm ("to my feet")
  const ca=easeOutBack(sm(T.show1-.1,T.show1+.25,tt))*(1-sm(T.lay-.2,T.lay+.1,tt));
  if(ca>.02){const e=jointPt(st,FA,piv,'lEl'),h=jointPt(st,FA,piv,'lHa'),m:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2],r=kAt(st,PZ)*.3*ca;s.fill(R,ribbon(blob(m[0],m[1],r,r*.8,221,{n:22}),9,{seed:222,close:true,wobble:1}),1);}
  if(tt>=inn&&tt<inn+1.2){const p=fp(st,FA,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],140,{n:12,seed:230,g:easeOut(sm(inn,inn+.3,tt))*(1-sm(inn+.8,inn+1.2,tt))});}
 },
 aperture(t0){const{tt,tc}=clock(1,t0);return aperture(chestPts(st2(cam2(tc)[0]),FA,wall2.piv(tt),.13));},
 still:C2.shows+.9,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: low, behind the ala's shoulder, the goal beyond) =================
const C3={watch:A(2,'Watch'),def:A(2,'defender'),ball:A(2,'the ball'),nobody:A(2,'nobody'),spin:A(2,'his spin'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.show1-.25],[C3.def,T2.lay-.05],[C3.ball,T2.lay+.45],[C3.nobody,T2.spin0],[C3.spin,T2.spin1+.15],[C3.end-.9,wall2.inn+.3],[C3.end,wall2.inn+.9]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const piv3=g3(wall2.piv),def3=g3(wall2.def),ala3=g3(wall2.ala),gk3=g3(wall2.gk);
const st3:Stage={F:1400,eye:1.5,cx:1.2,cz:0};
/** the head of the defender (for the eye-line) */
const headPt=(st:Stage,fr:Frame,l:Loc)=>jointPt(st,fr,l,'head');
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,q=seq3(tt),w=wall2,T=T2,inn=w.inn,hit=pulse(q,T.hit,.4);
  camPath(s,t,[[0,-520,150,.84],[C3.def,-420,140,.9],[C3.ball,-500,150,.86],[C3.nobody,-300,130,.92],[C3.spin,300,190,.86],[C3.end-.9,1150,230,.84],[C3.end,1170,230,.85]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.8:0,flash:goal?pulse(q,inn,1.2):0,crowd:.2,bulge:.55*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q))+.1*settle(q,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk3,tt,DEMO_GK,{detail:'auto'});}});
  const piv=piv3(tt),df=def3(tt),[,PZ]=toStage(FB,piv.u,piv.v);
  // "nobody follows": a yellow dashed ring on the empty space behind the defender; "his spin": the run drawn into it
  const sp=easeOutBack(sm(C3.nobody,C3.nobody+.4,tt))*(1-sm(C3.end-1,C3.end-.6,tt));
  if(sp>.02){const[X,Z]=toStage(FB,RUNC[0]-.4,RUNC[1]-.3);floorDashRing(s,st,K,X,Z,1.1,20,301,sp);floorDashRing(s,st,Y,X,Z,1.1,12,302,sp);}
  const rn=sm(C3.spin,C3.spin+.8,tt,easeOut)*(1-sm(C3.end-1,C3.end-.6,tt));
  if(rn>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const p=runAt(k/14);pts.push(fp(st,FB,p[0],p[1]));}cased(s,[fp(st,FB,P0[0],P0[1]),...pts],12,303,{dash:36,progress:rn});if(rn>.9)casedHead(s,pts,34,304);}
  if(q>T.lay)cased(s,ballLine(st,FB,w,T.lay,Math.min(q,T.lay1)),14,305,{dash:36});
  if(q>T.ret0)cased(s,ballLine(st,FB,w,T.ret0,Math.min(q,T.hit)),14,306,{dash:36});
  if(q>T.hit)cased(s,ballLine(st,FB,w,T.hit,Math.min(q,inn)),14,307,{dash:36});
  const b=w.ball(q),bp=w.ball(q-1/24);
  const items:Item[]=[
   {z:depth(FB,df),draw:()=>athlete(s,st,FB,def3,tt,DEMO_D,{detail:'auto'})},
   {z:depth(FB,ala3(tt)),draw:()=>athlete(s,st,FB,ala3,tt,DEMO_A,{detail:'auto'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FB,piv3,tt,FAR_T,{detail:'high',smear:(q>T.spin0&&q<T.spin1+.1)||(q>T.hit-.2&&q<T.hit+.2)?.45:0})},
   {z:depth(FB,b)-.02,draw:()=>{drawBallL(s,st,FB,b,bp,311,10);if(q>=T.hit&&q<T.hit+.35){const p=fp(st,FB,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:312,g:easeOut(sm(T.hit,T.hit+.25,q))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "the defender watches the ball": a red dashed eye-line from his head to the ball, tracking it
  const ey=sm(C3.def,C3.def+.3,tt,easeOut)*(1-sm(C3.spin+.4,C3.spin+.9,tt));
  if(ey>.02){const h=headPt(st,FB,df),bb=w.ball(q),p=fp(st,FB,bb.u,bb.v,bb.y);dashed(s,K,[h,L2(h,p,.5),p],22,321,{dash:40,progress:ey,ko:false,cov:.9});dashed(s,R,[h,L2(h,p,.5),p],13,321,{dash:40,progress:ey});
   const eg=easeOutBack(sm(C3.ball,C3.ball+.35,tt))*(1-sm(C3.spin+.4,C3.spin+.9,tt));if(eg>.02){const r=kAt(st,depth(FB,bb))*.3*eg;s.fill(R,ribbon(blob(p[0],p[1],r,r,322,{n:18}),8,{seed:323,close:true,wobble:1}),1);}}
  if(q>=inn&&q<inn+1.2){const p=fp(st,FB,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:330,g:easeOut(sm(inn,inn+.3,q))*(1-sm(inn+.8,inn+1.2,q))});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FB,piv3(tt),.13));},
 still:C3.nobody+.25,
};

// ================= chapter 4 — YOUR TURN: he runs the move again; three cards (show, play it back, spin away); a tick =================
const C4={your:A(3,'Your'),show:A(3,'show for'),play:A(3,'play it'),spin:A(3,'spin away'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.show0-.3],[C4.show,T2.show0+.1],[C4.play,T2.lay],[C4.spin,T2.spin0+.05],[C4.end-.2,wall2.inn+1.1]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const piv4=g4(wall2.piv),def4=g4(wall2.def),ala4=g4(wall2.ala),gk4=g4(wall2.gk);
const st4:Stage={F:1300,eye:2.5,cx:1.6,cz:-2.5};
const CARD_Y=770,CARD_W=175,CARDS:[number,number,'show'|'play'|'spin'][]=[[-420,C4.show,'show'],[0,C4.play,'play'],[420,C4.spin,'spin']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt),w=wall2,T=T2,inn=w.inn;
  camPath(s,t,[[0,-120,180,.95],[C4.your+.4,200,340,.82],[C4.spin,220,340,.82],[C4.end,220,336,.83]]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.9*(1-sm(C4.end-1,C4.end,tt)):0,flash:goal?pulse(q,inn,1.2):0,crowd:.2,bulge:.5*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q)),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk4,tt,DEMO_GK,{detail:'auto'});}});
  const piv=piv4(tt),[,PZ]=toStage(FB,piv.u,piv.v),b=w.ball(q),bp=w.ball(q-1/12);
  const items:Item[]=[
   {z:depth(FB,def4(tt)),draw:()=>athlete(s,st,FB,def4,tt,DEMO_D,{detail:'auto'})},
   {z:depth(FB,ala4(tt)),draw:()=>athlete(s,st,FB,ala4,tt,DEMO_A,{detail:'auto'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FB,piv4,tt,FAR_T,{detail:'high',smear:q>T.spin0&&q<T.spin1+.05?.2:0})},
   {z:depth(FB,b)-.02,draw:()=>{drawBallL(s,st,FB,b,bp,411,10);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (show, play it back, spin away)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+10,y:gy+25,height:330*(.9+.1*on),azimuth:kind==='show'?60:kind==='play'?80:-30,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='show'?CALL:kind==='play'?LAY_C:SPIN;
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // show = a yellow arrow toward the viewer's ball side (checking out); play = the ball and a short arrow back; spin = a yellow spin arc
    if(kind==='show'){const pts=[P([-.6,0,.2]),P([.1,0,.1]),P([.8,0,0])];dashed(s,Y,pts,8,84,{dash:22});arrowHead(s,Y,pts,22,85);}
    if(kind==='spin'){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=-k/10*2.4;pts.push(P([Math.cos(a)*.7,0,Math.sin(a)*.7]));}dashed(s,Y,pts,8,86,{dash:22});arrowHead(s,Y,pts,22,87);}
    if(kind==='play'){const m=[lerp(csk.rAn[0],csk.rToe[0],.55),BALL_R,lerp(csk.rAn[2],csk.rToe[2],.55)-(BALL_R+.03)] as V3,p0=P(m),p1=P([m[0]+1.5,.1,m[2]-.3]),pts:Pt[]=[p0,L2(p0,p1,.5),p1];dashed(s,Y,pts,8,88,{dash:22});arrowHead(s,Y,pts,24,89);const bR=BALL_R*(fc.scale?fc.scale(m):100);ball(s,p0[0],p0[1],bR,81+i);}
    drawAthlete(s,pose,fc,{...FAR_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='show'){const e=P(csk.lEl),h=P(csk.lHa),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2];s.fill(R,ribbon(blob(c[0],c[1],34*on,28*on,90+i,{n:18}),6,{seed:93+i,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "spin away": a big tick (yellow over red, navy echo) stamps beside him as the move ends
  const tick=easeOutBack(sm(C4.spin+.9,C4.spin+1.25,tt));
  if(tick>.02){const g=fp(st,FB,piv.u,piv.v),h=kAt(st,PZ)*1.8,c:Pt=[g[0]+h*.62,g[1]-h*.8],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.play+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'fareniuk-futsal-signature',format:'futsal',title:'Fareniuk links the play',theme:'Show for the pass, then play it back and spin away.',
 ageNote:'For players aged 7–12: the 2021 match and Fareniuk’s goal are real; the wall pass is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in, bounces back off a foot mark, and a curved spin arrow flicks round; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const go=sm(0,.25,age,easeOut),back=sm(.25,.5,age,easeOut),bx=x+140*(1-go)+90*back;
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:(1-go)*6-back*3});
  const sp=sm(.4,.8,age,easeOut)*(1-sm(.95,1.25,age));if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=-.4-k/12*3.4*sp;pts.push([x+Math.cos(a)*r*1.9,y+Math.sin(a)*r*1.2]);}s.fill(Y,ribbon(pts,10,{seed,taper:.3,wobble:1}),1);s.fill(R,ribbon(pts.map(p=>[p[0]+4,p[1]+4] as Pt),4,{seed:seed+1,taper:.3,wobble:1}),.6);}
 },
};
export default film;
