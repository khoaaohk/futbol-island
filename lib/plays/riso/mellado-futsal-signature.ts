/** Mellado — "the sole-roll 1v1": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Miguel Ángel Cano Mellado ("Mellado", b. 23 Jul 1999, Blanca, Murcia), a Spanish ala / ala-cierre of Jimbee Cartagena, Spain #13
 * (lib/town/playerBios.json: "Spanish ala from Murcia … Jimbee Cartagena … European champion with Spain in 2026").
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the sole-roll 1v1 from the left, with a drag-back — not one match.
 * No written source we could reach describes HOW any Mellado goal or dribble was scored (the Wikipedia match boxes give scorer + minute; the
 * press reports we found are behind opaque news-aggregator links), so the film follows the brief's honest FALLBACK: the real-match chapter
 * shows ONLY confirmed things and never stages a goal, a pass or a dribble inside that match; the move is a separate, clearly labelled
 * demonstration ("Watch how he does it", training top, neutral defender and keeper). The match: his winning-margin goal in the UEFA Futsal
 * EURO 2026 SEMI-FINAL v Croatia (the tournament he won and was named in the team of the tournament as a wing). The other futsal films use
 * the 2026 FINAL (Dídac Plana, Pauleta, Ricardo Mayor), so this film uses the semi-final.
 *  1  LIVE (broadcast camera, main stand, real time), CONFIRMED THINGS ONLY: 4 Feb 2026, Arena Stožice, Ljubljana, Croatia 1–2 Spain.
 *     The board reads 1–0 at 12:57 (Pablo Ramírez's goal) and Croatia restart from the centre (after a goal the team that conceded kicks
 *     off: a law of the game); Mellado on Spain's left wing (a ring, and his lane drawn). Whip pan (a cut in time) to the celebration of his
 *     goal: the board reads 2–0 at 18:42, the ball already in the net, Mellado wheeling away, team-mates chasing him. Whip pan to the end:
 *     2–1, Spain jump, Croatia's heads drop. HOW the 18'42" goal was scored is unknown and is not shown.
 *  2  HOW HE DOES IT (a demonstration, real time, lower camera on the near touchline; no match claimed): along the LEFT wing he puts his
 *     RIGHT sole on the ball, rolls it across to his left (toward the touchline), the defender follows, he drags it back and cuts inside.
 *  3  WATCH AGAIN (slow-motion replay of the demonstration, low, from behind him with the goal ahead): sole on top, roll, drag back, go.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Roll the ball with the sole of your foot to keep it close in tight spaces."): he rolls
 *     it slowly between two cones; three cards (sole, roll, drag); a tick.
 * Sources (written; fetched with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Futsal Euro 2026" (raw; wiki-futsal-euro-2026.txt): semi-final 4 Feb 2026, 17:00, Arena Stožice, Ljubljana,
 *    attendance 6,456; Croatia 1–2 Spain; goals Ramírez 12'57", Mellado 18'42", Rivillos 36'29" (o.g.); team of the tournament: Wing —
 *    Miguel Mellado (Spain); Mellado also scored v Slovenia (6'02"), Belarus (5'20") and Belgium (26'57"). — https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2026
 *  - Wikipedia, "Miguel Ángel Mellado" (raw; wiki-mellado-futsal.txt): born 23 Jul 1999, Blanca; Jimbee Cartagena since 2018 (club no. 13);
 *    Spain debut 5 Nov 2020; UEFA Futsal Euro 2026 winner (team of the tournament), bronze 2022. — https://en.wikipedia.org/wiki/Miguel_%C3%81ngel_Mellado
 *  - Wikipedia (es), "Selección de fútbol sala de España" (raw; eswiki-seleccion-futsal-espana.txt): Euro 2026 squad — dorsal 13 Mellado,
 *    ala-cierre, 26, Jimbee Cartagena; kits: home red shirt / blue shorts / red socks, away all white.
 *  - UEFA.com, "Finale UEFA Futsal EURO 2026: Portogallo - Spagna 3-5" (7 Feb 2026; cached): Spain won the final; Mellado in Spain's five.
 *  - Google News RSS (headlines only, 4–5 Feb 2026): El País "España desarticula el muro de Croacia y se mete en su décima final…";
 *    Cadena SER "España … se mete en la final … tras derrotar a Croacia"; El Periódico "España sufre, resiste y se mete en la final…".
 *    The articles themselves could not be opened (opaque redirect links), so no goal description was available.
 * CONFIRMED: competition, round, date, venue, the score line (1–0 at 12'57" → 2–0 at 18'42" → 2–1 at the end), that Mellado scored the
 *  second goal, Spain reaching (and later winning) the final, Mellado's shirt number (13), club, birthplace, his role (ala / wing).
 * INFERRED (never named in the narration): the kits (Spain in their red home shirts / blue shorts / red socks; Croatia, the first-named
 *  side, drawn in a navy change strip because the riso figures cannot print their red-and-white checks; keepers in yellow / dark); the
 *  blue court; which end; where everyone stood at the restart; where the celebration happened and who ran to him; the board's look;
 *  Mellado's hair (short, dark) and build; his foot for the move (RIGHT sole, rolling toward the touchline, then cutting inside — a
 *  natural choice for an ala on the left); the defender's reaction. No video was reviewed. Chapters 2–4 are a demonstration.
 * Technique (poses): the sole sits flat on top of the ball, the standing knee bent, head over the ball; the roll carries the sole across
 *  the body so the ball turns under it (it never leaves the foot); when the defender shifts his weight, the same sole pulls the ball back
 *  and the first touch pushes it the other way.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the roll and the drag). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across, −v =
 *  the attacker's left when he faces the goal); each stage maps it with a proper rotation (no mirror), so the right sole stays the right
 *  sole. Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z. The sole poses are the approved Falcão film's
 *  left-foot poses passed through mirrorPose() (the right foot).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (lights, diagrams, keeper), red (Spain shirts/socks, post bands, arrows), blue (court, Spain shorts), navy (key line,
 *  run-off, stands, Croatia).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,celebrate,posed,blendPose,keyPoses,mirrorPose,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the Euro 2026 semi-final',text:'The 2026 Futsal Euro semi-final, in Ljubljana. Spain play Croatia. Mellado is Spain’s ala, a wide player. He scores the second goal, and Spain win two to one!',tail:2.4,
  cues:['The 2026','in Ljubljana','Spain play','Mellado','wide player','He scores','second goal','Spain win','two to one'],heads:{'The 2026':'Semi-final 2026','second goal':'2–0','two to one':'2–1'}},
 {label:'How he does it',text:'His trick is the sole roll. Watch how he does it, from the left wing. Sole on the ball, roll it across, and the defender follows. Drag it back, and he is away!',tail:2,
  cues:['His trick','sole roll','Watch how','left wing','Sole on','roll it across','defender follows','Drag it back','he is away'],heads:{'sole roll':'The sole roll','he is away':''}},
 {label:'Watch again',text:'Watch again, slowly. Sole on top, roll, drag back, go!',tail:2.2,
  cues:['Watch again','Sole on top','roll','drag back','go'],heads:{'Watch again':'Slow motion','go':''}},
 {label:'Your turn',text:'Your turn: roll the ball with the sole of your foot. Keep it close in tight spaces!',tail:2.8,
  cues:['Your turn','roll the ball','sole of your foot','Keep it close','tight spaces'],heads:{'Your turn':'Sole roll','tight spaces':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/mellado-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/mellado-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/mellado-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mellado: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('mellado: no cue '+w);return c.at;};
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

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the blue court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
/** a navy-cased yellow dashed line (reads on the blue court and on the stands) */
function cased(s:Sheet,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){dashed(s,K,pts,width*1.8,seed,{...o,ko:false,cov:.9});dashed(s,Y,pts,width,seed,{...o});}
function casedHead(s:Sheet,pts:Pt[],size:number,seed:number){arrowHead(s,K,pts,size*1.35,seed,.9);arrowHead(s,Y,pts,size,seed);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- the LOCAL court frame: u = metres out from the goal line (0 = the line), v = across (0 = the goal's centre) ----------------
type Frame={ox:number;oz:number;rot:number};
const toStage=(fr:Frame,u:number,v:number):[number,number]=>{const c=Math.cos(fr.rot),sn=Math.sin(fr.rot);return[fr.ox+u*c-v*sn,fr.oz+u*sn+v*c];};
type Loc={pose:Pose;yaw:number;u:number;v:number};
type LGen=(t:number)=>Loc;
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** clip a floor polygon (stage X,Z) to Z ≥ zmin (one Sutherland–Hodgman plane), so near-camera corners never flip */
function clipZ(pts:[number,number][],zmin:number):[number,number][]{const out:[number,number][]=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ia=a[1]>=zmin,ib=b[1]>=zmin;if(ia)out.push(a);if(ia!==ib){const u=(zmin-a[1])/(b[1]-a[1]);out.push([lerp(a[0],b[0],u),zmin]);}}return out;}
function floorPoly(st:Stage,fr:Frame,loc:[number,number][]):Pt[]{return clipZ(loc.map(([u,v])=>toStage(fr,u,v)),st.cz+.45).map(([X,Z])=>proj(st,X,0,Z));}
/** a painted line along local points: densified, clipped in front of the camera, split into runs */
function lineRuns(st:Stage,fr:Frame,loc:[number,number][],hw:number,into:Path2D){
 const zmin=st.cz+.6;let run:Pt[]=[];const flush=()=>{if(run.length>1)into.addPath(polyPath(floorStrip(st,run,hw),true));run=[];};
 for(let i=0;i<loc.length;i++){const a=loc[i],b=loc[Math.min(loc.length-1,i+1)],n=i===loc.length-1?1:Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.2));
  for(let k=0;k<n;k++){if(i===loc.length-1&&k>0)break;const u=k/n,w=toStage(fr,lerp(a[0],b[0],u),lerp(a[1],b[1],u));if(w[1]>=zmin)run.push(w);else flush();}}
 flush();
}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
/** yaw that faces the local floor direction (du,dv) (library yaw 0 faces +u; + turns toward +v) */
const yawTo=(du:number,dv:number)=>Math.atan2(dv,du);
const SKIN:InkFill[]=[[Y,.84],[R,.3]];
const BUILD={height:1.76,bulk:.98};
/** Mellado: Spain #13 (es.wikipedia Euro 2026 squad) — red shirt, blue shorts, red socks (Spain's home kit; worn that day: inferred) */
const MELLADO:AthleteStyle={shirt:R,shorts:B,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:Y,number:13,numberInk:Y,hairStyle:'short',build:BUILD,seed:13};
/** Mellado in the demonstration: a red training top with no number (no match is claimed) */
const MELLADO_T:AthleteStyle={...MELLADO,number:undefined,trim:K,shorts:K};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:B,socks:R,boots:K,skin:[[Y,.76],[R,.24]],hair:K,line:K,trim:Y,hairStyle:(['short','curly','balding'] as const)[n%3],build:{height:1.7+hash(n,4)*.14},seed:40+n});
/** Croatia (first-named): a navy change strip, paper shorts (inferred; the red-and-white checks cannot be printed by the figure library) */
const CRO=(n:number):AthleteStyle=>({shirt:K,shorts:'paper',socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,3)*.12},seed:20+n});
const CRO_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
/** the demonstration players: a neutral paper/navy training kit and a dark keeper, no team is claimed */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
const DEMO_GK:AthleteStyle={shirt:[K,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.8},seed:78};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-1/12),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc){const sk=solve(l.pose,BUILD,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number}={}){
 const{rot=0}=o,pts=blob(x,y,r,r,seed,{amp:.025,n:36}),disc=polyPath(pts,true);s.knockout(disc);
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
/** a ball on the floor (local u,v; height y) with its ground shadow */
function ballL(s:Sheet,st:Stage,fr:Frame,u:number,y:number,v:number,seed:number,o:{rot?:number;min?:number}={}){const[X,Z]=toStage(fr,u,v),p=proj(st,X,y,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:o.rot});return{p,r};}

// ---------------- the arena: stands, blue court, futsal goal ----------------
/** stepped navy rows, lit faces, red / yellow / paper shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),pap=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.26)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)pap.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.knockout(pap);s.fill(Y,yel);s.fill(R,reds);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** convex hull of a few points (goal quads seen from any angle stay clean) */
function convex(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
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
type CourtOpt={cheer?:number;flash?:number;keeper?:()=>void;wallZ:number;goal?:boolean};
/** the court on any frame: navy-tinted run-off, the blue 40 × 20 m court, paper lines, boards + ads at a constant-Z wall, the stands, the goal */
function court(s:Sheet,st:Stage,fr:Frame,t:number,o:CourtOpt){
 const{cheer=0,flash=0,wallZ,goal=true}=o,span=9000,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const c=floorPoly(st,fr,[[0,-10],[40,-10],[40,10],[0,10]]);if(c.length>2){const cp=polyPath(c,true);s.knockout(cp,.25);s.fill(B,cp,.82);}
 const lines=new Path2D(),arc:[number,number][]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 const cc:[number,number][]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([20+Math.cos(a)*3,Math.sin(a)*3]);}
 for(const seg of[[[0,-10],[0,10]],[[0,-10],[40,-10]],[[0,10],[40,10]],[[20,-10],[20,10]],arc,cc] as [number,number][][])lineRuns(st,fr,seg,.05,lines);
 for(const u of[6,10,20]){const[X,Z]=toStage(fr,u,0);if(Z>st.cz+.8)lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.82);
 const ads=new Path2D();for(let i=-14;i<14;i++){const xa=Math.floor(st.cx/3)*3+i*3,x0=proj(st,xa+.3,0,wallZ)[0],x1=proj(st,xa+2.4,0,wallZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.72);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 if(goal){goalNet(s,st,fr);o.keeper?.();goalPosts(s,st,fr);}else o.keeper?.();
}

// ================= chapter 1 — LIVE: Euro 2026 semi-final, Ljubljana. CONFIRMED THINGS ONLY: the restart at 1–0 (12:57), his goal's
// celebration at 2–0 (18:42), the end at 2–1. No goal, pass or dribble of the match is staged. =================
const C1={lj:A(0,'in Lj'),play:A(0,'Spain play'),mel:A(0,'Mellado'),wide:A(0,'wide'),scores:A(0,'He scores'),second:A(0,'second'),win:A(0,'Spain win'),two:A(0,'two to'),end:AUTH[0].seconds};
/** two whip pans (cuts in time): the restart at 1–0 → his goal's celebration at 2–0 → the end, 2–1 */
const W0=C1.scores-.12,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** the side court (Croatia's goal at X = −20; Spain attack it, right → left): FA maps local (u,v) → stage (−20+u, 10+v) */
const FA:Frame={ox:-20,oz:10,rot:0},BOARDS=21.2;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
/** the restart after Ramírez's goal: Croatia at the ball, Spain in their half; Mellado on Spain's LEFT (−v, the near side) */
const KO_ESP:[number,number][]=[[23.8,-5.8],[23.6,5.4],[23.5,.6],[27.8,.1]];// Mellado, right ala, pivot, fixo
const KO_CRO:[number,number][]=[[19.55,.45],[17.4,-4.8],[17.2,4.6],[13.8,.2]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
const DROOP=posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24});
/** the celebration after his goal (2–0): near the corner on the near side; team-mates chase him */
const CEL0:[number,number]=[6.2,-4.4],CEL1:[number,number]=[5.4,-7.2];
const CEL_IN:[number,number][]=[[14.6,-1.2],[12.2,3.6],[18.2,-4.4]];
function koGen(i:number,team:'esp'|'cro'):LGen{const p=(team==='esp'?KO_ESP:KO_CRO)[i];return t=>({pose:team==='cro'&&i===0?stand():idle(t,i+(team==='esp'?0:.37)),yaw:team==='esp'?Math.PI:0,u:p[0],v:p[1]});}
const celPos=(T:number):[number,number]=>{const u=sm(WM,VM-.4,T,easeOut);return[lerp(CEL0[0],CEL1[0],u),lerp(CEL0[1],CEL1[1],u)];};
const liveM:LGen=T=>{
 if(T<WM)return koGen(0,'esp')(T);
 if(T<VM){const[u,v]=celPos(T),run=sm(WM,VM-.6,T);const pose=blendPose(celebrate((T-WM)*1.2,{kind:'run'}),celebrate((T-WM)*1.1,{kind:'arms'}),sm(VM-1.1,VM-.5,T));return{pose,yaw:run<.98?yawTo(CEL1[0]-CEL0[0],CEL1[1]-CEL0[1]):-Math.PI/2,u,v};}
 return{pose:celebrate((T-VM)*1.1+.2,{kind:'arms'}),yaw:-Math.PI/2+.3,u:16.4,v:-3.3};};
const liveEsp=(i:number):LGen=>T=>{// i = 0..2: right ala, pivot, fixo
 if(T<WM)return koGen(i+1,'esp')(T);
 if(T<VM){const tgt=celPos(Math.min(T+.4,VM)),a=CEL_IN[i],go=sm(WM,VM-.3,T,easeOut),dest:[number,number]=[tgt[0]+[1.2,.9,-1][i],tgt[1]+[.9,-1.1,1.2][i]],u=lerp(a[0],dest[0],go),v=lerp(a[1],dest[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.25+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(dest[0]-a[0],dest[1]-a[1]),u,v};}
 const spot:[number,number][]=[[15.3,-2.1],[17.5,-4.4],[16.1,-4.8]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.4,-.3,.2][i],u:spot[i][0],v:spot[i][1]};};
const liveCro=(i:number):LGen=>T=>{if(T<WM)return koGen(i,'cro')(T);
 const base:[number,number]=T<VM?([[4.2,1.6],[7.6,-1.2],[3.4,-2.6],[11.8,3.8]][i] as [number,number]):([[20.4,4.8],[22.6,-.8],[18.8,2.4],[24.4,3.6]][i] as [number,number]);
 return{pose:DROOP,yaw:T<VM?(i%2?.7:-.5):Math.PI*.8+i*.2,u:base[0],v:base[1]};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:16,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),yaw:.4,u:.9,v:.5};
const liveCam=(T:number)=>({x:key(T,mono([[0,-.2],[C1.play,.2],[C1.mel,1.6],[C1.wide,.4],[W0,-.2],[W1,-16.8],[C1.second,-17],[V0,-17],[V1,-4],[C1.end,-3.8]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.play,.6],[C1.mel+.2,.9],[C1.wide,.86],[W0,.86],[W1,.74],[C1.second,.8],[V0,.82],[V1,.96],[C1.end,1.04]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.mel+.2,1010],[C1.wide,1010],[W1,1110],[V0,1100],[V1,990],[C1.end,970]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard (segments: top, upper-left, upper-right, middle, lower-left, lower-right, bottom) */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'2':[0,2,3,4,6],'3':[0,2,3,5,6],'4':[1,2,3,5],'5':[0,1,3,5,6],'6':[0,1,3,4,5,6],'7':[0,2,5],'8':[0,1,2,3,4,5,6],'9':[0,1,2,3,5,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the arena board: Croatia (navy tab, listed first) left, Spain (red tab) right; the match clock under it when it is known */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,clk:string|null,flip:number){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.4,0,BOARDS)[0],W=4.6*kw,H=(clk?2.6:1.8)*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=1.8*kw*.62,y=top-H+1.8*kw*.19;
 const tab=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+1.8*kw*.06,W*.16,1.8*kw*.07);s.fill(ink,p);};
 s.knockout(rectPath(cx-W*.38,top-H+1.8*kw*.06,W*.16,1.8*kw*.07));tab(R,cx+W*.22);
 digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y+h*(1-clamp(flip))*.4,h*clamp(.6+.4*flip));
 if(clk){const ch=.62*kw,cy=top-.84*kw,xs=cx-ch*1.55;digit(lit,clk[0],xs,cy,ch);digit(lit,clk[1],xs+ch*.68,cy,ch);lit.rect(xs+ch*1.4,cy+ch*.2,ch*.14,ch*.14);lit.rect(xs+ch*1.4,cy+ch*.64,ch*.14,ch*.14);digit(lit,clk[3],xs+ch*1.7,cy,ch);digit(lit,clk[4],xs+ch*2.38,cy,ch);}
 s.fill(Y,lit);
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:T<VM?1:2;
 court(s,st,FA,T,{wallZ:BOARDS,cheer:phase===0?.12:phase===1?.95:1,flash:phase===1?pulse(T,WM,1.2):phase===2?pulse(T,VM,1.2)+.5*pulse(T,C1.two,1.2):0,
  keeper:()=>{athlete(s,st,FA,liveGK,T,CRO_GK,{detail:'low'});}});
 scoreboard(s,st,c.x,phase===0?'1-0':phase===1?'2-0':'2-1',phase===0?'12:57':phase===1?'18:42':null,phase===1?sm(C1.second,C1.second+.3,T,easeOutBack):1);
 const items:{z:number;draw:()=>void}[]=[];
 KO_CRO.forEach((_,i)=>{const g=liveCro(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,CRO(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveEsp(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:'low'})});});
 items.push({z:depth(FA,liveM(T))-.02,draw:()=>athlete(s,st,FA,liveM,T,MELLADO,{detail:'mid'})});
 // the ball: on the centre spot at the restart; already resting in the net after his goal (the goal itself is not shown)
 if(phase===0)items.push({z:10,draw:()=>{ballL(s,st,FA,20,BALL_R,0,18);}});
 if(phase===1)items.push({z:depth(FA,{u:-.7,v:.5})+.3,draw:()=>{ballL(s,st,FA,-.7,BALL_R,.5,18);}});
 // "Mellado": a red dashed ring under him; "wide player": his lane down the LEFT wing, toward Croatia's goal
 if(phase===0){const l=liveM(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.mel,C1.mel+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,R,X,Z,1.15,14,51,g);}});
  const ar=sm(C1.wide,C1.wide+.6,T,easeOut)*(1-sm(W0-.3,W0,T));if(ar>.02)items.push({z:Z+.8,draw:()=>{const pts=[fp(st,FA,l.u-1,l.v-.6),fp(st,FA,l.u-5,l.v-2),fp(st,FA,l.u-10,l.v-2.2),fp(st,FA,l.u-14,l.v-.8)];cased(s,pts,16,52,{dash:50,progress:ar});if(ar>.9)casedHead(s,pts,46,53);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI),c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
 if(phase===1&&T<C1.second+1.2&&T>WM){const p=proj(st,c.x+3.4,5.4,BOARDS);sparkBurst(s,Y,p[0],p[1],260,{n:10,seed:64,g:easeOut(sm(C1.second,C1.second+.3,T))*(1-sm(C1.second+.7,C1.second+1.2,T))});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveM(tt),.16));},still:C1.wide+.4};

// ================= the demonstration (local frame): the sole roll from the LEFT wing with the RIGHT sole =================
const C2={trick:A(1,'His trick'),sole:A(1,'sole roll'),watch:A(1,'Watch how'),left:A(1,'left wing'),on:A(1,'Sole on'),roll:A(1,'roll it'),follows:A(1,'defender'),drag:A(1,'Drag'),away:A(1,'he is'),end:AUTH[1].seconds};
/** the approved Falcão sole poses (authored on the LEFT foot) → mirrored onto the RIGHT foot: STEP = sole flat on top; ROLL = the sole
 * carried across his body (to his LEFT); DRAG = pulled back */
const STEP=mirrorPose(posed({lHipF:55,lKnee:55,lAnk:0,lHipA:4,rHipF:14,rKnee:34,lean:14,pitch:2,neckP:34,lShA:44,rShA:38,lElb:40,rElb:44,twist:-6}));
const ROLL=mirrorPose(posed({lHipF:52,lKnee:56,lAnk:0,lHipA:-24,lHipR:-8,rHipF:18,rKnee:36,rHipA:14,lean:14,bend:8,roll:4,neckP:34,lShA:56,rShA:32,lElb:40,rElb:50,twist:14}));
const DRAG=mirrorPose(posed({lHipF:36,lKnee:78,lAnk:4,lHipA:10,rHipF:10,rKnee:40,lean:18,bend:-6,neckP:30,lShA:40,rShA:58,lElb:40,rElb:36,twist:-18}));
/** his heading (toward the goal, a touch inside), his LEFT (toward the near touchline, −v) and the escape (inside, toward goal) */
const DF:[number,number]=(()=>{const x=-1,z=.1,l=Math.hypot(x,z);return[x/l,z/l];})(),DR:[number,number]=[DF[1],-DF[0]],DL:[number,number]=[-DR[0],-DR[1]];
const YAW_D=yawTo(DF[0],DF[1]);
const ESC:[number,number]=(()=>{const x=DF[0]+1.05*DR[0],z=DF[1]+1.05*DR[1],l=Math.hypot(x,z);return[x/l,z/l];})();
const HOME:[number,number]=[9.6,-6.3];// where the sole goes on the ball (local)
/** the demo timeline (chapter-2 authored seconds) */
const D={on:C2.on+.1,roll0:C2.roll+.05,roll1:C2.roll+1.05,lunge:C2.follows+.05,drag0:C2.drag+.05,drag1:C2.drag+.65,go:C2.drag+.9,end:C2.end};
function fPos(t:number):[number,number]{
 const back=(k:number):[number,number]=>[HOME[0]-DF[0]*k,HOME[1]-DF[1]*k];
 const a=back(6.6),b=back(.42),rolled:[number,number]=[b[0]+DL[0]*.48,b[1]+DL[1]*.48],dragged:[number,number]=[rolled[0]-DF[0]*.2,rolled[1]-DF[1]*.2];
 if(t<D.on){const u=sm(0,D.on,t,easeOut);return[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];}
 if(t<D.roll0)return b;
 if(t<D.roll1){const u=sm(D.roll0,D.roll1,t,easeIO);return[lerp(b[0],rolled[0],u),lerp(b[1],rolled[1],u)];}
 if(t<D.drag0)return rolled;
 if(t<D.go){const u=sm(D.drag0,D.go,t,easeIO);return[lerp(rolled[0],dragged[0],u),lerp(rolled[1],dragged[1],u)];}
 const u=t-D.go,dist=Math.min(4.2,u<.3?u*u*3:.27+(u-.3)*3.6);return[dragged[0]+ESC[0]*dist,dragged[1]+ESC[1]*dist];
}
const dri=(ph:number)=>dribble(ph,{foot:'r',speed:.28});
const demoM:LGen=t=>{
 const[u,v]=fPos(t);let pose:Pose,yaw=YAW_D;
 if(t<D.on-.4)pose=dri(t*1.6+.2);
 else if(t<D.roll0)pose=blendPose(dri((D.on-.4)*1.6+.2),STEP,sm(D.on-.4,D.on,t,easeIO));
 else if(t<D.drag0)pose=keyPoses(t,[[D.roll0,STEP],[D.roll1-.25,ROLL],[D.roll1+.3,blendPose(ROLL,STEP,.35)],[D.drag0,blendPose(ROLL,STEP,.35)]]);
 else if(t<D.go)pose=keyPoses(t,[[D.drag0,blendPose(ROLL,STEP,.35)],[D.drag1,DRAG],[D.go,blendPose(DRAG,runCycle(.05,{speed:.6}),.5)]]);
 else pose=blendPose(DRAG,runCycle((t-D.go)*runCadence(.7)+.05,{speed:.7}),sm(D.go,D.go+.25,t));
 if(t>=D.drag1-.1)yaw=lerp(YAW_D,yawTo(ESC[0],ESC[1]),sm(D.drag1-.1,D.go+.3,t,easeIO));
 return{pose,yaw,u,v};
};
/** the ball point under his RIGHT sole: mid-sole (step / roll) or under the forefoot (drag) */
function soleBall(t:number):[number,number]{const{sk,J}=jointsL(demoM(t)),toe=J(sk.rToe),heel=J(sk.rHeel),w=t>=D.drag0?.82:.62;return[lerp(heel[0],toe[0],w),lerp(heel[2],toe[2],w)];}
const soleOnBall=(t:number)=>t>=D.on-.12&&t<D.go;
/** the ball: rolled ahead while he dribbles, under the sole from the step to the end of the drag, then pushed into the space inside */
function demoBall(t:number):{u:number;v:number;spin:number}{
 if(t<D.on-.12){const ph=((t*1.6+.2)%1+1)%1,k=.38+.16*easeOut(ph),[fu,fv]=fPos(t),s0=soleBall(D.on),w=sm(D.on-.5,D.on-.12,t);return{u:lerp(fu+DF[0]*k,s0[0],w),v:lerp(fv+DF[1]*k,s0[1],w),spin:t*9};}
 if(soleOnBall(t)){const[u,v]=soleBall(t);return{u,v,spin:t*4};}
 const u=t-D.go,[x0,z0]=soleBall(D.go-.001),[fu,fv]=fPos(t),w=sm(0,.35,u),kick=.6+.14*Math.abs(Math.sin(u*5));return{u:lerp(x0+ESC[0]*u*1.3,fu+ESC[0]*kick,w),v:lerp(z0+ESC[1]*u*1.3,fv+ESC[1]*kick,w),spin:u*12};
}
/** the defender: goal side of him, sets, follows the roll (lunges to his own RIGHT, toward the touchline), left stranded as he cuts inside */
const DEF0:[number,number]=[HOME[0]+DF[0]*1.6,HOME[1]+DF[1]*1.6+.1];
const demoD:LGen=t=>{const lu=key(t,[[D.lunge-.1,0],[D.lunge+.35,.6],[D.lunge+1.6,.75],[C2.away+1,1]],linear),shift=.4*sm(D.roll0+.2,D.lunge+.3,t,easeIO);
 let pose=backpedal(t*1.1);pose=blendPose(pose,stand(),sm(D.on-.6,D.on,t)*(1-sm(D.roll0,D.roll0+.3,t)));pose=blendPose(pose,lunge(lu,{side:'r'}),sm(D.lunge-.2,D.lunge,t));
 const back=t<D.on?1.4*(1-sm(0,D.on,t,easeOut)):0,turn=sm(C2.away,C2.away+.8,t,easeIO);
 pose=blendPose(pose,posed({neckY:-40,lHipF:30,rHipF:40,lKnee:40,rKnee:60,lean:24,lShA:40,rShA:40,lElb:50,rElb:50}),turn*.5);
 return{pose,yaw:yawTo(-DF[0],-DF[1])-turn*.7,u:DEF0[0]+DF[0]*back+DL[0]*shift,v:DEF0[1]+DF[1]*back+DL[1]*shift};};
const demoGK:LGen=t=>{const s0=sm(D.go,D.go+1.2,t,easeIO);return{pose:keeperSet(t*1.3),yaw:yawTo(1,-.5+.5*s0),u:.75,v:lerp(-.9,-.3,s0)};};

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, lower camera on the near touchline) =================
const F2:Frame={ox:-20,oz:10,rot:0};
const st2=(cx:number):Stage=>({F:2500,eye:3.4,cx,cz:-5.6});
const cam2x=(t:number)=>key(t,mono([[0,-6.4],[C2.watch,-9],[D.on,-10.1],[D.drag0,-10.3],[D.go+.5,-11.4],[C2.end,-12.2]]),easeInOutSine);
function soleRing(s:Sheet,st:Stage,fr:Frame,t:number,g:number,ink:string,seed:number){if(g<=.02)return;const b=demoBall(t),[X,Z]=toStage(fr,b.u,b.v);floorDashRing(s,st,ink,X,Z,.32,9,seed,g);}
/** the diagrams on the floor (shared by chapters 2 and 3): the roll path (yellow), the defender's wrong-way arrow (red), the drag (red
 * dashes) and the escape (cased yellow). `w` is the demo time the diagrams read. */
function demoDiagrams(s:Sheet,st:Stage,fr:Frame,w:number,o:{roll:number;follow:number;drag:number;go:number;scale:number}){
 const S=o.scale,L=(q:{u:number;v:number})=>fp(st,fr,q.u,q.v);
 if(o.roll>.02&&w>=D.roll0){const pts:Pt[]=[];for(let k=0;k<=12;k++)pts.push(L(demoBall(lerp(D.roll0,Math.min(w,D.roll1+.2),k/12))));dashed(s,Y,pts,12*S,303,{dash:36*S,cov:o.roll});if(w>D.roll1-.1&&w<D.drag0+.4)arrowHead(s,Y,pts,34*S,304,o.roll);}
 if(o.drag>.02&&w>=D.drag0){const pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(L(demoBall(lerp(D.drag0,Math.min(w,D.go),k/10))));if(pts.length>1)dashed(s,R,pts,11*S,305,{dash:30*S,cov:o.drag});}
 if(o.follow>.02){const d0=demoD(D.lunge-.2),a=fp(st,fr,d0.u+DL[0]*.25,d0.v+DL[1]*.25),c=fp(st,fr,d0.u+DL[0]*1.5,d0.v+DL[1]*1.5),pts=[a,L2(a,c,.5),c],q=partial(pts,o.follow),rp=ribbon(q,13*S,{seed:306,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(o.follow>.5)arrowHead(s,R,q,34*S,307);}
 if(o.go>.02){const[x0,z0]=fPos(D.go),pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(fp(st,fr,x0+ESC[0]*(.4+3.2*k/10),z0+ESC[1]*(.4+3.2*k/10)));cased(s,pts,14*S,308,{dash:44*S,progress:o.go});if(o.go>.9)casedHead(s,pts,40*S,309);}
}
/** the demonstration's figures + ball, back to front on a frame (the ball goes in front of his sole while he is on it) */
function demoFigures(s:Sheet,st:Stage,fr:Frame,w:number,det:'mid'|'high',smear:number){
 const b=demoBall(w),m=demoM(w),d=demoD(w),items:{z:number;draw:()=>void}[]=[
  {z:depth(fr,d),draw:()=>athlete(s,st,fr,demoD,w,DEMO_D,{detail:det})},
  {z:depth(fr,m)+.001,draw:()=>athlete(s,st,fr,demoM,w,MELLADO_T,{detail:det,smear:(w>D.roll0&&w<D.roll1)||(w>D.drag0&&w<D.go+.2)?smear:0})},
  {z:soleOnBall(w)?depth(fr,m)+.01:depth(fr,b)+.25,draw:()=>{ballL(s,st,fr,b.u,BALL_R,b.v,311,{rot:b.spin});}},
 ];
 items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(cam2x(t)),m=demoM(tt),mg=fp(st,F2,m.u,m.v),mh=kAt(st,depth(F2,m))*1.76;
  // the camera follows him; it tightens on the sole for the trick
  const zoom=key(t,mono([[0,.78],[C2.sole,.86],[C2.watch,.8],[D.on,1.06],[D.drag1,1.1],[D.go+.4,.94],[C2.end,.9]]),easeInOutSine);
  cam(s,mg[0]*.8,mg[1]-mh*.55+key(t,mono([[0,-40],[D.on,40],[C2.end,-10]]),easeInOutSine),zoom);
  court(s,st,F2,tt,{wallZ:BOARDS,cheer:.15+.6*pulse(tt,D.go,1.6),keeper:()=>athlete(s,st,F2,demoGK,tt,DEMO_GK,{detail:'low'})});
  // "sole roll": a red ring round his right boot; "left wing": the touchline lit; "Sole on": a yellow ring stamps
  const lw=easeOut(sm(C2.left,C2.left+.5,tt))*(1-sm(D.on,D.on+.5,tt));
  if(lw>.02){const pts=[fp(st,F2,m.u+3,-10),fp(st,F2,m.u-1,-10),fp(st,F2,m.u-6,-10)];cased(s,pts,14,320,{dash:40,progress:lw});}
  if(tt<D.on){const{sk,J}=jointsL(m),toe=J(sk.rToe),g=easeOutBack(sm(C2.sole,C2.sole+.35,tt))*(1-sm(C2.watch,C2.watch+.4,tt));if(g>.02){const[X,Z]=toStage(F2,toe[0],toe[2]);floorDashRing(s,st,R,X,Z,.36,9,301,g);}}
  soleRing(s,st,F2,tt,easeOutBack(sm(D.on-.1,D.on+.25,tt))*(1-sm(D.roll0+.1,D.roll0+.4,tt)),Y,302);
  demoDiagrams(s,st,F2,tt,{roll:1,follow:tt>=D.lunge?sm(D.lunge,D.lunge+.6,tt,easeOut)*(1-sm(C2.away,C2.away+.4,tt)):0,drag:1,go:tt>=C2.away-.3?sm(C2.away-.3,C2.away+.6,tt,easeOut):0,scale:1});
  demoFigures(s,st,F2,tt,'high',.18);
  if(tt>=D.go&&tt<D.go+.6){const b=demoBall(tt),p=fp(st,F2,b.u,b.v,.4);sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:312,g:easeOut(sm(D.go,D.go+.3,tt))*(1-sm(D.go+.35,D.go+.6,tt))});}
 },
 aperture(t0){const{tt,tc}=clock(1,t0);return aperture(chestPts(st2(cam2x(tc)),F2,demoM(tt),.13));},
 still:D.roll1,
};

// ================= chapter 3 — WATCH AGAIN (slow motion, low, behind him with the goal ahead) =================
const C3={watch:A(2,'Watch'),top:A(2,'Sole on top'),roll:A(2,'roll'),drag:A(2,'drag'),go:A(2,'go'),end:AUTH[2].seconds};
/** chapter time → demo time (slow motion through the move) */
const seq3=(t:number)=>key(t,mono([[0,D.on-1.2],[C3.top,D.on+.05],[C3.roll,D.roll0+.1],[C3.drag,D.drag0+.05],[C3.go,D.go+.05],[C3.end,D.go+1.5]]),linear);
/** the end-on frame: the camera looks along +Z; the frame is turned so the line from him to the goal runs away from the camera (the goal
 * just right of him, the touchline on his left = screen left), so the camera sits low behind him */
const GZ=11,WALLZ=13.6,FB:Frame={ox:0,oz:GZ,rot:-1.2};
const HB=toStage(FB,HOME[0],HOME[1]);
const st3:Stage={F:1500,eye:1.25,cx:HB[0]-.6,cz:HB[1]-5.6};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),w=seq3(tt),wc=seq3(t),st=st3,hp=fp(st,FB,HOME[0],HOME[1]),h=kAt(st,HB[1])*1.76;
  camPath(s,t,[[0,hp[0]+60,hp[1]-h*.62,1.02],[C3.top,hp[0]+10,hp[1]-h*.45,1.14],[C3.roll,hp[0]-40,hp[1]-h*.45,1.1],[C3.drag,hp[0]-10,hp[1]-h*.46,1.12],[C3.go,hp[0]+80,hp[1]-h*.6,1.05],[C3.end,hp[0]+160,hp[1]-h*.66,.98]]);
  void wc;
  court(s,st,FB,tt,{wallZ:WALLZ,cheer:.1+.7*pulse(tt,C3.go,1.6),keeper:()=>athlete(s,st,FB,demoGK,w,DEMO_GK,{detail:'mid'})});
  // "Sole on top": a yellow ring stamps; "roll": the yellow path; "drag back": red dashes; "go": the escape
  soleRing(s,st,FB,w,easeOutBack(sm(C3.top,C3.top+.3,tt))*(1-sm(C3.roll+.3,C3.roll+.7,tt)),Y,331);
  demoDiagrams(s,st,FB,w,{roll:sm(C3.roll-.1,C3.roll+.2,tt),follow:sm(C3.roll+.6,C3.roll+1.1,tt,easeOut)*(1-sm(C3.go,C3.go+.4,tt)),drag:sm(C3.drag-.1,C3.drag+.2,tt),go:sm(C3.go-.1,C3.go+.8,tt,easeOut),scale:.8});
  demoFigures(s,st,FB,w,'high',.3);
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FB,demoM(seq3(tt)),.14));},
 still:C3.roll+.4,
};

// ================= chapter 4 — YOUR TURN: slow sole rolls between two cones; three cards (sole, roll, drag); a tick =================
const C4={turn:A(3,'Your turn'),roll:A(3,'roll the'),sole:A(3,'sole of'),close:A(3,'Keep it'),tight:A(3,'tight'),end:AUTH[3].seconds};
const P_HOME:[number,number]=[.1,3.9],P_YAW=-Math.PI/2+.55,P_LEFT:[number,number]=[-Math.sin(P_YAW),Math.cos(P_YAW)];
/** practising: sole on → roll across to his left → roll back → sole on (loops, slow) */
const practiceM=(t:number):{pose:Pose;yaw:number;X:number;Z:number}=>{const loop=2.4,u=((t%loop)+loop)%loop,roll=keyPoses(u,[[0,STEP],[.8,ROLL],[1.3,ROLL],[2.0,STEP],[2.4,STEP]]);
 const shift=.38*key(u,[[0,0],[.8,1],[1.3,1],[2.0,0],[2.4,0]]);let pose=roll;
 pose=blendPose(pose,celebrate((t-C4.tight-1.1)*1.1,{kind:'arms'}),sm(C4.tight+1,C4.tight+1.4,t));
 return{pose,yaw:P_YAW,X:P_HOME[0]+P_LEFT[0]*shift,Z:P_HOME[1]+P_LEFT[1]*shift};};
const st4:Stage={F:1500,eye:2.6,cx:0,cz:-1.2};
const F4:Frame={ox:0,oz:23.9,rot:-Math.PI/2};// the halfway line sits at Z = 3.9 (the practice spot on the centre circle's edge)
const CARD_Y=720,CARD_W=190,CARDS:[number,number,string][]=[[-420,C4.roll+.1,'step'],[0,C4.sole+.1,'roll'],[420,C4.close,'drag']];
/** a training cone (red with a paper band) standing on the floor at (X,Z) */
function cone(s:Sheet,st:Stage,X:number,Z:number,g:number,seed:number){if(g<=.02)return;const b=proj(st,X,0,Z),k=kAt(st,Z)*g,hgt=.34*k,w=.13*k;
 const body:Pt[]=[[b[0]-w,b[1]],[b[0]+w,b[1]],[b[0]+w*.18,b[1]-hgt],[b[0]-w*.18,b[1]-hgt]],p=polyPath(handCut(body,seed,2,40),true);
 s.fill(K,polyPath(blob(b[0],b[1],w*1.5,w*.4,seed+1,{n:14}),true),.35);s.knockout(p);s.fill(R,p);s.knockout(rectPath(b[0]-w*.55,b[1]-hgt*.62,w*1.1,hgt*.16));s.fill(K,ribbon([...body,body[0]],Math.max(2.5,k*.012),{seed:seed+2,close:true,wobble:.4}));}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,80,380,1.15],[C4.roll-.4,60,420,1.1],[C4.roll+.3,40,640,.98],[C4.tight-.3,40,650,.98],[C4.tight+.4,70,420,1.2],[C4.end,80,400,1.26]]);
  court(s,st,F4,tt,{wallZ:WALLZ,goal:false,cheer:.8*pulse(tt,C4.tight+1,1.4)});
  const f=practiceM(tt),sk=solve(f.pose,BUILD,placeAt(f.X,f.Z,f.yaw)),toe=sk.rToe,heel=sk.rHeel,BX=lerp(heel[0],toe[0],.62),BZ=-lerp(heel[2],toe[2],.62);
  // "tight spaces": two cones stamp in close either side of him
  const cg=easeOutBack(sm(C4.tight,C4.tight+.35,tt));
  const cX=(k:number)=>P_HOME[0]+P_LEFT[0]*(.19+k*.85),cZ=(k:number)=>P_HOME[1]+P_LEFT[1]*(.19+k*.85);
  cone(s,st,cX(1),cZ(1),cg,421);
  // "Keep it close": a tight yellow ring binds the ball to the sole
  const close=easeOutBack(sm(C4.close,C4.close+.35,tt))*(1-sm(C4.tight+.9,C4.tight+1.2,tt));
  if(close>.02)floorDashRing(s,st,Y,BX,BZ,.34,9,401,close);
  const bp=proj(st,BX,BALL_R,BZ),br=kAt(st,BZ)*BALL_R;
  shadow(s,bp[0],proj(st,BX,0,BZ)[1],br*1.15,br*.3,402,.45);ball(s,bp[0],bp[1],br,403,{rot:tt*3});
  drawAthlete(s,f.pose,projector(st),{...MELLADO_T,detail:'high'},placeAt(f.X,f.Z,f.yaw),{prev:practiceM(tt-1/12).pose,prevPlace:placeAt(practiceM(tt-1/12).X,practiceM(tt-1/12).Z,P_YAW)});
  cone(s,st,cX(-1),cZ(-1),cg,424);
  // the three cards rise on "roll the ball", each prints one step with a small figure; they drop before "tight spaces"
  const rise=sm(C4.roll-.2,C4.roll+.4,tt,easeOut),drop=sm(C4.tight-.5,C4.tight-.1,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y+230+dy],[cx-CARD_W,CARD_Y+230+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(B,cards,.16);
   CARDS.forEach(([cx,t0c,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+175;
    const fc=figureCam({x:cx+10,y:gy,height:400*(.9+.1*on),azimuth:-150,elevation:16,fov:16,at:[.2,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=kind==='step'?STEP:kind==='roll'?ROLL:DRAG,csk=solve(pose,BUILD,{}),ct=csk.rToe,ch=csk.rHeel,cw=kind==='drag'?.82:.62,cb:V3=[lerp(ch[0],ct[0],cw),BALL_R,lerp(ch[2],ct[2],cw)];
    const bb=fc.project(cb),bR=BALL_R*(fc.scale?fc.scale(cb):100),Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    // the move's diagram under the ball: sole = a red sole mark, roll = a yellow arrow across (to his left, library −z), drag = an arrow back
    if(kind==='step')s.fill(R,polyPath(blob(bb[0],bb[1]+bR*.9,bR*1.9,bR*.55,80,{n:18}),true),.55);
    if(kind==='roll'){const a0=Pc([cb[0],0,cb[2]+.5]),a1=Pc([cb[0],0,cb[2]-.05]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,Y,pts,8,85,{dash:22});arrowHead(s,Y,pts,24,86);}
    if(kind==='drag'){const a0=Pc([cb[0]+.45,0,cb[2]]),a1=Pc([cb[0]-.05,0,cb[2]]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,K,pts,8,87,{dash:22});arrowHead(s,K,pts,24,88);}
    shadow(s,bb[0],Pc([cb[0],0,cb[2]])[1],bR*1.1,bR*.3,89+i,.4);ball(s,bb[0],bb[1],bR,81+i);
    drawAthlete(s,pose,fc,{...MELLADO_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // the lesson lands: a big blue tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.tight+.3,C4.tight+.65,tt));
  if(tick>.02){const g=proj(st,f.X,0,f.Z),h=kAt(st,f.Z)*1.76,c:Pt=[g[0]+h*.62,g[1]-h*.72],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(B,tp);}
 },
 still:C4.close+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'mellado-futsal-signature',format:'futsal',title:'Mellado’s sole roll',theme:'Roll the ball under your sole to keep it close, then drag it back and go.',
 ageNote:'For players aged 7–12: the 2026 Euro semi-final and his goal are real (the goal itself is not shown); the sole roll is a demonstration. Practise it slowly.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball drops, a sole (navy boot print) rolls it sideways, rings squeak out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const fall=sm(0,.25,age,easeIn),roll=sm(.3,.6,age,easeIO),bx=x-40*roll,by=y-150*(1-fall),u=clamp((age-.25)/.5);
  if(age>.25&&u<1){s.fill(Y,ribbon(blob(bx,y+r*.9,r*(1+2*u),r*(.3+.6*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);s.fill(R,ribbon(blob(bx,y+r*.9,r*(.6+1.3*u),r*(.2+.4*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(bx,y+r*.95,r*(.7+.3*fall),r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:age*4-roll*3});
  const tap=sm(.2,.3,age)*(1-sm(.6,.8,age));if(tap>.02){const sole=blob(bx+4,by-r-10+18*(1-tap),r*1.1,r*.34,seed+3,{n:18});s.fill(K,polyPath(sole,true),.85*tap);}
 },
};
export default film;
