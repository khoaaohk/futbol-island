/** Luan Muller — "the close-range stop": a signature riso film (iconic plays, FUTSAL, goleiro).
 *
 * WHO: Luan Muller Barboza (born 17 Mar 1993, São Paulo, Brazil; 1.73 m), goalkeeper of (Illes Balears) Palma Futsal, No. 3; capped by
 *  Brazil in 2018, now plays for ARMENIA (Wikipedia: "Born in Brazil, he plays for the Armenian national team"; UEFA lists him "ARM"). The
 *  card (lib/town/playerAppearance.json country "Brazil"; playerBios "Brazilian-born Armenia goleiro who won the Champions League with Palma
 *  Futsal …") is the same person: the flag shows his birth country — no namesake / country mismatch. Palma's own site calls him "El brasileño".
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the close-range stop ("Stay square to the ball so shots hit your
 *  body") — not one match. The best-documented big match where HE is the story: the 2024–25 UEFA Futsal Champions League SEMI-FINAL,
 *  Sporting CP 0–3 Palma Futsal, 2 May 2025, 21:00, Antarès, Le Mans. Palma's match report: "En el primer minuto, Merlim y Tomás Paçó pusieron
 *  a prueba a Luan Muller, que respondió con seguridad" (in the first minute Merlim and Tomás Paçó tested Luan, who responded securely); Palma
 *  kept a clean sheet; Sporting went to a flying goalkeeper with three minutes left, Rivillos made it 0–2 from his own half, and "Luan Muller
 *  cerró el marcador en el último minuto anotando el definitivo 3-0" (Wikipedia / UEFA: Luan Muller 39'56"). Palma then won the final 9–4.
 *  (Match choice: no futsal film uses Le Mans 2025 — the other goleiro films use the 2019 / 2022 Champions League finals, the Euro 2012 / 2014 /
 *  2026 finals, the Euro 2026 semi, the 2022 Finalissima, a Spanish league final, the 2010 AFC final, a Barça–Palma league game.)
 *  The written sources say THAT he stopped both shots, not HOW, so the live chapter stages them as body stops (inferred, never narrated as
 *  technique), his 39'56" goal is NOT staged (the camera is up on the scoreboard when it happens), and the technique is taught in a clearly
 *  labelled demonstration (chapters 3–4, training kit, empty arena).
 * CAMERA PLAN (none of the other goleiro films uses these set-ups):
 *  1  LIVE — SPIDERCAM (a cable camera 7.5 m over the court, gliding from behind Sporting's attack toward Palma's goal, real time): the first
 *     minute; Tomás Paçó slips it wide to Merlim, who runs in and shoots from close — Luan, square, stops it with his body; the rebound runs to
 *     Tomás Paçó, who shoots first time — stopped again, and Luan smothers the ball.
 *  2  THE LAST MINUTE — STEADICAM on the court in front of Palma's area (shoulder height; confirmed things only): 0–2; Sporting attack five
 *     against four with a flying goalkeeper; the camera tilts UP to the hanging scoreboard — 39:5x, the board flips 0–3 at 39:56 (the goal is
 *     off camera) — and tilts back DOWN to Luan celebrating, team-mates running in, Sporting heads down: Palma are in the final.
 *  3  HOW HE DOES IT (demonstration, real time) — SHOOTER'S-EYE camera over the shooter's shoulder at head height, riding in with him: close,
 *     no time to dive, so he stays square — chest to the ball, arms and legs wide — and the shot hits his body.
 *  4  YOUR TURN (the lesson, slow-motion replay of the demonstration) — a PROFILE camera at knee height, level with him on the court: the shot
 *     line runs straight into his chest; a tick. Lesson from the entry's `lesson`: "Stay square to the ball so shots hit your body."
 * Sources (written; curl, 5 s apart, a generic User-Agent, ≤ 8 requests; cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Luan Muller" (raw; enwiki-luan-muller.txt): full name, born 17 Mar 1993 São Paulo, 1.73 m, goalkeeper, Palma Futsal No. 3,
 *    Brazil 2018, Armenia.
 *  - Wikipedia, "2024–25 UEFA Futsal Champions League" (raw; wiki-2024-25-uefa-futsal-cl.txt): semi-final 2 May 2025, 21:00, Sporting CP 0–3
 *    Palma Futsal, Antarès, Le Mans; goals Gordillo 27'32", Rivillos 38'09", Luan Muller 39'56"; referees Ondřej Černý, Grigori Ošomkov; final
 *    4 May 2025 Palma 9–4 Kairat.
 *  - UEFA match data, match 2044861 (match.uefa.com/v5/matches/2044861/lineups; uefa-api-2044861-lineups.json): Palma starting five
 *    3 Luan Muller (GK), 10 Mario Rivillos, 17 Neguinho, 28 Fabinho, 55 Marcelo; Sporting 16 Bernardo Paçó (GK), 4 Tomás Paçó, 6 Zicky,
 *    29 Alex Merlim, 33 Taynan; team shirt colours in the feed: Sporting #000000, Palma #ff0000.
 *  - Palma Futsal, "El Illes Balears se gana soñar con la eternidad (0-3)", 2 May 2025 (palmafutsal.com, via its WordPress feed;
 *    palmafutsal-wp-2025-05.json): the first-minute tests by Merlim and Tomás Paçó, "respondió con seguridad"; 0–0 at half-time; Gordillo
 *    min. 28; "A falta de tres minutos, el Sporting sacó portero-jugador y, en una recuperación, Rivillos marcó el segundo desde campo propio";
 *    "Ya con el rival volcado, Luan Muller cerró el marcador en el último minuto anotando el definitivo 3-0"; Antarès Arena, 5,000 spectators.
 *    Also "Luan Muller: 'Será un partido muy duro…'" (3 May 2025: "El brasileño …") and the 2024 final line-up (uefa-api-2040534-lineups.json:
 *    Luan on the BENCH in the 2024 final — so that final was not used).
 * CONFIRMED: match, date, time, venue, city; the two starting fives and shirt numbers; Merlim and Tomás Paçó testing Luan in the FIRST MINUTE
 *  and his secure response; 0–0 at half-time; Sporting's flying goalkeeper from three minutes left; 0–2 (Rivillos 38'09"); Luan's goal in the
 *  last minute, 39'56", 0–3; clean sheet; Palma into the final (and champions two days later).
 * INFERRED (never named in the narration): HOW the two first-minute shots were stopped (staged as body stops, square to the ball — the card's
 *  signature), the build-up, where every player stood, the shooters' feet (right, the library default), the rebound from the first stop to
 *  Tomás Paçó, the smother; which end Palma defended; kits — Sporting in black (navy ink) shirts and shorts (UEFA feed colour #000000),
 *  Palma in red shirts (feed #ff0000) with white shorts, Luan in a green long-sleeved keeper kit with navy shorts, Sporting's flying goalkeeper
 *  in a yellow shirt; how and where Luan scored (not shown), where he celebrated; the hanging scoreboard's look; hair and build (short dark
 *  hair, light skin: playerAppearance.json; 1.73 m). No video was reviewed. Chapters 3–4 are a coaching demonstration, no match claimed.
 * Technique (chapters 3–4): too close to dive, so set early and square — shoulders and hips facing the ball, chest behind the line of the
 *  shot, knees bent, feet wider than the shoulders, arms out low and wide — then absorb the ball into the body and smother the rebound.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on strikes and the stops). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z.
 *  Every stop is aimed: the ball's target IS the solved chest of the keeper in his SQUARE pose (chestAt), so ball and body always meet.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagram lines), red (Palma shirts, posts, "too close"), green (Luan's kit, the square bar, ticks), navy
 *  (key line, Sporting, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card
 *  window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperScoop,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2025 semi-final',text:'Champions League semi final, 2025. Sporting against Palma. In the first minute, Merlim tests Luan Muller, then Tomás Paçó. Luan stops them both!',tail:2.2,
  cues:['Champions League','Sporting against','first minute','Merlim tests','then Tomás','Luan stops','both'],heads:{'Champions League':'Le Mans 2025 · semi-final','first minute':'1st minute','Luan stops':'Stopped!'}},
 {label:'The last minute',text:'Palma lead two nil. Sporting attack with an extra player. In the last minute, the goalkeeper scores too! Three nil, and Palma reach the final.',tail:2.4,
  cues:['Palma lead','Sporting attack','extra player','last minute','goalkeeper scores','Three nil','Palma reach'],heads:{'Palma lead':'0–2','extra player':'5 v 4','goalkeeper scores':'39:56 Luan Muller','Three nil':'0–3','Palma reach':'Into the final'}},
 {label:'How he does it (demo)',text:'Watch how he does it. The shot is close, no time to dive. He stays square: chest to the ball, arms and legs wide. It hits his body!',tail:2.2,
  cues:['Watch how','shot is close','no time','stays square','chest to','arms and legs','hits his body'],heads:{'Watch how':'How he does it (demo)','stays square':'Stay square','hits his body':'Stopped!'}},
 {label:'Your turn',text:'Your turn. Stay square to the ball, so shots hit your body.',tail:2.8,
  cues:['Your turn','Stay square','to the ball','shots hit','your body'],heads:{'Stay square':'Stay square to the ball'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/luan-muller-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/luan-muller-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/luan-muller-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('luan: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('luan: no cue '+w);return c.at;};
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
/** pose keys with increasing times (cues can crowd after re-timing) */
function monoP(Kk:[number,Pose][],gap=.05):[number,Pose][]{const o:[number,Pose][]=[];for(const k of Kk){const t=o.length?Math.max(k[0],o[o.length-1][0]+gap):k[0];o.push([t,k[1]]);}return o;}

// ---------------- camera: centre a 1566×1080 composition box on the canvas (card window or full screen) ----------------
const BOX_W=1566,BOX_H=1080;
function cam(s:Sheet,x:number,y:number,zoom:number,rot=0){
 const base=Math.min(s.W/BOX_W,s.H/BOX_H),S=zoom*base*s.arrival,c=Math.cos(rot),sn=Math.sin(rot),dx=(s.W/2-s.cx)/S,dy=(s.H/2-s.cy)/S;
 s.camera(x-(c*dx+sn*dy),y-(-sn*dx+c*dy),zoom*base/Math.max(.01,s.fit),rot);
}
const kv=(T:number,K0:Key[])=>key(T,padKeys(mono(K0),[0]),easeInOutSine,true)[0]||0;

// ---------------- stage: a perspective camera over the court floor (metres → world units); X right, Y up, Z away ----------------
type Stage={F:number;eye:number;cx:number;cz:number};
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const k=st.F/Math.max(.25,Z-st.cz);return[(X-st.cx)*k,(st.eye-Yh)*k];};
const kAt=(st:Stage,Z:number)=>st.F/Math.max(.25,Z-st.cz);
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const lin3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a big tick: green stroke, navy misregistered echo */
function tickMark(s:Sheet,c:Pt,S:number,seed:number){const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed,taper:.2,wobble:1}),.5);s.fill(G,ribbon(tk,S*.24,{seed:seed+2,taper:.2,wobble:1}));}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2,FACE_AWAY=Math.PI/2;
const SKIN_L:InkFill[]=[[Y,.86],[R,.26]],SKIN_M:InkFill[]=[[Y,.72],[R,.4]],SKIN_D:InkFill[]=[[R,.6],[K,.34]];
/** Luan Muller: Palma No. 3 (UEFA line-up), 1.73 m (Wikipedia), short dark hair, light skin (playerAppearance.json); green long-sleeved keeper kit (inferred) */
const BUILD_L:Build={height:1.73,bulk:1.04};
const LUAN:AthleteStyle={shirt:G,shorts:K,socks:G,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:3,numberInk:'paper',hairStyle:'short',build:BUILD_L,seed:3};
/** the demonstration: Luan in a yellow training top (no match claimed) */
const LUAN_DEMO:AthleteStyle={...LUAN,shirt:[Y,.95],trim:K,numberInk:K,number:null,socks:K,seed:4};
/** Palma outfield: red shirts (UEFA feed colour), white shorts, red socks (inferred) */
const PAL=(n:number):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,skin:n%3===1?SKIN_M:n%3===2?SKIN_D:SKIN_L,hair:K,line:K,trim:'paper',hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.7+hash(n,3)*.12},seed:30+n});
/** Sporting: black (navy ink) shirts and shorts (UEFA feed colour #000000), green trim (inferred) */
const SCP=(n:number):AthleteStyle=>({shirt:K,shorts:K,socks:K,boots:K,skin:n%3===0?SKIN_D:n%3===1?SKIN_M:SKIN_L,hair:K,line:K,trim:G,hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,4)*.12},seed:50+n});
const BUILD_S:Build={height:1.78,bulk:1.02};
const MERLIM:AthleteStyle={...SCP(1),number:29,numberInk:'paper',hairStyle:'short',skin:SKIN_L,build:BUILD_S,seed:29};
const TOMAS:AthleteStyle={...SCP(2),number:4,numberInk:'paper',hairStyle:'short',skin:SKIN_L,build:BUILD_S,seed:44};
/** Sporting's flying goalkeeper (portero-jugador): a yellow shirt (inferred colour) */
const FLYER:AthleteStyle={...SCP(5),shirt:[Y,.95],trim:K,sleeves:'long',seed:61};
/** the demonstration shooter: neutral training kit */
const DEMO_S:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:R,hairStyle:'curly',build:BUILD_S,seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact, relative to the shooter's root (our coords), for a shooter turned to yaw */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD_S,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** the shooter's root for a strike that meets the ball at B aimed at target T */
function plantFor(B:V3,T:V3):{X:number;Z:number;yaw:number}{const yaw=yawTo(T[0]-B[0],T[2]-B[2]),sb=strikeBall(yaw);return{X:B[0]-sb[0],Z:B[2]-sb[2],yaw};}

/** THE SQUARE STANCE (library: facing +x): knees bent, feet wider than the shoulders, hips and shoulders facing the ball, chest up behind
 * the line of the shot, arms out low and wide, palms open, head still — the body is the wall. */
const SQUARE=posed({lHipF:46,rHipF:46,lHipA:24,rHipA:24,lHipR:12,rHipR:12,lKnee:70,rKnee:70,lAnk:-12,rAnk:-12,lean:16,pitch:6,
 lShF:22,rShF:22,lShA:46,rShA:46,lElb:30,rElb:30,lHand:1,rHand:1,neckP:-6});
/** the ball arrives: absorb — chest gives a little, arms close round it, chin down onto it */
const ABSORB=posed({lHipF:50,rHipF:50,lHipA:20,rHipA:20,lHipR:10,rHipR:10,lKnee:74,rKnee:74,lAnk:-12,rAnk:-12,lean:26,pitch:2,
 lShF:56,rShF:56,lShA:22,rShA:22,lElb:84,rElb:84,lHand:1,rHand:1,neckP:20,squash:-.06});
/** up with the ball held at the chest */
const HOLD=posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lAnk:-4,rAnk:-4,lean:8,lShF:50,rShF:50,lShA:14,rShA:14,lElb:104,rElb:104,lHand:1,rHand:1,neckP:4});
/** the chest point the ball meets, for a keeper at (X,Z) turned to yaw in the SQUARE stance (a touch below the sternum) */
function chestAt(X:number,Z:number,yaw:number):V3{const sk=solve(SQUARE,BUILD_L,placeAt(X,Z,yaw)),c=toMine(sk.chest),p=toMine(sk.pelvis);return lin3(c,p,.22);}
/** a figure's chest ring (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},build:Build,r=.09):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
/** the ball in the keeper's hands (between the gloves, a little forward) */
function heldBall(a:{pose:Pose;yaw:number;X:number;Z:number}):V3{const sk=solve(a.pose,BUILD_L,placeAt(a.X,a.Z,a.yaw)),l=toMine(sk.lHa),r=toMine(sk.rHa),m=lin3(l,r,.5);return[m[0]+Math.cos(a.yaw)*.06,m[1],m[2]+Math.sin(a.yaw)*.06];}

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
function ballOn(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15*(1+Yh*.15),r*.3,seed+5,.45/(1+Yh));ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}
/** a yellow comet trail behind a flying ball (samples of its path) */
function trail(s:Sheet,st:Stage,path:(t:number)=>V3,t0:number,t:number,r:number,seed:number,span=.2){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=path(Math.max(t0,t-span+k*span/8));tr.push(proj(st,q[0],q[1],q[2]));}const p=ribbon(tr,r*1.35,{seed,taper:.9,wobble:.6});s.knockout(p,.8);s.fill(Y,p,1);}

// ---------------- the arena: stands, wood court, the goal end (camera looks along +Z at the goal) ----------------
/** stepped navy rows, lit faces, red / green / yellow shirts in the crowd, roof lights; cheer lifts the heads; crowd 0 = an empty arena */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,crowd=1){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(crowd>0){const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),greens=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
  for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);if(hash(i,9)>crowd)continue;const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
    heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.2)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
  s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(G,greens);}
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off2(scroll,kw)*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
const off2=(scroll:number,kw:number)=>scroll*kw;
/** the wooden court: a warm yellow floor with long plank strips */
function woodFloor(s:Sheet,st:Stage,x0:number,z0:number,x1:number,z1:number,alongX:boolean){
 const court=polyPath(floorQuad(st,x0,z0,x1,z1),true);s.knockout(court);s.fill(Y,court,.62);s.fill(R,court,.1);
 const planks=new Path2D();
 if(alongX){for(let z=Math.ceil(z0/.9)*.9;z<z1;z+=1.8)planks.addPath(polyPath(floorQuad(st,x0,z,x1,z+.9),true));}
 else{for(let x=Math.ceil(x0/.9)*.9;x<x1;x+=1.8)planks.addPath(polyPath(floorQuad(st,x,z0,x+.9,z1),true));}
 s.fill(Y,planks,.22);
}
/** navy boards with yellow ad panels and a green cap */
function boards(s:Sheet,wall:number,board:number,x0s:number[],x1s:number[]){const span=9000;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();x0s.forEach((x0,i)=>ads.rect(x0,wall-board*.78,x1s[i]-x0,board*.52));s.fill(Y,ads,.75);s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));}
const GZ=11,WALLZ=13.4,HALF=GZ-20;
type ArenaOpt={cheer?:number;flash?:number;t?:number;crowd?:number;behind?:(st:Stage)=>void;keeper?:(st:Stage)=>void};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,t=0,crowd=1}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(G,rectPath(-span,wall,span*2,span),.5);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,st,-10,-30,10,GZ,false);
 const lines=new Path2D(),arcPts:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
 lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));
 const zn=Math.max(-30,st.cz+.4);
 lines.addPath(polyPath(floorStrip(st,[[-10,zn],[-10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,zn],[10,GZ]],.05),true));
 if(HALF>st.cz+.5){lines.addPath(polyPath(floorStrip(st,[[-10,HALF],[10,HALF]],.05),true));const cc:Pt[]=[];for(let k=0;k<=16;k++){const a=k/16*Math.PI;cc.push([Math.cos(a)*3,HALF+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));}
 s.knockout(lines,.94);
 const x0s:number[]=[],x1s:number[]=[];for(let i=-12;i<12;i++){x0s.push(proj(st,i*2.4+.3,0,WALLZ)[0]);x1s.push(proj(st,i*2.4+1.9,0,WALLZ)[0]);}
 boards(s,wall,board,x0s,x1s);void span;
 stands(s,wall-board,kw,t,cheer,flash,st.cx,crowd);
 o.behind?.(st);goalEnd(s,st);o.keeper?.(st);postsEnd(s,st);
}
function goalEnd(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H));
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
/** z-sorted drawing list (far first) */
type It={z:number;draw:()=>void};
const drawSorted=(items:It[])=>items.sort((a,b)=>b.z-a.z).forEach(it=>it.draw());

// ================= chapter 1 — LIVE (spidercam): the first minute — Merlim tests Luan, then Tomás Paçó; two body stops, the smother =================
const C1={cl:A(0,'Champions'),sp:A(0,'Sporting against'),fm:A(0,'first minute'),mt:A(0,'Merlim'),th:A(0,'then Tom'),ls:A(0,'Luan stops'),both:A(0,'both'),end:AUTH[0].seconds};
/** Luan's two set spots (a step off his line) and the two shots (all inferred positions) */
const KZ=GZ-1.05,KX1=-.42,KX2=.12;
const B1:V3=[-3.35,BALL_R,5.3];// Merlim's strike: left of centre, ≈ 5.5 m out
const Y1=yawTo(B1[0]-KX1,B1[2]-KZ),CH1=chestAt(KX1,KZ,Y1),M1=plantFor(B1,CH1);
const R1:V3=[.95,BALL_R,6.05];// the rebound runs out right, into Tomás Paçó's path
const Y2=yawTo(R1[0]-KX2,R1[2]-KZ),CH2=chestAt(KX2,KZ,Y2),TP=plantFor(R1,CH2);
const PASS0=C1.sp+.3,RECV0=PASS0+.75;
const S1=C1.mt+.42,H1=S1+.26,S2=Math.max(H1+.95,C1.th+.3),H2=S2+.24,SCOOP=H2+.12;
const MER0:[number,number]=[-6.2,.2];// Merlim wide on the left when Tomás passes
const TOM0:[number,number]=[1.4,-1.6];// Tomás Paçó deep in the middle (the fixo) with the ball
const merlim:Gen=T=>{
 const d0=RECV0,S0=S1-.45;
 const X=key(T,mono([[0,MER0[0]+.2],[d0,MER0[0],easeIO],[S0,M1.X-.4,easeIO],[S1,M1.X,easeOut],[S1+.7,M1.X+.25,easeOut],[C1.end,M1.X+.1]]));
 const Z=key(T,mono([[0,MER0[1]-.6],[d0,MER0[1],easeIO],[S0,M1.Z-.45,easeIO],[S1,M1.Z,easeOut],[S1+.7,M1.Z+.5,easeOut],[C1.end,M1.Z+.6]]));
 let pose:Pose;
 if(T<d0)pose=blendPose(runCycle(T*runCadence(.3),{speed:.3}),stand(),.3);
 else if(T<S0)pose=dribble(T*1.6,{foot:'r',speed:.55});
 else if(T<S1+.6)pose=blendPose(dribble(S0*1.6,{foot:'r',speed:.55}),strike(key(T,[[S0,.14],[S0+.22,.26],[S1,STRIKE_CONTACT],[S1+.6,.95]],linear),{foot:'r'}),sm(S0,S0+.12,T));
 else pose=blendPose(strike(.95,{foot:'r'}),posed({lHipF:10,rHipF:14,lKnee:14,rKnee:16,lean:-4,neckP:-20,lShF:130,rShF:120,lShA:40,rShA:36,lElb:110,rElb:120}),sm(S1+.6,H2+.4,T,easeIO)*.8);
 const toTom=yawTo(TOM0[0]-MER0[0],TOM0[1]-MER0[1]),run=yawTo(M1.X-MER0[0],M1.Z-MER0[1]);
 return{pose,yaw:T<d0-.2?toTom:T<S0?lerp(toTom,run,sm(d0-.2,d0+.3,T,easeIO)):lerp(run,M1.yaw,sm(S0-.1,S1-.15,T,easeIO)),X,Z};};
/** Merlim's ball while he dribbles (in front of his feet) */
const merBall=(T:number):[number,number]=>{const m=merlim(T);return[m.X+Math.cos(m.yaw)*.5,m.Z+Math.sin(m.yaw)*.5];};
const tomas:Gen=T=>{
 const S0=S2-.42,run0=H1-.1;
 const X=key(T,mono([[0,TOM0[0]],[PASS0+.4,TOM0[0]+.1,easeIO],[run0,TOM0[0]+.1],[S0,TP.X-.25,easeIO],[S2,TP.X,easeOut],[S2+.7,TP.X+.15,easeOut],[C1.end,TP.X+.2]]));
 const Z=key(T,mono([[0,TOM0[1]],[PASS0+.4,TOM0[1]+.4,easeIO],[run0,TOM0[1]+2.6,easeIO],[S0,TP.Z-.55,easeIO],[S2,TP.Z,easeOut],[S2+.7,TP.Z+.4,easeOut],[C1.end,TP.Z+.5]]));
 let pose:Pose;
 if(T<PASS0+.55)pose=blendPose(dribble(T*1.3,{foot:'r',speed:.3}),strike(key(T,[[PASS0-.25,.2],[PASS0,STRIKE_CONTACT],[PASS0+.55,.9]],linear),{foot:'r',power:.4}),sm(PASS0-.35,PASS0-.2,T)*(1-sm(PASS0+.45,PASS0+.55,T)));
 else if(T<S0)pose=runCycle(T*runCadence(.75),{speed:.75});
 else if(T<S2+.6)pose=blendPose(runCycle(S0*runCadence(.75),{speed:.75}),strike(key(T,[[S0,.16],[S0+.2,.26],[S2,STRIKE_CONTACT],[S2+.6,.95]],linear),{foot:'r'}),sm(S0,S0+.1,T));
 else pose=blendPose(strike(.95,{foot:'r'}),posed({lHipF:12,rHipF:12,lKnee:24,rKnee:24,lean:30,neckP:10,lShF:60,rShF:60,lShA:14,rShA:14,lElb:20,rElb:20}),sm(S2+.6,S2+1.3,T,easeIO)*.8);
 const toMer=yawTo(MER0[0]-TOM0[0],MER0[1]-TOM0[1]),up=yawTo(TP.X-TOM0[0],TP.Z-TOM0[1]);
 return{pose,yaw:T<PASS0+.4?toMer:T<S0?lerp(toMer,up,sm(PASS0+.4,PASS0+.9,T,easeIO)):lerp(up,TP.yaw,sm(S0-.1,S2-.12,T,easeIO)),X,Z};};
function liveBall(T:number):{p:V3;flying:boolean;spin:number;held:boolean}{
 if(T<PASS0){const g=tomas(T);return{p:[g.X+Math.cos(g.yaw)*.45,BALL_R,g.Z+Math.sin(g.yaw)*.45],flying:false,spin:T*5,held:false};}
 if(T<RECV0){const g=tomas(PASS0),a:V3=[g.X+Math.cos(g.yaw)*.45,BALL_R,g.Z+Math.sin(g.yaw)*.45],m=merBall(RECV0),u=sm(PASS0,RECV0,T,easeOut);return{p:[lerp(a[0],m[0],u),BALL_R,lerp(a[2],m[1],u)],flying:false,spin:8+u*8,held:false};}
 if(T<S1-.2){const m=merBall(T);return{p:[m[0],BALL_R,m[1]],flying:false,spin:16+T*6,held:false};}
 if(T<S1){const m=merBall(S1-.2),u=sm(S1-.2,S1,T,easeOut);return{p:[lerp(m[0],B1[0],u),BALL_R,lerp(m[1],B1[2],u)],flying:false,spin:20,held:false};}
 if(T<H1){const u=sm(S1,H1,T,linear);return{p:lin3(B1,CH1,u),flying:true,spin:30+u*30,held:false};}
 if(T<H1+.62){const u=sm(H1,H1+.62,T,linear),p=quad3(CH1,[lerp(CH1[0],R1[0],.45),.95,lerp(CH1[2],R1[2],.45)],[R1[0]-.3,BALL_R,R1[2]+.5],u);return{p,flying:true,spin:60+u*20,held:false};}
 if(T<S2){const u=sm(H1+.62,S2,T,easeOut);return{p:[lerp(R1[0]-.3,R1[0],u),BALL_R,lerp(R1[2]+.5,R1[2],u)],flying:false,spin:80+u*6,held:false};}
 if(T<H2){const u=sm(S2,H2,T,linear);return{p:lin3(R1,CH2,u),flying:true,spin:90+u*30,held:false};}
 const DROP:V3=[KX2+.02,BALL_R,KZ-.72];
 if(T<SCOOP+.3){const u=sm(H2,SCOOP+.3,T,easeOut),p=quad3(CH2,[lerp(CH2[0],DROP[0],.5),CH2[1]*.5+.15,lerp(CH2[2],DROP[2],.5)],DROP,u);return{p,flying:u<1,spin:120+u*10,held:false};}
 if(T<SCOOP+.6)return{p:DROP,flying:false,spin:130,held:false};
 return{p:heldBall(liveK(T)),flying:false,spin:130,held:true};
}
/** Luan: set and bouncing, shuffles across with the ball, SQUARE before each shot, absorbs each hit, drops onto the rebound, up holding it */
const liveK:Gen=T=>{
 const X=key(T,mono([[0,-.1],[RECV0,-.25,easeIO],[S1-.35,KX1,easeIO],[H1+.3,KX1],[S2-.3,KX2,easeIO]])),Z=KZ;
 const sq1=sm(S1-.6,S1-.25,T,easeIO),hit1=sm(H1-.04,H1+.08,T)*(1-sm(H1+.35,H1+.7,T,easeIO)),sq2=sm(S2-.55,S2-.2,T,easeIO),hit2=sm(H2-.04,H2+.08,T);
 let pose=keeperSet(T*1.3);
 pose=blendPose(pose,SQUARE,Math.max(sq1*(1-sm(H1+.55,H1+.9,T))*1,sq2));
 if(T<S2-.6)pose=blendPose(pose,ABSORB,hit1);else pose=blendPose(pose,ABSORB,hit2);
 if(T>SCOOP){const u=sm(SCOOP,SCOOP+.7,T,linear);pose=blendPose(pose,keeperScoop(u),sm(SCOOP,SCOOP+.15,T));}
 const up=sm(SCOOP+.75,SCOOP+1.35,T,easeIO);if(up>0)pose=blendPose(pose,HOLD,up);
 let yaw=FACE_CAMERA;
 if(T<RECV0)yaw=yawTo(TOM0[0]-X,TOM0[1]-Z);
 else if(T<H1+.1){const m=T<S1?merBall(T):[B1[0],B1[2]];yaw=yawTo(m[0]-X,m[1]-Z);}
 else if(T<H2){yaw=lerp(Y1,Y2,sm(H1+.2,S2-.3,T,easeIO));}
 else yaw=lerp(Y2,FACE_CAMERA,sm(SCOOP+.7,SCOOP+1.6,T,easeIO));
 return{pose,yaw,X,Z};};
/** Palma's four (red): P0 closes Merlim late, P1 slides at the rebound, P2 marks the pivot, P3 the far side */
const PO:[number,number][]=[[-4.4,6.6],[-.9,3.6],[-1.1,8.2],[3.0,5.4]];
const livePAL=(i:number):Gen=>T=>{const[x0,z0]=PO[i],b=liveBall(T).p;let X=x0,Z=z0,pose=backpedal(T*1.4+i*.3);
 if(i===0){const c=sm(RECV0,S1,T,easeIO);X=lerp(x0,M1.X+.8,c*.72);Z=lerp(z0,M1.Z+1.1,c*.72);pose=blendPose(pose,lunge(key(T,[[S1-.3,0],[S1,.6],[S1+.5,1]],linear),{side:'r'}),sm(S1-.4,S1-.25,T)*(1-sm(S1+.8,S1+1.3,T)));}
 if(i===1){const c=sm(H1+.1,S2,T,easeIO);X=lerp(x0,TP.X+.9,c*.65);Z=lerp(z0,TP.Z+.4,c*.65);if(c>0&&c<1)pose=runCycle(T*runCadence(.7),{speed:.7});
  pose=blendPose(pose,lunge(key(T,[[S2-.3,0],[S2,.6],[S2+.5,1]],linear),{side:'l'}),sm(S2-.35,S2-.2,T)*(1-sm(S2+.8,S2+1.3,T)));}
 const safe=sm(SCOOP+.5,SCOOP+1.2,T);if(safe>0)pose=blendPose(pose,posed({lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:4,lShF:40,rShF:40,lShA:30,rShA:30,lElb:70,rElb:70,neckP:-6}),safe*.6);
 return{pose,yaw:yawTo(b[0]-X,b[2]-Z),X,Z};};
/** Sporting's other two: Zicky the pivot (back to goal) and Taynan on the right */
const SC:[number,number][]=[[-.4,8.9],[4.6,3.2]];
const liveSCP=(i:number):Gen=>T=>{const[x0,z0]=SC[i],b=liveBall(T).p;const drift=i===1?sm(RECV0,S2,T,easeIO):0;const X=x0-drift*1.1,Z=z0+drift*1.6;
 let pose=blendPose(stand(),runCycle(T*runCadence(.3)+i*.4,{speed:.3}),i===1?.6:.35);
 pose=blendPose(pose,posed({lHipF:10,rHipF:14,lKnee:14,rKnee:16,lean:-6,neckP:-20,lShF:140,rShF:140,lShA:30,rShA:30,lElb:120,rElb:120}),sm(H2+.1,H2+.6,T)*.8);
 return{pose,yaw:yawTo(b[0]-X,b[2]-Z),X,Z};};
/** the cable camera: 7.5 m up, gliding from behind Sporting's attack toward Palma's goal (never top-down: it looks along the court) */
const st1=(T:number):Stage=>({F:1800,eye:7.5,cx:-.9+.6*sm(RECV0,H2,T,easeIO),cz:-17+5.2*sm(0,SCOOP+1.2,T,easeIO)});
const liveView=(T:number)=>{const st=st1(T),fx=kv(T,[[0,-1.6],[RECV0,-3.2],[S1,-1.8],[H1+.4,-.6],[S2,.2],[C1.end,.1]]),fz=kv(T,[[0,2.2],[RECV0,3.6],[S1,6.6],[H2,8.2],[C1.end,8.6]]);
 const p=proj(st,fx,.9,fz);return{st,x:p[0],y:p[1],zoom:kv(T,[[0,1.3],[C1.fm,1.45],[S1,1.8],[H1+.3,1.95],[S2,1.9],[H2+.2,2.2],[C1.both,2.35],[C1.end,2.3]])};};
function live(s:Sheet,T:number,Tc:number){
 const v=liveView(Tc),st=st1(Tc),h1=pulse(Tc,H1,.35),h2=pulse(Tc,H2,.35);
 cam(s,v.x,v.y+4*(h1+h2)*Math.sin(Tc*80),v.zoom);
 const b=liveBall(T);
 const items:It[]=[];
 arena(s,st,{t:T,cheer:.15+.5*pulse(T,H1,1.2)+.8*pulse(T,H2,1.6)+.4*sm(SCOOP+.5,C1.end,T),flash:pulse(T,H1,1)+pulse(T,H2,1),
  keeper:stg=>{
   // "first minute": the ball carrier gets a yellow dashed ring (Sporting on the ball, first attack)
   const fm=easeOutBack(sm(C1.fm,C1.fm+.3,T))*(1-sm(S1-.5,S1-.2,T));if(fm>.02){const m=merBall(T);floorDashRing(s,stg,Y,m[0],m[1],.6,9,71,fm);}
   athlete(s,stg,liveK,T,LUAN,{detail:'auto',smear:(T>H1-.05&&T<H1+.2)||(T>H2-.05&&T<H2+.2)?.1:0});
  }});
 const add=(g:Gen,style:AthleteStyle,o:{detail?:'low'|'auto';smear?:number}={})=>items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,style,{detail:o.detail??'low',smear:o.smear})});
 PO.forEach((_,i)=>add(livePAL(i),PAL(i)));SC.forEach((_,i)=>add(liveSCP(i),SCP(i+6)));
 add(merlim,MERLIM,{detail:'auto',smear:T>S1-.2&&T<S1+.2?.1:0});add(tomas,TOMAS,{detail:'auto',smear:T>S2-.2&&T<S2+.2?.1:0});
 if(!b.held)items.push({z:b.p[2]-.02,draw:()=>{const r=Math.max(8,kAt(st,b.p[2])*BALL_R);
  if(b.flying&&((T>S1&&T<H1+.05)||(T>S2&&T<H2+.05)))trail(s,st,t=>liveBall(t).p,T<H1+.05?S1:S2,T,r,17,.16);
  ballOn(s,st,b.p[0],b.p[1],b.p[2],18,{min:8,rot:b.spin,smear:b.flying?.35:0,dir:Math.atan2(-.3,.2)});
  for(const[hT,C,sd]of[[H1,CH1,19],[H2,CH2,20]] as [number,V3,number][])if(T>=hT&&T<hT+.4){const q=proj(st,C[0],C[1],C[2]);sparkBurst(s,Y,q[0],q[1],70,{n:9,seed:sd,g:easeOut(sm(hT,hT+.25,T))});}}});
 drawSorted(items);
 if(b.held){const k=liveK(T);void k;const p=b.p;items.length=0;ballOn(s,st,p[0],p[1],p[2],18,{min:8,rot:b.spin});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(st1(tc),liveK(tt),BUILD_L,.2));},still:H2+.05};

// ================= chapter 2 — THE LAST MINUTE (steadicam): 0–2, Sporting's flying goalkeeper; tilt up — the board flips 0–3 at 39:56; tilt down — Luan celebrates =================
const C2={pl:A(1,'Palma lead'),sa:A(1,'Sporting attack'),ex:A(1,'extra'),lm:A(1,'last minute'),gs:A(1,'goalkeeper'),tn:A(1,'Three nil'),pr:A(1,'Palma reach'),end:AUTH[1].seconds};
/** the tilt: up to the board just after "last minute", down again on "Three nil"; the players re-form while we look at the board */
const UP0=C2.lm-.1,UP1=UP0+.75,DN0=Math.max(C2.gs+.9,C2.tn-.55),DN1=DN0+.7,CUT=(UP1+DN0)/2;
const st2=(t:number):Stage=>({F:1250,eye:1.65,cx:.35-.5*sm(0,C2.lm,t,easeIO)-.4*sm(DN0,C2.end,t,easeIO),cz:GZ-12.4+.9*sm(0,C2.lm,t,easeIO)+.7*sm(DN0,C2.end,t,easeIO)});
/** Sporting's five in an arc (the flying goalkeeper at the top, yellow) and Palma's four in a box in front of Luan (inferred shapes) */
const ARC:[number,number][]=[[-4.3,6.3],[-2.1,4.6],[0,4.3],[2.3,4.7],[.6,8.2]];
const BOX:[number,number][]=[[-2.3,6.6],[2.2,6.7],[-.9,8.6],[1.9,8.9]];
/** the ball goes round the arc: flyer → right → pivot → right → flyer → left … */
const ROUTE=[2,3,2,1,0,1,2,3];
const passT=(k:number)=>.3+k*Math.max(.45,(UP0-.3)/(ROUTE.length-1));
function arcBall(t:number):[number,number]{let k=0;while(k<ROUTE.length-2&&t>passT(k+1))k++;const a=ARC[ROUTE[k]],b=ARC[ROUTE[k+1]],u=sm(passT(k)+.12,passT(k+1),t,easeOut);return[lerp(a[0],b[0],u)+.3,lerp(a[1],b[1],u)-.25];}
const scpA=(i:number):Gen=>t=>{const[x0,z0]=ARC[i],b=arcBall(t),sway=.35*Math.sin(t*1.7+i);
 let pose=blendPose(stand(),runCycle(t*runCadence(.3)+i*.3,{speed:.3}),.45);
 for(let k=0;k<ROUTE.length;k++)if(ROUTE[k]===i){const pt=passT(k)+.1;pose=blendPose(pose,strike(key(t,[[pt-.25,.22],[pt,STRIKE_CONTACT],[pt+.35,.85]],linear),{foot:'r',power:.35}),sm(pt-.3,pt-.2,t)*(1-sm(pt+.3,pt+.4,t)));}
 let X=x0+sway*(i===4?0:1),Z=z0,yaw=yawTo(b[0]-X,b[1]-Z);
 if(t>CUT){const out:[number,number]=[[-5.2,5.2],[-3.9,8.8],[4.4,9.4],[3.9,5.6],[5.4,7.8]][i] as [number,number];X=out[0];Z=out[1];
  pose=blendPose(stand(),[HEAD_DOWN,HANDS_KNEES,HEAD_DOWN,HANDS_KNEES,HEAD_DOWN][i],.9);yaw=[FACE_LEFT+.5,FACE_AWAY+.4,FACE_AWAY,FACE_RIGHT+.3,FACE_AWAY-.6][i];}
 return{pose,yaw,X,Z};};
const HEAD_DOWN=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20});
const HANDS_KNEES=posed({lHipF:50,rHipF:50,lKnee:30,rKnee:30,lean:40,neckP:10,lShF:70,rShF:70,lShA:10,rShA:10,lElb:10,rElb:10});
/** Luan after the goal (inferred place): out in front of his goal, facing us, arms up; team-mates run in and jump on him */
const CEL:[number,number]=[-.5,7.6];
const lastK:Gen=t=>{
 if(t<CUT){const b=arcBall(t),X=clamp(b[0]*.12,-.5,.5);return{pose:keeperSet(t*1.3),yaw:yawTo(b[0]-X,b[1]-KZ),X,Z:KZ};}
 const pose=celebrate((t-CUT)*1.05,{kind:'arms'});return{pose,yaw:FACE_CAMERA+.15*Math.sin(t*2),X:CEL[0],Z:CEL[1]};};
const palA=(i:number):Gen=>t=>{const[x0,z0]=BOX[i],b=arcBall(t);
 if(t<CUT){const X=x0+(b[0]-x0)*.12,Z=z0;return{pose:backpedal(t*1.3+i*.4),yaw:yawTo(b[0]-X,b[1]-Z),X,Z};}
 const from:[number,number]=[[-4.2,4.6],[3.9,4.4],[-3.2,9.6],[3.4,9.8]][i] as [number,number],to:[number,number]=[CEL[0]+[-.75,.72,-.55,.6][i],CEL[1]+[-.35,-.3,.55,.5][i]];
 const u=sm(DN0-.2,C2.pr,t,easeIO),X=lerp(from[0],to[0],u),Z=lerp(from[1],to[1],u);
 let pose=runCycle(t*runCadence(.85)+i*.25,{speed:.85});const hug=sm(C2.pr-.3,C2.pr+.1,t);
 pose=blendPose(pose,celebrate((t-C2.pr)*1.1+i*.2,{kind:'arms'}),hug);
 return{pose,yaw:u<.95?yawTo(to[0]-from[0],to[1]-from[1]):yawTo(CEL[0]-X,CEL[1]-Z),X,Z};};
/** the hanging scoreboard over Palma's area: SCP ▮ 0 – 2/3 ▮ PAL, clock 39:5x underneath */
const SEG:number[][]=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1],[1,0,1,1,0,1,1],[1,0,1,1,1,1,1],[1,1,1,0,0,0,0],[1,1,1,1,1,1,1],[1,1,1,1,0,1,1]];
function digit(p:Path2D,x:number,y:number,w:number,h:number,n:number){const t=w*.2,on=SEG[n]||SEG[0],hh=h/2;
 const bars:[number,number,number,number][]=[[x+t,y,w-2*t,t],[x+w-t,y+t*.5,t,hh-t*.5],[x+w-t,y+hh,t,hh-t*.5],[x+t,y+h-t,w-2*t,t],[x,y+hh,t,hh-t*.5],[x,y+t*.5,t,hh-t*.5],[x+t,y+hh-t/2,w-2*t,t]];
 bars.forEach((b,i)=>{if(on[i])p.rect(b[0],b[1],b[2],b[3]);});}
const BOARD:V3=[0,8.2,GZ-3.2];
function scoreboard(s:Sheet,st:Stage,palma:number,secs:number,flash:number){
 const c=proj(st,BOARD[0],BOARD[1],BOARD[2]),k=kAt(st,BOARD[2]),w=3.6*k,h=1.9*k,x=c[0]-w/2,y=c[1]-h/2;
 const cab=new Path2D();cab.moveTo(x+w*.2,y);cab.lineTo(x+w*.2,y-6*k);cab.moveTo(x+w*.8,y);cab.lineTo(x+w*.8,y-6*k);s.stroke(K,cab,Math.max(2,k*.04),.8);
 const box=rectPath(x,y,w,h);s.knockout(box);s.fill(K,box,.92);
 // team blocks: Sporting (navy with a green band) left, Palma (red) right
 s.knockout(rectPath(x+w*.05,y+h*.12,w*.14,h*.3));s.fill(K,rectPath(x+w*.05,y+h*.12,w*.14,h*.3),.55);s.fill(G,rectPath(x+w*.05,y+h*.22,w*.14,h*.1));
 s.knockout(rectPath(x+w*.81,y+h*.12,w*.14,h*.3));s.fill(R,rectPath(x+w*.81,y+h*.12,w*.14,h*.3));
 const dg=new Path2D(),dw=w*.13,dh=h*.36,dy=y+h*.09;digit(dg,x+w*.27,dy,dw,dh,0);dg.rect(x+w*.46,dy+dh*.45,w*.08,dh*.1);digit(dg,x+w*.6,dy,dw,dh,palma);
 // the clock 39:5x (small digits, lower row)
 const cw=w*.09,ch=h*.28,cy=y+h*.6,cx0=x+w*.29;[3,9].forEach((n,i)=>digit(dg,cx0+i*cw*1.2,cy,cw,ch,n));dg.rect(cx0+2.45*cw,cy+ch*.25,cw*.18,cw*.18);dg.rect(cx0+2.45*cw,cy+ch*.65,cw*.18,cw*.18);
 [5,Math.max(0,Math.min(9,secs-50))].forEach((n,i)=>digit(dg,cx0+2.9*cw+i*cw*1.2,cy,cw,ch,n));
 s.knockout(dg);s.fill(Y,dg,.8+.2*Math.min(1,flash));
 if(flash>.05)s.fill(Y,ribbon([[x-10,y-10],[x+w+10,y-10],[x+w+10,y+h+10],[x-10,y+h+10],[x-10,y-10]],12*flash,{seed:91,taper:0,wobble:1}),Math.min(1,flash));
}
const lastView=(t:number)=>{const st=st2(t),tilt=sm(UP0,UP1,t,easeIO)*(1-sm(DN0,DN1,t,easeIO));
 const low=proj(st,kv(t,[[0,0],[C2.ex,-.4],[CUT,-.3],[DN1,CEL[0]],[C2.end,CEL[0]+.1]]),t<CUT?1.1:1.2,t<CUT?6.2:CEL[1]),hi=proj(st,BOARD[0],BOARD[1]+.5,BOARD[2]);
 return{st,x:lerp(low[0],hi[0],tilt),y:lerp(low[1],hi[1],tilt),zoom:lerp(kv(t,[[0,1.0],[C2.ex,1.08],[CUT,1.08],[DN1,1.45],[C2.pr,1.55],[C2.end,1.6]]),1.25,tilt)};};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),v=lastView(t),st=v.st;
  const flip=pulse(tt,C2.gs,1.3);cam(s,v.x,v.y+5*flip*Math.sin(t*70),v.zoom);
  const secs=Math.min(56,50+Math.floor(sm(0,C2.gs,tt)*6));
  arena(s,st,{t:tt,cheer:.2+.8*sm(C2.gs,C2.gs+.3,tt),flash:flip+.7*pulse(tt,C2.pr,1.2),
   behind:stg=>scoreboard(s,stg,tt<C2.gs?2:3,tt<C2.gs?secs:56,flip+.6*pulse(tt,C2.pl,1)),
   keeper:stg=>{if(tt<CUT)athlete(s,stg,lastK,tt,LUAN,{detail:'auto'});}});
  const items:It[]=[];
  const add=(g:Gen,style:AthleteStyle,d:'low'|'auto'='auto')=>items.push({z:g(tt).Z,draw:()=>athlete(s,st,g,tt,style,{detail:d})});
  ARC.forEach((_,i)=>add(scpA(i),i===2?FLYER:SCP(i+10)));BOX.forEach((_,i)=>add(palA(i),PAL(i+4)));
  if(tt>=CUT)add(lastK,LUAN);
  if(tt<CUT){const b=arcBall(tt);items.push({z:b[1],draw:()=>ballOn(s,st,b[0],BALL_R,b[1],120,{min:7,rot:tt*6})});}
  drawSorted(items);
  // "extra player": yellow dashed ring under the flying goalkeeper (five against four)
  const ex=easeOutBack(sm(C2.ex,C2.ex+.3,tt))*(1-sm(UP0,UP0+.3,tt));if(ex>.02){const f=scpA(2)(tt);floorDashRing(s,st,Y,f.X,f.Z,.75,9,131,ex);}
  // "Palma reach the final": a yellow burst over Luan and the pile of team-mates
  if(tt>=C2.pr&&tt<C2.pr+1){const q=proj(st,CEL[0],2.5,CEL[1]);sparkBurst(s,Y,q[0],q[1],120,{n:14,seed:133,g:easeOut(sm(C2.pr,C2.pr+.35,tt))*(1-sm(C2.pr+.7,C2.pr+1,tt))});}
 },
 aperture(t0){const{tt,tc}=clock(1,t0);return aperture(chestPts(st2(tc),lastK(tt),BUILD_L,.15));},
 still:C2.gs+.3,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration, real time; shooter's-eye camera over his shoulder) =================
const C3={w:A(2,'Watch'),cl:A(2,'shot is'),nt:A(2,'no time'),sq:A(2,'stays'),ch:A(2,'chest'),al:A(2,'arms and'),hb:A(2,'hits'),end:AUTH[2].seconds};
/** demo world (arena, empty): Luan a step off his line in the middle; the ball 4.6 m out, a touch to his right; right-foot shot at his chest */
const KD:[number,number]=[0,GZ-1.25],B3:V3=[-.3,BALL_R,GZ-5.85];
const YD=yawTo(B3[0]-KD[0],B3[2]-KD[1]),CH3=chestAt(KD[0],KD[1],YD),SH3=plantFor(B3,CH3);
const D_HIT=C3.hb+.05,D_S=D_HIT-.24,D0=D_S-.5;
const demoS:Gen=t=>{
 const X=key(t,mono([[0,SH3.X-.7],[C3.cl,SH3.X-.25,easeOut],[D0,SH3.X-.1,easeIO],[D_S,SH3.X,easeOut],[D_S+.7,SH3.X+.2,easeOut],[C3.end,SH3.X+.25]]));
 const Z=key(t,mono([[0,SH3.Z-2.6],[C3.cl,SH3.Z-.9,easeOut],[D0,SH3.Z-.4,easeIO],[D_S,SH3.Z,easeOut],[D_S+.7,SH3.Z+.5,easeOut],[C3.end,SH3.Z+.6]]));
 let pose:Pose;
 if(t<C3.cl)pose=dribble(t*1.4,{foot:'r',speed:.45});
 else if(t<D0)pose=blendPose(dribble(t*1.1,{foot:'r',speed:.25}),stand(),sm(C3.cl,C3.cl+.5,t)*.4);
 else pose=blendPose(dribble(D0*1.1,{foot:'r',speed:.25}),strike(key(t,[[D0,.14],[D0+.25,.26],[D_S,STRIKE_CONTACT],[D_S+.7,.95],[C3.end,1]],linear),{foot:'r'}),sm(D0,D0+.12,t));
 return{pose,yaw:lerp(yawTo(.2,1),SH3.yaw,sm(D0-.6,D0,t,easeIO)),X,Z};};
function demoBall(t:number):{p:V3;flying:boolean;held:boolean}{
 if(t<D0){const f=demoS(t),ph=((t*1.2)%1+1)%1;return{p:[f.X+Math.cos(f.yaw)*(.42+.12*easeOut(ph)),BALL_R,f.Z+Math.sin(f.yaw)*(.42+.12*easeOut(ph))],flying:false,held:false};}
 if(t<D_S){const f=demoS(D0),a:V3=[f.X+Math.cos(f.yaw)*.45,BALL_R,f.Z+Math.sin(f.yaw)*.45],u=sm(D0,D_S-.12,t,easeOut);return{p:lin3(a,B3,u),flying:false,held:false};}
 if(t<D_HIT){const u=sm(D_S,D_HIT,t,linear);return{p:lin3(B3,CH3,u),flying:true,held:false};}
 const DROP:V3=[KD[0]-.02,BALL_R,KD[1]-.7];
 if(t<D_HIT+.45){const u=sm(D_HIT,D_HIT+.45,t,easeOut);return{p:quad3(CH3,[lerp(CH3[0],DROP[0],.5),CH3[1]*.55+.1,lerp(CH3[2],DROP[2],.5)],DROP,u),flying:u<1,held:false};}
 if(t<D_HIT+.8)return{p:DROP,flying:false,held:false};
 return{p:heldBall(demoK(t)),flying:false,held:true};
}
/** Luan: set → SQUARE on "stays square" (held through the diagram beats) → absorb on the hit → smother → up holding it */
const demoK:Gen=t=>{
 let pose=blendPose(keeperSet(t*.9),SQUARE,sm(C3.sq-.15,C3.sq+.3,t,easeIO));
 pose=blendPose(pose,ABSORB,sm(D_HIT-.03,D_HIT+.09,t));
 if(t>D_HIT+.3){const u=sm(D_HIT+.3,D_HIT+.9,t,linear);pose=blendPose(pose,keeperScoop(u),sm(D_HIT+.3,D_HIT+.42,t));}
 const up=sm(D_HIT+1.05,D_HIT+1.6,t,easeIO);if(up>0)pose=blendPose(pose,HOLD,up);
 const b=t<D_S?demoBall(t).p:B3;return{pose,yaw:yawTo(b[0]-KD[0],b[2]-KD[1]),X:KD[0],Z:KD[1]};};
/** the rig rides in behind the shooter's left shoulder, at his head height */
const st3=(t:number):Stage=>{const f=demoS(Math.min(t,D0));return{F:1250,eye:1.86,cx:f.X+.72,cz:f.Z-2.1};};
const demoView=(t:number)=>{const st=st3(t),k=proj(st,KD[0],1.05,KD[1]);return{st,x:k[0]+kv(t,[[0,-120],[C3.cl,-90],[C3.sq,-30],[C3.al,-20],[D_HIT,-60],[C3.end,-50]]),y:k[1]+kv(t,[[0,150],[C3.sq,110],[C3.end,120]]),zoom:kv(t,[[0,1.05],[C3.cl,1.15],[C3.sq,1.6],[C3.ch,1.7],[C3.al,1.62],[D_HIT,1.4],[C3.end,1.45]])};};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),v=demoView(t),st=v.st,hit=pulse(t,D_HIT,.4);
  cam(s,v.x+6*hit*Math.sin(t*90),v.y+4*hit*Math.cos(t*77),v.zoom);
  const b=demoBall(tt),k=demoK(tt),sk=solve(k.pose,BUILD_L,placeAt(k.X,k.Z,k.yaw));
  arena(s,st,{t:tt,crowd:0,flash:pulse(tt,D_HIT,1.1),
   keeper:stg=>{
    athlete(s,stg,demoK,tt,LUAN_DEMO,{detail:'high',smear:tt>D_HIT-.05&&tt<D_HIT+.25?.12:0});
    const P=(p:V3)=>{const q=toMine(p);return proj(stg,q[0],q[1],q[2]);};
    // "stays square": a green bar across his shoulders, square (90°) to the line of the ball
    const g=easeOutBack(sm(C3.sq,C3.sq+.35,tt))*(1-sm(D_S-.1,D_S+.1,tt));
    if(g>.02){const l=P(sk.lSh),r=P(sk.rSh),m:Pt=[(l[0]+r[0])/2,(l[1]+r[1])/2],e=(q:Pt):Pt=>[m[0]+(q[0]-m[0])*1.45*g,m[1]+(q[1]-m[1])*1.45*g];const bar=ribbon([e(l),e(r)],14,{seed:141,taper:.1,wobble:.8});s.knockout(bar);s.fill(G,bar);}
    // "chest to the ball": a yellow dashed line from his chest out to the ball (the line of the shot)
    const c=sm(C3.ch,C3.ch+.45,tt,easeOut)*(1-sm(D_S-.05,D_S+.05,tt));
    if(c>.02){const ch=toMine(sk.chest),pts=[proj(stg,ch[0],ch[1]-.08,ch[2]),proj(stg,b.p[0],b.p[1]+.02,b.p[2])];dashed(s,Y,pts,10,150,{dash:24,progress:c});}
    // "arms and legs wide": yellow arrows out from both gloves and both feet
    const a=sm(C3.al,C3.al+.4,tt,easeOut)*(1-sm(D_S-.05,D_S+.05,tt));
    if(a>.02)for(const[j,ref]of[[sk.lHa,sk.chest],[sk.rHa,sk.chest],[sk.lAn,sk.pelvis],[sk.rAn,sk.pelvis]] as [V3,V3][]){const h=toMine(j),o=toMine(ref),dx=h[0]-o[0],dz=h[2]-o[2],l=Math.hypot(dx,dz)||1,e:V3=[h[0]+dx/l*.45,h[1],h[2]+dz/l*.45],pts=[proj(stg,h[0],h[1],h[2]),proj(stg,e[0],e[1],e[2])];
     dashed(s,Y,pts,9,152,{dash:20,progress:a});if(a>.9)arrowHead(s,Y,pts,24);}
   }});
  // "The shot is close": a red dashed line on the floor from the ball to his feet, end bars; "no time to dive": a crossed-out dive arc
  const cl=sm(C3.cl,C3.cl+.4,tt,easeOut)*(1-sm(C3.sq,C3.sq+.3,tt));
  if(cl>.02){const bb=demoBall(tt).p,pts=[proj(st,bb[0],0,bb[2]+.2),proj(st,KD[0],0,KD[1]-.3)];dashed(s,R,pts,10,160,{dash:22,progress:cl});
   for(const q of pts){const w=26*cl;s.fill(R,ribbon([[q[0]-w,q[1]],[q[0]+w,q[1]]],9,{seed:161,taper:0}),1);}}
  const nt=sm(C3.nt,C3.nt+.35,tt,easeOut)*(1-sm(C3.sq-.05,C3.sq+.25,tt));
  if(nt>.02){const a=proj(st,KD[0]+.3,1.1,KD[1]),b2=proj(st,KD[0]+1.35,.35,KD[1]),m=proj(st,KD[0]+1.05,1.2,KD[1]),pts:Pt[]=[a,m,b2];dashed(s,K,pts,8,162,{dash:18,progress:nt,cov:.8});if(nt>.9)arrowHead(s,K,pts,20,.8);
   const x=sm(C3.nt+.3,C3.nt+.55,tt);if(x>.02){const c:Pt=[(a[0]+b2[0])/2+10,(a[1]+b2[1])/2-8],r=34*x;for(const d of[1,-1]){const p=ribbon([[c[0]-r,c[1]-r*d],[c[0]+r,c[1]+r*d]],11,{seed:163+d,taper:.1});s.knockout(p);s.fill(R,p);}}}
  const its:It[]=[{z:demoS(tt).Z,draw:()=>athlete(s,st,demoS,tt,DEMO_S,{detail:'high',smear:tt>D_S-.25&&tt<D_S+.2?.2:0})}];
  if(!b.held)its.push({z:b.flying?b.p[2]:Math.max(b.p[2],demoS(tt).Z+.01),draw:()=>{const r=kAt(st,b.p[2])*BALL_R;
   if(b.flying&&tt<D_HIT)trail(s,st,q=>demoBall(q).p,D_S,tt,r,170,.2);
   ballOn(s,st,b.p[0],b.p[1],b.p[2],171,{rot:tt*6,smear:b.flying?.3:0,dir:-Math.PI/2});
   if(tt>=D_HIT&&tt<D_HIT+.6){const q=proj(st,CH3[0],CH3[1],CH3[2]);sparkBurst(s,Y,q[0],q[1],110,{n:12,seed:172,g:easeOut(sm(D_HIT,D_HIT+.3,tt))*(1-sm(D_HIT+.4,D_HIT+.6,tt))});}}});
  drawSorted(its);
  if(b.held)ballOn(s,st,b.p[0],b.p[1],b.p[2],171,{rot:2});
 },
 aperture(t0){const{tt,tc}=clock(2,t0);return aperture(chestPts(st3(tc),demoK(tt),BUILD_L,.16));},
 still:C3.al+.5,
};

// ================= chapter 4 — YOUR TURN (slow-motion replay of the demonstration from a PROFILE camera at knee height) =================
const C4={yt:A(3,'Your'),ss:A(3,'Stay square'),tb:A(3,'to the ball'),sh:A(3,'shots hit'),yb:A(3,'your body'),end:AUTH[3].seconds};
/** side world: the goal line at X = −20 (goal mouth Z 8.5–11.5), the court runs +X; the camera stands on the court, looking along +Z */
const GLX=-20,PN=8.5,PF=11.5,BOARDS=21.2;
const st4:Stage={F:1500,eye:.95,cx:-17.0,cz:4.6};
const KP:[number,number]=[-18.75,10],BP:V3=[-15.1,BALL_R,10.2];
const Y4=yawTo(BP[0]-KP[0],BP[2]-KP[1]),CH4=chestAt(KP[0],KP[1],Y4),SP=plantFor(BP,CH4);
/** slow motion: the strike spans "shots hit" → the ball meets his chest on "your body" */
const P_S=Math.max(C4.sh+.35,C4.yb-.75),P_HIT=Math.max(P_S+.4,C4.yb+.1),P0=P_S-.9;
const profS:Gen=t=>{const pose=t<P0?blendPose(stand(),dribble(t*.6,{foot:'r',speed:.15}),.5):strike(key(t,[[P0,.12],[P0+.4,.26],[P_S,STRIKE_CONTACT],[P_S+1.4,.9],[C4.end,1]],linear),{foot:'r'});
 return{pose,yaw:SP.yaw,X:SP.X-.25*(1-sm(P0,P_S,t,easeOut)),Z:SP.Z};};
function pBall(t:number):V3{
 if(t<P_S)return BP;
 if(t<P_HIT)return lin3(BP,CH4,sm(P_S,P_HIT,t,linear));
 const u=sm(P_HIT,P_HIT+.9,t,easeOut);return quad3(CH4,[CH4[0]+.35,CH4[1]*.5+.12,CH4[2]],[KP[0]+.7,BALL_R,KP[1]],u);
}
const profK:Gen=t=>{let pose=blendPose(keeperSet(t*.6),SQUARE,sm(C4.ss-.2,C4.ss+.35,t,easeIO));pose=blendPose(pose,ABSORB,sm(P_HIT-.05,P_HIT+.18,t));
 if(t>P_HIT+.6){const u=sm(P_HIT+.6,P_HIT+1.4,t,linear);pose=blendPose(pose,keeperScoop(u),sm(P_HIT+.6,P_HIT+.75,t));}
 return{pose,yaw:Y4,X:KP[0],Z:KP[1]};};
function courtProfile(s:Sheet,st:Stage,t:number,flash:number){
 const span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(G,rectPath(-span,wall,span*2,span),.5);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,st,-20,0,20,20,true);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GLX+6*Math.sin(a),PN-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GLX+6*Math.sin(a),PF+6*Math.cos(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[GLX,st.cz+.5],[GLX,20]],.05),true));lines.addPath(polyPath(floorStrip(st,[[-20,20],[20,20]],.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));lines.addPath(polyPath(floorRing(st,GLX+6,10,.12,12),true));
 s.knockout(lines,.94);
 const board=.95*kw,x0s:number[]=[],x1s:number[]=[];for(let i=-12;i<14;i++){x0s.push(proj(st,-24+i*3+.3,0,BOARDS)[0]);x1s.push(proj(st,-24+i*3+2.4,0,BOARDS)[0]);}
 boards(s,wall,board,x0s,x1s);stands(s,wall-board,kw,t,0,flash,st.cx,0);
 // the goal seen side-on: net box behind the line, then the posts
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GLX-lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,GLX,0,PN),proj(st,GLX,H,PN),proj(st,GLX,H,PF),back(PF,H),back(PF,0),back(PN,0)];const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=PN;Z<=PF+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(PN,Yh);mesh.moveTo(a[0],a[1]);for(let Z=PN+.3;Z<=PF+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GLX+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(PF);post(PN);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GLX,H+dy,Z);quad([Bb(PN,-w),Bb(PF,-w),Bb(PF,w),Bb(PN,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(PN,PF,k/12),z1=lerp(PN,PF,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,hit=pulse(t,P_HIT,.5);
  const mid=proj(st,lerp(KP[0],SP.X,kv(t,[[0,.6],[C4.ss,.5],[C4.tb,.6],[C4.yb,.52],[C4.end,.46]])),kv(t,[[0,.95],[C4.ss,1.05],[C4.end,1]]),10);
  cam(s,mid[0]+5*hit*Math.sin(t*90),mid[1],kv(t,[[0,1.05],[C4.ss,1.22],[C4.tb,1.1],[C4.yb,1.25],[C4.end,1.3]]));
  courtProfile(s,st,tt,pulse(tt,P_HIT,1));
  const k=profK(tt),sk=solve(k.pose,BUILD_L,placeAt(k.X,k.Z,k.yaw)),b=pBall(tt);
  const items:It[]=[{z:KP[1],draw:()=>athlete(s,st,profK,tt,LUAN_DEMO,{detail:'high',smear:tt>P_HIT-.05&&tt<P_HIT+.3?.2:0})},
   {z:SP.Z,draw:()=>athlete(s,st,profS,tt,DEMO_S,{detail:'high',smear:tt>P_S-.3&&tt<P_S+.3?.25:0})},
   {z:b[2]-.3,draw:()=>{const r=kAt(st,b[2])*BALL_R;if(tt>P_S&&tt<P_HIT)trail(s,st,pBall,P_S,tt,r,190,.35);
    ballOn(s,st,b[0],b[1],b[2],191,{rot:tt*3,smear:tt>P_S&&tt<P_HIT?.25:0,dir:Math.PI});
    if(tt>=P_HIT&&tt<P_HIT+.7){const q=proj(st,CH4[0],CH4[1],CH4[2]);sparkBurst(s,Y,q[0],q[1],110,{n:12,seed:192,g:easeOut(sm(P_HIT,P_HIT+.3,tt))*(1-sm(P_HIT+.45,P_HIT+.7,tt))});}}}];
  drawSorted(items);sidePosts(s,st);
  // "Stay square": a green arrow straight out of his chest (where his chest faces); "to the ball": the navy shot line from the ball into it
  const ch=toMine(sk.chest),g=sm(C4.ss,C4.ss+.4,tt,easeOut)*(1-sm(P_HIT+.5,P_HIT+1,tt));
  if(g>.02){const e:V3=[ch[0]+Math.cos(k.yaw)*1.3,ch[1]-.05,ch[2]+Math.sin(k.yaw)*1.3],pts=[proj(st,ch[0]+Math.cos(k.yaw)*.25,ch[1]-.05,ch[2]+Math.sin(k.yaw)*.25),proj(st,e[0],e[1],e[2])];dashed(s,G,pts,13,200,{dash:30,progress:g});if(g>.9)arrowHead(s,G,pts,34);}
  const l=sm(C4.tb,C4.tb+.45,tt,easeOut)*(1-sm(P_HIT+.5,P_HIT+1,tt));
  if(l>.02){const pts=[proj(st,BP[0],BP[1],BP[2]),proj(st,CH4[0],CH4[1],CH4[2])];dashed(s,K,pts,11,201,{dash:26,progress:l});}
  // a big green tick once the ball is safe
  const tk=easeOutBack(sm(P_HIT+.55,P_HIT+.9,tt));
  if(tk>.02){const q=proj(st,KP[0]+1.3,1.9,KP[1]);tickMark(s,q,150*tk,409);}
 },
 still:C4.tb+.4,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'luan-muller-futsal-signature',format:'futsal',title:'Luan Muller’s close-range stop',theme:'Stay square to the ball so shots hit your body.',
 ageNote:'For players aged 7–12: the 2025 Champions League semi-final chapters are real (his first-minute stops are drawn as a keeper would make them; his goal is shown on the scoreboard); the square stance is shown as a demonstration. Practise it with a friend.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in and thumps into a green chest block, rings ripple, it drops; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const g=sm(0,.18,age)*(1-sm(.7,.95,age));if(g>.02){const w=r*1.6*g,h=r*2.4*g,body=polyPath(blob(x+r*1.6,y,w,h,seed+3,{n:22,amp:.04}),true);s.knockout(body);s.fill(G,body,g);}
  const inU=sm(0,.25,age,easeOut),dropU=sm(.25,.75,age,easeOut),bx=x-140+140*inU+r*.2*dropU,by=y+r*1.6*dropU*dropU;
  const u=clamp((age-.25)/.5);if(age>.25&&u<1)s.fill(Y,ribbon(blob(x+r*.6,y,r*(1+2*u),r*(.8+1.4*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);
  s.fill(K,polyPath(blob(bx,y+r*2.6,r*.8,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:age*5});
 },
};
export default film;
