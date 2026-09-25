/** Miquel Feixas — "the one-on-one block": a signature-move riso film (iconic plays, FUTSAL; Feixas is a goleiro).
 *
 * WHY THIS MOMENT: Feixas's entry (lib/town/iconicPlays.json) is a signature — the one-on-one block — not one match. Spanish Wikipedia names
 * ONE dated Feixas moment that starts with exactly that block and is described in words (citing the LNFS match report):
 *   9 March 2024, Palau Blaugrana, Liga (Primera División) — FC Barcelona 1–0 Mallorca Palma Futsal (Palma: the reigning European champions).
 *   0–0 in the last minute; Palma bring on a flying goalkeeper (portero-jugador) to go for the win; "tras un disparo del Palma, Miquel Feixas
 *   dio un toque al balón a modo bloqueo, y después de que botara en la pista, le propinó una volea espectacular con su pierna izquierda, y el
 *   balón entró en la escuadra tras dar en el larguero." The only goal; Barça back to the top of the league.
 * So the film RECREATES that play (a block, one bounce, a left-foot volley the length of the court, in off the bar), then teaches the block:
 *  1  LIVE (broadcast camera, HIGH in the main stand, 30 m back, real time): the Palau, 0–0 and the last minute; Palma's flying goalkeeper
 *     (navy shirt) joins the attack — the camera swings right to Palma's EMPTY goal and back; a pass, a shot; Feixas steps out and blocks,
 *     the ball pops up and bounces once, and his left-foot volley flies the whole court — off the crossbar and into the top corner. 1–0.
 *  2  REPLAY (slow motion, REVERSE ANGLE: low on the far touchline, a tracking camera that runs with the ball): the block, the bounce, the
 *     left foot (red ring on the boot), the long flight (the camera races it), the crossbar, in.
 *  3  HOW HE BLOCKS (a demonstration in training kit, empty arena, no match claimed; ELEVATED TOUCHLINE camera, side-on to the area): a
 *     training attacker breaks through; the shooting angle is painted on the floor (ball → both posts); Feixas rushes out and makes himself
 *     big (star-block rings); the angle shrinks; the shot hits his shin. Blocked.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Come off your line and close the angle fast when a player breaks through"): the
 *     ATTACKER'S-EYE view (point of view, no other film uses it): a young keeper in goal; the open goal is painted yellow; the keeper rushes
 *     out and spreads — the yellow shrinks to slivers — the shot hits the keeper. A red tick.
 * Sources (written; fetched once, cached in scratchpad/films/src-cache/):
 *  - Wikipedia (es), "Miquel Feixas de Jesús" (raw, fetched Sep 2026): born Barcelona 4 Sep 1997, goalkeeper, 1.85 m, 87 kg; Barça academy
 *    2012–18, Industrias Santa Coloma 2018–20, back at FC Barcelona from summer 2020; the 9 March 2024 Barça 1–0 Palma block-and-volley goal
 *    (quoted above) and a decisive shoot-out save in the 2024 Copa de España final v ElPozo. Cites LNFS: "Miquel Feixas otorga la victoria y
 *    el liderato al Barça con un gol in-extremis ante Mallorca Palma Futsal (1-0)" (lnfs.es/noticia/…/68399) and EFE/epe.es 24 Mar 2024.
 *    — https://es.wikipedia.org/wiki/Miquel_Feixas_de_Jes%C3%BAs
 *  - Wikipedia, "FC Barcelona Futsal" (raw): current squad lists "no=26 … Goalkeeper … Miquel Feixas" behind Dídac Plana; home ground
 *    Palau Blaugrana. — https://en.wikipedia.org/wiki/FC_Barcelona_Futsal
 *  - Card data (lib/town/playerProfiles.json): "Spanish goleiro who grew up in Barcelona's academy, returned to the first team in 2020 …",
 *    strengths "Brave 1v1 blocks", "Agile reflexes"; appearance (playerAppearance.json): short dark hair, stubble.
 * CONFIRMED: the match (league, 9 Mar 2024, Palau Blaugrana, Barça v Mallorca Palma Futsal), 0–0 into the last minute, Palma's flying
 *  goalkeeper, a Palma shot, Feixas's block ("a modo de bloqueo"), one bounce on the court, a spectacular LEFT-foot volley, off the crossbar
 *  into the top corner ("escuadra") of the empty goal, 1–0 the final score, Barça back on top; his height/weight; the futsal court (40×20 m,
 *  3×2 m goals, 5 v 5).
 * INFERRED (not named in the narration): every position and path — who passed, who shot and from where (a Palma player about 7.5 m out),
 *  where the block hit him (his shin), the pop-up height, where he volleyed from (just in front of his area), the flight's arc and which top
 *  corner (the far post from the main camera); the exact second (the scoreboard shows only a nearly-empty clock bar); which goal Barça
 *  defended; kits — Barça blue-and-garnet stripes (blue/red ink), navy shorts; Palma in white (paper) with navy shorts (away strip assumed),
 *  their flying goalkeeper in a navy keeper shirt; Feixas in a yellow long-sleeved keeper kit with no number drawn (26 is his current
 *  squad number, unverified for that night); the crowd; the celebration. Chapters 3–4 are teaching DEMONSTRATIONS of the signature, not
 *  footage. No video was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the block, the volley and the shot). Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 *  The volley is the library `volley(…,{foot:'l'})` (LEFT foot, confirmed); its place yaw is SOLVED so the left boot swings toward the far
 *  goal, and the ball meets the boot because the contact point is taken from the solved skeleton (volleyBall). The block's contact point is
 *  the solved shin of the spread block (blockAt), so the shot meets his leg.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography. The replay (ch2) is the SAME choreography as ch1, re-timed (slow motion) — the
 *  replay cannot disagree with the live take.
 * Inks: yellow (Feixas's kit, wood court, lights, the "open goal" and angle diagrams, ball trail), red (Barça garnet, rings, posts), blue
 *  (Barça blue, the crowd), navy (key line, shorts, stands, Palma's flying keeper).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–350 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,volley,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions / hyphenated words). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Barça v Palma, 2024',text:'Barcelona against Palma, March 2024. No goals, last minute. Palma swap their goalkeeper for an attacker, so their goal is empty. A shot! Feixas blocks it, then volleys it the whole way. Goal!',tail:2.4,
  cues:['Barcelona against','No goals','last minute','Palma swap','so their goal','A shot','Feixas blocks','then volleys','Goal'],heads:{'Barcelona against':'Barça v Palma 2024','No goals':'0–0','so their goal':'Empty goal','Goal':'1–0'}},
 {label:'Replay: block, bounce, volley',text:'Again, slowly. He blocks the shot. The ball bounces, and his left foot sends it off the crossbar and in!',tail:1.8,
  cues:['Again','He blocks','The ball bounces','his left foot','off the crossbar','and in'],heads:{'Again':'Replay','his left foot':'Left-foot volley','and in':'1–0'}},
 {label:'How he blocks (demo)',text:'This is how he blocks. A player breaks through, so he rushes out and makes himself big. The angle shrinks. Blocked!',tail:1.8,
  cues:['This is how','A player breaks','he rushes out','makes himself big','The angle shrinks','Blocked'],heads:{'This is how':'How he blocks (demo)','The angle shrinks':'Close the angle','Blocked':'Blocked'}},
 {label:'Practise it',text:'Try it! Come off your line and close the angle fast when a player breaks through.',tail:2.6,
  cues:['Try it','Come off','close the angle','fast when','breaks through'],heads:{'Try it':'Your turn','close the angle':'Close the angle','breaks through':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/feixas-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/feixas-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/feixas-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('feixas: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('feixas: no cue '+w);return c.at;};
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
type Ball3={X:number;Y:number;Z:number;flying:boolean;spin:number};
const bez=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};
/** a ballistic hop from a to b: straight in plan, a parabola of extra height h in the air */
const hop=(a:V3,b:V3,h:number,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a floor quad (X,Z corners) clipped to just in front of the camera */
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a hand-drawn ring round a screen point (knocked out first); g grows it in */
function ring2(s:Sheet,ink:string,c:Pt,rx:number,ry:number,w:number,seed:number,g=1,cov=1){if(g<=.02)return;const p=ribbon(blob(c[0],c[1],rx*g,ry*g,seed,{n:22,amp:.06}),w,{seed:seed+1,close:true,wobble:1.1});s.knockout(p);s.fill(ink,p,cov);}
/** a big red tick with a navy misregistered echo */
function tick(s:Sheet,c:Pt,S:number,seed:number){if(S<1)return;const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 const tp=ribbon(tk,S*.24,{seed,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:seed+2,taper:.2,wobble:1}),.5);s.fill(R,tp);s.fill(Y,tp,.25);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.8],[R,.28]];
const FBUILD={height:1.85,bulk:1.07};
/** Miquel Feixas, Barça goalkeeper: 1.85 m, 87 kg (es.wikipedia); yellow long-sleeved keeper kit, navy long legs, paper gloves, no number
 * (kit inferred); short dark hair (card appearance) */
const FEIXAS:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:FBUILD,seed:26};
/** the demonstration (ch3): Feixas in a paler training top — no match, no club claimed */
const FEIXAS_TR:AthleteStyle={...FEIXAS,shirt:[Y,.62],trim:R,seed:27};
/** Barça: blue-and-garnet stripes (blue/red), navy shorts and socks (inferred) */
const BAR=(n:number):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:Y,hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,3)*.12},seed:30+n});
/** Mallorca Palma Futsal: white (paper) shirts, navy shorts (away strip inferred) */
const PAL=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,hairStyle:(['curly','short','short','bald'] as const)[n%4],build:{height:1.72+hash(n,5)*.12},seed:50+n});
/** Palma's flying goalkeeper: an outfield player in a navy keeper shirt (inferred colour) */
const FLY:AthleteStyle={shirt:K,shorts:K,socks:K,boots:'paper',skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:Y,sleeves:'long',hairStyle:'short',build:{height:1.8},seed:61};
/** the demonstration attacker (ch3): a neutral navy-screen training bib — no team is claimed */
const BIB:AthleteStyle={shirt:[K,.45],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'short',build:{height:1.78},seed:67};
/** the practice keeper (ch4, "you"): a young player in a yellow keeper top */
const KID:AthleteStyle={shirt:Y,shorts:K,socks:[R,.8],boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:R,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.55,bulk:.95},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo.
 * `xf` re-stages the generator (the reverse-angle replay rotates the court 180°). */
type Xf=(g:{pose:Pose;yaw:number;X:number;Z:number})=>{pose:Pose;yaw:number;X:number;Z:number};
const ID:Xf=g=>g;
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number;xf?:Xf;dt?:number}={}){
 const xf=o.xf??ID,a=xf(gen(t)),b=xf(gen(t-(o.dt??1/12))),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=xf(gen(t-o.smear));motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a right-foot strike's contact (our floor coords, relative to the stance place) */
function strikeBall(yaw:number,build:{height:number}):V3{const sk=solve(strike(STRIKE_CONTACT),build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}

// ---------------- the block: Feixas's star block — low and wide, knees out, arms spread, palms open ----------------
const BLOCK:Pose=posed({lHipA:40,rHipA:40,lHipF:44,rHipF:44,lHipR:22,rHipR:22,lKnee:66,rKnee:66,lAnk:-4,rAnk:-4,lean:20,pitch:6,lShA:84,rShA:84,lShF:22,rShF:22,lElb:16,rElb:16,lHand:1,rHand:1,neckP:-16});
/** the block contact: the shin (knee–ankle, a third down) nearer +Z (the shooter's side), solved from the pose at a place */
function blockAt(X:number,Z:number,yaw:number):V3{const sk=solve(BLOCK,FBUILD,placeAt(X,Z,yaw)),sh=(kn:V3,an:V3)=>toMine([lerp(kn[0],an[0],.35),lerp(kn[1],an[1],.35),lerp(kn[2],an[2],.35)]);
 const a=sh(sk.lKn,sk.lAn),b=sh(sk.rKn,sk.rAn);return a[2]>b[2]?a:b;}
// ---------------- the volley: LEFT foot (confirmed), side-on; place yaw solved so the boot swings at the far goal ----------------
const VH=.3,V_C=.5;
const vPose=(u:number)=>volley(u,{foot:'l',height:VH});
function toeDir(yaw:number){const a=toMine(solve(vPose(V_C-.03),FBUILD,placeAt(0,0,yaw)).lToe),b=toMine(solve(vPose(V_C+.03),FBUILD,placeAt(0,0,yaw)).lToe);return Math.atan2(b[2]-a[2],b[0]-a[0]);}
function solveYaw(target:number){let best=0,err=9;for(let d=-180;d<180;d+=2){const y=d*Math.PI/180,e=Math.abs(Math.atan2(Math.sin(toeDir(y)-target),Math.cos(toeDir(y)-target)));if(e<err){err=e;best=y;}}return best;}
function volleyBall(X:number,Z:number,yaw:number):V3{const a=toMine(solve(vPose(V_C),FBUILD,placeAt(X,Z,yaw)).lToe),b=toMine(solve(vPose(V_C+.03),FBUILD,placeAt(X,Z,yaw)).lToe),d=[b[0]-a[0],b[2]-a[2]],l=Math.hypot(d[0],d[1])||1;
 return[a[0]+d[0]/l*.07,Math.max(BALL_R,a[1]+.02),a[2]+d[1]/l*.07];}

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
function ballOn(s:Sheet,st:Stage,b:Ball3,seed:number,o:{min?:number;smear?:number;dir?:number;trail?:(u:number)=>Ball3;t0?:number;t?:number;span?:number}={}){
 const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(o.min??9,kAt(st,b.Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.22:.45);
 if(b.flying&&o.trail&&o.t!==undefined&&o.t0!==undefined){const sp=o.span??.18,tr:Pt[]=[];for(let k=0;k<=8;k++){const q=o.trail(Math.max(o.t0,o.t-sp+k*sp/8));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.4,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?(o.smear??.45):0,dir:o.dir??0});return{p,r};
}

// ---------------- the arena: wood court, the Palau crowd, lights ----------------
/** stepped navy rows, lit faces; blue and garnet shirts (the Palau); cheer lifts the heads; empty = training night */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,empty=false){
 const span=12000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(empty){s.fill(Y,rectPath(-span,top-15*rowH-kw*.6,span*2,kw*.5),.35);return;}
 const heads=new Path2D(),blu=new Path2D(),gar=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-4200,x1=4200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.34)blu.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.52)gar.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(B,blu);s.fill(R,gar);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-5;i<=5;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the wood court: a yellow + red screen floor with plank seams along `along` ('x' planks run across the screen, 'z' into it) */
function woodFloor(s:Sheet,st:Stage,wall:number,along:'x'|'z',zNear:number,zFar:number){
 const span=12000,floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.42);s.fill(R,floor,.3);
 const seams=new Path2D();
 if(along==='z'){for(let i=-24;i<=24;i++){const X=i*.6,a=proj(st,X,0,Math.max(zNear,st.cz+.4)),b=proj(st,X,0,zFar);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 else{for(let Z=Math.max(zNear,st.cz+.6);Z<zFar;Z+=Z<6?.6:1.2){const a=proj(st,st.cx-60,0,Z),b=proj(st,st.cx+60,0,Z);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 s.stroke(K,seams,3,.28);
}
function boards(s:Sheet,st:Stage,wall:number,kw:number,step:number){const span=12000,board=.95*kw;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();const base=Math.floor(st.cx/step)*step;for(let i=-20;i<20;i++){const x0=(base+i*step+.3-st.cx)*kw,x1=(base+i*step+step*.8-st.cx)*kw;ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(B,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));return wall-board;}

// ---- the SIDE-ON court (broadcast, reverse angle, touchline demo): X along the court, goals at X = ±20, posts Z 8.5 / 11.5 ----
const TOUCH_FAR=20,BOARDS=21.2,POST_N=8.5,POST_F=11.5,GH=2;
type SideO={cheer?:number;flash?:number;empty?:boolean;under?:()=>void;board?:(top:number,kw:number)=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:SideO={}){
 const{cheer=0,flash=0,empty=false}=o,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 woodFloor(s,st,wall,'x',0,BOARDS);
 s.fill(K,polyPath(floorQuad(st,-24,-8,24,0),true),.3);
 s.fill(K,polyPath(floorQuad(st,-40,-8,-20,BOARDS),true),.3);s.fill(K,polyPath(floorQuad(st,20,-8,40,BOARDS),true),.3);
 // painted lines: touchlines, goal lines, halfway, both penalty areas (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D();
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[-20,0],[-20,TOUCH_FAR]],[[20,0],[20,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 for(const gx of[-20,20]){const d=-Math.sign(gx),arc:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([gx+d*6*Math.sin(a),POST_N-6*Math.cos(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([gx+d*6*Math.sin(a),POST_F+6*Math.cos(a)]);}
  lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const m of[6,10])lines.addPath(polyPath(floorRing(st,gx+d*m,10,.12,12),true));}
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,3);stands(s,top,kw,t,cheer,flash,st.cx,empty);o.board?.(top,kw);
 sideNet(s,st,-20);sideNet(s,st,20);o.under?.();
}
/** a goal's net seen from the side; the net runs outward (away from the court) */
function sideNet(s:Sheet,st:Stage,gx:number){
 const out=Math.sign(gx),Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,gx+out*lerp(Db,Dt,Yh/GH),Yh,Z);
 const hull=[proj(st,gx,0,POST_N),proj(st,gx,GH,POST_N),proj(st,gx,GH,POST_F),back(POST_F,GH),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=GH+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
/** posts + crossbar (red bands) seen from the side; `shake` wobbles the bar after the ball hits it */
function sidePosts(s:Sheet,st:Stage,gx:number,shake=0){
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,gx+dx,Yh,Z);quad([P(0,-w),P(0,w),P(GH,w),P(GH,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*GH,y1=(k+1)/8*GH;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>{const u=(Z-POST_N)/(POST_F-POST_N);return proj(st,gx,GH+dy+shake*Math.sin(u*Math.PI),Z);};
 const bar:Pt[][]=[];for(let k=0;k<12;k++){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bar.push([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)]);}
 const outline:Pt[]=[...bar.map(q=>q[0]),bar[11][1],bar[11][2],...bar.slice().reverse().map(q=>q[3])];quad(outline);
 bar.forEach((q,k)=>{if(k%2===0)bands.addPath(polyPath(q,true));});
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- END-ON court (camera looks along +Z): a goal at Z = gz with posts X = ±1.5, the net going away ----
function endGoalNet(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,gz+lerp(.95,.55,Yh/H));
 const out=[proj(st,Lx,0,gz),proj(st,Lx,H,gz),proj(st,Rx,H,gz),proj(st,Rx,0,gz),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,gz)*.018),.6);
}
function endPosts(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,gz);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,gz)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the court seen end-on: wood floor, paper lines (a goal line + D at gz), boards + stands at wallZ */
function endArena(s:Sheet,st:Stage,o:{t:number;wallZ:number;gz:number;empty?:boolean;flash?:number}){
 const{t,wallZ,gz,empty=false,flash=0}=o,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 woodFloor(s,st,wall,'z',st.cz+.4,wallZ);
 const out=new Path2D();out.addPath(polyPath(floorQuad(st,-40,-40,-10,wallZ),true));out.addPath(polyPath(floorQuad(st,10,-40,40,wallZ),true));s.fill(K,out,.3);
 const lines=new Path2D(),zEnd=Math.min(wallZ-1,40);
 lines.addPath(polyPath(floorStrip(st,[[-10,st.cz+.5],[-10,zEnd]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,st.cz+.5],[10,zEnd]],.05),true));
 const arcPts:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),gz-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),gz-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,gz],[10,gz]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts.filter(p=>p[1]>st.cz+.5),.05),true));
 for(const m of[6,10])if(gz-m>st.cz+.5)lines.addPath(polyPath(floorRing(st,0,gz-m,.12,12),true));
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,2.4);stands(s,top,kw,t,0,flash,st.cx,empty);
}

// ================= THE PLAY (match coordinates): Barça defend the goal at X = −20, Palma's empty goal is at X = +20 =================
const C1={bar:A(0,'Barcelona'),none:A(0,'No goals'),last:A(0,'last minute'),swap:A(0,'Palma swap'),empty:A(0,'so their'),shot:A(0,'A shot'),blocks:A(0,'Feixas blocks'),volleys:A(0,'then volleys'),goal:A(0,'Goal'),end:AUTH[0].seconds};
/** event times (authored ch1 clock, real time) */
const BLK=C1.blocks+.05,HIT=BLK-.3,VOL=C1.volleys+.2,BNC=VOL-.2,BAR_T=C1.goal-.12,IN_T=BAR_T+.3,GOAL_T=BAR_T+.15;
const PASS2=HIT-.62,PASS1=PASS2-1.5,PASS0=C1.swap-.4;
/** Feixas: starts on his line, steps out to block, then the volley */
const F0:[number,number]=[-19.1,10],BLP:[number,number]=[-17.9,10.55],BLY=yawTo(1,.25);
const CONTACT=blockAt(BLP[0],BLP[1],BLY);
const VP:[number,number]=[-17.35,10.0];
const BAR_PT:V3=[19.9,GH-.05-BALL_R,11.05];
const VY=solveYaw(Math.atan2(BAR_PT[2]-10,BAR_PT[0]-VP[0]));
const VC=volleyBall(VP[0],VP[1],VY);
const BP:V3=[lerp(CONTACT[0],VC[0],.62),BALL_R,lerp(CONTACT[2],VC[2],.62)];
/** Palma: the shooter (7.5 m out, the far side), the flying keeper, three more; Barça's four */
const SHY=yawTo(CONTACT[0]-(-12.4),CONTACT[2]-12.7),SHB=strikeBall(SHY,{height:1.78}),SHP:[number,number]=[-12.4-SHB[0],12.7-SHB[2]];
const SH_BALL:V3=[-12.4,BALL_R,12.7];
const FLY0:[number,number]=[-7.6,9.2],P2:[number,number]=[-11.4,16.4],P4:[number,number]=[-10.2,3.6],P5:[number,number]=[-13.8,5.2];
const BAR0:[number,number][]=[[-15.6,7.4],[-15.2,13.8],[-11.6,11.1],[-10.4,6.2]];
/** the ball through the whole play (match coords, real time) */
function playBall(T:number):Ball3{
 const flyAt=(t:number):V3=>{const f=flyGen(t);return[f.X+.55*Math.cos(f.yaw),BALL_R,f.Z+.55*Math.sin(f.yaw)];};
 if(T<PASS0){const u=sm(0,PASS0,T,linear);return{X:lerp(P4[0]+.5,P4[0]+.7,u),Y:BALL_R,Z:lerp(P4[1]+.4,P4[1]+.6,u)+.1*Math.sin(T*5),flying:false,spin:T*4};}
 if(T<PASS0+.7){const u=sm(PASS0,PASS0+.7,T,easeOut),e=flyAt(PASS0+.7);return{X:lerp(P4[0]+.7,e[0],u),Y:BALL_R,Z:lerp(P4[1]+.6,e[2],u),flying:false,spin:T*9};}
 if(T<PASS1){const b=flyAt(T);return{X:b[0],Y:BALL_R,Z:b[2],flying:false,spin:T*5};}
 if(T<PASS1+.75){const a=flyAt(PASS1),u=sm(PASS1,PASS1+.75,T,easeOut);return{X:lerp(a[0],P2[0]+.4,u),Y:BALL_R,Z:lerp(a[2],P2[1]-.3,u),flying:false,spin:T*9};}
 if(T<PASS2){return{X:P2[0]+.4,Y:BALL_R,Z:P2[1]-.3,flying:false,spin:0};}
 if(T<HIT){const u=sm(PASS2,HIT,T,linear);return{X:lerp(P2[0]+.4,SH_BALL[0],u),Y:BALL_R,Z:lerp(P2[1]-.3,SH_BALL[2],u),flying:false,spin:T*12};}
 if(T<BLK){const u=sm(HIT,BLK,T,linear),q=bez(SH_BALL,[lerp(SH_BALL[0],CONTACT[0],.5),Math.max(CONTACT[1],.3)+.08,lerp(SH_BALL[2],CONTACT[2],.5)],CONTACT,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*9};}
 if(T<BNC){const u=sm(BLK,BNC,T,linear),q=hop(CONTACT,BP,Math.max(.2,1.05-(CONTACT[1]+BALL_R)/2),u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:9+u*5};}
 if(T<VOL){const u=sm(BNC,VOL,T,linear),q=hop(BP,VC,.12,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:14+u*3};}
 if(T<BAR_T){const u=sm(VOL,BAR_T,T,linear),q=hop(VC,BAR_PT,2.7-(VC[1]+BAR_PT[1])/2,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:17+u*30};}
 const IN:V3=[20.5,BALL_R,10.9];
 if(T<IN_T){const u=sm(BAR_T,IN_T,T,easeIn);return{X:lerp(BAR_PT[0],IN[0],u),Y:lerp(BAR_PT[1],IN[1],u),Z:lerp(BAR_PT[2],IN[2],u),flying:true,spin:47+u*6};}
 const u=sm(IN_T,IN_T+.9,T,easeOut);return{X:IN[0]+.2*u,Y:BALL_R+.18*Math.max(0,Math.sin(u*Math.PI))*(1-u),Z:IN[2]-.15*u,flying:false,spin:53+u*4};
}
/** Palma's flying goalkeeper: receives at the top of the area, carries it a few steps, passes wide */
const flyGen:Gen=T=>{const X=lerp(FLY0[0],FLY0[0]-2.4,sm(PASS0,PASS1,T,easeIO)),Z=FLY0[1]+.8*sm(PASS0,PASS1,T,easeIO);
 const run=sm(PASS0+.5,PASS0+.9,T)*(1-sm(PASS1-.3,PASS1,T));let pose=blendPose(stand(),runCycle(T*runCadence(.3),{speed:.3}),T<PASS0+.5?.3:run);
 if(T>PASS1-.35&&T<PASS1+.5)pose=blendPose(pose,strike(key(T,[[PASS1-.35,.2],[PASS1,STRIKE_CONTACT],[PASS1+.5,.9]]),{power:.35}),sm(PASS1-.35,PASS1-.2,T)*(1-sm(PASS1+.3,PASS1+.5,T)));
 if(T>GOAL_T)pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:34,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150}),sm(GOAL_T+.3,GOAL_T+.9,T));
 const yaw=T<PASS1?yawTo(-1,T<PASS0+.7?-.3:.9):yawTo(P2[0]-X,P2[1]-Z)+.3;return{pose,yaw,X,Z};};
/** the Palma shooter: comes inside, one-touch right-foot shot (foot inferred) */
const shooter:Gen=T=>{const u=key(T,[[0,0],[HIT-.55,.05],[HIT,STRIKE_CONTACT],[HIT+.6,.95]],linear);
 let pose=strike(u);if(T<HIT-.5)pose=blendPose(blendPose(stand(),runCycle(T*runCadence(.3),{speed:.3}),.5),pose,sm(HIT-.9,HIT-.5,T));
 if(T>GOAL_T)pose=blendPose(pose,posed({lHipF:58,rHipF:58,lKnee:70,rKnee:70,lean:44,neckP:40,lShF:40,rShF:40,lElb:20,rElb:20,lShA:10,rShA:10}),sm(GOAL_T+.2,GOAL_T+.8,T));
 return{pose,yaw:SHY,X:SHP[0]+key(T,[[0,1.6],[HIT-.55,.25,easeOut],[HIT,0]]),Z:SHP[1]+key(T,[[0,1.2],[HIT-.55,.15,easeOut],[HIT,0]])};};
/** the other Palma players: P2 (the far ala) receives and lays it inside; P4 starts it; P5 lurks at the near post */
const palGen=(i:number):Gen=>T=>{const home=[P2,P4,P5][i];let X=home[0],Z=home[1],pose=blendPose(stand(),runCycle(T*runCadence(.2)+i*.3,{speed:.2}),.5),yaw=yawTo(-1,0);
 if(i===0){yaw=T<PASS2?yawTo(FLY0[0]-X,FLY0[1]-Z):yawTo(SH_BALL[0]-X,SH_BALL[2]-Z);
  if(T>PASS2-.35&&T<PASS2+.5)pose=blendPose(pose,strike(key(T,[[PASS2-.35,.2],[PASS2,STRIKE_CONTACT],[PASS2+.5,.9]]),{power:.3}),sm(PASS2-.35,PASS2-.2,T)*(1-sm(PASS2+.3,PASS2+.5,T)));}
 if(i===1){X+=2.6*sm(PASS0+.3,PASS1,T,easeIO);Z+=.8*sm(PASS0+.3,PASS1,T,easeIO);yaw=T<PASS0+.2?yawTo(FLY0[0]-X,FLY0[1]-Z):yawTo(-1,.2);
  if(T<PASS0+.4)pose=blendPose(pose,strike(key(T,[[PASS0-.35,.2],[PASS0,STRIKE_CONTACT],[PASS0+.4,.8]]),{power:.3}),sm(PASS0-.35,PASS0-.2,T)*(1-sm(PASS0+.2,PASS0+.4,T)));}
 if(i===2){X-=1.2*sm(PASS2,HIT,T,easeIO);Z+=1.4*sm(PASS2,HIT,T,easeIO);}
 if(T>GOAL_T)pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:34,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150}),sm(GOAL_T+.2+i*.1,GOAL_T+.8+i*.1,T));
 return{pose,yaw,X,Z};};
/** Barça's four: a tight box round the area, shifting with the ball; at the goal they run to Feixas, arms up */
const barGen=(i:number):Gen=>T=>{const[x0,z0]=BAR0[i],b=playBall(Math.min(T,HIT)),sx=x0+.12*(b.X+10),sz=z0+.18*(b.Z-10);
 const f=feixGen(T),go=sm(GOAL_T+.2+i*.12,GOAL_T+1.8+i*.12,T,easeIO),gx=f.X+1.1+.5*i,gz=f.Z+[-1.2,1.2,-.4,.6][i];
 let pose=blendPose(stand(),runCycle(T*runCadence(.25)+i*.4,{speed:.25}),.45);
 if(T>GOAL_T&&T<GOAL_T+2.2)pose=blendPose(pose,celebrate((T-GOAL_T)*1.3+i*.2,{kind:'run'}),sm(GOAL_T,GOAL_T+.3,T));
 if(T>GOAL_T+1.6)pose=blendPose(pose,celebrate((T-GOAL_T)*1.2+i*.21,{kind:'arms'}),sm(GOAL_T+1.6,GOAL_T+2,T));
 const X=lerp(sx,gx,go),Z=lerp(sz,gz,go),yaw=T<GOAL_T?yawTo(b.X-sx,b.Z-sz):go<.95?yawTo(gx-sx,gz-sz):yawTo(f.X-X,f.Z-Z);
 return{pose,yaw,X,Z};};
/** Feixas: set on his line, shuffling with the ball → steps out and blocks → up, one step, the LEFT-foot volley → arms up, runs off */
const feixGen:Gen=T=>{
 const b=playBall(Math.min(T,HIT)),shuffle=clamp((b.Z-10)*.08,-.35,.35);
 const step=sm(HIT-.45,BLK-.08,T,easeOut),toVol=sm(BLK+.3,VOL-.4,T,easeIO);
 let X=lerp(F0[0],BLP[0],step),Z=lerp(F0[1]+shuffle,BLP[1],step),yaw=lerp(yawTo(b.X-F0[0],b.Z-F0[1])*.4,BLY,step);
 let pose=keeperSet(T*1.5);
 if(T>HIT-.45&&T<BLK)pose=blendPose(pose,runCycle(T*runCadence(.6),{speed:.6}),Math.sin(Math.PI*sm(HIT-.45,BLK-.1,T))*.6);
 pose=blendPose(pose,BLOCK,sm(BLK-.2,BLK-.02,T));
 if(T>BLK+.3){X=lerp(BLP[0],VP[0],toVol);Z=lerp(BLP[1],VP[1],toVol);yaw=lerp(BLY,VY,toVol);
  const u=key(T,[[BLK+.3,.02],[VOL-.4,.14],[VOL,V_C],[VOL+.75,1]],linear);pose=blendPose(BLOCK,vPose(u),sm(BLK+.3,VOL-.4,T,easeIO));}
 if(T>VOL+.75){const g=sm(GOAL_T,GOAL_T+.4,T);pose=blendPose(vPose(1),celebrate((T-GOAL_T)*1.2,{kind:'arms'}),g);X+=1.2*sm(GOAL_T,GOAL_T+1.6,T,easeOut);yaw=lerp(VY,FACE_RIGHT,sm(VOL+.75,GOAL_T,T));}
 return{pose,yaw,X,Z};};

// ================= chapter 1 — LIVE: broadcast camera high in the main stand (30 m back, 11 m up), real time =================
const bst=(camX:number):Stage=>({F:9000,eye:11,cx:camX,cz:-30});
/** the hanging scoreboard (no text): a clock bar almost run out (the last minute), a blue pip lights at 1–0 */
function scoreboard(s:Sheet,st:Stage,T:number,top:number,kw:number){
 const cx=(9-st.cx)*kw,w=7.5*kw,h=2.3*kw,y=top-2.6*.55*kw,pn=polyPath([[cx-w/2,y-h/2],[cx+w/2,y-h/2],[cx+w/2,y+h/2],[cx-w/2,y+h/2]],true);
 s.knockout(pn);s.fill(K,pn,.92);
 const lp=pulse(T,C1.last,1.4),bw=w*.8*(.05-.035*sm(0,C1.end,T,linear));s.fill(lp>.05&&Math.floor(T*6)%2===0?R:Y,rectPath(cx-w*.4,y+h*.24,bw*(1+3*lp),h*.12));
 const pp=pulse(T,C1.none,1.2),gp=pulse(T,GOAL_T,1.4),hole=(x:number,lit:boolean,ink:string)=>{const r=h*.16*(1+.35*(lit?gp:pp));if(lit){s.knockout(circlePath(x,y-h*.08,r*1.25));s.fill(ink,circlePath(x,y-h*.08,r));}else s.fill(Y,ribbon(blob(x,y-h*.08,r,r,7,{n:14,amp:.02}),Math.max(3,r*.22),{close:true,seed:8}),.7);};
 hole(cx-w*.26,T>=GOAL_T,B);hole(cx+w*.26,false,Y);
 const sep=new Path2D();sep.rect(cx-w*.015,y-h*.3,w*.03,h*.44);s.fill(Y,sep,.5);
 if(T>=GOAL_T&&T<GOAL_T+.9)sparkBurst(s,Y,cx,y-h*.6,w*.55,{n:12,seed:111,g:easeOut(sm(GOAL_T,GOAL_T+.3,T))*(1-sm(GOAL_T+.5,GOAL_T+.9,T))});
}
/** the broadcast camera (world X it looks at, zoom, box y): wide on the attack → swings right to the empty goal → back → tight on the block
 * → races the volley down the court → holds on the net */
const liveCam=(T:number)=>{const b=playBall(Math.max(T,VOL));
 const xs=mono([[0,-8],[C1.none,-6],[C1.swap,-9.5],[C1.empty,9],[C1.empty+.6,18.9],[C1.empty+1.1,18.9],[C1.shot-.25,-13.6],[BLK,-15],[VOL,-14.4]]);
 let x=key(T,xs,easeInOutSine);if(T>VOL)x=lerp(-14.4,Math.min(18.2,b.X-.5),sm(VOL,VOL+.3,T));if(T>BAR_T)x=lerp(18.2,17.4,sm(BAR_T+.4,C1.end,T,easeIO));
 const zoom=T<VOL?key(T,mono([[0,.36],[C1.none,.38],[C1.swap,.44],[C1.empty,.4],[C1.empty+.6,.46],[C1.empty+1.1,.46],[C1.shot-.25,.56],[BLK,.64],[VOL,.62]]),easeInOutSine)
  :T<BAR_T?lerp(.62,.46,Math.sin(Math.PI*sm(VOL,BAR_T,T))):lerp(.62,.52,sm(BAR_T+.4,C1.end,T,easeIO))+.08*pulse(T,GOAL_T,1);
 const y=key(T,mono([[0,2350],[C1.shot-.7,2420],[BLK,2440],[BAR_T,2400],[C1.end,2300]]),easeInOutSine);
 return{x,zoom,y};};
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);cam(s,0,c.y,c.zoom);
 const b=playBall(T),joy=sm(GOAL_T,GOAL_T+.4,T),shake=GH*.02*pulse(T,BAR_T,.5)*Math.sin(T*70);
 const wide=c.zoom<.5?'low':'mid';
 courtSide(s,st,T,{cheer:.08+.8*joy,flash:pulse(T,GOAL_T,1.2),board:(top,kw)=>scoreboard(s,st,T,top,kw)});
 type It={z:number;draw:()=>void};const items:It[]=[];
 const add=(g:Gen,style:AthleteStyle,d:'low'|'mid'|'auto',smear?:(t:number)=>number)=>items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,style,{detail:d,smear:smear?smear(T):0})});
 add(feixGen,FEIXAS,wide==='low'?'low':'auto',t=>(t>BLK-.2&&t<BLK+.05)||(t>VOL-.25&&t<VOL+.2)?.12:0);
 add(shooter,PAL(0),wide,t=>t>HIT-.25&&t<HIT+.15?.12:0);add(flyGen,FLY,'low');
 [0,1,2].forEach(i=>add(palGen(i),PAL(i+1),'low'));BAR0.forEach((_,i)=>add(barGen(i),BAR(i),'low'));
 items.push({z:b.Z-.05,draw:()=>{const tr=b.flying&&T>VOL;ballOn(s,st,b,16,{min:8,trail:tr?playBall:undefined,t0:VOL,t:T,span:.3,dir:0});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 sidePosts(s,st,-20);sidePosts(s,st,20,shake);
 const kk=kAt(st,10);
 // "Palma swap their goalkeeper": a navy-shirt flyer picked out with a red ring
 {const f=flyGen(T),g=proj(st,f.X,0,f.Z),h=1.8*kAt(st,f.Z);ring2(s,R,[g[0],g[1]-h*.5],h*.45,h*.66,8,121,easeOutBack(sm(C1.swap,C1.swap+.4,T))*(1-sm(C1.empty-.2,C1.empty+.2,T)),1);}
 // "so their goal is empty": a big yellow-and-red ring round Palma's empty goal mouth
 {const g=proj(st,20.3,1,10);ring2(s,R,g,2.2*kk,1.6*kk,10,131,easeOutBack(sm(C1.empty+.5,C1.empty+.9,T))*(1-sm(C1.shot-1.2,C1.shot-.8,T)),1);}
 // the block and the volley: yellow sparks
 if(T>=BLK&&T<BLK+.6){const p=proj(st,CONTACT[0],CONTACT[1],CONTACT[2]);sparkBurst(s,Y,p[0],p[1],.9*kk,{n:10,seed:141,g:easeOut(sm(BLK,BLK+.2,T))*(1-sm(BLK+.3,BLK+.6,T))});}
 if(T>=VOL&&T<VOL+.5){const p=proj(st,VC[0],VC[1],VC[2]);sparkBurst(s,Y,p[0],p[1],1*kk,{n:11,seed:151,g:easeOut(sm(VOL,VOL+.2,T))*(1-sm(VOL+.25,VOL+.5,T))});}
 if(T>=BAR_T&&T<BAR_T+.7){const p=proj(st,BAR_PT[0],GH,BAR_PT[2]);sparkBurst(s,Y,p[0],p[1],1.2*kk,{n:12,seed:161,g:easeOut(sm(BAR_T,BAR_T+.2,T))*(1-sm(BAR_T+.35,BAR_T+.7,T))});}
 if(T>=IN_T)ring2(s,R,proj(st,20.55,.35,10.8),.9*kk,.7*kk,9,171,easeOutBack(sm(IN_T,IN_T+.4,T))*(1-sm(C1.end-.9,C1.end-.5,T)),1);
}
/** the ball in the net (the passage enters the ball → the replay) */
function ballPts(st:Stage,b:Ball3,rs=1.3):Pt[]{const p=proj(st,b.X,b.Y,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R)*rs,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(ballPts(bst(liveCam(tc).x),playBall(tt),2.2));},still:VOL+.12};

// ================= chapter 2 — REPLAY: slow motion, REVERSE ANGLE (low on the far touchline), a tracking camera that runs with the ball =================
const C2={again:A(1,'Again'),blocks:A(1,'He blocks'),bounce:A(1,'The ball'),foot:A(1,'his left'),bar:A(1,'off the'),in:A(1,'and in'),end:AUTH[1].seconds};
/** replay clock → play clock (slow motion keyed to the words; the flight itself runs at about half speed) */
const RP=(t:number)=>key(t,mono([[0,HIT-.7],[C2.again+.6,HIT-.35],[C2.blocks+.1,BLK],[C2.bounce+.35,BNC],[C2.foot+.2,VOL],[C2.bar+.1,BAR_T],[C2.in+.2,IN_T+.1],[C2.end,IN_T+.9]]),linear);
/** the court turned 180° about the centre spot: X' = −X, Z' = 20 − Z, yaw + π (a rotation, so left feet stay left) */
const REV:Xf=g=>({...g,X:-g.X,Z:TOUCH_FAR-g.Z,yaw:g.yaw+Math.PI});
const revB=(b:Ball3):Ball3=>({...b,X:-b.X,Z:TOUCH_FAR-b.Z});
const rst=(cx:number):Stage=>({F:2600,eye:1.9,cx,cz:-6});
/** where the replay camera looks (X' on the reversed court) and how close */
const repCam=(t:number)=>{const P=RP(t),b=revB(playBall(P));
 const pre=key(t,mono([[0,14.6],[C2.blocks,16.4],[C2.foot,16.9]]),easeInOutSine);
 const x=P<VOL?pre:lerp(16.9,Math.max(-18.6,b.X+1.2),sm(VOL,VOL+.25,P));
 const zoom=P<VOL?key(t,mono([[0,1.02],[C2.blocks,1.2],[C2.foot,1.3]]),easeInOutSine):P<BAR_T?lerp(1.3,.95,sm(VOL,VOL+.4,P))+(.2*sm(BAR_T-.4,BAR_T,P)):lerp(1.15,1.28,sm(BAR_T,IN_T+.8,P));
 return{x,zoom};};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc}=clock(1,t0),P=RP(tt),c=repCam(tc),st=rst(c.x),b=revB(playBall(P)),hit=pulse(P,BAR_T,.4);
  cam(s,0,270,c.zoom);
  courtSide(s,st,P,{cheer:.1+.7*sm(GOAL_T,GOAL_T+.4,P),flash:pulse(P,GOAL_T,1.2)});
  type It={z:number;draw:()=>void};const items:It[]=[];
  const near=(g:Gen)=>Math.abs(REV(g(P)).X-c.x)<9;
  const add=(g:Gen,style:AthleteStyle,sm2?:(t:number)=>number)=>{const a=REV(g(P));items.push({z:a.Z,draw:()=>athlete(s,st,g,P,style,{xf:REV,detail:g===feixGen?'high':near(g)?'mid':'low',dt:1/30,smear:sm2?sm2(P):0})});};
  add(feixGen,FEIXAS,p=>(p>BLK-.15&&p<BLK+.05)||(p>VOL-.2&&p<VOL+.15)?.1:0);add(shooter,PAL(0),p=>p>HIT-.2&&p<HIT+.1?.1:0);add(flyGen,FLY);
  [0,1,2].forEach(i=>add(palGen(i),PAL(i+1)));BAR0.forEach((_,i)=>add(barGen(i),BAR(i)));
  items.push({z:b.Z-.05,draw:()=>{ballOn(s,st,b,97,{min:10,trail:b.flying&&P>VOL?(u:number)=>revB(playBall(u)):undefined,t0:VOL,t:P,span:.12,dir:Math.PI});}});
  items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
  sidePosts(s,st,20);sidePosts(s,st,-20,GH*.03*hit*Math.sin(P*90));
  // the replay marks: "He blocks": red ring on the shin; "his left foot": red ring on the left boot; the long flight: speed lines
  const f=REV(feixGen(P)),skF=solve(f.pose,FBUILD,placeAt(f.X,f.Z,f.yaw)),kF=kAt(st,f.Z);
  {const cc=REV({pose:f.pose,yaw:0,X:CONTACT[0],Z:CONTACT[2]}),p=proj(st,cc.X,CONTACT[1],cc.Z);ring2(s,R,p,.36*kF,.3*kF,9,211,easeOutBack(sm(C2.blocks,C2.blocks+.4,tt))*(1-sm(C2.bounce+.2,C2.bounce+.6,tt)),1);}
  {const bp=revB({X:BP[0],Y:0,Z:BP[2],flying:false,spin:0}),p=proj(st,bp.X,.02,bp.Z);ring2(s,Y,p,.3*kF,.1*kF,8,213,easeOutBack(sm(C2.bounce+.3,C2.bounce+.6,tt))*(1-sm(C2.foot+.2,C2.foot+.5,tt)),1);}
  {const toe=toMine(skF.lToe),p=proj(st,toe[0],toe[1],toe[2]);ring2(s,R,p,.3*kF,.24*kF,9,215,easeOutBack(sm(C2.foot,C2.foot+.35,tt))*(1-sm(C2.foot+.9,C2.foot+1.2,tt)),1);}
  if(P>VOL+.05&&P<BAR_T){const p=proj(st,b.X,b.Y,b.Z);speedLines(s,Y,p[0]+140,p[1],0,{n:6,seed:217,len:260,spread:180,width:9});}
  if(P>=BAR_T&&P<BAR_T+.6){const q=revB({X:BAR_PT[0],Y:GH,Z:BAR_PT[2],flying:false,spin:0}),p=proj(st,q.X,GH,q.Z);sparkBurst(s,Y,p[0],p[1],190,{n:12,seed:219,g:easeOut(sm(BAR_T,BAR_T+.2,P))*(1-sm(BAR_T+.3,BAR_T+.6,P))});}
  if(tt>=C2.in){const q=revB({X:20.6,Y:.4,Z:10.8,flying:false,spin:0}),p=proj(st,q.X,.4,q.Z),kk=kAt(st,q.Z);ring2(s,R,p,.9*kk,.7*kk,10,221,easeOutBack(sm(C2.in,C2.in+.4,tt)),1);}
 },
 aperture(t0){const{tt,tc}=clock(1,t0),P=RP(tt),c=repCam(tc);return aperture(ballPts(rst(c.x),revB(playBall(P)),2.4));},
 still:C2.foot+.2,
};

// ================= chapter 3 — HOW HE BLOCKS (demonstration, training kit, empty arena): ELEVATED TOUCHLINE camera, side-on to the area =================
const C3={how:A(2,'This is'),breaks:A(2,'A player'),rush:A(2,'he rushes'),big:A(2,'makes himself'),angle:A(2,'The angle'),blocked:A(2,'Blocked'),end:AUTH[2].seconds};
const st3:Stage={F:2400,eye:4.6,cx:-15.6,cz:-6.5};
/** the attacker breaks through from the right, dribbling at goal; shoots on "Blocked" (right foot) */
const D_SHOT:V3=[-13.2,BALL_R,10.7];
const D_KP:[number,number]=[-17.05,10.25],D_KY=yawTo(D_SHOT[0]-D_KP[0],D_SHOT[2]-D_KP[1]);
const D_CON=blockAt(D_KP[0],D_KP[1],D_KY);
const D_HIT=C3.blocked-.25,D_BLK=D_HIT+.22;
const D_SY=yawTo(D_CON[0]-D_SHOT[0],D_CON[2]-D_SHOT[2]),D_SB=strikeBall(D_SY,{height:1.78}),D_SP:[number,number]=[D_SHOT[0]-D_SB[0],D_SHOT[2]-D_SB[2]];
const dAtt:Gen=t=>{const X=D_SP[0]+7.2*(1-sm(0,D_HIT-.5,t,easeOut)),Z=D_SP[1]+1.4*(1-sm(0,D_HIT-.5,t,easeOut));
 let pose=runCycle(t*runCadence(.85),{speed:.85});const u=key(t,[[0,0],[D_HIT-.5,.08],[D_HIT,STRIKE_CONTACT],[D_HIT+.6,.95],[C3.end,1]],linear);pose=blendPose(pose,strike(u),sm(D_HIT-.55,D_HIT-.35,t));
 return{pose,yaw:t<D_HIT-.5?yawTo(-1,-.18):D_SY,X,Z};};
const dKeep:Gen=t=>{const out=sm(C3.rush,C3.rush+.8,t,easeOut),X=lerp(-19.3,D_KP[0],out),Z=lerp(10,D_KP[1],out);
 let pose=keeperSet(t*1.5);if(t>C3.rush&&t<C3.rush+.9)pose=blendPose(pose,runCycle(t*runCadence(.8),{speed:.8}),Math.sin(Math.PI*sm(C3.rush,C3.rush+.9,t))*.85);
 pose=blendPose(pose,BLOCK,sm(C3.big-.1,C3.big+.25,t));if(t>D_BLK+.9)pose=blendPose(BLOCK,celebrate((t-D_BLK)*1.1,{kind:'arms'}),sm(D_BLK+.9,D_BLK+1.3,t));
 return{pose,yaw:lerp(FACE_RIGHT,D_KY,out),X,Z};};
function dBall(t:number):Ball3{
 if(t<D_HIT){const a=dAtt(t);return{X:a.X+D_SB[0]+.4*(1-sm(D_HIT-.5,D_HIT,t))-.15*Math.abs(Math.sin(t*7)),Y:BALL_R,Z:a.Z+D_SB[2],flying:false,spin:t*10};}
 if(t<D_BLK){const u=sm(D_HIT,D_BLK,t,linear),q=bez(D_SHOT,[lerp(D_SHOT[0],D_CON[0],.5),D_CON[1]*.8+.1,lerp(D_SHOT[2],D_CON[2],.5)],D_CON,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*9};}
 const u=sm(D_BLK,D_BLK+1,t,easeOut),q=hop(D_CON,[-15.4,BALL_R,4.6],.9,u);return{X:q[0],Y:q[1],Z:q[2],flying:u<1,spin:9+u*8};
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,hit=pulse(t,D_BLK,.4);
  camPath(s,t,[[0,120,700,.86],[C3.breaks,220,700,.9],[C3.rush,60,720,1],[C3.big,-40,740,1.08],[C3.angle,-60,740,1.1],[C3.blocked,-120,760,1.18],[C3.end,-140,760,1.14]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*80)]);
  const b=dBall(tt),k=dKeep(tt);
  courtSide(s,st,tt,{empty:true,flash:pulse(tt,D_BLK,1.1)});
  // the shooting angle on the floor: ball → both posts (a yellow screen triangle, red dashed edges); it narrows as he comes out
  const ang=sm(C3.breaks+.3,C3.breaks+.9,tt,easeOut)*(1-sm(D_BLK+.2,D_BLK+.8,tt));
  if(ang>.02){const bb:Pt=[b.X,b.Z],a=proj(st,bb[0],.01,bb[1]),pn=proj(st,-20,.01,POST_N),pf=proj(st,-20,.01,POST_F);
   const tri=polyPath([a,pn,pf],true);s.fill(R,tri,.3*ang);
   // the part his body covers (his width ≈ 1.6 m spread) — a navy "shadow" from the ball through him to the goal line
   const cover=sm(C3.big,C3.big+.4,tt),half=lerp(.35,.85,cover),kx=k.X,kz=k.Z,dx=kx-bb[0],dz=kz-bb[1],L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L;
   const e1:[number,number]=[kx+nx*half,kz+nz*half],e2:[number,number]=[kx-nx*half,kz-nz*half];
   const toLine=(e:[number,number]):Pt=>{const u=(-20-bb[0])/((e[0]-bb[0])||-1e-6);return proj(st,-20,.01,bb[1]+(e[1]-bb[1])*u);};
   s.fill(K,polyPath([proj(st,e1[0],.01,e1[1]),toLine(e1),toLine(e2),proj(st,e2[0],.01,e2[1])],true),.2*ang*cover);
   dashed(s,R,[a,pn],9,301,{dash:30,cov:ang});dashed(s,R,[a,pf],9,303,{dash:30,cov:ang});}
  const items:{z:number;draw:()=>void}[]=[
   {z:k.Z,draw:()=>athlete(s,st,dKeep,tt,FEIXAS_TR,{detail:'high',smear:tt>C3.rush&&tt<C3.big+.3?.1:0})},
   {z:dAtt(tt).Z,draw:()=>athlete(s,st,dAtt,tt,BIB,{detail:'high',smear:tt>D_HIT-.25&&tt<D_HIT+.15?.12:0})},
   {z:b.Z-.05,draw:()=>{ballOn(s,st,b,311,{min:10,trail:b.flying?dBall:undefined,t0:D_HIT,t:tt});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  sidePosts(s,st,-20);
  const kk=kAt(st,k.Z);
  // "This is how he blocks": a red ring picks him out on his line
  {const g=proj(st,k.X,0,k.Z);ring2(s,R,[g[0],g[1]-kk*.9],kk*.6,kk*1.05,9,321,easeOutBack(sm(C3.how,C3.how+.4,tt))*(1-sm(C3.breaks,C3.breaks+.4,tt)),1);}
  // "he rushes out": a red dashed arrow on the floor from his line to where he stops
  {const r=sm(C3.rush,C3.rush+.6,tt,easeOut)*(1-sm(C3.angle,C3.angle+.5,tt));if(r>.02){const a=proj(st,-19.4,.02,9.4),c2=proj(st,D_KP[0]+.3,.02,D_KP[1]-.7);dashed(s,R,[a,[lerp(a[0],c2[0],.5),lerp(a[1],c2[1],.5)+10],c2],10,331,{dash:30,progress:r});}}
  // "makes himself big": yellow rings on both gloves and both boots
  {const g=easeOutBack(sm(C3.big,C3.big+.4,tt))*(1-sm(C3.angle+.3,C3.angle+.7,tt));if(g>.02){const sk=solve(k.pose,FBUILD,placeAt(k.X,k.Z,k.yaw));
    [sk.lHa,sk.rHa,sk.lToe,sk.rToe].forEach((j,i)=>{const m=toMine(j),p=proj(st,m[0],m[1],m[2]);ring2(s,Y,p,.2*kk,.2*kk,7,341+i*3,g,1);});}}
  if(tt>=D_BLK&&tt<D_BLK+.7){const p=proj(st,D_CON[0],D_CON[1],D_CON[2]);sparkBurst(s,Y,p[0],p[1],150,{n:11,seed:351,g:easeOut(sm(D_BLK,D_BLK+.2,tt))*(1-sm(D_BLK+.35,D_BLK+.7,tt))});}
  // "Blocked!": a red tick stamps above him
  {const tk=easeOutBack(sm(D_BLK+.25,D_BLK+.6,tt));if(tk>.02){const g=proj(st,k.X,0,k.Z);tick(s,[g[0]+kk*.9,g[1]-kk*2.1],kk*.5*tk,361);}}
 },
 aperture(t0){const{tt}=clock(2,t0),k=dKeep(tt),sk=solve(k.pose,FBUILD,placeAt(k.X,k.Z,k.yaw)),ch=toMine(sk.chest),p=proj(st3,ch[0],ch[1],ch[2]),r=.22*kAt(st3,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:C3.angle+.2,
};

// ================= chapter 4 — PRACTISE: the ATTACKER'S-EYE view; the open goal painted yellow shrinks as the young keeper rushes out =================
const C4={try:A(3,'Try'),come:A(3,'Come off'),close:A(3,'close the'),fast:A(3,'fast when'),through:A(3,'breaks through'),end:AUTH[3].seconds};
const GZ4=11.5;
/** the camera runs in with the attacker (cz, eye at 1.5 m), slowing as it nears */
const pov=(t:number):Stage=>({F:1300,eye:1.5+.03*Math.sin(t*9)*(1-sm(C4.through,C4.through+.3,t)),cx:.15*Math.sin(t*1.3),cz:-1.2+4.4*sm(0,C4.through,t,easeOut)});
const K_OUT:[number,number]=[.15,GZ4-4.6];
const kid:Gen=t=>{const o=sm(C4.come,C4.close+.5,t,easeOut),X=lerp(0,K_OUT[0],o),Z=lerp(GZ4-.5,K_OUT[1],o);
 let pose=keeperSet(t*1.5);if(t>C4.come&&t<C4.close+.6)pose=blendPose(pose,runCycle(t*runCadence(.8),{speed:.8}),Math.sin(Math.PI*sm(C4.come,C4.close+.6,t))*.85);
 pose=blendPose(pose,BLOCK,sm(C4.fast-.1,C4.fast+.3,t));
 const K_HIT=C4.through+.35;if(t>K_HIT+.8)pose=blendPose(BLOCK,celebrate((t-K_HIT)*1.1,{kind:'arms'}),sm(K_HIT+.8,K_HIT+1.2,t));
 return{pose,yaw:FACE_CAMERA,X,Z};};
const KBUILD={height:1.55,bulk:.95};
const S4_HIT=C4.through+.1,S4_BLK=S4_HIT+.25;
function kidCon():V3{const sk=solve(BLOCK,KBUILD,placeAt(K_OUT[0],K_OUT[1],FACE_CAMERA)),a=toMine(sk.lKn),b=toMine(sk.lAn);return[lerp(a[0],b[0],.35),lerp(a[1],b[1],.35),lerp(a[2],b[2],.35)-.12];}
const K_CON=kidCon();
function ball4(t:number,st:Stage):Ball3|null{
 if(t<S4_HIT)return null;const from:V3=[.45,BALL_R,st.cz+1.3];
 if(t<S4_BLK){const u=sm(S4_HIT,S4_BLK,t,linear),q=bez(from,[lerp(from[0],K_CON[0],.5),K_CON[1]*.8+.15,lerp(from[2],K_CON[2],.5)],K_CON,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*9};}
 const u=sm(S4_BLK,S4_BLK+.9,t,easeOut),q=hop(K_CON,[3.4,BALL_R,K_CON[2]-1.4],.8,u);return{X:q[0],Y:q[1],Z:q[2],flying:u<1,spin:9+u*8};
}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=pov(t),hit=pulse(t,S4_BLK,.4);
  camPath(s,t,[[0,0,300,1.05],[C4.come,0,300,1.08],[C4.close,0,290,1.08],[C4.through,0,300,1.06],[C4.end,0,290,1.02]],[5*hit*Math.sin(t*90),4*hit*Math.cos(t*80)]);
  endArena(s,st,{t:tt,wallZ:GZ4+3,gz:GZ4,empty:true,flash:pulse(tt,S4_BLK,1.2)});
  endGoalNet(s,st,GZ4);
  // the open goal, painted yellow: whatever the keeper does not cover is where you can score
  const open=sm(C4.try,C4.try+.4,tt)*(1-sm(S4_BLK+.4,S4_BLK+1,tt));
  if(open>.02){const q=[proj(st,-1.45,.03,GZ4),proj(st,-1.45,1.97,GZ4),proj(st,1.45,1.97,GZ4),proj(st,1.45,.03,GZ4)];const pp=polyPath(q,true);s.knockout(pp,.5*open);s.fill(Y,pp,.85*open);}
  athlete(s,st,kid,tt,KID,{detail:'high',smear:tt>C4.come&&tt<C4.fast+.3?.1:0});
  endPosts(s,st,GZ4);
  const b=ball4(tt,st);if(b)ballOn(s,st,b,405,{min:12,trail:b.flying?(u:number)=>ball4(Math.max(S4_HIT,u),st)??b:undefined,t0:S4_HIT,t:tt});
  if(tt>=S4_BLK&&tt<S4_BLK+.7){const p=proj(st,K_CON[0],K_CON[1],K_CON[2]);sparkBurst(s,Y,p[0],p[1],140,{n:10,seed:401,g:easeOut(sm(S4_BLK,S4_BLK+.2,tt))*(1-sm(S4_BLK+.35,S4_BLK+.7,tt))});}
  const k=kid(tt),kk=kAt(st,k.Z),g=proj(st,k.X,0,k.Z);
  // "Come off your line": red dashed arrow on the floor toward us
  {const r=sm(C4.come,C4.come+.5,tt,easeOut)*(1-sm(C4.fast,C4.fast+.5,tt));if(r>.02){const a=proj(st,-.6,.02,GZ4-.3),c2=proj(st,-.6,.02,K_OUT[1]+.4);dashed(s,R,[a,[lerp(a[0],c2[0],.5)-8,lerp(a[1],c2[1],.5)],c2],12,411,{dash:34,progress:r});}}
  // "close the angle": two red dashed lines from the ball spot to the posts
  {const r=sm(C4.close,C4.close+.5,tt,easeOut)*(1-sm(S4_HIT,S4_HIT+.3,tt));if(r>.02){const a=proj(st,.45,.02,st.cz+1.6);dashed(s,R,[a,proj(st,-1.5,.02,GZ4)],9,421,{dash:30,progress:r,cov:.9});dashed(s,R,[a,proj(st,1.5,.02,GZ4)],9,423,{dash:30,progress:r,cov:.9});}}
  // the tick
  {const tk=easeOutBack(sm(S4_BLK+.3,S4_BLK+.65,tt));if(tk>.02)tick(s,[g[0]+kk*1.1,g[1]-kk*1.7],kk*.55*tk,431);}
 },
 still:C4.fast+.45,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'feixas-futsal-signature',format:'futsal',title:'Feixas’s one-on-one block',theme:'Come off your line and close the angle fast when a player breaks through.',
 ageNote:'For players aged 7–12: the block and the long volley against Palma in March 2024 are real (retold from written reports); the positions are our best reconstruction, and the blocking lesson is a demonstration. Practise with a friend and a soft ball.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in and thuds against a spread paper glove-and-shin block, a red ring snaps; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.22),bx=x-170*(1-u),by=y+30*(1-u),pop=sm(.1,.22,age,easeOutBack)*(1-sm(.5,.75,age));
  if(pop>.02){const g=blob(x+r*1.05,y,r*.35*pop,r*1.1*pop,seed+3,{n:18});s.knockout(polyPath(g,true));s.fill(Y,polyPath(g,true),.9);s.fill(K,ribbon(g,6,{seed:seed+4,close:true,wobble:.8}));}
  if(age>.22){const v=clamp((age-.22)/.5);ring2(s,R,[x+r*.5,y],r*(1.2+1.6*v),r*(1+1.3*v),8*(1-v)+2,seed,1,1);}
  const off=age>.22?sm(.22,.7,age,easeOut):0;ball(s,bx-off*90,by-off*70+off*off*120,r,seed,{rot:age*6});
 },
};
export default film;
