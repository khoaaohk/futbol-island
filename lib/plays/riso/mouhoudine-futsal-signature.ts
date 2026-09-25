/** Souheil Mouhoudine — "the tall fixo who steals it": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Souheil Mouhoudine, France's futsal captain (card bio, lib/town/playerBios.json: "French futsal captain from the Paris area, one of
 *  France's top scorers ever, who helped them reach fourth place at the 2024 World Cup"; card role fixo; FC Barcelona's squad lists him as a
 *  defender, No. 22). Not to be confused with any football namesake.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the tall fixo who reaches passes and steals the ball — not one match.
 *  No written source we could reach describes a single Mouhoudine interception, so the film follows the brief's honest fallback: it opens on
 *  a REAL, documented match he decided — France 4–2 Ukraine after extra time, the UEFA Futsal EURO 2026 QUARTER-FINAL, 31 Jan 2026, Arena
 *  Riga — showing ONLY confirmed things (the arena, the teams, 1–1 after the regulation 40 minutes, the celebrations of his extra-time
 *  hat-trick with the scoreboard at 2–1, 3–1 and 4–1, the 4–2 final whistle, Player of the Match). None of his goals, passes or tackles in
 *  that match is staged. Then "This is how he wins the ball" shows the long-leg interception in a separate, labelled demonstration in neutral
 *  training kit that is never passed off as that match. (The EURO 2026 semi-final France 1–4 Portugal is already used by the Bernardo Paçó
 *  film, the final by the Plana / Mayor / Pauleta films, and Spain–Italy by the Antonio Pérez film; no other film uses France v Ukraine.)
 *  1  LIVE (broadcast camera, main stand): the quarter-final in Riga, France (all blue) v Ukraine; the teams line up for the extra-time
 *     kick-off at 1–1; the captain's armband ringed; whip pan (a cut in time) to his celebrations — the scoreboard ticks 2–1 ("one"), 3–1
 *     ("two"), 4–1 ("three"), three balls pop over his head, and after the third he carries a team-mate on his back; whip pan to the
 *     final whistle, 4–2, France celebrate, the headline names him Player of the Match.
 *  2  HOW HE WINS THE BALL (a demonstration, real time, side-on from the main stand, his own goal on the LEFT; neutral paper/navy attackers,
 *     a blue-bib keeper, Mouhoudine in a plain yellow training top — no match claimed): he waits a step off the passing lane and watches the
 *     pass; the ball is played past him towards the pivot; he stretches his long LEFT leg across the lane, pokes it away, and attacks.
 *  3  WATCH AGAIN (slow-motion replay, reverse angle: knee-high, his goal on the RIGHT): read the pass (the lane lights up), the reach (a
 *     yellow arc on the floor shows how far one long leg covers), poke it away (the left boot ringed), go.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Use your long legs to reach passes and win the ball back."): he runs it again; three
 *     cards (read, reach, win); a tick.
 * Sources (written; fetched with curl once and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Futsal Euro 2026" (raw, cached; wiki-futsal-euro-2026.txt): quarter-final 31 January 2026, 17:00, Arena Riga, Riga:
 *    France 4–2 Ukraine (a.e.t.); goals Gueddoura 27'05", Mouhoudine 40'51" (pen.), 44'55", 47'19" (France); Zhuk 29'01" (pen.), Korsun
 *    47'34" (pen.) (Ukraine); attendance 1,821; man of the match Mouhoudine; his hat-trick listed among the tournament's three-goal games;
 *    joint top scorer of the finals (7 goals, with Antonio Pérez). https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2026
 *  - UEFA.com match centre, "France vs Ukraine" (live blog, fetched Sep 2026; uefa-futsaleuro2026-qf-fra-ukr.html / -commentary.txt):
 *    https://www.uefa.com/futsaleuro/match/2046722--france-vs-ukraine/ — "regulation time ended with the teams locked at 1-1 but there was
 *    simply no stopping France in extra time, and that man Souheil Mouhoudine"; "47'19'' Mouhoudine scores for France! … Assist by Guirio";
 *    "Souheil Mouhoudine has been named Player of the Match"; "France's hat-trick hero"; coach Raphaël Reynaud: "Mouhoudine as a great
 *    leader who was key in bringing us this victory"; "Flying goalkeeper on for Ukraine" (late in extra time); keeper Lokoka "conceded just
 *    two of the 45 shots Ukraine mustered".
 *  - UEFA.com photos from that live blog (cached jpgs, looked at, not published): the Player of the Match card shows him in France's royal-blue
 *    long-sleeved shirt, No. 11, captain's armband on his LEFT arm, short dark hair; the photo posted with "now the finals joint top scorer"
 *    (straight after the 47'19" goal) shows No. 11 carrying a bald, bearded team-mate on his back, France all in blue (blue shirts, blue shorts
 *    with red/white trim, blue socks), on a blue court.
 * CONFIRMED: the match, date, venue, round (quarter-final), 1–1 after regulation time, extra time, his three goals (40'51" pen., 44'55",
 *  47'19") taking it to 2–1, 3–1, 4–1, the 4–2 final score, Player of the Match, captain's armband, No. 11, France's all-blue kit, the blue
 *  court. The narration only states these (plus the entry's signature, framed as "how he wins the ball").
 * INFERRED (not named in the narration): Ukraine's kit (yellow shirts, blue shorts, yellow socks — their usual first strip; not checked
 *  for that night), the keepers' colours; which end each team attacked; every position in chapter 1; where each celebration happened and
 *  that the carry followed the THIRD goal (the photo was posted with the post after it); the scoreboard's look; his height (card: "tall";
 *  drawn 1.90 m — not sourced); his skin tone from the photo. No video was reviewed. Chapters 2–4 are a demonstration of the interception,
 *  not a recreation of any match play (the left leg for the poke, the right foot for the carry, and the angles are chosen to read clearly).
 * Technique (poses): the fixo waits a step off the passing lane, low on the balls of his feet, eyes on the passer; as the pass is struck he
 *  takes one short step and stretches the near (LEFT, facing up the pass) leg across the lane — a long leg covers a lot of floor, so he doesn't need to run
 *  in front of the attacker — pokes the ball away with the toe, and carries it forward into the space.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the step and the poke). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across);
 *  each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are LEFT-handed (X right,
 *  Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: blue (France, the blue court), yellow (Ukraine, lights, diagrams, training top), red (pass lane, arrows, trim), navy (key line,
 *  stands, shorts). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window
 *  1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,runCycle,runCadence,dribble,lunge,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: EURO 2026',text:'The 2026 Futsal EURO quarter-final, in Riga. France play Ukraine. It is one all after forty minutes. In extra time, captain Mouhoudine scores: one, two, three goals! France win four two.',tail:2.6,
  cues:['The 2026','in Riga','France play','one all','In extra','captain','scores','one','two','three goals','France win','four two'],
  heads:{'The 2026':'Quarter-final 2026','one all':'1–1','In extra':'Extra time','captain':'Captain, No. 11','three goals':'Hat-trick!','four two':'Player of the Match'}},
 {label:'How he wins the ball',text:'Mouhoudine plays at the back. This is how he wins the ball: he watches the pass. It looks past him, but he stretches his long leg, pokes it away and attacks!',tail:2.2,
  cues:['Mouhoudine plays','at the back','This is how','watches the pass','It looks','past him','stretches','long leg','pokes','attacks'],heads:{'Mouhoudine plays':'The tall fixo','attacks':''}},
 {label:'Watch again',text:'Slow motion now. Read the pass, stretch that long leg, poke it away, go!',tail:2.2,
  cues:['Slow motion','Read the pass','stretch','long leg','poke it','go'],heads:{'Slow motion':'Slow motion','go':''}},
 {label:'Your turn',text:'Your turn: use your long legs to reach passes, and win the ball back!',tail:2.8,
  cues:['Your turn','long legs','reach passes','win the ball'],heads:{'Your turn':'Read, reach, win','win the ball':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/mouhoudine-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/mouhoudine-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/mouhoudine-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mouhoudine: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue in chapter i whose words are w (exact match first, else the first that starts with w; throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words===w)??AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('mouhoudine: no cue '+w);return c.at;};
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
type Loc={pose:Pose;yaw:number;u:number;v:number;y?:number};
type LGen=(t:number)=>Loc;

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number,y=0):Place=>({x:X,y,z:-Z,yaw});
/** yaw that faces the floor direction (du,dv) (library yaw 0 faces +u; + turns toward +v) */
const yawTo=(du:number,dv:number)=>Math.atan2(dv,du);
/** his skin (from the UEFA photos): a deep brown screen */
const SKIN:InkFill[]=[[Y,.62],[R,.44],[K,.1]];
/** tall (card: "the tall fixo"; 1.90 m drawn — his height is not sourced) */
const BUILD={height:1.9,bulk:1.02};
/** Mouhoudine for France (CONFIRMED by the UEFA photos): royal-blue long-sleeved shirt, blue shorts with red/paper trim, blue socks, No. 11
 * in paper; short dark hair; the captain's armband on his LEFT arm (drawn by armband()) */
const MOU:AthleteStyle={shirt:B,shorts:B,socks:B,boots:'paper',skin:SKIN,hair:K,line:K,trim:R,sleeves:'long',hairStyle:'short',number:11,numberInk:'paper',build:BUILD,seed:9};
/** Mouhoudine in the demonstration and lesson: a plain yellow training top and navy shorts (no national kit, so no match is implied) */
const MOU_T:AthleteStyle={...MOU,shirt:[Y,.95],shorts:K,socks:K,trim:K,boots:'paper',sleeves:'short',number:null};
/** France team-mates: all blue (confirmed); the bald, bearded team-mate of the carry photo is FRA(1) */
const FRA=(n:number):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:'paper',skin:[[[Y,.74],[R,.3]],[[Y,.56],[R,.34],[K,.14]],[[Y,.42],[R,.36],[K,.24]]][n%3] as InkFill[],hair:K,line:K,trim:R,hairStyle:(['short','bald','curly'] as const)[n%3],build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Ukraine (kit INFERRED): yellow shirts, blue shorts, yellow socks */
const UKR=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:Y,boots:K,skin:[[[Y,.78],[R,.22]],[[Y,.72],[R,.28]]][n%2] as InkFill[],hair:K,line:K,trim:B,hairStyle:n%3?'short':'balding',build:{height:1.74+hash(n,4)*.12},seed:40+n});
/** France's keeper (colours inferred): red */
const FRA_GK:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.5],[R,.34],[K,.18]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.86},seed:61};
const UKR_GK:AthleteStyle={shirt:[R,.8],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:62};
/** the demonstration attackers and keeper: neutral training kit (no team is claimed in chapters 2–4) */
const DEMO_P:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.76},seed:77};
const DEMO_V:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.5],[R,.34],[K,.12]],hair:K,line:K,trim:R,hairStyle:'bald',build:{height:1.84,bulk:1.08},seed:79};
const DEMO_K:AthleteStyle={shirt:[B,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot,l.y??0);};
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
/** stepped navy rows, lit faces, red and blue shirts, Spain (red-yellow-red) and Italy (blue) flags, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),white=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.3)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.38)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: France (blue | white | red, vertical) and Ukraine (blue over yellow), waving
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  const col=(u0:number,u1:number)=>polyPath([pole(u0,0),pole(u1,0),pole(u1,.5),pole(u1,1),pole(u0,1),pole(u0,.5)],true);
  if(f%3===2){blues.addPath(band(0,.5));yel.addPath(band(.5,1));}
  else{blues.addPath(col(0,.34));white.addPath(col(.34,.67));reds.addPath(col(.67,1));}}
 s.fill(Y,heads,.6);s.knockout(yel);s.knockout(white);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
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

// ================= the steal (local frame, his OWN goal at u = 0): poses, Mouhoudine, the passer, the pivot, the ball, the keeper =================
/** READY: the fixo's stance — low on the balls of his feet, knees bent, a little side-on, arms loose and out for balance, eyes up */
const READY=(b:number)=>posed({lHipF:26,rHipF:18,lKnee:44+6*b,rKnee:38+6*b,lAnk:-6,rAnk:-6,lHipA:14,rHipA:12,lHipR:10,rHipR:8,lean:20,pitch:4,neckP:-4,
 lShA:30,rShA:30,lShF:10,rShF:4,lElb:44,rElb:40,twist:6,air:.015*b});
const PA0:[number,number]=[15.8,-4.2];// the passer (paper kit), out on the near side
const VB0:[number,number]=[7.2,3.5],VB1:[number,number]=[8.9,2.3];// the pivot (paper kit) shows short for the ball
const YAW_PA=yawTo(VB1[0]-PA0[0],VB1[1]-PA0[1]);
const PASS_POW=.45;
/** the ball at the passer's right boot at the strike's contact (local) */
const PB0:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:PASS_POW}),BUILD,{yaw:YAW_PA}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[PA0[0]+toe[0]+d[0]/l*.08,PA0[1]-(toe[2]+d[1]/l*.08)];})();
/** where the pass is aimed (just in front of the pivot's feet) and where Mouhoudine takes it (ICPT_F of the way along) */
const BT:[number,number]=[VB1[0]+.55,VB1[1]-.35],ICPT_F=.62;
const IC:[number,number]=[lerp(PB0[0],BT[0],ICPT_F),lerp(PB0[1],BT[1],ICPT_F)];
const YAW_I=yawTo(PB0[0]-IC[0],PB0[1]-IC[1]);// facing up the pass as he takes it
/** his place when his right toe meets the ball at full lunge reach */
const PL_I:[number,number]=(()=>{const sk=solve(lunge(.6,{side:'l'}),BUILD,{yaw:YAW_I}),toe=sk.lToe;return[IC[0]-toe[0],IC[1]+toe[2]];})();
/** the lane's unit direction and its goal-side normal (the side of the lane nearer his own goal) */
const LD:[number,number]=(()=>{const d=[BT[0]-PB0[0],BT[1]-PB0[1]],l=Math.hypot(d[0],d[1]);return[d[0]/l,d[1]/l];})();
const LN:[number,number]=LD[1]>0?[-LD[1],LD[0]]:[LD[1],-LD[0]];
/** where he waits: one short step off the lane, goal-side (the ball looks as if it will go past him) */
const STEP=.75;
const AP0:[number,number]=[PL_I[0]+LN[0]*STEP-LD[0]*.15,PL_I[1]+LN[1]*STEP-LD[1]*.15];
/** his one step: a gentle curve to the lunge spot */
const CTRL:[number,number]=[lerp(AP0[0],PL_I[0],.5)+LD[0]*.12,lerp(AP0[1],PL_I[1],.5)+LD[1]*.12];
const bez=(p:number):[number,number]=>{const a=(1-p)*(1-p),b=2*p*(1-p),c=p*p;return[a*AP0[0]+b*CTRL[0]+c*PL_I[0],a*AP0[1]+b*CTRL[1]+c*PL_I[1]];};
/** after the steal he goes forward into the space the pivot left (away from the passer) */
const GO:[number,number]=(()=>{const d=[.9,.44],l=Math.hypot(d[0],d[1]);return[d[0]/l,d[1]/l];})();
const YAW_GO=yawTo(GO[0],GO[1]);
const goDist=(x:number)=>x<=0?0:3.1*x-3.1*.45*(1-Math.exp(-x/.45));
type StealT={read:number;hit:number;step0:number;icpt:number};
type Steal={mou:LGen;passer:LGen;pivot:LGen;gk:LGen;ball:(t:number)=>{u:number;y:number;v:number;moving:boolean;spin:number}};
function makeSteal(T:StealT):Steal{
 const pos=(t:number):[number,number]=>{if(t<T.step0)return AP0;if(t<T.icpt){const p=sm(T.step0,T.icpt,t,x=>x*x*(1.6-.6*x));return bez(p);}const d=goDist(t-T.icpt-.15);return[PL_I[0]+GO[0]*d,PL_I[1]+GO[1]*d];};
 const yaw0=yawTo(PA0[0]-AP0[0],PA0[1]-AP0[1]);
 const mou:LGen=t=>{
  const b=Math.sin(t*5.4)*.5+.5;let pose:Pose,yaw=yaw0;const[u,v]=pos(t);
  if(t<T.step0){pose=READY(b);// eyes on the passer: a small scan, then locked on as he reads
   const look=sm(T.read-.2,T.read+.3,t,easeIO);pose={...pose,neckY:(1-look)*.35*Math.sin(t*1.7)};}
  else if(t<T.icpt){const ph=(t-T.step0)*runCadence(1)*1.05+.55,p=sm(T.step0,T.icpt,t,x=>x*x*(1.6-.6*x)),e=1e-3,a=bez(Math.max(0,p-e)),c=bez(Math.min(1,p+e));
   pose=blendPose(READY(b),runCycle(ph,{speed:1}),sm(T.step0,T.step0+.18,t,easeOut));
   pose=blendPose(pose,lunge(key(t,[[T.icpt-.3,.3],[T.icpt,.6]],linear),{side:'l'}),sm(T.icpt-.32,T.icpt-.04,t,easeIO));
   const run=yawTo(c[0]-a[0],c[1]-a[1]);yaw=lerpAng(lerpAng(yaw0,run,sm(T.step0,T.step0+.2,t,easeIO)),YAW_I,sm(T.icpt-.35,T.icpt-.02,t,easeIO));}
  else{const lu=key(t,[[T.icpt,.6],[T.icpt+.32,1]],linear),go=sm(T.icpt+.18,T.icpt+.55,t,easeIO),ph=(t-T.icpt)*runCadence(.8)*1.1;
   pose=blendPose(lunge(lu,{side:'l'}),dribble(ph,{foot:'r',speed:.8}),go);yaw=lerpAng(YAW_I,YAW_GO,sm(T.icpt+.08,T.icpt+.5,t,easeIO));}
  return{pose,yaw,u,v};};
 const strikeS=(t:number)=>key(t,[[T.hit-.5,.18],[T.hit,STRIKE_CONTACT],[T.hit+.5,.84],[T.hit+1.1,.98]],linear);
 const passer:LGen=t=>{
  let pose=blendPose(stand(),posed({lHipF:14,rHipF:20,lKnee:24,rKnee:30,lean:14,neckP:18,lShA:22,rShA:22,lElb:34,rElb:34}),.6);
  if(t>T.hit-.55)pose=blendPose(pose,strike(strikeS(t),{foot:'r',power:PASS_POW}),sm(T.hit-.55,T.hit-.4,t,easeIO));
  // after the steal: hands to his head, turning to watch
  const late=sm(T.icpt+.2,T.icpt+.8,t,easeIO);
  if(late>0)pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:-4,neckP:-10,lShF:120,rShF:120,lShA:40,rShA:40,lElb:120,rElb:120}),late);
  return{pose,yaw:YAW_PA+late*.6,u:PA0[0],v:PA0[1]};};
 const pivot:LGen=t=>{
  const go=sm(T.hit-.4,T.hit+.5,t,easeIO),u=lerp(VB0[0],VB1[0],go),v=lerp(VB0[1],VB1[1],go),yp=yawTo(PA0[0]-u,PA0[1]-v);
  const b=Math.sin(t*5)*.5+.5;
  let pose=blendPose(posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36}),runCycle((t-T.hit)*1.8,{speed:.35}),go*(1-go)*4>1?1:go*(1-go)*4);
  // showing for it: an arm out calling, the right foot ready
  pose=blendPose(pose,posed({lHipF:22,rHipF:30,lKnee:30,rKnee:36,lean:10,neckP:10,lShF:40,lShA:50,lElb:20,rShA:24,rElb:40}),sm(T.hit+.3,T.hit+.6,t,easeIO));
  // too late: he turns and chases
  const ch=sm(T.icpt+.1,T.icpt+.5,t,easeIO);let uu=u,vv=v,yaw=yp;
  if(ch>0){const d=goDist(t-T.icpt-.4)*.72;uu=u+GO[0]*d;vv=v+GO[1]*d;yaw=lerpAng(yp,YAW_GO,ch);pose=blendPose(pose,runCycle((t-T.icpt)*runCadence(.7),{speed:.7}),ch);}
  return{pose,yaw,u:uu,v:vv};};
 const gk:LGen=t=>({pose:keeperSet(t*1.3),yaw:yawTo(PA0[0],PA0[1])*.3,u:.7,v:0});
 const ballF=(t:number)=>{
  if(t<T.hit)return{u:PB0[0],y:BALL_R,v:PB0[1],moving:false,spin:0};
  if(t<T.icpt){const p=ICPT_F*sm(T.hit,T.icpt,t,x=>x*(1.12-.12*x));return{u:lerp(PB0[0],BT[0],p),y:BALL_R,v:lerp(PB0[1],BT[1],p),moving:true,spin:p*14};}
  // stolen: it squirts a little along the pass, then he carries it on his right foot, half a metre ahead
  const w=sm(T.icpt,T.icpt+.45,t,easeIO),[pu,pv]=pos(t),ph=((t-T.icpt)*runCadence(.8)*1.1)%1,lead=.5+.16*Math.sin(ph*TAU),
   loose:[number,number]=[IC[0]+(BT[0]-PB0[0])*.03*sm(T.icpt,T.icpt+.2,t),IC[1]+(BT[1]-PB0[1])*.03*sm(T.icpt,T.icpt+.2,t)],
   foot:[number,number]=[pu+GO[0]*lead+Math.sin(YAW_GO)*.12,pv+GO[1]*lead-Math.cos(YAW_GO)*.12];
  return{u:lerp(loose[0],foot[0],w),y:BALL_R,v:lerp(loose[1],foot[1],w),moving:true,spin:14+(t-T.icpt)*12};};
 return{mou,passer,pivot,gk,ball:ballF};
}
/** angle lerp the short way round */
function lerpAng(a:number,b:number,u:number){let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;}
/** a ball drawn on stage st through frame fr, with its floor shadow */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:{u:number;y:number;v:number;moving:boolean;spin:number},seed:number,min=9,dir=0){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.moving?.25:0,dir});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** screen direction of the ball's travel (for the smear) */
function ballDir(st:Stage,fr:Frame,S:Steal,t:number){const a=S.ball(t-.05),b=S.ball(t),p=fp(st,fr,a.u,a.v),q=fp(st,fr,b.u,b.v);return Math.atan2(q[1]-p[1],q[0]-p[0]);}
/** Mouhoudine's chest (the passage enters his shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'head'|'face'|'pelvis'|'rToe'|'lToe'|'chest'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];

// ================= chapter 1 — LIVE: the 2026 quarter-final in Riga. Only confirmed things: the arena, the teams (France all blue), the
// extra-time kick-off at 1–1, the captain's armband, then (cuts) the celebrations of his hat-trick with the scoreboard at 2–1, 3–1 and 4–1
// (the carry after the third, as in the UEFA photo) and (cut) the 4–2 final whistle. None of his goals is staged. Local u here = metres
// from UKRAINE's goal (France attack towards u = 0). ==========
const C1={riga:A(0,'in Riga'),fra:A(0,'France play'),one1:A(0,'one all'),et:A(0,'In extra'),cap:A(0,'captain'),scores:A(0,'scores'),one:A(0,'one'),two:A(0,'two'),three:A(0,'three goals'),win:A(0,'France win'),fourtwo:A(0,'four two'),end:AUTH[0].seconds};
/** cuts in time: kick-off → 2–1 (on "one") → 3–1 (on "two") → 4–1 and the carry (on "three") → the final whistle (on "France win") */
const W0=C1.scores+.02,W1=Math.max(W0+.2,C1.one-.02),WM=(W0+W1)/2,X0=C1.two-.16,X1=C1.two+.04,XM=(X0+X1)/2,Z0=C1.three-.16,Z1=C1.three+.04,ZM=(Z0+Z1)/2,V0=C1.win-.12,V1=V0+.26,VM=(V0+V1)/2;
/** extra-time kick-off: France (attacking u → 0) in their half, Mouhoudine the deepest outfield player */
const KO_FRA:[number,number][]=[[27.4,.4],[23.6,-4.2],[23.1,5.4],[20.9,.7]];// Mouhoudine, right ala, left ala, pivot
const KO_UKR:[number,number][]=[[18.4,-2.2],[16.2,4.6],[16.4,-5],[13.2,.3]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** the celebration spots (inferred): 2–1 near the Ukraine box, 3–1 on the far side, 4–1 by the near touchline (the carry) */
const CEL:[number,number][]=[[8.2,-2.6],[10.4,3.4],[11.6,-4.6]];
const FIN:[number,number]=[18.2,-.8];
function kickoffGen(i:number,team:'fra'|'ukr'):LGen{const p=(team==='fra'?KO_FRA:KO_UKR)[i];return t=>({pose:idle(t,i+(team==='fra'?0:.37)),yaw:team==='fra'?Math.PI:0,u:p[0],v:p[1]});}
const phaseOf=(T:number)=>T<WM?0:T<XM?1:T<ZM?2:T<VM?3:4;
const phaseT0=(ph:number)=>[0,WM,XM,ZM,VM][ph];
/** the carry (UEFA photo): he stands tall with his arms back round the team-mate's legs, bouncing; FACE = facing the camera (−v) */
const FACE=-Math.PI/2;
const CARRY=(t:number)=>{const b=Math.sin(t*9)*.5+.5;return posed({lHipF:12+6*b,rHipF:8,lKnee:20+10*b,rKnee:16+8*b,lHipA:8,rHipA:8,lean:16,neckP:-10,lShF:-24,rShF:-24,lShA:34,rShA:34,lElb:84,rElb:84,air:.03*b});};
/** the team-mate on his back: legs forward and apart round his waist, one arm round his neck, the other punching the air */
const RIDER=(t:number)=>{const b=Math.sin(t*9+.4)*.5+.5;return posed({lHipF:78,rHipF:78,lHipA:34,rHipA:34,lKnee:84,rKnee:84,lean:10,neckP:-24,lShF:96,lShA:14,lElb:96,rShF:150+20*b,rShA:30,rElb:20,air:0});};
const RIDER_BUILD={height:1.76};
/** how high the rider's place must lift so his seat sits high on Mouhoudine's back (≈1.3 m; his head well above, as in the photo) */
const RIDER_Y=(()=>{const sk=solve(RIDER(0),RIDER_BUILD);return 1.3-sk.pelvis[1];})();
const liveM:LGen=T=>{const ph=phaseOf(T);
 if(ph===0)return kickoffGen(0,'fra')(T);
 if(ph===1)return{pose:celebrate((T-WM)*1.1,{kind:'arms'}),yaw:FACE+.4*Math.sin((T-WM)*1.4),u:CEL[0][0],v:CEL[0][1]};
 if(ph===2){const go=sm(XM,XM+1.2,T,easeOut);return{pose:celebrate((T-XM)*1.2,{kind:'run'}),yaw:yawTo(-1,.6)+.3*Math.sin(T*2),u:CEL[1][0]-go*1.4,v:CEL[1][1]+go*.8};}
 if(ph===3)return{pose:CARRY(T),yaw:FACE+.55+.15*Math.sin((T-ZM)*1.3),u:CEL[2][0],v:CEL[2][1]};
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:FACE-.35,u:FIN[0]+.3,v:FIN[1]-1.2};};
/** the rider (only in the carry): behind him, lifted onto his back, turning with him */
const liveRider:LGen=T=>{const m=liveM(T),bk=.3;return{pose:RIDER(T),yaw:m.yaw,u:m.u-Math.cos(m.yaw)*bk,v:m.v-Math.sin(m.yaw)*bk,y:RIDER_Y+.03*(Math.sin(T*9)*.5+.5)};};
const liveFra=(i:number):LGen=>T=>{// i = 0..2: right ala, left ala, pivot (i = 1 is the bald team-mate who rides on his back in the carry)
 const ph=phaseOf(T);
 if(ph===0)return kickoffGen(i+1,'fra')(T);
 if(ph<4){const C=CEL[ph-1],t0=phaseT0(ph),from:[number,number]=([[[14.6,1.8],[15.8,-6.2],[21,.8]],[[17.2,-1.4],[16.6,6.6],[19.8,-3.6]],[[16.2,1.4],[17.6,-1.6],[20.4,3.2]]][ph-1][i]) as [number,number];
  const go=sm(t0,t0+1.4,T,easeOut),tgt:[number,number]=[C[0]+[1.1,-.9,1.4][i],C[1]+[-.9,1.1,.9][i]],u=lerp(from[0],tgt[0],go),v=lerp(from[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-t0)*1.2+i*.3,{kind:'run'}):celebrate((T-t0)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(C[0]-u,C[1]-v),u,v};}
 const spot:[number,number][]=[[FIN[0]-.9,FIN[1]+1.1],[FIN[0]+.8,FIN[1]+1.2],[FIN[0]-.6,FIN[1]-.2]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:FACE+[.3,-.2,.5][i],u:spot[i][0],v:spot[i][1]};};
/** Ukraine after the goals and at the final whistle: heads down, hands on hips */
const DOWN=posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:30,rShA:30,lShF:-20,rShF:-20,lElb:110,rElb:110});
const liveUkr=(i:number):LGen=>T=>{const ph=phaseOf(T);if(ph===0)return kickoffGen(i,'ukr')(T);
 const base:[number,number]=([[[5.2,3.6],[6.4,-6.2],[3.2,-.9],[13.4,5.8]],[[6.8,-2.8],[14.8,-3.6],[4.6,1.2],[9.4,6.4]],[[5.6,1.8],[7.4,5.2],[15.4,-1.8],[3.8,-2.6]],[[22.2,5.8],[24.4,-6.6],[26.2,2.2],[20.6,7.4]]][ph-1][i]) as [number,number];
 return{pose:DOWN,yaw:ph<4?(i%2?.7:-.5):Math.PI*.8,u:base[0],v:base[1]};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:DOWN,yaw:.4,u:.8,v:-.4};
/** France's keeper at the far end (only in the kick-off and final-whistle frames) */
const liveFGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3+.4),yaw:Math.PI,u:39.3,v:0}:{pose:celebrate((T-VM)*1.1+.8,{kind:'arms'}),yaw:FACE,u:FIN[0]+2.2,v:FIN[1]+.4};
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.fra,2.4],[C1.cap,7.2],[W0,7.4],[W1,-11.8],[X0,-11.4],[X1,-10],[Z0,-9.8],[Z1,-8.6],[V0,-8.4],[V1,-1.6],[C1.end,-1.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.fra,.62],[C1.one1,.66],[C1.cap,.98],[W0,1],[W1,.9],[X0,.9],[X1,.92],[Z0,.92],[Z1,1.02],[V0,1.02],[V1,.9],[C1.end,.96]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.cap,990],[W0,990],[W1,990],[Z1,960],[V1,990],[C1.end,970]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'2':[0,2,3,4,6],'3':[0,2,3,5,6],'4':[1,2,3,5]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the arena scoreboard: France left (blue tab), Ukraine right (yellow tab); ring = a red ring round France's score */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,ring=0,pop=0){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62*(1+.18*pop),y=top-H+H*.19-H*.62*.09*pop;
 const tabs=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);s.fill(ink,p);};tabs(B,cx-W*.38);tabs(Y,cx+W*.22);digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);s.knockout(lit);s.fill(Y,lit);
 if(ring>.02){const c:Pt=[cx-W*.3+h*.27,y+h*.5],rr=h*.72*ring;s.fill(R,ribbon(blob(c[0],c[1],rr,rr*1.1,151,{n:20}),Math.max(5,h*.09),{seed:152,close:true,wobble:1.2}),1);}
}
/** the captain's armband on his LEFT upper arm (UEFA photo): a yellow band across the sleeve, drawn only when that arm faces the camera */
function armband(s:Sheet,st:Stage,fr:Frame,l:Loc,g=1){
 const{sk,J}=jointsL(l),sh=J(sk.lSh),el=J(sk.lEl),rs=J(sk.rSh),S=(j:[number,number,number])=>{const[X,Z]=toStage(fr,j[0],j[2]);return{p:proj(st,X,j[1],Z),Z};};
 const a=S(sh),b=S(el),r=S(rs);if(a.Z>r.Z+.05)return;// the left arm is on the far side
 const m=L2(a.p,b.p,.38),d=Math.atan2(b.p[1]-a.p[1],b.p[0]-a.p[0])+Math.PI/2,k=kAt(st,a.Z),hw=.09*k*g,q:Pt[]=[[m[0]-Math.cos(d)*hw,m[1]-Math.sin(d)*hw],[m[0]+Math.cos(d)*hw,m[1]+Math.sin(d)*hw]];
 s.knockout(ribbon(q,Math.max(5,.08*k),{seed:170,taper:0,wobble:.4}));s.fill(Y,ribbon(q,Math.max(4,.065*k),{seed:171,taper:0,wobble:.4}),1);s.fill(B,ribbon(q,Math.max(4,.065*k),{seed:171,taper:0,wobble:.4}),.35);
}
/** the hat-trick tally: n balls pop over his head, the newest with a spark */
function tally(s:Sheet,st:Stage,fr:Frame,l:Loc,n:number,since:number,lift=false){
 const hd=jointPt(st,fr,l,'head'),Z=depth(fr,l),k=kAt(st,Z),r=Math.max(10,k*.2);
 for(let i=0;i<n;i++){const g=i<n-1?1:easeOutBack(Math.min(1,since/.35)),x=hd[0]+(i-(n-1)/2)*r*2.5,y=hd[1]-k*(lift?1.2:.62)-r;if(g<.02)continue;ball(s,x,y,r*g,500+i,{rot:i});
  if(i===n-1&&since<.45)sparkBurst(s,Y,x,y,r*3.4,{n:9,seed:510+i,g:easeOut(Math.min(1,since/.4))});}
}
const ST1=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=ST1(c.x),ph=phaseOf(T);
 cam(s,0,c.y,c.zoom);
 const fl=ph===1?pulse(T,WM,1.2):ph===2?pulse(T,XM,1.2):ph===3?pulse(T,ZM,1.2):ph===4?pulse(T,VM,1.2)+.6*pulse(T,C1.fourtwo,1.2):.4*pulse(T,C1.et,1);
 courtSide(s,st,FA,T,{cheer:ph===0?.1:ph===4?1:.9,flash:fl,keeper:()=>{athlete(s,st,FA,liveGK,T,UKR_GK,{detail:'low'});}});
 // the scoreboard: 1–1 from "one all", then 2–1, 3–1, 4–1, 4–2 (the France score ringed on "four two")
 const sb=ph===0?(T>=C1.one1-.05?'1-1':''):['','2-1','3-1','4-1','4-2'][ph];
 if(sb)scoreboard(s,st,c.x,sb,ph===4?easeOutBack(sm(C1.fourtwo+.1,C1.fourtwo+.5,T)):0,ph===0?pulse(T,C1.one1,.6):pulse(T,phaseT0(ph),.6));
 const items:Item[]=[];
 KO_UKR.forEach((_,i)=>{const g=liveUkr(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,UKR(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{if(ph===3&&i===1)return;const g=liveFra(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,FRA(i),{detail:'low'})});});
 if(ph===0||ph===4)items.push({z:depth(FA,liveFGK(T)),draw:()=>athlete(s,st,FA,liveFGK,T,FRA_GK,{detail:'low'})});
 const M=liveM(T);
 items.push({z:depth(FA,M)-.02,draw:()=>{athlete(s,st,FA,liveM,T,MOU,{detail:'mid'});armband(s,st,FA,M);
  if(ph>=1&&ph<=3)tally(s,st,FA,M,ph,T-phaseT0(ph),ph===3);}});
 if(ph===3)items.push({z:depth(FA,M)+.2,draw:()=>athlete(s,st,FA,liveRider,T,{...FRA(1),build:RIDER_BUILD},{detail:'mid'})});
 // the ball on the centre spot at the extra-time kick-off
 if(ph===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,moving:false,spin:0},18);}});
 // "captain": a yellow dashed ring under him and a red ring round the armband
 if(ph===0){const[X,Z]=toStage(FA,M.u,M.v),g=easeOutBack(sm(C1.cap,C1.cap+.35,T))*(1-sm(W0-.25,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.2,22,50,g);floorDashRing(s,st,Y,X,Z,1.2,14,51,g);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 if(ph===0){const g=easeOutBack(sm(C1.cap+.15,C1.cap+.5,T))*(1-sm(W0-.25,W0,T));if(g>.02){const{sk,J}=jointsL(M),sh=J(sk.lSh),el=J(sk.lEl),m=[lerp(sh[0],el[0],.38),lerp(sh[1],el[1],.38),lerp(sh[2],el[2],.38)],[X,Z]=toStage(FA,m[0],m[2]),p=proj(st,X,m[1],Z),rr=kAt(st,Z)*.4*g;
  s.fill(R,ribbon(blob(p[0],p[1],rr,rr*.85,161,{n:20}),Math.max(5,rr*.12),{seed:162,close:true,wobble:1}),1);}}
 // the cuts: yellow speed lines sweep across the frame (whip pans; the hat-trick cuts are shorter)
 for(const[a0,a1] of[[W0,W1],[X0,X1],[Z0,Z1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(ST1(liveCam(tc).x),FA,liveM(tt),.14));},still:C1.cap+.4};

// ================= chapter 2 — HOW HE WINS THE BALL (demonstration, real time, side-on, his goal on the LEFT): watch, stretch, poke, attack =================
const C2={plays:A(1,'Mouhoudine plays'),back:A(1,'at the back'),how:A(1,'This is how'),watch:A(1,'watches the pass'),looks:A(1,'It looks'),past:A(1,'past him'),stretch:A(1,'stretches'),long:A(1,'long leg'),pokes:A(1,'pokes'),attacks:A(1,'attacks'),end:AUTH[1].seconds};
const T2:StealT={read:C2.watch,hit:lerp(C2.looks,C2.past,.45),step0:C2.stretch-.12,icpt:C2.long+.12};
const steal=makeSteal(T2);
const ST2:Stage={F:5200,eye:4.2,cx:-9.5,cz:-14};
/** the reach: a dashed floor arc round the spot he lunges from, radius = how far his toe reaches (one long leg) */
const REACH=Math.hypot(IC[0]-PL_I[0],IC[1]-PL_I[1]);
function reachArc(s:Sheet,st:Stage,fr:Frame,g:number,w:number,seed:number){if(g<=.02)return;const a0=Math.atan2(IC[1]-PL_I[1],IC[0]-PL_I[0]),pts:Pt[]=[];for(let k=0;k<=20;k++){const a=a0+(k/20-.5)*2.1;pts.push(fp(st,fr,PL_I[0]+Math.cos(a)*REACH,PL_I[1]+Math.sin(a)*REACH));}cased(s,pts,w,seed,{dash:w*3.2,progress:g});}
/** a red ring round his left boot (the poke) */
function bootRing(s:Sheet,st:Stage,fr:Frame,l:Loc,g:number,seed:number){if(g<=.02)return;const tp=jointPt(st,fr,l,'lToe'),r=kAt(st,depth(fr,l))*.36*g;s.fill(R,ribbon(blob(tp[0],tp[1],r,r*.75,seed,{n:22}),10,{seed:seed+1,close:true,wobble:1}),1);}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=ST2,hit=pulse(t,T2.icpt,.35);
  camPath(s,t,[[0,-120,700,1],[C2.back,-1000,740,.66],[C2.how,-120,720,.98],[C2.watch,480,760,.74],[C2.looks,480,760,.74],[T2.hit+.3,340,750,.82],[T2.icpt,60,730,1.08],[C2.pokes,260,730,1.02],[C2.attacks,820,720,.9],[C2.end,1850,720,.84]],[5*hit*Math.sin(t*80),0]);
  courtSide(s,st,FA,tt,{cheer:.05+.4*sm(T2.icpt,T2.icpt+.5,tt),flash:pulse(tt,T2.icpt,1),keeper:()=>{athlete(s,st,FA,steal.gk,tt,DEMO_K,{detail:'mid'});}});
  const P=steal.mou(tt),[PX,PZ]=toStage(FA,P.u,P.v);
  // "Mouhoudine plays": a red dashed ring under him; "at the back": a dashed line from him to his goal, a ring in the goal mouth
  const rg=easeOutBack(sm(C2.plays,C2.plays+.35,tt))*(1-sm(C2.how-.2,C2.how+.2,tt));
  if(rg>.02){floorDashRing(s,st,K,PX,PZ,1,20,210,rg);floorDashRing(s,st,R,PX,PZ,1,12,211,rg);}
  const bw=sm(C2.back,C2.back+.6,tt,easeOut)*(1-sm(C2.how+.2,C2.how+.6,tt));
  if(bw>.02){const pts=[fp(st,FA,P.u,P.v),fp(st,FA,P.u*.5,P.v*.5),fp(st,FA,.6,0)];cased(s,pts,12,212,{dash:40,progress:bw});const[GX,GZ]=toStage(FA,.5,0);floorDashRing(s,st,K,GX,GZ,1.6,20,213,easeOutBack(Math.min(1,bw*1.4)));floorDashRing(s,st,Y,GX,GZ,1.6,12,214,easeOutBack(Math.min(1,bw*1.4)));}
  // "It looks past him": the lane from the passer to the pivot lights up red, just out of his reach
  const ln=sm(C2.looks-.1,C2.looks+.5,tt,easeOut)*(1-sm(T2.icpt+.2,T2.icpt+.7,tt));
  if(ln>.02)redLane(s,[fp(st,FA,PB0[0],PB0[1]),fp(st,FA,lerp(PB0[0],BT[0],.5),lerp(PB0[1],BT[1],.5)),fp(st,FA,BT[0],BT[1])],12,215,{progress:ln});
  // "long leg": the reach arc — one long leg covers the lane
  reachArc(s,st,FA,sm(C2.stretch-.05,C2.long+.2,tt,easeOut)*(1-sm(C2.attacks-.1,C2.attacks+.3,tt)),11,216);
  // "attacks": a yellow arrow ahead of him into the space
  const ga=sm(C2.attacks-.1,C2.attacks+.4,tt,easeOut);
  if(ga>.02){const pts=[fp(st,FA,P.u+GO[0]*.9,P.v+GO[1]*.9),fp(st,FA,P.u+GO[0]*2.4,P.v+GO[1]*2.4),fp(st,FA,P.u+GO[0]*3.9,P.v+GO[1]*3.9)];cased(s,pts,13,218,{dash:44,progress:ga});if(ga>.9)casedHead(s,pts,40,219);}
  const b=steal.ball(tt),bd=ballDir(st,FA,steal,tt);
  const fast=(tt>T2.step0&&tt<T2.icpt+.1)?.12:0;
  const items:Item[]=[
   {z:depth(FA,steal.passer(tt)),draw:()=>athlete(s,st,FA,steal.passer,tt,DEMO_P,{detail:'mid'})},
   {z:depth(FA,steal.pivot(tt)),draw:()=>athlete(s,st,FA,steal.pivot,tt,DEMO_V,{detail:'mid'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FA,steal.mou,tt,MOU_T,{detail:'high',smear:fast})},
   {z:depth(FA,b)-.02,draw:()=>{drawBallL(s,st,FA,b,221,9,bd);if(tt>=T2.icpt&&tt<T2.icpt+.4){const p=fp(st,FA,IC[0],IC[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:222,g:easeOut(sm(T2.icpt,T2.icpt+.25,tt))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "pokes": a red ring round his left boot
  bootRing(s,st,FA,P,easeOutBack(sm(C2.pokes-.05,C2.pokes+.3,tt))*(1-sm(C2.attacks+.1,C2.attacks+.5,tt)),226);
  // "watches the pass": a dashed sight line from his eyes to the passer, a red ring at the passer's hips
  const sl=sm(C2.watch,C2.watch+.5,tt,easeOut)*(1-sm(T2.step0,T2.step0+.3,tt));
  if(sl>.02){const e=jointPt(st,FA,P,'face'),hp=jointPt(st,FA,steal.passer(tt),'pelvis');cased(s,[e,L2(e,hp,.5),hp],9,223,{dash:30,progress:Math.min(1,sl)});
   const rr=kAt(st,depth(FA,steal.passer(tt)))*.42*easeOutBack(sm(C2.watch,C2.watch+.35,tt))*(1-sm(T2.step0,T2.step0+.3,tt));if(rr>1)s.fill(R,ribbon(blob(hp[0],hp[1],rr,rr*.7,224,{n:20}),8,{seed:225,close:true,wobble:1}),1);}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(ST2,FA,steal.mou(tt),.13));},
 still:C2.watch+.4,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: knee-high, the same court turned round, his goal on the RIGHT) =================
const C3={slow:A(2,'Slow motion'),read:A(2,'Read the pass'),step:A(2,'stretch'),long:A(2,'long leg'),steal:A(2,'poke it'),go:A(2,'go'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq3(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.read-.6],[C3.read,T2.hit-.25],[C3.step,T2.step0+.05],[C3.long,T2.icpt-.05],[C3.steal,T2.icpt+.08],[C3.go,T2.icpt+.4],[C3.end,T2.icpt+1.5]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const per3=g3(steal.mou),pas3=g3(steal.passer),piv3=g3(steal.pivot),gk3=g3(steal.gk);
const ST3:Stage={F:2100,eye:1.05,cx:9.8,cz:3};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=ST3,q=seq3(tt),hit=pulse(q,T2.icpt,.4);
  camPath(s,t,[[0,160,40,.96],[C3.read,-60,40,.94],[C3.step,-40,40,1.06],[C3.long,0,30,1.12],[C3.steal,40,30,1.16],[C3.go,-200,40,1.02],[C3.end,-360,40,.98]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  courtSide(s,st,FR,tt,{cheer:.1+.5*sm(T2.icpt,T2.icpt+.6,q),flash:pulse(q,T2.icpt,1.2),keeper:()=>{athlete(s,st,FR,gk3,tt,DEMO_K,{detail:'low'});}});
  const P=per3(tt),[,PZ]=toStage(FR,P.u,P.v);
  // "Read the pass": the red lane; "long leg": the reach arc; "go": the arrow ahead
  const ln=sm(C3.read-.1,C3.read+.5,tt,easeOut)*(1-sm(C3.go,C3.go+.5,tt));
  if(ln>.02)redLane(s,[fp(st,FR,PB0[0],PB0[1]),fp(st,FR,lerp(PB0[0],BT[0],.5),lerp(PB0[1],BT[1],.5)),fp(st,FR,BT[0],BT[1])],13,301,{progress:ln});
  reachArc(s,st,FR,sm(C3.long-.1,C3.long+.5,tt,easeOut)*(1-sm(C3.go,C3.go+.5,tt)),12,302);
  const ga=sm(C3.go-.1,C3.go+.4,tt,easeOut);
  if(ga>.02){const pts=[fp(st,FR,P.u+GO[0]*.9,P.v+GO[1]*.9),fp(st,FR,P.u+GO[0]*2.2,P.v+GO[1]*2.2),fp(st,FR,P.u+GO[0]*3.4,P.v+GO[1]*3.4)];cased(s,pts,14,304,{dash:44,progress:ga});if(ga>.9)casedHead(s,pts,42,305);}
  const b=steal.ball(q),bd=(()=>{const a=steal.ball(q-.05),p=fp(st,FR,a.u,a.v),r=fp(st,FR,b.u,b.v);return Math.atan2(r[1]-p[1],r[0]-p[0]);})();
  const fast=(q>T2.step0&&q<T2.icpt+.15)?.5:0;
  const items:Item[]=[
   {z:depth(FR,pas3(tt)),draw:()=>athlete(s,st,FR,pas3,tt,DEMO_P,{detail:'mid'})},
   {z:depth(FR,piv3(tt)),draw:()=>athlete(s,st,FR,piv3,tt,DEMO_V,{detail:'mid'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FR,per3,tt,MOU_T,{detail:'high',smear:fast})},
   {z:depth(FR,b)-.02,draw:()=>{drawBallL(s,st,FR,b,311,10,bd);if(q>=T2.icpt&&q<T2.icpt+.4){const p=fp(st,FR,IC[0],IC[1],.2);sparkBurst(s,Y,p[0],p[1],140,{n:11,seed:312,g:easeOut(sm(T2.icpt,T2.icpt+.3,q))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "poke it away": a red ring round his left boot as it meets the ball
  bootRing(s,st,FR,P,easeOutBack(sm(C3.steal-.05,C3.steal+.3,tt))*(1-sm(C3.go+.2,C3.go+.6,tt)),321);
  // "Read": his sight line to the passer
  const sl=sm(C3.read,C3.read+.4,tt,easeOut)*(1-sm(C3.step,C3.step+.3,tt));void PZ;
  if(sl>.02){const e=jointPt(st,FR,P,'face'),hp=jointPt(st,FR,pas3(tt),'pelvis');cased(s,[e,L2(e,hp,.5),hp],9,323,{dash:30,progress:sl});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(ST3,FR,per3(tt),.13));},
 still:C3.steal+.2,
};

// ================= chapter 4 — YOUR TURN: he runs it again; three cards (read, reach, win); a tick =================
const C4={your:A(3,'Your turn'),legs:A(3,'long legs'),reach:A(3,'reach passes'),win:A(3,'win the ball'),end:AUTH[3].seconds};
const C4R={read:lerp(C4.your,C4.legs,.6),step:C4.reach,steal:C4.win};
const seq4=(t:number)=>key(t,mono([[0,T2.read-.8],[C4R.read,T2.hit-.3],[C4R.step,T2.step0+.1],[C4R.steal,T2.icpt+.05],[C4.end,T2.icpt+1.7]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const per4=g4(steal.mou),pas4=g4(steal.passer),piv4=g4(steal.pivot),gk4=g4(steal.gk);
const ST4:Stage={F:2000,eye:1.9,cx:9.9,cz:1.5};
const CARD_Y=660,CARD_W=175,CARDS:[number,number,'read'|'step'|'steal'][]=[[-420,C4R.read,'read'],[0,C4R.step,'step'],[420,C4R.steal,'steal']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=ST4,q=seq4(tt);
  camPath(s,t,[[0,-80,40,.98],[C4.your+.4,-40,300,.86],[C4R.step,-20,300,.86],[C4R.steal+.4,-220,290,.84],[C4.end,-560,290,.82]]);
  courtSide(s,st,FR,tt,{cheer:.1+.7*sm(T2.icpt,T2.icpt+.6,q)*(1-sm(C4.end-1,C4.end,tt)),flash:pulse(q,T2.icpt,1.2),keeper:()=>{athlete(s,st,FR,gk4,tt,DEMO_K,{detail:'low'});}});
  // "long legs": the reach arc on the floor
  const P=per4(tt),[,PZ]=toStage(FR,P.u,P.v);
  reachArc(s,st,FR,sm(C4.legs,C4.legs+.5,tt,easeOut)*(1-sm(C4.win+.3,C4.win+.8,tt)),12,401);
  const b=steal.ball(q);
  const items:Item[]=[
   {z:depth(FR,pas4(tt)),draw:()=>athlete(s,st,FR,pas4,tt,DEMO_P,{detail:'mid'})},
   {z:depth(FR,piv4(tt)),draw:()=>athlete(s,st,FR,piv4,tt,DEMO_V,{detail:'mid'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FR,per4,tt,MOU_T,{detail:'mid',smear:q>T2.step0&&q<T2.icpt+.05?.2:0})},
   {z:depth(FR,b)-.02,draw:()=>{drawBallL(s,st,FR,b,411,10);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (read, step in, steal)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='steal'?-40:10),y:gy+25,height:330*(.9+.1*on),azimuth:kind==='read'?70:kind==='step'?0:40,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='read'?READY(.5):kind==='step'?lunge(.6,{side:'l'}):dribble(.2,{foot:'r',speed:.6});
    const csk=solve(pose,BUILD,{}),Pp=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // read = eye line to a red "passer" dot; reach = the long left leg stretched, a yellow reach arc; win = the ball on the right boot, a red ring
    if(kind==='read'){const e=Pp(csk.face),h:Pt=[e[0]+150,e[1]+60];dashed(s,Y,[e,L2(e,h,.5),h],7,85,{dash:20});s.fill(R,ribbon(blob(h[0],h[1],18,14,86,{n:14}),6,{seed:87,close:true,wobble:1}),1);}
    if(kind==='step'){const toe=csk.lToe,rr=Math.hypot(toe[0],toe[2]),a0=Math.atan2(toe[2],toe[0]),pts:Pt[]=[];for(let k=0;k<=12;k++){const a=a0+(k/12-.5)*1.6;pts.push(Pp([Math.cos(a)*rr,0,Math.sin(a)*rr]));}dashed(s,Y,pts,8,88,{dash:22});}
    drawAthlete(s,pose,fc,{...MOU_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='steal'){const tb:V3=[csk.rToe[0]+.1,BALL_R,csk.rToe[2]],p0=Pp(tb),bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);s.fill(R,ribbon(blob(p0[0],p0[1],bR*2.2,bR*1.8,90,{n:18}),6,{seed:93,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "win the ball": a big tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4R.steal+.35,C4R.steal+.7,tt));
  if(tick>.02){const g=fp(st,FR,P.u,P.v),h=kAt(st,PZ)*1.8,c:Pt=[g[0]-h*.7,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4R.step+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'mouhoudine-futsal-signature',format:'futsal',title:'Souheil Mouhoudine: the tall fixo who steals it',theme:'Use your long legs to reach passes and win the ball back.',
 ageNote:'For players aged 7–12: the 2026 quarter-final, his extra-time hat-trick and the 4–2 are real; the long-leg steal is shown as a demonstration. Poke the ball, never the player’s legs.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls across; a red dashed lane appears, a yellow boot-arrow cuts in and stops it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const roll=sm(0,.35,age,easeOut),bx=x-160*(1-roll);
  const ln=sm(0,.2,age)*(1-sm(.8,1.1,age));if(ln>.02)s.fill(R,ribbon([[x-220,y+r*.2],[x+220,y+r*.2]],6,{seed:seed+3,taper:.1,wobble:1,gaps:[[.2,.3],[.45,.55],[.7,.8]]}),ln);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:(1-roll)*6});
  const sp=sm(.3,.6,age,easeOut)*(1-sm(.9,1.2,age));if(sp>.02){const pts:Pt[]=[[x+20,y+r*2.4],[x+10,y+r*1.7],[x,y+r*1.15]];s.fill(Y,ribbon(partial(pts,sp),12,{seed,taper:.3,wobble:1}),1);arrowHead(s,Y,partial(pts,sp),30,seed+4);}
 },
};
export default film;
