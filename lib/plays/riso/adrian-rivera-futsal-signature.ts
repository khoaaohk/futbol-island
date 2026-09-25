/** Adrián Rivera — "wait for the big touch, then poke it": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Adrián Rivera ("Adri Rivera", born 11 Jan 2002), a Spanish fixo / ala-cierre of ElPozo Murcia, Spain No. 4 at the UEFA Futsal EURO 2026
 *  (card bio, lib/town/playerBios.json: "Young Spanish fixo from ElPozo Murcia who captained Spain's U-19 side to a European title …";
 *  strengths "Well-timed poke tackles", "Brave last defender"). Not to be confused with any football namesake.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the timed poke tackle — not one match. No written source we could
 *  reach describes ONE dated Rivera tackle (UEFA's live commentary logs shots, saves, fouls and corners, never a tackle; he has no en/es
 *  Wikipedia page), so the film follows the brief's honest FALLBACK: the real-match chapter shows only confirmed things from a real match
 *  he scored in, and the poke tackle is a separate, clearly labelled demonstration ("Watch how he does it", training tops, no opponent named,
 *  a near-empty training hall) that is never passed off as that match. The match: Spain 10–3 Belgium, UEFA Futsal EURO 2026 Group C,
 *  29 Jan 2026, Tivoli Hall (Tivoli Arena), Ljubljana — Rivera scored the FIRST goal at 2'17". It is not used by any other futsal film
 *  (the 2026 final: Dídac Plana, Pauleta, Ricardo Mayor; the quarter-final v Italy: Antonio Pérez; the semi-final v Croatia: Mellado).
 *  1  LIVE (broadcast camera, main stand, real time), CONFIRMED THINGS ONLY: the teams lined up with the ball on the centre spot (who kicked
 *     off is not claimed); Rivera the deepest Spain outfield player (a ring, "the last line" across the court); whip pan (a cut in time) to
 *     the celebration of his goal, the board at 1–0 (2'17"; HOW it was scored is unknown and not shown, the ball is already in the net);
 *     whip pan to the end: 10–3, Spain celebrate topping the group. The stands are thin: the attendance was 300.
 *  2  HOW HE DOES IT (a demonstration, real time, side-on from the main stand, his own goal on the LEFT; Rivera in a plain yellow training top,
 *     a neutral paper-kit attacker and a blue-bib keeper — no match claimed): he stays low and waits, backing off slowly; the attacker dribbles
 *     at him and pushes a big touch; the moment the ball is away from the attacker's foot, Rivera jabs his RIGHT toe in and pokes it away.
 *  3  WATCH AGAIN (slow-motion replay of the demonstration, reverse angle, knee-high, his goal on the RIGHT): wait, big touch, poke.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Poke the ball away with your toe when the attacker takes a big touch."): he runs it again;
 *     three cards (wait, big touch, poke); a tick.
 * Sources (written; fetched with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Futsal Euro 2026" (raw; wiki-futsal-euro-2026.txt): Group C, 29 January 2026, 17:30, Tivoli Arena, Ljubljana, Spain
 *    10–3 Belgium; Spain goals Rivera 2'17", Pérez 5'33", Raya 7'13" 34'57", Ramírez 7'33" 20'46", Cecilio 23'17" 34'01", Adolfo 26'45",
 *    Mellado 26'57"; Belgium Gréllo 7'01", Bachar 35'36", Rahou 39'09"; attendance 300; UEFA match 2046550; Spain won the group (3 wins) and
 *    later the title (Portugal 3–5 Spain, 7 Feb 2026). — https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2026
 *  - Wikipedia, "UEFA Futsal Euro 2026 final" (raw; wiki-futsal-euro-2026-final.txt): Spain squad No. 4 "Adri Rivera", DF, born 11 Jan 2002,
 *    ElPozo Murcia.
 *  - Wikipedia (es), "Selección de fútbol sala de España" (raw; eswiki-seleccion-futsal-espana.txt): EURO 2026 squad, dorsal 4 Rivera,
 *    ala-cierre, 24, ElPozo Murcia.
 *  - UEFA.com match centre "Spain vs Belgium" (live blog, fetched Sep 2026; uefa-futsaleuro2026-esp-bel.html/.txt — only the last 42 entries
 *    are in the page, so the 2'17" goal is not described): "Spain win group with most goals in a finals game" (ten, an outright record);
 *    "They controlled the game with a high press and relentless pace"; Rivera efforts on goal at 38'02" and 38'29" saved by Meyers; Player
 *    of the Match Pablo Ramirez.
 * CONFIRMED: competition, group, date, venue, attendance, the score (1–0 after his goal at 2'17", 10–3 at the end, a Futsal EURO record ten),
 *  that Rivera scored the first goal, his shirt number (4), club, position (fixo / ala-cierre, a defender), Spain winning the group. The
 *  narration states only these (plus the entry's signature, framed as "Watch how he does it").
 * INFERRED (never named in the narration): the kits (Spain red shirts / navy shorts / red socks, No. 4 in yellow; Belgium, the second-named
 *  side, drawn in a white change strip — Belgium's usual red would clash; the keepers' colours); the wood-look court; which end; where
 *  everyone stood at kick-off; where and how the goal was celebrated; the board's look; his hair (short, dark) and build. No video was
 *  reviewed. Chapters 2–4 are a demonstration of the poke tackle, not a recreation of any match play (his poking foot — right — and the
 *  angles are chosen to read clearly).
 * Technique (poses): the fixo stays low on the balls of his feet, knees bent, side-on a little, backing off at the attacker's speed and
 *  never diving in while the ball is on the attacker's foot; the cue is the big touch — the ball rolls a metre or two ahead and the attacker
 *  cannot touch it again in time — then the near (right) leg shoots out, the toe meets the ball first and knocks it sideways, the standing
 *  knee stays bent so he is back on his feet at once. No contact with the attacker.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the jab). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across; +v is the left of a
 *  player facing +u); each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are
 *  LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Spain, the touch gap, arrows), blue (keeper bib, Belgium board tab), navy (key line,
 *  shorts, stands). Belgium flags: navy-yellow-red vertical bands.
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈140–270 plate ops a frame (peak 318 mid-passage). All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,stand,runCycle,runCadence,dribble,touchPhase,backpedal,lunge,keeperSet,celebrate,posed,blendPose,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: EURO 2026',text:'The 2026 Futsal EURO, in Ljubljana. Spain play Belgium. Adrián Rivera is Spain’s fixo, the last defender. After just two minutes, he scores the first goal! Spain win ten to three!',tail:2.4,
  cues:['The 2026','in Ljubljana','Spain play','Rivera','fixo','last defender','After just','scores','first goal','Spain win','ten to three'],heads:{'The 2026':'Futsal EURO 2026','After just':'2′17″','first goal':'1–0','ten to three':'10–3'}},
 {label:'How he does it',text:'Rivera is famous for his poke tackle. Watch how he does it: he stays low and waits. The attacker dribbles at him and takes a big touch. He pokes the ball away with his toe!',tail:2.2,
  cues:['Rivera is famous','poke tackle','Watch how','stays low','waits','The attacker','dribbles','big touch','pokes','his toe'],heads:{'Rivera is famous':'The poke tackle','his toe':''}},
 {label:'Watch again',text:'Watch again, slowly. Wait, big touch, poke!',tail:2.4,
  cues:['Watch again','Wait','big touch','poke'],heads:{'Watch again':'Slow motion','poke':''}},
 {label:'Your turn',text:'Your turn: when the attacker pushes the ball too far, poke it away with your toe!',tail:2.6,
  cues:['Your turn','attacker pushes','too far','poke it away','your toe'],heads:{'Your turn':'Wait, touch, poke','your toe':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/adrian-rivera-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/adrian-rivera-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/adrian-rivera-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('adrian-rivera: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('adrian-rivera: no cue '+w);return c.at;};
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
const SKIN:InkFill[]=[[Y,.8],[R,.3]];
const BUILD={height:1.8,bulk:1.06};
/** Adrián Rivera for Spain (kit inferred): red shirt, navy shorts, red socks, No. 4 (confirmed) in yellow; short dark hair */
const RIVERA:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:Y,hairStyle:'short',number:4,numberInk:Y,build:BUILD,seed:9};
/** Rivera in the demonstration and lesson: a plain yellow training top and navy shorts (no national kit, so no match is implied) */
const RIVERA_T:AthleteStyle={...RIVERA,shirt:[Y,.95],shorts:K,socks:K,trim:K,boots:'paper',number:null};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[[Y,.8],[R,.26]],[[Y,.7],[R,.3]],[[Y,.76],[R,.22]]][n%3] as InkFill[],hair:K,line:K,trim:Y,hairStyle:(['short','bald','curly'] as const)[n%3],build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Belgium (change strip inferred): white shirts, navy shorts, white socks, red trim */
const BEL=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[[Y,.78],[R,.22]],[[Y,.55],[R,.32],[K,.1]],[[Y,.7],[R,.28]]][n%3] as InkFill[],hair:K,line:K,trim:R,hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const BEL_GK:AthleteStyle={shirt:[B,.85],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
/** the demonstration attacker and keeper: neutral training kit (a light-blue bib; a navy keeper top) — no team is claimed in chapters 2–4 */
const DEMO_A:AthleteStyle={shirt:[B,.45],shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.76},seed:77};
const DEMO_K:AthleteStyle={shirt:[K,.7],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
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

// ---------------- the arena: wood court, stands (Spain red and yellow, Italy blue), futsal goal ----------------
/** stepped navy rows, lit faces, red and blue shirts, Spain (red-yellow-red) and Belgium (navy-yellow-red, vertical) flags, roof lights;
 * cheer lifts the heads; crowd = the share of seats taken (the real match drew 300, so the stands are thin); flags off in the training hall */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,crowd=1,flags=true){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977;if(hash(i,8)>crowd)continue;const hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.28)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: Spain (red-yellow-red bands) and Belgium (navy-yellow-red vertical bands), waving
 const navs=new Path2D();
 if(flags)for(let f=0;f<5;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  const col=(u0:number,u1:number)=>polyPath([pole(u0,0),pole(u1,0),pole(u1,1),pole(u0,1)],true);
  if(f%3===2){navs.addPath(col(0,1/3));yel.addPath(col(1/3,2/3));reds.addPath(col(2/3,1));}
  else{reds.addPath(band(0,.25));yel.addPath(band(.25,.75));reds.addPath(band(.75,1));}}
 s.fill(Y,heads,.6);s.knockout(yel);s.knockout(navs);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);s.fill(K,navs);
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
type CourtOpt={cheer?:number;flash?:number;keeper?:()=>void;crowd?:number;flags?:boolean};
function courtSide(s:Sheet,st:Stage,fr:Frame,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,crowd=1,flags=true}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 // planks run along the court (horizontal on screen), alternate strips tinted, butt joints staggered
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<46;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,fr,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,20]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,crowd,flags);
 goalNet(s,st,fr);o.keeper?.();goalPosts(s,st,fr);
}


// ================= the poke (local frame, his OWN goal at u = 0): poses, Rivera, the attacker, the ball, the keeper =================
/** READY: the fixo's stance — low on the balls of his feet, knees bent, a little side-on, arms loose and out for balance, eyes on the ball */
const READY=(b:number)=>posed({lHipF:26,rHipF:18,lKnee:44+6*b,rKnee:38+6*b,lAnk:-6,rAnk:-6,lHipA:14,rHipA:12,lHipR:10,rHipR:8,lean:22,pitch:4,neckP:6,
 lShA:30,rShA:30,lShF:10,rShF:4,lElb:44,rElb:40,twist:6,air:.015*b});
const nrm=(d:[number,number]):[number,number]=>{const l=Math.hypot(d[0],d[1])||1;return[d[0]/l,d[1]/l];};
/** where his right toe meets the ball, and where the attacker's big touch starts (the ball at the attacker's foot) */
const IC:[number,number]=[5.7,.3],AT_B:[number,number]=[9.2,1.35];
/** the ball's line after the big touch (also the attacker's running line) */
const DB=nrm([IC[0]-AT_B[0],IC[1]-AT_B[1]]);
/** facing up the ball's path as he pokes */
const YAW_I=yawTo(-DB[0],-DB[1]);
/** his place when his right toe meets the ball at full jab reach (lunge .6) */
const PL_I:[number,number]=(()=>{const sk=solve(lunge(.6,{side:'r'}),BUILD,{yaw:YAW_I}),toe=sk.rToe;return[IC[0]-toe[0],IC[1]+toe[2]];})();
/** where he waits at first: a couple of metres further out, then backs off to PL_I at the attacker's pace */
const R0:[number,number]=[PL_I[0]+1.9,PL_I[1]+.15];
/** the poke sends the ball sideways to HIS right (a little upfield), away from the attacker; it stops REST_D metres on */
const FACE:[number,number]=[Math.cos(YAW_I),Math.sin(YAW_I)],RIGHT:[number,number]=[Math.sin(YAW_I),-Math.cos(YAW_I)];
const D_POKE=nrm([RIGHT[0]+.1*FACE[0],RIGHT[1]+.1*FACE[1]]),REST_D=3;
const REST:[number,number]=[IC[0]+D_POKE[0]*REST_D,IC[1]+D_POKE[1]*REST_D];
/** after the poke he goes and collects it: he stops half a metre behind the ball */
const DR=nrm([REST[0]-PL_I[0],REST[1]-PL_I[1]]),COL:[number,number]=[REST[0]-DR[0]*.55,REST[1]-DR[1]*.55],YAW_C=yawTo(DR[0],DR[1]);
/** the attacker's body at the big touch (the ball half a metre ahead of him) and his dribbling pace */
const AB:[number,number]=[AT_B[0]-DB[0]*.5,AT_B[1]-DB[1]*.5],VA=2.2;
const YAW_A=yawTo(DB[0],DB[1]);
/** after the big touch the attacker chases but cannot catch it: ~1.8 m more */
const chaseA=(x:number)=>x<=0?0:1.8*(1-Math.exp(-x*VA/1.8));
type PokeT={drib:number;big:number;poke:number};
type Ball={u:number;y:number;v:number;moving:boolean;spin:number};
type Poke={rivera:LGen;att:LGen;gk:LGen;ball:(t:number)=>Ball;T:PokeT};
function makePoke(T:PokeT):Poke{
 const AS:[number,number]=[AB[0]-DB[0]*VA*(T.big-T.drib),AB[1]-DB[1]*VA*(T.big-T.drib)];
 const posA=(t:number):[number,number]=>{if(t<T.drib)return AS;if(t<T.big){const d=VA*(t-T.drib);return[AS[0]+DB[0]*d,AS[1]+DB[1]*d];}const d=chaseA(t-T.big);return[AB[0]+DB[0]*d,AB[1]+DB[1]*d];};
 /** dribble phase: a touch (touchPhase) lands exactly on the big touch */
 const rateA=runCadence(.45)*1.25,phA=(t:number)=>(t-T.big)*rateA+touchPhase+4;
 const col0=T.poke+.4,col1=T.poke+1.7;
 const posR=(t:number):[number,number]=>{
  if(t<T.drib)return R0;
  if(t<T.poke-.3){const p=sm(T.drib,T.poke-.3,t,easeIO);return[lerp(R0[0],PL_I[0],p),lerp(R0[1],PL_I[1],p)];}
  if(t<col0)return PL_I;
  const p=sm(col0,col1,t,x=>x*x*(3-2*x));return[lerp(PL_I[0],COL[0],p),lerp(PL_I[1],COL[1],p)];};
 const rivera:LGen=t=>{
  const b=Math.sin(t*5.4)*.5+.5,[u,v]=posR(t),[au,av]=posA(t);
  let pose:Pose=READY(b),yaw=yawTo(au-u,av-v);
  if(t>=T.drib&&t<T.poke+.4){
   // backing off at the attacker's pace, low, never diving in
   pose=blendPose(READY(b),backpedal((t-T.drib)*1.6),sm(T.drib,T.drib+.35,t,easeIO)*(1-sm(T.poke-.5,T.poke-.3,t,easeIO))*.8);
   // the jab: the near (right) leg shoots out, toe first; full reach on the poke
   const lu=key(t,[[T.poke-.3,.05],[T.poke,.6],[T.poke+.4,1]],linear);
   pose=blendPose(pose,lunge(lu,{side:'r'}),sm(T.poke-.34,T.poke-.2,t,easeIO));
   yaw=lerpAng(yaw,YAW_I,sm(T.poke-.5,T.poke-.15,t,easeIO));}
  else if(t>=T.poke+.4){
   const run=sm(col0,col0+.2,t,easeIO)*(1-sm(col1-.2,col1+.1,t,easeIO)),ph=(t-col0)*runCadence(.6)*1.1;
   pose=blendPose(lunge(1,{side:'r'}),runCycle(ph,{speed:.6}),run);
   if(t>col1-.2)pose=blendPose(pose,posed({lHipF:14,rHipF:34,lKnee:22,rKnee:30,rAnk:-18,lean:14,neckP:30,lShA:22,rShA:22,lElb:40,rElb:40}),sm(col1-.2,col1+.1,t,easeIO));
   yaw=lerpAng(YAW_I,YAW_C,sm(T.poke+.35,T.poke+.7,t,easeIO));}
  return{pose,yaw,u,v};};
 const att:LGen=t=>{
  const[u,v]=posA(t);let pose:Pose,yaw=YAW_A;
  if(t<T.drib){const b=Math.sin(t*4.6)*.5+.5;pose=posed({lHipF:18,rHipF:10,lKnee:26+6*b,rKnee:20+6*b,lean:16,neckP:26,lShA:22,rShA:22,lElb:40,rElb:40});}
  else if(t<T.big+.1)pose=blendPose(stand(),dribble(phA(t),{foot:'r',speed:.45}),sm(T.drib,T.drib+.25,t,easeIO));
  else{
   // the big touch has gone: he runs after it, reaches late with his left, then stops, hands on his head
   const ch=(t-T.big)*runCadence(.7)*1.15;pose=blendPose(dribble(phA(t),{foot:'r',speed:.45}),runCycle(ch+.3,{speed:.7}),sm(T.big+.05,T.big+.3,t,easeIO));
   const reach=key(t,[[T.poke-.2,.1],[T.poke+.15,.6],[T.poke+.6,.9]],linear);
   pose=blendPose(pose,lunge(reach,{side:'l'}),sm(T.poke-.25,T.poke-.05,t,easeIO)*(1-sm(T.poke+.7,T.poke+1.1,t,easeIO)));
   const late=sm(T.poke+.7,T.poke+1.2,t,easeIO);
   if(late>0)pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:-4,neckP:-10,lShF:120,rShF:120,lShA:40,rShA:40,lElb:120,rElb:120}),late);
   yaw=lerpAng(YAW_A,yawTo(REST[0]-u,REST[1]-v),sm(T.poke+.3,T.poke+.9,t,easeIO));}
  return{pose,yaw,u,v};};
 const gk:LGen=t=>{const[au,av]=posA(t);return{pose:keeperSet(t*1.3),yaw:yawTo(au-.7,av)*.6,u:.7,v:0};};
 const ball=(t:number):Ball=>{
  if(t<T.drib){const[au,av]=posA(t);return{u:au+DB[0]*.45,y:BALL_R,v:av+DB[1]*.45,moving:false,spin:0};}
  if(t<T.big){const[au,av]=posA(t),ph=phA(t)%1,lead=.42+.12*Math.sin(ph*TAU);return{u:au+DB[0]*lead,y:BALL_R,v:av+DB[1]*lead,moving:true,spin:(t-T.drib)*10};}
  if(t<T.poke){const p=sm(T.big,T.poke,t,x=>x*(1.3-.3*x));return{u:lerp(AT_B[0],IC[0],p),y:BALL_R,v:lerp(AT_B[1],IC[1],p),moving:true,spin:p*12};}
  const d=REST_D*(1-Math.exp(-(t-T.poke)/.42));return{u:IC[0]+D_POKE[0]*d,y:BALL_R,v:IC[1]+D_POKE[1]*d,moving:t<T.poke+1.2,spin:12+d*6};};
 return{rivera,att,gk,ball,T};
}
/** angle lerp the short way round */
function lerpAng(a:number,b:number,u:number){let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;}
/** a ball drawn on stage st through frame fr, with its floor shadow */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:Ball,seed:number,min=9,dir=0){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.moving?.25:0,dir});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** screen direction of the ball's travel (for the smear) */
function ballDir(st:Stage,fr:Frame,bf:(t:number)=>Ball,t:number){const a=bf(t-.05),b=bf(t),p=fp(st,fr,a.u,a.v),q=fp(st,fr,b.u,b.v);return Math.atan2(q[1]-p[1],q[0]-p[0]);}
/** a chest ring (the passage enters his shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'head'|'face'|'pelvis'|'rToe'|'lToe'|'chest'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** his reach: a dashed ring on the floor round his right foot (how far the jab can go) */
const REACH=1.25;
function reachRing(s:Sheet,st:Stage,fr:Frame,l:Loc,g:number,seed:number,hot=0){if(g<=.02)return;const[u,v]=[l.u+RIGHT[0]*.3+FACE[0]*.35,l.v+RIGHT[1]*.3+FACE[1]*.35],[X,Z]=toStage(fr,u,v);
 floorDashRing(s,st,K,X,Z,REACH,20,seed,g);floorDashRing(s,st,hot>.5?R:Y,X,Z,REACH,12,seed+1,g);}
/** the ball's distance from the attacker's foot (the "big touch" gap), as a red dashed line from his front toe to the ball */
function gapLine(s:Sheet,st:Stage,fr:Frame,P:Poke,t:number,g:number,seed:number,width=12){if(g<=.02)return;const a=P.att(t),b=P.ball(t),toe=jointPt(st,fr,a,'rToe'),bp=fp(st,fr,b.u,b.v,BALL_R);redLane(s,[toe,L2(toe,bp,.5),bp],width,seed,{progress:g});}

// ================= chapter 1 — LIVE: Spain v Belgium, EURO 2026 Group C, Tivoli Hall. Only confirmed things: the teams lined up, Rivera the
// deepest Spain outfield player, (cut) the celebration of his 2'17" goal with the board at 1–0, (cut) the 10–3 end. No goal, pass or tackle of
// the match is staged. Local u here = metres from BELGIUM's goal (Spain attack towards u = 0). ==========
const C1={lj:A(0,'in Ljubljana'),spain:A(0,'Spain play'),riv:A(0,'Rivera'),fixo:A(0,'fixo'),last:A(0,'last defender'),after:A(0,'After just'),scores:A(0,'scores'),first:A(0,'first goal'),win:A(0,'Spain win'),ten:A(0,'ten to three'),end:AUTH[0].seconds};
/** two whip pans (cuts in time): line-up → the celebration of his goal (2'17", 1–0) → the end (10–3) */
const W0=C1.after-.1,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** the line-up: Spain (attacking u → 0) in their half, Rivera the deepest outfield player, central (positions inferred) */
const KO_ESP:[number,number][]=[[27.4,.4],[23.6,-4.2],[23.1,5.4],[20.9,.7]];// Rivera, right ala, left ala, pivot
const KO_BEL:[number,number][]=[[18.4,-2.2],[16.2,4.6],[16.4,-5],[13.2,.3]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** the celebration of his goal (spot inferred), and the end: Spain in a knot in the middle */
const CEL1:[number,number]=[9.4,-2.4],FIN:[number,number]=[17.2,.6];
function lineupGen(i:number,team:'esp'|'bel'):LGen{const p=(team==='esp'?KO_ESP:KO_BEL)[i];return t=>({pose:idle(t,i+(team==='esp'?0:.37)),yaw:team==='esp'?Math.PI:0,u:p[0],v:p[1]});}
const phaseOf=(T:number)=>T<WM?0:T<VM?1:2;
const liveR:LGen=T=>{const ph=phaseOf(T);
 if(ph===0)return lineupGen(0,'esp')(T);
 if(ph===1){const run=sm(WM,WM+1.1,T,easeOut);return{pose:run<.9?celebrate((T-WM)*1.2,{kind:'run'}):celebrate((T-WM)*1.1,{kind:'arms'}),yaw:-Math.PI/2+.5-run*.3,u:CEL1[0]+2.4*(1-run),v:CEL1[1]+1.2*(1-run)};}
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2-.35,u:FIN[0]+.3,v:FIN[1]-1.2};};
const liveEsp=(i:number):LGen=>T=>{// i = 0..2: right ala, left ala, pivot
 const ph=phaseOf(T);
 if(ph===0)return lineupGen(i+1,'esp')(T);
 if(ph===1){const from=([[14.6,1.8],[15.8,-6.2],[8.2,2.8]] as [number,number][])[i],go=sm(WM,WM+1.5,T,easeOut),tgt:[number,number]=[CEL1[0]+[.9,-.8,1.2][i],CEL1[1]+[-.9,.9,.8][i]],u=lerp(from[0],tgt[0],go),v=lerp(from[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(CEL1[0]-u,CEL1[1]-v),u,v};}
 const spot=([[FIN[0]-.9,FIN[1]+1.1],[FIN[0]+.8,FIN[1]+1.2],[FIN[0]-.6,FIN[1]-.2]] as [number,number][])[i];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.2,.5][i],u:spot[0],v:spot[1]};};
/** Belgium after the goal and at the end: heads down, hands on hips */
const DOWN=posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:30,rShA:30,lShF:-20,rShF:-20,lElb:110,rElb:110});
const liveBel=(i:number):LGen=>T=>{const ph=phaseOf(T);if(ph===0)return lineupGen(i,'bel')(T);
 const base=(ph===1?[[5.2,3.6],[6.4,-6.2],[3.2,-.9],[13.4,5.8]]:[[22.2,5.8],[24.4,-6.6],[26.2,2.2],[20.6,7.4]])[i] as [number,number];
 return{pose:DOWN,yaw:ph<2?(i%2?.7:-.5):Math.PI*.8,u:base[0],v:base[1]};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:DOWN,yaw:.4,u:.8,v:-.4};
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.spain,.8],[C1.riv,6.4],[C1.last,6.6],[W0,6.8],[W1,-9.4],[C1.first,-9.2],[V0,-8.6],[V1,-3.2],[C1.end,-3]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.spain,.6],[C1.riv+.2,.88],[C1.fixo,.96],[C1.last,.8],[W0,.8],[W1,.9],[C1.first,.96],[V0,.96],[V1,.98],[C1.end,1.04]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.riv+.2,1000],[C1.last,1040],[W1,990],[V0,990],[V1,960],[C1.end,950]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'3':[0,2,3,5,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the arena scoreboard: Spain left (red tab), Belgium right (blue tab); ring = a yellow ring round Spain's score */
function scoreboard(s:Sheet,st:Stage,camX:number,l:string,r:string,ring=0){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19,dw=h*.72;
 const tabs=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);s.fill(ink,p);};tabs(R,cx-W*.38);tabs(B,cx+W*.22);
 const lx=cx-W*.12-dw*l.length;for(let k=0;k<l.length;k++)digit(lit,l[k],lx+k*dw,y,h);
 lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);
 for(let k=0;k<r.length;k++)digit(lit,r[k],cx+W*.12+k*dw+(dw-h*.55),y,h);s.fill(Y,lit);
 if(ring>.02){const c:Pt=[lx+dw*l.length/2-h*.1,y+h*.5],rr=h*(.5+.3*l.length)*ring;s.fill(Y,ribbon(blob(c[0],c[1],rr,rr*.8,151,{n:20}),Math.max(5,h*.09),{seed:152,close:true,wobble:1.2}),1);}
}
const ST1=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=ST1(c.x),ph=phaseOf(T);
 cam(s,0,c.y,c.zoom);
 courtSide(s,st,FA,T,{cheer:ph===0?.1:.9,crowd:.3,flash:ph===1?pulse(T,WM,1.2)+.5*pulse(T,C1.first,1):ph===2?pulse(T,VM,1.2)+.6*pulse(T,C1.ten,1.2):0,
  keeper:()=>{athlete(s,st,FA,liveGK,T,BEL_GK,{detail:'low'});}});
 if(ph>0)scoreboard(s,st,c.x,ph===1?'1':'10',ph===1?'0':'3',ph===1?easeOutBack(sm(C1.first,C1.first+.4,T)):easeOutBack(sm(C1.ten+.1,C1.ten+.5,T)));
 const items:Item[]=[];
 KO_BEL.forEach((_,i)=>{const g=liveBel(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,BEL(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveEsp(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:'low'})});});
 items.push({z:depth(FA,liveR(T))-.02,draw:()=>athlete(s,st,FA,liveR,T,RIVERA,{detail:'mid'})});
 // the ball on the centre spot while the teams line up
 if(ph===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,moving:false,spin:0},18);}});
 // "fixo": a red dashed ring under him; "last defender": a yellow line across the court at his feet (nobody from Spain is deeper but the keeper)
 if(ph===0){const l=liveR(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.fixo,C1.fixo+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,R,X,Z,1.15,14,51,g);}});
  const ln=sm(C1.last,C1.last+.6,T,easeOut)*(1-sm(W0-.3,W0,T));if(ln>.02)items.push({z:20.5,draw:()=>{const pts=[fp(st,FA,l.u+.9,-9.6),fp(st,FA,l.u+.9,0),fp(st,FA,l.u+.9,9.6)];cased(s,pts,14,52,{dash:46,progress:ln});}});}
 // "scores": a red dashed ring under the scorer as his team-mates arrive
 if(ph===1){const l=liveR(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.scores,C1.scores+.35,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.2,22,53,g);floorDashRing(s,st,R,X,Z,1.2,14,54,g);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(ST1(liveCam(tc).x),FA,liveR(tt),.14));},still:C1.fixo+.3};

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, side-on, his goal on the LEFT): wait, big touch, poke =================
const C2={famous:A(1,'Rivera is'),tackle:A(1,'poke tackle'),how:A(1,'Watch how'),low:A(1,'stays low'),waits:A(1,'waits'),att:A(1,'The attacker'),drib:A(1,'dribbles'),big:A(1,'big touch'),pokes:A(1,'pokes'),toe:A(1,'his toe'),end:AUTH[1].seconds};
const T2:PokeT={drib:C2.drib-.15,big:C2.big+.12,poke:C2.pokes+.1};
const poke=makePoke(T2);
const ST2:Stage={F:5200,eye:4.2,cx:-9.5,cz:-14};
/** screen point of a local floor spot on the chapter-2 stage (camera keys are written in court metres) */
const s2=(u:number,v:number,y=.9)=>fp(ST2,FA,u,v,y);
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=ST2,hit=pulse(t,T2.poke,.35);
  const pR=s2(PL_I[0]+1,PL_I[1]),pM=s2((PL_I[0]+AB[0])/2+1.2,.6),pP=s2(IC[0]+.4,IC[1]-.6),pE=s2(COL[0]+.3,COL[1]);
  camPath(s,t,[[0,pR[0],pR[1],1.05],[C2.tackle,pR[0]-40,pR[1],1.2],[C2.how,pR[0],pR[1],1.05],[C2.waits,pR[0]+60,pR[1],1],[C2.att,pM[0],pM[1],.84],[C2.drib+.4,pM[0]-60,pM[1],.86],[C2.big,pP[0]+80,pP[1],.98],[T2.poke,pP[0],pP[1],1.14],[C2.toe,pE[0],pE[1],1.05],[C2.end,pE[0],pE[1],1.05]],[5*hit*Math.sin(t*80),0]);
  courtSide(s,st,FA,tt,{cheer:0,crowd:.04,flags:false,flash:.5*pulse(tt,T2.poke,1),keeper:()=>{athlete(s,st,FA,poke.gk,tt,DEMO_K,{detail:'mid'});}});
  const R_=poke.rivera(tt),Aa=poke.att(tt),[RX,RZ]=toStage(FA,R_.u,R_.v);
  // "Rivera is famous": a red dashed ring under him
  const rg=easeOutBack(sm(C2.famous,C2.famous+.35,tt))*(1-sm(C2.how-.2,C2.how+.2,tt));
  if(rg>.02){floorDashRing(s,st,K,RX,RZ,1,20,210,rg);floorDashRing(s,st,R,RX,RZ,1,12,211,rg);}
  // "stays low": his reach ring (how far the jab can go); it flashes red when the ball rolls into it
  const b=poke.ball(tt),inR=Math.hypot(b.u-IC[0],b.v-IC[1])<REACH+.3&&tt<T2.poke+.2&&tt>T2.big?1:0;
  const rr=easeOutBack(sm(C2.low,C2.low+.35,tt))*(1-sm(T2.poke+.3,T2.poke+.7,tt));
  reachRing(s,st,FA,R_,rr,212,inR);
  // "waits": a short yellow arrow behind him — he backs off at the attacker's pace (never dives in)
  const wa=sm(C2.waits,C2.waits+.4,tt,easeOut)*(1-sm(C2.big-.2,C2.big+.2,tt));
  if(wa>.02){const pts=[fp(st,FA,R0[0]-.2,R0[1]-1.5),fp(st,FA,lerp(R0[0],PL_I[0],.5)-.2,R0[1]-1.5),fp(st,FA,PL_I[0]-.4,PL_I[1]-1.5)];cased(s,pts,11,213,{dash:36,progress:wa});if(wa>.9)casedHead(s,pts,32,214);}
  // "The attacker": a navy ring under him; "dribbles": his line toward the goal
  const ar=easeOutBack(sm(C2.att,C2.att+.35,tt))*(1-sm(C2.big,C2.big+.3,tt)),[AX,AZ]=toStage(FA,Aa.u,Aa.v);
  if(ar>.02){floorDashRing(s,st,Y,AX,AZ,1,20,215,ar);floorDashRing(s,st,K,AX,AZ,1,12,216,ar);}
  const items:Item[]=[
   {z:AZ,draw:()=>athlete(s,st,FA,poke.att,tt,DEMO_A,{detail:'mid'})},
   {z:RZ-.001,draw:()=>athlete(s,st,FA,poke.rivera,tt,RIVERA_T,{detail:'high',smear:(tt>T2.poke-.3&&tt<T2.poke+.15)?.1:0})},
   {z:depth(FA,b)-.02,draw:()=>{drawBallL(s,st,FA,b,221,9,ballDir(st,FA,poke.ball,tt));if(tt>=T2.poke&&tt<T2.poke+.4){const p=fp(st,FA,IC[0],IC[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:222,g:easeOut(sm(T2.poke,T2.poke+.25,tt))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "big touch": the gap between his foot and the ball shows as a red dashed line (the ball is nobody's now)
  const gp=sm(C2.big,C2.big+.3,tt,easeOut)*(1-sm(T2.poke,T2.poke+.2,tt));
  gapLine(s,st,FA,poke,tt,gp,217);
  // "pokes": a red ring round his right toe as it meets the ball; "his toe": the ball's yellow arrow away to the side
  const bt=easeOutBack(sm(T2.poke-.05,T2.poke+.25,tt))*(1-sm(C2.toe+.4,C2.toe+.8,tt));
  if(bt>.02){const tp=jointPt(st,FA,R_,'rToe'),r=kAt(st,RZ)*.34*bt;s.fill(R,ribbon(blob(tp[0],tp[1],r,r*.75,223,{n:22}),9,{seed:224,close:true,wobble:1}),1);}
  const ga=sm(T2.poke+.1,T2.poke+.6,tt,easeOut)*(1-sm(C2.end-.8,C2.end-.3,tt));
  if(ga>.02){const pts=[fp(st,FA,IC[0]+D_POKE[0]*.5,IC[1]+D_POKE[1]*.5),fp(st,FA,IC[0]+D_POKE[0]*1.6,IC[1]+D_POKE[1]*1.6),fp(st,FA,IC[0]+D_POKE[0]*2.6,IC[1]+D_POKE[1]*2.6)];cased(s,pts,12,225,{dash:40,progress:ga});if(ga>.9)casedHead(s,pts,36,226);}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(ST2,FA,poke.rivera(tt),.13));},
 still:C2.low+.4,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: knee-high, the same court turned round, his goal on the RIGHT) =================
const C3={watch:A(2,'Watch'),wait:A(2,'Wait'),big:A(2,'big touch'),poke:A(2,'poke'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq3(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.big-2.2],[C3.wait,T2.big-1.4],[C3.big,T2.big+.05],[C3.poke,T2.poke],[C3.end,T2.poke+1.4]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const riv3=g3(poke.rivera),att3=g3(poke.att),gk3=g3(poke.gk);
const ST3:Stage={F:2100,eye:1.05,cx:14.6,cz:-.5};
const s3=(u:number,v:number,y=.9)=>fp(ST3,FR,u,v,y);
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=ST3,q=seq3(tt),hit=pulse(q,T2.poke,.4);
  const pA=s3((PL_I[0]+AT_B[0])/2,.6),pP=s3(IC[0],IC[1]),pE=s3((IC[0]+COL[0])/2,(IC[1]+COL[1])/2);
  camPath(s,t,[[0,pA[0],pA[1]-60,.9],[C3.wait,pA[0],pA[1]-60,.92],[C3.big,pP[0]+60,pP[1]-60,1],[C3.poke,pP[0],pP[1]-40,1.12],[C3.end,pE[0],pE[1]-40,1]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  courtSide(s,st,FR,tt,{cheer:0,crowd:.04,flags:false,flash:.6*pulse(q,T2.poke,1.2),keeper:()=>{athlete(s,st,FR,gk3,tt,DEMO_K,{detail:'low'});}});
  const R_=riv3(tt),[,RZ]=toStage(FR,R_.u,R_.v),b=poke.ball(q);
  // "Wait": his reach ring; red while the ball is inside it
  const inR=Math.hypot(b.u-IC[0],b.v-IC[1])<REACH+.3&&q<T2.poke+.2&&q>T2.big?1:0;
  reachRing(s,st,FR,R_,easeOutBack(sm(C3.wait,C3.wait+.35,tt))*(1-sm(C3.poke+.3,C3.poke+.7,tt)),301,inR);
  const items:Item[]=[
   {z:depth(FR,att3(tt)),draw:()=>athlete(s,st,FR,att3,tt,DEMO_A,{detail:'mid'})},
   {z:RZ-.001,draw:()=>athlete(s,st,FR,riv3,tt,RIVERA_T,{detail:'high',smear:(q>T2.poke-.3&&q<T2.poke+.2)?.45:0})},
   {z:depth(FR,b)-.02,draw:()=>{drawBallL(s,st,FR,b,311,10,ballDir(st,FR,poke.ball,q));if(q>=T2.poke&&q<T2.poke+.4){const p=fp(st,FR,IC[0],IC[1],.2);sparkBurst(s,Y,p[0],p[1],140,{n:11,seed:312,g:easeOut(sm(T2.poke,T2.poke+.3,q))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "big touch": the red gap from his foot to the ball
  gapLine(s,st,FR,poke,q,sm(C3.big,C3.big+.3,tt,easeOut)*(1-sm(C3.poke,C3.poke+.2,tt)),302,13);
  // "poke": a red ring round the right toe as it meets the ball
  const bt=easeOutBack(sm(C3.poke-.05,C3.poke+.3,tt))*(1-sm(C3.end-.6,C3.end-.2,tt));
  if(bt>.02){const tp=jointPt(st,FR,R_,'rToe'),r=kAt(st,RZ)*.36*bt;s.fill(R,ribbon(blob(tp[0],tp[1],r,r*.75,321,{n:22}),10,{seed:322,close:true,wobble:1}),1);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(ST3,FR,riv3(tt),.13));},
 still:C3.poke+.2,
};

// ================= chapter 4 — YOUR TURN: he runs it again; three cards (wait, big touch, poke); a tick =================
const C4={your:A(3,'Your'),pushes:A(3,'attacker pushes'),far:A(3,'too far'),poke:A(3,'poke it'),toe:A(3,'your toe'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.big-2.6],[C4.pushes,T2.big-.1],[C4.far,T2.big+.35],[C4.poke,T2.poke],[C4.end,T2.poke+1.7]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const riv4=g4(poke.rivera),att4=g4(poke.att),gk4=g4(poke.gk);
const ST4:Stage={F:2000,eye:1.9,cx:12.6,cz:-2};
const CARD_Y=660,CARD_W=175,CARDS:[number,number,'wait'|'touch'|'poke'][]=[[-420,0,'wait'],[0,0,'touch'],[420,0,'poke']];
CARDS[0][1]=C4.your+.3;CARDS[1][1]=C4.far;CARDS[2][1]=C4.poke;
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=ST4,q=seq4(tt);
  camPath(s,t,[[0,-80,40,.98],[C4.your+.4,-40,300,.86],[C4.far,-20,300,.86],[C4.toe,-100,290,.86],[C4.end,-160,290,.87]]);
  courtSide(s,st,FR,tt,{cheer:0,crowd:.04,flags:false,flash:.5*pulse(q,T2.poke,1.2),keeper:()=>{athlete(s,st,FR,gk4,tt,DEMO_K,{detail:'low'});}});
  const R_=riv4(tt),[,RZ]=toStage(FR,R_.u,R_.v),b=poke.ball(q);
  // "too far": the red gap from the attacker's foot to the ball
  gapLine(s,st,FR,poke,q,sm(C4.far,C4.far+.3,tt,easeOut)*(1-sm(C4.poke,C4.poke+.2,tt)),401,12);
  const items:Item[]=[
   {z:depth(FR,att4(tt)),draw:()=>athlete(s,st,FR,att4,tt,DEMO_A,{detail:'mid'})},
   {z:RZ-.001,draw:()=>athlete(s,st,FR,riv4,tt,RIVERA_T,{detail:'mid',smear:q>T2.poke-.3&&q<T2.poke+.1?.2:0})},
   {z:depth(FR,b)-.02,draw:()=>{drawBallL(s,st,FR,b,411,10);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (wait, big touch, poke)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='poke'?-40:kind==='touch'?-95:10),y:gy+25,height:330*(.9+.1*on),azimuth:kind==='wait'?60:kind==='touch'?0:-50,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='wait'?READY(.5):kind==='touch'?dribble(touchPhase+.12,{foot:'r',speed:.45}):lunge(.6,{side:'r'});
    const csk=solve(pose,BUILD,{}),Pp=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // wait = a pause mark (two bars) above him; touch = the ball far ahead of the attacker's foot, a red dashed gap; poke = the ball on the right toe, a red ring
    if(kind==='wait'){const h=Pp(csk.head),bars=new Path2D();bars.rect(h[0]+70,h[1]-40,16,56);bars.rect(h[0]+98,h[1]-40,16,56);s.fill(R,bars);}
    drawAthlete(s,pose,fc,{...(kind==='touch'?DEMO_A:RIVERA_T),detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='touch'){const tb:V3=[csk.rToe[0]+1.05,BALL_R,csk.rToe[2]],p0=Pp(tb),tp=Pp(csk.rToe),bR=BALL_R*(fc.scale?fc.scale(tb):100);dashed(s,R,[tp,L2(tp,p0,.5),p0],7,84,{dash:20});ball(s,p0[0],p0[1],bR,81+i);}
    if(kind==='poke'){const tb:V3=[csk.rToe[0]+.1,BALL_R,csk.rToe[2]],p0=Pp(tb),bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);s.fill(R,ribbon(blob(p0[0],p0[1],bR*2.2,bR*1.8,90,{n:18}),6,{seed:93,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "your toe": a big tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4.toe+.2,C4.toe+.55,tt));
  if(tick>.02){const g=fp(st,FR,R_.u,R_.v),h=kAt(st,RZ)*1.8,c:Pt=[g[0]-h*.7,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.poke+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'adrian-rivera-futsal-signature',format:'futsal',title:'Adrián Rivera: the timed poke tackle',theme:'Poke the ball away with your toe when the attacker takes a big touch.',
 ageNote:'For players aged 7–12: the 2026 match, his first goal and the 10–3 are real; the poke tackle is shown as a demonstration. Wait for the big touch, poke the ball, not the player.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in; a yellow toe-arrow jabs and pokes it off sideways; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const roll=sm(0,.3,age,easeOut),pk=sm(.35,.7,age,easeOut),bx=x-160*(1-roll),by=y-150*pk;
  const sp=sm(.2,.4,age,easeOut)*(1-sm(.8,1.1,age));if(sp>.02){const pts:Pt[]=[[x+10,y+r*2.6],[x+5,y+r*1.9],[x,y+r*1.2]];s.fill(Y,ribbon(partial(pts,sp),12,{seed,taper:.3,wobble:1}),1);arrowHead(s,Y,partial(pts,sp),30,seed+4);}
  s.fill(K,polyPath(blob(bx,by+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:(1-roll)*6+pk*4});
  if(age>.35&&age<.7)sparkBurst(s,Y,x,y,90,{n:8,seed:seed+5,g:easeOut(sm(.35,.6,age))});
 },
};
export default film;
